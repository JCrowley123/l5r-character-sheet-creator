"""Release 8a, part 2: one sweep of the WHOLE suite with every page's CPU throttled 4x (L5R_CPU_RATE), each leaf exactly as
the suite invokes it, to find the checks that fail only under load. Adapted from 7c.1's run-under-load.py, which took
only the changed harnesses: this takes every leaf of the list given (flat-suite-runner.js --list output). A leaf that
fails here is then run once unthrottled (its own .cpu1.log) to tell a load-only failure from a real one; nothing is
re-run to get a pass. Display and system held awake. Fresh folder only.
Usage: python -B sweep-under-load.py <list.json> <folder name>"""
from pathlib import Path
import ctypes, json, os, re, subprocess, sys, time

Q = Path(__file__).resolve().parent
V = Q.parent.parent
OUT = Q / sys.argv[2]
OUT.mkdir(exist_ok=False)
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1',
                  NODE_OPTIONS='--require "' + str(V / 'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').replace('\\', '/') + '"')
NODE = r'C:\Program Files\nodejs\node.exe'
PRE = [str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
       str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
THROTTLE = str(V / 'QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs')
leaves = json.loads(Path(sys.argv[1]).read_bytes())['leaves']


def run(i, leaf, rate):
    log = OUT / ('%03d-%s.cpu%d.log' % (i, Path(leaf['file']).stem, rate))
    env = dict(os.environ, L5R_CPU_RATE=str(rate))
    args = [NODE] + sum([['--require', p] for p in PRE + ([THROTTLE] if rate > 1 else [])], []) + [leaf['file']] + leaf['args']
    started = time.time()
    with log.open('wb') as f:
        try:
            r = subprocess.run(args, cwd=leaf['cwd'], env=env, stdout=f, stderr=subprocess.STDOUT, timeout=7200)
            code = r.returncode
        except subprocess.TimeoutExpired:
            code = 'timeout'
    text = log.read_bytes().decode('utf-8', 'replace')
    counts = re.findall(r'(\d+)\s*/\s*(\d+)\s+(?:checks|tests|assertions)\s+passed', text)
    got = list(map(int, counts[-1])) if counts else []
    return {'rate': rate, 'exit': code, 'counts': got, 'passed': code == 0 and len(got) == 2 and got[0] == got[1] > 0,
            'failed_checks': re.findall(r'^FAIL (\S+)', text, re.M), 'seconds': round(time.time() - started, 1)}


results = []
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    for i, leaf in enumerate(leaves, 1):
        entry = {'index': i, 'file': leaf['file'], 'args': leaf['args'], 'cpu4': run(i, leaf, 4)}
        if not entry['cpu4']['passed']:
            entry['cpu1'] = run(i, leaf, 1)
        results.append(entry)
        (OUT / 'results.json').write_bytes((json.dumps(results, indent=2) + '\n').encode())
        tag = 'PASS' if entry['cpu4']['passed'] else ('LOAD-ONLY' if entry['cpu1']['passed'] else 'FAIL-BOTH')
        print('%03d %s %s %s' % (i, tag, Path(leaf['file']).name, entry['cpu4']['counts']), flush=True)
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
load_only = [r for r in results if not r['cpu4']['passed'] and r['cpu1']['passed']]
both = [r for r in results if not r['cpu4']['passed'] and not r['cpu1']['passed']]
print('SWEEP DONE: %d leaves, %d pass at 4x, %d fail only under load, %d fail unthrottled too'
      % (len(results), len(results) - len(load_only) - len(both), len(load_only), len(both)), flush=True)
