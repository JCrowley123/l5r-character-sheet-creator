"""Whole-G4 removal through the removal-chain registry, on a scratch copy of this checkout's Phase 0 tree: every unit after
8b.1-UI-03 comes off, newest first, each by its own remover, and the rebuild must be G3 as live exactly (hash and bytes).
Also: the splash layer's own remover refuses while A17 is present (A17's block sits inside its design block).
Light check for G4 (12 November 2026), written from G3's test-removal-group.py idea; not a qualification script."""
from pathlib import Path
import hashlib, importlib.util, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
G3_SHA, G3_BYTES = '6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029', 17631957
UNITS = ['A09 — Phone Text Entry and Repeated Taps', 'A10 — Cross-Page Actions Move Focus',
         'A10.1 — The Page Ring Only for the Keyboard', 'A17 — The Splash Fills the Screen']
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
LIVE = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
spec = importlib.util.spec_from_file_location('removal_chain', V / 'QA — Removal Chain Registry/removal_chain.py')
chain = importlib.util.module_from_spec(spec); sys.modules['removal_chain'] = chain; spec.loader.exec_module(chain)
results = []


def check(name, ok, detail=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else ' ' + str(detail)[:400]), flush=True)


with tempfile.TemporaryDirectory(prefix='l5r-g4-group-') as folder:
    tree = Path(folder) / 'phase0'
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
    splash = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/remove-phase.py'
    r = subprocess.run([sys.executable, '-B', str(splash), str(tree), '--dry-run'], capture_output=True, text=True, encoding='utf-8')
    check('SPLASH-LAYER-REFUSES-WHILE-A17-PRESENT', r.returncode == 2 and 'REFUSED' in r.stderr, r.stdout[-200:] + r.stderr[-300:])
    removed = chain.strip_later(tree, after='PART H — Phase 15 Implementation/Release 15a/8b.1-UI-03 — Remove Apart from Memorised')
    names = [Path(x).name for x in removed]
    check('ALL-FOUR-REMOVED-NEWEST-FIRST', names == list(reversed(UNITS)), names)
    b = subprocess.run([sys.executable, str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
    data = (tree / 'l5r-character-sheet.html').read_bytes()
    check('WHOLE-G4-REMOVED-IS-G3-EXACTLY', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and hashlib.sha256(data).hexdigest() == G3_SHA
          and len(data) == G3_BYTES, (b.stdout[-200:], hashlib.sha256(data).hexdigest(), len(data)))
    leftovers = [p.name for p in (tree / 'src').rglob('*') if p.is_file() and any(t in p.read_text(encoding='utf-8', errors='ignore')
                 for t in ('PART H PHASE 15.1.24', 'PART H PHASE 15.1.25', 'PART H PHASE 15.1.26', 'PART H PHASE 15.1.27'))]
    check('NO-G4-MARKER-LEFT', leftovers == [], leftovers)
passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
