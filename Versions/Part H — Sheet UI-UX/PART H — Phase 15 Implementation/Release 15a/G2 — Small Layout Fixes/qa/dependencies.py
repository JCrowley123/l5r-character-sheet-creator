"""The dependency check for each G2 unit (Phase 0's qa/feature-dependencies.py), run from the Phase 0 folder. Each must report
every reference inside its own marked blocks (exit 0). Release 15a group G2."""
import subprocess, sys
UNITS = [('src/sheet/209.99999999999999993-feat-limb-picker.js', 'PART H PHASE 15.1.5', ['lp15-field', 'lp15-label', 'lp15-on', 'lp15-row', 'limb-picker-seam', '1134-limb-picker']), ('src/sheet/209.99999999999999994-feat-grant-actions.js', 'PART H PHASE 15.1.6', ['ga15-on', 'grant-actions-seam', '1135-grant-actions']), ('src/sheet/209.99999999999999995-feat-moon-row.js', 'PART H PHASE 15.1.7', ['mr15-on', 'moon-row-seam', '1136-moon-row']), ('src/sheet/209.99999999999999996-feat-text-edges.js', 'PART H PHASE 15.1.11', ['te15-on', 'text-edges-seam', '1137-text-edges']), ('src/sheet/209.99999999999999997-feat-inline-rules.js', 'PART H PHASE 15.1.4.1', ['ir15-item', 'ir15-on', 'ir15-opt', 'ir15-rule', 'inline-rules-seam', '1138-inline-rules'])]
failed = 0
for fragment, marker, also in UNITS:
    r = subprocess.run([sys.executable, '-B', 'qa/feature-dependencies.py', fragment, marker, '--also', *also], capture_output=True, text=True, encoding='utf-8')
    print('== ' + marker + ' exit ' + str(r.returncode) + '\n' + r.stdout[-1500:] + r.stderr[-500:], flush=True)
    failed += r.returncode != 0
print('DEPENDENCIES ' + ('PASSED' if not failed else 'FAILED') + ': ' + str(len(UNITS) - failed) + '/' + str(len(UNITS)))
sys.exit(1 if failed else 0)
