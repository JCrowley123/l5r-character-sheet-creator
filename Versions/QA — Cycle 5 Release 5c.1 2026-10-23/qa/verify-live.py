"""Live check for Cycle 5, Release 5c.1: the deployed page and service worker match this build byte for byte (waiting up
to 10 minutes for the deploy), then 5c.1's new and changed checks run on the downloaded page, with the splash's and the
navigation's test switches as in the suite: the changing Sworn Enemy (13) and the printed heirlooms folded into
Inheritance (13). Adapted from Release 5c's verify-live.py (constants and runs only); evidence kept in qa/live/. Needs
NODE_PATH and NODE_OPTIONS as in Cycle 1's README, "Test environment".
"""
from pathlib import Path
import datetime, hashlib, json, re, shutil, subprocess, sys, tempfile, time, urllib.request

QA = Path(__file__).resolve().parent
V = QA.parents[1]
F = V / 'Part F — Cross-Platform Delivery'
SOURCE = F / 'PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
PWA = F / 'PART F — Phase 0.6 Installable Web App'
URL = 'https://l5r-character-sheet-creator.pages.dev/'
OUT = QA / 'live'
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'


def committed(path):
    # Deployment builds from Git blobs; older PWA files in this checkout carry CRLF.
    return subprocess.check_output(['git', 'show', 'HEAD:' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def download(name):
    request = urllib.request.Request(URL + name + ('&' if '?' in name else '?') + 'c5c1=' + str(int(time.time())),
                                     headers={'Cache-Control': 'no-cache', 'User-Agent': 'L5R release verification'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def main():
    head = committed(PWA / 'src/head-pwa.html').decode('utf-8').rstrip('\n') + '\n'
    expected = SOURCE.read_bytes().decode('utf-8').replace('</head>', head + '</head>', 1).encode('utf-8')
    for attempt in range(21):           # the deploy takes a few minutes to go live; the bytes themselves are never retried
        actual = download('')
        if actual == expected:
            break
        print('waiting for the deploy:', hashlib.sha256(actual).hexdigest()[:12], len(actual), flush=True)
        time.sleep(30)
    else:
        print('DEPLOYMENT NOT CURRENT: expected', hashlib.sha256(expected).hexdigest(), len(expected))
        return 2
    digest = hashlib.sha256(expected)
    names = ['manifest.webmanifest'] + ['icons/' + p.name for p in sorted((PWA / 'icons').glob('*.png'))]
    for name in names:
        digest.update(name.encode('utf-8'))
        digest.update(committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name))
    sw_id = digest.hexdigest()[:16]
    sw = download('sw.js')
    if sw != committed(PWA / 'src/sw.js').replace(b'__BUILD_ID__', sw_id.encode('ascii')):
        print('DEPLOYED SERVICE WORKER DIFFERS from build', sw_id)
        return 3
    lines = ['Live page matches the expected PWA build byte for byte.', 'Service worker matches build ' + sw_id + '.']
    results = {}
    with tempfile.TemporaryDirectory(prefix='l5r-c5c1-live-') as tmp:
        site = Path(tmp).resolve() / 'site'
        (site / 'icons').mkdir(parents=True)
        (site / 'index.html').write_bytes(actual)
        (site / 'sw.js').write_bytes(sw)
        for name in names:
            (site / name).write_bytes(download(name))
        sheet = site / 'index.html'
        fast = ['--require', str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
                '--require', str(F / 'PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
        runs = [(V / 'PART I — Phase 4.5.41 A Changing Sworn Enemy/qa/shifting-enemy-harness.js', [sheet], 13, fast),
                (V / 'PART I — Phase 4.5.42 Inheritance and the Printed Heirlooms/qa/printed-heirlooms-harness.js', [sheet], 13, fast)]
        for harness, args, total, preload in runs:
            run = subprocess.run([NODE, *preload, str(harness), *map(str, args)], cwd=str(harness.parent.parent),
                                 capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=1200)
            label = harness.parent.parent.name + '/' + harness.name
            lines.append('== ' + label + '\n' + run.stdout + run.stderr)
            counts = re.findall(r'(\d+)/(\d+) checks passed', run.stdout)
            results[label] = {'counts': counts[-1] if counts else None, 'expected': total,
                              'passed': run.returncode == 0 and counts[-1:] == [(str(total), str(total))]}
    passed = all(r['passed'] for r in results.values())
    report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': URL,
              'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              'page_sha256': hashlib.sha256(actual).hexdigest(), 'page_bytes': len(actual),
              'service_worker_build': sw_id, 'service_worker_sha256': hashlib.sha256(sw).hexdigest(),
              'harnesses': results, 'passed': passed}
    OUT.mkdir(exist_ok=True)
    (OUT / 'live-verification.json').write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    (OUT / 'live-qa.log').write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf-8'))
    print(json.dumps({k: v for k, v in report.items() if k != 'harnesses'}, indent=2))
    for label, r in results.items():
        print(('PASS ' if r['passed'] else 'FAIL ') + label + ' ' + '/'.join(r['counts'] or ['?']))
    total = sum(r['expected'] for r in results.values())
    print('LIVE VERIFICATION ' + (f'PASSED: {total}/{total} on the deployed files' if passed else 'FAILED'))
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())
