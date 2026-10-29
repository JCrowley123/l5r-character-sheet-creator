# Rollback

Quickest: set `SET_RULES_ENABLED = false` and rebuild; the sheet then behaves as before this layer. A saved `f_setRuleOverrides` field is then ignored, never lost.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's three fragments, their manifest entries, the `set-rules-seam` block and the Fortune Blessing module's `fortune-note` block; the rebuild is then exactly `649a0008b84eda58ee0b0c84a12d942b4e1d7add2c35789c53879bd505b8f294`, 17,385,712 bytes (main at `bee8c0b`).

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags between them.
