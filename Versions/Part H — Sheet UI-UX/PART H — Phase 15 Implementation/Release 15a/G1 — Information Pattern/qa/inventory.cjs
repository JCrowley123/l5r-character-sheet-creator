'use strict';
// Release 15a, group G1 (A04, A15, A16): step 1, reproduce on today's build.
// Inventories every information treatment (gold italic I, circled i, eye, question mark), every
// control nested inside another control, the seven legacy pickers' bottom i, and the court row.
// Phone (390 x 844, touch) and desktop (1440 x 1000), Play and Manage, on the dense audit character
// plus the seven picker Advantages, Darling of the Court among them.
// node inventory.cjs <sheet.html> <out folder>      (read-only: it changes nothing in the tree)
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const A03QA = path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa');
const dense = JSON.parse(fs.readFileSync(path.join(A03QA, 'a03-fixtures.json'), 'utf8')).dense;
const DEVICES = {phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true},
  desktop: {viewport: {width: 1440, height: 1000}}};
// The seven pickers named by the 24 September device audit (S1, S2): catalogue ID -> name.
const SEVEN = [['A01', 'Seven Fortunes’ Blessing', 'fb4521-info'], ['A03', 'Dark Paragon', 'dp4523-info'],
  ['A04', 'Darling of the Court', 'court4514-info'], ['A09', 'Paragon', 'p4518-info'],
  ['A12', 'Soul of Artistry', 'sa4519-info'], ['A13', 'Touch of the Spirit Realms', 'tr4524-info'],
  ['A14', 'Void Versatility', 'vv4520-info']];

// Owner layer of a class: the source fragment(s) that create it.
const SRC = path.resolve(sheet, '..', 'src');
const srcFiles = [];
(function walk(d) { if (!fs.existsSync(d)) return; for (const f of fs.readdirSync(d)) { const p = path.join(d, f);
  if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(js|html|css)$/.test(f)) srcFiles.push(p); } })(SRC);
const srcText = Object.fromEntries(srcFiles.map(p => [path.relative(SRC, p).replace(/\\/g, '/'), fs.readFileSync(p, 'utf8')]));
function owners(cls) {
  if (!cls) return [];
  return Object.entries(srcText).filter(([f, t]) => !/\.css$/.test(f) && t.includes(cls)).map(([f]) => f).slice(0, 4);
}

function scan() {
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && (typeof e.checkVisibility !== 'function' || e.checkVisibility({visibilityProperty: true})); };
  const pseudo = (e, w) => { const c = getComputedStyle(e, w).content; return c && c !== 'none' && c !== 'normal' ? c : ''; };
  const glyph = e => (e.textContent || '').trim() || pseudo(e, '::after').replace(/^"|"$/g, '') || pseudo(e, '::before').replace(/^"|"$/g, '');
  const INFO_GLYPH = /^(i|I|ⓘ|ℹ|ℹ️|\?|❔|👁|👁️|👁‍🗨)$/u;
  const ctl = 'button,[role=button],a[href],input,select,textarea,summary';
  const found = [];
  for (const e of document.querySelectorAll(ctl + ',.info-btn,[class*="-info"],[class*="info-"],[class*="tooltip"]')) {
    if (!vis(e)) continue;
    const g = glyph(e), cls = String(e.className || ''), lab = e.getAttribute('aria-label') || '', title = e.getAttribute('title') || '';
    if (e === document.body || /^vr-/.test(cls)) continue;   // a class on body; Phase 5's severity badges are not controls
    const isInfo = INFO_GLYPH.test(g) || /info|tooltip|help|explain|diag/i.test(cls) || /information|explain|why can|help/i.test(lab);
    if (!isInfo) continue;
    const s = getComputedStyle(e), b = e.getBoundingClientRect();
    const host = e.parentElement && e.parentElement.closest(ctl + ',label');
    const page = e.closest('.car-page'), modal = e.closest('[id$="Overlay"],[id$="Modal"],.modal,[role=dialog]');
    found.push({where: modal ? '#' + (modal.id || modal.className) : page ? page.getAttribute('data-tab-label') || page.id : (e.closest('[id]') || {}).id || '',
      tag: e.tagName.toLowerCase(), cls, id: e.id || '', glyph: g.slice(0, 12), text: (e.textContent || '').trim().slice(0, 30),
      after: pseudo(e, '::after').slice(0, 12), before: pseudo(e, '::before').slice(0, 12),
      style: s.fontStyle + ' ' + s.fontWeight + ' ' + s.color + ' r=' + s.borderRadius, w: Math.round(b.width), h: Math.round(b.height),
      label: lab.slice(0, 60), title: title.slice(0, 60), role: e.getAttribute('role') || '',
      nestedIn: host ? host.tagName.toLowerCase() + '.' + String(host.className || '').split(' ')[0] : '',
      row: (e.closest('.entry,tr,li') || {}).className || '',
      rowName: ((e.closest('.entry') || {}).querySelector ? (e.closest('.entry').querySelector('.en-name') || {}).value || '' : (e.closest('tr') && e.closest('tr').querySelector('.sk-name') ? e.closest('tr').querySelector('.sk-name').value : '')).slice(0, 30),
      hostTitle: host ? (host.getAttribute('title') || '').slice(0, 50) : ''});
  }
  // Every control nested inside another control (button in button, control in a label that has two).
  const nested = [];
  for (const e of document.querySelectorAll(ctl)) {
    if (!vis(e)) continue;
    const host = e.parentElement && e.parentElement.closest('button,[role=button],a[href],summary');
    if (host) nested.push({inner: e.tagName.toLowerCase() + '.' + String(e.className || '').split(' ')[0], innerGlyph: glyph(e).slice(0, 12),
      host: host.tagName.toLowerCase() + '.' + String(host.className || '').split(' ')[0], hostText: (host.textContent || '').trim().slice(0, 40),
      where: (e.closest('.car-page') || {getAttribute: () => ''}).getAttribute('data-tab-label') || (e.closest('[id]') || {}).id || ''});
  }
  return {found, nested};
}

