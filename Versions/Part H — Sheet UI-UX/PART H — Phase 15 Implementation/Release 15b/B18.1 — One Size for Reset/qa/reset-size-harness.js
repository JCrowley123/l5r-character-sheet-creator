'use strict';
// Release 15b, unit B18.1 (PART H PHASE 15.2.10.1): one size for Reset (the owner, 25 November 2026, round-2 card "size",
// approved as shown, with the capitals).   node reset-size-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the card's own words (every Reset is 28 px tall, in the letters of Change and
// Choose… on the same cards, in capitals), so each Reset's letters are compared with the Change button on its own card,
// read from the page; its height with 28 px; and its box with every other Reset's. The buttons on the same row (Great
// Destiny's Use, Unlucky's − and +, the Ancestor card's Use, the round counter's Next Round) are compared the same way.
// Pressing a Reset by its spoken name still gives its uses back. The unit's own state is read only to say whether it is
// there (the seam). Characters: the inventory's (qa/inventory/fixtures.cjs in B18's folder: A03's dense Kuni Shugenja
// with every once-a-session entry) and its Seppun variant, written to a scratch folder and opened by Import.
const path = require('path'), fs = require('fs'), os = require('os'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const INV = require('../../B18 — One Name per Button Job/qa/inventory/fixtures.cjs');
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 8000));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const wait = ms => new Promise(r => setTimeout(r, ms));
// The Resets, each with the card whose Change gives its letters ([list, entry, the Reset's class]).
const RESETS = [['advList', 'Kharmic Tie'], ['advList', 'Luck'], ['advList', 'Dark Paragon'], ['advList', 'Great Destiny'],
  ['disadvList', 'Haunted'], ['disadvList', 'Unlucky']];
const LETTERS = ['fontSize', 'textTransform', 'letterSpacing', 'fontWeight', 'fontFamily'];

function install() {
  const H = {};
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  H.entry = (list, name) => Array.from(document.querySelectorAll('#' + list + ' .entry')).find(d => d.querySelector('.en-name').value === name) || null;
  H.look = (el, props) => { if (!el) return null; const s = getComputedStyle(el), r = el.getBoundingClientRect();
    const out = {text: norm(el.textContent), h: Math.round(r.height * 10) / 10, w: Math.round(r.width * 10) / 10, shown: r.width > 0};
    props.forEach(p => { out[p] = s[p]; }); return out; };
  H.byWords = (root, re) => root ? Array.from(root.querySelectorAll('button')).find(b => re.test(norm(b.textContent))) : null;
  // A Reset and the Change button on the same card (Great Destiny and Haunted have none: Luck's is used).
  H.reset = (list, name, props) => { const d = H.entry(list, name); return {reset: H.look(H.byWords(d, /^Reset/), props),
    change: H.look(d && d.querySelector('.adv-config-btn'), props), card: d ? Math.round(d.getBoundingClientRect().right) : null}; };
  H.mode = m => { window.__L5R_TEST__.MODES12.set(m); };
  H.docScroll = () => ({doc: document.documentElement.scrollWidth, vw: innerWidth});
  window.RSH = H;
}
function fixtures(dir) {
  const write = (key, f) => { const file = path.join(dir, 'b181-' + key + '.l5r.json'); fs.writeFileSync(file, JSON.stringify(f)); return {file, name: f.fields.f_name}; };
  const s = INV.sessions(); s.fields.f_name = 'B18.1 build';
  const i = INV.ancestorImperial(); i.fields.f_name = 'B18.1 build Seppun';
  return {sessions: write('sessions', s), imperial: write('imperial', i)};
}
async function open(browser, opts, fx) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.locator('#fileImport').setInputFiles(fx.file);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, fx.name);
  await wait(300);
  await page.evaluate(install);
  return {context, page, errors};
}
const goTo = async (page, label) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label); await settle(page); };
const mode = async (page, m) => { await page.evaluate(m => window.RSH.mode(m), m); await settle(page); };
const button = (page, spoken) => page.getByRole('button', {name: spoken, exact: true});
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
const near = (a, b, d = 0.6) => Math.abs(a - b) <= d;
const sameLetters = (a, b) => !!a && !!b && LETTERS.every(p => a[p] === b[p]);

