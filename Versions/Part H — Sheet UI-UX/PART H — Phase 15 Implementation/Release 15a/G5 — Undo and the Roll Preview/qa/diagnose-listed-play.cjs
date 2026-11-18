'use strict';
// G5 investigation probe (18 November 2026, Claude), after the first qualification chain stopped at the 4x CPU screen
// (162/163 leaves; A08's harness 20/21, QT-LISTED-PLAY-AUTOSAVE-MERGED-DESKTOP). It runs no checks and decides nothing.
// It repeats the failed check's steps with the harness's own setup (copied from quick-tap-undo-harness.js unchanged:
// open, install, press, plus, look, fresh, settle, goTab) and the Save check before it that makes the listed copy, then
// prints what the check could not show: every History entry since the mark (not only Honour's), in memory and in the
// stored copy, and the times of each tap, the group's end, History's merge and every autosave. Then it watches the
// stored copy until it carries one Honour entry or 20 seconds pass.
//   node --require <navigation-budget> --require <splash-fast> [--require <cpu-throttle>] diagnose-listed-play.cjs <sheet.html> <label>
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const A08 = path.resolve(__dirname, '../../A08 — One Undo for Quick Taps/qa');
const DENSE = path.join(A08, 'dense-kuni.l5r.json'), DENSE_NAME = 'Phase 15 dense audit';
const sheet = path.resolve(process.argv[2]), label = process.argv[3] || 'probe';
const wait = ms => new Promise(r => setTimeout(r, ms));
const DEVICES = {DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
function install() {
  const T = window.__L5R_TEST__, H = {};
  H.read = n => { const s = T.CP7.read(n); return s ? s.rank + '.' + s.points : null; };
  H.seed = (n, r, p) => { if (n === 'taint') T.TA7.write(r, p); else { T.RP7.write(n, r, p); T.RP7.changed(n); } T.CP7.renderAll(); };
  H.fresh = () => { T.CP7.clear(); };
  H.notice = () => document.getElementById('cp7-notice').textContent;
  H.undoShown = () => !document.getElementById('cp7-undo').hidden;
  H.mark = () => { T.AL71.check(); return T.AL71.entries().length; };
  window.QTH = H;
}
async function open(browser, opts, mode) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.locator('#fileImport').setInputFiles(DENSE);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, DENSE_NAME);
  await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode);
  await page.evaluate(install);
  await goTab(page, 'Identity');
  return {context, page, errors};
}
const press = async (page, phone, l) => { const b = page.getByRole('button', {name: l, exact: true}); if (phone) await b.tap(); else await b.click(); };
const plus = (page, phone, title = 'Honour') => press(page, phone, 'Add ' + title + ' points');
const look = page => page.evaluate(() => ({honor: window.QTH.read('honor'), notice: window.QTH.notice(), undo: window.QTH.undoShown()}));
const fresh = async (page, seeds) => { await page.evaluate(s => { window.QTH.fresh(); s.forEach(x => window.QTH.seed(...x)); }, seeds); await settle(page); };
// Timing taps on the sheet's own entry points; each passes straight through.
function instrument() {
  const T = window.__L5R_TEST__, t0 = performance.now(), events = [];
  const at = () => Math.round(performance.now() - t0);
  window.__probe = {events, at, t0};
  const wrap = (obj, name, tag, info) => {
    const f = obj[name];
    obj[name] = function () {
      const s = at();
      const r = f.apply(this, arguments);
      events.push({t: s, ms: at() - s, what: tag, info: info ? info(r) : undefined});
      return r;
    };
  };
  wrap(T.CL11, 'flush', 'autosave');
  wrap(T.QT15, 'end', 'group end');
  wrap(T.AL71, 'restart', 'History restarted (merge)');
  wrap(T.AL71, 'check', 'History look', r => (r || []).map(e => e.what + ' ' + e.from + '→' + e.to));
  wrap(T.CP7, 'adjust', 'tap');
}
(async () => {
  const browser = await chromium.launch();
  const out = {label, sheet, cpu: process.env.L5R_CPU_RATE || null};
  try {
    const {context, page, errors} = await open(browser, DEVICES.DESKTOP, 'management');
    // The harness's Save check, which makes the listed copy the failed check opens.
    await fresh(page, [['honor', 4, 7]]);
    await page.evaluate(() => window.QTH.mark());
    await plus(page, false); await plus(page, false);
    await page.locator('#btnSave').click();
    await page.waitForFunction(() => !!document.getElementById('charSelect').value);
    await page.waitForFunction(id => !!localStorage.getItem('l5r-sheet:local:l5r-char:' + id), await page.evaluate(() => document.getElementById('charSelect').value));
    await settle(page);
    const savedId = await page.evaluate(() => document.getElementById('charSelect').value);
    // The failed check's steps, as written.
    await page.evaluate(() => { document.getElementById('charSelect').value = ''; document.getElementById('btnLoad').click(); });
    await page.waitForFunction(() => document.getElementById('f_name').value === '');
    await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
    await page.evaluate(instrument);
    await page.evaluate(id => window.__L5R_TEST__.CL11.openCharacter(id), savedId);
    await page.waitForFunction(n => document.getElementById('f_name').value === n, DENSE_NAME);
    await goTab(page, 'Identity');
    const n0 = await page.evaluate(() => { window.__probe.events.push({t: window.__probe.at(), what: 'mark'}); return window.QTH.mark(); });
    for (let i = 0; i < 3; i++) {
      await plus(page, false);
      await page.evaluate(i => window.__probe.events.push({t: window.__probe.at(), what: 'harness: tap ' + (i + 1) + ' returned'}), i);
      if (i < 2) await wait(2000);
    }
    // --awake: the same 7.5 seconds, with a no-op evaluated in the page every 250 ms (added after the first four runs).
    if (process.argv.includes('--awake')) for (let k = 0; k < 30; k++) { await wait(250); await page.evaluate(() => 0); }
    else await wait(7500);
    const read =() => page.evaluate(([id, n]) => {
      const s = JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char:' + id));
      const T = window.__L5R_TEST__;
      return {t: window.__probe.at(),
        stored: (s.auditLog || []).slice(n).map(e => e.what + ' ' + e.from + '→' + e.to),
        memory: T.AL71.entries().slice(n).map(e => e.what + ' ' + e.from + '→' + e.to)};
    }, [savedId, n0]);
    out.atCheck = await read();
    out.atCheck.look = await look(page);
    out.later = [];
    for (let k = 0; k < 40; k++) {
      const r = await read();
      out.later.push(r);
      if (r.stored.filter(x => x.startsWith('Honor ')).length === 1) break;
      await wait(500);
    }
    out.events = await page.evaluate(() => window.__probe.events);
    out.errors = errors;
    await context.close();
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
