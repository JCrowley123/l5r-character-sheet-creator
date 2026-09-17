# BUGFIX — Mastery Rank Labelling

The weapon damage breakdown named the Rank the **character holds** as the Rank that **granted** a
mastery effect. Reported from a real device on 17 September 2026, during Feature 4.5.12's Bishamon
pass, on a Kenjutsu Rank 8 character:

```
Kenjutsu Rank 8 mastery +1k0 → 6k2.
```

Kenjutsu's masteries sit at Ranks **3 and 7**. Rank 8 grants nothing at all.

**The arithmetic was right the whole time.** The `+1k0` is Rank 3's, correctly applied and
correctly totalled — the reporter checked the full chain (3k2 base + 2 Strength = 5k2, −1k0 for the
Bishamon curse, +1k0 for the Rank 3 mastery = 5k2) and it reconciled. Only the attribution was
wrong, and it is the attribution defect that matters most: it names a rank that grants nothing as
the source of a bonus, inviting the reader to conclude either that the sheet invented a mastery or
that their own rank does something it does not.

| | |
|---|---|
| Fragment | `src/sheet/209.99-bugfix-mastery-rank-label.js` |
| Stylesheet | **none** — see "What this fix does not ship" |
| Shared-file blocks | 1 in the seam, **2 in `100-dice-engine.js`** (trunk) |
| Registry seats taken | **none** — the pipeline is not involved |
| Kill-switch | `MASTERY_RANK_LABEL_FIX_ENABLED` |
| Own suite | **27/27** |
| Combined suite | **980/980** (953 retained + 27) |
| Removal | **byte-identical**, 2,671,095 bytes / `6a08d86a…`, first attempt after two self-inflicted whitespace fixes |

---

## Two things the ledger recorded about this defect that turned out to be wrong

Both were written when the item was costed and deferred on 17 September, and both were measured
again before any code was written here.

**1. "Printing the granting rank needs a NEW LOOKUP."** It needs a new *derivation*; the lookup
already exists. The thresholds are the **keys** of the skill's own `dmgBonus` / `explodeOn` /
`reductionMod` tables, and `getStructuredMastery(skillName)` already returns those tables whole —
it exists because Phase 3's (Part G) "Show Structured Mastery" debug button needs the raw shape.
Nothing new is looked up: this reads the very table the resolved values were resolved from.

**2. "Touches 7 call sites across 3 files."** It touches **three adjacent lines in one file**. The
seven call sites are real, but five of them do not need to change:

| Site | Needs changing? |
|---|---|
| `100-dice-engine.js:462,464,465` — the three breakdown lines | **yes**, this is the defect |
| `110-modals-trackers.js:225–226` — the Skill-info debug button | **no** — measured: it already says "current rank" and "Raw thresholds (all ranks)", which is correct |
| `210-test-seam-and-init.js:14` — the seam export | **no** — an export, not a label |
| `100-dice-engine.js:441–442` — where the values are resolved | **no** — the numbers were never wrong |

The corrected estimate is why this shipped alone rather than bundled: see "Why this shipped
unbundled" below.

---

## What was measured before anything was written

**1. At the threshold rank the old label was accidentally right.** A Kenjutsu Rank 3 character read
"Kenjutsu Rank 3 mastery", which is correct, because the rank held and the rank granting coincide.
Only ranks *above* a threshold expose the defect. This is the single most important fact for the
harness: a check driven at Rank 3 would pass against the broken build. Every `MR-LABEL` check is
therefore driven above the threshold, and `MR-LABEL-06` pins the coincidence case as
byte-identical to the pre-fix build so the fix cannot "correct" it into something else.

**2. Ninjutsu accumulates two thresholds into one line.** At Rank 7+ its `+1k1` is Rank 3's `+1k0`
plus Rank 7's `+0k1` — measured live. There is no single granting rank to name, which is why the
plural form exists. It is not a hypothetical shape written for tidiness.

