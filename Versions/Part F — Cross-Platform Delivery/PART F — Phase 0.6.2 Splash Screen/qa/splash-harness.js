'use strict';
// PART F — Phase 0.6.2 Splash Screen (FT-32's other half). From the first paint a splash covers the page until the
// sheet is ready, and it leaves on a script error or without the main script too, so the page is never stuck.
//   node qa/splash-harness.js <sheet.html> <dist-dir>
// Checks the logic's contract only (cover, leave, never stuck), never the look, so a new design keeps passing.
const fs = require('fs'), os = require('os'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
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
const TOTAL = 13;
const MAIN_SCRIPT = '<script>\n(function(){\n  const RINGS';

const html = fs.readFileSync(SHEET, 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-splash-'));
const variant = (name, text) => { const f = path.join(tmp, name + '.html'); fs.writeFileSync(f, text); return pathToFileURL(f).href; };
// The page as the first paint has it: everything before the main script, which then never arrives.
const noScript = variant('no-main-script', html.slice(0, html.indexOf(MAIN_SCRIPT)));
// The main script failing at its first statement.
const broken = variant('script-error', html.replace(MAIN_SCRIPT, '<script>\nthrow new Error("splash test");\n(function(){\n  const RINGS'));
const full = pathToFileURL(SHEET).href;

// When the sheet said it was ready, and when each splash node left the page (performance.now()).
const watch = () => {
  window.__splash = {ready: [], gone: {}, dcl: null};
  document.addEventListener('l5r-sheet-ready', () => window.__splash.ready.push(performance.now()));
  document.addEventListener('DOMContentLoaded', () => { window.__splash.dcl = performance.now(); });
  new MutationObserver(records => records.forEach(r => r.removedNodes.forEach(n => {
    if (n.id === 'l5rSplash') window.__splash.gone.splash = performance.now();
    if (n.nodeName === 'SCRIPT' && /l5rSplash/.test(n.textContent)) window.__splash.gone.script = performance.now();
  }))).observe(document, {childList: true, subtree: true});
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
    onTop: +s.zIndex >= 2147483000, position: s.position, pointer: s.pointerEvents, content: el.textContent.trim().length > 0};
});

async function main() {
  const browser = await chromium.launch();
  const open = async (url, opts = {}) => {
    const context = await browser.newContext(Object.assign({viewport: {width: 390, height: 844}}, opts));
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.addInitScript(watch);
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 120000});
    return {context, page, errors};
  };
  try {
    check('S-SWITCH', /\n  var SPLASH_ENABLED = true;\n/.test(html), true);

    // The first paint, before the main script has run.
    await section('S-FIRST-PAINT', async () => {
      const {context, page} = await open(noScript);
      check('S-COVERS-AT-FIRST-PAINT', await cover(page), {covers: true, shown: true, onTop: true, position: 'fixed', pointer: 'none', content: true});
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

    // The main script fails: the splash leaves at once.
    await section('S-ERROR', async () => {
      const {context, page} = await open(broken);
      await until(page, () => window.__splash.gone.splash, 20000);
      check('S-LEAVES-ON-A-SCRIPT-ERROR', await page.evaluate(() => window.__splash.gone.splash - window.__splash.dcl) < 2000, true);
      await context.close();
    });

    // A normal open: it leaves once the sheet is ready, fading, and takes its script with it.
    await section('S-READY', async () => {
      const {context, page, errors} = await open(full);
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 120000});
      await until(page, () => window.__splash.gone.splash && window.__splash.gone.script, 20000);
      const s = await page.evaluate(() => window.__splash);
      check('S-READY-ONCE', s.ready.length, 1);
      const fade = s.gone.splash - s.ready[0];
      check('S-FADES-AFTER-READY', fade >= 250 && fade < 1500, true);
      check('S-GONE-WITH-ITS-SCRIPT', [await page.$('#l5rSplash'), Math.abs(s.gone.script - s.gone.splash) < 50], [null, true]);
      await page.waitForTimeout(500);
      check('S-NO-PAGE-ERRORS', errors, []);
      await context.close();
    });

    await section('S-REDUCED-MOTION', async () => {
      const {context, page} = await open(full, {reducedMotion: 'reduce'});
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 120000});
      await until(page, () => window.__splash.gone.splash, 20000);
      check('S-REDUCED-MOTION-NO-FADE', await page.evaluate(() => window.__splash.gone.splash - window.__splash.ready[0]) < 100, true);
      await context.close();
    });

    await section('S-NOSCRIPT', async () => {
      const {context, page} = await open(full, {javaScriptEnabled: false});
      check('S-HIDDEN-WITHOUT-JAVASCRIPT', await display(page), 'none');
      await context.close();
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
