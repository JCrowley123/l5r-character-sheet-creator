"""Removal proof for PART F — Phase 0.6.1 Newest Version First, on scratch copies only.
1. This layer comes off a copy of the live Phase 0.6 folder, and off a copy of the redirect fix's removal test,
   leaving all three files byte-identical to main 31be9e5 and every other file untouched.
2. The redirect fix then still comes off the same copy to its own predecessor (c260644d…): the stack comes apart in order.
3. The remover refuses the live folder, the live fixture, a foreign marker inside a block and a missing block."""
from pathlib import Path
import filecmp, hashlib, importlib.util, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
MAIN = '31be9e5'


def versions():
    for d in Q.parents:
        if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file():
            return d
    raise SystemExit('cannot find Versions/')


V = versions()
LIVE = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App'
FIXTURE = V / 'BUGFIX — Service Worker Redirected Page/qa/test-removal.py'
HARNESS = V / 'BUGFIX — Service Worker Redirected Page/qa/sw-redirect-harness.js'


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


R = load('newest061_removal', Q / 'remove-phase.py')
REDIRECT = load('sw_redirect_removal', V / 'BUGFIX — Service Worker Redirected Page/qa/remove-phase.py')
results = []


def check(name, ok, detail=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else ' ' + str(detail)[:400]), flush=True)


def at_main(path):
    return subprocess.check_output(['git', 'show', MAIN + ':' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def scratch(folder):
    copy = Path(folder) / 'phase06'
    shutil.copytree(LIVE, copy, ignore=shutil.ignore_patterns('__pycache__'))
    fixture = Path(folder) / 'test-removal.py'
    shutil.copyfile(FIXTURE, fixture)
    harness = Path(folder) / 'sw-redirect-harness.js'
    shutil.copyfile(HARNESS, harness)
    return copy, fixture, harness


with tempfile.TemporaryDirectory(prefix='l5r-newest-removal-') as folder:
    copy, fixture, harness = scratch(folder)
    result = R.remove(copy, expect_sha=R.PRE_RELEASE['src/sw.js'][0], fixture=[fixture, harness])
    same = {rel: (copy / rel).read_bytes() == at_main(LIVE / rel) for rel in R.BLOCKS}
    check('SW-AND-UPDATE-HARNESS-MATCH-MAIN', same == {rel: True for rel in R.BLOCKS} and result['sw_matches_pre_release'], same)
    check('REDIRECT-FIXTURE-MATCHES-MAIN', fixture.read_bytes() == at_main(FIXTURE))
    check('REDIRECT-HARNESS-MATCHES-MAIN', harness.read_bytes() == at_main(HARNESS))
    others = [p.relative_to(LIVE).as_posix() for p in LIVE.rglob('*') if p.is_file() and '__pycache__' not in p.parts
              and p.relative_to(LIVE).as_posix() not in R.BLOCKS]
    check('EVERY-OTHER-FILE-UNTOUCHED (' + str(len(others)) + ')',
          all(filecmp.cmp(LIVE / rel, copy / rel, shallow=False) for rel in others))
    later = REDIRECT.remove(copy, expect_sha=REDIRECT.PRE_RELEASE_SHA)
    check('REDIRECT-FIX-THEN-COMES-OFF-TO-ITS-PREDECESSOR', later['matches_pre_release'], later)

def refused(**kwargs):
    try:
        R.remove(**kwargs)
        return ''
    except R.RemovalError as error:
        return str(error)


check('REFUSES-LIVE-FOLDER', 'refusing the live' in refused(candidate=LIVE, dry_run=True))
with tempfile.TemporaryDirectory(prefix='l5r-newest-removal-') as folder:
    copy, fixture, harness = scratch(folder)
    check('REFUSES-LIVE-FIXTURE', 'live redirect-fix fixture' in refused(candidate=copy, dry_run=True, fixture=FIXTURE))
    sw = copy / 'src/sw.js'
    text = sw.read_bytes().decode('utf-8')
    begin = '      // PART F PHASE 0.6.1 BEGIN newest-first\n'
    sw.write_bytes(text.replace(begin, begin + '      // BUGFIX SWREDIRECT foreign line\n', 1).encode('utf-8'))
    check('REFUSES-FOREIGN-MARKER-IN-BLOCK', 'foreign or nested marker' in refused(candidate=copy, dry_run=True))
    sw.write_bytes(text.replace(begin, '      // removed for test\n', 1).encode('utf-8'))
    check('REFUSES-MISSING-BLOCK', bool(refused(candidate=copy, dry_run=True)))
    sw.write_bytes(text.encode('utf-8'))
    check('LIVE-FOLDER-UNCHANGED', (LIVE / 'src/sw.js').read_bytes() == text.encode('utf-8'))

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
