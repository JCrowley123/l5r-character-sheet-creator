# Removing A10 (Release 15a)

A10 is one independently removable unit of group G4.

- **Marker:** `PART H PHASE 15.1.25`. The number is a marker only; the finding keeps its identifier.
- **Tag:** `CP15`.
- **Switch:** `CROSS_PAGE_FOCUS_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999993-feat-cross-page-focus.js`. Holds `CP15`, its route list and the switch. Sets the `cp15-on` body class and adds one click listener on the document. While a heading it focused holds focus, it carries `data-cp15-target` (and `tabindex="-1"` if it had none); both are taken off when it loses focus. |
| Fragment | `src/css/1143-cross-page-focus.css`. Four rules, all waiting for `body.cp15-on`. |
| Manifest | The two entries naming those files, each right after A09's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `cross-page-focus-seam` (a guarded `Object.assign`), right after A09's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A09's. |

It adds no save field and no element, and changes no character data.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A09: 17,635,271 bytes, SHA-256 `0fb2a08ab6c80e94800b72a45f4796ca6e8279b7d12ac07a800f5aa2e7c7914d`. `qa/test-removal.py` proves that, then that A09 removed next gives G3 as live exactly, and that A09 can be removed with this unit kept.

**Switching it off instead:** set `CROSS_PAGE_FOCUS_ENABLED = false`. The row and the focus are exactly as before.

## Dependencies

- **The Advanced Schools pointer (AP7) — soft, by id.** The route names its button `#ap7Go` and its row `#ap7Pointer`. Without that fix there is no such button: the listener never matches and the rules never apply. That fix's remover may refuse while this unit names its ids: remove this unit first (the removal chain does so in order).
- **Phase 4.7 (Part I), Advanced Schools — soft, by id.** The heading focused is `#advancedSchoolPanel h3`; if it is not drawn, the Techniques page's first drawn heading is used.
- **The carousel (Part D) — by its public interface.** `goToTab`'s settling (`whenSettled`), `getActiveTab`, and its own rule that a page not holding focus is inert.
- **A09 and the other G4 units — none either way.**
- **Nothing depends on this unit.**
