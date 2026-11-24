'use strict';
// Release 15b, unit B03 (PART H PHASE 15.2.7): Leadership reads "Lead an ally" and Quick reads "Use", each with its
// amount beside it (approved by the owner on 24 November 2026 as recommended).   node lead-an-ally-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the words a player sees and hears are written out here from the approved board;
// the amounts come from the Core Rulebook (Leadership p.151: School Rank + 1k1 for one ally, once a Round; Quick p.152:
// add Reflexes to the Initiative Score when you did not act first) and the character's own School Rank and Reflexes;
// the sizes from the boxes against each other and the card. The unit's own state is read only to say whether it is
// there (the seam). Buttons are found by their spoken names and pressed with real taps on a touch phone and real clicks
// on a laptop. The test character is made on a blank sheet through the test seam: Quick and Leadership, Isawa
// Shugenja, every Trait and Void 3 (Insight 150). The School Rank expected is the one the sheet shows in its School Rank
// box (run 1 set that box by hand, and the sheet works it out again from Insight). A bushi School: run 2's Isawa
// Shugenja opened the new-Rank spell window when Insight rose, which covered the buttons.
// Revision, round 2 (the owner's "Approve as shown", 24 November 2026; LA-OUTLINED-PHONE and LA-OUTLINED-DESKTOP pinned
// before their first run): both buttons take the outlined look of the other buttons on these cards. The reference is
// Epilepsy's "Avoid (TN 15)" (Feature 4.5.31, Part I, which no unit restyles), added to the character only for these
// two checks, after every other check on the page has run.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const sheet = path.resolve(process.argv[2]);
const seen = {};
const set = (id, ok, detail) => {
  seen[id] = ok === true && seen[id] !== false;
  if (ok !== true) console.log('  detail ' + id + ': ' + JSON.stringify(detail === undefined ? ok : detail).slice(0, 1500));
};
async function check(id, body) {
  try { const [ok, detail] = await body(); set(id, ok, detail); }
  catch (e) { set(id, false, 'exception: ' + String(e && e.message || e).slice(0, 500)); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DEVICES = {PHONE: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, DESKTOP: {viewport: {width: 1440, height: 1000}}};
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));

// The approved words, for School Rank r and Reflexes x.
const LEAD = r => ({text: 'Lead an ally', amount: '1k1 + ' + r + ' (School Rank)', spoken: 'Lead an ally: roll 1k1 + ' + r + ' (School Rank) for one ally’s Initiative Score'});
const QUICK = x => ({text: 'Use', amount: '+' + x + ' (Reflexes)', spoken: 'Use Quick: add ' + x + ' (Reflexes) to your Initiative Score for the rest of the skirmish'});
// Feature 4.5.33's notes under the buttons, unchanged.
const LEAD_NOTE = 'Once a Round, in the Reactions Stage: one ally adds the total until the next Reactions Stage.';
const QUICK_NOTE = 'Each Round you did not act first, in the Reactions Stage.';
const OUT = 'Start a combat round first.', USED = 'Already used this Round.';
// Round 2: the look every check and feature button on these cards has (Epilepsy's "Avoid (TN 15)" is the reference).
const LOOK = ['backgroundColor', 'borderTopColor', 'borderTopWidth', 'borderTopStyle', 'color', 'fontSize', 'paddingTop', 'paddingLeft', 'lineHeight'];

