# Gift Cancel Refunds the Spell Slot

**Status, 28 October 2026:** built for Release 7b.1.1 on branch `claude/release-7b1-1-2026-10-28`; not merged. The release's QA folder is `QA — Release 7b.1.1 2026-10-28`.

Device check B2 of Release 7b.1 (Fail on the iPhone and in Edge, 28 October 2026). A Crab with Kuni and Hotei's Curse and 1 Void Point casts Jade Strike, ticks Kuni's gift and presses Roll. "Kuni: Hotei's Curse: this needs 2 Void Points; you have 1. Roll without it?" answered **Cancel roll** (or ✕) cancelled the roll but kept the Earth slot spent. Now the slot comes back, with "Cast cancelled — the Earth slot given back." Roll without it still spends the slot and rolls.

## How it is built

One fragment behind one switch, `GIFT_CANCEL_REFUND_ENABLED = true`. No save state.

- `src/sheet/209.99999999999992-bugfix-gift-cancel-refund.js`
- Test seam: the `gift-refund-seam` block in `src/sheet/210-test-seam-and-init.js`.

Older than 7b.1; R10 only made it easy to reach. The spell-slot refund (`209.992-bugfix-spell-slot-accounting.js`, SSA992) wraps `rollPreviewGate` and stands down once the preview says Roll. The Ancestors (`209.99998-feat-ancestors.js`) wrap `rollPreviewGate` later, so a gift prompt's cancel came after the refund had stood down. This layer wraps `rollPreviewGate` after them all: it notes the payment pending when the gate opens and, when the gate as a whole answers cancel for a roll SSA992 refunds itself (the Casting Roll, or a resistance check made inside the cast), gives that payment back through `SSA992.refund`. `SSA992.refund` is wrapped to remember each payment it has handled, so the preview's own Cancel is refunded once, never twice. A refund that arrives after the character has changed is still dropped by SSA992's own check.

## Checks

- `qa/gift-refund-harness.js`: the cast, the preview and the Kuni dialog are all driven through their real buttons. Uses the 7b.1 Crab test character (`qa/7b1-checks-crab.l5r.json`) with Void Points set to 1.
- The resistance-check half is defensive today: no Ancestor gift is offered on the Willpower check made inside a cast (probed with Ichiro Fureheshu on an Elemental Imbalance cast; Seppun's only price problem, a used session, cannot be ticked since R25). It mirrors SSA992's own refund rule and is checked through the logic alone (GR-SETTLE-RESIST).
- Own checks 8/8 on the candidate, and 8/8 at 4× CPU throttling. On main, GR-ENABLED, GR-CANCEL-ROLL, GR-CANCEL-X and GR-SETTLE-RESIST fail, as pinned.
- Pinned negative variants (`qa/variants.json`, written before the first run; `qa/verify-variants.py`, results in `qa/negative/`): **main (baseline)** and **disabled** fail exactly 4 pinned checks; **no-mark** fails exactly 2 (the preview's own Cancel refunded twice); **spell-only** fails exactly 1; **proceed-ignored** fails exactly 3.
- Removal (`qa/test-removal.py`): 6/6. The later 7b.1.1 layer comes off first; this layer's remover then rebuilds its predecessor exactly.
