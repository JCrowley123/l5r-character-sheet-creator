"""Targeted checks of the no-retry guard and isolated build; never runs a suite."""
from pathlib import Path
import hashlib, json, shutil, subprocess, sys, tempfile
from pre_suite_guard import require_unstarted_suite, FROZEN

Q = Path(__file__).resolve().parent
P = Q.parent.parent / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
ORIGINAL = Q / 'final-run-1'
# Pinned before the first execution: one exact pre-suite state is accepted;
# every state indicating a started suite or a different failure is rejected.
CASES = ('original-unstarted', 'candidate-leaf-exists', 'full-log-exists',
         'completed-case-exists', 'candidate-changed', 'different-error',
         'already-passed', 'different-log')
results = []
with tempfile.TemporaryDirectory(prefix='l5r-8b-preflight-') as folder:
    root = Path(folder).resolve()
    assert root.parent == Path(tempfile.gettempdir()).resolve()
    for name in CASES:
        state = root / name
        shutil.copytree(ORIGINAL, state)
        summary = json.loads((state / 'summary.json').read_text(encoding='utf-8'))
        if name == 'candidate-leaf-exists': (state / 'candidate-leaves').mkdir()
        if name == 'full-log-exists': (state / '01-full.log').touch()
        if name == 'completed-case-exists': summary['cases'] = [{'label': '01-full'}]
        if name == 'candidate-changed': summary['source_sha256'] = '0' * 64
        if name == 'different-error': summary['error'] = 'suite timeout'
        if name == 'already-passed': summary['passed'] = True
        if name == 'different-log': (state / '00-build.log').write_bytes(b'Other failure\n')
        (state / 'summary.json').write_bytes(json.dumps(summary).encode())
        try:
            require_unstarted_suite(state)
            accepted = True
        except AssertionError:
            accepted = False
        assert accepted == (name == 'original-unstarted'), name
        results.append({'case': name, 'passed': True})
        print('PASS ' + name, flush=True)
    tree = root / 'phase0'
    shutil.copytree(P, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
    subprocess.run([sys.executable, '-B', str(tree / 'build/recombine.py'), '--verify'], check=True)
    built = (tree / 'l5r-character-sheet.html').read_bytes()
    assert built == (P / 'l5r-character-sheet.html').read_bytes()
    assert hashlib.sha256(built).hexdigest() == FROZEN and len(built) == 17484443
    print('PASS isolated build matches frozen candidate byte for byte', flush=True)
(Q / 'pre-suite-guard-checks.json').write_bytes((json.dumps({'checks': results, 'passed': True, 'scratch_build_exact': True, 'source_sha256': FROZEN}, indent=2) + '\n').encode())
print('8/8 guard checks passed; isolated build BYTE-IDENTICAL')
