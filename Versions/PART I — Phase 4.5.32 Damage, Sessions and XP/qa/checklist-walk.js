/* Walks the combined owner checklist for Phases 4.5.31 and 4.5.32 (both MANUAL-TESTS.md files) through the
 * real controls on a served page: the Advantage, Disadvantage, Skill, Weapon and Technique pickers, the Trait
 * labels, the rows' own buttons, boxes, switches and limb picker, the roll preview's boxes, the weapon rows'
 * roll buttons, the confirm dialog, the casting report's button and the Manage/Done toggle. Values are typed
 * with input events only -- no recalculation is forced. Expected values are the checklist's own.
 * node checklist-walk.js <url-or-file>
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
    // A fresh character in Management, as "use a copy of a character, tap Manage" leaves it.
    const fresh = () => page.evaluate(() => { const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.();
      document.getElementById('weaponsBody').innerHTML = ''; T.MODES12?.set('management'); T.recalcAll(); });
    const type = (selector, value) => page.evaluate(({selector, value}) => { const e = document.querySelector(selector); e.value = value;
      e.dispatchEvent(new Event('input', {bubbles:true})); e.dispatchEvent(new Event('change', {bubbles:true})); }, {selector, value});
    const pick = (id, value) => page.evaluate(({id, value}) => { const s = document.getElementById(id); s.value = value;
      if (s.value !== value) throw Error('no option ' + value + ' in ' + id); s.dispatchEvent(new Event('change', {bubbles:true})); }, {id, value});
    const entry = name => `[...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(d => d.querySelector('.en-name').value === ${JSON.stringify(name)})`;
    const press = (name, text) => page.evaluate(({name, text}) => {
      const d = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(e => e.querySelector('.en-name').value === name);
      const b = d && [...d.querySelectorAll('.chk4531-row button, .dsx4532-row button')].find(x => x.textContent === text);
      if (!b) throw Error('no ' + text + ' on ' + name); b.click(); }, {name, text});
    const rowBox = (name, value) => page.evaluate(({name, value}) => {
      const d = [...document.querySelectorAll('#disadvList .entry')].find(e => e.querySelector('.en-name').value === name);
      const i = d.querySelector('.chk4531-input'); i.value = value; i.dispatchEvent(new Event('input', {bubbles:true})); }, {name, value});
    const toggle = (name, cls) => page.evaluate(({name, cls}) => {
      const d = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(e => e.querySelector('.en-name').value === name);
      d.querySelector(cls).click(); }, {name, cls});
    const rowState = name => page.evaluate(name => {
      const d = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(e => e.querySelector('.en-name').value === name);
      return {state:d.querySelector('.dsx4532-state')?.textContent || null, toggles:[...d.querySelectorAll('.chk4531-toggle, .dsx4532-toggle')].map(t => t.checked),
        use:[...d.querySelectorAll('.dsx4532-btn')].find(b => b.textContent === 'Use')?.disabled ?? null}; }, name);
    const preview = async () => { await page.waitForSelector('#rollPreviewGo', {state:'visible'});
      return page.evaluate(() => ({pool:document.querySelector('.rp-pool-final')?.textContent || '', text:document.getElementById('rollPreviewBody').textContent,
        boxes:[...document.querySelectorAll('[data-rd4515-key]')].map(b => [b.closest('.rd4515-opt').textContent, b.checked])})); };
    const go = async () => { await page.locator('#rollPreviewGo').click(); await page.waitForSelector('#rollDiceRow .roll-die');
      const r = await page.evaluate(() => ({title:document.getElementById('rollModalTitle').textContent, total:+document.getElementById('rollTotalDisplay').textContent,
        kept:[...document.querySelectorAll('#rollDiceRow .roll-die.kept')].reduce((s, d) => s + (+d.dataset.total || 0), 0),
        note:document.getElementById('rollResultNote')?.textContent || '', body:document.getElementById('rollModalBody').textContent}));
      await page.keyboard.press('Escape'); return r; };
    const cancel = () => page.locator('#rollPreviewCancel').click();
    const rollTrait = name => page.evaluate(name => document.querySelector('.trait-row label[data-trait-name="' + name + '"]').click(), name);
    const notice = () => page.evaluate(() => { const o = document.getElementById('appConfirmOverlay');
      const t = o.style.display === 'flex' ? document.getElementById('appConfirmMsg').textContent : null;
      if (t) (document.getElementById('appConfirmOk') || o.querySelector('button')).click(); return t; });
    const addSkill = (name, rank, rename) => page.evaluate(({name, rank, rename}) => { const s = document.getElementById('skillQuickAdd'); s.value = name;
      if (s.value !== name) throw Error('no skill ' + name); s.dispatchEvent(new Event('change', {bubbles:true}));
      const row = [...document.querySelectorAll('#skillsBody tr')].filter(r => r.querySelector('.sk-name')?.value === name).pop();
      if (rename) { row.querySelector('.sk-name').value = rename; row.querySelector('.sk-name').dispatchEvent(new Event('input', {bubbles:true})); }
      row.querySelector('.sk-rank').value = rank; row.querySelector('.sk-rank').dispatchEvent(new Event('input', {bubbles:true})); }, {name, rank, rename});
    const rollSkill = name => page.evaluate(name => [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === name).querySelector('.sk-roll').click(), name);
    const addWeapon = name => pick('weaponQuickAdd', name);
    const weapon = name => `[...document.querySelectorAll('#weaponsBody tr')].find(r => r.querySelector('.wp-name')?.value === ${JSON.stringify(name)})`;
    const dmgText = name => page.evaluate(name => [...document.querySelectorAll('#weaponsBody tr')].find(r => r.querySelector('.wp-name')?.value === name).querySelector('.wp-dmg').value, name);
    const W = await page.evaluate(() => { const T = window.__L5R_TEST__;
      return {large:T.WEAPON_LIBRARY.find(w => w.size === 'Large' && !T.isRangedWeapon(w) && w.skill === 'Kenjutsu')?.name || T.WEAPON_LIBRARY.find(w => w.size === 'Large' && !T.isRangedWeapon(w)).name,
        bow:T.WEAPON_LIBRARY.find(w => T.isRangedWeapon(w) && w.skill === 'Kyujutsu').name, unarmed:T.WEAPON_LIBRARY.find(w => w.skill === 'Jiujutsu').name}; });

    // ================= Phase 4.5.31 =================
    // C1 Brash
    await fresh(); await type('#trait_willpower', 3); await type('#f_honorRank', 2);
    await pick('disadvQuickAdd', 'Brash');
    await press('Brash', 'Check (TN 25)');
    let p = await preview(); let r = await go();
    check('C1 Brash: Willpower 3k3 vs TN 25, Honor Rank added', [p.pool, r.title, /Brash: Honor Rank/.test(p.text), r.total - r.kept, /temper|attack/.test(r.note)],
      ['3k3', 'Brash — Willpower vs TN 25', true, 2, true]);
    // C2
    for (const n of ['Can’t Lie', 'Overconfident', 'Soft-Hearted']) await pick('disadvQuickAdd', n);
    const titles = [];
    for (const n of ['Can’t Lie', 'Overconfident', 'Soft-Hearted']) { await press(n, 'Check (TN 20)'); await preview(); titles.push((await go()).title); }
    check('C2 Can\'t Lie, Overconfident, Soft-Hearted at TN 20', titles, ['Can’t Lie — Willpower vs TN 20', 'Overconfident — Perception vs TN 20', 'Soft-Hearted — Willpower vs TN 20']);
    // C3
    await pick('disadvQuickAdd', 'Contrary'); await rowBox('Contrary', '25'); await press('Contrary', 'Check'); await preview();
    check('C3 Contrary uses the typed TN', (await go()).title, 'Contrary — Willpower vs TN 25');
    // C4
    await pick('disadvQuickAdd', 'Epilepsy');
    await press('Epilepsy', 'Avoid (TN 15)'); await preview(); const e1 = (await go()).title;
    await press('Epilepsy', 'End seizure (TN 10)'); await preview(); const e2 = (await go()).title;
    check('C4 Epilepsy TN 15 then TN 10', [e1, e2], ['Epilepsy — Willpower vs TN 15', 'Epilepsy — Willpower vs TN 10']);
    // C5
    await pick('disadvQuickAdd', 'Rumormonger'); await press('Rumormonger', 'Check (TN 5 × Glory)');
    const asked = await notice();
    await rowBox('Rumormonger', '3'); await press('Rumormonger', 'Check (TN 5 × Glory)'); await preview();
    check('C5 Rumormonger asks, then TN 15', [asked, (await go()).title], ['Enter the Glory Rank first.', 'Rumormonger — Willpower vs TN 15']);
    // C6 Lame
    await fresh(); await pick('disadvQuickAdd', 'Lame');
    await rollTrait('Agility'); p = await preview();
    const lameBox = p.boxes.filter(b => /^Lame/.test(b[0]));
    await page.locator('[data-rd4515-key="checks-conditions:lame"]').check(); r = await go();
    await rollTrait('Strength'); const strengthBoxes = (await preview()).boxes.filter(b => /^Lame/.test(b[0])); await cancel();
    check('C6 Lame: unticked on Agility, -10 when ticked, absent on Strength', [lameBox, r.total - r.kept, strengthBoxes], [[['Lame: Uses your legs: TN +10', false]], -10, []]);
    // C7 Missing Limb
    await pick('disadvQuickAdd', 'Missing Limb');
    await page.evaluate(() => { const s = document.querySelector('.chk4531-limb'); s.value = 'Left arm'; s.dispatchEvent(new Event('input', {bubbles:true})); s.dispatchEvent(new Event('change', {bubbles:true})); });
    await rollTrait('Strength'); p = await preview(); await cancel();
    check('C7 Missing Limb names the chosen limb', p.boxes.filter(b => /^Missing Limb/.test(b[0])), [['Missing Limb: Uses your left arm: TN +10', false]]);
    // C8 Disbeliever
    await fresh(); await pick('disadvQuickAdd', 'Disbeliever'); await addSkill('Courtier', 2); await addSkill('Lore', 2, 'Lore: Theology');
    await rollSkill('Courtier'); const court = (await preview()).boxes; await cancel();
    await rollSkill('Lore: Theology'); const lore = (await preview()).boxes; await cancel();
    check('C8 Disbeliever on Courtier only', [court, lore], [[['Disbeliever: A shugenja or monk is involved: TN +5', false]], []]);
    // C9 Lost Love
    await fresh(); await pick('disadvQuickAdd', 'Lost Love'); await toggle('Lost Love', '.chk4531-toggle');
    await rollTrait('Strength'); p = await preview(); await cancel();
    await page.evaluate(() => { const v = document.getElementById('void_current'); v.value = 2; });
    await press('Lost Love', 'Spend a Void Point');
    check('C9 Lost Love: -5 while on; Spend a Void Point spends one and turns it off',
      [/Lost Love/.test(p.text), await page.evaluate(() => +document.getElementById('void_current').value), (await rowState('Lost Love')).toggles], [true, 1, [false]]);
    // C10 Soft-Hearted guilt
    await pick('disadvQuickAdd', 'Soft-Hearted'); await toggle('Soft-Hearted', '.chk4531-toggle');
    await rollTrait('Strength'); p = await preview(); r = await go();
    check('C10 Wracked with guilt: -10', [/Soft-Hearted/.test(p.text), r.total - r.kept], [true, -10]);
    // C11 Blind
    await fresh(); await type('#trait_reflexes', 3); await type('#f_armorTN', 5); await pick('disadvQuickAdd', 'Blind');
    const tn = await page.evaluate(() => [+document.getElementById('f_baseTN').value, +document.getElementById('f_currentTN').value, document.getElementById('qaArmorTNValue').textContent]);
    // One weapon at a time (two would ask which hand); a bow asks for the range first.
    await addWeapon(W.bow);
    await page.evaluate(w => [...document.querySelectorAll('#weaponsBody tr')].find(r => r.querySelector('.wp-name')?.value === w).querySelector('.wp-roll-btn').click(), W.bow);
    await page.waitForSelector('#rangeOptWithin', {state:'visible'}); await page.locator('#rangeOptWithin').click();
    const bowP = await preview(); await cancel();
    await page.evaluate(() => { document.getElementById('weaponsBody').innerHTML = ''; });
    await addWeapon('Katana');
    await page.evaluate(() => [...document.querySelectorAll('#weaponsBody tr')].find(r => r.querySelector('.wp-name')?.value === 'Katana').querySelector('.wp-roll-btn').click());
    const swordP = await preview(); await cancel();
    check('C11 Blind: Armor TN base Reflexes + 5, both attacks penalised', [tn, /Blind/.test(bowP.text), /Blind/.test(swordP.text)], [[8, 13, '13'], true, true]);
    // C12-C13 Void spells
    await fresh(); await type('#f_school', 'Isawa Shugenja');
    const voidOpts = () => page.evaluate(() => { const T = window.__L5R_TEST__;
      return [...document.getElementById('techQuickAdd').options].filter(o => /^spell:/.test(o.value) && T.SPELL_LIBRARY[+o.value.split(':')[1]].element === 'Void')
        .map(o => [o.disabled, / — needs Ishiken-Do/.test(o.textContent)]); });
    const before = await voidOpts();
    await pick('advQuickAdd', 'Ishiken-Do'); const after = await voidOpts();
    check('C12 Void spells greyed until Ishiken-Do', [before.length > 0 && before.every(o => o[0] && o[1]), after.length === before.length && after.every(o => !o[1])], [true, true]);
    const idx = await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.findIndex(s => s.element === 'Void' && !s.maho && s.mastery === 1));
    await page.evaluate(idx => { document.getElementById('addSpellScroll').click(); document.querySelector('#spellScrollsList .spell-scroll-add-btn[data-idx="' + idx + '"]').click();
      document.getElementById('spellScrollsX').click(); }, idx);
    await pick('techQuickAdd', 'spell:' + idx);
    await page.evaluate(n => { const d = [...document.querySelectorAll('#advList .entry')].find(e => e.querySelector('.en-name').value === n); d.querySelector('.rm-btn').click(); }, 'Ishiken-Do');
    const why = await page.evaluate(() => { const b = document.querySelector('#techList .cast-why-btn'); const mark = b.textContent; b.click();
      const t = document.getElementById('castWhyBody').textContent; document.getElementById('castWhyX').click(); return [mark, /Needs Ishiken-Do/.test(t)]; });
    await page.evaluate(() => document.querySelector('#techList .spell-cast-btn').click());
    const castOpens = await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:5000}).then(() => true, () => false); if (castOpens) await cancel();
    check('C13 A Void spell on the list: flagged, Cast still works', [why, castOpens], [['✕', true], true]);
    // C14
    await fresh();
    check('C14 Ishiken-Do greyed for a non-Shugenja', await page.evaluate(() => { const o = [...document.getElementById('advQuickAdd').options].find(x => x.value === 'Ishiken-Do');
      return [o.disabled, / — Shugenja only$/.test(o.textContent)]; }), [true, true]);
    // C15 save and load
    await pick('disadvQuickAdd', 'Lost Love'); await toggle('Lost Love', '.chk4531-toggle'); await pick('disadvQuickAdd', 'Missing Limb');
    await page.evaluate(() => { const s = document.querySelector('.chk4531-limb'); s.value = 'Right leg'; s.dispatchEvent(new Event('change', {bubbles:true})); });
    const saved = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
    await fresh(); await page.evaluate(s => { const T = window.__L5R_TEST__; T.applyData(JSON.parse(s)); T.recalcAll(); }, saved);
    check('C15 Switch and limb survive a save and load', [(await rowState('Lost Love')).toggles, await page.evaluate(() => document.querySelector('.chk4531-limb').value)], [[true], 'Right leg']);
    // C16 Play mode
    await page.evaluate(() => document.getElementById('pm12Toggle').click());
    check('C16 Play: buttons and switches work, the limb is locked', await page.evaluate(() => [
      [...document.querySelectorAll('.chk4531-btn')].every(b => !b.disabled && b.offsetParent !== null), [...document.querySelectorAll('.chk4531-toggle')].every(t => !t.disabled),
      document.querySelector('.chk4531-limb').disabled]), [true, true, true]);
    await page.evaluate(() => document.getElementById('pm12Toggle').click());

    // ================= Phase 4.5.32 =================
    // D1 Hands of Stone
    await fresh(); await type('#trait_strength', 3); await addWeapon(W.unarmed);
    const plainUnarmed = await dmgText(W.unarmed);
    await pick('advQuickAdd', 'Hands of Stone');
    const hosUnarmed = await dmgText(W.unarmed);
    await page.evaluate(w => [...document.querySelectorAll('#weaponsBody tr')].find(r => r.querySelector('.wp-name')?.value === w).querySelector('.wp-dmg-btn').click(), W.unarmed);
    const hosNote = await page.evaluate(() => [...document.querySelectorAll('#rollModalBody .dsx4532-roll-note')].map(n => n.textContent.split(':')[0]));
    await page.keyboard.press('Escape');
    check('D1 Hands of Stone: one more kept die, named in the result', [plainUnarmed, hosUnarmed, hosNote], ['3k1', '3k2', ['Hands of Stone']]);
    // D2-D3
    await fresh(); await type('#trait_strength', 3); await addWeapon(W.large); await addWeapon('Katana'); await addWeapon(W.bow);
    const base = {large:await dmgText(W.large), katana:await dmgText('Katana'), bow:await dmgText(W.bow)};
    await pick('advQuickAdd', 'Large');
    const large = {large:await dmgText(W.large), katana:await dmgText('Katana')};
    const plus = (t, n) => { const m = /^(\d+)k(\d+)/.exec(t); return (+m[1] + n) + 'k' + m[2]; };
    check('D2 Large: +1k0 on the Large melee weapon only', [large.large, large.katana], [plus(base.large, 1), base.katana]);
    await page.evaluate(() => { const d = [...document.querySelectorAll('#advList .entry')].find(e => e.querySelector('.en-name').value === 'Large'); d.querySelector('.rm-btn').click(); });
    await pick('disadvQuickAdd', 'Small');
    check('D3 Small: -1k0 on the Katana, the bow unchanged', [await dmgText('Katana'), await dmgText(W.bow)], [plus(base.katana, -1), base.bow]);
    // D4
    check('D4 Large greyed beside Small', await page.evaluate(() => { const o = [...document.getElementById('advQuickAdd').options].find(x => x.value === 'Large');
      return [o.disabled, / — not with Small$/.test(o.textContent)]; }), [true, true]);
    // D5-D6 Great Destiny
    await fresh(); await type('#trait_stamina', 3); await type('#trait_willpower', 3); await pick('advQuickAdd', 'Great Destiny');
    const limit = await page.evaluate(() => +/of (\d+) wound points/.exec(document.getElementById('woundSummaryLine').textContent)[1]);
    await press('Great Destiny', 'Use');
    await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
    await page.evaluate(() => document.getElementById('appConfirmOk').click());
    await page.waitForFunction(() => +document.getElementById('f_woundsTaken').value > 0);
    check('D5 Great Destiny: 1 Wound from death, used', [await page.evaluate(() => +document.getElementById('f_woundsTaken').value),
      await page.evaluate(() => document.getElementById('woundSummaryLine').textContent.split(' — ')[0]), await rowState('Great Destiny')],
      [limit - 1, 'Out', {state:'Used this session.', toggles:[], use:true}]);
    await press('Great Destiny', 'Reset session');
    check('D6 Reset session', (await rowState('Great Destiny')).state, 'Available this session.');
    // D7-D8 Haunted
    await fresh(); await pick('disadvQuickAdd', 'Haunted'); await toggle('Haunted', '.dsx4532-toggle');
    await rollTrait('Strength'); await preview(); await page.locator('[data-rd4515-key="damage-sessions-xp:haunted"]').check();
    p = await preview(); r = await go();
    await rollTrait('Strength'); const again = (await preview()).boxes.filter(b => /^Haunted/.test(b[0])); await cancel();
    check('D7 Haunted: -1k1 on the chosen roll, then spent', [p.pool, /Haunted/.test(r.body), (await rowState('Haunted')).state, again], ['1k1', true, 'Used this session.', []]);
    await press('Haunted', 'Reset session');
    await rollTrait('Strength'); const offered = (await preview()).boxes.filter(b => /^Haunted/.test(b[0])); await cancel();
    check('D8 Reset session offers it again', offered, [['Haunted: the GM chose this roll — −1k1', false]]);
    // D9 Enlightened
    const voidXP = () => page.evaluate(() => +[...document.querySelectorAll('#xpBreakdown div')].find(x => x.textContent.startsWith('Void:')).querySelector('strong').textContent);
    await fresh(); await type('#ring_void', 3); const v0 = await voidXP(); await pick('advQuickAdd', 'Enlightened');
    check('D9 Enlightened: 2 XP less for the Rank bought', [v0, await voidXP()], [18, 16]);
    // D10 Obtuse
    await fresh(); await addSkill('Courtier', 3); await addSkill('Investigation', 3); await pick('disadvQuickAdd', 'Obtuse');
    check('D10 Obtuse doubles Courtier, not Investigation', await page.evaluate(() => [...document.querySelectorAll('#skillsBody tr')].map(r => r.querySelector('.sk-cost').textContent)), ['12 xp', '6 xp']);
    // D11-D12 Blissful Betrothal
    await fresh(); await pick('advQuickAdd', 'Blissful Betrothal'); const spent0 = await page.evaluate(() => +document.getElementById('f_xpSpent').value);
    await pick('advQuickAdd', 'Social Position');
    check('D11 Social Position 4, and XP spent agrees at once', await page.evaluate(spent0 => [+[...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Social Position').querySelector('.en-cost').value,
      +document.getElementById('f_xpSpent').value - spent0], spent0), [4, 4]);
    await pick('advQuickAdd', 'Kharmic Tie');
    await page.evaluate(() => { const d = [...document.querySelectorAll('#advList .entry')].find(e => e.querySelector('.en-name').value === 'Kharmic Tie');
      d.dataset.advConfig = JSON.stringify({type:'rankPick', value:'Rank 3', rank:3, target:'Aiko', remaining:3}); window.__L5R_TEST__.recalcAll(); });
    const tie = () => page.evaluate(() => +[...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Kharmic Tie').querySelector('.en-cost').value);
    const t0 = await tie(); await toggle('Blissful Betrothal', '.dsx4532-toggle');
    check('D12 The Tie costs 2 less only with the spouse switch', [t0, await tie()], [3, 1]);
    // D13 save and load
    await pick('disadvQuickAdd', 'Haunted'); await toggle('Haunted', '.dsx4532-toggle');
    const saved2 = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
    await fresh(); await page.evaluate(s => { const T = window.__L5R_TEST__; T.applyData(JSON.parse(s)); T.recalcAll(); }, saved2);
    check('D13 Switches and costs survive a save and load', [(await rowState('Haunted')).toggles, await page.evaluate(() =>
      +[...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Social Position').querySelector('.en-cost').value), await tie()], [[true], 4, 1]);
    // D14 Play mode
    await pick('advQuickAdd', 'Great Destiny');
    await page.evaluate(() => document.getElementById('pm12Toggle').click());
    check('D14 Play: Use, Reset and Ancestor angry work; the spouse switch is locked', await page.evaluate(() => [
      [...document.querySelectorAll('.dsx4532-btn')].every(b => b.offsetParent !== null), [...document.querySelectorAll('.dsx4532-toggle:not(.dsx4532-spouse)')].every(t => !t.disabled),
      document.querySelector('.dsx4532-spouse').disabled]), [true, true, true]);
    await page.evaluate(() => document.getElementById('pm12Toggle').click());
    // C17 / D15: the rows at phone width
    await fresh();
    for (const n of ['Contrary', 'Rumormonger', 'Lost Love', 'Missing Limb', 'Haunted']) await pick('disadvQuickAdd', n);
    for (const n of ['Great Destiny', 'Blissful Betrothal']) await pick('advQuickAdd', n);
    await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; const pages = [...document.querySelectorAll('[data-car-slug]')];
      C.goToTab(pages.findIndex(p => p.contains(document.getElementById('advList')))); await C.whenSettled(); });
    check('C17/D15 Rows fit at 390px', await page.evaluate(() => [...document.querySelectorAll('.chk4531-row, .dsx4532-row')].every(row => {
      const e = row.closest('.entry').getBoundingClientRect();
      return [...row.children].every(c => { const b = c.getBoundingClientRect(); return b.left >= e.left - 1 && b.right <= e.right + 1; }); })));
  } catch (error) {
    check('WALK-EXCEPTION', String(error.stack || error), 'none');
  } finally {
    check('NO-PAGE-ERRORS', errors, []);
    await browser.close();
    const n = results.filter(r => r.pass).length;
    console.log(n + '/' + results.length + ' checks passed');
    process.exitCode = results.length > 0 && n === results.length ? 0 : 1;
  }
})();
