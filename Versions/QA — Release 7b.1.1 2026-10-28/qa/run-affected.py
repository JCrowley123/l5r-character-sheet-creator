from pathlib import Path
import os,subprocess,json,time,re,ctypes,sys
V=Path(r'C:\Users\jcrow\l5r-character-sheet-creator\Versions');Q=V/'QA — Release 7b.1.1 2026-10-28/qa';OUT=Q/(sys.argv[1] if len(sys.argv)>1 else 'affected-1');OUT.mkdir(exist_ok=False)
os.environ['NODE_PATH']='C:/Users/jcrow/l5r-qa-tools/node_modules';os.environ['PYTHONUTF8']='1';os.environ['NODE_OPTIONS']='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'
node=r'C:\Program Files\nodejs\node.exe';splash=str(V/'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs');results=[]
try:
 assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
 for i,item in enumerate(json.loads((Q/(sys.argv[2] if len(sys.argv)>2 else 'affected-invocations.json')).read_bytes()),1):
  log=OUT/f'{i:02d}.log';start=time.time();cmd=[node,'--require',splash,item['file'],*item['args']]
  with log.open('wb') as f:r=subprocess.run(cmd,cwd=item['cwd'],stdout=f,stderr=subprocess.STDOUT,timeout=item.get('timeout',600000)/1000)
  text=log.read_bytes().decode('utf-8');counts=re.findall(r'(\d+)\s*/\s*(\d+)\s+(?:checks|tests|assertions)\s+passed',text);got=list(map(int,counts[-1])) if counts else []
  ok=r.returncode==0 and len(got)==2 and got[0]==got[1]>0 and (item['expected'] is None or got==[item['expected']]*2)
  results.append({'file':item['file'],'exit':r.returncode,'counts':got,'expected':item['expected'],'passed':ok,'seconds':round(time.time()-start,1),'log':str(log)})
  (OUT/'results.json').write_bytes((json.dumps(results,indent=2)+'\n').encode());print(f'{i}: '+('PASS ' if ok else 'FAIL ')+Path(item['file']).name,flush=True)
  if not ok:sys.exit(1)
finally:ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
