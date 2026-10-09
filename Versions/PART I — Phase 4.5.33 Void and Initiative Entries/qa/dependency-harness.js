/* Dependency boundaries for Phase 4.5.33 Void and Initiative Entries (Part I). Each variant switches one thing off
 * in a copy of the built page and checks the declared behaviour:
 *   Phase 4.5's Advantage configuration or its roll effects switched off: the roll modifiers (the extra Void
 *     dice, Quick's Initiative) go with the adv-config seat they ride; Momoku's closed Void card and the row
 *     lines stay (the trunk's recalc still calls refreshAllAdvConfigControls).
 *   This release's own switch: nothing of it remains.
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
const ALL = {dice:true, momoku:true, quick:true, rows:true};
const variants = [
  {id:'CONTROL'},
  {id:'ADV-CONFIG-OFF', off:'ADV_CONFIG_ENABLED', dice:false, quick:false},
  {id:'ROLL-EFFECTS-OFF', off:'ADV_CONFIG_ROLL_EFFECTS_ENABLED', dice:false, quick:false},
  {id:'RELEASE-OFF', off:'VOID_INITIATIVE_ENTRIES_ENABLED', dice:false, momoku:false, quick:false, rows:false},
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
      const context = await browser.newContext(), page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.route('**/*', r => r.request().url().startsWith('http://vi4533.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://vi4533.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
      const actual = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.();
        document.getElementById('void_current').value = 2;
        const add = (name, list) => { const e = [...T.ADV_LIBRARY, ...T.DISADV_LIBRARY].find(x => x.name === name);
          const row = T.makeEntry({name, cost:e.cost, desc:e.desc}, true); document.getElementById(list).appendChild(row); return row; };
        const dice = () => { T.setVoidPending({k1:true});
          const m = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Athletics'})).filter(x => x.source === 'void');
          T.clearVoidPending(); return m.reduce((s, x) => s + x.rolledDelta, 0); };
        add('Daredevil', 'advList'); add('Quick', 'advList'); T.recalcAll();
        const out = {dice:dice() === 3};
        T.setCombatActive(true); T.recordRoundSpend('Quick', 3);
        out.quick = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE, {})).some(x => x.source === 'quick' && x.totalDelta === 3);
        T.recalcAll();
        out.rows = document.querySelectorAll('.vi4533-row').length === 2;
        add('Momoku', 'disadvList'); T.recalcAll();
        out.momoku = !T.canSpendVoid('k1').ok;
        T.setCombatActive(false); T.resetCombatRound();
        return out;
      });
      check(variant.id + '-SEAM', await page.evaluate(() => typeof window.__L5R_TEST__.VI4533), 'object');
      for (const key of Object.keys(ALL)) check(variant.id + '-' + key.toUpperCase(), actual[key], variant[key]);
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
