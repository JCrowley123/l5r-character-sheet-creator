/* Walks the combined owner checklist for Phases 4.5.29 and 4.5.30 (both MANUAL-TESTS.md files) through
 * the real controls on a served page: the Advantage and Disadvantage pickers, the Stamina and Willpower
 * boxes, the wound track's + button, a Trait's label, the Skill picker, a Skill row's name box, School
 * tick and roll button, Done. Values are typed with input events only -- no recalculation is forced.
 * Expected values are the checklist's own. node checklist-walk.js <url-or-file>
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
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.recalcAll(); });
    const type = (selector, value) => page.evaluate(({selector, value}) => { const e = document.querySelector(selector); e.value = value;
      e.dispatchEvent(new Event('input', {bubbles:true})); e.dispatchEvent(new Event('change', {bubbles:true})); }, {selector, value});
    const pick = (id, name) => page.evaluate(({id, name}) => { const s = document.getElementById(id); s.value = name;
      if (s.value !== name) throw Error('no option ' + name); s.dispatchEvent(new Event('change', {bubbles:true})); }, {id, name});
    const removeRow = name => page.evaluate(name => { const d = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(e => e.querySelector('.en-name').value === name);
      d.querySelector('.rm-btn').click(); }, name);
    const rowLine = name => page.evaluate(name => { const d = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(e => e.querySelector('.en-name').value === name);
      return d ? (d.querySelector('.wound4529-note, .auto4530-note')?.textContent || null) : 'no row'; }, name);
    const earth = async n => { await type('#trait_stamina', n); await type('#trait_willpower', n); };
    const woundsTo = async level => { await type('#f_woundsTaken', 0);
      for (let i = 0; i < 200; i++) { const now = await page.evaluate(() => document.getElementById('woundSummaryLine').textContent.split(' — ')[0]);
        if (now === level) return true; const done = await page.evaluate(() => { const b = document.getElementById('woundStepUp'); if (b.disabled) return true; b.click(); return false; });
        if (done) return false; } return false; };
    const summary = () => page.evaluate(() => document.getElementById('woundSummaryLine').textContent);
    const preview = async () => { await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      return page.evaluate(() => ({pool:document.querySelector('.rp-pool-final')?.textContent || '', text:document.getElementById('rollPreviewBody').textContent})); };
    const cancel = () => page.locator('#rollPreviewCancel').click();
    const rollTrait = name => page.evaluate(name => document.querySelector('.trait-row label[data-trait-name="' + name + '"]').click(), name);
    const addSkill = (name, rank, rename) => page.evaluate(({name, rank, rename}) => { const s = document.getElementById('skillQuickAdd'); s.value = name;
      if (s.value !== name) throw Error('no skill ' + name); s.dispatchEvent(new Event('change', {bubbles:true}));
      const row = [...document.querySelectorAll('#skillsBody tr')].filter(r => r.querySelector('.sk-name')?.value === name).pop();
      if (rename) { row.querySelector('.sk-name').value = rename; row.querySelector('.sk-name').dispatchEvent(new Event('input', {bubbles:true})); }
      row.querySelector('.sk-rank').value = rank; row.querySelector('.sk-rank').dispatchEvent(new Event('input', {bubbles:true})); }, {name, rank, rename});
    const rollSkill = name => page.evaluate(name => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === name);
      row.querySelector('.sk-roll').click(); }, name);

    // ---- Phase 4.5.29: Wound Entries ----
    await earth(2);
    await pick('advQuickAdd', 'Strength of the Earth');
    check('W1.1-ROW-LINE', await rowLine('Strength of the Earth'), 'In effect: every Wound Rank\'s penalty is 3 lower, never below none.');
    check('W1.2-NICKED-NONE', [await woundsTo('Nicked'), /No TN penalty \(Strength of the Earth −3\)/.test(await summary())], [true, true]);
    await rollTrait('Agility'); let p = await preview();
    check('W1.3-ROLL-LINE-CANCELLED', [/Wound Penalty\s*3 → 0 \(Strength of the Earth −3\)[^.]*which this cancels/.test(p.text)], [true]); await cancel();
    await woundsTo('Grazed'); await rollTrait('Agility'); p = await preview();
    check('W1.4-GRAZED-TWO', [/TN of all rolls \+2 \(Strength of the Earth −3\)/.test(await summary()), /5 → 2/.test(p.text)], [true, true]); await cancel();
    await removeRow('Strength of the Earth'); await pick('disadvQuickAdd', 'Low Pain Threshold'); await type('#f_woundsTaken', 0);
    check('W2.1-HEALTHY-STILL-NONE', /^Healthy — No TN penalty — 0 of/.test(await summary()));
    await woundsTo('Nicked'); await rollTrait('Agility'); p = await preview();
    check('W2.2-NICKED-EIGHT', [/TN of all rolls \+8 \(Low Pain Threshold \+5\)/.test(await summary()), /3 → 8/.test(p.text)], [true, true]); await cancel();
    await pick('advQuickAdd', 'Strength of the Earth');
    check('W2.3-BOTH', /TN of all rolls \+5 \(Low Pain Threshold \+5, Strength of the Earth −3\)/.test(await summary()));
    await removeRow('Strength of the Earth'); await removeRow('Low Pain Threshold'); await earth(3); await type('#f_woundsTaken', 0);
    const plain = (await summary()).split(' of ')[1];
    await pick('disadvQuickAdd', 'Bad Health');
    check('W3.1-BAD-HEALTH', [await rowLine('Bad Health'), (await summary()).split(' of ')[1] !== plain],
      ['In effect: your Wound Ranks use Earth 2 (yours is 3). For resisting disease, count your Earth one lower yourself: the sheet makes no disease rolls.', true]);
    await earth(1);
    check('W3.2-EARTH-ONE', /already use Earth 1, the lowest/.test(await rowLine('Bad Health')));
    await removeRow('Bad Health'); await earth(2); await type('#f_woundsTaken', 0);
    const before = (await summary()).split(' of ')[1];
    await pick('disadvQuickAdd', 'Permanent Wound');
    check('W3.3-PERMANENT-HEALTHY-SMALLER', [/^Healthy/.test(await summary()), (await summary()).split(' of ')[1] !== before], [true, true]);
    await type('#f_woundsTaken', 1);
    check('W3.4-FIRST-WOUND-NICKED', /^Nicked/.test(await summary()));
    await pick('advQuickAdd', 'Strength of the Earth');
    await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play'));
    check('W4.1-PLAY', [!!(await page.evaluate(() => [...document.querySelectorAll('.wound4529-note')].filter(n => n.offsetParent).length)), /Strength of the Earth −3/.test(await summary())], [true, true]);
    await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
    await removeRow('Strength of the Earth'); await removeRow('Permanent Wound'); await type('#f_woundsTaken', 0);

    // ---- Phase 4.5.30: Automatic Roll Entries ----
    for (const id of ['#trait_agility', '#trait_awareness', '#trait_perception']) await type(id, 3);
    await pick('advQuickAdd', 'Silent'); await addSkill('Stealth', 2);
    await rollSkill('Stealth'); p = await preview();
    check('A1-SILENT', [p.pool, /Silent/.test(p.text)], ['6k3', true]); await cancel();
    await pick('advQuickAdd', 'Prodigy'); await addSkill('Lore', 1, 'Lore: Theology');
    await page.evaluate(() => { const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === 'Lore: Theology');
      const t = row.querySelector('.sk-school'); t.checked = true; t.dispatchEvent(new Event('change', {bubbles:true})); });
    await rollSkill('Lore: Theology'); p = await preview(); const prodigy = /Prodigy/.test(p.text); await cancel();
    await rollSkill('Stealth'); p = await preview();
    check('A2-PRODIGY-SCHOOL-ONLY', [prodigy, /Prodigy/.test(p.text)], [true, false]); await cancel();
    await pick('advQuickAdd', 'Voice'); await addSkill('Perform', 2, 'Perform: Storytelling'); await addSkill('Perform', 2, 'Perform: Dance');
    await rollSkill('Perform: Storytelling'); p = await preview(); const story = [p.pool, /Voice/.test(p.text)]; await cancel();
    await rollSkill('Perform: Dance'); p = await preview();
    check('A3-VOICE', [story, /Voice/.test(p.text)], [['6k4', true], false]); await cancel();
    await pick('disadvQuickAdd', 'Bad Eyesight'); await rollTrait('Perception'); p = await preview();
    check('A4-EYESIGHT-PERCEPTION', [p.pool, /Bad Eyesight/.test(p.text)], ['2k2', true]); await cancel();
    await pick('disadvQuickAdd', 'Disturbing Countenance'); await addSkill('Courtier', 2);
    await rollSkill('Courtier'); p = await preview();
    check('A5-COUNTENANCE', /Disturbing Countenance[\s\S]*TN \+5/.test(p.text)); await cancel();
    await pick('disadvQuickAdd', 'Anachronism');
    check('A6-ANACHRONISM-ROW', await rowLine('Anachronism'), 'Only returned spirits may take this. The sheet cannot check that: it is up to you and your GM.');
    await rollSkill('Courtier'); p = await preview();
    check('A7-BOTH-TN', [/Disturbing Countenance/.test(p.text), /Anachronism/.test(p.text)], [true, true]); await cancel();
    await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play'));
    await rollSkill('Stealth'); p = await preview();
    check('A8-PLAY', /Silent/.test(p.text)); await cancel();
    await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
  } catch (e) { check('WALK-EXCEPTION', String(e.stack || e), null); }
  finally {
    check('NO-PAGE-ERRORS', errors, []); await browser.close();
    const n = results.filter(r => r.pass).length; console.log(n + '/' + results.length + ' checks passed'); process.exitCode = n === results.length ? 0 : 1;
  }
})();
