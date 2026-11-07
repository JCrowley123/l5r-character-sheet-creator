# Removing A15 (Release 15a)

A15 is one independently removable unit of group G1. Its marker is `PART H PHASE 15.1.15`, its tag `CB15`, and its switch `COURT_BADGES_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999999-feat-court-badges.js`. This holds `CB15` and the switch. It sets the `cb15-on` body class and wraps three of Phase 4.5.14's (Part I) methods by property:<br>• `CS4514.controls`: the radios and the "Court in session" box become one `button.court4514-court.cb15-badge` per court (`aria-pressed`, `data-cb15-index`, `cb15-pressed` while filled), plus `button.cb15-add`. The legend and the idle status line are reworded and the box gets the class `cb15-controls`.<br>• `CS4514.darlingHelp`: one sentence of the row's information is reworded.<br>• `CS4514.open`: two phrases of the editor's note are reworded. |
| Fragment | `src/css/1131-court-badges.css`. The badges' look (a gold outline; filled in `--shu-dark` while in session) and + Add court (hidden in Play and in print). |
| Manifest | The two entries naming those files, each right after A04's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `court-badges-seam` (a guarded `Object.assign`), right after A04's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A04's. |
| Declared fixture corrections | In two other phases' harnesses (below). |

**Saved data is not changed.** The badges write 4.5.14's own `{selected, inSession}` through 4.5.14's own `CS4514.update()`. Every character saved with A15 loads the same without it: the selected court and the in-session tick come back as the radio and the tick box. A character saved before A15 loads the same with it.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`. It refuses the live tree, a foreign marker inside its block, and a missing block. It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly A04: 17,566,583 bytes, SHA-256 `bc4ba31134bb30848f73bbfd5fc1e7a9c76eb75fee391f829f682647d700e0c9`. Removing A04 next, with its own remover, gives A03 as live (`e73b7c0c…de06`). `qa/test-removal.py` proves both. It also proves that A04 can be removed with A15 kept.

**Switching it off instead:** set `COURT_BADGES_ENABLED = false`. Nothing is wrapped, so 4.5.14's radios and tick box come back exactly as before.

## Declared fixture corrections

These are the same ids and the same counts in both cases. Each harness reads `CB15` from the seam and, only while A15 is present, drives the badges instead of the old controls.

- **Phase 4.5.14 (Part I), `qa/court-servant-harness.js`:**
  - `radios` reads each badge's `aria-pressed`, and `toggles` counts the court group.
  - A `session()` helper taps the selected court's badge (or nothing, if it is already filled) instead of the tick box.
  - With A15 present:
    - `CS-ONE-SELECTED` and `CS-MINIMAL-VALID` expect no badge filled before a court is in session;
    - `CS-SELECT-RESETS-SESSION` expects tapping another court to move the session there;
    - the two focus checks expect focus on the filled badge;
    - the readable and touch-target checks count the badges, + Add court and the status line.
  - Result: 225/225 with A15 present, and 225/225 on A04's build (A15 removed).
- **Phase 12.5 (Part K), `qa/advantages-harness.js`:**
  - The two court visibility checks in Play look for the badge.
  - One tap selects the court and puts it in session, so the tick-box tap is skipped.
  - Result: 212/212 with A15 present, and 212/212 on A04's build.

## Dependencies

- **Phase 4.5.14 (Part I), Darling of the Court.** A hard dependency, by property and guarded: without `CS4514`, A15 installs nothing. A15 reads 4.5.14's classes (`court4514-*`) and calls `CS4514.update()` and `CS4514.selectedOf()`. 4.5.14's remover matches `court4514…` as its surface, so it refuses while A15 is present. **Remove A15 first**; the removal chain does this in order. The reciprocal note is in 4.5.14's ROLLBACK.
- **Phase 12 (Part K), Play and Manage.** A soft dependency. The stylesheet reads `pm12-play` to hide + Add court in Play. Without Phase 12, + Add court always shows, and nothing else changes. Phase 12's remover matches `pm12-…`, so it refuses while A15 is present: remove A15 first. The note is in Phase 12's ROLLBACK.
- **Phase 9 (Part H), Clan colours.** No code dependency. The fill reads the trunk token `--shu-dark`, which Phase 9 recolours for the seven Great Clans. Without Phase 9 the fill is the sheet's red (7.91 : 1). This is recorded in Phase 9's ROLLBACK as a comment-level note.
- **Trunk:** `openAdvConfigModal()` (+ Add court opens the editor, then presses its own Add court), the global `button:hover` fade (overridden for a filled badge only), and `--gold` / `--paper` / `--shu-dark`.
- **A04 and A03:** none either way. A04 can be removed with A15 kept: the rebuild verifies, and A15's harness passes 33/33 on it.
- **Nothing depends on A15.** No later unit may call `CB15` or read `cb15-on`, `cb15-badge`, `cb15-pressed`, `cb15-add`, `cb15-controls` or `data-cb15-index` without declaring it here first.
