# Removing 8b.1-UI-01 (Release 15a)

8b.1-UI-01 is one independently removable unit of group G3.

- **Marker:** `PART H PHASE 15.1.21`. The number is a marker only; the finding keeps its identifier. Earlier removers match `15.1.2` and `15.1.1` only when no further digit follows, so they never match it. Every remover also refuses a foreign marker inside its own block.
- **Tag:** `SR15`.
- **Switch:** `SPELL_REVIEW_LAYOUT_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999998-feat-spell-review-layout.js`. Holds `SR15` and the switch. Sets the `sr15-on` body class. Rebinds `SC8.render` by property, keeping the previous binding and calling it first. |
| Fragment | `src/css/1139-spell-review-layout.css`. Every rule waits for `body.sr15-on` and a dialog marked `sr15-review`. |
| Manifest | The two entries naming those files, each right after A04.1's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `spell-review-layout-seam` (a guarded `Object.assign`), right after A04.1's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A04.1's. |

It adds no save field and changes no character data, grant or choice. The classes and the wrapper it adds live only in the open dialog, which is discarded on close.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly live G2: 17,609,230 bytes, SHA-256 `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`. Removing A04.1 next gives A11 exactly (`d8965a9f…3907`). `qa/test-removal.py` proves both, and that A04.1 can be removed with this unit kept.

**Switching it off instead:** set `SPELL_REVIEW_LAYOUT_ENABLED = false`. The review is exactly as before.

## Dependencies

- **Phase 11.2.5 (Part K), School choices — hard.** This unit rebinds that layer's `SC8.render` and reads its dialog (`#sc8Dialog`, `#sc8Body`, `#sc8Done`, `#sc8Message`). Guarded: without it nothing installs. It names `SC8`, so that layer's remover may refuse while this unit is present: remove this unit first (the removal chain does so in order).
- **The Older School Choices fix — reads only.** This unit recognises a spell review by that fix's `.oc8-confirm` and `input.oc8-spell`, restyles its `.oc8-held-spell`, and reads the "· N left" its headings carry. It calls nothing there. Without that fix no dialog is ever dressed. If that fix changes the heading wording, the headings fall back to their own text with no count.
- **Paragon (Phase 4.5.18, Part I) — the harness only.** The harness reads Paragon's option card as the look to match. The unit itself does not use it.
- **Nothing depends on this unit.** The two later G3 units do not read it and are proved to work with it removed.

**The first build of this unit** was `b3395d84…ea16`; revision 1 (the code review) is `390f3cd1…f19c`. Removal restores live G2 from either.

**Declared harness hygiene (12 November 2026, found by G3's variant discovery):** where this unit's harness takes the unit's page class away to compare, it now puts the class back only if it was there, so a build with the unit switched off is never switched on by its own harness. Same ids, counts and assertions; the harness passes in full on the frozen candidate. See `G3 — Spell Rows/qa/VARIANT-PINS.md`.
