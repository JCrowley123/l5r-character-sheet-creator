"""G4 pinned negative variants: four G3 baselines and sixteen mutations of frozen G4.
--dry-run verifies unique edits without launching browsers. --discover records the one discovery;
qualification asserts exact pins. G3's procedure with G4 constants and both required preloads.
A mutation's text is read from the frozen source fragment where it is a whole stylesheet, so it cannot drift from it."""
from pathlib import Path
import datetime, hashlib, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
R = Q.parent.parent
SPLASH_FAST = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
NAVIGATION_BUDGET = V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
BASELINE_REF = '5d14ebe3'  # G3 as live at the G4 branch point.
BASELINE_SHA = '6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029'
HARNESS = {
    'A09': R / 'A09 — Phone Text Entry and Repeated Taps/qa/phone-text-entry-harness.js',
    'A10': R / 'A10 — Cross-Page Actions Move Focus/qa/cross-page-focus-harness.js',
    'A10.1': R / 'A10.1 — The Page Ring Only for the Keyboard/qa/keyboard-page-ring-harness.js',
    'A17': R / 'A17 — The Splash Fills the Screen/qa/splash-fill-harness.js',
}
DISCOVER = '--discover' in sys.argv
# --only=A10,A17:no-css limits a --discover run to those units or cases (a second discovery after a harness fix).
ONLY = next((x.split('=', 1)[1].split(',') for x in sys.argv if x.startswith('--only=')), None)
assert ONLY is None or DISCOVER, '--only is for discovery; the qualification run asserts every pin'
wanted = lambda unit, label: ONLY is None or unit in ONLY or (unit + ':' + label) in ONLY
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8'))
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
css = lambda name: (P / 'src/css' / name).read_bytes().decode('utf-8')
cases = [
    ['A09', 'disabled', 'const PHONE_TEXT_ENTRY_ENABLED = true;', 'const PHONE_TEXT_ENTRY_ENABLED = false;'],
    ['A09', 'no-css', css('1142-phone-text-entry.css'), ''],
    ['A09', 'touch-auto', '{\n  touch-action: manipulation;\n}', '{\n  touch-action: auto;\n}'],
    ['A09', 'rings-shrunk', ':not([id^="ring_"])', ''],
    ['A10', 'disabled', 'const CROSS_PAGE_FOCUS_ENABLED = true;', 'const CROSS_PAGE_FOCUS_ENABLED = false;'],
    ['A10', 'no-css', css('1143-cross-page-focus.css'), ''],
    ['A10', 'keeps-tabindex', "if(had === null) heading.removeAttribute('tabindex');", 'if(had === null) void 0;'],
    ['A10', 'phone-gap', '  column-gap: 10px;\n  row-gap: 4px;\n}', '  column-gap: 10px;\n  row-gap: 12px;\n}'],
    ['A10.1', 'disabled', 'const KEYBOARD_PAGE_RING_ENABLED = true;', 'const KEYBOARD_PAGE_RING_ENABLED = false;'],
    ['A10.1', 'no-css', css('1144-keyboard-page-ring.css'), ''],
    ['A10.1', 'typing-counts', "      if(target && target.closest && target.closest(TYPING) && event.key !== 'Tab' && event.key !== 'Escape') return;\n", ''],
    ['A10.1', 'no-pointer-clear', "api.onPointer = function(){ document.body.classList.remove('kr15-keyboard'); };", 'api.onPointer = function(){};'],
    ['A17', 'disabled', 'var SPLASH_FILL_ENABLED = true;', 'var SPLASH_FILL_ENABLED = false;'],
    ['A17', 'no-css', css('1145-splash-fill.css'), ''],
    ['A17', 'old-switch-point', "wide.media = '(min-aspect-ratio: 3/2)';", 'wide.media = wide.media;'],
    ['A17', 'focal-bottom', '  object-position: 50% 35%;', '  object-position: 50% 100%;'],
]


report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / (('variants-discover-' if DISCOVER else 'negative-') + hashlib.sha256(original.encode('utf-8')).hexdigest()[:8] + ('-2' if ONLY else ''))


def run(unit, label, body):
    key = unit + ':' + label
    with tempfile.TemporaryDirectory(prefix='l5r-g4-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        harness = HARNESS[unit]
        r = subprocess.run([NODE, '--require', str(NAVIGATION_BUDGET), '--require', str(SPLASH_FAST), str(harness), str(page)], cwd=str(harness.parent),
                           capture_output=True, text=True, encoding='utf-8', timeout=1800)
    text = r.stdout + r.stderr
    (out / (unit + '-' + label + '.log')).write_bytes(text.encode('utf-8'))
    failed = sorted(re.findall(r'^FAIL (\S+)', text, re.M))
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    got = list(map(int, counts[-1])) if counts else []
    case = {'id': key, 'expected_failures': PINNED.get(key), 'actual_failures': failed, 'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    if DISCOVER:
        exp = sorted(PINNED.get(key) or [])
        print(key + (' MATCH ' if failed == exp else ' DIFF ') + json.dumps({'extra': sorted(set(failed) - set(exp)), 'missing': sorted(set(exp) - set(failed))}) + ' ' + str(got), flush=True)
        return
    assert r.returncode == 1 and failed == sorted(PINNED[key]) and len(got) == 2 and got[1] - got[0] == len(failed), case
    print(key + ': failed exactly its ' + str(len(failed)) + ' pinned checks', flush=True)


for unit, label, old, new in cases:
    assert original.count(old) == 1, (unit, label, 'mutation is not unique', original.count(old))
keys = [u + ':' + l for u, l, _, _ in cases]
assert len(set(keys)) == len(keys) and len({(c[2], c[3]) for c in cases}) == len(cases), 'cases not unique'
assert set(PINNED) == {u + ':baseline' for u in HARNESS} | set(keys), 'every case needs a pin'
print(f'{len(cases)} mutations unique.', flush=True)
if '--dry-run' in sys.argv:
    sys.exit(0)
out.mkdir(exist_ok=True)
baseline = subprocess.check_output(['git', 'show', BASELINE_REF + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'],
                                   cwd=V.parent).decode('utf-8')
assert hashlib.sha256(baseline.encode('utf-8')).hexdigest() == BASELINE_SHA
for unit in HARNESS:
    if wanted(unit, 'baseline'): run(unit, 'baseline', baseline)
for unit, label, old, new in cases:
    if wanted(unit, label): run(unit, label, original.replace(old, new))
report['passed'] = not DISCOVER
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + len(HARNESS)) + ' negative variants matched their pinned failures.' if not DISCOVER else 'Discovery done.')
