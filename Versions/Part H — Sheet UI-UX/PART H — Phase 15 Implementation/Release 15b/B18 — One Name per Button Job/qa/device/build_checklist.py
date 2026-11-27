"""B18 device round: writes the owner's checklist page (device-checks.html, published as a private artifact) and its
Markdown mirror (../../DEVICE-CHECKS.md). One change per card, as the owner asked for the mock-up boards ("show me 1 button
change at a time"): a plain title, where to look, what the live sheet shows and what the preview should show, and
Pass / Fail / Not run on the iPhone and on the laptop, with a note. Each unit then gets Accept / Revise / Remove.
Answers save in the page's store (db, collection "answers"), as on the board.
    python -B build_checklist.py <preview url> <build sha256>"""
import html, io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PREVIEW, BUILD = sys.argv[1], sys.argv[2]
LIVE = 'https://l5r-character-sheet-creator.pages.dev/'
BOARD = 'https://claude.ai/artifact/CEVcuCGBbiamEg8spLQ3o2'

# (id, unit, title, where, steps, now, after, optional)
CARDS = [
    ('reset', 'B18', '“Reset session” reads “Reset”',
     'Advantages & Disadvantages (Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky); Clan & School (an Ancestor with a once-a-session gift, such as Kuni); Combat (the round counter).',
     ['Each of the seven once-a-session buttons reads “Reset”. The round counter’s already did.',
      'Spend a Luck use (or tap Unlucky’s −), then tap its Reset: the pips fill again.'],
     'Reset session', 'Reset', False),
    ('reset-lines', 'B18', 'The lines that name Reset say “Reset”',
     'Kharmic Tie’s i; Luck’s i; with Kuni’s gift used, a spell roll’s preview.',
     ['Kharmic Tie’s i window ends: “Reset gives back all 3 at the start of a session.”',
      'Luck’s i opens a window headed “Reset”.',
      'With the Ancestor’s once-a-session gift used, a roll preview’s note says “… ready again after Reset on the Ancestor card (Clan & School).”'],
     'Reset session gives back … · headed “Reset session”', 'Reset gives back … · headed “Reset”', False),
    ('use', 'B18', '“Use it now” reads “Use”',
     'Clan & School, an Imperial character with the Seppun Ancestor, its free Void Point not yet used.',
     ['The Ancestor card’s button reads “Use”.',
      'Tap it: the question’s button reads “Use” (and Cancel). Cancel it.',
      'The gift’s note on the card says press “Use” on this card.'],
     'Use it now', 'Use', False),
    ('gotit', 'B18', '“Got it” reads “OK”',
     'Techniques page, the Kiho rules i (or an Affinity or Deficiency badge’s i).',
     ['The message window’s button reads “OK”.'],
     'Got it', 'OK', False),
    ('yesno', 'B18', '“Yes” and “No” read “Confirm” and “Cancel”',
     'A Shugenja: use every slot of one Element (Spell Slots page), keep a bonus slot, then cast a spell of that Element.',
     ['The question about the bonus slot has “Confirm” and “Cancel”.',
      'Confirm uses the bonus slot as before.'],
     'Yes · No', 'Confirm · Cancel', True),
    ('reroll', 'B18', '“Re-roll” is spelled “Reroll”',
     'Skills page: roll a Skill you hold an Emphasis in until some dice show 1.',
     ['The result’s button reads “Reroll 1s”.',
      'Tap it: the next button reads “Reroll selected”. Tap a die showing 1, then “Reroll selected”: those dice are rolled again.'],
     'Re-roll 1s · Re-roll selected', 'Reroll 1s · Reroll selected', False),
    ('luck', 'B18', '“Spend Luck” reads “Reroll with Luck”',
     'Any roll’s result, with Luck on the character.',
     ['The result’s Luck button reads “Reroll with Luck (n/m)”.',
      'Tap it: the roll is made again and one Luck use is spent, as before.',
      'If you have a Toku (Monkey) or Kakita (Crane) Ancestor: “Reroll with Toku’s Luck (1/1)”, “Reroll with Kakita (a Void Point)”.'],
     'Spend Luck (2/3)', 'Reroll with Luck (2/3)', False),
    ('emph', 'B18', '“+ Emph” reads “+ Add Emphasis”',
     'Skills page, Manage.',
     ['Each Skill’s button reads “+ Add Emphasis” and still adds one.',
      'On the iPhone, a Skill with no Emphasis yet puts its count (“0 / 1 emphases …”) on its own line, as the board showed.'],
     '+ Emph', '+ Add Emphasis', False),
    ('book', 'B18', '“+Book” reads “+ Add Book”',
     'Characters screen, Library.',
     ['The button reads “+ Add Book” and still opens Add a book.'],
     '+Book', '+ Add Book', False),
    ('court', 'B18', '“Add court” reads “+ Add court”',
     'Darling of the Court, Manage: tap its Change.',
     ['The window’s button reads “+ Add court” and still adds a court box.'],
     'Add court', '+ Add court', True),
    ('spendvoid', 'B18', '“Spend a Void Point” reads “Spend Void”',
     'Only if you have a Spider character with the Hida Atarasi Ancestor: declare its strike in an attack’s preview, then roll.',
     ['The price question’s button reads “Spend Void” (beside “Take a point of Taint”).'],
     'Spend a Void Point', 'Spend Void', True),
    ('combati', 'B18', 'The Combat tab’s ⓘ and 👁 become the ring i',
     'Combat page, Play: Armor & TN, Weapons, a weapon’s row, the Stance tiles.',
     ['Each shows the round i the rest of the sheet uses. Each still opens its window.',
      'On the iPhone these cards are taller than on the live site (the stance tiles most), as the board showed.'],
     'ⓘ · 👁', 'the ring i', False),
    ('pdf', 'B18', '“Export to PDF” reads “Export PDF”',
     'Characters screen: a saved character’s ⋯ menu.',
     ['The item reads “Export PDF”, between Export JSON and Save As a copy.'],
     'Export to PDF', 'Export PDF', False),
    ('chooseagain', 'B18', '“Choose again” reads “Change”',
     'New character (the wizard), the Skills step: fill one of your School’s free choices.',
     ['Under the chosen Skill the button reads “Change”; it puts the choice back.'],
     'Choose again', 'Change', True),
    ('quicktaps', 'B18', 'Quick taps on Honour’s + are still one Undo',
     'Identity page, the Honour card.',
     ['Tap + three times quickly, then Undo: all three come back off at once, as on the live site.'],
     'one Undo for a burst', 'the same', False),
    ('touch', 'B18', 'Touch of the Void keeps “Keep control (TN 30)”',
     'Disadvantages: Touch of the Void.',
     ['Its button still reads “Keep control (TN 30)”, as you chose.'],
     'Keep control (TN 30)', 'unchanged', True),
    ('rowx', 'B18', 'With VoiceOver: a row’s ✕ is read “Remove …”',
     'Skills, Advantages, Equipment or Weapons, Manage, with VoiceOver on.',
     ['A row’s ✕ is read “Remove Calligraphy”, “Remove Robes” and so on; an Emphasis’s ✕ “Remove Emphasis”.'],
     '“✕”', '“Remove {row}”', True),
    ('cornerx', 'B18', 'With VoiceOver: a window’s ✕ is read “Close …” or “Cancel …”',
     'Any window (a Skill’s i, a roll’s preview, a notice), with VoiceOver on.',
     ['“Close Calligraphy information”, “Cancel Before you roll”, “Close notice”.'],
     '“✕”', '“Close …” / “Cancel …”', True),
    ('changechoose', 'B18', 'With VoiceOver: Change and Choose… say which card',
     'Advantages, Manage, with VoiceOver on.',
     ['“Change Luck”, “Choose Wealthy”.'],
     '“Change”', '“Change Luck”', True),
    ('info', 'B18', 'With VoiceOver: every i is read “… information”',
     'Advantages, the Ancestor section, Quick Access’s Armor TN, with VoiceOver on.',
     ['“Luck information”, “Ancestors information”, “Armor TN information”.'],
     '“Explain: Luck”', '“Luck information”', True),
    ('steppers', 'B18', 'With VoiceOver: − and + are read “Decrease …” and “Increase …”',
     'Identity (Honour), Rings & Traits in Manage (the Void Ring), with VoiceOver on.',
     ['“Decrease Honour points”, “Increase Void Ring”.'],
     '“Subtract Honour points”', '“Decrease Honour points”', True),
    ('clear', 'B18', 'With VoiceOver: the dice tray’s Clear says what it clears',
     'The floating 10 (dice tray), with VoiceOver on.',
     ['“Clear the dice”, and lower down “Clear the other dice”.'],
     '“Clear”', '“Clear the dice”', True),
    ('size', 'B18.1', 'Every Reset is the same size',
     'The seven Resets above, and the round counter.',
     ['Every Reset is the same height and size, in capitals, as in the board’s round 2.',
      'The buttons beside them match: Great Destiny’s Use, Unlucky’s − and +, the Ancestor card’s Use, Next Round.'],
     'six looks, 19 to 32 px', 'one look, 28 px, capitals', False),
    ('iright', 'B18.2', 'The i sits at the right end of its row',
     'Advantages & Disadvantages: Luck, Dark Paragon, Seven Fortunes’ Curse (Hotei); in Manage, a card that still needs a choice (such as Wealthy). On the iPhone and on the laptop.',
     ['Each i sits at the right end of its row, where Kharmic Tie’s is.',
      'Each still opens its window. The Skills list’s i’s and the i’s beside a heading have not moved.'],
     'beside the buttons or badge', 'at the right end', False),
]
UNITS = [('B18', 'B18 · One name per button job', 'every card above except the last two'),
         ('B18.1', 'B18.1 · One size for Reset', 'the card “Every Reset is the same size”'),
         ('B18.2', 'B18.2 · The i at the end of its row', 'the card “The i sits at the right end of its row”')]

