'use strict';
// Release 15a, A01: reproduce the wizard Review for Kuni, Matsu Beastmaster and a monk, each incomplete,
// complete and overspent, on a given build. Writes <out>/review-states.json and one phone screenshot per state.
// node reproduce.cjs <sheet.html> <out folder>
const fs = require('fs'), path = require('path');
const D = require('./wizard-drive.cjs');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
const only = process.argv[4] || '';
fs.mkdirSync(out, {recursive: true});
const STATES = [];
for (const kind of ['kuni', 'matsu', 'monk'].filter(k => !only || k === only)) for (const state of ['incomplete', 'complete', 'overspent', 'overspent-complete']) STATES.push([kind, state]);
(async () => {
  const browser = await D.launch();
  const results = [];
  try {
    for (const [kind, state] of STATES) {
      const {context, page} = await D.fresh(browser, sheet);
      try {
        await D.begin(page, kind);
        if (/overspent/.test(state)) await D.overspend(page);
        await D.toReview(page, /complete$/.test(state) && state !== 'incomplete');
        const r = await D.review(page);
        await page.locator('#cw112View').screenshot({path: path.join(out, kind + '-' + state + '.png')});
        await page.evaluate(() => { const v = document.getElementById('cw112View'); v.scrollTop = v.scrollHeight; });
        await page.locator('#cw112View').screenshot({path: path.join(out, kind + '-' + state + '-end.png')});
        results.push({kind, state, ...r, errors: page.errors});
        console.log('OK ' + kind + ' ' + state);
      } catch (e) {
        results.push({kind, state, error: String(e.message || e)});
        console.log('ERR ' + kind + ' ' + state + ' ' + e.message);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'review-states.json'), JSON.stringify({sheet, results}, null, 2) + '\n');
})();
