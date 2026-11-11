'use strict';
// Release 15a, follow-up 8b.1-UI-02 (PART H PHASE 15.1.22): a spell row's name readable on a phone, and one School tag
// (owner's approval of the mock-up, 11 November 2026).   node spell-name-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: the School-choice layer's own label text (still in the row, not drawn), each
// name box's own scroll width, the saved character, and the same rows with the layer's body class taken away.
// The character is built in the page from a fresh one: two School spells, a reward, a reward with the longest name in
// the catalogue, and a School Technique that is not a spell. Thresholds hold with or without the next unit
// (8b.1-UI-03), which narrows the Manage name box on a phone by the width of the Remove corner.
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
const KITSU = 'Kitsu Shugenja', ISAWA = 'Isawa Shugenja', LONG = 'Wrath of Kaze-no-Kami (Hurricane)', BALM = "Jurojin's Balm";

function install() {
  const T = window.__L5R_TEST__, fresh = T.collectData(), copy = v => JSON.parse(JSON.stringify(v));
  const H = {};
  const grant = (name, school, others) => Object.assign({version: 1, stage: 'starting', kind: 'spell', school, name, created: false}, others ? {otherSchools: others} : {});
  H.data = many => {
    const d = copy(fresh), schools = many ? ['Kitsu Shugenja', 'Isawa Shugenja'] : ['Kitsu Shugenja'];
    d.fields.f_clan = 'Lion'; d.fields.f_school = schools.at(-1);
    d.fields.f_schoolsData = JSON.stringify(schools.map((name, i) => ({name, frozen: i !== schools.length - 1, frozenRank: i !== schools.length - 1 ? 1 : null, floorRank: 1, anchorInsightRank: i})));
    d.skills = [];
    const spell = (name, g) => { const s = T.SPELL_LIBRARY.find(s => s.name === name); return Object.assign({name, cost: 0, desc: 'Layout sample text for ' + name + '.', spellElement: s.element.toLowerCase(), spellMastery: String(s.mastery), isMemorised: false}, g ? {schoolChoice: g} : {}); };
    const g1 = grant('Sense', 'Kitsu Shugenja'), g2 = grant('Clarity of Purpose', 'Kitsu Shugenja', many ? ['Isawa Shugenja'] : null);
    d.tech = [{name: 'Eyes of the Ancestors', cost: 0, desc: 'School Technique'}, spell('Sense', g1), spell('Clarity of Purpose', g2), spell("Jurojin's Balm"), spell('Wrath of Kaze-no-Kami (Hurricane)')];
    d.equip = [{name: 'Spell Scroll — Sense', qty: '1', notes: '', schoolChoice: g1}, {name: 'Spell Scroll — Clarity of Purpose', qty: '1', notes: '', schoolChoice: g2},
      {name: "Spell Scroll — Jurojin's Balm", qty: '1', notes: ''}, {name: 'Spell Scroll — Wrath of Kaze-no-Kami (Hurricane)', qty: '1', notes: ''}];
    return d;
  };
  H.load = (many, mode) => { T.applyData(H.data(many)); T.MODES12.set(mode || 'management'); };
  H.rows = () => [...document.querySelectorAll('#techList .entry')].map(row => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, right: r.right, bottom: r.bottom, mid: r.top + r.height / 2}; };
    const drawn = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
    const top = row.querySelector('.entry-top'), name = row.querySelector('.en-name'), tag = row.querySelector('.sn15-tag'), src = row.querySelector('.sc8-source'), s = getComputedStyle(name);
    const cast = row.querySelector('.spell-cast-btn'), why = row.querySelector('.cast-why-btn'), memo = row.querySelector('.spell-memo-label'), box = row.querySelector('.spell-memo-checkbox');
    return {spell: !!row.dataset.spellElement, value: name.value, readOnly: name.readOnly, room: Math.max(0, name.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)), fits: name.scrollWidth <= name.clientWidth,
      wrap: getComputedStyle(top).flexWrap, top: R(top), name: R(name), cast: R(cast), why: R(why), memo: R(memo), checked: box ? box.checked : null, locked: box ? box.disabled : null,
      tags: row.querySelectorAll('.sn15-tag').length, tag: tag ? {text: tag.textContent, drawn: drawn(tag), box: R(tag)} : null, source: src ? {text: src.textContent, drawn: drawn(src)} : null,
      card: R(row), overflow: row.scrollWidth - row.clientWidth, grant: row.dataset.sc8Grant || null};
  });
  window.SNH = H;
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
const near = (a, b, t = 1.5) => Math.abs(a - b) <= t;
const sameLine = (a, b) => a.y < b.bottom && b.y < a.bottom;

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const PHONE = D === 'PHONE';
      const {context, page, errors} = await open(browser, opts);
      const load = async (many, mode) => { await page.evaluate(([m, o]) => window.SNH.load(m, o), [many, mode]); await goTab(page, 'Techniques'); };
      const rows = () => page.evaluate(() => window.SNH.rows());

      await check('SN-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.SPELL_NAME_LINE_ENABLED, api: !!(T.SN15 && T.SN15.installed), cls: document.body.classList.contains('sn15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });

      await load(false);
      let all = await rows(), spells = all.filter(r => r.spell), tech = all.find(r => !r.spell);
      const [sense, clarity, balm, long] = spells;
      await check('SN-NAME-READABLE-' + D, async () => [spells.length === 4 && spells.every(r => r.fits && r.room >= (PHONE ? 250 : 700) && r.overflow <= 0) && long.value === LONG,
        spells.map(r => [r.value, r.room, r.fits, r.overflow])]);
      await check('SN-LINES-' + D, async () => [spells.every(r => PHONE
        ? r.cast.y >= r.name.bottom && sameLine(r.cast, r.why) && sameLine(r.cast, r.memo) && near(r.name.x, r.cast.x) && (!r.tag || sameLine(r.tag.box, r.cast))
        : sameLine(r.name, r.cast) && sameLine(r.name, r.memo) && (!r.tag || sameLine(r.tag.box, r.name)) && r.cast.x > r.name.right),
        spells.map(r => ({name: r.name, cast: r.cast, memo: r.memo, tag: r.tag}))]);
      await check('SN-TAG-SCHOOL-' + D, async () => [[sense, clarity].every(r => r.tags === 1 && r.tag.drawn && r.tag.text === 'School spell' && r.source && !r.source.drawn && r.source.text === 'School: ' + KITSU &&
        r.tag.box.right <= r.top.right + 0.5 && r.tag.box.x >= r.memo.right && r.tag.box.right <= r.card.right), [sense.tag, sense.source, sense.top, sense.memo]]);
      await check('SN-REWARD-NO-TAG-' + D, async () => [[balm, long].every(r => r.tags === 0 && !r.source && !r.grant) && tech && tech.tags === 0 && tech.wrap === 'nowrap' && tech.value === 'Eyes of the Ancestors',
        {balm: [balm.tags, balm.source], tech: tech && [tech.tags, tech.wrap]}]);
      await check('SN-CONTROLS-' + D, async () => {
        const off = await page.evaluate(() => { const b = document.body; b.classList.remove('sn15-on'); const r = window.SNH.rows().filter(x => x.spell)[2]; b.classList.add('sn15-on'); return {cast: r.cast.h, why: r.why.h, memo: r.memo.h}; });
        return [spells.every(r => PHONE ? r.cast.h >= 44 && r.why.h >= 44 && r.memo.h >= 44 : near(r.cast.h, off.cast, 0.5) && near(r.why.h, off.why, 0.5) && near(r.memo.h, off.memo, 0.5)), {off, on: [sense.cast.h, sense.why.h, sense.memo.h]}];
      });

      // The tag is drawing only: the save is the same with it there, with it deleted, and with the layer's class off.
      await check('SN-DATA-UNCHANGED-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__, b = document.body, on = JSON.stringify(T.collectData());
          const want = JSON.stringify(window.SNH.data(false).tech.map(t => t.schoolChoice || null)), got = JSON.stringify(T.collectData().tech.map(t => t.schoolChoice || null));
          b.classList.remove('sn15-on'); document.querySelectorAll('.sn15-tag').forEach(t => t.remove()); const off = JSON.stringify(T.collectData()); b.classList.add('sn15-on'); T.recalcAll();
          return {same: on === off, grants: want === got, back: document.querySelectorAll('#techList .sn15-tag').length}; });
        return [r.same && r.grants && r.back === 2, r];
      });

      // The label is removed and written again by the School-choice layer: the tag follows it both ways.
      await check('SN-TAG-FOLLOWS-GRANT-' + D, async () => {
        const record = await page.evaluate(() => { const T = window.__L5R_TEST__, row = T.SC8.spellRow('Sense'), rec = T.SC8.read(row, 'spell'); T.SC8.write(row, null); return rec; });
        await settle(page); const gone = (await rows()).filter(r => r.spell)[0];
        await page.evaluate(rec => { const T = window.__L5R_TEST__; T.SC8.write(T.SC8.spellRow('Sense'), rec); }, record);
        await settle(page); const back = (await rows()).filter(r => r.spell)[0];
        return [!!record && gone.tags === 0 && !gone.source && back.tags === 1 && back.tag.text === 'School spell' && back.tag.drawn, {record, gone: gone.tags, back: back.tag}];
      });

      await check('SN-EDIT-SAVE-REOPEN-' + D, async () => {
        await load(false);
        const field = page.locator('#techList .entry[data-spell-element]').nth(2).locator('.en-name');
        await field.fill("Jurojin's Balm, renamed"); await field.dispatchEvent('change'); await settle(page);
        const saved = await page.evaluate(() => window.__L5R_TEST__.collectData());
        await page.evaluate(d => { const T = window.__L5R_TEST__; T.applyData(d); T.MODES12.set('management'); }, saved); await goTab(page, 'Techniques');
        const s = (await rows()).filter(r => r.spell), t = saved.tech.find(x => x.name === "Jurojin's Balm, renamed");
        return [!!t && !t.schoolChoice && s[2].value === "Jurojin's Balm, renamed" && s[2].tags === 0 && s[2].fits && s[0].tag && s[0].tag.text === 'School spell' && s[0].grant &&
          saved.tech.filter(x => x.schoolChoice).length === 2, {t, row: [s[2].value, s[2].tags], first: s[0].tag}];
      });

      await check('SN-MEMO-TAP-' + D, async () => {
        await load(false);
        const label = page.locator('#techList .entry[data-spell-element]').nth(1).locator('.spell-memo-label'), b = await label.boundingBox();
        await label.scrollIntoViewIfNeeded(); await settle(page);
        await label.click({position: {x: b.width - 5, y: b.height / 2}}); await settle(page);
        const s = (await rows()).filter(r => r.spell);
        return [JSON.stringify(s.map(r => r.checked)) === JSON.stringify([false, true, false, false]), s.map(r => r.checked)];
      });

      await check('SN-MULTI-SCHOOL-' + D, async () => {
        await load(true);
        const s = (await rows()).filter(r => r.spell);
        return [s[0].tag.text === KITSU && s[1].tag.text === KITSU + ' · ' + ISAWA && [s[0], s[1]].every(r => r.tag.drawn && r.tag.text === r.source.text.replace(/^School: /, '') && !r.source.drawn &&
          r.tag.box.right <= r.card.right && r.tag.box.x >= r.card.x && r.overflow <= 0 && r.fits) && s[2].tags === 0 && s[3].tags === 0, s.slice(0, 2).map(r => [r.tag, r.source, r.overflow])];
      });

      await check('SN-PLAY-' + D, async () => {
        await load(false, 'play');
        const s = (await rows()).filter(r => r.spell);
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
        return [s.every(r => r.readOnly && r.locked && r.fits && r.room >= (PHONE ? 298 : 700)) && s[0].tag.drawn && s[0].tag.text === 'School spell' && s[2].tags === 0, s.map(r => [r.readOnly, r.locked, r.room, r.fits, r.tag && r.tag.text])];
      });

      await check('SN-CLASS-OFF-' + D, async () => {
        await load(false);
        const r = await page.evaluate(() => { const b = document.body; b.classList.remove('sn15-on'); const off = window.SNH.rows().filter(x => x.spell)[0]; b.classList.add('sn15-on'); const on = window.SNH.rows().filter(x => x.spell)[0];
          return {off: {wrap: off.wrap, tag: off.tag && off.tag.drawn, source: off.source && off.source.drawn}, on: {wrap: on.wrap, tag: on.tag && on.tag.drawn, source: on.source && on.source.drawn}}; });
        return [r.off.wrap === 'nowrap' && r.off.tag === false && r.off.source === true && r.on.wrap === 'wrap' && r.on.tag === true && r.on.source === false, r];
      });

      await check('SN-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
