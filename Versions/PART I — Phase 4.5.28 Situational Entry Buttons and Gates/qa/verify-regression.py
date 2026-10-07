"""Run the full suite on this release's build, then every retained suite after actual scratch removal."""
from pathlib import Path
import hashlib, json, os, re, shutil, subprocess, sys, tempfile

HERE = Path(__file__).resolve().parent
VERSIONS = next(p for p in HERE.parents if (p / 'BUILD-LEDGER.md').is_file())
LIVE = VERSIONS / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
RETAINED = VERSIONS / 'PART I — Phase 4.5.27 Situational Roll Entries' / 'qa' / 'current-suite-runner.js'
BASE = '26eb8d8c1f0c61c015831e5b426010d470d49df1a2d86975f5fc9f3b58fa416f'
NODE = shutil.which('node') or 'C:/Program Files/nodejs/node.exe'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def run(harness, sheet, label, expected_total):
    print('Starting ' + label, flush=True)
    proc = subprocess.run([NODE, str(harness), str(sheet)], capture_output=True,
                          text=True, encoding='utf-8', timeout=3600)
    output = (proc.stdout or '') + (proc.stderr or '')
    (HERE / (label + '.log')).write_text(output, encoding='utf-8')
    counts = re.findall(r'(\d+)/(\d+) checks passed', output)
    if not counts:
        raise RuntimeError(label + ' did not report a check count: ' + output[-2000:])
    passed, total = map(int, counts[-1])
    result = dict(passed=passed, total=total, exit_code=proc.returncode,
                  build_sha256=sha(sheet), build_bytes=sheet.stat().st_size)
    result['success'] = proc.returncode == 0 and passed == total == expected_total
    print(label + ': ' + json.dumps(result), flush=True)
    return result

def main():
    result = {'verification_date': '2026-10-07'}
    live_sheet = LIVE / 'l5r-character-sheet.html'
    subprocess.run([sys.executable, '-B', str(LIVE / 'build/recombine.py'), '--verify'],
                   check=True, capture_output=True)
    result['corrected'] = run(HERE / 'current-suite-runner.js', live_sheet, 'full-regression', 4453)
    (HERE / 'regression-verification.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    with tempfile.TemporaryDirectory(prefix='l5r-sit4528-removal-') as tmp:
        scratch = Path(tmp).resolve()
        assert scratch.parent == Path(tempfile.gettempdir()).resolve()
        tree = scratch / 'phase0'
        assert scratch in tree.resolve().parents and not tree.exists()
        shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('l5r-character-sheet.html', '__pycache__'))
        removed = subprocess.run([sys.executable, '-B', str(HERE / 'remove-phase.py'), str(tree)],
                                 capture_output=True, text=True, encoding='utf-8', check=True)
        built = subprocess.run([sys.executable, '-B', str(tree / 'build/recombine.py'), '--verify'],
                               capture_output=True, text=True, encoding='utf-8', check=True)
        (HERE / 'removal-build.log').write_text(removed.stdout + removed.stderr + built.stdout + built.stderr,
                                              encoding='utf-8')
        sheet = tree / 'l5r-character-sheet.html'
        assert sha(sheet) == BASE, ('Removal did not restore the exact baseline', sha(sheet))
        result['removed'] = run(RETAINED, sheet, 'removed-regression', 4389)
        result['baseline_restored_exactly'] = True
        # TemporaryDirectory owns only this verified unique scratch directory.
        assert scratch.parent == Path(tempfile.gettempdir()).resolve()
    (HERE / 'regression-verification.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    return 0 if result['corrected']['success'] and result['removed']['success'] else 1

if __name__ == '__main__':
    sys.exit(main())
