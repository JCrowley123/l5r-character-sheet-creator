/* Real-browser acceptance tests for the general per-roll declaration registry (Feature 4.5.15).
 * The registry ships with no production provider, so this harness registers probe providers
 * through the test seam and removes them again. Dice are counted from the rendered result.
 * node roll-declarations-harness.js <sheet.html>
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

// Probe providers live in the page. `kinds` limits where they offer; +1k1 per armed option.
async function probe(page, id, {kinds = ['trait'], label = 'Probe', options = [['plus', 'Probe +1k1']],
  throwOffers = false, throwModifiers = false} = {}) {
  return page.evaluate(({id, kinds, label, options, throwOffers, throwModifiers}) =>
    window.__L5R_TEST__.RD4515.register(id, {
      label,
      offers: c => { if (throwOffers) throw Error('offers broke'); return kinds.includes(c.kind) ? options.map(([key, text]) => ({key, label:text, note:'probe note'})) : []; },
      modifiers: (c, keys) => { if (throwModifiers) throw Error('modifiers broke'); return keys.map(k => ({label, rolledDelta:1, keptDelta:1, note:'probe ' + k})); },
    }), {id, kinds, label, options, throwOffers, throwModifiers});
}
const clearProviders = page => page.evaluate(() => {
  const R = window.__L5R_TEST__.RD4515; R.providerIds().forEach(id => R.unregister(id)); R.cancel();
});
async function reset(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.id !== 'rollPreviewOverlay') o.style.display = 'none'; });
    const T = window.__L5R_TEST__; T.resetToBaseline(); T.recalcAll();
  });
  await clearProviders(page);
}
// Opens a preview for a new context; the in-flight roll is wrapped so it is not awaited early.
async function open(page, kind, extra = {}, rolled = 5, kept = 3, opts = {}) {
  const pending = page.evaluate(({kind, extra, rolled, kept, opts}) => {
    const T = window.__L5R_TEST__;
    window.__RD_CTX = T.makeRollContext(T.ROLL_KINDS[kind], extra);
    return T.rollWithModifiers('Declaration probe', window.__RD_CTX, rolled, kept, opts);
  }, {kind, extra, rolled, kept, opts});
  // A section that aborts leaves this roll in flight; when the browser later closes it rejects.
  // Unhandled, that rejection kills Node before the final count prints (found by the kill-switch
  // variant reporting 0/0), so a broken build must still produce a real, failing count.
  pending.catch(() => {});
  const opened = await page.waitForSelector('#rollPreviewGo', {state:'visible', timeout:6000}).then(() => true).catch(() => false);
  return {pending, opened};
}
async function confirmRoll(page, handle) {
  await page.locator('#rollPreviewGo').click();
  await handle.pending;
  return readResult(page);
}
async function cancelRoll(page, handle) {
  await page.locator('#rollPreviewCancel').click();
  await Promise.race([handle.pending.catch(() => null), new Promise(r => setTimeout(r, 5000))]);
}
const readResult = page => page.evaluate(() => ({
  dice:document.querySelectorAll('#rollDiceRow .roll-die').length,
  kept:document.querySelectorAll('#rollDiceRow .roll-die.kept').length,
  body:document.getElementById('rollModalBody')?.textContent || ''}));
const boxes = page => page.evaluate(() => [...document.querySelectorAll('[data-rd4515-key]')].map(b => [b.getAttribute('data-rd4515-key'), b.checked]));
const poolText = page => page.locator('.rp-pool-final').textContent();
const armedNow = page => page.evaluate(() => window.__L5R_TEST__.RD4515.armed(window.__RD_CTX));

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch(process.env.L5R_CHROME ? {executablePath:process.env.L5R_CHROME} : {});
  try {
    const page = await browser.newPage({viewport:{width:375, height:812}});
    page.setDefaultTimeout(6000);
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    const errors = []; page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => !!window.__L5R_TEST__);

    await section('RD-START', async () => {
      check('RD-ENABLED', await page.evaluate(() => window.__L5R_TEST__.ROLL_DECLARATIONS_ENABLED));
      check('RD-REGISTRY-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(x => [x.id, x.priority]).sort((a, b) => a[1] - b[1])),
        [['range',20],['arrow',25],['stance',30],['offhand',35],['wounds',40],['void',50],['adv-config',60]]);
      // CROSS-PHASE FIXTURE CORRECTION, Feature 4.5.16 (declared in its ROLLBACK): the registry
      // itself ships no provider; Heart of Vengeance registers one only while 4.5.16 is present.
      check('RD-NO-PRODUCTION-PROVIDER', await page.evaluate(() => { const T = window.__L5R_TEST__;
        // Conditional on 4.5.16 and 4.5.21, which each register one production provider (declared).
        return T.RD4515.providerIds().filter(id => !(id === 'heart-vengeance' && T.HV4516) && !(id === 'fortune-blessing' && T.FB4521) && !(id === 'dark-paragon' && T.DP4523) && !(id === 'spirit-realms' && T.TR4524)); }), []);
      await reset(page);
      const h = await open(page, 'TRAIT', {traitName:'Agility'});
      check('RD-EMPTY-NO-BLOCK', [h.opened, await page.locator('.rd4515-declare').count()], [true, 0]);
      const r = await confirmRoll(page, h);
      check('RD-EMPTY-UNCHANGED-DICE', [r.dice, r.kept], [5, 3]);
    });

    await section('RD-API', async () => {
      await reset(page);
      check('RD-REJECT-BAD-ID', await page.evaluate(() => window.__L5R_TEST__.RD4515.register('Bad Id', {offers:() => [], modifiers:() => []})), false);
      check('RD-REJECT-NO-FUNCTIONS', await page.evaluate(() => window.__L5R_TEST__.RD4515.register('ok', {offers:[]})), false);
      check('RD-REGISTER', await probe(page, 'qa-one'));
      check('RD-REPLACE-SAME-ID', [await probe(page, 'qa-one', {label:'Replaced'}),
        await page.evaluate(() => window.__L5R_TEST__.RD4515.providerIds())], [true, ['qa-one']]);
      await page.evaluate(() => window.__L5R_TEST__.RD4515.unregister('qa-one'));
      check('RD-UNREGISTER', await page.evaluate(() => window.__L5R_TEST__.RD4515.providerIds()), []);
    });

    await section('RD-DICE', async () => {
      await reset(page); await probe(page, 'qa-one');
      let h = await open(page, 'TRAIT', {traitName:'Agility'});
      check('RD-OFFERED-UNCHECKED', await boxes(page), [['qa-one:plus', false]]);
      check('RD-SOURCE-LABEL', await page.locator('.rd4515-source').textContent(), 'Probe');
      check('RD-NOTE-SHOWN', /for this roll only; nothing is saved/.test(await page.locator('.rd4515-note').textContent()));
      check('RD-PREVIEW-BASE', await poolText(page), '5k3');
      await page.locator('.rd4515-opt').click();
      check('RD-PREVIEW-TICKED', await poolText(page), '6k4');
      check('RD-TICK-SURVIVES-RENDER', await boxes(page), [['qa-one:plus', true]]);
      check('RD-MODIFIER-ROW', /probe plus/.test(await page.locator('#rollPreviewBody').textContent()));
      let r = await confirmRoll(page, h);
      check('RD-REAL-DICE-DECLARED', [r.dice, r.kept], [6, 4]);
      check('RD-RESULT-NAMES-IT', /Probe/.test(r.body));
      await page.keyboard.press('Escape');
      h = await open(page, 'TRAIT', {traitName:'Agility'});
      check('RD-FRESH-NEXT-PREVIEW', await boxes(page), [['qa-one:plus', false]]);
      r = await confirmRoll(page, h);
      check('RD-REAL-DICE-NEXT-ROLL', [r.dice, r.kept], [5, 3]);
      await page.keyboard.press('Escape');
      h = await open(page, 'TRAIT', {traitName:'Agility'});
      await page.locator('.rd4515-opt').click();
      await page.locator('.rd4515-opt').click();
      check('RD-UNTICK', [await poolText(page), await armedNow(page)], ['5k3', []]);
      r = await confirmRoll(page, h);
      check('RD-REAL-DICE-UNTICKED', [r.dice, r.kept], [5, 3]);
      await page.keyboard.press('Escape');
    });

    await section('RD-LIFECYCLE', async () => {
      await reset(page); await probe(page, 'qa-one');
      let h = await open(page, 'TRAIT', {traitName:'Agility'});
      await page.locator('.rd4515-opt').click();
      check('RD-ARMED-WHILE-OPEN', await armedNow(page), ['qa-one:plus']);
      await cancelRoll(page, h);
      check('RD-CANCEL-DISARMS', await armedNow(page), []);
      h = await open(page, 'TRAIT', {traitName:'Agility'});
      await page.keyboard.press('Escape');
      await Promise.race([h.pending.catch(() => null), new Promise(r => setTimeout(r, 5000))]);
      check('RD-ESCAPE-DISARMS', await armedNow(page), []);
      // Declared and confirmed, then a roll that SKIPS the preview: nothing may leak into it.
      h = await open(page, 'TRAIT', {traitName:'Agility'});
      await page.locator('.rd4515-opt').click();
      await confirmRoll(page, h); await page.keyboard.press('Escape');
      const skipped = page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.rollWithModifiers('No preview', T.makeRollContext(T.ROLL_KINDS.TRAIT, {traitName:'Agility'}), 5, 3, {skipPreview:true}); });
      await skipped;
      const r = await readResult(page);
      check('RD-NO-LEAK-SKIPPED-PREVIEW', [r.dice, r.kept], [5, 3]);
      check('RD-NO-LEAK-NEW-CONTEXT', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.TRAIT, {traitName:'Agility'})).filter(m => /probe/.test(m.note)).length; }), 0);
      check('RD-SAME-CONTEXT-STILL-APPLIES', await page.evaluate(() =>
        window.__L5R_TEST__.getPreRollModifiers(window.__RD_CTX).filter(m => /probe/.test(m.note)).length), 1);
      await page.keyboard.press('Escape');
      const before = await page.evaluate(() => window.__L5R_TEST__.collectData());
      h = await open(page, 'TRAIT', {traitName:'Agility'});
      await page.locator('.rd4515-opt').click();
      check('RD-NOTHING-SAVED', await page.evaluate(() => window.__L5R_TEST__.collectData()), before);
      check('RD-NOT-IN-STORAGE', await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage)).includes('rd4515')), false);
      await cancelRoll(page, h);
    });

    await section('RD-SCOPE', async () => {
      await reset(page); await probe(page, 'qa-all', {kinds:['skill','attack','damage','spell','trait','ring','initiative','manual']});
      const offered = await page.evaluate(() => { const T = window.__L5R_TEST__;
        return Object.fromEntries(Object.entries(T.ROLL_KINDS).map(([k, v]) => [k, T.RD4515.offered(T.makeRollContext(v, {})).length])); });
      check('RD-DAMAGE-NEVER-OFFERED', offered.DAMAGE, 0);
      check('RD-OTHER-KINDS-DEFER-TO-PROVIDER', Object.entries(offered).filter(([k]) => k !== 'DAMAGE').every(([, n]) => n === 1));
      check('RD-DAMAGE-NEVER-ARMED', await page.evaluate(() => { const T = window.__L5R_TEST__; const c = T.makeRollContext(T.ROLL_KINDS.DAMAGE, {});
        T.RD4515.start(c); const toggled = T.RD4515.toggle('qa-all:plus', true); const mods = T.RD4515.modifiers(c).length; T.RD4515.cancel(); return [toggled, mods, T.RD4515.html(c)]; }), [false, 0, '']);
      await clearProviders(page); await probe(page, 'qa-one');
      const h = await open(page, 'ATTACK', {skillName:'Kenjutsu', traitName:'Agility'});
      check('RD-PROVIDER-SCOPE-RESPECTED', await page.locator('.rd4515-declare').count(), 0);
      check('RD-FOREIGN-TOGGLE-REFUSED', await page.evaluate(() => window.__L5R_TEST__.RD4515.toggle('qa-one:plus', true)), false);
      await cancelRoll(page, h);
      await clearProviders(page); await probe(page, 'qa-manual', {kinds:['manual']});
      const m = await open(page, 'MANUAL', {notation:'5k3'});
      await page.locator('.rd4515-opt').click();
      const r = await confirmRoll(page, m);
      check('RD-MANUAL-REAL-DICE', [r.dice, r.kept], [6, 4]);
      await page.keyboard.press('Escape');
    });

    await section('RD-MULTI', async () => {
      await reset(page);
      await probe(page, 'qa-one', {label:'First'});
      await probe(page, 'qa-two', {label:'Second', options:[['a', 'Second A'], ['b', 'Second B']]});
      const h = await open(page, 'TRAIT', {traitName:'Agility'});
      check('RD-GROUPED', await page.locator('.rd4515-source').allTextContents(), ['First', 'Second']);
      check('RD-ALL-UNCHECKED', (await boxes(page)).map(b => b[1]), [false, false, false]);
      for (const i of [0, 1, 2]) await page.locator('.rd4515-opt').nth(i).click();
      check('RD-STACK-PROVIDERS', await poolText(page), '8k6');
      await page.evaluate(() => window.__L5R_TEST__.RD4515.unregister('qa-two'));
      check('RD-UNREGISTER-DROPS-ARMED', await armedNow(page), ['qa-one:plus']);
      const r = await confirmRoll(page, h);
      check('RD-MULTI-REAL-DICE', [r.dice, r.kept], [6, 4]);
      await page.keyboard.press('Escape');
    });

    await section('RD-ROBUST', async () => {
      await reset(page);
      await probe(page, 'qa-broken', {throwOffers:true});
      await probe(page, 'qa-one');
      let h = await open(page, 'TRAIT', {traitName:'Agility'});
      check('RD-THROWING-OFFERS-ISOLATED', await boxes(page), [['qa-one:plus', false]]);
      await cancelRoll(page, h);
      await clearProviders(page); await probe(page, 'qa-badmods', {throwModifiers:true});
      h = await open(page, 'TRAIT', {traitName:'Agility'});
      await page.locator('.rd4515-opt').click();
      const r = await confirmRoll(page, h);
      check('RD-THROWING-MODIFIERS-ROLL-PROCEEDS', [r.dice, r.kept], [5, 3]);
      await page.keyboard.press('Escape');
      await clearProviders(page);
      await page.evaluate(() => window.__L5R_TEST__.RD4515.register('qa-junk', {offers:() => [null, {key:'Bad Key', label:'x'}, {key:'ok'}, 7, {key:'good', label:'Good'}], modifiers:() => [null, {rolledDelta:'9', keptDelta:NaN, note:'junk'}]}));
      check('RD-JUNK-OFFERS-FILTERED', await page.evaluate(() => { const T = window.__L5R_TEST__; return T.RD4515.offered(T.makeRollContext(T.ROLL_KINDS.TRAIT, {})).map(o => o.key); }), ['qa-junk:good']);
      check('RD-JUNK-DELTAS-ZEROED', await page.evaluate(() => { const T = window.__L5R_TEST__; const c = T.makeRollContext(T.ROLL_KINDS.TRAIT, {});
        T.RD4515.start(c); T.RD4515.toggle('qa-junk:good', true); const m = T.RD4515.modifiers(c).map(x => [x.rolledDelta, x.keptDelta, x.totalDelta, x.source]); T.RD4515.cancel(); return m; }), [[0, 0, 0, 'adv-config']]);
      await clearProviders(page);
      const hostile = '<img src=x onerror="window.RD_INJECTED=1"> & "Q"';
      await probe(page, 'qa-text', {label:hostile, options:[['x', hostile]]});
      h = await open(page, 'TRAIT', {traitName:'Agility'});
      check('RD-TEXT-ESCAPED', await page.evaluate(() => !window.RD_INJECTED && !document.querySelector('#rollPreviewBody img')));
      check('RD-TEXT-VISIBLE', (await page.locator('.rd4515-opt span').textContent()) === hostile);
      await cancelRoll(page, h);
    });

    await section('RD-GEOMETRY', async () => {
      for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({width, height:900});
        await reset(page);
        await probe(page, 'qa-long', {label:'AnUnbrokenProviderName'.repeat(6), options:[['x', 'Contested against ' + 'AnUnbrokenFactionName'.repeat(8) + ' — apply +1k1']]});
        const h = await open(page, 'TRAIT', {traitName:'Agility'});
        const g = await page.evaluate(() => {
          const block = document.querySelector('.rd4515-declare'), host = document.getElementById('rollPreviewBody').getBoundingClientRect();
          const inside = [...block.querySelectorAll('*')].every(el => { const r = el.getBoundingClientRect(); return r.width === 0 || (r.left >= host.left - 1 && r.right <= host.right + 1); });
          const opt = block.querySelector('.rd4515-opt'), cs = getComputedStyle(opt);
          return {inside, noOverflow:block.scrollWidth <= block.clientWidth + 1, target:opt.getBoundingClientRect().height >= 32,
            readable:parseFloat(cs.fontSize) >= 12 && cs.textTransform === 'none', labelled:block.querySelector('input').labels.length === 1};
        });
        check('RD-GEOMETRY-' + width, g, {inside:true, noOverflow:true, target:true, readable:true, labelled:true});
        await cancelRoll(page, h);
      }
      await page.setViewportSize({width:375, height:812});
      await reset(page);
    });
    check('RD-BROWSER-ERRORS', errors, []);
  } finally { await browser.close(); }
}
main().catch(error => check('RD-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('RD4515_QA_RESULT=' + JSON.stringify({passed, total:results.length, failed:results.length - passed}));
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
