#!/usr/bin/env python3
"""Mutation checks for Phase12.5. All mutations occur in temporary copies.

Normal run pins every expected failing acceptance assertion, and separately compares kill-off,
no-parent, and fully removed boundaries. --discover prints an oracle candidate for review; it does
not update the oracle. The removed baseline SHA is also pinned independently of the live build.
"""
from __future__ import annotations
import hashlib,importlib.util,json,re,shutil,subprocess,sys,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
LIVE=HERE.parents[1]/'Part F — Cross-Platform Delivery'/'PART F — Phase 0 Source Reorganization for Maintainability'
FRAGMENT='src/sheet/209.99993-feat-modes-advantages.js'
STYLE='src/css/59.9994-feat-modes-advantages.css'
HARNESS=HERE/'advantages-harness.js'
NODE=shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
BASELINE='7f187450905c96500f16015a3ffe0250d2a9ca49e24d882252a93061e3fc4ff0'
THIS_RELEASE='PART K — Phase 12.5 Play Mode Advantages and Disadvantages'
def removal_chain():
    location=HERE.parents[1]/'QA — Removal Chain Registry'/'removal_chain.py'
    spec=importlib.util.spec_from_file_location('removal_chain',location)
    module=importlib.util.module_from_spec(spec)
    sys.modules[spec.name]=module
    spec.loader.exec_module(module)
    return module
def edit(old,new,count=1,target=FRAGMENT):
    def apply(tree):
        p=tree/target;s=p.read_bytes().decode('utf-8')
        assert s.count(old)==count,(old,s.count(old),count)
        p.write_bytes(s.replace(old,new).encode('utf-8'))
    return apply
def removed(tree):
    subprocess.run([sys.executable,str(HERE/'remove-phase.py'),str(tree)],check=True,capture_output=True)
def no_css(tree):
    (tree/STYLE).write_bytes(b'  /* stylesheet deliberately omitted for mutation test */\n')
def globals_(tree):
    p=tree/FRAGMENT;s=p.read_bytes().decode('utf-8');assert '#advList .en-name' in s
    p.write_bytes(s.replace('#advList ', '').replace('#disadvList ', '').encode('utf-8'))
VARIANTS={
 'part removed':removed,
 'master switch off':edit('const MODES125_ENABLED = true;','const MODES125_ENABLED = false;'),
 'Hotei locked':edit('.adv-config-btn:not(.fb4521-hotei-roll)', '.adv-config-btn',2),
 'row name locks missing':edit("'#advList .en-name', '#advList .en-cost'","'#advList .missing-name', '#advList .en-cost'"),
 'remove locks missing':edit(".rm-btn'",".missing-remove'",2),
 'global scope':globals_,
 'draft not cancelled':edit("if(MODES12.isPlay() && typeof closeAdvConfigModal === 'function') closeAdvConfigModal();",'/* deliberately leave the draft alive */'),
 'inline locks missing':edit("'#disadvList .dep458-input', '#advList .wealth4517-btn',","'#disadvList .no-dependant', '#advList .no-wealthy',"),
 'grid and confirm missing':edit("'#advConfigGrid', '#advConfigConfirm'","'#no-config-grid', '#no-config-confirm'"),
 'no stylesheet':no_css,
}
def build(tree):
    subprocess.run([sys.executable,str(tree/'build/recombine.py')],check=True,capture_output=True)
def run(tree,*args):
    p=subprocess.run([NODE,str(HARNESS),str(tree/'l5r-character-sheet.html'),*args],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=180)
    output=p.stdout+p.stderr
    return p.returncode,output
def copy(work,name):
    tree=work/re.sub(r'\W+','-',name)
    shutil.copytree(LIVE,tree,ignore=shutil.ignore_patterns('l5r-character-sheet.html','dist','__pycache__'))
    removal_chain().strip_later(tree,after=THIS_RELEASE)
    return tree
def probe(tree):
    rc,out=run(tree,'--boundary-probe');match=re.search(r'^BOUNDARY (.+)$',out,re.M)
    assert rc==0 and match,out
    return json.loads(match[1])
def main():
    discover='--discover' in sys.argv
    wanted={} if discover else json.loads((HERE/'expected-failures.json').read_text(encoding='utf-8'))
    found={};bad=0;boundaries={}
    with tempfile.TemporaryDirectory(prefix='l5r-pm125-mutations-') as scratch:
        work=Path(scratch)
        for name,mutate in VARIANTS.items():
            tree=copy(work,name);mutate(tree);build(tree)
            if name=='part removed':
                actual=hashlib.sha256((tree/'l5r-character-sheet.html').read_bytes()).hexdigest()
                assert actual==BASELINE,(actual,BASELINE)
            rc,out=run(tree)
            failures=sorted(set(re.findall(r'^FAIL (\S+)',out,re.M)))
            count=re.search(r'\d+/\d+ checks passed',out)
            assert rc!=0 and failures and count,(name,out)
            found[name]={'failures':failures,'count':count[0]}
            good=discover or found[name]==wanted.get(name)
            bad+=not good
            print(('DISCOVER' if discover else 'OK' if good else 'BAD')+' '+name+': '+count[0]+'; '+str(len(failures))+' failing assertions',flush=True)
            if not good: print('Expected:',wanted.get(name),'\nActual:',found[name],flush=True)
            if name in ('part removed','master switch off'):boundaries[name]=probe(tree)
        tree=copy(work,'parent off');edit('const MODES12_ENABLED = true;','const MODES12_ENABLED = false;',target='src/sheet/209.9996-feat-play-management-modes.js')(tree);build(tree);boundaries['parent off']=probe(tree)
        expected_boundary={'typed':'Akiko','configVisible':True,'rowReadonly':False}
        for name,result in boundaries.items():
            good=result==expected_boundary;bad+=not good;print(('OK' if good else 'BAD')+' boundary '+name+': '+json.dumps(result),flush=True)
    if discover:print('ORACLE_JSON '+json.dumps(found,sort_keys=True))
    print('VARIANTS '+('all as expected' if not bad else str(bad)+' NOT as expected'))
    return int(bool(bad))
if __name__=='__main__':sys.exit(main())
