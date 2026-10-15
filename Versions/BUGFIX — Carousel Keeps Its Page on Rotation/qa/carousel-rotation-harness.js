/* BUGFIX — Carousel Keeps Its Page on Rotation: real-browser acceptance for turning the phone from landscape to portrait.
 * On an iPhone (15 October 2026), turning back to portrait on Techniques or a later page jumped the sheet to Clan &
 * School. In landscape those pages sit further along the track than a portrait track can scroll, so the browser clamps
 * the offset onto the trailing loop copy of Clan & School, and the carousel took that clamp for a page change before its
 * 60 ms reflow. Desktop Chromium re-snaps to the page it was showing instead, so a plain resize hides the defect.
 * Each emulated turn here switches scroll snapping off on the track (a stylesheet rule, removed afterwards): Chromium
 * then keeps the offset and clamps it, which is what Safari is believed to do.
 * Order of events: Safari reports the moved offset before the reflow. Chromium usually does too, but a slow first frame
 * at the new width can let the reflow run first, and then even the unfixed carousel keeps its page. Such a turn proves
 * nothing either way, so it is retried on a fresh page (up to five tries, each one printed).
 * Geometry: iPhone SE (667 x 375 landscape, 375 x 667 portrait). Clan & School to Adv & Disadv fit inside the portrait
 * track and Techniques onward do not, the same split as the owner's report; each turn confirms its own case.
 * Oracles: the carousel's own seam (__L5R_CAROUSEL__), the tab bar sampled every frame and the track's resting place.
 * node carousel-rotation-harness.js <sheet.html>
 */
'use strict';
const path = require('path'), {pathToFileURL} = require('url'), {chromium} = require('playwright');
const IDS = ['CRT-TECHNIQUES-KEEPS-PAGE', 'CRT-EQUIPMENT-KEEPS-PAGE', 'CRT-BACKGROUND-KEEPS-PAGE', 'CRT-NO-SCROLLEND-KEEPS-PAGE',
  'CRT-SETTLE-DURING-ROTATION', 'CRT-ADV-DISADV-UNCHANGED', 'CRT-STEP-AFTER-ROTATION', 'CRT-PORTRAIT-TO-LANDSCAPE',
  'CRT-NATIVE-RESNAP', 'CRT-NO-PAGE-ERRORS'];
