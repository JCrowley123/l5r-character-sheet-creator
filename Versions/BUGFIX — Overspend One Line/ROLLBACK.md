# Rollback

Quickest: set `OVERSPEND_ONE_LINE_ENABLED = false` and rebuild. The wizard then warns as in Release 8a: an amber box on
each step that showed the red "Overspent by" line, and a box at the top of Review.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live
tree). Remove `BUGFIX — Free Choice Note Clears` first if it is present (the removal chain does this). It removes this
layer's fragment (`src/sheet/209.999999999999998-bugfix-overspend-one-line.js`), its manifest entry and the
`one-line-seam` block in `src/sheet/210-test-seam-and-init.js`; the rebuild is then exactly Release 8a's build,
`2a9f66ed444f50b001ef0b670ea71cb370fc65fc24146ddf9cd1a7ce1f4a2084`, 17,452,358 bytes.

## Dependencies

- **On Release 8a's Wizard Overspend Warns (`XW8`):** hard in the sense that without it there is nothing to quieten; the
  layer switches itself off (`OL8.enabled()` is false) when XW8 is absent or off. It wraps `XW8.decorate` by property and
  reads `XW8.overspent()`, `XW8.amounts()` and `XW8Logic.stepText`.
- **On Phase 11.2 (Part K), the creation wizard (`CW112`):** wraps `CW112.refreshNav` by property; reads `CW112.state`
  (new at each start), `CW112.steps`, `CW112.index`, `#cw112Next` and `#cw112Reason`. Nothing in the wizard's own files
  is edited.
- **11.2.2's nudge** writes the same line inside its own `refreshNav` wrapper, which runs first; this layer writes only
  when the line is empty.
- **No other layer depends on this one.**

## Older checks changed (declared)

Four checks in `BUGFIX — Wizard Overspend Warns/qa/overspend-warns-harness.js` expect the new behaviour only while this
switch is on, exactly as before otherwise (count unchanged, 17):

- **XW-TRAITS-NEXT-OPEN**: the line above the buttons is the warning, not empty.
- **XW-TRAITS-WARNING**: no box (the red line still gone).
- **XW-EVERY-STEP-OPEN**: no box on Skills or on Advantages (the red line still gone).
- **XW-REVIEW-WARNING**: no box at the top of Review.

With this switch off, XW8's own 9 pinned variants match exactly as in 8a (`qa/xw8-variants-ol8-off.py`). Phase 11.2's
CW-OVERSPEND-BLOCKS and CW-REVIEW-FINDINGS and Phase 11.2.1's CW1-OVERSPEND-BLOCKS pass unchanged (they read "Overspent
by" in the line, which the warning is not, and compare Review's list with the character check).