function install() {
  const H = {};
  const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  const box = e => { const q = e.getBoundingClientRect(); return {left: Math.round(q.left), right: Math.round(q.right), top: Math.round(q.top), bottom: Math.round(q.bottom), mid: Math.round(q.top + q.height / 2), height: Math.round(q.height)}; };
  const entry = name => Array.from(document.querySelectorAll('#advList .entry')).find(d => d.querySelector('.en-name').value === name);
  H.setup = () => {
    const T = window.__L5R_TEST__;
    T.resetToBaseline(); T.MODES12.set('management'); if (T.clearAllRows) T.clearAllRows();
    H.traits(3);
    T.saveSchoolsList([{name: 'Akodo Bushi', frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0}]);
    document.getElementById('f_school').value = 'Akodo Bushi';
    T.setCombatActive(false); T.resetCombatRound();
    ['Quick', 'Leadership'].forEach(name => {
      const lib = T.ADV_LIBRARY.find(x => x.name === name);
      document.getElementById('advList').appendChild(T.makeEntry({name, cost: lib.cost, desc: lib.desc}, true));
    });
    T.recalcAll();
  };
  // One entry's row as a player sees and hears it: the button, the parts after it in order, and the boxes.
  H.row = name => { const d = entry(name), r = d && d.querySelector('.vi4533-row'); if (!r) return null;
    const b = r.querySelector('button');
    const parts = Array.from(r.children).filter(shown);
    return {button: b ? {text: b.textContent, spoken: b.getAttribute('aria-label'), disabled: b.disabled, title: b.getAttribute('title'), box: box(b)} : null,
      after: parts.filter(e => e !== b).map(e => ({text: e.textContent, box: box(e)})),
      notes: Array.from(r.querySelectorAll('.vi4533-note')).map(n => n.textContent),
      card: box(d), docScroll: document.documentElement.scrollWidth, vw: innerWidth}; };
  H.traits = v => { ['agility', 'awareness', 'intelligence', 'perception', 'reflexes', 'stamina', 'strength', 'willpower'].forEach(n => {
    const el = document.getElementById('trait_' + n); el.value = v; el.dataset.free = String(v); }); document.getElementById('ring_void').value = v; };
  H.raise = v => { H.traits(v); window.__L5R_TEST__.recalcAll(); };
  H.rank = () => parseInt(document.getElementById('f_rank').value, 10);
  H.combat = () => { window.__L5R_TEST__.setCombatActive(true); window.__L5R_TEST__.recalcAll(); };
  H.ledger = key => { const L = window.__L5R_TEST__.getRoundLedger(); return Object.keys(L).map(r => L[r][key]).filter(v => v !== undefined); };
  H.roll = () => ({title: document.getElementById('rollModalTitle').textContent, dice: document.querySelectorAll('#rollDiceRow .roll-die').length,
    total: +document.getElementById('rollTotalDisplay').textContent});
  // Round 2: the reference row, and one button's look by its entry.
  H.addReference = () => { const T = window.__L5R_TEST__, lib = T.DISADV_LIBRARY.find(x => x.name === 'Epilepsy');
    document.getElementById('disadvList').appendChild(T.makeEntry({name: 'Epilepsy', cost: lib.cost, desc: lib.desc}, true)); T.recalcAll(); };
  H.look = (list, name, words, props) => {
    const d = Array.from(document.querySelectorAll('#' + list + ' .entry')).find(x => x.querySelector('.en-name').value === name);
    const b = d && Array.from(d.querySelectorAll('button')).filter(shown).find(x => x.textContent === words); if (!b) return null;
    const s = getComputedStyle(b), out = {height: Math.round(b.getBoundingClientRect().height * 10) / 10};
    props.forEach(k => { out[k] = s[k]; }); return out; };
  window.LAH = H;
}
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
  await page.waitForFunction(() => !document.getElementById('l5rSplash'), null, {timeout: 30000});
  await page.evaluate(install);
  await page.evaluate(() => window.LAH.setup());
  await goTo(page, 'Adv & Disadv');
  return {context, page, errors};
}
const goTo = async (page, label) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label); await settle(page); };
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
const button = (page, spoken) => page.getByRole('button', {name: spoken, exact: true});
const row = (page, name) => page.evaluate(n => window.LAH.row(n), name);
// The button and its amount on one line, inside the card, nothing scrolling sideways.
const oneLine = r => !!r && !!r.button && r.after.length > 0 && Math.abs(r.after[0].box.mid - r.button.box.mid) <= 4 &&
  r.after[0].box.left >= r.button.box.right && r.after[0].box.right <= r.card.right && r.docScroll === r.vw;
