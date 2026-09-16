# Phase 4.5.7 — Unlucky

D05, the **last** of the Phase 4.5 audit's 23 missing configuration handlers, and the only one of
the final three that needed dice-engine work rather than a badge. With this shipped, every finding
on that audit is either built or explicitly parked.

## The rule, and the two numbers that are easy to conflate

Core Rulebook, printed p.162 / PDF p.165: **2 XP per rank**, and **one use per rank per session**.
Rank 5 is therefore 10 XP and **5/5 uses, not 10/10** — the award and the resource both scale off
rank but are not the same number. `UNLUCKY457-PRICE-04` exists for that conflation specifically.

When invoked, the second result is kept **in all cases**, even when it is better than the first.
The catalogue used to say "keeping the worse result"; Feature 4.53 already corrected that text
against the source, and this phase implements what the corrected text says.

## This one belongs on D45, and Feature 4.56's did not

Feature 4.56 wanted the same free-number rank and could not use Phase 4.5.2's `D45.install()`
seam, because `D45.refresh()` opens with `div.parentElement?.id !== 'disadvList'` and renders
"This entry belongs in Disadvantages." for anything else.

Unlucky **is** a Disadvantage, so that invariant is satisfied rather than fought, and the whole
rank/validate/resolve/decorate surface comes for free. The two phases reaching opposite conclusions
about the same seam is not an inconsistency — it is the seam's own rule being respected in both
directions.

## Why the reroll cannot restart the action

The audit is explicit that a reroll must not re-pay a spell slot, re-run a Willpower gate, spend
Void again, re-activate a limited resource, or offer a fresh bonus selection.

This reuses Phase 4.5's own `advConfigLuckRerollResult()`, which re-rolls the **saved dice pool**
and re-applies the flat modifiers already baked into the first result. It never re-enters the
action that produced the roll, so none of those costs *can* be charged twice. The property is
structural rather than a list of things this phase remembers not to do — and
`UNLUCKY457-ISOLATION-01` proves it the same way, by snapshotting the entire character before and
after an invoke and asserting the only path that changed is Unlucky's own counter. A cost nobody
thought to name, including one added later, would fail that check.

Reusing that helper rather than copying it also keeps the exploding-dice threshold handling in one
place; `100-dice-engine.js` carries a comment about why that matters for a mastered weapon.

## What was built

- **The entry**, installed through `D45.install()` as a free-number `rankPick` with its own
  `steps`/`validate`/`resolve`/`decorate` hooks. No rank cap — the source states none, and rank 10
  is asserted at 20 XP so a fixed ladder could not quietly pass.
- **`GM invokes Unlucky (n/rank)`** on every roll result, below Luck's own actions. Visible but
  **disabled at zero**, deliberately: a pool the player knows they have should read as spent, not
  silently vanish.
- **Pips, `−`, `+` and `Reset session`** on the row. The manual pair is not a convenience — the
  audit requires a correction path, because a reroll forced at the table, away from the sheet,
  still spends a use that nothing here saw. `−` disables at zero and `+` at full, so neither can
  push the pool out of range.
- **A Session Resources entry** in the existing quick-access panel, by wrapping Phase 4.5's own
  collector rather than rendering a second panel.
- **`remaining` is read and defaulted, never written, during render.** A freshly configured entry
  shows a full pool without this phase having to write to the row just to display it.

## Validation

```bash
node qa/current-suite-runner.js <path-to-l5r-character-sheet.html>
```

| Suite | Result |
|---|---:|
| Feature 4.57 Unlucky | **32/32** |
| Every retained suite plus Feature 4.56 | **641/641** |
| **Combined** | **673/673** |

### Proving "keep the second result even when it is higher" with real dice

That rule cannot be proven by one roll, because whether the reroll comes out higher is chance. The
check invokes **twenty times** over a 5k3 exploding pool and asserts the displayed total equals the
**reroll** on every single one — then separately asserts that at least one reroll actually came out
higher, so the interesting branch was genuinely reached rather than never met.

Measured on the run recorded here: **15 of 20 rerolls came out higher, and all 15 were still
kept.** Nothing is stubbed; a stubbed reroll would only prove this module agrees with the stub.

### The harness was made to fail — twice, because this phase has two halves

