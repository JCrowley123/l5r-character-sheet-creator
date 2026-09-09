# Part C — Feature 4: Void Point Automation

**Build:** `l5r-character-sheet part C feature 4 void.html` (1,107,925 chars)
**Trunk:** `PART C — Feature 3 Wound Penalties/l5r-character-sheet part C feature 3 wounds.html`
**Harness:** `l5r-P1-P2-F4-test-harness.js`

| Suite | Result |
|---|---:|
| **Feature 4** | **96/96** |
| Feature 3 | 59/59 |
| Feature 2 | 84/84 |
| Feature 1 | 80/80 |
| P1 + P2 | 46/46 |
| Feature 0 | 72/72 |
| Part B | 127/127 |
| Schoolfree bugfix | 30/30 |
| **Total** | **594** |

Diff vs trunk: **352 added, 7 removed.** Every removed line is in `recalcAll()`, the P2 pipeline
(my own prerequisite, not a frozen function), or a button handler. `rollDicePool`,
`rollWeaponDicePool`, `showRollResult`, `collectData`, `applyData`, the Ten Dice Rule and Part B's
damage logic are untouched. Save still has exactly 42 fields.

---

## RAW values — corrected on review

An earlier draft of the brief specified **+1** for the Armor TN and Initiative bonuses. That was
reviewed and corrected to RAW's **+10**, and this build ships the RAW figures:

```js
const VOID_EFFECT_VALUES = Object.freeze({
  tnBonus: 10,          // RAW: "Increase his Armor TN by 10 for one round."
  initiativeBonus: 10,  // RAW: "Increase his Initiative Score by 10 for the duration of the current skirmish."
  damageReduction: 10,  // RAW: "Reduce the amount of Wounds suffered from one source of damage by 10."
});
```

Nothing hardcodes these numbers — the spend-button labels, the modifier-bar text and every test
read from the constant, so the values can be changed in one place without touching anything else.

### Initiative is now skirmish-wide, not per-round

The second half of the correction. RAW scopes the two combat effects differently:

| Effect | RAW duration | Implementation |
|---|---|---|
| V2 Armor TN | **one round** | P1 round ledger — expires on its own at round advance |
| V3 Initiative | **the current skirmish** | `voidInitSkirmish` flag — survives round advance |

V3 therefore moved off the round ledger onto a skirmish-scoped flag, cleared by
`clearVoidSkirmishEffects()` when combat resets. That teardown is a named function rather than
inline in the reset handler, so the button and the test harness clear it the same way — otherwise
the flag leaks between harness sections and quietly poisons later tests.

Asserted at **D11** (survives one round advance), **D11b** (survives several), **D11c** (V2 still
*does* expire, proving the two are scoped differently), **D11d** (reset clears it) and **D11e**
(reports 0 outside combat regardless of the flag).

## Two design decisions worth explaining

### V4 (+1 Trait) is mechanically identical to V1 (+1k1)

Every standard L5R roll is `(Trait + Rank)k(Trait)` — the Trait is counted in **both** the rolled
and the kept dice. So raising it by one adds exactly one rolled die and one kept die, which is
`+1k1`. This isn't an approximation; it's arithmetic (asserted at C2: 10k3 → **11k4**).

They remain separate options because they are separate RAW choices, they read differently in the
modifier bar, and only one Void Point may be spent per Round anyway.

### V6 asks for the damage total instead of intercepting a roll

Your §1 says "intercept damage total after Part B computes it". I didn't, for two reasons:

1. §2.6 forbids touching Part B's damage logic.
2. More importantly, your own spec requires V6 to work for **falling and environmental damage** —
   which produce no damage roll to intercept at all.

So the panel asks for the announced damage total. That covers every damage source with zero
changes to Part B, and it matches RAW's own framing ("immediately after the damage total is
**announced**"). `finalDamage = max(0, total − 10)` is written to `f_woundsTaken` and `recalcAll()`
fires, so Feature 3's wound penalties update on the spot (E5).

