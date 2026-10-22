'use strict';
// PART F — Phase 0.6.2 Splash Screen (FT-32's other half). From the first paint a splash covers the page; it stays at
// least 5 s and until the sheet is ready, a tap after ready dismisses it, and it leaves on a script error or without
// the main script too, so the page is never stuck. Cycle 5 Release 5a.2: the owner's artwork by screen shape, and the
// test suite's switch (qa/splash-fast.cjs) that keeps 5a's behaviour (leave at ready, taps pass through).
//   node qa/splash-harness.js <sheet.html> <dist-dir>
// Checks the logic's contract (cover, take taps, stay, leave, never stuck) and, since 5a.2, that the picture fits the
// screen's shape and is shown whole; a new design with art by shape keeps passing.
const fs = require('fs'), os = require('os'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const {installSplashFast} = require('./splash-fast.cjs');
const SHEET = path.resolve(process.argv[2] || ''), DIST = path.resolve(process.argv[3] || '');
if (!fs.existsSync(SHEET) || !fs.existsSync(path.join(DIST, 'index.html'))) { console.error('usage: splash-harness.js <sheet.html> <dist-dir>'); process.exit(2); }
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 400) + ' want=' + JSON.stringify(want)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack).slice(0, 400), 'no exception'); } }
const TOTAL = 19;
const MAIN_SCRIPT = '<script>\n(function(){\n  const RINGS';

const html = fs.readFileSync(SHEET, 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-splash-'));
const variant = (name, text) => { const f = path.join(tmp, name + '.html'); fs.writeFileSync(f, text); return pathToFileURL(f).href; };
// The page as the first paint has it: everything before the main script, which then never arrives.
const noScript = variant('no-main-script', html.slice(0, html.indexOf(MAIN_SCRIPT)));
// The main script failing at its first statement.
const broken = variant('script-error', html.replace(MAIN_SCRIPT, '<script>\nthrow new Error("splash test");\n(function(){\n  const RINGS'));
const full = pathToFileURL(SHEET).href;

// When the splash arrived, when the sheet said it was ready, when each splash node left the page, and every click:
// on the splash or on the page beneath (performance.now()). Clicks are recorded and never acted on.
const watch = () => {
  window.__splash = {added: null, ready: [], gone: {}, dcl: null, clicks: []};
  document.addEventListener('l5r-sheet-ready', () => window.__splash.ready.push(performance.now()));
  document.addEventListener('DOMContentLoaded', () => { window.__splash.dcl = performance.now(); });
  document.addEventListener('click', e => {
    e.preventDefault();
    window.__splash.clicks.push({on: e.target.closest && e.target.closest('#l5rSplash') ? 'splash' : 'page', at: performance.now()});
  }, true);
  new MutationObserver(records => records.forEach(r => {
    r.addedNodes.forEach(n => { if (n.id === 'l5rSplash') window.__splash.added = performance.now(); });
    r.removedNodes.forEach(n => {
      if (n.id === 'l5rSplash') window.__splash.gone.splash = performance.now();
      if (n.nodeName === 'SCRIPT' && /l5rSplash/.test(n.textContent)) window.__splash.gone.script = performance.now();
    });
  })).observe(document, {childList: true, subtree: true});
};
// Waits up to ms for fn; a timeout is a result (read after), never an aborted run.
const until = async (page, fn, ms) => {
  try { await page.waitForFunction(fn, null, {timeout: ms}); } catch (e) { if (!/Timeout/.test(String(e))) throw e; }
};
const display = page => page.evaluate(() => { const e = document.getElementById('l5rSplash'); return e ? getComputedStyle(e).display : 'absent'; });
const cover = page => page.evaluate(() => {
  const el = document.getElementById('l5rSplash');
  if (!el) return null;
  const s = getComputedStyle(el), r = el.getBoundingClientRect();
  return {covers: r.left <= 0 && r.top <= 0 && r.right >= innerWidth && r.bottom >= innerHeight,
    shown: s.display !== 'none' && s.visibility === 'visible' && s.opacity === '1',
    onTop: +s.zIndex >= 2147483000, position: s.position, pointer: s.pointerEvents, gestures: s.touchAction,
    content: el.textContent.trim().length > 0};
});
const sheetReady = page => page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 120000});
// The picture on screen: its shape (from its own pixels) and whether it is shown whole.
const picture = async page => {
  await until(page, () => { const i = document.querySelector('#l5rSplash img'); return i && i.complete && i.naturalWidth > 0; }, 10000);
  return page.evaluate(() => {
    const i = document.querySelector('#l5rSplash img');
    if (!i || !i.naturalWidth) return 'no picture';
    const ratio = i.naturalWidth / i.naturalHeight;
    return (ratio < 0.8 ? 'portrait' : ratio > 1.25 ? 'wide' : 'square') + ' ' + getComputedStyle(i).objectFit;
  });
};

