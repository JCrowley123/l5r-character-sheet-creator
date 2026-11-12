"""Fail-closed preflight for Release 15a group G3 (screen-only tier: no full-suite discovery, and no 4x CPU screen because
G3 adds no timing or animation; its one observer is the kind A04.1 qualified with in G2). Does not launch or retry full QA."""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys

Q=Path(__file__).resolve().parent
V=next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
PH=Q
PREFIX=(Q/'qualified-sha256.txt').read_text().strip()[:8]
# Release 15a group G3 (G2's chain, constants only). One chain for this candidate; a failed stage is kept and
# investigated, never re-run.
ATTEMPT=''
LOCK='full-launched.txt'
STATE=Q/('qualification-'+PREFIX+ATTEMPT+'.json')
assert not (Q/LOCK).exists(), 'The full run is single-use.'
assert not STATE.exists(), 'One qualification chain only; retain and investigate failures.'
FROZEN=(Q/'qualified-sha256.txt').read_text().strip()
os.environ.update(PYTHONUTF8='1', NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PLAYWRIGHT_BROWSERS_PATH='C:/Users/jcrow/l5r-qa-tools/ms-playwright')
os.environ.pop('NODE_OPTIONS', None)  # Use the pinned QA-tools Chromium, not the old Chrome shim.
state={'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':FROZEN,'stages':[]}
def save(): STATE.write_bytes((json.dumps(state,indent=2)+'\n').encode())
def run(label,args,cwd=None):
    assert hashlib.sha256((P/'l5r-character-sheet.html').read_bytes()).hexdigest()==FROZEN
    stage={'label':label,'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    state['stages'].append(stage);save()
    with (Q/(label+'-'+PREFIX+ATTEMPT+'.log')).open('xb') as log:
        result=subprocess.run(args,cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
    stage.update(exit=result.returncode,finished_utc=datetime.datetime.now(datetime.timezone.utc).isoformat());save()
    assert result.returncode==0,label+' failed; later stages were not started'
    print(label+' passed',flush=True)
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    power=(ctypes.c_byte*12)()
    assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0]==1,'Mains power required'
    run('removal-final',[sys.executable,'-B',str(Q/'test-removal-group.py')])
    run('variants-final',[sys.executable,'-B',str(Q/'verify-variants.py')])
    run('dependencies',[sys.executable,'-B',str(Q/'dependencies.py')],str(P))
    state['passed']=True
except Exception as e:
    state.update(passed=False,error=str(e));raise
finally:
    state['finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
