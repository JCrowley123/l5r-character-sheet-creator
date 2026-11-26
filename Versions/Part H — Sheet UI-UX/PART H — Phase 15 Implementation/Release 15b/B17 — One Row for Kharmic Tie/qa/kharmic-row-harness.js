'use strict';
// Release 15b, unit B17 (PART H PHASE 15.2.5): one row for Kharmic Tie (the owner's request of 20 November 2026,
// approved in round 3, with "Reset session" kept until B18).   node kharmic-row-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: what a player sees and hears on the row (the badge's words, the controls by
// their spoken names, their boxes against each other and the card), the window's words written out here, the saved
// configuration after Reset session, and the configure window Change opens. The unit's own state is read only to say
// whether it is there (the seam). Real taps on a touch phone, real clicks on a laptop. Characters: the audit's dense
// Kuni Shugenja with a Kharmic Tie at Rank 3 tied to Aiko, one use spent (2 of 3 left); and the same with a Tie at
// Rank 5 tied to Kakita Yoshiko, all 5 left; both copied into this folder.
// Follows Release 15b B18 (one name per button job, declared in both ROLLBACKs): while B18 is on the seam, Reset session
// reads "Reset", is heard "Reset Kharmic Tie for a new session", and the window's line says "Reset gives back all 3".
// Same ids and count; with B18 removed every line runs as before.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const FX = path.join(__dirname, 'kharmic-tie.l5r.json'), FX_NAME = 'B17 Kharmic Tie';
const FX_LONG = path.join(__dirname, 'kharmic-tie-long.l5r.json'), FX_LONG_NAME = 'B17 Kharmic Tie long';
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 1500));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));

let RESET = 'Reset session: all 3 Kharmic Tie uses back', RESET_WORDS = 'Reset session';
const CHANGE = 'Change Kharmic Tie: person or Rank', INFO = 'Kharmic Tie information';
const RULE = 'Before a weapon attack roll, declare that you are fighting for or protecting Aiko: +1k1 to that roll. Once per session for each Rank. Core Rulebook p.151.';
let HOW = 'An attack’s roll preview offers the Tie while a use is left; nothing is spent until you roll. Reset session gives back all 3 at the start of a session.';
let HOW_MANAGE = HOW + ' Change picks another person or Rank; the Rank sets the cost.';
// Release 15b B18's words, while B18 is present.
async function followB18(page) {
  if (!(await page.evaluate(() => !!(window.__L5R_TEST__.BN15 && window.__L5R_TEST__.BN15.installed)))) return;
  RESET = 'Reset Kharmic Tie for a new session'; RESET_WORDS = 'Reset';
  HOW = HOW.replace('Reset session gives back', 'Reset gives back');
  HOW_MANAGE = HOW + ' Change picks another person or Rank; the Rank sets the cost.';
}

