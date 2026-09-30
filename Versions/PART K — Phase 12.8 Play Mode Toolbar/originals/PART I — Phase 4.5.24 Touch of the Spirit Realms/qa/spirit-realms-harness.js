/* Real-browser acceptance tests for Touch of the Spirit Realms (A13, Feature 4.5.24).
 * Oracles from Core pp.154-155 as recorded in SOURCE-CORE-PREPARATION.md and the owner's rulings
 * of 23 September 2026 (audit "A13 decisions"), never from TR4524: 5 XP, Toshigoku 8, Yomi 7; a
 * Shugenja 1 less (4, 7, 6 -- the last two an interpretation carrying a confirm-with-GM note).
 * School Skills come from the printed School rows; dice are counted on real rolls.
 * node spirit-realms-harness.js <sheet.html>
 */
'use strict';
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const results = [];
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
function check(id, actual, expected = true) {
  const pass = JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);
}
let PAGE = null;
async function closeAll(page) {
  await page.evaluate(() => {
    ['rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay', 'advConfigModalOverlay', 'stanceInfoOverlay']
      .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
  }).catch(() => {});
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id, String(error.stack || error), 'no exception'); }
  if (PAGE) await closeAll(PAGE);
}
const NAME = 'Touch of the Spirit Realms';
// Core pp.154-155, printed order: [realm, base XP, a phrase its rule text must carry].
const REALMS = [['Chikushudo', 5, /\+1k1 on all Animal Handling/], ['Gaki-do', 5, /kills an opponent.*regain 5 Wounds/],
  ['Jigoku', 5, /Requires Shadowlands Taint.*Taint Rank.*Physical Trait.*Lost.*twice/], ['Maigo no Musha', 5, /more than 3 points of Glory.*one more/],
  ['Meido', 5, /\+2k0 on Contested Rolls against social manipulation/], ['Sakkaku', 5, /\+1k1 on Sincerity \(Deceit\)/],
  ['Tengoku', 5, /\+2k0 on Earth Ring Rolls to resist Shadowlands Taint/], ['Toshigoku', 8, /Move Action.*attack range.*5 extra feet/],
  ['Yomi', 7, /one School Skill.*\+1k0/], ['Yume-do', 5, /Four hours of rest.*Void Points/]];
// Printed School rows (Core), named Skills only: Hida Bushi.
const HIDA_SKILLS = ['Athletics', 'Defense', 'Heavy Weapons', 'Intimidation', 'Kenjutsu', 'Lore: Shadowlands'];
const cfg = (realm, extra = {}) => Object.assign({type:'spiritRealmTouch', revision:1, realm, value:realm}, extra);
const tr = (realm, extra, cost = '5') => ({name:NAME, cost, desc:'', config:cfg(realm, extra)});

async function setup(page, {school = 'Hida Bushi', adv = [], disadv = [], taint = 0} = {}) {
  await page.evaluate(({school, adv, disadv, taint}) => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    T.saveSchoolsList(school ? [{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}] : []);
    document.getElementById('f_taint').value = String(taint);
    T.applyData(Object.assign(T.collectData(), {adv, disadv}));
    T.saveSchoolsList(school ? [{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}] : []);
    document.getElementById('f_taint').value = String(taint);
    T.recalcAll();
  }, {school, adv, disadv, taint});
}
const row = (page, list = 'advList') => page.evaluate(list => {
  const d = document.querySelector('#' + list + ' .entry');
  return d ? {cost:Number(d.querySelector('.en-cost').value), config:d.dataset.advConfig ? JSON.parse(d.dataset.advConfig) : null,
    badge:d.querySelector('.tr4524-badge')?.textContent || '', warn:d.querySelector('.tr4524-warning')?.textContent || '',
    reminder:d.querySelector('.tr4524-reminder')?.textContent || '',
    notes:[...d.querySelectorAll('.tr4524-note')].map(e => e.textContent), flags:[...d.querySelectorAll('.tr4524-flag')].map(e => e.textContent),
    lost:d.querySelector('.tr4524-lost input') ? d.querySelector('.tr4524-lost input').checked : null} : null;
}, list);
const mods = (page, kind, ctx) => page.evaluate(({kind, ctx}) => { const T = window.__L5R_TEST__;
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(m => /Spirit Realms/.test(m.label)).map(m => [m.rolledDelta, m.keptDelta, m.totalDelta]); }, {kind, ctx});
const offers = (page, kind, ctx) => page.evaluate(({kind, ctx}) => { const T = window.__L5R_TEST__;
  return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(o => o.provider === 'spirit-realms').map(o => o.key.split(':')[1]); }, {kind, ctx});

