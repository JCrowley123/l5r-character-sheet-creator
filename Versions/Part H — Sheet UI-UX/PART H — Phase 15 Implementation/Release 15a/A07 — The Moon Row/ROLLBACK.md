# Removing A07 (Release 15a)

A07 is one independently removable unit of group G2.

- **Marker:** `PART H PHASE 15.1.7`. The remover only matches `15.1.7` when no further digit follows.
- **Tag:** `MR15`.
- **Switch:** `MOON_ROW_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999995-feat-moon-row.js`. Holds `MR15` and the switch, which sets the `mr15-on` body class. Nothing else. |
| Fragment | `src/css/1136-moon-row.css`. The "Severity" label (generated text), the column layout of `.lm7-moon`, the 44 px tick row with its 22 px box, and the 44 px resist button. Every rule matches only the configuration row that holds `.lm7-moon`. |
| Manifest | The two entries naming those files, each right after A06's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `moon-row-seam` (a guarded `Object.assign`), right after A06's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A06's. |

It adds no save field and changes no character data, roll or Void point.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A06: 17,595,505 bytes, SHA-256 `9ae08de1df78559b52c4326e5364ea33e872a248aeecd3cbbd9383ca0e9d90d0`. Removing A06 next gives A05 exactly (`dde68b5c…a726`). `qa/test-removal.py` proves both. It also proves that A06 can be removed with A07 kept.

**Switching it off instead:** set `MOON_ROW_ENABLED = false`. The row is exactly as before.

## Dependencies

- **BUGFIX — Moon Curse Full Moon (LM7):**
  - A07 styles `.lm7-moon`, `label.lm7-tick` and `.lm7-roll`, and that row's `.adv-config-summary`. It calls nothing there.
  - That harness passes 17/17 with A07 present.
  - If that fix were removed, A07 would match nothing.
- **BUGFIX — Moon Resist Label (MR7):** the button's wording is its own and is unchanged. That harness passes 5/5 with A07 present.
- **Trunk:** `#disadvList`, `.adv-config-row` and `.adv-config-summary`, and the tokens `--ink` and `--ink-soft`.
- **Nothing depends on A07.**
