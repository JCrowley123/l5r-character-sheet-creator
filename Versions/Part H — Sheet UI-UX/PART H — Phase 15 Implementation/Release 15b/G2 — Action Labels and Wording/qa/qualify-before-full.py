"""Fail-closed preflight for Release 15b group 2 (B01, B03, B05, B09; screen-only tier: no full-suite discovery, and no 4x
CPU screen). B01, B03 and B05 wrap synchronously: words and classes are set as a row or a roll is made. B09 relabels the
picker in a MutationObserver callback, a microtask: it always completes before the next task, paint or input, so a slower
CPU cannot reorder it, and it has no timer, animation or wait (recorded in HANDOVER.md). Stages: the group's removal proof
(with the "15a removed, group kept" stage, the owner's decision 3) and the dependency check. Does not launch or retry full
QA. Group 1's qualify-before-full.py with this group's docstring; the stages are the same."""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys

Q=Path(__file__).resolve().parent
V=next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
PREFIX=(Q/'qualified-sha256.txt').read_text().strip()[:8]
# One chain for this candidate; a failed stage is kept and investigated, never re-run.
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
    run('dependencies',[sys.executable,'-B',str(Q/'dependencies.py')],str(P))
    state['passed']=True
except Exception as e:
    state.update(passed=False,error=str(e));raise
finally:
    state['finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
