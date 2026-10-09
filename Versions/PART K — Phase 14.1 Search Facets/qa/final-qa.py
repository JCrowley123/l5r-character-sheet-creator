"""A cycle's final QA, one step at a time (nothing in parallel): the full suite on the live tree's build, then each layer
of the cycle removed in turn from a scratch copy (newest first), each rebuild checked byte for byte against its restore
point, and the retained suite run on the rebuilt builds that name a runner. Logs and summary.json go to LOGDIR.

This is the second 9 October 2026 cycle's driver (Phase 14.1 Search Facets, adapted from Phase 11.3's). For a
new cycle, edit FULL_RUNNER and STEPS: (release folder, expected restore SHA-256, runner folder for the retained suite or
None), newest first, the expected SHAs taken from each remover's PRE_RELEASE_SHA.

    python -B final-qa.py <Versions folder> <log folder>
"""
import hashlib, json, os, pathlib, shutil, subprocess, sys, tempfile, time

V = pathlib.Path(sys.argv[1]); LOG = pathlib.Path(sys.argv[2]); LOG.mkdir(parents=True, exist_ok=True)
P0 = V / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
NODE = shutil.which('node') or 'C:/Program Files/nodejs/node.exe'
FULL_RUNNER = 'PART K — Phase 14.1 Search Facets'   # the folder whose qa/current-suite-runner.js runs the full suite
STEPS = [  # (release removed, expected restore sha, runner for the retained suite or None), newest first
    ('PART K — Phase 14.1 Search Facets', 'c951c9a3baf87ef115ae69dc657e11a7f52d66916edcde2c0369f711e99f6a3f', 'PART K — Phase 11.3 App Bar'),
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
