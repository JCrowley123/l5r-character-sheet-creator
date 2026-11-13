# Removing AE3 (Release 15a)

AE3 is one independently removable unit of the automatic-entries group.

- **Marker:** `PART H PHASE 15.1.30`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `AX15`.
- **Switch:** `AUTOMATIC_ENTRY_CONTROLS_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.999999999999999997-feat-automatic-entry-controls.js`. Holds `AX15` and the switch. Sets the `ax15-on` body class; marks automatic cards in the Techniques list with the class `ax15-auto` and `data-ax15` (`school`, `path`, `advanced` or `given`), adds a `span.ax15-tag` to a Technique card's top line, and the class `ax15-wrap` where the name would not fit beside it. Rebinds `recalcAll` by name to re-mark the cards; two MutationObservers (the list; the body's class), a ResizeObserver on the list, and `input` and `resize` listeners queue the same. |
| Fragment | `src/css/1146-automatic-entry-controls.css`. Hides the XP box and the × on marked cards, gives back the corner, draws the tag and the fallback. Waits for `body.ax15-on`; screen only. |
| Manifest | The two entries naming those files: the stylesheet right after A17's, the fragment right after AE2's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `automatic-entry-controls-seam` (a guarded `Object.assign`), right after AE2's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after AE2's. |

It writes nothing: no save field, and the XP box is hidden, not removed, so every saved character is exactly as before. Its classes and tags live only on the page.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly AE2 (revision 2): 17,664,331 bytes, SHA-256 `8eb7aecc7021d260fe24a2dd9897455cc0d85ff3292c040d52923cd0bccbb2ef`. `qa/test-removal.py` proves that, then that AE2 removed next gives AE1 exactly, and that AE2 can be removed with this unit kept.

**Switching it off instead:** set `AUTOMATIC_ENTRY_CONTROLS_ENABLED = false`. The cards are exactly as before.

## Dependencies

- **8b.1-UI-03 — soft, by class name.** Its corner rules (`sx15-on`) reserve 42 px for the × and narrow the XP box; this unit's rules outrank them on marked cards. Without 8b.1-UI-03 there is no corner to give back and the rules still hide the controls.
- **8b.1-UI-02 — soft.** A given spell keeps its "School spell" tag from that unit; this unit adds no tag to spells.
- **Phase 11.2.5 (Part K), School choices — soft.** A spell counts as given only through its School record (`SC8.read`); without that layer no spell is marked and every spell keeps its ×.
- **Phases 11.2.3 and 11.2.4 (Part K), each School's given list (`CW1123.forSchool`) — soft.**
- **The Schools, Paths and Advanced Schools (Part I) — soft, by reading.** `getSchoolsList`, `f_school`, `pathAtRank` and `AS47.record` say which Schools are on the character and which Path a Rank took.
- **AE1 and AE2 — none.** With AE2 the given spells are credited on opening; without it they are credited when the player confirms the review, and this unit marks them either way.
- **Nothing depends on this unit.**
