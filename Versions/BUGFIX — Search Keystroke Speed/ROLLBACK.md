# Remove BUGFIX — Search Keystroke Speed

Set `SEARCH_SPEED_FIX_ENABLED` to `false` and reload. Search then works as before, only slower on filtered keystrokes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999999-bugfix-search-keystroke-speed.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `search-speed-seam` block |

Copy the Phase 0 folder to scratch, remove later releases first (`QA — Removal Chain Registry`), then
`python -B qa/remove-phase.py <scratch>` (add `--expect-sha 79d6dc83412d131be7f8f346228ec32d80e6f6d20947e60d3da7c365b5acad0b`
with no later releases present), rebuild with `build/recombine.py --verify`, and run 14.3a's suite (5,216). Then apply
it to the working branch, delete this release's `CHAIN` entry and this folder. `qa/test-removal.py` checks this.

## Dependencies

- **Search, Phase 14:** required; it wraps `SEARCH14.normalise`. Remove this release before Search.
- **Facets, Phase 14.1:** benefits, does not depend on it.
- The ownership scan lists the seam lines under bare "BUGFIX" (the scanner's known limit; see Layer 1's ROLLBACK).
