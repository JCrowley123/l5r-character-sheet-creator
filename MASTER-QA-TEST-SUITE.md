# L5R 4e Character Sheet — MASTER QA TEST SUITE

**Version:** 1.0 (compiled 2026-08-28)
**Compiled from:** Part B validation & regression, Part C Feature 0 (Emphasis Re-roll), P1/P2 Prerequisites, Feature 1 (Range), the School-Free-Rank bugfix, Feature 2 (Stances), Feature 3 (Wound Penalties), Feature 4 (Void Automation), and the standalone `QA_Test_Suite_Character_Sheet_1.md`.

**Target:** a single-file, vanilla-JS L5R 4e character sheet — one `<script>` block wrapped in one IIFE, no modules, no bundler, no test framework. The HTML file is supplied at run time.

**Purpose:** this is the *only* document you need. It contains the full validation suite, the harness specification, the stress/edge-case mandate, the regression matrix, the accumulated harness pitfalls, and four verbatim prompts to execute in sequence.

---

## 0. HOW TO USE THIS DOCUMENT

You will be given an HTML file. Work through the five stages **in order**. Do not skip ahead; each stage's output feeds the next.

| Stage | What you do | Section | Output |
|---|---|---|---|
| **0** | Reconnaissance — identify the build, confirm the QA seam, inventory which features are present | §1, §2 | Build Identification Report |
| **1** | Validate the suite against the build before running anything | §11 (Prompt A) | Coverage & ambiguity findings |
| **2** | Write and run the automated harness | §12 (Prompt B) | `failed === 0` or a failure table |
| **3** | Stress test and hunt edge cases beyond the written suite | §13 (Prompt C) | New assertions + findings |
| **4** | Triage the code against expected results, produce Bug & Risk List + Minimal Fixes | §14 (Prompt D) | Findings table + diffs (NOT applied) |

**Hard rule that governs every stage:** *Never modify the sheet to make a test pass.* If a test fails, report the divergence and its rules citation. Fixes are proposed in Stage 4 as diffs for review, never auto-applied.

**Priority legend:** P0 = blocking/critical · P1 = high · P2 = medium · P3 = low
**Type legend:** FUNC = functional · NEG = negative/error handling · EDGE = edge case · REGR = regression · INTEG = integration · UI = display

---

## 1. BUILD CONTEXT & ARCHITECTURE INVARIANTS

### 1.1 The QA seam

A read-only export sits at the bottom of the sheet's single `<script>` block:

```js
window.__L5R_TEST__
```

It exposes existing functions only. It adds no behaviour and **no production code path reads it**. Every harness starts by checking for it and aborting cleanly if absent.

Expected exports, grouped by the feature that introduced them:

| Layer | Exports |
|---|---|
| **Part A/B static data** | `WEAPON_LIBRARY`, `ARROW_LIBRARY`, `SKILL_LIBRARY`, `DEFAULT_ARROW`, `WOUND_LEVELS` |
| **Part B lookups** | `findWeapon`, `findArrow`, `findSkill`, `getCharacterSkillRank`, `getTraitValueByName`, `getRingValueByName`, `computeWoundThresholds` |
| **Part B pure calc** | `getWeaponAttackDice`, `getWeaponDamageDice` |
| **Dice engine (FROZEN)** | `rollDicePool`, `rollWeaponDicePool`, `rollExplodingD10At`, `applyTenDiceRule`, `formatRollNotation` |
| **Row factories** | `makeSkillRow`, `makeWeaponRow`, `refreshWeaponRow`, `refreshAllWeaponRows`, `applyWeaponLibraryLink` |
| **Orchestration** | `resolveWeaponContext`, `rollWeaponAttack`, `rollWeaponDamage`, `rollSkill`, `rollNotation`, `performSpellCastRoll`, `rollWithModifiers` |
| **Save/load (FROZEN)** | `collectData`, `applyData`, `recalcAll`, `resetToBaseline`, `clearAllRows` |
| **F0 Emphasis** | `rerollEmphasisDice`, `findMatchingEmphasis`, `getOwnedEmphases`, `normaliseEmphasisName`, `EMPHASIS_MATCH_STRATEGY`, `EMPHASIS_REQUIRE_SELECTION`, `emphasisLibraryAudit`, `isEmphasisRerollUsed`, `skillRollEmphasisContext` |
| **P1 Round context** | `getCombatRound`, `setCombatRound`, `advanceCombatRound`, `resetCombatRound`, `getRoundLedger`, `getRoundSpend`, `hasSpentThisRound`, `recordRoundSpend`, `clearRoundSpend`, `COMBAT_ROUND_DEFAULTS` |
| **P2 Pipeline** | `PREROLL_MODIFIER_REGISTRY`, `registerPreRollModifier`, `unregisterPreRollModifier`, `getPreRollModifiers`, `applyPreRollModifiers`, `makeRollContext`, `ROLL_KINDS` |
| **F1 Range** | `isRangedWeapon`, `weaponListedRange`, `calculateRangePenalty`, `validateRangeAttack`, `getRangeModifiers` |
| **Bugfix** | `schoolGrantedRankForSkill`, `inferSchoolFreeFloor` |
| **F2 Stances** | `STANCE_LIBRARY`, `findStance`, `getCurrentStance`, `setCurrentStance`, `getStanceArmorTNBonus`, `getStanceInitiativeBonus`, `stancePreRollModifiers`, `getFullDefenseBonus`, `clearFullDefenseBonus`, `centerWasLastRound`, `centerBonusAvailable` |
| **F3 Wounds** | `WOUND_PENALTIES`, `getCurrentWoundLevelName`, `getWoundPenalty`, `woundPreRollModifiers` |
| **F4 Void** | `VOID_SPEND_LIBRARY`, `VOID_EFFECT_VALUES`, `canSpendVoid`, `spendVoid`, `getVoidPending`, `setVoidPending`, `clearVoidPending`, `getVoidPoints`, `getVoidArmorTNBonus`, `getVoidInitiativeBonus`, `clearVoidSkirmishEffects`, `setCombatActive`, `applyVoidDamageReduction`, `voidPreRollModifiers`, `renderVoidPips`, `renderVoidPanel` |

### 1.2 The frozen list — must be byte-identical across every build

These functions may **never** be modified. Their call sites may be re-pointed; the functions themselves are frozen.

- `rollDicePool`
- `rollExplodingD10` / `rollExplodingD10At`
- `rollWeaponDicePool`
- `showRollResult`
- `updateRollKeepState`
- `applyTenDiceRule`
- `collectData`
- `applyData`
- Part B's weapon **damage** path (`getWeaponDamageDice`, `rollWeaponDamage`)

**Not frozen** (and legitimately edited by features): the orchestration wrappers `rollSkill`, `rollWeaponAttack`, `rollNotation`, `performSpellCastRoll`, `recalcAll`, and button handlers.

### 1.3 The persistence contract

| Invariant | Value |
|---|---|
| `collectData().fields` key count | **exactly 42** |
| `collectData()` top-level keys | `adv, disadv, equip, fields, rings, skills, spellBonusUsed, spellBonusUsedVisual, spellUsed, tech, traits, traitsFree, voidCurrent, voidFree, weapons` (15) |
| New feature state | hidden inputs **without** the `f_` prefix — `collectData()` serialises every `[id^="f_"]`, so an `f_`-prefixed id would add a 43rd key |
| Round trip | `collectData → applyData → collectData` must be byte-stable **after `recalcAll()`** |

Non-persisted state ids currently in use: `emphasisRerollUsed`, `combatRoundNumber`, `combatRoundLedger`, `combatStance`, `fullDefenseBonus`, `fullDefenseRound`, `voidPendingEffects`, `isCombatActive`, `voidInitSkirmish`.

### 1.4 The pre-roll modifier pipeline (P2)

```
registerPreRollModifier(id, priority, ctx => ({label, rolledDelta, keptDelta, totalDelta, explodeOverride, note}))
```

Two deliberately distinct channels:

| Channel | Applied | Why | Examples |
|---|---|---|---|
| `rolledDelta` / `keptDelta` | **Pre-roll**, before the Ten Dice Rule | The Ten Dice Rule must see the *raw modified* pool. Post-render bolt-on loses that information forever. | Full Attack +2k1, Void +1k1, range −1k0 |
| `totalDelta` | Folded into `result.bonus` | `updateRollKeepState()` recomputes total as *(kept dice + currentRollBonus)* on **every die click**. Anything applied post-render is wiped by the next click. | Wound penalty, firing into melee −10, Center's Void Ring |
| `explodeOverride` | Replaces the caller's `explode` flag | Void's +1 Skill Rank (0→1) lifts the Unskilled penalty — a change to *how* dice explode, not how many | V5 |

**The crux, tested every build:** `Kenjutsu 7 + Agility 3 in Full Attack` must be `10k3 raw → +2k1 → 12k4 → Ten Dice Rule → 10k4 +bonus`, **not** `10k3 rendered, then bolt on 2 dice`.

Registered permanent contributors and priorities: `range@20`, `stance@30`, `wounds@40`, `void@50`. Presentation order only — addition is commutative.

### 1.5 Cumulative assertion counts (expected at the Feature 4 build)

| Suite | Assertions |
|---|---:|
| Part B — Core Weapons | 127 |
| Feature 0 — Emphasis Re-roll | 72 |
| P1 + P2 — Prerequisites | 46 |
| Feature 1 — Range | 80 |
| Feature 2 — Stances | 84 |
| Feature 3 — Wound Penalties | 59 |
| Feature 4 — Void Automation | 98 |
| Bugfix — School Free Rank | 30 |
| **Total** | **596** |

> **Verified 2026-08-28** against `f4.html` (Feature 4 build): **596/596, failed 0.**
>
> Feature 4 is **98**, not the 96 quoted in `FEATURE-4-RESULTS.md`. Its `A3` was split into
> `A3a/A3b/A3c` (+2) when **Feature 5 registered `technique@60`` and broke the old
> whole-registry assertion — the third occurrence of the §17.1 anti-pattern. The harness
> archived in `Versions/PART C — Feature 4 Void Automation/` is the **pre-split copy and is
> stale**; the current one lives in the serve folder.

Exit condition for the whole run: **`failed === 0` on every suite.**

---

## 2. STAGE 0 — BUILD IDENTIFICATION (do this first)

Before writing a single assertion, run this reconnaissance in the console and report the result. It tells you which suites are in scope.

```js
(function identify(){
  const T = window.__L5R_TEST__;
  if(!T){ console.error('NO SEAM — this build has no __L5R_TEST__ export.'); return null; }
  const has = n => typeof T[n] !== 'undefined';
  const report = {
    seam: true,
    scriptBlocks: document.querySelectorAll('script:not([src])').length,
    fileChars: document.documentElement.outerHTML.length,
    features: {
      PartB:      has('WEAPON_LIBRARY') && has('getWeaponDamageDice'),
      Feature0:   has('rerollEmphasisDice'),
      P1:         has('getCombatRound'),
      P2:         has('PREROLL_MODIFIER_REGISTRY'),
      Feature1:   has('calculateRangePenalty'),
      SchoolFix:  has('inferSchoolFreeFloor'),
      Feature2:   has('STANCE_LIBRARY'),
      Feature3:   has('WOUND_PENALTIES'),
      Feature4:   has('VOID_SPEND_LIBRARY'),
    },
    registry: has('PREROLL_MODIFIER_REGISTRY')
      ? T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id+'@'+m.priority) : 'ABSENT',
    emphasisMode: has('EMPHASIS_REQUIRE_SELECTION')
      ? (T.EMPHASIS_REQUIRE_SELECTION ? 'B (require selection)' : 'A (unconditional)') : 'ABSENT',
    saveFieldCount: Object.keys(T.collectData().fields).length,
    saveTopKeys: Object.keys(T.collectData()).sort().join(','),
    voidValues: has('VOID_EFFECT_VALUES') ? T.VOID_EFFECT_VALUES : 'ABSENT',
    tenDiceVector: [[12,12],[13,4],[11,3],[6,3],[10,10],[15,2]].map(([r,k])=>{
      const a=T.applyTenDiceRule(r,k); return r+'k'+k+'->'+a.rolled+'k'+a.kept+'+'+a.bonus;}).join(' | '),
  };
  console.table(report.features);
  console.log(report);
  return report;
})();
```

**Assert immediately:**

| Check | Expected |
|---|---|
| `scriptBlocks` | exactly **1** |
| `saveFieldCount` | **42** |
| `saveTopKeys` | the 15 keys listed in §1.3 |
| `tenDiceVector` | `12k12->10k10+8 \| 13k4->10k5+0 \| 11k3->10k3+0 \| 6k3->6k3+0 \| 10k10->10k10+0 \| 15k2->10k4+0` |
| `registry` | `['range@20','stance@30','wounds@40','void@50']` — subset if earlier build |

Any suite whose feature flag is `false` **degrades gracefully**: report it as `ABSENT`, do not fail it.

---

## 3. TEST DATA & FIXTURES

Build fixtures by setting `#trait_<key>` inputs directly and appending real rows via `makeSkillRow` / `makeWeaponRow`. **Never hand-write row markup** — the DOM *is* the model, and hand-written rows bypass the factories under test.

