/* Real-browser acceptance tests for BUGFIX — Spell Slots Tab on Safari.
 * The iPhone reported (24 September 2026, iOS 18.7 Safari): Shugenja applied, #spellSlotsSection
 * inline display "", computed display "none", Spell Slots page hidden, refreshVisibility() false.
 * Safari reports display:none for everything inside a hidden page; Chromium does not. So the
 * "emulated" runs add ONE test-only rule that makes Chromium report the same thing while the page is
 * hidden: `.car-page[hidden] #spellSlotsSection { display:none }`. With it the unfixed build
 * reproduces the iPhone failure. The "plain" runs check that ordinary Chromium is unchanged.
 * Oracle for "is a Shugenja": the sheet's own characterCasterLock(), never the carousel.
 * node safari-tab-harness.js <sheet.html>
 */
'use strict';
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const results = [];
function check(id, actual, expected = true) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);
}
const EMULATE = '.car-page[hidden] #spellSlotsSection{display:none !important}';

async function open(browser, emulate) {
  const page = await browser.newPage({viewport:{width:390, height:844}});
  page.setDefaultTimeout(6000);
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  if (emulate) await page.addInitScript(css => document.addEventListener('DOMContentLoaded', () => {
    const s = document.createElement('style'); s.id = 'webkitEmulation'; s.textContent = css; document.head.appendChild(s);
  }), EMULATE);
  await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => !!window.__L5R_TEST__ && !!window.__L5R_CAROUSEL__);
  await page.waitForTimeout(300);
  return {page, errors};
}
const confirmAll = async page => { for (let i = 0; i < 3; i++) { await page.waitForTimeout(150); await page.evaluate(() => {
  const o = document.getElementById('appConfirmOverlay'); if (o && o.style.display === 'flex') document.getElementById('appConfirmOk').click(); }); } };
async function applySchool(page, clan, school) {
  await page.selectOption('#cfs_clan', clan); await page.waitForTimeout(80);
  const v = await page.evaluate(s => [...document.getElementById('cfs_school').options].map(o => o.value).find(v => v.includes(s)), school);
  await page.selectOption('#cfs_school', v); await page.click('#cfs_applySchool'); await page.waitForTimeout(150);
  await page.evaluate(() => { const b = document.getElementById('affinityPick_Void'); if (b && b.offsetParent !== null) { b.click(); document.getElementById('affinityPickConfirm').click(); } });
  await confirmAll(page);
  await page.waitForTimeout(100);   // let the observer's microtask land too
}
const state = page => page.evaluate(() => {
  const p = document.querySelector('.car-page[data-tab-label="Spell Slots"]');
  return {lock:window.__L5R_TEST__.characterCasterLock(), pageHidden:p.hasAttribute('hidden'),
    tab:[...document.querySelectorAll('#carTabbarInner [role=tab]')].some(t => t.textContent.trim() === 'Spell Slots'),
    hiddenPages:window.__L5R_CAROUSEL__.getState().hiddenPages};
});

async function suite(browser, mode) {
  const emulate = mode === 'EMU';
  const {page, errors} = await open(browser, emulate);
  const P = 'SST-' + mode + '-';
  if (emulate) check(P + 'EMULATION-ACTIVE', await page.evaluate(() => !!document.getElementById('webkitEmulation')));
  check(P + 'START-HIDDEN', await state(page), {lock:null, pageHidden:true, tab:false, hiddenPages:1});
  await applySchool(page, 'Phoenix', 'Isawa Shugenja');
  check(P + 'SHUGENJA-SHOWS-TAB', await state(page), {lock:'shugenja', pageHidden:false, tab:true, hiddenPages:0});
  check(P + 'SECTION-READS-SHOWN', await page.evaluate(() => getComputedStyle(document.getElementById('spellSlotsSection')).display !== 'none'));
  // The page is really reachable, not only listed: go to it through the carousel.
  check(P + 'PAGE-REACHABLE', await page.evaluate(async () => {
    const C = window.__L5R_CAROUSEL__; const went = C.goToTab('Spell Slots');
    if (!went) return 'not a tab';
    if (typeof C.whenSettled === 'function') await C.whenSettled();
    return C.getActiveTab().label;
  }), 'Spell Slots');
  await applySchool(page, 'Crab', 'Hida Bushi');
  check(P + 'BUSHI-HIDES-TAB', await state(page), {lock:'bushi', pageHidden:true, tab:false, hiddenPages:1});
  // Refreshing while hidden must leave the page hidden, with nothing flipped on the way.
  check(P + 'REFRESH-KEEPS-HIDDEN', [await page.evaluate(() => window.__L5R_CAROUSEL__.refreshVisibility()), (await state(page)).pageHidden], [false, true]);
  await applySchool(page, 'Phoenix', 'Isawa Shugenja');
  check(P + 'SHUGENJA-AGAIN', (await state(page)).tab, true);
  // Loading a saved Shugenja into a fresh page (the other way a character arrives).
  const saved = await page.evaluate(() => window.__L5R_TEST__.collectData());
  await page.close();
  const second = await open(browser, emulate);
  await second.page.evaluate(d => { const T = window.__L5R_TEST__; T.applyData(d); T.recalcAll(); }, saved);
  await second.page.waitForTimeout(150);
  check(P + 'LOADED-SHUGENJA-SHOWS-TAB', (await state(second.page)).tab, true);
  check(P + 'NO-PAGE-ERRORS', errors.concat(second.errors), []);
  await second.page.close();
}

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    for (const mode of ['EMU', 'PLAIN']) {
      try { await suite(browser, mode); } catch (error) { check('SST-' + mode, String(error.stack || error), 'no exception'); }
    }
  } finally { await browser.close(); }
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
