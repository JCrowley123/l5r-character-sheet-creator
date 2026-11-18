"""The dependency check for A08, G5's one unit (Phase 0's qa/feature-dependencies.py), run from the Phase 0 folder. It must
report every reference inside its own marked blocks (exit 0). Release 15a group G5 (A08 alone; A12 withdrawn on 18 November
2026); the automatic-entries group's dependencies.py with this unit. A08 is searched with its seam block's name."""
import subprocess, sys
UNITS = [('src/sheet/209.999999999999999998-feat-quick-tap-undo.js', 'PART H PHASE 15.1.31', ['quick-tap-undo-seam'])]
failed = 0
for fragment, marker, also in UNITS:
    r = subprocess.run([sys.executable, '-B', 'qa/feature-dependencies.py', fragment, marker, '--also', *also], capture_output=True, text=True, encoding='utf-8')
    print('== ' + marker + ' exit ' + str(r.returncode) + '\n' + r.stdout[-1500:] + r.stderr[-500:], flush=True)
    failed += r.returncode != 0
print('DEPENDENCIES ' + ('PASSED' if not failed else 'FAILED') + ': ' + str(len(UNITS) - failed) + '/' + str(len(UNITS)))
sys.exit(1 if failed else 0)
