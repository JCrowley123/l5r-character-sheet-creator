/* =============================================================================
   PHASE 0.6 — UPDATE DELIVERY

     NODE_PATH=$(npm root -g) node qa/update-harness.js

   Proves the roadmap's update-delivery requirement: "a new deployment is picked
   up the next time the installed app is opened while online."

   This is the one part of the service worker that can fail silently and badly.
   A cache-first worker with a fixed cache name serves the first build it ever
   saw, forever; nobody gets an error, everyone just quietly stops receiving
   updates. So it is tested rather than reasoned about.

   The mechanism under test: sw.js carries BUILD_ID, stamped by the build with
   the sha256 of index.html. A browser reinstalls a worker only when the
   worker's own bytes change, so the hash is what makes a new deploy visible to
   an installed app at all.

   The sequence, against a server whose content is swapped underneath:

     1. serve build A, load, let the worker install and cache
     2. swap the served files to build B (new index.html, new BUILD_ID)
     3. reload  -> stale-while-revalidate: still A, B fetched in background
     4. reload  -> B

   Step 3 returning A is correct, not a failure. It is what keeps the sheet
   instant on a bad phone signal.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');

/* See qa/pwa-harness.js: L5R_CHROME overrides the browser binary when the
   machine already has a Chromium that Playwright did not download itself. */
const LAUNCH = process.env.L5R_CHROME
  ? { executablePath: process.env.L5R_CHROME }
  : {};
const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const DIST = path.join(REPO, 'dist');
const PORT = 8092;

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
};

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('No dist/index.html — run `python3 build.py` first.');
    process.exit(2);
  }

  // Build A is what is on disk. Build B is A with a marker injected and its
  // sw.js re-stamped, exactly as a real rebuild would produce.
  const htmlA = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const swTemplate = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');

  // Inject the marker after <title>, not before the closing head tag. The head
  // block this phase injects used to mention that tag in a prose comment, so
  // the built page briefly contained two -- and a naive replace hit the one
  // inside the comment, where the marker was never parsed and the test failed
  // for a reason that had nothing to do with the worker. <title> appears once,
  // in the sheet's own head, and is not going to move.
  const TITLE_END = '</title>';
  if (htmlA.split(TITLE_END).length - 1 !== 1) {
    console.error(`expected exactly one ${TITLE_END} in the built page`);
    process.exit(2);
  }
  const htmlB = htmlA.replace(
    TITLE_END, TITLE_END + '\n<meta name="l5r-build-marker" content="B">');
  const hashB = crypto.createHash('sha256').update(htmlB).digest('hex').slice(0, 16);
  const swB = swTemplate.replace(/const BUILD_ID = '[^']*'/, `const BUILD_ID = '${hashB}'`);

  const hashA = crypto.createHash('sha256').update(htmlA).digest('hex').slice(0, 16);
  console.log(`\nUpdate delivery test`);
  console.log(`  build A BUILD_ID ${hashA}`);
  console.log(`  build B BUILD_ID ${hashB}\n`);

  let serving = 'A';
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/') rel = '/index.html';

    const send = (body, type) => {
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(body);
    };
    if (rel === '/index.html') return send(serving === 'A' ? htmlA : htmlB, TYPES['.html']);
    if (rel === '/sw.js') return send(serving === 'A' ? swTemplate : swB, TYPES['.js']);

    const file = path.join(DIST, rel);
    if (!file.startsWith(DIST) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  const url = `http://127.0.0.1:${PORT}/`;

  const browser = await chromium.launch(LAUNCH);
  const context = await browser.newContext();
  const page = await context.newPage();

  const marker = () => page.evaluate(
    `(() => { const m = document.querySelector('meta[name="l5r-build-marker"]');
              return m ? m.content : 'A'; })()`);
  const buildId = () => page.evaluate(async () => {
    const names = await caches.keys();
    const mine = names.filter((n) => n.startsWith('l5r-sheet-'));
    return mine.length ? mine[0].replace('l5r-sheet-', '') : null;
  });

  // ---- 1. first visit: build A ------------------------------------------
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(2500);
  record('first visit serves build A', (await marker()) === 'A', `marker=${await marker()}`);
  record('cache named for build A', (await buildId()) === hashA, `cache=${await buildId()}`);

  // ---- 2. deploy build B -------------------------------------------------
  serving = 'B';

  // ---- 3. next open: still A, B fetched behind it -------------------------
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(3000);          // let SWR's background fetch + SW update land
  const second = await marker();
  record('reload right after deploy still serves A (stale-while-revalidate)',
    second === 'A',
    `marker=${second} — serving cache instantly is the point, not a miss`);

  // ---- 4. the open after that: B -----------------------------------------
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(3000);
  let third = await marker();
  if (third !== 'B') {                       // allow one more cycle for SW takeover
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(3000);
    third = await marker();
  }
  record('a later open picks up build B', third === 'B', `marker=${third}`);

  const finalCache = await buildId();
  record('cache rolled over to build B, old cache dropped',
    finalCache === hashB, `cache=${finalCache}`);

  await browser.close();
  await new Promise((r) => server.close(r));

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('\nFailed:');
    failed.forEach((f) => console.log(`  - ${f.name}${f.detail ? ': ' + f.detail : ''}`));
    process.exit(1);
  }
  console.log('\nUpdate delivery verified: a new deploy reaches an installed app.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
