# -*- coding: utf-8 -*-
"""
PART D — FEATURE 3: the four roll buttons carry the floating tray's gold d10.

Feature 2.1 with dice-icons.css / dice-icons.js added. Nothing else differs.

Inherited build notes follow.

PART D — FEATURE 2.1: ring DOM order, Void card fit, harness fixes.

Feature 2 with three corrections layered on. The CSS geometry is Feature 2's,
unchanged; what is new is two small JS sidecars (rings-order.js, rings-fit.js)
and a corrected copy of the regression harness. See ROLLBACK.md.

Inherited build notes from the swipe-tab layer follow.

FEATURE 8.1 — swipe-tab carousel + mobile optimisation, grafted onto Feature 8.

Layer 3 of 3:
    PART C — Feature 8 Mirumoto Rank 1   the trunk, READ ONLY, never modified
    PART C — Feature 8 swipe             Phases 1-8, the desktop-complete carousel
    PART C — Feature 8.1 ... (this)      Phase 9, mobile + cross-device work

This folder reads the TRUNK directly and carries its own carousel.css / carousel.js,
so it depends on nothing in the Feature 8 swipe folder. Either swipe folder can be
deleted without affecting the other.

Pure restructuring: not one character inside any .section is altered. The script
only (a) inserts the carousel CSS into the existing <style> block, (b) re-parents
the ten .section blocks into carousel pages, (c) hoists the modal/dice layers out
to be siblings of the shell, and (d) appends the carousel controller script.

Run:  python splice_swipe_tabs.py

Everything this feature owns lives in THIS folder. The Feature 8 trunk is read
only: it is opened, never written, and it stays in its own folder untouched, so
the whole swipe-tab feature rolls back by deleting or ignoring this directory.
Paths are resolved against this file rather than the working directory, so the
script can be run from anywhere.
"""
import io, os, re, sys, hashlib

HERE      = os.path.dirname(os.path.abspath(__file__))
TRUNK_DIR = os.path.join(HERE, os.pardir, "PART C — Feature 8 Mirumoto Rank 1")

# READ ONLY — never written to, never moved.
SRC = os.path.join(TRUNK_DIR, "l5r-character-sheet part C feature 8 mirumoto.html")
# Every generated file lands beside this script.
DST = os.path.join(HERE, "l5r-character-sheet part D feature 3 DICE.html")

if not os.path.isfile(SRC):
    sys.exit("Trunk not found:\n  %s\nExpected the untouched Feature 8 folder beside this one."
             % os.path.normpath(SRC))

with io.open(SRC, "r", encoding="utf-8") as fh:
    lines = fh.read().split("\n")

def at(n):                      # 1-based line access
    return lines[n - 1]

def expect(n, needle, label):
    if needle not in at(n):
        sys.exit("ANCHOR FAIL [%s] line %d\n  want: %s\n  got : %s"
                 % (label, n, needle, at(n)))

def block(a, b):                # inclusive 1-based slice
    return lines[a - 1:b]

# ----------------------------------------------------------------- anchors
CSS_INSERT   = 1346            # the sheet's own "@media print{"
BODY_OPEN    = 1420
WRAP_OPEN    = 1421
TOPBAR_A, TOPBAR_B = 1423, 1449   # titlebar + toolbar
TAIL_A             = 1742         # floating dice button onwards
FOOTER             = 2083
WRAP_CLOSE         = 2084
SCRIPT_OPEN        = 2086

expect(CSS_INSERT, "@media print{",       "css insert point")
expect(BODY_OPEN,  "<body>",              "body open")
expect(WRAP_OPEN,  '<div class="wrap">',  "wrap open")
expect(TOPBAR_A,   '<div class="titlebar">', "titlebar open")
expect(TOPBAR_B,   "</div>",              "toolbar close")
expect(TAIL_A,     "FLOATING MANUAL DICE ROLLER", "tail start")
expect(FOOTER,     "<footer",             "footer")
expect(WRAP_CLOSE, "</div>",              "wrap close")
expect(SCRIPT_OPEN,"<script>",            "script open")

