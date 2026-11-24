# Removing B09 (Release 15b)

B09 is one independently removable unit of Release 15b, group 2 (action labels and wording).

- **Marker:** `PART H PHASE 15.2.9`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `SKP15`. The first choice, `PT15`, also appears inside the vendored PDF library's data, so the remover refused; see the README.
- **Switch:** `PICKER_TRAITS_FINAL_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999999991-feat-picker-traits.js`. Holds `SKP15` and the switch. It relabels the Skills picker's options and watches the picker with a `MutationObserver`. |
| Manifest | The one entry naming that file, right after B05's script. B09 has no stylesheet. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `picker-traits-seam` (a guarded `Object.assign`), right after B05's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B05's. |

It adds no save field, no storage key and no class.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly B05 on B03 (round 2): 17,770,451 bytes, SHA-256 `029595b6412b10183837cf1e6ade8aeb80d78ac94ea68fdee696a280c9528983`. (Round 1's was 17,762,714 bytes, `4d0a42b5…3473`.) Round 2 (24 November 2026) is on the tip branch `claude/release-15b-b09` only; the lower branches keep round 1. The builds below are round 2's, made from the tip by removing later units. `qa/test-removal.py` proves three things:
- that rebuild;
- that B05 removed next gives B03 exactly;
- that B05 can be removed with this unit kept.

**Switching it off instead:** set `PICKER_TRAITS_FINAL_ENABLED = false`. Nothing is installed, and the picker reads as before, with "Intimidation (Willpower)".

## Harnesses that follow this unit

None. No suite harness reads the picker's option words; the creation wizard and its harnesses read the option values only.

## Dependencies

- **The trunk's Skills picker (`#skillQuickAdd`) and `findSkill`:** B09 reads them, and installs nothing without them.
- **The Skill-Trait fix (`BUGFIX — Skill Traits`) and the Skill list fix (`BUGFIX — Skill List Hides Held Skills`):** soft, by the picker only.
  - **B09 reads the list the Skill-Trait fix corrects,** through `findSkill`. Without that fix, the list says Willpower again, and so does the picker.
  - **The Skill list fix draws the picker again** from the words it captured at load. B09's observer relabels each new drawing before it is painted.
  - **B09 names neither fix's surface,** so neither remover refuses while B09 is present.
- **A20 (a Trait for one Skill roll):** none. A20 chooses a Trait in the roll preview; B09 changes only the picker's words.
- **B01, B03, B05 and group 1:** none either way. B05 can be removed with B09 kept, and the rebuild verifies.
- **Nothing depends on B09.** No later unit may call `SKP15` without declaring it here first.
