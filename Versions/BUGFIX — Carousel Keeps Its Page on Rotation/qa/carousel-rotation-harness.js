/* BUGFIX — Carousel Keeps Its Page on Rotation: real-browser acceptance for turning the phone from landscape to portrait.
 * On an iPhone (15 October 2026), turning back to portrait on Techniques or a later page jumped the sheet to Clan &
 * School. In landscape those pages sit further along the track than a portrait track can scroll, so the browser clamps
 * the offset onto the trailing loop copy of Clan & School, and the carousel took that clamp for a page change before its
 * 60 ms reflow. Desktop Chromium re-snaps to the page it was showing instead, so a plain resize hides the defect.
 * Each emulated turn here switches scroll snapping off on the track (a stylesheet rule, removed afterwards): Chromium
 * then keeps the offset and clamps it, which is what Safari is believed to do.
 * Geometry: iPhone SE (667 x 375 landscape, 375 x 667 portrait). Clan & School to Adv & Disadv fit inside the portrait
 * track and Techniques onward do not, the same split as the owner's report; each check confirms its own case.
 * Oracles: the carousel's own seam (__L5R_CAROUSEL__), the tab bar sampled every frame and the track's resting place.
 * node carousel-rotation-harness.js <sheet.html>
 */
'use strict';
const path = require('path'), {pathToFileURL} = require('url'), {chromium} = require('playwright');
const IDS = ['CRT-TECHNIQUES-KEEPS-PAGE', 'CRT-EQUIPMENT-KEEPS-PAGE', 'CRT-BACKGROUND-KEEPS-PAGE', 'CRT-NO-SCROLLEND-KEEPS-PAGE',
  'CRT-SETTLE-DURING-ROTATION', 'CRT-ADV-DISADV-UNCHANGED', 'CRT-STEP-AFTER-ROTATION', 'CRT-PORTRAIT-TO-LANDSCAPE',
  'CRT-NATIVE-RESNAP', 'CRT-NO-PAGE-ERRORS'];
