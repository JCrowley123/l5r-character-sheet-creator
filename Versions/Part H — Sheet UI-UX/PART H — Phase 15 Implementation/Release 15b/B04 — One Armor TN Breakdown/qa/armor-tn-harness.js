'use strict';
// Release 15b, unit B04 (PART H PHASE 15.2.3): one Armor TN breakdown behind Quick Access's i and the Combat card's
// formula i (approved by the owner on 20 November 2026 as mocked up).   node armor-tn-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the rows a player reads, written out here (Blind, Reflexes 2, no armour: the
// base is Reflexes + 5 = 7, Core Rulebook p.156), the sheet's own fields (#f_baseTN, #f_currentTN) and Quick Access's
// figure, and that the rows add up to the figure the sheet shows. The unit's own state is read only to say whether
// it is there (the seam). Real taps on a touch phone, real clicks on a laptop. Character: the audit's dense Kuni
// Shugenja with Blind and no armour, copied into this folder.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = path.join(__dirname, 'armor-tn.l5r.json'), FX_NAME = 'B04 armor TN';
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 1500));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));

const BLIND_ROWS = [['Base: Blind, Reflexes 2 + 5', 'Blind: Reflexes + 5 instead of Reflexes × 5 + 5, Core Rulebook p.156', '7'],
  ['Armor TN Bonus', '', '+0'], ['Armor TN', '', '7']];
const FORMULA = 'Base TN = (Reflexes × 5) + 5. Current TN adds your Armor TN Bonus. Initiative = (Reflexes + Insight Rank)k(Reflexes).';

