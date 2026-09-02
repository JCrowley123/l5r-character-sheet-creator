# Part C — Feature 3: Wound Penalties Automation

**Build:** `l5r-character-sheet part C feature 3 wounds.html` (1,088,762 chars)
**Trunk:** `PART C — Feature 2 Stance System/l5r-character-sheet part C feature 2 stances.html`
**Harness:** `l5r-P1-P2-F3-test-harness.js`

| Suite | Result |
|---|---:|
| **Feature 3** | **57/57** |
| Feature 2 | 84/84 |
| Feature 1 | 80/80 |
| P1 + P2 | 46/46 |
| Feature 0 | 72/72 |
| Part B | 127/127 |
| Schoolfree bugfix | 30/30 |
| **Total** | **496** |

Diff vs trunk: **101 added, 13 removed.** Every removed line is a `showRollResult()` **call site**
being re-pointed at `rollWithModifiers()`. `showRollResult` itself, `rollDicePool`,
`rollWeaponDicePool`, `collectData`, `applyData`, the Ten Dice Rule and Part B's damage path are
all untouched. Save still has exactly 42 fields.

---

## The house rule, stated plainly in the code

RAW makes wound penalties a **TN increase** — the sheet's own `WOUND_LEVELS` quotes it:
*"Increase the TN of all rolls made by +3 while Nicked."* Per your decision, this build applies the
same magnitude as a **flat negative modifier to the roll total** instead.

The block carries this comment so nobody later mistakes it for the book's mechanic:

> The two are NOT mathematically equivalent — raising a TN by 3 and lowering a roll by 3 give the
> same pass/fail outcome only when a TN exists at all. They diverge on opposed rolls and on any
> roll where the total itself matters.

---

## What was actually required beyond the contributor

Writing `woundPreRollModifiers` was the easy half. The harder half: **a contributor cannot reach a
roll that never enters the pipeline.** Only attack, skill and initiative rolls were routed through
`rollWithModifiers`. Seven more call sites had to be re-pointed:

| Call site | Kind | Note |
|---|---|---|
| Ring roll | `RING` | — |
| Trait roll | `TRAIT` | — |
| Unskilled skill roll | `SKILL` | `explode:false` passed through — still no exploding 10s |
| Manual dice tray / free-text weapon notation | `MANUAL` | — |
| Spell Casting Roll | `SPELL` | TN config preserved; pass/fail now reflects the penalty |
| Maho Casting Roll | `SPELL` | TN config **and** its `onClose` Taint hook ride along |
| Full Defense declaration | `SKILL` | it *is* a Defense/Reflexes Skill Roll |

**Weapon damage was deliberately left un-routed.** It would have been tidier to route it and let
the contributor refuse it, but your §5.4 forbids touching Part B's damage logic, so the damage path
still calls `showRollResult` exactly as Part B wrote it. Negative scope is proven at the
contributor (B8) *and* end-to-end at Down −40 (G1).

### A consequence worth knowing

Full Defense's Armor TN bonus is now **half the penalised total**. A wounded character declaring
Full Defense gets a smaller bonus. That follows from your decision and is the correct reading, but
it is a behaviour change to Feature 2 that only shows up once wounded.

---

## Validation Suite (51 Feature 3 assertions + 6 regression wrappers)

| § | Area | Count | Covers |
|---|---|---:|---|
| F3-A | Lookup table | 5 | All seven RAW penalties; level derivation tracks the sheet's own wound track |
| F3-B | Contributor purity & scope | 10 | Applies to attack/skill/spell/trait/ring/initiative/manual; **never** damage; Healthy returns `null`; **only** `totalDelta` is ever set |
| F3-C | Healthy zero-change | 5 | No modifier bar on any roll kind; pool unmodified |
| F3-D | Nicked −3 end to end | 11 | Every roll kind's displayed total includes −3; pool **unchanged**; die-click recomputation; spell TN readout intact |
| F3-E | Down −40 | 3 | Magnitude scales; pool still unchanged |
| F3-F | Additive combination | 9 | With stance; with range; with stance **and** range together |
| F3-G | Negative scope & hygiene | 8 | Damage untouched at Down; registry exactly `range@20 / stance@30 / wounds@40`; 42 fields; round trip stable |

### Combination proof (F7–F9)

Kyujutsu 3 + Reflexes 3 = 6k3, Center bonus from last round, Yumi at 350 ft, Nicked:

```
6k3  →  Center +1k1  →  7k4  →  Range −2k0  →  5k4
total = kept dice + Void Ring − 3
```

All three sources listed separately in the modifier bar. Wounds change the total and **never** the
pool — asserted at D3, E3 and B10.

---

## Harness evolution — one change, per §6.4

