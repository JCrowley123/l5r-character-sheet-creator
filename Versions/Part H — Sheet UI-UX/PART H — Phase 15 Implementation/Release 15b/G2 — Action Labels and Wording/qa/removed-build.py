"""Release 15b group 2: a build with one unit removed, for running the harnesses that follow that unit without it.
   python -B removed-build.py <unit folder name> <out.html> [--expect-sha SHA]
Copies the live Phase 0 tree to a temporary folder, takes later releases off through the removal-chain registry, runs the
unit's own remover there, rebuilds with recombine.py --verify, and writes the rebuilt page to <out.html>. The live tree is
never touched. Prints the page's SHA-256 and size."""
from pathlib import Path
import hashlib, importlib.util, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
args = sys.argv[1:]
expect = None
if '--expect-sha' in args:
    i = args.index('--expect-sha'); expect = args[i + 1]; del args[i:i + 2]
unit, out = args[0], Path(args[1]).resolve()
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
LIVE = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
spec = importlib.util.spec_from_file_location('removal_chain', V / 'QA — Removal Chain Registry/removal_chain.py')
chain = importlib.util.module_from_spec(spec); sys.modules['removal_chain'] = chain; spec.loader.exec_module(chain)
remover = Q.parent.parent / unit / 'qa' / 'remove-phase.py'
with tempfile.TemporaryDirectory(prefix='l5r-g2-removed-') as folder:
    tree = Path(folder) / 'phase0'
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
    later = chain.strip_later(tree, after='PART H — Phase 15 Implementation/Release 15b/' + unit)
    r = subprocess.run([sys.executable, '-B', str(remover), str(tree)] + (['--expect-sha', expect] if expect else []), capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sys.exit('remover refused: ' + r.stderr)
    b = subprocess.run([sys.executable, str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
    if b.returncode or 'BYTE-IDENTICAL' not in b.stdout:
        sys.exit('rebuild did not verify: ' + b.stdout[-400:] + b.stderr[-400:])
    data = (tree / 'l5r-character-sheet.html').read_bytes()
out.parent.mkdir(parents=True, exist_ok=True)
out.write_bytes(data)
print(f'{unit} removed ({len(later)} later releases off first): {out} sha256 {hashlib.sha256(data).hexdigest()} bytes {len(data)}')
