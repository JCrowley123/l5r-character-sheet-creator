'use strict';
// Release 15a, A02 (PART H PHASE 15.1.2), revision 2: the floating controls in the bottom corners, above the tabs,
// with room at the end of every page (owner's ruling, 5 November 2026; revision 1's band above the tabs is gone).
//   node floating-strip-harness.js <sheet.html> [--variant]
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: the carousel's own page and tab bar, the header, the page's own content,
// and what the browser reports at a point (elementFromPoint). The layer is never asked where the controls should be.
// The corner zone is the 112 px above the tab bar: the tallest stack, the dice with return-to-top above it, is
// 8 + 48 + 8 + 44 = 108 px.
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const FIXTURE = path.resolve(__dirname, '../../../../PART H — Phase 15 UI Consistency Audit/qa/dense-audit-fixture.json');
const data = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
const seen = {};
const errors = [];
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 700));
};
const PHONE = {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true};
const SMALL = {viewport: {width: 375, height: 667}, isMobile: true, hasTouch: true};
const LANDSCAPE = {viewport: {width: 844, height: 390}, isMobile: true, hasTouch: true};
const DESKTOP = {viewport: {width: 1440, height: 1000}};
const CONTROLS = ['quickAccessToggleBtn', 'scrollTopBtn', 'floatingDiceBtn'];

