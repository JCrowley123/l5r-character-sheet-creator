# BUGFIX — Negative Roll Modifier Display

A negative flat total modifier was printed with a hardcoded `+` in front of it. The roll modal's
keep-note read:

```
Keeping 3 of 5 (suggested 3) + -40 bonus
```

on a **wounded character with no Disadvantage configured at all**. It has done this since Wound
Penalties (Part C, Feature 3) first produced a negative total modifier, and Feature 4.5.9 confirmed
it as pre-existing rather than its own — by rolling a wounded character with no Doubt present and
getting exactly that string. Three of its ROLLBACK files record it as wanting its own bugfix.

**The arithmetic was never wrong.** The displayed total already included the −40 correctly.

| | |
|---|---|
| Fragment | `src/sheet/209.991-bugfix-negative-roll-modifier.js` |
| Stylesheet | **none** — see "What this fix does not ship" |
| Shared-file blocks | 1 in the seam, **2 in `100-dice-engine.js`** (trunk) |
| Registry seats taken | **none** |
| Kill-switch | `NEGATIVE_ROLL_MOD_DISPLAY_FIX_ENABLED` |
| Own suite | **12/12** |
| Combined suite | **992/992** (980 retained + 12) |
| Removal | **byte-identical**, 2,682,769 bytes / `6722adcb` |

---

## What `result.bonus` actually is, because the label is the whole defect

It carries **two unlike things summed into one number**, which `130-round-and-pipeline.js`'s own
block comment already records:

- the **Ten Dice Rule's** flat conversion bonus — always `>= 0`, genuinely a bonus; and
- the pipeline's **`totalDelta`** — wound penalties, firing into melee −10, Doubt's required
  Raise — folded in there because `updateRollKeepState()` recomputes the total on *every* die
  click, so a post-render tweak would be wiped by the next one.

So the number can be net positive or net negative, and the word in front of it has to follow. That
is why this is a wording fix rather than a sign fix: calling a wound penalty a "bonus" is the part
that makes the reader stop.

## The report understated it — measured before anything was written

Three sites format that number with a hardcoded `+`. **Two are visible:**

| Site | With `bonus = -40` | Visible? |
|---|---|---|
| Keep-note (`100-dice-engine.js`) | `... (suggested 3) + -40 bonus` | **yes** — reported |
| **Notation line** (same file) | `12k4 → 10k5 +-40 (Ten Dice Rule)` | **yes** — *not reported* |
| `Ten Dice Rule bonus: +N` note | `Ten Dice Rule bonus: +-40 …` | no |

The notation line was found by driving the roll and reading the modal rather than by reading the
report, and it is fixed here for the same reason the mastery-label fix corrected every rendered
site at once: shipping one and not the other guarantees a second device report.

### The third site is deliberately not fixed, and that is a decision

`result.bonus` can only be negative when `totalDelta` is non-zero — and that is exactly the
condition under which `attachRollModifierBreakdown()` **hides** that note and renders an itemised
breakdown instead. Both halves measured. Correcting only its *sign* would leave it reading
`Ten Dice Rule bonus: −40` about a wound penalty: correctly punctuated and still false. Fixing it
properly means changing what it claims, which is a different job in a different phase's territory.

`NEGMOD-HIDDEN-01` pins that it stays hidden in every negative case, so if a later phase ever
unhides it the suite says so rather than the player finding out. `NEGMOD-HIDDEN-02` pins the
complement: a genuine positive Ten Dice bonus still shows that note, unchanged.

### And one site that looked like a fourth and is not

`formatRollNotation()` has the same `+${adj.bonus}` shape. It reads `applyTenDiceRule()` **directly**
rather than the pipeline, and every branch of that function builds its bonus from non-negative
counts (`bonusFromKept = Math.max(0, kept-10)*2`). It cannot go negative, so it is not a defect and
is not touched. Recorded because the grep that finds two sites finds three.

---

## The change

```
  before   Keeping 3 of 5 (suggested 3) + -40 bonus
  after    Keeping 3 of 5 (suggested 3) − 40 penalty

  before   12k4 → 10k5 +-40 (Ten Dice Rule)
  after    12k4 → 10k5 −40 (Ten Dice Rule)
```

Two pure helpers in the fragment, both exported: `signedRollMod()` for the bare notation and
`rollTotalModNote()` for the sentence. The signed-value shape is the sheet's own —
`090-table-rows-weapons.js` formats a Reduction modifier exactly this way — and the character is a
real **U+2212 MINUS SIGN**, not a hyphen.

**Positive values are unchanged byte for byte.** `+ 12 bonus` and `+12` already read correctly, so
both helpers reproduce the trunk's exact existing spacing on the positive branch. That keeps the
blast radius to the negative case alone, and `NEGMOD-SCOPE-01` asserts it against a recorded
pre-fix baseline.

### Why "penalty" rather than just a corrected sign

Every source of a negative `totalDelta` on this sheet is a penalty — wound penalties, firing into
melee, a required Raise — and a net-negative number is a penalty whatever mix produced it. The
mixed case is real and measured, not hypothetical: a 14k12 roll on a 40-wound character produces a
genuine **+12 Ten Dice bonus netted against −40 of wounds = −28**, and reads `− 28 penalty`.
`NEGMOD-MIX-01` drives exactly that.

