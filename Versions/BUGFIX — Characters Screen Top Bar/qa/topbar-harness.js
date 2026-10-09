/* Real-browser acceptance tests for BUGFIX — Characters Screen Top Bar.
 * Headless Chromium keeps a sticky bar pinned even inside a scrolling overlay, so the iPhone symptom cannot be
 * reproduced here; these checks prove the structure instead: nothing above the tab row scrolls, each panel does,
 * the row stays put whatever a panel's scroll, and the column is the one Phase 11 (Part K) set.
 * Oracles: computed styles, geometry, and Phase 11's own stylesheet rule for the column; never the fix's files.
 * node topbar-harness.js <sheet.html>
 */
'use strict';
const path = require('path');
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual).slice(0, 600)} expected=${JSON.stringify(expected).slice(0, 600)}`}`);
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id + '-EXCEPTION', String(error.stack || error).split('\n')[0], 'no exception'); }
}
const SEED = 24;   // enough characters that the Characters list itself is longer than a phone screen

// Page-side helpers, installed once per page.
function helpers() {
  const scrolls = n => /^(auto|scroll)$/.test(getComputedStyle(n).overflowY);
  const shown = n => !!n && getComputedStyle(n).display !== 'none' && n.getClientRects().length > 0;
  const view = () => document.getElementById('cl11View');
  const nav = () => view().querySelector('.cl11-nav');
  const panel = () => [...view().querySelectorAll('.cl11-panel')].find(p => !p.hidden);
  window.__tb = {
    scrolls, shown, view, nav, panel,
    frames: () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))),
    // Every element from the tab row (or, where something hides the row, the panel) up to <html> that scrolls.
    scrollingAbove() {
      const start = shown(nav()) ? nav() : panel();
      const out = [];
      for (let n = start.parentElement; n; n = n.parentElement) if (scrolls(n)) out.push(n.id || n.tagName.toLowerCase());
      return out;
    },
    structure() {
      const v = view(), p = panel();
      return {above: this.scrollingAbove(), viewScrolls: scrolls(v) && v.scrollHeight > v.clientHeight + 1,
        panelScrolls: scrolls(p), long: p.scrollHeight > p.clientHeight + 1};
    },
    // The row's top at three scroll positions of the panel, and whether the panel really moved.
    async barTops() {
      const p = panel(), tops = [], positions = [];
      for (const to of [0, 0.5, 1]) {
        p.scrollTop = Math.round((p.scrollHeight - p.clientHeight) * to);
        await this.frames();
        positions.push(p.scrollTop);
        tops.push(shown(nav()) ? Math.round(nav().getBoundingClientRect().top - v0()) : null);
      }
      function v0() { const v = view(); return v.getBoundingClientRect().top + parseFloat(getComputedStyle(v).paddingTop); }
      p.scrollTop = 0;
      return {tops, moved: new Set(positions).size === 3};
    },
    // The panel fills the screen below the row: its top meets the row (or the screen's top) and its bottom the screen's.
    fills() {
      const v = view(), p = panel(), vs = getComputedStyle(v), r = p.getBoundingClientRect(), vr = v.getBoundingClientRect();
      const top = shown(nav()) ? nav().getBoundingClientRect().bottom : vr.top + parseFloat(vs.paddingTop);
      return [Math.round(r.top - top), Math.round(vr.bottom - parseFloat(vs.paddingBottom) - r.bottom)];
    },
    sideways() {
      const v = view(), p = panel();
      return document.documentElement.scrollWidth <= innerWidth && v.scrollWidth <= v.clientWidth && p.scrollWidth <= p.clientWidth;
    },
  };
}

