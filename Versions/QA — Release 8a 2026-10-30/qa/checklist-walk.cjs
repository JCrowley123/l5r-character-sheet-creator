// Walks Release 8a's device checklist at phone size, through the controls the owner taps, and records what the sheet
// shows after each step: A, the creation wizard overspent (Next works, the warning on each step and on Review, Finish asks
// once and goes on, Stay stays) and within budget (no warning, no question); B, a new sheet not yet saved, a change undone
// then another character opened (no question), and a real change (asked). Each part in fresh storage. Adapted from
// Release 7c.1's walk (its page set-up only).
// Usage: node checklist-walk.cjs <output folder> [sheet.html instead of the live site]
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const out = process.argv[2];
if(!out) throw Error('Supply the output folder');
const url = process.argv[3] ? pathToFileURL(path.resolve(process.argv[3])).href : 'https://l5r-character-sheet-creator.pages.dev/';
const CRAB = fs.readFileSync(path.join(__dirname, '../../BUGFIX — Undone Change Not Unsaved Work/qa/7b1-checks-crab.l5r.json'), 'utf8');
const CRAB_NAME = JSON.parse(CRAB).fields.f_name;
const TOTAL = 9, CEILING = 60000;

async function openPage(browser, seed) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  // Part B starts with one character already saved, as on the owner's phone.
  if(seed) await context.addInitScript(([text]) => {
    if(localStorage.getItem('l5r-sheet:local:l5r-char-index')) return;
    localStorage.setItem('l5r-sheet:local:l5r-char:c_8a_walk', text);
    localStorage.setItem('l5r-sheet:local:l5r-char-index', JSON.stringify([{id: 'c_8a_walk', name: JSON.parse(text).fields.f_name, clan: 'Crab', updatedAt: 1}]));
  }, [CRAB]);
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 60000});
  await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready, null, {timeout: CEILING});
  await page.waitForFunction(() => !document.querySelector('[id^=l5r-splash]'), null, {timeout: CEILING});
  return {context, page};
}