```js
const TRAITS = ['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower'];
const sBody = () => document.getElementById('skillsBody');
const wBody = () => document.getElementById('weaponsBody');
const setTrait = (k,v) => { document.getElementById('trait_'+k).value = v; };
const setAllTraits = v => TRAITS.forEach(k => setTrait(k, v));
const clearRows = () => { sBody().innerHTML=''; wBody().innerHTML=''; };
const addSkill = (name,rank,emph) => sBody().appendChild(
  T.makeSkillRow({name, trait:(T.findSkill(name)||{}).trait||'', rank, emph:emph||''}));
const addWeapon = n => { const L=T.findWeapon(n);
  return wBody().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
    keywords:(L.keywords||[]).join(', '),notes:L.notes||'',roll:'',dmg:'',
    manualAttack:false,manualDamage:false})); };
```

### Named test data

| ID | Object | Used for |
|---|---|---|
| TD-01 | Character A — Kuni Shugenja, Rank 1, deficiency Air, no affinity | deficiency / rank-0 cast |
| TD-02 | Character B — Isawa Shugenja, Rank 1, affinity Fire | affinity roll bonus |
| TD-03 | Character C — Bushi (non-caster) | spell removal from skill dropdown |
| TD-04 | Character D — Shugenja school with NO affinity/deficiency | highlight/warning |
| TD-05 | Spells: "Fires of Purity" (Fire), "Path to Sanctuary" (Water, Ward), "Summon Elemental" (Maho variant), Universal "Sense" | keyword coverage |
| TD-06 | Scroll items matching each spell, addable/removable from Equipment | scroll gating |
| TD-07 | XP pool = 100 on all test characters | XP cost verification |
| TD-08 | Kenjutsu with free-text mastery at ranks 1–5 + Katana in `WEAPON_LIBRARY` | mastery refactor & weapons |
| TD-09 | Legacy save predating the weapon system: rows are `{name, roll, dmg, size, notes}` with **no `key` field** | migration |
| TD-10 | Character E — ranged weapon w/ limited ammo + melee main-hand + one-handed off-hand | range/ammo/off-hand/dual-wield |
| TD-11 | **Fixture Bushi** — all Traits 3; Kenjutsu 7 (emph Katana), Kyujutsu 4 (emph Yumi), Heavy Weapons 3 (emph Tetsubo); weapons Katana, Yumi, Tetsubo, Pistol, Blowgun | cross-version signature |
| TD-12 | Daidoji Iron Warrior [Bushi] (grants Defense 2) and Kakita Bushi (grants Kenjutsu 1) | school free-rank tests |

### Deterministic RNG

Rollers depend on randomness. Every dice assertion that needs a known outcome must inject a seeded RNG:

```js
const seq = arr => { let i=0; return () => arr[Math.min(i++, arr.length-1)]; };
const withRandom = (fn, vals) => { const o=Math.random; Math.random=seq(vals);
  try { return fn(); } finally { Math.random=o; } };
```

And where the *rendered dice* are the model, overwrite them directly:

```js
const forceDice = vals => { document.getElementById('rollDiceRow').innerHTML =
  vals.map(v=>'<div class="roll-die" data-total="'+v+'">'+v+'</div>').join(''); };
```

---

## 4. VALIDATION TEST SUITE — PART B: CORE WEAPONS SYSTEM (127)

### 4.1 Damage assembly order (the contract under test)

```
1. Base DR          weapon.damage, or weapon.damageOverride[highest rank reached]  (blowgun only)
2. Ammunition       bows only — the arrow supplies the DR
3. Trait            Strength (default) | Perception (gunpowder) | bow rating capped by Strength | none
4. Structured mastery  dmgBonus / explodeOn / reductionMod, behind the shadow guard,
                       skipped entirely when weapon.masteryDamageExempt
```

Attack is always `Skill Rank + Trait` rolled, `Trait` kept — **byte-identical to `rollSkill()`**, so a weapon attack and a Skills-tab roll of the same skill can never disagree.

### 4.2 Section A — Library data integrity (10)

| ID | Assertion |
|---|---|
| A1 | `WEAPON_LIBRARY` is non-empty |
| A2 | Every weapon has name, skill, numeric `damage.roll`/`damage.keep`, size, keywords array |
| A3 | Every `weapon.skill` resolves in `SKILL_LIBRARY` |
| A4 | Every size is `Small \| Medium \| Large` |
| A5 | No duplicate weapon names (case-insensitive) |
| A6 | Size is **not** duplicated inside `keywords` |
| A7 | `findWeapon` is case- and whitespace-insensitive; unknown → `null` |
| A8 | Every Kyujutsu weapon declares `bowStrength` **and** `ammo` |
| A9 | Every arrow has numeric DR |
| A10 | `DEFAULT_ARROW` resolves via `findArrow` |

### 4.3 Section B — Pure calculation (51)

**Attack dice (B1–B6)**

| ID | Assertion |
|---|---|
| B1 | Kenjutsu 3 + Agility 3 = `6k3` |
| B2 | Rank 0 is Unskilled → Trait only = `3k3` |
| B3 | No Skill row at all → Trait only = `3k3` |
| B4 | Kyujutsu keys off Reflexes = `7k3` |
| B5 | "Agility or Reflexes" takes the first Trait = `5k3` |
| B6 | `unskilled` flag is reported |

**Kenjutsu damage (B7–B12)**

| ID | Assertion |
|---|---|
| B7 | Katana @ Kenjutsu 0 (DR 3k2 + Str 3) = `6k2` |
| **B8** | Katana @ Kenjutsu 3 (+1k0 mastery) = **`7k2`** |
| B9 | Katana @ Kenjutsu 7 (mastery still +1k0) = `7k2` |
| **B10** | Kenjutsu 7 sets `explodeOn: 9` — *the Phase 1 gap Part B closed* |
| B11 | Kenjutsu 3 does **not** lower it (`explodeOn: null`) |
| B12 | No-dachi @ Kenjutsu 3 = `7k3` |

**Heavy Weapons (B13–B18)**

| ID | Assertion |
|---|---|
| B13 | Tetsubo @ HW 0 = `6k3` |
| B14 | Tetsubo @ HW 3 — Heavy Weapons has no `dmgBonus` = `6k3` |
| **B15** | HW 3 gives `reductionMod: -2` |
| **B16** | HW 7 gives `explodeOn: 9` **and** `reductionMod: -2` |
| B17 | Dai Tsuchi @ HW 0 = `8k2` |
| B18 | Ono @ HW 0 (DR 0k4 + Str 3) = `3k4` |

**Ninjutsu & the blowgun override table (B19–B25)**

| ID | Assertion |
|---|---|
| B19 | Shuriken @ Ninjutsu 0 = `4k1` |
| B20 | Shuriken @ Ninjutsu 3 (+1k0) = `5k1` |
| **B21** | Shuriken @ Ninjutsu 7 = `5k2` — cumulative +1k1, **not** +1k0 twice |
| B22 | Blowgun @ Ninjutsu 0 — flat, no Trait, no override = `0k0` |
| B23 | Blowgun @ Ninjutsu 3 — override `1k1`, mastery exempt |
| B24 | Blowgun @ Ninjutsu 5 — still the Rank-3 override row = `1k1` |
| B25 | Blowgun @ Ninjutsu 7 — override `2k1`, mastery exempt |

**Bows & Strength capping (B26–B32)**

| ID | Assertion |
|---|---|
| **B26** | Yumi (rating 3), Strength 2 → capped to 2, + Willow Leaf = `4k2` |
| **B27** | Yumi, Strength 4 → bow rating 3 caps it = `5k2` |
| B28 | Dai-kyu (rating 4), Strength 4 = `6k2` |
| B29 | Han-kyu (rating 1), Strength 4 = `3k2` |
| B30 | Bow reports which arrow it used (`Willow Leaf`) |
| B31 | Bow honours `opts.arrow` (Flesh Cutter 2k3 + rating 3) = `5k3` |
| B32 | Unknown arrow falls back to the default = `5k2` |

**Trait routing (B33–B40)**

| ID | Assertion |
|---|---|
| **B33** | Pistol adds **Perception**, not Strength (DR 3k2 + Per 5) = `8k2` |
| B34 | Musket uses Perception = `9k3` |
| B35 | Pistol `traitName === 'Perception'` |
| B36 | Cannon is flat DR, no Trait added = `10k10` |
| B37 | Cannon `traitName === null` |
| B38 | Nageteppo (Incendiary) flat `3k2`, exempt at Ninjutsu 7 |
| B39 | Unarmed (DR 0k1 + Str 3) = `3k1` |
| B40 | War Fan (Tessen) = `3k1` |

**Shadow-comparison guard — Phase 4 contract preserved (B41–B45)**

| ID | Assertion |
|---|---|
| B41 | Kenjutsu 7 structured == legacy → `source: 'structured'` |
| B42 | Heavy Weapons 3 agree → `source: 'structured'` |
| B43 | Ninjutsu 7 agree → `source: 'structured'` |
| B44 | Skill with no structured data agrees trivially |
| B45 | `matched` flag true across Katana/Tetsubo/Shuriken/Naginata |

> The contract: structured mastery is applied **only** when it agrees with the independently hand-authored `getLegacyMasteryBonus()`; otherwise legacy values are used and `source` reports `'legacy-fallback'`.

**Conditional mastery must NEVER be auto-applied (B46–B49)**

| ID | Assertion |
|---|---|
| B46 | Polearms 5 "+1k0 vs mounted" not auto-applied — Naginata @ 5 = `6k2` |
| B47 | Spears 3 "ignore 3 Reduction" not auto-applied — Yari `reductionMod === 0` |
| B48 | Staves 7 "small staves +1k0" not auto-applied — Bo @ 7 = `4k2` |
| B49 | Ninjutsu 5 "explode normally" not modelled as `explodeOn` |

**Purity (B50–B51)**

| ID | Assertion |
|---|---|
| B50 | `getWeaponDamageDice` does not mutate the library entry |
| B51 | Same inputs give the same output |

### 4.4 Section C — Row factory (21)

