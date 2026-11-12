"""G4 removal proof: the whole of G4 removed to G3 exactly; each of the four units removed alone with the other three
kept; and 8b.1-UI-03 (the unit before G4) removed with G4 kept. On every kept build the kept G4 units' harnesses run in
full; on the A17-removed build the splash layer's harness runs too (its declared S-ART-BY-SHAPE conditional the other
way: contain). The splash layer's own remover must refuse while A17 is present. Scratch trees only; no retry.
G3's test-removal-group.py with G4 constants (12 November 2026); it replaces the light-check version of this file."""
from pathlib import Path
import hashlib, importlib.util, os, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
R = Q.parent.parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
F = V / 'Part F — Cross-Platform Delivery'
LIVE = F / 'PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PRELOADS = ['--require', str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
            '--require', str(F / 'PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
UI03_FOLDER = 'PART H — Phase 15 Implementation/Release 15a/8b.1-UI-03 — Remove Apart from Memorised'
G3_SHA, G3_BYTES = '6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029', 17631957
A101_SHA, A101_BYTES = '3e58e368606f7d8ffe66f674778f922b73c0798109334ad89e1efc2a15fa6258', 17645385
UNITS = {
    'A09': ('A09 — Phone Text Entry and Repeated Taps', 'PART H PHASE 15.1.24', r'PHONE_TEXT_ENTRY_ENABLED|TX15|tx15[\w-]*'),
    'A10': ('A10 — Cross-Page Actions Move Focus', 'PART H PHASE 15.1.25', r'CROSS_PAGE_FOCUS_ENABLED|CP15|cp15[\w-]*'),
    'A10.1': ('A10.1 — The Page Ring Only for the Keyboard', 'PART H PHASE 15.1.26', r'KEYBOARD_PAGE_RING_ENABLED|KR15|kr15[\w-]*'),
    'A17': ('A17 — The Splash Fills the Screen', 'PART H PHASE 15.1.27', r'SPLASH_FILL_ENABLED|SF15|sf15[\w-]*'),
}
H = {
    'A09': (R / 'A09 — Phone Text Entry and Repeated Taps/qa/phone-text-entry-harness.js', 20),
    'A10': (R / 'A10 — Cross-Page Actions Move Focus/qa/cross-page-focus-harness.js', 23),
    'A10.1': (R / 'A10.1 — The Page Ring Only for the Keyboard/qa/keyboard-page-ring-harness.js', 16),
    'A17': (R / 'A17 — The Splash Fills the Screen/qa/splash-fill-harness.js', 25),
    'SPLASH': (F / 'PART F — Phase 0.6.2 Splash Screen/qa/splash-harness.js', 19),
}
RUNS = {'A09': ['A10', 'A10.1', 'A17'], 'A10': ['A09', 'A10.1', 'A17'], 'A10.1': ['A09', 'A10', 'A17'],
        'A17': ['A09', 'A10', 'A10.1', 'SPLASH'], 'UI03': ['A09', 'A10', 'A10.1', 'A17']}
spec = importlib.util.spec_from_file_location('removal_chain', V / 'QA — Removal Chain Registry/removal_chain.py')
chain = importlib.util.module_from_spec(spec); sys.modules['removal_chain'] = chain; spec.loader.exec_module(chain)
results = []


def check(name, ok, detail=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else ' ' + str(detail)[:500]), flush=True)


def copy_tree(folder):
    tree = Path(folder) / 'phase0'
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
    return tree


