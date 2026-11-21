'use strict';
// Release 15b, unit B14 (PART H PHASE 15.2.4): Jigoku's total, then its arithmetic (approved by the owner on
// 20 November 2026 as mocked up).   node jigoku-total-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the words a player reads, written out here (Touch of the Spirit Realms
// (Jigoku), Taint Rank 4, Lost: +8; not Lost: +4), the roll's pool as the preview shows it, and the total the
// sheet's own modifier list gives an attack. The unit's own state is read only to say whether it is there (the seam).
// Real taps on a touch phone, real clicks on a laptop. Character: the audit's dense Kuni Shugenja with Touch of the
// Spirit Realms (Jigoku), Lost, and Taint 4.2, copied into this folder.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = path.join(__dirname, 'jigoku.l5r.json'), FX_NAME = 'B14 jigoku';
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
const LABEL = 'Touch of the Spirit Realms (Jigoku)';

function install() {
  const $ = id => document.getElementById(id), H = {};
  const row = () => Array.from(document.querySelectorAll('#advList .entry')).find(d => /Touch of the Spirit Realms/.test(d.querySelector('.en-name').value));
  H.notes = () => { const r = row(); return r ? Array.from(r.querySelectorAll('.tr4524-note')).map(n => n.textContent) : null; };
  H.flags = () => { const r = row(); return r ? Array.from(r.querySelectorAll('.tr4524-flag')).map(n => n.textContent) : null; };
  H.preview = () => ({rows: Array.from(document.querySelectorAll('#rollPreviewBody .rp-mod')).map(r => r.textContent.replace(/\s+/g, ' ').trim()),
    pool: (document.querySelector('#rollPreviewBody .rp-pool-final') || {}).textContent || ''});
  H.attackTotal = label => { const T = window.__L5R_TEST__;
    return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, {skillName: 'Kenjutsu', traitName: 'Agility'}))
      .filter(m => m.label === label).map(m => m.totalDelta); };
  H.taint = v => { $('f_taint').value = v; window.__L5R_TEST__.recalcAll(); };
  window.JKH = H;
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
  return {context, page, errors};
}
const goTo = async (page, label) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label); await settle(page); };
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
// A Defense roll (Reflexes, a Physical Trait): Jigoku applies.
async function defensePreview(page, phone) {
  await goTo(page, 'Skills');
  const row = page.locator('#skillsBody tr', {has: page.locator('.sk-name[value="Defense"]')});
  await press(page, phone, row.locator('.sk-roll'));
  await page.waitForFunction(() => getComputedStyle(document.getElementById('rollPreviewOverlay')).display !== 'none');
  await settle(page);
  const p = await page.evaluate(() => window.JKH.preview());
  await press(page, phone, page.locator('#rollPreviewCancel'));
  return p;
}
const jigokuRows = p => p.rows.filter(r => r.indexOf(LABEL) === 0);
const card = async (page, phone) => { await goTo(page, 'Adv & Disadv'); return page.evaluate(() => window.JKH.notes()); };

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('JK-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {jk: !!T.JK15 && T.JK15.installed === true, on: T.JIGOKU_TOTAL_FIRST_ENABLED}; });
        return [r.jk && r.on === true, r];
      });
      const lost = await defensePreview(page, P);
      await check('JK-PREVIEW-LOST-PHONE', async () => [same(jigokuRows(lost), [LABEL + '+8 to total — Taint Rank 4 × 2 (Lost)']), lost]);
      await check('JK-CARD-LOST-PHONE', async () => { const n = await card(page, P); return [same(n, ['Adding +8 — Taint Rank 4 × 2 (Lost).']), n]; });
      await check('JK-TOTAL-AND-POOL-UNCHANGED-PHONE', async () => {
        const t = await page.evaluate(l => window.JKH.attackTotal(l), LABEL);
        return [same(t, [8]) && lost.pool === '3k2', {t, pool: lost.pool}];
      });
      await check('JK-NOT-LOST-PHONE', async () => {
        await goTo(page, 'Adv & Disadv');
        await press(page, P, page.locator('#advList .tr4524-lost input').first());
        await page.waitForFunction(() => !/Lost/.test((window.JKH.notes() || [''])[0]));
        const n = await page.evaluate(() => window.JKH.notes());
        const p = await defensePreview(page, P);
        const t = await page.evaluate(l => window.JKH.attackTotal(l), LABEL);
        return [same(n, ['Adding +4 — Taint Rank 4.']) && same(jigokuRows(p), [LABEL + '+4 to total — Taint Rank 4']) && same(t, [4]), {n, p, t}];
      });
      await check('JK-NO-TAINT-UNCHANGED-PHONE', async () => {
        await page.evaluate(() => window.JKH.taint('0')); await settle(page);
        const f = await card(page, P);
        const n = await page.evaluate(() => window.JKH.notes());
        const p = await defensePreview(page, P);
        return [same(f, null) === false && same(await page.evaluate(() => window.JKH.flags()), ['Requires Shadowlands Taint: your Taint Rank is 0, so nothing is added.']) &&
          same(n, []) && jigokuRows(p).length === 0, {n, p}];
      });
      await check('JK-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const P = false;
      const lost = await defensePreview(page, P);
      await check('JK-PREVIEW-LOST-DESKTOP', async () => [same(jigokuRows(lost), [LABEL + '+8 to total — Taint Rank 4 × 2 (Lost)']), lost]);
      await check('JK-CARD-LOST-DESKTOP', async () => { const n = await card(page, P); return [same(n, ['Adding +8 — Taint Rank 4 × 2 (Lost).']), n]; });
      await check('JK-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
