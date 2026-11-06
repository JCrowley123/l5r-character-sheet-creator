"""Release 15a A03 deployment checks, adapted from A02's verify-live.py (A02's 21 harnesses plus A03's own and Phase 12.4's Skills harness, whose rows A03 lays out). --local verifies the committed package without
changing the live source; --url=<site> checks a hosted preview instead of production; --files-only compares the seven files and
runs no harness (used while a qualification run is reading the machine). Feature failures are never retried; only deployment
propagation is polled."""
from pathlib import Path
import datetime, hashlib, json, re, shutil, subprocess, sys, tempfile, time, urllib.request

QA = Path(__file__).resolve().parent
V = next(d for d in QA.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
F = V / 'Part F — Cross-Platform Delivery'
SOURCE = F / 'PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
PWA = F / 'PART F — Phase 0.6 Installable Web App'
URL = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--url=')), 'https://l5r-character-sheet-creator.pages.dev/')
FILES_ONLY = '--files-only' in sys.argv
LOCAL = '--local' in sys.argv
LOCAL_FILES = {}
OUT = QA / ('local' if LOCAL else 'live' if URL == 'https://l5r-character-sheet-creator.pages.dev/' else 'hosted-preview')
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'


def committed(path):
    # Deployment builds from Git blobs; older PWA files in this checkout carry CRLF.
    return subprocess.check_output(['git', 'show', 'HEAD:' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def download(name):
    if LOCAL: return LOCAL_FILES[name]
    request = urllib.request.Request(URL + name + ('&' if '?' in name else '?') + 'a03=' + str(int(time.time())),
                                     headers={'Cache-Control': 'no-cache', 'User-Agent': 'L5R release verification'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def main():
    head = committed(PWA / 'src/head-pwa.html').decode('utf-8').rstrip('\n') + '\n'
    expected = committed(SOURCE).decode('utf-8').replace('</head>', head + '</head>', 1).encode('utf-8')
    if LOCAL:
        LOCAL_FILES[''] = expected
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
    if LOCAL:
        LOCAL_FILES['sw.js'] = committed(PWA / 'src/sw.js').replace(b'__BUILD_ID__', sw_id.encode('ascii'))
        for name in names:
            LOCAL_FILES[name] = committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name)
        site = OUT / 'site'
        for name, data in LOCAL_FILES.items():
            target = site / (name or 'index.html')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
    sw = download('sw.js')
    if sw != committed(PWA / 'src/sw.js').replace(b'__BUILD_ID__', sw_id.encode('ascii')):
        print('DEPLOYED SERVICE WORKER DIFFERS from build', sw_id)
        return 3
    lines = ['Live page matches the expected PWA build byte for byte.', 'Service worker matches build ' + sw_id + '.']
    results = {}
    with tempfile.TemporaryDirectory(prefix='l5r-a03-live-') as tmp:
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
            (QA/'compact-skills-harness.js', [sheet], 35, fast),
            (V/'PART K — Phase 12.4 Play Mode Skills/qa/skills-harness.js', [sheet], 17, fast),
            (QA.parent.parent/'A02 — Floating Controls Above the Tabs/qa/floating-strip-harness.js', [sheet], 23, fast),
            (V/'Part H — Sheet UI-UX/PART H — Phase 1 UI-UX Foundations/qa/ui-foundations-harness.js', [sheet], 9, fast),
            (V/'Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/qa/quick-access-sidebar-harness.js', [sheet], 19, fast),
            (V/'PART K — Phase 11.3 App Bar/qa/appbar-harness.js', [sheet], 25, fast),
            (V/'BUGFIX — Carousel Settles on Its Destination/qa/carousel-destination-harness.js', [sheet], 9, fast),
            (QA.parent.parent/'A01 — One Reminder per School Choice/qa/review-reminder-harness.js', [sheet], 31, fast),
            (V/'PART K — Phase 11.2.6 Rank Advancement Spell Choices/qa/rank-spell-harness.js', [sheet], 36, fast),
            (V/'BUGFIX — Older School Choices/qa/legacy-grants-harness.js', [sheet], 4, fast),
            (V/'BUGFIX — Older School Choices/qa/older-review-harness.js', [sheet], 20, fast),
            (V/'BUGFIX — Older School Choices/qa/allocation-boundaries-harness.js', [sheet], 5, fast),
            (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/school-choices-harness.js', [sheet], 30, fast),
            (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/review-regression-harness.js', [sheet], 6, fast),
            (V / 'BUGFIX — Free Choice Note Clears/qa/free-choice-harness.js', [sheet], 9, fast),
            (V / 'BUGFIX — Starting Spells Are Scrolls/qa/scrolls-harness.js', [sheet], 5, fast),
            (V / 'BUGFIX — Wizard Skill Remove/qa/wizard-remove-harness.js', [sheet], 5, fast),
            (V / 'PART K — Phase 11.2 Creation Wizard/qa/wizard-harness.js', [sheet], 43, fast),
            (V / 'PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js', [sheet], 32, fast),
            (V / 'PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho/qa/wizard3-harness.js', [sheet], 52, fast),
            (V / 'PART K — Phase 11.2.3 Wizard Starting Spells/qa/wizard4-harness.js', [sheet], 25, fast),
            (V / 'PART K — Phase 11.2.4 Wizard Starting Spells for Every School/qa/wizard5-harness.js', [sheet], 71, fast),
            (V / 'BUGFIX — Apply School Skill Rows/qa/school-skill-rows-harness.js', [sheet], 37, fast),
        ]
        if FILES_ONLY: runs = []
        for harness, args, total, preload in runs:
            print("Checking deployed files:", harness.name, flush=True)
            run = subprocess.run([NODE, *preload, str(harness), *map(str, args)], cwd=str(V.parent),
                                 capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=1200)
            label = harness.parent.parent.name + '/' + harness.name
            lines.append('== ' + label + '\n' + run.stdout + run.stderr)
            counts = re.findall(r'(\d+)/(\d+) checks passed', run.stdout)
            results[label] = {'counts': counts[-1] if counts else None, 'expected': total,
                              'passed': run.returncode == 0 and counts[-1:] == [(str(total), str(total))]}
    passed = (FILES_ONLY and not results) or (len(results) == 23 and sum(r['expected'] for r in results.values()) == 548 and all(r['passed'] for r in results.values()))
    report = {'commit': subprocess.check_output(['git','rev-parse','HEAD'], cwd=V.parent, text=True).strip(), 'downloaded_asset_sha256': asset_hashes, 'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': 'local build preview' if LOCAL else URL,
              'source_sha256': hashlib.sha256(committed(SOURCE)).hexdigest(),
              'page_sha256': hashlib.sha256(actual).hexdigest(), 'page_bytes': len(actual),
              'service_worker_build': sw_id, 'service_worker_sha256': hashlib.sha256(sw).hexdigest(),
              'harnesses': results, 'passed': passed}
    OUT.mkdir(exist_ok=True)
    (OUT / ('files-only.json' if FILES_ONLY else 'live-verification.json')).write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    (OUT / 'live-qa.log').write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf-8'))
    print(json.dumps({k: v for k, v in report.items() if k not in ('harnesses', 'downloaded_asset_sha256')}, indent=2))
    for label, r in results.items():
        print(('PASS ' if r['passed'] else 'FAIL ') + label + ' ' + '/'.join(r['counts'] or ['?']))
    total = sum(r['expected'] for r in results.values())
    print('LIVE VERIFICATION ' + ('PASSED: all seven files match (files only, no harness run)' if FILES_ONLY and passed else f'PASSED: {total}/{total} on the deployed files' if passed else 'FAILED'))
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())
