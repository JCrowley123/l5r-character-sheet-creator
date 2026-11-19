"""The dependency check for G6's units (Phase 0's qa/feature-dependencies.py), run from the Phase 0 folder. Each unit must
report every reference inside its own marked blocks (exit 0). Release 15a group G6 (A19, then A20); G5's dependencies.py with
these units. Each unit is searched with its seam block's name."""
import subprocess, sys
UNITS = [('src/sheet/209.999999999999999999-feat-void-spend-undo.js', 'PART H PHASE 15.1.33', ['void-spend-undo-seam'])]
failed = 0
for fragment, marker, also in UNITS:
    r = subprocess.run([sys.executable, '-B', 'qa/feature-dependencies.py', fragment, marker, '--also', *also], capture_output=True, text=True, encoding='utf-8')
    print('== ' + marker + ' exit ' + str(r.returncode) + '\n' + r.stdout[-1500:] + r.stderr[-500:], flush=True)
    failed += r.returncode != 0
print('DEPENDENCIES ' + ('PASSED' if not failed else 'FAILED') + ': ' + str(len(UNITS) - failed) + '/' + str(len(UNITS)))
sys.exit(1 if failed else 0)
