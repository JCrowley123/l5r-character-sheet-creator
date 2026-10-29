'use strict';
// Phase 4.5.37 Supplement Advantages and Disadvantages (Cycle 5 Release 5b; the owner's rulings of 15 and 22 October 2026).
// node supplement-harness.js <sheet.html>
// The expected entries are written out here, not read from the layer, so every check can fail on main.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const TOTAL = 26;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 400) +
    ' want=' + String(JSON.stringify(want)).slice(0, 200)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack).slice(0, 300), 'no exception'); } }

// [name, list, type, XP, book page]
const ENTRIES = [
  ['Battle Healing', 'adv', 'Mystical', 5, 'Book of Water p.178'],
  ['Broken Wave Citizen', 'adv', 'Social', 3, 'Strongholds of the Empire p.24'],
  ['Clear Water Native', 'adv', 'Social', 3, 'Strongholds of the Empire p.44'],
  ['Dark Edge Native', 'adv', 'Social', 2, 'Strongholds of the Empire p.60'],
  ['Imperial City Citizen', 'adv', 'Social', 2, 'Strongholds of the Empire p.134'],
  ['Imperial City Veteran', 'adv', 'Social', 2, 'Strongholds of the Empire p.134'],
  ['Inheritance: Asahina Blade', 'adv', 'Material', 9, 'Strongholds of the Empire p.75'],
  ['Inheritance: Kobune', 'adv', 'Material', 10, 'Strongholds of the Empire p.24'],
  ['Inheritance: Trained Falcon', 'adv', 'Material', 2, 'Enemies of the Empire p.10'],
  ['Inheritance: Water Hammer Armor', 'adv', 'Material', 4, 'Strongholds of the Empire p.107'],
  ['Iron Heart Native', 'adv', 'Physical', 2, 'Book of Void p.195'],
  ['Laughing Plains Native', 'adv', 'Mental', 2, 'Book of Void p.195'],
  ['Medium', 'adv', 'Spiritual', 4, 'Enemies of the Empire p.244'],
  ['Naga Ancestry', 'adv', 'Physical', 7, 'Imperial Histories 2 p.287'],
  ['Nikesake Citizen', 'adv', 'Social', 3, 'Strongholds of the Empire p.75'],
  ['Reincarnated', 'adv', 'Spiritual', 6, 'Book of Void p.191'],
  ['Ruined City Shadow', 'adv', 'Physical', 3, 'Strongholds of the Empire p.92'],
  ['Sacred Forest Native', 'adv', 'Mental', 2, 'Book of Void p.195'],
  ['Sacred Weapon: Owl Blade', 'adv', 'Material', 6, 'Imperial Histories 2 p.29'],
  ['Sage of the Sword and Fan', 'adv', 'Mental', 7, 'Sword and Fan p.202'],
  ['Spy Network', 'adv', 'Social', 8, 'Enemies of the Empire p.49 (reprinted Book of Water p.185)'],
  ['Stolen Identity', 'adv', 'Social', 6, 'Strongholds of the Empire p.92'],
  ['Strategist', 'adv', 'Mental', 5, 'Sword and Fan p.202'],
  ['Watanu-Trained', 'adv', 'Mental', 1, 'Book of Void p.195'],
  ['Water Hammer Citizen', 'adv', 'Social', 3, 'Strongholds of the Empire p.107'],
  ['Zakyo Toshi Citizen', 'adv', 'Social', 3, 'Strongholds of the Empire p.152'],
  ['Bounty', 'disadv', 'Social', 2, 'Strongholds of the Empire p.168'],
  ['Broken Wave Stigma', 'disadv', 'Social', 2, 'Strongholds of the Empire p.24'],
  ['Clear Water Stigma', 'disadv', 'Social', 2, 'Strongholds of the Empire p.44'],
  ['Dark Edge Reputation', 'disadv', 'Social', 2, 'Strongholds of the Empire p.60'],
  ['Imperial City Stigma', 'disadv', 'Social', 4, 'Strongholds of the Empire p.134'],
  ['Nikesake Stigma', 'disadv', 'Social', 4, 'Strongholds of the Empire p.75'],
  ['Ruined City Survivor', 'disadv', 'Material', 4, 'Strongholds of the Empire p.92'],
  ['Sleeper Agent', 'disadv', 'Mental', 5, 'Enemies of the Empire p.49'],
  ['The Chrysanthemum Court', 'disadv', 'Social', 5, 'Imperial Histories 2 p.126'],
  ['Trials of the Imperial City', 'disadv', 'Social', 4, 'Strongholds of the Empire p.134'],
  ['Wanderer', 'disadv', 'Mental', 2, 'Strongholds of the Empire p.168'],
  ['Water Hammer Stigma', 'disadv', 'Social', 2, 'Strongholds of the Empire p.107'],
  ['Zakyo Toshi Stigma', 'disadv', 'Social', 3, 'Strongholds of the Empire p.152'],
];
const PARKED = ['Member of the Chrysanthemum Court', 'The World of the Daimyo', 'The Daimyo’s Path', "The Daimyo's Path", 'Child of Chikushudo'];
const NAGA = ['Amphibious', 'Divine Focus', 'Enhancing Mutation', 'Hunter of the Foul', 'Prehensile Tail', 'Student of the Past',
  'Adrift from the Akasha', 'Cursed Mutation', 'Terror of the Foul'];
