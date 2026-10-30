// Walks Release 8a.1's re-tests (section R of the Release 8a Device Checks) at phone size, through the controls the owner
// taps, and records what the sheet shows after each step: A, the creation wizard overspent (one line above the buttons on
// the step where it appears, no box anywhere, nothing on later steps, Review keeping only the sheet's own item, Finish
// asking once) and within budget (nothing); F, Bayushi Bushi's free choice made (Acting, ticked as School): no note on
// Review or in the sheet's check. Each part in fresh storage. Adapted from Release 8a's walk.
// Usage: node checklist-walk.cjs <output folder> [sheet.html instead of the live site]
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const out = process.argv[2];
if(!out) throw Error('Supply the output folder');
const url = process.argv[3] ? pathToFileURL(path.resolve(process.argv[3])).href : 'https://l5r-character-sheet-creator.pages.dev/';
const TOTAL = 8, CEILING = 60000;

async function openPage(browser) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
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
      const {context, page} = await openPage(browser);
      const T = (fn, arg) => page.evaluate(fn, arg);
      const state = () => T(() => ({title: document.getElementById('cw112Title').textContent, next: document.getElementById('cw112Next').textContent,
        disabled: document.getElementById('cw112Next').disabled, box: !!document.getElementById('xw8Warning'),
        line: document.getElementById('cw112Reason').textContent,
        xp: (document.querySelector('.cw112-xp') || {}).textContent || null}));
      const tapNext = async () => {await page.waitForFunction(() => !document.getElementById('cw112Next').disabled, null, {timeout: CEILING}); await page.locator('#cw112Next').tap();};
      const card = async text => page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().tap();
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
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
        check('A1 Rings & Traits overspent: Next works, one line above the buttons says by how much, no box', !traits.disabled && !traits.box &&
          /^You have spent \d+ XP more than you have\. You can go on/.test(traits.line), traits);
      }
      for(let i = 0; i < 20 && (await state()).title !== 'Review'; i++) { seen.push(await state()); await tapNext(); }
      const review = await state();
      await shot(page, over ? 'A3-review' : 'A5-review');
      if(over) {
        const steps = seen.filter(s => s.title === 'Skills' || s.title === 'Advantages & Disadvantages');
        check('A2 Skills and Advantages, still overspent: Next works, no line, no box', new Set(steps.map(s => s.title)).size === 2 &&
          steps.every(s => !s.disabled && !s.box && !/^You have spent/.test(s.line)), steps);
        const items = await T(() => [...document.querySelectorAll('#cw112Body .cw112-finding')].filter(li => /^Overspent by /.test(li.querySelector('strong').textContent)).map(li => li.textContent));
        check('A3 Review: no box; the findings list keeps the sheet\'s own "Overspent by" item; Finish not blocked', review.next === 'Finish' && !review.disabled &&
          !review.box && review.line === '' && items.length === 1 && /^Overspent by \d+ XP/.test(items[0]) && /Spent/.test(items[0]), {review, items});
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
        check('A5 Within budget: no line, no box, Finish closes at once', !review.box && review.line === '' && !review.disabled && !asked, {review, asked});
      }
      errors.push(...page.errors);
      await context.close();
    }
    // ---- F: Bayushi Bushi's free choice (any one Skill), made in the wizard as Acting, ticked as School ----
    {
      const {context, page} = await openPage(browser);
      const T = (fn, arg) => page.evaluate(fn, arg);
      const notes = () => T(() => window.__L5R_TEST__.validateCharacter().findings.filter(f => f.id === 'school-choice-slots').map(f => f.title));
      const tapNext = async () => {await page.waitForFunction(() => !document.getElementById('cw112Next').disabled, null, {timeout: CEILING}); await page.locator('#cw112Next').tap();};
      const card = async text => page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().tap();
      const title = () => T(() => document.getElementById('cw112Title').textContent);
      await page.evaluate(() => document.getElementById('cl11Toolbar').click());
      await page.locator('#cl11Create').tap();
      await page.waitForFunction(() => !document.getElementById('cw112View').hidden, null, {timeout: CEILING});
      await page.locator('#cw112Name').fill('Bayushi Walk');
      await tapNext(); await card('Scorpion'); await tapNext(); await card('Bayushi'); await tapNext(); await card('Bayushi Bushi');
      await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Bayushi Bushi' && !window.__L5R_TEST__.CW112.busy, null, {timeout: CEILING});
      await tapNext(); await tapNext();
      const before = [await title(), await notes()];
      await page.locator('#cw1121Slot0Pick').selectOption('Acting');
      await page.locator('#cw1121Slot0Add').tap();
      const row = await T(() => { const tr = [...document.querySelectorAll('#skillsBody tr')].find(r => r.querySelector('.sk-name').value === 'Acting');
        return tr ? tr.querySelector('.sk-school').checked : null; });
      for(let i = 0; i < 20 && (await title()) !== 'Review'; i++) await tapNext();
      const review = await T(() => [...document.querySelectorAll('#cw112Body .cw112-finding')].filter(li => /free Skill choice/.test(li.textContent)).length);
      await shot(page, 'F1-review');
      await page.locator('#cw112Next').tap();
      await page.waitForFunction(() => document.getElementById('cw112View').hidden, null, {timeout: CEILING});
      const sheet = await notes();
      check('F1 Bayushi Bushi: the note open before the choice; Acting ticked as School; no note on Review or in the sheet\'s check',
        before[0] === 'Skills' && before[1].length === 1 && /1 free Skill choice still open$/.test(before[1][0]) && row === true && review === 0 && sheet.length === 0,
        {before, row, review, sheet});
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
