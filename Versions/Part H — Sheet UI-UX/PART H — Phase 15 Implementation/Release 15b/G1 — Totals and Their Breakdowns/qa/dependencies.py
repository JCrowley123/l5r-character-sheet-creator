"""The dependency check for Release 15b group 1's units (Phase 0's qa/feature-dependencies.py), run from the Phase 0 folder.
Each unit must report every reference inside its own marked blocks (exit 0). G6's dependencies.py with these units. Each unit is
searched with its seam block's name.   cd <Phase 0 folder>; python -B <this file> [unit ...]   (no unit: all four)"""
import subprocess, sys
UNITS = [('A14', 'src/sheet/209.9999999999999999993-feat-net-wound-penalty.js', 'PART H PHASE 15.2.1', ['net-wound-penalty-seam']),
         ('B04', 'src/sheet/209.9999999999999999994-feat-armor-tn-breakdown.js', 'PART H PHASE 15.2.3', ['armor-tn-breakdown-seam']),
         ('B14', 'src/sheet/209.9999999999999999995-feat-jigoku-total-first.js', 'PART H PHASE 15.2.4', ['jigoku-total-first-seam']),
         ('B17', 'src/sheet/209.9999999999999999996-feat-kharmic-tie-row.js', 'PART H PHASE 15.2.5', ['kharmic-tie-row-seam'])]
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
