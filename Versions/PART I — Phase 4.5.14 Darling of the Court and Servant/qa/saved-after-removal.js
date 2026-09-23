/* A character saved with this release, opened by a build WITHOUT it, then brought back.
 * node saved-after-removal.js <live.html> <removed.html>
 * The removed build must preserve the court list untouched and flagged, keep the saved cost,
 * keep it through a second save, and the live build must read it back fully configured.
 */
'use strict';
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const results = [];
function check(id, actual, expected = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);
}
async function open(browser, file) {
  const page = await browser.newPage({viewport:{width:375, height:812}});
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  page.errors = []; page.on('pageerror', e => page.errors.push(String(e)));
  await page.goto(pathToFileURL(path.resolve(file)).href, {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => !!window.__L5R_TEST__);
  return page;
}
const darling = page => page.evaluate(() => {
  const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Darling of the Court');
  return {cost:Number(div.querySelector('.en-cost').value), config:JSON.parse(div.dataset.advConfig || 'null'),
    text:div.querySelector('.adv-config-row')?.textContent || '', toggles:div.querySelectorAll('.court4514-session-box').length};
});
(async () => {
  const [live, removed] = process.argv.slice(2);
  if (!live || !removed) throw Error('usage: saved-after-removal.js <live.html> <removed.html>');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    const a = await open(browser, live);
    const config = {type:'courtList', revision:1, courts:['Kyuden Bayushi', 'Otosan Uchi'], selected:'Otosan Uchi', inSession:true, value:'Kyuden Bayushi, Otosan Uchi'};
    const saved = await a.evaluate(config => {
      const T = window.__L5R_TEST__; T.resetToBaseline(); T.recalcAll();
      T.applyData(Object.assign(T.collectData(), {adv:[{name:'Darling of the Court', cost:'4', desc:'', config}, {name:'Servant', cost:'3', desc:'Groom'}]}));
      T.recalcAll(); return T.collectData();
    }, config);
    check('LIVE-CONFIGURED', (await darling(a)).toggles, 1);
    check('LIVE-SAVED-CONFIG', saved.adv[0].config, config);
    const b = await open(browser, removed);
    check('REMOVED-HAS-NO-FEATURE', await b.evaluate(() => typeof window.__L5R_TEST__.CS4514), 'undefined');
    await b.evaluate(saved => { const T = window.__L5R_TEST__; T.applyData(saved); T.recalcAll(); T.recalcAll(); }, saved);
    const row = await darling(b);
    check('REMOVED-CONFIG-PRESERVED', row.config, config);
    check('REMOVED-COST-KEPT', row.cost, 4);
    check('REMOVED-FLAGGED', /Saved setting kept/.test(row.text));
    check('REMOVED-NO-CONTROLS', row.toggles, 0);
    const resaved = await b.evaluate(() => window.__L5R_TEST__.collectData());
    check('REMOVED-RESAVE-KEEPS-CONFIG', resaved.adv[0].config, config);
    check('REMOVED-SERVANT-UNCHANGED', [resaved.adv[1].cost, resaved.adv[1].desc, Object.hasOwn(resaved.adv[1], 'config')], ['3', 'Groom', false]);
    check('REMOVED-XP', await b.evaluate(() => Number(document.getElementById('f_xpSpent').value)), 7);
    const c = await open(browser, live);
    await c.evaluate(resaved => { const T = window.__L5R_TEST__; T.applyData(resaved); T.recalcAll(); }, resaved);
    const back = await darling(c);
    check('RESTORED-CONFIG', back.config, config);
    check('RESTORED-CONTROLS', [back.toggles, /counts as/.test(back.text)], [1, true]);
    check('NO-PAGE-ERRORS', [...a.errors, ...b.errors, ...c.errors], []);
  } finally { await browser.close(); }
})().catch(error => check('FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
