'use strict';
// Release 15a, follow-up 8b.1-UI-03 (PART H PHASE 15.1.23): Remove in its own clear corner of a spell row, apart from
// Memorised (owner's approval of the mock-up, 11 November 2026).   node spell-remove-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: the boxes of everything else on the row, a Technique card's own Remove, real
// taps at the edges of the targets, the saved character, and the same rows with the layer's body class taken away.
// The character is built in the page from a fresh one: a School Technique, two School spells, a reward, and a reward
// with the longest name in the catalogue. Thresholds hold with or without the unit before this one (8b.1-UI-02).
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
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
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const goTab = async (page, tab) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; if (C) { C.goToTab(l); await C.whenSettled(); } }, tab); await settle(page); };
const BALM = "Jurojin's Balm", LONG = 'Wrath of Kaze-no-Kami (Hurricane)';

function install() {
  const T = window.__L5R_TEST__, fresh = T.collectData(), copy = v => JSON.parse(JSON.stringify(v));
  const H = {};
  const grant = name => ({version: 1, stage: 'starting', kind: 'spell', school: 'Kitsu Shugenja', name, created: false});
  H.data = () => {
    const d = copy(fresh);
    d.fields.f_clan = 'Lion'; d.fields.f_school = 'Kitsu Shugenja';
    d.fields.f_schoolsData = JSON.stringify([{name: 'Kitsu Shugenja', frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0}]);
    d.skills = [];
    const spell = (name, g) => { const s = T.SPELL_LIBRARY.find(s => s.name === name); return Object.assign({name, cost: 0, desc: 'Layout sample text for ' + name + '.', spellElement: s.element.toLowerCase(), spellMastery: String(s.mastery), isMemorised: false}, g ? {schoolChoice: g} : {}); };
    d.tech = [{name: 'Eyes of the Ancestors', cost: 0, desc: 'School Technique'}, spell('Sense', grant('Sense')), spell('Clarity of Purpose', grant('Clarity of Purpose')), spell("Jurojin's Balm"), spell('Wrath of Kaze-no-Kami (Hurricane)')];
    d.equip = [{name: 'Spell Scroll — Sense', qty: '1', notes: '', schoolChoice: grant('Sense')}, {name: 'Spell Scroll — Clarity of Purpose', qty: '1', notes: '', schoolChoice: grant('Clarity of Purpose')},
      {name: "Spell Scroll — Jurojin's Balm", qty: '1', notes: ''}, {name: 'Spell Scroll — Wrath of Kaze-no-Kami (Hurricane)', qty: '1', notes: ''}];
    return d;
  };
  H.load = mode => { T.applyData(H.data()); T.MODES12.set(mode || 'management'); };
  H.rows = () => [...document.querySelectorAll('#techList .entry')].map(row => {
    const R = e => { const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, right: r.right, bottom: r.bottom}; };
    const drawn = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const rm = row.querySelector(':scope > .rm-btn'), name = row.querySelector('.en-name'), top = row.querySelector('.entry-top'), s = getComputedStyle(name), card = R(row);
    const b = drawn(rm) ? R(rm) : null, overlaps = {};
    if (b) for (const q of ['.en-name', '.sc8-source', '.sn15-tag', '.spell-cast-btn', '.cast-why-btn', '.spell-memo-label', '.en-desc', 'input[type=number]']) {
      const e = row.querySelector(q); if (!drawn(e)) continue; const a = R(e);
      const w = Math.min(a.right, b.right) - Math.max(a.x, b.x), h = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y);
      if (w > 0.5 && h > 0.5) overlaps[q] = [Math.round(w), Math.round(h)];
    }
    const box = row.querySelector('.spell-memo-checkbox');
    return {spell: !!row.dataset.spellElement, value: name.value, card, height: card.h, rm: b, fromCorner: b ? {right: card.right - (b.x + b.w / 2), top: (b.y + b.h / 2) - card.y} : null, overlaps,
      room: Math.max(0, name.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)), fits: name.scrollWidth <= name.clientWidth,
      wrap: getComputedStyle(top).flexWrap, padRight: getComputedStyle(top).paddingRight, checked: box ? box.checked : null, grant: !!row.dataset.sc8Grant, overflow: row.scrollWidth - row.clientWidth};
  });
  H.off = () => { const b = document.body; b.classList.remove('sx15-on'); const r = H.rows(); b.classList.add('sx15-on'); return r; };
  window.SXH = H;
}
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(() => { try { window.__L5R_TEST__.CL11.close(); } catch (e) {} });
  await page.evaluate(install);
  return {context, page, errors};
}
const near = (a, b, t = 0.75) => Math.abs(a - b) <= t;

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const PHONE = D === 'PHONE';
      const {context, page, errors} = await open(browser, opts);
      const load = async mode => { await page.evaluate(m => window.SXH.load(m), mode); await goTab(page, 'Techniques'); };
      const rows = () => page.evaluate(() => window.SXH.rows());
      const names = async () => (await rows()).map(r => r.value);

      await check('SX-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.SPELL_REMOVE_CORNER_ENABLED, api: !!(T.SX15 && T.SX15.installed), cls: document.body.classList.contains('sx15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });

      await load();
      const all = await rows(), spells = all.filter(r => r.spell), tech = all.find(r => !r.spell), off = await page.evaluate(() => window.SXH.off());
      const offSpells = off.filter(r => r.spell), offTech = off.find(r => !r.spell);
      await check('SX-CORNER-CLEAR-' + D, async () => [spells.length === 4 && spells.every(r => r.rm && Object.keys(r.overlaps).length === 0), spells.map(r => [r.value, r.overlaps])]);
      await check('SX-TARGET-' + D, async () => [spells.every(r => r.rm.w >= 44 && r.rm.h >= 44 && r.rm.x >= r.card.x && r.rm.right <= r.card.right && r.rm.y >= r.card.y && r.rm.bottom <= r.card.bottom), spells.map(r => r.rm)]);
      // The same corner as a card this unit does not touch: the centres of the two crosses sit within 10 px.
      await check('SX-SAME-CORNER-' + D, async () => [!!tech && !!tech.rm && spells.every(r => Math.abs(r.fromCorner.right - tech.fromCorner.right) <= 10 && Math.abs(r.fromCorner.top - tech.fromCorner.top) <= 10),
        {tech: tech && tech.fromCorner, spell: spells[0].fromCorner}]);
      await check('SX-NAME-READABLE-' + D, async () => [spells.every(r => r.fits && r.room >= (PHONE ? 250 : 650) && r.overflow <= 0) && spells[3].value === LONG, spells.map(r => [r.value, r.room, r.fits])]);
      await check('SX-HEIGHT-' + D, async () => [spells.every((r, i) => PHONE ? r.height - offSpells[i].height <= 50 && r.height >= offSpells[i].height - 0.75 : near(r.height, offSpells[i].height)),
        spells.map((r, i) => [r.height, offSpells[i].height])]);
      await check('SX-OTHER-CARDS-UNTOUCHED-' + D, async () => [JSON.stringify([tech.rm, tech.wrap, tech.padRight, tech.height, tech.room]) === JSON.stringify([offTech.rm, offTech.wrap, offTech.padRight, offTech.height, offTech.room]) &&
        tech.rm.w < 44.5 && tech.wrap === 'nowrap', {on: [tech.rm, tech.wrap, tech.padRight], off: [offTech.rm, offTech.wrap, offTech.padRight]}]);
      // With the body class off, the cross is its old size and covers something on every spell row again.
      await check('SX-CLASS-OFF-' + D, async () => [offSpells.every(r => r.rm && r.rm.w < 44 && Object.keys(r.overlaps).length >= 1) && (await rows()).filter(r => r.spell).every(r => Object.keys(r.overlaps).length === 0),
        offSpells.map(r => [r.rm && r.rm.w, r.overlaps])]);

      // Real taps at the edges: Memorised's far end changes only that spell; Remove's outer edge removes only that row.
      await check('SX-TAP-EDGES-' + D, async () => {
        const row = i => page.locator('#techList .entry[data-spell-element]').nth(i);
        const label = row(1).locator('.spell-memo-label'); await label.scrollIntoViewIfNeeded(); await settle(page);
        const lb = await label.boundingBox(); await label.click({position: {x: lb.width - 4, y: lb.height / 2}}); await settle(page);
        const afterMemo = (await rows()).filter(r => r.spell);
        const rm = row(2).locator(':scope > .rm-btn'); await rm.scrollIntoViewIfNeeded(); await settle(page);
        const rb = await rm.boundingBox(); await rm.click({position: {x: 3, y: rb.height - 3}}); await settle(page);
        const left = await names(), saved = await page.evaluate(() => window.__L5R_TEST__.collectData().tech.map(t => [t.name, !!t.schoolChoice, !!t.isMemorised]));
        return [afterMemo.length === 4 && JSON.stringify(afterMemo.map(r => r.checked)) === JSON.stringify([false, true, false, false]) &&
          JSON.stringify(left) === JSON.stringify(['Eyes of the Ancestors', 'Sense', 'Clarity of Purpose', LONG]) &&
          JSON.stringify(saved) === JSON.stringify([['Eyes of the Ancestors', false, false], ['Sense', true, false], ['Clarity of Purpose', true, true], [LONG, false, false]]), {memo: afterMemo.map(r => r.checked), left, saved}];
      });

      // Removing a School spell with the cross takes that row and leaves the other School spell's grant alone.
      await check('SX-SCHOOL-REMOVE-' + D, async () => {
        await load();
        const rm = page.locator('#techList .entry[data-spell-element]').nth(0).locator(':scope > .rm-btn'); await rm.scrollIntoViewIfNeeded(); await settle(page);
        await rm.click(); await settle(page);
        const left = (await rows()).filter(r => r.spell), saved = await page.evaluate(() => window.__L5R_TEST__.collectData().tech.filter(t => t.schoolChoice).map(t => t.name));
        return [JSON.stringify(left.map(r => r.value)) === JSON.stringify(['Clarity of Purpose', BALM, LONG]) && left[0].grant && JSON.stringify(saved) === JSON.stringify(['Clarity of Purpose']) &&
          left.every(r => Object.keys(r.overlaps).length === 0), {left: left.map(r => [r.value, r.grant]), saved}];
      });

      await check('SX-PLAY-' + D, async () => {
        await load('play');
        const s = (await rows()).filter(r => r.spell), o = (await page.evaluate(() => window.SXH.off())).filter(r => r.spell);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
        return [s.length === 4 && s.every((r, i) => !r.rm && r.fits && (PHONE ? r.room >= 298 : near(r.room, o[i].room, 1)) && near(r.height, o[i].height) || (PHONE && !r.rm && r.fits && r.room >= 298 && r.height - o[i].height <= 50)),
          s.map((r, i) => [!!r.rm, r.room, o[i].room, r.height, o[i].height])];
      });

      await check('SX-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
