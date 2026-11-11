# G3 code review (read-only), 11 November 2026

One independent read-only reviewer read the diff from `codex/release-15a-g3-mockups` to `claude/release-15a-ui03` (the three units' six fragments, their seam blocks and manifest entries, and the three harnesses). It ran nothing and edited nothing. It reported **nothing serious**: no path by which any unit changes saved values, rolls, undo, startup or the School-choice records.

## Findings and what was done

| # | Finding | Sureness | Disposition |
|---|---|---|---|
| 1 | UI-01: the dialog clips its overflow and only the groups scroll. If a browser does not shrink that row to the dialog's maximum height, Later and Confirm fall below the edge, and a phone has no Escape key. Only Chromium is measured. | Plausible, low probability, high impact | **Fixed, and on the device checklist.** A second height limit on the groups (`calc(100dvh - 2rem - 13rem)`) keeps the bar on screen without relying on the row shrinking. Check 6 of the device checklist opens the review sideways on the iPhone. |
| 2 | UI-01: the status message was not rendered while empty, so a refusal written into it may not be announced. | Plausible | **Fixed.** It stays rendered and takes no room. |
| 3 | UI-03 (and UI-02's phone range): a gap between `max-width: 768px` and `min-width: 769px`; at a fractional width the larger Remove target applies but nothing clears its corner. | Confirmed in the CSS; plausible in use | **Fixed.** The wide range starts at 768.02 px. |
| 4 | UI-01: Tab reaches Confirm before Later, while the bar draws Later to the left. | Confirmed | **Recorded, not changed.** It is today's focus order. Changing it means moving a button out of its parent, which the unit is built not to do. |
| 5 | UI-01: a heading's text read "Water0 of 3 chosen". | Confirmed | **Fixed.** A space between the name and the count. |
| 6 | UI-02: on a narrow laptop window (about 769–850 px) a two-School tag can drop to a second line. Nothing overlaps. | Plausible, cosmetic | **Recorded, not changed.** |

## Harness gaps

| Gap | Disposition |
|---|---|
| `SR-SLOT-SCHOOL` compared a heading's name with itself. | **Fixed.** It now requires no count and the heading's own text. Same id. |
| No check opens the Skills review to show it stays undressed. | Recorded. By reading, it cannot be dressed (the unit requires the spell tick boxes). A candidate for qualification's negative variants. |
| Web fonts are blocked and only 390 px and 1440 px are measured. | Recorded. The fallback fonts make a name box 3 px shorter, which is the harder case for the Remove corner; the device round covers real fonts. The 768 px boundary is not measured. |
| UI-03's harness names `.sn15-tag`. | Declared in that unit's README: read only if drawn. |
| `SX-PLAY`'s second branch is looser on height than its first. | Recorded. |

## What the reviewer checked and found correct

Unit independence (no G3 unit names another in `src`); marker prose in all six files; guarded seam blocks; each unit inert with its switch off or its host layers absent; the render wrap (by property, `this` and the return value kept, every re-render path reaches it); the dressing class coming off for the ordinary chooser; Confirm and Later staying in their parents; no leaked or doubled listeners; grid rows with one or two instruction lines, with and without the message; the counts agreeing with the older-save layer's own quota check; the tag sweep settling; the recalculation wrap; the tag never saved; label and grant always set and cleared together; print; scope limited to spell rows; Play.

## After the review

The three branches were updated in order without rewriting history: a revision commit on `claude/release-15a-ui01`, then that merged into `-ui02`, then that into `-ui03`, each rebuilt, with each removal proof's predecessor hash refreshed and every light check run again. The units' READMEs give the builds before and after.
