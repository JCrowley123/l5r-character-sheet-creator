/* Real-browser acceptance tests for Paragon (A09, Feature 4.5.18).
 * Oracles from Core p.152 as recorded in SOURCE-CORE-PREPARATION.md, never from P4518:
 * 7 XP (6 Lion); seven tenets in printed order; reminder only, no dice/Void/Honor automation.
 * node paragon-harness.js <sheet.html>
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
const PARAGON = 'Paragon';
const PRICE = {normal:7, lion:6};
const TENETS = [
  ['Compassion', /Void Point improves a roll .*lower in the Celestial Order.*\+2k2 instead of \+1k1/],
  ['Courage', /\+1k1 on rolls to resist Intimidation or overcome Fear/],
  ['Courtesy', /\+2k0 on Etiquette rolls to avoid embarrassment or a breach of honor/],
  ['Duty', /Void Point can negate every TN penalty, including Wound penalties, on one Skill or Spell Casting roll/],
  ['Honesty', /\+1k1 on Sincerity \(Honesty\) rolls/],
  ['Honor', /twice your Honor Rank .*resisting Temptation or Intimidation/],
  ['Sincerity', /\+2k0 on Contested Rolls using Sincerity/],
];

async function reset(page, clan = '') {
  await page.evaluate(clan => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    document.getElementById('f_clan').value = clan; T.recalcAll();
  }, clan);
}
async function add(page) {
  await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Paragon'; s.dispatchEvent(new Event('change', {bubbles:true})); });
  await page.waitForSelector('#advConfigGrid .p4518-option', {state:'visible'});
}
// Exact value match: several benefit texts mention other tenets by name (Courtesy's says "honor",
// Honesty's says "Sincerity (Honesty)"), so a text match would click the wrong option.
const pick = (page, tenet) => page.locator('#advConfigGrid input[name="p4518Tenet"][value="' + tenet + '"]').check();
const confirm = page => page.locator('#advConfigConfirm').click();
const modalOpen = page => page.locator('#advConfigModalOverlay').isVisible();
async function paragon(page, tenet, clan = '') { await reset(page, clan); await add(page); await pick(page, tenet); await confirm(page); return row(page); }
const row = (page, list = 'advList') => page.evaluate(list => {
  const d = document.querySelector('#' + list + ' .entry');
  return d ? {cost:Number(d.querySelector('.en-cost').value), config:JSON.parse(d.dataset.advConfig || 'null'),
    badge:d.querySelector('.p4518-badge')?.textContent || '', reminder:d.querySelector('.p4518-reminder')?.textContent || '',
    text:d.querySelector('.adv-config-row')?.textContent || '', hasRow:!!d.querySelector('.adv-config-row'),
    warning:!!d.querySelector('.adv-config-warn')} : null;
}, list);
const load = (page, adv, disadv = []) => page.evaluate(({adv, disadv}) => {
  const T = window.__L5R_TEST__; T.applyData(Object.assign(T.collectData(), {adv, disadv})); T.recalcAll();
}, {adv, disadv});
const collect = page => page.evaluate(() => window.__L5R_TEST__.collectData());

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

    await section('P-START', async () => {
      check('P-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_PARAGON_ENABLED));
      check('P-SCHEMA', await page.evaluate(n => window.__L5R_TEST__.advConfigSchemaFor(n)?.type, PARAGON), 'paragonTenet');
      check('P-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
    });

    await section('P-PICKER', async () => {
      await reset(page); const initial = await page.locator('#f_xpSpent').inputValue().then(Number);
      await add(page);
      const options = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid .p4518-option')].map(l => ({
        name:l.querySelector('b').textContent, text:l.textContent, checked:l.querySelector('input').checked, labelled:l.querySelector('input').labels.length === 1})));
      check('P-SEVEN-IN-PRINTED-ORDER', options.map(o => o.name), TENETS.map(t => t[0]));
      TENETS.forEach(([name, benefit], i) => check('P-OPTION-BENEFIT-' + name, benefit.test(options[i].text)));
      check('P-NONE-PRESELECTED', options.every(o => !o.checked));
      check('P-OPTIONS-LABELLED', options.every(o => o.labelled));
      check('P-NOTE-REMINDER-ONLY', /Reminder only/.test(await page.locator('#advConfigNote').textContent()) && /add 1 more yourself/.test(await page.locator('#advConfigNote').textContent()));
      const blank = await row(page);
      check('P-BLANK', [blank.cost, blank.warning], [PRICE.normal, true]);
      await confirm(page);
      check('P-REQUIRES-CHOICE', [await modalOpen(page), await page.locator('#advConfigGrid [role=alert]').isVisible(), (await row(page)).config], [true, true, null]);
      await pick(page, 'Courage'); await confirm(page);
      const r = await row(page);
      check('P-CONFIG', r.config, {type:'paragonTenet', revision:1, tenet:'Courage', value:'Courage'});
      check('P-PRICE-TOTAL', [r.cost, (await page.locator('#f_xpSpent').inputValue().then(Number)) - initial], [PRICE.normal, PRICE.normal]);
      for (const [clan, price] of [['Lion', PRICE.lion], ['Crab', PRICE.normal], ['Crane', PRICE.normal]]) {
        await page.evaluate(clan => { document.getElementById('f_clan').value = clan; window.__L5R_TEST__.recalcAll(); }, clan);
        check('P-PRICE-' + clan.toUpperCase(), (await row(page)).cost, price);
      }
    });

    await section('P-EACH-TENET', async () => {
      for (const [name, benefit] of TENETS) {
        const r = await paragon(page, name);
        check('P-BADGE-' + name, r.badge, name);
        check('P-REMINDER-' + name, benefit.test(r.reminder) && new RegExp('\\+1 Honor whenever you gain Honor for showing ' + name).test(r.reminder));
      }
    });

    await section('P-EDIT', async () => {
      await paragon(page, 'Duty');
      await page.locator('#advList .adv-config-btn').click();
      check('P-EDIT-SHOWS-CURRENT', await page.evaluate(() => document.querySelector('#advConfigGrid input:checked')?.value), 'Duty');
      await pick(page, 'Honesty'); await confirm(page);
      const r = await row(page);
      check('P-CHANGE-REPLACES', [r.config.tenet, r.badge, /TN penalty/.test(r.reminder), /Sincerity \(Honesty\)/.test(r.reminder)], ['Honesty', 'Honesty', false, true]);
      await page.locator('#advList .adv-config-btn').click(); await pick(page, 'Honor'); await page.locator('#advConfigX').click();
      check('P-CANCEL-KEEPS', (await row(page)).config.tenet, 'Honesty');
    });

    await section('P-NO-AUTOMATION', async () => {
      const contexts = [['SKILL', {skillName:'Etiquette', traitName:'Awareness'}], ['SKILL', {skillName:'Sincerity', traitName:'Awareness', emphasis:'Honesty'}],
        ['TRAIT', {traitName:'Willpower'}], ['RING', {ringName:'Void'}], ['ATTACK', {skillName:'Kenjutsu', traitName:'Agility'}],
        ['SPELL', {spellName:'Sense', element:'Air'}], ['MANUAL', {notation:'5k3'}], ['INITIATIVE', {}]];
      const probe = () => page.evaluate(contexts => { const T = window.__L5R_TEST__;
        return contexts.map(([k, c]) => T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[k], c))); }, contexts);
      await reset(page);
      const bare = await probe(), before = await collect(page);
      for (const [name] of TENETS) {
        await paragon(page, name);
        check('P-NO-DICE-' + name, await probe(), bare);
        const after = await collect(page);
        check('P-ONLY-XP-' + name, Object.keys(before.fields).filter(k => before.fields[k] !== after.fields[k] && !['f_xpSpent','f_xpRemain','f_xpRemaining'].includes(k)), []);
        check('P-NO-VOID-' + name, after.voidCurrent, before.voidCurrent);
      }
      check('P-NO-OPTIONS-IN-VOID-LIST', await page.evaluate(() => typeof window.__L5R_TEST__.P4518.voidOptions), 'undefined');
    });

    await section('P-PERSISTENCE', async () => {
      await paragon(page, 'Courtesy');
      const saved = await collect(page);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(button => button.click());
      const stream = await (await downloadPromise).createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const bytes = Buffer.concat(chunks);
      await reset(page);
      await page.locator('#fileImport').setInputFiles({name:'p.l5r.json', mimeType:'application/json', buffer:bytes});
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('P-IMPORT', [(await collect(page)).adv, (await row(page)).badge], [saved.adv, 'Courtesy']);
      await page.locator('#btnSave').evaluate(button => button.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const id = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(id);
      await page.locator('#btnLoad').evaluate(button => button.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('P-LOCAL-RELOAD', (await collect(page)).adv, saved.adv);
      await load(page, [{name:PARAGON, cost:'7', desc:'legacy'}]);
      check('P-LEGACY', [(await row(page)).cost, (await row(page)).warning, (await row(page)).config], [PRICE.normal, true, null]);
      await page.evaluate(() => { document.getElementById('f_clan').value = 'Lion'; });
      await load(page, [{name:PARAGON, cost:'7', desc:'legacy'}]);
      check('P-LEGACY-LION', [(await row(page)).cost, (await row(page)).warning], [PRICE.lion, true]);
      await page.evaluate(() => { document.getElementById('f_clan').value = ''; window.__L5R_TEST__.recalcAll(); });
      await load(page, [{name:PARAGON, cost:'7', desc:'', config:{type:'paragonTenet', revision:1, tenet:'Sincerity'}}]);
      check('P-MINIMAL-VALID', [(await row(page)).warning, (await row(page)).badge], [false, 'Sincerity']);
      for (const [id, config] of [['UNKNOWN-TENET', {type:'paragonTenet', revision:1, tenet:'Loyalty'}], ['CASE', {type:'paragonTenet', revision:1, tenet:'courage'}],
        ['FUTURE', {type:'paragonTenet', revision:2, tenet:'Courage'}], ['EXTRA', {type:'paragonTenet', revision:1, tenet:'Courage', bonus:1}],
        ['DISADV-TYPE', {type:'tenetPick', tenet:'Courage'}]]) {
        await load(page, [{name:PARAGON, cost:'9', desc:'', config}]);
        const r = await row(page);
        check('P-INVALID-' + id, [(await collect(page)).adv[0].config, r.warning && /Saved setting kept/.test(r.text), r.cost, r.reminder], [config, true, 9, '']);
      }
      await load(page, [], [{name:PARAGON, cost:'7', desc:'', config:{type:'paragonTenet', revision:1, tenet:'Duty'}}]);
      check('P-WRONG-SIDE', /belongs in Advantages/.test((await row(page, 'disadvList')).text));
    });

    await section('P-RENAME-INFO', async () => {
      await paragon(page, 'Courage');
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Unrelated'; window.__L5R_TEST__.recalcAll(); });
      check('P-RENAMED-CLEAN', [(await row(page)).hasRow, (await row(page)).config], [false, null]);
      await reset(page);
      await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Elemental Blessing'; s.dispatchEvent(new Event('change', {bubbles:true})); });
      await page.locator('#advConfigGrid .affinity-pick-item input[type=checkbox]').first().check(); await confirm(page);
      await page.evaluate(n => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = n; window.__L5R_TEST__.recalcAll(); }, PARAGON);
      check('P-FOREIGN-RENAME-CLEARS', [(await row(page)).config, (await row(page)).warning], [null, true]);
      // Dark Paragon (Shourido) is a different catalogue row; the name match must be exact.
      await reset(page);
      await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Dark Paragon'; s.dispatchEvent(new Event('change', {bubbles:true})); });
      check('P-DARK-PARAGON-NOT-CLAIMED', await page.evaluate(() => [document.querySelectorAll('#advList .entry').length,
        !!document.querySelector('#advList .p4518-row'), !!document.querySelector('#advConfigGrid .p4518-option'),
        window.__L5R_TEST__.advConfigSchemaFor('Dark Paragon')?.p4518 === true]), [1, false, false, false]);
      await page.evaluate(() => window.__L5R_TEST__.closeAdvConfigModal());
      await paragon(page, 'Honor');
      await page.locator('#advList .p4518-info').click();
      const info = await page.locator('#stanceInfoBody').textContent();
      check('P-INFO', /Core p\.152/.test(await page.locator('#stanceInfoRing').textContent()) && /Your tenet: Honor/.test(info) &&
        TENETS.every(([n]) => info.includes(n + ':')) && /does not change dice, spend Void or award Honor/.test(info) && /6 for a Lion/.test(info));
      await page.locator('#stanceInfoClose').click();
    });

    await section('P-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:700});
        await reset(page); await add(page);
        const g = await page.evaluate(() => {
          const grid = document.getElementById('advConfigGrid').getBoundingClientRect();
          const opts = [...document.querySelectorAll('#advConfigGrid .p4518-option')];
          return {fits:opts.every(o => { const r = o.getBoundingClientRect(); return r.left >= grid.left - 1 && r.right <= grid.right + 1 && o.scrollWidth <= o.clientWidth + 1; }),
            readable:opts.every(o => parseFloat(getComputedStyle(o).fontSize) >= 12 && getComputedStyle(o).textTransform === 'none' && o.getBoundingClientRect().height >= 32)};
        });
        await pick(page, 'Sincerity'); await confirm(page);
        const reachable = !(await modalOpen(page)) && (await row(page)).config?.tenet === 'Sincerity';
        await page.evaluate(() => document.querySelector('#advList').scrollIntoView());
        const rowFit = await page.evaluate(() => { const r = document.querySelector('#advList .adv-config-row'); return r.scrollWidth <= r.clientWidth + 1; });
        check('P-GEOMETRY-' + width, {...g, reachable, rowFit}, {fits:true, readable:true, reachable:true, rowFit:true});
      }
      await page.setViewportSize({width:375, height:812});
    });
    check('P-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('P-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('P4518_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
