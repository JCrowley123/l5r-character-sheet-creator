/* Dependency boundaries for Phase 4.5.28 Situational Entry Buttons and Gates (Part I). Each variant
 * switches off or drops one thing this release relies on, in a copy of the built page, and checks
 * the declared behaviour:
 *   Feature 4.5.27 (hard): without its fragment this release does nothing at all; with its switch
 *     or the Advantage roll-effect switches off, the two buttons go (their rolls would carry
 *     nothing) but the requirement notes stay.
 *   Feature 4.5.15: none since the 7 October device correction (Wary is applied directly, never
 *     ticked); the registry being off or absent changes nothing here.
 *   Feature 4.5.5 (soft): without the picker gate the two entries are not greyed out, but their
 *     rows still say why and Imperial Scribe's bonuses stay withheld.
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
const phase = path.resolve(__dirname, '../../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability');
// buttons: Spot ambush and Recall on their rows; ambush: Wary on the Spot ambush roll and how
// ('tick' through the registry, 'direct' without it, 'none'); greyed: the picker gate; notes: the
// rows' requirement notes; withheld: an unqualified Imperial Scribe offers no +1k0.
const variants = [
  {id:'CONTROL', buttons:true, ambush:'direct', greyed:true, notes:true, withheld:true},
  {id:'ENTRIES-ABSENT', drop:'209.9999994-feat-situational-entries.js', buttons:false, ambush:'none', greyed:false, notes:false, withheld:true},
  {id:'ENTRIES-OFF', off:'SITUATIONAL_ENTRIES_ENABLED', buttons:false, ambush:'none', greyed:true, notes:true, withheld:true},
  {id:'ROLL-EFFECTS-OFF', off:'ADV_CONFIG_ROLL_EFFECTS_ENABLED', buttons:false, ambush:'none', greyed:true, notes:true, withheld:true},
  {id:'REGISTRY-OFF', off:'ROLL_DECLARATIONS_ENABLED', buttons:true, ambush:'direct', greyed:true, notes:true, withheld:true},
  {id:'REGISTRY-ABSENT', drop:'209.927-feat-roll-declarations.js', buttons:true, ambush:'direct', greyed:true, notes:true, withheld:true},
  {id:'PICKER-GATE-OFF', off:'ADV_ELIGIBILITY_GATES_ENABLED', buttons:true, ambush:'direct', greyed:false, notes:true, withheld:true},
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
      if (variant.drop) {
        const fragment = fs.readFileSync(path.join(phase, 'src/sheet', variant.drop), 'utf8');
        if (html.split(fragment).length !== 2) throw Error('fragment not unique ' + variant.drop);
        html = html.replace(fragment, '');
      }
      const context = await browser.newContext(), page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.route('**/*', r => r.request().url().startsWith('http://sit4528.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://sit4528.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
      const actual = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.();
        document.getElementById('f_statusPts').value = '1.0'; document.getElementById('f_honorPts').value = '5.0';
        for (const n of ['Wary', 'Precise Memory', 'Imperial Scribe', 'Sacrosanct']) {
          const lib = T.ADV_LIBRARY.find(x => x.name === n);
          document.getElementById('advList').appendChild(T.makeEntry({name:n, cost:lib.cost, desc:lib.desc}, true));
        }
        T.recalcAll();
        const texts = [...document.querySelectorAll('#advList .entry')].map(d => d.querySelector('.sit4528-row')?.textContent || '');
        const ctx = T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Investigation', traitName:'Perception', skillRank:2, sit4528:'ambush'});
        const tick = !!T.RD4515 && T.RD4515.offered(ctx).some(o => o.key === 'situational-entries:wary');
        const direct = T.getPreRollModifiers(ctx).some(m => m.label === 'Wary' && m.rolledDelta === 1 && m.keptDelta === 1);
        const opt = name => [...document.getElementById('advQuickAdd').options].find(o => o.value === name);
        const scribe = T.RD4515 ? T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier', traitName:'Awareness', skillRank:3}))
          .filter(o => o.label.startsWith('Imperial Scribe')).length : 0;
        return {seam:!!T.SIT4528, buttons:texts[0] === 'Spot ambush' && texts[1] === 'Recall',
          ambush:tick ? 'tick' : direct ? 'direct' : 'none', greyed:!!opt('Imperial Scribe')?.disabled && !!opt('Sacrosanct')?.disabled,
          notes:/^Not in effect: needs Status 2\.0\+/.test(texts[2]) && /^Not in effect: needs Honor 6\.0\+/.test(texts[3]), withheld:scribe === 0};
      });
      check(variant.id + '-SEAM', actual.seam);
      check(variant.id + '-BUTTONS', actual.buttons, variant.buttons);
      check(variant.id + '-AMBUSH', actual.ambush, variant.ambush);
      check(variant.id + '-PICKER-GREYED', actual.greyed, variant.greyed);
      check(variant.id + '-ROW-NOTES', actual.notes, variant.notes);
      check(variant.id + '-SCRIBE-WITHHELD', actual.withheld, variant.withheld);
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
