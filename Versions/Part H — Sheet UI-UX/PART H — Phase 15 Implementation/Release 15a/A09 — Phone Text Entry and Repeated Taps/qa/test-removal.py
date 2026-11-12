"""Removal proof for Release 15a, finding A09, run against scratch copies of the live Phase 0 tree.
1. This unit alone: later releases come off first through the removal-chain registry; this unit's remover must then
   rebuild the exact predecessor (hash and bytes), and the rebuild must verify.
2. This unit, then its predecessor: after (1), the predecessor's own remover must rebuild ITS predecessor exactly.
3. The predecessor alone, this unit kept: the predecessor's remover runs with this unit still present; the rebuild
   verifies, carries this unit's fragments and none of the predecessor's surface. With a path argument the build is
   kept there.
4. The remover refuses the live tree, a foreign marker inside an owned block, and a missing block.
Written for G4 from 8b.1-UI-03's test-removal.py."""
from pathlib import Path
import hashlib, importlib.util, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
THIS_RELEASE = 'PART H — Phase 15 Implementation/Release 15a/A09 — Phone Text Entry and Repeated Taps'
PREDECESSOR_SHA = '6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029'   # 8b.1-UI-03 — Remove Apart from Memorised (G3 as live)
PREDECESSOR_BYTES = 17631957
BEFORE_PREDECESSOR_SHA = '4f121ab46b9654219b589dfdde71cf8989f00ff1a92ea5f152151e53539569ca'
BEFORE_PREDECESSOR_BYTES = 17626337
SEAM = 'src/sheet/210-test-seam-and-init.js'
BEGIN = '// PART H PHASE 15.1.24 BEGIN phone-text-entry-seam'
Q = Path(__file__).resolve().parent
PREDECESSOR_REMOVER = Q.parent.parent / '8b.1-UI-03 — Remove Apart from Memorised' / 'qa' / 'remove-phase.py'
# The predecessor's own surface rule (its remover's SURFACE_RE), bounded so base64 data is not a hit.
PREDECESSOR_SURFACE = re.compile(r"(?<![\w+/])(?:SPELL_REMOVE_CORNER_ENABLED|SX15|sx15[\w-]*)(?![\w+/])")
PREDECESSOR_MARKER = re.compile(r"PART H PHASE 15\.1\.23(?![\d.]*\d)")
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
    return 'PART H PHASE 15.1.24 ' in text and 'PHONE_TEXT_ENTRY_ENABLED' in text and 'tx15-on' in text


live_before = hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    later = chain.strip_later(tree, after=THIS_RELEASE)
    r = run(Q / 'remove-phase.py', tree, '--expect-sha', PREDECESSOR_SHA)
    check('A09-REMOVES-AFTER-LATER-RELEASES (' + str(len(later)) + ' later)', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('A09-ALONE-REBUILDS-PREDECESSOR-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == PREDECESSOR_SHA and len(data) == PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))
    r = run(PREDECESSOR_REMOVER, tree, '--expect-sha', BEFORE_PREDECESSOR_SHA)
    check('THEN-UI-03-REMOVES', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('THEN-UI-03-REBUILDS-ITS-PREDECESSOR-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == BEFORE_PREDECESSOR_SHA and len(data) == BEFORE_PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))

with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    r = run(PREDECESSOR_REMOVER, tree)
    check('UI-03-ALONE-REMOVES-WITH-A09-KEPT', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    text = data.decode('utf-8', 'replace')
    check('UI-03-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and kept(text) and
          not PREDECESSOR_MARKER.search(text) and not PREDECESSOR_SURFACE.search(text), b.stdout[-300:])
    if KEEP:
        KEEP.parent.mkdir(parents=True, exist_ok=True)
        KEEP.write_bytes(data)
        print('kept the UI-03-removed build at ' + str(KEEP) + ' sha256 ' + hashlib.sha256(data).hexdigest() + ' bytes ' + str(len(data)))

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
