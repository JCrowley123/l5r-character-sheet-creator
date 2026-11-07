'use strict';
// Release 15a, A15 (PART H PHASE 15.1.15): court badges (the owner's design, mock-ups approved 6-7 November 2026).
//   node court-badges-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL, and an
// exception inside a check is that check's FAIL with its reason. Oracles are independent of the layer: the row's own
// saved config (data-adv-config), the Status field, the computed colours of the sheet's own tokens, a contrast ratio
// computed here, Phase 9's palette as published in its source table, what the browser reports at a point, and the
// same page with the layer's body class taken away.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const FIX = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'g1-fixtures.json'), 'utf8'));
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const PHONE = {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true};
const NARROW = {viewport: {width: 320, height: 640}, isMobile: true, hasTouch: true};
const DESKTOP = {viewport: {width: 1440, height: 1000}};
const DARLING = 'Darling of the Court';
const COURTS = ['Kyuden Doji', 'Toshi Ranbo', 'Otosan Uchi'];
const darling = (courts, extra = {}) => ({name: DARLING, cost: String(2 * courts.length), desc: '',
  config: Object.assign({type: 'courtList', revision: 1, courts, selected: courts[0], inSession: false, value: courts.join(', ')}, extra)});
// Phase 9 (Part H)'s published shuDark per Clan (CLAN_THEME_PALETTE), and the sheet's own red with no Great Clan. A Clan
// whose theme is not applied (Phase 9 removed or switched off: getAppliedClanKey() is not that Clan) expects the red.
const RED = '#7c2620';
const SHU_DARK = {Crab: '#7d4c21', Crane: '#21557d', Dragon: '#1b6540', Lion: '#65531b', Phoenix: '#7d3421', Scorpion: '#532d3b', Unicorn: '#52217d', '': '#7c2620'};

