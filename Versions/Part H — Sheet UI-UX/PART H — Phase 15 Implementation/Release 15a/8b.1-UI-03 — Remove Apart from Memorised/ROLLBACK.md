# Removing 8b.1-UI-03 (Release 15a)

8b.1-UI-03 is one independently removable unit of group G3.

- **Marker:** `PART H PHASE 15.1.23`. The number is a marker only; the finding keeps its identifier.
- **Tag:** `SX15`.
- **Switch:** `SPELL_REMOVE_CORNER_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999991-feat-spell-remove-corner.js`. Holds `SX15` and the switch. Sets the `sx15-on` body class. Nothing else. |
| Fragment | `src/css/1141-spell-remove-corner.css`. Every rule waits for `body.sx15-on`. Revision 2's four rules (the other cards in `#techList`, `#advList` and `#disadvList`, and their number box) are at its end. |
| Manifest | The two entries naming those files, each right after 8b.1-UI-02's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `spell-remove-corner-seam` (a guarded `Object.assign`), right after 8b.1-UI-02's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after 8b.1-UI-02's. |

It adds no save field, no element and no listener, and changes no character data.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly 8b.1-UI-02: 17,626,337 bytes, SHA-256 `4f121ab46b9654219b589dfdde71cf8989f00ff1a92ea5f152151e53539569ca`. Removing 8b.1-UI-02 next gives 8b.1-UI-01 exactly (`390f3cd1…f19c`), and 8b.1-UI-01 after that gives live G2 exactly (`77936023…82f0`). `qa/test-removal.py` proves the first two steps, and that 8b.1-UI-02 can be removed with this unit kept.

**Switching it off instead:** set `SPELL_REMOVE_CORNER_ENABLED = false`. The rows are exactly as before.

## Dependencies

- **Phase 12 (Part K), Play and Management modes — soft, by class name.** This unit's stylesheet names that phase's `pm12-play` body class to give the corner back in Play. It calls nothing. Without that phase there is no Play mode and the rules never match. That phase's remover may refuse while a later layer names its class: remove this unit first (the removal chain does so in order).
- **The trunk.** Every card's own `.rm-btn`, `.entry-top`, `.en-name` and `.en-cost` from `makeEntry`, and the base `.entry .entry-top input[type=number]` width it narrows.
- **8b.1-UI-02 — none either way, with one declared conditional fixture.** Neither names the other. Up to 768 px both let the row's line wrap and both give the name the first line; the few declarations are duplicated so that either can be removed alone. **Declared conditional fixture:** 8b.1-UI-02's harness check `SN-CLASS-OFF-PHONE` expects the line to wrap with that unit's class off when `window.__L5R_TEST__.SX15` is present, and not to wrap otherwise (same id and count). It passes 28/28 both ways.
- **Nothing depends on this unit.**