async function main() {
  const browser = await chromium.launch();
  const errors = [];
  try {
    const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    await context.addInitScript(n => {
      if (localStorage.getItem('l5r-sheet:local:l5r-char-index')) return;
      const index = [];
      for (let i = 1; i <= n; i++) {
        const id = 'c_seed_' + i;
        localStorage.setItem('l5r-sheet:local:l5r-char:' + id, JSON.stringify({fields:{f_name:'Seed ' + i, f_clan:'Crab Clan',
          f_family:'Hida', f_school:'Hida Bushi', f_insightRank:'1'}}));
        index.push({id, name:'Seed ' + i, clan:'Crab Clan', updatedAt:i});
      }
      localStorage.setItem('l5r-sheet:local:l5r-char-index', JSON.stringify(index));
    }, SEED);
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
    await page.evaluate(helpers);

    // Each page the owner named (the Search home, Skills, the Paths, an Ancestor), plus the Characters list,
    // the Library placeholder and a short entry (a spell).
    const pages = [
      ['CHARACTERS', async () => page.evaluate(() => window.__L5R_TEST__.CL11.open('characters')), true],
      ['LIBRARY', async () => page.evaluate(() => window.__L5R_TEST__.CL11.open('library')), false],
      ['SEARCH-HOME', async () => page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:null, text:''})), null],
      ['SKILLS', async () => page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'skills', text:''})), true],
      ['PATHS', async () => page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'paths', text:''})), true],
      ['ANCESTOR', async () => { await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'ancestors', text:''}));
        await page.click('.s14-row'); }, null],
      ['SPELL', async () => { await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:''}));
        await page.click('.s14-row'); }, null],
    ];
    for (const [name, go, long] of pages) {
      await section('TB-' + name, async () => {
        await go();
        await page.evaluate(() => window.__tb.frames());
        const s = await page.evaluate(() => window.__tb.structure());
        check('TB-' + name + '-STRUCTURE', [s.above, s.viewScrolls, s.panelScrolls, long === null ? null : s.long],
          [[], false, true, long]);
        const bar = await page.evaluate(() => window.__tb.barTops());
        // Test-only term for Phase 11.3 (Part K), 9 October 2026: while the app bar is present it hides this row, so a
        // hidden row is not measured; the structure checks above still are.
        const rowShown = await page.evaluate(() => window.__tb.shown(window.__tb.nav()));
        check('TB-' + name + '-BAR-STAYS', [bar.tops, s.long ? bar.moved : null], [rowShown ? [0, 0, 0] : [null, null, null], s.long ? true : null]);
        check('TB-' + name + '-FILLS', await page.evaluate(() => window.__tb.fills()), [0, 0]);
      });
    }

    // The column: Phase 11's own rule (max-width and padding of .cl11-panel) is the oracle for its content width.
    await section('TB-COLUMN', async () => {
      const rule = await page.evaluate(() => {
        for (const sheet of document.styleSheets) {
          let rules = [];
          try { rules = sheet.cssRules || []; } catch (e) { continue; }   // a cross-origin font sheet
          for (const r of rules) if (r.selectorText === '.cl11-panel') return {max:parseFloat(r.style.maxWidth), pad:parseFloat(r.style.paddingLeft)};
        }
        return null;
      });
      check('TB-COLUMN-RULE-FOUND', !!rule && rule.max > 0 && rule.pad > 0);
      for (const [w, h] of [[1280, 800], [390, 844]]) {
        await page.setViewportSize({width:w, height:h});
        await page.evaluate(() => window.__L5R_TEST__.CL11.open('characters'));
        const m = await page.evaluate(() => {
          const v = window.__tb.view(), p = window.__tb.panel(), cs = getComputedStyle(p), r = p.getBoundingClientRect();
          const content = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          return {content:Math.round(content), even:Math.abs(parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) < 1,
            edge:Math.round(v.getBoundingClientRect().right - r.right), pad:Math.round(parseFloat(cs.paddingLeft))};
        });
        const expected = Math.min(rule.max, w) - 2 * rule.pad;
        check('TB-COLUMN-' + w, m.content <= expected + 1 && m.content >= expected - 16 && m.even && m.edge === 0 &&
          (w >= rule.max ? m.content === expected : m.pad === rule.pad), true);
      }
    });

    for (const [w, h] of [[320, 700], [375, 812], [390, 844]]) {
      await section('TB-SIDEWAYS-' + w, async () => {
        await page.setViewportSize({width:w, height:h});
        const out = [];
        for (const [, go] of pages) { await go(); out.push(await page.evaluate(() => window.__tb.sideways())); }
        check('TB-NO-SIDEWAYS-SCROLL-' + w, out, pages.map(() => true));
      });
    }
    await page.setViewportSize({width:390, height:844});

    // Search's own scroll memory follows the panel that now scrolls: Back, and ‹ Sheet then Search.
    await section('TB-SEARCH', async () => {
      await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'skills', text:''}));
      await page.evaluate(async () => { window.__tb.panel().scrollTop = 300; await window.__tb.frames(); });
      const before = await page.evaluate(() => window.__tb.panel().scrollTop);
      // A row already on screen, clicked in the page, so nothing scrolls it into view first.
      await page.evaluate(() => { const p = window.__tb.panel(), top = p.getBoundingClientRect().top;
        [...p.querySelectorAll('.s14-row')].find(b => b.getBoundingClientRect().top > top + 40).click(); });
      const inEntry = await page.evaluate(() => window.__tb.panel().scrollTop);
      await page.click('.s14-detail [data-s14="back"]');
      check('TB-SEARCH-BACK-RESTORES', [before > 0, inEntry, await page.evaluate(() => window.__tb.panel().scrollTop)], [true, 0, before]);
      await page.evaluate(async () => { window.__L5R_TEST__.CL11.close(); await window.__L5R_TEST__.SEARCHPAGE14.open(); });
      check('TB-SEARCH-RETURNS', await page.evaluate(() => [window.__tb.panel().dataset.panel, window.__tb.panel().scrollTop]), ['search', before]);
    });

    check('TB-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
