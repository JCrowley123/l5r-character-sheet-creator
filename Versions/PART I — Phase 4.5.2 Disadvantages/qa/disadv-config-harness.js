/*
 * Phase 4.5.2 Disadvantages — browser validation companion to the two existing
 * Phase 4.5 suites. Numbers below are independent approved-rules oracles.
 * Run: NODE_PATH=<modules> L5R_CHROME=<Chrome> node this-file.js <sheet.html>
 * The input build is never changed. Each fixture uses a disposable browser page.
 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');
const results = [];
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.keys(value).sort().reduce((o, k) => { o[k] = canonical(value[k]); return o; }, {}) : value;
function record(id, name, pass, detail = '') {
  results.push({ id, name, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
}
function equal(id, name, actual, expected) {
  const pass = JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
  record(id, name, pass, pass ? '' : `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}
async function section(id, name, fn) {
  try { await fn(); } catch (error) { record(id, name, false, String(error.stack || error)); }
}
const TENETS = { Control: 4, Determination: 6, Insight: 4, Knowledge: 4, Perfection: 5, Strength: 5, Will: 4 };
const BUSHIDO = { Compassion: 3, Courage: 4, Courtesy: 4, Duty: 6, Honesty: 3, Honor: 3, Sincerity: 4 };
const SOCIAL_SKILLS = ['Acting', 'Courtier', 'Etiquette', 'Perform', 'Sincerity', 'Intimidation', 'Temptation'];
const TIERED = { Antisocial: [2, 4], 'Cast Out': [1, 3], Compulsion: [2, 3, 4], Obligation: [3, 6] };
const configs = {
  Antisocial: { type: 'tierPick', tier: 4, value: '4' },
  Blackmailed: { type: 'statusLinked', value: 'Status' },
  'Cast Out': { type: 'tierPick', tier: 3, value: '3' },
  Compulsion: { type: 'tierPick', tier: 4, value: '4' },
  Consumed: { type: 'tenetPick', tenet: 'Control', value: 'Control' },
  'Elemental Imbalance': { type: 'elementPick', rank: 3, element: 'Fire', value: 'Fire' },
  'Enlightened Madness': { type: 'targetPick', tier: 6, targetType: 'Ring', target: 'Fire', value: 'Fire' },
  'Failure of Bushido': { type: 'tenetPick', tenet: 'Courage', value: 'Courage' },
  Obligation: { type: 'tierPick', tier: 6, value: '6' },
  Phobia: { type: 'toggleModifier', rank: 2, active: false, value: 'Rank 2' },
  'Sworn Enemy': { type: 'insightDifferencePick', target: 'Bayushi Aiko', difference: 3, nemesis: true, active: false, value: 'Bayushi Aiko' },
};
const reset = page => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  if (T.D45.gates) T.D45.gates.cancel();
  T.resetToBaseline(); T.recalcAll();
  ['advConfigModalOverlay', 'rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay'].forEach(id => {
    const element = document.getElementById(id); if (element) element.style.display = 'none';
  });
});
const identity = (page, fields) => page.evaluate(fields => {
  Object.entries(fields).forEach(([id, value]) => {
    const input = document.getElementById(id); if (!input) throw new Error(`missing identity input ${id}`);
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}, fields);
const fixture = (page, name, config) => page.evaluate(({ name, config }) => {
  const T = window.__L5R_TEST__;
  const select = document.getElementById('disadvQuickAdd');
  if (!Array.from(select.options).some(o => o.value === name)) throw new Error(`missing library entry ${name}`);
  select.value = name; select.dispatchEvent(new Event('change', { bubbles: true }));
  const overlay = document.getElementById('advConfigModalOverlay');
  if (overlay.style.display !== 'none') document.getElementById('advConfigX').click();
  const row = document.querySelector('#disadvList .entry:last-child');
  if (config) T.writeAdvConfig(row, config.type, config);
  T.recalcAll();
  return Array.from(document.querySelectorAll('#disadvList .entry')).indexOf(row);
}, { name, config });
const rowSnapshot = (page, index = 0) => page.evaluate(index => {
  const entry = document.querySelectorAll('#disadvList .entry')[index];
  return entry && {
    name: entry.querySelector('.en-name').value, cost: Number(entry.querySelector('.en-cost').value),
    text: entry.textContent.replace(/\s+/g, ' ').trim(),
    config: entry.dataset.advConfig ? JSON.parse(entry.dataset.advConfig) : null,
    unconfigured: !!entry.querySelector('.unconfigured'),
  };
}, index);
const resolve = (page, name, config) => page.evaluate(({ name, config }) => window.__L5R_TEST__.D45.resolve(name, config), { name, config });
const modifiers = (page, kind, extra = {}) => page.evaluate(({ kind, extra }) => {
  const T = window.__L5R_TEST__;
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], extra)).filter(m => m.source === 'adv-config')
    .map(m => ({ label: m.label, rolled: m.rolledDelta, kept: m.keptDelta, total: m.totalDelta, informational: m.informational, note: m.note }));
}, { kind, extra });
const xp = page => page.evaluate(() => Number(document.getElementById('f_xpSpent').value));
const visible = (page, id) => page.evaluate(id => {
  const element = document.getElementById(id); return !!element && element.style.display !== 'none';
}, id);

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node disadv-config-harness.js <sheet.html>');
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    const errors = []; page.on('pageerror', error => errors.push(String(error && error.stack || error)));
    await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'commit' });
    await page.waitForFunction(() => !!window.__L5R_TEST__, null, { timeout: 30000 });
    const present = await page.evaluate(() => !!window.__L5R_TEST__.D45 && window.__L5R_TEST__.D45.enabled());
    record('D45-00', 'Disadvantages point release is present and enabled', present);
    if (!present) return;
    equal('D45-SCHEMA-CONTRACT', 'Point-release exposes explicit save schema version 3',
      await page.evaluate(() => window.__L5R_TEST__.D45.SAVE_SCHEMA_VERSION), 3);
    // CROSS-PHASE FIXTURE CORRECTION, Part I Feature 4.5.10 (Cursed by the Realm), declared in
    // that phase's ROLLBACK.md. This assertion used to pin configTypes to a CONSTANT twelve-entry
    // array, and Feature 4.5.8's ROLLBACK concluded from that that no later phase could ever add a
    // type string, since no single expected value passes both with a phase present and removed.
    // That is true of a constant expected value and false of a CONDITIONAL one: Phase 1.5 (Part G)
    // had already solved this exact class of problem by making its registry-length check
    // conditional on Phase 4.5 being present, on the project owner's ruling that an audit check
    // exists to notice a change rather than forbid it. The same shape is applied here, so this
    // check reads identically with Feature 4.5.10 in the build and with it surgically removed.
    // The twelve below remain this point release's own contract and are unchanged.
    const D45_BASE_TYPES = ['tierPick','rankPick','elementPick','tenetPick','targetPick','insightDifferencePick',
      'toggleModifier','statusLinked','dualTierPick','languagePick','skillPick','clanWeaponAutoPick'];
    const realmPickPresent = await page.evaluate(() => typeof window.__L5R_TEST__.R4510 === 'object'
      && !!window.__L5R_TEST__.R4510);
    equal('D45-SCHEMA-TYPES', 'Point-release advertises both new and retained configuration shapes',
      await page.evaluate(() => window.__L5R_TEST__.D45.configTypes),
      realmPickPresent ? D45_BASE_TYPES.concat('realmPick') : D45_BASE_TYPES);
    const registryBefore = await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));

    await section('D45-XP', 'Independent refund oracles', async () => {
      await reset(page);
      for (const [name, tiers] of Object.entries(TIERED)) {
        for (const tier of tiers) equal(`D45-XP-${name}-${tier}`, `${name} ${tier}-point refund`,
          (await resolve(page, name, { type: 'tierPick', tier, value: String(tier) }))?.cost, tier);
      }
      await identity(page, { f_clan: 'Crab' });
      equal('D45-XP-CRAB', 'Antisocial Crab refund is 3/5', await Promise.all([2, 4].map(async tier =>
        (await resolve(page, 'Antisocial', { type: 'tierPick', tier, value: String(tier) }))?.cost)), [3, 5]);
      for (const clan of ['', 'Crane', 'Spider']) {
        await identity(page, { f_clan: clan, f_school: 'Isawa Shugenja' });
        const actual = [];
        for (const tenet of Object.keys(TENETS)) actual.push((await resolve(page, 'Consumed', {
          type: 'tenetPick', tenet, value: tenet, ...(tenet === 'Insight' ? { skill: 'Meditation' } : {}),
        }))?.cost);
        equal(`D45-XP-CONSUMED-${clan || 'other'}`, `Consumed exact refunds for ${clan || 'other Clan'}`,
          actual, Object.entries(TENETS).map(([tenet, base]) => clan === 'Spider' ? base + 1 : clan === 'Crane' && tenet === 'Perfection' ? 6 : base));
      }
      for (const [school, bonus] of [['Isawa Shugenja', 0], ['Shosuro Infiltrator [Ninja]', 1]]) {
        await identity(page, { f_school: school, f_clan: 'Scorpion' });
        const actual = [];
        for (const tenet of Object.keys(BUSHIDO)) actual.push((await resolve(page, 'Failure of Bushido', { type: 'tenetPick', tenet, value: tenet }))?.cost);
        equal(`D45-XP-BUSHIDO-${bonus}`, `Failure of Bushido ${bonus ? 'Ninja adjustment' : 'base refunds'}`,
          actual, Object.values(BUSHIDO).map(value => value + bonus));
      }
      await identity(page, { f_school: 'Isawa Shugenja', f_clan: 'Phoenix', f_schoolDeficiencyElement: '' });
      for (const rank of [1, 3, 25, 101]) {
        const effect = await resolve(page, 'Elemental Imbalance', { type: 'elementPick', rank, element: 'Fire', value: 'Fire' });
        equal(`D45-XP-IMBALANCE-${rank}`, `Elemental Imbalance rank ${rank}: refund and TN`, effect && [effect.cost, effect.tn], [2 * rank, 15 + 5 * rank]);
      }
      for (const rank of [1, 2, 3]) equal(`D45-XP-PHOBIA-${rank}`, `Phobia rank ${rank} refund`,
        (await resolve(page, 'Phobia', { type: 'toggleModifier', rank, active: false, value: `Rank ${rank}` }))?.cost, rank);
      for (const difference of [0, 1, 7, 25]) {
        for (const nemesis of [false, true]) equal(`D45-XP-ENEMY-${difference}-${nemesis}`, 'Sworn Enemy difference and purchased Nemesis refund',
          (await resolve(page, 'Sworn Enemy', { ...configs['Sworn Enemy'], difference, nemesis, active: false }))?.cost, 3 + difference + (nemesis ? 2 : 0));
      }
      equal('D45-XP-MADNESS', 'Madness refund and Willpower TN', await Promise.all([4, 6].map(async tier => {
        const effect = await resolve(page, 'Enlightened Madness', { ...configs['Enlightened Madness'], tier }); return effect && [effect.cost, effect.tn];
      })), [[4, 20], [6, 30]]);
    });

    await section('D45-DYNAMIC', 'Live identity inputs and XP totals', async () => {
      await reset(page); await identity(page, { f_clan: 'Crane' });
      const before = await xp(page); await fixture(page, 'Antisocial', configs.Antisocial);
      equal('D45-DYNAMIC-01', 'Antisocial refund reaches the unrelated XP total', await xp(page) - before, -4);
      await identity(page, { f_clan: 'Crab' });
      equal('D45-DYNAMIC-02', 'One native Clan edit updates cost and XP without test-driven recalc',
        [(await rowSnapshot(page)).cost, await xp(page) - before], [5, -5]);
      await identity(page, { f_clan: 'Crane' });
      equal('D45-DYNAMIC-03', 'Clan refund reverses without stale totals', [(await rowSnapshot(page)).cost, await xp(page) - before], [4, -4]);
      await reset(page); const blackBefore = await xp(page); await fixture(page, 'Blackmailed');
      for (const rank of [1, 4, 0, 6]) {
        await identity(page, { f_statusRank: rank });
        equal(`D45-DYNAMIC-STATUS-${rank}`, `Status ${rank} updates Blackmailed and total immediately`,
          [(await rowSnapshot(page)).cost, await xp(page) - blackBefore], [rank, -rank]);
      }
      record('D45-DYNAMIC-04', 'Blackmailed stores its Status linkage', (await rowSnapshot(page)).config?.type === 'statusLinked');
    });

    await section('D45-CONFIG', 'Configuration validation boundaries', async () => {
      await reset(page); await identity(page, { f_school: 'Isawa Shugenja', f_schoolDeficiencyElement: '' });
      for (const [name, config] of Object.entries(configs)) {
        equal(`D45-CONFIG-${name}`, `${name} has the required configuration type`, await page.evaluate(name => window.__L5R_TEST__.D45.schema(name)?.type, name), config.type);
        if (name !== 'Blackmailed') {
          equal(`D45-CONFIG-EMPTY-${name}`, `${name} rejects absent configuration`, await resolve(page, name, null), null);
          equal(`D45-CONFIG-UNKNOWN-${name}`, `${name} rejects unknown type`, await resolve(page, name, { ...config, type: 'unknownFutureType' }), null);
        }
      }
      for (const rank of ['', 'abc', '3.5', '0', '-1', 'Infinity', 'NaN', '3cats']) equal(`D45-CONFIG-RANK-${rank || 'empty'}`,
        'Elemental Imbalance rejects invalid rank', await resolve(page, 'Elemental Imbalance', { ...configs['Elemental Imbalance'], rank }), null);
      await identity(page, { f_school: 'Kakita Bushi [Bushi]' });
      equal('D45-CONFIG-NONCASTER', 'Elemental Imbalance enforces Shugenja only', await resolve(page, 'Elemental Imbalance', configs['Elemental Imbalance']), null);
      await identity(page, { f_school: 'Isawa Shugenja', f_schoolDeficiencyElement: 'Fire' });
      equal('D45-CONFIG-DEFICIENCY', 'Elemental Imbalance rejects a deficient element', await resolve(page, 'Elemental Imbalance', configs['Elemental Imbalance']), null);
      for (const difference of [-1, 1.5, '', '2x']) equal(`D45-CONFIG-DIFF-${difference}`, 'Sworn Enemy rejects invalid difference',
        await resolve(page, 'Sworn Enemy', { ...configs['Sworn Enemy'], difference }), null);
      equal('D45-CONFIG-ENEMY-NAME', 'Sworn Enemy requires a nonblank named enemy', await resolve(page, 'Sworn Enemy', { ...configs['Sworn Enemy'], target: '   ' }), null);
      equal('D45-CONFIG-INSIGHT-SKILL', 'Consumed Insight requires a School Skill', await resolve(page, 'Consumed', { type: 'tenetPick', tenet: 'Insight', value: 'Insight' }), null);
    });

    await section('D45-REMINDERS', 'Narrative and informational rules', async () => {
      for (const tier of [2, 3, 4]) {
        await reset(page); await fixture(page, 'Compulsion', { type: 'tierPick', tier, value: String(tier) });
        const text = (await rowSnapshot(page)).text;
        record(`D45-REMINDER-COMPULSION-${tier}`, `Compulsion ${tier}: complete current Willpower reminder`,
          /Willpower/i.test(text) && new RegExp(`TN\\s*:?\\s*${5 + 5 * tier}\\b`).test(text) && /overcome|resist/i.test(text), text);
        equal(`D45-REMINDER-COMPULSION-NUMERIC-${tier}`, 'Compulsion never adds automatic numeric roll penalties',
          (await modifiers(page, 'SKILL', { skillName: 'Meditation' })).filter(m => m.rolled || m.kept || m.total), []);
      }
      await reset(page); await fixture(page, 'Cast Out', configs['Cast Out']);
      record('D45-REMINDER-CASTOUT', 'Cast Out displays Glory-as-Infamy without altering Glory', /Glory.*Infamy/i.test((await rowSnapshot(page)).text));
    });

    await section('D45-ANTISOCIAL', 'Authoritative Social Skill targeting', async () => {
      equal('D45-SOCIAL-LIST', 'Antisocial exposes the authoritative seven-skill list',
        await page.evaluate(() => window.__L5R_TEST__.D45.socialSkills), SOCIAL_SKILLS);
      await reset(page); await fixture(page, 'Antisocial', { type:'tierPick', tier:2, value:'2' });
      const rank2 = await Promise.all(SOCIAL_SKILLS.map(async skill =>
        (await modifiers(page, 'SKILL', { skillName:skill })).filter(m => m.label === 'Antisocial').map(m => [m.rolled, m.kept])));
      equal('D45-SOCIAL-RANK2', 'Antisocial 2-point penalty affects every listed Social Skill', rank2, SOCIAL_SKILLS.map(() => [[-1, 0]]));
      await reset(page); await fixture(page, 'Antisocial', { type:'tierPick', tier:4, value:'4' });
      const rank4 = await Promise.all(SOCIAL_SKILLS.map(async skill =>
        (await modifiers(page, 'SKILL', { skillName:skill })).filter(m => m.label === 'Antisocial').map(m => [m.rolled, m.kept])));
      equal('D45-SOCIAL-RANK4', 'Antisocial 4-point penalty affects every listed Social Skill', rank4, SOCIAL_SKILLS.map(() => [[-1, -1]]));
      await reset(page); await fixture(page, 'Antisocial', configs.Antisocial);
      equal('D45-SOCIAL-BOUNDARY', 'Antisocial leaves non-Social Skills unchanged and has no pending-list warning', {
        nonSocial: (await modifiers(page, 'SKILL', { skillName:'Meditation' })).filter(m => m.label === 'Antisocial'),
        pending: /pending|authoritative list/i.test((await rowSnapshot(page)).text),
      }, { nonSocial:[], pending:false });
    });

    await section('D45-PHOBIA', 'Independent Phobia toggle and damage exclusion', async () => {
      await reset(page); await fixture(page, 'Phobia', configs.Phobia);
      equal('D45-PHOBIA-OFF', 'Inactive Phobia has no roll penalty', (await modifiers(page, 'SKILL', { skillName: 'Meditation' })).filter(m => /Phobia/i.test(m.label)), []);
      await page.evaluate(() => document.querySelector('#disadvList .d45-toggle').click());
      record('D45-PHOBIA-UI', 'Phobia toggle persists active state in its own row', (await rowSnapshot(page)).config.active === true);
      for (const kind of ['SKILL', 'ATTACK', 'SPELL', 'TRAIT', 'RING', 'INITIATIVE', 'MANUAL']) {
        const mods = (await modifiers(page, kind, { skillName: 'Meditation', traitName: 'Willpower', element: 'Fire', ringName: 'Fire' })).filter(m => /Phobia/i.test(m.label));
        equal(`D45-PHOBIA-${kind}`, `Active Phobia applies rank × 5 to ${kind}`, mods.map(m => [m.rolled, m.kept, m.total]), [[0, 0, -10]]);
      }
      equal('D45-PHOBIA-DAMAGE', 'Phobia explicitly excludes the damage context', (await modifiers(page, 'DAMAGE')).filter(m => /Phobia/i.test(m.label)), []);
      await page.evaluate(() => document.querySelector('#disadvList .d45-toggle').click());
      equal('D45-PHOBIA-REVERSE', 'Turning Phobia off removes its effect immediately', (await modifiers(page, 'MANUAL')).filter(m => /Phobia/i.test(m.label)), []);
    });

    await section('D45-NEMESIS', 'Purchased Nemesis and situational Void suppression', async () => {
      await reset(page); await fixture(page, 'Sworn Enemy', configs['Sworn Enemy']);
      const cost = (await rowSnapshot(page)).cost;
      record('D45-NEMESIS-BADGE', 'Named enemy badge retains the complete target', (await rowSnapshot(page)).text.includes('Bayushi Aiko'));
      await page.evaluate(() => document.querySelector('#disadvList .d45-toggle').click());
      equal('D45-NEMESIS-COST', 'Situational activity does not alter purchased refund', (await rowSnapshot(page)).cost, cost);
      const voidState = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.setCombatActive(true); T.resetCombatRound();
        const keys = T.VOID_SPEND_LIBRARY.map(o => o.key || o.id);
        return keys.map(key => ({ key, allowed: T.canSpendVoid(key) }));
      });
      record('D45-NEMESIS-POLICY', 'Every Void spending option is suppressed while Nemesis is active', voidState.length > 0 && voidState.every(o => o.allowed === false || o.allowed?.ok === false), JSON.stringify(voidState));
      await page.evaluate(() => document.querySelector('#disadvList .d45-toggle').click());
      record('D45-NEMESIS-OFF', 'Nemesis can be deactivated independently of its purchase', (await rowSnapshot(page)).config.nemesis === true && (await rowSnapshot(page)).config.active === false);
    });

    await section('D45-GATES', 'Isolated Willpower gates and nested resource policy', async () => {
      equal('D45-GATE-POLICY', 'Willpower gates keep Luck and Void spending available as nested options',
        await page.evaluate(() => window.__L5R_TEST__.D45.gates && window.__L5R_TEST__.D45.gates.policy),
        { nestedLuck:true, nestedVoid:true });
      equal('D45-GATE-MAHO', 'Elemental Imbalance does not gate Maho casting',
        await page.evaluate(() => {
          const T = window.__L5R_TEST__;
          T.resetToBaseline();
          document.getElementById('f_school').value = 'Isawa Shugenja';
          document.getElementById('f_schoolDeficiencyElement').value = '';
          T.recalcAll();
          T.writeAdvConfig((() => { const s=document.getElementById('disadvQuickAdd'); s.value='Elemental Imbalance'; s.dispatchEvent(new Event('change',{bubbles:true})); return document.querySelector('#disadvList .entry:last-child'); })(), 'elementPick', { type:'elementPick', rank:1, element:'Fire', value:'Fire' });
          T.recalcAll();
          return T.D45.gates.matching(T.makeRollContext(T.ROLL_KINDS.SPELL, { element:'Fire', maho:true })).length;
        }), 0);

      // A gate's resistance check is a real nested use of the existing preview/result flow.
      // The browser drives both overlays so this covers ordering, narrative failure handling,
      // and the fact that Elemental Imbalance still runs the parent spell roll afterwards.
      await reset(page);
      await identity(page, { f_school:'Isawa Shugenja', f_schoolDeficiencyElement:'' });
      await fixture(page, 'Elemental Imbalance', configs['Elemental Imbalance']);
      await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        document.getElementById('trait_willpower').value = '4';
        document.getElementById('ring_fire').value = '4';
        document.getElementById('spell_used_fire').value = '1';
        window.__d45GateRandom = Math.random; Math.random = () => 0;
        const context = T.makeRollContext(T.ROLL_KINDS.SPELL, { spellName:'Elemental gate smoke', element:'Fire', maho:false });
        window.__d45GatePromise = T.D45.gates.roll('Elemental gate smoke', context, 4, 4, { skipPreview:true, explode:false });
      });
      try {
        await page.waitForFunction(() => document.getElementById('rollPreviewOverlay')?.style.display === 'flex');
        await page.locator('#rollPreviewGo').click();
        await page.waitForFunction(() => document.getElementById('rollModalOverlay')?.style.display === 'flex');
        await page.locator('#rollModalClose').click();
        await page.waitForFunction(() => document.getElementById('appConfirmOverlay')?.style.display === 'flex');
        const notice = await page.locator('#appConfirmMsg').textContent();
        record('D45-GATE-ELEMENTAL-FAIL', 'Failed Elemental Imbalance gate reports the narrative warning', /Elemental Imbalance.*Willpower|failed.*Willpower/i.test(notice));
        await page.locator('#appConfirmX').click();
        await page.waitForFunction(() => document.getElementById('rollModalOverlay')?.style.display === 'flex');
        const parentTitle = await page.locator('#rollModalTitle').textContent();
        record('D45-GATE-ELEMENTAL-CONTINUE', 'Elemental Imbalance failure leaves the parent spell roll proceeding', /Elemental gate smoke/.test(parentTitle));
        await page.locator('#rollModalClose').click();
        await page.evaluate(() => window.__d45GatePromise);
      } finally {
        await page.evaluate(() => { if(window.__d45GateRandom) { Math.random = window.__d45GateRandom; delete window.__d45GateRandom; } });
      }

      // The approved gate contract keeps the ordinary preview's nested resource choices.  A
      // passing resistance check must therefore expose the existing Void option before the
      // check roll and the existing Luck whole-roll action after it, without adding a second
      // resource system to the gate fragment.
      await reset(page);
      await identity(page, { f_school:'Isawa Shugenja', f_schoolDeficiencyElement:'' });
      await fixture(page, 'Elemental Imbalance', configs['Elemental Imbalance']);
      await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const luck = T.makeEntry({ name:'Luck', cost:'3', desc:'' }, true, 'XP');
        document.getElementById('advList').appendChild(luck);
        T.writeAdvConfig(luck, 'rankPick', { type:'rankPick', value:'Rank 1', rank:1, remaining:1 });
        document.getElementById('trait_willpower').value = '5';
        document.getElementById('ring_fire').value = '4';
        document.getElementById('void_current').value = '1';
        // A mid-range value passes the TN without repeatedly exploding 10s in the gate's
        // deliberately isolated roll (the gate only needs a deterministic pass here).
        window.__d45NestedRandom = Math.random; Math.random = () => 0.5;
        const context = T.makeRollContext(T.ROLL_KINDS.SPELL, { spellName:'Nested gate smoke', element:'Fire', maho:false });
        window.__d45NestedPromise = T.D45.gates.roll('Nested gate smoke', context, 5, 5, { skipPreview:true, explode:false });
      });
      try {
        await page.waitForFunction(() => document.getElementById('rollPreviewOverlay')?.style.display === 'flex');
        record('D45-GATE-NESTED-VOID', 'Willpower preview retains the existing Void-spend options',
          await page.locator('#rollPreviewBody [data-void-key="k1"]').count() === 1);
        await page.locator('#rollPreviewGo').click();
        await page.waitForFunction(() => document.getElementById('rollModalOverlay')?.style.display === 'flex');
        record('D45-GATE-NESTED-LUCK', 'Willpower result retains the existing Luck action',
          await page.locator('#rollModalBody .adv-config-spend-luck:not([disabled])').count() === 1);
        await page.locator('#rollModalClose').click();
        await page.waitForFunction(() => document.getElementById('rollModalOverlay')?.style.display === 'flex');
        await page.locator('#rollModalClose').click();
        await page.evaluate(() => window.__d45NestedPromise);
      } finally {
        await page.evaluate(() => { if(window.__d45NestedRandom) { Math.random = window.__d45NestedRandom; delete window.__d45NestedRandom; } });
      }

      // Enlightened Madness is the cancellation boundary. The spell slot is set to the
      // already-consumed state before the action is invoked; a failed gate must not restore it.
      await reset(page);
      await identity(page, { f_school:'Isawa Shugenja', f_schoolDeficiencyElement:'' });
      await fixture(page, 'Enlightened Madness', configs['Enlightened Madness']);
      await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        document.getElementById('trait_willpower').value = '4';
        document.getElementById('ring_fire').value = '4';
        document.getElementById('spell_used_fire').value = '1';
        window.__d45GateRandom = Math.random; Math.random = () => 0;
        T.performSpellCastRoll('fire', 'Fire', 'Madness gate smoke', 1, []);
      });
      try {
        await page.waitForFunction(() => document.getElementById('rollPreviewOverlay')?.style.display === 'flex');
        await page.locator('#rollPreviewGo').click();
        await page.waitForFunction(() => document.getElementById('rollModalOverlay')?.style.display === 'flex');
        await page.locator('#rollModalClose').click();
        await page.waitForFunction(() => document.getElementById('appConfirmOverlay')?.style.display === 'flex');
        const notice = await page.locator('#appConfirmMsg').textContent();
        record('D45-GATE-MADNESS-FAIL', 'Failed Enlightened Madness gate reports cancellation and GM control', /Enlightened Madness|GM controls/i.test(notice));
        await page.locator('#appConfirmX').click();
        await page.waitForFunction(() => !document.getElementById('appConfirmOverlay') || document.getElementById('appConfirmOverlay').style.display === 'none');
        await page.waitForTimeout(25);
        const state = await page.evaluate(() => ({ slot:document.getElementById('spell_used_fire').value,
          rollOpen:document.getElementById('rollModalOverlay')?.style.display === 'flex', busy:window.__L5R_TEST__.D45.gates.busy() }));
        equal('D45-GATE-MADNESS-SLOT', 'Failed Enlightened Madness does not refund the consumed spell slot', state.slot, '1');
        record('D45-GATE-MADNESS-CANCEL', 'Failed Enlightened Madness cancels the parent action', !state.rollOpen && !state.busy, JSON.stringify(state));
      } finally {
        await page.evaluate(() => { if(window.__d45GateRandom) { Math.random = window.__d45GateRandom; delete window.__d45GateRandom; } });
      }
    });

    await section('D45-SAVE', 'All configurations persist with explicit migration', async () => {
      await reset(page); await identity(page, { f_school: 'Isawa Shugenja', f_clan: 'Phoenix', f_schoolDeficiencyElement: '' });
      for (const [name, config] of Object.entries(configs)) await fixture(page, name, config);
      const roundtrip = await page.evaluate(() => {
        const T = window.__L5R_TEST__; T.recalcAll();
        const first = JSON.parse(JSON.stringify(T.collectData())); T.resetToBaseline(); T.applyData(first); T.recalcAll();
        const second = JSON.parse(JSON.stringify(T.collectData()));
        return { version: first.schemaVersion, first: first.disadv, second: second.disadv, top: Object.keys(second), text: JSON.stringify(second) };
      });
      record('D45-SAVE-VERSION', 'Save schema advances beyond version 2', roundtrip.version > 2, String(roundtrip.version));
      equal('D45-SAVE-CONFIGS', 'All eleven configs round-trip through JSON and sheet load', roundtrip.second, roundtrip.first);
      record('D45-SAVE-TRANSIENT', 'Willpower gate history and activity are not serialized', !/"(?:gateHistory|willpowerHistory|gateBusy|pendingGate)"/.test(roundtrip.text));
      await reset(page); await fixture(page, 'Phobia', { ...configs.Phobia, active: true }); await fixture(page, 'Sworn Enemy', { ...configs['Sworn Enemy'], active: true });
      const toggles = await page.evaluate(() => { const T = window.__L5R_TEST__; const save = JSON.parse(JSON.stringify(T.collectData())); T.applyData(save); return T.collectData().disadv.map(d => d.config.active); });
      equal('D45-SAVE-TOGGLES', 'Phobia and Nemesis activity persist', toggles, [true, true]);
      await reset(page); await fixture(page, 'Compulsion', { ...configs.Compulsion, type: 'futureUnknownConfiguration' });
      const unknown = await rowSnapshot(page);
      record('D45-SAVE-UNKNOWN', 'Unknown configuration is visible and gives no silent refund', unknown.unconfigured && unknown.cost === 0 && /unknown|unrecogn|unsupported|invalid|needs/i.test(unknown.text), JSON.stringify(unknown));
    });

    await section('D45-UI', 'Modal opening, cancellation, and accessible viewport', async () => {
      await reset(page); await identity(page, { f_school: 'Isawa Shugenja', f_schoolDeficiencyElement: '' });
      for (const name of Object.keys(configs).filter(name => name !== 'Blackmailed')) {
        const index = await fixture(page, name);
        equal(`D45-UI-UNCONFIGURED-${name}`, `${name} is visibly unconfigured after cancellation`, (await rowSnapshot(page, index)).unconfigured, true);
        await page.evaluate(index => document.querySelectorAll('#disadvList .entry')[index].querySelector('.adv-config-btn').click(), index);
        record(`D45-UI-OPEN-${name}`, `${name} opens the existing configuration overlay`, await visible(page, 'advConfigModalOverlay'));
        await page.evaluate(() => document.getElementById('advConfigX').click());
        equal(`D45-UI-CLOSE-${name}`, `${name} closes cleanly`, await visible(page, 'advConfigModalOverlay'), false);
      }
      await page.setViewportSize({ width: 375, height: 812 });
      await page.evaluate(() => document.querySelector('#disadvList .adv-config-btn').click());
      const geometry = await page.evaluate(() => {
        const modal = document.getElementById('advConfigModalOverlay');
        return Array.from(modal.querySelectorAll('button,input,label')).filter(n => n.getClientRects().length).map(n => {
          const r = n.getBoundingClientRect(); return { text: n.textContent.trim(), left: r.left, right: r.right };
        }).filter(r => r.left < -1 || r.right > innerWidth + 1);
      });
      equal('D45-UI-PHONE', 'Visible modal controls fit the 375px viewport', geometry, []);
      await page.evaluate(() => document.getElementById('advConfigX').click());
      await page.setViewportSize({ width: 1280, height: 960 });
    });

    const registryAfter = await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));
    equal('D45-REGISTRY-01', 'The suite leaves every pre-existing registry entry unchanged', registryAfter, registryBefore);
    equal('D45-REGISTRY-02', 'The expansion uses the one existing adv-config registry seat', registryAfter.filter(m => m[0] === 'adv-config'), [['adv-config', 60]]);
    record('D45-ERRORS', 'No uncaught browser errors', errors.length === 0, errors.join('\n'));
  } finally { await browser.close(); }
}
main().catch(error => record('D45-FATAL', 'Harness initialization', false, String(error.stack || error))).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.table(results.filter(r => !r.pass));
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('D45_QA_RESULT=' + JSON.stringify({ total: results.length, passed, failed: results.length - passed, results }));
  process.exitCode = passed === results.length ? 0 : 1;
});
