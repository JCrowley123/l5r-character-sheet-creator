"""Removal proof for this release, run against scratch copies of the live Phase 0 tree.
1. Later releases come off first through the removal-chain registry; this release's remover must then
   rebuild the exact predecessor (hash and bytes), and the rebuild must verify.
2. The remover refuses the live tree, a foreign marker inside an owned block, and a missing block.
Adapted from BUGFIX — Gift of the Lady per School and Imperial Histories Volumes (constants only)."""
from pathlib import Path
import hashlib, importlib.util, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
THIS_RELEASE = 'BUGFIX — Clan and School Pickers Follow the Character'
PREDECESSOR_SHA = 'a9a1119903b38610795ba32c5a01603b5f8e2113a1f825532fcd8d2087a1ed85'
PREDECESSOR_BYTES = 6718713
SEAM = 'src/sheet/210-test-seam-and-init.js'
BEGIN = '// BUGFIX CFSSYNC BEGIN cfssync-seam'
Q = Path(__file__).resolve().parent


def versions():
    for d in Q.parents:
        if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file():
            return d
    raise SystemExit('cannot find Versions/')


V = versions()
LIVE = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
spec = importlib.util.spec_from_file_location('removal_chain', V / 'QA — Removal Chain Registry/removal_chain.py')
chain = importlib.util.module_from_spec(spec)
sys.modules['removal_chain'] = chain
spec.loader.exec_module(chain)
results = []


def check(name, ok, detail=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else ' ' + str(detail)[:400]), flush=True)


def copy_tree(folder):
    tree = Path(folder) / 'phase0'
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
    return tree


def remover(tree, *extra):
    return subprocess.run([sys.executable, '-B', str(Q / 'remove-phase.py'), str(tree), *extra], capture_output=True, text=True,
                          encoding='utf-8')


with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    later = chain.strip_later(tree, after=THIS_RELEASE)
    r = remover(tree, '--expect-sha', PREDECESSOR_SHA)
    check('REMOVES-AFTER-LATER-RELEASES (' + str(len(later)) + ' later)', r.returncode == 0, r.stderr)
    b = subprocess.run([sys.executable, str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
    data = (tree / 'l5r-character-sheet.html').read_bytes() if (tree / 'l5r-character-sheet.html').is_file() else b''
    check('REBUILDS-PREDECESSOR-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == PREDECESSOR_SHA and len(data) == PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))
    check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() != PREDECESSOR_SHA
          and (LIVE / 'build/manifest.json').read_bytes().count(b'"expect_sha256"') == 1)

r = remover(LIVE, '--dry-run')
check('REFUSES-LIVE-TREE', r.returncode == 2 and 'refusing the live' in r.stderr, r.stderr)

with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    seam = tree / SEAM
    text = seam.read_bytes().decode('utf-8')
    seam.write_bytes(text.replace(BEGIN + '\n', BEGIN + '\n  // PART K PHASE 14.2 foreign line\n', 1).encode('utf-8'))
    r = remover(tree, '--dry-run')
    check('REFUSES-FOREIGN-MARKER-IN-BLOCK', r.returncode == 2 and 'foreign or nested marker' in r.stderr, r.stderr)
    seam.write_bytes(text.replace(BEGIN, '// removed for test', 1).encode('utf-8'))
    r = remover(tree, '--dry-run')
    check('REFUSES-MISSING-BLOCK', r.returncode == 2 and 'REFUSED' in r.stderr, r.stderr)

# Ruling 5's answer step in two suite harnesses comes off with the fix (--fixture), leaving them as on main.
FIXTURES = ['BUGFIX — Spell Slots Tab on Safari/qa/safari-tab-harness.js',
            'Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/qa/clan-theming-harness.js']
with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    copies = []
    for rel in FIXTURES:
        copy = Path(folder) / Path(rel).name
        shutil.copyfile(V / rel, copy)
        copies.append((rel, copy))
    extra = [a for _, c in copies for a in ('--fixture', str(c))]
    r = remover(tree, '--expect-sha', PREDECESSOR_SHA, *extra)
    same = [c.read_bytes() == subprocess.check_output(['git', 'show', '31be9e5:Versions/' + rel], cwd=V.parent) for rel, c in copies]
    check('FIXTURES-RETURN-TO-MAIN', r.returncode == 0 and same == [True, True], (r.stderr, same))
with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    r = remover(tree, '--dry-run', '--fixture', str(V / FIXTURES[0]))
    check('REFUSES-LIVE-FIXTURE', r.returncode == 2 and 'refusing the live' in r.stderr, r.stderr)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
