# Rollback

Quickest: set `VOID_RAISE_INITIATIVE_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `void-raise-seam` seam block, then the rebuild is exactly `55f9e9ed601e052f3be617c06da51d795ab8f5932e5213d339ef27d6bd21f389`, 17,349,941 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.
