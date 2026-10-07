/* Real-browser acceptance tests for Phase 4.5.29 Wound Entries (Part I).
 * Rules from the Core Rulebook (7 October 2026) and the owner's rulings of the same day:
 *   Strength of the Earth (p.154): each Wound Rank's penalty is 3 lower, never below none.
 *   Low Pain Threshold (p.160): each Wound Rank with a penalty gives 5 more; Healthy stays at none.
 *   Both: both apply. Bad Health (p.156): Earth counts one lower for the Wound Ranks, never below 1.
 *   Permanent Wound (p.161): Healthy is always full -- every rank's limit drops by Healthy's.
 *
 * DELIBERATELY INDEPENDENT OF HOW THE SHEET CALCULATES WOUNDS. The owner may change the wound core
 * later (the Core Rulebook p.82 gives Healthy Earth x5, the sheet gives it Earth x2). So every
 * expected Wound Rank limit and penalty here is worked out FROM THE CORE'S OWN FUNCTIONS
 * (WND4529.coreThresholds / corePenalty / coreFormat, the bindings the release wrapped) by applying
 * the rule to them; only two book anchors (Nicked's +3 and Grazed's +5 from the Core penalty table)
 * are absolute, and they test sizes, never the sign. The CONTRACT section fails loudly if the
 * core stops doing what the release relies on -- see THE CONTRACT at the top of the fragment.
 * node wound-entries-harness.js <sheet.html>
 */
'use strict';
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const path = require('path');
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id + '-EXCEPTION', String(error.stack || error), 'no exception'); }
}
const SOTE = 'Strength of the Earth', LPT = 'Low Pain Threshold', BH = 'Bad Health', PW = 'Permanent Wound';

// In-page helpers: set Earth (through Stamina and Willpower), the entries, and Wounds taken.
async function setup(page, {adv = [], dis = [], earth = 2} = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  return page.evaluate(({adv, dis, earth}) => {
    document.querySelectorAll('.roll-modal-overlay').forEach(o => { if (o.style.display === 'flex') o.style.display = 'none'; });
    const T = window.__L5R_TEST__;
    T.closeAdvConfigModal?.(); T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); T.saveSchoolsList?.([]);
    for (const id of ['trait_stamina', 'trait_willpower']) document.getElementById(id).value = earth;
    const add = (name, list) => { const lib = (list === 'advList' ? T.ADV_LIBRARY : T.DISADV_LIBRARY).find(x => x.name === name);
      document.getElementById(list).appendChild(T.makeEntry({name, cost:lib ? lib.cost : 0, desc:lib ? lib.desc : ''}, true)); };
    adv.forEach(n => add(n, 'advList')); dis.forEach(n => add(n, 'disadvList'));
    document.getElementById('f_woundsTaken').value = 0;
    T.recalcAll();
    return +document.getElementById('ring_earth').value;
  }, {adv, dis, earth});
}
const setTaken = (page, n) => page.evaluate(n => { const e = document.getElementById('f_woundsTaken'); e.value = n;
  e.dispatchEvent(new Event('input', {bubbles:true})); }, n);
// The level the sheet shows, the penalty a roll gets, and the core's own penalty at that moment.
const state = page => page.evaluate(() => { const T = window.__L5R_TEST__;
  return {level:T.getCurrentWoundLevelName(), penalty:T.getWoundPenalty(), core:T.WND4529.corePenalty(),
    summary:document.getElementById('woundSummaryLine').textContent, qa:document.getElementById('qaWoundsValue')?.textContent || null}; });
// The core's limits for an Earth, and the sheet's (wrapped) limits.
const limits = (page, earth) => page.evaluate(earth => { const T = window.__L5R_TEST__;
  return {core:T.WND4529.coreThresholds(earth), sheet:T.computeWoundThresholds(earth), levels:T.WOUND_LEVELS.map(l => l.name)}; }, earth);
