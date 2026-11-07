# Removing A03.1 (Release 15a)

A03.1 is one independently removable unit of group G1. It was the owner's idea from A03, and the owner added it on 6 November 2026.

- **Marker:** `PART H PHASE 15.1.3.1`. It is dotted under A03's number. A03's remover only matches `15.1.3` when no further digit follows, so the two never collide. Every remover also refuses a foreign marker inside its own block.
- **Tag:** `SM15`.
- **Switch:** `SKILL_MASTERIES_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999992-feat-skill-masteries.js`. Holds `SM15` and the switch. Sets the `sm15-on` body class. Rebinds the trunk's `showSkillInfoModal`, keeping the previous binding, and adds one `section.sm15-masteries` after `#skillInfoEmph` each time the window opens. The section holds `h4.sm15-head`, then either `ol.sm15-list` (with `li.sm15-item`, `.sm15-reached`, `.sm15-rank` and `.sm15-text`) or `p.sm15-none`. |
| Fragment | `src/css/1133-skill-masteries.css`. The list's look. |
| Manifest | The two entries naming those files, each right after A16's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `skill-masteries-seam` (a guarded `Object.assign`), right after A16's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A16's. |

It adds no save field and changes no character data. The list is drawn from the trunk's library each time the window opens.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block. It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A16: 17,580,502 bytes, SHA-256 `f64b6e375665d9e7175a98d70829b8c9afb09646261ddc3574eaae1ff01258ef`. Removing A16 next, with its own remover, gives A15 exactly (`2ba7e6df…c0e0`). `qa/test-removal.py` proves both. It also proves that A16 can be removed with A03.1 kept.

**Switching it off instead:** set `SKILL_MASTERIES_ENABLED = false`. Nothing is rebound, and the window is exactly as before.

## Dependencies

- **Trunk:**
  - `showSkillInfoModal()`, which it rebinds; the Skill row's own click calls it by name at click time;
  - `findSkill()` and the library's Mastery map (`.m`, tiers 3, 5 and 7), the same data `renderSkillMasteryNote()` draws on the Skill card;
  - the window's `#skillInfoEmph` and `#skillInfoModalOverlay`;
  - the tokens `--shu-dark`, `--ink`, `--ink-soft` and `--line`.
- **BUGFIX — Skill Traits:**
  - It also rebinds `showSkillInfoModal` (for the Craft note). A03.1 wraps whatever binding precedes it, so the two compose in either order.
  - Neither names the other.
  - Its harness passes 38/38 with A03.1 present.
- **A03:** no dependency, despite the number. A03.1 does not read `CS15` or A03's classes. A03's harness passes 37/37 with A03.1 present.
- **Phase 12.4 (Part K):** the Skill Info window stays live in Play, as that phase intends. Its harness passes 17/17.
- **Nothing depends on A03.1.** No later unit may call `SM15` or read `sm15-*` without declaring it here first.
