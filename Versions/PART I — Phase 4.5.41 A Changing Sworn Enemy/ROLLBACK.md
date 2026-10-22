# Remove PART I — Phase 4.5.41 A Changing Sworn Enemy

Set `SUPPLEMENT_SHIFTING_ENEMY_ENABLED` (in `src/sheet/209.99999999998-feat-supplement-shifting-enemy.js`) to `false` and reload:
Imperial City Stigma and Trials of the Imperial City become plain rows at their book value again; a saved enemy is kept in the save but no longer read.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.99999999998-feat-supplement-shifting-enemy.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `shifting-enemy-seam` |

The block begins `// PART I PHASE 4.5.41 BEGIN shifting-enemy-seam` and ends `// END SUPP4541 shifting-enemy-seam`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 411cc21c106298d5098f18e080f7c00ace0fea9b5ef918c8736ddca02602844f`
   (Phases 4.5.39 and 4.5.40, 7,956,483 bytes).
4. Rebuild with `build/recombine.py --verify` and run Phase 4.5.40's harness. Then apply the same removal to the working
   branch, delete this layer's entry from `CHAIN`, and delete this folder.
