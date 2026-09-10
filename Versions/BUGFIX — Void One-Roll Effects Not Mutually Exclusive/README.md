# BUGFIX — Void One-Roll Effects Not Mutually Exclusive

Reported live, on the deployed site: a real Void spend was armed twice on the same roll — an
Earth Ring Roll's `2k2` base became `4k4` — via the Smart Roll Preview's checkboxes (Part G,
Phase 3). Root-caused and fixed the same session, verified against the pipeline's own audit
harness and the preview's own harness, and shown failing for the right reason against the exact
pre-fix code.

**Status: confirmed, root-caused, and fixed. 25/25 (preview) and 34/34 (pipeline), both up from
their pre-fix baselines; a scratch reversion of the actual defect drops the preview harness to
22/25, failing exactly the three checks that describe the bug.**

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
| `src/sheet/160-feat-void.js` | `VOID_SPEND_LIBRARY`'s `trait` entry removed, `k1`'s label corrected; `armOneRollVoidPending`/`clearOneRollVoidPending` added; `spendVoid()`'s one-roll branch, `voidPreRollModifiers()`, `consumeVoidOneRollEffects()`, and `renderVoidPanel()`'s status line all updated to match |
| `src/sheet/208-feat-roll-preview.js` | `ROLL_PREVIEW_VOID_KEYS` drops `trait`; the checkbox change handler now enforces single-select through the two helpers above instead of accumulating every key ever ticked; `voidKeyWouldMatter()`'s trial construction uses `armOneRollVoidPending()` instead of a raw merge, so its "would this matter" simulation can't itself disagree with the enforced rule |
| `src/sheet/210-test-seam-and-init.js` | Exports the two new helpers |
| `build/manifest.json` | Rebuilt hash |
| `Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/qa/roll-pipeline-baseline.js` | One check corrected — see *A pre-existing check asserted the bug* below |

**No markup or CSS changed.** This is a pure logic fix inside the Void system and the preview's
own script; the checkbox list still renders exactly as it did, it just enforces a rule it should
already have been enforcing.

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

## Verification

No new harness file — the fix lives entirely inside surface two existing harnesses already
exercise, and duplicating their Playwright setup into a third file for the same checks would be
exactly the kind of copy this project avoids elsewhere (see `buildRollModifierRows()`, Phase 3's
own shared renderer, for the same reasoning).

**`Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/qa/roll-preview-harness.js`**
gained four checks (numbered 15–18 in the file) directly exercising the bug: tick `+1k1`, confirm
the pool; tick `+1 Skill Rank` afterward *without* unticking the first, confirm the first
checkbox visibly unchecks itself and the pool reflects only the second choice; confirm the roll
costs exactly one Void Point, not two.

| Build | Result |
|---|---|
| This fix, as shipped | **25/25** |
| The exact pre-fix checkbox handler (accumulate-without-clearing), reproduced in a scratch copy | **22/25** — failing exactly the three checks describing the bug: the first checkbox does not uncheck (`got=true want=false`), the pool shows the stacked `5k4` instead of the correct `4k3`, and the Void-Point count doesn't match |

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
| Phase 0 build `sha256`, after this fix (current) | `ffd66865b26c0360f5059ebfe3188b8bc9d1b09748bbaacb8827dbe4016eac32` |
| `element_id_count` | unchanged: 258 |
| `window.__L5R_TEST__` key count, before / after | 302 / **304** (+`armOneRollVoidPending`, +`clearOneRollVoidPending`) |
| `window.__L5R_CAROUSEL__` method count | unchanged: 11 |

## Rollback

See `ROLLBACK.md`. This fix touches shared files three other still-live features also touch
(`210-test-seam-and-init.js`, in particular, carries Phase 1/2/3/9's own guarded blocks), so
per `CLAUDE.md`'s "Every feature must be surgically removable" its rollback is the surgical,
comment-marker-anchored kind — not a whole-file `originals/` restore, which would silently strip
those other features' work too.
