# Rollback

Quickest: set `MOON_RESIST_LABEL_ENABLED = false` and rebuild; then Lord Moon's Curse's button reads "Willpower roll (TN n)" again, as in Release 7c.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). It removes this layer's fragment, its manifest entry and the `moon-label-seam` block; the rebuild is then exactly `a3d7f6e4c5325f0745e216ab800bab206e5b24f96402ba23d908c0555ce73c3b`, 17,443,333 bytes. The two LM7 checks named in the README then read as before, since they key on this layer's switch.
