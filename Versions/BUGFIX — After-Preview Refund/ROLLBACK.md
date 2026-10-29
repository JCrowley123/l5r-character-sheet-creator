# Rollback

Quickest: set `PREVIEW_REFUND_ENABLED = false` and rebuild; then what a roll pays after its preview stays spent when a later question cancels the roll, as before (Dark Paragon's Honor and session use, a Void Point from the preview's Roll button).

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree), after removing the later 7c layers (the removal-chain registry does this). It removes this layer's fragment, its manifest entry, the `refund-seam` block; the rebuild is then exactly `3a4773ee2dcf6f9abb5551d0b2ed712e830fbc13198242b7c8436bc00efaf92f`, 17,422,258 bytes.
