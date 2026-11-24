'use strict';
// Release 15b, unit B09 (PART H PHASE 15.2.9): the Skills page's picker takes each Skill's Trait from the list as it stands
// after every layer (approved by the owner on 24 November 2026 as recommended).   node picker-traits-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: each option is compared with the row the sheet itself adds when that option is
// chosen (its Trait box), and Intimidation's Trait with the one the Skill-Trait audit of 10 October 2026 settled
// (Awareness). The unit's own state is read only to say whether it is there (the seam). One option is chosen the way a
// player chooses it (the select's own choice); the full comparison fires the picker's own change for each option, as
// the mock-up's reproduction did. Character: the mock-ups' "G2 skill picker all" (the audit's dense Kuni Shugenja with
// no Skills, so every option is offered), copied into this folder.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = path.join(__dirname, 'picker-traits.l5r.json'), FX_NAME = 'G2 skill picker all';
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
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
// The picker's groups, in the order the sheet has always written them, and the number of options on a character with
// no Skills (the mock-up's reproduction of the live build: 44).
const GROUPS = ['High', 'Bugei', 'Weapon', 'Weapon (Low)', 'Merchant', 'Low'];
const ALL = 44;

function install() {
  const H = {};
  H.options = () => Array.from(document.querySelectorAll('#skillQuickAdd optgroup')).flatMap(g => Array.from(g.querySelectorAll('option')).map(o => ({group: g.label, value: o.value, text: o.textContent})));
  H.text = value => { const o = Array.from(document.querySelectorAll('#skillQuickAdd option')).find(x => x.value === value); return o ? o.textContent : null; };
  // Every option against the row it adds, through the picker's own change; each row removed again.
  H.compare = () => {
    const T = window.__L5R_TEST__, sel = document.getElementById('skillQuickAdd'), body = document.getElementById('skillsBody');
    return H.options().map(o => {
      const m = /\(([^()]*)\)\s*$/.exec(o.text), label = m ? m[1] : null;
      if (!Array.from(sel.options).some(x => x.value === o.value)) return {name: o.value, label, row: null};
      const before = body.rows.length;
      sel.value = o.value; sel.dispatchEvent(new Event('change', {bubbles: true}));
      const tr = body.rows.length > before ? body.lastElementChild : null;
      const row = tr ? tr.querySelector('.sk-trait').value : null;
      if (tr) { tr.remove(); T.recalcAll(); }
      return {name: o.value, label, row};
    });
  };
  H.lastRow = () => { const tr = document.getElementById('skillsBody').lastElementChild; return tr ? {name: tr.querySelector('.sk-name').value, trait: tr.querySelector('.sk-trait').value} : null; };
  H.removeLast = () => { document.getElementById('skillsBody').lastElementChild.remove(); window.__L5R_TEST__.recalcAll(); };
  window.PTH = H;
}
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
  await page.evaluate(install);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await settle(page);
  await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Skills'); await C.whenSettled(); }); await settle(page);
  return {context, page, errors};
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, Manage ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      await check('PT-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {pt: !!T.SKP15 && T.SKP15.installed === true, on: T.PICKER_TRAITS_FINAL_ENABLED}; });
        return [r.pt && r.on === true, r];
      });
      const options = await page.evaluate(() => window.PTH.options());
      await check('PT-INTIMIDATION-PHONE', async () => { const o = options.filter(x => x.value === 'Intimidation');
        // Its group is the live build's (the mock-up's reproduction: 'Low'); run 1 expected 'High' by mistake.
        return [same(o, [{group: 'Low', value: 'Intimidation', text: 'Intimidation (Awareness)'}]), o]; });
      await check('PT-OPTIONS-UNCHANGED-PHONE', async () => {
        const groups = [...new Set(options.map(o => o.group))];
        return [options.length === ALL && same(groups, GROUPS) && options.every(o => o.text.indexOf(o.value + ' (') === 0 && /\)$/.test(o.text)), {count: options.length, groups}];
      });
      await check('PT-EVERY-OPTION-MATCHES-ITS-ROW-PHONE', async () => {
        const c = await page.evaluate(() => window.PTH.compare());
        await settle(page);
        return [c.length === ALL && c.every(x => x.row !== null && x.label === x.row), c.filter(x => x.row === null || x.label !== x.row)];
      });
      await check('PT-REAL-PICK-PHONE', async () => {
        const before = await page.evaluate(() => window.PTH.text('Intimidation'));
        await page.locator('#skillQuickAdd').scrollIntoViewIfNeeded();
        await page.locator('#skillQuickAdd').selectOption('Intimidation');
        await settle(page);
        const row = await page.evaluate(() => window.PTH.lastRow());
        return [before === 'Intimidation (Awareness)' && !!row && row.name === 'Intimidation' && row.trait === 'Awareness', {before, row}];
      });
      await check('PT-REDRAW-KEEPS-WORDS-PHONE', async () => {
        // With the row held, the picker is drawn again without Intimidation; with it gone, drawn again with it.
        const held = await page.evaluate(() => window.PTH.text('Intimidation'));
        await page.evaluate(() => window.PTH.removeLast()); await settle(page);
        const back = await page.evaluate(() => window.PTH.text('Intimidation'));
        const all = await page.evaluate(() => window.PTH.options());
        return [held === null && back === 'Intimidation (Awareness)' && all.length === ALL, {held, back, count: all.length}];
      });
      await check('PT-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Manage ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      await check('PT-INTIMIDATION-DESKTOP', async () => { const t = await page.evaluate(() => window.PTH.text('Intimidation'));
        return [t === 'Intimidation (Awareness)', t]; });
      await check('PT-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
