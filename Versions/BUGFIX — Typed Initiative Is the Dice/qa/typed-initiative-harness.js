'use strict';
// BUGFIX — Typed Initiative Is the Dice (FT-23, the owner's check I5). A total typed in Feature 4.5.35's box is the
// dice alone: Center, Void and Quick go on top whether they came before or after it (23 typed after a Void +10 is 33).
// A rolled total is unchanged. The box reads "Your dice total". Setup and helpers follow Feature 4.5.35's harness.
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
const TOTAL = 11;
const REFLEXES = 3;

async function setup(page, entries = []) {
  await page.evaluate(({entries, REFLEXES}) => {
    document.querySelectorAll('.roll-modal-overlay, #appConfirmOverlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
    const r = document.getElementById('trait_reflexes'); r.value = REFLEXES; r.dataset.free = REFLEXES;
    document.getElementById('void_current').value = 2;
    T.setCombatActive(false); T.resetCombatRound(); T.clearVoidPending(); T.clearVoidSkirmishEffects?.();
    for (const name of entries) {
      const lib = T.ADV_LIBRARY.find(x => x.name === name);
      document.getElementById('advList').appendChild(T.makeEntry({name, cost: lib.cost, desc: lib.desc}, true));
    }
    T.recalcAll();
    T.MODES12?.set('play');
    T.setCombatActive(true);
    T.recalcAll();
  }, {entries, REFLEXES});
  await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C?.goToTab?.('Combat');
    await Promise.race([C?.whenSettled?.(), new Promise(r => setTimeout(r, 2000))]);
    const d = document.getElementById('armorTnDetails'); if (d) d.open = true; });
}
const line = page => page.evaluate(() => {
  const l = document.getElementById('is4535Line'), q = document.getElementById('is4535Qa');
  return {score: l ? l.querySelector('.is4535-score').textContent : null, detail: l ? l.querySelector('.is4535-detail').textContent : null,
    qa: q ? q.textContent : null};
});
const ledger = (page, key) => page.evaluate(key => { const L = window.__L5R_TEST__.getRoundLedger();
  return Object.keys(L).map(r => L[r][key]).filter(v => v !== undefined); }, key);
const voidInit = page => page.evaluate(() => document.querySelector('#voidSpendButtons [data-void="init"]').click());
const quick = page => page.evaluate(() => {
  const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Quick');
  div.querySelector('.vi4533-row button').click(); });
const type = async (page, value) => { await page.fill('#is4535Input', value); await page.click('#is4535Set'); await page.waitForTimeout(100); };

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

    await section('IDT', async () => {
      check('IDT-SWITCH', await page.evaluate(() => window.__L5R_TEST__.TYPED_INITIATIVE_DICE_ENABLED), true);
      await setup(page);
      check('IDT-LABEL', await page.$eval('#is4535Input', i => [i.placeholder, i.getAttribute('aria-label')]),
        ['Your dice total', 'Your Initiative dice total, before bonuses']);
      // The owner's case: Void +10 first, then 23 typed.
      await voidInit(page);
      await type(page, '23');
      check('IDT-TYPED-AFTER-VOID', await line(page),
        {score: 'Initiative Score: 33', detail: '23 before bonuses, Void +10', qa: 'Score 33'});
      check('IDT-TYPED-HOLDS-NO-BONUS', [await ledger(page, 'Initiative'), await ledger(page, 'Initiative bonuses')], [[23], []]);
      // Typed first, Void after: as before.
      await setup(page);
      await type(page, '23');
      await voidInit(page);
      check('IDT-TYPED-BEFORE-VOID', (await line(page)).score, 'Initiative Score: 33');
      // Quick used before the typed total goes on top too.
      await setup(page, ['Quick']);
      await quick(page);
      await type(page, '20');
      check('IDT-TYPED-AFTER-QUICK', (await line(page)).score, 'Initiative Score: ' + (20 + REFLEXES));
      // Typed again replaces the dice; the bonuses stay on top.
      await type(page, '25');
      check('IDT-TYPED-AGAIN', (await line(page)).score, 'Initiative Score: ' + (25 + REFLEXES));
      await type(page, '');
      check('IDT-EMPTY-REFUSED', (await line(page)).score, 'Initiative Score: ' + (25 + REFLEXES));
      // A rolled total still holds the bonuses it was rolled with: no double count.
      await setup(page);
      await voidInit(page);
      await page.evaluate(() => { let i = 0; Math.random = () => ([5, 5, 5, 5, 5, 5][i++ % 6] - 0.5) / 10; });
      await page.evaluate(() => document.getElementById('btnRollInitiative').click());
      await page.waitForSelector('#rollPreviewGo', {state: 'visible', timeout: 6000});
      await page.locator('#rollPreviewGo').click();
      await page.waitForSelector('#rollDiceRow .roll-die');
      const rolled = await page.evaluate(() => +document.getElementById('rollTotalDisplay').textContent);
      await page.locator('#rollModalClose').click();
      await page.waitForTimeout(150);
      check('IDT-ROLLED-UNCHANGED', (await line(page)).score, 'Initiative Score: ' + rolled);
      check('IDT-LOGIC-SET', await page.evaluate(() => {
        const D = window.__L5R_TEST__.INITDICE;
        return D ? [D.set('abc'), D.set(' '), D.set('17')] : null;
      }), [false, false, true]);
    });
    check('IDT-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL IDT-CHECK-COUNT ran=' + results.length + ' want=' + TOTAL);
  console.log(passed + '/' + TOTAL + ' checks passed');
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
