"""Removal proof for BUGFIX — Printed Emphases Without the Web Fonts, on scratch copies only.
1. Later releases come off first (the registry); this fix's remover then rebuilds its predecessor exactly, and with
   --fixture leaves the printed Skills and Equipment harness byte-identical to main 31be9e5.
2. The remover refuses the live tree, the live harness, a foreign marker inside a block and a missing block."""
from pathlib import Path
import hashlib, importlib.util, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
THIS_RELEASE = 'BUGFIX — Printed Emphases Without the Web Fonts'
PREDECESSOR_SHA = 'e8d2420e02835bc90cd1fb4349f3cfc2529cb6bcfbe5ebc214f7d2ca845f951c'
PREDECESSOR_BYTES = 6732527
HARNESS = 'BUGFIX — Printed Skills and Equipment Tables/qa/printed-skills-equipment-harness.js'
BEGIN = '    // BUGFIX PSEFONT BEGIN fonts-ready-open\n'
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
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
    harness = Path(folder) / Path(HARNESS).name
    shutil.copyfile(V / HARNESS, harness)
    return tree, harness


def remover(*args):
    return subprocess.run([sys.executable, '-B', str(Q / 'remove-phase.py'), *map(str, args)], capture_output=True, text=True,
                          encoding='utf-8')


with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree, harness = copy_tree(folder)
    later = chain.strip_later(tree, after=THIS_RELEASE)
    r = remover(tree, '--expect-sha', PREDECESSOR_SHA, '--fixture', harness)
    check('REMOVES-AFTER-LATER-RELEASES (' + str(len(later)) + ' later)', r.returncode == 0, r.stderr)
    b = subprocess.run([sys.executable, str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
    data = (tree / 'l5r-character-sheet.html').read_bytes() if (tree / 'l5r-character-sheet.html').is_file() else b''
    check('REBUILDS-PREDECESSOR-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and
          hashlib.sha256(data).hexdigest() == PREDECESSOR_SHA and len(data) == PREDECESSOR_BYTES, (b.stdout[-300:], len(data)))
    main = subprocess.check_output(['git', 'show', '31be9e5:Versions/' + HARNESS], cwd=V.parent)
    check('HARNESS-RETURNS-TO-MAIN', harness.read_bytes() == main)
    check('LIVE-TREE-UNCHANGED', (LIVE / 'src/css/59.9999894-bugfix-printed-emphases-fonts.css').is_file())

with tempfile.TemporaryDirectory(prefix='l5r-removal-') as folder:
    tree, harness = copy_tree(folder)
    r = remover(LIVE, '--dry-run')
    check('REFUSES-LIVE-TREE', r.returncode == 2 and 'refusing the live' in r.stderr, r.stderr)
    r = remover(tree, '--dry-run', '--fixture', V / HARNESS)
    check('REFUSES-LIVE-HARNESS', r.returncode == 2 and 'refusing the live' in r.stderr, r.stderr)
    text = harness.read_bytes().decode('utf-8')
    harness.write_bytes(text.replace(BEGIN, BEGIN + '    // PART K PHASE 14.2 foreign line\n', 1).encode('utf-8'))
    r = remover(tree, '--dry-run', '--fixture', harness)
    check('REFUSES-FOREIGN-MARKER-IN-BLOCK', r.returncode == 2 and 'foreign or nested marker' in r.stderr, r.stderr)
    harness.write_bytes(text.replace(BEGIN, '    // removed for test\n', 1).encode('utf-8'))
    r = remover(tree, '--dry-run', '--fixture', harness)
    check('REFUSES-MISSING-BLOCK', r.returncode == 2 and 'REFUSED' in r.stderr, r.stderr)

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
