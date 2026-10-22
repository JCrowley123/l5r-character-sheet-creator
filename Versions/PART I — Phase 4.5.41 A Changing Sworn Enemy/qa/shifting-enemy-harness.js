'use strict';
// Phase 4.5.41 A Changing Sworn Enemy (Cycle 5 Release 5c). node shifting-enemy-harness.js <sheet.html>
// Strongholds of the Empire p.134, written out here: as Sworn Enemy (3, +1 per Insight Rank the enemy is above you),
// 1 point more, the GM changing the enemy every month to year. Owner's ruling 4: value set when bought; no Kharmic Nemesis.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const TOTAL = 10;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 400) +
    ' want=' + String(JSON.stringify(want)).slice(0, 200)));
}

function installHelpers() {
  const T = window.__L5R_TEST__;
  const H = window.H441 = {};
  H.safe = f => { try { return f(); } catch (e) { return 'error: ' + String(e.message || e).slice(0, 120); } };
  H.open = () => getComputedStyle(document.getElementById('advConfigModalOverlay')).display !== 'none';
  H.sub = () => document.getElementById('advConfigSubtitle').textContent;
  H.add = (name) => { const s = document.getElementById('disadvQuickAdd'); s.value = name; s.dispatchEvent(new Event('change')); return [H.open(), H.sub()]; };
  H.step = (value) => { const i = document.querySelector('#advConfigGrid input'); if (i) i.value = String(value); T.confirmAdvConfigModal(); };
  H.entry = (name) => Array.from(document.querySelectorAll('#disadvList .entry')).find(d => d.querySelector('.en-name').value === name) || null;
  H.row = (d) => d ? [Number(d.querySelector('.en-cost').value), (d.querySelector('.d45-summary') || {textContent: null}).textContent] : null;
}

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    page.setDefaultTimeout(8000);
    page.on('pageerror', e => errors.push(String(e)));
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() &&
      (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout: 60000});
    await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
    await page.evaluate(installHelpers);
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); });
    const ev = (f, arg) => page.evaluate(([f, arg]) => window.H441.safe(() => (0, eval)('(' + f + ')')(window.H441, window.__L5R_TEST__, arg)), [String(f), arg]);

    check('S441-SWITCH', await ev((H, T) => T.SUPPLEMENT_SHIFTING_ENEMY_ENABLED === true && !!T.SUPP4541));
    check('S441-STIGMA-ASKS', await ev(H => H.add('Imperial City Stigma')),
      [true, 'Name your current enemy (the GM changes them every month to a year) — step 1 of 2']);
    check('S441-STIGMA-VALUE', await ev(H => { H.step('Bayushi Kachiko'); const second = H.sub(); H.step(2); return [second, H.row(H.entry('Imperial City Stigma'))]; }),
      ['Their Insight Rank above yours (0 or more) — step 2 of 2',
        [6, 'Current enemy: Bayushi Kachiko, changed by the GM every month to a year. Value set when bought (Insight difference 2). Value: 6 XP.']]);
    check('S441-NO-KHARMIC-NEMESIS', await ev((H, T) => { const d = H.entry('Imperial City Stigma'), c = T.readAdvConfig(d);
      return [!!d.querySelector('.d45-toggle'), c ? c.nemesis : null]; }), [false, false]);
    check('S441-CHANGE-RENAMES-ONLY', await ev((H, T) => {
      T.openAdvConfigModal(H.entry('Imperial City Stigma'));
      const sub = H.sub();
      H.step('Shosuro Jimen');
      return [sub, H.open(), H.row(H.entry('Imperial City Stigma'))];
    }), ['Name your current enemy (the GM changes them every month to a year) — step 1 of 1', false,
      [6, 'Current enemy: Shosuro Jimen, changed by the GM every month to a year. Value set when bought (Insight difference 2). Value: 6 XP.']]);
    check('S441-TRIALS-VALUE', await ev(H => { H.add('Trials of the Imperial City'); H.step('Ikoma Ujiaki'); H.step(0);
      return H.row(H.entry('Trials of the Imperial City')); }),
      [4, 'Current enemy: Ikoma Ujiaki, changed by the GM every month to a year. Value set when bought (Insight difference 0). Value: 4 XP.']);
    check('S441-NEEDS-A-CHOICE', await ev((H, T) => {
      H.add('Imperial City Stigma'); T.closeAdvConfigModal(); T.recalcAll();
      const d = document.querySelector('#disadvList .entry:last-child');
      return [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value), /Needs a choice/.test(d.textContent)];
    }), ['Imperial City Stigma', 0, true]);
    check('S441-SAVED-AND-OPENED', await ev((H, T) => {
      const data = JSON.parse(JSON.stringify(T.collectData()));
      T.resetToBaseline(); T.clearAllRows?.(); T.applyData(data); T.recalcAll();
      return Array.from(document.querySelectorAll('#disadvList .entry')).map(d => {
        const c = T.readAdvConfig(d); return [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value), c ? c.value : null]; });
    }), [['Imperial City Stigma', 6, 'Shosuro Jimen'], ['Trials of the Imperial City', 4, 'Ikoma Ujiaki'], ['Imperial City Stigma', 0, null]]);
    check('S441-SWORN-ENEMY-UNCHANGED', await ev((H, T) => T.D45.steps(T.D45.schema('Sworn Enemy'), {}).map(s => s.field)), ['target', 'difference', 'nemesis']);
    check('S441-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL check count ' + results.length + ' expected ' + TOTAL);
  console.log(`\n${passed}/${TOTAL} checks passed`);
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
