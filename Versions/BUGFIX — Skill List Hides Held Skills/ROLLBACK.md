# Rollback

Quickest: set `SKILL_LIST_HIDES_HELD_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `skill-list-seam` seam block, then the rebuild is exactly `3002e51e60536c162dd482a0301c12d5d6476088cc7b94c085e11acfb24903db`, 17,357,718 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.
