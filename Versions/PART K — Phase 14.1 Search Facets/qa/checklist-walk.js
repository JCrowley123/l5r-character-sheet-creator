/* Walks the owner's checklist for Phase 14.1 through the real controls on the live site (or a given URL), at 390px.
 * Covers what a headless browser can judge: the filters, the grouping, typing, returning, each category's own filters
 * and the widths. The iPhone's own picker, keyboard and look are the owner's.
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
    const search = () => page.click('#ab113Bar [data-section="search"]');
    const sel = f => `#s141Bar select[data-facet="${f}"]`;
    const view = () => page.evaluate(() => ({bar:!document.getElementById('s141Bar').hidden,
      rows:[...document.querySelectorAll('.s14-list .s14-row .s14-name')].map(n => n.textContent),
      heads:[...document.querySelectorAll('.s14-list .s141-group')].map(h => h.textContent),
      count:document.querySelector('.s14-count').textContent,
      values:[...document.querySelectorAll('#s141Bar select')].map(s => s.value)}));
    const spells = await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.map(s => ({name:s.name, element:s.element, mastery:+s.mastery})));

    await step('F1', async () => {
      await search(); await page.waitForTimeout(200);
      await page.click('.s14-cat[data-category="spells"]'); await page.waitForTimeout(200);
      const v = await view();
      check('F1-THREE-FILTERS', await page.$$eval('#s141Bar select', s => s.map(x => x.getAttribute('aria-label'))), ['Element', 'Mastery', 'Maho']);
      check('F1-GROUPED', [v.heads.slice(0, 2), spells.filter(s => s.element === 'Air' && s.mastery === 1).map(s => s.name).includes(v.rows[0])], [['Air', 'Mastery 1'], true]);
    });
    await step('F2', async () => {
      await page.selectOption(sel('element'), 'Fire'); await page.waitForTimeout(150);
      const v = await view(), fire = spells.filter(s => s.element === 'Fire');
      check('F2-FIRE', [v.count, v.rows.slice().sort(), v.heads[0], await page.isVisible('#s141Bar .s141-clear')],
        [fire.length + ' entries', fire.map(s => s.name).sort(), 'Fire', true]);
    });
    await step('F3', async () => {
      await page.click('#s14Input'); await page.keyboard.type('the'); await page.waitForTimeout(150);
      const v = await view();
      check('F3-TYPING', [v.rows.length > 0, v.heads.length, v.rows.every(n => spells.find(s => s.name === n).element === 'Fire'),
        await page.evaluate(() => document.activeElement.id)], [true, 0, true, 's14Input']);
      await page.fill('#s14Input', '');
    });
    await step('F4', async () => {
      await page.selectOption(sel('mastery'), '3'); await page.waitForTimeout(150);
      const n = spells.filter(s => s.element === 'Fire' && s.mastery === 3).length;
      check('F4-FIRE-3', (await view()).count, n + ' entries');
    });
    await step('F5', async () => {
      const before = await view();
      await page.click('.s14-row'); await page.waitForTimeout(150);
      await page.click('.s14-detail [data-s14="back"]'); await page.waitForTimeout(150);
      const after = await view();
      check('F5-BACK', [after.rows, after.values], [before.rows, before.values]);
    });
    await step('F6', async () => {
      await page.selectOption(sel('mastery'), ''); await page.waitForTimeout(150);
      await page.evaluate(() => { for (let n = document.querySelector('.s14-page').parentElement; n; n = n.parentElement)
        if (/^(auto|scroll)$/.test(getComputedStyle(n).overflowY)) { n.scrollTop = 500; n.dispatchEvent(new Event('scroll')); return; } });
      await page.waitForTimeout(150);
      const before = await view();
      await page.click('#ab113Bar [data-section="sheet"]'); await page.waitForTimeout(200);
      await search(); await page.waitForTimeout(250);
      const after = await view();
      const top = await page.evaluate(() => { for (let n = document.querySelector('.s14-page').parentElement; n; n = n.parentElement)
        if (/^(auto|scroll)$/.test(getComputedStyle(n).overflowY)) return n.scrollTop; return -1; });
      check('F6-RETURNS', [after.rows, after.values, Math.abs(top - 500) <= 2], [before.rows, before.values, true]);
    });
    await step('F7', async () => {
      await page.click('#s141Bar .s141-clear'); await page.waitForTimeout(150);
      check('F7-CLEAR', (await view()).count, spells.length + ' entries');
      await page.selectOption(sel('element'), 'Water');
      await page.click('.s14-crumb [data-s14="up"]'); await page.click('.s14-cat[data-category="spells"]'); await page.waitForTimeout(150);
      check('F7-LEAVING-CLEARS', (await view()).values, ['', '', '']);
    });
    await step('F8', async () => {
      const want = {skills:['Trait', 'Type'], advantages:['Type', 'Cost'], disadvantages:['Type', 'Value'], schools:['Clan'], advanced:['Clan', 'Type'],
        paths:['Technique Rank'], techniques:['School', 'Rank'], kata:['Ring', 'Mastery'], kiho:['Ring', 'Mastery', 'Type'], spells:['Element', 'Mastery', 'Maho'],
        weapons:['Skill', 'Type'], clans:['Clan'], ancestors:['Clan', 'Cost']};
      const got = {};
      for (const c of Object.keys(want)) {
        await page.click('.s14-crumb [data-s14="up"]').catch(() => {});
        await page.click(`.s14-cat[data-category="${c}"]`); await page.waitForTimeout(100);
        got[c] = await page.$$eval('#s141Bar select', s => s.map(x => x.getAttribute('aria-label')));
      }
      check('F8-OWN-FILTERS', got, want);
    });
    await step('F9', async () => {
      await page.click('.s14-crumb [data-s14="up"]'); await page.click('.s14-cat[data-category="techniques"]');
      const longest = await page.$$eval(sel('school') + ' option', o => o.slice(1).map(x => x.value).sort((a, b) => b.length - a.length)[0]);
      await page.selectOption(sel('school'), longest); await page.waitForTimeout(150);
      check('F9-FITS', await page.evaluate(() => [document.documentElement.scrollWidth <= innerWidth,
        document.getElementById('s141Bar').getBoundingClientRect().right <= innerWidth, document.querySelectorAll('.s14-row').length > 0]), [true, true, true]);
    });
    await step('F10', async () => {
      check('F10-16PX-44PX', await page.$$eval('#s141Bar select', s => s.every(x => getComputedStyle(x).fontSize === '16px' && x.getBoundingClientRect().height >= 44)));
    });
    await step('F11', async () => {
      await page.click('.s14-crumb [data-s14="up"]'); await page.waitForTimeout(100);
      const home = (await view()).bar;
      await page.fill('#s14Input', 'kat'); await page.waitForTimeout(100);
      check('F11-NOT-ON-HOME-OR-ACROSS', [home, (await view()).bar], [false, false]);
      await page.fill('#s14Input', '');
    });
    check('NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length && passed === results.length ? 0 : 1;
})();
