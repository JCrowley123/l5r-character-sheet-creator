"""A cycle's final QA, one step at a time (nothing in parallel): the full suite on the live tree's build, then each layer
of the cycle removed in turn from a scratch copy (newest first), each rebuild checked byte for byte against its restore
point, and the retained suite run on the rebuilt builds that name a runner. Logs and summary.json go to LOGDIR.

This is the 9 October 2026 cycle's driver (Phases 11.3, 4.5.35, the top-bar bugfix, then 4.5.34, 4.5.33 and Search). For a
new cycle, edit FULL_RUNNER and STEPS: (release folder, expected restore SHA-256, runner folder for the retained suite or
None), newest first, the expected SHAs taken from each remover's PRE_RELEASE_SHA.

    python -B final-qa.py <Versions folder> <log folder>
"""
import hashlib, json, os, pathlib, shutil, subprocess, sys, tempfile, time

V = pathlib.Path(sys.argv[1]); LOG = pathlib.Path(sys.argv[2]); LOG.mkdir(parents=True, exist_ok=True)
P0 = V / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
NODE = shutil.which('node') or 'C:/Program Files/nodejs/node.exe'
FULL_RUNNER = 'PART K — Phase 11.3 App Bar'   # the folder whose qa/current-suite-runner.js runs the full suite
STEPS = [  # (release removed, expected restore sha, runner for the retained suite or None), newest first
    ('PART K — Phase 11.3 App Bar', '8d3e899c5fed2ff24d18b0e378664737e93e3bff567243925c6a89a01ce3ee08', 'PART I — Phase 4.5.35 Initiative Score'),
    ('PART I — Phase 4.5.35 Initiative Score', '8a7d72fc1d8cac7a63be96157ebe814c91bd48ce54f0ce99e89c103c25b3cfae', 'BUGFIX — Characters Screen Top Bar'),
    ('BUGFIX — Characters Screen Top Bar', 'fd57e05f1412d98212b0d5281f5047cf082c307bef6513b839bd41bdef19e0c1', 'PART I — Phase 4.5.34 Blind Armor TN Note'),
    ('PART I — Phase 4.5.34 Blind Armor TN Note', '9469905b8871ae89497e3095f78f60b90e54dbc18ce81f766f335e84eb972830', None),
    ('PART I — Phase 4.5.33 Void and Initiative Entries', 'dfbe292c3ed194d2af8f41393ea8972c9c7ee27631b7ff1cfac9bfb70f638021', None),
    ('PART K — Phase 14 Search', 'fe2873e6654e63947fef50a36ebf8f0c6cd611d887651225b78abf87916501dd', None),
]
summary = {'started': time.strftime('%Y-%m-%d %H:%M:%S')}


def suite(runner_dir, html, name):
    t = time.time()
    p = subprocess.run([NODE, str(V / runner_dir / 'qa' / 'current-suite-runner.js'), str(html)],
                       capture_output=True, text=True, encoding='utf-8', timeout=7200)
    out = p.stdout + p.stderr
    (LOG / (name + '.log')).write_text(out, encoding='utf-8')
    last = [l for l in out.splitlines() if l.startswith('COMBINED ')]
    fails = [l for l in out.splitlines() if l.startswith('FAIL ')]
    return {'combined': last[-1] if last else None, 'exit': p.returncode, 'fails': fails[:20], 'minutes': round((time.time() - t) / 60, 1)}


summary['full'] = suite(FULL_RUNNER, P0 / 'l5r-character-sheet.html', '01-full-suite')
(LOG / 'summary.json').write_text(json.dumps(summary, indent=1), encoding='utf-8')
with tempfile.TemporaryDirectory(prefix='l5r-final-removal-') as tmp:
    tree = pathlib.Path(tmp) / 'phase0'
    shutil.copytree(P0, tree, ignore=shutil.ignore_patterns('l5r-character-sheet.html', 'dist', '__pycache__'))
    summary['removals'] = []
    for i, (release, sha, runner) in enumerate(STEPS, 2):
        r = subprocess.run([sys.executable, '-B', str(V / release / 'qa' / 'remove-phase.py'), str(tree), '--expect-sha', sha],
                           capture_output=True, text=True, encoding='utf-8')
        b = subprocess.run([sys.executable, '-B', str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
        html = tree / 'l5r-character-sheet.html'
        data = html.read_bytes() if html.exists() else b''
        step = {'removed': release, 'remover_exit': r.returncode, 'verify_exit': b.returncode,
                'sha': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'expected': sha}
        step['match'] = step['sha'] == sha
        if runner and step['match']:
            step['retained'] = suite(runner, html, f'{i:02d}-without-' + release.split('—')[-1].strip().replace(' ', '-'))
        summary['removals'].append(step)
        (LOG / 'summary.json').write_text(json.dumps(summary, indent=1), encoding='utf-8')
        if not step['match']:
            break
summary['finished'] = time.strftime('%Y-%m-%d %H:%M:%S')
(LOG / 'summary.json').write_text(json.dumps(summary, indent=1), encoding='utf-8')
print(json.dumps(summary, indent=1))
