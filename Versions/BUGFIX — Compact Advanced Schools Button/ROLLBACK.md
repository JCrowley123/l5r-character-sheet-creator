# Rollback

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's stylesheet and its manifest entry; the rebuild is then exactly `99a4d7d249443244b44cada2b63c40f6edbf330e7ce374346952c35e1e79b8e0`, 17,385,361 bytes.
