'use strict';
// Release 15a, group G2: step 2 mockups. SCRATCH only (G1's prototype.cjs pattern): scratch CSS and DOM dressing
// applied to today's build in the browser, never to the tree. Today and proposed for A05, A06, A07, A11 and A04.1.
// node prototype.cjs <sheet.html> <out folder>      (PW_CHANNEL=msedge while the bundled Chromium crashes)
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const dense = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa/a03-fixtures.json'), 'utf8')).dense;
const DEVICES = {phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, desktop: {viewport: {width: 1440, height: 1000}}};

const CSS = `
/* A05: Missing Limb's select gets the shared field: label above, field font, 44 px touch height, helper gap below. */
html body.g2 .car-page label.chk4531-field.g2-limb { display:flex; flex-direction:column; align-items:flex-start; gap:0; margin:0; }
html body.g2 .car-page label.chk4531-field.g2-limb .g2-lab { display:block; margin-bottom:4px; }
html body.g2 .car-page select.chk4531-limb { font-family:'EB Garamond', serif; font-size:1rem; padding:7px 9px; min-height:44px; min-width:200px;
  border:1px solid var(--line); border-radius:5px; background:#fffdf8; color:var(--ink); text-transform:none; letter-spacing:normal; }
html body.g2 .chk4531-row.g2-limbrow { display:block; }
html body.g2 .chk4531-row.g2-limbrow .chk4531-note { display:block; margin-top:6px; line-height:1.5; }
/* A06: grant actions as one compact group: primary Add, secondary Already added, clear gap; the state beside. */
html body.g2 .g2-grant { display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-top:8px; }
html body.g2 .g2-grant button { min-height:44px; padding:0 16px; margin:0; }
html body.g2 .g2-grant button.g2-primary { background:var(--ink); color:var(--paper); border-color:var(--ink); }
html body.g2 .g2-grant button:hover { opacity:1; }
html body.g2 .g2-state { font-size:.85rem; color:var(--ink-soft); font-style:italic; }
html body.g2 .g2-done { display:block; }
/* A06 r2 (owner, 7 Nov): no tick; the recorded line is plain text and the buttons are gone. */
html body.g2 .supp4540-koku, html body.g2 .wealth4517-status { display:block; }
/* A07: a labelled severity row; the full-moon toggle on its own aligned line; Resist below. */
html body.g2 .g2-k { font-family:'Noto Sans JP', sans-serif; font-size:.66rem; letter-spacing:.09em; text-transform:uppercase; color:var(--ink-soft); margin-right:8px; }
html body.g2 .lm7-moon { display:flex; flex-direction:column; align-items:flex-start; gap:8px; margin-top:8px; }
html body.g2 .car-page label.lm7-tick { display:flex; align-items:center; gap:10px; min-height:44px; margin:0; padding:0;
  font-family:'EB Garamond', serif; font-size:.95rem; letter-spacing:normal; text-transform:none; color:var(--ink); }
html body.g2 .car-page label.lm7-tick input { width:22px; height:22px; margin:0; flex:none; }
html body.g2 .lm7-roll { min-height:44px; margin:0; }
/* A11: helper text gap and line height; card text on one edge in Play. */
html body.g2 .section .grid + .hint { margin-top:6px !important; line-height:1.5; }
html body.g2.pm12-play #advList .entry .en-name, html body.g2.pm12-play #disadvList .entry .en-name,
html body.g2.pm12-play #advList .entry .en-desc, html body.g2.pm12-play #disadvList .entry .en-desc { padding-left:0 !important; padding-right:0 !important; }
/* A04.1: each option's rule inline, in Paragon's option card. */
#advConfigGrid .g2-opt { display:flex !important; align-items:flex-start; gap:8px; min-height:32px; margin:0; padding:4px 6px; border:1px solid var(--line);
  border-radius:6px; font-size:.9rem !important; line-height:1.35; letter-spacing:normal !important; text-transform:none !important; color:var(--ink); cursor:pointer; width:100%; box-sizing:border-box; }
#advConfigGrid .g2-opt { font-family:'Noto Sans JP', sans-serif !important; text-align:left !important; flex-wrap:wrap; background:transparent; }
#advConfigGrid .g2-opt input { flex:none; margin-top:3px; width:13px !important; height:13px !important; }
#advConfigGrid .g2-opt > span { flex:1 1 0; }
#advConfigGrid .g2-opt > span ~ span, #advConfigGrid .g2-opt > span ~ * { flex:1 1 100%; margin-left:21px; color:var(--ink-soft); }
#advConfigGrid :not(fieldset):not(#advConfigGrid):has(> label.g2-opt) { border:0 !important; padding:0 !important; background:none !important; box-shadow:none !important; margin:0 0 6px !important; }
#advConfigGrid .g2-opt > span { min-width:0; overflow-wrap:break-word; }
#advConfigGrid .g2-gone { display:none !important; }
`;
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, tab); await settle(page); };
const setMode = (page, m) => page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), m);

