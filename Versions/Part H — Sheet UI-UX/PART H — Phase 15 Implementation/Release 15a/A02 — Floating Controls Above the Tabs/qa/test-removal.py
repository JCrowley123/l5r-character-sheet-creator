"""Removal proof for Release 15a, A02, run against scratch copies of the live Phase 0 tree.
1. A02 alone: later releases come off first through the removal-chain registry; A02's remover must then rebuild
   the exact predecessor, Release 15a A01 as live (hash and bytes), and the rebuild must verify.
2. A02, then A01: after (1), A01's own remover must rebuild Release 8c exactly.
3. A01 alone, A02 kept: A01's remover runs with A02 still present; the rebuild verifies, carries A02's fragments
   and none of A01's surface (A02's own harness is then run on it by the caller; see README).
4. The remover refuses the live tree, a foreign marker inside an owned block, and a missing block.
Adapted from A01's test-removal.py."""
from pathlib import Path
import hashlib, importlib.util, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
THIS_RELEASE = 'PART H — Phase 15 Implementation/Release 15a/A02 — Floating Controls Above the Tabs'
PREDECESSOR_SHA = 'cffde62440c3bb037f1ecfe7024b3ae9b3c765bcaccb86d2ea368700aecb0414'   # A01 live
PREDECESSOR_BYTES = 17531533
BEFORE_A01_SHA = '139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551'    # Release 8c
BEFORE_A01_BYTES = 17525378
SEAM = 'src/sheet/210-test-seam-and-init.js'
BEGIN = '// PART H PHASE 15.1.2 BEGIN floating-strip-seam'
Q = Path(__file__).resolve().parent
A01_REMOVER = Q.parent.parent / 'A01 — One Reminder per School Choice' / 'qa' / 'remove-phase.py'
# A01's own surface rule (its remover's SURFACE_RE): bounded, so base64 data that happens to spell RR15 is not a hit.
A01_SURFACE = re.compile(r"(?<![\w+/])(?:REVIEW_ONE_REMINDER_ENABLED|RR15Logic|RR15|rr15-reminder)(?![\w+/])")
KEEP = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None   # where to keep the A01-alone build, if wanted


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


live_before = hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    later = chain.strip_later(tree, after=THIS_RELEASE)
    r = run(Q / 'remove-phase.py', tree, '--expect-sha', PREDECESSOR_SHA)
    check('A02-REMOVES-AFTER-LATER-RELEASES (' + str(len(later)) + ' later)', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('A02-ALONE-REBUILDS-A01-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == PREDECESSOR_SHA and len(data) == PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))
    r = run(A01_REMOVER, tree, '--expect-sha', BEFORE_A01_SHA)
    check('THEN-A01-REMOVES', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    check('A02-THEN-A01-REBUILDS-8C-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == BEFORE_A01_SHA and len(data) == BEFORE_A01_BYTES, (b.stdout[-300:], len(data)))

with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree = copy_tree(folder)
    chain.strip_later(tree, after=THIS_RELEASE)
    r = run(A01_REMOVER, tree)
    check('A01-ALONE-REMOVES-WITH-A02-KEPT', r.returncode == 0, r.stderr)
    b, data = rebuild(tree)
    text = data.decode('utf-8', 'replace')
    check('A01-ALONE-REBUILD-VERIFIES', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          'PART H PHASE 15.1.2' in text and 'FLOATING_STRIP_ENABLED' in text and 'fc15Strip' in text and
          'PART H PHASE 15.1.1' not in text and not A01_SURFACE.search(text), b.stdout[-300:])
    if KEEP:
        KEEP.parent.mkdir(parents=True, exist_ok=True)
        KEEP.write_bytes(data)
        print('kept the A01-alone build at ' + str(KEEP) + ' sha256 ' + hashlib.sha256(data).hexdigest() + ' bytes ' + str(len(data)))

check('LIVE-TREE-UNCHANGED', hashlib.sha256((LIVE / 'l5r-character-sheet.html').read_bytes()).hexdigest() == live_before
      and live_before not in (PREDECESSOR_SHA, BEFORE_A01_SHA)
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
