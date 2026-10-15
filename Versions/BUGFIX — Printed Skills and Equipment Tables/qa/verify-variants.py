"""Pinned negative proofs for BUGFIX — Printed Skills and Equipment Tables. Each variant changes one thing in the candidate
build and must fail exactly its pinned checks while running all 18; every rule and step of the release is pinned by at
least one. --discover runs them and prints the failures without asserting. Runs three at a time; logs go to qa/negative/.
Adapted from Printed Weapon Columns' script."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = 'a635d8f'  # main with Printed Weapon Columns merged, the build before this release: 3,837,258 bytes, d8e6915c...
TOTAL = 18
DISCOVER = '--discover' in sys.argv
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
FIX = ['PSE-SWITCH', 'PSE-IDEMPOTENT', 'PSE-NO-SCROLLER', 'PSE-TABLES-WITHIN-PAGE', 'PSE-LONG-TEXT-WHOLE-WORDS', 'PSE-SHORT-VALUES-FIT',
       'PSE-EMPHASES-WHOLE', 'PSE-SHORT-COLUMNS-TIGHT', 'PSE-WIDE-COLUMNS-TAKE-THE-REST', 'PSE-MANAGEMENT-MODE',
       'PSE-RESTORE-CLEANS-COPIES', 'PSE-PDF-TEXT-WHOLE']
# Too wide for the page at 560 px (or for A4 and Letter): the table runs over and a short column takes the slack.
TOO_WIDE = ['PSE-TABLES-WITHIN-PAGE', 'PSE-SHORT-COLUMNS-TIGHT', 'PSE-WIDE-COLUMNS-TAKE-THE-REST']
# (label, text in the candidate, replacement, pinned failures)
cases = [
    ('disabled', 'const PRINTED_SKILLS_EQUIPMENT_ENABLED = true;', 'const PRINTED_SKILLS_EQUIPMENT_ENABLED = false;', FIX),
    # A4 and Letter keep the sideways scroller.
    ('scroller-kept', '.car-hscroll:has(> #equipTable){ overflow:visible !important; }', '.car-hscroll:has(> #equipTable){ }',
     ['PSE-NO-SCROLLER', 'PSE-MANAGEMENT-MODE']),
    # The tablet band's 720 px floor pushes both tables past A4 and Letter.
    ('screen-floor-kept', '    html.pse-enabled #equipTable{ min-width:0 !important; }', '    html.pse-enabled #equipTable{ }',
     ['PSE-TABLES-WITHIN-PAGE', 'PSE-LONG-TEXT-WHOLE-WORDS', 'PSE-WIDE-COLUMNS-TAKE-THE-REST', 'PSE-MANAGEMENT-MODE']),
    # At phone widths the cells lose their side padding: neighbouring write-in lines touch.
    ('phone-padding-kept', '    html.pse-enabled #equipTable td{\n      padding-left:4px',
     '    html.pse-enabled #equipTable .no-such-td{\n      padding-left:4px',
     ['PSE-SHORT-VALUES-FIT', 'PSE-SHORT-COLUMNS-TIGHT', 'PSE-MANAGEMENT-MODE']),
    ('short-not-shrunk', '    html.pse-enabled #equipTable .col-xnarrow{\n      width:1% !important;\n      white-space:nowrap;',
     '    html.pse-enabled #equipTable .col-xnarrow{\n      white-space:nowrap;',
     ['PSE-SHORT-COLUMNS-TIGHT']),
    # "16 xp" breaks onto two lines.
    ('short-values-wrap', '    html.pse-enabled #equipTable .col-xnarrow{\n      width:1% !important;\n      white-space:nowrap;',
     '    html.pse-enabled #equipTable .col-xnarrow{\n      width:1% !important;',
     ['PSE-SHORT-VALUES-FIT']),
    ('remove-column-kept', '    html.pse-enabled #skillsTable tr > :last-child,\n    html.pse-enabled #equipTable tr > :last-child{',
     '    html.pse-enabled #skillsTable tr > .no-such-cell,\n    html.pse-enabled #equipTable tr > .no-such-cell{',
     ['PSE-SHORT-COLUMNS-TIGHT', 'PSE-MANAGEMENT-MODE']),
    ('fields-shown', '    html.pse-enabled #skillsBody .pse-text-source,\n    html.pse-enabled #equipBody .pse-text-source{',
     '    html.pse-enabled #skillsBody .no-such-source,\n    html.pse-enabled #equipBody .no-such-source{',
     TOO_WIDE + ['PSE-LONG-TEXT-WHOLE-WORDS', 'PSE-SHORT-VALUES-FIT', 'PSE-EMPHASES-WHOLE', 'PSE-MANAGEMENT-MODE']),
    # A blank Qty loses its write-in line.
    ('no-blank-line', '#equipBody .pse-print-text{\n      display:inline-block !important;\n      min-width:2em;\n',
     '#equipBody .pse-print-text{\n      display:inline-block !important;\n',
     ['PSE-SHORT-VALUES-FIT', 'PSE-MANAGEMENT-MODE']),
    ('inline-copies', '#equipBody .pse-print-text{\n      display:inline-block !important;',
     '#equipBody .pse-print-text{\n      display:inline !important;',
     ['PSE-SHORT-VALUES-FIT', 'PSE-MANAGEMENT-MODE']),
    ('inline-wrap-copies', '#equipBody .pse-print-wrap{\n      display:block !important;', '#equipBody .pse-print-wrap{\n      display:inline !important;',
     ['PSE-LONG-TEXT-WHOLE-WORDS']),
    # In the name rows (flex) a blank name copy collapses instead of keeping its write-in line.
    ('no-flex', '      flex:1 1 auto;\n      min-height:1em;\n', '      min-height:1em;\n',
     ['PSE-LONG-TEXT-WHOLE-WORDS']),
    ('no-min-height', '      min-height:1em;\n      white-space:pre-wrap;\n', '      white-space:pre-wrap;\n',
     ['PSE-LONG-TEXT-WHOLE-WORDS']),
    # The copies inherit the shrunk columns' nowrap: "Agility or Intelligence" stays on one line.
    ('wrap-copies-nowrap', '      white-space:pre-wrap;\n      overflow-wrap:break-word;\n      word-break:normal;\n',
     '      overflow-wrap:break-word;\n      word-break:normal;\n',
     TOO_WIDE + ['PSE-MANAGEMENT-MODE']),
    ('breaks-inside-words', '      white-space:pre-wrap;\n      overflow-wrap:break-word;\n      word-break:normal;\n',
     '      white-space:pre-wrap;\n      overflow-wrap:anywhere;\n      word-break:normal;\n',
     ['PSE-LONG-TEXT-WHOLE-WORDS', 'PSE-MANAGEMENT-MODE', 'PSE-PDF-TEXT-WHOLE']),
    # Trait as a one-line copy: right for single-word Traits, too wide at phone widths for "Agility or Intelligence".
    ('trait-one-line', "const ONE_LINE = '#skillsBody .sk-rank, #equipBody .eq-qty';\n    const WRAPPING = '#skillsBody .sk-name, #skillsBody .sk-trait, ",
     "const ONE_LINE = '#skillsBody .sk-rank, #skillsBody .sk-trait, #equipBody .eq-qty';\n    const WRAPPING = '#skillsBody .sk-name, ",
     TOO_WIDE + ['PSE-IDEMPOTENT', 'PSE-MANAGEMENT-MODE']),
    ('no-one-line-copies', "const ONE_LINE = '#skillsBody .sk-rank, #equipBody .eq-qty';", "const ONE_LINE = '#skillsBody .no-such-field';",
     TOO_WIDE + ['PSE-IDEMPOTENT', 'PSE-MANAGEMENT-MODE']),
    ('no-wrapping-copies', "const WRAPPING = '#skillsBody .sk-name, #skillsBody .sk-trait, #equipBody .eq-name, #equipBody .eq-notes';",
     "const WRAPPING = '#skillsBody .no-such-field';",
     TOO_WIDE + ['PSE-IDEMPOTENT', 'PSE-LONG-TEXT-WHOLE-WORDS', 'PSE-MANAGEMENT-MODE', 'PSE-PDF-TEXT-WHOLE']),
    ('copies-twice', "      if(!api.enabled() || copies) return;\n      copies = [];\n      document.querySelectorAll(ONE_LINE)",
     "      if(!api.enabled()) return;\n      copies = [];\n      document.querySelectorAll(ONE_LINE)",
     TOO_WIDE + ['PSE-IDEMPOTENT']),
    ('no-sweep', "      document.querySelectorAll('.pse-print-text, .pse-print-wrap').forEach(function(n){ n.remove(); });\n", '',
     ['PSE-RESTORE-CLEANS-COPIES']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body, want):
    with tempfile.TemporaryDirectory(prefix='l5r-skillsequip-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'printed-skills-equipment-harness.js'), str(page)], capture_output=True, text=True,
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
