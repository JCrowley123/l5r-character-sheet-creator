# -*- coding: utf-8 -*-
"""
Replace the dice emoji on the SKILL, WEAPON ATTACK and WEAPON DAMAGE roll buttons with the
faceted gold d10 already used by the floating manual dice tray.

Run it after splice_feature8.py -- the splice rebuilds the HTML from the Feature 7 trunk and would
otherwise put the emoji back:

    python splice_feature8.py
    python patch_stance_icons.py      (optional, the stance artwork)
    python patch_dice_icons.py

HOW THE DIE IS SHARED. The d10 is about a kilobyte of SVG. Skill rows and weapon rows are built by
makeSkillRow()/makeWeaponRow(), so pasting the markup into their template would put a full copy in
every row -- fifty skills means fifty copies of the same geometry in the DOM. Instead the die is
declared ONCE as an <svg><symbol> near the floating tray button, and each roll button carries a
seven-byte <use href="#iconD10">. The browser renders one definition; the custom properties
(--gold, --gold-soft, ...) still resolve through <use>, so the die stays in the sheet's palette
and follows any future theming.

WHAT IS NOT CHANGED. The Roll Initiative button keeps its emoji -- it is neither a skill roll nor
a weapon roll, and was not part of the request. Change ROLL_BUTTONS below to include it if wanted.

Idempotent by anchor: it matches the exact emoji buttons, so a second run fails loudly rather than
corrupting the file.
"""
import io, os

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, "l5r-character-sheet part C feature 8 mirumoto.html")

DIE_PX = 30          # rendered size in the table cells; 32 is the most the roll-cell takes


def read(p):
    with io.open(p, 'r', encoding='utf-8', newline='') as f:
        return f.read()


def write(p, s):
    with io.open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(s)


def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1:
        raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1 "
                         "(already patched, or the build moved)" % (label, n))
    return t.replace(needle, repl, 1)


# The three buttons the request names, keyed by the class that identifies each one.
#   label      -> for the console summary
#   old        -> the exact current markup
#   new        -> the same button with the die swapped in and a `d10` class added
def button(cls, title):
    return ('<button type="button" class="dice-btn %s" title="%s">\U0001f3b2</button>' % (cls, title),
            '<button type="button" class="dice-btn d10 %s" title="%s">'
            '<svg viewBox="0 0 512 512" aria-hidden="true"><use href="#iconD10"/></svg>'
            '</button>' % (cls, title))


ROLL_BUTTONS = [
    ('skill roll',     button('sk-roll',
                              'Roll Trait+Rank, keep Trait (Unskilled: roll and keep Trait)')),
    ('weapon attack',  button('wp-roll-btn', 'Roll attack')),
    ('weapon damage',  button('wp-dmg-btn', 'Roll damage')),
]

# The die itself, lifted verbatim from the floating tray button so the two can never drift apart.
SYMBOL = """  <!-- The manual dice tray's gold d10, declared once so the skill and weapon roll buttons can
       reference it with <use> instead of each carrying its own copy of the geometry. Kept
       byte-identical to the floating button's paths below. -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="iconD10" viewBox="0 0 512 512">
      <path d="M256,8 L352,250 L256,320 L160,250 Z" fill="var(--gold-soft)"/>
      <path d="M256,8 L160,250 L10,270 Z" fill="var(--gold)"/>
      <path d="M160,250 L256,320 L256,504 L10,270 Z" fill="var(--gold-mid)"/>
      <path d="M256,8 L502,270 L352,250 Z" fill="var(--gold-dark)"/>
      <path d="M352,250 L502,270 L256,504 L256,320 Z" fill="var(--gold-shadow)"/>
      <path d="M256,8 L502,270 L256,504 L10,270 Z" fill="none" stroke="var(--paper)" stroke-width="8" stroke-linejoin="round"/>
      <path d="M256,8 L160,250 M256,8 L352,250 M160,250 L256,320 L352,250 M256,320 L256,504 M160,250 L10,270 M352,250 L502,270" fill="none" stroke="#ffffff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
      <text x="256" y="228" text-anchor="middle" font-family="'Shippori Mincho', serif" font-weight="800" font-size="78" fill="var(--paper)" stroke="var(--ink)" stroke-width="2" paint-order="stroke">10</text>
    </symbol>
  </svg>

"""

CSS = """  /* Skill / attack / damage roll buttons: the manual tray's gold d10 in place of the emoji.
     The gold pill that sat behind the emoji is dropped -- the die is itself gold, and a gold die
     on a gold pill reads as a blob. Hover and press match .dice-picker-die exactly (scale, no
     transition) so every die on the sheet behaves the same way. */
  .dice-btn.d10{
    background:none;border:none;padding:0;
    width:%(px)dpx;height:%(px)dpx;line-height:0;flex:none;
    display:inline-flex;align-items:center;justify-content:center;
  }
  .dice-btn.d10 svg{
    width:100%%;height:100%%;display:block;
    filter:drop-shadow(0 1px 2px rgba(42,36,32,.30));
  }
  .dice-btn.d10:hover{opacity:1;transform:scale(1.12);}
  .dice-btn.d10:active{transform:scale(.94);}
  .dice-btn.d10:focus-visible{outline:2px solid var(--gold);outline-offset:2px;border-radius:4px;}

""" % {'px': DIE_PX}


def main():
    src = read(HTML)

    # ---- 1. the shared <symbol>, immediately before the floating tray button -------------
    ANCHOR = '  <button type="button" id="floatingDiceBtn" class="floating-dice-btn print-hide"'
    src = once(src, ANCHOR, SYMBOL + ANCHOR, "d10-symbol")

    # ---- 2. the three roll buttons -------------------------------------------------------
    for label, (old, new) in ROLL_BUTTONS:
        src = once(src, old, new, label)
        print("  swapped: %s" % label)

    # ---- 3. CSS, beside the existing .dice-btn rule --------------------------------------
    CSS_ANCHOR = "  .dice-btn:hover{opacity:.85;}\n"
    src = once(src, CSS_ANCHOR, CSS_ANCHOR + CSS, "dice-btn-css")

    write(HTML, src)
    print("patched: %s" % os.path.basename(HTML))
    print("out: %d chars" % len(src))
    remaining = src.count('\U0001f3b2')
    print("dice emoji left in the build: %d (the Roll Initiative button)" % remaining)


if __name__ == '__main__':
    main()
