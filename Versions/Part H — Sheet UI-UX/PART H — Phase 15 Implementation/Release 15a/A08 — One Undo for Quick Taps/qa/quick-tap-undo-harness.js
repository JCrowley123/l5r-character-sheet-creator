'use strict';
// Release 15a, unit A08 (PART H PHASE 15.1.31): quick − / + taps on one card within five seconds of each other are one
// change for Undo and for History (approved by the owner on 14 November 2026).   node quick-tap-undo-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the values the sheet reads back (CP7.read), the message and the Undo button as
// drawn, the History (AL71's entries), the saved character (collectData, and the stored copy in localStorage), and the
// same steps a player takes: real taps on a touch phone, real clicks on a laptop. The unit's own state is read only to
// say whether it is there (the seam). Character: the audit's dense Kuni Shugenja (Honour 4.7, Glory 3.12, Status 1.0,
// Taint 2.3), copied into this folder. Each check starts from a sheet reset by the sheet's own clear and the values seeded.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const DENSE = path.join(__dirname, 'dense-kuni.l5r.json'), DENSE_NAME = 'Phase 15 dense audit';
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
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

function install() {
  const T = window.__L5R_TEST__, H = {};
  H.read = n => { const s = T.CP7.read(n); return s ? s.rank + '.' + s.points : null; };
  H.seed = (n, r, p) => { if (n === 'taint') T.TA7.write(r, p); else { T.RP7.write(n, r, p); T.RP7.changed(n); } T.CP7.renderAll(); };
  // The sheet's own clear (as a load or a reset runs it): no Undo, no message, amounts back to 1.
  H.fresh = () => { T.CP7.clear(); };
  H.notice = () => document.getElementById('cp7-notice').textContent;
  H.undoShown = () => !document.getElementById('cp7-undo').hidden;
  // History: settle what is pending, then count; later, the entries for one name since that count.
  H.mark = () => { T.AL71.check(); return T.AL71.entries().length; };
  H.since = (n, what) => { T.AL71.check(); return T.AL71.entries().slice(n).filter(e => e.what === what).map(e => e.from + '→' + e.to); };
  H.data = () => { const d = T.collectData(); delete d.auditLog; return d; };
  window.QTH = H;
}
const H = (page, fn, arg) => page.evaluate(fn, arg);
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
// A player's tap (phone) or click (laptop) on a card's − or +, or on Undo.
const press = async (page, phone, label) => { const b = page.getByRole('button', {name: label, exact: true}); if (phone) await b.tap(); else await b.click(); };
const plus = (page, phone, title = 'Honour') => press(page, phone, 'Add ' + title + ' points');
const minus = (page, phone, title = 'Honour') => press(page, phone, 'Subtract ' + title + ' points');
const undo = async (page, phone) => { const b = page.locator('#cp7-undo'); if (phone) await b.tap(); else await b.click(); await settle(page); };
const look = page => page.evaluate(() => ({honor: window.QTH.read('honor'), notice: window.QTH.notice(), undo: window.QTH.undoShown()}));
const fresh = async (page, seeds) => { await page.evaluate(s => { window.QTH.fresh(); s.forEach(x => window.QTH.seed(...x)); }, seeds); await settle(page); };

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE, 'play');
      const P = true;
      await check('QT-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {qt: !!T.QT15 && T.QT15.installed === true, on: T.QUICK_TAP_UNDO_ENABLED}; });
        return [r.qt && r.on === true, r];
      });
      await check('QT-ONE-TAP-AS-BEFORE-PHONE', async () => {
        await fresh(page, [['honor', 4, 7]]);
        await plus(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.honor === '4.8' && a.notice === 'Honour: Rank 4, Points 8.' && a.undo &&
          b.honor === '4.7' && b.notice === 'Undone. Honour: Rank 4, Points 7.' && !b.undo, {a, b}];
      });
      await check('QT-QUICK-BURST-ONE-UNDO-PHONE', async () => {
        await fresh(page, [['honor', 4, 7]]);
        for (let i = 0; i < 3; i++) await plus(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.honor === '5.0' && a.notice === 'Honour: Rank 5, Points 0. Undo takes back all 3 taps.' && a.undo &&
          b.honor === '4.7' && b.notice === 'Undone. Honour: Rank 4, Points 7.' && !b.undo, {a, b}];
      });
      // Three taps two seconds apart; six seconds later the group has ended by itself; History, then Undo.
      {
        await fresh(page, [['honor', 4, 7]]);
        const n0 = await page.evaluate(() => window.QTH.mark());
        for (let i = 0; i < 3; i++) { await plus(page, P); if (i < 2) await wait(2000); }
        await wait(6000);
        const a = await look(page);
        const history = await page.evaluate(n => window.QTH.since(n, 'Honor'), n0);
        await undo(page, P);
        const b = await look(page);
        await check('QT-HISTORY-ONE-ENTRY-PHONE', async () => [same(history, ['4.7→5.0']), history]);
        await check('QT-SPACED-TAPS-ONE-GROUP-PHONE', async () => [a.honor === '5.0' && a.notice === 'Honour: Rank 5, Points 0. Undo takes back all 3 taps.' &&
          b.honor === '4.7' && b.notice === 'Undone. Honour: Rank 4, Points 7.' && !b.undo, {a, b}]);
      }
      await check('QT-UNDO-IN-WINDOW-NO-ENTRY-PHONE', async () => {
        await fresh(page, [['honor', 4, 7]]);
        const n0 = await page.evaluate(() => window.QTH.mark());
        await plus(page, P); await plus(page, P);
        await undo(page, P);
        await wait(2000);
        const history = await page.evaluate(n => window.QTH.since(n, 'Honor'), n0), b = await look(page);
        return [history.length === 0 && b.honor === '4.7', {history, b}];
      });
      await check('QT-GAP-OVER-FIVE-SECONDS-NEW-GROUP-PHONE', async () => {
        await fresh(page, [['honor', 4, 7]]);
        await plus(page, P);
        await wait(5600);
        await plus(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.honor === '4.9' && a.notice === 'Honour: Rank 4, Points 9.' && b.honor === '4.8' && b.notice === 'Undone. Honour: Rank 4, Points 8.', {a, b}];
      });
      await check('QT-MINUS-AND-PLUS-ONE-GROUP-PHONE', async () => {
        await fresh(page, [['honor', 4, 7]]);
        await plus(page, P); await plus(page, P); await minus(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.honor === '4.8' && a.notice === 'Honour: Rank 4, Points 8. Undo takes back all 3 taps.' && b.honor === '4.7' &&
          b.notice === 'Undone. Honour: Rank 4, Points 7.', {a, b}];
      });
      await check('QT-OTHER-CARD-ENDS-PHONE', async () => {
        await fresh(page, [['honor', 4, 7], ['glory', 3, 12]]);
        await plus(page, P); await plus(page, P);
        await plus(page, P, 'Glory');
        await undo(page, P);
        const r = await page.evaluate(() => ({honor: window.QTH.read('honor'), glory: window.QTH.read('glory'), notice: window.QTH.notice(), undo: window.QTH.undoShown()}));
        return [r.honor === '4.9' && r.glory === '3.12' && r.notice === 'Undone. Glory: Rank 3, Points 12.' && !r.undo, r];
      });
      await check('QT-PAGE-MOVE-KEEPS-GROUP-PHONE', async () => {
        await fresh(page, [['honor', 4, 7]]);
        await plus(page, P);
        // A player moves to another page with the tab bar and comes back, then taps again within five seconds.
        await page.locator('.car-tab', {hasText: 'Rings & Traits'}).click();
        await page.evaluate(async () => { await window.__L5R_CAROUSEL__.whenSettled(); });
        await page.locator('.car-tab', {hasText: 'Identity'}).click();
        await page.evaluate(async () => { await window.__L5R_CAROUSEL__.whenSettled(); });
        await settle(page);
        await plus(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.honor === '4.9' && b.honor === '4.7' && b.notice === 'Undone. Honour: Rank 4, Points 7.', {a, b}];
      });
      await check('QT-HISTORY-MENU-ENDS-AND-MERGES-PHONE', async () => {
        await fresh(page, [['honor', 4, 7]]);
        const n0 = await page.evaluate(() => window.QTH.mark());
        await plus(page, P);
        await wait(1800);   // History has written the first tap by now
        await plus(page, P);
        // The History item in the sheet's ⋯ menu, as the menu's own click reaches it.
        await page.evaluate(() => document.getElementById('al71SheetHistory').click());
        await settle(page);
        const top = await page.evaluate(() => { const e = document.querySelector('#al71List li'); return e ? e.textContent : null; });
        const history = await page.evaluate(n => window.QTH.since(n, 'Honor'), n0);
        await page.evaluate(() => document.getElementById('al71Close').click());
        await plus(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [same(history, ['4.7→4.9']) && !!top && top.includes('4.7 → 4.9') && a.notice === 'Honour: Rank 5, Points 0.' && b.honor === '4.9', {history, top, a, b}];
      });
      await check('QT-TAINT-GROUP-PHONE', async () => {
        await fresh(page, [['taint', 2, 3]]);
        const n0 = await page.evaluate(() => window.QTH.mark());
        for (let i = 0; i < 3; i++) await plus(page, P, 'Taint');
        const a = await page.evaluate(() => ({taint: window.QTH.read('taint'), notice: window.QTH.notice()}));
        await undo(page, P);
        await wait(2000);
        const b = await page.evaluate(() => ({taint: window.QTH.read('taint'), notice: window.QTH.notice()}));
        const history = await page.evaluate(n => window.QTH.since(n, 'Taint'), n0);
        return [a.taint === '2.6' && a.notice === 'Taint: Rank 2, Points 6. Undo takes back all 3 taps.' && b.taint === '2.3' &&
          b.notice === 'Undone. Taint: Rank 2, Points 3.' && history.length === 0, {a, b, history}];
      });
      await check('QT-SAVE-DATA-UNCHANGED-PHONE', async () => {
        await fresh(page, [['honor', 4, 7]]);
        const before = await page.evaluate(() => window.QTH.data());
        for (let i = 0; i < 3; i++) await plus(page, P);
        const during = await page.evaluate(() => Object.keys(window.__L5R_TEST__.collectData()).sort());
        await undo(page, P);
        const after = await page.evaluate(() => window.QTH.data());
        const keys = Object.keys(before).concat('auditLog').sort();
        return [same(before, after) && same(during, keys.filter((k, i) => keys.indexOf(k) === i)), {during, keys, equal: same(before, after)}];
      });
      await check('QT-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Manage ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP, 'management');
      const P = false;
      await check('QT-TYPED-VALUE-ENDS-DESKTOP', async () => {
        await fresh(page, [['honor', 4, 7]]);
        await plus(page, P); await plus(page, P);
        const box = page.locator('#ce7-honor-points');
        await box.fill('5');
        await box.press('Enter');
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        return [a.honor === '4.5' && b.honor === '4.9' && b.notice === 'Undone. Honour: Rank 4, Points 9.', {a, b}];
      });
      await check('QT-RECOGNITION-ENDS-DESKTOP', async () => {
        await fresh(page, [['glory', 5, 19]]);
        await plus(page, P, 'Glory'); await plus(page, P, 'Glory');
        await page.locator('[data-cp7=glory] .ce7-recognition').click();
        const a = await page.evaluate(() => window.QTH.read('glory'));
        await undo(page, P);
        const b = await page.evaluate(() => window.QTH.read('glory'));
        return [a === '7.1' && b === '5.21', {a, b}];
      });
      await check('QT-EDIT-ELSEWHERE-ENDS-DESKTOP', async () => {
        await fresh(page, [['honor', 4, 7]]);
        await plus(page, P);
        const name = page.locator('#f_age');
        const old = await name.inputValue();
        await name.fill('31');
        await plus(page, P);
        const a = await look(page);
        await undo(page, P);
        const b = await look(page);
        await name.fill(old);
        return [a.honor === '4.9' && a.notice === 'Honour: Rank 4, Points 9.' && b.honor === '4.8', {a, b}];
      });
      await check('QT-OPEN-DROPS-GROUP-DESKTOP', async () => {
        await fresh(page, [['honor', 4, 7]]);
        await plus(page, P); await plus(page, P);
        await page.evaluate(() => { const T = window.__L5R_TEST__; T.applyData(T.collectData()); });
        await settle(page);
        const a = await look(page);
        await plus(page, P);
        const b = await look(page);
        await undo(page, P);
        const c = await look(page);
        return [a.honor === '4.9' && !a.undo && b.notice === 'Honour: Rank 5, Points 0.' && c.honor === '4.9', {a, b, c}];
      });
      // Saved with Save: the stored copy carries the group's one History entry, and Undo has gone, as after any save.
      let savedId = null;
      await check('QT-SAVE-ENDS-GROUP-DESKTOP', async () => {
        await fresh(page, [['honor', 4, 7]]);
        const n0 = await page.evaluate(() => window.QTH.mark());
        await plus(page, P); await plus(page, P);
        await page.locator('#btnSave').click();
        await page.waitForFunction(() => !!document.getElementById('charSelect').value);
        await page.waitForFunction(id => !!localStorage.getItem('l5r-sheet:local:l5r-char:' + id), await page.evaluate(() => document.getElementById('charSelect').value));
        await settle(page);
        savedId = await page.evaluate(() => document.getElementById('charSelect').value);
        const stored = await page.evaluate(id => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char:' + id)), savedId);
        const history = (stored.auditLog || []).slice(n0).filter(e => e.what === 'Honor').map(e => e.from + '→' + e.to);
        const a = await look(page);
        return [same(history, ['4.7→4.9']) && stored.fields.f_honorRank === '4' && stored.fields.f_honorPts === '9' && !a.undo, {history, a}];
      });
      // The saved character opened from the Characters list in Play: three taps two seconds apart, then autosave
      // writes the merged History; Undo still takes all three back.
      await check('QT-LISTED-PLAY-AUTOSAVE-MERGED-DESKTOP', async () => {
        await page.evaluate(() => { document.getElementById('charSelect').value = ''; document.getElementById('btnLoad').click(); });
        await page.waitForFunction(() => document.getElementById('f_name').value === '');
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
        await page.evaluate(id => window.__L5R_TEST__.CL11.openCharacter(id), savedId);
        await page.waitForFunction(n => document.getElementById('f_name').value === n, DENSE_NAME);
        await goTab(page, 'Identity');
        const n0 = await page.evaluate(() => window.QTH.mark());
        for (let i = 0; i < 3; i++) { await plus(page, P); if (i < 2) await wait(2000); }
        await wait(7500);
        const stored = await page.evaluate(id => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char:' + id)), savedId);
        const history = (stored.auditLog || []).slice(n0).filter(e => e.what === 'Honor').map(e => e.from + '→' + e.to);
        const a = await look(page), play = await page.evaluate(() => window.__L5R_TEST__.MODES12.isPlay());
        await undo(page, P);
        const b = await look(page);
        return [play && same(history, ['4.9→5.2']) && stored.fields.f_honorRank === '5' && stored.fields.f_honorPts === '2' &&
          a.notice === 'Honour: Rank 5, Points 2. Undo takes back all 3 taps.' && b.honor === '4.9', {play, history, a, b}];
      });
      await check('QT-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
