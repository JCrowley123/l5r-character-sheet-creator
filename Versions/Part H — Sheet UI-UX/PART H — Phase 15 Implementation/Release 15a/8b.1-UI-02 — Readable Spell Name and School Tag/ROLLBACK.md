# Removing 8b.1-UI-02 (Release 15a)

8b.1-UI-02 is one independently removable unit of group G3.

- **Marker:** `PART H PHASE 15.1.22`. The number is a marker only; the finding keeps its identifier.
- **Tag:** `SN15`.
- **Switch:** `SPELL_NAME_LINE_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999999-feat-spell-name-line.js`. Holds `SN15` and the switch. Sets the `sn15-on` body class. Rebinds `recalcAll`, keeping the previous binding and calling it first. Observes `#techList` for row changes. |
| Fragment | `src/css/1140-spell-name-line.css`. Every drawing rule waits for `body.sn15-on`; the one rule outside it keeps the tag undrawn. |
| Manifest | The two entries naming those files, each right after 8b.1-UI-01's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `spell-name-line-seam` (a guarded `Object.assign`), right after 8b.1-UI-01's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after 8b.1-UI-01's. |

It adds no save field and changes no character data. The tag is a drawn element only; the grant stays in the row's own data.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly 8b.1-UI-01: 17,619,334 bytes, SHA-256 `b3395d846f5d6398b4bcf15214575bdf1a38e1f69f06e5c6b6e74a24b2acea16`. Removing 8b.1-UI-01 next gives live G2 exactly (`77936023…82f0`). `qa/test-removal.py` proves both, and that 8b.1-UI-01 can be removed with this unit kept.

**Switching it off instead:** set `SPELL_NAME_LINE_ENABLED = false`. The rows are exactly as before.

## Dependencies

- **Phase 11.2.5 (Part K), School choices — reads only.** This unit reads that layer's `.sc8-source` label on a spell row and stops drawing it there. It calls nothing in that layer and does not name its objects. Without the label no tag is drawn.
- **The trunk.** `recalcAll`, `getSchoolsList` (guarded) and the spell row's own classes from `makeEntry`.
- **8b.1-UI-01:** no dependency either way. Each is proved with the other removed.
- **8b.1-UI-03:** this unit does not read it. That unit's phone rule gives the name a margin beside Remove; this unit's name line is written to shrink, so the two fit together without either naming the other.
- **Nothing depends on this unit.**
