# Rollback

Quickest: set `GENDER_IDENTITY_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `gender-seam` seam block, then the rebuild is exactly `164eff79bd1ba6b640fb16ce45778dc2d7cac9a18104966e9329f99961b1eed5`, 17,361,223 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.
