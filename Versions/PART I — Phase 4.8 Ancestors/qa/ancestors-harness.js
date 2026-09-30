/*
 * Phase 4.8 (Part I), Ancestors: real-browser acceptance. The input HTML is read only.
 *   node ancestors-harness.js <sheet.html> [--absent] [--no-rolls] [--no-declare] [--no-modes] [--no-wizard]
 *
 * Oracles are the Core Rulebook's pages as the owner photographed them on 30 September 2026
 * (pp. 241-244): each Ancestor's Clan, cost and dice below are written here from the book, never
 * read from ANC48. Pools are checked two ways: the pipeline's own modifier list, and REAL rolls
 * whose rendered dice are counted. Experience, damage and Armor TN are read from the sheet's own
 * fields and functions (f_xpSpent, getWeaponDamageDice, f_currentTN), before and after.
 *
 * --absent     this part removed or ANCESTORS_ENABLED off: no Ancestor block, and a save that
 *              carries an Ancestor changes nothing.
 * --no-rolls   Phase 4.5's roll effects off (ADV_CONFIG_ROLL_EFFECTS_ENABLED): no roll bonus or
 *              declaration; card, cost, damage and Armor TN unchanged.
 * --no-declare Feature 4.5.15's registry off: automatic bonuses stay, nothing is offered to tick.
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

// ---- Core Rulebook pp. 242-244, in printed order: [name, Clan, cost] ----
const BOOK = [
  ['Hida', 'Crab', 14], ['Kuni', 'Crab', 8], ['Doji', 'Crane', 8], ['Kakita', 'Crane', 12],
  ['Agasha Kitsuki', 'Dragon', 11], ['Mirumoto', 'Dragon', 9], ['Akodo', 'Lion', 12], ['Ikoma', 'Lion', 9],
  ['Kaimetsu-Uo', 'Mantis', 9], ['Gusai', 'Mantis', 5], ['Asako', 'Phoenix', 5], ['Shiba', 'Phoenix', 9],
  ['Bayushi', 'Scorpion', 12], ['Shosuro', 'Scorpion', 8], ['Hida Atarasi', 'Spider', 7], ['Kuni Yori', 'Spider', 5],
  ['Moto', 'Unicorn', 10], ['Shinjo', 'Unicorn', 8]];
const COST = Object.fromEntries(BOOK.map(b => [b[0], b[2]]));
const BADGE = 'Lost ancestor’s favour';

async function closeAll(page) {
  await page.evaluate(() => {
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
// A fresh character: Clan (as Apply Family records it), School, Honor, Taint and Traits.
const setup = (p, o = {}) => p.evaluate(o => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.resetToBaseline();
  $('cfs_clan').value = o.picker || 'Brotherhood of Shinsei';
  $('cfs_clan').dispatchEvent(new Event('change'));
  $('f_clan').value = o.clan || '';
  T.saveSchoolsList(o.school ? [{ name: o.school, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 }] : []);
  if (o.honor !== undefined) $('f_honorPts').value = String(o.honor);
  if (o.taint !== undefined) $('f_taint').value = String(o.taint);
  Object.entries(o.traits || {}).forEach(([k, v]) => { $('trait_' + k).value = String(v); });
  if (o.xpTotal !== undefined) $('f_xpTotal').value = String(o.xpTotal);
  T.recalcAll();
}, o);
const state = p => p.evaluate(() => { const f = document.getElementById('f_ancestor'); return f && f.value ? JSON.parse(f.value) : null; });
const xp = p => p.evaluate(() => ({ spent: Number(document.getElementById('f_xpSpent').value), remain: Number(document.getElementById('f_xpRemain').value) }));
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
// Press the favour badge and answer its confirmation (or its notice).
async function badge(p, answer = true) {
  await p.evaluate(() => window.__L5R_CAROUSEL__?.goToTab?.('Clan & School'));
  await p.evaluate(() => document.getElementById('anc48Badge').click());
  await p.waitForSelector('#appConfirmOverlay', { state: 'visible' });
  const message = await p.evaluate(() => document.getElementById('appConfirmMsg').textContent);
  await p.locator(answer ? '#appConfirmOk' : '#appConfirmCancel').click();
  await p.waitForTimeout(80);
  return message;
}
const mods = (p, kind, ctx) => p.evaluate(({ kind, ctx }) => { const T = window.__L5R_TEST__;
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(m => /^Ancestor/.test(m.label)).map(m => [m.rolledDelta, m.keptDelta]); }, { kind, ctx });
const offers = (p, kind, ctx) => p.evaluate(({ kind, ctx }) => { const T = window.__L5R_TEST__;
  return T.RD4515 ? T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(o => o.provider === 'ancestors').map(o => o.key.split(':')[1]) : []; }, { kind, ctx });
// A declared bonus through the registry's own start/toggle, read back from the pipeline.
const declared = (p, kind, ctx, key) => p.evaluate(({ kind, ctx, key }) => { const T = window.__L5R_TEST__;
  const c = T.makeRollContext(T.ROLL_KINDS[kind], ctx);
  T.RD4515.start(c); T.RD4515.toggle('ancestors:' + key, true);
  const out = T.getPreRollModifiers(c).filter(m => /^Ancestor/.test(m.label)).map(m => [m.rolledDelta, m.keptDelta]);
  T.RD4515.cancel(); return out.map(m => JSON.stringify(m)).sort().map(m => JSON.parse(m)); }, { kind, ctx, key });
// A REAL roll through the preview: tick the named declarations, count the rendered dice.
async function roll(p, kind, ctx, base, tick = []) {
  const pending = p.evaluate(({ kind, ctx, base }) => { const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Ancestor probe', T.makeRollContext(T.ROLL_KINDS[kind], ctx), base[0], base[1]).then(r => !!r); }, { kind, ctx, base });
  pending.catch(() => {});
  await p.waitForSelector('#rollPreviewGo', { state: 'visible' });
  for (const k of tick) await p.locator('#rollPreviewBody input[data-rd4515-key="ancestors:' + k + '"]').check();
  await p.locator('#rollPreviewGo').click();
  await pending;
  await p.waitForSelector('#rollDiceRow .roll-die');
  const r = await p.evaluate(() => ({ dice: document.querySelectorAll('#rollDiceRow .roll-die').length,
    kept: document.querySelectorAll('#rollDiceRow .roll-die.kept').length }));
  await closeAll(p);
  return r;
}
const dmg = (p, weapon) => p.evaluate(w => { const T = window.__L5R_TEST__;
  const e = T.WEAPON_LIBRARY.find(x => x.name === w); const d = T.getWeaponDamageDice(e, 0); return [d.numDice, d.keepDice]; }, weapon);
const tn = p => p.evaluate(() => Number(document.getElementById('f_currentTN').value));
const card = p => p.evaluate(() => { const c = document.getElementById('anc48Card');
  return c ? { hidden: c.hidden, cls: c.className, text: c.textContent, flags: [...c.querySelectorAll('.anc48-flag')].map(e => e.textContent),
    badge: c.querySelector('#anc48Badge') ? { text: c.querySelector('#anc48Badge').textContent, pressed: c.querySelector('#anc48Badge').getAttribute('aria-pressed'),
      disabled: c.querySelector('#anc48Badge').disabled } : null } : null; });

async function main() {
  if (!sheet) throw new Error('usage: node ancestors-harness.js <sheet.html> [flags]');
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  let page;
  try {
    page = await open(browser);
    PAGE = page;

    if (absent) {
      await scenario('ABSENT', ['NO-BLOCK', 'NO-FIELD', 'SAVE-IGNORED-XP', 'SAVE-IGNORED-DAMAGE', 'NO-WIZARD-BLOCK', 'NO-ERRORS'], async check => {
        check('NO-BLOCK', await page.evaluate(() => !document.getElementById('anc48Section')));
        check('NO-FIELD', await page.evaluate(() => !document.getElementById('f_ancestor')));
        await setup(page, { clan: 'Crab', picker: 'Crab' });
        const before = await xp(page), katana = await dmg(page, 'Katana');
        await page.evaluate(() => { const T = window.__L5R_TEST__; const d = T.collectData();
          d.fields.f_ancestor = JSON.stringify({ v: 1, name: 'Hida', lost: false, regained: false, final: false, gm: false }); T.applyData(d); });
        check('SAVE-IGNORED-XP', await xp(page), before);
        check('SAVE-IGNORED-DAMAGE', await dmg(page, 'Katana'), katana);
        if (!noWizard) {
          await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; W.start(); W.index = W.steps.findIndex(s => s.id === 'family'); W.render(); });
          check('NO-WIZARD-BLOCK', await page.evaluate(() => !document.getElementById('anc48Wizard')));
        } else check('NO-WIZARD-BLOCK', true);
        check('NO-ERRORS', page.errors, []);
      });
      return;
    }

    await scenario('PLACE', ['IN-CLAN-TAB', 'AFTER-PICKERS', 'HIDDEN-FIELD', 'LABEL', 'NO-CARD-YET', 'NOT-AN-ADVANTAGE', 'INFO'], async check => {
      check('IN-CLAN-TAB', await page.evaluate(() => document.getElementById('anc48Section')?.closest('.car-page')?.dataset.tabLabel), 'Clan & School');
      check('AFTER-PICKERS', await page.evaluate(() => { const s = document.getElementById('anc48Section'), f = document.getElementById('cfs_family');
        return !!s && !!(f.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) && s.parentElement === f.closest('.section'); }));
      check('HIDDEN-FIELD', await page.evaluate(() => { const f = document.getElementById('f_ancestor'); return !!f && f.type === 'hidden' && f.value === ''; }));
      check('LABEL', await page.evaluate(() => document.querySelector('label[for="anc48Pick"]')?.textContent), 'Ancestor');
      check('NO-CARD-YET', await page.evaluate(() => document.getElementById('anc48Card').hidden));
      check('NOT-AN-ADVANTAGE', await page.evaluate(() => [...document.querySelectorAll('#advQuickAdd option')].some(o => /ancestor/i.test(o.value))), false);
      await page.evaluate(() => document.getElementById('anc48Info').click());
      check('INFO', await page.evaluate(() => { const b = document.getElementById('stanceInfoBody').textContent;
        return document.getElementById('stanceInfoOverlay').style.display === 'flex' && /Loyalty/.test(b) && /Piety/.test(b) && /Jealousy/.test(b) && /Demands/.test(b) && /Jigoku/.test(b); }));
    });

    await scenario('LIBRARY', ['ORDER', 'COSTS', 'CARD-PAGE', 'CARD-SECTIONS'], async check => {
      // Every Ancestor, as its own Clan sees it. The option text gives name and cost.
      const seen = [], cards = [];
      for (const [name, clan] of BOOK) {
        await setup(page, { clan });
        const option = await page.evaluate(n => { const o = [...document.getElementById('anc48Pick').options].find(x => x.value === n); return o ? o.textContent : null; }, name);
        await page.evaluate(n => window.__L5R_TEST__.ANC48.choose(n), name);
        seen.push([name, option]);
        cards.push(await card(page));
      }
      check('ORDER', await page.evaluate(() => [...document.getElementById('anc48Pick').options].map(o => o.value).filter(Boolean).sort()), BOOK.map(b => b[0]).sort());
      check('COSTS', seen.map(([n, o]) => (o || '').replace(/\s+/g, ' ')), BOOK.map(([n, , c]) => n + ' — ' + c + ' XP'));
      check('CARD-PAGE', cards.map(c => /Core Rulebook pp?\. 24[1-4]/.test(c.text) && c.text.includes(' XP')), BOOK.map(() => true));
      check('CARD-SECTIONS', cards.map(c => /Gifts/.test(c.text) && /Demands/.test(c.text) && !!c.badge && c.badge.text === BADGE), BOOK.map(() => true));
    });

    await scenario('OFFER', ['CRAB', 'MANTIS-MINOR', 'SPIDER-OWN', 'NO-CLAN', 'OTHER-REFUSED', 'OTHER-NOT-SAVED', 'PICKER-FALLBACK'], async check => {
      const enabled = () => page.evaluate(() => [...document.getElementById('anc48Pick').options].filter(o => o.value && !o.disabled).map(o => o.value));
      await setup(page, { clan: 'Crab' });
      check('CRAB', await enabled(), ['Hida', 'Kuni', 'Hida Atarasi', 'Kuni Yori']);
      await setup(page, { clan: 'Mantis' });
      check('MANTIS-MINOR', await enabled(), ['Kaimetsu-Uo', 'Gusai', 'Hida Atarasi', 'Kuni Yori']);
      await setup(page, { clan: 'Spider' });
      check('SPIDER-OWN', await enabled(), ['Hida Atarasi', 'Kuni Yori']);
      await setup(page, { clan: '' });
      check('NO-CLAN', await enabled(), ['Hida Atarasi', 'Kuni Yori']);
      await setup(page, { clan: 'Crab' });
      check('OTHER-REFUSED', await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Doji')), false);
      check('OTHER-NOT-SAVED', await state(page), null);
      // Before Apply Family the Clan & School picker decides.
      await setup(page, { clan: '', picker: 'Lion' });
      check('PICKER-FALLBACK', await enabled(), ['Akodo', 'Ikoma', 'Hida Atarasi', 'Kuni Yori']);
    });

    await scenario('COST', ['HIDA-SPENT', 'HIDA-REMAIN', 'BREAKDOWN', 'SWITCH-KUNI', 'NONE-AGAIN', 'VALIDATOR-SEES-IT'], async check => {
      await setup(page, { clan: 'Crab', xpTotal: 40 });
      const before = await xp(page);
      await pick(page, 'Hida');
      const after = await xp(page);
      check('HIDA-SPENT', after.spent - before.spent, COST.Hida);
      check('HIDA-REMAIN', before.remain - after.remain, COST.Hida);
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
    });

    await scenario('SPIDER', ['ASKED', 'CANCEL-NOTHING', 'CONFIRM-SAVED', 'GM-NOTE', 'OWN-NOT-ASKED'], async check => {
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
    });

    await scenario('FAVOUR', ['BADGE-TEXT', 'LOSE-CANCEL', 'LOST', 'LOST-GIFT-OFF', 'LOST-COST-KEPT', 'LOST-GREY', 'JEALOUS-LOCKED', 'JEALOUS-REFUSED',
      'REGAIN', 'REGAIN-GIFT-ON', 'SECOND-LOSS-WARNED', 'FINAL', 'FINAL-BADGE', 'FINAL-NO-TOGGLE', 'FINAL-COST-KEPT'], async check => {
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
      check('JEALOUS-REFUSED', [await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Kuni')), (await state(page)).name], [false, 'Hida']);
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
    });

    await scenario('SAVE', ['COLLECT', 'ROUND-TRIP', 'ROUND-TRIP-XP', 'EXPORT-FILE', 'OLD-SAVE-CLEARS', 'REFUSED-KEEPS', 'INVALID-WARNED', 'INVALID-FREE', 'RESET-CLEARS'], async check => {
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
    });

    const AUTO = [
      // [ancestor, Clan, setup extras, kind, context, expected ancestor deltas]
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
    ];
    await scenario('AUTO', AUTO.map((a, i) => String(i + 1).padStart(2, '0') + '-' + a[0].replace(/\W+/g, '')).concat(['NEVER-DAMAGE', 'NONE-NO-LEAK']), async check => {
      for (let i = 0; i < AUTO.length; i++) {
        const [name, clan, extra, kind, ctx, want] = AUTO[i];
        await setup(page, Object.assign({ clan }, extra));
        await page.evaluate(n => window.__L5R_TEST__.ANC48.choose(n), name);
        check(String(i + 1).padStart(2, '0') + '-' + name.replace(/\W+/g, ''), await mods(page, kind, ctx), noRolls ? [] : want);
      }
      await setup(page, { clan: 'Crane' });
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Doji'));
      check('NEVER-DAMAGE', await mods(page, 'DAMAGE', { skillName: 'Courtier', traitName: 'Awareness' }), []);
      await setup(page, { clan: 'Crane' });
      const kinds = [['SKILL', { skillName: 'Courtier', traitName: 'Awareness' }], ['TRAIT', { traitName: 'Intelligence' }], ['ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }], ['SPELL', { spellName: 'P', maho: true }]];
      const leaks = [];
      for (const [k, c] of kinds) leaks.push(...await mods(page, k, c));
      check('NONE-NO-LEAK', leaks, []);
    });

    const DECL = [
      // [ancestor, Clan, setup extras, kind, context, key, expected deltas when ticked]
      ['Kuni', 'Crab', { traits: { stamina: 3, willpower: 3 } }, 'SPELL', { spellName: 'Probe' }, 'kuni-cast', [[0, 3]]],
      ['Kakita', 'Crane', {}, 'SKILL', { skillName: 'Iaijutsu', traitName: 'Reflexes' }, 'kakita-reroll', [[1, 1]]],
      ['Kakita', 'Crane', {}, 'SKILL', { skillName: 'Artisan: Painting', traitName: 'Awareness' }, 'kakita-reroll', [[1, 1]]],
      ['Agasha Kitsuki', 'Dragon', {}, 'SKILL', { skillName: 'Investigation', traitName: 'Perception' }, 'kitsuki-lie', [[1, 1]]],
      ['Akodo', 'Lion', {}, 'SKILL', { skillName: 'Battle', traitName: 'Perception' }, 'akodo-battle', [[1, 0], [1, 1]]],
      ['Kaimetsu-Uo', 'Mantis', {}, 'TRAIT', { traitName: 'Willpower' }, 'kaimetsu-provoked', []],
      ['Kaimetsu-Uo', 'Mantis', {}, 'ATTACK', { skillName: 'Jiujutsu', traitName: 'Agility' }, 'kaimetsu-improvised', [[3, 0]]],
      ['Gusai', 'Mantis', {}, 'SKILL', { skillName: 'Sleight of Hand', traitName: 'Agility' }, 'gusai-conceal', [[3, 3]]],
      ['Asako', 'Phoenix', {}, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, 'asako-ally', [[1, 0]]],
      ['Bayushi', 'Scorpion', { school: 'Bayushi Bushi' }, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, 'bayushi-void', [[1, 0], [1, 1]]],
      ['Shosuro', 'Scorpion', {}, 'SKILL', { skillName: 'Sincerity', traitName: 'Awareness' }, 'shosuro-deceit', [[3, 1]]],
      ['Kuni Yori', 'Spider', {}, 'SKILL', { skillName: 'Sincerity', traitName: 'Awareness' }, 'yori-deceit', [[1, 0]]],
      ['Hida Atarasi', 'Spider', { traits: { stamina: 4, willpower: 3 }, taint: 1 }, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }, 'atarasi-strike', [[3, 0]]],
      ['Moto', 'Unicorn', {}, 'RING', { ringName: 'Water' }, 'moto-resist', [[2, 2]]],
      ['Shinjo', 'Unicorn', {}, 'SKILL', { skillName: 'Investigation', traitName: 'Perception' }, 'shinjo-enigma', [[1, 1]]],
      ['Shinjo', 'Unicorn', {}, 'SKILL', { skillName: 'Sincerity', traitName: 'Awareness' }, 'shinjo-honesty', [[1, 1]]],
    ];
    const DECL_IDS = [];
    DECL.forEach((d, i) => { const n = String(i + 1).padStart(2, '0') + '-' + d[5]; DECL_IDS.push(n + '-OFFERED', n + '-APPLIED'); });
    await scenario('DECLARE', DECL_IDS.concat(['NOT-ON-OTHER-ROLLS', 'ASAKO-NOT-KENJUTSU', 'LOST-NOTHING-OFFERED', 'PROVOKED-DROPS-AUTO']), async check => {
      for (let i = 0; i < DECL.length; i++) {
        const [name, clan, extra, kind, ctx, key, want] = DECL[i];
        const n = String(i + 1).padStart(2, '0') + '-' + key;
        await setup(page, Object.assign({ clan }, extra));
        await page.evaluate(nm => window.__L5R_TEST__.ANC48.choose(nm), name);
        check(n + '-OFFERED', (await offers(page, kind, ctx)).includes(key), !noDeclare);
        check(n + '-APPLIED', noDeclare ? [] : await declared(page, kind, ctx, key), noDeclare ? [] : want);
      }
      await setup(page, { clan: 'Mantis' });
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Gusai'));
      check('NOT-ON-OTHER-ROLLS', await offers(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }), []);
      await setup(page, { clan: 'Phoenix' });
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Asako'));
      check('ASAKO-NOT-KENJUTSU', await offers(page, 'ATTACK', { skillName: 'Kenjutsu', traitName: 'Agility' }), []);
      await setup(page, { clan: 'Unicorn' });
      await pick(page, 'Moto');
      await badge(page, true);
      check('LOST-NOTHING-OFFERED', await offers(page, 'TRAIT', { traitName: 'Willpower' }), []);
      await setup(page, { clan: 'Mantis' });
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Kaimetsu-Uo'));
      check('PROVOKED-DROPS-AUTO', noDeclare ? [] : await declared(page, 'TRAIT', { traitName: 'Willpower' }, 'kaimetsu-provoked'), []);
    });

    await scenario('ROLL', ['DOJI-REAL', 'GUSAI-REAL', 'PLAIN-REAL'], async check => {
      await setup(page, { clan: 'Crane' });
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Doji'));
      check('DOJI-REAL', await roll(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, [3, 2]), noRolls ? { dice: 3, kept: 2 } : { dice: 4, kept: 2 });
      await setup(page, { clan: 'Mantis' });
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Gusai'));
      check('GUSAI-REAL', await roll(page, 'SKILL', { skillName: 'Stealth', traitName: 'Agility' }, [3, 2], noDeclare ? [] : ['gusai-conceal']), noDeclare ? { dice: 3, kept: 2 } : { dice: 6, kept: 5 });
      await setup(page, { clan: 'Crane' });
      check('PLAIN-REAL', await roll(page, 'SKILL', { skillName: 'Courtier', traitName: 'Awareness' }, [3, 2]), { dice: 3, kept: 2 });
    });

    await scenario('DAMAGE', ['HIDA-KATANA', 'HIDA-BOW', 'HIDA-UNARMED', 'IKOMA-UNARMED', 'IKOMA-KATANA', 'ROLL-DICE', 'ROLL-NOTE', 'NO-ANCESTOR-NOTE'], async check => {
      await setup(page, { clan: 'Crab' });
      const base = { katana: await dmg(page, 'Katana'), yumi: await dmg(page, 'Yumi'), unarmed: await dmg(page, 'Unarmed') };
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Hida'));
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
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Ikoma'));
      check('IKOMA-UNARMED', await dmg(page, 'Unarmed'), [base.unarmed[0] + 2, base.unarmed[1]]);
      check('IKOMA-KATANA', await dmg(page, 'Katana'), base.katana);
      await setup(page, { clan: 'Crab' });
      const plain = page.evaluate(() => window.__L5R_TEST__.rollWeaponDamage('Katana'));
      plain.catch(() => {});
      await page.waitForSelector('#rollDiceRow .roll-die');
      check('NO-ANCESTOR-NOTE', await page.evaluate(() => document.querySelectorAll('#rollModalBody .anc48-roll-note').length), 0);
      await closeAll(page);
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

    await scenario('FLAGS', ['KAKITA-LOW', 'KAKITA-OK', 'AKODO-LOW', 'BAYUSHI-HIGH', 'ATARASI-HIGH', 'KUNI-TAINT', 'NEVER-AUTO-LOST', 'BAYUSHI-UNTRAINED', 'OTHER-CLAN-NOT-APPLIED'], async check => {
      const flags = async (clan, name, extra) => { await setup(page, Object.assign({ clan }, extra)); await page.evaluate(n => window.__L5R_TEST__.ANC48.choose(n), name); return (await card(page)).flags; };
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
      await page.evaluate(() => window.__L5R_TEST__.ANC48.choose('Hida'));
      await page.evaluate(() => { document.getElementById('f_clan').value = 'Crane'; window.__L5R_TEST__.recalcAll(); });
      const c = await card(page);
      check('OTHER-CLAN-NOT-APPLIED', [c.flags.some(t => /guides only the Crab Clan/.test(t)), /anc48-inactive/.test(c.cls), await dmg(page, 'Katana')],
        [true, true, await page.evaluate(() => { const T = window.__L5R_TEST__; const e = T.WEAPON_LIBRARY.find(x => x.name === 'Katana');
          const s = document.getElementById('f_ancestor').value; document.getElementById('f_ancestor').value = ''; const d = T.getWeaponDamageDice(e, 0);
          document.getElementById('f_ancestor').value = s; return [d.numDice, d.keepDice]; })]);
    });

    await scenario('PLAY', ['PICK-LOCKED', 'CHANGE-BLOCKED', 'BADGE-LIVE', 'INFO-LIVE', 'UNLOCKED-AGAIN'], async check => {
      if (noModes) { ['PICK-LOCKED', 'CHANGE-BLOCKED', 'BADGE-LIVE', 'INFO-LIVE', 'UNLOCKED-AGAIN'].forEach(n => check(n, true)); return; }
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
    });

    await scenario('WIZARD', ['BLOCK', 'CARDS', 'PICKED', 'SAME-AS-SHEET', 'DETAILS', 'REVIEW-ROW', 'NONE-CARD'], async check => {
      if (noWizard) { ['BLOCK', 'CARDS', 'PICKED', 'SAME-AS-SHEET', 'DETAILS', 'REVIEW-ROW', 'NONE-CARD'].forEach(n => check(n, true)); return; }
      await setup(page, {});
      await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; W.start(); W.index = W.steps.findIndex(s => s.id === 'clan'); W.render(); });
      await page.locator('#cw112Body button.cw112-card', { hasText: 'Crab' }).first().click();
      await page.evaluate(() => { const W = window.__L5R_TEST__.CW112; W.index = W.steps.findIndex(s => s.id === 'family'); W.render(); });
      await page.locator('#cw112Body button.cw112-card', { hasText: 'Hida' }).first().click();
      check('BLOCK', await page.evaluate(() => !!document.querySelector('#cw112Body #anc48Wizard')));
      const titles = () => page.evaluate(() => [...document.querySelectorAll('#anc48Wizard .cw112-card-title')].map(t => t.textContent));
      check('CARDS', await titles(), ['No Ancestor', 'Hida', 'Kuni', 'Hida Atarasi', 'Kuni Yori']);
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
