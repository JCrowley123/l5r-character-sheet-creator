# Rollback

Quickest: set `ANCESTOR_GIFTS_ENABLED = false` and rebuild; the sheet then behaves as before this layer.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live tree). Later releases come off first through `QA — Removal Chain Registry/removal_chain.py` (`strip_later`). It removes this layer's fragments, their manifest entries and the `gifts-seam` seam block, then the rebuild is exactly `a465b6c915c86867bfe76a68546adf1dac56532c2701db4047ad4b9ef0f8da00`, 17,376,589 bytes.

The surface check skips base64 neighbours (`+` and `/`): the PDF font fragment's data holds short tags such as AG7 and AP7 between them.

## Release 15b B18 — one name per button job (26 November 2026)

**A later unit now reads this release.** Release 15b B18 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B18 — One Name per Button Job/`) changes `AG7.USED_NOTE` when it installs, from "… ready again after Reset session on the Ancestor card …" to "… ready again after Reset on the Ancestor card …", to match the card's button. Its words and spoken names are the ones the owner approved on B18's board (25 November 2026); what this release does is unchanged. This release's remover finds `AG7` in B18's script, so it refuses while B18 is present: **remove B18 first**; the removal chain does this in order.

**Declared fixture correction.** `qa/ancestor-gifts-harness.js` follows B18: while `BN15` is on the seam, `AG-USED-LABEL` expects the note with "after Reset" (its expected value is now `[true, true]`; the second is a comparison with the note for the build). It keeps its ids and count, and with B18 removed every line runs as before.