async function main() {
  const browser = await chromium.launch();
  const open = async (url, opts = {}, fast = false) => {
    const context = await browser.newContext(Object.assign({viewport: {width: 390, height: 844}}, opts));
    if (fast) await context.addInitScript(() => { window.__L5R_SPLASH_FAST__ = true; });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.addInitScript(watch);
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 120000});
    return {context, page, errors};
  };
  try {
    check('S-SWITCH', /\n  var SPLASH_ENABLED = true;\n  var SPLASH_MIN_MS = 5000;\n/.test(html), true);

    // The first paint, before the main script has run.
    await section('S-FIRST-PAINT', async () => {
      const {context, page} = await open(noScript);
      check('S-COVERS-AT-FIRST-PAINT', await cover(page), {covers: true, shown: true, onTop: true, position: 'fixed', pointer: 'auto',
        gestures: 'none', content: true});
      await page.waitForTimeout(3000);
      check('S-STAYS-UNTIL-READY', !!(await page.$('#l5rSplash')), true);
      await page.emulateMedia({media: 'print'});
      check('S-NOT-PRINTED', await display(page), 'none');
      await page.emulateMedia({media: 'screen'});
      // Never stuck: with no main script, it leaves about 10 s after the page has parsed.
      await until(page, () => window.__splash.gone.splash, 20000);
      const t = await page.evaluate(() => window.__splash.gone.splash - window.__splash.dcl);
      check('S-LEAVES-WITHOUT-THE-SCRIPT', t >= 9500 && t < 12000, true);
      await context.close();
    });

    // Before the sheet is ready a tap does nothing: the splash stays and the page beneath never sees it.
    await section('S-TAP-BEFORE-READY', async () => {
      const {context, page} = await open(noScript);
      await page.mouse.click(195, 422);
      await page.waitForTimeout(1000);
      check('S-TAP-BEFORE-READY-IGNORED', [!!(await page.$('#l5rSplash')), (await page.evaluate(() => window.__splash.clicks)).map(c => c.on)],
        [true, ['splash']]);
      await context.close();
    });

    // Once the sheet is ready (the signal sent by hand, well inside the 5 s) a tap dismisses it at once, and a second
    // tap while it fades already reaches the page.
    await section('S-TAP-AFTER-READY', async () => {
      const {context, page} = await open(noScript);
      await page.evaluate(() => document.dispatchEvent(new Event('l5r-sheet-ready')));
      await page.mouse.click(195, 422);
      await page.mouse.click(195, 422);
      await until(page, () => window.__splash.gone.splash, 10000);
      const s = await page.evaluate(() => window.__splash);
      check('S-TAP-AFTER-READY-DISMISSES', [s.clicks.map(c => c.on), s.clicks.length ? s.gone.splash - s.clicks[0].at < 1500 : null,
        s.clicks.length ? s.clicks[0].at - s.added < 4000 : null], [['splash', 'page'], true, true]);
      await context.close();
    });

    // The main script fails: the splash leaves at once.
    await section('S-ERROR', async () => {
      const {context, page} = await open(broken);
      await until(page, () => window.__splash.gone.splash, 20000);
      check('S-LEAVES-ON-A-SCRIPT-ERROR', await page.evaluate(() => window.__splash.gone.splash - window.__splash.dcl) < 2000, true);
      await context.close();
    });

    // A normal open: it stays at least 5 s although the sheet is ready sooner, then fades and takes its script with it.
    await section('S-READY', async () => {
      const {context, page, errors} = await open(full);
      await sheetReady(page);
      await until(page, () => window.__splash.gone.splash && window.__splash.gone.script, 20000);
      const s = await page.evaluate(() => window.__splash);
      check('S-READY-ONCE', s.ready.length, 1);
      check('S-STAYS-AT-LEAST-5S', s.gone.splash - s.added >= 5000, true);
      const fade = s.gone.splash - Math.max(s.ready[0], s.added + 5000);
      check('S-FADES-AFTER-READY-AND-5S', fade >= 250 && fade < 1500, true);
      check('S-GONE-WITH-ITS-SCRIPT', [await page.$('#l5rSplash'), Math.abs(s.gone.script - s.gone.splash) < 50], [null, true]);
      await page.waitForTimeout(500);
      check('S-NO-PAGE-ERRORS', errors, []);
      await context.close();
    });

    // One picture by screen shape: a phone, a foldable opened out, a laptop. Always whole (contain).
    await section('S-ART', async () => {
      const shown = [];
      for (const viewport of [{width: 390, height: 844}, {width: 900, height: 900}, {width: 1280, height: 720}]) {
        const {context, page} = await open(noScript, {viewport});
        shown.push(await picture(page));
        await context.close();
      }
      check('S-ART-BY-SHAPE', shown, ['portrait contain', 'square contain', 'wide contain']);
    });

    // The test switch: leaves as soon as the sheet is ready, fading, and lets taps through (5a's behaviour).
    await section('S-TEST-SWITCH', async () => {
      const {context, page} = await open(full, {}, true);
      const pointer = (await cover(page) || {}).pointer;
      await sheetReady(page);
      await until(page, () => window.__splash.gone.splash, 20000);
      const fade = await page.evaluate(() => window.__splash.gone.splash - window.__splash.ready[0]);
      check('S-TEST-SWITCH', [pointer, fade >= 250 && fade < 1500], ['none', true]);
      await context.close();
    });

    await section('S-REDUCED-MOTION', async () => {
      const {context, page} = await open(full, {reducedMotion: 'reduce'}, true);
      await sheetReady(page);
      await until(page, () => window.__splash.gone.splash, 20000);
      check('S-REDUCED-MOTION-NO-FADE', await page.evaluate(() => window.__splash.gone.splash - window.__splash.ready[0]) < 100, true);
      await context.close();
    });

    await section('S-NOSCRIPT', async () => {
      const {context, page} = await open(full, {javaScriptEnabled: false});
      check('S-HIDDEN-WITHOUT-JAVASCRIPT', await display(page), 'none');
      await context.close();
    });

    // The suite's preload sets the switch for pages from browser.newContext() and from browser.newPage(). It is
    // installed on a stand-in for chromium, so this harness's own browser keeps the real splash.
    await section('S-SUITE-PRELOAD', async () => {
      const second = await installSplashFast({launch: (...a) => chromium.launch(...a)}).launch();
      try {
        const flags = [];
        for (const p of [await (await second.newContext()).newPage(), await second.newPage()]) {
          await p.goto(noScript, {waitUntil: 'domcontentloaded', timeout: 120000});
          flags.push(await p.evaluate(() => {
            const e = document.getElementById('l5rSplash');
            return [window.__L5R_SPLASH_FAST__, e ? getComputedStyle(e).pointerEvents : 'absent'];
          }));
        }
        check('S-SUITE-PRELOAD-SETS-THE-SWITCH', flags, [[true, 'none'], [true, 'none']]);
      } finally { await second.close(); }
    });

    // The deployed page: the PWA head goes in before </head>; the splash stays the first thing in the body.
    check('S-FIRST-IN-THE-DEPLOYED-BODY', /<body class="car-active">\n<!-- PART F PHASE 0\.6\.2 BEGIN splash-design -->\n/.test(
      fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')), true);
  } finally {
    await browser.close();
    fs.rmSync(tmp, {recursive: true, force: true});
  }
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed` + (results.length === TOTAL ? '' : ` (expected ${TOTAL} checks)`));
  process.exit(failed || results.length !== TOTAL ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
