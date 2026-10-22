'use strict';
// PART F — Phase 0.6.3 Offline Notice After the Splash (Cycle 5 Release 5b). Phase 0.6's one-time "Ready to use
// offline" notice waits while the splash screen covers the page, then shows as before (3.2 s, once per device).
//   node qa/notice-harness.js <dist-dir>     (a built site: python build.py --out <dir>)
// Runs with the real splash (at least 5 s): the suite's splash switch is not preloaded here.
// The ready message is sent by hand in most sections (service workers blocked), so the timing is the test's own;
// the last section is a real first visit with the worker.
const {chromium} = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

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
const TOTAL = 12;
const NOTICE = 'Ready to use offline', FLAG = 'l5r-offline-announced';

const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png'};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(DIST, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(DIST) || !fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
  fs.createReadStream(file).pipe(res);
});

// Watches the page from its first script: when the splash goes, each notice that appears (and whether the splash was
// still up), how many notices at once, and whether the once-per-device mark was saved while the splash was up.
const MONITOR = ([notice, flag]) => {
  const T = window.__N063 = {seen: 0, max: 0, withSplash: false, flagWithSplash: false, splashSeen: false,
    splashGoneAt: null, noticeAt: null, noticeGoneAt: null};
  const known = new WeakSet();
  const look = () => {
    const splash = !!document.getElementById('l5rSplash');
    if (splash) T.splashSeen = true;
    else if (T.splashSeen && T.splashGoneAt === null) T.splashGoneAt = performance.now();
    const list = Array.from(document.querySelectorAll('div[role="status"]')).filter(d => d.textContent === notice);
    list.forEach(n => {
      if (known.has(n)) return;
      known.add(n); T.seen++;
      if (T.noticeAt === null) T.noticeAt = performance.now();
      if (splash) T.withSplash = true;
    });
    T.max = Math.max(T.max, list.length);
    if (T.noticeAt !== null && !list.length && T.noticeGoneAt === null) T.noticeGoneAt = performance.now();
    try { if (splash && localStorage.getItem(flag) === '1') T.flagWithSplash = true; } catch (e) { /* private mode */ }
  };
  new MutationObserver(look).observe(document, {childList: true, subtree: true});
  setInterval(look, 50);
};
// Private browsing: the mark cannot be read or saved (only that key; the sheet's own storage is untouched).
const PRIVATE = flag => {
  const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
  Storage.prototype.getItem = function (k) { if (k === flag) throw new DOMException('denied', 'SecurityError'); return get.call(this, k); };
  Storage.prototype.setItem = function (k, v) { if (k === flag) throw new DOMException('denied', 'SecurityError'); return set.call(this, k, v); };
};
const ready = page => page.evaluate(() => navigator.serviceWorker.dispatchEvent(
  new MessageEvent('message', {data: {type: 'l5r-offline-ready'}})));
const state = page => page.evaluate(() => Object.assign({splashUp: !!document.getElementById('l5rSplash')}, window.__N063));
const flagOf = page => page.evaluate(f => { try { return localStorage.getItem(f); } catch (e) { return 'unreadable'; } }, FLAG);

let browser, base;
async function open({workers = false, privateMode = false} = {}) {
  const context = await browser.newContext({serviceWorkers: workers ? 'allow' : 'block'});
  if (privateMode) await context.addInitScript(PRIVATE, FLAG);
  await context.addInitScript(MONITOR, [NOTICE, FLAG]);
  const page = await context.newPage();
  await page.goto(base, {timeout: 120000, waitUntil: 'commit'});
  await page.waitForFunction(() => !!document.getElementById('l5rSplash') && !!window.__N063, null, {timeout: 60000});
  return {context, page};
}
const splashGone = page => page.waitForFunction(() => !document.getElementById('l5rSplash'), null, {timeout: 60000, polling: 50});

async function main() {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port + '/';
  browser = await chromium.launch();
  try {
    check('O-SWITCH', /var NOTICE_AFTER_SPLASH_ENABLED = true;/.test(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')), true);

    // The ready message arrives while the splash is up: held, then shown once it has gone.
    await section('O-HELD', async () => {
      const {context, page} = await open();
      await ready(page);
      // Something else adds to the page meanwhile (as a toast or a dialog does): the notice still waits.
      await page.evaluate(() => { const d = document.body.appendChild(document.createElement('div')); setTimeout(() => d.remove(), 200); });
      await page.waitForTimeout(1000);
      const held = await state(page);
      check('O-HELD-NO-NOTICE', [held.splashUp, held.seen], [true, 0]);
      check('O-HELD-MARK-NOT-SAVED', [held.splashUp, await flagOf(page)], [true, null]);
      await splashGone(page);
      await page.waitForFunction(() => window.__N063.noticeGoneAt !== null, null, {timeout: 15000, polling: 50}).catch(() => {});
      const after = await state(page);
      check('O-SHOWN-AFTER-SPLASH', [after.seen, after.withSplash, after.noticeAt - after.splashGoneAt < 1000,
        after.noticeAt >= after.splashGoneAt], [1, false, true, true]);
      check('O-MARK-SAVED', [after.flagWithSplash, await flagOf(page)], [false, '1']);
      const shownFor = after.noticeGoneAt - after.noticeAt;
      check('O-LEAVES-AS-BEFORE', shownFor >= 3100 && shownFor < 4800, true);
      await ready(page);
      await page.waitForTimeout(800);
      check('O-ONCE', (await state(page)).seen, 1);
      await context.close();
    });

    // With no splash on the page the notice shows at once, as before this layer.
    await section('O-NO-SPLASH', async () => {
      const {context, page} = await open();
      await splashGone(page);
      const sent = await page.evaluate(() => performance.now());
      await ready(page);
      await page.waitForFunction(() => window.__N063.noticeAt !== null, null, {timeout: 5000, polling: 25}).catch(() => {});
      const s = await state(page);
      check('O-NO-SPLASH-AT-ONCE', s.noticeAt !== null && s.noticeAt - sent < 500, true);
      await context.close();
    });

    // Private browsing: the mark cannot be saved, so two ready messages under the splash must still give one notice.
    await section('O-PRIVATE', async () => {
      const {context, page} = await open({privateMode: true});
      await ready(page);
      await ready(page);
      await splashGone(page);
      await page.waitForFunction(() => window.__N063.noticeAt !== null, null, {timeout: 5000, polling: 50}).catch(() => {});
      await page.waitForTimeout(600);
      const s = await state(page);
      check('O-PRIVATE-ONE-NOTICE-AFTER-SPLASH', [s.seen, s.max, s.withSplash], [1, 1, false]);
      await context.close();
    });

    // A real first visit: the worker saves the site and says so; the notice comes after the splash.
    await section('O-FIRST-VISIT', async () => {
      const {context, page} = await open({workers: true});
      await page.waitForFunction(() => window.__N063.noticeAt !== null, null, {timeout: 90000, polling: 100}).catch(() => {});
      const s = await state(page);
      const controlled = await page.evaluate(() => navigator.serviceWorker.ready.then(r => !!r.active));
      check('O-FIRST-VISIT-SEEN', [s.seen, controlled], [1, true]);
      check('O-FIRST-VISIT-AFTER-SPLASH', [s.withSplash, s.splashGoneAt !== null && s.noticeAt >= s.splashGoneAt], [false, true]);
      check('O-FIRST-VISIT-MARK', [s.flagWithSplash, await flagOf(page)], [false, '1']);
      await context.close();
    });
  } finally {
    await browser.close();
    server.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL check count ' + results.length + ' expected ' + TOTAL);
  console.log(`\n${passed}/${TOTAL} checks passed`);
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
