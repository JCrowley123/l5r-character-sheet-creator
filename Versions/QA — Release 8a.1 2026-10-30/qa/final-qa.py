"""Release 8a.1: candidate 6672 (two layers on 8a); remove the two to exact main e8310bec (build 2a9f66ed); retained 6579 (main less the two live-site leaves). Fresh run folders only."""
from pathlib import Path
import datetime, hashlib, json, os, re, shutil, subprocess, sys, tempfile, time

Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
BEFORE = '2a9f66ed444f50b001ef0b670ea71cb370fc65fc24146ddf9cd1a7ce1f4a2084'
BEFORE_BYTES = 17452358
LAST_KEPT = 'BUGFIX — Undone Change Not Unsaved Work'
CANDIDATE, RETAINED, LAYERS = 6672, 6579, 2
OUT = Q / ('final-run-' + next(a.split('=', 1)[1] for a in sys.argv if a.startswith('--run=')) if any(a.startswith('--run=') for a in sys.argv) else 'final')
assert '--resume' not in sys.argv, 'Fresh runs only'
OUT.mkdir(exist_ok=False)
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
    summary.update(source_sha256=frozen, source_bytes=(P / 'l5r-character-sheet.html').stat().st_size)
    save()
    command([sys.executable, str(P / 'build/recombine.py'), '--verify'], '00-build')
    suite(P, CANDIDATE, '01-full')
    with tempfile.TemporaryDirectory(prefix='l5r-8a1-final-') as folder:
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
