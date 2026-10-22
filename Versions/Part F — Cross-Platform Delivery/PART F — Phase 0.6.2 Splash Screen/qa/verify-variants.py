"""Pinned negative proofs for PART F — Phase 0.6.2 Splash Screen; sequential, each must run all 19 checks.
Cycle 5 Release 5a.2: re-pinned for the owner's artwork, the 5 s minimum, tap to continue and the test switch.
Each variant is the sheet build with one change; the deployed-page check reads <dist-dir> unchanged, except in
the variant that moves the splash.
    python qa/verify-variants.py <dist-dir> [--dry-run]"""
from pathlib import Path
import datetime, json, os, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
TOTAL = 19
DIST = Path(sys.argv[1]).resolve()
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
DESIGN_BEGIN = '<!-- PART F PHASE 0.6.2 BEGIN splash-design -->\n'
DESIGN_END = '<!-- END SPLASH062 splash-design -->\n'


def late_in_body(text):
    """The splash markup moved to the end of the body (in the deployed page): too late for the first paint."""
    a, b = text.index(DESIGN_BEGIN), text.index(DESIGN_END) + len(DESIGN_END)
    block, rest = text[a:b], text[:a] + text[b:]
    return rest.replace('</body>', block + '</body>', 1)


cases = [
    ('disabled', '  var SPLASH_ENABLED = true;', '  var SPLASH_ENABLED = false;',
     ['S-SWITCH', 'S-COVERS-AT-FIRST-PAINT', 'S-STAYS-UNTIL-READY', 'S-NOT-PRINTED', 'S-LEAVES-WITHOUT-THE-SCRIPT',
      'S-TAP-BEFORE-READY-IGNORED', 'S-TAP-AFTER-READY-DISMISSES', 'S-STAYS-AT-LEAST-5S', 'S-FADES-AFTER-READY-AND-5S',
      'S-ART-BY-SHAPE', 'S-TEST-SWITCH', 'S-SUITE-PRELOAD-SETS-THE-SWITCH']),
    ('passes-taps', 'position:fixed; inset:0; z-index:2147483000; pointer-events:auto;',
     'position:fixed; inset:0; z-index:2147483000; pointer-events:none;',
     ['S-COVERS-AT-FIRST-PAINT', 'S-TAP-BEFORE-READY-IGNORED', 'S-TAP-AFTER-READY-DISMISSES']),
    ('gestures-reach-the-page', '    touch-action:none;   /* no double-tap or pinch zoom, and no scrolling of the page beneath */\n', '',
     ['S-COVERS-AT-FIRST-PAINT']),
    ('no-minimum','  var SPLASH_MIN_MS = 5000;', '  var SPLASH_MIN_MS = 0;',
     ['S-SWITCH', 'S-STAYS-AT-LEAST-5S', 'S-FADES-AFTER-READY-AND-5S', 'S-TAP-AFTER-READY-DISMISSES']),
    ('no-ready-signal', "    document.dispatchEvent(new Event('l5r-sheet-ready'));\n", '',
     ['S-READY-ONCE', 'S-FADES-AFTER-READY-AND-5S', 'S-TEST-SWITCH', 'S-REDUCED-MOTION-NO-FADE']),
    ('tap-ignored-after-ready', "  el.addEventListener('click', function () { if (ready) leave(); });\n", '',
     ['S-TAP-AFTER-READY-DISMISSES']),
    ('tap-before-ready-dismisses', 'if (ready) leave();', 'leave();', ['S-TAP-BEFORE-READY-IGNORED']),
    ('takes-taps-while-fading', "    el.style.pointerEvents = 'none';   // the page answers at once, even while the splash fades\n", '',
     ['S-TAP-AFTER-READY-DISMISSES']),
    ('no-test-switch', 'var fast = window.__L5R_SPLASH_FAST__ === true,', 'var fast = false,',
     ['S-TEST-SWITCH', 'S-REDUCED-MOTION-NO-FADE', 'S-SUITE-PRELOAD-SETS-THE-SWITCH']),
    ('no-error-listener', "  window.addEventListener('error', leave);\n", '', ['S-LEAVES-ON-A-SCRIPT-ERROR']),
    ('no-safety-timer', "  document.addEventListener('DOMContentLoaded', function () { setTimeout(leave, 10000); });\n", '',
     ['S-LEAVES-WITHOUT-THE-SCRIPT']),
    ('no-noscript-rule', '  #l5rSplash{ display:none; }\n', '', ['S-HIDDEN-WITHOUT-JAVASCRIPT']),
    ('printed', '  @media print{ #l5rSplash{ display:none !important; } }\n', '', ['S-NOT-PRINTED']),
    ('never-fades', "    el.classList.add('is-leaving');\n    setTimeout(gone, 300);\n", '    gone();\n',
     ['S-FADES-AFTER-READY-AND-5S', 'S-TEST-SWITCH']),
    ('script-left-behind', '[el, me].forEach(', '[el].forEach(', ['S-GONE-WITH-ITS-SCRIPT']),
    ('no-wide-picture', '<source media="(min-aspect-ratio: 4/3)"', '<source media="(min-aspect-ratio: 99/1)"', ['S-ART-BY-SHAPE']),
    ('cropped', '#l5rSplash .l5r-splash-art img{ object-fit:contain; }', '#l5rSplash .l5r-splash-art img{ object-fit:cover; }',
     ['S-ART-BY-SHAPE']),
    # The deployed page only (the sheet unchanged): the splash no longer first in its body.
    ('late-in-the-deployed-page', None, None, ['S-FIRST-IN-THE-DEPLOYED-BODY']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'


def mutate(old, new):
    return original if old is None else original.replace(old, new)


def run(label, body, want, dist_body=None):
    with tempfile.TemporaryDirectory(prefix='l5r-splash-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        site = Path(folder) / 'dist'
        shutil.copytree(DIST, site)
        if dist_body is not None:
            (site / 'index.html').write_bytes(dist_body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'splash-harness.js'), str(page), str(site)], capture_output=True, text=True,
                           encoding='utf-8', timeout=900)
    text = r.stdout + r.stderr
    (out / (label + '.log')).write_bytes(text.encode('utf-8'))
    failed = re.findall(r'^FAIL (\S+)', text, re.M)
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    got = list(map(int, counts[-1])) if counts else []
    case = {'id': label, 'expected_failures': want, 'actual_failures': failed, 'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    assert r.returncode == 1 and got == [TOTAL - len(want), TOTAL] and sorted(failed) == sorted(want), case
    print(label + ': failed exactly ' + str(len(want)) + ' pinned checks', flush=True)


for label, old, new, want in cases:
    assert old is None or original.count(old) == 1, (label, 'mutation is not unique', original.count(old))
    assert old is None or mutate(old, new) != original, (label, 'mutation changes nothing')
assert len({c[0] for c in cases}) == len(cases), 'case ids not unique'
print(f'{len(cases)} mutations unique.', flush=True)
if '--dry-run' in sys.argv:
    sys.exit(0)
out.mkdir(exist_ok=True)
dist_page = (DIST / 'index.html').read_text(encoding='utf-8')
for label, old, new, want in cases:
    body = mutate(old, new)
    run(label, body, want, late_in_body(dist_page) if label == 'late-in-the-deployed-page' else None)
report['passed'] = True
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases)) + ' negative variants matched their pinned failures.')
