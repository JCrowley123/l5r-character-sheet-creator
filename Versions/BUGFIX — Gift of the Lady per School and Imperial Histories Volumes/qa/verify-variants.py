"""Pinned negative proofs for BUGFIX — Gift of the Lady per School and Imperial Histories Volumes; sequential, each must run
all 20 checks."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '4a5ea43'  # main: 3,907,003 bytes, 4b69c763...
TOTAL = 20
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
two = ['GIH-GIFT-TWO-RECORDS', 'GIH-GIFT-OWN-SCHOOL', 'GIH-GIFT-OWN-TEXT', 'GIH-ONE-MORE-RECORD']
ui = ['GIH-UI-TWO-ROWS', 'GIH-UI-OPENS-OWN-SCHOOL', 'GIH-FACET-SCHOOL']
volumes = ['GIH-HIRUMA-IH1', 'GIH-YOTSU-IH1', 'GIH-IH1-TECHNIQUE-TEXT']
fix = ['GIH-SWITCH'] + two + ['GIH-SCHOOL-DETAIL-TEXT', 'GIH-OWN-TEXT-API', 'GIH-SPLIT-API'] + volumes + ui
cases = [
    ('disabled', 'const GIFT_IH_FIX_ENABLED = true;', 'const GIFT_IH_FIX_ENABLED = false;', fix),
    ('missing-own-text-hook', "const giftOwn = own || typeof GIFTIH === 'undefined' ? '' : GIFTIH.ownText(name, s.name);",
     "const giftOwn = '';", ['GIH-GIFT-OWN-TEXT', 'GIH-SCHOOL-DETAIL-TEXT', 'GIH-UI-OPENS-OWN-SCHOOL']),
    ('missing-split-hook', "if(typeof GIFTIH !== 'undefined' && GIFTIH.enabled()) GIFTIH.split(out,", 'if(false) GIFTIH.split(out,', two + ui),
    ('volumes-not-applied', 'if(giftIhVolume[school.id]) school.source = giftIhVolume[school.id];', 'void 0;', volumes),
    ('never-split', 'return x.text === row.text && x.source === row.source;', 'return true;', two + ['GIH-SPLIT-API'] + ui),
    ('text-only-key', 'return x.text === row.text && x.source === row.source;', 'return x.text === row.text;', ['GIH-SPLIT-API']),
    ('inherited-names', 'const own = has(TECHNAMES.BY_SCHOOL, name) ? TECHNAMES.BY_SCHOOL[name] : null;',
     'const own = TECHNAMES.BY_SCHOOL[name];', ['GIH-OWN-TEXT-API']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body, want):
    with tempfile.TemporaryDirectory(prefix='l5r-giftih-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'gift-ih-harness.js'), str(page)], capture_output=True, text=True,
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
