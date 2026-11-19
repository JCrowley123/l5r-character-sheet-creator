'use strict';
// Release 15a, unit A19 (PART H PHASE 15.1.33): Undo the most recent Void card spend until the next roll, Next Round or
// Reset (approved by the owner on 19 November 2026).   node void-spend-undo-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the values the sheet keeps (the Void Points, the armed one-roll effects, the
// Round tracker, the skirmish Initiative flag, the Wounds), what the sheet derives from them (Armor TN and Initiative
// bonuses), Touch of the Void's owed rolls (VI4533.owed), the roll windows as drawn, the line and its button as drawn,
// the status line, and the saved character (collectData). The unit's own state is read only to say whether it is there
// (the seam). The player's steps are real taps on a touch phone and real clicks on a laptop. Characters: the audit's
// dense Kuni Shugenja (Void 3, 3 Void Points; Intimidation Rank 3) with Touch of the Void as its only Disadvantage, and
// the same with Seven Fortunes' Curse (Hotei) instead; both copied into this folder.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const TOUCH = path.join(__dirname, 'touch-of-the-void.l5r.json'), TOUCH_NAME = 'A19 Touch of the Void';
const HOTEI = path.join(__dirname, 'hotei-curse.l5r.json'), HOTEI_NAME = 'A19 Hotei';
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
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const wait = ms => new Promise(r => setTimeout(r, ms));
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
const SPENT_K1 = 'Spent: +1k1 on your next roll. Touch of the Void’s Willpower roll comes after that roll; Undo drops it.';
const UNDONE_K1 = 'Undone: the Void Point is back; +1k1 cleared; no Touch of the Void roll.';

