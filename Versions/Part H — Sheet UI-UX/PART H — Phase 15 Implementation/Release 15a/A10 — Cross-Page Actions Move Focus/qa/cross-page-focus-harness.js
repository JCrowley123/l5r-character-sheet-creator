'use strict';
// Release 15a, finding A10 (FT-50, FT-52; PART H PHASE 15.1.25): cross-page actions move focus (owner's approval of the
// mock-up, 12 November 2026).   node cross-page-focus-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: the boxes of the hint's text and of the button, the carousel's own active page
// and inert attributes, the element that holds focus, real taps, clicks and key presses, and the same row and the same
// press with the unit's body class taken away (put back only if it was there).
// The characters are this folder's copies of the 7b.1 Matsu (an Advanced School on offer, so the button shows) and the
// audit's dense character (none on offer, so the button is hidden).
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const MATSU = require('./matsu-fixture.json');
const DENSE = require('./dense-fixture.json');
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
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };

function install() {
  const H = {};
  H.load = which => { const T = window.__L5R_TEST__; T.applyData(JSON.parse(JSON.stringify(which === 'dense' ? window.__CPH_DENSE__ : window.__CPH_MATSU__))); T.MODES12.set('management'); };
  const R = e => { const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, right: r.right, bottom: r.bottom}; };
  H.row = () => {
    const line = document.getElementById('ap7Pointer'), text = document.getElementById('ap7Text'), go = document.getElementById('ap7Go');
    const range = document.createRange(); range.selectNodeContents(text);
    const lines = [...range.getClientRects()], last = lines[lines.length - 1], b = R(go);
    return {line: R(line), lines: lines.length, last: last ? {y: last.top, h: last.height, bottom: last.bottom, right: last.right} : null, button: b,
      drawn: go.getClientRects().length > 0, hidden: go.hidden, display: getComputedStyle(go).display,
      centreOffset: last ? (b.y + b.h / 2) - (last.top + last.height / 2) : null, sameLine: last ? b.y < last.bottom && b.bottom > last.top : null};
  };
  H.rowOff = () => { const b = document.body, had = b.classList.contains('cp15-on'); b.classList.remove('cp15-on'); const r = H.row(); if (had) b.classList.add('cp15-on'); return r; };
  H.state = () => {
    const C = window.__L5R_CAROUSEL__, tab = C.getActiveTab(), a = document.activeElement;
    const page = label => C.getTabs().find(t => t.label === label).panel;
    const id = page('Identity'), tech = page('Techniques'), panel = document.getElementById('advancedSchoolPanel');
    return {active: tab.label, focus: {tag: a.tagName, id: a.id, text: (a.textContent || '').trim().slice(0, 40), page: (a.closest('.car-page') || {}).id || null,
        editable: a.matches('input, textarea, select, [contenteditable=""], [contenteditable="true"]'), tabindex: a.getAttribute('tabindex'), marked: a.hasAttribute('data-cp15-target'),
        outline: getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth},
      techId: tech.id, identityInert: id.hasAttribute('inert'), identityHidden: id.getAttribute('aria-hidden'), techInert: tech.hasAttribute('inert'),
      panel: panel ? {top: R(panel).y, bottom: R(panel).bottom, hidden: panel.hidden} : null, vh: innerHeight,
      leftovers: document.querySelectorAll('[data-cp15-target]').length, h3tab: panel ? panel.querySelector('h3').getAttribute('tabindex') : null};
  };
  window.CPH = H;
}

