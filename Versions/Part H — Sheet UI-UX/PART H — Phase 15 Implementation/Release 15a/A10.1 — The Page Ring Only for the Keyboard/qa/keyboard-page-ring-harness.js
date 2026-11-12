'use strict';
// Release 15a, finding A10.1 (PART H PHASE 15.1.26): the page's focus ring only for the keyboard (the owner's item of
// 12 November 2026, option A as mocked up).   node keyboard-page-ring-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: the element that holds focus, the outline the browser computes for it, real
// taps, clicks and key presses, and the same sequence with the unit's body class taken away (put back only if it was
// there). The character is this folder's copy of the older Kitsu test character, imported as a file, whose
// School-choice window is the one the owner closed.
// iPhone Safari does not focus a tapped button: the page that holds the button keeps focus, so a closing window gives
// focus back to the page. The phone checks imitate that by focusing the page with a tap on its own text and opening
// the window from script, as G3's focus-ring probe did; Chromium then draws the page's ring as Safari did.
// (12 November 2026, before any result was used: the window sequence runs first and gives the page focus by script, as
// that probe did, with the tap check after it; the Tab walk to the page may take up to 80 presses. Same ids and count.)
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const KITSU = path.join(__dirname, 'kitsu-fixture.l5r.json');
const NAME = 'Older Kitsu test character';
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
  H.focus = () => { const a = document.activeElement, s = getComputedStyle(a);
    return {tag: a.tagName, page: a.classList.contains('car-page'), id: a.id, visible: a.matches(':focus-visible'),
      outline: {style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, offset: s.outlineOffset}, keyboard: document.body.classList.contains('kr15-keyboard')}; };
  H.without = fn => { const b = document.body, had = b.classList.contains('kr15-on'); b.classList.remove('kr15-on'); const r = fn(); if (had) b.classList.add('kr15-on'); return r; };
  H.look = () => { const s = getComputedStyle(document.activeElement); return [document.activeElement.id, s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderTopColor].join('|'); };
  H.identity = () => window.__L5R_CAROUSEL__.getTabs().find(t => t.label === 'Identity').panel;
  window.KRH = H;
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
  await page.locator('#fileImport').setInputFiles(KITSU);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, NAME);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
  await page.evaluate(install);
  await goTab(page, 'Identity');
  return {context, page, errors};
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const PHONE = D === 'PHONE';
      const {context, page, errors} = await open(browser, opts);
      const focus = () => page.evaluate(() => window.KRH.focus());
      // A tap or click on the Identity page's own heading text: the page (tabindex 0) takes focus, as Safari leaves it.
      const pointAtPage = async () => { const h = page.locator('#car-panel-1 h2').first(); await h.scrollIntoViewIfNeeded();
        if (PHONE) await h.tap(); else await h.click(); await settle(page); };
      const openWindow = () => page.evaluate(() => window.__L5R_TEST__.SC8.open('Kitsu Shugenja', 'spell'));
      const later = async how => { if (how === 'keys') { await page.locator('#sc8Done').focus(); await page.keyboard.press('Enter'); }
        else if (PHONE) await page.locator('#sc8Done').tap(); else await page.locator('#sc8Done').click();
        await page.waitForTimeout(150); await settle(page); };

      await check('KR-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.KEYBOARD_PAGE_RING_ENABLED, api: !!(T.KR15 && T.KR15.installed), cls: document.body.classList.contains('kr15-on')}; });
        return [r.on === true && r.api && r.cls && (await page.evaluate(() => document.getElementById('car-panel-1') === window.KRH.identity())), r];
      });

      if (PHONE) {
        // As G3's focus-ring probe: the page holds focus as Safari leaves it (given by script), then the window opens
        // and Later is tapped. Chromium then draws the page's ring, as Safari did (no tap before it, or Chromium would not).
        await page.evaluate(() => window.KRH.identity().focus({preventScroll: true}));
        await openWindow(); await later();
        const f = await focus();
        await check('KR-FOCUS-STILL-RETURNED-PHONE', async () => [f.page && f.id === 'car-panel-1', f]);
        await check('KR-NO-RING-AFTER-WINDOW-PHONE', async () => [f.page && f.outline.style === 'none' && !f.keyboard, f]);
        // The same moment without the unit's class: the gold ring the owner saw.
        await check('KR-CLASS-OFF-RING-PHONE', async () => { const o = await page.evaluate(() => window.KRH.without(window.KRH.focus));
          return [o.page && o.visible && o.outline.style === 'solid' && o.outline.width === '2px' && (await page.evaluate(() => document.body.classList.contains('kr15-on'))), o]; });
        // A tap on the page's own text: the page takes focus and no ring is drawn.
        await pointAtPage();
        await check('KR-NO-RING-AFTER-TAP-PHONE', async () => { const f = await focus(); return [f.page && f.outline.style === 'none' && !f.keyboard, f]; });
        // Typing in a text box, Return included (an iPhone's keyboard sends Enter and Space), is not the keyboard: a
        // window that then gives focus back to the page draws no ring. Revision 1, after G4's code review.
        await check('KR-TYPING-IS-NOT-KEYBOARD-PHONE', async () => {
          const box = page.locator('#f_name'); await box.scrollIntoViewIfNeeded(); await box.tap();
          await page.keyboard.type(' a'); await page.keyboard.press('Enter'); await settle(page);
          const typed = await focus();
          await page.evaluate(() => window.KRH.identity().focus({preventScroll: true})); await settle(page);
          const f = await focus();
          return [typed.tag === 'INPUT' && !typed.keyboard && f.page && !f.keyboard && f.outline.style === 'none', {typed, f}];
        });
      } else {
        // Reach the page with the Tab key from the tab bar: the ring is drawn, exactly as before.
        const tabToPage = async () => { await page.getByRole('tab', {name: 'Identity', exact: true}).click(); await settle(page);
          for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); if ((await focus()).page) break; } };
        await tabToPage();
        const k = await focus(), before = await page.evaluate(() => window.KRH.without(window.KRH.focus));
        await check('KR-RING-BY-TAB-DESKTOP', async () => [k.page && k.keyboard && k.outline.style === 'solid' && k.outline.width === '2px', k]);
        await check('KR-RING-SAME-AS-BEFORE-DESKTOP', async () => [JSON.stringify(k.outline) === JSON.stringify(before.outline), {k: k.outline, before: before.outline}]);
        // A keyboard user closes the window with Enter: focus comes back to the page and the ring shows.
        await openWindow(); await later('keys');
        await check('KR-RING-AFTER-WINDOW-BY-KEYS-DESKTOP', async () => { const f = await focus(); return [f.page && f.keyboard && f.outline.style === 'solid', f]; });
        // A mouse click anywhere clears the keyboard mark.
        await check('KR-MOUSE-CLEARS-KEYBOARD-DESKTOP', async () => { await pointAtPage(); const f = await focus(); return [!f.keyboard && f.page && f.outline.style === 'none', f]; });
        // The same window closed with the mouse: focus comes back to the page and no ring is drawn.
        await page.evaluate(() => window.KRH.identity().focus());
        await openWindow(); await later();
        await check('KR-NO-RING-AFTER-WINDOW-BY-MOUSE-DESKTOP', async () => { const f = await focus(); return [f.page && !f.keyboard && f.outline.style === 'none', f]; });
        // Tab from a text box still marks the keyboard. Revision 1, after G4's code review.
        await check('KR-TAB-FROM-A-BOX-DESKTOP', async () => {
          await page.locator('#f_name').click(); await settle(page);
          const before = await focus();
          await page.keyboard.press('Tab'); await settle(page);
          const after = await focus();
          return [before.tag === 'INPUT' && !before.keyboard && after.keyboard, {before, after}];
        });
        // Every other control keeps its own focus look: a text box clicked into looks the same with or without the class.
        await check('KR-OTHER-RINGS-KEPT-DESKTOP', async () => {
          await page.locator('#f_name').click(); await settle(page);
          const on = await page.evaluate(() => window.KRH.look()), off = await page.evaluate(() => window.KRH.without(window.KRH.look));
          return [on === off && on.startsWith('f_name|'), {on, off}];
        });
      }
      await check('KR-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
