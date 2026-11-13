# Removing AE1 (Release 15a)

AE1 is one independently removable unit of the automatic-entries group.

- **Marker:** `PART H PHASE 15.1.28`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `YG15`.
- **Switch:** `YOGO_GIVEN_SPELLS_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999995-feat-yogo-given-spells.js`. Holds `YG15` and the switch. As the sheet loads it sets, by property, Yogo Wardmaster's `given` and `text` and five Schools' `source` in Phase 11.2.4's table (`CW1124.table`). |
| Manifest | The entry naming that file, right after A10.1's sheet fragment. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `yogo-given-spells-seam` (a guarded `Object.assign`), right after A17's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A17's. |

It adds no save field and no element, and changes no saved character. A character made in the wizard with this unit has a Sense spell row and its scroll; removing the unit leaves them on the character, as any learned spell is.

## A declared change to another layer's test

Phase 11.2.4's `qa/wizard5-harness.js` pins every School's line. Its table check (`CW5-LINE-…`) and its walk through the wizard (`CW5-WALK-…`) now read `AE1_LINES` for Fuzake, Horiuchi, Ninube, Yogo and Yoritomo **when `YG15` is in the build and switched on**, and the old lines otherwise. Same ids and count (71/71 both ways). Removing AE1 needs no change to that harness.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A17 (G4 as live): 17,648,272 bytes, SHA-256 `fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb`. `qa/test-removal.py` proves that, then that A17 removed next gives A10.1 exactly, and that A17 can be removed with this unit kept.

**Switching it off instead:** set `YOGO_GIVEN_SPELLS_ENABLED = false`. The table is exactly as before.

## Dependencies

- **Phase 11.2.4 (Part K), the wizard's table for every School — hard, by property.** Without `CW1124.table` the unit does nothing (`install()` returns false).
- **Readers of the table — none to declare.** The wizard, the character check, the older-holdings review and the Rank spell choices read the table when they run; they see the corrected lines with this unit and the old ones without.
- **AE2 reads the given lists** and so credits Sense to a Yogo Wardmaster only while this unit is present; AE2 works either way.
- **Nothing depends on this unit.**