# (comment_line, section_open, section_close, tab label, data-visible-with)
SECTIONS = [
    (1451, 1452, 1481, "Clan &amp; School",  None),
    (1483, 1484, 1561, "Identity",           None),
    (1563, 1564, 1568, "Rings &amp; Traits", None),
    (1570, 1571, 1589, "Skills",             None),
    (1591, 1592, 1609, "Adv &amp; Disadv",   None),
    (1611, 1612, 1617, "Techniques",         None),
    (1619, 1620, 1624, "Spell Slots",        "#spellSlotsSection"),
    (1626, 1627, 1707, "Combat",             None),
    (1709, 1710, 1729, "Equipment",          None),
    (1731, 1732, 1740, "Background",         None),
]
for c, o, k, label, _vis in SECTIONS:
    expect(o, '<div class="section"', "section open " + label)
    if at(k).strip() != "</div>":
        sys.exit("ANCHOR FAIL section close %s line %d: %r" % (label, k, at(k)))

# ----------------------------------------------------------------- CSS
CAROUSEL_CSS = io.open(os.path.join(HERE, "carousel.css"), encoding="utf-8").read()
# PHASE 9 layer, appended after the Phase 1-8 rules so it wins on order as well
# as specificity. Delete this file and these two lines to drop Phase 9 entirely.
MOBILE_CSS = os.path.join(HERE, "carousel-mobile.css")
if os.path.isfile(MOBILE_CSS):
    CAROUSEL_CSS += "\n" + io.open(MOBILE_CSS, encoding="utf-8").read()
# FEATURE 2 circular Ring layout, appended last so it wins on order as well as
# specificity. Delete rings-circular.css and these three lines to drop the
# feature entirely — the Rings section reverts to the sheet's own grid.
RINGS_CSS = os.path.join(HERE, "rings-circular.css")
if os.path.isfile(RINGS_CSS):
    CAROUSEL_CSS += "\n" + io.open(RINGS_CSS, encoding="utf-8").read()

# FEATURE 3 gold d10 roll buttons. Appended after the rings layer, so it wins on
# order as well as specificity. Delete dice-icons.css and these three lines to
# drop the styling half; the script half is guarded separately below.
DICE_CSS = os.path.join(HERE, "dice-icons.css")
if os.path.isfile(DICE_CSS):
    CAROUSEL_CSS += "\n" + io.open(DICE_CSS, encoding="utf-8").read()

# ----------------------------------------------------------------- JS
CAROUSEL_JS = io.open(os.path.join(HERE, "carousel.js"), encoding="utf-8").read()

# ----------------------------------------------------------------- assemble
out = []

# head + style, with the carousel CSS inserted just before the sheet's print block
out += block(1, CSS_INSERT - 1)
out += CAROUSEL_CSS.split("\n")
out += block(CSS_INSERT, BODY_OPEN - 1)

# body
out.append('<body class="car-active">')
out.append('')
out.append('<!-- ============ PHASE 2: SWIPE-TAB SHELL ============ -->')
out.append('<div class="car-shell" id="carShell" data-testid="carousel-shell">')
out.append('')
out.append('  <!-- Persistent chrome. Lives OUTSIDE the track, so it never swipes. -->')
out.append('  <header class="car-topbar" id="carTopbar" data-testid="carousel-topbar">')
# PHASE 3 tweak: the three toolbar .grp blocks get one wrapper so the button
# groups can become a horizontal rail on a phone while the status line stays put.
# On desktop the wrapper is `display:contents`, so the original flex row is
# byte-for-byte the same layout it always was. No id, class or handler moves.
for ln in block(TOPBAR_A, TOPBAR_B):
    if '<div class="toolbar">' in ln:
        out.append("  " + ln)
        out.append('      <div class="car-toolbar-rail" data-testid="carousel-toolbar-rail">')
        continue
    if 'class="status-msg"' in ln:
        out.append('      </div>')
        out.append("  " + ln)
        continue
    out.append(("  " + ln) if ln.strip() else "")
out.append('  </header>')
out.append('')
out.append('  <div class="car-viewport" id="carViewport" data-testid="carousel-viewport">')
out.append('    <button type="button" class="car-arrow car-arrow-prev" id="carPrev" title="Previous section" data-testid="carousel-prev">&#8249;</button>')
out.append('')
out.append('    <div class="car-track" id="carTrack" data-testid="carousel-track">')
out.append('')

