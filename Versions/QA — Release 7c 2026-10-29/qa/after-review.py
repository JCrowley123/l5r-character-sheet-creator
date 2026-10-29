"""Release 7c, after the review: every layer's pinned variants on the fixed build, then the twelve edited older harnesses
(each as the suite invokes it, from list.json), with the display and system held awake. Fresh folder only.
Usage: python -B after-review.py <folder name>"""
from pathlib import Path
import ctypes, json, os, re, subprocess, sys, time

Q = Path(__file__).resolve().parent
V = Q.parent.parent
OUT = Q / sys.argv[1]
OUT.mkdir(exist_ok=False)
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1', L5R_NODE=r'C:\Program Files\nodejs\node.exe',
                  NODE_OPTIONS='--require "' + str(V / 'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').replace(chr(92), '/') + '"')
LAYERS = ['BUGFIX — After-Preview Refund', 'BUGFIX — Moon Curse Full Moon', 'BUGFIX — Creation Cap of Four', 'BUGFIX — Empty Quiver Rolls On',
          'BUGFIX — Starting Spells Are Scrolls', 'Part J — Data Integrity & Validation/PART J — Phase 7.1 Audit Log']
OLDER = ['disadv-unlucky-harness.js', 'disadv-dependant-wrath-harness.js', 'characters-harness.js', 'wizard-harness.js', 'wizard2-harness.js',
         'wizard3-harness.js', 'wizard4-harness.js', 'wizard5-harness.js', 'toolbar-harness.js', 'search-harness.js', 'appbar-harness.js', 'pdf-harness.js']
PRE = [str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
       str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
results = []
def note(name, ok, detail):
    results.append({'name': name, 'passed': ok, 'detail': detail})
    (OUT / 'results.json').write_bytes((json.dumps(results, indent=2) + '\n').encode())
    print(('PASS ' if ok else 'FAIL ') + name + ' ' + detail, flush=True)
assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    for layer in LAYERS:
        qa = V / layer / 'qa'
        log = OUT / ('variants-' + Path(layer).name.split('— ')[-1].replace(' ', '-') + '.log')
        with log.open('wb') as f:
            r = subprocess.run([sys.executable, '-B', str(qa / 'verify-variants.py')], cwd=str(qa), stdout=f, stderr=subprocess.STDOUT, timeout=7200)
        tail = log.read_bytes().decode('utf-8', 'replace').strip().splitlines()[-1:]
        note('variants ' + Path(layer).name, r.returncode == 0, ' '.join(tail))
    leaves = json.loads((Q / 'list.json').read_bytes())['leaves']
    for name in OLDER:
        leaf = [l for l in leaves if l['file'].replace(chr(92), '/').endswith('/' + name)]
        assert len(leaf) == 1, name
        leaf = leaf[0]
        log = OUT / ('older-' + name.replace('.js', '.log'))
        args = [os.environ['L5R_NODE']] + sum([['--require', p] for p in PRE], []) + [leaf['file']] + leaf['args']
        with log.open('wb') as f:
            r = subprocess.run(args, cwd=leaf['cwd'], stdout=f, stderr=subprocess.STDOUT, timeout=7200)
        text = log.read_bytes().decode('utf-8', 'replace')
        counts = re.findall(r'(\d+)\s*/\s*(\d+)\s+(?:checks|tests|assertions)\s+passed', text)
        got = list(map(int, counts[-1])) if counts else []
        note('older ' + name, r.returncode == 0 and len(got) == 2 and got[0] == got[1] > 0, str(got))
finally:
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
sys.exit(0 if all(r['passed'] for r in results) else 1)
