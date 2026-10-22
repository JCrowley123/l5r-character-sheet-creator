"""Pinned negative proofs for PART F — Phase 0.6.3 Offline Notice After the Splash; sequential, each must run all 12
checks. Each variant is the built site (python build.py --out <dir>) with one change to the head block in its page.
    python qa/verify-variants.py <dist-dir> [--dry-run] [--only=<id>]
Adapted from Phase 0.6.1's verify-variants.py."""
from pathlib import Path
import datetime, json, os, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
TOTAL = 12
DIST = Path(sys.argv[1]).resolve()
page = (DIST / 'index.html').read_text(encoding='utf-8')
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file())
HEAD = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App/src/head-pwa.html'
MAIN_COMMIT = 'b54c13b'

# A notice that is never held (main's head, the switch off, the wrong element) shows under the splash and saves its
# mark there; with no splash, and once the mark is saved, it behaves as before.
UNDER = ['O-HELD-NO-NOTICE', 'O-HELD-MARK-NOT-SAVED', 'O-SHOWN-AFTER-SPLASH', 'O-MARK-SAVED',
         'O-PRIVATE-ONE-NOTICE-AFTER-SPLASH', 'O-FIRST-VISIT-AFTER-SPLASH', 'O-FIRST-VISIT-MARK']
# Held but never let go: nothing shows until the splash has gone and the message comes again.
NEVER = ['O-SHOWN-AFTER-SPLASH', 'O-MARK-SAVED', 'O-LEAVES-AS-BEFORE', 'O-PRIVATE-ONE-NOTICE-AFTER-SPLASH',
         'O-FIRST-VISIT-SEEN', 'O-FIRST-VISIT-AFTER-SPLASH', 'O-FIRST-VISIT-MARK']
cases = [
    ('disabled', 'var NOTICE_AFTER_SPLASH_ENABLED = true;', 'var NOTICE_AFTER_SPLASH_ENABLED = false;', ['O-SWITCH'] + UNDER),
    ('wrong-element', "var splash = NOTICE_AFTER_SPLASH_ENABLED && document.getElementById('l5rSplash');",
     "var splash = NOTICE_AFTER_SPLASH_ENABLED && document.getElementById('l5rSplashX');", UNDER),
    ('never-released', '      noticeHeld = false;\n      show();\n', '      noticeHeld = false;\n', NEVER),
    # Two messages under the splash with no saved mark: without the guard each one shows a notice.
    ('no-guard', '    if (noticeHeld) return true;\n', '', ['O-PRIVATE-ONE-NOTICE-AFTER-SPLASH']),
]
# Not a variant: without the watcher's own "is the splash still up?" line, a change elsewhere on the page re-calls
# the notice, which holds again by itself. Measured 22 October: 12/12, nothing visible changes (the line saves churn).
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'dist': str(DIST), 'cases': []}
out = Q / 'negative'


def run(label, text, want):
    with tempfile.TemporaryDirectory(prefix='l5r-notice-negative-') as folder:
        site = Path(folder) / 'site'
        shutil.copytree(DIST, site)
        (site / 'index.html').write_bytes(text.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'notice-harness.js'), str(site)], capture_output=True, text=True,
                           encoding='utf-8', timeout=1200)
    log = r.stdout + r.stderr
    (out / (label + '.log')).write_bytes(log.encode('utf-8'))
    failed = re.findall(r'^FAIL (\S+)', log, re.M)
    counts = re.findall(r'(\d+)/(\d+) checks passed', log)
    got = list(map(int, counts[-1])) if counts else []
    case = {'id': label, 'expected_failures': want, 'actual_failures': failed, 'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    assert r.returncode == 1 and got == [TOTAL - len(want), TOTAL] and sorted(failed) == sorted(want), case
    print(label + ': failed exactly ' + str(len(want)) + ' pinned checks', flush=True)


head = HEAD.read_text(encoding='utf-8')
assert page.count(head) == 1, 'the page does not hold this head block once'
for label, old, new, want in cases:
    assert page.count(old) == 1 and head.count(old) == 1, (label, 'mutation is not unique', page.count(old))
assert len({c[0] for c in cases}) == len(cases) and len({(c[1], c[2]) for c in cases}) == len(cases), 'cases not unique'
print(f'{len(cases)} mutations unique.', flush=True)
if '--dry-run' in sys.argv:
    sys.exit(0)
out.mkdir(exist_ok=True)
only = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--only=')]
if not only or 'baseline' in only:
    main_head = subprocess.check_output(['git', 'show', MAIN_COMMIT + ':' + HEAD.relative_to(V.parent).as_posix()],
                                        cwd=V.parent).decode('utf-8')
    run('baseline', page.replace(head, main_head), ['O-SWITCH'] + UNDER)
for label, old, new, want in cases:
    if only and label not in only:
        continue
    run(label, page.replace(old, new), want)
report['passed'] = True
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All negative variants matched their pinned failures.')
