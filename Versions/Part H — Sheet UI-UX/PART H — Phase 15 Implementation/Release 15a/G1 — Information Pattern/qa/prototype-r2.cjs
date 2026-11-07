'use strict';
// Release 15a, group G1: mockup revision 2 (owner's feedback, 6 Nov). SCRATCH only, like prototype.cjs:
//  - A15 revised: each court is a badge, gold outline on the page colour; tapping it fills it, which MEANS
//    "this court is in session"; tapping it again empties it. No radio dot, no "Court in session" box.
//  - The Mastery list in the Skill information window (the owner's A03 idea, now a fourth unit).
// node prototype-r2.cjs <sheet.html> <out folder>
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const A03QA = path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa');
const dense = JSON.parse(fs.readFileSync(path.join(A03QA, 'a03-fixtures.json'), 'utf8')).dense;

const CSS = `
/* A15 r2: the court badges. Off: gold outline on the page colour. On (in session): filled. */
body.g1-a15b .court4514-courts { display:flex; flex-wrap:wrap; gap:8px; border:0; padding:0; margin:0; }
body.g1-a15b .court4514-court input[type=radio], body.g1-a15b .court4514-session { display:none !important; }
html body.g1-a15b .car-page label.court4514-court { min-height:44px; padding:0 16px; display:inline-flex; align-items:center; border-radius:22px;
  border:1px solid var(--gold) !important; background:var(--paper) !important; font-weight:400 !important; cursor:pointer; }
html body.g1-a15b .car-page label.court4514-court span { color:var(--ink) !important; }
html body.g1-a15b .car-page .court4514-controls.g1-on label.court4514-court.court4514-court-selected { background:var(--g1-fill) !important; border-color:var(--g1-fill) !important; }
html body.g1-a15b .car-page .court4514-controls.g1-on label.court4514-court.court4514-court-selected span { color:var(--g1-text) !important; font-weight:700; }
body.g1-a15b { --g1-fill:var(--gold-dark); --g1-text:var(--paper); }
body.g1-a15b.g1-fill-gold { --g1-fill:var(--gold); --g1-text:var(--paper); }
body.g1-a15b.g1-fill-clan { --g1-fill:var(--shu-dark); --g1-text:var(--paper); }
html body.pm12-play .g1-add-court { display:none; }
body.g1-a15b .g1-add-court { min-height:44px; padding:0 16px; border-radius:22px; border:1px dashed var(--gold); background:transparent; color:var(--ink); font:inherit; text-transform:none !important; letter-spacing:normal !important; }
/* Mastery list in the Skill information window. */
.g1-mastery { margin-top:10px; padding-top:8px; border-top:1px solid var(--line); }
.g1-mastery h4 { margin:0 0 6px; font-size:.78rem; letter-spacing:.06em; text-transform:uppercase; color:var(--ink-soft); font-weight:600; }
.g1-mastery ol { list-style:none; margin:0; padding:0; display:grid; gap:6px; }
.g1-mastery li { display:grid; grid-template-columns:auto 1fr; gap:8px; align-items:baseline; font-size:.9rem; color:#8a8070; }
.g1-mastery li b { font-size:.78rem; white-space:nowrap; border:1px solid var(--line); border-radius:10px; padding:1px 7px; color:var(--ink-soft); font-weight:600; }
.g1-mastery li.g1-reached { color:var(--ink); }
.g1-mastery li.g1-reached b { border-color:var(--shu-dark); color:var(--shu-dark); }
.g1-mastery .g1-none { margin:0; font-size:.9rem; color:var(--ink-soft); }
`;
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function goTab(page, tab) {
  await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, tab); await settle(page);
}
async function shotEl(page, locator, file) { await locator.scrollIntoViewIfNeeded(); await settle(page); await locator.screenshot({path: path.join(out, file)}); return file; }
async function quickAdd(page, name) {
  await page.evaluate(name => { const s = document.getElementById('advQuickAdd'); s.value = name;
    if (s.value !== name) throw Error('Missing catalogue option ' + name); s.dispatchEvent(new Event('change', {bubbles: true})); }, name);
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'});
}
// The scratch A15 dressing, re-applied after every redraw (each change rebuilds the row).
async function dress(page) {
  await page.evaluate(() => {
    document.body.classList.add('g1-a15b');
    for (const box of document.querySelectorAll('.court4514-controls')) {
      const status = box.querySelector('.court4514-status'), on = status.classList.contains('court4514-active');
      box.classList.toggle('g1-on', on);
      box.querySelector('.court4514-legend').textContent = 'Courts: tap the one in session';
      if (!on) status.textContent = status.textContent.replace(/ — .* not in session\.$/, ' — no court in session.');
      const f = box.querySelector('.court4514-courts');
      if (!f.querySelector('.g1-add-court')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'g1-add-court'; b.textContent = '+ Add court'; f.appendChild(b); }
    }
  });
  await settle(page);
}
// Drive the real controls to reach a state: court = name in session, or null for none.
async function session(page, court) {
  await page.evaluate(court => {
    const box = document.querySelector('#advList .court4514-controls');
    const tick = () => box.ownerDocument.querySelector('#advList .court4514-session-box');
    if (court === null) { const t = tick(); if (t.checked) t.click(); return; }
    const label = [...document.querySelectorAll('#advList .court4514-court')].find(l => l.textContent.trim() === court);
    const r = label.querySelector('input'); if (!r.checked) r.click();
    const t = tick(); if (!t.checked) t.click();
  }, court);
  await settle(page);
}
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.addStyleTag({content: CSS});
  await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d);
    document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); }, dense);
  return {context, page};
}
// The Mastery list, drawn from the same data as the card's Mastery notes (the row's .sk-mastery-note).
async function masteries(page) {
  await page.evaluate(() => {
    const ov = document.getElementById('skillInfoModalOverlay');
    const old = ov.querySelector('.g1-mastery'); if (old) old.remove();
    const name = document.getElementById('skillInfoTitle').textContent.trim();
    const row = [...document.querySelectorAll('#skillsBody > tr')].find(tr => tr.querySelector('.sk-name').value.trim() === name);
    const sec = document.createElement('section'); sec.className = 'g1-mastery';
    sec.innerHTML = '<h4>Mastery Abilities</h4>';
    const spans = row ? [...row.querySelectorAll('.sk-mastery-note span')] : [];
    if (!spans.length) { sec.insertAdjacentHTML('beforeend', '<p class="g1-none">This Skill has no Mastery Abilities.</p>'); }
    else {
      const ol = document.createElement('ol');
      for (const s of spans) { const m = s.textContent.match(/^R(\d+)( ✓)?: (.*)$/); if (!m) continue;
        const li = document.createElement('li'); if (m[2]) li.className = 'g1-reached';
        li.innerHTML = '<b></b><span></span>'; li.firstChild.textContent = 'Rank ' + m[1] + (m[2] ? ' · reached' : ''); li.lastChild.textContent = m[3]; ol.appendChild(li); }
      sec.appendChild(ol);
    }
    document.getElementById('skillInfoEmph').after(sec);
  });
  await settle(page);
}

