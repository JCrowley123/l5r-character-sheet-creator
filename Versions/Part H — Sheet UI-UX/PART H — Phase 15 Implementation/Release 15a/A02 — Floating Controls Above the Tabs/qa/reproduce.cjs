'use strict';
// Release 15a, A02: measure the floating controls on a given build. For every carousel tab, in Play and in
// Manage, on a phone (390 x 844, touch), a small phone (375 x 667, touch) and a desktop (1440 x 1000), at the top of the page, scrolled
// part-way and at the very end, it records where the dice launcher, the return-to-top control, the Quick Access
// toggle (and revision 1's A02 strip, if present) sit, what each covers (headings, controls, the tab bar) and whether the last line of
// the page can be read clear of them. Writes <out>/floating-states.json and screenshots.
// node reproduce.cjs <sheet.html> <out folder> [fixture.json]
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
const fixture = process.argv[4] ? path.resolve(process.argv[4])
  : path.resolve(__dirname, '../../../../PART H — Phase 15 UI Consistency Audit/qa/dense-audit-fixture.json');
fs.mkdirSync(out, {recursive: true});
const DEVICES = {phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true},
  small: {viewport: {width: 375, height: 667}, isMobile: true, hasTouch: true},
  desktop: {viewport: {width: 1440, height: 1000}}};

function measure() {
  const vis = e => { if (!e) return false; const s = getComputedStyle(e), r = e.getBoundingClientRect();
    return !e.hidden && s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0 &&
      (typeof e.checkVisibility !== 'function' || e.checkVisibility({visibilityProperty: true})); };  // not drawn: e.g. inside a closed <details>
  const rect = e => { const r = e.getBoundingClientRect(); return {x: Math.round(r.left), y: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom)}; };
  const hit = (a, b) => a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b;
  const C = window.__L5R_CAROUSEL__, page = [...document.querySelectorAll('.car-page:not([data-clone])')].find(p => !p.hidden && !p.inert && (() => { const r = p.getBoundingClientRect(); return r.left > -5 && r.left < 5; })());
  const floats = {};
  for (const [k, id] of [['dice', 'floatingDiceBtn'], ['top', 'scrollTopBtn'], ['quick', 'quickAccessToggleBtn'], ['strip', 'fc15Strip']]) {
    const e = document.getElementById(id); floats[k] = vis(e) ? rect(e) : null;
  }
  const tabbar = document.getElementById('carTabbar'), tb = vis(tabbar) ? rect(tabbar) : null;
  const pageRect = page ? rect(page) : null;
  // What the page content shows on screen that a floating control lies over.
  const covered = {};
  const content = page ? [...page.querySelectorAll('h2,h3,button,input,select,textarea,label,.hint,td,th,a,[role=button]')].filter(vis) : [];
  for (const [k, f] of Object.entries(floats)) {
    if (!f || k === 'strip') continue;
    covered[k] = content.filter(e => { const r = rect(e); return hit(r, f) && r.y >= pageRect.y - 1 && r.b <= pageRect.b + 1; })
      .map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ':' + (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 40));
  }
  const onTabbar = {};
  for (const [k, f] of Object.entries(floats)) if (f && tb) onTabbar[k] = hit(f, tb);
  // At the end of a page: the lowest visible content edge, and the highest floating edge above the tab bar.
  let lastContent = null;
  if (page) for (const e of content) { const r = rect(e); if (r.b <= pageRect.b + 1 && (!lastContent || r.b > lastContent.b)) lastContent = {...r, what: e.tagName.toLowerCase() + ':' + (e.innerText || e.value || '').trim().slice(0, 40)}; }
  return {tab: C.getActiveTab().label, scrollTop: page ? page.scrollTop : null, scrollMax: page ? page.scrollHeight - page.clientHeight : null,
    page: pageRect, tabbar: tb, floats, onTabbar, covered, lastContent,
    stripOn: !!document.body.classList.contains('fc15-on'), A02: typeof window.__L5R_TEST__.FC15 === 'object'};
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  const data = JSON.parse(fs.readFileSync(fixture, 'utf8'));
  try {
    for (const [device, opts] of Object.entries(DEVICES)) {
      const context = await browser.newContext(opts);
      await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
      const page = await context.newPage(); page.setDefaultTimeout(30000);
      const errors = []; page.on('pageerror', e => errors.push(String(e)));
      await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
      await page.waitForFunction(() => !document.getElementById('l5rSplash'));
      await page.evaluate(d => { const T = window.__L5R_TEST__; T.CL11.close(); T.applyData(d); }, data);
      for (const mode of ['play', 'management']) {
        const tabs = await page.evaluate(async m => { const T = window.__L5R_TEST__; T.MODES12.set(m); return window.__L5R_CAROUSEL__.getTabs().filter(t => !t.panel.hidden).map(t => t.label); }, mode);
        for (const label of tabs) {
          await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label);
          for (const where of ['top', 'middle', 'end']) {
            await page.evaluate(w => { const p = [...document.querySelectorAll('.car-page:not([data-clone])')].find(p => !p.hidden && !p.inert && Math.abs(p.getBoundingClientRect().left) < 5);
              if (p) p.scrollTop = w === 'top' ? 0 : w === 'middle' ? Math.min(400, (p.scrollHeight - p.clientHeight) / 2) : p.scrollHeight; }, where);
            await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
            const m = await page.evaluate(measure);
            const name = device + '-' + mode + '-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + where;
            if (device !== 'desktop' || where === 'top') await page.screenshot({path: path.join(out, name + '.png')});
            results.push({device, mode, where, ...m});
          }
        }
      }
      results.push({device, errors});
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'floating-states.json'), JSON.stringify({sheet, fixture: path.basename(fixture), results}, null, 1) + '\n');
  // Plain summary.
  const lines = [];
  for (const r of results.filter(r => r.where)) {
    const parts = [];
    for (const [k, f] of Object.entries(r.floats)) if (f) parts.push(k + (r.onTabbar[k] ? '[ON TABS]' : '') + (r.covered[k] && r.covered[k].length ? ' covers ' + r.covered[k].length + ' (' + r.covered[k].slice(0, 3).join(' | ') + ')' : ''));
    lines.push([r.device, r.mode, r.tab, r.where, parts.join('; ')].join(' · '));
  }
  fs.writeFileSync(path.join(out, 'summary.txt'), lines.join('\n') + '\n');
  console.log(lines.length + ' states measured');
})();
