# G6 · A19.1 — the damage row fits a phone: mock-up and the owner's approval

19 November 2026 (Claude). Found at G6's device round: on the Combat page's Void card, "Reduce damage by 10" opens a row whose Apply button wraps onto four lines on a phone, with Cancel running past the card's edge. The row is like that on the live app (`6d47849b…44b1`), so A19 did not cause it; the owner chose to fix it as a unit of its own in G6 ("New unit A19.1 in G6 (Recommended)", recorded in [DEVICE-CHECKS.md](DEVICE-CHECKS.md)).

The board, [mockups/G6-A19.1-MOCKUP.html](mockups/G6-A19.1-MOCKUP.html), was published to the owner as a private artifact (https://claude.ai/artifact/CNf7LYFKRCMMzneDqtefNN): today beside the proposal at phone (390 × 844, touch) and laptop (1440 × 1000) size, the proposal applied only in the test browser (a stylesheet added to the live page). Scripts and measurements: `qa/mockup-a19.1/` (`repro.cjs`, `board-template.html`, `reproduction.json`).

## Measured (phone, 25 typed as the damage)

| | Row height | Apply | Cancel | Card's right edge |
|---|---|---|---|---|
| Today | 86 px | 218–303 px, 86 px tall (four lines) | 309–388 px | 352 px |
| Proposed | 117 px | 49–341 px, 35 px (one line) | 49–341 px, 35 px (one line) | 352 px |

On the laptop every edge measured the same before and after: the row stays one line. A first try put the two buttons side by side beneath the amount; Apply needs 222 px on one line and the row has 292, so Cancel fell to a third line alone. The approved proposal stacks both buttons at the card's full width instead.

## The owner's answer, 19 November 2026, in the Claude session

> "Approve as shown (Recommended)"

## The unit as approved

**A19.1 — The Damage Row Fits a Phone** (marker `PART H PHASE 15.1.35`), screen-only, its own folder, switch, stylesheet, harness, remover and removal-chain entry, stacked after A20. The damage row may wrap; its two buttons keep their words on one line; at 640 px wide or less the two buttons each take the row's full width, beneath the amount. Words, buttons, what they do, A19's Undo line and print are unchanged.
