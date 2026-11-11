"""Release 15a group G3 preview checks (8b.1-UI-01, -02, -03, on top of live G2), adapted from G2's verify-live.py.
    python -B verify-preview.py --url=<preview> --ref=<branch> [--files-only]
Compares the deployed page, service worker, manifest and icons byte for byte with the branch's committed build, then
runs, on the downloaded page, the harness of each G3 unit found in it (by its marker) and the retained harnesses of the
layers G3 touches. Light-check scope: this is not the group's qualification and not a production check. Feature
failures are never retried; only deployment propagation is polled. One browser job at a time."""
from pathlib import Path
import datetime, hashlib, json, re, shutil, subprocess, sys, tempfile, time, urllib.request

QA = Path(__file__).resolve().parent
V = next(d for d in QA.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
F = V / 'Part F — Cross-Platform Delivery'
SOURCE = F / 'PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html'
PWA = F / 'PART F — Phase 0.6 Installable Web App'
URL = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--url=')), None)
REF = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--ref=')), 'HEAD')
FILES_ONLY = '--files-only' in sys.argv
if not URL or not URL.endswith('.l5r-character-sheet-creator.pages.dev/') or URL == 'https://l5r-character-sheet-creator.pages.dev/':
    sys.exit('PREFLIGHT: pass --url=https://<branch-alias>.l5r-character-sheet-creator.pages.dev/ (a preview, never production)')
PREVIEW = re.sub(r'^https?://|\.l5r-character-sheet-creator\.pages\.dev/?$', '', URL).strip('/')
OUT = QA / 'hosted-preview' / PREVIEW
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
R15A = QA.parent.parent
UNITS = [('8b.1-UI-01', 'PART H PHASE 15.1.21', R15A / '8b.1-UI-01 — Starting-Spell Review and Its Actions/qa/spell-review-harness.js', 32),
         ('8b.1-UI-02', 'PART H PHASE 15.1.22', R15A / '8b.1-UI-02 — Readable Spell Name and School Tag/qa/spell-name-harness.js', 28),
         ('8b.1-UI-03', 'PART H PHASE 15.1.23', R15A / '8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js', 24)]
RETAINED = [(V / 'BUGFIX — Older School Choices/qa/older-review-harness.js', 20),
            (V / 'BUGFIX — Older School Choices/qa/legacy-grants-harness.js', 4),
            (V / 'BUGFIX — Older School Choices/qa/allocation-boundaries-harness.js', 5),
            (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/school-choices-harness.js', 30),
            (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/review-regression-harness.js', 6),
            (V / 'PART K — Phase 12.6 Play Mode Techniques/qa/techniques-harness.js', 16),
            (V / 'Part J — Data Integrity & Validation/PART J — Phase 8 Why Cant I Cast This/qa/casting-diagnostics-harness.js', 36),
            (R15A / 'A11 — Explanatory Text Gaps and One Left Edge/qa/text-edges-harness.js', 22)]


def count_of(out):
    found = re.findall(r'(\d+)/(\d+) checks passed', out)
    found += re.findall(r'"passed":\s*(\d+),\s*"total":\s*(\d+)', out)
    found += [(p, t) for t, p in re.findall(r'"total":\s*(\d+),\s*"passed":\s*(\d+)', out)]
    return found[-1] if found else None


def committed(path):
    return subprocess.check_output(['git', 'show', REF + ':' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def download(name):
    request = urllib.request.Request(URL + name + ('&' if '?' in name else '?') + 'g3=' + str(int(time.time())),
                                     headers={'Cache-Control': 'no-cache', 'User-Agent': 'release verification'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def main():
    head = committed(PWA / 'src/head-pwa.html').decode('utf-8').rstrip('\n') + '\n'
    expected = committed(SOURCE).decode('utf-8').replace('</head>', head + '</head>', 1).encode('utf-8')
    for attempt in range(21):           # only deployment propagation is polled; the bytes themselves are never retried
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
    results, lines = {}, ['Preview page matches the committed build byte for byte.', 'Service worker matches build ' + sw_id + '.']
    with tempfile.TemporaryDirectory(prefix='l5r-g3-preview-') as tmp:
        site = Path(tmp).resolve() / 'site'
        (site / 'icons').mkdir(parents=True)
        (site / 'index.html').write_bytes(actual)
        (site / 'sw.js').write_bytes(sw)
        for name in names:
            data = download(name)
            if data != committed(PWA / ('src' if name == 'manifest.webmanifest' else '') / name):
                raise RuntimeError('Deployed asset differs: ' + name)
            (site / name).write_bytes(data)
        sheet = site / 'index.html'
        fast = ['--require', str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
                '--require', str(F / 'PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
        text = actual.decode('utf-8', 'replace')
        present = [(u, h, n) for u, marker, h, n in UNITS if re.search(re.escape(marker) + r'(?![\d.]*\d)', text)]
        runs = [(h, n) for _, h, n in present] + RETAINED
        expect = (len(runs), sum(n for _, n in runs))
        for harness, total in ([] if FILES_ONLY else runs):
            print('Checking deployed files:', harness.name, flush=True)
            run = subprocess.run([NODE, *fast, str(harness), str(sheet)], cwd=str(harness.parent), capture_output=True, text=True,
                                 encoding='utf-8', errors='replace', timeout=1200)
            label = harness.parent.parent.name + '/' + harness.name
            lines.append('== ' + label + '\n' + run.stdout + run.stderr)
            counts = count_of(run.stdout)
            results[label] = {'counts': counts, 'expected': total, 'passed': run.returncode == 0 and counts == (str(total), str(total))}
    passed = (FILES_ONLY and not results) or (len(results) == expect[0] and all(r['passed'] for r in results.values()))
    report = {'commit': subprocess.check_output(['git', 'rev-parse', REF], cwd=V.parent, text=True).strip(), 'ref': REF, 'url': URL,
              'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'source_sha256': hashlib.sha256(committed(SOURCE)).hexdigest(), 'page_sha256': hashlib.sha256(actual).hexdigest(), 'page_bytes': len(actual),
              'service_worker_build': sw_id, 'g3_units': [u for u, _, _ in present], 'expected': {'harnesses': expect[0], 'checks': expect[1]},
              'harnesses': results, 'files_only': FILES_ONLY, 'passed': passed}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / ('files-only.json' if FILES_ONLY else 'preview-verification.json')).write_bytes((json.dumps(report, indent=2) + '\n').encode('utf-8'))
    (OUT / 'preview-qa.log').write_bytes(('\n'.join(lines).rstrip() + '\n').encode('utf-8'))
    for label, r in results.items():
        print(('PASS ' if r['passed'] else 'FAIL ') + label + ' ' + '/'.join(r['counts'] or ['?']))
    done = sum(int(r['counts'][0]) for r in results.values() if r['counts'])
    print('units in the page:', ', '.join(report['g3_units']) or 'none', '| page', report['page_sha256'][:12], report['page_bytes'], '| source', report['source_sha256'][:12])
    print('PREVIEW ' + ('MATCHES: all seven files (files only)' if FILES_ONLY and passed else f'PASSED: {done}/{expect[1]} on the deployed files' if passed else 'FAILED'))
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())
