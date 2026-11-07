"""The dependency check for each G1 unit (Phase 0's qa/feature-dependencies.py), run from the Phase 0 folder. Each must report
every reference inside its own marked blocks (exit 0). Release 15a group G1."""
import subprocess, sys
UNITS = [
    ('src/sheet/209.9999999999999998-feat-one-info-pattern.js', 'PART H PHASE 15.1.4', ['ip15-on', 'ip15-folded', 'ip15-hotei-info', 'ip15-hotei-line', 'data-ip15-line', 'info-pattern-seam', '1130-one-info-pattern']),
    ('src/sheet/209.9999999999999999-feat-court-badges.js', 'PART H PHASE 15.1.15', ['cb15-on', 'cb15-badge', 'cb15-pressed', 'cb15-add', 'cb15-controls', 'data-cb15-index', 'court-badges-seam', '1131-court-badges']),
    ('src/sheet/209.99999999999999991-feat-picker-bottom-info.js', 'PART H PHASE 15.1.16', ['bi15-on', 'picker-bottom-info-seam', '1132-picker-bottom-info']),
    ('src/sheet/209.99999999999999992-feat-skill-masteries.js', 'PART H PHASE 15.1.3.1', ['sm15-on', 'sm15-masteries', 'sm15-head', 'sm15Head', 'sm15-list', 'sm15-item', 'sm15-reached', 'sm15-rank', 'sm15-text', 'sm15-none', 'skill-masteries-seam', '1133-skill-masteries']),
]
failed = 0
for fragment, marker, also in UNITS:
    r = subprocess.run([sys.executable, '-B', 'qa/feature-dependencies.py', fragment, marker, '--also', *also], capture_output=True, text=True, encoding='utf-8')
    print('== ' + marker + ' exit ' + str(r.returncode) + '\n' + r.stdout[-1500:] + r.stderr[-500:], flush=True)
    failed += r.returncode != 0
print('DEPENDENCIES ' + ('PASSED' if not failed else 'FAILED') + ': ' + str(len(UNITS) - failed) + '/' + str(len(UNITS)))
sys.exit(1 if failed else 0)
