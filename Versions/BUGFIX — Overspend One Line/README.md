# Overspend One Line

**Status, 30 October 2026:** built for Release 8a.1 on branch `claude/release-8a1-quieter-overspend`; not merged. The
release's QA folder is `QA — Release 8a.1 2026-10-30`.

Your ruling of 30 October (from the Release 8a device checks, with your screenshots): Release 8a's overspend warning was
too loud. It showed an amber box on every wizard step after the overspend, and on Review a box at the top as well as the
sheet's own "Overspent by N XP …" item in the findings list.

With the switch on:

- **One line, on the step where the overspend first appears.** Above the buttons, in the place and style of "Some of
  your School's choices are still open.": "You have spent N XP more than you have. You can go on: a Disadvantage gives
  experience back." No box, and nothing on any other step. The step's old red "Overspent by" line stays gone. Next
  still works.
- **Review:** the top box goes. The findings list keeps the sheet's own "Overspent by N XP. Spent … of … awarded. …"
  item, marked as a warning (as in 8a).
- **Finish still asks once** (unchanged, Release 8a's layer). Every other reason still blocks Next, as in 8a.

With the switch off, Release 8a's boxes come back exactly.

## Choices declared

- **"First appears":** the step the player is on when the character check's `xp-overspend` first turns up in this wizard
  run (worked out each time the wizard refreshes its buttons). The line shows on that step while the character is still
  overspent, including when the player comes back to it. If the overspend clears, the step is forgotten; if it comes back
  on another step, that step takes the line. A step that leaves the wizard (Kiho, Spells, with a change of School) is
  forgotten too, and the step the player is on takes the line. A new run of the wizard starts with no step.
- **Precedence:** one line only. Where 11.2.2's nudge ("Some of your School's choices are still open." with "Leave for
  later") applies, the nudge wins; any reason that blocks Next wins as well (its own words, Next blocked).
- **Review never takes the line**, and is never remembered as the step, even in the rare case the overspend first turns
  up there: its findings list already says it, and Finish asks.

## How it is built

One fragment behind one switch, `OVERSPEND_ONE_LINE_ENABLED = true`:
`src/sheet/209.999999999999998-bugfix-overspend-one-line.js`, with `OL8`. It wraps `XW8.decorate` (which XW8's own render
wrapper calls by property) to remove XW8's box after XW8 has taken the red line away and marked Review's item as a
warning, and `CW112.refreshNav` (outermost, after 11.2.2's nudge and XW8) to write the line into `#cw112Reason` when
nothing else is there and Next is open. XW8's fragment is untouched. It switches itself off when XW8 is absent or off.
Test seam: the `one-line-seam` block in `src/sheet/210-test-seam-and-init.js`.

## Checks

- `qa/one-line-harness.js`: 12 checks (11, and 1 from the review). The Isawa Shugenja walk overspent on Rings & Traits (the line; another reason
  still blocks with its own words), cleared there, overspent again on Skills (Skills takes the line; the nudge wins
  there), back on Rings & Traits (nothing), on through every later step (nothing), Review (no box, the sheet's item
  kept as a warning), a step that left the wizard giving the line up (the review's finding 1), and Finish (asks
  once).
- Pinned variants (`qa/variants.json`, committed before the first run): main (8a, the baseline) and the switch off fail
  the same 7; no-box 6; no-line 3; no-clear 3; nudge-loses 1; every-step 3; no-stale-reset 1 (from the review). The
  no-clear pin gained OL-CLEARS after the second pass (`QA — Release 8a.1 2026-10-30/qa/own-2/`) stopped there: without
  the clear, Rings & Traits keeps the step after the overspend is gone and shows the line with nothing overspent. Three pins were corrected after the first
  run stopped at the baseline: on 8a, Rings & Traits shows XW8's box again when the player comes back to it, so
  OL-FIRST-STEP-FREED fails there too (and with the switch off, and with no-box). OL-NOT-LATER's first form wrongly
  expected nothing at all on the later steps; the Spells step's own nudge speaks there. It now accepts the nudge's words
  or nothing, never the overspend line, and reports any other state with its step; after the review (finding 4) the
  nudge's words count only with the nudge's own button, "Leave for later ›".
- XW8's own 9 variants with this switch off (`qa/xw8-variants-ol8-off.py`).
- Removal (`qa/test-removal.py`): after the Free Choice Note layer, removing this one rebuilds 8a's build exactly,
  `2a9f66ed…`, 17,452,358 bytes.

## Older checks changed

See ROLLBACK, "Older checks changed": four checks in the Wizard Overspend Warns harness expect the new behaviour only
while this switch is on.
