# Rollback

Quickest: set `HOTEI_AUTOMATIC_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `hotei-seam` seam block, then the rebuild is exactly `7a4d598996dbae3a5a164263e261bd93e9516795214c17bf87a44458b681ef46`, 17,351,774 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.
