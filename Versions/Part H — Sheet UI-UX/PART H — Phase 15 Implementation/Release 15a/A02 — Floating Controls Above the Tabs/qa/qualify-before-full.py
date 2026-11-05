"""Fail-closed preflight, then the one discovery run. Does not launch or retry full QA."""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, subprocess, sys

Q=Path(__file__).resolve().parent
V=next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
PH=Q
PREFIX=(Q/'qualified-sha256.txt').read_text().strip()[:8]
# Attempt 3: attempt 1 (qualification-<prefix>.json, under-load-<prefix>/) failed at the 4x screen on a harness timing
# fault in A02's own QA-PANEL-BESIDE-BUTTON; attempt 2 was stopped by hand inside its removal stage because attempt 1
# was still running its screen. Both are kept as they were (investigation/README.md).
# Attempt 4: attempt 3 passed and its full pass 2 failed when pwa-harness.js (Part F Phase 0.6) stalled. On the owner's
# ruling (5 November) the stall was fixed as its own unit (QA — PWA Harness Step Limits 2026-11-05), and the whole chain
# runs again from removal, with a fresh discovery folder; attempt 3's files and final-run-1/-2 are kept as they were.
# Revision 2 (owner's decision Revise, 5 November): a new candidate, so a new qualified-sha256.txt and a new prefix.
# Its first chain carries no attempt suffix; revision 1's files (prefix 1cc41d8c) are kept as they were.
ATTEMPT=''
DISCOVERY='discovery-3'
STATE=Q/('qualification-'+PREFIX+ATTEMPT+'.json')
assert not (Q/DISCOVERY).exists() and not (Q/'full-launched-3.txt').exists(), 'Discovery and full runs are single-use.'
assert not STATE.exists(), 'One qualification chain only; retain and investigate failures.'
FROZEN=(Q/'qualified-sha256.txt').read_text().strip()
os.environ.update(PYTHONUTF8='1',NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules',NODE_OPTIONS='--require "'+(V/'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').as_posix()+'"')
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
    run('removal-final',[sys.executable,'-B',str(Q/'test-removal.py')])
    run('variants-final',[sys.executable,'-B',str(Q/'verify-variants.py')])
    run('dependencies',[sys.executable,'-B',str(P/'qa/feature-dependencies.py'),'src/sheet/209.9999999999999996-feat-floating-strip.js','PART H PHASE 15.1.2','--also','fc15Strip','fc15-strip','fc15-on','--fc15-h','--fc15-base','--fc15-gap','--fc15-end','1128-floating-strip'],str(P))
    run('under-load-final',[sys.executable,'-B',str(Q/'run-under-load.py'),'under-load-'+PREFIX+ATTEMPT])
    run('discovery-launch',[sys.executable,'-B',str(Q/'discovery.py'),DISCOVERY])
    state['passed']=True
except Exception as e:
    state.update(passed=False,error=str(e));raise
finally:
    state['finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
