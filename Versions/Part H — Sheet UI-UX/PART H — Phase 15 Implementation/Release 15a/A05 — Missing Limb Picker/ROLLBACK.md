# Removing A05 (Release 15a)

A05 is one independently removable unit of group G2.

- **Marker:** `PART H PHASE 15.1.5`. The remover only matches `15.1.5` when no further digit follows. Every remover also refuses a foreign marker inside its own block.
- **Tag:** `LP15`.
- **Switch:** `LIMB_PICKER_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999993-feat-limb-picker.js`. Holds `LP15` and the switch. Sets the `lp15-on` body class. An observer on `#disadvList` marks each Missing Limb field as its row is drawn: the label's word becomes `span.lp15-label` ("Missing limb"), the label gains `lp15-field` and the row gains `lp15-row`. |
| Fragment | `src/css/1134-limb-picker.css`. The field's look. Every rule matches only a marked row. |
| Manifest | The two entries naming those files, each right after A03.1's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `limb-picker-seam` (a guarded `Object.assign`), right after A03.1's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A03.1's. |

It adds no save field and changes no character data. The select, its options, its saved value and its `aria-label` are Phase 4.5.31's own.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block. It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A03.1, which is G1 as live: 17,586,964 bytes, SHA-256 `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6`. Removing A03.1 next, with its own remover, gives A16 exactly (`f64b6e37…58ef`). `qa/test-removal.py` proves both. It also proves that A03.1 can be removed with A05 kept.

**Switching it off instead:** set `LIMB_PICKER_ENABLED = false`. No row is marked, and the row is exactly as before.

## Dependencies

- **Phase 4.5.31 (Part I):**
  - A05 reads the row that phase draws: `label.chk4531-field`, `select.chk4531-limb`, `.chk4531-row` and `.chk4531-note`.
  - It replaces only the label's text node ("Missing ") with its own span. It calls no function of that phase.
  - That phase's harness passes 101/101 with A05 present. It reads only the select's value and disabled state, and the row's fit at 320 px.
  - **If Phase 4.5.31 were removed,** there would be no limb field to mark, and A05 would do nothing.
- **Trunk:** the `#disadvList` list and the tokens `--ink` and `--line`.
- **Nothing depends on A05.** No later unit may call `LP15` or read `lp15-*` without declaring it here first.
