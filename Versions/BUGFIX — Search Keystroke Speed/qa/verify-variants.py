"""Pinned negative proofs for BUGFIX — Search Keystroke Speed; sequential, each must run all 7 checks."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '65fb705'  # main at the start of Cycle 1: 3,800,283 bytes, 7b68f34d...
TOTAL = 7
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
fix = ['SS-SWITCH', 'SS-REMEMBERS', 'SS-LONG-TEXT-NOT-KEPT', 'SS-BOUNDED']
cases = [
    ('disabled', 'const SEARCH_SPEED_FIX_ENABLED = true;', 'const SEARCH_SPEED_FIX_ENABLED = false;', ['SS-SWITCH', 'SS-REMEMBERS']),
    ('no-bound', '          if(memo.size >= LIMIT) memo.clear();\n', '', ['SS-BOUNDED']),
    ('long-texts-kept', '        if(key.length > SHORT) return base.call(this, value);\n', '', ['SS-LONG-TEXT-NOT-KEPT']),
    ('colliding-key', "        const key = value == null ? '' : String(value);", "        const key = value == null ? '' : String(value).slice(0, 4);", ['SS-SAME-RESULTS', 'SS-NORMALISE-SAME', 'SS-LONG-TEXT-NOT-KEPT']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body, want):
    with tempfile.TemporaryDirectory(prefix='l5r-searchspeed-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'speed-harness.js'), str(page)], capture_output=True, text=True,
                           encoding='utf-8', timeout=300)
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
for label, old, new, want in cases:
    assert original.count(old) == 1, (label, 'mutation is not unique')
    run(label, original.replace(old, new), want)
report['passed'] = True
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.')
