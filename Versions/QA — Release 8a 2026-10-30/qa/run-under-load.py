"""Release 8a: the changed harnesses, each with every page's CPU throttled 4x (L5R_CPU_RATE), as the suite invokes them.
Leaves come from list.json (flat-suite-runner.js --list); output in under-load/. Fresh folder only.
Usage: python -B run-under-load.py <folder name>"""
from pathlib import Path
import ctypes, json, os, re, subprocess, sys, time

Q = Path(__file__).resolve().parent
V = Q.parent.parent
OUT = Q / sys.argv[1]
OUT.mkdir(exist_ok=False)
CHANGED = ['overspend-warns-harness.js', 'undone-change-harness.js',
           # older harnesses edited in 8a: the wizard's two (XW8 on) and the Characters list's autosave waits
           'wizard-harness.js', 'wizard2-harness.js', 'characters-harness.js']
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1', L5R_CPU_RATE='4',
                  NODE_OPTIONS='--require "' + str(V / 'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').replace('\\', '/') + '"')
NODE = r'C:\Program Files\nodejs\node.exe'
PRE = [str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
       str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'),
       str(V / 'QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs')]
leaves = json.loads((Q / 'list.json').read_bytes())['leaves']
picked = [l for l in leaves if any(l['file'].replace('\\', '/').endswith('/' + c) for c in CHANGED)]
assert len(picked) == len(CHANGED), [l['file'] for l in picked]
results = []
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    for i, leaf in enumerate(picked, 1):
        log = OUT / ('%02d-%s.cpu4.log' % (i, Path(leaf['file']).stem))
        args = [NODE] + sum([['--require', p] for p in PRE], []) + [leaf['file']] + leaf['args']
        started = time.time()
        with log.open('wb') as f:
            r = subprocess.run(args, cwd=leaf['cwd'], stdout=f, stderr=subprocess.STDOUT, timeout=7200)
        text = log.read_bytes().decode('utf-8', 'replace')
        counts = re.findall(r'(\d+)\s*/\s*(\d+)\s+(?:checks|tests|assertions)\s+passed', text)
        got = list(map(int, counts[-1])) if counts else []
        ok = r.returncode == 0 and len(got) == 2 and got[0] == got[1] > 0
        results.append({'file': leaf['file'], 'args': leaf['args'], 'exit': r.returncode, 'counts': got, 'passed': ok,
                        'seconds': round(time.time() - started, 1)})
        (OUT / 'results.json').write_bytes((json.dumps(results, indent=2) + '\n').encode())
        print(('PASS ' if ok else 'FAIL ') + Path(leaf['file']).name + ' ' + str(got), flush=True)
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
sys.exit(0 if all(r['passed'] for r in results) else 1)
