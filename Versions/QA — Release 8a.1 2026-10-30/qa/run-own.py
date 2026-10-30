"""Release 8a.1: the given harnesses, one after another, unthrottled, against the live tree's build, each with the suite's
leaf preloads (navigation budget, splash test switch). Logs in <folder>/. Fresh folder only.
Usage: python -B run-own.py <folder name> <harness path relative to Versions/> [...]"""
from pathlib import Path
import json, os, re, subprocess, sys, time

Q = Path(__file__).resolve().parent
V = Q.parent.parent
SHEET = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
OUT = Q / sys.argv[1]
OUT.mkdir(exist_ok=False)
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1',
                  NODE_OPTIONS='--require "' + str(V / 'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').replace('\\', '/') + '"')
NODE = r'C:\Program Files\nodejs\node.exe'
PRE = [str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
       str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
results = []
for i, rel in enumerate(sys.argv[2:], 1):
    harness = V / rel
    log = OUT / ('%02d-%s.log' % (i, harness.stem))
    started = time.time()
    with log.open('wb') as f:
        r = subprocess.run([NODE] + sum([['--require', p] for p in PRE], []) + [str(harness), str(SHEET)],
                           cwd=str(harness.parent), stdout=f, stderr=subprocess.STDOUT, timeout=7200)
    text = log.read_bytes().decode('utf-8', 'replace')
    counts = re.findall(r'(\d+)\s*/\s*(\d+)\s+(?:checks|tests|assertions)\s+passed', text)
    got = list(map(int, counts[-1])) if counts else []
    ok = r.returncode == 0 and len(got) == 2 and got[0] == got[1] > 0
    results.append({'harness': rel, 'exit': r.returncode, 'counts': got, 'passed': ok,
                    'failed': re.findall(r'^FAIL (\S+)', text, re.M), 'seconds': round(time.time() - started, 1)})
    (OUT / 'results.json').write_bytes((json.dumps(results, indent=2) + '\n').encode())
    print(('PASS ' if ok else 'FAIL ') + harness.name + ' ' + str(got) + ' ' + str(results[-1]['failed']), flush=True)
sys.exit(0 if all(r['passed'] for r in results) else 1)
