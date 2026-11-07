'use strict';
// Release 15a, group G2 (A05, A06, A07, A11, A04.1): step 1, reproduce on today's build. Read-only.
//  * A04.1: opens EVERY Advantage and Disadvantage picker in the two quick-add lists and records how each
//    explains its options (inline rule text, Phase 4.5.2's "Rule" disclosure, Phase 4.54's per-option i,
//    other info controls), with the phone window's scroll height for the long cases.
//  * A05/A06/A07: Missing Limb, Zakyo Toshi Citizen, Wealthy and Lord Moon's Curse rows, measured and
//    photographed on phone (390 x 844) and desktop (1440 x 1000), Play and Manage.
//  * A11: Insight and Spent XP helper text, and a whole-app read for text that does not line up with the
//    text above it, or sits hard against the field above it, on every tab in both modes and sizes.
// node inventory.cjs <sheet.html> <out folder>
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const A03QA = path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa');
const dense = JSON.parse(fs.readFileSync(path.join(A03QA, 'a03-fixtures.json'), 'utf8')).dense;
const DEVICES = {phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true},
  desktop: {viewport: {width: 1440, height: 1000}}};
const ROWS = [['adv', 'Zakyo Toshi Citizen'], ['adv', 'Wealthy'], ['adv', 'Sworn Enemy'], ['disadv', 'Missing Limb'],
  ['disadv', 'Lord Moon’s Curse'], ['disadv', 'Curse of Hotei'], ['adv', 'Paragon'], ['adv', 'Seven Fortunes’ Blessing']];

