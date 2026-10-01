/*
 * Phase 4.8 (Part I), Ancestors: real-browser acceptance. The input HTML is read only.
 *   node ancestors-harness.js <sheet.html> [--absent] [--no-rolls] [--no-declare] [--no-modes] [--no-wizard]
 *
 * Oracles are the books' pages as the owner photographed them on 30 September 2026: Core Rulebook
 * pp. 241-244, The Great Clans (pp. 42, 104, 140, 170, 202, 230, 260, 283) and Secrets of the Empire
 * pp. 243-247. Each Ancestor's faction, cost, page and dice below are written here from the books,
 * never read from ANC48. Pools are checked two ways: the pipeline's own modifier list, and REAL rolls
 * through the preview whose rendered dice are counted. Experience, damage, Armor TN and Void Points
 * are read from the sheet's own fields and functions, before and after. Where a result depends on
 * the dice, Math.random is held at one value for that roll only (0.05 is a 1 on every die, 0.85 a 9;
 * nothing at or above 0.9, which would explode for ever).
 *
 * The circled i is compared with Feature 4.54's own .adv-config-info (Part I), the owner's standard,
 * computed style by computed style: that oracle belongs to another phase.
 *
 * --absent     this part removed or ANCESTORS_ENABLED off: no Ancestor block, and a save that
 *              carries an Ancestor changes nothing.
 * --no-rolls   Phase 4.5's roll effects off (ADV_CONFIG_ROLL_EFFECTS_ENABLED): no roll bonus, no tick
 *              and nothing after the roll; card, cost, damage and Armor TN unchanged.
 * --no-declare Feature 4.5.15's registry off: automatic bonuses and the after-roll gifts stay, nothing
 *              is offered to tick, so nothing is paid for.
 * --no-modes   Phase 12's modes off: the Play-mode checks are skipped.
 * --no-wizard  Phase 11.2's wizard off: the wizard checks are skipped.
 * Every scenario declares its assertion identities first, so an exception fails what it did not reach.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const absent = process.argv.includes('--absent');
const noRolls = process.argv.includes('--no-rolls');
const noDeclare = process.argv.includes('--no-declare') || noRolls;
const noModes = process.argv.includes('--no-modes');
const noWizard = process.argv.includes('--no-wizard');
const results = [];
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
function record(id, actual, expected, detail = '') {
  if (results.some(r => r.id === id)) throw new Error('duplicate assertion ' + id);
  const pass = same(actual, expected);
  results.push({ id, pass });
  const show = v => String(JSON.stringify(v)).slice(0, 600);
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : '\n expected ' + show(expected)
    + '\n actual ' + show(actual)) + (detail ? '\n ' + detail : ''));
}
let PAGE = null;
async function scenario(prefix, names, run) {
  const ids = names.map(n => 'ANC48-' + prefix + '-' + n);
  const check = (n, a, e = true) => {
    const id = 'ANC48-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e);
  };
  let error = '';
  try { await run(check); } catch (e) { error = String(e.stack || e).split('\n').slice(0, 5).join('\n'); }
  for (const id of ids) if (!results.some(r => r.id === id)) record(id, 'not reached', 'completed', error);
  if (PAGE) await closeAll(PAGE);
}
// Marks every named check as not applicable to this boundary build: passed, and said so.
const skipAll = (check, names) => names.forEach(n => check(n, true));

// ---- The books, in printed order: [name, faction, cost, book, page] ----
const CORE = 'Core Rulebook', GC = 'The Great Clans', SOTE = 'Secrets of the Empire';
const BOOK = [
  ['Hida', 'Crab', 14, CORE, 'p. 242'], ['Kuni', 'Crab', 8, CORE, 'p. 242'], ['Doji', 'Crane', 8, CORE, 'p. 242'],
  ['Kakita', 'Crane', 12, CORE, 'p. 242'], ['Agasha Kitsuki', 'Dragon', 11, CORE, 'p. 242'], ['Mirumoto', 'Dragon', 9, CORE, 'p. 242'],
  ['Akodo', 'Lion', 12, CORE, 'pp. 242–243'], ['Ikoma', 'Lion', 9, CORE, 'p. 243'], ['Kaimetsu-Uo', 'Mantis', 9, CORE, 'p. 243'],
  ['Gusai', 'Mantis', 5, CORE, 'p. 243'], ['Asako', 'Phoenix', 5, CORE, 'p. 243'], ['Shiba', 'Phoenix', 9, CORE, 'p. 243'],
  ['Bayushi', 'Scorpion', 12, CORE, 'pp. 243–244'], ['Shosuro', 'Scorpion', 8, CORE, 'p. 244'], ['Hida Atarasi', 'Spider', 7, CORE, 'p. 244'],
  ['Kuni Yori', 'Spider', 5, CORE, 'p. 244'], ['Moto', 'Unicorn', 10, CORE, 'p. 244'], ['Shinjo', 'Unicorn', 8, CORE, 'p. 244'],
  ['Hiruma', 'Crab', 11, GC, 'p. 42'], ['Kaiu', 'Crab', 9, GC, 'p. 42'], ['Agasha', 'Dragon', 6, GC, 'p. 104'],
  ['Agasha, most favoured', 'Dragon', 10, GC, 'p. 104'], ['Togashi Yamatsu', 'Dragon', 7, GC, 'p. 104'], ['Kitsu', 'Lion', 6, GC, 'p. 140'],
  ['Matsu Hitomi', 'Lion', 7, GC, 'p. 140'], ['Moshi Azami', 'Mantis', 6, GC, 'p. 170'], ['Osusuki & Akomachi', 'Mantis', 5, GC, 'p. 170'],
  ['Isawa', 'Phoenix', 12, GC, 'p. 202'], ['Naka Kaeteru', 'Phoenix', 10, GC, 'p. 202'], ['Yogo', 'Scorpion', 6, GC, 'p. 230'],
  ['Soshi Saibankan', 'Scorpion', 5, GC, 'p. 230'], ['Otaku', 'Unicorn', 7, GC, 'p. 260'], ['Iuchi', 'Unicorn', 8, GC, 'p. 260'],
  ['Chuda Bikimi', 'Spider', 3, GC, 'p. 283'], ['Yogo Junzo', 'Spider', 6, GC, 'p. 283'],
  ['Otomo', 'Imperial', 6, SOTE, 'p. 243'], ['Seppun', 'Imperial', 10, SOTE, 'p. 243'], ['Miya', 'Imperial', 5, SOTE, 'p. 244'],
  ['Ichiro Fureheshu', 'Badger', 9, SOTE, 'p. 244'], ['Komori Iongi', 'Bat', 5, SOTE, 'p. 244'], ['Hida Heichi', 'Boar', 4, SOTE, 'p. 244'],
  ['Tonbo Kuyuden', 'Dragonfly', 3, SOTE, 'p. 244'], ['Usagi Reichin', 'Hare', 7, SOTE, 'p. 244'], ['Toku', 'Monkey', 3, SOTE, 'pp. 244–245'],
  ['Tsi', 'Oriole', 6, SOTE, 'p. 245'], ['Morito Garin', 'Ox', 5, SOTE, 'p. 245'], ['Doji Suzume', 'Sparrow', 4, SOTE, 'p. 245'],
  ['Agasha Kasuga', 'Tortoise', 5, SOTE, 'p. 245'], ['Sun Tao', 'Ronin', 10, SOTE, 'p. 246'], ['Chiroru', 'Ronin', 8, SOTE, 'p. 246'],
  ['Miyuko', 'Ronin', 12, SOTE, 'p. 246'], ['Basso', 'Brotherhood of Shinsei', 9, SOTE, 'p. 247'], ['Sakura', 'Brotherhood of Shinsei', 10, SOTE, 'p. 247'],
  ['Mizumoto', 'Brotherhood of Shinsei', 7, SOTE, 'p. 247'], ['Togashi Kaze', 'Brotherhood of Shinsei', 5, SOTE, 'p. 247']];
const COST = Object.fromEntries(BOOK.map(b => [b[0], b[2]]));
const SPIDER = ['Hida Atarasi', 'Kuni Yori', 'Chuda Bikimi', 'Yogo Junzo'];
const BADGE = 'Lost ancestor’s favour';
// A listed Wards spell, and a listed spell that is not one, both from the sheet's spell library.
const WARDS = 'Freedom of the Air', NOT_WARDS = "Arrow's Flight";

async function closeAll(page) {
  await page.evaluate(() => {
    if (window.__anc48Random) { Math.random = window.__anc48Random; delete window.__anc48Random; }
    ['rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay', 'stanceInfoOverlay']
      .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    if (T && T.CW112 && T.CW112.view && !T.CW112.view.hidden) T.CW112.close();
    if (T && T.MODES12) T.MODES12.set('management');
  }).catch(() => {});
}
async function open(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return !!T && !!window.__L5R_CAROUSEL__?.isReady?.()
    && (!T.CL11 || T.CL11.ready || T.CL11.enabled() === false); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
  await page.waitForTimeout(150);
  return page;
}
// A fresh character: Clan (as Apply Family records it), Family, Schools, Honor, Taint, Traits, Void
// Points, Skill rows, Advantages and Disadvantages, and whether a skirmish is running. The Clan &
// School picker is left empty unless named, so it adds no faction of its own.
const setup = (p, o = {}) => p.evaluate(o => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.resetToBaseline();
  $('cfs_clan').value = o.picker || '';
  $('cfs_clan').dispatchEvent(new Event('change'));
  $('f_clan').value = o.clan || '';
  $('f_family').value = o.family || '';
  const schools = o.schools || (o.school ? [o.school] : []);
  T.saveSchoolsList(schools.map(name => ({ name, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 })));
  if (o.honor !== undefined) $('f_honorPts').value = String(o.honor);
  if (o.taint !== undefined) $('f_taint').value = String(o.taint);
  Object.entries(o.traits || {}).forEach(([k, v]) => { $('trait_' + k).value = String(v); });
  if (o.xpTotal !== undefined) $('f_xpTotal').value = String(o.xpTotal);
  (o.skills || []).forEach(s => $('skillsBody').appendChild(T.makeSkillRow({ name: s[0], trait: s[1], rank: s[2] })));
  (o.advs || []).forEach(n => $('advList').appendChild(T.makeEntry({ name: n, cost: 0 }, true)));
  (o.disadvs || []).forEach(n => $('disadvList').appendChild(T.makeEntry({ name: n, cost: 0 }, true)));
  T.setVoidPending({});
  T.resetCombatRound();
  T.setCombatActive(!!o.combat);
  T.recalcAll();
  if (o.voidRing !== undefined) { $('ring_void').value = String(o.voidRing); T.recalcAll(); }
  if (o.voids !== undefined) { $('void_current').value = String(o.voids); T.renderVoidPips(); }
  if (o.roundVoid) T.recordRoundSpend('void', 'k1');
  T.recalcAll();
}, o);
const choose = (p, name) => p.evaluate(n => window.__L5R_TEST__.ANC48.choose(n), name);
const state = p => p.evaluate(() => { const f = document.getElementById('f_ancestor'); return f && f.value ? JSON.parse(f.value) : null; });
const xp = p => p.evaluate(() => ({ spent: Number(document.getElementById('f_xpSpent').value), remain: Number(document.getElementById('f_xpRemain').value) }));
const voids = p => p.evaluate(() => Number(document.getElementById('void_current').value));
// Choose through the sheet's own picker, answering the Spider confirmation when it appears.
async function pick(p, name, answer = true) {
  await p.evaluate(() => window.__L5R_CAROUSEL__?.goToTab?.('Clan & School'));
  await p.evaluate(n => { const s = document.getElementById('anc48Pick'); s.value = n; s.dispatchEvent(new Event('change', { bubbles: true })); }, name);
  await p.waitForTimeout(80);
  if (await p.evaluate(() => document.getElementById('appConfirmOverlay').style.display === 'flex')) {
    await p.locator(answer ? '#appConfirmOk' : '#appConfirmCancel').click();
    await p.waitForTimeout(80);
  }
}
// Press a card button and answer its confirmation (or its notice).
async function press(p, id, answer = 'ok') {
  await p.evaluate(() => window.__L5R_CAROUSEL__?.goToTab?.('Clan & School'));
  await p.evaluate(i => document.getElementById(i).click(), id);
  await p.waitForSelector('#appConfirmOverlay', { state: 'visible' });
  const message = await p.evaluate(() => document.getElementById('appConfirmMsg').textContent);
  await p.locator(answer === 'ok' ? '#appConfirmOk' : answer === 'x' ? '#appConfirmX' : '#appConfirmCancel').click();
  await p.waitForTimeout(80);
  return message;
}
const badge = (p, answer = true) => press(p, 'anc48Badge', answer ? 'ok' : 'cancel');
// The Ancestor's modifiers for a context, as [rolled, kept] (or [rolled, kept, total], or a display
// for a printed-only one), with the Void Point's +1k1 armed for the call when asked.
const mods = (p, kind, ctx, withVoid = false) => p.evaluate(({ kind, ctx, withVoid }) => { const T = window.__L5R_TEST__;
  const saved = T.getVoidPending(); if (withVoid) T.setVoidPending({ k1: true });
  try {
    return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(m => /^Ancestor/.test(m.label))
      .map(m => m.informational ? ['shown', m.display] : m.totalDelta ? [m.rolledDelta, m.keptDelta, m.totalDelta] : [m.rolledDelta, m.keptDelta]);
  } finally { T.setVoidPending(saved); } }, { kind, ctx, withVoid });
const offers = (p, kind, ctx, withVoid = false) => p.evaluate(({ kind, ctx, withVoid }) => { const T = window.__L5R_TEST__;
  const saved = T.getVoidPending(); if (withVoid) T.setVoidPending({ k1: true });
  try {
    return T.RD4515 ? T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(o => o.provider === 'ancestors').map(o => o.key.split(':')[1]) : [];
  } finally { T.setVoidPending(saved); } }, { kind, ctx, withVoid });
// Declared bonuses through the registry's own start/toggle, read back from the pipeline.
const declared = (p, kind, ctx, keys, withVoid = false) => p.evaluate(({ kind, ctx, keys, withVoid }) => { const T = window.__L5R_TEST__;
  const saved = T.getVoidPending(); if (withVoid) T.setVoidPending({ k1: true });
  try {
    const c = T.makeRollContext(T.ROLL_KINDS[kind], ctx);
    T.RD4515.start(c); keys.forEach(k => T.RD4515.toggle('ancestors:' + k, true));
    const out = T.getPreRollModifiers(c).filter(m => /^Ancestor/.test(m.label)).map(m => [m.rolledDelta, m.keptDelta]);
    T.RD4515.cancel(); return out.map(m => JSON.stringify(m)).sort().map(m => JSON.parse(m));
  } finally { T.setVoidPending(saved); } }, { kind, ctx, keys: [].concat(keys), withVoid });
// Holds Math.random at one value, or cycles through a list of values, until closeAll() (or the next
// hold) puts it back. Any three draws in a row from a list of three give the same three dice.
const hold = (p, value) => p.evaluate(v => { if (!window.__anc48Random) window.__anc48Random = Math.random;
  const seq = [].concat(v); let i = 0; Math.random = () => seq[i++ % seq.length]; }, value);
const release = p => p.evaluate(() => { if (window.__anc48Random) { Math.random = window.__anc48Random; delete window.__anc48Random; } });
// A REAL roll through the preview. Ticks the named declarations (and the Void Point's +1k1 when
// asked), presses Roll, answers any confirmation in order ('ok', 'cancel' or 'x'), and reports the
// rendered dice, or rolled:false when the roll was cancelled. The result stays open.
async function roll(p, kind, ctx, base, o = {}) {
  const pending = p.evaluate(({ kind, ctx, base, tn }) => { const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Ancestor probe', T.makeRollContext(T.ROLL_KINDS[kind], ctx), base[0], base[1],
      tn ? { tnConfig: { tn } } : undefined).then(r => !!r); }, { kind, ctx, base, tn: o.tn });
  pending.catch(() => {});
  await p.waitForSelector('#rollPreviewGo', { state: 'visible' });
  if (o.voidTick) await p.locator('#rollPreviewBody input[data-void-key="k1"]').check();
  for (const k of o.tick || []) await p.locator('#rollPreviewBody input[data-rd4515-key="ancestors:' + k + '"]').check();
  const preview = await p.evaluate(() => ({ go: document.getElementById('rollPreviewGo').textContent,
    keys: [...document.querySelectorAll('#rollPreviewBody [data-rd4515-key]')].map(i => i.getAttribute('data-rd4515-key').split(':')[1]),
    text: document.getElementById('rollPreviewBody').textContent }));
  if (o.random !== undefined) await hold(p, o.random);
  await p.locator('#rollPreviewGo').click();
  const messages = [];
  for (const answer of o.answers || []) {
    await p.waitForSelector('#appConfirmOverlay', { state: 'visible' });
    messages.push(await p.evaluate(() => document.getElementById('appConfirmMsg').textContent));
    await p.locator(answer === 'ok' ? '#appConfirmOk' : answer === 'x' ? '#appConfirmX' : '#appConfirmCancel').click();
    await p.waitForTimeout(60);
  }
  const rolled = await pending;
  if (rolled) await p.waitForSelector('#rollDiceRow .roll-die');
  await p.waitForTimeout(40);
  const r = await p.evaluate(() => ({ dice: document.querySelectorAll('#rollDiceRow .roll-die').length,
    kept: document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
    total: Number(document.getElementById('rollTotalDisplay')?.textContent || 0),
    title: document.getElementById('rollModalTitle').textContent,
    after: [...document.querySelectorAll('#rollModalBody .anc48-after')].map(b => b.dataset.anc48After) }));
  return Object.assign(r, { rolled, preview, messages });
}
const after = (p, key) => p.evaluate(k => { const b = document.querySelector('#rollModalBody [data-anc48-after="' + k + '"]');
  return b ? { text: b.textContent, disabled: b.querySelector('button').disabled } : null; }, key);
async function clickAfter(p, key, random) {
  if (random !== undefined) await hold(p, random);
  await p.locator('#rollModalBody [data-anc48-after="' + key + '"] button').click();
  await p.waitForTimeout(120);
  return p.evaluate(() => ({ dice: document.querySelectorAll('#rollDiceRow .roll-die').length,
    kept: document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
    total: Number(document.getElementById('rollTotalDisplay')?.textContent || 0),
    title: document.getElementById('rollModalTitle').textContent,
    outcome: (document.querySelector('#rollModalBody .anc48-outcome') || {}).textContent || '' }));
}
const dmg = (p, weapon) => p.evaluate(w => { const T = window.__L5R_TEST__;
  const e = T.WEAPON_LIBRARY.find(x => x.name === w); const d = T.getWeaponDamageDice(e, 0); return [d.numDice, d.keepDice]; }, weapon);
const tn = p => p.evaluate(() => Number(document.getElementById('f_currentTN').value));
const card = p => p.evaluate(() => { const c = document.getElementById('anc48Card');
  return c ? { hidden: c.hidden, cls: c.className, text: c.textContent, flags: [...c.querySelectorAll('.anc48-flag')].map(e => e.textContent),
    notes: [...c.querySelectorAll('.anc48-note')].map(e => e.textContent),
    session: c.querySelector('#anc48Session') ? c.querySelector('#anc48Session').textContent : null,
    badge: c.querySelector('#anc48Badge') ? { text: c.querySelector('#anc48Badge').textContent, pressed: c.querySelector('#anc48Badge').getAttribute('aria-pressed'),
      disabled: c.querySelector('#anc48Badge').disabled } : null } : null; });
const enabled = p => p.evaluate(() => [...document.getElementById('anc48Pick').options].filter(o => o.value && !o.disabled).map(o => o.value));
const groups = p => p.evaluate(() => [...document.getElementById('anc48Pick').querySelectorAll('optgroup')].map(g => g.label));

async function main() {
  if (!sheet) throw new Error('usage: node ancestors-harness.js <sheet.html> [flags]');
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  let page;
  try {
    page = await open(browser);
    PAGE = page;

    if (absent) {
      await scenario('ABSENT', ['NO-BLOCK', 'NO-FIELD', 'SAVE-IGNORED-XP', 'SAVE-IGNORED-DAMAGE', 'NO-WIZARD-BLOCK', 'NO-AFTER-BLOCK', 'NO-ERRORS'], async check => {
        check('NO-BLOCK', await page.evaluate(() => !document.getElementById('anc48Section')));
        check('NO-FIELD', await page.evaluate(() => !document.getElementById('f_ancestor')));
        await setup(page, { clan: 'Crab' });
        const before = await xp(page), katana = await dmg(page, 'Katana');
        await page.evaluate(() => { const T = window.__L5R_TEST__; const d = T.collectData();
          d.fields.f_ancestor = JSON.stringify({ v: 1, name: 'Hida', lost: false, regained: false, final: false, gm: false }); T.applyData(d); });
        check('SAVE-IGNORED-XP', await xp(page), before);
        check('SAVE-IGNORED-DAMAGE', await dmg(page, 'Katana'), katana);
        if (!noWizard) {
          await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; W.start(); W.index = W.steps.findIndex(s => s.id === 'family'); W.render(); });
          check('NO-WIZARD-BLOCK', await page.evaluate(() => !document.getElementById('anc48Wizard')));
          await closeAll(page);
        } else check('NO-WIZARD-BLOCK', true);
        await setup(page, { clan: 'Crane', voids: 2 });
        const r = await roll(page, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes' }, [4, 3]);
        check('NO-AFTER-BLOCK', r.after, []);
        check('NO-ERRORS', page.errors, []);
      });
      return;
    }

    await scenario('PLACE', ['IN-CLAN-TAB', 'AFTER-PICKERS', 'HIDDEN-FIELD', 'LABEL', 'NO-CARD-YET', 'NOT-AN-ADVANTAGE', 'INFO',
      'INFO-NO-TEXT', 'INFO-MATCHES-ADVANTAGES'], async check => {
      check('IN-CLAN-TAB', await page.evaluate(() => document.getElementById('anc48Section')?.closest('.car-page')?.dataset.tabLabel), 'Clan & School');
      check('AFTER-PICKERS', await page.evaluate(() => { const s = document.getElementById('anc48Section'), f = document.getElementById('cfs_family');
        return !!s && !!(f.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) && s.parentElement === f.closest('.section'); }));
      check('HIDDEN-FIELD', await page.evaluate(() => { const f = document.getElementById('f_ancestor'); return !!f && f.type === 'hidden' && f.value === ''; }));
      check('LABEL', await page.evaluate(() => document.querySelector('label[for="anc48Pick"]')?.textContent), 'Ancestor');
      check('NO-CARD-YET', await page.evaluate(() => document.getElementById('anc48Card').hidden));
      check('NOT-AN-ADVANTAGE', await page.evaluate(() => [...document.querySelectorAll('#advQuickAdd option')].some(o => /ancestor/i.test(o.value))), false);
      await page.evaluate(() => document.getElementById('anc48Info').click());
      check('INFO', await page.evaluate(() => { const b = document.getElementById('stanceInfoBody').textContent;
        return document.getElementById('stanceInfoOverlay').style.display === 'flex' && /Loyalty/.test(b) && /Piety/.test(b) && /Jealousy/.test(b)
          && /Demands/.test(b) && /Jigoku/.test(b) && /true ronin/.test(b) && /Brotherhood/.test(b); }));
      await closeAll(page);
      check('INFO-NO-TEXT', await page.evaluate(() => document.getElementById('anc48Info').textContent), '');
      // The owner's standard is the Advantages list's circled i (Feature 4.54): a button carrying its
      // class, placed on the Advantages tab, is the oracle. Every look-defining property must agree.
      const look = await page.evaluate(() => {
        const props = ['width', 'height', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'borderTopLeftRadius', 'backgroundColor',
          'color', 'fontFamily', 'fontSize', 'lineHeight', 'paddingTop', 'paddingLeft', 'textTransform', 'display'];
        const read = el => { const s = getComputedStyle(el), a = getComputedStyle(el, '::after');
          return Object.fromEntries(props.map(k => [k, s[k]]).concat([['after', a.content + '|' + a.fontStyle + '|' + a.fontWeight + '|' + a.textTransform]])); };
        const host = document.getElementById('advList');
        const standard = document.createElement('button');
        standard.type = 'button'; standard.className = 'adv-config-info';
        host.appendChild(standard);
        const a = read(document.getElementById('anc48Info')), b = read(standard);
        standard.remove();
        return { ancestor: a, advantages: b };
      });
      check('INFO-MATCHES-ADVANTAGES', look.ancestor, look.advantages);
    });

    await scenario('LIBRARY', ['ORDER', 'COSTS', 'CARD-PAGE', 'CARD-SECTIONS', 'CARD-FACTION'], async check => {
      // Every Ancestor, as its own faction sees it. The option text gives name and cost.
      const seen = [], cards = [];
      for (const [name, faction] of BOOK) {
        await setup(page, faction === 'Brotherhood of Shinsei' ? { picker: faction } : { clan: faction });
        const option = await page.evaluate(n => { const o = [...document.getElementById('anc48Pick').options].find(x => x.value === n); return o ? o.textContent : null; }, name);
        await choose(page, name);
        seen.push(option);
        cards.push(await card(page));
      }
      check('ORDER', await page.evaluate(() => [...document.getElementById('anc48Pick').options].map(o => o.value).filter(Boolean).sort()), BOOK.map(b => b[0]).sort());
      check('COSTS', seen.map(o => (o || '').replace(/\s+/g, ' ')), BOOK.map(([n, , c]) => n + ' — ' + c + ' XP'));
      check('CARD-PAGE', cards.map(c => !!c && c.text.includes(' XP · ')), BOOK.map(() => true));
      check('CARD-SECTIONS', cards.map(c => /Gifts/.test(c.text) && /Demands/.test(c.text) && !!c.badge && c.badge.text === BADGE), BOOK.map(() => true));
      check('CARD-FACTION', cards.map((c, i) => c.text.includes(BOOK[i][1] + ' · ' + BOOK[i][2] + ' XP · ' + BOOK[i][3] + ' ' + BOOK[i][4])), BOOK.map(() => true));
    });

    await scenario('OFFER', ['CRAB', 'MANTIS-MINOR', 'SPIDER-OWN', 'NO-CLAN', 'OTHER-REFUSED', 'OTHER-NOT-SAVED', 'PICKER-FALLBACK',
      'CRANE-NONE-NEW', 'DRAGON-AGASHA-TWICE', 'IMPERIAL', 'IMPERIAL-GROUP', 'MINOR-BADGER', 'FOX-SHARED', 'RONIN', 'MONK-PICKER',
      'MONK-SCHOOL', 'MONK-SCHOOL-GROUPS', 'RONIN-REFUSED-TO-CLAN'], async check => {
      await setup(page, { clan: 'Crab' });
      check('CRAB', await enabled(page), ['Hida', 'Kuni', 'Hiruma', 'Kaiu', ...SPIDER]);
      await setup(page, { clan: 'Mantis' });
      check('MANTIS-MINOR', await enabled(page), ['Kaimetsu-Uo', 'Gusai', 'Moshi Azami', 'Osusuki & Akomachi', ...SPIDER]);
      await setup(page, { clan: 'Spider' });
      check('SPIDER-OWN', await enabled(page), SPIDER);
      await setup(page, { clan: '' });
      check('NO-CLAN', await enabled(page), SPIDER);
      await setup(page, { clan: 'Crab' });
      check('OTHER-REFUSED', await choose(page, 'Doji'), false);
      check('OTHER-NOT-SAVED', await state(page), null);
      // Before Apply Family the Clan & School picker decides.
      await setup(page, { clan: '', picker: 'Lion' });
      check('PICKER-FALLBACK', await enabled(page), ['Akodo', 'Ikoma', 'Kitsu', 'Matsu Hitomi', ...SPIDER]);
      // The Great Clans prints no Crane section.
      await setup(page, { clan: 'Crane' });
      check('CRANE-NONE-NEW', await enabled(page), ['Doji', 'Kakita', ...SPIDER]);
      await setup(page, { clan: 'Dragon' });
      check('DRAGON-AGASHA-TWICE', await enabled(page), ['Agasha Kitsuki', 'Mirumoto', 'Agasha', 'Agasha, most favoured', 'Togashi Yamatsu', ...SPIDER]);
      await setup(page, { clan: 'Imperial' });
      check('IMPERIAL', await enabled(page), ['Otomo', 'Seppun', 'Miya', ...SPIDER]);
      check('IMPERIAL-GROUP', (await groups(page))[0], 'Imperial families');
      await setup(page, { clan: 'Badger' });
      check('MINOR-BADGER', await enabled(page), ['Ichiro Fureheshu', ...SPIDER]);
      await setup(page, { clan: 'Fox' });
      check('FOX-SHARED', await enabled(page), ['Osusuki & Akomachi', ...SPIDER]);
      await setup(page, { clan: 'Ronin' });
      check('RONIN', await enabled(page), ['Sun Tao', 'Chiroru', 'Miyuko', ...SPIDER]);
      await setup(page, { picker: 'Brotherhood of Shinsei' });
      check('MONK-PICKER', await enabled(page), ['Basso', 'Sakura', 'Mizumoto', 'Togashi Kaze', ...SPIDER]);
      // A monk of the Brotherhood whose sheet still records a Clan sees both.
      await setup(page, { clan: 'Dragon', school: 'The Four Temples [Monk]' });
      check('MONK-SCHOOL', await enabled(page), ['Agasha Kitsuki', 'Mirumoto', 'Agasha', 'Agasha, most favoured', 'Togashi Yamatsu',
        'Basso', 'Sakura', 'Mizumoto', 'Togashi Kaze', ...SPIDER]);
      check('MONK-SCHOOL-GROUPS', (await groups(page)).slice(0, 2), ['Dragon Clan', 'Brotherhood of Shinsei']);
      await setup(page, { clan: 'Crab' });
      check('RONIN-REFUSED-TO-CLAN', [await choose(page, 'Sun Tao'), await state(page)], [false, null]);
    });

    await scenario('COST', ['HIDA-SPENT', 'HIDA-REMAIN', 'BREAKDOWN', 'SWITCH-KUNI', 'NONE-AGAIN', 'VALIDATOR-SEES-IT', 'AGASHA-TEN'], async check => {
      await setup(page, { clan: 'Crab', xpTotal: 40 });
      const before = await xp(page);
      await pick(page, 'Hida');
      const after1 = await xp(page);
      check('HIDA-SPENT', after1.spent - before.spent, COST.Hida);
      check('HIDA-REMAIN', before.remain - after1.remain, COST.Hida);
      check('BREAKDOWN', await page.evaluate(() => /Ancestor:\s*\+14/.test(document.getElementById('xpBreakdown').textContent)));
      await pick(page, 'Kuni');
      check('SWITCH-KUNI', (await xp(page)).spent - before.spent, COST.Kuni);
      await pick(page, '');
      check('NONE-AGAIN', await xp(page), before);
      // Phase 5's (Part J) overspend rule reads the same field: 40 total, Hida 14 + 30 of Adjust.
      await pick(page, 'Hida');
      await page.evaluate(() => { const T = window.__L5R_TEST__; document.getElementById('f_xpAdjust').value = '30'; T.recalcAll(); });
      check('VALIDATOR-SEES-IT', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return typeof T.validateCharacter !== 'function' || T.validateCharacter().findings.some(f => f.id === 'xp-overspend'); }));
      await setup(page, { clan: 'Dragon', xpTotal: 40 });
      const plain = await xp(page);
      await pick(page, 'Agasha, most favoured');
      check('AGASHA-TEN', (await xp(page)).spent - plain.spent, 10);
    });

    await scenario('SPIDER', ['ASKED', 'CANCEL-NOTHING', 'CONFIRM-SAVED', 'GM-NOTE', 'OWN-NOT-ASKED', 'GREAT-CLANS-SPIDER-ASKED'], async check => {
      await setup(page, { clan: 'Crab' });
      await page.evaluate(() => window.__L5R_CAROUSEL__?.goToTab?.('Clan & School'));
      await page.evaluate(() => { const s = document.getElementById('anc48Pick'); s.value = 'Hida Atarasi'; s.dispatchEvent(new Event('change', { bubbles: true })); });
      await page.waitForSelector('#appConfirmOverlay', { state: 'visible' });
      check('ASKED', await page.evaluate(() => /GM/.test(document.getElementById('appConfirmMsg').textContent) && /p\. 244/.test(document.getElementById('appConfirmMsg').textContent)));
      await page.locator('#appConfirmCancel').click();
      await page.waitForTimeout(80);
      check('CANCEL-NOTHING', [await state(page), await page.evaluate(() => document.getElementById('anc48Pick').value)], [null, '']);
      await pick(page, 'Hida Atarasi', true);
      const s = await state(page);
      check('CONFIRM-SAVED', s && [s.name, s.gm], ['Hida Atarasi', true]);
      check('GM-NOTE', (await card(page)).text.includes('GM’s permission'));
      await setup(page, { clan: 'Spider' });
      await pick(page, 'Kuni Yori');
      const t = await state(page);
      check('OWN-NOT-ASKED', t && [t.name, t.gm], ['Kuni Yori', false]);
      await setup(page, { clan: 'Imperial' });
      await pick(page, 'Yogo Junzo', true);
      const u = await state(page);
      check('GREAT-CLANS-SPIDER-ASKED', u && [u.name, u.gm], ['Yogo Junzo', true]);
    });

    await scenario('FAVOUR', ['BADGE-TEXT', 'LOSE-CANCEL', 'LOST', 'LOST-GIFT-OFF', 'LOST-COST-KEPT', 'LOST-GREY', 'JEALOUS-LOCKED', 'JEALOUS-REFUSED',
      'REGAIN', 'REGAIN-GIFT-ON', 'SECOND-LOSS-WARNED', 'FINAL', 'FINAL-BADGE', 'FINAL-NO-TOGGLE', 'FINAL-COST-KEPT',
      'NO-RETURN-WARNED', 'NO-RETURN-FINAL-AT-ONCE', 'NO-RETURN-BADGE', 'NO-RETURN-LOCKED'], async check => {
      await setup(page, { clan: 'Crab' });
      const bare = await dmg(page, 'Katana');
      await pick(page, 'Hida');
      const spent = (await xp(page)).spent;
      const c0 = await card(page);
      check('BADGE-TEXT', c0.badge && [c0.badge.text, c0.badge.pressed], [BADGE, 'false']);
      await badge(page, false);
      check('LOSE-CANCEL', (await state(page)).lost, false);
      await badge(page, true);
      check('LOST', (await state(page)).lost, true);
      check('LOST-GIFT-OFF', await dmg(page, 'Katana'), bare);
      check('LOST-COST-KEPT', (await xp(page)).spent, spent);
      const c1 = await card(page);
      check('LOST-GREY', [/anc48-lost/.test(c1.cls), c1.badge.pressed], [true, 'true']);
      check('JEALOUS-LOCKED', await page.evaluate(() => [document.getElementById('anc48Pick').hidden, !document.getElementById('anc48Fixed').hidden]), [true, true]);
      check('JEALOUS-REFUSED', [await choose(page, 'Kuni'), (await state(page)).name], [false, 'Hida']);
      await badge(page, true);
      const s2 = await state(page);
      check('REGAIN', [s2.lost, s2.regained, s2.final], [false, true, false]);
      check('REGAIN-GIFT-ON', await dmg(page, 'Katana'), [bare[0] + 1, bare[1]]);
      const message = await badge(page, true);
      check('SECOND-LOSS-WARNED', /final/i.test(message));
      const s3 = await state(page);
      check('FINAL', [s3.lost, s3.final], [true, true]);
      const c3 = await card(page);
      check('FINAL-BADGE', [c3.badge.disabled, c3.badge.pressed], [true, 'true']);
      await page.evaluate(() => { window.__L5R_TEST__.ANC48.toggleFavour(); });
      await page.waitForSelector('#appConfirmOverlay', { state: 'visible' });
      const notice = await page.evaluate(() => document.getElementById('appConfirmMsg').textContent);
      await page.locator('#appConfirmOk').click();
      const s4 = await state(page);
      check('FINAL-NO-TOGGLE', [/for good/.test(notice), s4.lost, s4.final], [true, true, true]);
      check('FINAL-COST-KEPT', (await xp(page)).spent, spent);
      // Chuda Bikimi never returns (The Great Clans p. 283): the first loss is final.
      await setup(page, { clan: 'Spider' });
      await pick(page, 'Chuda Bikimi');
      const warn = await badge(page, true);
      check('NO-RETURN-WARNED', /never returns/.test(warn));
      const b = await state(page);
      check('NO-RETURN-FINAL-AT-ONCE', [b.lost, b.regained, b.final], [true, false, true]);
      const cb = await card(page);
      check('NO-RETURN-BADGE', [cb.badge.disabled, /never returns/.test(cb.text)], [true, true]);
      check('NO-RETURN-LOCKED', await choose(page, 'Kuni Yori'), false);
    });

    await scenario('SAVE', ['COLLECT', 'ROUND-TRIP', 'ROUND-TRIP-XP', 'EXPORT-FILE', 'OLD-SAVE-CLEARS', 'REFUSED-KEEPS', 'INVALID-WARNED', 'INVALID-FREE', 'RESET-CLEARS',
      'SESSION-ROUND-TRIP', 'NO-RETURN-REGAINED-INVALID'], async check => {
      await setup(page, { clan: 'Crane', xpTotal: 40 });
      await pick(page, 'Kakita');
      await badge(page, true);
      const saved = await page.evaluate(() => window.__L5R_TEST__.collectData());
      const s = JSON.parse(saved.fields.f_ancestor || 'null');
      check('COLLECT', s && [s.name, s.lost], ['Kakita', true]);
      const spent = (await xp(page)).spent;
      await setup(page, { clan: 'Crane' });
      await page.evaluate(d => window.__L5R_TEST__.applyData(JSON.parse(JSON.stringify(d))), saved);
      const back = await state(page);
      check('ROUND-TRIP', back && [back.name, back.lost, (await card(page)).badge.pressed], ['Kakita', true, 'true']);
      check('ROUND-TRIP-XP', (await xp(page)).spent, spent);
      const [download] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => document.getElementById('btnExport').click())]);
      const file = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
      check('EXPORT-FILE', JSON.parse(file.fields.f_ancestor).name, 'Kakita');
      // A save from before this part has no field: the previous character's Ancestor must not stay.
      await page.evaluate(d => { const old = JSON.parse(JSON.stringify(d)); delete old.fields.f_ancestor; window.__L5R_TEST__.applyData(old); }, saved);
      check('OLD-SAVE-CLEARS', [await state(page), await page.evaluate(() => document.getElementById('anc48Card').hidden)], [null, true]);
      await page.evaluate(d => window.__L5R_TEST__.applyData(JSON.parse(JSON.stringify(d))), saved);
      await page.evaluate(d => { const newer = JSON.parse(JSON.stringify(d)); newer.schemaVersion = 99; delete newer.fields.f_ancestor;
        window.__L5R_TEST__.applyData(newer); document.getElementById('appConfirmOverlay').style.display = 'none'; }, saved);
      check('REFUSED-KEEPS', (await state(page) || {}).name, 'Kakita');
      await setup(page, { clan: 'Crane', xpTotal: 40 });
      const clean = await xp(page);
      await page.evaluate(() => { document.getElementById('f_ancestor').value = '{"v":9,"name":"Kakita"}'; window.__L5R_TEST__.recalcAll(); });
      check('INVALID-WARNED', (await card(page)).flags.some(t => /not one this sheet recognises/.test(t)));
      check('INVALID-FREE', [await xp(page), await mods(page, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes' })], [clean, []]);
      await page.evaluate(() => window.__L5R_TEST__.resetToBaseline());
      check('RESET-CLEARS', await page.evaluate(() => document.getElementById('f_ancestor').value), '');
      // A once-a-session use travels with the save.
      await setup(page, { clan: 'Monkey' });
      await pick(page, 'Toku');
      await page.evaluate(() => window.__L5R_TEST__.ANC48.useSession());
      const used = await page.evaluate(() => window.__L5R_TEST__.collectData());
      await setup(page, { clan: 'Monkey' });
      await page.evaluate(d => window.__L5R_TEST__.applyData(JSON.parse(JSON.stringify(d))), used);
      check('SESSION-ROUND-TRIP', (await state(page) || {}).sessionUsed, true);
      await setup(page, { clan: 'Spider' });
      await page.evaluate(() => { document.getElementById('f_ancestor').value = JSON.stringify({ v: 1, name: 'Chuda Bikimi', lost: false, regained: true, final: false, gm: false });
        window.__L5R_TEST__.recalcAll(); });
      check('NO-RETURN-REGAINED-INVALID', (await card(page)).flags.some(t => /not one this sheet recognises/.test(t)));
    });

    const AUTO = [
      // [ancestor, faction, setup extras, kind, context, expected ancestor deltas]
      ['Doji', 'Crane', {}, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, [[1, 0]]],
      ['Doji', 'Crane', {}, 'SKILL', { skillName: 'Perform: Storytelling', traitName: 'Awareness' }, [[1, 0]]],
      ['Doji', 'Crane', {}, 'SKILL', { skillName: 'Sincerity', traitName: 'Awareness' }, [[1, 0]]],
      ['Doji', 'Crane', {}, 'SKILL', { skillName: 'Acting', traitName: 'Awareness' }, []],
      ['Agasha Kitsuki', 'Dragon', { traits: { perception: 4, awareness: 2 } }, 'SKILL', { skillName: 'Etiquette', traitName: 'Awareness' }, [[2, 2]]],
      ['Agasha Kitsuki', 'Dragon', { traits: { perception: 4, awareness: 2 } }, 'TRAIT', { traitName: 'Awareness' }, [[2, 2]]],
      ['Agasha Kitsuki', 'Dragon', { traits: { perception: 2, awareness: 3 } }, 'TRAIT', { traitName: 'Awareness' }, []],
      ['Mirumoto', 'Dragon', {}, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, [[3, 1]]],
      ['Mirumoto', 'Dragon', {}, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, [[1, 1]]],
      ['Mirumoto', 'Dragon', {}, 'SKILL', { skillName: 'Defense', traitName: 'Reflexes' }, []],
      ['Akodo', 'Lion', {}, 'SKILL', { skillName: 'Athletics', traitName: 'Strength' }, [[1, 0]]],
      ['Akodo', 'Lion', {}, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, [[1, 0]]],
      ['Akodo', 'Lion', {}, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes' }, []],
      ['Akodo', 'Lion', {}, 'SKILL', { skillName: 'Ninjutsu', traitName: 'Agility' }, []],
      ['Ikoma', 'Lion', {}, 'SKILL', { skillName: 'Lore: History', traitName: 'Intelligence' }, [[1, 0]]],
      ['Ikoma', 'Lion', {}, 'TRAIT', { traitName: 'Intelligence' }, [[1, 0]]],
      ['Ikoma', 'Lion', {}, 'RING', { ringName: 'Fire' }, []],
      ['Kaimetsu-Uo', 'Mantis', {}, 'TRAIT', { traitName: 'Willpower' }, [[1, 1]]],
      ['Kaimetsu-Uo', 'Mantis', {}, 'SKILL', { skillName: 'Intimidation', traitName: 'Willpower' }, [[1, 1]]],
      ['Shiba', 'Phoenix', {}, 'TRAIT', { traitName: 'Intelligence' }, [[1, 1]]],
      ['Shiba', 'Phoenix', {}, 'SKILL', { skillName: 'Lore: Theology', traitName: 'Intelligence' }, [[1, 1]]],
      ['Bayushi', 'Scorpion', { school: 'Bayushi Courtier' }, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, [[1, 0]]],
      ['Bayushi', 'Scorpion', { school: 'Bayushi Courtier' }, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, []],
      ['Bayushi', 'Scorpion', { school: 'Shosuro Infiltrator [Ninja]' }, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, []],
      ['Shosuro', 'Scorpion', {}, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, [[3, 1]]],
      ['Shosuro', 'Scorpion', {}, 'SKILL', { skillName: 'Acting', traitName: 'Awareness' }, [[3, 1]]],
      ['Shosuro', 'Scorpion', {}, 'SKILL', { skillName: 'Sincerity', traitName: 'Awareness' }, []],
      ['Kuni Yori', 'Spider', {}, 'SPELL', { spellName: 'Probe', maho: true }, [[1, 0]]],
      ['Kuni Yori', 'Spider', {}, 'SPELL', { spellName: 'Probe' }, []],
      ['Shinjo', 'Unicorn', {}, 'SKILL', { skillName: 'Etiquette', traitName: 'Awareness' }, [[1, 1]]],
      ['Shinjo', 'Unicorn', {}, 'SKILL', { skillName: 'Investigation', traitName: 'Perception' }, []],
      ['Hida', 'Crab', {}, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, []],
      ['Moto', 'Unicorn', {}, 'TRAIT', { traitName: 'Willpower' }, []],
      // Added after the first variant run found no check could see Kitsuki reach beyond Awareness.
      ['Agasha Kitsuki', 'Dragon', { traits: { perception: 4, awareness: 2 } }, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, []],
      // The Great Clans
      ['Hiruma', 'Crab', {}, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, [[1, 0]]],
      ['Hiruma', 'Crab', {}, 'ATTACK', { skillName: 'Kyujutsu', traitName: 'Reflexes' }, [[1, 0]]],
      ['Hiruma', 'Crab', {}, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, []],
      ['Kaiu', 'Crab', {}, 'SKILL', { skillName: 'Craft: Swordsmithing', traitName: 'Awareness' }, []],
      ['Agasha', 'Dragon', {}, 'SPELL', { spellName: 'Probe', element: 'Fire' }, [[1, 0]]],
      ['Agasha', 'Dragon', {}, 'SPELL', { spellName: 'Probe', element: 'Void' }, []],
      ['Agasha, most favoured', 'Dragon', {}, 'SKILL', { skillName: 'Spellcraft', traitName: 'Intelligence' }, [[1, 1]]],
      ['Kitsu', 'Lion', {}, 'SKILL', { skillName: 'Lore: Spirit Realms', traitName: 'Intelligence' }, [[1, 1]]],
      ['Kitsu', 'Lion', {}, 'SKILL', { skillName: 'Lore: History', traitName: 'Intelligence' }, []],
      ['Yogo', 'Scorpion', {}, 'SPELL', { spellName: WARDS, element: 'Air' }, [[1, 1]]],
      ['Yogo', 'Scorpion', {}, 'SPELL', { spellName: NOT_WARDS, element: 'Air' }, []],
      ['Otaku', 'Unicorn', {}, 'SKILL', { skillName: 'Horsemanship', traitName: 'Agility' }, [[1, 1]]],
      ['Chuda Bikimi', 'Spider', {}, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, [[1, 0]]],
      // Secrets of the Empire
      ['Sun Tao', 'Ronin', {}, 'SKILL', { skillName: 'Battle', traitName: 'Perception' }, [[1, 0]]],
      ['Sun Tao', 'Ronin', {}, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, []],
      ['Miyuko', 'Ronin', {}, 'SPELL', { spellName: 'Probe', element: 'Water' }, [[1, 0]]],
      ['Mizumoto', 'Brotherhood of Shinsei', {}, 'TRAIT', { traitName: 'Intelligence' }, [[1, 1]]],
      ['Mizumoto', 'Brotherhood of Shinsei', {}, 'SKILL', { skillName: 'Lore: Theology', traitName: 'Intelligence' }, [[1, 1]]],
      ['Mizumoto', 'Brotherhood of Shinsei', {}, 'SKILL', { skillName: 'Meditation', traitName: 'Void' }, []],
    ];
    const as = (faction, extra) => Object.assign(faction === 'Brotherhood of Shinsei' ? { picker: faction } : { clan: faction }, extra);
    await scenario('AUTO', AUTO.map((a, i) => String(i + 1).padStart(2, '0') + '-' + a[0].replace(/\W+/g, '')).concat(['NEVER-DAMAGE', 'NONE-NO-LEAK']), async check => {
      for (let i = 0; i < AUTO.length; i++) {
        const [name, faction, extra, kind, ctx, want] = AUTO[i];
        await setup(page, as(faction, extra));
        await choose(page, name);
        check(String(i + 1).padStart(2, '0') + '-' + name.replace(/\W+/g, ''), await mods(page, kind, ctx), noRolls ? [] : want);
      }
      await setup(page, { clan: 'Crane' });
      await choose(page, 'Doji');
      check('NEVER-DAMAGE', await mods(page, 'DAMAGE', { skillName: 'Courtier', traitName: 'Awareness' }), []);
      await setup(page, { clan: 'Crane' });
      const kinds = [['SKILL', { skillName: 'Courtier', traitName: 'Awareness' }], ['TRAIT', { traitName: 'Intelligence' }], ['ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }], ['SPELL', { spellName: 'P', maho: true }]];
      const leaks = [];
      for (const [k, c] of kinds) leaks.push(...await mods(page, k, c, true));
      check('NONE-NO-LEAK', leaks, []);
    });

    await scenario('TOTALS', ['JUNZO-SPELL', 'JUNZO-MAHO', 'JUNZO-NOTHING-TO-COUNT', 'JUNZO-NOT-SKILLS'], async check => {
      // One Forbidden Knowledge and Taint Rank 2: three counts, +2 each, +4 each for maho.
      await setup(page, { clan: 'Spider', taint: 2, advs: ['Forbidden Knowledge'] });
      await choose(page, 'Yogo Junzo');
      check('JUNZO-SPELL', await mods(page, 'SPELL', { spellName: 'Probe', element: 'Earth' }), noRolls ? [] : [[0, 0, 6]]);
      check('JUNZO-MAHO', await mods(page, 'SPELL', { spellName: 'Probe', element: 'Earth', maho: true }), noRolls ? [] : [[0, 0, 12]]);
      check('JUNZO-NOT-SKILLS', await mods(page, 'SKILL', { skillName: 'Spellcraft', traitName: 'Intelligence' }), []);
      await setup(page, { clan: 'Spider' });
      await choose(page, 'Yogo Junzo');
      check('JUNZO-NOTHING-TO-COUNT', await mods(page, 'SPELL', { spellName: 'Probe', element: 'Earth' }), []);
    });

    await scenario('SHOWN', ['TSI-SWORDSMITHING', 'TSI-OTHER-CRAFT', 'KAZE-FREE-RAISE', 'KAZE-RANKS-SHORT', 'KAZE-NOT-ARMED', 'SHOWN-MOVES-NO-DICE'], async check => {
      await setup(page, { clan: 'Oriole' });
      await choose(page, 'Tsi');
      check('TSI-SWORDSMITHING', await mods(page, 'SKILL', { skillName: 'Craft: Swordsmithing', traitName: 'Awareness' }), noRolls ? [] : [['shown', 'Raises not limited']]);
      check('TSI-OTHER-CRAFT', await mods(page, 'SKILL', { skillName: 'Craft: Pottery', traitName: 'Awareness' }), []);
      await setup(page, { picker: 'Brotherhood of Shinsei', skills: [['Meditation', 'Void', 3], ['Jiujutsu', 'Agility', 2]] });
      await choose(page, 'Togashi Kaze');
      check('KAZE-FREE-RAISE', await mods(page, 'ATTACK', { skillName: 'Jiujutsu', traitName: 'Agility' }), noRolls ? [] : [['shown', 'Free Raise available']]);
      check('KAZE-NOT-ARMED', await mods(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }), []);
      const pool = await page.evaluate(() => { const T = window.__L5R_TEST__;
        const adj = T.applyPreRollModifiers(3, 2, T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.ATTACK, { skillName: 'Jiujutsu', traitName: 'Agility' })));
        return [adj.rolled, adj.kept, adj.totalDelta]; });
      check('SHOWN-MOVES-NO-DICE', pool, [3, 2, 0]);
      await setup(page, { picker: 'Brotherhood of Shinsei', skills: [['Meditation', 'Void', 1], ['Jiujutsu', 'Agility', 2]] });
      await choose(page, 'Togashi Kaze');
      check('KAZE-RANKS-SHORT', await mods(page, 'ATTACK', { skillName: 'Jiujutsu', traitName: 'Agility' }), []);
    });

    await scenario('IUCHI', ['DEFICIENT-FIRE', 'AFFINITY-WATER', 'OTHER-AIR', 'NO-DEFICIENCY-NOTHING', 'MATCHES-SHEET'], async check => {
      // Iuchi Shugenja: Affinity Water, Deficiency Fire. The Deficiency takes a School Rank die.
      await setup(page, { clan: 'Unicorn', family: 'Iuchi', school: 'Iuchi Shugenja' });
      await choose(page, 'Iuchi');
      check('DEFICIENT-FIRE', await mods(page, 'SPELL', { spellName: 'Probe', element: 'Fire' }), noRolls ? [] : [[1, 0]]);
      check('AFFINITY-WATER', await mods(page, 'SPELL', { spellName: 'Probe', element: 'Water' }), []);
      check('OTHER-AIR', await mods(page, 'SPELL', { spellName: 'Probe', element: 'Air' }), []);
      // The die restored is exactly the one the sheet's own Casting Roll takes away: its own pool for
      // a Fire cast (the Deficiency) against an Air cast (neither), both Rings at 2.
      const cast = el => page.evaluate(async el => { const T = window.__L5R_TEST__;
        T.performSpellCastRoll(el.toLowerCase(), el, 'Probe', 1, []);
        await new Promise(r => setTimeout(r, 60));
        const go = document.getElementById('rollPreviewGo'), text = go ? go.textContent : '';
        const cancel = document.getElementById('rollPreviewCancel'); if (cancel) cancel.click();
        await new Promise(r => setTimeout(r, 30));
        return Number((text.match(/(\d+)k/) || [0, -1])[1]); }, el);
      const withIuchi = [await cast('Fire'), await cast('Air')];
      await choose(page, '');
      const without = [await cast('Fire'), await cast('Air')];
      check('MATCHES-SHEET', [withIuchi[0] - withIuchi[1], without[0] - without[1]], noRolls ? [-1, -1] : [0, -1]);
      await setup(page, { clan: 'Unicorn', family: 'Iuchi', school: 'Shinjo Bushi' });
      await choose(page, 'Iuchi');
      check('NO-DEFICIENCY-NOTHING', await mods(page, 'SPELL', { spellName: 'Probe', element: 'Fire' }), []);
    });

    const DECL = [
      // [ancestor, faction, setup extras, kind, context, key, expected deltas when ticked, with the Void Point armed]
      ['Kuni', 'Crab', { traits: { stamina: 3, willpower: 3 } }, 'SPELL', { spellName: 'Probe' }, 'kuni-cast', [[0, 3]]],
      ['Agasha Kitsuki', 'Dragon', {}, 'SKILL', { skillName: 'Investigation', traitName: 'Perception' }, 'kitsuki-lie', [[1, 1]], true],
      ['Akodo', 'Lion', {}, 'SKILL', { skillName: 'Battle', traitName: 'Perception' }, 'akodo-battle', [[1, 0], [1, 1]]],
      ['Kaimetsu-Uo', 'Mantis', {}, 'TRAIT', { traitName: 'Willpower' }, 'kaimetsu-provoked', []],
      ['Kaimetsu-Uo', 'Mantis', {}, 'ATTACK', { skillName: 'Jiujutsu', traitName: 'Agility' }, 'kaimetsu-improvised', [[3, 0]]],
      ['Gusai', 'Mantis', {}, 'SKILL', { skillName: 'Sleight of Hand', traitName: 'Agility' }, 'gusai-conceal', [[3, 3]]],
      ['Asako', 'Phoenix', {}, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, 'asako-ally', [[1, 0]]],
      ['Shosuro', 'Scorpion', {}, 'SKILL', { skillName: 'Sincerity', traitName: 'Awareness' }, 'shosuro-deceit', [[3, 1]]],
      ['Kuni Yori', 'Spider', {}, 'SKILL', { skillName: 'Sincerity', traitName: 'Awareness' }, 'yori-deceit', [[1, 0]]],
      ['Hida Atarasi', 'Spider', { traits: { stamina: 4, willpower: 3 }, taint: 1 }, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, 'atarasi-strike', [[3, 0]]],
      ['Moto', 'Unicorn', {}, 'RING', { ringName: 'Water' }, 'moto-resist', [[2, 2]]],
      ['Shinjo', 'Unicorn', {}, 'SKILL', { skillName: 'Investigation', traitName: 'Perception' }, 'shinjo-enigma', [[1, 1]]],
      ['Shinjo', 'Unicorn', {}, 'SKILL', { skillName: 'Sincerity', traitName: 'Awareness' }, 'shinjo-honesty', [[1, 1]]],
      // The Great Clans
      ['Togashi Yamatsu', 'Dragon', {}, 'TRAIT', { traitName: 'Willpower' }, 'yamatsu-resist', [[2, 2]]],
      ['Matsu Hitomi', 'Lion', {}, 'RING', { ringName: 'Earth' }, 'hitomi-resist', [[1, 1]]],
      ['Isawa', 'Phoenix', {}, 'SKILL', { skillName: 'Spellcraft', traitName: 'Intelligence' }, 'isawa-research', [[1, 1]]],
      ['Yogo', 'Scorpion', {}, 'SPELL', { spellName: 'A spell the sheet does not list', element: 'Air' }, 'yogo-wards', [[1, 1]]],
      ['Otaku', 'Unicorn', {}, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, 'otaku-male', [[1, 0]]],
      ['Chuda Bikimi', 'Spider', { school: 'Kuni Shugenja' }, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, 'bikimi-slot', [[0, 1], [1, 0]]],
      // Secrets of the Empire
      ['Otomo', 'Imperial', {}, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, 'otomo-courtier', [[1, 1]]],
      ['Seppun', 'Imperial', {}, 'TRAIT', { traitName: 'Awareness' }, 'seppun-void', [[1, 1]]],
      ['Ichiro Fureheshu', 'Badger', { traits: { strength: 4, agility: 2 } }, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, 'fureheshu-strength', [[2, 2]]],
      ['Komori Iongi', 'Bat', {}, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, 'iongi-void', [[1, 1]]],
      ['Hida Heichi', 'Boar', {}, 'SKILL', { skillName: 'Etiquette', traitName: 'Awareness' }, 'heichi-powerful', [[1, 1]]],
      ['Tonbo Kuyuden', 'Dragonfly', {}, 'SKILL', { skillName: 'Etiquette', traitName: 'Awareness' }, 'kuyuden-peace', [[1, 1]]],
      ['Usagi Reichin', 'Hare', {}, 'TRAIT', { traitName: 'Willpower' }, 'reichin-fear', [[1, 1]]],
      ['Usagi Reichin', 'Hare', {}, 'TRAIT', { traitName: 'Willpower' }, 'reichin-bloodspeaker', [[2, 2]]],
      ['Morito Garin', 'Ox', {}, 'TRAIT', { traitName: 'Perception' }, 'garin-loyalties', [[1, 1]]],
      ['Doji Suzume', 'Sparrow', {}, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, 'suzume-persuade', [[1, 1]]],
      ['Agasha Kasuga', 'Tortoise', {}, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, 'kasuga-duty', [[1, 1]]],
    ];
    const DECL_IDS = [];
    DECL.forEach((d, i) => { const n = String(i + 1).padStart(2, '0') + '-' + d[5]; DECL_IDS.push(n + '-OFFERED', n + '-APPLIED'); });
    await scenario('DECLARE', DECL_IDS.concat(['NOT-ON-OTHER-ROLLS', 'ASAKO-NOT-KENJUTSU', 'LOST-NOTHING-OFFERED', 'PROVOKED-DROPS-AUTO', 'KAKITA-NOTHING-BEFORE',
      'BAYUSHI-NOTHING-TO-TICK', 'KITSUKI-NEEDS-THE-VOID', 'SEPPUN-NOT-WITH-THE-VOID', 'IONGI-NOT-WITH-THE-VOID', 'FURESHU-ONLY-WHEN-HIGHER',
      'BIKIMI-SHUGENJA-ONLY', 'YOGO-LISTED-WARDS-NOT-TICKED', 'REICHIN-NEVER-BOTH', 'RESIST-NOT-ON-AGILITY', 'PAID-NOTE']), async check => {
      for (let i = 0; i < DECL.length; i++) {
        const [name, faction, extra, kind, ctx, key, want, withVoid] = DECL[i];
        const n = String(i + 1).padStart(2, '0') + '-' + key;
        await setup(page, as(faction, extra));
        await choose(page, name);
        check(n + '-OFFERED', (await offers(page, kind, ctx, !!withVoid)).includes(key), !noDeclare);
        // Kitsuki's tick rides on the Void Point, whose own +1k1 is not the Ancestor's.
        check(n + '-APPLIED', noDeclare ? [] : await declared(page, kind, ctx, key, !!withVoid), noDeclare ? [] : want);
      }
      await setup(page, { clan: 'Mantis' });
      await choose(page, 'Gusai');
      check('NOT-ON-OTHER-ROLLS', await offers(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }), []);
      await setup(page, { clan: 'Phoenix' });
      await choose(page, 'Asako');
      check('ASAKO-NOT-KENJUTSU', await offers(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }), []);
      await setup(page, { clan: 'Unicorn' });
      await pick(page, 'Moto');
      await badge(page, true);
      check('LOST-NOTHING-OFFERED', await offers(page, 'TRAIT', { traitName: 'Willpower' }), []);
      await setup(page, { clan: 'Mantis' });
      await choose(page, 'Kaimetsu-Uo');
      check('PROVOKED-DROPS-AUTO', noDeclare ? [] : await declared(page, 'TRAIT', { traitName: 'Willpower' }, 'kaimetsu-provoked'), []);
      // Kakita's re-roll is offered after the roll, never before it (the owner's point 6).
      await setup(page, { clan: 'Crane' });
      await choose(page, 'Kakita');
      check('KAKITA-NOTHING-BEFORE', await offers(page, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes' }, true), []);
      await setup(page, { clan: 'Scorpion', school: 'Bayushi Bushi' });
      await choose(page, 'Bayushi');
      check('BAYUSHI-NOTHING-TO-TICK', await offers(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, true), []);
      await setup(page, { clan: 'Dragon' });
      await choose(page, 'Agasha Kitsuki');
      check('KITSUKI-NEEDS-THE-VOID', await offers(page, 'SKILL', { skillName: 'Investigation', traitName: 'Perception' }), []);
      await setup(page, { clan: 'Imperial' });
      await choose(page, 'Seppun');
      check('SEPPUN-NOT-WITH-THE-VOID', await offers(page, 'TRAIT', { traitName: 'Awareness' }, true), []);
      await setup(page, { clan: 'Bat' });
      await choose(page, 'Komori Iongi');
      check('IONGI-NOT-WITH-THE-VOID', await offers(page, 'TRAIT', { traitName: 'Awareness' }, true), []);
      await setup(page, { clan: 'Badger', traits: { strength: 2, agility: 3 } });
      await choose(page, 'Ichiro Fureheshu');
      check('FURESHU-ONLY-WHEN-HIGHER', await offers(page, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }), []);
      await setup(page, { clan: 'Spider', school: 'Hida Bushi' });
      await choose(page, 'Chuda Bikimi');
      check('BIKIMI-SHUGENJA-ONLY', await offers(page, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }), []);
      await setup(page, { clan: 'Scorpion' });
      await choose(page, 'Yogo');
      check('YOGO-LISTED-WARDS-NOT-TICKED', await offers(page, 'SPELL', { spellName: WARDS, element: 'Air' }), []);
      await setup(page, { clan: 'Hare' });
      await choose(page, 'Usagi Reichin');
      check('REICHIN-NEVER-BOTH', noDeclare ? [] : await declared(page, 'TRAIT', { traitName: 'Willpower' }, ['reichin-fear', 'reichin-bloodspeaker']), noDeclare ? [] : [[2, 2]]);
      check('RESIST-NOT-ON-AGILITY', await offers(page, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }), []);
      await setup(page, { clan: 'Crab', voids: 0 });
      await choose(page, 'Kuni');
      check('PAID-NOTE', noDeclare ? true : await page.evaluate(() => { const T = window.__L5R_TEST__;
        const o = T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS.SPELL, { spellName: 'Probe' })).find(x => x.key === 'ancestors:kuni-cast');
        return !!o && /no Void Points left/.test(o.note) && /cannot be paid/.test(o.note); }));
    });

    await scenario('VOID', ['BAYUSHI-WITHOUT', 'BAYUSHI-WITH', 'KAIU-WITH', 'SAIBANKAN-PERCEPTION', 'SAIBANKAN-LORE-LAW', 'SAIBANKAN-NOT-AWARENESS',
      'KAIU-REAL-POOL', 'KAIU-REAL-ONE-VOID'], async check => {
      await setup(page, { clan: 'Scorpion', school: 'Bayushi Courtier' });
      await choose(page, 'Bayushi');
      check('BAYUSHI-WITHOUT', await mods(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }), noRolls ? [] : [[1, 0]]);
      check('BAYUSHI-WITH', await mods(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, true), noRolls ? [] : [[1, 0], [1, 1]]);
      await setup(page, { clan: 'Crab' });
      await choose(page, 'Kaiu');
      check('KAIU-WITH', await mods(page, 'SKILL', { skillName: 'Engineering', traitName: 'Intelligence' }, true), noRolls ? [] : [[2, 0]]);
      await setup(page, { clan: 'Scorpion' });
      await choose(page, 'Soshi Saibankan');
      check('SAIBANKAN-PERCEPTION', await mods(page, 'TRAIT', { traitName: 'Perception' }, true), noRolls ? [] : [[2, 0]]);
      check('SAIBANKAN-LORE-LAW', await mods(page, 'SKILL', { skillName: 'Lore: Law', traitName: 'Intelligence' }, true), noRolls ? [] : [[2, 0]]);
      check('SAIBANKAN-NOT-AWARENESS', await mods(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, true), []);
      // A real Craft roll, the Void Point ticked in the preview: +1k1 from it and +2k0 from Kaiu.
      await setup(page, { clan: 'Crab', voids: 2 });
      await choose(page, 'Kaiu');
      const r = await roll(page, 'SKILL', { skillName: 'Craft: Carpentry', traitName: 'Awareness' }, [3, 2], { voidTick: true });
      check('KAIU-REAL-POOL', [r.dice, r.kept], noRolls ? [4, 3] : [6, 3]);
      check('KAIU-REAL-ONE-VOID', await voids(page), 1);
    });

    const PAY = ['KUNI-POOL', 'KUNI-VOID-SPENT', 'KUNI-SESSION-MARKED', 'KUNI-SECOND-ASKED', 'KUNI-SECOND-WITHOUT', 'KUNI-SECOND-NO-VOID-SPENT',
      'KUNI-CANCEL-ROLLS-NOTHING', 'KUNI-CANCEL-NOTHING-SPENT', 'FURESHU-POOL', 'FURESHU-VOID-SPENT', 'SEPPUN-POOL', 'SEPPUN-NO-VOID-SPENT',
      'SEPPUN-SESSION-MARKED', 'SEPPUN-GONE-WHEN-VOID-TICKED', 'IONGI-ROUND-SPEND', 'IONGI-REFUSED-AFTER-VOID', 'ATARASI-ASKED', 'ATARASI-VOID-PAID',
      'ATARASI-POOL', 'ATARASI-DAMAGE-THIS-ROUND', 'ATARASI-DAMAGE-NEXT-ROUND', 'ATARASI-TAINT-NO-VOID', 'ATARASI-X-CANCELS', 'BIKIMI-WITH-SLOT', 'BIKIMI-WITHOUT-SLOT',
      'NOTHING-TAKEN-ON-PREVIEW-CANCEL'];
    await scenario('PAY', PAY, async check => {
      if (noDeclare) { skipAll(check, PAY); return; }
      // Kuni: a Void Point and this session's use, taken when the player presses Roll.
      await setup(page, { clan: 'Crab', traits: { stamina: 3, willpower: 3 }, voids: 2 });
      await choose(page, 'Kuni');
      let r = await roll(page, 'SPELL', { spellName: 'Probe', element: 'Earth' }, [5, 2], { tick: ['kuni-cast'] });
      check('KUNI-POOL', [r.dice, r.kept], [5, 5]);
      check('KUNI-VOID-SPENT', await voids(page), 1);
      check('KUNI-SESSION-MARKED', (await state(page)).sessionUsed, true);
      await closeAll(page);
      r = await roll(page, 'SPELL', { spellName: 'Probe', element: 'Earth' }, [5, 2], { tick: ['kuni-cast'], answers: ['ok'] });
      check('KUNI-SECOND-ASKED', /already spent/.test(r.messages[0] || ''));
      check('KUNI-SECOND-WITHOUT', [r.rolled, r.dice, r.kept], [true, 5, 2]);
      check('KUNI-SECOND-NO-VOID-SPENT', await voids(page), 1);
      await closeAll(page);
      await page.evaluate(() => window.__L5R_TEST__.ANC48.resetSession());
      await page.evaluate(() => { document.getElementById('void_current').value = '0'; window.__L5R_TEST__.renderVoidPips(); });
      r = await roll(page, 'SPELL', { spellName: 'Probe', element: 'Earth' }, [5, 2], { tick: ['kuni-cast'], answers: ['cancel'] });
      check('KUNI-CANCEL-ROLLS-NOTHING', r.rolled, false);
      check('KUNI-CANCEL-NOTHING-SPENT', [await voids(page), (await state(page)).sessionUsed], [0, false]);
      await closeAll(page);
      // Fureheshu: Strength 4 for Agility 2, paid with a Void Point.
      await setup(page, { clan: 'Badger', traits: { strength: 4, agility: 2 }, voids: 2 });
      await choose(page, 'Ichiro Fureheshu');
      r = await roll(page, 'SKILL', { skillName: 'Stealth', traitName: 'Agility', skillRank: 1 }, [3, 2], { tick: ['fureheshu-strength'] });
      check('FURESHU-POOL', [r.dice, r.kept], [5, 4]);
      check('FURESHU-VOID-SPENT', await voids(page), 1);
      await closeAll(page);
      // Seppun: a Void Point's +1k1 without spending one, once a session.
      await setup(page, { clan: 'Imperial', voids: 2 });
      await choose(page, 'Seppun');
      r = await roll(page, 'TRAIT', { traitName: 'Awareness' }, [2, 2], { tick: ['seppun-void'] });
      check('SEPPUN-POOL', [r.dice, r.kept], [3, 3]);
      check('SEPPUN-NO-VOID-SPENT', await voids(page), 2);
      check('SEPPUN-SESSION-MARKED', (await state(page)).sessionUsed, true);
      await closeAll(page);
      await page.evaluate(() => window.__L5R_TEST__.ANC48.resetSession());
      const pending = page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.rollWithModifiers('Seppun probe', T.makeRollContext(T.ROLL_KINDS.TRAIT, { traitName: 'Awareness' }), 2, 2).then(x => !!x); });
      pending.catch(() => {});
      await page.waitForSelector('#rollPreviewGo', { state: 'visible' });
      const before = await page.evaluate(() => !!document.querySelector('#rollPreviewBody [data-rd4515-key="ancestors:seppun-void"]'));
      await page.locator('#rollPreviewBody input[data-void-key="k1"]').check();
      const afterTick = await page.evaluate(() => !!document.querySelector('#rollPreviewBody [data-rd4515-key="ancestors:seppun-void"]'));
      check('SEPPUN-GONE-WHEN-VOID-TICKED', [before, afterTick], [true, false]);
      await page.locator('#rollPreviewCancel').click();
      await pending;
      check('NOTHING-TAKEN-ON-PREVIEW-CANCEL', [await voids(page), (await state(page)).sessionUsed], [2, false]);
      await closeAll(page);
      // Iongi: a Void Point after all, so in a skirmish it is the Round's one.
      await setup(page, { clan: 'Bat', voids: 2, combat: true });
      await choose(page, 'Komori Iongi');
      await roll(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness', skillRank: 1 }, [3, 2], { tick: ['iongi-void'] });
      check('IONGI-ROUND-SPEND', [await page.evaluate(() => window.__L5R_TEST__.hasSpentThisRound('void')), await voids(page)], [true, 2]);
      await closeAll(page);
      await setup(page, { clan: 'Bat', voids: 2, combat: true, roundVoid: true });
      await choose(page, 'Komori Iongi');
      r = await roll(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness', skillRank: 1 }, [3, 2], { tick: ['iongi-void'], answers: ['ok'] });
      check('IONGI-REFUSED-AFTER-VOID', [/this Round/.test(r.messages[0] || ''), r.dice, (await state(page)).sessionUsed === true], [true, 3, false]);
      await closeAll(page);
      // Hida Atarasi: the sheet asks which to pay. Earth 3 against Taint Rank 1: +3k0.
      await setup(page, { clan: 'Spider', traits: { stamina: 3, willpower: 3 }, taint: 1, voids: 2, combat: true });
      await choose(page, 'Hida Atarasi');
      const bare = await dmg(page, 'Katana');
      r = await roll(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 1 }, [4, 2], { tick: ['atarasi-strike'], answers: ['ok'] });
      check('ATARASI-ASKED', /Void Point/.test(r.messages[0] || '') && /Taint/.test(r.messages[0] || ''));
      check('ATARASI-VOID-PAID', await voids(page), 1);
      check('ATARASI-POOL', [r.dice, r.kept], [7, 2]);
      check('ATARASI-DAMAGE-THIS-ROUND', await dmg(page, 'Katana'), [bare[0] + 3, bare[1]]);
      await page.evaluate(() => window.__L5R_TEST__.advanceCombatRound());
      check('ATARASI-DAMAGE-NEXT-ROUND', await dmg(page, 'Katana'), bare);
      await closeAll(page);
      r = await roll(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 1 }, [4, 2], { tick: ['atarasi-strike'], answers: ['cancel'] });
      check('ATARASI-TAINT-NO-VOID', [r.dice, await voids(page)], [7, 1]);
      await closeAll(page);
      r = await roll(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 1 }, [4, 2], { tick: ['atarasi-strike'], answers: ['x'] });
      check('ATARASI-X-CANCELS', [r.rolled, await voids(page)], [false, 1]);
      await closeAll(page);
      // Chuda Bikimi: the slot is the player's to mark; the sheet asks, then adds +0k1 to his +1k0.
      await setup(page, { clan: 'Spider', school: 'Kuni Shugenja', voids: 2 });
      await choose(page, 'Chuda Bikimi');
      r = await roll(page, 'SKILL', { skillName: 'Stealth', traitName: 'Agility', skillRank: 1 }, [3, 2], { tick: ['bikimi-slot'], answers: ['ok'] });
      check('BIKIMI-WITH-SLOT', [r.dice, r.kept, /spell slot/.test(r.messages[0] || '')], [4, 3, true]);
      await closeAll(page);
      r = await roll(page, 'SKILL', { skillName: 'Stealth', traitName: 'Agility', skillRank: 1 }, [3, 2], { tick: ['bikimi-slot'], answers: ['cancel'] });
      check('BIKIMI-WITHOUT-SLOT', [r.dice, r.kept], [4, 2]);
    });

    const AFTER = ['KAKITA-BLOCK', 'KAKITA-ARTISAN', 'KAKITA-NOT-KENJUTSU', 'KAKITA-PAYS', 'KAKITA-BETTER-KEPT', 'KAKITA-POOL-PLUS-ONE',
      'KAKITA-FIRST-KEPT', 'KAKITA-NO-VOID-DISABLED', 'SUNTAO-BLOCK', 'SUNTAO-NOT-COURTIER', 'SUNTAO-SUCCESS-REFUSED', 'SUNTAO-SUCCESS-NOTHING-SPENT',
      'SUNTAO-ADDS-DIE', 'SUNTAO-KEEPS-YOUR-DICE', 'SUNTAO-PAYS', 'SUNTAO-NOT-RESORTED', 'TOKU-BLOCK-ANY-ROLL', 'TOKU-HIGHER-KEPT', 'TOKU-SESSION-MARKED',
      'TOKU-SPENT-DISABLED', 'TOKU-RESET-READY', 'LOST-NOTHING-AFTER'];
    await scenario('AFTER', AFTER, async check => {
      if (noRolls) {
        await setup(page, { clan: 'Crane', voids: 2 });
        await choose(page, 'Kakita');
        const r0 = await roll(page, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes', skillRank: 1 }, [4, 3]);
        check('KAKITA-BLOCK', r0.after, []);
        skipAll(check, AFTER.filter(n => n !== 'KAKITA-BLOCK'));
        return;
      }
      await setup(page, { clan: 'Crane', voids: 2 });
      await choose(page, 'Kakita');
      // A first roll of all 1s, then a re-roll of all 9s: the re-roll is better.
      let r = await roll(page, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes', skillRank: 1 }, [4, 3], { random: 0.05 });
      check('KAKITA-BLOCK', r.after, ['kakita']);
      let c = await clickAfter(page, 'kakita', 0.85);
      check('KAKITA-PAYS', await voids(page), 1);
      check('KAKITA-BETTER-KEPT', [/Kakita/.test(c.title), c.total, /re-roll is better/.test(c.outcome)], [true, 36, true]);
      check('KAKITA-POOL-PLUS-ONE', [c.dice, c.kept], [5, 4]);
      await closeAll(page);
      r = await roll(page, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes', skillRank: 1 }, [4, 3], { random: 0.85 });
      c = await clickAfter(page, 'kakita', 0.05);
      check('KAKITA-FIRST-KEPT', [c.title, c.total, c.dice, /first roll is as good/.test(c.outcome)], ['Ancestor probe', 27, 4, true]);
      await closeAll(page);
      r = await roll(page, 'SKILL', { skillName: 'Artisan: Painting', traitName: 'Awareness', skillRank: 1 }, [3, 2]);
      check('KAKITA-ARTISAN', r.after, ['kakita']);
      await closeAll(page);
      r = await roll(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 1 }, [3, 2]);
      check('KAKITA-NOT-KENJUTSU', r.after, []);
      await closeAll(page);
      await page.evaluate(() => { document.getElementById('void_current').value = '0'; window.__L5R_TEST__.renderVoidPips(); });
      await roll(page, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes', skillRank: 1 }, [4, 3]);
      const blocked = await after(page, 'kakita');
      check('KAKITA-NO-VOID-DISABLED', !!blocked && blocked.disabled && /no Void Points left/.test(blocked.text));
      await closeAll(page);
      // Sun Tao: offered after a Bugei roll; refused on a roll that met its TN; otherwise one more die.
      await setup(page, { clan: 'Ronin', voids: 2 });
      await choose(page, 'Sun Tao');
      r = await roll(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 1 }, [3, 2], { random: 0.85, tn: 10 });
      check('SUNTAO-BLOCK', r.after, ['sun-tao']);
      c = await clickAfter(page, 'sun-tao');
      check('SUNTAO-SUCCESS-REFUSED', /meets its TN/.test(c.outcome));
      check('SUNTAO-SUCCESS-NOTHING-SPENT', await voids(page), 2);
      await closeAll(page);
      // All 1s against TN 30 fails; keep two of the three, and the new die (a 9) joins them.
      r = await roll(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 1 }, [3, 2], { random: 0.05, tn: 30 });
      c = await clickAfter(page, 'sun-tao', 0.85);
      check('SUNTAO-ADDS-DIE', [c.dice, c.total], [4, 11]);
      check('SUNTAO-KEEPS-YOUR-DICE', c.kept, 3);
      check('SUNTAO-PAYS', await voids(page), 1);
      await closeAll(page);
      r = await roll(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness', skillRank: 1 }, [3, 2]);
      check('SUNTAO-NOT-COURTIER', r.after, []);
      await closeAll(page);
      // Mixed dice, 9, 5 and 3, keeping the 9 and the 5 (14 fails against TN 30). Sun Tao's die is a
      // 2: it joins the dice you kept (16); it never swaps in the 3 as the best three would (17).
      // With every die equal (above) the two readings agree, so only this roll can tell them apart.
      // A fresh character with its own Void Points, so this check never depends on the ones above.
      await setup(page, { clan: 'Ronin', voids: 2 });
      await choose(page, 'Sun Tao');
      await roll(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 1 }, [3, 2], { random: [0.85, 0.45, 0.25], tn: 30 });
      c = await clickAfter(page, 'sun-tao', 0.15);
      check('SUNTAO-NOT-RESORTED', [await page.evaluate(() => [...document.querySelectorAll('#rollDiceRow .roll-die.kept')]
        .map(e => Number(e.dataset.total)).sort((a, b) => b - a)), c.total], [[9, 5, 2], 16]);
      await closeAll(page);
      // Toku: any roll, once a session, keep the higher.
      await setup(page, { clan: 'Monkey', voids: 2 });
      await choose(page, 'Toku');
      r = await roll(page, 'TRAIT', { traitName: 'Awareness' }, [2, 2], { random: 0.05 });
      check('TOKU-BLOCK-ANY-ROLL', r.after, ['toku']);
      c = await clickAfter(page, 'toku', 0.85);
      check('TOKU-HIGHER-KEPT', [/Toku/.test(c.title), c.total], [true, 18]);
      check('TOKU-SESSION-MARKED', (await state(page)).sessionUsed, true);
      await closeAll(page);
      await roll(page, 'TRAIT', { traitName: 'Awareness' }, [2, 2]);
      const spent = await after(page, 'toku');
      check('TOKU-SPENT-DISABLED', !!spent && spent.disabled && /\(0\/1\)/.test(spent.text));
      await closeAll(page);
      await page.evaluate(() => window.__L5R_TEST__.ANC48.resetSession());
      await roll(page, 'TRAIT', { traitName: 'Awareness' }, [2, 2]);
      const ready = await after(page, 'toku');
      check('TOKU-RESET-READY', !!ready && !ready.disabled && /\(1\/1\)/.test(ready.text));
      await closeAll(page);
      await setup(page, { clan: 'Crane', voids: 2 });
      await pick(page, 'Kakita');
      await badge(page, true);
      r = await roll(page, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes', skillRank: 1 }, [4, 3]);
      check('LOST-NOTHING-AFTER', r.after, []);
    });

    await scenario('SESSION', ['SEPPUN-LINE', 'USE-NOW-ASKS', 'USE-NOW-MARKS', 'USE-NOW-GONE', 'RESET', 'IONGI-USE-NOW-ROUND', 'QUICK-ACCESS-LISTS', 'NO-LINE-FOR-OTHERS'], async check => {
      await setup(page, { clan: 'Imperial', voids: 2 });
      await pick(page, 'Seppun');
      check('SEPPUN-LINE', (await card(page)).session, 'Seppun’s free Void Point: ready this session (1/1)Use it nowReset session');
      const message = await press(page, 'anc48UseNow', 'ok');
      check('USE-NOW-ASKS', /Apply its effect yourself/.test(message));
      check('USE-NOW-MARKS', [(await state(page)).sessionUsed, await voids(page)], [true, 2]);
      check('USE-NOW-GONE', await page.evaluate(() => !document.getElementById('anc48UseNow') && !document.getElementById('anc48ResetSession').disabled));
      await page.evaluate(() => document.getElementById('anc48ResetSession').click());
      await page.waitForTimeout(60);
      check('RESET', [(await state(page)).sessionUsed, (await card(page)).session.includes('ready this session')], [false, true]);
      await setup(page, { clan: 'Bat', voids: 2, combat: true });
      await pick(page, 'Komori Iongi');
      await press(page, 'anc48UseNow', 'ok');
      check('IONGI-USE-NOW-ROUND', [(await state(page)).sessionUsed, await page.evaluate(() => window.__L5R_TEST__.hasSpentThisRound('void'))], [true, true]);
      await setup(page, { clan: 'Monkey' });
      await pick(page, 'Toku');
      check('QUICK-ACCESS-LISTS', await page.evaluate(() => { const T = window.__L5R_TEST__;
        if (typeof T.renderAdvConfigSessionResources !== 'function' || !document.getElementById('quickAccessPanel')) return true;
        T.renderAdvConfigSessionResources(); const b = document.getElementById('advConfigSessionResources');
        return !!b && /Toku’s Luck/.test(b.textContent) && /1\/1/.test(b.textContent); }));
      await setup(page, { clan: 'Crab' });
      await pick(page, 'Hida');
      check('NO-LINE-FOR-OTHERS', (await card(page)).session, null);
    });

    await scenario('DAMAGE', ['HIDA-KATANA', 'HIDA-BOW', 'HIDA-UNARMED', 'IKOMA-UNARMED', 'IKOMA-KATANA', 'ROLL-DICE', 'ROLL-NOTE', 'NO-ANCESTOR-NOTE', 'ATARASI-NOTHING-UNPAID'], async check => {
      await setup(page, { clan: 'Crab' });
      const base = { katana: await dmg(page, 'Katana'), yumi: await dmg(page, 'Yumi'), unarmed: await dmg(page, 'Unarmed') };
      await choose(page, 'Hida');
      check('HIDA-KATANA', await dmg(page, 'Katana'), [base.katana[0] + 1, base.katana[1]]);
      check('HIDA-BOW', await dmg(page, 'Yumi'), [base.yumi[0] + 1, base.yumi[1]]);
      check('HIDA-UNARMED', await dmg(page, 'Unarmed'), [base.unarmed[0] + 1, base.unarmed[1]]);
      const rolled = page.evaluate(() => window.__L5R_TEST__.rollWeaponDamage('Katana'));
      rolled.catch(() => {});
      await page.waitForSelector('#rollDiceRow .roll-die');
      const r = await page.evaluate(() => ({ dice: document.querySelectorAll('#rollDiceRow .roll-die').length,
        note: [...document.querySelectorAll('#rollModalBody .anc48-roll-note')].map(n => n.textContent) }));
      check('ROLL-DICE', r.dice, base.katana[0] + 1);
      check('ROLL-NOTE', r.note.length === 1 && /Hida/.test(r.note[0]));
      await closeAll(page);
      await setup(page, { clan: 'Lion' });
      await choose(page, 'Ikoma');
      check('IKOMA-UNARMED', await dmg(page, 'Unarmed'), [base.unarmed[0] + 2, base.unarmed[1]]);
      check('IKOMA-KATANA', await dmg(page, 'Katana'), base.katana);
      await setup(page, { clan: 'Crab' });
      const plain = page.evaluate(() => window.__L5R_TEST__.rollWeaponDamage('Katana'));
      plain.catch(() => {});
      await page.waitForSelector('#rollDiceRow .roll-die');
      check('NO-ANCESTOR-NOTE', await page.evaluate(() => document.querySelectorAll('#rollModalBody .anc48-roll-note').length), 0);
      await closeAll(page);
      await setup(page, { clan: 'Spider', combat: true });
      await choose(page, 'Hida Atarasi');
      check('ATARASI-NOTHING-UNPAID', await dmg(page, 'Katana'), base.katana);
    });

    await scenario('ARMOR', ['SHIBA-ADDS-INT', 'LOST-REMOVES', 'OTHERS-NOTHING'], async check => {
      await setup(page, { clan: 'Phoenix', traits: { intelligence: 4 } });
      const before = await tn(page);
      await pick(page, 'Shiba');
      check('SHIBA-ADDS-INT', await tn(page) - before, 4);
      await badge(page, true);
      check('LOST-REMOVES', await tn(page), before);
      await setup(page, { clan: 'Phoenix', traits: { intelligence: 4 } });
      await pick(page, 'Asako');
      check('OTHERS-NOTHING', await tn(page), before);
    });

    await scenario('FLAGS', ['KAKITA-LOW', 'KAKITA-OK', 'AKODO-LOW', 'BAYUSHI-HIGH', 'ATARASI-HIGH', 'KUNI-TAINT', 'NEVER-AUTO-LOST', 'BAYUSHI-UNTRAINED', 'OTHER-CLAN-NOT-APPLIED',
      'HIRUMA-ABOVE', 'HIRUMA-AT-FIVE', 'HITOMI-LOW', 'TOKU-LOW', 'YAMATSU-TAINT', 'KAETERU-WORLDLY', 'KAETERU-THREE-IS-FINE'], async check => {
      const flags = async (clan, name, extra) => { await setup(page, as(clan, extra)); await choose(page, name); return (await card(page)).flags; };
      check('KAKITA-LOW', (await flags('Crane', 'Kakita', { honor: 3.9 })).some(t => /below 4\.0/.test(t)));
      check('KAKITA-OK', await flags('Crane', 'Kakita', { honor: 4.0 }), []);
      check('AKODO-LOW', (await flags('Lion', 'Akodo', { honor: 4.9 })).some(t => /below 5\.0/.test(t)));
      check('BAYUSHI-HIGH', (await flags('Scorpion', 'Bayushi', { honor: 5.0, school: 'Bayushi Bushi' })).some(t => /5\.0 or more/.test(t)));
      check('ATARASI-HIGH', (await flags('Spider', 'Hida Atarasi', { honor: 3.0 })).some(t => /3\.0 or more/.test(t)));
      check('KUNI-TAINT', (await flags('Crab', 'Kuni', { taint: 1 })).some(t => /Taint/.test(t)));
      check('NEVER-AUTO-LOST', (await state(page)).lost, false);
      check('BAYUSHI-UNTRAINED', (await flags('Scorpion', 'Bayushi', { honor: 2.0, school: 'Soshi Shugenja' })).some(t => /Bayushi School/.test(t)));
      // A Crab who becomes a Crane keeps the choice, charged and flagged, with nothing applied.
      await setup(page, { clan: 'Crab' });
      await choose(page, 'Hida');
      await page.evaluate(() => { document.getElementById('f_clan').value = 'Crane'; window.__L5R_TEST__.recalcAll(); });
      const c = await card(page);
      check('OTHER-CLAN-NOT-APPLIED', [c.flags.some(t => /guides only the Crab Clan/.test(t)), /anc48-inactive/.test(c.cls), await dmg(page, 'Katana')],
        [true, true, await page.evaluate(() => { const T = window.__L5R_TEST__; const e = T.WEAPON_LIBRARY.find(x => x.name === 'Katana');
          const s = document.getElementById('f_ancestor').value; document.getElementById('f_ancestor').value = ''; const d = T.getWeaponDamageDice(e, 0);
          document.getElementById('f_ancestor').value = s; return [d.numDice, d.keepDice]; })]);
      check('HIRUMA-ABOVE', (await flags('Crab', 'Hiruma', { honor: 5.1 })).some(t => /above 5\.0/.test(t)));
      check('HIRUMA-AT-FIVE', await flags('Crab', 'Hiruma', { honor: 5.0 }), []);
      check('HITOMI-LOW', (await flags('Lion', 'Matsu Hitomi', { honor: 4.9 })).some(t => /below 5\.0/.test(t)));
      check('TOKU-LOW', (await flags('Monkey', 'Toku', { honor: 4.9 })).some(t => /below 5\.0/.test(t)));
      check('YAMATSU-TAINT', (await flags('Dragon', 'Togashi Yamatsu', { taint: 1, school: 'The Togashi Tattooed Order [Monk]' })).some(t => /Taint/.test(t)));
      check('KAETERU-WORLDLY', (await flags('Phoenix', 'Naka Kaeteru', { skills: [['Courtier', 'Awareness', 4], ['Stealth', 'Agility', 5]] }))
        .some(t => /Courtier 4, Stealth 5/.test(t) && /worldliness/.test(t)));
      check('KAETERU-THREE-IS-FINE', await flags('Phoenix', 'Naka Kaeteru', { skills: [['Courtier', 'Awareness', 3], ['Commerce', 'Intelligence', 3]] }), []);
    });

    await scenario('CHECKS', ['KITSU-OTHER-FAMILY', 'KITSU-OWN-FAMILY', 'KITSU-NO-FAMILY-YET', 'OSUSUKI-FOX-KITSUNE', 'OTAKU-UTAKU', 'OTAKU-GENDER-NOTE',
      'IUCHI-NOT-SHUGENJA', 'IUCHI-SHUGENJA', 'YAMATSU-NOT-TATTOOED', 'YAMATSU-TATTOOED', 'BASSO-OTHER-ORDER', 'BASSO-SHINMAKI',
      'SAKURA-FORTUNIST', 'SAKURA-SHINTAO', 'KAZE-SHINTAO', 'MIYUKO-NOT-SHUGENJA', 'NEVER-BLOCKS'], async check => {
      const warn = async (faction, name, extra) => { await setup(page, as(faction, extra)); await choose(page, name); return (await card(page)).flags; };
      check('KITSU-OTHER-FAMILY', (await warn('Lion', 'Kitsu', { family: 'Matsu' })).some(t => /Your Family is Matsu/.test(t)));
      check('KITSU-OWN-FAMILY', await warn('Lion', 'Kitsu', { family: 'Kitsu' }), []);
      check('KITSU-NO-FAMILY-YET', await warn('Lion', 'Kitsu', {}), []);
      check('OSUSUKI-FOX-KITSUNE', await warn('Fox', 'Osusuki & Akomachi', { family: 'Kitsune' }), []);
      check('OTAKU-UTAKU', await warn('Unicorn', 'Otaku', { family: 'Utaku' }), []);
      check('OTAKU-GENDER-NOTE', /women/.test((await card(page)).text));
      check('IUCHI-NOT-SHUGENJA', (await warn('Unicorn', 'Iuchi', { family: 'Iuchi', school: 'Shinjo Bushi' })).some(t => /shugenja School/.test(t)));
      check('IUCHI-SHUGENJA', await warn('Unicorn', 'Iuchi', { family: 'Iuchi', school: 'Iuchi Shugenja' }), []);
      check('YAMATSU-NOT-TATTOOED', (await warn('Dragon', 'Togashi Yamatsu', { school: 'Mirumoto Bushi' })).some(t => /tattooed order/.test(t)));
      check('YAMATSU-TATTOOED', await warn('Dragon', 'Togashi Yamatsu', { school: 'The Togashi Tattooed Order [Monk]' }), []);
      check('BASSO-OTHER-ORDER', (await warn('Brotherhood of Shinsei', 'Basso', { school: 'The Four Temples [Monk]' })).some(t => /Shinmaki Order/.test(t)));
      check('BASSO-SHINMAKI', await warn('Brotherhood of Shinsei', 'Basso', { school: 'Shinmaki Order [Monk]' }), []);
      check('SAKURA-FORTUNIST', (await warn('Brotherhood of Shinsei', 'Sakura', { school: 'The Temple of Osano-Wo [Monk]' })).some(t => /devotion is Fortunist/.test(t)));
      check('SAKURA-SHINTAO', await warn('Brotherhood of Shinsei', 'Sakura', { school: 'The Four Temples [Monk]' }), []);
      check('KAZE-SHINTAO', (await warn('Brotherhood of Shinsei', 'Togashi Kaze', { school: 'The Four Temples [Monk]' })).some(t => /devotion is Shintao/.test(t)));
      check('MIYUKO-NOT-SHUGENJA', (await warn('Ronin', 'Miyuko', {})).some(t => /shugenja School/.test(t)));
      // A warning is never a block: the gifts still apply.
      await setup(page, { clan: 'Lion', family: 'Matsu' });
      await choose(page, 'Kitsu');
      check('NEVER-BLOCKS', await mods(page, 'SKILL', { skillName: 'Lore: Spirit Realms', traitName: 'Intelligence' }), noRolls ? [] : [[1, 1]]);
    });

    await scenario('NOTES', ['MIYA-DAYS', 'CHIRORU-SIBLINGS', 'YOGO-CURSE-MISSING', 'YOGO-CURSE-PRESENT', 'AGASHA-TRANSMUTE', 'BOOK-PAGE-ON-CARD'], async check => {
      await setup(page, { clan: 'Imperial', honor: 4.5 });
      await choose(page, 'Miya');
      check('MIYA-DAYS', (await card(page)).notes.some(t => /4 days/.test(t)));
      await setup(page, { clan: 'Ronin', voidRing: 3 });
      await choose(page, 'Chiroru');
      check('CHIRORU-SIBLINGS', (await card(page)).notes.some(t => /up to 3 siblings/.test(t)));
      await setup(page, { clan: 'Scorpion' });
      await choose(page, 'Yogo');
      check('YOGO-CURSE-MISSING', (await card(page)).notes.some(t => /Bad Fortune \(Yogo Curse\)/.test(t)));
      await setup(page, { clan: 'Scorpion', disadvs: ['Bad Fortune'] });
      await choose(page, 'Yogo');
      check('YOGO-CURSE-PRESENT', (await card(page)).notes.some(t => /Bad Fortune/.test(t)), false);
      await setup(page, { clan: 'Dragon' });
      await choose(page, 'Agasha, most favoured');
      check('AGASHA-TRANSMUTE', /Transmute/.test((await card(page)).text));
      await setup(page, { picker: 'Brotherhood of Shinsei' });
      await choose(page, 'Sakura');
      check('BOOK-PAGE-ON-CARD', (await card(page)).text.includes('Secrets of the Empire p. 247'));
    });

    await scenario('PLAY', ['PICK-LOCKED', 'CHANGE-BLOCKED', 'BADGE-LIVE', 'INFO-LIVE', 'UNLOCKED-AGAIN', 'SESSION-LIVE'], async check => {
      if (noModes) { skipAll(check, ['PICK-LOCKED', 'CHANGE-BLOCKED', 'BADGE-LIVE', 'INFO-LIVE', 'UNLOCKED-AGAIN', 'SESSION-LIVE']); return; }
      await setup(page, { clan: 'Crab' });
      await pick(page, 'Hida');
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
      check('PICK-LOCKED', await page.evaluate(() => { const s = document.getElementById('anc48Pick'); return s.disabled && s.hasAttribute('data-pm12-locked'); }));
      await page.evaluate(() => { const s = document.getElementById('anc48Pick'); s.value = 'Kuni'; s.dispatchEvent(new Event('change', { bubbles: true })); });
      await page.waitForTimeout(80);
      check('CHANGE-BLOCKED', (await state(page)).name, 'Hida');
      await badge(page, true);
      check('BADGE-LIVE', (await state(page)).lost, true);
      await page.evaluate(() => document.getElementById('anc48Info').click());
      check('INFO-LIVE', await page.evaluate(() => document.getElementById('stanceInfoOverlay').style.display), 'flex');
      await page.evaluate(() => { document.getElementById('stanceInfoOverlay').style.display = 'none'; window.__L5R_TEST__.MODES12.set('management'); });
      check('UNLOCKED-AGAIN', await page.evaluate(() => !document.getElementById('anc48Pick').hasAttribute('data-pm12-locked')));
      await setup(page, { clan: 'Imperial' });
      await pick(page, 'Seppun');
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
      await press(page, 'anc48UseNow', 'ok');
      check('SESSION-LIVE', (await state(page)).sessionUsed, true);
    });

    await scenario('WIZARD', ['BLOCK', 'CARDS', 'PICKED', 'SAME-AS-SHEET', 'DETAILS', 'REVIEW-ROW', 'NONE-CARD'], async check => {
      if (noWizard) { skipAll(check, ['BLOCK', 'CARDS', 'PICKED', 'SAME-AS-SHEET', 'DETAILS', 'REVIEW-ROW', 'NONE-CARD']); return; }
      await setup(page, {});
      await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; W.start(); W.index = W.steps.findIndex(s => s.id === 'clan'); W.render(); });
      await page.locator('#cw112Body button.cw112-card', { hasText: 'Crab' }).first().click();
      await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; W.index = W.steps.findIndex(s => s.id === 'family'); W.render(); });
      await page.locator('#cw112Body button.cw112-card', { hasText: 'Hida' }).first().click();
      check('BLOCK', await page.evaluate(() => !!document.querySelector('#cw112Body #anc48Wizard')));
      const titles = () => page.evaluate(() => [...document.querySelectorAll('#anc48Wizard .cw112-card-title')].map(t => t.textContent));
      check('CARDS', await titles(), ['No Ancestor', 'Hida', 'Kuni', 'Hiruma', 'Kaiu', ...SPIDER]);
      await page.locator('#anc48Wizard button.cw112-card', { hasText: 'Kuni' }).first().click();
      await page.waitForTimeout(80);
      const s = await state(page);
      check('PICKED', s && s.name, 'Kuni');
      check('SAME-AS-SHEET', s, { v: 1, name: 'Kuni', lost: false, regained: false, final: false, gm: false });
      check('DETAILS', await page.evaluate(() => /Kuni/.test(document.querySelector('#anc48Wizard .anc48-details')?.textContent || '')));
      await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; W.index = W.steps.findIndex(x => x.id === 'review'); W.render(); });
      check('REVIEW-ROW', await page.evaluate(() => { const dts = [...document.querySelectorAll('#cw112Body .cw112-summary dt')];
        const i = dts.findIndex(d => d.textContent === 'Ancestor'); return i < 0 ? null : dts[i].nextElementSibling.textContent; }), 'Kuni (8 XP)');
      await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; W.index = W.steps.findIndex(x => x.id === 'family'); W.render(); });
      await page.locator('#anc48Wizard button.cw112-card', { hasText: 'No Ancestor' }).click();
      await page.waitForTimeout(80);
      check('NONE-CARD', await state(page), null);
    });

    await scenario('END', ['NO-ERRORS'], async check => { check('NO-ERRORS', page.errors, []); });
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(passed + '/' + results.length + ' checks passed');
  if (passed !== results.length || !results.length) process.exitCode = 1;
});
