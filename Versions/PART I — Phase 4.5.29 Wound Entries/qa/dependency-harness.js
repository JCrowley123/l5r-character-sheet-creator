/* Dependency boundaries for Phase 4.5.29 Wound Entries (Part I). Each variant switches off one
 * thing this release sits beside, in a copy of the built page, and checks what still works:
 *   The wound core (computeWoundThresholds, getWoundPenalty, formatWoundPenalty) is the only hard
 *     dependency, and it is never switched off here: THE CONTRACT at the top of the fragment and
 *     the harness's CONTRACT checks cover it.
 *   Phase 4.5's Advantage configuration (soft): the roll line rides its advConfigExtendedRollModifiers
 *     seat and the row lines its refreshAllAdvConfigControls pass. The penalty, the Wound Ranks and
 *     the track's text do not depend on it at all.
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
// ranks: Permanent Wound empties Healthy; penalty: Strength of the Earth cuts Grazed by 3; text: the
// track names it; row: the row line; roll: the roll preview's explanation line.
const variants = [
  {id:'CONTROL', ranks:true, penalty:true, text:true, row:true, roll:true},
  {id:'ROLL-EFFECTS-OFF', off:'ADV_CONFIG_ROLL_EFFECTS_ENABLED', ranks:true, penalty:true, text:true, row:true, roll:false},
  {id:'ADV-CONFIG-OFF', off:'ADV_CONFIG_ENABLED', ranks:true, penalty:true, text:true, row:true, roll:false},
];
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
      const context = await browser.newContext(), page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.route('**/*', r => r.request().url().startsWith('http://wnd4529.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://wnd4529.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
      const actual = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.();
        for (const id of ['trait_stamina', 'trait_willpower']) document.getElementById(id).value = 2;
        const add = (name, list, lib) => { const e = lib.find(x => x.name === name);
          document.getElementById(list).appendChild(T.makeEntry({name, cost:e.cost, desc:e.desc}, true)); };
        add('Strength of the Earth', 'advList', T.ADV_LIBRARY); add('Permanent Wound', 'disadvList', T.DISADV_LIBRARY);
        T.recalcAll();
        const ranks = T.computeWoundThresholds(2)[0] === 0;
        const lim = T.computeWoundThresholds(2);
        document.getElementById('f_woundsTaken').value = lim[1] + 1; T.renderWounds();   // Grazed
        const core = T.WND4529.corePenalty(), now = T.getWoundPenalty();
        const penalty = Math.abs(now) === Math.abs(core) - 3;
        const text = /Strength of the Earth −3/.test(document.getElementById('woundSummaryLine').textContent);
        const row = document.querySelectorAll('.wound4529-note').length === 2;
        const roll = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.TRAIT, {traitName:'Agility'}))
          .some(m => m.informational && m.label === 'Wound Penalty');
        return {seam:!!T.WND4529, ranks, penalty, text, row, roll};
      });
      check(variant.id + '-SEAM', actual.seam);
      for (const key of ['ranks', 'penalty', 'text', 'row', 'roll']) check(variant.id + '-' + key.toUpperCase(), actual[key], variant[key]);
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
