"""Live check for BUGFIX — Printed Skills and Equipment Tables: the deployed page and service worker match this build byte
for byte, then this release's harness (18 checks) runs on the downloaded page. Adapted from Printed Weapon Columns' copy; downloads
stay in an owned temporary directory and only the evidence is kept (qa/live/).
Needs NODE_PATH and NODE_OPTIONS as in Cycle 1's README, "Test environment".
"""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess, sys, tempfile, time, urllib.request

QA = Path(__file__).resolve().parent
V = QA.parents[1]  # Versions/
F = V / 'Part F — Cross-Platform Delivery'
SOURCE = F / 'PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
PWA = F / 'PART F — Phase 0.6 Installable Web App'
HARNESS = QA / 'printed-skills-equipment-harness.js'
URL = 'https://l5r-character-sheet-creator.pages.dev/'
OUT = QA / 'live'


def committed(path):
    # Deployment builds from Git blobs; older PWA files in this checkout carry CRLF.
    return subprocess.check_output(['git', 'show', 'HEAD:' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def download(name):
    request = urllib.request.Request(URL + name + '?skillsequip=' + str(int(time.time())),
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
    with tempfile.TemporaryDirectory(prefix='l5r-skillsequip-live-') as tmp:
        sheet = Path(tmp).resolve() / 'index.html'
        sheet.write_bytes(actual)
        run = subprocess.run([shutil.which('node') or r'C:\Program Files\nodejs\node.exe', str(HARNESS), str(sheet)],
                             capture_output=True, text=True, encoding='utf-8', timeout=600)
        lines.append(run.stdout + run.stderr)
    passed = run.returncode == 0 and '18/18 checks passed' in run.stdout
    report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': URL,
              'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              'page_sha256': hashlib.sha256(actual).hexdigest(), 'page_bytes': len(actual),
              'service_worker_build': sw_id, 'harness': run.stdout.strip().splitlines()[-1:], 'passed': passed}
    OUT.mkdir(exist_ok=True)
    (OUT / 'live-verification.json').write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    (OUT / 'live-qa.log').write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf-8'))
    print(json.dumps(report, indent=2))
    print('LIVE VERIFICATION ' + ('PASSED: Printed Skills and Equipment Tables 18/18' if passed else 'FAILED'))
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())
