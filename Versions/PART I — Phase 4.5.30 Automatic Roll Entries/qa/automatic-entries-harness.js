/* Real-browser acceptance tests for Phase 4.5.30 Automatic Roll Entries (Part I).
 * Every expected value comes from the books and the owner's rulings of 7 October 2026, never from
 * AUTO4530 itself:
 *   Silent (Core p.154) +1k0 on Stealth. Prodigy (p.152) +1k0 on School Skill rolls -- the Skills of
 *   any School the character has, attacks with them included. Voice (p.155) +1k1 on Perform: Song,
 *   Oratory and Storytelling. Bad Eyesight (p.156) -1k1 on ranged attacks and Perception-based
 *   rolls, once if both. Disturbing Countenance (p.159) TN +5 on Social Skill rolls, and Anachronism
 *   (Imperial Histories p.240) TN +5 on Artisan, Craft and Social Skill rolls -- both reported as -5
 *   to the total. Social Skills are the seven whose sub-type is Social (Core pp.135-145). Never on
 *   damage; only rows on the entry's own list count; the same entry twice applies once.
 * node automatic-entries-harness.js <sheet.html>
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
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id + '-EXCEPTION', String(error.stack || error), 'no exception'); }
}
const SIX = ['Silent', 'Prodigy', 'Voice', 'Bad Eyesight', 'Disturbing Countenance', 'Anachronism'];
const LIST = {'Silent':'advList', 'Prodigy':'advList', 'Voice':'advList', 'Bad Eyesight':'disadvList',
  'Disturbing Countenance':'disadvList', 'Anachronism':'disadvList'};
// The book's effect of each, as [rolled, kept, total].
const EFFECT = {'Silent':[1, 0, 0], 'Prodigy':[1, 0, 0], 'Voice':[1, 1, 0], 'Bad Eyesight':[-1, -1, 0],
  'Disturbing Countenance':[0, 0, -5], 'Anachronism':[0, 0, -5]};

async function setup(page, entries = [], {school = null, schoolRow = null, wrongList = false} = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(({entries, LIST, school, schoolRow, wrongList}) => {
    document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); T.saveSchoolsList?.([]);
    for (const id of ['trait_agility', 'trait_awareness', 'trait_perception', 'trait_reflexes', 'trait_intelligence']) document.getElementById(id).value = 3;
    if (school) T.saveSchoolsList([{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}]);
    if (schoolRow) document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:schoolRow, trait:'Intelligence', rank:1, school:true}));
    for (const name of entries) {
      const list = wrongList ? (LIST[name] === 'advList' ? 'disadvList' : 'advList') : LIST[name];
      const lib = [...T.ADV_LIBRARY, ...T.DISADV_LIBRARY].find(x => x.name === name);
      document.getElementById(list).appendChild(T.makeEntry({name, cost:lib ? lib.cost : 0, desc:lib ? lib.desc : ''}, true));
    }
    T.recalcAll();
  }, {entries, LIST, school, schoolRow, wrongList});
}
// The modifiers the six entries put on one roll: [label, rolled, kept, total].
const mods = (page, kind, ctx) => page.evaluate(({kind, ctx, SIX}) => { const T = window.__L5R_TEST__;
  const c = Object.assign({}, ctx);
  if (c.weapon) { c.weaponEntry = T.WEAPON_LIBRARY.find(w => w.name === c.weapon); delete c.weapon; }
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], c)).filter(m => SIX.includes(m.label))
    .map(m => [m.label, m.rolledDelta || 0, m.keptDelta || 0, m.totalDelta || 0]); }, {kind, ctx, SIX});
const fx = name => [name, ...EFFECT[name]];

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({viewport:{width:375, height:812}});
    page.setDefaultTimeout(8000);
    page.on('pageerror', e => errors.push(String(e)));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() &&
      (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
    await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
    // A ranged and a melee weapon from the sheet's own library, by its own ranged test.
    const weapons = await page.evaluate(() => { const T = window.__L5R_TEST__;
      return {ranged:T.WEAPON_LIBRARY.find(w => T.isRangedWeapon(w)).name, melee:T.WEAPON_LIBRARY.find(w => !T.isRangedWeapon(w) && w.skill === 'Kenjutsu').name}; });
    // A School with at least two named Skills, one of them a weapon Skill if possible.
    const school = await page.evaluate(() => { const T = window.__L5R_TEST__;
      const name = ['Kakita Bushi', 'Akodo Bushi', 'Hida Bushi', 'Mirumoto Bushi', 'Bayushi Bushi']
        .find(n => T.schoolConcreteSkillNames(n).includes('Kenjutsu') && T.schoolConcreteSkillNames(n).length >= 3);
      return {name, skills:T.schoolConcreteSkillNames(name)}; });
    const notSchool = ['Stealth', 'Sincerity', 'Animal Handling', 'Temptation'].find(s => !school.skills.includes(s));

    await section('AE-START', async () => {
      check('AE-SEAM', await page.evaluate(() => window.__L5R_TEST__.AUTOMATIC_ENTRIES_ENABLED === true && !!window.__L5R_TEST__.AUTO4530));
      check('AE-REGISTRY-STILL-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('AE-CATALOGUE', await page.evaluate(LIST => { const T = window.__L5R_TEST__;
        return Object.entries(LIST).map(([n, l]) => (l === 'advList' ? T.ADV_LIBRARY : T.DISADV_LIBRARY).some(e => e.name === n)); }, LIST), SIX.map(() => true));
    });

    await section('AE-NONE', async () => {
      await setup(page, [], {school:school.name});
      const probes = [['SKILL', {skillName:'Stealth', traitName:'Agility', skillRank:2}], ['SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:2}],
        ['SKILL', {skillName:'Perform: Song', traitName:'Awareness', skillRank:2}], ['TRAIT', {traitName:'Perception'}],
        ['ATTACK', {skillName:'Kyujutsu', traitName:'Reflexes', weapon:weapons.ranged}], ['SKILL', {skillName:school.skills[0], traitName:'Agility', skillRank:2}]];
      const any = [];
      for (const [k, c] of probes) any.push((await mods(page, k, c)).length);
      check('AE-NOTHING-WITHOUT-ENTRIES', any, probes.map(() => 0));
    });

    await section('AE-SILENT', async () => {
      await setup(page, ['Silent']);
      check('AE-SILENT-STEALTH', await mods(page, 'SKILL', {skillName:'Stealth', traitName:'Agility', skillRank:2}), [fx('Silent')]);
      check('AE-SILENT-STEALTH-EMPHASIS-NAME', await mods(page, 'SKILL', {skillName:'Stealth (Sneaking)', traitName:'Agility', skillRank:2}), [fx('Silent')]);
      check('AE-SILENT-NOT-OTHER-SKILL', await mods(page, 'SKILL', {skillName:'Athletics', traitName:'Strength', skillRank:2}), []);
      check('AE-SILENT-NOT-DAMAGE', await mods(page, 'DAMAGE', {skillName:'Stealth'}), []);
    });

    await section('AE-PRODIGY', async () => {
      await setup(page, ['Prodigy'], {school:school.name});
      const own = [];
      for (const s of school.skills) own.push((await mods(page, 'SKILL', {skillName:s, traitName:'Agility', skillRank:2})).length === 1);
      check('AE-PRODIGY-EVERY-SCHOOL-SKILL', own, school.skills.map(() => true));
      check('AE-PRODIGY-ATTACK-WITH-SCHOOL-SKILL', await mods(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility', weapon:weapons.melee}), [fx('Prodigy')]);
      check('AE-PRODIGY-NOT-OTHER-SKILL', await mods(page, 'SKILL', {skillName:notSchool, traitName:'Awareness', skillRank:2}), []);
      check('AE-PRODIGY-NOT-DAMAGE', await mods(page, 'DAMAGE', {skillName:'Kenjutsu'}), []);
      await setup(page, ['Prodigy'], {schoolRow:'Lore: Theology'});
      check('AE-PRODIGY-TICKED-SCHOOL-ROW', [await mods(page, 'SKILL', {skillName:'Lore: Theology', traitName:'Intelligence', skillRank:1}),
        await mods(page, 'SKILL', {skillName:'Lore: History', traitName:'Intelligence', skillRank:1})], [[fx('Prodigy')], []]);
      await setup(page, ['Prodigy']);
      check('AE-PRODIGY-NO-SCHOOL-NOTHING', await mods(page, 'SKILL', {skillName:'Kenjutsu', traitName:'Agility', skillRank:2}), []);
    });

    await section('AE-VOICE', async () => {
      await setup(page, ['Voice']);
      const kinds = [];
      for (const s of ['Perform: Song', 'Perform: Oratory', 'Perform: Storytelling', 'Perform (Song)', 'perform: oratory'])
        kinds.push(await mods(page, 'SKILL', {skillName:s, traitName:'Awareness', skillRank:2}));
      check('AE-VOICE-SONG-ORATORY-STORYTELLING', kinds, kinds.map(() => [fx('Voice')]));
      check('AE-VOICE-NOT-OTHER-PERFORM', [await mods(page, 'SKILL', {skillName:'Perform: Dance', traitName:'Agility', skillRank:2}),
        await mods(page, 'SKILL', {skillName:'Perform', traitName:'Awareness', skillRank:2}),
        await mods(page, 'SKILL', {skillName:'Acting', traitName:'Awareness', skillRank:2})], [[], [], []]);
    });

    await section('AE-BAD-EYESIGHT', async () => {
      await setup(page, ['Bad Eyesight']);
      check('AE-EYESIGHT-RANGED-ATTACK', await mods(page, 'ATTACK', {skillName:'Kyujutsu', traitName:'Reflexes', weapon:weapons.ranged}), [fx('Bad Eyesight')]);
      check('AE-EYESIGHT-NOT-MELEE', await mods(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility', weapon:weapons.melee}), []);
      check('AE-EYESIGHT-PERCEPTION-TRAIT', await mods(page, 'TRAIT', {traitName:'Perception'}), [fx('Bad Eyesight')]);
      check('AE-EYESIGHT-PERCEPTION-SKILL', await mods(page, 'SKILL', {skillName:'Investigation', traitName:'Perception', skillRank:2}), [fx('Bad Eyesight')]);
      check('AE-EYESIGHT-SPOT-AMBUSH', await mods(page, 'SKILL', {skillName:'Investigation', traitName:'Perception', skillRank:2, sit4528:'ambush'}), [fx('Bad Eyesight')]);
      check('AE-EYESIGHT-NOT-OTHER-TRAIT', await mods(page, 'SKILL', {skillName:'Investigation', traitName:'Awareness', skillRank:2}), []);
      check('AE-EYESIGHT-RANGED-PERCEPTION-ONCE', await mods(page, 'ATTACK', {skillName:'Kyujutsu', traitName:'Perception', weapon:weapons.ranged}), [fx('Bad Eyesight')]);
      check('AE-EYESIGHT-NOT-DAMAGE', await mods(page, 'DAMAGE', {skillName:'Kyujutsu', weapon:weapons.ranged}), []);
    });

    await section('AE-TN', async () => {
      await setup(page, ['Disturbing Countenance']);
      const social = [];
      for (const s of ['Acting', 'Courtier', 'Etiquette', 'Perform: Song', 'Sincerity', 'Intimidation', 'Temptation'])
        social.push(await mods(page, 'SKILL', {skillName:s, traitName:'Awareness', skillRank:2}));
      check('AE-COUNTENANCE-SEVEN-SOCIAL', social, social.map(() => [fx('Disturbing Countenance')]));
      check('AE-COUNTENANCE-NOT-ARTISAN', await mods(page, 'SKILL', {skillName:'Artisan: Origami', traitName:'Awareness', skillRank:2}), []);
      await setup(page, ['Anachronism']);
      const covered = [];
      for (const s of ['Courtier', 'Artisan: Origami', 'Craft: Brewing', 'Temptation'])
        covered.push(await mods(page, 'SKILL', {skillName:s, traitName:'Awareness', skillRank:2}));
      check('AE-ANACHRONISM-ARTISAN-CRAFT-SOCIAL', covered, covered.map(() => [fx('Anachronism')]));
      check('AE-ANACHRONISM-NOT-OTHER', await mods(page, 'SKILL', {skillName:'Stealth', traitName:'Agility', skillRank:2}), []);
      check('AE-TN-NOTE-SAYS-TN', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier', traitName:'Awareness', skillRank:2}))
          .filter(m => m.label === 'Anachronism').map(m => /\(TN \+5\)/.test(m.note) && /Imperial Histories p\.240/.test(m.note)); }), [true]);
    });

    await section('AE-OWNERSHIP', async () => {
      await setup(page, SIX, {wrongList:true, school:school.name});
      const probes = [['SKILL', {skillName:'Stealth', traitName:'Agility', skillRank:2}], ['SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:2}],
        ['SKILL', {skillName:'Perform: Song', traitName:'Awareness', skillRank:2}], ['TRAIT', {traitName:'Perception'}]];
      const wrong = [];
      for (const [k, c] of probes) wrong.push((await mods(page, k, c)).length);
      check('AE-WRONG-LIST-DOES-NOT-COUNT', wrong, probes.map(() => 0));
      await setup(page, ['Silent', 'Silent']);
      check('AE-DUPLICATE-APPLIES-ONCE', await mods(page, 'SKILL', {skillName:'Stealth', traitName:'Agility', skillRank:2}), [fx('Silent')]);
      await setup(page, ['Disturbing Countenance', 'Anachronism', 'Voice']);
      check('AE-DIFFERENT-ENTRIES-STACK', await mods(page, 'SKILL', {skillName:'Perform: Song', traitName:'Awareness', skillRank:2}),
        [fx('Voice'), fx('Disturbing Countenance'), fx('Anachronism')]);
      await page.evaluate(() => { document.querySelectorAll('#advList .en-name, #disadvList .en-name').forEach(e => { e.value = e.value + ' (old)'; });
        window.__L5R_TEST__.recalcAll(); });
      check('AE-RENAMED-DOES-NOT-COUNT', await mods(page, 'SKILL', {skillName:'Perform: Song', traitName:'Awareness', skillRank:2}), []);
    });

    await section('AE-DICE', async () => {
      // Real dice through the pipeline: Agility 3 + Stealth 2 = 5k3; Silent makes it 6k3.
      await setup(page, ['Silent', 'Disturbing Countenance']);
      const roll = (ctx, base) => page.evaluate(({ctx, base}) => { const T = window.__L5R_TEST__; let i = 0; const seq = [6, 4, 7, 3, 5, 2, 8, 1];
        Math.random = () => ((seq[i++ % seq.length] - 0.5) / 10);
        return T.rollWithModifiers('Probe', T.makeRollContext(T.ROLL_KINDS.SKILL, ctx), base[0], base[1], {skipPreview:true}).then(() => ({
          dice:document.querySelectorAll('#rollDiceRow .roll-die').length, kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
          total:+document.getElementById('rollTotalDisplay').textContent, body:document.getElementById('rollModalBody').textContent})); }, {ctx, base});
      let r = await roll({skillName:'Stealth', traitName:'Agility', skillRank:2}, [5, 3]);
      await page.keyboard.press('Escape');
      check('AE-DICE-SILENT', [r.dice, r.kept, /Silent/.test(r.body)], [6, 3, true]);
      r = await roll({skillName:'Courtier', traitName:'Awareness', skillRank:2}, [5, 3]);
      await page.keyboard.press('Escape');
      check('AE-DICE-COUNTENANCE-TOTAL', [r.dice, r.kept, r.total], [5, 3, 7 + 6 + 5 - 5]);
      // Through the Skills table's own roll button.
      await page.evaluate(() => { const T = window.__L5R_TEST__;
        document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Stealth', trait:'Agility', rank:2})); T.recalcAll();
        [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name').value === 'Stealth').querySelector('.sk-roll').click(); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      check('AE-ROUTE-SKILL-TABLE', [await page.locator('.rp-pool-final').textContent(), /Silent/.test(await page.locator('#rollPreviewBody').textContent())], ['6k3', true]);
      await page.locator('#rollPreviewCancel').click();
    });

    await section('AE-ANACHRONISM-ROW', async () => {
      await setup(page, ['Anachronism', 'Silent']);
      const line = () => page.evaluate(() => [...document.querySelectorAll('#advList .entry, #disadvList .entry')]
        .map(d => [d.querySelector('.en-name').value, d.querySelector('.auto4530-note')?.textContent || null]));
      check('AE-ROW-ANACHRONISM-ONLY', await line(), [['Silent', null],
        ['Anachronism', 'Only returned spirits may take this. The sheet cannot check that: it is up to you and your GM.']]);
      await page.evaluate(() => { const n = [...document.querySelectorAll('#disadvList .en-name')].find(e => e.value === 'Anachronism');
        n.value = 'Anachronisms'; n.dispatchEvent(new Event('input', {bubbles:true})); });
      check('AE-ROW-RENAMED-LOSES-LINE', (await line())[1][1], null);
      check('AE-NOTHING-SAVED', await page.evaluate(() => /auto4530|returned spirits may take/.test(JSON.stringify(window.__L5R_TEST__.collectData()))), false);
      await page.setViewportSize({width:320, height:900});
      await setup(page, ['Anachronism']);
      await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; const pages = [...document.querySelectorAll('[data-car-slug]')];
        C.goToTab(pages.findIndex(p => p.contains(document.getElementById('advList')))); await C.whenSettled(); });
      check('AE-ROW-LAYOUT-320', await page.evaluate(() => { const n = document.querySelector('.auto4530-note'), e = n.closest('.entry').getBoundingClientRect(), r = n.getBoundingClientRect();
        return [r.width > 0 && r.left >= e.left - 1 && r.right <= e.right + 1, n.scrollWidth <= n.clientWidth + 1, getComputedStyle(n).fontSize !== getComputedStyle(n.closest('.entry')).fontSize]; }), [true, true, true]);
      await page.setViewportSize({width:375, height:812});
    });
  } finally {
    check('AE-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('AE-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
