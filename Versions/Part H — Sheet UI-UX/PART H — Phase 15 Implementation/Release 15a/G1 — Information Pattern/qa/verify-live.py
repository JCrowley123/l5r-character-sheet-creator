"""Release 15a group G1 deployment checks (A04, A15, A16, A03.1), adapted from A03's verify-live.py. A03's 23 harnesses always
run; each G1 unit present in the deployed page (found by its marker) adds its own harness and those of the layers it touches,
each counted once, so one script checks every stacked branch's preview and, later, production. --local verifies the committed package without
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
PREVIEW = re.sub(r'^https?://|\.l5r-character-sheet-creator\.pages\.dev/?$', '', URL).strip('/')
OUT = QA / ('local' if LOCAL else 'live' if URL == 'https://l5r-character-sheet-creator.pages.dev/' else 'hosted-preview/' + PREVIEW)
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
R15A = QA.parent.parent                                   # Release 15a/
A03 = R15A / 'A03 — Top-Aligned Columns and Compact Skill Cards' / 'qa'
# Each G1 unit: its marker, and its own harness plus the harnesses of the layers it touches, with their pinned counts.
UNITS = [('A04', 'PART H PHASE 15.1.4'), ('A15', 'PART H PHASE 15.1.15'), ('A16', 'PART H PHASE 15.1.16'), ('A03.1', 'PART H PHASE 15.1.3.1')]
TOUCHED = {
    'A04': [(R15A / 'A04 — One Information Pattern/qa/info-pattern-harness.js', 33),
            (V / 'PART I — Phase 4.5.4 Configuration UX Pass/qa/adv-config-ux-harness.js', 28),
            (V / 'PART I — Phase 4.5.14 Darling of the Court and Servant/qa/court-servant-harness.js', 225),
            (V / 'PART I — Phase 4.5.36 Weakness and the Curse of Hotei/qa/weakness-hotei-harness.js', 45),
            (V / 'BUGFIX — Hotei Where the Sheet Spends Void/qa/hotei-auto-harness.js', 16),
            (V / 'PART I — Phase 4.5.11 Seven Fortunes Curse/qa/disadv-fortune-harness.js', 74)],
    'A15': [(R15A / 'A15 — Court Badges/qa/court-badges-harness.js', 33),
            (V / 'PART I — Phase 4.5.14 Darling of the Court and Servant/qa/court-servant-harness.js', 225),
            (V / 'PART K — Phase 12.5 Play Mode Advantages and Disadvantages/qa/advantages-harness.js', 212),
            (V / 'PART K — Phase 12 Play and Management Modes/qa/modes-harness.js', 25),
            (V / 'Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/qa/clan-theming-harness.js', 17)],
    'A16': [(R15A / 'A16 — No Bottom i in the Seven Pickers/qa/picker-info-harness.js', 50),
            (V / 'PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/fortune-blessing-harness.js', 77),
            (V / 'PART I — Phase 4.5.23 Dark Paragon/qa/dark-paragon-harness.js', 67),
            (V / 'PART I — Phase 4.5.18 Paragon/qa/paragon-harness.js', 80),
            (V / 'PART I — Phase 4.5.19 Soul of Artistry/qa/soul-artistry-harness.js', 92),
            (V / 'PART I — Phase 4.5.24 Touch of the Spirit Realms/qa/spirit-realms-harness.js', 50),
            (V / 'PART I — Phase 4.5.20 Void Versatility/qa/void-versatility-harness.js', 66)],
    'A03.1': [(R15A / 'A03.1 — Masteries in the Skill Information/qa/skill-masteries-harness.js', 19),
              (V / 'BUGFIX — Skill Traits/qa/skill-traits-harness.js', 38)],
}
# The older harnesses print their totals in three shapes: "N/M checks passed", {"passed":N,"total":M} and
# {"total":M,"passed":N} (Phase 4.54's), or "FEATURE 4.5.11 — N/M checks passed".
def count_of(out):
    found = re.findall(r'(\d+)/(\d+) checks passed', out)
    found += re.findall(r'"passed":\s*(\d+),\s*"total":\s*(\d+)', out)
    found += [(p, t) for t, p in re.findall(r'"total":\s*(\d+),\s*"passed":\s*(\d+)', out)]
    return found[-1] if found else None


def committed(path):
    # Deployment builds from Git blobs; older PWA files in this checkout carry CRLF.
    return subprocess.check_output(['git', 'show', 'HEAD:' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def download(name):
    if LOCAL: return LOCAL_FILES[name]
    request = urllib.request.Request(URL + name + ('&' if '?' in name else '?') + 'g1=' + str(int(time.time())),
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
    with tempfile.TemporaryDirectory(prefix='l5r-g1-live-') as tmp:
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
            (A03/'compact-skills-harness.js', [sheet], 37, fast),
            (V/'PART K — Phase 12.4 Play Mode Skills/qa/skills-harness.js', [sheet], 17, fast),
            (R15A/'A02 — Floating Controls Above the Tabs/qa/floating-strip-harness.js', [sheet], 23, fast),
            (V/'Part H — Sheet UI-UX/PART H — Phase 1 UI-UX Foundations/qa/ui-foundations-harness.js', [sheet], 9, fast),
            (V/'Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/qa/quick-access-sidebar-harness.js', [sheet], 19, fast),
            (V/'PART K — Phase 11.3 App Bar/qa/appbar-harness.js', [sheet], 25, fast),
            (V/'BUGFIX — Carousel Settles on Its Destination/qa/carousel-destination-harness.js', [sheet], 9, fast),
            (R15A/'A01 — One Reminder per School Choice/qa/review-reminder-harness.js', [sheet], 31, fast),
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
        text = actual.decode('utf-8', 'replace')
        present = [u for u, marker in UNITS if re.search(re.escape(marker) + r'(?![\d.]*\d)', text)]
        seen = {str(h) for h, *_ in runs}
        for unit in present:
            for harness, total in TOUCHED[unit]:
                if str(harness) not in seen:
                    seen.add(str(harness))
                    runs.append((harness, [sheet], total, fast))
        lines.append('G1 units in the deployed page: ' + (', '.join(present) or 'none'))
        EXPECT = (len(runs), sum(t for _, _, t, _ in runs))
        if FILES_ONLY: runs = []
        for harness, args, total, preload in runs:
            print("Checking deployed files:", harness.name, flush=True)
            run = subprocess.run([NODE, *preload, str(harness), *map(str, args)], cwd=str(V.parent),
                                 capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=1200)
            label = harness.parent.parent.name + '/' + harness.name
            lines.append('== ' + label + '\n' + run.stdout + run.stderr)
            counts = count_of(run.stdout)
            results[label] = {'counts': counts, 'expected': total,
                              'passed': run.returncode == 0 and counts == (str(total), str(total))}
    passed = (FILES_ONLY and not results) or (len(results) == EXPECT[0] and sum(r['expected'] for r in results.values()) == EXPECT[1] and all(r['passed'] for r in results.values()))
    report = {'commit': subprocess.check_output(['git','rev-parse','HEAD'], cwd=V.parent, text=True).strip(), 'downloaded_asset_sha256': asset_hashes, 'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': 'local build preview' if LOCAL else URL,
              'source_sha256': hashlib.sha256(committed(SOURCE)).hexdigest(),
              'page_sha256': hashlib.sha256(actual).hexdigest(), 'page_bytes': len(actual),
              'service_worker_build': sw_id, 'service_worker_sha256': hashlib.sha256(sw).hexdigest(),
              'g1_units': present, 'expected': {'harnesses': EXPECT[0], 'checks': EXPECT[1]}, 'harnesses': results, 'passed': passed}
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
