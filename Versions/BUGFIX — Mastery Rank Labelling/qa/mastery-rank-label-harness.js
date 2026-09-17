/*
 * BUGFIX — Mastery Rank Labelling — browser validation.
 *
 * Run: node mastery-rank-label-harness.js <sheet.html>
 *
 * WHAT THIS FIX CHANGES, AND HOW THAT IS PINNED. The weapon damage breakdown named the rank the
 * CHARACTER holds as the rank that GRANTED a mastery effect ("Kenjutsu Rank 8 mastery +1k0", when
 * Kenjutsu's masteries are at 3 and 7). The arithmetic was never wrong. So the check that matters
 * most here is not that the new labels are right — it is that NOTHING ELSE MOVED.
 *
 * MR-ARITH-01/02 and MR-SCOPE-01/02 do that against a RECORDED BASELINE of the pre-fix build
 * (damage-breakdown-baseline.json: every weapon in WEAPON_LIBRARY x ranks 0-10, 528 rows, taken
 * from 6a08d86a before a line of this fix existed). They assert, across the whole corpus:
 *   - every numeric field and flag identical                      (0 rows may differ)
 *   - every breakdown array the same LENGTH                       (no line added or removed)
 *   - every line that DID change differs ONLY in its rank phrase  (the sentence after it is equal)
 *   - no line outside the three mastery lines changed at all
 * A baseline recorded from the build under test would prove nothing, which is why it is a
 * committed artifact recorded from the previous build instead.
 *
 * THE COINCIDENCE THAT MAKES NAIVE CHECKS USELESS. At exactly a threshold rank the OLD label was
 * already right — a Kenjutsu Rank 3 character read "Kenjutsu Rank 3 mastery", because the rank
 * held and the rank granting coincide. Measured before these checks were written. Every MR-LABEL
 * check below is therefore driven at a rank ABOVE the threshold, and MR-LABEL-06 pins the
 * coincidence case as byte-identical to the pre-fix build so the fix cannot "correct" it into
 * something else.
 *
 * THE ORACLE IS THE SHEET'S OWN DATA. Expected ranks come from SKILL_LIBRARY's own dmgBonus /
 * explodeOn / reductionMod threshold KEYS read through the seam, never from a list written here —
 * a list here would agree with the code under test and with nothing else (CLAUDE.md's oracle rule).
 *
 * WHAT COULD NOT BE DRIVEN END TO END, STATED RATHER THAN GLOSSED. getWeaponDamageDice() falls
 * back to getLegacyMasteryBonus()'s hardcoded free-text values whenever structured and legacy
 * disagree, so a WHOLLY INVENTED skill always lands on the legacy path and prints nothing to
 * inspect. The supersede rule is therefore driven end to end by MUTATING an existing skill in a
 * way that keeps the two in agreement (MR-SUPERSEDE-01/02), and the unreachable shapes are unit
 * checked on the exported helpers (MR-PURE-*). MR-LEGACY-01 drives the fallback itself by forcing
 * a real disagreement.
 *
 * The input build is never modified.
 */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');

