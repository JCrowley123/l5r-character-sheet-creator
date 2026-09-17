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
| Own suite, this phase present | **45/45** |
| Combined suite (every retained suite + this one) | **947/947** |
| Own suite, kill-switch off | **24/45** — 21 checks go red |
| Own suite, stylesheet dropped | **41/45** — exactly the four geometry checks |
| Surgical removal rebuild | **2,649,854 bytes, `28e01755…`** — byte-identical to the D04a build, first attempt |
| Every retained suite, this phase removed | **902/902** |
| `qa/test-removal.py` | **16/16** |
| `qa/feature-dependencies.py` | exit 0 — every reference owned by this phase |

Live build: **2,669,182 bytes**, `143a4ce7e4a7064e4548fe26d5110aa385f49b7d91617eb1323f8f8c44591219`.

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

### What the headless harness cannot see

Nothing here has been confirmed on a real device. The visible surface is small — one row note and
one line in the damage modal, both reusing shapes D04a and the trunk already ship — but the note
is a new full-width element on the configured row, and the damage modal has not carried an extra
`.roll-note` before.

---

## Rolling back

See `ROLLBACK.md`. Primary method is `qa/remove-phase.py` against a copy of the Phase 0 tree.

> Read ROLLBACK.md's live-tree note before running **any** Part I remover. The guard in every one
> before D04a's is decorative — it computes a path that cannot exist and therefore never refuses.
> This remover inherits D04a's fixed guard; the other ten are still unfixed.
