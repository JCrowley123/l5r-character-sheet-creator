/* Real-browser acceptance tests for Phase 4.5.32 Damage, Sessions and XP (Part I).
 * Every expected value comes from the Core Rulebook and the owner's rulings of 8 October 2026, or from
 * the sheet's own core functions (the contracts), never from DSX4532 itself:
 *   Hands of Stone (p.150) +0k1 unarmed damage; Large (p.151) +1k0 damage with Large melee weapons;
 *   Small (p.162) -1k0 melee damage; Large and Small not together. Great Destiny (p.150) and Dark Fate
 *   (p.158): once a session, a killing blow leaves 1 Wound from death (one less than the core's last
 *   Wound threshold). Haunted (p.160): while the ancestor is angry, one GM-chosen roll a session at -1k1.
 *   Enlightened (p.148) Void Ring 2 XP less per Rank; Obtuse (p.161) High Skills other than
 *   Investigation and Medicine cost double for their Ranks; Blissful Betrothal (p.146) Gentry, Kharmic
 *   Tie (spouse), Social Position and Wealthy 2 less each, never below 1.
 * node damage-sessions-xp-harness.js <sheet.html>
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
const ADV = ['Hands of Stone', 'Large', 'Great Destiny', 'Enlightened', 'Blissful Betrothal'];
const DIS = ['Small', 'Dark Fate', 'Haunted', 'Obtuse'];
const ALL = [...ADV, ...DIS];

async function setup(page, entries = [], {wrongList = false, configs = {}, skills = [], earth = 2} = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(({entries, ADV, wrongList, configs, skills, earth}) => {
    document.querySelectorAll('.roll-modal-overlay, #appConfirmOverlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); T.saveSchoolsList?.([]);
    document.getElementById('f_school').value = '';
    document.getElementById('weaponsBody').innerHTML = '';
    for (const id of ['trait_strength', 'trait_agility', 'trait_reflexes', 'trait_willpower', 'trait_awareness', 'trait_intelligence', 'trait_perception', 'trait_stamina']) {
      const el = document.getElementById(id); el.value = 3; el.dataset.free = 3; }
    document.getElementById('ring_earth').value = earth;
    const voidRing = document.getElementById('ring_void'); voidRing.value = 2; voidRing.dataset.free = 2;
    document.getElementById('f_woundsTaken').value = 0;
    for (const s of skills) document.getElementById('skillsBody').appendChild(T.makeSkillRow(s));
    for (const name of entries) {
      const own = ADV.includes(name) ? 'advList' : 'disadvList';
      const list = wrongList ? (own === 'advList' ? 'disadvList' : 'advList') : own;
      const lib = [...T.ADV_LIBRARY, ...T.DISADV_LIBRARY].find(x => x.name === name);
      const row = T.makeEntry({name, cost:lib ? lib.cost : 0, desc:lib ? lib.desc : ''}, true);
      document.getElementById(list).appendChild(row);
      if (configs[name]) row.dataset.advConfig = JSON.stringify(configs[name]);
    }
    T.recalcAll();
  }, {entries, ADV, wrongList, configs, skills, earth});
}
// The damage dice for one library weapon: [numDice, keepDice, notation].
const dmg = (page, weapon) => page.evaluate(weapon => { const T = window.__L5R_TEST__;
  const d = T.getWeaponDamageDice(T.WEAPON_LIBRARY.find(w => w.name === weapon), 2); return [d.numDice, d.keepDice, d.notation]; }, weapon);
const rowOf = (page, name) => page.evaluate(name => {
  const div = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(d => d.querySelector('.en-name').value === name);
  const row = div && div.querySelector('.dsx4532-row');
  return row ? {buttons:[...row.querySelectorAll('button')].map(b => [b.textContent, b.disabled]), switches:[...row.querySelectorAll('.dsx4532-switch')].map(s => [s.textContent, s.querySelector('input').checked]),
    state:row.querySelector('.dsx4532-state')?.textContent || null, notes:[...row.querySelectorAll('.dsx4532-note')].map(n => n.textContent)} : null; }, name);
async function press(page, name, text) {
  await page.evaluate(({name, text}) => {
    const div = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(d => d.querySelector('.en-name').value === name);
    const b = div && [...div.querySelectorAll('.dsx4532-row button')].find(x => x.textContent === text);
    if (!b) throw Error('No ' + text + ' button on ' + name); b.click(); }, {name, text});
}
const confirmDialog = async (page, ok) => {
  await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex', null, {timeout:4000});
  const msg = await page.evaluate(() => document.getElementById('appConfirmMsg').textContent);
  await page.evaluate(ok => { const o = document.getElementById('appConfirmOverlay');
    const b = ok ? (document.getElementById('appConfirmOk') || o.querySelector('.btn-ok, button.primary, button:last-of-type')) : (document.getElementById('appConfirmCancel') || o.querySelector('button'));
    b.click(); }, ok);
  return msg;
};
const alertText = page => page.evaluate(() => { const o = document.getElementById('appConfirmOverlay');
  const t = o && o.style.display === 'flex' ? document.getElementById('appConfirmMsg').textContent : null;
  if (o) o.style.display = 'none'; return t; });
const breakdown = (page, label) => page.evaluate(label => { const d = [...document.querySelectorAll('#xpBreakdown div')].find(x => x.textContent.startsWith(label));
  return d ? +d.querySelector('strong').textContent.replace(/[^\d.-]/g, '') : null; }, label);
const xpSpent = page => page.evaluate(() => +document.getElementById('f_xpSpent').value);

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
    // Weapons from the sheet's own library: a Large melee weapon, a Medium one, a ranged one, and Unarmed.
    const W = await page.evaluate(() => { const T = window.__L5R_TEST__;
      return {large:T.WEAPON_LIBRARY.find(w => w.size === 'Large' && !T.isRangedWeapon(w) && w.damage && w.damage.roll > 0).name,
        medium:T.WEAPON_LIBRARY.find(w => w.size === 'Medium' && !T.isRangedWeapon(w) && w.skill === 'Kenjutsu').name,
        ranged:T.WEAPON_LIBRARY.find(w => T.isRangedWeapon(w) && w.size === 'Large').name,
        unarmed:T.WEAPON_LIBRARY.find(w => w.skill === 'Jiujutsu').name}; });

    await section('DS-START', async () => {
      check('DS-SEAM', await page.evaluate(() => window.__L5R_TEST__.DAMAGE_SESSIONS_XP_ENABLED === true && !!window.__L5R_TEST__.DSX4532));
      check('DS-REGISTRY-STILL-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('DS-CATALOGUE', await page.evaluate(({ADV, DIS}) => { const T = window.__L5R_TEST__;
        return [...ADV.map(n => T.ADV_LIBRARY.some(e => e.name === n)), ...DIS.map(n => T.DISADV_LIBRARY.some(e => e.name === n))]; }, {ADV, DIS}), ALL.map(() => true));
      check('DS-TICK-PROVIDER-REGISTERED', await page.evaluate(() => window.__L5R_TEST__.RD4515.providerIds().includes('damage-sessions-xp')));
    });

    // The core's own damage dice for each weapon, with nothing on the character.
    await setup(page, []);
    const core = {};
    for (const k of Object.keys(W)) core[k] = await dmg(page, W[k]);

    await section('DS-DAMAGE', async () => {
      check('DS-CORE-UNARMED-IS-0K1-PLUS-STRENGTH', core.unarmed.slice(0, 2), [3, 1]);
      await setup(page, ['Hands of Stone']);
      check('DS-HANDS-OF-STONE-UNARMED', await dmg(page, W.unarmed), [core.unarmed[0], core.unarmed[1] + 1, core.unarmed[0] + 'k' + (core.unarmed[1] + 1)]);
      check('DS-HANDS-OF-STONE-NOT-WEAPONS', [await dmg(page, W.medium), await dmg(page, W.large)], [core.medium, core.large]);
      await setup(page, ['Large']);
      check('DS-LARGE-LARGE-MELEE', (await dmg(page, W.large)).slice(0, 2), [core.large[0] + 1, core.large[1]]);
      check('DS-LARGE-NOT-MEDIUM-RANGED-UNARMED', [await dmg(page, W.medium), await dmg(page, W.ranged), await dmg(page, W.unarmed)], [core.medium, core.ranged, core.unarmed]);
      await setup(page, ['Small']);
      check('DS-SMALL-MELEE', [(await dmg(page, W.medium)).slice(0, 2), (await dmg(page, W.large)).slice(0, 2), (await dmg(page, W.unarmed)).slice(0, 2)],
        [[core.medium[0] - 1, core.medium[1]], [core.large[0] - 1, core.large[1]], [core.unarmed[0] - 1, core.unarmed[1]]]);
      check('DS-SMALL-NOT-RANGED', await dmg(page, W.ranged), core.ranged);
      await setup(page, ['Large', 'Small']);
      check('DS-LARGE-AND-SMALL-NEITHER', [await dmg(page, W.large), await dmg(page, W.medium)], [core.large, core.medium]);
      check('DS-LARGE-AND-SMALL-ROWS-SAY', [(await rowOf(page, 'Large')).notes, (await rowOf(page, 'Small')).notes],
        [['Not in effect: Large and Small cannot both be taken.'], ['Not in effect: Large and Small cannot both be taken.']]);
      await setup(page, ['Small'], {});
      await page.evaluate(() => { const T = window.__L5R_TEST__; document.getElementById('trait_strength').value = 1; T.recalcAll(); });
      check('DS-SMALL-NEVER-KEEPS-MORE-THAN-ROLLED', (await dmg(page, W.unarmed)).slice(0, 2), [0, 0]);
      // The roll itself: the weapon row's own Damage button rolls the adjusted dice and names the entry.
      await setup(page, ['Hands of Stone']);
      const rolled = await page.evaluate(({unarmed}) => { const T = window.__L5R_TEST__; const L = T.WEAPON_LIBRARY.find(w => w.name === unarmed);
        const tr = document.getElementById('weaponsBody').appendChild(T.makeWeaponRow({key:L.name, name:L.name, skill:L.skill, size:L.size,
          keywords:(L.keywords || []).join(', '), notes:L.notes || '', roll:'', dmg:'', manualAttack:false, manualDamage:false}));
        T.recalcAll(); let i = 0; Math.random = () => ((([7, 4, 2, 9])[i++ % 4]) - 0.5) / 10;
        tr.querySelector('.wp-dmg-btn').click();
        return {row:tr.querySelector('.wp-dmg').value, dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
          kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
          note:[...document.querySelectorAll('#rollModalBody .dsx4532-roll-note')].map(n => n.textContent)}; }, W);
      await page.keyboard.press('Escape');
      check('DS-DAMAGE-ROLL-USES-THE-DICE', [rolled.row, rolled.dice, rolled.kept], ['3k2', 3, 2]);
      check('DS-DAMAGE-ROLL-NAMES-THE-ENTRY', rolled.note, ['Hands of Stone: +0k1 unarmed damage → 3k2.']);
      check('DS-DAMAGE-NOT-A-ROLL-MODIFIER', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.DAMAGE, {skillName:'Jiujutsu'})).filter(m => /Hands of Stone|Large|Small/.test(m.label)).length; }), 0);
    });

    await section('DS-PICKER', async () => {
      const opt = name => page.evaluate(name => { const o = [...document.getElementById(name === 'Large' ? 'advQuickAdd' : 'disadvQuickAdd').options].find(x => x.value === name);
        return [o.disabled, (o.textContent.match(/ — (.*)$/) || [])[1] || null]; }, name);
      await setup(page, ['Small']);
      check('DS-LARGE-GREYED-WITH-SMALL', await opt('Large'), [true, 'not with Small']);
      await setup(page, ['Large']);
      check('DS-SMALL-GREYED-WITH-LARGE', await opt('Small'), [true, 'not with Large']);
      await setup(page, []);
      check('DS-NEITHER-GREYED-ALONE', [await opt('Large'), await opt('Small')], [[false, null], [false, null]]);
    });

    await section('DS-DESTINY', async () => {
      for (const name of ['Great Destiny', 'Dark Fate']) {
        const tag = name === 'Great Destiny' ? 'GREAT-DESTINY' : 'DARK-FATE';
        await setup(page, [name], {earth:3});
        const limit = await page.evaluate(() => { const t = window.__L5R_TEST__.computeWoundThresholds(3); return t[t.length - 1]; });
        check('DS-' + tag + '-ROW', await rowOf(page, name), {buttons:[['Use', false], ['Reset session', false]], switches:[], state:'Available this session.', notes:[]});
        await press(page, name, 'Use');
        let msg = await confirmDialog(page, false);
        check('DS-' + tag + '-ASKS-FIRST', [/1 Wound from death/.test(msg), msg.includes((limit - 1) + ' of ' + limit), await page.evaluate(() => +document.getElementById('f_woundsTaken').value)], [true, true, 0]);
        await press(page, name, 'Use');
        msg = await confirmDialog(page, true);
        await page.waitForFunction(() => +document.getElementById('f_woundsTaken').value > 0);
        check('DS-' + tag + '-ONE-WOUND-FROM-DEATH', await page.evaluate(() => [+document.getElementById('f_woundsTaken').value, document.getElementById('woundSummaryLine').textContent.split(' — ')[0]]),
          [limit - 1, 'Out']);
        check('DS-' + tag + '-USED', await rowOf(page, name), {buttons:[['Use', true], ['Reset session', false]], switches:[], state:'Used this session.', notes:[]});
        await page.evaluate(() => { document.getElementById('f_woundsTaken').value = 0; });
        // Not awaited: if the once-a-session refusal were missing, the confirm dialog would wait for a tap.
        await page.evaluate(name => { window.__L5R_TEST__.DSX4532.useDestiny([...document.querySelectorAll('.entry')].find(d => d.querySelector('.en-name').value === name), name.toLowerCase()); }, name);
        await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex', null, {timeout:4000}).catch(() => {});
        check('DS-' + tag + '-ONCE-A-SESSION', [await alertText(page), await page.evaluate(() => +document.getElementById('f_woundsTaken').value)],
          [name + ' is already used this session. Reset session to use it again.', 0]);
        check('DS-' + tag + '-USE-SAVED', await page.evaluate(name => (window.__L5R_TEST__.collectData()[name === 'Great Destiny' ? 'adv' : 'disadv'].find(d => d.name === name) || {}).config?.used, name), true);
        await press(page, name, 'Reset session');
        check('DS-' + tag + '-RESET', (await rowOf(page, name)).state, 'Available this session.');
      }
      // The contract: the limit follows the wound core, Bad Health (Feature 4.5.29) included.
      await setup(page, ['Great Destiny', 'Bad Health'], {earth:3});
      const limit = await page.evaluate(() => { const t = window.__L5R_TEST__.computeWoundThresholds(3); return t[t.length - 1]; });
      await press(page, 'Great Destiny', 'Use');
      await confirmDialog(page, true);
      await page.waitForFunction(() => +document.getElementById('f_woundsTaken').value > 0);
      check('DS-DESTINY-FOLLOWS-WOUND-CORE', await page.evaluate(() => +document.getElementById('f_woundsTaken').value), limit - 1);
    });

    await section('DS-HAUNTED', async () => {
      const offered = () => page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier', traitName:'Awareness', skillRank:2})).filter(o => o.provider === 'damage-sessions-xp').map(o => o.label); });
      await setup(page, ['Haunted']);
      check('DS-HAUNTED-CONTENT-NOTHING', [await offered(), (await rowOf(page, 'Haunted')).state], [[], 'Ancestor content: no roll is taken.']);
      await page.evaluate(() => document.querySelector('.dsx4532-toggle').click());
      check('DS-HAUNTED-ANGRY-OFFERS', [await offered(), (await rowOf(page, 'Haunted')).state], [['Haunted: the GM chose this roll — −1k1'], 'The GM may choose one roll this session (−1k1).']);
      check('DS-HAUNTED-NOT-DAMAGE', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS.DAMAGE, {skillName:'Kenjutsu'})).filter(o => o.provider === 'damage-sessions-xp').length; }), 0);
      // Unticked: the roll is not taken and the use is not spent.
      await page.evaluate(() => { window.__L5R_TEST__.rollSkill('Courtier', 'Awareness', 2); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      check('DS-HAUNTED-UNTICKED-BY-DEFAULT', await page.evaluate(() => [...document.querySelectorAll('[data-rd4515-key="damage-sessions-xp:haunted"]')].map(b => b.checked)), [false]);
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      await page.keyboard.press('Escape');
      check('DS-HAUNTED-UNTICKED-NOT-SPENT', (await rowOf(page, 'Haunted')).state, 'The GM may choose one roll this session (−1k1).');
      // Ticked: -1k1, and the roll spends the session's use.
      await page.evaluate(() => { window.__L5R_TEST__.rollSkill('Courtier', 'Awareness', 2); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      await page.locator('[data-rd4515-key="damage-sessions-xp:haunted"]').check();
      check('DS-HAUNTED-TICKED-POOL', await page.locator('.rp-pool-final').textContent(), '4k2');
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      check('DS-HAUNTED-ROLL', await page.evaluate(() => [document.querySelectorAll('#rollDiceRow .roll-die').length, /Haunted/.test(document.getElementById('rollModalBody').textContent)]), [4, true]);
      await page.keyboard.press('Escape');
      check('DS-HAUNTED-SPENT', [(await rowOf(page, 'Haunted')).state, await offered()], ['Used this session.', []]);
      check('DS-HAUNTED-SAVED', await page.evaluate(() => { const c = (window.__L5R_TEST__.collectData().disadv.find(d => d.name === 'Haunted') || {}).config || {}; return [c.angry, c.used]; }), [true, true]);
      await press(page, 'Haunted', 'Reset session');
      check('DS-HAUNTED-RESET', [(await rowOf(page, 'Haunted')).state, await offered()], ['The GM may choose one roll this session (−1k1).', ['Haunted: the GM chose this roll — −1k1']]);
      // Cancelling the preview spends nothing.
      await page.evaluate(() => { window.__L5R_TEST__.rollSkill('Courtier', 'Awareness', 2); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      await page.locator('[data-rd4515-key="damage-sessions-xp:haunted"]').check();
      await page.locator('#rollPreviewCancel').click();
      check('DS-HAUNTED-CANCEL-NOT-SPENT', (await rowOf(page, 'Haunted')).state, 'The GM may choose one roll this session (−1k1).');
    });

    await section('DS-XP', async () => {
      // Enlightened: Void 2 -> 4 above a floor of 2 costs 6x3 + 6x4 = 42 by the core; 2 less per Rank = 38.
      const voidXP = async (entries) => { await setup(page, entries); await page.evaluate(() => { document.getElementById('ring_void').value = 4; window.__L5R_TEST__.recalcAll(); }); return breakdown(page, 'Void:'); };
      check('DS-ENLIGHTENED-VOID-XP', [await voidXP([]), await voidXP(['Enlightened'])], [42, 38]);
      check('DS-ENLIGHTENED-NOTHING-BOUGHT', await page.evaluate(() => { document.getElementById('ring_void').value = 2; window.__L5R_TEST__.recalcAll();
        return +[...document.querySelectorAll('#xpBreakdown div')].find(x => x.textContent.startsWith('Void:')).querySelector('strong').textContent; }), 0);
      // Obtuse: Rank 3 is 1+2+3 = 6 XP; doubled for a High Skill, not for Investigation, Medicine or a Bugei Skill.
      const skills = [{name:'Courtier', trait:'Awareness', rank:3}, {name:'Investigation', trait:'Perception', rank:3}, {name:'Medicine', trait:'Intelligence', rank:3},
        {name:'Kenjutsu', trait:'Agility', rank:3}, {name:'Lore: Theology', trait:'Intelligence', rank:2}];
      const costs = async entries => { await setup(page, entries, {skills}); return page.evaluate(() => [...document.querySelectorAll('#skillsBody tr')].map(tr => [tr.querySelector('.sk-name').value, tr.querySelector('.sk-cost').textContent])); };
      const plain = await costs([]);
      check('DS-OBTUSE-CORE', plain.map(r => r[1]), ['6 xp', '6 xp', '6 xp', '6 xp', '3 xp']);
      const obtuse = await costs(['Obtuse']);
      check('DS-OBTUSE-HIGH-DOUBLED', obtuse.map(r => r[1]), ['12 xp', '6 xp', '6 xp', '6 xp', '6 xp']);
      check('DS-OBTUSE-BREAKDOWN-AGREES', await breakdown(page, 'Skills+Emph:'), 12 + 6 + 6 + 6 + 6);
      // An Emphasis keeps its price (2 XP): Rank 3 with one Emphasis is 6 + 2 = 8, and 12 + 2 = 14 with Obtuse.
      const emph = async entries => { await setup(page, entries, {skills:[{name:'Courtier', trait:'Awareness', rank:3, emph:'Manipulation'}]});
        return page.evaluate(() => document.querySelector('#skillsBody .sk-cost').textContent); };
      check('DS-OBTUSE-EMPHASIS-NOT-DOUBLED', [await emph([]), await emph(['Obtuse'])], ['8 xp', '14 xp']);
      await setup(page, ['Obtuse'], {skills:[{name:'Courtier', trait:'Awareness', rank:3, school:true}]});
      check('DS-OBTUSE-ONLY-PAID-RANKS', await page.evaluate(() => document.querySelector('#skillsBody .sk-cost').textContent), String((6 - 1) * 2) + ' xp');
      // Blissful Betrothal: Social Position 6 -> 4; the XP total agrees at once.
      await setup(page, ['Blissful Betrothal']);
      const spentBefore = await xpSpent(page);
      await page.evaluate(() => { const T = window.__L5R_TEST__; const lib = T.ADV_LIBRARY.find(x => x.name === 'Social Position');
        document.getElementById('advList').appendChild(T.makeEntry({name:'Social Position', cost:lib.cost, desc:lib.desc}, true)); T.recalcAll(); });
      const sp = () => page.evaluate(() => +[...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Social Position').querySelector('.en-cost').value);
      check('DS-BETROTHAL-SOCIAL-POSITION', [await sp(), await xpSpent(page) - spentBefore], [4, 4]);
      check('DS-BETROTHAL-STABLE-OVER-RECALCS', await page.evaluate(() => { const T = window.__L5R_TEST__; T.recalcAll(); T.recalcAll();
        return +[...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Social Position').querySelector('.en-cost').value; }), 4);
      // A save and a load keep the price (no second discount); removing the Betrothal restores 6.
      const saved = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await setup(page, []);
      await page.evaluate(saved => { const T = window.__L5R_TEST__; T.applyData(JSON.parse(saved)); T.recalcAll(); T.recalcAll(); }, saved);
      check('DS-BETROTHAL-ROUND-TRIP', await sp(), 4);
      await page.evaluate(() => { const n = [...document.querySelectorAll('#advList .en-name')].find(e => e.value === 'Blissful Betrothal'); n.value = 'Blissful Betrothals';
        n.dispatchEvent(new Event('input', {bubbles:true})); window.__L5R_TEST__.recalcAll(); });
      check('DS-BETROTHAL-GONE-PRICE-BACK', await sp(), 6);
      // Wealthy at 1 point stays 1 (never below 1); a Kharmic Tie only with the spouse switch.
      // A configured Kharmic Tie (Rank 3, so the core prices it 3): 2 less only with the spouse switch.
      const TIE = {type:'rankPick', value:'Rank 3', rank:3, target:'Aiko', remaining:3};
      const priced = async (name, cost, spouse, config) => { await setup(page, ['Blissful Betrothal'], {configs:spouse ? {'Blissful Betrothal':{type:'dsx4532', spouse:true}} : {}});
        return page.evaluate(({name, cost, config}) => { const T = window.__L5R_TEST__; const lib = T.ADV_LIBRARY.find(x => x.name === name);
          const row = T.makeEntry({name, cost, desc:lib.desc}, true); if (config) row.dataset.advConfig = JSON.stringify(config);
          document.getElementById('advList').appendChild(row); T.recalcAll(); T.recalcAll();
          return +row.querySelector('.en-cost').value; }, {name, cost, config}); };
      check('DS-BETROTHAL-NEVER-BELOW-ONE', await priced('Social Position', 2, false), 1);
      const tieCore = await (async () => { await setup(page, []); return page.evaluate(TIE => { const T = window.__L5R_TEST__; const lib = T.ADV_LIBRARY.find(x => x.name === 'Kharmic Tie');
        const row = T.makeEntry({name:'Kharmic Tie', cost:1, desc:lib.desc}, true); row.dataset.advConfig = JSON.stringify(TIE);
        document.getElementById('advList').appendChild(row); T.recalcAll(); T.recalcAll(); return +row.querySelector('.en-cost').value; }, TIE); })();
      check('DS-BETROTHAL-TIE-CORE-PRICE', tieCore, 3);
      check('DS-BETROTHAL-TIE-NEEDS-SPOUSE', [await priced('Kharmic Tie', 1, false, TIE), await priced('Kharmic Tie', 1, true, TIE)], [3, 1]);
      check('DS-BETROTHAL-NOT-OTHER-ADVANTAGES', await priced('Large', 4, true), 4);
    });

    await section('DS-ROWS', async () => {
      await setup(page, ALL);
      const rows = {};
      for (const n of ALL) rows[n] = await rowOf(page, n);
      check('DS-ROW-NOTES', [rows['Hands of Stone'].notes, rows['Enlightened'].notes, rows['Obtuse'].notes].map(n => n.length), [1, 1, 1]);
      check('DS-ROW-BETROTHAL', [rows['Blissful Betrothal'].switches, /2 less/.test(rows['Blissful Betrothal'].notes[0])], [[['Your Kharmic Tie is to your spouse', false]], true]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
      check('DS-PLAY-MODE', await page.evaluate(() => [
        [...document.querySelectorAll('.dsx4532-btn')].every(b => b.offsetParent !== null),
        [...document.querySelectorAll('.dsx4532-toggle:not(.dsx4532-spouse)')].every(b => !b.disabled),
        document.querySelector('.dsx4532-spouse').disabled]), [true, true, true]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      // Its own stylesheet: the line lays out as a row, and a switch is a 20px touch target.
      check('DS-ROW-STYLED', await page.evaluate(() => [getComputedStyle(document.querySelector('.dsx4532-row')).display,
        Math.round(document.querySelector('.dsx4532-toggle').getBoundingClientRect().width)]), ['flex', 20]);
      await setup(page, ALL, {wrongList:true});
      check('DS-WRONG-LIST-NOTHING', [await page.evaluate(() => document.querySelectorAll('.dsx4532-row').length), await dmg(page, W.unarmed), await dmg(page, W.large)], [0, core.unarmed, core.large]);
      await setup(page, ['Hands of Stone', 'Hands of Stone']);
      check('DS-DUPLICATE-ONCE', (await dmg(page, W.unarmed)).slice(0, 2), [core.unarmed[0], core.unarmed[1] + 1]);
      await page.setViewportSize({width:320, height:900});
      await setup(page, ALL);
      await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; const pages = [...document.querySelectorAll('[data-car-slug]')];
        C.goToTab(pages.findIndex(p => p.contains(document.getElementById('advList')))); await C.whenSettled(); });
      check('DS-ROW-LAYOUT-320', await page.evaluate(() => [...document.querySelectorAll('#advList .dsx4532-row, #disadvList .dsx4532-row')].every(row => {
        const e = row.closest('.entry').getBoundingClientRect(), r = row.getBoundingClientRect();
        return r.width > 0 && [...row.children].every(c => { const b = c.getBoundingClientRect(); return b.left >= e.left - 1 && b.right <= e.right + 1; }) && row.scrollWidth <= row.clientWidth + 1; })));
      await page.setViewportSize({width:375, height:812});
    });
  } finally {
    check('DS-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('DS-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
