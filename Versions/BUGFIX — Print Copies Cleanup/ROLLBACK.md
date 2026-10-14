# Remove BUGFIX — Print Copies Cleanup

Set `PRINT_COPIES_FIX_ENABLED` to `false` and reload. Printing then behaves as before.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999991-bugfix-print-copies-cleanup.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `print-copies-seam` block |

Copy the Phase 0 folder to scratch, remove later releases first (`QA — Removal Chain Registry`), then
`python -B qa/remove-phase.py <scratch>` (add `--expect-sha d9b4c7450ff5a33948b03d9a87a79ab62441b07ad647f97ddaec714d101bea8b`
with no later releases present), rebuild with `build/recombine.py --verify`, and run Layer 4's suite (5,223). Then apply
it to the working branch, delete this release's `CHAIN` entry and this folder. `qa/test-removal.py` checks this.

## Dependencies

- **Export to PDF, Phase 11.1:** required; it cleans up after that release's print copies and does nothing when
  Export to PDF is off or absent. Remove this release before Export to PDF.
- The ownership scan lists the seam lines under bare "BUGFIX" (the scanner's known limit; see Layer 1's ROLLBACK).