const LANDSCAPE = {width: 667, height: 375}, PORTRAIT = {width: 375, height: 667};
const TRIES = 5;
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(actual).slice(0, 300) + ' expected=' + JSON.stringify(expected)));
}
const errors = [];
let sheet;
async function freshPage(browser, viewport, scrollend) {
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
async function rotate(page, label, to, {emulate, settleDuring, clamped}) {
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
    // The browser's first report of an offset at the new width (a clamp lands after the resize callback, a re-snap can
    // land before it). Registered after the carousel's own listener, so this frame callback runs after the carousel's.
    // The carousel read the browser's offset before the reflow only if that report carries the offset the browser set
    // (not the reflow's) and it is still there in the carousel's frame.
    track.addEventListener('scroll', function report() {
      if (track.clientWidth === width) return;
      track.removeEventListener('scroll', report);
      s.reported = track.scrollLeft;
      requestAnimationFrame(() => { s.framed = track.scrollLeft; });
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
    const s = window.__L5R_CAROUSEL__.getState(), t = window.__crt;
    const order = t.reported === undefined ? 'no report'
      : t.after && t.reported === t.after.left && t.framed === t.reported ? 'report-first' : 'reflow-first';
    return {label: s.label, atIndex: s.slot === s.index + s.offset, seen: [...new Set(t.seen)], from: t.from, after: t.after,
      order};
  });
  if (!r.after) throw Error('premise: the track did not change width');
  if ((r.from > r.after.max) !== clamped) {
    throw Error('premise: ' + label + ' offset ' + r.from + ' against a maximum of ' + r.after.max + ' after turning');
  }
  if (emulate && clamped && r.after.left !== r.after.max) throw Error('premise: the emulated turn did not clamp the offset');
  // Only a turn that moved the offset (clamp or re-snap) has a report to race the reflow.
  const conclusive = settleDuring || r.after.left === r.from || r.order === 'report-first';
  return {conclusive, order: r.order, result: {label: r.label, atIndex: r.atIndex, seen: r.seen}};
}
// One turn on a fresh page, retried while the reflow outran the browser's report. Returns the page still open.
async function turn(browser, from, label, to, {scrollend = true, emulate = true, settleDuring = false, clamped}) {
  for (let attempt = 1; ; attempt++) {
    const {context, page} = await freshPage(browser, from, scrollend);
    const r = await rotate(page, label, to, {emulate, settleDuring, clamped});
    if (r.conclusive) return {context, page, result: r.result};
    await context.close();
    console.log('RETRY ' + label + ': the carousel did not read the browser offset before the reflow (' + r.order + '), try ' + attempt);
    if (attempt === TRIES) throw Error('premise: the reflow ran first in ' + TRIES + ' tries on ' + label);
    await new Promise(r => setTimeout(r, 1000));   // slow frames come in bursts
  }
}
const stays = label => ({label, atIndex: true, seen: [label]});
async function main() {
  sheet = pathToFileURL(path.resolve(process.argv[2])).href;
  const browser = await chromium.launch();
  try {
    let t;
    // Fix checks: a page beyond the portrait track's reach keeps its place through the turn.
    for (const [id, label] of [['CRT-TECHNIQUES-KEEPS-PAGE', 'Techniques'], ['CRT-EQUIPMENT-KEEPS-PAGE', 'Equipment'],
      ['CRT-BACKGROUND-KEEPS-PAGE', 'Background']]) {
      t = await turn(browser, LANDSCAPE, label, PORTRAIT, {clamped: true});
      if (id === IDS[0]) {
        const tabs = await t.page.evaluate(() => window.__L5R_CAROUSEL__.getTabs().map(x => x.label));
        if (tabs[0] !== 'Clan & School') throw Error('premise: expected Clan & School first, got ' + tabs.join(', '));
      }
      check(id, t.result, stays(label));
      await t.context.close();
    }
    // The same turn where the carousel settles on its scroll debounce (no scrollend).
    t = await turn(browser, LANDSCAPE, 'Techniques', PORTRAIT, {clamped: true, scrollend: false});
    check('CRT-NO-SCROLLEND-KEEPS-PAGE', t.result, stays('Techniques'));
    await t.context.close();
    // A settle signal arriving between the clamp and the reflow.
    t = await turn(browser, LANDSCAPE, 'Techniques', PORTRAIT, {clamped: true, settleDuring: true});
    check('CRT-SETTLE-DURING-ROTATION', t.result, stays('Techniques'));
    await t.context.close();

    // Guards: behaviour the fix must not change.
    // A page the portrait track can still reach was never clamped, and stays put.
    t = await turn(browser, LANDSCAPE, 'Adv & Disadv', PORTRAIT, {clamped: false});
    check('CRT-ADV-DISADV-UNCHANGED', t.result, stays('Adv & Disadv'));
    // After a turn, the arrow step pages and the tab bar follows the glide again.
    const seen = await t.page.evaluate(async () => {
      const C = window.__L5R_CAROUSEL__, labels = [], until = performance.now() + 1500;
      requestAnimationFrame(function sample() {
        labels.push(C.getActiveTab().label);
        if (performance.now() < until) requestAnimationFrame(sample);
      });
      document.getElementById('carNext').click();
      await new Promise(r => setTimeout(r, 1600));
      return [...new Set(labels)];
    });
    await still(t.page);
    check('CRT-STEP-AFTER-ROTATION', {...await resting(t.page), seen}, {label: 'Techniques', atIndex: true, seen: ['Adv & Disadv', 'Techniques']});
    await t.context.close();
    // Portrait to landscape: the offset fits the wider track, nothing is clamped.
    t = await turn(browser, PORTRAIT, 'Background', LANDSCAPE, {clamped: false});
    check('CRT-PORTRAIT-TO-LANDSCAPE', t.result, stays('Background'));
    await t.context.close();
    // Chromium's own re-snap (snapping left on), as a desktop window resize does it.
    t = await turn(browser, LANDSCAPE, 'Techniques', PORTRAIT, {clamped: true, emulate: false});
    check('CRT-NATIVE-RESNAP', t.result, stays('Techniques'));
    await t.context.close();

    check('CRT-NO-PAGE-ERRORS', errors, []);
  } catch (e) {
    for (const id of IDS) if (!results.some(r => r.id === id)) check(id, 'not reached: ' + String(e.message || e).split('\n')[0], 'completed');
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  console.log(pass + '/' + IDS.length + ' checks passed');
  process.exitCode = pass === IDS.length && results.length === IDS.length ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
