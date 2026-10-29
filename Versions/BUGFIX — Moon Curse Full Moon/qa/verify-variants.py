"""Pinned negative variants for the Moon Curse Full Moon layer (Release 7c, R26); sequential, each must run
all checks and fail exactly its pinned ones (variants.json, written before the first run). Each variant is the built
sheet with one change. --dry-run checks that every mutation is unique; --discover prints failures instead of asserting.
Adapted from PART I — Phase 4.5.42's verify-variants.py; the splash's test switch is preloaded, as in the suite."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
SPLASH_FAST = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '605512e'  # Main at the branch point (build 9545f828), the 7b.2 release.
TOTAL = 17
DISCOVER = '--discover' in sys.argv
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8'))
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
cases = [
 ["disabled", "const MOON_CURSE_ENABLED = true;", "const MOON_CURSE_ENABLED = false;"],
 ["moon-drawn-last", "(i === 0 ? ' lm7-moon-pip' : '')", "(i === rank ? ' lm7-moon-pip' : '')"],
 ["sunrise-keeps", "set(points){ return points >= 1 ? points - 1 : 0; }", "set(points){ return points; }"],
 ["tn-shift", "TN:{Low:15, Medium:20, High:25}", "TN:{Low:15, Medium:25, High:30}"],
 ["no-fail-alert", "if(passed === false) await appAlert(LM7Logic.failText);", "if(false) await appAlert(LM7Logic.failText);"],
 ["quick-plain", "if(value && api.full()) value.textContent", "if(false) value.textContent"],
 ["panel-not-redrawn", "      if(typeof renderQuickAccessPanel === 'function') renderQuickAccessPanel();\n      if(typeof renderVoidPanel === 'function') renderVoidPanel();\n    };", "      if(typeof renderQuickAccessPanel === 'function') renderQuickAccessPanel();\n    };"],
 ["moon-not-kept", "if(before && before.moon === true && out && out.moon === undefined && LM7Logic.tn(out.value)){", "if(false){"],
 ["no-settle", "if(api.wasFull && !full && !api.loading){", "if(false){"],
 ["load-is-sunrise", "          api.loading = true;", "          api.loading = false;"]
]

report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'


def run(label, body):
    with tempfile.TemporaryDirectory(prefix='l5r-lm7-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, '--require', str(SPLASH_FAST), str(Q / 'moon-harness.js'), str(page)],
                           capture_output=True, text=True, encoding='utf-8', timeout=600)
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
    want = sorted(PINNED[label])
    assert r.returncode == 1 and got == [TOTAL - len(want), TOTAL] and failed == want, case
    print(label + ': failed exactly ' + str(len(want)) + ' pinned checks', flush=True)


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
