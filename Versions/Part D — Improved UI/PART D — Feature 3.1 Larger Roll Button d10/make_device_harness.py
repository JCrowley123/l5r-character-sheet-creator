# -*- coding: utf-8 -*-
"""
Phase 9 device-test harness generator.

Builds `_device_harness.html`: the trunk's REAL <style> block, plus carousel.css
and carousel-mobile.css, wrapped around faithful copies of every structure Phase 9
targets — the wound track, #xpBreakdown with its inline grid, the advantage and
technique entries, and all three dynamic tables with their real cell classes.

The point is that the CSS under test is the actual shipped CSS, not a paraphrase.

Run:  python make_device_harness.py
"""
import io, os

HERE  = os.path.dirname(os.path.abspath(__file__))
TRUNK = os.path.join(HERE, os.pardir, "PART C — Feature 8 Mirumoto Rank 1",
                     "l5r-character-sheet part C feature 8 mirumoto.html")

src       = io.open(TRUNK, encoding="utf-8").read()
sheet_css = src[src.index("<style>") + 7 : src.index("</style>")]
car_css   = io.open(os.path.join(HERE, "carousel.css"), encoding="utf-8").read()
mob_css   = io.open(os.path.join(HERE, "carousel-mobile.css"), encoding="utf-8").read()
ring_css  = io.open(os.path.join(HERE, "rings-circular.css"), encoding="utf-8").read()
dice_css  = ""
_dp = os.path.join(HERE, "dice-icons.css")
if os.path.isfile(_dp):
    dice_css = io.open(_dp, encoding="utf-8").read()
car_js    = io.open(os.path.join(HERE, "carousel.js"), encoding="utf-8").read()
# FEATURE 2.1: the mock has to run the same sidecars as the deliverable, or it
# measures a layout nobody ships. File-guarded, like the splice.
rings_js  = ""
for _n in ("rings-order.js", "rings-fit.js", "dice-icons.js"):
    _p = os.path.join(HERE, _n)
    if os.path.isfile(_p):
        rings_js += io.open(_p, encoding="utf-8").read() + chr(10)

EYE  = "&#128065;"
DIE  = "&#127922;"
XMK  = "&#10005;"
CUR  = "&#9673; current"


def wound(name, pen, thr, current):
    return ('<div class="wound-lvl{c}"><div class="lvl-name">{n}</div>'
            '<div class="pen">{p}</div><div>up to {t} wound pts</div>'
            '<div>{cur}</div>'
            '<button type="button" class="sk-info-btn">{eye}</button></div>').format(
        c=" current" if current else "", n=name, p=pen, t=thr,
        cur=CUR if current else "", eye=EYE)


WOUNDS = "".join([wound("Healthy", "&mdash;", 4, True), wound("Nicked", "-3", 6, False),
                  wound("Grazed", "-5", 8, False), wound("Hurt", "-10", 10, False),
                  wound("Injured", "-15", 12, False)])

SKILL_TH = ["SKILL", "TRAIT", "RANK", "EMPHASES", "SCHOOL", "XP", "ROLL", ""]


def skill_row(nm, tr, mastery):
    return ("<tr>"
            '<td><div class="sk-name-row"><input type="text" class="sk-name" value="{nm}">'
            '<button type="button" class="sk-info-btn">{eye}</button></div>'
            '<div class="sk-mastery-note">{m}</div></td>'
            '<td class="col-narrow"><input type="text" class="sk-trait" value="{tr}"></td>'
            '<td class="col-xnarrow"><input type="number" class="sk-rank" value="1"></td>'
            '<td><button type="button" class="ghost emph-add-btn">+ EMPH</button>'
            '<div class="sk-mastery-note">0 / 1 emphases at rank 1</div></td>'
            '<td class="col-check"><input type="checkbox" class="sk-school" checked></td>'
            '<td class="col-narrow sk-cost" style="text-align:right;">0 xp</td>'
            '<td class="col-xnarrow"><button type="button" class="dice-btn sk-roll">{die}</button></td>'
            '<td class="col-xnarrow"><button type="button" class="rm-btn">{x}</button></td>'
            "</tr>").format(nm=nm, tr=tr, m=mastery, eye=EYE, die=DIE, x=XMK)


