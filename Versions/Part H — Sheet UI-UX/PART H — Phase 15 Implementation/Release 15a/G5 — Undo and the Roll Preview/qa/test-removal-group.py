"""G5 group removal proof (A08 alone; A12 withdrawn on 18 November 2026): the whole group removed through the removal chain
gives the automatic-entries group as live exactly; A08 removed by its own remover gives the same bytes; and AE3 (the unit
before the group) removed with A08 kept, on which A08's harness runs in full. A08 declares no conditional in another
layer's tests, so there is nothing to run the other way. Scratch trees only; no retry.
The automatic-entries group's test-removal-group.py with this group's constants (18 November 2026)."""
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
AE3_FOLDER = 'PART H — Phase 15 Implementation/Release 15a/AE3 — No XP Box or Remove on Automatic Entries'
AE_SHA, AE_BYTES = '99b76d625c04e6aa22ba8508005975525bbece945b82ead8c443b593e58115b8', 17675311
UNITS = {'A08': ('A08 — One Undo for Quick Taps', 'PART H PHASE 15.1.31', r'QUICK_TAP_UNDO_ENABLED|QT15|qt15[\w-]*')}
AE3_MARKER, AE3_SURFACE = 'PART H PHASE 15.1.30', r'AUTOMATIC_ENTRY_CONTROLS_ENABLED|AX15|ax15[\w-]*'
H = {'A08': (R / 'A08 — One Undo for Quick Taps/qa/quick-tap-undo-harness.js', 21)}
spec = importlib.util.spec_from_file_location('removal_chain', V / 'QA — Removal Chain Registry/removal_chain.py')
chain = importlib.util.module_from_spec(spec); sys.modules['removal_chain'] = chain; spec.loader.exec_module(chain)
results = []


def check(name, ok, detail=''):
    ok = bool(ok)  # a regex match counts as True (first light run: the total could not sum a Match)
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


def present(marker, text):
    return re.search(re.escape(marker) + r'(?![\d.]*\d)', text)


def surface(pattern, text):
    return re.search(r'(?<![\w+/])(?:' + pattern + r')(?![\w+/])', text)


def harnesses(label, page, names):
    for name in names:
        harness, total = H[name]
        r = subprocess.run([NODE, *PRELOADS, str(harness), str(page)], cwd=str(harness.parent), capture_output=True, text=True,
                           encoding='utf-8', errors='replace', timeout=2400)
        out = r.stdout + r.stderr
        found = re.findall(r'(\d+)/(\d+) checks passed', out)
        check(f'{label}-RUNS-{name} ({total})', r.returncode == 0 and bool(found) and found[-1] == (str(total), str(total)),
              found[-1:] or out[-300:])


live_before = hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='l5r-g5-removal-') as folder:
    tree = copy_tree(folder)
    removed = chain.strip_later(tree, after=AE3_FOLDER)
    b, data = rebuild(tree)
    check('GROUP-REMOVED (' + str(len(removed)) + ' unit)', [Path(x).name for x in removed] == [UNITS['A08'][0]] and
          b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and hashlib.sha256(data).hexdigest() == AE_SHA and len(data) == AE_BYTES,
          (removed, b.stdout[-300:], len(data)))
    leftovers = [p.name for p in (tree / 'src').rglob('*') if p.is_file() and any(present(m, p.read_text(encoding='utf-8', errors='ignore'))
                 for _, m, _ in UNITS.values())]
    check('NO-GROUP-MARKER-LEFT', leftovers == [], leftovers)

with tempfile.TemporaryDirectory(prefix='l5r-g5-removal-') as keep:
    keep = Path(keep)
    folder, marker, pattern = UNITS['A08']
    with tempfile.TemporaryDirectory(prefix='l5r-g5-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / folder / 'qa' / 'remove-phase.py'), str(tree)], capture_output=True, text=True, encoding='utf-8')
        check('A08-ALONE-REMOVES', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('A08-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not present(marker, text) and
              not surface(pattern, text) and present(AE3_MARKER, text), b.stdout[-300:])
        check('A08-ALONE-REBUILDS-AE-EXACTLY', hashlib.sha256(data).hexdigest() == AE_SHA and len(data) == AE_BYTES, len(data))
    with tempfile.TemporaryDirectory(prefix='l5r-g5-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / 'AE3 — No XP Box or Remove on Automatic Entries/qa/remove-phase.py'), str(tree)],
                           capture_output=True, text=True, encoding='utf-8')
        check('AE3-ALONE-REMOVES-GROUP-KEPT', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('AE3-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not present(AE3_MARKER, text) and
              not surface(AE3_SURFACE, text) and present(marker, text), b.stdout[-300:])
        (keep / 'AE3').mkdir()
        (keep / 'AE3' / 'index.html').write_bytes(data)
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before)
    harnesses('AE3-REMOVED', keep / 'AE3' / 'index.html', ['A08'])

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
