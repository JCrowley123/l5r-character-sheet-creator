/* Dependency boundaries for Phase 4.5.31 Checks and Conditions (Part I). Each variant switches off one
 * thing this release relies on, in a copy of the built page, and checks the declared behaviour:
 *   Phase 4.5's Advantage configuration and its roll effects (guarded): with either off, no entry
 *     changes a roll and no tick is offered; the rows, their check buttons, Blind's Armor TN and the
 *     Void spell gate stay (none of them is a roll modifier).
 *   The declaration registry (Feature 4.5.15, guarded): without it the three ticks are not offered;
 *     everything else stays.
 *   The casting report (Phase 8, Part J, guarded): without it there is no report to flag a Void spell
 *     on the list; learning is still gated.
 *   The Advantage eligibility gates (Feature 4.5.5, guarded): without them Ishiken-Do is not greyed
 *     in the picker; its row still says it is not in effect for a non-Shugenja.
 *   Feature 4.5.3's repairs (guarded): without them nothing flags an unknown setting, and the switches
 *     still save.
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
const ALL = {rows:true, check:true, armor:true, gate:true, lostLove:true, blindAttack:true, tick:true, report:true, picker:true, ishikenRow:true, saved:true};
const variants = [
  {id:'CONTROL'},
  {id:'ROLL-EFFECTS-OFF', off:'ADV_CONFIG_ROLL_EFFECTS_ENABLED', lostLove:false, blindAttack:false, tick:false},
  {id:'ADV-CONFIG-OFF', off:'ADV_CONFIG_ENABLED', lostLove:false, blindAttack:false, tick:false},
  {id:'DECLARATIONS-OFF', off:'ROLL_DECLARATIONS_ENABLED', tick:false},
  {id:'CASTING-REPORT-OFF', off:'CASTING_DIAGNOSTICS_ENABLED', report:false},
  {id:'ELIGIBILITY-GATES-OFF', off:'ADV_ELIGIBILITY_GATES_ENABLED', picker:false},
  {id:'CONFIG-REPAIRS-OFF', off:'ADV_CONFIG_REPAIRS_ENABLED'},
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
      await page.route('**/*', r => r.request().url().startsWith('http://chk4531.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://chk4531.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
      const actual = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.();
        T.saveSchoolsList([]); document.getElementById('f_school').value = '';
        document.getElementById('trait_reflexes').value = 3; document.getElementById('f_armorTN').value = 0;
        const add = (name, list, config) => { const e = [...T.ADV_LIBRARY, ...T.DISADV_LIBRARY].find(x => x.name === name);
          const row = T.makeEntry({name, cost:e.cost, desc:e.desc}, true); document.getElementById(list).appendChild(row);
          if (config) row.dataset.advConfig = JSON.stringify(config); return row; };
        for (const n of ['Brash', 'Lame', 'Blind']) add(n, 'disadvList');
        const love = add('Lost Love', 'disadvList', {type:'chk4531', reminded:true});
        add('Ishiken-Do', 'advList');
        T.recalcAll(); T.recalcAll();
        const ctx = (kind, extra) => T.makeRollContext(T.ROLL_KINDS[kind], extra);
        const has = (c, label) => T.getPreRollModifiers(c).some(m => m.label === label);
        const bow = T.WEAPON_LIBRARY.find(w => T.isRangedWeapon(w));
        const ishikenRow = !!([...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Ishiken-Do')?.querySelector('.chk4531-row'));
        // The picker is read for a non-Shugenja who has not taken it yet.
        [...document.querySelectorAll('#advList .entry')].forEach(d => d.remove());
        T.recalcAll();
        const ishikenOpt = [...document.getElementById('advQuickAdd').options].find(o => o.value === 'Ishiken-Do');
        const pickerGreyed = !!ishikenOpt && ishikenOpt.disabled;
        // The Void gate and the report want a Shugenja without Ishiken-Do.
        T.saveSchoolsList([{name:'Isawa Shugenja', frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}]);
        document.getElementById('f_school').value = 'Isawa Shugenja'; T.recalcAll();
        const doc = new DOMParser().parseFromString('<select>' + T.techQuickAddOptionsHTML() + '</select>', 'text/html');
        const voidOpts = [...doc.querySelectorAll('option')].filter(o => /^spell:/.test(o.value) && T.SPELL_LIBRARY[+o.value.split(':')[1]].element === 'Void');
        const s = T.SPELL_LIBRARY.find(x => x.element === 'Void' && x.mastery === 1);
        const spell = T.makeEntry({name:s.name, cost:0, desc:'', spellElement:'void', spellMastery:1, spellKeywords:[]}, true, 'XP');
        document.getElementById('techList').appendChild(spell); T.recalcAll();
        return {seam:!!T.CHK4531,
          rows:document.querySelectorAll('#disadvList .chk4531-row').length === 4,
          check:[...document.querySelectorAll('.chk4531-btn')].some(b => b.textContent === 'Check (TN 25)'),
          armor:+document.getElementById('f_baseTN').value === 8,
          gate:voidOpts.length > 0 && voidOpts.every(o => o.disabled && / — needs Ishiken-Do/.test(o.textContent)),
          lostLove:has(ctx('TRAIT', {traitName:'Strength'}), 'Lost Love'),
          blindAttack:has(ctx('ATTACK', {skillName:'Kyujutsu', traitName:'Reflexes', weaponEntry:bow}), 'Blind'),
          tick:!!T.RD4515 && T.RD4515.offered(ctx('TRAIT', {traitName:'Agility'})).some(o => o.provider === 'checks-conditions'),
          report:T.getCastingDiagnostics(T.makeCastingContext(spell)).findings.some(f => f.id === 'ishiken-do'),
          picker:pickerGreyed,
          ishikenRow,
          saved:(T.collectData().disadv.find(d => d.name === 'Lost Love') || {}).config?.reminded === true && love.isConnected};
      });
      check(variant.id + '-SEAM', actual.seam);
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
