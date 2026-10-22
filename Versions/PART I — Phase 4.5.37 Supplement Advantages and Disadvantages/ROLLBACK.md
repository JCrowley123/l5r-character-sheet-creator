# Remove PART I — Phase 4.5.37 Supplement Advantages and Disadvantages

Set `SUPPLEMENT_ENTRIES_ENABLED` (in `src/sheet/021-lib-supplement-entries.js`) to `false` and reload: the 39 entries
leave the lists and Search, and the Naga and Nezumi category goes. A saved character keeps any such row as typed
(name, cost and text are saved with the row); the price step no longer notes or fixes their Clan prices.

## Surgical removal

Remove **PART I — Phase 4.5.38 Supplement Price Choices** first (it configures six of these entries).

| Location | Owned item |
|---|---|
| `src/sheet/021-lib-supplement-entries.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/209.99999999994-feat-supplement-entries.js` | whole fragment and its manifest entry |
| `src/sheet/040-lib-kata-kiho-spells.js` | `mystical-group` |
| `src/sheet/209.99999991-feat-search-index.js` | `search-entry-source` |
| `src/sheet/210-test-seam-and-init.js` | `supplement-seam` |

Each block begins `// PART I PHASE 4.5.37 BEGIN <slug>` and ends `// END SUPP4537 <slug>`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha f59aaa2f47100b2c407b78e80959a6d83e2d4533322e6ae48424c0c5f0c8ff54`
   (main `b54c13b`, Release 5a.2, 7,887,981 bytes).
4. Rebuild with `build/recombine.py --verify` and run Release 5a's suite. Then apply the same removal to the working
   branch, delete this layer's entry from `CHAIN`, and delete this folder.