async function quickAdd(page, name) {
  await page.evaluate(name => { const s = document.getElementById('advQuickAdd'); s.value = name;
    if (s.value !== name) throw Error('Missing catalogue option ' + name); s.dispatchEvent(new Event('change', {bubbles: true})); }, name);
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'});
}
// Fill the open picker with its first sensible answer, the way a player would.
async function fillPicker(page, name) {
  if (name === 'Darling of the Court') {
    for (const [i, c] of ['Kyuden Bayushi', 'Toshi Ranbo'].entries()) {
      if (await page.locator('#advConfigGrid .court4514-input').count() <= i) await page.locator('#advConfigGrid .court4514-add').click();
      await page.locator('#advConfigGrid .court4514-input').nth(i).fill(c);
    }
    return;
  }
  await page.evaluate(() => {
    const g = document.getElementById('advConfigGrid');
    const seen = new Set();
    for (const r of g.querySelectorAll('input[type=radio]')) { if (seen.has(r.name)) continue; seen.add(r.name); if (!r.disabled) { r.click(); } }
    for (const s of g.querySelectorAll('select')) { const o = [...s.options].find(o => o.value && !o.disabled); if (o) { s.value = o.value; s.dispatchEvent(new Event('change', {bubbles: true})); } }
    for (const t of g.querySelectorAll('input[type=text],input:not([type]),textarea')) if (!t.value) { t.value = 'Lore: History'; t.dispatchEvent(new Event('input', {bubbles: true})); }
  });
}
async function infoText(page, locator) {
  await locator.click();
  await page.waitForSelector('#stanceInfoOverlay', {state: 'visible'});
  const t = await page.evaluate(() => ({title: document.getElementById('stanceInfoTitle').textContent,
    sub: document.getElementById('stanceInfoRing').textContent, body: document.getElementById('stanceInfoBody').textContent}));
  await page.evaluate(() => { document.getElementById('stanceInfoOverlay').style.display = 'none'; });
  return t;
}
const sentences = t => t.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 12);
const norm = s => s.replace(/[’‘]/g, "'").replace(/[—–]/g, '-').replace(/\s+/g, ' ').toLowerCase();

