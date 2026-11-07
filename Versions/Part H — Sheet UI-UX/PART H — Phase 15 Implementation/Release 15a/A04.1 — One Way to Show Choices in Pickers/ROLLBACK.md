# Removing A04.1 (Release 15a)

A04.1 is one independently removable unit of group G2. The owner added it at G1's review (comment 2, 7 November 2026).

- **Marker:** `PART H PHASE 15.1.4.1`. It is dotted under A04's number. A04's remover only matches `15.1.4` when no further digit follows, so the two never collide. Every remover also refuses a foreign marker inside its own block.
- **Tag:** `IR15`.
- **Switch:** `INLINE_RULES_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999997-feat-inline-rules.js`. Holds `IR15` and the switch. Sets the `ir15-on` body class. An observer on `#advConfigGrid` marks each `.fb4521-item` or `.d45-option` that carries a rule disclosure. For each one, it wraps the name in the first span in `<b>` (same text), appends `span.ir15-rule` (a separator, then the disclosure's text) to the label, and adds `ir15-opt` to the label and `ir15-item` to the option. It also appends `, .ir15-rule` to Phase 4.54's `R454.EXCLUDE_FROM_LABEL`. |
| Fragment | `src/css/1138-inline-rules.css`. Paragon's option card on a marked option, the running paragraph, and `display: none` on the marked option's disclosure and `.adv-config-info`. |
| Manifest | The two entries naming those files, each right after A11's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `inline-rules-seam` (a guarded `Object.assign`), right after A11's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A11's. |

It adds no save field and changes no character data or choice.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A11: 17,602,520 bytes, SHA-256 `d8965a9f8c419d85e3587cc5ab5ec0798c75e0292036c0896c7d9a6f6aff3907`. Removing A11 next gives A07 exactly (`9d1ece8c…2aae`). `qa/test-removal.py` proves both. It also proves that A11 can be removed with A04.1 kept.

**Switching it off instead:** set `INLINE_RULES_ENABLED = false`. The pickers are exactly as before.

## Dependencies

- **Phase 4.5.21 (Part I), Seven Fortunes' Blessing:**
  - A04.1 reads `.fb4521-item`, its `label` and `details.fb4521-rule`, and stops drawing the disclosure. It calls nothing there.
  - **Declared conditional fixture:** that harness's FB-GEOMETRY measures `.ir15-rule` when `window.__L5R_TEST__.IR15` is present, and `.fb4521-rule` otherwise (same ids and count). It passes 77/77 both ways.
- **Phase 4.5.2 (Part I), Disadvantages:** A04.1 reads `.d45-option`, its `label` and `details.d45-tooltip`. It calls nothing there. That harness passes 163/163 with A04.1 present.
- **Phase 4.54 (Part I), configuration UX pass:**
  - A04.1 stops drawing that phase's `.adv-config-info` inside a marked option. The button stays in the DOM, so a click from code still opens the rule.
  - A04.1 extends `R454.EXCLUDE_FROM_LABEL` by property, guarded. This is a soft dependency: without Phase 4.54 nothing is extended.
  - That harness passes 28/28 with A04.1 present.
  - A04.1 names `R454`, so that phase's remover may refuse while A04.1 is present: remove A04.1 first (the removal chain does so in order).
- **A04:** no dependency. A04.1 uses neither its code nor its classes. A04's harness passes 35/35 with A04.1 present.
- **Nothing depends on A04.1.**
