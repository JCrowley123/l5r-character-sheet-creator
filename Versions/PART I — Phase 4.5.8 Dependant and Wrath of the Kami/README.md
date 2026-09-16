# Phase 4.5.8 — Dependant and Wrath of the Kami

D02 and D07, the first two of the six Disadvantages left on the Phase 4.5 audit after 4.5.7
closed D05. Both are "pick one thing, price it, show a reminder" entries with no dice-engine
work, which is exactly why they ship together — the whole phase is one `D45.install()` each plus
a badge.

This is the first release of the staged Disadvantage plan: cheapest and most reusable first,
reassess against the budget, leave D06 Weakness for a fresh week.

## Four things were checked live first, and three changed the design

The audit's proposals for both entries were written in September against the code as it then
stood. Driving them before building found three that no longer held.

**1. D45 cannot host an optional field.** The audit proposed a multi-field Dependant modal —
name, helplessness, frequency, points. `D45.readStep()` validates every step with `!!picked`, so
a blank text field blocks *Next*. There is no optional step, and adding one would mean editing
Phase 4.5.2's own function rather than installing onto its seam. So the modal asks the single
**required** thing — the agreed amount — and the optional detail lives on the row, where blank is
naturally fine. That is better on a phone anyway: one decision in the modal, detail edited in
place afterwards.

**2. Neither entry may add a `configTypes` string.** Feature 4.5.2's harness pins
`D45.configTypes` to an exact twelve-element array. Appending the audit's proposed
`agreedPointsPick` would fail that check — and unlike 4.5.7's `R453-CAT-06`, **no fixture
correction could fix it**, because an exact-array assertion has no expected value that passes
both with this phase present and removed. So both entries reuse an existing shape honestly:
Dependant is D45's `rankPick` (whose no-ladder form *is* "one free positive integer", the same
shape Unlucky uses) and Wrath of the Kami is `elementPick`.

`D458-CONTRACT-03` repeats 4.5.2's expectation verbatim inside this phase's own suite, so a
future edit here goes red in this suite first rather than in someone else's.

**3. Reusing `elementPick` is safe — and that was not obvious.** Elemental Imbalance is the only
other `elementPick`, and it carries a **Willpower gate before casting**, which is precisely the
"no change to the player's own casting" this entry forbids. Grepped across every fragment:
`elementPick` appears *only* inside `209.85`, in the definition map, the `configTypes` list, and
the built-in `validate`/`steps` that a per-definition `validate`/`steps` overrides. Every
Elemental Imbalance behaviour — the gate, the deficiency rule, 4.5.5's Shugenja eligibility
rule — is keyed on the **name**, not the type. Nothing can leak, and the ISOLATION section proves
it rather than asserting it.

**4. D45 would have written `Rank undefined` into Dependant's legacy `value` field.**
`D45.confirm()` sets `c.value = String(c.tenet||c.element||c.target||c.tier||('Rank '+c.rank))`,
and Dependant has none of those — its number is `points`. The `finalize` hook runs on the very
next line, which is what it exists for. Using it beats renaming the field to `rank` to suit a
display string.

## What was built

- **Dependant (D02)** — a free positive integer for the player/GM-agreed point value, awarding
  exactly that. Optional *who depends on you* and *the arrangement* fields on the row.
- **Wrath of the Kami (D07)** — one element from five, awarding **3, or 4 for a Shugenja**, with
  an incoming-spell Free Raise badge for the player to communicate.

### "Roughly 2-6" is guidance, not a ladder

The catalogue says the cost scales "roughly 2-6". The audit is explicit that this must not become
an authoritative dropdown or a hard legal range, so **1 and 40 are both accepted and both price at
face value** — deliberately, with a check that says so. The number is an agreement with a GM.

### No silent 2-point default

The catalogue row carries `cost: 2`. An unconfigured Dependant now awards **0** and reads
"Needs a choice", following 209.8's own principle that *a variable price is not a provisional
price* — the same rule Antisocial, Obligation and now Unlucky follow. The audit asked for this
explicitly; `D458-DEFAULT-01` and `-02` pin it.

### Where the five elements came from

The audit asked for the element list to be **confirmed rather than assumed from the Ring list**,
and it was right to: `RINGS` holds only four (Void is not a Ring row). Measured against the
sheet's own spell library instead — Air 80, Earth 58, Fire 46, Water 43, **Void 30**, Universal 3.

So the picker offers **Air, Earth, Fire, Water and Void**: thirty Void spells exist in this sheet
and could be cast at you, and a player cursed in Void should be able to say so. **`Universal` (3
spells) is deliberately excluded** — it marks a spell any shugenja may cast, not an element the
kami could be wrathful in.

That is a measured decision from the sheet's own data, **not a source citation**, and it is the
one thing in this release a rulebook check could still overturn.

