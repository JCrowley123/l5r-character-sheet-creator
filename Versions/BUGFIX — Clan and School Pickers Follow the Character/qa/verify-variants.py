"""Pinned negative proofs for BUGFIX — Clan and School Pickers Follow the Character; sequential, each must run all
72 checks. --dry-run checks only that every mutation is unique in the build.
Adapted from BUGFIX — Gift of the Lady per School and Imperial Histories Volumes."""
from pathlib import Path
import datetime, json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
PREDECESSOR = '31be9e5'  # main: 6,718,713 bytes, a9a11199...
TOTAL = 72
original = (P / 'l5r-character-sheet.html').read_text(encoding='utf-8')


def imp(*names):
    return [f'CFS-{n}-{k}' for n in names for k in ('IMPORT-MANAGEMENT', 'INFO-NAMES-OWN-SCHOOL', 'IMPORT-PLAY')]


ALL = ['crane', 'lion', 'minor', 'multi', 'advanced', 'cross', 'monk']
APPLY = [f'CFS-{n}-{k}' for n in ('crane', 'lion', 'minor') for k in ('APPLY-SCHOOL-KEEPS-OWN', 'APPLY-FAMILY-KEEPS-OWN')]
CROSS = ['CFS-cross-APPLY-SCHOOL-INERT', 'CFS-cross-EXTRA-OPTION-MARKED']
SEQ = ['CFS-SEQ-MINOR-AFTER-CRANE', 'CFS-SEQ-LION-AFTER-MINOR', 'CFS-SEQ-LOADED-WHILE-IN-PLAY']
LIST = ['CFS-LIST-OPEN-LION', 'CFS-LIST-OPEN-CRANE']
LOGIC = ['CFS-LOGIC-GREAT-CLAN', 'CFS-LOGIC-TRIMS', 'CFS-LOGIC-CLAN-FROM-SCHOOL', 'CFS-LOGIC-UNKNOWN-CLAN-USES-SCHOOL',
         'CFS-LOGIC-BROTHERHOOD', 'CFS-LOGIC-BLANK-IS-NULL', 'CFS-LOGIC-UNKNOWN-IS-NULL', 'CFS-LOGIC-MINOR-CLAN']
LOAD = imp(*ALL) + APPLY + CROSS + SEQ + LIST
SYNC = ['CFS-SYNC-WRITES-NO-SAVED-FIELD', 'CFS-SYNC-RESTAGES', 'CFS-REFUSED-LOAD-LEAVES-PICKERS']
# Ruling 5's guard. Without a sync after the load the multi character stages Hida Bushi, and the cross character a
# valid School, so those two questions differ.
GUARD = ['CFS-GUARD-SWITCH', 'CFS-GUARD-SCHOOL-ASKS', 'CFS-GUARD-CANCEL-KEEPS-SCHOOL', 'CFS-GUARD-FAMILY-ASKS',
         'CFS-GUARD-CANCEL-KEEPS-FAMILY', 'CFS-GUARD-SAME-SCHOOL-NAMES-WHAT-GOES', 'CFS-GUARD-CANCEL-KEEPS-BOTH-SCHOOLS',
         'CFS-GUARD-ADVANCED-REFUSAL-WINS', 'CFS-GUARD-NOTHING-STAGED-NOT-ASKED']