// The scratch dressing: re-applied after every redraw.
async function dress(page, on) {
  await page.evaluate(on => {
    document.body.classList.toggle('g2', on);
    if (!on) return;
    // A05
    for (const sel of document.querySelectorAll('select.chk4531-limb')) {
      const lab = sel.closest('label'); if (!lab || lab.classList.contains('g2-limb')) continue;
      lab.classList.add('g2-limb'); lab.closest('.chk4531-row') && lab.closest('.chk4531-row').classList.add('g2-limbrow');
      const t = [...lab.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (t) { const s = document.createElement('span'); s.className = 'g2-lab'; s.textContent = 'Missing limb'; t.replaceWith(s); }
    }
    // A06: Zakyo (supp4540) and Wealthy (wealth4517) grant groups.
    for (const box of document.querySelectorAll('.supp4540-koku, .wealth4517-status')) {
      if (box.dataset.g2) continue; box.dataset.g2 = '1';
      const btns = [...box.querySelectorAll(':scope > button')];
      const text = box.querySelector('span');
      if (!btns.length) { if (text) { text.classList.add('g2-done'); text.classList.remove('adv-config-warn'); } continue; }
      const g = document.createElement('div'); g.className = 'g2-grant';
      btns.forEach((b, i) => { if (i === 0) { b.classList.remove('ghost'); b.classList.add('g2-primary'); } g.appendChild(b); });
      const st = document.createElement('span'); st.className = 'g2-state';
      st.textContent = /Return/.test(btns[0].textContent) ? 'Not settled yet' : 'Not recorded yet';
      g.appendChild(st); box.appendChild(g);
    }
    // A07
    for (const moon of document.querySelectorAll('.lm7-moon')) {
      const row = moon.closest('.adv-config-row'); if (!row || row.dataset.g2) continue; row.dataset.g2 = '1';
      const sum = row.querySelector('.adv-config-summary');
      if (sum) { const k = document.createElement('span'); k.className = 'g2-k'; k.textContent = 'Severity'; sum.prepend(k); }
    }
  }, on);
  await settle(page);
}
async function rowShot(page, name, file) {
  for (const h of await page.$$('#advList .entry, #disadvList .entry')) {
    const nm = await h.evaluate(d => (d.querySelector('.en-name').value || '').trim());
    if (nm === name) { await h.scrollIntoViewIfNeeded(); await settle(page); await h.screenshot({path: path.join(out, file)}); return file; }
  }
  console.error('no row ' + name);
}
async function openPicker(page, kind, name) {
  await page.evaluate(([k, n]) => { const s = document.getElementById(k + 'QuickAdd'); s.value = n; s.dispatchEvent(new Event('change', {bubbles: true})); }, [kind, name]);
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'}); await page.waitForTimeout(150);
}
// A04.1 dressing of an open picker: rule text into the option, Rule disclosure and per-option i removed.
async function inlineRules(page) {
  return page.evaluate(() => {
    const g = document.getElementById('advConfigGrid'); const lens = [];
    for (const input of g.querySelectorAll('input[type=radio], input[type=checkbox]')) {
      const label = input.closest('label'); if (!label) continue;
      const item = label.parentElement;
      const det = label.querySelector('details') || (item && item.querySelector(':scope > details'));
      let rule = det ? (det.querySelector('span') || det).textContent.trim() : '';
      if (!rule) rule = (label.getAttribute('title') || (item && item.getAttribute('title')) || '').trim();
      if (!rule) continue;
      let span = [...label.children].find(c => c.tagName === 'SPAN' && !c.classList.contains('adv-config-info'));
      if (!span) { span = document.createElement('span'); [...label.childNodes].filter(n => n !== input).forEach(n => span.appendChild(n)); label.appendChild(span); }
      span.querySelectorAll('details,.adv-config-info').forEach(n => n.remove());
      const base = span.textContent.trim();
      if (!/—/.test(base)) { const b = document.createElement('b'); b.textContent = base; span.textContent = ''; span.appendChild(b); }
      else if (!span.querySelector('b')) { const [n, ...r] = base.split(' — '); span.textContent = ''; const b = document.createElement('b'); b.textContent = n; span.append(b, ' — ' + r.join(' — ')); }
      span.append((/[.)]$/.test(span.textContent.trim()) || !/—/.test(span.textContent) ? ' — ' : '. ') + rule);
      label.classList.add('g2-opt'); label.removeAttribute('title');
      if (det) det.classList.add('g2-gone');
      lens.push(rule.length);
    }
    g.querySelectorAll('.adv-config-info').forEach(b => { if (b.closest('label,.fb4521-item,.d45-option') || b.previousElementSibling && b.previousElementSibling.matches && b.previousElementSibling.matches('label')) b.classList.add('g2-gone'); });
    g.querySelectorAll('details').forEach(d => d.classList.add('g2-gone'));
    const m = document.querySelector('#advConfigModalOverlay .roll-modal');
    return {lens, scrollH: m.scrollHeight, options: lens.length};
  });
}
async function fullModal(page, file, width) {
  const h = await page.evaluate(() => { const m = document.querySelector('#advConfigModalOverlay .roll-modal'); return m.scrollHeight; });
  await page.setViewportSize({width, height: Math.min(Math.round(h * 1.25) + 300, 6000)}); await settle(page);
  await page.locator('#advConfigModalOverlay .roll-modal').screenshot({path: path.join(out, file)});
  return h;
}