| ID | Assertion |
|---|---|
| C1–C4 | Linked row auto-fills Attack `6k3`, Damage `7k2`, Size `Medium`, Skill `Kenjutsu` |
| C5 | Hidden structured damage dice written: `.wp-dmg-roll = 7`, `.wp-dmg-keep = 2` |
| C6 | Hidden keywords written: `Samurai` |
| C7 | Blank "+ Add Weapon" row starts unlinked (`.wp-key === ''`) |
| C8 | Typing `tetsubo` links it case-insensitively → `Tetsubo` |
| C9–C12 | Link auto-fills Skill `Heavy Weapons`, Size `Large`, Attack `3k3` (unskilled), Damage `6k3` |
| C13 | Raising Strength updates Damage via `recalcAll()` → `9k2` |
| C14 | Buying a Skill Rank updates Attack → `10k3` |
| C15 | Explode-on-9 surfaced in `.wp-link-note` |
| C16 | Typing into Damage flags `data-manual-damage = '1'` |
| C17 | Manual value survives `recalcAll()` |
| C18 | Attack box is independently still automatic (`data-manual-attack = '0'`) |
| C19 | Clearing the box restores the computed value |
| C20 | Manual flag cleared |
| C21 | Row cell count === `#weaponsTable thead th` count |

### 4.5 Section D — Dice engine REGRESSION (13)

`rollDicePool` and `showRollResult` are **frozen**. Treat them as such.

| ID | Assertion |
|---|---|
| D1–D3 | Pool size, keep count, `total === kept sum + bonus` |
| D4 | Ten Dice Rule converts `13k4 → 10k5` |
| D5 | `tenDiceRuleApplied` flag set |
| D6 | `formatRollNotation(6,3) === '6k3'` |
| **D7** | **400 samples**: `rollDicePool` explodes on **10 only** — zero non-10 values in any chain prefix |
| **D8** | **400 samples**: sibling `rollWeaponDicePool(5,2,9)` never explodes below 9 |
| D9 | Sibling *does* explode on 9 (saw9 > 0) |
| D10 | Sibling honours the Ten Dice Rule identically (`13k4 → 10k5`) |
| D11 | Sibling returns an **identical key set** to `rollDicePool` |
| D12 | **300 samples**: sibling with `explodeOn = null` behaves like plain 10-only |
| D13 | **300 samples**: `rollExplodingD10At(1)` clamps out-of-range thresholds (never below 2) |

### 4.6 Section E — Save / load (18)

| ID | Assertion |
|---|---|
| E1 | Quick-add creates three rows |
| E2–E5 | Katana attack `10k3` / damage `7k2`; Yumi unskilled `3k3` / damage `5k2` |
| E6 | Notes auto-filled from the library (contains "Void Point") |
| E7 | Legacy fields still saved as strings: `name, roll, dmg, size, notes` |
| E8 | Structured fields saved: `key='Katana', skill='Kenjutsu', dmgRoll='7', dmgKeep='2', keywords='Samurai'` |
| E9 | Manual flags saved as booleans `[false,false]` |
| E10 | `collectData → applyData → collectData` is byte-stable |
| E11–E12 | Rows restored; restored row still computes `7k2` |
| E13–E16 | Attack button opens modal (`display: flex`), title `Katana — Attack (Kenjutsu 7)`, notation `10k3`, 10 dice rendered |
| E17–E18 | Damage modal title `Katana — Damage (Kenjutsu 7, explodes on 9+)`, 7 dice |

### 4.7 Section L — Legacy migration (14)

The distinction that drives everything: **`key === ''` means "deliberately custom"; `key === undefined` means "written before Part B."**

| ID | Assertion |
|---|---|
| L1–L2 | Legacy row keeps Attack `5k3` and Damage `8k4` **verbatim** |
| **L3** | Legacy row auto-flagged manual on both axes — *so no existing character's dice change on load* |
| L4–L5 | Legacy row still adopts the library link and gains the Skill column |
| L6 | Legacy row keeps its own Notes |
| L7 | `recalcAll()` does **not** overwrite legacy values |
| L8–L9 | Legacy row with **empty** boxes links fully, computes `6k3`/`7k2`, and is **not** flagged manual |
| L10–L12 | Unrecognised weapon stays unlinked, keeps its values, shows the "Custom weapon" note |
| L13 | Explicit `key:""` is respected, never re-linked by name |
| L14 | Legacy rows survive a save round trip |

---

## 5. VALIDATION TEST SUITE — PART C FEATURE 0: EMPHASIS RE-ROLL (72)

Two versions differ by **exactly one line**: `const EMPHASIS_REQUIRE_SELECTION = false;` (A) vs `= true;` (B). The harness self-detects and branches only where the two are specified to differ.

### 5.1 Section A — Match strategy & library audit (12)

| ID | Assertion |
|---|---|
| **A0** | `emphasisLibraryAudit()` returns **40 exact / 2 baseName / 4 unmatched / 2 no-list** |
| A1 | `getOwnedEmphases('Kenjutsu')` → `['Katana']` |
| A2 | Katana + Kenjutsu matches |
| A3 | Scimitar does not match a Katana-only character |
| A4 | `Sang Kauw (Shield)` base-matches the `Sang Kauw` Emphasis |
| A5 | Nunchaku has no Staves Emphasis (RAW-correct `null`) |
| A5b | Unarmed is not a Jiujutsu Emphasis |
| A6 | Skill with no Emphasis list yields `null`, no crash |
| A7 | Matching is case/whitespace insensitive |
| A8 | Owned-but-irrelevant Emphasis does not qualify another weapon |
| A9 | `normaliseEmphasisName('  Mai   CHONG ')` → `'mai chong'` |
| A10 | `baseName('Sang Kauw (Crescent Blade)')` → `'sang kauw'` |

> The 4 unmatched (Nunchaku, both Nageteppo, Unarmed) are **rules-correct**: no such Emphasis exists.

### 5.2 Section B — Pure re-roll engine (14)

Seeded with the RAW worked example: Kenjutsu (Katana) 3, Agility 2 → `5k2`, dice `1, 1, 4, 6, 8`.

| ID | Assertion |
|---|---|
| B1 | Both selected 1s replaced → `[1, 7]` under `seq([0.0, 0.6])` |
| B2 / B2b | Non-selected dice untouched, **preserved by identity** |
| **B3** | A re-roll landing on 1 **stands** — not re-rolled again |
| B3b | Re-rolled dice tagged `rerolledFrom: 1` |
| **B4** | RAW example total: keep 8 and 7 = **15** |
| B5 | A re-rolled 10 explodes and chains → `total 14, chain [10,4]` |
| B6 | Input array not mutated (purity) |
| B7 | Selecting zero dice is a no-op |
| B8 | A die not showing 1 is never re-rolled |
| B9 | Out-of-range / `NaN` indices ignored |
| B10 | Deterministic under a fixed RNG |
| B11 | `explodeOn: 9` makes a re-rolled 9 explode → `total 11, chain [9,2]` |
| B11b | `explodeOn: null` leaves a 9 alone |

### 5.3 Sections C/D — Once-per-roll & decorator (22)

| ID | Assertion |
|---|---|
| C1 | Flag starts at `false` |
| C2 | Flag set after use |
| **C3** | Second re-roll refused programmatically |
| C4 | Re-entering re-roll mode refused once used |
| C5 | Bar reports "once per roll" |
| **C6** | A new roll **resets** the flag |
| D1 | Skill roll attaches the bar |
| D2–D5 | Enter mode succeeds; only dice showing 1 eligible (2); keep-clicking suspended (`.emph-reroll-mode`); 2 selected |
| D6–D7 | Confirm performs the re-roll; dice read `1,7,4,6,8` |
| D8 | Re-rolled dice carry a `1→N` history badge |
| D9 | Top-N keep suggestion re-applied (keep 8 and 7) |
| D10 | Modal total recomputed to **15** |
| D11 | Re-roll mode exited after confirm |
| D12–D13 | Control disabled and `enterMode()` refused when no die shows 1 |
| D14–D16 | Cancel exits mode, clears selection, and **does not consume** the re-roll |

### 5.4 Section E — Scope (negative tests, 8)

| Roll type | Bar attached |
|---|---|
| Skill Roll (ranked, emphasis owned) | **yes** (E1) |
| Weapon Attack Roll | **yes** (E1b — auto-matched, no dropdown) |
| Weapon Damage Roll | **no** (E2) |
| Spell Casting Roll | **no** (E3) |
| Manual Dice Tray | **no** (E4) |
| Unskilled Roll, Rank 0 | **no** (E5, E5b `hasEmphasis: false`) |
| Ranked but no Emphasis owned | **no** (E6) |

### 5.5 Sections F/G/R — Integration, version-specific, regression (16)

| ID | Assertion |
|---|---|
| F1 | Ten Dice Rule pinned vector unchanged |
| F2 | Keep-note recomputed after re-roll ("Keeping 2 of 5") |
| F3–F4 | Part B damage still explodes on 9 and offers no re-roll |
| GA1–GA3 | **Version A**: control active immediately, owned Emphases named, works unconditionally |
| GB1–GB3 | **Version B**: control disabled before selection, dropdown lists owned Emphases, works after selection |
| R4 | Weapon quick-add still has 49 options |
| R6 | Skill XP still computed |
| R11 | Base TN auto still correct (`Reflexes 4 → 25`) |
| R13 | Ring still lower of its two Traits |
| R15 | `recalcAll()` still refreshes weapon rows |
| R12 / R12b / R12c | No new top-level save keys; no `emphasisReroll*` key leaked; **fields count still 42** |
| R14 | save → load → save is stable |

### 5.6 Cross-version guarantees (R18–R21, GC0–GC2)

Run `l5r-crossversion-signature.js` on Part B, Version A and Version B. These must be **identical strings**:

| Signature | What it pins |
|---|---|
| `saveSig` | full `collectData()` JSON for TD-11 (was 3,085 chars) |
| `attackSig` | attack dice for Kenjutsu / Kyujutsu / Heavy Weapons / Ninjutsu / Firearms |
| `dmgSig` | damage + mastery for 10 weapon/rank pairs incl. `explodeOn`, `reductionMod`, `source` |
| `tdrSig` | the six-entry Ten Dice Rule vector |
| `rowSig` | row-level derived Attack/Damage/Skill for five weapons |
| `fieldCount` | 42 |

---

## 6. VALIDATION TEST SUITE — P1 + P2 PREREQUISITES (46)

### 6.1 P1 — Combat Round Context (17)

| ID | Assertion |
|---|---|
| R1–R3 | Round starts at 1; `advanceCombatRound()` increments |
| R4–R7 | Ledger: nothing spent initially; `recordRoundSpend` registers; boolean stored as `true`; valued spend stored verbatim |
| R8 | New round has a clean slate |
| **R9** | **Previous round is still readable** — Center depends on this |
| R10 | `clearRoundSpend` removes a past entry |
| R11 | Ledger history trimmed to `COMBAT_ROUND_DEFAULTS.historyLimit` (20) after 30 rounds |
| R12–R13 | `resetCombatRound()` returns to round 1 and empties the ledger |
| R14 | Round UI label renders "Round 1" |
| R15–R17 | `combatRoundNumber` never reaches the save; 42 fields; no `f_`-prefixed round inputs exist |

### 6.2 P2 — Pipeline purity & mechanics (13)

| ID | Assertion |
|---|---|
| M1 | Registry matches the **baseline** captured at harness start (not "is empty") |
| M2 | Baseline contributors yield nothing for a bare context |
| M3 | Empty modifier list is a mathematical no-op |
| M4–M5 | Dice modifier applies to its own kind; filtered out for another (negative scope) |
| M6 | Total modifier collected |
| **M7** | Pool never goes below `0k0` |
| **M8** | Kept can never exceed rolled |
| **M9** | A **throwing** contributor is skipped, not fatal |
| M10 | `unregisterPreRollModifier` removes a contributor |
| M11 | Re-registering the same id **replaces**, not duplicates |
| M12 | Contributors sorted by priority |
| M13 | Zero-valued modifiers are dropped |

### 6.3 P2 — The crux (X1–X10)