async function roll(page, kind, ctx, base, tick = []) {
  const pending = page.evaluate(({kind, ctx, base}) => { const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Spirit Realms probe', T.makeRollContext(T.ROLL_KINDS[kind], ctx), base[0], base[1]).then(r => !!r); }, {kind, ctx, base});
  pending.catch(() => {});
  await page.waitForSelector('#rollPreviewGo', {state:'visible'});
  const boxes = await page.evaluate(() => [...document.querySelectorAll('#rollPreviewBody input[data-rd4515-key^="spirit-realms:"]')].map(i => [i.dataset.rd4515Key.split(':')[1], i.checked]));
  for (const k of tick) await page.locator('#rollPreviewBody input[data-rd4515-key="spirit-realms:' + k + '"]').check();
  await page.locator('#rollPreviewGo').click();
  await pending;
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => {
    const kept = [...document.querySelectorAll('#rollDiceRow .roll-die.kept')].map(d => Number(d.dataset.total));
    return {dice:document.querySelectorAll('#rollDiceRow .roll-die').length, kept:kept.length, keptSum:kept.reduce((a, b) => a + b, 0),
      total:Number(document.getElementById('rollTotalDisplay').textContent)};
  });
  await closeAll(page);
  return Object.assign(r, {boxes});
}
async function openPicker(page) {
  await page.locator('#advList .tr4524-row .adv-config-btn').first().click();
  await page.waitForSelector('#advConfigGrid .tr4524-option', {state:'visible'});
}

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    const page = await browser.newPage({viewport:{width:375, height:812}, acceptDownloads:true});
    PAGE = page;
    page.setDefaultTimeout(6000);
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => !!window.__L5R_TEST__);

    await section('TR-START', async () => {
      check('TR-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_SPIRIT_REALMS_ENABLED));
      check('TR-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('TR-SCHEMA', await page.evaluate(n => { const s = window.__L5R_TEST__.advConfigSchemaFor(n); return s && s.type; }, NAME), 'spiritRealmTouch');
      check('TR-PROVIDER', await page.evaluate(() => window.__L5R_TEST__.RD4515.providerIds().includes('spirit-realms')));
      check('TR-SHUGENJA-FIXTURE', await page.evaluate(() => { const T = window.__L5R_TEST__;
        T.saveSchoolsList([{name:'Isawa Shugenja', frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}]); const a = T.characterCasterLock();
        T.saveSchoolsList([{name:'Hida Bushi', frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}]); return [a, T.characterCasterLock()]; }), ['shugenja', 'bushi']);
    });

    await section('TR-PRICE', async () => {
      for (const [school, less] of [['Hida Bushi', 0], ['Isawa Shugenja', 1]]) {
        const got = {}, want = {};
        for (const [realm, base] of REALMS) {
          await setup(page, {school, adv:[tr(realm, realm === 'Yomi' ? {skill:'Kenjutsu'} : {}, '9')]});
          got[realm] = (await row(page)).cost; want[realm] = base - less;
        }
        check('TR-PRICE-' + (less ? 'SHUGENJA' : 'OTHERS'), got, want);
      }
      await setup(page, {adv:[{name:NAME, cost:'9', desc:''}]});
      const bare = await row(page);
      check('TR-UNCONFIGURED', [bare.warn, bare.cost, bare.config], ['Choose a Spirit Realm', 9, null]);
    });

    await section('TR-GM-NOTE', async () => {
      const note = async (school, realm) => { await setup(page, {school, adv:[tr(realm, realm === 'Yomi' ? {skill:'Meditation'} : {})]});
        return (await row(page)).notes.some(n => /confirm this price with your GM/.test(n)); };
      check('TR-GM-NOTE-WHERE', [await note('Isawa Shugenja', 'Toshigoku'), await note('Isawa Shugenja', 'Yomi'),
        await note('Isawa Shugenja', 'Chikushudo'), await note('Hida Bushi', 'Toshigoku'), await note('Hida Bushi', 'Yomi')], [true, true, false, false, false]);
      await setup(page, {school:'Isawa Shugenja', adv:[{name:NAME, cost:'5', desc:''}]});
      await openPicker(page);
      const labels = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#advConfigGrid .tr4524-option')].map(l => [l.querySelector('input').value, l.textContent])));
      check('TR-GM-NOTE-PICKER', [/7 XP \(confirm with your GM\)/.test(labels.Toshigoku), /6 XP \(confirm with your GM\)/.test(labels.Yomi),
        /confirm/.test(labels.Chikushudo), /confirm this price with your GM/.test(await page.textContent('#advConfigNote'))], [true, true, false, true]);
      await page.evaluate(() => window.__L5R_TEST__.closeAdvConfigModal());
      await setup(page, {adv:[tr('Chikushudo')]});
      await page.locator('#advList .tr4524-info').click();
      const info = await page.locator('#stanceInfoBody').textContent();
      check('TR-INFO', /Core pp\.154–155/.test(await page.locator('#stanceInfoRing').textContent()) && REALMS.every(([r, , re]) => re.test(info)) &&
        /7 for Toshigoku and 6 for Yomi/.test(info) && /confirm them with your GM/.test(info));
      await page.locator('#stanceInfoClose').click();
    });

    await section('TR-PICKER', async () => {
      await setup(page, {adv:[{name:NAME, cost:'5', desc:''}]});
      await openPicker(page);
      const options = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid input[name="tr4524Realm"]')].map(i => [i.value, i.checked]));
      check('TR-PICKER-ORDER', options.map(o => o[0]), REALMS.map(r => r[0]));
      check('TR-PICKER-NONE-PRESELECTED', options.every(o => !o[1]));
      const texts = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#advConfigGrid .tr4524-option')].map(l => [l.querySelector('input').value, l.textContent])));
      check('TR-PICKER-RULES-AND-PRICES', REALMS.every(([r, base, re]) => re.test(texts[r]) && texts[r].includes(' — ' + base + ' XP')));
      await page.locator('#advConfigConfirm').click();
      check('TR-PICKER-REQUIRED', [await page.locator('#advConfigGrid .tr4524-error').isVisible(), (await row(page)).config], [true, null]);
      check('TR-SKILL-HIDDEN', await page.locator('#advConfigGrid .tr4524-skill').isHidden());
      await page.locator('#advConfigGrid input[value="Yomi"]').check();
      check('TR-SKILL-SHOWN', await page.locator('#advConfigGrid .tr4524-skill').isVisible());
      const skills = await page.evaluate(() => [...document.querySelectorAll('#tr4524Skill option')].map(o => o.value).filter(Boolean));
      check('TR-SKILL-OPTIONS', skills, HIDA_SKILLS);
      await page.locator('#advConfigConfirm').click();
      check('TR-SKILL-REQUIRED', [/School Skills for Yomi/.test(await page.textContent('#advConfigGrid .tr4524-error')), (await row(page)).config], [true, null]);
      await page.locator('#tr4524Skill').selectOption('Kenjutsu');
      await page.locator('#advConfigConfirm').click();
      check('TR-YOMI-SAVED', [(await row(page)).config, (await row(page)).badge], [cfg('Yomi', {skill:'Kenjutsu'}), 'Yomi — Kenjutsu']);
      // Changing realm drops the Skill; Jigoku starts not Lost.
      await openPicker(page);
      check('TR-PICKER-PRESELECTS', [await page.evaluate(() => document.querySelector('#advConfigGrid input:checked')?.value), await page.locator('#tr4524Skill').inputValue()], ['Yomi', 'Kenjutsu']);
      await page.locator('#advConfigGrid input[value="Jigoku"]').check();
      await page.locator('#advConfigConfirm').click();
      check('TR-CHANGE-DROPS-SKILL', (await row(page)).config, cfg('Jigoku', {lost:false}));
      // A Lost Jigoku stays Lost when reconfirmed as Jigoku, and loses it for another realm.
      await setup(page, {adv:[tr('Jigoku', {lost:true})], taint:2});
      await openPicker(page); await page.locator('#advConfigConfirm').click();
      const kept = (await row(page)).config;
      await openPicker(page); await page.locator('#advConfigGrid input[value="Meido"]').check(); await page.locator('#advConfigConfirm').click();
      check('TR-LOST-FOLLOWS-REALM', [kept, (await row(page)).config], [cfg('Jigoku', {lost:true}), cfg('Meido')]);
    });

    await section('TR-ROWS', async () => {
      const seen = {};
      for (const [realm, , re] of REALMS) {
        await setup(page, {adv:[tr(realm, realm === 'Yomi' ? {skill:'Kenjutsu'} : {})], taint:1});
        const r = await row(page);
        seen[realm] = [r.badge === (realm === 'Yomi' ? 'Yomi — Kenjutsu' : realm), re.test(r.reminder), r.lost !== null];
      }
      check('TR-ROW-EACH', seen, Object.fromEntries(REALMS.map(([r]) => [r, [true, true, r === 'Jigoku']])));
      await setup(page, {disadv:[tr('Meido')]});
      check('TR-WRONG-SIDE', /belongs in Advantages/.test((await row(page, 'disadvList')).warn));
      await setup(page, {adv:[tr('Meido')]});
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Unrelated'; window.__L5R_TEST__.recalcAll(); });
      check('TR-RENAMED-CLEAN', await page.evaluate(() => [!!document.querySelector('#advList .tr4524-row'), document.querySelector('#advList .entry').dataset.advConfig || null]), [false, null]);
    });

    await section('TR-INVALID', async () => {
      const bad = [cfg('Heaven'), cfg('Yomi'), cfg('Yomi', {skill:''}), cfg('Meido', {skill:'Kenjutsu'}), cfg('Meido', {lost:false}),
        cfg('Jigoku', {lost:'yes'}), Object.assign(cfg('Meido'), {revision:2}), {type:'realmPick', realm:'Meido', value:'Meido'}, Object.assign(cfg('Meido'), {bonus:1})];
      const out = [];
      for (const config of bad) {
        await setup(page, {adv:[{name:NAME, cost:'7', desc:'', config}]});
        const r = await row(page);
        out.push([/Saved setting kept/.test(r.warn), JSON.stringify(r.config) === JSON.stringify(config), r.cost]);
      }
      check('TR-INVALID-KEPT', out, bad.map(() => [true, true, 7]));
      await setup(page, {adv:[{name:NAME, cost:'7', desc:'', config:cfg('Chikushudo', {bonus:1})}]});
      check('TR-INVALID-NO-EFFECT', await mods(page, 'SKILL', {skillName:'Animal Handling', traitName:'Awareness'}), []);
    });

    await section('TR-AUTOMATIC', async () => {
      await setup(page, {adv:[tr('Chikushudo')]});
      check('TR-CHIKUSHUDO', [await mods(page, 'SKILL', {skillName:'Animal Handling', traitName:'Awareness'}),
        await mods(page, 'SKILL', {skillName:'Animal Handling (Horses)', traitName:'Awareness'}),
        await mods(page, 'SKILL', {skillName:'Etiquette', traitName:'Awareness'}), await mods(page, 'TRAIT', {traitName:'Awareness'})],
        [[[1, 1, 0]], [[1, 1, 0]], [], []]);
      await setup(page, {adv:[tr('Yomi', {skill:'Kenjutsu'})]});
      check('TR-YOMI', [await mods(page, 'SKILL', {skillName:'Kenjutsu', traitName:'Agility'}), await mods(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility'}),
        await mods(page, 'SKILL', {skillName:'Iaijutsu', traitName:'Reflexes'}), await mods(page, 'DAMAGE', {skillName:'Kenjutsu'})],
        [[[1, 0, 0]], [[1, 0, 0]], [], []]);
      // No longer a School Skill: kept, flagged, not applied.
      await setup(page, {school:'Isawa Shugenja', adv:[tr('Yomi', {skill:'Kenjutsu'})]});
      const stale = await row(page);
      check('TR-YOMI-STALE', [await mods(page, 'SKILL', {skillName:'Kenjutsu', traitName:'Agility'}), stale.config.skill, stale.flags.some(f => /not one of your School Skills/.test(f))], [[], 'Kenjutsu', true]);
      // Jigoku: Taint Rank, Physical Traits and attacks only, doubled when Lost.
      const J = [['ATTACK', {skillName:'Kenjutsu', traitName:'Agility'}], ['SKILL', {skillName:'Athletics', traitName:'Strength'}],
        ['SKILL', {skillName:'Defense', traitName:'Reflexes'}], ['TRAIT', {traitName:'Stamina'}], ['SKILL', {skillName:'Courtier', traitName:'Awareness'}],
        ['TRAIT', {traitName:'Willpower'}], ['TRAIT', {traitName:'Perception'}], ['RING', {ringName:'Earth'}], ['SPELL', {spellName:'Probe', element:'Fire'}],
        ['DAMAGE', {skillName:'Kenjutsu'}]];
      const jig = async () => { const out = []; for (const [k, c] of J) out.push((await mods(page, k, c)).map(m => m[2])); return out; };
      await setup(page, {adv:[tr('Jigoku', {lost:false})], taint:3});
      check('TR-JIGOKU-SCOPE', await jig(), [[3], [3], [3], [3], [], [], [], [], [], []]);
      await setup(page, {adv:[tr('Jigoku', {lost:true})], taint:3});
      check('TR-JIGOKU-LOST', [(await mods(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility'})), (await row(page)).notes[0]], [[[0, 0, 6]], 'Adding 6 (Taint Rank 3, doubled: Lost).']);
      await setup(page, {adv:[tr('Jigoku', {lost:true})], taint:0});
      const untainted = await row(page);
      check('TR-JIGOKU-NO-TAINT', [await jig(), untainted.flags.some(f => /Requires Shadowlands Taint: your Taint Rank is 0/.test(f)), untainted.badge], [J.map(() => []), true, 'Jigoku']);
      // The declared and reminder realms add nothing on their own.
      const quiet = {};
      for (const realm of ['Gaki-do', 'Maigo no Musha', 'Meido', 'Sakkaku', 'Tengoku', 'Toshigoku', 'Yume-do']) {
        await setup(page, {adv:[tr(realm)], taint:3});
        const all = [];
        for (const [k, c] of J.concat([['SKILL', {skillName:'Animal Handling', traitName:'Awareness'}], ['SKILL', {skillName:'Sincerity', traitName:'Awareness'}]])) all.push(...await mods(page, k, c));
        quiet[realm] = all.length;
      }
      check('TR-NO-STANDING-EFFECT', quiet, {'Gaki-do':0, 'Maigo no Musha':0, Meido:0, Sakkaku:0, Tengoku:0, Toshigoku:0, 'Yume-do':0});
    });

    await section('TR-DECLARED', async () => {
      const where = async realm => { await setup(page, {adv:[tr(realm)]});
        return {sincerity:await offers(page, 'SKILL', {skillName:'Sincerity', traitName:'Awareness'}), courtier:await offers(page, 'SKILL', {skillName:'Courtier', traitName:'Awareness'}),
          willpower:await offers(page, 'TRAIT', {traitName:'Willpower'}), earth:await offers(page, 'RING', {ringName:'Earth'}), air:await offers(page, 'RING', {ringName:'Air'}),
          manual:await offers(page, 'MANUAL', {notation:'3k2'}), attack:await offers(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility'}),
          spell:await offers(page, 'SPELL', {spellName:'Probe', element:'Earth'})}; };
      check('TR-SAKKAKU-WHERE', await where('Sakkaku'), {sincerity:['sakkaku'], courtier:[], willpower:[], earth:[], air:[], manual:[], attack:[], spell:[]});
      check('TR-MEIDO-WHERE', await where('Meido'), {sincerity:['meido'], courtier:['meido'], willpower:['meido'], earth:['meido'], air:['meido'], manual:['meido'], attack:[], spell:[]});
      check('TR-TENGOKU-WHERE', await where('Tengoku'), {sincerity:[], courtier:[], willpower:[], earth:['tengoku'], air:[], manual:[], attack:[], spell:[]});
      check('TR-NOT-WITHOUT-REALM', await where('Chikushudo'), {sincerity:[], courtier:[], willpower:[], earth:[], air:[], manual:[], attack:[], spell:[]});
      // Real dice: ticked adds, unticked does not, and the box starts unticked every roll.
      await setup(page, {adv:[tr('Sakkaku')]});
      const ticked = await roll(page, 'SKILL', {skillName:'Sincerity', traitName:'Awareness', skillRank:2}, [4, 2], ['sakkaku']);
      const plain = await roll(page, 'SKILL', {skillName:'Sincerity', traitName:'Awareness', skillRank:2}, [4, 2]);
      check('TR-SAKKAKU-DICE', [ticked.dice, ticked.kept, plain.boxes, plain.dice, plain.kept], [5, 3, [['sakkaku', false]], 4, 2]);
      await setup(page, {adv:[tr('Tengoku')]});
      const earth = await roll(page, 'RING', {ringName:'Earth', ringValue:3}, [3, 3], ['tengoku']);
      check('TR-TENGOKU-DICE', [earth.dice, earth.kept], [5, 3]);
      await setup(page, {adv:[tr('Meido')]});
      const meido = await roll(page, 'TRAIT', {traitName:'Willpower', traitValue:3}, [3, 3], ['meido']);
      check('TR-MEIDO-DICE', [meido.dice, meido.kept], [5, 3]);
    });

    await section('TR-DICE', async () => {
      await setup(page, {adv:[tr('Chikushudo')]});
      const animal = await roll(page, 'SKILL', {skillName:'Animal Handling', traitName:'Awareness', skillRank:2}, [4, 2]);
      await setup(page, {adv:[tr('Yomi', {skill:'Kenjutsu'})]});
      const yomi = await roll(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility', skillRank:2}, [4, 2]);
      await setup(page, {adv:[tr('Jigoku', {lost:false})], taint:2});
      const jig = await roll(page, 'TRAIT', {traitName:'Strength', traitValue:3}, [3, 3]);
      check('TR-REAL-ROLLS', [[animal.dice, animal.kept], [yomi.dice, yomi.kept], jig.total - jig.keptSum], [[5, 3], [5, 2], 2]);
    });

    await section('TR-LOST-TICK', async () => {
      await setup(page, {adv:[tr('Jigoku', {lost:false})], taint:2});
      await page.locator('#advList .tr4524-lost input').check();
      await page.waitForFunction(() => /Lost/.test(document.querySelector('#advList .tr4524-note')?.textContent || ''));
      const r = await row(page);
      check('TR-LOST-TICK', [r.config, r.lost, r.notes[0], await mods(page, 'TRAIT', {traitName:'Strength'})],
        [cfg('Jigoku', {lost:true}), true, 'Adding 4 (Taint Rank 2, doubled: Lost).', [[0, 0, 4]]]);
    });

    await section('TR-PERSISTENCE', async () => {
      await setup(page, {adv:[tr('Yomi', {skill:'Defense'})]});
      const saved = await page.evaluate(() => window.__L5R_TEST__.collectData());
      await page.locator('#btnSave').evaluate(b => b.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const id = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(id);
      await page.locator('#btnLoad').evaluate(b => b.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('TR-LOCAL-RELOAD', [(await page.evaluate(() => window.__L5R_TEST__.collectData())).adv, (await row(page)).badge], [saved.adv, 'Yomi — Defense']);
    });

    await section('TR-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:760});
        await setup(page, {school:'Isawa Shugenja', adv:[tr('Jigoku', {lost:false})], taint:0});
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const g = await page.evaluate(() => {
          const r = document.querySelector('#advList .tr4524-row');
          const i = document.querySelector('#advList .tr4524-info').getBoundingClientRect();
          const rem = document.querySelector('#advList .tr4524-reminder').getBoundingClientRect();
          const lost = document.querySelector('#advList .tr4524-lost').getBoundingClientRect();
          return {fit:r.scrollWidth <= r.clientWidth + 1, info:i.width >= 28 && i.height >= 28 && Math.abs(i.width - i.height) < 1,
            ownLine:rem.top >= i.bottom - 1, lost:lost.height >= 32 && getComputedStyle(document.querySelector('#advList .tr4524-lost')).textTransform === 'none' && parseFloat(getComputedStyle(document.querySelector('#advList .tr4524-lost')).fontSize) >= 13,
            readable:[...r.querySelectorAll('.tr4524-reminder, .tr4524-flag, .tr4524-note')].every(e => parseFloat(getComputedStyle(e).fontSize) >= 12)};
        });
        await setup(page, {school:'Isawa Shugenja', adv:[{name:NAME, cost:'5', desc:''}]});
        await openPicker(page);
        await page.locator('#advConfigGrid input[value="Yomi"]').check();
        const picker = await page.evaluate(() => { const grid = document.getElementById('advConfigGrid');
          const opts = [...grid.querySelectorAll('.tr4524-option')];
          return grid.scrollWidth <= grid.clientWidth + 1 && opts.every(o => o.getBoundingClientRect().height >= 32 && getComputedStyle(o).textTransform === 'none') &&
            document.getElementById('tr4524Skill').getBoundingClientRect().height >= 32; });
        await page.evaluate(() => window.__L5R_TEST__.closeAdvConfigModal());
        check('TR-GEOMETRY-' + width, {...g, picker}, {fit:true, info:true, ownLine:true, lost:true, readable:true, picker:true});
      }
      await page.setViewportSize({width:375, height:812});
    });

    check('TR-BROWSER-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
}
main().catch(error => check('TR-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  console.log('TR4524_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length && passed === results.length ? 0 : 1;
});
