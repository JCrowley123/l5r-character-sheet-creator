// Walks Release 7b.2's device checklist at phone size, through the controls the owner taps, and records what the sheet
// shows after each step. It first makes the two test characters the checklist imports (Export JSON), then imports each
// into fresh storage, as the owner will. Usage: node checklist-walk.cjs <output folder> [sheet.html instead of the live site]
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const out = process.argv[2];
if(!out) throw Error('Supply the output folder');
const url = process.argv[3] ? pathToFileURL(path.resolve(process.argv[3])).href : 'https://l5r-character-sheet-creator.pages.dev/';
const FILES = {sets: '7b2-checks-sets.l5r.json', instigator: '7b2-checks-instigator.l5r.json'};
const LABELS = {sets: '7b.2 checks — Sets', instigator: '7b.2 checks — Instigator'};
const HELD = ' Kept as saved; your GM may allow it under GM overrides, in Management.';
const TOTAL = 16;

async function openPage(browser, noShare) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, acceptDownloads: true});
  // Making the files only: without a share sheet, Export JSON takes the sheet's own download path.
  if(noShare) await context.addInitScript(() => {for(const k of ['share', 'canShare']) Object.defineProperty(Navigator.prototype, k, {value: undefined, configurable: true});});
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 60000});
  await ready(page);
  return {context, page};
}
async function ready(page) {
  await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready, null, {timeout: 60000});
  await page.waitForFunction(() => !document.querySelector('[id^=l5r-splash]'), null, {timeout: 30000});
}

