# Removing A19.1 (Release 15a)

A19.1 is one independently removable unit of group G6 (new functions).

- **Marker:** `PART H PHASE 15.1.35`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `DR15`.
- **Switch:** `DAMAGE_ROW_FIT_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999992-feat-damage-row-fit.js`. Holds `DR15` and the switch; adds the class `dr15-on` to the page's body when the Void card's damage row exists. |
| Stylesheet | `src/css/1149-damage-row-fit.css`, under `body.dr15-on`: the row may wrap, its buttons keep one line, and at 640 px or less each button takes the row's full width. |
| Manifest | The two entries naming those files: the stylesheet right after A20's (`1148`), the script right after A20's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `damage-row-fit-seam` (a guarded `Object.assign`), right after A20's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A20's. |

It adds no save field and no storage key.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A20 on A19 revision 1: 17,716,268 bytes, SHA-256 `fe8422cd2d6c82d5a2919955979dfacde7bc7cccd27add857485995c8946b75f`. `qa/test-removal.py` proves that, then that A20 removed next gives A19 revision 1 exactly, and that A20 can be removed with this unit kept.

**Switching it off instead:** set `DAMAGE_ROW_FIT_ENABLED = false`. The body class is not set and the row is laid out as before.

## Dependencies

- **The Void card's damage row (Part C Feature 4) — hard, by its ids** (`#voidDamageRow`, `#voidDamageApply`, `#voidDamageCancel`). Without the row the unit does not install.
- **A19 and A20 — none.** Nothing depends on this unit.
