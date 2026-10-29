# Rollback

Quickest: set `GIFT_CANCEL_REFUND_ENABLED = false` and rebuild; a gift prompt's cancel then keeps the slot spent, as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragment, its manifest entry and the `gift-refund-seam` seam block; the rebuild is then exactly `b209dd55bedb204be3ee30aa60042fef5a4d1d085a72fcc1b62a09e83953f2f3`, 17,383,417 bytes.
