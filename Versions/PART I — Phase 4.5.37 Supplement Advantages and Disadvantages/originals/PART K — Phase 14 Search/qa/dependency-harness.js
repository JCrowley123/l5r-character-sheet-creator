/* Dependency boundaries for Phase 14 Search (Part K). Each variant switches one thing off in a copy of the built
 * page and checks the declared behaviour:
 *   SEARCH_PAGE_ENABLED off: the data layer still answers; no menu item; the Search tab keeps Phase 11's placeholder.
 *   SEARCH_ENABLED off: no sources, no page, no menu item; the placeholder stays.
 *   Advanced Schools (Phase 4.7), Ancestors (Phase 4.8), Clan prices (Feature 4.5.25): their category or field is
 *     simply absent; everything else is unchanged.
 *   The More menu (Phase 12.8) off: no menu item; the Search tab still holds the page.
 *   The Characters screen (Phase 11) off: the page cannot open; the data layer still answers.
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
const ALL = {data:true, categories:13, advanced:true, ancestors:true, prices:true, menuItem:true, mounted:true, opens:true};
const variants = [
  {id:'CONTROL'},
  {id:'PAGE-OFF', off:'SEARCH_PAGE_ENABLED', menuItem:false, mounted:false, opens:false},
  {id:'SEARCH-OFF', off:'SEARCH_ENABLED', data:false, categories:0, advanced:false, ancestors:false, prices:false, menuItem:false, mounted:false, opens:false},
  {id:'ADVANCED-SCHOOLS-OFF', off:'ADVANCED_SCHOOLS_ENABLED', advanced:false},
  {id:'ANCESTORS-OFF', off:'ANCESTORS_ENABLED', ancestors:false},
  {id:'CLAN-PRICES-OFF', off:'ADV_CLAN_PRICES_ENABLED', prices:false},
  {id:'MENU-OFF', off:'MODES128_ENABLED', menuItem:false},
  {id:'CHARACTERS-OFF', off:'CHARACTERS_LIST_ENABLED', menuItem:false, mounted:false, opens:false},
].map(v => Object.assign({}, ALL, v));
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
      await page.route('**/*', r => r.request().url().startsWith('http://search14.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://search14.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || !window.__L5R_TEST__.CL11.enabled() || window.__L5R_TEST__.CL11.ready));
      const actual = await page.evaluate(async () => {
        const T = window.__L5R_TEST__, S = T.SEARCH14, P = T.SEARCHPAGE14;
        const cats = S.categories();
        const count = id => (cats.find(c => c.id === id) || {count:0}).count;
        const hasPrice = S.query({text:'clear thinker', category:'advantages', limit:1}).results.map(r => S.get(r.id))
          .some(r => r.fields.some(f => f.label === 'Clan or School price'));
        const opened = await P.open({category:null, text:''});
        const panel = document.querySelector('[data-panel="search"]');
        const out = {data:S.query({text:'katana', limit:1}).total > 0, categories:cats.length,
          advanced:count('advanced') === T.ADVANCED_SCHOOL_LIBRARY.length && count('advanced') > 0,
          ancestors:count('ancestors') === T.ANC48.LIBRARY.length && count('ancestors') > 0,
          prices:hasPrice, menuItem:!!document.getElementById('s14MenuItem'),
          mounted:!!(panel && panel.querySelector('.s14-page')), opens:opened};
        if (T.CL11 && T.CL11.enabled()) {
          await T.CL11.open('search');
          out.placeholder = /Phase 14/.test(document.querySelector('[data-panel="search"]').textContent);
          out.homeShowsOnly = !out.mounted || [...document.querySelectorAll('.s14-cat')].map(b => b.dataset.category).join() ===
            cats.filter(c => c.count).map(c => c.id).join();
          T.CL11.close();
        }
        return out;
      });
      check(variant.id + '-SEAM', await page.evaluate(() => [typeof window.__L5R_TEST__.SEARCH14, typeof window.__L5R_TEST__.SEARCHPAGE14]), ['object', 'object']);
      for (const key of Object.keys(ALL)) check(variant.id + '-' + key.toUpperCase(), actual[key], variant[key]);
      if ('placeholder' in actual) check(variant.id + '-PLACEHOLDER', actual.placeholder, !variant.mounted);
      if ('homeShowsOnly' in actual) check(variant.id + '-HOME-NON-EMPTY-CATEGORIES', actual.homeShowsOnly);
      check(variant.id + '-NO-ERRORS', errors, []);
      await context.close();
    }
  } finally {
    await browser.close();
    const n = results.filter(r => r.pass).length;
    console.log(n + '/' + results.length + ' checks passed');
    process.exitCode = results.length > 0 && n === results.length ? 0 : 1;
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