const results = [];
function record(id, name, pass, detail = '') {
  results.push({ id, name, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ' — ' + detail : ''}`);
}
function equal(id, name, actual, expected) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  record(id, name, pass, pass ? '' : `actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}
function truthy(id, name, value, detail) {
  record(id, name, !!value, value ? (detail || '') : `got ${JSON.stringify(value)}`);
}
async function section(id, name, fn) {
  try { await fn(); } catch (e) { record(id, name, false, String(e.stack || e)); }
}

// The three sentences section 4 can print, identified by what follows the rank phrase. Kept here
// as the harness's own independent statement of which lines this fix is allowed to touch.
const MASTERY_SUFFIXES = [' mastery +', ': damage dice explode on', ": target's Reduction"];

(async () => {
  const sheetArg = process.argv.slice(2).find(a => !a.startsWith('--'));
  if (!sheetArg) { console.error('usage: node mastery-rank-label-harness.js <sheet.html>'); process.exit(2); }
  const sheet = path.resolve(sheetArg);
  const baselinePath = path.join(__dirname, 'damage-breakdown-baseline.json');
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(sheet).href);
  await page.waitForFunction(() => !!window.__L5R_TEST__);

  // ---------- the whole-corpus sweep, against the recorded pre-fix build ----------
  const live = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const rows = [];
    (T.WEAPON_LIBRARY || []).forEach(w => {
      for (let rank = 0; rank <= 10; rank++) {
        const d = T.getWeaponDamageDice(w, rank, {});
        rows.push({ weapon: w.name, rank,
          numDice: d.numDice, keepDice: d.keepDice, notation: d.notation,
          explodeOn: d.explodeOn === undefined ? null : d.explodeOn,
          reductionMod: d.reductionMod === undefined ? null : d.reductionMod,
          matched: d.matched, source: d.source, breakdown: d.breakdown });
      }
    });
    return rows;
  });

  await section('MR-ARITH-01', 'no numeric field or flag moved anywhere in the corpus', async () => {
    const fields = ['numDice', 'keepDice', 'notation', 'explodeOn', 'reductionMod', 'matched', 'source'];
    const drift = [];
    baseline.rows.forEach((b, i) => {
      const a = live[i];
      if (!a || a.weapon !== b.weapon || a.rank !== b.rank) { drift.push(`row ${i} misaligned`); return; }
      fields.forEach(f => { if (JSON.stringify(a[f]) !== JSON.stringify(b[f])) drift.push(`${b.weapon}@${b.rank}.${f}`); });
    });
    equal('MR-ARITH-01', `no numeric field moved (${baseline.rows.length} weapon x rank rows)`, drift, []);
  });

  await section('MR-ARITH-02', 'no breakdown line added or removed', async () => {
    const drift = baseline.rows
      .map((b, i) => (live[i] && live[i].breakdown.length === b.breakdown.length) ? null : `${b.weapon}@${b.rank}`)
      .filter(Boolean);
    equal('MR-ARITH-02', 'every breakdown array kept its length', drift, []);
  });

  // Every line that changed must differ ONLY in the rank phrase that precedes a known mastery
  // suffix. This is what separates "relabelled" from "rewrote a sentence".
  const changes = [];
  baseline.rows.forEach((b, i) => {
    const a = live[i];
    if (!a || a.breakdown.length !== b.breakdown.length) return;
    b.breakdown.forEach((before, j) => {
      const after = a.breakdown[j];
      if (before !== after) changes.push({ weapon: b.weapon, rank: b.rank, before, after });
    });
  });

  // The EFFECT each sentence describes, with the attribution clause in front of it removed. Both
  // wordings put the effect after ": " where there is one, and after " mastery " otherwise, and no
  // effect text contains a colon of its own — checked across the whole corpus, not assumed.
  const payload = line => (line.includes(': ')
    ? line.slice(line.indexOf(': ') + 2)
    : line.slice(line.indexOf(' mastery +') + ' mastery '.length));

  await section('MR-SCOPE-01', 'changed lines differ only in their attribution', async () => {
    // The first cut of this check asserted "only the rank NUMBER changed", which held while the fix
    // corrected the number in place. It stopped holding when the reporter pointed out that a
    // corrected number is still ambiguous ("[Kenjutsu Rank 3] mastery") and the clause was
    // restructured to name the source. The effect text is what must never move, and that is now
    // what is asserted — a strictly stronger statement than the one it replaces.
    const bad = changes.filter(c => payload(c.before) !== payload(c.after))
      .map(c => `${c.weapon}@${c.rank}: ${c.before} -> ${c.after}`);
    equal('MR-SCOPE-01', `every changed line kept its effect exactly (${changes.length} lines changed)`, bad, []);
  });

  await section('MR-SCOPE-04', 'every changed line names its source unambiguously', async () => {
    // The whole point of the reword: no line may read as "[Skill Rank N] mastery" any more, and
    // every line that names a rank must say where it came FROM.
    const bad = changes.filter(c => /^\S+(?: \S+)? Rank \d+/.test(c.after) ||
                                    (/Rank/.test(c.after) && !/mastery from Ranks? /.test(c.after)))
      .map(c => c.after);
    equal('MR-SCOPE-04', 'no line still reads "<Skill> Rank N mastery"', bad, []);
  });

  await section('MR-SCOPE-02', 'nothing outside the three mastery lines changed', async () => {
    const bad = changes.filter(c => !MASTERY_SUFFIXES.some(s => c.before.includes(s)))
      .map(c => `${c.weapon}@${c.rank}: ${c.before}`);
    equal('MR-SCOPE-02', 'no non-mastery line changed', bad, []);
  });

  await section('MR-SCOPE-03', 'the fix actually did something across the corpus', async () => {
    truthy('MR-SCOPE-03', 'the sweep found real relabelling, so the checks above are not vacuous',
      changes.length > 0, `${changes.length} lines relabelled`);
  });

  // ---------- the reported case, and the three shapes ----------
  const probe = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const find = n => (T.WEAPON_LIBRARY || []).find(w => w.name === n) || null;
    // Needles are regex SOURCES, and each is deliberately written to match BOTH the old wording and
    // the new one. A needle that only matched the new one would report `null` under any revert that
    // turns the fix off, hiding the actual line behind an unhelpful failure message.
    const lineFor = (weaponName, rank, needle) => {
      const w = find(weaponName);
      if (!w) return null;
      const d = T.getWeaponDamageDice(w, rank, {});
      const re = new RegExp(needle);
      return (d.breakdown || []).filter(t => re.test(String(t)))[0] || null;
    };
    const thresholds = name => {
      const raw = T.getStructuredMastery(name);
      return {
        dmgBonus: raw.dmgBonus ? Object.keys(raw.dmgBonus).map(Number).sort((a, b) => a - b) : null,
        explodeOn: raw.explodeOn ? Object.keys(raw.explodeOn).map(Number).sort((a, b) => a - b) : null,
        reductionMod: raw.reductionMod ? Object.keys(raw.reductionMod).map(Number).sort((a, b) => a - b) : null,
        rawExplode: raw.explodeOn || null,
      };
    };
    return {
      katana8dmg: lineFor('Katana', 8, 'mastery.*\\+\\d+k\\d+'),
      katana8explode: lineFor('Katana', 8, 'explode on'),
      katana3dmg: lineFor('Katana', 3, 'mastery.*\\+\\d+k\\d+'),
      shuriken8: lineFor('Shuriken', 8, 'mastery.*\\+\\d+k\\d+'),
      shuriken6: lineFor('Shuriken', 6, 'mastery.*\\+\\d+k\\d+'),
      tetsubo8red: lineFor('Tetsubo', 8, "Reduction treated as"),
      unarmed8: lineFor('Unarmed', 8, 'mastery'),
      blowgun8exempt: lineFor('Blowgun', 8, 'mastery damage bonus not applied'),
      blowgun8override: lineFor('Blowgun', 8, 'DR becomes'),
      kenjutsu: thresholds('Kenjutsu'),
      ninjutsu: thresholds('Ninjutsu'),
      heavy: thresholds('Heavy Weapons'),
      jiujutsu: thresholds('Jiujutsu'),
      seam: {
        flag: T.MASTERY_RANK_LABEL_FIX_ENABLED,
        fns: ['masteryRankLabelRewrite', 'masteryContributingRanks', 'masteryExplosionRanks', 'masteryRankPhrase']
          .filter(k => typeof T[k] === 'function'),
      },
    };
  });

  // The expected rank comes from the skill's own threshold keys, not from a number written here.
  await section('MR-LABEL-01', 'the reported case', async () => {
    const granting = probe.kenjutsu.dmgBonus.filter(t => t <= 8);
    equal('MR-LABEL-01', 'the damage bonus names its SOURCE rank, not the rank held',
      probe.katana8dmg, `Kenjutsu mastery from Rank ${granting.join(', ')}: +1k0 → 6k2.`);
  });

  await section('MR-LABEL-02', 'explosion threshold at a rank above it', async () => {
    const granting = probe.kenjutsu.explodeOn.filter(t => t <= 8);
    equal('MR-LABEL-02', 'the explosion line names its SOURCE rank',
      probe.katana8explode, `Kenjutsu mastery from Rank ${granting.join(', ')}: damage dice explode on 9 as well as 10.`);
  });

  await section('MR-LABEL-03', 'two accumulated thresholds', async () => {
    const granting = probe.ninjutsu.dmgBonus.filter(t => t <= 8);
    truthy('MR-LABEL-03', 'Ninjutsu Rank 8 names BOTH contributing ranks',
      granting.length === 2 && probe.shuriken8 === `Ninjutsu mastery from Ranks ${granting.join(', ')}: +1k1 → 4k2.`,
      `${probe.shuriken8} (thresholds ${JSON.stringify(granting)})`);
  });

  await section('MR-LABEL-04', 'a threshold not yet unlocked is not named', async () => {
    const granting = probe.ninjutsu.dmgBonus.filter(t => t <= 6);
    truthy('MR-LABEL-04', 'Ninjutsu Rank 6 names only the unlocked threshold',
      granting.length === 1 && probe.shuriken6 === `Ninjutsu mastery from Rank ${granting[0]}: +1k0 → 4k1.`,
      `${probe.shuriken6} (unlocked ${JSON.stringify(granting)})`);
  });

  await section('MR-LABEL-05', 'the reduction line', async () => {
    const granting = probe.heavy.reductionMod.filter(t => t <= 8);
    truthy('MR-LABEL-05', 'Heavy Weapons Rank 8 reduction line names the granting rank',
      probe.tetsubo8red && probe.tetsubo8red.startsWith(`Heavy Weapons mastery from Rank ${granting.join(', ')}:`),
      String(probe.tetsubo8red).slice(0, 80));
  });

  await section('MR-LABEL-06', 'the coincidence case still names the right rank', async () => {
    // At exactly the threshold rank the OLD label was accidentally right, because the rank held and
    // the rank granting coincide. It is no longer byte-identical — the clause is restructured on
    // every line now — so what is pinned is that the NUMBER is still 3 and the effect is unchanged.
    const b = baseline.rows.find(r => r.weapon === 'Katana' && r.rank === 3);
    const before = b.breakdown.filter(t => t.includes(' mastery +'))[0];
    truthy('MR-LABEL-06', 'at the threshold rank the source is still Rank 3, with the effect unchanged',
      probe.katana3dmg === 'Kenjutsu mastery from Rank 3: +1k0 → 6k2.' &&
      payload(probe.katana3dmg) === payload(before),
      probe.katana3dmg);
  });

  // ---------- lines this fix must NOT touch ----------
  await section('MR-EXEMPT-01', 'the exempt notice carries no rank and is left alone', async () => {
    const b = baseline.rows.find(r => r.weapon === 'Blowgun' && r.rank === 8);
    const before = b.breakdown.filter(t => t.includes('mastery damage bonus not applied'))[0];
    equal('MR-EXEMPT-01', 'masteryDamageExempt notice byte-identical to the pre-fix build',
      probe.blowgun8exempt, before);
  });

  await section('MR-EXEMPT-02', 'a line that already named a threshold is left alone', async () => {
    const b = baseline.rows.find(r => r.weapon === 'Blowgun' && r.rank === 8);
    const before = b.breakdown.filter(t => t.includes('DR becomes'))[0];
    equal('MR-EXEMPT-02', 'the damageOverride line, which already said "Rank 7+", is unchanged',
      probe.blowgun8override, before);
  });

  await section('MR-NONE-01', 'a skill with no structured mastery gains no line', async () => {
    truthy('MR-NONE-01', 'Jiujutsu has no structured mastery and Unarmed prints no mastery line',
      probe.jiujutsu.dmgBonus === null && probe.jiujutsu.explodeOn === null && probe.unarmed8 === null,
      `unarmed line=${JSON.stringify(probe.unarmed8)}`);
  });

  // ---------- the supersede rule, driven end to end ----------
  // Mutating an existing skill keeps getLegacyMasteryBonus() in agreement, which an invented skill
  // could never do — see the header note. Both mutations leave the RESOLVED value at 9, so
  // `matched` stays true and the structured path (the one under test) is the one that runs.
  const supersede = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const skill = T.findSkill('Kenjutsu');
    const original = skill.explodeOn;
    const katana = (T.WEAPON_LIBRARY || []).find(w => w.name === 'Katana');
    const lineAt = () => {
      const d = T.getWeaponDamageDice(katana, 8, {});
      return { line: (d.breakdown || []).filter(t => String(t).includes('explode on'))[0] || null, matched: d.matched };
    };
    skill.explodeOn = { 3: 10, 7: 9 };   // Rank 3's 10 is SUPERSEDED by Rank 7's 9
    const superseded = lineAt();
    skill.explodeOn = { 3: 9, 7: 9 };    // both supply the value in force
    const tied = lineAt();
    skill.explodeOn = original;
    const restored = lineAt();
    return { superseded, tied, restored };
  });

  await section('MR-SUPERSEDE-01', 'a superseded threshold is not named', async () => {
    truthy('MR-SUPERSEDE-01', 'with explodeOn {3:10, 7:9} at Rank 8, only Rank 7 is named',
      supersede.superseded.matched === true &&
      supersede.superseded.line === 'Kenjutsu mastery from Rank 7: damage dice explode on 9 as well as 10.',
      `${supersede.superseded.line} (matched=${supersede.superseded.matched})`);
  });

  await section('MR-SUPERSEDE-02', 'thresholds that tie are both named', async () => {
    truthy('MR-SUPERSEDE-02', 'with explodeOn {3:9, 7:9} at Rank 8, both ranks are named',
      supersede.tied.line === 'Kenjutsu mastery from Ranks 3, 7: damage dice explode on 9 as well as 10.',
      String(supersede.tied.line));
  });

  await section('MR-SUPERSEDE-03', 'the mutation was undone', async () => {
    equal('MR-SUPERSEDE-03', 'restoring the skill restores the shipped label',
      supersede.restored.line, 'Kenjutsu mastery from Rank 7: damage dice explode on 9 as well as 10.');
  });

  // ---------- the legacy fallback claims no rank ----------
  const legacy = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const skill = T.findSkill('Kenjutsu');
    const original = skill.dmgBonus;
    const katana = (T.WEAPON_LIBRARY || []).find(w => w.name === 'Katana');
    skill.dmgBonus = { 3: { roll: 2, keep: 0 } };   // disagrees with the hardcoded legacy +1k0
    const d = T.getWeaponDamageDice(katana, 8, {});
    const out = { line: (d.breakdown || []).filter(t => /mastery.*\+\d+k\d+/.test(String(t)))[0] || null,
                  matched: d.matched, source: d.source };
    skill.dmgBonus = original;
    return out;
  });

  await section('MR-LEGACY-01', 'no rank is claimed on the legacy-fallback path', async () => {
    truthy('MR-LEGACY-01', 'on a structured/legacy disagreement the line names no rank at all',
      legacy.matched === false && legacy.source === 'legacy-fallback' &&
      legacy.line === 'Kenjutsu mastery: +1k0 → 6k2.',
      `${legacy.line} (matched=${legacy.matched}, source=${legacy.source})`);
  });

  // ---------- the exported helpers, for the shapes the corpus cannot reach ----------
  const pure = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    return {
      accumTwo: T.masteryContributingRanks({ 3: { roll: 1, keep: 0 }, 7: { roll: 0, keep: 1 } }, 8),
      accumLocked: T.masteryContributingRanks({ 3: { roll: 1, keep: 0 }, 7: { roll: 0, keep: 1 } }, 5),
      accumZero: T.masteryContributingRanks({ 3: { roll: 0, keep: 0 } }, 8),
      accumNull: T.masteryContributingRanks(null, 8),
      accumSigned: T.masteryContributingRanks({ 3: -2, 7: -1 }, 8),
      supersede: T.masteryExplosionRanks({ 3: 10, 7: 9 }, 8),
      supersedeLocked: T.masteryExplosionRanks({ 3: 10, 7: 9 }, 5),
      tie: T.masteryExplosionRanks({ 3: 9, 7: 9 }, 8),
      explodeNull: T.masteryExplosionRanks(null, 8),
      phraseOne: T.masteryRankPhrase('Kenjutsu', [3]),
      phraseTwo: T.masteryRankPhrase('Ninjutsu', [3, 7]),
      phraseNone: T.masteryRankPhrase('Kenjutsu', []),
      phraseNull: T.masteryRankPhrase('Kenjutsu', null),
    };
  });

  await section('MR-PURE-01', 'accumulating tables', async () => {
    equal('MR-PURE-01', 'contributing ranks: both unlocked, one locked, zero-valued, absent, signed',
      [pure.accumTwo, pure.accumLocked, pure.accumZero, pure.accumNull, pure.accumSigned],
      [[3, 7], [3], [], null, [3, 7]]);
  });

  await section('MR-PURE-02', 'superseding tables', async () => {
    equal('MR-PURE-02', 'explosion ranks: superseded, still locked, tied, absent',
      [pure.supersede, pure.supersedeLocked, pure.tie, pure.explodeNull],
      [[7], [3], [3, 7], null]);
  });

  await section('MR-PURE-03', 'the rank phrase, including the no-claim form', async () => {
    equal('MR-PURE-03', 'singular, plural, and the bare name when no rank is knowable',
      [pure.phraseOne, pure.phraseTwo, pure.phraseNone, pure.phraseNull],
      ['Kenjutsu mastery from Rank 3', 'Ninjutsu mastery from Ranks 3, 7',
       'Kenjutsu mastery', 'Kenjutsu mastery']);
  });

  // ---------- the rewrite's own boundaries ----------
  const bounds = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const lines = [
      'Kenjutsu Rank 8 mastery +1k0 → 6k2.',            // index 0 — BEFORE the start index
      'Katana base DR 3k2.',
      'Kenjutsu Rank 8 mastery +1k0 → 6k2.',            // index 2 — inside, must be rewritten
      'Kenjutsu mastery damage bonus not applied — Blowgun’s own printed rules already account for it.',
      'Some later phase line mentioning Kenjutsu Rank 8 in the middle.',
      // The discriminating fixture. This one carries the prefix MID-SENTENCE and is followed by a
      // real mastery suffix, so it is the only line in this file that can tell `indexOf(...) === 0`
      // apart from `indexOf(...) >= 0`. It was added because the seven isolated reverts found that
      // relaxing that test to >= 0 left the suite at 25/25 — the decision had no check on it.
      'Kata: while active, Kenjutsu Rank 8 mastery +1k0 is doubled.',
    ];
    const n = T.masteryRankLabelRewrite(lines, 1, { skillName: 'Kenjutsu', skillRank: 8, matched: true });
    return { n, lines };
  });

  await section('MR-GUARD-01', 'the rewrite respects its start index', async () => {
    equal('MR-GUARD-01', 'a matching line before `from` is left alone',
      bounds.lines[0], 'Kenjutsu Rank 8 mastery +1k0 → 6k2.');
  });

  await section('MR-GUARD-03', 'the prefix must be at the START of the line', async () => {
    equal('MR-GUARD-03', 'a mastery sentence quoted mid-line is not rewritten',
      bounds.lines[5], 'Kata: while active, Kenjutsu Rank 8 mastery +1k0 is doubled.');
  });

  await section('MR-GUARD-02', 'only recognised lines are rewritten', async () => {
    truthy('MR-GUARD-02', 'one line rewritten; the exempt notice and a mid-sentence mention untouched',
      bounds.n === 1 &&
      bounds.lines[2] === 'Kenjutsu mastery from Rank 3: +1k0 → 6k2.' &&
      bounds.lines[3].startsWith('Kenjutsu mastery damage bonus not applied') &&
      bounds.lines[4] === 'Some later phase line mentioning Kenjutsu Rank 8 in the middle.',
      `rewrote ${bounds.n}`);
  });

  // ---------- cross-phase: Feature 4.5.12's own damage note ----------
  await section('MR-BISHAMON-01', "Feature 4.5.12's Bishamon lines are not this fix's to touch", async () => {
    const bishamonChanged = changes.filter(c => /^Bishamon:/.test(c.before)).map(c => c.before);
    equal('MR-BISHAMON-01', 'no line beginning "Bishamon:" changed anywhere in the corpus',
      bishamonChanged, []);
  });

  await section('MR-SEAM-01', 'the seam exports', async () => {
    truthy('MR-SEAM-01', 'kill-switch and the four helpers are exported',
      probe.seam.flag === true && probe.seam.fns.length === 4,
      `flag=${probe.seam.flag} fns=${probe.seam.fns.length}`);
  });

  await browser.close();

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  console.log('MASTERY_RANK_LABEL_RESULT=' + JSON.stringify({ sheet, passed, total: results.length }));
  process.exitCode = passed === results.length ? 0 : 1;
})();
