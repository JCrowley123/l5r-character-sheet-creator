# Rollback

Quickest: set `CREATION_CAP_ENABLED = false` and rebuild; then the wizard raises to 10 and the validator says nothing of 4, as before.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree), after removing the later 7c layers (the removal-chain registry does this). It removes this layer's fragment, its manifest entry, the `cap-seam` block; the rebuild is then exactly `298b9ee8dd04fdc713f4ad33586a8fab92e211d85481cb27b1f7765c8830d65f`, 17,413,484 bytes.
