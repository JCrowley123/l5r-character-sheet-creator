# Phase 4.5.9 — Doubt

D03, and the **first build of the approved TN-reporting convention**. That is why this entry is
worth more than its one catalogue row: D04's Benten and Fukurokujin branches reuse the same
machinery, so it is built here on the simplest consumer there is — which is the whole reason the
staged plan put D03 second rather than saving it.

## The convention, and the one thing it forbids

Approved 13 September: represent a rule's `TN +N` as **`−N` to the reported total**, for Ring,
Trait, Skill, spell-casting and attack rolls only, and **never for damage**. Keep the real rule
visible rather than printing a bare number. The equivalence is `R ≥ T + N` iff `R − N ≥ T`, so
the sheet never needs to know the TN — and where it *does* know it, the adjustment must be
applied **once**: an adjusted total against the **original** TN, never an adjusted total against
a raised one.

Routing through the pipeline's `totalDelta` gets that last part for free, because
`showRollResult()` compares the adjusted total against `currentRollTN`, which nothing here
touches.

## Four things were measured first, and two changed the design

**1. A damage context carries `skillName`.** Driven live before a line was written:
`makeRollContext(DAMAGE, {skillName})` keeps it, and `computeDamage()` sets it from the weapon.
So a modifier filtering on the **skill name alone would have penalised the damage roll that
follows an affected attack** — exactly what the audit forbids, and it would have read as correct
in review. The kind check is load-bearing, not defensive tidiness, and the whole `SCOPE` section
is a matrix over every roll kind because of it.

**2. A spell context carries no `skillName` at all** — measured: its keys are exactly
`['kind','round']`. The convention lists spell-casting among the eligible roll kinds *in
general*, but Doubt is scoped to a chosen School Skill and a spell roll offers no skill to match.
So this entry cannot reach a casting roll. That is a property of the pipeline, not a rule this
phase enforces, and it is stated rather than implied because "we support spell rolls" would be a
claim this cannot honour.

**3. Re-registering `adv-config` replaces its seat rather than adding one.**
`registerPreRollModifier` overwrites an entry with a matching id, so wrapping Phase 4.5's own
contributor keeps the registry at **seven**. Phase 1.5 (Part G) baselined that registry and its
length is asserted across several suites, so an eighth seat would have needed the project owner's
ruling all over again. Note that the obvious wrapper does **not** work here: the registry captured
the function *reference* at registration, so `const prev = advConfigRollModifiers; advConfigRollModifiers = …`
changes nothing. Re-registering is the supported way in.

**4. `D45.confirm()` would have written `Rank undefined`** into the legacy display field, because
this entry's value is a `skill`. Same `finalize` hook Feature 4.5.8 found, same fix — the second
phase running to need it, which is why it is now written up as a standing constraint.

## A stale Skill keeps its award and stops applying

Change School and a previously chosen School Skill may no longer be one. Feature 4.5.3
established that this project **does not silently reprice a saved character**; zeroing Doubt's
4 XP days after it was spent would do exactly that. So:

- the **award is retained** (the character did take the Disadvantage),
- the **−5 stops** — its precondition genuinely fails,
- the **row says so** in terms the player can act on, and the badge switches to a dashed,
  untinted treatment so it cannot be mistaken for the working state.

This is the one place the entry deliberately diverges from Consumed: Insight, which drops to 0.
The divergence is principle-based, not preference: 4.5.3's rule about saved characters settles it.

## Validation

```bash
node qa/current-suite-runner.js <path-to-l5r-character-sheet.html>
```

| Suite | Result |
|---|---:|
| Feature 4.59 Doubt | **38/38** |
| Every retained suite plus Feature 4.58 | **728/728** |
| **Combined** | **766/766** |

### The harness was made to fail — twice

| Build | Result | What failed |
|---|---:|---|
| Kill-switch `false` (JS half off) | **0/1** | The presence gate. With no entry installed there is nothing to price, scope, roll or measure. |
| `59.4-disadv-doubt.css` dropped | **36/38** | Exactly `DOUBT459-GEOM-01` and `-02`: the badge falls back to 18px of bare inline text, and — the point of the stale rule — the applying and not-applying states become **pixel-identical**. |

### Two harness bugs, both mine, both sharpened rather than worked around

**The roll driver.** `rollWithModifiers()` is `async` and passes through Phase 3's preview gate,
so the promise only settles once the preview is confirmed; the first cut read an empty modal and
timed out. It now clicks Phase 3's own `#rollPreviewGo` and reads kept dice from
`dataset.total` — the die's *text* shows an explosion chain like `10→10→6`, while `dataset.total`
is what `updateRollKeepState()` actually sums.

