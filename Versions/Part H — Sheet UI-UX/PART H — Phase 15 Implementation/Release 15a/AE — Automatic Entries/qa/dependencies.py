"""The dependency check for each unit of the automatic-entries group (Phase 0's qa/feature-dependencies.py), run from the
Phase 0 folder. Each must report every reference inside its own marked blocks (exit 0). Release 15a, the
automatic-entries group; G4's dependencies.py with this group's units. AE2 is searched with its two save fields and its
rule's id; AE3 with its classes and its stylesheet's name."""
import subprocess, sys
UNITS = [('src/sheet/209.999999999999999995-feat-yogo-given-spells.js', 'PART H PHASE 15.1.28', ['yogo-given-spells-seam']),
         ('src/sheet/209.999999999999999996-feat-given-spells-on-opening.js', 'PART H PHASE 15.1.29',
          ['given-spells-on-opening-seam', 'givenSpellsNote', 'givenSpellsSettled', 'given-spells-credited']),
         ('src/sheet/209.999999999999999997-feat-automatic-entry-controls.js', 'PART H PHASE 15.1.30',
          ['ax15-on', 'ax15-auto', 'ax15-tag', 'ax15-wrap', 'automatic-entry-controls-seam', '1146-automatic-entry-controls'])]
failed = 0
for fragment, marker, also in UNITS:
    r = subprocess.run([sys.executable, '-B', 'qa/feature-dependencies.py', fragment, marker, '--also', *also], capture_output=True, text=True, encoding='utf-8')
    print('== ' + marker + ' exit ' + str(r.returncode) + '\n' + r.stdout[-1500:] + r.stderr[-500:], flush=True)
    failed += r.returncode != 0
print('DEPENDENCIES ' + ('PASSED' if not failed else 'FAILED') + ': ' + str(len(UNITS) - failed) + '/' + str(len(UNITS)))
sys.exit(1 if failed else 0)
