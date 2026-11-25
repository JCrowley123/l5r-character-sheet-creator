"""B18 board, round 1 revised: one card per button change.
   python -X utf8 build_cards.py <cards folder> <out.html> [--quality 76]
Reads <cards>/cards.json and the close-ups cards.cjs wrote, cards_content.py and cards-template.html beside this file,
and writes one HTML page with the pictures embedded as WebP (Pillow; scaled to 640 px wide at most). A card in the
"hear" part shows one picture (the button looks the same) and what a screen reader hears, now and after. Every value
read from the sheet is escaped."""
import base64, html, io, json, pathlib, sys
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import cards_content as C  # noqa: E402

args = sys.argv[1:]
quality = 76
if '--quality' in args:
    i = args.index('--quality'); quality = int(args[i + 1]); del args[i:i + 2]
src, out = pathlib.Path(args[0]), pathlib.Path(args[1])
R = json.loads((src / 'cards.json').read_text(encoding='utf-8'))
E = lambda s: html.escape(str(s), quote=True)
count = [0]


def img(name, alt):
    im = Image.open(src / name).convert('RGB')
    if im.width > 640: im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=quality, method=6); count[0] += 1
    return (f'<img src="data:image/webp;base64,{base64.b64encode(buf.getvalue()).decode("ascii")}" width="{im.width}" '
            f'height="{im.height}" alt="{E(alt)}" loading="lazy">')


def heard(now, after):
    rows = []
    for a, b in zip(now, after):
        if a['spoken'] != b['spoken']:
            rows.append(f'<p class="hear"><span class="k">Heard</span> “{E(a["spoken"])}” <span class="arrow" aria-hidden="true">→</span> '
                        f'<b>“{E(b["spoken"])}”</b></p>')
    return ''.join(rows)


def answer(card):
    opts = card.get('options', C.APPROVE); rec = card.get('rec', 'approve'); cid = card['id']
    btns = ''.join(f'<label class="opt"><input type="radio" name="r-{cid}" id="r-{cid}-{v}" value="{v}"><span>{E(t)}'
                   f'{"<small>Recommended</small>" if v == rec else ""}</span></label>' for v, t in opts)
    return (f'<fieldset class="answer" id="d-{cid}"><legend>Your answer</legend><div class="opts">{btns}</div>'
            f'<div class="notewrap" id="nw-{cid}" hidden><label for="n-{cid}">What should it be instead?</label>'
            f'<textarea id="n-{cid}" rows="2"></textarea></div><p class="saved" id="sv-{cid}" aria-live="polite"></p></fieldset>')


def card_html(card, n, total):
    cid = card['id']; parts = [f'<article class="card {card["part"]}" id="{cid}"><p class="count">Change {n} of {total}</p>'
                               f'<h2>{E(card["title"])}</h2>' + (f'<p class="where"><b>Where:</b> {E(card["where"])}</p>' if card.get('where') else '')]
    data = R['cards'].get(cid)
    if data and not card.get('nopic'):
        for i, pl in enumerate(data['places'], 1):
            nowf, aftf = f'{cid}-{i}-now.png', f'{cid}-{i}-after.png'
            if card['part'] == 'hear':
                parts.append(f'<div class="place"><p class="pname">{E(pl["name"])}</p><div class="pair one"><figure>{img(nowf, pl["name"])}'
                             f'<figcaption>Looks the same before and after</figcaption></figure></div>{heard(pl["now"], pl["after"])}</div>')
            else:
                la, lb = card.get('labels', ('Now', 'After'))
                parts.append(f'<div class="place"><p class="pname">{E(pl["name"])}</p><div class="pair">'
                             f'<figure><figcaption class="now">{E(la)}</figcaption>{img(nowf, pl["name"] + ", " + la)}</figure>'
                             f'<figure><figcaption class="after">{E(lb)}</figcaption>{img(aftf, pl["name"] + ", " + lb)}</figure></div>'
                             f'{heard(pl["now"], pl["after"])}</div>')
    if card.get('lines'):
        parts.append('<ul class="lines">' + ''.join(f'<li>{l}</li>' for l in card['lines']) + '</ul>')
    if card.get('extra'):
        parts.append(f'<p class="xt">{E(card.get("extra_title", "Also"))}</p><div class="tbl"><table><thead><tr><th>Where</th><th>Now</th><th>After</th></tr></thead><tbody>' +
                     ''.join(f'<tr><td>{E(a)}</td><td>{E(b)}</td><td class="af">{E(c)}</td></tr>' for a, b, c in card['extra']) + '</tbody></table></div>')
    parts.append(answer(card) + '</article>')
    return ''.join(parts)


cards = C.CARDS + [C.ORDER]
total = len(cards)
PART = {'see': ('Part 1', 'Changes you can see'), 'hear': ('Part 2', 'Changes you cannot see: only a screen reader or voice control hears them'),
        'ask': ('Part 3', 'Two questions')}
body, toc, last = [], [], None
for n, card in enumerate(cards, 1):
    if card['part'] != last:
        last = card['part']; p, t = PART[last]
        body.append(f'<h2 class="part" id="part-{last}"><span>{p}</span> {E(t)}</h2>')
        toc.append(f'</ol><p class="tp">{p} · {E(t)}</p><ol start="{n}">')
    body.append(card_html(card, n, total))
    toc.append(f'<li><a href="#{card["id"]}">{E(card["title"])}</a> <span class="ans" id="t-{card["id"]}"></span></li>')
toc_html = (''.join(toc) + '</ol>')[5:]
words = {cid: dict(c.get('options', C.APPROVE)) for cid, c in ((c['id'], c) for c in cards)}
tpl = (HERE / 'cards-template.html').read_text(encoding='utf-8')
page = (tpl.replace('{{TOC}}', toc_html).replace('{{CARDS}}', ''.join(body)).replace('{{TOTAL}}', str(total))
        .replace('{{ALREADY}}', ''.join(f'<li>{E(a)}</li>' for a in C.ALREADY)).replace('{{STAYING}}', E(C.STAYING))
        .replace('{{CAPTURED}}', E(R['captured_utc'][:16].replace('T', ' ') + ' UTC'))
        .replace('{{IDS}}', json.dumps([{'id': c['id'], 'group': c['group'], 'title': c['title']} for c in cards], ensure_ascii=False))
        .replace('{{WORDS}}', json.dumps(words, ensure_ascii=False)))
assert '{{' not in page
out.write_text(page, encoding='utf-8', newline='\n')
print(f'{total} cards, {count[0]} pictures; {out} {out.stat().st_size:,} bytes; capture errors {len(R["errors"])}')
