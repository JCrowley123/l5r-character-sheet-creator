# Removing A16 (Release 15a)

A16 is one independently removable unit of group G1.

- Marker: `PART H PHASE 15.1.16`
- Tag: `BI15`
- Switch: `PICKER_BOTTOM_INFO_REMOVED_ENABLED`

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999991-feat-picker-bottom-info.js`. This holds `BI15` and the switch. It sets the `bi15-on` body class, and a `MutationObserver` on `#advConfigGrid` (`BI15.sweep`) removes the seven pickers' bottom information buttons while that class is set. |
| Fragment | `src/css/1132-picker-bottom-info.css`. The same seven selectors as `display:none` while `bi15-on` is set, so a button is never painted in the moment before the observer runs. |
| Manifest | The two entries naming those files, each right after A15's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `picker-bottom-info-seam` (a guarded `Object.assign`), right after A15's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A15's. |
| Declared fixture correction | One check in Phase 4.5.14's (Part I) harness (below). |

The seven selectors pick only the bottom button, which each picker appends as a direct child of the window's grid (Darling of the Court appends it inside its court editor):

| Selector | Picker |
|---|---|
| `#advConfigGrid > .fb4521-info` | Seven Fortunes' Blessing |
| `#advConfigGrid > .dp4523-info` | Dark Paragon |
| `#advConfigGrid .court4514-editor > .court4514-info` | Darling of the Court |
| `#advConfigGrid > .p4518-info` | Paragon |
| `#advConfigGrid > .sa4519-info` | Soul of Artistry |
| `#advConfigGrid > .tr4524-info` | Touch of the Spirit Realms |
| `#advConfigGrid > .vv4520-info` | Void Versatility |

The row's i on the Advantages list carries the same classes, but it sits outside the window and is never touched.

A16 adds no save field and changes no character data. Removing it brings the seven buttons back, exactly as before.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block. It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A15: 17,576,326 bytes, SHA-256 `2ba7e6dfe0385f6be499452a0f0ba68aea6b40a29482a214ea2212eb2466c0e0`. Removing A15 next, with its own remover, gives A04 exactly (`bc4ba311…e0c9`). `qa/test-removal.py` proves both, and also that A15 can be removed with A16 kept.

**Switching it off instead:** set `PICKER_BOTTOM_INFO_REMOVED_ENABLED = false`. The class is never set, so nothing is removed or hidden.

## Why removing, not only hiding

The first build only hid the seven buttons (`display:none`). Phase 4.5.14's harness then failed its geometry check (`CS-GEOMETRY-*`) at all four widths. That check measures that every button in the window sits inside it, and a hidden button reports an all-zero box at the window's left edge. A hidden button cannot overflow anything, but the check was left exactly as it is. A16 now removes the buttons, which is also what the ruling says, and the check passes, 225/225.

## Declared fixture correction

**Phase 4.5.14 (Part I), `qa/court-servant-harness.js`, `CS-INFO-NESTED`:**

- With `BI15` on the seam, it checks that the court editor draws no information button of its own. `CS-INFO-RETURNS-TO-EDITOR` still checks the editor stays open.
- Without `BI15`, it opens the nested panel as before.
- It is the same id, and the harness has the same 225 checks.
- It passes 225/225 with A16, and 225/225 with A16 removed.

## Dependencies

- **The seven pickers:**
  - Phase 4.5.21 (Part I), Seven Fortunes' Blessing;
  - Phase 4.5.23 (Part I), Dark Paragon;
  - Phase 4.5.14 (Part I), Darling of the Court;
  - Phase 4.5.18 (Part I), Paragon;
  - Phase 4.5.19 (Part I), Soul of Artistry;
  - Phase 4.5.24 (Part I), Touch of the Spirit Realms;
  - Phase 4.5.20 (Part I), Void Versatility.

  These are soft dependencies. A16 only names their bottom button's class, and without a picker its selector matches nothing. A16 names their classes, so four of their removers (4.5.18, 4.5.19, 4.5.20 and 4.5.24) refuse while A16 is present (dry runs, 7 November), as does 4.5.14's through A15 and A16. **Remove A16 first.** The removal chain does this in order. 4.5.21's and 4.5.23's removers already refuse for older, unrelated reasons. Each of the seven has a reciprocal note in its ROLLBACK. Each picker's own harness passes with A16 present: 77, 67, 225, 80, 92, 50 and 66, all in full.
- **Phase 4.54 (Part I):** its own observer on the same grid only adds buttons to elements with an explanatory `title=`. A16's observer only removes the seven classes above. Neither triggers the other, and 4.54's harness passes 28/28.
- **A15 and A04:** none either way. A15 can be removed with A16 kept: the rebuild verifies, and A16's harness passes 50/50 on it.
- **Nothing depends on A16.** No later unit may call `BI15` or read `bi15-on` without declaring it here first.
