# Remove BUGFIX — Screen Focus from the App Bar

Set `SCREEN_FOCUS_FIX_ENABLED` to `false` and reload. Focus then stays on the app bar after it opens a screen, as
before. Nothing is stored.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999992-bugfix-screen-focus.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `screen-focus-seam` block |

Copy the Phase 0 folder to scratch, remove later releases first (`QA — Removal Chain Registry`), then
`python -B qa/remove-phase.py <scratch>` (add `--expect-sha 35416333eaaf38d60cdd2fe8b2b6ca39a02d2471021599ee8e9217717e2fdad1`
with no later releases present), rebuild with `build/recombine.py --verify`, and run Layer 5's suite (5,229). Then apply
it to the working branch, delete this release's `CHAIN` entry and this folder. `qa/test-removal.py` checks this.

## Dependencies (declared in each phase's own ROLLBACK)

- **Characters screen, Phase 11:** required; it wraps `CL11.open` and reads `CL11.view`. Remove this fix first.
- **Search, Phase 14:** it wraps `SEARCHPAGE14.open` when Search's page is on. Remove this fix first.
- **App bar, Phase 11.3:** read through `APPBAR113.element()`, guarded; with the bar gone the fix does nothing.
- The ownership scan lists the seam lines under bare "BUGFIX" (the scanner's known limit; see Layer 1's ROLLBACK).
