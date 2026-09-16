# Phase 4.5.4 — Configuration UX Pass

The UX round the 13 September feedback and the 16 September real-device pass both asked for on
the configured Advantage/Disadvantage surface.

**This phase was scoped from measurements, not from the reports.** Everything below was measured
at 375px against the live build before a line was written, and the measurements moved the scope
substantially in both directions.

## What the measurements changed

| Reported | Measured | Outcome |
|---|---|---|
| "Several modal option cards overflow on narrow screens" | **One case left.** Only Consumed's `Determination — 6 XP` label, 165px of text in a 134px box. Phase 4.5's own `#advConfigGrid` override already handled the rest. | Fixed |
| "Use a consistent circled-i icon wherever a tooltip appears" | **Far bigger than an icon.** The explanations live in `title=` attributes, and `title=` does nothing without hover. 60 of them on the configured entries; ~20 carry real explanatory text, including all seven tenet rules for Consumed and all seven for Failure of Bushido. On a phone those rules were simply unreadable. | Fixed — the bulk of this phase |
| "Roll preview text looks squished" (real-device) | **Confirmed and quantified.** `.rp-mod-label` was 54px wide, wrapping "Friend of the Elements" onto three lines, while the note beside it held 229px. | Fixed |
| "Shorten bulky Disadvantage copy" | **Marginal.** Entries run 76–197 characters; Magic Resistance, named in that feedback as the good example, is 151. Four entries exceed it and none by much. | **Deferred**, on the project owner's call |

The first row is worth keeping: the audit's own text said several cards overflowed, and by the
time this phase looked, one did. Re-measuring before building was what caught that.

## What was built

### The touch-reachable half of every tooltip

`title=` attributes are written by four fragments across three earlier releases. Editing all
sixty in place would rewrite lines this phase does not own, and its removal could not put them
back — the reasoning that made Feature 4.53 a wrapper.

So the affordance is added **generically**: one decorator walks the configured surface, finds
elements carrying an explanatory `title=`, and appends a small button to each. Tapping it opens
the sheet's existing info overlay — the same one stance and wound info already use, per the
roadmap's "no new modal system" — carrying that element's own tooltip text.

Three details that are deliberate, not incidental:

- **The `title=` stays.** Desktop hover behaves exactly as before; this adds a second route to
  the same text rather than replacing the first.
- **The button carries no text node.** Its glyph is a CSS `::after`. Several existing harnesses
  assert on the exact `textContent` of a configured row, and a button contributing an "i" to
  that string would have broken them for a purely cosmetic reason.
- **Short titles are skipped.** A `title` under 20 characters, or one that merely repeats the
  element's visible text, is a control label ("Cancel"), not an explanation. 40 such labels were
  measured and none collected an icon — putting one on every "Cancel" is the clutter this phase
  exists to reduce.

The modal re-renders its body between steps, so a one-shot decoration at open time would miss
every step after the first. A `MutationObserver` on the overlay keeps it correct for paths this
phase does not know about, including any a later release adds. It disconnects around its own
writes, since appending a button inside the observed subtree would otherwise re-enter forever.

### Consumed's option label — and why `white-space` alone was not the fix

The obvious cause was the inherited `white-space:nowrap` from `.affinity-pick-item label`, the
same rule that broke Phase 4.5's tiles. Setting it to `normal` was **measured not to be enough**:
the label still ran 165px inside 134px.

The label is a flex row (checkbox + text) and the text span is a flex item at `min-width:auto`,
which resolves to its **min-content width** — 137px for "Determination", the longest single word
in the tenet list. It refused to shrink into the 106px actually available and pushed the row wide
instead. `min-width:0` is what lets a flex item wrap rather than overflow.

Worth recording because the first fix looked correct and changed nothing measurable.

### The roll preview's modifier row

Label and note shared one flex line with no floor on the label, so a long note starved it.
Stacked at phone width only; every wider layout is untouched. This styles a class Phase 3
(Part G) owns — declared in `ROLLBACK.md`.