// In-page helpers: geometry from the carousel's own elements.
function helpers() {
  const rect = e => { const r = e.getBoundingClientRect(); return {left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height}; };
  // checkVisibility() also rules out content the browser keeps laid out but never draws, such as the inside of a closed
  // <details> (the Set Rules options at the end of Adv & Disadv report boxes there, and a tap there reaches the page).
  const shown = e => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && e.getClientRects().length > 0 &&
    (typeof e.checkVisibility !== 'function' || e.checkVisibility({visibilityProperty: true}));
  const overlap = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const inside = (a, b) => a.left >= b.left - 0.5 && a.right <= b.right + 0.5 && a.top >= b.top - 0.5 && a.bottom <= b.bottom + 0.5;
  const page = () => [...document.querySelectorAll('.car-page:not([data-clone])')].find(p => !p.hidden && !p.inert && Math.abs(p.getBoundingClientRect().left) < 5) || null;
  const hits = e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)); };
  window.__fc = {rect, shown, overlap, inside, page, hits,
    scroll: where => { const p = page(); if (p) p.scrollTop = where === 'top' ? 0 : where === 'end' ? p.scrollHeight : where; return p ? p.scrollTop : null; },
    // Where each visible floating control lies against the page and the tab bar. inCorner: wholly within the 112 px
    // above the tab bar, Quick Access in the left half of the screen and the dice and return-to-top in the right half.
    layout() {
      const p = page(), tabs = document.getElementById('carTabbar');
      const pr = rect(p), tr = rect(tabs);
      const out = {page: pr, tabs: tr, controls: {}};
      for (const id of ['quickAccessToggleBtn', 'scrollTopBtn', 'floatingDiceBtn']) {
        const e = document.getElementById(id);
        if (!shown(e)) continue;
        const r = rect(e);
        const side = id === 'quickAccessToggleBtn' ? r.right <= innerWidth / 2 : r.left >= innerWidth / 2;
        out.controls[id] = {rect: r, onTabs: overlap(r, tr), inCorner: side && r.bottom <= tr.top + 0.5 && r.top >= tr.top - 112.5, tappable: hits(e)};
      }
      return out;
    },
    // At the end of a page: every piece of the page's own content (text, controls, images and icons) that a shown
    // floating control lies over. Must be none.
    under() {
      const p = page(), pr = rect(p), ctl = ['quickAccessToggleBtn', 'scrollTopBtn', 'floatingDiceBtn'].map(id => document.getElementById(id)).filter(shown).map(e => [e.id, rect(e)]);
      const leaf = e => /^(BUTTON|INPUT|SELECT|TEXTAREA|A|IMG|svg|CANVAS|LABEL)$/.test(e.tagName) || [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      const out = [];
      for (const e of p.querySelectorAll('*')) {
        if (!leaf(e) || !shown(e) || (e.closest('svg') && e.tagName !== 'svg')) continue;
        const r = rect(e);
        if (!r.width || !r.height || r.bottom <= pr.top || r.top >= pr.bottom) continue;
        for (const [id, c] of ctl) if (overlap(r, c)) out.push(id + ' over ' + e.tagName + (e.id ? '#' + e.id : '') + ' ' + (e.innerText || e.value || '').trim().slice(0, 24));
      }
      return out;
    },
    // Every control wholly visible in the page's lowest 160px (where the dice used to sit), and whether a tap at
    // its centre reaches it.
    lowest() {
      const p = page(), pr = rect(p);
      const all = [...p.querySelectorAll('button,input,select,textarea,a,[role=button]')].filter(e => shown(e) && rect(e).height > 0 &&
        rect(e).bottom <= pr.bottom + 0.5 && rect(e).top >= pr.top - 0.5 && rect(e).bottom >= pr.bottom - 160);
      if (!all.length) return {none: true};
      const missed = all.filter(e => !hits(e)).map(e => e.tagName + (e.id ? '#' + e.id : '') + ' ' + (e.innerText || e.value || '').slice(0, 30));
      return {count: all.length, missed, tappable: missed.length === 0};
    },
    // A page heading's first letters, where Quick Access's circle used to sit, and its middle.
    heading() {
      const h2 = page().querySelector('h2');
      if (!h2 || !shown(h2)) return {none: true};
      const range = document.createRange(); range.selectNodeContents(h2);
      const r = range.getClientRects()[0]; if (!r) return {none: true};
      const at = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === h2 || h2.contains(h)); };
      return {text: h2.textContent, start: at(r.left + 4, r.top + r.height / 2), middle: at(r.left + r.width / 2, r.top + r.height / 2)};
    }};
}
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready && window.__L5R_CAROUSEL__);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(d => { const T = window.__L5R_TEST__; T.CL11.close(); T.applyData(d); }, data);
  await page.evaluate(helpers);
  return {context, page};
}
async function tabs(page, mode) {
  return page.evaluate(m => { window.__L5R_TEST__.MODES12.set(m); return window.__L5R_CAROUSEL__.getTabs().filter(t => !t.panel.hidden).map(t => t.label); }, mode);
}
async function go(page, label) {
  await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label);
  await settle(page);
}
// Every tab, Play and Manage, at the top, part-way and at the end: every floating control in its corner just above
// the tabs and never on them, the page running down to the tab bar, and at the end of each page nothing of the page
// under a control and every low field tappable.
async function sweep(page, wheres, extra) {
  const bad = [], last = [];
  for (const mode of ['play', 'management']) {
    for (const label of await tabs(page, mode)) {
      await go(page, label);
      for (const where of wheres) {
        await page.evaluate(w => window.__fc.scroll(w), where);
        await settle(page);
        const l = await page.evaluate(() => window.__fc.layout());
        if (Math.abs(l.page.bottom - l.tabs.top) > 0.5) bad.push([mode, label, where, 'page does not reach the tabs', l.page.bottom, l.tabs.top]);
        for (const [id, c] of Object.entries(l.controls))
          if (c.onTabs || !c.inCorner || !c.tappable) bad.push([mode, label, where, id, c]);
        if (where === 'end') {
          const lo = await page.evaluate(() => window.__fc.lowest()), un = await page.evaluate(() => window.__fc.under());
          if ((!lo.none && !lo.tappable) || un.length) last.push([mode, label, lo.missed, un.slice(0, 3)]);
        }
        if (extra) await extra(mode, label, where, l);
      }
    }
  }
  return {bad, last};
}
async function session(browser, opts, body) {
  let context;
  try { const o = await open(browser, opts); context = o.context; await body(o.page); }
  catch (e) { console.log('  scenario stopped: ' + String(e.message || e).split('\n')[0]); }
  finally { if (context) await context.close(); }
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone, 390 x 844
    await session(browser, PHONE, async page => {
      const s = await page.evaluate(() => { const T = window.__L5R_TEST__;
        return {seam: !!(T.FC15 && T.FLOATING_STRIP_ENABLED === true && T.FC15.installed === true && T.FC15.enabled() === true)}; });
      set('SEAM-PRESENT', s.seam, s);
      // No band: the page runs down to the tab bar again, nothing new sits between them, and the end-of-page room is
      // the corner stack's height (116 px on a phone held upright).
      const placed = await page.evaluate(() => { const tabs = document.getElementById('carTabbar'), p = window.__fc.page();
        return {band: !!document.getElementById('fc15Strip'), on: document.body.classList.contains('fc15-on'),
          before: tabs.previousElementSibling && tabs.previousElementSibling.id, flush: Math.abs(p.getBoundingClientRect().bottom - tabs.getBoundingClientRect().top) < 0.5,
          room: getComputedStyle(p).paddingBottom}; });
      set('NO-BAND', !placed.band && placed.on && placed.before === 'carViewport' && placed.flush && placed.room === '116px', placed);

      const headings = [];
      const r = await sweep(page, ['top', 'middle', 'end'], async (mode, label, where) => {
        if (where !== 'top') return;
        const h = await page.evaluate(() => window.__fc.heading());
        if (!h.none && !(h.start && h.middle)) headings.push([mode, label, h]);
      });
      set('PHONE-CONTROLS-IN-CORNERS', r.bad.length === 0, r.bad.slice(0, 6));
      set('PHONE-HEADINGS-CLEAR', headings.length === 0, headings);
      set('PHONE-END-CLEAR', r.last.length === 0, r.last.slice(0, 6));

      // Combat's Wounds +: the dice used to lie over it at the end of the page.
      await tabs(page, 'play'); await go(page, 'Combat');
      await page.evaluate(() => { const b = document.getElementById('woundStepUp'); b.scrollIntoView({block: 'end'}); window.__fc.scroll('end'); });
      await settle(page);
      const before = await page.evaluate(() => window.__L5R_TEST__ && document.getElementById('woundStepUp') ? window.__fc.hits(document.getElementById('woundStepUp')) : null);
      set('COMBAT-WOUND-PLUS-REACHABLE', before === true, before);

      // Return to top: hidden at the top, shown once scrolled, on the strip, and it returns the page to the top.
      await tabs(page, 'management'); await go(page, 'Skills');
      await page.evaluate(() => window.__fc.scroll('top')); await settle(page);
      const atTop = await page.evaluate(() => !window.__fc.shown(document.getElementById('scrollTopBtn')));
      set('TOP-HIDDEN-AT-START', atTop, atTop);
      await page.evaluate(() => window.__fc.scroll(600)); await settle(page);
      // Directly above the dice: centred on it, 8 px clear of it, not on the tabs, and tappable.
      const shownTop = await page.evaluate(() => { const l = window.__fc.layout(), t = l.controls.scrollTopBtn || null, d = l.controls.floatingDiceBtn || null;
        return {c: t, above: !!t && !!d && Math.abs((t.rect.left + t.rect.right) / 2 - (d.rect.left + d.rect.right) / 2) < 1 && Math.abs(d.rect.top - t.rect.bottom - 8) < 1,
          count: [...document.querySelectorAll('[aria-label="Scroll to top"],[title="Scroll to top"]')].filter(window.__fc.shown).length}; });
      set('TOP-SHOWN-AFTER-SCROLL', !!shownTop.c && shownTop.above && shownTop.c.inCorner && !shownTop.c.onTabs && shownTop.c.tappable, shownTop);
      set('ONE-TOP-CONTROL', shownTop.count === 1, shownTop);
      await page.tap('#scrollTopBtn'); await settle(page);
      const back = await page.evaluate(() => ({top: window.__fc.page().scrollTop, hidden: !window.__fc.shown(document.getElementById('scrollTopBtn')), tab: window.__L5R_CAROUSEL__.getActiveTab().label}));
      set('TOP-RETURNS', back.top === 0 && back.hidden && back.tab === 'Skills', back);

      // Quick Access opens upward from its button, between the header and the button, and closes as before.
      await page.evaluate(() => window.__fc.scroll(500)); await settle(page);
      const kept0 = await page.evaluate(() => window.__fc.page().scrollTop);
      await page.tap('#quickAccessToggleBtn'); await settle(page);
      const qa = await page.evaluate(() => { const F = window.__fc, p = document.getElementById('quickAccessPanel'), b = document.getElementById('quickAccessToggleBtn');
        const head = F.rect(document.getElementById('carTopbar'));
        if (!F.shown(p)) return {shown: false};
        // The button's own layout box, not its painted one: its existing :hover/:active scale (Phase 2, Part H) is
        // still transitioning just after a tap, which moves getBoundingClientRect by 1-2 px (found by the 4x screen).
        const pr = F.rect(p), br = {left: b.offsetLeft, top: b.offsetTop};
        return {shown: true, expanded: b.getAttribute('aria-expanded'), belowHeader: pr.top >= head.bottom - 0.5, aboveButton: pr.bottom <= br.top + 0.5,
          beside: Math.abs(br.top - 8 - pr.bottom) < 1 && Math.abs(pr.left - br.left) < 1, inView: pr.top >= 0 && pr.bottom <= innerHeight,
          voidRead: F.hits(document.getElementById('qaVoidValue')), closeTappable: F.hits(document.getElementById('quickAccessCloseBtn'))}; });
      set('QA-OPENS-UPWARD', qa.shown && qa.expanded === 'true' && qa.belowHeader && qa.aboveButton && qa.inView && qa.voidRead && qa.closeTappable, qa);
      set('QA-PANEL-BESIDE-BUTTON', qa.beside === true, qa);
      await page.tap('#quickAccessToggleBtn'); await settle(page);
      const c1 = await page.evaluate(() => document.getElementById('quickAccessPanel').hidden);
      await page.tap('#quickAccessToggleBtn'); await settle(page);
      await page.keyboard.press('Escape'); await settle(page);
      const c2 = await page.evaluate(() => document.getElementById('quickAccessPanel').hidden);
      await page.tap('#quickAccessToggleBtn'); await settle(page);
      await page.evaluate(() => { const r = window.__fc.page().getBoundingClientRect(); window.__fcOutside = [r.left + r.width / 2, r.top + 40]; });
      const at = await page.evaluate(() => window.__fcOutside);
      await page.touchscreen.tap(at[0], at[1]); await settle(page);
      const c3 = await page.evaluate(() => document.getElementById('quickAccessPanel').hidden);
      set('QA-CLOSES', c1 && c2 && c3, [c1, c2, c3]);

      // The dice opens the manual roll, which sits above the controls like every modal.
      await page.tap('#floatingDiceBtn'); await settle(page);
      const dice = await page.evaluate(() => { const o = document.getElementById('manualRollPromptOverlay'), d = document.getElementById('floatingDiceBtn').getBoundingClientRect();
        const h = document.elementFromPoint(d.left + d.width / 2, d.top + d.height / 2); return {open: getComputedStyle(o).display === 'flex', above: !!h && o.contains(h)}; });
      set('DICE-OPENS', dice.open && dice.above, dice);
      await page.evaluate(() => { document.getElementById('manualRollPromptOverlay').style.display = 'none'; });
      const kept = await page.evaluate(() => ({top: window.__fc.page().scrollTop, tab: window.__L5R_CAROUSEL__.getActiveTab().label}));
      set('PAGE-POSITION-KEPT', kept.top === kept0 && kept0 >= 400 && kept.tab === 'Skills', {kept0, kept});

      // Every tab can still be tapped, and a tap goes to that tab. First, with the page scrolled so return-to-top is
      // showing, every tab must be reachable at its centre (return-to-top used to sit on the tabs).
      const tabRes = [];
      await page.evaluate(() => window.__fc.scroll(600)); await settle(page);
      const topShown = await page.evaluate(() => window.__fc.shown(document.getElementById('scrollTopBtn')));
      if (!topShown) tabRes.push(['return-to-top not showing']);
      for (const label of await page.evaluate(() => window.__L5R_CAROUSEL__.getTabs().filter(t => !t.panel.hidden).map(t => t.label))) {
        const hit = await page.evaluate(l => { const b = window.__L5R_CAROUSEL__.getTabs().find(t => t.label === l).tab;
          b.scrollIntoView({inline: 'center', block: 'nearest'}); return window.__fc.hits(b); }, label);
        if (!hit) tabRes.push([label, 'covered while return-to-top shows']);
      }
      for (const label of await tabs(page, 'play')) {
        const t = await page.evaluate(l => { const b = window.__L5R_CAROUSEL__.getTabs().find(t => t.label === l).tab; b.scrollIntoView({inline: 'center', block: 'nearest'}); return null; }, label);
        await settle(page);
        const box = await page.evaluate(l => { const b = window.__L5R_CAROUSEL__.getTabs().find(t => t.label === l).tab, r = b.getBoundingClientRect();
          return {x: r.left + r.width / 2, y: r.top + r.height / 2, hit: window.__fc.hits(b)}; }, label);
        await page.touchscreen.tap(box.x, box.y);
        await page.evaluate(() => window.__L5R_CAROUSEL__.whenSettled());
        const now = await page.evaluate(() => window.__L5R_CAROUSEL__.getActiveTab().label);
        if (!box.hit || now !== label) tabRes.push([label, box.hit, now]);
      }
      set('TABS-REACHABLE', tabRes.length === 0, tabRes);

      // Search stays where it is: in the app bar, and no destination button has joined the floating controls.
      const search = await page.evaluate(() => { const s = document.querySelector('#ab113Bar [data-section="search"]');
        return {there: !!s && window.__fc.hits(s), noneFloating: !document.querySelector('body > [data-section]')}; });
      set('SEARCH-IN-APP-BAR', search.there && search.noneFloating, search);

      // Screens and dialogs above the sheet still cover the strip and its controls.
      await page.evaluate(() => window.__L5R_TEST__.CL11.open()); await settle(page);
      const over = await page.evaluate(() => { const v = document.getElementById('cl11View'), out = [];
        for (const id of ['floatingDiceBtn', 'quickAccessToggleBtn']) { const e = document.getElementById(id); if (!e) continue;
          const r = e.getBoundingClientRect(); if (!r.width) continue; const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); out.push(!!h && v.contains(h)); }
        return out; });
      set('OVERLAYS-ABOVE', over.length >= 2 && over.every(Boolean), over);
      await page.evaluate(() => window.__L5R_TEST__.CL11.close()); await settle(page);

      // Print shows none of the controls, and the end-of-page room is not printed.
      await page.emulateMedia({media: 'print'});
      const pr = await page.evaluate(() => ({room: [...document.querySelectorAll('.car-page:not([data-clone])')].every(p => getComputedStyle(p).paddingBottom !== '116px'),
        controls: ['floatingDiceBtn', 'quickAccessToggleBtn', 'scrollTopBtn'].every(id => getComputedStyle(document.getElementById(id)).display === 'none')}));
      await page.emulateMedia({media: 'screen'});
      set('PRINT-HIDDEN', pr.room && pr.controls, pr);
    });

    // ---------- Small phone, 375 x 667
    await session(browser, SMALL, async page => {
      const r = await sweep(page, ['top', 'end']);
      const qa = await (async () => { await page.tap('#quickAccessToggleBtn'); await settle(page);
        return page.evaluate(() => { const F = window.__fc, p = document.getElementById('quickAccessPanel'), b = document.getElementById('quickAccessToggleBtn'), h = F.rect(document.getElementById('carTopbar'));
          if (!F.shown(p)) return {shown: false}; const pr = F.rect(p); return {shown: true, inBand: pr.top >= h.bottom - 0.5 && pr.bottom <= b.offsetTop + 0.5}; }); })();
      set('SMALL-PHONE-CLEAR', r.bad.length === 0 && r.last.length === 0 && qa.inBand === true, {bad: r.bad.slice(0, 4), last: r.last, qa});
    });

    // ---------- Phone on its side, 844 x 390: return-to-top beside the dice, not above it, and less room at the end.
    await session(browser, LANDSCAPE, async page => {
      const r = await sweep(page, ['top', 'end']);
      await tabs(page, 'management'); await go(page, 'Skills');
      await page.evaluate(() => window.__fc.scroll(600)); await settle(page);
      const s = await page.evaluate(() => { const l = window.__fc.layout(), t = l.controls.scrollTopBtn || null, d = l.controls.floatingDiceBtn || null, p = window.__fc.page();
        return {h: Math.round(p.getBoundingClientRect().height), room: getComputedStyle(p).paddingBottom,
          beside: !!t && !!d && Math.abs((t.rect.top + t.rect.bottom) / 2 - (d.rect.top + d.rect.bottom) / 2) < 1 && Math.abs(d.rect.left - t.rect.right - 8) < 1}; });
      console.log('  note landscape page height ' + s.h + 'px');
      set('LANDSCAPE-CLEAR', r.bad.length === 0 && r.last.length === 0 && s.h > 0 && s.beside && s.room === '64px', {bad: r.bad.slice(0, 4), last: r.last, s});
    });

    // ---------- Desktop, 1440 x 1000: the controls sit in the page margins, so at every position none lies over the
    // page's content column.
    await session(browser, DESKTOP, async page => {
      const overInner = [];
      const r = await sweep(page, ['top', 'middle', 'end'], async (mode, label, where) => {
        const o = await page.evaluate(() => { const F = window.__fc, ir = F.rect(F.page().querySelector('.car-page-inner'));
          return ['quickAccessToggleBtn', 'scrollTopBtn', 'floatingDiceBtn'].map(id => document.getElementById(id)).filter(F.shown).filter(e => F.overlap(F.rect(e), ir)).map(e => e.id); });
        if (o.length) overInner.push([mode, label, where, o]);
      });
      // Return to top must be showing for this part to test anything: Adv & Disadv (long at every width), 600 px down.
      await tabs(page, 'management'); await go(page, 'Adv & Disadv');
      await page.evaluate(() => window.__fc.scroll(600)); await settle(page);
      const t = await page.evaluate(() => { const l = window.__fc.layout(), t = l.controls.scrollTopBtn || null, d = l.controls.floatingDiceBtn || null;
        return {t, above: !!t && !!d && Math.abs((t.rect.left + t.rect.right) / 2 - (d.rect.left + d.rect.right) / 2) < 1 && Math.abs(d.rect.top - t.rect.bottom - 8) < 1}; });
      set('DESKTOP-CLEAR', r.bad.length === 0 && r.last.length === 0 && overInner.length === 0 && !!t.t && !t.t.onTabs && t.t.inCorner && t.above,
        {bad: r.bad.slice(0, 4), last: r.last, overInner: overInner.slice(0, 4), t});
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
