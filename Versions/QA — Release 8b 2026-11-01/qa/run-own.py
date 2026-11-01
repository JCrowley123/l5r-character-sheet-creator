from pathlib import Path
import os, re, subprocess, sys
Q=Path(__file__).resolve().parent
V=Q.parent.parent
PH=V/'PART K — Phase 11.2.5 School Choices from the Character Check/qa'
P=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
OUT=Q/sys.argv[1]
OUT.mkdir(exist_ok=False)
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules',L5R_CPU_RATE='4',PYTHONUTF8='1',NODE_OPTIONS='--require "'+(V/'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').as_posix()+'"')
for name,total in [('school-choices-harness.js',30),('review-regression-harness.js',6)]:
    with (OUT/(name+'.log')).open('wb') as log:
        run=subprocess.run([r'C:/Program Files/nodejs/node.exe','--require',str(V/'QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs'),'--require',str(V/'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'),str(PH/name),str(P/'l5r-character-sheet.html')],stdout=log,stderr=subprocess.STDOUT)
    text=(OUT/(name+'.log')).read_text(encoding='utf8')
    counts=re.findall(r'(\d+)/(\d+) checks passed',text)
    assert run.returncode==0 and counts[-1]==(str(total),str(total)),(name,text[-3000:])
    print(name+': '+str(total)+'/'+str(total),flush=True)
