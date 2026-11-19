"""Release 15a group G6 (A19 revision 1, A20, A19.1; behaviour tier): the three units' own harnesses and every suite leaf
that reads geometry, focus or the splash, opens a character or walks the creation wizard, or drives Phase 7's compact
controls, card editing or History (G5's pattern, kept), or the Void card, Touch of the Void or the roll preview (A19
watches the card, the preview and the result window; A20 redraws the preview in place), each as the suite invokes it, with every page's CPU throttled
(L5R_CPU_RATE, default 4). Leaves come from candidate-list.json (flat-suite-runner.js --list).
Fresh folder only; a failure is kept and investigated, never re-run. Uses the QA-tools Chromium (no NODE_OPTIONS shim).
Usage: python -B run-under-load.py <folder name> [cpu rate] [--count]   G5's run-under-load.py with this group's
constants (19 November 2026)."""
from pathlib import Path
import ctypes, json, os, re, subprocess, sys, time

Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
RATE = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else '4'
OWN = ('void-spend-undo-harness.js', 'skill-trait-choice-harness.js', 'damage-row-harness.js')
# The automatic-entries group's pattern (G4's geometry, focus and the splash, plus opening a character and the wizard), kept,
# plus Phase 7's compact controls (CP7), card editing (CE7) and History (AL71) (G5), and the Void card, Touch of the Void
# and the roll preview, which G6's units watch or redraw.
PATTERN = re.compile(r'elementFromPoint|getBoundingClientRect|car-tabbar|carTabbar|carShell|car-shell|innerHeight|clientHeight|'
                     r'floatingDice|scrollTopBtn|quickAccess|carViewport|\.screenshot\(|offsetHeight|boundingBox|'
                     r'skillsBody|sk-name|sk-trait|sk-rank|sk-school|emph-container|advList|disadvList|'
                     r'activeElement|focus-visible|\.focus\(|keyboard\.press|ap7Go|ap7Pointer|sc8Done|l5rSplash|'
                     r'applyData|setInputFiles|openCharacter|btnLoad|cw112|techList|'
                     r'CP7|cp7-|CE7|ce7-|AL71|al71|'
                     r'voidSpendButtons|voidDamage|VI4533|rollPreviewBody|rollPreviewGo|rp-baserow')
EXPECTED = 170  # G5's 163 and the leaves the Void card and roll-preview terms add, with G6's three
leaves = json.loads((Q / 'candidate-list.json').read_bytes())['leaves']
picked = [l for l in leaves if Path(l['file']).name in OWN or PATTERN.search(Path(l['file']).read_bytes().decode('utf-8'))]
if '--count' in sys.argv:
    print(len(picked), [Path(l['file']).name for l in picked if Path(l['file']).name in OWN])
    sys.exit(0)
assert len(picked) == EXPECTED and sum(Path(l['file']).name in OWN for l in picked) == 3, len(picked)
OUT = Q / sys.argv[1]
OUT.mkdir(exist_ok=False)
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PLAYWRIGHT_BROWSERS_PATH='C:/Users/jcrow/l5r-qa-tools/ms-playwright',
                  PYTHONUTF8='1', L5R_CPU_RATE=RATE)
os.environ.pop('NODE_OPTIONS', None)
NODE = r'C:\Program Files\nodejs\node.exe'
PRE = [str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
       str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'),
       str(V / 'QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs')]
results = []
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    for i, leaf in enumerate(picked, 1):
        log = OUT / ('%03d-%s.cpu%s.log' % (i, Path(leaf['file']).stem, RATE))
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
print('UNDER LOAD ' + str(sum(r['passed'] for r in results)) + '/' + str(len(results)) + ' leaves passed at CPU x' + RATE)
sys.exit(0 if all(r['passed'] for r in results) else 1)