const NEZUMI = ['Clever Tail', 'Favored Pup of the Chief', 'Fearless', 'Forever Memory', 'Human Allies', 'Namebound',
  'Shine-Shiney Eyes', 'Teeth of Stone', 'Tribal Wanderer', 'Kwa’thch', 'Lost Tail', 'Nameless', 'Nezumi Madness', 'Nose Blind'];

// A clean character in Management with the given Clan, family and School and one row of `name`; returns the row's
// cost and the Clan-price note.
async function priced(page, {clan, family = '', school = '', name, list = 'adv'}) {
  return page.evaluate(({clan, family, school, name, list}) => {
    const T = window.__L5R_TEST__;
    T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
    T.saveSchoolsList?.(school ? [{name: school, rank: 1}] : []);
    document.getElementById('f_clan').value = clan;
    document.getElementById('f_family').value = family;
    const lib = (list === 'adv' ? T.ADV_LIBRARY : T.DISADV_LIBRARY).find(x => x.name === name);
    const div = T.makeEntry({name, cost: lib ? lib.cost : 0, desc: lib ? lib.desc : ''}, true);
    document.getElementById(list === 'adv' ? 'advList' : 'disadvList').appendChild(div);
    T.recalcAll();
    const note = div.querySelector('.cp4525-note');
    return [Number(div.querySelector('.en-cost').value), note ? note.textContent : ''];
  }, {clan, family, school, name, list});
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

    await section('S437-CATALOGUE', async () => {
      check('S437-SWITCH', await page.evaluate(() => window.__L5R_TEST__.SUPPLEMENT_ENTRIES_ENABLED === true && !!window.__L5R_TEST__.SUPP4537));
      const found = await page.evaluate(entries => entries.map(([name, list]) => {
        const T = window.__L5R_TEST__, e = (list === 'adv' ? T.ADV_LIBRARY : T.DISADV_LIBRARY).find(x => x.name === name);
        return e ? [e.name, list, e.cat, e.cost, e.source] : [name, 'missing'];
      }), ENTRIES);
      check('S437-ALL-39-WITH-TYPE-XP-PAGE', found.filter((f, i) => JSON.stringify(f) !== JSON.stringify(ENTRIES[i])).map(f => f[0]), []);
      check('S437-DESCRIPTIONS', await page.evaluate(entries => entries.filter(([name, list]) => {
        const T = window.__L5R_TEST__, e = (list === 'adv' ? T.ADV_LIBRARY : T.DISADV_LIBRARY).find(x => x.name === name);
        return !e || typeof e.desc !== 'string' || e.desc.length < 20;
      }).map(x => x[0]), ENTRIES), []);
      check('S437-CATALOGUE-SIZES', await page.evaluate(() => [window.__L5R_TEST__.ADV_LIBRARY.length, window.__L5R_TEST__.DISADV_LIBRARY.length]), [99, 79]);
      // Each new entry sits in A to Z order among the catalogue's own entries: the nearest catalogue entry before it
      // sorts before it, the nearest after it sorts after it, and no catalogue entry after it sorts before it. (The
      // catalogue's Uncentered sits out of order near the top of the Disadvantages; it keeps its place.)
      check('S437-ALPHABETICAL-PLACE', await page.evaluate(entries => {
        const T = window.__L5R_TEST__, bad = [], added = new Set(entries.map(e => e[0]));
        entries.forEach(([name, list]) => {
          const lib = list === 'adv' ? T.ADV_LIBRARY : T.DISADV_LIBRARY, i = lib.findIndex(x => x.name === name);
          const before = lib.slice(0, Math.max(i, 0)).filter(x => !added.has(x.name)), after = lib.slice(i + 1).filter(x => !added.has(x.name));
          if (i < 0 || (before.length && before[before.length - 1].name.localeCompare(name) > 0) ||
            (after.length && after[0].name.localeCompare(name) < 0) || after.some(x => x.name.localeCompare(name) < 0)) bad.push(name);
        });
        return bad;
      }, ENTRIES), []);
      // Release 7b.2 (R11): while its switch is on, three of these are Search reference entries in its own category, and
      // only there; none is in the lists.
      check('S437-PARKED-NOT-ADDED', await page.evaluate(names => {
        const T = window.__L5R_TEST__, sh7 = T.STATION_REFERENCE_ENABLED === true;
        return names.filter(n => T.ADV_LIBRARY.concat(T.DISADV_LIBRARY).some(x => x.name === n) ||
          T.SEARCH14.query({text: n, limit: 50}).results.some(r => r.name === n && !(sh7 && r.category === 'station-shapeshifter')));
      }, PARKED), []);
    });

    await section('S437-QUICK-ADD', async () => {
      const listed = await page.evaluate(entries => entries.filter(([name, list, cat, xp]) => {
        const opt = Array.from(document.querySelectorAll('#' + (list === 'adv' ? 'advQuickAdd' : 'disadvQuickAdd') + ' option'))
          .find(o => o.value === name);
        // While Phase 4.5.42 folds the four printed heirlooms into Inheritance (Release 5c.1), they must be absent.
        const fold = window.__L5R_TEST__.INH4542;
        if (fold && typeof fold.folded === 'function' && fold.enabled() && fold.folded(name)) return !!opt;
        return !opt || opt.parentElement.label !== cat || opt.textContent !== name + ' (' + xp + ' pt' + (xp === 1 ? '' : 's') + ')';
      }).map(x => x[0]), ENTRIES);
      check('S437-QUICK-ADD-LISTS-ALL-IN-THEIR-GROUP', listed, []);
      check('S437-MYSTICAL-GROUP-AFTER-SPIRITUAL', await page.evaluate(() =>
        Array.from(document.querySelectorAll('#advQuickAdd optgroup')).map(g => g.label).join(',')),
      'Mental,Physical,Social,Spiritual,Mystical,Material,Varies');
      const added = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
        const pick = (id, value) => { const s = document.getElementById(id); s.value = value; s.dispatchEvent(new Event('change')); };
        pick('advQuickAdd', 'Nikesake Citizen');
        T.closeAdvConfigModal?.();
        pick('disadvQuickAdd', 'Wanderer');
        T.closeAdvConfigModal?.();
        const row = id => { const d = document.querySelector('#' + id + ' .entry:last-child');
          return d ? [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value)] : null; };
        return [row('advList'), row('disadvList')];
      });
      check('S437-ADDED-FROM-QUICK-ADD', added, [['Nikesake Citizen', 3], ['Wanderer', 2]]);
    });

    await section('S437-SEARCH', async () => {
      const got = await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14, pick = r => r && [r.name, r.type, r.source];
        return [pick(S.get('advantages:broken-wave-citizen')), pick(S.get('disadvantages:wanderer')), pick(S.get('advantages:allies'))];
      });
      check('S437-SEARCH-ENTRY-PAGE', got[0], ['Broken Wave Citizen', 'Advantage', 'Strongholds of the Empire p.24']);
      check('S437-SEARCH-DISADVANTAGE-PAGE', got[1], ['Wanderer', 'Disadvantage', 'Strongholds of the Empire p.168']);
      check('S437-SEARCH-CORE-PAGE-UNCHANGED', got[2], ['Allies', 'Advantage', 'Core Rulebook p.146']);
      // An entry priced by Clan and by family lists every price in Search.
      check('S437-SEARCH-TIER-PRICES', await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14, price = id => ((S.get(id) || {fields: []}).fields.find(f => f.label === 'Clan or School price') || {}).value || '';
        return [price('advantages:spy-network'), price('advantages:inheritance-trained-falcon'), price('advantages:strategist')];
      }), ['6 points for Scorpion; 7 points for the Daidoji family', '1 point for the Toritaka family', '4 points for Lion']);
      const ref = await page.evaluate(([naga, nezumi]) => {
        const T = window.__L5R_TEST__, S = T.SEARCH14;
        const cat = S.categories().find(c => c.id === 'naga-nezumi');
        const amph = S.get('naga-nezumi:amphibious'), nameless = S.get('naga-nezumi:nameless');
        const inLists = naga.concat(nezumi).filter(n => T.ADV_LIBRARY.concat(T.DISADV_LIBRARY).some(x => x.name === n) ||
          Array.from(document.querySelectorAll('#advQuickAdd option, #disadvQuickAdd option')).some(o => o.value === n));
        return {count: cat ? cat.count : 0, label: cat ? cat.label : '', group: cat ? cat.group : '',
          amph: amph && [amph.type, amph.source, amph.tags.includes('Naga only')],
          nameless: nameless && [nameless.type, nameless.source, nameless.tags.includes('Nezumi only')], inLists};
      }, [NAGA, NEZUMI]);
      check('S437-NAGA-NEZUMI-IN-SEARCH', [ref.count, ref.label, ref.group], [23, 'Naga and Nezumi', 'Clans']);
      check('S437-NAGA-MARKED', ref.amph, ['Naga Advantage', 'Enemies of the Empire p.81', true]);
      check('S437-NEZUMI-MARKED', ref.nameless, ['Nezumi Disadvantage', 'Enemies of the Empire p.111', true]);
      check('S437-NAGA-NEZUMI-NOT-IN-LISTS', ref.inLists, []);
    });

    await section('S437-PRICES', async () => {
      check('S437-LION-STRATEGIST', (await priced(page, {clan: 'Lion', family: 'Akodo', name: 'Strategist'}))[0], 4);
      const daidoji = await priced(page, {clan: 'Crane', family: 'Daidoji', name: 'Spy Network'});
      check('S437-DAIDOJI-SPY-NETWORK', [daidoji[0], /Daidoji/.test(daidoji[1])], [7, true]);
      check('S437-SCORPION-SPY-NETWORK', (await priced(page, {clan: 'Scorpion', family: 'Bayushi', name: 'Spy Network'}))[0], 6);
      const crab = await priced(page, {clan: 'Crab', family: 'Hida', name: 'Spy Network'});
      check('S437-OTHERS-PAY-THE-BOOK-PRICE', [crab[0], crab[1], (await priced(page, {clan: 'Crab', family: 'Hida', name: 'Strategist'}))[0]], [8, '', 5]);
      check('S437-TORITAKA-FALCON', (await priced(page, {clan: 'Falcon', family: 'Toritaka', name: 'Inheritance: Trained Falcon'}))[0], 1);
      check('S437-COURTIER-SAGE-AND-SPIDER-IDENTITY', [
        (await priced(page, {clan: 'Crane', family: 'Doji', school: 'Doji Courtier', name: 'Sage of the Sword and Fan'}))[0],
        (await priced(page, {clan: 'Spider', family: 'Daigotsu', name: 'Stolen Identity'}))[0]], [6, 5]);
    });

    await section('S437-SAVE', async () => {
      // A character with two of the entries is saved and opened again: the row and its fixed Spider price come back.
      const back = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        const data = JSON.parse(JSON.stringify(T.collectData()));
        T.resetToBaseline(); T.clearAllRows?.();
        T.applyData(data);
        T.recalcAll();
        return Array.from(document.querySelectorAll('#advList .entry, #disadvList .entry')).map(d =>
          [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value), !!d.dataset.cp4525]);
      });
      check('S437-SAVED-AND-OPENED', back, [['Stolen Identity', 5, true]]);
    });

    await section('S437-YOMI', async () => {
      // Yomi (Core p.158) flags the four Inheritance heirlooms and Naga Ancestry, not Reincarnated, and every row stays
      // (the owner's ruling, 22 October 2026).
      const shown = await page.evaluate(() => {
        const T = window.__L5R_TEST__;
        T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.();
        ['Inheritance: Asahina Blade', 'Inheritance: Kobune', 'Inheritance: Trained Falcon', 'Inheritance: Water Hammer Armor',
          'Naga Ancestry', 'Reincarnated'].forEach(name => {
          const lib = T.ADV_LIBRARY.find(x => x.name === name);
          document.getElementById('advList').appendChild(T.makeEntry({name, cost: lib ? lib.cost : 0, desc: lib ? lib.desc : ''}, true));
        });
        const div = T.makeEntry({name: 'Cursed by the Realm', cost: 4, desc: ''}, true);
        document.getElementById('disadvList').appendChild(div);
        div.querySelector('.en-name').dispatchEvent(new Event('change', {bubbles: true}));
        const cfg = {type: 'realmPick', realm: 'Yomi'};
        if (T.D45?.schema('Cursed by the Realm')?.finalize) T.D45.schema('Cursed by the Realm').finalize(cfg);
        div.dataset.advConfig = JSON.stringify(cfg);
        T.recalcAll();
        const flag = div.querySelector('.realm4510-flag');
        return [flag ? flag.textContent : '', document.querySelectorAll('#advList .entry').length];
      });
      check('S437-YOMI-FLAGS-ANCESTRAL-LINKS', shown, ['Ancestral: Inheritance: Asahina Blade, Inheritance: Kobune, ' +
        'Inheritance: Trained Falcon, Inheritance: Water Hammer Armor, Naga Ancestry — resolve with your GM', 6]);
    });

    check('S437-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL check count ' + results.length + ' expected ' + TOTAL);
  console.log(`\n${passed}/${TOTAL} checks passed`);
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
