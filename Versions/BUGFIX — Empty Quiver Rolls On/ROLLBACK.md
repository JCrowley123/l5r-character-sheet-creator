# Rollback

Quickest: set `EMPTY_QUIVER_ENABLED = false` and rebuild; then an empty quiver opens the picker with nothing to choose, and closing it cancels the attack, as before.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree), after removing the later 7c layers (the removal-chain registry does this). It removes this layer's fragment, its manifest entry, the `quiver-seam` block and the `empty-quiver` block in `src/sheet/100-dice-engine.js`; the rebuild is then exactly `5e028ddd0ea986a0dedd369cf6bcb6b7899b061039e6c276215568e3f602fdf4`, 17,417,440 bytes.
