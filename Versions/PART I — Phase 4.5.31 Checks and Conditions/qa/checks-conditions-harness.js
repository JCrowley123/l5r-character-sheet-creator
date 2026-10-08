/* Real-browser acceptance tests for Phase 4.5.31 Checks and Conditions (Part I).
 * Every expected value comes from the Core Rulebook and the owner's rulings of 8 October 2026, never
 * from CHK4531 itself:
 *   Checks: Brash (p.157) Willpower TN 25 adding the Honor Rank, unless Failure of Bushido is the Honor
 *   tenet; Can't Lie (p.157) Willpower TN 20; Contrary (p.158) Willpower against the TN the GM sets;
 *   Epilepsy (p.159) Willpower TN 15 to avoid a seizure, TN 10 to end one; Overconfident (p.161)
 *   Perception TN 20; Rumormonger (p.161) Willpower TN 5 x the Glory Rank; Soft-Hearted (p.162)
 *   Willpower TN 20 to kill.
 *   Ticks (unticked, the player decides): Lame (p.160) TN +10 on Agility rolls; Missing Limb (p.161)
 *   TN +10 on any roll needing the limb; Disbeliever (p.158) TN +5 on the seven Social Skill rolls.
 *   Switches: Lost Love (p.160) TN +5 on every roll until a Void Point is spent; Soft-Hearted guilt
 *   TN +10. Always on: Blind (p.156) -3k3 ranged and -1k1 melee attacks, Armor TN base Reflexes + 5.
 *   Ishiken-Do (p.151): Shugenja only; Void spells need it to be learned or cast (owner's ruling),
 *   reported never blocked, scrolls untouched.
 *   TN +N is reported as -N to the total (Doubt's convention). Never on damage; initiative has no TN.
 * node checks-conditions-harness.js <sheet.html>
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
const DISADV = ['Brash', 'Can’t Lie', 'Contrary', 'Epilepsy', 'Overconfident', 'Rumormonger', 'Soft-Hearted', 'Lame',
  'Missing Limb', 'Disbeliever', 'Lost Love', 'Blind'];
const ALL = [...DISADV, 'Ishiken-Do'];
const LIST = name => name === 'Ishiken-Do' ? 'advList' : 'disadvList';
const LABELS = ['Brash', 'Brash: Honor Rank', 'Lost Love', 'Soft-Hearted', 'Blind', 'Lame', 'Missing Limb', 'Disbeliever'];
const SOCIAL = ['Acting', 'Courtier', 'Etiquette', 'Perform: Song', 'Sincerity', 'Intimidation', 'Temptation'];

async function setup(page, entries = [], {school = null, wrongList = false, configs = {}, traits = {}} = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(({entries, school, wrongList, configs, traits}) => {
    document.querySelectorAll('.roll-modal-overlay, #universalSpellPickModalOverlay, #castWhyModalOverlay, #appConfirmOverlay')
      .forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); T.saveSchoolsList?.([]);
    document.getElementById('f_school').value = '';
    const base = {trait_agility:3, trait_awareness:3, trait_perception:2, trait_reflexes:3, trait_intelligence:3, trait_willpower:3};
    for (const [id, v] of Object.entries(Object.assign(base, traits))) document.getElementById(id).value = v;
    document.getElementById('f_honorRank').value = 2; document.getElementById('f_honorPts').value = '2.5';
    if (school) { T.saveSchoolsList([{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}]); document.getElementById('f_school').value = school; }
    for (const name of entries) {
      const own = name === 'Ishiken-Do' ? 'advList' : 'disadvList';
      const list = wrongList ? (own === 'advList' ? 'disadvList' : 'advList') : own;
      const lib = [...T.ADV_LIBRARY, ...T.DISADV_LIBRARY].find(x => x.name === name);
      const row = T.makeEntry({name, cost:lib ? lib.cost : 0, desc:lib ? lib.desc : ''}, true);
      document.getElementById(list).appendChild(row);
      if (configs[name]) row.dataset.advConfig = JSON.stringify(configs[name]);
    }
    T.recalcAll();
  }, {entries, school, wrongList, configs, traits});
}
const ctxOf = (T, kind, c) => { c = Object.assign({}, c); if (c.weapon) { c.weaponEntry = T.WEAPON_LIBRARY.find(w => w.name === c.weapon); delete c.weapon; } return T.makeRollContext(T.ROLL_KINDS[kind], c); };
// This release's automatic modifiers on one roll: [label, rolled, kept, total] (informational: [label, 'info', display]).
const mods = (page, kind, ctx) => page.evaluate(({kind, ctx, LABELS}) => { const T = window.__L5R_TEST__;
  const c = Object.assign({}, ctx); if (c.weapon) { c.weaponEntry = T.WEAPON_LIBRARY.find(w => w.name === c.weapon); delete c.weapon; }
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], c)).filter(m => LABELS.includes(m.label))
    .map(m => m.informational ? [m.label, 'info', m.display] : [m.label, m.rolledDelta || 0, m.keptDelta || 0, m.totalDelta || 0]); }, {kind, ctx, LABELS});
// The ticks this release offers on one roll: [label].
const ticks = (page, kind, ctx) => page.evaluate(({kind, ctx}) => { const T = window.__L5R_TEST__;
  const c = Object.assign({}, ctx); if (c.weapon) { c.weaponEntry = T.WEAPON_LIBRARY.find(w => w.name === c.weapon); delete c.weapon; }
  return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[kind], c)).filter(o => o.provider === 'checks-conditions').map(o => o.label); }, {kind, ctx});
// Arm every offered tick of this release and read what reaches the dice.
const armed = (page, kind, ctx) => page.evaluate(({kind, ctx}) => { const T = window.__L5R_TEST__;
  const c = T.makeRollContext(T.ROLL_KINDS[kind], Object.assign({}, ctx));
  T.RD4515.start(c); T.RD4515.offered(c).filter(o => o.provider === 'checks-conditions').forEach(o => T.RD4515.toggle(o.key, true));
  const out = T.getPreRollModifiers(c).filter(m => ['Lame', 'Missing Limb', 'Disbeliever'].includes(m.label)).map(m => [m.label, m.rolledDelta || 0, m.keptDelta || 0, m.totalDelta || 0]);
  T.RD4515.cancel(); return out; }, {kind, ctx});
const rowOf = (page, name) => page.evaluate(name => {
  const div = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(d => d.querySelector('.en-name').value === name);
  const row = div && div.querySelector('.chk4531-row');
  return row ? {buttons:[...row.querySelectorAll('button')].map(b => b.textContent), switches:[...row.querySelectorAll('.chk4531-switch')].map(s => [s.textContent, s.querySelector('input').checked]),
    boxes:[...row.querySelectorAll('.chk4531-input')].map(i => i.value), notes:[...row.querySelectorAll('.chk4531-note')].map(n => n.textContent),
    limb:row.querySelector('.chk4531-limb') ? row.querySelector('.chk4531-limb').value : null} : null; }, name);
async function press(page, name, text) {
  await page.evaluate(({name, text}) => {
    const div = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(d => d.querySelector('.en-name').value === name);
    const b = div && [...div.querySelectorAll('.chk4531-row button')].find(x => x.textContent === text);
    if (!b) throw Error('No ' + text + ' button on ' + name); b.click(); }, {name, text});
}
const dice = (page, faces) => page.evaluate(faces => { let i = 0; Math.random = () => ((faces[i++ % faces.length] - 0.5) / 10); }, faces);
async function rollCheck(page, name, text) {
  await press(page, name, text);
  await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
  const pool = await page.locator('.rp-pool-final').textContent();
  await page.locator('#rollPreviewGo').click();
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => ({title:document.getElementById('rollModalTitle').textContent,
    dice:document.querySelectorAll('#rollDiceRow .roll-die').length, kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
    total:+document.getElementById('rollTotalDisplay').textContent, note:document.getElementById('rollResultNote').textContent,
    body:document.getElementById('rollModalBody').textContent}));
  await page.keyboard.press('Escape');
  return Object.assign({pool}, r);
}
const alertText = page => page.evaluate(() => { const o = document.getElementById('appConfirmOverlay');
  const t = o && o.style.display === 'flex' ? document.getElementById('appConfirmMsg').textContent : null;
  if (o) o.style.display = 'none'; return t; });
const previewOpen = page => page.evaluate(() => !!document.querySelector('#rollPreviewGo')?.offsetParent);

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
    const weapons = await page.evaluate(() => { const T = window.__L5R_TEST__;
      return {ranged:T.WEAPON_LIBRARY.find(w => T.isRangedWeapon(w)).name, melee:T.WEAPON_LIBRARY.find(w => !T.isRangedWeapon(w) && w.skill === 'Kenjutsu').name}; });

    await section('CK-START', async () => {
      check('CK-SEAM', await page.evaluate(() => window.__L5R_TEST__.CHECKS_CONDITIONS_ENABLED === true && !!window.__L5R_TEST__.CHK4531));
      check('CK-REGISTRY-STILL-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('CK-CATALOGUE', await page.evaluate(ALL => { const T = window.__L5R_TEST__;
        return ALL.map(n => (n === 'Ishiken-Do' ? T.ADV_LIBRARY : T.DISADV_LIBRARY).some(e => e.name === n)); }, ALL), ALL.map(() => true));
      check('CK-TICK-PROVIDER-REGISTERED', await page.evaluate(() => window.__L5R_TEST__.RD4515.providerIds().includes('checks-conditions')));
    });

    await section('CK-NONE', async () => {
      await setup(page, []);
      const probes = [['SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:2}], ['TRAIT', {traitName:'Agility'}],
        ['TRAIT', {traitName:'Perception'}], ['ATTACK', {skillName:'Kyujutsu', traitName:'Reflexes', weapon:weapons.ranged}],
        ['ATTACK', {skillName:'Kenjutsu', traitName:'Agility', weapon:weapons.melee}], ['TRAIT', {traitName:'Willpower', chk4531:'brash'}]];
      const any = [];
      for (const [k, c] of probes) any.push((await mods(page, k, c)).length + (await ticks(page, k, c)).length);
      check('CK-NOTHING-WITHOUT-ENTRIES', any, probes.map(() => 0));
      check('CK-NO-ROWS-WITHOUT-ENTRIES', await page.evaluate(() => document.querySelectorAll('.chk4531-row').length), 0);
    });

    await section('CK-ROWS', async () => {
      await setup(page, ALL);
      const rows = {};
      for (const n of ALL) rows[n] = await rowOf(page, n);
      check('CK-ROW-BRASH', [rows['Brash'].buttons, rows['Brash'].notes], [['Check (TN 25)'], ['Adds your Honor Rank.']]);
      check('CK-ROW-CANT-LIE', rows['Can’t Lie'].buttons, ['Check (TN 20)']);
      check('CK-ROW-CONTRARY', [rows['Contrary'].buttons, rows['Contrary'].boxes], [['Check'], ['15']]);
      check('CK-ROW-EPILEPSY', rows['Epilepsy'].buttons, ['Avoid (TN 15)', 'End seizure (TN 10)']);
      check('CK-ROW-OVERCONFIDENT', rows['Overconfident'].buttons, ['Check (TN 20)']);
      check('CK-ROW-RUMORMONGER', [rows['Rumormonger'].buttons, rows['Rumormonger'].boxes], [['Check (TN 5 × Glory)'], ['']]);
      check('CK-ROW-SOFT-HEARTED', [rows['Soft-Hearted'].buttons, rows['Soft-Hearted'].switches], [['Check (TN 20)'], [['Wracked with guilt (TN +10)', false]]]);
      check('CK-ROW-LOST-LOVE', [rows['Lost Love'].buttons, rows['Lost Love'].switches, /twice a day/.test(rows['Lost Love'].notes.join(' '))],
        [['Spend a Void Point'], [['Reminded of your loss (TN +5)', false]], true]);
      check('CK-ROW-MISSING-LIMB', rows['Missing Limb'].limb, '');
      check('CK-ROW-LAME-REMINDS-MOVE', /Water counts as 1/.test(rows['Lame'].notes.join(' ')));
      check('CK-ROW-BLIND-REMINDERS', /Reflexes \+ 5/.test(rows['Blind'].notes[0]) && /Water counts 2 lower/.test(rows['Blind'].notes[0]) &&
        /TN 20/.test(rows['Blind'].notes[0]) && /Perception/.test(rows['Blind'].notes[0]));
      check('CK-ROW-ISHIKEN-NON-SHUGENJA', rows['Ishiken-Do'].notes, ['Not in effect: needs a Shugenja School.']);
      await setup(page, ['Ishiken-Do'], {school:'Isawa Shugenja'});
      check('CK-ROW-ISHIKEN-SHUGENJA-NONE', await rowOf(page, 'Ishiken-Do'), null);
      // Play mode: checks, switches and boxes stay usable; the limb is a purchased choice and locks.
      await setup(page, ['Missing Limb', 'Lost Love', 'Brash']);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
      check('CK-PLAY-MODE', await page.evaluate(() => [
        [...document.querySelectorAll('.chk4531-btn')].every(b => !b.disabled && b.offsetParent !== null),
        [...document.querySelectorAll('.chk4531-toggle')].every(b => !b.disabled),
        document.querySelector('.chk4531-limb').disabled]), [true, true, true]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      check('CK-MANAGE-LIMB-EDITABLE', await page.evaluate(() => document.querySelector('.chk4531-limb').disabled), false);
    });

    await section('CK-CHECKS', async () => {
      await setup(page, DISADV.filter(n => !['Lame', 'Missing Limb', 'Disbeliever', 'Lost Love', 'Blind'].includes(n)));
      // Willpower 3: 3k3. Three 8s = 24.
      await dice(page, [8]);
      let r = await rollCheck(page, 'Brash', 'Check (TN 25)');
      check('CK-BRASH-ROLL', [r.pool, r.title, r.dice, r.kept], ['3k3', 'Brash — Willpower vs TN 25', 3, 3]);
      check('CK-BRASH-ADDS-HONOR-RANK', [r.total, r.note], [24 + 2, 'You keep your temper.']);
      await dice(page, [7]);
      r = await rollCheck(page, 'Brash', 'Check (TN 25)');
      check('CK-BRASH-FAILS-BELOW-TN', [r.total, /attack/.test(r.note)], [21 + 2, true]);
      await setup(page, ['Brash', 'Failure of Bushido'], {configs:{'Failure of Bushido':{type:'tenetPick', tenet:'Honor', value:'Honor'}}});
      await dice(page, [8]);
      r = await rollCheck(page, 'Brash', 'Check (TN 25)');
      check('CK-BRASH-FAILURE-OF-BUSHIDO-HONOR', [r.total, /attack/.test(r.note), /Honor Rank not added/.test(r.body)], [24, true, true]);
      check('CK-BRASH-ROW-SAYS-NOT-ADDED', (await rowOf(page, 'Brash')).notes, ['Honor Rank not added: Failure of Bushido (Honor).']);
      await setup(page, ['Can’t Lie', 'Contrary', 'Epilepsy', 'Overconfident', 'Rumormonger', 'Soft-Hearted']);
      await dice(page, [7]);
      r = await rollCheck(page, 'Can’t Lie', 'Check (TN 20)');
      check('CK-CANT-LIE', [r.title, r.total, r.note], ['Can’t Lie — Willpower vs TN 20', 21, 'You let the lie stand.']);
      await page.evaluate(() => { const i = [...document.querySelectorAll('#disadvList .entry')].find(d => d.querySelector('.en-name').value === 'Contrary').querySelector('.chk4531-input');
        i.value = '25'; i.dispatchEvent(new Event('input', {bubbles:true})); });
      r = await rollCheck(page, 'Contrary', 'Check');
      check('CK-CONTRARY-USES-TYPED-TN', [r.title, r.total, /argue/.test(r.note)], ['Contrary — Willpower vs TN 25', 21, true]);
      await page.evaluate(() => { const i = [...document.querySelectorAll('#disadvList .entry')].find(d => d.querySelector('.en-name').value === 'Contrary').querySelector('.chk4531-input');
        i.value = ''; });
      await press(page, 'Contrary', 'Check');
      check('CK-CONTRARY-EMPTY-TN-ASKS', [await alertText(page), await previewOpen(page)], ['Enter TN first.', false]);
      r = await rollCheck(page, 'Epilepsy', 'Avoid (TN 15)');
      check('CK-EPILEPSY-AVOID', [r.title, r.note], ['Epilepsy — Willpower vs TN 15', 'No seizure.']);
      await dice(page, [3]);
      r = await rollCheck(page, 'Epilepsy', 'End seizure (TN 10)');
      check('CK-EPILEPSY-END', [r.title, r.total, r.note], ['Epilepsy — Willpower vs TN 10', 9, 'The seizure goes on.']);
      // Perception 2: 2k2.
      await dice(page, [10, 5, 5]);
      r = await rollCheck(page, 'Overconfident', 'Check (TN 20)');
      // The 10 explodes into the same die: 10 + 5 + 5 = 20, which meets TN 20.
      check('CK-OVERCONFIDENT-PERCEPTION', [r.pool, r.title, r.dice, r.total, r.note], ['2k2', 'Overconfident — Perception vs TN 20', 2, 20, 'You see the danger and may back off.']);
      await press(page, 'Rumormonger', 'Check (TN 5 × Glory)');
      check('CK-RUMORMONGER-EMPTY-ASKS', [await alertText(page), await previewOpen(page)], ['Enter the Glory Rank first.', false]);
      await page.evaluate(() => { const i = [...document.querySelectorAll('#disadvList .entry')].find(d => d.querySelector('.en-name').value === 'Rumormonger').querySelector('.chk4531-input');
        i.value = '4'; i.dispatchEvent(new Event('input', {bubbles:true})); });
      await dice(page, [7]);
      r = await rollCheck(page, 'Rumormonger', 'Check (TN 5 × Glory)');
      check('CK-RUMORMONGER-TN-5X-GLORY', [r.title, r.total, r.note], ['Rumormonger — Willpower vs TN 20', 21, 'You keep it to yourself.']);
      check('CK-BOX-SURVIVES-RECALC', await page.evaluate(() => { window.__L5R_TEST__.recalcAll();
        return [...document.querySelectorAll('#disadvList .entry')].find(d => d.querySelector('.en-name').value === 'Rumormonger').querySelector('.chk4531-input').value; }), '4');
      r = await rollCheck(page, 'Soft-Hearted', 'Check (TN 20)');
      check('CK-SOFT-HEARTED-CHECK', [r.title, /Wracked with guilt/.test(r.note)], ['Soft-Hearted — Willpower vs TN 20', true]);
      await setup(page, ['Brash'], {traits:{trait_willpower:''}});
      await page.evaluate(() => { document.getElementById('trait_willpower').value = '0'; });
      await press(page, 'Brash', 'Check (TN 25)');
      check('CK-CHECK-NEEDS-TRAIT', [await alertText(page), await previewOpen(page)], ['Enter a valid Willpower Rank before making this check.', false]);
    });

    await section('CK-TICKS', async () => {
      await setup(page, ['Lame', 'Missing Limb', 'Disbeliever']);
      check('CK-TICKS-UNTICKED-BY-DEFAULT', await mods(page, 'TRAIT', {traitName:'Agility'}), []);
      check('CK-LAME-AGILITY-ROLLS', [await ticks(page, 'TRAIT', {traitName:'Agility'}), await ticks(page, 'SKILL', {skillName:'Athletics', traitName:'Agility', skillRank:2})].map(t => t.filter(l => /^Lame/.test(l))),
        [['Lame: Uses your legs: TN +10'], ['Lame: Uses your legs: TN +10']]);
      check('CK-LAME-NOT-OTHER-TRAITS', (await ticks(page, 'TRAIT', {traitName:'Strength'})).filter(l => /^Lame/.test(l)), []);
      check('CK-LAME-ARMED-TN-10', (await armed(page, 'TRAIT', {traitName:'Agility'})).filter(m => m[0] === 'Lame'), [['Lame', 0, 0, -10]]);
      check('CK-MISSING-LIMB-EVERY-ROLL', [await ticks(page, 'TRAIT', {traitName:'Strength'}), await ticks(page, 'SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:1}),
        await ticks(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility', weapon:weapons.melee}), await ticks(page, 'SPELL', {traitName:'Willpower'})]
        .map(t => t.filter(l => /^Missing Limb/.test(l)).length), [1, 1, 1, 1]);
      check('CK-MISSING-LIMB-NOT-DAMAGE-OR-INITIATIVE', [await ticks(page, 'DAMAGE', {skillName:'Kenjutsu'}), await ticks(page, 'INITIATIVE', {})], [[], []]);
      check('CK-MISSING-LIMB-UNCHOSEN-LABEL', (await ticks(page, 'TRAIT', {traitName:'Strength'})), ['Missing Limb: Uses your missing limb: TN +10']);
      await page.evaluate(() => { const s = document.querySelector('.chk4531-limb'); s.value = 'Left arm'; s.dispatchEvent(new Event('change', {bubbles:true})); });
      check('CK-MISSING-LIMB-NAMES-THE-LIMB', (await ticks(page, 'TRAIT', {traitName:'Strength'})), ['Missing Limb: Uses your left arm: TN +10']);
      check('CK-MISSING-LIMB-ARMED-TN-10', (await armed(page, 'TRAIT', {traitName:'Strength'})), [['Missing Limb', 0, 0, -10]]);
      const social = [];
      for (const s of SOCIAL) social.push((await ticks(page, 'SKILL', {skillName:s, traitName:'Awareness', skillRank:2})).filter(l => /^Disbeliever/.test(l)));
      check('CK-DISBELIEVER-SEVEN-SOCIAL', social, SOCIAL.map(() => ['Disbeliever: A shugenja or monk is involved: TN +5']));
      check('CK-DISBELIEVER-NOT-OTHER', (await ticks(page, 'SKILL', {skillName:'Lore: Theology', traitName:'Intelligence', skillRank:2})).filter(l => /^Disbeliever/.test(l)), []);
      check('CK-DISBELIEVER-ARMED-TN-5', (await armed(page, 'SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:2})).filter(m => m[0] === 'Disbeliever'), [['Disbeliever', 0, 0, -5]]);
      // Through the real preview: the three boxes, ticked by the player, reach the total.
      await page.evaluate(() => { window.__L5R_TEST__.rollSkill('Courtier', 'Awareness', 2); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      const boxes = await page.evaluate(() => [...document.querySelectorAll('[data-rd4515-key^="checks-conditions:"]')].map(b => [b.closest('.rd4515-opt').textContent, b.checked]));
      check('CK-PREVIEW-BOXES', boxes, [['Missing Limb: Uses your left arm: TN +10', false], ['Disbeliever: A shugenja or monk is involved: TN +5', false]]);
      await page.locator('[data-rd4515-key="checks-conditions:disbeliever"]').check();
      await dice(page, [6]);
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      check('CK-PREVIEW-TICK-REACHES-TOTAL', await page.evaluate(() => [+document.getElementById('rollTotalDisplay').textContent, /Disbeliever/.test(document.getElementById('rollModalBody').textContent)]), [18 - 5, true]);
      await page.keyboard.press('Escape');
    });

    await section('CK-SWITCHES', async () => {
      await page.evaluate(() => { document.getElementById('void_current').value = 2; });
      await setup(page, ['Lost Love', 'Soft-Hearted']);
      check('CK-SWITCHES-OFF-NOTHING', await mods(page, 'TRAIT', {traitName:'Agility'}), []);
      await page.evaluate(() => { const t = [...document.querySelectorAll('.chk4531-toggle')].find(x => x.dataset.chk4531 === 'reminded'); t.click(); });
      const kinds = [];
      for (const [k, c] of [['SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:1}], ['TRAIT', {traitName:'Agility'}], ['ATTACK', {skillName:'Kenjutsu', traitName:'Agility', weapon:weapons.melee}], ['SPELL', {traitName:'Willpower'}]])
        kinds.push(await mods(page, k, c));
      check('CK-LOST-LOVE-EVERY-TN', kinds, kinds.map(() => [['Lost Love', 0, 0, -5]]));
      check('CK-LOST-LOVE-NOT-DAMAGE-INITIATIVE', [await mods(page, 'DAMAGE', {skillName:'Kenjutsu'}), await mods(page, 'INITIATIVE', {})], [[], []]);
      check('CK-LOST-LOVE-SAVED', await page.evaluate(() => window.__L5R_TEST__.collectData().disadv.filter(d => d.name === 'Lost Love').map(d => d.config && d.config.type + ':' + d.config.reminded)), ['chk4531:true']);
      await page.evaluate(() => { document.getElementById('void_current').value = 2; });
      await press(page, 'Lost Love', 'Spend a Void Point');
      check('CK-LOST-LOVE-SPEND-VOID', [await page.evaluate(() => +document.getElementById('void_current').value), (await rowOf(page, 'Lost Love')).switches[0][1],
        await mods(page, 'TRAIT', {traitName:'Agility'})], [1, false, []]);
      await page.evaluate(() => { const t = [...document.querySelectorAll('.chk4531-toggle')].find(x => x.dataset.chk4531 === 'reminded'); t.click(); document.getElementById('void_current').value = 0; });
      await press(page, 'Lost Love', 'Spend a Void Point');
      check('CK-LOST-LOVE-NO-VOID', [await alertText(page), (await rowOf(page, 'Lost Love')).switches[0][1]], ['No Void Points remaining.', true]);
      await page.evaluate(() => { const t = [...document.querySelectorAll('.chk4531-toggle')].find(x => x.dataset.chk4531 === 'guilt'); t.click(); });
      check('CK-SWITCHES-STACK', await mods(page, 'TRAIT', {traitName:'Agility'}), [['Lost Love', 0, 0, -5], ['Soft-Hearted', 0, 0, -10]]);
      // A save and a load keep both switches; the setting is not lost on Phase 4.5's repaint.
      const saved = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await setup(page, []);
      await page.evaluate(saved => { const T = window.__L5R_TEST__; T.applyData(JSON.parse(saved)); T.recalcAll(); T.recalcAll(); }, saved);
      check('CK-SWITCHES-ROUND-TRIP', [(await rowOf(page, 'Lost Love')).switches[0][1], (await rowOf(page, 'Soft-Hearted')).switches[0][1],
        await mods(page, 'TRAIT', {traitName:'Agility'})], [true, true, [['Lost Love', 0, 0, -5], ['Soft-Hearted', 0, 0, -10]]]);
      await setup(page, ['Missing Limb'], {configs:{'Missing Limb':{type:'chk4531', limb:'Right leg'}}});
      check('CK-LIMB-ROUND-TRIP', [(await rowOf(page, 'Missing Limb')).limb, await ticks(page, 'TRAIT', {traitName:'Strength'})], ['Right leg', ['Missing Limb: Uses your right leg: TN +10']]);
      // Renamed: the row, the setting and the effect all go.
      await setup(page, ['Lost Love'], {configs:{'Lost Love':{type:'chk4531', reminded:true}}});
      await page.evaluate(() => { const n = document.querySelector('#disadvList .en-name'); n.value = 'Lost Loves'; n.dispatchEvent(new Event('input', {bubbles:true})); window.__L5R_TEST__.recalcAll(); });
      check('CK-RENAMED-DROPS-SETTING', await page.evaluate(() => [!!document.querySelector('.chk4531-row'), document.querySelector('#disadvList .entry').dataset.advConfig || null]), [false, null]);
      check('CK-RENAMED-NO-EFFECT', await mods(page, 'TRAIT', {traitName:'Agility'}), []);
    });

    await section('CK-BLIND', async () => {
      // The core's own numbers first, with no Blind: Reflexes 3, armor 5.
      await setup(page, []);
      const core = await page.evaluate(() => { document.getElementById('f_armorTN').value = 5; window.__L5R_TEST__.recalcAll();
        return [+document.getElementById('f_baseTN').value, +document.getElementById('f_currentTN').value]; });
      check('CK-BLIND-CORE-BASELINE', core, [3 * 5 + 5, 3 * 5 + 5 + 5]);
      await setup(page, ['Blind']);
      const blind = await page.evaluate(() => { document.getElementById('f_armorTN').value = 5; window.__L5R_TEST__.recalcAll();
        return [+document.getElementById('f_baseTN').value, +document.getElementById('f_currentTN').value, document.getElementById('qaArmorTNValue').textContent]; });
      check('CK-BLIND-ARMOR-TN', blind, [3 + 5, core[1] - core[0] + (3 + 5), String(core[1] - core[0] + 8)]);
      check('CK-BLIND-IDEMPOTENT', await page.evaluate(() => { const T = window.__L5R_TEST__; T.CHK4531.refresh(); T.CHK4531.refresh();
        return [+document.getElementById('f_baseTN').value, +document.getElementById('f_currentTN').value]; }), [8, core[1] - core[0] + 8]);
      check('CK-BLIND-FOLLOWS-REFLEXES', await page.evaluate(() => { const r = document.getElementById('trait_reflexes'); r.value = 4;
        r.dispatchEvent(new Event('input', {bubbles:true})); window.__L5R_TEST__.recalcAll(); return [+document.getElementById('f_baseTN').value, +document.getElementById('f_currentTN').value]; }), [9, 9 + 5]);
      await page.evaluate(() => { const n = document.querySelector('#disadvList .en-name'); n.value = 'Blindness'; n.dispatchEvent(new Event('input', {bubbles:true})); window.__L5R_TEST__.recalcAll(); });
      check('CK-BLIND-REMOVED-CORE-BACK', await page.evaluate(() => [+document.getElementById('f_baseTN').value, +document.getElementById('f_currentTN').value]), [4 * 5 + 5, 4 * 5 + 5 + 5]);
      await setup(page, ['Blind']);
      check('CK-BLIND-RANGED', await mods(page, 'ATTACK', {skillName:'Kyujutsu', traitName:'Reflexes', weapon:weapons.ranged}), [['Blind', -3, -3, 0]]);
      check('CK-BLIND-MELEE', await mods(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility', weapon:weapons.melee}), [['Blind', -1, -1, 0]]);
      check('CK-BLIND-UNARMED-IS-MELEE', await mods(page, 'ATTACK', {skillName:'Jiujutsu', traitName:'Agility'}), [['Blind', -1, -1, 0]]);
      check('CK-BLIND-NOT-DAMAGE', await mods(page, 'DAMAGE', {skillName:'Kyujutsu', weapon:weapons.ranged}), []);
      check('CK-BLIND-PERCEPTION-INFO', await mods(page, 'TRAIT', {traitName:'Perception'}), [['Blind', 'info', 'other senses only']]);
      check('CK-BLIND-NOT-OTHER-ROLLS', await mods(page, 'SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:1}), []);
    });

    await section('CK-OWNERSHIP', async () => {
      await setup(page, ALL, {wrongList:true, configs:{'Lost Love':{type:'chk4531', reminded:true}}});
      check('CK-WRONG-LIST-NO-ROWS', await page.evaluate(() => document.querySelectorAll('.chk4531-row').length), 0);
      check('CK-WRONG-LIST-NO-EFFECT', [await mods(page, 'TRAIT', {traitName:'Agility'}), await ticks(page, 'TRAIT', {traitName:'Agility'}),
        await mods(page, 'ATTACK', {skillName:'Kyujutsu', traitName:'Reflexes', weapon:weapons.ranged})], [[], [], []]);
      await setup(page, ['Blind', 'Blind', 'Lame', 'Lame']);
      check('CK-DUPLICATE-ONCE', [await mods(page, 'ATTACK', {skillName:'Kyujutsu', traitName:'Reflexes', weapon:weapons.ranged}), await ticks(page, 'TRAIT', {traitName:'Agility'})],
        [[['Blind', -3, -3, 0]], ['Lame: Uses your legs: TN +10']]);
      check('CK-DUPLICATE-BLIND-ARMOR-ONCE', await page.evaluate(() => +document.getElementById('f_baseTN').value), 8);
      check('CK-NOTHING-ELSE-SAVED', await page.evaluate(() => /chk4531/.test(JSON.stringify(window.__L5R_TEST__.collectData()))), false);
    });

    await section('CK-ISHIKEN', async () => {
      // The Advantage picker: Shugenja only (Feature 4.5.5's standard).
      await setup(page, []);
      const opt = () => page.evaluate(() => { const o = [...document.getElementById('advQuickAdd').options].find(x => x.value === 'Ishiken-Do');
        return [o.disabled, / — Shugenja only$/.test(o.textContent)]; });
      check('CK-ISHIKEN-PICKER-NON-SHUGENJA', await opt(), [true, true]);
      await setup(page, [], {school:'Isawa Shugenja'});
      check('CK-ISHIKEN-PICKER-SHUGENJA', await opt(), [false, false]);
      // The Technique picker lists the same spells either way; without Ishiken-Do the Void ones are greyed with the reason.
      const picker = () => page.evaluate(() => { const T = window.__L5R_TEST__;
        const doc = new DOMParser().parseFromString('<select>' + T.techQuickAddOptionsHTML() + '</select>', 'text/html');
        return [...doc.querySelectorAll('option')].filter(o => /^spell:/.test(o.value)).map(o => { const s = T.SPELL_LIBRARY[+o.value.split(':')[1]];
          return {v:o.value, el:s.element, disabled:o.disabled, gated:/ — needs Ishiken-Do/.test(o.textContent)}; }); });
      const without = await picker();
      await setup(page, ['Ishiken-Do'], {school:'Isawa Shugenja'});
      const withIt = await picker();
      check('CK-PICKER-SAME-SPELLS-LISTED', without.map(o => o.v), withIt.map(o => o.v));
      check('CK-PICKER-VOID-LISTED', without.filter(o => o.el === 'Void').length > 0);
      check('CK-PICKER-VOID-GREYED-WITHOUT', without.filter(o => o.el === 'Void').every(o => o.disabled && o.gated));
      check('CK-PICKER-OTHERS-UNCHANGED', without.filter(o => o.el !== 'Void').map(o => [o.v, o.disabled]), withIt.filter(o => o.el !== 'Void').map(o => [o.v, o.disabled]));
      check('CK-PICKER-NOTHING-GATED-WITH', withIt.some(o => o.gated), false);
      // The wizard's spell lists (spellEligibility, by name): Void only with Ishiken-Do.
      await setup(page, [], {school:'Isawa Shugenja'});
      check('CK-WIZARD-GROUPS-WITHOUT', await page.evaluate(() => window.__L5R_TEST__.CW1122.spellGroups().map(g => g.label).includes('Void')), false);
      check('CK-WIZARD-STEP-GREYED', await page.evaluate(() => { const T = window.__L5R_TEST__, d = document.createElement('div'); T.CW1122.spellsStep.render(d);
        const opts = [...d.querySelectorAll('select option')].filter(o => /^\d+$/.test(o.value) && T.SPELL_LIBRARY[+o.value].element === 'Void');
        return opts.length > 0 && opts.every(o => o.disabled && / — needs Ishiken-Do$/.test(o.textContent)); }));
      await setup(page, ['Ishiken-Do'], {school:'Isawa Shugenja'});
      check('CK-WIZARD-GROUPS-WITH', await page.evaluate(() => window.__L5R_TEST__.CW1122.spellGroups().map(g => g.label).includes('Void')), true);
      check('CK-WIZARD-STEP-NOT-GREYED-WITH', await page.evaluate(() => { const T = window.__L5R_TEST__, d = document.createElement('div'); T.CW1122.spellsStep.render(d);
        return [...d.querySelectorAll('select option')].some(o => / — needs Ishiken-Do/.test(o.textContent)); }), false);
      // Adding a Void spell: refused without Ishiken-Do even with its scroll; the scroll itself is kept.
      const tryAdd = () => page.evaluate(() => { const T = window.__L5R_TEST__; const idx = T.SPELL_LIBRARY.findIndex(s => s.element === 'Void' && !s.maho && s.mastery === 1);
        const ok = T.CW1122.addSpell(idx); const name = T.SPELL_LIBRARY[idx].name;
        return [ok, [...document.querySelectorAll('#techList .en-name')].some(e => e.value === name),
          [...document.querySelectorAll('#equipBody .eq-name')].some(e => e.value.includes(name))]; });
      await setup(page, [], {school:'Isawa Shugenja'});
      check('CK-ADD-VOID-REFUSED-SCROLL-KEPT', await tryAdd(), [false, false, true]);
      await setup(page, ['Ishiken-Do'], {school:'Isawa Shugenja'});
      check('CK-ADD-VOID-WITH-ISHIKEN', await tryAdd(), [true, true, true]);
      // School-given starting spells: no School gives a Void spell, so the gate costs no School its spells.
      // Read from the built page's own School data (STARTING_SPELLS and STARTING_SPELLS_EVERY_SCHOOL).
      const html = require('fs').readFileSync(process.argv[2], 'utf8');
      const voidNames = await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.filter(s => s.element === 'Void').map(s => s.name));
      const given = [...html.matchAll(/given: \[([^\]]*)\]/g)].flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]));
      check('CK-NO-SCHOOL-GIVES-VOID', [given.length > 20, given.filter(n => voidNames.includes(n)), /\['Void', \d+\]/.test(html)], [true, [], false]);
      // A Void spell already on the list: flagged by the casting report as a blocker; Cast still works.
      await setup(page, [], {school:'Isawa Shugenja'});
      const onList = await page.evaluate(() => { const T = window.__L5R_TEST__; const s = T.SPELL_LIBRARY.find(x => x.element === 'Void' && x.mastery === 1);
        const e = T.makeEntry({name:s.name, cost:0, desc:'', spellElement:'void', spellMastery:1, spellKeywords:[]}, true, 'XP');
        document.getElementById('techList').appendChild(e); T.recalcAll();
        const rep = T.diagnoseCastability(e); const cast = e.querySelector('.spell-cast-btn');
        return [rep.findings.filter(f => f.id === 'ishiken-do').map(f => [f.severity, f.title]), !!cast && !cast.disabled, e.querySelector('.cast-why-btn')?.textContent]; });
      check('CK-VOID-ON-LIST-FLAGGED', onList, [[['blocker', 'Needs Ishiken-Do']], true, '✕']);
      await page.evaluate(() => document.querySelector('#techList .spell-cast-btn').click());
      await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000}).catch(() => {});
      check('CK-VOID-CAST-NOT-BLOCKED', await previewOpen(page));
      await page.locator('#rollPreviewCancel').click().catch(() => {});
      await setup(page, ['Ishiken-Do'], {school:'Isawa Shugenja'});
      check('CK-VOID-ON-LIST-CLEAR-WITH', await page.evaluate(() => { const T = window.__L5R_TEST__; const s = T.SPELL_LIBRARY.find(x => x.element === 'Void' && x.mastery === 1);
        const e = T.makeEntry({name:s.name, cost:0, desc:'', spellElement:'void', spellMastery:1, spellKeywords:[]}, true, 'XP');
        document.getElementById('techList').appendChild(e); T.recalcAll(); return T.diagnoseCastability(e).findings.filter(f => f.id === 'ishiken-do').length; }), 0);
      // A Universal spell is never cast as Void on this sheet (Air, Earth, Fire or Water), with or without Ishiken-Do.
      const universal = () => page.evaluate(async () => { const T = window.__L5R_TEST__; const s = T.SPELL_LIBRARY.find(x => x.element === 'Universal' && !x.maho && x.mastery === 1);
        const e = T.makeEntry({name:s.name, cost:0, desc:'', spellElement:'universal', spellMastery:1, spellKeywords:s.keywords || []}, true, 'XP');
        document.getElementById('techList').appendChild(e); T.recalcAll();
        document.getElementById('universalSpellPickGrid').innerHTML = '';
        e.querySelector('.spell-cast-btn').click();
        for (let i = 0; i < 40 && !document.querySelector('#universalSpellPickGrid .affinity-pick-item'); i++) await new Promise(r => setTimeout(r, 50));
        const items = [...document.querySelectorAll('#universalSpellPickGrid .affinity-pick-item')].map(i => [i.dataset.el, i.classList.contains('disabled')]);
        document.getElementById('universalSpellPickX').click();
        return {items, report:T.diagnoseCastability(e).findings.map(f => f.id)}; });
      await setup(page, [], {school:'Isawa Shugenja'});
      let u = await universal();
      check('CK-UNIVERSAL-NEVER-VOID-WITHOUT', [u.items.map(i => i[0]), u.items.every(i => !i[1]), u.report.includes('ishiken-do')], [['Air', 'Earth', 'Fire', 'Water'], true, false]);
      await setup(page, ['Ishiken-Do'], {school:'Isawa Shugenja'});
      u = await universal();
      check('CK-UNIVERSAL-NEVER-VOID-WITH', u.items.map(i => i[0]), ['Air', 'Earth', 'Fire', 'Water']);
      // Spell scrolls in Equipment are untouched: a Void scroll can still be added.
      await setup(page, [], {school:'Isawa Shugenja'});
      check('CK-VOID-SCROLL-STILL-OFFERED', await page.evaluate(() => { const T = window.__L5R_TEST__; T.renderSpellScrollsList?.('');
        const idx = T.SPELL_LIBRARY.findIndex(s => s.element === 'Void');
        return !!document.querySelector('#spellScrollsList .spell-scroll-add-btn[data-idx="' + idx + '"]'); }));
    });

    await section('CK-LAYOUT', async () => {
      await page.setViewportSize({width:320, height:900});
      await setup(page, ['Contrary', 'Rumormonger', 'Epilepsy', 'Lost Love', 'Missing Limb', 'Soft-Hearted', 'Blind']);
      await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; const pages = [...document.querySelectorAll('[data-car-slug]')];
        C.goToTab(pages.findIndex(p => p.contains(document.getElementById('disadvList')))); await C.whenSettled(); });
      check('CK-ROW-LAYOUT-320', await page.evaluate(() => [...document.querySelectorAll('.chk4531-row')].map(row => {
        const e = row.closest('.entry').getBoundingClientRect(), r = row.getBoundingClientRect();
        const inside = [...row.children].every(c => { const b = c.getBoundingClientRect(); return b.width > 0 && b.left >= e.left - 1 && b.right <= e.right + 1; });
        return r.width > 0 && inside && row.scrollWidth <= row.clientWidth + 1; })), [true, true, true, true, true, true, true]);
      check('CK-TOUCH-TARGETS', await page.evaluate(() => [...document.querySelectorAll('.chk4531-toggle')].every(t => t.getBoundingClientRect().width >= 20)));
      await page.setViewportSize({width:375, height:812});
    });
  } finally {
    check('CK-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('CK-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
