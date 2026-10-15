# Remove BUGFIX — Printed Weapon Text

Set `PRINTED_WEAPON_TEXT_ENABLED` to `false` and reload to switch the fix off; printed weapon fields then clip as
before. Nothing is stored, so no saved data changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999997-bugfix-printed-weapon-text.js` | whole fragment and its `build/manifest.json` entry |
| `src/css/59.999987-bugfix-printed-weapon-text.css` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `printed-weapon-text-seam` block |

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 07c8a25732c19cac436be29c379d7017acc7664bbfd4310a15ee0ec33f918a83`
   (Search Focus on Close, 3,802,681 bytes).
4. Rebuild with `build/recombine.py --verify` and run Layer 1's suite (5,134). Then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

`qa/test-removal.py` performs these checks on scratch copies.

## Dependencies

- **Trunk weapons table** (`#weaponsBody`, `.wp-name`, `.wp-notes`): read only. Removing it would leave nothing to copy.
- **Export to PDF, Phase 11.1:** no dependency either way; both listen to the same print events independently.
  With Export to PDF off, this fix still works (dependency harness).
- No other release calls `PRINTWEAPONS` or uses its classes.

## Ownership scan

`qa/feature-dependencies.py` exits 1 and lists the stylesheet's and seam block's lines as owned by "BUGFIX": its
marker pattern reads every BUGFIX name after `DEPTYPE` as bare "BUGFIX" (Search Focus on Close and Skill Traits show
the same). The remover deletes exactly this release's files and its BEGIN/END seam block. See `qa/ownership.log`.
