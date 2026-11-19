"""G6 pinned negative variants (A19 revision 1, A20, A19.1): one baseline per unit (G5, A08, as live: the group's branch
point) and six mutations of the frozen candidate. --dry-run verifies unique edits without launching browsers. --discover
records the one discovery; qualification asserts exact pins. G5's procedure and both required preloads, with this
group's constants. Every unit's harness keeps its steps tolerant of the unit's absence, so every pin is the exact list
of FAIL lines with a complete count; the pinned-stop form is kept but unused."""
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
BASELINE_REF = '1ebf26b4'  # G5 (A08) as live, the group's branch point.
BASELINE_SHA = '6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1'
HARNESS = {'A19': R / 'A19 — Undo the Last Void Spend/qa/void-spend-undo-harness.js',
           'A20': R / 'A20 — A Trait for One Skill Roll/qa/skill-trait-choice-harness.js',
           'A19.1': R / 'A19.1 — The Damage Row Fits a Phone/qa/damage-row-harness.js'}
DISCOVER = '--discover' in sys.argv
# --only=A19:no-drop limits a --discover run to those units or cases (a second discovery after a correction).
ONLY = next((x.split('=', 1)[1].split(',') for x in sys.argv if x.startswith('--only=')), None)
assert ONLY is None or DISCOVER, '--only is for discovery; the qualification run asserts every pin'
wanted = lambda unit, label: ONLY is None or unit in ONLY or (unit + ':' + label) in ONLY
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8'))
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
cases = [
    ['A19', 'disabled', 'const VOID_SPEND_UNDO_ENABLED = true;', 'const VOID_SPEND_UNDO_ENABLED = false;'],
    ['A19', 'touch-save-ends', 'if(touchRolling > 0){', 'if(false){'],
    ['A19', 'no-drop', 'if(drop && typeof VI4533', 'if(false && typeof VI4533'],
    ['A20', 'disabled', 'const SKILL_TRAIT_CHOICE_ENABLED = true;', 'const SKILL_TRAIT_CHOICE_ENABLED = false;'],
    ['A20', 'no-pool', 'if(tc1534){ baseRolled', 'if(false){ baseRolled'],
    ['A19.1', 'disabled', 'const DAMAGE_ROW_FIT_ENABLED = true;', 'const DAMAGE_ROW_FIT_ENABLED = false;'],
]

report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / (('variants-discover-' if DISCOVER else 'negative-') + hashlib.sha256(original.encode('utf-8')).hexdigest()[:8] + ('-2' if ONLY else ''))


def matches(pin, text, code, failed, got):
    """True when the run is exactly its pin: the exact list of FAIL lines, or a stop (unused for this group)."""
    if isinstance(pin, dict):
        before = sorted(set(re.findall(r'^  detail (\S+):', text, re.M)))
        return (code == 1 and failed == [] and not re.search(r'^PASS ', text, re.M) and got == pin['counts'] and
                pin['stops'] in text and before == sorted(pin['before_stop']))
    return code == 1 and failed == sorted(pin) and len(got) == 2 and got[1] - got[0] == len(failed)


def run(unit, label, body):
    key = unit + ':' + label
    with tempfile.TemporaryDirectory(prefix='l5r-g6-negative-') as folder:
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
