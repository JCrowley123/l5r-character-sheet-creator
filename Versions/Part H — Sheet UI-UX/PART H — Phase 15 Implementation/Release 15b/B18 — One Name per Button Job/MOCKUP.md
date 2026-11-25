# B18 · One Name per Button Job — mock-ups, round 1

Prepared by Claude on **25 November 2026**. Nothing is built; no application file was edited and nothing is on `main`. The board shows each ruled group on today's live sheet beside the same screen with the owner's ruling applied in the test browser only.

- **Board (private artifact):** https://claude.ai/artifact/CEVcuCGBbiamEg8spLQ3o2 (version 1, published 25 November 2026 about 02:55 UTC; declares the `db` capability only) (answers save on the board, collection `answers`; a copy is [mockups/B18-MOCKUPS.html](mockups/B18-MOCKUPS.html)).
- **Live sheet:** `origin/main` `450362b9`, application `1f002be9…5819`, 17,773,727 bytes (15b groups 1 and 2 live).
- **The re-check** of the 21 November inventory against that sheet: [RECHECK.md](RECHECK.md).
- **How it was made:** [REPRODUCTION.md](REPRODUCTION.md), section "Stage 3 mock-ups, round 1".

The owner's rule for all of B18 (24 November, verbatim): "I think as a rule of thumb, before anything is changed or built I want to see a mock up comparing how it is now, to how it will look after the change".

## Round 1: what the board proposes

One decision per ruled group: **Approve / Revise / Leave as now** (G03 has its options as the choices). "Visible" means the words or glyph a player sees change; "read aloud" means only the spoken name (aria-label) changes and the picture looks the same.

| Group | Ruling (24 Nov) | What the build would change | Visible? | Recommendation |
|---|---|---|---|---|
| G01 | Reset | "Reset session" → "Reset" on 7 buttons, read "Reset {name} for a new session"; the round counter read "Reset the round counter"; three lines of text that name the button. **The layout goes with A04.2**: only the words change in B18. | yes | Approve |
| G02 | Change | "Configure {entry}" and bare "Choose…" read as "Change {entry}" / "Choose {entry}"; the wizard's "Choose again" → "Change" | wizard only | Approve |
| G03 | Remove, and Delete | Shown as its own comparison with every place it touches. Option A (the suggestion): every row ✕ read "Remove {entry}"; written Remove and Delete stay. Option B: Delete for everything. Option C: leave as now. | no (A); yes (B: written Remove → Delete) | Approve A |
| G04 | Close or Cancel, by window | 31 corner ✕ read "Close {window}" or "Cancel {window}"; the shared message window "Close notice" / "Cancel question" | no | Approve |
| G05 | OK · Confirm · Cancel · Done | "Got it" → "OK" (5 messages); the bonus-slot question's "Yes"/"No" → "Confirm"/"Cancel" | yes | Approve |
| G06 | Use | An Ancestor's "Use it now" → "Use"; Great Destiny read "Use Great Destiny: …" | yes | Approve |
| G07 | Spend Void | Already as ruled on the cards (Lost Love, B01). One window button, Hida Atarasi's price question, "Spend a Void Point" → "Spend Void" | one window button | Approve |
| G08 | Reroll with {source} | "Re-roll 1s", "Re-roll selected", "Spend Luck (n/m)", Kakita's and Toku's buttons → "Reroll …" | yes | Approve |
| G09 | Clear (as it is) | The dice tray's two Clear buttons read "Clear the dice" / "Clear the other dice" | no | Approve |
| G10 | + Add {thing} | "+ Emph" → "+ Add Emphasis"; "+Book" → "+ Add Book"; the court window's "Add court" → "+ Add court" | yes | Approve |
| G11 | Check (TN 30) | Touch of the Void reads "Keep control (TN 30)" since group 2's round 2 (approved 24 Nov); the ruling's reason no longer holds | yes | **Leave as now** |
| G12 | i, "{thing} information" | The Combat tab's ⓘ and 👁 become the ring i; every i read "{thing} information" (About Ancestors, Explain: …, stance rules, and the new Armor TN and Wound penalty i's) | Combat tab | Approve |
| G14 | Increase / Decrease {thing} | Every − and + read "Increase {thing}" / "Decrease {thing}"; the Void Ring's pair gets a name | no | Approve |
| G16 | Export PDF | A saved character's menu: "Export to PDF" → "Export PDF" | yes | Approve |

The nine groups left alone (G13, G15, G17–G23) are listed on the board without mock-ups.

**The order question.** Where B18's build goes in 15b's order: next, before group 3 (recommended); after group 3, before the Search controls; or last, after group 5. Reason for "next": groups 3 to 5 add or rework buttons (B06's i for the Clan and School text, B07 and B08's Search filters and their reset, B13's About in the ⋯ menu); with B18's words on the sheet first, those groups are built with the final words and the harnesses that pin button words change once. The Reset layout waits for A04.2 either way.

## Found while making the board

- **G11 no longer fits.** The ruling read Touch of the Void as "Willpower (TN 30)" (the 21 November sheet). Group 2's round 2, approved as shown on 24 November, named it "Keep control (TN 30)", and B01 renamed the six other check buttons. Toshigoku's "Check (TN 15)" is now the only check button called "Check", and it is read aloud "Make the Toshigoku Willpower Trait Roll at TN 15, when the GM calls for it" (not starting with its words). Noted on the board, not proposed.
- **G04's shared window.** The inventory's change column gave Cancel to every window drawn by the shared message window; its reasoning (the owner's choice) gives a message Close. The board follows the reasoning.
- **G10 on a phone.** "+ Add Emphasis" is wider than "+ Emph": on a 375 px phone, a Skill card with no Emphasis yet puts "0 / 1 emphases at rank 1" on its own line (the board's phone picture shows it; the frame grows by 48 px).
- **G12 on a phone.** The ring i is larger than the ⓘ glyph: the Combat tab's Armor & TN, Weapons and Stance cards grow by 120 px on a 375 px phone (40 px on a laptop).
- **Shorter words.** "Reset" makes the six Reset cards 26 px shorter on a phone; "Use" makes the Seppun Ancestor card 32 px shorter.
- **Button looks on the Reset cards.** Three looks today (small outlined, larger outlined, capitals). B18 changes words only; the look belongs to A04.2's row pattern.

## Light checks

The board, opened in the project's QA Chromium inside the artifact skeleton at 375 × 812 (phone, touch) and 1280 × 900, light and dark: no page errors, no failed loads, no horizontal scroll at 375 px, every picture loaded, 15 decisions (`qa/mockup/board-checks.json`: 3,263,856 bytes, 77 pictures, 99 images on the page, 4 of 4 runs passed; a write and delete of one probe document in the store worked, and the store was left empty). The captures: 96 page loads of the live sheet, 0 page errors.

## Round 1: the owner's answers

To be recorded verbatim from the board's store when the owner has answered. Nothing is built before then.

| Group | Answer | Owner's note, verbatim |
|---|---|---|
| G01 | | |
| G02 | | |
| G03 | | |
| G04 | | |
| G05 | | |
| G06 | | |
| G07 | | |
| G08 | | |
| G09 | | |
| G10 | | |
| G11 | | |
| G12 | | |
| G14 | | |
| G16 | | |
| Order | | |
| Anything else | | |

## Usage

Midway through the mock-up work (about 02:40 UTC) the account read 96% of the five-hour window (other sessions; it resets 03:20 UTC on 25 November) and 6% of the weekly window (reset 01:00 UTC on 25 November). At the board’s publish (about 02:44 UTC) it read 100% five-hour and 6% weekly; the weekly meter moved under one point for this work.
