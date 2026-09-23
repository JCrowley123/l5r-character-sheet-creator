/* Real-browser acceptance tests for Heart of Vengeance (A06, Feature 4.5.16).
 * Expected values come from Core p.150 and the approved scope, never from HV4516 itself:
 * 5 XP (4 Spider); +1k1 declared per roll on Skill, Trait, Ring and manual rolls only.
 * node heart-vengeance-harness.js <sheet.html>
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
const HV = 'Heart of Vengeance';
const PRICE = {normal:5, spider:4};
const ELIGIBLE = ['SKILL', 'TRAIT', 'RING', 'MANUAL'];
const EXCLUDED = ['ATTACK', 'DAMAGE', 'SPELL', 'INITIATIVE'];
const CTX = {SKILL:{skillName:'Courtier', traitName:'Awareness'}, TRAIT:{traitName:'Awareness'}, RING:{ringName:'Air'},
  MANUAL:{notation:'5k3'}, ATTACK:{skillName:'Kenjutsu', traitName:'Agility'}, DAMAGE:{skillName:'Kenjutsu'},
  SPELL:{spellName:'Sense', element:'Air'}, INITIATIVE:{}};

async function reset(page, clan = '') {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(clan => {
    document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__; T.closeAdvConfigModal(); T.resetToBaseline();
    document.getElementById('f_clan').value = clan; T.recalcAll();
  }, clan);
}
async function quickAdd(page, name, list = 'adv') {
  await page.evaluate(({name, list}) => {
    const select = document.getElementById(list + 'QuickAdd'); select.value = name;
    if (select.value !== name) throw Error('Missing catalogue option ' + name);
    select.dispatchEvent(new Event('change', {bubbles:true}));
  }, {name, list});
}
const modalOpen = page => page.locator('#advConfigModalOverlay').isVisible();
async function rival(page, faction, clan = '') {
  await reset(page, clan); await quickAdd(page, HV);
  await page.locator('#hv4516Faction').fill(faction); await page.locator('#advConfigConfirm').click();
  return first(page);
}
async function addRival(page, faction) {
  await quickAdd(page, HV); await page.locator('#hv4516Faction').fill(faction); await page.locator('#advConfigConfirm').click();
}
const rows = (page, list = 'advList') => page.evaluate(list => [...document.querySelectorAll('#' + list + ' .entry')].map(d => ({
  name:d.querySelector('.en-name').value, cost:Number(d.querySelector('.en-cost').value), config:JSON.parse(d.dataset.advConfig || 'null'),
  text:d.querySelector('.adv-config-row')?.textContent || '', hasRow:!!d.querySelector('.adv-config-row'),
  warning:!!d.querySelector('.adv-config-warn')})), list);
const first = async (page, list) => (await rows(page, list))[0];
const collect = page => page.evaluate(() => window.__L5R_TEST__.collectData());
const xp = page => page.locator('#f_xpSpent').inputValue().then(Number);
const offeredLabels = (page, kind) => page.evaluate(({kind, ctx}) => { const T = window.__L5R_TEST__;
  return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS[kind], ctx)).filter(o => o.provider === 'heart-vengeance').map(o => o.label); }, {kind, ctx:CTX[kind]});
async function open(page, kind, opts = {}) {
  const pending = page.evaluate(({kind, ctx, opts}) => { const T = window.__L5R_TEST__;
    window.__HV_CTX = T.makeRollContext(T.ROLL_KINDS[kind], ctx);
    return T.rollWithModifiers('Heart probe', window.__HV_CTX, 5, 3, opts); }, {kind, ctx:CTX[kind], opts});
  pending.catch(() => {});   // an aborted section must still let the final count print
  await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000});
  // Wrapped, never returned bare: an async function that returns a promise has it awaited by
  // its caller, which would wait here for a roll nobody has confirmed yet.
  return {pending};
}
async function confirmRoll(page, handle) {
  await page.locator('#rollPreviewGo').click(); await handle.pending;
  const r = await page.evaluate(() => ({dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
    kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length, body:document.getElementById('rollModalBody')?.textContent || ''}));
  await page.keyboard.press('Escape');
  return r;
}
async function cancelRoll(page, handle) {
  await page.locator('#rollPreviewCancel').click();
  await Promise.race([handle.pending.catch(() => null), new Promise(r => setTimeout(r, 5000))]);
}
const hvBoxes = page => page.evaluate(() => [...document.querySelectorAll('[data-rd4515-key^="heart-vengeance:"]')].map(b => b.checked));

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

    await section('HV-START', async () => {
      check('HV-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ADV_HEART_VENGEANCE_ENABLED));
      check('HV-SCHEMA', await page.evaluate(n => window.__L5R_TEST__.advConfigSchemaFor(n)?.type, HV), 'factionPick');
      // Conditional on Feature 4.5.21 (Seven Fortunes' Blessing), which registers its own provider
      // after this one; declared in that release's ROLLBACK.md. Heart of Vengeance's own entry is
      // still checked exactly.
      check('HV-PROVIDER-REGISTERED', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.RD4515.providerIds().filter(id => !(id === 'fortune-blessing' && T.FB4521) && !(id === 'dark-paragon' && T.DP4523) && !(id === 'spirit-realms' && T.TR4524)); }), ['heart-vengeance']);
      check('HV-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
    });

    await section('HV-PRICE', async () => {
      await reset(page); const initial = await xp(page);
      await quickAdd(page, HV);
      check('HV-OPENS-ON-ADD', await modalOpen(page));
      const blank = await first(page);
      check('HV-BLANK', [blank.cost, blank.warning], [PRICE.normal, true]);
      check('HV-BLANK-NOT-OFFERED', await offeredLabels(page, 'SKILL'), []);
      await page.locator('#hv4516Faction').fill('  Scorpion   Clan '); await page.locator('#advConfigConfirm').click();
      const row = await first(page);
      check('HV-CONFIG', row.config, {type:'factionPick', revision:1, faction:'Scorpion Clan', value:'Scorpion Clan'});
      check('HV-PRICE-NORMAL', [row.cost, await xp(page)], [PRICE.normal, initial + PRICE.normal]);
      check('HV-BADGE', /Rival: Scorpion Clan/.test(row.text) && !row.warning);
      for (const [clan, price] of [['Spider', PRICE.spider], ['Crab', PRICE.normal], ['Scorpion', PRICE.normal]]) {
        await page.evaluate(clan => { document.getElementById('f_clan').value = clan; window.__L5R_TEST__.recalcAll(); }, clan);
        check('HV-PRICE-' + clan.toUpperCase(), (await first(page)).cost, price);
      }
      await page.evaluate(() => { for (let i = 0; i < 6; i++) window.__L5R_TEST__.recalcAll(); });
      check('HV-RECALC-STABLE', (await first(page)).cost, PRICE.normal);
    });

    await section('HV-PICKER', async () => {
      await reset(page); await quickAdd(page, HV);
      const suggestions = await page.evaluate(() => [...document.querySelectorAll('#hv4516Suggestions option')].map(o => o.value));
      for (const s of ['Scorpion Clan', 'Spider Clan', 'Mantis Clan', 'Brotherhood of Shinsei', 'Otomo family (Imperial)', 'Miya family (Imperial)', 'Seppun family (Imperial)']) {
        check('HV-SUGGESTS-' + s.replace(/\W+/g, '-'), suggestions.includes(s));
      }
      check('HV-SUGGESTIONS-UNIQUE', new Set(suggestions).size === suggestions.length);
      check('HV-LABELLED-INPUT', await page.evaluate(() => document.getElementById('hv4516Faction').labels.length), 1);
      await page.locator('#hv4516Faction').fill('   '); await page.locator('#advConfigConfirm').click();
      check('HV-REJECT-EMPTY', [await modalOpen(page), await page.locator('#advConfigGrid [role=alert]').isVisible(), (await first(page)).config], [true, true, null]);
      await page.locator('#hv4516Faction').fill('The Kolat'); await page.locator('#advConfigConfirm').click();
      check('HV-FREE-TEXT', (await first(page)).config.faction, 'The Kolat');
      await page.locator('#advList .adv-config-btn').click();
      check('HV-EDIT-PREFILLED', await page.locator('#hv4516Faction').inputValue(), 'The Kolat');
      await page.locator('#hv4516Faction').fill('Changed'); await page.locator('#advConfigX').click();
      check('HV-CANCEL-KEEPS', (await first(page)).config.faction, 'The Kolat');
    });

    await section('HV-SCOPE', async () => {
      await rival(page, 'Scorpion Clan');
      for (const kind of ELIGIBLE) check('HV-OFFERED-' + kind, await offeredLabels(page, kind), ['Contested against Scorpion Clan — apply +1k1']);
      for (const kind of EXCLUDED) check('HV-NOT-OFFERED-' + kind, await offeredLabels(page, kind), []);
      let p = await open(page, 'ATTACK');
      check('HV-ATTACK-PREVIEW-CLEAN', await hvBoxes(page), []);
      await cancelRoll(page, p);
    });

    await section('HV-DICE', async () => {
      await rival(page, 'Scorpion Clan');
      for (const kind of ['SKILL', 'TRAIT', 'RING', 'MANUAL']) {
        let p = await open(page, kind);
        check('HV-UNTICKED-' + kind, await hvBoxes(page), [false]);
        await page.locator('.rd4515-opt').click();
        let r = await confirmRoll(page, p);
        check('HV-DECLARED-DICE-' + kind, [r.dice, r.kept], [6, 4]);
        if (kind === 'SKILL') check('HV-RESULT-NAMES-RIVAL', /Heart of Vengeance/.test(r.body) && /Scorpion Clan/.test(r.body));
        p = await open(page, kind);
        check('HV-FRESH-' + kind, await hvBoxes(page), [false]);
        r = await confirmRoll(page, p);
        check('HV-UNDECLARED-DICE-' + kind, [r.dice, r.kept], [5, 3]);
      }
      let p = await open(page, 'SKILL');
      await page.locator('.rd4515-opt').click();
      await cancelRoll(page, p);
      check('HV-CANCEL-DISARMS', await page.evaluate(() => window.__L5R_TEST__.RD4515.armed(window.__HV_CTX)), []);
      p = await open(page, 'SKILL'); await page.locator('.rd4515-opt').click(); await confirmRoll(page, p);
      await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.rollWithModifiers('No preview', T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName:'Courtier', traitName:'Awareness'}), 5, 3, {skipPreview:true}); });
      check('HV-NO-LEAK', await page.evaluate(() => [document.querySelectorAll('#rollDiceRow .roll-die').length, document.querySelectorAll('#rollDiceRow .roll-die.kept').length]), [5, 3]);
      await page.keyboard.press('Escape');
      const saved = await collect(page);
      check('HV-DECLARATION-NOT-SAVED', Object.keys(saved.adv[0].config).sort(), ['faction', 'revision', 'type', 'value']);
    });

    await section('HV-MULTI', async () => {
      await rival(page, 'Scorpion Clan');
      await addRival(page, 'Lion Clan');
      await addRival(page, 'scorpion  clan');
      check('HV-ONE-OPTION-PER-FACTION', await offeredLabels(page, 'SKILL'),
        ['Contested against Scorpion Clan — apply +1k1', 'Contested against Lion Clan — apply +1k1']);
      const p = await open(page, 'SKILL');
      await page.locator('.rd4515-opt').nth(0).click(); await page.locator('.rd4515-opt').nth(1).click();
      check('HV-ONCE-PER-ROLL-PREVIEW', await page.locator('.rp-pool-final').textContent(), '6k4');
      const r = await confirmRoll(page, p);
      check('HV-ONCE-PER-ROLL-DICE', [r.dice, r.kept], [6, 4]);
    });

    await section('HV-PERSISTENCE', async () => {
      await rival(page, 'Otomo family (Imperial)');
      const saved = await collect(page);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExport').evaluate(button => button.click());
      const stream = await (await downloadPromise).createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const bytes = Buffer.concat(chunks);
      check('HV-EXPORT', JSON.parse(bytes.toString('utf8')).adv, saved.adv);
      await reset(page);
      await page.locator('#fileImport').setInputFiles({name:'hv.l5r.json', mimeType:'application/json', buffer:bytes});
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('HV-IMPORT', (await collect(page)).adv, saved.adv);
      check('HV-IMPORT-OFFERS', await offeredLabels(page, 'SKILL'), ['Contested against Otomo family (Imperial) — apply +1k1']);
      await page.locator('#btnSave').evaluate(button => button.click());
      await page.waitForFunction(() => document.getElementById('charSelect').value !== '');
      const savedId = await page.locator('#charSelect').inputValue();
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => !!window.__L5R_TEST__);
      await page.locator('#charSelect').selectOption(savedId);
      await page.locator('#btnLoad').evaluate(button => button.click());
      await page.waitForFunction(() => document.querySelectorAll('#advList .entry').length === 1);
      check('HV-LOCAL-RELOAD', (await collect(page)).adv, saved.adv);
      const base = await collect(page);
      const load = (adv, disadv = []) => page.evaluate(d => window.__L5R_TEST__.applyData(d), {...base, adv, disadv});
      for (const version of [1, 2, 3]) {
        await page.evaluate(d => window.__L5R_TEST__.applyData(d), {...base, schemaVersion:version, adv:[{name:HV, cost:'5', desc:'legacy'}]});
        const legacy = await first(page);
        check('HV-OLD-SAVE-' + version, [legacy.cost, legacy.warning, legacy.config], [PRICE.normal, true, null]);
      }
      await load([{name:HV, cost:'5', desc:'', config:{type:'factionPick', revision:1, faction:'Crab Clan'}}]);
      check('HV-MINIMAL-IMPORT', [(await first(page)).warning, await offeredLabels(page, 'SKILL')], [false, ['Contested against Crab Clan — apply +1k1']]);
      for (const [id, config] of [['FUTURE', {type:'factionPick', revision:2, faction:'Crab Clan'}], ['UNKNOWN-FIELD', {type:'factionPick', revision:1, faction:'Crab Clan', armed:true}],
        ['EMPTY', {type:'factionPick', revision:1, faction:' '}], ['OTHER-TYPE', {type:'futurePick', revision:1, faction:'Crab Clan'}]]) {
        await load([{name:HV, cost:'9', desc:'', config}]);
        const row = await first(page);
        check('HV-INVALID-' + id, [(await collect(page)).adv[0].config, row.warning, row.cost, (await offeredLabels(page, 'SKILL')).length], [config, true, 9, 0]);
      }
      await load([], [{name:HV, cost:'5', desc:'', config:{type:'factionPick', revision:1, faction:'Crab Clan'}}]);
      check('HV-WRONG-SIDE', [/belongs in Advantages/.test((await first(page, 'disadvList')).text), (await offeredLabels(page, 'SKILL')).length], [true, 0]);
    });

    await section('HV-RENAME', async () => {
      await rival(page, 'Crab Clan');
      await page.evaluate(() => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = 'Unrelated'; window.__L5R_TEST__.recalcAll(); });
      check('HV-RENAMED-CLEAN', [(await first(page)).hasRow, (await first(page)).config, (await offeredLabels(page, 'SKILL')).length], [false, null, 0]);
      await reset(page); await quickAdd(page, 'Elemental Blessing');
      await page.locator('#advConfigGrid .affinity-pick-item input[type=checkbox]').first().check(); await page.locator('#advConfigConfirm').click();
      await page.evaluate(n => { const d = document.querySelector('#advList .entry'); d.querySelector('.en-name').value = n; window.__L5R_TEST__.recalcAll(); }, HV);
      check('HV-FOREIGN-RENAME-CLEARS', [(await first(page)).config, (await first(page)).warning], [null, true]);
    });

    await section('HV-INFO-ISOLATION', async () => {
      await rival(page, 'Crab Clan');
      await page.locator('#advList .hv4516-info').click();
      const info = await page.locator('#stanceInfoBody').textContent();
      check('HV-INFO', /Core p\.150/.test(await page.locator('#stanceInfoRing').textContent()) && /Brotherhood of Shinsei/.test(info) && /never saved/.test(info) && /4 for a Spider/.test(info));
      await page.locator('#stanceInfoClose').click();
      await reset(page);
      const before = await collect(page);
      const probe = () => page.evaluate(() => { const T = window.__L5R_TEST__;
        return Object.values(T.ROLL_KINDS).map(kind => T.getPreRollModifiers(T.makeRollContext(kind, {skillName:'Courtier', traitName:'Awareness'}))); });
      const pools = await probe();
      await addRival(page, 'Crab Clan');
      const after = await collect(page);
      check('HV-ONLY-XP-FIELDS', Object.keys(before.fields).filter(k => before.fields[k] !== after.fields[k] && !['f_xpSpent','f_xpRemain','f_xpRemaining'].includes(k)), []);
      for (const key of ['skills','traits','rings','voidCurrent','disadv','equip','weapons']) check('HV-UNCHANGED-' + key, after[key], before[key]);
      check('HV-NO-UNDECLARED-MODS', await probe(), pools);
    });

    await section('HV-TEXT-GEOMETRY', async () => {
      const hostile = '<img src=x onerror="window.HV_INJECTED=1"> & "Q"';
      await rival(page, hostile);
      const p = await open(page, 'SKILL');
      check('HV-TEXT-SAFE', await page.evaluate(() => !window.HV_INJECTED && !document.querySelector('#advList img, #rollPreviewBody img')));
      check('HV-TEXT-VISIBLE', (await page.locator('.rd4515-opt span').textContent()).includes(hostile));
      await cancelRoll(page, p);
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:900});
        await rival(page, 'AnUnbrokenRivalFactionName'.repeat(8));
        const rowFit = await page.evaluate(() => { const r = document.querySelector('#advList .adv-config-row'); return r.scrollWidth <= r.clientWidth + 1; });
        await page.locator('#advList .adv-config-btn').click();
        const modal = await page.evaluate(() => { const g = document.getElementById('advConfigGrid').getBoundingClientRect();
          return [...document.querySelectorAll('#advConfigGrid input, #advConfigGrid label')].every(el => { const r = el.getBoundingClientRect(); return r.left >= g.left - 1 && r.right <= g.right + 1; }) &&
            parseFloat(getComputedStyle(document.getElementById('hv4516Faction')).fontSize) >= 16; });
        await page.locator('#advConfigX').click();
        const q = await open(page, 'SKILL');
        const previewFit = await page.evaluate(() => { const b = document.querySelector('.rd4515-declare'); return b.scrollWidth <= b.clientWidth + 1; });
        await cancelRoll(page, q);
        check('HV-GEOMETRY-' + width, {rowFit, modal, previewFit}, {rowFit:true, modal:true, previewFit:true});
      }
      await page.setViewportSize({width:375, height:812});
    });
    check('HV-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('HV-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('HV4516_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
