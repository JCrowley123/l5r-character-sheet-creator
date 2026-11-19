# Removing A20 (Release 15a)

A20 is one independently removable unit of group G6 (new functions).

- **Marker:** `PART H PHASE 15.1.34`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `TC15`.
- **Switch:** `SKILL_TRAIT_CHOICE_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999991-feat-skill-trait-choice.js`. Holds `TC15`, the switch, the table of book-named Traits, and the two functions the hook blocks call, `tc1534Decorate` and `tc1534Pool`. Writes nothing the sheet keeps: on a choice it changes only the roll's own request and context (the Trait's name and value, and the pool), which exist for that one roll. |
| Stylesheet | `src/css/1148-skill-trait-choice.css`, the drop-down and the note (`.tc15-*`). |
| Manifest | The two entries naming those files: the stylesheet right after A19's (`1147`), the script right after A19's. |
| Hook blocks | `src/sheet/208-feat-roll-preview.js`: `trait-choice-base` at the top of the preview's `render` (the pool is read from the request, which this unit keeps current) and `trait-choice-control` right after the preview's markup is written (calls `tc1534Decorate(body, req, render)`). `src/sheet/130-round-and-pipeline.js`: `trait-choice-pool` right after the preview gate in `rollWithModifiers` (calls `tc1534Pool(context)`; when another Trait was chosen, the pool rolled is that Trait's). Each is guarded, in the places Features 4.5.10, 4.5.11 and 4.5.15 (the preview) and 4.5.26 (the pipeline) put theirs. With the unit's fragment absent each hook does nothing; with the blocks removed the two files are byte for byte as before. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `skill-trait-choice-seam` (a guarded `Object.assign`), right after A19's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A19's. |

It adds no save field and no storage key, and changes no saved value.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside one of its blocks, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A19: 17,701,397 bytes, SHA-256 `0ee228674c0110313e83d0a19e2b8800abd4fd2c376ca07f3e3d13d37ef25dc9`. `qa/test-removal.py` proves that, then that A19 removed next gives A08 exactly, and that A19 can be removed with this unit kept.

**Switching it off instead:** set `SKILL_TRAIT_CHOICE_ENABLED = false`. The hooks then find nothing to do: no drop-down, and every roll uses its own pool, as before.

## Dependencies

- **The roll preview (Part G Phase 3) — hard, through its two hook blocks.** Without the preview there is nowhere to choose; the pipeline hook then finds no choice and does nothing.
- **Explain This Roll's base rows (Part G Phase 4) — soft.** The drop-down replaces the label of the preview's first base row (the Trait's). Without those rows there is no drop-down and the preview is as before.
- **The roll pipeline (`rollWithModifiers`) — hard, through its hook block.**
- **Trait values (`getTraitValueByName`, which Weakness wraps) and the Void Ring (`getRingValueByName`) — read only.**
- **A19 and every other 15a unit — none.** A19 does not touch the roll preview's pool; nothing depends on this unit.
