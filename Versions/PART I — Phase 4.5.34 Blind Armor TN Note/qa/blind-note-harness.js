/* Real-browser acceptance tests for Phase 4.5.34 Blind's Armor TN Note (Part I).
 * Oracle: Core Rulebook p.156 (Blind: the base TN is Reflexes + 5) and the sheet's own Base TN field, never BL4534.
 * node blind-note-harness.js <sheet.html>
 */
'use strict';
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);
}
async function setup(page, entries, {list = 'disadvList', reflexes = 2} = {}) {
  await page.evaluate(({entries, list, reflexes}) => {
    const T = window.__L5R_TEST__;
    T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
    const r = document.getElementById('trait_reflexes'); r.value = reflexes; r.dataset.free = reflexes;
    for (const name of entries) {
      const lib = T.DISADV_LIBRARY.find(x => x.name === name);
      document.getElementById(list).appendChild(T.makeEntry({name, cost:lib.cost, desc:lib.desc}, true));
    }
    T.recalcAll();
  }, {entries, list, reflexes});
}
const notes = page => page.evaluate(() => {
  const b = document.getElementById('bl4534BaseNote'), q = document.getElementById('bl4534QaNote');
  return {base:b ? b.textContent : null, qa:q ? q.textContent : null, baseTN:document.getElementById('f_baseTN').value,
    under:!!b && b.previousElementSibling === document.getElementById('f_baseTN')};
});
async function main() {
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await (await browser.newContext({viewport:{width:390, height:844}})).newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout:60000});
    check('BL-SEAM', await page.evaluate(() => typeof window.__L5R_TEST__.BL4534), 'object');
    await setup(page, []);
    check('BL-NONE-WITHOUT-BLIND', await notes(page), {base:null, qa:null, baseTN:String(2 * 5 + 5), under:false});
    await setup(page, ['Blind'], {reflexes:2});
    check('BL-BASE-NOTE', await notes(page), {base:'Blind: Reflexes 2 + 5 = 7 (Core Rulebook p.156)', qa:'Blind: Reflexes 2 + 5 = 7', baseTN:'7', under:true});
    // Typed, with input only: the Traits' own listeners recalc.
    await page.evaluate(() => { const r = document.getElementById('trait_reflexes'); r.value = 4; r.dispatchEvent(new Event('input', {bubbles:true})); });
    await page.waitForTimeout(100);
    check('BL-FOLLOWS-REFLEXES', (await notes(page)).base, 'Blind: Reflexes 4 + 5 = 9 (Core Rulebook p.156)');
    await page.evaluate(() => { window.__L5R_TEST__.renderQuickAccessPanel(); });
    check('BL-QUICK-ACCESS-REPAINT', (await notes(page)).qa, 'Blind: Reflexes 4 + 5 = 9');
    check('BL-NUMBERS-UNCHANGED', await page.evaluate(() => document.getElementById('qaArmorTNValue').textContent === document.getElementById('f_currentTN').value));
    await setup(page, ['Blind'], {list:'advList'});
    check('BL-WRONG-LIST-NONE', (await notes(page)).base, null);
    await setup(page, ['Blind']);
    await setup(page, []);
    check('BL-GONE-WHEN-REMOVED', await notes(page), {base:null, qa:null, baseTN:'15', under:false});
    await setup(page, ['Blind']);
    await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('play'); window.__L5R_TEST__.recalcAll(); });
    check('BL-PLAY-MODE', (await notes(page)).base, 'Blind: Reflexes 2 + 5 = 7 (Core Rulebook p.156)');
    check('BL-STYLED', await page.evaluate(() => getComputedStyle(document.getElementById('bl4534BaseNote')).fontSize !== getComputedStyle(document.body).fontSize));
  } finally {
    check('BL-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('BL-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
