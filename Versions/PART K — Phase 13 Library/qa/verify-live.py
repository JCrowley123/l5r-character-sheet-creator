"""Live check for PART K — Phase 13 Library (Release 1): the deployed page and service worker match this build byte for
byte, then Search's harness (62), this layer's harness (187) and its page-off harness (7) run on the downloaded page.
Adapted from Phase 4.5.36's qa/verify-live.py (harness list and labels only); evidence kept in qa/live/.
Needs NODE_PATH and NODE_OPTIONS as in Cycle 1's README, "Test environment".
"""
from pathlib import Path
import datetime, hashlib, json, re, shutil, subprocess, sys, tempfile, time, urllib.request

QA = Path(__file__).resolve().parent
V = QA.parents[1]
F = V / 'Part F — Cross-Platform Delivery'
SOURCE = F / 'PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
PWA = F / 'PART F — Phase 0.6 Installable Web App'
HARNESSES = [(V / 'PART K — Phase 14 Search/qa/search-harness.js', 62),
             (QA / 'library-harness.js', 187),
             (QA / 'library-dependency.js', 7)]
URL = 'https://l5r-character-sheet-creator.pages.dev/'
OUT = QA / 'live'


def committed(path):
    # Deployment builds from Git blobs; older PWA files in this checkout carry CRLF.
    return subprocess.check_output(['git', 'show', 'HEAD:' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def download(name):
    request = urllib.request.Request(URL + name + '?lib13=' + str(int(time.time())),
                                     headers={'Cache-Control': 'no-cache', 'User-Agent': 'L5R release verification'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def main():
    head = committed(PWA / 'src/head-pwa.html').decode('utf-8').rstrip('\n') + '\n'
    expected = SOURCE.read_bytes().decode('utf-8').replace('</head>', head + '</head>', 1).encode('utf-8')
    actual = download('')
    if actual != expected:
        print('DEPLOYMENT NOT CURRENT: expected', hashlib.sha256(expected).hexdigest(), len(expected),
              'got', hashlib.sha256(actual).hexdigest(), len(actual))
        return 2
    digest = hashlib.sha256(expected)
    for name in ['manifest.webmanifest'] + ['icons/' + p.name for p in sorted((PWA / 'icons').glob('*.png'))]:
        digest.update(name.encode('utf-8'))
        digest.update(committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name))
    sw_id = digest.hexdigest()[:16]
    if download('sw.js') != committed(PWA / 'src/sw.js').replace(b'__BUILD_ID__', sw_id.encode('ascii')):
        print('DEPLOYED SERVICE WORKER DIFFERS from build', sw_id)
        return 3
    lines = ['Live page matches the expected PWA build byte for byte.', 'Service worker matches build ' + sw_id + '.']
    results = {}
    with tempfile.TemporaryDirectory(prefix='l5r-lib13-live-') as tmp:
        sheet = Path(tmp).resolve() / 'index.html'
        sheet.write_bytes(actual)
        for harness, total in HARNESSES:
            run = subprocess.run([shutil.which('node') or r'C:\Program Files\nodejs\node.exe', str(harness), str(sheet)],
                                 capture_output=True, text=True, encoding='utf-8', timeout=600)
            lines.append('== ' + harness.parent.parent.name + '\n' + run.stdout + run.stderr)
            counts = re.findall(r'(\d+)/(\d+) checks passed', run.stdout)
            results[harness.parent.parent.name + '/' + harness.name] = {'counts': counts[-1] if counts else None, 'expected': total,
                                                   'passed': run.returncode == 0 and counts[-1:] == [(str(total), str(total))]}
    passed = all(r['passed'] for r in results.values())
    report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': URL,
              'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              'page_sha256': hashlib.sha256(actual).hexdigest(), 'page_bytes': len(actual),
              'service_worker_build': sw_id, 'harnesses': results, 'passed': passed}
    OUT.mkdir(exist_ok=True)
    (OUT / 'live-verification.json').write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    (OUT / 'live-qa.log').write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf-8'))
    print(json.dumps(report, indent=2))
    print('LIVE VERIFICATION ' + ('PASSED: Search 62/62, Library 187/187, page off 7/7' if passed else 'FAILED'))
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())
