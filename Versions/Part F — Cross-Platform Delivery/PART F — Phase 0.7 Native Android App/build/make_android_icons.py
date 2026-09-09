#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Derive every Android launcher icon and splash image from the same artwork the
web app uses.

    python3 build/make_android_icons.py            write them
    python3 build/make_android_icons.py --check    verify, write nothing

Source: Phase 0.6's icons/source/app-icon.png -- the one piece of artwork, shared
so the Android app and the website cannot drift apart. The PNG decoder, the
area-averaging resampler and the encoder are imported from Phase 0.6's
make_icons.py rather than copied: one implementation, one place to fix.

That makes this phase depend on Phase 0.6 being present, which is stated in
ROLLBACK.md. It is the same chaining the build itself uses (0.7 -> 0.6 -> 0.5
-> 0), not a new kind of coupling.

WHAT ANDROID ASKS FOR, AND WHY EACH IS SIZED AS IT IS

  ic_launcher_foreground   The adaptive icon. Its canvas is 108dp but the
  (108..432 px)            launcher only guarantees the middle 66dp -- the rest
                           is margin the system crops, shifts and parallaxes at
                           will. So the card is drawn at 54% of the canvas,
                           which puts its furthest corner just inside that
                           circle. On screen it then fills about 81% of the
                           72dp the launcher actually shows: the same
                           proportion as the web maskable icon, arrived at
                           independently from Android's own numbers.

  ic_launcher_background    A flat colour, not an image. Adaptive backgrounds
                            must survive being cropped to any shape, and a
                            solid one always does.

  ic_launcher              Legacy launcher icon, Android 7.x. Drawn as-is with
  (48..192 px)             no system mask, so it ships the card exactly as
                           designed, rounded corners and transparency intact.

  ic_launcher_round        For launchers that ask for a round icon. This one has
  (48..192 px)             to BE round, so the card sits on an ink disc. 82%
                           was the largest size whose corners still clear the
                           rim -- measured, with 3.3% to spare -- and it read as
                           clipped anyway, because the card's dark lower edge
                           blends into the ink and the eye supplies the crop.
                           76% leaves about 10%, which looks deliberate. Nothing
                           was ever being cut at either value; the smaller one
                           just says so.

  splash                   The launch window's background, in each density and
  (11 sizes)               orientation Capacitor generates. Sized to match
                           exactly, because the window background is stretched
                           to fill and a mismatched aspect ratio distorts it.

Stdlib only. Deterministic: the same bytes every run.
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PHASE_DIR = os.path.dirname(HERE)
PART_F = os.path.dirname(PHASE_DIR)

PHASE06 = os.path.join(PART_F, "PART F — Phase 0.6 Installable Web App")
sys.path.insert(0, os.path.join(PHASE06, "build"))
try:
    import make_icons as M
except ImportError:
    sys.exit("Phase 0.6's build/make_icons.py not found under:\n  %s\n"
             "Phase 0.7 derives its icons from the same artwork -- see ROLLBACK.md."
             % PHASE06)

RES = os.path.join(PHASE_DIR, "app", "android", "app", "src", "main", "res")

FOREGROUND_SCALE = 0.54     # of the 108dp adaptive canvas -- see the header
ROUND_SCALE = 0.76          # of the round icon, sitting on its disc
SPLASH_SCALE = 0.40         # of the splash's shorter side

LAUNCHER = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
FOREGROUND = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}
SPLASH = {
    "drawable": (480, 320),
    "drawable-port-mdpi": (320, 480), "drawable-land-mdpi": (480, 320),
    "drawable-port-hdpi": (480, 800), "drawable-land-hdpi": (800, 480),
    "drawable-port-xhdpi": (720, 1280), "drawable-land-xhdpi": (1280, 720),
    "drawable-port-xxhdpi": (960, 1600), "drawable-land-xxhdpi": (1600, 960),
    "drawable-port-xxxhdpi": (1280, 1920), "drawable-land-xxxhdpi": (1920, 1280),
}


def blank(w, h, rgba=(0, 0, 0, 0)):
    canvas = bytearray(w * h * 4)
    if rgba[3]:
        for i in range(w * h):
            canvas[i * 4:i * 4 + 4] = bytes(rgba)
    return canvas


def blit(dst, dw, dh, src, sw, sh, x, y):
    """Alpha-composite src onto dst at (x, y)."""
    for row in range(sh):
        ty = y + row
        if ty < 0 or ty >= dh:
            continue
        for col in range(sw):
            tx = x + col
            if tx < 0 or tx >= dw:
                continue
            s = (row * sw + col) * 4
            a = src[s + 3]
            if not a:
                continue
            d = (ty * dw + tx) * 4
            if a == 255:
                dst[d:d + 4] = src[s:s + 4]
                continue
            f = a / 255.0
            for k in range(3):
                dst[d + k] = int(round(src[s + k] * f + dst[d + k] * (1 - f)))
            dst[d + 3] = max(dst[d + 3], a)


