/* Dependency boundaries for Phase 4.5.27 Situational Roll Entries (Part I). Each variant switches
 * off or drops one thing this release relies on, in a copy of the built page, and checks the
 * declared behaviour: the registry (Feature 4.5.15) carries the nine declarations; Feature 4.52's
 * Disadvantage configuration supplies Failure of Bushido (Honor); the Advantage configuration
 * switches gate every roll effect. Expected values come from the release's declared dependencies.
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
// offers: Wary offered on Investigation / Perception; raise: Imperial Scribe's Free Raise line on
// Calligraphy; honor: Balance hidden while Failure of Bushido is the Honor tenet.
const variants = [
  {id:'CONTROL', offers:true, raise:true, honor:true},
  {id:'REGISTRY-OFF', off:'ROLL_DECLARATIONS_ENABLED', offers:false, raise:true, honor:false},
  {id:'REGISTRY-ABSENT', drop:'209.927-feat-roll-declarations.js', offers:false, raise:true, honor:false},
  {id:'DISADV-CONFIG-OFF', off:'DISADV_CONFIG_ENABLED', offers:true, raise:true, honor:false},
  {id:'ROLL-EFFECTS-OFF', off:'ADV_CONFIG_ROLL_EFFECTS_ENABLED', offers:false, raise:false, honor:false},
  {id:'ADV-CONFIG-OFF', off:'ADV_CONFIG_ENABLED', offers:false, raise:false, honor:false},
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
      await page.route('**/*', r => r.request().url().startsWith('http://sit4527.test/') ?
        r.fulfill({contentType:'text/html', body:html}) : r.abort());
      await page.goto('http://sit4527.test/');
      await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
      const actual = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.();
        const add = (name, list, config) => { const row = T.makeEntry({name, cost:0, desc:''}, true);
          document.getElementById(list).appendChild(row); if (config) row.dataset.advConfig = JSON.stringify(config); };
        for (const n of ['Wary', 'Imperial Scribe', 'Balance']) add(n, 'advList');
        add('Failure of Bushido', 'disadvList', {type:'tenetPick', tenet:'Honor', value:'Honor'});
        T.recalcAll();
        const ctx = (kind, extra) => T.makeRollContext(T.ROLL_KINDS[kind], extra);
        const names = c => T.RD4515 ? T.RD4515.offered(c).filter(o => o.provider === 'situational-entries').map(o => o.label.split(':')[0]) : [];
        const offers = names(ctx('SKILL', {skillName:'Investigation', traitName:'Perception', skillRank:2})).includes('Wary');
        const raise = T.getPreRollModifiers(ctx('SKILL', {skillName:'Calligraphy', traitName:'Intelligence', skillRank:4}))
          .some(m => m.label === 'Imperial Scribe' && m.informational && m.display === 'Free Raise available');
        const balanceShown = names(ctx('TRAIT', {traitName:'Willpower'})).includes('Balance');
        return {seam:!!T.SIT4527, offers, raise, honor:!balanceShown && offers};
      });
      check(variant.id + '-SEAM', actual.seam);
      check(variant.id + '-OFFERS', actual.offers, variant.offers);
      check(variant.id + '-FREE-RAISE', actual.raise, variant.raise);
      check(variant.id + '-BALANCE-HONOR-BAR', actual.honor, variant.honor);
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
