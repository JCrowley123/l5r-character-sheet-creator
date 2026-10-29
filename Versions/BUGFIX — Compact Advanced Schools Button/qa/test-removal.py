"""Removal proof for this release, run against scratch copies of the live Phase 0 tree.
1. Later releases come off first through the removal-chain registry; this release's remover must then
   rebuild the exact predecessor (hash and bytes), and the rebuild must verify.
2. The remover refuses the live tree, a foreign marker inside an owned block, and a missing block.
Adapted from PART I — Phase 4.5.42's test-removal.py (constants only)."""
from pathlib import Path
import hashlib, importlib.util, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
THIS_RELEASE = 'BUGFIX — Compact Advanced Schools Button'
PREDECESSOR_SHA = '99a4d7d249443244b44cada2b63c40f6edbf330e7ce374346952c35e1e79b8e0'
PREDECESSOR_BYTES = 17385361
FRAGMENT = 'src/css/59.9999999982-bugfix-compact-school-button.css'
OTHER = 'src/css/59.9999999979-bugfix-school-pointer.css'
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
    owned = tree / FRAGMENT
    text = owned.read_bytes().decode('utf-8')
    owned.write_bytes((text + '  /* PART K PHASE 14.2 foreign line */\n').encode('utf-8'))
    r = remover(tree, '--dry-run')
    check('REFUSES-FOREIGN-MARKER-IN-FRAGMENT', r.returncode == 2 and 'foreign marker in owned fragment' in r.stderr, r.stderr)
    owned.write_bytes(text.encode('utf-8'))
    other = tree / OTHER
    other.write_bytes(other.read_bytes() + b'  /* AB7 */\n')
    r = remover(tree, '--dry-run')
    check('REFUSES-SURFACE-LEFT-BEHIND', r.returncode == 2 and 'retained source contains owned marker/surface' in r.stderr, r.stderr)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
