"""Removal proof for PART F — Phase 0.6.3 Offline Notice After the Splash, on scratch copies only.
1. This layer comes off a copy of the live Phase 0.6 folder, leaving head-pwa.html byte-identical to main b54c13b and
   every other file untouched.
2. Phase 0.6.1 (FT-32) then still comes off the same copy to its own predecessor: the stack comes apart in order.
3. The remover refuses the live folder, a foreign marker inside a block, a missing block and its switch outside a block.
Adapted from Phase 0.6.1's test-removal.py."""
from pathlib import Path
import filecmp, importlib.util, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
MAIN = 'b54c13b'


def versions():
    for d in Q.parents:
        if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file():
            return d
    raise SystemExit('cannot find Versions/')


V = versions()
LIVE = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App'


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


R = load('notice063_removal', Q / 'remove-phase.py')
NEWEST = load('newest061_removal', V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.1 Newest Version First/qa/remove-phase.py')
results = []


def check(name, ok, detail=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else ' ' + str(detail)[:400]), flush=True)


def at_main(path):
    return subprocess.check_output(['git', 'show', MAIN + ':' + path.relative_to(V.parent).as_posix()], cwd=V.parent)


def scratch(folder):
    copy = Path(folder) / 'phase06'
    shutil.copytree(LIVE, copy, ignore=shutil.ignore_patterns('__pycache__'))
    return copy


with tempfile.TemporaryDirectory(prefix='l5r-notice-removal-') as folder:
    copy = scratch(folder)
    result = R.remove(copy, expect_sha=R.PRE_RELEASE['src/head-pwa.html'][0])
    head = (copy / 'src/head-pwa.html').read_bytes()
    check('HEAD-MATCHES-MAIN', head == at_main(LIVE / 'src/head-pwa.html') and result['head_matches_pre_release']
          and len(head) == R.PRE_RELEASE['src/head-pwa.html'][1], result)
    others = [p.relative_to(LIVE).as_posix() for p in LIVE.rglob('*') if p.is_file() and '__pycache__' not in p.parts
              and p.relative_to(LIVE).as_posix() not in R.BLOCKS]
    check('EVERY-OTHER-FILE-UNTOUCHED (' + str(len(others)) + ')',
          all(filecmp.cmp(LIVE / rel, copy / rel, shallow=False) for rel in others))
    later = NEWEST.remove(copy, expect_sha=NEWEST.PRE_RELEASE['src/sw.js'][0])
    check('FT-32-THEN-COMES-OFF-TO-ITS-PREDECESSOR', later['sw_matches_pre_release'], later)


def refused(**kwargs):
    try:
        R.remove(**kwargs)
        return ''
    except R.RemovalError as error:
        return str(error)


check('REFUSES-LIVE-FOLDER', 'refusing the live' in refused(candidate=LIVE, dry_run=True))
with tempfile.TemporaryDirectory(prefix='l5r-notice-removal-') as folder:
    copy = scratch(folder)
    target = copy / 'src/head-pwa.html'
    text = target.read_bytes().decode('utf-8')
    begin = '    // PART F PHASE 0.6.3 BEGIN notice-after-splash\n'
    assert text.count(begin) == 1
    target.write_bytes(text.replace(begin, begin + '    // BUGFIX SWREDIRECT foreign line\n', 1).encode('utf-8'))
    check('REFUSES-FOREIGN-MARKER-IN-BLOCK', 'foreign or nested marker' in refused(candidate=copy, dry_run=True))
    target.write_bytes(text.replace(begin, '    // removed for test\n', 1).encode('utf-8'))
    check('REFUSES-MISSING-BLOCK', bool(refused(candidate=copy, dry_run=True)))
    target.write_bytes((text + '<script>var NOTICE_AFTER_SPLASH_ENABLED;</script>\n').encode('utf-8'))
    check('REFUSES-SWITCH-OUTSIDE-BLOCKS', 'surface outside' in refused(candidate=copy, dry_run=True))
    target.write_bytes(text.encode('utf-8'))
    check('LIVE-FOLDER-UNCHANGED', (LIVE / 'src/head-pwa.html').read_bytes() == text.encode('utf-8'))

passed = sum(results)
print(f'{passed}/{len(results)} checks passed')
sys.exit(0 if passed == len(results) else 1)