// Round 2: Leadership's and Quick's buttons look like the reference, height within 1 px.
async function outlined(page) {
  await page.evaluate(() => window.LAH.addReference()); await settle(page);
  const look = (list, name, w) => page.evaluate(([l, n, w, p]) => window.LAH.look(l, n, w, p), [list, name, w, LOOK]);
  const r = {ref: await look('disadvList', 'Epilepsy', 'Avoid (TN 15)'), lead: await look('advList', 'Leadership', 'Lead an ally'), quick: await look('advList', 'Quick', 'Use')};
  const alike = a => !!a && !!r.ref && LOOK.every(k => a[k] === r.ref[k]) && Math.abs(a.height - r.ref.height) <= 1;
  return [alike(r.lead) && alike(r.quick), r];
}
const words = (r, want, note) => !!r && !!r.button && r.button.text === want.text && r.button.spoken === want.spoken &&
  r.after.length > 0 && r.after[0].text === want.amount && same(r.notes, [note]);

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('LA-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {la: !!T.LA15 && T.LA15.installed === true, on: T.LEAD_AN_ALLY_ENABLED}; });
        return [r.la && r.on === true, r];
      });
      const lead = await row(page, 'Leadership'), quick = await row(page, 'Quick');
      const rank = await page.evaluate(() => window.LAH.rank());
      await check('LA-LEAD-LABEL-PHONE', async () => [rank >= 1 && words(lead, LEAD(rank), LEAD_NOTE), {rank, lead}]);
      await check('LA-QUICK-LABEL-PHONE', async () => [words(quick, QUICK(3), QUICK_NOTE), quick]);
      await check('LA-NOTES-KEPT-PHONE', async () => [same(lead.notes, [LEAD_NOTE]) && same(quick.notes, [QUICK_NOTE]) &&
        lead.after.slice(1).some(p => p.text === LEAD_NOTE) && quick.after.slice(1).some(p => p.text === QUICK_NOTE), {lead, quick}]);
      await check('LA-GREYED-OUT-OF-COMBAT-PHONE', async () => [lead.button.disabled === true && lead.button.title === OUT &&
        quick.button.disabled === true && quick.button.title === OUT, {lead: lead.button, quick: quick.button}]);
      await check('LA-ONE-LINE-PHONE', async () => [oneLine(lead) && oneLine(quick), {lead, quick}]);
      await check('LA-AMOUNT-FOLLOWS-PHONE', async () => {
        await page.evaluate(() => window.LAH.raise(4)); await settle(page);
        const now = await page.evaluate(() => window.LAH.rank());
        const l = await row(page, 'Leadership'), q = await row(page, 'Quick');
        return [now > rank && words(l, LEAD(now), LEAD_NOTE) && words(q, QUICK(4), QUICK_NOTE), {rank, now, l, q}];
      });
      await page.evaluate(() => window.LAH.combat()); await settle(page);
      await page.evaluate(() => { Math.random = () => 0.65; });   // every die a 7
      const high = await page.evaluate(() => window.LAH.rank());
      await check('LA-LEAD-ROLLS-PHONE', async () => {
        await press(page, P, button(page, LEAD(high).spoken));
        await page.waitForSelector('#rollDiceRow .roll-die');
        const r = await page.evaluate(() => window.LAH.roll());
        await press(page, P, page.locator('#rollModalClose'));
        await page.waitForSelector('#rollModalOverlay', {state: 'hidden'});
        const after = await row(page, 'Leadership'), ledger = await page.evaluate(() => window.LAH.ledger('Leadership'));
        return [r.title === 'Leadership — 1k1 + School Rank ' + high + ', for one ally' && r.dice === 1 && r.total === 7 + high && same(ledger, [7 + high]) &&
          after.button.text === 'Lead an ally' && after.button.disabled === true && after.button.title === USED &&
          after.after[0].text === '1k1 + ' + high + ' (School Rank)' && same(after.notes, ['This Round: ' + (7 + high) + ' to one ally’s Initiative Score.']), {high, r, after, ledger}];
      });
      await check('LA-QUICK-USES-PHONE', async () => {
        await press(page, P, button(page, QUICK(4).spoken));
        const after = await row(page, 'Quick'), ledger = await page.evaluate(() => window.LAH.ledger('Quick'));
        return [same(ledger, [4]) && after.button.text === 'Use' && after.button.disabled === true && after.button.title === USED &&
          after.after[0].text === '+4 (Reflexes)' && same(after.notes, ['Initiative Score +4 this skirmish.']), {after, ledger}];
      });
      await check('LA-OUTLINED-PHONE', async () => outlined(page));
      await check('LA-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const lead = await row(page, 'Leadership'), quick = await row(page, 'Quick');
      const rank = await page.evaluate(() => window.LAH.rank());
      await check('LA-LABELS-DESKTOP', async () => [rank >= 1 && words(lead, LEAD(rank), LEAD_NOTE) && words(quick, QUICK(3), QUICK_NOTE), {rank, lead, quick}]);
      await check('LA-ONE-LINE-DESKTOP', async () => [oneLine(lead) && oneLine(quick), {lead, quick}]);
      await check('LA-OUTLINED-DESKTOP', async () => outlined(page));
      await check('LA-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  let passed = 0;
  for (const id of pins.checks) {
    const ok = seen[id] === true;
    if (ok) passed++;
    console.log((ok ? 'PASS ' : 'FAIL ') + id + (id in seen ? '' : ' (never ran)'));
  }
  const extra = Object.keys(seen).filter(id => !pins.checks.includes(id));
  for (const id of extra) console.log('FAIL ' + id + ' (not pinned)');
  const total = pins.checks.length + extra.length;
  console.log(`${passed}/${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
})().catch(e => { console.error(e); console.log(`0/${pins.checks.length} checks passed`); process.exit(1); });
