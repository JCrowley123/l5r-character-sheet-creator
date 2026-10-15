'use strict';
// BUGFIX — Search Focus on Close: switch, absence and dependency variants of one sheet, served in memory.
const fs = require('fs'), {chromium} = require('playwright');
const input = fs.readFileSync(process.argv[2], 'utf8'), results = [];
function check(id, actual, want) {
  const pass = JSON.stringify(actual) === JSON.stringify(want); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 300)));
}
async function main() {
  const browser = await chromium.launch();
  try {
    for (const v of [
      {id:'CONTROL', api:true, focus:'row'},
      {id:'OFF', off:'SEARCH_FOCUS_FIX_ENABLED', api:false, focus:'lost'},
      {id:'FRAGMENT-ABSENT', absent:true, api:null, focus:'lost'},
      {id:'FACETS-OFF', off:'SEARCH_FACET_PAGE_ENABLED', api:true, focus:'row'},
      {id:'PAGE-OFF', off:'SEARCH_PAGE_ENABLED', api:false, focus:'no search'}]) {
      let html = input;
      if (v.off) { const term = 'const ' + v.off + ' = true;';
        if (html.split(term).length !== 2) throw Error('Non-unique switch ' + v.off); html = html.replace(term, 'const ' + v.off + ' = false;'); }
      if (v.absent) { const start = '  // ============ BUGFIX SEARCHFOCUS — SEARCH FOCUS ON CLOSE ============',
        end = '  // ============ END BUGFIX SEARCHFOCUS ============';
        const a = html.indexOf(start), b = html.indexOf(end); if (a < 0 || b < a) throw Error('Missing own fragment');
        html = html.slice(0, a) + html.slice(b + end.length); }
      const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
      const page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.route('**/*', r => r.request().url().startsWith('http://focus.test/') ? r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://focus.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
      check('SF-DEP-' + v.id + '-API', await page.evaluate(() => window.__L5R_TEST__.SEARCHFOCUS ? window.__L5R_TEST__.SEARCHFOCUS.enabled() : null), v.api);
      const opened = await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:'fire'}));
      let focus = 'no search';
      if (opened) {
        const id = await page.locator('.s14-row').first().getAttribute('data-id');
        await page.locator('.s14-row').first().click();
        await page.click('.s14-detail [data-s14="back"]');
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        focus = await page.evaluate(id => document.activeElement && document.activeElement.dataset && document.activeElement.dataset.id === id
          ? 'row' : 'lost', id);
      }
      check('SF-DEP-' + v.id + '-FOCUS', focus, v.focus);
      check('SF-DEP-' + v.id + '-ERRORS', errors, []);
      await context.close();
    }
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + results.length + ' checks passed');
  process.exitCode = pass === results.length && results.length === 15 ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