WEAP_TH = ["WEAPON", "SKILL", "ATTACK", "DAMAGE", "SIZE", "NOTES", ""]
WEAP_ROW = ("<tr>"
            '<td><div class="wp-name-row"><input type="text" class="wp-name" value="Katana">'
            '<button type="button" class="sk-info-btn">{eye}</button></div>'
            '<div class="sk-mastery-note">Kenjutsu Rank 1 &middot; Agility 3<br>'
            'Medium &middot; Samurai</div></td>'
            '<td class="col-narrow"><input type="text" class="wp-skill" value="Kenjutsu"></td>'
            '<td class="col-narrow"><div class="roll-cell">'
            '<input type="text" class="wp-roll" value="4k3">'
            '<button type="button" class="dice-btn">{die}</button></div></td>'
            '<td class="col-narrow"><div class="roll-cell">'
            '<input type="text" class="wp-dmg" value="5k2">'
            '<button type="button" class="dice-btn">{die}</button></div></td>'
            '<td class="col-xnarrow"><input type="text" class="wp-size" value="Medium"></td>'
            '<td><input type="text" class="wp-notes" value="Spend 1 Void"></td>'
            '<td class="col-xnarrow"><button type="button" class="rm-btn">{x}</button></td>'
            "</tr>").format(eye=EYE, die=DIE, x=XMK)

EQ_TH = ["ITEM", "QTY", "NOTES", ""]


def eq_row(n):
    return ('<tr><td><input type="text" class="eq-name" value="{n}"></td>'
            '<td class="col-xnarrow"><input type="number" value="1"></td>'
            '<td><input type="text" value="Starting outfit"></td>'
            '<td class="col-xnarrow"><button type="button" class="rm-btn">{x}</button>'
            "</td></tr>").format(n=n, x=XMK)


def table(tid, ths, rows):
    head = "".join("<th>%s</th>" % t for t in ths)
    return ('<table class="dyn" id="{i}"><thead><tr>{h}</tr></thead>'
            '<tbody id="{i}_b">{r}</tbody></table>').format(i=tid, h=head, r=rows)


def entry(nm, pts, desc):
    return ('<div class="entry"><div class="row">'
            '<input type="text" value="{n}"><input type="number" value="{p}">'
            '<button type="button" class="rm-btn">{x}</button></div>'
            "<textarea>{d}</textarea></div>").format(n=nm, p=pts, d=desc, x=XMK)


XP_INLINE = ("font-size:.82rem;color:var(--ink-soft);font-family:'Noto Sans JP',sans-serif;"
             "display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:10px 12px;"
             "background:#fffdf8;border:1px solid var(--line);border-radius:6px;")

XP_BLOCK = ('<div id="xpBreakdown" style="' + XP_INLINE + '">'
            "<div>Traits: <strong>0</strong></div><div>Void: <strong>0</strong></div>"
            "<div>Skills+Emph: <strong>0</strong></div><div>Kata/Tech: <strong>0</strong></div>"
            "<div>Advantages: <strong>+0</strong></div>"
            "<div>Disadvantages: <strong>&minus;0</strong></div></div>")

RANKS = "".join(
    '<div class="rank-block"><label>%s</label><div class="row">'
    '<div><label>Rank</label><input type="number" value="5"></div>'
    '<div><label>Points</label><input type="number" value="5.0"></div></div></div>' % n
    for n in ["HONOR", "GLORY", "STATUS"])

XP_FIELDS = ("".join(
    '<div class="field"><label>%s</label><input type="number" value="%s"></div>' % (l, v)
    for l, v in [("Experience &mdash; Total Awarded", "40"), ("Manual Adjustment", "0"),
                 ("Experience &mdash; Spent (auto)", "0"),
                 ("Experience &mdash; Remaining", "40")]))

