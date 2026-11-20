# Removing A14 (Release 15b)

A14 is one independently removable unit of Release 15b, group 1 (totals and their breakdowns).

- **Marker:** `PART H PHASE 15.2.1`, the first of Release 15b's markers (15.2.x). The number is a marker only; the unit keeps its identifier.
- **Tag:** `WP15`.
- **Switch:** `NET_WOUND_PENALTY_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999993-feat-net-wound-penalty.js`. Holds `WP15` and the switch. It wraps `formatWoundPenalty`, `showWoundInfoModal` and `renderQuickAccessPanel`, replaces `WND4529.rollNote` with an empty list, and adds the class `wp15-on` to the page's body. |
| Stylesheet | `src/css/1150-net-wound-penalty.css`, under `body.wp15-on`: the i's spacing and fallback letter, and the window's table. |
| Manifest | The two entries naming those files: the stylesheet right after A19.1's (`1149`), and the script right after A19.1's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `net-wound-penalty-seam` (a guarded `Object.assign`), right after A19.1's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A19.1's: the first entry of Release 15b. |

It adds no save field and no storage key. Its ids are `wp15LineInfo` and `wp15QaInfo`; its classes are `wp15-on`, `wp15-info`, `wp15-breakdown`, `wp15-total` and `wp15-rule`.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly Release 15a as live: 17,718,601 bytes, SHA-256 `921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150`. `qa/test-removal.py` proves three things:
- that rebuild;
- that A19.1 removed next gives A20 on A19 revision 1 exactly;
- that A19.1 can be removed with this unit kept.

**Switching it off instead:** set `NET_WOUND_PENALTY_ENABLED = false`. Nothing is wrapped, and the track, the window, Quick Access and the preview are exactly as before.

## Harnesses that follow this unit (declared)

**Phase 4.5.29 (Part I), `qa/wound-entries-harness.js`**, is conditional on A14. It reads `WP15` from the seam and, only while A14 is present, changes six checks:
- **`WE-DISPLAY-SUMMARY`, `-SEGMENT-AND-POPUP`, `-CANCELLED-READS-NONE` and `-BOTH-NAMED`** expect the penalty without the bracketed names.
- **`WE-ROLL-GRAZED-STRENGTH`, `-NICKED-CANCELLED-STILL-EXPLAINED` and `-LOW-PAIN`** expect no informational line. The penalty that reaches the roll is checked as before.

The ids and the count are unchanged. The result, with A14 present and with A14 removed, is in the light checks.

## Dependencies

- **Phase 4.5.29 (Part I), Wound Entries:** hard, by property and guarded. Without `WND4529` (its `adjusters`, `adjustersText`, `adjustSize`, `PEN_RE`, `ENTRIES`), A14 installs nothing.
  - A14 reads those and replaces `WND4529.rollNote`.
  - 4.5.29's remover matches `WND4529` as its surface, so it refuses while A14 is present. **Remove A14 first**; the removal chain does this in order. The reciprocal note is in 4.5.29's ROLLBACK.
- **Trunk:** `formatWoundPenalty`, `showWoundInfoModal`, `renderWounds` (which calls `renderQuickAccessPanel` by name after every render), `WOUND_LEVELS`, and the ids `woundSummaryLine`, `woundBar`, `woundInfoDesc` and `qaWoundsValue`.
- **A04 (Release 15a), One Information Pattern:** soft. The i is a `.sk-info-btn`, which A04's ring draws. Without A04 it is the trunk's small gold ring with this unit's own letter. Nothing in this unit names A04's surface.
- **Nothing depends on A14.** No later unit may call `WP15` or read the classes and ids above without declaring it here first.
