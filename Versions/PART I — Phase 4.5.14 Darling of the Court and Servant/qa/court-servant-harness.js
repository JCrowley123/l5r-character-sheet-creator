/* Real-browser acceptance tests for Darling of the Court (A04) and the Servant reference (A11).
 * Expected values come from the source notes (Core pp.148 and 153), never from CS4514 itself.
 * node court-servant-harness.js <sheet.html>
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
const DARLING = 'Darling of the Court';
// Source oracle: 2 XP per court, 1 XP per court for a Courtier (Core p.148).
const PER_COURT = {normal:2, courtier:1};
// Source oracle: Core p.153 sample servants (type, ability, listed discount).
const SERVANT_SAMPLES = [
  ['Artisan','One Artisan Skill at 3','Crane −2'], ['Attendant','Etiquette (Conversation) 3','Scorpion −2'],
  ['Budoka','One Weapon Skill at 3','Lion −2'], ['Craftsman','One Craft Skill at 3','Dragon −2'],
  ['Eta Attendant','Lore: Anatomy 3','Crab −2'], ['Groom','Animal Handling (Horses) 3','Unicorn −2'],
  ['Merchant','Commerce (Appraisal) 3','Mantis −2'], ['Scribe','One Lore Skill at 3','Phoenix −2'],
  ['Sohei','Jiujutsu 3','Spider −2']];

async function reset(page, {clan = '', school = '', status = '1'} = {}) {
  await page.evaluate(({clan, school, status}) => {
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal();
    T.resetToBaseline();
    document.getElementById('f_clan').value = clan;
    document.getElementById('f_statusRank').value = status;
    document.getElementById('f_schoolsData').value = school
      ? JSON.stringify([{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}]) : '';
    T.recalcAll();
  }, {clan, school, status});
}
async function setSchool(page, school) {
  await page.evaluate(school => {
    document.getElementById('f_schoolsData').value = school
      ? JSON.stringify([{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}]) : '';
    window.__L5R_TEST__.recalcAll();
  }, school);
}
async function quickAdd(page, name, list = 'adv') {
  await page.evaluate(({name, list}) => {
    const select = document.getElementById(list + 'QuickAdd');
    select.value = name;
    if (select.value !== name) throw Error('Missing catalogue option ' + name);
    select.dispatchEvent(new Event('change', {bubbles:true}));
  }, {name, list});
}
const modalOpen = page => page.locator('#advConfigModalOverlay').isVisible();
async function fillCourts(page, courts) {
  // Drive the real editor: add or remove lines until the count matches, then type each name.
  for (;;) {
    const count = await page.locator('#advConfigGrid .court4514-input').count();
    if (count < courts.length) await page.locator('#advConfigGrid .court4514-add').click();
    else if (count > courts.length) await page.locator('#advConfigGrid .court4514-remove').last().click();
    else break;
  }
  for (let i = 0; i < courts.length; i++) await page.locator('#advConfigGrid .court4514-input').nth(i).fill(courts[i]);
}
const confirm = page => page.locator('#advConfigConfirm').click();
const cancel = page => page.locator('#advConfigX').click();
async function rows(page, list = 'advList') {
  return page.evaluate(list => [...document.querySelectorAll('#' + list + ' .entry')].map(div => ({
    name:div.querySelector('.en-name').value, cost:Number(div.querySelector('.en-cost').value),
    config:JSON.parse(div.dataset.advConfig || 'null'),
    text:div.querySelector('.adv-config-row')?.textContent || '', hasRow:!!div.querySelector('.adv-config-row'),
    warning:!!div.querySelector('.adv-config-warn'),
    radios:[...div.querySelectorAll('.court4514-courts input[type=radio]')].map(r => r.checked),
    toggles:div.querySelectorAll('.court4514-session-box').length,
    status:div.querySelector('.court4514-status')?.textContent || ''})), list);
}
const first = async (page, list) => (await rows(page, list))[0];
async function darling(page, courts, opts = {}) {
  await reset(page, opts); await quickAdd(page, DARLING); await fillCourts(page, courts); await confirm(page);
  return first(page);
}
async function edit(page, index = 0) {
  await page.locator('#advList .entry').nth(index).locator('.adv-config-btn').click();
  await page.waitForSelector('#advConfigGrid .court4514-input', {state:'visible'});
}
const collect = page => page.evaluate(() => window.__L5R_TEST__.collectData());
const xp = page => page.locator('#f_xpSpent').inputValue().then(Number);
const field = (page, id) => page.locator('#' + id).inputValue();

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    const page = await browser.newPage({viewport:{width:375,height:812}, acceptDownloads:true});
    page.setDefaultTimeout(4000);
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => !!window.__L5R_TEST__);

    await section('CS-START', async () => {
      check('CS-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_COURT_SERVANT_ENABLED));
      check('CS-REGISTRY', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(x => [x.id, x.priority]).sort((a, b) => a[1] - b[1])),
        [['range',20],['arrow',25],['stance',30],['offhand',35],['wounds',40],['void',50],['adv-config',60]]);
      check('CS-DARLING-SCHEMA', await page.evaluate(n => window.__L5R_TEST__.advConfigSchemaFor(n)?.type, DARLING), 'courtList');
      check('CS-SERVANT-NO-SCHEMA', await page.evaluate(() => window.__L5R_TEST__.advConfigSchemaFor('Servant')), null);
    });

    await section('CS-PRICE', async () => {
      await reset(page); const initial = await xp(page);
      await quickAdd(page, DARLING);
      check('CS-OPENS-ON-ADD', await modalOpen(page));
      check('CS-ONE-BLANK-LINE', await page.locator('#advConfigGrid .court4514-input').count(), 1);
      const blank = await first(page);
      check('CS-BLANK-PRICED-AS-ONE', blank.cost, PER_COURT.normal);
      check('CS-BLANK-WARN', blank.warning);
      check('CS-BLANK-NO-CONTROLS', blank.toggles, 0);
      await fillCourts(page, ['Kyuden Bayushi']); await confirm(page);
      check('CS-CLOSES-ON-CONFIRM', await modalOpen(page), false);
      let row = await first(page);
      check('CS-ONE-COURT-PRICE', row.cost, PER_COURT.normal);
      check('CS-ONE-COURT-TOTAL', await xp(page), initial + PER_COURT.normal);
      check('CS-CONFIG-SHAPE', row.config, {type:'courtList', revision:1, courts:['Kyuden Bayushi'],
        selected:'Kyuden Bayushi', inSession:false, value:'Kyuden Bayushi'});
      check('CS-BADGE', row.text.includes('1 court') && row.text.includes('2 XP'));
      await edit(page); await fillCourts(page, ['Kyuden Bayushi', 'Toshi Ranbo', 'Otosan Uchi']); await confirm(page);
      row = await first(page);
      check('CS-THREE-COURTS-6', row.cost, 3 * PER_COURT.normal);
      check('CS-THREE-COURTS-TOTAL', await xp(page), initial + 3 * PER_COURT.normal);
      check('CS-SINGLE-ROW', (await rows(page)).length, 1);
      for (const [school, perCourt, id] of [
        ['Doji Courtier', PER_COURT.courtier, 'TITLE'],
        ['Kitsuki Investigator [Courtier]', PER_COURT.courtier, 'TAG'],
        ['Hida Bushi', PER_COURT.normal, 'BUSHI'],
        // Declared interpretation, not a quotation: an Artisan School without a Courtier tag.
        ['Kakita Artisan', PER_COURT.normal, 'UNTAGGED-ARTISAN']]) {
        await setSchool(page, school);
        check('CS-SCHOOL-STATE-' + id, await field(page, 'f_schoolsData').then(v => JSON.parse(v)[0].name), school);
        check('CS-COURTIER-' + id, (await first(page)).cost, 3 * perCourt);
      }
      await setSchool(page, 'Doji Courtier');
      check('CS-COURTIER-BADGE', (await first(page)).text.includes('Courtier: 1 each'));
      check('CS-COURTIER-TOTAL', await xp(page), initial + 3 * PER_COURT.courtier);
      await page.evaluate(() => { for (let i = 0; i < 8; i++) window.__L5R_TEST__.recalcAll(); });
      check('CS-RECALC-NO-DOUBLE-CHARGE', (await first(page)).cost, 3 * PER_COURT.courtier);
      // Not '': an empty schools list falls back to the #f_school DISPLAY field, which still
      // shows the previous School until the next render (CLAUDE.md, "displays, not state").
      await setSchool(page, 'Hida Bushi');
      await edit(page); await fillCourts(page, ['Changed', 'Courts', 'Here', 'Four']); await cancel(page);
      check('CS-CANCEL-KEEPS-COURTS', (await first(page)).config.courts, ['Kyuden Bayushi', 'Toshi Ranbo', 'Otosan Uchi']);
      check('CS-CANCEL-KEEPS-PRICE', (await first(page)).cost, 3 * PER_COURT.normal);
    });

    await section('CS-VALIDATION', async () => {
      await darling(page, ['Kyuden Bayushi']);
      const saved = (await first(page)).config;
      for (const [id, courts, reason] of [
        ['DUPLICATE-CASE', ['Kyuden Bayushi', 'kyuden bayushi'], /listed twice/],
        ['DUPLICATE-SPACE', ['Kyuden Bayushi', '  Kyuden   Bayushi '], /listed twice/],
        ['DUPLICATE-APOSTROPHE', ['Toshi Ranbo’s court', "Toshi Ranbo's court"], /listed twice/],
        ['EMPTY-LINE', ['Kyuden Bayushi', '   '], /name for each court/],
        ['NO-COURTS', [], /at least one court/]]) {
        await edit(page); await fillCourts(page, courts); await confirm(page);
        check('CS-REJECT-' + id, await modalOpen(page));
        check('CS-REJECT-REASON-' + id, reason.test(await page.locator('#advConfigGrid [role=alert]').textContent()));
        check('CS-REJECT-VISIBLE-' + id, await page.locator('#advConfigGrid [role=alert]').isVisible());
        check('CS-NO-COMMIT-' + id, (await first(page)).config, saved);
        await cancel(page);
      }
      await edit(page); await fillCourts(page, ['  Kyuden   Bayushi  ', 'Otosan Uchi']); await confirm(page);
      check('CS-TRIMS-AND-COLLAPSES', (await first(page)).config.courts, ['Kyuden Bayushi', 'Otosan Uchi']);
    });

    await section('CS-SESSION', async () => {
      await darling(page, ['Kyuden Bayushi', 'Toshi Ranbo'], {status:'3'});
      await quickAdd(page, 'Blackmailed', 'disadv');
      if (await modalOpen(page)) await cancel(page);
      const blackmailed = async () => (await first(page, 'disadvList')).cost;
      check('CS-BLACKMAILED-BASE', await blackmailed(), 3);
      let row = await first(page);
      check('CS-ONE-SELECTED', row.radios, [true, false]);
      check('CS-NOT-IN-SESSION-TEXT', /Status 3 as normal/.test(row.status) && !/counts as/.test(row.status));
      const before = await collect(page);
      await page.locator('#advList .court4514-session').click();
      row = await first(page);
      check('CS-SESSION-SAVED', row.config.inSession, true);
      check('CS-SESSION-READOUT', /Status 3 — counts as 4 at Kyuden Bayushi/.test(row.status));
      check('CS-NO-STACK', !/counts as 5/.test(row.status));
      check('CS-STATUS-FIELD-UNCHANGED', [await field(page, 'f_statusRank'), await field(page, 'f_statusPts')],
        [before.fields.f_statusRank, before.fields.f_statusPts]);
      check('CS-BLACKMAILED-UNCHANGED', await blackmailed(), 3);
      check('CS-SESSION-NO-XP', row.cost, 2 * PER_COURT.normal);
      check('CS-FOCUS-RETURNS-TOGGLE', await page.evaluate(() => document.activeElement?.classList.contains('court4514-session-box')));
      await page.locator('#advList .court4514-court').nth(1).click();
      row = await first(page);
      check('CS-SELECT-SECOND', row.config.selected, 'Toshi Ranbo');
      check('CS-SELECT-RESETS-SESSION', row.config.inSession, false);
      check('CS-SELECT-ONE-CHECKED', row.radios, [false, true]);
      check('CS-FOCUS-RETURNS-RADIO', await page.evaluate(() => document.activeElement?.type === 'radio' && document.activeElement.checked));
      await page.locator('#advList .court4514-session').click();
      check('CS-SECOND-IN-SESSION', /counts as 4 at Toshi Ranbo/.test((await first(page)).status));
      await page.evaluate(() => { document.getElementById('f_statusRank').value = '5'; window.__L5R_TEST__.recalcAll(); });
      check('CS-READOUT-FOLLOWS-STATUS', /Status 5 — counts as 6 at Toshi Ranbo/.test((await first(page)).status));
      check('CS-BLACKMAILED-FOLLOWS-ACTUAL', await blackmailed(), 5);
      await edit(page); await page.locator('#advConfigGrid .court4514-input').nth(1).fill('Toshi Ranbo (Okura)'); await confirm(page);
      row = await first(page);
      check('CS-RENAME-KEEPS-SELECTION', [row.config.selected, row.config.inSession], ['Toshi Ranbo (Okura)', true]);
      await edit(page); await page.locator('#advConfigGrid .court4514-add').click();
      await page.locator('#advConfigGrid .court4514-input').nth(2).fill('Otosan Uchi'); await confirm(page);
      row = await first(page);
      check('CS-ADD-KEEPS-SELECTION', [row.config.selected, row.config.inSession, row.cost], ['Toshi Ranbo (Okura)', true, 3 * PER_COURT.normal]);
      await edit(page); await page.locator('#advConfigGrid .court4514-remove').nth(1).click(); await confirm(page);
      row = await first(page);
      check('CS-REMOVE-SELECTED-RESETS', [row.config.courts, row.config.selected, row.config.inSession],
        [['Kyuden Bayushi', 'Otosan Uchi'], 'Kyuden Bayushi', false]);
      check('CS-REMOVE-REPRICES', row.cost, 2 * PER_COURT.normal);
      check('CS-ONE-TOGGLE-ON-SHEET', await page.locator('.court4514-session-box').count(), 1);
    });

    await section('CS-DUPLICATE-ROW', async () => {
      await darling(page, ['Kyuden Bayushi']);
      await quickAdd(page, DARLING);
      check('CS-DUPLICATE-NOTE', /already have a Darling of the Court row/.test(await page.locator('#advConfigNote').textContent()));
      await cancel(page);
      const [primary, second] = await rows(page);
      check('CS-DUPLICATE-WARNS', second.warning && /first Darling of the Court row/.test(second.text));
      check('CS-DUPLICATE-PRICED-AS-ONE', second.cost, PER_COURT.normal);
      check('CS-DUPLICATE-NO-CONTROLS', second.toggles, 0);
      check('CS-PRIMARY-KEEPS-CONTROLS', primary.toggles, 1);
      check('CS-ONE-TOGGLE-WITH-DUPLICATE', await page.locator('.court4514-session-box').count(), 1);
      await page.locator('#advList .entry').nth(1).locator('.rm-btn').click();
      check('CS-DUPLICATE-DELETE-XP', await xp(page), PER_COURT.normal);
      // A CONFIGURED duplicate (e.g. a save made before courts were consolidated): the first
      // variant run showed an unconfigured duplicate cannot tell "no controls because duplicate"
      // from "no controls because unconfigured".
      const base = await collect(page);
      const two = [{name:DARLING, cost:'2', desc:'', config:{type:'courtList', revision:1, courts:['Kyuden Bayushi']}},
        {name:DARLING, cost:'4', desc:'', config:{type:'courtList', revision:1, courts:['Otosan Uchi', 'Shiro Mirumoto'], inSession:true}}];
      await page.evaluate(data => window.__L5R_TEST__.applyData(data), {...base, adv:two});
      const [a, b] = await rows(page);
      check('CS-CONFIGURED-DUPLICATE-WARNS', b.warning && /first Darling of the Court row/.test(b.text));
      check('CS-CONFIGURED-DUPLICATE-OWN-PRICE', [a.cost, b.cost], [PER_COURT.normal, 2 * PER_COURT.normal]);
      check('CS-CONFIGURED-DUPLICATE-NO-CONTROLS', [a.toggles, b.toggles], [1, 0]);
      check('CS-CONFIGURED-DUPLICATE-NO-READOUT', b.status, '');
      check('CS-CONFIGURED-DUPLICATE-ONE-TOGGLE', await page.locator('.court4514-session-box').count(), 1);
      check('CS-CONFIGURED-DUPLICATE-PRESERVED', (await collect(page)).adv.map(e => e.config), two.map(e => e.config));
      await page.locator('#advList .entry').nth(0).locator('.rm-btn').click();
      const promoted = await first(page);
      check('CS-DUPLICATE-PROMOTED', [promoted.warning, promoted.toggles, /counts as/.test(promoted.status)], [false, 1, true]);
    });

    await section('CS-RENAME', async () => {
      await darling(page, ['Kyuden Bayushi']);
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Unrelated custom entry'; window.__L5R_TEST__.recalcAll(); });
      check('CS-RENAMED-ROW-CLEAN', (await first(page)).hasRow, false);
      check('CS-RENAMED-CONFIG-CLEAN', (await first(page)).config, null);
      // A base Phase 4.5 entry, not a 4.5.13 one, so this harness survives 4.5.13's removal.
      await reset(page); await quickAdd(page, 'Elemental Blessing');
      await page.locator('#advConfigGrid .affinity-pick-item input[type=checkbox]').first().check(); await confirm(page);
      check('CS-FOREIGN-SETUP', (await first(page)).config?.type, 'ringPick');
      await page.evaluate(n => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = n; window.__L5R_TEST__.recalcAll(); }, DARLING);
      const renamed = await first(page);
      check('CS-FOREIGN-RENAME-CLEARS', renamed.config, null);
      check('CS-FOREIGN-RENAME-PRICED', [renamed.cost, renamed.warning], [PER_COURT.normal, true]);
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Servant'; window.__L5R_TEST__.recalcAll(); });
      check('CS-DARLING-TO-SERVANT', /Reference only/.test((await first(page)).text));
    });

    await section('CS-PERSISTENCE', async () => {
      await darling(page, ['Kyuden Bayushi', 'Toshi Ranbo’s Okura district']);
      await page.locator('#advList .court4514-court').nth(1).click();
      await page.locator('#advList .court4514-session').click();
      await quickAdd(page, 'Servant');
      const saved = await collect(page);
      check('CS-SAVE-CONFIG', saved.adv[0].config, {type:'courtList', revision:1, courts:['Kyuden Bayushi', 'Toshi Ranbo’s Okura district'],
        selected:'Toshi Ranbo’s Okura district', inSession:true, value:'Kyuden Bayushi, Toshi Ranbo’s Okura district'});
      check('CS-SERVANT-SAVES-NO-CONFIG', Object.hasOwn(saved.adv[1], 'config'), false);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(button => button.click());
      const stream = await (await downloadPromise).createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const bytes = Buffer.concat(chunks); const exported = JSON.parse(bytes.toString('utf8'));
      check('CS-EXPORT', exported.adv, saved.adv);
      check('CS-SCHEMA-COMPATIBLE', exported.schemaVersion, 3);
      await reset(page);
      await page.locator('#fileImport').setInputFiles({name:'court.l5r.json', mimeType:'application/json', buffer:bytes});
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 2);
      check('CS-IMPORT', (await collect(page)).adv, saved.adv);
      check('CS-IMPORT-READOUT', /counts as 2 at Toshi Ranbo’s Okura district/.test((await first(page)).status));
      await page.locator('#btnSave').evaluate(button => button.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const savedId = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(savedId);
      await page.locator('#btnLoad').evaluate(button => button.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 2);
      check('CS-LOCAL-SAVE-RELOAD', (await collect(page)).adv, saved.adv);
      for (const version of [1, 2, 3]) {
        await page.evaluate(old => window.__L5R_TEST__.applyData(old),
          {...saved, schemaVersion:version, adv:[{name:DARLING, cost:'2', desc:'legacy record'}]});
        const legacy = await first(page);
        check('CS-OLD-SAVE-' + version, [legacy.cost, legacy.warning, legacy.config], [PER_COURT.normal, true, null]);
      }
    });

    await section('CS-IMPORT-SHAPES', async () => {
      const base = await collect(page);
      const load = config => page.evaluate(data => window.__L5R_TEST__.applyData(data), {...base, adv:[{name:DARLING, cost:'7', desc:'', config}]});
      const minimal = {type:'courtList', revision:1, courts:['Kyuden Bayushi', 'Otosan Uchi']};
      await load(minimal);
      let row = await first(page);
      check('CS-MINIMAL-VALID', [row.warning, row.cost, row.radios], [false, 2 * PER_COURT.normal, [true, false]]);
      check('CS-MINIMAL-NOT-IN-SESSION', /as normal/.test(row.status));
      check('CS-MINIMAL-PRESERVED', (await collect(page)).adv[0].config, minimal);
      for (const [id, config] of [
        ['FUTURE-REVISION', {type:'courtList', revision:2, courts:['A']}],
        ['UNKNOWN-FIELD', {type:'courtList', revision:1, courts:['A'], futureField:'keep'}],
        ['DUPLICATE-COURTS', {type:'courtList', revision:1, courts:['A', 'a']}],
        ['EMPTY-COURTS', {type:'courtList', revision:1, courts:[]}],
        ['NON-STRING', {type:'courtList', revision:1, courts:[5]}],
        ['SELECTED-MISSING', {type:'courtList', revision:1, courts:['A'], selected:'B'}],
        ['BAD-SESSION', {type:'courtList', revision:1, courts:['A'], inSession:'yes'}],
        ['OTHER-TYPE', {type:'futurePick', revision:1, courts:['A']}]]) {
        await load(config);
        row = await first(page);
        check('CS-INVALID-PRESERVED-' + id, (await collect(page)).adv[0].config, config);
        check('CS-INVALID-WARN-' + id, row.warning && /Saved setting kept/.test(row.text));
        check('CS-INVALID-COST-KEPT-' + id, row.cost, 7);
        check('CS-INVALID-NO-CONTROLS-' + id, row.toggles, 0);
      }
      await page.evaluate(data => window.__L5R_TEST__.applyData(data),
        {...base, adv:[], disadv:[{name:DARLING, cost:'2', desc:'', config:minimal}]});
      check('CS-WRONG-SIDE', /belongs in Advantages/.test((await first(page, 'disadvList')).text));
      check('CS-WRONG-SIDE-NO-CONTROLS', (await first(page, 'disadvList')).toggles, 0);
    });

    await section('CS-SERVANT', async () => {
      await reset(page, {status:'3'}); const initial = await xp(page);
      await quickAdd(page, 'Servant');
      check('CS-SERVANT-NO-MODAL', await modalOpen(page), false);
      let row = await first(page);
      check('CS-SERVANT-LIBRARY-PRICE', row.cost, 5);
      check('CS-SERVANT-TOTAL', await xp(page), initial + 5);
      check('CS-SERVANT-REFERENCE-BADGE', /Reference only/.test(row.text) && !row.warning);
      check('CS-SERVANT-NO-CONFIG', row.config, null);
      await page.locator('#advList .servant4514-info').click();
      check('CS-SERVANT-INFO-OPEN', await page.locator('#stanceInfoOverlay').isVisible());
      const reference = await page.locator('#stanceInfoBody').textContent();
      for (const [type, ability, discount] of SERVANT_SAMPLES) {
        check('CS-SERVANT-SAMPLE-' + type.replace(/\s+/g, '-'), reference.includes(type + ' — ' + ability + ' — ' + discount));
      }
      check('CS-SERVANT-TRAITS-SKILL', /Traits of 2/.test(reference) && /one Skill at Rank 3/.test(reference));
      check('CS-SERVANT-UPGRADE-COST', /each extra Skill Rank or Emphasis costs 3 more points/.test(reference));
      check('CS-SERVANT-MAX-RULE', /twice your Status Rank/.test(reference) && /Status 3 allows up to 6/.test(reference));
      check('CS-SERVANT-NOT-EXHAUSTIVE', /not a complete list/.test(reference));
      check('CS-SERVANT-MANUAL', /Nothing here changes your XP, Traits or Skills/.test(reference));
      await page.locator('#stanceInfoClose').click();
      await page.locator('#advList .entry .en-cost').fill('3');
      await page.evaluate(() => { for (let i = 0; i < 4; i++) window.__L5R_TEST__.recalcAll(); });
      check('CS-SERVANT-MANUAL-COST-KEPT', (await first(page)).cost, 3);
      const before = await collect(page);
      await quickAdd(page, 'Servant');
      check('CS-SERVANT-REPEATABLE', (await rows(page)).map(r => r.cost), [3, 5]);
      check('CS-SERVANT-NO-SKILL-CHANGE', (await collect(page)).skills, before.skills);
      const base = await collect(page);
      const future = {type:'servantPick', revision:1, servantType:'Groom'};
      await page.evaluate(data => window.__L5R_TEST__.applyData(data), {...base, adv:[{name:'Servant', cost:'5', desc:'', config:future}]});
      check('CS-SERVANT-FUTURE-PRESERVED', (await collect(page)).adv[0].config, future);
      check('CS-SERVANT-FUTURE-WARN', (await first(page)).warning && /Saved servant record kept/.test((await first(page)).text));
      await page.evaluate(data => window.__L5R_TEST__.applyData(data), {...base, adv:[], disadv:[{name:'Servant', cost:'5', desc:''}]});
      check('CS-SERVANT-WRONG-SIDE', /belongs in Advantages/.test((await first(page, 'disadvList')).text));
      await page.evaluate(data => window.__L5R_TEST__.applyData(data), {...base, adv:[{name:'Servant', cost:'5', desc:''}]});
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Retainer'; window.__L5R_TEST__.recalcAll(); });
      check('CS-SERVANT-RENAMED-CLEAN', (await first(page)).hasRow, false);
    });

    await section('CS-INFO', async () => {
      await darling(page, ['Kyuden Bayushi'], {school:'Doji Courtier'});
      await page.locator('#advList .court4514-info').click();
      const reference = await page.locator('#stanceInfoBody').textContent();
      check('CS-INFO-SOURCE', /Core p\.148/.test(reference));
      check('CS-INFO-EXAMPLES', reference.includes('Kyuden Bayushi') && reference.includes('Okura district') && /not a complete list/.test(reference));
      check('CS-INFO-ONCE-PER-COURT', /only once for any particular court/.test(reference));
      check('CS-INFO-COURTIER-APPLIES', reference.includes('applies — Doji Courtier'));
      await page.locator('#stanceInfoClose').click();
      await edit(page);
      const original = await collect(page);
      await page.locator('#advConfigGrid .court4514-info').click();
      check('CS-INFO-NESTED', await page.locator('#stanceInfoOverlay').isVisible());
      await page.locator('#stanceInfoClose').click();
      check('CS-INFO-RETURNS-TO-EDITOR', await modalOpen(page));
      check('CS-INFO-NO-CHANGE', await collect(page), original);
      await cancel(page);
      await page.locator('#advList .entry .rm-btn').click();
      check('CS-DELETE-NO-OWNED-UI', await page.locator('#advList .court4514-row').count(), 0);
      check('CS-DELETE-NO-SAVE-RESIDUE', (await collect(page)).adv, []);
    });

    await section('CS-ISOLATION', async () => {
      await reset(page, {status:'2'});
      const before = await collect(page);
      const probe = () => page.evaluate(() => {
        const T = window.__L5R_TEST__;
        return Object.values(T.ROLL_KINDS).map(kind => T.getPreRollModifiers({kind, skillName:'Courtier', traitName:'Awareness'}));
      });
      const pools = await probe();
      await quickAdd(page, DARLING); await fillCourts(page, ['Kyuden Bayushi', 'Otosan Uchi']); await confirm(page);
      await page.locator('#advList .court4514-session').click();
      await quickAdd(page, 'Servant');
      const after = await collect(page);
      check('CS-XP-SUM', Number(after.fields.f_xpSpent) - Number(before.fields.f_xpSpent), 2 * PER_COURT.normal + 5);
      for (const key of ['skills','equip','weapons','disadv','tech','traits','traitsFree','rings','voidCurrent','spellUsed','spellBonusUsed','spellBonusUsedVisual']) {
        check('CS-STATE-EXISTS-' + key, Object.hasOwn(before, key));
        check('CS-UNCHANGED-' + key, after[key], before[key]);
      }
      const fieldDiff = Object.keys(before.fields).filter(k => before.fields[k] !== after.fields[k]);
      check('CS-ONLY-XP-FIELDS', fieldDiff.filter(k => !['f_xpSpent','f_xpRemain','f_xpRemaining'].includes(k)), []);
      check('CS-NO-DICE-MODS', await probe(), pools);
      await page.evaluate(() => { for (let i = 0; i < 8; i++) window.__L5R_TEST__.recalcAll(); });
      check('CS-RECALC-IDEMPOTENT', await collect(page), after);
    });

    await section('CS-TEXT-SAFETY', async () => {
      const malicious = '<img src=x onerror="window.CS_INJECTED=1"> & "Q"';
      const row = await darling(page, [malicious]);
      check('CS-TEXT-AS-TEXT', row.config.courts[0], malicious);
      check('CS-NO-INJECTION', await page.evaluate(() => !window.CS_INJECTED && !document.querySelector('#advList .adv-config-row img')));
      check('CS-TEXT-VISIBLE', row.text.includes(malicious));
      await edit(page);
      check('CS-EDIT-TEXT-ROUNDTRIP', await page.locator('#advConfigGrid .court4514-input').first().inputValue(), malicious);
      await cancel(page);
    });

    await section('CS-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:900});
        await reset(page, {status:'4'}); await quickAdd(page, DARLING);
        await page.locator('#advConfigGrid .court4514-add').click();
        const geometry = await page.evaluate(() => {
          const grid = document.getElementById('advConfigGrid'), box = grid.getBoundingClientRect();
          const elements = [...grid.querySelectorAll('input,label,button')];
          return {fits:elements.every(el => { const r = el.getBoundingClientRect(); return r.left >= box.left - 1 && r.right <= box.right + 1; }),
            inputsReadable:[...grid.querySelectorAll('input')].every(el => parseFloat(getComputedStyle(el).fontSize) >= 16),
            labelsReadable:[...grid.querySelectorAll('label')].every(el => parseFloat(getComputedStyle(el).fontSize) >= 12),
            labelled:[...grid.querySelectorAll('input')].every(el => el.labels.length > 0),
            removeNamed:[...grid.querySelectorAll('.court4514-remove')].every(el => /Remove court \d/.test(el.getAttribute('aria-label')))};
        });
        check('CS-GEOMETRY-' + width, geometry, {fits:true, inputsReadable:true, labelsReadable:true, labelled:true, removeNamed:true});
        await fillCourts(page, ['AnUnbrokenCourtName'.repeat(12), 'Toshi Ranbo’s Okura district']); await confirm(page);
        await page.locator('#advList .court4514-session').click();
        await quickAdd(page, 'Servant');
        await page.evaluate(() => document.querySelector('#advList').scrollIntoView());
        const fit = await page.evaluate(() => [...document.querySelectorAll('#advList .adv-config-row')].map(row => {
          const box = row.getBoundingClientRect();
          return row.scrollWidth <= row.clientWidth + 1 &&
            [...row.querySelectorAll('*')].every(el => { const r = el.getBoundingClientRect(); return r.width === 0 || r.right <= box.right + 1; });
        }));
        check('CS-LONG-ROWS-FIT-' + width, fit, [true, true]);
        const readable = await page.evaluate(() => {
          const controls = [...document.querySelectorAll('#advList .court4514-court, #advList .court4514-session, #advList .court4514-status')];
          return controls.length === 4 && controls.every(el => parseFloat(getComputedStyle(el).fontSize) >= 12 && getComputedStyle(el).textTransform === 'none');
        });
        check('CS-ROW-CONTROLS-READABLE-' + width, readable);
        const target = await page.evaluate(() => [...document.querySelectorAll('#advList .court4514-court, #advList .court4514-session')]
          .every(el => el.getBoundingClientRect().height >= 32));
        check('CS-TOUCH-TARGET-' + width, target);
      }
    });
    check('CS-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('CS-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('CS4514_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
