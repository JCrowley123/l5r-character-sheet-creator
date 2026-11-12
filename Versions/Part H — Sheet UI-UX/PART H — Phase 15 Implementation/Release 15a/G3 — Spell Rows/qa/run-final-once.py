"""The one full QA pass for Release 15a group G3 (screen-only tier: one pass, counts pinned by arithmetic, no full-suite
discovery), with the display and system held awake. It is final-qa.py in its own new folder (final-run-1); nothing is
reused, and a failed pass is kept and investigated, never re-run. G2's launcher without G2's continuation checks.
Usage: python -B run-final-once.py"""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys


Q = Path(__file__).resolve().parent
prefix = (Q / 'qualified-sha256.txt').read_text().strip()[:8]
qualified = json.loads((Q / ('qualification-' + prefix + '.json')).read_bytes())
assert qualified.get('passed') is True and all(s['exit'] == 0 for s in qualified['stages'])
assert [s['label'] for s in qualified['stages']] == ['removal-final', 'variants-final', 'dependencies']
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
    assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0] == 1, 'Mains power required'
    print(datetime.datetime.now(datetime.timezone.utc).isoformat() + ' start run 1', flush=True)
    code = subprocess.call([sys.executable, '-B', str(Q / 'final-qa.py'), '--run=1'])
    print(datetime.datetime.now(datetime.timezone.utc).isoformat() + ' run 1 exit ' + str(code), flush=True)
    sys.exit(code)
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
