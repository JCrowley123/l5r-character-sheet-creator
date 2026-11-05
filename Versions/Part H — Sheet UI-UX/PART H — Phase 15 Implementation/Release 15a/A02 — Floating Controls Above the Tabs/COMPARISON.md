# A02 comparison: A01 as live (predecessor) and A02 revision 2 (candidate)

Measured on 5 November 2026 with `qa/reproduce.cjs`, which loads the same dense test character (the Phase 15 audit's) into each build. It visits every tab in Play and in Manage, at the top of the page, part-way down (400 px, or half way on a shorter page) and at the very end, on four screens. A control "covers" an item when its box overlaps a heading, label, field, button or table cell of the page that the browser actually draws. Results: `qa/reproduce/predecessor-a01-r2/` and `qa/reproduce/candidate-r2/`, each with `floating-states.json`, `summary.txt` and screenshots; totals in `qa/reproduce/candidate-r2/comparison.json` (`qa/compare.cjs`).

| Screen | States | States with a control over the page: top / part-way / end | Page items covered | Headings covered at the top | States with a control on the tabs | Visible page height |
|---|---|---|---|---|---|---|
| Phone, 390 × 844 | 57 / 57 | 19 / 16 / 16 → 10 / 14 / **0** | 121 → 69 | 19 → **0** | 21 → **0** | 641 → 641 px |
| Small phone, 375 × 667 | 57 / 57 | 19 / 16 / 15 → 15 / 12 / **0** | 111 → 80 | 19 → **0** | 25 → **0** | 464 → 464 px |
| Phone on its side, 844 × 390 | 57 / 57 | 14 / 10 / 14 → 11 / 13 / **0** | 121 → 67 | 0 → 0 | 24 → **0** | 193 → 193 px |
| Desktop, 1440 × 1000 | 57 / 57 | 0 → 0 | 0 → 0 | 0 → 0 | 6 → **0** | 813 → 813 px |

**What revision 2 promises and what it accepts.**
- **Promised and met:**
  - No heading is covered at the top of a page.
  - No control sits on the tabs.
  - Nothing is covered at the very end of any page.
  - No page loses height.
- **Accepted by the owner's choice of floating corners:**
  - Content scrolls under the two bottom corners part-way down a page.
  - At the top of a long page, the lowest lines of the first screen sit behind the corner buttons until you scroll.

A01 has the same overlaps and covers headings and the tabs as well. Revision 1 covered nothing at all, at the cost of 52 px of every page; the owner preferred the space.

What the screenshots show (same file names in both folders):

- `phone-management-skills-top.png`: before, Quick Access sits over *Skills*; after, the heading is clear and the buttons sit in the bottom corners just above the tabs.
- `phone-play-combat-end.png`: before, the dice covers the Wounds **+** and return-to-top sits on the tab bar; after, **−** and **+** sit clear above the dice, and return-to-top is above the dice.
- `landscape-management-skills-middle.png`: on a phone held on its side, return-to-top sits beside the dice, not above it.
- `desktop-management-adv-disadv-top.png`: on the desktop the buttons sit in the bottom corners, in the page margins.

**About the predecessor's numbers.** A01's figures differ slightly from revision 1's record (52 → 51 phone states, 127 → 121 items covered). The probe now ignores content the browser lays out but does not draw (the inside of a closed `<details>`), and its "part-way" position now really scrolls. Revision 1's harness had the same scroll slip: its part-way states were the top again. Both were found by revision 2's review. Both builds were measured again with the corrected probe.

Builds: predecessor A01 as live, application `cffde624…0414` (main `2782df61`); candidate A02 revision 2, application `91d45109…6dc0` (branch `claude/release-15a-a02`). Revision 1's comparison (candidate `1cc41d8c…5d2c`) is kept in `qa/reproduce/candidate/` and in git history.
