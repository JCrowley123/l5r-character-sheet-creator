# Release 15b · G1 Totals and their breakdowns: mock-ups and the owner's approval

20 November 2026 (Claude). The board, [mockups/G1-MOCKUPS.html](mockups/G1-MOCKUPS.html), was published to the owner as a private artifact (https://claude.ai/artifact/7eYntEEDBHV846kfVG3iaP). It shows today beside the proposal for each unit, at phone and laptop size, with a recommendation for each. Every picture is the live build (`921f3ac9…6150`, `main` at `3b499a88`, Release 15a live) in a test browser, with the proposal applied only in that browser. How the pictures were made: [REPRODUCTION.md](REPRODUCTION.md).

## The owner's decisions before the mock-ups, 20 November 2026

The [work order of 19 November](https://claude.ai/artifact/WqezEhpZ2mYS76kXD96WiP) (a Claude Doc; [review note](<../../Release 15a/REVIEW-AFTER-15A.md>)) asked three questions. The owner gave the same answer in two places, verbatim: the button "Approve as recommended" in the Claude session, and "approve the three 15b decisions as recommended" in the session that started it. That answer is recorded in the doc's Decision column on all three rows.

| Decision | Approved |
|---|---|
| 15b's groups and order | 1 A14, B02, B04, B14 · 2 B01, B03, B05, B09 · 3 B06, B10, B11, B16 · 4 B07, B08 (behaviour tier) · 5 B12, B13 |
| Where B14 and B01 belong | Both stay in 15b. B14 is Touch of the Spirit Realms (Jigoku)'s automatic modifier, not a resisting row. B01 sets the wording the resistance phase reuses. |
| A "15a removed, group kept" stage | Yes, in each group's chain |

**Usage.** Recording the decisions and making the mock-ups took the weekly meter (all models, account-wide) from 35% at 00:55 UTC to 38% at 01:15 UTC on 20 November. The five-hour meter went from 4% to 24%.

## The owner's answers on the board

The board asked four questions, one per unit: approve as shown (recommended), revise, or drop.

### Round 1, 20 November 2026 (in this Claude session), verbatim

> I am happy with the most of the mock ups the revisions I think I would make are:
> 1) In the roll preview for wounds I think I would just have the total and rank.  I don't think the calculation or explanation is needed at all.
>
> So in the wound penalty section it would say -5 to total -- nicked
>
> The reason for this is that I think the new "i" icon does a good enough explanation for how the penalty is calculated.  Do you agree?
>
> 2) I don't think the card needs to say the catalogue price or card price.  I don't think this is needed at all after all.  I think the descriptions are clear in their explanation that certain clans or types of characters pay less.  I can not see a reason for this.  Please provide 3 strong reasons reasons why we should keep the distinction between price vs catalogue.
>
> 3) This has been made clearer by the example of Kharmic tie, but the card looks too busy.  There are 3 seperate "i" icons, a change button, a reset button, 3 pips showing the uses, a line that says Rank 3; 3/3 uses remaining, and then a badge with the targets name but the line also lists the target.
>
> This needs to be cut down and simplified.
>
> I would have expected a UI of a single change button, a single "i" icon the 3 pips and the reset.  Please help me with a new UI/UX for kharmic tie.
>
> Other than the points raised above I am happy with the mock ups

Read as:

- **A14: revise.** The roll preview's Wound Penalty row reads "−5 to total — Nicked", with no arithmetic. The informational "3 → 5 … already included" row still goes. The rest of A14 is approved as shown.
- **B02: in question.** The owner asked for three strong reasons to keep it. Claude's answer and the owner's ruling follow in round 2.
- **B04 and B14: approved as shown.**
- **Kharmic Tie: a new request** (not one of the four units). A simpler card, mocked up in round 2.

### Round 2, 20 November 2026 (Claude): the board's new top section

The same board link, version 2, adds a round-2 section above round 1, which is unchanged below it. Pictures and values come from one run of `qa/mockup/repro.cjs` with `ONLY=kt,a14r`, plus a re-run of the proposed Kharmic Tie after its window was simplified. Values are in `qa/mockup/reproduction-round2.json`, and there were no page errors.