| ID | Assertion |
|---|---|
| **X1** | Modified pool `12k4` hits the Ten Dice Rule — **not** the base `10k3` |
| **X2** | Modal notation shows the Ten Dice conversion **from 12k4** |
| X3–X4 | Modifier breakdown bar rendered and names the modifier |
| X5 | Displayed total already includes the flat modifier |
| **X6** | Modifier **survives a die click** (not wiped by `updateRollKeepState`) |
| **X7** | The misleading hard-coded "Ten Dice Rule bonus: +N" note is **hidden** when a non-Ten-Dice modifier is present |
| X8 | Breakdown shows the net adjustment ("Net -3") |
| X9–X10 | Damage roll shows no bar and its pool is unchanged (negative scope) |

### 6.4 P2 — The no-op guarantee (N1–N6)

With the registry at baseline, rolls must match Part B **exactly**. This is what makes the 127/127 and 72/72 re-runs meaningful evidence rather than a formality.

| ID | Assertion |
|---|---|
| N1 | Registry restored to baseline after the harness — **no test modifier leaked** |
| N2 | No modifier bar when nothing is registered |
| N3 | Pool is the unmodified `10k3` |
| N4 | Ten Dice note **not** hidden when there is nothing to hide |
| N5 | save → load → save still stable (**after `recalcAll()`** — see §15.6) |
| N6 | Save carries no combat-round or roll-modifier keys |

---

## 7. VALIDATION TEST SUITE — FEATURE 1: RANGE & RANGE PENALTIES (80)

### 7.1 The RAW rules being modelled

> "A bow can fire an arrow an additional distance up to twice listed range, but suffers a **−1k0 penalty to the attack roll for every extra 50'** beyond the listed range. Bows fired against opponents currently in melee range with the archer also incur a penalty of **−10 to the total** of the attack roll."

Two different mechanisms — which is exactly why P2 has two channels.

| Option | Effect | Channel |
|---|---|---|
| Target is in melee with me | **−10 to the total** | `totalDelta` |
| Target is within listed range | nothing | — |
| Target is beyond listed range | **−1k0 per extra 50 ft** | `rolledDelta` |

### 7.2 Three documented judgment calls — verify these are still true

1. **Rounding is `Math.ceil`, not `floor`.** With `floor()`, a target at 299 ft with a 250 ft bow suffers *no penalty at all*, making "beyond listed range" indistinguishable from being inside it for the first 49 feet. Both readings agree on every exact multiple of 50.
2. **Throwable melee weapons stay melee.** A weapon is ranged only if it has `ammo` or its skill is in `['Kyujutsu','Firearms','Cannon','Ninjutsu']`. Wakizashi/knives/yari carry a `range` but must never prompt.
3. **The 2× cap applies to all ranged weapons**, not just bows. Only the popup wording varies.

### 7.3 F1-A — Pure calculation (26)

| ID | Assertion |
|---|---|
| A1–A3 | Yumi, Pistol, Shuriken are ranged |
| A4–A6 | Katana, Tetsubo are **not**; **Wakizashi (throwable) stays melee** |
| A7–A8 | Listed range read from library (Yumi 250); Blowgun (no range) → `null` |
| **A9** | Spec example: 200 ft weapon at 300 ft → `extraFeet 100, penaltyDice 2, beyondMax false` |
| A10–A11 | At and inside listed range → no penalty |
| **A12** | 251 ft → **1 die** (the `ceil` reading) |
| A13–A14 | 300 ft → 1 die; 301 ft → 2 dice (partial band rounds up) |
| A15–A16 | Exactly 2× is legal (5 dice); 501 ft flags `beyondMax` |
| A17 | Garbage distance → `valid: false`, not a crash |
| **A18** | Beyond-max illegal with exact bow wording: *"A bow cannot fire beyond twice its listed range"* |
| **A19** | Pool below 1 illegal with exact wording: *"reduce the attack to 0k2, which is not a legal roll"* |
| A20 | Exactly 1 rolled die remains legal |
| A21 | Melee and within are always legal |
| A22–A26 | Contributor purity: ignores non-attack kinds, ignores no-decision, "within" contributes nothing, "melee" is `totalDelta:-10` only, "beyond" is `rolledDelta:-N` only |

### 7.4 F1-B..G — Behaviour (54)

| § | Count | Covers |
|---|---:|---|
| F1-B Prompt | 9 | Melee never prompts and opens the modal **synchronously**; ranged shows the prompt; subtitle names weapon + range; all three options present; cancelling opens nothing |
| F1-C Within | 4 | No bar, unmodified `6k3`, 6 dice |
| F1-D In melee | 9 | −10 to total, bar text, "Firing into melee", pool unchanged, Ten Dice note hidden, "Net -10", **survives a die click** |
| F1-E Beyond | 10 | 350 ft → `4k3`; 251 ft → `5k3`; bar wording "100 ft beyond the listed 250 ft"; **Ten Dice Rule applied to the modified pool (11k3, not 12k3)** |
| F1-F Illegal | 9 | Both popups with exact RAW wording; roll **cancelled outright** — no modal, no bar, no state |
| F1-G Hygiene | 10 | Damage / manual / skill rolls take no range modifier; registry unchanged after cancelled **and** illegal rolls; no leftover state; 42 fields; no range keys; round trip stable |

### 7.5 Worked example, verified end to end

Kyujutsu 3 + Reflexes 3 = **6k3** with a Yumi (listed 250 ft):

| Distance | Extra | Penalty | Final pool |
|---|---|---|---|
| 200 ft (within) | — | — | `6k3` |
| in melee | — | −10 to total | `6k3` −10 |
| 251 ft | 1 ft | −1k0 | `5k3` |
| 350 ft | 100 ft | −2k0 | **`4k3`** |
| 400 ft | 150 ft | −3k0 | `3k3` |
| 600 ft | — | — | **cancelled** (> 500 ft) |

---

## 8. VALIDATION TEST SUITE — BUGFIX: SCHOOL SKILL FREE RANK ON RELOAD (30)

### 8.1 The defect

`makeSkillRow`'s fallback for saves predating the `freeFloor` field assumed **the entire current Rank** was School-granted:

```js
// WRONG
data-free="${data.freeFloor !== undefined ? data.freeFloor
              : (data.school ? Math.max(1, data.rank||1) : 0)}"
```

Symptom: `school_skill = true` → `xp_cost = 0`, regardless of how many ranks were bought. Trigger is **loading a character saved by an earlier build**, not the save/load cycle itself.

```
Daidoji Iron Warrior grants Defense 2; player buys to Rank 3
before fix:  free rank 3, cost 0 xp     <-- wrong
after fix:   free rank 2, cost 3 xp     <-- correct
```

### 8.2 Assertions

| § | ID | Assertion |
|---|---|---|
| A | A1 | `"Defense 2"` parses to rank 2 |
| A | A2 | A bare skill name is rank 1 |
| A | A3 | A `"(Emphasis)"` suffix is stripped |
| A | A4–A5 | Skill the School doesn't teach → 0; unknown School → 0, not a crash |
| A | A6 | `"any one Skill"` slots never match |
| A | A7 | Empty inputs → 0 |
| B | **B1–B2** | Free rank reconstructed as **2, not 3**; XP cost is **3, not 0** ← THE BUG |
| B | B3 | Granted 1, bought to 3 → free 1, cost 5 |
| B | B4 | Sitting exactly at the granted rank costs 0 |
| B | B5 | Free rank never exceeds the current rank |
| B | B6 | A skill filling an "any one Skill" slot gets first-rank-free |
| C | C1–C4 | Multiple school skills; Defense 6 (free 2) → 18 xp |
| D | D1 | Multiple Schools: **highest grant across all of them wins** |
| D | D2 | A School that doesn't teach it → first-rank-free only |
| E | **E1–E4** | Non-School skill untouched; explicit `freeFloor:"0"` **respected, never "helpfully" upgraded**; explicit `"2"` respected; floor above rank still costs 0 |
| F | F1 | A repaired row now **saves** `freeFloor:"2"` — the character self-heals |
| F | F2–F3 | Reload keeps free 2 / cost 3; second round trip byte-stable |
| F | F4–F5 | Save shape unchanged: 42 fields; skill keys exactly `name, trait, rank, emph, freeEmph, school, freeFloor` |
| G | G1–G2 | Bushi character is offered **no selectable Spells**; spell slot UI hidden |

> **Scope note that must be preserved:** this changes `makeSkillRow`, which the roadmap lists as frozen Part B code. The exception was granted explicitly. `makeSkillRow` will hash differently from the Feature 0 baseline — that is intentional.

---

## 9. VALIDATION TEST SUITE — FEATURE 2: STANCE SYSTEM (84)

### 9.1 The architectural point

The five Stances do **not** all live in one place, and pretending they did would be wrong:

| Effect | Mechanism | Why |
|---|---|---|
| Full Attack **+2k1**, Center **+1k1 + Void** | **P2 pipeline** | dice-pool changes, must precede the Ten Dice Rule |
| Full Attack **−10**, Defense **+Air+Defense**, Full Defense **+½ roll** | **`recalcAll()`** | Armor TN is character *state*, not a roll |
| Center **+10 Initiative** | **`recalcAll()` + the Initiative roll** | a score, and the roll routes through P2 |

### 9.2 Canonical stance data

| Stance | Ring | Attack effect | Armor TN effect | Restrictions |
|---|---|---|---|---|
| Attack | Water | — | — | none |
| Full Attack | Fire | **+2k1** | **−10** | attacks only; **no ranged**; not mounted; +5 ft move once/round |
| Defense | Air | may not attack | **+Air Ring + Defense Skill Rank** | none otherwise |
| Full Defense | Earth | may not attack | **+½ Defense/Reflexes roll (round up)** | Complex Action; Free Actions only |
| Center | Void | next round **+1k1 + Void Ring** on one roll | — | no Actions; **+10 Initiative** that round |

### 9.3 Two interpretations to verify

1. **"+1k1 plus his Void Ring"** is implemented as **(a)** +1k1 to the pool **and** +Void to the total. The alternative reading **(b)** is `(1+Void)k1` in dice. Switching means moving `voidRing` from `totalDelta` to `rolledDelta` — one line.
2. **Center's +10 Initiative reaches the roll via P2.** The `stance` contributor answers for `ATTACK` **and** `INITIATIVE` only, refusing every other kind.

### 9.4 Assertions

| § | Count | Covers |
|---|---:|---|
| F2-A Library + tiles | 17 | Five stances in RAW order; each names its Ring; five tiles with icons and ⓘ buttons; default Attack; **tiles are real `<button>`s (keyboard reachable)**; `aria-pressed` tracks selection; **no stance dropdown anywhere**; `findStance` accepts name or key; one tile highlighted at a time; **the ⓘ button does NOT change stance**; ESC closes the info modal |
| F2-B Attack baseline | 4 | No Armor TN change, no modifiers, unmodified `10k3`, no bar |
| F2-C Full Attack | 11 | Armor TN −10 reflected in `f_currentTN`; **Ten Dice Rule saw the MODIFIED 12k4 pool**; bar shows "+2k1"; total recomputes after a die click; **ranged attack refused with the RAW wording** ("cannot be used to deliver ranged attacks"); no range prompt; no roll modal |
| F2-D Defense / Full Defense | 11 | Defense adds Air + Defense Rank; contributes no roll modifiers; **Full Defense declaration roll → half the total rounded up** (9+8 → 9); `f_currentTN` reflects it; **lapses on the following round**; leaving Full Defense clears it |
| F2-E Center this round | 6 | No Armor TN, no Initiative, no roll modifiers, bonus not yet available, no bar |
| F2-F Center next round | 17 | Bonus available; **+10 Initiative**; bar names "Center stance (previous round)", shows +1k1 and "+N to total"; pool `11k4`; **consumed after the roll**; second attack same round gets nothing; **does not leak into a later round**; **a cancelled attack does not burn the bonus** |
| F2-G Negative scope | 12 | Damage/skill/spell/manual get no stance modifier; **range + Center combine additively** (`6k3 → +1k1 → 7k4 → −2k0 → 5k4`), bar lists both; 42 fields; no stance keys; round trip stable; registry contains `stance` and `range`, no test modifiers leaked |

