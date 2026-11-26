# Release 15b · B18.2 — The i at the End of Its Row

Round 2 of B18 (one name per button job), the second of its two looks.

- **Where it came from:** the owner's note on the round-1 Reset card (25 November 2026, verbatim): "I have also noticed that in some of the examples like luck, or Kharmic tie where there is a tool tip "i" icon the button seems to either be right next to the reset button or all the way to the right.  I feel that this needs to be consistent, my gut says that where appropriate the "i" should be on the right hand side as to not make the buttons too crowded."
- **Approved:** round 2, card `iright`, "The i always sits at the right end of its row", **Approve** (25 November 2026, 20:26 UTC), no note. Records: [MOCKUP.md](<../B18 — One Name per Button Job/MOCKUP.md>); board https://claude.ai/artifact/CEVcuCGBbiamEg8spLQ3o2 (version 3).
- **Built:** 26 November 2026 (Claude), on branch `claude/release-15b-b18-2`, stacked on `claude/release-15b-b18-1`. The group's tip.
- **Not live.**

## What changes

Where an Advantage or Disadvantage card's top row has an i beside its buttons, the i sits at the right end of the row, where Kharmic Tie's already is (13 px from the card's edge):

| Card | Before (measured on the board, phone) | With B18.2 |
|---|---|---|
| Luck, on a phone | 91 px from the card's right edge | 13 px |
| Luck, on a laptop | 324 px | 13 px |
| Dark Paragon | 220 px | 13 px |
| Seven Fortunes' Curse (Hotei) | 223 px | 13 px |
| A card that needs a choice (Manage) | 100 px | 13 px |
| Kharmic Tie (the model) | 13 px | unchanged |

Luck's i stays with its pips and Reset: on a phone in Manage that group wraps under Change, and the i ends that line. **Left as they are:** the Skills list's i's, the i's beside a heading, Kharmic Tie, and where Change sits in Manage (parked with A04.2 for the rules read). Words, spoken names, the order a screen reader reads them, what each button does and print are unchanged.

## How it is built

- `src/sheet/209.99999999999999999994-feat-info-row-end.js` holds `IE15` and the switch `INFO_AT_ROW_END_ENABLED`; it only marks the page (`body.ie15-on`).
- `src/css/1157-info-row-end.css`: the board's drawing rule, without its `!important`. Release 15a's one-information-pattern rule sets the i's left margin; this rule outranks it by specificity (`html body.ie15-on …` with one more class). Seven Fortunes' Curse's i is found by its place (the button straight after the curse's badge), not by Release 15a A04's class, so A04 can still be removed with this unit kept.

## Light checks (26 November 2026)

- **Own harness** `qa/info-row-end-harness.js`: **11/11** (`qa/run-4.log`, on the tip after B18's revision; `qa/run-3.log` before it), with the suite's preloads, on a phone and a laptop, in Manage and in Play. Each moved i's gap to its card's edge is compared with Kharmic Tie's, measured on the same page; the i's that stay (Skills, the Ancestor heading, Kharmic Tie) and the reading order are compared with and without the page's mark. Run 1 (on a scratch build): 7/11, three harness assumptions (Luck's i wraps with its group on a phone in Manage; the needs-a-choice i's show in Manage only; the "level" reference must be a shown element) and one real finding in B18: Luck's i window was headed "Reset session" (fixed in B18). Run 2: 9/11, the same reference. With all 26 Release 15a units removed: **11/11** (without A04, only Dark Paragon's own i is a row's i, and only it moves).
- **Removal:** `qa/test-removal.py` **10/10** (`qa/removal.log`, on the tip). Removing B18.2 rebuilds B18 + B18.1 exactly (`a85cb648…c429`, 17,809,947 bytes); B18.1 removed next gives B18 exactly; B18.1 removed with B18.2 kept verifies.
- **Dependencies:** exit 0 (`qa/dependencies.log`); older removers that name its stylesheet: only Dark Paragon's (`qa/surface-hits.log`).
- **The live suite on the group's tip** before B18's revision (application `c7d7f0a3…1b19`): **213/213 harnesses, 7,562/7,562 checks**, five at a time, the live-site leaves included (`qa/light/full-tip/`). After the revision: see the group's HANDOVER.
