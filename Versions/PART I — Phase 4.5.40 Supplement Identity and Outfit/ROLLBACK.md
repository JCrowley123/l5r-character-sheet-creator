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

## Release 15a A06 — grant actions and their state (7 November 2026)

Release 15a A06 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A06 — Grant Actions and Their State/`), under the owner's ruling Q1, restyles `.supp4540-koku` and its buttons while `body.ga15-on` is set: one group with a 10 px gap, 44 px buttons, the first filled as the primary, and the state ("Not recorded yet" / "Not settled yet") drawn as generated text after them. Stylesheet only: it moves, renames and relabels nothing, and calls nothing here. This release's harness passes in full with A06 present. A06's stylesheet names this release's classes, so this release's remover may refuse while A06 is present: remove A06 first (the removal chain does so in order).
