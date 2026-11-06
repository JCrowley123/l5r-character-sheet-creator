"""Release 15a, A03: A03's own harness and every suite leaf that measures geometry or works with the Skill rows or the
Advantage/Disadvantage lists (A03 changes how both are laid out), each as the suite invokes it, with every page's CPU throttled (L5R_CPU_RATE,
default 4). Leaves come from list.json (flat-suite-runner.js --list); a leaf is picked when its source matches GEOMETRY.
Fresh folder only. Usage: python -B run-under-load.py <folder name> [cpu rate]   Adapted from A02's run-under-load.py."""
from pathlib import Path
import ctypes, json, os, re, subprocess, sys, time

Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
OUT = Q / sys.argv[1]
OUT.mkdir(exist_ok=False)
RATE = sys.argv[2] if len(sys.argv) > 2 else '4'
# A03's own harness, and every leaf whose source reads geometry (A02's pattern, kept) or the rows and lists A03 lays out.
GEOMETRY = re.compile(r'elementFromPoint|getBoundingClientRect|car-tabbar|carTabbar|carShell|car-shell|innerHeight|clientHeight|'
                      r'floatingDice|scrollTopBtn|quickAccess|carViewport|\.screenshot\(|offsetHeight|boundingBox|'
                      r'skillsBody|sk-name|sk-trait|sk-rank|sk-school|emph-container|advList|disadvList')
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1', L5R_CPU_RATE=RATE,
                  NODE_OPTIONS='--require "' + str(V / 'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').replace('\\', '/') + '"')
NODE = r'C:\Program Files\nodejs\node.exe'
PRE = [str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
       str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'),
       str(V / 'QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs')]
leaves = json.loads((Q / 'list.json').read_bytes())['leaves']
picked = [l for l in leaves if l['file'].endswith('compact-skills-harness.js') or GEOMETRY.search(Path(l['file']).read_bytes().decode('utf-8'))]
assert picked[0]['file'].endswith('compact-skills-harness.js') and len(picked) == 113, len(picked)
results = []
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    for i, leaf in enumerate(picked, 1):
        log = OUT / ('%02d-%s.cpu%s.log' % (i, Path(leaf['file']).stem, RATE))
        args = [NODE] + sum([['--require', p] for p in PRE], []) + [leaf['file']] + leaf['args']
        started = time.time()
        with log.open('wb') as f:
            r = subprocess.run(args, cwd=leaf['cwd'], stdout=f, stderr=subprocess.STDOUT, timeout=7200)
        text = log.read_bytes().decode('utf-8', 'replace')
        counts = re.findall(r'(\d+)\s*/\s*(\d+)\s+(?:checks|tests|assertions)\s+passed', text)
        got = list(map(int, counts[-1])) if counts else []
        ok = r.returncode == 0 and len(got) == 2 and got[0] == got[1] > 0
        results.append({'file': leaf['file'], 'args': leaf['args'], 'exit': r.returncode, 'counts': got, 'passed': ok,
                        'seconds': round(time.time() - started, 1), 'cpu_rate': RATE})
        (OUT / 'results.json').write_bytes((json.dumps(results, indent=2) + '\n').encode())
        print(('PASS ' if ok else 'FAIL ') + Path(leaf['file']).name + ' ' + str(got), flush=True)
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
sys.exit(0 if all(r['passed'] for r in results) else 1)