async function boot(page) {
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await reset(page);
}
async function reset(page) {
  await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d);
    document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); T.MODES12.set('management'); }, dense);
  await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Adv & Disadv'); await C.whenSettled(); });
}
const overlayOpen = page => page.evaluate(() => { const o = document.getElementById('advConfigModalOverlay'); return !!o && getComputedStyle(o).display !== 'none' && o.offsetParent !== null || (o && getComputedStyle(o).display === 'flex'); });
async function pick(page, kind, name) {
  return page.evaluate(([kind, name]) => { const s = document.getElementById(kind + 'QuickAdd'); s.value = name;
    if (s.value !== name) return false; s.dispatchEvent(new Event('change', {bubbles: true})); return true; }, [kind, name]);
}
// Structure of the open picker: how each option explains itself.
function readPicker() {
  const vis = e => { if (!e) return false; const s = getComputedStyle(e), b = e.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && !e.closest('[hidden]'); };
  const g = document.getElementById('advConfigGrid'), m = document.querySelector('#advConfigModalOverlay .roll-modal') || g;
  const inputs = [...g.querySelectorAll('input[type=radio],input[type=checkbox]')].filter(vis);
  const cards = [...new Set(inputs.map(i => i.closest('label') || i.parentElement))];
  const buttonCards = [...g.querySelectorAll('button')].filter(b => vis(b) && !/info|rm-btn/.test(b.className) && (b.textContent || '').trim().length > 2);
  const opt = c => {
    const clone = c.cloneNode(true); clone.querySelectorAll('details,.adv-config-info,button').forEach(n => n.remove());
    const text = clone.textContent.replace(/\s+/g, ' ').trim();
    const details = [...c.querySelectorAll('details')].filter(vis);
    const info = [...c.querySelectorAll('.adv-config-info,[class*="-info"]')].filter(vis);
    return {cls: String(c.className || c.tagName), len: text.length, text: text.slice(0, 90),
      rule: details.map(d => (d.querySelector('summary') || {}).textContent || '').join('|'), ruleCls: details.map(d => d.className).join('|'),
      info: info.map(i => i.className).join('|'), title: (c.getAttribute('title') || '').length,
      kids: [...c.children].filter(vis).map(k => k.tagName.toLowerCase() + '.' + String(k.className).split(' ')[0]).join(' ')};
  };
  const options = cards.map(opt);
  const gridInfo = [...g.querySelectorAll('.adv-config-info,[class*="-info"]')].filter(vis).map(i => i.className);
  const gridDetails = [...g.querySelectorAll('details')].filter(vis).map(d => d.className + ':' + ((d.querySelector('summary') || {}).textContent || '').trim());
  const selects = [...g.querySelectorAll('select')].filter(vis).map(s => s.className + '[' + s.options.length + ']');
  const steps = [...document.querySelectorAll('#advConfigModalOverlay button')].filter(vis).map(b => (b.id || b.className.split(' ')[0]) + ':' + (b.textContent || '').trim().slice(0, 14));
  const mode = options.some(o => o.rule) ? 'disclosure' : options.some(o => o.info) ? 'per-option-i' : options.some(o => o.len > 70) ? 'inline' : options.length ? 'label-only' : selects.length ? 'select' : 'other';
  return {title: (document.getElementById('advConfigTitle') || {}).textContent, mode, nOptions: options.length, nButtonCards: buttonCards.length,
    options: options.slice(0, 14), gridInfo, gridDetails, selects, steps, scrollH: m.scrollHeight, clientH: m.clientHeight,
    gridText: g.innerText.replace(/\s+/g, ' ').slice(0, 600)};
}
// Fill an open picker with a first sensible answer, as G1's inventory did, and confirm (several steps if needed).
async function fillAndConfirm(page) {
  for (let step = 0; step < 6; step++) {
    await page.evaluate(() => { const g = document.getElementById('advConfigGrid'); const seen = new Set();
      for (const r of g.querySelectorAll('input[type=radio]')) { if (seen.has(r.name)) continue; seen.add(r.name); if (!r.disabled) r.click(); }
      for (const s of g.querySelectorAll('select')) { const o = [...s.options].find(o => o.value && !o.disabled); if (o && !s.value) { s.value = o.value; s.dispatchEvent(new Event('change', {bubbles: true})); } }
      for (const t of g.querySelectorAll('input[type=text],input:not([type]),textarea')) if (!t.value) { t.value = 'Doji Ijuro'; t.dispatchEvent(new Event('input', {bubbles: true})); } });
    const c = page.locator('#advConfigConfirm');
    if (!(await c.isVisible())) return;
    if (await c.isDisabled()) { const cbs = page.locator('#advConfigGrid input[type=checkbox]:not(:checked):not(:disabled)'); if (await cbs.count()) await cbs.first().click(); }
    await c.click().catch(() => {});
    await page.waitForTimeout(200);
    if (!(await overlayOpen(page))) return;
  }
  await page.locator('#advConfigX').click().catch(() => {});
}
// A11: text that starts at a different x from the text above it in the same card, or sits hard on a field.
function alignRead() {
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && !e.closest('[hidden],#advConfigModalOverlay'); };
  const ownText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 3);
  const textX = e => { const r = document.createRange(); const n = [...e.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    r.selectNodeContents(n); const b = r.getClientRects()[0]; return b ? b.left : e.getBoundingClientRect().left; };
  const fieldX = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return b.left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft); };
  const lab = e => e.tagName.toLowerCase() + '.' + String(e.className || '').split(' ').filter(Boolean).slice(0, 2).join('.');
  const where = e => { const p = e.closest('.car-page'), en = e.closest('.entry'), card = e.closest('.entry,.card,.field,.section,fieldset,[class*="card"]');
    return (p ? p.getAttribute('data-tab-label') : '') + (en && en.querySelector('.en-name') ? ' / ' + (en.querySelector('.en-name').value || en.querySelector('.en-name').textContent || '').slice(0, 28) : '') + (card ? ' / ' + lab(card) : ''); };
  const page = document.querySelector('.car-page.active,.car-page[aria-hidden="false"]') || document;
  const blocks = [...document.querySelectorAll('.car-page *')].filter(e => vis(e) && ownText(e) && !/^(BUTTON|OPTION|SELECT|SCRIPT|STYLE)$/.test(e.tagName) && !e.closest('button,select'));
  const inView = e => { const b = e.getBoundingClientRect(); return b.right > 0 && b.left < innerWidth; };
  const res = {misaligned: [], tight: []};
  for (const e of blocks.filter(inView)) {
    const card = e.closest('.entry,.card,.field,fieldset,.section,[class*="card"],[class*="box"]') || e.parentElement;
    const b = e.getBoundingClientRect(), x = textX(e);
    // The nearest text block above within the same card, whose vertical gap is small.
    let above = null, best = 1e9;
    for (const o of blocks) { if (o === e || !card.contains(o) || o.contains(e) || e.contains(o)) continue; const ob = o.getBoundingClientRect();
      const gap = b.top - ob.bottom; if (gap >= -2 && gap < 24 && gap < best && Math.abs(ob.left - b.left) < 60) { best = gap; above = o; } }
    if (above) { const dx = Math.round(x - textX(above)); if (Math.abs(dx) >= 3 && Math.abs(dx) <= 24)
      res.misaligned.push({where: where(e), el: lab(e), above: lab(above), dx, text: e.textContent.trim().slice(0, 50), aboveText: above.textContent.trim().slice(0, 40)}); }
    // Small text right under a field.
    const fs = parseFloat(getComputedStyle(e).fontSize);
    const prev = e.previousElementSibling;
    if (prev && vis(prev) && /INPUT|SELECT|TEXTAREA/.test(prev.tagName + (prev.querySelector && prev.querySelector('input,select,textarea') ? 'INPUT' : ''))) {
      const gap = Math.round(b.top - prev.getBoundingClientRect().bottom);
      if (gap < 4) res.tight.push({where: where(e), el: lab(e), after: lab(prev), gap, fs, lh: getComputedStyle(e).lineHeight, text: e.textContent.trim().slice(0, 50)});
    }
  }
  return res;
}
function measureRows(names) {
  const r = e => { const b = e.getBoundingClientRect(), s = getComputedStyle(e);
    return {box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], font: s.fontSize + ' ' + s.fontFamily.split(',')[0], pad: s.padding, mid: Math.round(b.top + b.height / 2)}; };
  const vis = e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed';
  const outp = {};
  for (const d of document.querySelectorAll('#advList .entry, #disadvList .entry')) {
    const nm = (d.querySelector('.en-name') || {}).value || (d.querySelector('.en-name') || {}).textContent || '';
    const hit = names.find(n => nm.trim() === n); if (!hit) continue;
    const ctl = [...d.querySelectorAll('button,select,input,label,.lm7-moon,.lm7-tick,[class*="wealth4517"],[class*="zakyo"],[class*="chk4531"],[class*="d45-summary"],[class*="desc"],[class*="summary"]')].filter(vis);
    outp[hit] = {row: r(d), parts: ctl.slice(0, 30).map(e => ({el: e.tagName.toLowerCase() + '.' + String(e.className).split(' ').slice(0, 2).join('.'), text: (e.textContent || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 40), ...r(e)})), id: d.id};
  }
  for (const id of ['f_insightBonus', 'f_insightToNextRank']) { const e = document.getElementById(id); if (e) { const h = e.closest('.grid,.row,div').parentElement.querySelector('.hint'); outp[id] = {field: r(e), hint: h ? {...r(h), gap: Math.round(h.getBoundingClientRect().top - e.getBoundingClientRect().bottom), lh: getComputedStyle(h).lineHeight} : null}; } }
  const sx = [...document.querySelectorAll('.hint')].find(h => /Spent XP is calculated/.test(h.textContent));
  if (sx) { const prev = sx.previousElementSibling; outp.spentXP = {hint: {...r(sx), lh: getComputedStyle(sx).lineHeight, gap: prev ? Math.round(sx.getBoundingClientRect().top - prev.getBoundingClientRect().bottom) : null, prev: prev ? prev.tagName + '.' + prev.className : ''}}; }
  return outp;
}

