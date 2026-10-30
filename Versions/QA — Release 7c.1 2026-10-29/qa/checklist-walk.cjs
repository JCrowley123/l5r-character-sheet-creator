// Walks Release 7c's device checklist with Release 7c.1's two changes (A3's label; C1 and C2: Cancel) at phone size, through the controls the owner taps, and records what the sheet
// shows after each step. It first makes the three test characters the checklist imports (Export JSON), then imports each
// into fresh storage, as the owner will. Adapted from Release 7b.2's walk.
// Usage: node checklist-walk.cjs <output folder> [sheet.html instead of the live site]
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const out = process.argv[2];
if(!out) throw Error('Supply the output folder');
const url = process.argv[3] ? pathToFileURL(path.resolve(process.argv[3])).href : 'https://l5r-character-sheet-creator.pages.dev/';
const CRAB = JSON.parse(fs.readFileSync(path.join(__dirname, '../../BUGFIX — After-Preview Refund/qa/7b1-checks-crab.l5r.json'), 'utf8'));
const FILES = {moon: '7c-checks-moon.l5r.json', archer: '7c-checks-archer.l5r.json', refund: '7c-checks-refund.l5r.json'};
const LABELS = {moon: '7c checks — Moon', archer: '7c checks — Archer', refund: '7c checks — Refund'};
const REFUSAL = 'At creation nothing goes above 4 (Core p.103).';
const SCROLLS = 'These are scrolls in your Equipment. Memorising a spell costs XP equal to its Mastery (Core p.164); tick Memorised on its row.';
const QUIVER = 'You have no arrows: your quiver is empty, so there is nothing to fire. Add arrows in Equipment to attack with this bow.';
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
    // Opens whichever carousel page holds the element, as the owner would by its tab.
    const showFor = async sel => {
      const n = await page.locator('.car-tab').count();
      for(let i = 0; i < n; i++) {
        await page.locator('.car-tab').nth(i).click(); await T(() => window.__L5R_CAROUSEL__.whenSettled());
        if(await page.locator(sel).first().isVisible() && await T(s => !document.querySelector(s).closest('[inert]'), sel)) return (await page.locator('.car-tab').nth(i).textContent()).trim();
      }
      return null;
    };
    const setMode = async mode => {if(await T(() => window.__L5R_TEST__.MODES12.isPlay()) !== (mode === 'play')) await page.locator('.pm12-toggle').first().click(); await page.waitForTimeout(300);};
    const status = () => T(() => (document.getElementById('statusMsg') || {}).textContent || '');
    const dialog = () => T(() => {const o = document.getElementById('appConfirmOverlay'); return o && getComputedStyle(o).display !== 'none' ? document.getElementById('appConfirmMsg').textContent : null;});
    const history = () => T(() => [...document.querySelectorAll('#al71List .al71-entry')].map(li => [li.querySelector('.al71-when').textContent, li.querySelector('.al71-what').textContent]));
    return {T, goTab, showFor, setMode, status, dialog, history};
  };
  try {
    // The three test characters, made by data and saved through the sheet's own Export JSON.
    {
      const {context, page} = await openPage(browser, true);
      const T = (fn, arg) => page.evaluate(fn, arg);
      await T(() => {window.__L5R_TEST__.CL11?.close?.(); window.__L5R_TEST__.MODES12.set('management');});
      const exportTo = async name => {
        const [download] = await Promise.all([page.waitForEvent('download', {timeout: 20000}), T(() => document.getElementById('btnExport').click())]);
        await download.saveAs(path.join(out, name));
      };
      // The Crab shugenja (Void 3) with Lord Moon's Curse at Medium in place of its Disadvantages.
      await T(([d, label]) => {
        const T = window.__L5R_TEST__;
        d = JSON.parse(JSON.stringify(d));
        d.fields.f_name = label;
        d.disadv = [{name: 'Lord Moon’s Curse', cost: '5', desc: '', config: {type: 'severityTier', value: 'Medium'}}];
        T.resetToBaseline(); T.applyData(d); T.recalcAll();
        document.getElementById('void_current').value = '3'; T.renderVoidPips(); T.recalcAll();
      }, [CRAB, LABELS.moon]);
      await exportTo(FILES.moon);
      // A Yumi that has fired before (Willow Leaf arrows) with Kyujutsu 3 and an empty quiver.
      await T(label => {
        const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
        T.resetToBaseline(); $('skillsBody').innerHTML = ''; $('weaponsBody').innerHTML = ''; $('equipBody').innerHTML = ''; T.clearLastArrowUsed();
        ['agility', 'reflexes', 'strength', 'stamina', 'perception', 'awareness', 'intelligence', 'willpower'].forEach(k => $('trait_' + k).value = 3);
        $('skillsBody').appendChild(T.makeSkillRow({name: 'Kyujutsu', trait: (T.findSkill('Kyujutsu') || {}).trait || '', rank: 3, emph: ''}));
        const L = T.findWeapon('Yumi');
        const row = $('weaponsBody').appendChild(T.makeWeaponRow({key: L.name, name: L.name, skill: L.skill, size: L.size, keywords: '', notes: '', roll: '', dmg: '', manualAttack: false, manualDamage: false}));
        row.querySelector('.wp-arrow-type').value = 'Willow Leaf';
        Object.assign($('f_name'), {value: label}); $('f_clan').value = 'Unicorn'; $('f_family').value = 'Utaku';
        T.recalcAll();
      }, LABELS.archer);
      await exportTo(FILES.archer);
      // The Crab shugenja (Kuni, Hotei's Curse) given Dark Paragon (Determination), Honor 2.6 and one Void Point.
      await T(([d, label]) => {
        const T = window.__L5R_TEST__;
        d = JSON.parse(JSON.stringify(d));
        d.fields.f_name = label; d.fields.f_honorRank = '2'; d.fields.f_honorPts = '6';
        d.adv = [{name: 'Dark Paragon', cost: '5', desc: '', config: {type: 'darkParagon', revision: 1, precept: 'Determination', value: 'Determination', remaining: 1}}];
        T.resetToBaseline(); T.applyData(d); T.recalcAll();
        document.getElementById('void_current').value = '1'; T.renderVoidPips(); T.recalcAll();
      }, [CRAB, LABELS.refund]);
      await exportTo(FILES.refund);
      check('S1', Object.values(FILES).every(n => fs.statSync(path.join(out, n)).size > 0) && !page.errors.length,
        {files: Object.values(FILES).map(n => [n, fs.statSync(path.join(out, n)).size]), errors: page.errors});
      await context.close();
    }

    // Each test character goes into fresh storage through the Characters list's Import JSON, then opens from its row.
    const toList = async page => {if(!(await page.locator('#cl11Import').isVisible())) await page.locator('.ab113-item', {hasText: 'Characters'}).first().click(); await page.locator('#cl11Import').waitFor({timeout: 15000});};
    const openFromList = async (page, label) => {
      const row = page.locator('.cl11-row', {hasText: label});
      await row.first().waitFor({timeout: 15000});
      await row.first().locator('button[data-act=open]').click();
      await page.waitForFunction(l => document.getElementById('f_name')?.value === l, label, {timeout: 15000});
      await page.waitForTimeout(800);
    };
    const importInto = async key => {
      const {context, page} = await openPage(browser);
      await toList(page);
      await page.locator('#cl11ImportFile').setInputFiles(path.join(out, FILES[key]));
      await openFromList(page, LABELS[key]);
      return {context, page};
    };

    // A: Lord Moon's Curse.
    {
      const {context, page} = await importInto('moon');
      const {T, goTab, setMode, status} = tools(page);
      await setMode('play'); await goTab('Adv');
      const moon = () => T(() => {const pips = [...document.querySelectorAll('#voidPips .void-pip')];
        return {void: document.getElementById('void_current').value, pips: pips.length, moonFirst: !!pips[0] && pips[0].classList.contains('lm7-moon-pip'),
          filled: pips.filter(x => x.classList.contains('filled')).length, quick: (document.getElementById('qaVoidValue') || {}).textContent || ''};});
      const box = page.locator('#disadvList .lm7-moon');
      let s = {label: await box.textContent().catch(() => null), button: await box.locator('.lm7-roll').textContent().catch(() => null)};
      await box.locator('input[type=checkbox]').check(); await page.waitForTimeout(400);
      Object.assign(s, await moon(), {status: await status()});
      await box.screenshot({path: path.join(out, 'a1-moon-row.png')}).catch(() => {});
      check('A1', /Full moon tonight/.test(s.label) && s.void === '4' && s.pips === 4 && s.moonFirst && s.filled === 4 &&
        s.status === 'Lord Moon’s Curse: the full moon gives a Void Point until sunrise, spent last.' && /4 \/ 3/.test(s.quick), s);
      await box.locator('input[type=checkbox]').uncheck(); await page.waitForTimeout(400);
      s = Object.assign(await moon(), {status: await status()});
      check('A2', s.void === '3' && s.pips === 3 && !s.moonFirst && s.status === 'Lord Moon’s Curse: sunrise. The moon’s Void Point was lost unspent.', s);
      await box.locator('.lm7-roll').click();
      await page.waitForSelector('#rollPreviewOverlay', {state: 'visible', timeout: 10000});
      s = {button: (await box.locator('.lm7-roll').textContent()).trim(), preview: await T(() => (document.getElementById('rollPreviewOverlay').textContent || '').includes('Lord Moon’s Curse — Willpower vs TN 20'))};
      await page.locator('#rollPreviewOverlay').screenshot({path: path.join(out, 'a3-moon-roll.png')}).catch(() => {});
      await page.locator('#rollPreviewCancel').click();
      check('A3', s.button === 'Resist Lord Moon (TN 20)' && s.preview, s);
      if(page.errors.length) errors.push(...page.errors.map(e => 'moon: ' + e));
      await context.close();
    }

    // B: the creation wizard, a Phoenix shugenja: the cap of 4 and the starting spells as scrolls.
    {
      const {context, page} = await openPage(browser);
      const {T, status} = tools(page);
      await toList(page);
      await page.locator('#cl11Create').click();
      await page.locator('.cw112-view').waitFor({timeout: 15000});
      const title = () => T(() => document.querySelector('.cw112-view .cw112-title')?.textContent || '');
      const next = async () => {
        if(await page.locator('#cw112Next').isDisabled()) throw Error('Next disabled at ' + await title() + ': ' +
          await T(() => (document.getElementById('cw112Reason')?.textContent || '') + ' | ' + (document.querySelector('.cw112-view')?.innerText || '').replace(/\s+/g, ' ').slice(0, 600)));
        await page.locator('#cw112Next').click(); await page.waitForTimeout(400);
      };
      const card = async name => {await page.locator('.cw112-view .cw112-card', {hasText: name}).first().click(); await page.waitForTimeout(500);};
      const until = async want => {for(let i = 0; i < 12 && (await title()) !== want; i++) await next(); return title();};
      const seen = {steps: []};
      await page.locator('#cw112Name').fill('7c wizard check'); await next();
      await card('Phoenix'); await next();
      await card('Isawa'); await next();
      await card('Isawa Shugenja');
      // The School's own question: its Elemental affinity (Void, as Phase 11.2.3's harness answers it).
      await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay')?.style.display === 'flex', null, {timeout: 15000});
      await page.click('#affinityPick_Void'); await page.click('#affinityPickConfirm');
      await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja' && !window.__L5R_TEST__.CW112.busy, null, {timeout: 15000});
      seen.atTraits = await until('Rings & Traits');
      const raise = n => page.locator('.cw112-view button[aria-label="Raise ' + n + '"]');
      const row = n => T(n => {const b = document.querySelector('.cw112-view button[aria-label="Raise ' + n + '"]'); return b ? [b.closest('.cw112-trait').querySelector('.cw112-trait-val').textContent, b.disabled, b.title] : null;}, n);
      seen.willpowerBefore = await row('Willpower');
      for(let i = 0; i < 4 && !(await raise('Willpower').isDisabled()); i++) {await raise('Willpower').click(); await page.waitForTimeout(250);}
      seen.willpower = await row('Willpower');
      await page.locator('.cw112-view').screenshot({path: path.join(out, 'b1-traits.png')}).catch(() => {});
      check('B1', seen.atTraits === 'Rings & Traits' && seen.willpower && seen.willpower[0] === '4' && seen.willpower[1] && seen.willpower[2] === REFUSAL, seen);
      seen.atSkills = await until('Skills');
      const skill = await T(() => {const b = document.querySelector('.cw112-view .cw112-trait button[aria-label^="Raise "]'); return b ? b.getAttribute('aria-label').slice(6) : null;});
      seen.skillBefore = skill && await row(skill);
      for(let i = 0; i < 5 && skill && !(await raise(skill).isDisabled()); i++) {await raise(skill).click(); await page.waitForTimeout(250);}
      seen.skill = skill && [skill, ...(await row(skill))];
      check('B2', seen.atSkills === 'Skills' && seen.skill && seen.skill[1] === '4' && seen.skill[2] && seen.skill[3] === REFUSAL, {atSkills: seen.atSkills, skillBefore: seen.skillBefore, skill: seen.skill});
      seen.atSpells = await until('Spells');
      seen.line = await T(() => [...document.querySelectorAll('.cw112-view .ss7-scrolls')].map(l => l.textContent));
      await page.locator('.cw112-view').screenshot({path: path.join(out, 'b3-spells.png')}).catch(() => {});
      check('B3', seen.atSpells === 'Spells' && seen.line.length === 1 && seen.line[0] === SCROLLS, {atSpells: seen.atSpells, line: seen.line});
      // Pick the first spell offered, through each picker's own Add button.
      seen.picked = await T(() => {const sel = document.querySelector('.cw112-view select'); if(!sel) return null; const o = [...sel.options].find(o => o.value); if(!o) return null;
        sel.value = o.value; sel.dispatchEvent(new Event('change', {bubbles: true})); return o.textContent;});
      const add = page.locator('.cw112-view select').first().locator('xpath=following-sibling::button[1]');
      if(await add.count()) {await add.click(); await page.waitForTimeout(400);}
      for(let i = 0; i < 14 && await page.locator('.cw112-view').isVisible(); i++) await next();
      seen.closed = !(await page.locator('.cw112-view').isVisible());
      Object.assign(seen, await T(() => ({
        scrolls: [...document.querySelectorAll('#equipBody tr')].map(r => (r.querySelector('input') || {}).value || '').filter(v => /Scroll/.test(v)),
        spells: [...document.querySelectorAll('#techList .entry')].filter(d => d.dataset.spellElement).map(d => [d.querySelector('.en-name').value, d.dataset.isMemorised === 'true'])})));
      seen.status = await status();
      check('B4', seen.closed && seen.scrolls.length >= 1 && seen.spells.length >= 1 && seen.spells.every(x => x[1] === false), {picked: seen.picked, closed: seen.closed, scrolls: seen.scrolls, spells: seen.spells});
      if(page.errors.length) errors.push(...page.errors.map(e => 'wizard: ' + e));
      await context.close();
    }

    // C: the empty quiver.
    {
      const {context, page} = await importInto('archer');
      const {T, goTab, setMode, status} = tools(page);
      await setMode('play');
      const attack = async () => {
        await goTab('Combat');
        // Weapons is folded on the Combat page: open it by its heading, then tap the Yumi's 🎲.
        if(!(await T(() => document.getElementById('weaponsTable').closest('details')?.open !== false))) {
          await page.locator('details:has(#weaponsTable) > summary').first().click(); await page.waitForTimeout(400);
        }
        await page.locator('#weaponsBody tr .wp-roll-btn').first().click(); await page.waitForTimeout(300);
        if(await page.locator('#rangeOptWithin').isVisible()) await page.locator('#rangeOptWithin').click();
        await page.waitForSelector('#arrowPickModalOverlay', {state: 'visible', timeout: 10000});
      };
      const after = () => T(() => {const T = window.__L5R_TEST__, o = document.getElementById('rollModalOverlay');
        return {rolled: !!o && getComputedStyle(o).display !== 'none', qty: T.getArrowQuantity('Willow Leaf'), last: T.getLastArrowUsed() || null};});
      await attack();
      let s = await T(() => {const b = document.getElementById('arrowPickBody'), e = b.querySelector('.arrow-opt-empty'), w = document.getElementById('qc7Cancel');
        return {message: e ? e.textContent : null, button: w ? w.textContent : null};});
      await page.locator('#arrowPickModalOverlay').screenshot({path: path.join(out, 'c1-empty-quiver.png')}).catch(() => {});
      check('C1', s.message === QUIVER && s.button === 'Cancel', s);
      await page.locator('#qc7Cancel').click(); await page.waitForTimeout(600);
      s = Object.assign(await after(), {picker: await page.locator('#arrowPickModalOverlay').isVisible(), preview: await page.locator('#rollPreviewOverlay').isVisible(), status: await status(), oldButton: await page.locator('#eq7RollWithout').count()});
      check('C2', !s.rolled && !s.picker && !s.preview && s.qty === 0 && s.oldButton === 0 && s.status === 'Attack cancelled — no arrow nocked.', s);
      await attack();
      await page.locator('#arrowPickClose').click(); await page.waitForTimeout(800);
      s = Object.assign(await after(), {preview: await page.locator('#rollPreviewOverlay').isVisible(), status: await status()});
      check('C3', !s.rolled && !s.preview && s.qty === 0, s);
      if(page.errors.length) errors.push(...page.errors.map(e => 'archer: ' + e));
      await context.close();
    }

    // D: the after-preview refund: Determination paid, then Kuni's gift's question cancels the cast.
    {
      const {context, page} = await importInto('refund');
      const {T, goTab, setMode, status, dialog} = tools(page);
      await setMode('play'); await goTab('Techniques');
      const state = () => T(() => {const $ = id => document.getElementById(id), dp = document.querySelector('#advList .entry'); let c = null; try {c = JSON.parse(dp.dataset.advConfig).remaining;} catch(e) {}
        const o = $('rollModalOverlay'); return {honor: $('f_honorRank').value + '.' + $('f_honorPts').value, dp: c, earth: $('spell_used_earth').value, void: window.__L5R_TEST__.getVoidPoints(), rolled: !!o && getComputedStyle(o).display !== 'none'};});
      const cast = async ticks => {
        await page.locator('.spell-cast-btn').first().click();
        await page.waitForSelector('#rollPreviewOverlay', {state: 'visible', timeout: 10000});
        for(const t of ticks) await page.locator('#rollPreviewOverlay label', {hasText: t}).locator('input').check();
        await page.locator('#rollPreviewGo').click(); await page.waitForTimeout(500);
      };
      const answer = async id => {await page.waitForSelector('#appConfirmOverlay', {state: 'visible', timeout: 10000}); const m = await dialog(); await page.locator('#' + id).click(); await page.waitForTimeout(600); return m;};
      let s = {before: await state(), spell: (await page.locator('.spell-cast-btn').first().locator('xpath=ancestor::*[contains(@class,"entry")][1]').locator('.en-name').inputValue().catch(() => null))};
      await cast(['Determination', 'Kuni’s gift']);
      s.dp = (await answer('appConfirmOk')).slice(0, 80); s.kuni = (await answer('appConfirmCancel')).slice(0, 80);
      Object.assign(s, {after: await state(), status: await status()});
      check('D1', /^Dark Paragon — Determination/.test(s.dp) && /^Kuni/.test(s.kuni) && s.after.honor === '2.6' && s.after.dp === 1 && s.after.earth === '0' && !s.after.rolled &&
        s.status === 'Cast cancelled — the Earth slot given back. Also given back: Honor, Dark Paragon’s use.', s);
      await cast(['Determination']);
      s = {dp: (await answer('appConfirmOk')).slice(0, 80), after: await state()};
      check('D2', s.after.rolled && s.after.dp === 0 && s.after.honor !== '2.6', s);
      if(s.after.rolled) await page.locator('#rollModalClose').click();
      if(page.errors.length) errors.push(...page.errors.map(e => 'refund: ' + e));
      await context.close();
    }

    // E: History. A Void Point spent on the moon character, read from the sheet's menu, the list's menu, and after a reload.
    {
      const {context, page} = await importInto('moon');
      const {T, showFor, setMode, history} = tools(page);
      await setMode('play');
      const voidTab = await showFor('#voidPips .void-pip.filled');
      const before = await T(() => document.getElementById('void_current').value);
      await page.locator('#voidPips .void-pip.filled').last().click();
      await page.waitForTimeout(3000);   // the sheet still for 1.5 s, then the autosave
      const afterVoid = await T(() => document.getElementById('void_current').value);
      const want = 'Void Points: ' + before + ' → ' + afterVoid;
      await page.locator('.pm128-more').first().click(); await page.waitForTimeout(300);
      await page.locator('#al71SheetHistory').click(); await page.waitForTimeout(400);
      let s = {voidTab, before, afterVoid, title: await T(() => document.getElementById('al71Title').textContent), entries: await history()};
      await page.locator('.al71-panel').screenshot({path: path.join(out, 'e1-history.png')}).catch(() => {});
      check('E1', before !== afterVoid && s.title === 'History — ' + LABELS.moon && s.entries.length >= 1 && s.entries[0][1] === want && /\d/.test(s.entries[0][0]), s);
      await page.locator('#al71Close').click();
      await toList(page);
      const row = page.locator('.cl11-row', {hasText: LABELS.moon}).first();
      await row.locator('.cl11-more').click(); await page.waitForTimeout(300);
      await row.locator('.al71-item').click(); await page.waitForTimeout(400);
      s = {title: await T(() => document.getElementById('al71Title').textContent), entries: await history()};
      check('E2', s.title === 'History — ' + LABELS.moon && s.entries.length >= 1 && s.entries[0][1] === want, s);
      await page.locator('#al71Close').click();
      await page.reload({waitUntil: 'domcontentloaded', timeout: 60000}); await ready(page);
      await toList(page);
      await openFromList(page, LABELS.moon);
      await page.locator('.pm128-more').first().click(); await page.waitForTimeout(300);
      await page.locator('#al71SheetHistory').click(); await page.waitForTimeout(400);
      s = {entries: await history()};
      check('E3', s.entries.length >= 1 && s.entries[0][1] === want, s);
      if(page.errors.length) errors.push(...page.errors.map(e => 'history: ' + e));
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
