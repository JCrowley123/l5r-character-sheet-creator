# Rollback

Quickest: set `MOON_CURSE_ENABLED = false` and rebuild; then the row holds its level only, as before: no tick, no moon Void Point, no Willpower roll.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree), after removing the later 7c layers (the removal-chain registry does this). It removes this layer's fragment, its manifest entry, the `moon-seam` block; the rebuild is then exactly `9545f8284f4d9100eda26017389347eb27ae19f96198fba0fb4639dcd0051317`, 17,405,953 bytes.

## Release 15a A07 — the Moon row (7 November 2026)

Release 15a A07 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A07 — The Moon Row/`), under the owner's ruling Q1, restyles this row while `body.mr15-on` is set: a generated "Severity" label before the summary, `.lm7-moon` as a column on the row's edge, `label.lm7-tick` as a 44 px line with a 22 px box in body text, and `.lm7-roll` at 44 px. Stylesheet only: the tick, its wording and state, the roll, the extra Void pip and every rule are unchanged, and it calls nothing here. This fix's harness passes in full with A07 present. A07's stylesheet names `lm7-*` classes, so this fix's remover may refuse while A07 is present: remove A07 first (the removal chain does so in order).