### Shugenja is a price here, never a gate

"Shugenja pay 4" reads as a larger award. Unlike Elemental Imbalance, being a shugenja is not a
*requirement* — a bushi may take Wrath of the Kami at 3. `D458-SHUG-03` asserts both halves of
that in one check, because the two entries share a config type and must not share eligibility.

### No registry seat

The Free Raise belongs to **the other caster**. There is nothing to apply to this character's
pool, so no pre-roll modifier is registered at all and `D458-REGISTRY-01` asserts the registry is
byte-for-byte what it was. This is the approach already approved for Magic Resistance.

## Validation

```bash
node qa/current-suite-runner.js <path-to-l5r-character-sheet.html>
```

| Suite | Result |
|---|---:|
| Feature 4.58 Dependant and Wrath of the Kami | **55/55** |
| Every retained suite plus Feature 4.57 | **673/673** |
| **Combined** | **728/728** |

### The harness was made to fail — twice, because this phase has two halves

| Build | Result | What failed |
|---|---:|---|
| Kill-switch `false` (JS half off) | **0/1** | The presence gate. With neither entry installed there is nothing to price, configure, persist or measure, so the suite stops at `D458-00` rather than reporting 54 vacuous passes. |
| `59.3-disadv-dependant-wrath.css` dropped | **53/55** | Exactly `D458-GEOM-01` (the fields collapse from a 6px flex column to two touching rows) and `D458-GEOM-02` (the badge falls back to 18px of transparent inline text, indistinguishable from the summary beside it). |

`D458-GEOM-03` passes in both and is kept as a property assertion, not a claim of authorship.

### The geometry checks were written after measuring, not before

Both builds were measured side by side **first**, which is the practice Features 4.5.5 and 4.5.6
each lost a round to. It immediately paid: the two inputs are **303px wide in both builds** —
the base sheet stretches them — so an input-width check would have passed with the stylesheet
dropped and proved nothing. It was not written. What the stylesheet actually supplies is the
column gap and the badge's box, and those are what the checks assert.

| Measured at 375px | Styled | Dropped |
|---|---:|---:|
| `.dep458-fields` display | `flex` | `block` |
| Gap between the two inputs | 6px | 0px |
| Badge box | 258 × 26 | 224 × 18 |
| Badge background | `rgba(163,51,42,0.08)` | transparent |
| Input width | 303 | **303** |

### One harness bug, found and sharpened rather than loosened

`D458-ISOLATION-01` first expected the whole character to be unchanged across configuring Wrath
of the Kami, and failed on `f_xpSpent` and `f_xpRemain`. That was the check being wrong: taking a
3-point Disadvantage is *supposed* to move the XP totals — that is the award.

Loosening it to ignore XP would have thrown away what it was for. It now asserts the two XP
totals are the **complete** list of what changes outside the entry's own row, and a second check
asserts they move by **exactly the 3 XP awarded**. Stronger than the version that passed by
accident would have been.

### Structural invariants

Unchanged against the removed build: **270 element ids, 0 duplicated**, 10 sections, both test
seams, 26 roll-modal overlays, 3 scripts, 2 stylesheets, tag balance clean. This phase adds no
markup — every control is built at runtime and disappears with the fragment.

### The ownership scan

Clean first time: *every reference is inside a block PART I FEATURE 4.58 owns.*

## Removal proof

| | |
|---|---|
| Live build (this release present) | **2,572,964 bytes**, `e61137adcd8d6b891c17c69a7f498d936dbc36eabf5531e77fa4b36a47496104` |
| Removed build | **2,562,091 bytes**, `ad856e506e35121951923e28c907427c273eacf14a490db5d42ad446b2c3f0cf` |

Byte-identical to the Feature 4.57 build this release was added to, first attempt. Every retained
suite then reads **673/673** against the removed build.

`qa/test-removal.py` passes **16/16**. Its sibling-survival fixture now carries **six** markers —
`PART I FEATURE 4.5` is a prefix of all of them — and was proven load-bearing by weakening
`BEGIN_RE` to a prefix match, which made the remover reach for Feature 4.53's block and be caught
by the foreign-marker assertion.

## What this release does NOT claim

- **Not real-device confirmed.** Everything here is headless. Both entries are simple, but the
  optional fields commit on `change` rather than per keystroke, and that is the kind of thing a
  phone keyboard can still surprise you with.
- **The element list is a measured decision, not a source citation.** See above. If the rulebook
  restricts Wrath of the Kami to the four elemental Rings, the fix is one line in `api.ELEMENTS`
  plus its check.
- **Nothing resolves an incoming spell.** The badge tells the player what to tell the GM. The
  sheet has no concept of another caster's roll, and the audit scoped it that way.
- **Dependant records no NPC and simulates nothing.** The two optional fields are free text that
  round-trips; nothing reads them but the summary line.
