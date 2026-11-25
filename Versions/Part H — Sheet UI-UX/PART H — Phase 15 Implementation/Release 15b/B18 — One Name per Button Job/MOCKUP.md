# B18 · One Name per Button Job — mock-ups, round 1

Prepared by Claude on **25 November 2026**. Nothing is built; no application file was edited and nothing is on `main`. The board shows each ruled group on today's live sheet beside the same screen with the owner's ruling applied in the test browser only.

- **Board (private artifact):** https://claude.ai/artifact/CEVcuCGBbiamEg8spLQ3o2 now **version 2**, one change per card (version 1, the first board, published about 02:55 UTC and replaced the same morning at the owner's request). It declares the `db` capability only; answers save on the board (collection `answers`). A copy of version 2 is [mockups/B18-MOCKUPS.html](mockups/B18-MOCKUPS.html).
- **Live sheet:** `origin/main` `450362b9`, application `1f002be9…5819`, 17,773,727 bytes (15b groups 1 and 2 live).
- **The re-check** of the 21 November inventory against that sheet: [RECHECK.md](RECHECK.md).
- **How it was made:** [REPRODUCTION.md](REPRODUCTION.md), section "Stage 3 mock-ups, round 1".

The owner's rule for all of B18 (24 November, verbatim): "I think as a rule of thumb, before anything is changed or built I want to see a mock up comparing how it is now, to how it will look after the change".

## Round 1, revised: one change per card (25 November 2026)

The owner's words on the first board (25 November 2026, verbatim):

> That board was very complicated and I found it hard to follow, please break it down into simpler and make it easier to understand and digest so that I can clearly see what I am approving at each stage.
>
> It may be easier to show me 1 button change at a time with the side by side comparison

The board was rebuilt and republished at the same link as **version 2** (25 November 2026, label "One change per card"); version 1 is in the artifact's history and in this branch's history (commit `b6cc67ad`, `mockups/B18-MOCKUPS.html`). Nobody had answered on version 1 (the store was empty before and after).

What changed on the board:

