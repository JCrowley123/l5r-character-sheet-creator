// Walks Release 7b.1.1's re-tests (section I of the Release 7b.1 Device Checks doc) at phone size, through the controls
// the owner taps, and records what the sheet shows after each step. The two 7b.1 test characters are imported into fresh
// storage through the Characters list, as on the owner's devices; E1 is also measured in a desktop window.
// Usage: node checklist-walk.cjs <output folder> [sheet.html instead of the live site]
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const out = process.argv[2];
if(!out) throw Error('Supply the output folder');
const url = process.argv[3] ? pathToFileURL(path.resolve(process.argv[3])).href : 'https://l5r-character-sheet-creator.pages.dev/';
const WALK = path.resolve(__dirname, '../../QA — Release 7b.1 2026-10-28/qa/walk');
const FILES = {crab: '7b1-checks-crab.l5r.json', matsu: '7b1-checks-matsu.l5r.json'};
const TOTAL = 7;

async function openPage(browser, desktop) {
  const context = await browser.newContext(desktop ? {viewport: {width: 1280, height: 900}} : {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
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
  const importInto = async (name, label, desktop) => {
    const {context, page} = await openPage(browser, desktop);
    if(!(await page.locator('#cl11Import').isVisible())) await page.locator('.ab113-item', {hasText: 'Characters'}).first().click();
    await page.locator('#cl11Import').waitFor({timeout: 15000});
    await page.locator('#cl11ImportFile').setInputFiles(path.join(WALK, name));
    const row = page.locator('.cl11-row', {hasText: label});
    await row.first().waitFor({timeout: 15000});
    await row.first().locator('button[data-act=open]').click();
    await page.waitForFunction(l => document.getElementById('f_name')?.value === l, label, {timeout: 15000});
    await page.waitForTimeout(800);
    return {context, page};
  };
  const tools = page => {
    const T = (fn, arg) => page.evaluate(fn, arg);
    const goTab = async label => {await page.locator('.car-tab', {hasText: label}).first().click(); await T(() => window.__L5R_CAROUSEL__.whenSettled());};
    const setMode = async mode => {if(await T(() => window.__L5R_TEST__.MODES12.isPlay()) !== (mode === 'play')) await page.locator('.pm12-toggle').first().click(); await page.waitForTimeout(300);};
    return {T, goTab, setMode};
  };
  try {
    // Matsu: the Lion's Pride chosen from the Advanced School list (D1), and the Go button (E1) at phone size.
    {
      const {context, page} = await importInto(FILES.matsu, '7b.1 checks — Matsu');
      const {T, goTab, setMode} = tools(page);
      await setMode('management');
      const gender = async v => {await goTab('Identity'); const f = page.locator('#f_gender'); await f.fill(v); await f.dispatchEvent('input'); await f.dispatchEvent('change');};
      const choose = async () => {
        await goTab('Techniques');
        await page.locator('#advancedSchoolPicker').selectOption('');
        const value = await T(() => [...document.getElementById('advancedSchoolPicker').options].map(o => o.value).find(v => /^The Lion.s Pride$/.test(v)) || '');
        await page.locator('#advancedSchoolPicker').selectOption(value);
        await page.waitForTimeout(300);
        return T(() => {const b = document.querySelector('#advancedSchoolConfirmations input[value="lions-pride-female"]'), n = document.getElementById('gi7Note-lions-pride-female'), e = document.getElementById('advancedSchoolEnter');
          return {box: b ? {checked: b.checked, disabled: b.disabled} : null, note: n ? n.textContent.trim() : '', beginTraining: e ? (e.disabled ? 'disabled' : 'enabled') : null};});
      };
      await gender('Female');
      let s = await choose();
      check('I1', !!s.box && s.box.checked && s.box.disabled && s.note === 'Your Identity says Female, which meets this.' && s.beginTraining === 'enabled', s);
      await gender('Male');
      s = await choose();
      check('I2', !!s.box && !s.box.checked && !s.box.disabled && s.note === 'Your Identity says Male. Tick only if your GM agrees.' && s.beginTraining === 'disabled', s);
      await goTab('Identity');
      const phone = await T(() => {const e = document.getElementById('ap7Go'), st = getComputedStyle(e), r = e.getBoundingClientRect(); return {height: Math.round(r.height), font: st.fontSize, taintFont: getComputedStyle(document.getElementById('ta7-check')).fontSize};});
      await page.locator('#ap7Go').scrollIntoViewIfNeeded();
      await page.screenshot({path: path.join(out, 'e1-phone-390.png')});
      check('I6', phone.height >= 44 && phone.font === '10px' && phone.font === phone.taintFont, phone);
      if(page.errors.length) errors.push(...page.errors.map(e => 'matsu: ' + e));
      await context.close();
    }
    // E1 in a desktop window: compact, like Check Taint growth.
    {
      const {context, page} = await importInto(FILES.matsu, '7b.1 checks — Matsu', true);
      const {T, goTab, setMode} = tools(page);
      await setMode('management'); await goTab('Identity');
      const desk = await T(() => {const e = document.getElementById('ap7Go'), t = document.getElementById('ta7-check'), st = getComputedStyle(e), r = e.getBoundingClientRect();
        return {height: Math.round(r.height), font: st.fontSize, border: st.borderTopColor, taintFont: getComputedStyle(t).fontSize, taintBorder: getComputedStyle(t).borderTopColor};});
      await page.locator('#ap7Go').scrollIntoViewIfNeeded();
      await page.screenshot({path: path.join(out, 'e1-desktop-1280.png')});
      check('I7', desk.height >= 24 && desk.height <= 30 && desk.font === '10px' && desk.font === desk.taintFont && desk.border === desk.taintBorder, desk);
      if(page.errors.length) errors.push(...page.errors.map(e => 'matsu desktop: ' + e));
      await context.close();
    }
    // Crab with 1 Void Point: Kuni's gift answered Cancel roll, ✕, or Roll without it (B2).
    {
      const {context, page} = await importInto(FILES.crab, '7b.1 checks — Crab');
      const {T, goTab, setMode} = tools(page);
      await setMode('play');
      const slots = () => T(() => ({earthUsed: document.getElementById('spell_used_earth').value, earthFilledPips: document.querySelectorAll('#spellPips_earth .spell-pip.filled').length,
        void: window.__L5R_TEST__.getVoidPoints(), rolled: getComputedStyle(document.getElementById('rollModalOverlay')).display !== 'none', status: document.getElementById('statusMsg')?.textContent.trim()}));
      // Spend Void Points by tapping filled pips until one is left.
      const voidPage = await T(() => document.getElementById('voidPips').closest('.car-page')?.dataset.tabLabel);
      await goTab(voidPage);
      while(await T(() => window.__L5R_TEST__.getVoidPoints()) > 1) {await page.locator('#voidPips .void-pip.filled').last().click(); await page.waitForTimeout(150);}
      const kuni = async answer => {
        await goTab('Techniques');
        await page.locator('.spell-cast-btn').first().click();
        await page.waitForSelector('#rollPreviewOverlay', {state: 'visible', timeout: 10000});
        await page.locator('#rollPreviewOverlay label', {hasText: 'Kuni’s gift'}).locator('input').check();
        await page.locator('#rollPreviewGo').click();
        await page.waitForSelector('#appConfirmOverlay', {state: 'visible', timeout: 10000});
        const message = await T(() => document.getElementById('appConfirmMsg').textContent.replace(/\s+/g, ' ').trim());
        await page.locator('#' + answer).click();
        await page.waitForTimeout(800);
        return {message, ...(await slots())};
      };
      const start = await slots();
      let s = await kuni('appConfirmCancel');
      check('I3', start.void === 1 && start.earthUsed === '0' && /Roll without it\?$/.test(s.message) && s.earthUsed === '0' && s.earthFilledPips === 0 && s.void === 1 && !s.rolled &&
        s.status === 'Cast cancelled — the Earth slot given back.', {start, ...s});
      s = await kuni('appConfirmX');
      check('I4', s.earthUsed === '0' && s.earthFilledPips === 0 && s.void === 1 && !s.rolled, s);
      s = await kuni('appConfirmOk');
      check('I5', s.earthUsed === '1' && s.earthFilledPips === 1 && s.void === 1 && s.rolled, s);
      if(s.rolled) await page.locator('#rollModalClose').click();
      if(page.errors.length) errors.push(...page.errors.map(e => 'crab: ' + e));
      await context.close();
    }
  } catch(e) {errors.push(String(e && e.stack || e)); check('walk completed', false, String(e));}
  finally {await browser.close();}
  const report = {url, checked_utc: new Date().toISOString(), scope: 'Headless Chrome at 390 × 844 (touch) and 1280 × 900 (mouse), ' + (process.argv[3] ? 'local build' : 'live site') + ', fresh storage; not the owner\'s iPhone or Edge.', checks, errors,
    passed: checks.length === TOTAL && checks.every(c => c.passed) && errors.length === 0};
  fs.writeFileSync(path.join(out, 'checklist-walk.json'), JSON.stringify(report, null, 2) + '\n');
  console.log((report.passed ? 'WALK PASSED ' : 'WALK FAILED ') + checks.filter(c => c.passed).length + '/' + checks.length + (errors.length ? ' errors: ' + errors.join(' | ') : ''));
  process.exitCode = report.passed ? 0 : 1;
})();
