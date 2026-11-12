"""The dependency check for each G3 unit (Phase 0's qa/feature-dependencies.py), run from the Phase 0 folder. Each must
report every reference inside its own marked blocks (exit 0). Release 15a group G3."""
import subprocess, sys
UNITS = [('src/sheet/209.99999999999999998-feat-spell-review-layout.js', 'PART H PHASE 15.1.21', ['sr15-on', 'sr15-review', 'sr15-groups', 'sr15-name', 'sr15-count', 'spell-review-layout-seam', '1139-spell-review-layout']),
         ('src/sheet/209.99999999999999999-feat-spell-name-line.js', 'PART H PHASE 15.1.22', ['sn15-on', 'sn15-tag', 'spell-name-line-seam', '1140-spell-name-line']),
         ('src/sheet/209.999999999999999991-feat-spell-remove-corner.js', 'PART H PHASE 15.1.23', ['sx15-on', 'spell-remove-corner-seam', '1141-spell-remove-corner'])]
failed = 0
for fragment, marker, also in UNITS:
    r = subprocess.run([sys.executable, '-B', 'qa/feature-dependencies.py', fragment, marker, '--also', *also], capture_output=True, text=True, encoding='utf-8')
    print('== ' + marker + ' exit ' + str(r.returncode) + '\n' + r.stdout[-1500:] + r.stderr[-500:], flush=True)
    failed += r.returncode != 0
print('DEPENDENCIES ' + ('PASSED' if not failed else 'FAILED') + ': ' + str(len(UNITS) - failed) + '/' + str(len(UNITS)))
sys.exit(1 if failed else 0)
