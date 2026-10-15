"""Pinned negative proofs for BUGFIX — Carousel Keeps Its Page on Rotation; sequential, each must run all 10 checks."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = 'a635d8f'  # main when this fix was merged: 3,837,258 bytes, d8e6915c...
TOTAL = 10
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
fix = ['CRT-TECHNIQUES-KEEPS-PAGE', 'CRT-EQUIPMENT-KEEPS-PAGE', 'CRT-BACKGROUND-KEEPS-PAGE', 'CRT-NO-SCROLLEND-KEEPS-PAGE',
       'CRT-SETTLE-DURING-ROTATION']
# (label, text, replacement, occurrences, checks that must fail)
cases = [
    ('disabled', 'var CAROUSEL_ROTATION_FIX_ENABLED = true;', 'var CAROUSEL_ROTATION_FIX_ENABLED = false;', 1, fix),
    ('no-scroll-hold', '      if(widthChanged()) return;   // an offset left over from the old width is not a page change\n', '', 1,
     fix[:4]),
    ('no-settle-relay', '    if(widthChanged()){\n      jumpToSlot(current + offset);', '    if(false){\n      jumpToSlot(current + offset);', 1,
     ['CRT-SETTLE-DURING-ROTATION']),
    ('hold-never-releases', 'laidWidth = pageWidth();', 'laidWidth = laidWidth || pageWidth();', 2, ['CRT-STEP-AFTER-ROTATION']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body, want):
    with tempfile.TemporaryDirectory(prefix='l5r-carrot-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'carousel-rotation-harness.js'), str(page)], capture_output=True, text=True,
                           encoding='utf-8', timeout=600)
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


baseline = subprocess.check_output(['git', 'show', PREDECESSOR + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'],
                                   cwd=V.parent).decode('utf-8')
run('baseline', baseline, fix)
for label, old, new, times, want in cases:
    assert original.count(old) == times, (label, 'mutation does not match', times)
    run(label, original.replace(old, new), want)
report['passed'] = True
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.')
