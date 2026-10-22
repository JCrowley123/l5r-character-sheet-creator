# Remove BUGFIX — Printed Emphases Without the Web Fonts

## Surgical removal

| Location | Owned item |
|---|---|
| `src/css/59.9999894-bugfix-printed-emphases-fonts.css` | whole fragment and its `build/manifest.json` entry |
| `BUGFIX — Printed Skills and Equipment Tables/qa/printed-skills-equipment-harness.js` | `fonts-ready-open`, `fonts-ready-paper` (outside the Phase 0 tree: pass a scratch copy with `--fixture`) |

1. Copy the Phase 0 folder, and the printed-tables harness, to a scratch directory (the remover refuses the live files).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --fixture <harness copy> --dry-run`, inspect, then run it without
   `--dry-run`, adding `--expect-sha f1f95e3596b1de3f07bd35aa9e6454747e4687b96763930b41ba81a53e9850ad` (5a with Release
   5a.2's splash, without this fix, 7,887,505 bytes).
4. Rebuild with `build/recombine.py --verify`, run the suite, then apply the same removal to the working branch, delete
   this release's entry from `CHAIN`, and delete this folder.

## Dependencies

- **BUGFIX — Printed Skills and Equipment Tables:** the print layout (`html.pse-enabled`) this rule joins, and the
  harness that holds the two waits.
