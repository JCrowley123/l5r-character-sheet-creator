# Release 15a · A11 — Explanatory Text: Gaps and One Left Edge

Group G2, unit 4 of 5. This is audit finding A11 (FT-51), ruled under Q1, with the owner's additions of 7 November 2026. Approved as mocked up on 7 November ([G2 mock-ups](<../G2 — Small Layout Fixes/MOCKUP.md>)), including the six condition cards' 2 px gap. Built on 7 November 2026 (Claude), on branch `claude/release-15a-a11`, stacked on A07.

## What changes

1. **One text edge on every card in Play.** This was the owner's point from G1's review. In Play an Advantage or Disadvantage card's name and description show as plain text (Phase 12, Part K, makes their border transparent). But each kept its box's 9 px padding and 1 px border, so both started 10 px right of every line between them (summaries, notes, warnings, reminders). This was measured on every card, phone and laptop. In Play they now start on the card's text edge. In Manage they stay editable boxes, unchanged, because text inside a box is inset by design.
2. **Insight's and Spent XP's notes.** On a laptop their inline style pulled them 4 px up into the fields above. They now take the shared 6 px helper gap there, and a readable 1.5 line height everywhere. The phone already gives them 14 px (10 px on very small screens), from the carousel's own rule, and that is kept.
3. **Six condition cards.** On Missing Limb, Lost Love, Contrary, Rumormonger, Soft-Hearted and Blissful Betrothal, the description sat 2 px under the row's controls. It now has the same 6 px gap (owner, 7 November).

**From the whole-app read (step 1), left for later by the owner:** the Rings note on a laptop, the "Armor & TN" heading and the bonus note in Play, and the Wounds table's first column.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A11 (this branch) | `d8965a9f8c419d85e3587cc5ab5ec0798c75e0292036c0896c7d9a6f6aff3907` | 17,602,520 |
| A11 removed (A07) | `9d1ece8c5339c963784f62a43d8f86f1e84eb084debdd8dab0a8af7eb0e72aae` | 17,598,724 |

## Light checks (7 November)

| Check | Result |
|---|---|
| Own harness `qa/text-edges-harness.js` (22 checks, pinned before the first run) | 22/22 |
| Own harness with A07 removed and A11 kept | 22/22 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside A11's own blocks |
| Phase 12 (Part K) | 25/25 |
| Phase 12.2 (Part K), Identity in Play | 17/17 |
| Phase 12.5 (Part K), Advantages and Disadvantages in Play | 212/212 |
| Phase 4.5.31 (Part I), checks and conditions | 101/101 |
| Phase 4.5.32 (Part I), damage, sessions and XP | 69/69 |
| A05 (shares the limb row) | 22/22 |

No older harness measures the hints' spacing or the cards' text edge (searched).

**Three corrections to the harness's own oracle while building, before any result was used:**

- The test character has 17 cards, not the 20 or more the size floors assumed.
- An explanatory line now counts only where it starts a visual line. Brash's note sits after a control on the same line.
- A line that opens with generated text starts where that text starts. A07 adds "Severity" before the Moon summary.

No check was loosened: the edge tolerance stays 1 px.

Qualification follows the owner's review. See [ROLLBACK.md](ROLLBACK.md).
