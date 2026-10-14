"""Complete independent live groups after the two preserved Search failures.

Does not rerun, omit from reporting, or turn the failed Search group green.
Also checks the historical PWA once as a diagnostic, without modifying it.
"""
from pathlib import Path
import datetime, hashlib, importlib.util, json, re, subprocess, tempfile

Q = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('live', Q / 'verify-live.py')
L = importlib.util.module_from_spec(spec)
spec.loader.exec_module(L)

def run(harness, sheet, label, expected):
    r = subprocess.run([L.NODE, str(harness), str(sheet)], capture_output=True,
                       text=True, encoding='utf-8', timeout=600)
    output = r.stdout + r.stderr
    (Q / (label + '.log')).write_bytes(output.encode())
    counts = re.findall(r'(\d+)/(\d+) checks passed', output)
    passed, total = map(int, counts[-1]) if counts else (0, 0)
    good = r.returncode == 0 and passed == total == expected and not re.search(r'^FAIL ', output, re.M)
    return dict(harness=harness.relative_to(L.V).as_posix(), passed=passed,
                executed=total, expected=expected, success=good, exit_code=r.returncode)

def main():
    assert L.SOURCE.read_bytes() == L.committed(L.SOURCE)
    assert hashlib.sha256(L.SOURCE.read_bytes()).hexdigest() == '7b68f34d746d8674cdd33e6815197f9c1ea8e6e131ab42c2e523a4f477d4929a', \
        'This follow-up belongs only to the recorded Phase 14.2 release'
    head = L.committed(L.PWA / 'src/head-pwa.html').decode().rstrip('\n') + '\n'
    expected = L.SOURCE.read_bytes().decode().replace('</head>', head + '</head>', 1).encode()
    actual = L.download('')
    assert actual == expected, 'Deployed page no longer matches release'
    digest = hashlib.sha256(expected)
    for name in ['manifest.webmanifest'] + ['icons/' + p.name for p in sorted((L.PWA / 'icons').glob('*.png'))]:
        digest.update(name.encode())
        digest.update(L.committed(L.PWA / ('src' if name == 'manifest.webmanifest' else '') / name))
    sw_id = digest.hexdigest()[:16]
    assert L.download('sw.js') == L.committed(L.PWA / 'src/sw.js').replace(b'__BUILD_ID__', sw_id.encode())
    report = dict(commit=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),
                  url=L.URL, page_matches=True, service_worker_matches=True,
                  source_sha256=hashlib.sha256(L.SOURCE.read_bytes()).hexdigest(),
                  page_sha256=hashlib.sha256(actual).hexdigest(), page_bytes=len(actual),
                  service_worker_build=sw_id, full_live_suite_passed=False,
                  search_attempts=[dict(passed=51,executed=53,expected=62,success=False,
                                        evidence='live-attempt-1.md'),
                                   dict(passed=51,executed=53,expected=62,success=False,
                                        evidence='live-attempt-2.log')], harnesses=[])
    with tempfile.TemporaryDirectory(prefix='l5r-ref142-live-followup-') as folder:
        root = Path(folder).resolve()
        assert root.parent == Path(tempfile.gettempdir()).resolve()
        sheet = root / 'index.html'
        sheet.write_bytes(actual)
        for harness, label, want in [
            (L.V / 'PART K — Phase 14.1 Search Facets/qa/facets-harness.js', 'live-followup-facets', 44),
            (Q / 'references-harness.js', 'live-followup-references', 30),
            (Q / 'dependency-harness.js', 'live-followup-dependencies', 20),
        ]:
            item = run(harness, sheet, label, want)
            report['harnesses'].append(item)
            print(label, item, flush=True)
        before = subprocess.check_output(['git','show','8b75d3c:' + L.SOURCE.relative_to(L.V.parent).as_posix()])
        baseline = before.decode().replace('</head>', head + '</head>', 1).encode()
        assert hashlib.sha256(baseline).hexdigest() == '312fa071b72e6bd14b5083cdf3f510e66e1e222e4394b69beefa6142f1972403'
        old_sheet = root / 'baseline.html'
        old_sheet.write_bytes(baseline)
        report['historical_search_diagnostic'] = run(L.V / 'PART K — Phase 14 Search/qa/search-harness.js',
                                                   old_sheet, 'live-baseline-search', 62)
    report['checked_utc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    report['independent_groups_passed'] = all(r['success'] for r in report['harnesses'])
    (Q / 'live-follow-up-verification.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    print(json.dumps(report, indent=2), flush=True)
    print('Full live suite remains FAILED: Search FT-34 is recorded separately.', flush=True)
    return 0 if report['independent_groups_passed'] else 1

if __name__ == '__main__':
    raise SystemExit(main())
