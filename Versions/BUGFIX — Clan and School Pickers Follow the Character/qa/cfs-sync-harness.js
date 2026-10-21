'use strict';
// BUGFIX — Clan and School Pickers Follow the Character (owner's report, 20 October 2026).
// After a load the Clan & School tab's staging pickers show the character's own Clan, Family and School, in
// Management and in Play, and a tap of Apply no longer applies Crab / Hida / Hida Bushi over the character.
// Synthetic characters only, built through the sheet's own Apply buttons; never the owner's saves.
const fs = require('fs'), os = require('os'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 500)
    + ' want=' + String(JSON.stringify(want)).slice(0, 300)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const TOTAL = 72;
const DEFAULTS = {clan: 'Crab', minorShown: false, family: 'Hida', school: 'Hida Bushi'};

const staging = page => page.evaluate(() => {
  const $ = id => document.getElementById(id);
  const out = {clan: $('cfs_clan').value, minorShown: getComputedStyle($('cfs_minorClanWrap')).display !== 'none',
    family: $('cfs_family').value, school: $('cfs_school').value};
  if (out.minorShown) out.minor = $('cfs_minorClan').value;
  return out;
});
const saved = page => page.evaluate(() => {
  const d = window.__L5R_TEST__.collectData(), f = d.fields;
  return {clan: f.f_clan, family: f.f_family, school: f.f_school,
    schools: JSON.parse(f.f_schoolsData || '[]').map(s => s.name), traits: d.traits};
});
const stage = (page, clan, minor, family, school) => page.evaluate(([clan, minor, family, school]) => {
  const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', {bubbles: true})); };
  set('cfs_clan', clan);
  if (minor) set('cfs_minorClan', minor);
  if (family) set('cfs_family', family);
  set('cfs_school', school);
}, [clan, minor, family, school]);
// Clicks go through the page script: a variant that leaves a picker open must not stall the run.
const tap = (page, sel) => page.evaluate(s => document.querySelector(s).click(), sel);
// A School whose Apply asks no question (Affinity, Deficiency, Honor or specialisation pickers).
const PLAIN_SRC = "function(name){ const e = window.__L5R_TEST__.findAnySchoolLibraryEntry(name); "
  + "return !!e && !e.affinityChoice && !e.elementDeficiencyChoice && !(e.honorChoices && e.honorChoices.length) && !(e.specialisationChoices && e.specialisationChoices.length); }";
const MONK = new Function('const plain = ' + PLAIN_SRC + '; return window.__L5R_TEST__.BROTHERHOOD_SCHOOL_LIBRARY.map(s => s.name).find(plain);');
const play = async (page, on) => {
  if (await page.evaluate(() => document.body.classList.contains('pm12-play')) !== on) await tap(page, '#pm12Toggle');
};

