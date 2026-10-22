'use strict';
// Cycle 5, Release 5a: the checks that need the deployed site, as one suite leaf. Builds the site from the live tree
// (python build.py writes dist/), then runs the splash harness (sheet and site), FT-32's harness and Phase 0.6's and
// the redirect fix's service-worker harnesses on it. Its children do not get the suite's splash switch (execArgv is
// not passed on): the splash harness tests both behaviours itself, and the others never tap the page.
//   node sw-checks.js <sheet.html>    (the live Phase 0 build: the site is built from the same tree)
const fs = require('fs'), path = require('path'), {spawnSync} = require('child_process');
const V = path.resolve(__dirname, '../..');
const REPO = path.resolve(V, '..');
const P = path.join(V, 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability');
const sheet = path.resolve(process.argv[2] || '');
if (!fs.existsSync(sheet)) { console.error('usage: sw-checks.js <sheet.html>'); process.exit(2); }
// The site is built from the live tree, so the sheet under test must be that tree's build.
if (!fs.readFileSync(sheet).equals(fs.readFileSync(path.join(P, 'l5r-character-sheet.html')))) {
  console.error('sw-checks.js: the sheet is not the live Phase 0 build; the site would not match it'); process.exit(2);
}
const build = spawnSync(process.env.L5R_PYTHON || 'python', ['-B', 'build.py'], {cwd: REPO, encoding: 'utf8', env: process.env, timeout: 600000});
if (build.status !== 0) { console.error('build.py failed\n' + build.stdout + build.stderr); process.exit(2); }
const DIST = path.join(REPO, 'dist');
const F = path.join(V, 'Part F — Cross-Platform Delivery');
const runs = [
  [path.join(F, 'PART F — Phase 0.6.2 Splash Screen/qa/splash-harness.js'), [sheet, DIST], 19],
  [path.join(F, 'PART F — Phase 0.6.1 Newest Version First/qa/newest-first-harness.js'), [DIST], 14],
  [path.join(F, 'PART F — Phase 0.6 Installable Web App/qa/update-harness.js'), [], 5],
  [path.join(F, 'PART F — Phase 0.6 Installable Web App/qa/pwa-harness.js'), [], 12],
  [path.join(V, 'BUGFIX — Service Worker Redirected Page/qa/sw-redirect-harness.js'), [DIST], 11],
];
let passed = 0, total = 0, bad = 0;
for (const [file, args, expected] of runs) {
  const r = spawnSync(process.execPath, [file, ...args], {cwd: path.dirname(path.dirname(file)), encoding: 'utf8',
    env: process.env, timeout: 1200000, maxBuffer: 64 * 1024 * 1024});
  const out = (r.stdout || '') + (r.stderr || '');
  process.stdout.write(out.replace(/(\d+)\/(\d+) checks passed/g, '$1 of $2 passed'));   // only the total below counts
  const m = [...out.matchAll(/(\d+)\/(\d+) checks passed/g)].at(-1);
  const got = m ? [Number(m[1]), Number(m[2])] : [0, 0];
  if (r.status !== 0 || got[1] !== expected || got[0] !== expected) { bad++; console.log('FAIL ' + path.basename(file) + ' ' + got.join('/') + ' expected ' + expected); }
  passed += got[0]; total += expected;
}
console.log(`\n${passed}/${total} checks passed`);
process.exit(bad ? 1 : 0);