(async () => {
  
  const browser = await chromium.launch(process.env.PW_CHANNEL ? {channel: process.env.PW_CHANNEL} : {});
  const report = {sheet, pickers: [], rows: {}, align: {}, direct: []};

  try {
    for (const [device, opts] of Object.entries(DEVICES)) {
      const context = await browser.newContext(opts);
      await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
      const page = await context.newPage(); page.setDefaultTimeout(8000);
      const errors = []; page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
      await boot(page);
      // A04.1: every picker (phone only for the full catalogue; desktop repeats the long ones for the boards).
      const lists = await page.evaluate(() => ['adv', 'disadv'].map(k => [k, [...document.getElementById(k + 'QuickAdd').options].map(o => o.value).filter(Boolean)]));
      for (const [kind, names] of lists) for (const name of names) {
        if (device === 'desktop' && !report.pickers.some(p => p.name === name && p.device === 'phone' && (p.nOptions > 3 || p.scrollH > 900))) continue;
        try {
          if (!(await pick(page, kind, name))) continue;
          await page.waitForTimeout(120);
          if (!(await overlayOpen(page))) { if (device === 'phone') report.direct.push(kind + ':' + name); await reset(page); continue; }
          const rec = {device, kind, name, ...(await page.evaluate(readPicker))};
          if (rec.nOptions > 3 || rec.scrollH > 900 || rec.mode !== 'label-only') await page.screenshot({path: path.join(out, `${device}-picker-${name.replace(/\W+/g, '-')}.png`)});
          report.pickers.push(rec);
          await page.locator('#advConfigX').click().catch(() => {});
          await page.waitForTimeout(60);
          if (await overlayOpen(page)) await reset(page);
        } catch (e) { report.pickers.push({device, kind, name, error: String(e).slice(0, 200)}); await reset(page).catch(() => {}); }
      }
      await reset(page);
      // A05/A06/A07/A11 rows.
      for (const [kind, name] of ROWS) {
        if (!(await pick(page, kind, name))) { report.rows['missing:' + name] = true; continue; }
        await page.waitForTimeout(150);
        if (await overlayOpen(page)) await fillAndConfirm(page);
      }
      for (const mode of ['management', 'play']) {
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode);
        await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Adv & Disadv'); await C.whenSettled(); });
        await page.waitForTimeout(150);
        report.rows[device + '/' + mode] = await page.evaluate(measureRows, ROWS.map(r => r[1]));
        for (const [, name] of ROWS) {
          const row = page.locator('#advList .entry, #disadvList .entry').filter({has: page.locator('.en-name')}).filter({hasText: ''});
          const id = (report.rows[device + '/' + mode][name] || {}).id;
          const loc = id ? page.locator('#' + id) : null;
          const all = await page.$$('#advList .entry, #disadvList .entry');
          for (const h of all) { const nm = await h.evaluate(d => ((d.querySelector('.en-name') || {}).value || (d.querySelector('.en-name') || {}).textContent || '').trim());
            if (nm === name) { await h.scrollIntoViewIfNeeded(); await h.screenshot({path: path.join(out, `${device}-${mode}-row-${name.replace(/\W+/g, '-')}.png`)}); break; } }
        }
        // Whole-app read on every tab.
        const tabs = await page.evaluate(() => [...document.querySelectorAll('.car-page')].map(p => p.getAttribute('data-tab-label')).filter(Boolean));
        for (const tab of tabs) {
          await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, tab);
          await page.waitForTimeout(80);
          const a = await page.evaluate(alignRead);
          report.align[device + '/' + mode + '/' + tab] = a;
          if (/Identity|Character|Profile/.test(tab) && mode === 'management') await page.screenshot({path: path.join(out, `${device}-${mode}-${tab.replace(/\W+/g, '-')}.png`), fullPage: false});
        }
      }
      report.errors = (report.errors || []).concat(errors.map(e => device + ': ' + e));
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify(report, null, 1));
  // Summary.
  const L = [];
  L.push('PICKERS (phone): mode | options | scrollH | gridInfo | details | name');
  for (const p of report.pickers.filter(p => p.device === 'phone')) L.push(`${p.error ? 'ERROR' : p.mode}\t${p.nOptions}\t${p.scrollH}\t${(p.gridInfo || []).length}\t${(p.gridDetails || []).length}\t${p.kind}:${p.name}${p.error ? ' ' + p.error : ''}`);
  L.push('\nDIRECT ADD (no picker): ' + report.direct.length);
  const agg = {};
  for (const [k, a] of Object.entries(report.align)) for (const m of a.misaligned) { const key = m.where.replace(/^[^/]*\/ ?/, '') + ' | ' + m.el + ' vs ' + m.above + ' dx=' + m.dx; (agg[key] = agg[key] || new Set()).add(k.split('/').slice(0, 2).join('/') + ':' + m.text.slice(0, 30)); }
  L.push('\nMISALIGNED TEXT (|dx| 3–24 px)');
  for (const [k, v] of Object.entries(agg).sort()) L.push(k + '\t' + [...v].slice(0, 4).join(' ; '));
  const tg = {};
  for (const [k, a] of Object.entries(report.align)) for (const t of a.tight) { const key = t.where + ' | ' + t.el + ' after ' + t.after + ' gap=' + t.gap + ' fs=' + t.fs + ' lh=' + t.lh; (tg[key] = tg[key] || new Set()).add(k.split('/').slice(0, 2).join('/')); }
  L.push('\nTIGHT HELPER TEXT (gap < 4 px under a field)');
  for (const [k, v] of Object.entries(tg).sort()) L.push(k + '\t' + [...v].join(','));
  L.push('\nERRORS\n' + (report.errors || []).join('\n'));
  fs.writeFileSync(path.join(out, 'summary.txt'), L.join('\n') + '\n');
  console.log(L.join('\n').slice(0, 20000));
})().catch(e => { console.error(e); process.exit(1); });
