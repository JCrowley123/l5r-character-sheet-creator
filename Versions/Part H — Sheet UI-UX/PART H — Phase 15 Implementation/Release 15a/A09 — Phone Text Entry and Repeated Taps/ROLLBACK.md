# Removing A09 (Release 15a)

A09 is one independently removable unit of group G4.

- **Marker:** `PART H PHASE 15.1.24`. The number is a marker only; the finding keeps its identifier.
- **Tag:** `TX15`.
- **Switch:** `PHONE_TEXT_ENTRY_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999992-feat-phone-text-entry.js`. Holds `TX15` and the switch. Sets the `tx15-on` body class. Nothing else. |
| Fragment | `src/css/1142-phone-text-entry.css`. Two rules inside one phone-and-touch media query; both wait for `body.tx15-on`. |
| Manifest | The two entries naming those files, each right after 8b.1-UI-03's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `phone-text-entry-seam` (a guarded `Object.assign`), right after 8b.1-UI-03's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after 8b.1-UI-03's. |

It adds no save field, no element and no listener, and changes no character data.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly G3 as live (8b.1-UI-03): 17,631,957 bytes, SHA-256 `6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029`. `qa/test-removal.py` proves that, then that 8b.1-UI-03 removed next gives 8b.1-UI-02 exactly, and that 8b.1-UI-03 can be removed with this unit kept.

**Switching it off instead:** set `PHONE_TEXT_ENTRY_ENABLED = false`. The sheet is exactly as before.

## Dependencies

- **The trunk.** The editable boxes and buttons themselves, wherever they are drawn. The rules name no other layer's class. The five Ring boxes are left alone by their ids (`ring_*`), which the trunk owns.
- **Phase 15 units — none either way.** No other unit names this one, and this one names none.
- **Nothing depends on this unit.**