---

## 10. VALIDATION TEST SUITE — FEATURE 3: WOUND PENALTIES (59) & FEATURE 4: VOID AUTOMATION (96)

### 10.1 Feature 3 — the house rule, stated plainly

**RAW makes wound penalties a TN increase** — the sheet's own `WOUND_LEVELS` quotes it: *"Increase the TN of all rolls made by +3 while Nicked."* This build applies the same magnitude as a **flat negative modifier to the roll total**, by explicit project-owner decision.

> The two are **NOT** mathematically equivalent — raising a TN by 3 and lowering a roll by 3 give the same pass/fail outcome only when a TN exists at all. They diverge on opposed rolls and on any roll where the total itself matters.

Verify this comment is still in the code block. If it is absent, that is a finding.

**Penalty table:** `Healthy 0 · Nicked −3 · Grazed −5 · Hurt −10 · Injured −15 · Crippled −20 · Down −40` (and `Out` mapped to −40, deliberately not 0).

**Routing:** a contributor cannot reach a roll that never enters the pipeline. Seven call sites had to be re-pointed at `rollWithModifiers`:

| Call site | Kind | Note |
|---|---|---|
| Ring roll | `RING` | — |
| Trait roll | `TRAIT` | — |
| Unskilled skill roll | `SKILL` | `explode:false` passed through — still no exploding 10s |
| Manual dice tray | `MANUAL` | — |
| Spell Casting Roll | `SPELL` | TN config preserved |
| Maho Casting Roll | `SPELL` | TN config **and** its `onClose` Taint hook ride along |
| Full Defense declaration | `SKILL` | it *is* a Defense/Reflexes Skill Roll |

**Weapon damage was deliberately left un-routed** — Part B's damage path still calls `showRollResult` exactly as Part B wrote it.

**Consequence worth knowing:** Full Defense's Armor TN bonus is now **half the penalised total**. A wounded character declaring Full Defense gets a smaller bonus.

**Assertions (59):**

| § | Count | Covers |
|---|---:|---|
| F3-A Lookup table | 5 | All seven RAW penalties; level derivation tracks the sheet's own wound track |
| F3-B Contributor purity | 10 | Applies to attack/skill/spell/trait/ring/initiative/manual; **never damage**; Healthy returns `null`; **only `totalDelta` is ever set** (`rolledDelta`/`keptDelta` are `undefined`) |
| F3-C Healthy zero-change | 5 | No bar on any roll kind; pool unmodified |
| F3-D Nicked −3 end to end | 11 | Every roll kind's total includes −3; **pool unchanged**; die-click recomputation; spell TN readout intact |
| F3-E Down −40 | 3 | Magnitude scales; pool still unchanged |
| F3-F Additive | 9 | With stance (`12k4` −3); with range (`4k3` −3); **all three together** (`6k3 → +1k1 → 7k4 → −2k0 → 5k4`, total = kept + Void − 3) |
| F3-G Hygiene | 8+ | Damage untouched at Down; `wounds` registered at priority 40; registry sorted ascending; no test leaks; 42 fields; `f_woundsTaken` still the only wound state; round trip stable |

### 10.2 Feature 4 — Void Point Automation

**RAW values (corrected on review from an earlier +1 draft):**

```js
const VOID_EFFECT_VALUES = Object.freeze({
  tnBonus: 10,          // "Increase his Armor TN by 10 for one round."
  initiativeBonus: 10,  // "Increase his Initiative Score by 10 for the duration of the current skirmish."
  damageReduction: 10,  // "Reduce the amount of Wounds suffered from one source of damage by 10."
});
```

Nothing hardcodes these — labels, bar text and every test read from the constant.

**The six RAW options:** `k1` (+1k1), `trait` (+1 Trait), `skill` (+1 Skill Rank 0→1), `tn` (+10 Armor TN), `init` (+10 Initiative), `damage` (reduce Wounds by 10).

**The two combat effects are scoped differently — this is the trap:**

| Effect | RAW duration | Implementation |
|---|---|---|
| V2 Armor TN | **one round** | P1 round ledger — expires on its own at round advance |
| V3 Initiative | **the current skirmish** | `voidInitSkirmish` flag — **survives** round advance |

**Two design decisions to verify:**

1. **V4 (+1 Trait) is arithmetically identical to V1 (+1k1).** Every standard L5R roll is `(Trait + Rank)k(Trait)` — the Trait is counted in **both** rolled and kept. Raising it by one adds exactly one rolled and one kept die. They remain separate options because they are separate RAW choices, read differently in the bar, and only one Void Point may be spent per Round anyway.
2. **V6 asks for the announced damage total instead of intercepting a roll.** Part B's damage logic is off limits, *and* V6 must work for falling/environmental damage which produce no roll to intercept. This matches RAW's own framing ("immediately after the damage total is **announced**").

**One P2 extension was required:** V5 at Rank 0 lifts the Unskilled penalty — a change to how dice *explode*. `explodeOverride` was added to the modifier shape, carried through `getPreRollModifiers` normalisation, collected by `applyPreRollModifiers` (last explicit value wins), and used by `rollWithModifiers` in place of the caller's `explode`. `undefined` means "don't care", so with no Void spent the pipeline is byte-identical.

**Assertions (96):**

| § | Count | Covers |
|---|---:|---|
| F4-A Library, state, gating | 16 | All six options; six spend buttons; **`A3a/A3b/A3c`** — void registered at priority 50, earlier contributors still at theirs, registry stays priority-sorted (*split from one whole-registry assertion when F5 added `technique@60`*); all three effect values = 10; **combat-only options refused out of combat**; non-combat options allowed out of combat; refused with no points; **once-per-Round in combat**; **no limit out of combat**; pip decrement |
| F4-B V1 across every roll kind | 21 | attack/skill/spell/trait/ring/initiative/manual; **never damage**; `10k3 → 11k4`; dice match the Ten Dice conversion; **expires after the roll**; next roll back to `10k3`; out-of-combat skill/manual/spell rolls |
| F4-C V4 and V5 | 11 | +1 Trait → `11k4`; +1 Skill → `11k3`; both expire; **no permanent Trait or Skill Rank change**; `explodeOverride` carried end to end; `undefined` when no Void spent |
| F4-D V2 and V3 | 15 | Armor TN raised; **stacks additively with Full Attack's −10**; V2 **expires** at round advance; **V3 SURVIVES round advance and several rounds**; V2 still expires (proving different scopes); reset clears V3; V3 reports 0 out of combat regardless of flag; Initiative display and roll; V3 refuses non-Initiative rolls |
| F4-E V6 damage reduction | 9 | 25 → 15 Wounds written to `f_woundsTaken`; **floors at 0, never negative**; wound penalties update immediately; point consumed; refused with no points **and no Wounds written**; works out of combat |
| F4-F Combination | 8 | Stance + wounds + Void = `13k5` −3; range + wounds + Void = `5k4` −3; die-click recomputation; **bar ordered by priority** (range → wounds → void) |
| F4-G Negative scope & hygiene | 11 | Damage rolls show no Void bar, pool untouched, **and do not consume a pending Void**; no permanent stat changes; 42 fields; no Void keys in save; `voidCurrent` still the only Void state saved; round trip stable; **zero-change guarantee with no Void spent** |

---

## 11. THE ORIGINAL SHEET SUITE — SECTIONS TO RE-VERIFY (Parts A/pre-B)

These come from `QA_Test_Suite_Character_Sheet_1.md` and cover the character-sheet subsystems that predate the weapons work. Run them as **manual/observational** checks unless the seam exposes enough to automate them.

### 11.1 Rollers

| ID | Type | P | Assertion |
|---|---|---|---|
| TR-01 | FUNC | P0 | Trait roll: pool = trait rank d10, keep per system rule |
| TR-02 | FUNC | P1 | Void point spend adds die to roll/keep |
| TR-03/04 | EDGE | P2 | Rank 1 minimum; rank 5+ scales, no cap errors |
| TR-05 | NEG | P1 | Trait 0/undefined → blocks or defaults gracefully, no crash |
| TR-06 | UI | P2 | Individual die results + total shown, exploding 10s handled |
| TR-07 | FUNC | P1 | Exploding dice reroll and add to total |
| TR-08 | FUNC | P1 | Roll history logged with trait name, pool, keep, result |
| RR-01 | FUNC | P0 | Ring roll uses calculated ring value |
| **RR-02** | INTEG | P0 | Ring roll reflects **recalculated** ring after trait change — not a stale cache |
| RR-03 | FUNC | P1 | Void ring roll separate from Void pip pool |
| RR-04/05/06 | EDGE/NEG/UI | P1–P2 | Rank 1; pre-init graceful; bonus source shown |
| SR-01 | FUNC | P0 | Skill roll = trait + skill rank, keep = trait |
| SR-02 | FUNC | P1 | Emphasis bonus/reroll applied |
| **SR-03** | EDGE | P2 | Rank 0 → **verify whether it falls through to Unskilled or trait-only**, and confirm consistency |
| SR-04 | NEG | P1 | Missing trait mapping → error, not a silent 0-dice roll |
| SR-05/06 | INTEG | P1 | Bushi excludes spell skills; shugenja includes them |
| UR-01–UR-05 | — | P0–P2 | Unskilled penalty applied; correct trait; trait-1 minimum; "cannot be used untrained" blocked; labelled distinctly |

### 11.2 Shugenja subsystems

| ID | P | Assertion |
|---|---|---|
| AD-01–AD-04 | P0–P1 | Affinity/deficiency stored, displayed, both-defined applies independently |
| **AD-05** | P0 | Schools with **neither** are visibly highlighted/flagged — not silently blank |
| AD-06 | P2 | Same element as both affinity and deficiency prevented or flagged |
| AD-07 | P1 | Switching schools updates display immediately |
| SC-01–SC-05 | P0–P1 | Normal / affinity / deficiency cast rolls; **no bleed-over between consecutive casts**; result labels which modifier applied |
| **SC-06** | P0 | Rank-1 school + deficiency + Universal spell selecting the deficient element → **effective school rank 0** |
| **SC-07** | P0 | At effective rank 0, cast is **blocked with an explicit message**; other elements unaffected |
| SC-08 | P1 | Same Universal spell with a non-deficient element casts normally |
| SC-09 | P1 | Rank-2+ character: rank reduces by the deficiency's defined penalty, **not necessarily to 0** |
| SS-01–SS-09 | P0–P2 | Slots init per ring/rank; cast consumes; manual clear (single + all, idempotent); bonus slots separately tracked; no slots → blocked; **reapplying school does not duplicate bonus slots**; base vs bonus visually distinct; rank change recalculates without silently resetting |
| SM-01–SM-11 | P0–P1 | Scroll gates learning; deleting scroll removes **and locks**; Memorize costs XP; **memorized survives scroll deletion**; memorized protected from accidental removal; insufficient XP blocked; no-scroll memorize blocked; **double-click doesn't double-charge**; re-adding scroll restores cleanly; XP ledger entry created |
| MF-01–MF-04 | P0–P2 | Mastery filtering; rank-up unlocks; **boundary: exactly-at-threshold spell is included**; malformed mastery data handled |
| US-01–US-04 | P0–P2 | Universal spells for all shugenja; element selection at cast; affinity/deficiency interaction; absent for Bushi |
| KW-01–KW-08 | P0–P2 | Keywords persist and display; **Ward / Craft / Travel / Maho** all present and filterable; Maho triggers its special rule/warning; 3+ keywords legible; zero keywords renders cleanly (no "undefined"); keyword filter ANDs with mastery filter |

### 11.3 State-reset logic — the highest-regression-risk area

