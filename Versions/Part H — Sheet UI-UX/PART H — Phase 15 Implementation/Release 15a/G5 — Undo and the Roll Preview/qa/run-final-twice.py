"""Two fresh full QA passes, one after the other, with the display and system held awake for the whole time.
Run 2 starts only if run 1 passed. Each pass is final-qa.py in its own new folder (final-run-<n>); nothing is reused.
Usage: python -B run-final-twice.py <first run number>  (e.g. 1 runs final-run-1 then final-run-2)."""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys


Q = Path(__file__).resolve().parent
first = int(sys.argv[1])
# Release 15a group G5, A08 alone (behaviour tier): one full qualification, runs 1 and 2, after the chain.
assert first == 1, 'G5 has one full qualification: runs 1 and 2 only'
prefix=(Q/'qualified-sha256.txt').read_text().strip()[:8]
# 18 November 2026: the first chain stopped at the 4x CPU screen (162/163) and is kept; after the documented correction of
# A08's listed-character wait, continue-after-a08-wait.py recorded the qualification separately. Only that record opens
# the full passes, and the kept failure, the proof and A08's harness must still be exactly as it recorded them.
qualified = json.loads((Q / ('qualification-'+prefix+'-a08-wait.json')).read_bytes())  # separate, truthful continuation
assert qualified.get('passed') is True and all(s['exit'] == 0 for s in qualified['stages'])
assert [s['label'] for s in qualified['stages']] == ['removal-final', 'variants-final', 'dependencies', 'under-load-a08-proof']
assert qualified['stages'][3]['original_failure_preserved'] is True
original = json.loads((Q / qualified['original_failed_chain']).read_bytes())
assert original['passed'] is False and [s['exit'] for s in original['stages']] == [0, 0, 0, 1]
assert hashlib.sha256((Q / qualified['original_failed_chain']).read_bytes()).hexdigest() == qualified['original_failed_chain_sha256']
proof_path = Q / 'a08-wait-validation/summary.json'
assert hashlib.sha256(proof_path.read_bytes()).hexdigest() == qualified['proof_sha256']
assert json.loads(proof_path.read_bytes()) == qualified['proof']
a08 = Q.parent.parent / 'A08 — One Undo for Quick Taps/qa'
for name, key in [('quick-tap-undo-harness.js', 'new_harness_sha256'), ('expected-checks.json', 'expected_checks_sha256'), ('dense-kuni.l5r.json', 'character_sha256')]:
    assert hashlib.sha256((a08 / name).read_bytes()).hexdigest() == qualified['wait_change'][key], 'A08 input changed after the scoped proof'
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
os.environ.pop('NODE_OPTIONS', None)  # The QA-tools Chromium; preloads are leaf-only.
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)  # continuous, system and display required
try:
    for run in (first, first + 1):
        assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0] == 1, 'Mains power required'
        print(datetime.datetime.now(datetime.timezone.utc).isoformat() + ' start run ' + str(run), flush=True)
        args = [sys.executable, '-B', str(Q / 'final-qa.py'), '--run=' + str(run)]
        code = subprocess.call(args)
        print(datetime.datetime.now(datetime.timezone.utc).isoformat() + ' run ' + str(run) + ' exit ' + str(code), flush=True)
        if code:
            sys.exit(code)
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
