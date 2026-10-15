# Remove BUGFIX — Printed Skills and Equipment Tables

Set `PRINTED_SKILLS_EQUIPMENT_ENABLED` to `false` and reload to switch the fix off; the printed Skills and Equipment
tables then lay out as before (a sideways scroller on A4 and Letter, wide Trait, Rank and Qty columns at phone widths,
clipped one-line fields). Nothing is stored, so no saved data changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999994-bugfix-printed-skills-equipment.js` | whole fragment and its `build/manifest.json` entry |
| `src/css/59.999989-bugfix-printed-skills-equipment.css` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `printed-skills-equipment-seam` block |

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha f4ca86eb4dd4d357cea925d09e801759c69788212255bb18f34abe2405fcae9b`
   (`main` at `c8ddb02`, just before this release: Printed Weapon Columns and Carousel Rotation merged; 3,838,436 bytes).
4. Rebuild with `build/recombine.py --verify` and run Carousel Rotation's suite runner (5,276). Then apply the same
   removal to the working branch, delete this release's entry from `CHAIN`, and delete this folder.

`qa/test-removal.py` performs these checks on scratch copies.

## Dependencies

- **None on another removable release.** It was built after BUGFIX — Printed Weapon Columns and sits after it in the
  manifest and, after BUGFIX — Carousel Keeps Its Page on Rotation, at the end of `CHAIN`, but neither calls the other or styles the other's table. That release's README names the
  Skills and Equipment tables as out of its scope, a sentence this release makes stale (comment-only).
- **Trunk:** the Skills and Equipment tables (`#skillsTable`, `#skillsBody`, `#equipTable`, `#equipBody`, `.sk-name`,
  `.sk-trait`, `.sk-rank`, `.eq-name`, `.eq-qty`, `.eq-notes`, `.col-narrow`, `.col-xnarrow`, `.col-check`) and the
  carousel's `.car-hscroll` wrapper: read only.
- **Export to PDF, Phase 11.1 (Part K):** no dependency either way; both listen to the same print events.
- No other release calls `PRINTSKILLSEQUIP` or uses its classes.

## Ownership scan

`qa/feature-dependencies.py` exits 1 and lists the stylesheet's and seam block's lines as owned by bare "BUGFIX" rather
than "BUGFIX SKILLSEQUIP", the same reading recorded for Printed Weapon Text and Printed Weapon Columns. Every line it
lists is in this release's own stylesheet or its BEGIN/END seam block, which the remover deletes. See `qa/ownership.log`.