| ID | P | Assertion |
|---|---|---|
| RS-01–RS-02 | P0 | Reapplying the same school does **not** duplicate trait or skill bonuses |
| RS-03 | P0 | Switching to a different school fully removes the prior school's bonuses first |
| RS-04 | P0 | Same logic for Family |
| RS-05 | P0 | School + Family in sequence don't cross-contaminate |
| RS-06 | P0 | Reset also correctly reapplies affinity/deficiency and bonus spell slots |
| **RS-07** | P1 | **Reapply 10× in a row** → final state identical to a single clean application |
| RS-08 | P1 | Manually-added points preserved through reapplication |
| RC-01–RC-05 | P0–P1 | Ring = correct formula from its two traits; recalculates immediately; bonuses factor in **and revert**; extremes (1 and 6+); no drift on school reapplication |
| BU-01–BU-04 | P0–P2 | Bushi excludes spell skills; shugenja↔bushi switching adds/removes retroactively; multi-school handled per spec |
| VP-01–VP-06 | P0–P1 | Void pips discrete and separate from ring rank; spend decrements, floors at 0; reset restores to max; spend-at-0 blocked; **rank increase raises the cap without resetting current pips**; pip spend feeds roll bonuses |
| FS-01–FS-07 | P0–P2 | School grants are free at **any** rank; only the delta above the grant costs XP; **reapply doesn't re-charge**; lowering back to the free floor behaves; multiple grants all free; Family + School stacking on one skill computes the correct purchased portion; free vs purchased visually distinguished |

### 11.4 Cross-cutting integration

| ID | P | Assertion |
|---|---|---|
| INT-01 | P0 | Full shugenja build end to end — every subsystem consistent |
| **INT-02** | P0 | **Swap school 3×, family 2×, finalize** → no residual/duplicated bonuses anywhere |
| INT-03 | P1 | XP ledger: `total = starting − (manual skill costs + memorization costs)` exactly; free items contribute 0 |
| INT-04 | P1 | Save/reload preserves slots, memorized spells, affinity, XP, pips |
| INT-05 | P2 | 20+ spell character stays responsive; filtering still correct |
| INT-06 | P1 | Concurrent edits don't corrupt reset logic |

---

## 12. FULL REGRESSION MATRIX

Legend: **U** = untouched · **I** = indirectly touched (shared call path) · **D** = directly changed

| # | Subsystem | Class | Risk | Verified by |
|---|---|---|---|---|
| 1 | `rollDicePool()` | U | Features must not alter shared dice | D1–D7 + 400-sample explosion audit |
| 2 | `showRollResult()` | U | New rollers must fit the existing shape | D11 shape equality; E13–E18 live modal |
| 3 | `applyTenDiceRule()` | U | Arithmetic unchanged | Pinned six-entry vector |
| 4 | Ten Dice Rule on weapon rolls | I | Sibling honours it identically | D10 (`13k4 → 10k5`) |
| 5 | **Ten Dice Rule sees the MODIFIED pool** | D | The whole reason P2 exists | P2 X1/X2, F1 E9/E10, F2 C3/C4, F4 B14 |
| 6 | `rollSkill()` / Skills tab | U | Attack must not diverge from skill rolls | R8, R9 |
| 7 | Skill rows, emphases, XP | U | `getCharacterSkillRank` reads these | R5–R7 |
| 8 | Skill Info modal / free-text mastery | U | Phase 6 deferred | R7 |
| 9 | Phase 4 shadow guard | D | Contract must survive | B41–B45, `source` field retained |
| 10 | `collectData()` | D→frozen | Backward-writable, 42 fields | E7, R12c, every feature's G-section |
| 11 | `applyData()` | I | Loads old + new | E10, E11, L1–L14 |
| 12 | Old save files | I | Rolls must not change | L1–L7 |
| 13 | New saves on old build | I | Forward compat | Legacy keys always written; new keys ignored |
| 14 | `recalcAll()` | D | Gained `refreshAllWeaponRows()`, stance TN, Void TN | C13, C14, R11–R13, R15–R17 |
| 15 | Rings derived from Traits | U | Shares `recalcAll` | R13 |
| 16 | Insight / School Rank | U | Shares `recalcAll` | R16, R17 |
| 17 | Base TN / Initiative autos | U | Shares `recalcAll` | R11, R12, F2 F4, F4 D7 |
| 18 | Spell slots / casting | U | Shares `recalcAll` | R2; F3 D10/D11 |
| 19 | Adv/Disadv & Technique lists | U | — | R2, R3 |
| 20 | Equipment rows & spell scrolls | U | — | R10 |
| 21 | `resetToBaseline()` | I | Must clear new rows | R14, R15 |
| 22 | **Armor TN / Reduction** | U→D | Was manual; stance and Void now write it | F2 C2/D2/D7, F4 D1/D3 |
| 23 | Weapons table layout | D | Column count changed 6 → 7 | C21 cell parity |
| 24 | Single `<script>` block | D | No modules/bundlers | Confirmed in Stage 0 |
| 25 | Feature 0 emphasis re-roll | U | 72/72 |
| 26 | Feature 1 range | U | 80/80 |
| 27 | Feature 2 stances | U | 84/84 |
| 28 | Feature 3 wounds | U | 59/59 |
| 29 | Schoolfree bugfix | U | 30/30 |
| 30 | Part B weapons | U | 127/127 |
| 31 | Registry hygiene | D | No test modifier leaks; sorted by priority | P2 N1, every G-section |
| 32 | Part B damage path | U | **Never routed through P2** | F3 B8/G1/G2, F4 B9/G1/G2 |

---

## 13. PROMPT A — VALIDATION TEST SUITE PROMPT

> Run this **before** writing any harness. Paste it verbatim.

```
You are a senior QA lead validating a test suite against a real build,
before execution begins. You have:

1. This MASTER QA TEST SUITE document (Sections 1-12).
2. The actual L5R character-sheet HTML file.

FIRST, run the Stage 0 reconnaissance snippet from Section 2 in the
browser console and report the Build Identification Report. Every suite
whose feature flag is false is ABSENT, not FAILED.

THEN validate the following and report findings as a numbered list of
gaps or risks. Do NOT rewrite the suite and do NOT modify the sheet.

1. COVERAGE — For every assertion family in Sections 4-11, confirm the
   functions/DOM ids it depends on actually exist in this build. Flag
   any assertion that cannot run because a seam export or element id is
   missing, and say whether that is a legitimate ABSENT feature or a
   real regression.

2. SEAM INTEGRITY — Confirm window.__L5R_TEST__ exposes every symbol
   listed in Section 1.1 for the features that are present. Flag any
   symbol referenced by an assertion but absent from the seam.

3. FROZEN-FUNCTION AUDIT — For each function on the Section 1.2 frozen
   list, confirm it is present and that nothing in the file appears to
   redefine or monkey-patch it. Report the exact line range of each.
   Confirm exactly one <script> block with no src attribute.

4. PERSISTENCE CONTRACT — Confirm collectData().fields has exactly 42
   keys and the 15 top-level keys of Section 1.3. Enumerate every
   non-f_ hidden input the features rely on and confirm none of them
   carries an f_ prefix. Any f_-prefixed feature state is a P0 finding.

5. BOUNDARY COVERAGE — For every rank-based, threshold-based or
   count-based rule (mastery thresholds at ranks 3/5/7, bow strength
   caps, range at listedRange / +1ft / exactly 2x / 2x+1ft, wound level
   thresholds, Void once-per-Round, Ten Dice Rule at 10/11/12/13+
   dice), confirm the boundary value AND one value on each side are
   asserted. List every boundary tested on only one side.

6. STATE-RESET LOGIC — For every subsystem touched by school/family
   reapplication (traits, skills, rings, affinity/deficiency, bonus
   spell slots, free skill floors), confirm a "reapply does not
   duplicate" assertion exists. This is the highest-regression-risk
   area in the codebase; treat a missing one as P0.

7. SCOPE NEGATIVES — For each P2 contributor (range, stance, wounds,
   void), confirm there is an explicit assertion that it does NOT apply
   to weapon damage rolls, and confirm the same for the Feature 0
   emphasis bar. A contributor with no negative-scope test is a P0 gap.

8. INTEGRATION GAPS — Identify any pair of features that interact but
   have no explicit combined assertion. At minimum verify these pairs
   are covered: range+stance, range+wounds, stance+wounds,
   stance+wounds+void, void+range, Full Defense+wounds (the bonus is
   half the PENALISED total), Void TN + Full Attack TN, Center bonus +
   cancelled roll.

9. AMBIGUOUS EXPECTED RESULTS — Flag any assertion whose expected value
   depends on a rule variant not pinned in this document. Known live
   ambiguities to check explicitly:
   - range rounding: ceil vs floor
   - Center's "+1k1 plus Void Ring": +1k1 dice AND +Void total, versus
     (1+Void)k1 in dice
   - wound penalties: flat total modifier (this build's house rule)
     versus RAW's TN increase
   - skill rank 0: falls through to Unskilled, or trait-only
   - the 2x range cap: bows only, or all ranged weapons
   For each, state which reading this build implements and where the
   one-line switch to the other reading lives.

10. DATA SETUP GAPS — Confirm the Section 3 fixtures cover every
    archetype referenced anywhere in the suite: caster, non-caster,
    affinity-only, deficiency-only, neither, both, legacy save,
    dual-wield loadout, wounded character, character with Void spent.

11. TRACEABILITY — Cross-check Section 12's regression matrix against
    Sections 4-11 and flag any row whose "Verified by" test IDs do not
    actually exist in this document or in the build.

12. HARNESS-EVOLUTION DEBT — Section 15 lists invariants that were
    over-specified in earlier suites and had to be loosened (registry
    pinning, Void initiative scope). Scan the current assertions for
    the same anti-pattern: any assertion that pins a fact the feature
    under test does not own, and which will therefore break when the
    NEXT feature ships. Report each with a proposed replacement
    invariant.

OUTPUT FORMAT — one table:
[Category, Finding, Affected Section/Test ID(s), Severity, Suggested Fix]

Then a second table of up to 8 additional high-risk edge cases NOT
currently in this suite that you would add given what you can see in
the actual code:
[Proposed Edge Case, Target Section, Risk Rationale, Why the code
suggests it]

Do not modify the sheet. Do not write the harness yet.
```

---

## 14. PROMPT B — AUTOMATED TEST HARNESS PROMPT

> Run this after Prompt A. Paste it verbatim.

