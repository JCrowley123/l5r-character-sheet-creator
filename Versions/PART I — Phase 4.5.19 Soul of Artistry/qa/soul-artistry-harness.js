/* Real-browser acceptance tests for Soul of Artistry (A12, Feature 4.5.19).
 * Oracles from Core p.154 and pp.135/143-144 as recorded in SOURCE-OTHER-PREPARATION.md, never
 * from SA4519: 4 XP, 3 for Crane OR Courtier (one price, not two discounts); an otherwise
 * Unskilled Artisan/Craft roll is rolled as Rank 1 (Trait + 1 rolled, Trait kept, 10s explode);
 * Calligraphy is Artisan; Engineering, Sailing and Forgery are Craft; nothing else is guessed.
 * Dice are counted on the rendered result, Traits read from the sheet's own trait lookup.
 * node soul-artistry-harness.js <sheet.html>
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
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id, String(error.stack || error), 'no exception'); }
}
const SOUL = 'Soul of Artistry';
const PRICE = {normal:4, reduced:3};
// Source table: [skill name as a player might write it, family it belongs to (or null)].
const NAMES = [
  ['Artisan', 'Artisan'], ['Artisan: Painting', 'Artisan'], ['artisan: origami', 'Artisan'], ['Artisan (Poetry)', 'Artisan'],
  ['Calligraphy', 'Artisan'], ['Calligraphy (Cipher)', 'Artisan'],
  ['Craft', 'Craft'], ['Craft: Blacksmithing', 'Craft'], ['Craft: Weaponsmithing', 'Craft'], ['Engineering', 'Craft'],
  ['Sailing', 'Craft'], ['Forgery', 'Craft'], ['Forgery (Documents)', 'Craft'],
  ['Crafty', null], ['Craftsmanship', null], ['Artisanal', null], ['Etiquette', null], ['Perform: Song', null], ['Lore: Calligraphy', null],
];

async function reset(page, {clan = '', school = ''} = {}) {
  await page.evaluate(({clan, school}) => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    document.getElementById('f_clan').value = clan;
    document.getElementById('f_schoolsData').value = school
      ? JSON.stringify([{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}]) : '';
    T.recalcAll();
  }, {clan, school});
}
async function quickAdd(page, list = 'adv') {
  await page.evaluate(list => { const s = document.getElementById(list + 'QuickAdd'); s.value = 'Soul of Artistry'; s.dispatchEvent(new Event('change', {bubbles:true})); }, list);
}
const pick = (page, family) => page.locator('#advConfigGrid input[name="sa4519Family"][value="' + family + '"]').check();
const confirm = page => page.locator('#advConfigConfirm').click();
const modalOpen = page => page.locator('#advConfigModalOverlay').isVisible();
async function soul(page, family, opts) {
  await reset(page, opts); await quickAdd(page);
  await page.waitForSelector('#advConfigGrid .sa4519-option', {state:'visible'});
  await pick(page, family); await confirm(page);
}
const row = (page, list = 'advList', index = 0) => page.evaluate(({list, index}) => {
  const d = document.querySelectorAll('#' + list + ' .entry')[index];
  return d ? {cost:Number(d.querySelector('.en-cost').value), config:JSON.parse(d.dataset.advConfig || 'null'),
    badge:d.querySelector('.sa4519-badge')?.textContent || '', reminder:d.querySelector('.sa4519-reminder')?.textContent || '',
    text:d.querySelector('.adv-config-row')?.textContent || '', hasRow:!!d.querySelector('.adv-config-row'),
    warning:!!d.querySelector('.adv-config-warn')} : null;
}, {list, index});
const load = (page, adv, disadv = []) => page.evaluate(({adv, disadv}) => {
  const T = window.__L5R_TEST__; T.applyData(Object.assign(T.collectData(), {adv, disadv})); T.recalcAll();
}, {adv, disadv});
const collect = page => page.evaluate(() => window.__L5R_TEST__.collectData());
const trait = (page, name) => page.evaluate(n => window.__L5R_TEST__.getTraitValueByName(n), name);

// Starts a roll, lets the preview open, and returns what the preview says. Never returned bare:
// the in-flight roll is wrapped so the caller does not await a roll nobody has confirmed.
async function openRoll(page, starter) {
  const pending = page.evaluate(starter.fn, starter.arg);
  pending.catch(() => {});
  await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
  const preview = await page.locator('#rollPreviewBody').textContent();
  return {pending, preview};
}
async function goRoll(page, handle) {
  await page.locator('#rollPreviewGo').click(); await handle.pending;
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
    kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
    title:document.getElementById('rollModalTitle')?.textContent || '', body:document.getElementById('rollModalBody')?.textContent || ''}));
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const o = document.getElementById('rollModalOverlay'); if (o) o.style.display = 'none'; });
  return {...r, explodes:/10s explode/.test(r.body) && !/do not explode/.test(r.body)};
}
// The Untrained Skills path exactly: unskilled:true, rank = Trait, explode:false.
const unskilledProbe = (skillName, traitName) => ({arg:{skillName, traitName}, fn:({skillName, traitName}) => {
  const T = window.__L5R_TEST__; const tv = T.getTraitValueByName(traitName);
  return T.rollWithModifiers(skillName + ' (Unskilled)', T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName, traitName, unskilled:true, traitValue:tv}), tv, tv, {explode:false});
}});
async function probeRoll(page, skillName, traitName = 'Awareness') {
  const handle = await openRoll(page, unskilledProbe(skillName, traitName));
  return {...(await goRoll(page, handle)), preview:handle.preview};
}
async function skillRow(page, name, trait, rank) {
  await page.evaluate(({name, trait, rank}) => {
    document.getElementById('addSkill').click();
    const tr = [...document.querySelectorAll('#skillsBody tr')].pop();
    tr.querySelector('.sk-name').value = name; tr.querySelector('.sk-trait').value = trait; tr.querySelector('.sk-rank').value = String(rank);
    window.__L5R_TEST__.recalcAll(); window.__saRow = tr;
  }, {name, trait, rank});
}
const rowRoll = {arg:null, fn:() => { window.__saRow.querySelector('.sk-roll').click(); return null; }};

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    const page = await browser.newPage({viewport:{width:375, height:812}, acceptDownloads:true});
    page.setDefaultTimeout(6000);
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => !!window.__L5R_TEST__);

    await section('SA-START', async () => {
      check('SA-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_SOUL_ARTISTRY_ENABLED));
      check('SA-SCHEMA', await page.evaluate(n => window.__L5R_TEST__.advConfigSchemaFor(n)?.type, SOUL), 'skillFamilyPick');
      check('SA-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
    });

    await section('SA-BASELINE', async () => {
      // Without the Advantage the Untrained path is Trait k Trait and does not explode.
      await reset(page); const aw = await trait(page, 'Awareness');
      const r = await probeRoll(page, 'Artisan: Painting');
      check('SA-BASELINE-UNSKILLED', [r.dice, r.kept, r.explodes], [aw, aw, false]);
    });

    await section('SA-PICKER', async () => {
      await reset(page); const initial = await page.locator('#f_xpSpent').inputValue().then(Number);
      await quickAdd(page); await page.waitForSelector('#advConfigGrid .sa4519-option', {state:'visible'});
      const options = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid .sa4519-option')].map(l => ({
        name:l.querySelector('b').textContent, text:l.textContent, checked:l.querySelector('input').checked, labelled:l.querySelector('input').labels.length === 1})));
      check('SA-TWO-FAMILIES', options.map(o => o.name), ['Artisan Skills', 'Craft Skills']);
      check('SA-OPTION-MEMBERS', [/Calligraphy/.test(options[0].text), /Engineering/.test(options[1].text) && /Sailing/.test(options[1].text) && /Forgery/.test(options[1].text)], [true, true]);
      check('SA-NONE-PRESELECTED', options.every(o => !o.checked));
      check('SA-OPTIONS-LABELLED', options.every(o => o.labelled));
      await confirm(page);
      check('SA-REQUIRES-CHOICE', [await modalOpen(page), await page.locator('#advConfigGrid [role=alert]').isVisible(), (await row(page)).config], [true, true, null]);
      await pick(page, 'Craft'); await confirm(page);
      const r = await row(page);
      check('SA-CONFIG', r.config, {type:'skillFamilyPick', revision:1, family:'Craft', value:'Craft'});
      check('SA-BADGE', [r.badge, /Craft Skills you have no Rank in roll as Rank 1/.test(r.reminder), /Engineering, Sailing and Forgery/.test(r.reminder)], ['Craft Skills', true, true]);
      check('SA-PRICE-TOTAL', [r.cost, (await page.locator('#f_xpSpent').inputValue().then(Number)) - initial], [PRICE.normal, PRICE.normal]);
    });

    await section('SA-PRICE', async () => {
      for (const [id, opts, price] of [['CRANE', {clan:'Crane'}, PRICE.reduced], ['COURTIER-TITLE', {school:'Doji Courtier'}, PRICE.reduced],
        ['COURTIER-TAG', {school:'Kitsuki Investigator [Courtier]'}, PRICE.reduced], ['CRANE-AND-COURTIER', {clan:'Crane', school:'Doji Courtier'}, PRICE.reduced],
        ['LION-BUSHI', {clan:'Lion', school:'Hida Bushi'}, PRICE.normal], ['ARTISAN-SCHOOL', {clan:'Scorpion', school:'Kakita Artisan'}, PRICE.normal]]) {
        await soul(page, 'Artisan', opts);
        check('SA-PRICE-' + id, (await row(page)).cost, price);
      }
      await soul(page, 'Artisan', {clan:'Lion'});
      await page.evaluate(() => { document.getElementById('f_clan').value = 'Crane'; window.__L5R_TEST__.recalcAll(); });
      check('SA-PRICE-FOLLOWS-CLAN', [(await row(page)).cost, /3 XP: Crane/.test((await row(page)).reminder)], [PRICE.reduced, true]);
    });

    await section('SA-FAMILIES', async () => {
      for (const family of ['Artisan', 'Craft']) {
        await soul(page, family); const aw = await trait(page, 'Awareness');
        for (const [name, owner] of NAMES) {
          const r = await probeRoll(page, name);
          const lifted = owner === family;
          check('SA-' + family.toUpperCase() + '-' + name.replace(/\W+/g, '_'), [r.dice, r.kept, r.explodes], lifted ? [aw + 1, aw, true] : [aw, aw, false]);
        }
      }
    });

    await section('SA-ROW-PATH', async () => {
      await soul(page, 'Artisan'); const aw = await trait(page, 'Awareness');
      await skillRow(page, 'Artisan: Painting', 'Awareness', 0);
      const before = await collect(page);
      const handle = await openRoll(page, rowRoll);
      check('SA-ROW-PREVIEW-RANK1', /Artisan: Painting Rank 1/.test(handle.preview) && !/Unskilled, so the Trait rolls and keeps alone/.test(handle.preview));
      check('SA-ROW-PREVIEW-EXPLAINS', /Soul of Artistry/.test(handle.preview) && /treated as Rank 1/.test(handle.preview));
      check('SA-ROW-NO-DOUBLE-VOID-LIFT', [/Rank 0 → 1/.test(handle.preview), /\+1k1 to a Skill/.test(handle.preview)], [false, true]);
      const r = await goRoll(page, handle);
      check('SA-ROW-DICE', [r.dice, r.kept, r.explodes], [aw + 1, aw, true]);
      check('SA-ROW-TITLE', /Soul of Artistry — Rank 1/.test(r.title));
      const after = await collect(page);
      check('SA-ROW-RANK-UNCHANGED', await page.evaluate(() => window.__saRow.querySelector('.sk-rank').value), '0');
      check('SA-ROW-NOTHING-SPENT', Object.keys(before.fields).filter(k => before.fields[k] !== after.fields[k]), []);
    });

    await section('SA-UNTRAINED-LIST', async () => {
      await soul(page, 'Artisan'); const intel = await trait(page, 'Intelligence');
      await page.locator('#btnUntrainedSkills').evaluate(b => b.click());
      const handle = await openRoll(page, {arg:null, fn:() => { document.querySelector('.untrained-chip[data-skill-name="Calligraphy"]').click(); return null; }});
      check('SA-LIST-PREVIEW-RANK1', /Calligraphy Rank 1/.test(handle.preview));
      const r = await goRoll(page, handle);
      check('SA-LIST-DICE', [r.dice, r.kept, r.explodes], [intel + 1, intel, true]);
      check('SA-LIST-TITLE', [/Soul of Artistry — Rank 1/.test(r.title), /\(Unskilled\)/.test(r.title)], [true, false]);
    });

    await section('SA-TRAINED-UNCHANGED', async () => {
      await soul(page, 'Artisan'); const aw = await trait(page, 'Awareness');
      await skillRow(page, 'Artisan: Painting', 'Awareness', 2);
      const handle = await openRoll(page, rowRoll);
      check('SA-TRAINED-NO-LINE', /Soul of Artistry/.test(handle.preview), false);
      const r = await goRoll(page, handle);
      check('SA-TRAINED-DICE', [r.dice, r.kept], [aw + 2, aw]);
    });

    await section('SA-SCOPE', async () => {
      await soul(page, 'Craft');
      const kinds = await page.evaluate(() => { const T = window.__L5R_TEST__;
        return ['ATTACK', 'DAMAGE', 'TRAIT', 'MANUAL'].map(k => T.SA4519 ? !!T.SA4519.lift('x', T.makeRollContext(T.ROLL_KINDS[k], {skillName:'Craft: Weaponsmithing', traitName:'Agility', skillRank:0, unskilled:true}), 2, 2, {}) : 'missing'); });
      check('SA-SKILL-ROLLS-ONLY', kinds, [false, false, false, false]);
      // A real attack context through the real pipeline keeps its pool.
      const handle = await openRoll(page, {arg:null, fn:() => { const T = window.__L5R_TEST__;
        return T.rollWithModifiers('Attack probe', T.makeRollContext(T.ROLL_KINDS.ATTACK, {skillName:'Craft', traitName:'Agility', skillRank:0, unskilled:true}), 3, 3, {explode:false}); }});
      const r = await goRoll(page, handle);
      check('SA-ATTACK-UNCHANGED', [r.dice, r.kept], [3, 3]);
    });

    await section('SA-ROWS', async () => {
      const aw = await trait(page, 'Awareness');
      await reset(page);
      await load(page, [{name:SOUL, cost:'4', desc:'', config:{type:'skillFamilyPick', revision:1, family:'Artisan', value:'Artisan'}},
        {name:SOUL, cost:'4', desc:'', config:{type:'skillFamilyPick', revision:1, family:'Artisan', value:'Artisan'}}]);
      check('SA-DUPLICATE-LIFTS-ONCE', (await probeRoll(page, 'Artisan')).dice, aw + 1);
      await load(page, [{name:SOUL, cost:'4', desc:'', config:{type:'skillFamilyPick', revision:1, family:'Artisan', value:'Artisan'}},
        {name:SOUL, cost:'4', desc:'', config:{type:'skillFamilyPick', revision:1, family:'Craft', value:'Craft'}}]);
      check('SA-BOTH-FAMILIES', [(await probeRoll(page, 'Calligraphy')).dice, (await probeRoll(page, 'Sailing')).dice], [aw + 1, aw + 1]);
      await load(page, [{name:SOUL, cost:'4', desc:'legacy'}]);
      check('SA-UNCONFIGURED', [(await row(page)).warning, (await probeRoll(page, 'Artisan')).dice], [true, aw]);
      await load(page, [], [{name:SOUL, cost:'4', desc:'', config:{type:'skillFamilyPick', revision:1, family:'Artisan', value:'Artisan'}}]);
      check('SA-WRONG-SIDE', [/belongs in Advantages/.test((await row(page, 'disadvList')).text), (await probeRoll(page, 'Artisan')).dice], [true, aw]);
      for (const [id, config] of [['UNKNOWN', {type:'skillFamilyPick', revision:1, family:'Perform'}], ['CASE', {type:'skillFamilyPick', revision:1, family:'artisan'}],
        ['FUTURE', {type:'skillFamilyPick', revision:2, family:'Artisan'}], ['EXTRA', {type:'skillFamilyPick', revision:1, family:'Artisan', rank:2}],
        ['OTHER-TYPE', {type:'skillPick', family:'Artisan'}]]) {
        await load(page, [{name:SOUL, cost:'9', desc:'', config}]);
        const r = await row(page);
        check('SA-INVALID-' + id, [(await collect(page)).adv[0].config, r.warning && /Saved setting kept/.test(r.text), r.cost, (await probeRoll(page, 'Artisan')).dice], [config, true, 9, aw]);
      }
    });

    await section('SA-PERSISTENCE', async () => {
      await soul(page, 'Craft');
      const saved = await collect(page);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(button => button.click());
      const stream = await (await downloadPromise).createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      await reset(page);
      await page.locator('#fileImport').setInputFiles({name:'s.l5r.json', mimeType:'application/json', buffer:Buffer.concat(chunks)});
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('SA-IMPORT', [(await collect(page)).adv, (await row(page)).badge], [saved.adv, 'Craft Skills']);
      await page.locator('#btnSave').evaluate(button => button.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const id = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(id);
      await page.locator('#btnLoad').evaluate(button => button.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('SA-LOCAL-RELOAD', (await collect(page)).adv, saved.adv);
      check('SA-RELOADED-LIFTS', (await probeRoll(page, 'Forgery', 'Agility')).dice, (await trait(page, 'Agility')) + 1);
    });

    await section('SA-EDIT-RENAME-INFO', async () => {
      await soul(page, 'Artisan');
      await page.locator('#advList .adv-config-btn').click();
      check('SA-EDIT-SHOWS-CURRENT', await page.evaluate(() => document.querySelector('#advConfigGrid input:checked')?.value), 'Artisan');
      await pick(page, 'Craft'); await page.locator('#advConfigX').click();
      check('SA-CANCEL-KEEPS', (await row(page)).config.family, 'Artisan');
      await page.locator('#advList .sa4519-info').click();
      const info = await page.locator('#stanceInfoBody').textContent();
      check('SA-INFO', /Core p\.154/.test(await page.locator('#stanceInfoRing').textContent()) && /Your choice: Artisan Skills/.test(info) &&
        /Calligraphy counts as Artisan/.test(info) && /Engineering, Sailing and Forgery count as Craft/.test(info) && /3 for a Crane or a Courtier/.test(info));
      await page.locator('#stanceInfoClose').click();
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Unrelated'; window.__L5R_TEST__.recalcAll(); });
      check('SA-RENAMED-CLEAN', [(await row(page)).hasRow, (await row(page)).config, (await probeRoll(page, 'Artisan')).dice], [false, null, await trait(page, 'Awareness')]);
    });

    await section('SA-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:700});
        await reset(page); await quickAdd(page); await page.waitForSelector('#advConfigGrid .sa4519-option', {state:'visible'});
        const g = await page.evaluate(() => {
          const grid = document.getElementById('advConfigGrid').getBoundingClientRect();
          const opts = [...document.querySelectorAll('#advConfigGrid .sa4519-option')];
          return {fits:opts.every(o => { const r = o.getBoundingClientRect(); return r.left >= grid.left - 1 && r.right <= grid.right + 1 && o.scrollWidth <= o.clientWidth + 1; }),
            readable:opts.every(o => parseFloat(getComputedStyle(o).fontSize) >= 12 && getComputedStyle(o).textTransform === 'none' && o.getBoundingClientRect().height >= 32)};
        });
        await pick(page, 'Craft'); await confirm(page);
        const reachable = !(await modalOpen(page)) && (await row(page)).config?.family === 'Craft';
        const rowFit = await page.evaluate(() => { const r = document.querySelector('#advList .adv-config-row'); return r.scrollWidth <= r.clientWidth + 1; });
        check('SA-GEOMETRY-' + width, {...g, reachable, rowFit}, {fits:true, readable:true, reachable:true, rowFit:true});
      }
      await page.setViewportSize({width:375, height:812});
    });
    check('SA-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('SA-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('SA4519_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
