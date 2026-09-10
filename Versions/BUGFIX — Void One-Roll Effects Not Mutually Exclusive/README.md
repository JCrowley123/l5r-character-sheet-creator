# BUGFIX — Void One-Roll Effects Not Mutually Exclusive

Reported live, on the deployed site: a real Void spend was armed twice on the same roll — an
Earth Ring Roll's `2k2` base became `4k4` — via the Smart Roll Preview's checkboxes (Part G,
Phase 3). Root-caused and fixed the same session, verified against the pipeline's own audit
harness and the preview's own harness, and shown failing for the right reason against the exact
pre-fix code.

**Status: confirmed, root-caused, and fixed.** A *second* RAW misreading in the same list was
then found the same way, in the same real-device pass, and is fixed and documented here too —
see *A second misreading in the same list* below. The preview harness reads **35/35** and the
pipeline baseline **34/34**, both up from their pre-fix numbers; scratch reversions of each
defect drop the preview harness to **22/25** and **32/35** respectively, each failing exactly
the checks that describe its own bug and nothing else.

---

## What was actually wrong

Two related defects, one visible symptom.

### 1. RAW was misread as offering a "+1 Trait" power that doesn't exist

`VOID_SPEND_LIBRARY` (`160-feat-void.js`, Part C Feature 4 — predates this bugfix and Phase 3
both) listed three one-roll effects: `k1` ("+1k1 to a roll"), `trait` ("+1 Trait for one roll"),
and `skill` ("+1 Skill Rank (0 → 1)"). The code already knew `k1` and `trait` were
arithmetically identical — every standard L5R roll is `(Trait + Rank)k(Trait)`, so raising the
Trait by one adds exactly one rolled die and one kept die, the same as `+1k1` — and said so in
its own comment, reasoning that they were kept separate because "they are separate RAW choices."

They are not. The actual RAW text (Void Points, Core Rulebook) reads:

> "Gain a bonus of **+1k1** to a Skill, Trait, Ring, or Spell Casting roll (the Void Point
> expenditure must be declared prior to the roll being made)."

That is **one** effect that names which roll types it covers — not a menu with a separate bonus
per roll type. There is no second, independent "+1 Trait" power in RAW at all.

### 2. Nothing stopped both from being armed on the same roll

RAW also states: *"A character may normally only spend one Void Point per Round for one of the
following effects."* "One of the following effects" — singular — governs the whole list of six,
not just repeats of the same one. The sheet's own `hasSpentThisRound('void')` ledger enforces
this correctly, but **only while a combat Round is active**; out-of-combat Void spending is
deliberately unrestricted by an earlier, still-valid design decision (see `160-feat-void.js`'s
own comment on `isCombatActive()`). Nothing else in the pending-effect mechanism enforced "only
one of these at a time" independent of the round ledger — so a player could arm `k1` and `trait`
together at any time outside combat, and the Smart Roll Preview's checkbox list, built as
independent checkboxes rather than a single-select group, made doing exactly that a two-tap
action instead of two separate button presses on a less-visible panel.

The screenshot that reported this showed exactly that: `k1` and `trait` both ticked, the pool
reading `4k4` from a `2k2` base (`+1k1` twice), for two Void Points.

### A cascading failure this also fixed, found while investigating

Had this been triggered **while a combat Round was active** instead, the outcome would have been
worse than a doubled pool. The preview's `finish()` calls `spendVoid()` once per ticked key; the
first call would succeed (consuming a Void Point, arming its pending flag), and the second would
correctly be refused by `canSpendVoid()`'s round-ledger check — but the preview's own code
treated that refusal as "cancel the whole roll," returning without undoing the first, already-
consumed Void Point or its now-orphaned pending flag. The result: a lost Void Point, a stray
one-roll effect armed for whatever the player's *next*, unrelated roll happened to be, an alert
box, and no roll. This was never reported — it requires combat-mode Void spending specifically —
but it shared the same root cause and could not survive the same fix.

## The fix

