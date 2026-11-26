'use strict';
// Release 15b, unit B18 (PART H PHASE 15.2.10): one name per button job (the owner's rulings of 24 November 2026; the
// mock-up board approved on 25 November 2026, round 1).   node button-names-harness.js <sheet.html>
// Every check id is pinned in expected-checks.json before the first run; a check that never ran is a FAIL.
// Oracles are independent of the unit: the words and spoken names are written out here from the approved board
// (MOCKUP.md, qa/mockup/cards.json "after"), the windows' headings from the sheet's own markup, and the ring i's look
// from the board's drawing rule (28 px, a circle, an upright i). A spoken name is read as a screen reader reads it:
// aria-labelledby, then aria-label, then the words. Buttons are found by their spoken names and pressed with real taps on
// a touch phone and real clicks on a laptop; each press is checked to still do what it did. The unit's own state is read
// only to say whether it is there (the seam), and its window handle only to ask the two questions no test character
// reaches (the bonus spell slot, Hida Atarasi's price), exactly as the sheet asks them.
// The test characters are the inventory's (qa/inventory/fixtures.cjs: A03's dense Kuni Shugenja with every
// once-a-session entry), its Seppun variant, Darling of the Court on its own, and the Toku and Kakita Ancestors; each is
// written to a scratch folder and opened by Import, as a player opens one.
const path = require('path'), fs = require('fs'), os = require('os'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const pins = require('./expected-checks.json');
const INV = require('./inventory/fixtures.cjs');
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
const wait = ms => new Promise(r => setTimeout(r, ms));

// ---- The approved words (MOCKUP.md, round 1) ----
const RESETS = [['advList', 'Kharmic Tie'], ['advList', 'Luck'], ['advList', 'Dark Paragon'], ['advList', 'Great Destiny'],
  ['disadvList', 'Haunted'], ['disadvList', 'Unlucky']];
const resetSpoken = name => 'Reset ' + name + ' for a new session';
const ANCESTOR_RESET = 'Reset Kuni’s gift for a new session', ROUNDS = 'Reset the round counter';
const DESTINY_USE = 'Use Great Destiny: a killing blow leaves you 1 Wound from death instead';
const SEPPUN_USE = 'Use Seppun’s free Void Point';
const TIE_LINE = 'An attack’s roll preview offers the Tie while a use is left; nothing is spent until you roll. Reset gives back all 3 at the start of a session.';
const DESTINY_USED = 'Great Destiny is already used this session. Reset to use it again.';
const GIFT_NOTE = 'Used this session. It is ready again after Reset on the Ancestor card (Clan & School).';
const LUCK_SPOKEN = (n, m) => 'Reroll with Luck: roll the whole roll again and keep the higher result, ' + n + ' of ' + m + ' left';
const BONUS = 'No Earth spell slots remain. Use bonus slot? (shared pool — 2 of 2 remaining across all Elements)';
const ATARASI = 'Hida Atarasi: this Round’s corruption, +2k0 on the attack. Pay with a Void Point, or take a point of Shadowlands Taint?\n\n✕ cancels the roll.';
// The windows' corner ✕: the verb the board approved, with the window's own heading (20-fixed-layers.html).
const CORNERS_FIXED = {
  manualRollPromptClose: 'Close Manual Roll', untrainedSkillsClose: 'Close Untrained Skills', castWhyX: 'Close Casting check',
  spellScrollsX: 'Close Spell Scrolls', arrowsPickerClose: 'Close Arrows', voidInfoClose: 'Close Spending Void Points',
  rollPreviewClose: 'Cancel Before you roll', universalSpellPickX: 'Cancel Choose Element', handPickClose: 'Cancel Attack with',
  arrowPickClose: 'Cancel Choose your arrow', rangePickClose: 'Cancel Range to target', deficiencyPickX: 'Cancel Choose Deficiency'
};
// The windows whose heading is written as they open: [✕ id, verb, heading id or null, " information"].
const CORNERS_TITLED = [['rollModalClose', 'Close', 'rollModalTitle', ''], ['skillInfoClose', 'Close', 'skillInfoTitle', ' information'],
  ['stanceInfoClose', 'Close', 'stanceInfoTitle', ' information'], ['woundInfoClose', 'Close', 'woundInfoTitle', ''],
  ['advConfigX', 'Cancel', 'advConfigTitle', ''], ['affinityPickX', 'Cancel', null, '']];
// Words that must be gone from every button, and spoken names that must be gone, once the unit is in.
const OLD_WORDS = ['Reset session', 'Use it now', 'Got it', 'Re-roll 1s', 'Re-roll selected', '+ Emph', '+Book', 'Export to PDF', 'Choose again'];
const OLD_SPOKEN = [/^Explain:/, /: how it is worked out$/, /^About Ancestors$/, / stance rules$/, /^(Add|Subtract) .+ points$/, /^One (more|fewer) /,
  /^(Raise|Lower) /, /^(Gain|Lose) one /, /^Configure /, /^Reset session/];

function install() {
  const H = {};
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  H.shown = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  // The name a screen reader gives a control.
  H.spoken = el => {
    if (!el) return null;
    const by = el.getAttribute('aria-labelledby');
    if (by && by.trim()) return norm(by.trim().split(/\s+/).map(id => { const r = document.getElementById(id); return r ? r.textContent : ''; }).join(' '));
    const al = el.getAttribute('aria-label');
    if (al && norm(al)) return norm(al);
    return norm(el.textContent) || norm(el.getAttribute('title'));
  };
  H.entry = (list, name) => Array.from(document.querySelectorAll('#' + list + ' .entry')).find(d => d.querySelector('.en-name').value === name) || null;
  H.read = el => el ? {text: norm(el.textContent), spoken: H.spoken(el), shown: H.shown(el), disabled: !!el.disabled} : null;
  H.resetOf = (list, name) => { const d = H.entry(list, name); return d ? Array.from(d.querySelectorAll('button')).find(b => /^Reset/.test(norm(b.textContent))) : null; };
  H.byId = id => H.read(document.getElementById(id));
  // Every button in the page: words that must be gone, and spoken names that must be gone.
  H.leftovers = (words, spokenRes) => {
    const out = [];
    document.querySelectorAll('button').forEach(b => {
      const t = norm(b.textContent), s = H.spoken(b) || '';
      if (words.includes(t)) out.push(['words', t, b.id || b.className]);
      if (spokenRes.some(re => new RegExp(re[0], re[1]).test(s))) out.push(['spoken', s, b.id || b.className]);
    });
    return out;
  };
  H.ringLook = el => { if (!el) return null; const s = getComputedStyle(el), a = getComputedStyle(el, '::after'), r = el.getBoundingClientRect();
    return {w: Math.round(r.width), h: Math.round(r.height), radius: s.borderTopLeftRadius, font: s.fontSize, glyph: a.content, border: s.borderTopStyle}; };
  H.mode = m => { window.__L5R_TEST__.MODES12.set(m); };
  H.overlay = id => { const o = document.getElementById(id); return !!o && getComputedStyle(o).display !== 'none'; };
  window.BNH = H;
}
function fixtures(dir) {
  const write = (key, f) => { const file = path.join(dir, 'b18-' + key + '.l5r.json'); fs.writeFileSync(file, JSON.stringify(f)); return {file, name: f.fields.f_name}; };
  const sessions = INV.sessions(); sessions.fields.f_name = 'B18 build';
  const imperial = INV.ancestorImperial(); imperial.fields.f_name = 'B18 build Seppun';
  const court = INV.sessions(); court.fields.f_name = 'B18 build court'; court.disadv = [];
  court.adv = [{name: 'Darling of the Court', cost: '4', desc: '', config: {type: 'courtList', revision: 1, courts: ['Kyuden Doji', 'Otosan Uchi'], selected: 'Kyuden Doji', inSession: false, value: 'Kyuden Doji, Otosan Uchi'}}];
  const toku = INV.sessions(); toku.fields.f_name = 'B18 build Toku'; toku.fields.f_clan = 'Monkey';
  toku.fields.f_ancestor = JSON.stringify({v: 1, name: 'Toku', lost: false, regained: false, final: false, gm: false, sessionUsed: false});
  toku.adv = toku.adv.filter(a => a.name !== 'Luck'); toku.disadv = toku.disadv.filter(d => d.name !== 'Unlucky');
  const kakita = INV.sessions(); kakita.fields.f_name = 'B18 build Kakita'; kakita.fields.f_clan = 'Crane';
  kakita.fields.f_ancestor = JSON.stringify({v: 1, name: 'Kakita', lost: false, regained: false, final: false, gm: false, sessionUsed: false});
  kakita.adv = kakita.adv.filter(a => a.name !== 'Luck'); kakita.disadv = kakita.disadv.filter(d => d.name !== 'Unlucky');
  return {sessions: write('sessions', sessions), imperial: write('imperial', imperial), court: write('court', court),
    toku: write('toku', toku), kakita: write('kakita', kakita)};
}
async function open(browser, opts, fx) {
  const context = await browser.newContext(opts);
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  if (fx) {
    await page.locator('#fileImport').setInputFiles(fx.file);
    await page.waitForFunction(n => document.getElementById('f_name').value === n, fx.name);
    await wait(300);
  }
  await page.evaluate(install);
  return {context, page, errors};
}
const goTo = async (page, label) => { await page.evaluate(async l => { const C = window.__L5R_CAROUSEL__; C.goToTab(l); await C.whenSettled(); }, label); await settle(page); };
const mode = async (page, m) => { await page.evaluate(m => window.BNH.mode(m), m); await settle(page); };
const button = (page, spoken) => page.getByRole('button', {name: spoken, exact: true});
const press = async (page, phone, locator) => { await locator.scrollIntoViewIfNeeded(); if (phone) await locator.tap(); else await locator.click(); await settle(page); };
const shownOverlay = (page, id) => page.evaluate(i => window.BNH.overlay(i), id);
// A Skill roll's result with every die a 1 (so the Emphasis reroll has dice to reroll).
async function rollOnes(page, phone, row = 1) {
  await page.evaluate(() => { Math.random = () => 0.05; });
  await press(page, phone, page.locator('#skillsBody > tr:nth-child(' + row + ') .sk-roll'));
  if (await shownOverlay(page, 'rollPreviewOverlay')) await press(page, phone, page.locator('#rollPreviewGo'));
  await page.waitForFunction(() => getComputedStyle(document.getElementById('rollModalOverlay')).display !== 'none');
  await wait(200);
}
const closeWindows = page => page.evaluate(() => {
  ['rollModalClose', 'rollPreviewClose', 'stanceInfoClose', 'skillInfoClose', 'appConfirmX', 'advConfigX', 'manualRollPromptClose', 'voidInfoClose', 'untrainedSkillsClose']
    .forEach(id => { const x = document.getElementById(id), o = x && x.closest('.roll-modal-overlay'); if (o && getComputedStyle(o).display !== 'none') x.click(); });
});
const leftovers = page => page.evaluate(([w, s]) => window.BNH.leftovers(w, s), [OLD_WORDS, OLD_SPOKEN.map(r => [r.source, r.flags])]);

async function phoneSessions(browser, F) {
  const {context, page, errors} = await open(browser, DEVICES.PHONE, F.sessions);
  const phone = true;
  await check('BN-SEAM-PHONE', async () => {
    const s = await page.evaluate(() => { const T = window.__L5R_TEST__, B = T.BN15;
      return {installed: !!B && B.installed, on: T.ONE_NAME_PER_JOB_ENABLED, body: document.body.classList.contains('bn15-on'), parts: B ? Object.keys(B.parts).filter(k => B.parts[k]) : []}; });
    const want = ['rows', 'explain', 'sheet', 'confirm', 'confirm3', 'alert', 'result', 'emphasis', 'stances', 'arrows', 'ancestor', 'wizard', 'library', 'court', 'pdf', 'tieWindow', 'giftNote', 'useNotes', 'infoLabels'];
    return [s.installed === true && s.on === true && s.body && want.every(k => s.parts.includes(k)), s];
  });
  // ---- G01 Reset ----
  await mode(page, 'play'); await goTo(page, 'Adv & Disadv');
  await check('BN-RESET-PHONE', async () => {
    const got = await page.evaluate(R => R.map(([l, n]) => [n, window.BNH.read(window.BNH.resetOf(l, n))]), RESETS);
    const ok = got.every(([n, r]) => r && r.text === 'Reset' && r.spoken === resetSpoken(n) && r.shown);
    return [ok, got];
  });
  await check('BN-RESET-PRESS-PHONE', async () => {
    await press(page, phone, button(page, resetSpoken('Luck')));
    const after = await page.evaluate(() => { const d = window.BNH.entry('advList', 'Luck');
      return {pips: d.querySelector('.adv-config-pips').getAttribute('aria-label'), reset: window.BNH.read(window.BNH.resetOf('advList', 'Luck'))}; });
    return [after.pips === '3 of 3 Luck uses remaining' && after.reset.text === 'Reset' && after.reset.spoken === resetSpoken('Luck'), after];
  });
  await check('BN-RESET-LINES-PHONE', async () => {
    // Kharmic Tie's i window.
    await press(page, phone, page.locator('#advList .kt15-info'));
    const tie = await page.evaluate(() => Array.from(document.querySelectorAll('#stanceInfoBody .kt15-rule')).map(p => p.textContent));
    await press(page, phone, button(page, 'Close Kharmic Tie information'));
    // Great Destiny, used and asked again.
    const destiny = await page.evaluate(async () => { const T = window.__L5R_TEST__, d = window.BNH.entry('advList', 'Great Destiny');
      T.DSX4532.setState(d, {used: true}); T.DSX4532.useDestiny(d, 'great destiny');
      await new Promise(r => setTimeout(r, 50));
      return {msg: document.getElementById('appConfirmMsg').textContent, ok: window.BNH.byId('appConfirmOk'), x: window.BNH.byId('appConfirmX')}; });
    await press(page, phone, button(page, 'Close notice'));
    await page.evaluate(() => { const T = window.__L5R_TEST__, d = window.BNH.entry('advList', 'Great Destiny'); T.DSX4532.setState(d, {used: false}); T.recalcAll(); });
    // The Ancestor gift's note in a roll preview, once its session use is spent (the Ancestor Gifts fix's route).
    const note = await page.evaluate(() => { const T = window.__L5R_TEST__; const ctx = T.makeRollContext(T.ROLL_KINDS.SPELL, {spellName: 'Probe'});
      T.RD4515.start(ctx); const o = T.RD4515.offered(ctx).find(x => x.key === 'ancestors:kuni-cast'); return o ? o.note : null; });
    return [tie.includes(TIE_LINE) && !tie.some(t => /Reset session/.test(t)) && destiny.msg === DESTINY_USED && destiny.ok.text === 'OK' &&
      destiny.x.spoken === 'Close notice' && note === GIFT_NOTE, {tie, destiny, note}];
  });
  await check('BN-RESET-ANCESTOR-PHONE', async () => {
    await goTo(page, 'Clan & School');
    const card = await page.evaluate(() => window.BNH.byId('anc48ResetSession'));
    await press(page, phone, button(page, ANCESTOR_RESET));
    const after = await page.evaluate(() => ({state: document.querySelector('#anc48Session .anc48-session-state').textContent, reset: window.BNH.byId('anc48ResetSession')}));
    await page.evaluate(() => window.__L5R_TEST__.ANC48.useSession());
    await goTo(page, 'Combat');
    const rounds = await page.evaluate(() => window.BNH.byId('btnResetRounds'));
    return [card.text === 'Reset' && card.spoken === ANCESTOR_RESET && /ready this session \(1\/1\)/.test(after.state) && after.reset.text === 'Reset' &&
      after.reset.disabled === true && rounds.text === 'Reset' && rounds.spoken === ROUNDS, {card, after, rounds}];
  });
  // An i's window takes its heading from the button it explains: Luck's i explains its Reset, so the heading is "Reset".
  await check('BN-I-WINDOW-HEADING-PHONE', async () => {
    await goTo(page, 'Adv & Disadv');
    await page.evaluate(() => { const b = window.BNH.entry('advList', 'Luck').querySelector('.adv-config-info'); if (b) b.dataset.bnh = 'luck-i'; });
    await press(page, phone, page.locator('[data-bnh="luck-i"]'));
    const w = await page.evaluate(() => ({open: window.BNH.overlay('stanceInfoOverlay'), title: document.getElementById('stanceInfoTitle').textContent.trim(),
      body: document.getElementById('stanceInfoBody').textContent.trim(), x: window.BNH.byId('stanceInfoClose'),
      part: !!window.__L5R_TEST__.BN15.parts.explainWindow}));
    await press(page, phone, button(page, 'Close Reset information'));
    const closed = !(await shownOverlay(page, 'stanceInfoOverlay'));
    return [w.open && w.title === 'Reset' && /Restore Luck to its per-session maximum/.test(w.body) && w.x.spoken === 'Close Reset information' && w.part && closed, {w, closed}];
  });
  // ---- G06 Use (Great Destiny) ----
  await goTo(page, 'Adv & Disadv');
  await check('BN-DESTINY-USE-PHONE', async () => {
    const use = await page.evaluate(() => { const d = window.BNH.entry('advList', 'Great Destiny');
      return window.BNH.read(Array.from(d.querySelectorAll('.dsx4532-btn')).find(b => b.textContent === 'Use')); });
    return [use.text === 'Use' && use.spoken === DESTINY_USE, use];
  });
  // ---- G05, G07 and G04's shared window ----
  await check('BN-WINDOW-WORDS-PHONE', async () => {
    await goTo(page, 'Techniques');
    await press(page, phone, page.locator('#kihoRulesInfoBtn'));
    const kiho = await page.evaluate(() => ({ok: window.BNH.byId('appConfirmOk'), x: window.BNH.byId('appConfirmX'), title: document.getElementById('appConfirmTitle').textContent}));
    await press(page, phone, button(page, 'OK'));
    await page.evaluate(m => { window.__bnhAsk = window.__L5R_TEST__.BN15.window.confirm(m, 'Yes', 'ghost', 'No'); }, BONUS);
    await settle(page);
    const bonus = await page.evaluate(() => ({ok: window.BNH.byId('appConfirmOk'), cancel: window.BNH.byId('appConfirmCancel'), x: window.BNH.byId('appConfirmX')}));
    await press(page, phone, button(page, 'Confirm'));
    const bonusAnswer = await page.evaluate(() => window.__bnhAsk);
    await page.evaluate(m => { window.__bnhAsk = window.__L5R_TEST__.BN15.window.confirm3(m, 'Spend a Void Point', 'ghost', 'Take a point of Taint'); }, ATARASI);
    await settle(page);
    const atarasi = await page.evaluate(() => ({ok: window.BNH.byId('appConfirmOk'), cancel: window.BNH.byId('appConfirmCancel'), x: window.BNH.byId('appConfirmX')}));
    await press(page, phone, button(page, 'Cancel question'));
    const atarasiAnswer = await page.evaluate(() => window.__bnhAsk);
    return [kiho.ok.text === 'OK' && kiho.ok.spoken === 'OK' && kiho.x.spoken === 'Close notice' && kiho.title === 'Notice' &&
      bonus.ok.text === 'Confirm' && bonus.cancel.text === 'Cancel' && bonus.x.spoken === 'Cancel question' && bonusAnswer === true &&
      atarasi.ok.text === 'Spend Void' && atarasi.cancel.text === 'Take a point of Taint' && atarasi.x.spoken === 'Cancel question' && atarasiAnswer === null,
      {kiho, bonus, bonusAnswer, atarasi, atarasiAnswer}];
  });
  // ---- G08 Reroll ----
  await goTo(page, 'Skills');
  await check('BN-REROLL-PHONE', async () => {
    await rollOnes(page, phone, 1);
    const first = await page.evaluate(() => ({btn: window.BNH.byId('emphasisRerollBtn'),
      luck: window.BNH.read(document.querySelector('#rollModalBody .adv-config-spend-luck')),
      unlucky: Array.from(document.querySelectorAll('#rollModalBody button')).map(b => b.textContent.trim()).find(t => /Unlucky/.test(t)) || null}));
    await press(page, phone, button(page, 'Reroll 1s'));
    const mid = await page.evaluate(() => window.BNH.byId('emphasisRerollConfirm'));
    await press(page, phone, page.locator('#rollDiceRow .roll-die.emph-eligible').first());
    const picked = await page.evaluate(() => ({confirm: window.BNH.byId('emphasisRerollConfirm'), note: document.querySelector('#emphasisRerollBar .emph-reroll-note').textContent}));
    await press(page, phone, button(page, 'Reroll selected'));
    const done = await page.evaluate(() => document.getElementById('emphasisRerollBar').textContent);
    return [first.btn.text === 'Reroll 1s' && first.luck.text === 'Reroll with Luck (3/3)' && first.luck.spoken === LUCK_SPOKEN(3, 3) &&
      /^GM invokes Unlucky/.test(first.unlucky || '') && mid.text === 'Reroll selected' && picked.confirm.text === 'Reroll selected' &&
      picked.confirm.disabled === false && /Selected 1 of/.test(picked.note) && /re-roll used/.test(done), {first, mid, picked, done}];
  });
  await check('BN-LUCK-PRESS-PHONE', async () => {
    await press(page, phone, button(page, LUCK_SPOKEN(3, 3)));
    const after = await page.evaluate(() => ({remaining: ((window.__L5R_TEST__.collectData().adv.find(a => a.name === 'Luck') || {}).config || {}).remaining,
      words: Array.from(document.querySelectorAll('#rollModalBody button')).map(b => b.textContent.trim())}));
    await closeWindows(page); await settle(page);
    return [after.remaining === 2 && !after.words.some(w => /Spend Luck|Re-roll/.test(w)), after];
  });
  // ---- G03 Remove, G10 + Add Emphasis, G02 Change and Choose… (Manage) ----
  await mode(page, 'management'); await goTo(page, 'Skills');
  await check('BN-REMOVE-PHONE', async () => {
    const got = await page.evaluate(() => {
      const H = window.BNH, out = {};
      const rows = (sel, nameSel) => Array.from(document.querySelectorAll(sel)).map(r => [r.querySelector(nameSel).value.trim(), H.spoken(r.querySelector(':scope .rm-btn:not(.emph-item-del)'))]);
      out.skills = rows('#skillsBody > tr', '.sk-name');
      out.weapons = rows('#weaponsBody > tr', '.wp-name');
      out.items = rows('#equipBody > tr', '.eq-name');
      out.entries = ['advList', 'disadvList', 'techList'].map(l => Array.from(document.querySelectorAll('#' + l + ' .entry')).map(d => [d.querySelector('.en-name').value.trim(),
        H.spoken(Array.from(d.querySelectorAll('.rm-btn')).find(b => b.closest('.entry') === d))]));
      out.emph = Array.from(document.querySelectorAll('#skillsBody .emph-item-del')).map(b => [b.textContent.trim(), H.spoken(b)]);
      return out;
    });
    const all = got.skills.concat(got.weapons, got.items, ...got.entries);
    return [all.length > 30 && all.every(([n, s]) => s === 'Remove ' + n) && got.emph.length > 0 && got.emph.every(e => e[0] === '✕' && e[1] === 'Remove Emphasis'), got];
  });
  await check('BN-REMOVE-FOLLOWS-PHONE', async () => {
    await goTo(page, 'Equipment');
    const item = page.locator('#equipBody > tr').first().locator('.eq-name');
    await item.fill('Silk Robes');
    const renamed = await page.evaluate(() => window.BNH.spoken(document.querySelector('#equipBody > tr .rm-btn')));
    const before = await page.evaluate(() => document.querySelectorAll('#equipBody > tr').length);
    await press(page, phone, button(page, 'Remove Silk Robes'));
    const after = await page.evaluate(() => ({rows: document.querySelectorAll('#equipBody > tr').length, first: document.querySelector('#equipBody > tr .eq-name').value}));
    return [renamed === 'Remove Silk Robes' && after.rows === before - 1 && after.first !== 'Silk Robes', {renamed, before, after}];
  });
  await check('BN-EMPHASIS-PHONE', async () => {
    await goTo(page, 'Skills');
    const got = await page.evaluate(() => Array.from(document.querySelectorAll('#skillsBody > tr')).map(tr => [tr.querySelector('.sk-name').value, window.BNH.read(tr.querySelector('.emph-add-btn'))]));
    const ok = got.every(([n, b]) => b.text === '+ Add Emphasis' && b.spoken === 'Add Emphasis to ' + n);
    // Pressing it on Defense (no Emphasis yet) still adds one.
    const before = await page.evaluate(() => document.querySelectorAll('#skillsBody > tr:nth-child(2) .emph-item-row').length);
    await press(page, phone, button(page, 'Add Emphasis to Defense'));
    const after = await page.evaluate(() => document.querySelectorAll('#skillsBody > tr:nth-child(2) .emph-item-row').length);
    return [ok && after === before + 1, {got, before, after}];
  });
  await goTo(page, 'Adv & Disadv');
  await check('BN-CHANGE-PHONE', async () => {
    const got = await page.evaluate(() => ['advList', 'disadvList'].map(l => Array.from(document.querySelectorAll('#' + l + ' .entry')).map(d =>
      [d.querySelector('.en-name').value, Array.from(d.querySelectorAll('.adv-config-btn')).map(b => window.BNH.read(b))]).filter(x => x[1].length)).flat());
    const want = name => name === 'Kharmic Tie' ? 'Change Kharmic Tie: person or Rank' : null;
    const ok = got.length >= 8 && got.every(([n, bs]) => bs.every(b => b.spoken === (want(n) || (b.text === 'Choose…' ? 'Choose ' : 'Change ') + n)));
    const wealthy = got.find(x => x[0] === 'Wealthy');
    // Choose Wealthy opens its window, whose ✕ is "Cancel" and its heading.
    await press(page, phone, button(page, 'Choose Wealthy'));
    const windowState = await page.evaluate(() => ({open: window.BNH.overlay('advConfigModalOverlay'), x: window.BNH.byId('advConfigX'),
      title: document.getElementById('advConfigTitle').textContent,
      explain: Array.from(document.querySelectorAll('#advConfigModalOverlay .adv-config-info')).map(b => window.BNH.spoken(b))}));
    await press(page, phone, button(page, 'Cancel ' + windowState.title));
    const closed = !(await shownOverlay(page, 'advConfigModalOverlay'));
    return [ok && !!wealthy && wealthy[1][0].text === 'Choose…' && windowState.open && windowState.x.spoken === 'Cancel ' + windowState.title &&
      windowState.explain.every(s => / information$/.test(s)) && closed, {got, windowState, closed}];
  });
  // ---- G12 i ----
  // With Release 15a A04 the i's are taken out of the button they explain and named for their entry ("Luck information");
  // without A04 they stay inside it and are named from its words ("Reset information", "Choose… information").
  await check('BN-INFO-PHONE', async () => {
    const got = await page.evaluate(() => {
      const H = window.BNH, d = H.entry('advList', 'Luck'), w = H.entry('advList', 'Wealthy');
      return {a04: !!window.__L5R_TEST__.IP15, luck: H.read(d.querySelector('.adv-config-info')), wealthy: w ? H.read(w.querySelector('.adv-config-info')) : null,
        all: Array.from(document.querySelectorAll('#advList .adv-config-info, #disadvList .adv-config-info')).map(b => H.spoken(b))};
    });
    await goTo(page, 'Clan & School');
    const anc = await page.evaluate(() => window.BNH.byId('anc48Info'));
    await press(page, phone, page.locator('#quickAccessToggleBtn'));
    const armor = await page.evaluate(() => window.BNH.byId('at15QaInfo'));
    const wound = await page.evaluate(() => window.__L5R_TEST__.WP15 ? window.__L5R_TEST__.WP15.LABEL : 'Wound penalty information');
    await press(page, phone, page.locator('#quickAccessToggleBtn'));
    return [got.luck.spoken === (got.a04 ? 'Luck information' : 'Reset information') && !!got.wealthy && got.wealthy.spoken === (got.a04 ? 'Wealthy information' : 'Choose… information') &&
      got.all.length >= 3 && got.all.every(s => / information$/.test(s)) && anc.spoken === 'Ancestors information' &&
      armor.spoken === 'Armor TN information' && wound === 'Wound penalty information', {got, anc, armor, wound}];
  });
  await check('BN-COMBAT-I-PHONE', async () => {
    // The stance tiles are a Play control.
    await mode(page, 'play'); await goTo(page, 'Combat');
    await page.evaluate(() => ['armorTnDetails', 'weaponsDetails', 'stanceDetails'].forEach(i => { const d = document.getElementById(i); if (d) d.open = true; }));
    await settle(page);
    const got = await page.evaluate(() => { const H = window.BNH;
      const one = el => ({spoken: H.spoken(el), look: H.ringLook(el), shown: H.shown(el)});
      return {tn: one(document.getElementById('combatTnInfoBtn')), attack: one(document.getElementById('combatAttackInfoBtn')),
        weapons: Array.from(document.querySelectorAll('#weaponsBody .wp-info-btn')).map(b => [b.closest('tr').querySelector('.wp-name').value, one(b)]),
        stances: Array.from(document.querySelectorAll('#stanceTiles .stance-tile')).map(t => [t.querySelector('.stance-name').textContent, one(t.querySelector('.stance-info-btn'))])}; });
    const ring = x => x.shown && x.look.w === 28 && x.look.h === 28 && x.look.radius === '50%' && x.look.font === '0px' && x.look.glyph === '"i"' && x.look.border === 'solid';
    // Pressing a stance's i still opens its rules, and the stance stays as it was.
    const stance = got.stances[0];
    const before = await page.evaluate(() => document.getElementById('combatStance').value);
    await press(page, phone, button(page, stance[1].spoken));
    const opened = await page.evaluate(() => ({open: window.BNH.overlay('stanceInfoOverlay'), title: document.getElementById('stanceInfoTitle').textContent, stance: document.getElementById('combatStance').value}));
    await closeWindows(page); await settle(page);
    return [got.tn.spoken === 'TN & Initiative information' && ring(got.tn) && got.attack.spoken === 'Attack & Damage information' && ring(got.attack) &&
      got.weapons.length > 0 && got.weapons.every(([n, x]) => x.spoken === n + ' information' && ring(x)) && got.stances.length === 5 &&
      got.stances.every(([n, x]) => x.spoken === n + ' stance information' && ring(x)) && opened.open && opened.stance === before, {got, opened, before}];
  });
  // ---- G14 − and + ----
  await check('BN-STEPPERS-PHONE', async () => {
    await goTo(page, 'Identity');
    const got = await page.evaluate(() => Array.from(document.querySelectorAll('#cp7-section .cp7-adjust button, .rp7-controls button, .ta7-controls button, .ring-card .stepbtn[data-ring]'))
      .filter(b => /^[−+]$/.test(b.textContent.trim())).map(b => window.BNH.spoken(b)));
    const want = [];
    ['Honour', 'Glory', 'Status', 'Taint'].forEach(t => want.push('Decrease ' + t + ' points', 'Increase ' + t + ' points'));
    ['Honour', 'Glory', 'Status'].forEach(t => want.push('Decrease ' + t + ' Rank', 'Increase ' + t + ' Rank', 'Decrease ' + t + ' points by one', 'Increase ' + t + ' points by one'));
    want.push('Decrease Taint Rank', 'Increase Taint Rank', 'Decrease Taint points by one', 'Increase Taint points by one', 'Decrease Void Ring', 'Increase Void Ring');
    const before = await page.evaluate(() => document.getElementById('f_honorPts').value);
    await press(page, phone, button(page, 'Increase Honour points'));
    const after = await page.evaluate(() => document.getElementById('f_honorPts').value);
    await press(page, phone, button(page, 'Decrease Honour points'));
    // The Arrows window's ticker.
    await page.evaluate(() => window.__L5R_TEST__.openArrowsPicker());
    await settle(page);
    const arrows = await page.evaluate(() => Array.from(document.querySelectorAll('#arrowsPickerList .arrow-pick-row')).slice(0, 3).map(r =>
      [r.querySelector('.arrow-pick-name').textContent, Array.from(r.querySelectorAll('.arrow-tick-btn')).map(b => window.BNH.spoken(b))]));
    await press(page, phone, button(page, 'Close Arrows'));
    return [same(got.slice().sort(), want.slice().sort()) && Number(after) > Number(before) &&
      arrows.length === 3 && arrows.every(([n, s]) => same(s, ['Decrease ' + n, 'Increase ' + n])), {got, before, after, arrows}];
  });
  // Release 15a A08 keeps a burst of quick taps on a card's − and + as one Undo; it still does with B18's names. Without
  // A08 the sheet's own Undo takes back the last tap only.
  await check('BN-QUICK-TAPS-ONE-UNDO-PHONE', async () => {
    await goTo(page, 'Identity');
    // Honour as Rank and points together (three points can carry it into the next Rank).
    const read = () => page.evaluate(() => { const f = window.__L5R_TEST__.collectData().fields; return Number(f.f_honorRank) * 10 + Number(f.f_honorPts); });
    const before = await read();
    const plus = button(page, 'Increase Honour points');
    await plus.scrollIntoViewIfNeeded();
    for (let i = 0; i < 3; i++) { await plus.tap(); await wait(150); }
    await settle(page);
    const after = await read();
    await page.locator('#cp7-undo').tap();
    await settle(page);
    const undone = await read();
    const a08 = await page.evaluate(() => !!window.__L5R_TEST__.QT15);
    return [after === before + 3 && undone === (a08 ? before : before + 2), {before, after, undone, a08}];
  });
  await check('BN-UNCHANGED-PHONE', async () => {
    await goTo(page, 'Adv & Disadv');
    const got = await page.evaluate(() => { const H = window.BNH, u = H.entry('disadvList', 'Unlucky'), dp = H.entry('advList', 'Dark Paragon');
      return {unlucky: Array.from(u.querySelectorAll('.unlucky-btn')).map(b => [b.textContent.trim(), H.spoken(b)]),
        wounds: [H.byId('woundStepDown').spoken, H.byId('woundStepUp').spoken],
        lostLove: H.read(Array.from(H.entry('disadvList', 'Lost Love').querySelectorAll('button')).find(b => /Spend Void/.test(b.textContent))),
        dpInfo: H.spoken(dp.querySelector('.dp4523-info'))}; });
    return [same(got.unlucky.slice(0, 2), [['−', 'Record an Unlucky use the GM forced away from the sheet'], ['+', 'Give back an Unlucky use recorded by mistake']]) &&
      same(got.wounds, ['Decrease wounds taken by 1', 'Increase wounds taken by 1']) && got.lostLove.text === 'Steady yourself — Spend Void' &&
      got.dpInfo === 'Dark Paragon information', got];
  });
  // ---- G04 the corner ✕ ----
  await check('BN-CORNERS-PHONE', async () => {
    const fixed = await page.evaluate(ids => ids.map(id => [id, window.BNH.spoken(document.getElementById(id))]), Object.keys(CORNERS_FIXED));
    const titled = await page.evaluate(list => list.map(([id, verb, head, tail]) => { const x = document.getElementById(id);
      const h = head ? document.getElementById(head) : x.closest('.roll-modal-overlay').querySelector('h3');
      return [id, window.BNH.spoken(x), verb + ' ' + h.textContent.replace(/\s+/g, ' ').trim() + tail]; }), CORNERS_TITLED);
    // Opened windows, closed by the ✕'s spoken name.
    await goTo(page, 'Skills');
    await press(page, phone, page.locator('#skillsBody > tr:nth-child(1) .sk-info-btn'));
    const skillTitle = await page.evaluate(() => document.getElementById('skillInfoTitle').textContent.trim());
    await press(page, phone, button(page, 'Close ' + skillTitle + ' information'));
    const skillClosed = !(await shownOverlay(page, 'skillInfoModalOverlay'));
    await press(page, phone, page.locator('#skillsBody > tr:nth-child(1) .sk-roll'));
    await press(page, phone, button(page, 'Cancel Before you roll'));
    const previewClosed = !(await shownOverlay(page, 'rollPreviewOverlay'));
    await press(page, phone, page.locator('#floatingDiceBtn'));
    const clear = await page.evaluate(() => [window.BNH.byId('dicePickerClear'), window.BNH.byId('otherDiceClear')]);
    await press(page, phone, button(page, 'Close Manual Roll'));
    const trayClosed = !(await shownOverlay(page, 'manualRollPromptOverlay'));
    return [fixed.every(([id, s]) => s === CORNERS_FIXED[id]) && titled.every(([, s, want]) => s === want) && skillClosed && previewClosed &&
      clear[0].text === 'Clear' && clear[0].spoken === 'Clear the dice' && clear[1].text === 'Clear' && clear[1].spoken === 'Clear the other dice' && trayClosed,
      {fixed, titled, skillTitle, skillClosed, previewClosed, clear, trayClosed}];
  });
  await check('BN-NOTHING-OLD-LEFT-PHONE', async () => {
    const pages = [];
    for (const m of ['play', 'management']) {
      await mode(page, m);
      await page.evaluate(() => window.__L5R_TEST__.recalcAll());
      await settle(page);
      pages.push([m, await leftovers(page)]);
    }
    return [pages.every(([, l]) => l.length === 0), pages];
  });
  await check('BN-NO-ERRORS-PHONE', async () => [errors.length === 0, errors]);
  await context.close();
  return errors;
}

async function phoneOthers(browser, F) {
  const errors = [];
  const phone = true;
  // ---- G06 Use: the Seppun Ancestor ----
  {
    const {context, page, errors: e} = await open(browser, DEVICES.PHONE, F.imperial);
    await mode(page, 'play'); await goTo(page, 'Clan & School');
    await check('BN-USE-PHONE', async () => {
      const card = await page.evaluate(() => ({use: window.BNH.byId('anc48UseNow'), reset: window.BNH.byId('anc48ResetSession'),
        notes: Array.from(document.querySelectorAll('#anc48Section .anc48-gift-note')).map(n => n.textContent)}));
      await press(page, phone, button(page, SEPPUN_USE));
      const asked = await page.evaluate(() => ({ok: window.BNH.byId('appConfirmOk'), cancel: window.BNH.byId('appConfirmCancel'), x: window.BNH.byId('appConfirmX')}));
      await press(page, phone, button(page, 'Cancel'));
      // The next message's OK is heard as its words again.
      await goTo(page, 'Techniques');
      await press(page, phone, page.locator('#kihoRulesInfoBtn'));
      const next = await page.evaluate(() => window.BNH.byId('appConfirmOk'));
      await press(page, phone, button(page, 'OK'));
      return [card.use.text === 'Use' && card.use.spoken === SEPPUN_USE && card.reset.text === 'Reset' &&
        card.notes.some(n => n.includes('press “Use” on this card')) && !card.notes.some(n => /Use it now/.test(n)) &&
        asked.ok.text === 'Use' && asked.ok.spoken === SEPPUN_USE && asked.cancel.text === 'Cancel' && asked.x.spoken === 'Cancel question' &&
        next.text === 'OK' && next.spoken === 'OK', {card, asked, next}];
    });
    errors.push(...e);
    await context.close();
  }
  // ---- G08: Toku's and Kakita's rerolls ----
  {
    const {context, page, errors: e} = await open(browser, DEVICES.PHONE, F.toku);
    await mode(page, 'play'); await goTo(page, 'Skills');
    await check('BN-TOKU-PHONE', async () => {
      await rollOnes(page, phone, 1);
      const b = await page.evaluate(() => window.BNH.read(document.querySelector('#rollModalBody .anc48-after-btn')));
      await closeWindows(page); await settle(page);
      return [!!b && b.text === 'Reroll with Toku’s Luck (1/1)' && b.spoken === 'Reroll with Toku’s Luck (1/1)', b];
    });
    errors.push(...e);
    await context.close();
  }
  {
    const {context, page, errors: e} = await open(browser, DEVICES.PHONE, F.kakita);
    await mode(page, 'management'); await goTo(page, 'Skills');
    await check('BN-KAKITA-PHONE', async () => {
      // An Iaijutsu row, added the way the Skills picker adds one.
      await page.evaluate(() => { const s = document.getElementById('skillQuickAdd'); s.value = 'Iaijutsu'; s.dispatchEvent(new Event('change', {bubbles: true})); });
      await settle(page);
      const row = await page.evaluate(() => Array.from(document.querySelectorAll('#skillsBody > tr')).findIndex(tr => tr.querySelector('.sk-name').value === 'Iaijutsu') + 1);
      await page.evaluate(r => { const i = document.querySelector('#skillsBody > tr:nth-child(' + r + ') .sk-rank'); i.value = 2; i.dispatchEvent(new Event('input', {bubbles: true})); }, row);
      await mode(page, 'play');
      await rollOnes(page, phone, row);
      const b = await page.evaluate(() => window.BNH.read(document.querySelector('#rollModalBody .anc48-after-btn')));
      await closeWindows(page); await settle(page);
      return [row > 0 && !!b && /^Reroll with Kakita \(/.test(b.text) && !/Re-roll/.test(b.text), {row, b}];
    });
    errors.push(...e);
    await context.close();
  }
  // ---- G10: the court window's + Add court ----
  {
    const {context, page, errors: e} = await open(browser, DEVICES.PHONE, F.court);
    await mode(page, 'management'); await goTo(page, 'Adv & Disadv');
    await check('BN-COURT-PHONE', async () => {
      await press(page, phone, button(page, 'Change Darling of the Court'));
      const add = await page.evaluate(() => window.BNH.read(document.querySelector('#advConfigGrid .court4514-add')));
      const before = await page.evaluate(() => document.querySelectorAll('#advConfigGrid .court4514-item').length);
      await press(page, phone, page.locator('#advConfigGrid .court4514-add'));
      const after = await page.evaluate(() => document.querySelectorAll('#advConfigGrid .court4514-item').length);
      const x = await page.evaluate(() => window.BNH.byId('advConfigX'));
      await press(page, phone, button(page, 'Cancel Darling of the Court'));
      return [add.text === '+ Add court' && after === before + 1 && x.spoken === 'Cancel Darling of the Court', {add, before, after, x}];
    });
    errors.push(...e);
    await context.close();
  }
  // ---- G10 + Add Book, G16 Export PDF: the Characters screen ----
  {
    const {context, page, errors: e} = await open(browser, DEVICES.PHONE, F.sessions);
    await check('BN-BOOK-PHONE', async () => {
      await page.evaluate(async () => { await window.__L5R_TEST__.CL11.open('library'); });
      await settle(page); await wait(300);
      const plus = await page.evaluate(() => window.BNH.byId('l13Add'));
      return [!!plus && plus.text === '+ Add Book' && plus.spoken === 'Add Book' && plus.shown, plus];
    });
    await check('BN-PDF-PHONE', async () => {
      await page.evaluate(() => window.__L5R_TEST__.CL11.close());
      await settle(page);
      await press(page, phone, page.locator('#btnSave'));
      await wait(500);
      await page.evaluate(async () => { await window.__L5R_TEST__.CL11.open('characters'); });
      await settle(page); await wait(300);
      const menus = await page.evaluate(() => Array.from(document.querySelectorAll('.cl11-menu')).map(m => Array.from(m.children).map(x => x.textContent.trim())));
      return [menus.length > 0 && menus.every(m => m.includes('Export PDF') && !m.includes('Export to PDF') && m.indexOf('Export PDF') === m.indexOf('Export JSON') + 1), menus];
    });
    errors.push(...e);
    await context.close();
  }
  // ---- G02: the creation wizard's Change ----
  {
    const {context, page, errors: e} = await open(browser, DEVICES.PHONE, null);
    await check('BN-WIZARD-PHONE', async () => {
      const next = async () => { await page.waitForFunction(() => !document.getElementById('cw112Next').disabled); await page.click('#cw112Next'); };
      const title = () => page.evaluate(() => document.getElementById('cw112Title').textContent);
      const pick = async text => page.locator('#cw112Body .cw112-card').filter({has: page.locator('.cw112-card-title', {hasText: new RegExp('^' + text + '$')})}).first().click();
      await page.evaluate(() => window.__L5R_TEST__.CW112.open ? window.__L5R_TEST__.CW112.open() : window.__L5R_TEST__.CL11.createNew());
      await page.waitForFunction(() => !document.getElementById('cw112View').hidden);
      await page.fill('#cw112Name', 'Hida Kenji'); await next();
      await pick('Crab'); await next();
      await pick('Hida'); await next();
      await pick('Hida Bushi');
      await page.waitForFunction(() => window.__L5R_TEST__.CW112.appliedSchool() === 'Hida Bushi' && !window.__L5R_TEST__.CW112.busy);
      for (let i = 0; i < 6 && (await title()) !== 'Skills'; i++) await next();
      const slot = await page.evaluate(() => { const s = document.getElementById('cw1121Slot0Pick'); return s ? Array.from(s.options).map(o => o.value).filter(Boolean)[0] : null; });
      await page.selectOption('#cw1121Slot0Pick', slot);
      const subject = page.locator('#cw1121Slot0Subject');
      if (await subject.isVisible()) await subject.fill('History');
      await page.click('#cw1121Slot0Add');
      await settle(page);
      const undo = await page.evaluate(() => window.BNH.read(document.querySelector('.cw1121-slot[data-slot="0"] .cw1121-undo')));
      await page.locator('.cw1121-slot[data-slot="0"] .cw1121-undo').click();
      await settle(page);
      const back = await page.evaluate(() => !!document.getElementById('cw1121Slot0Pick'));
      return [(await title()) === 'Skills' && !!undo && undo.text === 'Change' && back, {slot, undo, back}];
    });
    errors.push(...e);
    await context.close();
  }
  await check('BN-NO-ERRORS-OTHERS-PHONE', async () => [errors.length === 0, errors]);
}

async function desktop(browser, F) {
  const {context, page, errors} = await open(browser, DEVICES.DESKTOP, F.sessions);
  const phone = false;
  await mode(page, 'play'); await goTo(page, 'Adv & Disadv');
  await check('BN-RESET-DESKTOP', async () => {
    const got = await page.evaluate(R => R.map(([l, n]) => [n, window.BNH.read(window.BNH.resetOf(l, n))]), RESETS);
    await goTo(page, 'Clan & School');
    const anc = await page.evaluate(() => window.BNH.byId('anc48ResetSession'));
    return [got.every(([n, r]) => r && r.text === 'Reset' && r.spoken === resetSpoken(n) && r.shown) && anc.text === 'Reset' && anc.spoken === ANCESTOR_RESET, {got, anc}];
  });
  await check('BN-COMBAT-I-DESKTOP', async () => {
    await goTo(page, 'Combat');
    await page.evaluate(() => ['armorTnDetails', 'weaponsDetails', 'stanceDetails'].forEach(i => { const d = document.getElementById(i); if (d) d.open = true; }));
    await settle(page);
    const got = await page.evaluate(() => Array.from(document.querySelectorAll('#combatTnInfoBtn, #combatAttackInfoBtn, #weaponsBody .wp-info-btn, #stanceTiles .stance-info-btn'))
      .map(b => ({spoken: window.BNH.spoken(b), look: window.BNH.ringLook(b)})));
    return [got.length === 8 && got.every(x => / information$/.test(x.spoken) && x.look.w === 28 && x.look.h === 28 && x.look.radius === '50%' && x.look.glyph === '"i"'), got];
  });
  await check('BN-WINDOWS-DESKTOP', async () => {
    await goTo(page, 'Skills');
    await press(page, phone, page.locator('#skillsBody > tr:nth-child(1) .sk-roll'));
    await press(page, phone, button(page, 'Cancel Before you roll'));
    const previewClosed = !(await shownOverlay(page, 'rollPreviewOverlay'));
    await rollOnes(page, phone, 1);
    const result = await page.evaluate(() => ({title: document.getElementById('rollModalTitle').textContent.trim(), btn: window.BNH.byId('emphasisRerollBtn')}));
    await press(page, phone, button(page, 'Close ' + result.title));
    const resultClosed = !(await shownOverlay(page, 'rollModalOverlay'));
    await goTo(page, 'Techniques');
    await press(page, phone, page.locator('#kihoRulesInfoBtn'));
    const ok = await page.evaluate(() => window.BNH.byId('appConfirmOk'));
    await press(page, phone, button(page, 'Close notice'));
    return [previewClosed && result.btn.text === 'Reroll 1s' && resultClosed && ok.text === 'OK' && !(await shownOverlay(page, 'appConfirmOverlay')), {previewClosed, result, resultClosed, ok}];
  });
  await check('BN-NOTHING-OLD-LEFT-DESKTOP', async () => {
    await mode(page, 'management'); await page.evaluate(() => window.__L5R_TEST__.recalcAll()); await settle(page);
    const l = await leftovers(page);
    return [l.length === 0, l];
  });
  await check('BN-NO-ERRORS-DESKTOP', async () => [errors.length === 0, errors]);
  await context.close();
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'l5r-b18-'));
  const F = fixtures(dir);
  const browser = await chromium.launch();
  try {
    await phoneSessions(browser, F);
    await phoneOthers(browser, F);
    await desktop(browser, F);
  } finally {
    await browser.close();
    fs.rmSync(dir, {recursive: true, force: true});
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
