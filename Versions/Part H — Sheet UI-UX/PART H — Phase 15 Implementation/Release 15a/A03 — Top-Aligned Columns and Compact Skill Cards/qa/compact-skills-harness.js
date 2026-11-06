'use strict';
// Release 15a, A03 (PART H PHASE 15.1.3): top-aligned Advantage/Disadvantage columns and compact phone Skill cards.
//   node compact-skills-harness.js <sheet.html> [--variant]
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: the page's own labels, fields and cells, what the browser reports at a point
// (elementFromPoint), the row's own field values, the fixture, and the same page with the layer's class taken away.
// The layer is never asked where anything should be or what its summary should say.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const FIX = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'a03-fixtures.json'), 'utf8'));
const seen = {};
const errors = [];
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 900));
};
const PHONE = {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true};
const SMALL = {viewport: {width: 375, height: 667}, isMobile: true, hasTouch: true};
const NARROW = {viewport: {width: 320, height: 568}, isMobile: true, hasTouch: true};
const WIDE_PHONE = {viewport: {width: 540, height: 900}, isMobile: true, hasTouch: true};
const TABLET = {viewport: {width: 700, height: 1000}, isMobile: true, hasTouch: true};
const DESKTOP = {viewport: {width: 1440, height: 1000}};

// In-page helpers, from the page's own elements only.
function helpers() {
  const rect = e => { const r = e.getBoundingClientRect(); return {left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height}; };
  // checkVisibility() also rules out content laid out but never drawn.
  const shown = e => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && e.getClientRects().length > 0 &&
    (typeof e.checkVisibility !== 'function' || e.checkVisibility({visibilityProperty: true}));
  const overlap = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const hits = e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)); };
  const page = () => [...document.querySelectorAll('.car-page:not([data-clone])')].find(p => !p.hidden && !p.inert && Math.abs(p.getBoundingClientRect().left) < 5) || null;
  const rows = () => [...document.querySelectorAll('#skillsBody > tr')];
  const row = name => rows().find(t => t.querySelector('.sk-name').value === name) || null;
  const toggle = tr => tr.querySelector('.cs15-toggle');
  const parts = tr => ({name: tr.querySelector('.sk-name'), rank: tr.querySelector('.sk-rank'), roll: tr.querySelector('.sk-roll'),
    toggle: toggle(tr), eye: tr.querySelector('.sk-info-btn')});
  // Everything A03 puts under Details, from the row's own markup: the fields after the first row, the Mastery notes
  // (when the Skill has any), the Emphasis widgets and Remove. In Play some are hidden by Phase 12 (Part K) anyway.
  const secondary = tr => {
    const out = {trait: tr.querySelector('.sk-trait'), school: tr.querySelector('.sk-school'), xp: tr.querySelector('td.sk-cost'),
      emphAdd: tr.querySelector('.emph-add-btn'), limit: tr.querySelector('.emph-limit-note'), remove: tr.querySelector('.rm-btn:not(.emph-item-del)')};
    const m = tr.querySelector('.sk-mastery-note'); if (m && m.children.length) out.mastery = m;
    [...tr.querySelectorAll('.emph-container .emph-item-row')].forEach((e, i) => { out['emph' + i] = e; });
    return out;
  };
  // The summary a reader should see, from the row's own fields: Trait, the Emphases, and School when ticked.
  const expectSummary = tr => {
    const v = e => e ? String(e.value || '').trim() : '';
    const p = [];
    if (v(tr.querySelector('.sk-trait'))) p.push(v(tr.querySelector('.sk-trait')));
    const em = [...tr.querySelectorAll('.emph-container .sk-emph-select, .emph-container .sk-emph-text')].map(v).filter(Boolean);
    if (em.length) p.push(em.join(', '));
    if (tr.querySelector('.sk-school').checked) p.push('School');
    return p.join(' · ');
  };
  const scroll = where => { const p = page(); if (p) p.scrollTop = where === 'top' ? 0 : where === 'end' ? p.scrollHeight : where; return p ? p.scrollTop : null; };
  // One closed card: its first row (name, Rank, roll side by side and level), its second row (Details and the eye)
  // below it, nothing wider than the card.
  const card = tr => {
    const P = parts(tr), out = {name: P.name.value, h: Math.round(rect(tr).height)};
    out.firstShown = ['name', 'rank', 'roll'].every(k => shown(P[k]));
    if (!out.firstShown || !P.toggle) return out;
    const n = rect(P.name), r = rect(P.rank), d = rect(P.roll), t = rect(P.toggle), e = rect(P.eye), c = rect(tr);
    const level = (a, b) => a.top < b.bottom && b.top < a.bottom;
    out.firstRow = level(n, r) && level(r, d) && level(n, d) && n.right <= r.left + 0.5 && r.right <= d.left + 0.5;
    out.secondRow = shown(P.toggle) && shown(P.eye) && t.top >= Math.max(n.bottom, r.bottom, d.bottom) - 1 && level(t, e) && t.right <= e.left + 0.5;
    out.inside = [n, r, d, t, e].every(b => b.left >= c.left - 0.5 && b.right <= c.right + 0.5);
    out.noOverflow = tr.scrollWidth <= tr.clientWidth + 1;
    out.nameWidth = Math.round(n.width);
    return out;
  };
  window.__cs = {rect, shown, overlap, hits, page, rows, row, toggle, parts, secondary, expectSummary, scroll, card};
}
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function open(browser, opts, fixture) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready && window.__L5R_CAROUSEL__);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(d => { const T = window.__L5R_TEST__; T.CL11.close(); T.applyData(d); }, FIX[fixture || 'longSkills']);
  await page.evaluate(helpers);
  await settle(page);
  return {context, page};
}
const mode = (page, m) => page.evaluate(x => window.__L5R_TEST__.MODES12.set(x), m);
async function go(page, label) {
  await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label);
  await settle(page);
}
async function load(page, fixture) {
  await page.evaluate(d => window.__L5R_TEST__.applyData(d), FIX[fixture]);
  await settle(page);
}
async function session(browser, opts, body, fixture) {
  let s;
  try {
    s = await open(browser, opts, fixture);
    await body(s.page);
  } catch (e) {
    console.log('  scenario error: ' + String(e && e.stack || e).slice(0, 600));
    errors.push('scenario: ' + String(e));
  } finally {
    if (s) await s.context.close();
  }
}
// The two column labels and columns of Adv & Disadv.
const columns = page => page.evaluate(() => {
  const F = window.__cs, a = document.getElementById('advList').parentElement, d = document.getElementById('disadvList').parentElement;
  const la = F.rect(a.querySelector('label')), ld = F.rect(d.querySelector('label')), ca = F.rect(a), cd = F.rect(d);
  return {labelGap: Math.round(Math.abs(la.top - ld.top)), colGap: Math.round(Math.abs(ca.top - cd.top)), side: ca.right <= cd.left + 0.5,
    stacked: ca.bottom <= cd.top + 0.5, align: getComputedStyle(a.parentElement).alignItems, advRows: a.querySelector('#advList').children.length,
    disRows: d.querySelector('#disadvList').children.length};
});
// A real tap on one row's Details control.
async function tapToggle(page, name) {
  const box = await page.evaluate(n => { const F = window.__cs, tr = F.row(n), t = tr && F.toggle(tr); if (!t) return null;
    t.scrollIntoView({block: 'center'}); const r = t.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, name);
  if (!box) return false;
  await settle(page);
  const again = await page.evaluate(n => { const r = window.__cs.toggle(window.__cs.row(n)).getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, name);
  await page.touchscreen.tap(again.x, again.y);
  await settle(page);
  return true;
}
const state = (page, name) => page.evaluate(n => { const F = window.__cs, tr = F.row(n); if (!tr) return {missing: true};
  const t = F.toggle(tr), s = F.secondary(tr);
  return {expanded: t ? t.getAttribute('aria-expanded') : null, shown: Object.fromEntries(Object.entries(s).map(([k, e]) => [k, F.shown(e)]))}; }, name);

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Desktop, 1440 x 1000: the two columns start level, with both lists filled and with either empty.
    await session(browser, DESKTOP, async page => {
      const seam = await page.evaluate(() => { const T = window.__L5R_TEST__, C = T.CS15;
        return {obj: typeof C === 'object' && !!C, on: T.COMPACT_SKILL_CARDS_ENABLED === true, installed: !!C && C.installed === true,
          cls: document.body.classList.contains('cs15-on'), one: [...document.querySelectorAll('#skillsBody > tr')].every(t => t.querySelectorAll('.cs15-toggle').length === 1)}; });
      set('SEAM-PRESENT', seam.obj && seam.on && seam.installed && seam.cls && seam.one, seam);
      const level = [], empty = [];
      for (const fx of ['dense', 'noAdv', 'noDisadv']) {
        await load(page, fx);
        for (const m of ['play', 'management']) {
          await mode(page, m); await go(page, 'Adv & Disadv'); await page.evaluate(() => window.__cs.scroll('top')); await settle(page);
          const c = await columns(page);
          (fx === 'dense' ? level : empty).push({fx, m, ...c, ok: c.side && c.labelGap <= 1 && c.colGap <= 1 && (fx !== 'noAdv' || c.advRows === 0) && (fx !== 'noDisadv' || c.disRows === 0)});
        }
      }
      set('DESKTOP-COLUMNS-LEVEL', level.length === 2 && level.every(x => x.ok && x.advRows > 0 && x.disRows > 0), level);
      set('DESKTOP-COLUMNS-ONE-EMPTY', empty.length === 4 && empty.every(x => x.ok), empty);
      // Every other grid on every page keeps the carousel's bottom alignment; only the Adv & Disadv grid starts at the top.
      const other = [];
      await load(page, 'longSkills');
      for (const m of ['play', 'management']) {
        await mode(page, m);
        for (const label of await page.evaluate(() => window.__L5R_CAROUSEL__.getTabs().filter(t => !t.panel.hidden).map(t => t.label))) {
          await go(page, label);
          other.push(...await page.evaluate(l => [...window.__cs.page().querySelectorAll('.grid')].map(g => ({l, adv: !!g.querySelector(':scope > * > #advList'),
            align: getComputedStyle(g).alignItems})).filter(x => x.adv ? x.align !== 'start' : x.align !== 'end'), label));
        }
      }
      seen['OTHER-GRIDS-UNCHANGED-DESKTOP'] = other.length === 0;
      if (other.length) console.log('  detail OTHER-GRIDS desktop: ' + JSON.stringify(other.slice(0, 6)));
      // The desktop Skills table is still a table: every cell drawn, no Details control.
      await mode(page, 'management'); await go(page, 'Skills');
      const t = await page.evaluate(() => { const F = window.__cs;
        return F.rows().map(tr => ({tr: getComputedStyle(tr).display, cells: [...tr.children].map(td => getComputedStyle(td).display),
          toggle: !F.toggle(tr) || !F.shown(F.toggle(tr)), sec: Object.entries(F.secondary(tr)).filter(([k, e]) => !F.shown(e)).map(([k]) => k)}))
          .filter(x => x.tr !== 'table-row' || x.cells.length !== 8 || x.cells.some(c => c !== 'table-cell') || !x.toggle || x.sec.length); });
      set('DESKTOP-SKILLS-UNCHANGED', t.length === 0, t.slice(0, 3));
    });

    // ---------- A phone wide enough for two columns (540 x 900): the columns still start level.
    await session(browser, WIDE_PHONE, async page => {
      const out = [];
      for (const fx of ['dense', 'noAdv']) {
        await load(page, fx); await mode(page, 'management'); await go(page, 'Adv & Disadv'); await page.evaluate(() => window.__cs.scroll('top')); await settle(page);
        out.push({fx, ...await columns(page)});
      }
      set('TWO-COLUMN-PHONE-LEVEL', out.every(c => c.side && c.labelGap <= 1 && c.colGap <= 1), out);
    }, 'dense');

    // ---------- Phone, 390 x 844.
    await session(browser, PHONE, async page => {
      // Adv & Disadv on a phone stays one column, Advantages first.
      const st = [];
      for (const m of ['play', 'management']) { await mode(page, m); await go(page, 'Adv & Disadv'); st.push(await columns(page)); }
      set('PHONE-COLUMNS-STACKED', st.every(c => c.stacked && !c.side), st);
      const other = [];
      for (const m of ['play', 'management']) {
        await mode(page, m);
        for (const label of await page.evaluate(() => window.__L5R_CAROUSEL__.getTabs().filter(t => !t.panel.hidden).map(t => t.label))) {
          await go(page, label);
          other.push(...await page.evaluate(l => [...window.__cs.page().querySelectorAll('.grid')].map(g => ({l, adv: !!g.querySelector(':scope > * > #advList'),
            align: getComputedStyle(g).alignItems})).filter(x => x.adv ? x.align !== 'start' : x.align !== 'end'), label));
        }
      }
      set('OTHER-GRIDS-UNCHANGED', seen['OTHER-GRIDS-UNCHANGED-DESKTOP'] === true && other.length === 0, other.slice(0, 6));
      delete seen['OTHER-GRIDS-UNCHANGED-DESKTOP'];

      // Closed cards, both modes: compact first and second rows, secondary editing hidden, nothing wider than the card.
      const first = [], closed = [], tall = [];
      for (const m of ['management', 'play']) {
        await mode(page, m); await go(page, 'Skills');
        const r = await page.evaluate(() => { const F = window.__cs; return F.rows().map(tr => ({...F.card(tr),
          hidden: Object.entries(F.secondary(tr)).filter(([k, e]) => F.shown(e)).map(([k]) => k), expanded: F.toggle(tr) && F.toggle(tr).getAttribute('aria-expanded')})); });
        const doc = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
        for (const c of r) {
          if (!(c.firstShown && c.firstRow && c.inside && c.noOverflow && doc)) first.push([m, c]);
          if (!(c.secondRow && c.expanded === 'false' && c.hidden.length === 0)) closed.push([m, c]);
          if (!(c.h <= 140)) tall.push([m, c.name, c.h]);
        }
      }
      set('CARD-FIRST-ROW', first.length === 0, first.slice(0, 3));
      set('CARD-CLOSED', closed.length === 0, closed.slice(0, 3));
      set('CARD-COMPACT', tall.length === 0, tall.slice(0, 6));

      // The summary matches each row's own fields, and two rows match the fixture as written.
      const sums = await page.evaluate(() => { const F = window.__cs; return F.rows().map(tr => ({n: tr.querySelector('.sk-name').value,
        got: F.toggle(tr) ? F.toggle(tr).getAttribute('data-cs15-summary') : null, want: F.expectSummary(tr)})); });
      const byName = Object.fromEntries(sums.map(s => [s.n, s.got]));
      set('SUMMARY-MATCHES', sums.length === 18 && sums.every(s => s.got === s.want) && byName.Kenjutsu === 'Agility · Katana, Ninja-to' &&
        byName.Iaijutsu === 'Reflexes · Focus · School' && byName.Jiujutsu === 'Agility', sums.filter(s => s.got !== s.want).slice(0, 4).concat([byName]));

      // The control is a real button with an accessible name and state, adds no text to the row and has no title=.
      await mode(page, 'management');
      const acc = await page.evaluate(() => { const F = window.__cs, tr = F.row('Kenjutsu'), t = tr && F.toggle(tr); if (!t) return {missing: true};
        return {tag: t.tagName, type: t.type, text: t.textContent, title: t.hasAttribute('title'), label: t.getAttribute('aria-label'),
          expanded: t.getAttribute('aria-expanded'), before: getComputedStyle(t, '::before').content, rowText: tr.textContent.includes('Details')}; });
      await tapToggle(page, 'Kenjutsu');
      const accOpen = await page.evaluate(() => { const t = window.__cs.toggle(window.__cs.row('Kenjutsu')); return t && t.getAttribute('aria-expanded'); });
      await tapToggle(page, 'Kenjutsu');
      set('TOGGLE-ACCESSIBLE', acc.tag === 'BUTTON' && acc.type === 'button' && acc.text === '' && acc.title === false && acc.rowText === false &&
        acc.label === 'Details for Kenjutsu: Agility, Katana, Ninja-to' && acc.expanded === 'false' && /Details/.test(acc.before || '') && accOpen === 'true', {acc, accOpen});

      // A tap opens one card's Details (every secondary item drawn) and a second tap closes it; other cards stay closed.
      await tapToggle(page, 'Kenjutsu');
      const opened = await state(page, 'Kenjutsu');
      const others = await page.evaluate(() => window.__cs.rows().filter(t => t.querySelector('.sk-name').value !== 'Kenjutsu').every(t => t.querySelector('.cs15-toggle').getAttribute('aria-expanded') === 'false'));
      await tapToggle(page, 'Kenjutsu');
      const closedAgain = await state(page, 'Kenjutsu');
      const need = ['trait', 'school', 'xp', 'emphAdd', 'limit', 'remove', 'mastery', 'emph0', 'emph1'];
      set('TOGGLE-OPENS-CLOSES', opened.expanded === 'true' && need.every(k => opened.shown[k] === true) && others &&
        closedAgain.expanded === 'false' && need.every(k => closedAgain.shown[k] === false), {opened, others, closedAgain});

      // Keyboard: Enter opens, Space closes.
      await page.evaluate(() => { const t = window.__cs.toggle(window.__cs.row('Iaijutsu')); if (t) t.focus(); });
      await page.keyboard.press('Enter'); await settle(page);
      const k1 = await state(page, 'Iaijutsu');
      await page.keyboard.press('Space'); await settle(page);
      const k2 = await state(page, 'Iaijutsu');
      set('TOGGLE-KEYBOARD', k1.expanded === 'true' && k1.shown.trait === true && k2.expanded === 'false' && k2.shown.trait === false, {k1, k2});

      // Under Details, in order: Trait, Emphases, School, XP, then the Mastery notes, then Remove; all below the second row.
      await tapToggle(page, 'Kenjutsu');
      const order = await page.evaluate(() => { const F = window.__cs, tr = F.row('Kenjutsu'), y = e => F.rect(e).top;
        const s = F.secondary(tr), t = F.rect(F.toggle(tr)).bottom;
        const seq = [y(s.trait), y(tr.querySelector('.emph-container')), y(s.school), y(s.xp), y(s.mastery), y(s.remove)];
        return {seq: seq.map(Math.round), below: seq.every(v => v >= t - 1), rising: seq.every((v, i) => i === 0 || v > seq[i - 1])}; });
      set('DETAILS-ORDER', order.below && order.rising, order);

      // Live summary: typing a Trait, ticking School and removing an Emphasis all show at once; so does a change the
      // sheet makes itself followed by its recalculation.
      const live = [];
      const sum = () => page.evaluate(() => window.__cs.toggle(window.__cs.row('Kenjutsu')).getAttribute('data-cs15-summary'));
      await page.evaluate(() => window.__cs.row('Kenjutsu').querySelector('.sk-trait').scrollIntoView({block: 'center'}));
      const traitBox = await page.evaluateHandle(() => window.__cs.row('Kenjutsu').querySelector('.sk-trait'));
      await traitBox.asElement().fill('Strength'); await settle(page); live.push(await sum());
      const tick = await page.evaluateHandle(() => window.__cs.row('Kenjutsu').querySelector('.sk-school'));
      await tick.asElement().tap(); await settle(page); live.push(await sum());
      const del = await page.evaluateHandle(() => window.__cs.row('Kenjutsu').querySelector('.emph-item-del'));
      await del.asElement().tap(); await settle(page); live.push(await sum());
      await page.evaluate(() => { window.__cs.row('Kenjutsu').querySelector('.sk-trait').value = 'Agility'; window.__L5R_TEST__.recalcAll(); }); await settle(page); live.push(await sum());
      set('SUMMARY-LIVE', JSON.stringify(live) === JSON.stringify(['Strength · Katana, Ninja-to', 'Strength · Katana, Ninja-to · School',
        'Strength · Ninja-to · School', 'Agility · Ninja-to · School']), live);
      await tapToggle(page, 'Kenjutsu');

      // Opening and closing every card changes no saved value, and nothing of A03's reaches the save.
      const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      const names = await page.evaluate(() => window.__cs.rows().map(t => t.querySelector('.sk-name').value));
      for (const n of names) await page.evaluate(x => window.__cs.toggle(window.__cs.row(x)).click(), n);
      const mid = await page.evaluate(() => window.__cs.rows().every(t => t.classList.contains('cs15-open')));
      for (const n of names) await page.evaluate(x => window.__cs.toggle(window.__cs.row(x)).click(), n);
      const after = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      set('VALUES-KEPT', before === after && mid && !/cs15/i.test(after) && names.length === 18, {same: before === after, mid, leak: /cs15/i.test(after)});

      // Every cell and control stays where makeSkillRow put it; the one addition is the control, right after the name line.
      const dom = await page.evaluate(() => window.__cs.rows().map(tr => { const c = [...tr.children];
        const ok = c.length === 8 && c.every(td => td.tagName === 'TD') &&
          c[0].querySelector(':scope > .sk-name-row > .sk-name') && c[0].querySelector(':scope > .sk-name-row > .sk-info-btn') &&
          c[0].querySelector(':scope > .sk-name-row + .cs15-toggle') && tr.querySelectorAll('.cs15-toggle').length === 1 &&
          c[1].querySelector(':scope > .sk-trait') && c[2].querySelector(':scope > .sk-rank') && c[3].querySelector(':scope > .emph-container') &&
          c[3].querySelector(':scope > .emph-add-btn') && c[4].querySelector(':scope > .sk-school') && c[5].classList.contains('sk-cost') &&
          c[6].querySelector(':scope > .sk-roll') && c[7].querySelector(':scope > .rm-btn');
        return ok ? null : tr.querySelector('.sk-name').value; }).filter(Boolean));
      set('DOM-NOT-MOVED', dom.length === 0, dom);

      // Anything another layer adds to the first cell, or to the name line (the School choice's source badge goes right
      // after the name: Release 8c's SC8.badge, when present, and a stand-in placed the same way), is under Details:
      // not drawn while closed, so the closed card keeps its height; drawn when open, after the fields.
      const add = await page.evaluate(async () => { const F = window.__cs, T = window.__L5R_TEST__, tr = F.row('Defense');
        const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const h0 = F.rect(tr).height;
        const n = document.createElement('div'); n.className = 'a03-test-note'; n.textContent = 'A note another layer adds'; tr.cells[0].appendChild(n);
        const b = document.createElement('small'); b.className = 'a03-test-badge'; b.textContent = 'A badge after the name'; tr.querySelector('.sk-name').after(b);
        let real = null;
        if (T.SC8 && typeof T.SC8.badge === 'function') { T.SC8.badge(tr, {school: 'Hida Bushi'}); real = tr.querySelector('.sc8-source'); }
        const added = [n, b].concat(real ? [real] : []);
        await frame();
        const closed = {shown: added.map(F.shown), height: Math.round(F.rect(tr).height) === Math.round(h0)};
        F.toggle(tr).click(); await frame();
        const xp = F.rect(tr.querySelector('td.sk-cost')).bottom;
        const open = {shown: added.map(F.shown), afterFields: added.every(e => F.rect(e).top >= xp - 1), full: added.every(e => F.rect(e).width >= F.rect(tr.cells[1]).width - 1)};
        F.toggle(tr).click(); added.forEach(e => e.remove());
        return {real: !!real, closed, open}; });
      set('FIRST-CELL-ADDITIONS', add.closed.shown.every(v => v === false) && add.closed.height && add.open.shown.every(v => v === true) &&
        add.open.afterFields && add.open.full && add.closed.shown.length === (add.real ? 3 : 2), add);

      // More Emphases than the Rank allows (Athletics' 2 at Rank 1; no other check touches Athletics): while closed, the
      // summary leads with the sheet's own count note, in the note's own warning colour; back at Rank 4 the warning goes.
      const typeRank = async (name, value) => { const h = await page.evaluateHandle(n => window.__cs.row(n).querySelector('.sk-rank'), name);
        await h.asElement().scrollIntoViewIfNeeded(); await h.asElement().tap(); await page.keyboard.press('Control+A'); await page.keyboard.type(value);
        await page.evaluate(() => document.activeElement.blur()); await settle(page); };
      const warnOf = () => page.evaluate(() => { const F = window.__cs, tr = F.row('Athletics'), t = F.toggle(tr), note = tr.querySelector('.emph-limit-note');
        return {expanded: t.getAttribute('aria-expanded'), summary: t.getAttribute('data-cs15-summary'), note: note.textContent.trim(), noteColour: getComputedStyle(note).color,
          shownColour: getComputedStyle(t, '::after').color, ink: getComputedStyle(t).color}; });
      await typeRank('Athletics', '1');
      const w1 = await warnOf();
      await typeRank('Athletics', '4');
      const w2 = await warnOf();
      set('EMPHASIS-WARNING-SHOWN', w1.expanded === 'false' && !!w1.note && w1.summary.startsWith(w1.note + ' · ') && w1.shownColour === w1.noteColour &&
        w1.noteColour !== w1.ink && w2.summary === 'Strength · Running, Climbing' && w2.shownColour !== w1.noteColour, {w1, w2});

      // Management edits from the compact row: real keystrokes in the Rank change the XP; Remove works once opened.
      const xp0 = await page.evaluate(() => window.__cs.row('Iaijutsu').querySelector('td.sk-cost').textContent);
      const rank = await page.evaluateHandle(() => window.__cs.row('Iaijutsu').querySelector('.sk-rank'));
      await rank.asElement().scrollIntoViewIfNeeded(); await rank.asElement().tap(); await page.keyboard.press('Control+A'); await page.keyboard.type('6');
      await page.evaluate(() => document.activeElement.blur()); await settle(page);
      const xp1 = await page.evaluate(() => [window.__cs.row('Iaijutsu').querySelector('.sk-rank').value, window.__cs.row('Iaijutsu').querySelector('td.sk-cost').textContent]);
      const count0 = await page.evaluate(() => window.__cs.rows().length);
      await tapToggle(page, 'Lore: History');
      const rm = await page.evaluateHandle(() => window.__cs.row('Lore: History').querySelector('.rm-btn:not(.emph-item-del)'));
      await rm.asElement().scrollIntoViewIfNeeded(); await rm.asElement().tap(); await settle(page);
      const count1 = await page.evaluate(() => [window.__cs.rows().length, !!window.__cs.row('Lore: History')]);
      set('MANAGE-EDITS-WORK', xp1[0] === '6' && xp1[1] !== xp0 && count1[0] === count0 - 1 && count1[1] === false, {xp0, xp1, count0, count1});

      // + Add Skill gives a blank row with its Details open; a Skill picked from the list (name and Trait filled) arrives closed.
      await page.evaluate(() => document.getElementById('addSkill').scrollIntoView({block: 'center'})); await settle(page);
      await page.tap('#addSkill'); await settle(page);
      const blank = await page.evaluate(() => { const F = window.__cs, tr = F.rows().at(-1); return {name: tr.querySelector('.sk-name').value,
        expanded: F.toggle(tr) && F.toggle(tr).getAttribute('aria-expanded'), trait: F.shown(tr.querySelector('.sk-trait'))}; });
      // A row appended without a recalculation (as a later layer or a harness may do) is decorated as it arrives.
      const direct = await page.evaluate(async () => { const T = window.__L5R_TEST__; const tr = T.makeSkillRow({});
        document.getElementById('skillsBody').appendChild(tr); await Promise.resolve(); await new Promise(r => setTimeout(r, 0));
        const t = tr.querySelectorAll('.cs15-toggle'); const out = {count: t.length, expanded: t[0] && t[0].getAttribute('aria-expanded')}; tr.remove(); return out; });
      set('NEW-ROW-OPEN', blank.name === '' && blank.expanded === 'true' && blank.trait === true && direct.count === 1 && direct.expanded === 'true', {blank, direct});
      const pick = await page.evaluate(() => { const own = new Set(window.__cs.rows().map(t => t.querySelector('.sk-name').value));
        const v = [...document.querySelectorAll('#skillQuickAdd option')].map(o => o.value).filter(x => x && !own.has(x)); return v.includes('Hunting') ? 'Hunting' : v[0]; });
      await page.selectOption('#skillQuickAdd', pick); await settle(page);
      const picked = await page.evaluate(n => { const F = window.__cs, tr = F.row(n); return tr ? {trait: tr.querySelector('.sk-trait').value,
        expanded: F.toggle(tr) && F.toggle(tr).getAttribute('aria-expanded'), traitShown: F.shown(tr.querySelector('.sk-trait'))} : {missing: n}; }, pick);
      set('QUICK-ADD-CLOSED', !!picked.trait && picked.expanded === 'false' && picked.traitShown === false, picked);

      // Loading a character rebuilds the rows, all closed, each with one control.
      await page.evaluate(() => window.__cs.rows().slice(0, 4).forEach(t => t.querySelector('.cs15-toggle').click()));
      await load(page, 'longSkills');
      const re = await page.evaluate(() => window.__cs.rows().map(t => [t.querySelectorAll('.cs15-toggle').length, t.querySelector('.cs15-toggle') && t.querySelector('.cs15-toggle').getAttribute('aria-expanded')]));
      set('RELOAD-CLOSED', re.length === 18 && re.every(x => x[0] === 1 && x[1] === 'false'), re);

      // Play: the d10 rolls and the eye opens Skill Info, from the compact rows.
      await mode(page, 'play'); await go(page, 'Skills');
      const d10 = await page.evaluateHandle(() => window.__cs.row('Kenjutsu').querySelector('.sk-roll'));
      await d10.asElement().scrollIntoViewIfNeeded(); await d10.asElement().tap(); await page.waitForTimeout(300);
      const rolled = await page.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay')].some(o => getComputedStyle(o).display !== 'none'));
      await page.keyboard.press('Escape'); await page.waitForTimeout(150);
      await page.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay')].forEach(o => { if (getComputedStyle(o).display !== 'none') { const c = o.querySelector('[id$="Close"], .rm-btn'); if (c) c.click(); } }));
      await settle(page);
      const eye = await page.evaluateHandle(() => window.__cs.row('Kenjutsu').querySelector('.sk-info-btn'));
      await eye.asElement().scrollIntoViewIfNeeded(); await eye.asElement().tap(); await settle(page);
      const info = await page.evaluate(() => { const o = document.getElementById('skillInfoModalOverlay'); return getComputedStyle(o).display !== 'none' && /Kenjutsu/.test(document.getElementById('skillInfoTitle').textContent); });
      await page.evaluate(() => document.getElementById('skillInfoClose').click()); await settle(page);
      set('PLAY-ROLL-AND-INFO', rolled === true && info === true, {rolled, info});

      // Play keeps Phase 12's locks: the control itself is live, and what it shows stays read-only.
      await tapToggle(page, 'Kenjutsu');
      const lock = await page.evaluate(() => { const F = window.__cs, tr = F.row('Kenjutsu'), t = F.toggle(tr);
        return {toggleLocked: !!t && t.hasAttribute('data-pm12-locked'), expanded: t && t.getAttribute('aria-expanded'), traitShown: F.shown(tr.querySelector('.sk-trait')),
          traitRO: tr.querySelector('.sk-trait').readOnly, rankRO: tr.querySelector('.sk-rank').readOnly, schoolOff: tr.querySelector('.sk-school').disabled,
          removeGone: getComputedStyle(tr.querySelector('.rm-btn:not(.emph-item-del)')).display === 'none', addGone: getComputedStyle(tr.querySelector('.emph-add-btn')).display === 'none',
          emphLocked: [...tr.querySelectorAll('.sk-emph-select')].every(e => e.hasAttribute('data-pm12-locked'))}; });
      set('PLAY-LOCKS-KEPT', lock.toggleLocked === false && lock.expanded === 'true' && lock.traitShown && lock.traitRO && lock.rankRO && lock.schoolOff &&
        lock.removeGone && lock.addGone && lock.emphLocked, lock);
      await tapToggle(page, 'Kenjutsu');

      // At the very end of the page, closed and with the last card open, every control of the last card is tappable and
      // none lies under a floating control (A02's corners, where present).
      const ends = [];
      for (const m of ['play', 'management']) {
        await mode(page, m); await go(page, 'Skills');
        for (const openLast of [false, true]) {
          await page.evaluate(o => { const tr = window.__cs.rows().at(-1); tr.querySelector('.cs15-toggle') && (tr.classList.contains('cs15-open') !== o) && tr.querySelector('.cs15-toggle').click(); }, openLast);
          await page.evaluate(() => window.__cs.scroll('end')); await settle(page);
          ends.push(await page.evaluate(([m, o]) => { const F = window.__cs, tr = F.rows().at(-1);
            const floats = ['floatingDiceBtn', 'scrollTopBtn', 'quickAccessToggleBtn'].map(id => document.getElementById(id)).filter(F.shown).map(F.rect);
            const ctl = [...tr.querySelectorAll('button,input,select,textarea')].filter(F.shown);
            const bad = ctl.filter(e => !F.hits(e) || floats.some(f => F.overlap(F.rect(e), f))).map(e => e.className || e.tagName);
            return {m, o, count: ctl.length, bad}; }, [m, openLast]));
        }
      }
      set('PHONE-END-CLEAR', ends.length === 4 && ends.every(e => e.count >= 3 && e.bad.length === 0), ends);

      // Print, at phone width: the Skills table and the Adv & Disadv page print exactly as they do without A03's class.
      await mode(page, 'management');
      await page.emulateMedia({media: 'print'});
      const measure = () => page.evaluate(() => { const F = window.__cs;
        const g = document.getElementById('advList').parentElement.parentElement;
        return JSON.stringify({rows: F.rows().map(tr => [getComputedStyle(tr).display, Math.round(F.rect(tr).height), [...tr.children].map(td => getComputedStyle(td).display).join()]),
          toggles: F.rows().map(tr => F.toggle(tr) ? getComputedStyle(F.toggle(tr)).display : 'none'), adv: getComputedStyle(g).alignItems}); });
      const withA03 = await measure();
      // The reference is the page without A03: its class taken away and its controls lifted out (A03 adds nothing else).
      const had = await page.evaluate(() => { const h = document.body.classList.contains('cs15-on'); document.body.classList.remove('cs15-on');
        window.__csLifted = [...document.querySelectorAll('#skillsBody .cs15-toggle')].map(t => [t, t.parentNode, t.nextSibling]);
        window.__csLifted.forEach(([t]) => t.remove()); return h; });
      const without = await measure();
      await page.evaluate(h => { window.__csLifted.forEach(([t, p, n]) => p.insertBefore(t, n)); if (h) document.body.classList.add('cs15-on'); }, had);
      await page.emulateMedia({media: 'screen'});
      const pw = JSON.parse(withA03);
      set('PRINT-UNCHANGED', withA03 === without && pw.toggles.every(d => d === 'none') && pw.rows.every(r => r[0] !== 'grid'), {same: withA03 === without, pw: withA03.slice(0, 300)});
    });

    // ---------- Small phone, 375 x 667, and the narrowest, 320 x 568: the compact rows still fit, with room for the name.
    for (const [id, opts, minName, maxH] of [['SMALL-PHONE-FIT', SMALL, 100, 140], ['NARROW-PHONE-FIT', NARROW, 80, 180]]) {
      await session(browser, opts, async page => {
        const bad = [];
        for (const m of ['management', 'play']) {
          await mode(page, m); await go(page, 'Skills');
          const r = await page.evaluate(() => window.__cs.rows().map(tr => window.__cs.card(tr)));
          const doc = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
          for (const c of r) if (!(c.firstShown && c.firstRow && c.secondRow && c.inside && c.noOverflow && doc && c.nameWidth >= minName && c.h <= maxH)) bad.push([m, c]);
        }
        set(id, bad.length === 0, bad.slice(0, 3));
      });
    }

    // ---------- Tablet, 700 x 1000: the Skills table in its scroller, unchanged, with no Details control.
    await session(browser, TABLET, async page => {
      await mode(page, 'management'); await go(page, 'Skills');
      const t = await page.evaluate(() => { const F = window.__cs; return {scroller: !!document.querySelector('.car-hscroll > #skillsTable'),
        bad: F.rows().map(tr => ({tr: getComputedStyle(tr).display, toggle: !F.toggle(tr) || !F.shown(F.toggle(tr)), sec: Object.values(F.secondary(tr)).every(F.shown)}))
          .filter(x => x.tr !== 'table-row' || !x.toggle || !x.sec).length}; });
      set('TABLET-UNCHANGED', t.scroller && t.bad === 0, t);
    });
    seen['NO-SCRIPT-ERRORS'] = errors.length === 0;
  } finally {
    if (errors.length) console.error(errors);
    await browser.close();
    const passed = pins.filter(k => seen[k] === true).length;
    for (const id of pins) console.log((seen[id] === true ? 'PASS ' : 'FAIL ') + id);
    console.log(passed + '/' + pins.length + ' checks passed');
    if (passed !== pins.length) process.exitCode = 1;
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
