# Remove PART I — Phase 4.5.38 Supplement Price Choices

Set `SUPPLEMENT_CHOICES_ENABLED` (in `src/sheet/209.99999999995-feat-supplement-choices.js`) to `false` and reload:
the six entries become plain rows at their catalogue price again; a saved choice is kept in the save but no longer read.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.99999999995-feat-supplement-choices.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `supplement-choices-seam` |

The block begins `// PART I PHASE 4.5.38 BEGIN supplement-choices-seam` and ends `// END SUPP4538 supplement-choices-seam`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 171ed7c75b4a5c6d3b133794008064f6d15d42712c4d65349fe68bdbbfb62c52`
   (Phase 4.5.37 alone, 7,906,871 bytes).
4. Rebuild with `build/recombine.py --verify` and run Phase 4.5.37's harness. Then apply the same removal to the working
   branch, delete this layer's entry from `CHAIN`, and delete this folder.