async function main() {
  const browser = await chromium.launch(), errors = [];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cfs-sync-'));
  try {
    const url = pathToFileURL(path.resolve(process.argv[2])).href;
    const open = async () => {
      const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(url);
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
      await page.evaluate(() => { if (window.__L5R_TEST__.CL11.isOpen()) window.__L5R_TEST__.CL11.close(); });
      return {context, page};
    };
    const build = async (page, name, clan, minor, family, school) => {
      await page.evaluate(() => window.__L5R_TEST__.resetToBaseline());
      await page.evaluate(n => { document.getElementById('f_name').value = n; }, name);
      await stage(page, clan, minor, family, school);
      await tap(page, '#cfs_applyFamily');
      await tap(page, '#cfs_applySchool');
      await page.waitForTimeout(200);
      return page.evaluate(() => window.__L5R_TEST__.collectData());
    };
    const write = (name, data) => { const f = path.join(tmp, name + '.l5r.json'); fs.writeFileSync(f, JSON.stringify(data)); return f; };
    const importFile = async (page, file) => { await page.setInputFiles('#fileImport', file); await page.waitForTimeout(400); };

    // ---- The synthetic characters ----
    const saves = {}, expect = {};
    let {context, page} = await open();
    await section('CFS-SETUP', async () => {
      check('CFS-SWITCH', await page.evaluate(() => window.__L5R_TEST__.CFS_SYNC_ENABLED), true);
      check('CFS-FRESH-SHEET-DEFAULTS', await staging(page), DEFAULTS);
      saves.crane = await build(page, 'Test Crane', 'Crane', null, 'Kakita', 'Kakita Bushi');
      expect.crane = {clan: 'Crane', minorShown: false, family: 'Kakita', school: 'Kakita Bushi'};
      saves.lion = await build(page, 'Test Lion', 'Lion', null, 'Kitsu', 'Kitsu Shugenja');
      expect.lion = {clan: 'Lion', minorShown: false, family: 'Kitsu', school: 'Kitsu Shugenja'};
      // The LAST Minor Clan whose picker offers a Family and a School: never the picker's first option, so a
      // Minor Clan picker left as it was cannot pass by chance.
      const minor = await page.evaluate(src => {
        const plain = eval('(' + src + ')');
        const $ = id => document.getElementById(id), fire = e => e.dispatchEvent(new Event('change', {bubbles: true}));
        $('cfs_clan').value = 'Minor Clan'; fire($('cfs_clan'));
        for (const o of Array.from($('cfs_minorClan').options).slice(1).reverse()) {
          $('cfs_minorClan').value = o.value; fire($('cfs_minorClan'));
          if ($('cfs_family').value && $('cfs_school').value && plain($('cfs_school').value)) return [o.value, $('cfs_family').value, $('cfs_school').value];
        }
        return null;
      }, PLAIN_SRC);
      check('CFS-MINOR-FOUND', !!minor, true);
      saves.minor = await build(page, 'Test Minor', 'Minor Clan', minor[0], minor[1], minor[2]);
      expect.minor = {clan: 'Minor Clan', minorShown: true, family: minor[1], school: minor[2], minor: minor[0]};
      check('CFS-MINOR-SAVED-AS-ITS-CLAN', saves.minor.fields.f_clan, minor[0]);
      // Multiple Schools: a second School after the applied one. The applied School is what the tab shows.
      saves.multi = JSON.parse(JSON.stringify(saves.crane));
      saves.multi.fields.f_name = 'Test Multi';
      saves.multi.fields.f_schoolsData = JSON.stringify(JSON.parse(saves.crane.fields.f_schoolsData).concat(
        [{name: 'Doji Courtier', frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 1}]));
      saves.multi.fields.f_school = 'Doji Courtier';   // as the sheet keeps it: #f_school names the newest School
      expect.multi = expect.crane;
      // An Advanced School after the basic one, named in #f_school as the sheet keeps the newest School: the tab
      // still shows the basic School applied here.
      saves.advanced = JSON.parse(JSON.stringify(saves.crane));
      saves.advanced.fields.f_name = 'Test Advanced';
      saves.advanced.fields.f_schoolsData = JSON.stringify(JSON.parse(saves.crane.fields.f_schoolsData).concat(
        [{name: 'Kakita Duelist', frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 2}]));
      saves.advanced.fields.f_school = 'Kakita Duelist';
      expect.advanced = expect.crane;
      // A School from another Clan's list: shown as itself, inert.
      saves.cross = JSON.parse(JSON.stringify(saves.crane));
      saves.cross.fields.f_name = 'Test Cross';
      saves.cross.fields.f_schoolApplied = JSON.stringify(Object.assign(JSON.parse(saves.crane.fields.f_schoolApplied), {school: 'Kitsu Shugenja'}));
      saves.cross.fields.f_schoolsData = JSON.stringify([{name: 'Kitsu Shugenja', frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0}]);
      saves.cross.fields.f_school = 'Kitsu Shugenja';
      expect.cross = {clan: 'Crane', minorShown: false, family: 'Kakita', school: 'Kitsu Shugenja'};
      // A monk with no Clan recorded: the Brotherhood, found from the School.
      const monk = await page.evaluate(MONK);
      saves.monk = JSON.parse(JSON.stringify(saves.crane));
      Object.assign(saves.monk.fields, {f_name: 'Test Monk', f_clan: '', f_family: '', f_familyApplied: '', f_school: monk,
        f_schoolApplied: JSON.stringify({school: monk}), f_schoolsData: JSON.stringify([{name: monk, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0}])});
      expect.monk = {clan: 'Brotherhood of Shinsei', minorShown: false, family: '', school: monk};
      // Nothing chosen yet: the pickers return to their first options.
      saves.blank = await page.evaluate(() => { window.__L5R_TEST__.resetToBaseline(); return window.__L5R_TEST__.collectData(); });
      saves.blank.fields.f_name = 'Test Blank';
    });
    await context.close();

    // ---- Each one imported, in Management and then in Play ----
    const files = {};
    for (const n of Object.keys(saves)) files[n] = write(n, saves[n]);
    for (const n of ['crane', 'lion', 'minor', 'multi', 'advanced', 'cross', 'monk']) {
      ({context, page} = await open());
      await section('CFS-' + n, async () => {
        await importFile(page, files[n]);
        check('CFS-' + n + '-IMPORT-MANAGEMENT', await staging(page), expect[n]);
        const info = await page.evaluate(() => document.getElementById('cfs_schoolInfo').textContent);
        check('CFS-' + n + '-INFO-NAMES-OWN-SCHOOL', n === 'cross' ? info === '' : info.startsWith(expect[n].school), true);
        await play(page, true);
        check('CFS-' + n + '-IMPORT-PLAY', [await staging(page), await page.evaluate(() => document.getElementById('cfs_clan').disabled)], [expect[n], true]);
        await play(page, false);
      });
      await context.close();
    }

    // ---- The data risk: Apply in Management after a load changes nothing ----
    for (const n of ['crane', 'lion', 'minor']) {
      ({context, page} = await open());
      await section('CFS-APPLY-' + n, async () => {
        await importFile(page, files[n]);
        const before = await saved(page);
        check('CFS-' + n + '-DATA-INTACT', JSON.stringify(await page.evaluate(() => window.__L5R_TEST__.collectData())) === JSON.stringify(saves[n]), true);
        await tap(page, '#cfs_applySchool');
        await page.waitForTimeout(200);
        check('CFS-' + n + '-APPLY-SCHOOL-KEEPS-OWN', await saved(page), before);
        await tap(page, '#cfs_applyFamily');
        await page.waitForTimeout(200);
        check('CFS-' + n + '-APPLY-FAMILY-KEEPS-OWN', await saved(page), before);
      });
      await context.close();
    }
    // Multiple Schools: the load leaves the second School in place (an Apply on load would drop it).
    ({context, page} = await open());
    await section('CFS-multi-DATA', async () => {
      await importFile(page, files.multi);
      check('CFS-multi-DATA-INTACT', JSON.stringify(await page.evaluate(() => window.__L5R_TEST__.collectData())) === JSON.stringify(saves.multi), true);
    });
    await context.close();
    ({context, page} = await open());
    await section('CFS-APPLY-cross', async () => {
      await importFile(page, files.cross);
      const before = await saved(page);
      await tap(page, '#cfs_applySchool');
      await page.waitForTimeout(200);
      check('CFS-cross-APPLY-SCHOOL-INERT', await saved(page), before);
      check('CFS-cross-EXTRA-OPTION-MARKED', await page.evaluate(() =>
        Array.from(document.querySelectorAll('#cfs_school option[data-cfssync]')).map(o => o.value)), ['Kitsu Shugenja']);
      await page.evaluate(() => { const c = document.getElementById('cfs_clan'); c.value = 'Lion'; c.dispatchEvent(new Event('change', {bubbles: true})); });
      check('CFS-cross-EXTRA-OPTION-GOES-ON-CLAN-CHANGE', await page.evaluate(() => document.querySelectorAll('#cfs_school option[data-cfssync]').length), 0);
    });
    await context.close();

    // ---- Loading one character after another; a blank one; loading in Play ----
    ({context, page} = await open());
    await section('CFS-SEQUENCE', async () => {
      await importFile(page, files.crane);
      await importFile(page, files.minor);
      check('CFS-SEQ-MINOR-AFTER-CRANE', await staging(page), expect.minor);
      await importFile(page, files.lion);
      check('CFS-SEQ-LION-AFTER-MINOR', await staging(page), expect.lion);
      await importFile(page, files.blank);
      check('CFS-SEQ-BLANK-RETURNS-TO-DEFAULTS', await staging(page), DEFAULTS);
      await play(page, true);
      await importFile(page, files.crane);
      check('CFS-SEQ-LOADED-WHILE-IN-PLAY', await staging(page), expect.crane);
      await play(page, false);
    });
    await context.close();

    // ---- Saved into the Characters list, the page reloaded, opened from the list ----
    ({context, page} = await open());
    await section('CFS-LIST', async () => {
      await importFile(page, files.lion);
      await tap(page, '#btnSave');
      await page.waitForTimeout(600);
      await importFile(page, files.crane);
      await tap(page, '#btnSave');
      await page.waitForTimeout(600);
      await page.reload();
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready, null, {timeout: 60000});
      const ids = await page.evaluate(() => Array.from(document.getElementById('charSelect').options).filter(o => o.value).map(o => [o.text, o.value]));
      const lion = ids.find(x => /Test Lion/.test(x[0])), crane = ids.find(x => /Test Crane/.test(x[0]));
      check('CFS-LIST-BOTH-SAVED', [!!lion, !!crane], [true, true]);
      await page.evaluate(id => window.__L5R_TEST__.CL11.openCharacter(id), lion[1]);
      await page.waitForTimeout(400);
      check('CFS-LIST-OPEN-LION', [await staging(page), (await saved(page)).school], [expect.lion, 'Kitsu Shugenja']);
      await page.evaluate(id => window.__L5R_TEST__.CL11.openCharacter(id), crane[1]);
      await page.waitForTimeout(400);
      check('CFS-LIST-OPEN-CRANE', [await staging(page), (await saved(page)).school], [expect.crane, 'Kakita Bushi']);
    });
    await context.close();

    // ---- Ruling 5: a person's Apply asks before replacing (real taps: page.click is a trusted click) ----
    const dialog = p => p.evaluate(() => {
      const o = document.getElementById('appConfirmOverlay');
      return o && o.style.display === 'flex' ? document.getElementById('appConfirmMsg').textContent : null;
    });
    const answer = async (p, ok) => { if (await dialog(p) === null) return; await p.click(ok ? '#appConfirmOk' : '#appConfirmCancel'); await p.waitForTimeout(300); };
    ({context, page} = await open());
    await section('CFS-GUARD', async () => {
      check('CFS-GUARD-SWITCH', await page.evaluate(() => window.__L5R_TEST__.CFS_APPLY_GUARD_ENABLED), true);
      await importFile(page, files.crane);
      const before = await saved(page);
      await stage(page, 'Lion', null, 'Matsu', 'Kitsu Shugenja');
      await page.click('#cfs_applySchool');
      await page.waitForTimeout(200);
      check('CFS-GUARD-SCHOOL-ASKS', await dialog(page),
        'Replace your School, Kakita Bushi, with Kitsu Shugenja? Its Skills, Techniques and Honor are set again.');
      await answer(page, false);
      check('CFS-GUARD-CANCEL-KEEPS-SCHOOL', [await dialog(page), await saved(page)], [null, before]);
      await page.click('#cfs_applySchool');
      await page.waitForTimeout(200);
      await answer(page, true);
      await answer(page, false);   // any question asked again stays unanswered
      check('CFS-GUARD-OK-REPLACES-SCHOOL', [(await saved(page)).school, (await saved(page)).schools], ['Kitsu Shugenja', ['Kitsu Shugenja']]);
      await page.click('#cfs_applyFamily');
      await page.waitForTimeout(200);
      check('CFS-GUARD-FAMILY-ASKS', await dialog(page), 'Replace your Family, Kakita, with Matsu? Its Trait bonus moves with it.');
      await answer(page, false);
      check('CFS-GUARD-CANCEL-KEEPS-FAMILY', [(await saved(page)).clan, (await saved(page)).family], ['Crane', 'Kakita']);
      await page.click('#cfs_applyFamily');
      await page.waitForTimeout(200);
      await answer(page, true);
      await answer(page, false);   // any question asked again stays unanswered
      check('CFS-GUARD-OK-REPLACES-FAMILY', [(await saved(page)).clan, (await saved(page)).family], ['Lion', 'Matsu']);
      // A script's click (the wizard's way) is never held.
      await stage(page, 'Crane', null, 'Kakita', 'Kakita Bushi');
      await tap(page, '#cfs_applySchool');
      await page.waitForTimeout(300);
      check('CFS-GUARD-SCRIPT-CLICK-NOT-ASKED', [await dialog(page), (await saved(page)).school], [null, 'Kakita Bushi']);
    });
    await context.close();
    ({context, page} = await open());
    await section('CFS-GUARD-MULTI', async () => {
      await importFile(page, files.multi);
      await page.click('#cfs_applySchool');
      await page.waitForTimeout(200);
      check('CFS-GUARD-SAME-SCHOOL-NAMES-WHAT-GOES', await dialog(page),
        'Apply Kakita Bushi again? Its Skills, Techniques and Honor are set again, and your other School (Doji Courtier) will be removed.');
      await answer(page, false);
      check('CFS-GUARD-CANCEL-KEEPS-BOTH-SCHOOLS', (await saved(page)).schools, ['Kakita Bushi', 'Doji Courtier']);
      // An Advanced School recorded: Phase 4.7 refuses Apply School first, and nothing is asked.
      await page.evaluate(() => {
        const T = window.__L5R_TEST__, adv = T.ADVANCED_SCHOOL_LIBRARY.find(s => !(s.special && s.special.chooseElement)).name;
        T.AS47.save({name: adv, anchorInsightRank: 1, earnedRank: 0, basicSchool: 'Kakita Bushi', basicRank: 1, element: '',
          allowBasic: false, resumed: false, confirmations: []});
      });
      const valid = await page.evaluate(() => !!window.__L5R_TEST__.AS47.record());
      await page.click('#cfs_applySchool');
      await page.waitForTimeout(200);
      check('CFS-GUARD-ADVANCED-REFUSAL-WINS', [valid, await dialog(page), (await saved(page)).schools], [true, null, ['Kakita Bushi', 'Doji Courtier']]);
    });
    await context.close();
    ({context, page} = await open());
    await section('CFS-GUARD-NONE', async () => {
      // Nothing applied yet: no question.
      await stage(page, 'Crane', null, 'Kakita', 'Kakita Bushi');
      await page.click('#cfs_applyFamily');
      await page.waitForTimeout(200);
      check('CFS-GUARD-NOTHING-APPLIED-NOT-ASKED', [await dialog(page), (await saved(page)).family], [null, 'Kakita']);
      // Nothing valid staged (the inert extra option): no question, and Apply changes nothing.
      await importFile(page, files.cross);
      const before = await saved(page);
      await page.click('#cfs_applySchool');
      await page.waitForTimeout(200);
      check('CFS-GUARD-NOTHING-STAGED-NOT-ASKED', [await dialog(page), await saved(page)], [null, before]);
    });
    await context.close();

    // ---- Logic and boundaries ----
    ({context, page} = await open());
    await section('CFS-LOGIC', async () => {
      const t = await page.evaluate(src => {
        const plain = eval('(' + src + ')');
        const S = window.__L5R_TEST__.CFSSYNC, monk = window.__L5R_TEST__.BROTHERHOOD_SCHOOL_LIBRARY.map(s => s.name).find(plain);
        if (!S) return {monkName: monk};
        return {
          great: S.target({clan: 'Crane', family: 'Kakita', school: 'Kakita Bushi'}),
          trimmed: S.target({clan: ' Lion ', family: ' Matsu', school: 'Kitsu Shugenja '}),
          fromSchool: S.target({clan: '', family: '', school: 'Hida Bushi'}),
          unknownClanSchool: S.target({clan: 'Not A Clan', family: '', school: 'Doji Courtier'}),
          monk: S.target({clan: '', family: '', school: monk}),
          blank: S.target({clan: '', family: '', school: ''}),
          unknown: S.target({clan: 'Not A Clan', family: '', school: 'Not A School'}),
          monkName: monk
        };
      }, PLAIN_SRC);
      check('CFS-LOGIC-GREAT-CLAN', t.great, {clan: 'Crane', minorClan: null, family: 'Kakita', school: 'Kakita Bushi'});
      check('CFS-LOGIC-TRIMS', t.trimmed, {clan: 'Lion', minorClan: null, family: 'Matsu', school: 'Kitsu Shugenja'});
      check('CFS-LOGIC-CLAN-FROM-SCHOOL', t.fromSchool, {clan: 'Crab', minorClan: null, family: '', school: 'Hida Bushi'});
      check('CFS-LOGIC-UNKNOWN-CLAN-USES-SCHOOL', t.unknownClanSchool, {clan: 'Crane', minorClan: null, family: '', school: 'Doji Courtier'});
      check('CFS-LOGIC-BROTHERHOOD', t.monk, {clan: 'Brotherhood of Shinsei', minorClan: null, family: '', school: t.monkName});
      check('CFS-LOGIC-BLANK-IS-NULL', t.blank, null);
      check('CFS-LOGIC-UNKNOWN-IS-NULL', t.unknown, null);
      const minorT = await page.evaluate(() => {
        const S = window.__L5R_TEST__.CFSSYNC, m = document.getElementById('cfs_minorClan').options[0].value;
        return [m, S ? S.target({clan: m, family: '', school: ''}) : undefined];
      });
      check('CFS-LOGIC-MINOR-CLAN', minorT[1], {clan: 'Minor Clan', minorClan: minorT[0], family: '', school: ''});
      // A reset outside the wizard (New, Delete, a blank sheet) returns the pickers to their first options.
      await stage(page, 'Minor Clan', minorT[0], '', '');
      await page.evaluate(() => window.__L5R_TEST__.resetToBaseline());
      check('CFS-RESET-OUTSIDE-WIZARD-DEFAULTS', await staging(page), DEFAULTS);
      // The wizard resets the sheet mid-step and then stages its own pick: there a reset leaves the pickers alone.
      // (Its open state stubbed here; the wizard's own harnesses drive the real flow.)
      await stage(page, 'Minor Clan', minorT[0], '', '');
      await page.evaluate(() => { const W = window.__L5R_TEST__.CW112, was = W.isOpen; W.isOpen = () => true;
        try { window.__L5R_TEST__.resetToBaseline(); } finally { W.isOpen = was; } });
      check('CFS-RESET-IN-WIZARD-LEAVES-PICKERS', [await page.evaluate(() => document.getElementById('cfs_clan').value),
        await page.evaluate(() => document.getElementById('cfs_minorClan').value)], ['Minor Clan', minorT[0]]);
      // Syncing writes no saved field.
      await importFile(page, files.minor);
      const a = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await stage(page, 'Crab', null, 'Hida', 'Hida Bushi');
      const synced = await page.evaluate(() => window.__L5R_TEST__.CFSSYNC ? window.__L5R_TEST__.CFSSYNC.sync() : null);
      const b = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      check('CFS-SYNC-WRITES-NO-SAVED-FIELD', [synced, a === b], [true, true]);
      check('CFS-SYNC-RESTAGES', await staging(page), expect.minor);
      // A refused load (a save from a newer sheet) leaves the pickers as they were.
      const refused = JSON.parse(JSON.stringify(saves.lion));
      refused.schemaVersion = 999;
      await page.evaluate(() => { window.__cfsAlerts = 0; });
      page.once('dialog', d => d.dismiss().catch(() => {}));
      await importFile(page, write('refused', refused));
      await page.evaluate(() => { const b = document.querySelector('#appAlertOverlay button, .app-alert button'); if (b) b.click(); });
      check('CFS-REFUSED-LOAD-LEAVES-PICKERS', await staging(page), expect.minor);
    });
    await context.close();
  } finally {
    await browser.close();
    fs.rmSync(tmp, {recursive: true, force: true});
  }
  check('CFS-NO-PAGE-ERRORS', errors, []);
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed` + (results.length === TOTAL ? '' : ` (expected ${TOTAL} checks)`));
  process.exit(failed || results.length !== TOTAL ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(2); });
