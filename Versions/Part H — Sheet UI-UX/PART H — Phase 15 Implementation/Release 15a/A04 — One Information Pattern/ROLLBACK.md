# Removing A04 (Release 15a)

A04 is one independently removable unit of group G1:

- marker: `PART H PHASE 15.1.4`;
- tag: `IP15`;
- switch: `ONE_INFO_PATTERN_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.9999999999999998-feat-one-info-pattern.js`. This holds `IP15` and the switch. It sets the `ip15-on` body class and gives the Skill, Void and Kiho information buttons their accessible names. It wraps `R454.decorate` (by property), `refreshAdvConfigControl` and `recalcAll`, each keeping the previous binding. On Hotei's row it adds `button.ip15-hotei-info` and `span.ip15-hotei-line` (with `data-ip15-line`), and marks the rule and the two notes `ip15-folded`. |
| Fragment | `src/css/1130-one-info-pattern.css`. The circled i for `.sk-info-btn` (not `.combat-formula-info`), `.void-eye-btn`, `.adv-config-info` and `.ip15-hotei-info`, with a 44 px touch area; an i moved out of a control Phase 12 (Part K) locks, hidden in Play; the folded Hotei text; the Hotei line. Screen only. |
| Manifest | The two entries naming those files: the CSS straight after A03's `1129-compact-skill-cards.css`, the script straight after A03's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `info-pattern-seam` (a guarded `Object.assign`), straight after A03's block. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after A03's. |

A04 adds no save field and changes no character data. The accessible names, the moved buttons and the Hotei line are all redrawn on every render and none of them is saved. Removing A04 therefore cannot affect a saved character.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`.
   - It refuses the live tree, a foreign marker inside its block, and a missing block.
   - It strips the two fragments, their manifest entries and the seam block, and nothing else.
3. Run the scratch copy's `build/recombine.py --verify`.

With nothing later present, the rebuild is exactly Release 15a A03 as live: 17,553,370 bytes, SHA-256 `e73b7c0cac70c95d2965d993c9a3b9f0b66eb6f3ef4b81d6667166667090de06`. Removing A03 next, with its own remover, gives A02 exactly (`91d45109…6dc0`). `qa/test-removal.py` proves both.

**Switching it off instead:** set `ONE_INFO_PATTERN_ENABLED = false`. No class is set, nothing is moved and nothing is added, so every button is drawn as before.

## Dependencies

All of these are soft. Every call is guarded, so without the other layer A04's part for it simply does nothing.

- **Trunk:**
  - the Skill rows (`.sk-name-row > .sk-info-btn`, `.sk-name`);
  - `#voidInfoBtn` and `#kihoRulesInfoBtn`;
  - `recalcAll()`, `refreshAdvConfigControl()` and `populateInfoOverlay()`.

  The Combat tab's `.combat-formula-info` shares `.sk-info-btn` and is deliberately excluded (`IP-COMBAT-UNCHANGED`).
- **Phase 4.54 (Part I), configuration UX:** A04 wraps `R454.decorate` by property. After it runs, any `.adv-config-info` inside a button, link or `[role=button]` is moved to just after that control and named after its entry. A04 also restyles `.adv-config-info`. Without 4.54 there is nothing to move. Phase 4.54's harness passes 28/28 with A04 present. 4.54's remover names no surface A04 uses.
- **Phase 12 (Part K), Play and Manage:** A04's stylesheet reads `pm12-play` and Phase 12's `data-pm12-locked`. In Play, an i moved out of a control that Phase 12 locks is hidden with it, as it was inside it before. Without Phase 12, neither appears and the i always shows, which is correct because nothing is locked. Phase 12's remover matches `pm12-…` as its surface, so it refuses while A04 is present. **Remove A04 first.** The removal chain does this in order. The note is in Phase 12's ROLLBACK.
- **Phase 4.5.11 (Part I), Seven Fortunes' Curse:** A04 finds Hotei's row by its badge (`.fortune4511-badge.fortune4511-eff-voidDouble`) and its summary (`.d45-summary`, Phase 4.5.2's). Its harness passes 74/74 with A04 present.
- **Phase 4.5.36 (Part I), Hotei's Void card:** A04 folds `.hotei4536-note` behind the i. 4.5.36's remover matches `hotei4536-` as its surface, so **it refuses while A04 is present: remove A04 first.** The removal chain does this in order. The reciprocal note is in 4.5.36's ROLLBACK. Its harness passes 45/45 with A04 present.
- **BUGFIX — Hotei Where the Sheet Spends Void:** A04 folds `.ht7-note` behind the i. HT7's remover does not name that class, so either can be removed first. Its harness passes 16/16 with A04 present.
- **A03:** none either way. A04 keeps `.sk-info-btn`'s element and class, which A03 places, and A03's harness passes 37/37 with A04 present. A03 can also be removed with A04 kept (`A03-ALONE-REBUILD-VERIFIES`).
- **Nothing depends on A04.** No later unit may call `IP15` or read `ip15-on`, `ip15-folded`, `ip15-hotei-info`, `ip15-hotei-line` or `data-ip15-line` without declaring it here first.
