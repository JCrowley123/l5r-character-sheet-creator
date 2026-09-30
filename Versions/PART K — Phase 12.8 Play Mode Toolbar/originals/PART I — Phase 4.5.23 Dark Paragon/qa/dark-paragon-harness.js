/* Real-browser acceptance tests for Dark Paragon (A03, Feature 4.5.23).
 * Oracles from Core p.147 as recorded in SOURCE-CORE-PREPARATION.md and the owner's rulings of
 * 23 September 2026 (audit "A03 decisions"), never from DP4523: 5 XP, 4 for Spider; once per
 * session; 5 Honor points (0.5 on the Points field), a Void Point only without them; the four
 * rerolls keep the REROLL with +5; Determination negates the Wound penalty with no +5. Dice are
 * counted on real rolls; the Wound penalty is read from the trunk's own getWoundPenalty().
 * node dark-paragon-harness.js <sheet.html>
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
const NAME = 'Dark Paragon';
// Core p.147, printed order: [precept, kind of effect].
const PRECEPTS = [['Control', 'reroll'], ['Determination', 'declare'], ['Insight', 'reroll'], ['Knowledge', 'reroll'],
  ['Perfection', 'manual'], ['Strength', 'reroll'], ['Will', 'manual']];
const OPERATION = {Control:/Reroll any Social Skill Roll/, Determination:/Negate every TN and Wound penalty/,
  Insight:/Reroll a roll that used Awareness/, Knowledge:/Reroll a roll that used Intelligence/,
  Perfection:/one chosen die on a Skill Roll explode/, Strength:/Reroll any damage roll/, Will:/Negate 10 Wounds/};
const cfg = (precept, remaining = 1) => ({type:'darkParagon', revision:1, precept, value:precept, remaining});
const dp = (precept, remaining = 1, cost = '5') => ({name:NAME, cost, desc:'', config:cfg(precept, remaining)});

async function setup(page, {clan = '', adv = [], disadv = [], honor = '5.0', voids = 2, wounds = 0, combat = false} = {}) {
  await page.evaluate(({clan, adv, disadv, honor, voids, wounds, combat}) => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    document.querySelectorAll('#weaponsBody tr').forEach(tr => tr.remove());
    document.getElementById('f_clan').value = clan;
    T.applyData(Object.assign(T.collectData(), {adv, disadv}));
    document.getElementById('f_honorPts').value = honor;
    document.getElementById('void_current').value = String(voids); T.renderVoidPips();
    document.getElementById('f_woundsTaken').value = String(wounds);
    T.setCombatActive(combat);
    T.recalcAll();
  }, {clan, adv, disadv, honor, voids, wounds, combat});
}
const state = page => page.evaluate(() => {
  const d = document.querySelector('#advList .entry');
  return {honor:document.getElementById('f_honorPts').value, rank:document.getElementById('f_honorRank').value,
    voids:window.__L5R_TEST__.getVoidPoints(), config:d && d.dataset.advConfig ? JSON.parse(d.dataset.advConfig) : null};
});
const row = (page, list = 'advList') => page.evaluate(list => {
  const d = document.querySelector('#' + list + ' .entry');
  return d ? {cost:Number(d.querySelector('.en-cost').value), config:d.dataset.advConfig ? JSON.parse(d.dataset.advConfig) : null,
    badge:d.querySelector('.dp4523-badge')?.textContent || '', warn:d.querySelector('.dp4523-warning')?.textContent || '',
    reminder:d.querySelector('.dp4523-reminder')?.textContent || '', state:d.querySelector('.dp4523-state')?.textContent || '',
    use:d.querySelector('.dp4523-use') ? {text:d.querySelector('.dp4523-use').textContent, disabled:d.querySelector('.dp4523-use').disabled} : null,
    reset:!!d.querySelector('.dp4523-reset')} : null;
}, list);

// A real roll through the preview; resolves once the result modal is drawn.
async function roll(page, kind, ctx, base, {tick = false, answer = null} = {}) {
  const pending = page.evaluate(({kind, ctx, base}) => { const T = window.__L5R_TEST__;
    window.__DP_CTX = T.makeRollContext(T.ROLL_KINDS[kind], ctx);
    return T.rollWithModifiers('Dark Paragon probe', window.__DP_CTX, base[0], base[1]).then(r => !!r); }, {kind, ctx, base});
  pending.catch(() => {});
  await page.waitForSelector('#rollPreviewGo', {state:'visible'});
  const offered = await page.evaluate(() => !!document.querySelector('#rollPreviewBody input[data-rd4515-key="dark-paragon:determination"]'));
  if (tick) await page.locator('#rollPreviewBody input[data-rd4515-key="dark-paragon:determination"]').check();
  await page.locator('#rollPreviewGo').click();
  if (answer) {
    await page.waitForSelector('#appConfirmOverlay', {state:'visible'});
    const message = await page.textContent('#appConfirmMsg');
    await page.locator(answer === 'ok' ? '#appConfirmOk' : answer === 'cancel' ? '#appConfirmCancel' : '#appConfirmX').click();
    const rolled = await pending;
    return Object.assign({offered, message, rolled}, rolled ? await drawn(page) : {});
  }
  const rolled = await pending;
  return Object.assign({offered, rolled}, await drawn(page));
}
async function drawn(page) {
  await page.waitForSelector('#rollDiceRow .roll-die');
  return page.evaluate(() => {
    const kept = [...document.querySelectorAll('#rollDiceRow .roll-die.kept')].map(d => Number(d.dataset.total));
    const button = document.querySelector('#rollModalBody .dp4523-reroll');
    return {dice:document.querySelectorAll('#rollDiceRow .roll-die').length, kept, keptSum:kept.reduce((a, b) => a + b, 0),
      total:Number(document.getElementById('rollTotalDisplay').textContent), title:document.getElementById('rollModalTitle').textContent,
      button:button ? {text:button.textContent, disabled:button.disabled} : null,
      bar:document.getElementById('rollModifierBar')?.textContent || ''};
  });
}
async function damage(page) {
  return page.evaluate(() => { const T = window.__L5R_TEST__;
    document.getElementById('addWeapon').click();
    const tr = document.querySelector('#weaponsBody tr:last-child');
    const sel = tr.querySelector('.wp-name'); sel.value = 'Katana'; sel.dispatchEvent(new Event('change', {bubbles:true}));
    T.recalcAll(); T.rollWeaponDamage(tr);
    const button = document.querySelector('#rollModalBody .dp4523-reroll');
    return {dice:document.querySelectorAll('#rollDiceRow .roll-die').length, button:button ? button.textContent : null};
  });
}
async function reroll(page, answer) {
  await page.locator('#rollModalBody .dp4523-reroll').click();
  await page.waitForSelector('#appConfirmOverlay', {state:'visible'});
  const message = await page.textContent('#appConfirmMsg');
  await page.locator(answer === 'ok' ? '#appConfirmOk' : '#appConfirmCancel').click();
  await page.waitForTimeout(50);
  return Object.assign({message}, await drawn(page), await page.evaluate(() => ({
    outcome:document.querySelector('#rollModalBody .dp4523-outcome')?.textContent || '',
    bonusNote:document.querySelector('#rollModalBody .dp4523-bonus-note')?.textContent || '',
    tenDiceShown:[...document.querySelectorAll('#rollModalBody .roll-note')].some(e => /^Ten Dice Rule bonus/.test(e.textContent.trim()) && e.style.display !== 'none')})));
}
const COURTIER = ['SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:2}, [5, 3]];

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
    page.on('console', m => { if (/^DP-GEOMETRY/.test(m.text())) console.log(m.text()); });
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => !!window.__L5R_TEST__);

    await section('DP-START', async () => {
      check('DP-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_DARK_PARAGON_ENABLED));
      check('DP-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('DP-SCHEMA', await page.evaluate(n => { const s = window.__L5R_TEST__.advConfigSchemaFor(n); return s && s.type; }, NAME), 'darkParagon');
      check('DP-PROVIDER', await page.evaluate(() => window.__L5R_TEST__.RD4515.providerIds().includes('dark-paragon')));
    });

    await section('DP-PRICE', async () => {
      const prices = [];
      for (const clan of ['', 'Crane', 'Spider', 'spider']) { await setup(page, {clan, adv:[dp('Will', 1, '9')]}); prices.push((await row(page)).cost); }
      check('DP-PRICE-CLANS', prices, [5, 5, 4, 4]);
      await setup(page, {adv:[{name:NAME, cost:'9', desc:''}]});
      const bare = await row(page);
      check('DP-UNCONFIGURED', [bare.warn, bare.cost, bare.config], ['Choose your precept of Shourido', 5, null]);
    });

    await section('DP-PICKER', async () => {
      await setup(page, {adv:[{name:NAME, cost:'5', desc:''}]});
      await page.locator('#advList .dp4523-row .adv-config-btn').click();
      await page.waitForSelector('#advConfigGrid .dp4523-option', {state:'visible'});
      const options = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid input[name="dp4523Precept"]')].map(i => [i.value, i.checked]));
      check('DP-PICKER-ORDER', options.map(o => o[0]), PRECEPTS.map(p => p[0]));
      check('DP-PICKER-NONE-PRESELECTED', options.every(o => !o[1]));
      const texts = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#advConfigGrid .dp4523-option')].map(l => [l.querySelector('input').value, l.textContent])));
      check('DP-PICKER-OPERATIONS', PRECEPTS.every(([p]) => OPERATION[p].test(texts[p])));
      await page.locator('#advConfigConfirm').click();
      check('DP-PICKER-REQUIRED', [await page.locator('#advConfigGrid .dp4523-error').isVisible(), (await state(page)).config], [true, null]);
      await page.locator('#advConfigGrid input[value="Insight"]').check();
      await page.locator('#advConfigConfirm').click();
      check('DP-PICKER-SAVED', (await state(page)).config, cfg('Insight', 1));
      // Changing the precept keeps this session's use.
      await setup(page, {adv:[dp('Control', 0)]});
      await page.locator('#advList .dp4523-row .adv-config-btn').click();
      await page.waitForSelector('#advConfigGrid .dp4523-option', {state:'visible'});
      check('DP-PICKER-PRESELECTS-SAVED', await page.evaluate(() => document.querySelector('#advConfigGrid input:checked')?.value), 'Control');
      await page.locator('#advConfigGrid input[value="Will"]').check();
      await page.locator('#advConfigConfirm').click();
      check('DP-CHANGE-KEEPS-USE', (await state(page)).config, cfg('Will', 0));
    });

    await section('DP-ROWS', async () => {
      const seen = {};
      for (const [p, kind] of PRECEPTS) {
        await setup(page, {adv:[dp(p)]});
        const r = await row(page);
        seen[p] = [r.badge === p, OPERATION[p].test(r.reminder), /5 Honor points, or a Void Point/.test(r.reminder),
          r.state, !!r.use === (kind === 'manual'), r.reset];
      }
      check('DP-ROW-EACH', seen, Object.fromEntries(PRECEPTS.map(([p]) => [p, [true, true, true, 'Available this session (1/1)', true, true]])));
      await setup(page, {adv:[dp('Will', 0)]});
      const used = await row(page);
      check('DP-ROW-USED', [used.state, used.use], ['Used this session (0/1)', {text:'Use Will', disabled:true}]);
      await page.locator('#advList .dp4523-reset').click();
      check('DP-RESET', [(await row(page)).state, (await state(page)).config.remaining], ['Available this session (1/1)', 1]);
      await setup(page, {adv:[], disadv:[dp('Control')]});
      check('DP-WRONG-SIDE', /belongs in Advantages/.test((await row(page, 'disadvList')).warn));
      await setup(page, {adv:[dp('Control')]});
      await page.locator('#advList .dp4523-info').click();
      const info = await page.locator('#stanceInfoBody').textContent();
      check('DP-INFO', /Core p\.147/.test(await page.locator('#stanceInfoRing').textContent()) && PRECEPTS.every(([p]) => OPERATION[p].test(info)) &&
        /4 for a Spider/.test(info) && /not the higher/.test(info));
      await page.locator('#stanceInfoClose').click();
      // Session Resources panel lists it.
      const panel = await page.evaluate(() => { window.__L5R_TEST__.renderAdvConfigSessionResources(); return document.getElementById('advConfigSessionResources')?.textContent || ''; });
      check('DP-SESSION-PANEL', /Dark Paragon — Control/.test(panel) && /1\/1/.test(panel));
    });

    await section('DP-INVALID', async () => {
      const bad = [Object.assign(cfg('Control'), {remaining:2}), cfg('Honor'), Object.assign(cfg('Control'), {bonus:5}),
        Object.assign(cfg('Control'), {revision:2}), {type:'tenetPick', tenet:'Control', value:'Control'}, Object.assign(cfg('Control'), {remaining:'1'})];
      const out = [];
      for (const config of bad) {
        await setup(page, {adv:[{name:NAME, cost:'7', desc:'', config}]});
        const r = await row(page);
        out.push([/Saved setting kept/.test(r.warn), JSON.stringify(r.config) === JSON.stringify(config), r.cost]);
      }
      check('DP-INVALID-KEPT', out, bad.map(() => [true, true, 7]));
      await setup(page, {adv:[{name:NAME, cost:'7', desc:'', config:cfg('Honor')}]});
      await page.evaluate(() => { window.__DP = window.__L5R_TEST__.rollWithModifiers; });
      const r = await roll(page, ...COURTIER);
      check('DP-INVALID-NO-REROLL', r.button, null);
    });

    await section('DP-MATCH', async () => {
      // Which reroll precept is offered after which roll: the source's own scopes.
      const ROLLS = {
        courtier:['SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:2}, [5, 3]],
        etiquetteEmphasis:['SKILL', {skillName:'Etiquette (Courtesy)', traitName:'Intelligence', skillRank:2}, [5, 3]],
        kenjutsu:['ATTACK', {skillName:'Kenjutsu', traitName:'Agility', skillRank:2}, [5, 2]],
        awarenessTrait:['TRAIT', {traitName:'Awareness', traitValue:3}, [3, 3]],
        intelligenceTrait:['TRAIT', {traitName:'Intelligence', traitValue:3}, [3, 3]],
        loreIntelligence:['SKILL', {skillName:'Lore: Theology', traitName:'Intelligence', skillRank:1}, [4, 3]],
        airRing:['RING', {ringName:'Air', ringValue:3}, [3, 3]],
        spell:['SPELL', {spellName:'Probe', element:'Fire', mastery:1}, [4, 3]],
      };
      const want = {
        Control:{courtier:true, etiquetteEmphasis:true, kenjutsu:false, awarenessTrait:false, intelligenceTrait:false, loreIntelligence:false, airRing:false, spell:false, damage:false},
        Insight:{courtier:true, etiquetteEmphasis:false, kenjutsu:false, awarenessTrait:true, intelligenceTrait:false, loreIntelligence:false, airRing:false, spell:false, damage:false},
        Knowledge:{courtier:false, etiquetteEmphasis:true, kenjutsu:false, awarenessTrait:false, intelligenceTrait:true, loreIntelligence:true, airRing:false, spell:false, damage:false},
        Strength:{courtier:false, etiquetteEmphasis:false, kenjutsu:false, awarenessTrait:false, intelligenceTrait:false, loreIntelligence:false, airRing:false, spell:false, damage:true},
        Determination:{courtier:false, etiquetteEmphasis:false, kenjutsu:false, awarenessTrait:false, intelligenceTrait:false, loreIntelligence:false, airRing:false, spell:false, damage:false},
        Perfection:{courtier:false, etiquetteEmphasis:false, kenjutsu:false, awarenessTrait:false, intelligenceTrait:false, loreIntelligence:false, airRing:false, spell:false, damage:false},
      };
      for (const [p, expected] of Object.entries(want)) {
        const got = {};
        for (const [label, spec] of Object.entries(ROLLS)) {
          await setup(page, {adv:[dp(p)]});
          got[label] = !!(await roll(page, ...spec)).button;
          await closeAll(page);
        }
        await setup(page, {adv:[dp(p)]});
        got.damage = !!(await damage(page)).button;
        await closeAll(page);
        check('DP-MATCH-' + p, got, expected);
      }
      // A Willpower check that 4.5.2's gates run first is not the roll: its result offers nothing.
      await setup(page, {adv:[dp('Control')], disadv:[{name:'Enlightened Madness', cost:'6', desc:'',
        config:{type:'targetPick', tier:6, targetType:'Skill', target:'Courtier', value:'Courtier'}}]});
      const gated = page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.rollWithModifiers('Courtier', T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier', traitName:'Awareness', skillRank:2}), 5, 3); });
      gated.catch(() => {});
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      await page.locator('#rollPreviewGo').click();
      const checkRoll = await drawn(page);
      check('DP-NOT-ON-WILLPOWER-CHECK', [/Willpower/.test(checkRoll.title), checkRoll.button], [true, null]);
      await page.evaluate(() => window.__L5R_TEST__.D45.gates.cancel(true));
      await closeAll(page);
      // Without Dark Paragon, no roll carries the button.
      await setup(page, {adv:[]});
      check('DP-MATCH-ABSENT', [(await roll(page, ...COURTIER)).button, (await damage(page)).button], [null, null]);
    });

    await section('DP-REROLL', async () => {
      await setup(page, {adv:[dp('Control')]});
      const first = await roll(page, ...COURTIER);
      check('DP-REROLL-OFFERED', first.button, {text:'Reroll with Dark Paragon (1/1)', disabled:false});
      const cancelled = await reroll(page, 'cancel');
      check('DP-REROLL-CANCEL-FREE', [await state(page), cancelled.title, cancelled.total], [{honor:'5.0', rank:'5', voids:2, config:cfg('Control', 1)}, first.title, first.total]);
      check('DP-REROLL-PRICE-SHOWN', /5 Honor points: Honor Points 5\.0 → 4\.5/.test(cancelled.message) && /reroll stands/.test(cancelled.message));
      const paid = await reroll(page, 'ok');
      check('DP-REROLL-PAID', await state(page), {honor:'4.5', rank:'5', voids:2, config:cfg('Control', 0)});
      check('DP-REROLL-SAME-POOL', [paid.dice, paid.kept.length], [first.dice, first.kept.length]);
      // The reroll stands, whatever the original: its total is its own kept dice plus 5.
      check('DP-REROLL-STANDS-PLUS-5', paid.total, paid.keptSum + 5);
      check('DP-REROLL-LABELLED', [/Dark Paragon reroll \(\+5\)/.test(paid.title), /original \d+, reroll \d+ \+ 5 = \d+\. The reroll stands\./.test(paid.outcome),
        /Includes Dark Paragon \+5/.test(paid.bonusNote), paid.tenDiceShown], [true, true, true, false]);
      check('DP-REROLL-OUTCOME-MATCHES', Number(paid.outcome.match(/= (\d+)\./)[1]), paid.total);
      check('DP-REROLL-NO-SECOND-BUTTON', paid.button, null);
      await closeAll(page);
      const next = await roll(page, ...COURTIER);
      check('DP-REROLL-SPENT', next.button, {text:'Reroll with Dark Paragon (0/1)', disabled:true});
      await closeAll(page);
      // Fixed dice: every original die a 9, every reroll die a 1. The lower reroll still stands.
      await setup(page, {adv:[dp('Control')]});
      await page.evaluate(() => { window.__DP_RANDOM = Math.random; Math.random = () => 0.85; });
      const high = await roll(page, ...COURTIER);
      await page.evaluate(() => { Math.random = () => 0; });
      const low = await reroll(page, 'ok');
      await page.evaluate(() => { Math.random = window.__DP_RANDOM; });
      check('DP-REROLL-LOWER-STANDS', [high.total, low.kept, low.total, /original 27, reroll 3 \+ 5 = 8\. The reroll stands\./.test(low.outcome)],
        [27, [1, 1, 1], 8, true]);
      await closeAll(page);
      // A reroll carries the original roll's flat modifiers: a wounded roll stays penalised.
      await setup(page, {adv:[dp('Insight')], wounds:12});
      const penalty = await page.evaluate(() => window.__L5R_TEST__.getWoundPenalty());
      await roll(page, 'TRAIT', {traitName:'Awareness', traitValue:3}, [3, 3]);
      const wounded = await reroll(page, 'ok');
      check('DP-REROLL-KEEPS-PENALTY', [penalty < 0, wounded.total], [true, wounded.keptSum + penalty + 5]);
      // Damage (Strength).
      await closeAll(page);
      await setup(page, {adv:[dp('Strength')]});
      const hit = await damage(page);
      const hitReroll = await reroll(page, 'ok');
      check('DP-STRENGTH-DAMAGE', [hit.button, hitReroll.dice, hitReroll.total, (await state(page)).config.remaining],
        ['Reroll with Dark Paragon (1/1)', hit.dice, hitReroll.keptSum + 5, 0]);
    });

    await section('DP-PAYMENT', async () => {
      // Fewer than 5 Honor points: a Void Point instead, and Honor is untouched.
      await setup(page, {adv:[dp('Control')], honor:'0.4', voids:2});
      await roll(page, ...COURTIER);
      const v = await reroll(page, 'ok');
      check('DP-VOID-FALLBACK', [/fewer than 5 Honor points \(0\.4\).*Void Point instead: 2 → 1/s.test(v.message), await state(page)],
        [true, {honor:'0.4', rank:'5', voids:1, config:cfg('Control', 0)}]);
      await closeAll(page);
      // Exactly 5 points pays with Honor.
      await setup(page, {adv:[dp('Control')], honor:'0.5', voids:2});
      await roll(page, ...COURTIER);
      await reroll(page, 'ok');
      check('DP-HONOR-EXACT', await state(page), {honor:'0.0', rank:'5', voids:2, config:cfg('Control', 0)});
      await closeAll(page);
      // Neither: refused, nothing changes.
      await setup(page, {adv:[dp('Control')], honor:'0.2', voids:0});
      await roll(page, ...COURTIER);
      await page.locator('#rollModalBody .dp4523-reroll').click();
      await page.waitForSelector('#appConfirmOverlay', {state:'visible'});
      const refusal = await page.textContent('#appConfirmMsg');
      await page.locator('#appConfirmOk').click();
      check('DP-CANNOT-PAY', [/cannot be paid/.test(refusal), await state(page)], [true, {honor:'0.2', rank:'5', voids:0, config:cfg('Control', 1)}]);
      await closeAll(page);
      // In combat, the Round's one Void Point already spent: refused.
      await setup(page, {adv:[dp('Control')], honor:'0.2', voids:2, combat:true});
      await page.evaluate(() => window.__L5R_TEST__.recordRoundSpend('void', 'probe'));
      await roll(page, ...COURTIER);
      await page.locator('#rollModalBody .dp4523-reroll').click();
      await page.waitForSelector('#appConfirmOverlay', {state:'visible'});
      const round = await page.textContent('#appConfirmMsg');
      await page.locator('#appConfirmOk').click();
      check('DP-VOID-ROUND-LIMIT', [/already spent a Void Point this Round/.test(round), (await state(page)).voids], [true, 2]);
      await closeAll(page);
      // A Void payment in combat takes the Round's Void Point.
      await setup(page, {adv:[dp('Control')], honor:'0.2', voids:2, combat:true});
      await roll(page, ...COURTIER);
      await reroll(page, 'ok');
      check('DP-VOID-RECORDED', await page.evaluate(() => window.__L5R_TEST__.hasSpentThisRound('void')));
      await page.evaluate(() => window.__L5R_TEST__.setCombatActive(false));
    });

    await section('DP-DETERMINATION', async () => {
      await setup(page, {adv:[dp('Determination')], wounds:12});
      const penalty = await page.evaluate(() => window.__L5R_TEST__.getWoundPenalty());
      check('DP-DET-WOUNDED-FIXTURE', penalty < 0);
      // Offered on Skill, attack and Spell Casting rolls only.
      const kinds = {};
      for (const [k, ctx] of [['SKILL', {skillName:'Kenjutsu', traitName:'Agility', skillRank:2}], ['ATTACK', {skillName:'Kenjutsu', traitName:'Agility', skillRank:2}],
        ['SPELL', {spellName:'Probe', element:'Fire', mastery:1}], ['TRAIT', {traitName:'Agility', traitValue:3}], ['RING', {ringName:'Fire', ringValue:3}]]) {
        kinds[k] = await page.evaluate(({k, ctx}) => { const T = window.__L5R_TEST__;
          return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[k], ctx)).some(o => o.key === 'dark-paragon:determination'); }, {k, ctx});
      }
      check('DP-DET-KINDS', kinds, {SKILL:true, ATTACK:true, SPELL:true, TRAIT:false, RING:false});
      const KEN = ['SKILL', {skillName:'Kenjutsu', traitName:'Agility', skillRank:2}, [5, 3]];
      // Unticked: the penalty applies and nothing is asked.
      const plain = await roll(page, ...KEN);
      check('DP-DET-UNTICKED', [plain.offered, plain.total, (await state(page)).config.remaining], [true, plain.keptSum + penalty, 1]);
      await closeAll(page);
      // Ticked, then "Roll without it": the penalty applies and nothing is paid.
      const without = await roll(page, ...KEN, {tick:true, answer:'cancel'});
      check('DP-DET-WITHOUT', [without.rolled, without.total, await state(page)], [true, without.keptSum + penalty, {honor:'5.0', rank:'5', voids:2, config:cfg('Determination', 1)}]);
      check('DP-DET-ASKS-PRICE', /5 Honor points: Honor Points 5\.0 → 4\.5/.test(without.message));
      await closeAll(page);
      // Ticked, then ✕: no roll and nothing paid.
      const aborted = await roll(page, ...KEN, {tick:true, answer:'x'});
      check('DP-DET-ABORT', [aborted.rolled, await page.locator('#rollModalOverlay').isVisible(), await state(page)],
        [false, false, {honor:'5.0', rank:'5', voids:2, config:cfg('Determination', 1)}]);
      // Ticked and paid: the Wound penalty is gone from the real total, no +5.
      const paid = await roll(page, ...KEN, {tick:true, answer:'ok'});
      check('DP-DET-PAID', [paid.rolled, paid.total, await state(page)], [true, paid.keptSum, {honor:'4.5', rank:'5', voids:2, config:cfg('Determination', 0)}]);
      check('DP-DET-BREAKDOWN', /Determination/.test(paid.bar));
      await closeAll(page);
      // Spent: no longer offered, and the next roll is penalised again.
      const after = await roll(page, ...KEN);
      check('DP-DET-SPENT', [after.offered, after.total], [false, after.keptSum + penalty]);
      await closeAll(page);
      // Ticked then the preview cancelled: nothing paid.
      await setup(page, {adv:[dp('Determination')], wounds:12});
      const pending = page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.rollWithModifiers('probe', T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Kenjutsu', traitName:'Agility', skillRank:2}), 5, 3); });
      pending.catch(() => {});
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      await page.locator('#rollPreviewBody input[data-rd4515-key="dark-paragon:determination"]').check();
      await page.locator('#rollPreviewCancel').click();
      check('DP-DET-PREVIEW-CANCEL-FREE', [await pending, await state(page)], [null, {honor:'5.0', rank:'5', voids:2, config:cfg('Determination', 1)}]);
    });

    await section('DP-MANUAL', async () => {
      for (const p of ['Perfection', 'Will']) {
        await setup(page, {adv:[dp(p)]});
        await page.locator('#advList .dp4523-use').click();
        await page.waitForSelector('#appConfirmOverlay', {state:'visible'});
        await page.locator('#appConfirmCancel').click();
        await page.waitForTimeout(50);
        const cancelled = await state(page);
        await page.locator('#advList .dp4523-use').click();
        await page.waitForSelector('#appConfirmOverlay', {state:'visible'});
        const message = await page.textContent('#appConfirmMsg');
        await page.locator('#appConfirmOk').click();
        await page.waitForFunction(() => document.querySelector('#advList .dp4523-use')?.disabled === true);
        check('DP-MANUAL-' + p, [cancelled, /one use this session/.test(message), await state(page), (await row(page)).state],
          [{honor:'5.0', rank:'5', voids:2, config:cfg(p, 1)}, true, {honor:'4.5', rank:'5', voids:2, config:cfg(p, 0)}, 'Used this session (0/1)']);
      }
    });

    await section('DP-NOTHING-ELSE', async () => {
      // No pre-roll modifier from any precept but a ticked Determination.
      const probe = () => page.evaluate(() => { const T = window.__L5R_TEST__;
        return ['SKILL', 'TRAIT', 'RING', 'ATTACK', 'SPELL'].map(k => JSON.stringify(T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[k], {skillName:'Courtier', traitName:'Awareness', ringName:'Air', element:'Air'})))); });
      await setup(page, {adv:[], wounds:12}); const without = await probe();
      const withAll = [];
      for (const [p] of PRECEPTS) { await setup(page, {adv:[dp(p)], wounds:12}); withAll.push(JSON.stringify(await probe()) === JSON.stringify(without)); }
      check('DP-NO-STANDING-MODIFIER', withAll, PRECEPTS.map(() => true));
      // A roll with a matching precept, never rerolled, changes nothing on the character.
      await setup(page, {adv:[dp('Control')]});
      const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await roll(page, ...COURTIER);
      await closeAll(page);
      check('DP-ROLL-ALONE-CHANGES-NOTHING', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData())), before);
    });

    await section('DP-PERSISTENCE', async () => {
      await setup(page, {adv:[dp('Knowledge', 0)]});
      const saved = await page.evaluate(() => window.__L5R_TEST__.collectData());
      await page.locator('#btnSave').evaluate(b => b.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const id = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(id);
      await page.locator('#btnLoad').evaluate(b => b.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      const loaded = await page.evaluate(() => window.__L5R_TEST__.collectData());
      check('DP-LOCAL-RELOAD', [loaded.adv, (await row(page)).state], [saved.adv, 'Used this session (0/1)']);
    });

    await section('DP-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:760});
        await setup(page, {adv:[dp('Perfection')]});
        // Let the resize settle before measuring (the layout reflows over the next frames).
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const g = await page.evaluate(() => {
          const r = document.querySelector('#advList .dp4523-row');
          const i = document.querySelector('#advList .dp4523-info').getBoundingClientRect();
          const buttons = [...r.querySelectorAll('.dp4523-use, .dp4523-reset')].map(b => b.getBoundingClientRect());
          const rem = document.querySelector('#advList .dp4523-reminder').getBoundingClientRect();
          if (!(i.width >= 28 && i.height >= 28 && Math.abs(i.width - i.height) < 1)) console.log('DP-GEOMETRY info measured ' + i.width + 'x' + i.height + ' at ' + innerWidth);
          return {fit:r.scrollWidth <= r.clientWidth + 1, info:i.width >= 28 && i.height >= 28 && Math.abs(i.width - i.height) < 1,
            buttons:buttons.every(b => b.height >= 32), ownLine:rem.top >= i.bottom - 1,
            readable:[...r.querySelectorAll('.dp4523-reminder, .dp4523-state')].every(e => parseFloat(getComputedStyle(e).fontSize) >= 12)};
        });
        await setup(page, {adv:[dp('Control')]});
        await roll(page, ...COURTIER);
        const modal = await page.evaluate(() => { const w = document.querySelector('#rollModalBody .dp4523-actions'), b = document.querySelector('#rollModalBody .dp4523-reroll');
          return w.scrollWidth <= w.clientWidth + 1 && b.getBoundingClientRect().height >= 32 && getComputedStyle(b).textTransform === 'none'; });
        await closeAll(page);
        check('DP-GEOMETRY-' + width, {...g, modal}, {fit:true, info:true, buttons:true, ownLine:true, readable:true, modal:true});
      }
      await page.setViewportSize({width:375, height:812});
    });

    check('DP-BROWSER-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
}
main().catch(error => check('DP-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  console.log('DP4523_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length && passed === results.length ? 0 : 1;
});