e = html.escape


def card(i, c):
    cid, unit, title, where, steps, now, after, optional = c
    radios = ''
    for dev, devname in (('iphone', 'iPhone'), ('laptop', 'Laptop')):
        opts = ''.join('<label class="opt"><input type="radio" name="r-%s-%s" value="%s" id="r-%s-%s-%s"> %s</label>' % (cid, dev, v, cid, dev, v, w)
                       for v, w in (('pass', 'Pass'), ('fail', 'Fail'), ('notrun', 'Not run')))
        radios += '<div class="dev"><span class="devname">%s</span><div class="opts">%s</div></div>' % (devname, opts)
    return ('<article class="card" id="c-%s"><p class="count">%d of %d · %s%s</p><h2>%s</h2>'
            '<p class="where"><b>Where:</b> %s</p><ul class="lines">%s</ul>'
            '<p class="was"><span class="k now">Live</span> %s <span class="arrow">→</span> <span class="k after">Preview</span> <b>%s</b></p>'
            '<fieldset class="answer" id="d-%s"><legend>Your check <span class="t" id="t-%s"></span></legend>%s'
            '<div class="notewrap"><label for="n-%s">Note (optional)</label><textarea id="n-%s" rows="1"></textarea></div>'
            '<p class="saved" id="sv-%s"></p></fieldset></article>') % (
        cid, i + 1, len(CARDS), e(unit), ' · optional' if optional else '', e(title), e(where),
        ''.join('<li>%s</li>' % e(s) for s in steps), e(now), e(after), cid, cid, radios, cid, cid, cid)


