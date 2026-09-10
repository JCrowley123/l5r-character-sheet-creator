# Part G, Phase 3 — Smart Roll Preview

Every roll that goes through the pipeline now stops and shows what it is about to throw — the
pool, the modifiers behind it, the Target Number where one exists, and any Void Point still
worth spending — and rolls only when you say so.

## The audit came first, and it moved the goalposts

The roadmap's own note already said to treat this phase as *audit and extend*, not a build. The
audit went further than that: **most of what the Engineering Scope asks for already existed.**

> **"Introduce a `RollContext` object that aggregates all roll factors."** Already built, under
> other names. `makeRollContext()` produces the context, and Phase 1.5's registry of six
> contributors aggregates the factors. More importantly, the two calculating steps are already
> **pure and already separated from the throw**: `getPreRollModifiers(ctx)` asks every
> contributor what applies, `applyPreRollModifiers(base)` folds the answers onto the base pool,
> and neither touches a die. `rollWithModifiers()` simply called both and then rolled
> immediately.

That is the whole reason this phase is small. It inserts a gate between those two halves and the
throw. **The numbers the preview shows are the pipeline's own** — this phase computes nothing of
its own and so has nothing that can drift from what the roll actually does. The one genuinely new
mechanism is the Void projection, below.

## What the audit found that the roadmap did not anticipate

**Phase 3 and Phase 4 are the same data at two different moments.** `attachRollModifierBreakdown()`
already itemises the modifiers *after* a roll — which is Phase 4 ("Explain This Roll"), also
marked partly built. Built naively, the two phases would each grow their own copy of the same
renderer. See *What Phase 4 inherits* below for how that was avoided without creating a
dependency in the wrong direction.

**The sheet already stops you before its two most complex rolls.** `promptWeaponRange()` (attacks)
and `pickUniversalSpellElement()` (universal spells) are existing self-contained Promise-modals,
and the range prompt already cancels the attack if you back out. The preview deliberately reuses
that exact pattern, so on a ranged attack it reads as the second step of one flow — gather the
range, then show the resulting pool — rather than as a competing overlay. It also means the
"cancelled" path was already a first-class concept in the attack orchestrator before this phase
touched it.

**A Target Number is only derivable for spells.** Only spell and Maho casting pass a `tnConfig`;
every other roll leaves `currentRollTN` null. That is not an omission to fix: an attack's TN is
the *target's* Armor TN, which is not on your own sheet, and skill TNs are set by the GM. So the
preview shows a TN when the caller supplies one and stays silent otherwise, and the roadmap's
"TN display (skill/spell TN if applicable)" is satisfied as far as the sheet can honestly satisfy
it. Anything more would need a manual entry field, which was not built and should be a deliberate
decision rather than an assumption.

**School bonuses are already inside the base pool, not registry modifiers.** The roadmap lists
"School bonuses" among the things the preview should show. They reach a roll through the dice the
caller computes — a spell's `ring + schoolRank`, a skill's rank — not through a pre-roll
contributor, so they appear in the preview as part of the base pool rather than as an itemised
row. Listing them separately would mean double-counting them.

**Damage rolls get no preview, correctly.** They never enter `rollWithModifiers()` at all (Part B
rolls them directly; RAW: "Damage Rolls may not be enhanced") — see Phase 1.5's README, *Damage
rolls take a different path*. So "every roll always" means every roll that goes through the
pipeline. Ten of the eleven call sites Phase 1.5 catalogued now show a preview; the eleventh is
damage, by design.

## The Void projection, and why Cancel is genuinely free

This is the one part of the phase with a real trap in it, and the part the harness exists for.

Arming a one-roll Void effect normally goes through `spendVoid()`, which does three things at
once: **deducts a Void Point**, writes the once-per-Round ledger entry, and sets a pending flag.
Only that last step is what `voidPreRollModifiers()` actually reads. A preview that armed effects
the obvious way would therefore charge the player a Void Point the moment they ticked a box — and
cancelling would silently keep it.

So while the preview is open, ticking an option sets **only the pending flag**. No point leaves
the tracker, no ledger entry is written, and the projected pool is then recomputed by asking the
real contributor — so the projection cannot drift from what the roll will do.

- **Cancel** restores the pending object exactly as found. Nothing was spent, because nothing was
  ever spent.
