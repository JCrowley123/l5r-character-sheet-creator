# PART B — Core Weapons System: Validation, Regression & Harness

**Build:** `l5r-character-sheet part B complete.html`
**Baseline (rollback point):** `l5r-character-sheet phase 5 complete.html` — unmodified
**Harness:** `l5r-partB-test-harness.js`
**Status:** 127/127 harness assertions pass · 17/17 whole-sheet regression checks pass

---

## 1. What Part B added

| Architecture layer | Added |
|---|---|
| Static reference data | `WEAPON_LIBRARY` (48 canonical weapons), `ARROW_LIBRARY` (5 arrows), `DEFAULT_ARROW`, `WEAPON_SKILL_ORDER` |
| Lookups | `findWeapon()`, `findArrow()`, `getCharacterSkillRank()` |
| Row factory | `makeWeaponRow()` rewritten; `applyWeaponLibraryLink()`, `refreshWeaponRow()`, `refreshAllWeaponRows()`, `showWeaponInfoModal()`, `buildWeaponQuickAdd()` |
| Hidden-input state | `.wp-key`, `.wp-skill`, `.wp-dmg-roll`, `.wp-dmg-keep`, `.wp-keywords`, `data-manual-attack`, `data-manual-damage` |
| Pure calculation | `getWeaponAttackDice(weaponSkillName)`, `getWeaponDamageDice(weaponEntry, skillRank, opts)` |
| Orchestration | `resolveWeaponContext()`, `rollWeaponAttack()`, `rollWeaponDamage()` |
| Dice (isolated sibling) | `rollExplodingD10At()`, `rollWeaponDicePool()` |
| Save/load | `collectData()` weapons block extended; `makeWeaponRow()` handles legacy + structured |
| QA seam | `window.__L5R_TEST__` (read-only export, no production consumer) |

**Phase 4 stub replaced.** The old shadow-mode `getWeaponDamageDice()` stub is gone; the real
function preserves its safety contract verbatim — structured mastery is applied **only** when it
agrees with the independently hand-authored `getLegacyMasteryBonus()`, otherwise the legacy values
are used and `source` reports `'legacy-fallback'`.

**Phase 6 remains deferred.** Free-text `m:{...}` mastery is untouched for Kenjutsu, Heavy Weapons
and Ninjutsu; the Skill Info modal is unchanged; `getLegacyMasteryBonus()` is retained because the
shadow guard still depends on it.

---

## 2. Damage assembly order

```
1. Base DR          weapon.damage, or weapon.damageOverride[highest rank reached]  (blowgun only)
2. Ammunition       bows only — arrow supplies the DR
3. Trait            Strength (default) | Perception (gunpowder) | bow rating capped by Strength | none
4. Structured mastery  dmgBonus / explodeOn / reductionMod, behind the shadow guard,
                       skipped entirely when weapon.masteryDamageExempt
```

Attack is always `Skill Rank + Trait` rolled, `Trait` kept — byte-identical to `rollSkill()`, so a
weapon attack and a Skills-tab roll of the same skill can never disagree.

---

## 3. Validation Test Suite (127 assertions)

| Section | Area | Count | Covers |
|---|---|---:|---|
| A | Library data integrity | 10 | Required-field shape, every `skill` resolves in `SKILL_LIBRARY`, size vocabulary, no duplicate names, size not duplicated into `keywords`, case-insensitive lookup, bows declare `bowStrength`+`ammo`, arrow DR numeric, `DEFAULT_ARROW` resolves |
| B | Pure calculation | 51 | Attack dice (skilled / Rank 0 / no row / Reflexes skills / "Agility or Reflexes"), Kenjutsu +1k0 and explode-on-9, Heavy Weapons reduction −2 and explode-on-9, Ninjutsu cumulative +1k1, blowgun override table, bow Strength capping, arrow selection, Perception routing, flat-DR weapons, shadow-guard agreement, conditional mastery **not** auto-applied, purity |
| C | Row factory | 21 | Auto-fill of Attack/Damage/Size/Skill/Notes, hidden structured fields, case-insensitive linking by typing, reactivity through `recalcAll()`, manual-override flagging and release, row/header cell parity |
| D | Dice engine regression | 13 | `rollDicePool` pool sizes, keep count, total arithmetic, Ten Dice Rule, **explodes on 10 only** (400 samples), sibling explodes on 9+ but never below (400 samples), sibling shape identical, sibling with `null` behaves like 10-only, threshold clamping |
| E | Save / load | 18 | Quick-add rows, legacy fields still written, structured fields written, manual flags written, `collectData → applyData → collectData` stability, end-to-end button clicks and modal titles |
| L | Legacy migration | 14 | Pre-Part-B rows keep their exact Attack/Damage, auto-flag manual, still gain the Skill link, empty boxes link fully, unrecognised names stay free-text, explicit `key:""` never re-linked |

