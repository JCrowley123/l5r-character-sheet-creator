/* BUGFIX — Search Focus on Close: real-browser acceptance (FT-34).
 * Oracles: the result button the reader actually pressed, the Characters screen's own visibility,
 * and the scroller position read before opening. Chromium moves focus off a hidden element at the
 * next rendering update, so each keyboard step waits two animation frames before it is read.
 * node search-focus-harness.js <sheet.html>
 */
'use strict';
const path = require('path');
const {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 400) +
    ' expected=' + JSON.stringify(expected).slice(0, 400)));
}
const IDS = ['SF-SWITCH', 'SF-BACK-RETURNS-FOCUS', 'SF-BACK-KEEPS-PLACE', 'SF-ESCAPE-RETURNS-FOCUS', 'SF-SECOND-ESCAPE-CLOSES',
  'SF-FILTERS-KEPT', 'SF-NO-KEYBOARD', 'SF-STALE-OPENER-FALLBACK', 'SF-REOPENED-ENTRY-RETURNS-FOCUS', 'SF-FOCUS-ELSEWHERE-LEFT',
  'SF-CHARACTER-AND-STORAGE-UNCHANGED', 'SF-NO-PAGE-ERRORS'];
const BAR = '#ab113Bar';
const frames = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
async function openSearch(page) {
  if (await page.$(BAR)) await page.click(BAR + ' [data-section="search"]');
  else { await page.click('#pm128More'); await page.click('#s14MenuItem'); }
  await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
}
async function toSheet(page) { await page.click((await page.$(BAR)) ? BAR + ' [data-section="sheet"]' : '.cl11-back'); }
// The focused element, described by what the reader would see: the result's entry id, or its role.
const focusInfo = page => page.evaluate(() => {
  const a = document.activeElement;
  return {row: a && a.classList.contains('s14-row') ? a.dataset.id : null, input: a === document.getElementById('s14Input'),
    body: a === document.body, up: !!a && a.dataset && a.dataset.s14 === 'up'};
});

