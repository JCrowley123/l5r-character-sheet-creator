# Removing A06 (Release 15a)

A06 is one independently removable unit of group G2.

- **Marker:** `PART H PHASE 15.1.6`. The remover only matches `15.1.6` when no further digit follows.
- **Tag:** `GA15`.
- **Switch:** `GRANT_ACTIONS_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999994-feat-grant-actions.js`. Holds `GA15` and the switch, which sets the `ga15-on` body class. Nothing else. |
| Fragment | `src/css/1135-grant-actions.css`. The group's layout, the primary fill, the 44 px height, the hover opacity and the generated state text. It matches only `#advList .supp4540-koku` and `#advList .wealth4517-status` while they hold buttons. |
| Manifest | The two entries naming those files, each right after A05's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `grant-actions-seam` (a guarded `Object.assign`), right after A05's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A05's. |

It adds no save field and changes no character data or koku.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A05: 17,591,617 bytes, SHA-256 `dde68b5c366e15be9bf4185726bdaf4fefe92a90f5525f28d5291c1dd57ea726`. Removing A05 next, with its own remover, gives G1 as live exactly (`2dcf6f20…6af6`). `qa/test-removal.py` proves both. It also proves that A05 can be removed with A06 kept.

**Switching it off instead:** set `GRANT_ACTIONS_ENABLED = false`. The body class is not set, and the rows are exactly as before.

## Dependencies

- **Phase 4.5.17 (Part I), Wealthy:** A06 styles `.wealth4517-status` (and its state classes, such as `.wealth4517-excess`) and its buttons. It calls nothing there. That harness passes 87/87 with A06 present.
- **Phase 4.5.40 (Part I), Zakyo Toshi Citizen:** A06 styles `.supp4540-koku` and its buttons. It calls nothing there. That harness passes 21/21 with A06 present.
- **If either phase were removed,** A06's rules for that row would match nothing.
- **Trunk:** `#advList` and the tokens `--ink`, `--paper` and `--ink-soft`.
- **Nothing depends on A06.**
