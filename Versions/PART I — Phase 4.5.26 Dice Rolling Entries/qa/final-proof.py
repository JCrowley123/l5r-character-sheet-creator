"""Read-only live tree; all removals and main-baseline execution use owned scratch copies."""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,sys,tempfile
HERE=Path(__file__).resolve().parent
V=HERE.parent.parent
REPO=V.parent
LIVE=V/'Part F — Cross-Platform Delivery'/'PART F — Phase 0 Source Reorganization for Maintainability'
FIX=V/'BUGFIX — Rank 0 Skill Rolls Explode'
NODE=shutil.which('node') or 'C:/Program Files/nodejs/node.exe'
BASE='319f4f48b81b132b696fdf0bfcf330e2ce9fb2faa6d45b5b6fb03c0556c80f7c'
def run(args,ok=True):
    p=subprocess.run([str(x) for x in args],capture_output=True,text=True,encoding='utf-8',timeout=1800)
    if ok and p.returncode:raise AssertionError(p.stdout+p.stderr)
    return p
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def inventory(path):return json.loads(run([sys.executable,'-B',LIVE/'qa/inventory.py',path]).stdout)
def main():
    with tempfile.TemporaryDirectory(prefix='l5r-dice-final-') as tmp:
        root=Path(tmp).resolve()
        baseline=root/'main.html'
        baseline.write_bytes(subprocess.check_output(['git','show','6e6da0b:'+str((LIVE/'l5r-character-sheet.html').relative_to(REPO)).replace('\\','/')],cwd=REPO))
        assert sha(baseline)==BASE
        old,current=inventory(baseline),inventory(LIVE/'l5r-character-sheet.html')
        allowed={'file','bytes','lines','sha256','sheet_script_sha256','script_sha256','script_lines'}
        assert {k:v for k,v in old.items() if k not in allowed}=={k:v for k,v in current.items() if k not in allowed}
        assert old['script_sha256'][1:]==current['script_sha256'][1:]
        print('PASS structural inventory: same IDs, sections, modal count, styles, tag balance and non-sheet scripts',flush=True)
        p=run([NODE,HERE/'dice-entries-harness.js',baseline],ok=False)
        assert p.returncode!=0 and '22/110 checks passed' in p.stdout,p.stdout+p.stderr
        print('PASS final 110-check harness on original main: 22/110 (expected failures)',flush=True)
        for label,order in [('entries-first',[HERE,FIX/'qa']),('fix-first',[FIX/'qa',HERE])]:
            copy=root/label
            shutil.copytree(LIVE,copy,ignore=shutil.ignore_patterns('__pycache__'))
            for q in order:
                result=json.loads(run([sys.executable,'-B',q/'remove-phase.py',copy]).stdout.split('\nSurgical')[0])
                run([sys.executable,'-B',copy/'build/recombine.py'])
                assert sha(copy/'l5r-character-sheet.html')==result['rebuild_sha256']
                print('PASS '+label+' removed '+q.parent.name+': '+result['rebuild_sha256'],flush=True)
                if q==HERE and len(list((copy/'src/sheet').glob('*bugfix-rank-zero.js'))):
                    result=run([NODE,FIX/'qa/rank-zero-harness.js',copy/'l5r-character-sheet.html'])
                    assert '19/19 checks passed' in result.stdout
                    print('PASS retained Rank 0 fix after entries removal: 19/19',flush=True)
            assert (copy/'l5r-character-sheet.html').read_bytes()==baseline.read_bytes()
            print('PASS '+label+' both removed: byte-identical main',flush=True)
        p=run([NODE,HERE/'surface-check.js',baseline,LIVE/'l5r-character-sheet.html',HERE])
        print(p.stdout,flush=True)
        assert root.parent==Path(tempfile.gettempdir()).resolve()
    print('FINAL PROOF PASS',flush=True)
if __name__=='__main__':main()
