/* Dependency boundaries for Phase 11.3 App Bar (Part K). Each variant switches one thing off in a copy of the built page
 * and checks the declared behaviour:
 *   the bar (APP_BAR_ENABLED) off: no bar; the navigation module still answers; every control the bar repeats is back.
 *   the navigation (APP_NAV_ENABLED) off: no bar (it draws the navigation); the controls are back.
 *   the Characters screen (Phase 11) off: no bar, no navigation; the sheet works and nothing throws.
 *   the More menu (Phase 12.8) off: the bar works; Search through the bar.
 *   Search's page (Phase 14) off, or Search off: the bar's Search opens the Characters screen's Search tab placeholder.
 * node dependency-harness.js <sheet.html>
 */
'use strict';
const fs = require('fs'), {chromium} = require('playwright');
const results = [];
function check(id, actual, expected = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual) + ' expected=' + JSON.stringify(expected)));
}
const BAR = {bar:true, nav:true, repeatsHidden:[true, true, true], search:'page'};
const NONE = {bar:false, repeatsHidden:[false, false, false]};
const variants = [
  {id:'CONTROL'},
  {id:'BAR-OFF', off:'APP_BAR_ENABLED', ...NONE},
  {id:'NAV-OFF', off:'APP_NAV_ENABLED', ...NONE, nav:false},
  {id:'CHARACTERS-OFF', off:'CHARACTERS_LIST_ENABLED', bar:false, nav:false, repeatsHidden:null, search:null},
  {id:'MENU-OFF', off:'MODES128_ENABLED', repeatsHidden:[true, true, null]},
  {id:'SEARCH-PAGE-OFF', off:'SEARCH_PAGE_ENABLED', repeatsHidden:[true, true, null], search:'placeholder'},
  {id:'SEARCH-OFF', off:'SEARCH_ENABLED', repeatsHidden:[true, true, null], search:'placeholder'},
].map(v => Object.assign({}, BAR, v));
(async () => {
  const browser = await chromium.launch();
  try {
    const original = fs.readFileSync(process.argv[2], 'utf8');
    for (const variant of variants) {
      let html = original;
      if (variant.off) {
        const re = new RegExp('const ' + variant.off + ' = true;', 'g');
        if ((html.match(re) || []).length !== 1) throw Error('flag not unique ' + variant.off);
        html = html.replace(re, 'const ' + variant.off + ' = false;');
      }
      const context = await browser.newContext({viewport:{width:390, height:844}}), page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.route('**/*', r => r.request().url().startsWith('http://appbar113.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://appbar113.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready ||
        window.__L5R_TEST__.CHARACTERS_LIST_ENABLED === false), null, {timeout:60000});
      const id = variant.id;
      const got = await page.evaluate(async () => {
        const T = window.__L5R_TEST__, shown = el => !!el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
        const out = {bar:!!document.getElementById('ab113Bar'), nav:!!(T.AB113 && T.AB113.enabled())};
        if (!(T.CL11 && T.CL11.enabled())) return Object.assign(out, {repeatsHidden:null, search:null});
        // The controls the bar repeats: the Characters screen's tab row, the header's Characters button, ⋯ → Search.
        await T.CL11.open('characters');
        const row = shown(document.querySelector('#cl11View .cl11-nav'));
        T.CL11.close();
        const toolbar = shown(document.getElementById('cl11Toolbar'));
        let item = null;
        const more = document.getElementById('pm128More');
        if (more) { more.click(); const s = document.getElementById('s14MenuItem'); item = s ? shown(s) : null; more.click(); }
        out.repeatsHidden = [!row, !toolbar, item === null ? null : !item];
        // Search through the navigation module (the bar's own taps are measured in appbar-harness.js).
        if (out.nav) {
          await T.AB113.show('search');
          const panel = document.querySelector('#cl11View [data-panel="search"]');
          out.search = panel.querySelector('.s14-page') ? 'page' : /Phase 14/.test(panel.textContent) ? 'placeholder' : 'other';
          await T.AB113.show('sheet');
        } else out.search = null;
        return out;
      });
      const want = {bar:variant.bar, nav:variant.nav, repeatsHidden:variant.repeatsHidden, search:variant.nav ? variant.search : null};
      check('AB-DEP-' + id, got, want);
      check('AB-DEP-' + id + '-NO-PAGE-ERRORS', errors, []);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length ? 0 : 1;
})();