(async () => {
  const browser = await chromium.launch();
  const report = {sheet, pickers: [], states: []};
  try {
    for (const [device, opts] of Object.entries(DEVICES)) {
      const context = await browser.newContext(opts);
      await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
      const page = await context.newPage(); page.setDefaultTimeout(15000);
      const errors = []; page.on('pageerror', e => errors.push(String(e)));
      await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
      await page.waitForFunction(() => !document.getElementById('l5rSplash'));
      await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d);
        document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); }, dense);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Adv & Disadv'); await C.whenSettled(); });
      // The seven pickers: open each, record its bottom i and what only that panel says, then confirm.
      for (const [id, name, cls] of SEVEN) {
        const rec = {device, id, name, cls};
        try {
          await quickAdd(page, name);
          await page.waitForTimeout(150);
          const grid = page.locator('#advConfigGrid');
          rec.gridInfo = await grid.locator('.' + cls).count();
          rec.gridButtons = await page.evaluate(() => [...document.querySelectorAll('#advConfigModalOverlay button')].filter(b => b.offsetParent)
            .map(b => (b.className || b.id) + ':' + (b.textContent || '').trim().slice(0, 18)));
          rec.gridText = (await page.evaluate(() => { const m = document.querySelector('#advConfigModalOverlay .roll-modal'); const c = m.cloneNode(true);
            c.querySelectorAll('.' + 'g1-none').forEach(n => n.remove()); return [...c.querySelectorAll('#advConfigTitle,#advConfigSubtitle,#advConfigGrid,#advConfigNote')].filter(e => e.id !== 'advConfigNote' || m.querySelector('#advConfigNote').style.display !== 'none').map(e => e.textContent).join(' '); })).replace(/\s+/g, ' ').slice(0, 8000);
          await page.screenshot({path: path.join(out, `${device}-picker-${id}.png`)});
          if (rec.gridInfo) {
            const t = await infoText(page, grid.locator('.' + cls).last());
            rec.panel = t;
            const pageText = norm(rec.gridText);
            rec.panelOnly = sentences(t.body).filter(s => !pageText.includes(norm(s).slice(0, 40)));
          }
          await fillPicker(page, name);
          await page.locator('#advConfigConfirm').click();
          await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'}).catch(() => {});
          rec.closed = !(await page.locator('#advConfigModalOverlay').isVisible());
          if (!rec.closed) { rec.stillOpenText = (await grid.innerText()).slice(0, 300); await page.locator('#advConfigX').click(); }
          const row = page.locator('#advList .entry').last();
          rec.rowText = (await row.innerText()).slice(0, 600);
          rec.rowInfo = await row.locator('.' + cls).count();
          if (rec.rowInfo) { const t = await infoText(page, row.locator('.' + cls).first()); const rt = norm(rec.rowText);
            rec.rowPanelSame = t.body === (rec.panel || {}).body;
            rec.panelOnlyVsRow = (rec.panelOnly || []).filter(s => !rt.includes(norm(s).slice(0, 40)) && !t.body.includes(s)); }
        } catch (e) { rec.error = String(e).slice(0, 300); try { await page.locator('#advConfigX').click({timeout: 1000}); } catch (x) {} }
        report.pickers.push(rec);
      }
      // The court row (A15).
      report.court = report.court || {};
      report.court[device] = await page.evaluate(() => {
        const row = [...document.querySelectorAll('#advList .entry')].find(d => /Darling of the Court/.test(d.querySelector('.en-name').value));
        if (!row) return null;
        const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; };
        return {html: row.querySelector('.adv-config-row') ? row.querySelector('.adv-config-row').outerHTML.slice(0, 3000) : '',
          chips: [...row.querySelectorAll('.court4514-courts label, .court4514-courts input')].map(e => e.tagName + '.' + e.className + ' ' + r(e).join('x') + ' ' + (e.textContent || e.value || '').trim()),
          controls: [...row.querySelectorAll('button,input,select')].filter(e => e.offsetParent).map(e => e.tagName.toLowerCase() + '.' + e.className.split(' ')[0] + ' ' + r(e).join('x') + ' ' + ((e.textContent || '').trim() || e.type))};
      });
      for (const mode of ['play', 'management']) {
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode);
        const tabs = await page.evaluate(() => [...document.querySelectorAll('.car-page')].map(p => p.getAttribute('data-tab-label')).filter(Boolean));
        for (const tab of tabs) {
          await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, tab);
          await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
          const s = await page.evaluate(l => { const p = document.querySelector('.car-page[data-tab-label="' + l + '"]');
            const keep = p.style.display; return keep; }, tab);
          const res = await page.evaluate(scan);
          if (tab === tabs[0]) report.states.push({device, mode, tab: 'all', ...res});
          if (device === 'phone' && /Skills|Adv|Spell|Techniques|Combat/.test(tab)) await page.screenshot({path: path.join(out, `${device}-${mode}-${tab.replace(/\W+/g, '-')}.png`)});
        }
      }
      // The Skill eye's window (A03's suggestion): what it shows today.
      await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C.goToTab('Skills'); await C.whenSettled(); });
      const eye = page.locator('#skillsBody .sk-info-btn').first();
      if (await eye.count()) { await eye.click(); await page.waitForTimeout(300);
        report.skillInfo = report.skillInfo || {};
        report.skillInfo[device] = await page.evaluate(() => { const o = [...document.querySelectorAll('[id$="Overlay"],[role=dialog]')].find(e => e.offsetParent || getComputedStyle(e).display === 'flex');
          return o ? {id: o.id, text: o.innerText.slice(0, 2500), buttons: [...o.querySelectorAll('button')].map(b => b.textContent.trim().slice(0, 30))} : null; });
        await page.screenshot({path: path.join(out, `${device}-skill-info.png`)});
        await page.keyboard.press('Escape'); }
      report.errors = (report.errors || []).concat(errors.map(e => device + ': ' + e));
      await context.close();
    }
  } finally { await browser.close(); }
  // Attribute owner layers.
  const classes = new Set();
  for (const s of report.states) for (const f of s.found) for (const c of f.cls.split(/\s+/)) if (c) classes.add(c);
  report.owners = Object.fromEntries([...classes].map(c => [c, owners(c)]));
  fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify(report, null, 1));
  // Summary: distinct treatments.
  const key = f => [f.tag, f.cls, f.glyph, f.after, f.style.split(' ')[0]].join(' | ');
  const distinct = {};
  for (const s of report.states) for (const f of s.found) { const k = key(f); (distinct[k] = distinct[k] || {n: 0, where: new Set(), nestedIn: new Set(), size: new Set(), label: f.label}).n++;
    distinct[k].where.add(s.device[0] + '/' + s.mode[0] + '/' + f.where + (f.rowName ? ':' + f.rowName : '')); if (f.nestedIn) distinct[k].nestedIn.add(f.nestedIn); distinct[k].size.add(f.w + 'x' + f.h); }
  const lines = Object.entries(distinct).sort().map(([k, v]) => `${v.n}\t${k}\tlabel=${v.label}\tnested=${[...v.nestedIn].join(',')}\tsizes=${[...v.size].slice(0, 4).join(',')}\twhere=${[...v.where].slice(0, 40).join(',')}`);
  const nests = {};
  for (const s of report.states) for (const n of s.nested) { const k = s.device + '/' + s.mode + ' ' + n.inner + ' [' + n.innerGlyph + '] in ' + n.host + ' "' + n.hostText.replace(/\s+/g, ' ') + '" @' + n.where; nests[k] = (nests[k] || 0) + 1; }
  fs.writeFileSync(path.join(out, 'summary.txt'), 'DISTINCT INFO TREATMENTS\n' + lines.join('\n') + '\n\nNESTED CONTROLS\n' +
    Object.entries(nests).map(([k, n]) => n + '\t' + k).join('\n') + '\n\nPICKERS\n' +
    report.pickers.map(p => `${p.device} ${p.id} ${p.name}: gridInfo=${p.gridInfo} rowInfo=${p.rowInfo} closed=${p.closed} samePanel=${p.rowPanelSame} panelOnly=${JSON.stringify(p.panelOnly || [])} vsRow=${JSON.stringify(p.panelOnlyVsRow || [])}${p.error ? ' ERROR ' + p.error : ''}`).join('\n') +
    '\n\nERRORS\n' + (report.errors || []).join('\n') + '\n');
  console.log(fs.readFileSync(path.join(out, 'summary.txt'), 'utf8'));
})().catch(e => { console.error(e); process.exit(1); });
