'use strict';
// Release 15a, unit A19.1 (PART H PHASE 15.1.35): the Combat page's damage row fits a phone (approved by the owner on
// 19 November 2026 as mocked up).   node damage-row-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the row and its controls as drawn (their boxes against the Void card's panel
// and the viewport), and what the sheet keeps after Apply or Cancel (Wounds, Void Points, the row shown or not, A19's
// line where present). The unit's own state is read only to say whether it is there (the seam). Real taps on a touch
// phone, real clicks on a laptop. Character: the audit's dense Kuni Shugenja with no Advantages or Disadvantages
// (3 Void Points), copied into this folder.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = path.join(__dirname, 'damage-row.l5r.json'), FX_NAME = 'A19.1 damage row';
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 1200));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));

function install() {
  const $ = id => document.getElementById(id), H = {};
  const box = e => { const q = e.getBoundingClientRect(); return {left: Math.round(q.left), right: Math.round(q.right), top: Math.round(q.top), bottom: Math.round(q.bottom), width: Math.round(q.width), height: Math.round(q.height)}; };
  H.measure = () => {
    const row = $('voidDamageRow');
    return {shown: getComputedStyle(row).display !== 'none', row: box(row), panel: box(row.closest('.void-panel')),
      label: box(row.querySelector('label')), input: box($('voidDamageInput')), apply: box($('voidDamageApply')), cancel: box($('voidDamageCancel')),
      docScroll: document.documentElement.scrollWidth, vw: innerWidth};
  };
  H.state = () => { const line = $('vu15Line');
    return {wounds: $('f_woundsTaken').value, points: $('void_current').value, shown: getComputedStyle($('voidDamageRow')).display !== 'none',
      line: line && !line.hidden ? line.textContent : ''}; };
  window.DRH = H;
}
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.locator('#fileImport').setInputFiles(FX);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, FX_NAME);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
  await page.evaluate(install);
  await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Combat'); await C.whenSettled(); });
  await settle(page);
  return {context, page, errors};
}
const press = async (page, phone, selector) => { const b = page.locator(selector).first(); await b.scrollIntoViewIfNeeded(); if (phone) await b.tap(); else await b.click(); await settle(page); };
// The row as a player opens it: "Reduce damage by 10", then 25 typed.
async function openRow(page, phone) {
  await press(page, phone, '#voidSpendButtons button[data-void="damage"]');
  await page.fill('#voidDamageInput', '25');
  await settle(page);
  return page.evaluate(() => window.DRH.measure());
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('DR-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {dr: !!T.DR15 && T.DR15.installed === true, on: T.DAMAGE_ROW_FIT_ENABLED}; });
        return [r.dr && r.on === true, r];
      });
      const m = await openRow(page, P);
      await check('DR-ROW-INSIDE-CARD-PHONE', async () => [m.shown && m.docScroll === m.vw &&
        [m.label, m.input, m.apply, m.cancel].every(b => b.left >= m.row.left && b.right <= m.row.right && b.right <= m.panel.right), m]);
      await check('DR-BUTTONS-ONE-LINE-PHONE', async () => [m.apply.height <= 40 && m.cancel.height <= 40 &&
        m.input.top < m.apply.top && m.label.bottom <= m.apply.top, m]);
      await check('DR-BUTTONS-FULL-WIDTH-PHONE', async () => [Math.abs(m.apply.width - m.row.width) <= 1 && Math.abs(m.cancel.width - m.row.width) <= 1 &&
        m.cancel.top >= m.apply.bottom, m]);
      await check('DR-APPLY-STILL-WORKS-PHONE', async () => {
        await press(page, P, '#voidDamageApply');
        const s = await page.evaluate(() => window.DRH.state());
        // A19's Undo line is A19's to test: here it may be there (A19 present) or not (A19 removed), never anything else.
        return [s.wounds === '15' && s.points === '2' && !s.shown && (s.line === '' || /^(Undo)?Spent: damage reduced by 10; 15 Wounds taken\.$/.test(s.line)), s];
      });
      await check('DR-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const P = false;
      const m = await openRow(page, P);
      await check('DR-ONE-LINE-DESKTOP', async () => {
        const mid = b => b.top + b.height / 2, c = mid(m.apply);
        return [m.shown && m.row.height <= 40 && m.apply.height <= 40 && m.cancel.height <= 40 &&
          [m.label, m.input, m.cancel].every(b => Math.abs(mid(b) - c) <= 4) && m.label.right <= m.input.left && m.input.right <= m.apply.left && m.apply.right <= m.cancel.left, m];
      });
      await check('DR-CANCEL-STILL-WORKS-DESKTOP', async () => {
        await press(page, P, '#voidDamageCancel');
        const s = await page.evaluate(() => window.DRH.state());
        return [!s.shown && s.wounds === '0' && s.points === '3', s];
      });
      await check('DR-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
      await context.close();
    }
  } finally {
    await browser.close();
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