```
You are working on a single-file, vanilla-JS L5R 4e character sheet.
It has no modules, no bundler and no test framework; all code lives in
one <script> block wrapped in an IIFE.

A read-only QA seam is exported at the bottom of that block as
window.__L5R_TEST__. It exposes existing functions only; it adds no
behaviour and no production code path reads it. Section 1.1 of the
MASTER QA TEST SUITE lists every export.

Write self-contained IIFEs that run in the browser console with no
dependencies. Produce one harness file per suite that is PRESENT in
this build, plus one combined runner:

  l5r-partB-test-harness.js          Sections A,B,C,D,E,L        (127)
  l5r-feature0-test-harness.js       Sections A,B,C,D,E,F,G,R     (72)
  l5r-P1-P2-test-harness.js          Sections P1,P2               (46)
  l5r-P1-P2-F1-test-harness.js       F1-A..G + regression         (80)
  l5r-P1-P2-F2-test-harness.js       F2-A..G + regression         (84)
  l5r-P1-P2-F3-test-harness.js       F3-A..G + regression         (59)
  l5r-P1-P2-F4-test-harness.js       F4-A..G + regression         (98)
  l5r-schoolfree-bugfix-harness.js   A..G                         (30)
  l5r-crossversion-signature.js      deterministic fingerprint

REQUIREMENTS

1. FIXTURES — Build state by setting #trait_<key> inputs directly and
   appending real rows via makeSkillRow / makeWeaponRow. NEVER
   hand-write row markup. Use the helpers in Section 3 verbatim.

2. ASSERTIONS — Assert with strict JSON.stringify equality. Record
   {section, id, name, pass, detail} for every check. Provide eq(),
   ok(), no() and rec() helpers with exactly these signatures:
     eq(section, id, name, actual, expected)
     ok(section, id, name, truthyValue)
     no(section, id, name, falsyValue)
     rec(section, id, name, pass, detail)

3. TEST IDS — Every assertion must carry its ID from this document
   (B8, D7, X1, F2-C C3, F4-D D11 ...) in the id field, so a failure
   maps straight back to the suite.

4. FROZEN FUNCTIONS — Treat rollDicePool and showRollResult as frozen.
   For the dice-engine section, sample AT LEAST 400 pools and assert no
   die ever exploded on anything but a 10, and assert
   rollWeaponDicePool returns a result object whose key set is
   IDENTICAL to rollDicePool's.

5. THE CRUX — At least one assertion per dice-modifying feature must
   prove the Ten Dice Rule saw the MODIFIED raw pool, by reading
   #rollModalNotation and comparing against applyTenDiceRule() computed
   on the modified numbers, not the base numbers.

6. LEGACY MIGRATION — Construct pre-Part-B save objects
   {name, roll, dmg, size, notes} with NO key field, and assert their
   Attack/Damage strings are preserved exactly and the row is
   auto-flagged manual, so no existing character's dice change on load.

7. DETERMINISM — Use the seq()/withRandom()/forceDice() helpers from
   Section 3 wherever a specific dice outcome is asserted. Never assert
   a specific total from an unseeded roll.

8. ASYNC — rollWeaponAttack returns a Promise once Feature 1 exists.
   Drive the range prompt by clicking #rangeOptMelee / #rangeOptWithin
   / #rangeOptBeyond (+ #rangeDistInput, #rangeDistConfirm) and then
   awaiting the returned Promise. Melee attacks must still resolve
   synchronously - assert that.

9. HYGIENE — Every harness must leave the registry exactly as it found
   it. Capture BASELINE_IDS at the start and assert against that, not
   against a hardcoded list (see Section 15.1). Unregister every test
   modifier in a cleanup() before the final assertions.

10. REPORTING — Print a console.table summary grouped by section, a
    separate failure table, and return
    {total, passed, failed, results} (plus {suites} for combined
    runners). Warn the user that the Skills and Weapons tables are
    cleared.

11. SUB-SUITE LOADING — The combined runner fetches and evals each
    sub-suite. ALWAYS cache-bust:
      fetch(url + (url.indexOf('?')>=0?'&':'?') + 'cb=' + Date.now())
    A stale cached copy silently reports failures that were already
    fixed. Handle both sync and Promise-returning sub-suites.

12. READ THE PITFALLS — Section 15 of the master document lists eight
    real mistakes previously made writing these harnesses. Read it
    before writing a single assertion; each one cost a debugging cycle.

EXIT CONDITION: failed === 0 on every suite, with every sub-suite
reporting failed: 0.

DO NOT modify the sheet to make a test pass. If a test fails, report
the divergence and its rules citation, and carry it into Prompt D.

TO RUN:
  python -m http.server 8799 --directory "<folder>"
then in the console on the build:
  fetch('/l5r-P1-P2-F4-test-harness.js').then(r=>r.text())
    .then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

---

## 15. PROMPT C — STRESS TESTING & EDGE CASE HUNT

> Run this **after** the harness is green. A green suite proves the known cases; this stage looks for the unknown ones. Paste it verbatim.

```
The written suite now passes. That proves the KNOWN cases. Your job now
is to break the build in ways nobody wrote a test for.

You are a senior QA engineer with an adversarial mindset and access to
the running sheet and its source. Assume the happy path works and
attack everything around it. Write these as REAL additional assertions
appended to the harness, not as prose speculation - a hypothesis you
did not execute is worthless.

ATTACK SURFACES - work through all nine:

1. BOUNDARY SWEEPS. For every numeric rule, sweep the boundary and one
   value each side, programmatically rather than by hand:
   - Ten Dice Rule: every (rolled, kept) pair for rolled 1..15,
     kept 1..12. Assert kept <= rolled always, rolled <= 10 always
     after conversion, and bonus >= 0 always.
   - Range: for listedRange in [1, 25, 50, 250, 1000] sweep distance
     from 0 to 3x listedRange and assert penaltyDice is monotonically
     non-decreasing and beyondMax flips exactly once.
   - Wounds: sweep f_woundsTaken from 0 to Earth*10+20 and assert the
     level name never regresses as wounds increase.
   - Skill ranks 0..10 against every weapon in WEAPON_LIBRARY: assert
     getWeaponDamageDice never returns negative or NaN dice.

2. HOSTILE INPUT. Feed every pure function values it was not designed
   for and assert it degrades rather than throws:
   null, undefined, NaN, Infinity, -1, 0, 999999, '', '   ',
   '5k2' where a number is expected, {}, [], a frozen object,
   a string with unicode/emoji, a name with a trailing space,
   a name 10,000 characters long.
   Specifically: findWeapon, findArrow, findSkill, findStance,
   calculateRangePenalty, validateRangeAttack, getWeaponDamageDice,
   getWeaponAttackDice, applyTenDiceRule, rerollEmphasisDice,
   schoolGrantedRankForSkill, inferSchoolFreeFloor, canSpendVoid,
   applyVoidDamageReduction.

3. ORDERING AND INTERLEAVING. The features assume a tidy sequence.
   Break it:
   - Advance the round MID-ROLL (between rollWeaponAttack and the
     range prompt resolving). Does the Center bonus or Void TN evaluate
     against the wrong round?
   - Change stance while the Full Defense declaration modal is open.
   - Spend a Void Point, then cancel the roll, then spend again -
     is the point refunded, double-spent, or silently lost?
   - Take wounds mid-roll, between showRollResult and a die click.
   - Delete the weapon row whose attack modal is currently open.
   - Call recalcAll() from inside a modal.
   - Fire two rollWeaponAttack() Promises without awaiting the first.

4. STATE LEAKAGE ACROSS ROLLS. The modal body persists while hidden.
   For every pair of consecutive roll kinds (attack→damage,
   attack→skill, spell→manual, initiative→attack, ...), assert the
   second roll shows ONLY its own modifier bar. Do this WITHOUT
   clearing #rollModalBody first, then again WITH clearing, and report
   any case where the two differ - that difference is a real user-
   visible bug even when the harness hides it.

5. IDEMPOTENCE AND REPETITION. Run these 10x in a row and assert the
   final state equals the state after 1x:
   - setCurrentStance to the same stance
   - registerPreRollModifier with the same id
   - applyData with the same payload
   - recalcAll()
   - school/family reapplication (Section 11.3 RS-07)
   - advanceCombatRound then resetCombatRound

6. RESOURCE EXHAUSTION AND LONG SESSIONS.
   - 200 combat rounds: assert the ledger stays trimmed and memory
     does not grow unbounded.
   - 100 weapon rows and 100 skill rows: assert recalcAll() still
     completes and time it.
   - A character with every weapon in WEAPON_LIBRARY equipped.
   - 500 consecutive rolls: assert no listener accumulation on
     #rollDiceRow (count listeners or proxy via a leak canary).
   - Spend Void 50 times across 50 rounds; assert the pip counter
     never goes negative and never exceeds the ring value.

7. SAVE/LOAD TORTURE.
   - Round-trip a save 20 times; assert byte-stability after the first
     recalcAll().
   - Load a save with a weapons array containing: an empty object, a
     row with key set to a weapon that does not exist, a row with
     dmgRoll: 'abc', a row with manualDamage: 'yes' (string not bool),
     a row with 500 keywords, a null entry.
   - Load a save missing entire top-level keys.
   - Load a save with 43 fields (an extra unknown f_ key).
   - Load a save with fields as an array instead of an object.
   Assert: no crash, and clearly document what the sheet does with each.

8. THE FROZEN FUNCTIONS, STATISTICALLY. Beyond the 400-sample audits:
   - 5000 samples of rollDicePool(5,2): assert the observed mean and
     the distribution of chain lengths are consistent with a fair
     exploding d10, and that no die value outside 1..10 ever appears
     as a chain LINK (totals may exceed 10).
   - 5000 samples of rollWeaponDicePool(5,2,9): assert the explosion
     rate is measurably higher than the 10-only sibling, and that the
     ratio is in the neighbourhood of 2:1 as theory predicts. Report
     the actual numbers; a wild deviation is a finding.

9. UI AND ACCESSIBILITY.
   - Tab through the stance tiles and the Void spend buttons - is every
     control keyboard-reachable and does Enter/Space activate it?
   - Assert aria-pressed / aria-checked / disabled states match the
     underlying model after every state change, not just at init.
   - Open every modal and assert ESC closes it and focus is not lost
     to the document body.
   - Emulate a 375px viewport and assert no horizontal page scroll and
     no clipped controls in the weapons table, stance tiles, or Void
     panel.
   - Assert no element renders the literal strings "undefined", "NaN",
     "null" or "[object Object]" anywhere in the document after a full
     fixture build.

RULES OF ENGAGEMENT
- Every hypothesis must become a runnable assertion. Execute it.
- A crash, a silent wrong value, or an unhandled rejection is a
  finding. So is a correct result reached through a code path that
  only works by accident - say so.
- Do NOT modify the sheet. Do not "fix as you go."
- Where a behaviour is undefined rather than wrong, say so explicitly
  and propose which reading should be pinned.

OUTPUT
1. The new assertions, appended to the appropriate harness file, with
   IDs in a new S-prefix range (S-01, S-02, ...).
2. A table: [ID, Attack Surface, What I Tried, Result, Verdict]
   where Verdict is PASS / BUG / RISK / UNDEFINED-BEHAVIOUR.
3. A ranked list of the five findings you consider most likely to bite
   a real player at a real table, with the reasoning.
```

---

## 16. PROMPT D — BUG & RISK LIST + MINIMAL FIXES

> Final stage. Paste it verbatim.

```
You are triaging the L5R character-sheet build against this MASTER QA
TEST SUITE. You have the source, the harness results from Prompt B, and
the stress findings from Prompt C. Your job is to find real bugs and
risks and propose the smallest fixes - not to write more tests and not
to critique the document.

1. WALK BY PRIORITY. Go through P0 first, then P1, in this order:
   a. Frozen-function integrity (Section 1.2) and the persistence
      contract (Section 1.3) - a breach here is P0 by definition.
   b. State-reset logic: school/family reapplication, free skill
      grants, ring recalculation (Section 11.3). Historically the
      highest-regression-risk area in this codebase.
   c. The P2 pipeline ordering guarantee (Section 1.4) - anything that
      lets a dice modifier reach the pool AFTER the Ten Dice Rule.
   d. Scope negatives: any contributor reaching weapon damage rolls.
   e. Void expiry and once-per-Round enforcement (Section 10.2).
   f. Wound level derivation and the Full Defense interaction.
   g. Range legality and the two cancel paths.
   h. Legacy save migration (Section 4.7, Section 8).
   i. The rollers and the shugenja subsystems (Section 11).

2. FOR EACH FAILING OR SUSPICIOUS CASE, trace the ACTUAL code path.
   Read the relevant functions directly; do not assume. If a case
   depends on a rule variant this document leaves open (Section 13
   item 9 lists them), state which reading you are checking against.

3. CLASSIFY every finding as exactly one of:
   - BUG: the code demonstrably produces the wrong result for a stated
     expected result. Cite the test ID.
   - RISK: no explicit handling exists for a case, even if not yet
     observed failing. Flag these especially for state-reset logic,
     registry hygiene, and any modifier that could reach a damage roll.
   - UNVERIFIABLE: cannot be determined from static reading alone.
     State exactly what runtime check would settle it.

4. SEVERITY. Rate each BUG/RISK:
   - P0: breaks core gameplay, corrupts character state, silently
     changes an existing character's dice, or breaches the frozen list
     or the 42-field save contract.
   - P1: incorrect but contained and recoverable.
   - P2: cosmetic or minor.
   Base this on the test case's own priority PLUS blast radius. A bug
   in reapply-reset logic that silently duplicates bonuses is P0 even
   when the visible symptom looks minor.