| Build | Result | What failed |
|---|---:|---|
| Kill-switch `false` (JS half off) | **2/13** | Everything. With no schema registered the entry never configures, so every pricing, reroll, use-counting, isolation, manual-correction, persistence and geometry section collapses — hence the 13 denominator. |
| `59.2-disadv-unlucky.css` dropped | **31/32** | Exactly `UNLUCKY457-GEOM-01`: the invoke button shrinking to 209px, the width of its own label, instead of filling the 291px block. |

`GEOM-02` passes in both builds and is kept as a property assertion rather than a claim of
authorship — `.unlucky-actions` is a block element and fills the modal natively. Saying so here is
the honest version; the two previous phases each shipped a geometry check that could not go red,
and the fix was to measure both builds side by side **before** writing the check. That was done
first this time, and `GEOM-01` discriminated on the first attempt.

### A cross-phase fixture correction, declared

`R453-CAT-06` (Feature 4.53's suite) failed when this phase landed: it added an **unconfigured**
Unlucky row and asserted its cost box read 2. That was true only while Unlucky had no configuration
handler. It now reads 0 and "Needs a choice" until a rank is picked — the same rule every other
configurable Disadvantage already followed (Antisocial's catalogue 2 and Obligation's 3 both read 0
unconfigured, verified), and 209.8's own stated principle that *"a variable price is not a
provisional price."*

So the failure was correct behaviour meeting a fixture that encoded the pre-configurable world.
The check's **intent** — that 4.5.3's correction to 2 XP per rank still holds — is unchanged, and
is now proven through the live pricing path by configuring rank 1 and asserting the award is 2.
The corrected fixture passes **both** with this phase present and with it removed, which the
original could not have done. Declared in this phase's `ROLLBACK.md`.

### Structural invariants

Unchanged against the removed build: **270 element ids, 0 duplicated**, 10 sections, both test
seams, 26 roll-modal overlays, 3 scripts, 2 stylesheets. This phase adds no markup — every control
is built at runtime and disappears with the fragment.

### The ownership scan

Clean first time: *every reference is inside a block PART I FEATURE 4.57 owns*.

## Removal proof

| | |
|---|---|
| Live build (this release present) | **2,562,091 bytes**, `ad856e506e35121951923e28c907427c273eacf14a490db5d42ad446b2c3f0cf` |
| Removed build | **2,546,662 bytes**, `5a47ab73eb955fa03edddf9d16c90a4d9a0c6d90c1e679d0665320f963225ca6` |

Byte-identical to the Feature 4.56 build this release was added to, first attempt. Every retained
suite then reads **641/641** against the removed build.

`qa/test-removal.py` passes **16/16**. Its sibling-survival fixture carries the whole run —
`PART I FEATURE 4.5` is now a prefix of **five** markers — and was proven load-bearing by weakening
`BEGIN_RE` to a prefix match and confirming the remover then mangles 4.56's block.

## Real-device confirmation and one correction, same day

The project owner tested Unlucky on their iPhone and confirmed it works. One thing came back:
**all three row controls carried a Feature 4.54 circled-i.** That phase decorates any element with
an explanatory `title=` — right for a rules tooltip a phone cannot otherwise reach, wrong for three
small controls whose own labels sit inches away. On a row already carrying pips and a summary it
read as clutter, one icon per button.

Fixed by moving each description from `title` to **`aria-label`**. Feature 4.54 selects on
`[title]`, so nothing is decorated any more, and the accessible name survives — a screen reader
announcing "−" with no description would be useless. `UNLUCKY457-MANUAL-06` pins all three
properties (no `title`, an `aria-label` present, no icon) and was proven able to fail by reverting
the attribute in a scratch build.

The result-modal invoke button was never affected: Feature 4.54 does not watch the roll modal, so
its `title` carries no icon and was left alone.

## What this release does NOT claim

- **The reroll behaviour is real-device confirmed; the correction above is not.** Unlucky itself
  was tested on the phone. The `aria-label` change that followed has only been verified headlessly.
- **The GM decides, not the sheet.** Nothing here detects when Unlucky should apply, and nothing
  forces it. The button records and performs a reroll the GM has called for; the audit scoped it
  that way and no automatic trigger was added.
- **A reroll does not reset the once-per-Round Void restriction.** It never re-enters the action,
  so that restriction is simply untouched — but it is worth stating, because a player might expect
  a "new roll" to grant a new Void spend. It does not.
- **Uses are per session, and the sheet does not know when a session ends.** `Reset session` is
  manual, exactly as Luck's is.
