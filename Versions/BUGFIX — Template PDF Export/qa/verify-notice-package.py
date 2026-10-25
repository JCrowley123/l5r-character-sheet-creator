"""One-off release verification; reads the app and local deployment only."""
from pathlib import Path
import hashlib,json,subprocess,sys
from html.parser import HTMLParser

v=next(p for p in Path(__file__).resolve().parents if (p/'BUILD-LEDGER.md').is_file());repo=v.parent
base=v/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
layer=v/'BUGFIX — Template PDF Export'
if len(sys.argv)!=2: raise SystemExit('Usage: python verify-notice-package.py <local-deploy-directory>')
deploy=Path(sys.argv[1]).resolve()
old='3ebb03d7fb19b6fe7ac5dcf7fa075b9d3304a2e7b73ab0f0c44b5ea854f7c222'
sha=lambda b:hashlib.sha256(b).hexdigest()
checks=[]
def check(name,condition):
    checks.append({'check':name,'passed':bool(condition)})
    print(('PASS ' if condition else 'FAIL ')+name)
notice=(layer/'vendor/THIRD-PARTY-NOTICES.txt').read_bytes().decode()
block=('  // PDF dependency notices begin\n'+''.join(('  // '+x).rstrip()+'\n' for x in notice.splitlines())+'  // PDF dependency notices end\n').encode()
html=(base/'l5r-character-sheet.html').read_bytes()
check('One exact notice block in standalone HTML',html.count(block)==1)
check('Removing only notice restores fully tested bytes',sha(html.replace(block,b'',1))==old)
check('All notice lines are JavaScript comments',all(x.startswith(b'  //') for x in block.splitlines()))
check('No HTML script delimiter or JS line separator in notices',all(x not in block.lower() for x in [b'</script',b'<!--',b'-->',b'\xe2\x80\xa8',b'\xe2\x80\xa9']))
m=json.loads((base/'build/manifest.json').read_text())
check('Build matches fragment bytes and manifest hash',html==b'\n'.join((base/x['file']).read_bytes() for x in m['fragments']) and sha(html)==m['expect_sha256'])
assets=json.loads((layer/'asset-manifest.json').read_text())
check('All original and notice asset hashes match',all(sha((layer/f).read_bytes())==r['sha256'] and (layer/f).stat().st_size==r['bytes'] for f,r in assets.items()))
published=(deploy/'index.html').read_bytes()
head=(v/'Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App/src/head-pwa.html').read_bytes().rstrip(b'\n')+b'\n'
check('Local deployment carries notices exactly once',published.count(block)==1)
check('Deployed HTML differs only by known PWA head',published.count(head)==1 and published.replace(head,b'',1)==html)
digest=hashlib.sha256(published)
for rel in ['manifest.webmanifest']+['icons/'+p.name for p in sorted((deploy/'icons').glob('*.png'))]:
    digest.update(rel.encode());digest.update((deploy/rel).read_bytes())
build_id=digest.hexdigest()[:16]
check('Service worker carries computed deployment ID',build_id in (deploy/'sw.js').read_text() and '__BUILD_ID__' not in (deploy/'sw.js').read_text())
check('CLAUDE instructions retain eight CR bytes',(v/'CLAUDE.md').read_bytes().count(b'\r')==8)
class Scripts(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=False);self.active=False;self.parts=[]
    def handle_starttag(self,tag,attrs):
        if tag=='script':
            a=dict(attrs);self.active=not a.get('src') and a.get('type','') in ('','text/javascript','application/javascript')
            if self.active:self.parts.append('')
    def handle_endtag(self,tag):
        if tag=='script':self.active=False
    def handle_data(self,data):
        if self.active:self.parts[-1]+=data
parser=Scripts();parser.feed(published.decode())
proc=subprocess.run(['node','-e','const vm=require("vm");for(const [i,s] of JSON.parse(require("fs").readFileSync(0,"utf8")).entries())new vm.Script(s,{filename:"inline-"+i});'],input=json.dumps(parser.parts),text=True,capture_output=True,encoding='utf-8')
check('All executable inline scripts parse',proc.returncode==0 and len(parser.parts)>0)
if proc.returncode:print(proc.stderr[:1000])
result={'checks':checks,'passed':all(x['passed'] for x in checks),'standalone_sha256':sha(html),'standalone_bytes':len(html),'tested_pre_notice_sha256':old,'local_deployment_sha256':sha(published),'service_worker_build_id':build_id,'inline_scripts_parsed':len(parser.parts),'live_deployment_verified':False}
(layer/'qa/evidence/notice-packaging.json').write_bytes((json.dumps(result,indent=2)+'\n').encode())
print(f"{sum(x['passed'] for x in checks)}/{len(checks)} packaging checks passed")
sys.exit(0 if result['passed'] else 1)