(async () => {
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch(), checks = [], errors = [];
  const check = (id, ok, seen) => {checks.push({id, passed: !!ok, seen}); console.log((ok ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(seen).slice(0, 700));};
  const shot = (page, name) => page.screenshot({path: path.join(out, name + '.png')});
  try {
    // ---- A: the creation wizard ----
    for(const over of [true, false]) {
      const {context, page} = await openPage(browser, false);
      const T = (fn, arg) => page.evaluate(fn, arg);
      const state = () => T(() => ({title: document.getElementById('cw112Title').textContent, next: document.getElementById('cw112Next').textContent,
        disabled: document.getElementById('cw112Next').disabled, warning: (document.getElementById('xw8Warning') || {}).textContent || null,
        xp: (document.querySelector('.cw112-xp') || {}).textContent || null}));
      const tapNext = async () => {await page.waitForFunction(() => !document.getElementById('cw112Next').disabled, null, {timeout: CEILING}); await page.locator('#cw112Next').tap();};
      const card = async text => page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().tap();
      await page.locator('#cl11Toolbar').tap();
      await page.locator('#cl11Create').tap();
      await page.waitForFunction(() => !document.getElementById('cw112View').hidden, null, {timeout: CEILING});
      await page.locator('#cw112Name').fill(over ? 'Isawa Walk' : 'Isawa Budget');
      await tapNext(); await card('Phoenix'); await tapNext(); await card('Isawa'); await tapNext(); await card('Isawa Shugenja');
      await page.waitForFunction(() => document.getElementById('affinityPickModalOverlay').style.display === 'flex', null, {timeout: CEILING});
      await page.locator('#affinityPick_Void').tap(); await page.locator('#affinityPickConfirm').tap();
      await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Isawa Shugenja' && !window.__L5R_TEST__.CW112.busy, null, {timeout: CEILING});
      await tapNext();
      for(const t of over ? ['Willpower', 'Void', 'Agility', 'Strength', 'Perception'] : ['Willpower', 'Void']) await page.locator('button[aria-label="Raise ' + t + '"]').tap();
      const seen = [];
      if(over) {
        const traits = await state();
        await shot(page, 'A1-traits');
        check('A1 Rings & Traits overspent: Next works, the warning says by how much', !traits.disabled && /^You have spent \d+ XP more than you have\. You can go on/.test(traits.warning || ''), traits);
      }
      for(let i = 0; i < 20 && (await state()).title !== 'Review'; i++) { seen.push(await state()); await tapNext(); }
      const review = await state();
      await shot(page, over ? 'A3-review' : 'A5-review');
      if(over) {
        const steps = seen.filter(s => s.title === 'Skills' || s.title === 'Advantages & Disadvantages');
        check('A2 Skills and Advantages overspent: Next works, each shows the warning', steps.length === 2 && steps.every(s => !s.disabled && /^You have spent/.test(s.warning || '')), steps);
        check('A3 Review: the warning in plain words with the amount over; Finish not blocked', review.next === 'Finish' && !review.disabled &&
          /^You have spent \d+ XP more than you have \(\d+ of \d+\)\. You can still finish/.test(review.warning || ''), review);
        await page.locator('#cw112Next').tap();
        await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex', null, {timeout: CEILING});
        const question = await T(() => document.getElementById('appConfirmMsg').textContent);
        await shot(page, 'A4-question');
        await page.locator('#appConfirmCancel').tap();
        await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display !== 'flex', null, {timeout: CEILING});
        const stayed = await state();
        check('A4 Finish asks once; Stay keeps the wizard on Review', /^You have spent \d+ XP more than you have\. Finish anyway\?/.test(question) &&
          stayed.title === 'Review' && !(await T(() => document.getElementById('cw112View').hidden)), {question, stayed});
        await page.locator('#cw112Next').tap();
        await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex', null, {timeout: CEILING});
        await page.locator('#appConfirmOk').tap();
        await page.waitForFunction(() => document.getElementById('cw112View').hidden, null, {timeout: CEILING});
        await page.waitForFunction(() => JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char-index') || '[]').some(c => c.name === 'Isawa Walk'), null, {timeout: CEILING});
        const after = await T(() => ({name: document.getElementById('f_name').value, play: window.__L5R_TEST__.MODES12.isPlay(), spent: document.getElementById('f_xpSpent').value, total: document.getElementById('f_xpTotal').value}));
        await shot(page, 'A4-finished');
        check('A4b Finish goes on: the character is saved and opens in Play, still overspent', after.name === 'Isawa Walk' && after.play && Number(after.spent) > Number(after.total), after);
      } else {
        await page.locator('#cw112Next').tap();
        await page.waitForFunction(() => document.getElementById('cw112View').hidden, null, {timeout: CEILING});
        const asked = await T(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
        check('A5 Within budget: no warning, Finish closes at once', review.warning === null && !review.disabled && !asked, {review, asked});
      }
      errors.push(...page.errors);
      await context.close();
    }
    // ---- B: a new sheet, not yet saved ----
    for(const undo of [true, false]) {
      const {context, page} = await openPage(browser, true);
      const T = (fn, arg) => page.evaluate(fn, arg);
      // The Characters screen opens over the unsaved sheet at start; Back to the sheet, as the owner would.
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden, null, {timeout: CEILING});
      await T(() => window.__L5R_TEST__.CL11.close());
      await T(() => window.__L5R_TEST__.MODES12.set('management'));
      const was = await T(() => document.getElementById('f_taint').value);
      const typeTaint = async v => { await page.locator('#f_taint').fill(String(v)); await page.locator('#f_taint').dispatchEvent('change');
        await T(() => window.__L5R_TEST__.AL71.check()); };
      await T(() => window.__L5R_TEST__.AL71.check());
      await typeTaint(Number(was) + 1);
      if(undo) await typeTaint(was);
      const history = await T(() => window.__L5R_TEST__.AL71.entries().map(e => window.__L5R_TEST__.AL71Logic.text(e)));
      await page.locator('#cl11Toolbar').tap();
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden, null, {timeout: CEILING});
      await page.locator('.cl11-row[data-id="c_8a_walk"] .cl11-open').tap();
      await page.waitForFunction(n => document.getElementById('appConfirmOverlay').style.display === 'flex' || document.getElementById('f_name').value === n, CRAB_NAME, {timeout: CEILING});
      const asked = await T(() => document.getElementById('appConfirmOverlay').style.display === 'flex' ? document.getElementById('appConfirmMsg').textContent : null);
      await shot(page, undo ? 'B1-opened' : 'B2-asked');
      if(undo) {
        check('B1 A change undone on a new sheet: History keeps both, opening another character asks nothing',
          asked === null && history.length === 2 && await T(n => document.getElementById('f_name').value === n, CRAB_NAME), {history, asked});
      } else {
        await page.locator('#appConfirmCancel').tap();
        const kept = await T(() => [document.getElementById('f_name').value, document.getElementById('f_taint').value]);
        check('B2 A real change on a new sheet: still asked; Cancel keeps the sheet', /^This sheet has not been saved\./.test(asked || '') && kept[0] === '' && kept[1] === String(Number(was) + 1), {asked, kept});
      }
      errors.push(...page.errors);
      await context.close();
    }
  } catch(e) {
    check('WALK-RAN', false, String(e.message || e).split('\n')[0]);
  } finally {
    await browser.close();
  }
  check('NO-PAGE-ERRORS', errors.length === 0, errors);
  fs.writeFileSync(path.join(out, 'walk.json'), JSON.stringify({url, checks}, null, 2) + '\n');
  const passed = checks.filter(c => c.passed).length;
  console.log(passed + '/' + checks.length + ' checks passed');
  process.exitCode = passed === TOTAL && checks.length === TOTAL ? 0 : 1;
})();
