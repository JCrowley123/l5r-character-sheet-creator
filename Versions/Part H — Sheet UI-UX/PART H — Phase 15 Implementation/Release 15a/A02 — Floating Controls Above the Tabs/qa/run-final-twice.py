"""Two fresh full QA passes, one after the other, with the display and system held awake for the whole time.
Run 2 starts only if run 1 passed. Each pass is final-qa.py in its own new folder (final-run-<n>); nothing is reused.
Usage: python -B run-final-twice.py <first run number>  (e.g. 1 runs final-run-1 then final-run-2)."""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys


Q = Path(__file__).resolve().parent
first = int(sys.argv[1])
# Runs 1 and 2 followed attempt 3 (pass 2 failed; investigation/README.md). Runs 3 and 4 follow attempt 4, after the
# owner-approved harness fix; nothing from runs 1 and 2 is reused.
assert first == 3, 'After attempt 4, A02 has one full qualification left: runs 3 and 4 only'
prefix=(Q/'qualified-sha256.txt').read_text().strip()[:8]
qualified = json.loads((Q / ('qualification-'+prefix+'-4.json')).read_bytes())  # attempt 4; see investigation/README.md
assert qualified.get('passed') is True and all(s['exit'] == 0 for s in qualified['stages'])
assert [s['label'] for s in qualified['stages']] == ['removal-final', 'variants-final', 'dependencies', 'under-load-final', 'discovery-launch']
source = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file()) / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
assert qualified['sha256'] == (Q / 'qualified-sha256.txt').read_text().strip() == hashlib.sha256(source.read_bytes()).hexdigest()
power = (ctypes.c_byte * 12)()
assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0] == 1, 'Mains power required'
lock = Q / 'full-launched-2.txt'
with lock.open('x', encoding='utf-8') as marker:
    marker.write(datetime.datetime.now(datetime.timezone.utc).isoformat() + '\n')
os.environ['NODE_PATH'] = 'C:/Users/jcrow/l5r-qa-tools/node_modules'
os.environ['PYTHONUTF8'] = '1'
os.environ['NODE_OPTIONS'] = '--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'
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
