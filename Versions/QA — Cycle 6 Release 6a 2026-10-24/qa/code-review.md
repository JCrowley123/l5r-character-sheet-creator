# Release 6a — code review (24 October 2026)

One read-only reviewer (the owner's rule of 14 October), after the five layers passed their own checks and before the
full suite. About 119,000 tokens, 27 tool calls, 4 minutes.

**Two real bugs, both in FT-38 (Void Card Reasons on a Phone), both display only. Both verified in the source and fixed.**

1. **The reasons went stale after a tap on a Void pip.** Hotei's Curse's layer (Feature 4.5.36) redraws its button from
   `renderVoidPips()` as well as from `renderVoidPanel()`; a pip tap, a spent point and the start of every recalc call
   the first only. In combat with 2 Void Points, one tap left Hotei's button greyed with no reason under it. Fixed: the
   reasons are redrawn with the pips too. Check `VWY-AFTER-PIP-TAP`, variant `pips-not-hooked`.
2. **Momoku's reason showed twice**, above the buttons (the card's own line) and below them. Fixed: a reason equal to
   the card's own line is skipped. Check `VWY-MOMOKU-NOT-REPEATED`, variant `blanket-repeated`.

**Checked and sound:** FT-44's Cancel timing against 5a's replayed click, its latch (no unrelated Cancel can restore the
pickers), `currentId`'s scope; no TDZ or ReferenceError with an earlier fragment removed (every dependency is a `var`
or an earlier `const`); FT-45's wrapper; FT-21 resets after the card is shown, the async wrapper notwithstanding;
FT-23's two wrappers take effect; FT-38's box survives the buttons' rebuild; nothing can throw inside `recalcAll`; the
seam blocks, manifest entries and removers, and no marker-shaped prose in the new files.
