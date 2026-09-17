# PART I — Phase 4.5.12: Seven Fortunes' Curse — Bishamon (D04b, first half)

Point release on Phase 4.5. **Bishamon alone**: the sixth of D04's seven Fortune curses, left
deferred by D04a because the audit asked for its three damage boundaries to be reviewed first.

Its rule is one sentence — *your Strength counts for one rank less when it contributes to weapon
damage* — and the first measurement taken for it overturned how every 4.5.x release before it
reaches a roll.

| | |
|---|---|
| Award | **3 XP** (unchanged; D04a already priced the entry) |
| Fragment | `src/sheet/209.98-feat-disadv-fortune-bishamon.js` |
| Stylesheet | `src/css/59.7-disadv-fortune-bishamon.css` |
| Shared-file blocks | 1 in the seam, **2 in `100-dice-engine.js`** |
| Registry seats taken | **none** |
| Edits to D04a's fragment | **none** |
| Kill-switch | `DISADV_BISHAMON_ENABLED` |

---

## The measurement that changed the design

**Bishamon cannot be a pre-roll modifier, and the failure mode is silent.**

Every 4.5.x entry that touches a roll reaches it through `PREROLL_MODIFIER_REGISTRY` — 4.5.9 by
re-registering a contributor, 4.5.10 and 4.5.11 through `D45.modules`. The obvious plan for
Bishamon was a modifier returning `-1k0` on `ROLL_KINDS.DAMAGE`.

Measured before anything was written: **`rollWeaponDamage()` never calls
`applyPreRollModifiers()`.** It rolls `getWeaponDamageDice()`'s numbers directly, and consults the
pipeline only *afterwards*, in Part C Feature 6's `attachArrowDamageBreakdown()`, to **decorate an
already-rendered modal**. Proven by registering a probe returning a real `-3k-1` for a damage
context and rolling a katana:

> the modal printed **`PROBE: -3k-1`** and the dice rolled the full, unreduced **5k2**.

So a modifier-based Bishamon would have shown the player a penalty their dice never took — and
would have passed any check that asked `getPreRollModifiers()` and stopped there. That is the
project's own "the two halves agreed with each other rather than with reality" failure, which
Part H Phase 1 shipped once already.

The reduction therefore happens **inside the damage maths**, which is also exactly what the audit
asks for in rules terms: *"reduce the character's Strength contribution … do not subtract a die
from every damage roll indiscriminately."*

`F4512-ROLL-01` drives a real damage roll and counts the dice on screen. A scratch build where the
pool is computed and reported correctly but the dice ignore it drops the suite to **44/45 on that
one check alone** — nothing else in the file can see it.

---

## What else was measured

**1. The three branches were already separate, which is why this is cheap.** Section 3 of
`getWeaponDamageDice()` splits exactly the three ways the audit asks to be checked separately, and
this fragment keys on the `traitName` that function already reports:

| `traitName` | Weapons | Bishamon |
|---|---|---|
| `Bow Strength` | Yumi, Dai-kyu, Han-kyu | reduced **inside its own `min()`** |
| `Strength` | melee, thrown, **and unarmed** | reduced |
| `Perception` | Pistol, Musket | **not** reduced — not the Strength contribution |
| `null` | Cannon, Blowgun, Nageteppo | nothing to reduce |

**2. Unarmed is Strength-based, so it is affected.** The audit asks for unarmed eligibility to be
checked separately. `Unarmed` carries **no `dmgTrait` key at all**, and the branch test is
`entry.dmgTrait !== null` — `undefined !== null` is true — so it lands in the ordinary branch and
`dmgTrait || 'Strength'` names it. Measured: `traitName:'Strength'`, pool `2k1` at Strength 2.

