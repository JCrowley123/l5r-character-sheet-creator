#!/usr/bin/env python3
"""B18 stage 1: merges the live read (raw.json) with the static scan (static.json) into one table, one row per control.

A "control" here is one button or button-like thing as the owner meets it: the same label, the same spoken name and the
same look, in one place (a page, a window or a full-screen page). Rows that repeat down a list (twenty skill rows, each
with a roll button) are one row with an instance count. The same control seen on a phone and on a laptop, in Manage and in
Play, is one row that records where it showed.

Usage: python merge.py <raw.json> <static.json> <jobs.py> <out table.json> [dialogs.json] [hidden.json]
  jobs.py defines JOB_RULES (ordered), used to put each row under a job.
"""
import bisect, importlib.util, json, os, re, sys
from collections import defaultdict, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = HERE
while not os.path.exists(os.path.join(ROOT, 'build.py')):
    ROOT = os.path.dirname(ROOT)
SRC = os.path.join(ROOT, 'Versions', 'Part F — Cross-Platform Delivery',
                   'PART F — Phase 0 Source Reorganization for Maintainability', 'src')

GENERIC_CLS = {'ghost', 'print-hide', 'primary', 'rm-btn', 'has-icon', 'dice-btn', 'stepbtn', 'kept', 'filled', 'sev-ok', 'sev-warn', 'sev-danger', 'sev-out'}
SCEN_TITLE = {}  # filled from raw.scenarios

# Controls whose label is the content of a list (a skill's name, a search result): one row, not one row per item.
COLLAPSE = {
    's14-row': '{name of the result}', 's14-cat': '{category name and count}', 'untrained-chip': '{skill name}',
    'other-die-btn': '{die: d20, d12, d100, d10, d8, d6, d4, Coin}', 'ring-name': '{Ring name}', 'stance-tile-btn': '{stance name and Ring}',
    'wound-seg': '(no text: a wound level)', 'spell-pip': '(no text: a pip)', 'spell-bonus-pip': '(no text: a pip)', 'void-pip': '(no text: a pip)',
}
# Not controls: the dice drawn in a roll result carry a pointer cursor but have no click handler (searched in src/).
NOT_CONTROLS = {'roll-die', 'chain'}
STATE_TOKENS = re.compile(r'^(filled|kept|sev-ok|sev-warn|sev-danger|sev-out|spell-pip-(air|earth|fire|water|void)|spell-bonus-pip-(air|earth|fire|water|void))$')


def norm(s):
    return re.sub(r'\s+', ' ', s or '').strip()


# ---------------------------------------------------------------- the source index
class Src:
    def __init__(self):
        self.files = {}
        for dp, dn, fn in os.walk(SRC):
            dn[:] = [d for d in dn if d != 'vendor']
            for f in sorted(fn):
                if f.endswith(('.js', '.html')):
                    p = os.path.join(dp, f)
                    t = open(p, encoding='utf-8', errors='replace').read()
                    starts = [0] + [m.end() for m in re.finditer('\n', t)]
                    self.files[os.path.relpath(p, SRC).replace('\\', '/')] = (t, starts)

    def line(self, rel, pos):
        t, starts = self.files[rel]
        return bisect.bisect_right(starts, pos)

    def find(self, rx, limit=4):
        out = []
        for rel, (t, starts) in self.files.items():
            for m in rx.finditer(t):
                out.append((rel, self.line(rel, m.start())))
                if len(out) >= limit:
                    return out
        return out


def quoted(lit):
    e = re.escape(lit)
    return re.compile(r"""(['"`>])\s*""" + e + r"""\s*(['"`<])""", re.I)


def longest_const(pattern):
    parts = [p.strip() for p in re.split(r'\{[^}]*\}', pattern)]
    parts = [p for p in parts if len(p) >= 4]
    return max(parts, key=len) if parts else ''


