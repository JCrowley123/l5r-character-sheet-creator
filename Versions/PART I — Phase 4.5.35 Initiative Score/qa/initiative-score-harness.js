/* Real-browser acceptance tests for Phase 4.5.35 Initiative Score (Part I).
 * Oracles: the total the roll window itself shows (#rollTotalDisplay), the trunk's round ledger, and the Core Rulebook:
 * Void's +10 for the skirmish, Quick's +Reflexes each Round not acting first (p.152), Center's +10 in the Round after
 * Center. Never IS4535's own arithmetic.
 * node initiative-score-harness.js <sheet.html>
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
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual).slice(0, 500)} expected=${JSON.stringify(expected).slice(0, 500)}`}`);
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id + '-EXCEPTION', String(error.stack || error).split('\n').slice(0, 3).join(' '), 'no exception'); }
}
const REFLEXES = 3;

async function setup(page, entries = []) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(({entries, REFLEXES}) => {
    document.querySelectorAll('.roll-modal-overlay, #appConfirmOverlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
    const r = document.getElementById('trait_reflexes'); r.value = REFLEXES; r.dataset.free = REFLEXES;
    document.getElementById('void_current').value = 2;
    T.setCombatActive(false); T.resetCombatRound(); T.clearVoidPending(); T.clearVoidSkirmishEffects?.();
    for (const name of entries) {
      const lib = T.ADV_LIBRARY.find(x => x.name === name);
      document.getElementById('advList').appendChild(T.makeEntry({name, cost:lib.cost, desc:lib.desc}, true));
    }
    T.recalcAll();
    T.MODES12?.set('play');
    T.setCombatActive(true);
    T.recalcAll();   // the rows' buttons follow the combat switch on the next recalc, as ticking Combat active does
  }, {entries, REFLEXES});
}
// Fixed dice: each die shows the next face in turn.
const dice = (page, faces) => page.evaluate(faces => { let i = 0; Math.random = () => (faces[i++ % faces.length] - 0.5) / 10; }, faces);
const line = page => page.evaluate(() => {
  const l = document.getElementById('is4535Line'), q = document.getElementById('is4535Qa');
  return {score:l ? l.querySelector('.is4535-score').textContent : null, detail:l ? l.querySelector('.is4535-detail').textContent : null,
    qa:q ? q.textContent : null};
});
const ledger = (page, key) => page.evaluate(key => { const L = window.__L5R_TEST__.getRoundLedger();
  return Object.keys(L).map(r => L[r][key]).filter(v => v !== undefined); }, key);
// Rolls Initiative through its own button and the preview; returns the total the window shows when it closes.
async function rollInitiative(page, {rekeep = false} = {}) {
  await page.evaluate(() => document.getElementById('btnRollInitiative').click());
  await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
  await page.locator('#rollPreviewGo').click();
  await page.waitForSelector('#rollDiceRow .roll-die');
  if (rekeep) await page.evaluate(() => { const dropped = document.querySelector('#rollDiceRow .roll-die:not(.kept)'); if (dropped) dropped.click(); });
  const total = await page.evaluate(() => +document.getElementById('rollTotalDisplay').textContent);
  await page.locator('#rollModalClose').click();
  await page.waitForTimeout(100);
  return total;
}
const quick = page => page.evaluate(() => {
  const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Quick');
  div.querySelector('.vi4533-row button').click(); });
const quickNote = page => page.evaluate(() => {
  const div = [...document.querySelectorAll('#advList .entry')].find(d => d.querySelector('.en-name').value === 'Quick');
  const n = div && div.querySelector('.is4535-quick'); return n ? n.textContent : null; });

async function main() {
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await (await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true})).newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout:60000});
    check('IS-SEAM', await page.evaluate(() => typeof window.__L5R_TEST__.IS4535), 'object');

    await section('IS-ROLL', async () => {
      await setup(page);
      check('IS-NONE-YET', await line(page), {score:'Initiative Score: not set yet', detail:'Roll Initiative, or type the total you rolled.', qa:'Score not set'});
      await dice(page, [7, 5, 3, 9, 2, 4]);
      const r = await rollInitiative(page);
      check('IS-ROLL-RECORDS', [await line(page), await ledger(page, 'Initiative'),
        await page.evaluate(() => document.getElementById('combatRoundNote').textContent.includes('Initiative ('))],
        [{score:'Initiative Score: ' + r, detail:'', qa:'Score ' + r}, [r], true]);
      await dice(page, [1, 1, 1, 9, 9, 9]);
      const kept = await rollInitiative(page, {rekeep:true});
      check('IS-REKEPT-DICE-FOLLOWED', [(await line(page)).score, await ledger(page, 'Initiative')], ['Initiative Score: ' + kept, [kept]]);
      await page.evaluate(() => document.getElementById('btnResetRounds').click());
      check('IS-RESET-CLEARS', [(await line(page)).score, await ledger(page, 'Initiative')], ['Initiative Score: not set yet', []]);
    });

    await section('IS-QUICK', async () => {
      await setup(page, ['Quick']);
      check('IS-QUICK-ROW-BEFORE', await quickNote(page), 'No Initiative Score yet (Combat card).');
      await dice(page, [6, 6, 6, 6, 6, 6]);
      const r = await rollInitiative(page);
      await quick(page);
      check('IS-QUICK-ADDS', [await line(page), await quickNote(page)],
        [{score:'Initiative Score: ' + (r + REFLEXES), detail:r + ' before bonuses, Quick +' + REFLEXES, qa:'Score ' + (r + REFLEXES)},
          'Your Initiative Score is ' + (r + REFLEXES) + '.']);
      await page.evaluate(() => document.getElementById('btnNextRound').click());
      await quick(page);
      check('IS-QUICK-ADDS-UP', (await line(page)).score, 'Initiative Score: ' + (r + 2 * REFLEXES));
      // A new roll already holds Quick's uses (4.5.33 adds them to Initiative rolls): the score is that roll's total.
      const again = await rollInitiative(page);
      check('IS-NO-DOUBLE-COUNT', [(await line(page)).score, await ledger(page, 'Initiative bonuses')],
        ['Initiative Score: ' + again, [2 * REFLEXES]]);
    });

    await section('IS-VOID-CENTER', async () => {
      await setup(page);
      await dice(page, [5, 5, 5, 5, 5, 5]);
      const r = await rollInitiative(page);
      await page.evaluate(() => document.querySelector('#voidSpendButtons [data-void="init"]').click());
      check('IS-VOID-AFTER-THE-ROLL', (await line(page)), {score:'Initiative Score: ' + (r + 10), detail:r + ' before bonuses, Void +10', qa:'Score ' + (r + 10)});
      await page.evaluate(() => document.getElementById('btnResetRounds').click());
      // Center this Round: its +10 belongs to the next Round's score only.
      const stance = name => page.evaluate(name => [...document.querySelectorAll('#stanceTiles .stance-tile-btn')]
        .find(b => b.querySelector('.stance-name').textContent === name).click(), name);
      await stance('Center');
      await page.evaluate(() => document.getElementById('btnNextRound').click());
      await dice(page, [5, 5, 5, 5, 5, 5]);
      const c = await rollInitiative(page);
      const inRound = (await line(page)).score;
      await stance('Attack');
      await page.evaluate(() => document.getElementById('btnNextRound').click());
      check('IS-CENTER-ONLY-ITS-ROUND', [inRound, (await line(page)).score], ['Initiative Score: ' + c, 'Initiative Score: ' + (c - 10)]);
    });

    await section('IS-TYPED', async () => {
      await setup(page, ['Quick']);
      await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; C?.goToTab?.('Combat');
        await Promise.race([C?.whenSettled?.(), new Promise(r => setTimeout(r, 2000))]);
        const d = document.getElementById('armorTnDetails'); if (d) d.open = true; });
      await page.fill('#is4535Input', '23');
      await page.click('#is4535Set');
      const typed = (await line(page)).score;
      await quick(page);
      check('IS-TYPED-TOTAL', [typed, (await line(page)).score, await page.inputValue('#is4535Input')],
        ['Initiative Score: 23', 'Initiative Score: ' + (23 + REFLEXES), '']);
      await page.fill('#is4535Input', '');
      await page.click('#is4535Set');
      check('IS-TYPED-EMPTY-REFUSED', (await line(page)).score, 'Initiative Score: ' + (23 + REFLEXES));
      check('IS-INPUT-16PX', await page.$eval('#is4535Input', i => getComputedStyle(i).fontSize), '16px');
      check('IS-STYLED', await page.evaluate(() => [getComputedStyle(document.getElementById('is4535Line')).display,
        getComputedStyle(document.querySelector('#is4535Line .is4535-set')).display]), ['flex', 'flex']);
      for (const w of [320, 390]) {
        await page.setViewportSize({width:w, height:800});
        check('IS-FITS-' + w, await page.evaluate(() => { const l = document.getElementById('is4535Line'), f = l.closest('.field');
          return l.getBoundingClientRect().right <= f.getBoundingClientRect().right + 1 && l.scrollWidth <= l.clientWidth + 1; }));
      }
      await page.setViewportSize({width:390, height:844});
    });

    await section('IS-SAFE', async () => {
      await setup(page);
      const before = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await dice(page, [4, 4, 4, 4, 4, 4]);
      await rollInitiative(page);
      check('IS-NOTHING-SAVED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData())) === before);
      check('IS-PLAY-VISIBLE', await page.evaluate(async () => { window.__L5R_CAROUSEL__?.goToTab?.('Combat'); await window.__L5R_CAROUSEL__?.whenSettled?.();
        document.getElementById('armorTnDetails').open = true;
        const l = document.getElementById('is4535Line'); return !!l && l.getClientRects().length > 0 && !document.getElementById('is4535Input').disabled; }));
    });

    check('IS-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
