'use strict';
// PART F — Phase 0.6.1 Newest Version First (FT-32). The first open after a release shows the release, not the saved
// copy; an open with no newer release, no answer in time, an error or no network still answers from the saved copy.
//   node qa/newest-first-harness.js <dist-dir>     (a built site: python build.py --out <dir>)
// Builds B and C are copies of the site with a marker and their own build id: a release, as the browser sees one.
const {chromium} = require('playwright');
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');

const DIST = path.resolve(process.argv[2] || '');
if (!fs.existsSync(path.join(DIST, 'index.html')) || !fs.existsSync(path.join(DIST, 'sw.js'))) {
  console.error('No built site at ' + DIST); process.exit(2);
}
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual) + ' want=' + JSON.stringify(want)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack).slice(0, 400), 'no exception'); } }
const TOTAL = 14;

// ---- The three builds ----
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-newest-'));
const ID_RE = /^const BUILD_ID = '([0-9a-f]+)';/m;
const idA = (fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8').match(ID_RE) || [])[1];
function release(name, id) {
  const dir = path.join(tmp, name);
  fs.cpSync(DIST, dir, {recursive: true});
  const page = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  fs.writeFileSync(path.join(dir, 'index.html'), page.replace('<head>', '<head>\n<meta name="l5r-test-build" content="' + name + '">'));
  const sw = fs.readFileSync(path.join(dir, 'sw.js'), 'utf8');
  fs.writeFileSync(path.join(dir, 'sw.js'), sw.replace(ID_RE, "const BUILD_ID = '" + id + "';"));
  return dir;
}
const BUILDS = {A: DIST, B: release('B', 'bbbbbbbbbbbbbbbb'), C: release('C', 'cccccccccccccccc')};
const IDS = {A: idA, B: 'bbbbbbbbbbbbbbbb', C: 'cccccccccccccccc'};

// ---- The server: which build it serves, and how slowly ----
const state = {build: 'A', swDelay: 0, swStatus: 200, pageDelay: 0, down: false};
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png'};
const server = http.createServer((req, res) => {
  if (state.down) { req.socket.destroy(); return; }   // no network: the connection fails at once
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const root = BUILDS[state.build];
  const file = path.join(root, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  const isSw = rel === '/sw.js', isPage = rel === '/' || rel === '/index.html';
  const send = () => {
    if (isSw && state.swStatus !== 200) { res.writeHead(state.swStatus); res.end('error'); return; }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    fs.createReadStream(file).pipe(res);
  };
  const delay = isSw ? state.swDelay : isPage ? state.pageDelay : 0;
  if (delay) setTimeout(send, delay); else send();
});

let browser, base;
const marker = page => page.evaluate(() => { const m = document.querySelector('meta[name="l5r-test-build"]'); return m ? m.content : 'A'; });
const answeredAt = page => page.evaluate(() => Math.round(performance.getEntriesByType('navigation')[0].responseStart));
// A context whose worker controls the page and has saved build `name`'s page.
async function installed(name) {
  Object.assign(state, {build: name, swDelay: 0, swStatus: 200, pageDelay: 0, down: false});
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base, {timeout: 120000});
  await page.waitForFunction(async id => {
    if (!navigator.serviceWorker.controller) return false;
    const keys = await caches.keys();
    if (!keys.includes('l5r-sheet-' + id)) return false;
    return !!(await (await caches.open('l5r-sheet-' + id)).match('./index.html'));
  }, IDS[name], {timeout: 120000, polling: 250});
  return {context, page};
}
async function reopen(page) { await page.reload({timeout: 120000, waitUntil: 'domcontentloaded'}); return [await marker(page), await answeredAt(page)]; }

async function main() {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/';
  browser = await chromium.launch();
  try {
    check('N-BUILDS-DIFFER', [!!idA, new Set(Object.values(IDS)).size], [true, 3]);
    check('N-SWITCH', /^const NEWEST_FIRST_ENABLED = true;/m.test(fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8')), true);

    // A release since the last open: the first open shows it.
    await section('N-RELEASE', async () => {
      const {context, page} = await installed('A');
      state.build = 'B';
      check('N-FIRST-OPEN-SHOWS-RELEASE', (await reopen(page))[0], 'B');
      // The release is then saved for offline use by its own worker.
      await page.waitForFunction(async () => (await caches.keys()).includes('l5r-sheet-bbbbbbbbbbbbbbbb'), null, {timeout: 120000, polling: 250});
      await page.waitForFunction(async () => !!(await (await caches.open('l5r-sheet-bbbbbbbbbbbbbbbb')).match('./index.html')), null, {timeout: 120000, polling: 250});
      await context.setOffline(true); state.down = true;
      check('N-RELEASE-THEN-OFFLINE', (await reopen(page))[0], 'B');
      await context.close();
    });

    // No release: the saved copy answers without waiting for the page download.
    await section('N-SAME', async () => {
      const {context, page} = await installed('A');
      state.pageDelay = 6000;
      const [build, at] = await reopen(page);
      check('N-SAME-BUILD-SAVED-COPY', build, 'A');
      check('N-SAME-BUILD-NO-PAGE-WAIT', at < 1800, true);
      await context.close();
    });

    // The check answers late: the saved copy, after the check's limit (about 2 s).
    await section('N-SLOW-CHECK', async () => {
      const {context, page} = await installed('A');
      Object.assign(state, {build: 'C', swDelay: 5000});
      const [build, at] = await reopen(page);
      check('N-SLOW-CHECK-SAVED-COPY', build, 'A');
      check('N-SLOW-CHECK-WAITS-ITS-LIMIT', at >= 1800 && at < 4500, true);
      await context.close();
    });

    // The check fails, or there is no network: the saved copy, at once.
    await section('N-ERROR', async () => {
      const {context, page} = await installed('A');
      Object.assign(state, {build: 'C', swStatus: 500});
      const [build, at] = await reopen(page);
      check('N-CHECK-ERROR-SAVED-COPY', [build, at < 1800], ['A', true]);
      await context.close();
    });
    await section('N-OFFLINE', async () => {
      const {context, page} = await installed('A');
      state.build = 'C';
      await context.setOffline(true); state.down = true;
      const [build, at] = await reopen(page);
      check('N-OFFLINE-SAVED-COPY', [build, at < 1800], ['A', true]);
      await context.close();
    });

    // A release whose page arrives too slowly: the saved copy after the page's limit (about 8 s); the release follows.
    await section('N-SLOW-PAGE', async () => {
      const {context, page} = await installed('A');
      Object.assign(state, {build: 'C', pageDelay: 12000});
      const [build, at] = await reopen(page);
      check('N-SLOW-RELEASE-SAVED-COPY', build, 'A');
      check('N-SLOW-RELEASE-WAITS-ITS-LIMIT', at >= 7500 && at < 11000, true);
      state.pageDelay = 0;
      await page.waitForFunction(async () => !!(await (await caches.open('l5r-sheet-cccccccccccccccc')).match('./index.html')), null, {timeout: 120000, polling: 250});
      check('N-SLOW-RELEASE-NEXT-OPEN', (await reopen(page))[0], 'C');
      await context.close();
    });

    // The first visit, with nothing saved, loads from the network as before.
    await section('N-FIRST-VISIT', async () => {
      Object.assign(state, {build: 'C', pageDelay: 0, down: false});
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(base, {timeout: 120000});
      check('N-FIRST-VISIT-LOADS', await marker(page), 'C');
      await context.close();
    });
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(tmp, {recursive: true, force: true});
  }
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed` + (results.length === TOTAL ? '' : ` (expected ${TOTAL} checks)`));
  process.exit(failed || results.length !== TOTAL ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