**3. Explosion thresholds supersede; they do not accumulate.** `getExplosionThreshold()` keeps the
**lowest** value unlocked, so where two thresholds are both unlocked only the one supplying that
value is in force. Naming both would be wrong. No shipped skill has two today — this rule is
implemented and driven end to end anyway (see the harness note below), rather than left as a trap
for whoever adds one.

**4. Exactly three skills carry structured mastery at all** — Heavy Weapons, Kenjutsu, Ninjutsu —
and between them they exercise all three lines: Kenjutsu the damage bonus and the explosion,
Ninjutsu the two-threshold accumulation, Heavy Weapons the reduction.

**5. The house phrasing already existed, 85 lines above the defect.** Section 1 of the same
function prints ``${entry.name} at ${skillName} Rank ${bestThreshold}+: DR becomes …`` — so "Rank
&lt;threshold&gt;" is this function's own established way of naming a granting rank, and is what is
used here rather than a new form.

---

## The change

Three sentences are re-attributed. The rank is stated as the **source** of the effect:

```
  before   Kenjutsu Rank 8 mastery +1k0 → 6k2.
  after    Kenjutsu mastery from Rank 3: +1k0 → 6k2.

  before   Kenjutsu Rank 8: damage dice explode on 9 as well as 10.
  after    Kenjutsu mastery from Rank 7: damage dice explode on 9 as well as 10.

  before   Ninjutsu Rank 8 mastery +1k1 → 4k2.
  after    Ninjutsu mastery from Ranks 3, 7: +1k1 → 4k2.
```

### Correcting the number was not enough, and the reporter was right about that

The first cut of this fix corrected the rank in place: `Kenjutsu Rank 8 mastery` became
`Kenjutsu Rank 3 mastery`. Accurate, and **still ambiguous** — it parses as "[Kenjutsu Rank 3]
mastery", so a Rank 8 character reading it still has to work out whether that 3 is their rank or
the threshold. The number had been fixed; the *question* had only been moved.

`mastery from Rank 3` states the rank as where the effect came from, which is the thing that was
actually unclear. The reporter's own suggestion was `Kenjutsu Rank 3 mastery unlocked:`, which is
equally unambiguous; `from Rank 3` is a word shorter and says the same thing, and the concise form
is what was asked for. **Swapping one for the other is a change to `masteryRankPhrase` alone.**

`MR-SCOPE-04` is the check that holds this: it fails if any line in the whole corpus still reads
`<Skill> Rank N mastery`, so the ambiguous shape cannot come back by accident.

**An itemised form for the accumulating case was considered and not built**:
`Ninjutsu mastery from Rank 3: +1k0 → 4k1.` / `Ninjutsu mastery from Rank 7: +0k1 → 4k2.` as two
lines says which threshold supplied which half, and shows the running total the way the lines above
it do. It was left out because it is the only case that would grow a line, it affects exactly one
skill (Ninjutsu at Rank 7+), and the concise form was the explicit ask. `Ninjutsu mastery from
Ranks 3, 7` names every rank that granted something and none that did not, which is the defect that
was reported. Splitting it is a small, contained change if it is ever wanted — see `ROLLBACK.md`.

### It rewrites lines in place, and that is deliberate

The obvious alternative — regenerate section 4's output from the same inputs — would mean
duplicating the trunk's own sentences inside this fragment and keeping the copies in step forever.
Instead the fix rewrites the rank phrase of lines it recognises and **leaves everything else
exactly as found**: the `masteryDamageExempt` notice (which carries no rank), and anything a later
phase adds to the same array.

### Where the blocks are, and why there are two

`100-dice-engine.js` gets two purely additive blocks. The first captures `breakdown.length` before
section 4 runs; the second calls the rewrite afterwards. Capturing the index is what stops the
rewrite reaching a line an *earlier* section pushed — counting backwards from the end of the array
would have worked today and broken the first time anything was appended after section 4.

Both are guarded (`if(typeof masteryRankLabelRewrite === 'function')`), so deleting the fragment
leaves the trunk's own wording standing rather than throwing — inside a function every weapon on
the sheet goes through.

