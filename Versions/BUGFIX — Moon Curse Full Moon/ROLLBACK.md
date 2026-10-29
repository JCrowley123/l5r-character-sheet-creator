# Rollback

Quickest: set `MOON_CURSE_ENABLED = false` and rebuild; then the row holds its level only, as before: no tick, no moon Void Point, no Willpower roll.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree), after removing the later 7c layers (the removal-chain registry does this). It removes this layer's fragment, its manifest entry, the `moon-seam` block; the rebuild is then exactly `9545f8284f4d9100eda26017389347eb27ae19f96198fba0fb4639dcd0051317`, 17,405,953 bytes.
