/* Walks the owner's checklist (MANUAL-TESTS.md) through the real controls on a served page: the
 * Advantage and Skill pickers, the rows' Spot ambush and Recall buttons, a Skill row's roll button, a
 * Trait's label, the Identity tab's Status and Honor Points, Manage/Done, Cancel. Expected values are
 * the checklist's own. node checklist-walk.js <url-or-file>
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
      for (const [id, v] of [['trait_perception', 3], ['trait_intelligence', 3], ['trait_awareness', 3]]) document.getElementById(id).value = v;
      document.getElementById('f_statusPts').value = '1.0'; document.getElementById('f_honorPts').value = '5.0'; T.recalcAll(); });
    const option = name => page.evaluate(name => { const o = [...document.getElementById('advQuickAdd').options].find(x => x.value === name);
      return o ? [o.disabled, o.textContent] : null; }, name);
    const pick = (id, name) => page.evaluate(({id, name}) => { const s = document.getElementById(id); s.value = name;
      if (s.value !== name) throw Error('no option ' + name); s.dispatchEvent(new Event('change', {bubbles:true})); }, {id, name});
    const addSkill = (name, rank) => page.evaluate(({name, rank}) => { const s = document.getElementById('skillQuickAdd'); s.value = name;
      if (s.value !== name) throw Error('no skill ' + name); s.dispatchEvent(new Event('change', {bubbles:true}));
      const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === name);
      row.querySelector('.sk-rank').value = rank; row.querySelector('.sk-rank').dispatchEvent(new Event('input', {bubbles:true}));
      window.__L5R_TEST__.recalcAll(); }, {name, rank});
    const setRank = (name, rank) => page.evaluate(({name, rank}) => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === name);
      row.querySelector('.sk-rank').value = rank; row.querySelector('.sk-rank').dispatchEvent(new Event('input', {bubbles:true})); }, {name, rank});
    const setField = (id, v) => page.evaluate(({id, v}) => { const e = document.getElementById(id); e.value = v;
      e.dispatchEvent(new Event('input', {bubbles:true})); e.dispatchEvent(new Event('change', {bubbles:true})); }, {id, v});
    const rowText = name => page.evaluate(name => [...document.querySelectorAll('#advList .entry')].filter(e => e.querySelector('.en-name').value === name)
      .map(e => e.querySelector('.sit4528-row')?.textContent || '').pop(), name);
    const press = text => page.evaluate(text => { const b = [...document.querySelectorAll('#advList .sit4528-btn')].find(x => x.textContent === text);
      if (!b) throw Error('no button ' + text); b.click(); }, text);
    const rollSkill = name => page.evaluate(name => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === name);
      row.querySelector('.sk-roll').click(); }, name);
    const rollTrait = name => page.evaluate(name => document.querySelector('.trait-row label[data-trait-name="' + name + '"]').click(), name);
    const preview = async () => { await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      return page.evaluate(() => ({pool:document.querySelector('.rp-pool-final')?.textContent || '',
        offers:[...document.querySelectorAll('[data-rd4515-key^="situational-entries:"]')].map(b => [b.closest('.rd4515-opt').textContent.split(':')[0], b.checked]),
        text:document.getElementById('rollPreviewBody').textContent})); };
    const toggle = name => page.locator('.rd4515-opt', {hasText:name + ':'}).click();
    const go = async () => { await page.locator('#rollPreviewGo').click(); await page.waitForSelector('#rollDiceRow .roll-die');
      const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length, kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
        title:document.getElementById('rollModalTitle').textContent, emphasis:!!document.getElementById('emphasisRerollBar'),
        text:document.getElementById('rollModalBody').textContent})); await page.keyboard.press('Escape'); return r; };
    const cancel = () => page.locator('#rollPreviewCancel').click();

    // Test 1 — Wary's Spot ambush button. Perception 3 + Investigation 2 = 5k3.
    await pick('advQuickAdd', 'Wary'); await addSkill('Investigation', 2);
    check('T1.1-SPOT-AMBUSH-BUTTON', await rowText('Wary'), 'Spot ambush');
    await press('Spot ambush'); let p = await preview();
    check('T1.2-WARY-APPLIED-NO-TICK', [p.offers, p.pool, /Wary/.test(p.text)], [[], '6k4', true]);
    let r = await go(); check('T1.3-TITLED-AND-ROLLED', [r.title, r.dice, r.kept, /Wary/.test(r.text)], ['Spot ambush — Investigation (Notice) / Perception', 6, 4, true]);
    await press('Spot ambush'); p = await preview();
    check('T1.4-APPLIED-AGAIN-NO-TICK', [p.offers, p.pool], [[], '6k4']); await cancel();
    await rollSkill('Investigation'); p = await preview();
    check('T1.5-ORDINARY-ROLL-NO-WARY', [p.offers, p.pool], [[], '5k3']); await cancel();
    await page.evaluate(() => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === 'Investigation');
      row.querySelector('.emph-add-btn').click(); });
    const emph = await page.evaluate(() => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === 'Investigation');
      const sel = row.querySelector('.emph-item-row .sk-emph-select, .emph-item-row .sk-emph-text');
      if (!sel) return 'no emphasis control';
      if (sel.tagName === 'SELECT') { const o = [...sel.options].find(x => /notice/i.test(x.value || x.textContent)); if (!o) return 'no Notice option'; sel.value = o.value; }
      else sel.value = 'Notice';
      sel.dispatchEvent(new Event('change', {bubbles:true})); window.__L5R_TEST__.recalcAll(); return 'ok'; });
    await press('Spot ambush'); await preview(); r = await go();
    check('T1.6-NOTICE-EMPHASIS-REROLL', [emph, r.emphasis], ['ok', true]);
    // Test 2 — Precise Memory's Recall button. Intelligence 3 = 3k3.
    await pick('advQuickAdd', 'Precise Memory');
    check('T2.1-RECALL-BUTTON', await rowText('Precise Memory'), 'Recall');
    await press('Recall'); p = await preview();
    check('T2.2-APPLIED-NOT-TICKED', [p.offers, p.pool, /Precise Memory/.test(p.text)], [[], '4k4', true]);
    r = await go(); check('T2.3-ROLLED-AND-NAMED', [r.dice, r.kept, /Precise Memory/.test(r.text)], [4, 4, true]);
    await rollTrait('Intelligence'); p = await preview();
    check('T2.4-ORDINARY-INTELLIGENCE', [p.offers, p.pool, /Precise Memory/.test(p.text)], [[], '3k3', false]); await cancel();
    // Test 3 — Imperial Scribe.
    check('T3.1-SCRIBE-GREYED', await option('Imperial Scribe'), [true, 'Imperial Scribe (4 pts) — needs Status 2+ and Calligraphy 4+']);
    await setField('f_statusPts', '2.0'); await addSkill('Calligraphy', 4);
    check('T3.2-SCRIBE-SELECTABLE', (await option('Imperial Scribe'))[0], false);
    await pick('advQuickAdd', 'Imperial Scribe');
    await rollSkill('Calligraphy'); p = await preview();
    check('T3.3-FREE-RAISE-LINE', /Free Raise available/.test(p.text)); await cancel();
    await setRank('Calligraphy', 3);
    check('T3.4-ROW-SAYS-WHY', await rowText('Imperial Scribe'), 'Not in effect: needs Calligraphy Rank 4+ (yours 3). Its +1k0 and Free Raise are not offered until then.');
    await rollSkill('Calligraphy'); p = await preview(); const raise = /Free Raise available/.test(p.text); await cancel();
    await addSkill('Courtier', 2); await rollSkill('Courtier'); p = await preview();
    check('T3.5-NO-RAISE-NO-OFFER', [raise, p.offers.map(o => o[0]).includes('Imperial Scribe')], [false, false]); await cancel();
    await setRank('Calligraphy', 4); await rollSkill('Courtier'); p = await preview();
    check('T3.6-BACK', [await rowText('Imperial Scribe'), p.offers.map(o => o[0]).includes('Imperial Scribe')], ['', true]); await cancel();
    // Test 4 — Sacrosanct.
    check('T4.1-SACROSANCT-GREYED', await option('Sacrosanct'), [true, 'Sacrosanct (4 pts) — needs Honor 6.0+']);
    await setField('f_honorPts', '6.0');
    check('T4.2-SACROSANCT-SELECTABLE', (await option('Sacrosanct'))[0], false);
    // Test 5 — Play mode.
    await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play'));
    check('T5.1-BUTTONS-IN-PLAY', await page.evaluate(() => [...document.querySelectorAll('#advList .sit4528-btn')].map(b => [b.textContent, !!b.offsetParent])),
      [['Spot ambush', true], ['Recall', true]]);
    await press('Spot ambush'); p = await preview(); const playAmbush = p.pool; await cancel();
    await press('Recall'); p = await preview(); check('T5.2-BOTH-ROLL-IN-PLAY', [playAmbush, p.pool], ['6k4', '4k4']); await cancel();
    await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
    // Test 6 — layout at phone width (Chromium, fallback fonts: not an iPhone result).
    await setField('f_statusPts', '1.0');
    await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; const pages = [...document.querySelectorAll('[data-car-slug]')];
      C.goToTab(pages.findIndex(x => x.contains(document.getElementById('advList')))); await C.whenSettled(); });
    const fit = await page.evaluate(() => [...document.querySelectorAll('#advList .sit4528-row')].map(row => { const e = row.closest('.entry').getBoundingClientRect(), r = row.getBoundingClientRect();
      return r.width > 0 && r.left >= e.left - 1 && r.right <= e.right + 1 && row.scrollWidth <= row.clientWidth + 1; }));
    check('T6-ROWS-FIT-390', fit, [true, true, true]);
  } catch (e) { check('WALK-EXCEPTION', String(e.stack || e), null); }
  finally {
    check('NO-PAGE-ERRORS', errors, []); await browser.close();
    const n = results.filter(r => r.pass).length; console.log(n + '/' + results.length + ' checks passed'); process.exitCode = n === results.length ? 0 : 1;
  }
})();
