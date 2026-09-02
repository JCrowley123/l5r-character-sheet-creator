# -*- coding: utf-8 -*-
"""
Replace the line-art stance icons in the Feature 7 build with the artwork in
    L5R character sheet\\Art\\Stances\\...

Run it after splice_feature7.py -- the splice rebuilds the HTML from the Feature 6 trunk and
would otherwise put the old SVG icons back:

    python splice_feature7.py
    python patch_stance_icons.py

The images are processed here rather than pasted in as pre-baked base64, so adding new stance
art is a one-line change to SOURCES below and a re-run.

HOW THE FIGURES ARE SIZED. Fitting each drawing to the tile does NOT make the samurai look the
same size, because the sword is part of the drawing and each stance holds it differently: jodan
raises it overhead, hasso holds it vertical, chudan extends it horizontally. Scaled to a common
box, chudan's figure comes out small because its sword eats the width.

So the sword is measured separately from the swordsman. A morphological OPENING -- erode by k,
then dilate by k -- dissolves the blade (a long thin stroke) while restoring the figure (a thick
blob) to its true size, and the bounding box of the opened mask is the BODY. Every figure is then
scaled so that its body is the same height, and the scale is chosen as the largest one at which
every drawing, sword included, still fits inside the tile. Figures are bottom-aligned so their
feet share a ground line.

Requires Pillow:  python -m pip install Pillow
"""
import base64, io, os

try:
    from PIL import Image, ImageFilter
except ImportError:
    raise SystemExit("Pillow is required:  python -m pip install Pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
CREATOR = os.path.abspath(os.path.join(HERE, os.pardir, os.pardir))
ART = os.path.join(CREATOR, "Art", "Stances")
HTML = os.path.join(HERE, "l5r-character-sheet part C feature 8 mirumoto.html")

# The icon box, in CSS px. Portrait, because two of the three poses are tall; the canvas below
# uses the same aspect so a contain-fitted <img> fills it exactly with no letterboxing.
BOX_W, BOX_H = 88, 99
SCALE = 2                       # render at 2x for HiDPI screens
CAN_W, CAN_H = BOX_W * SCALE, BOX_H * SCALE

# Trim threshold. Two of these exports carry a fringe of almost-invisible pixels spanning nearly
# the whole canvas -- the jodan file's bounding box is 732x1023 at alpha>0 but 339x644 at
# alpha>8. Trimming at alpha>0 fits the *fringe* to the box and leaves the figure at roughly half
# the size of the others. Every file's bbox is stable from alpha>8 upward.
ALPHA_FLOOR = 8
SAFETY = 0.97                   # keeps the sword tip off the very edge of the box
FOOT_MARGIN = 0.02              # gap below the feet, as a fraction of canvas height

# stance key -> (folder under Art\Stances, filename, body-detect erosion radius)
#
# The erosion radius has to clear the blade without eating the figure's own thin parts, and the
# right value depends on how thick that drawing's linework is relative to the figure. These three
# were checked by drawing the detected box back over the artwork; the script prints the body size
# it found on every run so a bad value shows up immediately (a body much shorter than the whole
# drawing means the legs were eroded; one nearly as wide means the sword survived).
#   fullAttack: the "Full Attack Stance" folder is currently empty.
#   center:     "Gedan-no-kamae transparent thin line-art.png" is available if wanted.
SOURCES = {
    'attack': ("Attack Stance (jōdan no kamae)",
               "Jōdan‑no‑Kamae transparent thin line‑weight minimal‑shading.png", 6),
    'defense': ("Defence Stance (Hassō-no-kamae)",
                "Hassō-no-kamae transparent medium line‑weight minimal‑shading.png", 10),
    'fullDefense': ("Full Defence Stance (chūdan‑no‑kamae)",
                    "chūdan‑no‑kamae transparent thick line‑art.png", 20),
}

ORDER = ('attack', 'defense', 'fullDefense')

# The exact SVG one-liners this patch replaces. Matching on the full original line means the
# script refuses to run twice, and refuses to run against a build whose icons have moved.
ORIGINAL = {
    'attack': """    attack:      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20 L20 4 M14 4h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',""",
    'defense': """    defense:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L20 6 v6 c0 5-4 8-8 10 -4-2-8-5-8-10 V6 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',""",
    'fullDefense': """    fullDefense: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L20 6 v6 c0 5-4 8-8 10 -4-2-8-5-8-10 V6 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 12.5 l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',""",
}


def read(p):
    with io.open(p, 'r', encoding='utf-8', newline='') as f:
        return f.read()


def write(p, s):
    with io.open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(s)


def measure(key):
    """Return the drawing cropped to its visible ink, plus the body's height within it."""
    folder, name, k = SOURCES[key]
    path = os.path.join(ART, folder, name)
    if not os.path.isfile(path):
        raise SystemExit("missing artwork for %s:\n  %s" % (key, path))
    im = Image.open(path).convert('RGBA')
    mask = im.split()[3].point(lambda v: 255 if v > ALPHA_FLOOR else 0).convert('L')
    full = mask.getbbox()
    if not full:
        raise SystemExit("%s: the artwork is entirely transparent" % key)
    size = 2 * k + 1
    body = mask.filter(ImageFilter.MinFilter(size)).filter(ImageFilter.MaxFilter(size)).getbbox()
    if not body:
        raise SystemExit("%s: erosion radius %d removed the whole figure" % (key, k))
    return {'im': im.crop(full), 'name': name,
            'fullW': full[2] - full[0], 'fullH': full[3] - full[1],
            'bodyH': body[3] - body[1], 'bodyW': body[2] - body[0], 'k': k}


def once(text, needle, repl, label):
    n = text.count(needle)
    if n != 1:
        raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1 "
                         "(already patched, or the build moved)" % (label, n))
    return text.replace(needle, repl, 1)


