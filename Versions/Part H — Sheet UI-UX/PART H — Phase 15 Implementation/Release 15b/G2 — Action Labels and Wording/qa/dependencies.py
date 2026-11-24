"""The dependency check for Release 15b group 2's units (Phase 0's qa/feature-dependencies.py), run from the Phase 0 folder.
Each unit must report every reference inside its own marked blocks (exit 0). G1's dependencies.py with these units. Each unit is
searched with its seam block's name.   cd <Phase 0 folder>; python -B <this file> [unit ...]   (no unit: all four)"""
import subprocess, sys
UNITS = [('B01', 'src/sheet/209.9999999999999999997-feat-check-button-names.js', 'PART H PHASE 15.2.6', ['check-button-names-seam']),
         ('B03', 'src/sheet/209.9999999999999999998-feat-lead-an-ally.js', 'PART H PHASE 15.2.7', ['lead-an-ally-seam']),
         ('B05', 'src/sheet/209.9999999999999999999-feat-remain-in-control.js', 'PART H PHASE 15.2.8', ['remain-in-control-seam']),
         ('B09', 'src/sheet/209.99999999999999999991-feat-picker-traits.js', 'PART H PHASE 15.2.9', ['picker-traits-seam'])]
wanted = sys.argv[1:] or [u[0] for u in UNITS]
failed = run = 0
for unit, fragment, marker, also in UNITS:
    if unit not in wanted:
        continue
    run += 1
    r = subprocess.run([sys.executable, '-B', 'qa/feature-dependencies.py', fragment, marker, '--also', *also], capture_output=True, text=True, encoding='utf-8')
    print('== ' + unit + ' ' + marker + ' exit ' + str(r.returncode) + '\n' + r.stdout[-1500:] + r.stderr[-500:], flush=True)
    failed += r.returncode != 0
print('DEPENDENCIES ' + ('PASSED' if not failed else 'FAILED') + ': ' + str(run - failed) + '/' + str(run))
sys.exit(1 if failed else 0)
