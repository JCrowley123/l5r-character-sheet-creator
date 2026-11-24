'use strict';
// Release 15b, unit B01 (PART H PHASE 15.2.6): seven Disadvantage check buttons named for what they do (Q8's words,
// approved by the owner on 24 November 2026 as recommended).   node check-names-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the words a player sees and hears are written out here from the approved
// board, the rolls from the Core Rulebook's TNs (Brash p.157 TN 25, Can't Lie p.157 TN 20, Contrary p.158 the GM's TN,
// Overconfident p.161 Perception TN 20, Rumormonger p.161 TN 5 x the Glory Rank, Soft-Hearted p.162 TN 20, Lost Love
// p.160 a Void Point), and the sizes from the buttons' boxes against each other and the card. The unit's own state is
// read only to say whether it is there (the seam). Buttons are found by their spoken names, the way a screen reader
// finds them, and pressed with real taps on a touch phone and real clicks on a laptop. The test character is made on a
// blank sheet through the test seam: the eight Disadvantages with buttons, Willpower 3, Perception 2, Honor Rank 2.
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

// The approved words (the board's B01 section), entry by entry.
const ENTRIES = ['Brash', 'Overconfident', 'Can’t Lie', 'Contrary', 'Rumormonger', 'Soft-Hearted', 'Lost Love', 'Epilepsy'];
const LABEL = {
  'Brash': 'Resist insult (TN 25)',
  'Overconfident': 'Measure the enemy (TN 20)',
  'Can’t Lie': 'Discretion check (TN 20)',
  'Contrary': 'Cooperate',
  'Rumormonger': 'Resist gossip (TN 5 × Glory)',
  'Soft-Hearted': 'Resolve check (TN 20)',
  'Lost Love': 'Steady yourself — Spend Void'
};
const SPOKEN = {
  'Brash': 'Resist insult (TN 25): Brash, Willpower roll when threatened or insulted',
  'Overconfident': 'Measure the enemy (TN 20): Overconfident, Perception roll to see that a foe is clearly better than you',
  'Can’t Lie': 'Discretion check (TN 20): Can’t Lie, Willpower roll when a lie is told in front of you',
  'Contrary': 'Cooperate: Contrary, Willpower roll when a dispute is going on',
  'Rumormonger': 'Resist gossip (TN 5 × Glory): Rumormonger, Willpower roll to keep a rumor to yourself',
  'Soft-Hearted': 'Resolve check (TN 20): Soft-Hearted, Willpower roll to kill',
  'Lost Love': 'Steady yourself — Spend Void: Lost Love, a Void Point sets the memory aside'
};
// Epilepsy's two buttons were already named for what they do: unchanged, with the trunk's spoken names.
const EPILEPSY = [['Avoid (TN 15)', 'Epilepsy: Willpower Trait Roll to avoid a seizure'], ['End seizure (TN 10)', 'Epilepsy: Willpower Trait Roll to end a seizure']];
const NAMED = Object.keys(LABEL);

