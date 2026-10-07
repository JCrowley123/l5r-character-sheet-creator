/* Real-browser acceptance tests for Phase 4.5.28 Situational Entry Buttons and Gates (Part I).
 * Every expected value comes from the books and the owner's rulings of 7 October 2026, never
 * from SIT4528 itself:
 *   Wary (Core p.155): +1k1 on the Investigation (Notice) / Perception roll to detect an ambush.
 *     Ruling: a Spot ambush button opens that roll; no tick on ordinary Investigation rolls.
 *     Device correction (owner, 7 October): the tick on the Spot ambush roll was redundant, so
 *     the +1k1 is applied as a modifier, like Recall's; the roll does not need the Notice
 *     Emphasis (the notation names the roll), confirmed the same day.
 *   Precise Memory (Core p.152): +1k1 on an Intelligence Trait Roll to recall exactly.
 *     Ruling: a Recall button opens that roll with +1k1 applied as a modifier, not a tick; no
 *     tick on ordinary Intelligence rolls.
 *   Imperial Scribe (Imperial Histories p.67) requires Status 2+ and Calligraphy 4+; Sacrosanct
 *     requires Honor 6.0+. Ruling: greyed out in the Advantage picker with the requirement (the
 *     Feature 4.5.5 standard); a row that does not meet it says why, and Imperial Scribe's +1k0
 *     and Free Raise are not offered.
 *   Device correction: a row's requirement note follows a Rank or Points change typed into the
 *     sheet's own boxes, without anything else being touched.
 *   A Skill Roll is Trait + Rank rolled, Trait kept; Rank 0 rolls the Trait alone and its dice
 *     do not explode (Core p.80). An Emphasis re-rolls 1s.
 * node situational-buttons-harness.js <sheet.html>
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

const SCRIBE_LABEL = ' — needs Status 2+ and Calligraphy 4+';
const SACROSANCT_LABEL = ' — needs Honor 6.0+';
const OTHERS = ['Balance', 'Clear Thinker', 'Dangerous Beauty', 'Heartless', 'Imperial Spouse', 'Irreproachable'];

// ---- Page helpers ----
// Every reset sets Perception, Intelligence and Awareness 3, Status 1.0 and Honor 5.0.
async function reset(page, adv = [], skills = [], fields = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(({adv, skills, fields}) => {
    document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
    T.clearOneRollVoidPending?.(); T.saveSchoolsList?.([]);
    const set = (id, v) => { document.getElementById(id).value = v; };
    for (const id of ['trait_perception', 'trait_intelligence', 'trait_awareness', 'trait_willpower']) set(id, 3);
    set('f_statusRank', 1); set('f_statusPts', '1.0'); set('f_honorRank', 5); set('f_honorPts', '5.0');
    for (const [id, v] of Object.entries(fields)) set(id, v);
    for (const s of skills) document.getElementById('skillsBody').appendChild(T.makeSkillRow(s));
    for (const name of adv) window.__SB.add(name);
    T.recalcAll();
    let i = 0; const seq = [6, 4, 7, 3, 5, 2, 8, 1]; Math.random = () => ((seq[i++ % seq.length] - 0.5) / 10);
  }, {adv, skills, fields});
}
const rowLine = (page, name) => page.evaluate(name => {
  const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === name);
  const row = div && div.querySelector('.sit4528-row');
  return row ? {text:row.textContent, buttons:[...row.querySelectorAll('button')].map(b => b.textContent)} : null; }, name);
const option = (page, name) => page.evaluate(name => {
  const o = [...document.getElementById('advQuickAdd').options].find(x => x.value === name);
  return o ? [o.disabled, o.textContent.slice(o.dataset.baseLabel ? o.dataset.baseLabel.length : 0)] : null; }, name);
const sitBoxes = page => page.evaluate(() => [...document.querySelectorAll('[data-rd4515-key^="situational-entries:"]')]
  .map(b => [b.closest('.rd4515-opt').textContent.split(':')[0], b.checked]));
const poolText = page => page.locator('.rp-pool-final').textContent();
async function press(page, text) {
  const task = page.evaluate(text => { const b = [...document.querySelectorAll('#advList .sit4528-btn')].find(x => x.textContent === text);
    if (!b) throw Error('No ' + text + ' button'); b.click(); return true; }, text);
  await task;
  await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
}
async function confirmRoll(page) {
  await page.locator('#rollPreviewGo').click();
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
    kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
    totals:[...document.querySelectorAll('#rollDiceRow .roll-die')].map(e => +e.dataset.total),
    title:document.getElementById('rollModalTitle').textContent,
    emphasis:!!document.getElementById('emphasisRerollBar'),
    body:document.getElementById('rollModalBody')?.textContent || ''}));
  await page.keyboard.press('Escape');
  return r;
}
async function cancelRoll(page) {
  await page.locator('#rollPreviewCancel').click();
  await page.waitForFunction(() => !document.querySelector('#rollPreviewGo') || !document.querySelector('#rollPreviewGo').offsetParent);
}
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
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.CL11?.close?.();
      window.__SB = {add(name, list = 'advList') {
        const lib = T.ADV_LIBRARY.find(x => x.name === name);
        const row = T.makeEntry({name, cost:lib ? lib.cost : 0, desc:lib ? lib.desc : ''}, true);
        document.getElementById(list).appendChild(row); return row; }};
    });

    await section('SB-START', async () => {
      check('SB-SEAM', await page.evaluate(() => window.__L5R_TEST__.SITUATIONAL_BUTTONS_ENABLED === true && !!window.__L5R_TEST__.SIT4528));
      check('SB-REGISTRY-STILL-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('SB-CATALOGUE-HAS-FOUR', await page.evaluate(() => ['Wary', 'Precise Memory', 'Imperial Scribe', 'Sacrosanct']
        .filter(n => window.__L5R_TEST__.ADV_LIBRARY.some(e => e.name === n)).length), 4);
    });

    await section('SB-ROWS', async () => {
      await reset(page, ['Wary', 'Precise Memory', ...OTHERS]);
      check('SB-ROW-WARY-BUTTON', await rowLine(page, 'Wary'), {text:'Spot ambush', buttons:['Spot ambush']});
      check('SB-ROW-MEMORY-BUTTON', await rowLine(page, 'Precise Memory'), {text:'Recall', buttons:['Recall']});
      const others = [];
      for (const name of OTHERS) others.push(await rowLine(page, name));
      check('SB-ROW-OTHERS-UNTOUCHED', others, OTHERS.map(() => null));
      check('SB-BUTTONS-NAMED-NOT-TITLED', await page.evaluate(() => [...document.querySelectorAll('#advList .sit4528-btn')]
        .map(b => [b.type, /Investigation \(Notice\) \/ Perception|Intelligence/.test(b.getAttribute('aria-label') || ''), b.hasAttribute('title')])),
        [['button', true, false], ['button', true, false]]);
      check('SB-ROW-UNDER-NAME', await page.evaluate(() => { const d = document.querySelector('#advList .entry');
        return d.querySelector('.entry-top').nextElementSibling === d.querySelector('.sit4528-row'); }));
      await page.evaluate(() => window.__L5R_TEST__.recalcAll());
      check('SB-ROW-NOT-DUPLICATED-BY-RECALC', await page.evaluate(() => document.querySelectorAll('#advList .sit4528-row').length), 2);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play'));
      check('SB-BUTTONS-USABLE-IN-PLAY', await page.evaluate(() => [...document.querySelectorAll('#advList .sit4528-btn')]
        .map(b => !!b.offsetParent && !b.disabled)), [true, true]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
      check('SB-NOTHING-SAVED', await page.evaluate(() => /sit4528|Spot ambush|Recall/.test(JSON.stringify(window.__L5R_TEST__.collectData()))), false);
      await page.evaluate(() => { const n = [...document.querySelectorAll('#advList .en-name')].find(e => e.value === 'Wary'); n.value = 'Wary Eye'; window.__L5R_TEST__.recalcAll(); });
      check('SB-ROW-RENAMED-LOSES-BUTTON', await rowLine(page, 'Wary Eye'), null);
      await reset(page);
      await page.evaluate(() => { window.__SB.add('Wary', 'disadvList'); window.__SB.add('Precise Memory', 'disadvList'); window.__L5R_TEST__.recalcAll(); });
      check('SB-DISADVANTAGE-LIST-NO-BUTTON', await page.evaluate(() => document.querySelectorAll('.sit4528-row').length), 0);
    });

    await section('SB-AMBUSH', async () => {
      // Perception 3 + Investigation 2 = 5k3; Wary +1k1 = 6k4.
      await reset(page, ['Wary'], [{name:'Investigation', trait:'Perception', rank:2}]);
      await press(page, 'Spot ambush');
      check('SB-AMBUSH-NO-TICK', await sitBoxes(page), []);
      check('SB-AMBUSH-PREVIEW', [await poolText(page), /Wary/.test(await page.locator('#rollPreviewBody').textContent())], ['6k4', true]);
      let r = await confirmRoll(page);
      check('SB-AMBUSH-DICE', [r.dice, r.kept, /Wary/.test(r.body)], [6, 4, true]);
      check('SB-AMBUSH-TITLE-NAMES-THE-ROLL', r.title, 'Spot ambush — Investigation (Notice) / Perception');
      check('SB-AMBUSH-REROLL-KEEPS-IT', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Investigation', traitName:'Perception', skillRank:2, sit4528:'ambush'}))
          .filter(m => m.label === 'Wary').map(m => [m.rolledDelta, m.keptDelta]); }), [[1, 1]]);
      await press(page, 'Spot ambush');
      check('SB-AMBUSH-APPLIED-AGAIN-NEXT-TIME', [await sitBoxes(page), await poolText(page)], [[], '6k4']);
      await cancelRoll(page);
      // An ordinary Investigation roll from the Skills table: no Wary tick, 5k3, ordinary title.
      await page.evaluate(() => { window.__SB_TASK = window.__L5R_TEST__.rollSkill('Investigation', 'Perception', 2); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      check('SB-ORDINARY-INVESTIGATION-NO-WARY', [await sitBoxes(page), await poolText(page)], [[], '5k3']);
      r = await confirmRoll(page);
      check('SB-ORDINARY-INVESTIGATION-ROLL', [r.dice, r.kept, r.title], [5, 3, 'Investigation']);
      // Unskilled: Perception 3 alone = 3k3, +1k1 = 4k4, and 10s do not explode.
      await reset(page, ['Wary']);
      await page.evaluate(() => { let i = 0; const seq = [10, 10, 3]; Math.random = () => ((seq[i++ % seq.length] - 0.5) / 10); });
      await press(page, 'Spot ambush');
      check('SB-AMBUSH-UNSKILLED-PREVIEW', await poolText(page), '4k4');
      r = await confirmRoll(page);
      check('SB-AMBUSH-UNSKILLED-NO-EXPLOSION', [r.dice, r.kept, Math.max(...r.totals)], [4, 4, 10]);
      // The Notice Emphasis: its re-roll of 1s is offered after the roll, as for any Skill Roll.
      await reset(page, ['Wary'], [{name:'Investigation', trait:'Perception', rank:2, emph:'Notice'}]);
      await press(page, 'Spot ambush');
      r = await confirmRoll(page);
      check('SB-AMBUSH-NOTICE-EMPHASIS-OFFERED', [r.dice, r.emphasis], [6, true]);
      await reset(page, ['Wary'], [{name:'Investigation', trait:'Perception', rank:2}]);
      await press(page, 'Spot ambush');
      r = await confirmRoll(page);
      check('SB-AMBUSH-NO-EMPHASIS-NONE-OFFERED', r.emphasis, false);
      // Cancelling spends nothing and leaves no mark on the next roll.
      await press(page, 'Spot ambush');
      await cancelRoll(page);
      await page.evaluate(() => { window.__SB_TASK = window.__L5R_TEST__.rollSkill('Investigation', 'Perception', 2); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      check('SB-AMBUSH-CANCEL-NO-CARRY', [await sitBoxes(page), await poolText(page)], [[], '5k3']);
      r = await confirmRoll(page);
      check('SB-AMBUSH-CANCEL-NEXT-TITLE', r.title, 'Investigation');
      // Without Wary on the list, the button's roll does nothing.
      await reset(page, [], [{name:'Investigation', trait:'Perception', rank:2}]);
      check('SB-AMBUSH-NEEDS-WARY', [await page.evaluate(() => window.__L5R_TEST__.SIT4528.ambush()), await previewOpen(page)], [null, false]);
      // A Spot ambush roll that skips the preview still carries Wary, once.
      await reset(page, ['Wary']);
      await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.rollWithModifiers('No preview', T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Investigation', traitName:'Perception', skillRank:2, sit4528:'ambush'}), 5, 3, {skipPreview:true}); });
      check('SB-AMBUSH-SKIPPED-PREVIEW-STILL-APPLIES', await page.evaluate(() => [document.querySelectorAll('#rollDiceRow .roll-die').length,
        document.querySelectorAll('#rollDiceRow .roll-die.kept').length]), [6, 4]);
      await page.keyboard.press('Escape');
      // Only a roll the button made carries Wary: an ordinary Investigation / Perception roll never
      // does, and Wary is offered as a tick on no roll at all.
      check('SB-UNMARKED-ROLL-NEVER-GETS-WARY', await page.evaluate(() => { const T = window.__L5R_TEST__;
        const c = T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Investigation', traitName:'Perception', skillRank:2});
        return [T.getPreRollModifiers(c).filter(m => m.label === 'Wary').length,
          T.RD4515.offered(c).filter(o => o.key === 'situational-entries:wary').length]; }), [0, 0]);
      // In Play mode.
      await reset(page, ['Wary'], [{name:'Investigation', trait:'Perception', rank:2}]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play'));
      await press(page, 'Spot ambush');
      r = await confirmRoll(page);
      check('SB-AMBUSH-IN-PLAY', [r.dice, r.kept], [6, 4]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
    });

    await section('SB-RECALL', async () => {
      // Intelligence 3 = 3k3; Precise Memory +1k1 = 4k4, applied, not a tick.
      await reset(page, ['Precise Memory']);
      await press(page, 'Recall');
      check('SB-RECALL-NO-TICK', await sitBoxes(page), []);
      check('SB-RECALL-PREVIEW', [await poolText(page), /Precise Memory/.test(await page.locator('#rollPreviewBody').textContent())], ['4k4', true]);
      let r = await confirmRoll(page);
      check('SB-RECALL-DICE', [r.dice, r.kept, /Precise Memory/.test(r.body), r.title], [4, 4, true, 'Recall — Intelligence Trait Roll']);
      check('SB-RECALL-REROLL-KEEPS-IT', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.TRAIT, {traitName:'Intelligence', sit4528:'recall'}))
          .filter(m => m.label === 'Precise Memory').map(m => [m.rolledDelta, m.keptDelta]); }), [[1, 1]]);
      // The ordinary Intelligence roll from Rings & Traits: no tick and no bonus.
      await page.evaluate(() => document.querySelector('.trait-row label[data-trait-name="Intelligence"]').click());
      await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      check('SB-ORDINARY-INTELLIGENCE-NO-MEMORY', [await sitBoxes(page), await poolText(page)], [[], '3k3']);
      r = await confirmRoll(page);
      check('SB-ORDINARY-INTELLIGENCE-ROLL', [r.dice, r.kept, /Precise Memory/.test(r.body)], [3, 3, false]);
      await reset(page, ['Precise Memory', 'Precise Memory']);
      await press(page, 'Recall');
      check('SB-RECALL-TWO-ROWS-ONCE', await poolText(page), '4k4');
      await cancelRoll(page);
      await reset(page);
      check('SB-RECALL-NEEDS-PRECISE-MEMORY', [await page.evaluate(() => window.__L5R_TEST__.SIT4528.recall()), await previewOpen(page)], [null, false]);
      await reset(page, ['Precise Memory']);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play'));
      await press(page, 'Recall');
      r = await confirmRoll(page);
      check('SB-RECALL-IN-PLAY', [r.dice, r.kept], [4, 4]);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
    });

    await section('SB-PICKER', async () => {
      await reset(page);
      check('SB-PICKER-SCRIBE-GREYED', await option(page, 'Imperial Scribe'), [true, SCRIBE_LABEL]);
      check('SB-PICKER-SACROSANCT-GREYED', await option(page, 'Sacrosanct'), [true, SACROSANCT_LABEL]);
      check('SB-PICKER-OTHERS-UNCHANGED', await page.evaluate(n => n.map(name => {
        const o = [...document.getElementById('advQuickAdd').options].find(x => x.value === name); return o && o.disabled; }),
        ['Wary', 'Precise Memory', ...OTHERS]), ['Wary', 'Precise Memory', ...OTHERS].map(() => false));
      const cases = [
        ['SB-PICKER-SCRIBE-MET', {f_statusPts:'2.0', f_statusRank:2}, [{name:'Calligraphy', trait:'Intelligence', rank:4}], [false, '']],
        ['SB-PICKER-SCRIBE-STATUS-1.9', {f_statusPts:'1.9'}, [{name:'Calligraphy', trait:'Intelligence', rank:4}], [true, SCRIBE_LABEL]],
        ['SB-PICKER-SCRIBE-CALLIGRAPHY-3', {f_statusPts:'2.0', f_statusRank:2}, [{name:'Calligraphy', trait:'Intelligence', rank:3}], [true, SCRIBE_LABEL]],
        ['SB-PICKER-SCRIBE-HIGHEST-ROW', {f_statusPts:'2.5', f_statusRank:2}, [{name:'Calligraphy', trait:'Intelligence', rank:1},
          {name:'Calligraphy (Seals)', trait:'Intelligence', rank:4}], [false, '']],
      ];
      for (const [id, fields, skills, expected] of cases) { await reset(page, [], skills, fields); check(id, await option(page, 'Imperial Scribe'), expected); }
      await reset(page, [], [], {f_honorPts:'6.0', f_honorRank:6});
      check('SB-PICKER-SACROSANCT-HONOR-6', await option(page, 'Sacrosanct'), [false, '']);
      await reset(page, [], [], {f_honorPts:'5.9'});
      check('SB-PICKER-SACROSANCT-HONOR-5.9', await option(page, 'Sacrosanct'), [true, SACROSANCT_LABEL]);
      await reset(page, [], [], {f_honorPts:'', f_honorRank:7});
      check('SB-PICKER-RANK-WHEN-NO-POINTS', await option(page, 'Sacrosanct'), [false, '']);
      // It responds on the next recalc, both ways, and never stacks the label twice.
      await reset(page);
      await page.evaluate(() => { document.getElementById('f_honorPts').value = '6.2'; window.__L5R_TEST__.recalcAll(); });
      const opened = await option(page, 'Sacrosanct');
      await page.evaluate(() => { document.getElementById('f_honorPts').value = '4.0'; window.__L5R_TEST__.recalcAll(); window.__L5R_TEST__.recalcAll(); });
      check('SB-PICKER-FOLLOWS-RECALC', [opened, await option(page, 'Sacrosanct')], [[false, ''], [true, SACROSANCT_LABEL]]);
    });

    await section('SB-GATED-ROWS', async () => {
      await reset(page, ['Imperial Scribe', 'Sacrosanct']);
      check('SB-ROW-SCRIBE-SAYS-WHY', await rowLine(page, 'Imperial Scribe'), {text:'Not in effect: needs Status 2.0+ (yours 1.0) and Calligraphy Rank 4+ (yours 0). ' +
        'Its +1k0 and Free Raise are not offered until then.', buttons:[]});
      check('SB-ROW-SACROSANCT-SAYS-WHY', await rowLine(page, 'Sacrosanct'), {text:'Not in effect: needs Honor 6.0+ (yours 5.0).', buttons:[]});
      check('SB-ROW-KEEPS-ITS-XP', await page.evaluate(() => [...document.querySelectorAll('#advList .entry')].map(d => +d.querySelector('.en-cost').value)), [4, 4]);
      const scribeEffects = () => page.evaluate(() => { const T = window.__L5R_TEST__;
        const offered = T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier', traitName:'Awareness', skillRank:3}))
          .filter(o => o.provider === 'situational-entries').map(o => o.label.split(':')[0]);
        const raise = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Calligraphy', traitName:'Intelligence', skillRank:4}))
          .filter(m => m.label === 'Imperial Scribe').map(m => m.display);
        return [offered, raise]; });
      check('SB-SCRIBE-UNMET-NO-BONUS', await scribeEffects(), [[], []]);
      await reset(page, ['Imperial Scribe'], [{name:'Calligraphy', trait:'Intelligence', rank:4}]);
      check('SB-ROW-SCRIBE-ONLY-UNMET-PART', (await rowLine(page, 'Imperial Scribe')).text,
        'Not in effect: needs Status 2.0+ (yours 1.0). Its +1k0 and Free Raise are not offered until then.');
      check('SB-SCRIBE-STATUS-ONLY-UNMET-NO-BONUS', await scribeEffects(), [[], []]);
      await page.evaluate(() => { document.getElementById('f_statusPts').value = '2.0'; document.getElementById('f_statusRank').value = 2; window.__L5R_TEST__.recalcAll(); });
      check('SB-ROW-SCRIBE-MET-NO-NOTE', await rowLine(page, 'Imperial Scribe'), null);
      check('SB-SCRIBE-MET-BONUS-BACK', await scribeEffects(), [['Imperial Scribe'], ['Free Raise available']]);
      await reset(page, ['Sacrosanct'], [], {f_honorPts:'6.0', f_honorRank:6});
      check('SB-ROW-SACROSANCT-MET-NO-NOTE', await rowLine(page, 'Sacrosanct'), null);
      // Typed into the sheet's own boxes, as a player does, with no recalculation forced: the
      // Skills table's listeners call the trunk's recalcAll directly.
      const type = (selector, value) => page.evaluate(({selector, value}) => { const e = document.querySelector(selector);
        e.value = value; e.dispatchEvent(new Event('input', {bubbles:true})); e.dispatchEvent(new Event('change', {bubbles:true})); }, {selector, value});
      await reset(page, ['Imperial Scribe'], [{name:'Calligraphy', trait:'Intelligence', rank:4}], {f_statusPts:'2.0', f_statusRank:2});
      const before = await rowLine(page, 'Imperial Scribe');
      await type('#skillsBody tr .sk-rank', '3');
      check('SB-TYPED-RANK-SHOWS-NOTE', [before, (await rowLine(page, 'Imperial Scribe') || {}).text, (await option(page, 'Imperial Scribe'))[0]],
        [null, 'Not in effect: needs Calligraphy Rank 4+ (yours 3). Its +1k0 and Free Raise are not offered until then.', true]);
      await type('#skillsBody tr .sk-rank', '4');
      check('SB-TYPED-RANK-CLEARS-NOTE', [await rowLine(page, 'Imperial Scribe'), (await option(page, 'Imperial Scribe'))[0]], [null, false]);
      await type('#f_statusPts', '1.5');
      check('SB-TYPED-STATUS-SHOWS-NOTE', (await rowLine(page, 'Imperial Scribe') || {}).text,
        'Not in effect: needs Status 2.0+ (yours 1.5). Its +1k0 and Free Raise are not offered until then.');
      await reset(page, ['Sacrosanct'], [], {f_honorPts:'6.0', f_honorRank:6});
      await type('#f_honorPts', '5.5');
      check('SB-TYPED-HONOR-SHOWS-NOTE', [(await rowLine(page, 'Sacrosanct') || {}).text, (await option(page, 'Sacrosanct'))[0]],
        ['Not in effect: needs Honor 6.0+ (yours 5.5).', true]);
    });

    await section('SB-LAYOUT', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:900});
        await reset(page, ['Wary', 'Precise Memory', 'Imperial Scribe', 'Sacrosanct']);
        // Measured on the Advantages tab as a player sees it: off-screen carousel pages use
        // content-visibility:auto, so a card there can measure 0 wide until it is laid out.
        await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__;
          const pages = [...document.querySelectorAll('[data-car-slug]')];
          const at = pages.findIndex(p => p.contains(document.getElementById('advList')));
          if (at < 0 || !C.goToTab(at)) throw Error('Advantages tab not found');
          await C.whenSettled(); });
        const fit = await page.evaluate(() => [...document.querySelectorAll('#advList .sit4528-row')].map(row => {
          const e = row.closest('.entry').getBoundingClientRect(), r = row.getBoundingClientRect(), s = getComputedStyle(row);
          return [s.display, s.flexWrap, r.width > 0 && r.left >= e.left - 1 && r.right <= e.right + 1, row.scrollWidth <= row.clientWidth + 1]; }));
        check('SB-LAYOUT-' + width, fit, [0, 1, 2, 3].map(() => ['flex', 'wrap', true, true]));
      }
      await page.setViewportSize({width:375, height:812});
      check('SB-LAYOUT-BUTTON-COMPACT', await page.evaluate(() => { const b = document.querySelector('#advList .sit4528-btn');
        const s = getComputedStyle(b), root = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return [Math.round(parseFloat(s.fontSize) / root * 100), s.paddingTop, s.paddingLeft]; }), [78, '3px', '8px']);
      check('SB-LAYOUT-NOTE-GOLD', await page.evaluate(() => { const n = document.querySelector('#advList .sit4528-note');
        const probe = document.createElement('span'); probe.style.color = 'var(--gold)'; document.body.appendChild(probe);
        const gold = getComputedStyle(probe).color; probe.remove();
        return [getComputedStyle(n).color === gold, getComputedStyle(n).fontWeight]; }), [true, '700']);
    });
  } finally {
    check('SB-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('SB-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