**The stale transition.** The first cut wrote `Isawa Shugenja` into `#f_school` and expected
Kenjutsu to go stale. It did not, and the code was right: `D45.state()` builds its list from
`getSchoolsList()` **and** from every Skills-table row whose `.sk-school` box is ticked, so a
Skill the School already granted stays granted. CLAUDE.md records the same display-field trap
catching Feature 4.5.5's first harness cut; this is the second time. The check now drives the
real transition — a character that does not have the Skill ticked at all.

### A verdict check that was testing the harness, not the rule

`DOUBT459-TOTAL-04` first asserted that `successText`/`failText` appeared in the result modal.
They do not surface through this path, so the check was asserting an assumption about the harness
rather than anything about the convention. Replaced with what the convention actually requires and
what the player can actually read: the penalty is listed **once**, declared *"already included in
the total"*, and the trunk's misleading `Ten Dice Rule bonus` note is confirmed **hidden** rather
than contradicting it.

### Measured, not asserted: what the player sees

```
35
Roll modifiers
Doubt: -5 to total — required Raise, no benefit (TN +5)
Net -5 — already included in the total
```

### Real-device correction, same day: two wording changes

The project owner confirmed Doubt works, then reported two things from an iPhone screenshot:
the roll preview and roll result text read as dense and squished, and the row badge's bracketed
suffix made it the widest thing on the row.

**The roll modifier's `note` was shortened.** It originally read *"one required Raise for no
benefit (TN +5) — your Raise limit and any other Raises you declare are unaffected"* — accurate,
but two clauses wrapping across three lines inside Phase 3's `.rp-mod` (preview) and the trunk's
`.roll-mod-item` (result), neither of which this phase owns the layout of. It now reads
*"required Raise, no benefit (TN +5)"*. The trailing caveat about Raise limits is still true and
still stated — once, in the row's own summary text in the Adv & Disadv tab — rather than repeated
on every single roll. `DOUBT459-TOTAL-02`'s `/required Raise/` match still holds against the
shorter text.

**The badge dropped its bracketed equivalence.** `Athletics — TN +5 (reported total −5)` is now
`Athletics — TN +5`. The roll preview and result already show the adjusted total right next to
the rule (see above), so restating the equivalence a second time on the row only added width.
`DOUBT459-PRICE-06` now asserts the shorter string exactly.

Both changes are wording only, inside this phase's own fragment. Verified: own suite still
**38/38**, combined **766/766**, and surgical removal still rebuilds byte-identical to the same
Feature 4.58 restore point — the text lives entirely inside this phase's marked block, so
shortening it changed nothing about what removal deletes.

### A pre-existing display quirk, found here and deliberately NOT fixed here

The keep-note renders `Keeping 3 of 5 (suggested 3) + -5 bonus` — `+ -5`. That is the trunk's own
string concatenation, and it is **not** something this phase introduced: verified by rolling with
**no Doubt anywhere**, a wounded character alone, which produces `+ -40 bonus`. Every negative
`totalDelta` has done this since Wound Penalties (Part C, Feature 3).

Left alone deliberately. The string lives outside this phase's marker, fixing it would widen the
phase, and 4.5.3's precedent is that a phase corrects what it owns. **It is a good candidate for
its own one-line bugfix folder.**

### Structural invariants

Unchanged against the removed build: **270 element ids, 0 duplicated**, 10 sections, both test
seams, 26 roll-modal overlays, tag balance clean. This phase adds no markup.

### The ownership scan

Clean first time: *every reference is inside a block PART I FEATURE 4.59 owns.*

## Removal proof

| | |
|---|---|
| Live build (this release present) | **2,585,131 bytes**, `a8c63d61a9cd7fed740792ddd38781280b577941dc3947a07f45b2ae009d2abe` |
| Removed build | **2,572,964 bytes**, `e61137adcd8d6b891c17c69a7f498d936dbc36eabf5531e77fa4b36a47496104` |

Byte-identical to the Feature 4.58 build this release was added to, first attempt. Every retained
suite then reads **728/728** against the removed build.

`qa/test-removal.py` passes **16/16**. Its sibling-survival fixture now carries **seven** markers.

## What this release does NOT claim

- **Not real-device confirmed.** Headless only.
- **A total adjustment is not a Raise engine.** The sheet has no Raise mechanic to spend a Raise
  through, so the required Raise is *reported* — in the summary, the badge and the roll
  breakdown — and its numerical effect applied. Raise limits and other declared Raises are
  untouched, and the wording says so rather than implying the rule is fully automated.
- **It cannot reach a spell roll**, for the pipeline reason above — not because it decided not to.
- **Nothing decides when the Skill is in use.** The pipeline's own roll context does, via
  `skillName`; a roll that does not declare a skill is not affected.