RING_TRAITS = {
    "air":   [("reflexes", "Reflexes"), ("awareness", "Awareness")],
    "earth": [("stamina", "Stamina"), ("willpower", "Willpower")],
    "fire":  [("agility", "Agility"), ("intelligence", "Intelligence")],
    "water": [("strength", "Strength"), ("perception", "Perception")],
}


def ring_card(key, name):
    traits = "".join(
        '<div class="trait-row"><label for="trait_{k}" data-trait-key="{k}">{n}</label>'
        '<input type="number" id="trait_{k}" min="1" max="10" value="2"></div>'.format(k=k, n=n)
        for k, n in RING_TRAITS[key])
    return ('<div class="ring-card" data-ring-key="{k}">'
            '<div class="ring-top">'
            '<div class="ring-name" data-ring-key="{k}" data-ring-name="{n}">{n}</div>'
            '<div class="ring-val"><input type="number" id="ring_{k}" value="2" readonly '
            'style="background:#efe9d8;"></div></div>'
            '{t}'
            '<div class="void-note">Ring = lower of its two traits (auto)</div>'
            "</div>").format(k=key, n=name, t=traits)


# How many Void Point pips the mock draws. The sheet renders one per Void Rank,
# up to 10, and they wrap three to a row at the narrow card width — which is what
# grows the card past the pentagon's height allowance. Raise this to measure the
# worst case; 2 is the sheet's default rank.
VOID_PIPS = int(os.environ.get("VOID_PIPS", "2"))

VOID_CARD = ('<div class="ring-card" data-ring-key="void">'
             '<div class="ring-name" data-ring-key="void" data-ring-name="Void">Void</div>'
             '<div class="ring-val">'
             '<button type="button" class="stepbtn" data-step="-1" data-ring="void">&minus;</button>'
             '<input type="number" id="ring_void" min="1" max="10" value="2">'
             '<button type="button" class="stepbtn" data-step="1" data-ring="void">+</button>'
             "</div>"
             '<div class="void-pts-block">'
             '<div class="void-pts-row"><label for="void_current" style="margin-bottom:0;">'
             "Void Points (current)</label>"
             '<button type="button" class="void-eye-btn" id="voidInfoBtn">&#128065;</button></div>'
             '<div class="void-pips">'
             + '<button type="button" class="void-pip"></button>' * VOID_PIPS
             + "</div></div>"
             # The sheet's Void card ends with this note. Leaving it out is why the
             # mock under-measured the card's height by roughly 80px.
             '<div class="void-note">Click a filled circle to spend a Void Point. '
             'Click (or right-click) a blank circle to get it back.</div>'
             "</div>")

RINGS_BLOCK = ('<div class="rings" id="ringsWrap">'
               + "".join(ring_card(k, n) for k, n in
                         [("air", "Air"), ("earth", "Earth"),
                          ("fire", "Fire"), ("water", "Water")])
               + VOID_CARD + "</div>")

