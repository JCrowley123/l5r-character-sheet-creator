"""Removal proof for Release 15a, A15, run against scratch copies of the live Phase 0 tree.
1. A15 alone: later releases come off first through the removal-chain registry; A15's remover must then rebuild
   the exact predecessor, Release 15a A04 (hash and bytes), and the rebuild must verify.
2. A15, then A04: after (1), A04's own remover must rebuild Release 15a A03 as live exactly.
3. A04 alone, A15 kept: A04's remover runs with A15 still present; the rebuild verifies, carries A15's fragments and
   none of A04's surface. With a path argument the build is kept there, so A15's own harness can be run on it.
4. The remover refuses the live tree, a foreign marker inside an owned block, and a missing block.
Adapted from A04's test-removal.py."""
from pathlib import Path
import hashlib, importlib.util, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
THIS_RELEASE = 'PART H — Phase 15 Implementation/Release 15a/A15 — Court Badges'
PREDECESSOR_SHA = 'bc4ba31134bb30848f73bbfd5fc1e7a9c76eb75fee391f829f682647d700e0c9'   # A04
PREDECESSOR_BYTES = 17566583
BEFORE_A03_SHA = 'e73b7c0cac70c95d2965d993c9a3b9f0b66eb6f3ef4b81d6667166667090de06'    # A03 live
BEFORE_A03_BYTES = 17553370
SEAM = 'src/sheet/210-test-seam-and-init.js'
BEGIN = '// PART H PHASE 15.1.15 BEGIN court-badges-seam'
Q = Path(__file__).resolve().parent
A03_REMOVER = Q.parent.parent / 'A04 — One Information Pattern' / 'qa' / 'remove-phase.py'   # the unit before this one
# A04's own surface rule (its remover's SURFACE_RE), bounded so base64 data is not a hit.
A03_SURFACE = re.compile(r"(?<![\w+/])(?:ONE_INFO_PATTERN_ENABLED|IP15|ip15[\w-]*)(?![\w+/])")
KEEP = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None   # where to keep the A04-alone build, if wanted


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
    return 'PART H PHASE 15.1.15' in text and 'COURT_BADGES_ENABLED' in text and 'cb15-on' in text


live_before = hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    later = chain.strip_later(tree, after=THIS_RELEASE)
    r = run(Q / 'remove-phase.py', tree, '--expect-sha', PREDECESSOR_SHA)
    check('A15-REMOVES-AFTER-LATER-RELEASES (' + str(len(later)) + ' later)', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('A15-ALONE-REBUILDS-A04-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == PREDECESSOR_SHA and len(data) == PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))
    r = run(A03_REMOVER, tree, '--expect-sha', BEFORE_A03_SHA)
    check('THEN-A04-REMOVES', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('A15-THEN-A04-REBUILDS-A03-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == BEFORE_A03_SHA and len(data) == BEFORE_A03_BYTES, (b.stdout[-300:], len(data)))

with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    r = run(A03_REMOVER, tree)
    check('A04-ALONE-REMOVES-WITH-A15-KEPT', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    text = data.decode('utf-8', 'replace')
    check('A04-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and a04_kept(text) and
          'PART H PHASE 15.1.4' not in text and not A03_SURFACE.search(text), b.stdout[-300:])
    if KEEP:
        KEEP.parent.mkdir(parents=True, exist_ok=True)
        KEEP.write_bytes(data)
        print('kept the A04-alone build at ' + str(KEEP) + ' sha256 ' + hashlib.sha256(data).hexdigest() + ' bytes ' + str(len(data)))

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
