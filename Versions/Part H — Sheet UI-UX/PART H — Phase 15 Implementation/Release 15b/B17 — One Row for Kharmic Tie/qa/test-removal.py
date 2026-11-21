"""Removal proof for Release 15b, unit B17, run against scratch copies of the live Phase 0 tree.
1. This unit alone: later releases come off first through the removal-chain registry; this unit's remover must then
   rebuild the exact predecessor (hash and bytes), and the rebuild must verify.
2. This unit, then its predecessor: after (1), the predecessor's own remover must rebuild ITS predecessor exactly.
3. The predecessor alone, this unit kept: the predecessor's remover runs with this unit still present; the rebuild
   verifies, carries this unit's fragments and none of the predecessor's surface. With a path argument the build is
   kept there.
4. The remover refuses the live tree, a foreign marker inside an owned block, and a missing block.
Written for Release 15b group 1 from B04's test-removal.py (constants and check names only)."""
from pathlib import Path
import hashlib, importlib.util, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
THIS_RELEASE = 'PART H — Phase 15 Implementation/Release 15b/B17 — One Row for Kharmic Tie'
PREDECESSOR_SHA = '65b81f74b2dd82cea0ea334fb92c0da7936ae33b01e9008a01d5533df4ef5939'   # B14 on B04
PREDECESSOR_BYTES = 17741065
BEFORE_PREDECESSOR_SHA = '56f51ab38339f13e8f64bc417ec3bef0b6c768bbfd226194943ab64800e5d156'   # B04 on A14
BEFORE_PREDECESSOR_BYTES = 17737482
SEAM = 'src/sheet/210-test-seam-and-init.js'
BEGIN = '// PART H PHASE 15.2.5 BEGIN kharmic-tie-row-seam'
Q = Path(__file__).resolve().parent
PREDECESSOR_REMOVER = Q.parent.parent / "B14 — Jigoku's Total, Then Its Arithmetic" / 'qa' / 'remove-phase.py'
# The predecessor's own surface rule (its remover's SURFACE_RE), bounded so base64 data is not a hit.
PREDECESSOR_SURFACE = re.compile(r"(?<![\w+/])(?:JIGOKU_TOTAL_FIRST_ENABLED|JK15|jk15[\w-]*)(?![\w+/])")
PREDECESSOR_MARKER = re.compile(r"PART H PHASE 15\.2\.4(?![\d.]*\d)")
KEEP = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None   # where to keep the predecessor-removed build, if wanted


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


def kept(text):
    return 'PART H PHASE 15.2.5 ' in text and 'KHARMIC_TIE_ROW_ENABLED' in text and 'KT15.install()' in text


live_before = hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    later = chain.strip_later(tree, after=THIS_RELEASE)
    r = run(Q / 'remove-phase.py', tree, '--expect-sha', PREDECESSOR_SHA)
    check('B17-REMOVES-AFTER-LATER-RELEASES (' + str(len(later)) + ' later)', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('B17-ALONE-REBUILDS-PREDECESSOR-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == PREDECESSOR_SHA and len(data) == PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))
    r = run(PREDECESSOR_REMOVER, tree, '--expect-sha', BEFORE_PREDECESSOR_SHA)
    check('THEN-B14-REMOVES', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('THEN-B14-REBUILDS-ITS-PREDECESSOR-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == BEFORE_PREDECESSOR_SHA and len(data) == BEFORE_PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))

with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    r = run(PREDECESSOR_REMOVER, tree)
    check('B14-ALONE-REMOVES-WITH-B17-KEPT', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    text = data.decode('utf-8', 'replace')
    check('B14-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and kept(text) and
          not PREDECESSOR_MARKER.search(text) and not PREDECESSOR_SURFACE.search(text), b.stdout[-300:])
    if KEEP:
        KEEP.parent.mkdir(parents=True, exist_ok=True)
        KEEP.write_bytes(data)
        print('kept the B14-removed build at ' + str(KEEP) + ' sha256 ' + hashlib.sha256(data).hexdigest() + ' bytes ' + str(len(data)))

check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before
      and live_before not in (PREDECESSOR_SHA, BEFORE_PREDECESSOR_SHA)
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
