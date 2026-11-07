'use strict';
// Release 15a, A06 (PART H PHASE 15.1.6): grant actions as one compact group, with the state beside it (FT-42; approved
// as mocked up, revision 2 with no tick, 7 November 2026).   node grant-actions-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL. Oracles are
// independent of the layer: the Koku field, Phase 4.5.17's and Phase 4.5.40's (Part I) own row text and receipts, the
// sheet's --ink token, measured geometry, and the same page with the layer's body class taken away.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const FIX = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'g2-fixtures.json'), 'utf8'));
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
// One grant box, measured.
function grant([name, sel]) {
  const row = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value.trim() === name);
  const box = row && row.querySelector(sel);
  if (!box) return null;
  const ink = (() => { const d = document.createElement('div'); d.style.color = 'var(--ink)'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; })();
  const btns = [...box.querySelectorAll(':scope > button')].map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b);
    return {text: b.textContent, top: r.top, left: r.left, right: r.right, h: r.height, bg: s.backgroundColor, colour: s.color, cls: b.className, disabled: b.disabled}; });
  const span = box.querySelector(':scope > span'), sr = span && span.getBoundingClientRect();
  const after = getComputedStyle(box, '::after').content, before = getComputedStyle(box, '::before').content;
  return {btns, text: span ? span.textContent : null, spanBottom: sr ? sr.bottom : null, spanW: sr ? sr.width : 0, boxW: box.getBoundingClientRect().width,
    after, before, display: getComputedStyle(box).display, gap: getComputedStyle(box).columnGap, ink, cls: box.className};
}
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
  await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d); document.getElementById('f_clan').value = 'Crane'; T.recalcAll();
    T.MODES12.set('management');
    for (const x of [...document.querySelectorAll('#advList .entry')]) if (x.querySelector('.en-name').value.trim() === 'Wealthy') x.remove();
    T.recalcAll(); }, FIX.dense);
  await goTab(page, 'Adv & Disadv');
  // Wealthy at Rank 2 through its own picker, "Add it to my Koku now".
  await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Wealthy'; s.dispatchEvent(new Event('change', {bubbles: true})); });
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'});
  await page.locator('#advConfigRankInput').fill('2');
  await page.locator('#advConfigGrid input[name="wealth4517Grant"][value="add"]').check();
  await page.locator('#advConfigConfirm').click();
  await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
  return {context, page, errors};
}
// Rewrite Wealthy's receipt (Phase 4.5.17's own config field) and redraw: null removes it (an older save).
const receipt = (page, granted) => page.evaluate(g => { const d = [...document.querySelectorAll('#advList .entry')].find(x => x.querySelector('.en-name').value.trim() === 'Wealthy');
  const c = JSON.parse(d.dataset.advConfig); if (g === null) delete c.wealth4517; else c.wealth4517 = {revision: 1, granted: g}; d.dataset.advConfig = JSON.stringify(c); window.__L5R_TEST__.recalcAll(); }, granted);
const groupOk = (g, first, second) => g && g.display === 'flex' && g.btns.length === 2 && g.btns[0].text === first && g.btns[1].text === second &&
  g.btns.every(b => b.h >= 44) && g.btns[1].left - g.btns[0].right >= 9.5 && g.btns[0].bg === g.ink && /rgba\(0, 0, 0, 0\)|transparent/.test(g.btns[1].bg) &&
  g.btns.every(b => b.top >= g.spanBottom - 0.5) && g.spanW >= g.boxW - 1 && g.before === 'none';

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      await check('GA-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.GRANT_ACTIONS_ENABLED, api: !!(T.GA15 && T.GA15.installed), cls: document.body.classList.contains('ga15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });
      const z = await page.evaluate(grant, ['Zakyo Toshi Citizen', '.supp4540-koku']);
      await check('GA-ZAKYO-GROUP-' + D, async () => [groupOk(z, 'Add 1.5 koku', 'Already added'), z]);
      await check('GA-ZAKYO-STATE-' + D, async () => [z.after === '"Not recorded yet"', z.after]);
      await check('GA-ZAKYO-ADD-STILL-WORKS-' + D, async () => {
        const before = await page.evaluate(() => parseFloat(document.getElementById('f_koku').value || '0'));
        await page.evaluate(() => [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value.trim() === 'Zakyo Toshi Citizen')
          .querySelector('.supp4540-koku > button').click());
        await settle(page);
        const after = await page.evaluate(() => parseFloat(document.getElementById('f_koku').value || '0'));
        const g = await page.evaluate(grant, ['Zakyo Toshi Citizen', '.supp4540-koku']);
        return [Math.abs(after - before - 1.5) < 1e-9 && g.btns.length === 0 && g.text === '1.5 koku from Zakyo Toshi Citizen recorded on your Koku.' &&
          g.after === 'none' && g.before === 'none', {before, after, g}];
      });
      await check('GA-WEALTHY-RECORDED-UNCHANGED-' + D, async () => {
        const g = await page.evaluate(grant, ['Wealthy', '.wealth4517-status']);
        return [g.btns.length === 0 && g.text === '4 koku from Wealthy recorded on your Koku.' && g.after === 'none' && g.before === 'none' && g.gap === '6px', g];
      });
      await check('GA-WEALTHY-UNRECORDED-' + D, async () => {
        await receipt(page, null); await settle(page);
        const g = await page.evaluate(grant, ['Wealthy', '.wealth4517-status']);
        return [groupOk(g, 'Add 4 koku', 'Already added') && g.after === '"Not recorded yet"', g];
      });
      await check('GA-WEALTHY-EXCESS-' + D, async () => {
        await page.evaluate(() => { document.getElementById('f_koku').value = '50'; });
        await receipt(page, 6); await settle(page);
        const g = await page.evaluate(grant, ['Wealthy', '.wealth4517-status']);
        return [groupOk(g, 'Return 2 koku', 'Keep') && g.after === '"Not settled yet"', g];
      });
      await check('GA-HOVER-KEEPS-FULL-OPACITY-' + D, async () => {
        const b = page.locator('#advList .wealth4517-status > button').first();
        await b.scrollIntoViewIfNeeded(); await b.hover(); await settle(page);
        const o = await b.evaluate(e => getComputedStyle(e).opacity);
        await page.mouse.move(0, 0);
        return [o === '1', o];
      });
      await check('GA-CLASS-GATES-' + D, async () => {
        const r = await page.evaluate(() => { const b = document.body, had = b.classList.contains('ga15-on'); b.classList.remove('ga15-on');
          const btn = document.querySelector('#advList .wealth4517-status > button'), h = btn.getBoundingClientRect().height,
            after = getComputedStyle(btn.parentElement, '::after').content; if (had) b.classList.add('ga15-on');
          return {had, h, after, back: b.classList.contains('ga15-on')}; });
        return [r.had && r.h < 44 && r.after === 'none' && r.back, r];
      });
      await check('GA-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
