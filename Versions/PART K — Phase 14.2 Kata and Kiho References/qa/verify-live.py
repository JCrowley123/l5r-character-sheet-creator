"""Verify deployed bytes, service-worker version and 156 focused checks.

Prepared 13 October 2026; adapted from the Small Fix Cycle live verifier.
Downloads stay in an owned temporary directory. Only QA evidence is retained.
"""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request

QA = Path(__file__).resolve().parent
V = QA.parents[1]
F = V / 'Part F — Cross-Platform Delivery'
SOURCE = F / 'PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
PWA = F / 'PART F — Phase 0.6 Installable Web App'
URL = 'https://l5r-character-sheet-creator.pages.dev/'
NODE = os.environ.get('L5R_NODE') or shutil.which('node') or 'C:/Program Files/nodejs/node.exe'


def committed(path):
    # Deployment reads Git blobs; older Windows PWA checkouts may use CRLF.
    relative = path.relative_to(V.parent).as_posix()
    return subprocess.check_output(['git', 'show', 'HEAD:' + relative], cwd=V.parent)


def download(name):
    request = urllib.request.Request(
        URL + name + '?references142=' + str(int(time.time())),
        headers={'Cache-Control': 'no-cache', 'User-Agent': 'L5R release verification'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def main():
    assert SOURCE.read_bytes() == committed(SOURCE), 'Source must match the committed deployment input'
    head = committed(PWA / 'src/head-pwa.html').decode('utf-8').rstrip('\n') + '\n'
    expected = SOURCE.read_bytes().decode('utf-8').replace('</head>', head + '</head>', 1).encode('utf-8')
    actual = download('')
    if actual != expected:
        print('DEPLOYMENT NOT CURRENT: expected ' + hashlib.sha256(expected).hexdigest()
              + ' got ' + hashlib.sha256(actual).hexdigest())
        print('Bytes expected/actual:', len(expected), len(actual),
              'References present:', b'const SEARCH_REFERENCES_ENABLED = true;' in actual)
        first = next((i for i, (a, b) in enumerate(zip(expected, actual)) if a != b),
                     min(len(expected), len(actual)))
        print('First difference at', first, 'expected:', repr(expected[max(0, first-50):first+110]),
              'actual:', repr(actual[max(0, first-50):first+110]))
        return 2
    digest = hashlib.sha256(expected)
    for name in ['manifest.webmanifest'] + ['icons/' + p.name for p in sorted((PWA / 'icons').glob('*.png'))]:
        digest.update(name.encode('utf-8'))
        digest.update(committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name))
    sw_id = digest.hexdigest()[:16]
    sw_expected = committed(PWA / 'src/sw.js').replace(b'__BUILD_ID__', sw_id.encode('ascii'))
    assert download('sw.js') == sw_expected, 'Deployed service worker differs from this build'
    lines = ['Live page matches expected PWA build byte for byte.', 'Service worker matches build ' + sw_id + '.']
    counts = []
    with tempfile.TemporaryDirectory(prefix='l5r-ref142-live-') as tmp:
        folder = Path(tmp).resolve()
        sheet = folder / 'index.html'
        sheet.write_bytes(actual)
        for harness, want in [
            (V / 'PART K — Phase 14 Search/qa/search-harness.js', 62),
            (V / 'PART K — Phase 14.1 Search Facets/qa/facets-harness.js', 44),
            (QA / 'references-harness.js', 30),
            (QA / 'dependency-harness.js', 20),
        ]:
            result = subprocess.run([NODE, str(harness), str(sheet)], capture_output=True,
                                    text=True, encoding='utf-8', timeout=600)
            lines.append(result.stdout + result.stderr)
            assert result.returncode == 0 and str(want) + '/' + str(want) + ' checks passed' in result.stdout, \
                result.stdout + result.stderr
            counts.append({'harness': harness.relative_to(V).as_posix(), 'passed': want, 'total': want})
        assert folder.parent == Path(tempfile.gettempdir()).resolve()
    report = {
        'commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=V.parent, text=True).strip(),
        'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'url': URL,
        'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'page_sha256': hashlib.sha256(actual).hexdigest(),
        'page_bytes': len(actual),
        'service_worker_build': sw_id,
        'harnesses': counts,
    }
    (QA / 'live-verification.json').write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    (QA / 'live-qa.log').write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf-8'))
    print(json.dumps(report, indent=2))
    print('LIVE VERIFICATION PASSED: ' + str(sum(c['passed'] for c in counts))
          + '/' + str(sum(c['total'] for c in counts)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