---

## One P2 extension was required

V5 (+1 Skill Rank, 0 → 1) doesn't only add a die — at Rank 0 it also **lifts the Unskilled
penalty**, which is a change to how dice *explode*, not how many there are. The pipeline had no way
to express that, so modifiers gained an optional `explodeOverride`:

- `getPreRollModifiers` carries it through normalisation (it was silently dropping unknown fields)
- `applyPreRollModifiers` collects it — last explicit value wins
- `rollWithModifiers` uses it in place of the caller's `explode` when present

`undefined` means "don't care", so with no Void spent the pipeline is byte-identical (C11).

---

## Validation Suite (89 Feature 4 assertions + 7 regression wrappers)

| § | Area | Count | Covers |
|---|---|---:|---|
| F4-A | Library, state, gating | 14 | All six options; combat-only gating; no-points refusal; **once-per-Round in combat**; no limit out of combat; pip decrement |
| F4-B | V1 across every roll kind | 21 | attack/skill/spell/trait/ring/initiative/manual; never damage; end-to-end 10k3 → 11k4; expiry; out-of-combat skill, manual and spell rolls |
| F4-C | V4 and V5 | 11 | +1 Trait → 11k4; +1 Skill → 11k3; both expire; **no permanent stat change**; `explodeOverride` plumbed end to end |
| F4-D | V2 and V3 | 15 | Armor TN raised; stacks additively with Full Attack's −10; **V2 expires per round**; **V3 survives the skirmish**; Initiative display and roll; V3 refuses non-Initiative rolls |
| F4-E | V6 damage reduction | 9 | 25 → 15 Wounds; floors at 0; wound penalties update; point consumed; refused with no points; works out of combat |
| F4-F | Combination | 8 | Stance + wounds + Void = 13k5 −3; range + wounds + Void = 5k4 −3; die-click recomputation; bar ordered by priority |
| F4-G | Negative scope & hygiene | 11 | Damage rolls untouched **and don't consume a pending Void**; 42 fields; round trip stable; **zero-change guarantee** |

### Combination proof (F1–F3)

Kenjutsu 7 + Agility 3, Full Attack, Nicked, Void +1k1:

```
10k3  →  stance +2k1  →  12k4  →  void +1k1  →  13k5
total = kept dice + Ten Dice bonus − 3
```

Bar lists all three in priority order: range (20) → wounds (40) → void (50), asserted at F8.

---

## Harness evolution — one change, per §6.4

**Feature 3's `G3` / `G4`** pinned the registry to exactly `['range','stance','wounds']` at
`20/30/40`.

- **Why required:** Feature 4 registers `void@50`, so the literal list is now wrong — and would
  break again at Features 5, 6 and 7.
- **What evolved:** from "the registry is exactly this list" to "my contributor is registered at
  my priority, the earlier ones are still at theirs, the registry is sorted, and no *test*
  modifier leaked."
- **Why correct:** the full list is not Feature 3's to own. Pinning it made every later feature
  edit a finished suite. This is the same correction already applied to Feature 2's `G12`.

`G3/G4` became `G3a/G3b/G4/G4b`, which is why Feature 3 now reports **59** rather than 57.

### Second change: `D11`

**Feature 4's own `D11`** asserted "V3 expires at round advance".

- **Why required:** that matched the earlier round-scoped draft. RAW says the Initiative bonus
  lasts "for the duration of the current skirmish", so the assertion now tests behaviour that is
  deliberately gone.
- **What evolved:** from "expires at round advance" to "survives round advance, and is cleared
  only when the skirmish resets" — plus a companion assertion that V2 still *does* expire per
  round, so the two different durations are pinned against each other rather than assumed.
- **Why correct:** it is the RAW behaviour, and testing V2 and V3 side by side is what stops a
  future change silently collapsing them back into one scope.

`D11` became `D11 / D11b / D11c / D11d / D11e`, and `A4` now pins all three constants rather than
only the damage reduction — which is why Feature 4 reports **96** rather than 92.

