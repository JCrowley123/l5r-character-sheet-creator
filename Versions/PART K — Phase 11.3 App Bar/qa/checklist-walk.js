/* Walks the owner's checklist for this cycle through the real controls on the live site (or a given URL).
 * Covers what a headless browser can judge: the app bar (A), Search's return and scroll (S9 structure, S11), Touch of
 * the Void's roll (V2) and the Initiative Score (I). The iPhone's own look, keyboard and taps are the owner's.
 * node checklist-walk.js [url]
 */
'use strict';
const {chromium} = require('playwright');
const URL = process.argv[2] || 'https://l5r-character-sheet-creator.pages.dev/';
const results = [];
function check(id, actual, expected = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual).slice(0, 400)} expected=${JSON.stringify(expected).slice(0, 400)}`}`);
}
async function step(id, fn) { try { await fn(); } catch (e) { check(id + '-RAN', String(e.message || e).split('\n')[0], 'completed'); } }

(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(URL + '?walk=' + Date.now(), {waitUntil:'domcontentloaded', timeout:90000});
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout:90000});
    const bar = s => `#ab113Bar [data-section="${s}"]`;
    const shown = sel => page.evaluate(s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && e.getClientRects().length > 0; }, sel);
    const current = () => page.evaluate(() => [...document.querySelectorAll('#ab113Bar [aria-current="page"]')].map(b => b.dataset.section));

    await step('A1', async () => {
      check('A1-BAR-AT-TOP', await page.evaluate(() => { const b = document.getElementById('ab113Bar'); return !!b && Math.round(b.getBoundingClientRect().top) === 0 &&
        [...b.querySelectorAll('.ab113-item')].map(x => x.textContent).join(' · '); }), 'Sheet · Characters · Library · Search');
      check('A1-SHEET-MARKED-NO-HEADER-BUTTON', [await current(), await shown('#cl11Toolbar')], [['sheet'], false]);
    });
    await step('A2', async () => {
      const seen = [];
      for (const s of ['characters', 'library', 'search', 'sheet']) {
        await page.click(bar(s)); await page.waitForTimeout(200);
        seen.push([(await current())[0], await page.evaluate(() => Math.round(document.getElementById('ab113Bar').getBoundingClientRect().top)), await shown('#cl11View .cl11-nav')]);
      }
      check('A2-EACH-SECTION', seen, [['characters', 0, false], ['library', 0, false], ['search', 0, false], ['sheet', 0, false]]);
    });
    await step('A4', async () => {
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      await page.click('#pm128More');
      check('A4-MENU-MANAGE', await page.$$eval('#pm128Menu [role=menuitem]', b => b.filter(x => x.offsetParent).map(x => x.textContent)), ['Save As a copy', 'Print', 'Export JSON']);
      await page.keyboard.press('Escape');
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
    });
    await step('S11', async () => {
      await page.click(bar('search'));
      await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:''}));
      const panel = () => page.evaluate(() => { const p = document.querySelector('#cl11View [data-panel="search"]'); return [getComputedStyle(p).overflowY, p.scrollTop]; });
      await page.evaluate(() => { document.querySelector('#cl11View [data-panel="search"]').scrollTop = 400; });
      await page.waitForTimeout(150);
      const before = await panel();
      const name = await page.evaluate(() => { const p = document.querySelector('#cl11View [data-panel="search"]'), top = p.getBoundingClientRect().top;
        const b = [...p.querySelectorAll('.s14-row')].find(x => x.getBoundingClientRect().top > top + 40); b.click(); return b.querySelector('.s14-name').textContent; });
      await page.click(bar('sheet'));
      await page.click(bar('search'));
      await page.waitForTimeout(200);
      const back = await page.evaluate(() => [!document.querySelector('.s14-detail').hidden, document.querySelector('.s14-detail h3').textContent]);
      await page.click('.s14-detail [data-s14="back"]');
      check('S9-PANEL-SCROLLS-BAR-STAYS', [before[0], before[1] > 0, await page.evaluate(() => Math.round(document.getElementById('ab113Bar').getBoundingClientRect().top))], ['auto', true, 0]);
      check('S11-ENTRY-THEN-LIST-KEPT', [back, (await panel())[1]], [[true, name], before[1]]);
      await page.click(bar('sheet'));
    });
    await step('V2', async () => {
      await page.evaluate(() => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.MODES12.set('management'); T.clearAllRows?.();
        const lib = T.DISADV_LIBRARY.find(x => x.name === 'Touch of the Void');
        document.getElementById('disadvList').appendChild(T.makeEntry({name:lib.name, cost:lib.cost, desc:lib.desc}, true));
        document.getElementById('void_current').value = 2; T.recalcAll();
        const tr = T.makeSkillRow({name:'Courtier', trait:'Awareness', rank:2}); tr.id = 'walkSkill'; document.getElementById('skillsBody').appendChild(tr);
        tr.querySelector('.sk-roll').click(); });
      await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:8000});
      await page.locator('#rollPreviewBody [data-void-key="k1"]').check();
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      await page.waitForTimeout(400);
      const during = await page.evaluate(() => document.getElementById('rollPreviewOverlay').style.display === 'flex');
      await page.locator('#rollModalClose').click();
      await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:8000});
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      const title = await page.evaluate(() => document.getElementById('rollModalTitle').textContent);
      await page.locator('#rollModalClose').click();
      check('V2-WILLPOWER-AFTER-THE-ROLL', [during, title], [false, 'Touch of the Void — Willpower vs TN 30']);
    });
    await step('I', async () => {
      await page.evaluate(() => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.MODES12.set('management'); T.clearAllRows?.();
        const lib = T.ADV_LIBRARY.find(x => x.name === 'Quick');
        document.getElementById('advList').appendChild(T.makeEntry({name:lib.name, cost:lib.cost, desc:lib.desc}, true));
        document.getElementById('trait_reflexes').value = 3; T.recalcAll(); T.MODES12.set('play'); T.setCombatActive(true); T.recalcAll(); });
      const line = () => page.evaluate(() => document.querySelector('#is4535Line .is4535-score').textContent);
      const none = await line();
      await page.evaluate(() => document.getElementById('btnRollInitiative').click());
      await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:8000});
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      const total = await page.evaluate(() => +document.getElementById('rollTotalDisplay').textContent);
      await page.locator('#rollModalClose').click();
      const rolled = await line();
      await page.evaluate(() => [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Quick').querySelector('.vi4533-row button').click());
      const quick = await line();
      await page.evaluate(() => document.getElementById('btnResetRounds').click());
      check('I-SCORE-ROLL-QUICK-RESET', [none, rolled, quick, await line()],
        ['Initiative Score: not set yet', 'Initiative Score: ' + total, 'Initiative Score: ' + (total + 3), 'Initiative Score: not set yet']);
    });
    check('NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length ? 0 : 1;
})();
