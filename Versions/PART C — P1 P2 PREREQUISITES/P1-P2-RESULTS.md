# Part C — P1 (Combat Round Context) + P2 (Pre-roll Modifier Pipeline)

**Build:** `l5r-character-sheet part C P1-P2 prerequisites.html` (1,046,764 bytes)
**Trunk:** Feature 0 **Version A** (the F0 mode is still a one-line flip to B in this build)

| Suite | Result |
|---|---:|
| P1 + P2 | **46/46** |
| Feature 0 (re-run unchanged) | **72/72** |
| Part B (re-run unchanged) | **127/127** |
| **Total** | **245/245** |

Diff vs the Feature 0 trunk: **298 added, 4 removed.** The 4 removed are the two rerouted call
sites in `rollSkill()` and `rollWeaponAttack()` — orchestration wrappers, which were never on the
frozen list. `rollDicePool`, `rollExplodingD10`, `showRollResult`, `collectData`, `applyData` and
the Ten Dice Rule are untouched.

---

## Your five decisions, as implemented

| # | Decision | Status |
|---|---|---|
| 1 | Build the pre-roll pipeline | **Done** — P2 |
| 2 | Wound penalties as a flat roll modifier, not TN | Pipeline supports it via `totalDelta`; **Feature 3 will register it** |
| 3 | Ammo persists via `localStorage` | Deferred to Feature 6 (unchanged by P1/P2) |
| 4 | Split Features 6 and 7 | Recorded in the roadmap analysis |
| 5 | Real distances, not bands | Deferred to Feature 1 |

### On decision 2 — a documented house rule

RAW makes wound penalties a **TN increase** ("Increase the TN of all rolls made by +3 while
Nicked"). You chose a **flat negative modifier to the roll total** instead. That is a deliberate
house rule, not RAW, and the pipeline's `totalDelta` channel is built for exactly it. It will be
labelled as such in Feature 3's code and in the roll modal breakdown, so nobody later mistakes it
for the book's mechanic.

---

## P1 — Combat Round Context

Round counter plus a per-round spend ledger, needed by Stances (Center's "round following"),
Void Points (RAW: one per Round) and Techniques ("once per Round / encounter").

```
getCombatRound()  setCombatRound(n)  advanceCombatRound()  resetCombatRound()
getRoundLedger()  getRoundSpend(key,[round])  hasSpentThisRound(key,[round])
recordRoundSpend(key,value,[round])  clearRoundSpend(key,[round])
```

- Ledger is keyed **by round number**, not just "current", so Center can look backwards (R9).
- History trims to the last 20 rounds so a long skirmish cannot grow it unbounded (R11).
- State lives in `combatRoundNumber` / `combatRoundLedger` — **no `f_` prefix**, so `collectData`
  (frozen) never sees them. Save still has exactly 42 fields (R16).
- UI: a round bar above Wounds — `Round N`, *Next Round*, *Reset*, and a live "spent this round" note.

## P2 — Pre-roll Modifier Pipeline

### Why it cannot be a post-render decorator

```
Kenjutsu 7 + Agility 3 in Full Attack
  correct:      10k3 raw → +2k1 → 12k4 → Ten Dice Rule → 10k4 +bonus
  post-render:  10k3 rendered, then bolt on 2 dice → 12k4, rule NEVER applied
```

Test **X1/X2** assert the modal genuinely shows the Ten Dice conversion **from 12k4**, i.e. the
rule saw the modified raw pool. RAW agrees on the timing: a Void Point *"must be declared prior to
the roll being made."*

### Two modifier channels, deliberately distinguished

| Channel | Applied | Examples |
|---|---|---|
| `rolledDelta` / `keptDelta` | Pre-roll, before the Ten Dice Rule | Full Attack +2k1, Void +1k1, bow range −1k0 |
| `totalDelta` | Folded into `result.bonus` | Wound penalty, firing into melee −10 |

**Why `totalDelta` is folded into `bonus`:** `updateRollKeepState()` recomputes the total as
*(kept dice + currentRollBonus)* on **every die click**. Anything applied post-render would be
wiped by the next click. Folding it into `bonus` is the only place it survives — asserted by
**X6**, which clicks a die and re-checks.

The side effect is that `showRollResult()`'s hard-coded `"Ten Dice Rule bonus: +N"` note becomes
inaccurate when a non-Ten-Dice modifier is present. `attachRollModifierBreakdown()` hides that one
note (X7) and renders an itemised, honest breakdown instead (X3/X4/X8). That is DOM decoration
after the fact — `showRollResult` itself is untouched.

### Registry

```js
registerPreRollModifier(id, priority, ctx => ({label, rolledDelta, keptDelta, totalDelta, note}))
```

Each later feature registers its own contributor and never edits the pipeline. Negative scope is
enforced in one place by filtering on `ctx.kind`
(`skill / attack / damage / spell / trait / ring / initiative / manual`) — so "wounds never affect
damage rolls" is a one-line filter, not a rule re-litigated per feature.

Guarantees under test: pool never drops below 0k0 (M7); kept never exceeds rolled (M8); a
contributor that throws is skipped rather than breaking the roll (M9); re-registering an id
replaces rather than duplicates (M11); priority ordering (M12); zero-valued modifiers dropped (M13).

### The no-op guarantee

With an empty registry the pipeline is a mathematical identity — N1–N4 assert no modifier bar
appears, the pool is the unmodified `10k3`, and the Ten Dice note is not hidden. This is what
makes the 127/127 and 72/72 re-runs meaningful evidence rather than a formality.

---

## One pre-existing finding (not caused by P1/P2)

`collectData()` captures derived fields (insight, rings, XP, TN, initiative) exactly as they
stand, while `applyData()` recomputes them on load. So a save taken **before** `recalcAll()` has
settled those fields will not round-trip identically.

Verified identical on the Feature 0 build with no P1/P2 present, so this is inherent to the sheet.
In normal use every input path calls `recalcAll()`, so a real user will not hit it — but any
harness must call `recalcAll()` before snapshotting. Test N5 now does.

---

## Rollback

| Level | Action | Effect |
|---|---|---|
| Full | Return to the Feature 0 Version A build | Complete revert; no save migration (nothing was persisted) |
| P2 off | Revert the two call sites to `showRollResult(title, rollDicePool(...))` | Rolls bypass the pipeline entirely |
| P1 off | Delete the round bar and its two hidden inputs | Round context gone; nothing else references it yet |
| Neutralise | Leave the registry empty | Already a no-op — zero behavioural difference |

---

## Next

**Feature 1 — Range & Range Penalties**, built on real distances per decision 5:

- bows: listed max range, firing to 2× at **−1k0 per extra 50 ft** → a `rolledDelta` contributor
- **−10 to the total** when firing at a target in melee with you → a `totalDelta` contributor
- thrown maxima already stored on every weapon as `range` in Part B
- Dai-kyu +10 TN on foot; Yumi / Han-kyu +10 TN mounted
- negative tests: melee weapons get no range control at all