5. MINIMAL FIX PROPOSAL. For each BUG and each RISK you are confident
   about:
   - Name the exact file and function.
   - Describe the fix in 1-3 sentences BEFORE showing any diff.
   - Show the diff.
   - Prefer a targeted fix (a guard clause, a clear-before-apply, an
     off-by-one correction, a scope filter) over a refactor. If a
     proper fix genuinely needs a structural change, say so explicitly
     and propose the minimal SAFE interim patch instead.
   - State which existing assertions the fix must keep green, and
     which new assertion would have caught it.
   - Respect the freeze: if the only correct fix touches a frozen
     function, say so plainly and propose the call-site alternative,
     as Feature 3 did when it re-pointed seven showRollResult call
     sites rather than touching showRollResult.
   - Do not fix things the suite does not call for. No unrelated
     stylistic changes.

6. ROLLBACK LADDER. For every fix, state its rollback: the single
   smallest edit that reverts it, and whether any save migration would
   be needed in either direction. (For every feature so far the answer
   has been "none" - if your fix breaks that property, that is itself
   a finding.)

OUTPUT FORMAT

Table 1 - Findings:
[Test ID(s), Classification, Severity, File/Function, Finding Summary,
 Minimal Fix Summary]

Table 2 - Unverifiable:
[Item, Why static reading is insufficient, Exact runtime check needed]

Then the actual proposed diffs, grouped by severity, P0 first, each
preceded by its 1-3 sentence description.

Finally, a Risk Register for anything you would NOT fix now but a
maintainer should know about: [Risk, Why not fixing now, What would
trigger fixing it].

DO NOT APPLY ANY FIXES. Output diffs for review only. Ask before
touching anything outside the files directly implicated by a finding.
```

---

## 17. HARNESS PITFALLS — READ BEFORE WRITING ASSERTIONS

Eight real mistakes made writing these harnesses. Each cost a debugging cycle and produced a false failure or a false pass.

### 17.1 Never pin the registry to a literal list

This has now bitten **three times**:

| Broke | Assertion | Killed by |
|---|---|---|
| Feature 2 `G12` | registry is exactly `['range','stance']` | Feature 3 adding `wounds@40` |
| Feature 3 `G3`/`G4` | registry is exactly `['range','stance','wounds']` at `20/30/40` | Feature 4 adding `void@50` |
| Feature 4 `A3` | registry is exactly the four at `20/30/40/50` | **Feature 5 adding `technique@60`** |

Each time the fix was the same, and each time the *next* feature broke it again — because the assertion pinned a fact the feature under test does not own.

**The right invariant:** *my contributor is registered at my priority, the earlier features' are still at theirs, the registry is sorted ascending, and no `t_`-prefixed test modifier leaked.* A feature does not own the full list.

```js
// WRONG
eq('G','G3','Registry is exactly range/stance/wounds',
   T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id).sort(),['range','stance','wounds']);

// RIGHT
ok('G','G3a','Feature 3 registered wounds at priority 40',
   T.PREROLL_MODIFIER_REGISTRY.some(m=>m.id==='wounds' && m.priority===40));
ok('G','G3b','Earlier contributors still present at their priorities',
   T.PREROLL_MODIFIER_REGISTRY.some(m=>m.id==='range'  && m.priority===20) &&
   T.PREROLL_MODIFIER_REGISTRY.some(m=>m.id==='stance' && m.priority===30));
eq('G','G4','Registry is ordered by ascending priority',
   T.PREROLL_MODIFIER_REGISTRY.map(m=>m.priority),
   T.PREROLL_MODIFIER_REGISTRY.map(m=>m.priority).slice().sort((a,b)=>a-b));
eq('G','G4b','No test modifiers leaked',
   T.PREROLL_MODIFIER_REGISTRY.filter(m=>/^t_/.test(m.id)).map(m=>m.id),[]);
```

### 17.2 Closing the modal only HIDES it

`showRollResult()` rebuilds `#rollModalBody` on the **next** roll. A previous roll's modifier bar lingers in the hidden body. Any test asserting *"no bar was created"* reads the **last** roll's bar unless the body is cleared first.

```js
const closeRoll = () => {
  document.getElementById('rollModalOverlay').style.display='none';
  document.getElementById('rollModalBody').innerHTML='';   // <- the critical line
};
```

This produced false failures at Feature 1's `F4`/`F9`. Note the mirror-image trap: reading `barText()` **after** `closeRoll()` compares against an empty string — which produced a false *pass* at Feature 4's `F8`. **Read the bar before closing.**

### 17.3 You cannot pin the Earth Ring by writing to `#ring_earth`

`recalcAll()` recomputes every Ring as `min()` of its two Traits. A hardcoded "wounds taken" number is only valid for one Earth value. Derive it from the live thresholds:

```js
const setWoundLevel = name => {
  T.recalcAll();                                  // settle Earth from the Traits
  const earth = parseInt(document.getElementById('ring_earth').value||'2',10);
  const th = T.computeWoundThresholds(earth);
  const idx = T.WOUND_LEVELS.findIndex(l=>l.name===name);
  document.getElementById('f_woundsTaken').value = idx<=0 ? 0 : th[idx];
  T.recalcAll();
};
```

The same applies to every Ring. Set the **Traits**, not the Ring.

### 17.4 Always cache-bust sub-suite fetches

Sub-suites are edited between runs. A stale cached copy silently reports failures that were already fixed — this happened twice, in Feature 1 and again in Feature 3.

```js
const res = await fetch(url + (url.indexOf('?')>=0?'&':'?') + 'cb=' + Date.now());
```

### 17.5 Init wiring has an ordering constraint

The first Feature 2 splice threw `Cannot access 'STANCE_LIBRARY' before initialization` — the stance UI wiring had been placed next to the weapon quick-add init, roughly 2,300 lines **before** the Feature 2 `const` block. A temporal dead zone.

**Any feature that adds init wiring must put it in the `init()` IIFE at the bottom of the script.** The sheet's one-IIFE structure makes "where the wiring sits" a real ordering constraint, not a stylistic choice.

### 17.6 Call `recalcAll()` before snapshotting a save

`collectData()` captures derived fields (insight, rings, XP, TN, initiative) exactly as they stand, while `applyData()` **recomputes** them on load. A save taken **before** `recalcAll()` has settled those fields will not round-trip identically.

This is inherent to the sheet — verified identical on the Feature 0 build with no P1/P2 present — and in normal use every input path calls `recalcAll()`. But any harness must call it before snapshotting.

### 17.7 Automated code extractors lie about frozen functions

An early extractor flagged `applyTenDiceRule` as changed. It was a bug in the extractor — it treated the apostrophe in the comment *"there's genuinely no room left"* as a string delimiter. Direct byte-comparison of the region returned the same hash in all three builds.

**Verify a frozen-function change with a direct byte-comparison and a whole-file `diff` line count, never with a naive parser.** "Zero removed lines" in a whole-file diff is the strongest available proof of the freeze.

### 17.8 `rollWeaponAttack` is async once Feature 1 exists

Melee attacks still resolve **synchronously** (the `async` conversion never reaches an `await` for melee) — assert that. Ranged attacks return a Promise that resolves only after the range prompt is driven:

```js
async function attackWithRange(row, choice, distance){
  const p = T.rollWeaponAttack(row);          // modal renders synchronously
  if(choice==='melee')  document.getElementById('rangeOptMelee').click();
  if(choice==='within') document.getElementById('rangeOptWithin').click();
  if(choice==='cancel') document.getElementById('rangePickClose').click();
  if(choice==='beyond'){
    document.getElementById('rangeOptBeyond').click();
    const inp=document.getElementById('rangeDistInput');
    inp.value=String(distance);
    inp.dispatchEvent(new Event('input'));
    document.getElementById('rangeDistConfirm').click();
  }
  await p;
  return p;
}
```

Forgetting the `await` produces assertions that run before the modal exists.

---

## 18. ROLLBACK LADDERS

Every feature is additive and independently reversible. No save migration is ever required in either direction — nothing new is persisted. If a proposed fix breaks that property, that is itself a finding.

| Feature | Full revert | Feature off | Surgical |
|---|---|---|---|
| **Part B** | Delete `part B complete.html`, resume from `phase 5 complete.html` | In `buildWeaponQuickAdd()` return early; in `makeWeaponRow()` force `key = ''` | Remove `refreshAllWeaponRows()` from `recalcAll()` |
| **Feature 0** | Return to the Part B build | `attachEmphasisReroll()` → `return null;` on line 1 | Delete the two `attachEmphasisReroll(...)` call lines; or flip `EMPHASIS_REQUIRE_SELECTION` to swap A↔B |
| **P1 / P2** | Return to the Feature 0 build | Revert the two call sites to `showRollResult(title, rollDicePool(...))` | Leave the registry empty — already a mathematical no-op |
| **Feature 1** | Return to the P1/P2 trunk | `unregisterPreRollModifier('range')` | `if(isRangedWeapon(ctx.entry))` → `if(false)` kills the prompt; `Math.ceil` → `Math.floor` switches the rounding reading; guard `beyondMax` on `entry.skill === 'Kyujutsu'` limits the 2× cap to bows |
| **Schoolfree fix** | Return to the Feature 1 build | Restore `Math.max(1, data.rank\|\|1)` in the `data-free` expression | `inferSchoolFreeFloor` → `return Math.min(1, rank)` for first-rank-free only |
| **Feature 2** | Return to the trunk | `unregisterPreRollModifier('stance')` | `getStanceArmorTNBonus()` → `return 0` disables TN; delete the `INITIATIVE` branch; move `voidRing` from `totalDelta` to `rolledDelta` to switch the Center reading; remove the Full Attack check in `rollWeaponAttack` to stop refusing ranged |
| **Feature 3** | Return to the Feature 2 build | `unregisterPreRollModifier('wounds')` | Restore one `showRollResult(...)` call site to un-route that roll kind; return `null` from `woundPreRollModifiers` and surface the TN increase instead to revert to RAW |
| **Feature 4** | Return to the Feature 3 build | `unregisterPreRollModifier('void')` | `renderVoidPanel()` returns early kills the UI; edit `VOID_EFFECT_VALUES` for the numbers; move V3 back to `recordRoundSpend('voidInit', true)` for per-round expiry; revert the four `explodeOverride` edits; remove the `voidDamageRow` handlers for V6 only |

---

## 19. RUNNING EVERYTHING

```bash
python -m http.server 8799 --directory "<the folder containing the build and the harnesses>"
```

Open the build in a browser, then in DevTools → Console:

```js
fetch('/l5r-P1-P2-F4-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Or a single suite directly:

```js
fetch('/l5r-partB-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
```

**Every harness is DESTRUCTIVE:** it clears the Skills and Weapons tables and resets stance, rounds, wounds and Void state. Save the character first. None of them touches `localStorage`.

**Exit condition: `failed === 0` across every suite, with every sub-suite reporting `failed: 0`.**

---

## 20. FINAL DELIVERABLES CHECKLIST

At the end of all four stages, produce:

- [ ] **Build Identification Report** (Stage 0) — features present, registry, save shape, Ten Dice vector
- [ ] **Suite Validation Findings** (Prompt A) — coverage/boundary/scope/ambiguity gaps, plus up to 8 proposed new edge cases
- [ ] **Harness files** (Prompt B) — one per present suite, plus the combined runner and the cross-version signature
- [ ] **Harness results** — `console.table` per section, failure table, totals per suite, grand total
- [ ] **Stress findings** (Prompt C) — new `S-`prefixed assertions, the attack-surface table, and the top-five ranked findings
- [ ] **Bug & Risk List** (Prompt D) — findings table, unverifiable table, diffs grouped by severity (NOT applied), risk register
- [ ] **Regression matrix** — Section 12, with an actual result in every row
- [ ] **Rollback statement** — for any fix proposed, its rollback and whether any migration is needed