const LANDSCAPE = {width: 667, height: 375}, PORTRAIT = {width: 375, height: 667};
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 300) + ' expected=' + JSON.stringify(expected)));
}
const errors = [];
let sheet;
async function freshPage(browser, viewport, scrollend = true) {
  const context = await browser.newContext({viewport});
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  // A browser without scrollend: the carousel falls back to its 130 ms scroll debounce.
  if (!scrollend) await page.addInitScript(() => { delete Window.prototype.onscrollend; delete window.onscrollend; });
  await page.goto(sheet);
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready &&
    window.__L5R_CAROUSEL__ && window.__L5R_CAROUSEL__.isReady(), null, {timeout: 60000});
  await page.waitForTimeout(600);   // let start-up moves finish
  if (await page.evaluate(() => 'onscrollend' in window) !== scrollend) throw Error('premise: could not set scrollend support');
  return {context, page};
}
// Wait until the track has stopped moving.
const still = page => page.evaluate(async () => {
  const track = document.getElementById('carTrack');
  let last = -1, quiet = 0;
  for (let t = 0; t < 60 && quiet < 4; t++) {
    await new Promise(r => setTimeout(r, 80));
    quiet = track.scrollLeft === last ? quiet + 1 : 0; last = track.scrollLeft;
  }
});
const resting = page => page.evaluate(() => {
  const s = window.__L5R_CAROUSEL__.getState();
  return {label: s.label, atIndex: s.slot === s.index + s.offset};
});
// Open `label`, turn the viewport to `to`, and report where the carousel rests and every page the tab bar showed.
async function rotate(page, label, to, {emulate = true, settleDuring = false, clamped}) {
  await page.evaluate(async label => {
    const C = window.__L5R_CAROUSEL__, i = C.getTabs().findIndex(t => t.label === label);
    if (i < 0) throw Error('premise: no ' + label + ' tab');
    C.goToTab(i);
    await C.whenSettled(3000);
  }, label);
  await still(page);
  if ((await resting(page)).label !== label) throw Error('premise: did not reach ' + label + ' before turning');
  await page.evaluate(({emulate, settleDuring}) => {
    const C = window.__L5R_CAROUSEL__, track = document.getElementById('carTrack');
    if (emulate) {
      const rule = document.createElement('style');
      rule.id = 'crt-no-resnap';
      rule.textContent = '#carTrack { scroll-snap-type: none !important; }';
      document.head.appendChild(rule);
    }
    const width = track.clientWidth, s = window.__crt = {seen: [], from: track.scrollLeft, after: null};
    const until = performance.now() + 2000;
    requestAnimationFrame(function sample() {
      s.seen.push(C.getActiveTab().label);
      if (performance.now() < until) requestAnimationFrame(sample);
    });
    const ro = new ResizeObserver(() => {
      if (track.clientWidth === width) return;
      ro.disconnect();
      s.after = {left: track.scrollLeft, max: track.scrollWidth - track.clientWidth};
      // A settle signal before the carousel's 60 ms reflow: a scrollend for the clamp, or the 130 ms debounce
      // outrunning a reflow that later resizes keep pushing back.
      if (settleDuring) track.dispatchEvent(new Event('scrollend'));
    });
    ro.observe(track);
  }, {emulate, settleDuring});
  await page.setViewportSize(to);
  await page.waitForTimeout(2100);   // the tab-bar sampler runs for 2 s
  await still(page);
  const r = await page.evaluate(() => {
    const rule = document.getElementById('crt-no-resnap');
    if (rule) rule.remove();
    const s = window.__L5R_CAROUSEL__.getState();
    return {label: s.label, atIndex: s.slot === s.index + s.offset, seen: [...new Set(window.__crt.seen)],
      from: window.__crt.from, after: window.__crt.after};
  });
  if (!r.after) throw Error('premise: the track did not change width');
  if ((r.from > r.after.max) !== clamped) {
    throw Error('premise: ' + label + ' offset ' + r.from + ' against a maximum of ' + r.after.max + ' after turning');
  }
  if (emulate && clamped && r.after.left !== r.after.max) throw Error('premise: the emulated turn did not clamp the offset');
  return {label: r.label, atIndex: r.atIndex, seen: r.seen};
}
const stays = label => ({label, atIndex: true, seen: [label]});
async function main() {
  sheet = pathToFileURL(path.resolve(process.argv[2])).href;
  const browser = await chromium.launch();
  try {
    let context, page;
    // Fix checks: a page beyond the portrait track's reach keeps its place through the turn.
    for (const [id, label] of [['CRT-TECHNIQUES-KEEPS-PAGE', 'Techniques'], ['CRT-EQUIPMENT-KEEPS-PAGE', 'Equipment'],
      ['CRT-BACKGROUND-KEEPS-PAGE', 'Background']]) {
      ({context, page} = await freshPage(browser, LANDSCAPE));
      if (id === IDS[0]) {
        const tabs = await page.evaluate(() => window.__L5R_CAROUSEL__.getTabs().map(t => t.label));
        if (tabs[0] !== 'Clan & School') throw Error('premise: expected Clan & School first, got ' + tabs.join(', '));
      }
      check(id, await rotate(page, label, PORTRAIT, {clamped: true}), stays(label));
      await context.close();
    }
    // The same turn where the carousel settles on its scroll debounce (no scrollend).
    ({context, page} = await freshPage(browser, LANDSCAPE, false));
    check('CRT-NO-SCROLLEND-KEEPS-PAGE', await rotate(page, 'Techniques', PORTRAIT, {clamped: true}), stays('Techniques'));
    await context.close();
    // A settle signal arriving between the clamp and the reflow.
    ({context, page} = await freshPage(browser, LANDSCAPE));
    check('CRT-SETTLE-DURING-ROTATION', await rotate(page, 'Techniques', PORTRAIT, {clamped: true, settleDuring: true}),
      stays('Techniques'));
    await context.close();

    // Guards: behaviour the fix must not change.
    // A page the portrait track can still reach was never clamped, and stays put.
    ({context, page} = await freshPage(browser, LANDSCAPE));
    check('CRT-ADV-DISADV-UNCHANGED', await rotate(page, 'Adv & Disadv', PORTRAIT, {clamped: false}), stays('Adv & Disadv'));
    // After a turn, the arrow step pages and the tab bar follows the glide again.
    const seen = await page.evaluate(async () => {
      const C = window.__L5R_CAROUSEL__, labels = [], until = performance.now() + 1500;
      requestAnimationFrame(function sample() {
        labels.push(C.getActiveTab().label);
        if (performance.now() < until) requestAnimationFrame(sample);
      });
      document.getElementById('carNext').click();
      await new Promise(r => setTimeout(r, 1600));
      return [...new Set(labels)];
    });
    await still(page);
    check('CRT-STEP-AFTER-ROTATION', {...await resting(page), seen}, {label: 'Techniques', atIndex: true, seen: ['Adv & Disadv', 'Techniques']});
    await context.close();
    // Portrait to landscape: the offset fits the wider track, nothing is clamped.
    ({context, page} = await freshPage(browser, PORTRAIT));
    check('CRT-PORTRAIT-TO-LANDSCAPE', await rotate(page, 'Background', LANDSCAPE, {clamped: false}), stays('Background'));
    await context.close();
    // Chromium's own re-snap (snapping left on), as a desktop window resize does it.
    ({context, page} = await freshPage(browser, LANDSCAPE));
    check('CRT-NATIVE-RESNAP', await rotate(page, 'Techniques', PORTRAIT, {clamped: true, emulate: false}), stays('Techniques'));
    await context.close();

    check('CRT-NO-PAGE-ERRORS', errors, []);
  } catch (e) {
    for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached: ' + String(e.message || e).split('\n')[0], 'completed');
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + IDS.length + ' checks passed');
  process.exitCode = pass === IDS.length && results.length === IDS.length ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
