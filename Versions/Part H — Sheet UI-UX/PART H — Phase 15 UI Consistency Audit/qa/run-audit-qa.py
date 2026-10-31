"""One fail-closed chain: 4x sensitive leaves, discovery, then two fresh full proofs."""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys

Q = Path(__file__).resolve().parent
V = Q.parents[2]
SHEET = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
EXPECTED = 'a25ace916f29d5c1647731db0ab2d7e97bd23bbdd6312c9631bd9d4ba416c7f2'
STATE = Q / 'chain-result.json'
assert not STATE.exists(), 'One launch only; preserve evidence and investigate any failure.'
state = {'started_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'expected_sha256': EXPECTED,
         'stages': [], 'usage_start': 'Unavailable: computer-use app approval timed out; requested owner reading.',
         'model': 'GPT-6 family; exact product selection unavailable', 'effort': 'runtime setting unavailable'}
def save():
    STATE.write_bytes((json.dumps(state, indent=2) + '\n').encode())
def frozen():
    assert hashlib.sha256(SHEET.read_bytes()).hexdigest() == EXPECTED, 'Production build changed'
def mains():
    status = (ctypes.c_byte * 12)()
    assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(status)) and status[0] == 1, 'Mains power required'
os.environ['PYTHONUTF8'] = '1'
save()
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    for label, args in [('under-load', ['run-under-load.py', 'under-load-1']),
                        ('discovery', ['discovery.py', 'discovery-1']),
                        ('full-twice', ['run-final-twice.py', '1'])]:
        frozen()
        mains()
        entry = {'stage': label, 'started_utc': datetime.datetime.now(datetime.timezone.utc).isoformat()}
        state['stages'].append(entry)
        save()
        with (Q / (label + '-launch.log')).open('wb') as log:
            result = subprocess.run([sys.executable, '-B', str(Q / args[0]), *args[1:]], stdout=log, stderr=subprocess.STDOUT)
        entry.update(exit=result.returncode, finished_utc=datetime.datetime.now(datetime.timezone.utc).isoformat())
        save()
        assert result.returncode == 0, label + ' failed; later stages were not started'
        frozen()
    state['passed'] = True
except Exception as error:
    state.update(passed=False, error=str(error))
    raise
finally:
    state['finished_utc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    save()
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
