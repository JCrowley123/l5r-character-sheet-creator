/* Real-browser acceptance tests for BUGFIX — Spell Slot Accounting.
 * Oracles: the sheet's own hidden counters (spell_used_<el>, spell_bonus_used_shared,
 * spell_bonus_used_visual_<el>, f_woundsTaken), the owner's rule of 24 September ("the spell is
 * cancelled before the roll is done, so it should not take a spell slot"), the owner's ruling on
 * overfull saves (warn, never remove pips automatically), and release 4.5.2's approved rule that a
 * FAILED Enlightened Madness check leaves the slot spent. Casts go through each spell's own Cast
 * button, so every earlier wrapper of castSpell() is on the path, as it is for a player.
 * node spell-slot-accounting-harness.js <sheet.html>
 */
'use strict';
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const results = [];
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
function check(id, actual, expected = true) {
  const pass = JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);
}
let PAGE = null;
const visible = id => PAGE.evaluate(i => { const o = document.getElementById(i); return !!o && o.style.display !== 'none' && getComputedStyle(o).display !== 'none'; }, id);
// Closes anything a failed section left open through each overlay's OWN close control, so a
// pending Willpower transaction or preview is cancelled properly rather than hidden.
async function closeAll(page) {
  for (let i = 0; i < 4; i++) {
    const open = await page.evaluate(() => {
      const shown = id => { const o = document.getElementById(id); return !!o && o.style.display !== 'none' && getComputedStyle(o).display !== 'none'; };
      if (shown('appConfirmOverlay')) { document.getElementById('appConfirmX')?.click(); return true; }
      if (shown('rollPreviewOverlay')) { document.getElementById('rollPreviewCancel')?.click(); return true; }
      if (shown('rollModalOverlay')) { document.getElementById('rollModalClose')?.click(); return true; }
      if (shown('universalSpellPickModalOverlay')) { document.getElementById('universalSpellPickX')?.click(); return true; }
      return false;
    }).catch(() => false);
    if (!open) break;
    await page.waitForTimeout(30);
  }
  await page.evaluate(() => { if (window.__ssaRandom) { Math.random = window.__ssaRandom; delete window.__ssaRandom; } }).catch(() => {});
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id, String(error.stack || error), 'no exception'); }
  if (PAGE) await closeAll(PAGE);
}

const SPELLS = [['Air Probe', 'air'], ['Void Probe', 'void'], ['Earth Probe', 'earth'], ['Sense Probe', 'universal']];
async function setup(page, {school = 'Isawa Shugenja', affinity = 'Void', adv = [], disadv = [], maho = false} = {}) {
  await page.evaluate(({school, affinity, adv, disadv, maho, SPELLS}) => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    T.saveSchoolsList(school ? [{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}] : []);
    const aff = document.getElementById('f_schoolAffinity'); if (aff) aff.value = affinity;
    T.recalcAll();
    T.applyData(Object.assign(T.collectData(), {adv, disadv})); T.recalcAll();
    document.getElementById('techList').innerHTML = '';
    for (const [name, el] of SPELLS) document.getElementById('techList').appendChild(T.makeEntry({name, spellElement:el, spellMastery:1}, true, 'XP'));
    if (maho) document.getElementById('techList').appendChild(T.makeEntry({name:'Blood Probe', spellElement:'fire', spellMastery:1, spellIsMaho:true}, true, 'XP'));
    T.recalcAll();
  }, {school, affinity, adv, disadv, maho, SPELLS});
}
const state = page => page.evaluate(() => {
  const v = id => Number(document.getElementById(id)?.value || 0);
  const out = {bonus:v('spell_bonus_used_shared'), wounds:v('f_woundsTaken'), taint:v('f_taint')};
  for (const k of ['air', 'earth', 'fire', 'water', 'void']) { out[k] = v('spell_used_' + k); out['b_' + k] = v('spell_bonus_used_visual_' + k); }
  return out;
});
const pick = (s, keys) => Object.fromEntries(keys.map(k => [k, s[k]]));
const setCounters = (page, values) => page.evaluate(values => {
  for (const [id, n] of Object.entries(values)) document.getElementById(id).value = String(n);
  window.__L5R_TEST__.renderAllSpellSlots();
}, values);
const rank = (page, key) => page.evaluate(k => parseInt(document.getElementById('ring_' + k).value || '0', 10), key);
const status = page => page.evaluate(() => (document.getElementById('statusMsg') || {}).textContent || '');

