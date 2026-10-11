"""Refresh the two unfinished layers and their exact historical restore points."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess,sys
q=Path(__file__).resolve().parent;v=q.parent.parent
p=v/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
for folder,names in [('PART K — Phase 11.1 Export to PDF',['209.999999993-feat-export-pdf.js','59.999986-feat-export-pdf.css']),('BUGFIX — Skill Traits',['209.999999994-bugfix-skill-traits.js'])]:
    for n in names:shutil.copyfile(v/folder/'source'/n,p/'src'/('css' if n.endswith('.css') else 'sheet')/n)
m=p/'build/manifest.json';txt=m.read_bytes().decode('utf-8');manifest=json.loads(txt)
fragments=[(x['file'],(p/x['file']).read_bytes()) for x in manifest['fragments']]
current=b'\n'.join(b for n,b in fragments);sha=hashlib.sha256(current).hexdigest()
txt=re.sub(r'("expect_sha256"\s*:\s*")[^"]+',lambda m:m[1]+sha,txt);m.write_bytes(txt.encode('utf-8'))
subprocess.run([sys.executable,'-B',str(p/'build/recombine.py'),'--verify'],check=True)
prior=[]
for n,b in fragments:
    if n.endswith('209.999999994-bugfix-skill-traits.js'):continue
    if n.endswith('210-test-seam-and-init.js'):
        b,count=re.subn(rb'  // BUGFIX SKILLTRAITS BEGIN skill-traits-seam\r?\n.*?  // END SKILLTRAITS skill-traits-seam\r?\n',b'',b,flags=re.S)
        assert count==1
    prior.append(b)
prev=b'\n'.join(prior);prevsha=hashlib.sha256(prev).hexdigest()
stages=json.loads((q/'stages.json').read_text(encoding='utf-8'))
stages[1].update(sha=prevsha,bytes=len(prev));stages[2].update(before_sha=prevsha,before_bytes=len(prev),sha=sha,bytes=len(current))
(q/'stages.json').write_text(json.dumps(stages,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
r=v/'BUGFIX — Skill Traits/qa/remove-phase.py';s=r.read_bytes().decode('utf-8')
s=re.sub(r'^PRE_RELEASE_SHA\s*=.*$', 'PRE_RELEASE_SHA = '+repr(prevsha),s,flags=re.M)
s=re.sub(r'^PRE_RELEASE_BYTES\s*=.*$', 'PRE_RELEASE_BYTES = '+str(len(prev)),s,flags=re.M);r.write_bytes(s.encode('utf-8'))
print('PDF stage:',prevsha,len(prev));print('Current:',sha,len(current))