PARTS = {'B18': ('The words', 'B18 · One name per button job'), 'B18.1': ('Round 2', 'B18.1 · One size for Reset'),
         'B18.2': ('Round 2', 'B18.2 · The i at the end of its row')}


def cards_html():
    out, last = [], None
    for i, c in enumerate(CARDS):
        if c[1] != last:
            kick, name = PARTS[c[1]]
            out.append('<h2 class="part"><span>%s</span>%s</h2>' % (e(kick), e(name)))
            last = c[1]
        out.append(card(i, c))
    return '\n'.join(out)


def unit_card(u):
    uid, name, covers = u
    opts = ''.join('<label class="opt"><input type="radio" name="u-%s" value="%s" id="u-%s-%s"> %s</label>' % (uid, v, uid, v, w)
                   for v, w in (('accept', 'Accept'), ('revise', 'Revise'), ('remove', 'Remove')))
    return ('<div class="unit" id="c-unit-%s"><p class="uname">%s</p><p class="meta">Covers %s.</p><div class="opts">%s</div>'
            '<div class="notewrap"><label for="n-unit-%s">What to change (optional)</label><textarea id="n-unit-%s" rows="1"></textarea></div>'
            '<p class="saved" id="sv-unit-%s"></p></div>') % (uid, e(name), e(covers), opts, uid, uid, uid)


