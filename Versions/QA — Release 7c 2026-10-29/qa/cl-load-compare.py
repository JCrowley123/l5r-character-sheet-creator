"""Release 7c: the Characters list harness at 4x CPU on three builds, twice each, to find whether its autosave
timing failure under load is new. Builds: the candidate; main's (git show main); the candidate with only
AUDIT_LOG_ENABLED off. Output in cl-load-compare/. Fresh folder only.
Usage: python -B cl-load-compare.py"""
from pathlib import Path
import ctypes, json, os, re, subprocess, sys

Q = Path(__file__).resolve().parent
V = Q.parent.parent
R = V.parent
OUT = Q / 'cl-load-compare'
OUT.mkdir(exist_ok=False)
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
SHEET = P / 'l5r-character-sheet.html'
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1', L5R_CPU_RATE='4',
                  NODE_OPTIONS='--require "' + str(V / 'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').replace('\\', '/') + '"')
NODE = r'C:\Program Files\nodejs\node.exe'
PRE = [str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
       str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'),
       str(V / 'QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs')]
leaf = next(l for l in json.loads((Q / 'list.json').read_bytes())['leaves']
            if l['file'].replace('\\', '/').endswith('/characters-harness.js'))

# The builds sit beside the candidate so relative assets resolve the same way.
cand = SHEET.read_bytes()
main = subprocess.run(['git', '-C', str(R), 'show', 'main:' + str(SHEET.relative_to(R)).replace('\\', '/')],
                      capture_output=True, check=True).stdout
assert cand.count(b'AUDIT_LOG_ENABLED = true') == 1
builds = {'candidate': SHEET, 'main': P / 'cl-compare-main.html', 'audit-off': P / 'cl-compare-audit-off.html'}
builds['main'].write_bytes(main)
builds['audit-off'].write_bytes(cand.replace(b'AUDIT_LOG_ENABLED = true', b'AUDIT_LOG_ENABLED = false'))
results = []
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    for n in (1, 2):
        for name, path in builds.items():
            log = OUT / ('%s-%d.log' % (name, n))
            args = [NODE] + sum([['--require', p] for p in PRE], []) + [leaf['file'], str(path)]
            with log.open('wb') as f:
                r = subprocess.run(args, cwd=leaf['cwd'], stdout=f, stderr=subprocess.STDOUT, timeout=3600)
            text = log.read_bytes().decode('utf-8', 'replace')
            counts = re.findall(r'(\d+)\s*/\s*(\d+)\s+checks\s+passed', text)
            fails = re.findall(r'^FAIL (\S+)', text, re.M)
            results.append({'build': name, 'run': n, 'exit': r.returncode, 'counts': counts[-1:] , 'fails': fails})
            (OUT / 'results.json').write_bytes((json.dumps(results, indent=2) + '\n').encode())
            print(name, n, counts[-1:], fails, flush=True)
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
    for name in ('main', 'audit-off'):
        builds[name].unlink()
