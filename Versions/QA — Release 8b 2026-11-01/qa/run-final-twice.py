"""Two fresh full QA passes, one after the other, with the display and system held awake for the whole time.
Run 2 starts only if run 1 passed. Each pass is final-qa.py in its own new folder (final-run-<n>); nothing is reused.
Usage: python -B run-final-twice.py <first run number>  (e.g. 1 runs final-run-1 then final-run-2)."""
from pathlib import Path
import ctypes, datetime, os, subprocess, sys

Q = Path(__file__).resolve().parent
first = int(sys.argv[1])
assert first == 1, 'Release 8b has one full qualification: runs 1 and 2 only'
lock = Q / 'full-launched.txt'
with lock.open('x', encoding='utf-8') as marker:
    marker.write(datetime.datetime.now(datetime.timezone.utc).isoformat() + '\n')
os.environ['NODE_PATH'] = 'C:/Users/jcrow/l5r-qa-tools/node_modules'
os.environ['PYTHONUTF8'] = '1'
os.environ['NODE_OPTIONS'] = '--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)  # continuous, system and display required
try:
    for run in (first, first + 1):
        power = (ctypes.c_byte * 12)()
        assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0] == 1, 'Mains power required'
        print(datetime.datetime.now(datetime.timezone.utc).isoformat() + ' start run ' + str(run), flush=True)
        code = subprocess.call([sys.executable, '-B', str(Q / 'final-qa.py'), '--run=' + str(run)])
        print(datetime.datetime.now(datetime.timezone.utc).isoformat() + ' run ' + str(run) + ' exit ' + str(code), flush=True)
        if code:
            sys.exit(code)
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
