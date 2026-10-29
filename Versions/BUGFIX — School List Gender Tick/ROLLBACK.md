# Rollback

Quickest: set `SCHOOL_LIST_GENDER_ENABLED = false` and rebuild; choosing a School from the list then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragment, its manifest entry and the `list-gender-seam` seam block; the rebuild is then exactly `4ed1738aa87c4004966e847f0eb27d0cca18d91bbb435c4d5652ab1c499c7d34`, 17,382,264 bytes (main after Release 7b.1).
