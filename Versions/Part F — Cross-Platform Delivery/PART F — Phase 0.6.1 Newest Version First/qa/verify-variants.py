"""Pinned negative proofs for PART F — Phase 0.6.1 Newest Version First; sequential, each must run all 14 checks.
Each variant is the built site (python build.py --out <dir>) with one change to its sw.js.
    python qa/verify-variants.py <dist-dir> [--dry-run] [--only=<id>]"""
from pathlib import Path
import datetime, json, os, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
TOTAL = 14
DIST = Path(sys.argv[1]).resolve()
sw = (DIST / 'sw.js').read_text(encoding='utf-8')

# A worker that answers from the saved copy on every open (the switch off, the id never read, the hook missing)
# fails what main's worker fails.
STALE = ['N-FIRST-OPEN-SHOWS-RELEASE', 'N-SLOW-CHECK-WAITS-ITS-LIMIT', 'N-SLOW-RELEASE-WAITS-ITS-LIMIT', 'N-SLOW-RELEASE-NEXT-OPEN']
cases = [
    ('disabled', 'const NEWEST_FIRST_ENABLED = true;', 'const NEWEST_FIRST_ENABLED = false;', ['N-SWITCH'] + STALE),
    # The id is asked for but never read: the open still waits for the check (up to its limit), then the saved copy.
    ('id-never-read', "/^const BUILD_ID = '([0-9a-f]+)';/m", "/^const BUILD_ID = 'x([0-9a-f]+)';/m",
     [c for c in STALE if c != 'N-SLOW-CHECK-WAITS-ITS-LIMIT']),
    ('hook-missing', '      if (NEWEST_FIRST_ENABLED && cached) {', '      if (false) {', STALE),
    ('no-check-limit', 'const CHECK_LIMIT_MS = 2000;', 'const CHECK_LIMIT_MS = Infinity;',
     ['N-SLOW-CHECK-SAVED-COPY', 'N-SLOW-CHECK-WAITS-ITS-LIMIT']),
    ('no-page-limit', 'const NEW_PAGE_LIMIT_MS = 8000;', 'const NEW_PAGE_LIMIT_MS = Infinity;',
     ['N-SLOW-RELEASE-SAVED-COPY', 'N-SLOW-RELEASE-WAITS-ITS-LIMIT']),
    ('same-id-taken-as-new', '  if (!id || id === BUILD_ID) return null;', '  if (!id) return null;', ['N-SAME-BUILD-NO-PAGE-WAIT']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'dist': str(DIST), 'cases': []}
out = Q / 'negative'


def run(label, worker, want):
    with tempfile.TemporaryDirectory(prefix='l5r-newest-negative-') as folder:
        site = Path(folder) / 'site'
        shutil.copytree(DIST, site)
        (site / 'sw.js').write_bytes(worker.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'newest-first-harness.js'), str(site)], capture_output=True, text=True,
                           encoding='utf-8', timeout=1200)
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


for label, old, new, want in cases:
    assert sw.count(old) == 1, (label, 'mutation is not unique', sw.count(old))
assert len({c[0] for c in cases}) == len(cases) and len({(c[1], c[2]) for c in cases}) == len(cases), 'cases not unique'
print(f'{len(cases)} mutations unique.', flush=True)
if '--dry-run' in sys.argv:
    sys.exit(0)
out.mkdir(exist_ok=True)
# Baseline: main's worker (31be9e5), stamped with this build's id.
build_id = re.search(r"^const BUILD_ID = '([0-9a-f]+)';", sw, re.M).group(1)
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file())
main_text = subprocess.check_output(['git', 'show', '31be9e5:Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App/src/sw.js'],
                                    cwd=V.parent).decode('utf-8')
only = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--only=')]
if not only or 'baseline' in only:
    run('baseline', main_text.replace('__BUILD_ID__', build_id), ['N-SWITCH'] + STALE)
for label, old, new, want in cases:
    if only and label not in only:
        continue
    run(label, sw.replace(old, new), want)
report['passed'] = True
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All negative variants matched their pinned failures.')
