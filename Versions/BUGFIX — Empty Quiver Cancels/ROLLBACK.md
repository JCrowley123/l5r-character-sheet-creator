# Rollback

Quickest: set `EMPTY_QUIVER_CANCEL_ENABLED = false` and rebuild; then an empty quiver's picker offers Roll without an arrow again, as in Release 7c.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree), after removing the later 7c.1 layer (the removal-chain registry does this). It removes this layer's fragment, its manifest entry and the `quiver-cancel-seam` block; the rebuild is then exactly `efca3b66ac738c49a7af5fc43d1ca09e745863b7dd83e3761c3d5cc43272dfc4`, 17,441,230 bytes. The three EQ7 checks named in the README then read as before, since they key on this layer's switch.
