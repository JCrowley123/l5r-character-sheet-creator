'use strict';
// Release 15a, A02 (PART H PHASE 15.1.2): the floating controls on one strip above the tabs.
//   node floating-strip-harness.js <sheet.html> [--variant]
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the layer: the carousel's own page and tab bar, the header, and what the browser
// reports at a point (elementFromPoint). The strip is looked up only to check where it is, never asked where the
// controls should be.
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
  const shown = e => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' && e.getClientRects().length > 0;
  const overlap = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const inside = (a, b) => a.left >= b.left - 0.5 && a.right <= b.right + 0.5 && a.top >= b.top - 0.5 && a.bottom <= b.bottom + 0.5;
  const page = () => [...document.querySelectorAll('.car-page:not([data-clone])')].find(p => !p.hidden && !p.inert && Math.abs(p.getBoundingClientRect().left) < 5) || null;
  const hits = e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)); };
  window.__fc = {rect, shown, overlap, inside, page, hits,
    scroll: where => { const p = page(); if (p) p.scrollTop = where === 'top' ? 0 : where === 'end' ? p.scrollHeight : where; return p ? p.scrollTop : null; },
    // Where each visible floating control lies against the page and the tab bar.
    layout() {
      const p = page(), tabs = document.getElementById('carTabbar'), strip = document.getElementById('fc15Strip');
      const pr = rect(p), tr = rect(tabs), sr = shown(strip) ? rect(strip) : null;
      const out = {page: pr, tabs: tr, strip: sr, controls: {}};
      for (const id of ['quickAccessToggleBtn', 'scrollTopBtn', 'floatingDiceBtn']) {
        const e = document.getElementById(id);
        if (!shown(e)) continue;
        const r = rect(e);
        out.controls[id] = {overPage: overlap(r, pr), onTabs: overlap(r, tr), onStrip: !!sr && inside(r, sr), tappable: hits(e)};
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
// Every tab, Play and Manage, at the top, part-way and at the end: no floating control over the page or the tabs.
async function sweep(page, wheres, extra) {
  const bad = [], last = [];
  for (const mode of ['play', 'management']) {
    for (const label of await tabs(page, mode)) {
      await go(page, label);
      for (const where of wheres) {
        await page.evaluate(w => window.__fc.scroll(w), where);
        await settle(page);
        const l = await page.evaluate(() => window.__fc.layout());
        if (l.page.bottom > (l.strip ? l.strip.top : l.tabs.top) + 0.5) bad.push([mode, label, where, 'page runs under the strip']);
        for (const [id, c] of Object.entries(l.controls))
          if (c.overPage || c.onTabs || !c.onStrip || !c.tappable) bad.push([mode, label, where, id, c]);
        if (where === 'end') { const lo = await page.evaluate(() => window.__fc.lowest()); if (!lo.none && !lo.tappable) last.push([mode, label, lo.missed]); }
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
      const placed = await page.evaluate(() => { const shell = document.getElementById('carShell'), tabs = document.getElementById('carTabbar'), strip = document.getElementById('fc15Strip');
        if (!strip) return {strip: false};
        const sr = strip.getBoundingClientRect(), tr = tabs.getBoundingClientRect(), pr = window.__fc.page().getBoundingClientRect();
        return {parent: strip.parentElement === shell, before: strip.nextElementSibling === tabs, flush: Math.abs(sr.bottom - tr.top) < 0.5,
          height: Math.round(sr.height), pageAbove: pr.bottom <= sr.top + 0.5, full: Math.round(sr.width) === innerWidth,
          hidden: strip.getAttribute('aria-hidden') === 'true' && !strip.querySelector('button,a,input,select,[tabindex]')}; });
      set('STRIP-PLACED', placed.parent && placed.before && placed.flush && placed.height === 52 && placed.pageAbove && placed.full && placed.hidden, placed);

      const headings = [];
      const r = await sweep(page, ['top', 'middle', 'end'], async (mode, label, where) => {
        if (where !== 'top') return;
        const h = await page.evaluate(() => window.__fc.heading());
        if (!h.none && !(h.start && h.middle)) headings.push([mode, label, h]);
      });
      set('PHONE-NO-CONTROL-OVER-PAGE', r.bad.length === 0, r.bad.slice(0, 6));
      set('PHONE-HEADINGS-CLEAR', headings.length === 0, headings);
      set('PHONE-LAST-LINE-REACHABLE', r.last.length === 0, r.last);

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
      const shownTop = await page.evaluate(() => { const l = window.__fc.layout(); return {c: l.controls.scrollTopBtn || null,
        count: [...document.querySelectorAll('[aria-label="Scroll to top"],[title="Scroll to top"]')].filter(window.__fc.shown).length}; });
      set('TOP-SHOWN-AFTER-SCROLL', !!shownTop.c && shownTop.c.onStrip && !shownTop.c.onTabs && !shownTop.c.overPage && shownTop.c.tappable, shownTop);
      set('ONE-TOP-CONTROL', shownTop.count === 1, shownTop);
      await page.tap('#scrollTopBtn'); await settle(page);
      const back = await page.evaluate(() => ({top: window.__fc.page().scrollTop, hidden: !window.__fc.shown(document.getElementById('scrollTopBtn')), tab: window.__L5R_CAROUSEL__.getActiveTab().label}));
      set('TOP-RETURNS', back.top === 0 && back.hidden && back.tab === 'Skills', back);

      // Quick Access opens upward from its button, between the header and the strip, and closes as before.
      await page.evaluate(() => window.__fc.scroll(500)); await settle(page);
      const kept0 = await page.evaluate(() => window.__fc.page().scrollTop);
      await page.tap('#quickAccessToggleBtn'); await settle(page);
      const qa = await page.evaluate(() => { const F = window.__fc, p = document.getElementById('quickAccessPanel'), b = document.getElementById('quickAccessToggleBtn');
        const strip = document.getElementById('fc15Strip'), head = F.rect(document.getElementById('carTopbar'));
        if (!F.shown(p)) return {shown: false};
        // The button's own layout box, not its painted one: its existing :hover/:active scale (Phase 2, Part H) is
        // still transitioning just after a tap, which moves getBoundingClientRect by 1-2 px (found by the 4x screen).
        const pr = F.rect(p), sr = strip && F.shown(strip) ? F.rect(strip) : null, br = {left: b.offsetLeft, top: b.offsetTop};
        return {shown: true, expanded: b.getAttribute('aria-expanded'), belowHeader: pr.top >= head.bottom - 0.5, aboveStrip: !!sr && pr.bottom <= sr.top + 0.5,
          beside: !!sr && Math.abs(sr.top - 8 - pr.bottom) < 1 && Math.abs(pr.left - br.left) < 1, inView: pr.top >= 0 && pr.bottom <= innerHeight,
          voidRead: F.hits(document.getElementById('qaVoidValue')), closeTappable: F.hits(document.getElementById('quickAccessCloseBtn'))}; });
      set('QA-OPENS-ABOVE-STRIP', qa.shown && qa.expanded === 'true' && qa.belowHeader && qa.aboveStrip && qa.inView && qa.voidRead && qa.closeTappable, qa);
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

      // The dice opens the manual roll, which sits above the strip like every modal.
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

      // Search stays where it is: in the app bar, not on the strip.
      const search = await page.evaluate(() => { const s = document.querySelector('#ab113Bar [data-section="search"]'), strip = document.getElementById('fc15Strip');
        return {there: !!s && window.__fc.hits(s), notOnStrip: !strip || !strip.querySelector('[data-section]')}; });
      set('SEARCH-IN-APP-BAR', search.there && search.notOnStrip, search);

      // Screens and dialogs above the sheet still cover the strip and its controls.
      await page.evaluate(() => window.__L5R_TEST__.CL11.open()); await settle(page);
      const over = await page.evaluate(() => { const v = document.getElementById('cl11View'), out = [];
        for (const id of ['floatingDiceBtn', 'quickAccessToggleBtn', 'fc15Strip']) { const e = document.getElementById(id); if (!e) continue;
          const r = e.getBoundingClientRect(); if (!r.width) continue; const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); out.push(!!h && v.contains(h)); }
        return out; });
      set('OVERLAYS-ABOVE', over.length >= 2 && over.every(Boolean), over);
      await page.evaluate(() => window.__L5R_TEST__.CL11.close()); await settle(page);

      // Print shows neither the strip nor the controls.
      await page.emulateMedia({media: 'print'});
      const pr = await page.evaluate(() => ({strip: (s => !s || getComputedStyle(s).display === 'none')(document.getElementById('fc15Strip')),
        controls: ['floatingDiceBtn', 'quickAccessToggleBtn', 'scrollTopBtn'].every(id => getComputedStyle(document.getElementById(id)).display === 'none')}));
      await page.emulateMedia({media: 'screen'});
      set('PRINT-HIDDEN', pr.strip && pr.controls, pr);
    });

    // ---------- Small phone, 375 x 667
    await session(browser, SMALL, async page => {
      const r = await sweep(page, ['top', 'end']);
      const qa = await (async () => { await page.tap('#quickAccessToggleBtn'); await settle(page);
        return page.evaluate(() => { const F = window.__fc, p = document.getElementById('quickAccessPanel'), s = document.getElementById('fc15Strip'), h = F.rect(document.getElementById('carTopbar'));
          if (!F.shown(p) || !s) return {shown: F.shown(p), strip: !!s}; const pr = F.rect(p), sr = F.rect(s); return {shown: true, inBand: pr.top >= h.bottom - 0.5 && pr.bottom <= sr.top + 0.5}; }); })();
      set('SMALL-PHONE-CLEAR', r.bad.length === 0 && r.last.length === 0 && qa.inBand === true, {bad: r.bad.slice(0, 4), last: r.last, qa});
    });

    // ---------- Phone on its side, 844 x 390
    await session(browser, LANDSCAPE, async page => {
      const r = await sweep(page, ['top', 'end']);
      const h = await page.evaluate(() => Math.round(window.__fc.page().getBoundingClientRect().height));
      console.log('  note landscape page height ' + h + 'px');
      set('LANDSCAPE-CLEAR', r.bad.length === 0 && r.last.length === 0 && h > 0, {bad: r.bad.slice(0, 4), last: r.last, h});
    });

    // ---------- Desktop, 1440 x 1000
    await session(browser, DESKTOP, async page => {
      const r = await sweep(page, ['top', 'end']);
      // Return to top must be showing for this part to test anything: Adv & Disadv (long at every width), 600 px down.
      await tabs(page, 'management'); await go(page, 'Adv & Disadv');
      await page.evaluate(() => window.__fc.scroll(600)); await settle(page);
      const t = await page.evaluate(() => window.__fc.layout().controls.scrollTopBtn || null);
      set('DESKTOP-CLEAR', r.bad.length === 0 && r.last.length === 0 && !!t && !t.onTabs && t.onStrip && !t.overPage, {bad: r.bad.slice(0, 4), last: r.last, t});
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
