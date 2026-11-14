# Removing A08 (Release 15a)

A08 is one independently removable unit of group G5 (undo and the roll preview).

- **Marker:** `PART H PHASE 15.1.31`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `QT15`.
- **Switch:** `QUICK_TAP_UNDO_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999998-feat-quick-tap-undo.js`. Holds `QT15` and the switch. Wraps four of CP7's own entry points by property (`CP7.adjust`, `CP7.commit`, `CP7.clear`, `CP7.ce7ExpireUndo`), each passing straight through to the layer it wraps; adds a capture-phase and a bubble-phase listener to the Undo button (`#cp7-undo`), and capture-phase `click`, `input` and `change` listeners on the document that only end an open group. Writes a value only on Undo of a group of two or more taps, through CP7's own route (`RP7.write` and `RP7.changed`, or `TA7.write`). Merges History entries through `AL71.check`, `AL71.entries`, `AL71.restart` and `AL71Logic.entry`, then asks the Characters list for an autosave (`CL11.schedule`). |
| Manifest | The one entry naming that file, right after AE3's fragment. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `quick-tap-undo-seam` (a guarded `Object.assign`), right after AE3's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after AE3's. |

It adds no save field and no storage key. The only saved data it touches is the History (the character's `auditLog`), where the entries of one group become one entry, or none when they cancel out; with the unit removed, later History entries are written one per tap again, and entries already merged stay as they are.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly AE3 (the automatic-entries group as live): 17,675,311 bytes, SHA-256 `99b76d625c04e6aa22ba8508005975525bbece945b82ead8c443b593e58115b8`. `qa/test-removal.py` proves that, then that AE3 removed next gives AE2 exactly, and that AE3 can be removed with this unit kept.

**Switching it off instead:** set `QUICK_TAP_UNDO_ENABLED = false`. Nothing is wrapped and no listener is added: each tap is its own change again.

## Dependencies

- **Phase 7's compact controls (`CP7`) — hard.** Without them (or with them switched off) the unit does not install.
- **Characteristic card editing (`CE7`) — soft.** Its Undo expiry (a save, or 20 seconds) also ends a group; without it there is no expiry to hook.
- **Phase 7.1's audit log (`AL71`) — soft.** Without it there is no History to merge; Undo still takes a group back.
- **The Characters list (`CL11`) — soft.** Only for asking for an autosave after a merge.
- **A09 (phone text entry and repeated taps) — none.** A09 makes − and + answer a quick second tap on a phone; each such tap is a tap here and joins the group. Without A09 a quick second tap may be taken by the phone instead, and nothing reaches the card.
- **Nothing depends on this unit.** A12, the next unit of the group, does not touch these cards.