tmpl = io.open(os.path.join(HERE, 'checklist-template.html'), encoding='utf-8').read()
page = (tmpl.replace('{{PREVIEW}}', e(PREVIEW)).replace('{{LIVE}}', e(LIVE)).replace('{{BOARD}}', e(BOARD)).replace('{{BUILD}}', e(BUILD[:8] + '…' + BUILD[-4:]))
        .replace('{{TOTAL}}', str(len(CARDS))).replace('{{CARDS}}', cards_html())
        .replace('{{UNITS}}', '\n'.join(unit_card(u) for u in UNITS))
        .replace('{{IDS}}', json.dumps([{'id': c[0], 'unit': c[1], 'title': c[2]} for c in CARDS], ensure_ascii=False).replace('<', '\\u003c'))
        .replace('{{UNITIDS}}', json.dumps([{'id': u[0], 'title': u[1]} for u in UNITS], ensure_ascii=False).replace('<', '\\u003c')))
assert '{{' not in page
io.open(os.path.join(HERE, 'device-checks.html'), 'w', encoding='utf-8', newline='\n').write(page)

md = ['# B18 group · device round', '', 'Written by Claude on 26 November 2026. **Nothing is live.**', '',
      '- **The owner’s checklist** is a private artifact, [B18 Device Checks](https://claude.ai/artifact/PaVBJfu4N4j5KKKEMkgdfJ) (one card per change; Pass / Fail / Not run on the iPhone and on the laptop, a note; Accept / Revise / Remove for each unit). Answers save on the page (collection `answers`).',
      '- **This file** mirrors its checks. The owner’s results are recorded here, verbatim, when they come.', '',
      '| Site | What it has |', '|---|---|',
      '| %s | Group 2 as live, plus B18, B18.1 and B18.2 (application `%s`) |' % (PREVIEW, BUILD), '| %s | Live, to compare with |' % LIVE, '']
for i, c in enumerate(CARDS):
    cid, unit, title, where, steps, now, after, optional = c
    md += ['## %d. %s · %s%s' % (i + 1, unit, title, ' (optional)' if optional else ''), '', '**Where:** ' + where, '']
    md += ['%d. %s' % (k + 1, s) for k, s in enumerate(steps)]
    md += ['', 'Live: %s → preview: **%s**' % (now, after), '']
md += ['## The units', '']
md += ['- **%s** (%s): Accept / Revise / Remove.' % (n, cov) for _, n, cov in UNITS]
io.open(os.path.join(HERE, '..', '..', 'DEVICE-CHECKS.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(md) + '\n')
print('wrote', len(CARDS), 'cards')
