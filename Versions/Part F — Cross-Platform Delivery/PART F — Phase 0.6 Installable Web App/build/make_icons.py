#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Derive the app icons from the supplied artwork, using nothing but the standard
library.

    python3 build/make_icons.py            write the PNGs into icons/
    python3 build/make_icons.py --check    regenerate in memory, compare, write nothing

Source: icons/source/app-icon.png -- the commissioned artwork, 1254x1254 RGBA.
Everything under icons/ other than source/ is derived from it and safe to delete
and regenerate.

There is no Pillow here, no ImageMagick, no SVG rasteriser: this decodes PNG,
resamples, and re-encodes by hand. That keeps the icons regenerable anywhere
Python runs -- the Windows desktop included -- with nothing to install, which is
the same reason the rest of this project has no build dependencies. Output is
deterministic, so icons diff like any other build artefact.

The artwork is a rounded card: a full-bleed illustration with its own curved
corners, a soft drop shadow, and a band of transparent margin around all of it.
Every step below follows from that shape.

WHAT EACH OUTPUT NEEDS, AND WHY THEY ARE NOT ALL THE SAME IMAGE

  all three               cropped to the card first. The supplied margin is
                          about 6% of the canvas, and every platform insets the
                          icon again on its own terms -- so margin left in the
                          pixels is margin charged twice, and the design ends up
                          small and adrift in its tile.

  icon-192 / icon-512     purpose "any". Alpha preserved: the card's rounded
                          corners stay transparent and the launcher composites
                          them over whatever backdrop it uses.

  apple-touch-icon        iOS does not honour alpha here -- transparent corners
                          come out black -- and it rounds the tile itself, less
                          deeply than the artwork does. So the corner arcs are
                          trimmed off rather than filled in, handing iOS the
                          full-bleed square it expects and letting its own mask
                          draw the curve.

  icon-maskable-512       Android may crop a maskable icon to a circle, a
                          squircle, or a rounded square, and only the middle 80%
                          is guaranteed to survive. The artwork is full-bleed --
                          element mons down the left edge, the title across the
                          bottom -- so cropping it raw would cut both. It is
                          scaled to 80% and padded onto PAD, keeping every part
                          of the design inside the safe zone.