- **Confirm** restores it too, then calls the canonical `spendVoid()` for each chosen key. The
  commit path is the Void card's own path, with its own eligibility checks, not a duplicate of
  it — and if `spendVoid()` refuses (no points left, or the Round's one spend already used) the
  roll is abandoned rather than throwing a pool the player was shown but did not get.

Which options get offered is decided the same drift-proof way: an option is listed only if arming
it would actually change *this* roll's projected pool, established by simulation. Nothing in this
phase re-states the rules about which Void effects apply to which roll kinds —
`voidPreRollModifiers()` owns those, and this asks it.

## Added after the first real-device pass

Two changes came straight from testing the shipped preview on the live site, and one bug found
along with them (documented separately in
`Versions/BUGFIX — Void One-Roll Effects Not Mutually Exclusive/`).

**The pool is drawn as dice, not just written as notation.** The preview opened showing a bare
`2k2`. It now leads with the same faceted d10 the manual-roll dice picker uses — gold for
rolled, vermilion for kept, a count badge on each — with the `XkY` formula beneath it, matching
that picker's own layout (icons above, formula below). The artwork is redrawn in
`previewDieSvg()` rather than lifted from `20-fixed-layers.html` because the picker's dice are
`<button>`s carrying add/remove handlers, and these are read-only: a preview states a pool, it
does not build one. Same palette, same shape, no interactive affordances to mislead.

**The pool says where it came from.** `5k3` is an arbitrary pair of numbers unless you are told
which Trait and Rank produced it. `poolBasisText()` now prints one line under the formula —
`Agility 3 + Kenjutsu Rank 2` for a trained skill roll, `Agility 3 — Unskilled, so the Trait
rolls and keeps alone` when the rank is 0, and `Earth Ring 2, rolled and kept` for a Ring roll.
**Only kinds whose composition this phase can state honestly get a line.** The names come from
the roll context and the values from `getTraitValueByName()`/`getRingValueByName()`, so nothing
is inferred; attacks, spells and manual notation, whose base pools the caller computed from
places this phase cannot see, get no line rather than a guessed one. The standalone Unskilled
Roll flow (`110-modals-trackers.js`) did not previously pass its `traitName` into the context at
all — it now does, purely so this line can be printed. No contributor reads it, so it costs
nothing if this phase is removed.

Two typographic fixes rode along, both caused by the sheet's global uppercasing of `<label>` and
`<button>`: the Void options were shouting a full RAW sentence, and dice notation was rendering
as `+1K1` / `ROLL 5K3` — `k` is lowercase in `XkY`. Both are now exempted locally.

## What Phase 4 inherits

`buildRollModifierRows(adj, tenDiceBonus)` in this phase's fragment is the shared renderer: it
turns an adjusted pool into the itemised rows both moments need. Phase 4 is then mostly wiring —
point the post-roll bar at it instead of growing a second copy.

**`attachRollModifierBreakdown()` in the trunk deliberately does *not* call it today.** Doing so
would make the trunk's post-roll bar depend on a removable phase, so deleting this phase would
break a feature that predates it. When Phase 4 is built it can take that dependency
deliberately — and must then declare it in both phases' `ROLLBACK.md`, per `CLAUDE.md`'s
"Dependencies: allowed, but declared".

## The shape of the change

| File | What changed |
|---|---|
| `src/sheet/208-feat-roll-preview.js` | **New.** The gate, the modal, the Void projection, and the shared renderer |
| `src/sheet/130-round-and-pipeline.js` | `rollWithModifiers()` is now `async` and awaits the gate; returns `null` when cancelled. Modifiers are resolved *after* the gate, since the player may have armed a Void effect inside it |
| `src/sheet/100-dice-engine.js` | `rollSkill()` becomes `async`; both it and `performWeaponAttack()` `await` the roll and treat `null` as "no roll happened" |
| `src/markup/20-fixed-layers.html` | The preview overlay, hoisted out of the carousel like every other modal |
| `src/css/10-sheet-base.css` | The preview body's own styles; the overlay/card/buttons were already styled |
| `build/manifest.json` | The new fragment, and the rebuilt hash |

**Making `rollWithModifiers()` async costs nothing if this phase is removed.** `await` on a plain
object is a no-op, so the two `await` call sites stay correct against a synchronous
`rollWithModifiers()`. That is why the async plumbing is safe to leave in place during a rollback
rather than having to be unpicked — see `ROLLBACK.md`.

## Verification

Run from the Phase 0 folder:

```bash
NODE_PATH=$(npm root -g) node \
  "../../Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js" \
  l5r-character-sheet.html
```

| Build | Result |
|---|---|
| This phase as shipped (30 checks after the real-device additions above) | **30/30** |
| Scratch build: the preview commits Void on *toggle* instead of on confirm | **18/21** — failing exactly the three Void-safety checks and nothing else |
| Scratch build: `ROLL_PREVIEW_ENABLED = false` | **7/21** — the preview genuinely disappears and rolls fire immediately |

The middle row is the one that matters. It is the real bug this design avoids, injected on
purpose, and the harness isolates it to precisely the three checks that describe it: *ticking a
Void option spends NOTHING while the preview is open*, *cancelling refunds nothing because
nothing was spent*, and *confirming deducts exactly one point*. A harness that had read the pool
out of the preview and compared it against itself would have passed all three.

**The oracle is never the preview.** Every pool assertion recomputes the expected value through
`getPreRollModifiers()`/`applyPreRollModifiers()` — the pipeline's own functions, which this phase
does not modify — and compares that against what the preview *painted*.

Nothing else moved:

| Suite | Before | After |
|---|---|---|
| Phase 1.5 roll-pipeline baseline | 34/34 | **34/34** |
| Phase 1 UI/UX foundations | 9/9 | **9/9** |
| Phase 2 Quick-Access Sidebar | 19/19 | **19/19** |
| Phase 9 Clan-themed look | 14/14 | **14/14** |
| Full behavioural sweep (14 flows) | clean | **0 page errors, 0 console errors** |
| `feature-dependencies.py` for this phase | — | clean: every reference sits in a block this phase owns |

Phase 1.5's baseline staying at 34/34 is the meaningful one: it is the assertion that the
pipeline still behaves exactly as that phase documented, which is precisely what this phase
promised not to disturb.

## Where this phase's folder lives

This is Part G's **second** folder, which under `CLAUDE.md`'s convention is what triggers creating
the theme wrapper: `Versions/Part G — Combat & Roll Engine/` now holds both this phase and Phase
1.5, moved in together as the convention requires. Phase 1.5's own content is untouched by the
move — it edits nothing in Phase 0 and its rollback is still "delete the folder".
