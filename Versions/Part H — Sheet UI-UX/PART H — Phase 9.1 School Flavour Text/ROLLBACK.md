# Remove Phase 9.1 School Flavour Text

Set `SCHOOL_FLAVOUR_ENABLED` to `false` and reload to hide the text in both places. Nothing is stored, so no saved
data changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999996-feat-school-flavour.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/209.99999991-feat-search-index.js` | `search-school-text` |
| `src/sheet/080-identity-build-ui.js` | `school-info-flavour` |
| `src/sheet/210-test-seam-and-init.js` | `school-flavour-seam` |

Each block begins `// PART H PHASE 9.1 BEGIN <slug>` and ends `// END SCHOOLLORE9 <slug>`. The index end line also
carries ` // PART K PHASE 14 (continued)`, which returns ownership to Search; it goes with the line.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha d238026736f65835e6f14c30ace9993d3740828917d709dd10759f815d8d9e71`
   (Phase 14.3b, 3,878,232 bytes).
4. Rebuild with `build/recombine.py --verify` and run Phase 14.3b's suite (5,360). Then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

## Dependencies

- **Search, Phase 14 (Part K):** needed only for the Search display; the preview works without it. Remove this
  release before Search.
- **Phase 9 clan theming, Phase 14.3b:** independent (dependency variants).

## Ownership scan

`qa/feature-dependencies.py` exits 1 for the index END line, which contains `SCHOOLLORE9` and then hands ownership
back to Search. It is comment-only and goes with the block. See `qa/ownership.log`.