UNSYNCED = ['CFS-GUARD-SAME-SCHOOL-NAMES-WHAT-GOES', 'CFS-GUARD-NOTHING-STAGED-NOT-ASKED']
FRAG = 'BUGFIX CFSSYNC'
cases = [
    # The pickers left on their defaults: the switch off, or the load hook never runs.
    ('disabled', 'const CFS_SYNC_ENABLED = true;', 'const CFS_SYNC_ENABLED = false;', ['CFS-SWITCH'] + LOAD + SYNC + UNSYNCED + ['CFS-RESET-OUTSIDE-WIZARD-DEFAULTS']),
    ('load-not-hooked', '      if(result !== false){\n        try { CFSSYNC.sync(); }', '      if(false){\n        try { CFSSYNC.sync(); }', LOAD + UNSYNCED),
    # Apply fired on load: re-applying the School drops a second School.
    ('apply-fired-on-load', "      if(result !== false){\n        try { CFSSYNC.sync(); }",
     "      if(result !== false){\n        try { CFSSYNC.sync(); document.getElementById('cfs_applySchool').click(); }",
     ['CFS-multi-DATA-INTACT', 'CFS-GUARD-SAME-SCHOOL-NAMES-WHAT-GOES', 'CFS-GUARD-CANCEL-KEEPS-BOTH-SCHOOLS',
      'CFS-GUARD-ADVANCED-REFUSAL-WINS']),
    # A Minor Clan picker left as it was.
    ('minor-clan-left-stale', 'if(t){ clanSel.value = t.clan; if(t.minorClan) choose(minorSel, t.minorClan); }',
     'if(t){ clanSel.value = t.clan; }', imp('minor') + ['CFS-SEQ-MINOR-AFTER-CRANE', 'CFS-SYNC-RESTAGES', 'CFS-REFUSED-LOAD-LEAVES-PICKERS']),
    # Synced on every reset as well: the wizard's mid-step reset would undo its own pick.
    ('synced-on-reset', '  // ============ END BUGFIX CFSSYNC ============',
     '  if(CFS_SYNC_ENABLED){ const r0 = resetToBaseline; resetToBaseline = function(){ const r = r0.apply(this, arguments); CFSSYNC.sync(); return r; }; }\n'
     '  // ============ END BUGFIX CFSSYNC ============', ['CFS-RESET-IN-WIZARD-LEAVES-PICKERS']),
    # A School the Clan's list lacks shown as nothing.
    ('no-extra-option', '        select.add(extra);', '        void extra;',
     ['CFS-cross-IMPORT-MANAGEMENT', 'CFS-cross-IMPORT-PLAY', 'CFS-cross-EXTRA-OPTION-MARKED']),
    # The School read from #f_school, not the School applied on the tab.
    ('school-from-field', "const school = (applied && applied.school) || (list[0] && list[0].name) || field('f_school');",
     "const school = field('f_school');", imp('multi', 'advanced') + ['CFS-GUARD-SAME-SCHOOL-NAMES-WHAT-GOES']),
    # No Clan found from the School when none is recorded.
    ('no-clan-from-school', '      else if(school){\n        // No recognised Clan', '      else if(false){\n        // No recognised Clan',
     imp('monk') + ['CFS-LOGIC-CLAN-FROM-SCHOOL', 'CFS-LOGIC-UNKNOWN-CLAN-USES-SCHOOL', 'CFS-LOGIC-BROTHERHOOD']),
]
BASELINE = ['CFS-SWITCH'] + LOAD + LOGIC + SYNC + GUARD + ['CFS-RESET-OUTSIDE-WIZARD-DEFAULTS']
cases += [
    # No guard: a person's Apply replaces at once; after the Multiple Schools tap the second School is gone.
    ('guard-off', 'const CFS_APPLY_GUARD_ENABLED = true;', 'const CFS_APPLY_GUARD_ENABLED = false;',
     [c for c in GUARD if c != 'CFS-GUARD-NOTHING-STAGED-NOT-ASKED']),
    # Script clicks held too: the wizard would stop, and the confirmed click is asked again instead of applied.
    ('guard-holds-script-clicks', "const btn = e.isTrusted && e.target && e.target.closest", "const btn = e.target && e.target.closest",
     ['CFS-GUARD-OK-REPLACES-SCHOOL', 'CFS-GUARD-OK-REPLACES-FAMILY', 'CFS-GUARD-SCRIPT-CLICK-NOT-ASKED']),
    # The question does not say the other Schools go.
    # A reset outside the wizard leaves the last character's pickers (the reviewer's finding 1).
    ('reset-not-synced', "      if(!(typeof CW112 === 'object' && CW112 && typeof CW112.isOpen === 'function' && CW112.isOpen())){\n        try { CFSSYNC.sync(); }",
     "      if(false){\n        try { CFSSYNC.sync(); }", ['CFS-RESET-OUTSIDE-WIZARD-DEFAULTS']),
    ('losses-not-named', "      if(others.length) lost.push(", "      if(false) lost.push(", ['CFS-GUARD-SAME-SCHOOL-NAMES-WHAT-GOES']),
]
report = {'checked_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'cases': []}
out = Q / 'negative'


def run(label, body, want):
    with tempfile.TemporaryDirectory(prefix='l5r-cfssync-negative-') as folder:
        page = Path(folder) / 'index.html'
        page.write_bytes(body.encode('utf-8'))
        r = subprocess.run([NODE, str(Q / 'cfs-sync-harness.js'), str(page)], capture_output=True, text=True,
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
    assert original.count(old) == 1, (label, 'mutation is not unique', original.count(old))
    assert len(set(want)) == len(want), (label, 'duplicate pinned check')
assert len({c[0] for c in cases}) == len(cases) and len({(c[1], c[2]) for c in cases}) == len(cases), 'cases not unique'
print(f'{len(cases)} mutations unique; baseline pins {len(BASELINE)} of {TOTAL}.', flush=True)
if '--dry-run' in sys.argv:
    sys.exit(0)
out.mkdir(exist_ok=True)
baseline = subprocess.check_output(['git', 'show', PREDECESSOR + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'],
                                   cwd=V.parent).decode('utf-8')
run('baseline', baseline, BASELINE)
only = [a.split('=', 1)[1] for a in sys.argv if a.startswith('--only=')]
for label, old, new, want in cases:
    if only and label not in only:
        continue
    run(label, original.replace(old, new), want)
report['passed'] = True
(out / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())
print('All ' + str(len(cases) + 1) + ' negative variants matched their pinned failures.')