- **One card per button change, 21 cards.** Each card has a one-line title that says the whole change ("“Reset session” becomes “Reset”"), one line saying where it is, then each place it shows as a close-up of the live sheet on a phone: **Now** beside **After** (one above the other on a phone screen), with the changed button outlined in blue. Under a pair, one line says what a screen reader hears now and after, where that changes too.
- **One answer per card**: Approve, Change it (a box opens for what it should be instead), or Keep as now. G03's card offers "Use “Delete” instead" as well; Touch of the Void's card asks whether to keep "Keep control (TN 30)" (recommended) or use the ruling's "Check (TN 30)".
- **Three parts:** 13 changes you can see; 6 changes you cannot see (only a screen reader or voice control hears them; one picture, marked "looks the same"); 2 questions (Touch of the Void, and when to build).
- **Shorter words** throughout; the re-check, the inventory's corrections and the measurements stay in these records rather than on the board.
- Two questions the test characters cannot reach (the bonus spell slot question, Hida Atarasi's price question) were drawn in the sheet's own question window, filled the way its own code fills it, with the sheet's own words.

| # | Card (answer id) | Group | Pictured places |
|---|---|---|---|
| 1 | “Reset session” becomes “Reset” (`reset`) | G01 | Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky, the Ancestor card, the Combat round counter (heard only) |
| 2 | “Use it now” becomes “Use” (`use`) | G06 | Seppun's Ancestor card; Great Destiny (heard only) |
| 3 | “Got it” becomes “OK” (`gotit`) | G05 | the Kiho rules window |
| 4 | “Yes” and “No” become “Confirm” and “Cancel” (`yesno`) | G05 | the bonus spell slot question (drawn) |
| 5 | “Re-roll” is spelled “Reroll” (`reroll`) | G08 | the Emphasis reroll, both steps |
| 6 | “Spend Luck” becomes “Reroll with Luck” (`luck`) | G08 | a roll's result with Luck |
| 7 | “+ Emph” becomes “+ Add Emphasis” (`emph`) | G10 | Calligraphy, Defense |
| 8 | “+Book” becomes “+ Add Book” (`book`) | G10 | the Library page |
| 9 | “Add court” becomes “+ Add court” (`court`) | G10 | Darling of the Court's window |
| 10 | “Spend a Void Point” becomes “Spend Void” (`spendvoid`) | G07 | Hida Atarasi's question (drawn) |
| 11 | The Combat tab's ⓘ and 👁 become the sheet's ring i (`combati`) | G12 | Armor & TN, Weapons, a weapon, a stance |
| 12 | “Export to PDF” becomes “Export PDF” (`pdf`) | G16 | a saved character's ⋯ menu |
| 13 | “Choose again” becomes “Change” (`chooseagain`) | G02 | not pictured (the wizard's later screens) |
| 14 | The ✕ on a row is read as “Remove …” (`rowx`) | G03 | a Skill, an Emphasis, an Advantage, an item |
| 15 | The ✕ in a window's corner is read as “Close …” or “Cancel …” (`cornerx`) | G04 | a Skill's i window, a roll preview, a notice |
| 16 | Change and Choose… are read with the card's name (`changechoose`) | G02 | Wealthy, Luck |
| 17 | Every i is read as “… information” (`info`) | G12 | Luck's i, the Ancestor section's i, Armor TN's i |
| 18 | Every − and + is read as “Decrease …” and “Increase …” (`steppers`) | G14 | Honour, the Void Ring |
| 19 | The dice tray's Clear buttons say what they clear (`clear`) | G09 | the dice tray |
| 20 | Touch of the Void: keep “Keep control (TN 30)”? (`touch`) | G11 | Touch of the Void (now, and with "Check (TN 30)") |
| 21 | When should these changes be built? (`order`) | — | — |

Light checks on version 2 (`qa/mockup/cards-board-checks.json`): 704,280 bytes, 67 pictures; at 375 × 812 and 1280 × 900, light and dark: no page errors, no failed loads, no horizontal scroll, every picture loaded, 21 answers. The close-ups: 41 places, each opened twice on the live sheet (82 page loads), 0 errors (`qa/mockup/cards.json`).

## Round 1, first board (version 1, superseded): what it proposed

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

## Light checks (version 1)

The board, opened in the project's QA Chromium inside the artifact skeleton at 375 × 812 (phone, touch) and 1280 × 900, light and dark: no page errors, no failed loads, no horizontal scroll at 375 px, every picture loaded, 15 decisions (`qa/mockup/board-checks.json`: 3,263,856 bytes, 77 pictures, 99 images on the page, 4 of 4 runs passed; a write and delete of one probe document in the store worked, and the store was left empty). The captures: 96 page loads of the live sheet, 0 page errors.

## Round 1: the owner's answers

To be recorded verbatim from the board's store (collection `answers`, one document per card id) when the owner has answered. Nothing is built before then.

| # | Card | Answer | Owner's note, verbatim |
|---|---|---|---|
| 1 | `reset` | | |
| 2 | `use` | | |
| 3 | `gotit` | | |
| 4 | `yesno` | | |
| 5 | `reroll` | | |
| 6 | `luck` | | |
| 7 | `emph` | | |
| 8 | `book` | | |
| 9 | `court` | | |
| 10 | `spendvoid` | | |
| 11 | `combati` | | |
| 12 | `pdf` | | |
| 13 | `chooseagain` | | |
| 14 | `rowx` | | |
| 15 | `cornerx` | | |
| 16 | `changechoose` | | |
| 17 | `info` | | |
| 18 | `steppers` | | |
| 19 | `clear` | | |
| 20 | `touch` | | |
| 21 | `order` | | |
| — | Anything else (`NOTE`) | | |

## Usage

Midway through the mock-up work (about 02:40 UTC) the account read 96% of the five-hour window (other sessions; it resets 03:20 UTC on 25 November) and 6% of the weekly window (reset 01:00 UTC on 25 November). At the board’s publish (about 02:44 UTC) it read 100% five-hour and 6% weekly; the weekly meter moved under one point for this work.