// Revision 3 (owner, 7 Nov): the filled badge takes the Clan's own colour (--shu-dark, which Phase 9 (Part H)
// recolours per Clan). node prototype-r2.cjs <sheet.html> <out folder> clans
async function clans(browser) {
  const report = {};
  for (const [device, opts] of Object.entries({phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2},
    desktop: {viewport: {width: 1440, height: 1000}}})) {
    const {context, page} = await open(browser, opts);
    await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
    await goTab(page, 'Adv & Disadv');
    await quickAdd(page, 'Darling of the Court');
    for (const [i, c] of ['Kyuden Doji', 'Toshi Ranbo', 'Otosan Uchi'].entries()) {
      if (await page.locator('#advConfigGrid .court4514-input').count() <= i) await page.locator('#advConfigGrid .court4514-add').click();
      await page.locator('#advConfigGrid .court4514-input').nth(i).fill(c);
    }
    await page.locator('#advConfigConfirm').click();
    await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
    await page.evaluate(() => document.body.classList.add('g1-fill-clan'));
    const row = () => page.locator('#advList .entry').filter({has: page.locator('.court4514-row')}).first();
    const list = device === 'phone' ? ['Crane', 'Crab', 'Dragon', 'Lion', 'Phoenix', 'Scorpion', 'Unicorn', ''] : ['Crane'];
    for (const clan of list) {
      report[`${device}-${clan || 'none'}`] = await page.evaluate(clan => { const f = document.getElementById('f_clan'); f.value = clan;
        f.dispatchEvent(new Event('change', {bubbles: true})); window.__L5R_TEST__.recalcAll();
        const d = document.createElement('div'); d.style.color = 'var(--shu-dark)'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }, clan);
      await session(page, null); await session(page, 'Kyuden Doji'); await dress(page);
      await shotEl(page, row(), `${device}-court-r3-${clan || 'none'}.png`);
      if (device === 'phone' && clan === 'Crane') {
        await session(page, null); await dress(page); await shotEl(page, row(), `${device}-court-r3-Crane-off.png`);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await goTab(page, 'Adv & Disadv');
        await session(page, 'Kyuden Doji'); await dress(page); await shotEl(page, row(), `${device}-court-r3-Crane-play.png`);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await goTab(page, 'Adv & Disadv');
      }
    }
    await context.close();
  }
  return report;
}

