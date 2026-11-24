"""Release 15b group 2: the "15a removed, group kept" stage (the owner's decision 3 of 20 November 2026).
Copies the live Phase 0 tree to a scratch folder and removes every Release 15a unit, newest first, each by its own
remover, keeping group 2 and group 1 (and anything else not in Release 15a). G1's script with group 2's install calls. Then rebuilds and verifies, and keeps the build.
    python -B remove-15a-keep-group.py <where to keep the build>
Light-check scope: it shows whether the group still builds and installs with 15a gone; the group's harnesses are run on
the kept build separately. The live tree is never touched (each remover refuses it)."""
from pathlib import Path
import hashlib, importlib.util, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
LIVE = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
spec = importlib.util.spec_from_file_location('removal_chain', V / 'QA — Removal Chain Registry/removal_chain.py')
chain = importlib.util.module_from_spec(spec)
sys.modules['removal_chain'] = chain
spec.loader.exec_module(chain)
KEEP = Path(sys.argv[1]).resolve()
GROUP = ['CN15.install()', 'LA15.install()', 'RC15.install()', 'SKP15.install()']

with tempfile.TemporaryDirectory(prefix='l5r-15a-off-') as folder:
    tree = Path(folder) / 'phase0'
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
    removed = []
    for release in reversed(chain.CHAIN):
        if '/Release 15a/' not in release.folder or not chain.is_present(release, tree):
            continue
        remover = chain.release_dir(release.folder) / 'qa' / 'remove-phase.py'
        r = subprocess.run([sys.executable, '-B', str(remover), str(tree)], capture_output=True, text=True, encoding='utf-8')
        print(('OK   ' if r.returncode == 0 else 'FAIL ') + release.folder.split('/')[-1] + ('' if r.returncode == 0 else '\n' + r.stderr[-600:]), flush=True)
        if r.returncode != 0:
            sys.exit(1)
        removed.append(release.folder)
    b = subprocess.run([sys.executable, str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
    data = (tree / 'l5r-character-sheet.html').read_bytes()
    text = data.decode('utf-8', 'replace')
    left = [r.folder for r in chain.CHAIN if '/Release 15a/' in r.folder and chain.is_present(r, tree)]
    ok = b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout and not left and all(g in text for g in GROUP)
    KEEP.parent.mkdir(parents=True, exist_ok=True)
    KEEP.write_bytes(data)
    print(f'removed {len(removed)} Release 15a units; still present: {left}')
    print('rebuild ' + ('verifies' if 'BYTE-IDENTICAL' in b.stdout else 'DOES NOT VERIFY') + '; group 2 kept: ' + str(all(g in text for g in GROUP)))
    print('kept at ' + str(KEEP) + ' sha256 ' + hashlib.sha256(data).hexdigest() + ' bytes ' + str(len(data)))
    print('STAGE ' + ('PASSED' if ok else 'FAILED'))
    sys.exit(0 if ok else 1)
