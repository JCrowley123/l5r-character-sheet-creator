"""B18 board, round 3: the owner's two device-round notes (27 November 2026) and the two places the same question reaches.
   python -X utf8 build_round3.py <pictures folder> <out.html> [--quality 76]
Reads <pictures>/cards-r3.json and the pictures cards-r3.cjs wrote, and round3-template.html beside this file, and writes
one HTML page with the pictures embedded as WebP (Pillow; scaled to 640 px wide at most). Answers save in the board's
`answers` collection as `lucki`, `unlucky`, `imbalance`, `emptybar` and `NOTE3`. Every value read from the sheet is escaped."""
import base64, html, io, json, pathlib, sys
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
args = sys.argv[1:]
quality = 76
if '--quality' in args:
    i = args.index('--quality'); quality = int(args[i + 1]); del args[i:i + 2]
src, out = pathlib.Path(args[0]), pathlib.Path(args[1])
R = json.loads((src / 'cards-r3.json').read_text(encoding='utf-8'))
E = lambda s: html.escape(str(s), quote=True)
count = [0]

APPROVE = [('approve', 'Approve'), ('change', 'Change it'), ('keep', 'Keep as now')]
CARDS = [
 {'id': 'lucki', 'group': 'device-note-luck', 'title': 'Luck’s i goes',
  'where': 'Advantages & Disadvantages, the Luck card (in Play and in Manage). Your note on the device checklist.',
  'lines': ['Its window only repeats the button beside it: headed “Reset”, it says “Restore Luck to its per-session maximum”.',
            'It is the only Reset with an i like that. Kharmic Tie’s and Dark Paragon’s i’s say how the Advantage works, and they stay. Great Destiny, Haunted and Unlucky have none.',
            'VoiceOver still reads the button “Reset Luck for a new session”. On a laptop, resting the pointer on Reset still shows that line.']},
 {'id': 'unlucky', 'group': 'device-note-unlucky', 'title': 'Unlucky’s rank window looks like the other rank windows',
  'where': 'Advantages & Disadvantages in Manage: Unlucky’s Choose… (or Change). Your note on the device checklist.',
  'lines': ['Today it is headed “Unlucky”, says its label twice, adds “step 1 of 1”, and has an empty bar under the box.',
            'After, it matches Wealthy’s and Perceived Honor’s windows: “Choose a Rank”, “Unlucky — choose how many Ranks.”, the bold “Rank — 2 XP per rank” over the box, and a note.',
            'The note is the sheet’s own line for Unlucky (Core p.162). “One use per rank” is said there.',
            'Why a box and not Luck’s Rank cards: Luck stops at Rank 3. The book gives Unlucky no top Rank, and the agreed design keeps it open. Wealthy and Perceived Honor have no top Rank either, and they use this box.',
            'What you can choose, and what it costs, do not change.']},
 {'id': 'imbalance', 'group': 'same-question', 'title': 'Elemental Imbalance’s Rank step looks the same',
  'where': 'Advantages & Disadvantages in Manage: Elemental Imbalance’s first step (a Shugenja’s Disadvantage).',
  'lines': ['It is the one other rank window drawn like Unlucky’s today. Its first step takes the same look: “Choose a Rank”, “Elemental Imbalance — choose how many Ranks.”, the bold label over the box.',
            '“step 1 of 2” goes from the top, and the button still says Next. No note is added: it has none today.',
            'The second step (choosing the Element) is left as it is.']},
 {'id': 'emptybar', 'group': 'same-question', 'title': 'The empty bar goes from the other Disadvantage windows',
  'where': 'Every Disadvantage window that has no note, such as Dependant, Antisocial and Elemental Imbalance’s second step.',
  'lines': ['The bar is the window’s message box. It stays hidden until there is a message, such as “Enter a whole number of 1 or greater.”, and then shows as it does today.',
            'Nothing else in these windows changes.']},
]
EARLIER = ['<b>All 24 cards passed</b> on the iPhone and on the laptop.',
           '<b>B18, B18.1 and B18.2: Accept.</b>',
           'Your two notes, on Luck’s i and Unlucky’s rank picker, are the first two cards here.']


def img(name, alt):
    im = Image.open(src / name).convert('RGB')
    if im.width > 640: im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=quality, method=6); count[0] += 1
    return (f'<img src="data:image/webp;base64,{base64.b64encode(buf.getvalue()).decode("ascii")}" width="{im.width}" '
            f'height="{im.height}" alt="{E(alt)}" loading="lazy">')


def answer(card):
    opts = card.get('options', APPROVE); rec = card.get('rec', 'approve'); cid = card['id']
    btns = ''.join(f'<label class="opt"><input type="radio" name="r-{cid}" id="r-{cid}-{v}" value="{v}"><span>{E(t)}'
                   f'{"<small>Recommended</small>" if v == rec else ""}</span></label>' for v, t in opts)
    return (f'<fieldset class="answer" id="d-{cid}"><legend>Your answer</legend><div class="opts">{btns}</div>'
            f'<div class="notewrap" id="nw-{cid}" hidden><label for="n-{cid}">What should it be instead?</label>'
            f'<textarea id="n-{cid}" rows="2"></textarea></div><p class="saved" id="sv-{cid}" aria-live="polite"></p></fieldset>')


def card_html(card, n, total):
    cid = card['id']
    parts = [f'<article class="card see" id="{cid}"><p class="count">Change {n} of {total}</p><h2>{E(card["title"])}</h2>'
             f'<p class="where"><b>Where:</b> {E(card["where"])}</p>']
    for pl in R['cards'][cid]['places']:
        f = pl['files']
        if 'after' in f:
            parts.append(f'<div class="place"><p class="pname">{E(pl["name"])}</p><div class="pair">'
                         f'<figure><figcaption class="now">Now</figcaption>{img(f["now"], pl["name"] + ", now")}</figure>'
                         f'<figure><figcaption class="after">After</figcaption>{img(f["after"], pl["name"] + ", after")}</figure></div></div>')
        else:
            parts.append(f'<div class="place"><p class="pname">{E(pl["name"])}</p><div class="pair one">'
                         f'<figure><figcaption>For comparison</figcaption>{img(f["now"], pl["name"])}</figure></div></div>')
    parts.append('<ul class="lines">' + ''.join(f'<li>{E(l)}</li>' for l in card['lines']) + '</ul>')
    parts.append(answer(card) + '</article>')
    return ''.join(parts)


assert not R['errors'], R['errors']
total = len(CARDS)
body = ''.join(card_html(c, n, total) for n, c in enumerate(CARDS, 1))
words = {c['id']: dict(c.get('options', APPROVE)) for c in CARDS}
tpl = (HERE / 'round3-template.html').read_text(encoding='utf-8')
page = (tpl.replace('{{CARDS}}', body).replace('{{TOTAL}}', str(total))
        .replace('{{EARLIER}}', ''.join(f'<li>{r}</li>' for r in EARLIER))
        .replace('{{CAPTURED}}', E(R['captured_utc'][:16].replace('T', ' ') + ' UTC'))
        .replace('{{IDS}}', json.dumps([{'id': c['id'], 'group': c['group'], 'title': c['title']} for c in CARDS], ensure_ascii=False))
        .replace('{{WORDS}}', json.dumps(words, ensure_ascii=False)))
assert '{{' not in page
out.write_text(page, encoding='utf-8', newline='\n')
print(f'{total} cards, {count[0]} pictures; {out} {out.stat().st_size:,} bytes; capture errors {len(R["errors"])}')