**Merge, then centralise.** `trait` no longer exists as a separate `VOID_SPEND_LIBRARY` entry —
`k1`'s own label was corrected to match RAW's actual wording ("+1k1 to a Skill, Trait, Ring, or
Spell Casting roll"). That alone would have closed the specific reported case, but not the
general one (arming `k1` and `skill` together is exactly the same defect, just not what got
screenshotted) — so the actual fix is structural: **arming any one-roll effect now always clears
every other one-roll effect first**, via two small helpers added to `160-feat-void.js`:

```js
function clearOneRollVoidPending(pending){
  const next = Object.assign({}, pending);
  VOID_SPEND_LIBRARY.forEach(o=>{ if(o.oneRoll) delete next[o.key]; });
  return next;
}
function armOneRollVoidPending(pending, key){
  const next = clearOneRollVoidPending(pending);
  next[key] = true;
  return next;
}
```

Both `spendVoid()` (the Void card's own buttons) and the Smart Roll Preview's checkbox handler
(`208-feat-roll-preview.js`, which arms these directly via `setVoidPending()` rather than through
`spendVoid()` — see that phase's own header comment on why Cancel has to stay free) now go
through these two functions instead of each maintaining its own definition of "mutually
exclusive." One rule, one place, both UIs correct by construction rather than by parallel
maintenance.

The preview's checkbox list keeps its checkbox markup rather than becoming native radio inputs,
specifically so a player can still untick the one active option back to "spend nothing" — a
plain radio group can't do that without a distinct "none" option of its own. Ticking a *different*
one-roll checkbox now visibly unchecks whichever was active, on the very next render — a
radio group's behaviour, built from checkboxes for that one reason.

## What changed, file by file

| File | What changed |
|---|---|
| `src/sheet/160-feat-void.js` | `VOID_SPEND_LIBRARY`'s `trait` entry removed, `k1`'s label corrected; `armOneRollVoidPending`/`clearOneRollVoidPending` added; `spendVoid()`'s one-roll branch, `voidPreRollModifiers()`, `consumeVoidOneRollEffects()`, and `renderVoidPanel()`'s status line all updated to match. **Second pass:** `voidSkillRankApplies()` added and `pending.skill` gated behind it; the `skill` entry's label now states the Unskilled-only restriction |
| `src/sheet/208-feat-roll-preview.js` | `ROLL_PREVIEW_VOID_KEYS` drops `trait`; the checkbox change handler now enforces single-select through the two helpers above instead of accumulating every key ever ticked; `voidKeyWouldMatter()`'s trial construction uses `armOneRollVoidPending()` instead of a raw merge, so its "would this matter" simulation can't itself disagree with the enforced rule |
| `src/sheet/210-test-seam-and-init.js` | Exports the two new helpers |
| `src/css/10-sheet-base.css` | **Second pass, cosmetic:** `.rp-dice-k` deleted and `.rp-dice`'s gap widened 14px → 34px |
| `build/manifest.json` | Rebuilt hash |
| `Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js` | One check corrected — see *A pre-existing check asserted the bug* below |

**The exclusivity fix changed no markup and no CSS** — it is a pure logic fix inside the Void
system and the preview's own script; the checkbox list still renders exactly as it did, it just
enforces a rule it should already have been enforcing. The second pass is the same shape, one
gate in the contributor, plus the two presentational lines noted above (a deleted `<span>` and
the gap that replaced it).

## A pre-existing check asserted the bug, and was corrected rather than deleted

Phase 1.5's own pipeline baseline (`roll-pipeline-baseline.js`) had a check titled *"void +1
Trait is numerically identical to +1k1 but carries its own label (RAW: separate choices)"* — an
assertion that the (wrong) premise was, in fact, true. Running the full regression suite after
this fix surfaced it failing, exactly as it should: the premise it encoded no longer holds. Per
this project's own standing rule (measure, don't assume; a harness must be able to fail for the
right reason), the check was rewritten to assert the *corrected* behaviour — that a bare
`trait` pending flag now contributes nothing, having been merged into `k1` — rather than quietly
deleted. A second check's title, listing the auto-consumed one-roll keys as "(k1/trait/skill)",
was updated to "(k1/skill)"; it was still passing, since its actual test data never referenced
`trait`, but the label was stale documentation.

## A second misreading in the same list, found the same way

The first fix corrected `k1`'s label and merged the phantom `trait` entry into it. Testing the
result on the live site turned up a third entry with a related problem — reported, again, by the
project owner reading the preview's own offer list:

> "The tick box for turning an untrained roll into effectively a skilled roll should only be
> present and allowed to be chosen when the player is doing an untrained roll. As I understand
> the rule the purpose of spending a void point in this manner is to primarily avoid the
> unskilled roll penalty. At the moment this check box implies that the void can be spent on a
> normal roll. But for normal rolls you have the +1k1 option."

**That reading is correct, and the RAW text says so twice in one sentence.** The effect is:

> "Temporarily increase his rank in a Skill **from 0 to 1**, avoiding Unskilled Roll penalties."

Both halves name the same case. *"From 0"* is not a worked example, it is the whole effect —
there is no rank to raise unless the roll is being made at rank 0 — and there is no Unskilled
Roll penalty to avoid unless the roll is unskilled. The entry is not a generic "+1 rolled die";
it is a specific escape from the Unskilled penalty, which is why RAW lists it separately from
`+1k1` rather than as a variant of it. On a trained roll it is not a weaker option, it is **no
option at all**: nothing to raise, no penalty to lift, one Void Point spent for nothing.

Nothing in the code enforced any of that. `voidPreRollModifiers()` applied `pending.skill` to
every roll kind except Damage — so it was offered on Ring rolls (which have no Skill Rank
whatsoever), Trait rolls, Spell Casting, Initiative and manual notation. That is how the
original bug screenshot came to show it on an *Earth Ring Roll*.

### The fix, and two extensions the report didn't mention

One gate, in the contributor — not in the preview:

```js
function voidSkillRankApplies(ctx){
  if(!ctx) return false;
  if(ctx.kind !== ROLL_KINDS.SKILL && ctx.kind !== ROLL_KINDS.ATTACK) return false;
  return ctx.unskilled === true || (parseInt(ctx.skillRank, 10) || 0) <= 0;
}
```

used as `if(pending.skill && voidSkillRankApplies(ctx))`.

**Gating the contributor is what fixes the preview**, and this is the reason the change is three
lines rather than a UI edit: the preview decides what to offer by *simulation* — `voidKeyWouldMatter()`
arms each key against the real contributor and keeps only the keys that change the pool. Make the
contributor honest and the offer list corrects itself, with no second copy of the rule to
maintain. It also means the rule holds for a spend armed from the Void card, where the preview
isn't involved at all.

Two things follow from the RAW reading that the report didn't call out, and both are deliberate:

- **An unskilled weapon *attack* still qualifies.** An attack made with its weapon skill at rank
  0 is an Unskilled Roll in every mechanical sense, and `performWeaponAttack()` already passes
  `unskilled: atk.unskilled` into the context, so the gate admits `ROLL_KINDS.ATTACK` alongside
  `ROLL_KINDS.SKILL`. Restricting it to skill rolls only would have been a narrower reading than
  RAW supports. There is a harness check for exactly this case.
- **It disappears from Ring, Trait, Spell Casting, Initiative and manual rolls entirely** — not
  just from *trained* skill rolls. Those kinds have no Skill Rank for the effect to touch.

### The one judgement call: the Void card's own label

The Void card arms effects **before** knowing which roll is coming, so unlike the preview it
cannot hide the option when it wouldn't apply. Rather than silently let a point be wasted, the
entry now states the restriction in its own label — `+1 Skill Rank (0 → 1) — Unskilled rolls
only` — so the constraint is legible at the moment of arming. If it is armed there and then
spent on a trained roll, `voidSkillRankApplies()` still refuses to apply it; the label exists so
that outcome is predictable rather than surprising.

### Also in this pass: the `k` between the preview's dice

Cosmetic, reported alongside: the dice graphic rendered as a gold die, a literal `k`, then a
vermilion die. The `XkY` formula sits directly beneath the dice already, so the separator was
saying the same thing twice — and reading it as notation invited the two dice to be read as
"5 kept 3" rather than as *rolled* and *kept* columns, which is what their captions and badges
already say. Removed, and `.rp-dice`'s gap widened from 14px to 34px so the columns stay
visually separate without it.

## Verification

No new harness file — the fix lives entirely inside surface two existing harnesses already
exercise, and duplicating their Playwright setup into a third file for the same checks would be
exactly the kind of copy this project avoids elsewhere (see `buildRollModifierRows()`, Phase 3's
own shared renderer, for the same reasoning).

**`Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js`**
gained four checks for the exclusivity fix (numbered 15–18 in the file) directly exercising the
bug: tick `+1k1`, confirm the pool; tick `+1 Skill Rank` afterward *without* unticking the
first, confirm the first checkbox visibly unchecks itself and the pool reflects only the second
choice; confirm the roll costs exactly one Void Point, not two.

It then gained four more for the Skill-Rank gate. Three read the preview's own offer list —
a **trained** skill roll offers `k1` only, an **unskilled** one offers both, and a **Ring** roll
(the case in the original screenshot) offers `k1` only. The fourth asks the contributor directly,
which is the check that matters: with `pending.skill` armed, `voidPreRollModifiers()` returns
`null` for a trained skill roll and still returns a modifier for an unskilled *attack*.

| Build | Result |
|---|---|
| Both fixes, as shipped (35 checks) | **35/35** |
| The exact pre-fix checkbox handler (accumulate-without-clearing), reproduced in a scratch copy | **22/25** — at the 25 checks that existed then, failing exactly the three describing the bug: the first checkbox does not uncheck (`got=true want=false`), the pool shows the stacked `5k4` instead of the correct `4k3`, and the Void-Point count doesn't match |
| Scratch copy with `voidSkillRankApplies()` reverted (`if(pending.skill)` unguarded again) | **32/35** — failing exactly the three gate checks. The unskilled-attack check correctly still passes, since an ungated build applies it there too: the harness distinguishes "applies where it should" from "applies everywhere" rather than conflating them |

**`Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js`**:
**34/34**, with the corrected `trait`-key assertion described above (it read 33/34 immediately
after this fix, until that one check was updated to match).

Nothing else moved:

| Suite | Result |
|---|---|
| `qa/inventory.py` | 258 element IDs, 0 duplicates, section/overlay counts unchanged (10/24) |
| Phase 1 (UI/UX Foundations) | 9/9 |
| Phase 2 (Quick-Access Sidebar) | 19/19 |
| Phase 9 (Clan-themed look) | 14/14 |
| Full behavioural sweep (14 flows) | 0 page errors, 0 console errors |
| `feature-dependencies.py` for Phase 3's fragment | clean — every reference still sits inside a block Phase 3's own marker owns |
| `build.py --check-drift` | identical |

## Restore points

| Artefact | Value |
|---|---|
| Phase 0 build `sha256`, before this fix (end of Part G Phase 3) | `5281e4720f63501cb515f1971f35ffcd32f677808894f2d758df0dbe7279b22f` |
| Phase 0 build `sha256`, after the exclusivity fix | `ffd66865b26c0360f5059ebfe3188b8bc9d1b09748bbaacb8827dbe4016eac32` |
| Phase 0 build `sha256`, after the Skill-Rank gate (current) | `35ab6a365b9852333dbe19f6fa51824c1ffcb9fffc894e474cb7d75118244a92` |
| `element_id_count` | unchanged: 258 |
| `window.__L5R_TEST__` key count, before / after | 302 / **304** (+`armOneRollVoidPending`, +`clearOneRollVoidPending`) |
| `window.__L5R_CAROUSEL__` method count | unchanged: 11 |

`voidSkillRankApplies()` is deliberately **not** exported on the seam, which is why the key count
did not move again. The harness reaches it through `voidPreRollModifiers()` — the function that
actually feeds the pipeline — so the check exercises the path the sheet uses rather than a
private helper it could pass while the real path stayed broken.

## Rollback

See `ROLLBACK.md`. This fix touches shared files three other still-live features also touch
(`210-test-seam-and-init.js`, in particular, carries Phase 1/2/3/9's own guarded blocks), so
per `CLAUDE.md`'s "Every feature must be surgically removable" its rollback is the surgical,
comment-marker-anchored kind — not a whole-file `originals/` restore, which would silently strip
those other features' work too.
