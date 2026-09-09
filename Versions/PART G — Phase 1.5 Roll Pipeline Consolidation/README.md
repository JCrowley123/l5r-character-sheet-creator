# Part G, Phase 1.5 — Roll Pipeline Consolidation

An audit of the pre-roll modifier pipeline that Void, Wounds, Stance, Range,
and Dual-Wielding already feed into, plus a regression baseline that pins
down its current behaviour — individually and stacked — before Phases 3, 4,
4.5, and 6 touch it further, per the roadmap's Recommended Build Order.

**No production code changed.** Every fragment under Phase 0's `src/` is
untouched; `build/recombine.py --verify` still reports the same
`a8e9851dc783b3eb02a4de6508937863049781c256b71efcc2e426030d7cedd3` it did at
the end of Phase 1.6. This phase's entire deliverable is documentation and a
test harness, exactly as its own roadmap entry scopes it: *"No behaviour
changes in this phase — audit and baseline only."*

**Status: built and verified. 34/34 automated checks pass.**

---

## Why no fragment in Phase 0 was touched

Unlike Phase 1.6 — which had to edit `renderWounds()` in place because
rewriting what a function draws has no version that isn't an edit to the
file it's defined in — this phase's job is to *read* code that already
exists and write down what it does. `registerPreRollModifier`,
`getPreRollModifiers`, `applyPreRollModifiers`, `rollWithModifiers`, and the
six contributor functions were all built during Part C and are wired in
already; the roadmap's own note says as much. So this folder holds a
registry (this README), a regression harness (`qa/`), and nothing that
patches Phase 0 — which also means rollback here really is "delete the
folder," the same as every delivery-infrastructure phase in Part F. See
`ROLLBACK.md`.

## The registry

Six contributors are registered with `registerPreRollModifier(id, priority,
fn)` in `src/sheet/130-round-and-pipeline.js`. Priority only orders the
breakdown bar's presentation — addition is commutative, so it has no effect
on the arithmetic.

