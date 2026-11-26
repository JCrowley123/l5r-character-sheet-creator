'use strict';
// Release 15b, unit B18.2 (PART H PHASE 15.2.10.2): the i at the right end of its row (the owner, 25 November 2026,
// round-2 card "iright", approved as shown).   node info-row-end-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the card's own words ("the i always sits at the right end of its row, as Kharmic
// Tie's already does"), so each moved i's gap to its card's right edge is compared with Kharmic Tie's, measured in the
// same page; each i is on its row's first line, beside the row's buttons; the i's that stay (the Skills list's, the i's
// beside a heading, Kharmic Tie's) are measured with and without the page's mark (body.ie15-on) and must not move; and
// pressing a moved i still opens its window. The order a screen reader reads is the page's order, which is compared
// with and without the mark. The unit's own state is read only to say whether it is there (the seam). Character: the
// inventory's (qa/inventory/fixtures.cjs in B18's folder), with Luck, Dark Paragon, Seven Fortunes' Curse (Hotei),
// Wealthy and Zakyo Toshi Citizen (each still needing a choice) and Kharmic Tie, opened by Import.
const path = require('path'), fs = require('fs'), os = require('os'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const INV = require('../../B18 — One Name per Button Job/qa/inventory/fixtures.cjs');
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 6000));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const wait = ms => new Promise(r => setTimeout(r, ms));
// The cards whose i moves ([list, entry]); the i is found as the row's i button, whatever draws it. Release 15a A04 is
// what takes Phase 4.54's i out of the button it explains (Luck's Reset, a card's Choose…) and draws Hotei's i; with A04
// removed only Dark Paragon's own i is a row's i, so only it moves (MOVED_NO_A04). Same ids and count either way.
const MOVED = [['advList', 'Luck'], ['advList', 'Dark Paragon'], ['disadvList', 'Seven Fortunes’ Curse'], ['advList', 'Wealthy'], ['advList', 'Zakyo Toshi Citizen']];
const MOVED_NO_A04 = [['advList', 'Dark Paragon']];
let A04 = true;
const movedList = which => !A04 ? MOVED_NO_A04 : which === 'play' ? MOVED.slice(0, 3) : MOVED;