- **A14, the preview as revised:** one row, "Wound Penalty −5 to total — Nicked" (today's first row unchanged). The informational row is removed, and the penalty is still −5.
- **Claude's answer on A14:** agreed. The figure and the level name match the Wounds line, and the sum is one tap away. B14 keeps "Taint Rank 4 × 2 (Lost)" as approved, because Jigoku has no level name to stand for the figure.
- **Claude's answer on B02:** three strong reasons could not be given honestly. The best case, ranked:
  1. The row does not say its cost includes a discount ("remind, not remember"). Moderate, because Blissful Betrothal's own note names the entries it changes.
  2. Checking the XP total against the book. Weak.
  3. Consistency with the Clan-price note (FT-13). Weak, because dropping leaves today as it is.
  - **Recommendation: drop B02.** Nothing is built, and today's notes stay as they are.
- **Kharmic Tie, proposed:**
  - **One row:** the badge "Aiko · Rank 3", the pips, Reset session, then Change (Manage only) and one i at the right.
  - **What goes:** the "Target: Aiko — Rank 3; 2/3 uses remaining" line, and the two i's that Phase 4.54 added from the badge's and Reset's `title` texts.
  - **The one i's window:** the rule in a sentence, each use +1k1, the uses left, and what Reset session and Change do.
  - **Row height:** phone Play 58 → 28 px; phone Manage 60 → 56; laptop Manage 68 → 28; laptop Play 32 → 28.
  - **Reset session** still restores the uses (●●○ → ●●●) and the row keeps its shape after the redraw.
  - **Recommendation:** approve as a fifth group-1 unit, **B17 — One Row for Kharmic Tie** (`PART H PHASE 15.2.5`), screen-only.
- **Recorded, not proposed:**
  - Luck, Unlucky, Dark Paragon, the Ancestor card and the once-per-session entries have the same "Reset session" with a title-borne i. That belongs to A04.2, still parked.
  - The empty Description box takes the most room on the card in Play.
- **The board's three questions:**
  1. A14 as revised: confirm or revise.
  2. B02: drop or keep.
  3. Kharmic Tie: approve as a fifth unit, revise, or drop.

**Usage, round 2:** weekly meter 38% → 39%, five-hour 3% → 9% (14:08 → 14:15 UTC).

### Round 2 answers, 20 November 2026 (in this Claude session), verbatim

> I approve as recommended.  The only change I would make is to see if the change and i buttons can sit on the same row for khamic tie

Read as:

- **A14: approved as revised.** The roll preview's Wound Penalty row reads "−5 to total — Nicked"; the informational row goes.
- **B02: dropped.** Nothing is built; today's price notes stay as they are.
- **Kharmic Tie: approved as B17 — One Row for Kharmic Tie** (`PART H PHASE 15.2.5`), screen-only, with one change: Change and the i sit on the badge's row (on a phone in Manage they had wrapped to a second line). Round 3 below shows whether they fit.

### Round 3, 20 November 2026 (Claude): the board's new top section

Version 3 of the same board link adds a round-3 section above round 2; rounds 2 and 1 are unchanged below it. The pictures come from one run of `qa/mockup/repro.cjs` with `ONLY=kt3`, and the values are in `qa/mockup/reproduction-round3.json`. There were no page errors.

- **Why they wrapped:** on a phone in Manage the row needed 347 px (badge 76, pips and Reset session 138, Change and the i 110, two gaps) and had 318.
- **The two changes:**
  - **The button reads "Reset"**, as the owner called it, instead of "Reset session". That saves 48 px. The accessible name stays "Reset session: all 3 Kharmic Tie uses back", and the i's window says "Reset gives back all 3 at the start of a session."
  - **Change and the i are pinned to the first line, at the right.** The badge, the pips and Reset wrap on the left only when a long name needs the room.
- **Result, "Aiko · Rank 3":** one line (28 px) on a phone in both Manage and Play, and on a laptop.
- **Result, "Kakita Yoshiko · Rank 5":** on a phone in Manage, Change and the i stay on the badge's line and the pips and Reset go under it (55 px). In Play, and on a laptop, it is one line.
- **Reset** still refills the pips (●●○ → ●●●), and the row keeps its shape after the redraw.
- **Other "Reset session" cards** (Luck, Unlucky and the rest) keep their label. A04.2 can give them the short "Reset" when it is unparked.
- **The board's question:** Kharmic Tie, round 3: approve (recommended), or revise.

### Round 3 answer, 20 November 2026 (in this Claude session), verbatim

> I approve round 3.  But I think we need to make a note that again phase 15 was meant to be a UI/UX consistency pass.
>
> If in one place I use the phrase reset and in another I have reset session.  I feel that an additional unit is needed to check the whole sheet to see if there are other buttons that do similar jobs but should maybe have one consistent naming convention.
>
> What are your thoughts on this?

Read as:

- **B17: approved as in round 3.** Group 1 to build: A14 (as revised), B04, B14, B17. B02 dropped.
- **The owner's note:** Phase 15 is a UI/UX consistency pass. A label changed in one place ("Reset") while the same job elsewhere keeps another ("Reset session") works against that.
- **A new unit asked about:** a sheet-wide check of buttons that do similar jobs, for one naming convention. Claude's view and the owner's ruling follow.

### Claude's view on the naming unit, 20 November 2026

- **Agreed.** Round 3 renamed one card's button while six others with the same job kept the old word. Round 3 should have raised the label as a sheet-wide question, not a one-card fix.
- **A first scan of the source** (a text search, not an inventory) finds several families:
  - "Reset session" in seven files (Kharmic Tie, Luck, Dark Paragon, Unlucky, the Ancestor card twice, the once-per-session entries), and a plain "Reset" on the combat round counter.
  - Change, Choose… and Edit.
  - Remove, Delete and ×.
  - Done, Close and Cancel.
  - Use, Use it and Use it now.
  - Some differences may carry meaning, such as Remove an entry vs Delete a saved character. The aim is one name per job, not one name for everything.
- **Proposed: a new unit, B18 — One Name per Button Job,** in three stages, like the resistance rules read:
  1. **Inventory**, read-only. For every button and button-like control: its visible label, its spoken name, its job, its card and its mode, grouped by job. For each group, it notes whether a difference carries meaning, and proposes one word.
  2. **The owner rules on each group.**
  3. **The build**, its own group after the inventory, screen-only. Labels and spoken names change, the harnesses that pin labels are updated, and no behaviour changes. Where it meets A04.2 (the Reset rows), the two are scheduled together.
- **B17 meanwhile:** it builds with today's "Reset session", and B18 decides the word for all seven at once. Change and the i stay pinned to the badge's line, as approved. From round 3's measured widths:
  - On a phone in Manage, the pips and "Reset session" sit under the badge, 2 lines (about 56 px).
  - On a phone in Play and on a laptop, it is one line.
  - If B18 picks "Reset", the phone's Manage row becomes one line with no further change.
### The owner's ruling on the naming unit, 20 November 2026, verbatim

> Approve as proposed

(The button answer in this Claude session.) Read as:

- **B18 — One Name per Button Job is a new 15b unit.** It runs in three stages: an inventory, the owner's ruling on each group, then a build group of its own. Its place in 15b's order is set when the rulings are in, and its Reset rows are scheduled with A04.2.
- **B17 builds with today's "Reset session".** Change and the i are pinned to the badge's line.
- **Group 1 is settled:** A14 (as revised), B04, B14 and B17. B02 is dropped.

**Usage, rounds 2–3 answers:** weekly meter 40%, five-hour 17% at 16:25 UTC.

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
- **A14 as revised (round 2).** The preview row's own text is not changed: only the informational row (`WND4529.rollNote`) goes. Part C Feature 3's `wounds` modifier keeps "−5 to total — Nicked".
- **B17 (approved: round 3's layout, with today's "Reset session" label, per the B18 ruling).**
  - **The summary line** is Feature 4.5's `kharmicTie` summary (`209.81`); the badge, pips and Reset session come from `209.81` and `209.82`.
  - **The layout (round 3):** a two-column row. The badge and the Kharmic controls wrap in the left column; Change and the i sit in the right column, held to the first line. The scratch version used a zero-width 28 px strut so a wrapped first line keeps the badge centred against Change; the build can do the same, or set a 28 px line on the left column.
  - **The label:** do not change "Reset session"; B18 decides the word for every card at once. On a phone in Manage, the pips and Reset session therefore wrap under the badge (about 56 px). In Play and on a laptop the row is one line. The i's window says "Reset session".
  - **No titles:** remove the badge's and Reset's `title`s so Phase 4.54 adds no i. A04 moves an i out of a button, so check that nothing is left behind.
  - **Accessible names:** give Reset, Change and the one i accessible names; keep the pips' spoken label.
  - **The page:** the sheet records no page for Kharmic Tie. Take it from a rules check, with the book only in a temporary folder.
  - **Harnesses:** search every harness that pins "Target: … uses remaining" or the badge text before changing them (kickoff §9).
- **Counts for the first group** (kickoff §8.5): candidate 7,453 plus the group's new checks; retained, with the group removed, 7,380 on 203 leaves. Removing the group must restore `921f3ac9…6150`, 17,718,601 bytes, exactly.
