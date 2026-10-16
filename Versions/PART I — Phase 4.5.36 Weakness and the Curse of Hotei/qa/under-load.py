"""Under-load check for Phase 4.5.36 (measurement; no check or threshold changed). Five repeats, candidate and main
alternating: recalc-under-load.js (recalcAll and a Trait keystroke at 4x CPU with Weakness, Hotei and Bad Health rows),
then the unmodified Search and Facets harnesses with Cycle 2's keystroke probe preloaded. Writes under-load.log."""
from pathlib import Path
import datetime, os, re, subprocess, sys, time
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
MAIN = Path(sys.argv[1])  # main's built sheet (git show 2118dfa:...)
SHIM = (V / 'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').as_posix()
PROBE = (V / 'QA — Cycle 2 2026-10-15/qa/keystroke-probe.js').as_posix()
HARNESSES = [('search', V / 'PART K — Phase 14 Search/qa/search-harness.js'),
             ('facets', V / 'PART K — Phase 14.1 Search Facets/qa/facets-harness.js')]
builds = [('cand', P / 'l5r-character-sheet.html'), ('main', MAIN)]
lines = ['# Phase 4.5.36 under-load check, ' + datetime.datetime.now(datetime.timezone.utc).strftime('%d %B %Y %H:%M UTC') +
         ': mains power, screen held awake; five repeats, candidate and main alternating.']


def chrome():
    out = subprocess.run(['tasklist'], capture_output=True, text=True).stdout
    return sum(1 for l in out.splitlines() if 'chrome' in l.lower())


def run(args, env):
    t = time.time()
    r = subprocess.run([NODE, *map(str, args)], capture_output=True, text=True, encoding='utf-8', env=env, timeout=600)
    return r.stdout + r.stderr, round(time.time() - t)


base = dict(os.environ)
for i in range(1, 6):
    for label, sheet in builds:
        env = dict(base, NODE_OPTIONS='--require "' + SHIM + '"')
        out, secs = run([Q / 'recalc-under-load.js', sheet], env)
        lines.append(f'run={i} build={label} probe=recalc {out.strip().splitlines()[-1]} | {secs}s | chrome={chrome()}')
        env = dict(base, NODE_OPTIONS='--require "' + SHIM + '" --require "' + PROBE + '"')
        for name, harness in HARNESSES:
            out, secs = run([harness, sheet], env)
            ms = re.findall(r'PROBE keystroke-ms=([\d.]+)', out)
            checks = re.findall(r'^(PASS|FAIL) (\S*KEYSTROKE\S*)', out, re.M)
            total = re.findall(r'(\d+/\d+) checks passed', out)
            lines.append(f'run={i} build={label} harness={name} ms={",".join(ms)} | ' +
                         ' '.join(a + ' ' + b for a, b in checks) + f' | {total[-1] if total else "no count"} | {secs}s | chrome={chrome()}')
        print(lines[-3:], flush=True)
(Q / 'under-load.log').write_bytes(('\n'.join(lines) + '\n').encode('utf-8'))
print('done')
