# Rollback

Quickest: set `WIZARD_SKILL_REMOVE_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `remove-seam` seam block, then the rebuild is exactly `935742fd74a55cf60c3e685d5d9790d135feb7351d2b133c6455069624fd3338`, 17,372,358 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.
