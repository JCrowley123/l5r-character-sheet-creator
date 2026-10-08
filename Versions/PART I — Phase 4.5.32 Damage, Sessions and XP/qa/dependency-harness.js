/* Dependency boundaries for Phase 4.5.32 Damage, Sessions and XP (Part I). Each variant switches off one
 * thing this release relies on, in a copy of the built page, and checks the declared behaviour:
 *   Phase 4.5's roll effects (guarded): with them off, Haunted's tick is not offered; damage, the
 *     Destinies, the XP entries and the rows stay (none of them is a roll modifier).
 *   Phase 4.5's Advantage configuration (guarded): the same; the rows, switches and Blissful Betrothal's
 *     prices still work (the prices are set on every pass, not only by Phase 4.5's per-row refresh).
 *   The declaration registry (Feature 4.5.15, guarded): without it Haunted's tick is not offered.
 *   The Advantage eligibility gates (Feature 4.5.5, guarded): without them Large is not greyed beside
 *     Small; with both on the list neither still applies.
 *   Feature 4.5.29's Wound entries: Great Destiny follows whatever the wound core returns, with or
 *     without them (a contract, not a dependency).
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
const ALL = {rows:true, damage:true, destiny:true, enlightened:true, obtuse:true, betrothal:true, haunted:true, picker:true};
const variants = [
  {id:'CONTROL'},
  {id:'ROLL-EFFECTS-OFF', off:'ADV_CONFIG_ROLL_EFFECTS_ENABLED', haunted:false},
  {id:'ADV-CONFIG-OFF', off:'ADV_CONFIG_ENABLED', haunted:false},
  {id:'DECLARATIONS-OFF', off:'ROLL_DECLARATIONS_ENABLED', haunted:false},
  {id:'ELIGIBILITY-GATES-OFF', off:'ADV_ELIGIBILITY_GATES_ENABLED', picker:false},
  {id:'WOUND-ENTRIES-OFF', off:'WOUND_ENTRIES_ENABLED'},
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
      await page.route('**/*', r => r.request().url().startsWith('http://dsx4532.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://dsx4532.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
      const actual = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.(); T.saveSchoolsList([]);
        for (const id of ['trait_strength', 'trait_awareness']) { const el = document.getElementById(id); el.value = 3; el.dataset.free = 3; }
        document.getElementById('ring_earth').value = 3;
        const v = document.getElementById('ring_void'); v.value = 3; v.dataset.free = 2;
        document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Courtier', trait:'Awareness', rank:3}));
        const add = (name, list, config, cost) => { const e = [...T.ADV_LIBRARY, ...T.DISADV_LIBRARY].find(x => x.name === name);
          const row = T.makeEntry({name, cost:cost === undefined ? e.cost : cost, desc:e.desc}, true); document.getElementById(list).appendChild(row);
          if (config) row.dataset.advConfig = JSON.stringify(config); return row; };
        for (const n of ['Hands of Stone', 'Great Destiny', 'Enlightened', 'Blissful Betrothal', 'Small']) add(n, n === 'Small' ? 'disadvList' : 'advList');
        add('Obtuse', 'disadvList');
        add('Haunted', 'disadvList', {type:'dsx4532', angry:true});
        const social = add('Social Position', 'advList');
        T.recalcAll(); T.recalcAll();
        const unarmed = T.getWeaponDamageDice(T.WEAPON_LIBRARY.find(w => w.skill === 'Jiujutsu'), 0);
        const strength = 3;
        const voidXP = +[...document.querySelectorAll('#xpBreakdown div')].find(x => x.textContent.startsWith('Void:')).querySelector('strong').textContent;
        const largeOpt = [...document.getElementById('advQuickAdd').options].find(o => o.value === 'Large');
        const t = T.computeWoundThresholds(parseInt(document.getElementById('ring_earth').value || '2', 10));
        const ctx = T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier', traitName:'Awareness', skillRank:3});
        return {seam:!!T.DSX4532,
          rows:document.querySelectorAll('.dsx4532-row').length === 7,
          // Hands of Stone +0k1 and Small -1k0 on 0k1 + Strength 3.
          damage:unarmed.numDice === strength - 1 && unarmed.keepDice === 2,
          destiny:T.DSX4532.woundLimit() === t[t.length - 1],
          enlightened:voidXP === 18 - 2,
          obtuse:document.querySelector('#skillsBody .sk-cost').textContent === '12 xp',
          betrothal:+social.querySelector('.en-cost').value === 4,
          haunted:!!T.RD4515 && T.RD4515.offered(ctx).some(o => o.provider === 'damage-sessions-xp'),
          picker:!!largeOpt && largeOpt.disabled};
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
