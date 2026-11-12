# Removing A17 (Release 15a)

A17 is one independently removable unit of group G4.

- **Marker:** `PART H PHASE 15.1.27`. The number is a marker only; the finding keeps its identifier.
- **Tag:** `SF15`.
- **Switch:** `SPLASH_FILL_ENABLED`, inside this unit's script in the splash markup (it must run before the sheet's main script exists).

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/css/1145-splash-fill.css`. Three rules, all waiting for `#l5rSplash.sf15-on`. |
| Manifest | The entry naming that file, right after A10.1's stylesheet. |
| Shared block | `src/markup/10-swipe-tab-shell.html`, block `splash-fill-art`: one inline script inside the splash's `<picture>`, after the landscape picture's source and before its `img`. It moves that source's `media` from `(min-aspect-ratio: 4/3)` to `(min-aspect-ratio: 3/2)`, sets `window.SF15` and the `sf15-on` class on the splash. The block sits inside the splash layer's `splash-design` block; its END line hands the lines after it back to that layer (`// PART F PHASE 0.6.2 (continued)`). |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `splash-fill-seam` (a guarded `Object.assign` of `window.SF15`), right after A10.1's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A10.1's (present while its stylesheet exists). |

It adds no save field, no listener and no lasting element: the splash's own script removes the splash, this script with it, when it leaves. It changes no character data.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its blocks, and a missing block. It accepts `<!-- -->` marker comments, as the splash layer's own remover does.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A10.1: 17,645,385 bytes, SHA-256 `3e58e368606f7d8ffe66f674778f922b73c0798109334ad89e1efc2a15fa6258`. `qa/test-removal.py` proves that, then that A10.1 removed next gives A10 exactly, and that A10.1 can be removed with this unit kept. Removing all four G4 units gives G3 as live exactly (`G4 — Touch, Focus and Startup/qa/test-removal-group.py`).

**Switching it off instead:** set `SPLASH_FILL_ENABLED = false` in the markup block. The splash is exactly as before (shown whole, the landscape picture from 4 : 3).

## Dependencies

- **Phase 0.6.2 (Part F), the splash screen — this unit's block sits inside its design block.** It needs the splash's `#l5rSplash`, its `<picture>` with the landscape `<source>` right before the `img`, and the splash's own leaving, which removes this script with the splash. While this unit is present, that layer's remover refuses: remove this unit first (the removal chain does so in order). Declared in that layer's ROLLBACK.md.
- **Declared conditional fixture (both ways, same id and count):** that layer's harness check `S-ART-BY-SHAPE` expects `cover` when this unit's splash fill is present (`window.SF15.installed`) and `contain` otherwise. With this unit removed, the harness file keeps the conditional and passes with `contain`.
- **A09, A10, A10.1 — none either way.**
- **Nothing depends on this unit.**
