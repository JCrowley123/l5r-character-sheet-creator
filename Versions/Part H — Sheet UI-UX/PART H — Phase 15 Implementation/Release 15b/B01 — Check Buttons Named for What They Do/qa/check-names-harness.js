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
// Revision, round 2 (the owner's "Approve as shown", 24 November 2026; the eight CN-R2-* checks pinned before their first
// run): Lord Moon's Curse's and Touch of the Void's buttons take the check buttons' look (measured against Epilepsy's
// "Avoid (TN 15)", which no unit touches), Touch of the Void reads "Keep control (TN 30)", and the ten failure lines read
// as the board's round-2 table has them, without "Tell the GM". A second character, on a fresh page, carries the round-2
// rows (Touch of the Void owes a check after every Void Point spent, so it stays off the first character, whose Lost Love
// spends one); failures are rolled with every die a 1. Elemental Imbalance's message is reached the way Feature 4.5.2's
// (Part I) harness reaches it: a Shugenja's Fire spell roll through the Willpower gate, the check failed.
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
// Round 2 (the board's round-2 section and its table of failure lines, approved as shown).
const TOUCH = {text: 'Keep control (TN 30)', spoken: 'Keep control (TN 30): Touch of the Void, Willpower roll after you spend a Void Point',
  title: 'Touch of the Void — Willpower vs TN 30'};
const MOON = 'Resist Lord Moon (TN 20)';
const MOON_NAME = 'Lord Moon’s Curse', REALM_NAME = 'Cursed by the Realm';
const R2_ENTRIES = ['Epilepsy', 'Brash', 'Can’t Lie', 'Contrary', 'Overconfident', 'Rumormonger', 'Soft-Hearted', 'Touch of the Void'];
const FAILS = {
  'Brash': ['Brash — Willpower vs TN 25', 'You attack (or challenge) the one who provoked you, at once.'],
  'Can’t Lie': ['Can’t Lie — Willpower vs TN 20', 'You must correct the lie.'],
  'Contrary': ['Contrary — Willpower vs TN 25', 'You must argue your side of the dispute.'],
  'Epilepsy': ['Epilepsy — Willpower vs TN 15', 'You have a seizure. Each round, the End seizure button rolls to end it.'],
  'Overconfident': ['Overconfident — Perception vs TN 20', 'You do not see it, and press on.'],
  'Rumormonger': ['Rumormonger — Willpower vs TN 15', 'You pass the rumor on.'],
  'Soft-Hearted': ['Soft-Hearted — Willpower vs TN 20', 'You cannot bring yourself to kill.'],
  'Touch of the Void': [TOUCH.title, 'You are Dazed for one Round.'],
  'Toshigoku': ['Cursed by the Realm (Toshigoku) — Willpower vs TN 15', 'You are overcome by the urge to fight.']
};
const IMBALANCE = 'You failed the Elemental Imbalance Willpower check: the GM decides what happens. Your Spell Casting Roll still proceeds.';
// The spoken names a failing roll is pressed by: the approved ones, Epilepsy's and Toshigoku's unchanged ones.
const PRESS = {'Epilepsy': EPILEPSY[0][1], 'Touch of the Void': TOUCH.spoken,
  'Toshigoku': 'Make the Toshigoku Willpower Trait Roll at TN 15, when the GM calls for it'};