**3. Han-kyu is the boundary case, and it is the sharpest check in the suite.** Its bow rating is
1, so `min(rating, Strength)` reads **1 at every Strength from 1 to 5** — Bishamon can never
change it. Yumi (rating 3) stops changing at Strength 4 and above. Reducing inside the `min()`
gets all of this for free; a blanket `-1k0` is wrong on precisely these weapons and **passes every
other damage check in the file**. `F4512-BRANCH-04` is the only one that catches it.

**4. Lowering actual Strength is not an option.** Measured: dropping Strength 2 → 1 moves the
**Water Ring** 2 → 1 on the live sheet. The reduction stays a local variable inside one function;
the Trait input is never written. Attack rolls are safe for a second, independent reason —
`getWeaponAttackDice('Kenjutsu')` rolls **Agility**, measured.

**5. The floor is a measured decision from this sheet, not a source citation.** The sourcebook does
not say what "one rank lower" means at Strength 1. Measured: `#trait_strength` has `min="1"`, so
actual Strength is never 0 here; and an effective Strength of 0 makes an unarmed strike roll
`0k1`, which `rollWeaponDamage()` **refuses to roll at all** ("has no damage dice to roll"). A
curse that presents as a broken sheet is worse than one that does nothing, so effective Strength
floors at 1.

> **The consequence, stated plainly: at Strength 1, Bishamon costs you nothing on damage.** The row
> says so in those words rather than showing a badge that implies a penalty. `MIN_EFFECTIVE_STRENGTH`
> is a single named constant — this is the one thing here a rulebook could overturn, and it is a
> one-line change if it does. Feature 4.5.8 reached its element list the same way.

**6. It needs no edit to D04a, which owns the entry.** Measured: `F4511.FORTUNES` is a plain
mutable object read live by `spec()`, and `definition.decorate` reaches `api.decorateRow` by
**property lookup at call time**. So retuning Bishamon's spec and wrapping the decorator both work
from here — Feature 4.5.3's pattern of keeping the previous binding and delegating to it. Changing
the effect key away from `deferred` also makes D04a's own "not yet automated" note stop rendering
and its quiet dashed badge treatment stop matching, **both without touching that file**. That is
Feature 4.5.10's Yomi lesson used deliberately rather than hit by omission.

**7. Duplicates stack, inherited rather than invented.** D04a's `modifiers()` pushes one entry per
active row, so two Benten rows already stack on this very catalogue entry. Bishamon matches that
observable behaviour — one rank per active row — rather than introducing a second rule for the same
entry. The floor bounds it, so no number of rows can produce an unrollable pool.

---

## A defect this phase's own check found

`F4512-ROLL-02` was written expecting to pass and failed: the dice dropped correctly and **the
modal said nothing about why**. `getWeaponDamageDice()`'s `breakdown` array never reaches the
damage modal — it is surfaced only by the ammo phase's decorator, which returns early unless a
pipeline modifier exists, and this phase deliberately contributes none.

Fixed with one additive block appending a plain `.roll-note`. Two more obvious routes were
rejected for measured reasons, both recorded in the block's own comment:

- **The modifier bar** builds an element with `id="rollModifierBar"`, and the ammo contributor
  already calls it for a chosen arrow. A cursed bow shot with an arrow selected would put two
  nodes with that id in the document, which the project's build invariants forbid.
- **An `informational:true` modifier** — the shape Friend of the Elements and the arrow line both
  use — would need an **eighth registry seat**, and Phase 1.5 (Part G) baselined that at seven.

---

## A mistake worth recording

The first manifest edit used `json.dumps()` to insert two entries, which **reformatted the whole
file**: 465 insertions and 163 deletions where four lines were wanted. The live manifest is
hand-maintained in a compact `{ "file": …` / `"note": … },` shape, and every Part I remover's
manifest surgery depends on it — the rewrite expanded each entry to four lines and left an orphan
`{`, breaking the removal outright.

**Caught by the removal proof, not by review or by the harness**, both of which were green. The
final diff is four lines plus the hash. `test_the_compact_one_entry_per_two_lines_shape_is_what_the_cut_expects`
now pins the shape against the live file so the next release cannot repeat it.

