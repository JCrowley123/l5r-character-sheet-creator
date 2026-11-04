"""Fail-closed preflight, then the one discovery run. Does not launch or retry full QA."""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys

Q=Path(__file__).resolve().parent
V=next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
PH=Q
PREFIX=(Q/'qualified-sha256.txt').read_text().strip()[:8]
STATE=Q/('qualification-'+PREFIX+'.json')
assert not (Q/'discovery-1').exists() and not (Q/'full-launched.txt').exists(), 'Discovery and full runs are single-use.'
assert not STATE.exists(), 'One qualification chain only; retain and investigate failures.'
FROZEN=(Q/'qualified-sha256.txt').read_text().strip()
os.environ.update(PYTHONUTF8='1',NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules',NODE_OPTIONS='--require "'+(V/'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').as_posix()+'"')
state={'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':FROZEN,'stages':[]}
def save(): STATE.write_bytes((json.dumps(state,indent=2)+'\n').encode())
def run(label,args,cwd=None):
    assert hashlib.sha256((P/'l5r-character-sheet.html').read_bytes()).hexdigest()==FROZEN
    stage={'label':label,'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    state['stages'].append(stage);save()
    with (Q/(label+'-'+PREFIX+'.log')).open('xb') as log:
        result=subprocess.run(args,cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
    stage.update(exit=result.returncode,finished_utc=datetime.datetime.now(datetime.timezone.utc).isoformat());save()
    assert result.returncode==0,label+' failed; later stages were not started'
    print(label+' passed',flush=True)
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    power=(ctypes.c_byte*12)()
    assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0]==1,'Mains power required'
    run('removal-final',[sys.executable,'-B',str(Q/'test-removal.py')])
    run('variants-final',[sys.executable,'-B',str(Q/'verify-variants.py')])
    run('dependencies',[sys.executable,'-B',str(P/'qa/feature-dependencies.py'),'src/sheet/209.9999999999999995-feat-review-one-reminder.js','PART H PHASE 15.1.1','--also','rr15-reminder','REVIEW_ONE_REMINDER_ENABLED'],str(P))
    run('under-load-final',[sys.executable,'-B',str(Q/'run-under-load.py'),'under-load-'+PREFIX])
    run('discovery-launch',[sys.executable,'-B',str(Q/'discovery.py'),'discovery-1'])
    state['passed']=True
except Exception as e:
    state.update(passed=False,error=str(e));raise
finally:
    state['finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
