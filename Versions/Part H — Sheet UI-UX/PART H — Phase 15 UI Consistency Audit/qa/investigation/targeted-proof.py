"""Run the unchanged 16-check harness and its unchanged pinned negatives, with only fonts isolated.
All outputs are redirected here; historical evidence is not overwritten.
"""
from pathlib import Path
import json, os, re, subprocess, sys, datetime
Q=Path(__file__).resolve().parent
V=Q.parents[3]
OLD=V/'BUGFIX — Spell Names Match the Books/qa'
P=V/'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
NODE=r'C:\Program Files\nodejs\node.exe'
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules',PYTHONUTF8='1',L5R_CPU_RATE='4')
installed=V/'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js'
splash=V/'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
cpu=V/'QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs'
nav=V/'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'
os.environ['NODE_OPTIONS']=' '.join('--require "'+str(p).replace('\\','/')+'"' for p in [installed,nav,splash,cpu,Q/'isolated-fonts.cjs'])
report={'started_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'network_isolation':'Google Fonts only','app_or_harness_changed':False,'cpu_rate':4}
with (Q/'spell-names-isolated-cpu4.log').open('wb') as log:
    r=subprocess.run([NODE,str(OLD/'spell-names-harness.js'),str(P)],stdout=log,stderr=subprocess.STDOUT,timeout=300)
text=(Q/'spell-names-isolated-cpu4.log').read_text(encoding='utf-8')
counts=re.findall(r'(\d+)/(\d+) checks passed',text)
assert r.returncode==0 and counts[-1:]==[('16','16')],text[-2000:]
report['leaf']={'exit':r.returncode,'counts':[16,16]}
print('Original harness, isolated fonts, 4x CPU: 16/16',flush=True)
# The existing proof already pins the baseline and six mutants, including all failed-check names.
# Only its output destination changes; __file__ remains the original so every source reference is unchanged.
source=(OLD/'verify-variants.py').read_text(encoding='utf-8')
assert source.count("out = Q / 'negative'")==1
source=source.replace("out = Q / 'negative'",'out = Path('+repr(str(Q/'negative-isolated-cpu4'))+')')
with (Q/'negative-isolated-cpu4-launch.log').open('wb') as log:
    command=[sys.executable,'-B','-c','__file__='+repr(str(OLD/'verify-variants.py'))+'\n'+source]
    r=subprocess.run(command,stdout=log,stderr=subprocess.STDOUT,timeout=2400)
assert r.returncode==0,(Q/'negative-isolated-cpu4-launch.log').read_text(encoding='utf-8')[-2000:]
summary=json.loads((Q/'negative-isolated-cpu4/summary.json').read_text())
assert summary['passed'] and len(summary['cases'])==7
report['negative_variants']={'cases':len(summary['cases']),'passed':True}
report['finished_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
(Q/'targeted-proof.json').write_bytes((json.dumps(report,indent=2)+'\n').encode())
print('All seven original pinned negative variants matched at 4x CPU.',flush=True)
