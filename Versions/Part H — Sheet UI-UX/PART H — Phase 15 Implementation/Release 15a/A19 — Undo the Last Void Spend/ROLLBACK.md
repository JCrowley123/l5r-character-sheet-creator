# Removing A19 (Release 15a)

A19 is one independently removable unit of group G6 (new functions).

- **Marker:** `PART H PHASE 15.1.33`. The number is a marker only; the unit keeps its identifier. (`15.1.32` was used by the withdrawn A12 on its own branch and is not reused.)
- **Tag:** `VU15`.
- **Switch:** `VOID_SPEND_UNDO_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999999-feat-void-spend-undo.js`. Holds `VU15` and the switch. Adds a capture-phase and a bubble-phase click listener to the Void card's button holder (`#voidSpendButtons`) and to the damage row (`#voidDamageRow`), capture-phase listeners on Next Round and Reset, and observers on the roll preview (`#rollPreviewOverlay`) and the roll result window (`#rollModalOverlay`). Wraps `renderVoidPanel`, `renderVoidPips`, `applyData` and `resetToBaseline` by reassignment, each passing straight through to the layer it wraps (the precedent of Features 4.5.33, 4.5.36, the Void reasons fix and the Disadvantage gates). Writes values only on Undo: the Void Points, the armed one-roll effects, the skirmish Initiative flag, the Wounds, the current Round's `void` and `voidTN` entries (through `getRoundLedger` and `saveRoundLedger`), and Touch of the Void's owed count (`VI4533.owed`); then redraws through the sheet's own `renderVoidPips`, `renderCombatRoundUI`, `recalcAll`, `renderVoidPanel` and `setStatus`. |
| Stylesheet | `src/css/1147-void-spend-undo.css`, the line's look (`.vu15-*`). |
| Manifest | The two entries naming those files: the stylesheet right after AE3's (`1146`), the script right after A08's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `void-spend-undo-seam` (a guarded `Object.assign`), right after A08's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A08's. |

It adds no save field and no storage key, and writes nothing that is saved except the values a Void card spend itself changed (the Void Points, the Wounds), put back as they were.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A08 (G5 as live): 17,685,928 bytes, SHA-256 `6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1`. `qa/test-removal.py` proves that, then that A08 removed next gives AE3 exactly, and that A08 can be removed with this unit kept.

**Switching it off instead:** set `VOID_SPEND_UNDO_ENABLED = false`. Nothing is wrapped, no listener is added and no line is drawn: the Void card is as before.

## Dependencies

- **The Void card (Part C Feature 4: `spendVoid`, `#voidSpendButtons`) — hard.** Without it the unit does not install.
- **Touch of the Void (Feature 4.5.33, `VI4533`) — soft.** Only for dropping a waiting Willpower roll and saying so.
- **Hotei's Curse (Feature 4.5.36, `HOTEI4536`) — soft.** Its two-point card button is covered when present; its label is read for the line.
- **The Void card's reasons (BUGFIX VOIDWHY) — soft.** The line sits after its box when present, after the buttons otherwise.
- **The round tracker (Part C P1) — soft.** Only for putting the Round's Void entries back.
- **The roll preview (Part G Phase 3) and the roll result window — soft.** Read only: a preview being open, and a roll being made.
- **A08 and every other 15a unit — none.** Nothing depends on this unit.
