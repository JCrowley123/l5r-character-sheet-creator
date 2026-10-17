"""Run chosen suite leaves (by index in leaves.json) exactly as flat-suite-runner.js would: same args, cwd and the
navigation allowance preload. python run-leaves.py 55 81 84"""
from pathlib import Path
import json, os, re, subprocess, sys
Q = Path(__file__).resolve().parent
V = Q.parent.parent
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
BUDGET = str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs')
leaves = json.loads((Q / 'leaves.json').read_bytes().decode('utf-8'))['leaves']
sheet = os.environ.get('L5R_SHEET') or str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html')
bad = 0
for n in map(int, sys.argv[1:]):
    leaf = leaves[n - 1]
    args = [sheet if a.endswith('l5r-character-sheet.html') else a for a in leaf['args']]
    r = subprocess.run([NODE, '--require', BUDGET, leaf['file'], *args], cwd=leaf['cwd'], capture_output=True, text=True,
                       encoding='utf-8', timeout=(leaf.get('timeout') or 600000) / 1000)
    out = r.stdout + r.stderr
    count = re.findall(r'(\d+)\s*/\s*(\d+)\s+(?:checks|assertions|tests)\s+passed', out)
    fails = [l[:200] for l in out.splitlines() if l.startswith('FAIL')]
    ok = r.returncode == 0 and count and count[-1][0] == count[-1][1]
    bad += not ok
    print(n, Path(leaf['file']).name, count[-1] if count else 'no count', 'exit', r.returncode, *fails[:5], sep=' | ', flush=True)
sys.exit(1 if bad else 0)
