'use strict';
// G2 step 1 (A06, A07, A11): configure Wealthy and Lord Moon's Curse through their pickers, then measure and photograph
// their rows (with Zakyo Toshi Citizen's and Missing Limb's) and the Identity tab's Insight and Spent XP helper text,
// phone and desktop, Play and Manage. Read-only.  node configured-rows.cjs <sheet.html> <out>   (PW_CHANNEL=msedge)
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const dense = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa/a03-fixtures.json'), 'utf8')).dense;
const DEVICES = {phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, desktop: {viewport: {width: 1440, height: 1000}}};
const NAMES = ['Zakyo Toshi Citizen', 'Wealthy', 'Missing Limb', 'Lord Moon’s Curse'];

async function add(page, kind, name, choose) {
  await page.evaluate(([k, n]) => { const s = document.getElementById(k + 'QuickAdd'); s.value = n; s.dispatchEvent(new Event('change', {bubbles: true})); }, [kind, name]);
  if (!choose) { await page.waitForTimeout(150); return; }
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'});
  await page.waitForTimeout(100);
  await choose();
  await page.locator('#advConfigConfirm').click();
  await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
}
function measure(names) {
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
  const r = e => { const b = e.getBoundingClientRect(), s = getComputedStyle(e); return {box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)],
    font: s.fontSize + ' ' + s.fontFamily.split(',')[0].replace(/"/g, '') + (s.textTransform !== 'none' ? ' ' + s.textTransform : ''), mid: Math.round(b.top + b.height / 2)}; };
  const o = {};
  for (const d of document.querySelectorAll('#advList .entry, #disadvList .entry')) {
    const nm = (d.querySelector('.en-name').value || '').trim(); if (!names.includes(nm)) continue;
    o[nm] = [...d.querySelectorAll('button,select,label,input[type=checkbox],[class*="wealth4517"],[class*="supp4540"],[class*="lm7"],[class*="chk4531"],.adv-config-summary,.void-pip')]
      .filter(e => vis(e) && !/en-name|en-desc|en-cost|rm-btn/.test(e.className)).map(e => ({el: e.tagName.toLowerCase() + '.' + String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.'),
        text: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 44), ...r(e)}));
  }
  return o;
}
function identity() {
  const r = e => { const b = e.getBoundingClientRect(), s = getComputedStyle(e); return {box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], font: s.fontSize, lh: s.lineHeight, mt: s.marginTop}; };
  const out = {};
  for (const h of document.querySelectorAll('.hint')) {
    const t = h.textContent.trim(); if (!/^Insight =|^Spent XP is calculated/.test(t)) continue;
    const prev = h.previousElementSibling; const fields = prev ? [...prev.querySelectorAll('input')].filter(i => i.offsetParent) : [];
    const lowest = fields.reduce((m, i) => Math.max(m, i.getBoundingClientRect().bottom), prev ? prev.getBoundingClientRect().top : 0);
    out[t.slice(0, 8)] = {hint: r(h), prev: prev ? prev.className : '', gapToLowestField: Math.round(h.getBoundingClientRect().top - lowest)};
  }
  return out;
}

(async () => {
  const browser = await chromium.launch(process.env.PW_CHANNEL ? {channel: process.env.PW_CHANNEL} : {});
  const report = {};
  try {
    for (const [device, opts] of Object.entries(DEVICES)) {
      const context = await browser.newContext(opts);
      await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
      const page = await context.newPage(); page.setDefaultTimeout(8000);
      await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
      await page.waitForFunction(() => !document.getElementById('l5rSplash'));
      await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d);
        document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); T.MODES12.set('management'); }, dense);
      await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Adv & Disadv'); await C.whenSettled(); });
      // Remove the dense character's own unconfigured copies so the measured rows are the configured ones.
      await page.evaluate(n => { for (const d of [...document.querySelectorAll('#advList .entry, #disadvList .entry')])
        if (['Wealthy', 'Lord Moon’s Curse'].includes((d.querySelector('.en-name').value || '').trim())) d.remove(); window.__L5R_TEST__.recalcAll(); });
      await add(page, 'adv', 'Wealthy', async () => {
        const num = page.locator('#advConfigGrid input[type=number]');
        if (await num.count()) await num.first().fill('2');
        else { const rk = page.locator('#advConfigGrid input[type=radio]').first(); await rk.check(); }
        await page.locator('#advConfigGrid label', {hasText: 'Add it to my Koku now'}).first().click();
        console.error('wealthy grid: ' + (await page.locator('#advConfigGrid').innerHTML()).slice(0, 900)); });
      await add(page, 'disadv', 'Lord Moon’s Curse', async () => {
        await page.locator('#advConfigGrid label', {hasText: 'Medium'}).first().click(); });
      await page.screenshot({path: path.join(out, `${device}-after-confirm.png`)});
      report[device] = {};
      for (const mode of ['management', 'play']) {
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode);
        await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Adv & Disadv'); await C.whenSettled(); });
        await page.waitForTimeout(150);
        report[device][mode] = {rows: await page.evaluate(measure, NAMES)};
        for (const h of await page.$$('#advList .entry, #disadvList .entry')) {
          const nm = await h.evaluate(d => (d.querySelector('.en-name').value || '').trim());
          if (NAMES.includes(nm)) { await h.scrollIntoViewIfNeeded(); await h.screenshot({path: path.join(out, `${device}-${mode}-cfg-${nm.replace(/\W+/g, '-')}.png`)}); }
        }
        await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Identity'); await C.whenSettled(); });
        await page.waitForTimeout(150);
        report[device][mode].identity = await page.evaluate(identity);
        for (const h of await page.$$('.hint')) {
          const t = await h.evaluate(e => e.textContent.trim());
          if (/^Insight =|^Spent XP is/.test(t)) { const g = await h.evaluateHandle(e => e.parentElement);
            await g.asElement().scrollIntoViewIfNeeded(); await g.asElement().screenshot({path: path.join(out, `${device}-${mode}-hint-${t.slice(0, 7).replace(/\W+/g, '')}.png`)}); }
        }
      }
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'configured-rows.json'), JSON.stringify(report, null, 1));
  for (const [dev, m] of Object.entries(report)) for (const [mode, v] of Object.entries(m)) {
    console.log(`=== ${dev}/${mode}`);
    for (const [n, parts] of Object.entries(v.rows)) { console.log('-- ' + n); for (const p of parts) console.log(`   ${p.el.padEnd(32)} ${p.box.join(',').padEnd(20)} mid${p.mid} ${p.font.padEnd(26)} "${p.text}"`); }
    console.log('   identity ' + JSON.stringify(v.identity));
  }
})().catch(e => { console.error(e); process.exit(1); });
