"""G6 group removal proof (A19 revision 1, A20, A19.1): the whole group removed through the removal chain gives G5 (A08) as
live exactly; A19 removed alone, with A20 and A19.1 kept, and A20 removed alone, with A19 and A19.1 kept, each rebuild and
the kept units' harnesses run in full on them; A08 (the unit before the group) removed with the group kept, on which all
three of the group's harnesses run in full. No unit declares a conditional in another layer's tests, so there is nothing
to run the other way. Scratch trees only; no retry. G5's test-removal-group.py with this group's constants (19 November 2026)."""
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
A08_FOLDER = 'PART H — Phase 15 Implementation/Release 15a/A08 — One Undo for Quick Taps'
A08_SHA, A08_BYTES = '6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1', 17685928
UNITS = {'A19': ('A19 — Undo the Last Void Spend', 'PART H PHASE 15.1.33', r'VOID_SPEND_UNDO_ENABLED|VU15|vu15[\w-]*'),
         'A20': ('A20 — A Trait for One Skill Roll', 'PART H PHASE 15.1.34', r'SKILL_TRAIT_CHOICE_ENABLED|TC15|tc15[\w-]*'),
         'A19.1': ('A19.1 — The Damage Row Fits a Phone', 'PART H PHASE 15.1.35', r'DAMAGE_ROW_FIT_ENABLED|DR15|dr15[\w-]*')}
A08_MARKER, A08_SURFACE = 'PART H PHASE 15.1.31', r'QUICK_TAP_UNDO_ENABLED|QT15|qt15[\w-]*'
H = {'A19': (R / 'A19 — Undo the Last Void Spend/qa/void-spend-undo-harness.js', 25),
     'A20': (R / 'A20 — A Trait for One Skill Roll/qa/skill-trait-choice-harness.js', 18),
     'A19.1': (R / 'A19.1 — The Damage Row Fits a Phone/qa/damage-row-harness.js', 9)}
spec = importlib.util.spec_from_file_location('removal_chain', V / 'QA — Removal Chain Registry/removal_chain.py')
chain = importlib.util.module_from_spec(spec); sys.modules['removal_chain'] = chain; spec.loader.exec_module(chain)
results = []


def check(name, ok, detail=''):
    ok = bool(ok)
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
with tempfile.TemporaryDirectory(prefix='l5r-g6-removal-') as folder:
    tree = copy_tree(folder)
    removed = chain.strip_later(tree, after=A08_FOLDER)
    b, data = rebuild(tree)
    check('GROUP-REMOVED (' + str(len(removed)) + ' units)', sorted(Path(x).name for x in removed) == sorted(u[0] for u in UNITS.values()) and
          b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and hashlib.sha256(data).hexdigest() == A08_SHA and len(data) == A08_BYTES,
          (removed, b.stdout[-300:], len(data)))
    leftovers = [p.name for p in (tree / 'src').rglob('*') if p.is_file() and any(present(m, p.read_text(encoding='utf-8', errors='ignore'))
                 for _, m, _ in UNITS.values())]
    check('NO-GROUP-MARKER-LEFT', leftovers == [], leftovers)

with tempfile.TemporaryDirectory(prefix='l5r-g6-removal-') as keep:
    keep = Path(keep)
    for unit, kept in (('A19', ['A20', 'A19.1']), ('A20', ['A19', 'A19.1'])):
        folder, marker, pattern = UNITS[unit]
        with tempfile.TemporaryDirectory(prefix='l5r-g6-removal-') as work:
            tree = copy_tree(work)
            r = subprocess.run([sys.executable, '-B', str(R / folder / 'qa' / 'remove-phase.py'), str(tree)], capture_output=True, text=True, encoding='utf-8')
            check(unit + '-ALONE-REMOVES-OTHERS-KEPT', r.returncode == 0, r.stderr)
            b, data = rebuild(tree)
            text = data.decode('utf-8', 'replace')
            check(unit + '-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not present(marker, text) and
                  not surface(pattern, text) and all(present(UNITS[k][1], text) for k in kept), b.stdout[-300:])
            (keep / unit).mkdir()
            (keep / unit / 'index.html').write_bytes(data)
    with tempfile.TemporaryDirectory(prefix='l5r-g6-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / 'A08 — One Undo for Quick Taps/qa/remove-phase.py'), str(tree)],
                           capture_output=True, text=True, encoding='utf-8')
        check('A08-ALONE-REMOVES-GROUP-KEPT', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('A08-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not present(A08_MARKER, text) and
              not surface(A08_SURFACE, text) and all(present(m, text) for _, m, _ in UNITS.values()), b.stdout[-300:])
        (keep / 'A08').mkdir()
        (keep / 'A08' / 'index.html').write_bytes(data)
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before)
    harnesses('A19-REMOVED', keep / 'A19' / 'index.html', ['A20', 'A19.1'])
    harnesses('A20-REMOVED', keep / 'A20' / 'index.html', ['A19', 'A19.1'])
    harnesses('A08-REMOVED', keep / 'A08' / 'index.html', ['A19', 'A20', 'A19.1'])

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)

