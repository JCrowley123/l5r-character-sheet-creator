"""Applies ROLLBACK.md's by-hand removal to a copy of the live harness and checks it equals originals/ byte for byte.
Changes no file. Usage: python -B removal-check.py"""
import hashlib, re
from pathlib import Path
HERE = Path(__file__).resolve().parent
V = HERE.parent.parent
LIVE = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App/qa/pwa-harness.js'
ORIG = HERE.parent / 'originals/pwa-harness.js'
RESTORE = {
    'step-limit': '',
    'step-limit-calls': '',
    'step-limit-start': "  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });\n  const page = await context.newPage();\n",
    'server-stop': "  if (server) { await new Promise((r) => server.close(r)); server = null; }\n",
    'server-stop-end': "  if (server) await new Promise((r) => server.close(r));\n",
}
text = LIVE.read_bytes().decode('utf-8')   # raw bytes: a CRLF file must not compare equal to an LF original
checks = []
found = re.findall(r'^  // QA PWASTALL BEGIN ([\w-]+)$', text, re.M)
checks.append(('BLOCKS-AS-DECLARED', sorted(found) == sorted(RESTORE)))
for name, original in RESTORE.items():
    pat = re.compile(r'^  // QA PWASTALL BEGIN ' + re.escape(name) + r'\n.*?^  // END PWASTALL ' + re.escape(name) + r'\n', re.M | re.S)
    hits = pat.findall(text)
    checks.append(('ONE-' + name.upper(), len(hits) == 1))
    text = pat.sub(lambda m: original, text, count=1)
checks.append(('NO-PWASTALL-LEFT', 'PWASTALL' not in text and 'limit(' not in text and 'stopServer' not in text))
checks.append(('BYTE-IDENTICAL-TO-ORIGINAL', text.encode('utf-8') == ORIG.read_bytes()))
for name, ok in checks:
    print(('PASS ' if ok else 'FAIL ') + name)
print('original sha256', hashlib.sha256(ORIG.read_bytes()).hexdigest())
print(f"{sum(ok for _, ok in checks)}/{len(checks)} checks passed")
raise SystemExit(0 if all(ok for _, ok in checks) else 1)
