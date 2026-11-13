"""Automatic-entries group pinned negative variants: three G4-as-live baselines and ten mutations of the frozen group.
--dry-run verifies unique edits without launching browsers. --discover records the one discovery;
qualification asserts exact pins. G4's procedure with this group's constants and both required preloads.
A mutation's text is read from the frozen source fragment where it is a whole stylesheet, so it cannot drift from it.
One addition to G4's file (13 November 2026, before any run): a pin may be a stop. AE2's harness waits for its note
outside any check, so on a build without the unit it stops there; its catch prints only "0/21 checks passed", and the
checks that failed before the stop show only as "detail" lines. Such a pin names the stop's error text, the count and
the exact set of checks that failed before it; every other pin is G4's exact list of FAIL lines."""
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
BASELINE_REF = '60a5262a'  # G4 as live at the group's branch point.
BASELINE_SHA = 'fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb'
HARNESS = {
    'AE1': R / 'AE1 — Sense for the Yogo Wardmaster/qa/yogo-given-spells-harness.js',
    'AE2': R / 'AE2 — Given Spells Credited on Opening/qa/given-spells-harness.js',
    'AE3': R / 'AE3 — No XP Box or Remove on Automatic Entries/qa/automatic-entry-controls-harness.js',
}
DISCOVER = '--discover' in sys.argv
# --only=AE2,AE3:no-css limits a --discover run to those units or cases (a second discovery after a correction).
ONLY = next((x.split('=', 1)[1].split(',') for x in sys.argv if x.startswith('--only=')), None)
assert ONLY is None or DISCOVER, '--only is for discovery; the qualification run asserts every pin'
wanted = lambda unit, label: ONLY is None or unit in ONLY or (unit + ':' + label) in ONLY
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8'))
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
css = lambda name: (P / 'src/css' / name).read_bytes().decode('utf-8')
cases = [
    ['AE1', 'disabled', 'const YOGO_GIVEN_SPELLS_ENABLED = true;', 'const YOGO_GIVEN_SPELLS_ENABLED = false;'],
    ['AE1', 'no-sense', 'yogo.given = api.GIVEN.slice();', 'void 0;'],
    ['AE1', 'no-line', 'yogo.text = api.LINE;', 'void 0;'],
    ['AE2', 'disabled', 'const GIVEN_SPELLS_ON_OPENING_ENABLED = true;', 'const GIVEN_SPELLS_ON_OPENING_ENABLED = false;'],
    ['AE2', 'play-gate', "if(play) MODES12.mode = 'management';", 'if(play) void 0;'],
    ['AE2', 'not-settled', 'if(done.complete) api.settled.push(school);', 'void 0;'],
    ['AE3', 'disabled', 'const AUTOMATIC_ENTRY_CONTROLS_ENABLED = true;', 'const AUTOMATIC_ENTRY_CONTROLS_ENABLED = false;'],
    ['AE3', 'no-css', css('1146-automatic-entry-controls.css'), ''],
    ['AE3', 'fallback-right', '.ax15-wrap > .entry-top > .ax15-tag {\n  margin-left: 0;\n}', '.ax15-wrap > .entry-top > .ax15-tag {\n  margin-left: auto;\n}'],
    ['AE3', 'any-xp', "if(cost && String(cost.value).trim() !== '' && Number(cost.value) !== 0) return '';", 'void 0;'],
]


report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / (('variants-discover-' if DISCOVER else 'negative-') + hashlib.sha256(original.encode('utf-8')).hexdigest()[:8] + ('-2' if ONLY else ''))


def matches(pin, text, code, failed, got):
    """True when the run is exactly its pin: G4's list of FAIL lines, or a stop (see the docstring)."""
    if isinstance(pin, dict):
        before = sorted(set(re.findall(r'^  detail (\S+):', text, re.M)))
        return (code == 1 and failed == [] and not re.search(r'^PASS ', text, re.M) and got == pin['counts'] and
                pin['stops'] in text and before == sorted(pin['before_stop']))
    return code == 1 and failed == sorted(pin) and len(got) == 2 and got[1] - got[0] == len(failed)


def run(unit, label, body):
    key = unit + ':' + label
    with tempfile.TemporaryDirectory(prefix='l5r-ae-negative-') as folder:
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
    before = sorted(set(re.findall(r'^  detail (\S+):', text, re.M)))
    case = {'id': key, 'expected_failures': PINNED.get(key), 'actual_failures': failed, 'failed_before_any_stop': before,
            'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    pin = PINNED.get(key)
    if DISCOVER:
        ok = pin is not None and matches(pin, text, r.returncode, failed, got)
        exp = sorted(pin['before_stop'] if isinstance(pin, dict) else (pin or []))
        act = before if isinstance(pin, dict) else failed
        print(key + (' MATCH ' if ok else ' DIFF ') + json.dumps({'extra': sorted(set(act) - set(exp)), 'missing': sorted(set(exp) - set(act))}) + ' ' + str(got), flush=True)
        return
    assert matches(pin, text, r.returncode, failed, got), case
    if isinstance(pin, dict):
        print(key + ': stopped as pinned, after exactly its ' + str(len(before)) + ' pinned failures', flush=True)
    else:
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
