"""Pinned negative proofs for Phase 14.3a (Part K); sequential, each must run all 32 checks."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '65fb705'  # main at the start of Cycle 1: 3,800,283 bytes, 7b68f34d...
TOTAL = 32
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
pages = ['REF143-SKILLS-COVERAGE', 'REF143-SKILLS-LIST-PAGES', 'REF143-SKILLS-DETAIL-PAGES', 'REF143-SKILLS-LOOKUP',
         'REF143-WEAPONS-COVERAGE', 'REF143-WEAPONS-LIST-PAGES', 'REF143-WEAPONS-DETAIL-PAGES', 'REF143-WEAPONS-LOOKUP',
         'REF143-SPELLS-COVERAGE', 'REF143-SPELLS-LIST-PAGES', 'REF143-SPELLS-DETAIL-PAGES', 'REF143-SPELLS-LOOKUP']
ui = ['REF143-NORMALISED-LOOKUP', 'REF143-BOOK-SEARCH', 'REF143-PAGE-SEARCH', 'REF143-COPY-ISOLATION', 'REF143-UI-SKILL-LIST',
      'REF143-UI-SKILL-DETAIL', 'REF143-UI-WEAPON-DETAIL', 'REF143-WIDTH-320', 'REF143-WIDTH-390']
# Without the interface, the unfound and unknown-lookup checks also prove the layer is missing.
fix = ['REF143-SWITCH'] + pages + ui + ['REF143-UNFOUND-STAYS-UNCITED', 'REF143-NO-GUESSED-PAGES']
cases = [
    ('disabled', 'const SEARCH_REFERENCES_143_ENABLED = true;', 'const SEARCH_REFERENCES_143_ENABLED = false;', ['REF143-SWITCH'] + pages + ui),
    ('pdf-page-instead-of-printed', '"Kenjutsu": "Core Rulebook p.141"', '"Kenjutsu": "Core Rulebook p.144"',
     ['REF143-SKILLS-LIST-PAGES', 'REF143-SKILLS-DETAIL-PAGES', 'REF143-SKILLS-LOOKUP', 'REF143-PAGE-SEARCH', 'REF143-COPY-ISOLATION',
      'REF143-UI-SKILL-LIST', 'REF143-UI-SKILL-DETAIL']),
    ('wrong-book', '"Pistol": "Imperial Histories 1 p.97"', '"Pistol": "Imperial Histories 2 p.97"',
     ['REF143-WEAPONS-LIST-PAGES', 'REF143-WEAPONS-DETAIL-PAGES', 'REF143-WEAPONS-LOOKUP', 'REF143-BOOK-SEARCH', 'REF143-UI-WEAPON-DETAIL']),
    ('missing-spell', '"Ever-Changing Waves": "Core Rulebook p.191",', '"Ever-Changing Waves": "",',
     ['REF143-SPELLS-COVERAGE', 'REF143-SPELLS-LIST-PAGES', 'REF143-SPELLS-DETAIL-PAGES', 'REF143-SPELLS-LOOKUP',
      'REF143-WIDTH-320', 'REF143-WIDTH-390']),
    ('missing-arrow-hook', "source: typeof SEARCHREF143 !== 'undefined' ? SEARCHREF143.source('weapons', a.name) : '',", "source: '',",
     ['REF143-WEAPONS-COVERAGE', 'REF143-WEAPONS-LIST-PAGES', 'REF143-WEAPONS-DETAIL-PAGES']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body, want):
    with tempfile.TemporaryDirectory(prefix='l5r-ref143-negative-') as folder:
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