async function main() {
  const browser = await chromium.launch();
  const errors = [];
  try {
    const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
    await page.evaluate(() => {
      window.__sfBefore = JSON.stringify(window.__L5R_TEST__.collectData());
      window.__sfStorage = JSON.stringify(Object.entries(localStorage).sort());
      // Records every time the text field takes focus: a focused field opens the iPhone keyboard.
      window.__sfInputFocus = 0;
      document.addEventListener('focusin', e => { if (e.target && e.target.id === 's14Input') window.__sfInputFocus++; }, true);
      window.__sfScroller = () => { for (let n = document.querySelector('.s14-page').parentElement; n; n = n.parentElement) {
        const y = getComputedStyle(n).overflowY; if (y === 'auto' || y === 'scroll') return n; } return document.scrollingElement; };
    });
    check('SF-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SEARCH_FOCUS_FIX_ENABLED === true &&
      !!window.__L5R_TEST__.SEARCHFOCUS && window.__L5R_TEST__.SEARCHFOCUS.enabled()));
    await page.keyboard.press('Escape');
    await openSearch(page);
    await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:''}));
    await page.fill('#s14Input', 'fire');
    // The third result, scrolled part-way: the reader's place is not the top of the list.
    const opener = await page.locator('.s14-row').nth(2).getAttribute('data-id');
    await page.evaluate(() => { window.__sfScroller().scrollTop = 120; });
    await frames(page);
    const listScroll = await page.evaluate(() => window.__sfScroller().scrollTop);
    await page.evaluate(() => { window.__sfInputFocus = 0; });
    await page.locator('.s14-row').nth(2).click();
    await page.click('.s14-detail [data-s14="back"]');
    await frames(page);
    check('SF-BACK-RETURNS-FOCUS', (await focusInfo(page)).row, opener);
    check('SF-BACK-KEEPS-PLACE', await page.evaluate(() => [document.querySelector('.s14-detail').hidden, document.querySelector('.s14-list').hidden,
      document.getElementById('s14Input').value, window.__sfScroller().scrollTop]), [true, false, 'fire', listScroll]);

    await page.locator('.s14-row').nth(2).click();
    await page.keyboard.press('Escape');
    await frames(page);
    const afterEscape = await page.evaluate(() => [document.querySelector('.s14-detail').hidden, document.getElementById('cl11View').hidden,
      document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.id || null : null, window.__sfScroller().scrollTop]);
    check('SF-ESCAPE-RETURNS-FOCUS', afterEscape, [true, false, opener, listScroll]);
    await page.keyboard.press('Escape');
    await frames(page);
    check('SF-SECOND-ESCAPE-CLOSES', await page.evaluate(() => document.getElementById('cl11View').hidden));

    // Filters and text survive, and focus returns into the filtered list.
    await openSearch(page);
    await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'kiho', text:''}));
    const hasFacets = await page.locator('[data-facet="ring"]').count() > 0;
    if (hasFacets) await page.selectOption('[data-facet="ring"]', 'Water');
    await page.fill('#s14Input', 'Dharma');
    const kiho = await page.locator('.s14-row').first().getAttribute('data-id');
    // Typing focused the field; from here, opening and closing the entry must not focus it again.
    await page.evaluate(() => { window.__sfInputFocus = 0; });
    await page.locator('.s14-row').first().click();
    await page.keyboard.press('Escape');
    await frames(page);
    check('SF-FILTERS-KEPT', [(await focusInfo(page)).row, hasFacets ? await page.locator('[data-facet="ring"]').inputValue() : 'Water',
      await page.locator('#s14Input').inputValue(), await page.evaluate(() => document.getElementById('cl11View').hidden)],
      [kiho, 'Water', 'Dharma', false]);
    check('SF-NO-KEYBOARD', await page.evaluate(() => [window.__sfInputFocus, document.activeElement === document.getElementById('s14Input')]), [0, false]);

    // The opening result is gone by the time the entry closes: focus stays in Search, never in the text field.
    await page.evaluate(async () => {
      const T = window.__L5R_TEST__;
      T.SPELL_LIBRARY.push({name:'Zz Focus Test Spell', element:'Fire', mastery:1, keywords:[], desc:'Test only.'});
      T.SEARCH14.invalidate();
      await T.SEARCHPAGE14.open({category:'spells', text:'Zz Focus Test'});
    });
    const staleRows = await page.locator('.s14-row').count();
    await page.locator('.s14-row').first().click();
    // While the entry is open, its record leaves the catalogue; Back then lists no results.
    await page.evaluate(() => { window.__L5R_TEST__.SPELL_LIBRARY.pop(); window.__L5R_TEST__.SEARCH14.invalidate(); });
    await page.click('.s14-detail [data-s14="back"]');
    await frames(page);
    const fb = await focusInfo(page);
    check('SF-STALE-OPENER-FALLBACK', [staleRows, await page.locator('.s14-row').count(), fb.up, fb.input, fb.body], [1, 0, true, false, false]);
    await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:''}));

    // Search reopened on an open entry (app bar), then Back: focus returns to that entry's result.
    const reopened = await page.locator('.s14-row').nth(1).getAttribute('data-id');
    await page.locator('.s14-row').nth(1).click();
    await toSheet(page);
    await openSearch(page);
    await page.waitForFunction(() => !document.querySelector('.s14-detail').hidden);
    await page.click('.s14-detail [data-s14="back"]');
    await frames(page);
    check('SF-REOPENED-ENTRY-RETURNS-FOCUS', (await focusInfo(page)).row, reopened);

    // An entry closed by something other than its own controls leaves focus where the reader put it.
    await page.locator('.s14-row').first().click();
    const left = await page.evaluate(async () => {
      const outside = document.body.appendChild(document.createElement('button'));
      outside.type = 'button';
      outside.textContent = 'Test only';
      outside.focus();
      await window.__L5R_TEST__.SEARCHPAGE14.open({category:'skills', text:''});
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const out = [document.activeElement === outside, document.querySelector('.s14-detail').hidden];
      outside.remove();
      return out;
    });
    check('SF-FOCUS-ELSEWHERE-LEFT', left, [true, true]);
    check('SF-CHARACTER-AND-STORAGE-UNCHANGED', await page.evaluate(() => [JSON.stringify(window.__L5R_TEST__.collectData()) === window.__sfBefore,
      JSON.stringify(Object.entries(localStorage).sort()) === window.__sfStorage]), [true, true]);
    check('SF-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } catch (e) {
    for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached: ' + String(e.message || e).split('\n')[0], 'completed');
  } finally { await browser.close(); }
  for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached', 'completed');
  const pass = results.filter(r => r.pass).length;
  if (results.length !== IDS.length) console.log('Unexpected check count ' + results.length);
  console.log(pass + '/' + IDS.length + ' checks passed');
  process.exitCode = pass === IDS.length && results.length === IDS.length ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
