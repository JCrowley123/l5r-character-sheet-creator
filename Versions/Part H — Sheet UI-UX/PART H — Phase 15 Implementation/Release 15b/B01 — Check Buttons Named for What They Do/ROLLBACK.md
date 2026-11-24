# Removing B01 (Release 15b)

B01 is one independently removable unit of Release 15b, group 2 (action labels and wording).

- **Marker:** `PART H PHASE 15.2.6`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `CN15`.
- **Switch:** `CHECK_BUTTON_NAMES_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999997-feat-check-button-names.js`. Holds `CN15` and the switch, and wraps `CHK4531.checkButton` and `CHK4531.button`. |
| Manifest | The one entry naming that file, right after B17's script. B01 has no stylesheet. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `check-button-names-seam` (a guarded `Object.assign`), right after B17's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B17's. |

It adds no save field, no storage key and no class.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly group 1 as live (B17 on B14): 17,750,809 bytes, SHA-256 `5ac767c6c3680126cfe664aef41e7312d98f24eee842ec679e38ed664dde574d`. `qa/test-removal.py` proves three things:
- that rebuild;
- that B17 removed next gives B14 exactly;
- that B17 can be removed with this unit kept.

**Switching it off instead:** set `CHECK_BUTTON_NAMES_ENABLED = false`. Nothing is wrapped, and the seven buttons read as before ("Check (TN 25)", "Spend a Void Point" and so on), with their old spoken names.

## Harnesses that follow this unit (declared)

**Feature 4.5.31 (Part I), `qa/checks-conditions-harness.js`,** is conditional on B01. It reads `CN15` from the seam. Only while B01 is present:
- `CK-ROW-BRASH`, `CK-ROW-CANT-LIE`, `CK-ROW-CONTRARY`, `CK-ROW-OVERCONFIDENT`, `CK-ROW-RUMORMONGER`, `CK-ROW-SOFT-HEARTED` and `CK-ROW-LOST-LOVE` expect B01's words;
- its presses look for B01's words.

Everything else is unchanged: the rolls, TNs, notes, every other check, the ids and the count.

**Feature 4.5.31's `qa/dependency-harness.js`** (not in the suite) reads `CN15` the same way for its one check of Brash's button.

**Not changed, not in the suite:** Feature 4.5.32's and Phase 14's `qa/checklist-walk.js` (Part I and Part K) are older device-walk scripts that press "Check (TN 25)" and "Spend a Void Point" by their words. Run them with B01 switched off, or read B01's words for those presses.

## Dependencies

- **Feature 4.5.31 (Part I), Checks and Conditions:** hard, by property and guarded.
  - **What B01 reads:** `CHK4531.checkButton`, `CHK4531.button` and `CHK4531.CHECKS` (each check's `name`, `trait` and `why`, for the spoken name).
  - **Without them:** B01 installs nothing.
  - **4.5.31's remover** matches `CHK4531` as its surface, so it refuses while B01 is present: **remove B01 first**. The removal chain does this in order. The reciprocal note is in 4.5.31's ROLLBACK.
- **Phase 4.5.34 (Part I), Blind's Armor TN note, and Release 15a A05 and A11:** none. B01 changes no field, no layout rule and no Blind line.
- **B18 (One Name per Button Job):** Lost Love's "Spend Void" is B18's suggestion for its job group G07. If B18 rules another word, B18's own build changes it. Nothing here depends on B18.
- **Group 1 (A14, B04, B14, B17):** none either way. B17 can be removed with B01 kept, and the rebuild verifies.
- **Nothing depends on B01.** No later unit may call `CN15` without declaring it here first.
