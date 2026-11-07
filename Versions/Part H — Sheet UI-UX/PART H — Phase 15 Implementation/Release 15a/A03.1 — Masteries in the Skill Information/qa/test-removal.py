"""Removal proof for Release 15a, A03.1, run against scratch copies of the live Phase 0 tree.
1. A03.1 alone: later releases come off first through the removal-chain registry; A03.1's remover must then rebuild
   the exact predecessor, Release 15a A16 (hash and bytes), and the rebuild must verify.
2. A03.1, then A16: after (1), A16's own remover must rebuild Release 15a A15 exactly.
3. A16 alone, A03.1 kept: A16's remover runs with A03.1 still present; the rebuild verifies, carries A03.1's fragments
   and none of A16's surface. With a path argument the build is kept there, so A03.1's own harness can be run on it.
4. The remover refuses the live tree, a foreign marker inside an owned block, and a missing block.
Adapted from A16's test-removal.py."""
from pathlib import Path
import hashlib, importlib.util, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
THIS_RELEASE = 'PART H — Phase 15 Implementation/Release 15a/A03.1 — Masteries in the Skill Information'
PREDECESSOR_SHA = 'f64b6e375665d9e7175a98d70829b8c9afb09646261ddc3574eaae1ff01258ef'   # A16
PREDECESSOR_BYTES = 17580502
BEFORE_A03_SHA = '2ba7e6dfe0385f6be499452a0f0ba68aea6b40a29482a214ea2212eb2466c0e0'    # A15
BEFORE_A03_BYTES = 17576326
SEAM = 'src/sheet/210-test-seam-and-init.js'
BEGIN = '// PART H PHASE 15.1.3.1 BEGIN skill-masteries-seam'
Q = Path(__file__).resolve().parent
A03_REMOVER = Q.parent.parent / 'A16 — No Bottom i in the Seven Pickers' / 'qa' / 'remove-phase.py'   # the unit before this one
# A16's own surface rule (its remover's SURFACE_RE), bounded so base64 data is not a hit.
A03_SURFACE = re.compile(r"(?<![\w+/])(?:PICKER_BOTTOM_INFO_REMOVED_ENABLED|BI15|bi15[\w-]*)(?![\w+/])")
KEEP = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None   # where to keep the A16-alone build, if wanted


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


def run(script, tree, *extra):
    return subprocess.run([sys.executable, '-B', str(script), str(tree), *extra], capture_output=True, text=True, encoding='utf-8')


def rebuild(tree):
    b = subprocess.run([sys.executable, str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
    data = (tree / 'l5r-character-sheet.html').read_bytes() if (tree / 'l5r-character-sheet.html').is_file() else b''
    return b, data


def a04_kept(text):
    return 'PART H PHASE 15.1.3.1' in text and 'SKILL_MASTERIES_ENABLED' in text and 'sm15-on' in text


live_before = hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    later = chain.strip_later(tree, after=THIS_RELEASE)
    r = run(Q / 'remove-phase.py', tree, '--expect-sha', PREDECESSOR_SHA)
    check('A031-REMOVES-AFTER-LATER-RELEASES (' + str(len(later)) + ' later)', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('A031-ALONE-REBUILDS-A16-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == PREDECESSOR_SHA and len(data) == PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))
    r = run(A03_REMOVER, tree, '--expect-sha', BEFORE_A03_SHA)
    check('THEN-A16-REMOVES', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('A031-THEN-A16-REBUILDS-A15-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == BEFORE_A03_SHA and len(data) == BEFORE_A03_BYTES, (b.stdout[-300:], len(data)))

with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    r = run(A03_REMOVER, tree)
    check('A16-ALONE-REMOVES-WITH-A031-KEPT', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    text = data.decode('utf-8', 'replace')
    check('A16-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and a04_kept(text) and
          'PART H PHASE 15.1.16' not in text and not A03_SURFACE.search(text), b.stdout[-300:])
    if KEEP:
        KEEP.parent.mkdir(parents=True, exist_ok=True)
        KEEP.write_bytes(data)
        print('kept the A16-alone build at ' + str(KEEP) + ' sha256 ' + hashlib.sha256(data).hexdigest() + ' bytes ' + str(len(data)))

check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before
      and live_before not in (PREDECESSOR_SHA, BEFORE_A03_SHA)
      and (LIVE / 'build/manifest.json').read_bytes().count(b'"expect_sha256"') == 1)

r = run(Q / 'remove-phase.py', LIVE, '--dry-run')
check('REFUSES-LIVE-TREE', r.returncode == 2 and 'refusing the live' in r.stderr, r.stderr)

with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    seam = tree / SEAM
    text = seam.read_bytes().decode('utf-8')
    seam.write_bytes(text.replace(BEGIN + '\n', BEGIN + '\n  // PART K PHASE 14.2 foreign line\n', 1).encode('utf-8'))
    r = run(Q / 'remove-phase.py', tree, '--dry-run')
    check('REFUSES-FOREIGN-MARKER-IN-BLOCK', r.returncode == 2 and 'foreign or nested marker' in r.stderr, r.stderr)
    seam.write_bytes(text.replace(BEGIN, '// removed for test', 1).encode('utf-8'))
    r = run(Q / 'remove-phase.py', tree, '--dry-run')
    check('REFUSES-MISSING-BLOCK', r.returncode == 2 and 'REFUSED' in r.stderr, r.stderr)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
