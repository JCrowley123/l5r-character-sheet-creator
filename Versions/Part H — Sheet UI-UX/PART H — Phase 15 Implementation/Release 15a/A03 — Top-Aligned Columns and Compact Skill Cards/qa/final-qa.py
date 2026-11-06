"""Release 15a, A03 (revision 2): candidate 6865 (6860 in revision 1); remove CS15 to exact A02 (live) bytes; retained 6755 (A02 less the two live-site leaves). Fresh run folders only.
Adapted from A02's final-qa.py (constants only)."""
from pathlib import Path
import datetime, hashlib, json, os, re, shutil, subprocess, sys, tempfile, time


Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
BEFORE = '91d451099ee58f1b481fcf87b3defa7955138f9fb67a56e8fa6fac1e5ad66dc0'
BEFORE_BYTES = 17538334
LAST_KEPT = 'PART H — Phase 15 Implementation/Release 15a/A02 — Floating Controls Above the Tabs'
CANDIDATE, RETAINED, LAYERS = 6865, 6755, 1
OUT = Q / ('final-run-' + next(a.split('=', 1)[1] for a in sys.argv if a.startswith('--run=')) if any(a.startswith('--run=') for a in sys.argv) else 'final')
assert '--resume' not in sys.argv, 'Fresh runs only'
OUT.mkdir(exist_ok=False)
FROZEN = (Q/'qualified-sha256.txt').read_text().strip()
os.environ['L5R_QA_RUN_DIR'] = str(OUT)
summary = {'started_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}

def save():
    (OUT / 'summary.json').write_bytes((json.dumps(summary, indent=2) + '\n').encode())

def command(args, log):
    with (OUT / (log + '.log')).open('w', encoding='utf-8', newline='') as stream:
        result = subprocess.run(args, stdout=stream, stderr=subprocess.STDOUT, timeout=7200)
    output = (OUT / (log + '.log')).read_text(encoding='utf-8')
    assert result.returncode == 0, (log, result.returncode, output[-2000:])
    return output

def suite(tree, expected, label):
    started = time.time()
    args = [NODE, str(Q / 'flat-suite-runner.js'), str(tree / 'l5r-character-sheet.html')]
    if expected == RETAINED:
        args.append('--retained')
    output = command(args, label)
    matches = re.findall(r'COMBINED (\d+)/(\d+) checks passed', output)
    assert matches and tuple(map(int, matches[-1])) == (expected, expected), (label, matches[-1:] )
    assert not re.search(r'^FAIL ', output, re.M), label
    details = json.loads(re.findall(r'^FLAT_SUITE_RESULT=(.+)$', output, re.M)[-1])
    summary['cases'].append({'label': label, 'passed': expected, 'total': expected, 'orchestration': details,
                             'minutes': round((time.time()-started)/60, 2)})
    save()
    print(label + ': ' + str(expected) + '/' + str(expected) + ' passed', flush=True)

def main():
    assert 'splash-fast' not in os.environ.get('NODE_OPTIONS', ''), 'Splash bypass must be leaf-only, not inherited by splash/notice children'
    frozen = hashlib.sha256((P / 'l5r-character-sheet.html').read_bytes()).hexdigest()
    assert frozen == FROZEN, 'Candidate changed after qualification'
    summary.update(source_sha256=frozen, source_bytes=(P / 'l5r-character-sheet.html').stat().st_size)
    save()
    # --verify writes the output. Build an isolated copy so verification cannot
    # rewrite the frozen candidate; retain the builder's original hash check.
    with tempfile.TemporaryDirectory(prefix='l5r-a03-verify-') as verify_folder:
        verify_root = Path(verify_folder).resolve()
        assert verify_root.parent == Path(tempfile.gettempdir()).resolve()
        verify_tree = verify_root / 'phase0'
        shutil.copytree(P, verify_tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
        command([sys.executable, str(verify_tree / 'build/recombine.py'), '--verify'], '00-build')
        assert (verify_tree / 'l5r-character-sheet.html').read_bytes() == (P / 'l5r-character-sheet.html').read_bytes()
        summary['scratch_build_matches_frozen_source'] = True
        save()
    suite(P, CANDIDATE, '01-full')
    with tempfile.TemporaryDirectory(prefix='l5r-a03-final-') as folder:
        root = Path(folder).resolve()
        assert root.parent == Path(tempfile.gettempdir()).resolve()
        tree = root / 'phase0'
        shutil.copytree(P, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
        sys.path.insert(0, str(V / 'QA — Removal Chain Registry'))
        import removal_chain
        removed = removal_chain.strip_later(tree, after=LAST_KEPT)
        (OUT / '02-remove.log').write_bytes(('\n'.join(removed) + '\n').encode('utf-8'))
        assert len(removed) == LAYERS, removed
        summary['removed'] = removed
        command([sys.executable, str(tree / 'build/recombine.py'), '--verify'], '03-rebuild')
        data = (tree / 'l5r-character-sheet.html').read_bytes()
        assert hashlib.sha256(data).hexdigest() == BEFORE and len(data) == BEFORE_BYTES
        summary['restoration'] = {'sha256': BEFORE, 'bytes': len(data), 'exact': True}
        save()
        suite(tree, RETAINED, '04-retained')
    assert hashlib.sha256((P / 'l5r-character-sheet.html').read_bytes()).hexdigest() == frozen
    summary.update(passed=True, finished_utc=datetime.datetime.now(datetime.timezone.utc).isoformat())
    save()
    print('FINAL QA PASSED', flush=True)

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        summary.update(passed=False, error=str(error))
        save()
        raise