def locate(src, row, statics):
    hits = []
    seen = set()

    def add(rel, line, basis):
        k = (rel, line)
        if k not in seen:
            seen.add(k)
            hits.append({'file': rel, 'line': line, 'basis': basis})

    # 1. the id, where it is written into the page
    if row['idAttr'] and not re.match(r'^(car-tab-\d+)$', row['idAttr']):
        e = re.escape(row['idAttr'])
        rx = re.compile(r"""id\s*=\s*["']""" + e + r"""["']|\.id\s*=\s*['"]""" + e + r"""['"]|\bid\s*:\s*['"]""" + e + r"""['"]""")
        for rel, ln in src.find(rx, 2):
            add(rel, ln, 'id')
    # 2. a static candidate, scored: the same id 5, a shared class 3, the same label 1 (a class-less hit counts for its label
    #    only when the file also writes one of this control's classes). Needs 2 points, or 1 when the control has no class.
    lab = norm(row['label']).lower()
    clsset = set(t for t in row['cls'].split('.') if t and t not in GENERIC_CLS)
    scored = []
    for c in statics:
        sl = norm(c['label']).lower()
        sc = set(t for t in re.split(r'[\s.]+', c['cls']) if t)
        score = 0
        if row['idAttr'] and c['id'] == row['idAttr']:
            score += 5
        if clsset & sc:
            score += 3
        if lab and sl == lab:
            if clsset and not sc and any(t in src.files[c['file']][0] for t in clsset):
                score += 2
            else:
                score += 1
        if score >= 2 or (score == 1 and not clsset):
            scored.append((score, c))
    scored.sort(key=lambda x: -x[0])
    if scored and scored[0][0] >= 5:
        scored = [x for x in scored if x[0] >= 5]       # the id names the one place
    for score, c in scored[:5]:
        add(c['file'], c['line'], 'static')
    # 3. the label as a quoted literal
    if not hits and lab and len(lab) >= 2 and not re.fullmatch(r'[\d\s]*', lab):
        found = src.find(quoted(row['label']), 40)
        near = [f for f in found if any(t in src.files[f[0]][0] for t in clsset)] if clsset else []
        for rel, ln in (near or found)[:3]:
            add(rel, ln, 'label')
    # 4. the constant part of the spoken name or title
    if not hits:
        for field in ('spokenPattern', 'titlePattern'):
            c = longest_const(row.get(field, ''))
            if c:
                for rel, ln in src.find(re.compile(re.escape(c)), 2):
                    add(rel, ln, field)
                break
    # 5. a distinctive class where something is created
    if not hits and clsset:
        for t in sorted(clsset, key=len, reverse=True)[:2]:
            rx = re.compile(r"""(class(Name|List\.add)?\s*[=(]\s*['"][^'"\n]*\b""" + re.escape(t) + r"""\b)""")
            for rel, ln in src.find(rx, 2):
                add(rel, ln, 'class')
    return hits[:4]


# ---------------------------------------------------------------- patterns for repeated rows
def pattern_of(values):
    vals = sorted(set(v for v in values if v))
    if len(vals) <= 1:
        return vals[0] if vals else ''
    pre = os.path.commonprefix(vals)
    suf = os.path.commonprefix([v[::-1] for v in vals])[::-1]
    pre = pre[:pre.rfind(' ') + 1] if ' ' in pre else ('' if len(pre) < 3 else pre)
    if suf and not suf.startswith(' '):
        suf = suf[suf.find(' '):] if ' ' in suf else ''
    if not pre and not suf:
        return vals[0] + '  (varies; e.g. ' + ' / '.join(vals[1:3]) + ')'
    return pre + '{…}' + suf


