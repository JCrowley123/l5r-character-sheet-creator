"""G3 removal proof: each of the three units removed alone with the other two kept; the whole of G3 removed to G2 exactly;
and A04.1 (the unit before G3) removed with G3 kept. On every kept build, the kept G3 units' harnesses run in full, and
on the UI-01-removed build the older-holdings review harness too. 8b.1-UI-02's declared conditional fixture runs both
ways (UI-03 kept, UI-03 removed). Scratch trees only; no retry. G2's test-removal-group.py with G3 constants."""
from pathlib import Path
import hashlib, importlib.util, os, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
R = Q.parent.parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
LIVE = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PRELOADS = ['--require', str(V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'),
            '--require', str(V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs')]
A041_FOLDER = 'PART H — Phase 15 Implementation/Release 15a/A04.1 — One Way to Show Choices in Pickers'
G2_SHA, G2_BYTES = '7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0', 17609230
UI02_SHA, UI02_BYTES = '4f121ab46b9654219b589dfdde71cf8989f00ff1a92ea5f152151e53539569ca', 17626337
UNITS = {
    'UI01': ('8b.1-UI-01 — Starting-Spell Review and Its Actions', 'PART H PHASE 15.1.21', r'SPELL_REVIEW_LAYOUT_ENABLED|SR15|sr15[\w-]*'),
    'UI02': ('8b.1-UI-02 — Readable Spell Name and School Tag', 'PART H PHASE 15.1.22', r'SPELL_NAME_LINE_ENABLED|SN15|sn15[\w-]*'),
    'UI03': ('8b.1-UI-03 — Remove Apart from Memorised', 'PART H PHASE 15.1.23', r'SPELL_REMOVE_CORNER_ENABLED|SX15|sx15[\w-]*'),
}
H = {
    'UI01': (R / '8b.1-UI-01 — Starting-Spell Review and Its Actions/qa/spell-review-harness.js', 32),
    'UI02': (R / '8b.1-UI-02 — Readable Spell Name and School Tag/qa/spell-name-harness.js', 28),
    'UI03': (R / '8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js', 34),
    'OLDER': (V / 'BUGFIX — Older School Choices/qa/older-review-harness.js', 20),
}
RUNS = {'UI01': ['UI02', 'UI03', 'OLDER'], 'UI02': ['UI01', 'UI03'], 'UI03': ['UI01', 'UI02'], 'A04.1': ['UI01', 'UI02', 'UI03']}
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
        r = subprocess.run([NODE, *PRELOADS, str(harness), str(page)], cwd=str(harness.parent), capture_output=True,
                           text=True, encoding='utf-8', errors='replace', timeout=2400)
        out = r.stdout + r.stderr
        found = re.findall(r'(\d+)/(\d+) checks passed', out) or re.findall(r'"passed":\s*(\d+),\s*"total":\s*(\d+)', out)
        check(f'{label}-RUNS-{name} ({total})', r.returncode == 0 and bool(found) and found[-1] == (str(total), str(total)),
              found[-1:] or out[-300:])


live_before = hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='l5r-g3-removal-') as folder:
    tree = copy_tree(folder)
    removed = chain.strip_later(tree, after=A041_FOLDER)
    b, data = rebuild(tree)
    check('GROUP-REMOVED (' + str(len(removed)) + ' units)', len(removed) == 3 and b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == G2_SHA and len(data) == G2_BYTES, (removed, b.stdout[-300:], len(data)))

with tempfile.TemporaryDirectory(prefix='l5r-g3-removal-') as keep:
    keep = Path(keep)
    for unit, (folder, marker, surface) in UNITS.items():
        with tempfile.TemporaryDirectory(prefix='l5r-g3-removal-') as work:
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
            if unit == 'UI03':
                check('UI03-ALONE-REBUILDS-UI02-EXACTLY', hashlib.sha256(data).hexdigest() == UI02_SHA and len(data) == UI02_BYTES)
            (keep / (unit + '.html')).write_bytes(data)
    with tempfile.TemporaryDirectory(prefix='l5r-g3-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / 'A04.1 — One Way to Show Choices in Pickers/qa/remove-phase.py'), str(tree)],
                           capture_output=True, text=True, encoding='utf-8')
        check('A04.1-ALONE-REMOVES-G3-KEPT', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('A04.1-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and 'INLINE_RULES_ENABLED' not in text and
              all(re.search(re.escape(m) + r'(?![\d.]*\d)', text) for _, m, _ in UNITS.values()), b.stdout[-300:])
        (keep / 'A04.1.html').write_bytes(data)
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before)
    for label, names in RUNS.items():
        harnesses(label + '-REMOVED', keep / (label + '.html'), names)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
