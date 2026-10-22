# Remove PART I — Phase 4.5.39 Supplement Skill Pickers

Set `SUPPLEMENT_SKILL_PICKERS_ENABLED` (in `src/sheet/209.99999999996-feat-supplement-skill-pickers.js`) to `false` and reload:
the four entries become plain rows at their book price again; a granted Rank already on a Skill row stays and is charged XP; a saved pick is kept in the save but no longer read.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.99999999996-feat-supplement-skill-pickers.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `skill-pickers-seam` |

The block begins `// PART I PHASE 4.5.39 BEGIN skill-pickers-seam` and ends `// END SUPP4539 skill-pickers-seam`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha bb7c1ab40146accf5db60bbb896666cb6d9db493ce3cff8d7c0f740ba8b959e4`
   (main, 7,910,947 bytes).
4. Rebuild with `build/recombine.py --verify` and run the suite's retained part. Then apply the same removal to the working
   branch, delete this layer's entry from `CHAIN`, and delete this folder.
