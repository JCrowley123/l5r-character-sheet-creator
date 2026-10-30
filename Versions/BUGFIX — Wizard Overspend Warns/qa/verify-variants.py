"""Pinned negative variants for the Wizard Overspend Warns layer (Release 8a); sequential, each must fail exactly its
pinned checks (variants.json, written before the first run) and exit 1. Each variant is the built sheet with one change;
the baseline is main at the branch point. A scenario that stops on a broken build is one FAIL (XW-SCENARIO-RAN-…) and its
later checks never run, so the pin is the set of failed checks, not a count. --dry-run checks that every mutation is
unique; --discover prints failures instead of asserting. Adapted from the Moon Resist Label's verify-variants.py."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
SPLASH_FAST = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = 'a31251f2'  # Main at the branch point (build 4ee46180), Release 7c.1.
HARNESS = 'overspend-warns-harness.js'
TAG = 'xw8'
DISCOVER = '--discover' in sys.argv
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8'))
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
cases = [
 ["disabled", "const WIZARD_OVERSPEND_WARNS_ENABLED = true;", "const WIZARD_OVERSPEND_WARNS_ENABLED = false;"],
 ["no-quiet", "return quiet && api.enabled() ? XW8Logic.without(all) : all;", "return all;"],
 ["not-guarded", "api.guardAll = () => CW112.steps.forEach(api.guard);", "api.guardAll = () => {};"],
 ["no-decorate", "const out = previousRender.apply(this, arguments);\n        if(api.enabled()) api.decorate();",
  "const out = previousRender.apply(this, arguments);\n        if(false) api.decorate();"],
 ["no-finish-warning", "if(api.enabled() && api.overspent() &&\n", "if(false && api.overspent() &&\n"],
 ["stay-finishes", "'Finish', 'ghost', 'Stay'))) return;", "'Finish', 'ghost', 'Stay')));"],
 # After the review (findings 3 and 5).
 ["finish-twice", "if(asking) return;", ""],
 ["drops-every-finding", "findings.filter(f => !(f && f.id === XW8Logic.ID))", "findings.filter(f => false)"],
]

report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'


def run(label, body):
    with tempfile.TemporaryDirectory(prefix='l5r-' + TAG + '-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, '--require', str(SPLASH_FAST), str(Q / HARNESS), str(page)],
                           capture_output=True, text=True, encoding='utf-8', timeout=1200)
    text = r.stdout + r.stderr
    (out / (label + '.log')).write_bytes(text.encode('utf-8'))
    failed = sorted(re.findall(r'^FAIL (\S+)', text, re.M))
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    got = list(map(int, counts[-1])) if counts else []
    case = {'id': label, 'expected_failures': PINNED.get(label), 'actual_failures': failed, 'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    if DISCOVER:
        print(label + ' ' + json.dumps(failed) + ' ' + str(got), flush=True)
        return
    assert r.returncode == 1 and failed == sorted(PINNED[label]) and len(got) == 2 and got[1] - got[0] == len(failed), case
    print(label + ': failed exactly its ' + str(len(failed)) + ' pinned checks', flush=True)


for label, old, new in cases:
    assert original.count(old) == 1, (label, 'mutation is not unique', original.count(old))
assert len({c[0] for c in cases}) == len(cases) and len({(c[1], c[2]) for c in cases}) == len(cases), 'cases not unique'
assert set(PINNED) == {'baseline'} | {c[0] for c in cases}, 'every case needs a pin'
print(f'{len(cases)} mutations unique.', flush=True)
if '--dry-run' in sys.argv:
    sys.exit(0)
out.mkdir(exist_ok=True)
baseline = subprocess.check_output(['git', 'show', PREDECESSOR + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'],
                                   cwd=V.parent).decode('utf-8')
run('baseline', baseline)
for label, old, new in cases:
    run(label, original.replace(old, new))
report['passed'] = not DISCOVER
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.' if not DISCOVER else 'Discovery done.')
