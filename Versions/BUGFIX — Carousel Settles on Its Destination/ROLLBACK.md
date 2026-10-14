# Remove BUGFIX — Carousel Settles on Its Destination

Set `CAROUSEL_DESTINATION_FIX_ENABLED` to `false` (in `src/layer/10-carousel.js`), rebuild and reload. Tab taps then glide
as before: the tab bar follows the pages passed over, and a start-up settle or a resize during the glide can end it on
another page. Nothing is stored.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/layer/10-carousel.js` | six blocks `// BUGFIX CARDEST BEGIN <slug>` … `// END CARDEST <slug>`: `destination-state`, `goto-remember`, `step-release`, `settle-check`, `scroll-hold`, `touch-takeover` |
| `build/manifest.json` | `expect_sha256` only (no fragment entry) |

Copy the Phase 0 folder to scratch, remove later releases first (`QA — Removal Chain Registry`), then
`python -B qa/remove-phase.py <scratch>` (add `--expect-sha d460d6e1ac8d5a2729bc2ea100d41956456a01449bd1df2f9b431f4b45e902b4`
with no later releases present), rebuild with `build/recombine.py --verify`, and run Layer 6's suite (5,240). Then apply
it to the working branch, delete this release's `CHAIN` entry and this folder. `qa/test-removal.py` checks this.

The registry gained a third presence kind for this release (`present_text`: present while the carousel holds this
release's own marker), with the matching one-line change to its test; the originals are in `originals/`. Restoring
them is optional once this release's `CHAIN` entry is gone.

## Dependencies

None either way. The blocks touch only the carousel's own navigation state; Spell Slots Tab on Safari's two blocks in
the same file are separate and unaffected. Harnesses that use `goToTab` + `whenSettled` keep working without the fix,
as before (with the start-up race back).
