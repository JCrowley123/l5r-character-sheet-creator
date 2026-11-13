'use strict';
// Release 15a, unit AE3 (PART H PHASE 15.1.30): no XP box and no remove button on automatic entries; layout A with a
// fallback on the left (approved by the owner on 13 November 2026).   node automatic-entry-controls-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: what the browser draws (computed display, boxes from getBoundingClientRect,
// whether a name box scrolls), the saved character from collectData, print media, and the same cards with the unit's
// body class taken away (put back only if it was there). Characters, copied into this folder: the audit's dense Kuni
// Shugenja (a School Technique and the three given spells), with a Kiho bought through the sheet's own picker, and the
// older Kitsu test character (chosen and reward spells, and a School Technique typed in by hand). Their given spells
// are credited first: by AE2 when it is in the build, otherwise by the older-holdings review, as a player would.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const DENSE = path.join(__dirname, 'dense-kuni.l5r.json'), DENSE_NAME = 'Phase 15 dense audit';
const KITSU = path.join(__dirname, 'kitsu-fixture.l5r.json'), KITSU_NAME = 'Older Kitsu test character';
const LONG = 'The Mountain Does Not Move', SHORT = 'Gaze Into Shadow';
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };

function install() {
  const H = {};
  H.row = name => [...document.querySelectorAll('#techList > .entry')].find(r => r.querySelector('.en-name').value === name);
  H.drawn = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
  H.box = el => { const r = el.getBoundingClientRect(); return {x: r.left, y: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height}; };
  // One card as drawn: the XP box, the ×, the tag and where they sit.
  H.card = name => {
    const row = H.row(name);
    if (!row) return null;
    const top = row.querySelector(':scope > .entry-top'), n = row.querySelector('.en-name'), cost = row.querySelector('.en-cost'),
      rm = row.querySelector(':scope > .rm-btn'), tag = row.querySelector('.entry-top > .ax15-tag');
    const ts = getComputedStyle(top);
    return {xp: H.drawn(cost), remove: H.drawn(rm), tag: H.drawn(tag) ? tag.textContent : null, name: H.box(n), tagBox: H.drawn(tag) ? H.box(tag) : null,
      inner: {left: H.box(top).x + parseFloat(ts.paddingLeft), right: H.box(top).right - parseFloat(ts.paddingRight), right0: H.box(top).right},
      cut: n.scrollWidth > n.clientWidth + 1, h: Math.round(row.getBoundingClientRect().height)};
  };
  H.rename = (from, to) => { const n = H.row(from).querySelector('.en-name'); n.value = to; n.dispatchEvent(new Event('input', {bubbles: true})); };
  H.without = fn => { const b = document.body, had = b.classList.contains('ax15-on'); b.classList.remove('ax15-on'); const r = fn(); if (had) b.classList.add('ax15-on'); return r; };
  window.AXH = H;
}
async function open(browser, opts, file, name) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.locator('#fileImport').setInputFiles(file);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, name);
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
  await page.evaluate(install);
  // Credit the given spells (and, for Kitsu, one chosen Water spell) through the review if one is waiting.
  await goTab(page, 'Identity');
  // Only a review: when AE2 has credited every held spell, the School-choice button left is "Choose starting spells".
  // (13 November 2026, after the first run stopped here and before any result was used. Same ids and count.)
  const REVIEW = () => [...document.querySelectorAll('#validationReport .sc8-open[data-kind="spell"]')].find(b => b.textContent.trim() === 'Review starting spells');
  const review = await page.evaluate(`!!(${REVIEW})()`);
  if (review) {
    await page.evaluate(`(${REVIEW})().click()`); await settle(page);
    await page.evaluate(() => { document.querySelectorAll('input.oc8-spell').forEach(i => { i.checked = ['Sense', 'Commune', 'Summon', 'Reflective Pool'].includes(i.value); }); });
    await page.evaluate(() => document.querySelector('.oc8-confirm').click()); await settle(page);
    await page.evaluate(() => document.getElementById('sc8Done').click()); await settle(page);
  }
  await goTab(page, 'Techniques');
  return {context, page, errors};
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone: the dense Kuni Shugenja ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE, DENSE, DENSE_NAME);
      // A Kiho bought with XP, through the sheet's own picker.
      const kiho = await page.evaluate(() => { const sel = document.getElementById('techQuickAdd');
        const o = [...sel.options].find(o => o.value.startsWith('kiho:') && !o.disabled); if (!o) return null;
        sel.value = o.value; sel.dispatchEvent(new Event('change', {bubbles: true}));
        return [...document.querySelectorAll('#techList > .entry')].at(-1).querySelector('.en-name').value; });
      await settle(page);
      await check('AX-SEAM-PHONE', async () => {
        const s = await page.evaluate(() => { const T = window.__L5R_TEST__; return T.AX15 ? [T.AUTOMATIC_ENTRY_CONTROLS_ENABLED, T.AX15.installed, document.body.classList.contains('ax15-on')] : null; });
        return [JSON.stringify(s) === '[true,true,true]', s];
      });
      await check('AX-SCHOOL-TECH-PLAIN-PHONE', async () => {
        const c = await page.evaluate(n => window.AXH.card(n), SHORT);
        const mid = c.tagBox && (c.tagBox.y + c.tagBox.bottom) / 2;
        return [!c.xp && !c.remove && c.tag === 'School technique' && mid > c.name.y && mid < c.name.bottom && c.tagBox.x >= c.name.right, c];
      });
      await check('AX-CORNER-GIVEN-BACK-PHONE', async () => {
        const c = await page.evaluate(n => window.AXH.card(n), SHORT);
        return [!!c.tagBox && Math.abs(c.tagBox.right - c.inner.right0) <= 2, c];
      });
      await check('AX-LONG-NAME-FALLS-BACK-LEFT-PHONE', async () => {
        await page.evaluate(([a, b]) => window.AXH.rename(a, b), [SHORT, LONG]); await settle(page);
        const c = await page.evaluate(n => window.AXH.card(n), LONG);
        return [!c.cut && !!c.tagBox && c.tagBox.y >= c.name.bottom && Math.abs(c.tagBox.x - c.name.x) <= 1 && c.tag === 'School technique' && !c.xp && !c.remove, c];
      });
      await check('AX-SHORT-NAME-ONE-LINE-AGAIN-PHONE', async () => {
        await page.evaluate(([a, b]) => window.AXH.rename(a, b), [LONG, SHORT]); await settle(page);
        const c = await page.evaluate(n => window.AXH.card(n), SHORT);
        const mid = c.tagBox && (c.tagBox.y + c.tagBox.bottom) / 2;
        return [!!c.tagBox && mid > c.name.y && mid < c.name.bottom, c];
      });
      await check('AX-GIVEN-SPELL-NO-REMOVE-PHONE', async () => {
        const c = await page.evaluate(() => window.AXH.card('Sense'));
        return [!c.remove && c.tag === null && Math.abs(c.name.right - c.inner.right) <= 1, c];
      });
      await check('AX-KIHO-KEEPS-BOTH-PHONE', async () => {
        const c = kiho && await page.evaluate(n => window.AXH.card(n), kiho);
        return [!!c && c.xp && c.remove && c.tag === null, {kiho, c}];
      });
      await check('AX-PLAY-TAG-NO-XP-PHONE', async () => {
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await settle(page);
        const c = await page.evaluate(n => window.AXH.card(n), SHORT);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await settle(page);
        const mid = c.tagBox && (c.tagBox.y + c.tagBox.bottom) / 2;
        return [!c.xp && !c.remove && c.tag === 'School technique' && mid > c.name.y && mid < c.name.bottom, c];
      });
      await check('AX-NONZERO-XP-KEEPS-BOTH-PHONE', async () => {
        await page.evaluate(n => { const c = window.AXH.row(n).querySelector('.en-cost'); c.value = '2'; c.dispatchEvent(new Event('input', {bubbles: true})); }, SHORT); await settle(page);
        const c = await page.evaluate(n => window.AXH.card(n), SHORT);
        await page.evaluate(n => { const c = window.AXH.row(n).querySelector('.en-cost'); c.value = '0'; c.dispatchEvent(new Event('input', {bubbles: true})); }, SHORT); await settle(page);
        const back = await page.evaluate(n => window.AXH.card(n), SHORT);
        return [c.xp && c.remove && c.tag === null && !back.xp && !back.remove && back.tag === 'School technique', {c, back}];
      });
      await check('AX-OTHER-SCHOOL-LABEL-KEEPS-BOTH-PHONE', async () => {
        const old = await page.evaluate(n => window.AXH.row(n).querySelector('.en-desc').value, SHORT);
        const put = text => page.evaluate(([n, t]) => { const d = window.AXH.row(n).querySelector('.en-desc'); d.value = t; d.dispatchEvent(new Event('input', {bubbles: true})); }, [SHORT, text]);
        await put(old.replace('Kuni Shugenja]', 'Hida Bushi]')); await settle(page);
        const other = await page.evaluate(n => window.AXH.card(n), SHORT);
        await put(old.replace('[School Technique', '[Advanced School Technique')); await settle(page);
        const advanced = await page.evaluate(n => window.AXH.card(n), SHORT);
        await put(old); await settle(page);
        const back = await page.evaluate(n => window.AXH.card(n), SHORT);
        return [other.xp && other.remove && other.tag === null && advanced.tag === 'Advanced School technique' && !advanced.remove &&
          back.tag === 'School technique', {other, advanced, back}];
      });
      // The Alternate Path taken at Rank 1 gives this card: it reads "Path technique".
      await check('AX-PATH-TAG-PHONE', async () => {
        const r = await page.evaluate(n => { const T = window.__L5R_TEST__, p = T.ALTERNATE_PATH_LIBRARY.find(a => a.tech && a.name);
          const field = document.getElementById('f_pathTaken'), before = field.value, row = window.AXH.row(n), name = row.querySelector('.en-name');
          field.value = JSON.stringify({'1': p.name}); name.value = p.tech; T.AX15.sweep();
          const tag = (row.querySelector('.ax15-tag') || {}).textContent || null, kind = row.dataset.ax15 || '';
          field.value = before; name.value = n; T.AX15.sweep();
          return {path: p.name, tech: p.tech, tag, kind, after: (row.querySelector('.ax15-tag') || {}).textContent || null}; }, SHORT);
        return [r.tag === 'Path technique' && r.kind === 'path' && r.after === 'School technique', r];
      });
      await check('AX-SAVE-UNCHANGED-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__, on = JSON.stringify(T.collectData()); const off = window.AXH.without(() => JSON.stringify(T.collectData())); return {same: on === off, cost: JSON.parse(on).tech.find(t => t.name === 'Gaze Into Shadow').cost}; });
        return [r.same && Number(r.cost) === 0, r];
      });
      await check('AX-CLASS-OFF-AS-BEFORE-PHONE', async () => {
        const r = await page.evaluate(n => window.AXH.without(() => window.AXH.card(n)), SHORT);
        return [r.xp && r.remove && r.tag === null, r];
      });
      await check('AX-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Desktop ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP, KITSU, KITSU_NAME);
      await check('AX-CHOSEN-AND-REWARD-SPELLS-KEEP-REMOVE-DESKTOP', async () => {
        const r = await page.evaluate(() => ({sense: window.AXH.card('Sense'), pool: window.AXH.card('Reflective Pool'), balm: window.AXH.card("Jurojin's Balm"),
          poolSchool: !!window.__L5R_TEST__.SC8.read(window.AXH.row('Reflective Pool'), 'spell')}));
        return [!r.sense.remove && r.pool.remove && r.poolSchool && r.balm.remove, r];
      });
      await check('AX-HAND-TYPED-TECH-KEEPS-BOTH-DESKTOP', async () => {
        const c = await page.evaluate(() => window.AXH.card('Eyes of the Ancestors'));
        return [c.xp && c.remove && c.tag === null, c];
      });
      await context.close();
      const second = await open(browser, DEVICES.DESKTOP, DENSE, DENSE_NAME);
      errors.push(...second.errors);
      second.page.on('pageerror', e => errors.push(String(e)));
      await check('AX-ONE-LINE-DESKTOP', async () => {
        await second.page.evaluate(([a, b]) => window.AXH.rename(a, b), [SHORT, LONG]); await settle(second.page);
        const c = await second.page.evaluate(n => window.AXH.card(n), LONG);
        const mid = c.tagBox && (c.tagBox.y + c.tagBox.bottom) / 2;
        return [!c.cut && !!c.tagBox && mid > c.name.y && mid < c.name.bottom && !c.xp && !c.remove, c];
      });
      await check('AX-PRINT-AS-BEFORE-DESKTOP', async () => {
        await second.page.emulateMedia({media: 'print'});
        const r = await second.page.evaluate(n => { const look = () => { const row = window.AXH.row(n);
          return ['.en-cost', ':scope > .rm-btn', '.entry-top', '.en-name'].map(s => { const e = row.querySelector(s), c = getComputedStyle(e); return [c.display, c.paddingRight, c.marginRight, c.width].join('|'); }).join(';'); };
          const tag = window.AXH.row(n).querySelector('.ax15-tag');
          return {on: look(), off: window.AXH.without(look), tag: tag ? getComputedStyle(tag).display : null}; }, LONG);
        await second.page.emulateMedia({media: 'screen'});
        return [r.on === r.off && r.tag === 'none', r];
      });
      await check('AX-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
      await second.context.close();
    }
  } finally {
    await browser.close();
  }
  let passed = 0;
  for (const id of pins.checks) {
    const ok = seen[id] === true;
    if (ok) passed++;
    console.log((ok ? 'PASS ' : 'FAIL ') + id + (id in seen ? '' : ' (never ran)'));
  }
  const extra = Object.keys(seen).filter(id => !pins.checks.includes(id));
  for (const id of extra) console.log('FAIL ' + id + ' (not pinned)');
  const total = pins.checks.length + extra.length;
  console.log(`${passed}/${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
})().catch(e => { console.error(e); console.log(`0/${pins.checks.length} checks passed`); process.exit(1); });
