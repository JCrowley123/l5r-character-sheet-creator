/* Real-browser acceptance tests for Phase 11.3 App Bar (Part K).
 * Oracles: geometry and hit testing (what a tap at a point reaches), the Characters screen's own state (CL11), the
 * Search page's view (Phase 14) and the sections the owner named (Sheet, Characters, Library, Search). The bar's
 * position is read from its one setting, so the same checks prove the 'top' build and a 'bottom' variant.
 * node appbar-harness.js <sheet.html>
 */
'use strict';
const path = require('path');
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual).slice(0, 500)} expected=${JSON.stringify(expected).slice(0, 500)}`}`);
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id + '-EXCEPTION', String(error.stack || error).split('\n').slice(0, 3).join(' '), 'no exception'); }
}
const SECTIONS = [['sheet', 'Sheet'], ['characters', 'Characters'], ['library', 'Library'], ['search', 'Search']];

function helpers() {
  const rect = el => { const r = el.getBoundingClientRect(); return {top:r.top, bottom:r.bottom, left:r.left, right:r.right}; };
  const shown = el => !!el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
  const overlap = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  window.__ab = {
    rect, shown, overlap,
    bar: () => document.getElementById('ab113Bar'),
    // Each item reachable by a tap at its centre.
    reachable() {
      return [...this.bar().querySelectorAll('.ab113-item')].map(b => { const r = b.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!hit && b.contains(hit); });
    },
    current: () => [...document.querySelectorAll('#ab113Bar .ab113-item')].filter(b => b.getAttribute('aria-current') === 'page').map(b => b.dataset.section),
    panel: () => { const p = [...document.querySelectorAll('#cl11View .cl11-panel')].find(x => !x.hidden); return p ? p.dataset.panel : null; },
    scrollingAbove() { const out = []; for (let n = this.bar().parentElement; n; n = n.parentElement)
      if (/^(auto|scroll)$/.test(getComputedStyle(n).overflowY)) out.push(n.id || n.tagName.toLowerCase()); return out; },
  };
}

