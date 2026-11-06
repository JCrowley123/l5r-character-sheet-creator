'use strict';
// Release 15a, A03: measure the two Advantage/Disadvantage columns and the phone Skill cards on a given build.
// Desktop (1440 x 1000) and phone (390 x 844, touch), Play and Manage, with the dense audit character as
// recorded, with either list emptied, and with a long Skill list (masteries, emphases, School ticks).
// Writes <out>/a03-states.json and screenshots.
// node reproduce.cjs <sheet.html> <out folder>
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const dense = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'a03-fixtures.json'), 'utf8'));
const DEVICES = {phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true},
  small: {viewport: {width: 375, height: 667}, isMobile: true, hasTouch: true},
  desktop: {viewport: {width: 1440, height: 1000}}};

function columns() {
  const adv = document.getElementById('advList'), dis = document.getElementById('disadvList');
  const colA = adv.parentElement, colD = dis.parentElement;
  const r = e => { const b = e.getBoundingClientRect(); return {x: Math.round(b.left), y: Math.round(b.top), b: Math.round(b.bottom), h: Math.round(b.height)}; };
  const lab = c => r(c.querySelector('label'));
  return {grid: getComputedStyle(colA.parentElement).alignItems, advCol: r(colA), disCol: r(colD), advLabel: lab(colA), disLabel: lab(colD),
    labelGap: Math.round(colA.querySelector('label').getBoundingClientRect().top - colD.querySelector('label').getBoundingClientRect().top),
    advRows: adv.children.length, disRows: dis.children.length};
}
function skills() {
  const vis = e => { if (!e) return false; const s = getComputedStyle(e), b = e.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && (typeof e.checkVisibility !== 'function' || e.checkVisibility({visibilityProperty: true})); };
  const rows = [...document.querySelectorAll('#skillsBody > tr')];
  const page = document.getElementById('skillsTable').closest('.car-page');
  return {pageClient: page.clientHeight, pageScroll: page.scrollHeight, rows: rows.map(tr => {
    const b = tr.getBoundingClientRect();
    return {name: tr.querySelector('.sk-name').value, h: Math.round(b.height),
      cells: [...tr.children].filter(vis).map(td => ({label: td.dataset.label || td.dataset.cell || '', h: Math.round(td.getBoundingClientRect().height)})),
      controls: [...tr.querySelectorAll('button,input,select,textarea')].filter(vis).length,
      masteryLines: [...tr.querySelectorAll('.sk-mastery-note > *')].filter(vis).length};
  })};
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const [device, opts] of Object.entries(DEVICES)) {
      const context = await browser.newContext(opts);
      await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
      const page = await context.newPage(); page.setDefaultTimeout(30000);
      const errors = []; page.on('pageerror', e => errors.push(String(e)));
      await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
      await page.waitForFunction(() => !document.getElementById('l5rSplash'));
      for (const [variant, data] of Object.entries(dense)) {
        await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d); }, data);
        for (const mode of ['play', 'management']) {
          await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode);
          for (const tab of ['Adv & Disadv', 'Skills']) {
            await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); const p = document.querySelector('.car-page[data-tab-label="' + l + '"]'); if (p) p.scrollTop = 0; }, tab);
            await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
            const m = await page.evaluate(tab === 'Skills' ? skills : columns);
            const name = [device, mode, variant, tab === 'Skills' ? 'skills' : 'adv'].join('-');
            await page.screenshot({path: path.join(out, name + '.png'), fullPage: false});
            results.push({device, mode, variant, tab, ...m});
          }
        }
      }
      results.push({device, errors});
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'a03-states.json'), JSON.stringify(results, null, 1));
  for (const r of results) {
    if (r.tab === 'Adv & Disadv') console.log(r.device, r.mode, r.variant, 'align', r.grid, 'labelGap', r.labelGap, 'rows', r.advRows, r.disRows);
    else if (r.tab === 'Skills') console.log(r.device, r.mode, r.variant, 'skills', r.rows.length, 'scroll', r.pageScroll, 'card h', r.rows.map(x => x.h).join(','));
    else console.log(r.device, 'errors', r.errors.length);
  }
})();