function install() {
  const H = {};
  H.entry = (list, name) => Array.from(document.querySelectorAll('#' + list + ' .entry')).find(d => d.querySelector('.en-name').value === name) || null;
  // A row's i: the button heard "… information" on the row's first line (the row's own i, not a reminder's).
  H.rowI = d => { const row = d && d.querySelector('.adv-config-row'); if (!row) return null;
    return Array.from(row.querySelectorAll('button')).find(b => / information$/.test(b.getAttribute('aria-label') || '') && b.getClientRects().length > 0 &&
      !(b.parentElement && b.parentElement.closest('button'))) || null; };
  H.gap = (d, el) => { if (!d || !el) return null; const c = d.getBoundingClientRect(), r = el.getBoundingClientRect();
    // level: the i's middle against the middle of the nearest shown element before it (its row's button, pips or badge).
    let prev = el.previousElementSibling;
    while (prev && !(prev.getBoundingClientRect().width > 0)) prev = prev.previousElementSibling;
    const p = prev ? prev.getBoundingClientRect() : r;
    return {gap: Math.round(c.right - r.right), level: Math.round(Math.abs((r.top + r.bottom) / 2 - (p.top + p.bottom) / 2)), w: Math.round(r.width), h: Math.round(r.height)}; };
  H.moved = list => list.map(([l, n]) => { const d = H.entry(l, n); return [n, H.gap(d, H.rowI(d))]; });
  H.tie = () => { const d = H.entry('advList', 'Kharmic Tie'); return H.gap(d, d && d.querySelector('.kt15-info')); };
  // Where the i's that stay are, and the page order a screen reader follows (every button's spoken name in order).
  H.stay = () => ({skills: Array.from(document.querySelectorAll('#skillsBody .sk-info-btn')).slice(0, 3).map(b => Math.round(b.getBoundingClientRect().left)),
    anc: (() => { const b = document.getElementById('anc48Info'); return b ? Math.round(b.getBoundingClientRect().left) : null; })(),
    tie: H.tie()});
  H.order = () => Array.from(document.querySelectorAll('#advList button, #disadvList button')).map(b => b.getAttribute('aria-label') || b.textContent.trim());
  H.mark = on => { document.body.classList.toggle('ie15-on', on); };
  H.mode = m => { window.__L5R_TEST__.MODES12.set(m); };
  H.docScroll = () => ({doc: document.documentElement.scrollWidth, vw: innerWidth});
  window.IEH = H;
}
function fixture(dir) {
  const f = INV.sessions(); f.fields.f_name = 'B18.2 build';
  const file = path.join(dir, 'b182.l5r.json'); fs.writeFileSync(file, JSON.stringify(f)); return {file, name: f.fields.f_name};
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
const mode = async (page, m) => { await page.evaluate(m => window.IEH.mode(m), m); await settle(page); };
const near = (a, b, d = 1) => Math.abs(a - b) <= d;

// Every moved i ends where Kharmic Tie's does, level with the button, pips or badge beside it (Luck's i stays with its
// pips and Reset, so on a phone in Manage it ends that group's line). The cards still needing a choice show their i in
// Manage only.
async function rightEnd(page, which) {
  await mode(page, which); await goTo(page, 'Adv & Disadv');
  const list = movedList(which);
  const got = await page.evaluate(M => ({moved: window.IEH.moved(M), tie: window.IEH.tie(), scroll: window.IEH.docScroll()}), list);
  const ok = !!got.tie && got.moved.every(([, g]) => g && near(g.gap, got.tie.gap) && g.level <= 4 && g.w === 28 && g.h === 28) && got.scroll.doc === got.scroll.vw;
  return [ok, got];
}
// With the page's mark taken off, the same i's sit where they were (left of the row's end): the unit is what moves them.
async function marked(page) {
  await mode(page, 'management'); await goTo(page, 'Adv & Disadv');
  const off = await page.evaluate(M => { window.IEH.mark(false); const r = window.IEH.moved(M); window.IEH.mark(true); return r; }, movedList('management'));
  const on = await page.evaluate(M => window.IEH.moved(M), movedList('management'));
  return [off.every(([n, g], i) => g && on[i][1] && g.gap > on[i][1].gap + 20), {off, on}];
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-b182-'));
  const F = fixture(dir);
  const browser = await chromium.launch();
  try {
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE, F);
      await check('IE-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {ie: !!T.IE15 && T.IE15.installed === true, on: T.INFO_AT_ROW_END_ENABLED, body: document.body.classList.contains('ie15-on')}; });
        A04 = await page.evaluate(() => !!(window.__L5R_TEST__.IP15 && window.__L5R_TEST__.ONE_INFO_PATTERN_ENABLED));
        return [r.ie && r.on === true && r.body, Object.assign(r, {A04})];
      });
      await check('IE-RIGHT-END-MANAGE-PHONE', () => rightEnd(page, 'management'));
      await check('IE-THE-UNIT-MOVES-THEM-PHONE', () => marked(page));
      await check('IE-RIGHT-END-PLAY-PHONE', () => rightEnd(page, 'play'));
      await check('IE-OTHERS-STAY-PHONE', async () => {
        await mode(page, 'management');
        const read = async () => { const out = {}; for (const t of ['Skills', 'Clan & School', 'Adv & Disadv']) { await goTo(page, t); Object.assign(out, await page.evaluate(() => window.IEH.stay())); } return out; };
        await page.evaluate(() => window.IEH.mark(false)); const off = await read();
        await page.evaluate(() => window.IEH.mark(true)); const on = await read();
        return [same(off, on) && on.skills.length === 3 && on.anc !== null && !!on.tie, {off, on}];
      });
      await check('IE-READING-ORDER-PHONE', async () => {
        await goTo(page, 'Adv & Disadv');
        const off = await page.evaluate(() => { window.IEH.mark(false); const o = window.IEH.order(); window.IEH.mark(true); return o; });
        const on = await page.evaluate(() => window.IEH.order());
        return [same(off, on) && on.length > 20, {n: on.length}];
      });
      await check('IE-STILL-OPENS-PHONE', async () => {
        await mode(page, 'play'); await goTo(page, 'Adv & Disadv');
        // Luck's i (with A04), or Dark Paragon's (without): the first moved i, found on its card.
        const [list, name] = movedList('play')[0];
        await page.evaluate(([l, n]) => { const b = window.IEH.rowI(window.IEH.entry(l, n)); if (b) b.dataset.ieh = 'press'; }, [list, name]);
        const i = page.locator('[data-ieh="press"]');
        await i.scrollIntoViewIfNeeded(); await i.tap(); await settle(page);
        const r = await page.evaluate(() => ({open: getComputedStyle(document.getElementById('stanceInfoOverlay')).display !== 'none', title: document.getElementById('stanceInfoTitle').textContent, body: document.getElementById('stanceInfoBody').textContent}));
        await page.evaluate(() => document.getElementById('stanceInfoClose').click());
        return [r.open && (A04 ? /Restore Luck to its per-session maximum/.test(r.body) : /Dark Paragon/.test(r.title + r.body)), r];
      });
      await check('IE-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP, F);
      await check('IE-RIGHT-END-MANAGE-DESKTOP', () => rightEnd(page, 'management'));
      await check('IE-RIGHT-END-PLAY-DESKTOP', () => rightEnd(page, 'play'));
      await check('IE-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
