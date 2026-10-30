"""Release 8a, after the review: on the fixed build, in order, each step's log kept in after-review-<n>/:
the two layers' own harnesses and the three edited older ones, unthrottled (run-own.py); every pinned variant of both
layers; the wizard's own variants with XW8 off; Phase 11's own variants against its edited harness; both removal
proofs; then the five changed harnesses at 4x CPU (run-under-load.py). The tree is not rebuilt meanwhile.
Usage: python -B after-review.py <n>"""
from pathlib import Path
import os, shutil, subprocess, sys

Q = Path(__file__).resolve().parent
V = Q.parent.parent
n = sys.argv[1]
OUT = Q / ('after-review-' + n)
OUT.mkdir(exist_ok=False)
os.environ.update(NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PYTHONUTF8='1',
                  NODE_OPTIONS='--require "' + str(V / 'QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js').replace('\\', '/') + '"')
XW = V / 'BUGFIX — Wizard Overspend Warns/qa'
AU = V / 'BUGFIX — Undone Change Not Unsaved Work/qa'
CL = V / 'PART K — Phase 11 Characters List and Save Model/qa'
steps = [
    ('own', [sys.executable, '-B', str(Q / 'run-own.py'), 'after-review-' + n + '/own',
             'BUGFIX — Wizard Overspend Warns/qa/overspend-warns-harness.js',
             'BUGFIX — Undone Change Not Unsaved Work/qa/undone-change-harness.js',
             'PART K — Phase 11.2 Creation Wizard/qa/wizard-harness.js',
             'PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js',
             'PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js',
             'Part J — Data Integrity & Validation/PART J — Phase 7.1 Audit Log/qa/audit-harness.js'], Q),
    ('xw8-variants', [sys.executable, '-B', str(XW / 'verify-variants.py')], XW),
    ('au8-variants', [sys.executable, '-B', str(AU / 'verify-variants.py')], AU),
    ('xw8-off', [sys.executable, '-B', str(XW / 'xw8-variants-off.py')], XW),
    # Phase 11's variant script launches plain `node`, written before the splash; the suite preloads the splash's test
    # switch into every leaf, so it is preloaded here too (without it CL-COVERS-VIEWPORT meets the splash in every variant).
    ('cl-variants', [sys.executable, '-B', str(CL / 'verify-variants.py')], CL),
    ('xw8-removal', [sys.executable, '-B', str(XW / 'test-removal.py')], XW),
    ('au8-removal', [sys.executable, '-B', str(AU / 'test-removal.py')], AU),
    ('under-load', [sys.executable, '-B', str(Q / 'run-under-load.py'), 'after-review-' + n + '/under-load'], Q),
]
SPLASH_FAST = str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs').replace('\\', '/')
codes = {}
for name, args, cwd in steps:
    env = dict(os.environ)
    if name == 'cl-variants':
        env['NODE_OPTIONS'] = env['NODE_OPTIONS'] + ' --require "' + SPLASH_FAST + '"'
    with (OUT / (name + '.log')).open('wb') as f:
        codes[name] = subprocess.run(args, cwd=str(cwd), env=env, stdout=f, stderr=subprocess.STDOUT, timeout=14400).returncode
    print(name + ' exit ' + str(codes[name]), flush=True)
# The layers' variant records are written to their own negative/ folders; a copy is kept with this run.
for label, folder in (('xw8', XW / 'negative'), ('au8', AU / 'negative'), ('xw8-off', XW / 'xw8-off')):
    if folder.is_dir():
        shutil.copytree(folder, OUT / (label + '-records'))
print('AFTER REVIEW ' + ('PASSED' if not any(codes.values()) else 'FAILED: ' + ', '.join(k for k, v in codes.items() if v)), flush=True)
sys.exit(1 if any(codes.values()) else 0)