---

## What this fix does **not** ship

**No stylesheet.** CLAUDE.md's per-phase list names one, and this deviates from it deliberately:
the fix adds no element, no class, no custom property and no colour. It corrects the text of three
sentences the trunk already printed, into an alert the trunk already styles. An empty
`.css` file would be a file to maintain for nothing. Recorded here and in `ROLLBACK.md` rather
than taken silently.

**No change to the numbers, anywhere.** Proven rather than asserted — see below.

---

## Verification

| Run | Result |
|---|---|
| Own suite | **27/27** |
| Combined suite (every retained suite + this one) | **980/980** |
| Every retained suite, this fix removed | **953/953** |
| Surgical removal rebuild | **2,671,095 bytes, `6a08d86a…`** — byte-identical to the Feature 4.5.12 build |
| `qa/test-removal.py` | **16/16** |
| `qa/feature-dependencies.py` | exit 0 — every reference inside a block this fix owns |

Live build: `6722adcb613d50853b538a8d24533a7a57866a9d926dfa2c026d5894d9fed0e8`, 2,682,437 bytes.

### The strongest check here is the one that proves nothing moved

This is a labelling fix, so the risk is not that the new labels are wrong — it is that something
else changed on the way. `damage-breakdown-baseline.json` is a recorded snapshot of the **pre-fix**
build: every weapon in `WEAPON_LIBRARY` × ranks 0–10, **528 rows**, taken from `6a08d86a` before a
line of this fix existed. Four checks sweep the whole corpus against it:

| | Result |
|---|---|
| rows where any numeric field or flag moved | **0 of 528** |
| rows where the breakdown array changed length | **0 of 528** |
| lines that changed | **136**, across 96 rows |
| changed lines whose **effect text** moved at all | **0** |
| lines outside the three mastery sentences that changed | **0** |

A baseline recorded from the build under test would prove nothing, which is why it is a committed
artifact recorded from the previous build. `MR-SCOPE-03` is the non-vacuity complement: it fails if
the sweep finds *no* relabelling, so the four checks above cannot pass by the fix having done
nothing — which is exactly what happens under the kill-switch, and is why that revert still reds.

> **`MR-SCOPE-01` was rewritten when the wording changed, and is stronger for it.** Its first form
> asserted "only the rank *number* changed", which held while the fix corrected the number in
> place. Re-attributing the clause broke that premise. It now asserts that every changed line kept
> its **effect text exactly** — which is the property that actually matters, and which the original
> form only implied.

### Every check that encodes a decision was proven able to fail

Isolated reverts in scratch copies, one at a time:

| Revert | Suite | Checks that went red |
|---|---:|---|
| Kill-switch off | 14/27 | the eleven label/behaviour checks, plus `MR-GUARD-02` and `MR-SEAM-01` |
| Drop the trunk call (fragment intact) | 16/27 | the same eleven, without the two the fragment still satisfies |
| **Revert to the ambiguous `Rank N mastery` wording** | 17/27 | `MR-SCOPE-04` and nine others |
| Name only the first contributing rank | 24/27 | `MR-LABEL-03`, `MR-SUPERSEDE-02`, `MR-PURE-03` |
| Treat explosion thresholds as accumulating | 26/27 | `MR-SUPERSEDE-01` **alone** |
| Claim a rank on the legacy-fallback path | 26/27 | `MR-LEGACY-01` **alone** |
| Ignore the captured start index | 25/27 | `MR-GUARD-01` and `MR-GUARD-02` |
| Match the prefix anywhere, slice from the match | 25/27 | `MR-GUARD-03` and `MR-GUARD-02` |

