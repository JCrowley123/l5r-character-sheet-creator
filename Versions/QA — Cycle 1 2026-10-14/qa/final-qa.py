"""Cycle 1: frozen seven-layer candidate, then all seven layers removed newest first through the registry, which must
rebuild main at 65fb705 exactly, and the retained suite on that rebuild. One browser job at a time."""
from pathlib import Path
import datetime, hashlib, json, os, re, shutil, subprocess, sys, tempfile, time

Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
BEFORE = '7b68f34d746d8674cdd33e6815197f9c1ea8e6e131ab42c2e523a4f477d4929a'
BEFORE_BYTES = 3800283
LAST_KEPT = 'PART K — Phase 14.2 Kata and Kiho References'
OUT = Q / 'final'
OUT.mkdir(exist_ok=True)
summary = {'started_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}

def save():
    (OUT / 'summary.json').write_bytes((json.dumps(summary, indent=2) + '\n').encode())

def command(args, log):
    with (OUT / (log + '.log')).open('w', encoding='utf-8', newline='') as stream:
        result = subprocess.run(args, stdout=stream, stderr=subprocess.STDOUT, timeout=7200)
    output = (OUT / (log + '.log')).read_text(encoding='utf-8')
    assert result.returncode == 0, (log, result.returncode, output[-2000:])
    return output

def suite(runner, tree, expected, label):
    started = time.time()
    args = [NODE, str(Q / 'flat-suite-runner.js'), str(tree / 'l5r-character-sheet.html')]
    if expected == 5107:
        args.append('--retained')
    if '--resume' in sys.argv:
        args.append('--resume')
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
    frozen = hashlib.sha256((P / 'l5r-character-sheet.html').read_bytes()).hexdigest()
    summary.update(source_sha256=frozen, source_bytes=(P / 'l5r-character-sheet.html').stat().st_size)
    save()
    command([sys.executable, str(P / 'build/recombine.py'), '--verify'], '00-build')
    suite(None, P, 5249, '01-full')
    with tempfile.TemporaryDirectory(prefix='l5r-cycle1-final-') as folder:
        root = Path(folder).resolve()
        assert root.parent == Path(tempfile.gettempdir()).resolve()
        tree = root / 'phase0'
        shutil.copytree(P, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
        sys.path.insert(0, str(V / 'QA — Removal Chain Registry'))
        import removal_chain
        removed = removal_chain.strip_later(tree, after=LAST_KEPT)
        (OUT / '02-remove.log').write_text('\n'.join(removed) + '\n', encoding='utf-8')
        assert len(removed) == 7, removed
        summary['removed'] = removed
        command([sys.executable, str(tree / 'build/recombine.py'), '--verify'], '03-rebuild')
        data = (tree / 'l5r-character-sheet.html').read_bytes()
        assert hashlib.sha256(data).hexdigest() == BEFORE and len(data) == BEFORE_BYTES
        summary['restoration'] = {'sha256': BEFORE, 'bytes': len(data), 'exact': True}
        save()
        suite(None, tree, 5107, '04-retained')
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
