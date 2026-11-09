"""One-use G2 continuation after the documented A11 fixture-coverage correction.
Never reruns or rewrites the failed removal chain. Validates its exact failure and
the six scoped proofs, then runs only the still-unstarted variants and dependencies.
The application, assertions, minimum coverage and tolerances remain unchanged.
"""
from pathlib import Path
import ctypes, datetime, hashlib, json, os, re, subprocess, sys

Q=Path(__file__).resolve().parent
V=next(d for d in Q.parents if (d/'BUILD-LEDGER.md').is_file() and (d/'CLAUDE.md').is_file())
ROOT=V.parent
P=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
A=Q.parent.parent/'A11 — Explanatory Text Gaps and One Left Edge/qa'
FROZEN=(Q/'qualified-sha256.txt').read_text().strip()
PREFIX=FROZEN[:8]
STATE=Q/('qualification-'+PREFIX+'-a11-fixture.json')
assert not STATE.exists() and not (Q/'full-launched.txt').exists()
assert not (Q/('negative-'+PREFIX)).exists(),'Final variants must never have started'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(P/'l5r-character-sheet.html')==FROZEN
old=json.loads((Q/('qualification-'+PREFIX+'.json')).read_bytes())
assert old['sha256']==FROZEN and old['passed'] is False
assert len(old['stages'])==1 and old['stages'][0]['label']=='removal-final' and old['stages'][0]['exit']==1
removal=Q/('removal-final-'+PREFIX+'.log')
raw=removal.read_text(encoding='utf-8')
assert re.findall(r'^FAIL (.+)$',raw,re.M)==["A05-REMOVED-RUNS-A11 (22) [('21', '22')]"]
assert len(re.findall(r'^PASS ',raw,re.M))==46 and raw.strip().endswith('46/47 checks passed')
fix=json.loads((Q/'a11-fixture-change.json').read_bytes())
proof=json.loads((Q/'a11-fixture-validation/summary.json').read_bytes())
assert proof['passed'] and proof['fixture_change']==fix
assert sha(A/'g2-fixtures.json')==fix['new_fixture_sha256']
assert sha(A/'text-edges-harness.js')==fix['harness_sha256']
assert sha(A/'expected-checks.json')==fix['expected_checks_sha256']
expected={
 'candidate':(FROZEN,17609230),
 'A05-removed':('80db689d71a573fff5d2d23362cf9b920324af29f5785e8ed2539756058bfb37',17604577),
 'A06-removed':('ee77d7fe9635fadd1712c49809839a9bc5ac56789acd00aaf6aeeea1925a4880',17605342),
 'A07-removed':('3d0cad59e9b2bd20c4c3d97262e46451007c9617cbc28d1b70c607cf3c4db000',17606011),
 'A04.1-removed':('d8965a9f8c419d85e3587cc5ab5ec0798c75e0292036c0896c7d9a6f6aff3907',17602520),
 'A03.1-removed':('ae0a7cf649197e9fa15f84e240b591348f7a75bd4efd24cb28d265b62fa4f4de',17602768),
}
assert len(proof['cases'])==6 and {c['label'] for c in proof['cases']}==set(expected)
check_ids=json.loads((A/'expected-checks.json').read_bytes())['checks']
assert len(check_ids)==22 and len(set(check_ids))==22
log_hashes={}
for c in proof['cases']:
    assert c['exit']==0 and c['counts']==[22,22]
    assert (c['page_sha256'],c['page_bytes'])==expected[c['label']]
    log=(Q/'a11-fixture-validation'/(c['label']+'.log')).read_text(encoding='utf-8')
    assert len(re.findall(r'^PASS ',log,re.M))==22 and not re.search(r'^FAIL ',log,re.M)
    assert sorted(re.findall(r'^PASS (\S+)',log,re.M))==sorted(check_ids)
    log_hashes[c['label']]=sha(Q/'a11-fixture-validation'/(c['label']+'.log'))
# All application and executable harness inputs except the one declared fixture
# must still equal the pre-chain commit. This is a proof for this exact correction.
changed=subprocess.check_output(['git','-c','core.quotepath=false','diff','--name-only','c59cf065','--','Versions'],cwd=ROOT,text=True,encoding='utf-8').splitlines()
fixture=A/'g2-fixtures.json'
for name in changed:
    p=ROOT/name
    if p.is_relative_to(P): raise AssertionError('Application source changed: '+name)
    if p.suffix in ('.js','.cjs') or p.name in ('g2-fixtures.json','expected-checks.json'):
        assert p==fixture or p==Q/'diagnose-a11-coverage.cjs',name
old_fixture=subprocess.check_output(['git','show','c59cf065:'+fixture.relative_to(ROOT).as_posix()],cwd=ROOT)
assert hashlib.sha256(old_fixture).hexdigest()==fix['old_fixture_sha256']
state={'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':FROZEN,'original_failed_chain':'qualification-'+PREFIX+'.json','original_removal':{'passed':46,'total':47,'log_sha256':sha(removal)},'fixture_validation':proof,'stages':[{'label':'removal-fixture-proof','exit':0,'original_failure_preserved':True,'proof_sha256':sha(Q/'a11-fixture-validation/summary.json')}]}
state.update(original_failed_chain_sha256=sha(Q/('qualification-'+PREFIX+'.json')),fixture_validation_log_sha256=log_hashes)
save=lambda:STATE.write_text(json.dumps(state,indent=2)+'\n',encoding='utf-8',newline='\n')
os.environ.update(PYTHONUTF8='1',NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules',PLAYWRIGHT_BROWSERS_PATH='C:/Users/jcrow/l5r-qa-tools/ms-playwright');os.environ.pop('NODE_OPTIONS',None)
def run(label,args,cwd=ROOT):
    assert sha(P/'l5r-character-sheet.html')==FROZEN
    stage={'label':label,'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()};state['stages'].append(stage);save()
    with (Q/(label+'-'+PREFIX+'-a11-fixture.log')).open('xb') as log:
        result=subprocess.run(args,cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
    stage.update(exit=result.returncode,finished_utc=datetime.datetime.now(datetime.timezone.utc).isoformat());save()
    assert result.returncode==0,label+' failed; later stages not started'
    print(label+' passed',flush=True)
power=(ctypes.c_byte*12)();assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0]==1
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    save()
    run('variants-final',[sys.executable,'-B',str(Q/'verify-variants.py')])
    run('dependencies',[sys.executable,'-B',str(Q/'dependencies.py')],P)
    state['passed']=True
except Exception as e:
    state.update(passed=False,error=str(e));raise
finally:
    state['finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();save()
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
