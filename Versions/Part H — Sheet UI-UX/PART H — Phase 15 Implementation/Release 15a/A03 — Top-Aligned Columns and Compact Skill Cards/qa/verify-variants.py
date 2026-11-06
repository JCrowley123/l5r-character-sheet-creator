"""Pinned negative variants for Release 15a, A03 (top-aligned columns and compact phone Skill cards; revision 2); sequential, each must fail exactly its
pinned checks (variants.json, written before the first run) and exit 1. Each variant is the built sheet with one change;
the baseline is main at the branch point. A scenario that stops on a broken build is one FAIL and its
later checks never run, so the pin is the set of failed checks, not a count. --dry-run checks that every mutation is
unique; --discover prints failures instead of asserting. Adapted from A02's verify-variants.py (paths, cases and harness only)."""
from pathlib import Path
import datetime, hashlib, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
SPLASH_FAST = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '5f7a060f'  # main at the branch point: Release 15a A02 live (application 91d45109...).
HARNESS = 'compact-skills-harness.js'
TAG = 'cs15'
DISCOVER = '--discover' in sys.argv
PINNED = json.loads((Q / 'variants.json').read_bytes().decode('utf-8'))
original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')
cases = [
 ["disabled", "const COMPACT_SKILL_CARDS_ENABLED = true;", "const COMPACT_SKILL_CARDS_ENABLED = false;"],
 ["columns-bottom", "html body.car-active.cs15-on .car-page .grid.g-2:has(> * > #advList) {", "html body.car-active.cs15-on .car-page .grid.g-2:has(> * > #advListX) {"],
 ["columns-in-print", "  @media screen {\n    html body.car-active.cs15-on .car-page .grid.g-2", "  @media all {\n    html body.car-active.cs15-on .car-page .grid.g-2"],
 ["cards-in-print", "  @media screen and (max-width: 600px) {\n    html body.car-active.cs15-on #skillsBody > tr {", "  @media (max-width: 600px) {\n    html body.car-active.cs15-on #skillsBody > tr {"],
 ["no-grid", "    html body.car-active.cs15-on #skillsBody > tr {\n      display: grid;", "    html body.car-active.cs15-on #skillsBody > tr {\n      display: block;"],
 ["play-fields-shown", "html body.car-active.cs15-on.pm12-play #skillsBody > tr > td:not(:first-child):not(:has(> .sk-rank)):not(:has(> .sk-roll)) {", "html body.car-active.cs15-on.pm12-never #skillsBody > tr > td:not(:first-child):not(:has(> .sk-rank)):not(:has(> .sk-roll)) {"],
 ["unreached-shown", "html body.car-active.cs15-on.pm12-play #skillsBody .sk-mastery-note > span[style*=\"#a89f8c\" i] {", "html body.car-active.cs15-on.pm12-play #skillsBody .sk-mastery-note > span[style*=\"#a89f8cX\" i] {"],
 ["manage-masteries-hidden", "html body.car-active.cs15-on.pm12-play #skillsBody .sk-mastery-note > span[style*=\"#a89f8c\" i] {", "html body.car-active.cs15-on #skillsBody .sk-mastery-note > span[style*=\"#a89f8c\" i] {"],
 ["school-caption-wide", "html body.car-active.cs15-on:not(.pm12-play) #skillsBody > tr > td:has(> .sk-school)::before {", "html body.car-active.cs15-on:not(.pm12-play) #skillsBody > tr > td:has(> .sk-schoolX)::before {"],
 ["manage-summary-shown", "html body.car-active.cs15-on.pm12-play #skillsBody > tr > td:first-child > .cs15-summary {", "html body.car-active.cs15-on #skillsBody > tr > td:first-child > .cs15-summary {"],
 ["summary-everywhere", "html body.cs15-on #skillsBody .cs15-summary {\n  display: none;", "html body.cs15-on #skillsBody .cs15-summaryX {\n  display: none;"],
 ["summary-truncated", "      line-height: 1.35;\n      overflow-wrap: break-word;\n    }", "      line-height: 1.35;\n      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\n    }"],
 ["text-in-row", "      line.className = 'cs15-summary';", "      line.className = 'cs15-summary'; line.textContent = 'Summary';"],
 ["summary-focusable", "      line.className = 'cs15-summary';", "      line.className = 'cs15-summary'; line.tabIndex = 0;"],
 ["eye-in-first-row", "#skillsBody .sk-name-row > .sk-info-btn {\n      grid-row: 2;", "#skillsBody .sk-name-row > .sk-info-btn {\n      grid-row: 1;"],
 ["remove-before-notes", "#skillsBody > tr > td:has(> .rm-btn) {\n      order: 2;", "#skillsBody > tr > td:has(> .rm-btn) {\n      order: 0;"],
 ["no-observer", "api.observer.observe(body, {childList: true});", "api.observer.observe(document.createElement('tbody'), {childList: true});"],
 ["no-input-listener", "      body.addEventListener('input', function(e){", "      body.addEventListener('cs15-never', function(e){"],
 ["no-summary-refresh", "const out = cs15Recalc.apply(this, arguments); api.refreshAll(); return out;", "const out = cs15Recalc.apply(this, arguments); return out;"],
 ["no-warning", "      const warning = api.warning(tr);", "      const warning = '';"]
]

report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
# Evidence goes to negative-<first 8 hex of the build under test> (the frozen candidate once qualified-sha256.txt exists);
# a --discover run goes to variants-discover-<same>, so the qualification run never writes over the discovery's logs.
out = Q / (('variants-discover-' if DISCOVER else 'negative-') + hashlib.sha256(original.encode('utf-8')).hexdigest()[:8])


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
assert hashlib.sha256(baseline.encode('utf-8')).hexdigest() == '91d451099ee58f1b481fcf87b3defa7955138f9fb67a56e8fa6fac1e5ad66dc0'
run('baseline', baseline)
for label, old, new in cases:
    run(label, original.replace(old, new))
report['passed'] = not DISCOVER
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.' if not DISCOVER else 'Discovery done.')