async function clickCast(page, spell) {
  await page.evaluate(n => [...document.querySelectorAll('#techList .entry')].find(e => e.querySelector('.en-name').value === n)
    .querySelector('.spell-cast-btn').click(), spell);
}
// Waits for whichever screen the sheet shows next.
async function next(page) {
  return Promise.race([
    page.waitForSelector('#appConfirmOverlay', {state:'visible', timeout:5000}).then(() => 'dialog'),
    page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:5000}).then(() => 'preview'),
    page.waitForSelector('#universalSpellPickModalOverlay', {state:'visible', timeout:5000}).then(() => 'universal'),
  ]).catch(() => 'nothing');
}
async function cancelPreview(page) {
  await page.locator('#rollPreviewCancel').click();
  await page.waitForSelector('#rollPreviewOverlay', {state:'hidden'});
  await page.waitForTimeout(40);
}
async function rollPreview(page) {
  await page.locator('#rollPreviewGo').click();
  await page.waitForSelector('#rollDiceRow .roll-die');
}
async function closeResult(page) {
  await page.locator('#rollModalClose').click();
  await page.waitForTimeout(40);
}
async function bonusTap(page, key, filled) {
  await page.evaluate(({key, filled}) => {
    const pips = [...document.querySelectorAll('#spellBonusPips_' + key + ' .spell-bonus-pip')];
    const pip = filled ? pips.filter(p => p.classList.contains('filled')).pop() : pips.find(p => !p.classList.contains('filled'));
    if (!pip) throw new Error('no ' + (filled ? 'filled' : 'empty') + ' bonus pip on ' + key);
    pip.click();
  }, {key, filled});
}
const note = page => page.evaluate(() => { const n = document.getElementById('ssa992BonusNote'); return n && !n.hidden ? n.textContent : null; });

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    const page = await browser.newPage({viewport:{width:375, height:812}});
    PAGE = page;
    page.setDefaultTimeout(6000);
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => !!window.__L5R_TEST__);

    await section('SSA-START', async () => {
      check('SSA-ENABLED', await page.evaluate(() => [window.__L5R_TEST__.SPELL_SLOT_ACCOUNTING_FIX_ENABLED,
        window.__L5R_TEST__.SPELL_SLOT_REFUND_ENABLED, window.__L5R_TEST__.BONUS_PIP_GUARD_ENABLED]), [true, true, true]);
      check('SSA-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
    });

    await section('SSA-ELEMENT', async () => {
      await setup(page);
      await clickCast(page, 'Air Probe');
      check('SSA-ELEMENT-PREVIEW', await next(page), 'preview');
      // The spend still happens before the preview; the refusal checks stay where they were.
      check('SSA-ELEMENT-SPENT-BEFORE-PREVIEW', (await state(page)).air, 1);
      await cancelPreview(page);
      check('SSA-ELEMENT-CANCEL-REFUNDS', pick(await state(page), ['air', 'earth', 'fire', 'water', 'void', 'bonus']),
        {air:0, earth:0, fire:0, water:0, void:0, bonus:0});
      check('SSA-ELEMENT-STATUS', /Cast cancelled.*Air slot given back/.test(await status(page)));
      await clickCast(page, 'Air Probe');
      await next(page);
      await rollPreview(page);
      await closeResult(page);
      check('SSA-ELEMENT-ROLL-KEEPS-SLOT', (await state(page)).air, 1);
    });

    await section('SSA-VOID', async () => {
      // The owner's second report: a Void spell (Boundless Sight) on a Shugenja with no Advantage.
      await setup(page, {school:'Asahina Shugenja', affinity:''});
      await clickCast(page, 'Void Probe');
      check('SSA-VOID-PREVIEW', await next(page), 'preview');
      await cancelPreview(page);
      check('SSA-VOID-CANCEL-REFUNDS', (await state(page)).void, 0);
    });

    await section('SSA-BONUS', async () => {
      await setup(page);
      const air = await rank(page, 'air');
      await setCounters(page, {spell_used_air:air, spell_bonus_used_shared:1, spell_bonus_used_visual_fire:1});
      await clickCast(page, 'Air Probe');
      check('SSA-BONUS-ASKS', await next(page), 'dialog');
      await page.locator('#appConfirmOk').click();
      check('SSA-BONUS-PREVIEW', await next(page), 'preview');
      check('SSA-BONUS-SPENT', pick(await state(page), ['bonus', 'b_air', 'b_fire']), {bonus:2, b_air:1, b_fire:1});
      await cancelPreview(page);
      // Only what this cast took comes back; Fire's earlier bonus pip is not touched.
      check('SSA-BONUS-CANCEL-REFUNDS', pick(await state(page), ['air', 'bonus', 'b_air', 'b_fire']), {air, bonus:1, b_air:0, b_fire:1});
      check('SSA-BONUS-STATUS', /bonus slot given back/.test(await status(page)));
      await clickCast(page, 'Air Probe');
      await next(page);
      await page.locator('#appConfirmCancel').click();
      await page.waitForTimeout(40);
      check('SSA-BONUS-DECLINE-UNCHANGED', pick(await state(page), ['air', 'bonus', 'b_air', 'b_fire']), {air, bonus:1, b_air:0, b_fire:1});
    });

    await section('SSA-UNIVERSAL', async () => {
      await setup(page);
      await clickCast(page, 'Sense Probe');
      check('SSA-UNIVERSAL-PICKER', await next(page), 'universal');
      await page.locator('#universalSpellPick_Earth').check();
      await page.locator('#universalSpellPickConfirm').click();
      check('SSA-UNIVERSAL-PREVIEW', await next(page), 'preview');
      check('SSA-UNIVERSAL-SPENT', (await state(page)).earth, 1);
      await cancelPreview(page);
      check('SSA-UNIVERSAL-CANCEL-REFUNDS', (await state(page)).earth, 0);
    });

    await section('SSA-VOID-VERSATILITY', async () => {
      // The owner's first report, exactly: Void Versatility on Earth, both payment routes.
      const vv = {name:'Void Versatility', cost:'4', desc:'', config:{type:'voidVersatilityRing', revision:1, ring:'Earth', value:'Earth'}};
      await setup(page, {adv:[vv]});
      await clickCast(page, 'Void Probe');
      check('SSA-VV-ASKS', await next(page), 'dialog');
      await page.locator('#appConfirmOk').click();
      check('SSA-VV-PREVIEW', await next(page), 'preview');
      check('SSA-VV-RING-SPENT', pick(await state(page), ['earth', 'void']), {earth:1, void:0});
      await cancelPreview(page);
      check('SSA-VV-RING-CANCEL-REFUNDS', pick(await state(page), ['earth', 'void', 'bonus']), {earth:0, void:0, bonus:0});
      const earth = await rank(page, 'earth');
      await setCounters(page, {spell_used_earth:earth});
      await clickCast(page, 'Void Probe');
      check('SSA-VV-EARTH-FULL-PREVIEW', await next(page), 'preview');
      check('SSA-VV-VOID-SPENT', (await state(page)).void, 1);
      await cancelPreview(page);
      check('SSA-VV-VOID-CANCEL-REFUNDS', pick(await state(page), ['earth', 'void']), {earth, void:0});
    });

    await section('SSA-MAHO', async () => {
      await setup(page, {maho:true});
      await clickCast(page, 'Blood Probe');
      check('SSA-MAHO-ASKS', await next(page), 'dialog');
      await page.locator('#appConfirmOk').click();
      check('SSA-MAHO-PREVIEW', await next(page), 'preview');
      check('SSA-MAHO-WOUNDS-TAKEN', (await state(page)).wounds, 2);
      await cancelPreview(page);
      check('SSA-MAHO-CANCEL-REFUNDS', pick(await state(page), ['wounds', 'taint', 'fire', 'bonus']), {wounds:0, taint:0, fire:0, bonus:0});
      check('SSA-MAHO-STATUS', /2 Wounds given back/.test(await status(page)));
    });

    await section('SSA-LATE', async () => {
      // A refund must never subtract from a sheet that changed while the preview was open.
      await setup(page);
      await clickCast(page, 'Air Probe');
      await next(page);
      await page.evaluate(() => { document.getElementById('spell_used_air').value = '2'; });
      await cancelPreview(page);
      check('SSA-LATE-DROPPED', (await state(page)).air, 2);
      check('SSA-LATE-RECORDED', await page.evaluate(() => window.__L5R_TEST__.SSA992.lastRefund), {dropped:true});
    });

    await section('SSA-GATE', async () => {
      const madness = {name:'Enlightened Madness', cost:'0', desc:'',
        config:{type:'targetPick', tier:6, targetType:'Ring', target:'Earth', value:'Earth'}};
      await setup(page, {disadv:[madness]});
      await page.evaluate(() => { document.getElementById('trait_willpower').value = '4'; window.__L5R_TEST__.recalcAll(); });
      // Cancelling the Willpower check's own preview is a cancel before anything was rolled.
      await clickCast(page, 'Earth Probe');
      check('SSA-GATE-CHECK-PREVIEW', [await next(page), /Willpower/.test(await page.locator('#rollPreviewSubtitle').textContent().catch(() => '')) ||
        /Willpower/.test(await page.locator('#rollPreviewBody').textContent())], ['preview', true]);
      check('SSA-GATE-SPENT', (await state(page)).earth, 1);
      await cancelPreview(page);
      check('SSA-GATE-CHECK-CANCEL-REFUNDS', (await state(page)).earth, 0);
      // A check that is rolled and FAILED keeps the slot spent: release 4.5.2's approved rule.
      await page.evaluate(() => { window.__ssaRandom = Math.random; Math.random = () => 0; });
      await clickCast(page, 'Earth Probe');
      await next(page);
      await rollPreview(page);
      await closeResult(page);
      await page.waitForSelector('#appConfirmOverlay', {state:'visible'});
      await page.locator('#appConfirmX').click();
      await page.waitForTimeout(60);
      check('SSA-GATE-FAILED-KEEPS-SLOT', [(await state(page)).earth, await visible('rollPreviewOverlay')], [1, false]);
      await page.evaluate(() => { Math.random = window.__ssaRandom; delete window.__ssaRandom; });
      // A PASSED check followed by a cancelled Casting Roll refunds.
      await setCounters(page, {spell_used_earth:0});
      await page.evaluate(() => { window.__ssaRandom = Math.random; Math.random = () => 0.85; });
      await clickCast(page, 'Earth Probe');
      await next(page);
      await rollPreview(page);
      await closeResult(page);
      check('SSA-GATE-PASSED-SPELL-PREVIEW', await next(page), 'preview');
      await cancelPreview(page);
      check('SSA-GATE-PASSED-CANCEL-REFUNDS', (await state(page)).earth, 0);
    });

    await section('SSA-PIP', async () => {
      await setup(page);
      const voidRank = await rank(page, 'void');
      // Pool full from casting: Water holds all of it.
      await setCounters(page, {spell_bonus_used_shared:voidRank, spell_bonus_used_visual_water:voidRank});
      await bonusTap(page, 'earth', false);
      check('SSA-PIP-FULL-REFUSED', pick(await state(page), ['bonus', 'b_earth', 'b_water']), {bonus:voidRank, b_earth:0, b_water:voidRank});
      check('SSA-PIP-FULL-STATUS', /No bonus slots left/.test(await status(page)));
      check('SSA-PIP-NO-WARNING-WHEN-CONSISTENT', await note(page), null);
      await bonusTap(page, 'water', true);
      check('SSA-PIP-TAKEBACK-CONSISTENT', pick(await state(page), ['bonus', 'b_water']), {bonus:voidRank - 1, b_water:voidRank - 1});
      await bonusTap(page, 'earth', false);
      check('SSA-PIP-SPEND-WITH-ROOM', pick(await state(page), ['bonus', 'b_earth']), {bonus:voidRank, b_earth:1});
    });

    await section('SSA-OVERFULL', async () => {
      // A save made before the fix: rows show one more bonus pip than the pool records.
      await setup(page);
      const voidRank = await rank(page, 'void');
      const saved = await page.evaluate(v => { const T = window.__L5R_TEST__; const d = T.collectData();
        d.spellBonusUsed = String(v); d.spellBonusUsedVisual = {air:'0', earth:'0', fire:String(v - 1), water:'2', void:'0'}; return d; }, voidRank);
      await page.evaluate(d => { const T = window.__L5R_TEST__; T.applyData(d); T.recalcAll(); }, saved);
      const before = await state(page);
      check('SSA-OVERFULL-NOT-REPAIRED', pick(before, ['bonus', 'b_fire', 'b_water']), {bonus:voidRank, b_fire:voidRank - 1, b_water:2});
      check('SSA-OVERFULL-WARNED', await note(page),
        `The bonus pips show ${voidRank + 1} used, but the shared pool records ${voidRank}. Tap a filled bonus pip to take one back; the sheet will not remove any for you.`);
      // The warning's colour comes only from this fix's stylesheet: the sheet's own --shu-dark.
      check('SSA-OVERFULL-NOTE-STYLED', await page.evaluate(() => {
        const n = document.getElementById('ssa992BonusNote'), probe = document.createElement('span');
        if (!n || n.hidden) return false;
        probe.style.color = 'var(--shu-dark)'; n.parentNode.appendChild(probe);
        const same = getComputedStyle(n).color === getComputedStyle(probe).color; probe.remove(); return same;
      }));
      // Taking Water's pips back corrects the excess first and never strips Fire's.
      await bonusTap(page, 'water', true);
      check('SSA-OVERFULL-FIRST-TAKEBACK', pick(await state(page), ['bonus', 'b_fire', 'b_water']), {bonus:voidRank, b_fire:voidRank - 1, b_water:1});
      check('SSA-OVERFULL-WARNING-CLEARS', await note(page), null);
      await bonusTap(page, 'water', true);
      check('SSA-OVERFULL-FIRE-KEPT', pick(await state(page), ['bonus', 'b_fire', 'b_water']), {bonus:voidRank - 1, b_fire:voidRank - 1, b_water:0});
    });

    await section('SSA-SAVE', async () => {
      // Save data is unchanged in shape: the fix adds no field.
      await setup(page);
      const keys = await page.evaluate(() => Object.keys(window.__L5R_TEST__.collectData()).filter(k => /ssa|SSA/.test(k)));
      check('SSA-SAVE-NO-NEW-FIELD', keys, []);
    });

    check('SSA-NO-PAGE-ERRORS', errors, []);
  } finally { await browser.close(); }
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
