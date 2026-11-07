"""Removal proof for Release 15a group G1 (A04, A15, A16, A03.1), on scratch copies of the live Phase 0 tree.
1. The whole group: the removal chain strips every release after A03; the rebuild is exactly A03 as live (e73b7c0c...).
2. Each unit alone, the others kept: that unit's own remover only; the rebuild verifies, has none of the unit's marker
   or surface, and keeps every other G1 unit's marker. With nothing after it, A03.1 alone rebuilds A16 exactly.
3. A03 alone, all of G1 kept: A03's remover; the rebuild verifies and keeps all four G1 markers.
4. Each kept build then runs the harnesses of the units it kept and of the layers they touch (each pinned count, all in
   full). No harness is retried.
python -B test-removal-group.py"""
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
A03_FOLDER = 'PART H — Phase 15 Implementation/Release 15a/A03 — Top-Aligned Columns and Compact Skill Cards'
A03_SHA, A03_BYTES = 'e73b7c0cac70c95d2965d993c9a3b9f0b66eb6f3ef4b81d6667166667090de06', 17553370
A16_SHA, A16_BYTES = 'f64b6e375665d9e7175a98d70829b8c9afb09646261ddc3574eaae1ff01258ef', 17580502
UNITS = {  # unit: (folder, marker, surface rule from its remover)
    'A04': ('A04 — One Information Pattern', 'PART H PHASE 15.1.4', r'ONE_INFO_PATTERN_ENABLED|IP15|ip15[\w-]*'),
    'A15': ('A15 — Court Badges', 'PART H PHASE 15.1.15', r'COURT_BADGES_ENABLED|CB15|cb15[\w-]*'),
    'A16': ('A16 — No Bottom i in the Seven Pickers', 'PART H PHASE 15.1.16', r'PICKER_BOTTOM_INFO_REMOVED_ENABLED|BI15|bi15[\w-]*'),
    'A03.1': ('A03.1 — Masteries in the Skill Information', 'PART H PHASE 15.1.3.1', r'SKILL_MASTERIES_ENABLED|SM15|sm15[\w-]*'),
}
H = {'A04': (R / 'A04 — One Information Pattern/qa/info-pattern-harness.js', 35),
     'A15': (R / 'A15 — Court Badges/qa/court-badges-harness.js', 33),
     'A16': (R / 'A16 — No Bottom i in the Seven Pickers/qa/picker-info-harness.js', 50),
     'A03.1': (R / 'A03.1 — Masteries in the Skill Information/qa/skill-masteries-harness.js', 19),
     'A03': (R / 'A03 — Top-Aligned Columns and Compact Skill Cards/qa/compact-skills-harness.js', 37),
     '4.5.14': (V / 'PART I — Phase 4.5.14 Darling of the Court and Servant/qa/court-servant-harness.js', 225),
     '12.5': (V / 'PART K — Phase 12.5 Play Mode Advantages and Disadvantages/qa/advantages-harness.js', 212)}
# What each kept build runs: the kept units' own harnesses, plus the two older harnesses made conditional on A15/A16.
RUNS = {'A04': ['A15', 'A16', 'A03.1', '4.5.14', 'A03'], 'A15': ['A04', 'A16', 'A03.1', '4.5.14', '12.5'],
        'A16': ['A04', 'A15', 'A03.1', '4.5.14'], 'A03.1': ['A04', 'A15', 'A16'], 'A03': ['A04', 'A15', 'A16', 'A03.1']}
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


def remover(folder):
    return R / folder / 'qa' / 'remove-phase.py'


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
with tempfile.TemporaryDirectory(prefix='l5r-g1-removal-') as folder:
    tree = copy_tree(folder)
    removed = chain.strip_later(tree, after=A03_FOLDER)
    b, data = rebuild(tree)
    check('GROUP-REMOVED (' + str(len(removed)) + ' units)', len(removed) == 4 and b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == A03_SHA and len(data) == A03_BYTES, (removed, b.stdout[-300:], len(data)))

with tempfile.TemporaryDirectory(prefix='l5r-g1-removal-') as keep:
    keep = Path(keep)
    for unit, (folder, marker, surface) in UNITS.items():
        with tempfile.TemporaryDirectory(prefix='l5r-g1-removal-') as work:
            tree = copy_tree(work)
            r = subprocess.run([sys.executable, '-B', str(remover(folder)), str(tree)], capture_output=True, text=True, encoding='utf-8')
            check(unit + '-ALONE-REMOVES-OTHERS-KEPT', r.returncode == 0, r.stderr)
            b, data = rebuild(tree)
            text = data.decode('utf-8', 'replace')
            others = [m for u, (_, m, _) in UNITS.items() if u != unit]
            own = re.search(re.escape(marker) + r'(?![\d.]*\d)', text)
            check(unit + '-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not own and
                  not re.search(r'(?<![\w+/])(?:' + surface + r')(?![\w+/])', text) and
                  all(re.search(re.escape(m) + r'(?![\d.]*\d)', text) for m in others), b.stdout[-300:])
            if unit == 'A03.1':
                check('A03.1-ALONE-REBUILDS-A16-EXACTLY', hashlib.sha256(data).hexdigest() == A16_SHA and len(data) == A16_BYTES)
            (keep / (unit + '.html')).write_bytes(data)
    with tempfile.TemporaryDirectory(prefix='l5r-g1-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / 'A03 — Top-Aligned Columns and Compact Skill Cards/qa/remove-phase.py'), str(tree)],
                           capture_output=True, text=True, encoding='utf-8')
        check('A03-ALONE-REMOVES-G1-KEPT', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('A03-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and 'COMPACT_SKILL_CARDS_ENABLED' not in text and
              all(re.search(re.escape(m) + r'(?![\d.]*\d)', text) for _, m, _ in UNITS.values()), b.stdout[-300:])
        (keep / 'A03.html').write_bytes(data)
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before)
    for label, names in RUNS.items():
        harnesses(label + '-REMOVED', keep / (label + '.html'), names)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
