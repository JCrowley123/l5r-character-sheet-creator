// Walks the device checklist on the live site at phone size, through the same controls the owner taps, and records
// what the sheet shows after each step. Usage: node checklist-walk.cjs <output folder>
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const url = 'https://l5r-character-sheet-creator.pages.dev/';
const out = process.argv[2];
if(!out) throw Error('Supply the output folder');

(async () => {
  const browser = await chromium.launch(), checks = [], errors = [];
  const check = (id, ok, seen) => {checks.push({id, passed: !!ok, seen}); console.log((ok ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(seen));};
  try {
    const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    page.on('dialog', d => d.accept('Checklist walk'));
    await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 60000});
    await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready, null, {timeout: 60000});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => !document.querySelector('[id^=l5r-splash]'), null, {timeout: 30000});
    const T = (fn, arg) => page.evaluate(fn, arg);
    await T(() => window.__L5R_TEST__.MODES12.set('management'));
    const field = (name, f) => page.locator('#ce7-' + name + '-' + f);
    const type = async (name, f, v, how = 'Enter') => {const box = field(name, f); await box.scrollIntoViewIfNeeded(); await box.fill(String(v)); if(how === 'Enter') await box.press('Enter'); else await box.evaluate(e => e.blur());};
    const state = name => T(n => ({...window.__L5R_TEST__.CP7.read(n), box: {rank: document.getElementById('ce7-' + n + '-rank').value, points: document.getElementById('ce7-' + n + '-points').value},
      pips: document.querySelectorAll('[data-cp7=' + n + '] .cp7-pips .filled').length, notice: document.getElementById('cp7-notice').textContent,
      role: document.getElementById('cp7-notice').getAttribute('role'), undo: !document.getElementById('cp7-undo').hidden}), name);
    // Pages off screen are inert, so each check first opens its page through the tab bar, as a person would.
    const goTab = async label => {await page.locator('.car-tab', {hasText: label}).first().click(); await T(() => window.__L5R_CAROUSEL__.whenSettled());};
    const visible = sel => T(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null).length, sel);

    await goTab('Identity');
    // A1: two boxes in each card; the fold-out is gone.
    check('A1', await visible('.ce7-edit') === 8 && await visible('.cp7-management') === 0 && await visible('.cp7-values output') === 0,
      {boxes: await visible('.ce7-edit'), foldOut: await visible('.cp7-management')});

    // A2: Glory points gather without changing Rank.
    await type('glory', 'rank', 3); await type('glory', 'points', 7); await type('glory', 'points', 12, 'blur');
    let s = await state('glory');
    check('A2', s.rank === 3 && s.points === 12 && s.pips === 2 && s.notice === 'Glory: Rank 3, Points 12.', s);

    // A3: Honour's Rank follows its points at once.
    await type('honor', 'rank', 5); await type('honor', 'points', 3); await type('honor', 'points', 13);
    s = await state('honor');
    check('A3', s.rank === 6 && s.points === 3 && s.box.rank === '6' && s.box.points === '3', s);

    // A4: a Rank above 10 is refused; the old value typed back clears the alert.
    const statusBefore = await state('status');
    await type('status', 'rank', 11);
    const refused = {...await state('status'), invalid: await field('status', 'rank').getAttribute('aria-invalid')};
    await type('status', 'rank', statusBefore.rank);
    const cleared = {...await state('status'), invalid: await field('status', 'rank').getAttribute('aria-invalid')};
    check('A4', refused.invalid === 'true' && refused.notice === 'Enter a whole Rank between 0 and 10.' && refused.rank === statusBefore.rank &&
      cleared.invalid === null && cleared.notice === '', {refused, cleared});

    // B1: Undo puts the value back.
    await type('honor', 'points', 4);
    const beforeUndo = await state('honor');
    await page.locator('#cp7-undo').click();
    s = await state('honor');
    check('B1', beforeUndo.undo && s.rank === 6 && s.points === 3 && s.box.points === '3' && s.notice.startsWith('Undone.') && !s.undo, {beforeUndo, after: s});

    // B2: Undo goes by itself after 20 seconds.
    await type('status', 'points', (statusBefore.points + 1) % 10);
    const shown = (await state('status')).undo;
    await page.waitForTimeout(21000);
    s = await state('status');
    check('B2', shown && !s.undo, {shownAfterChange: shown, after21s: s});

    // B3: Undo goes when you tap Save.
    await type('status', 'points', statusBefore.points);
    const shownBeforeSave = (await state('status')).undo;
    await page.locator('#btnSave').click();
    await page.waitForFunction(() => document.getElementById('cp7-undo').hidden, null, {timeout: 10000}).catch(() => {});
    s = await state('status');
    check('B3', shownBeforeSave && !s.undo, {shownBeforeSave, afterSave: s});

    // C1: Recognition by your lord, inside the Glory card, turns 10 points into a Rank.
    const recognize = page.locator('[data-cp7=glory] .cp7-adjust .ce7-recognition');
    const label = (await recognize.textContent()).trim();
    await recognize.click();
    s = await state('glory');
    check('C1', s.rank === 4 && s.points === 2 && (await visible('[data-cp7=status] .cp7-adjust .ce7-recognition')) === 1, {label, ...s});

    // C2: with some Taint, the growth check inside the Taint card opens a roll.
    await type('taint', 'points', 3);
    const growth = await T(() => {const b = document.getElementById('ta7-check'); return {inCard: !!b?.closest('[data-cp7=taint] .cp7-adjust'), text: b?.textContent.trim()};});
    await page.locator('#ta7-check').click();
    await page.waitForTimeout(800);
    // The roll window is fixed in place, so it is found by its title rather than by layout.
    const opened = await T(() => [...document.querySelectorAll('.roll-modal-overlay, [role=dialog]')].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0 && /Taint growth —/.test(e.textContent)).map(e => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 90)));
    check('C2', growth.inCard && growth.text === 'Check Taint growth' && opened.length > 0, {growth, opened});
    await page.keyboard.press('Escape');
    await T(() => document.querySelectorAll('.roll-modal-overlay').forEach(o => o.classList.remove('active', 'open', 'show')));

    // C3: Play shows plain numbers, no boxes or Recognition; the steppers stay.
    await page.locator('.pm12-toggle').first().click();
    await page.waitForTimeout(300);
    const play = {play: await T(() => window.__L5R_TEST__.MODES12.isPlay()), boxes: await visible('.ce7-edit'), numbers: await visible('.cp7-values output'),
      recognition: await visible('.ce7-recognition'), steppers: await visible('.cp7-adjust input'), glory: await T(() => [...document.querySelectorAll('[data-cp7=glory] .cp7-values output')].map(o => o.textContent))};
    check('C3', play.play && play.boxes === 0 && play.numbers === 8 && play.recognition === 0 && play.steppers === 4 && play.glory.join(',') === '4,2', play);

    // C4: saved values come back after closing and reopening the app.
    await page.locator('.pm12-toggle').first().click();
    await page.locator('#btnSave').click();
    await page.waitForTimeout(1500);
    await page.reload({waitUntil: 'domcontentloaded', timeout: 60000});
    await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready, null, {timeout: 60000});
    // The app reopens on the Characters list; the saved copy is opened from it, as a person would.
    await page.locator('.cl11-row button[data-act=open]').first().click();
    await page.waitForTimeout(1500);
    const reopened = {glory: await state('glory'), honor: await state('honor'), name: await T(() => document.getElementById('f_name')?.value)};
    check('C4', reopened.glory.rank === 4 && reopened.glory.points === 2 && reopened.honor.rank === 6 && reopened.honor.points === 3, reopened);
    await T(() => window.__L5R_TEST__.MODES12.set('management'));
    await goTab('Rings & Traits');

    // D1: Rings & Traits shows Campaign wounds and the eight thresholds in Management.
    const panel = await T(() => ({heading: document.getElementById('wp7-heading')?.textContent, shown: document.getElementById('wm7-panel')?.offsetParent !== null,
      rows: [...document.querySelectorAll('#wp7-thresholds tr')].map(r => r.textContent), earth: document.getElementById('ring_earth')?.value, summary: document.getElementById('wm7-summary')?.textContent}));
    check('D1', panel.heading === 'Campaign wounds' && panel.shown && panel.rows.length === 8, panel);

    // D2: ×3 applied: Healthy Earth ×5, each later level adds Earth ×3.
    await page.locator('#wm7-picker').selectOption('3');
    const beforeApply = await T(() => [...document.querySelectorAll('#wp7-thresholds td')].map(td => td.textContent));
    await page.locator('#wm7-apply').click();
    const totals = await T(() => [...document.querySelectorAll('#wp7-thresholds td')].map(td => Number(td.textContent)));
    const earth = Number(panel.earth), steps = totals.slice(1).map((t, i) => t - totals[i]);
    check('D2', totals[0] === earth * 5 && steps.every(x => x === earth * 3), {earth, beforeApply, totals, summary: await T(() => document.getElementById('wm7-summary')?.textContent)});

    // D3: Play hides the setting; Combat names where to change it and uses the same totals.
    await page.locator('.pm12-toggle').first().click();
    await goTab('Combat');
    const combat = await T(() => ({panelShown: document.getElementById('wm7-panel')?.offsetParent !== null, pointer: document.getElementById('wp7-location')?.textContent,
      live: document.getElementById('wm7-live-summary')?.textContent, tab: document.getElementById('wp7-location')?.closest('[data-tab-label]')?.dataset.tabLabel}));
    check('D3', !combat.panelShown && combat.pointer === 'Change the multiplier in Management → Rings & Traits → Campaign wounds.' && /×3/.test(combat.live || ''), combat);
  } catch(e) {errors.push(String(e && e.stack || e)); check('walk completed', false, String(e));}
  finally {await browser.close();}
  const report = {url, checked_utc: new Date().toISOString(), scope: 'Headless Chrome at 390 × 844 (touch), live site, fresh storage; not the owner\'s iPhone or Edge.', checks, errors,
    passed: checks.length === 14 && checks.every(c => c.passed) && errors.length === 0};
  fs.mkdirSync(out, {recursive: true});
  fs.writeFileSync(path.join(out, 'checklist-walk.json'), JSON.stringify(report, null, 2) + '\n');
  console.log((report.passed ? 'WALK PASSED ' : 'WALK FAILED ') + checks.filter(c => c.passed).length + '/' + checks.length + (errors.length ? ' errors: ' + errors.join(' | ') : ''));
  process.exitCode = report.passed ? 0 : 1;
})();
