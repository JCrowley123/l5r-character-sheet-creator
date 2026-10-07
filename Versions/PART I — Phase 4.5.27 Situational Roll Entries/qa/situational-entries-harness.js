/* Real-browser acceptance tests for Phase 4.5.27 Situational Roll Entries (Part I).
 * Every expected value comes from the books and the owner's rulings of 7 October 2026, never
 * from SIT4527 itself:
 *   Balance +1k0 (Core p.146), Clear Thinker +1k0 (p.147), Dangerous Beauty +1k0 on Temptation
 *   (p.147), Imperial Spouse +1k1 on Social Skills (p.150), Irreproachable +1k0 (p.151),
 *   Precise Memory +1k1 on Intelligence Trait Rolls (p.152), Wary +1k1 on Investigation /
 *   Perception (p.155), Heartless +1k0 (The Great Clans p.136), Imperial Scribe +1k0 on Social
 *   Skills and a Free Raise on Calligraphy (Imperial Histories p.67). Social Skills are the seven
 *   whose sub-type is Social Skill (Core pp.135-145). Unskilled Rolls may not benefit from Free
 *   Raises (Core p.80). Failure of Bushido (Honor) forbids adding Honor Rank (Core p.159), so
 *   Balance's condition (adding it) cannot arise.
 * Phase 4.5.28 (7 October 2026, owner's rulings and device corrections) retunes three of the
 * nine. When it is present (S28): Wary and Precise Memory are no longer declarations on any roll
 * (their Spot ambush and Recall buttons apply them); Imperial Scribe needs Status 2+ and
 * Calligraphy 4+, which every reset below then supplies. The checks that depend on those three
 * read S28 and assert the ruled behaviour; the per-roll dice checks of Wary and Precise Memory
 * (five each) are not run under S28 (Phase 4.5.28's own harness covers both buttons), and the
 * tick lifecycle checks use Imperial Spouse on Courtier (the same +1k1) in Wary's place. Without
 * Phase 4.5.28 every check is exactly as first shipped.
 * node situational-entries-harness.js <sheet.html>
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

// ---- The books' table: the oracle ----
const NINE = ['Balance', 'Clear Thinker', 'Dangerous Beauty', 'Heartless', 'Imperial Scribe', 'Imperial Spouse',
  'Irreproachable', 'Precise Memory', 'Wary'];
const POOL = {'Balance':[1, 0], 'Clear Thinker':[1, 0], 'Dangerous Beauty':[1, 0], 'Heartless':[1, 0],
  'Imperial Scribe':[1, 0], 'Imperial Spouse':[1, 1], 'Irreproachable':[1, 0], 'Precise Memory':[1, 1], 'Wary':[1, 1]};
const RESIST = ['Balance', 'Clear Thinker', 'Heartless', 'Irreproachable'];
const SOCIAL_PAIR = ['Imperial Scribe', 'Imperial Spouse'];
const sorted = list => list.slice().sort();
// Probe contexts, and which entries the books say apply to each.
const PROBES = [
  ['COURTIER', 'SKILL', {skillName:'Courtier', traitName:'Awareness', skillRank:3}, [...RESIST, ...SOCIAL_PAIR]],
  ['ACTING', 'SKILL', {skillName:'Acting', traitName:'Awareness', skillRank:1}, [...RESIST, ...SOCIAL_PAIR]],
  ['ETIQUETTE-WILLPOWER', 'SKILL', {skillName:'Etiquette', traitName:'Willpower', skillRank:2}, [...RESIST, ...SOCIAL_PAIR]],
  ['PERFORM-SONG', 'SKILL', {skillName:'Perform: Song', traitName:'Awareness', skillRank:2}, [...RESIST, ...SOCIAL_PAIR]],
  ['SINCERITY', 'SKILL', {skillName:'Sincerity', traitName:'Awareness', skillRank:2}, [...RESIST, ...SOCIAL_PAIR]],
  ['INTIMIDATION', 'SKILL', {skillName:'Intimidation', traitName:'Awareness', skillRank:2}, [...RESIST, ...SOCIAL_PAIR]],
  ['TEMPTATION', 'SKILL', {skillName:'Temptation', traitName:'Awareness', skillRank:2}, [...RESIST, ...SOCIAL_PAIR, 'Dangerous Beauty']],
  ['TEMPTATION-UNSKILLED', 'SKILL', {skillName:'Temptation', traitName:'Awareness', unskilled:true}, [...RESIST, ...SOCIAL_PAIR, 'Dangerous Beauty']],
  ['INVESTIGATION-PERCEPTION', 'SKILL', {skillName:'Investigation', traitName:'Perception', skillRank:2}, [...RESIST, 'Wary']],
  ['INVESTIGATION-LOWERCASE', 'SKILL', {skillName:'investigation', traitName:'perception', skillRank:2}, [...RESIST, 'Wary']],
  ['INVESTIGATION-AWARENESS', 'SKILL', {skillName:'Investigation', traitName:'Awareness', skillRank:2}, [...RESIST]],
  ['CALLIGRAPHY', 'SKILL', {skillName:'Calligraphy', traitName:'Intelligence', skillRank:4}, [...RESIST]],
  ['LORE', 'SKILL', {skillName:'Lore: History', traitName:'Intelligence', skillRank:2}, [...RESIST]],
  ['FULL-DEFENSE', 'SKILL', {skillName:'Defense', traitName:'Reflexes', fullDefenseDeclaration:true}, []],
  ['TRAIT-INTELLIGENCE', 'TRAIT', {traitName:'Intelligence'}, [...RESIST, 'Precise Memory']],
  ['TRAIT-WILLPOWER', 'TRAIT', {traitName:'Willpower'}, [...RESIST]],
  ['RING-AIR', 'RING', {ringName:'Air'}, [...RESIST]],
  ['MANUAL', 'MANUAL', {notation:'5k3'}, [...RESIST]],
  ['ATTACK', 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility'}, []],
  ['DAMAGE', 'DAMAGE', {skillName:'Kenjutsu'}, []],
  ['SPELL', 'SPELL', {spellName:'Sense', element:'Air'}, []],
  ['INITIATIVE', 'INITIATIVE', {}, []],
];
const probe = id => PROBES.find(p => p[0] === id);
let S28 = false;
// The entry and probe the tick lifecycle checks use.
let LIFE = 'Wary', LIFE_PROBE = 'INVESTIGATION-PERCEPTION';
// Phase 4.5.28 present: Wary leaves the two Investigation / Perception probes and Precise Memory
// the Intelligence probe; the lifecycle checks move to Imperial Spouse on Courtier.
const BUTTONED = ['Precise Memory', 'Wary'];
function applyS28() {
  for (const id of ['INVESTIGATION-PERCEPTION', 'INVESTIGATION-LOWERCASE']) probe(id)[3] = [...RESIST];
  probe('TRAIT-INTELLIGENCE')[3] = [...RESIST];
  LIFE = 'Imperial Spouse'; LIFE_PROBE = 'COURTIER';
}
// One probe where each entry applies, for the one-entry and real-dice checks.
const HOME = {'Balance':'TRAIT-WILLPOWER', 'Clear Thinker':'TRAIT-WILLPOWER', 'Heartless':'ETIQUETTE-WILLPOWER',
  'Irreproachable':'MANUAL', 'Dangerous Beauty':'TEMPTATION', 'Imperial Spouse':'COURTIER', 'Imperial Scribe':'SINCERITY',
  'Precise Memory':'TRAIT-INTELLIGENCE', 'Wary':'INVESTIGATION-PERCEPTION'};

// ---- Page helpers ----
async function reset(page, adv = [], dis = []) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(({adv, dis}) => {
    document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
    T.clearOneRollVoidPending?.(); T.saveSchoolsList?.([]);
    for (const [id, v] of [['trait_intelligence', 3], ['trait_perception', 3], ['trait_awareness', 3], ['trait_willpower', 3],
      ['trait_agility', 3], ['trait_reflexes', 3]]) document.getElementById(id).value = v;
    if (T.SIT4528) {
      document.getElementById('f_statusRank').value = 2; document.getElementById('f_statusPts').value = '2.0';
      document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Calligraphy', trait:'Intelligence', rank:4}));
    }
    for (const name of adv) window.__SIT.add(name);
    for (const item of dis) window.__SIT.add(item.name || item, true, item.config);
    T.recalcAll();
    let i = 0; const seq = [6, 4, 7, 3, 5, 2, 8, 1]; Math.random = () => ((seq[i++ % seq.length] - 0.5) / 10);
  }, {adv, dis});
}
const offered = (page, id) => page.evaluate(([kind, ctx]) => { const T = window.__L5R_TEST__;
  return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[kind], ctx))
    .filter(o => o.provider === 'situational-entries').map(o => o.label.split(':')[0]).sort(); }, [probe(id)[1], probe(id)[2]]);
async function open(page, id, base = [5, 3], opts = {}) {
  const [, kind, ctx] = probe(id);
  const pending = page.evaluate(({kind, ctx, base, opts}) => { const T = window.__L5R_TEST__;
    window.__SIT_CTX = T.makeRollContext(T.ROLL_KINDS[kind], ctx);
    return T.rollWithModifiers('Situational probe', window.__SIT_CTX, base[0], base[1], opts).then(r => !!r); }, {kind, ctx, base, opts});
  pending.catch(() => {});
  await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
  return {pending};
}
const boxes = page => page.evaluate(() => [...document.querySelectorAll('[data-rd4515-key^="situational-entries:"]')]
  .map(b => [b.closest('.rd4515-opt').textContent.split(':')[0], b.checked]));
const tick = async (page, name) => { const opt = page.locator('.rd4515-opt', {hasText:name + ':'});
  if (!(await opt.locator('input').isChecked())) await opt.click(); };
const poolText = page => page.locator('.rp-pool-final').textContent();
async function confirmRoll(page, handle) {
  await page.locator('#rollPreviewGo').click(); await handle.pending;
  const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
    kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
    totals:[...document.querySelectorAll('#rollDiceRow .roll-die')].map(e => +e.dataset.total),
    body:document.getElementById('rollModalBody')?.textContent || ''}));
  await page.keyboard.press('Escape');
  return r;
}
async function cancelRoll(page, handle) {
  await page.locator('#rollPreviewCancel').click();
  await Promise.race([handle.pending.catch(() => null), new Promise(r => setTimeout(r, 5000))]);
}

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
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.CL11?.close?.();
      window.__SIT = {add(name, dis = false, config = null) {
        const lib = (dis ? T.DISADV_LIBRARY : T.ADV_LIBRARY).find(x => x.name === name);
        const row = T.makeEntry({name, cost:lib?.cost || 0, desc:lib?.desc || ''}, true);
        document.getElementById(dis ? 'disadvList' : 'advList').appendChild(row);
        if (config) row.dataset.advConfig = JSON.stringify(config);
        return row; }};
    });
    S28 = await page.evaluate(() => !!window.__L5R_TEST__.SIT4528);
    if (S28) applyS28();

    await section('SIT-START', async () => {
      check('SIT-SEAM', await page.evaluate(() => window.__L5R_TEST__.SITUATIONAL_ENTRIES_ENABLED === true && !!window.__L5R_TEST__.SIT4527));
      check('SIT-PROVIDER-REGISTERED', await page.evaluate(() => window.__L5R_TEST__.RD4515.providerIds().includes('situational-entries')));
      check('SIT-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('SIT-CATALOGUE-HAS-NINE', await page.evaluate(n => n.filter(x => window.__L5R_TEST__.ADV_LIBRARY.some(e => e.name === x)), NINE), NINE);
    });

    await section('SIT-NONE-OWNED', async () => {
      await reset(page);
      const any = [];
      for (const [id] of PROBES) if ((await offered(page, id)).length) any.push(id);
      check('SIT-NOTHING-OFFERED-WITHOUT-ENTRIES', any, []);
    });

    await section('SIT-MATRIX', async () => {
      await reset(page, NINE);
      for (const [id, , , expected] of PROBES) check('SIT-OFFERS-' + id, await offered(page, id), sorted(expected));
      const labels = await page.evaluate(() => { const T = window.__L5R_TEST__, out = {};
        for (const [kind, ctx] of [['SKILL', {skillName:'Temptation', traitName:'Awareness', skillRank:2}], ['TRAIT', {traitName:'Intelligence'}],
          ['SKILL', {skillName:'Investigation', traitName:'Perception', skillRank:2}]])
          T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(o => o.provider === 'situational-entries')
            .forEach(o => { out[o.label.split(':')[0]] = (o.label.match(/\+(\d)k(\d)\s*$/) || []).slice(1).map(Number); });
        return out; });
      check('SIT-LABELS-STATE-BOOK-POOLS', Object.keys(labels).sort().map(k => [k, labels[k]]),
        sorted(NINE).filter(k => !(S28 && BUTTONED.includes(k))).map(k => [k, POOL[k]]));
      check('SIT-LABELS-CITE-SOURCES', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Temptation', traitName:'Awareness', skillRank:2}))
          .filter(o => o.provider === 'situational-entries').map(o => /p\.\d+\.$/.test(o.note)); }), [true, true, true, true, true, true, true]);
    });

    await section('SIT-OWNERSHIP', async () => {
      for (const name of NINE) {
        await reset(page, [name]);
        check('SIT-ONLY-OWNED-' + name.toUpperCase().replace(/ /g, '-'), await offered(page, HOME[name]),
          S28 && BUTTONED.includes(name) ? [] : [name]);
      }
      await reset(page, [], NINE);
      check('SIT-DISADVANTAGE-LIST-DOES-NOT-COUNT', await offered(page, 'TEMPTATION'), []);
      await reset(page, [LIFE, LIFE]);
      check('SIT-DUPLICATE-OFFERED-ONCE', await offered(page, LIFE_PROBE), [LIFE]);
      let h = await open(page, LIFE_PROBE);
      await tick(page, LIFE);
      check('SIT-DUPLICATE-APPLIES-ONCE', [await poolText(page), (await confirmRoll(page, h)).dice], ['6k4', 6]);
      await page.evaluate(() => { const rows = document.querySelectorAll('#advList .entry .en-name'); rows.forEach(r => { r.value = 'Wary Eye'; }); window.__L5R_TEST__.recalcAll(); });
      check('SIT-RENAMED-ROW-NOT-OFFERED', await offered(page, LIFE_PROBE), []);
      await reset(page, [LIFE]);
      h = await open(page, LIFE_PROBE);
      await tick(page, LIFE);
      await page.evaluate(() => { document.querySelector('#advList .entry').remove(); });
      const r = await confirmRoll(page, h);
      check('SIT-REMOVED-BEFORE-ROLL-NOT-APPLIED', [r.dice, r.kept], [5, 3]);
    });

    await section('SIT-DICE', async () => {
      for (const name of NINE.filter(n => !(S28 && BUTTONED.includes(n)))) {
        const tag = name.toUpperCase().replace(/ /g, '-');
        const [dr, dk] = POOL[name];
        await reset(page, [name]);
        let h = await open(page, HOME[name]);
        check('SIT-UNTICKED-' + tag, await boxes(page), [[name, false]]);
        await tick(page, name);
        check('SIT-PREVIEW-POOL-' + tag, await poolText(page), (5 + dr) + 'k' + (3 + dk));
        let r = await confirmRoll(page, h);
        check('SIT-DICE-' + tag, [r.dice, r.kept, r.body.includes(name)], [5 + dr, 3 + dk, true]);
        h = await open(page, HOME[name]);
        check('SIT-FRESH-' + tag, await boxes(page), [[name, false]]);
        r = await confirmRoll(page, h);
        check('SIT-UNDECLARED-' + tag, [r.dice, r.kept], [5, 3]);
      }
    });

    await section('SIT-LIFECYCLE', async () => {
      await reset(page, [LIFE]);
      let h = await open(page, LIFE_PROBE);
      await tick(page, LIFE);
      await cancelRoll(page, h);
      check('SIT-CANCEL-DISARMS', await page.evaluate(() => window.__L5R_TEST__.RD4515.armed(window.__SIT_CTX)), []);
      h = await open(page, LIFE_PROBE);
      check('SIT-AFTER-CANCEL-UNTICKED', await boxes(page), [[LIFE, false]]);
      await tick(page, LIFE);
      await confirmRoll(page, h);
      // A reroll reads the same roll's modifiers through its own context: still declared.
      check('SIT-REROLL-KEEPS-DECLARATION', await page.evaluate(LIFE => window.__L5R_TEST__.getPreRollModifiers(window.__SIT_CTX)
        .filter(m => m.label === LIFE).map(m => [m.rolledDelta, m.keptDelta]), LIFE), [[1, 1]]);
      const keepCtx = await page.evaluate(() => { window.__SIT_OLD = window.__SIT_CTX; return true; });
      await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.rollWithModifiers('No preview', T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Investigation', traitName:'Perception', skillRank:2}), 5, 3, {skipPreview:true}); });
      check('SIT-NO-LEAK-SKIPPED-PREVIEW', keepCtx && await page.evaluate(() => [document.querySelectorAll('#rollDiceRow .roll-die').length,
        document.querySelectorAll('#rollDiceRow .roll-die.kept').length]), [5, 3]);
      await page.keyboard.press('Escape');
      h = await open(page, LIFE_PROBE);
      check('SIT-OLD-ROLL-RELEASED', await page.evaluate(LIFE => window.__L5R_TEST__.getPreRollModifiers(window.__SIT_OLD)
        .filter(m => m.label === LIFE).length, LIFE), 0);
      await cancelRoll(page, h);
      await reset(page, [LIFE]);
      const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      h = await open(page, LIFE_PROBE);
      await tick(page, LIFE);
      const during = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await confirmRoll(page, h);
      check('SIT-NOTHING-SAVED', [during === before, /situational|SIT4527|rd4515/i.test(during)], [true, false]);
      await page.evaluate(saved => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.applyData(JSON.parse(saved)); T.recalcAll(); }, before);
      h = await open(page, LIFE_PROBE);
      check('SIT-RELOADED-UNTICKED', await boxes(page), [[LIFE, false]]);
      await cancelRoll(page, h);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play'));
      check('SIT-OFFERED-IN-PLAY', await offered(page, LIFE_PROBE), [LIFE]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
    });

    await section('SIT-STACKING', async () => {
      await reset(page, RESIST);
      let h = await open(page, 'TRAIT-WILLPOWER');
      for (const name of RESIST) await tick(page, name);
      check('SIT-FOUR-STACK-PREVIEW', await poolText(page), '9k3');
      let r = await confirmRoll(page, h);
      check('SIT-FOUR-STACK-DICE', [r.dice, r.kept], [9, 3]);
      await reset(page, RESIST);
      await page.evaluate(() => { window.__SIT.add('Heart of Vengeance').dataset.advConfig =
        JSON.stringify({type:'factionPick', revision:1, faction:'Scorpion Clan', value:'Scorpion Clan'}); window.__L5R_TEST__.recalcAll(); });
      h = await open(page, 'TRAIT-WILLPOWER');
      for (const name of RESIST) await tick(page, name);
      await page.locator('.rd4515-opt', {hasText:'Scorpion Clan'}).click();
      r = await confirmRoll(page, h);
      check('SIT-STACKS-WITH-HEART-OF-VENGEANCE', [r.dice, r.kept], [10, 4]);
      await reset(page, NINE);
      h = await open(page, 'TEMPTATION', [8, 5]);
      for (const name of [...RESIST, ...SOCIAL_PAIR, 'Dangerous Beauty']) await tick(page, name);
      const ten = await page.evaluate(() => { const a = window.__L5R_TEST__.applyTenDiceRule(15, 6); return a.rolled + 'k' + a.kept; });
      // The preview states the pool before the Ten Dice Rule (8k5 + 7k1); the dice follow the rule.
      check('SIT-TEN-DICE-RULE-PREVIEW', await poolText(page), '15k6');
      r = await confirmRoll(page, h);
      check('SIT-TEN-DICE-RULE-DICE', r.dice + 'k' + r.kept, ten);
    });

    await section('SIT-BALANCE-HONOR', async () => {
      const fob = tenet => ({name:'Failure of Bushido', config:{type:'tenetPick', tenet, value:tenet}});
      await reset(page, ['Balance', 'Heartless'], [fob('Honor')]);
      check('SIT-BALANCE-HIDDEN-WITH-FAILURE-OF-HONOR', await offered(page, 'TRAIT-WILLPOWER'), ['Heartless']);
      await reset(page, ['Balance'], [fob('Courage')]);
      check('SIT-BALANCE-OFFERED-WITH-OTHER-TENET', await offered(page, 'TRAIT-WILLPOWER'), ['Balance']);
      await reset(page, ['Balance'], ['Failure of Bushido']);
      check('SIT-BALANCE-OFFERED-UNCONFIGURED-FAILURE', await offered(page, 'TRAIT-WILLPOWER'), ['Balance']);
      check('SIT-BALANCE-REMINDS-HONOR-RANK', await page.evaluate(() => { const T = window.__L5R_TEST__;
        const o = T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS.TRAIT, {traitName:'Willpower'})).find(x => x.provider === 'situational-entries');
        return /Honor Rank/.test(o.label) && /does not add it/.test(o.note); }));
    });

    await section('SIT-FREE-RAISE', async () => {
      const freeRaise = ctx => page.evaluate(ctx => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[ctx.kind], ctx.c)).filter(m => m.label === 'Imperial Scribe')
          .map(m => [m.informational, m.rolledDelta, m.keptDelta, m.totalDelta, m.display]); }, ctx);
      await reset(page, ['Imperial Scribe']);
      check('SIT-FREE-RAISE-CALLIGRAPHY', await freeRaise({kind:'SKILL', c:{skillName:'Calligraphy', traitName:'Intelligence', skillRank:4}}),
        [[true, 0, 0, 0, 'Free Raise available']]);
      check('SIT-FREE-RAISE-NOT-UNSKILLED', await freeRaise({kind:'SKILL', c:{skillName:'Calligraphy', traitName:'Intelligence', unskilled:true}}), []);
      check('SIT-FREE-RAISE-NOT-RANK-ZERO', await freeRaise({kind:'SKILL', c:{skillName:'Calligraphy', traitName:'Intelligence', skillRank:0}}), []);
      check('SIT-FREE-RAISE-NOT-OTHER-SKILL', await freeRaise({kind:'SKILL', c:{skillName:'Courtier', traitName:'Awareness', skillRank:4}}), []);
      check('SIT-FREE-RAISE-NOT-TRAIT', await freeRaise({kind:'TRAIT', c:{traitName:'Intelligence'}}), []);
      // Through the real Skill table: Intelligence 3 + Calligraphy 4 rolls 7k3, unchanged by the line.
      await page.evaluate(() => { const T = window.__L5R_TEST__;
        document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Calligraphy', trait:'Intelligence', rank:4})); T.recalcAll();
        window.__SIT_TASK = T.rollSkill('Calligraphy', 'Intelligence', 4); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      const preview = await page.locator('#rollPreviewBody').textContent();
      check('SIT-FREE-RAISE-IN-PREVIEW', [/Imperial Scribe/.test(preview), /Free Raise available/.test(preview), await poolText(page)], [true, true, '7k3']);
      await page.locator('#rollPreviewGo').click(); await page.evaluate(() => window.__SIT_TASK);
      const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
        kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length, body:document.getElementById('rollModalBody').textContent}));
      await page.keyboard.press('Escape');
      check('SIT-FREE-RAISE-NO-DICE', [r.dice, r.kept, /Free Raise available/.test(r.body)], [7, 3, true]);
      await reset(page);
      check('SIT-FREE-RAISE-NEEDS-SCRIBE', await freeRaise({kind:'SKILL', c:{skillName:'Calligraphy', traitName:'Intelligence', skillRank:4}}), []);
    });

    await section('SIT-REAL-ROUTES', async () => {
      // Skill table: Perception 3 + Investigation 2 = 5k3; Wary declared = 6k4.
      await reset(page, ['Wary']);
      await page.evaluate(() => { const T = window.__L5R_TEST__;
        document.getElementById('skillsBody').appendChild(T.makeSkillRow({name:'Investigation', trait:'Perception', rank:2})); T.recalcAll();
        window.__SIT_TASK = T.rollSkill('Investigation', 'Perception', 2); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      if (!S28) await tick(page, 'Wary');
      await page.locator('#rollPreviewGo').click(); await page.evaluate(() => window.__SIT_TASK);
      check('SIT-ROUTE-SKILL-TABLE-WARY', await page.evaluate(() => [document.querySelectorAll('#rollDiceRow .roll-die').length,
        document.querySelectorAll('#rollDiceRow .roll-die.kept').length]), S28 ? [5, 3] : [6, 4]);
      await page.keyboard.press('Escape');
      // Trait label on Rings & Traits: Intelligence 3 = 3k3; Precise Memory declared = 4k4.
      await reset(page, ['Precise Memory']);
      await page.evaluate(() => { const label = document.querySelector('.trait-row label[data-trait-name="Intelligence"]');
        if (!label) throw Error('Intelligence trait label missing'); label.click(); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      check('SIT-ROUTE-TRAIT-LABEL-OFFERED', await boxes(page), S28 ? [] : [['Precise Memory', false]]);
      if (!S28) await tick(page, 'Precise Memory');
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      check('SIT-ROUTE-TRAIT-LABEL-DICE', await page.evaluate(() => [document.querySelectorAll('#rollDiceRow .roll-die').length,
        document.querySelectorAll('#rollDiceRow .roll-die.kept').length]), S28 ? [3, 3] : [4, 4]);
      await page.keyboard.press('Escape');
      // An Unskilled Temptation roll (the Untrained Skills list's context): Awareness 3 = 3k3, no
      // explosions (Core p.80) though the dice show 10s; Dangerous Beauty declared = 4k3.
      await reset(page, ['Dangerous Beauty']);
      let h = await open(page, 'TEMPTATION-UNSKILLED', [3, 3], {explode:false});
      await page.evaluate(() => { let i = 0; const seq = [10, 10, 3]; Math.random = () => ((seq[i++ % seq.length] - 0.5) / 10); });
      await tick(page, 'Dangerous Beauty');
      let r = await confirmRoll(page, h);
      check('SIT-ROUTE-UNSKILLED-NO-EXPLOSION', [r.dice, r.kept, Math.max(...r.totals)], [4, 3, 10]);
      // Crafty lifts an untrained Low Skill to Rank 1 (4.5.26); Temptation is still offered.
      await reset(page, ['Dangerous Beauty', 'Crafty']);
      check('SIT-ROUTE-CRAFTY-LIFTED-TEMPTATION', await page.evaluate(() => { const T = window.__L5R_TEST__;
        const c = T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Temptation', traitName:'Awareness', skillRank:1, unskilled:false, dice4526Lift:'Crafty'});
        return T.RD4515.offered(c).filter(o => o.provider === 'situational-entries').map(o => o.label.split(':')[0]); }), ['Dangerous Beauty']);
      // Gaijin Name keeps its once-only explosions on a Social roll with Imperial Spouse declared.
      await reset(page, ['Imperial Spouse'], ['Gaijin Name']);
      h = await open(page, 'COURTIER');
      await page.evaluate(() => { let i = 0; const seq = [10, 10, 3]; Math.random = () => ((seq[i++ % seq.length] - 0.5) / 10); });
      await tick(page, 'Imperial Spouse');
      r = await confirmRoll(page, h);
      check('SIT-ROUTE-GAIJIN-NAME-PRESERVED', [r.dice, r.kept, Math.max(...r.totals) <= 20, /at most once/.test(r.body)], [6, 4, true, true]);
    });

    await section('SIT-DESCRIPTIONS', async () => {
      const desc = await page.evaluate(() => Object.fromEntries(['Clear Thinker', 'Heartless'].map(n =>
        [n, window.__L5R_TEST__.ADV_LIBRARY.find(e => e.name === n).desc])));
      check('SIT-DESC-CLEAR-THINKER', /confuse or manipulate/.test(desc['Clear Thinker']) && /Dragon pay 2/.test(desc['Clear Thinker']));
      check('SIT-DESC-HEARTLESS', /persuade you, seduce you or change your mind/.test(desc.Heartless) && /Courtier, Sincerity or Temptation/.test(desc.Heartless));
      await reset(page);
      check('SIT-DESC-NEW-ROW-USES-TEXT', await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Heartless';
        s.dispatchEvent(new Event('change', {bubbles:true})); return document.querySelector('#advList .entry .en-desc')?.value || ''; }),
        desc.Heartless);
    });

    await section('SIT-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:900});
        await reset(page, NINE);
        const h = await open(page, 'TEMPTATION');
        const fit = await page.evaluate(() => { const b = document.querySelector('.rd4515-declare'), vw = document.documentElement.clientWidth;
          const opts = [...b.querySelectorAll('.rd4515-opt')];
          return {block:b.scrollWidth <= b.clientWidth + 1, options:opts.length,
            inside:opts.every(o => { const r = o.getBoundingClientRect(); return r.left >= -1 && r.right <= vw + 1; })}; });
        await cancelRoll(page, h);
        check('SIT-GEOMETRY-' + width, fit, {block:true, options:7, inside:true});
      }
      await page.setViewportSize({width:375, height:812});
    });
  } finally {
    check('SIT-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('SIT-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