| id | priority | file | fires on | contributes | consumption |
|---|---|---|---|---|---|
| `range` | 20 | `190-feat-range.js` (`getRangeModifiers`) | Attack only | `rolledDelta` (−1 die per 50 ft beyond listed range) **or** `totalDelta` −10 (firing into melee) | None needed — recomputed fresh from `ctx.range` every call; there is no state to spend |
| `arrow` | 25 | `150-feat-ammo.js` (`arrowPreRollModifiers`) | Damage only, and only queried directly — see *Damage rolls take a different path* below | Nothing arithmetic — `informational:true`, so `getPreRollModifiers()` forces all three deltas to zero regardless of what the function returns | None — informational |
| `stance` | 30 | `180-feat-stances.js` (`stancePreRollModifiers`) | Attack (Full Attack's dice, Center's dice+total) and Initiative (Center's total only) | `rolledDelta`/`keptDelta` (Full Attack +2k1; Center +1k1) plus `totalDelta` (Center's Void Ring on the total; Center's flat +10 Initiative) | Center's **attack** bonus is spent by `consumeCenterBonusIfApplied()`, called explicitly by the attack orchestrator in `100-dice-engine.js` — not by the pipeline itself. Center's **Initiative** bonus is deliberately never consumed (RAW: lasts the whole round, not one roll) |
| `offhand` | 35 | `140-feat-mirumoto-dualwield.js` (`offHandPreRollModifiers`) | Attack only, and only when `ctx.hand` is set | `totalDelta` only (off-hand penalty by weapon size, or the flat main-hand penalty) | None needed — recomputed fresh from current exemption state every call |
| `wounds` | 40 | `170-feat-wounds.js` (`woundPreRollModifiers`) | Every kind except Damage | `totalDelta` only, from `WOUND_PENALTIES[getCurrentWoundLevelName()]` | None needed — recomputed fresh from the current wound total every call |
| `void` | 50 | `160-feat-void.js` (`voidPreRollModifiers`) | Every kind except Damage (the three one-roll spends); Initiative only (the skirmish bonus) | `rolledDelta`/`keptDelta` (+1k1, +1 Trait) or `rolledDelta` alone with `explodeOverride:true` (+1 Skill Rank); `totalDelta` (Initiative) | The three one-roll spends are auto-consumed by `consumeVoidOneRollEffects()`, called by `rollWithModifiers()` itself for every roll kind that reaches it — the **only** contributor whose consumption is generic rather than caller-specific |

Read together, that last column is the audit's most useful finding: five of
the six contributors need no consumption step at all because they are pure
functions of state that already lives elsewhere (a stance selector, a wound
total, a weapon's declared hand). Only Void's one-roll spends and stance's
Center bonus are actually "spent" by an action, and they are spent two
different ways — one generically inside the pipeline, one explicitly by the
one caller that can trigger it. A future phase adding a new one-roll effect
should decide deliberately which of those two shapes it needs, not assume
the pipeline hands out consumption for free.

## Finding: Emphasis re-roll is not a sixth registry entry

This phase's own roadmap brief lists what to document as "void, wounds,
stance, range, dual-wield, emphasis" — six names. The registry itself also
holds six entries, but they are `void, wounds, stance, range, offhand,
arrow`. **Emphasis re-roll is not one of them, and Ammo/Arrow — absent from
the brief's list — is.**

This is not an inconsistency to fix; it is exactly what an audit-first phase
exists to catch, and the pipeline's own source comment already predicts it:

> "Feature 0 could be a post-render decorator because re-rolling operates on
> dice that already exist. Adding dice cannot work that way…"

Emphasis re-roll (`200-feat-emphasis-reroll.js`) runs entirely after
`showRollResult()` has painted the roll modal — `attachEmphasisReroll()`
injects its control into the already-rendered body, mutates individual die
elements in place, and calls the existing `updateRollKeepState()` to
recompute the total. There is no pre-roll pool for it to adjust, because
re-rolling a die that already shows a result is a different kind of
operation from changing how many dice get rolled in the first place. It is
correctly built as a decorator, the same isolation pattern Part B's weapon
damage roll uses — it just means a reader going only by this phase's brief
would expect to find it in `PREROLL_MODIFIER_REGISTRY` and should not.
`qa/roll-pipeline-baseline.js` asserts the registry's length and contents
explicitly, so if a future refactor ever did move Emphasis into the
registry (or moved one of the current six out), this baseline would catch
the count changing.

## Damage rolls take a different path

`arrowPreRollModifiers` fires on Damage, but Damage rolls do not go through
`rollWithModifiers()` at all — Part B rolls weapon damage directly, and
every other contributor already returns `null` for `ROLL_KINDS.DAMAGE`
(RAW: "Damage Rolls may not be enhanced"). `rollWeaponDamage()` instead
calls `getPreRollModifiers()` directly against a Damage-kind context, purely
to ask whether an arrow line should decorate the already-rolled damage
modal (`attachArrowDamageBreakdown()` in `150-feat-ammo.js`). The stacked
damage check in this phase's harness confirms that even with every other
contributor's trigger condition satisfied at once (Full Attack stance,
Wounds, Void pending, a range decision, an off-hand attack), only the
informational arrow line survives — nothing arithmetic reaches a damage
roll, full stop.

## Every `ROLL_KINDS` value is reachable

| Kind | Reached from |
|---|---|
| `SKILL` | Named skill rolls (`100-dice-engine.js`), Unskilled rolls (`110-modals-trackers.js`), Full Defense's declaration roll (`180-feat-stances.js`) |
| `ATTACK` | Weapon attacks (`100-dice-engine.js`) |
| `DAMAGE` | Not routed through `rollWithModifiers()` — see above. Reached only via a direct `getPreRollModifiers()` query for the arrow breakdown |
| `SPELL` | Spell casting and Maho casting (`110-modals-trackers.js`) |
| `TRAIT` | Trait rolls (`080-identity-build-ui.js`) |
| `RING` | Ring rolls (`080-identity-build-ui.js`) |
| `INITIATIVE` | The Initiative roll (`110-modals-trackers.js`) |
| `MANUAL` | The manual dice-notation tray (`100-dice-engine.js`) |

Eleven call sites in total feed the pipeline (ten through
`rollWithModifiers()`, one direct `getPreRollModifiers()` query for damage)
and every declared `ROLL_KINDS` value is exercised by at least one of them —
there is no dead enum member and no roll path that bypasses the pipeline
silently.

## Verification

`qa/roll-pipeline-baseline.js` — **34/34.** Calls every contributor directly
through `window.__L5R_TEST__` (the same seam Phase 0's own harness and Phase
1.6's `wound-bar-harness.js` use), rather than driving the UI: these are
pure functions of DOM state and a `ctx` object, so this is both more
reliable than clicking through the sheet (no scroll-snap/`.fill()`
flakiness — see Phase 1.6's README for that lesson) and closer to what
"capture current dice-pool output" actually means, which is arithmetic, not
pixels. Four groups:

1. **Registry completeness** — the six ids and priorities, asserted exactly
   against a hardcoded expected list (this is the "no omissions" requirement
   the roadmap's own validation suite names, made executable), plus the
   Emphasis finding above turned into a standing check.
2. **Each contributor in isolation** — every documented trigger condition
   and every documented negative-scope refusal (wounds/void never touch
   damage; stance only touches attack/initiative; range/off-hand only touch
   attack; arrow only touches damage). Expected values are derived from the
   sheet's own exports where one exists (`WOUND_PENALTIES`,
   `VOID_EFFECT_VALUES`, `OFF_HAND_RULES`) rather than hardcoded, the same
   discipline Phase 1.6's parity sweep used.
3. **Pipeline math independent of any contributor** — the pool-floors-at-0
   and kept-never-exceeds-rolled clamps, the informational-deltas-forced-
   to-zero normalisation, and that a throwing contributor is skipped rather
   than fatal to the roll — exercised with synthetic modifiers registered
   and torn down inside the test itself.
4. **Stacking** — a full attack roll with Full Attack stance, a wound
   penalty, a pending Void +1k1, a range penalty, and an off-hand attack all
   active simultaneously, checked both for presentation order (priority)
   and for the arithmetic sum matching every individual contributor added
   by hand; and the mirror case on a damage roll, confirming every one of
   those same five conditions still contributes nothing except the
   informational arrow line.

Run it yourself:

```bash
cd "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
python3 build/recombine.py --verify
cd "../../../PART G — Phase 1.5 Roll Pipeline Consolidation"
NODE_PATH=$(npm root -g) node qa/roll-pipeline-baseline.js "../Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html"
```

## Both shells stay in sync

This phase makes no change to Phase 0's fragments, so neither shell's build
output moves: `build.py` (website) and Phase 0.7's `build_android.py`
(Android's staged web assets) both still produce exactly the build that
ended Phase 1.6. There is nothing to re-verify here that Phase 1.6's own
README didn't already confirm for the current head.

## What this hands to later phases

Phases 3 ("Smart Roll Preview"), 4 ("Explain This Roll"), 4.5
(Modal-Configured Advantages/Disadvantages), and 6 (Kata/Technique Synergy
Detection) are the roadmap's stated reason this phase exists: each is
expected to touch the pipeline further, and each can now run
`qa/roll-pipeline-baseline.js` against its own build before and after its
change. A clean diff on this harness is exactly what "the pipeline still
behaves exactly as documented here" means in practice — the same
before/after discipline Phase 1.6 used for the rest of the sheet, pointed at
this one subsystem instead.

## Rollback

See `ROLLBACK.md`. Because this phase edits nothing outside its own folder,
rollback is the simple case: delete the folder.
