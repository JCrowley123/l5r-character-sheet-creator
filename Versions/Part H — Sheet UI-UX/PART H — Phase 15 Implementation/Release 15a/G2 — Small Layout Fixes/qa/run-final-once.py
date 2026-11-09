"""The one full QA pass for Release 15a group G2 (screen-only tier: one pass, counts pinned by arithmetic, no discovery
run), with the display and system held awake. It is final-qa.py in its own new folder (final-run-1); nothing is reused,
and a failed pass is kept and investigated, never re-run. Adapted from A03's run-final-twice.py (one run, not two).
Usage: python -B run-final-once.py"""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys


Q = Path(__file__).resolve().parent
prefix=(Q/'qualified-sha256.txt').read_text().strip()[:8]
qualified = json.loads((Q / ('qualification-'+prefix+'-a11-fixture.json')).read_bytes())  # separate, truthful continuation; original failure retained
assert qualified.get('passed') is True and all(s['exit'] == 0 for s in qualified['stages'])
assert [s['label'] for s in qualified['stages']] == ['removal-fixture-proof', 'variants-final', 'dependencies']
assert qualified['stages'][0]['original_failure_preserved'] is True
original = json.loads((Q / qualified['original_failed_chain']).read_bytes())
assert original['passed'] is False and original['stages'][0]['exit'] == 1
assert hashlib.sha256((Q / qualified['original_failed_chain']).read_bytes()).hexdigest() == qualified['original_failed_chain_sha256']
for label, digest in qualified['fixture_validation_log_sha256'].items():
    assert hashlib.sha256((Q / 'a11-fixture-validation' / (label + '.log')).read_bytes()).hexdigest() == digest
proof_path = Q / 'a11-fixture-validation/summary.json'
assert hashlib.sha256(proof_path.read_bytes()).hexdigest() == qualified['stages'][0]['proof_sha256']
assert json.loads(proof_path.read_bytes()) == qualified['fixture_validation']
fix = qualified['fixture_validation']['fixture_change']
a11 = Q.parent.parent / 'A11 — Explanatory Text Gaps and One Left Edge/qa'
for name, key in [('g2-fixtures.json', 'new_fixture_sha256'), ('text-edges-harness.js', 'harness_sha256'), ('expected-checks.json', 'expected_checks_sha256')]:
    assert hashlib.sha256((a11 / name).read_bytes()).hexdigest() == fix[key], 'A11 input changed after scoped proof'
source = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file()) / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
assert qualified['sha256'] == (Q / 'qualified-sha256.txt').read_text().strip() == hashlib.sha256(source.read_bytes()).hexdigest()
power = (ctypes.c_byte * 12)()
assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0] == 1, 'Mains power required'
lock = Q / 'full-launched.txt'
with lock.open('x', encoding='utf-8') as marker:
    marker.write(datetime.datetime.now(datetime.timezone.utc).isoformat() + '\n')
os.environ['NODE_PATH'] = 'C:/Users/jcrow/l5r-qa-tools/node_modules'
os.environ['PYTHONUTF8'] = '1'
os.environ['PLAYWRIGHT_BROWSERS_PATH'] = 'C:/Users/jcrow/l5r-qa-tools/ms-playwright'
os.environ.pop('NODE_OPTIONS', None)  # Preloads are leaf-only.
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)  # continuous, system and display required
try:
    for run in (1,):
        assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0] == 1, 'Mains power required'
        print(datetime.datetime.now(datetime.timezone.utc).isoformat() + ' start run ' + str(run), flush=True)
        args = [sys.executable, '-B', str(Q / 'final-qa.py'), '--run=' + str(run)]
        code = subprocess.call(args)
        print(datetime.datetime.now(datetime.timezone.utc).isoformat() + ' run ' + str(run) + ' exit ' + str(code), flush=True)
        if code:
            sys.exit(code)
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