### Key rules-correctness assertions

| ID | Assertion |
|---|---|
| B8 | Katana @ Kenjutsu 3 = **7k2** (DR 3k2 + Str 3 + 1k0 mastery) |
| B10 | Kenjutsu 7 sets `explodeOn: 9` — *the Phase 1 gap Part B was meant to close* |
| B15/16 | Heavy Weapons 3 → Reduction −2; Rank 7 → explode-on-9 **and** −2 |
| B21 | Shuriken @ Ninjutsu 7 = 5k2 (cumulative +1k1, not +1k0 twice) |
| B22–25 | Blowgun uses its own override table and is exempt from Ninjutsu's generic bonus |
| B26/27 | Yumi (rating 3): Strength 2 → capped to 2; Strength 4 → capped to bow's 3 |
| B33 | Pistol adds **Perception**, not Strength |
| B46–49 | Polearms 5, Spears 3, Staves 7, Ninjutsu 5 conditional bonuses are **never** auto-applied |

---

## 4. Regression Test Matrix

Legend: **U** = untouched by Part B · **I** = indirectly touched (shared call path) · **D** = directly changed

| # | Subsystem | Class | Risk | Verified by | Result |
|---|---|---|---|---|---|
| 1 | `rollDicePool()` | U | Weapons must not alter shared dice | D1–D7 + 400-sample explosion audit | PASS — explodes on 10 only |
| 2 | `showRollResult()` | U | New roller must fit existing shape | D11 shape equality; E13–E18 live modal | PASS |
| 3 | `applyTenDiceRule()` | U | Ten Dice Rule unchanged | D4, D5, D10 | PASS |
| 4 | Ten Dice Rule on weapon rolls | I | Sibling must honour it identically | D10 (13k4 → 10k5) | PASS |
| 5 | `rollSkill()` / Skills tab rolls | U | Attack must not diverge from skill rolls | R8, R9 (title still `Kenjutsu`) | PASS |
| 6 | Skill rows, emphases, XP | U | `getCharacterSkillRank` reads these | R5–R7 | PASS |
| 7 | Skill Info modal / free-text mastery | U | Phase 6 deferred | R7; no edit to `m:{}` or modal | PASS |
| 8 | Structured mastery helpers (Phase 2) | U | Now have a real caller | B41–B45 | PASS |
| 9 | Phase 3 debug UI | U | Still reads the same helpers | Unmodified code path | PASS |
| 10 | Phase 4 shadow guard | D | Contract must survive | B41–B45, `source` field retained | PASS |
| 11 | `collectData()` | D | Must stay backward-writable | E7 (legacy keys present) | PASS |
| 12 | `applyData()` | I | Must load old + new | E10, E11, L1–L14 | PASS |
| 13 | Old save files | I | Rolls must not change | L1–L7 | PASS — values preserved, auto-flagged manual |
| 14 | New save files on old build | I | Forward compat | Legacy keys still written; new keys ignored by old parser | PASS by construction |
| 15 | `recalcAll()` | D | Added `refreshAllWeaponRows()` | C13, C14, R11–R13, R16, R17 | PASS |
| 16 | Rings derived from Traits | U | Shares `recalcAll` | R13 | PASS |
| 17 | Insight / School Rank | U | Shares `recalcAll` | R16, R17 | PASS |
| 18 | Base TN / Initiative autos | U | Shares `recalcAll` | R11, R12 | PASS |
| 19 | Spell slots / casting | U | Shares `recalcAll` | R2; no edits to spell code | PASS |
| 20 | Adv/Disadv & Technique lists | U | — | R2, R3 | PASS |
| 21 | Equipment rows & spell scrolls | U | — | R10 | PASS |
| 22 | `resetToBaseline()` | I | Must clear new rows | R14, R15 | PASS |
| 23 | Armor TN / Reduction | U | **Must stay manual** | No code touches them; B15 only *reports* the modifier | PASS |
| 24 | Weapons table layout | D | Column count changed 6 → 7 | C21 cell parity; no horizontal overflow | PASS |
| 25 | Single `<script>` block | D | No modules/bundlers | One `<script>` tag confirmed | PASS |