// For each level: the Wounds total that lands there under the given limits (its own limit).
const firstAtEachLevel = lim => lim.map((n, i) => (i === 0 ? 0 : lim[i - 1] + 1));

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({viewport:{width:375, height:812}});
    page.setDefaultTimeout(8000);
    page.on('pageerror', e => errors.push(String(e)));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() &&
      (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready));
    await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());

    await section('WE-START', async () => {
      check('WE-SEAM', await page.evaluate(() => window.__L5R_TEST__.WOUND_ENTRIES_ENABLED === true && !!window.__L5R_TEST__.WND4529));
      check('WE-REGISTRY-STILL-SEVEN', await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.length), 7);
      check('WE-CATALOGUE', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return [T.ADV_LIBRARY.some(e => e.name === 'Strength of the Earth'),
          ['Low Pain Threshold', 'Bad Health', 'Permanent Wound'].every(n => T.DISADV_LIBRARY.some(e => e.name === n))]; }), [true, true]);
    });

    // ---- The contract with the wound core: these fail loudly if the core changes shape ----
    await section('WE-CONTRACT', async () => {
      check('WE-CONTRACT-ADAPTERS-INSTALLED', await page.evaluate(() => { const T = window.__L5R_TEST__, W = T.WND4529;
        return [typeof W.coreThresholds, typeof W.corePenalty, typeof W.coreFormat,
          T.computeWoundThresholds !== W.coreThresholds, T.getWoundPenalty !== W.corePenalty, T.formatWoundPenalty !== W.coreFormat]; }),
        ['function', 'function', 'function', true, true, true]);
      check('WE-CONTRACT-THRESHOLDS-SHAPE', await page.evaluate(() => { const T = window.__L5R_TEST__;
        return [1, 2, 3, 4, 5, 6].every(e => { const t = T.WND4529.coreThresholds(e);
          return Array.isArray(t) && t.length === T.WOUND_LEVELS.length && t.every((n, i) => Number.isFinite(n) && (i === 0 || n >= t[i - 1])); }); }));
      await setup(page, {earth:2});
      const lim = (await limits(page, 2)).core;
      await setTaken(page, 0);
      const healthy = (await state(page)).core;
      await setTaken(page, lim[0] + 1);
      const nicked = (await state(page)).core;
      check('WE-CONTRACT-PENALTY-SIGNED-NUMBER', [healthy, typeof nicked === 'number' && Number.isFinite(nicked) && nicked !== 0], [0, true]);
      check('WE-CONTRACT-FORMAT-READS-PEN', await page.evaluate(() => { const T = window.__L5R_TEST__;
        const n = T.WOUND_LEVELS[1]; return [typeof T.WND4529.coreFormat(n), /^[+-]?\d+$/.test(n.pen)]; }), ['string', true]);
      // Book anchors (Core penalty table): Nicked +3, Grazed +5 -- sizes only, never the sign.
      await setTaken(page, lim[1] + 1);
      check('WE-CONTRACT-BOOK-SIZES', [Math.abs(nicked), Math.abs((await state(page)).core)], [3, 5]);
    });

    // ---- No entry: every adapter returns exactly what the core returns ----
    await section('WE-IDENTITY', async () => {
      const cases = [['none', [], []], ['on the wrong lists', [LPT, BH, PW], [SOTE]], ['renamed', [], []]];
      for (const [label, adv, dis] of cases) {
        const tag = label.toUpperCase().replace(/ /g, '-');
        const sames = [];
        for (const earth of [1, 2, 3, 4, 5, 6]) {
          await setup(page, {adv, dis, earth});
          if (label === 'renamed') await page.evaluate(() => { const T = window.__L5R_TEST__;
            ['Strength of the Earth II'].forEach(n => document.getElementById('advList').appendChild(T.makeEntry({name:n, cost:3, desc:''}, true)));
            ['Bad Health (old)', 'Permanent Wounds'].forEach(n => document.getElementById('disadvList').appendChild(T.makeEntry({name:n, cost:4, desc:''}, true)));
            T.recalcAll(); });
          const lim = await limits(page, earth);
          let ok = JSON.stringify(lim.core) === JSON.stringify(lim.sheet);
          for (let taken = 0; taken <= lim.core[lim.core.length - 1] + 2 && ok; taken++) {
            await setTaken(page, taken);
            const s = await state(page);
            ok = s.penalty === s.core;
          }
          ok = ok && await page.evaluate(() => { const T = window.__L5R_TEST__;
            return T.WOUND_LEVELS.every(l => T.formatWoundPenalty(l) === T.WND4529.coreFormat(l)); });
          sames.push(ok);
        }
        check('WE-IDENTITY-' + tag, sames, [true, true, true, true, true, true]);
      }
      await setup(page, {earth:3});
      check('WE-IDENTITY-NO-ROW-LINES', await page.evaluate(() => document.querySelectorAll('.wound4529-note').length), 0);
      check('WE-IDENTITY-NO-ROLL-LINE', await page.evaluate(() => { const T = window.__L5R_TEST__;
        document.getElementById('f_woundsTaken').value = 9; T.renderWounds();
        return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.TRAIT, {traitName:'Agility'})).filter(m => m.informational && m.label === 'Wound Penalty').length; }), 0);
    });

    // ---- Penalties: every level, against the core's own penalty ----
    const penaltyRun = async (adv, dis, rule) => {
      await setup(page, {adv, dis, earth:2});
      const lim = (await limits(page, 2)).core;
      const out = [];
      for (const taken of firstAtEachLevel(lim)) {
        await setTaken(page, taken);
        const s = await state(page);
        const want = rule(Math.abs(s.core));
        out.push([s.level, Math.abs(s.penalty) === want && (s.penalty === 0 || Math.sign(s.penalty) === Math.sign(s.core))]);
      }
      await setTaken(page, lim[lim.length - 1] + 3);   // past the last limit: Out
      const s = await state(page);
      out.push([s.level, Math.abs(s.penalty) === rule(Math.abs(s.core))]);
      return out;
    };
    const allTrue = levels => levels.map(l => [l, true]);
    await section('WE-PENALTY', async () => {
      const levels = await page.evaluate(() => window.__L5R_TEST__.WOUND_LEVELS.map(l => l.name));
      // One entry per level (its first Wounds total), then one past the last limit (still Out).
      const expectLevels = allTrue([...levels, 'Out']);
      check('WE-STRENGTH-EVERY-LEVEL', await penaltyRun([SOTE], [], s => s > 0 ? Math.max(0, s - 3) : s), expectLevels);
      check('WE-LOW-PAIN-EVERY-LEVEL', await penaltyRun([], [LPT], s => s > 0 ? s + 5 : s), expectLevels);
      check('WE-BOTH-EVERY-LEVEL', await penaltyRun([SOTE], [LPT], s => s > 0 ? Math.max(0, s + 5 - 3) : s), expectLevels);
      check('WE-DUPLICATE-ROWS-COUNT-ONCE', await penaltyRun([SOTE, SOTE], [LPT, LPT], s => s > 0 ? Math.max(0, s + 2) : s), expectLevels);
      // Book anchors: Nicked +3 -> none with Strength of the Earth; Grazed +5 -> 2; Nicked -> 8 with Low Pain Threshold.
      const at = async (adv, dis, level) => { await setup(page, {adv, dis, earth:2}); const lim = (await limits(page, 2)).core;
        await setTaken(page, firstAtEachLevel(lim)[level]); return Math.abs((await state(page)).penalty); };
      check('WE-BOOK-ANCHORS', [await at([SOTE], [], 1), await at([SOTE], [], 2), await at([], [LPT], 1), await at([], [LPT], 0)], [0, 2, 8, 0]);
      // The rule itself, at sizes today's penalty table never produces but a changed core might:
      // Strength of the Earth never takes a penalty below none, and Low Pain Threshold never gives
      // a rank with no penalty one.
      await setup(page, {adv:[SOTE], earth:2});
      check('WE-STRENGTH-NEVER-BELOW-NONE', await page.evaluate(() => [1, 2, 3, 4].map(n => window.__L5R_TEST__.WND4529.adjustSize(n))), [0, 0, 0, 1]);
      await setup(page, {dis:[LPT], earth:2});
      check('WE-LOW-PAIN-NOT-ON-NONE', await page.evaluate(() => [0, 1].map(n => window.__L5R_TEST__.WND4529.adjustSize(n))), [0, 6]);
    });

    // ---- The Wound Ranks: Bad Health and Permanent Wound, against the core's own limits ----
    await section('WE-RANKS', async () => {
      const shift = t => t.map(n => Math.max(0, n - t[0]));
      const run = async (dis, expected) => { const out = [];
        for (const earth of [1, 2, 3, 4, 5]) { await setup(page, {dis, earth}); const lim = await limits(page, earth);
          out.push(JSON.stringify(lim.sheet) === JSON.stringify(await page.evaluate(({earth, code}) => { const T = window.__L5R_TEST__;
            return new Function('core', 'earth', code)(T.WND4529.coreThresholds, earth); }, {earth, code:expected}))); }
        return out; };
      check('WE-BAD-HEALTH-EARTH-ONE-LOWER', await run([BH], 'return core(Math.max(1, earth - 1));'), [true, true, true, true, true]);
      check('WE-PERMANENT-HEALTHY-ALWAYS-FULL', await run([PW], 'const t = core(earth); return t.map(n => Math.max(0, n - t[0]));'), [true, true, true, true, true]);
      check('WE-BAD-HEALTH-AND-PERMANENT', await run([BH, PW], 'const t = core(Math.max(1, earth - 1)); return t.map(n => Math.max(0, n - t[0]));'), [true, true, true, true, true]);
      // What a player sees: with Permanent Wound the first Wound makes you Nicked; with Bad Health
      // at Earth 3 a Wounds total Healthy holds at Earth 3 but not at Earth 2 makes you Nicked.
      await setup(page, {dis:[PW], earth:2});
      await setTaken(page, 0); const zero = (await state(page)).level;
      await setTaken(page, 1); const one = (await state(page)).level;
      check('WE-PERMANENT-FIRST-WOUND-NICKED', [zero, one], ['Healthy', 'Nicked']);
      const core3 = (await limits(page, 3)).core, core2 = (await limits(page, 2)).core;
      await setup(page, {dis:[BH], earth:3});
      await setTaken(page, core2[0] + 1);
      const withBH = (await state(page)).level;
      await setup(page, {earth:3});
      await setTaken(page, core2[0] + 1);
      check('WE-BAD-HEALTH-LEVEL-SHOWN', [withBH, (await state(page)).level, core2[0] + 1 <= core3[0]], ['Nicked', 'Healthy', true]);
      // The track's stepper stops at the shrunken maximum.
      await setup(page, {dis:[PW], earth:2});
      const max = (await limits(page, 2)).sheet.slice(-1)[0];
      await setTaken(page, max);
      check('WE-STEPPER-STOPS-AT-NEW-MAX', await page.evaluate(() => { document.getElementById('woundStepUp').click();
        return [+document.getElementById('f_woundsTaken').value, document.getElementById('woundStepUp').disabled]; }), [max, true]);
    });

    // ---- The track, its pop-up and the Quick Access panel say what changed ----
    await section('WE-DISPLAY', async () => {
      await setup(page, {adv:[SOTE], earth:2});
      const lim = (await limits(page, 2)).sheet;
      await setTaken(page, firstAtEachLevel(lim)[2]);   // Grazed
      const expected = await page.evaluate(taken => { const T = window.__L5R_TEST__, g = T.WOUND_LEVELS[2];
        const size = Math.abs(Number(g.pen)), adjusted = Math.max(0, size - 3);
        const text = T.WND4529.coreFormat(Object.assign({}, g, {pen:(g.pen.trim().startsWith('-') ? '-' : '') + adjusted})) + ' (Strength of the Earth −3)';
        const max = T.computeWoundThresholds(+document.getElementById('ring_earth').value).slice(-1)[0];
        return {text, summary:g.name + ' — ' + text + ' — ' + taken + ' of ' + max + ' wound points'}; }, firstAtEachLevel(lim)[2]);
      const s = await state(page);
      check('WE-DISPLAY-SUMMARY', s.summary, expected.summary);
      check('WE-DISPLAY-QUICK-ACCESS-MIRRORS', s.qa === null || s.qa === s.summary);
      check('WE-DISPLAY-SEGMENT-AND-POPUP', await page.evaluate(() => { const seg = document.querySelectorAll('#woundBar .wound-seg')[2];
        seg.click(); const pen = document.getElementById('woundInfoPen').textContent; document.getElementById('woundInfoClose').click();
        return [seg.getAttribute('aria-label').includes('(Strength of the Earth −3)'), pen.includes('(Strength of the Earth −3)')]; }), [true, true]);
      check('WE-DISPLAY-CANCELLED-READS-NONE', await page.evaluate(() => { const T = window.__L5R_TEST__, n = T.WOUND_LEVELS[1];
        return T.formatWoundPenalty(n) === T.WND4529.coreFormat(Object.assign({}, n, {pen:'—'})) + ' (Strength of the Earth −3)'; }));
      check('WE-DISPLAY-HEALTHY-AND-OUT-UNTOUCHED', await page.evaluate(() => { const T = window.__L5R_TEST__, L = T.WOUND_LEVELS;
        return [L[0], L[L.length - 1]].map(l => T.formatWoundPenalty(l) === T.WND4529.coreFormat(l)); }), [true, true]);
      await setup(page, {adv:[SOTE], dis:[LPT], earth:2});
      check('WE-DISPLAY-BOTH-NAMED', await page.evaluate(() => /\(Low Pain Threshold \+5, Strength of the Earth −3\)$/.test(
        window.__L5R_TEST__.formatWoundPenalty(window.__L5R_TEST__.WOUND_LEVELS[1]))));
    });

    // ---- Rolls: the penalty that reaches the dice, and the line that explains it ----
    await section('WE-ROLLS', async () => {
      const roll = (kind, ctx) => page.evaluate(({kind, ctx}) => { const T = window.__L5R_TEST__;
        const mods = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], ctx));
        return {wound:mods.filter(m => m.label === 'Wound Penalty' && !m.informational).map(m => m.totalDelta),
          line:mods.filter(m => m.label === 'Wound Penalty' && m.informational).map(m => m.display)}; }, {kind, ctx});
      await setup(page, {adv:[SOTE], earth:2});
      const lim = (await limits(page, 2)).sheet;
      await setTaken(page, firstAtEachLevel(lim)[2]);
      const core = (await state(page)).core;
      check('WE-ROLL-GRAZED-STRENGTH', await roll('TRAIT', {traitName:'Agility'}),
        {wound:[Math.sign(core) * (Math.abs(core) - 3)], line:[Math.abs(core) + ' → ' + (Math.abs(core) - 3) + ' (Strength of the Earth −3)']});
      await setTaken(page, firstAtEachLevel(lim)[1]);
      const nickedCore = (await state(page)).core;
      check('WE-ROLL-NICKED-CANCELLED-STILL-EXPLAINED', await roll('SKILL', {skillName:'Athletics', traitName:'Strength', skillRank:2}),
        {wound:[], line:[Math.abs(nickedCore) + ' → 0 (Strength of the Earth −3)']});
      check('WE-ROLL-DAMAGE-UNTOUCHED', await roll('DAMAGE', {skillName:'Kenjutsu'}), {wound:[], line:[]});
      await setup(page, {dis:[LPT], earth:2});
      await setTaken(page, firstAtEachLevel((await limits(page, 2)).sheet)[1]);
      const lptCore = (await state(page)).core;
      check('WE-ROLL-LOW-PAIN', await roll('SPELL', {spellName:'Sense', element:'Air'}),
        {wound:[Math.sign(lptCore) * (Math.abs(lptCore) + 5)], line:[Math.abs(lptCore) + ' → ' + (Math.abs(lptCore) + 5) + ' (Low Pain Threshold +5)']});
      // The real dice: a 5k3 Trait roll at Grazed with Strength of the Earth. Kept dice 7+6+5 = 18,
      // plus the core's own Grazed penalty with its size cut by 3 and its sign kept.
      await setup(page, {adv:[SOTE], earth:2});
      await setTaken(page, firstAtEachLevel((await limits(page, 2)).sheet)[2]);
      const grazedCore = (await state(page)).core;
      const pending = page.evaluate(() => { const T = window.__L5R_TEST__; let i = 0; const seq = [6, 4, 7, 3, 5];
        Math.random = () => ((seq[i++ % seq.length] - 0.5) / 10);
        return T.rollWithModifiers('Probe', T.makeRollContext(T.ROLL_KINDS.TRAIT, {traitName:'Agility'}), 5, 3, {skipPreview:true}); });
      await pending;
      const total = await page.evaluate(() => +document.getElementById('rollTotalDisplay').textContent);
      await page.keyboard.press('Escape');
      check('WE-ROLL-REAL-DICE-TOTAL', total, 18 + Math.sign(grazedCore) * (Math.abs(grazedCore) - 3));
    });

    // ---- The row lines, following typed changes (no forced recalc) ----
    await section('WE-ROWS', async () => {
      await setup(page, {adv:[SOTE], dis:[LPT, BH, PW], earth:3});
      const lines = () => page.evaluate(() => [...document.querySelectorAll('#advList .entry, #disadvList .entry')]
        .map(d => [d.querySelector('.en-name').value, d.querySelector('.wound4529-note')?.textContent || null]));
      check('WE-ROW-LINES', await lines(), [
        [SOTE, 'In effect: every Wound Rank\'s penalty is 3 lower, never below none.'],
        [LPT, 'In effect: every Wound Rank with a penalty gives 5 more (Healthy stays at none).'],
        [BH, 'In effect: your Wound Ranks use Earth 2 (yours is 3). For resisting disease, count your Earth one lower yourself: the sheet makes no disease rolls.'],
        [PW, 'In effect: Healthy is always full, so your first Wound makes you Nicked.']]);
      await page.evaluate(() => { for (const id of ['trait_stamina', 'trait_willpower']) { const e = document.getElementById(id); e.value = 1;
        e.dispatchEvent(new Event('input', {bubbles:true})); e.dispatchEvent(new Event('change', {bubbles:true})); } });
      check('WE-ROW-BAD-HEALTH-FOLLOWS-EARTH', (await lines())[2][1],
        'In effect: your Wound Ranks already use Earth 1, the lowest they can use. For resisting disease, count your Earth one lower yourself: the sheet makes no disease rolls.');
      await page.evaluate(() => { const n = [...document.querySelectorAll('#disadvList .en-name')].find(e => e.value === 'Permanent Wound');
        n.value = 'Permanent Wounds'; n.dispatchEvent(new Event('input', {bubbles:true})); });
      check('WE-ROW-RENAMED-LOSES-LINE', (await lines())[3][1], null);
      check('WE-NOTHING-SAVED', await page.evaluate(() => /wound4529|In effect:/.test(JSON.stringify(window.__L5R_TEST__.collectData()))), false);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('play'));
      check('WE-ROW-LINES-IN-PLAY', await page.evaluate(() => [...document.querySelectorAll('.wound4529-note')].filter(n => !!n.offsetParent).length), 3);
      await page.evaluate(() => window.__L5R_TEST__.MODES12?.set('management'));
    });

    await section('WE-LAYOUT', async () => {
      for (const width of [320, 768]) {
        await page.setViewportSize({width, height:900});
        await setup(page, {adv:[SOTE], dis:[LPT, BH, PW], earth:3});
        await page.evaluate(async () => { const C = window.__L5R_CAROUSEL__; const pages = [...document.querySelectorAll('[data-car-slug]')];
          C.goToTab(pages.findIndex(p => p.contains(document.getElementById('advList')))); await C.whenSettled(); });
        check('WE-LAYOUT-' + width, await page.evaluate(() => [...document.querySelectorAll('.wound4529-note')].map(n => {
          const e = n.closest('.entry').getBoundingClientRect(), r = n.getBoundingClientRect();
          return r.width > 0 && r.left >= e.left - 1 && r.right <= e.right + 1 && n.scrollWidth <= n.clientWidth + 1 && getComputedStyle(n).fontSize !== getComputedStyle(n.closest('.entry')).fontSize; })),
          [true, true, true, true]);
      }
      await page.setViewportSize({width:375, height:812});
    });
  } finally {
    check('WE-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('WE-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
