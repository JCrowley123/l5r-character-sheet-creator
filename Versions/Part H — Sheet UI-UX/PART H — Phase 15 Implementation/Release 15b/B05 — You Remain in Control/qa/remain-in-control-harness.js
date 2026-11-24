'use strict';
// Release 15b, unit B05 (PART H PHASE 15.2.8): Touch of the Void's and Lord Moon's Curse's success lines say "You remain in
// control" (approved by the owner on 24 November 2026 as recommended).   node remain-in-control-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the lines a player reads in the roll window are written out here from the approved
// board, and the TNs from the Core Rulebook (Touch of the Void p.162: Willpower, TN 30; Lord Moon's Curse p.160:
// Willpower, TN 20; Epilepsy p.159: Willpower, TN 15, whose line B05 must leave alone). The unit's own state is read only
// to say whether it is there (the seam). The buttons are pressed with real taps on a touch phone and real clicks on a
// laptop, through the roll preview's Go. Fixed dice: every die a 9 (a pass, 4k4 = 36) or a 1 (a failure, 4k4 = 4).
// Character: the mock-ups' "G2 check siblings" (the audit's dense Kuni Shugenja, Willpower 4, with Epilepsy, Lord Moon's
// Curse and Touch of the Void), copied into this folder.
// Harness fix, 24 November 2026 (B01's round 2 renames Touch of the Void's button and shortens its failure line; B05
// itself is unchanged): Touch of the Void's button is found by its row, the Feature 4.5.33 (Part I) button in Touch of
// the Void's entry, not by its words; and its failure is checked by the line's first sentence, "You are Dazed for one
// Round.", which B05 does not touch, so this harness does not depend on B01. Same ids, same count.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = path.join(__dirname, 'remain-in-control.l5r.json'), FX_NAME = 'G2 check siblings';
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 1500));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 1500)); }
}
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));

const TOUCH = {entry: 'Touch of the Void', title: 'Touch of the Void — Willpower vs TN 30', pass: 'You remain in control.',
  failStarts: 'You are Dazed for one Round.'};
const MOON = {button: 'Resist Lord Moon (TN 20)', title: 'Lord Moon’s Curse — Willpower vs TN 20', pass: 'Willpower roll passed. You remain in control tonight.',
  fail: 'Willpower roll failed.'};
const EPILEPSY = {button: 'Avoid (TN 15)', title: 'Epilepsy — Willpower vs TN 15', pass: 'No seizure.'};

async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
  await page.waitForFunction(() => !document.getElementById('l5rSplash'), null, {timeout: 30000});
  await page.locator('#fileImport').setInputFiles(FX);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, FX_NAME);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await settle(page);
  await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Adv & Disadv'); await C.whenSettled(); }); await settle(page);
  return {context, page, errors};
}
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
const shown = (page, id) => page.evaluate(i => { const o = document.getElementById(i); return !!o && getComputedStyle(o).display !== 'none'; }, id);
// Touch of the Void's button: the one in its own entry's row, whatever its words.
async function touchButton(page) {
  const i = await page.evaluate(n => [...document.querySelectorAll('#disadvList .entry')].findIndex(d => d.querySelector('.en-name').value === n), TOUCH.entry);
  return page.locator('#disadvList .entry').nth(i).locator('.vi4533-row button.vi4533-btn');
}
// One roll from a Disadvantage row's button, by its words (or, for Touch of the Void, by its row); dice fixed first.
// Returns what the roll window shows.
async function roll(page, phone, words, value) {
  await page.evaluate(v => { Math.random = () => v; }, value);
  await press(page, phone, words === TOUCH ? await touchButton(page) : page.locator('#disadvList button', {hasText: words}).first());
  if (await shown(page, 'rollPreviewOverlay')) await press(page, phone, page.locator('#rollPreviewGo'));
  await page.waitForFunction(() => getComputedStyle(document.getElementById('rollModalOverlay')).display !== 'none');
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => ({title: document.getElementById('rollModalTitle').textContent, note: document.getElementById('rollResultNote').textContent}));
  await press(page, phone, page.locator('#rollModalClose'));
  await page.waitForSelector('#rollModalOverlay', {state: 'hidden'});
  return r;
}
// The sheet's own message window, if one opened after a roll: its words, then closed with its OK.
async function message(page, phone) {
  if (!(await shown(page, 'appConfirmOverlay'))) return null;
  const text = await page.evaluate(() => document.getElementById('appConfirmMsg').textContent);
  await press(page, phone, page.locator('#appConfirmOk'));
  return text;
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('RC-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {rc: !!T.RC15 && T.RC15.installed === true, on: T.REMAIN_IN_CONTROL_ENABLED}; });
        return [r.rc && r.on === true, r];
      });
      await check('RC-TOUCH-PASSES-PHONE', async () => { const r = await roll(page, P, TOUCH, 0.85);
        return [r.title === TOUCH.title && r.note === TOUCH.pass, r]; });
      await check('RC-TOUCH-FAILS-PHONE', async () => { const r = await roll(page, P, TOUCH, 0.05);
        return [r.title === TOUCH.title && r.note.indexOf(TOUCH.failStarts) === 0, r]; });
      await check('RC-MOON-PASSES-PHONE', async () => { const r = await roll(page, P, MOON.button, 0.85); const m = await message(page, P);
        return [r.title === MOON.title && r.note === MOON.pass && m === null, {r, m}]; });
      await check('RC-MOON-FAILS-PHONE', async () => { const r = await roll(page, P, MOON.button, 0.05); const m = await message(page, P);
        // A failure still ends in the fix's own message after the window closes (its words are not B05's).
        return [r.title === MOON.title && r.note === MOON.fail && typeof m === 'string' && m.length > 0, {r, m}]; });
      await check('RC-OTHER-LINES-UNCHANGED-PHONE', async () => { const r = await roll(page, P, EPILEPSY.button, 0.85);
        return [r.title === EPILEPSY.title && r.note === EPILEPSY.pass, r]; });
      await check('RC-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      await check('RC-TOUCH-PASSES-DESKTOP', async () => { const r = await roll(page, false, TOUCH, 0.85);
        return [r.title === TOUCH.title && r.note === TOUCH.pass, r]; });
      await check('RC-MOON-PASSES-DESKTOP', async () => { const r = await roll(page, false, MOON.button, 0.85); const m = await message(page, false);
        return [r.title === MOON.title && r.note === MOON.pass && m === null, {r, m}]; });
      await check('RC-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