for comment, open_ln, close_ln, label, vis in SECTIONS:
    attrs = ' class="car-page" data-tab-label="%s"' % label
    if vis:
        attrs += ' data-visible-with="%s"' % vis
    out.append('      <section%s>' % attrs)
    out.append('        <div class="car-page-inner">')
    for ln in block(comment, close_ln):
        out.append(("        " + ln) if ln.strip() else "")
    if label == "Background":
        # The footer note used to close the document; keep it visible on screen
        # by parking it at the bottom of the last page.
        out.append("        " + at(FOOTER).strip())
    out.append('        </div>')
    out.append('      </section>')
    out.append('')

out.append('    </div>')
out.append('')
out.append('    <button type="button" class="car-arrow car-arrow-next" id="carNext" title="Next section" data-testid="carousel-next">&#8250;</button>')
out.append('  </div>')
out.append('')
out.append('  <nav class="car-tabbar" id="carTabbar" data-testid="carousel-tabbar">')
out.append('    <div class="car-tabbar-inner" id="carTabbarInner" data-testid="carousel-tablist"></div>')
out.append('  </nav>')
out.append('')
out.append('</div>')
out.append('<!-- ============ END SWIPE-TAB SHELL ============ -->')
out.append('')
out.append('<!-- Fixed layers: hoisted OUT of the carousel so no scroll container or')
out.append('     transform can ever clip or re-anchor them. -->')

# tail: floating dice button, emphasisRerollUsed, all 16 modal overlays
# (footer moved into the Background page; the old .wrap close is dropped)
out += block(TAIL_A, FOOTER - 1)

# the sheet's own script, unchanged
out += block(SCRIPT_OPEN, len(lines))

text = "\n".join(out)

# append the carousel controller immediately before </body>
if text.count("</body>") != 1:
    sys.exit("expected exactly one </body>")
text = text.replace("</body>", "<script>\n" + CAROUSEL_JS.strip() + "\n</script>\n</body>")

# FEATURE 2.1 sidecars, in their own <script> after the carousel controller so
# the rings exist by the time either runs. Each file is guarded separately:
#     rings-order.js   puts the five cards into clockwise document order
#     rings-fit.js     publishes the Void card's real height to --ring-card-h
#     dice-icons.js    swaps the emoji dice for the floating tray's gold d10
# Delete either file and re-run to drop just that fix; delete both and this
# build is Feature 2 under a new name.
RINGS_JS = []
for _name in ("rings-order.js", "rings-fit.js", "dice-icons.js"):
    _path = os.path.join(HERE, _name)
    if os.path.isfile(_path):
        RINGS_JS.append(io.open(_path, encoding="utf-8").read().strip())
if RINGS_JS:
    if text.count("</body>") != 1:
        sys.exit("expected exactly one </body> before the rings sidecars")
    text = text.replace("</body>", "<script>\n" + ("\n\n").join(RINGS_JS)
                        + "\n</script>\n</body>")

# PHASE 8: with scripting off entirely, the carousel CSS would lay ten full-width
# pages side by side in a scroll container with no tab bar and no controller to
# drive it. This unwinds the shell back to the original stacked sheet, which is
# still perfectly readable and printable without a line of JavaScript.
NOSCRIPT = """<noscript><style>
  body.car-active{ overflow:visible; height:auto; padding:28px 16px 80px; }
  .car-shell{ display:block; height:auto; overflow:visible; }
  .car-topbar{ position:static; max-height:none; box-shadow:none; background:none;
               border-bottom:none; padding:0; }
  .car-viewport{ position:static; }
  .car-track{ display:block; height:auto; overflow:visible; scroll-snap-type:none; }
  .car-page{ display:block; width:auto; height:auto; overflow:visible; padding:0;
             content-visibility:visible; }
  .car-page-inner{ max-width:1180px; margin:0 auto; }
  .car-tabbar, .car-arrow{ display:none; }
</style></noscript>
</head>"""
if text.count("</head>") != 1:
    sys.exit("expected exactly one </head>")
text = text.replace("</head>", NOSCRIPT)

with io.open(DST, "w", encoding="utf-8", newline="") as fh:
    fh.write(text)

src_sz = os.path.getsize(SRC)
dst_sz = os.path.getsize(DST)
print("wrote %s" % DST)
print("  lines : %d -> %d" % (len(lines), text.count("\n") + 1))
print("  bytes : %d -> %d" % (src_sz, dst_sz))
print("  sha256: %s" % hashlib.sha256(text.encode("utf-8")).hexdigest()[:16])
