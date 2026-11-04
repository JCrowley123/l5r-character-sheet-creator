"""Pinned negative variants for Release 15a, A01 (one Review reminder for each open School choice); sequential, each must fail exactly its
pinned checks (variants.json, written before the first run) and exit 1. Each variant is the built sheet with one change;
the baseline is main at the branch point. A scenario that stops on a broken build is one FAIL and its
later checks never run, so the pin is the set of failed checks, not a count. --dry-run checks that every mutation is
unique; --discover prints failures instead of asserting. Adapted from Release 8c's verify-variants.py (paths, cases and harness only)."""
from pathlib import Path
import datetime, hashlib, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
SPLASH_FAST = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '18599024'  # main at the branch point: Release 8c's application bytes (139e0810...).
HARNESS = 'review-reminder-harness.js'
TAG = 'rr15'
DISCOVER = '--discover' in sys.argv
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8'))
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
cases = [
 ["disabled", "const REVIEW_ONE_REMINDER_ENABLED = true;", "const REVIEW_ONE_REMINDER_ENABLED = false;"],
 ["no-bound", r"'(?=; |, |\\.(?:\\s|$))'", "''"],
 ["any-school", "if(String(finding.title || '').indexOf(school + ': ') !== 0) return false;", "if(false) return false;"],
 ["drop-unique", "(named ? duplicates : unique).push(item);", "duplicates.push(item);"],
 ["keep-box", "      box.remove();\n      if(!result.unique.length) return;", "      void 0;\n      if(!result.unique.length) return;"],
 ["placement", "const lastOwn = school ? cards.filter", "const lastOwn = false ? cards.filter"]
]

report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
# Evidence goes to negative-<first 8 hex of the build under test>: the frozen candidate once qualified-sha256.txt exists.
out = Q / ('negative-' + hashlib.sha256(original.encode('utf-8')).hexdigest()[:8])


def run(label, body):
    with tempfile.TemporaryDirectory(prefix='l5r-' + TAG + '-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, '--require', str(SPLASH_FAST), str(Q / HARNESS), str(page), '--variant'],
                           capture_output=True, text=True, encoding='utf-8', timeout=1200)
    text = r.stdout + r.stderr
    (out / (label + '.log')).write_bytes(text.encode('utf-8'))
    failed = sorted(re.findall(r'^FAIL (\S+)', text, re.M))
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    got = list(map(int, counts[-1])) if counts else []
    case = {'id': label, 'expected_failures': PINNED.get(label), 'actual_failures': failed, 'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    if DISCOVER:
        print(label + ' ' + json.dumps(failed) + ' ' + str(got), flush=True)
        return
    assert r.returncode == 1 and failed == sorted(PINNED[label]) and len(got) == 2 and got[1] - got[0] == len(failed), case
    print(label + ': failed exactly its ' + str(len(failed)) + ' pinned checks', flush=True)


for label, old, new in cases:
    assert original.count(old) == 1, (label, 'mutation is not unique', original.count(old))
assert len({c[0] for c in cases}) == len(cases) and len({(c[1], c[2]) for c in cases}) == len(cases), 'cases not unique'
assert set(PINNED) == {'baseline'} | {c[0] for c in cases}, 'every case needs a pin'
print(f'{len(cases)} mutations unique.', flush=True)
if '--dry-run' in sys.argv:
    sys.exit(0)
out.mkdir(exist_ok=True)
baseline = subprocess.check_output(['git', 'show', PREDECESSOR + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'],
                                   cwd=V.parent).decode('utf-8')
assert hashlib.sha256(baseline.encode('utf-8')).hexdigest() == '139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551'
run('baseline', baseline)
for label, old, new in cases:
    run(label, original.replace(old, new))
report['passed'] = not DISCOVER
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.' if not DISCOVER else 'Discovery done.')
