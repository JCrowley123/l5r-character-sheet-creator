'use strict';
// Release 15a, follow-up 8b.1-UI-01 (PART H PHASE 15.1.21): the starting-spell review as option cards with live
// counts and one action bar (owner's approval of the mock-up, 11 November 2026).
//   node spell-review-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL, and every
// check that opens the dialog closes it, even when it fails. Oracles are independent of the layer: the School's own
// rulebook line (3 given, 3 Water, 2 Air, 1 Earth), the tick boxes themselves, the saved character before and after,
// Paragon's own option card, and the same dialog rendered again with the layer's body class taken away.
// The older character is built in the page from a fresh one, the way the older-holdings layer's own harness does, so
// this harness needs no fixture file from another folder.
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
const KITSU = 'Kitsu Shugenja', ISAWA = 'Isawa Shugenja';
const EIGHT = ['Sense', 'Commune', 'Summon', 'Reflective Pool', 'Reversal of Fortunes', 'Clarity of Purpose', 'Blessed Wind', 'Tempest of Air'];
const BALM = "Jurojin's Balm";

// Page-side helpers, installed once per page as window.SRH.
function install() {
  const T = window.__L5R_TEST__, fresh = T.collectData(), copy = v => JSON.parse(JSON.stringify(v));
  const R = e => { const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, right: r.right, bottom: r.bottom}; };
  const H = {};
  H.legacy = (schools, names) => {
    const d = copy(fresh);
    delete d.schoolReviewVersion;
    d.fields.f_clan = 'Lion'; d.fields.f_school = schools.at(-1);
    d.fields.f_schoolsData = JSON.stringify(schools.map((name, i) => ({name, frozen: i !== schools.length - 1, frozenRank: i !== schools.length - 1 ? 1 : null, floorRank: 1, anchorInsightRank: i})));
    d.skills = [];
    d.tech = names.map(name => { const s = T.SPELL_LIBRARY.find(s => s.name === name); return {name, cost: 0, spellElement: s.element.toLowerCase(), spellMastery: String(s.mastery), isMemorised: false}; });
    d.equip = names.map(name => ({name: 'Spell Scroll — ' + name, qty: '1', notes: 'Keep this note'}));
    return d;
  };
  H.close = () => { try { T.SC8.close(); } catch (e) {} };
  H.load = (schools, names) => { H.close(); T.applyData(H.legacy(schools, names)); T.MODES12.set('management'); };
  H.extra = n => T.SPELL_LIBRARY.filter(s => ['Water', 'Air', 'Earth'].includes(s.element) && s.mastery === 1 && !s.maho).map(s => s.name).slice(0, n);
  H.open = school => T.SC8.open(school, 'spell');
  H.dump = () => JSON.stringify(T.collectData());
  H.inputs = () => [...document.querySelectorAll('#sc8Body input.oc8-spell')];
  H.tick = names => H.inputs().forEach(i => { if (names.includes(i.value) !== i.checked) i.click(); });
  H.heads = () => [...document.querySelectorAll('#sc8Body fieldset')].map(f => { const c = f.querySelector('.sr15-count'), n = f.querySelector('.sr15-name');
    return {legend: f.querySelector('legend').textContent, name: n ? n.textContent : null, count: c ? c.textContent : null, state: c ? c.dataset.state : null,
      bg: c ? getComputedStyle(c).backgroundColor : null, ticked: f.querySelectorAll('input:checked').length}; });
  H.state = () => {
    const d = document.getElementById('sc8Dialog');
    if (!d) return null;
    const body = d.querySelector('#sc8Body'), confirm = d.querySelector('.oc8-confirm'), done = d.querySelector('#sc8Done'), groups = d.querySelector('.sr15-groups');
    const cards = [...d.querySelectorAll('.oc8-held-spell')], ps = [...body.querySelectorAll(':scope > p')], sets = [...d.querySelectorAll('fieldset')];
    const style = e => { const s = getComputedStyle(e); return {border: s.borderTopWidth + ' ' + s.borderTopStyle, radius: s.borderTopLeftRadius, font: s.fontSize, family: s.fontFamily, transform: s.textTransform}; };
    return {open: d.open, dressed: d.classList.contains('sr15-review'), display: getComputedStyle(d).display, dialog: R(d), dialogScrolls: d.scrollHeight > d.clientHeight + 1,
      viewport: {w: innerWidth, h: innerHeight},
      wrapper: !!groups && groups.parentElement === body, setsInWrapper: groups ? groups.querySelectorAll(':scope > fieldset').length : 0, setsInBody: body.querySelectorAll(':scope > fieldset').length, sets: sets.length,
      confirmInBody: !!confirm && confirm.parentElement === body, doneInDialog: !!done && done.parentElement === d && d.lastElementChild === done,
      confirmBeforeDone: !!confirm && !!done && !!(confirm.compareDocumentPosition(done) & Node.DOCUMENT_POSITION_FOLLOWING),
      confirm: confirm ? Object.assign(R(confirm), {bg: getComputedStyle(confirm).backgroundColor, text: confirm.textContent}) : null,
      done: done ? Object.assign(R(done), {bg: getComputedStyle(done).backgroundColor, text: done.textContent, shown: done.getClientRects().length > 0}) : null,
      groups: groups ? Object.assign(R(groups), {scrollHeight: groups.scrollHeight, clientHeight: groups.clientHeight, scrollTop: groups.scrollTop, divider: getComputedStyle(groups).borderBottomWidth}) : null,
      ps: ps.map(R), cards: cards.map(R), card: cards[0] ? style(cards[0]) : null, setLefts: sets.map(f => Math.round(R(f).x)),
      message: {text: document.getElementById('sc8Message').textContent, shown: document.getElementById('sc8Message').getClientRects().length > 0,
        h: document.getElementById('sc8Message').getBoundingClientRect().height},
      ink: getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()};
  };
  window.SRH = H;
}
function paragonCard() {
  const o = document.querySelector('#advConfigGrid .p4518-option'), s = getComputedStyle(o);
  return {border: s.borderTopWidth + ' ' + s.borderTopStyle, radius: s.borderTopLeftRadius, font: s.fontSize, family: s.fontFamily, transform: s.textTransform};
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

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [D, opts] of Object.entries(DEVICES)) {
      const {context, page, errors} = await open(browser, opts);
      const load = (schools, names) => page.evaluate(([s, n]) => window.SRH.load(s, n), [schools, names]);
      const openReview = async school => { const ok = await page.evaluate(s => window.SRH.open(s), school); await settle(page); return ok; };
      const state = () => page.evaluate(() => window.SRH.state());
      const heads = () => page.evaluate(() => window.SRH.heads());
      const close = () => page.evaluate(() => window.SRH.close());
      const base = async () => { await load([KITSU], EIGHT.concat(BALM)); return openReview(KITSU); };
      const long = async () => { const extra = await page.evaluate(() => window.SRH.extra(60)); await load([KITSU], [...new Set(EIGHT.concat(BALM, extra))]); return openReview(KITSU); };

      await check('SR-SEAM-' + D, async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {on: T.SPELL_REVIEW_LAYOUT_ENABLED, api: !!(T.SR15 && T.SR15.installed), cls: document.body.classList.contains('sr15-on')}; });
        return [r.on === true && r.api && r.cls, r];
      });

      // Paragon's own option card, read live before anything else: the independent look the cards must match.
      let ref = null;
      try {
        await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('management'); const s = document.getElementById('advQuickAdd'); s.value = 'Paragon'; s.dispatchEvent(new Event('change', {bubbles: true})); });
        await page.waitForSelector('#advConfigGrid .p4518-option', {state: 'attached'});
        ref = await page.evaluate(paragonCard);
        await page.evaluate(() => { const x = document.getElementById('advConfigX'); if (x) x.click(); });
      } catch (e) { ref = {error: String(e).slice(0, 200)}; }

      let opened = await base(), s = await state(), h = await heads();
      await check('SR-DRESSED-NOTHING-MOVED-' + D, async () => [opened === true && s && s.open && s.dressed && s.display === 'grid' && s.wrapper && s.sets === 4 && s.setsInWrapper === 4 && s.setsInBody === 0 &&
        s.confirmInBody && s.doneInDialog && s.confirmBeforeDone && s.done.text === 'Later' && s.confirm.text === 'Confirm starting spells' &&
        // Code review, 11 November: the status message stays rendered while empty (so a refusal is announced) and takes no room.
        s.message.text === '' && s.message.shown && s.message.h === 0, s]);
      await check('SR-ACTIONS-ONE-BAR-' + D, async () => [near(s.confirm.y, s.done.y) && s.confirm.h >= 44 && s.done.h >= 44 && near(s.confirm.h, s.done.h) && s.done.right <= s.confirm.x - 6 &&
        s.done.x >= s.dialog.x && s.confirm.bottom <= s.dialog.bottom && s.confirm.bg !== s.done.bg && s.done.bg === 'rgba(0, 0, 0, 0)' && s.confirm.bg !== 'rgba(0, 0, 0, 0)', {confirm: s.confirm, done: s.done, dialog: s.dialog}]);
      await check('SR-COMMON-INSET-AND-GAP-' + D, async () => {
        const last = s.cards.reduce((a, c) => Math.max(a, c.bottom), 0), right = s.ps[0].right, left = s.ps[0].x;
        return [near(s.confirm.right, right) && near(s.groups.right, right) && near(s.groups.x, left) && s.confirm.y - last >= 12 && s.confirm.y >= s.groups.bottom && s.groups.divider === '1px' &&
          s.cards.every(c => c.x >= left && c.right <= right + 0.5), {last, confirm: s.confirm, p: s.ps[0], groups: s.groups}];
      });
      await check('SR-OPTION-CARDS-' + D, async () => [s.cards.length === 9 && s.cards.every(c => c.h >= 44) && s.card.border === '1px solid' && s.card.radius === '6px' && s.card.transform === 'none' &&
        ref && JSON.stringify(s.card) === JSON.stringify(ref), {card: s.card, ref, heights: s.cards.map(c => c.h)}]);
      await check('SR-COUNTS-START-' + D, async () => [JSON.stringify(h.map(x => x.name)) === JSON.stringify(['Given by your School', 'Water', 'Air', 'Earth']) &&
        JSON.stringify(h.map(x => x.count)) === JSON.stringify(['0 of 3 chosen', '0 of 3 chosen', '0 of 2 chosen', '0 of 1 chosen']) && h.every(x => x.state === 'open' && x.ticked === 0) &&
        // Code review, 11 November: the heading's own text reads with a space between the name and the count.
        JSON.stringify(h.map(x => x.legend)) === JSON.stringify(['Given by your School 0 of 3 chosen', 'Water 0 of 3 chosen', 'Air 0 of 2 chosen', 'Earth 0 of 1 chosen']), h]);
      await check('SR-COLUMNS-' + D, async () => { const lefts = [...new Set(s.setLefts)]; return [lefts.length === (D === 'PHONE' ? 1 : 2), s.setLefts]; });

      // A tap on the far end of a card ticks it; the heading follows each tick and un-tick.
      await check('SR-COUNTS-LIVE-' + D, async () => {
        const tap = async name => { const card = page.locator('#sc8Body label.oc8-held-spell', {hasText: name}); const b = await card.boundingBox(); await card.click({position: {x: b.width - 12, y: b.height / 2}}); await settle(page); };
        await tap('Reflective Pool'); const one = (await heads())[1];
        await tap('Reversal of Fortunes'); await tap('Clarity of Purpose'); const three = (await heads())[1];
        await tap('Reversal of Fortunes'); const two = await heads();
        return [one.count === '1 of 3 chosen' && one.state === 'open' && one.ticked === 1 && three.count === '3 of 3 chosen ✓' && three.state === 'done' && three.ticked === 3 && three.bg !== one.bg &&
          two[1].count === '2 of 3 chosen' && two[1].state === 'open' && two[0].count === '0 of 3 chosen' && two[2].count === '0 of 2 chosen' && two[3].count === '0 of 1 chosen', {one, three, two}];
      });

      await check('SR-LATER-NO-WRITES-' + D, async () => {
        await base();
        const before = await page.evaluate(() => window.SRH.dump());
        await page.evaluate(n => window.SRH.tick(n), ['Sense', 'Blessed Wind']);
        const mid = await heads();
        await page.locator('#sc8Done').click(); await settle(page);
        const gone = await page.evaluate(() => !document.getElementById('sc8Dialog')), after = await page.evaluate(() => window.SRH.dump());
        await openReview(KITSU); const again = await heads();
        return [mid[0].count === '1 of 3 chosen' && mid[2].count === '1 of 2 chosen' && gone && before === after && again.every(x => x.ticked === 0 && /^0 of \d chosen$/.test(x.count)), {mid, gone, same: before === after, again}];
      });

      await base();
      await page.evaluate(n => window.SRH.tick(n), EIGHT);
      const ready = await heads();
      await page.locator('#sc8Body .oc8-confirm').click(); await settle(page);
      const saved = await page.evaluate(([school, balm]) => { const d = window.__L5R_TEST__.collectData(); return {school: d.tech.filter(t => t.schoolChoice && t.schoolChoice.school === school).length,
        reward: !!(d.tech.find(t => t.name === balm) || {}).schoolChoice, earth: !!document.getElementById('cw1123PickEarth'), others: !!document.querySelector('#cw1123PickWater, #cw1123PickAir')}; }, [KITSU, BALM]);
      s = await state();
      await check('SR-CONFIRM-SAVES-' + D, async () => [JSON.stringify(ready.map(x => x.count)) === JSON.stringify(['3 of 3 chosen ✓', '3 of 3 chosen ✓', '2 of 2 chosen ✓', '0 of 1 chosen']) &&
        saved.school === 8 && !saved.reward && saved.earth && !saved.others, {ready, saved}]);
      await check('SR-CHOOSER-UNDRESSED-' + D, async () => {
        const plain = s && s.open && !s.dressed && s.display === 'block' && !s.wrapper && s.sets === 0 && s.done.text === 'Done' && s.done.shown && s.doneInDialog;
        await page.locator('#sc8Done').click(); await settle(page);
        return [plain && await page.evaluate(() => !document.getElementById('sc8Dialog')), s];
      });

      // Twenty and more held spells: only the groups scroll, the bar stays put, and one Air tick too many is counted,
      // refused by Confirm and written nowhere.
      opened = await long(); s = await state();
      await check('SR-LONG-LIST-SCROLLS-' + D, async () => {
        const moved = await page.evaluate(() => { const g = document.querySelector('#sc8Dialog .sr15-groups'); g.scrollTop = g.scrollHeight; const last = [...g.querySelectorAll('.oc8-held-spell')].pop().getBoundingClientRect();
          return {scrollTop: g.scrollTop, lastBottom: last.bottom, groupsBottom: g.getBoundingClientRect().bottom}; });
        const after = await state();
        return [opened === true && s.cards.length >= 20 && s.groups.scrollHeight > s.groups.clientHeight + 40 && !s.dialogScrolls && s.dialog.bottom <= s.viewport.h && s.dialog.y >= 0 &&
          moved.scrollTop > 40 && near(after.confirm.y, s.confirm.y, 0.5) && near(after.done.y, s.done.y, 0.5) && moved.lastBottom <= moved.groupsBottom + 0.5 && after.confirm.y >= after.groups.bottom,
          {cards: s.cards.length, groups: s.groups, dialog: s.dialog, moved, before: s.confirm.y, after: after.confirm.y}];
      });
      await check('SR-COUNTS-OVER-REFUSED-' + D, async () => {
        const before = await page.evaluate(() => window.SRH.dump());
        await page.evaluate(() => { const air = [...document.querySelectorAll('#sc8Body fieldset')].find(f => f.querySelector('.sr15-name').textContent === 'Air'); [...air.querySelectorAll('input')].slice(0, 3).forEach(i => i.click()); });
        const over = (await heads())[2];
        await page.locator('#sc8Body .oc8-confirm').click(); await settle(page);
        const after = await state(), same = before === await page.evaluate(() => window.SRH.dump()), kept = (await heads())[2];
        return [over.count === '3 of 2 · deselect 1' && over.state === 'over' && same && after.dressed && after.wrapper && after.confirmInBody && after.doneInDialog && near(after.confirm.y, after.done.y) &&
          after.message.shown && /Air/.test(after.message.text) && after.ps.every(p => p.bottom <= after.groups.y + 0.5) && kept.count === over.count && kept.ticked === 3, {over, same, message: after.message, kept}];
      });
      await close();

      // The same dialog with this unit's body class taken away and rendered again is the older layout, untouched.
      await check('SR-SWITCH-CLASS-OFF-' + D, async () => {
        await base();
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__, b = document.body, S = window.SRH; const on = S.state();
          b.classList.remove('sr15-on'); T.SC8.render(); const off = S.state(), legends = S.heads().map(x => x.legend);
          b.classList.add('sr15-on'); T.SC8.render(); const back = S.state();
          return {on: on.dressed, off: {dressed: off.dressed, display: off.display, wrapper: off.wrapper, setsInBody: off.setsInBody, confirmInBody: off.confirmInBody}, legends, back: back.dressed && back.setsInWrapper === 4}; });
        await close();
        return [r.on && !r.off.dressed && r.off.display === 'block' && !r.off.wrapper && r.off.setsInBody === 4 && r.off.confirmInBody &&
          JSON.stringify(r.legends) === JSON.stringify(['Given · 3 left', 'Water · 3 left', 'Air · 2 left', 'Earth · 1 left']) && r.back, r];
      });

      // A School whose line is boxes, not Element counts: two instruction lines, headings without a number.
      await check('SR-SLOT-SCHOOL-' + D, async () => {
        const four = await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.filter(x => x.element === 'Water' && x.mastery === 1 && !x.maho).slice(0, 4).map(x => x.name));
        await load([ISAWA], four); const ok = await openReview(ISAWA); const t = await state(), hh = await heads();
        await close();
        const rows = t ? [...t.ps, t.groups] : [];
        return [ok === true && t.dressed && t.ps.length === 2 && rows.every((r, i) => i === 0 || r.y >= rows[i - 1].bottom - 0.5) && t.cards.length === 4 && t.cards.every(c => c.h >= 44) &&
          near(t.confirm.y, t.done.y) && t.confirm.y >= t.groups.bottom && hh.length >= 1 && hh.every(x => x.name && x.count === null && x.name === x.legend), {t, hh}];
      });

      await check('SR-NO-ERRORS-' + D, async () => [errors.length === 0, errors]);
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