async function open(browser, opts) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(() => { try { window.__L5R_TEST__.CL11.close(); } catch (e) {} });
  await page.evaluate(([m, d]) => { window.__CPH_MATSU__ = m; window.__CPH_DENSE__ = d; }, [MATSU, DENSE]);
  await page.evaluate(install);
  return {context, page, errors};
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const PHONE = D === 'PHONE';
      const {context, page, errors} = await open(browser, opts);
      const state = () => page.evaluate(() => window.CPH.state());
      // Back to Identity with the Matsu, the button on screen; then press it as this device does.
      const ready = async () => { await page.evaluate(() => window.CPH.load('matsu')); await goTab(page, 'Identity');
        await page.locator('#ap7Go').scrollIntoViewIfNeeded(); await settle(page); };
      const press = async how => {
        const go = page.locator('#ap7Go');
        if (how === 'enter') { await go.focus(); await page.keyboard.press('Enter'); }
        else if (PHONE) await go.tap(); else await go.click();
        await page.evaluate(() => window.__L5R_CAROUSEL__.whenSettled()); await settle(page); await page.waitForTimeout(250); await settle(page);
      };

      await check('CP-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.CROSS_PAGE_FOCUS_ENABLED, api: !!(T.CP15 && T.CP15.installed), cls: document.body.classList.contains('cp15-on'), routes: T.CP15 && T.CP15.ROUTES.length}; });
        return [r.on === true && r.api && r.cls && r.routes === 1, r];
      });

      await ready();
      const row = await page.evaluate(() => window.CPH.row()), off = await page.evaluate(() => window.CPH.rowOff());
      await check('CP-ROW-' + D, async () => {
        const ok = row.drawn && row.lines >= 1 && (PHONE
          // The hint fills the line; the button wraps below it, at the row's left edge, 44 px high, an even gap.
          ? !row.sameLine && row.button.h >= 44 && Math.abs(row.button.x - row.line.x) <= 1 && row.button.y - row.last.bottom >= 4 && row.button.y - row.last.bottom <= 8
          // One line, centred on each other.
          : row.sameLine && Math.abs(row.centreOffset) <= 1 && row.button.h >= 24 && row.button.x > row.last.right);
        return [ok, row];
      });
      if (!PHONE) await check('CP-ROW-CLASS-OFF-DESKTOP', async () => [off.sameLine && off.centreOffset >= 3, off]);

      await check('CP-FOCUS-' + D, async () => { await press(); const s = await state();
        return [s.active === 'Techniques' && s.focus.tag === 'H3' && s.focus.text === 'Advanced School' && s.focus.page === s.techId && s.focus.marked && s.focus.tabindex === '-1', s]; });
      const after = await state();
      await check('CP-INERT-' + D, async () => [after.identityInert && after.identityHidden === 'true' && !after.techInert, after]);
      await check('CP-NO-RING-' + D, async () => [after.focus.outline.startsWith('none'), after.focus]);
      await check('CP-PANEL-IN-VIEW-' + D, async () => [after.panel && !after.panel.hidden && after.panel.top >= 0 && after.panel.top < after.vh / 2, after.panel]);
      if (PHONE) await check('CP-NO-KEYBOARD-PHONE', async () => [!after.focus.editable, after.focus]);
      else await check('CP-NEXT-TAB-DESKTOP', async () => { await page.keyboard.press('Tab'); await settle(page);
        const s = await state(); return [s.focus.id === 'advancedSchoolPicker' && s.focus.page === s.techId && s.leftovers === 0 && s.h3tab === null, s]; });

      // Back to Identity by its tab: Identity is live again, Techniques inert, the heading given back.
      await check('CP-RETURN-' + D, async () => {
        const tab = page.getByRole('tab', {name: 'Identity', exact: true});
        if (PHONE) await tab.tap(); else await tab.click();
        await page.evaluate(() => window.__L5R_CAROUSEL__.whenSettled()); await settle(page);
        const s = await state();
        return [s.active === 'Identity' && !s.identityInert && s.techInert && s.leftovers === 0 && s.h3tab === null, s];
      });

      if (!PHONE) {
        await check('CP-ENTER-KEY-DESKTOP', async () => { await ready(); await press('enter'); const s = await state();
          return [s.active === 'Techniques' && s.focus.tag === 'H3' && s.identityInert, s]; });
        // Without the class the button keeps focus and Identity stays live, as before: the unit is what moves it.
        await check('CP-FOCUS-CLASS-OFF-DESKTOP', async () => {
          await ready();
          const had = await page.evaluate(() => { const h = document.body.classList.contains('cp15-on'); document.body.classList.remove('cp15-on'); return h; });
          await press();
          const s = await state();
          if (had) await page.evaluate(() => document.body.classList.add('cp15-on'));
          return [s.active === 'Techniques' && s.focus.id === 'ap7Go' && !s.identityInert && s.leftovers === 0, s];
        });
      }

      // No Advanced School on offer: the button is hidden and stays hidden inside the row.
      await check('CP-HIDDEN-BUTTON-' + D, async () => { await page.evaluate(() => window.CPH.load('dense')); await goTab(page, 'Identity');
        const r = await page.evaluate(() => window.CPH.row()); return [r.hidden && !r.drawn && r.display === 'none', r]; });

      await check('CP-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
