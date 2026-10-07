/* Walks the owner's checklist (MANUAL-TESTS.md) through the real controls on a served page:
 * the Advantage/Disadvantage/Skill pickers, a Skill row's roll button, a Trait's label, Manage/Done,
 * Cancel. Expected values are the checklist's own. node checklist-walk.js <url-or-file>
 */
'use strict';
const {chromium} = require('playwright');
const results = [];
function check(id, actual, expected = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual) + ' expected=' + JSON.stringify(expected)));
}
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:390, height:844}});
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  page.setDefaultTimeout(10000);
  try {
    const target = process.argv[2];
    await page.goto(/^https?:/.test(target) ? target : 'file:///' + require('path').resolve(target).replace(/\\/g, '/'));
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.MODES12?.set('management');
      for (const [id, v] of [['trait_perception', 3], ['trait_intelligence', 3], ['trait_awareness', 3], ['trait_willpower', 3]]) document.getElementById(id).value = v; T.recalcAll(); });
    const pick = (id, name) => page.evaluate(({id, name}) => { const s = document.getElementById(id); s.value = name;
      if (s.value !== name) throw Error('no option ' + name); s.dispatchEvent(new Event('change', {bubbles:true})); }, {id, name});
    const addSkill = (name, rank, trait) => page.evaluate(({name, rank, trait}) => { const s = document.getElementById('skillQuickAdd'); s.value = name;
      if (s.value !== name) throw Error('no skill ' + name); s.dispatchEvent(new Event('change', {bubbles:true}));
      const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === name);
      row.querySelector('.sk-rank').value = rank; if (trait) row.querySelector('.sk-trait').value = trait;
      row.querySelector('.sk-rank').dispatchEvent(new Event('input', {bubbles:true})); window.__L5R_TEST__.recalcAll(); }, {name, rank, trait});
    const rollSkill = name => page.evaluate(name => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === name);
      row.querySelector('.sk-roll').click(); }, name);
    const rollTrait = name => page.evaluate(name => document.querySelector('.trait-row label[data-trait-name="' + name + '"]').click(), name);
    const preview = async () => { await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      return page.evaluate(() => ({pool:document.querySelector('.rp-pool-final')?.textContent || '',
        offers:[...document.querySelectorAll('[data-rd4515-key^="situational-entries:"]')].map(b => [b.closest('.rd4515-opt').textContent.split(':')[0], b.checked]),
        text:document.getElementById('rollPreviewBody').textContent})); };
    const tick = name => page.locator('.rd4515-opt', {hasText:name + ':'}).click();
    const go = async () => { await page.locator('#rollPreviewGo').click(); await page.waitForSelector('#rollDiceRow .roll-die');
      const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length, kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
        text:document.getElementById('rollModalBody').textContent})); await page.keyboard.press('Escape'); return r; };
    const cancel = () => page.locator('#rollPreviewCancel').click();
    const names = p => p.offers.map(o => o[0]);

    // Test 1 — Wary
    await pick('advQuickAdd', 'Wary'); await addSkill('Investigation', 2);
    await rollSkill('Investigation'); let p = await preview();
    check('T1.1-WARY-OFFERED-UNTICKED', p.offers, [['Wary', false]]);
    await tick('Wary'); const p2 = await preview();
    check('T1.2-POOL-UP-1K1', [p.pool, p2.pool], ['5k3', '6k4']);
    let r = await go(); check('T1.3-ROLLED-AND-NAMED', [r.dice, r.kept, /Wary/.test(r.text)], [6, 4, true]);
    await rollSkill('Investigation'); p = await preview(); check('T1.4-UNTICKED-AGAIN', [p.offers, p.pool], [[['Wary', false]], '5k3']); await cancel();
    await page.evaluate(() => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === 'Investigation');
      row.querySelector('.sk-trait').value = 'Awareness'; window.__L5R_TEST__.recalcAll(); });
    await rollSkill('Investigation'); p = await preview(); check('T1.5-AWARENESS-NOT-OFFERED', names(p), []); await cancel();
    await page.evaluate(() => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === 'Investigation');
      row.querySelector('.sk-trait').value = 'Perception'; window.__L5R_TEST__.recalcAll(); });
    // Test 2 — Precise Memory
    await pick('advQuickAdd', 'Precise Memory'); await rollTrait('Intelligence'); p = await preview();
    check('T2.1-PRECISE-MEMORY', names(p), ['Precise Memory']); await cancel();
    await addSkill('Lore', 1); await rollSkill('Lore'); p = await preview();
    check('T2.2-LORE-NOT-OFFERED', names(p).includes('Precise Memory'), false); await cancel();
    // Test 3 — Social entries
    for (const n of ['Imperial Spouse', 'Imperial Scribe', 'Dangerous Beauty']) await pick('advQuickAdd', n);
    await addSkill('Courtier', 1); await addSkill('Temptation', 1);
    await rollSkill('Courtier'); p = await preview();
    check('T3.1-COURTIER', names(p).sort(), ['Imperial Scribe', 'Imperial Spouse']);
    const before = p.pool; await tick('Imperial Spouse'); await tick('Imperial Scribe'); p = await preview();
    check('T3.2-POOL-UP-2K1', [before, p.pool], ['4k3', '6k4']); await cancel();
    await rollSkill('Temptation'); p = await preview(); check('T3.3-TEMPTATION', names(p).sort(), ['Dangerous Beauty', 'Imperial Scribe', 'Imperial Spouse']); await cancel();
    await rollSkill('Investigation'); p = await preview(); check('T3.4-INVESTIGATION-NONE-OF-THREE', names(p).filter(n => /Imperial|Beauty/.test(n)), []); await cancel();
    // Test 4 — resisting
    for (const n of ['Balance', 'Clear Thinker', 'Heartless', 'Irreproachable']) await pick('advQuickAdd', n);
    await rollTrait('Willpower'); p = await preview();
    check('T4.1-FOUR-OFFERED', names(p).sort(), ['Balance', 'Clear Thinker', 'Heartless', 'Irreproachable']);
    check('T4.2-BALANCE-NOTE', /Add your Honor Rank to the total yourself/.test(p.text));
    const wp = p.pool; for (const n of ['Balance', 'Clear Thinker', 'Heartless', 'Irreproachable']) await tick(n);
    p = await preview(); r = await go();
    check('T4.3-POOL-UP-4K0', [wp, p.pool, r.dice, ['Balance', 'Clear Thinker', 'Heartless', 'Irreproachable'].every(n => r.text.includes(n))], ['3k3', '7k3', 7, true]);
    // Test 5 — Failure of Bushido (Honor), configured through its own window
    await pick('disadvQuickAdd', 'Failure of Bushido');
    const modal = await page.locator('#advConfigModalOverlay').isVisible();
    if (!modal) await page.evaluate(() => [...document.querySelectorAll('#disadvList .entry .adv-config-btn')].pop().click());
    await page.locator('#advConfigGrid label', {hasText:/^\s*Honor/}).first().click();
    await page.locator('#advConfigConfirm').click();
    await rollTrait('Willpower'); p = await preview(); check('T5.1-BALANCE-HIDDEN', names(p).sort(), ['Clear Thinker', 'Heartless', 'Irreproachable']); await cancel();
    await page.evaluate(() => [...document.querySelectorAll('#disadvList .entry .adv-config-btn')].pop().click());
    await page.locator('#advConfigGrid label', {hasText:/^\s*Courage/}).first().click();
    await page.locator('#advConfigConfirm').click();
    await rollTrait('Willpower'); p = await preview(); check('T5.2-BALANCE-BACK', names(p).includes('Balance')); await cancel();
    // Test 6 — Free Raise
    await addSkill('Calligraphy', 2); await rollSkill('Calligraphy'); p = await preview();
    check('T6.1-FREE-RAISE-PREVIEW', [/Free Raise available/.test(p.text), p.pool], [true, '5k3']);
    r = await go(); check('T6.2-FREE-RAISE-RESULT', [/Free Raise available/.test(r.text), r.dice], [true, 5]);
    await page.evaluate(() => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === 'Calligraphy');
      row.querySelector('.sk-rank').value = 0; window.__L5R_TEST__.recalcAll(); });
    await rollSkill('Calligraphy'); p = await preview(); check('T6.3-RANK-ZERO-NO-LINE', /Free Raise available/.test(p.text), false); await cancel();
    await rollSkill('Courtier'); p = await preview(); check('T6.4-COURTIER-NO-LINE', /Free Raise available/.test(p.text), false); await cancel();
    // Test 7 — nothing sticks
    await rollSkill('Investigation'); await preview(); await tick('Wary'); await cancel();
    await rollSkill('Investigation'); p = await preview(); check('T7.1-AFTER-CANCEL', p.offers.find(o => o[0] === 'Wary'), ['Wary', false]); await cancel();
    const saved = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
    await page.evaluate(s => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.applyData(JSON.parse(s)); T.recalcAll(); }, saved);
    await rollSkill('Investigation'); p = await preview(); check('T7.2-AFTER-RELOAD', p.offers.find(o => o[0] === 'Wary'), ['Wary', false]); await cancel();
    await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play')); await rollTrait('Willpower'); p = await preview();
    check('T7.3-PLAY-MODE', names(p).length >= 3); await cancel(); await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
    await page.evaluate(() => { [...document.querySelectorAll('#advList .entry')].filter(e => e.querySelector('.en-name').value === 'Wary').forEach(e => e.remove()); window.__L5R_TEST__.recalcAll(); });
    await rollSkill('Investigation'); p = await preview(); check('T7.4-REMOVED', names(p).includes('Wary'), false); await cancel();
    // Test 8 — descriptions
    await pick('advQuickAdd', 'Heartless');
    check('T8.1-HEARTLESS-TEXT', await page.evaluate(() => [...document.querySelectorAll('#advList .entry')].filter(e => e.querySelector('.en-name').value === 'Heartless').pop().querySelector('.en-desc').value),
      '+1k0 on rolls to resist Courtier, Sincerity or Temptation used to persuade you, seduce you or change your mind.');
    await pick('advQuickAdd', 'Clear Thinker');
    check('T8.2-CLEAR-THINKER-TEXT', await page.evaluate(() => [...document.querySelectorAll('#advList .entry')].filter(e => e.querySelector('.en-name').value === 'Clear Thinker').pop().querySelector('.en-desc').value),
      '+1k0 on Contested Rolls against someone trying to confuse or manipulate you. Dragon pay 2.');
    // Test 9 — layout at phone width (Chromium, fallback fonts: not an iPhone result)
    await rollSkill('Temptation'); p = await preview();
    const fit = await page.evaluate(() => { const b = document.querySelector('.rd4515-declare'), vw = document.documentElement.clientWidth;
      return b.scrollWidth <= b.clientWidth + 1 && [...b.querySelectorAll('.rd4515-opt')].every(o => { const r = o.getBoundingClientRect(); return r.left >= -1 && r.right <= vw + 1; }); });
    check('T9-SEVEN-OPTIONS-FIT-390', [p.offers.length, fit], [7, true]); await cancel();
  } catch (e) { check('WALK-EXCEPTION', String(e.stack || e), null); }
  finally {
    check('NO-PAGE-ERRORS', errors, []); await browser.close();
    const n = results.filter(r => r.pass).length; console.log(n + '/' + results.length + ' checks passed'); process.exitCode = n === results.length ? 0 : 1;
  }
})();