def main(raw_path, static_path, jobs_path, out_path, dialogs_path=None, hidden_path=None):
    raw = json.load(open(raw_path, encoding='utf-8'))
    stat = json.load(open(static_path, encoding='utf-8'))['items']
    spec = importlib.util.spec_from_file_location('jobs', jobs_path)
    J = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(J)
    titles = {s['id']: s['title'] for s in raw['scenarios']}
    # The closed windows of the Search, Library and Characters pages are the same controls the live read already has; a closed
    # window that a live scenario also read is dropped; what is left is a window the test did not bring up.
    live = set((r['window'].lstrip('#'), r['cls'], norm(r['label'])) for r in raw['records'] if r['state'] == 'window')
    kept = []
    for r in raw['records']:
        if r['state'] == 'window-closed' and (r['win'] in ('s14-page', 'l13-root', 'cl11View') or (r['win'], r['cls'], norm(r['label'])) in live):
            continue
        if set(r['cls'].split('.')) & NOT_CONTROLS:
            continue
        r = dict(r)
        r['cls'] = '.'.join(t for t in r['cls'].split('.') if not STATE_TOKENS.match(t))
        if r['cls'] == '' and r['kind'] == 'button' and r['label'] == '' and r['title'] and 'pip' in r['title'].lower():
            r['cls'] = 'pip'
        kept.append(r)
    raw['records'] = kept

    # ----- where a record was read
    def where_of(r):
        if r['state'] == 'tab':
            if r['page']:
                return ('page', r['page'])
            return ('sheet-wide', 'On every page (app bar, tabs, floating buttons, cards that stay)')
        if r['state'] == 'window-closed':
            return ('window (not opened live)', r['win'] or r['window'])
        return ('window', titles.get(r['scenario'], r['scenario']))

    groups = OrderedDict()
    for r in raw['records']:
        wk = where_of(r)
        coll = [COLLAPSE[t] for t in r['cls'].split('.') if t in COLLAPSE]
        key = (wk, r['kind'], r['cls'], r['id'], '#' + coll[0] if coll else norm(r['label']))
        # rows that differ only in a name-specific spoken name stay one row; rows with different fixed spoken names split
        g = groups.setdefault(key, {'recs': [], 'where': wk})
        g['recs'].append(r)

    # merge groups that differ only by a repeated-name label (e.g. a pip with no label), no further collapsing
    src = Src()
    rows = []
    for key, g in groups.items():
        recs = g['recs']
        r0 = recs[0]
        names = set()
        for r in recs:
            if r['card']:
                names.add(r['card'].split(': ', 1)[-1] if ': ' in r['card'] else r['card'])
        modes = sorted(set(r['mode'] for r in recs))
        devs = sorted(set(r['device'] for r in recs))
        per_read = defaultdict(int)
        for r in recs:
            per_read[(r['device'], r['mode'], r['scenario'])] += 1
        sizes = {}
        for d in devs:
            ws = [(r['w'], r['h']) for r in recs if r['device'] == d]
            sizes[d] = max(set(ws), key=ws.count)
        spoken_vals = [r['spoken'] for r in recs]
        title_vals = [r['title'] for r in recs]
        aria_vals = [r['aria'] for r in recs]
        row = {
            'where_kind': g['where'][0], 'where': g['where'][1],
            'kind': r0['kind'], 'idAttr': r0['id'], 'cls': r0['cls'],
            'label': (COLLAPSE[[t for t in r0['cls'].split('.') if t in COLLAPSE][0]] if any(t in COLLAPSE for t in r0['cls'].split('.')) else r0['label']),
            'labelExamples': (sorted(set(norm(r['label']) for r in recs))[:4] if any(t in COLLAPSE for t in r0['cls'].split('.')) else []),
            'labelSrc': r0['labelSrc'],
            'aria': pattern_of(aria_vals), 'title': pattern_of(title_vals),
            'spoken': pattern_of(spoken_vals), 'spokenSrc': sorted(set(r['spokenSrc'] for r in recs)),
            'spokenPattern': pattern_of(spoken_vals), 'titlePattern': pattern_of(title_vals),
            'cards': sorted(names)[:8], 'cardCount': len(names),
            'modes': ['Manage' if m == 'management' else 'Play' for m in modes],
            'devices': devs, 'sizes': sizes,
            'instances': max(per_read.values()),
            'disabledSeen': any(r['disabled'] for r in recs), 'inDisclosure': any(r['inDetails'] for r in recs),
            'floating': any(r['fixed'] for r in recs),
            'visibleLive': any(r['visible'] for r in recs),
        }
        row['mode'] = 'Both' if len(row['modes']) == 2 else row['modes'][0]
        rows.append(row)

    for row in rows:
        row['source'] = locate(src, row, stat)
        row.update(J.classify(row))

    # ----- static candidates the live read did not reach
    # A static candidate is reached when a live row's source line is in the same file within 6 lines of it. A matching
    # label alone does not count: the Library's Cancel is not the sheet's Cancel.
    def covered(c):
        for row in rows:
            for h in row['source']:
                if h['file'] == c['file'] and abs(h['line'] - c['line']) <= 6:
                    return True
        return False
    unreached = [c for c in stat if not covered(c)]

    # ----- the source-only rows, from static_extra.py (written by hand; see that file)
    spec2 = importlib.util.spec_from_file_location('static_extra', os.path.join(HERE, 'static_extra.py'))
    X = importlib.util.module_from_spec(spec2)
    spec2.loader.exec_module(X)
    entries = {}
    for slug, line, e in X.ENTRIES:
        entries[(slug, line)] = [e, False]
    # Controls whose line the live read's rows already sit beside, so no candidate is left over for them.
    for f in getattr(X, 'EXTRA', []):
        entries[(f['file'], f['line'])] = [f, False]
        unreached.append({'file': f['file'], 'line': f['line'], 'label': f['label'], 'cls': '', 'id': '', 'how': 'extra'})
    static_rows, dropped, unmatched_c = [], [], []
    done_lines = set()
    for c in unreached:
        hit = next((k for k in entries if k[0] in c['file'] and k[1] == c['line']), None)
        if hit is None:
            unmatched_c.append(c)
            continue
        if (c['file'], c['line']) in done_lines:
            continue
        done_lines.add((c['file'], c['line']))
        e = entries[hit][0]
        entries[hit][1] = True
        if e.get('drop'):
            dropped.append({'file': c['file'], 'line': c['line'], 'why': e['drop']})
            continue
        for r in (e.get('rows') or [e]):
            f = dict(e)
            f.update(r)
            f.pop('rows', None)
            lab = f.get('label', c['label'])
            spoken = f.get('spoken', '=')
            spoken = lab if spoken == '=' else spoken
            row = {'where_kind': 'source only', 'where': f['where'], 'kind': f.get('kind', 'button'), 'idAttr': '', 'cls': c['cls'] or '',
                   'label': lab, 'labelExamples': [], 'labelSrc': 'source', 'aria': '', 'title': f.get('title', ''), 'spoken': spoken, 'spokenSrc': ['source'],
                   'spokenPattern': spoken, 'titlePattern': f.get('title', ''), 'cards': [], 'cardCount': 0,
                   'modes': [] if f['mode'] == 'unknown' else (['Manage', 'Play'] if f['mode'] == 'Both' else [f['mode']]), 'mode': f['mode'],
                   'devices': [], 'sizes': {}, 'instances': None, 'disabledSeen': False, 'inDisclosure': False, 'floating': False, 'visibleLive': False,
                   'reach': 'source only', 'note': f.get('note', ''),
                   'source': [{'file': c['file'], 'line': c['line'], 'basis': 'static'}]}
            g = f.get('group') or J.classify(row)['group']
            row.update({'group': g, 'job': J.JOB_OF_GROUP[g], 'groupName': J.GROUPS[g][0]})
            static_rows.append(row)
    for row in rows:
        row['reach'] = 'live'
        row['note'] = ''
    rows.extend(static_rows)

    # ----- the words every question or message window is called with (dialog_labels.py)
    n_dialog = 0
    if dialogs_path:
        for d in json.load(open(dialogs_path, encoding='utf-8')):
            lab = d['label']
            role = {'message-ok': 'a message window’s button', 'question-ok': 'a question window’s yes button',
                    'question3-ok': 'a three-way question window’s first button', 'question-cancel': 'a question window’s no button'}[d['role']]
            row = {'where_kind': 'source only', 'where': 'Question or message window: ' + role, 'kind': 'button', 'idAttr': '', 'cls': '', 'label': lab,
                   'labelExamples': [], 'labelSrc': 'source', 'aria': '', 'title': '', 'spoken': lab, 'spokenSrc': ['source'], 'spokenPattern': lab,
                   'titlePattern': '', 'cards': [], 'cardCount': 0, 'modes': [], 'mode': 'varies by caller', 'devices': [], 'sizes': {}, 'instances': d['count'],
                   'disabledSeen': False, 'inDisclosure': False, 'floating': False, 'visibleLive': False, 'reach': 'source only',
                   'note': ('the default word, used when the caller gives none; ' if d['default'] else '') + 'called %d time(s)' % d['count'],
                   'source': [{'file': x.rsplit(':', 1)[0], 'line': int(x.rsplit(':', 1)[1]), 'basis': 'call'} for x in d['sites']],
                   'group': 'G05'}
            row.update({'job': J.JOB_OF_GROUP['G05'], 'groupName': J.GROUPS['G05'][0]})
            rows.append(row)
            n_dialog += 1
    print('dialog words', n_dialog)

    # ----- controls that sit in the page and are never shown (scan-hidden.cjs): hidden in both modes and not already a live row
    n_hidden = 0
    if hidden_path:
        dn = lambda x: re.sub(r'\d+', '{n}', x or '')
        live_keys = set()
        for row in rows:
            live_keys.add(row['idAttr'] or '')
            live_keys.add((row['cls'], dn(row['label']), dn(row['aria'])))
        H = defaultdict(lambda: {'modes': set(), 'devs': set(), 'pages': set(), 'r': None})
        for r in json.load(open(hidden_path, encoding='utf-8'))['records']:
            k = (r['id'], r['cls'], dn(r['label']), dn(r['aria']))
            h = H[k]
            h['modes'].add(r['mode']); h['devs'].add(r['device']); h['pages'].add(r['page']); h['r'] = r
        nx = lambda x: re.sub(r'Honour|Glory|Status|Taint|\{Honour/Glory/Status/Taint\}', 'X', dn(x or '')).strip().lower()
        have = set(nx(r['spoken'] or r['label']) for r in rows if r['reach'] != 'live')
        for k, h in H.items():
            r = h['r']
            if h['modes'] != {'management', 'play'}:
                continue          # hidden in one mode only: a control the other mode shows, already a row
            key = nx(r['aria'] or r['label'])
            if (key in have and not r['id']) or (not r['label'] and not r['aria'] and r['id'] == 'advancedSchoolResume'):
                continue          # described by a hand-read row, a repeat for another stat, or a label that is set later
            have.add(key)
            if (r['id'] and r['id'] in live_keys) or (r['cls'], dn(r['label']), dn(r['aria'])) in live_keys:
                continue
            if r['id'] in ('carPrev', 'carNext', 'scrollTopBtn'):
                continue
            lab = dn(r['label']) if re.fullmatch(r'\d+', r['label'] or '') else r['label']
            spoken = dn(r['aria']) if r['aria'] else lab
            row = {'where_kind': 'in the page, never shown', 'where': (sorted(p for p in h['pages'] if p) or ['(the toolbar)'])[0], 'kind': 'button', 'idAttr': r['id'],
                   'cls': r['cls'], 'label': lab, 'labelExamples': [], 'labelSrc': 'text', 'aria': r['aria'], 'title': r['title'], 'spoken': spoken,
                   'spokenSrc': [r['spokenSrc']], 'spokenPattern': spoken, 'titlePattern': r['title'], 'cards': [], 'cardCount': 0, 'modes': [],
                   'mode': 'hidden in both modes', 'devices': sorted(h['devs']), 'sizes': {}, 'instances': None, 'disabledSeen': False, 'inDisclosure': False,
                   'floating': False, 'visibleLive': False, 'reach': 'hidden in the page', 'note': 'in the page but never shown to a player: dormant or replaced', 'source': []}
            row['source'] = locate(src, row, stat)
            row.update(J.classify(row))
            rows.append(row)
            n_hidden += 1
    print('hidden rows', n_hidden)
    print('source-only rows', len(static_rows), 'dropped (not controls or already live)', len(dropped), 'candidates with no entry', len(unmatched_c),
          'entries that matched nothing', [k for k, v in entries.items() if not v[1]])
    for c in unmatched_c:
        print('  NO ENTRY', c['file'], c['line'], repr(c['label'])[:40], c['cls'][:30])

    for i, row in enumerate(rows, 1):
        row['id'] = 'C%03d' % i
    json.dump({'source_sha256': raw['source_sha256'], 'captured_utc': raw['captured_utc'], 'rows': rows, 'static_dropped': dropped,
               'static_unmatched': unmatched_c,
               'scenarios': raw['scenarios'], 'errors': raw['errors'], 'raw_records': len(raw['records']), 'static_candidates': len(stat)},
              open(out_path, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    by_reach = defaultdict(int)
    for r in rows:
        by_reach[r['reach']] += 1
    print('raw records', len(raw['records']), 'rows', len(rows), dict(by_reach), 'static candidates', len(stat))
    nosrc = [r for r in rows if not r['source']]
    print('rows without a source line', len(nosrc))


if __name__ == '__main__':
    main(*sys.argv[1:7])
