# Rollback

Quickest: set `STARTING_SCROLLS_ENABLED = false` and rebuild; then the Spells step has no line on scrolls, as before.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree), after removing the later 7c layers (the removal-chain registry does this). It removes this layer's fragment, its manifest entry, the `scrolls-seam` block and the `decision` block in `src/sheet/209.997-feat-wizard-starting-spells.js`; the rebuild is then exactly `d3c68008eff7321abf438fba71e93a007f5e0afc80f15b37c6cb6ac813009a0f`, 17,420,530 bytes.