(async () => {
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch(), checks = [], errors = [];
  const check = (id, ok, seen) => {checks.push({id, passed: !!ok, seen}); console.log((ok ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(seen).slice(0, 700));};
  const tools = page => {
    const T = (fn, arg) => page.evaluate(fn, arg);
    const goTab = async label => {await page.locator('.car-tab', {hasText: label}).first().click(); await T(() => window.__L5R_CAROUSEL__.whenSettled());};
    const setMode = async mode => {if(await T(() => window.__L5R_TEST__.MODES12.isPlay()) !== (mode === 'play')) await page.locator('.pm12-toggle').first().click(); await page.waitForTimeout(300);};
    const opt = (sel, name) => T(([sel, name]) => {const o = [...document.getElementById(sel).options].find(o => o.value === name); return o ? [o.disabled, o.textContent] : null;}, [sel, name]);
    const flags = () => T(() => [...document.querySelectorAll('#advList .entry, #disadvList .entry')].flatMap(e => [...e.querySelectorAll('.sr7-flags p')].map(p => [e.querySelector('.en-name').value, p.className, p.textContent])));
    const radios = () => T(() => [...document.querySelectorAll('#advConfigGrid input[type=radio]')].filter(r => r.disabled).map(r => [r.value, (r.closest('label')?.querySelector('.sr7-reason') || {}).textContent || '']));
    return {T, goTab, setMode, opt, flags, radios};
  };
  try {
    // The two test characters, made by data and saved through the sheet's own Export JSON.
    {
      const {context, page} = await openPage(browser, true);
      const T = (fn, arg) => page.evaluate(fn, arg);
      await T(() => {window.__L5R_TEST__.CL11?.close?.(); window.__L5R_TEST__.MODES12.set('management');});
      const exportTo = async name => {
        const [download] = await Promise.all([page.waitForEvent('download', {timeout: 20000}), T(() => document.getElementById('btnExport').click())]);
        await download.saveAs(path.join(out, name));
      };
      // An old save holding two pairs that 7b.2 rules out: Paragon with Dark Paragon, and Benten's Blessing with Benten's Curse.
      await T(label => {
        const T = window.__L5R_TEST__;
        T.resetToBaseline(); T.MODES12.set('management');
        const d = T.collectData();
        Object.assign(d.fields, {f_name: label, f_clan: 'Crane', f_family: 'Kakita', f_school: 'Kakita Bushi', f_rank: '1'});
        d.adv = [{name: 'Paragon', cost: '7', desc: '', config: {type: 'paragonTenet', revision: 1, tenet: 'Courage', value: 'Courage'}},
                 {name: 'Dark Paragon', cost: '5', desc: '', config: {type: 'darkParagon', revision: 1, precept: 'Control', value: 'Control', remaining: 1}},
                 {name: 'Seven Fortunes’ Blessing', cost: '4', desc: '', config: {type: 'fortuneBlessing', revision: 1, fortune: 'Benten', value: 'Benten'}}];
        d.disadv = [{name: 'Seven Fortunes’ Curse', cost: '3', desc: '', config: {type: 'fortunePick', fortune: 'Benten', value: 'Benten'}}];
        T.applyData(d); T.recalcAll();
      }, LABELS.sets);
      await exportTo(FILES.sets);
      // A Bayushi Courtier meeting every Scorpion Instigator requirement except the fourth person blackmailed.
      await T(label => {
        const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
        T.resetToBaseline(); T.MODES12.set('management'); T.saveSchoolsList([]);
        ['stamina', 'willpower', 'agility', 'intelligence', 'reflexes', 'awareness', 'strength', 'perception'].forEach(t => $('trait_' + t).value = '6');
        for(const name of ['Courtier', 'Etiquette', 'Sincerity', 'Stealth']) $('skillsBody').appendChild(T.makeSkillRow({name, trait: 'Awareness', rank: 6}));
        const add = (name, dis, config) => {const row = T.makeEntry({name, cost: 0, desc: ''}, true); $(dis ? 'disadvList' : 'advList').appendChild(row); if(config) row.dataset.advConfig = JSON.stringify(config);};
        add('Multiple Schools'); add('Dark Secret', true);
        ['Bayushi Kachiko', 'Doji Hoturi', 'Akodo Toturi'].forEach(t => add('Blackmail', false, {type: 'targetStatusPick', revision: 1, target: t, targetStatus: 2, value: t + ' — agreed Status 2'}));
        T.saveSchoolsList([{name: 'Bayushi Courtier', frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0}]);
        $('f_name').value = label; $('f_clan').value = 'Scorpion'; $('f_family').value = 'Bayushi'; $('f_school').value = 'Bayushi Courtier';
        T.recalcAll();
      }, LABELS.instigator);
      await exportTo(FILES.instigator);
      check('S1', Object.values(FILES).every(n => fs.statSync(path.join(out, n)).size > 0) && !page.errors.length,
        {files: Object.values(FILES).map(n => [n, fs.statSync(path.join(out, n)).size]), errors: page.errors});
      await context.close();
    }

    // Each test character goes into fresh storage through the Characters list's Import JSON, then opens from its row.
    const openFromList = async (page, label) => {
      const row = page.locator('.cl11-row', {hasText: label});
      await row.first().waitFor({timeout: 15000});
      await row.first().locator('button[data-act=open]').click();
      await page.waitForFunction(l => document.getElementById('f_name')?.value === l, label, {timeout: 15000});
      await page.waitForTimeout(800);
    };
    const importInto = async key => {
      const {context, page} = await openPage(browser);
      // With nothing saved yet the app opens on the sheet; the Characters list is the app bar's Characters.
      if(!(await page.locator('#cl11Import').isVisible())) await page.locator('.ab113-item', {hasText: 'Characters'}).first().click();
      await page.locator('#cl11Import').waitFor({timeout: 15000});
      await page.locator('#cl11ImportFile').setInputFiles(path.join(out, FILES[key]));
      await openFromList(page, LABELS[key]);
      return {context, page};
    };

    // A: adding from the lists on a new character.
    {
      const {context, page} = await openPage(browser);
      const {T, goTab, setMode, opt, flags, radios} = tools(page);
      await setMode('management'); await goTab('Adv & Disadv');
      await page.locator('#advQuickAdd').selectOption('Paragon');
      await page.locator('#advConfigGrid input[value="Courage"]').check();
      await page.locator('#advConfigConfirm').click(); await page.waitForTimeout(300);
      let s = {dark: await opt('advQuickAdd', 'Dark Paragon'), paragon: await opt('advQuickAdd', 'Paragon'), failure: await opt('disadvQuickAdd', 'Failure of Bushido'), consumed: await opt('disadvQuickAdd', 'Consumed')};
      check('A1', s.dark[0] && s.dark[1] === 'Dark Paragon (5 pts) — ruled out by Paragon (Core p.148)' && s.paragon[0] && s.paragon[1] === 'Paragon (7 pts) — one only (Core p.148)' &&
        s.failure[0] && s.failure[1] === 'Failure of Bushido (3 pts) — ruled out by Paragon (Core p.148)' && !s.consumed[0], s);
      await page.locator('#advList .entry .rm-btn').first().click(); await page.waitForTimeout(300);
      s = {rows: await T(() => document.querySelectorAll('#advList .entry').length), dark: await opt('advQuickAdd', 'Dark Paragon'), failure: await opt('disadvQuickAdd', 'Failure of Bushido')};
      check('A2', s.rows === 0 && !s.dark[0] && s.dark[1] === 'Dark Paragon (5 pts)' && !s.failure[0], s);
      await page.locator('#advQuickAdd').selectOption('Seven Fortunes’ Blessing');
      await page.locator('#advConfigGrid input[value="Benten"]').check();
      await page.locator('#advConfigConfirm').click(); await page.waitForTimeout(300);
      s = {curse: await opt('disadvQuickAdd', 'Seven Fortunes’ Curse')};
      await page.locator('#disadvQuickAdd').selectOption('Seven Fortunes’ Curse'); await page.waitForTimeout(300);
      s.greyed = await radios();
      await page.locator('#advConfigModalOverlay').screenshot({path: path.join(out, 'a3-curse-choice.png')}).catch(() => {});
      check('A3', !s.curse[0] && JSON.stringify(s.greyed) === JSON.stringify([['Benten', ' — ruled out by Benten’s Blessing (Core p.148)']]), s);
      await page.locator('#advConfigGrid input[value="Bishamon"]').check();
      await page.locator('#advConfigConfirm').click(); await page.waitForTimeout(300);
      s = {curse: await T(() => {const r = document.querySelector('#disadvList .entry:last-child'); return r ? [r.querySelector('.en-name').value, JSON.parse(r.dataset.advConfig || '{}').fortune] : null;}), flags: await flags()};
      check('A4', JSON.stringify(s.curse) === JSON.stringify(['Seven Fortunes’ Curse', 'Bishamon']) && s.flags.length === 0, s);
      if(page.errors.length) errors.push(...page.errors.map(e => 'new: ' + e));
      await context.close();
    }

    // B: an old save holding two ruled-out pairs, and the GM overrides.
    {
      const {context, page} = await importInto('sets');
      const {T, goTab, setMode, flags} = tools(page);
      await setMode('management'); await goTab('Adv & Disadv');
      const pair = 'Core p.148: Paragon and Dark Paragon cannot both be held.' + HELD, benten = 'Core p.148: Benten cannot both bless and curse one character.' + HELD;
      let s = {flags: await flags(), rows: await T(() => [...document.querySelectorAll('#advList .entry .en-name, #disadvList .entry .en-name')].map(n => n.value))};
      await page.locator('#advList .entry').first().screenshot({path: path.join(out, 'b1-flagged-row.png')}).catch(() => {});
      check('B1', JSON.stringify(s.flags) === JSON.stringify([['Paragon', 'sr7-flag', pair], ['Dark Paragon', 'sr7-flag', pair], ['Seven Fortunes’ Blessing', 'sr7-flag', benten], ['Seven Fortunes’ Curse', 'sr7-flag', benten]]) &&
        JSON.stringify(s.rows) === JSON.stringify(['Paragon', 'Dark Paragon', 'Seven Fortunes’ Blessing', 'Seven Fortunes’ Curse']), s);
      await goTab('Identity');
      s = await T(() => {const r = document.getElementById('validationReport'); return {text: r.textContent.replace(/\s+/g, ' ').trim(), count: (r.textContent.match(/Advantage and Disadvantage sets \(Core p\.148\)/g) || []).length};});
      check('B2', s.count === 1 && s.text.includes('Paragon and Dark Paragon cannot both be held.'), {count: s.count, text: s.text.slice(0, 600)});
      await goTab('Adv & Disadv');
      await page.locator('#sr7Overrides > summary').click(); await page.waitForTimeout(200);
      await page.locator('#sr7Overrides label', {hasText: 'Paragon with Dark Paragon'}).locator('input').check(); await page.waitForTimeout(300);
      s = {flags: await flags(), field: await T(() => document.getElementById('f_setRuleOverrides').value)};
      const note = 'GM override: Paragon with Dark Paragon (Core p.148).';
      check('B3', JSON.stringify(s.flags) === JSON.stringify([['Paragon', 'sr7-note', note], ['Dark Paragon', 'sr7-note', note], ['Seven Fortunes’ Blessing', 'sr7-flag', benten], ['Seven Fortunes’ Curse', 'sr7-flag', benten]]) &&
        s.field === '["paragon+dark-paragon"]', s);
      // The tick is kept with the character: reopen it after a reload.
      await page.waitForTimeout(1500);
      await page.reload({waitUntil: 'domcontentloaded', timeout: 60000}); await ready(page);
      if(!(await page.locator('#cl11Import').isVisible())) await page.locator('.ab113-item', {hasText: 'Characters'}).first().click();
      await openFromList(page, LABELS.sets);
      await setMode('management'); await goTab('Adv & Disadv');
      s = {ticked: await T(() => document.querySelector('#sr7Overrides input[value="paragon+dark-paragon"]')?.checked), flags: (await flags()).map(f => f[1])};
      check('B4', s.ticked === true && JSON.stringify(s.flags) === JSON.stringify(['sr7-note', 'sr7-note', 'sr7-flag', 'sr7-flag']), s);
      await setMode('play');
      s = {panel: await T(() => getComputedStyle(document.getElementById('sr7Overrides')).display), flags: (await flags()).length};
      check('B5', s.panel === 'none' && s.flags === 4, s);
      if(page.errors.length) errors.push(...page.errors.map(e => 'sets: ' + e));
      await context.close();
    }

    // C: the three reference entries in Search.
    {
      const {context, page} = await openPage(browser);
      const {T, opt} = tools(page);
      const search = async text => {
        if(!(await page.locator('#s14Input').isVisible())) await page.locator('#ab113Bar [data-section="search"]').click();
        await page.locator('#s14Input').fill(text); await page.waitForTimeout(500);
        return T(() => [...document.querySelectorAll('.s14-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));
      };
      const detail = async name => {
        await page.locator('.s14-row', {hasText: name}).first().click(); await page.waitForTimeout(400);
        const text = await T(() => (document.querySelector('.s14-detail') || {}).textContent?.replace(/\s+/g, ' ').trim() || '');
        await page.keyboard.press('Escape').catch(() => {});
        return text;
      };
      let rows = await search('daimyo');
      const hits = rows.filter(r => /Daimyo/.test(r));
      let text = await detail('The World of the Daimyo');
      check('C1', hits.some(r => r.includes('The World of the Daimyo')) && hits.some(r => r.includes('The Daimyo’s Path')) && text.includes('Emerald Empire p.279') &&
        text.includes('Reference only: the sheet does not apply Emerald Empire’s Station rules. Not in the Advantage list.'), {hits, text: text.slice(0, 500)});
      await page.locator('#ab113Bar [data-section="search"]').click().catch(() => {});
      rows = await search('Chikushudo');
      text = await detail('Child of Chikushudo');
      check('C2', rows.some(r => r.includes('Child of Chikushudo')) && text.includes('Enemies of the Empire p.244') && text.includes('Reference only: the sheet does not apply the shapeshifter rules.'),
        {rows: rows.filter(r => /Child/.test(r)), text: text.slice(0, 500)});
      await page.locator('#ab113Bar [data-section="sheet"]').click();
      const inLists = await T(() => ['The World of the Daimyo', 'The Daimyo’s Path', 'Child of Chikushudo'].filter(n => [...document.querySelectorAll('#advQuickAdd option, #disadvQuickAdd option')].some(o => o.value === n)));
      check('C3', inLists.length === 0, {inLists});
      if(page.errors.length) errors.push(...page.errors.map(e => 'search: ' + e));
      await context.close();
    }

    // D: the Scorpion Instigator counts different people blackmailed.
    {
      const {context, page} = await importInto('instigator');
      const {T, goTab, setMode} = tools(page);
      await setMode('management');
      const listed = async () => {await goTab('Techniques'); return T(() => [...document.getElementById('advancedSchoolPicker').options].some(o => o.value === 'Scorpion Instigator'));};
      const fill = async (target, status) => {
        await page.locator('#named4513Target').fill(target);
        const tag = await T(() => document.getElementById('named4513Status').tagName);
        if(tag === 'SELECT') await page.locator('#named4513Status').selectOption(String(status)); else await page.locator('#named4513Status').fill(String(status));
        await page.locator('#advConfigConfirm').click(); await page.waitForTimeout(400);
      };
      let s = {listed: await listed(), blackmail: await T(() => [...document.querySelectorAll('#advList .entry')].filter(e => e.querySelector('.en-name').value === 'Blackmail').length)};
      check('D1', s.listed === false && s.blackmail === 3, s);
      await goTab('Adv & Disadv');
      await page.locator('#advQuickAdd').selectOption('Blackmail'); await page.waitForTimeout(300);
      await fill('  doji HOTURI ', 2);
      s = {listed: await listed(), rows: await T(() => [...document.querySelectorAll('#advList .entry')].filter(e => e.querySelector('.en-name').value === 'Blackmail').map(e => JSON.parse(e.dataset.advConfig || '{}').target))};
      check('D2', s.listed === false && s.rows.length === 4, s);
      await goTab('Adv & Disadv');
      await page.locator('#advList .entry').last().locator('.adv-config-btn').click(); await page.waitForTimeout(300);
      await fill('Isawa Kaede', 2);
      s = {listed: await listed()};
      if(s.listed) {
        await page.locator('#advancedSchoolPicker').selectOption('Scorpion Instigator'); await page.waitForTimeout(300);
        s.boxes = await T(() => [...document.querySelectorAll('#advancedSchoolConfirmations input')].map(i => [i.value, i.closest('label').textContent.trim()]));
        s.before = await T(() => document.getElementById('advancedSchoolEnter').disabled);
        await page.locator('#advancedSchoolConfirmations input[value="instigator-secret-disclosed"]').check(); await page.waitForTimeout(200);
        s.after = await T(() => document.getElementById('advancedSchoolEnter').disabled);
        await page.locator('#advancedSchoolDetails').screenshot({path: path.join(out, 'd3-instigator.png')}).catch(() => {});
      }
      check('D3', s.listed === true && s.boxes.length === 1 && s.boxes[0][0] === 'instigator-secret-disclosed' && s.before === true && s.after === false, s);
      if(page.errors.length) errors.push(...page.errors.map(e => 'instigator: ' + e));
      await context.close();
    }
  } catch(e) {errors.push(String(e && e.stack || e)); check('walk completed', false, String(e));}
  finally {await browser.close();}
  const report = {url, checked_utc: new Date().toISOString(), scope: 'Headless Chrome at 390 × 844 (touch), ' + (process.argv[3] ? 'local build' : 'live site') + ', fresh storage; not the owner\'s iPhone or Edge.', checks, errors,
    passed: checks.length === TOTAL && checks.every(c => c.passed) && errors.length === 0};
  fs.writeFileSync(path.join(out, 'checklist-walk.json'), JSON.stringify(report, null, 2) + '\n');
  console.log((report.passed ? 'WALK PASSED ' : 'WALK FAILED ') + checks.filter(c => c.passed).length + '/' + checks.length + (errors.length ? ' errors: ' + errors.join(' | ') : ''));
  process.exitCode = report.passed ? 0 : 1;
})();
