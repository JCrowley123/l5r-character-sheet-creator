# Release 15b · B18.1 — One Size for Reset

Round 2 of B18 (one name per button job), the first of its two looks.

- **Where it came from:** the owner's note on the round-1 Reset card (25 November 2026, verbatim): "I approve of the button becoming "Reset" however looking at some of the examples the buttons seem to change in size, so a pass needs to be done to make sure that they are the same size." (the rest of the note is the i's place, B18.2).
- **Approved:** round 2, card `size`, "Every Reset button is the same size", **Approve** (25 November 2026, 20:25 UTC), with the capitals, no note. Records: [MOCKUP.md](<../B18 — One Name per Button Job/MOCKUP.md>); board https://claude.ai/artifact/CEVcuCGBbiamEg8spLQ3o2 (version 3).
- **Built:** 26 November 2026 (Claude), on branch `claude/release-15b-b18-1`, stacked on `claude/release-15b-b18`.
- **Not live.**

## What changes

Every Reset is one size: **28 px tall**, in the letters of Change and Choose… on the same cards (capitals, .78rem, letter spacing .06em), padding 2 × 10 px. The buttons on the same row take the same look.

| Card | Before (phone, measured on the board) | With B18.1 |
|---|---|---|
| Kharmic Tie, Luck | 19 px, 11.5 px letters, not capitals | 28 px, 12.48 px, capitals |
| Great Destiny, Haunted | 20 px, 12.5 px, capitals | the same |
| Ancestor card | 26 px, 11.5 px, not capitals | the same |
| Combat round counter | 26 px, 11.2 px, capitals | the same |
| Unlucky | 28 px, 12 px, capitals | the same |
| Dark Paragon | 32 px, 13.1 px, not capitals | the same |

The same look: Great Destiny's (and Dark Fate's) Use, Dark Paragon's Use, Unlucky's − and +, the Ancestor card's Use and the round counter's Next Round. Every Reset ends 63 × 28 px on a 375 px phone, as the board measured.

Rows with today's four smallest Resets (Kharmic Tie, Luck, Great Destiny, Haunted) get 8 or 9 px taller; Dark Paragon's gets 4 px shorter. Words, spoken names, what each button does and print are unchanged.

## How it is built

- `src/sheet/209.99999999999999999993-feat-reset-size.js` holds `RS15` and the switch `RESET_ONE_SIZE_ENABLED`; it only marks the page (`body.rs15-on`).
- `src/css/1156-reset-size.css` draws the size: the board's drawing rule, each selector prefixed by `html body.rs15-on`, so it outranks every row's own rule without `!important` (the board's rule needed none either).
- Screen only. It calls nothing and needs nothing from B18: with B18 removed it still sizes the same buttons, which then read "Reset session".

## Light checks (26 November 2026)

- **Own harness** `qa/reset-size-harness.js`: **11/11** (`qa/run-4.log`, on the restacked build), with the suite's preloads, on a phone and a laptop. Each Reset is measured against 28 px and against the Change button on its own card (Great Destiny and Haunted have none: Luck's), and every Reset against every other. Runs 1 and 2 (9/11): harness recipe errors (the round counter is a Play control; Great Destiny has no Change); run 3: 11/11 on the first B18.1 build.
- **B18's harness on this build:** 35/35 (`qa/light/b18-harness-on-b181.log`).
- **On the tip,** after B18's revision: 11/11, and 11/11 with all 26 Release 15a units removed (`qa/run-5.log`; B18's `qa/light/tip-*`). Without A04, Luck's Reset holds Phase 4.54's i, so its width is not compared with the others'; its height and letters are.
- **Removal:** `qa/test-removal.py` **10/10** on the tip (`qa/removal.log`). Removing B18.1 rebuilds B18 exactly (on the tip, after B18's revision: `0a55634f…754a`, 17,806,742 bytes; on this unit's branch: `e6755993…c089`); B18 removed next gives group 2 as live (`1f002be9…5819`); B18 removed with B18.1 kept verifies (`4fde6af4…256c`, 17,776,932 bytes).
- **Dependencies:** exit 0 (`qa/dependencies.log`); older removers that name its stylesheet's classes: `qa/surface-hits.log` (Dark Paragon, Damage/Sessions/XP, Ancestors).
- **The live suite** on B18.1's first build (`e5e6bfcf…`, on B18 before its heading fix): 209 of 213 harnesses passed at once. Of the four: Phase 4.5.23's Dark Paragon harness pins its Use and Reset at 32 px or more (`DP-GEOMETRY-*`), now following B18.1 (28 px while `RS15` is on the seam; declared in both ROLLBACKs), 67/67 on this build and on live main; the Search Facets keystroke timing passes alone (44/44); the two live-site leaves refuse any sheet that is not the tree's current build and run on the group's tip. `qa/light/`.

Build: on this unit's branch, application `3b9bc604413019b8a5541c4e2535fd1326590f8722a321ac67fe0efd2a78b4c4`, 17,809,073 bytes; on the tip, B18 + B18.1 rebuild to `a85cb6486f3bfbb0bd03ca6f2eece478c00218fc1dba00cd9a63d2d41c9ac429`, 17,809,947 bytes.
