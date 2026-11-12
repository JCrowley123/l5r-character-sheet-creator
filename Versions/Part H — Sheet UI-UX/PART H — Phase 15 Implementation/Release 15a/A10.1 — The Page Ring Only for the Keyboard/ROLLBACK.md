# Removing A10.1 (Release 15a)

A10.1 is one independently removable unit of group G4.

- **Marker:** `PART H PHASE 15.1.26`. The number is a marker only; the finding keeps its identifier.
- **Tag:** `KR15`.
- **Switch:** `KEYBOARD_PAGE_RING_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999994-feat-keyboard-page-ring.js`. Holds `KR15` and the switch. Sets the `kr15-on` body class, and adds four listeners on the document in the capture phase (keydown; pointerdown, touchstart and mousedown) that set or clear the `kr15-keyboard` body class. |
| Fragment | `src/css/1144-keyboard-page-ring.css`. One rule, waiting for `body.kr15-on`. |
| Manifest | The two entries naming those files, each right after A10's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `keyboard-page-ring-seam` (a guarded `Object.assign`), right after A10's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A10's. |

It adds no save field and no element, moves no focus, and changes no character data.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A10: 17,640,999 bytes, SHA-256 `c872c1b30fdffd3a2c8c5c4043020d1653a81da8912e9eae70a96c62bdc3f16f`. `qa/test-removal.py` proves that, then that A10 removed next gives A09 exactly, and that A10 can be removed with this unit kept.

**Switching it off instead:** set `KEYBOARD_PAGE_RING_ENABLED = false`. The page's ring is exactly as before.

## Dependencies

- **The carousel (Part D) — soft, by class name.** The rule names the carousel's `.car-page` and overrides its `.car-page:focus-visible` outline. Without the carousel there is no such page and the rule never matches.
- **A10 and the other G4 units — none either way.** A10's focused heading has its own no-ring rule; this unit touches pages only.
- **Nothing depends on this unit.**
