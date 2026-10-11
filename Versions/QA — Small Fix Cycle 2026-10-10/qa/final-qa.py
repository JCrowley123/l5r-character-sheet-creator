"""One frozen-candidate regression, independent current-tree removals, and exact history restoration.

Runs browsers strictly sequentially. Every harness has a pinned nonzero total. Any failed
subprocess, count, removal or hash exits nonzero. Scratch roots are owned TemporaryDirectories.
"""
from pathlib import Path
import datetime, hashlib, json, os, re, shutil, subprocess, sys, tempfile, time
QA=Path(__file__).resolve().parent; V=QA.parent.parent
P0=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE=shutil.which('node') or 'C:/Program Files/nodejs/node.exe'
CONFIG=json.loads((QA/'suite-plan.json').read_text(encoding='utf-8'))
LOG=QA/'final'; LOG.mkdir(exist_ok=True)
summary={'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cases':[],'restores':[]}
def save(): (LOG/'summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
def suite(tree,keep,label):
    t=time.time(); counts=[]; log=[]
    for item in [CONFIG['base']]+[h for layer in CONFIG['layers'] if layer['id'] in keep for h in layer['harnesses']]:
        p=subprocess.run([NODE,str(V/item['file']),str(tree/'l5r-character-sheet.html')],capture_output=True,text=True,encoding='utf-8',timeout=7200)
        text=p.stdout+p.stderr;log.append(text)
        matches=re.findall(r'(\d+)/(\d+) checks passed',text); got=list(map(int,matches[-1])) if matches else []
        counts.append({'file':item['file'],'got':got,'expected':item['count'],'exit':p.returncode})
        (LOG/(label+'.log')).write_text('\n'.join(log),encoding='utf-8')
        assert p.returncode==0 and got==[item['count'],item['count']],counts[-1]
    result={'label':label,'checks':sum(c['expected'] for c in counts),'counts':counts,'minutes':round((time.time()-t)/60,2)}
    summary['cases'].append(result);save();print(label+': '+str(result['checks'])+' passed',flush=True)
def remove(tree,layer,expected=None):
    cmd=[sys.executable,'-B',str(V/layer['folder']/'qa/remove-phase.py'),str(tree)]
    if expected:cmd+=['--expect-sha',expected]
    p=subprocess.run(cmd,capture_output=True,text=True,encoding='utf-8');assert p.returncode==0,p.stdout+p.stderr
    b=subprocess.run([sys.executable,'-B',str(tree/'build/recombine.py'),'--verify'],capture_output=True,text=True,encoding='utf-8');assert b.returncode==0,b.stdout+b.stderr
    return hashlib.sha256((tree/'l5r-character-sheet.html').read_bytes()).hexdigest()
def copy(root,name):
    target=root/name;assert root.resolve() in target.resolve().parents
    shutil.copytree(P0,target,ignore=shutil.ignore_patterns('__pycache__'));return target
def main():
    frozen=hashlib.sha256((P0/'l5r-character-sheet.html').read_bytes()).hexdigest()
    summary['source_sha256']=frozen;save()
    suite(P0,[1,2,3],'01-full')
    with tempfile.TemporaryDirectory(prefix='l5r-cycle-final-') as scratch:
        root=Path(scratch).resolve(); assert root.parent==Path(tempfile.gettempdir()).resolve()
        # Each removal starts from the CURRENT tree. Independent later layers must survive.
        for label,removed,kept in [('02-without-skills',[3],[1,2]),('03-without-pdf',[2],[1,3]),('04-without-print-and-pdf',[2,1],[3])]:
            tree=copy(root,label)
            for i in removed:remove(tree,CONFIG['layers'][i-1])
            suite(tree,kept,label)
        tree=copy(root,'history')
        stages=json.loads((QA/'stages.json').read_text(encoding='utf-8'))
        for layer,stage in zip(reversed(CONFIG['layers']),reversed(stages)):
            digest=remove(tree,layer,stage['before_sha'])
            assert digest==stage['before_sha']
            summary['restores'].append({'removed':layer['folder'],'sha':digest,'bytes':(tree/'l5r-character-sheet.html').stat().st_size});save()
    assert hashlib.sha256((P0/'l5r-character-sheet.html').read_bytes()).hexdigest()==frozen
    summary['finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();summary['passed']=True;save()
    print('FINAL QA PASSED',flush=True)
if __name__=='__main__':
    try:main()
    except Exception as error:
        summary['passed']=False;summary['error']=str(error);save();raise
