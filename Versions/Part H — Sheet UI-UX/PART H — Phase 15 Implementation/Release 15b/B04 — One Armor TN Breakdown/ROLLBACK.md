# Removing B04 (Release 15b)

B04 is one independently removable unit of Release 15b, group 1 (totals and their breakdowns).

- **Marker:** `PART H PHASE 15.2.3`. The number is a marker only, and follows the group's order as mocked up (B02, which would have been 15.2.2, was dropped). The unit keeps its identifier.
- **Tag:** `AT15`.
- **Switch:** `ARMOR_TN_BREAKDOWN_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999994-feat-armor-tn-breakdown.js`. Holds `AT15` and the switch. It wraps `showCombatFormulaInfo` and `renderQuickAccessPanel` and adds the class `at15-on` to the page's body. |
| Stylesheet | `src/css/1151-armor-tn-breakdown.css`, under `body.at15-on`: the i's spacing and fallback letter, the window's table, and Blind's Quick Access line hidden. |
| Manifest | The two entries naming those files, each right after A14's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `armor-tn-breakdown-seam` (a guarded `Object.assign`), right after A14's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A14's. |

It adds no save field and no storage key. Its id is `at15QaInfo`; its classes are `at15-on`, `at15-info`, `at15-breakdown`, `at15-total` and `at15-formula`.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A14: 17,728,093 bytes, SHA-256 `0bd322b99cf89633b7feba8685c9f3320c2ffecb96f4b8b178c1959a53c99677`. `qa/test-removal.py` proves three things:
- that rebuild;
- that A14 removed next gives Release 15a as live exactly;
- that A14 can be removed with this unit kept.

**Switching it off instead:** set `ARMOR_TN_BREAKDOWN_ENABLED = false`. Nothing is wrapped, and Quick Access shows Blind's line as before.

## Dependencies

B04 reads three older releases. Each of their removers matches what B04 reads as its own surface, so each refuses while B04 is present: **remove B04 first**; the removal chain does this in order. Reciprocal notes are in each one's ROLLBACK.

- **Feature 4.5.34 (Part I), Blind's Armor TN note:** soft.
  - B04 calls `BL4534.text(false)` to know that Blind set the base, and hides `#bl4534QaNote`.
  - Without 4.5.34, the base row reads "Base TN to be Hit" (or "Reflexes × 5 + 5" when that is the base), and its figure is still the sheet's.
- **Feature 4.5.36 (Part I), Weakness:** soft.
  - B04 calls `weakness4536Reflexes` to name a lowered Reflexes in the base row's note.
  - Without it there is no note.
- **Phase 4.8 (Part I), Ancestors:** soft.
  - B04 calls `ancestorArmorTNBonus` to name Shiba's gift.
  - Without it, a gift that the sheet still adds would show as "Other bonuses".
- **Trunk:** the following, each guarded by `typeof`:
  - `populateInfoOverlay`, `showCombatFormulaInfo` and `renderQuickAccessPanel`;
  - `getTraitValueByName`, `getCurrentStance`, `getStanceArmorTNBonus`, `getVoidArmorTNBonus`, `getDualWieldArmorTNBonus` and `getMirumotoArmorTNBonus`;
  - the fields `#f_baseTN`, `#f_currentTN`, `#f_armorTN` and `#f_armorName`.
- **A04 (Release 15a), One Information Pattern:** soft. The i is a `.sk-info-btn`. Nothing here names A04's surface.
- **A14:** none either way. A14 can be removed with B04 kept; the rebuild verifies.
- **Nothing depends on B04.** No later unit may call `AT15` or read the classes and id above without declaring it here first.

## Release 15b B18 — one name per button job (26 November 2026)

**A later unit now reads this release.** Release 15b B18 (`Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B18 — One Name per Button Job/`) sets this unit's `AT15.LABEL` from "Armor TN: how it is worked out" to "Armor TN information" when it installs, and names Quick Access's i (`at15QaInfo`) after each recalculation. The breakdown table's own label is unchanged. Its words and spoken names are the ones the owner approved on B18's board (25 November 2026); what this release does is unchanged. This release's remover finds `AT15` and `at15QaInfo` in B18's script, so it refuses while B18 is present: **remove B18 first**; the removal chain does this in order.

**Declared fixture correction.** `qa/armor-tn-harness.js` follows B18: while `BN15` is on the seam, `AT-QA-I-PHONE` expects the i to be heard "Armor TN information". It keeps its ids and count, and with B18 removed every line runs as before.
