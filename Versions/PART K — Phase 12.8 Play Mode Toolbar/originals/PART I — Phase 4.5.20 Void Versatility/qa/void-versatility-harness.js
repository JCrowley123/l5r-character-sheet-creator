/* Real-browser acceptance tests for Void Versatility (A14, Feature 4.5.20).
 * Oracles from The Great Clans p.199 as recorded in SOURCE-OTHER-PREPARATION.md, never from VV4520:
 * 4 XP; one non-Void Ring; Shugenja with a Void Affinity only (and not with Uncentered); that
 * Ring's slots may pay for Void spells; the spell's dice and identity stay Void. Slot state is read
 * from the trunk's own hidden counters; the Ring-paid roll is compared with an ORDINARY Void cast by
 * the same character, so the roll oracle does not come from this release at all.
 * node void-versatility-harness.js <sheet.html>
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
const VV = 'Void Versatility';
const PRICE = 4;
const RINGS = ['Air', 'Earth', 'Fire', 'Water'];
const cfg = ring => ({type:'voidVersatilityRing', revision:1, ring, value:ring});

async function setup(page, {school = 'Isawa Shugenja', affinity = 'Void', adv = [], disadv = []} = {}) {
  await page.evaluate(({school, affinity, adv, disadv}) => {
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    T.saveSchoolsList(school ? [{name:school, frozen:false, frozenRank:null, floorRank:1, anchorInsightRank:0}] : []);
    const aff = document.getElementById('f_schoolAffinity'); if (aff) aff.value = affinity;
    T.recalcAll();
    T.applyData(Object.assign(T.collectData(), {adv, disadv})); T.recalcAll();
    document.getElementById('techList').innerHTML = '';
    for (const [name, el] of [['Void Probe', 'void'], ['Air Probe', 'air'], ['Sense', 'universal']]) {
      const e = T.makeEntry({name, spellElement:el, spellMastery:1}, true, 'XP'); document.getElementById('techList').appendChild(e);
    }
  }, {school, affinity, adv, disadv});
}
const state = page => page.evaluate(() => {
  const v = id => document.getElementById(id)?.value;
  return {air:v('spell_used_air'), earth:v('spell_used_earth'), fire:v('spell_used_fire'), water:v('spell_used_water'), void:v('spell_used_void'),
    bonus:v('spell_bonus_used_shared'), visual:['air', 'earth', 'fire', 'water', 'void'].map(k => v('spell_bonus_used_visual_' + k)).join(','),
    voidPoints:v('void_current')};
});
const setUsed = (page, key, n) => page.evaluate(({key, n}) => {
  if (key === 'bonus') document.getElementById('spell_bonus_used_shared').value = n;
  else document.getElementById('spell_used_' + key).value = n;
  window.__L5R_TEST__.recalcAll();
}, {key, n});
const ringMax = (page, key) => page.evaluate(k => parseInt(document.getElementById('ring_' + k).value, 10), key);

// Clicks a spell's own Cast button and reports what the sheet showed first.
async function cast(page, spell) {
  await page.evaluate(n => [...document.querySelectorAll('#techList .entry')].find(e => e.querySelector('.en-name').value === n)
    .querySelector('.spell-cast-btn').click(), spell);
  const seen = await Promise.race([
    page.waitForSelector('#appConfirmOverlay', {state:'visible', timeout:5000}).then(() => 'dialog'),
    page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:5000}).then(() => 'preview'),
    page.waitForSelector('#universalSpellPickModalOverlay', {state:'visible', timeout:5000}).then(() => 'universal'),
  ]).catch(() => 'nothing');
  if (seen !== 'dialog') return {seen};
  return {seen, msg:await page.locator('#appConfirmMsg').textContent(), ok:await page.locator('#appConfirmOk').textContent(),
    cancel:await page.locator('#appConfirmCancel').isVisible() ? await page.locator('#appConfirmCancel').textContent() : ''};
}
async function roll(page) {
  await page.waitForSelector('#rollPreviewGo', {state:'visible'});
  const preview = await page.locator('#rollPreviewBody').textContent();
  await page.locator('#rollPreviewGo').click();
  await page.waitForSelector('#rollDiceRow .roll-die');
  const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
    kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length, title:document.getElementById('rollModalTitle')?.textContent || ''}));
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const o = document.getElementById('rollModalOverlay'); if (o) o.style.display = 'none'; });
  return {...r, preview};
}
const row = (page, list = 'advList') => page.evaluate(list => {
  const d = document.querySelector('#' + list + ' .entry');
  return d ? {cost:Number(d.querySelector('.en-cost').value), config:JSON.parse(d.dataset.advConfig || 'null'),
    badge:d.querySelector('.vv4520-badge')?.textContent || '', inactive:!!d.querySelector('.vv4520-inactive'),
    reminder:d.querySelector('.vv4520-reminder')?.textContent || '', text:d.querySelector('.adv-config-row')?.textContent || '',
    hasRow:!!d.querySelector('.adv-config-row'), warning:!!d.querySelector('.adv-config-warn')} : null;
}, list);
const collect = page => page.evaluate(() => window.__L5R_TEST__.collectData());
const option = page => page.evaluate(n => { const o = [...document.getElementById('advQuickAdd').options].find(x => x.value === n);
  return o ? {disabled:o.disabled, text:o.textContent} : null; }, VV);

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

    await section('VV-START', async () => {
      check('VV-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_VOID_VERSATILITY_ENABLED));
      check('VV-SCHEMA', await page.evaluate(n => window.__L5R_TEST__.advConfigSchemaFor(n)?.type, VV), 'voidVersatilityRing');
      check('VV-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
    });

    await section('VV-ELIGIBILITY', async () => {
      // Source: Shugenja with an Affinity for Void. The sheet's only such School is Isawa with Void chosen.
      for (const [id, school, affinity, disabled] of [['NO-SCHOOL', '', '', true], ['BUSHI', 'Hida Bushi', '', true],
        ['EARTH-AFFINITY', 'Kuni Shugenja', '', true], ['ISAWA-FIRE', 'Isawa Shugenja', 'Fire', true], ['ISAWA-VOID', 'Isawa Shugenja', 'Void', false]]) {
        await setup(page, {school, affinity});
        const o = await option(page);
        check('VV-PICKER-' + id, [o.disabled, /Shugenja with Void Affinity only/.test(o.text)], [disabled, disabled]);
      }
      await setup(page, {disadv:[{name:'Uncentered', cost:'4', desc:''}]});
      check('VV-PICKER-UNCENTERED', [(await option(page)).disabled, /Uncentered/.test((await option(page)).text)], [true, true]);
    });

    await section('VV-CONFIGURE', async () => {
      await setup(page); const initial = await page.locator('#f_xpSpent').inputValue().then(Number);
      await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Void Versatility'; s.dispatchEvent(new Event('change', {bubbles:true})); });
      await page.waitForSelector('#advConfigGrid .vv4520-option', {state:'visible'});
      const options = await page.evaluate(() => [...document.querySelectorAll('#advConfigGrid .vv4520-option input')].map(i => ({v:i.value, c:i.checked, l:i.labels.length})));
      check('VV-FOUR-RINGS-NO-VOID', options.map(o => o.v), RINGS);
      check('VV-NONE-PRESELECTED', options.every(o => !o.c && o.l === 1));
      await page.locator('#advConfigConfirm').click();
      check('VV-REQUIRES-CHOICE', [await page.locator('#advConfigModalOverlay').isVisible(), await page.locator('#advConfigGrid [role=alert]').isVisible(), (await row(page)).config], [true, true, null]);
      await page.locator('#advConfigGrid input[value="Water"]').check(); await page.locator('#advConfigConfirm').click();
      const r = await row(page);
      check('VV-CONFIG', r.config, cfg('Water'));
      check('VV-ROW', [r.badge, r.inactive, /Water slots may also pay for Void spells/.test(r.reminder)], ['Water slots', false, true]);
      check('VV-PRICE', [r.cost, (await page.locator('#f_xpSpent').inputValue().then(Number)) - initial], [PRICE, PRICE]);
    });

    let ordinary = null;
    await section('VV-ORDINARY-BASELINE', async () => {
      // The same character without the Advantage: no question asked, a Void slot is spent.
      await setup(page); const before = await state(page);
      const c = await cast(page, 'Void Probe');
      ordinary = await roll(page);
      const after = await state(page);
      check('VV-BASELINE-NO-DIALOG', c.seen, 'preview');
      check('VV-BASELINE-VOID-SPENT', [Number(after.void) - Number(before.void), after.air, after.bonus], [1, before.air, before.bonus]);
    });

    await section('VV-PAY-WITH-RING', async () => {
      for (const ring of RINGS) {
        const key = ring.toLowerCase();
        await setup(page, {adv:[{name:VV, cost:'4', desc:'', config:cfg(ring)}]});
        const max = await ringMax(page, key); const before = await state(page);
        const c = await cast(page, 'Void Probe');
        check('VV-' + ring + '-ASKS', [c.seen, c.ok.includes(ring + ' slot (' + max + ' of ' + max + ' left)'), /Void slot/.test(c.cancel), /still cast as Void/.test(c.msg)], ['dialog', true, true, true]);
        await page.locator('#appConfirmOk').click();
        const r = await roll(page);
        const after = await state(page);
        const others = RINGS.map(x => x.toLowerCase()).filter(k => k !== key);
        check('VV-' + ring + '-ONE-DEBIT', [Number(after[key]) - Number(before[key]), after.void, after.bonus, after.visual, after.voidPoints, others.map(k => after[k])],
          [1, before.void, before.bonus, before.visual, before.voidPoints, others.map(k => before[k])]);
        check('VV-' + ring + '-SAME-VOID-ROLL', [r.dice, r.kept, /Casting Roll \(Void\)/.test(r.title), /Void Ring/.test(r.preview)], [ordinary.dice, ordinary.kept, true, true]);
        check('VV-' + ring + '-SAYS-WHO-PAID', /Void Versatility/.test(r.preview) && new RegExp('paid with an? ' + ring + ' slot').test(r.title));
      }
    });

    await section('VV-CHOICES', async () => {
      const adv = [{name:VV, cost:'4', desc:'', config:cfg('Air')}];
      await setup(page, {adv}); let before = await state(page);
      await cast(page, 'Void Probe'); await page.locator('#appConfirmCancel').click(); await roll(page);
      let after = await state(page);
      check('VV-ORDINARY-CHOSEN', [Number(after.void) - Number(before.void), after.air], [1, before.air]);
      await setup(page, {adv}); before = await state(page);
      await cast(page, 'Void Probe'); await page.locator('#appConfirmX').click();
      await page.waitForTimeout(300);
      check('VV-X-SPENDS-NOTHING', [await state(page), await page.locator('#rollPreviewGo').isVisible()], [before, false]);
      // Ring manually used up: no question, the ordinary flow runs exactly as before.
      await setup(page, {adv}); await setUsed(page, 'air', await ringMax(page, 'air')); before = await state(page);
      const c = await cast(page, 'Void Probe'); await roll(page); after = await state(page);
      check('VV-RING-EMPTY-ORDINARY', [c.seen, Number(after.void) - Number(before.void)], ['preview', 1]);
      // A manually filled Ring pip is counted by the question.
      await setup(page, {adv}); await setUsed(page, 'air', 1);
      const c2 = await cast(page, 'Void Probe'); const max = await ringMax(page, 'air');
      check('VV-MANUAL-PIP-COUNTED', c2.ok.includes('(' + (max - 1) + ' of ' + max + ' left)'));
      await page.locator('#appConfirmX').click();
      // Void used up, bonus available: the ordinary option is the trunk's bonus flow, untouched.
      await setup(page, {adv}); await setUsed(page, 'void', await ringMax(page, 'void')); before = await state(page);
      const c3 = await cast(page, 'Void Probe');
      check('VV-VOID-EMPTY-OFFERS-BONUS', /Bonus slot/.test(c3.cancel));
      await page.locator('#appConfirmCancel').click();
      await page.waitForFunction(() => /bonus slot/i.test(document.getElementById('appConfirmMsg').textContent));
      await page.locator('#appConfirmOk').click(); await roll(page); after = await state(page);
      check('VV-BONUS-VIA-TRUNK', [Number(after.bonus) - Number(before.bonus), after.air], [1, before.air]);
      // Void and bonus both used up: only the Ring can pay.
      await setup(page, {adv}); await setUsed(page, 'void', await ringMax(page, 'void')); await setUsed(page, 'bonus', await ringMax(page, 'void'));
      before = await state(page);
      const c4 = await cast(page, 'Void Probe');
      check('VV-ONLY-RING-LEFT', [c4.seen, /No Void or bonus slots are left/.test(c4.msg)], ['dialog', true]);
      await page.locator('#appConfirmOk').click(); await roll(page); after = await state(page);
      check('VV-ONLY-RING-PAYS', [Number(after.air) - Number(before.air), after.void, after.bonus], [1, before.void, before.bonus]);
    });

    await section('VV-NO-EFFECT-ELSEWHERE', async () => {
      await setup(page, {adv:[{name:VV, cost:'4', desc:'', config:cfg('Air')}]}); let before = await state(page);
      const c = await cast(page, 'Air Probe'); await roll(page); let after = await state(page);
      check('VV-AIR-SPELL-UNCHANGED', [c.seen, Number(after.air) - Number(before.air), after.void], ['preview', 1, before.void]);
      before = await state(page);
      const u = await cast(page, 'Sense');
      check('VV-UNIVERSAL-UNCHANGED', u.seen, 'universal');
      await page.locator('#universalSpellPickX').click();
      check('VV-UNIVERSAL-CANCEL-CLEAN', await state(page), before);
      for (const [id, school, affinity] of [['ISAWA-FIRE', 'Isawa Shugenja', 'Fire'], ['BUSHI', 'Hida Bushi', '']]) {
        await setup(page, {school, affinity, adv:[{name:VV, cost:'4', desc:'', config:cfg('Air')}]});
        const r = await row(page);
        check('VV-INELIGIBLE-ROW-' + id, [r.inactive, /Not in effect/.test(r.reminder), r.cost, r.config], [true, true, PRICE, cfg('Air')]);
        if (id === 'ISAWA-FIRE') {
          before = await state(page); const c2 = await cast(page, 'Void Probe'); await roll(page); after = await state(page);
          check('VV-INELIGIBLE-NO-OFFER', [c2.seen, Number(after.void) - Number(before.void), after.air], ['preview', 1, before.air]);
        }
      }
      await setup(page, {adv:[{name:VV, cost:'4', desc:'', config:cfg('Air')}], disadv:[{name:'Uncentered', cost:'4', desc:''}]});
      check('VV-UNCENTERED-ROW', [(await row(page)).inactive, /Uncentered/.test((await row(page)).reminder)], [true, true]);
    });

    await section('VV-DIAGNOSTICS', async () => {
      const report = () => page.evaluate(() => { const T = window.__L5R_TEST__;
        const e = [...document.querySelectorAll('#techList .entry')].find(x => x.querySelector('.en-name').value === 'Void Probe');
        return (T.diagnoseCastability(e)?.findings || []).map(f => f.id + ':' + f.severity); });
      const exhaust = async () => { await setUsed(page, 'void', await ringMax(page, 'void')); await setUsed(page, 'bonus', await ringMax(page, 'void')); };
      await setup(page, {adv:[{name:VV, cost:'4', desc:'', config:cfg('Air')}]}); await exhaust();
      const lifted = await report();
      check('VV-DIAG-LIFTED', [lifted.includes('no-slots-lifted:note'), lifted.some(f => f.startsWith('no-slots:'))], [true, false]);
      await setup(page, {school:'Isawa Shugenja', affinity:'Fire', adv:[{name:VV, cost:'4', desc:'', config:cfg('Air')}]}); await exhaust();
      check('VV-DIAG-INELIGIBLE-STILL-BLOCKS', (await report()).includes('no-slots:blocker'));
    });

    await section('VV-PERSISTENCE', async () => {
      await setup(page, {adv:[{name:VV, cost:'4', desc:'', config:cfg('Fire')}]});
      const saved = await collect(page);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(b => b.click());
      const stream = await (await downloadPromise).createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      await setup(page, {adv:[]});
      await page.locator('#fileImport').setInputFiles({name:'v.l5r.json', mimeType:'application/json', buffer:Buffer.concat(chunks)});
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('VV-IMPORT', [(await collect(page)).adv, (await row(page)).badge], [saved.adv, 'Fire slots']);
      await page.locator('#btnSave').evaluate(b => b.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const id = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(id);
      await page.locator('#btnLoad').evaluate(b => b.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('VV-LOCAL-RELOAD', (await collect(page)).adv, saved.adv);
      await setup(page, {adv:[{name:VV, cost:'4', desc:'legacy'}]});
      check('VV-LEGACY', [(await row(page)).warning, (await row(page)).cost, (await cast(page, 'Void Probe')).seen], [true, PRICE, 'preview']);
      await roll(page);
      for (const [idc, config] of [['VOID-RING', {type:'voidVersatilityRing', revision:1, ring:'Void'}], ['CASE', {type:'voidVersatilityRing', revision:1, ring:'air'}],
        ['FUTURE', {type:'voidVersatilityRing', revision:2, ring:'Air'}], ['EXTRA', {type:'voidVersatilityRing', revision:1, ring:'Air', slots:3}],
        ['BASE-RINGPICK', {type:'ringPick', value:'Air'}]]) {
        await setup(page, {adv:[{name:VV, cost:'9', desc:'', config}]});
        const r = await row(page); const c = await cast(page, 'Void Probe');
        check('VV-INVALID-' + idc, [(await collect(page)).adv[0].config, r.warning && /Saved setting kept/.test(r.text), r.cost, c.seen], [config, true, 9, 'preview']);
        await roll(page);
      }
      await setup(page, {disadv:[{name:VV, cost:'4', desc:'', config:cfg('Air')}]});
      check('VV-WRONG-SIDE', [/belongs in Advantages/.test((await row(page, 'disadvList')).text), (await cast(page, 'Void Probe')).seen], [true, 'preview']);
      await roll(page);
    });

    await section('VV-RENAME-INFO', async () => {
      await setup(page, {adv:[{name:VV, cost:'4', desc:'', config:cfg('Earth')}]});
      await page.locator('#advList .vv4520-info').click();
      const info = await page.locator('#stanceInfoBody').textContent();
      check('VV-INFO', /Great Clans p\.199/.test(await page.locator('#stanceInfoRing').textContent()) && /Your Ring: Earth/.test(info) &&
        /still a Void spell/.test(info) && /Void Affinity only/.test(info) && /Uncentered/.test(info));
      await page.locator('#stanceInfoClose').click();
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Unrelated'; window.__L5R_TEST__.recalcAll(); });
      check('VV-RENAMED-CLEAN', [(await row(page)).hasRow, (await row(page)).config, (await cast(page, 'Void Probe')).seen], [false, null, 'preview']);
      await roll(page);
    });

    await section('VV-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:700});
        await setup(page);
        await page.evaluate(() => { const s = document.getElementById('advQuickAdd'); s.value = 'Void Versatility'; s.dispatchEvent(new Event('change', {bubbles:true})); });
        await page.waitForSelector('#advConfigGrid .vv4520-option', {state:'visible'});
        const g = await page.evaluate(() => {
          const grid = document.getElementById('advConfigGrid').getBoundingClientRect();
          const opts = [...document.querySelectorAll('#advConfigGrid .vv4520-option')];
          return {fits:opts.every(o => { const r = o.getBoundingClientRect(); return r.left >= grid.left - 1 && r.right <= grid.right + 1 && o.scrollWidth <= o.clientWidth + 1; }),
            readable:opts.every(o => parseFloat(getComputedStyle(o).fontSize) >= 12 && getComputedStyle(o).textTransform === 'none' && o.getBoundingClientRect().height >= 32)};
        });
        await page.locator('#advConfigGrid input[value="Air"]').check(); await page.locator('#advConfigConfirm').click();
        const reachable = !(await page.locator('#advConfigModalOverlay').isVisible()) && (await row(page)).config?.ring === 'Air';
        const rowFit = await page.evaluate(() => { const r = document.querySelector('#advList .adv-config-row'); return r.scrollWidth <= r.clientWidth + 1; });
        const c = await cast(page, 'Void Probe');
        const dialogFit = await page.evaluate(() => [...document.querySelectorAll('#appConfirmOverlay button')].every(b => b.scrollWidth <= b.clientWidth + 1 && b.getBoundingClientRect().right <= window.innerWidth));
        await page.locator('#appConfirmX').click();
        check('VV-GEOMETRY-' + width, {...g, reachable, rowFit, dialog:c.seen, dialogFit}, {fits:true, readable:true, reachable:true, rowFit:true, dialog:'dialog', dialogFit:true});
      }
      await page.setViewportSize({width:375, height:812});
    });
    check('VV-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('VV-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('VV4520_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
