# Rollback

Quickest: set `INSTIGATOR_BLACKMAIL_ENABLED = false` and rebuild; the Instigator then needs one Blackmail and both confirmations, as before.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). It removes this layer's fragment, its manifest entry and the `blackmail-seam` block; the rebuild is then exactly `389ef613f98b127ea8e860cf8620b43d6c338ee503d0b2cfd359396d972e7595`, 17,403,392 bytes.
