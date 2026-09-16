# Phase 4.5.6 — Perceived Honor and Wealthy

Two of the Phase 4.5 audit's **23 missing configuration handlers**: A10 (Perceived Honor) and A16
(Wealthy). Both are rank-priced Advantages that have sat in the catalogue with an editable points
box and no way to record the rank that box is meant to price.

This is the smaller half of the three remaining unhandled entries. D05 (Unlucky) is deliberately
**not** here: it is a rank picker *plus* a session-tracked reroll resource wired into the dice
engine, which is a different size of job from these two and was left as its own decision point.

## What was already true

Feature 4.53 corrected both entries' catalogue data in place, and this phase re-corrects neither:

| Entry | 4.53's correction | Source |
|---|---|---|
| Perceived Honor | cost `3` → `2` per rank, description to match | Core Rulebook, printed p.152 / PDF p.155 |
| Wealthy | description's "1 less **per rank**" → "1 less **off the total**" | Core Rulebook, printed p.155 / PDF p.158 |

So the prices were already right. What was missing was the handler those corrected prices were
waiting for.

## The approach that was tried first, and refused

Phase 4.5.2 exposes `D45.install(name, definition)` — a public seam — and its `rankPick` already
accepts **any positive integer with no cap**, which is exactly what the audit demands for both
entries ("a positive whole-number rank input without inventing a rank cap", "matching the Elemental
Imbalance free-number style"). It also supports per-definition `steps`, `validate` and `resolve`
hooks. On paper it was a perfect fit, and it would have been a fraction of the code.

It was tried, live, before this fragment was written. The modal opened, the number input rendered,
and the configuration stored correctly — **and the row still priced at 0 with no summary.**
`D45.refresh()` opens with:

```js
const wrong = div.parentElement?.id !== 'disadvList';
const problem = wrong ? 'This entry belongs in Disadvantages.' : api.problem(s, c, api.state());
```

That is a deliberate invariant of a Disadvantage-only module, not an oversight to route around.
Two Advantages do not belong there. So the free-number rank is added on the **Advantage** side
instead, as its own config type — more code, but no fighting another phase's rules.

Worth recording because the seam *looked* like the obvious answer right up until it was driven.

## What was built

A new `rankFreePick` config type, registered through 209.8's own public
`registerAdvConfigSchema()`, with the four hooks it needs wrapped in this phase's own fragment:
`isExtendedAdvConfigComplete` (the seam 209.8's own comment nominates for exactly this),
`openExtendedAdvConfigModal`, `confirmExtendedAdvConfigModal` and `resolveAdvDisadvEffect`, plus
`advConfigSummaryForEffect` for the row text. The commit itself reuses 209.81's
`commitExtendedAdvConfig()`, so the write, close, recalc and status line are the same ones every
other extended type already goes through.

It is `rankFreePick` rather than 209.81's existing `rankPick` because that type is a fixed ladder
of pre-priced options. Neither entry has a rank cap in the source and the audit is explicit that
one must not be invented, so the rank is typed rather than chosen from a list.

### Perceived Honor

**2 XP × rank.** Rank 1 costs 2, rank 10 costs 20 — `RANKS456-PH-03` asserts the rank-10 case
specifically, because a fixed ladder would have failed there rather than at some arbitrary cap.

The row reads `Rank 3 — read as Honor 8 (actual 5, unchanged)`. That figure is **recomputed from
`f_honorRank` on every refresh, never stored**, which is what makes it follow the Honor field:
change Honor from 5 to 8 and the perceived reading moves to 10 on its own. Actual Honor is never
written to, and the row keeps saying so — the Advantage affects only attempts to *discern* Honor,
not Honor spending, Honor-based resistance, or any roll that adds the Honor Rank.

### Wealthy

**rank × 1 XP, minus a single 1 XP reduction off the total** for a Crane, Unicorn or Imperial
character. Five ranks cost 5 XP, or 4 XP for an eligible character — *not* 0, which is what the
per-rank reading the catalogue used to carry would have produced. `RANKS456-W-02` is the check that
tells those two readings apart.

**Rank 1 with the discount costs 0 XP.** That is the source's arithmetic, and the audit is explicit
that no minimum may be borrowed from another Advantage to avoid it, so none is.

**No money is minted.** The koku entitlement (2 per rank) is stated in the row as a reminder and
nothing more. The audit's hard requirement here is that recalculation, reload, import or edit must
never repeatedly grant currency; this phase sidesteps that entire lifecycle by granting none at
all, which is also what the audit asked for ("preferably show an entitlement reminder until
creation/play semantics are agreed"). `RANKS456-KOKU-01/02` hold it to that across a confirm and
five recalcs.

### Validation

A rank is a positive whole number. Rejected: `0`, negative, fractional, non-numeric, blank, `3x`
and `1e2` — the last two because `parseInt` would happily read them as 3 and 1. `RANKS456-VALID-01`
drives all seven through the real modal, and `-02` then commits a valid rank in the same modal, so
a validator that refused everything could not pass.

## Validation

```bash
node qa/current-suite-runner.js <path-to-l5r-character-sheet.html>
```

| Suite | Result |
|---|---:|
| Feature 4.56 rank entries | **29/29** |
| Every retained suite plus Feature 4.55 | **612/612** |
| **Combined** | **641/641** |

### The harness was made to fail — twice, because this phase has two halves

| Build | Result | What failed |
|---|---:|---|
| Kill-switch `false` (JS half off) | **3/12** | Every pricing, validation, persistence and geometry section, plus both contract checks. With no handler registered the modal never opens at all, which collapses most sections into single failures — hence the 12 denominator. |
| `59.1-adv-rank-entries.css` dropped | **28/29** | Exactly `RANKS456-GEOM-03`, the label falling to 10.56px and 144px wide inside a 291px modal. |

### The stylesheet check took two attempts, for the second time running

The first cut of `GEOM-01` compared the **input** against the modal width. It passed with the
stylesheet dropped — `#advConfigGrid` stretches its children either way, so the check could not go
red. The second attempt measured the input's font size instead; that passed too, because the
sheet's own base stylesheet already supplies 16px.

Measuring the two builds side by side is what settled it. The base sheet already gives this input
its border, radius, padding, background and font size; the only thing genuinely missing without
this phase's file is **the label** — unstyled it inherits 10.56px at 144px wide, a full sentence
("Rank — 2 XP per rank") too small to read at phone width. `GEOM-03` measures that, and fails
correctly.

Two consequences, both kept: `59.1-adv-rank-entries.css` was **cut down** to just the rules that
are actually missing rather than restating what the base sheet already provides, and the 16px
assertion was kept as `GEOM-02` but reworded to assert the *property* rather than this phase's
authorship of it — it matters on iOS (Safari zooms the page in on a focused control under 16px)
regardless of which file supplies it.

This is the same mistake Feature 4.55's first geometry check made. Recorded here rather than
quietly fixed, because "a check that cannot go red is not a check" has now cost two phases running.

### Structural invariants

Unchanged against the removed build: **270 element ids, 0 duplicated**, 10 sections, both test
seams, 26 roll-modal overlays, 3 scripts, 2 stylesheets. This phase adds no markup — its only
control is built at runtime and disappears with the fragment.

### The ownership scan

Clean first time: *every reference is inside a block PART I FEATURE 4.56 owns*.

## Removal proof

| | |
|---|---|
| Live build (this release present) | **2,546,662 bytes**, `5a47ab73eb955fa03edddf9d16c90a4d9a0c6d90c1e679d0665320f963225ca6` |
| Removed build | **2,533,897 bytes**, `0538c4662e19ba633a3faefb8d1111f1b502f557e7f7b935c7fb53ae6570ab7f` |

Byte-identical to the Feature 4.55 build this release was added to, first attempt. Every retained
suite then reads **612/612** against the removed build.

`qa/test-removal.py` passes **16/16**. Its sibling-survival fixture now carries the whole run —
4.53, 4.54 and 4.55 all sit above this phase's block, and `PART I FEATURE 4.5` is a prefix of all
four markers. It was proven load-bearing by weakening `BEGIN_RE` to a prefix match and confirming
the remover then mangles 4.55's block.

## What this release does NOT claim

- **Not real-device confirmed.** Verified headlessly at 375px only.
- **D05 (Unlucky) is not included.** It is the third entry with no handler, and the only one of
  the three that needs dice-engine integration — a rank-scaled, session-tracked reroll that must
  replace a saved roll's result without re-paying its costs. Left as its own decision.
- **No koku is granted.** The entitlement is a reminder. If actual currency is ever wanted, the
  one-time-grant lifecycle the audit describes has to be designed first; nothing here prejudges it.
- **Perceived Honor changes no roll.** It is a readout for attempts to discern Honor. Nothing in
  the sheet consumes it, by design — the audit asked for the badge, not an effect.