PAGES = [
    ("Clan &amp; School",
     '<div class="hint">Pick your Clan, Family, and School, then apply each &mdash; it fills '
     "in trait bonuses, starting Honor, starting Skills, and starting Outfit for you.</div>"
     '<div class="grid g-2">'
     '<div class="field"><label>Clan</label><select class="field"><option>Crab</option></select></div>'
     '<div class="field"><label>Family</label>'
     '<select class="field"><option>Hida (+1 Strength)</option></select></div></div>'
     '<div class="grid g-2">'
     '<div class="field"><label>School</label>'
     '<select class="field"><option>Hida Bushi</option></select></div>'
     '<div class="field"><button class="ghost">APPLY SCHOOL</button></div></div>'),

    ("Identity",
     # Reproduced exactly as the sheet has it, INCLUDING the inline negative top
     # margin — that is the whole point of this block: the hint pulls itself up
     # against the Taint Rank box once the grid collapses to one column.
     '<div class="grid g-6">'
     + "".join('<div class="field"><label>%s</label>'
               '<input type="%s" value="%s"></div>' % (l, t, v)
               for l, t, v in [("Insight Rank (auto)", "number", "1"),
                               ("Insight Points (auto)", "number", "150"),
                               ("Insight to Next Rank (auto)", "number", "44"),
                               ("Other Insight Bonus", "number", "0"),
                               ("Age", "text", ""),
                               ("Taint Rank", "number", "0")])
     + "</div>"
     '<div class="hint" style="margin-top:-4px;">Insight = (sum of all five Rings '
     "&times; 10) + total Skill Ranks + Insight Bonus. Insight Rank breakpoints: "
     "0&ndash;149 Rank 1, 150&ndash;174 Rank 2, 175&ndash;199 Rank 3, then +25 per "
     "Rank. School Rank tracks Insight Rank automatically.</div>"
     '<div class="grid g-3">' + RANKS + "</div>"
     '<div class="grid g-2">' + XP_FIELDS + "</div>" + XP_BLOCK),

    ("Rings &amp; Traits", RINGS_BLOCK),

    ("Skills",
     '<div class="hint">Roll = Skill Rank + Trait Rank, Keep = Trait Rank (adjust manually '
     "for High/Low or trait-only rolls). Emphases: 1 at Rank 1, 2 at Rank 3, 3 at Rank 5.</div>"
     '<div class="field"><select class="field">'
     "<option>&mdash; choose a skill to add &mdash;</option></select></div>"
     + table("skillsTable", SKILL_TH,
             skill_row("Etiquette", "Aw",
                       "R3: +3 Insight<br>R5: +1k0 on Contested Rolls using this skill")
             + skill_row("Iaijutsu", "Ref",
                         "R3: Drawing a katana is a Free Action<br>"
                         "R5: One Free Raise on the Focus roll during a duel")
             + skill_row("Kenjutsu", "Agi", "R3: +1k0 sword damage"))
     + '<button class="ghost add-row-btn">+ ADD SKILL</button>'
       '<button class="ghost add-row-btn">+ LOAD FULL SKILL LIST</button>'),

    ("Adv &amp; Disadv",
     '<div class="hint">Pick from the reference library to add a pre-filled entry (name, base '
     "point cost, and a short paraphrase of the effect).</div>"
     '<div class="grid g-2">'
     "<div><label>Advantages</label>"
     '<select class="field"><option>&mdash; choose one to add &mdash;</option></select>'
     '<div class="entry-list">'
     + entry("Absolute Direction", "1",
             "Always know true north by instinct, and never become lost while travelling overland.")
     + '</div><button class="ghost add-row-btn">+ ADD ADVANTAGE</button></div>'
       "<div><label>Disadvantages</label>"
       '<select class="field"><option>&mdash; choose one to add &mdash;</option></select>'
       '<div class="entry-list">'
     + entry("Compulsion", "2",
             "2-4 points. An ingrained habit or obligation you must satisfy, or suffer "
             "penalties to all rolls.")
     + '</div><button class="ghost add-row-btn">+ ADD DISADVANTAGE</button></div></div>'),

    ("Techniques",
     '<div class="field"><select class="field">'
     "<option>&mdash; choose a Kata or Spell to add &mdash;</option></select></div>"
     '<div class="entry-list">'
     + entry("The Way of the Crane", "0",
             "[School Technique &mdash; Rank 1] While in the Center Stance (and the Round "
             "after), gain +1k1 plus your School Rank to attack and Focus rolls.")
     + entry("Striking as Earth", "3",
             "[Kata &mdash; Earth 3] Full Defense Stance: gain Reduction equal to your Earth "
             "Ring (stacks with other Reduction).")
     + "</div>"),

    ("Spell Slots", '<div id="spellSlotsSection">Spell slot tracker</div>'),

    ("Combat",
     '<div class="hint">Attack = Weapon Skill Rank + Trait, keep Trait. Damage = weapon DR + '
     "Strength (Perception for gunpowder weapons).</div>"
     '<div class="field"><select class="field">'
     "<option>&mdash; choose a weapon to add &mdash;</option></select></div>"
     + table("weaponsTable", WEAP_TH, WEAP_ROW)
     + '<button class="ghost add-row-btn">+ ADD WEAPON</button>'
       "<label>Wounds Taken</label>"
       '<input type="number" value="0" style="width:100px;">'
       '<div class="wound-track">' + WOUNDS + "</div>"),

    ("Equipment",
     '<div class="grid g-3">' + "".join(
         '<div class="field"><label>%s</label><input type="number" value="0"></div>' % c
         for c in ["Koku", "Bu", "Zeni"]) + "</div>"
     + table("equipTable", EQ_TH, "".join(eq_row(n) for n in
             ["Light Armor", "Sturdy Clothing", "Daisho", "any 1 weapon", "Traveling Pack"]))
     + '<button class="ghost add-row-btn">+ ADD ITEM</button>'
       '<button class="ghost add-row-btn">+ ADD SPELL SCROLL</button>'),

    ("Background",
     '<div class="grid g-2">'
     '<div class="field"><label>Appearance</label><textarea></textarea></div>'
     '<div class="field"><label>Personality</label><textarea></textarea></div></div>'
     '<div class="field"><label>History / Background</label>'
     '<textarea style="min-height:100px;"></textarea></div>'),
]

