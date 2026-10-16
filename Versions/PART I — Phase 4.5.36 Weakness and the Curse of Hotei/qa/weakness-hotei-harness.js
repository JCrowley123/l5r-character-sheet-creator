'use strict';
// Phase 4.5.36 Weakness and the Curse of Hotei (owner's rulings, 16 October 2026; Core Rulebook p.162).
// node weakness-hotei-harness.js <sheet.html>
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const TOTAL = 37;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 400) +
    ' want=' + String(JSON.stringify(want)).slice(0, 200)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack).slice(0, 300), 'no exception'); } }

// A clean character: traits as given (others 2), the listed Disadvantages, each Weakness row picked as given.
async function setup(page, {traits = {}, weak = [], dis = [], hotei = false, voidRing = 3, voidNow = 3} = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  return page.evaluate(({traits, weak, dis, hotei, voidRing, voidNow}) => {
    document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); T.saveSchoolsList?.([]);
    document.querySelectorAll('[id^="trait_"]').forEach(el => { el.value = 2; });
    Object.entries(traits).forEach(([k, v]) => { document.getElementById('trait_' + k).value = v; });
    document.getElementById('ring_void').value = voidRing;
    const add = (name, config) => {
      const lib = T.DISADV_LIBRARY.find(x => x.name === name);
      const div = T.makeEntry({name, cost:lib ? lib.cost : 0, desc:lib ? lib.desc : ''}, true);
      document.getElementById('disadvList').appendChild(div);
      if (config) T.writeAdvConfig(div, config.type, config);
      return div;
    };
    weak.forEach(t => add('Weakness', t ? {type:'traitPick', trait:t, value:t} : null));
    dis.forEach(n => add(n));
    if (hotei) add('Seven Fortunes’ Curse', {type:'fortunePick', fortune:'Hotei', value:'Hotei'});
    T.setCombatActive?.(false);
    T.recalcAll();
    document.getElementById('void_current').value = voidNow;
    T.recalcAll();
    T.renderVoidPanel();
    return true;
  }, {traits, weak, dis, hotei, voidRing, voidNow});
}
const val = (page, id) => page.evaluate(id => document.getElementById(id).value, id);
const trait = (page, n) => page.evaluate(n => window.__L5R_TEST__.getTraitValueByName(n), n);
async function previewPool(page, click) {
  await page.evaluate(click);
  await page.waitForFunction(() => getComputedStyle(document.getElementById('rollPreviewOverlay')).display !== 'none', null, {timeout:8000});
  const text = await page.evaluate(() => document.getElementById('rollPreviewGo').textContent);
  await page.evaluate(() => document.getElementById('rollPreviewCancel').click());
  await page.waitForFunction(() => getComputedStyle(document.getElementById('rollPreviewOverlay')).display === 'none', null, {timeout:8000});
  return text;
}

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({viewport:{width:375, height:812}});
    page.setDefaultTimeout(8000);
    page.on('pageerror', e => errors.push(String(e)));
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() &&
      (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout:60000});
    await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());

    await section('W436-START', async () => {
      check('W436-SWITCH', await page.evaluate(() => window.__L5R_TEST__.WEAKNESS_HOTEI_ENABLED === true &&
        !!window.__L5R_TEST__.WEAK4536 && !!window.__L5R_TEST__.HOTEI4536));
      // Guard: without Weakness the Trait and its Ring are the core's.
      await setup(page, {traits:{strength:3, perception:3}});
      check('W436-GUARD-NO-ROW', [await trait(page, 'Strength'), await val(page, 'ring_water')], [3, '3']);
    });

    await section('W436-RULE', async () => {
      await setup(page, {traits:{strength:3, perception:3}, weak:['Strength']});
      check('W436-TRAIT-LOWERED', [await trait(page, 'Strength'), await trait(page, 'strength or agility'), await trait(page, 'Perception')], [2, 2, 3]);
      check('W436-RING-LOWERED', await val(page, 'ring_water'), '2');
      check('W436-PURCHASED-KEPT', await page.evaluate(() => { const d = window.__L5R_TEST__.collectData();
        return [document.getElementById('trait_strength').value, d.traits.strength, d.rings.water]; }), ['3', '3', '3']);
      await setup(page, {traits:{strength:4, perception:3}, weak:['Strength']});
      check('W436-RING-ONLY-WHEN-LOWER', [await trait(page, 'Strength'), await val(page, 'ring_water')], [3, '3']);
      await setup(page, {traits:{strength:1, perception:3}, weak:['Strength']});
      check('W436-FLOOR-ONE', [await trait(page, 'Strength'), await val(page, 'ring_water')], [1, '1']);
      await setup(page, {traits:{strength:3, agility:3, intelligence:3, perception:3}, weak:['Strength', 'Agility']});
      check('W436-TWO-ROWS-TWO-TRAITS', [await trait(page, 'Strength'), await trait(page, 'Agility'),
        await val(page, 'ring_water'), await val(page, 'ring_fire')], [2, 2, '2', '2']);
      await setup(page, {traits:{strength:3, perception:3}, weak:['Strength', 'Strength']});
      check('W436-SAME-TRAIT-ONCE', [await trait(page, 'Strength'),
        await page.evaluate(() => document.querySelectorAll('#disadvList .weak4536-row-note')[1]?.textContent || '')],
        [2, 'Strength is already lowered by an earlier Weakness row; this row adds nothing.']);
      await setup(page, {traits:{strength:3, perception:3}, weak:[null]});
      check('W436-UNPICKED-CHANGES-NOTHING', [await trait(page, 'Strength'), await val(page, 'ring_water')], [3, '3']);
      await setup(page, {traits:{strength:3, perception:3}, weak:['Strength'], voidRing:3});
      check('W436-VOID-UNCHANGED', [await trait(page, 'Void'), await val(page, 'ring_void')], [3, '3']);
    });

    await section('W436-NEVER-CHANGED', async () => {
      await setup(page, {traits:{strength:3, perception:3}, weak:[null]});
      const before = await val(page, 'f_insightPts');
      await setup(page, {traits:{strength:3, perception:3}, weak:['Strength']});
      check('W436-INSIGHT-AS-BOUGHT', [await val(page, 'f_insightPts'), await val(page, 'ring_water')], [before, '2']);
      // XP: Weakness on Strength 3 (lowering it) costs the same as on Awareness 2 (also lowered): both read as bought.
      await setup(page, {traits:{strength:3, perception:3}, weak:['Strength']});
      const onStrength = [await val(page, 'f_xpSpent'), await val(page, 'f_xpRemain')];
      await setup(page, {traits:{strength:3, perception:3}, weak:['Awareness']});
      check('W436-XP-AS-BOUGHT', [await val(page, 'f_xpSpent'), await val(page, 'f_xpRemain')], onStrength);
    });

    await section('W436-FOLLOWS', async () => {
      await setup(page, {traits:{stamina:3, willpower:3}, weak:['Stamina']});
      check('W436-WOUNDS-FROM-EARTH', await page.evaluate(() => { const T = window.__L5R_TEST__;
        document.getElementById('f_woundsTaken').value = 5; T.recalcAll();
        return [document.getElementById('ring_earth').value, T.getCurrentWoundLevelName()]; }), ['2', 'Nicked']);
      await setup(page, {traits:{stamina:3, willpower:3}, weak:['Stamina'], dis:['Bad Health']});
      check('W436-WITH-BAD-HEALTH', await page.evaluate(() => { const T = window.__L5R_TEST__;
        document.getElementById('f_woundsTaken').value = 3; T.recalcAll(); return T.getCurrentWoundLevelName(); }), 'Nicked');
      await setup(page, {traits:{reflexes:3, awareness:3}, weak:['Reflexes']});
      check('W436-TN-AND-INITIATIVE', await page.evaluate(() => ['f_baseTN', 'f_currentTN', 'f_initiative']
        .map(id => document.getElementById(id).value)), ['15', '15', await page.evaluate(() =>
          window.__L5R_TEST__.formatRollNotation(2 + (parseInt(document.getElementById('f_insightRank').value, 10) || 0), 2))]);
      check('W436-INITIATIVE-SCORE-READS-IT', await page.evaluate(() => window.__L5R_TEST__.getTraitValueByName('Reflexes')), 2);
      check('W436-INITIATIVE-ROLL', await previewPool(page, () => document.getElementById('btnRollInitiative').click()),
        'Roll ' + (2 + Number(await val(page, 'f_insightRank'))) + 'k2');
      await setup(page, {traits:{strength:3, perception:3}, weak:['Strength']});
      check('W436-TRAIT-ROLL', await previewPool(page, () => document.querySelector('label[for="trait_strength"]').click()),
        'Roll 2k2');
      check('W436-RING-ROLL', await previewPool(page, () => document.querySelector('.ring-name[data-ring-key="water"]').click()),
        'Roll 2k2');
      check('W436-PREREQUISITES-READ-IT', await page.evaluate(() => window.__L5R_TEST__.getRingValueByName('water')), 2);
      check('W436-DISPLAY', await page.evaluate(() => [document.getElementById('weak4536-trait-strength')?.textContent,
        document.getElementById('weak4536-ring-water')?.textContent, !!document.getElementById('weak4536-trait-perception')]),
        ['Counts as 2 (Weakness)', 'Lowered from 3 (Weakness)', false]);
    });

    await section('W436-PICK', async () => {
      await setup(page, {traits:{strength:3}, weak:['Strength', null]});
      const options = await page.evaluate(async () => {
        const rows = [...document.querySelectorAll('#disadvList .entry')];
        rows[1].querySelector('.adv-config-btn')?.click();
        const grid = document.getElementById('advConfigGrid');
        const out = [...grid.querySelectorAll('input[type=radio]')].map(i => [i.value, i.disabled]);
        window.__L5R_TEST__.closeAdvConfigModal?.();
        document.getElementById('advConfigModalOverlay').style.display = 'none';
        return out;
      });
      check('W436-PICK-EIGHT-TRAITS', options.map(o => o[0]),
        ['Reflexes', 'Awareness', 'Stamina', 'Willpower', 'Agility', 'Intelligence', 'Strength', 'Perception']);
      check('W436-PICK-REFUSES-SECOND', options.filter(o => o[1]).map(o => o[0]), ['Strength']);
      check('W436-ROW-COST-AND-NOTE', await page.evaluate(() => { const row = document.querySelector('#disadvList .entry');
        return [row.querySelector('.en-cost').value, row.querySelector('.weak4536-row-note')?.textContent]; }),
        ['6', 'Strength 3 counts as 2.']);
    });

    await section('W436-COMBINED', async () => {
      await setup(page, {traits:{strength:3, perception:3}, weak:['Strength'], hotei:false});
      const dmg = await page.evaluate(() => { const T = window.__L5R_TEST__;
        const lib = T.WEAPON_LIBRARY.find(w => w.name === 'Katana'); return T.getWeaponDamageDice(lib ? lib : 'Katana'); });
      check('W436-DAMAGE-USES-IT', dmg && dmg.breakdown ? dmg.breakdown.some(t => /^Strength \+2 /.test(t)) : dmg, true);
    });

    await section('H436', async () => {
      await setup(page, {voidRing:3, voidNow:3});
      check('H436-NO-CURSE-NO-BUTTON', await page.evaluate(() => document.querySelectorAll('.hotei4536-spend').length), 0);
      await setup(page, {hotei:true, voidRing:3, voidNow:3});
      check('H436-ROW-AUTOMATED', await page.evaluate(() => { const row = [...document.querySelectorAll('#disadvList .entry')].pop();
        return [window.__L5R_TEST__.F4511?.FORTUNES?.Hotei?.effect, !!row.querySelector('.fortune4511-note-deferred'),
          !!row.querySelector('.hotei4536-note'), row.querySelector('.en-cost').value]; }), ['voidDouble', false, true, '6']);
      check('H436-BUTTON', await page.evaluate(() => [...document.querySelectorAll('.hotei4536-spend')].map(b => [b.textContent, b.disabled])),
        [['Spend Void: For a Technique or Advantage (Hotei’s Curse: 2 points)', false]]);
      await page.evaluate(() => document.querySelector('.hotei4536-spend')?.click());
      check('H436-SPENDS-TWO', await val(page, 'void_current'), '1');
      const spent = await val(page, 'void_current');
      await page.evaluate(() => document.querySelector('#voidPips .void-pip:not(.filled)')?.click());
      check('H436-TAKE-BACK-BOTH', [spent, await val(page, 'void_current')], ['1', '3']);
      await page.evaluate(() => document.querySelector('.hotei4536-spend')?.click());
      await page.evaluate(() => document.querySelector('#voidPips .void-pip.filled')?.click());
      await page.evaluate(() => document.querySelector('#voidPips .void-pip:not(.filled)')?.click());
      check('H436-STALE-TAKE-BACK-ORDINARY', await val(page, 'void_current'), '1');
      await setup(page, {hotei:true, voidRing:3, voidNow:1});
      check('H436-CHECKED-FIRST', await page.evaluate(() => { const b = document.querySelector('.hotei4536-spend');
        const r = window.__L5R_TEST__.HOTEI4536?.spend() || {};
        return [b?.disabled, b?.title, r.ok, document.getElementById('void_current').value]; }),
        [true, 'Hotei’s Curse: this needs 2 Void Points; you have 1.', false, '1']);
      await setup(page, {hotei:true, voidRing:3, voidNow:3});
      check('H436-ORDINARY-SPEND-ONE', await page.evaluate(() => { window.__L5R_TEST__.spendVoid('k1');
        return document.getElementById('void_current').value; }), '2');
      check('H436-LIBRARY-UNCHANGED', await page.evaluate(() => window.__L5R_TEST__.VOID_SPEND_LIBRARY.map(o => o.key)),
        ['k1', 'skill', 'tn', 'init', 'damage', 'kiho']);
      await setup(page, {hotei:true, voidRing:3, voidNow:3});
      check('H436-ONE-SPEND-PER-ROUND', await page.evaluate(() => { const T = window.__L5R_TEST__;
        T.setCombatActive(true); T.renderVoidPanel();
        document.querySelector('.hotei4536-spend')?.click();
        const spentRound = T.hasSpentThisRound('void');
        T.renderVoidPanel();
        const b = document.querySelector('.hotei4536-spend');
        const out = [document.getElementById('void_current').value, spentRound, b?.disabled];
        T.setCombatActive(false); return out; }), ['1', true, true]);
    });

    check('W436-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL W436-COUNT ran ' + results.length + ' of ' + TOTAL);
  console.log(passed + '/' + TOTAL + ' checks passed');
  process.exitCode = passed === TOTAL && results.length === TOTAL ? 0 : 1;
}
main().catch(e => { console.error(e); console.log('0/' + TOTAL + ' checks passed'); process.exitCode = 1; });
