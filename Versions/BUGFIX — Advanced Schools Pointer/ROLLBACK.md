# Rollback

Quickest: set `SCHOOL_POINTER_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `pointer-seam` seam block, then the rebuild is exactly `f57674f67b6081e7ab42d3ed4a53f52607fc980bd84c5ac20cf1957bca2cf501`, 17,368,411 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.
