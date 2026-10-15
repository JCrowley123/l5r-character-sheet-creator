"""Pinned negative proofs for Phase 14.3b (Part K); sequential, each must run all 40 checks."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = 'a40ab39'  # main at the start of Cycle 2: 3,843,210 bytes, 14711d4f...
TOTAL = 40
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
cats = ['SCHOOLS', 'TECHNIQUES', 'CLANS', 'FAMILIES']
pages = ['REF1432-' + c + '-' + k for c in cats for k in ('COVERAGE', 'LIST-PAGES', 'DETAIL-PAGES', 'LOOKUP')]
data = ['REF1432-SCHOOL-DETAIL-NOTES', 'REF1432-SHARED-TECHNIQUE', 'REF1432-SAME-NAME-FAMILIES', 'REF1432-RETITLED-ENTRIES',
        'REF1432-NORMALISED-LOOKUP', 'REF1432-BOOK-SEARCH', 'REF1432-PAGE-SEARCH', 'REF1432-COPY-ISOLATION']
ui = ['REF1432-UI-SCHOOL-LIST', 'REF1432-UI-SCHOOL-DETAIL', 'REF1432-UI-TECHNIQUE-DETAIL', 'REF1432-UI-CLAN-DETAIL',
      'REF1432-UI-FAMILY-DETAIL', 'REF1432-WIDTH-320', 'REF1432-WIDTH-390']
# Without the interface, the unknown-lookup check also proves the layer is missing.
fix = ['REF1432-SWITCH'] + pages + data + ui + ['REF1432-NO-GUESSED-PAGES']
no_lookups = ['REF1432-' + c + '-LOOKUP' for c in cats]
cases = [
    ('disabled', 'const SEARCH_REFERENCES_1432_ENABLED = true;', 'const SEARCH_REFERENCES_1432_ENABLED = false;',
     [x for x in fix if x != 'REF1432-NO-GUESSED-PAGES']),
    ('pdf-page-instead-of-printed', '"Agasha Shugenja": "Core Rulebook p.125"', '"Agasha Shugenja": "Core Rulebook p.128"',
     ['REF1432-SCHOOLS-LIST-PAGES', 'REF1432-SCHOOLS-DETAIL-PAGES', 'REF1432-SCHOOLS-LOOKUP', 'REF1432-NORMALISED-LOOKUP',
      'REF1432-COPY-ISOLATION', 'REF1432-UI-SCHOOL-LIST', 'REF1432-UI-SCHOOL-DETAIL']),
    ('wrong-book', '"Ronin|Tsi": "Imperial Histories 1 p.275"', '"Ronin|Tsi": "Imperial Histories 2 p.275"',
     ['REF1432-FAMILIES-LIST-PAGES', 'REF1432-FAMILIES-DETAIL-PAGES', 'REF1432-FAMILIES-LOOKUP', 'REF1432-SAME-NAME-FAMILIES']),
    ('family-from-other-clan', '"Fox|Kitsune": "Core Rulebook p.219"', '"Fox|Kitsune": "Core Rulebook p.120"',
     ['REF1432-FAMILIES-LIST-PAGES', 'REF1432-FAMILIES-DETAIL-PAGES', 'REF1432-FAMILIES-LOOKUP', 'REF1432-SAME-NAME-FAMILIES',
      'REF1432-NORMALISED-LOOKUP', 'REF1432-UI-FAMILY-DETAIL']),
    ('missing-school', '"Lion Elite Spearmen [Bushi]": "Naishou Province p.7",', '"Lion Elite Spearmen [Bushi]": "",',
     ['REF1432-SCHOOLS-COVERAGE', 'REF1432-SCHOOLS-LIST-PAGES', 'REF1432-SCHOOLS-DETAIL-PAGES', 'REF1432-SCHOOLS-LOOKUP',
      'REF1432-WIDTH-320', 'REF1432-WIDTH-390']),
    ('missing-technique-hook', "t.source = SCHOOLREF1432.source('techniques', name, s.name);", "t.source = '';",
     ['REF1432-TECHNIQUES-COVERAGE', 'REF1432-TECHNIQUES-LIST-PAGES', 'REF1432-TECHNIQUES-DETAIL-PAGES', 'REF1432-SCHOOL-DETAIL-NOTES',
      'REF1432-SHARED-TECHNIQUE', 'REF1432-COPY-ISOLATION', 'REF1432-UI-SCHOOL-DETAIL', 'REF1432-UI-TECHNIQUE-DETAIL']),
    ('missing-record-hook', 'rec.source = SCHOOLREF1432.recordSource(rec);', "rec.source = '';",
     [p for p in pages if p not in no_lookups and not p.startswith('REF1432-TECHNIQUES')] +
     ['REF1432-SAME-NAME-FAMILIES', 'REF1432-PAGE-SEARCH', 'REF1432-COPY-ISOLATION', 'REF1432-UI-SCHOOL-LIST', 'REF1432-UI-SCHOOL-DETAIL',
      'REF1432-UI-CLAN-DETAIL', 'REF1432-UI-FAMILY-DETAIL', 'REF1432-WIDTH-320', 'REF1432-WIDTH-390']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body, want):
    with tempfile.TemporaryDirectory(prefix='l5r-ref1432-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'references-harness.js'), str(page)], capture_output=True, text=True,
                           encoding='utf-8', timeout=300)
    text = r.stdout + r.stderr
    (out / (label + '.log')).write_bytes(text.encode('utf-8'))
    failed = re.findall(r'^FAIL (\S+)', text, re.M)
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    got = list(map(int, counts[-1])) if counts else []
    case = {'id': label, 'expected_failures': want, 'actual_failures': failed, 'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    assert r.returncode == 1 and got == [TOTAL - len(want), TOTAL] and sorted(failed) == sorted(want), case
    print(label + ': failed exactly ' + str(len(want)) + ' pinned checks', flush=True)


baseline = subprocess.check_output(['git', 'show', PREDECESSOR + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'],
                                   cwd=V.parent).decode('utf-8')
run('baseline', baseline, fix)
for label, old, new, want in cases:
    assert original.count(old) == 1, (label, 'mutation is not unique')
    run(label, original.replace(old, new), want)
report['passed'] = True
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.')