---

## Verification

| Run | Result |
|---|---|
| Own suite, this phase present | **51/51** |
| Combined suite (every retained suite + this one) | **953/953** |
| Own suite, kill-switch off | **25/51** — 26 checks go red |
| Own suite, stylesheet dropped | **47/51** — exactly the four geometry checks |
| Surgical removal rebuild | **2,649,854 bytes, `28e01755…`** — byte-identical to the D04a build, first attempt |
| Every retained suite, this phase removed | **902/902** |
| `qa/test-removal.py` | **16/16** |
| `qa/feature-dependencies.py` | exit 0 — every reference owned by this phase |

Live build: `6a08d86aa733f243acfa5daa2099bb75fc3fd32dd48490404f05edda3dbb4c7e`.

> The counts above are **after** the real-device correction below (they read 45/45, 947/947,
> 24/45 and 41/45 on first ship). The removal rebuild and the removed-suite number are
> **unchanged by that correction**, which is the point of how it was made.

### Every check that encodes a decision was proven able to fail

Isolated reverts in scratch copies, one at a time:

| Revert | Suite | Checks that went red |
|---|---:|---|
| Bow branch uses a blanket −1 instead of re-deriving the `min()` | 44/45 | `F4512-BRANCH-04` **alone** |
| Drop the `traitName` guard | 44/45 | `F4512-BRANCH-05` **alone** |
| Roll the unreduced pool while reporting the reduced one | 44/45 | `F4512-ROLL-01` **alone** |
| `MIN_EFFECTIVE_STRENGTH` → 0 | 40/45 | the four `FLOOR` checks + `STACK-02` |
| Keep the note, drop the dice reduction | 40/45 | `BRANCH-01/02/03`, `ROLL-01`, `STACK-01` |

The third row is the one worth keeping. It simulates exactly what a pipeline-based implementation
would have shipped — a correct number, correctly displayed, and dice that ignore it — and
**`F4512-ROLL-01` is the only check in the file that can see it**, because it is the only one that
reads rendered dice rather than the computed pool.

### The geometry checks discriminate on the first attempt

Both builds were measured side by side before any geometry check was written. The note's **width
(303px) and x position are identical with the stylesheet dropped**, because the row's own flex
context supplies them — so neither is asserted. Only `flex-basis`, `margin-top`, `font-size` and
`color` actually differ, and the stylesheet-dropped build fails **exactly those four and nothing
else**. Fifth phase running that measuring first has earned its keep, and the first since 4.5.6
where no check had to be rewritten for being unable to fail.

---

## Real-device correction, 17 September 2026

Tested on a real device with a Kenjutsu Rank 8 character across all three branches. **The dice
were right in every case**, and two things about the *explanation* were not.

### 1. The zero-cost cases said nothing at all — and silence reads as "not implemented"

At Strength 1 the curse correctly costs nothing, the row said so in those words, and the **damage
modal did not mention Bishamon at all**. The reporter's reading was the honest one: with a
configured, paid-for curse and no line in the modal, the reasonable conclusion is that the
feature is broken, not that the floor is doing its job.

Root cause: `api.adjustDamage()` returned `null` whenever `lost <= 0`, and **`null` was doing
triple duty** for three cases that are not alike:

| Case | Owed an explanation? |
|---|---|
| Strength at the floor | **Yes** — Strength *is* the contribution, and a decision of ours stopped the curse |
| Bow whose own rating already binds (Han-kyu) | **Yes** — same, and the reason is different |
| Perception / flat-DR weapons | **No** — Strength was never in this pool; a Bishamon line here is noise |

It now returns a **zero-delta result** carrying the reason for the first two and still returns
`null` for the third. `F4512-EXPLAIN-04` is the complement that fails if the note starts
appearing on pistols — a build that explains everything is as wrong as one that explains nothing.