### One failure of my own, found and fixed

`F4-F F8` read the modifier bar *after* `closeRoll()`, which wipes `#rollModalBody` — so it was
comparing `indexOf` results on an empty string. Moved before the close. Same class of stale-DOM
mistake as Feature 1's `F4/F9`; worth watching for in every future harness.

---

## Regression Matrix

| # | Check | Result |
|---|---|---|
| 1 | Frozen dice functions unmodified | PASS |
| 2 | `collectData` / `applyData` unmodified | PASS |
| 3 | Ten Dice Rule logic unchanged | PASS — sees the Void-modified pool (B14) |
| 4 | Part B damage logic unmodified | PASS — V6 never touches it |
| 5 | Feature 3 wounds intact | PASS — 59/59 |
| 6 | Feature 2 stances intact | PASS — 84/84 |
| 7 | Feature 1 range intact | PASS — 80/80 |
| 8 | P1/P2 pipeline intact | PASS — 46/46 (extension is additive) |
| 9 | Feature 0 emphasis re-roll intact | PASS — 72/72 |
| 10 | Part B weapons intact | PASS — 127/127 |
| 11 | Schoolfree bugfix intact | PASS — 30/30 |
| 12 | Void + stance + wounds + range additive | PASS — F1–F7 |
| 13 | Damage rolls unaffected except V6 | PASS — B9, G1, G2 |
| 14 | Void effects expire correctly | PASS — B15, C3, C7, D4, D11 |
| 15 | No permanent stat changes | PASS — C4, C8, G4 |
| 16 | No new save fields | PASS — G5 (42), G6, G7 |
| 17 | Zero-change guarantee with no Void spent | PASS — G9, G10, G11 |

---

## Rollback

| Level | Action | Effect |
|---|---|---|
| Full | Return to the Feature 3 build | Complete revert; nothing persisted, no migration |
| Feature off | `unregisterPreRollModifier('void')` | Roll effects stop; panel remains |
| Panel off | Make `renderVoidPanel()` return early | No spend UI at all |
| Effect values | Edit `VOID_EFFECT_VALUES` | Single source of truth; labels, bar text and tests all follow |
| Skirmish scope | Move V3 back onto `recordRoundSpend('voidInit', true)` | Reverts Initiative to per-round expiry |
| P2 extension off | Revert the four `explodeOverride` edits | V5 stops lifting the Unskilled penalty; everything else unaffected |
| V6 only | Remove the `voidDamageRow` handlers | Damage reduction unavailable; other five unaffected |

---

## Folder contents

| File | Purpose |
|---|---|
| `l5r-character-sheet part C feature 4 void.html` | The build |
| `feature4-code-block.js.txt` | The Feature 4 code block as spliced |
| `splice_feature4.py` | Splice script that produced this build |
| `l5r-P1-P2-F4-test-harness.js` | Combined harness — F4 + F3 + F2 + F1 + P1/P2 + F0 + Part B + schoolfix |
| `l5r-P1-P2-F3-test-harness.js` | Feature 3 suite (G3/G4 evolved — see above) |
| `l5r-P1-P2-F2-test-harness.js` | Feature 2 suite |
| `l5r-P1-P2-F1-test-harness.js` | Feature 1 suite |
| `l5r-P1-P2-test-harness.js` | P1/P2 suite |
| `l5r-feature0-test-harness.js` | Feature 0 suite |
| `l5r-partB-test-harness.js` | Part B suite |
| `l5r-schoolfree-bugfix-harness.js` | Schoolfree bugfix suite |
| `l5r-crossversion-signature.js` | Cross-build fingerprint |
| `DIFF-SUMMARY-vs-Feature3.md` | Line counts, every removed line, change hunks |
| `FEATURE-4-RESULTS.md` | This document |

```bash
python -m http.server 8799 --directory "."
```

```js
fetch('/l5r-P1-P2-F4-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Exit condition: `failed === 0` with all seven sub-suites reporting `failed: 0`.
