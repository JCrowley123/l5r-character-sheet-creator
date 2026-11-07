'use strict';
// Release 15a, group G1: step 2, mockups. A SCRATCH prototype on today's build: it injects CSS and a
// little DOM into a loaded page and screenshots "today" beside "proposed". Nothing here ships; the
// build that follows an approval is written as removable layers in src/.
// node prototype.cjs <sheet.html> <out folder>
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [sheet, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const A03QA = path.resolve(__dirname, '../../A03 — Top-Aligned Columns and Compact Skill Cards/qa');
const dense = JSON.parse(fs.readFileSync(path.join(A03QA, 'a03-fixtures.json'), 'utf8')).dense;
const SEVEN = [['A01', 'Seven Fortunes’ Blessing', 'fb4521-info'], ['A03', 'Dark Paragon', 'dp4523-info'],
  ['A04', 'Darling of the Court', 'court4514-info'], ['A09', 'Paragon', 'p4518-info'],
  ['A12', 'Soul of Artistry', 'sa4519-info'], ['A13', 'Touch of the Spirit Realms', 'tr4524-info'],
  ['A14', 'Void Versatility', 'vv4520-info']];

// ---- The proposals, as scratch CSS/JS ----
const I_CSS = `
/* A04: one information control -- the A01-A16 circled i (28 px ring in the ink colour, upright serif i),
   with a 44 px touch area drawn by ::before. */
html body.g1-a04 .sk-info-btn, html body.g1-a04 .void-eye-btn, html body.g1-a04 .adv-config-info {
  text-transform:none !important; letter-spacing:normal !important; align-self:center !important; justify-self:end !important; max-height:28px !important; min-height:28px !important;
  width:28px !important; min-width:28px !important; height:28px !important; padding:0 !important; margin:0 0 0 6px !important;
  display:inline-flex !important; align-items:center; justify-content:center; position:relative; flex:0 0 auto;
  border:1px solid currentColor !important; border-radius:50% !important; background:transparent !important;
  color:var(--ink) !important; font-family:Georgia, serif !important; font-size:0 !important; line-height:1 !important; }
html body.g1-a04 .sk-info-btn::after, html body.g1-a04 .void-eye-btn::after { content:'i'; text-transform:none; font-size:17px; font-style:normal; font-weight:400; }
body.g1-a04 .adv-config-info::after { font-size:17px !important; font-style:normal !important; font-weight:400 !important; }
body.g1-a04 .sk-info-btn::before, body.g1-a04 .void-eye-btn::before, body.g1-a04 .adv-config-info::before { content:''; position:absolute; inset:-8px; }
body.g1-a04 .g1-hidden { display:none !important; }
/* A15: whole court chips as 44 px selection controls; Add court on the row. */
body.g1-a15 .court4514-courts { display:flex; flex-wrap:wrap; gap:8px; border:0; padding:0; margin:0; }
html body.g1-a15 .car-page label.court4514-court { min-height:44px; padding:0 16px; display:inline-flex; align-items:center; gap:0; border-radius:22px;
  border:1px solid var(--gold) !important; background:var(--paper) !important; cursor:pointer; position:relative; }
body.g1-a15 .court4514-court input[type=radio] { position:absolute; opacity:0; inset:0; margin:0; width:100%; height:100%; cursor:pointer; }
html body.g1-a15 .car-page label.court4514-court.court4514-court-selected { background:var(--ink) !important; border-color:var(--ink) !important; }
html body.g1-a15 .car-page label.court4514-court.court4514-court-selected span { color:var(--paper) !important; }
html body.g1-a15 .car-page label.court4514-court.court4514-court-selected span::before { content:'✓ '; }
body.g1-a15 .court4514-court:focus-within { outline:2px solid var(--shu); outline-offset:2px; }
html body.pm12-play .g1-add-court { display:none; }
body.g1-a15 .g1-add-court { min-height:44px; padding:0 16px; border-radius:22px; border:1px dashed var(--gold); background:transparent; color:var(--ink); font:inherit; }
html body.g1-a15 .car-page label.court4514-session { font-size:14px !important; text-transform:none !important; letter-spacing:normal !important; min-height:44px; display:inline-flex; align-items:center; gap:8px; }
body.g1-a15 .court4514-session input { width:22px; height:22px; }
/* A16: the seven pickers' bottom i. */
body.g1-a16-remove #advConfigGrid .g1-seven-info, body.g1-a16-move #advConfigGrid .g1-seven-info { display:none !important; }
body.g1-a16-move #advConfigTitle { display:flex; align-items:center; gap:8px; }
`;
async function a04(page) {
  await page.evaluate(() => {
    document.body.classList.add('g1-a04');
    // No information button inside another control: move each to just after its host.
    for (const b of document.querySelectorAll('.adv-config-info')) { const host = b.parentElement.closest('button,[role=button],a[href],summary'); if (host) host.after(b); }
    // Hotei: keep the choice, its cost and the live effect visible; the rule and the notes go behind the row's i.
    const row = [...document.querySelectorAll('#disadvList .entry')].find(d => /Seven Fortunes/.test(d.querySelector('.en-name').value));
    const cr = row && row.querySelector('.adv-config-row');
    if (cr && !cr.querySelector('.g1-hotei-state')) {
      const sum = cr.querySelector('.d45-summary'), notes = [...cr.querySelectorAll('.hotei4536-note, .ht7-note')];
      const all = [sum.textContent].concat(notes.map(n => n.textContent)).join(' / ');
      sum.classList.add('g1-hidden'); notes.forEach(n => n.classList.add('g1-hidden'));
      const i = document.createElement('button'); i.type = 'button'; i.className = 'adv-config-info'; i.setAttribute('aria-label', 'Seven Fortunes’ Curse information'); i.dataset.g1Body = all;
      const s = document.createElement('span'); s.className = 'g1-hotei-state'; s.style.cssText = 'flex:1 1 100%; font-size:14px; margin-top:6px;';
      s.textContent = 'Techniques and Advantages cost 2 Void Points to activate. 6 XP.';
      cr.querySelector('.fortune4511-badge').after(i); cr.appendChild(s);
    }
  });
}
async function a15(page) {
  await page.evaluate(() => {
    document.body.classList.add('g1-a15');
    for (const f of document.querySelectorAll('.court4514-courts')) if (!f.parentElement.querySelector('.g1-add-court')) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'g1-add-court'; b.textContent = '+ Add court';
      f.appendChild(b);
    }
  });
}

