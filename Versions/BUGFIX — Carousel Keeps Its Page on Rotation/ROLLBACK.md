# Remove BUGFIX — Carousel Keeps Its Page on Rotation

Set `CAROUSEL_ROTATION_FIX_ENABLED` to `false` (in `src/layer/10-carousel.js`), rebuild and reload. Turning an iPhone
from landscape back to portrait on Techniques or a later page then jumps to Clan & School again. Nothing is stored.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/layer/10-carousel.js` | four blocks `// BUGFIX CARROT BEGIN <slug>` … `// END CARROT <slug>`: `rotation-state`, `rotation-settle`, `rotation-scroll`, `rotation-reflow` |
| `build/manifest.json` | `expect_sha256` only (no fragment entry) |
| `QA — Removal Chain Registry/removal_chain.py` | this release's `CHAIN` entry (the last one) |

Copy the Phase 0 folder to scratch, remove later releases first (`QA — Removal Chain Registry`), then
`python -B qa/remove-phase.py <scratch>` (add `--expect-sha d8e6915c536d834ecc8b134607f6a944b0e27cf09ce5539026c981145a2a556f`
with no later releases present), rebuild with `build/recombine.py --verify`, and run Printed Weapon Columns' suite (5,266). Then apply
it to the working branch, delete this release's `CHAIN` entry and this folder. `qa/test-removal.py` checks this.

## Dependencies

None either way. The blocks read and write only their own `laidWidth` and call the carousel's own `ready`, `pageWidth`,
`jumpToSlot` and `currentSlot`. They sit next to BUGFIX — Carousel Settles on Its Destination's blocks in `onSettle` and
`onScroll` but never read its `navTarget`, so either fix comes out without the other.
