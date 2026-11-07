'use strict';
// Release 15a, A07 (PART H PHASE 15.1.7): the Moon row (ruling Q1; approved as mocked up, 7 November 2026).
//   node moon-row-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL. Oracles are
// independent of the layer: the Lord Moon fix's own saved config and Void pips, the row's measured geometry, another
// configured row, and the same page with the layer's body class taken away.
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
const NAME = 'Lord Moon’s Curse';
function moon(name) {
  const d = [...document.querySelectorAll('#disadvList .entry')].find(x => x.querySelector('.en-name').value.trim() === name);
  if (!d) return null;
  const b = e => { if (!e) return null; const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return {top: r.top, bottom: r.bottom, left: r.left, h: r.height, w: r.width, transform: s.textTransform, size: parseFloat(s.fontSize)}; };
  const sum = d.querySelector('.adv-config-row > .adv-config-summary'), tick = d.querySelector('label.lm7-tick'), box = tick && tick.querySelector('input'),
    roll = d.querySelector('.lm7-roll');
  return {sum: b(sum), sumText: sum && sum.textContent, before: sum && getComputedStyle(sum, '::before').content, beforeTransform: sum && getComputedStyle(sum, '::before').textTransform,
    tick: b(tick), tickText: tick && tick.textContent.trim(), box: b(box), checked: box && box.checked, roll: b(roll), rollText: roll && roll.textContent,
    config: d.dataset.advConfig || ''};
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
  await page.evaluate(([d, n]) => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d); document.getElementById('f_clan').value = 'Crane'; T.recalcAll();
    T.MODES12.set('management');
    for (const x of [...document.querySelectorAll('#disadvList .entry')]) if (x.querySelector('.en-name').value.trim() === n) x.remove();
    T.recalcAll(); }, [FIX.dense, NAME]);
  await goTab(page, 'Adv & Disadv');
  await page.evaluate(n => { const s = document.getElementById('disadvQuickAdd'); s.value = n; s.dispatchEvent(new Event('change', {bubbles: true})); }, NAME);
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'});
  await page.locator('#advConfigGrid label', {hasText: 'Medium'}).first().click();
  await page.locator('#advConfigConfirm').click();
  await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
  // A second configured row (Paragon) for MR-ONLY-THE-MOON-ROW to compare against.
  await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Paragon'; s.dispatchEvent(new Event('change', {bubbles: true})); });
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'});
  await page.locator('#advConfigGrid input[value="Compassion"]').check();
  await page.locator('#advConfigConfirm').click();
  await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
  return {context, page, errors};
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      await check('MR-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.MOON_ROW_ENABLED, api: !!(T.MR15 && T.MR15.installed), cls: document.body.classList.contains('mr15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });
      for (const mode of ['management', 'play']) {
        const M = mode === 'play' ? 'PLAY-' : '';
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode); await settle(page);
        const m = await page.evaluate(moon, NAME);
        await check('MR-' + M + 'SEVERITY-LABELLED-' + D, async () => [m.before === '"Severity"' && m.beforeTransform === 'uppercase' && m.sumText === 'Medium — 5 points', m]);
        await check('MR-' + M + 'ONE-EDGE-' + D, async () => [Math.abs(m.tick.left - m.sum.left) <= 1 && Math.abs(m.box.left - m.sum.left) <= 1 && Math.abs(m.roll.left - m.sum.left) <= 1, m]);
        await check('MR-' + M + 'TOGGLE-ROW-' + D, async () => [m.tick.h >= 44 && m.box.w >= 21.5 && m.box.h >= 21.5 && m.tick.transform === 'none' && m.tick.size >= 14 &&
          m.tickText === 'Full moon tonight (+1 Void Point, spent last)', m]);
        await check('MR-' + M + 'RESIST-AND-ORDER-' + D, async () => [m.rollText === 'Resist Lord Moon (TN 20)' && m.roll.h >= 44 &&
          m.sum.bottom <= m.tick.top + 0.5 && m.tick.bottom <= m.roll.top + 0.5, m]);
      }
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await settle(page);
      await check('MR-TICK-STILL-WORKS-' + D, async () => {
        await page.evaluate(n => { const d = [...document.querySelectorAll('#disadvList .entry')].find(x => x.querySelector('.en-name').value.trim() === n);
          d.querySelector('label.lm7-tick input').click(); }, NAME);
        await settle(page);
        const on = await page.evaluate(moon, NAME);
        await page.evaluate(n => { const d = [...document.querySelectorAll('#disadvList .entry')].find(x => x.querySelector('.en-name').value.trim() === n);
          d.querySelector('label.lm7-tick input').click(); }, NAME);
        await settle(page);
        const off = await page.evaluate(moon, NAME);
        return [on.checked === true && /"moon":true/.test(on.config) && off.checked === false && !/"moon":true/.test(off.config) && on.tick.h >= 44 && off.tick.h >= 44, {on, off}];
      });
      await check('MR-ONLY-THE-MOON-ROW-' + D, async () => {
        const r = await page.evaluate(() => [...document.querySelectorAll('#advList .adv-config-row > .adv-config-summary, #disadvList .adv-config-row > .adv-config-summary')]
          .filter(s => !s.parentElement.querySelector('.lm7-moon')).map(s => getComputedStyle(s, '::before').content));
        return [r.length > 0 && r.every(c => c === 'none'), r];
      });
      await check('MR-CLASS-GATES-' + D, async () => {
        const r = await page.evaluate(n => { const b = document.body, had = b.classList.contains('mr15-on'); b.classList.remove('mr15-on');
          const d = [...document.querySelectorAll('#disadvList .entry')].find(x => x.querySelector('.en-name').value.trim() === n);
          const h = d.querySelector('label.lm7-tick').getBoundingClientRect().height, before = getComputedStyle(d.querySelector('.adv-config-summary'), '::before').content;
          if (had) b.classList.add('mr15-on'); return {had, h, before, back: b.classList.contains('mr15-on')}; }, NAME);
        return [r.had && r.h < 44 && r.before === 'none' && r.back, r];
      });
      await check('MR-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
