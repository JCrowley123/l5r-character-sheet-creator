'use strict';
// Release 15b, unit A14 (PART H PHASE 15.2.1): one net Wound penalty, its parts behind an i (approved by the owner on
// 20 November 2026 as mocked up and revised).   node net-wound-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the texts a player reads and hears, written out here from the owner's example
// (Earth 2, campaign multiplier 2, 12 Wounds: Nicked; Low Pain Threshold +5 and Strength of the Earth -3, Core
// Rulebook pp.160 and 154), the window's rows as drawn, the preview's rows as drawn, and the penalty a roll gets. The
// unit's own state is read only to say whether it is there (the seam). A level's rule text is the sheet's own data
// (WOUND_LEVELS). Real taps on a touch phone, real clicks on a laptop. Character: the audit's dense Kuni Shugenja with
// Strength of the Earth and Low Pain Threshold, copied into this folder.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = path.join(__dirname, 'net-wound.l5r.json'), FX_NAME = 'A14 net wound';
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

// What a player reads, written out (the owner's example).
const LINE = 'Nicked — TN of all rolls +5 — 12 of 38 wound points';
const LEVELS = ['Healthy — No TN penalty', 'Nicked — TN of all rolls +5', 'Grazed — TN of all rolls +7', 'Hurt — TN of all rolls +12',
  'Injured — TN of all rolls +17', 'Crippled — TN of all rolls +22', 'Down — TN of all rolls +42', 'Out — Unconscious'];
const LPT = ['Low Pain Threshold', 'Disadvantage, Core Rulebook p.160', '+5'];
const SOTE = ['Strength of the Earth', 'Advantage, Core Rulebook p.154', '−3'];
const NICKED_ROWS = [['Nicked', 'Wound Rank penalty', '+3'], LPT, SOTE, ['TN of all rolls', '', '+5']];
const GRAZED_ROWS = [['Grazed', 'Wound Rank penalty', '+5'], LPT, SOTE, ['TN of all rolls', '', '+7']];