secs = []
for lab, body in PAGES:
    vis = ' data-visible-with="#spellSlotsSection"' if lab == "Spell Slots" else ""
    secs.append('      <section class="car-page" data-tab-label="%s"%s>\n'
                '        <div class="car-page-inner"><div class="section">'
                "<h2>%s</h2>%s</div></div>\n      </section>" % (lab, vis, lab, body))

HTML = """<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Feature 2.1 rings harness</title><style>%s
%s
%s
%s
%s</style></head><body class="car-active">
<div class="car-shell" id="carShell" data-testid="carousel-shell">
  <header class="car-topbar" id="carTopbar" data-testid="carousel-topbar">
    <div class="titlebar"><div><h1 id="headerName">Unnamed Bushi</h1>
      <div class="sub">Legend of the Five Rings</div></div>
      <div class="seal" id="seal">&#35352;</div></div>
    <div class="toolbar"><div class="car-toolbar-rail" data-testid="carousel-toolbar-rail">
      <div class="grp"><select id="charSelect"><option>New / unsaved</option></select>
      <button class="ghost">LOAD</button><button>SAVE</button></div></div>
      <div class="status-msg" id="statusMsg"></div></div>
  </header>
  <div class="car-viewport" id="carViewport" data-testid="carousel-viewport">
    <button type="button" class="car-arrow car-arrow-prev" id="carPrev"
            data-testid="carousel-prev">&#8249;</button>
    <div class="car-track" id="carTrack" data-testid="carousel-track">
%s
    </div>
    <button type="button" class="car-arrow car-arrow-next" id="carNext"
            data-testid="carousel-next">&#8250;</button>
  </div>
  <nav class="car-tabbar" id="carTabbar" data-testid="carousel-tabbar">
    <div class="car-tabbar-inner" id="carTabbarInner" data-testid="carousel-tablist"></div>
  </nav>
</div>
<button type="button" id="floatingDiceBtn" class="floating-dice-btn">D</button>
<script>%s</script>
<script>%s</script></body></html>""" % (
    sheet_css, car_css, mob_css, ring_css, dice_css, "\n".join(secs), car_js, rings_js)

out = os.path.join(HERE, "_device_harness.html")
io.open(out, "w", encoding="utf-8", newline="").write(HTML)
print("harness written: %d chars" % len(HTML))
print("  sheet css : %d lines (verbatim from the trunk)" % sheet_css.count("\n"))
print("  phase 1-8 : %d lines" % car_css.count("\n"))
print("  phase 9   : %d lines" % mob_css.count("\n"))
