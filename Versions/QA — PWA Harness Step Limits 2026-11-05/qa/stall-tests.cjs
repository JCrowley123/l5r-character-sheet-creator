/* QA — PWA Harness Step Limits: proves the fix on purpose-made stalls.
   Usage (from anywhere): NODE_PATH=<playwright> node stall-tests.cjs
   Copies the ORIGINAL harness (../originals/pwa-harness.js) and the FIXED one
   (Phase 0.6's qa/pwa-harness.js) into a temporary folder, injects one stall into
   each copy, runs it with an outer limit, and checks the outcome. Neither source
   file is changed. Needs dist/ built (python build.py), as the harness does. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), {spawnSync} = require('child_process');

const HERE = __dirname;
const V = path.resolve(HERE, '..', '..');
const REPO = path.resolve(V, '..');
const ORIGINAL = path.join(HERE, '..', 'originals', 'pwa-harness.js');
const FIXED = path.join(V, 'Part F — Cross-Platform Delivery', 'PART F — Phase 0.6 Installable Web App', 'qa', 'pwa-harness.js');
const OUTER_MS = 150000;                       // well past the 60 s step limit

const ANCHOR = "  // ---- 5a. write character data before going offline ----------------------\n";
const STALLS = {
  // A client that asks for the 17.5 MB page and never reads it: the server cannot
  // finish that response, so a plain server.close() waits for it for ever.
  'held-connection': ANCHOR.replace(/^/, "  await new Promise((r) => { const s = require('net').connect(8091, '127.0.0.1', () => { s.write('GET /index.html HTTP/1.1\\r\\nHost: 127.0.0.1\\r\\n\\r\\n'); s.pause(); setTimeout(r, 500); }); s.on('error', () => {}); s.unref(); globalThis.__held = s; });\n"),
  // A page call that never returns.
  'page-never-answers': ANCHOR.replace(/^/, "  await page.evaluate(() => new Promise(() => {}));\n"),
};
const EXPECT = {
  original: {'held-connection': 'hang', 'page-never-answers': 'hang'},
  fixed: {'held-connection': 'pass', 'page-never-answers': 'stall-fail'},
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pwa-stall-'));
let bad = 0, n = 0;
const results = [];
for (const [which, file] of [['original', ORIGINAL], ['fixed', FIXED]]) {
  const src = fs.readFileSync(file, 'utf8')
    .replace("const REPO = path.resolve(__dirname, '..', '..', '..', '..');", 'const REPO = ' + JSON.stringify(REPO) + ';');
  if (!src.includes('const REPO = ' + JSON.stringify(REPO))) throw new Error('REPO line not found in ' + file);
  if (src.split(ANCHOR).length !== 2) throw new Error('anchor not found once in ' + file);
  for (const [name, inject] of Object.entries(STALLS)) {
    const copy = path.join(tmp, which + '-' + name + '.js');
    fs.writeFileSync(copy, src.replace(ANCHOR, inject));
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [copy], {encoding: 'utf8', env: process.env, timeout: OUTER_MS, maxBuffer: 64 << 20});
    const secs = Math.round((Date.now() - t0) / 1000);
    const out = (r.stdout || '') + (r.stderr || '');
    const passed = /12\/12 checks passed/.test(out) && r.status === 0;
    const stallLine = (out.match(/stalled: [^\n]*/) || [''])[0];
    const got = r.status === null ? 'hang' : passed ? 'pass' : stallLine ? 'stall-fail' : 'other-fail';
    const want = EXPECT[which][name];
    // A stall must be reported well inside sw-checks.js's 20-minute limit and must name where it happened.
    // A hang must be AT the injected stall: the sixth check printed, nothing from the offline step after it.
    const atStall = /index\.html is cached/.test(out) && !/loads with the network cut/.test(out);
    const ok = got === want && (got !== 'stall-fail' || (secs < 120 && /after "index.html is cached"/.test(stallLine)))
      && (got !== 'hang' || atStall);
    n++; if (!ok) bad++;
    results.push({which, name, want, got, secs, stallLine});
    console.log(`${ok ? 'PASS' : 'FAIL'} ${which.toUpperCase()}-${name.toUpperCase()}  — expected ${want}, got ${got} in ${secs} s${stallLine ? ': ' + stallLine : ''}`);
  }
}
fs.writeFileSync(path.join(HERE, 'stall-tests.json'), JSON.stringify({checkedUtc: new Date().toISOString(), results}, null, 2) + '\n');
console.log(`\n${n - bad}/${n} checks passed`);
process.exit(bad ? 1 : 0);