function install() {
  const $ = id => document.getElementById(id), H = {};
  const box = e => { const q = e.getBoundingClientRect(); return {left: Math.round(q.left), right: Math.round(q.right), top: Math.round(q.top), bottom: Math.round(q.bottom), width: Math.round(q.width), height: Math.round(q.height)}; };
  const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  H.line = () => { const line = $('woundSummaryLine'), btn = line.querySelector('button');
    return {text: line.textContent, button: btn ? {shown: shown(btn), name: btn.getAttribute('aria-label'), own: btn.textContent, box: box(btn)} : null,
      box: box(line), card: box(line.closest('.section') || line.parentElement), docScroll: document.documentElement.scrollWidth, vw: innerWidth}; };
  H.qa = () => { const v = $('qaWoundsValue'), btn = v.querySelector('button');
    return {text: v.textContent, button: btn ? {shown: shown(btn), name: btn.getAttribute('aria-label')} : null}; };
  H.levels = () => Array.from(document.querySelectorAll('#woundBar .wound-seg')).map(s => s.getAttribute('aria-label'));
  H.window = () => { const o = $('woundInfoModalOverlay'), d = $('woundInfoDesc');
    const rows = Array.from(d.querySelectorAll('tr')).map(tr => { const c = tr.cells, small = c[0].querySelector('small');
      return [c[0].firstChild ? c[0].firstChild.textContent : '', small ? small.textContent : '', c[1].textContent]; });
    const ps = Array.from(d.querySelectorAll('p')).map(p => p.textContent);
    return {open: getComputedStyle(o).display !== 'none', title: $('woundInfoTitle').textContent, pen: $('woundInfoPen').textContent, rows,
      after: ps, text: d.textContent}; };
  H.close = () => { $('woundInfoClose').click(); };
  H.rule = name => window.__L5R_TEST__.WOUND_LEVELS.find(l => l.name === name).desc;
  H.drop = name => { document.querySelectorAll('#advList .entry, #disadvList .entry').forEach(div => {
    const n = div.querySelector('.en-name'); if (n && n.value === name) div.remove(); }); window.__L5R_TEST__.recalcAll(); };
  H.wounds = n => { const e = $('f_woundsTaken'); e.value = n; e.dispatchEvent(new Event('input', {bubbles: true})); };
  H.preview = () => Array.from(document.querySelectorAll('#rollPreviewBody .rp-mod')).map(r => r.textContent.replace(/\s+/g, ' ').trim());
  window.WPH = H;
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
  await page.evaluate(() => window.WPH.wounds(12));
  await goTo(page, 'Combat');
  return {context, page, errors};
}
const goTo = async (page, label) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label); await settle(page); };
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
const lineInfo = page => page.locator('#woundSummaryLine button').first();
async function defensePreview(page, phone) {
  await goTo(page, 'Skills');
  const row = page.locator('#skillsBody tr', {has: page.locator('.sk-name[value="Defense"]')});
  await press(page, phone, row.locator('.sk-roll'));
  await page.waitForFunction(() => getComputedStyle(document.getElementById('rollPreviewOverlay')).display !== 'none');
  await settle(page);
  const rows = await page.evaluate(() => window.WPH.preview());
  await press(page, phone, page.locator('#rollPreviewCancel'));
  await goTo(page, 'Combat');
  return rows;
}
const woundRows = rows => rows.filter(r => /^Wound Penalty/.test(r));
const previewOk = rows => same(woundRows(rows), ['Wound Penalty-5 to total — Nicked']) && !rows.some(r => /→|already included/.test(r));

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('WP-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {wp: !!T.WP15 && T.WP15.installed === true, on: T.NET_WOUND_PENALTY_ENABLED}; });
        return [r.wp && r.on === true, r];
      });
      const line = await page.evaluate(() => window.WPH.line());
      await check('WP-LINE-NET-PHONE', async () => [line.text === LINE, line.text]);
      await check('WP-LEVEL-NAMES-NET-PHONE', async () => { const l = await page.evaluate(() => window.WPH.levels()); return [same(l, LEVELS), l]; });
      await check('WP-LINE-I-PHONE', async () => { const b = line.button;
        return [!!b && b.shown && b.own === '' && b.name === 'Wound penalty: how it is worked out' && line.docScroll === line.vw &&
          b.box.left >= line.card.left && b.box.right <= line.card.right && b.box.top >= line.box.top - 2 && b.box.bottom <= line.box.bottom + 2, line]; });
      await check('WP-WINDOW-BREAKDOWN-PHONE', async () => {
        await press(page, P, lineInfo(page));
        const w = await page.evaluate(() => window.WPH.window());
        const rule = await page.evaluate(() => window.WPH.rule('Nicked'));
        await page.evaluate(() => window.WPH.close()); await settle(page);
        return [w.open && w.title === 'Nicked' && w.pen === 'TN of all rolls +5' && same(w.rows, NICKED_ROWS) && same(w.after, [rule]), w];
      });
      await check('WP-LEVEL-OWN-SUMS-PHONE', async () => {
        await press(page, P, page.locator('#woundBar .wound-seg').nth(2));
        const w = await page.evaluate(() => window.WPH.window());
        const rule = await page.evaluate(() => window.WPH.rule('Grazed'));
        await page.evaluate(() => window.WPH.close()); await settle(page);
        return [w.open && w.title === 'Grazed' && w.pen === 'TN of all rolls +7' && same(w.rows, GRAZED_ROWS) && same(w.after, [rule]), w];
      });
      await check('WP-QA-NET-AND-I-PHONE', async () => {
        await press(page, P, page.locator('#quickAccessToggleBtn'));
        const qa = await page.evaluate(() => window.WPH.qa());
        await press(page, P, page.locator('#qaWoundsValue button').first());
        const w = await page.evaluate(() => window.WPH.window());
        await page.evaluate(() => window.WPH.close()); await settle(page);
        if (await page.evaluate(() => !document.getElementById('quickAccessPanel').hidden)) await press(page, P, page.locator('#quickAccessToggleBtn'));
        return [qa.text === LINE && !!qa.button && qa.button.shown && qa.button.name === 'Wound penalty: how it is worked out' &&
          w.open && w.title === 'Nicked' && same(w.rows, NICKED_ROWS), {qa, w}];
      });
      const rows = await defensePreview(page, P);
      await check('WP-PREVIEW-ONE-ROW-PHONE', async () => [previewOk(rows), rows]);
      await check('WP-PENALTY-UNCHANGED-PHONE', async () => { const n = await page.evaluate(() => window.__L5R_TEST__.getWoundPenalty()); return [n === -5, n]; });
      await check('WP-CANCELLED-EXPLAINED-PHONE', async () => {
        await page.evaluate(() => window.WPH.drop('Low Pain Threshold')); await settle(page);
        const l = await page.evaluate(() => window.WPH.line());
        await press(page, P, lineInfo(page));
        const w = await page.evaluate(() => window.WPH.window());
        await page.evaluate(() => window.WPH.close()); await settle(page);
        const n = await page.evaluate(() => window.__L5R_TEST__.getWoundPenalty());
        return [l.text === 'Nicked — No TN penalty — 12 of 38 wound points' && !!l.button && l.button.shown && n === 0 && w.title === 'Nicked' &&
          same(w.rows, [['Nicked', 'Wound Rank penalty', '+3'], SOTE, ['TN of all rolls', '', 'none']]), {l, w, n}];
      });
      await check('WP-NO-ENTRIES-NO-I-PHONE', async () => {
        await page.evaluate(() => window.WPH.drop('Strength of the Earth')); await settle(page);
        const l = await page.evaluate(() => window.WPH.line()), qa = await page.evaluate(() => window.WPH.qa());
        await press(page, P, page.locator('#woundBar .wound-seg').nth(1));
        const w = await page.evaluate(() => window.WPH.window());
        const rule = await page.evaluate(() => window.WPH.rule('Nicked'));
        await page.evaluate(() => window.WPH.close()); await settle(page);
        return [l.text === 'Nicked — TN of all rolls +3 — 12 of 38 wound points' && l.button === null && qa.button === null && qa.text === l.text &&
          w.pen === 'TN of all rolls +3' && w.rows.length === 0 && w.text === rule, {l, qa, w}];
      });
      await check('WP-HEALTHY-NO-I-PHONE', async () => {
        const fresh = await open(browser, DEVICES.PHONE);
        await fresh.page.evaluate(() => window.WPH.wounds(0)); await settle(fresh.page);
        const l = await fresh.page.evaluate(() => window.WPH.line()), qa = await fresh.page.evaluate(() => window.WPH.qa());
        await fresh.context.close();
        return [l.text === 'Healthy — No TN penalty — 0 of 38 wound points' && l.button === null && qa.button === null && fresh.errors.length === 0, {l, qa, errors: fresh.errors}];
      });
      await check('WP-PRINT-HIDES-I-PHONE', async () => {
        const fresh = await open(browser, DEVICES.PHONE);
        const before = await fresh.page.evaluate(() => window.WPH.line());
        await fresh.page.emulateMedia({media: 'print'}); await settle(fresh.page);
        const shown = await fresh.page.evaluate(() => { const b = document.querySelector('#woundSummaryLine button'); return !!b && b.getClientRects().length > 0 && getComputedStyle(b).display !== 'none'; });
        await fresh.context.close();
        return [!!before.button && before.button.shown && shown === false, {before: before.button, shown}];
      });
      await check('WP-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Play ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const P = false;
      await check('WP-LINE-AND-I-DESKTOP', async () => {
        const l = await page.evaluate(() => window.WPH.line());
        await press(page, P, lineInfo(page));
        const w = await page.evaluate(() => window.WPH.window());
        await page.evaluate(() => window.WPH.close()); await settle(page);
        const b = l.button;
        return [l.text === LINE && !!b && b.shown && l.box.height <= 40 && b.box.top >= l.box.top - 2 && b.box.bottom <= l.box.bottom + 2 &&
          w.open && w.title === 'Nicked' && same(w.rows, NICKED_ROWS), {l, w}];
      });
      const rows = await defensePreview(page, P);
      await check('WP-PREVIEW-ONE-ROW-DESKTOP', async () => [previewOk(rows), rows]);
      await check('WP-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
