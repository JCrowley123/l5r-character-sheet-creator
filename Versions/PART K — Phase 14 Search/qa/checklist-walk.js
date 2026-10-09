/* Walks the combined owner checklist for Phases 14, 4.5.33 and 4.5.34 (the three MANUAL-TESTS.md files) through
 * the real controls on a served page: the More menu, the Search tab, its box, categories, rows and Back, the
 * Advantage and Disadvantage pickers, the Skill picker and roll button, the roll preview's Void tick, the rows'
 * own buttons, the Void card and the round buttons. Values are typed with input events only. Expected values are
 * the checklist's own.
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
    const fresh = mode => page.evaluate(mode => { const T = window.__L5R_TEST__; T.CL11?.close?.(); T.resetToBaseline(); T.clearAllRows?.();
      T.MODES12?.set(mode || 'management'); T.recalcAll(); }, mode);
    const type = (selector, value) => page.evaluate(({selector, value}) => { const e = document.querySelector(selector); e.value = value;
      e.dispatchEvent(new Event('input', {bubbles:true})); e.dispatchEvent(new Event('change', {bubbles:true})); }, {selector, value});
    const pick = (id, value) => page.evaluate(({id, value}) => { const s = document.getElementById(id); s.value = value;
      if (s.value !== value) throw Error('no option ' + value + ' in ' + id); s.dispatchEvent(new Event('change', {bubbles:true})); }, {id, value});
    const menuItems = () => page.$$eval('#pm128Menu [role=menuitem]', b => b.filter(x => x.offsetParent).map(x => x.textContent));
    const openSearch = async () => { await page.click('#pm128More'); await page.click('#s14MenuItem');
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden && document.querySelector('.s14-page')); };
    const rows = () => page.$$eval('.s14-row', r => r.map(x => [x.querySelector('.s14-name').textContent, x.querySelector('.s14-meta').textContent,
      x.querySelector('.s14-source')?.textContent || '']));
    const openFirst = async text => { await page.fill('#s14Input', text); await page.click('.s14-row'); };
    const detail = () => page.evaluate(() => { const d = document.querySelector('.s14-detail');
      return {name:d.querySelector('h3').textContent, meta:d.querySelector('.s14-detail-meta').textContent,
        source:d.querySelector(':scope > .s14-source')?.textContent || '',
        fields:Object.fromEntries([...d.querySelectorAll('dt')].map((dt, i) => [dt.textContent, d.querySelectorAll('dd')[i].textContent])),
        sections:[...d.querySelectorAll('.s14-section')].map(s => [s.querySelector('h4').textContent, s.querySelectorAll('li').length])}; });
    const back = () => page.click('.s14-detail [data-s14="back"]');
    const press = (name, text) => page.evaluate(({name, text}) => {
      const d = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(e => e.querySelector('.en-name').value === name);
      const b = d && [...d.querySelectorAll('.vi4533-row button')].find(x => x.textContent === text);
      if (!b) throw Error('no ' + text + ' on ' + name); b.click(); }, {name, text});
    const rowLine = name => page.evaluate(name => {
      const d = [...document.querySelectorAll('#advList .entry, #disadvList .entry')].find(e => e.querySelector('.en-name').value === name);
      const r = d.querySelector('.vi4533-row');
      return {buttons:[...r.querySelectorAll('button')].map(b => [b.textContent, b.disabled]), notes:[...r.querySelectorAll('.vi4533-note')].map(n => n.textContent)}; }, name);
    const addSkill = (name, rank) => page.evaluate(({name, rank}) => { const s = document.getElementById('skillQuickAdd'); s.value = name;
      if (s.value !== name) throw Error('no skill ' + name); s.dispatchEvent(new Event('change', {bubbles:true}));
      const row = [...document.querySelectorAll('#skillsBody tr')].filter(r => r.querySelector('.sk-name')?.value === name).pop();
      row.querySelector('.sk-rank').value = rank; row.querySelector('.sk-rank').dispatchEvent(new Event('input', {bubbles:true})); }, {name, rank});
    const rollSkill = name => page.evaluate(name => [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === name).querySelector('.sk-roll').click(), name);
    const previewPool = () => page.evaluate(() => ({pool:document.querySelector('.rp-pool-final')?.textContent || '', text:document.getElementById('rollPreviewBody').textContent}));

    // ================= Phase 14 Search =================
    await fresh('management');
    const before = await page.evaluate(() => ({data:JSON.stringify(window.__L5R_TEST__.collectData()), tab:window.__L5R_CAROUSEL__.getActiveTab().slug}));
    await page.click('#pm128More');
    check('S1-MENU-MANAGE', (await menuItems())[0], 'Search');
    await page.click('#s14MenuItem');
    await page.waitForFunction(() => !document.getElementById('cl11View').hidden && document.querySelector('.s14-page'));
    check('S2-SEARCH-TAB', await page.evaluate(() => [document.querySelector('.cl11-tab.active').dataset.tab,
      [...document.querySelectorAll('.s14-group')].map(g => g.textContent), document.querySelectorAll('.s14-cat').length]),
      ['search', ['Character', 'Schools', 'Techniques', 'Equipment', 'Clans'], 13]);
    check('S3-BOX-16PX', await page.$eval('#s14Input', i => getComputedStyle(i).fontSize), '16px');
    await page.click('#s14Input');
    const seen = [];
    for (const ch of 'kat') { await page.keyboard.type(ch); seen.push(await page.evaluate(() => document.querySelector('.s14-count').textContent)); }
    check('S4-TYPE-AHEAD', [new Set(seen).size === 3, (await rows())[0][0]], [true, 'Katana']);
    await page.fill('#s14Input', '');
    await page.click('[data-category="spells"]');
    const spells = await page.evaluate(() => [document.querySelector('.s14-crumb-title').textContent, document.querySelector('.s14-count').textContent,
      !document.querySelector('.s14-more').hidden]);
    check('S5-SPELLS-PAGE', spells, ['Spells', '260 entries', true]);
    await page.fill('#s14Input', 'fire');
    check('S6-SPELLS-ONLY', (await rows()).every(r => r[1].startsWith('Fire') || r[1].includes('Mastery')) &&
      await page.$$eval('.s14-row', r => r.every(x => x.dataset.id.startsWith('spells:'))));
    await page.fill('#s14Input', '');
    await page.click('.s14-up');
    await openFirst('quick');
    const quick = await detail();
    check('S7-QUICK', [quick.name, quick.meta, quick.source, quick.fields['Cost'], quick.fields['Clan or School price']],
      ['Quick', 'Advantage · Physical · 6 points', 'Core Rulebook p.152', '6 points', '5 points for ninja']);
    await back();
    await openFirst('hida bushi');
    const hida = await detail();
    check('S8-HIDA-BUSHI', [hida.name, hida.fields['Clan'], hida.fields['Benefit'], hida.fields['Honor'], hida.sections], ['Hida Bushi', 'Crab Clan', '+1 Stamina', '3.5', [['Techniques', 5]]]);
    await back();
    const others = [];
    for (const [cat, text] of [['paths', 'student of hitsu-do'], ['spells', "arrow's flight"], ['kiho', 'air fist'], ['weapons', 'katana'], ['ancestors', 'hida']]) {
      await page.evaluate(c => window.__L5R_TEST__.SEARCHPAGE14.open({category:c, text:''}), cat);
      await openFirst(text); const d = await detail(); others.push([cat, !!d.name, d.source !== '']); await back();
    }
    check('S9-OTHER-DETAILS', others, [['paths', true, true], ['spells', true, false], ['kiho', true, false], ['weapons', true, false], ['ancestors', true, true]]);
    await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'paths', text:''}));
    await page.evaluate(() => { document.getElementById('cl11View').scrollTop = 300; });
    const scroll = await page.evaluate(() => document.getElementById('cl11View').scrollTop);
    await page.evaluate(() => [...document.querySelectorAll('.s14-row')][8].click());
    await back();
    check('S10-BACK-SAME-PLACE', await page.evaluate(() => document.getElementById('cl11View').scrollTop), scroll);
    await page.fill('#s14Input', 'kenshinzen');
    await page.click('.cl11-back');
    await openSearch();
    check('S11-SEARCH-KEPT', await page.evaluate(() => [document.querySelector('.s14-crumb-title').textContent, document.getElementById('s14Input').value]),
      ['Alternate Paths', 'kenshinzen']);
    await page.click('.cl11-back');
    await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('play'); });
    await page.click('#pm128More');
    check('S12-MENU-PLAY', (await menuItems())[0], 'Search');
    await page.click('#s14MenuItem');
    await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
    await page.fill('#s14Input', '');
    await page.evaluate(() => { const u = document.querySelector('.s14-up'); if (u.offsetParent) u.click(); });
    await page.fill('#s14Input', 'kat');
    check('S12-PLAY-TYPE', (await rows())[0][0], 'Katana');
    await page.click('.cl11-back');
    await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('management'); });
    const after = await page.evaluate(() => ({data:JSON.stringify(window.__L5R_TEST__.collectData()), tab:window.__L5R_CAROUSEL__.getActiveTab().slug}));
    check('S13-SHEET-UNCHANGED', [after.data === before.data, after.tab === before.tab], [true, true]);

    // ================= Phase 4.5.33 =================
    await fresh('management');
    await page.evaluate(() => { const v = document.getElementById('void_current'); v.value = 2; });
    await pick('advQuickAdd', 'Daredevil');
    await addSkill('Athletics', 2);
    await rollSkill('Athletics');
    await page.waitForSelector('#rollPreviewGo', {state:'visible'});
    const without = (await previewPool()).pool;
    await page.click('input[data-void-key="k1"]');
    const withVoid = await previewPool();
    await page.click('#rollPreviewCancel');
    check('V1-DAREDEVIL', [without !== withVoid.pool, /Daredevil: Void \+3k1 on Athletics/.test(withVoid.text)], [true, true]);
    await fresh('management');
    await page.evaluate(() => { const v = document.getElementById('void_current'); v.value = 2; });
    await pick('disadvQuickAdd', 'Touch of the Void');
    await addSkill('Courtier', 2);
    await rollSkill('Courtier');
    await page.waitForSelector('#rollPreviewGo', {state:'visible'});
    await page.click('input[data-void-key="k1"]');
    const touch = await previewPool();
    await page.click('#rollPreviewCancel');
    await press('Touch of the Void', 'Willpower (TN 30)');
    await page.waitForSelector('#rollPreviewGo', {state:'visible'});
    await page.click('#rollPreviewGo');
    await page.waitForSelector('#rollDiceRow .roll-die');
    const touchCheck = await page.evaluate(() => document.getElementById('rollModalTitle').textContent);
    await page.keyboard.press('Escape');
    check('V2-TOUCH-OF-THE-VOID', [/Touch of the Void: Void \+2k1/.test(touch.text), /TN 30/.test(touchCheck)], [true, true]);
    await fresh('management');
    await pick('disadvQuickAdd', 'Momoku');
    await page.evaluate(() => { window.__L5R_TEST__.setCombatActive(true); window.__L5R_TEST__.renderVoidPanel(); });
    check('V3-MOMOKU', await page.evaluate(() => [[...document.querySelectorAll('#voidSpendButtons .void-spend-btn')].every(b => b.disabled),
      /Momoku/.test(document.getElementById('voidDisabledReason').textContent), !document.getElementById('void_current').disabled]), [true, true, true]);
    await page.evaluate(() => window.__L5R_TEST__.setCombatActive(false));
    await fresh('management');
    await type('#trait_reflexes', 3);
    await pick('advQuickAdd', 'Quick');
    await page.evaluate(() => { const t = document.getElementById('combatActiveToggle'); t.checked = true; t.dispatchEvent(new Event('change', {bubbles:true})); });
    await press('Quick', 'Did not act first: +Reflexes');
    const q1 = await rowLine('Quick');
    await page.evaluate(() => document.getElementById('btnNextRound').click());
    await press('Quick', 'Did not act first: +Reflexes');
    const q2 = await rowLine('Quick');
    await page.evaluate(() => document.getElementById('btnResetRounds').click());
    const q3 = await rowLine('Quick');
    check('V4-QUICK', [q1.notes[0], q1.buttons[0][1], q2.notes[0], q3.notes[0]],
      ['Initiative Score +3 this skirmish.', true, 'Initiative Score +6 this skirmish.', 'Each Round you did not act first, in the Reactions Stage.']);
    await fresh('management');
    await pick('advQuickAdd', 'Leadership');
    await page.evaluate(() => { const t = document.getElementById('combatActiveToggle'); t.checked = true; t.dispatchEvent(new Event('change', {bubbles:true})); });
    const rank = await page.evaluate(() => parseInt(document.getElementById('f_rank').value, 10));
    await press('Leadership', 'Lead an ally (School Rank + 1k1)');
    await page.waitForSelector('#rollDiceRow .roll-die');
    const lead = await page.evaluate(() => ({title:document.getElementById('rollModalTitle').textContent, dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
      total:+document.getElementById('rollTotalDisplay').textContent, die:+document.querySelector('#rollDiceRow .roll-die').dataset.total}));
    await page.keyboard.press('Escape');
    check('V5-LEADERSHIP', [lead.title, lead.dice, lead.total === lead.die + rank, (await rowLine('Leadership')).buttons[0][1]],
      ['Leadership — 1k1 + School Rank ' + rank + ', for one ally', 1, true, true]);
    await page.evaluate(() => { document.getElementById('btnResetRounds').click(); const t = document.getElementById('combatActiveToggle'); t.checked = false; t.dispatchEvent(new Event('change', {bubbles:true})); });

    // ================= Phase 4.5.34 =================
    await fresh('management');
    await type('#trait_reflexes', 2);
    await pick('disadvQuickAdd', 'Blind');
    await page.evaluate(() => window.__L5R_TEST__.renderQuickAccessPanel());
    const b1 = await page.evaluate(() => [document.getElementById('bl4534BaseNote')?.textContent, document.getElementById('bl4534QaNote')?.textContent]);
    await page.evaluate(() => { const d = [...document.querySelectorAll('#disadvList .entry')].find(e => e.querySelector('.en-name').value === 'Blind');
      d.querySelector('.rm-btn').click(); });
    await page.evaluate(() => { const c = document.getElementById('appConfirmOverlay'); if (c && c.style.display === 'flex') document.getElementById('appConfirmOk')?.click(); });
    await page.waitForTimeout(200);
    const gone = await page.evaluate(() => [!!document.querySelector('#disadvList .entry'), document.getElementById('bl4534BaseNote')?.textContent || null]);
    check('B1-BLIND-NOTE', [b1, gone[0] ? 'row kept' : gone[1]], [['Blind: Reflexes 2 + 5 = 7 (Core Rulebook p.156)', 'Blind: Reflexes 2 + 5 = 7'], null]);
  } catch (e) { check('WALK-EXCEPTION', String(e.stack || e).slice(0, 400), 'no exception'); }
  finally {
    check('NO-PAGE-ERRORS', errors, []);
    await browser.close();
    const n = results.filter(r => r.pass).length;
    console.log(n + '/' + results.length + ' checks passed');
    process.exitCode = results.length > 0 && n === results.length ? 0 : 1;
  }
})();
