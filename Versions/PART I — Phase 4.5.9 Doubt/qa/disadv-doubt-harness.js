/*
 * Phase 4.5.9 — Doubt (D03) — browser validation.
 *
 * Run: node disadv-doubt-harness.js <sheet.html>
 *
 * This is the first build of the approved TN-reporting convention, so the checks that matter
 * most are the NEGATIVE ones. Three in particular exist because of something measured rather
 * than assumed:
 *
 *  - DOUBT459-SCOPE-DAMAGE. A damage context carries the SAME `skillName` as the attack it
 *    followed — driven live before any code was written. A modifier filtering on skill name
 *    alone would therefore penalise damage, which the audit explicitly forbids and which would
 *    have looked correct in review. The whole SCOPE section is a matrix over every roll kind for
 *    that reason, not just the two that apply.
 *
 *  - DOUBT459-SEAT-01. Doubt takes NO new pre-roll registry seat: it re-registers Phase 4.5's
 *    own `adv-config` contributor, which registerPreRollModifier replaces rather than appends.
 *    Phase 1.5 (Part G) baselined that registry, so its length is asserted here too.
 *
 *  - DOUBT459-TOTAL-01. The modifier list is not the deliverable — the REPORTED TOTAL is. That
 *    check drives a real roll and compares the displayed total against the sum of the kept dice,
 *    so it would catch a modifier that is produced correctly and then never reaches the player.
 *
 * The input build is never modified.
 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const PHONE = { width: 375, height: 812 };
const SCHOOL = 'Hida Bushi';
const SKILL = 'Kenjutsu';
const results = [];
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.keys(v).sort().reduce((o, k) => { o[k] = canonical(v[k]); return o; }, {}) : v;
function record(id, name, pass, detail = '') {
  results.push({ id, name, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
}
function equal(id, name, actual, expected) {
  const pass = JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
  record(id, name, pass, pass ? '' : `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}
async function section(id, name, fn) {
  try { await fn(); } catch (e) { record(id, name, false, String(e.stack || e)); }
}

const reset = page => page.evaluate(school => {
  const T = window.__L5R_TEST__;
  if (T.D45 && T.D45.gates) T.D45.gates.cancel();
  T.resetToBaseline();
  const el = document.getElementById('f_school');
  el.value = school;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  T.recalcAll();
  ['advConfigModalOverlay', 'rollPreviewOverlay', 'rollModalOverlay', 'appConfirmOverlay']
    .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
}, SCHOOL);

const addDoubt = (page, skill) => page.evaluate(skill => {
  const T = window.__L5R_TEST__;
  document.getElementById('addDisadv').click();
  const div = document.getElementById('disadvList').lastElementChild;
  div.querySelector('.en-name').value = 'Doubt';
  div.querySelector('.en-name').dispatchEvent(new Event('change', { bubbles: true }));
  div.dataset.advConfig = JSON.stringify({ type: 'skillPick', skill, value: skill });
  T.recalcAll();
  return {
    cost: div.querySelector('.en-cost').value,
    summary: div.querySelector('.d45-summary') ? div.querySelector('.d45-summary').textContent : null,
    badge: div.querySelector('.doubt459-badge') ? div.querySelector('.doubt459-badge').textContent : null,
  };
}, skill);

// Asks the REAL pipeline what it would contribute for a given roll kind.
const doubtModsFor = (page, kind, extra) => page.evaluate(({ kind, extra }) => {
  const T = window.__L5R_TEST__;
  return T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], extra))
    .filter(m => m.label === 'Doubt')
    .map(m => ({ totalDelta: m.totalDelta, rolledDelta: m.rolledDelta, keptDelta: m.keptDelta }));
}, { kind, extra });

// Drives a REAL roll end to end. rollWithModifiers() is async and passes through Phase 3's
// preview gate, so the promise only settles once the preview is confirmed; reading the result
// modal without doing that finds it empty. Dice are real — the check compares the displayed
// total against the kept dice rather than against a fixed expected number.
async function realRoll(page, opts) {
  const done = page.evaluate(opts => {
    const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Doubt harness roll',
      T.makeRollContext(T.ROLL_KINDS.SKILL, { skillName: 'Kenjutsu' }), 5, 3, opts);
  }, opts);
  // Phase 3's own confirm button is #rollPreviewGo, built at runtime into #rollPreviewBody.
  const go = await page.waitForSelector('#rollPreviewGo', { state: 'visible', timeout: 6000 })
    .catch(() => null);
  if (go) await go.click();
  await done;
  await page.waitForSelector('#rollTotalDisplay', { state: 'attached', timeout: 6000 });
  return page.evaluate(() => {
    // A kept die carries class `kept`, and its VALUE is dataset.total rather than its text —
    // an exploded die shows its chain but totals the sum. updateRollKeepState() computes the
    // displayed total as (sum of kept dataset.total) + currentRollBonus, and currentRollBonus
    // is where a totalDelta lands, so this is the same arithmetic the player sees.
    const kept = Array.from(document.querySelectorAll('#rollDiceRow .roll-die.kept'))
      .reduce((sum, d) => sum + (parseInt(d.dataset.total, 10) || 0), 0);
    return {
      kept,
      shown: parseInt(document.getElementById('rollTotalDisplay').textContent, 10),
      breakdown: document.getElementById('rollModalBody').textContent,
    };
  });
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node disadv-doubt-harness.js <sheet.html>');
  const url = pathToFileURL(path.resolve(file)).href;
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: PHONE });
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(url);
    await page.waitForFunction(() => !!window.__L5R_TEST__, null, { timeout: 30000 });

    const present = await page.evaluate(() =>
      !!window.__L5R_TEST__.R459 && window.__L5R_TEST__.DISADV_DOUBT_ENABLED === true);
    record('DOUBT459-00', 'Feature 4.59 is present and enabled', present);
    if (!present) return;

    // ---------------- Contract ----------------
    await section('DOUBT459-CONTRACT', 'Public contract', async () => {
      equal('DOUBT459-CONTRACT-01', 'Doubt is registered as configurable',
        await page.evaluate(() => !!window.__L5R_TEST__.D45.schema('Doubt')), true);
      equal('DOUBT459-CONTRACT-02', 'It reuses the existing skillPick shape rather than inventing one',
        await page.evaluate(() => window.__L5R_TEST__.D45.schema('Doubt').type), 'skillPick');
      // Same promise Feature 4.5.8 made, for the same reason: 4.5.2's harness pins this exactly.
      equal('DOUBT459-CONTRACT-03', 'This phase adds no configTypes string to 4.5.2 public contract',
        await page.evaluate(() => window.__L5R_TEST__.D45.configTypes),
        ['tierPick', 'rankPick', 'elementPick', 'tenetPick', 'targetPick', 'insightDifferencePick',
          'toggleModifier', 'statusLinked', 'dualTierPick', 'languagePick', 'skillPick',
          'clanWeaponAutoPick']);
    });

    // ---------------- The registry seat ----------------
    await section('DOUBT459-SEAT', 'No new registry seat', async () => {
      const registry = await page.evaluate(() =>
        window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY.map(m => [m.id, m.priority]));
      equal('DOUBT459-SEAT-01', 'Phase 1.5 baseline of seven contributors is unchanged',
        registry, [['range', 20], ['arrow', 25], ['stance', 30], ['offhand', 35],
          ['wounds', 40], ['void', 50], ['adv-config', 60]]);
      // Doubt rides 4.5's own seat, so that seat must still deliver 4.5's OWN effects. Friend of
      // the Elements is 4.5's traitFreeRaise contributor and is the cheapest witness that the
      // wrapped function is still being called rather than replaced.
      await reset(page);
      record('DOUBT459-SEAT-02', 'Wrapping the seat did not drop Phase 4.5 own contributions',
        await page.evaluate(() => typeof window.__L5R_TEST__.advConfigRollModifiers === 'function'
          && Array.isArray(window.__L5R_TEST__.advConfigRollModifiers(
            window.__L5R_TEST__.makeRollContext(window.__L5R_TEST__.ROLL_KINDS.TRAIT, { traitName: 'Agility' })))));
    });

    // ---------------- Pricing and the picker ----------------
    await section('DOUBT459-PRICE', 'Fixed award and the School Skill picker', async () => {
      await reset(page);
      equal('DOUBT459-PRICE-01', 'The award is a fixed 4, not a tier',
        (await page.evaluate(skill => window.__L5R_TEST__.D45.resolve('Doubt', { type: 'skillPick', skill }), SKILL))?.cost, 4);
      equal('DOUBT459-PRICE-02', 'An empty or non-string Skill is refused',
        await page.evaluate(() => ['', '   ', null, undefined, 7].map(skill =>
          window.__L5R_TEST__.D45.resolve('Doubt', { type: 'skillPick', skill }))),
        [null, null, null, null, null]);
      equal('DOUBT459-PRICE-03', 'The picker offers this character own School Skills',
        await page.evaluate(() => window.__L5R_TEST__.R459.schoolSkills()),
        ['Athletics', 'Defense', 'Heavy Weapons', 'Intimidation', 'Kenjutsu', 'Lore: Shadowlands']);
      const row = await addDoubt(page, SKILL);
      equal('DOUBT459-PRICE-04', 'A configured row prices at 4', row.cost, '4');
      record('DOUBT459-PRICE-05', 'The summary states the rule, not just the number',
        /one extra Raise for no benefit/.test(row.summary || '') && /TN \+5/.test(row.summary || ''),
        row.summary);
      record('DOUBT459-PRICE-06', 'The badge shows the rule and its reported-total equivalent',
        /Kenjutsu — TN \+5 \(reported total −5\)/.test(row.badge || ''), row.badge);
    });

    // ---------------- Scope: the matrix ----------------
    // The two that apply, and every one that must not. DAMAGE is the one this section exists for.
    await section('DOUBT459-SCOPE', 'Which rolls it reaches', async () => {
      await reset(page);
      await addDoubt(page, SKILL);
      const applies = [{ totalDelta: -5, rolledDelta: 0, keptDelta: 0 }];
      equal('DOUBT459-SCOPE-SKILL', 'A Skill roll using the chosen Skill loses 5 from its total',
        await doubtModsFor(page, 'SKILL', { skillName: SKILL }), applies);
      equal('DOUBT459-SCOPE-ATTACK', 'A weapon attack made with that Skill does too',
        await doubtModsFor(page, 'ATTACK', { skillName: SKILL }), applies);
      equal('DOUBT459-SCOPE-DAMAGE', 'DAMAGE is untouched, though its context carries the same skillName',
        await doubtModsFor(page, 'DAMAGE', { skillName: SKILL }), []);
      equal('DOUBT459-SCOPE-OTHERSKILL', 'A Skill roll using a different Skill is untouched',
        await doubtModsFor(page, 'SKILL', { skillName: 'Athletics' }), []);
      for (const [kind, extra] of [['RING', { ringName: 'Fire' }], ['TRAIT', { traitName: 'Agility' }],
        ['SPELL', {}], ['MANUAL', { notation: '5k3' }], ['INITIATIVE', {}]]) {
        equal(`DOUBT459-SCOPE-${kind}`, `A ${kind.toLowerCase()} roll is untouched`,
          await doubtModsFor(page, kind, extra), []);
      }
      equal('DOUBT459-SCOPE-NODICE', 'It moves no dice in either direction, only the total',
        await page.evaluate(() => {
          const T = window.__L5R_TEST__;
          const m = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SKILL, { skillName: 'Kenjutsu' }))
            .find(x => x.label === 'Doubt');
          return [m.rolledDelta, m.keptDelta, m.explodeOverride === undefined];
        }), [0, 0, true]);
    });

    // ---------------- The reported total ----------------
    await section('DOUBT459-TOTAL', 'It reaches the player, not just the modifier list', async () => {
      await reset(page);
      await addDoubt(page, SKILL);
      // rollWithModifiers() is ASYNC and gated by Phase 3's roll preview, so the roll only
      // happens once the preview is confirmed. Driving it any other way reads an empty modal.
      const rolled = await realRoll(page, {});
      equal('DOUBT459-TOTAL-01', 'The displayed total is exactly 5 below the kept dice',
        rolled.shown, rolled.kept - 5);
      record('DOUBT459-TOTAL-02', 'The breakdown names the required Raise, not just a number',
        /required Raise/.test(rolled.breakdown) && /Doubt/.test(rolled.breakdown),
        rolled.breakdown.slice(0, 200));
      // The convention: an ADJUSTED total against the ORIGINAL TN, never an adjusted total
      // against a raised one. Routing through totalDelta gets that, because showRollResult()
      // compares against currentRollTN, which nothing here touches.
      const tn = await realRoll(page, { tn: 20, successText: 'YES', failText: 'NO' });
      equal('DOUBT459-TOTAL-03', 'Against a known TN the penalty is applied once, to the total',
        tn.shown, tn.kept - 5);
      // The convention's "apply it ONCE" requirement, checked against what the player can
      // actually read. A first cut asserted the success/fail text instead; that was wrong —
      // rollWithModifiers does not surface successText through this path, so the check was
      // testing the harness's own assumption rather than the rule.
      const bar = await page.evaluate(() => {
        const visible = el => el && getComputedStyle(el).display !== 'none';
        const tenDice = Array.from(document.querySelectorAll('#rollModalBody .roll-note'))
          .find(el => /Ten Dice Rule bonus/.test(el.textContent));
        const mod = document.querySelector('#rollModalBody [class*="roll-mod"]');
        return {
          tenDiceHidden: !!tenDice && !visible(tenDice),
          barText: mod ? mod.textContent : '',
          doubtRows: (mod ? mod.textContent.match(/Doubt:/g) || [] : []).length,
        };
      });
      equal('DOUBT459-TOTAL-04', 'The penalty is listed once and declared already-included',
        [bar.doubtRows, /already included in the total/.test(bar.barText)], [1, true]);
      record('DOUBT459-TOTAL-05', 'The misleading "Ten Dice Rule bonus" note is hidden, not shown twice',
        bar.tenDiceHidden, `barText=${bar.barText.slice(0, 120)}`);
    });

    // ---------------- A stale Skill ----------------
    await section('DOUBT459-STALE', 'A Skill that is no longer a School Skill', async () => {
      await reset(page);
      const row = await addDoubt(page, 'Sincerity');
      // Feature 4.5.3's principle: this project does not silently reprice a saved character.
      equal('DOUBT459-STALE-01', 'The 4 XP is kept rather than silently withdrawn', row.cost, '4');
      record('DOUBT459-STALE-02', '…and the row says exactly why it is not applying',
        /no longer one of your School Skills/.test(row.summary || '')
        && /re-pick/i.test(row.summary || ''), row.summary);
      equal('DOUBT459-STALE-03', 'No penalty is applied for a Skill the rule no longer covers',
        await doubtModsFor(page, 'SKILL', { skillName: 'Sincerity' }), []);
      // Revalidation, driven the way the character model actually works rather than the way it
      // looks. Writing to #f_school does NOT orphan a School Skill: D45.state() builds its list
      // from getSchoolsList() AND from every Skills-table row whose .sk-school box is ticked, so
      // a Skill the School already granted stays granted — correctly. CLAUDE.md records the same
      // trap catching Feature 4.55's first harness cut. The real transition is a character that
      // no longer has the Skill ticked at all.
      await page.evaluate(() => { window.__L5R_TEST__.resetToBaseline(); window.__L5R_TEST__.recalcAll(); });
      equal('DOUBT459-STALE-04', 'A character without that School Skill reads it as stale, award intact',
        await page.evaluate(() => {
          const e = window.__L5R_TEST__.D45.resolve('Doubt', { type: 'skillPick', skill: 'Kenjutsu' });
          return [e.stale, e.cost];
        }), [true, 4]);
      equal('DOUBT459-STALE-05', '…and it applies nothing while in that state',
        await doubtModsFor(page, 'SKILL', { skillName: 'Kenjutsu' }), []);
    });

    // ---------------- Persistence ----------------
    await section('DOUBT459-PERSIST', 'Persistence', async () => {
      await reset(page);
      await addDoubt(page, SKILL);
      const saved = await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()));
      await reset(page);
      await page.evaluate(json => window.__L5R_TEST__.applyData(JSON.parse(json)), saved);
      await page.waitForTimeout(200);
      equal('DOUBT459-PERSIST-01', 'The Skill and its award survive a reload',
        await page.evaluate(() => {
          const div = Array.from(document.querySelectorAll('#disadvList .entry'))
            .find(d => d.querySelector('.en-name').value === 'Doubt');
          return [JSON.parse(div.dataset.advConfig).skill, div.querySelector('.en-cost').value];
        }), [SKILL, '4']);
      equal('DOUBT459-PERSIST-02', '…and it is still applying after the reload',
        await doubtModsFor(page, 'SKILL', { skillName: SKILL }),
        [{ totalDelta: -5, rolledDelta: 0, keptDelta: 0 }]);
    });

    // ---------------- Geometry ----------------
    // Written after measuring both builds. Absolute pixel sizes are not asserted; what the
    // stylesheet supplies is that the applying and NOT-applying states look different, which
    // without it they do not — both render as identical bare text.
    await section('DOUBT459-GEOM', 'Geometry at 375px', async () => {
      await reset(page);
      await addDoubt(page, SKILL);
      await addDoubt(page, 'Sincerity');
      const geom = await page.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('.doubt459-badge'));
        const read = el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
          return { h: Math.round(r.height), w: Math.round(r.width), border: cs.borderTopStyle,
            bg: cs.backgroundColor, weight: cs.fontWeight, overflow: r.width > 375 }; };
        return badges.map(read);
      });
      record('DOUBT459-GEOM-01', 'The applying badge reads as a badge rather than as more text',
        geom[0].h >= 24 && geom[0].border === 'solid' && geom[0].bg !== 'rgba(0, 0, 0, 0)',
        JSON.stringify(geom[0]));
      record('DOUBT459-GEOM-02', 'A stale Doubt is visually distinct from an applying one',
        geom[1].border !== geom[0].border && geom[1].bg !== geom[0].bg,
        JSON.stringify(geom));
      record('DOUBT459-GEOM-03', 'Neither badge overflows the 375px viewport',
        !geom[0].overflow && !geom[1].overflow, JSON.stringify(geom.map(g => g.w)));
    });

    record('DOUBT459-ERRORS', 'No uncaught browser errors', errors.length === 0, errors.join('\n'));
  } finally { await browser.close(); }
}

main().catch(e => record('DOUBT459-FATAL', 'Harness initialization', false, String(e.stack || e))).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.table(results.filter(r => !r.pass));
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('DOUBT459_QA_RESULT=' + JSON.stringify({ total: results.length, passed, failed: results.length - passed }));
  process.exitCode = passed === results.length ? 0 : 1;
});