---

## Verification

| Run | Result |
|---|---|
| Own suite | **12/12** |
| Combined suite (every retained suite + this one) | **992/992** |
| Every retained suite, this fix removed | **980/980** |
| Surgical removal rebuild | **2,682,769 bytes, `6722adcb…`** — byte-identical to the pre-fix build |
| `qa/test-removal.py` | **17/17** |
| `qa/feature-dependencies.py` | exit 0 — every reference inside a block this fix owns |

Live build: `c7063f52269c306fcd6596e2103518ff27d4a57b01b0db031115dbb59c58ca15`.

### Every check that encodes a decision was proven able to fail

Isolated reverts in scratch copies, one at a time:

| Revert | Suite | Checks that went red |
|---|---:|---|
| Kill-switch off | **4/12** | eight — every rendered string, both helpers, and the seam |
| Keep-note block reverted to the trunk expression | 9/12 | `KEEP-01`, `MIX-01`, `SCOPE-02` |
| Notation block reverted | 9/12 | `NOTE-01`, `MIX-01`, `SCOPE-02` |
| Sign corrected but the word left as "bonus" | 9/12 | `KEEP-01`, `MIX-01`, `PURE-02` |
| A hyphen instead of a real minus sign | 8/12 | `NOTE-01`, `MIX-01`, `SCOPE-02`, `PURE-01` |
| Positive-branch spacing changed | 10/12 | `SCOPE-01`, `PURE-02` |

**The first row is the one this exercise earned, and it found a real defect in this fix.** The
kill-switch first read **11/12** — flipping it changed nothing a player could see, because neither
helper consulted it. It was decorative, which is the same class of defect as the live-tree guard
Feature 4.5.11 found in ten removers. Both helpers now return the **trunk's own pre-fix
formatting** when the switch is off, so a disabled build is byte-identical to the build from before
this fix existed, and the revert reds eight checks instead of one.

The fourth row matters too: a reviewer could plausibly accept a pure sign correction, and
`− 40 bonus` is caught rather than passing.

### One check that cannot go red alone, declared rather than counted as independent

`NEGMOD-PURE-03` asserts both helpers use U+2212. Any wrong character also fails `PURE-01` or
`PURE-02`, which compare the full strings — so it can never fail by itself. It is kept because its
failure message names the cause (`charCodeAt = 45`) where a two-string diff shows a difference the
eye cannot see. Same shape as Feature 4.5.12's `traitName` guard, and reported the same way.

---

## What this fix does **not** ship

**No stylesheet.** CLAUDE.md's per-phase list names one; this fix adds no element, class, custom
property or colour — it corrects two strings the trunk already prints, in a modal the trunk already
styles. A deviation recorded rather than taken silently, as with the previous bugfix.

**No change to any number.** `NEGMOD-ARITH-01` reconciles the displayed total against the kept dice
plus the modifier in all six cases, negative ones included.

---

## Real-device confirmation, 17 September 2026

Both corrected strings confirmed on the reporting iPhone, exactly as designed:

```
Keeping 3 of 8 (suggested 3) − 10 penalty
11k3 → 10k3 −10 (Ten Dice Rule)
```

The first screenshot is an ordinary skill roll on a Hurt (wounded) character — the reported
case. The second is the same character rolling a genuine Ten Dice Rule pool (11 dice), with the
wound penalty and the pool reduction both present in the same roll: the notation and the
keep-note agree, and the number is still correctly signed once two things are happening to the
pool at once rather than one.

**Incidental corroboration, not something this fix built or tested for:** the same screenshots
show Phase 4's (Part G) roll-modifier breakdown panel — a different rendering path, reached
through `buildRollModifierRows()` rather than either function this fix touches — rendering
`Wound Penalty: -10 to total` and `Net -10 — already included in the total` correctly alongside
the corrected keep-note. The two panels were built independently and could in principle have
disagreed about which number is authoritative; on the device they agree.

**Still unconfirmed:** a case where a genuine positive Ten Dice Rule bonus outweighs a wound
penalty (the `woundedPositive` fixture case, −28 net) has not been seen on a real device, only
in the harness.

---

## A mistake worth recording

The remover was first written carrying the **previous bugfix's `END` marker** in its regex, so
every one of this fix's own `END NEGMOD` lines read as an orphan. It **refused to run** rather than
mis-cutting the file — the guard doing exactly its job — and
`test_a_stale_marker_name_is_caught` now pins that behaviour. Worth knowing for the next bugfix
folder derived from this one: rename *every* marker reference, not just `MARKER`.

---

## Rolling back

See `ROLLBACK.md`. Primary method is `qa/remove-phase.py` against a copy of the Phase 0 tree — and
note that this remover **restores** text rather than only cutting it, unlike the previous bugfix's.

> Read `ROLLBACK.md`'s live-tree note before running **any** Part I remover. The guard in eight of
> them is decorative. This remover inherits D04a's fixed guard.
