'use strict';
// BUGFIX — Print Copies Cleanup: after printing, no Export to PDF print copy survives, including copies the carousel
// re-made while printing. Oracle: the document itself (any .pdf111-print-text or .pdf111-text-source left).
// The real case: a resize while printing makes the carousel refresh its edge-page clone (investigated 14 October).
const path = require('path'), {pathToFileURL} = require('url'), {chromium} = require('playwright');
const IDS = ['PC-SWITCH', 'PC-CLONE-COPIES-REMOVED', 'PC-CAROUSEL-REFRESH-WHILE-PRINTING', 'PC-RECORDED-RESTORE-UNCHANGED',
  'PC-SCREEN-FIELDS-VISIBLE', 'PC-NO-PAGE-ERRORS'];
const results = [];
function check(id, actual, want = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(want); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 300)));
}
const left = page => page.evaluate(() => document.querySelectorAll('.pdf111-print-text, .pdf111-text-source').length);
async function main() {
  const browser = await chromium.launch(), errors = [];
  try {
    const page = await browser.newPage({viewport:{width:390, height:844}});
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready && window.__L5R_CAROUSEL__.isReady(), null, {timeout:60000});
    await page.evaluate(() => window.__L5R_TEST__.CL11.close && window.__L5R_TEST__.CL11.close());
    check('PC-SWITCH', await page.evaluate(() => window.__L5R_TEST__.PRINT_COPIES_FIX_ENABLED === true && !!window.__L5R_TEST__.PRINTCOPIES &&
      window.__L5R_TEST__.PRINTCOPIES.enabled()));
    const before = await page.evaluate(() => {
      const details = Array.from(document.querySelectorAll('.combat-details'));
      details.forEach((d, i) => d.open = i % 2 === 1);
      return {data:JSON.stringify(window.__L5R_TEST__.collectData()), open:details.map(d => d.open)};
    });
    // A copy made while printing, as the carousel's clone refresh does with cloneNode(true).
    check('PC-CLONE-COPIES-REMOVED', await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeprint'));
      const source = document.querySelector('.car-page textarea').closest('.car-page');
      const copy = source.parentNode.appendChild(source.cloneNode(true));
      copy.setAttribute('aria-hidden', 'true');
      const carried = copy.querySelectorAll('.pdf111-print-text').length;
      window.dispatchEvent(new Event('afterprint'));
      const leftover = document.querySelectorAll('.pdf111-print-text, .pdf111-text-source').length;
      copy.remove();
      return [carried > 0, leftover];
    }), [true, 0]);
    // The investigated sequence: start printing at phone width, widen the window, let the carousel settle and refresh.
    await page.evaluate(() => window.__L5R_CAROUSEL__.goToTab(0));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await page.setViewportSize({width:1000, height:1000});
    await page.waitForTimeout(600);
    const during = await left(page);
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    check('PC-CAROUSEL-REFRESH-WHILE-PRINTING', [during > 0, await left(page)], [true, 0]);
    check('PC-RECORDED-RESTORE-UNCHANGED', await page.evaluate(b => [JSON.stringify(window.__L5R_TEST__.collectData()) === b.data,
      JSON.stringify(Array.from(document.querySelectorAll('.combat-details')).map(d => d.open)) === JSON.stringify(b.open)], before), [true, true]);
    check('PC-SCREEN-FIELDS-VISIBLE', await page.evaluate(() => Array.from(document.querySelectorAll('.car-page textarea'))
      .every(t => !t.classList.contains('pdf111-text-source') && getComputedStyle(t).display !== 'none')));
    check('PC-NO-PAGE-ERRORS', errors, []);
  } catch (e) {
    for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached: ' + String(e.message || e).split('\n')[0], 'completed');
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + IDS.length + ' checks passed');
  process.exitCode = pass === IDS.length && results.length === IDS.length ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
