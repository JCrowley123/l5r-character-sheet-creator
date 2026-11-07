'use strict';
// Release 15a, A05 (PART H PHASE 15.1.5): Missing Limb's select as a shared field (FT-12; approved as mocked up,
// 7 November 2026).   node limb-picker-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL, and an
// exception inside a check is that check's FAIL. Oracles are independent of the layer: the shared field on the Identity
// tab (Other Insight Bonus) and its label, the row's own geometry, Phase 4.5.31's (Part I) saved state and roll ticks,
// and the same page with the layer's body class taken away.
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
// The limb row's parts and the shared field's, measured.
function measure() {
  const box = e => { if (!e) return null; const b = e.getBoundingClientRect(), s = getComputedStyle(e);
    return {top: b.top, bottom: b.bottom, left: b.left, h: b.height, font: s.fontFamily, size: s.fontSize, border: s.borderTopColor + ' ' + s.borderTopWidth,
      radius: s.borderTopLeftRadius, pad: s.paddingLeft, transform: s.textTransform, colour: s.color, bg: s.backgroundColor}; };
  const row = [...document.querySelectorAll('#disadvList .entry')].find(d => d.querySelector('.en-name').value.trim() === 'Missing Limb');
  if (!row) return null;
  const sel = row.querySelector('select.chk4531-limb'), field = sel && sel.closest('label');
  const words = field ? [...field.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()) : [];
  return {sel: box(sel), label: box(row.querySelector('.lp15-label')), labelText: (row.querySelector('.lp15-label') || {}).textContent || null, strayWords: words,
    labels: row.querySelectorAll('.lp15-label').length, note: box(row.querySelector('.chk4531-note')), noteText: (row.querySelector('.chk4531-note') || {}).textContent,
    entry: box(row), disabled: sel ? sel.disabled : null, value: sel ? sel.value : null, options: sel ? [...sel.options].map(o => o.value) : [],
    aria: sel ? sel.getAttribute('aria-label') : null};
}
function shared() {
  const i = document.getElementById('f_insightBonus'), l = i.closest('.field').querySelector('label');
  const s = getComputedStyle(i), t = getComputedStyle(l);
  return {font: s.fontFamily, size: s.fontSize, border: s.borderTopColor + ' ' + s.borderTopWidth, radius: s.borderTopLeftRadius, colour: s.color, bg: s.backgroundColor,
    labelTransform: t.textTransform, labelFont: t.fontFamily};
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
    T.MODES12.set('management'); }, FIX.dense);
  await goTab(page, 'Adv & Disadv');
  return {context, page, errors};
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      const ref = await (async () => { await goTab(page, 'Identity'); const r = await page.evaluate(shared); await goTab(page, 'Adv & Disadv'); return r; })();
      await check('LP-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.LIMB_PICKER_ENABLED, api: !!(T.LP15 && T.LP15.installed), cls: document.body.classList.contains('lp15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });
      const m = await page.evaluate(measure);
      await check('LP-ROW-PRESENT-' + D, async () => [!!(m && m.sel && m.label), m]);
      await check('LP-LABEL-ABOVE-' + D, async () => [m.labelText === 'Missing limb' && m.strayWords.length === 0 && m.labels === 1 &&
        m.label.bottom <= m.sel.top + 0.5 && Math.abs(m.label.left - m.sel.left) <= 1 && m.label.transform === ref.labelTransform && m.label.font === ref.labelFont, {m, ref}]);
      await check('LP-SHARED-FIELD-' + D, async () => [m.sel.font === ref.font && m.sel.size === ref.size && m.sel.border === ref.border && m.sel.radius === ref.radius &&
        m.sel.colour === ref.colour && m.sel.bg === ref.bg && m.sel.transform === 'none', {sel: m.sel, ref}]);
      await check('LP-TOUCH-HEIGHT-' + D, async () => [m.sel.h >= 44, m.sel.h]);
      await check('LP-NOTE-BELOW-' + D, async () => [m.noteText === 'Ticks on every roll but damage.' && m.note.top - m.sel.bottom >= 5.5 && m.note.top - m.sel.bottom <= 8 &&
        Math.abs(m.note.left - m.sel.left) <= 1, {sel: m.sel, note: m.note}]);
      // The select is still Phase 4.5.31's: same options, name and saved value; the roll tick still names the limb.
      await check('LP-STILL-THE-SAME-SELECT-' + D, async () => {
        await page.evaluate(() => { const s = document.querySelector('#disadvList .chk4531-limb'); s.value = 'Left arm'; s.dispatchEvent(new Event('change', {bubbles: true})); });
        await page.evaluate(() => { window.__L5R_TEST__.recalcAll(); window.__L5R_TEST__.recalcAll(); });
        await settle(page);
        const after = await page.evaluate(measure);
        const saved = await page.evaluate(() => { const d = [...document.querySelectorAll('#disadvList .entry')].find(d => d.querySelector('.en-name').value.trim() === 'Missing Limb');
          return JSON.stringify(d.dataset).includes('Left arm'); });
        const ok = saved && after.value === 'Left arm' && after.labels === 1 && after.labelText === 'Missing limb' && after.aria === 'Which limb is missing' &&
          JSON.stringify(after.options) === JSON.stringify(['', 'Left arm', 'Right arm', 'Left leg', 'Right leg']);
        return [ok, {after, saved}];
      });
      await check('LP-PLAY-' + D, async () => {
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await settle(page);
        const p = await page.evaluate(measure);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await settle(page);
        return [p.disabled === true && p.sel.h >= 44 && p.labelText === 'Missing limb' && p.label.bottom <= p.sel.top + 0.5, p];
      });
      await check('LP-FITS-320-' + D, async () => {
        const size = page.viewportSize();
        await page.setViewportSize({width: 320, height: 900}); await settle(page);
        const f = await page.evaluate(() => { const row = document.querySelector('#disadvList .lp15-row'); const e = row.closest('.entry').getBoundingClientRect();
          return [...row.querySelectorAll('*')].every(c => { const b = c.getBoundingClientRect(); return b.width === 0 || (b.left >= e.left - 1 && b.right <= e.right + 1); }) && row.scrollWidth <= row.clientWidth + 1; });
        await page.setViewportSize(size); await settle(page);
        return [f, f];
      });
      await check('LP-CLASS-GATES-' + D, async () => {
        const r = await page.evaluate(() => { const b = document.body, had = b.classList.contains('lp15-on'); b.classList.remove('lp15-on');
          const h = document.querySelector('#disadvList .chk4531-limb').getBoundingClientRect().height; if (had) b.classList.add('lp15-on');
          return {had, h, back: b.classList.contains('lp15-on')}; });
        return [r.had && r.h < 44 && r.back, r];
      });
      await check('LP-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
