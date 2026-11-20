# Release 15b · G1 Totals and their breakdowns: mock-ups and the owner's approval

20 November 2026 (Claude). The board, [mockups/G1-MOCKUPS.html](mockups/G1-MOCKUPS.html), was published to the owner as a private artifact (https://claude.ai/artifact/7eYntEEDBHV846kfVG3iaP). It shows today beside the proposal for each unit, at phone and laptop size, with a recommendation for each. Every picture is the live build (`921f3ac9…6150`, `main` at `3b499a88`, Release 15a live) in a test browser, with the proposal applied only in that browser. How the pictures were made: [REPRODUCTION.md](REPRODUCTION.md).

## The owner's decisions before the mock-ups, 20 November 2026

The [work order of 19 November](https://claude.ai/artifact/WqezEhpZ2mYS76kXD96WiP) (a Claude Doc; [review note](<../../Release 15a/REVIEW-AFTER-15A.md>)) asked three questions. The owner answered in the Claude session with the button "Approve as recommended", and that answer is recorded in the doc's Decision column on all three rows.

| Decision | Approved |
|---|---|
| 15b's groups and order | 1 A14, B02, B04, B14 · 2 B01, B03, B05, B09 · 3 B06, B10, B11, B16 · 4 B07, B08 (behaviour tier) · 5 B12, B13 |
| Where B14 and B01 belong | Both stay in 15b. B14 is Touch of the Spirit Realms (Jigoku)'s automatic modifier, not a resisting row. B01 sets the wording the resistance phase reuses. |
| A "15a removed, group kept" stage | Yes, in each group's chain |

**Usage.** Recording the decisions and making the mock-ups took the weekly meter (all models, account-wide) from 35% at 00:55 UTC to 38% at 01:15 UTC on 20 November. The five-hour meter went from 4% to 24%.

## The owner's answers on the board

Not yet given. The board asks four questions, one per unit: approve as shown (recommended), revise, or drop. Record the owner's words here verbatim when they come.

## The units as proposed

One pattern for the group: the figure that applies first, then its arithmetic from current values; the reasons and page references behind the standard i (A04). No number changes. All four are screen-only.

| Unit | Proposed | Marker |
|---|---|---|
| **A14 — One Net Wound Penalty** (Wound text, 8 October; Q1) | The Wounds line, each level's name for screen readers, the window a level opens and Quick Access show one net penalty ("Nicked — TN of all rolls +5 — 12 of 38 wound points"), with an i when an entry changes the penalty. The i (or a tap on a level) opens the level's window with a table: the rank's own penalty (+3), each entry signed with its page (Low Pain Threshold +5, Core p.160; Strength of the Earth −3, Core p.154) and the total, then the rank's rule. The roll preview keeps one Wound Penalty row, "−5 to total — Nicked 3 + Low Pain Threshold 5 − Strength of the Earth 3", and drops the informational "3 → 5 … already included" row. The arithmetic, the floors and the thresholds stay. | `PART H PHASE 15.2.1` |
| **B02 — Actual and Catalogue Price** (FT-13; Q1) | Every row whose price another entry changed reads "Actual 4 XP · catalogue 6 XP" under its name and cost, with an i. That covers the Clan, family and School-type prices of Feature 4.5.25 and Blissful Betrothal's four. The i's window shows the catalogue price, each change signed with its page (Blissful Betrothal −2, Core p.146; Crab price −1, Core p.151) and the actual price. It is shown in Manage and Play, where the Clan note shows today. The notes for a typed cost, for a price fixed when bought and for Blissful Betrothal's own card stay. | `15.2.2` |
| **B04 — One Armor TN Breakdown** (FT-20; Q8) | Quick Access: "Armor TN 7" with an i; Blind's line under it goes. The i and the Combat card's ⓘ show one breakdown: the base (Blind: Reflexes 2 + 5, Core p.156; otherwise Reflexes × 5 + 5), the Armor TN Bonus, each other bonus in effect by name, and the total. The Combat card's ⓘ keeps its formula under the table. The Combat card's Blind line under Base TN stays (owner's call of 9 October). | `15.2.3` |
| **B14 — Jigoku's Total, Then Its Arithmetic** (Lost wording; Q8) | Roll preview: "+8 to total — Taint Rank 4 × 2 (Lost)" ("+4 to total — Taint Rank 4" when not Lost). Card: "Adding +8 — Taint Rank 4 × 2 (Lost)." Both are built from the current Taint Rank and the Lost tick. The formula and the gate stay, and Cursed by the Realm (Jigoku) is not touched. | `15.2.4` |

Each unit gets its own folder under `Release 15b/`, with a switch, harness, remover, `test-removal.py` and a removal-chain entry after `A19.1 — The Damage Row Fits a Phone`. This folder holds the group's shared records only.

## For the build (not decided by the owner; settle when the build starts)

- **Markers.** Before the first build, confirm that the remover and `build.py --check-drift` accept `PART H PHASE 15.2.x` (kickoff §8.3).
- **The i and 15a removed.** Each new i uses A04's ring (`.sk-info-btn` under `body.ip15-on`). With all of 15a removed (decision 3), the trunk's `.sk-info-btn` shows the button's own text. So each i needs a text fallback (ⓘ) that A04's `font-size: 0` hides, plus an accessible name. Do not put a `title` on an i inside the Advantage lists: Phase 4.5's decorator (`R454`) adds its own i to any titled element there. The scratch board met this.
- **A14, readers of the Wounds text.** Quick Access copies `#woundSummaryLine`'s text. The campaign-wounds layer (WM7) inserts before that line, and A19.1's damage row sits beside the track. Search every reader of `formatWoundPenalty` and the line before changing them (kickoff §9). The net figure can come from Phase 4.5.29's own `WND4529.format` with the brackets left off. The parts come from `WND4529.corePenalty()` and `WND4529.adjusters()`. The preview row is Part C Feature 3's `wounds` modifier, and the informational row is `WND4529.rollNote`. A level's window comes from `showWoundInfoModal(lvl)`, so each level gets its own sums. The owner's two-entry fixture is in `qa/mockup/fixtures.cjs` (`a14`), so it is built before anything else, as the kickoff asks.
- **B02, provisional prices.** Today a provisional Clan price adds "— fixed when you leave Management." The new line must keep that. The catalogue figure comes from Feature 4.5.25's price table (`e.base`) and Phase 4.5.32's `dataset.dsx4532.base`. The scratch version took the page from a one-entry map; the build reads it from the price table.
- **B04, the terms.** These come from `recalcAll`'s own terms (stance, Void, two weapons, Way of the Dragon, Shiba's gift, Weakness on Reflexes), each by name. The scratch version grouped them into one row, and the test character had none. Only `#bl4534QaNote` is hidden.
- **B14.** Feature 4.5.24's modifier note and card note (`TR4524`).
- **Counts for the first group** (kickoff §8.5): candidate 7,453 plus the group's new checks; retained, with the group removed, 7,380 on 203 leaves. Removing the group must restore `921f3ac9…6150`, 17,718,601 bytes, exactly.
