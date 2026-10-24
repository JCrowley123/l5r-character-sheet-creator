'use strict';
// BUGFIX — Void Card Reasons on a Phone (FT-38, the owner's check H4). A greyed-out Void card button's reason is
// written under the buttons, readable without hovering: one line per reason, with the buttons it covers, or the reason
// alone when it covers every button. Reasons the card's blanket line already gives are not repeated, and the lines
// follow a tap on a Void pip as Hotei's button does (the code review, 24 October 2026). Setup follows
// Feature 4.5.36's harness (Hotei's Curse through Seven Fortunes' Curse).
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
const TOTAL = 14;
const HOTEI_REASON = 'Hotei’s Curse: this needs 2 Void Points; you have 1.';
const KIHO_REASON = 'Only a Monk or Shugenja character can activate Kiho.';

const setup = (page, {hotei = false, combat = false, voidNow = 3, momoku = false}) => page.evaluate(({hotei, combat, voidNow, momoku}) => {
  document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
  const T = window.__L5R_TEST__;
  T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); T.saveSchoolsList?.([]);
  document.getElementById('ring_void').value = 3;
  if (hotei) {
    const lib = T.DISADV_LIBRARY.find(x => x.name === 'Seven Fortunes’ Curse');
    const div = T.makeEntry({name: lib.name, cost: lib.cost, desc: lib.desc}, true);
    document.getElementById('disadvList').appendChild(div);
    T.writeAdvConfig(div, 'fortunePick', {type: 'fortunePick', fortune: 'Hotei', value: 'Hotei'});
  }
  if (momoku) {
    const lib = T.DISADV_LIBRARY.find(x => x.name === 'Momoku');
    document.getElementById('disadvList').appendChild(T.makeEntry({name: lib.name, cost: lib.cost, desc: lib.desc}, true));
  }
  T.setCombatActive(false); T.resetCombatRound(); T.clearVoidPending();
  T.recalcAll();
  document.getElementById('void_current').value = voidNow;
  if (combat) T.setCombatActive(true);
  T.recalcAll();
  T.renderVoidPanel();
}, {hotei, combat, voidNow, momoku});
const reasons = page => page.evaluate(() => {
  const box = document.getElementById('voidWhyReasons');
  return box && !box.hidden ? Array.from(box.children).map(x => x.textContent) : [];
});
// Each disabled button's name on the card (without "Spend Void: ") and title.
const disabled = page => page.evaluate(() => Array.from(document.querySelectorAll('#voidSpendButtons button.void-spend-btn'))
  .filter(b => b.disabled).map(b => [b.textContent.replace(/^Spend Void:\s*/, ''), b.title]));

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

    await section('VWY', async () => {
      check('VWY-SWITCH', await page.evaluate(() => window.__L5R_TEST__.VOID_REASONS_ENABLED), true);
      // The owner's case: Hotei's two-point button at 1 Void Point, in combat.
      await setup(page, {hotei: true, combat: true, voidNow: 1});
      const hoteiName = (await disabled(page)).find(([, t]) => t === HOTEI_REASON);
      check('VWY-HOTEI-BUTTON-DISABLED', !!hoteiName, true);
      const kihoName = (await disabled(page)).find(([, t]) => t === KIHO_REASON);
      check('VWY-HOTEI-AT-ONE-POINT', await reasons(page),
        [kihoName && kihoName[0] + ': ' + KIHO_REASON, hoteiName && hoteiName[0] + ': ' + HOTEI_REASON].filter(Boolean).sort((a, b) =>
          (a.indexOf('Kiho') >= 0 ? 0 : 1) - (b.indexOf('Kiho') >= 0 ? 0 : 1)));
      check('VWY-READABLE', await page.evaluate(() => {
        const line = document.querySelector('#voidWhyReasons .voidwhy-reason');
        if (!line) return null;
        const s = getComputedStyle(line), box = document.getElementById('voidWhyReasons');
        return [s.display !== 'none' && s.visibility === 'visible', parseFloat(s.fontSize) >= 12,
          box.previousElementSibling && box.previousElementSibling.id];
      }), [true, true, 'voidSpendButtons']);
      check('VWY-BUTTONS-KEEP-TITLES', (await disabled(page)).every(([, t]) => !!t), true);
      // No Void Points: every button shares one reason, given once.
      await setup(page, {combat: true, voidNow: 0});
      check('VWY-NO-POINTS-ONCE', await reasons(page), ['No Void Points remaining.']);
      // Out of combat: the card's own line says it; the combat-only buttons are not repeated.
      await setup(page, {combat: false, voidNow: 3});
      const blanket = await page.evaluate(() => document.getElementById('voidDisabledReason').textContent);
      const left = await reasons(page);
      check('VWY-OUT-OF-COMBAT-NOT-REPEATED', [!!blanket, left.some(l => /combat effect/.test(l))], [true, false]);
      // A Void Point spent this Round: the card's own line says it; only the Kiho reason is left.
      await setup(page, {combat: true, voidNow: 3});
      await page.evaluate(() => { window.__L5R_TEST__.spendVoid('k1'); window.__L5R_TEST__.renderVoidPanel(); });
      check('VWY-SPENT-NOT-REPEATED', (await reasons(page)).map(l => l.replace(/^.*: /, '')), [KIHO_REASON]);
      // Every button available (a monk would be needed for Kiho, so it is the one line): nothing else shown.
      await setup(page, {combat: true, voidNow: 3});
      check('VWY-ONLY-DISABLED', (await reasons(page)).map(l => l.replace(/^.*: /, '')), [KIHO_REASON]);
      // A tap on a Void pip redraws Hotei's button (not the card): the lines follow it.
      await setup(page, {hotei: true, combat: true, voidNow: 2});
      const before = (await reasons(page)).some(l => l.endsWith(HOTEI_REASON));
      await page.evaluate(() => { const f = document.querySelectorAll('#voidPips .void-pip.filled'); f[f.length - 1].click(); });
      check('VWY-AFTER-PIP-TAP', [before, await page.evaluate(() => document.getElementById('void_current').value),
        (await reasons(page)).some(l => l.endsWith(HOTEI_REASON))], [false, '1', true]);
      // Momoku: the card's own line gives its reason; not repeated below.
      await setup(page, {combat: true, voidNow: 3, momoku: true});
      const momokuLine = await page.evaluate(() => document.getElementById('voidDisabledReason').textContent);
      check('VWY-MOMOKU-NOT-REPEATED', [/^Momoku/.test(momokuLine), (await reasons(page)).some(l => l.indexOf(momokuLine) >= 0)], [true, false]);
      check('VWY-LOGIC-LINES', await page.evaluate(() => {
        const W = window.__L5R_TEST__.VOIDWHY;
        if (!W) return null;
        const b = (label, reason) => ({label: 'Spend Void: ' + label, disabled: !!reason, reason});
        return [W.lines([b('A', 'X.'), b('B', 'X.')], ''), W.lines([b('A', 'X.'), b('B', ''), b('C', 'X.'), b('D', 'Y.')], ''),
          W.lines([b('A', 'A is a combat effect. Start a combat round first.')], 'out of combat'),
          W.lines([b('A', 'A is a combat effect. Start a combat round first.'), b('B', '')], ''),
          W.lines([b('A', 'Closed.'), b('B', 'Closed.')], 'Closed.')];
      }), [['X.'], ['A, C: X.', 'D: Y.'], [], ['A: A is a combat effect. Start a combat round first.'], []]);
      check('VWY-ONE-BOX', await page.evaluate(() => { window.__L5R_TEST__.renderVoidPanel(); window.__L5R_TEST__.renderVoidPanel();
        return document.querySelectorAll('#voidWhyReasons').length; }), 1);
    });
    check('VWY-NO-PAGE-ERRORS', errors, []);
    await context.close();
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL VWY-CHECK-COUNT ran=' + results.length + ' want=' + TOTAL);
  console.log(passed + '/' + TOTAL + ' checks passed');
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
