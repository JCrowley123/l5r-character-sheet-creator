// Walks Release 7b.1's device checklist at phone size, through the controls the owner taps, and records what the sheet
// shows after each step. It first makes the two test characters the checklist imports (Export JSON), then imports each
// into fresh storage, as the owner will. Usage: node checklist-walk.cjs <output folder> [sheet.html instead of the live site]
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const out = process.argv[2];
if(!out) throw Error('Supply the output folder');
const url = process.argv[3] ? pathToFileURL(path.resolve(process.argv[3])).href : 'https://l5r-character-sheet-creator.pages.dev/';
const FILES = {crab: '7b1-checks-crab.l5r.json', matsu: '7b1-checks-matsu.l5r.json'};
const TOTAL = 17;

async function openPage(browser, noShare) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, acceptDownloads: true});
  // Making the files only: without a share sheet, Export JSON takes the sheet's own download path.
  if(noShare) await context.addInitScript(() => {for(const k of ['share', 'canShare']) Object.defineProperty(Navigator.prototype, k, {value: undefined, configurable: true});});
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 60000});
  await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready, null, {timeout: 60000});
  await page.waitForFunction(() => !document.querySelector('[id^=l5r-splash]'), null, {timeout: 30000});
  return {context, page};
}

(async () => {
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch(), checks = [], errors = [];
  const check = (id, ok, seen) => {checks.push({id, passed: !!ok, seen}); console.log((ok ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(seen).slice(0, 700));};
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
      await T(async () => {
        const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
        T.resetToBaseline(); T.MODES12.set('management');
        const d = T.collectData();
        Object.assign(d.fields, {f_name: '7b.1 checks — Crab', f_clan: 'Crab', f_family: 'Kuni', f_school: 'Kuni Shugenja', f_rank: '1', f_honorRank: '0', f_honorPts: '0'});
        d.rings.void = '3'; d.voidCurrent = 3;
        d.tech = [{name: 'Jade Strike', cost: 0, desc: '[Spell — Earth 1] A test spell for the Release 7b.1 checks.', spellElement: 'earth', spellMastery: '1', spellKeywords: '', spellIsMaho: false, isMemorised: false, memorisationXpCost: ''}];
        d.adv = []; d.disadv = [];
        T.applyData(d); T.recalcAll();
        await T.ANC48.choose('Kuni'); T.recalcAll();
        const lib = T.DISADV_LIBRARY.find(x => x.name === 'Seven Fortunes’ Curse');
        const e = T.makeEntry({name: lib.name, cost: lib.cost, desc: lib.desc}, true);
        $('disadvList').appendChild(e);
        T.writeAdvConfig(e, 'fortunePick', {type: 'fortunePick', fortune: 'Hotei', value: 'Hotei'});
        $('void_current').value = '3'; T.renderVoidPips(); T.recalcAll();
      });
      await exportTo(FILES.crab);
      await T(() => {
        const T = window.__L5R_TEST__;
        T.resetToBaseline(); T.MODES12.set('management');
        const d = T.collectData();
        Object.assign(d.fields, {f_name: '7b.1 checks — Matsu', f_clan: 'Lion', f_family: 'Matsu', f_school: 'Matsu Bushi', f_rank: '1', f_honorRank: '6', f_honorPts: '0', f_gender: ''});
        d.traits = Object.assign({}, d.traits, {agility: '5', strength: '5'});
        const skill = (name, trait, rank) => ({name, trait, rank: String(rank)});
        d.skills = [skill('Battle', 'Perception', 5), skill('Kenjutsu', 'Agility', 3), skill('Kyujutsu', 'Reflexes', 3), skill('Spears', 'Agility', 3), skill('Polearms', 'Agility', 3)];
        d.adv = [{name: 'Multiple Schools', cost: '', desc: ''},
                 {name: T.FB4521.NAME, cost: '4', desc: '', config: {type: 'fortuneBlessing', revision: 1, fortune: 'Jurojin', value: 'Jurojin'}}];
        d.disadv = []; d.tech = [];
        T.applyData(d); T.recalcAll();
      });
      await exportTo(FILES.matsu);
      check('S1', fs.statSync(path.join(out, FILES.crab)).size > 0 && fs.statSync(path.join(out, FILES.matsu)).size > 0 && !page.errors.length,
        {files: Object.values(FILES).map(n => [n, fs.statSync(path.join(out, n)).size]), errors: page.errors});
      await context.close();
    }

    // Each test character opens in fresh storage through Import JSON, as on the owner's devices.
    const importInto = async name => {
      const {context, page} = await openPage(browser);
      await page.locator('#fileImport').setInputFiles(path.join(out, name));
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
      return {context, page};
    };

    // Crab: Hotei's Curse (R10), the once-a-session gift (R25), the Void Point's +1k1 and Initiative (R7).
    {
      const {context, page} = await importInto(FILES.crab);
      const T = (fn, arg) => page.evaluate(fn, arg);
      const goTab = async label => {await page.locator('.car-tab', {hasText: label}).first().click(); await T(() => window.__L5R_CAROUSEL__.whenSettled());};
      const setMode = async mode => {if(await T(() => window.__L5R_TEST__.MODES12.isPlay()) !== (mode === 'play')) await page.locator('.pm12-toggle').first().click(); await page.waitForTimeout(300);};
      const voidPoints = () => T(() => window.__L5R_TEST__.getVoidPoints());
      const preview = () => T(() => {const o = document.getElementById('rollPreviewOverlay'); if(!o || getComputedStyle(o).display === 'none') return null;
        return {title: o.querySelector('h2, h3, .roll-modal-title')?.textContent.trim() || '', boxes: [...o.querySelectorAll('input[type=checkbox]')].map(i => ({label: (i.closest('label')?.textContent || '').trim().replace(/\s+/g, ' '), checked: i.checked, disabled: i.disabled})),
          text: o.textContent.replace(/\s+/g, ' ').trim()};});
      const box = (p, re) => p && p.boxes.find(b => re.test(b.label));
      const closeResult = async () => {await page.locator('#rollModalClose').click({timeout: 10000}); await page.waitForTimeout(300);};
      const cast = async () => {await goTab('Techniques'); await page.locator('.spell-cast-btn').first().click(); await page.waitForSelector('#rollPreviewOverlay', {state: 'visible', timeout: 10000}); return preview();};
      const loaded = await T(() => ({name: document.getElementById('f_name').value, ancestor: window.__L5R_TEST__.ANC48.current()?.name, void: window.__L5R_TEST__.getVoidPoints()}));

      // A1: the Curse's row says where the sheet takes two.
      await setMode('management'); await goTab('Adv & Disadv');
      const note = await T(() => document.querySelector('#disadvList .ht7-note')?.textContent.trim());
      check('A1', note === 'Where the sheet spends the Void Point itself (Dark Paragon, your Ancestor’s gifts), it takes both. Use the button for a Technique.', {loaded, note});

      // A2: the Casting Roll's preview says the gift takes two Void Points.
      await setMode('play');
      const before = await voidPoints();
      let p = await cast();
      const offered = box(p, /^Kuni’s gift/);
      check('A2', !!offered && /The sheet takes two Void Points when you roll \(Hotei’s Curse\)\./.test(p.text), {offered, note: (p.text.match(/[^.]*two Void Points when you roll[^.]*\./) || [''])[0]});

      // A3: with Kuni's gift ticked, the roll takes two Void Points, and the status line says so.
      await page.locator('#rollPreviewOverlay label', {hasText: 'Kuni’s gift'}).locator('input').check();
      await page.locator('#rollPreviewGo').click();
      await page.waitForTimeout(800);
      const after = await voidPoints(), status = await T(() => document.getElementById('statusMsg')?.textContent.trim());
      check('A3', before === 3 && after === 1 && /two Void Points spent \(Hotei’s Curse\)/.test(status || ''), {before, after, status, offered});
      await closeResult();

      // B1: a second Casting Roll shows the gift as used this session, and it cannot be ticked.
      p = await cast();
      const used = box(p, /^Kuni’s gift/);
      check('B1', !!used && /used this session$/.test(used.label) && used.disabled && !used.checked && /ready again after Reset session/.test(p.text), {used, note: (p.text.match(/Used this session[^.]*\./) || [''])[0]});
      await page.locator('#rollPreviewCancel').click();

      // B2: Reset session on the Ancestor card makes it ready again.
      await goTab('Clan & School');
      const reset = page.locator('.anc48-card button', {hasText: /Reset session/i}).first();
      const resetLabel = (await reset.textContent()).trim();
      await reset.click();
      p = await cast();
      const ready = box(p, /^Kuni’s gift/);
      check('B2', !!ready && !/used this session/.test(ready.label) && !ready.disabled, {resetLabel, ready});
      await page.locator('#rollPreviewCancel').click();

      // B3: Management has Set the favour on the card; Play hides it.
      await setMode('management'); await goTab('Clan & School');
      const favour = await T(() => {const s = document.getElementById('ag7FavourEdit'); return {shown: !!s && s.offsetParent !== null, label: document.getElementById('ag7Favour')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 200), options: s ? [...s.options].map(o => o.textContent) : []};});
      await page.locator('#ag7FavourEdit').selectOption('final');
      const setFinal = await T(() => {const a = window.__L5R_TEST__.ANC48.current(); return [a.lost, a.final];});
      await page.locator('#ag7FavourEdit').selectOption('kept');
      await setMode('play');
      const inPlay = await T(() => document.getElementById('ag7FavourEdit')?.offsetParent !== null);
      check('B3', favour.shown && favour.options.length === 4 && setFinal.join() === 'true,true' && !inPlay, {favour, setFinal, shownInPlay: inPlay});

      // C1: with +1k1 armed, Initiative leaves it out (no "Void: +1k1" line), and it stays armed for the next roll.
      await goTab('Combat');
      const vArm = await voidPoints();
      await page.locator('.void-spend-btn[data-void=k1]').click();
      const armed = await T(() => !!window.__L5R_TEST__.getVoidPending().k1);
      const v0 = await voidPoints();
      // Initiative's dice sit in the folded Armor & TN section of the Combat page, opened by its heading.
      const fold = await T(() => {const d = document.getElementById('armorTnDetails'); return {heading: d?.querySelector('summary')?.textContent.replace(/\s+/g, ' ').trim(), open: !!d?.open};});
      if(!fold.open) await page.locator('#armorTnDetails > summary').click();
      await page.locator('#btnRollInitiative').click();
      await page.waitForSelector('#rollPreviewOverlay', {state: 'visible', timeout: 10000}).catch(() => {});
      p = await preview();
      const initLine = !!p && /Void: \+1k1/.test(p.text);
      if(p) await page.locator('#rollPreviewGo').click();
      await page.waitForTimeout(800);
      const v1 = await voidPoints(), stillArmed = await T(() => !!window.__L5R_TEST__.getVoidPending().k1);
      check('C1', vArm >= 1 && armed && !!p && !initLine && v1 === v0 && stillArmed,
        {fold, voidBeforeArming: vArm, armed, voidAfterArming: v0, initiativeShowsVoidLine: initLine, initiativeTitle: p && p.title, voidAfterInitiative: v1, stillArmed});
      await closeResult();

      // C2: the next Ring roll shows "Void: +1k1" and uses it up.
      await goTab('Rings & Traits');
      await page.locator('.ring-name[data-ring-key=earth]').first().click();
      await page.waitForSelector('#rollPreviewOverlay', {state: 'visible', timeout: 10000});
      p = await preview();
      const ringLine = /Void: \+1k1/.test(p.text);
      await page.locator('#rollPreviewGo').click();
      await page.waitForTimeout(800);
      const armedAfter = await T(() => !!window.__L5R_TEST__.getVoidPending().k1), v2 = await voidPoints();
      check('C2', ringLine && !armedAfter && v2 === v1, {ringShowsVoidLine: ringLine, armedAfterRingRoll: armedAfter, voidBefore: v1, voidAfter: v2});
      await closeResult();
      if(page.errors.length) errors.push(...page.errors.map(e => 'crab: ' + e));
      await context.close();
    }

    // Matsu: Gender meets a requirement (R15), the Advanced Schools pointer (R16), the Skill list (R14), Jurojin (R24).
    {
      const {context, page} = await importInto(FILES.matsu);
      const T = (fn, arg) => page.evaluate(fn, arg);
      const goTab = async label => {await page.locator('.car-tab', {hasText: label}).first().click(); await T(() => window.__L5R_CAROUSEL__.whenSettled());};
      await T(() => window.__L5R_TEST__.MODES12.set('management'));
      const loaded = await T(() => ({name: document.getElementById('f_name').value, family: document.getElementById('f_family').value}));
      const lionsPride = async () => {
        await goTab('Techniques');
        const listed = await T(() => [...document.getElementById('advancedSchoolPicker').options].map(o => o.value));
        const value = listed.find(v => /Lion.s Pride/.test(v)); if(value) await page.locator('#advancedSchoolPicker').selectOption(value);
        return T(l => {const b = document.querySelector('#advancedSchoolConfirmations input[value="lions-pride-female"]'); const n = document.getElementById('gi7Note-lions-pride-female');
          return {listed: l.filter(v => /Lion/.test(v)), box: b ? {checked: b.checked, disabled: b.disabled} : null, note: n ? n.textContent.trim() : ''};}, listed);
      };
      const gender = async v => {await goTab('Identity'); const f = page.locator('#f_gender'); await f.fill(v); await f.dispatchEvent('input'); await f.dispatchEvent('change');};

      // D1: Female in Identity ticks the Lion's Pride's confirmation and says why.
      await gender('Female');
      let s = await lionsPride();
      check('D1', !!s.box && s.box.checked && s.box.disabled && s.note === 'Your Identity says Female, which meets this.', {loaded, ...s});

      // D2: a different gender leaves the tick to you, with your GM's agreement.
      await gender('Male');
      s = await lionsPride();
      check('D2', !!s.box && !s.box.checked && !s.box.disabled && s.note === 'Your Identity says Male. Tick only if your GM agrees.', s);

      // E1: Identity says where the Advanced Schools are; Go opens the Techniques page at them.
      await goTab('Identity');
      const pointer = await T(() => ({text: document.getElementById('ap7Text')?.textContent.trim(), go: document.getElementById('ap7Go')?.textContent.trim(), after: document.getElementById('ap7Pointer')?.previousElementSibling?.id}));
      await page.locator('#ap7Go').click();
      await T(() => window.__L5R_CAROUSEL__.whenSettled());
      await page.waitForTimeout(600);
      const landed = await T(() => ({techniquesOpen: !document.querySelector('.car-page[data-tab-label="Techniques"]').inert, pickerOnScreen: (() => {const r = document.getElementById('advancedSchoolPicker').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0;})()}));
      check('E1', pointer.after === 'schoolsPanel' && /Techniques page/.test(pointer.text || '') && pointer.go === 'Go to Advanced Schools' && landed.techniquesOpen && landed.pickerOnScreen, {pointer, landed});

      // F1: held Skills leave Add from Skill List; Lore stays.
      await goTab('Skills');
      const listed = () => T(() => [...document.getElementById('skillQuickAdd').options].map(o => o.value).filter(Boolean));
      let l = await listed();
      check('F1', !l.includes('Battle') && !l.includes('Kenjutsu') && l.includes('Athletics') && l.some(v => /^Lore/.test(v)), {battle: l.includes('Battle'), kenjutsu: l.includes('Kenjutsu'), athletics: l.includes('Athletics'), lore: l.filter(v => /^Lore/.test(v))});

      // F2: adding Athletics takes it off the list; removing its row puts it back.
      await page.locator('#skillQuickAdd').selectOption('Athletics');
      await page.waitForTimeout(300);
      const added = await T(() => [...document.querySelectorAll('#skillsBody .sk-name')].some(i => i.value === 'Athletics'));
      const gone = !(await listed()).includes('Athletics');
      await page.locator('#skillsBody tr', {has: page.locator('.sk-name[value="Athletics"]')}).locator('.rm-btn').first().click().catch(async () => {
        await T(() => {const row = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name')?.value === 'Athletics'); row?.querySelector('.rm-btn')?.click();});
      });
      await page.waitForTimeout(300);
      const back = (await listed()).includes('Athletics');
      check('F2', added && gone && back, {added, goneFromList: gone, backAfterRemove: back});

      // G1: Jurojin's reminder gives the steps, with no Resist poison button.
      await goTab('Adv & Disadv');
      const jurojin = await T(() => {const row = [...document.querySelectorAll('#advList .entry')].find(r => /Jurojin/.test(r.textContent)); return {text: row ? row.textContent.replace(/\s+/g, ' ').trim() : '', poisonButton: [...document.querySelectorAll('#advList button')].some(b => /poison/i.test(b.textContent))};});
      check('G1', /No separate button: roll the Ring or Trait the GM names for the poison or disease, then tick “Resisting poison or disease” \(\+2k0\) in that roll’s preview\./.test(jurojin.text) && !jurojin.poisonButton,
        {reminder: (jurojin.text.match(/No separate button[^.]*\./) || [''])[0], poisonButton: jurojin.poisonButton});

      // D3: the wizard's Name step asks Gender and Age, both optional, and fills Identity.
      await T(() => window.__L5R_TEST__.CW112.start());
      await page.waitForTimeout(400);
      const wiz = await T(() => ({gender: !!document.getElementById('gi7Gender'), age: !!document.getElementById('gi7Age'), text: document.getElementById('gi7Wizard')?.textContent.replace(/\s+/g, ' ').trim()}));
      if(wiz.gender) {await page.locator('#gi7Gender').fill('Female'); await page.locator('#gi7Age').fill('19');}
      const filled = await T(() => [document.getElementById('f_gender').value, document.getElementById('f_age').value]);
      check('D3', wiz.gender && wiz.age && /optional/i.test(wiz.text || '') && filled.join() === 'Female,19', {...wiz, filled});
      await T(() => window.__L5R_TEST__.CW112.close());

      // H1: in the wizard's Skills step, a Skill bought with experience has Remove; School Skills do not.
      await T(async () => {
        const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
        T.clearAllRows();
        const add = (n, school) => {const tr = T.makeSkillRow({name: n, trait: 'Agility', rank: 1}); $('skillsBody').appendChild(tr); if(school){const b = tr.querySelector('.sk-school'); b.checked = true; b.dispatchEvent(new Event('change', {bubbles: true}));} return tr;};
        add('Kenjutsu', true); add('Hunting', false); T.recalcAll();
        T.CW112.start(); T.CW112.index = T.CW112.steps.findIndex(s => s.id === 'skills'); T.CW112.render();
      });
      await page.waitForTimeout(400);
      const rows = () => T(() => [...document.querySelectorAll('.cw1121-skill')].map(x => ({name: x.querySelector('.cw112-trait-name')?.textContent.trim(), remove: !!x.querySelector('.wr7-remove')})));
      const beforeRemove = await rows();
      await page.locator('.cw1121-skill', {hasText: 'Hunting'}).locator('.wr7-remove').click();
      await page.waitForTimeout(400);
      const afterRemove = await rows(), status = await T(() => document.getElementById('statusMsg')?.textContent.trim());
      check('H1', beforeRemove.some(r => r.name === 'Hunting' && r.remove) && beforeRemove.some(r => /^Kenjutsu/.test(r.name) && !r.remove) && !afterRemove.some(r => r.name === 'Hunting') && status === 'Removed Hunting; its experience is back.',
        {beforeRemove, afterRemove, status});
      await T(() => window.__L5R_TEST__.CW112.close());
      if(page.errors.length) errors.push(...page.errors.map(e => 'matsu: ' + e));
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
