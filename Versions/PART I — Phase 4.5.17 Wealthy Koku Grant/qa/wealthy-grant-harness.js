/* Real-browser acceptance tests for Wealthy's koku grant (A16, Feature 4.5.17).
 * Oracles from Core pp.149/155 and the owner's ruling, never from W4517: 2 koku per Rank, granted
 * once; XP = Rank - 1 once for Crane/Unicorn/Imperial, minimum 1. Money checked as the exact
 * #f_koku value after every action, starting from a non-zero amount.
 * node wealthy-grant-harness.js <sheet.html>
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
const KOKU_PER_RANK = 2;
const START = 37;
const xpFor = (rank, eligible) => Math.max(1, rank - (eligible ? 1 : 0));

async function reset(page, {clan = '', koku = START} = {}) {
  await page.evaluate(({clan, koku}) => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    document.getElementById('f_clan').value = clan;
    document.getElementById('f_koku').value = String(koku);
    T.recalcAll();
  }, {clan, koku});
}
const koku = page => page.locator('#f_koku').inputValue();
const setKoku = (page, v) => page.evaluate(v => { document.getElementById('f_koku').value = String(v); window.__L5R_TEST__.recalcAll(); }, v);
const modalOpen = page => page.locator('#advConfigModalOverlay').isVisible();
async function add(page) {
  await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Wealthy'; s.dispatchEvent(new Event('change', {bubbles:true})); });
  await page.waitForSelector('#advConfigRankInput', {state:'visible'});
}
async function buy(page, rank, choice) {
  await add(page);
  await page.locator('#advConfigRankInput').fill(String(rank));
  if (choice) await page.locator(`#advConfigGrid input[name=wealth4517Grant][value=${choice}]`).check();
  await page.locator('#advConfigConfirm').click();
}
async function edit(page, rank, index = 0) {
  await page.locator('#advList .entry').nth(index).locator('.adv-config-btn').first().click();
  await page.waitForSelector('#advConfigRankInput', {state:'visible'});
  await page.locator('#advConfigRankInput').fill(String(rank));
}
const row = (page, index = 0, list = 'advList') => page.evaluate(({index, list}) => {
  const d = document.querySelectorAll('#' + list + ' .entry')[index];
  if (!d) return null;
  return {cost:Number(d.querySelector('.en-cost').value), config:JSON.parse(d.dataset.advConfig || 'null'),
    status:d.querySelector('.wealth4517-status')?.textContent || '', statusKind:(d.querySelector('.wealth4517-status')?.className.match(/wealth4517-(recorded|unrecorded|owed|excess|invalid)/) || [])[1] || null,
    buttons:[...d.querySelectorAll('.wealth4517-btn')].map(b => [b.textContent, b.disabled]),
    summary:d.querySelector('.adv-config-summary')?.textContent || ''};
}, {index, list});
const load = (page, adv, disadv = []) => page.evaluate(({adv, disadv}) => {
  const T = window.__L5R_TEST__; const base = T.collectData();
  T.applyData(Object.assign(base, {adv, disadv})); T.recalcAll();
}, {adv, disadv});
const collect = page => page.evaluate(() => window.__L5R_TEST__.collectData());
const click = (page, text, index = 0) => page.locator('#advList .entry').nth(index).locator('.wealth4517-btn', {hasText:text}).click();
const receipt = granted => ({revision:1, granted});

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

    await section('W-START', async () => {
      check('W-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_WEALTHY_GRANT_ENABLED));
      check('W-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('W-NOTE-DESCRIBES-GRANT', await page.evaluate(() => /adds 2 koku to your Koku, once/.test(window.__L5R_TEST__.R456.ENTRIES.Wealthy.note)));
    });

    await section('W-PRICE', async () => {
      for (const [clan, rank, eligible] of [['Crane', 1, true], ['Unicorn', 1, true], ['Imperial', 1, true], ['Crab', 1, false],
        ['Crane', 2, true], ['Crane', 5, true], ['Crab', 5, false], ['', 3, false]]) {
        await reset(page, {clan}); await buy(page, rank, 'already');
        const r = await row(page);
        check(`W-XP-${clan || 'NONE'}-${rank}`, r.cost, xpFor(rank, eligible));
        if (clan === 'Crane' && rank === 1) check('W-MINIMUM-NAMED', /minimum 1 XP/.test(r.summary));
        if (clan === 'Crane' && rank === 2) check('W-NO-MINIMUM-WHEN-NOT-NEEDED', /minimum/.test(r.summary), false);
      }
      await reset(page); const before = await page.locator('#f_xpSpent').inputValue().then(Number);
      await buy(page, 1, 'already'); await page.evaluate(() => { document.getElementById('f_clan').value = 'Crane'; window.__L5R_TEST__.recalcAll(); });
      check('W-MINIMUM-IN-TOTAL', (await page.locator('#f_xpSpent').inputValue().then(Number)) - before, 1);
    });

    await section('W-GRANT', async () => {
      await reset(page); await add(page);
      check('W-CHOICE-SHOWN', await page.locator('#advConfigGrid input[name=wealth4517Grant]').count(), 2);
      check('W-NEW-DEFAULTS-ADD', await page.locator('#advConfigGrid input[value=add]').isChecked());
      check('W-CHOICE-LABELLED', await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid input[name=wealth4517Grant]')].every(i => i.labels.length === 1)));
      await page.locator('#advConfigRankInput').fill('5'); await page.locator('#advConfigConfirm').click();
      check('W-NEW-ADDS-ONCE', await koku(page), String(START + 5 * KOKU_PER_RANK));
      check('W-RECEIPT', (await row(page)).config.wealth4517, receipt(10));
      check('W-RECORDED-LINE', [(await row(page)).statusKind, /10 koku from Wealthy recorded/.test((await row(page)).status), (await row(page)).buttons], ['recorded', true, []]);
      await page.evaluate(() => { for (let i = 0; i < 8; i++) window.__L5R_TEST__.recalcAll(); });
      check('W-RECALC-NO-MINT', await koku(page), String(START + 10));
      await reset(page); await buy(page, 4, 'already');
      check('W-ALREADY-NO-MONEY', [await koku(page), (await row(page)).config.wealth4517], [String(START), receipt(8)]);
      await reset(page); await add(page); await page.locator('#advConfigRankInput').fill('0'); await page.locator('#advConfigConfirm').click();
      check('W-BAD-RANK-NO-MONEY', [await modalOpen(page), await koku(page), (await row(page)).config], [true, String(START), null]);
      await page.locator('#advConfigX').click();
      check('W-CANCEL-NEW-NO-MONEY', [await koku(page), (await row(page)).config], [String(START), null]);
      await reset(page, {koku:''}); await buy(page, 2, 'add');
      check('W-EMPTY-KOKU-TREATED-AS-ZERO', await koku(page), '4');
    });

    await section('W-EDIT', async () => {
      await reset(page); await buy(page, 5, 'add');
      await edit(page, 7);
      check('W-EDIT-NO-CHOICE', await page.locator('#advConfigGrid input[name=wealth4517Grant]').count(), 0);
      await page.locator('#advConfigConfirm').click();
      check('W-RAISE-ADDS-DIFFERENCE', [await koku(page), (await row(page)).config.wealth4517], [String(START + 14), receipt(14)]);
      await edit(page, 3); await page.locator('#advConfigConfirm').click();
      let r = await row(page);
      check('W-LOWER-NO-CLAWBACK', [await koku(page), r.config.wealth4517, r.statusKind], [String(START + 14), receipt(14), 'excess']);
      check('W-LOWER-OFFERS-CHOICE', r.buttons, [['Return 8 koku', false], ['Keep', false]]);
      await page.evaluate(() => { for (let i = 0; i < 5; i++) window.__L5R_TEST__.recalcAll(); });
      check('W-EXCESS-STABLE', await koku(page), String(START + 14));
      await click(page, 'Return');
      check('W-RETURN', [await koku(page), (await row(page)).config.wealth4517, (await row(page)).statusKind], [String(START + 6), receipt(6), 'recorded']);
      await edit(page, 1); await page.locator('#advConfigConfirm').click();
      await click(page, 'Keep');
      check('W-KEEP', [await koku(page), (await row(page)).config.wealth4517], [String(START + 6), receipt(2)]);
      await edit(page, 4); await page.locator('#advConfigConfirm').click();
      check('W-RAISE-AFTER-KEEP', await koku(page), String(START + 12));
      await edit(page, 2); await page.locator('#advConfigConfirm').click();
      await setKoku(page, 1);
      r = await row(page);
      check('W-RETURN-DISABLED-WHEN-SHORT', [r.buttons, /less than 4 koku/.test(r.status)], [[['Return 4 koku', true], ['Keep', false]], true]);
      check('W-DISABLED-LOOKS-DISABLED', await page.evaluate(() => {
        const [ret, keep] = document.querySelectorAll('#advList .wealth4517-btn');
        return Number(getComputedStyle(ret).opacity) < 1 && Number(getComputedStyle(keep).opacity) === 1;
      }));
      await edit(page, 9); await page.locator('#advConfigX').click();
      check('W-CANCEL-EDIT-NO-MONEY', [await koku(page), (await row(page)).config.rank], ['1', 2]);
    });

    await section('W-LEGACY', async () => {
      await reset(page);
      await load(page, [{name:'Wealthy', cost:'5', desc:'', config:{type:'rankFreePick', rank:5, value:'Rank 5'}}]);
      let r = await row(page);
      check('W-LEGACY-NO-AUTO-MONEY', await koku(page), String(START));
      check('W-LEGACY-ASKS', [r.statusKind, r.buttons], ['unrecorded', [['Add 10 koku', false], ['Already added', false]]]);
      await page.evaluate(() => { for (let i = 0; i < 5; i++) window.__L5R_TEST__.recalcAll(); });
      check('W-LEGACY-RECALC-NO-MONEY', await koku(page), String(START));
      await click(page, 'Add 10');
      check('W-LEGACY-ADD', [await koku(page), (await row(page)).config.wealth4517], [String(START + 10), receipt(10)]);
      await load(page, [{name:'Wealthy', cost:'5', desc:'', config:{type:'rankFreePick', rank:5, value:'Rank 5'}}]);
      await setKoku(page, START);
      await click(page, 'Already');
      check('W-LEGACY-ALREADY', [await koku(page), (await row(page)).config.wealth4517], [String(START), receipt(10)]);
      await load(page, [{name:'Wealthy', cost:'5', desc:'', config:{type:'rankFreePick', rank:5, value:'Rank 5'}}]);
      await edit(page, 6);
      check('W-LEGACY-EDIT-NO-DEFAULT', await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid input[name=wealth4517Grant]')].map(i => i.checked)), [false, false]);
      await page.locator('#advConfigConfirm').click();
      check('W-LEGACY-EDIT-MUST-CHOOSE', [await modalOpen(page), await page.locator('#advConfigGrid .wealth4517-error').isVisible(), (await row(page)).config.rank], [true, true, 5]);
      await page.locator('#advConfigGrid input[value=already]').check(); await page.locator('#advConfigConfirm').click();
      check('W-LEGACY-EDIT-CHOSEN', [await koku(page), (await row(page)).config.wealth4517, (await row(page)).config.rank], [String(START), receipt(12), 6]);
      await load(page, [{name:'Wealthy', cost:'5', desc:'', config:{type:'rankFreePick', rank:5, value:'Rank 5', wealth4517:receipt(4)}}]);
      await setKoku(page, START);
      r = await row(page);
      check('W-OWED', [r.statusKind, r.buttons[0]], ['owed', ['Add 6 koku', false]]);
      await click(page, 'Add 6');
      check('W-OWED-ADD', [await koku(page), (await row(page)).config.wealth4517], [String(START + 6), receipt(10)]);
      await load(page, [{name:'Wealthy', cost:'1', desc:'pre-4.56 row'}]);
      check('W-UNCONFIGURED-NO-LINE', [(await row(page)).statusKind, await koku(page)], [null, String(START + 6)]);
    });

    await section('W-INVALID', async () => {
      for (const [id, bad] of [['REVISION', {revision:2, granted:10}], ['NEGATIVE', {revision:1, granted:-2}], ['FRACTION', {revision:1, granted:2.5}],
        ['EXTRA-KEY', {revision:1, granted:10, note:'x'}], ['STRING', '10']]) {
        await reset(page);
        const config = {type:'rankFreePick', rank:5, value:'Rank 5', wealth4517:bad};
        await load(page, [{name:'Wealthy', cost:'5', desc:'', config}]);
        const r = await row(page);
        check('W-INVALID-FLAGGED-' + id, [r.statusKind, r.buttons, /not understood/.test(r.status)], ['invalid', [], true]);
        check('W-INVALID-PRESERVED-' + id, (await collect(page)).adv[0].config, config);
        await edit(page, 7);
        check('W-INVALID-MODAL-SAYS-' + id, /not understood/.test(await page.locator('#advConfigGrid').textContent()));
        await page.locator('#advConfigConfirm').click();
        check('W-INVALID-EDIT-KEEPS-' + id, [await koku(page), (await collect(page)).adv[0].config.wealth4517, (await row(page)).config.rank], [String(START), bad, 7]);
      }
    });

    await section('W-PERSISTENCE', async () => {
      await reset(page); await buy(page, 3, 'add');
      const saved = await collect(page);
      check('W-SAVE-RECEIPT', saved.adv[0].config.wealth4517, receipt(6));
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(button => button.click());
      const stream = await (await downloadPromise).createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const bytes = Buffer.concat(chunks);
      await reset(page, {koku:0});
      await page.locator('#fileImport').setInputFiles({name:'w.l5r.json', mimeType:'application/json', buffer:bytes});
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('W-IMPORT-NO-MINT', [await koku(page), (await collect(page)).adv], [String(START + 6), saved.adv]);
      await page.locator('#btnSave').evaluate(button => button.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const id = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(id);
      await page.locator('#btnLoad').evaluate(button => button.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      await page.evaluate(() => { for (let i = 0; i < 5; i++) window.__L5R_TEST__.recalcAll(); });
      check('W-RELOAD-NO-MINT', [await koku(page), (await collect(page)).adv], [String(START + 6), saved.adv]);
      for (let i = 0; i < 3; i++) await load(page, saved.adv);
      check('W-REPEATED-APPLY-NO-MINT', await koku(page), String(START + 6));
    });

    await section('W-SIDE-DELETE-ISOLATION', async () => {
      await reset(page);
      await load(page, [], [{name:'Wealthy', cost:'5', desc:'', config:{type:'rankFreePick', rank:5, value:'Rank 5'}}]);
      check('W-WRONG-SIDE-NO-LINE', [(await row(page, 0, 'disadvList')).statusKind, await koku(page)], [null, String(START)]);
      await reset(page); await buy(page, 4, 'add');
      await page.locator('#advList .entry .rm-btn').click();
      check('W-DELETE-NO-CLAWBACK', await koku(page), String(START + 8));
      await reset(page);
      const before = await collect(page);
      const probe = () => page.evaluate(() => { const T = window.__L5R_TEST__;
        return Object.values(T.ROLL_KINDS).map(k => T.getPreRollModifiers(T.makeRollContext(k, {skillName:'Commerce', traitName:'Intelligence'}))); });
      const pools = await probe();
      await buy(page, 5, 'add');
      const after = await collect(page);
      check('W-ONLY-XP-AND-KOKU', Object.keys(before.fields).filter(k => before.fields[k] !== after.fields[k] && !['f_xpSpent','f_xpRemain','f_xpRemaining','f_koku'].includes(k)), []);
      for (const key of ['skills','equip','weapons','traits','rings','voidCurrent','disadv']) check('W-UNCHANGED-' + key, after[key], before[key]);
      check('W-NO-DICE', await probe(), pools);
    });

    await section('W-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:900});
        await reset(page, {koku:99999999});
        await load(page, [{name:'Wealthy', cost:'5', desc:'', config:{type:'rankFreePick', rank:1234567, value:'Rank 1234567', wealth4517:receipt(9999999)}}]);
        const g = await page.evaluate(() => {
          const r = document.querySelector('#advList .adv-config-row'), box = r.getBoundingClientRect();
          const buttons = [...r.querySelectorAll('.wealth4517-btn')];
          return {fits:r.scrollWidth <= r.clientWidth + 1 && [...r.querySelectorAll('*')].every(el => { const b = el.getBoundingClientRect(); return b.width === 0 || b.right <= box.right + 1; }),
            targets:buttons.length === 2 && buttons.every(b => b.getBoundingClientRect().height >= 32)};
        });
        await add(page);
        const m = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid .wealth4517-opt')].every(l =>
          parseFloat(getComputedStyle(l).fontSize) >= 12 && getComputedStyle(l).textTransform === 'none' && l.getBoundingClientRect().height >= 32));
        await page.locator('#advConfigX').click();
        check('W-GEOMETRY-' + width, {...g, modalReadable:m}, {fits:true, targets:true, modalReadable:true});
      }
      await page.setViewportSize({width:375, height:812});
    });
    check('W-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('W-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('W4517_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
