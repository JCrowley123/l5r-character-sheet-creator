"""Verify Release 7b.1.1's deployment bytes and 500 checks on the downloaded live files: the three new layers (25)
and the older harnesses they follow (R15's gender, 12; R16's pointer, 12; the Spell Slot Accounting fix, 52; Part G
Phase 3's roll preview, 50; Phase 4.8's Ancestors, 349), at the counts they passed in both full runs. Adapted from
Release 7b.1's verifier. Each harness
runs once, sequentially, from the repository root as in the full suite. Only deployment propagation is polled;
failing feature checks are not retried.
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
    request = urllib.request.Request(URL + name + ('&' if '?' in name else '?') + 'r7b11=' + str(int(time.time())),
                                     headers={'Cache-Control': 'no-cache', 'User-Agent': 'L5R release verification'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def main():
    head = committed(PWA / 'src/head-pwa.html').decode('utf-8').rstrip('\n') + '\n'
    expected = committed(SOURCE).decode('utf-8').replace('</head>', head + '</head>', 1).encode('utf-8')
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
    with tempfile.TemporaryDirectory(prefix='l5r-7b11-live-') as tmp:
        site = Path(tmp).resolve() / 'site'
        (site / 'icons').mkdir(parents=True)
        (site / 'index.html').write_bytes(actual)
        (site / 'sw.js').write_bytes(sw)
        asset_hashes = {}
        for name in names:
            data = download(name)
            expected_asset = committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name)
            if data != expected_asset:
                raise RuntimeError('Deployed asset differs: ' + name)
            (site / name).write_bytes(data)
            asset_hashes[name] = hashlib.sha256(data).hexdigest()
        sheet = site / 'index.html'
        fast = ['--require', str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
                '--require', str(F / 'PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
        runs = [
            (V / 'BUGFIX — School List Gender Tick/qa/list-gender-harness.js', [sheet], 8, fast),
            (V / 'BUGFIX — Gift Cancel Refunds the Spell Slot/qa/gift-refund-harness.js', [sheet], 8, fast),
            (V / 'BUGFIX — Compact Advanced Schools Button/qa/school-button-harness.js', [sheet], 9, fast),
            (V / 'BUGFIX — Gender From Identity and the Wizard/qa/gender-harness.js', [sheet], 12, fast),
            (V / 'BUGFIX — Advanced Schools Pointer/qa/school-pointer-harness.js', [sheet], 12, fast),
            (V / 'BUGFIX — Spell Slot Accounting/qa/spell-slot-accounting-harness.js', [sheet], 52, fast),
            (V / 'Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js', [sheet], 50, fast),
            (V / 'PART I — Phase 4.8 Ancestors/qa/ancestors-harness.js', [sheet], 349, fast)
        ]
        for harness, args, total, preload in runs:
            print("Checking deployed files:", harness.name, flush=True)
            run = subprocess.run([NODE, *preload, str(harness), *map(str, args)], cwd=str(V.parent),
                                 capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=1200)
            label = harness.parent.parent.name + '/' + harness.name
            lines.append('== ' + label + '\n' + run.stdout + run.stderr)
            counts = re.findall(r'(\d+)/(\d+) checks passed', run.stdout)
            results[label] = {'counts': counts[-1] if counts else None, 'expected': total,
                              'passed': run.returncode == 0 and counts[-1:] == [(str(total), str(total))]}
    passed = len(results) == 8 and sum(r['expected'] for r in results.values()) == 500 and all(r['passed'] for r in results.values())
    report = {'commit': subprocess.check_output(['git','rev-parse','HEAD'], cwd=V.parent, text=True).strip(), 'downloaded_asset_sha256': asset_hashes, 'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': URL,
              'source_sha256': hashlib.sha256(committed(SOURCE)).hexdigest(),
              'page_sha256': hashlib.sha256(actual).hexdigest(), 'page_bytes': len(actual),
              'service_worker_build': sw_id, 'service_worker_sha256': hashlib.sha256(sw).hexdigest(),
              'harnesses': results, 'passed': passed}
    OUT.mkdir(exist_ok=True)
    (OUT / 'live-verification.json').write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    (OUT / 'live-qa.log').write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf-8'))
    print(json.dumps({k: v for k, v in report.items() if k not in ('harnesses', 'downloaded_asset_sha256')}, indent=2))
    for label, r in results.items():
        print(('PASS ' if r['passed'] else 'FAIL ') + label + ' ' + '/'.join(r['counts'] or ['?']))
    total = sum(r['expected'] for r in results.values())
    print('LIVE VERIFICATION ' + (f'PASSED: {total}/{total} on the deployed files' if passed else 'FAILED'))
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())
