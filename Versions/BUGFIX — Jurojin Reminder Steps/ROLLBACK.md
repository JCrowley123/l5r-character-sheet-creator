# Rollback

Quickest: set `JUROJIN_REMINDER_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `jurojin-seam` seam block, then the rebuild is exactly `3c4b290a2acb6daabf89389e44b1437438aa1d5b77107baf44fe5fd32d453fd3`, 17,375,567 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.
