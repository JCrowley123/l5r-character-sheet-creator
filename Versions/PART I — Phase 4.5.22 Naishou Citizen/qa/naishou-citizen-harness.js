/* Real-browser acceptance tests for Naishou Citizen (A08, Feature 4.5.22).
 * Oracles from Naishou Province p.7 and Core p.149 as recorded in SOURCE-OTHER-PREPARATION.md and
 * SOURCE-CORE-PREPARATION.md, never from NC4522: 3 XP; the Seven Fortunes' Blessing costs 1 less,
 * stacking with the Blessing's own Clan price, never below 1 XP; one Free Raise on Social rolls
 * with monks aligned to the current Fortune, shown as a reminder only. The Blessing's own prices
 * come from the Core pp.153-154 table, not from FB4521.
 * node naishou-citizen-harness.js <sheet.html>
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
const NAISHOU = 'Naishou Citizen';
const BLESSING = 'Seven Fortunes’ Blessing';
const PRICE = {naishou:3};
// Core pp.153-154: Fortune -> [normal XP, discounted Clans].
const TABLE = {Benten:[4, ['Crane']], Bishamon:[5, ['Crab', 'Lion']], Daikoku:[4, ['Mantis']], Ebisu:[4, ['Unicorn']],
  Fukurokujin:[4, ['Dragon', 'Phoenix']], Hotei:[4, []], Jurojin:[4, ['Scorpion']]};
const blessing = f => ({name:BLESSING, cost:'4', desc:'', config:Object.assign({type:'fortuneBlessing', revision:1, fortune:f, value:f}, f === 'Fukurokujin' ? {lore:'Lore: Theology'} : {})});
const naishou = (cost = '3') => ({name:NAISHOU, cost, desc:''});

async function setup(page, {clan = '', adv = [], disadv = []} = {}) {
  return page.evaluate(({clan, adv, disadv}) => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    document.getElementById('f_clan').value = clan; T.recalcAll();
    const before = Number(document.getElementById('f_xpSpent').value);
    T.applyData(Object.assign(T.collectData(), {adv, disadv})); T.recalcAll();
    return Number(document.getElementById('f_xpSpent').value) - before;
  }, {clan, adv, disadv});
}
const entries = (page, list = 'advList') => page.evaluate(list => [...document.querySelectorAll('#' + list + ' .entry')].map(d => ({
  name:d.querySelector('.en-name').value, cost:Number(d.querySelector('.en-cost').value), config:d.dataset.advConfig ? JSON.parse(d.dataset.advConfig) : null,
  text:d.querySelector('.adv-config-row')?.textContent || '', badge:d.querySelector('.nc4522-badge')?.textContent || '',
  warn:d.querySelector('.nc4522-warning')?.textContent || '', reminder:d.querySelector('.nc4522-reminder')?.textContent || '',
  note:d.querySelector('.nc4522-blessing-note')?.textContent || '', hasRow:!!d.querySelector('.adv-config-row')})), list);
const byName = async (page, name, list) => (await entries(page, list)).find(e => e.name === name);

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

    await section('NC-START', async () => {
      check('NC-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_NAISHOU_CITIZEN_ENABLED));
      check('NC-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('NC-NO-SCHEMA', await page.evaluate(n => window.__L5R_TEST__.advConfigSchemaFor(n), NAISHOU), null);
    });

    await section('NC-DISCOUNT', async () => {
      // Every Fortune, with and without its Clan price, with and without Naishou Citizen.
      for (const [f, [base, clans]] of Object.entries(TABLE)) {
        const got = [], want = [];
        for (const clan of ['', ...clans]) {
          const own = base - (clans.includes(clan) ? 1 : 0);
          await setup(page, {clan, adv:[blessing(f)]});
          got.push((await byName(page, BLESSING)).cost); want.push(own);
          await setup(page, {clan, adv:[blessing(f), naishou()]});
          got.push((await byName(page, BLESSING)).cost); want.push(Math.max(1, own - 1));
        }
        check('NC-PRICE-' + f, got, want);
      }
      const total = await setup(page, {clan:'Crane', adv:[blessing('Benten'), naishou()]});
      check('NC-XP-TOTAL', total, (TABLE.Benten[0] - 1 - 1) + PRICE.naishou);
      check('NC-OWN-PRICE', (await byName(page, NAISHOU)).cost, PRICE.naishou);
      // Order does not matter, and a second Naishou row takes nothing more off.
      await setup(page, {adv:[naishou(), blessing('Hotei')]});
      check('NC-ORDER-INDEPENDENT', (await byName(page, BLESSING)).cost, 3);
      await setup(page, {adv:[blessing('Hotei'), naishou(), naishou()]});
      check('NC-ONCE-ONLY', (await byName(page, BLESSING)).cost, 3);
      // Removing Naishou Citizen restores the Blessing's own price on the next recalculation.
      await setup(page, {adv:[blessing('Bishamon'), naishou()]});
      await page.evaluate(n => { [...document.querySelectorAll('#advList .entry')].find(e => e.querySelector('.en-name').value === n).remove(); window.__L5R_TEST__.recalcAll(); }, NAISHOU);
      check('NC-REMOVED-RESTORES', (await byName(page, BLESSING)).cost, 5);
      // On the Disadvantage list it discounts nothing.
      await setup(page, {adv:[blessing('Hotei')], disadv:[naishou()]});
      check('NC-WRONG-SIDE', [(await byName(page, BLESSING)).cost, /belongs in Advantages/.test((await byName(page, NAISHOU, 'disadvList')).text)], [4, true]);
      // An unconfigured Blessing keeps its own cost; nothing is priced before a Fortune is chosen.
      await setup(page, {adv:[{name:BLESSING, cost:'4', desc:''}, naishou()]});
      check('NC-UNCONFIGURED-BLESSING', (await byName(page, BLESSING)).cost, 4);
    });

    await section('NC-ROWS', async () => {
      await setup(page, {clan:'Crane', adv:[blessing('Benten'), naishou()]});
      const n = await byName(page, NAISHOU), b = await byName(page, BLESSING);
      check('NC-ROW-NAMES-FORTUNE', [n.badge, /Benten.s Blessing costs 1 XP less \(2 XP\)/.test(n.reminder), /Free Raise on Social Skill rolls with monks aligned to Benten/.test(n.reminder)], ['Aligned with Benten', true, true]);
      check('NC-BLESSING-NOTE', /Naishou Citizen: −1 XP/.test(b.note));
      await setup(page, {adv:[blessing('Jurojin'), naishou()]});
      const j = await byName(page, NAISHOU);
      check('NC-ROW-FOLLOWS-FORTUNE', [j.badge, /Jurojin.s Blessing costs 1 XP less \(3 XP\)/.test(j.reminder), /monks aligned to Jurojin/.test(j.reminder)], ['Aligned with Jurojin', true, true]);
      // A configured Blessing row renamed to Naishou Citizen keeps none of the Blessing's settings.
      await setup(page, {adv:[blessing('Hotei')]});
      await page.evaluate(n => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = n; window.__L5R_TEST__.recalcAll(); }, NAISHOU);
      const into = (await entries(page))[0];
      check('NC-RENAMED-INTO', [into.config, await page.evaluate(() => !!document.querySelector('#advList .fb4521-row')), into.warn], [null, false, 'No Seven Fortunes’ Blessing yet']);
      await setup(page, {adv:[naishou()]});
      const alone = await byName(page, NAISHOU);
      check('NC-NO-BLESSING-YET', [alone.warn, /Add and configure a Seven Fortunes/.test(alone.reminder), alone.config], ['No Seven Fortunes’ Blessing yet', true, null]);
      await setup(page, {adv:[blessing('Hotei')]});
      check('NC-NO-NOTE-WITHOUT-NAISHOU', (await byName(page, BLESSING)).note, '');
      await setup(page, {adv:[naishou()]});
      await page.locator('#advList .nc4522-info').click();
      const info = await page.locator('#stanceInfoBody').textContent();
      check('NC-INFO', /Naishou Province p\.7/.test(await page.locator('#stanceInfoRing').textContent()) && /Cost 3 XP/.test(info) && /1 XP less/.test(info) && /Free Raise/.test(info) && /recorded for review/.test(info));
      await page.locator('#stanceInfoClose').click();
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Unrelated'; window.__L5R_TEST__.recalcAll(); });
      check('NC-RENAMED-CLEAN', (await entries(page))[0].hasRow, false);
    });

    await section('NC-MODAL', async () => {
      await setup(page, {clan:'Crane', adv:[blessing('Benten'), naishou()]});
      await page.locator('#advList .fb4521-row .adv-config-btn').first().click();
      await page.waitForSelector('#advConfigGrid .fb4521-option', {state:'visible'});
      const note = await page.locator('#advConfigNote').textContent();
      const prices = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid .fb4521-option')].map(l => l.textContent.match(/— (\d+) XP/)[1]).map(Number));
      check('NC-MODAL-NOTE', /Naishou Citizen/.test(note));
      check('NC-MODAL-PRICES', prices, [2, 4, 3, 3, 3, 3, 3]);
      await page.evaluate(() => window.__L5R_TEST__.closeAdvConfigModal());
    });

    await section('NC-NOTHING-ELSE', async () => {
      // No dice, no config written, no other Advantage repriced.
      const probe = () => page.evaluate(() => { const T = window.__L5R_TEST__;
        return ['SKILL', 'TRAIT', 'RING', 'ATTACK'].map(k => T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[k], {skillName:'Etiquette', traitName:'Awareness', ringName:'Air'})).length); });
      await setup(page, {adv:[blessing('Hotei')]}); const without = await probe();
      await setup(page, {adv:[blessing('Hotei'), naishou()]});
      check('NC-NO-DICE', await probe(), without);
      // Differential: every other Advantage prices the same with and without Naishou Citizen.
      const others = [{name:'Luck', cost:'3', desc:''}, {name:'Void Versatility', cost:'4', desc:''}, {name:'Paragon', cost:'7', desc:''}];
      await setup(page, {adv:others}); const plain = (await entries(page)).map(e => e.cost);
      await setup(page, {adv:others.concat([naishou()])}); const withN = (await entries(page)).filter(e => e.name !== NAISHOU).map(e => e.cost);
      check('NC-OTHERS-UNCHANGED', withN, plain);
      const saved = await page.evaluate(() => window.__L5R_TEST__.collectData());
      check('NC-SAVES-NO-CONFIG', 'config' in saved.adv.find(e => e.name === NAISHOU), false);
    });

    await section('NC-PERSISTENCE', async () => {
      await setup(page, {clan:'Lion', adv:[blessing('Bishamon'), naishou()]});
      const saved = await page.evaluate(() => window.__L5R_TEST__.collectData());
      await page.locator('#btnSave').evaluate(b => b.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const id = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(id);
      await page.locator('#btnLoad').evaluate(b => b.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 2);
      check('NC-LOCAL-RELOAD', [(await page.evaluate(() => window.__L5R_TEST__.collectData())).adv, (await byName(page, BLESSING)).cost], [saved.adv, 3]);
    });

    await section('NC-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:700});
        await setup(page, {clan:'Crane', adv:[blessing('Benten'), naishou()]});
        const fit = await page.evaluate(() => [...document.querySelectorAll('#advList .adv-config-row')].every(r => r.scrollWidth <= r.clientWidth + 1));
        const readable = await page.evaluate(() => [...document.querySelectorAll('.nc4522-reminder, .nc4522-blessing-note')].every(e => parseFloat(getComputedStyle(e).fontSize) >= 12));
        // The circled i is a real tap target, and the reminder sits on its own full-width line.
        const target = await page.evaluate(() => { const b = document.querySelector('#advList .nc4522-info').getBoundingClientRect();
          return b.width >= 28 && b.height >= 28 && Math.abs(b.width - b.height) < 1; });
        const ownLine = await page.evaluate(() => { const r = document.querySelector('#advList .nc4522-reminder').getBoundingClientRect(),
          i = document.querySelector('#advList .nc4522-info').getBoundingClientRect(); return r.top >= i.bottom - 1; });
        check('NC-GEOMETRY-' + width, {fit, readable, target, ownLine}, {fit:true, readable:true, target:true, ownLine:true});
      }
      await page.setViewportSize({width:375, height:812});
    });
    check('NC-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('NC-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('NC4522_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
