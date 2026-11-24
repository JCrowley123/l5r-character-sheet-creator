"""Release 15b group 2 removal proof (B01, B03, B05, B09).
1. The whole group removed through the removal chain gives group 1 as live exactly (5ac767c6, 17,750,809 bytes).
2. Each of B01, B03 and B05 removed alone, the others kept: each rebuild verifies and the kept units' harnesses run in full on
   it (B09, the last, is covered by its own test-removal.py).
3. B17 (the unit before the group) removed with the group kept: the rebuild verifies and all four harnesses run in full.
4. The owner's decision 3 of 20 November 2026: all of Release 15a removed, newest first, with the group kept; the rebuild
   verifies and all four harnesses run in full on it.
The three older harnesses that follow B01's switch (Feature 4.5.31, Feature 4.5.33, Release 15a A07) run with B01 present
in the candidate pass and with it absent in the retained pass. Scratch trees only; no retry. Group 1's
test-removal-group.py with this group's constants (24 November 2026)."""
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
BEFORE_FOLDER = 'PART H — Phase 15 Implementation/Release 15b/B17 — One Row for Kharmic Tie'
BEFORE_SHA, BEFORE_BYTES = '5ac767c6c3680126cfe664aef41e7312d98f24eee842ec679e38ed664dde574d', 17750809
BEFORE_MARKER, BEFORE_SURFACE = 'PART H PHASE 15.2.5', r'KHARMIC_TIE_ROW_ENABLED|KT15|kt15[\w-]*'
UNITS = {'B01': ('B01 — Check Buttons Named for What They Do', 'PART H PHASE 15.2.6', r'CHECK_BUTTON_NAMES_ENABLED|CN15|cn15[\w-]*'),
         'B03': ('B03 — Lead an Ally', 'PART H PHASE 15.2.7', r'LEAD_AN_ALLY_ENABLED|LA15|la15[\w-]*'),
         'B05': ('B05 — You Remain in Control', 'PART H PHASE 15.2.8', r'REMAIN_IN_CONTROL_ENABLED|RC15|rc15[\w-]*'),
         'B09': ('B09 — Skill Picker Traits from the Final List', 'PART H PHASE 15.2.9', r'PICKER_TRAITS_FINAL_ENABLED|SKP15|skp15[\w-]*')}
H = {'B01': (R / 'B01 — Check Buttons Named for What They Do/qa/check-names-harness.js', 23),
     'B03': (R / 'B03 — Lead an Ally/qa/lead-an-ally-harness.js', 15),
     'B05': (R / 'B05 — You Remain in Control/qa/remain-in-control-harness.js', 10),
     'B09': (R / 'B09 — Skill Picker Traits from the Final List/qa/picker-traits-harness.js', 9)}
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
with tempfile.TemporaryDirectory(prefix='l5r-15b-g2-removal-') as folder:
    tree = copy_tree(folder)
    removed = chain.strip_later(tree, after=BEFORE_FOLDER)
    b, data = rebuild(tree)
    check('GROUP-REMOVED (' + str(len(removed)) + ' units)', sorted(Path(x).name for x in removed) == sorted(u[0] for u in UNITS.values()) and
          b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and hashlib.sha256(data).hexdigest() == BEFORE_SHA and len(data) == BEFORE_BYTES,
          (removed, b.stdout[-300:], len(data)))
    leftovers = [p.name for p in (tree / 'src').rglob('*') if p.is_file() and any(present(m, p.read_text(encoding='utf-8', errors='ignore'))
                 for _, m, _ in UNITS.values())]
    check('NO-GROUP-MARKER-LEFT', leftovers == [], leftovers)

with tempfile.TemporaryDirectory(prefix='l5r-15b-g2-removal-') as keep:
    keep = Path(keep)
    for unit in ('B01', 'B03', 'B05'):
        folder, marker, pattern = UNITS[unit]
        kept = [k for k in UNITS if k != unit]
        with tempfile.TemporaryDirectory(prefix='l5r-15b-g2-removal-') as work:
            tree = copy_tree(work)
            r = subprocess.run([sys.executable, '-B', str(R / folder / 'qa' / 'remove-phase.py'), str(tree)], capture_output=True, text=True, encoding='utf-8')
            check(unit + '-ALONE-REMOVES-OTHERS-KEPT', r.returncode == 0, r.stderr)
            b, data = rebuild(tree)
            text = data.decode('utf-8', 'replace')
            check(unit + '-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not present(marker, text) and
                  not surface(pattern, text) and all(present(UNITS[k][1], text) for k in kept), b.stdout[-300:])
            (keep / unit).mkdir()
            (keep / unit / 'index.html').write_bytes(data)
    with tempfile.TemporaryDirectory(prefix='l5r-15b-g2-removal-') as work:
        tree = copy_tree(work)
        r = subprocess.run([sys.executable, '-B', str(R / 'B17 — One Row for Kharmic Tie/qa/remove-phase.py'), str(tree)],
                           capture_output=True, text=True, encoding='utf-8')
        check('B17-ALONE-REMOVES-GROUP-KEPT', r.returncode == 0, r.stderr)
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('B17-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not present(BEFORE_MARKER, text) and
              not surface(BEFORE_SURFACE, text) and all(present(m, text) for _, m, _ in UNITS.values()), b.stdout[-300:])
        (keep / 'B17').mkdir()
        (keep / 'B17' / 'index.html').write_bytes(data)
    with tempfile.TemporaryDirectory(prefix='l5r-15b-g2-removal-') as work:
        tree = copy_tree(work)
        gone, refused = [], []
        for release in reversed(chain.CHAIN):
            if '/Release 15a/' not in release.folder or not chain.is_present(release, tree):
                continue
            r = subprocess.run([sys.executable, '-B', str(chain.release_dir(release.folder) / 'qa' / 'remove-phase.py'), str(tree)],
                               capture_output=True, text=True, encoding='utf-8')
            (gone if r.returncode == 0 else refused).append(release.folder.split('/')[-1] + ('' if r.returncode == 0 else ': ' + r.stderr[-300:]))
            if r.returncode != 0:
                break
        left = [r.folder for r in chain.CHAIN if '/Release 15a/' in r.folder and chain.is_present(r, tree)]
        check('RELEASE-15A-REMOVED-GROUP-KEPT (' + str(len(gone)) + ' units)', not refused and not left and len(gone) == 26, (refused, left))
        b, data = rebuild(tree)
        text = data.decode('utf-8', 'replace')
        check('RELEASE-15A-REMOVED-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
              all(present(m, text) for _, m, _ in UNITS.values()), b.stdout[-300:])
        (keep / '15a').mkdir()
        (keep / '15a' / 'index.html').write_bytes(data)
        print('Release 15a removed, group kept: sha256 ' + hashlib.sha256(data).hexdigest() + ' bytes ' + str(len(data)), flush=True)
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before)
    harnesses('B01-REMOVED', keep / 'B01' / 'index.html', ['B03', 'B05', 'B09'])
    harnesses('B03-REMOVED', keep / 'B03' / 'index.html', ['B01', 'B05', 'B09'])
    harnesses('B05-REMOVED', keep / 'B05' / 'index.html', ['B01', 'B03', 'B09'])
    harnesses('B17-REMOVED', keep / 'B17' / 'index.html', ['B01', 'B03', 'B05', 'B09'])
    harnesses('RELEASE-15A-REMOVED', keep / '15a' / 'index.html', ['B01', 'B03', 'B05', 'B09'])

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
