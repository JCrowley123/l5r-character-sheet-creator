"""B18 board, round 2: the two looks the owner asked for on the Reset card (25 November 2026).
   python -X utf8 build_round2.py <pictures folder> <out.html> [--quality 76]
Reads <pictures>/cards-r2.json and the close-ups cards-r2.cjs wrote, and round2-template.html beside this file, and
writes one HTML page with the pictures embedded as WebP (Pillow; scaled to 640 px wide at most). Answers save in the
board's `answers` collection as `size`, `iright` and `NOTE2`. Every value read from the sheet is escaped."""
import base64, html, io, json, pathlib, sys
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
args = sys.argv[1:]
quality = 76
if '--quality' in args:
    i = args.index('--quality'); quality = int(args[i + 1]); del args[i:i + 2]
src, out = pathlib.Path(args[0]), pathlib.Path(args[1])
R = json.loads((src / 'cards-r2.json').read_text(encoding='utf-8'))
E = lambda s: html.escape(str(s), quote=True)
count = [0]

APPROVE = [('approve', 'Approve'), ('change', 'Change it'), ('keep', 'Keep as now')]
CARDS = [
 {'id': 'size', 'group': 'G01-size', 'title': 'Every Reset button is the same size',
  'where': 'All 8 Reset buttons: Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky, the Ancestor card and the Combat round counter.',
  'lines': ['One look for all: 28 px tall, the same height as the i beside it, in capitals like Change and Choose… on the same cards.',
            'Today they are 19 to 32 px tall, some in capitals and some not. The four smallest are under the 24 px a button needs to be easy to tap on a phone.',
            'The buttons on the same row take the same look: Great Destiny’s Use, Unlucky’s − and +, and Next round beside the Combat round counter’s Reset.',
            'Rows with today’s four smallest Resets (Kharmic Tie, Luck, Great Destiny, Haunted) get 8 or 9 px taller.'],
  'options': [('approve', 'Approve'), ('nocaps', 'Approve, but not in capitals'), ('change', 'Change it'), ('keep', 'Keep as now')]},
 {'id': 'iright', 'group': 'G12-place', 'title': 'The i always sits at the right end of its row',
  'where': 'Every Advantage and Disadvantage card with an i: Luck, Dark Paragon, Seven Fortunes’ Curse, and the cards that still need a choice (Manage). Kharmic Tie already has it there.',
  'lines': ['On a laptop, Luck’s i sits in the middle of the card today.',
            'The i’s in the Skills list and beside a heading (Void Points, Kiho rules) stay where they are. Each already sits in its own fixed place.',
            'In Manage, where Change sits is left as it is. That is part of A04.2’s row layout, after the rules read.']},
]
ROUND1 = ['<b>19 changes approved</b>, with the ✕ on a row read as “Remove …”.',
          'Touch of the Void keeps “Keep control (TN 30)”.',
          'B18 is built next, before group 3.',
          'Reset: the word is approved. Your size and i note is this round.']


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
    for i, pl in enumerate(R['cards'][cid]['places'], 1):
        parts.append(f'<div class="place"><p class="pname">{E(pl["name"])}</p><div class="pair">'
                     f'<figure><figcaption class="now">Now</figcaption>{img(f"{cid}-{i}-now.png", pl["name"] + ", now")}</figure>'
                     f'<figure><figcaption class="after">After</figcaption>{img(f"{cid}-{i}-after.png", pl["name"] + ", after")}</figure></div></div>')
    parts.append('<ul class="lines">' + ''.join(f'<li>{E(l)}</li>' for l in card['lines']) + '</ul>')
    parts.append(answer(card) + '</article>')
    return ''.join(parts)


total = len(CARDS)
body = ''.join(card_html(c, n, total) for n, c in enumerate(CARDS, 1))
words = {c['id']: dict(c.get('options', APPROVE)) for c in CARDS}
tpl = (HERE / 'round2-template.html').read_text(encoding='utf-8')
page = (tpl.replace('{{CARDS}}', body).replace('{{TOTAL}}', str(total))
        .replace('{{ROUND1}}', ''.join(f'<li>{r}</li>' for r in ROUND1))
        .replace('{{CAPTURED}}', E(R['captured_utc'][:16].replace('T', ' ') + ' UTC'))
        .replace('{{IDS}}', json.dumps([{'id': c['id'], 'group': c['group'], 'title': c['title']} for c in CARDS], ensure_ascii=False))
        .replace('{{WORDS}}', json.dumps(words, ensure_ascii=False)))
assert '{{' not in page
out.write_text(page, encoding='utf-8', newline='\n')
print(f'{total} cards, {count[0]} pictures; {out} {out.stat().st_size:,} bytes; capture errors {len(R["errors"])}')