(async () => {
  const browser = await chromium.launch(process.env.PW_CHANNEL ? {channel: process.env.PW_CHANNEL} : {});
  const meta = {pickers: {}};
  try {
    for (const [device, opts] of Object.entries(DEVICES)) {
      const context = await browser.newContext(opts);
      await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
      const page = await context.newPage(); page.setDefaultTimeout(8000);
      await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
      await page.waitForFunction(() => !document.getElementById('l5rSplash'));
      await page.addStyleTag({content: CSS});
      await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d);
        document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); T.MODES12.set('management'); }, dense);
      await goTab(page, 'Adv & Disadv');
      await page.evaluate(() => { for (const d of [...document.querySelectorAll('#advList .entry, #disadvList .entry')])
        if (['Wealthy', 'Lord Moon’s Curse', 'Paragon'].includes((d.querySelector('.en-name').value || '').trim())) d.remove(); window.__L5R_TEST__.recalcAll(); });
      // Wealthy, set up in the "not recorded yet" state (an older save with no receipt): its grant buttons show.
      await openPicker(page, 'adv', 'Wealthy');
      await page.locator('#advConfigRankInput').fill('2');
      await page.locator('#advConfigGrid label', {hasText: 'Add it to my Koku now'}).first().click();
      if (device === 'phone') { await page.locator('#advConfigModalOverlay .roll-modal').screenshot({path: path.join(out, 'phone-picker-Wealthy-today.png')}); }
      await page.locator('#advConfigConfirm').click(); await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
      await page.evaluate(() => { const d = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value.trim() === 'Wealthy');
        const c = JSON.parse(d.dataset.advConfig || '{}'); delete c.wealth4517; d.dataset.advConfig = JSON.stringify(c); window.__L5R_TEST__.recalcAll(); });
      await openPicker(page, 'disadv', 'Lord Moon’s Curse');
      await page.locator('#advConfigGrid label', {hasText: 'Medium'}).first().click();
      await page.locator('#advConfigConfirm').click(); await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
      await openPicker(page, 'adv', 'Paragon');
      await page.locator('#advConfigGrid input[value="Compassion"]').check();
      await page.locator('#advConfigConfirm').click(); await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
      await page.evaluate(() => { const s = document.getElementById('disadvQuickAdd'); s.value = 'Sworn Enemy'; s.dispatchEvent(new Event('change', {bubbles: true})); });
      await page.waitForTimeout(250);
      if (await page.locator('#advConfigModalOverlay').isVisible()) { await page.locator('#advConfigX').click(); await page.waitForTimeout(150); }
      const ROWS = ['Missing Limb', 'Zakyo Toshi Citizen', 'Wealthy', 'Lord Moon’s Curse', 'Sworn Enemy', 'Paragon'];
      for (const mode of ['management', 'play']) {
        await setMode(page, mode); await goTab(page, 'Adv & Disadv');
        for (const on of [false, true]) {
          await dress(page, on);
          for (const n of ROWS) await rowShot(page, n, `${device}-${mode}-${n.replace(/\W+/g, '-')}-${on ? 'new' : 'today'}.png`);
        }
        await dress(page, false);
        // Identity helper text (A11).
        await goTab(page, 'Identity');
        for (const on of [false, true]) {
          await dress(page, on);
          for (const h of await page.$$('.section .hint')) {
            const t = await h.evaluate(e => e.textContent.trim());
            if (!/^Insight =|^Spent XP is/.test(t)) continue;
            const box = await h.evaluate(e => { const p = e.previousElementSibling.getBoundingClientRect(), b = e.getBoundingClientRect();
              return {x: Math.max(0, Math.min(p.left, b.left) - 8), y: p.top + p.height - Math.min(110, p.height) - 8, w: Math.max(p.width, b.width) + 16, bottom: b.bottom + 8}; });
            await h.scrollIntoViewIfNeeded(); await settle(page);
            const bb = await h.evaluate(e => { const p = e.previousElementSibling.getBoundingClientRect(), b = e.getBoundingClientRect();
              return {x: Math.max(0, Math.min(p.left, b.left) - 8), y: Math.max(0, p.bottom - 70), width: Math.min(innerWidth, Math.max(p.width, b.width) + 16), height: b.bottom + 10 - Math.max(0, p.bottom - 70)}; });
            await page.screenshot({path: path.join(out, `${device}-${mode}-hint-${t.slice(0, 7).replace(/\W+/g, '')}-${on ? 'new' : 'today'}.png`), clip: bb});
          }
        }
        await dress(page, false);
      }
      // A06 after the tap: Zakyo's Add pressed (proposed look), and the recorded state.
      await setMode(page, 'management'); await goTab(page, 'Adv & Disadv'); await dress(page, true);
      await page.evaluate(() => { const d = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value.trim() === 'Zakyo Toshi Citizen');
        d.querySelector('.g2-primary').click(); });
      await page.waitForTimeout(200); await dress(page, true);
      await rowShot(page, 'Zakyo Toshi Citizen', `${device}-management-Zakyo-Toshi-Citizen-new-done.png`);
      await dress(page, false);
      await rowShot(page, 'Zakyo Toshi Citizen', `${device}-management-Zakyo-Toshi-Citizen-today-done.png`);
      // A04.1: the five pickers, plus Paragon as the reference.
      await setMode(page, 'management'); await goTab(page, 'Adv & Disadv');
      const P = [['adv', 'Seven Fortunes’ Blessing'], ['disadv', 'Seven Fortunes’ Curse'], ['disadv', 'Consumed'], ['disadv', 'Failure of Bushido'], ['disadv', 'Cursed by the Realm'], ['adv', 'Paragon']];
      const W = opts.viewport.width, H = opts.viewport.height;
      for (const [kind, name] of P) {
        if (device === 'desktop' && !/Blessing|Cursed/.test(name)) continue;
        const slug = name.replace(/\W+/g, '-');
        await openPicker(page, kind, name);
        await page.screenshot({path: path.join(out, `${device}-picker-${slug}-today-screen.png`)});
        const today = await fullModal(page, `${device}-picker-${slug}-today-full.png`, W);
        await page.setViewportSize({width: W, height: H});
        let info = {};
        if (name !== 'Paragon') {
          info = await inlineRules(page); await settle(page);
          await page.screenshot({path: path.join(out, `${device}-picker-${slug}-new-screen.png`)});
          info.newH = await fullModal(page, `${device}-picker-${slug}-new-full.png`, W);
          await page.setViewportSize({width: W, height: H});
        }
        meta.pickers[device + ':' + name] = {todayH: today, ...info};
        await page.locator('#advConfigX').click(); await page.waitForTimeout(100);
      }
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'prototype-meta.json'), JSON.stringify(meta, null, 1));
  console.log(JSON.stringify(meta, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