---

## 5. Automated Test Harness Prompt

Use this verbatim to re-run or extend the harness in a fresh session.

> You are working on a single-file, vanilla-JS L5R 4e character sheet at
> `l5r-character-sheet part B complete.html`. It has no modules, no bundler and no test
> framework; all code lives in one `<script>` block wrapped in an IIFE.
>
> A read-only QA seam is exported at the bottom of that block as `window.__L5R_TEST__`.
> It exposes the static libraries (`WEAPON_LIBRARY`, `ARROW_LIBRARY`, `SKILL_LIBRARY`),
> the lookups (`findWeapon`, `findArrow`, `findSkill`, `getCharacterSkillRank`), the pure
> calculation functions (`getWeaponAttackDice`, `getWeaponDamageDice`), the dice functions
> (`rollDicePool`, `rollWeaponDicePool`, `rollExplodingD10At`, `applyTenDiceRule`,
> `formatRollNotation`), the row factories (`makeSkillRow`, `makeWeaponRow`,
> `refreshWeaponRow`, `refreshAllWeaponRows`, `applyWeaponLibraryLink`), the orchestration
> wrappers (`resolveWeaponContext`, `rollWeaponAttack`, `rollWeaponDamage`) and save/load
> (`collectData`, `applyData`, `recalcAll`, `resetToBaseline`, `clearAllRows`).
> The seam adds no behaviour and no production code path reads it.
>
> Write a self-contained IIFE that runs in the browser console with no dependencies and:
>
> 1. Builds fixtures by setting `#trait_<key>` inputs directly and appending real rows via
>    `makeSkillRow` / `makeWeaponRow` — never by hand-writing row markup.
> 2. Asserts with strict `JSON.stringify` equality and records
>    `{section, id, name, pass, detail}` for every check.
> 3. Covers six sections: **A** library data integrity, **B** pure calculation,
>    **C** row factory, **D** dice-engine regression, **E** save/load, **L** legacy migration.
> 4. For section D, treats `rollDicePool` and `showRollResult` as **frozen**: sample at least
>    400 pools and assert no die ever exploded on anything but a 10, and assert
>    `rollWeaponDicePool` returns a result object whose key set is identical to
>    `rollDicePool`'s.
> 5. For section L, constructs pre-Part-B save objects — `{name, roll, dmg, size, notes}`
>    with **no `key` field** — and asserts their Attack/Damage strings are preserved exactly
>    and the row is auto-flagged manual, so no existing character's dice change on load.
> 6. Prints a `console.table` summary grouped by section, a separate failure table, and
>    returns `{total, passed, failed, results}`.
> 7. Warns the user that it clears the Skills and Weapons tables.
>
> Exit condition: `failed === 0`. Do not modify the sheet to make a test pass — if a test
> fails, report the divergence and its rules citation.

**To run:** serve the folder (`python -m http.server 8777 --directory <folder>`), open the sheet,
then paste `l5r-partB-test-harness.js` into the console. Or, from the console:

```js
fetch('/l5r-partB-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
```

---

## 6. Part B rollback plan

Part B is additive and isolated — three levels of rollback are available.

| Level | Action | Effect |
|---|---|---|
| **Full** | Delete `part B complete.html`; resume from `phase 5 complete.html` | Complete revert. Saves written by Part B still load on the old build (legacy `name/roll/dmg/size/notes` keys are always written; new keys are ignored). |
| **Feature-off** | In `buildWeaponQuickAdd()` return early, and in `makeWeaponRow()` force `key = ''` | Every row becomes a free-text custom row with the original roll behaviour; library, pure functions and tests stay in place. |
| **Surgical** | Remove `refreshAllWeaponRows()` from `recalcAll()` | Weapon rows stop auto-updating but keep their last computed values; nothing else changes. |
| **Seam only** | Delete the `window.__L5R_TEST__` block | Removes QA tooling only; no behavioural effect. |

**Save-file compatibility:** Part B never removes or renames a saved field. Weapon rows gained
`key`, `skill`, `dmgRoll`, `dmgKeep`, `keywords`, `manualAttack`, `manualDamage`. `key === ''`
means "deliberately custom"; `key === undefined` means "written before Part B" — the distinction
is what drives the migration path in `makeWeaponRow()`.