function install() {
  const H = {};
  const shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  const box = e => { const q = e.getBoundingClientRect(); return {left: Math.round(q.left), right: Math.round(q.right), top: Math.round(q.top), bottom: Math.round(q.bottom), height: Math.round(q.height), width: Math.round(q.width)}; };
  const entry = name => Array.from(document.querySelectorAll('#disadvList .entry')).find(d => d.querySelector('.en-name').value === name);
  H.setup = (names) => {
    const T = window.__L5R_TEST__;
    T.resetToBaseline(); T.MODES12.set('management'); if (T.clearAllRows) T.clearAllRows();
    const traits = {trait_agility: 3, trait_awareness: 3, trait_perception: 2, trait_reflexes: 3, trait_intelligence: 3, trait_willpower: 3};
    Object.keys(traits).forEach(id => { document.getElementById(id).value = traits[id]; });
    document.getElementById('f_honorRank').value = 2;
    names.forEach(name => {
      const lib = T.DISADV_LIBRARY.find(x => x.name === name);
      document.getElementById('disadvList').appendChild(T.makeEntry({name, cost: lib ? lib.cost : 0, desc: lib ? lib.desc : ''}, true));
    });
    T.recalcAll();
  };
  // Every button on one entry's check row, as a player sees and hears it.
  H.buttons = name => { const d = entry(name), row = d && d.querySelector('.chk4531-row'); if (!row) return null;
    return Array.from(row.querySelectorAll('button')).filter(shown).map(b => ({text: b.textContent, spoken: b.getAttribute('aria-label'), box: box(b)})); };
  H.card = name => box(entry(name));
  H.docScroll = () => ({doc: document.documentElement.scrollWidth, vw: innerWidth});
  H.roll = () => ({title: document.getElementById('rollModalTitle').textContent, note: document.getElementById('rollResultNote').textContent,
    dice: document.querySelectorAll('#rollDiceRow .roll-die').length});
  H.box = (name, value) => { const i = entry(name).querySelector('.chk4531-input'); i.value = value; i.dispatchEvent(new Event('input', {bubbles: true})); };
  H.reminded = () => { const t = entry('Lost Love').querySelector('.chk4531-toggle'); return t ? t.checked : null; };
  H.saved = () => ((window.__L5R_TEST__.collectData().disadv.find(d => d.name === 'Lost Love') || {}).config || {}).reminded;
  window.CNH = H;
}
async function open(browser, opts) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.evaluate(install);
  await page.evaluate(names => window.CNH.setup(names), ENTRIES);
  await goTo(page, 'Adv & Disadv');
  return {context, page, errors};
}
const goTo = async (page, label) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label); await settle(page); };
const button = (page, spoken) => page.getByRole('button', {name: spoken, exact: true});
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
// Every die a 9: Math.random 0.85 (the mock-ups' fixed dice).
const nines = page => page.evaluate(() => { Math.random = () => 0.85; });
async function roll(page, phone, spoken) {
  await press(page, phone, button(page, spoken));
  await page.waitForSelector('#rollPreviewGo', {state: 'visible', timeout: 6000});
  await press(page, phone, page.locator('#rollPreviewGo'));
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => window.CNH.roll());
  // Closed with its own button (run 1 pressed Escape, which left the roll window over the next button).
  await press(page, phone, page.locator('#rollModalClose'));
  await page.waitForSelector('#rollModalOverlay', {state: 'hidden'});
  return r;
}
async function labels(page) {
  const out = {};
  for (const name of ENTRIES) out[name] = await page.evaluate(n => window.CNH.buttons(n), name);
  return out;
}
// One line each: every named button as tall as Epilepsy's unchanged "Avoid (TN 15)" (same class, one line), and inside its card.
async function fits(page) {
  const all = await labels(page), ref = all['Epilepsy'] && all['Epilepsy'][0];
  const cards = {};
  for (const name of NAMED) cards[name] = await page.evaluate(n => window.CNH.card(n), name);
  const scroll = await page.evaluate(() => window.CNH.docScroll());
  const rows = NAMED.map(n => ({name: n, b: all[n] && all[n][0], card: cards[n]}));
  const ok = !!ref && rows.every(r => r.b && Math.abs(r.b.box.height - ref.box.height) <= 1 && r.b.box.left >= r.card.left && r.b.box.right <= r.card.right) &&
    scroll.doc === scroll.vw;
  return [ok, {ref: ref && ref.box, rows: rows.map(r => [r.name, r.b && r.b.box, r.card]), scroll}];
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------- Phone ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE);
      const P = true;
      await check('CN-SEAM-PHONE', async () => {
        const r = await page.evaluate(() => { const T = window.__L5R_TEST__; return {cn: !!T.CN15 && T.CN15.installed === true, on: T.CHECK_BUTTON_NAMES_ENABLED}; });
        return [r.cn && r.on === true, r];
      });
      const all = await labels(page);
      await check('CN-LABELS-PHONE', async () => [NAMED.every(n => same((all[n] || []).map(b => b.text), [LABEL[n]])), all]);
      await check('CN-SPOKEN-PHONE', async () => [NAMED.every(n => all[n] && all[n].length === 1 && all[n][0].spoken === SPOKEN[n] && all[n][0].spoken.indexOf(all[n][0].text + ': ') === 0), all]);
      await check('CN-EPILEPSY-UNCHANGED-PHONE', async () => [same((all['Epilepsy'] || []).map(b => [b.text, b.spoken]), EPILEPSY), all['Epilepsy']]);
      await nines(page);
      await check('CN-BRASH-ROLL-PHONE', async () => {
        const r = await roll(page, P, SPOKEN['Brash']);
        return [r.title === 'Brash — Willpower vs TN 25' && r.dice === 3 && r.note === 'You keep your temper.', r];
      });
      await check('CN-CONTRARY-ROLL-PHONE', async () => {
        await page.evaluate(() => window.CNH.box('Contrary', '25')); await settle(page);
        const r = await roll(page, P, SPOKEN['Contrary']);
        return [r.title === 'Contrary — Willpower vs TN 25' && r.dice === 3, r];
      });
      await check('CN-RUMORMONGER-ROLL-PHONE', async () => {
        await page.evaluate(() => window.CNH.box('Rumormonger', '3')); await settle(page);
        const r = await roll(page, P, SPOKEN['Rumormonger']);
        return [r.title === 'Rumormonger — Willpower vs TN 15' && r.dice === 3, r];
      });
      await check('CN-OTHER-ROLLS-PHONE', async () => {
        const r = [];
        for (const n of ['Overconfident', 'Can’t Lie', 'Soft-Hearted']) r.push((await roll(page, P, SPOKEN[n])).title);
        return [same(r, ['Overconfident — Perception vs TN 20', 'Can’t Lie — Willpower vs TN 20', 'Soft-Hearted — Willpower vs TN 20']), r];
      });
      await check('CN-LOST-LOVE-SPENDS-PHONE', async () => {
        await page.evaluate(() => { document.getElementById('void_current').value = 2; });
        await press(page, P, page.locator('#disadvList .chk4531-toggle[data-chk4531="reminded"]'));
        const before = await page.evaluate(() => ({reminded: window.CNH.reminded(), saved: window.CNH.saved()}));
        await press(page, P, button(page, SPOKEN['Lost Love']));
        const after = await page.evaluate(() => ({voids: +document.getElementById('void_current').value, reminded: window.CNH.reminded(), saved: window.CNH.saved()}));
        return [before.reminded === true && before.saved === true && after.voids === 1 && after.reminded === false && after.saved === false, {before, after}];
      });
      await check('CN-FITS-PHONE', async () => fits(page));
      await check('CN-SURVIVES-REDRAW-PHONE', async () => {
        await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play')); await settle(page);
        const play = await labels(page);
        await page.evaluate(() => { window.__L5R_TEST__.MODES12.set('management'); window.__L5R_TEST__.recalcAll(); }); await settle(page);
        const manage = await labels(page);
        const words = set => NAMED.map(n => (set[n] || []).map(b => [b.text, b.spoken]));
        const want = NAMED.map(n => [[LABEL[n], SPOKEN[n]]]);
        return [same(words(play), want) && same(words(manage), want), {play: words(play), manage: words(manage)}];
      });
      await check('CN-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Laptop ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP);
      const all = await labels(page);
      await check('CN-LABELS-DESKTOP', async () => [NAMED.every(n => same((all[n] || []).map(b => [b.text, b.spoken]), [[LABEL[n], SPOKEN[n]]])) &&
        same((all['Epilepsy'] || []).map(b => [b.text, b.spoken]), EPILEPSY), all]);
      await check('CN-FITS-DESKTOP', async () => fits(page));
      await check('CN-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
