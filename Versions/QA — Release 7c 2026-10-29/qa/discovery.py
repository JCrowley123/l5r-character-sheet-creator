"""Release 7c: one discovery run of the candidate suite (flat-suite-runner.js), to find older checks the layers affect
before the full runs. Display and system held awake. Fresh folder only. Usage: python -B discovery.py <folder name>"""
from pathlib import Path
import ctypes, os, subprocess, sys

Q = Path(__file__).resolve().parent
P = Q.parent.parent / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
OUT = Q / sys.argv[1]
OUT.mkdir(exist_ok=False)
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1', L5R_QA_RUN_DIR=str(OUT),
                  NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"')
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    with (OUT / 'full.log').open('wb') as f:
        code = subprocess.call([r'C:\Program Files\nodejs\node.exe', str(Q / 'flat-suite-runner.js'), str(P / 'l5r-character-sheet.html')],
                               stdout=f, stderr=subprocess.STDOUT, cwd=str(Q))
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
print('exit', code)
sys.exit(code)
