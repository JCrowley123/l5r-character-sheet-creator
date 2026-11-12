'use strict';
// Release 15a, finding A17 (FT-41; PART H PHASE 15.1.27): the splash fills the screen without cutting off the title
// (owner's approval of the mock-up, 12 November 2026).   node splash-fill-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: which picture the browser chose (its own pixel size), the picture's drawn box
// worked out from its computed fit and position, where the title and the red seal lie in each picture (measured once
// from the artwork's pixels, below), and the same page with the unit's class taken away (put back only if it was there).
// Shapes are checked on the page as the first paint has it (everything before the main script), so the splash stays
// up while it is measured; staying and leaving are checked on the whole page with the real splash (the suite's fast
// switch is turned off here, as the splash's own harness does for its own checks).
const fs = require('fs'), os = require('os'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const SHEET = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
// Where the title (L5R and Character Creator) and the red seal on the scroll lie in each picture, as fractions of its
// width and height: dark ink and red pixels measured on the artwork, rounded outwards (G4's qa/artboxes.py).
const ART = {
  portrait: {size: [853, 1843], title: [0.29, 0.25, 0.76, 0.40], seal: [0.31, 0.59, 0.37, 0.63]},
  square: {size: [2000, 2000], title: [0.36, 0.13, 0.66, 0.36], seal: [0.37, 0.64, 0.42, 0.69]},
  landscape: {size: [2000, 1125], title: [0.10, 0.34, 0.36, 0.66], seal: [0.58, 0.58, 0.62, 0.65]}
};
const want = (w, h) => w / h <= 2 / 3 ? 'portrait' : w / h >= 3 / 2 ? 'landscape' : 'square';
const SHAPES = {'PHONE-APP': [390, 844], 'PHONE-SAFARI': [390, 664], 'PHONE-LANDSCAPE': [844, 390], 'NARROW-LANDSCAPE': [844, 340],
  'TABLET-PORTRAIT': [768, 1024], 'TABLET-LANDSCAPE': [1024, 768], 'LAPTOP': [1440, 1000], 'LAPTOP-16X9': [1536, 864], 'LAPTOP-BROWSER': [1366, 650]};
const MAIN_SCRIPT = '<script>\n(function(){\n  const RINGS';
const html = fs.readFileSync(SHEET, 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-splash-fill-'));
const firstPaint = path.join(tmp, 'first-paint.html');
fs.writeFileSync(firstPaint, html.slice(0, html.indexOf(MAIN_SCRIPT)));

// The picture as drawn: which one, its fit, and the boxes of the title and seal on screen.
function measure() {
  const img = document.querySelector('#l5rSplash img'), splash = document.getElementById('l5rSplash');
  if (!img || !img.naturalWidth) return {missing: true};
  const s = getComputedStyle(img), r = img.getBoundingClientRect(), nw = img.naturalWidth, nh = img.naturalHeight;
  const fit = s.objectFit, pos = s.objectPosition.split(' ').map(v => parseFloat(v) / 100);
  const scale = fit === 'cover' ? Math.max(r.width / nw, r.height / nh) : Math.min(r.width / nw, r.height / nh);
  const dw = nw * scale, dh = nh * scale, ox = r.left + (r.width - dw) * pos[0], oy = r.top + (r.height - dh) * pos[1];
  const sr = splash.getBoundingClientRect();
  return {nw, nh, fit, position: s.objectPosition, drawn: {x: ox, y: oy, right: ox + dw, bottom: oy + dh}, vw: innerWidth, vh: innerHeight,
    splashCovers: sr.left <= 0 && sr.top <= 0 && sr.right >= innerWidth && sr.bottom >= innerHeight, cls: splash.classList.contains('sf15-on')};
}
const artOf = m => Object.keys(ART).find(k => ART[k].size[0] === m.nw && ART[k].size[1] === m.nh);
const fills = m => m.splashCovers && m.drawn.x <= 0.5 && m.drawn.y <= 0.5 && m.drawn.right >= m.vw - 0.5 && m.drawn.bottom >= m.vh - 0.5;
const box = (m, f) => { const a = ART[artOf(m)], w = m.drawn.right - m.drawn.x, h = m.drawn.bottom - m.drawn.y;
  return {x: m.drawn.x + f[0] * w, y: m.drawn.y + f[1] * h, right: m.drawn.x + f[2] * w, bottom: m.drawn.y + f[3] * h}; };
const inView = (m, b, margin = 4) => b.x >= margin && b.y >= margin && b.right <= m.vw - margin && b.bottom <= m.vh - margin;

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  // The real splash: the suite's preload sets the fast switch; this turns it off again, after it.
  const open = async (url, viewport) => {
    const context = await browser.newContext({viewport});
    await context.addInitScript(() => { window.__L5R_SPLASH_FAST__ = false; });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url, {waitUntil: 'domcontentloaded'});
    await page.waitForFunction(() => { const i = document.querySelector('#l5rSplash img'); return i && i.complete && i.naturalWidth > 0; }, null, {timeout: 20000});
    return {context, page};
  };
  try {
    const fp = pathToFileURL(firstPaint).href;
    await check('SF-SEAM', async () => {
      const {context, page} = await open(fp, {width: 390, height: 844});
      const r = await page.evaluate(() => ({sf: window.SF15, cls: document.getElementById('l5rSplash').classList.contains('sf15-on'),
        media: [...document.querySelectorAll('#l5rSplash source')].map(s => s.media)}));
      await context.close();
      return [r.sf && r.sf.enabled === true && r.sf.installed === true && r.sf.landscapeFrom === '(min-aspect-ratio: 3/2)' && r.cls &&
        JSON.stringify(r.media) === JSON.stringify(['(max-aspect-ratio: 2/3)', '(min-aspect-ratio: 3/2)']), r];
    });
    for (const [name, [w, h]] of Object.entries(SHAPES)) {
      const {context, page} = await open(fp, {width: w, height: h});
      const m = await page.evaluate(measure);
      await context.close();
      await check('SF-FILLS-' + name, async () => [!m.missing && m.cls && artOf(m) === want(w, h) && m.fit === 'cover' && fills(m), {art: artOf(m), want: want(w, h), m}]);
      await check('SF-TITLE-' + name, async () => { const t = box(m, ART[artOf(m)].title), s = box(m, ART[artOf(m)].seal);
        return [inView(m, t) && inView(m, s), {title: t, seal: s, vw: m.vw, vh: m.vh}]; });
    }
    // The landscape picture starts at 3 : 2, not 4 : 3.
    await check('SF-SWITCH-POINT', async () => {
      const got = {};
      for (const [w, h] of [[1024, 768], [1300, 1000], [1440, 1000], [1500, 1000], [1600, 1000]]) {
        const {context, page} = await open(fp, {width: w, height: h}); got[w + 'x' + h] = artOf(await page.evaluate(measure)); await context.close(); }
      return [JSON.stringify(got) === JSON.stringify({'1024x768': 'square', '1300x1000': 'square', '1440x1000': 'square', '1500x1000': 'landscape', '1600x1000': 'landscape'}), got];
    });
    // Without the class the picture is shown whole again, with paper bands at a shape it does not match.
    await check('SF-CLASS-OFF', async () => {
      const {context, page} = await open(fp, {width: 844, height: 390});
      const had = await page.evaluate(() => { const s = document.getElementById('l5rSplash'), h = s.classList.contains('sf15-on'); s.classList.remove('sf15-on'); return h; });
      const r = await page.evaluate(measure);
      const back = await page.evaluate(h => { const s = document.getElementById('l5rSplash'); if (h) s.classList.add('sf15-on'); return s.classList.contains('sf15-on'); }, had);
      const m = {r, back};
      await context.close();
      return [m.r.fit === 'contain' && !fills(m.r) && m.back, m];
    });
    // Turning a phone: the picture follows the new shape and still fills it, title in view.
    await check('SF-ROTATION', async () => {
      const {context, page} = await open(fp, {width: 390, height: 844});
      const a = await page.evaluate(measure);
      await page.setViewportSize({width: 844, height: 390});
      await page.waitForFunction(() => document.querySelector('#l5rSplash img').naturalWidth === 2000, null, {timeout: 5000});
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const b = await page.evaluate(measure);
      await context.close();
      return [artOf(a) === 'portrait' && artOf(b) === 'landscape' && fills(a) && fills(b) && inView(b, box(b, ART.landscape.title)), {a: artOf(a), b: artOf(b)}];
    });
    // The whole page: the splash still stays at least 5 s and then leaves, taking this unit's script with it.
    await check('SF-STAYS-THEN-LEAVES', async () => {
      const {context, page} = await open(pathToFileURL(SHEET).href, {width: 390, height: 844});
      const early = await page.evaluate(() => ({t: performance.now(), there: !!document.getElementById('l5rSplash')}));
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 120000});
      const atReady = await page.evaluate(() => ({t: performance.now(), there: !!document.getElementById('l5rSplash')}));
      await page.waitForFunction(() => !document.getElementById('l5rSplash'), null, {timeout: 20000});
      const after = await page.evaluate(() => ({t: performance.now(), scripts: [...document.scripts].filter(s => /SPLASH_FILL_ENABLED/.test(s.textContent)).length,
        test: !!(window.__L5R_TEST__.SF15 && window.__L5R_TEST__.SF15.installed)}));
      await context.close();
      return [early.there && (atReady.t >= 5000 || atReady.there) && after.t >= 5000 && after.scripts === 0 && after.test, {early, atReady, after}];
    });
    // A script error still takes the splash away at once.
    await check('SF-LEAVES-ON-ERROR', async () => {
      const {context, page} = await open(fp, {width: 390, height: 844});
      await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', {message: 'splash fill test'})));
      const gone = await page.waitForFunction(() => !document.getElementById('l5rSplash'), null, {timeout: 3000}).then(() => true, () => false);
      await context.close();
      return [gone, gone];
    });
    await check('SF-NO-ERRORS', async () => [errors.length === 0, errors]);
  } finally {
    await browser.close();
    fs.rmSync(tmp, {recursive: true, force: true});
  }
  let passed = 0;
  for (const id of pins.checks) {
    const ok = seen[id] === true;
    if (ok) passed++;
    console.log((ok ? 'PASS ' : 'FAIL ') + id + (id in seen ? '' : ' (never ran)'));
  }
  const extra = Object.keys(seen).filter(id => !pins.checks.includes(id));
  for (const id of extra) console.log('FAIL ' + id + ' (not pinned)');
  const total = pins.checks.length + extra.length;
  console.log(`${passed}/${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
})().catch(e => { console.error(e); console.log(`0/${pins.checks.length} checks passed`); process.exit(1); });