function install() {
  const $ = id => document.getElementById(id), H = {};
  const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  H.fields = () => ({base: $('f_baseTN').value, current: $('f_currentTN').value, qa: $('qaArmorTNValue').textContent});
  H.qaInfo = () => { const b = $('qaArmorTNValue').querySelector('button');
    return b ? {shown: shown(b), name: b.getAttribute('aria-label'), own: b.textContent} : null; };
  H.qaBlindShown = () => Array.from($('quickAccessPanel').querySelectorAll('*')).some(e => shown(e) && e.children.length === 0 && /^Blind:/.test(e.textContent.trim()));
  H.window = () => { const o = $('stanceInfoOverlay'), b = $('stanceInfoBody');
    const rows = Array.from(b.querySelectorAll('tr')).map(tr => { const c = tr.cells, small = c[0].querySelector('small');
      return [c[0].firstChild ? c[0].firstChild.textContent : '', small ? small.textContent : '', c[1].textContent]; });
    return {open: getComputedStyle(o).display !== 'none', title: $('stanceInfoTitle').textContent, sub: $('stanceInfoRing').textContent, rows,
      after: Array.from(b.querySelectorAll('p')).map(p => p.textContent)}; };
  H.close = () => { const o = $('stanceInfoOverlay'); const x = o.querySelector('.rm-btn, [id$="Close"]'); if (x) x.click(); else o.style.display = 'none'; };
  H.drop = name => { document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(div => {
    const n = div.querySelector('.en-name'); if (n && n.value === name) div.remove(); }); window.__L5R_TEST__.recalcAll(); };
  H.type = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new Event('input', {bubbles: true})); e.dispatchEvent(new Event('change', {bubbles: true})); };
  // The tile's text starts with its icon; its name is in .stance-name (run 1 read the whole text and found nothing).
  H.stanceKey = word => { const b = Array.from(document.querySelectorAll('.stance-tile-btn')).find(x => { const n = x.querySelector('.stance-name'); return !!n && n.textContent.trim() === word; }); return b ? b.dataset.stance : null; };
  H.baseNote = () => { const n = $('bl4534BaseNote'); return n ? {shown: shown(n), text: n.textContent} : null; };
  window.ATH = H;
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
  await goTo(page, 'Combat');
  return {context, page, errors};
}
const goTo = async (page, label) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label); await settle(page); };
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
const closeWindow = async page => { await page.evaluate(() => window.ATH.close()); await settle(page); };
async function qaWindow(page, phone) {
  if (await page.evaluate(() => document.getElementById('quickAccessPanel').hidden)) await press(page, phone, page.locator('#quickAccessToggleBtn'));
  await press(page, phone, page.locator('#qaArmorTNValue button').first());
  const w = await page.evaluate(() => window.ATH.window());
  await closeWindow(page);
  if (!(await page.evaluate(() => document.getElementById('quickAccessPanel').hidden))) await press(page, phone, page.locator('#quickAccessToggleBtn'));
  return w;
}
async function combatWindow(page, phone) {
  await goTo(page, 'Combat');
  await press(page, phone, page.locator('#combatTnInfoBtn'));
  const w = await page.evaluate(() => window.ATH.window());
  await closeWindow(page);
  return w;
}
const value = s => Number(String(s).replace('−', '-'));

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('AT-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {at: !!T.AT15 && T.AT15.installed === true, on: T.ARMOR_TN_BREAKDOWN_ENABLED}; });
        return [r.at && r.on === true, r];
      });
      await check('AT-NUMBERS-UNCHANGED-PHONE', async () => { const f = await page.evaluate(() => window.ATH.fields()); return [same(f, {base: '7', current: '7', qa: '7'}), f]; });
      await check('AT-QA-I-PHONE', async () => {
        await press(page, P, page.locator('#quickAccessToggleBtn'));
        const i = await page.evaluate(() => window.ATH.qaInfo()), blind = await page.evaluate(() => window.ATH.qaBlindShown());
        await press(page, P, page.locator('#quickAccessToggleBtn'));
        return [!!i && i.shown && i.own === '' && i.name === 'Armor TN: how it is worked out' && blind === false, {i, blind}];
      });
      await check('AT-QA-WINDOW-PHONE', async () => { const w = await qaWindow(page, P);
        return [w.open && w.title === 'Armor TN' && w.sub === '7 to be hit' && same(w.rows, BLIND_ROWS) && w.after.length === 0, w]; });
      await check('AT-COMBAT-WINDOW-PHONE', async () => { const w = await combatWindow(page, P);
        return [w.open && w.title === 'TN & Initiative' && w.sub === 'Armor & TN' && same(w.rows, BLIND_ROWS) && same(w.after, [FORMULA]), w]; });
      await check('AT-COMBAT-BLIND-LINE-STAYS-PHONE', async () => {
        await page.evaluate(() => { document.getElementById('armorTnDetails').open = true; }); await settle(page);
        const n = await page.evaluate(() => window.ATH.baseNote());
        return [!!n && n.shown && n.text === 'Blind: Reflexes 2 + 5 = 7 (Core Rulebook p.156)', n];
      });
      await check('AT-SIGHTED-ARMOR-AND-STANCE-PHONE', async () => {
        await page.evaluate(() => { window.ATH.drop('Blind'); window.ATH.type('f_armorName', 'Ashigaru armor'); window.ATH.type('f_armorTN', '5'); window.__L5R_TEST__.recalcAll(); });
        await settle(page);
        const key = await page.evaluate(() => window.ATH.stanceKey('Defense'));
        await press(page, P, page.locator('.stance-tile-btn[data-stance="' + key + '"]').first());
        const f = await page.evaluate(() => window.ATH.fields());
        const w = await qaWindow(page, P);
        const total = w.rows.length ? value(w.rows[w.rows.length - 1][2]) : NaN;
        const parts = w.rows.slice(0, -1).reduce((n, r) => n + value(r[2]), 0);
        const stance = w.rows.find(r => r[0] === 'Defense stance');
        return [w.title === 'Armor TN' && same(w.rows[0], ['Base: Reflexes 2 × 5 + 5', '', '15']) && same(w.rows[1], ['Armor TN Bonus (Ashigaru armor)', '', '+5']) &&
          !!stance && value(stance[2]) > 0 && same(w.rows[w.rows.length - 1].slice(0, 2), ['Armor TN', '']) && total === value(f.current) &&
          parts === total && f.qa === f.current && f.base === '15', {f, w}];
      });
      await check('AT-PRINT-HIDES-I-PHONE', async () => {
        const fresh = await open(browser, DEVICES.PHONE);
        const before = await fresh.page.evaluate(() => window.ATH.qaInfo());
        await fresh.page.emulateMedia({media: 'print'}); await settle(fresh.page);
        const after = await fresh.page.evaluate(() => { const b = document.querySelector('#qaArmorTNValue button'); return !!b && b.getClientRects().length > 0 && getComputedStyle(b).display !== 'none'; });
        await fresh.context.close();
        return [!!before && after === false && fresh.errors.length === 0, {before, after, errors: fresh.errors}];
      });
      await check('AT-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const P = false;
      await check('AT-QA-WINDOW-DESKTOP', async () => { const w = await qaWindow(page, P);
        return [w.open && w.title === 'Armor TN' && w.sub === '7 to be hit' && same(w.rows, BLIND_ROWS), w]; });
      await check('AT-COMBAT-WINDOW-DESKTOP', async () => { const w = await combatWindow(page, P);
        return [w.open && w.title === 'TN & Initiative' && same(w.rows, BLIND_ROWS) && same(w.after, [FORMULA]), w]; });
      await check('AT-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
