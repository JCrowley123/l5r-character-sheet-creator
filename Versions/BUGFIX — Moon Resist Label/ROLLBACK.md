# Rollback

Quickest: set `MOON_RESIST_LABEL_ENABLED = false` and rebuild; then Lord Moon's Curse's button reads "Willpower roll (TN n)" again, as in Release 7c.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). It removes this layer's fragment, its manifest entry and the `moon-label-seam` block; the rebuild is then exactly `a3d7f6e4c5325f0745e216ab800bab206e5b24f96402ba23d908c0555ce73c3b`, 17,443,333 bytes. The two LM7 checks named in the README then read as before, since they key on this layer's switch.

## Release 15a A07 — the Moon row (7 November 2026)

Release 15a A07 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A07 — The Moon Row/`), under the owner's ruling Q1, restyles this row while `body.mr15-on` is set: a generated "Severity" label before the summary, `.lm7-moon` as a column on the row's edge, `label.lm7-tick` as a 44 px line with a 22 px box in body text, and `.lm7-roll` at 44 px. Stylesheet only: the tick, its wording and state, the roll, the extra Void pip and every rule are unchanged, and it calls nothing here. This fix's harness passes in full with A07 present. A07's stylesheet names `lm7-*` classes, so this fix's remover may refuse while A07 is present: remove A07 first (the removal chain does so in order).
