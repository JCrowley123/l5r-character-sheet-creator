/* Dependency boundaries for Phase 4.5.30 Automatic Roll Entries (Part I). Each variant switches off one
 * thing this release relies on, in a copy of the built page, and checks the declared behaviour:
 *   Phase 4.5's Advantage configuration and its roll effects (hard for the dice, guarded): with either
 *     off, no entry changes a roll; Anachronism's row line, which is only a reminder, stays.
 *   isRangedWeapon (Part C Feature 1, guarded): without it Bad Eyesight cannot tell a ranged attack and
 *     applies to Perception-based rolls only.
 * node dependency-harness.js <sheet.html>
 */
'use strict';
const fs = require('fs'), path = require('path'), {chromium} = require('playwright');
const results = [];
function check(id, actual, expected = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual) + ' expected=' + JSON.stringify(expected)));
}
// silent: Silent on Stealth; ranged: Bad Eyesight on a bow attack; perception: Bad Eyesight on a
// Perception roll; row: Anachronism's row line.
const variants = [
  {id:'CONTROL', silent:true, ranged:true, perception:true, row:true},
  {id:'ROLL-EFFECTS-OFF', off:'ADV_CONFIG_ROLL_EFFECTS_ENABLED', silent:false, ranged:false, perception:false, row:true},
  {id:'ADV-CONFIG-OFF', off:'ADV_CONFIG_ENABLED', silent:false, ranged:false, perception:false, row:true},
  {id:'RANGED-TEST-ABSENT', replace:['function isRangedWeapon(entry){', 'function isRangedWeaponGone(entry){'],
    alsoReplace:['RANGED_WEAPON_SKILLS, RANGE_RULES, isRangedWeapon, weaponListedRange', 'RANGED_WEAPON_SKILLS, RANGE_RULES, weaponListedRange'],
    silent:true, ranged:false, perception:true, row:true},
];
(async () => {
  const browser = await chromium.launch();
  try {
    const original = fs.readFileSync(process.argv[2], 'utf8');
    // The ranged and melee weapons are chosen from the unmodified page's own library.
    for (const variant of variants) {
      let html = original;
      if (variant.off) {
        const re = new RegExp('const ' + variant.off + ' = true;', 'g');
        if ((html.match(re) || []).length !== 1) throw Error('flag not unique ' + variant.off);
        html = html.replace(re, 'const ' + variant.off + ' = false;');
      }
      for (const pair of [variant.replace, variant.alsoReplace].filter(Boolean)) {
        if (html.split(pair[0]).length !== 2) throw Error('not unique ' + pair[0]);
        html = html.replace(pair[0], pair[1]);
      }
      const context = await browser.newContext(), page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.route('**/*', r => r.request().url().startsWith('http://auto4530.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://auto4530.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
      const actual = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.();
        const add = (name, list) => { const e = [...T.ADV_LIBRARY, ...T.DISADV_LIBRARY].find(x => x.name === name);
          document.getElementById(list).appendChild(T.makeEntry({name, cost:e.cost, desc:e.desc}, true)); };
        add('Silent', 'advList'); add('Bad Eyesight', 'disadvList'); add('Anachronism', 'disadvList');
        T.recalcAll();
        const has = (kind, ctx, label) => T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).some(m => m.label === label);
        const bow = T.WEAPON_LIBRARY.find(w => w.ammo || w.skill === 'Kyujutsu');
        return {seam:!!T.AUTO4530,
          silent:has('SKILL', {skillName:'Stealth', traitName:'Agility', skillRank:2}, 'Silent'),
          ranged:has('ATTACK', {skillName:'Kyujutsu', traitName:'Reflexes', weaponEntry:bow}, 'Bad Eyesight'),
          perception:has('TRAIT', {traitName:'Perception'}, 'Bad Eyesight'),
          row:!!document.querySelector('#disadvList .auto4530-note')};
      });
      check(variant.id + '-SEAM', actual.seam);
      for (const key of ['silent', 'ranged', 'perception', 'row']) check(variant.id + '-' + key.toUpperCase(), actual[key], variant[key]);
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
