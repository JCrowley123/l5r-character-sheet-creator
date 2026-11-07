'use strict';
// Release 15a, A03 (PART H PHASE 15.1.3), revision 2: top-aligned Advantage/Disadvantage columns and compact phone
// Skill cards with nothing behind a control (owner's decision, 6 November 2026).
//   node compact-skills-harness.js <sheet.html> [--variant]
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL. An
// exception inside one check is that check's FAIL, with its reason, and the scenario goes on.
// Oracles are independent of the layer: the page's own labels, fields and cells, what the browser reports at a point
// (elementFromPoint), the row's own field values and Rank, the tier each Mastery note names, the fixture, and the same
// page with the layer's class taken away. The layer is never asked where anything should be or what its summary
// should say.
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
async function check(id, body) {
  try {
    const [ok, detail] = await body();
    set(id, ok, detail);
  } catch (e) {
    set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500));
  }
}
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
  const level = (a, b) => a.top < b.bottom && b.top < a.bottom;
  const page = () => [...document.querySelectorAll('.car-page:not([data-clone])')].find(p => !p.hidden && !p.inert && Math.abs(p.getBoundingClientRect().left) < 5) || null;
  const rows = () => [...document.querySelectorAll('#skillsBody > tr')];
  const row = name => rows().find(t => t.querySelector('.sk-name').value === name) || null;
  const summaryOf = tr => tr.querySelector('.cs15-summary');
  const parts = tr => ({name: tr.querySelector('.sk-name'), rank: tr.querySelector('.sk-rank'), roll: tr.querySelector('.sk-roll'),
    summary: summaryOf(tr), eye: tr.querySelector('.sk-info-btn')});
  // The field cells and controls, from the row's own markup (makeSkillRow's eight cells).
  const fields = tr => {
    const removeCell = tr.querySelector(':scope > td:has(> .rm-btn)');
    const out = {traitCell: tr.querySelector(':scope > td:has(> .sk-trait)'), trait: tr.querySelector('.sk-trait'),
      emphCell: tr.querySelector(':scope > td:has(> .emph-container)'), emphAdd: tr.querySelector('.emph-add-btn'), limit: tr.querySelector('.emph-limit-note'),
      schoolCell: tr.querySelector(':scope > td:has(> .sk-school)'), school: tr.querySelector('.sk-school'), xp: tr.querySelector(':scope > td.sk-cost'),
      removeCell, remove: removeCell && removeCell.querySelector(':scope > .rm-btn')};
    [...tr.querySelectorAll('.emph-container .emph-item-row')].forEach((e, i) => { out['emph' + i] = e; });
    return out;
  };
  const cells = tr => { const F = fields(tr); return {trait: F.traitCell, emph: F.emphCell, school: F.schoolCell, xp: F.xp, remove: F.removeCell}; };
  // Each Mastery note with the tier its own text names ("R3: ...", "R5 ✓: ..."), and whether the row's Rank reaches it.
  const masteries = tr => { const rank = parseInt(tr.querySelector('.sk-rank').value || '0', 10);
    return [...tr.querySelectorAll('.sk-mastery-note > span')].map(e => { const m = /^R(\d+)/.exec(e.textContent.trim());
      return {e, tier: m ? +m[1] : NaN, reached: !!m && rank >= +m[1]}; }); };
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
  const drawn = e => { const c = getComputedStyle(e, '::after').content; return c && c !== 'none' && c !== 'normal' ? c : ''; };
  const scroll = where => { const p = page(); if (p) p.scrollTop = where === 'top' ? 0 : where === 'end' ? p.scrollHeight : where; return p ? p.scrollTop : null; };
  // One card. First row: name, Rank and roll side by side and level. Second row, below it: in Play the summary then the
  // eye; in Manage the Trait, the School tick and the eye, with no summary. Nothing wider than the card.
  const card = (tr, mode) => {
    const P = parts(tr), F = fields(tr), out = {name: P.name.value, h: Math.round(rect(tr).height)};
    out.firstShown = ['name', 'rank', 'roll'].every(k => shown(P[k]));
    if (!out.firstShown) return out;
    const n = rect(P.name), r = rect(P.rank), d = rect(P.roll), e = rect(P.eye), c = rect(tr);
    const firstBottom = Math.max(n.bottom, r.bottom, d.bottom);
    out.firstRow = level(n, r) && level(r, d) && level(n, d) && n.right <= r.left + 0.5 && r.right <= d.left + 0.5;
    const boxes = [n, r, d, e];
    if (mode === 'play') {
      const s = P.summary && shown(P.summary) ? rect(P.summary) : null;
      out.secondRow = !!s && shown(P.eye) && s.top >= firstBottom - 1 && e.top >= firstBottom - 1 && level(s, e) && s.right <= e.left + 0.5;
      if (s) boxes.push(s);
    } else {
      const t = shown(F.trait) ? rect(F.traitCell) : null, k = shown(F.school) ? rect(F.schoolCell) : null;
      out.secondRow = !!t && !!k && shown(P.eye) && t.top >= firstBottom - 1 && e.top >= firstBottom - 1 && level(t, k) && level(k, e) &&
        t.right <= k.left + 0.5 && k.right <= e.left + 0.5 && !(P.summary && shown(P.summary));
      if (t && k) boxes.push(t, k);
    }
    out.inside = boxes.every(b => b.left >= c.left - 0.5 && b.right <= c.right + 0.5);
    out.noOverflow = tr.scrollWidth <= tr.clientWidth + 1;
    out.nameWidth = Math.round(n.width);
    out.rankLeft = Math.round(r.left);
    out.rollLeft = Math.round(d.left);
    return out;
  };
  const noteHeight = tr => { const note = tr.querySelector('.sk-mastery-note'); return note && shown(note) ? rect(note).height : 0; };
  // Each card's height, and its Mastery notes' height, on the same page without A03: its class taken away and its
  // summary lines lifted out.
  const reference = () => {
    const had = document.body.classList.contains('cs15-on');
    document.body.classList.remove('cs15-on');
    const lifted = [...document.querySelectorAll('#skillsBody .cs15-summary')].map(t => [t, t.parentNode, t.nextSibling]);
    lifted.forEach(([t]) => t.remove());
    const hs = rows().map(tr => ({h: rect(tr).height, noteH: noteHeight(tr)}));
    lifted.forEach(([t, p, n]) => p.insertBefore(t, n));
    if (had) document.body.classList.add('cs15-on');
    return hs;
  };
  // Everything one check needs about every card in the current mode.
  const survey = mode => { const ref = reference(); return rows().map((tr, i) => {
    const c = card(tr, mode), M = masteries(tr), C = cells(tr), F = fields(tr);
    const spans = M.map(m => ({tier: m.tier, reached: m.reached, shown: shown(m.e)}));
    const noteH = noteHeight(tr);
    const top = e => e && shown(e) ? Math.round(rect(e).top) : null;
    const shownSpans = M.filter(m => shown(m.e));
    return {...c, ref: Math.round(ref[i].h), refNoteH: Math.round(ref[i].noteH), noteH: Math.round(noteH), spans,
      cellsShown: Object.fromEntries(Object.entries(C).map(([k, e]) => [k, shown(e)])),
      controlsShown: Object.fromEntries(Object.entries(F).filter(([k]) => !/Cell$/.test(k)).map(([k, e]) => [k, shown(e)])),
      summaryShown: shown(summaryOf(tr)),
      tops: {second: top(C.trait) !== null && top(C.school) !== null ? Math.max(top(C.trait), top(C.school)) : null, emph: top(C.emph), xp: top(C.xp),
        notes: shownSpans.length ? Math.round(Math.min(...shownSpans.map(m => rect(m.e).top))) : null, remove: top(C.remove)}};
  }); };
  window.__cs = {rect, shown, overlap, hits, level, page, rows, row, summaryOf, parts, fields, cells, masteries, expectSummary, drawn, scroll, card, noteHeight, reference, survey};
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
const mode = async (page, m) => { await page.evaluate(x => window.__L5R_TEST__.MODES12.set(x), m); await settle(page); };
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
// Grids on every visible page other than Adv & Disadv's keep the carousel's bottom alignment; that one starts at the top.
async function otherGrids(page) {
  const other = [];
  for (const m of ['play', 'management']) {
    await mode(page, m);
    for (const label of await page.evaluate(() => window.__L5R_CAROUSEL__.getTabs().filter(t => !t.panel.hidden).map(t => t.label))) {
      await go(page, label);
      other.push(...await page.evaluate(l => [...window.__cs.page().querySelectorAll('.grid')].map(g => ({l, adv: !!g.querySelector(':scope > * > #advList'),
        align: getComputedStyle(g).alignItems})).filter(x => x.adv ? x.align !== 'start' : x.align !== 'end'), label));
    }
  }
  return other;
}
// A row's element, scrolled into the middle of the page, then a real tap (Playwright checks it is the one hit).
async function el(page, name, selector) {
  const h = await page.evaluateHandle(([n, s]) => { const tr = window.__cs.row(n); const e = tr && tr.querySelector(s); if (e) e.scrollIntoView({block: 'center'}); return e; }, [name, selector]);
  const e = h.asElement();
  if (!e) throw new Error('no ' + selector + ' in ' + name);
  await settle(page);
  return e;
}
async function tap(page, name, selector) { await (await el(page, name, selector)).tap(); await settle(page); }
// Real keystrokes into a row's field: tap it, move to the end and delete what is there, type, and confirm the field
// holds exactly the typed value before leaving it. Ctrl+A straight after a tap does not always select a number field's
// text in Chromium's touch emulation (found by the variant discovery: "7" typed into "5" became "75", and Release 8's
// rank-spell offer opened over the page), so it is not relied on.
// The Skills table redraws parts of its rows about 130 ms after a Rank changes (measured 7 November 2026), later than
// settle()'s two frames. G2's A11 preview once saw the keys typed into Iaijutsu's Rank go nowhere (the field held 5) in
// MANAGE-EDITS-WORK, straight after the previous check had changed a Rank. So before tapping a field to type, wait
// until the table has had no DOM change for 300 ms (at most 3 s). Synchronisation only: no assertion changes.
const quiet = page => page.evaluate(() => new Promise(resolve => {
  const body = document.getElementById('skillsBody') || document.body, start = performance.now();
  let timer = null;
  const mo = new MutationObserver(() => { clearTimeout(timer); if (performance.now() - start > 3000) done(); else timer = setTimeout(done, 300); });
  function done() { mo.disconnect(); clearTimeout(timer); resolve(); }
  mo.observe(body, {childList: true, subtree: true});
  timer = setTimeout(done, 300);
}));
async function type(page, name, selector, value) {
  await quiet(page);
  const e = await el(page, name, selector);
  await e.tap();
  if (!await e.evaluate(x => document.activeElement === x)) throw new Error('the tap did not focus ' + selector + ' in ' + name);
  await page.keyboard.press('End');
  for (let i = await e.evaluate(x => String(x.value).length); i > 0; i--) await page.keyboard.press('Backspace');
  await page.keyboard.type(value);
  const held = await e.evaluate(x => x.value);
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await settle(page);
  if (held !== value) throw new Error('typed ' + value + ' into ' + selector + ' in ' + name + ', the field holds ' + held);
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Desktop, 1440 x 1000: the two columns start level, with both lists filled and with either empty.
    await session(browser, DESKTOP, async page => {
      await check('SEAM-PRESENT', async () => {
        const s = await page.evaluate(() => { const T = window.__L5R_TEST__, C = T.CS15;
          return {obj: typeof C === 'object' && !!C, on: T.COMPACT_SKILL_CARDS_ENABLED === true, installed: !!C && C.installed === true,
            cls: document.body.classList.contains('cs15-on'), one: window.__cs.rows().every(t => t.querySelectorAll('.cs15-summary').length === 1),
            noToggle: !document.querySelector('#skillsBody .cs15-toggle')}; });
        return [s.obj && s.on && s.installed && s.cls && s.one && s.noToggle, s];
      });
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
      await load(page, 'longSkills');
      const other = await otherGrids(page);
      seen['OTHER-GRIDS-UNCHANGED-DESKTOP'] = other.length === 0;
      if (other.length) console.log('  detail OTHER-GRIDS desktop: ' + JSON.stringify(other.slice(0, 6)));
      // The desktop Skills table is still a table: every cell drawn, no summary line, every Mastery note in both modes,
      // and every field control in Manage.
      await check('DESKTOP-SKILLS-UNCHANGED', async () => {
        const bad = [];
        for (const m of ['management', 'play']) {
          await mode(page, m); await go(page, 'Skills');
          bad.push(...await page.evaluate(mm => { const F = window.__cs;
            return F.rows().map(tr => ({m: mm, n: tr.querySelector('.sk-name').value, tr: getComputedStyle(tr).display, cells: [...tr.children].map(td => getComputedStyle(td).display),
              summary: F.shown(F.summaryOf(tr)), notes: F.masteries(tr).every(x => F.shown(x.e)),
              controls: mm === 'play' || Object.entries(F.fields(tr)).every(([k, e]) => F.shown(e))}))
              .filter(x => x.tr !== 'table-row' || x.cells.length !== 8 || x.cells.some(c => c !== 'table-cell') || x.summary || !x.notes || !x.controls); }, m));
        }
        return [bad.length === 0, bad.slice(0, 3)];
      });
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
      await check('PHONE-COLUMNS-STACKED', async () => {
        const st = [];
        for (const m of ['play', 'management']) { await mode(page, m); await go(page, 'Adv & Disadv'); st.push(await columns(page)); }
        return [st.every(c => c.stacked && !c.side), st];
      });
      await check('OTHER-GRIDS-UNCHANGED', async () => {
        const other = await otherGrids(page);
        return [seen['OTHER-GRIDS-UNCHANGED-DESKTOP'] === true && other.length === 0, other.slice(0, 6)];
      });
      delete seen['OTHER-GRIDS-UNCHANGED-DESKTOP'];

      // Every card in both modes, with the same page without A03 as the reference height.
      const S = {};
      for (const m of ['management', 'play']) {
        await mode(page, m); await go(page, 'Skills');
        S[m] = await page.evaluate(mm => window.__cs.survey(mm), m);
      }
      const doc = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      await check('CARD-FIRST-ROW', async () => {
        const bad = ['management', 'play'].flatMap(m => S[m].filter(c => !(c.firstShown && c.firstRow && c.inside && c.noOverflow && doc)).map(c => [m, c]));
        return [S.play.length === 18 && bad.length === 0, bad.slice(0, 3)];
      });
      // Play: the summary beside the eye; the Trait, Emphases, School, XP and Remove cells are not drawn.
      await check('PLAY-CARD', async () => {
        const bad = S.play.filter(c => !(c.secondRow && c.summaryShown && Object.values(c.cellsShown).every(v => v === false)));
        return [S.play.length === 18 && bad.length === 0, bad.slice(0, 3)];
      });
      // Manage: the Trait, the School tick and the eye on the second row; every field control and every Mastery note drawn.
      await check('MANAGE-CARD', async () => {
        const bad = S.management.filter(c => !(c.secondRow && !c.summaryShown && Object.values(c.controlsShown).every(v => v === true) && c.spans.every(s => s.shown)));
        return [S.management.length === 18 && bad.length === 0, bad.slice(0, 3)];
      });
      // Manage, top to bottom: Trait and School, then the Emphases, the XP, the Mastery notes and Remove last.
      await check('MANAGE-ORDER', async () => {
        const bad = S.management.filter(c => { const t = c.tops, seq = [t.second, t.emph, t.xp].concat(t.notes === null ? [] : [t.notes], [t.remove]);
          return seq.some(v => v === null) || !seq.every((v, i) => i === 0 || v > seq[i - 1]); });
        return [S.management.length === 18 && bad.length === 0, bad.slice(0, 3).map(c => [c.name, c.tops])];
      });
      // Play cards, leaving out the Mastery notes on both sides: as short as the two-row card (124 px), and at most half
      // the height of the same card without A03.
      await check('PLAY-COMPACT', async () => {
        const bad = S.play.filter(c => !(c.h - c.noteH <= 124 && c.h - c.noteH <= 0.5 * (c.ref - c.refNoteH)));
        return [S.play.length === 18 && bad.length === 0, bad.slice(0, 4).map(c => [c.name, c.h, c.noteH, c.ref, c.refNoteH])];
      });
      // Tapping Manage or Done leaves the first row where it was: the same name width, Rank and roll positions.
      await check('FIRST-ROW-STEADY', async () => {
        const bad = S.play.filter((p, i) => { const m = S.management[i];
          return !(m && p.firstRow && m.firstRow && p.name === m.name && Math.abs(p.nameWidth - m.nameWidth) <= 1 &&
            Math.abs(p.rankLeft - m.rankLeft) <= 1 && Math.abs(p.rollLeft - m.rollLeft) <= 1); });
        return [S.play.length === 18 && S.management.length === 18 && bad.length === 0,
          bad.slice(0, 3).map(p => [p.name, p.nameWidth, p.rankLeft, p.rollLeft, (S.management.find(m => m.name === p.name) || {}).rankLeft])];
      });
      // Manage cards: at most 85% of the height of the same card without A03.
      await check('MANAGE-SHORTER', async () => {
        const bad = S.management.filter(c => !(c.h <= 0.85 * c.ref));
        return [S.management.length === 18 && bad.length === 0, bad.slice(0, 4).map(c => [c.name, c.h, c.ref])];
      });
      // Play: exactly the Mastery notes the Rank reaches (the static half; the live half follows the Rank edits below).
      const staticNotes = S.play.filter(c => !c.spans.every(s => s.shown === s.reached && Number.isFinite(s.tier)));
      const someReached = S.play.some(c => c.spans.some(s => s.reached)), someNot = S.play.some(c => c.spans.some(s => !s.reached));

      // The summary matches each row's own fields, is what the card draws, and four rows match the fixture as written.
      await check('SUMMARY-MATCHES', async () => {
        await mode(page, 'play'); await go(page, 'Skills');
        const sums = await page.evaluate(() => { const F = window.__cs; return F.rows().map(tr => { const s = F.summaryOf(tr);
          return {n: tr.querySelector('.sk-name').value, got: s ? s.getAttribute('data-cs15-summary') : null, drawn: s ? F.drawn(s) : null, want: F.expectSummary(tr)}; }); });
        const byName = Object.fromEntries(sums.map(s => [s.n, s.got]));
        return [sums.length === 18 && sums.every(s => s.got === s.want && s.drawn === JSON.stringify(s.want)) && byName.Kenjutsu === 'Agility · Katana, Ninja-to' &&
          byName.Iaijutsu === 'Reflexes · Focus · School' && byName.Jiujutsu === 'Agility' && byName.Etiquette === 'Awareness · Courtesy, Bureaucracy, Conversation · School',
          sums.filter(s => s.got !== s.want || s.drawn !== JSON.stringify(s.want)).slice(0, 4).concat([byName])];
      });
      // Play: every summary fits its card and wraps rather than being cut off (Etiquette's runs to two lines), clear of the eye.
      await check('SUMMARY-WRAPS', async () => {
        await mode(page, 'play'); await go(page, 'Skills');
        const w = await page.evaluate(() => { const F = window.__cs; return F.rows().map(tr => { const s = F.summaryOf(tr); if (!s || !F.shown(s)) return {n: tr.querySelector('.sk-name').value, missing: true};
          const r = F.rect(s), c = F.rect(tr), lh = parseFloat(getComputedStyle(s).lineHeight);
          return {n: tr.querySelector('.sk-name').value, fits: s.scrollWidth <= s.clientWidth + 1, inside: r.left >= c.left - 0.5 && r.right <= c.right + 0.5,
            clear: !F.overlap(r, F.rect(tr.querySelector('.sk-info-btn'))), lines: Math.round(r.height / lh * 10) / 10}; }); });
        const et = w.find(x => x.n === 'Etiquette');
        return [w.length === 18 && w.every(x => !x.missing && x.fits && x.inside && x.clear) && !!et && et.lines >= 1.8, w.filter(x => x.missing || !x.fits || !x.inside || !x.clear).slice(0, 4).concat([et])];
      });
      // The summary is not a control: a plain element with no text of its own, no focus, role, title or expanded state;
      // no element in the Skills table has an expanded state, and Tab from the eye does not stop on it.
      await check('SUMMARY-NOT-A-CONTROL', async () => {
        await mode(page, 'play'); await go(page, 'Skills');
        const a = await page.evaluate(() => { const F = window.__cs; return {bad: F.rows().map(tr => F.summaryOf(tr)).filter(s => !s || s.tagName !== 'DIV' || s.hasAttribute('tabindex') ||
            s.tabIndex !== -1 || s.hasAttribute('role') || s.hasAttribute('title') || s.hasAttribute('aria-expanded') || s.textContent !== '' || s.children.length !== 0).length,
          expanded: document.querySelectorAll('#skillsBody [aria-expanded]').length, toggles: document.querySelectorAll('#skillsBody .cs15-toggle').length}; });
        await page.evaluate(() => { const e = window.__cs.row('Etiquette').querySelector('.sk-info-btn'); e.scrollIntoView({block: 'center'}); e.focus(); });
        await page.keyboard.press('Tab'); await settle(page);
        const tab = await page.evaluate(() => { const s = window.__cs.summaryOf(window.__cs.row('Etiquette')); const f = document.activeElement;
          return {onSummary: !!s && (f === s || s.contains(f)), focused: f ? f.tagName + '.' + f.className : null}; });
        return [a.bad === 0 && a.expanded === 0 && a.toggles === 0 && !tab.onSummary, {a, tab}];
      });
      // What a screen reader gets: in Play each summary line is exposed as its own text, exactly the summary; in Manage,
      // where it is not drawn, it is not exposed at all (the browser's accessibility tree, through Playwright).
      await check('SUMMARY-READABLE', async () => {
        const read = async () => { const out = [];
          for (const n of ['Kenjutsu', 'Iaijutsu', 'Etiquette', 'Jiujutsu']) {
            const i = await page.evaluate(x => window.__cs.rows().indexOf(window.__cs.row(x)), n);
            const loc = page.locator('#skillsBody > tr').nth(Math.max(i, 0)).locator('.cs15-summary');
            let snap = null;
            try { snap = await loc.ariaSnapshot({timeout: 5000}); } catch (e) { snap = 'error: ' + String(e.message || e).slice(0, 80); }
            const attr = await page.evaluate(x => { const s = window.__cs.summaryOf(window.__cs.row(x)); return s ? s.getAttribute('data-cs15-summary') : null; }, n);
            out.push({n, snap, attr});
          }
          return out; };
        await mode(page, 'play'); await go(page, 'Skills');
        const play = await read();
        await mode(page, 'management');
        const manage = await read();
        await mode(page, 'play');
        const text = s => String(s || '').trim().replace(/^- text:\s*/, '').replace(/^"(.*)"$/, '$1');
        return [play.every(x => !!x.attr && /^- text:/.test(String(x.snap).trim()) && text(x.snap) === x.attr) && manage.every(x => text(x.snap) === ''), {play, manage}];
      });
      // A real tap on Manage switches every card to the Manage layout at once, and a tap on Done switches it back.
      await check('MODE-SWITCH-LIVE', async () => {
        await mode(page, 'play'); await go(page, 'Skills');
        const look = () => page.evaluate(() => { const F = window.__cs, tr = F.row('Kenjutsu');
          return {summary: F.shown(F.summaryOf(tr)), trait: F.shown(tr.querySelector('.sk-trait')), school: F.shown(tr.querySelector('.sk-school')), button: document.getElementById('pm12Toggle').textContent}; });
        await page.evaluate(() => window.__cs.row('Kenjutsu').scrollIntoView({block: 'center'})); await settle(page);
        const a = await look();
        await page.tap('#pm12Toggle'); await settle(page);
        const b = await look();
        await page.tap('#pm12Toggle'); await settle(page);
        const c = await look();
        // Without Phase 12's Play class (as without Phase 12 itself) every card takes the Manage layout.
        await page.evaluate(() => document.body.classList.remove('pm12-play')); await settle(page);
        const d = await look();
        await page.evaluate(() => document.body.classList.add('pm12-play')); await settle(page);
        const e = await look();
        return [a.summary && !a.trait && !a.school && a.button === 'Manage' && !b.summary && b.trait && b.school && b.button === 'Done' &&
          c.summary && !c.trait && c.button === 'Manage' && !d.summary && d.trait && d.school && e.summary && !e.trait, {a, b, c, d, e}];
      });
      // Play keeps Phase 12's locks on the fields, and the summary itself is drawn and never locked.
      await check('PLAY-LOCKS-KEPT', async () => {
        await mode(page, 'play'); await go(page, 'Skills');
        const lock = await page.evaluate(() => { const F = window.__cs, tr = F.row('Kenjutsu'), s = F.summaryOf(tr);
          return {summary: F.shown(s), summaryLocked: !!s && s.hasAttribute('data-pm12-locked'), traitRO: tr.querySelector('.sk-trait').readOnly, rankRO: tr.querySelector('.sk-rank').readOnly,
            schoolOff: tr.querySelector('.sk-school').disabled, removeGone: getComputedStyle(tr.querySelector(':scope > td > .rm-btn')).display === 'none',
            addGone: getComputedStyle(tr.querySelector('.emph-add-btn')).display === 'none', emphLocked: [...tr.querySelectorAll('.sk-emph-select')].every(e => e.hasAttribute('data-pm12-locked'))}; });
        return [lock.summary && !lock.summaryLocked && lock.traitRO && lock.rankRO && lock.schoolOff && lock.removeGone && lock.addGone && lock.emphLocked, lock];
      });
      // Play: the d10 rolls and the eye opens Skill Info, from the compact card.
      await check('PLAY-ROLL-AND-INFO', async () => {
        await mode(page, 'play'); await go(page, 'Skills');
        await tap(page, 'Kenjutsu', '.sk-roll'); await page.waitForTimeout(300);
        const rolled = await page.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay')].some(o => getComputedStyle(o).display !== 'none'));
        await page.keyboard.press('Escape'); await page.waitForTimeout(150);
        await page.evaluate(() => [...document.querySelectorAll('.roll-modal-overlay')].forEach(o => { if (getComputedStyle(o).display !== 'none') { const c = o.querySelector('[id$="Close"], .rm-btn'); if (c) c.click(); } }));
        await settle(page);
        await tap(page, 'Kenjutsu', '.sk-info-btn');
        const info = await page.evaluate(() => { const o = document.getElementById('skillInfoModalOverlay'); return getComputedStyle(o).display !== 'none' && /Kenjutsu/.test(document.getElementById('skillInfoTitle').textContent); });
        await page.evaluate(() => document.getElementById('skillInfoClose').click()); await settle(page);
        return [rolled === true && info === true, {rolled, info}];
      });

      // Live summary: typing a Trait, ticking School and removing an Emphasis in Manage all show at once; so does a change
      // the sheet makes itself followed by its recalculation. Back in Play the card draws the last one.
      await check('SUMMARY-LIVE', async () => {
        await mode(page, 'management'); await go(page, 'Skills');
        const live = [];
        const sum = () => page.evaluate(() => window.__cs.summaryOf(window.__cs.row('Kenjutsu')).getAttribute('data-cs15-summary'));
        await (await el(page, 'Kenjutsu', '.sk-trait')).fill('Strength'); await settle(page); live.push(await sum());
        await tap(page, 'Kenjutsu', '.sk-school'); live.push(await sum());
        await tap(page, 'Kenjutsu', '.emph-item-del'); live.push(await sum());
        await page.evaluate(() => { window.__cs.row('Kenjutsu').querySelector('.sk-trait').value = 'Agility'; window.__L5R_TEST__.recalcAll(); }); await settle(page); live.push(await sum());
        await mode(page, 'play');
        const drawn = await page.evaluate(() => window.__cs.drawn(window.__cs.summaryOf(window.__cs.row('Kenjutsu'))));
        return [JSON.stringify(live) === JSON.stringify(['Strength · Katana, Ninja-to', 'Strength · Katana, Ninja-to · School',
          'Strength · Ninja-to · School', 'Agility · Ninja-to · School']) && drawn === JSON.stringify('Agility · Ninja-to · School'), {live, drawn}];
      });
      // Switching modes and redrawing changes no saved value, and nothing of A03's reaches the save.
      await check('VALUES-KEPT', async () => {
        const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
        for (const m of ['management', 'play', 'management', 'play']) await mode(page, m);
        await page.evaluate(() => window.__L5R_TEST__.recalcAll()); await settle(page);
        const after = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
        const n = await page.evaluate(() => window.__cs.rows().length);
        return [before === after && !/cs15/i.test(after) && n === 18, {same: before === after, leak: /cs15/i.test(after), n}];
      });
      // Every cell and control stays where makeSkillRow put it; the one addition is the summary, right after the name line.
      await check('DOM-NOT-MOVED', async () => {
        const dom = await page.evaluate(() => window.__cs.rows().map(tr => { const c = [...tr.children];
          const ok = c.length === 8 && c.every(td => td.tagName === 'TD') &&
            c[0].querySelector(':scope > .sk-name-row > .sk-name') && c[0].querySelector(':scope > .sk-name-row > .sk-info-btn') &&
            c[0].querySelector(':scope > .sk-name-row + .cs15-summary') && tr.querySelectorAll('.cs15-summary').length === 1 &&
            c[1].querySelector(':scope > .sk-trait') && c[2].querySelector(':scope > .sk-rank') && c[3].querySelector(':scope > .emph-container') &&
            c[3].querySelector(':scope > .emph-add-btn') && c[4].querySelector(':scope > .sk-school') && c[5].classList.contains('sk-cost') &&
            c[6].querySelector(':scope > .sk-roll') && c[7].querySelector(':scope > .rm-btn');
          return ok ? null : tr.querySelector('.sk-name').value; }).filter(Boolean));
        return [dom.length === 0, dom];
      });
      // Anything another layer adds to the first cell, or to the name line (the School choice's source badge goes right
      // after the name: Release 8c's SC8.badge, when present, and a stand-in placed the same way), is drawn in both
      // modes, full width, below the second row; in Manage after the XP and before Remove. (Among the trunk's own
      // first-cell notes it keeps its place in the page: a name-line badge before the Mastery notes, a note after.)
      await check('FIRST-CELL-ADDITIONS', async () => {
        const add = await page.evaluate(async () => { const F = window.__cs, T = window.__L5R_TEST__, tr = F.row('Defense');
          const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          const n = document.createElement('div'); n.className = 'a03-test-note'; n.textContent = 'A note another layer adds'; tr.cells[0].appendChild(n);
          const b = document.createElement('small'); b.className = 'a03-test-badge'; b.textContent = 'A badge after the name'; tr.querySelector('.sk-name').after(b);
          let real = null;
          if (T.SC8 && typeof T.SC8.badge === 'function') { T.SC8.badge(tr, {school: 'Hida Bushi'}); real = tr.querySelector('.sc8-source'); }
          const added = [n, b].concat(real ? [real] : []);
          const res = {};
          for (const m of ['management', 'play']) {
            T.MODES12.set(m); await frame();
            const cs = getComputedStyle(tr), content = F.rect(tr).width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
            const above = m === 'play' ? F.rect(F.summaryOf(tr) || tr).bottom : F.rect(tr.querySelector(':scope > td.sk-cost')).bottom;
            const removeTop = F.rect(tr.querySelector(':scope > td:has(> .rm-btn)')).top;
            res[m] = {shown: added.map(F.shown), after: added.every(e => F.rect(e).top >= above - 1), beforeRemove: m === 'play' || added.every(e => F.rect(e).bottom <= removeTop + 1),
              full: added.every(e => F.rect(e).width >= content - 2)};
          }
          added.forEach(e => e.remove());
          return {real: !!real, res}; });
        const ok = ['management', 'play'].every(m => add.res[m].shown.every(v => v === true) && add.res[m].after && add.res[m].beforeRemove && add.res[m].full);
        return [ok && add.res.play.shown.length === (add.real ? 3 : 2), add];
      });
      // More Emphases than the Rank allows (Athletics' 2 at Rank 1, typed in Manage; no other check touches Athletics):
      // in Play the summary leads with the sheet's own count note, in the note's own warning colour; at Rank 4 it goes.
      await check('EMPHASIS-WARNING-SHOWN', async () => {
        const warnOf = () => page.evaluate(() => { const F = window.__cs, tr = F.row('Athletics'), s = F.summaryOf(tr), note = tr.querySelector('.emph-limit-note');
          return {summary: s.getAttribute('data-cs15-summary'), drawn: F.drawn(s), note: note.textContent.trim(), noteColour: getComputedStyle(note).color,
            shownColour: getComputedStyle(s, '::after').color, ink: getComputedStyle(s).color, shown: F.shown(s)}; });
        await mode(page, 'management'); await go(page, 'Skills');
        await type(page, 'Athletics', '.sk-rank', '1');
        let restored = false;
        try {
        await mode(page, 'play');
        const w1 = await warnOf();
        // The sheet's note can be two lines (a line break, then "Max Emphases assigned"): written that way while over the
        // limit, each line shows, separated, rather than running together. The refresh is the layer's own, triggered.
        const two = await page.evaluate(() => { const F = window.__cs, tr = F.row('Athletics'), note = tr.querySelector('.emph-limit-note');
          const first = note.textContent.trim();
          note.innerHTML = first + ' – no more to be unlocked<br><strong>Max Emphases assigned</strong>';
          window.__L5R_TEST__.CS15.refresh(tr);
          return {first, summary: F.summaryOf(tr).getAttribute('data-cs15-summary')}; });
        await mode(page, 'management');
        await type(page, 'Athletics', '.sk-rank', '4');
        restored = true;
        await mode(page, 'play');
        const w2 = await warnOf();
        return [w1.shown && !!w1.note && w1.summary.startsWith(w1.note + ' · ') && w1.drawn === JSON.stringify(w1.summary) && w1.shownColour === w1.noteColour &&
          w1.noteColour !== w1.ink && two.summary.startsWith(two.first + ' – no more to be unlocked · Max Emphases assigned · ') &&
          w2.summary === 'Strength · Running, Climbing' && w2.shownColour !== w1.noteColour, {w1, two, w2}];
        } finally {
          // Put the Rank back even when the check stops part-way, so no later check starts with a Skill over its limit.
          if (!restored) { try { await mode(page, 'management'); await type(page, 'Athletics', '.sk-rank', '4'); } catch (e) { /* the check has failed already */ } }
        }
      });
      // Manage edits straight from the card, by real taps: Rank (the XP follows), Trait, the School tick, + Emph and Remove.
      await check('MANAGE-EDITS-WORK', async () => {
        await mode(page, 'management'); await go(page, 'Skills');
        const xp0 = await page.evaluate(() => window.__cs.row('Iaijutsu').querySelector(':scope > td.sk-cost').textContent);
        await type(page, 'Iaijutsu', '.sk-rank', '7');
        const xp1 = await page.evaluate(() => [window.__cs.row('Iaijutsu').querySelector('.sk-rank').value, window.__cs.row('Iaijutsu').querySelector(':scope > td.sk-cost').textContent]);
        await type(page, 'Kyujutsu', '.sk-trait', 'Agility');
        const trait = await page.evaluate(() => window.__cs.row('Kyujutsu').querySelector('.sk-trait').value);
        const school0 = await page.evaluate(() => window.__cs.row('Horsemanship').querySelector('.sk-school').checked);
        await tap(page, 'Horsemanship', '.sk-school');
        const school1 = await page.evaluate(() => window.__cs.row('Horsemanship').querySelector('.sk-school').checked);
        const emph0 = await page.evaluate(() => window.__cs.row('Jiujutsu').querySelectorAll('.emph-item-row').length);
        await tap(page, 'Jiujutsu', '.emph-add-btn');
        const emph1 = await page.evaluate(() => window.__cs.row('Jiujutsu').querySelectorAll('.emph-item-row').length);
        const count0 = await page.evaluate(() => window.__cs.rows().length);
        await tap(page, 'Lore: History', ':scope > td > .rm-btn');
        const count1 = await page.evaluate(() => [window.__cs.rows().length, !!window.__cs.row('Lore: History')]);
        return [xp1[0] === '7' && xp1[1] !== xp0 && trait === 'Agility' && school1 === !school0 && emph1 === emph0 + 1 && count1[0] === count0 - 1 && count1[1] === false,
          {xp0, xp1, trait, school0, school1, emph0, emph1, count0, count1}];
      });
      // Play: exactly the Mastery notes the Rank reaches; after Iaijutsu's Rank went from 5 to 7 above, its R7 note too.
      await check('PLAY-MASTERIES-REACHED', async () => {
        await mode(page, 'play'); await go(page, 'Skills');
        const iai = await page.evaluate(() => { const F = window.__cs; return F.masteries(F.row('Iaijutsu')).map(m => ({tier: m.tier, reached: m.reached, shown: F.shown(m.e)})); });
        return [staticNotes.length === 0 && someReached && someNot && iai.length === 3 && iai.every(m => m.reached && m.shown),
          {staticNotes: staticNotes.slice(0, 3).map(c => [c.name, c.spans]), someReached, someNot, iai}];
      });
      // + Add Skill gives a blank row whose Trait can be typed at once; a row appended without a recalculation (as a later
      // layer or a harness may do) gets its summary as it arrives.
      await check('NEW-ROW', async () => {
        await mode(page, 'management'); await go(page, 'Skills');
        await page.evaluate(() => document.getElementById('addSkill').scrollIntoView({block: 'center'})); await settle(page);
        await page.tap('#addSkill'); await settle(page);
        const blank = await page.evaluate(() => { const F = window.__cs, tr = F.rows().at(-1); return {name: tr.querySelector('.sk-name').value, lines: tr.querySelectorAll('.cs15-summary').length,
          trait: F.shown(tr.querySelector('.sk-trait'))}; });
        const h = await page.evaluateHandle(() => { const e = window.__cs.rows().at(-1).querySelector('.sk-trait'); e.scrollIntoView({block: 'center'}); return e; });
        await settle(page); await h.asElement().tap(); await page.keyboard.type('Agility'); await page.evaluate(() => document.activeElement.blur()); await settle(page);
        const typed = await page.evaluate(() => { const tr = window.__cs.rows().at(-1); return [tr.querySelector('.sk-trait').value, window.__cs.summaryOf(tr).getAttribute('data-cs15-summary')]; });
        const direct = await page.evaluate(async () => { const T = window.__L5R_TEST__; const tr = T.makeSkillRow({});
          document.getElementById('skillsBody').appendChild(tr); await Promise.resolve(); await new Promise(r => setTimeout(r, 0));
          const out = tr.querySelectorAll('.cs15-summary').length; tr.remove(); return out; });
        return [blank.name === '' && blank.lines === 1 && blank.trait === true && typed[0] === 'Agility' && typed[1] === 'Agility' && direct === 1, {blank, typed, direct}];
      });
      // A Skill picked from the list arrives with its Trait in the summary; in Play its fields are not drawn.
      await check('QUICK-ADD', async () => {
        await mode(page, 'management'); await go(page, 'Skills');
        const pick = await page.evaluate(() => { const own = new Set(window.__cs.rows().map(t => t.querySelector('.sk-name').value));
          const v = [...document.querySelectorAll('#skillQuickAdd option')].map(o => o.value).filter(x => x && !own.has(x)); return v.includes('Hunting') ? 'Hunting' : v[0]; });
        await page.selectOption('#skillQuickAdd', pick); await settle(page);
        const m = await page.evaluate(n => { const F = window.__cs, tr = F.row(n); return tr ? {trait: tr.querySelector('.sk-trait').value, summary: F.summaryOf(tr).getAttribute('data-cs15-summary'),
          traitShown: F.shown(tr.querySelector('.sk-trait'))} : {missing: n}; }, pick);
        await mode(page, 'play');
        const p = await page.evaluate(n => { const F = window.__cs, tr = F.row(n); return tr ? {summary: F.shown(F.summaryOf(tr)), traitCell: F.shown(F.cells(tr).trait)} : {missing: n}; }, pick);
        return [!!m.trait && m.summary.startsWith(m.trait) && m.traitShown === true && p.summary === true && p.traitCell === false, {pick, m, p}];
      });
      // Loading a character rebuilds the rows, each with one summary that matches its fields.
      await check('RELOAD', async () => {
        await load(page, 'longSkills');
        const re = await page.evaluate(() => window.__cs.rows().map(t => [t.querySelectorAll('.cs15-summary').length, (t.querySelector('.cs15-summary') || {getAttribute() { return null; }}).getAttribute('data-cs15-summary') === window.__cs.expectSummary(t)]));
        return [re.length === 18 && re.every(x => x[0] === 1 && x[1] === true), re];
      });
      // At the very end of the page, in both modes, every control of the last card is tappable and none lies under a
      // floating control (A02's corners, where present).
      await check('PHONE-END-CLEAR', async () => {
        const ends = [];
        for (const m of ['play', 'management']) {
          await mode(page, m); await go(page, 'Skills');
          await page.evaluate(() => window.__cs.scroll('end')); await settle(page);
          ends.push(await page.evaluate(mm => { const F = window.__cs, tr = F.rows().at(-1);
            const floats = ['floatingDiceBtn', 'scrollTopBtn', 'quickAccessToggleBtn'].map(id => document.getElementById(id)).filter(F.shown).map(F.rect);
            const ctl = [...tr.querySelectorAll('button,input,select,textarea')].filter(F.shown);
            const bad = ctl.filter(e => !F.hits(e) || floats.some(f => F.overlap(F.rect(e), f))).map(e => e.className || e.tagName);
            return {m: mm, count: ctl.length, bad}; }, m));
        }
        return [ends.length === 2 && ends.every(e => e.count >= 3 && e.bad.length === 0), ends];
      });
      // Print, at phone width: the Skills table and the Adv & Disadv page print exactly as they do without A03's class.
      await check('PRINT-UNCHANGED', async () => {
        await mode(page, 'management');
        await page.emulateMedia({media: 'print'});
        const measure = () => page.evaluate(() => { const F = window.__cs;
          const g = document.getElementById('advList').parentElement.parentElement;
          return JSON.stringify({rows: F.rows().map(tr => [getComputedStyle(tr).display, Math.round(F.rect(tr).height), [...tr.children].map(td => getComputedStyle(td).display).join(),
            F.masteries(tr).map(x => getComputedStyle(x.e).display).join()]),
            summaries: F.rows().map(tr => F.summaryOf(tr) ? getComputedStyle(F.summaryOf(tr)).display : 'none'), adv: getComputedStyle(g).alignItems}); });
        let withA03, without;
        try {
          withA03 = await measure();
          // The reference is the page without A03: its class taken away and its summaries lifted out (A03 adds nothing else).
          const had = await page.evaluate(() => { const h = document.body.classList.contains('cs15-on'); document.body.classList.remove('cs15-on');
            window.__csLifted = [...document.querySelectorAll('#skillsBody .cs15-summary')].map(t => [t, t.parentNode, t.nextSibling]);
            window.__csLifted.forEach(([t]) => t.remove()); return h; });
          without = await measure();
          await page.evaluate(h => { window.__csLifted.forEach(([t, p, n]) => p.insertBefore(t, n)); if (h) document.body.classList.add('cs15-on'); }, had);
        } finally {
          await page.emulateMedia({media: 'screen'});
        }
        const pw = JSON.parse(withA03);
        return [withA03 === without && pw.summaries.every(d => d === 'none') && pw.rows.every(r => r[0] !== 'grid'), {same: withA03 === without, pw: withA03.slice(0, 300)}];
      });
    });

    // ---------- Small phone, 375 x 667, and the narrowest, 320 x 568: both rows still fit, with room for the name.
    for (const [id, opts, minName] of [['SMALL-PHONE-FIT', SMALL, 100], ['NARROW-PHONE-FIT', NARROW, 80]]) {
      await session(browser, opts, async page => {
        await check(id, async () => {
          const bad = [];
          for (const m of ['management', 'play']) {
            await mode(page, m); await go(page, 'Skills');
            const r = await page.evaluate(mm => window.__cs.rows().map(tr => window.__cs.card(tr, mm)), m);
            const doc = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
            for (const c of r) if (!(c.firstShown && c.firstRow && c.secondRow && c.inside && c.noOverflow && doc && c.nameWidth >= minName)) bad.push([m, c]);
          }
          return [bad.length === 0, bad.slice(0, 3)];
        });
      });
    }

    // ---------- Tablet, 700 x 1000: the Skills table in its scroller, unchanged, with no summary line, in both modes
    // (every Mastery note in Play too; every field control in Manage).
    await session(browser, TABLET, async page => {
      await check('TABLET-UNCHANGED', async () => {
        const out = [];
        for (const m of ['management', 'play']) {
          await mode(page, m); await go(page, 'Skills');
          out.push(await page.evaluate(mm => { const F = window.__cs; return {m: mm, scroller: !!document.querySelector('.car-hscroll > #skillsTable'),
            bad: F.rows().map(tr => ({tr: getComputedStyle(tr).display, summary: F.shown(F.summaryOf(tr)), controls: mm === 'play' || Object.values(F.fields(tr)).every(F.shown),
              notes: F.masteries(tr).every(x => F.shown(x.e))})).filter(x => x.tr !== 'table-row' || x.summary || !x.controls || !x.notes).length}; }, m));
        }
        return [out.length === 2 && out.every(t => t.scroller && t.bad === 0), out];
      });
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
