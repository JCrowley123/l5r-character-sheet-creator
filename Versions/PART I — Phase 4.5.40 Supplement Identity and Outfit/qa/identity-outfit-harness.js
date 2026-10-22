'use strict';
// Phase 4.5.40 Supplement Identity and Outfit (Cycle 5 Release 5c). node identity-outfit-harness.js <sheet.html>
// Rules written out here from Strongholds of the Empire pp.92 and 152; Outfits are read from the sheet's School library.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const TOTAL = 21;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 400) +
    ' want=' + String(JSON.stringify(want)).slice(0, 200)));
}

function installHelpers() {
  const T = window.__L5R_TEST__;
  const H = window.H440 = {};
  H.safe = f => { try { return f(); } catch (e) { return 'error: ' + String(e.message || e).slice(0, 120); } };
  H.open = () => getComputedStyle(document.getElementById('advConfigModalOverlay')).display !== 'none';
  H.add = (list, name) => { const s = document.getElementById(list === 'adv' ? 'advQuickAdd' : 'disadvQuickAdd'); s.value = name;
    s.dispatchEvent(new Event('change')); return H.open(); };
  H.entry = (list, name) => Array.from(document.querySelectorAll('#' + list + 'List .entry')).find(d => d.querySelector('.en-name').value === name) || null;
  H.text = (d, sel) => (d && d.querySelector(sel) || {textContent: null}).textContent;
  H.identity = (school, family, alias) => {
    [['School', school], ['Family', family], ['Alias', alias]].forEach(([k, v]) => { const i = document.getElementById('supp4540' + k); if (i) i.value = v; });
    T.confirmAdvConfigModal();
    const e = document.querySelector('#advConfigGrid .supp4540-error');
    return H.open() && e && !e.hidden ? e.textContent : null;
  };
  H.equip = () => Array.from(document.querySelectorAll('#equipBody tr')).map(t =>
    [t.querySelector('.eq-name').value, t.querySelector('.eq-qty').value, t.querySelector('.eq-notes').value]);
  H.outfit = (school) => { const e = T.findAnySchoolLibraryEntry ? T.findAnySchoolLibraryEntry(school) : null;
    return e ? e.outfit.split(',').map(s => s.trim()).filter(Boolean) : null; };
  H.setSchool = (name, withOutfit) => {
    document.getElementById('f_schoolsData').value = name ? JSON.stringify([{name, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0}]) : '[]';
    if (withOutfit) H.outfit(name).forEach(item => document.getElementById('equipBody').appendChild(
      T.makeEquipRow({name: item, qty: 1, notes: 'Starting outfit', schoolGranted: name})));
    T.recalcAll();
  };
  H.pick = (value) => { const i = Array.from(document.querySelectorAll('#advConfigGrid input[name="d45-choice"]')).find(x => x.value === value);
    if (i) i.checked = true; T.confirmAdvConfigModal(); };
  H.options = () => Array.from(document.querySelectorAll('#advConfigGrid input[name="d45-choice"]')).map(i => i.value);
  H.kokuBox = (d) => { const b = d && d.querySelector('.supp4540-koku');
    return b ? [b.querySelector('span').textContent, Array.from(b.querySelectorAll('button')).map(x => x.textContent)] : null; };
}

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    page.setDefaultTimeout(8000);
    page.on('pageerror', e => errors.push(String(e)));
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() &&
      (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout: 60000});
    await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
    await page.evaluate(installHelpers);
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); });
    const ev = (f, arg) => page.evaluate(([f, arg]) => window.H440.safe(() => (0, eval)('(' + f + ')')(window.H440, window.__L5R_TEST__, arg)), [String(f), arg]);

    check('S440-SWITCH', await ev((H, T) => T.SUPPLEMENT_IDENTITY_OUTFIT_ENABLED === true && !!T.SUPP4540));

    // Stolen Identity (p.92): another Great Clan's family and School, an alias; that School's Outfit, not its koku.
    check('S440-SI-ASKS', await ev(H => { document.getElementById('f_clan').value = 'Crane';
      return [H.add('adv', 'Stolen Identity'), document.querySelectorAll('#advConfigGrid input').length,
        document.getElementById('advConfigSubtitle').textContent]; }), [true, 3, 'Choose the identity you stole']);
    check('S440-SI-OWN-CLAN-REFUSED', await ev(H => H.identity('Kakita Bushi', 'Kakita', 'Kakita Ryu')), 'Choose a School of another Great Clan.');
    check('S440-SI-FAMILY-OF-THE-SCHOOL', await ev(H => { document.getElementById('f_clan').value = 'Lion'; return H.identity('Kakita Bushi', 'Matsu', 'Kakita Ryu'); }),
      'Choose a family of the Crane Clan, as the School is.');
    check('S440-SI-OUTFIT-ADDED', await ev(H => {
      const error = H.identity('Kakita Bushi', 'Kakita', 'Kakita Ryu');
      const d = H.entry('adv', 'Stolen Identity');
      const want = H.outfit('Kakita Bushi').filter(i => !/\bkoku\b/i.test(i)).map(i => [i, '1', 'Stolen Identity outfit']);
      return [error, H.text(d, '.adv-config-summary'), Number(d.querySelector('.en-cost').value),
        JSON.stringify(H.equip()) === JSON.stringify(want) && want.length > 0];
    }), [null, 'Alias Kakita Ryu — Kakita family, Kakita Bushi', 6, true]);
    check('S440-SI-SPIDER-PRICE-KEPT', await ev((H, T) => { document.getElementById('f_clan').value = 'Spider'; T.recalcAll();
      const d = H.entry('adv', 'Stolen Identity'); return [Number(d.querySelector('.en-cost').value), H.text(d, '.adv-config-summary')]; }),
      [5, 'Alias Kakita Ryu — Kakita family, Kakita Bushi']);
    check('S440-SI-CHANGE-SWAPS-OUTFIT', await ev((H, T) => {
      document.getElementById('equipBody').appendChild(T.makeEquipRow({name: 'Daisho', qty: 1, notes: 'my own'}));
      const d = H.entry('adv', 'Stolen Identity'); T.openAdvConfigModal(d);
      const error = H.identity('Akodo Bushi', 'Akodo', 'Akodo Jin');
      const want = [['Daisho', '1', 'my own']].concat(H.outfit('Akodo Bushi').filter(i => !/\bkoku\b/i.test(i)).map(i => [i, '1', 'Stolen Identity outfit']));
      return [error, JSON.stringify(H.equip()) === JSON.stringify(want)];
    }), [null, true]);
    check('S440-SI-ACTING-FREE-RAISES', await ev((H, T) => {
      const mods = rank => T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName: 'Acting', traitName: 'Awareness', skillRank: rank,
        traitValue: 2, unskilled: rank === 0})).filter(m => m.label === 'Stolen Identity').map(m => [m.display, !!m.informational, m.rolledDelta || 0]);
      return [mods(2), mods(0)];
    }), [[['2 Free Raises as Akodo Jin', true, 0]], []]);
    check('S440-SI-REMOVED-TAKES-OUTFIT', await ev(H => {
      const before = H.equip().length === 1 + H.outfit('Akodo Bushi').filter(i => !/\bkoku\b/i.test(i)).length;
      H.entry('adv', 'Stolen Identity').querySelector('.rm-btn').click();
      return [before, H.equip()];
    }), [true, [['Daisho', '1', 'my own']]]);

    // Ruined City Survivor (p.92): no starting koku, two Outfit items of the player's choice missing.
    check('S440-RC-ASKS', await ev(H => {
      document.getElementById('equipBody').innerHTML = '';
      H.setSchool('Hida Bushi', true);
      return [H.add('disadv', 'Ruined City Survivor'), document.getElementById('advConfigSubtitle').textContent,
        JSON.stringify(H.options()) === JSON.stringify(H.outfit('Hida Bushi').filter(i => !/\bkoku\b/i.test(i)))];
    }), [true, 'Choose the first missing Outfit item — step 1 of 2', true]);
    check('S440-RC-MARKED-MISSING', await ev(H => {
      const items = H.outfit('Hida Bushi');
      H.pick(items[0]);
      const second = H.options();
      H.pick(items[2]);
      const d = H.entry('disadv', 'Ruined City Survivor');
      const marked = H.equip().filter(r => r[2] === 'Missing (Ruined City Survivor)').map(r => [r[0], r[1]]);
      return [second.indexOf(items[0]), Number(d.querySelector('.en-cost').value), marked,
        JSON.stringify(marked) === JSON.stringify([[items[0], '0'], [items[2], '0'], ['3 koku', '0']])];
    }), [-1, 4, [['Light or Heavy Armor', '0'], ['Daisho', '0'], ['3 koku', '0']], true]);
    check('S440-RC-CHANGE-RESTORES', await ev((H, T) => {
      const items = H.outfit('Hida Bushi');
      T.openAdvConfigModal(H.entry('disadv', 'Ruined City Survivor'));
      H.pick(items[1]); H.pick(items[3]);
      return H.equip().filter(r => r[2] === 'Missing (Ruined City Survivor)').map(r => r[0]);
    }), ['Sturdy Clothing', 'Heavy Weapon or Polearm', '3 koku']);
    check('S440-RC-SAVED-AND-OPENED', await ev((H, T) => {
      const data = JSON.parse(JSON.stringify(T.collectData()));
      T.resetToBaseline(); T.clearAllRows?.(); T.applyData(data); T.recalcAll();
      const d = H.entry('disadv', 'Ruined City Survivor'), c = d && T.readAdvConfig(d);
      return [c ? c.value : null, Number(d.querySelector('.en-cost').value), H.equip().filter(r => r[2] === 'Missing (Ruined City Survivor)').length];
    }), ['Sturdy Clothing and Heavy Weapon or Polearm', 4, 3]);
    check('S440-RC-REMOVED-RESTORES', await ev(H => {
      const missing = H.equip().filter(r => r[2] === 'Missing (Ruined City Survivor)').length;
      H.entry('disadv', 'Ruined City Survivor').querySelector('.rm-btn').click();
      return [missing, H.equip().every(r => r[1] === '1' && r[2] === 'Starting outfit') && H.equip().length];
    }), [3, 6]);

    // Zakyo Toshi Citizen (p.152): the School Outfit's starting koku is increased by 50%.
    check('S440-ZT-KOKU-OFFERED', await ev(H => {
      H.add('adv', 'Zakyo Toshi Citizen');
      window.__L5R_TEST__.closeAdvConfigModal(); window.__L5R_TEST__.recalcAll();
      return H.kokuBox(H.entry('adv', 'Zakyo Toshi Citizen'));
    }), ['Half your School’s starting koku again: 1.5 koku.', ['Add 1.5 koku', 'Already added']]);
    check('S440-ZT-KOKU-ADDED', await ev(H => {
      const k = document.getElementById('f_koku'); k.value = '2';
      const b = Array.from(H.entry('adv', 'Zakyo Toshi Citizen').querySelectorAll('.supp4540-koku button')).find(x => /^Add/.test(x.textContent));
      if (b) b.click();
      return [k.value, H.kokuBox(H.entry('adv', 'Zakyo Toshi Citizen'))];
    }), ['3.5', ['1.5 koku from Zakyo Toshi Citizen recorded on your Koku.', []]]);
    check('S440-ZT-SAVED-AND-OPENED', await ev((H, T) => {
      const data = JSON.parse(JSON.stringify(T.collectData()));
      T.resetToBaseline(); T.clearAllRows?.(); T.applyData(data); T.recalcAll();
      return [document.getElementById('f_koku').value, H.kokuBox(H.entry('adv', 'Zakyo Toshi Citizen'))];
    }), ['3.5', ['1.5 koku from Zakyo Toshi Citizen recorded on your Koku.', []]]);
    check('S440-ZT-REMOVED-TAKES-BACK', await ev(H => {
      const before = document.getElementById('f_koku').value;
      H.entry('adv', 'Zakyo Toshi Citizen').querySelector('.rm-btn').click();
      return [before, document.getElementById('f_koku').value];
    }), ['3.5', '2']);
    check('S440-ZT-NO-SCHOOL', await ev((H, T) => {
      H.setSchool('');
      H.add('adv', 'Zakyo Toshi Citizen'); T.closeAdvConfigModal(); T.recalcAll();
      return H.kokuBox(H.entry('adv', 'Zakyo Toshi Citizen'));
    }), ['Apply your School: Zakyo Toshi Citizen adds half its starting koku again.', []]);
    check('S440-RENAME-UNDOES', await ev((H, T) => {
      document.getElementById('equipBody').innerHTML = '';
      document.getElementById('f_clan').value = 'Lion';
      H.add('adv', 'Stolen Identity');
      H.identity('Doji Courtier', 'Doji', 'Doji Aiko');
      const before = H.equip().length > 0;
      const n = H.entry('adv', 'Stolen Identity').querySelector('.en-name');
      n.value = 'Stolen Name'; n.dispatchEvent(new Event('input', {bubbles: true})); T.recalcAll();
      return [before, H.equip()];
    }), [true, []]);
    check('S440-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL check count ' + results.length + ' expected ' + TOTAL);
  console.log(`\n${passed}/${TOTAL} checks passed`);
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