def centred(art, aw, ah, size, scale, bg=(0, 0, 0, 0)):
    """The card at `scale` of a square `size` canvas, centred."""
    inner = max(1, int(round(size * scale)))
    small = M.resize_area(art, aw, ah, inner, inner)
    canvas = blank(size, size, bg)
    off = (size - inner) // 2
    blit(canvas, size, size, small, inner, inner, off, off)
    return canvas


def disc(size, rgba, ss=3):
    """An antialiased filled circle, for the round launcher icon."""
    canvas = blank(size, size)
    r = size / 2.0
    for y in range(size):
        for x in range(size):
            hits = 0
            for sy in range(ss):
                dy = (y + (sy + 0.5) / ss) - r
                for sx in range(ss):
                    dx = (x + (sx + 0.5) / ss) - r
                    if dx * dx + dy * dy <= r * r:
                        hits += 1
            if hits:
                o = (y * size + x) * 4
                canvas[o:o + 4] = bytes((rgba[0], rgba[1], rgba[2],
                                         int(round(255 * hits / (ss * ss)))))
    return canvas


def splash(art, aw, ah, w, h):
    canvas = blank(w, h, (M.PAD[0], M.PAD[1], M.PAD[2], 255))
    inner = max(1, int(round(min(w, h) * SPLASH_SCALE)))
    small = M.resize_area(art, aw, ah, inner, inner)
    blit(canvas, w, h, small, inner, inner, (w - inner) // 2, (h - inner) // 2)
    return canvas


def main():
    check_only = "--check" in sys.argv

    if not os.path.isfile(M.SOURCE):
        sys.exit("source artwork not found:\n  %s" % M.SOURCE)
    if not os.path.isdir(RES):
        sys.exit("Capacitor res/ not found:\n  %s\nHas `npx cap add android` run?" % RES)

    sw, sh, src = M.decode_png(M.SOURCE)
    ax, ay, aw, ah = M.squarify(*M.content_bbox(src, sw, sh), w=sw, h=sh)
    art = M.crop(src, sw, sh, ax, ay, aw, ah)
    print("source : %s" % os.path.relpath(M.SOURCE, PART_F))
    print("card   : %dx%d, cropped from %dx%d" % (aw, ah, sw, sh))
    print("pad    : #%02x%02x%02x  (--ink, shared with the web icons)" % M.PAD)
    print()

    outputs = {}

    for density, size in sorted(LAUNCHER.items()):
        # legacy square: the card exactly as drawn, alpha kept
        px = M.resize_area(art, aw, ah, size, size)
        outputs["mipmap-%s/ic_launcher.png" % density] = M.encode_png(size, size, px, True)

        # legacy round: an ink disc with the card inside it
        canvas = disc(size, M.PAD)
        inner = max(1, int(round(size * ROUND_SCALE)))
        small = M.resize_area(art, aw, ah, inner, inner)
        blit(canvas, size, size, small, inner, inner,
             (size - inner) // 2, (size - inner) // 2)
        outputs["mipmap-%s/ic_launcher_round.png" % density] = \
            M.encode_png(size, size, canvas, True)

    for density, size in sorted(FOREGROUND.items()):
        px = centred(art, aw, ah, size, FOREGROUND_SCALE)
        outputs["mipmap-%s/ic_launcher_foreground.png" % density] = \
            M.encode_png(size, size, px, True)

    for folder, (w, h) in sorted(SPLASH.items()):
        outputs["%s/splash.png" % folder] = \
            M.encode_png(w, h, splash(art, aw, ah, w, h), False)

    # The adaptive background is a colour, not an image.
    bg_xml = ('<?xml version="1.0" encoding="utf-8"?>\n'
              '<resources>\n'
              '    <!-- Matches PAD in Phase 0.6\'s make_icons.py: the sheet\'s own\n'
              '         --ink. The adaptive foreground sits on this, so the two\n'
              '         must stay in step. -->\n'
              '    <color name="ic_launcher_background">#%02X%02X%02X</color>\n'
              '</resources>\n' % M.PAD)
    outputs["values/ic_launcher_background.xml"] = bg_xml.encode("utf-8")

    changed = []
    for rel, data in sorted(outputs.items()):
        path = os.path.join(RES, *rel.split("/"))
        existing = None
        if os.path.isfile(path):
            with open(path, "rb") as fh:
                existing = fh.read()
        if check_only:
            state = "match" if existing == data else (
                "MISSING" if existing is None else "DIFFERS")
            if existing != data:
                changed.append(rel)
            print("  %-46s %8d bytes  %s" % (rel, len(data), state))
            continue
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as fh:
            fh.write(data)
        print("  %-46s %8d bytes" % (rel, len(data)))

    print()
    if check_only and changed:
        print("%d resource(s) would change: %s" % (len(changed), ", ".join(changed)))
        sys.exit(1)
    if check_only:
        print("all Android resources match the source artwork")
    else:
        print("%d resources written" % len(outputs))


if __name__ == "__main__":
    main()
