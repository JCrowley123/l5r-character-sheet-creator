/* Real-browser acceptance tests for Phase 4.5.33 Void and Initiative Entries (Part I).
 * Expected values come from the Core Rulebook and the owner's rulings of 9 October 2026, or from the trunk's own
 * functions (Void's +1k1 from voidPreRollModifiers, the round ledger, the dice engine), never from VI4533:
 *   Daredevil (p.147) Void +3k1 on Athletics; Touch of the Void (p.162) Void +2k1, Willpower TN 30 after a spend;
 *   the two do not stack (Athletics: +3k1). Momoku (p.161) no general Void spends. Quick (p.152) +Reflexes once a
 *   Round you did not act first, for the skirmish. Leadership (p.151) School Rank + 1k1 for an ally, once a Round.
 * node void-initiative-harness.js <sheet.html>
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
const ADV = ['Daredevil', 'Quick', 'Leadership'];

async function setup(page, entries = [], {wrongList = false, reflexes = 3, rank = 2} = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(({entries, ADV, wrongList, reflexes, rank}) => {
    document.querySelectorAll('.roll-modal-overlay, #appConfirmOverlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
    for (const id of ['trait_reflexes', 'trait_willpower', 'trait_agility', 'trait_awareness']) {
      const el = document.getElementById(id); el.value = id === 'trait_reflexes' ? reflexes : 3; el.dataset.free = el.value; }
    document.getElementById('f_rank').value = rank;
    document.getElementById('void_current').value = 2;
    T.setCombatActive(false); T.resetCombatRound(); T.clearVoidPending();
    for (const name of entries) {
      const own = ADV.includes(name) ? 'advList' : 'disadvList';
      const list = wrongList ? (own === 'advList' ? 'disadvList' : 'advList') : own;
      const lib = [...T.ADV_LIBRARY, ...T.DISADV_LIBRARY].find(x => x.name === name);
      document.getElementById(list).appendChild(T.makeEntry({name, cost:lib.cost, desc:lib.desc}, true));
    }
    T.recalcAll();
  }, {entries, ADV, wrongList, reflexes, rank});
}
// Void dice on a roll: the summed deltas of every 'void' modifier [rolled, kept].
const voidDice = (page, kind, extra = {}, armed = true) => page.evaluate(({kind, extra, armed}) => {
  const T = window.__L5R_TEST__;
  T.setVoidPending(armed ? {k1:true} : {});
  const mods = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], extra)).filter(m => m.source === 'void');
  T.clearVoidPending();
  return [mods.reduce((s, m) => s + m.rolledDelta, 0), mods.reduce((s, m) => s + m.keptDelta, 0)];
}, {kind, extra, armed});
const row = (page, name) => page.evaluate(name => {
  const div = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(d => d.querySelector('.en-name').value === name);
  const r = div && div.querySelector('.vi4533-row');
  return r ? {buttons:[...r.querySelectorAll('button')].map(b => [b.textContent, b.disabled, b.title]),
    notes:[...r.querySelectorAll('.vi4533-note')].map(n => n.textContent)} : null; }, name);
const press = (page, name) => page.evaluate(name => {
  const div = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(d => d.querySelector('.en-name').value === name);
  div.querySelector('.vi4533-row button').click(); }, name);
const ledger = (page, key) => page.evaluate(key => { const L = window.__L5R_TEST__.getRoundLedger();
  return Object.keys(L).map(r => L[r][key]).filter(v => v !== undefined); }, key);

async function main() {
  const sheet = path.resolve(process.argv[2]);
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await (await browser.newContext({viewport:{width:390, height:844}})).newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(sheet).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout:60000});
    check('VI-SEAM', await page.evaluate(() => typeof window.__L5R_TEST__.VI4533), 'object');

    await section('VI-VOID', async () => {
      await setup(page, []);
      const base = await voidDice(page, 'SKILL', {skillName:'Athletics'});
      check('VI-CORE-VOID-ORACLE', base, [1, 1]);
      await setup(page, ['Daredevil']);
      check('VI-DAREDEVIL-ATHLETICS', await voidDice(page, 'SKILL', {skillName:'Athletics'}), [3, 1]);
      check('VI-DAREDEVIL-ATHLETICS-EMPHASIS', await voidDice(page, 'SKILL', {skillName:'Athletics (Running)'}), [3, 1]);
      check('VI-DAREDEVIL-OTHER-SKILL', await voidDice(page, 'SKILL', {skillName:'Kenjutsu'}), base);
      check('VI-DAREDEVIL-TRAIT', await voidDice(page, 'TRAIT', {traitName:'Agility'}), base);
      check('VI-DAREDEVIL-NOT-ARMED', await voidDice(page, 'SKILL', {skillName:'Athletics'}, false), [0, 0]);
      await setup(page, ['Touch of the Void']);
      check('VI-TOUCH-SKILL', await voidDice(page, 'SKILL', {skillName:'Courtier'}), [2, 1]);
      check('VI-TOUCH-TRAIT', await voidDice(page, 'TRAIT', {traitName:'Willpower'}), [2, 1]);
      check('VI-TOUCH-NOT-DAMAGE', await voidDice(page, 'DAMAGE', {}), [0, 0]);
      check('VI-TOUCH-NOT-ARMED', await voidDice(page, 'SKILL', {skillName:'Courtier'}, false), [0, 0]);
      await setup(page, ['Daredevil', 'Touch of the Void']);
      check('VI-BOTH-NO-STACK', [await voidDice(page, 'SKILL', {skillName:'Athletics'}), await voidDice(page, 'SKILL', {skillName:'Courtier'})], [[3, 1], [2, 1]]);
      await setup(page, ['Daredevil', 'Touch of the Void'], {wrongList:true});
      check('VI-WRONG-LIST-NOTHING', [await voidDice(page, 'SKILL', {skillName:'Athletics'}), await page.evaluate(() => document.querySelectorAll('.vi4533-row').length)], [base, 0]);
      // Through a real roll: the preview's pool, Void ticked inside it.
      await setup(page, ['Daredevil']);
      await page.evaluate(() => { const T = window.__L5R_TEST__; T.setVoidPending({k1:true}); });
      const pool = await page.evaluate(async () => { const T = window.__L5R_TEST__;
        const c = T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Athletics', traitName:'Strength', skillRank:2});
        const adj = T.applyPreRollModifiers(5, 3, T.getPreRollModifiers(c)); T.clearVoidPending(); return [adj.rolled, adj.kept]; });
      check('VI-DAREDEVIL-POOL', pool, [8, 4]);
    });

    await section('VI-MOMOKU', async () => {
      await setup(page, []);
      check('VI-VOID-OPEN-WITHOUT', await page.evaluate(() => window.__L5R_TEST__.canSpendVoid('k1').ok));
      await setup(page, ['Momoku']);
      const m = await page.evaluate(() => { const T = window.__L5R_TEST__; T.setCombatActive(true); T.renderVoidPanel();
        const keys = T.VOID_SPEND_LIBRARY.map(o => o.key);
        const out = {all:keys.every(k => !T.canSpendVoid(k).ok && /Momoku/.test(T.canSpendVoid(k).reason)),
          kiho:!T.canSpendVoid('kiho').ok,
          buttons:[...document.querySelectorAll('#voidSpendButtons .void-spend-btn')].every(b => b.disabled),
          reason:/Momoku/.test(document.getElementById('voidDisabledReason').textContent)};
        T.setVoidPending({k1:true});
        out.armedDropped = !T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier'})).some(x => x.source === 'void');
        T.clearVoidPending(); T.setCombatActive(false); return out; });
      check('VI-MOMOKU-CLOSES-VOID', m, {all:true, kiho:true, buttons:true, reason:true, armedDropped:true});
      check('VI-MOMOKU-PIPS-STAY', await page.evaluate(() => { const v = document.getElementById('void_current'); return !v.disabled; }));
      check('VI-MOMOKU-NOTE', (await row(page, 'Momoku')).notes.length, 1);
    });

    await section('VI-QUICK', async () => {
      await setup(page, ['Quick'], {reflexes:3});
      check('VI-QUICK-OUT-OF-COMBAT', (await row(page, 'Quick')).buttons[0].slice(1), [true, 'Start a combat round first.']);
      await page.evaluate(() => { window.__L5R_TEST__.setCombatActive(true); window.__L5R_TEST__.recalcAll(); });
      await press(page, 'Quick');
      check('VI-QUICK-USE', [await ledger(page, 'Quick'), (await row(page, 'Quick')).buttons[0].slice(1), (await row(page, 'Quick')).notes[0]],
        [[3], [true, 'Already used this Round.'], 'Initiative Score +3 this skirmish.']);
      await page.evaluate(() => document.getElementById('btnNextRound').click());
      await page.evaluate(() => { const el = document.getElementById('trait_reflexes'); el.value = 4; window.__L5R_TEST__.recalcAll(); });
      check('VI-QUICK-NEXT-ROUND-OPEN', (await row(page, 'Quick')).buttons[0][1], false);
      await press(page, 'Quick');
      check('VI-QUICK-ADDS-UP', [await ledger(page, 'Quick'), (await row(page, 'Quick')).notes[0]], [[3, 4], 'Initiative Score +7 this skirmish.']);
      const init = await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE, {})).filter(m => m.source === 'quick').map(m => m.totalDelta); });
      check('VI-QUICK-ON-INITIATIVE', init, [7]);
      check('VI-QUICK-NOT-ON-SKILLS', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier'})).some(m => m.source === 'quick'); }), false);
      check('VI-QUICK-ROUND-NOTE', await page.evaluate(() => /Quick \(4\)/.test(document.getElementById('combatRoundNote').textContent)));
      await page.evaluate(() => document.getElementById('btnResetRounds').click());
      check('VI-QUICK-RESET', [await ledger(page, 'Quick'), (await row(page, 'Quick')).notes[0]], [[], 'Each Round you did not act first, in the Reactions Stage.']);
      await page.evaluate(() => { window.__L5R_TEST__.recordRoundSpend('Quick', 5); });
      await setup(page, []);
      await page.evaluate(() => { window.__L5R_TEST__.setCombatActive(true); window.__L5R_TEST__.recordRoundSpend('Quick', 5); });
      check('VI-QUICK-NEEDS-ROW', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE, {})).some(m => m.source === 'quick'); }), false);
    });

    await section('VI-LEADERSHIP', async () => {
      await setup(page, ['Leadership']);
      const rank = await page.evaluate(() => parseInt(document.getElementById('f_rank').value, 10));
      check('VI-LEAD-OUT-OF-COMBAT', (await row(page, 'Leadership')).buttons[0].slice(1), [true, 'Start a combat round first.']);
      await page.evaluate(() => { window.__L5R_TEST__.setCombatActive(true); window.__L5R_TEST__.recalcAll(); });
      await page.evaluate(() => { let i = 0; const faces = [7]; Math.random = () => ((faces[i++ % faces.length] - 0.5) / 10); });
      await press(page, 'Leadership');
      await page.waitForSelector('#rollDiceRow .roll-die');
      const r = await page.evaluate(() => ({title:document.getElementById('rollModalTitle').textContent,
        dice:document.querySelectorAll('#rollDiceRow .roll-die').length, total:+document.getElementById('rollTotalDisplay').textContent,
        note:[...document.querySelectorAll('#rollModalBody .roll-note')].map(n => n.textContent).join('|')}));
      await page.keyboard.press('Escape');
      check('VI-LEAD-ROLL', [r.title, r.dice, r.total, r.note.includes('School Rank: +' + rank), /Ten Dice Rule/.test(r.note), rank >= 1],
        ['Leadership — 1k1 + School Rank ' + rank + ', for one ally', 1, 7 + rank, true, false, true]);
      check('VI-LEAD-ONCE-A-ROUND', [await ledger(page, 'Leadership'), (await row(page, 'Leadership')).buttons[0].slice(1),
        (await row(page, 'Leadership')).notes[0]], [[7 + rank], [true, 'Already used this Round.'], 'This Round: ' + (7 + rank) + ' to one ally’s Initiative Score.']);
      check('VI-LEAD-NOTHING-ON-SELF', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.INITIATIVE, {})).some(m => /Leadership/.test(m.label)); }), false);
    });

    await section('VI-TOUCH-CHECK', async () => {
      await setup(page, ['Touch of the Void']);
      check('VI-TOUCH-ROW', await row(page, 'Touch of the Void'), {buttons:[['Willpower (TN 30)', false, '']],
        notes:['After every Void Point you spend. A Void Point on a roll gives +2k1, added in the roll.']});
      await page.evaluate(() => { let i = 0; const faces = [9, 9, 9]; Math.random = () => ((faces[i++ % faces.length] - 0.5) / 10); });
      await press(page, 'Touch of the Void');
      await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
      const pool = await page.locator('.rp-pool-final').textContent();
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      const r = await page.evaluate(() => ({title:document.getElementById('rollModalTitle').textContent, note:document.getElementById('rollResultNote').textContent}));
      await page.keyboard.press('Escape');
      check('VI-TOUCH-CHECK-TN30', [r.title, /3k3/.test(pool), /Dazed/.test(r.note)], ['Touch of the Void — Willpower vs TN 30', true, true]);
    });

    // Device correction, 10 October 2026: Touch of the Void's check opens by itself after every Void Point spent.
    // Oracle: Core Rulebook p.162 (a Willpower roll, TN 30, after each Void Point spent) and the sheet's own Void
    // Points; the rolls go through the Skills table's dice button and the roll preview's real controls.
    await section('VI-TOUCH-AUTO', async () => {
      const CHECK = 'Touch of the Void — Willpower vs TN 30';
      const settle = () => page.waitForTimeout(400);
      const state = () => page.evaluate(() => ({
        preview:document.getElementById('rollPreviewOverlay').style.display === 'flex',
        result:getComputedStyle(document.getElementById('rollModalOverlay')).display !== 'none',
        title:document.getElementById('rollModalTitle').textContent,
        previewTitle:(document.querySelector('#rollPreviewOverlay h3') || {}).textContent || '',
        tn:(document.querySelector('#rollModalBody .roll-tn-note') || {}).textContent || '',
        voids:window.__L5R_TEST__.getVoidPoints()}));
      const skillRoll = () => page.evaluate(() => {
        const T = window.__L5R_TEST__, body = document.getElementById('skillsBody');
        let tr = body.querySelector('tr[data-vi-test]');
        if (!tr) { tr = T.makeSkillRow({name:'Courtier', trait:'Awareness', rank:2}); tr.dataset.viTest = '1'; body.appendChild(tr); }
        tr.querySelector('.sk-roll').click(); });
      const tickVoidAndRoll = async () => {
        await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
        await page.locator('#rollPreviewBody [data-void-key="k1"]').check();
        await page.locator('#rollPreviewGo').click();
        await page.waitForSelector('#rollDiceRow .roll-die');
      };
      const closeResult = () => page.locator('#rollModalClose').click();
      const rollCheck = async () => {
        await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
        await page.locator('#rollPreviewGo').click();
        await page.waitForSelector('#rollDiceRow .roll-die');
        const s = await state(); await closeResult(); return s;
      };

      await setup(page, ['Touch of the Void']);
      await skillRoll();
      await tickVoidAndRoll();
      await settle();
      const during = await state();
      await closeResult();
      await settle();
      const opened = await state();
      const check1 = opened.preview ? await rollCheck() : {};
      await settle();
      const after = await state();
      check('VI-TOUCH-AUTO-AFTER-THE-ROLL', {during:[during.result, during.title !== CHECK, during.preview, during.voids],
        opened:[opened.preview, opened.result], check:[check1.title, check1.tn, check1.voids], after:[after.preview, after.result]},
        {during:[true, true, false, 1], opened:[true, false], check:[CHECK, 'Target Number: 30', 1], after:[false, false]});

      await skillRoll();
      await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
      await page.locator('#rollPreviewBody [data-void-key="k1"]').check();
      await page.locator('#rollPreviewCancel').click();
      await settle();
      const cancelled = await state();
      check('VI-TOUCH-CANCEL-NO-CHECK', [cancelled.preview, cancelled.result, cancelled.voids], [false, false, 1]);

      // A Void card spend that makes no roll: the check at once.
      await setup(page, ['Touch of the Void']);
      await page.evaluate(() => { const T = window.__L5R_TEST__; T.setCombatActive(true); T.renderVoidPanel?.(); });
      await page.evaluate(() => document.querySelector('#voidSpendButtons [data-void="init"]').click());
      await settle();
      const card = await state();
      const check2 = card.preview ? await rollCheck() : null;
      check('VI-TOUCH-CARD-AT-ONCE', [card.preview, card.voids, check2 && check2.title], [true, 1, CHECK]);

      // Void armed from the card for the next roll: checked after that roll, not before it.
      await setup(page, ['Touch of the Void']);
      await page.evaluate(() => document.querySelector('#voidSpendButtons [data-void="k1"]').click());
      await settle();
      const armed = await state();
      await skillRoll();
      await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      await settle();
      const armedDuring = await state();
      await closeResult();
      await settle();
      const armedAfter = await state();
      if (armedAfter.preview) await rollCheck();
      check('VI-TOUCH-ARMED-WAITS-FOR-ITS-ROLL', [armed.preview, armed.voids, armedDuring.title !== CHECK, armedAfter.preview], [false, 1, true, true]);

      // Two Void Points spent in one go (an Ancestor's price and a Void tick on one roll): two checks, then none.
      await setup(page, ['Touch of the Void']);
      await page.evaluate(() => { const T = window.__L5R_TEST__; document.getElementById('void_current').value = 3;
        if (T.consumeVoidPoint) { T.consumeVoidPoint(); T.consumeVoidPoint(); } });
      await settle();
      const titles = [];
      for (let i = 0; i < 3; i++) {
        const s = await state();
        if (!s.preview) break;
        titles.push((await rollCheck()).title);
        await settle();
      }
      check('VI-TOUCH-TWO-SPENDS-TWO-CHECKS', [titles, (await state()).voids], [[CHECK, CHECK], 1]);

      // Only with Touch of the Void on its own list, and the row's button stays.
      await setup(page, ['Touch of the Void'], {wrongList:true});
      await page.evaluate(() => window.__L5R_TEST__.consumeVoidPoint?.());
      await settle();
      const wrong = await state();
      await setup(page, []);
      await page.evaluate(() => window.__L5R_TEST__.consumeVoidPoint?.());
      await settle();
      const none = await state();
      await setup(page, ['Touch of the Void']);
      check('VI-TOUCH-ONLY-ITS-OWN-LIST', [wrong.preview, none.preview, (await row(page, 'Touch of the Void')).buttons[0][0]],
        [false, false, 'Willpower (TN 30)']);
    });

    await section('VI-UI', async () => {
      await setup(page, ['Daredevil', 'Quick', 'Leadership', 'Touch of the Void', 'Momoku']);
      await page.evaluate(() => { window.__L5R_TEST__.setCombatActive(true); window.__L5R_TEST__.MODES12.set('play'); window.__L5R_TEST__.recalcAll(); });
      check('VI-PLAY-MODE', await page.evaluate(() => [...document.querySelectorAll('.vi4533-btn')].map(b => [b.offsetParent !== null, b.disabled])),
        [[true, false], [true, false], [true, false]]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      check('VI-STYLED', await page.evaluate(() => getComputedStyle(document.querySelector('.vi4533-row')).display), 'flex');
      await page.setViewportSize({width:320, height:900});
      await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; const pages = [...document.querySelectorAll('[data-car-slug]')];
        C.goToTab(pages.findIndex(p => p.contains(document.getElementById('advList')))); await C.whenSettled(); });
      check('VI-ROW-LAYOUT-320', await page.evaluate(() => [...document.querySelectorAll('.vi4533-row')].every(row => {
        const e = row.closest('.entry').getBoundingClientRect(), r = row.getBoundingClientRect();
        return r.width > 0 && [...row.children].every(c => { const b = c.getBoundingClientRect(); return b.left >= e.left - 1 && b.right <= e.right + 1; }); })));
      await page.setViewportSize({width:390, height:844});
      check('VI-NOTHING-SAVED', await page.evaluate(() => [...document.querySelectorAll('#advList .entry, #disadvList .entry')].every(d => !d.dataset.advConfig)));
    });
  } finally {
    check('VI-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('VI-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