**Feature 2's `G12`** asserted the registry was exactly `['range','stance']`.

- **Why the change was required:** Feature 3 registers a permanent `wounds` contributor, so the
  literal list is now wrong — and would break again at Feature 4, 5, 6 and 7.
- **What invariant evolved:** from "the registry is exactly this list" to "my contributor is
  registered, the previous feature's is still there, and no *test* modifier leaked."
- **Why the new invariant is correct:** pinning the whole list made Feature 2 the owner of a fact
  it does not own. What Feature 2 must guarantee is its own registration and the absence of leaks.

`G12` became `G12a/G12b/G12c`, which is why the Feature 2 suite reports **84** rather than 82. The
comment explaining all three points is in the harness itself.

### Two failures found and fixed during this run — both mine, not the code's

1. **My wound fixtures hardcoded Earth 2.** `recalcAll()` recomputes every Ring as
   `min()` of its two Traits, and the fixture set all Traits to 3 — so Earth was 3 and every
   hardcoded "wounds taken" number landed in the wrong band. The harness now derives the number
   from `computeWoundThresholds()` at the live Earth value. **Writing to `#ring_earth` does not
   pin the Earth Ring** — worth remembering for any future wound-related test.
2. **A stale-cache false failure** where a sub-suite ran from browser cache. The loader already
   cache-busts; this was the same class of issue seen in Feature 1.

---

## Regression Matrix

| # | Check | Result |
|---|---|---|
| 1 | `rollDicePool` / `rollWeaponDicePool` / `showRollResult` unmodified | PASS — only call sites changed |
| 2 | `collectData` / `applyData` unmodified | PASS |
| 3 | Ten Dice Rule logic unchanged | PASS — wounds never touch the pool |
| 4 | Part B damage logic unmodified | PASS — damage path not routed |
| 5 | Feature 2 stances intact | PASS — 84/84 |
| 6 | Feature 1 range intact | PASS — 80/80 |
| 7 | P1/P2 pipeline intact | PASS — 46/46 |
| 8 | Feature 0 emphasis re-roll intact | PASS — 72/72 |
| 9 | Part B weapons intact | PASS — 127/127 |
| 10 | Schoolfree bugfix intact | PASS — 30/30 |
| 11 | Wounds + stance + range additive | PASS — F7–F9 |
| 12 | Damage rolls unaffected | PASS — B8, G1, G2 |
| 13 | No new save fields | PASS — G5 (42), G6, G7 |
| 14 | Save/load round trip stable | PASS — G8 |
| 15 | Registry exactly range/stance/wounds | PASS — G3, G4 |
| 16 | Spell TN pass/fail still works | PASS — D11 |
| 17 | Unskilled rolls still don't explode | PASS — Part B / F0 suites |

---

## Rollback

| Level | Action | Effect |
|---|---|---|
| Full | Return to the Feature 2 build | Complete revert; nothing persisted, no migration |
| Feature off | `unregisterPreRollModifier('wounds')` | Penalties stop applying; routing stays (harmless) |
| Back to RAW | Change `woundPreRollModifiers` to return `null` and surface the TN increase in the bar instead | Reverts the house rule to RAW's TN reading |
| Un-route a kind | Restore that one `showRollResult(...)` call site | Removes wounds from that roll kind only |
| Full Defense only | Restore its `showRollResult` call | Declaration stops taking wound penalties |

---

## Folder contents

| File | Purpose |
|---|---|
| `l5r-character-sheet part C feature 3 wounds.html` | The build |
| `feature3-code-block.js.txt` | The Feature 3 code block as spliced |
| `splice_feature3.py` | Splice script that produced this build |
| `l5r-P1-P2-F3-test-harness.js` | Combined harness — F3 + F2 + F1 + P1/P2 + F0 + Part B + schoolfix |
| `l5r-P1-P2-F2-test-harness.js` | Feature 2 suite (G12 evolved — see above) |
| `l5r-P1-P2-F1-test-harness.js` | Feature 1 suite |
| `l5r-P1-P2-test-harness.js` | P1/P2 suite |
| `l5r-feature0-test-harness.js` | Feature 0 suite |
| `l5r-partB-test-harness.js` | Part B suite |
| `l5r-schoolfree-bugfix-harness.js` | Schoolfree bugfix suite |
| `l5r-crossversion-signature.js` | Cross-build fingerprint |
| `DIFF-SUMMARY-vs-Feature2.md` | Line counts, every removed line, change hunks |
| `FEATURE-3-RESULTS.md` | This document |

```bash
python -m http.server 8799 --directory "."
```

```js
fetch('/l5r-P1-P2-F3-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s)).then(o=>console.log(o.failed))
```

Exit condition: `failed === 0` with all six sub-suites reporting `failed: 0`.
