"""Pinned negative variants for PART I — Phase 4.5.36 Weakness and the Curse of Hotei; sequential, each must run all
checks and fail exactly its pinned ones. --discover prints each variant's failures instead of asserting."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '2118dfa'  # main: 3,912,042 bytes, 82044392...
TOTAL = 45
DISCOVER = '--discover' in sys.argv
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8')) if (Q / 'variants.json').is_file() else {}
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
cases = [
    ('disabled', 'const WEAKNESS_HOTEI_ENABLED = true;', 'const WEAKNESS_HOTEI_ENABLED = false;'),
    ('floor-removed', 'api.lowerBy = function(value){ return value > api.FLOOR ? value - 1 : value; };',
     'api.lowerBy = function(value){ return value - 1; };'),
    ('ring-not-lowered', "if(typeof weakness4536WriteRings === 'function') weakness4536WriteRings();", 'void 0;'),
    ('insight-lowered', "if(typeof weakness4536PurchasedRings === 'function') weakness4536PurchasedRings(ringVals);", 'void 0;'),
    ('purchased-trait-written', 'if(el) el.value = api.ring(r.key);',
     "if(el) el.value = api.ring(r.key); r.traits.forEach(function(t){ const ti = document.getElementById('trait_' + t.key); "
     "if(ti) ti.value = api.trait(t.name); });"),
    ('hotei-one-point', '      if(!consumeVoidPoint()){\n        api.restore(before);', '      if(false){\n        api.restore(before);'),
    ('hotei-on-roll-void-tick', '    HOTEI4536.install();\n',
     '    HOTEI4536.install();\n    { const hv = spendVoid; spendVoid = function(k){ const r = hv.apply(this, arguments); '
     'if(r && HOTEI4536.applies()) consumeVoidPoint(); return r; }; }\n'),
    ('not-undone-together', "hotei4536Pips.addEventListener('click', hoteiUi4536Pip, true);", 'void 0;'),
    ('hotei-round-rule-ignored', "      if(isCombatActive() && hasSpentThisRound('void')){\n        return {ok:false, reason:'You have",
     "      if(false){\n        return {ok:false, reason:'You have"),
    ('hotei-card-gates-ignored', "if(gate && !gate.ok && gate.reason !== 'Unknown Void option.') return",
     "if(false) return"),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
out.mkdir(exist_ok=True)


def run(label, body):
    with tempfile.TemporaryDirectory(prefix='l5r-weak4536-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'weakness-hotei-harness.js'), str(page)], capture_output=True, text=True,
                           encoding='utf-8', timeout=600)
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
    want = sorted(PINNED[label])
    assert r.returncode == 1 and got == [TOTAL - len(want), TOTAL] and failed == want, case
    print(label + ': failed exactly ' + str(len(want)) + ' pinned checks', flush=True)


baseline = subprocess.check_output(['git', 'show', PREDECESSOR + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'],
                                   cwd=V.parent).decode('utf-8')
run('baseline', baseline)
for label, old, new in cases:
    assert original.count(old) == 1, (label, 'mutation is not unique', original.count(old))
    run(label, original.replace(old, new))
report['passed'] = not DISCOVER
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.' if not DISCOVER else 'Discovery done.')