async function main() {
  const browser = await chromium.launch();
  const errors = [];
  try {
    const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
    await page.evaluate(helpers);
    const position = await page.evaluate(() => window.__L5R_TEST__.APP_BAR_POSITION);
    const bottom = position === 'bottom';
    const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));

    await section('AB-STRUCTURE', async () => {
      check('AB-SEAM', await page.evaluate(() => [typeof window.__L5R_TEST__.AB113, typeof window.__L5R_TEST__.APPBAR113]), ['object', 'object']);
      check('AB-SECTIONS', await page.evaluate(() => window.__L5R_TEST__.AB113.sections().map(s => [s.id, s.label])), SECTIONS);
      check('AB-BAR-ITEMS', await page.evaluate(() => [...document.querySelectorAll('#ab113Bar .ab113-item')].map(b => [b.dataset.section, b.textContent])), SECTIONS);
      check('AB-PLACE', await page.evaluate(bottom => { const b = window.__ab.bar(), r = b.getBoundingClientRect(), shell = b.parentElement;
        return [bottom ? shell.lastElementChild === b : shell.firstElementChild === b, Math.round(bottom ? innerHeight - r.bottom : r.top)]; }, bottom), [true, 0]);
      check('AB-NOT-IN-A-SCROLLER', await page.evaluate(() => window.__ab.scrollingAbove()), []);
      check('AB-ON-SHEET', await page.evaluate(() => [window.__L5R_TEST__.AB113.current(), window.__ab.current(), window.__ab.reachable()]),
        ['sheet', ['sheet'], [true, true, true, true]]);
    });

    await section('AB-NAVIGATION', async () => {
      const seen = [];
      await page.exposeFunction('__abSeen', s => seen.push(s));
      await page.evaluate(() => { window.__abStop = window.__L5R_TEST__.AB113.onChange(s => window.__abSeen(s)); });
      const visit = async id => { await page.click(`#ab113Bar [data-section="${id}"]`); await page.waitForTimeout(150);
        return page.evaluate(() => ({open:window.__L5R_TEST__.CL11.isOpen(), panel:window.__ab.panel(), current:window.__ab.current(),
          api:window.__L5R_TEST__.AB113.current(), reach:window.__ab.reachable()})); };
      const ch = await visit('characters');
      check('AB-TO-CHARACTERS', ch, {open:true, panel:'characters', current:['characters'], api:'characters', reach:[true, true, true, true]});
      const lib = await visit('library');
      check('AB-TO-LIBRARY', [lib.panel, lib.current, await page.evaluate(() => /Phase 13/.test(document.querySelector('#cl11View [data-panel="library"]').textContent))],
        ['library', ['library'], true]);
      const se = await visit('search');
      check('AB-TO-SEARCH', [se.panel, se.current, await page.evaluate(() => !!document.querySelector('#cl11View [data-panel="search"] .s14-page'))], ['search', ['search'], true]);
      const sh = await visit('sheet');
      check('AB-TO-SHEET', [sh.open, sh.current, sh.api], [false, ['sheet'], 'sheet']);
      await page.evaluate(() => window.__abStop());
      await visit('characters');
      check('AB-CHANGE-NOTICES', seen, ['characters', 'library', 'search', 'sheet']);
      // Escape on the Characters screen returns to the sheet, and the bar follows.
      await page.focus('#cl11View .cl11-panel:not([hidden]) button, #cl11View .cl11-panel:not([hidden]) input');
      await page.keyboard.press('Escape');
      check('AB-ESCAPE-FOLLOWED', await page.evaluate(() => [window.__L5R_TEST__.CL11.isOpen(), window.__ab.current()]), [false, ['sheet']]);
    });

    await section('AB-SEARCH-RETURNS', async () => {
      await page.click('#ab113Bar [data-section="search"]');
      await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:'fire'}));
      const id = await page.locator('.s14-row').nth(2).getAttribute('data-id');
      await page.locator('.s14-row').nth(2).click();
      await page.click('#ab113Bar [data-section="sheet"]');
      await page.click('#ab113Bar [data-section="search"]');
      await page.waitForTimeout(150);
      check('AB-SEARCH-RETURNS', await page.evaluate(id => [!document.querySelector('.s14-detail').hidden,
        document.querySelector('.s14-detail h3').textContent === window.__L5R_TEST__.SEARCH14.get(id).name], id), [true, true]);
      await page.click('#ab113Bar [data-section="sheet"]');
    });

    await section('AB-DUPLICATES', async () => {
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      await page.click('#pm128More');
      const menu = await page.$$eval('#pm128Menu [role=menuitem]', b => b.filter(x => x.offsetParent).map(x => x.textContent));
      await page.keyboard.press('Escape');
      await page.click('#ab113Bar [data-section="characters"]');
      const hidden = await page.evaluate(() => [window.__ab.shown(document.querySelector('#cl11View .cl11-nav')),
        window.__ab.shown(document.getElementById('cl11Toolbar')), window.__ab.shown(document.getElementById('s14MenuItem'))]);
      await page.click('#ab113Bar [data-section="sheet"]');
      check('AB-DUPLICATES-HIDDEN', {menu, shown:hidden}, {menu:['Save As a copy', 'Print', 'Export JSON'], shown:[false, false, false]});
    });

    await section('AB-LAYOUT', async () => {
      for (const mode of ['play', 'management']) {
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode);
        const g = await page.evaluate(bottom => {
          const A = window.__ab, bar = A.rect(A.bar()), top = A.rect(document.getElementById('carTopbar')), tabs = A.rect(document.getElementById('carTabbar'));
          const qa = document.getElementById('quickAccessToggleBtn'), dice = document.querySelector('.floating-dice-btn');
          return {header:!A.overlap(bar, top), tabs:!A.overlap(bar, tabs), qa:!A.shown(qa) || (!A.overlap(bar, A.rect(qa)) && A.rect(qa).top >= top.bottom - 0.5),
            dice:!A.shown(dice) || !A.overlap(bar, A.rect(dice)), order:bottom ? tabs.bottom <= bar.top + 0.5 : bar.bottom <= top.top + 0.5,
            reach:A.reachable()};
        }, bottom);
        check('AB-NO-OVERLAP-' + mode.toUpperCase(), g, {header:true, tabs:true, qa:true, dice:true, order:true, reach:[true, true, true, true]});
      }
      await page.click('#ab113Bar [data-section="characters"]');
      check('AB-CHARACTERS-LEAVES-ROOM', await page.evaluate(bottom => { const A = window.__ab, bar = A.rect(A.bar()), v = A.rect(document.getElementById('cl11View'));
        return [bottom ? Math.round(bar.top - v.bottom) : Math.round(v.top - bar.bottom), A.reachable()]; }, bottom), [0, [true, true, true, true]]);
      await page.click('#ab113Bar [data-section="sheet"]');
      await page.evaluate(() => { document.getElementById('quickAccessToggleBtn').click(); });
      check('AB-QUICK-ACCESS-CLEAR', await page.evaluate(() => { const A = window.__ab, p = document.getElementById('quickAccessPanel');
        return A.shown(p) && !A.overlap(A.rect(A.bar()), A.rect(p)); }));
      await page.evaluate(() => { document.getElementById('quickAccessToggleBtn').click(); });
      // A modal sits above the bar.
      await page.evaluate(() => document.querySelector('.floating-dice-btn').click());
      await page.waitForTimeout(200);
      check('AB-MODALS-ABOVE', await page.evaluate(() => { const r = window.__ab.bar().getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!hit && !window.__ab.bar().contains(hit) && !!hit.closest('.roll-modal-overlay'); }));
      await page.keyboard.press('Escape');
      await page.evaluate(() => document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; }));
      await page.emulateMedia({media:'print'});
      check('AB-PRINT-HIDDEN', await page.evaluate(() => getComputedStyle(window.__ab.bar()).display), 'none');
      await page.emulateMedia({media:'screen'});
    });

    for (const [w, h] of [[320, 700], [375, 812], [390, 844]]) {
      await section('AB-WIDTH-' + w, async () => {
        await page.setViewportSize({width:w, height:h});
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
        const out = [];
        for (const id of ['sheet', 'characters', 'search']) {
          await page.click(`#ab113Bar [data-section="${id}"]`);
          out.push(await page.evaluate(() => { const b = window.__ab.bar(), acts = document.getElementById('pm128Actions');
            return document.documentElement.scrollWidth <= innerWidth && b.scrollWidth <= b.clientWidth &&
              (!acts || !window.__ab.shown(acts) || acts.scrollWidth <= acts.clientWidth + 1); }));
        }
        await page.click('#ab113Bar [data-section="sheet"]');
        check('AB-FITS-' + w, out, [true, true, true]);
      });
    }
    await page.setViewportSize({width:390, height:844});
    check('AB-SHEET-UNCHANGED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData())) === before);
    check('AB-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
