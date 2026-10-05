"""Exercise every retained suite with either new School layer removed.

Every edit and deletion is inside a freshly allocated TemporaryDirectory.
The canonical tree is read only; only this release's QA evidence is written.
"""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,sys,tempfile,re
HERE=Path(__file__).resolve().parent
V=next(p for p in HERE.parents if (p/'BUILD-LEDGER.md').is_file())
LIVE=V/'Part F — Cross-Platform Delivery'/'PART F — Phase 0 Source Reorganization for Maintainability'
SUP=V/'PART I — Phase 4.7.1 Supplemental Advanced Schools'/'qa'
CORE=V/'PART I — Phase 4.7 Advanced Schools'/'qa'
NODE=shutil.which('node') or 'C:/Program Files/nodejs/node.exe'
BASE='b02aa5584cc90cbb948ece23980bcf5ae766d943eada6430c52353dead2e8950'
def run(harness,sheet,label):
    p=subprocess.run([NODE,str(harness),str(sheet)],capture_output=True,text=True,encoding='utf-8',timeout=3600)
    out=p.stdout+p.stderr
    (HERE/(label+'.log')).write_text(out,encoding='utf-8')
    counts=re.findall(r'(\d+)/(\d+) checks passed',out)
    assert counts,(label,out[-2000:])
    passed,total=map(int,counts[-1])
    result={'passed':passed,'total':total,'exit_code':p.returncode}
    print(label+': '+json.dumps(result),flush=True)
    return result
def remove(tree,qa):
    p=subprocess.run([sys.executable,'-B',str(qa/'remove-phase.py'),str(tree)],capture_output=True,text=True,encoding='utf-8')
    if p.returncode:raise RuntimeError(p.stdout+p.stderr)
def main():
    results={}
    with tempfile.TemporaryDirectory(prefix='l5r-school-independent-') as tmp:
        work=Path(tmp).resolve()
        for label,removed,retained in [('without-basic',HERE,SUP),('without-supplemental',SUP,CORE)]:
            tree=work/label
            assert tree.resolve().is_relative_to(work)
            shutil.copytree(LIVE,tree,ignore=shutil.ignore_patterns('l5r-character-sheet.html','__pycache__'))
            remove(tree,removed)
            subprocess.run([sys.executable,'-B',str(tree/'build/recombine.py'),'--verify'],check=True,capture_output=True)
            sheet=tree/'l5r-character-sheet.html'
            digest=hashlib.sha256(sheet.read_bytes()).hexdigest()
            prior=HERE/(label+'.log')
            if '--resume' in sys.argv and label=='without-basic' and digest=='a67ae916e00e82dcfd6ed555e2dc07a04eeaecb3604b9256ca8c812632445092' and prior.exists() and 'COMBINED 4192/4192 checks passed' in prior.read_text(encoding='utf-8'):
                results[label]={'passed':4192,'total':4192,'exit_code':0,'reused_identical_build':True}
                print('without-basic: reuse recorded 4192/4192 on identical build',flush=True)
            else:
                results[label]=run(retained/'current-suite-runner.js',sheet,label)
            results[label]['build_sha256']=digest
            results[label]['build_bytes']=sheet.stat().st_size
            (HERE/'independent-removal.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
            if label=='without-supplemental':
                results['basic-survives-supplemental-removal']=run(HERE/'basic-schools-harness.js',sheet,'basic-survives-supplemental-removal')
            remove(tree,SUP if removed==HERE else HERE)
            subprocess.run([sys.executable,'-B',str(tree/'build/recombine.py'),'--verify'],check=True,capture_output=True)
            digest=hashlib.sha256(sheet.read_bytes()).hexdigest()
            assert digest==BASE,(label,digest)
            results[label]['both_removed_sha256']=digest
        assert work.parent==Path(tempfile.gettempdir()).resolve()
    (HERE/'independent-removal.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
    return int(any(r['exit_code']!=0 or r['passed']!=r['total'] for r in results.values()))
if __name__=='__main__':sys.exit(main())