// Every Reset is 28 px tall, in capitals, in the letters of the Change button on its card; all the same box.
async function resets(page) {
  await mode(page, 'management'); await goTo(page, 'Adv & Disadv');
  const rows = await page.evaluate(([R, P]) => R.map(([l, n]) => [n, window.RSH.reset(l, n, P)]), [RESETS, LETTERS.concat(['paddingTop', 'paddingLeft', 'lineHeight'])]);
  // Great Destiny's and Haunted's cards have no Change: their Reset is compared with Luck's Change.
  const luckChange = rows.find(r => r[0] === 'Luck')[1].change;
  const out = rows.map(([n, r]) => [n, r.reset, r.change || luckChange]);
  await goTo(page, 'Clan & School');
  const anc = await page.evaluate(P => window.RSH.look(document.getElementById('anc48ResetSession'), P), LETTERS);
  // The round counter is a Play control.
  await mode(page, 'play'); await goTo(page, 'Combat');
  await page.evaluate(() => { const d = document.getElementById('voidDetails'); if (d) d.open = true; });
  await settle(page);
  const rounds = await page.evaluate(P => [window.RSH.look(document.getElementById('btnResetRounds'), P), window.RSH.look(document.getElementById('btnNextRound'), P)], LETTERS);
  const all = out.map(x => x[1]).concat([anc, rounds[0]]);
  const ok = out.every(([, r, c]) => r && r.shown && near(r.h, 28) && r.textTransform === 'uppercase' && sameLetters(r, c)) &&
    all.every(r => r && near(r.h, 28) && near(r.w, all[0].w) && sameLetters(r, all[0])) && near(rounds[1].h, 28) && sameLetters(rounds[1], all[0]);
  return [ok, {out, anc, rounds}];
}
// The other buttons on the same rows take the same look.
async function sameRow(page) {
  await mode(page, 'management'); await goTo(page, 'Adv & Disadv');
  const got = await page.evaluate(P => { const H = window.RSH, gd = H.entry('advList', 'Great Destiny'), u = H.entry('disadvList', 'Unlucky');
    return {use: H.look(H.byWords(gd, /^Use$/), P), minus: H.look(H.byWords(u, /^−$/), P), plus: H.look(H.byWords(u, /^\+$/), P),
      reset: H.look(H.byWords(gd, /^Reset/), P)}; }, LETTERS);
  const ok = ['use', 'minus', 'plus'].every(k => got[k] && near(got[k].h, 28) && sameLetters(got[k], got.reset));
  return [ok, got];
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-b181-'));
  const F = fixtures(dir);
  const browser = await chromium.launch();
  try {
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE, F.sessions);
      const P = true;
      await check('RS-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {rs: !!T.RS15 && T.RS15.installed === true, on: T.RESET_ONE_SIZE_ENABLED, body: document.body.classList.contains('rs15-on')}; });
        return [r.rs && r.on === true && r.body, r];
      });
      await check('RS-ONE-SIZE-PHONE', () => resets(page));
      await check('RS-SAME-ROW-PHONE', () => sameRow(page));
      await check('RS-FITS-PHONE', async () => {
        await goTo(page, 'Adv & Disadv');
        const r = await page.evaluate(R => ({rows: R.map(([l, n]) => { const d = window.RSH.entry(l, n), b = window.RSH.byWords(d, /^Reset/);
          return [n, Math.round(b.getBoundingClientRect().right), Math.round(d.getBoundingClientRect().right)]; }), scroll: window.RSH.docScroll()}), RESETS);
        return [r.rows.every(([, b, c]) => b <= c) && r.scroll.doc === r.scroll.vw, r];
      });
      await check('RS-RESET-STILL-WORKS-PHONE', async () => {
        await mode(page, 'play'); await goTo(page, 'Adv & Disadv');
        const name = await page.evaluate(() => { const b = window.RSH.byWords(window.RSH.entry('advList', 'Luck'), /^Reset/); return b.getAttribute('aria-label') || b.textContent.trim(); });
        await press(page, P, button(page, name));
        const pips = await page.evaluate(() => window.RSH.entry('advList', 'Luck').querySelector('.adv-config-pips').getAttribute('aria-label'));
        return [pips === '3 of 3 Luck uses remaining', {name, pips}];
      });
      await check('RS-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE, F.imperial);
      await check('RS-ANCESTOR-USE-PHONE', async () => {
        await mode(page, 'play'); await goTo(page, 'Clan & School');
        const got = await page.evaluate(P => ({use: window.RSH.look(document.getElementById('anc48UseNow'), P),
          reset: window.RSH.look(document.getElementById('anc48ResetSession'), P)}), LETTERS);
        return [!!got.use && near(got.use.h, 28) && near(got.reset.h, 28) && sameLetters(got.use, got.reset) && got.use.textTransform === 'uppercase', got];
      });
      await check('RS-NO-ERRORS-SEPPUN-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP, F.sessions);
      await check('RS-ONE-SIZE-DESKTOP', () => resets(page));
      await check('RS-SAME-ROW-DESKTOP', () => sameRow(page));
      await check('RS-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
      await context.close();
    }
  } finally {
    await browser.close();
    fs.rmSync(dir, {recursive: true, force: true});
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
