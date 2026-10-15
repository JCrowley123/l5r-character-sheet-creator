# Remove BUGFIX — Printed Weapon Columns

Set `PRINTED_WEAPON_COLUMNS_ENABLED` to `false` and reload to switch the fix off; the printed Weapons table then lays
out as before (sideways scroller on A4 and Letter, wide Skill and Size at phone widths). Nothing is stored, so no saved
data changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999993-bugfix-printed-weapon-columns.js` | whole fragment and its `build/manifest.json` entry |
| `src/css/59.999988-bugfix-printed-weapon-columns.css` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `printed-weapon-columns-seam` block |

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha c3b20fbe678adb0674570686e5b59ac84e68c8e6bc26a3c25aeb173d532475af`
   (`main` at `993d14a`, 3,833,345 bytes).
4. Rebuild with `build/recombine.py --verify` and run the Cycle 1 suite (5,249). Then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

`qa/test-removal.py` performs these checks on scratch copies.

## Dependencies

- **BUGFIX — Printed Weapon Text** (declared, soft): its print copies (`.pw-print-text`) carry the weapon name and
  note on paper; this release only changes how they wrap (between words). With that fix off or removed, this one still
  sizes the short columns and removes the scroller, and the name and note print as single-line fields again, as they
  did before it (variant `printed-weapon-text-off`). That folder's ROLLBACK records this.
- **Trunk:** the weapons table (`#weaponsTable`, `#weaponsBody`, `.wp-skill`, `.wp-roll`, `.wp-dmg`, `.wp-size`,
  `.col-narrow`, `.col-xnarrow`) and the carousel's `.car-hscroll` wrapper: read only.
- **Export to PDF, Phase 11.1 (Part K):** no dependency either way; both listen to the same print events.
- No other release calls `PRINTWEAPONCOLS` or uses its classes.

## Ownership scan

`qa/feature-dependencies.py` exits 1 and lists the stylesheet's and seam block's lines as owned by bare "BUGFIX" rather
than "BUGFIX WEAPONCOLS", the same reading recorded for Printed Weapon Text. Every line it lists is in this release's own
stylesheet or its BEGIN/END seam block, which the remover deletes. See `qa/ownership.log`.