**The last row is the one this exercise earned.** An early draft of the suite passed **25/25**
against a build whose prefix test was relaxed from `=== 0` to `>= 0` — the decision had no check on
it at all. Investigating why produced something more useful than a new check: `>= 0` alone is *not
observable*, because the slice that follows uses a fixed offset and so re-anchors the match by
accident. The genuinely dangerous shape is match-anywhere **plus** slice-from-the-match, which
silently deletes everything before the match (`"Kata: while active, Kenjutsu Rank 8 mastery +1k0 is
doubled."` → `"Kenjutsu Rank 3 mastery +1k0 is doubled."`). `MR-GUARD-03` and a fixture line that
can actually tell the two apart were added for that, and the reasoning is recorded in the
fragment's own comment so it is not "simplified" back.

The two-reds rows are not isolated and are not presented as such: ignoring the start index moves
both boundary checks because both are about boundaries, and `MR-GUARD-02` asserts *how many* lines
were rewritten, so it moves whenever the rewrite's reach changes. Same shape as Feature 4.5.12's
`traitName` guard protecting two things at once.

### What could not be driven end to end, and what was done instead

`getWeaponDamageDice()` falls back to `getLegacyMasteryBonus()`'s hardcoded free-text values
whenever structured and legacy disagree, so a **wholly invented** skill always lands on the legacy
path and prints nothing to inspect. Two consequences, both handled rather than glossed:

- The **supersede rule** is driven end to end by *mutating an existing skill* in a way that keeps
  the two in agreement — `explodeOn: {3:10, 7:9}` still resolves to 9, so `matched` stays true and
  the structured path runs. `MR-SUPERSEDE-01/02/03` drive the real function and restore the skill
  afterwards.
- The **legacy path itself** is driven by forcing a real disagreement (`dmgBonus: {3:{roll:2}}`
  against the hardcoded `+1k0`), and `MR-LEGACY-01` asserts the line then claims **no rank at
  all** — not the old wrong rank, and not a guessed right one.

Shapes neither can reach are unit-checked on the exported helpers (`MR-PURE-01/02/03`).

---

## Why this shipped unbundled

The ledger's 17 September decision was to bundle this with the empty-quiver ammo picker as one
folder, on the (correct) reasoning that per-phase overhead, not code, is the expensive part. That
decision was revisited on 17 September for two reasons:

1. **The ammo item is blocked on a product ruling** — prompt-and-refuse, prompt-with-an-empty-state,
   or change the other path — which has not been given. Bundling would have made the unblocked half
   wait on the blocked one.
2. **This half is cheaper than it was costed at** (5–7% → the two corrections above), so the saving
   the bundle was meant to buy is smaller than it looked.

The ammo picker remains queued, unchanged, and still wants the ruling before it can be costed
honestly.

---

## Still open, and deliberately not fixed here

- **The damage modal still has no general explanation channel.** `getWeaponDamageDice()` returns a
  full `breakdown` array that only the weapon-info modal renders in full; the damage modal shows
  none of it except what Part C Feature 6's decorator and Feature 4.5.12's `.roll-note` put there.
  Feature 4.5.12 declared this and it is unchanged — the damage-side counterpart of Phase 4
  (Part G) still wants its own phase. **This fix corrects the label wherever it is printed**, so it
  is not blocked on that; it simply does not widen where it is printed.
- **`getDamageBonus()` still returns no attribution.** This fix derives the granting ranks at the
  point of display rather than changing that function's contract, because seven call sites read it
  and only one of them wants attribution. If a second consumer ever needs it, the derivation here
  is three small pure functions already on the seam.
- **Not real-device confirmed.** A cloud session cannot preview the sheet. What changes is the text
  of three lines in the weapon-info modal; nothing moves, nothing is added, and no geometry is
  involved — but the wording itself has not been read on the reporting device. The *first* wording
  was not either, which is how it reached the device still ambiguous.

---

## Rolling back

See `ROLLBACK.md`. Primary method is `qa/remove-phase.py` against a copy of the Phase 0 tree.

> Read `ROLLBACK.md`'s live-tree note before running **any** Part I remover. The guard in eight of
> them is decorative — it computes a path that cannot exist and therefore never refuses. This
> remover inherits D04a's fixed guard.
