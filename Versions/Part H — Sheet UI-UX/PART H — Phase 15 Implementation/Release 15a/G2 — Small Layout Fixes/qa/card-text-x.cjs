'use strict';
// A11 (owner's comment 1): where each line of text on an Advantage / Disadvantage card STARTS, on every row of the
// dense character plus Sworn Enemy and Seven Fortunes' Curse (Hotei), phone and desktop, Play and Manage. A textarea or
// input's text starts at its content box (border + padding), so it is measured that way. Read-only.
// node card-text-x.cjs <sheet.html> <out folder>      (PW_CHANNEL=msedge to use Edge)
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const dense = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa/a03-fixtures.json'), 'utf8')).dense;
const DEVICES = {phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, desktop: {viewport: {width: 1440, height: 1000}}};

function read() {
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
  const rows = [];
  for (const d of document.querySelectorAll('#advList .entry, #disadvList .entry')) {
    if (!vis(d)) continue;
    const nameEl = d.querySelector('.en-name'); const name = (nameEl.value || nameEl.textContent || '').trim();
    const db = d.getBoundingClientRect();
    const lines = [];
    const seen = new Set();
    for (const e of d.querySelectorAll('*')) {
      if (!vis(e) || e.closest('button,select,summary')) continue;
      let x = null, kind = '';
      if (/^(TEXTAREA|INPUT)$/.test(e.tagName) && !/checkbox|radio|number/.test(e.type) && (e.value || '').trim()) {
        const s = getComputedStyle(e); x = e.getBoundingClientRect().left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft); kind = 'field';
      } else {
        const n = [...e.childNodes].find(n => n.nodeType === 3 && n.textContent.trim().length > 2);
        if (!n) continue;
        const r = document.createRange(); r.selectNodeContents(n); const b = r.getClientRects()[0]; if (!b) continue; x = b.left; kind = 'text';
        // Only the first text of a line: skip inline text that follows other text on the same line.
        const pb = e.parentElement.getBoundingClientRect();
      }
      const top = Math.round(e.getBoundingClientRect().top - db.top);
      const key = top + ':' + Math.round(x);
      if (seen.has(key)) continue; seen.add(key);
      lines.push({top, x: Math.round(x - db.left), el: e.tagName.toLowerCase() + '.' + String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.'), kind,
        text: (e.value || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 36)});
    }
    lines.sort((a, b) => a.top - b.top || a.x - b.x);
    // Keep the leftmost item on each visual line (within 6 px of top).
    const firsts = [];
    for (const l of lines) { const f = firsts.find(f => Math.abs(f.top - l.top) < 6); if (!f) firsts.push(l); else if (l.x < f.x) Object.assign(f, l); }
    rows.push({name, id: d.id, lines: firsts});
  }
  return rows;
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
      // Sworn Enemy (no picker) and Seven Fortunes' Curse set to Hotei.
      await page.evaluate(() => { const s = document.getElementById('disadvQuickAdd'); s.value = 'Sworn Enemy'; s.dispatchEvent(new Event('change', {bubbles: true})); });
      await page.waitForTimeout(150);
      await page.evaluate(() => { const s = document.getElementById('disadvQuickAdd'); s.value = 'Seven Fortunes’ Curse'; s.dispatchEvent(new Event('change', {bubbles: true})); });
      await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'});
      await page.locator('#advConfigGrid input[type=radio][value="Hotei"]').check().catch(async () => {
        await page.locator('#advConfigGrid label', {hasText: 'Hotei'}).first().click(); });
      await page.locator('#advConfigConfirm').click();
      await page.waitForTimeout(200);
      for (const mode of ['play', 'management']) {
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode);
        await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Adv & Disadv'); await C.whenSettled(); });
        await page.waitForTimeout(150);
        report[device + '/' + mode] = await page.evaluate(read);
        for (const n of ['Sworn Enemy', 'Seven Fortunes’ Curse']) {
          const id = (report[device + '/' + mode].find(r => r.name === n) || {}).id;
          if (id) { const h = page.locator('#' + id); await h.scrollIntoViewIfNeeded(); await h.screenshot({path: path.join(out, `${device}-${mode}-x-${n.replace(/\W+/g, '-')}.png`)}); }
        }
      }
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'card-text-x.json'), JSON.stringify(report, null, 1));
  // Rows whose lines start at more than one x (|dx| 2-24 px from the row's first text line).
  const L = [];
  for (const [k, rows] of Object.entries(report)) for (const r of rows) {
    const xs = r.lines.filter(l => l.top > 4);
    if (!xs.length) continue;
    const base = xs[0].x;
    const off = xs.filter(l => Math.abs(l.x - base) >= 2 && Math.abs(l.x - base) <= 24);
    if (off.length) L.push(`${k}\t${r.name}\tfirst ${xs[0].el}@${base} "${xs[0].text}"\t` + off.map(l => `${l.el}@${l.x} (${l.x - base > 0 ? '+' : ''}${l.x - base}) "${l.text}"`).join(' ; '));
  }
  fs.writeFileSync(path.join(out, 'card-text-x.txt'), L.join('\n') + '\n');
  console.log(L.join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
