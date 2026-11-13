"""Automatic-entries group removal proof: the whole group removed to G4 as live exactly; each of the three units removed
alone with the other two kept; and A17 (the unit before the group) removed with the group kept. On every kept build the
kept units' harnesses run in full, and each declared conditional runs the other way: Phase 11.2.4's wizard5-harness.js
with AE1 removed (the old lines), the six harnesses that pause AE2 with AE2 removed (the pause then does nothing), and
8b.1-UI-03's harness with AE3 removed (no ax15-on to take away). Scratch trees only; no retry.
G4's test-removal-group.py with this group's constants (13 November 2026). G4's splash-layer refusal is G4's own and
has no counterpart here: no layer's block holds a unit of this group."""
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
A17_FOLDER = 'PART H — Phase 15 Implementation/Release 15a/A17 — The Splash Fills the Screen'
G4_SHA, G4_BYTES = 'fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb', 17648272
AE2_SHA, AE2_BYTES = '8eb7aecc7021d260fe24a2dd9897455cc0d85ff3292c040d52923cd0bccbb2ef', 17664331
UNITS = {
    'AE1': ('AE1 — Sense for the Yogo Wardmaster', 'PART H PHASE 15.1.28', r'YOGO_GIVEN_SPELLS_ENABLED|YG15|yg15[\w-]*'),
    'AE2': ('AE2 — Given Spells Credited on Opening', 'PART H PHASE 15.1.29',
            r'GIVEN_SPELLS_ON_OPENING_ENABLED|GS15|gs15[\w-]*|givenSpellsNote|givenSpellsSettled|given-spells-credited'),
    'AE3': ('AE3 — No XP Box or Remove on Automatic Entries', 'PART H PHASE 15.1.30', r'AUTOMATIC_ENTRY_CONTROLS_ENABLED|AX15|ax15[\w-]*'),
}
H = {
    'AE1': (R / 'AE1 — Sense for the Yogo Wardmaster/qa/yogo-given-spells-harness.js', 13),
    'AE2': (R / 'AE2 — Given Spells Credited on Opening/qa/given-spells-harness.js', 21),
    'AE3': (R / 'AE3 — No XP Box or Remove on Automatic Entries/qa/automatic-entry-controls-harness.js', 20),
    'WIZARD5': (V / 'PART K — Phase 11.2.4 Wizard Starting Spells for Every School/qa/wizard5-harness.js', 71),
    'UI01': (R / '8b.1-UI-01 — Starting-Spell Review and Its Actions/qa/spell-review-harness.js', 32),
    'UI02': (R / '8b.1-UI-02 — Readable Spell Name and School Tag/qa/spell-name-harness.js', 28),
    'UI03': (R / '8b.1-UI-03 — Remove Apart from Memorised/qa/spell-remove-harness.js', 34),
    'OLDER': (V / 'BUGFIX — Older School Choices/qa/older-review-harness.js', 20),
    'REGRESSION': (V / 'PART K — Phase 11.2.5 School Choices from the Character Check/qa/review-regression-harness.js', 6),
    'CFS': (V / 'BUGFIX — Clan and School Pickers Follow the Character/qa/cfs-sync-harness.js', 72),
}
RUNS = {'AE1': ['AE2', 'AE3', 'WIZARD5'],
        'AE2': ['AE1', 'AE3', 'UI01', 'UI02', 'UI03', 'OLDER', 'REGRESSION', 'CFS'],
        'AE3': ['AE1', 'AE2', 'UI03'],
        'A17': ['AE1', 'AE2', 'AE3']}
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


def present(marker, text):
    return re.search(re.escape(marker) + r'(?![\d.]*\d)', text)


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
with tempfile.TemporaryDirectory(prefix='l5r-ae-removal-') as folder:
    tree = copy_tree(folder)
    removed = chain.strip_later(tree, after=A17_FOLDER)
    b, data = rebuild(tree)
    check('GROUP-REMOVED (' + str(len(removed)) + ' units)', [Path(x).name for x in removed] == [UNITS[u][0] for u in reversed(list(UNITS))] and
          b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and hashlib.sha256(data).hexdigest() == G4_SHA and len(data) == G4_BYTES,
          (removed, b.stdout[-300:], len(data)))
    leftovers = [p.name for p in (tree / 'src').rglob('*') if p.is_file() and any(present(m, p.read_text(encoding='utf-8', errors='ignore'))
                 for _, m, _ in UNITS.values())]
    check('NO-GROUP-MARKER-LEFT', leftovers == [], leftovers)

with tempfile.TemporaryDirectory(prefix='l5r-ae-removal-') as keep:
    keep = Path(keep)
    for unit, (folder, marker, surface) in UNITS.items():
        with tempfile.TemporaryDirectory(prefix='l5r-ae-removal-') as work:
            tree = copy_tree(work)
            r = subprocess.run([sys.executable, '-B', str(R / folder / 'qa' / 'remove-phase.py'), str(tree)], capture_output=True, text=True, encoding='utf-8')
            check(unit + '-ALONE-REMOVES-OTHERS-KEPT', r.returncode == 0, r.stderr)
            b, data = rebuild(tree)
            text = data.decode('utf-8', 'replace')
            others = [m for u, (_, m, _) in UNITS.items() if u != unit]
            check(unit + '-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not present(marker, text) and
                  not re.search(r'(?<![\w+/])(?:' + surface + r')(?![\w+/])', text) and
                  all(present(m, text) for m in others), b.stdout[-300:])
            if unit == 'AE3':
                check('AE3-ALONE-REBUILDS-AE2-EXACTLY', hashlib.sha256(data).hexdigest() == AE2_SHA and len(data) == AE2_BYTES)
            (keep / unit).mkdir()
            (keep / unit / 'index.html').write_bytes(data)
    with tempfile.TemporaryDirectory(prefix='l5r-ae-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / 'A17 — The Splash Fills the Screen/qa/remove-phase.py'), str(tree)],
                           capture_output=True, text=True, encoding='utf-8')
        check('A17-ALONE-REMOVES-GROUP-KEPT', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('A17-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and 'SPLASH_FILL_ENABLED' not in text and
              all(present(m, text) for _, m, _ in UNITS.values()), b.stdout[-300:])
        (keep / 'A17').mkdir()
        (keep / 'A17' / 'index.html').write_bytes(data)
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before)
    for label, names in RUNS.items():
        harnesses(label + '-REMOVED', keep / label / 'index.html', names)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
