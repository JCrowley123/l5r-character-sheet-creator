# Removing B18.2 (Release 15b)

B18.2 is one independently removable unit of Release 15b, built on B18.1 and B18 (one name per button job): the i at the right end of its row.

- **Marker:** `PART H PHASE 15.2.10.2`. The number is a marker only; the unit keeps its identifier.
- **Tag:** `IE15`.
- **Switch:** `INFO_AT_ROW_END_ENABLED`.

## What it owns

| Kind | Item |
|---|---|
| Fragment | `src/sheet/209.99999999999999999994-feat-info-row-end.js`. Holds `IE15` and the switch; it only marks the page (`body.ie15-on`). |
| Stylesheet | `src/css/1157-info-row-end.css`: the i's place, under `body.ie15-on`. |
| Manifest | The two entries naming those files: the stylesheet after B18.1's (`1156`), the script right after B18.1's. |
| Shared block | `src/sheet/210-test-seam-and-init.js`, block `info-row-end-seam` (a guarded `Object.assign`), right after B18.1's. |
| Registry | Its `CHAIN` entry in `QA — Removal Chain Registry/removal_chain.py`, after B18.1's. |

It adds no save field, no storage key and no element. Its one class is `ie15-on`, on the page's body.

## How to remove it

1. Copy the Phase 0 tree to an external scratch folder.
2. From this folder, run `python -B qa/remove-phase.py <scratch copy>`.
3. Run the scratch copy's `build/recombine.py --verify`.

The rebuild is exactly B18.1 (17,809,073 bytes, SHA-256 `3b9bc604413019b8a5541c4e2535fd1326590f8722a321ac67fe0efd2a78b4c4`, before the B18 fix of 26 November; see the README for the current numbers). `qa/test-removal.py` proves that rebuild, that B18.1 removed next gives B18 exactly, and that B18.1 can be removed with this unit kept.

**Switching it off instead:** set `INFO_AT_ROW_END_ENABLED = false`. The body class is not set and every i sits where it did.

## Dependencies (declared)

B18.2 is a stylesheet: it calls nothing.

- **Phase 4.5.23 Dark Paragon (Part I):** its rule names `.dp4523-info`, so that release's remover refuses while B18.2 is present: **remove B18.2 first** (the removal chain does this in order). Reciprocal note in that release's ROLLBACK. Found mechanically (`qa/surface-hits.log`).
- **Release 15a A04 (one information pattern), soft:** A04 is what takes Phase 4.54's i out of the button it explains (Luck's Reset, a card's Choose…) and draws Seven Fortunes' Curse's Hotei i. B18.2 moves those i's once they are a row's own; without A04 only Dark Paragon's own i moves. B18.2 finds Hotei's i by its place (the button straight after the curse's badge), not by A04's class, so **A04's remover does not refuse** and the "Release 15a removed, group kept" check works (B18.2's harness: 11/11 with all 26 Release 15a units removed).
- Phase 4.5's `.adv-config-resource-controls` and `.adv-config-info`, Phase 4.5.4's i (Part I) and Phase 4.5.11's `.fortune4511-badge` (Part I) are named too; those removers do not name its files.

It does not depend on B18 or B18.1; it sits on their branch because the owner approved it as B18's round 2.

## Harnesses that follow this unit (declared)

None needed changing. See [README.md](README.md), "Light checks".
