"""Release 6a: before the full suite, run every suite leaf whose folder touches what 6a changes (the Clan & School
pickers and Apply, the Characters list, the creation wizard, Yomi and the ancestral entries, Ancestors, the roll
preview, the Initiative Score, the Void card), one at a time, on the live build. Lists the folders in prerun-folders.txt."""
from pathlib import Path
import json, os, re, subprocess, sys
Q = Path(__file__).resolve().parent
V = Q.parent.parent
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
NODE = os.environ.get('L5R_NODE', r'C:\Program Files\nodejs\node.exe')
SPLASH = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
KEYS = re.compile(r'Clan and School|Clan-Themed|Spell Slots Tab on Safari|Characters List|Wizard|Play Mode Clan|Play Mode Combat|'
                  r'Cursed by the Realm|4\.5\.37|Ancestor|Spirit Realms|Roll Preview|Initiative|4\.5\.33|Void|Hotei|Phase 1\.6|'
                  r'Part C|Eligibility Gates|Release 6a|Pickers After Cancel|Yomi Sees')
listing = json.loads(subprocess.run([NODE, str(Q / 'flat-suite-runner.js'), str(P / 'l5r-character-sheet.html'), '--list'],
                                    capture_output=True, text=True, encoding='utf-8').stdout)
leaves = [l for l in listing['leaves'] if KEYS.search(l['file'])]
(Q / 'prerun-folders.txt').write_bytes(''.join(sorted({str(Path(l['file']).parent.parent.relative_to(V)) + '\n' for l in leaves})).encode('utf-8'))
failed = 0
with (Q / 'prerun.log').open('w', encoding='utf-8', newline='\n') as log:
    for l in leaves:
        r = subprocess.run([NODE, '--require', str(SPLASH), l['file'], *l['args']], cwd=l['cwd'], capture_output=True, text=True,
                           encoding='utf-8', timeout=max(600, l.get('timeout', 0) // 1000))
        out = r.stdout + r.stderr
        m = re.findall(r'(\d+)\s*/\s*(\d+)\s+(?:checks|assertions|tests)\s+passed', out)
        c = m[-1] if m else ('?', '?')
        ok = r.returncode == 0 and m and c[0] == c[1]
        failed += not ok
        name = Path(l['file']).relative_to(V).as_posix().replace('/qa/', '/')
        line = ('PASS ' if ok else 'FAIL ') + name + ' ' + c[0] + '/' + c[1] + ' exit ' + str(r.returncode)
        log.write(line + '\n')
        if not ok:
            log.write(''.join('  ' + x + '\n' for x in out.splitlines() if x.startswith(('FAIL', '  FAIL')))[:4000])
        log.flush()
        print(line, flush=True)
    log.write(str(len(leaves)) + ' leaves run; ' + str(failed) + ' failed\n')
print(len(leaves), 'leaves run;', failed, 'failed')
sys.exit(1 if failed else 0)
