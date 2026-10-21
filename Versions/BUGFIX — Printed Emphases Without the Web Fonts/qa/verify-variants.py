"""Pinned negative proofs for BUGFIX — Printed Emphases Without the Web Fonts; sequential, each runs all 18 checks.
1. The print rule: with the web fonts blocked, main and the 5a build without the rule fail exactly PSE-MANAGEMENT-MODE.
2. The waits: on main (no rule) with the web fonts held back 15 s, the harness without this fix's waits fails exactly
   PSE-MANAGEMENT-MODE and the harness with them passes 18/18.
    python qa/verify-variants.py [--dry-run]"""
from pathlib import Path
import datetime, importlib.util, json, os, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
PSE = V / 'BUGFIX — Printed Skills and Equipment Tables'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
TOTAL = 18
RULE = '    #skillsBody .sk-emph-select{ -webkit-appearance:none; appearance:none; }\n'
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')
main = subprocess.check_output(['git', 'show', '31be9e5:' + (P / 'l5r-character-sheet.html').relative_to(V.parent).as_posix()],
                               cwd=V.parent).decode('utf-8')
spec = importlib.util.spec_from_file_location('psefont_removal', Q / 'remove-phase.py')
R = importlib.util.module_from_spec(spec)
spec.loader.exec_module(R)
harness = (PSE / 'qa/printed-skills-equipment-harness.js').read_bytes().decode('utf-8')
no_waits = R.strip_owned_blocks(harness, 'printed-skills-equipment-harness.js', R.FIXTURE_SLUGS)
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'
PRELOAD = '--require "' + (Q / 'no-web-fonts.cjs').as_posix() + '"'


def run(label, page_text, harness_text, fonts, want):
    with tempfile.TemporaryDirectory(prefix='l5r-psefont-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(page_text.encode('utf-8'))
        qa = PSE / 'qa'
        probe = qa / ('_variant-' + label + '.js')      # beside the original, so its relative paths hold
        probe.write_bytes(harness_text.encode('utf-8'))
        env = dict(os.environ, NODE_OPTIONS=(os.environ.get('NODE_OPTIONS', '') + ' ' + PRELOAD).strip(), **fonts)
        try:
            r = subprocess.run([NODE, str(probe), str(page)], cwd=str(PSE), capture_output=True, text=True, encoding='utf-8',
                               env=env, timeout=900)
        finally:
            probe.unlink()
    text = r.stdout + r.stderr
    (out / (label + '.log')).write_bytes(text.encode('utf-8'))
    failed = re.findall(r'^FAIL (\S+)', text, re.M)
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    got = list(map(int, counts[-1])) if counts else []
    case = {'id': label, 'expected_failures': want, 'actual_failures': failed, 'counts': got, 'exit': r.returncode}
    report['cases'].append(case)
    (out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
    assert got == [TOTAL - len(want), TOTAL] and sorted(failed) == sorted(want) and (r.returncode == 0) == (not want), case
    print(label + ': failed exactly ' + str(len(want)) + ' pinned checks', flush=True)


assert original.count(RULE) == 1 and main.count(RULE) == 0, 'the rule must be in the build once and absent on main'
assert no_waits != harness and 'document.fonts.ready' not in no_waits, 'the waits are not stripped'
print('mutations unique; the waits strip cleanly', flush=True)
if '--dry-run' in sys.argv:
    sys.exit(0)
out.mkdir(exist_ok=True)
BLOCK = {'FONTS': 'block'}
DELAY = {'FONTS': 'delay', 'DELAY_MS': '15000'}
run('main-fonts-blocked', main, harness, BLOCK, ['PSE-MANAGEMENT-MODE'])
run('rule-removed-fonts-blocked', original.replace(RULE, ''), harness, BLOCK, ['PSE-MANAGEMENT-MODE'])
run('this-fix-fonts-blocked', original, harness, BLOCK, [])
run('main-fonts-late-no-waits', main, no_waits, DELAY, ['PSE-MANAGEMENT-MODE'])
run('main-fonts-late-with-waits', main, harness, DELAY, [])
report['passed'] = True
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All 5 variants matched their pinned results.')
