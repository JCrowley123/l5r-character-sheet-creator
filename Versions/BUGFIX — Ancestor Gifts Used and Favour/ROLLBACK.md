# Rollback

Quickest: set `ANCESTOR_GIFTS_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `gifts-seam` seam block, then the rebuild is exactly `a465b6c915c86867bfe76a68546adf1dac56532c2701db4047ad4b9ef0f8da00`, 17,376,589 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.
