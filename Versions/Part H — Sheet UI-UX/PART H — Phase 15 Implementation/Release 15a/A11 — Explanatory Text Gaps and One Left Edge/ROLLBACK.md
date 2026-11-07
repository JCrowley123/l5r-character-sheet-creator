# Removing A11 (Release 15a)

A11 is one independently removable unit of group G2.

- **Marker:** `PART H PHASE 15.1.11`. The remover only matches `15.1.11` when no further digit follows. A01's marker (`15.1.1`) never matches it, because a digit follows.
- **Tag:** `TE15`.
- **Switch:** `TEXT_EDGES_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999996-feat-text-edges.js`. Holds `TE15` and the switch, which sets the `te15-on` body class. Nothing else. |
| Fragment | `src/css/1137-text-edges.css`. Three groups of rules: in Play, locked `.en-name` and `.en-desc` lose their horizontal padding and border; the Insight and Spent XP hints get a 1.5 line height and, above 768 px, a 6 px top margin; `.chk4531-row` and `.dsx4532-row` get a 6 px bottom margin. |
| Manifest | The two entries naming those files, each right after A07's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `text-edges-seam` (a guarded `Object.assign`), right after A07's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A07's. |

It adds no save field and changes no character data.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A07: 17,598,724 bytes, SHA-256 `9d1ece8c5339c963784f62a43d8f86f1e84eb084debdd8dab0a8af7eb0e72aae`. Removing A07 next gives A06 exactly (`9ae08de1…90d0`). `qa/test-removal.py` proves both. It also proves that A07 can be removed with A11 kept.

**Switching it off instead:** set `TEXT_EDGES_ENABLED = false`. Everything is as before.

## Dependencies

- **Phase 12 (Part K):** the Play rules match only fields that phase has locked (`data-pm12-locked`), under its `pm12-play` body class. That harness passes 25/25 with A11 present. If Phase 12 were removed, the Play rules would match nothing.
- **Phase 4.5.31 and Phase 4.5.32 (Part I):** A11 adds a bottom margin to their `.chk4531-row` and `.dsx4532-row`. It calls nothing there. Their harnesses pass 101/101 and 69/69 with A11 present.
- **The carousel's phone hint rule (`30-carousel-mobile.css`):** A11 keeps it. A11's gap applies above 768 px only.
- **A05:** no dependency. A11's row margin also applies to A05's marked limb row, and A05's harness passes 22/22 with A11 present.
- **A07:** no dependency. A11's harness measures a line that opens with generated text, such as A07's "Severity", from where that text starts. It passes with and without A07.
- **Trunk:** `#advList`, `#disadvList`, `.en-name`, `.en-desc`, the Identity fields `#f_insightBonus` and `#f_xpSpent`, and their hints.
- **Nothing depends on A11.**
