# Empty Quiver Rolls On

**Status, 29 October 2026:** built for Release 7c on branch `release-7c`; not merged. The release's QA folder is `QA — Release 7c 2026-10-29`.

Your ruling R26, as recommended (no book). Before, an empty quiver opened the arrow picker with every arrow disabled, and the only way out cancelled the attack. Now the picker says "You have no arrows: your quiver is empty. You can still roll the attack without one; nothing is spent." and offers **Roll without an arrow**: the attack rolls, no arrow is spent and none is recorded as loosed. Damage uses the bow's arrow type as it does today. Closing the picker still cancels the attack. With arrows in the quiver nothing changes.

## How it is built

One fragment behind one switch, `EMPTY_QUIVER_ENABLED = true`: `src/sheet/209.99999999999999-bugfix-empty-quiver.js`, with `EQ7Logic` (UI-agnostic: whether the quiver is empty, the words) and `EQ7` (opens and decorates the picker; a one-shot pass read by its wrapper on `ammoTrackingActive`, so the attack's own arrow step is skipped for that one attack). Test seam: the `quiver-seam` block. Shared: and the `empty-quiver` block in `src/sheet/100-dice-engine.js` (three lines, inserted after `let arrowChoice = null;`).

Known limits: Feature 6's check C22 asks that the empty picker say "no arrows"; the new message keeps those words, so the check is unchanged.

## Checks

- `qa/quiver-harness.js`: 8/8 on the candidate.
- Pinned negative variants (`qa/variants.json`, committed before the first run): main (baseline) fails exactly 5 pinned checks; disabled 4; pass-ignored 2; no-pass 1; message-kept 1; empty-counts-negative 1. All matched.
- Removal (`qa/test-removal.py`): 6/6. This remover rebuilds `5e028ddd0ea986a0dedd369cf6bcb6b7899b061039e6c276215568e3f602fdf4`, 17,417,440 bytes.
