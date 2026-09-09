#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate the app icons, using nothing but the Python standard library.

    python3 build/make_icons.py            write the PNGs into icons/
    python3 build/make_icons.py --check    regenerate in memory, compare, write nothing

There is no Pillow here, no ImageMagick, no SVG rasteriser. Rather than add a
dependency to a project whose whole premise is "no build system, no
dependencies", this writes PNG bytes directly: zlib for the pixel stream, a
hand-rolled chunk writer, CRC32 from zlib. It runs anywhere Python runs,
including the Windows desktop, with nothing to install.

Output is deterministic -- the same bytes on every run, on any machine -- so the
icons can be regenerated and diffed like any other build artefact rather than
being opaque binaries nobody dares touch.

THE DESIGN

Five discs in a pentagon, ringed in gold, on parchment. The five rings are the
spine of L5R's system and the sheet's own signature layout is the circular Ring
arrangement from Part D Feature 2, so the icon says what the app is rather than
being decoration. Each disc wears its element's colour, taken from the sheet's
own CSS custom properties -- not sampled by eye, copied from the tokens.

Bold shapes on purpose: at 48px, the smallest size Android will show, fine
detail turns to mush. Five fat dots survive.
"""

import math
import os
import struct
import sys
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
PHASE_DIR = os.path.dirname(HERE)
ICON_DIR = os.path.join(PHASE_DIR, "icons")

# Straight from the sheet's :root block in src/css/10-sheet-base.css.
PAPER = (0xEF, 0xE7, 0xD4)   # --paper
PAPER_DEEP = (0xE6, 0xDC, 0xC4)   # --paper-deep
INK = (0x2A, 0x24, 0x20)   # --ink
SHU = (0xA3, 0x33, 0x2A)   # --shu        maroon
GOLD = (0xA9, 0x84, 0x3F)   # --gold
GOLD_SOFT = (0xC8, 0xA8, 0x6A)   # --gold-soft

ELEMENTS = [                                  # --air/earth/fire/water/void-colour
    (0x5F, 0x8C, 0x86),   # Air
    (0x7C, 0x6A, 0x3F),   # Earth
    (0xB3, 0x49, 0x2F),   # Fire
    (0x3F, 0x6F, 0x95),   # Water
    (0x5A, 0x54, 0x50),   # Void
]

SS = 4          # supersampling factor; 4x4 samples per output pixel


def blend(dst, src, a):
    """Alpha-composite src over dst. a is 0..1."""
    return tuple(int(round(d + (s - d) * a)) for d, s in zip(dst, src))


def render(size, safe_scale):
    """Draw one icon at `size`, content scaled by `safe_scale`.

    safe_scale exists for maskable icons. Android may crop a maskable icon to a
    circle, an rounded square, or a squircle, and only the middle 80% is
    guaranteed to survive. Shrinking the artwork keeps the pentagon inside that
    safe zone instead of trusting the platform not to clip it.
    """
    n = size * SS
    cx = cy = n / 2.0
    acc = [[PAPER for _ in range(n)] for _ in range(n)]

    r_outer = n * 0.46 * safe_scale     # gold ring, outer edge
    r_inner = n * 0.40 * safe_scale     # gold ring, inner edge
    r_orbit = n * 0.255 * safe_scale    # centres of the five element discs
    r_disc = n * 0.105 * safe_scale     # each element disc
    r_hub = n * 0.055 * safe_scale      # small ink hub at the centre

    # Pre-compute disc centres: pentagon, first point at 12 o'clock.
    discs = []
    for i, colour in enumerate(ELEMENTS):
        theta = -math.pi / 2 + i * (2 * math.pi / 5)
        discs.append((cx + r_orbit * math.cos(theta),
                      cy + r_orbit * math.sin(theta),
                      colour))

    for y in range(n):
        row = acc[y]
        dy = y + 0.5 - cy
        for x in range(n):
            dx = x + 0.5 - cx
            d = math.hypot(dx, dy)

            # A whisper of depth on the parchment towards the edges, so the
            # icon does not read as a flat rectangle on a light home screen.
            if d > r_outer:
                t = min(1.0, (d - r_outer) / (n * 0.5))
                row[x] = blend(PAPER, PAPER_DEEP, t * 0.55)
                continue

            if r_inner <= d <= r_outer:
                # Maroon band with a gold line on its inner edge. An all-gold
                # ring around five coloured discs reads as a film reel, and it
                # left the sheet's signature accent -- shu maroon -- out of its
                # own icon entirely. Maroon-and-gold is the pairing the sheet
                # uses everywhere, so the icon should wear it too.
                if d <= r_inner + (r_outer - r_inner) * 0.30:
                    row[x] = GOLD
                else:
                    lit = 0.5 + 0.5 * (-(dx + dy) / (r_outer * 1.6))
                    lit = max(0.0, min(1.0, lit))
                    row[x] = blend(SHU, (0xC1, 0x5A, 0x4F), lit * 0.55)  # --shu-soft
                continue

            row[x] = blend(PAPER, PAPER_DEEP, 0.35)   # inside the ring

    # Element discs and hub, drawn over the field above.
    for y in range(n):
        row = acc[y]
        for x in range(n):
            px, py = x + 0.5, y + 0.5
            for dxc, dyc, colour in discs:
                if math.hypot(px - dxc, py - dyc) <= r_disc:
                    row[x] = colour
                    break
            else:
                if math.hypot(px - cx, py - cy) <= r_hub:
                    row[x] = GOLD

    # Box-downsample SS x SS blocks. This is where the anti-aliasing comes from:
    # every output pixel is the mean of 16 samples, so edges land on intermediate
    # colours instead of stair-stepping.
    out = bytearray()
    for oy in range(size):
        out.append(0)                       # PNG filter byte: 0 = None
        for ox in range(size):
            r = g = b = 0
            for sy in range(SS):
                srow = acc[oy * SS + sy]
                for sx in range(SS):
                    pr, pg, pb = srow[ox * SS + sx]
                    r += pr; g += pg; b += pb
            k = SS * SS
            out += bytes((r // k, g // k, b // k))
    return bytes(out)


def png(size, raw):
    """Wrap raw scanlines as a PNG. Colour type 2 (truecolour), 8-bit."""
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9))
            + chunk(b"IEND", b""))


# name, pixel size, safe-zone scale
TARGETS = [
    ("icon-192.png", 192, 1.00),
    ("icon-512.png", 512, 1.00),
    ("icon-maskable-512.png", 512, 0.78),   # artwork inside the 80% safe zone
    ("apple-touch-icon.png", 180, 1.00),    # iOS applies its own rounding
]


def main():
    check_only = "--check" in sys.argv
    os.makedirs(ICON_DIR, exist_ok=True)

    changed = []
    for name, size, scale in TARGETS:
        data = png(size, render(size, scale))
        path = os.path.join(ICON_DIR, name)
        existing = None
        if os.path.isfile(path):
            with open(path, "rb") as fh:
                existing = fh.read()

        if check_only:
            state = "match" if existing == data else (
                "MISSING" if existing is None else "DIFFERS")
            print("  %-26s %5d px  %7d bytes  %s" % (name, size, len(data), state))
            if existing != data:
                changed.append(name)
            continue

        with open(path, "wb") as fh:
            fh.write(data)
        print("  %-26s %5d px  %7d bytes" % (name, size, len(data)))

    if check_only and changed:
        print("\n%d icon(s) would change: %s" % (len(changed), ", ".join(changed)))
        sys.exit(1)
    if check_only:
        print("\nall icons match their generator")


if __name__ == "__main__":
    main()
