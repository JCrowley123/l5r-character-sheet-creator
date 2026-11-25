"""B18 mock-up board builder.
   python -X utf8 build_board.py <shots folder> <out.html> [--quality 72]
Reads <shots>/reproduction.json and the pictures repro.cjs wrote, and content.py beside this file, and writes one HTML
page with every picture embedded as WebP (Pillow). A scene whose today and after pictures are byte-identical (the
change is in the spoken name only) is shown once. Phone pictures are scaled to 560 px wide, laptop ones to 1000 px at
most; the PNGs stay the evidence. Every value read from the sheet is escaped."""
import base64, html, io, json, pathlib, sys
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import content as C  # noqa: E402

args = sys.argv[1:]
quality = 72
if '--quality' in args:
    i = args.index('--quality'); quality = int(args[i + 1]); del args[i:i + 2]
shots, out = pathlib.Path(args[0]), pathlib.Path(args[1])
R = json.loads((shots / 'reproduction.json').read_text(encoding='utf-8'))
E = lambda s: html.escape(str(s), quote=True)
cache = {}


def uri(name, phone):
    if name in cache: return cache[name]
    img = Image.open(shots / name).convert('RGB')
    limit = 560 if phone else 1000
    if img.width > limit:
        img = img.resize((limit, round(img.height * limit / img.width)), Image.LANCZOS)
    buf = io.BytesIO(); img.save(buf, 'WEBP', quality=quality, method=6)
    cache[name] = ('data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode('ascii'), img.width, img.height)
    return cache[name]


def same(scene, dev):
    a, b = shots / f'{scene}-{dev}-today.png', shots / f'{scene}-{dev}-after.png'
    return a.read_bytes() == b.read_bytes()


def css_h(scene, dev, state):
    im = Image.open(shots / f'{scene}-{dev}-{state}.png')
    return round(im.height / (2 if dev == 'phone' else 1))


def fig(scene, dev, state, label):
    src, w, h = uri(f'{scene}-{dev}-{state}.png', dev == 'phone')
    cls = {'today': 't', 'after': 'n', 'same': 's'}[label[0]]
    return (f'<figure class="{dev}"><img src="{src}" width="{w}" height="{h}" loading="lazy" alt="{E(label[1])}">'
            f'<figcaption><span class="{cls}">{E(label[1])}</span></figcaption></figure>')


def pictures(scene):
    outp = []
    for dev, dname in (('phone', 'Phone, 375 px'), ('laptop', 'Laptop, 1440 px')):
        if dev not in R or scene not in R[dev]: continue
        if same(scene, dev):
            outp.append(f'<div class="pics one {dev}">' + fig(scene, dev, 'today', ('same', f'{dname}: today and after look the same')) + '</div>')
        else:
            dh = css_h(scene, dev, 'after') - css_h(scene, dev, 'today')
            note = '' if dh == 0 or dev == 'laptop' and abs(dh) < 2 else (f' (the frame is {abs(dh)} px {"taller" if dh > 0 else "shorter"})')
            outp.append(f'<div class="pics two {dev}">' + fig(scene, dev, 'today', ('today', f'{dname}: today')) +
                        fig(scene, dev, 'after', ('after', f'{dname}: after{note}')) + '</div>')
    return ''.join(outp)


def readings(scene):
    rec = R.get('laptop', {}).get(scene) or R.get('phone', {}).get(scene)
    if not rec or not rec.get('today'): return ''
    rows = []
    for a, b in zip(rec['today'], rec.get('after') or rec['today']):
        wa, wb = a.get('words', a['visible']), b.get('words', b['visible'])
        cw = ' class="ch"' if wa != wb else ''
        cs = ' class="ch"' if a['spoken'] != b['spoken'] else ''
        status = 'changes' if (wa != wb or a['spoken'] != b['spoken']) else 'as now'
        rows.append(f'<tr><td class="num"><span class="disc">{a["n"]}</span></td><td>{E(a.get("where") or "")}</td>'
                    f'<td>{E(wa)}</td><td{cw}>{E(wb)}</td><td>{E(a["spoken"])}</td><td{cs}>{E(b["spoken"])}</td><td class="st">{status}</td></tr>')
    return ('<div class="tbl"><table class="reads"><thead><tr><th>#</th><th>On</th><th>Words today</th><th>Words after</th>'
            '<th>Read aloud today</th><th>Read aloud after</th><th></th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table></div>')


def scene_block(scene, caption):
    return (f'<div class="scene"><p class="cap">{E(caption)}</p>' + pictures(scene) + readings(scene) + '</div>')


def more_table(title, rows):
    if not rows: return ''
    body = ''.join(f'<tr><td>{a}</td><td>{b}</td><td class="ch">{c}</td></tr>' for a, b, c in rows)
    return (f'<h3>{title}</h3><div class="tbl"><table class="more"><thead><tr><th>Where</th><th>Today</th><th>After</th></tr></thead>'
            f'<tbody>{body}</tbody></table></div>')


WINDOWS = [
 ('Close', 'Dice tray, Roll result, a Skill’s i, Untrained Skills, an Advantage’s or stance’s i window (and Hotei, Dark Paragon, Ancestors, TN &amp; Initiative, Attack &amp; Damage), Why can’t I cast this?, Add spell scroll, Add Arrows, Void Points, a wound level, the Library reader’s side panel'),
 ('Close notice', 'The shared message window when it shows a message (Kiho rules, Affinity, Deficiency, Weapon Info and every other notice)'),
 ('Cancel', 'Roll preview (and Check Taint growth, Roll Initiative), Choose… and Change windows, Cast a spell, choosing a hand, an arrow, a range, an Affinity or a Deficiency'),
 ('Cancel question', 'The shared message window when it asks a question (the favour badge, Delete, …)'),
 ('As now', 'Quick Access (“Close”) and History (“Close History”) already say it'),
]


def decision(g, opts=None, rec=None):
    gid = g['id']; rec = rec or g['rec']
    opts = opts or [('approve', 'Approve'), ('revise', 'Revise'), ('leave', 'Leave as now')]
    lab = ''.join(f'<label class="opt"><input type="radio" name="r-{gid}" id="r-{gid}-{v}" value="{v}"><span>{t}'
                  f'{"<small>my recommendation</small>" if v == rec else ""}</span></label>' for v, t in opts)
    return (f'<fieldset class="decide" id="d-{gid}"><legend>Your answer for {gid}</legend><div class="opts">{lab}</div>'
            f'<label class="nl" for="n-{gid}">A note (say what to change if you choose Revise)</label>'
            f'<textarea id="n-{gid}" rows="2"></textarea><p class="saved" id="sv-{gid}" aria-live="polite"></p></fieldset>')


REC_WORD = {'approve': 'Approve', 'leave': 'Leave as now', 'revise': 'Revise'}
parts = []
toc = []
for g in C.GROUPS:
    gid = g['id']
    toc.append(f'<tr><td><a href="#{gid.lower()}">{gid}</a></td><td>{E(g["title"])}</td><td>{E(g["ruling"])}</td><td>{REC_WORD[g["rec"]]}</td>'
               f'<td class="ans" id="sum-{gid}">—</td></tr>')
    s = [f'<section id="{gid.lower()}"><span class="tag">{gid} · ruled 24 November: “{E(g["ruling"])}”</span><h2>{E(g["title"])}</h2>']
    if g.get('special') == 'g03':
        G = C.G03
        s.append(f'<p>{G["intro"]}</p><div class="opts3">')
        for k, t, rec, txt in G['options']:
            s.append(f'<div class="o3{" rec" if rec else ""}"><b>Option {k}. {t}</b>{"<span class=pill>my recommendation</span>" if rec else ""}<p>{txt}</p></div>')
        s.append(f'</div><p class="why"><b>Why A.</b> {G["why"]}</p>')
        s.append('<h3>Every place it touches</h3><div class="tbl"><table class="more"><thead><tr><th>Where</th><th>Control</th><th>Today</th>'
                 '<th>A · your suggestion</th><th>B · Delete for everything</th></tr></thead><tbody>' +
                 ''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td><td class="ch">{d}</td><td>{e}</td></tr>' for a, b, c, d, e in G['places']) +
                 '</tbody></table></div>')
        s.append('<h3>How it looks: today beside Option A</h3>')
        for sc, cap in G['scenes']:
            if sc == 'court-window-delete':
                s.append('<h3>Option B only</h3>')
            s.append(scene_block(sc, cap))
        s.append(decision(g, [('approve', 'Approve A (your suggestion)'), ('delete', 'B: Delete for everything'),
                               ('revise', 'Revise'), ('leave', 'C: Leave as now')], 'approve'))
    else:
        s.append('<ul class="what">' + ''.join(f'<li>{w}</li>' for w in g['what']) + '</ul>')
        if g.get('a042'):
            s.append('<div class="note"><b>The layout goes with A04.2.</b><p>B18 changes only the word and what it is read aloud as. '
                     'Where Reset sits on each card (A04.2’s row: the badge, then Change, then one i) is A04.2’s job, which is parked '
                     'for the rules read pass. Until then the cards keep today’s layout, as in the pictures.</p></div>')
        for sc, cap in g['scenes']:
            s.append(scene_block(sc, cap))
        if g.get('windows'):
            s.append('<h3>Every corner ✕, by window</h3><div class="tbl"><table class="more"><thead><tr><th>Read aloud after</th><th>Windows</th></tr></thead><tbody>' +
                     ''.join(f'<tr><td class="ch">{a}{" {window}" if a in ("Close", "Cancel") else ""}</td><td>{b}</td></tr>' for a, b in WINDOWS) + '</tbody></table></div>')
        s.append(more_table(g.get('more_title', 'Also changes'), g.get('more', [])))
        if g.get('notes'):
            s.append('<ul class="notes">' + ''.join(f'<li>{n}</li>' for n in g['notes']) + '</ul>')
        if g.get('special') == 'g11':
            s.append(f'<p class="why"><b>My recommendation: Leave as now.</b> {C.G11_OPTIONS}</p>')
        s.append(decision(g))
    s.append('</section>')
    parts.append(''.join(s))

left = ''.join(f'<li><b>{a} · {E(b)}.</b> {E(c)}</li>' for a, b, c in C.LEFT_ALONE)
O = C.ORDER
order_opts = ''.join(f'<label class="opt"><input type="radio" name="r-ORDER" id="r-ORDER-{v}" value="{v}"><span>{t}'
                     f'{"<small>my recommendation</small>" if rec else ""}</span></label>' for v, t, rec in O['options'])
phone_err = sum(len(v.get('todayErrors', [])) + len(v.get('afterErrors', [])) for d in ('phone', 'laptop') for v in R.get(d, {}).values() if isinstance(v, dict))
runs = sum(2 for d in ('phone', 'laptop') for v in R.get(d, {}).values() if isinstance(v, dict))

tpl = (HERE / 'board-template.html').read_text(encoding='utf-8')
page = (tpl.replace('{{TOC}}', ''.join(toc)).replace('{{GROUPS}}', ''.join(parts)).replace('{{LEFT}}', left)
        .replace('{{ORDER_Q}}', E(O['question'])).replace('{{ORDER_CTX}}', O['context']).replace('{{ORDER_OPTS}}', order_opts)
        .replace('{{ORDER_WHY}}', O['why']).replace('{{MAIN}}', C.LIVE['main']).replace('{{SHA}}', C.LIVE['sha'])
        .replace('{{BYTES}}', C.LIVE['bytes']).replace('{{RUNS}}', str(runs)).replace('{{ERRORS}}', str(phone_err))
        .replace('{{CAPTURED}}', E(R['captured_utc'][:16].replace('T', ' ') + ' UTC'))
        .replace('{{IDS}}', json.dumps([g['id'] for g in C.GROUPS] + ['ORDER'])))
assert '{{' not in page, page[page.index('{{'):page.index('{{') + 40]
out.write_text(page, encoding='utf-8', newline='\n')
print(f'{len(cache)} pictures; {out} {out.stat().st_size:,} bytes; page errors in the runs: {phone_err} of {runs} runs')