def rebuild(tree):
    b = subprocess.run([sys.executable, str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
    data = (tree / 'l5r-character-sheet.html').read_bytes()
    return b, data


def harnesses(label, page, names):
    for name in names:
        harness, total = H[name]
        if name == 'SPLASH':
            # The splash layer's harness runs as the suite's service-worker leaf runs it: without the fast-splash
            # preload, from its own folder, with a site folder (it only reads the deployed body's first line there).
            site = page.parent / 'site'
            site.mkdir(exist_ok=True)
            shutil.copyfile(page, site / 'index.html')
            args, cwd = [str(harness), str(page), str(site)], str(harness.parent.parent)
        else:
            args, cwd = [*PRELOADS, str(harness), str(page)], str(harness.parent)
        r = subprocess.run([NODE, *args], cwd=cwd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=2400)
        out = r.stdout + r.stderr
        found = re.findall(r'(\d+)/(\d+) checks passed', out)
        check(f'{label}-RUNS-{name} ({total})', r.returncode == 0 and bool(found) and found[-1] == (str(total), str(total)),
              found[-1:] or out[-300:])


live_before = hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='l5r-g4-removal-') as folder:
    tree = copy_tree(folder)
    r = subprocess.run([sys.executable, '-B', str(F / 'PART F — Phase 0.6.2 Splash Screen/qa/remove-phase.py'), str(tree), '--dry-run'],
                       capture_output=True, text=True, encoding='utf-8')
    check('SPLASH-LAYER-REFUSES-WHILE-A17-PRESENT', r.returncode == 2 and 'REFUSED' in r.stderr, r.stdout[-200:] + r.stderr[-300:])
    removed = chain.strip_later(tree, after=UI03_FOLDER)
    b, data = rebuild(tree)
    check('GROUP-REMOVED (' + str(len(removed)) + ' units)', [Path(x).name for x in removed] == [UNITS[u][0] for u in reversed(list(UNITS))] and
          b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and hashlib.sha256(data).hexdigest() == G3_SHA and len(data) == G3_BYTES,
          (removed, b.stdout[-300:], len(data)))
    leftovers = [p.name for p in (tree / 'src').rglob('*') if p.is_file() and any(m in p.read_text(encoding='utf-8', errors='ignore')
                 for _, m, _ in UNITS.values())]
    check('NO-G4-MARKER-LEFT', leftovers == [], leftovers)

with tempfile.TemporaryDirectory(prefix='l5r-g4-removal-') as keep:
    keep = Path(keep)
    for unit, (folder, marker, surface) in UNITS.items():
        with tempfile.TemporaryDirectory(prefix='l5r-g4-removal-') as work:
            tree = copy_tree(work)
            r = subprocess.run([sys.executable, '-B', str(R / folder / 'qa' / 'remove-phase.py'), str(tree)], capture_output=True, text=True, encoding='utf-8')
            check(unit + '-ALONE-REMOVES-OTHERS-KEPT', r.returncode == 0, r.stderr)
            b, data = rebuild(tree)
            text = data.decode('utf-8', 'replace')
            others = [m for u, (_, m, _) in UNITS.items() if u != unit]
            own = re.search(re.escape(marker) + r'(?![\d.]*\d)', text)
            check(unit + '-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not own and
                  not re.search(r'(?<![\w+/])(?:' + surface + r')(?![\w+/])', text) and
                  all(re.search(re.escape(m) + r'(?![\d.]*\d)', text) for m in others), b.stdout[-300:])
            if unit == 'A17':
                check('A17-ALONE-REBUILDS-A10.1-EXACTLY', hashlib.sha256(data).hexdigest() == A101_SHA and len(data) == A101_BYTES)
            (keep / unit).mkdir()
            (keep / unit / 'index.html').write_bytes(data)
    with tempfile.TemporaryDirectory(prefix='l5r-g4-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / '8b.1-UI-03 — Remove Apart from Memorised/qa/remove-phase.py'), str(tree)],
                           capture_output=True, text=True, encoding='utf-8')
        check('UI03-ALONE-REMOVES-G4-KEPT', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('UI03-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and 'SPELL_REMOVE_CORNER_ENABLED' not in text and
              all(re.search(re.escape(m) + r'(?![\d.]*\d)', text) for _, m, _ in UNITS.values()), b.stdout[-300:])
        (keep / 'UI03').mkdir()
        (keep / 'UI03' / 'index.html').write_bytes(data)
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before)
    for label, names in RUNS.items():
        harnesses(label + '-REMOVED', keep / label / 'index.html', names)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