"""

import os
import struct
import sys
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
PHASE_DIR = os.path.dirname(HERE)
ICON_DIR = os.path.join(PHASE_DIR, "icons")
SOURCE = os.path.join(ICON_DIR, "source", "app-icon.png")

# Background behind the maskable icon's padding, and the safety net under any
# stray alpha in the opaque outputs. This is --ink from css/10-sheet-base.css.
#
# It is a constant rather than a colour sampled from the artwork, and that is
# deliberate: the artwork's perimeter runs from cream parchment at the top left
# to solid black along the bottom, so there is no single edge colour to find.
# Averaging the ring -- which an earlier version did -- returns #78604d, a muddy
# brown that appears nowhere in the design and matches none of the four edges.
# The art already carries a drop shadow, so it is drawn as a card lying on a
# darker surface; --ink is that surface, and the shadow falls into it.
PAD = (0x2A, 0x24, 0x20)


# --------------------------------------------------------------------------
# PNG decoding
# --------------------------------------------------------------------------

def _paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def decode_png(path):
    """Return (width, height, bytearray of RGBA). 8-bit, non-interlaced only --
    which is what the source artwork is, and the failure is loud if that ever
    stops being true."""
    with open(path, "rb") as fh:
        data = fh.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        sys.exit("%s is not a PNG" % path)

    idat = bytearray()
    width = height = None
    palette = None
    trns = None
    ctype = bitdepth = None

    off = 8
    while off < len(data):
        (ln,) = struct.unpack(">I", data[off:off + 4])
        tag = data[off + 4:off + 8]
        body = data[off + 8:off + 8 + ln]
        if tag == b"IHDR":
            width, height, bitdepth, ctype, comp, filt, interlace = struct.unpack(
                ">IIBBBBB", body)
            if bitdepth != 8:
                sys.exit("only 8-bit PNGs are supported (got %d)" % bitdepth)
            if interlace:
                sys.exit("interlaced PNGs are not supported")
        elif tag == b"PLTE":
            palette = body
        elif tag == b"tRNS":
            trns = body
        elif tag == b"IDAT":
            idat += body
        elif tag == b"IEND":
            break
        off += 12 + ln

    raw = zlib.decompress(bytes(idat))

    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}.get(ctype)
    if channels is None:
        sys.exit("unsupported PNG colour type %s" % ctype)
    bpp = channels                      # bytes per pixel, at 8-bit depth
    stride = width * bpp

    # Undo the per-scanline filters.
    out = bytearray(height * stride)
    pos = 0
    prev = bytearray(stride)
    for y in range(height):
        ftype = raw[pos]; pos += 1
        line = bytearray(raw[pos:pos + stride]); pos += stride
        if ftype == 1:
            for i in range(bpp, stride):
                line[i] = (line[i] + line[i - bpp]) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                left = line[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                left = line[i - bpp] if i >= bpp else 0
                upleft = prev[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + _paeth(left, prev[i], upleft)) & 0xFF
        elif ftype != 0:
            sys.exit("unknown PNG filter type %d on row %d" % (ftype, y))
        out[y * stride:(y + 1) * stride] = line
        prev = line

    # Normalise everything to RGBA.
    rgba = bytearray(width * height * 4)
    for i in range(width * height):
        if ctype == 6:
            rgba[i * 4:i * 4 + 4] = out[i * 4:i * 4 + 4]
        elif ctype == 2:
            rgba[i * 4:i * 4 + 3] = out[i * 3:i * 3 + 3]
            rgba[i * 4 + 3] = 255
        elif ctype == 0:
            g = out[i]
            rgba[i * 4:i * 4 + 4] = bytes((g, g, g, 255))
        elif ctype == 4:
            g, a = out[i * 2], out[i * 2 + 1]
            rgba[i * 4:i * 4 + 4] = bytes((g, g, g, a))
        elif ctype == 3:
            idx = out[i]
            rgba[i * 4:i * 4 + 3] = palette[idx * 3:idx * 3 + 3]
            rgba[i * 4 + 3] = trns[idx] if trns and idx < len(trns) else 255
    return width, height, rgba


# --------------------------------------------------------------------------
# Resampling
# --------------------------------------------------------------------------

def resize_area(src, sw, sh, dw, dh):
    """Area-average downscale of RGBA.

    Each destination pixel is the mean of the source rectangle it covers, with
    fractional weights at the edges. Nearest-neighbour would alias the artwork's
    fine detail -- the brush strokes and the small element mons -- into noise at
    192px; averaging over the real footprint keeps them readable.

    Alpha-weighted so transparent pixels do not drag colour toward black at the
    rounded corners.
    """
    dst = bytearray(dw * dh * 4)
    x_edges = [sw * i / dw for i in range(dw + 1)]
    y_edges = [sh * i / dh for i in range(dh + 1)]

    for dy in range(dh):
        y0, y1 = y_edges[dy], y_edges[dy + 1]
        iy0, iy1 = int(y0), min(sh, int(y1) + (1 if y1 > int(y1) else 0))
        for dx in range(dw):
            x0, x1 = x_edges[dx], x_edges[dx + 1]
            ix0, ix1 = int(x0), min(sw, int(x1) + (1 if x1 > int(x1) else 0))

            racc = gacc = bacc = 0.0
            aacc = 0.0
            wacc = 0.0
            for sy in range(iy0, iy1):
                wy = min(y1, sy + 1) - max(y0, sy)
                if wy <= 0:
                    continue
                row = (sy * sw) * 4
                for sx in range(ix0, ix1):
                    wx = min(x1, sx + 1) - max(x0, sx)
                    if wx <= 0:
                        continue
                    w = wx * wy
                    o = row + sx * 4
                    a = src[o + 3]
                    aw = w * (a / 255.0)
                    racc += src[o] * aw
                    gacc += src[o + 1] * aw
                    bacc += src[o + 2] * aw
                    aacc += a * w
                    wacc += w

            if wacc <= 0:
                continue
            alpha = aacc / wacc
            o = (dy * dw + dx) * 4
            if alpha <= 0.5:
                dst[o:o + 4] = b"\x00\x00\x00\x00"
            else:
                aw = wacc * (alpha / 255.0)
                dst[o] = max(0, min(255, int(round(racc / aw))))
                dst[o + 1] = max(0, min(255, int(round(gacc / aw))))
                dst[o + 2] = max(0, min(255, int(round(bacc / aw))))
                dst[o + 3] = int(round(alpha))
    return dst


def content_bbox(src, w, h, threshold=250):
    """Bounding box of the artwork's opaque pixels.

    The supplied art is a rounded card sitting inside its own transparent
    margin -- it fills about 93% of the canvas. Scaling the whole canvas into a
    maskable icon's safe zone would shrink the design twice over, once by the
    art's own margin and again by the safe-zone allowance, ending near 74%.
    Cropping to the real content first spends the safe zone on the artwork
    rather than on empty pixels.
    """
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(h):
        row = y * w * 4
        for x in range(w):
            if src[row + x * 4 + 3] >= threshold:
                if x < minx: minx = x
                if x > maxx: maxx = x
                if y < miny: miny = y
                if y > maxy: maxy = y
                break                       # leftmost opaque pixel on this row
        for x in range(w - 1, -1, -1):      # and the rightmost
            if src[row + x * 4 + 3] >= threshold:
                if x > maxx: maxx = x
                break
    if maxx < 0:
        return 0, 0, w, h
    return minx, miny, maxx - minx + 1, maxy - miny + 1


def squarify(x0, y0, cw, ch, w, h):
    """Grow the shorter side of a box to match the longer, staying on canvas.

    The content box is very nearly square but not exactly, and every output is
    square. Stretching a 1165x1174 crop into 512x512 would distort the artwork
    by not quite one percent -- invisible on its own, and pointless to accept
    when the canvas has spare margin to take the difference from instead.
    """
    side = min(max(cw, ch), w, h)
    nx = min(max(0, x0 - (side - cw) // 2), w - side)
    ny = min(max(0, y0 - (side - ch) // 2), h - side)
    return nx, ny, side, side


def crop(src, w, h, x0, y0, cw, ch):
    out = bytearray(cw * ch * 4)
    for y in range(ch):
        s = ((y + y0) * w + x0) * 4
        d = y * cw * 4
        out[d:d + cw * 4] = src[s:s + cw * 4]
    return out


def extend_edges(px, w, h, threshold=250):
    """Grow the artwork outward into its transparent corners.

    Each pass finds transparent pixels touching an opaque one and gives them the
    mean of those neighbours, until nothing transparent is left. In a rounded
    corner that continues whichever edge is nearest -- cream at the top left,
    black along the bottom, grey mountains on the right -- so the square reads as
    the same illustration run to its corners rather than as artwork sitting on a
    background.

    The two obvious alternatives are both worse here. Filling the corners with a
    flat colour leaves four wedges of it in the gap between the artwork's curve
    and Apple's shallower one, which is precisely where they show. Trimming the
    curve away instead needs an 8.6% bite out of every side, because the card's
    edge is soft rather than a clean arc -- that reaches past the element mons on
    the left and clips the title along the bottom.

    Run on the already-downscaled 180px tile, not the 1176px original: the corner
    is ~15px deep there instead of ~101px, and the alpha-weighted resize has
    already resolved the soft edge into clean colour.
    """
    out = bytearray(px)
    solid = bytearray(1 if out[i * 4 + 3] >= threshold else 0
                      for i in range(w * h))

    while True:
        frontier = []
        for y in range(h):
            for x in range(w):
                i = y * w + x
                if solid[i]:
                    continue
                r = g = b = n = 0
                for ny in range(max(0, y - 1), min(h, y + 2)):
                    for nx in range(max(0, x - 1), min(w, x + 2)):
                        j = ny * w + nx
                        if not solid[j]:
                            continue
                        o = j * 4
                        r += out[o]; g += out[o + 1]; b += out[o + 2]; n += 1
                if n:
                    frontier.append((i, r // n, g // n, b // n))
        if not frontier:
            return out                  # done, or nothing opaque to grow from
        for i, r, g, b in frontier:
            o = i * 4
            out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 255
            solid[i] = 1


def count_transparent(src, w, h, threshold=250):
    return sum(1 for i in range(w * h) if src[i * 4 + 3] < threshold)


def flatten(src, w, h, bg):
    """Composite RGBA over an opaque background, returning RGBA with alpha=255."""
    out = bytearray(src)
    for i in range(w * h):
        o = i * 4
        a = out[o + 3]
        if a == 255:
            continue
        f = a / 255.0
        out[o] = int(round(out[o] * f + bg[0] * (1 - f)))
        out[o + 1] = int(round(out[o + 1] * f + bg[1] * (1 - f)))
        out[o + 2] = int(round(out[o + 2] * f + bg[2] * (1 - f)))
        out[o + 3] = 255
    return out


def pad_into(src, sw, sh, size, scale, bg):
    """Centre `src` scaled to `scale` of `size` on an opaque `size` canvas."""
    inner = max(1, int(round(size * scale)))
    art = resize_area(src, sw, sh, inner, inner)
    art = flatten(art, inner, inner, bg)

    canvas = bytearray(size * size * 4)
    for i in range(size * size):
        canvas[i * 4:i * 4 + 4] = bytes((bg[0], bg[1], bg[2], 255))
    off = (size - inner) // 2
    for y in range(inner):
        dst = ((y + off) * size + off) * 4
        srcrow = (y * inner) * 4
        canvas[dst:dst + inner * 4] = art[srcrow:srcrow + inner * 4]
    return canvas


# --------------------------------------------------------------------------
# PNG encoding
# --------------------------------------------------------------------------

def encode_png(w, h, rgba, keep_alpha):
    """Colour type 6 (RGBA) or 2 (RGB), 8-bit, filter type 0."""
    if keep_alpha:
        ctype, bpp = 6, 4
        raw = bytearray()
        for y in range(h):
            raw.append(0)
            raw += rgba[y * w * 4:(y + 1) * w * 4]
    else:
        ctype, bpp = 2, 3
        raw = bytearray()
        for y in range(h):
            raw.append(0)
            row = rgba[y * w * 4:(y + 1) * w * 4]
            for x in range(w):
                raw += row[x * 4:x * 4 + 3]

    def chunk(tag, body):
        return (struct.pack(">I", len(body)) + tag + body
                + struct.pack(">I", zlib.crc32(tag + body) & 0xFFFFFFFF))

    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, ctype, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
            + chunk(b"IEND", b""))


# --------------------------------------------------------------------------

def main():
    check_only = "--check" in sys.argv

    if not os.path.isfile(SOURCE):
        sys.exit("source artwork not found:\n  %s" % SOURCE)

    sw, sh, src = decode_png(SOURCE)
    print("source : %s  (%dx%d RGBA)" % (os.path.relpath(SOURCE, PHASE_DIR), sw, sh))

    # Crop to the artwork before doing anything else.
    #
    # The supplied file carries its own transparent margin -- the design covers
    # about 93% of the canvas. Every icon here is a square tile that the OS
    # pads, rounds or crops on its own terms, so a margin baked into the pixels
    # is margin spent twice: the launcher's inset applies on top of it, and for
    # the maskable icon the 80% safe zone would compound with it to leave the
    # design at roughly 74% of the tile, floating in a field of background.
    # Cropping puts the whole budget where it belongs, on the artwork.
    ax, ay, aw, ah = squarify(*content_bbox(src, sw, sh), w=sw, h=sh)
    art = crop(src, sw, sh, ax, ay, aw, ah)
    print("content: %dx%d at (%d,%d)  -- %.1f%% of the source canvas"
          % (aw, ah, ax, ay, 100.0 * aw / sw))

    outputs = {}

    # purpose "any" -- alpha kept, so the card's rounded corners stay
    # transparent and the launcher composites them over its own backdrop.
    for size in (192, 512):
        px = resize_area(art, aw, ah, size, size)
        outputs["icon-%d.png" % size] = (size, encode_png(size, size, px, True))

    # iOS -- must be opaque, and rounds the tile itself. The artwork is grown
    # into its own corners so the square is full-bleed illustration edge to edge.
    apple = resize_area(art, aw, ah, 180, 180)
    before = count_transparent(apple, 180, 180)
    apple = extend_edges(apple, 180, 180)
    stray = count_transparent(apple, 180, 180)
    print("apple  : %d transparent px grown out, %d left" % (before, stray))
    if stray:
        sys.exit("apple-touch-icon still has %d transparent pixels; iOS renders "
                 "those black" % stray)
    apple = flatten(apple, 180, 180, PAD)      # belt and braces before dropping alpha
    outputs["apple-touch-icon.png"] = (180, encode_png(180, 180, apple, False))

    # Android maskable -- the whole card inside the 80% safe zone, padded out to
    # 512 so a circular, squircle or rounded-square mask all keep the design.
    mask = pad_into(art, aw, ah, 512, 0.80, PAD)
    outputs["icon-maskable-512.png"] = (512, encode_png(512, 512, mask, False))

    changed = []
    for name, (size, data) in sorted(outputs.items()):
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
        print("\nall icons match the source artwork")


if __name__ == "__main__":
    main()
