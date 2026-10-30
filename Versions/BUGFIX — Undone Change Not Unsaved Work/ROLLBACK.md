# Rollback

Quickest: set `UNDONE_CHANGE_CLEAN_ENABLED = false` and rebuild. Then, as in Release 7c.1, a change undone on a sheet
not yet saved still leaves the sheet looking changed, and opening another character asks whether to discard it.

Full removal: run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, never the live one (it refuses the live
tree). It removes this layer's fragment (`src/sheet/209.999999999999997-bugfix-undone-change-unsaved.js`), its manifest
entry and the `undone-change-seam` block in `src/sheet/210-test-seam-and-init.js`; the rebuild is then exactly Release
8a with the Wizard Overspend Warns layer only, `e16aa5efdb290d7b972a7ab68e98cd78ef410a3900e9551e2a06e1edec176611`,
17,450,114 bytes. Removing both 8a layers rebuilds main's Release 7c.1 build exactly (`4ee46180…`, 17,444,744 bytes).

## Dependencies

- **On Phase 11 (Part K), the Characters list (`CL11`), and Phase 7.1 (Part J), the audit log (`AL71`):** soft. The layer
  switches itself off when either is absent or the audit log is switched off. It wraps `CL11.confirmDiscard` by
  property and reads `CL11.snapshot()`, `CL11.blank` and the sheet's `currentId`. Nothing in either layer is edited.
- The audit log's README listed this as a known limit; that line now points here.
- **No other layer depends on this one.** No older check changed.
