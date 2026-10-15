"""Pinned negative proofs for BUGFIX — Printed Weapon Columns. Each variant changes one thing in the candidate build and
must fail exactly its pinned checks while running all 17; every rule and step of the release is pinned by at least one.
--discover runs them and prints the failures without asserting. Runs three at a time; logs go to qa/negative/."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '993d14a'  # main before this release: 3,833,345 bytes, c3b20fbe...
TOTAL = 17
DISCOVER = '--discover' in sys.argv
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
LAYOUT = ['PWC-NO-SCROLLER', 'PWC-TABLE-WITHIN-PAGE', 'PWC-NAME-WHOLE-WORDS', 'PWC-NOTES-WHOLE-WORDS', 'PWC-SHORT-VALUES-FIT',
          'PWC-SHORT-COLUMNS-TIGHT', 'PWC-WEAPON-NOTES-TAKE-THE-REST']
FIX = ['PWC-SWITCH', 'PWC-IDEMPOTENT', 'PWC-RESTORE-CLEANS-COPIES'] + LAYOUT
TOO_WIDE = ['PWC-TABLE-WITHIN-PAGE', 'PWC-NOTES-WHOLE-WORDS', 'PWC-WEAPON-NOTES-TAKE-THE-REST']
# (label, text in the candidate, replacement, pinned failures)
cases = [
    ('disabled', 'const PRINTED_WEAPON_COLUMNS_ENABLED = true;', 'const PRINTED_WEAPON_COLUMNS_ENABLED = false;', FIX),
    # A4 and Letter keep the sideways scroller.
    ('scroller-kept', '.car-hscroll:has(> #weaponsTable){ overflow:visible !important; }', '.car-hscroll:has(> #weaponsTable){ }',
     ['PWC-NO-SCROLLER']),
    # The tablet band's 720 px floor pushes the table past A4 and Letter.
    ('screen-floor-kept', '#weaponsTable{ min-width:0 !important; }', '#weaponsTable{ }', TOO_WIDE),
    # At phone widths the cells lose their side padding: neighbouring write-in lines touch.
    ('phone-padding-kept', '    html.pwc-enabled #weaponsTable th,\n    html.pwc-enabled #weaponsTable td{\n      padding-left:4px',
     '    html.pwc-enabled #weaponsTable .no-such-th,\n    html.pwc-enabled #weaponsTable .no-such-td{\n      padding-left:4px',
     ['PWC-SHORT-VALUES-FIT', 'PWC-SHORT-COLUMNS-TIGHT']),
    ('short-not-shrunk', '      width:1% !important;\n      white-space:nowrap;', '      white-space:nowrap;', ['PWC-SHORT-COLUMNS-TIGHT']),
    # "Heavy Weapons" breaks onto two lines.
    ('short-values-wrap', '      width:1% !important;\n      white-space:nowrap;', '      width:1% !important;', ['PWC-SHORT-VALUES-FIT']),
    ('remove-column-kept', '    html.pwc-enabled #weaponsTable tr > :last-child{', '    html.pwc-enabled #weaponsTable tr > .no-such-cell{',
     ['PWC-SHORT-COLUMNS-TIGHT']),
    ('fields-shown', '#weaponsBody .pwc-text-source{ display:none !important; }', '#weaponsBody .no-such-source{ display:none !important; }',
     TOO_WIDE + ['PWC-SHORT-VALUES-FIT', 'PWC-SHORT-COLUMNS-TIGHT']),
    # A blank value loses its write-in line.
    ('no-blank-line', '      display:inline-block !important;\n      min-width:2em;\n', '      display:inline-block !important;\n',
     ['PWC-SHORT-VALUES-FIT']),
    ('inline-copies', '      display:inline-block !important;\n      min-width:2em;\n', '      display:inline !important;\n      min-width:2em;\n',
     ['PWC-SHORT-VALUES-FIT']),
    # Printed Weapon Text's own overflow-wrap:anywhere returns.
    ('breaks-inside-words', '      overflow-wrap:break-word !important;\n      word-break:normal !important;\n', '',
     ['PWC-NAME-WHOLE-WORDS', 'PWC-NOTES-WHOLE-WORDS']),
    # The fields stay in 1% columns and clip; xpdf then drops their glyphs from the PDF.
    ('no-copies', "const FIELDS = '#weaponsBody .wp-skill, #weaponsBody .wp-roll, #weaponsBody .wp-dmg, #weaponsBody .wp-size';",
     "const FIELDS = '#weaponsBody .no-such-field';",
     TOO_WIDE + ['PWC-IDEMPOTENT', 'PWC-SHORT-VALUES-FIT', 'PWC-SHORT-COLUMNS-TIGHT', 'PWC-RESTORE-CLEANS-COPIES', 'PWC-PDF-TEXT-WHOLE']),
    ('copies-twice', "      if(!api.enabled() || copies) return;\n      copies = [];\n      document.querySelectorAll(FIELDS)",
     "      if(!api.enabled()) return;\n      copies = [];\n      document.querySelectorAll(FIELDS)",
     TOO_WIDE + ['PWC-IDEMPOTENT', 'PWC-SHORT-VALUES-FIT', 'PWC-SHORT-COLUMNS-TIGHT']),
    ('no-sweep', "      document.querySelectorAll('.pwc-print-text').forEach(function(n){ n.remove(); });\n", '', ['PWC-RESTORE-CLEANS-COPIES']),
    # The declared dependency: without Printed Weapon Text the name and note print as single-line fields, as before it.
    ('printed-weapon-text-off', 'const PRINTED_WEAPON_TEXT_ENABLED = true;', 'const PRINTED_WEAPON_TEXT_ENABLED = false;',
     TOO_WIDE + ['PWC-NAME-WHOLE-WORDS', 'PWC-PDF-TEXT-WHOLE']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body, want):
    with tempfile.TemporaryDirectory(prefix='l5r-weaponcols-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'printed-weapon-columns-harness.js'), str(page)], capture_output=True, text=True,
                           encoding='utf-8', timeout=600)
    text = r.stdout + r.stderr
    (out / (label + '.log')).write_bytes(text.encode('utf-8'))
    failed = re.findall(r'^FAIL (\S+)', text, re.M)
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    got = list(map(int, counts[-1])) if counts else []
    ran_all = len(re.findall(r'^(?:PASS|FAIL) ', text, re.M)) == TOTAL and 'not reached' not in text
    case = {'id': label, 'expected_failures': want, 'actual_failures': failed, 'counts': got, 'exit': r.returncode, 'ran_all': ran_all}
    ok = ran_all and r.returncode == 1 and got == [TOTAL - len(want), TOTAL] and sorted(failed) == sorted(want)
    case['matched'] = ok
    print(label + (': failed exactly ' + str(len(want)) + ' pinned checks' if ok else ': ' + json.dumps(failed)), flush=True)
    return case


jobs = [('baseline', subprocess.check_output(['git', 'show', PREDECESSOR + ':' + P.relative_to(V.parent).as_posix() +
                                               '/l5r-character-sheet.html'], cwd=V.parent).decode('utf-8'), FIX)]
for label, old, new, want in cases:
    assert original.count(old) == 1, (label, 'mutation is not unique')
    jobs.append((label, original.replace(old, new), want))
with ThreadPoolExecutor(max_workers=3) as pool:
    report['cases'] = list(pool.map(lambda j: run(*j), jobs))
report['passed'] = all(c['matched'] for c in report['cases'])
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
if DISCOVER:
    print(json.dumps({c['id']: sorted(c['actual_failures']) for c in report['cases']}, indent=1))
    sys.exit(0)
assert report['passed'], [c['id'] for c in report['cases'] if not c['matched']]
print('All ' + str(len(jobs)) + ' negative variants matched their pinned failures.')