def main():
    src = read(HTML)

    # ---- pass 1: measure every figure --------------------------------------------------
    m = {k: measure(k) for k in ORDER}
    print("body detection (erode/dilate to drop the blade, then measure the swordsman):")
    for k in ORDER:
        d = m[k]
        print("  %-12s k=%-3d drawing %4dx%-4d  body %4dx%-4d  (body is %.0f%% of drawing height)"
              % (k, d['k'], d['fullW'], d['fullH'], d['bodyW'], d['bodyH'],
                 100.0 * d['bodyH'] / d['fullH']))

    # ---- the common body height ---------------------------------------------------------
    # Every figure is drawn at the same body height. The largest such height is set by whichever
    # drawing runs out of room first once its sword is included -- width for chudan's horizontal
    # blade, height for hasso's vertical one.
    target = min(min(CAN_W * d['bodyH'] / float(d['fullW']),
                     CAN_H * d['bodyH'] / float(d['fullH'])) for d in m.values()) * SAFETY
    limiter = min(ORDER, key=lambda k: min(CAN_W * m[k]['bodyH'] / float(m[k]['fullW']),
                                           CAN_H * m[k]['bodyH'] / float(m[k]['fullH'])))
    print("common body height: %.0f canvas px = %.1f css px (limited by %s)"
          % (target, target / float(SCALE), limiter))

    # ---- pass 2: render ------------------------------------------------------------------
    print("icons at %dx%d canvas (%dx%d css):" % (CAN_W, CAN_H, BOX_W, BOX_H))
    for key in ORDER:
        d = m[key]
        s = target / float(d['bodyH'])
        w = max(1, int(round(d['fullW'] * s)))
        h = max(1, int(round(d['fullH'] * s)))
        art = d['im'].resize((w, h), Image.LANCZOS)
        canvas = Image.new('RGBA', (CAN_W, CAN_H), (0, 0, 0, 0))
        # Bottom-aligned so every samurai stands on the same ground line; the feet are the
        # lowest ink in all three drawings. Centred horizontally on the whole drawing, not on
        # the body -- centring the body would push chudan's outstretched sword past the edge.
        canvas.paste(art, ((CAN_W - w) // 2,
                           CAN_H - h - int(round(CAN_H * FOOT_MARGIN))), art)
        buf = io.BytesIO()
        canvas.save(buf, format='PNG', optimize=True)
        raw = buf.getvalue()
        print("  %-12s drawing %3dx%-3d  body %.0f css px  %5.1f KB"
              % (key, w, h, d['bodyH'] * s / float(SCALE), len(raw) / 1024.0))
        uri = 'data:image/png;base64,' + base64.b64encode(raw).decode('ascii')
        img = '<img src="' + uri + '" alt="" aria-hidden="true">'
        new = "    %s%s'%s'," % (key + ':', ' ' * (12 - len(key) - 1), img)
        src = once(src, ORIGINAL[key], new, key)

    # ---- CSS: a bigger, portrait icon box, and rules for <img> beside the <svg>s ----------
    # The two icons still drawn as SVG (fullAttack, center) keep inheriting currentColor, so they
    # still turn from gold to shu red when selected; their default preserveAspectRatio keeps them
    # square and centred inside the taller box. A raster image cannot inherit currentColor, so
    # the artwork uses opacity instead: dimmed when unselected, full strength when selected.
    OLD_CSS = """  .stance-icon{display:block;width:30px;height:30px;color:var(--gold);}
  .stance-tile.selected .stance-icon{color:var(--shu);}
  .stance-icon svg{width:100%;height:100%;display:block;}"""
    NEW_CSS = """  .stance-icon{
    display:block;width:100%%;max-width:%dpx;aspect-ratio:%d/%d;
    margin:0 auto;color:var(--gold);
  }
  .stance-tile.selected .stance-icon{color:var(--shu);}
  .stance-icon svg{width:100%%;height:100%%;display:block;}
  /* Stance artwork (attack / defence / full defence). Every figure was rendered to a common
     body height, so they only stay matched while the box keeps the canvas aspect ratio. */
  .stance-icon img{
    width:100%%;height:100%%;display:block;object-fit:contain;
    opacity:.72;transition:opacity .12s;
  }
  .stance-tile-btn:hover .stance-icon img{opacity:.9;}
  .stance-tile.selected .stance-icon img{opacity:1;}
  @media print{ .stance-icon img{opacity:1;} }""" % (BOX_W + 16, BOX_W, BOX_H)
    src = once(src, OLD_CSS, NEW_CSS, "stance-icon-css")

    # ---- CSS: make all five tiles exactly the same size ------------------------------------
    # Two things made them differ. "Full Defense" is the only name long enough to wrap to a
    # second line at narrow widths, which made its tile taller than the rest; and with
    # grid-auto-rows:auto every row sizes to its own content, so once the grid wraps to more
    # than one row the rows disagree as well. 1fr makes every row the height of the tallest,
    # and height:100% lets the button fill the cell it was given instead of hugging its text.
    # justify-content:flex-start keeps every icon at the same distance from the top of its
    # tile, so a two-line name grows downward instead of pushing its icon out of alignment.
    OLD_TILES = """  .stance-tiles{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));
    gap:8px;margin:10px 0 6px;
  }"""
    NEW_TILES = """  .stance-tiles{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));
    grid-auto-rows:1fr;
    gap:8px;margin:10px 0 6px;
  }"""
    src = once(src, OLD_TILES, NEW_TILES, "stance-tiles-rows")

    OLD_BTN = """  .stance-tile-btn{
    width:100%;display:flex;flex-direction:column;align-items:center;gap:4px;
    padding:12px 8px 10px;border:1px solid var(--line);border-radius:8px;"""
    NEW_BTN = """  .stance-tile-btn{
    width:100%;height:100%;display:flex;flex-direction:column;align-items:center;
    justify-content:flex-start;gap:4px;
    padding:12px 8px 10px;border:1px solid var(--line);border-radius:8px;"""
    src = once(src, OLD_BTN, NEW_BTN, "stance-tile-btn-fill")

    write(HTML, src)
    print("patched: %s" % os.path.basename(HTML))
    print("out: %d chars" % len(src))


if __name__ == '__main__':
    main()
