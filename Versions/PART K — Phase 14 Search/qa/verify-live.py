"""Verify deployed bytes, service-worker version and the focused harnesses for Phases 14, 4.5.33 and 4.5.34.
Downloads stay in an owned temporary directory. Only QA evidence is retained.
"""
from pathlib import Path
import datetime,hashlib,json,os,re,shutil,subprocess,sys,tempfile,time,urllib.request
QA=Path(__file__).resolve().parent
V=QA.parents[1]
F=V/'Part F — Cross-Platform Delivery'
SOURCE=F/'PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
PWA=F/'PART F — Phase 0.6 Installable Web App'
URL='https://l5r-character-sheet-creator.pages.dev/'
def committed(path):
    # Deployment checks out Git blobs. Older PWA files in this Windows checkout
    # carry CRLF despite LF blobs; compare with deployment's actual inputs.
    rel=path.relative_to(V.parent).as_posix()
    return subprocess.check_output(['git','show','HEAD:'+rel],cwd=V.parent)
def download(name):
    req=urllib.request.Request(URL+name+'?search14='+str(int(time.time())),headers={'Cache-Control':'no-cache','User-Agent':'L5R release verification'})
    with urllib.request.urlopen(req,timeout=45) as response:return response.read()
def main():
    head=committed(PWA/'src/head-pwa.html').decode('utf-8').rstrip('\n')+'\n'
    expected=SOURCE.read_bytes().decode('utf-8').replace('</head>',head+'</head>',1).encode('utf-8')
    actual=download('')
    if actual!=expected:
        print('DEPLOYMENT NOT CURRENT: expected '+hashlib.sha256(expected).hexdigest()+' got '+hashlib.sha256(actual).hexdigest())
        print('Bytes expected/actual:',len(expected),len(actual),'Search present:',b'const SEARCH_ENABLED = true;' in actual)
        first=next((i for i,(a,b) in enumerate(zip(expected,actual)) if a!=b),min(len(expected),len(actual)))
        print('First difference at',first,'expected:',repr(expected[max(0,first-50):first+110]),'actual:',repr(actual[max(0,first-50):first+110]))
        return 2
    digest=hashlib.sha256(expected)
    for name in ['manifest.webmanifest']+['icons/'+p.name for p in sorted((PWA/'icons').glob('*.png'))]:
        digest.update(name.encode('utf-8'))
        digest.update(committed(PWA/('src' if name=='manifest.webmanifest' else '')/name))
    sw_id=digest.hexdigest()[:16]
    sw_expected=committed(PWA/'src/sw.js').replace(b'__BUILD_ID__',sw_id.encode('ascii'))
    assert download('sw.js')==sw_expected,'Deployed service worker differs from this build'
    lines=['Live page matches expected PWA build byte for byte.','Service worker matches build '+sw_id+'.']
    counts=[]
    with tempfile.TemporaryDirectory(prefix='l5r-search14-live-') as tmp:
        folder=Path(tmp).resolve();sheet=folder/'index.html';sheet.write_bytes(actual)
        for harness,want in [(QA/'search-harness.js',61),(V/'PART I — Phase 4.5.33 Void and Initiative Entries/qa/void-initiative-harness.js',38),(V/'PART I — Phase 4.5.34 Blind Armor TN Note/qa/blind-note-harness.js',11)]:
            p=subprocess.run([shutil.which('node') or 'C:/Program Files/nodejs/node.exe',str(harness),str(sheet)],capture_output=True,text=True,encoding='utf-8',timeout=600)
            lines.append(p.stdout+p.stderr)
            assert p.returncode==0 and str(want)+'/'+str(want)+' checks passed' in p.stdout,p.stdout+p.stderr
            counts.append({'harness':harness.name,'passed':want,'total':want})
        assert folder.parent==Path(tempfile.gettempdir()).resolve()
    report={'checked_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'url':URL,'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'page_sha256':hashlib.sha256(actual).hexdigest(),'page_bytes':len(actual),'service_worker_build':sw_id,'harnesses':counts}
    (QA/'live-verification.json').write_bytes((json.dumps(report,indent=2)+'\n').encode('utf-8'))
    (QA/'live-qa.log').write_bytes(('\n'.join(lines).rstrip()+'\n').encode('utf-8'))
    print(json.dumps(report,indent=2));print('LIVE VERIFICATION PASSED: 110/110')
    return 0
if __name__=='__main__':sys.exit(main())