async function quickAdd(page, name) {
  await page.evaluate(name => { const s = document.getElementById('advQuickAdd'); s.value = name;
    if (s.value !== name) throw Error('Missing catalogue option ' + name); s.dispatchEvent(new Event('change', {bubbles: true})); }, name);
  await page.waitForSelector('#advConfigModalOverlay', {state: 'visible'});
}
async function fillPicker(page, name) {
  if (name === 'Darling of the Court') {
    for (const [i, c] of ['Kyuden Bayushi', 'Toshi Ranbo'].entries()) {
      if (await page.locator('#advConfigGrid .court4514-input').count() <= i) await page.locator('#advConfigGrid .court4514-add').click();
      await page.locator('#advConfigGrid .court4514-input').nth(i).fill(c);
    }
    return;
  }
  await page.evaluate(() => {
    const g = document.getElementById('advConfigGrid'), seen = new Set();
    for (const r of g.querySelectorAll('input[type=radio]')) { if (seen.has(r.name)) continue; seen.add(r.name); if (!r.disabled) r.click(); }
    for (const s of g.querySelectorAll('select')) { const o = [...s.options].find(o => o.value && !o.disabled); if (o) { s.value = o.value; s.dispatchEvent(new Event('change', {bubbles: true})); } }
    for (const t of g.querySelectorAll('input[type=text],input:not([type]),textarea')) if (!t.value) { t.value = 'Lore: History'; t.dispatchEvent(new Event('input', {bubbles: true})); }
  });
}
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function goTab(page, tab) {
  await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, tab); await settle(page);
}
async function shotEl(page, locator, file) {
  await locator.scrollIntoViewIfNeeded(); await settle(page);
  await locator.screenshot({path: path.join(out, file)});
  return file;
}
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.addStyleTag({content: I_CSS});
  await page.evaluate(d => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d);
    document.getElementById('f_clan').value = 'Crane'; T.recalcAll(); }, dense);
  return {context, page};
}

