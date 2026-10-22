# Remove PART I — Phase 4.5.40 Supplement Identity and Outfit

Set `SUPPLEMENT_IDENTITY_OUTFIT_ENABLED` (in `src/sheet/209.99999999997-feat-supplement-identity-outfit.js`) to `false` and reload:
Stolen Identity and Ruined City Survivor become plain rows at their book price again; Outfit rows, Missing marks and koku already changed stay as they are; saved records are kept but no longer read.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.99999999997-feat-supplement-identity-outfit.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `identity-outfit-seam` |

The block begins `// PART I PHASE 4.5.40 BEGIN identity-outfit-seam` and ends `// END SUPP4540 identity-outfit-seam`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 6b997ba4a4db87fd9eb3cc1c7e2426b8ea8ee63e35d216cea5fe3cb2fddaca4e`
   (Phase 4.5.39 alone, 7,932,036 bytes).
4. Rebuild with `build/recombine.py --verify` and run Phase 4.5.39's harness. Then apply the same removal to the working
   branch, delete this layer's entry from `CHAIN`, and delete this folder.
