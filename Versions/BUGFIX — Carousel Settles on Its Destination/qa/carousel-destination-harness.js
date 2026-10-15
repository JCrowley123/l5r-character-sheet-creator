/* BUGFIX — Carousel Settles on Its Destination: real-browser acceptance at phone width.
 * Oracles: the carousel's own seam (__L5R_CAROUSEL__), the track's resting position and document.activeElement.
 * Each scenario runs on a fresh page left quiet after start-up; the two start-up hazards are then forced on purpose:
 * a stale settle signal mid-glide (dispatched scrollend) and a resize mid-glide (viewport change).
 * node carousel-destination-harness.js <sheet.html>
 */
'use strict';
const path = require('path'), {pathToFileURL} = require('url'), {chromium} = require('playwright');
const IDS = ['CDS-TAB-STAYS-ON-DESTINATION', 'CDS-STALE-SETTLE-ARRIVES', 'CDS-STALE-SETTLE-FOCUS', 'CDS-RESIZE-150MS',
  'CDS-RESIZE-400MS', 'CDS-ALREADY-THERE-SETTLES', 'CDS-LATER-STEP-WINS', 'CDS-FINGER-TAKES-OVER', 'CDS-NO-PAGE-ERRORS'];
const DEST = 'Background';
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 300) + ' expected=' + JSON.stringify(expected)));
}
const errors = [];
async function freshPage(browser, options = {}) {
  const context = await browser.newContext({viewport: {width: 390, height: 844}, ...options});
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(sheet);
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready &&
    window.__L5R_CAROUSEL__ && window.__L5R_CAROUSEL__.isReady(), null, {timeout: 60000});
  await page.waitForTimeout(600);   // let start-up moves finish: these checks force the hazards themselves
  return {context, page};
}
// Wait until the track has stopped moving (and any settle is done), then report where it rests.
const restingPlace = page => page.evaluate(async () => {
  const C = window.__L5R_CAROUSEL__, track = document.getElementById('carTrack');
  await C.whenSettled(3000);
  let last = -1, still = 0;
  for (let t = 0; t < 60 && still < 4; t++) {
    await new Promise(r => setTimeout(r, 80));
    still = track.scrollLeft === last ? still + 1 : 0; last = track.scrollLeft;
  }
  const s = C.getState();
  return {label: s.label, atIndex: s.slot === s.index + s.offset};
});
let sheet;
async function main() {
  sheet = pathToFileURL(path.resolve(process.argv[2])).href;
  const browser = await chromium.launch();
  try {
    // A tab tap: the tab bar shows the destination for the whole glide, not the pages passed over.
    let {context, page} = await freshPage(browser);
    const start = await page.evaluate(() => window.__L5R_CAROUSEL__.getActiveTab().index);
    const tabs = await page.evaluate(() => window.__L5R_CAROUSEL__.getTabs().map(t => t.label));
    const dest = tabs.indexOf(DEST);
    if (start !== 0 || dest < 2) throw Error('premise: expected to start on the first page with ' + DEST + ' two or more away');
    await page.evaluate(() => {
      window.__cdsSeen = [];
      const C = window.__L5R_CAROUSEL__;
      document.addEventListener('click', () => {   // sample every frame from the tap on
        const until = performance.now() + 1500;
        requestAnimationFrame(function sample() {
          window.__cdsSeen.push(C.getActiveTab().label);
          if (performance.now() < until) requestAnimationFrame(sample);
        });
      }, {capture: true, once: true});
    });
    await page.locator('#carTabbarInner [role="tab"]').nth(dest).click();
    await page.waitForTimeout(1700);
    check('CDS-TAB-STAYS-ON-DESTINATION', await page.evaluate(() => [...new Set(window.__cdsSeen)]), [DEST]);
    await context.close();

    // A stale settle signal mid-glide (the start-up race): the move still ends on the destination.
    ({context, page} = await freshPage(browser));
    const stale = await page.evaluate(async (DEST) => {
      const C = window.__L5R_CAROUSEL__, track = document.getElementById('carTrack');
      const settled = C.whenSettled(4000);
      C.goToTab(DEST);
      track.dispatchEvent(new Event('scrollend'));
      const ok = await settled, label = C.getActiveTab().label, notes = document.getElementById('f_notes');
      notes.focus();
      return {ok, label, focused: document.activeElement === notes};
    }, DEST);
    check('CDS-STALE-SETTLE-ARRIVES', [stale.ok, stale.label], [true, DEST]);
    check('CDS-STALE-SETTLE-FOCUS', stale.focused);
    await context.close();

    // A resize mid-glide (rotation, browser toolbars, a closing keyboard): the move still ends on the destination.
    for (const [id, ms] of [['CDS-RESIZE-150MS', 150], ['CDS-RESIZE-400MS', 400]]) {
      ({context, page} = await freshPage(browser));
      await page.locator('#carTabbarInner [role="tab"]').nth(dest).click();
      await page.waitForTimeout(ms);
      await page.setViewportSize({width: 430, height: 844});
      check(id, await restingPlace(page), {label: DEST, atIndex: true});
      await context.close();
    }

    // Guards: behaviour the fix must not change.
    ({context, page} = await freshPage(browser));
    check('CDS-ALREADY-THERE-SETTLES', await page.evaluate(async () => {
      const C = window.__L5R_CAROUSEL__, here = C.getActiveTab().label;
      const settled = C.whenSettled(1500);
      C.goToTab(here);
      return [await settled, C.getActiveTab().label === here];
    }), [true, true]);
    await context.close();

    // A later arrow-button step overrides a tab tap still in flight, as before.
    ({context, page} = await freshPage(browser));
    await page.evaluate((DEST) => {
      window.__L5R_CAROUSEL__.goToTab(DEST);
      document.getElementById('carNext').click();
    }, DEST);
    check('CDS-LATER-STEP-WINS', await restingPlace(page), {label: tabs[1], atIndex: true});
    await context.close();

    // A finger on the track takes over: the next settle is accepted where the track rests, as before.
    ({context, page} = await freshPage(browser, {hasTouch: true}));
    check('CDS-FINGER-TAKES-OVER', await page.evaluate(async (DEST) => {
      const C = window.__L5R_CAROUSEL__, track = document.getElementById('carTrack');
      const settled = C.whenSettled(4000);
      C.goToTab(DEST);
      const t = new Touch({identifier: 1, target: track, clientX: 200, clientY: 400});
      track.dispatchEvent(new TouchEvent('touchstart', {touches: [t], changedTouches: [t], bubbles: true}));
      track.dispatchEvent(new Event('scrollend'));
      return [await settled, C.getActiveTab().index];
    }, DEST), [true, 0]);
    await context.close();

    check('CDS-NO-PAGE-ERRORS', errors, []);
  } catch (e) {
    for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached: ' + String(e.message || e).split('\n')[0], 'completed');
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + IDS.length + ' checks passed');
  process.exitCode = pass === IDS.length && results.length === IDS.length ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
