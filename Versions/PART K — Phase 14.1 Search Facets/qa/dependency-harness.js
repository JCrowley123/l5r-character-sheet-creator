/* Dependency boundaries for Phase 14.1 Search Facets (Part K). Each variant switches one thing off in a copy of the built
 * page and checks the declared behaviour:
 *   the facet page (SEARCH_FACET_PAGE_ENABLED) off: the logic answers in full; Search is exactly Phase 14's (no filters,
 *     Spells A to Z, its page functions unwrapped).
 *   the facet logic (SEARCH_FACETS_ENABLED) off: no facets, no filters; Search exactly Phase 14's.
 *   Search's page (Phase 14) off: the logic answers; no page, no filters. Search (Phase 14) off: neither answers.
 *   the app bar (Phase 11.3) off: the filters work and ⋯ → Search returns to the filtered list.
 *   the Characters screen (Phase 11) off: Search's page cannot open; the logic answers.
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
const ON = {logic:3, page:true, bar:true, aToZ:false, wrapped:true, filtered:true, returns:true};
const AS_PHASE_14 = {page:true, bar:false, aToZ:true, wrapped:false, filtered:null, returns:null};
const variants = [
  {id:'CONTROL'},
  {id:'FACET-PAGE-OFF', off:'SEARCH_FACET_PAGE_ENABLED', ...AS_PHASE_14},
  {id:'FACETS-OFF', off:'SEARCH_FACETS_ENABLED', ...AS_PHASE_14, logic:0},
  {id:'SEARCH-PAGE-OFF', off:'SEARCH_PAGE_ENABLED', page:false, bar:false, aToZ:null, wrapped:null, filtered:null, returns:null},
  {id:'SEARCH-OFF', off:'SEARCH_ENABLED', logic:0, page:false, bar:false, aToZ:null, wrapped:null, filtered:null, returns:null},
  {id:'APP-BAR-OFF', off:'APP_BAR_ENABLED'},
  {id:'CHARACTERS-OFF', off:'CHARACTERS_LIST_ENABLED', page:false, bar:false, aToZ:null, wrapped:null, filtered:null, returns:null},
].map(v => Object.assign({}, ON, v));
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
      await page.route('**/*', r => r.request().url().startsWith('http://facets141.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://facets141.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready ||
        window.__L5R_TEST__.CHARACTERS_LIST_ENABLED === false), null, {timeout:60000});
      const got = await page.evaluate(async () => {
        const T = window.__L5R_TEST__, F = T.FACETS141, P = T.SEARCHPAGE14;
        const out = {logic:F && F.enabled() ? F.facets('spells').length : 0};
        const opened = !!(P && P.enabled()) && await P.open({category:'spells', text:''});
        out.page = !!opened && !!document.querySelector('#cl11View .s14-page');
        const bar = document.getElementById('s141Bar');
        out.bar = !!bar && !bar.hidden;
        if (!out.page) return Object.assign(out, {aToZ:null, wrapped:null, filtered:null, returns:null});
        const rows = () => [...document.querySelectorAll('.s14-row .s14-name')].map(n => n.textContent);
        const n = s => T.SEARCH14.normalise(s);
        out.aToZ = JSON.stringify(rows()) === JSON.stringify(T.SPELL_LIBRARY.map(s => s.name).sort((a, b) => n(a) < n(b) ? -1 : n(a) > n(b) ? 1 : 0).slice(0, 50)) &&
          !document.querySelector('.s141-group, [class*="s141-"]');
        // Phase 14's own functions, unwrapped, when the facet page is not installed.
        out.wrapped = !/renderHome/.test(P.render.toString());
        if (!out.bar) return Object.assign(out, {filtered:null, returns:null});
        T.FACETPAGE141.set('element', 'Fire');
        const fire = rows();
        out.filtered = fire.length === T.SPELL_LIBRARY.filter(s => s.element === 'Fire').length;
        // Leave Search and come back by whichever control the build offers.
        T.CL11.close();
        const ab = document.querySelector('#ab113Bar [data-section="search"]');
        if (ab) ab.click(); else { document.getElementById('pm128More').click(); document.getElementById('s14MenuItem').click(); }
        await new Promise(r => setTimeout(r, 200));
        out.returns = JSON.stringify(rows()) === JSON.stringify(fire) && JSON.stringify(T.FACETPAGE141.filters()) === '{"element":["Fire"]}';
        return out;
      });
      check('F141-DEP-' + variant.id, got, {logic:variant.logic, page:variant.page, bar:variant.bar, aToZ:variant.aToZ, wrapped:variant.wrapped,
        filtered:variant.filtered, returns:variant.returns});
      check('F141-DEP-' + variant.id + '-NO-PAGE-ERRORS', errors, []);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length ? 0 : 1;
})();
