"""The dependency check for each G4 unit (Phase 0's qa/feature-dependencies.py), run from the Phase 0 folder. Each must
report every reference inside its own marked blocks (exit 0). Release 15a group G4. A17's block in the splash markup is
not a search term: its END line hands back to the splash layer, so the checker would read that line as the splash
layer's (A17's README); the class, the seam and the stylesheet's name cover the unit."""
import subprocess, sys
UNITS = [('src/sheet/209.999999999999999992-feat-phone-text-entry.js', 'PART H PHASE 15.1.24', ['tx15-on', 'phone-text-entry-seam', '1142-phone-text-entry']),
         ('src/sheet/209.999999999999999993-feat-cross-page-focus.js', 'PART H PHASE 15.1.25', ['cp15-on', 'data-cp15-target', 'cross-page-focus-seam', '1143-cross-page-focus']),
         ('src/sheet/209.999999999999999994-feat-keyboard-page-ring.js', 'PART H PHASE 15.1.26', ['kr15-on', 'kr15-keyboard', 'keyboard-page-ring-seam', '1144-keyboard-page-ring']),
         ('src/css/1145-splash-fill.css', 'PART H PHASE 15.1.27', ['sf15-on', 'splash-fill-seam', '1145-splash-fill'])]
failed = 0
for fragment, marker, also in UNITS:
    r = subprocess.run([sys.executable, '-B', 'qa/feature-dependencies.py', fragment, marker, '--also', *also], capture_output=True, text=True, encoding='utf-8')
    print('== ' + marker + ' exit ' + str(r.returncode) + '\n' + r.stdout[-1500:] + r.stderr[-500:], flush=True)
    failed += r.returncode != 0
print('DEPENDENCIES ' + ('PASSED' if not failed else 'FAILED') + ': ' + str(len(UNITS) - failed) + '/' + str(len(UNITS)))
sys.exit(1 if failed else 0)
