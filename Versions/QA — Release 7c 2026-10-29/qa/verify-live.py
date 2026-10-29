"""Verify Release 7c's deployment bytes and 678 checks on the downloaded live files: the six new layers (67), 7b.2's
three (74), and the twelve older harnesses 7c changed (537), at the counts they passed in both full runs. Adapted from
Release 7b.2's verifier. Each harness runs once, sequentially, from the repository root as in the full suite.
Only deployment propagation is polled; failing feature checks are not retried.
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
    request = urllib.request.Request(URL + name + ('&' if '?' in name else '?') + 'r7c=' + str(int(time.time())),
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
    with tempfile.TemporaryDirectory(prefix='l5r-7c-live-') as tmp:
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
            (V / 'BUGFIX — Moon Curse Full Moon/qa/moon-harness.js', [sheet], 17, fast),
            (V / 'BUGFIX — Creation Cap of Four/qa/cap-harness.js', [sheet], 11, fast),
            (V / 'BUGFIX — Empty Quiver Rolls On/qa/quiver-harness.js', [sheet], 8, fast),
            (V / 'BUGFIX — Starting Spells Are Scrolls/qa/scrolls-harness.js', [sheet], 5, fast),
            (V / 'BUGFIX — After-Preview Refund/qa/refund-harness.js', [sheet], 9, fast),
            (V / 'Part J — Data Integrity & Validation/PART J — Phase 7.1 Audit Log/qa/audit-harness.js', [sheet], 17, fast),
            (V / 'BUGFIX — Advantage Set Rules/qa/set-rules-harness.js', [sheet], 50, fast),
            (V / 'BUGFIX — Station and Shapeshifter Reference Entries/qa/station-reference-harness.js', [sheet], 10, fast),
            (V / 'BUGFIX — Instigator Blackmail Count/qa/instigator-harness.js', [sheet], 14, fast),
            (V / 'PART I — Phase 4.5.7 Unlucky/qa/disadv-unlucky-harness.js', [sheet], 32, fast),
            (V / 'PART I — Phase 4.5.8 Dependant and Wrath of the Kami/qa/disadv-dependant-wrath-harness.js', [sheet], 55, fast),
            (V / 'PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js', [sheet], 70, fast),
            (V / 'PART K — Phase 11.1 Export to PDF/qa/pdf-harness.js', [sheet], 33, fast),
            (V / 'PART K — Phase 11.2 Creation Wizard/qa/wizard-harness.js', [sheet], 43, fast),
            (V / 'PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js', [sheet], 32, fast),
            (V / 'PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho/qa/wizard3-harness.js', [sheet], 52, fast),
            (V / 'PART K — Phase 11.2.3 Wizard Starting Spells/qa/wizard4-harness.js', [sheet], 25, fast),
            (V / 'PART K — Phase 11.2.4 Wizard Starting Spells for Every School/qa/wizard5-harness.js', [sheet], 71, fast),
            (V / 'PART K — Phase 11.3 App Bar/qa/appbar-harness.js', [sheet], 25, fast),
            (V / 'PART K — Phase 12.8 Play Mode Toolbar/qa/toolbar-harness.js', [sheet], 37, fast),
            (V / 'PART K — Phase 14 Search/qa/search-harness.js', [sheet], 62, fast)
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
    passed = len(results) == 21 and sum(r['expected'] for r in results.values()) == 678 and all(r['passed'] for r in results.values())
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