(async () => {
  const browser = await chromium.launch();
  const shots = {};
  try {
    for (const [device, opts] of Object.entries({phone: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2},
      desktop: {viewport: {width: 1440, height: 1000}}})) {
      const {context, page} = await open(browser, opts);
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      await goTab(page, 'Adv & Disadv');
      // The seven pickers: today, and proposed (A16 remove / move).
      for (const [id, name, cls] of SEVEN) {
        await quickAdd(page, name); await page.waitForTimeout(150);
        await page.evaluate(c => { for (const b of document.querySelectorAll('#advConfigGrid .' + c)) b.classList.add('g1-seven-info'); }, cls);
        const modal = page.locator('#advConfigModalOverlay .roll-modal');
        if (device === 'phone') {
          shots[`${device}-${id}-today`] = await shotEl(page, modal, `${device}-picker-${id}-today.png`);
          await page.evaluate(() => document.body.classList.add('g1-a16-remove'));
          shots[`${device}-${id}-remove`] = await shotEl(page, modal, `${device}-picker-${id}-remove.png`);
          await page.evaluate(c => { document.body.classList.remove('g1-a16-remove'); document.body.classList.add('g1-a16-move', 'g1-a04');
            const t = document.getElementById('advConfigTitle'); if (!t.querySelector('.g1-title-i')) { const i = document.createElement('button');
              i.type = 'button'; i.className = 'sk-info-btn g1-title-i'; i.textContent = 'i'; t.appendChild(i); } }, cls);
          shots[`${device}-${id}-move`] = await shotEl(page, modal, `${device}-picker-${id}-move.png`);
          await page.evaluate(() => { document.body.classList.remove('g1-a16-move', 'g1-a04'); const i = document.querySelector('.g1-title-i'); if (i) i.remove(); });
        }
        await fillPicker(page, name);
        await page.locator('#advConfigConfirm').click();
        await page.waitForSelector('#advConfigModalOverlay', {state: 'hidden'}).catch(() => page.locator('#advConfigX').click());
      }
      const rowOf = async (list, name) => { const i = await page.evaluate(({list, name}) => [...document.querySelectorAll('#' + list + ' .entry')].findIndex(d => d.querySelector('.en-name').value === name), {list, name});
        return page.locator('#' + list + ' .entry').nth(i); };
      const courtRow = await rowOf('advList', 'Darling of the Court');
      const wealthy = await rowOf('advList', 'Wealthy');
      const hotei = await rowOf('disadvList', 'Seven Fortunes’ Curse');
      // Today.
      for (const mode of ['play', 'management']) {
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode); await goTab(page, 'Adv & Disadv');
        shots[`${device}-${mode}-court-today`] = await shotEl(page, courtRow, `${device}-${mode}-court-today.png`);
        if (mode === 'management') shots[`${device}-${mode}-choose-today`] = await shotEl(page, wealthy, `${device}-${mode}-choose-today.png`);
        shots[`${device}-${mode}-hotei-today`] = await shotEl(page, hotei, `${device}-${mode}-hotei-today.png`);
        await goTab(page, 'Skills');
        const skills = page.locator(device === 'phone' ? '#skillsBody > tr' : '#skillsTable');
        if (device === 'phone') { shots[`${device}-${mode}-skills-today`] = await shotEl(page, page.locator('#skillsBody > tr').nth(0), `${device}-${mode}-skill0-today.png`);
          await page.locator('#skillsBody > tr').nth(1).screenshot({path: path.join(out, `${device}-${mode}-skill1-today.png`)}); }
        else shots[`${device}-${mode}-skills-today`] = await shotEl(page, page.locator('#skillsBody > tr').nth(0), `${device}-${mode}-skill0-today.png`);
        await goTab(page, 'Techniques');
        shots[`${device}-${mode}-kiho-today`] = await shotEl(page, page.locator('.sk-info-btn').filter({hasText: 'ⓘ'}).first().locator('xpath=..'), `${device}-${mode}-kiho-today.png`);
      }
      await goTab(page, 'Rings & Traits');
      shots[`${device}-void-today`] = await shotEl(page, page.locator('#voidInfoBtn').locator('xpath=..'), `${device}-void-today.png`);
      // Proposed.
      await a04(page); await a15(page);
      for (const mode of ['play', 'management']) {
        await page.evaluate(m => window.__L5R_TEST__.MODES12.set(m), mode); await a04(page); await a15(page); await goTab(page, 'Adv & Disadv');
        shots[`${device}-${mode}-court-new`] = await shotEl(page, courtRow, `${device}-${mode}-court-new.png`);
        if (mode === 'management') shots[`${device}-${mode}-choose-new`] = await shotEl(page, wealthy, `${device}-${mode}-choose-new.png`);
        shots[`${device}-${mode}-hotei-new`] = await shotEl(page, hotei, `${device}-${mode}-hotei-new.png`);
        await goTab(page, 'Skills');
        shots[`${device}-${mode}-skills-new`] = await shotEl(page, page.locator('#skillsBody > tr').nth(0), `${device}-${mode}-skill0-new.png`);
        if (device === 'phone') await page.locator('#skillsBody > tr').nth(1).screenshot({path: path.join(out, `${device}-${mode}-skill1-new.png`)});
        await goTab(page, 'Techniques');
        shots[`${device}-${mode}-kiho-new`] = await shotEl(page, page.locator('.sk-info-btn').filter({hasText: 'ⓘ'}).first().locator('xpath=..'), `${device}-${mode}-kiho-new.png`);
      }
      await goTab(page, 'Rings & Traits');
      shots[`${device}-void-new`] = await shotEl(page, page.locator('#voidInfoBtn').locator('xpath=..'), `${device}-void-new.png`);
      // Touch areas, measured on the proposal.
      shots[`${device}-touch`] = await page.evaluate(() => [...document.querySelectorAll('.sk-info-btn, .void-eye-btn, .adv-config-info, .court4514-court, .g1-add-court')]
        .filter(e => e.offsetParent).slice(0, 400).reduce((m, e) => { const b = e.getBoundingClientRect(), k = e.className.split(' ')[0];
          const s = getComputedStyle(e, '::before'); const pad = s.content !== 'none' && s.position === 'absolute' ? 16 : 0;
          const v = Math.round(b.width + pad) + 'x' + Math.round(b.height + pad); m[k] = m[k] || []; if (!m[k].includes(v)) m[k].push(v); return m; }, {}));
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'shots.json'), JSON.stringify(shots, null, 1));
  console.log(JSON.stringify({touchPhone: shots['phone-touch'], touchDesktop: shots['desktop-touch']}));
})().catch(e => { console.error(e); process.exit(1); });
