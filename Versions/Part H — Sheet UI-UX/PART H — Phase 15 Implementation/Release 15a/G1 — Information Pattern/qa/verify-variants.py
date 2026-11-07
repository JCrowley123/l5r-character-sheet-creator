"""Pinned negative variants for Release 15a group G1 (A04, A15, A16, A03.1); sequential. Each variant is the frozen group
build with one change, run through that unit's own harness; it must fail exactly its pinned checks (variants.json, written
before the first run) and exit 1. Each unit's baseline is Release 15a A03 as live (no G1 unit at all). --dry-run checks
that every mutation is unique; --discover prints failures instead of asserting (run once, before qualification, and its
corrections recorded in VARIANT-PINS.md). Adapted from A03's verify-variants.py (one harness per unit instead of one)."""
from pathlib import Path
import datetime, hashlib, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
R = Q.parent.parent
SPLASH_FAST = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
BASELINE_REF = '47218576'   # main at the branch point: Release 15a A03 live (application e73b7c0c...).
BASELINE_SHA = 'e73b7c0cac70c95d2965d993c9a3b9f0b66eb6f3ef4b81d6667166667090de06'
HARNESS = {'A04': R / 'A04 — One Information Pattern/qa/info-pattern-harness.js',
           'A15': R / 'A15 — Court Badges/qa/court-badges-harness.js',
           'A16': R / 'A16 — No Bottom i in the Seven Pickers/qa/picker-info-harness.js',
           'A03.1': R / 'A03.1 — Masteries in the Skill Information/qa/skill-masteries-harness.js'}
DISCOVER = '--discover' in sys.argv
# --only=A04,A16:note-hidden-too limits a --discover run to those units or cases (a second discovery after a harness fix).
ONLY = next((x.split('=', 1)[1].split(',') for x in sys.argv if x.startswith('--only=')), None)
assert ONLY is None or DISCOVER, '--only is for discovery; the qualification run asserts every pin'
wanted = lambda unit, label: ONLY is None or unit in ONLY or (unit + ':' + label) in ONLY
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8'))
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
cases = [
 # A04: one information pattern
 ["A04", "disabled", "const ONE_INFO_PATTERN_ENABLED = true;", "const ONE_INFO_PATTERN_ENABLED = false;"],
 ["A04", "no-unnest", "        host.after(button);\n", "        void host;\n"],
 ["A04", "lone-i-in-play", "html body.ip15-on.pm12-play [data-pm12-locked] + .adv-config-info {", "html body.ip15-on.pm12-play [data-pm12-lockedX] + .adv-config-info {"],
 ["A04", "no-names", "const setLabel = function(el, label){ if(el && label && el.getAttribute('aria-label') !== label) el.setAttribute('aria-label', label); };", "const setLabel = function(){};"],
 ["A04", "hotei-unfolded", "[summary].concat(notes).forEach(function(el){ el.classList.add('ip15-folded'); });", "void notes;"],
 ["A04", "small-touch-area", "    content: '';\n    position: absolute;\n    inset: -8px;", "    content: '';\n    position: absolute;\n    inset: 0;"],
 # A15: court badges
 ["A15", "disabled", "const COURT_BADGES_ENABLED = true;", "const COURT_BADGES_ENABLED = false;"],
 ["A15", "tap-not-in-session", "else CS4514.update(div, {selected: court, inSession: true},", "else CS4514.update(div, {selected: court, inSession: false},"],
 ["A15", "gold-fill", "  border-color: var(--shu-dark);\n  background: var(--shu-dark);", "  border-color: var(--gold);\n  background: var(--gold);"],
 ["A15", "no-add-court", "      group.appendChild(add);", "      void add;"],
 ["A15", "add-court-in-play", "html body.cb15-on.pm12-play #advList .court4514-row .court4514-controls .cb15-add {", "html body.cb15-on.pm12-never #advList .court4514-row .court4514-controls .cb15-add {"],
 ["A15", "tick-box-kept", "      if(session) session.remove();", "      void session;"],
 ["A15", "old-help-words", "split(api.HELP_OLD).join(api.HELP_NEW)", "split(api.HELP_OLD).join(api.HELP_OLD)"],
 # A16: no bottom i in the seven pickers
 ["A16", "disabled", "const PICKER_BOTTOM_INFO_REMOVED_ENABLED = true;", "const PICKER_BOTTOM_INFO_REMOVED_ENABLED = false;"],
 ["A16", "hidden-not-removed", "found.forEach(function(button){ button.remove(); });", "void found;"],
 ["A16", "note-hidden-too", "html body.bi15-on #advConfigGrid > .fb4521-info,", "html body.bi15-on #advConfigNote,\nhtml body.bi15-on #advConfigGrid > .fb4521-info,"],
 # A03.1: Masteries in the Skill information
 ["A03.1", "disabled", "const SKILL_MASTERIES_ENABLED = true;", "const SKILL_MASTERIES_ENABLED = false;"],
 ["A03.1", "reached-not-coloured", ".sm15-item.sm15-reached .sm15-rank {\n  border-color: var(--shu-dark);\n  color: var(--shu-dark);", ".sm15-item.sm15-reached .sm15-rank {\n  border-color: var(--line);\n  color: var(--ink-soft);"],
 ["A03.1", "tier-seven-missing", "api.TIERS = [3, 5, 7];", "api.TIERS = [3, 5];"],
 ["A03.1", "reached-off-by-one", "reached: rank >= t}", "reached: rank > t}"],
 ["A03.1", "no-none-message", "api.NONE = 'No Mastery Abilities on file for this Skill.';", "api.NONE = '';"],
]

report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / (('variants-discover-' if DISCOVER else 'negative-') + hashlib.sha256(original.encode('utf-8')).hexdigest()[:8] + ('-2' if ONLY else ''))


def run(unit, label, body):
    key = unit + ':' + label
    with tempfile.TemporaryDirectory(prefix='l5r-g1-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        harness = HARNESS[unit]
        r = subprocess.run([NODE, '--require', str(SPLASH_FAST), str(harness), str(page)], cwd=str(harness.parent),
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
