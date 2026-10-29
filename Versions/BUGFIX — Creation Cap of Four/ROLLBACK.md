# Rollback

Quickest: set `CREATION_CAP_ENABLED = false` and rebuild; then the wizard raises to 10 and the validator says nothing of 4, as before.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree), after removing the later 7c layers (the removal-chain registry does this). It removes this layer's fragment, its manifest entry, the `cap-seam` block; the rebuild is then exactly `fb265ae38efea844a5d0fa99117c3425b7fb0d86f545d93ca1abf3a25109db65`, 17,415,354 bytes.