function install() {
  const $ = id => document.getElementById(id), H = {};
  const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  const box = e => { const q = e.getBoundingClientRect(); return {left: Math.round(q.left), right: Math.round(q.right), top: Math.round(q.top), bottom: Math.round(q.bottom), mid: Math.round(q.top + q.height / 2), height: Math.round(q.height)}; };
  const entry = (i = 0) => Array.from(document.querySelectorAll('#advList .entry')).filter(d => d.querySelector('.en-name').value === 'Kharmic Tie')[i];
  H.row = (i = 0) => { const d = entry(i), r = d && d.querySelector('.adv-config-row'); if (!r) return null;
    const vis = Array.from(r.querySelectorAll('*')).filter(shown);
    const badge = Array.from(r.querySelectorAll('.adv-config-badge')).filter(shown);
    const buttons = Array.from(r.querySelectorAll('button')).filter(shown).map(b => ({name: b.getAttribute('aria-label') || b.textContent.trim(), text: b.textContent.trim(), title: b.getAttribute('title'), box: box(b)}));
    const pips = r.querySelector('.adv-config-pips');
    return {text: r.innerText.replace(/\s+/g, ' ').trim(), badges: badge.map(b => ({text: b.textContent, title: b.getAttribute('title'), box: box(b)})),
      buttons, pips: pips && shown(pips) ? {text: pips.textContent, label: pips.getAttribute('aria-label'), box: box(pips)} : null,
      infos: vis.filter(e => e.matches('.adv-config-info')).length, summaryShown: vis.some(e => /^Target: /.test(e.textContent) && e.children.length === 0),
      row: box(r), card: box(d), docScroll: document.documentElement.scrollWidth, vw: innerWidth}; };
  H.config = (i = 0) => JSON.parse(entry(i).dataset.advConfig || 'null');
  H.window = () => { const o = $('stanceInfoOverlay'), b = $('stanceInfoBody');
    return {open: getComputedStyle(o).display !== 'none', title: $('stanceInfoTitle').textContent, sub: $('stanceInfoRing').textContent,
      paras: Array.from(b.querySelectorAll('p')).map(p => p.textContent), rows: Array.from(b.querySelectorAll('tr')).map(tr => Array.from(tr.cells).map(c => c.textContent))}; };
  H.closeWindow = () => { const o = $('stanceInfoOverlay'); const x = o.querySelector('.rm-btn, [id$="Close"]'); if (x) x.click(); else o.style.display = 'none'; };
  H.configOpen = () => getComputedStyle($('advConfigModalOverlay')).display !== 'none';
  H.closeConfig = () => { $('advConfigX').click(); };
  H.addBlank = () => { const T = window.__L5R_TEST__; $('advList').appendChild(T.makeEntry({name: 'Kharmic Tie', cost: '1', desc: ''}, true)); T.recalcAll(); };
  H.mode = m => window.__L5R_TEST__.MODES12.set(m);
  window.KTH = H;
}
async function open(browser, opts, fx = FX, name = FX_NAME) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.locator('#fileImport').setInputFiles(fx);
  await page.waitForFunction(n => document.getElementById('f_name').value === n, name);
  await page.evaluate(install);
  await mode(page, 'management');
  return {context, page, errors};
}
const goTo = async (page, label) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label); await settle(page); };
const mode = async (page, m) => { await page.evaluate(m => window.KTH.mode(m), m); await settle(page); await goTo(page, 'Adv & Disadv'); };
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
// The test characters' only Advantage is the Kharmic Tie, so it is the list's first entry.
const rowButton = (page, name, i = 0) => page.locator('#advList .entry').nth(i).locator('.adv-config-row button[aria-label="' + name + '"]');
const near = (a, b) => Math.abs(a - b) <= 4;
const inside = r => r.buttons.concat(r.badges).every(x => x.box.left >= r.card.left && x.box.right <= r.card.right) && r.docScroll === r.vw;

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await followB18(page);
      await check('KT-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {kt: !!T.KT15 && T.KT15.installed === true, on: T.KHARMIC_TIE_ROW_ENABLED}; });
        return [r.kt && r.on === true, r];
      });
      const manage = await page.evaluate(() => window.KTH.row());
      await check('KT-ONE-ROW-MANAGE-PHONE', async () => [same(manage.badges.map(b => [b.text, b.title]), [['Aiko · Rank 3', null]]) && manage.infos === 0 &&
        !manage.summaryShown && same(manage.buttons.map(b => b.name), [RESET, CHANGE, INFO]) && manage.buttons.every(b => b.title === null) &&
        manage.buttons[0].text === RESET_WORDS && !!manage.pips && manage.pips.text === '●●○' && manage.pips.label === '2 of 3 Kharmic Tie uses remaining', manage]);
      await check('KT-CHANGE-AND-I-ON-BADGE-LINE-MANAGE-PHONE', async () => { const b = manage.badges[0].box, c = manage.buttons[1].box, i = manage.buttons[2].box;
        return [near(c.mid, b.mid) && near(i.mid, b.mid) && c.right <= i.left && b.right <= c.left && inside(manage), manage]; });
      await mode(page, 'play');
      const play = await page.evaluate(() => window.KTH.row());
      await check('KT-PLAY-ONE-LINE-PHONE', async () => { const b = play.badges[0].box;
        return [same(play.buttons.map(x => x.name), [RESET, INFO]) && !!play.pips && [play.pips.box].concat(play.buttons.map(x => x.box)).every(x => near(x.mid, b.mid)) &&
          play.row.height <= 40 && inside(play), play]; });
      await check('KT-WINDOW-PLAY-PHONE', async () => {
        await press(page, P, rowButton(page, INFO));
        const w = await page.evaluate(() => window.KTH.window());
        await page.evaluate(() => window.KTH.closeWindow()); await settle(page);
        return [w.open && w.title === 'Kharmic Tie' && w.sub === 'Rank 3 · tied to Aiko' && same(w.paras, [RULE, HOW]) &&
          same(w.rows, [['Each use', '+1k1'], ['Uses left this session', '2 of 3']]), w];
      });
      await mode(page, 'management');
      await check('KT-WINDOW-MANAGE-PHONE', async () => {
        await press(page, P, rowButton(page, INFO));
        const w = await page.evaluate(() => window.KTH.window());
        await page.evaluate(() => window.KTH.closeWindow()); await settle(page);
        return [w.open && same(w.paras, [RULE, HOW_MANAGE]), w];
      });
      await check('KT-CHANGE-STILL-OPENS-PHONE', async () => {
        await press(page, P, rowButton(page, CHANGE));
        const opened = await page.evaluate(() => window.KTH.configOpen());
        await page.evaluate(() => window.KTH.closeConfig()); await settle(page);
        const after = await page.evaluate(() => ({open: window.KTH.configOpen(), config: window.KTH.config()}));
        return [opened && !after.open && after.config.target === 'Aiko' && after.config.rank === 3 && after.config.remaining === 2, {opened, after}];
      });
      await mode(page, 'play');
      await check('KT-RESET-STILL-WORKS-PHONE', async () => {
        await press(page, P, rowButton(page, RESET));
        const r = await page.evaluate(() => ({row: window.KTH.row(), config: window.KTH.config()}));
        return [r.config.remaining === 3 && !!r.row.pips && r.row.pips.text === '●●●' && same(r.row.badges.map(b => b.text), ['Aiko · Rank 3']) &&
          r.row.infos === 0 && same(r.row.buttons.map(b => b.name), [RESET, INFO]), r];
      });
      await mode(page, 'management');
      await check('KT-UNCONFIGURED-UNCHANGED-PHONE', async () => {
        await page.evaluate(() => window.KTH.addBlank()); await settle(page);
        const r = await page.evaluate(() => { const d = Array.from(document.querySelectorAll('#advList .entry')).filter(x => x.querySelector('.en-name').value === 'Kharmic Tie')[1];
          // textContent, not innerText: the button's style capitalises its text on screen (run 1 read "CHOOSE…").
          const row = d.querySelector('.adv-config-row'); return {cls: row.className, text: row.textContent.replace(/\s+/g, ' ').trim(), ours: !!row.querySelector('.kt15-main, .kt15-end')}; });
        return [r.cls === 'adv-config-row unconfigured' && /^Needs a choice/.test(r.text) && /Choose…/.test(r.text) && !r.ours, r];
      });
      await check('KT-LONG-NAME-PHONE', async () => {
        const fresh = await open(browser, DEVICES.PHONE, FX_LONG, FX_LONG_NAME);
        const r = await fresh.page.evaluate(() => window.KTH.row());
        await fresh.context.close();
        const b = r.badges[0], c = r.buttons.find(x => x.name === CHANGE), i = r.buttons.find(x => x.name === INFO);
        return [!!b && b.text === 'Kakita Yoshiko · Rank 5' && !!c && !!i && near(c.box.mid, b.box.mid) && near(i.box.mid, b.box.mid) && inside(r) && fresh.errors.length === 0, {r, errors: fresh.errors}];
      });
      await check('KT-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop, Manage ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const r = await page.evaluate(() => window.KTH.row());
      await check('KT-ONE-LINE-MANAGE-DESKTOP', async () => { const b = r.badges[0].box;
        return [same(r.buttons.map(x => x.name), [RESET, CHANGE, INFO]) && [r.pips.box].concat(r.buttons.map(x => x.box)).every(x => near(x.mid, b.mid)) &&
          r.row.height <= 40 && r.infos === 0 && inside(r), r]; });
      await check('KT-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
      await context.close();
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