**This needed no change to `100-dice-engine.js`, and that was measured rather than hoped.** The
existing block already does `numDice += bishamon.rolledDelta` and `traitValue =
bishamon.traitValue`, both no-ops at zero, then pushes the note. That is why the removal rebuild
and the removed-suite number below are **identical to first ship** — the correction is entirely
inside this phase's own fragment.

### 2. "Bow Strength counts as 1 rather than 2" was read as the bow's rating

`Bow Strength` is `getWeaponDamageDice()`'s internal label for *your Strength as capped by the
bow*, and on the row it reads like a property of the bow. Both branches now say **"your
Strength"** explicitly, and the bow adds "for this bow's damage":

```
Bishamon: your Strength counts as 2 rather than 3 for this bow's damage (−1k0). → 4k2.
Bishamon: this bow's own rating of 1 already limits the pool below your reduced Strength, so
          the curse costs nothing here. → 3k2.
```

When `lost > 0` on a bow the Strength is the binding constraint on both sides, so naming the
Strength is not merely clearer — it is what actually moved.

### Each new check was proven able to fail

Isolated reverts in a scratch copy, one at a time:

| Revert | Suite | Checks that went red |
|---|---:|---|
| `return null` on `lost <= 0` (exactly what shipped first) | 48/51 | `EXPLAIN-01/02/03` |
| Always blame the floor, never the bow's own rating | 50/51 | `EXPLAIN-03` **alone** |
| Reduction note uses the bare `traitName` again | 49/51 | `EXPLAIN-05/06` |
| Drop the `traitName` guard, so every weapon explains itself | 49/51 | `EXPLAIN-04` **and `BRANCH-05`** |

The last row is worth keeping: the `traitName` guard now protects **two** things — the Pistol's
pool *and* the Pistol's silence — so dropping it reds a pre-existing check and a new one
together.

### Still open, and deliberately not fixed here

Three further observations from the same session, none of them this phase's:

- **`Kenjutsu Rank 8 mastery +1k0` names the wrong rank.** Masteries are at ranks 3 and 7; the
  breakdown prints the character's *current* rank. `getDamageBonus()`
  (`020-lib-skills-advantages.js:320`) **accumulates** across every unlocked threshold and
  returns `{roll, keep}` with no record of which contributed, and `getExplosionThreshold()`
  returns only the lowest unlocked value — so printing the *granting* rank means a new lookup,
  not a string change. Three breakdown lines, trunk code, **7 call sites across 3 files**. Wants
  its own bugfix folder.
- **The ammo picker is skipped with an empty quiver.** `ammoTrackingActive(row)` is
  `anyArrowEquipRows() || !!getRowArrowType(row)`, so an empty quiver and no row selection skip
  the prompt **by design**, with a `DEFAULT_ARROW` fallback behind it. Making it consistent is a
  product decision (prompt-and-refuse / prompt-with-empty-state / change the other path) before
  it is a code change, and it moves a shipped feature's attack flow.
- Both were measured, not guessed, and both were costed before being deferred.

### What the headless harness cannot see

The two corrections above came from a real device. What has **not** been confirmed there is the
corrected wording itself — the notes are longer than what they replaced, and the zero-cost note
is a new full-width line in the damage modal.

Nothing else here has been confirmed on a real device. The visible surface is small — one row note and
one line in the damage modal, both reusing shapes D04a and the trunk already ship — but the note
is a new full-width element on the configured row, and the damage modal has not carried an extra
`.roll-note` before.

---

## Rolling back

See `ROLLBACK.md`. Primary method is `qa/remove-phase.py` against a copy of the Phase 0 tree.

> Read ROLLBACK.md's live-tree note before running **any** Part I remover. The guard in every one
> before D04a's is decorative — it computes a path that cannot exist and therefore never refuses.
> This remover inherits D04a's fixed guard; the other ten are still unfixed.
