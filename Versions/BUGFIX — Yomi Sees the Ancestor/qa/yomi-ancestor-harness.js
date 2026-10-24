'use strict';
// BUGFIX — Yomi Sees the Ancestor (FT-45, 22 October 2026). Cursed by the Realm (Yomi) flags the Ancestor chosen on
// Phase 4.8's card, as it flags the ancestral Advantages and Disadvantages (Core p.158); nothing is removed.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 500)
    + ' want=' + String(JSON.stringify(want)).slice(0, 300)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const TOTAL = 12;
const TAIL = ' — resolve with your GM';

// A sheet with Cursed by the Realm on the given realm, and the named Advantages.
const sheet = (page, realm, advantages) => page.evaluate(([realm, advantages]) => {
  const T = window.__L5R_TEST__;
  T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
  advantages.forEach(name => {
    const lib = T.ADV_LIBRARY.find(x => x.name === name);
    document.getElementById('advList').appendChild(T.makeEntry({name, cost: lib ? lib.cost : 0, desc: lib ? lib.desc : ''}, true));
  });
  const div = T.makeEntry({name: 'Cursed by the Realm', cost: 4, desc: ''}, true);
  div.id = 'yanCursed';
  document.getElementById('disadvList').appendChild(div);
  div.querySelector('.en-name').dispatchEvent(new Event('change', {bubbles: true}));
  const cfg = {type: 'realmPick', realm};
  if (T.D45?.schema('Cursed by the Realm')?.finalize) T.D45.schema('Cursed by the Realm').finalize(cfg);
  div.dataset.advConfig = JSON.stringify(cfg);
  T.recalcAll();
}, [realm, advantages]);
const ancestor = (page, name, lost) => page.evaluate(([name, lost]) => {
  const f = document.getElementById('f_ancestor');
  if (!name) f.value = '';
  else {
    const a = window.__L5R_TEST__.ANC48.byName(name);
    f.value = JSON.stringify({v: 1, name, lost: !!lost, regained: false, final: !!lost && !!a.noReturn, gm: false});
  }
  window.__L5R_TEST__.recalcAll();
}, [name, lost]);
const flag = page => page.evaluate(() => {
  const el = document.querySelector('#yanCursed .realm4510-flag');
  return el ? el.textContent : null;
});

async function main() {
  const browser = await chromium.launch(), errors = [];
  try {
    const url = pathToFileURL(path.resolve(process.argv[2])).href;
    const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
    await page.evaluate(() => { if (window.__L5R_TEST__.CL11.isOpen()) window.__L5R_TEST__.CL11.close(); });

    await section('YAN', async () => {
      check('YAN-SWITCH', await page.evaluate(() => window.__L5R_TEST__.YOMI_ANCESTOR_ENABLED), true);
      await sheet(page, 'Yomi', []);
      await ancestor(page, '');
      check('YAN-NO-ANCESTOR-CLEAR', await flag(page), 'No ancestral entries on this sheet');
      await ancestor(page, 'Hida');
      check('YAN-ANCESTOR-FLAGGED', await flag(page), 'Ancestral: Ancestor: Hida' + TAIL);
      check('YAN-LOGIC-LABEL', await page.evaluate(() => window.__L5R_TEST__.YOMIANC ? window.__L5R_TEST__.YOMIANC.label() : null), 'Ancestor: Hida');
      check('YAN-ANCESTOR-KEPT', await page.evaluate(() => JSON.parse(document.getElementById('f_ancestor').value).name), 'Hida');
      await ancestor(page, 'Hida', true);
      check('YAN-LOST-FAVOUR-STILL-FLAGGED', await flag(page), 'Ancestral: Ancestor: Hida' + TAIL);
      await sheet(page, 'Yomi', ['Inheritance']);
      await ancestor(page, 'Kakita');
      check('YAN-WITH-INHERITANCE', await flag(page), 'Ancestral: Inheritance, Ancestor: Kakita' + TAIL);
      await ancestor(page, '');
      check('YAN-REMOVED-ANCESTOR-CLEARS', await flag(page), 'Ancestral: Inheritance' + TAIL);
      await page.evaluate(() => { document.getElementById('f_ancestor').value = '{"v":9,"name":"Kakita"}'; window.__L5R_TEST__.recalcAll(); });
      check('YAN-INVALID-NOT-FLAGGED', await flag(page), 'Ancestral: Inheritance' + TAIL);
      // A load (Import, Load, the Characters list) brings the Ancestor and the flag with it.
      await sheet(page, 'Yomi', []);
      await ancestor(page, 'Hida');
      await page.evaluate(() => { const T = window.__L5R_TEST__, d = T.collectData(); T.resetToBaseline(); T.applyData(d); });
      await page.waitForTimeout(200);
      const loaded = await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('#disadvList .realm4510-flag'));
        return el.map(x => x.textContent);
      });
      check('YAN-AFTER-LOAD', loaded, ['Ancestral: Ancestor: Hida' + TAIL]);
      await sheet(page, 'Meido', []);
      await ancestor(page, 'Hida');
      check('YAN-OTHER-REALM-NO-FLAG', await flag(page), null);
    });
    check('YAN-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL YAN-CHECK-COUNT ran=' + results.length + ' want=' + TOTAL);
  console.log(passed + '/' + TOTAL + ' checks passed');
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
