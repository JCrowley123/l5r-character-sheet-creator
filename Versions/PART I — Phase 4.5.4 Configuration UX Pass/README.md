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

## Real-device correction, 16 September 2026 — this phase shipped with three real bugs

The project owner tested the first cut on their iPhone 16e and reported it back the same day.
All three are worth recording in full, because measurement caught the geometry problem this
project's history says headless testing tends to miss, and because the false premise below is a
lesson about verifying a claim rather than just the fix that follows from it.

**1. "Simply unreadable" was wrong, and I hadn't checked.** Phase 4.5.2 already builds a native
`<details><summary>Rule</summary>{opt.note}</details>` disclosure on every tenet option, with no
JS and no hover dependency — a real, working, tap-to-expand affordance that predates this phase
entirely (`209.85-feat-disadv-config.js:277`). The `title=` attributes this phase decorates sit
on the very same element. So the content was never actually unreachable; this phase's own button
was the *second* way to reach it, and having both was reported back as confusing, not helpful.
I had grepped for `[title]` and concluded "no hover, therefore unreachable" without checking
whether some other affordance already existed alongside it. It did.

**2. That same disclosure's hidden text was leaking into the button's heading.** `textContent`
traverses a closed `<details>` exactly as it does visible text, so a Consumed tenet card's own
label came out as `"Determination — 6 XPRuleYou cannot spend Void Points to enhance…"` — the
visible label, the disclosure's own "Rule" summary text, and the start of its hidden body, all
concatenated with no separator. That string became the modal's title, which is why it rendered
as an ugly multi-line wrap in the screenshot: the title was not being cut off oddly, it was
correctly rendering an incorrectly-computed 60+ character run-on string.

**3. `overflow-wrap:anywhere` did not just permit breaking as a last resort.** Per spec it also
changes a flex item's *automatic minimum size* calculation to stop honouring intact words, so
several option cards were sized smaller than their own label needed and then split mid-word —
"KNOWLEDGE" as `KNOWLEDG/E`, "PERFECTION" as `PERFECTIO/N` — for words that fit their box fine on
their own. `overflow-wrap:break-word` gives the same last-resort wrapping without touching that
calculation, and was verified live in the browser (via `Range.getClientRects()` on each tenet
name specifically, not just a visual read of a screenshot) before it went into any file.

One case remained even under `break-word`: **"Determination"**, the longest tenet name across
both `tenetPick` entries, renders **137px wide** once this label's actual computed styles are
applied — `text-transform:uppercase` plus `+1.32px` of letter-spacing per character gap, neither
of which an isolated off-screen probe using plain lowercase text without those styles would have
caught, and didn't, the first time. Against the 106px available that is a genuine "does not fit,"
not a sizing bug, so the fix there is a small, precisely-scoped width increase
(`#advConfigGrid .d45-option.affinity-pick-item{max-width:200px}`) rather than another wrapping
property. Verified live at 200px: all fourteen tenet names across both entries render with zero
splits and zero overflow.

**The fix for finding 1** is `api.hideSupersededDisclosure()`: the `<details>` is hidden
(`.hidden = true`), never removed, wherever this phase's own button is added to the same card —
declared as a dependency on Phase 4.5.2's `.d45-tooltip` in this phase's `ROLLBACK.md`, since it
is now a class this phase reads as well as one it styles.

**The fix for finding 2** is `api.labelTextFor()`: a clone of the element with `.d45-tooltip`
(and any `.adv-config-info` button already present) removed before anything reads its text. Used
for both the heading capture and the existing `isExplanatory()` check, so both read the same
clean label.

Seven new checks (`UX454-SUPERSEDE-01` through `-04`, `UX454-NOSPLIT-01` through `-03`) were
added rather than assumed sufficient by inspection, and were run against a reverted scratch copy
carrying the original three bugs before being trusted: all four reproduced the exact reported
symptoms, including the literal `"Explain: Determination — 6 XPRuleYou cannot spend Void
Points…"` string from the screenshot.

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
| Feature 4.54 UX pass | **28/28** |
| Every retained suite plus Feature 4.53 | **543/543** |
| **Combined** | **571/571** |

The own-suite count grew from 21 to 28 in the 16 September correction: seven new checks
(`UX454-SUPERSEDE-01..04`, `UX454-NOSPLIT-01..03`) cover the disclosure-hiding, clean-heading and
no-mid-word-split behaviour added by that fix — see "Real-device correction" above.

### The harness was made to fail — twice, because this phase has two halves

A single broken build would not have proved both. So both were built, against the corrected
source, after the correction:

| Build | Result | What failed |
|---|---:|---|
| Kill-switch `false` (JS half off) | **15/26** | Every info-button, wording, contract and heading check. The CSS half still passes, correctly — it is a separate file, so geometry and no-split hold regardless. |
| `58-adv-config-ux.css` dropped from the manifest | **25/28** | Exactly the three geometry checks, reproducing the original defects: Consumed over by 19px and 31px, the preview label back to 3 lines at 54px. |

The kill-switch run collapses two section-level failures (the `RULES` and `SUPERSEDE` sections
each throw once the buttons never exist to interact with) into single failure records rather than
one check apiece, which is why the denominator reads 26 rather than 28. That is honest rather
than tidy: the run still goes red for the right reason, and every geometry and no-split check is
measured independently of the kill-switch, in the second build above.

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
| Live build (this release present, post-correction) | **2,515,226 bytes**, `77150cec33d5c72c015a8a59cac3f72dc0cb48f94ebc4fb65cb66c4f9b63d0bc` |
| Removed build | **2,495,934 bytes**, `18a740e8aeb334dac6a0405ec98c79edc6a450d5a09c8b7cfd715273f7b7b8c0` |

That second hash is **byte-identical** to the pre-release build — unchanged by the 16 September
correction, since the correction only edited lines already inside this phase's own marked block
and its own two files. Every retained suite then reads **543/543** against the removed build, and
the rolled-back tree passes `recombine.py --verify`.

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

- **The correction itself is not yet real-device confirmed.** The first cut was verified only
  headlessly at 375px, shipped, and real-device testing on an iPhone 16e is exactly what caught
  all three bugs the same day — proving this project's standing point that headless measurement
  at a fixed viewport misses things a real device does not. The fix for those three bugs has, in
  turn, only been re-verified headlessly so far (both by the harness and by the live-browser
  probes used to design each fix before it was written). It has not yet been looked at on the
  phone that found the originals.
- **No copy shortening.** Deferred on the project owner's call; recorded in the audit as open.
- **The row summary wording is corrected on the painted node**, not at its source, because
  Phase 4.5.2 exposes no seam there. A future edit to that renderer would need to keep the two
  in step.
- **The superseded-disclosure fix assumes Phase 4.5.2's exact markup shape** — one `.d45-tooltip`
  per `[title]`-carrying option, which is the only pattern that exists in the sheet today
  (confirmed by a full-source grep before writing the fix). A future entry using a different
  shape for the same idea would need its own handling; `api.hideSupersededDisclosure()` finds
  nothing to hide and quietly does nothing in that case, rather than failing loudly.
