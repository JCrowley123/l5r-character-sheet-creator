# A02 comparison: A01 as live (predecessor) and A02 (candidate)

Measured on 4 November 2026 with `qa/reproduce.cjs`, which loads the same dense test character (the Phase 15 audit's) into each build. It visits every tab in Play and in Manage, at the top of the page, part-way down and at the very end, on three screens. A control "covers" an item when its box overlaps a heading, label, field, button or table cell of the page. Results: `qa/reproduce/predecessor-a01/` and `qa/reproduce/candidate/`, each with `floating-states.json`, `summary.txt` and screenshots; totals in `qa/reproduce/candidate/comparison.json` (`qa/compare.cjs`).

| Screen | States | States with a control over the page | Page items covered | Headings covered at the top | States with a control on the tabs | Visible page height |
|---|---|---|---|---|---|---|
| Phone, 390 × 844 | 57 / 57 | 52 → **0** | 127 → **0** | 19 → **0** | 21 → **0** | 641 → 589 px |
| Small phone, 375 × 667 | 57 / 57 | 50 → **0** | 119 → **0** | 19 → **0** | 25 → **0** | 464 → 412 px |
| Desktop, 1440 × 1000 | 57 / 57 | 0 → 0 | 0 → 0 | 0 → 0 | 6 → **0** | 813 → 761 px |

The harness also measures a phone held on its side (844 × 390): the visible page is 193 px before and 141 px after, and no control covers anything after.

What the screenshots show (same file names in both folders):

- `phone-management-skills-top.png`: before, Quick Access's circle sits over *Skills* and the dice over the roll column; after, the heading is clear and both buttons sit on the band above the tabs.
- `phone-play-combat-end.png`: before, the dice covers the Wounds **+** and return-to-top sits on the tab bar; after, **−** and **+** are clear above the band, and return-to-top is in its middle.
- `desktop-management-adv-disadv-top.png`: on the desktop the band runs across the bottom; Quick Access and the dice sit at its ends, where before they floated in the page margins.

Unchanged and checked by A02's own harness on the candidate: return-to-top shows only after 300 px of scrolling and returns the page to the top; Quick Access opens, reads Void, and closes by its button, Escape and a tap outside; the dice opens the manual roll above everything; every tab can be tapped and goes to its page; the page's scroll position survives opening and closing Quick Access and the dice; Search stays in the app bar; the Characters screen covers the band; print shows neither. All 68 suite harnesses that read geometry or these controls pass unchanged on the candidate.

Builds: predecessor A01 as live, application `cffde624…0414` (main `2782df61`); candidate A02, application `1cc41d8c…5d2c` (branch `claude/release-15a-a02`).
