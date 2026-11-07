'use strict';
// Release 15a, A16 (PART H PHASE 15.1.16): no bottom information button in the seven pickers (ruling Q3; mock-up
// option 1 approved 6 November 2026).
//   node picker-info-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL, and an
// exception inside a check is that check's FAIL with its reason. Oracles are independent of the layer: what the browser
// draws, the picker's own note, the text the bottom button opens when the same picker is reopened with the layer's body
// class taken away (the class gates the removal), and the row's own text and row i after Confirm. "Nothing is lost" is measured, not assumed:
// every sentence of the bottom panel must appear on the row or behind the row's i.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const FIX = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'g1-fixtures.json'), 'utf8'));
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const PHONE = {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true};
const DESKTOP = {viewport: {width: 1440, height: 1000}};
const SEVEN = [['A01', 'Seven Fortunes’ Blessing', 'fb4521-info'], ['A03', 'Dark Paragon', 'dp4523-info'],
  ['A04', 'Darling of the Court', 'court4514-info'], ['A09', 'Paragon', 'p4518-info'],
  ['A12', 'Soul of Artistry', 'sa4519-info'], ['A13', 'Touch of the Spirit Realms', 'tr4524-info'],
  ['A14', 'Void Versatility', 'vv4520-info']];
const norm = s => String(s || '').replace(/\s+/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();
const sentences = t => String(t || '').split(/\n+|(?<=[.!?])\s+(?=[A-Z“"(])/).map(s => s.trim()).filter(s => s.length > 12);

async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d); document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); }, FIX.dense);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
  await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab('Adv & Disadv'); await C.whenSettled(); } });
  return {context, page, errors};
}
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function quickAdd(page, name) {
  await page.evaluate(name => { const s = document.getElementById('advQuickAdd'); s.value = name;
    if (s.value !== name) throw Error('Missing catalogue option ' + name); s.dispatchEvent(new Event('change', {bubbles: true})); }, name);
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'}); await settle(page);
}
async function fillPicker(page, name) {
  if (name === 'Darling of the Court') {
    for (const [i, c] of ['Kyuden Bayushi', 'Toshi Ranbo'].entries()) {
      if (await page.locator('#advConfigGrid .court4514-input').count() <= i) await page.locator('#advConfigGrid .court4514-add').click();
      await page.locator('#advConfigGrid .court4514-input').nth(i).fill(c);
    }
    return;
  }
  await page.evaluate(() => {
    const g = document.getElementById('advConfigGrid'), done = new Set();
    for (const r of g.querySelectorAll('input[type=radio]')) { if (done.has(r.name)) continue; done.add(r.name); if (!r.disabled) r.click(); }
    for (const s of g.querySelectorAll('select')) { const o = [...s.options].find(o => o.value && !o.disabled); if (o) { s.value = o.value; s.dispatchEvent(new Event('change', {bubbles: true})); } }
    for (const t of g.querySelectorAll('input[type=text],input:not([type]),textarea')) if (!t.value) { t.value = 'Lore: History'; t.dispatchEvent(new Event('input', {bubbles: true})); }
  });
}
// The text a button opens in the sheet's information overlay; the overlay is closed again afterwards.
async function panel(page, locator) {
  await locator.evaluate(b => b.click()); await settle(page);
  const r = await page.evaluate(() => ({shown: getComputedStyle(document.getElementById('stanceInfoOverlay')).display !== 'none', body: document.getElementById('stanceInfoBody').textContent}));
  await page.evaluate(() => { document.getElementById('stanceInfoOverlay').style.display = 'none'; });
  return r;
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [device, opts] of [['phone', PHONE], ['desktop', DESKTOP]]) {
      const D = device.toUpperCase();
      const {context, page, errors} = await open(browser, opts);
      await check('BI-SEAM-' + D, async () => {
        const r = await page.evaluate(() => ({on: document.body.classList.contains('bi15-on'), seam: typeof window.__L5R_TEST__.BI15 === 'object', sw: window.__L5R_TEST__.PICKER_BOTTOM_INFO_REMOVED_ENABLED}));
        return [r.on && r.seam && r.sw === true, r];
      });
      for (const [id, name, cls] of SEVEN) {
        await quickAdd(page, name);
        // 1. Not in the window at all (so not painted, not reachable by Tab, not in the accessibility tree), while the
        //    window's other controls are.
        await check(`BI-${id}-NOT-DRAWN-${D}`, async () => {
          const r = await page.evaluate(cls => ({present: document.querySelectorAll('#advConfigModalOverlay .' + cls).length,
            others: [...document.querySelectorAll('#advConfigModalOverlay button')].filter(e => e.checkVisibility()).length}), cls);
          return [r.present === 0 && r.others >= 2, r];
        });
        // 2. The window's own note still states the rule (the premise of the ruling, measured on 6 November).
        await check(`BI-${id}-NOTE-SHOWN-${D}`, async () => {
          const r = await page.evaluate(() => { const n = document.getElementById('advConfigNote'); return {shown: n.checkVisibility(), text: n.textContent.trim()}; });
          return [r.shown && r.text.length > 40, r];
        });
        await fillPicker(page, name);
        await page.locator('#advConfigConfirm').click();
        await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
        // 3. After Confirm, the row's i is drawn and every sentence of the bottom panel is on the row or behind it. The
        //    bottom panel's words are read by reopening this row's picker with the layer's class taken away.
        await check(`BI-${id}-NOTHING-LOST-${D}`, async () => {
          const idx = await page.evaluate(n => [...document.querySelectorAll('#advList .entry')].map(d => d.querySelector('.en-name').value).lastIndexOf(n), name);
          const row = page.locator('#advList .entry').nth(idx);
          await page.evaluate(() => document.body.classList.remove('bi15-on'));
          await row.locator('.adv-config-btn').click(); await settle(page);
          const bottom = await panel(page, page.locator('#advConfigGrid .' + cls).last());
          await page.locator('#advConfigX').click(); await settle(page);
          await page.evaluate(() => document.body.classList.add('bi15-on'));
          const rowI = row.locator('.' + cls).first();
          const drawn = await rowI.evaluate(e => e.checkVisibility());
          const behind = await panel(page, rowI);
          const rowText = norm(await row.innerText());
          const missing = sentences(bottom.body).filter(s => { const k = norm(s).slice(0, 40); return !rowText.includes(k) && !norm(behind.body).includes(k); });
          return [bottom.shown && bottom.body.length > 40 && drawn && behind.shown && missing.length === 0, {missing, bottom: bottom.body.slice(0, 200), behind: behind.body.slice(0, 200)}];
        });
      }
      // The layer's body class gates it: without it, the bottom i is drawn again; another picker's i is untouched.
      await check('BI-CLASS-GATES-' + D, async () => {
        const idx = await page.evaluate(() => [...document.querySelectorAll('#advList .entry')].map(d => d.querySelector('.en-name').value).lastIndexOf('Paragon'));
        const change = page.locator('#advList .entry').nth(idx).locator('.adv-config-btn');
        await change.click(); await settle(page);
        const on = await page.evaluate(() => document.querySelectorAll('#advConfigGrid > .p4518-info').length);
        await page.locator('#advConfigX').click(); await settle(page);
        await page.evaluate(() => document.body.classList.remove('bi15-on'));
        await change.click(); await settle(page);
        const off = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid > .p4518-info')].filter(e => e.checkVisibility()).length);
        await page.locator('#advConfigX').click(); await settle(page);
        await page.evaluate(() => document.body.classList.add('bi15-on'));
        return [on === 0 && off === 1, {on, off}];
      });
      await check('BI-OTHER-PICKERS-UNTOUCHED-' + D, async () => {
        await quickAdd(page, 'Wealthy');
        const r = await page.evaluate(() => { const count = () => [...document.querySelectorAll('#advConfigModalOverlay button')].filter(e => e.checkVisibility()).length;
          const on = count(); document.body.classList.remove('bi15-on'); const off = count(); document.body.classList.add('bi15-on'); return {on, off}; });
        await page.locator('#advConfigX').click(); await settle(page);
        return [r.on === r.off && r.on >= 2, r];
      });
      await check('BI-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