(async () => {
  const browser = await chromium.launch();
  if (process.argv[4] === 'clans') {
    try { const r = await clans(browser); fs.writeFileSync(path.join(out, 'shots-r3.json'), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r, null, 1)); }
    finally { await browser.close(); }
    return;
  }
  const report = {};
  try {
    for (const [device, opts] of Object.entries({phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2},
      desktop: {viewport: {width: 1440, height: 1000}}})) {
      const {context, page} = await open(browser, opts);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      await goTab(page, 'Adv & Disadv');
      await quickAdd(page, 'Darling of the Court');
      for (const [i, c] of ['Kyuden Doji', 'Toshi Ranbo', 'Otosan Uchi'].entries()) {
        if (await page.locator('#advConfigGrid .court4514-input').count() <= i) await page.locator('#advConfigGrid .court4514-add').click();
        await page.locator('#advConfigGrid .court4514-input').nth(i).fill(c);
      }
      await page.locator('#advConfigConfirm').click();
      await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'});
      const row = () => page.locator('#advList .entry').filter({has: page.locator('.court4514-row')}).first();
      // Today, in two states, for the board.
      await session(page, 'Kyuden Doji');
      report[device + '-today'] = await shotEl(page, row(), `${device}-court-r2-today.png`);
      for (const mode of device === 'phone' ? ['management', 'play'] : ['management']) {
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode); await goTab(page, 'Adv & Disadv');
        await session(page, null); await dress(page);
        report[`${device}-${mode}-none`] = await shotEl(page, row(), `${device}-${mode}-court-r2-none.png`);
        await session(page, 'Kyuden Doji'); await dress(page);
        report[`${device}-${mode}-on`] = await shotEl(page, row(), `${device}-${mode}-court-r2-on.png`);
        if (device === 'phone' && mode === 'management') {
          await session(page, 'Toshi Ranbo'); await dress(page);
          report[`${device}-${mode}-moved`] = await shotEl(page, row(), `${device}-${mode}-court-r2-moved.png`);
          await page.evaluate(() => document.body.classList.add('g1-fill-gold'));
          report[`${device}-${mode}-gold`] = await shotEl(page, row(), `${device}-${mode}-court-r2-gold.png`);
          await page.evaluate(() => document.body.classList.remove('g1-fill-gold'));
          report.touch = await page.evaluate(() => [...document.querySelectorAll('#advList .court4514-court, #advList .g1-add-court')].map(e => Math.round(e.getBoundingClientRect().height)));
        }
      }
      // Contrast of the two fills, from the computed colours.
      report[device + '-contrast'] = await page.evaluate(() => {
        const rgb = v => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color.match(/\d+/g).map(Number); d.remove(); return c; };
        const L = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
        const cr = (a, b) => { const [x, y] = [L(rgb(a)), L(rgb(b))].sort((p, q) => q - p); return Math.round((x + 0.05) / (y + 0.05) * 100) / 100; };
        return {deepGoldPaper: cr('var(--gold-dark)', 'var(--paper)'), goldPaper: cr('var(--gold)', 'var(--paper)'), goldInk: cr('var(--gold)', 'var(--ink)'), outlineOnPage: cr('var(--gold)', 'var(--paper)')};
      });
      // The Skill information window: one Skill with a Mastery reached, one with none reached, one with none at all.
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await goTab(page, 'Skills');
      // The audit character reaches no Mastery, so (scratch only) one Skill with several is raised to Rank 5.
      report[device + '-raised'] = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('#skillsBody > tr')];
        if (rows.some(tr => [...tr.querySelectorAll('.sk-mastery-note span')].some(s => / ✓:/.test(s.textContent)))) return null;
        let tr = rows.find(tr => tr.querySelectorAll('.sk-mastery-note span').length >= 2);
        if (!tr) { document.getElementById('btnAddSkill').click(); tr = document.querySelector('#skillsBody > tr:last-child');
          const n = tr.querySelector('.sk-name'); n.value = 'Kenjutsu'; n.dispatchEvent(new Event('change', {bubbles: true})); }
        const r = tr.querySelector('.sk-rank'); r.value = '5'; r.dispatchEvent(new Event('input', {bubbles: true})); r.dispatchEvent(new Event('change', {bubbles: true}));
        window.__L5R_TEST__.recalcAll();
        return tr.querySelector('.sk-name').value + ' to Rank 5';
      });
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await goTab(page, 'Skills');
      const picks = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('#skillsBody > tr')];
        const info = tr => ({i: rows.indexOf(tr), name: tr.querySelector('.sk-name').value.trim(), spans: tr.querySelectorAll('.sk-mastery-note span').length, reached: [...tr.querySelectorAll('.sk-mastery-note span')].filter(s => / ✓:/.test(s.textContent)).length});
        const all = rows.map(info).filter(x => x.name);
        return {reached: all.find(x => x.reached > 0), notYet: all.find(x => x.spans > 0 && x.reached === 0), none: all.find(x => x.spans === 0)};
      });
      report[device + '-skills'] = picks;
      for (const [k, p] of Object.entries(picks)) {
        if (!p) continue;
        const btn = page.locator('#skillsBody > tr').nth(p.i).locator('.sk-info-btn').first();
        await btn.scrollIntoViewIfNeeded(); await btn.click();
        await page.waitForSelector('#skillInfoModalOverlay', {state: 'visible'});
        const modal = page.locator('#skillInfoModalOverlay .roll-modal');
        if (k === 'reached') report[`${device}-skillinfo-today`] = await shotEl(page, modal, `${device}-skillinfo-today.png`);
        await masteries(page);
        report[`${device}-skillinfo-${k}`] = await shotEl(page, modal, `${device}-skillinfo-${k}.png`);
        await page.locator('#skillInfoClose').click();
      }
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'shots-r2.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
