# Removing B17 (Release 15b)

B17 is one independently removable unit of Release 15b, group 1 (totals and their breakdowns).

- **Marker:** `PART H PHASE 15.2.5`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `KT15`.
- **Switch:** `KHARMIC_TIE_ROW_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999996-feat-kharmic-tie-row.js`. Holds `KT15` and the switch, wraps `refreshAdvConfigControl`, and adds the class `kt15-on` to the page's body. |
| Stylesheet | `src/css/1152-kharmic-tie-row.css`, under `body.kt15-on`. It holds the two-column row, the hidden summary, the i's fallback letter and the window's table. |
| Manifest | The two entries naming those files: the stylesheet right after B04's (`1151`), and the script right after B14's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `kharmic-tie-row-seam` (a guarded `Object.assign`), right after B14's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B14's. |

It adds no save field and no storage key. Its classes are:
- `kt15-on`, `kt15-row`, `kt15-main`, `kt15-end` and `kt15-info`;
- `kt15-rule` and `kt15-table` (the window).

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly B14 on B04: 17,741,065 bytes, SHA-256 `65b81f74b2dd82cea0ea334fb92c0da7936ae33b01e9008a01d5533df4ef5939`. `qa/test-removal.py` proves three things:
- that rebuild;
- that B14 removed next gives B04 exactly;
- that B14 can be removed with this unit kept.

**Switching it off instead:** set `KHARMIC_TIE_ROW_ENABLED = false`. Nothing is wrapped, and the row is drawn as before, with its summary line, badge, two i's, pips, Reset session and Change.

## Harnesses that follow this unit (declared)

**Phase 4.5 (Part I), `qa/adv-config-expansion-harness.js`,** is conditional on B17.
- **How:** it reads `KT15` from the seam.
- **While B17 is present:** the Kharmic Tie badge check looks for "Aiko · Rank 3" instead of "Target: Aiko". The reset-session check is unchanged.
- **The rest:** the checks and their count are unchanged.

## Dependencies

- **Phase 4.5 (Part I), the Advantage configuration and its Kharmic Tie module:** hard, by name and guarded.
  - **What B17 reads:** `refreshAdvConfigControl`, `readAdvConfig`, `resolveAdvDisadvEffect` and `normalizeAdvName`, the row's classes (`adv-config-row`, `configured`, `adv-config-badge`, `adv-config-kharmic-controls`, `adv-config-reset-session`, `adv-config-pips`, `adv-config-btn`, `adv-config-summary`), and the effect's `kharmicTie` fields (`target`, `rank`, `remaining`).
  - **Without them:** B17 installs nothing, or leaves the row as drawn.
  - **Their removers:** none of their removers matches these names, so they are not blocked.
- **Phase 4.54 (Part I) and A04 (Release 15a):** soft.
  - **What B17 does:** it removes `.adv-config-info` buttons from a configured Kharmic Tie's row, after both have passed over it.
  - **Without them:** there is nothing to remove. The i is a `.sk-info-btn`, which A04's ring draws, and nothing here names their surfaces.
- **Phase 12 (Part K), Play and Manage:** none by name. Change keeps its own lock and is hidden in Play as before. The window says what Change does only when Change is visible.
- **The trunk's** `populateInfoOverlay`.
- **A14, B04 and B14:** none either way. B14 can be removed with B17 kept, and the rebuild verifies.
- **B18 (One Name per Button Job):** B18 decides "Reset session"'s word for every card, this one included. B17 keeps the trunk's word until then.
- **Nothing depends on B17.** No later unit may call `KT15` or read the classes above without declaring it here first.