// The look a check button has: Epilepsy's "Avoid (TN 15)" is the reference.
const LOOK = ['backgroundColor', 'borderTopColor', 'borderTopWidth', 'borderTopStyle', 'color', 'fontSize', 'paddingTop', 'paddingLeft', 'lineHeight'];

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
  // Round 2: the round-2 character, Lord Moon's Curse at Medium and Cursed by the Realm for Toshigoku included.
  H.setup2 = (names, moonName, realmName) => {
    H.setup(names);
    const T = window.__L5R_TEST__, list = document.getElementById('disadvList');
    const moon = T.DISADV_LIBRARY.find(x => x.name === moonName);
    list.appendChild(T.makeEntry({name: moonName, cost: moon.cost, desc: moon.desc, config: {type: 'severityTier', value: 'Medium'}}, true));
    const realm = T.DISADV_LIBRARY.find(x => x.name === realmName);
    const div = T.makeEntry({name: realmName, cost: realm.cost, desc: realm.desc}, true);
    list.appendChild(div);
    const cfg = {type: 'realmPick', realm: 'Toshigoku'};
    if (T.D45.schema(realmName) && T.D45.schema(realmName).finalize) T.D45.schema(realmName).finalize(cfg);
    div.dataset.advConfig = JSON.stringify(cfg);
    T.recalcAll();
  };
  // One button's look and height, by its words, on one entry.
  H.look = (name, words, props) => { const d = entry(name); if (!d) return null;
    const b = Array.from(d.querySelectorAll('button')).filter(shown).find(x => x.textContent === words); if (!b) return null;
    const s = getComputedStyle(b), out = {height: Math.round(b.getBoundingClientRect().height * 10) / 10};
    props.forEach(k => { out[k] = s[k]; }); return out; };
  H.mode = m => { window.__L5R_TEST__.MODES12.set(m); };
  H.overlay = id => { const o = document.getElementById(id); return !!o && getComputedStyle(o).display !== 'none'; };
  // Elemental Imbalance: a Shugenja with the Disadvantage on Fire, a Fire spell roll through the Willpower gate.
  H.imbalance = () => {
    const T = window.__L5R_TEST__;
    T.resetToBaseline(); T.MODES12.set('management'); if (T.clearAllRows) T.clearAllRows();
    [['f_school', 'Isawa Shugenja'], ['f_schoolDeficiencyElement', '']].forEach(([id, v]) => { const i = document.getElementById(id);
      i.value = v; i.dispatchEvent(new Event('input', {bubbles: true})); i.dispatchEvent(new Event('change', {bubbles: true})); });
    const select = document.getElementById('disadvQuickAdd');
    select.value = 'Elemental Imbalance'; select.dispatchEvent(new Event('change', {bubbles: true}));
    if (document.getElementById('advConfigModalOverlay').style.display !== 'none') document.getElementById('advConfigX').click();
    const row = document.querySelector('#disadvList .entry:last-child');
    T.writeAdvConfig(row, 'elementPick', {type: 'elementPick', rank: 3, element: 'Fire', value: 'Fire'});
    T.recalcAll();
    document.getElementById('trait_willpower').value = '4';
    document.getElementById('ring_fire').value = '4';
    document.getElementById('spell_used_fire').value = '1';
    Math.random = () => 0;
    const context = T.makeRollContext(T.ROLL_KINDS.SPELL, {spellName: 'Elemental gate smoke', element: 'Fire', maho: false});
    window.__cnhGate = T.D45.gates.roll('Elemental gate smoke', context, 4, 4, {skipPreview: true, explode: false});
    return row.querySelector('.en-name').value;
  };
  window.CNH = H;
}
async function open(browser, opts, round2) {
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
  if (round2) await page.evaluate(([n, m, r]) => window.CNH.setup2(n, m, r), [R2_ENTRIES, MOON_NAME, REALM_NAME]);
  else await page.evaluate(names => window.CNH.setup(names), ENTRIES);
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
// Round 2: one failed roll, pressed by its spoken name; every die a 1. The preview, if one opens, is gone through.
async function fail(page, phone, spoken) {
  await page.evaluate(() => { Math.random = () => 0.05; });
  await press(page, phone, button(page, spoken));
  if (await page.evaluate(() => window.CNH.overlay('rollPreviewOverlay'))) await press(page, phone, page.locator('#rollPreviewGo'));
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => window.CNH.roll());
  await press(page, phone, page.locator('#rollModalClose'));
  await page.waitForSelector('#rollModalOverlay', {state: 'hidden'});
  return [r.title, r.note];
}
async function fails(page, phone, names) {
  const out = {};
  for (const n of names) out[n] = await fail(page, phone, PRESS[n] || SPOKEN[n]);
  return [names.every(n => same(out[n], FAILS[n]) && !/Tell the GM/.test(out[n][1])), out];
}
// Round 2: Lord Moon's and Touch of the Void's buttons look like Epilepsy's "Avoid (TN 15)", in Manage and in Play.
async function looks(page) {
  const out = {};
  for (const m of ['management', 'play']) {
    await page.evaluate(x => window.CNH.mode(x), m); await settle(page);
    out[m] = {ref: await page.evaluate(([w, p]) => window.CNH.look('Epilepsy', w, p), [EPILEPSY[0][0], LOOK]),
      moon: await page.evaluate(([n, w, p]) => window.CNH.look(n, w, p), [MOON_NAME, MOON, LOOK]),
      touch: await page.evaluate(([w, p]) => window.CNH.look('Touch of the Void', w, p), [TOUCH.text, LOOK])};
  }
  await page.evaluate(() => window.CNH.mode('management')); await settle(page);
  const alike = (a, ref) => !!a && !!ref && LOOK.every(k => a[k] === ref[k]) && Math.abs(a.height - ref.height) <= 1;
  return [Object.keys(out).every(m => alike(out[m].moon, out[m].ref) && alike(out[m].touch, out[m].ref)), out];
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
    // ---------- Round 2, phone ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.PHONE, true);
      const P = true;
      await check('CN-R2-TOUCH-NAME-PHONE', async () => {
        const b = button(page, TOUCH.spoken);
        const r = {count: await b.count(), text: (await b.count()) ? await b.first().textContent() : null};
        return [r.count === 1 && r.text === TOUCH.text, r];
      });
      await check('CN-R2-LOOK-PHONE', async () => looks(page));
      await check('CN-R2-FAIL-LINES-PHONE', async () => fails(page, P, ['Brash', 'Epilepsy', 'Touch of the Void']));
      await check('CN-R2-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
      await context.close();
    }
    // ---------- Round 2, laptop ----------
    {
      const {context, page, errors} = await open(browser, DEVICES.DESKTOP, true);
      await check('CN-R2-LOOK-DESKTOP', async () => looks(page));
      await check('CN-R2-FAIL-LINES-DESKTOP', async () => {
        await page.evaluate(() => { window.CNH.box('Contrary', '25'); window.CNH.box('Rumormonger', '3'); }); await settle(page);
        return fails(page, false, ['Can’t Lie', 'Contrary', 'Overconfident', 'Rumormonger', 'Soft-Hearted', 'Toshigoku']);
      });
      await check('CN-R2-IMBALANCE-DESKTOP', async () => {
        const added = await page.evaluate(() => window.CNH.imbalance());
        await page.waitForFunction(() => document.getElementById('rollPreviewOverlay').style.display === 'flex');
        await page.locator('#rollPreviewGo').click();
        await page.waitForFunction(() => document.getElementById('rollModalOverlay').style.display === 'flex');
        await page.locator('#rollModalClose').click();
        await page.waitForFunction(() => document.getElementById('appConfirmOverlay').style.display === 'flex');
        const notice = await page.locator('#appConfirmMsg').textContent();
        await page.locator('#appConfirmX').click();
        await page.waitForFunction(() => document.getElementById('rollModalOverlay').style.display === 'flex');
        const parent = await page.locator('#rollModalTitle').textContent();
        await page.locator('#rollModalClose').click();
        await page.evaluate(() => window.__cnhGate);
        return [added === 'Elemental Imbalance' && notice === IMBALANCE && /Elemental gate smoke/.test(parent), {added, notice, parent}];
      });
      await check('CN-R2-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
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
