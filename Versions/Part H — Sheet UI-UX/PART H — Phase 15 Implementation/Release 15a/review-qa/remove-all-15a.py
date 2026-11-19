"""Cycle review after Release 15a: the whole of 15a removed through the removal chain gives Release 8c's application
exactly (Phase 11.2.6, Part K, `139e0810…2551`, 17,525,378 bytes), byte for byte.

Scratch tree only: the live Phase 0 tree is copied to a temporary folder and every release registered after Phase 11.2.6
is removed, newest first, by its own remover (`removal_chain.strip_later`). First it confirms that everything registered
after Phase 11.2.6 is a Release 15a unit, and that every 15a unit folder with a remover is registered. The rebuild must
pass `recombine.py --verify`, hash to Release 8c's application and match, byte for byte, the application file recorded at
Release 8c's production-evidence commit `962782da`. No retry. Written for the review after 15a, 19 November 2026."""
from pathlib import Path
import hashlib, importlib.util, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
R = Q.parent  # Release 15a/
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
REPO = V.parent
LIVE = V / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
APP = 'l5r-character-sheet.html'
AFTER = 'PART K — Phase 11.2.6 Rank Advancement Spell Choices'
PREFIX = 'PART H — Phase 15 Implementation/Release 15a/'
LIVE_SHA, LIVE_BYTES = '921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150', 17718601
R8C_SHA, R8C_BYTES = '139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551', 17525378
R8C_COMMIT = '962782da'  # "Record verified Release 8c production deployment and complete step 3b"
UNITS = 26  # A01 to A19.1 as registered; A12 was withdrawn (never on main) and A18 closed (nothing built)
MARKER = re.compile(r'PART H PHASE 15\.')
spec = importlib.util.spec_from_file_location('removal_chain', V / 'QA — Removal Chain Registry/removal_chain.py')
chain = importlib.util.module_from_spec(spec); sys.modules['removal_chain'] = chain; spec.loader.exec_module(chain)
results = []


def check(name, ok, detail=''):
    ok = bool(ok)
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else ' ' + str(detail)[:600]), flush=True)


def sha(data):
    return hashlib.sha256(data).hexdigest()


# 1. What is registered after Phase 11.2.6 is Release 15a, and all of it.
later = chain.later_than(AFTER)
names = [r.folder for r in later]
check(f'CHAIN-AFTER-11.2.6-IS-ONLY-15A ({len(names)} entries)', all(n.startswith(PREFIX) for n in names),
      [n for n in names if not n.startswith(PREFIX)])
check(f'CHAIN-HOLDS-{UNITS}-15A-UNITS', len(names) == UNITS, len(names))
on_disk = sorted(p.parent.parent.name for p in R.glob('*/qa/remove-phase.py'))
check('EVERY-15A-REMOVER-IS-REGISTERED', sorted(n[len(PREFIX):] for n in names) == on_disk,
      (set(on_disk) ^ {n[len(PREFIX):] for n in names}))
for n in names:
    if not (chain.release_dir(n) / 'qa' / 'remove-phase.py').is_file():
        check('REMOVER-PRESENT ' + n, False, 'missing qa/remove-phase.py')

# 2. The live tree is today's main.
live_data = (LIVE / APP).read_bytes()
check('LIVE-IS-921F3AC9', sha(live_data) == LIVE_SHA and len(live_data) == LIVE_BYTES, (sha(live_data), len(live_data)))
live_markers = sorted({m for p in (LIVE / 'src').rglob('*') if p.is_file()
                       for m in re.findall(r'PART H PHASE 15\.[\d.]*\d', p.read_text(encoding='utf-8', errors='ignore'))})
print('15a markers in the live tree:', len(live_markers), ' '.join(live_markers), flush=True)
check(f'LIVE-HAS-{UNITS}-15A-MARKERS', len(live_markers) == UNITS, live_markers)

# 3. Release 8c's application as recorded in git.
blob = subprocess.run(['git', '-C', str(REPO), 'show', f'{R8C_COMMIT}:Versions/Part F — Cross-Platform Delivery/'
                       f'PART F — Phase 0 Source Reorganization for Maintainability/{APP}'], capture_output=True).stdout
check('GIT-8C-IS-139E0810', sha(blob) == R8C_SHA and len(blob) == R8C_BYTES, (sha(blob), len(blob)))

# 4. The whole of 15a removed in a scratch copy.
with tempfile.TemporaryDirectory(prefix='l5r-15a-removal-') as folder:
    tree = Path(folder) / 'phase0'
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
    removed = chain.strip_later(tree, after=AFTER)
    print('removed, newest first:', flush=True)
    for n in removed:
        print('  ' + n[len(PREFIX):] if n.startswith(PREFIX) else '  ' + n, flush=True)
    check(f'REMOVED-ALL-{UNITS}-NEWEST-FIRST', removed == list(reversed(names)), removed)
    b = subprocess.run([sys.executable, str(tree / 'build/recombine.py'), '--verify'], capture_output=True, text=True,
                       encoding='utf-8')
    print(b.stdout.strip(), flush=True)
    data = (tree / APP).read_bytes()
    check('RECOMBINE-VERIFY-BYTE-IDENTICAL', b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout, b.stdout[-300:] + b.stderr[-300:])
    check('REBUILD-IS-139E0810-17525378', sha(data) == R8C_SHA and len(data) == R8C_BYTES, (sha(data), len(data)))
    check('REBUILD-EQUALS-GIT-8C-BYTE-FOR-BYTE', data == blob)
    left = sorted(str(p.relative_to(tree)) for p in tree.rglob('*') if p.is_file() and p.suffix in ('.js', '.css', '.html', '.json')
                  and p.name != APP and MARKER.search(p.read_text(encoding='utf-8', errors='ignore')))
    check('NO-15A-MARKER-LEFT-IN-SOURCE', left == [], left)
    check('NO-15A-FRAGMENT-LEFT', not any(chain.is_present(r, tree) for r in later),
          [r.folder for r in later if chain.is_present(r, tree)])

check('LIVE-TREE-UNCHANGED', sha((LIVE / APP).read_bytes()) == LIVE_SHA)
passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
