"""Release 15a, A01: the changed and affected harnesses, each as the suite invokes it, with every page's CPU throttled
(L5R_CPU_RATE, default 4). Leaves come from list.json (flat-suite-runner.js --list). Fresh folder only.
Usage: python -B run-under-load.py <folder name> [cpu rate]   Adapted from Release 8c's run-under-load.py."""
from pathlib import Path
import ctypes, json, os, re, subprocess, sys, time

Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
OUT = Q / sys.argv[1]
OUT.mkdir(exist_ok=False)
RATE = sys.argv[2] if len(sys.argv) > 2 else '4'
# A01's own harness; the three wizard suites whose Review checks are conditional on A01; every other suite that
# drives or reads the wizard's Review, its cards, the overspend warning, Finish or the School-choice notes.
CHANGED = ['review-reminder-harness.js', 'wizard3-harness.js', 'wizard4-harness.js', 'wizard5-harness.js',
           'wizard-harness.js', 'wizard2-harness.js', 'free-choice-harness.js', 'one-line-harness.js', 'overspend-warns-harness.js',
           'PART K — Phase 11.2.5 School Choices from the Character Check/qa/school-choices-harness.js', 'review-regression-harness.js',
           'older-review-harness.js', 'allocation-boundaries-harness.js', 'legacy-grants-harness.js', 'rank-spell-harness.js',
           'ancestors-harness.js', 'gender-harness.js', 'wizard-remove-harness.js', 'scrolls-harness.js', 'character-validator-harness.js',
           'school-skill-rows-harness.js', 'characters-harness.js', 'list-gender-harness.js', 'refund-harness.js']
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1', L5R_CPU_RATE=RATE,
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
