"""One-use G5 continuation after the documented correction of A08's listed-character wait (18 November 2026, Claude;
G2's continue-after-a11-fixture.py as the model). Never re-runs or rewrites the failed chain. It checks the chain's
failure exactly as kept (three stages passed; the 4x CPU screen 162/163, its one failed leaf A08's harness 20/21 on
QT-LISTED-PLAY-AUTOSAVE-MERGED-DESKTOP alone), the change record, the scoped proof and every hash, and that nothing
but A08's harness and G5's own records changed since the failed chain was committed. Every stage has started, so none
runs here: it records the qualification as a separate file, which run-final-twice.py requires."""
from pathlib import Path
import datetime, hashlib, json, re, subprocess

Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
ROOT = V.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
A = Q.parent.parent / 'A08 — One Undo for Quick Taps/qa'
FAILED_COMMIT = 'c49f90b2'
FROZEN = (Q / 'qualified-sha256.txt').read_text().strip()
PREFIX = FROZEN[:8]
STATE = Q / ('qualification-' + PREFIX + '-a08-wait.json')
assert not STATE.exists() and not (Q / 'full-launched.txt').exists()
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(P / 'l5r-character-sheet.html') == FROZEN
# The failed chain, as kept.
old_path = Q / ('qualification-' + PREFIX + '.json')
old = json.loads(old_path.read_bytes())
assert old['sha256'] == FROZEN and old['passed'] is False
assert [(s['label'], s['exit']) for s in old['stages']] == [('removal-final', 0), ('variants-final', 0), ('dependencies', 0), ('under-load-final', 1)]
read = lambda name: (Q / name).read_text(encoding='utf-8')
assert read('removal-final-' + PREFIX + '.log').strip().endswith('9/9 checks passed')
assert 'All 6 negative variants matched their pinned failures.' in read('variants-final-' + PREFIX + '.log')
assert 'DEPENDENCIES PASSED: 1/1' in read('dependencies-' + PREFIX + '.log')
screen = read('under-load-final-' + PREFIX + '.log')
assert re.findall(r'^FAIL (.+)$', screen, re.M) == ['quick-tap-undo-harness.js [20, 21]']
assert len(re.findall(r'^PASS ', screen, re.M)) == 162 and screen.strip().endswith('UNDER LOAD 162/163 leaves passed at CPU x4')
results = json.loads((Q / ('under-load-final-' + PREFIX) / 'results.json').read_bytes())
assert len(results) == 163 and [Path(r['file']).name for r in results if not r['passed']] == ['quick-tap-undo-harness.js']
leaf = (Q / ('under-load-final-' + PREFIX) / '001-quick-tap-undo-harness.cpu4.log').read_text(encoding='utf-8')
assert re.findall(r'^FAIL (\S+)', leaf, re.M) == ['QT-LISTED-PLAY-AUTOSAVE-MERGED-DESKTOP'] and leaf.strip().endswith('20/21 checks passed')
# The correction and its proof.
change = json.loads((Q / 'a08-wait-change.json').read_bytes())
assert change['app_sha256'] == FROZEN and change['failed_chain_commit'] == FAILED_COMMIT
assert sha(A / 'quick-tap-undo-harness.js') == change['new_harness_sha256']
assert sha(A / 'expected-checks.json') == change['expected_checks_sha256']
assert sha(A / 'dense-kuni.l5r.json') == change['character_sha256']
old_harness = subprocess.check_output(['git', 'show', FAILED_COMMIT + ':' + (A / 'quick-tap-undo-harness.js').relative_to(ROOT).as_posix()], cwd=ROOT)
assert hashlib.sha256(old_harness).hexdigest() == change['old_harness_sha256']
proof_path = Q / 'a08-wait-validation/summary.json'
proof = json.loads(proof_path.read_bytes())
assert proof['passed'] is True and proof['change'] == change and proof['app_sha256'] == FROZEN
labels = ['candidate', 'candidate-cpu4', 'AE3-removed', 'A08:baseline', 'A08:disabled', 'A08:no-catch-up', 'A08:no-merge',
          'A08:no-edit-end', 'A08:no-click-end']
assert [c['label'] for c in proof['cases']] == labels and all(c['passed'] for c in proof['cases'])
pins = json.loads((Q / 'variants.json').read_bytes())
for c in proof['cases']:
    assert sha(Q / 'a08-wait-validation' / (c['label'].replace(':', '-') + '.log')) == c['log_sha256']
    if c['label'].startswith('A08:'):
        assert c['exit'] == 1 and c['failed'] == sorted(pins[c['label']]) == sorted(c['expected_failures'])
    else:
        assert c['exit'] == 0 and c['counts'] == [21, 21] and c['failed'] == []
assert [c['page_sha256'] for c in proof['cases'][:2]] == [FROZEN, FROZEN]
assert proof['cases'][1]['cpu_rate'] == '4'
# Since the failed chain: no application change, and no executable test input but A08's harness and G5's own scripts.
changed = subprocess.check_output(['git', '-c', 'core.quotepath=false', 'diff', '--name-only', FAILED_COMMIT, '--', 'Versions'],
                                  cwd=ROOT, text=True, encoding='utf-8').splitlines()
for name in changed:
    p = ROOT / name
    assert not p.is_relative_to(P), 'Application source changed: ' + name
    assert p == A / 'quick-tap-undo-harness.js' or p.is_relative_to(Q.parent), 'Unexpected change: ' + name
assert any(ROOT / n == A / 'quick-tap-undo-harness.js' for n in changed)
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
state = {'started_utc': now, 'sha256': FROZEN,
         'original_failed_chain': old_path.name, 'original_failed_chain_sha256': sha(old_path),
         'original_under_load': {'passed': 162, 'total': 163, 'log_sha256': sha(Q / ('under-load-final-' + PREFIX + '.log')),
                                 'results_sha256': sha(Q / ('under-load-final-' + PREFIX) / 'results.json')},
         'wait_change': change, 'proof': proof, 'proof_sha256': sha(proof_path),
         'stages': [dict(s, from_original_chain=True) for s in old['stages'][:3]] + [
             {'label': 'under-load-a08-proof', 'exit': 0, 'original_failure_preserved': True,
              'note': 'The 162 other leaves passed in the original screen; A08\'s harness, corrected, passed 21/21 at 4x CPU in the scoped proof.'}],
         'passed': True, 'finished_utc': now}
STATE.write_bytes((json.dumps(state, indent=2) + '\n').encode())
print('Continuation recorded: ' + STATE.name)