function install() {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id), H = {};
  const shown = id => { const o = $(id); return !!o && getComputedStyle(o).display !== 'none'; };
  H.look = () => {
    const entry = T.getRoundLedger()[String(T.getCombatRound())] || {};
    const box = $('vu15Line'), btn = box && !box.hidden ? box.querySelector('button') : null;
    return {points: $('void_current').value, pending: $('voidPendingEffects').value, round: T.getCombatRound(),
      spend: entry.void === undefined ? null : entry.void, voidTN: !!entry.voidTN, armorTN: T.getVoidArmorTNBonus(),
      initiative: T.getVoidInitiativeBonus(), wounds: $('f_woundsTaken').value, owed: T.VI4533.owed,
      // The line's words as drawn, without the button's own label.
      line: box && !box.hidden && box.offsetParent !== null
        ? Array.from(box.childNodes).filter(n => n !== btn).map(n => n.textContent).join('').trim() : '',
      undo: !!btn && btn.offsetParent !== null && btn.textContent === 'Undo',
      greyed: Array.from(document.querySelectorAll('#voidSpendButtons button')).filter(b => b.disabled).length,
      status: $('statusMsg').textContent};
  };
  H.preview = () => shown('rollPreviewOverlay');
  H.result = () => shown('rollModalOverlay');
  H.previewTitle = () => $('rollPreviewSubtitle').textContent;
  H.pool = () => { const p = document.querySelector('#rollPreviewBody .rp-pool-final'); return p ? p.textContent : null; };
  H.data = () => { const d = T.collectData(); delete d.auditLog; return d; };
  window.VUH = H;
}
const look = page => page.evaluate(() => window.VUH.look());
async function load(page, file, name) {
  await page.locator('#fileImport').setInputFiles(file);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, name);
  await settle(page);
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
  await load(page, TOUCH, TOUCH_NAME);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
  await page.evaluate(install);
  return {context, page, errors};
}
// A player's tap (phone) or click (laptop).
const press = async (page, phone, selector) => { const b = page.locator(selector).first(); await b.scrollIntoViewIfNeeded(); if (phone) await b.tap(); else await b.click(); await settle(page); };
const spend = (page, phone, key) => press(page, phone, `#voidSpendButtons button[data-void="${key}"]`);
// Without the unit there is no button: nothing is pressed, and the checks then read the values as they are.
const undo = async (page, phone) => { if (await page.locator('#vu15Line button').count()) await press(page, phone, '#vu15Line button'); };
// Touch of the Void's Willpower roll, when it opens: what it was, then Cancel.
async function cancelTouch(page, phone, ms = 1500) {
  for (const end = Date.now() + ms; Date.now() < end;) {
    if (await page.evaluate(() => window.VUH.preview())) {
      const title = await page.evaluate(() => window.VUH.previewTitle());
      await press(page, phone, '#rollPreviewCancel');
      await wait(200);
      return title;
    }
    await wait(100);
  }
  return null;
}
// Touch of the Void's Willpower roll, when it opens: rolled (Roll, then the result window closed). Its title, or null.
async function rollTouch(page, phone, ms = 1500) {
  for (const end = Date.now() + ms; Date.now() < end;) {
    if (await page.evaluate(() => window.VUH.preview())) {
      const title = await page.evaluate(() => window.VUH.previewTitle());
      await press(page, phone, '#rollPreviewGo');
      await page.waitForFunction(() => window.VUH.result());
      await wait(200);
      await press(page, phone, '#rollModalClose');
      await wait(300);
      return title;
    }
    await wait(100);
  }
  return null;
}
const TOUCH_MADE = ' Touch of the Void’s Willpower roll was made; after Undo it no longer counts.';
const TOUCH_UNDONE = ' The Touch of the Void roll made for it no longer counts: tell the GM if it left you Dazed.';
// A fresh fight: the character opened again, the Round tracker reset, Combat active or not, no roll owed.
async function fresh(page, phone, combat, file = TOUCH, name = TOUCH_NAME) {
  if (await page.evaluate(() => window.VUH.preview())) await press(page, phone, '#rollPreviewCancel');
  if (await page.evaluate(() => window.VUH.result())) await press(page, phone, '#rollModalClose');
  await load(page, file, name);
  // Opening a character leaves Play; the Combat page is a Play page.
  await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('play'); window.__L5R_TEST__.VI4533.owed = 0; });
  await goTab(page, 'Combat');
  await press(page, phone, '#btnResetRounds');
  const on = await page.evaluate(() => document.getElementById('combatActiveToggle').checked);
  if (on !== combat) await press(page, phone, '#combatActiveToggle');
}
// The Intimidation roll from its Skill row: the preview's pool, then Roll (or Cancel); after the result window closes,
// whether a Touch of the Void roll opened (cancelled here).
async function intimidation(page, phone, {roll = true, voidOnRoll = false} = {}) {
  await goTab(page, 'Skills');
  await press(page, phone, '#skillsBody tr:has(.sk-name[value="Intimidation"]) .sk-roll');
  await page.waitForFunction(() => window.VUH.preview());
  if (voidOnRoll) { await press(page, phone, '#rollPreviewBody input[data-void-key="k1"]'); }
  const pool = await page.evaluate(() => window.VUH.pool());
  if (!roll) { await press(page, phone, '#rollPreviewCancel'); await goTab(page, 'Combat'); return {pool, touch: null}; }
  await press(page, phone, '#rollPreviewGo');
  await page.waitForFunction(() => window.VUH.result());
  await wait(200);
  await press(page, phone, '#rollModalClose');
  const touch = await cancelTouch(page, phone, 1200);
  await goTab(page, 'Combat');
  return {pool, touch};
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('VU-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {vu: !!T.VU15 && T.VU15.installed === true, on: T.VOID_SPEND_UNDO_ENABLED}; });
        return [r.vu && r.on === true, r];
      });
      await fresh(page, P, true);
      await check('VU-NO-LINE-BEFORE-SPEND-PHONE', async () => { const a = await look(page); return [a.line === '' && !a.undo && a.points === '3' && a.greyed === 0, a]; });
      await spend(page, P, 'k1');
      const spent = await look(page);
      await check('VU-K1-SPENT-LINE-PHONE', async () => [spent.line === SPENT_K1 && spent.undo && spent.points === '2' &&
        spent.pending === '{"k1":true}' && spent.spend === 'k1' && spent.owed === 1 && spent.greyed === 6, spent]);
      await undo(page, P);
      const undone = await look(page);
      await check('VU-K1-UNDO-RESTORES-PHONE', async () => [undone.points === '3' && undone.pending === '{}' && undone.spend === null &&
        undone.owed === 0 && undone.greyed === 0 && !undone.undo && undone.line === UNDONE_K1 && undone.status === UNDONE_K1, undone]);
      await check('VU-K1-NO-TOUCH-ROLL-AFTER-UNDO-PHONE', async () => {
        const r = await intimidation(page, P);
        const a = await look(page);
        return [r.pool === '5k2' && r.touch === null && a.points === '3' && a.line === '', {r, a}];
      });
      await check('VU-TN-TOUCH-CANCELLED-UNDO-PHONE', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'tn');
        const touch = await cancelTouch(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [touch === 'Touch of the Void — Willpower vs TN 30' && a.armorTN === 10 && a.undo &&
          a.line === 'Spent: +10 TN to be hit, this Round. Touch of the Void’s Willpower roll was not made.' &&
          b.armorTN === 0 && b.points === '3' && b.spend === null && !b.voidTN && b.owed === 0 && !b.undo &&
          b.line === 'Undone: the Void Point is back; Armor TN back to normal.', {touch, a, b}];
      });
      await check('VU-ROLL-ENDS-PHONE', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'k1');
        const a = await look(page);
        const r = await intimidation(page, P);
        const b = await look(page);
        // The roll used the armed +1k1 (Touch of the Void makes it +2k1); its Willpower roll followed; Undo has gone.
        return [a.undo && r.pool === '7k3' && r.touch === 'Touch of the Void — Willpower vs TN 30' && !b.undo && b.line === '' &&
          b.points === '2' && b.pending === '{}', {a, r, b}];
      });
      await check('VU-CANCELLED-PREVIEW-KEEPS-PHONE', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'k1');
        const r = await intimidation(page, P, {roll: false});
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [r.pool === '7k3' && a.undo && a.line === SPENT_K1 && b.points === '3' && b.pending === '{}' && b.owed === 0 && b.line === UNDONE_K1, {r, a, b}];
      });
      // Revision 1 (the owner's device round, 19 November 2026): Touch of the Void's own save, rolled, keeps Undo.
      await check('VU-TOUCH-SAVE-KEEPS-UNDO-PHONE', async () => {
        await fresh(page, P, true);
        await press(page, P, '#voidSpendButtons button[data-void="damage"]');
        await page.fill('#voidDamageInput', '25');
        await press(page, P, '#voidDamageApply');
        const touch = await rollTouch(page, P);
        await goTab(page, 'Combat');
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [touch === 'Touch of the Void — Willpower vs TN 30' && a.undo && a.wounds === '15' &&
          a.line === 'Spent: damage reduced by 10; 15 Wounds taken.' + TOUCH_MADE &&
          b.wounds === '0' && b.points === '3' && b.spend === null && !b.undo &&
          b.line === 'Undone: the Void Point is back; the 15 Wounds taken back.' + TOUCH_UNDONE, {touch, a, b}];
      });
      await check('VU-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const P = false;
      await check('VU-NEXT-ROUND-ENDS-DESKTOP', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'k1');
        const a = await look(page);
        await press(page, P, '#btnNextRound');
        const b = await look(page);
        return [a.undo && !b.undo && b.line === '' && b.round === 2 && b.pending === '{"k1":true}' && b.points === '2', {a, b}];
      });
      await check('VU-RESET-ENDS-DESKTOP', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'tn');
        await cancelTouch(page, P);
        const a = await look(page);
        await press(page, P, '#btnResetRounds');
        const b = await look(page);
        return [a.undo && !b.undo && b.line === '' && b.armorTN === 0 && b.points === '2', {a, b}];
      });
      await check('VU-LATEST-SPEND-ONLY-DESKTOP', async () => {
        await fresh(page, P, false);
        await spend(page, P, 'skill');
        await spend(page, P, 'k1');
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.points === '1' && a.pending === '{"k1":true}' && a.undo && b.points === '2' && b.pending === '{"skill":true}' &&
          b.owed === 1 && b.line === UNDONE_K1, {a, b}];
      });
      await check('VU-DOUBLE-UNDO-ONCE-DESKTOP', async () => {
        await fresh(page, P, false);
        await spend(page, P, 'k1');
        const box = await page.locator('#vu15Line button').count() ? await page.locator('#vu15Line button').boundingBox() : null;
        if (box) await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
        await settle(page);
        const b = await look(page);
        return [b.points === '3' && b.pending === '{}' && !b.undo && b.line === UNDONE_K1, b];
      });
      await check('VU-PIP-TAP-ENDS-DESKTOP', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'k1');
        const a = await look(page);
        await goTab(page, 'Rings & Traits');
        await press(page, P, '#voidPips .void-pip:not(.filled)');
        await goTab(page, 'Combat');
        const b = await look(page);
        return [a.undo && !b.undo && b.line === '' && b.points === '3' && b.pending === '{"k1":true}', {a, b}];
      });
      await check('VU-PREVIEW-VOID-SPEND-NOT-COVERED-DESKTOP', async () => {
        await fresh(page, P, true);
        const r = await intimidation(page, P, {voidOnRoll: true});
        const b = await look(page);
        return [r.pool === '7k3' && r.touch === 'Touch of the Void — Willpower vs TN 30' && b.points === '2' && b.spend === 'k1' &&
          !b.undo && b.line === '', {r, b}];
      });
      await check('VU-DAMAGE-UNDO-DESKTOP', async () => {
        await fresh(page, P, true);
        await press(page, P, '#voidSpendButtons button[data-void="damage"]');
        await page.fill('#voidDamageInput', '25');
        await press(page, P, '#voidDamageApply');
        await cancelTouch(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.wounds === '15' && a.points === '2' && a.undo && a.line === 'Spent: damage reduced by 10; 15 Wounds taken. Touch of the Void’s Willpower roll was not made.' &&
          b.wounds === '0' && b.points === '3' && b.spend === null && b.line === 'Undone: the Void Point is back; the 15 Wounds taken back.', {a, b}];
      });
      await check('VU-INITIATIVE-UNDO-DESKTOP', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'init');
        await cancelTouch(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.initiative === 10 && a.undo && b.initiative === 0 && b.points === '3' && b.spend === null &&
          b.line === 'Undone: the Void Point is back; Initiative back to normal.', {a, b}];
      });
      await check('VU-HOTEI-TWO-POINTS-UNDO-DESKTOP', async () => {
        await fresh(page, P, true, HOTEI, HOTEI_NAME);
        await press(page, P, '#voidSpendButtons button.hotei4536-spend');
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.points === '1' && a.undo && a.line === 'Spent: 2 Void Points for a Technique or Advantage (Hotei’s Curse).' &&
          b.points === '3' && b.spend === null && !b.undo && b.line === 'Undone: both Void Points are back.', {a, b}];
      });
      await check('VU-OPEN-ENDS-DESKTOP', async () => {
        await fresh(page, P, false);
        await spend(page, P, 'k1');
        const a = await look(page);
        await load(page, TOUCH, TOUCH_NAME);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
        await goTab(page, 'Combat');
        const b = await look(page);
        return [a.undo && !b.undo && b.line === '', {a, b}];
      });
      await check('VU-KEYBOARD-UNDO-FOCUS-DESKTOP', async () => {
        await fresh(page, P, false);
        await spend(page, P, 'k1');
        if (await page.locator('#vu15Line button').count()) { await page.locator('#vu15Line button').focus(); await page.keyboard.press('Enter'); }
        await settle(page);
        const b = await look(page);
        const focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
        return [b.points === '3' && b.line === UNDONE_K1 && focus === 'vu15Line', {b, focus}];
      });
      await check('VU-SAVE-DATA-UNCHANGED-DESKTOP', async () => {
        await fresh(page, P, true);
        const before = await page.evaluate(() => window.VUH.data());
        await spend(page, P, 'k1');
        const during = await page.evaluate(() => window.VUH.data());
        await undo(page, P);
        const after = await page.evaluate(() => window.VUH.data());
        const text = JSON.stringify(after);
        return [same(before, after) && during.voidCurrent === '2' && after.voidCurrent === '3' && !/vu15|VU15/.test(text) &&
          same(Object.keys(before).sort(), Object.keys(after).sort()), {before: before.voidCurrent, during: during.voidCurrent, after: after.voidCurrent}];
      });
      await check('VU-TOUCH-SAVE-KEEPS-UNDO-DESKTOP', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'tn');
        const touch = await rollTouch(page, P);
        await goTab(page, 'Combat');
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [touch === 'Touch of the Void — Willpower vs TN 30' && a.undo && a.armorTN === 10 &&
          a.line === 'Spent: +10 TN to be hit, this Round.' + TOUCH_MADE &&
          b.armorTN === 0 && b.points === '3' && b.spend === null && !b.voidTN && b.owed === 0 &&
          b.line === 'Undone: the Void Point is back; Armor TN back to normal.' + TOUCH_UNDONE, {touch, a, b}];
      });
      await check('VU-TOUCH-SAVE-THEN-ROLL-ENDS-DESKTOP', async () => {
        await fresh(page, P, true);
        await spend(page, P, 'tn');
        const touch = await rollTouch(page, P);
        await goTab(page, 'Combat');
        const a = await look(page);
        const r = await intimidation(page, P);
        const b = await look(page);
        return [touch !== null && a.undo && r.pool === '5k2' && !b.undo && b.line === '' && b.armorTN === 10, {a, r, b}];
      });
      await check('VU-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
