"""G2 removal proof: five units removed alone with all other G2 units retained; whole G2 removed to G1 exactly.
Also remove the previous unit A03.1 with G2 retained. Run every retained G2 harness, the declared 4.5.21
conditional fixture, and the A03 timing-sensitive harness on the A11-removed tree. Scratch trees only; no retry."""
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
A03_FOLDER = 'PART H — Phase 15 Implementation/Release 15a/A03.1 — Masteries in the Skill Information'
A03_SHA, A03_BYTES = '2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6', 17586964
A16_SHA, A16_BYTES = 'd8965a9f8c419d85e3587cc5ab5ec0798c75e0292036c0896c7d9a6f6aff3907', 17602520
UNITS = {
    'A05': ('A05 — Missing Limb Picker', 'PART H PHASE 15.1.5', r'LIMB_PICKER_ENABLED|LP15|lp15[\w-]*'),
    'A06': ('A06 — Grant Actions and Their State', 'PART H PHASE 15.1.6', r'GRANT_ACTIONS_ENABLED|GA15|ga15[\w-]*'),
    'A07': ('A07 — The Moon Row', 'PART H PHASE 15.1.7', r'MOON_ROW_ENABLED|MR15|mr15[\w-]*'),
    'A11': ('A11 — Explanatory Text Gaps and One Left Edge', 'PART H PHASE 15.1.11', r'TEXT_EDGES_ENABLED|TE15|te15[\w-]*'),
    'A04.1': ('A04.1 — One Way to Show Choices in Pickers', 'PART H PHASE 15.1.4.1', r'INLINE_RULES_ENABLED|IR15|ir15[\w-]*'),
}
H = {
    'A05': (R / 'A05 — Missing Limb Picker/qa/limb-picker-harness.js', 22),
    'A06': (R / 'A06 — Grant Actions and Their State/qa/grant-actions-harness.js', 20),
    'A07': (R / 'A07 — The Moon Row/qa/moon-row-harness.js', 26),
    'A11': (R / 'A11 — Explanatory Text Gaps and One Left Edge/qa/text-edges-harness.js', 22),
    'A04.1': (R / 'A04.1 — One Way to Show Choices in Pickers/qa/inline-rules-harness.js', 56),
    '4.5.21': (V / 'PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/fortune-blessing-harness.js', 77),
    'A03': (R / 'A03 — Top-Aligned Columns and Compact Skill Cards/qa/compact-skills-harness.js', 37),
}
RUNS = {'A05': ['A06', 'A07', 'A11', 'A04.1', '4.5.21'], 'A06': ['A05', 'A07', 'A11', 'A04.1', '4.5.21'], 'A07': ['A05', 'A06', 'A11', 'A04.1', '4.5.21'], 'A11': ['A05', 'A06', 'A07', 'A04.1', '4.5.21', 'A03'], 'A04.1': ['A05', 'A06', 'A07', 'A11', '4.5.21'], 'A03.1': ['A05', 'A06', 'A07', 'A11', 'A04.1', '4.5.21']}
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
with tempfile.TemporaryDirectory(prefix='l5r-g2-removal-') as folder:
    tree = copy_tree(folder)
    removed = chain.strip_later(tree, after=A03_FOLDER)
    b, data = rebuild(tree)
    check('GROUP-REMOVED (' + str(len(removed)) + ' units)', len(removed) == 5 and b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == A03_SHA and len(data) == A03_BYTES, (removed, b.stdout[-300:], len(data)))

with tempfile.TemporaryDirectory(prefix='l5r-g2-removal-') as keep:
    keep = Path(keep)
    for unit, (folder, marker, surface) in UNITS.items():
        with tempfile.TemporaryDirectory(prefix='l5r-g2-removal-') as work:
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
            if unit == 'A04.1':
                check('A04.1-ALONE-REBUILDS-A11-EXACTLY', hashlib.sha256(data).hexdigest() == A16_SHA and len(data) == A16_BYTES)
            (keep / (unit + '.html')).write_bytes(data)
    with tempfile.TemporaryDirectory(prefix='l5r-g2-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / 'A03.1 — Masteries in the Skill Information/qa/remove-phase.py'), str(tree)],
                           capture_output=True, text=True, encoding='utf-8')
        check('A03.1-ALONE-REMOVES-G2-KEPT', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('A03.1-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and 'SKILL_MASTERIES_ENABLED' not in text and
              all(re.search(re.escape(m) + r'(?![\d.]*\d)', text) for _, m, _ in UNITS.values()), b.stdout[-300:])
        (keep / 'A03.1.html').write_bytes(data)
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before)
    for label, names in RUNS.items():
        harnesses(label + '-REMOVED', keep / (label + '.html'), names)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
