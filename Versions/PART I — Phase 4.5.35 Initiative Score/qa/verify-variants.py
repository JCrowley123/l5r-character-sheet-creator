"""Scratch-only mutation and boundary checks. Discover first, review, then pin exact failures.
Each directory is a new TemporaryDirectory child. Never edits the live source tree.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import importlib.util,json,os,re,shutil,subprocess,sys,tempfile
HERE=Path(__file__).resolve().parent
V=next(p for p in HERE.parents if (p/'BUILD-LEDGER.md').is_file())
LIVE=V/'Part F \u2014 Cross-Platform Delivery'/'PART F \u2014 Phase 0 Source Reorganization for Maintainability'
CONFIG=json.loads((HERE/'variants.json').read_text(encoding='utf-8'))
NODE=shutil.which('node') or 'C:/Program Files/nodejs/node.exe'
spec=importlib.util.spec_from_file_location('removal_chain',V/'QA \u2014 Removal Chain Registry/removal_chain.py')
CHAIN=importlib.util.module_from_spec(spec);sys.modules[spec.name]=CHAIN;spec.loader.exec_module(CHAIN)
def run_one(work,label,definition):
    steps=definition if isinstance(definition,list) else definition['steps']
    harness=CONFIG['harness'] if isinstance(definition,list) else definition.get('harness',CONFIG['harness'])
    tree=work/re.sub(r'\W+','-',label)
    assert work.resolve() in tree.resolve().parents and not tree.exists()
    shutil.copytree(LIVE,tree,ignore=shutil.ignore_patterns('l5r-character-sheet.html','__pycache__'))
    CHAIN.strip_later(tree,after=HERE.parent.name)
    for step in steps:
        if 'remove' in step:
            remover=V/step['remove']/'qa/remove-phase.py'
            subprocess.run([sys.executable,'-B',str(remover),str(tree)],check=True,capture_output=True)
        else:
            p=tree/step['file'];assert tree.resolve() in p.resolve().parents
            text=p.read_bytes().decode('utf-8');assert text.count(step['old'])==1,(label,step['old'])
            p.write_bytes(text.replace(step['old'],step['new']).encode('utf-8'))
    subprocess.run([sys.executable,'-B',str(tree/'build/recombine.py')],check=True,capture_output=True)
    p=subprocess.run([NODE,str(HERE/harness),str(tree/'l5r-character-sheet.html')],capture_output=True,text=True,encoding='utf-8',timeout=1800)
    out=p.stdout+p.stderr
    counts=re.findall(r'(\d+)/(\d+) checks passed',out);assert counts,(label,out[-4000:])
    a,b=map(int,counts[-1]);failures=sorted(set(re.findall(r'^FAIL (.+?)(?: actual=|$)',out,re.M)))
    return {'passed':a,'total':b,'failures':failures},p.returncode
def main():
    discover='--discover' in sys.argv
    jobs=int(sys.argv[sys.argv.index('--jobs')+1]) if '--jobs' in sys.argv else 1
    expected={} if discover else json.loads((HERE/'expected-failures.json').read_text(encoding='utf-8'))
    found={};bad=0
    with tempfile.TemporaryDirectory(prefix='l5r-is4535-variants-') as tmp:
        work=Path(tmp).resolve()
        with ThreadPoolExecutor(max_workers=jobs) as pool:
            tasks=[(kind,label,pool.submit(run_one,work,kind+' '+label,steps)) for kind in ['variants','boundaries'] for label,steps in CONFIG[kind].items()]
            for kind,label,f in tasks:
                result,rc=f.result()
                if kind=='variants':
                    found[label]=result
                    good=rc!=0 and result['total']>0 and bool(result['failures']) and (discover or result==expected.get(label))
                else:good=rc==0 and result['passed']==result['total'] and result['total']>0
                bad+=not good
                print(('OK ' if good else 'BAD ')+kind+' '+label+': '+str(result['passed'])+'/'+str(result['total']),flush=True)
                if not good:print(json.dumps(result),flush=True)
        # TemporaryDirectory owns precisely this resolved scratch root and its descendants.
        assert work.parent==Path(tempfile.gettempdir()).resolve()
    if discover:print('ORACLE_JSON '+json.dumps(found,sort_keys=True))
    print('VARIANTS '+('all as expected' if not bad else str(bad)+' NOT as expected'))
    return int(bool(bad))
if __name__=='__main__':sys.exit(main())