function helpers() {
  const shown = e => !!e && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && e.getClientRects().length > 0;
  const token = v => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  const rgb = c => (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; const [r, g, b] = rgb(c); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const hex = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')';
  const want = (clan, table, red) => { const T = window.__L5R_TEST__;
    return clan && typeof T.getAppliedClanKey === 'function' && T.getAppliedClanKey() === clan && table[clan] ? table[clan] : red; };
  const entry = () => [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Darling of the Court') || null;
  const config = () => JSON.parse(entry().dataset.advConfig || 'null');
  const badges = () => [...entry().querySelectorAll('.court4514-courts > button.court4514-court')];
  const state = () => ({config: config(), pressed: badges().map(b => b.getAttribute('aria-pressed')), names: badges().map(b => b.textContent),
    status: (entry().querySelector('.court4514-status') || {}).textContent || '', status_rank: document.getElementById('f_statusRank').value,
    focus: document.activeElement && document.activeElement.matches('button.court4514-court') ? document.activeElement.textContent : null});
  return {shown, token, contrast, hex, want, entry, config, badges, state};
}

async function open(browser, opts, adv, clan = 'Crane') {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.addScriptTag({content: 'window.__CB_H = (' + helpers.toString() + ')();'});
  await page.evaluate(({d, clan}) => { const T = window.__L5R_TEST__; try { T.CL11.close(); } catch (e) {} T.applyData(d);
    document.getElementById('f_statusRank').value = '3'; const c = document.getElementById('f_clan'); c.value = clan; c.dispatchEvent(new Event('change', {bubbles: true})); T.recalcAll(); },
    {d: Object.assign({}, FIX.dense, {adv}), clan});
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
  await goTab(page, 'Adv & Disadv');
  return {context, page, errors};
}
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function goTab(page, tab) { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); }
const state = page => page.evaluate(() => __CB_H.state());
async function tap(page, index) {
  const b = page.locator('#advList .court4514-courts > button.court4514-court').nth(index);
  await b.scrollIntoViewIfNeeded(); await b.click(); await settle(page);
  return state(page);
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [device, opts] of [['phone', PHONE], ['desktop', DESKTOP]]) {
      const D = device.toUpperCase();
      const {context, page, errors} = await open(browser, opts, [darling(COURTS)]);
      await check('CB-SEAM-' + D, async () => {
        const r = await page.evaluate(() => ({on: document.body.classList.contains('cb15-on'), seam: typeof window.__L5R_TEST__.CB15 === 'object', sw: window.__L5R_TEST__.COURT_BADGES_ENABLED}));
        return [r.on && r.seam && r.sw === true, r];
      });
      await check('CB-ONE-BADGE-PER-COURT-' + D, async () => {
        const r = await page.evaluate(() => { const e = __CB_H.entry();
          return {radios: e.querySelectorAll('.court4514-courts input').length, tick: e.querySelectorAll('.court4514-session, .court4514-session-box, input[type=checkbox]').length,
            badges: __CB_H.badges().map(b => ({tag: b.tagName, type: b.type, pressed: b.getAttribute('aria-pressed'), text: b.textContent, shown: __CB_H.shown(b)})),
            legend: (e.querySelector('.court4514-legend') || {}).textContent}; });
        return [r.radios === 0 && r.tick === 0 && r.badges.length === 3 && r.badges.every((b, i) => b.tag === 'BUTTON' && b.type === 'button' && b.text === COURTS[i] && b.shown && ['true', 'false'].includes(b.pressed)) &&
          r.legend === 'Courts: tap the one in session', r];
      });
      await check('CB-IDLE-LOOK-' + D, async () => {
        const r = await page.evaluate(() => { const gold = __CB_H.token('var(--gold)'), paper = __CB_H.token('var(--paper)');
          return {s: __CB_H.state(), looks: __CB_H.badges().map(b => { const c = getComputedStyle(b); return c.borderTopColor === gold && c.borderTopStyle === 'solid' && c.backgroundColor === paper; })}; });
        return [r.s.pressed.every(p => p === 'false') && r.looks.every(Boolean) && /^Status 3 as normal — no court in session\.$/.test(r.s.status) && !COURTS.some(c => r.s.status.includes(c)), r];
      });
      await check('CB-TAP-PUTS-IN-SESSION-' + D, async () => {
        const s = await tap(page, 1);
        return [s.config.selected === COURTS[1] && s.config.inSession === true && s.pressed.join() === 'false,true,false' && /Status 3 — counts as 4 at Toshi Ranbo/.test(s.status) &&
          s.status_rank === '3' && s.focus === COURTS[1], s];
      });
      await check('CB-FILL-IN-CLAN-COLOUR-' + D, async () => {
        const r = await page.evaluate(({table, red}) => { const b = __CB_H.badges()[1], c = getComputedStyle(b), shu = __CB_H.token('var(--shu-dark)'), paper = __CB_H.token('var(--paper)');
          return {bg: c.backgroundColor, shu, want: __CB_H.hex(__CB_H.want('Crane', table, red)), fg: c.color, paper, bold: Number(c.fontWeight), ratio: __CB_H.contrast(c.backgroundColor, c.color), others: __CB_H.badges().filter((x, i) => i !== 1).map(x => getComputedStyle(x).backgroundColor === paper)}; }, {table: SHU_DARK, red: RED});
        return [r.bg === r.shu && r.bg === r.want && r.fg === r.paper && r.bold >= 700 && r.ratio >= 4.5 && r.others.every(Boolean), r];
      });
      await check('CB-TAP-AGAIN-ENDS-SESSION-' + D, async () => {
        const s = await tap(page, 1);
        return [s.config.selected === COURTS[1] && s.config.inSession === false && s.pressed.every(p => p === 'false') && /no court in session/.test(s.status) && !/counts as/.test(s.status), s];
      });
      await check('CB-ONE-AT-A-TIME-' + D, async () => {
        await tap(page, 0);
        const s = await tap(page, 2);
        return [s.config.selected === COURTS[2] && s.config.inSession === true && s.pressed.join() === 'false,false,true' && /counts as 4 at Otosan Uchi/.test(s.status), s];
      });
      await check('CB-TOUCH-44-' + D, async () => {
        const r = await page.evaluate(() => [...__CB_H.entry().querySelectorAll('.court4514-courts > button')].map(b => { b.scrollIntoView({block: 'center'}); const x = b.getBoundingClientRect();
          const hit = document.elementFromPoint(x.left + 3, x.top + x.height / 2); return {h: Math.round(x.height), w: Math.round(x.width), hit: !!hit && (hit === b || b.contains(hit))}; }));
        return [r.length === 4 && r.every(x => x.h >= 44 && x.w >= 44 && x.hit), r];
      });
      await check('CB-ADD-COURT-' + D, async () => {
        const before = await state(page);
        const add = page.locator('#advList .court4514-courts > button:not(.court4514-court)');
        const text = await add.textContent();
        await add.scrollIntoViewIfNeeded(); await add.click(); await settle(page);
        const r = await page.evaluate(() => { const inputs = [...document.querySelectorAll('#advConfigGrid .court4514-input')];
          return {open: getComputedStyle(document.getElementById('advConfigModalOverlay')).display !== 'none', values: inputs.map(i => i.value), focused: document.activeElement === inputs[inputs.length - 1]}; });
        await page.locator('#advConfigX').click(); await settle(page);
        const after = await state(page);
        return [text === '+ Add court' && r.open && r.values.join('|') === COURTS.join('|') + '|' && r.focused && JSON.stringify(after.config) === JSON.stringify(before.config), {text, r, before: before.config, after: after.config}];
      });
      await check('CB-PLAY-' + D, async () => {
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await goTab(page, 'Adv & Disadv');
        const r = await page.evaluate(() => ({add: [...__CB_H.entry().querySelectorAll('.court4514-courts > button:not(.court4514-court)')].map(__CB_H.shown), badges: __CB_H.badges().map(__CB_H.shown)}));
        const s = await tap(page, 0);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management')); await goTab(page, 'Adv & Disadv');
        return [r.add.length === 1 && r.add[0] === false && r.badges.every(Boolean) && s.config.selected === COURTS[0] && s.config.inSession === true, {r, s: s.config}];
      });
      await check('CB-KEYBOARD-' + D, async () => {
        await page.locator('#advList .court4514-courts > button.court4514-court').nth(0).focus();
        await page.keyboard.press('Space'); await settle(page);
        const off = await state(page);
        await page.keyboard.press('Enter'); await settle(page);
        const on = await state(page);
        return [off.config.inSession === false && on.config.inSession === true && on.config.selected === COURTS[0] && on.focus === COURTS[0], {off: off.config, on: on.config, focus: on.focus}];
      });
      await check('CB-SAVE-ROUND-TRIP-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; const data = T.collectData(); const before = __CB_H.state();
          T.applyData(JSON.parse(JSON.stringify(data))); T.recalcAll(); const after = __CB_H.state();
          return {saved: data.adv.find(a => a.name === 'Darling of the Court').config, before: before.pressed, after: after.pressed, cfg: after.config}; });
        return [JSON.stringify(Object.keys(r.saved).sort()) === JSON.stringify(['courts', 'inSession', 'revision', 'selected', 'type', 'value']) &&
          r.saved.selected === COURTS[0] && r.saved.inSession === true && r.before.join() === r.after.join() && r.after.join() === 'true,false,false', r];
      });
      await check('CB-WORDS-' + D, async () => {
        await page.locator('#advList .court4514-info').click(); await settle(page);
        const help = await page.evaluate(() => document.getElementById('stanceInfoBody').textContent);
        await page.evaluate(() => { document.getElementById('stanceInfoOverlay').style.display = 'none'; });
        await page.locator('#advList .entry').filter({has: page.locator('.court4514-row')}).first().locator('.adv-config-btn').click(); await settle(page);
        const note = await page.evaluate(() => document.getElementById('advConfigNote').textContent);
        await page.locator('#advConfigX').click(); await settle(page);
        return [!/ticked|tick/.test(help) && /court whose badge is filled/.test(help) && /Core p\.148/.test(help) && /2 XP, or 1 XP for a Courtier/.test(help) &&
          !/session toggle|selected court and whether/.test(note) && /tap a court to put it in session/.test(note) && /A court can be listed only once/.test(note), {help, note}];
      });
      await check('CB-CLASS-GATES-' + D, async () => {
        const r = await page.evaluate(() => { const b = __CB_H.badges()[1]; const on = Math.round(b.getBoundingClientRect().height);
          document.body.classList.remove('cb15-on'); const off = Math.round(b.getBoundingClientRect().height); const border = getComputedStyle(b).borderTopColor; document.body.classList.add('cb15-on');
          return {on, off, border, gold: __CB_H.token('var(--gold)')}; });
        return [r.on >= 44 && r.off < 44 && r.border !== r.gold, r];
      });
      await check('CB-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
      await context.close();
    }
    // Every Clan's colour, and the sheet's red with no Great Clan.
    await check('CB-EVERY-CLAN-COLOUR', async () => {
      const out = [];
      for (const clan of Object.keys(SHU_DARK)) {
        const {context, page} = await open(browser, PHONE, [darling(COURTS, {selected: COURTS[0], inSession: true})], clan);
        out.push(Object.assign({clan}, await page.evaluate(({clan, table, red}) => { const b = __CB_H.badges()[0], c = getComputedStyle(b);
          return {bg: c.backgroundColor, want: __CB_H.hex(__CB_H.want(clan, table, red)), ratio: Math.round(__CB_H.contrast(c.backgroundColor, c.color) * 100) / 100}; }, {clan, table: SHU_DARK, red: RED})));
        await context.close();
      }
      return [out.every(x => x.bg === x.want && x.ratio >= 4.5), out];
    });
    // A long unbroken name wraps inside the badge on a 320 px phone; a duplicate row has no badges.
    await check('CB-LONG-NAME-FITS', async () => {
      const {context, page, errors} = await open(browser, NARROW, [darling(['AnUnbrokenCourtName'.repeat(6), 'Toshi Ranbo'], {inSession: true})]);
      const r = await page.evaluate(() => { const row = __CB_H.entry().querySelector('.adv-config-row'), box = row.getBoundingClientRect();
        return {fits: row.scrollWidth <= row.clientWidth + 1 && __CB_H.badges().every(b => b.getBoundingClientRect().right <= box.right + 1), errors: 0}; });
      await context.close();
      return [r.fits && errors.length === 0, {r, errors}];
    });
    await check('CB-DUPLICATE-ROW-NO-BADGES', async () => {
      const {context, page, errors} = await open(browser, PHONE, [darling(['Kyuden Doji']), darling(['Otosan Uchi'])]);
      const r = await page.evaluate(() => [...document.querySelectorAll('#advList .entry')].map(d => d.querySelectorAll('.court4514-courts > button').length));
      await context.close();
      return [r.length === 2 && r[0] === 2 && r[1] === 0 && errors.length === 0, {r, errors}];
    });
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
