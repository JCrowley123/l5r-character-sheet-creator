/* BUGFIX — Screen Focus from the App Bar: real-browser acceptance (desktop width, where the keyboard matters).
 * Oracles: document.activeElement, the Characters screen's own visibility, and the sheet's own data. Each keyboard
 * step waits two animation frames so the browser's own focus handling has run.
 * node screen-focus-harness.js <sheet.html>
 */
'use strict';
const path = require('path'), {pathToFileURL} = require('url'), {chromium} = require('playwright');
const IDS = ['SFO-SWITCH', 'SFO-SEARCH-OPEN-FOCUS', 'SFO-SEARCH-ESCAPE-CLOSES', 'SFO-REOPEN-ENTRY-FOCUS', 'SFO-REOPEN-ESCAPE-TWICE',
  'SFO-CHARACTERS-OPEN-FOCUS', 'SFO-FIELD-LEFT-ALONE', 'SFO-STARTUP-LEFT-ALONE', 'SFO-NO-KEYBOARD', 'SFO-CHARACTER-UNCHANGED', 'SFO-NO-PAGE-ERRORS'];
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 300) + ' expected=' + JSON.stringify(expected)));
}
const BAR = '#ab113Bar';
const frames = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const focusIs = page => page.evaluate(BAR => {
  const a = document.activeElement, v = document.getElementById('cl11View');
  return {inView: !!v && v.contains(a), what: a === document.body ? 'body' : a.matches('.s14-title') ? 'search title' :
    a.matches('.cl11-title') ? 'characters title' : a.matches('.s14-detail h3') ? 'entry heading' : a.matches('.s14-row') ? 'result' :
    a.closest(BAR) ? 'app bar' : (a.id || a.tagName)};
}, BAR);
const viewOpen = page => page.evaluate(() => { const v = document.getElementById('cl11View'); return !!v && !v.hidden; });
async function ready(page) {
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
}
async function main() {
  const browser = await chromium.launch(), errors = [];
  const sheet = pathToFileURL(path.resolve(process.argv[2])).href;
  try {
    const context = await browser.newContext({viewport:{width:1024, height:800}});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(sheet);
    await ready(page);
    await page.evaluate(() => {
      window.__sfoData = JSON.stringify(window.__L5R_TEST__.collectData());
      window.__sfoInput = 0;
      document.addEventListener('focusin', e => { if (e.target && e.target.id === 's14Input') window.__sfoInput++; }, true);
    });
    check('SFO-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SCREEN_FOCUS_FIX_ENABLED === true && !!window.__L5R_TEST__.SCREENFOCUS &&
      window.__L5R_TEST__.SCREENFOCUS.enabled()));
    await page.click(BAR + ' [data-section="search"]'); await frames(page);
    check('SFO-SEARCH-OPEN-FOCUS', await focusIs(page), {inView:true, what:'search title'});
    await page.keyboard.press('Escape'); await frames(page);
    check('SFO-SEARCH-ESCAPE-CLOSES', await viewOpen(page), false);

    // An entry left open, the sheet, then Search again from the app bar.
    if (!(await viewOpen(page))) await page.click(BAR + ' [data-section="search"]');
    await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'spells', text:'fire'}));
    await page.locator('.s14-row').first().click();
    await page.click(BAR + ' [data-section="sheet"]'); await frames(page);
    await page.click(BAR + ' [data-section="search"]'); await frames(page);
    check('SFO-REOPEN-ENTRY-FOCUS', await focusIs(page), {inView:true, what:'entry heading'});
    await page.keyboard.press('Escape'); await frames(page);
    const afterOne = [await page.evaluate(() => document.querySelector('.s14-detail').hidden), await viewOpen(page)];
    await page.keyboard.press('Escape'); await frames(page);
    check('SFO-REOPEN-ESCAPE-TWICE', [afterOne, await viewOpen(page)], [[true, true], false]);

    await page.click(BAR + ' [data-section="characters"]'); await frames(page);
    const chars = await focusIs(page);
    await page.keyboard.press('Escape'); await frames(page);
    check('SFO-CHARACTERS-OPEN-FOCUS', [chars, await viewOpen(page)], [{inView:true, what:'characters title'}, false]);

    // Search opened by a script while the reader is in a text box: the fix does not pull focus into the screen.
    // (The screen makes the sheet behind it inert, so the box is a test-only one outside both; its focus is checked first.)
    if (await viewOpen(page)) await page.keyboard.press('Escape');
    check('SFO-FIELD-LEFT-ALONE', await page.evaluate(async () => {
      const box = document.body.appendChild(document.createElement('input'));
      box.type = 'text'; box.focus();
      const premise = document.activeElement === box;
      await window.__L5R_TEST__.SEARCHPAGE14.open();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const v = document.getElementById('cl11View'), out = [premise, !!v && v.contains(document.activeElement)];
      box.remove();
      return out;
    }), [true, false]);
    await page.evaluate(() => window.__L5R_TEST__.CL11.close());
    check('SFO-NO-KEYBOARD', await page.evaluate(() => window.__sfoInput), 0);
    check('SFO-CHARACTER-UNCHANGED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()) === window.__sfoData));

    // A saved character opens the Characters screen at start-up: the fix does not move focus then.
    await page.evaluate(() => {
      const data = window.__L5R_TEST__.collectData(); data.fields.f_name = 'Startup Test';
      localStorage.setItem('l5r-sheet:local:l5r-char:sfo-start', JSON.stringify(data));
      localStorage.setItem('l5r-sheet:local:l5r-char-index', JSON.stringify([{id:'sfo-start', name:'Startup Test', clan:'', updatedAt:1}]));
    });
    await page.reload();
    await ready(page);
    await page.waitForFunction(() => window.__L5R_TEST__.CL11.isOpen && window.__L5R_TEST__.CL11.isOpen(), null, {timeout:20000});
    await page.waitForTimeout(300); await frames(page);
    check('SFO-STARTUP-LEFT-ALONE', await page.evaluate(() => document.activeElement === document.body), true);
    check('SFO-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } catch (e) {
    for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached: ' + String(e.message || e).split('\n')[0], 'completed');
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + IDS.length + ' checks passed');
  process.exitCode = pass === IDS.length && results.length === IDS.length ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