### Wording

`XP refund` → `Severity`, and `Rank — 2 XP refunded per rank` → `Rank — 2 XP per rank`, applied
by wrapping Phase 4.5.2's own `steps()` seam rather than rewriting its source. The rendered
summary line is assembled inline in that release's row renderer with no seam to wrap, so
`Status-linked refund:` → `Status-linked value:` and ` Refund: ` → ` Value: ` are corrected on
the painted node instead — exact-string replacements only.

## Validation

```bash
node qa/current-suite-runner.js <path-to-l5r-character-sheet.html>
```

| Suite | Result |
|---|---:|
| Feature 4.54 UX pass | **21/21** |
| Every retained suite plus Feature 4.53 | **543/543** |
| **Combined** | **564/564** |

### The harness was made to fail — twice, because this phase has two halves

A single broken build would not have proved both. So both were built:

| Build | Result | What failed |
|---|---:|---|
| Kill-switch `false` (JS half off) | **10/19** | Every info-button, wording and contract check. The CSS half still passes, correctly — it is a separate file. |
| `58-adv-config-ux.css` dropped from the manifest | **18/21** | Exactly the three geometry checks, reproducing the original defects: Consumed over by 19px and 31px, the preview label back to 3 lines at 54px. |

The kill-switch run reports 19 rather than 21 because the tenet section throws once the buttons
are absent and collapses two checks into one failure. That is honest rather than tidy: the run
still goes red for the right reason, and the geometry half is measured separately above.

### Structural invariants

Unchanged against the removed build: **270 element ids, 0 duplicated**, 10 sections, both test
seams present, tag balance clean. This phase adds no markup and takes no registry seat.

## Removal proof

`qa/remove-phase.py` deletes both files, both manifest entries, and only the block its own
`BEGIN`/`END` delimiters enclose, then repoints `expect_sha256` so the rolled-back tree is
self-consistent. It refuses the live tree, a foreign marker inside its block, an unclosed block,
a mismatched delimiter, an orphan `END`, and a manifest missing **either** half.

`qa/test-removal.py` passes **16/16**, including a fixture proving Feature 4.53's adjacent
`repairs-seam` block survives untouched — a remover matching on a prefix would have eaten it.

| | |
|---|---|
| Live build (this release present) | **2,510,683 bytes**, `b18d164dc82a262b54f3ac33c0e206e11c85ee4663dd7adfd27fd4db0325cc14` |
| Removed build | **2,495,934 bytes**, `18a740e8aeb334dac6a0405ec98c79edc6a450d5a09c8b7cfd715273f7b7b8c0` |

That second hash is **byte-identical** to the pre-release build. Every retained suite then reads
**543/543** against the removed build, and the rolled-back tree passes `recombine.py --verify`.

### The ownership scan caught a real bug in this phase's own comment

`feature-dependencies.py` reported three of this phase's own CSS rules as owned by
`PART G PHASE 3` — a phase that does not own them — which would have handed them to Phase 3's
remover. The cause was this phase's own comment, which opened with that phrase in marker order
to explain whose class it was styling. `MARKER_RE` is case-insensitive, so marker-shaped prose
in a comment parses as a real ownership marker.

This is the **third** time this project has hit that trap (Phase 8, Phase 4.5, now this one), and
the third time review did not catch it and the mechanical check did. Reworded to "Phase 3
(Part G)" — never the other order — it reports clean: *every reference is inside a block
PART I FEATURE 4.54 owns*.

## What this release does NOT claim

- **No real-device testing.** Headless Chromium at 375px. The geometry is measured, not seen —
  and this project's history says that gap is where the bugs live.
- **No copy shortening.** Deferred on the project owner's call; recorded in the audit as open.
- **The row summary wording is corrected on the painted node**, not at its source, because
  Phase 4.5.2 exposes no seam there. A future edit to that renderer would need to keep the two
  in step.
