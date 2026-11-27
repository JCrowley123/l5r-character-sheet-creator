# B18 · One Name per Button Job — mock-ups, round 1

Prepared by Claude on **25 November 2026**. Nothing is built; no application file was edited and nothing is on `main`. The board shows each ruled group on today's live sheet beside the same screen with the owner's ruling applied in the test browser only.

- **Board (private artifact):** https://claude.ai/artifact/CEVcuCGBbiamEg8spLQ3o2 now **version 2**, one change per card (version 1, the first board, published about 02:55 UTC and replaced the same morning at the owner's request). It declares the `db` capability only; answers save on the board (collection `answers`). A copy of version 2 is [mockups/B18-MOCKUPS.html](mockups/B18-MOCKUPS.html).
- **Live sheet:** `origin/main` `450362b9`, application `1f002be9…5819`, 17,773,727 bytes (15b groups 1 and 2 live).
- **The re-check** of the 21 November inventory against that sheet: [RECHECK.md](RECHECK.md).
- **How it was made:** [REPRODUCTION.md](REPRODUCTION.md), section "Stage 3 mock-ups, round 1".
- **Round 3 (27 November, after the device round):** a new board, https://claude.ai/artifact/33HybUMniMLz5BZDX6Cyf6, four cards on the owner's two device-round notes. See [Round 3](#round-3-the-device-round-notes-27-november-2026). A copy is [mockups/B18-MOCKUPS-ROUND3.html](mockups/B18-MOCKUPS-ROUND3.html). Not answered yet; nothing built.
- **Round 2 answered (25 November, 20:26 UTC):** both cards approved. Everything on B18 is approved; see [KICKOFF-B18-BUILD.md](KICKOFF-B18-BUILD.md).
- **Round 2 (25 November, evening):** the same link, **version 3**, two cards on the owner's Reset note. See [Round 2](#round-2-reset-size-and-the-i-25-november-2026). A copy is [mockups/B18-MOCKUPS-ROUND2.html](mockups/B18-MOCKUPS-ROUND2.html); round 1's page stays as [mockups/B18-MOCKUPS.html](mockups/B18-MOCKUPS.html).
- **Answered (25 November, 19:32 UTC):** 19 approved, Touch of the Void kept, build next; Reset approved as a word with a size and i pass asked for. See [the owner's answers](#round-1-the-owners-answers-25-november-2026-1926-1932-utc).

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

## Round 1: the owner's answers (25 November 2026, 19:26–19:32 UTC)

Read from the board's store (collection `answers`) at about 19:35 UTC. The 21 documents are saved as they came in `qa/answers-round1/answers/`. No `NOTE` was left.

**In short:** 19 cards approved (G03 as **Remove**), Touch of the Void keeps **Keep control (TN 30)**, B18 is built **next, before group 3**. One card, Reset, came back **Change it**: the word is approved, and the owner asked for a pass on the buttons' size and on where the i sits.

| # | Card | Change | Answer | Time (UTC) |
|---|---|---|---|---|
| 1 | `reset` | “Reset session” becomes “Reset” | **Change it** | 19:27 |
| 2 | `use` | “Use it now” becomes “Use” | **Approve** | 19:27 |
| 3 | `gotit` | “Got it” becomes “OK” | **Approve** | 19:27 |
| 4 | `yesno` | “Yes” and “No” become “Confirm” and “Cancel” | **Approve** | 19:28 |
| 5 | `reroll` | “Re-roll” is spelled “Reroll” | **Approve** | 19:28 |
| 6 | `luck` | “Spend Luck” becomes “Reroll with Luck” | **Approve** | 19:28 |
| 7 | `emph` | “+ Emph” becomes “+ Add Emphasis” | **Approve** | 19:28 |
| 8 | `book` | “+Book” becomes “+ Add Book” | **Approve** | 19:29 |
| 9 | `court` | “Add court” becomes “+ Add court” | **Approve** | 19:29 |
| 10 | `spendvoid` | “Spend a Void Point” becomes “Spend Void” | **Approve** | 19:30 |
| 11 | `combati` | The Combat tab’s ⓘ and 👁 become the ring i | **Approve** | 19:30 |
| 12 | `pdf` | “Export to PDF” becomes “Export PDF” | **Approve** | 19:30 |
| 13 | `chooseagain` | “Choose again” becomes “Change” | **Approve** | 19:30 |
| 14 | `rowx` | A row’s ✕ is read “Remove …” | **Approve “Remove”** | 19:31 |
| 15 | `cornerx` | A window’s corner ✕ is read “Close …” or “Cancel …” | **Approve** | 19:31 |
| 16 | `changechoose` | Change and Choose… read with the card’s name | **Approve** | 19:31 |
| 17 | `info` | Every i read “… information” | **Approve** | 19:31 |
| 18 | `steppers` | Every − and + read “Decrease …” / “Increase …” | **Approve** | 19:32 |
| 19 | `clear` | The dice tray’s Clear buttons say what they clear | **Approve** | 19:32 |
| 20 | `touch` | Touch of the Void keeps “Keep control (TN 30)”? | **Keep “Keep control (TN 30)”** | 19:32 |
| 21 | `order` | When to build | **Next, before group 3** | 19:32 |

**The owner's note on `reset`, verbatim:**

> I approve of the button becoming "Reset" however looking at some of the examples the buttons seem to change in size, so a pass needs to be done to make sure that they are the same size.  I have also noticed that in some of the examples like luck, or Kharmic tie where there is a tool tip "i" icon the button seems to either be right next to the reset button or all the way to the right.  I feel that this needs to be consistent, my gut says that where appropriate the "i" should be on the right hand side as to not make the buttons too crowded.  What are your thoughts?

### Claude's reply to the Reset note (25 November)

Measured on today's sheet (build `1f002be9…`, live main `450362b9`), in Play, on a phone (375 px) and a laptop (1440 px); the same on both. Script `qa/mockup/measure-reset.cjs`, results `qa/reset-measures/reset-measures.json`.

**The size: the owner is right.** The eight Reset buttons come in six looks:

| Card | Height | Letters | Capitals |
|---|---|---|---|
| Kharmic Tie, Luck | 19 px | 11.5 px | no |
| Great Destiny, Haunted | 20 px | 12.5 px | yes |
| Ancestor card | 26 px | 11.5 px | no |
| Combat round counter | 26 px | 11.2 px | yes |
| Unlucky | 28 px | 12 px | yes |
| Dark Paragon | 32 px | 13.1 px | no |

The four at 19–20 px are also under the 24 px a button needs to be easy to tap on a phone (the WCAG 2.2 minimum target size). Each of the eight has a style of its own. (Corrected the same evening: the reply first called the Combat round counter's Reset the sheet's plain button. It is not: `.combat-round-box button` sets its own size. The sheet's plain button is 34 px tall.)

**The i: the owner is right.** On the Advantage cards the i sits in three places:

- **Kharmic Tie:** at the right end of the row (B17, built on the owner's A04.2 row pattern: the choice on the left; Change and the i on the right).
- **Luck:** straight after Reset. On a laptop that leaves it in the middle of the card, 276 px from the right edge.
- **Dark Paragon, Seven Fortunes' Curse:** beside the badge and its text.

**Claude's recommendation:**

1. **One Reset for every card.** First said as "the sheet's own plain button, as on the Combat round counter (26 px tall)"; corrected in round 2 to 28 px tall (the i's height and Unlucky's), in the letters of Change and Choose… on the same cards. The other buttons on the same row take the same look: Great Destiny's Use, Unlucky's − and +.
2. **The i at the right end of the card's top row,** as Kharmic Tie has it already, on every card with an i and buttons. Reset, Use and the pips stay on the left. This is the A04.2 layout the owner set on 7 November, so A04.2 needs no change for it.
3. **Left as they are:** the i's in a list's own column (Skills) and beside a heading (Void Points, Kiho rules). They are already the same within their own kind.
4. **Mock-up first:** two cards, one change each, on the same board (round 2), then built with B18's words. A04.2's other parts (badges, summaries) still wait for the rules read.

Also seen: on Haunted the shorter word lets Reset move up beside "Ancestor content: no roll is taken." The round-2 pictures will show where each Reset lands.

## Round 2: Reset size and the i (25 November 2026)

The owner answered "Yes, mock them up" to Claude's question (25 November). The board's link is unchanged: **version 3** shows the two round-2 cards and a short list of round 1's recorded answers. Answers save in the same store (collection `answers`) as `size`, `iright` and `NOTE2`. Round 1's 21 documents stay there untouched.

**The two cards** (both pictures of every pair already carry the round-1 words the owner approved, so only one look changes):

1. **`size` · Every Reset button is the same size.**
   - **After:** 28 px tall (the height of the i beside it, and Unlucky's fingertip size), in the letters of Change and Choose… on the same cards (capitals, .78rem).
   - **The rest of the row:** the buttons beside Reset take the same look: Great Destiny's Use, Unlucky's − and +, and the Combat round counter's Next round.
   - **The answers:** Approve, **Approve, but not in capitals**, Change it, or Keep as now.
   - **Pictures:** 8 places, on a phone.
2. **`iright` · The i always sits at the right end of its row,** as Kharmic Tie's already does (B17).
   - **Where:** Luck (on a phone and on a laptop), Dark Paragon, Seven Fortunes' Curse, and a card that still needs a choice (Wealthy, Manage). Kharmic Tie is pictured as the model, unchanged.
   - **Left as they are:** the Skills list's i's and the i's beside a heading. Where Change sits in Manage also stays, for A04.2.

**Measured in the pictures** (`qa/mockup/cards-r2.json`, captured 2026-11-25 20:09 UTC, sheet `1f002be9…`):

| Card | Place | Now | After |
|---|---|---|---|
| Reset size | Kharmic Tie | 47 × 19 px, 11.52px, not capitals | 63 × 28 px, 12.48px, capitals |
| Reset size | Luck | 47 × 19 px, 11.52px, not capitals | 63 × 28 px, 12.48px, capitals |
| Reset size | Dark Paragon | 56 × 32 px, 13.12px, not capitals | 63 × 28 px, 12.48px, capitals |
| Reset size | Great Destiny | 59 × 20 px, 12.48px, capitals | 63 × 28 px, 12.48px, capitals |
| Reset size | Haunted | 59 × 20 px, 12.48px, capitals | 63 × 28 px, 12.48px, capitals |
| Reset size | Unlucky | 58 × 28 px, 12px, capitals | 63 × 28 px, 12.48px, capitals |
| Reset size | Ancestor card | 52 × 26 px, 11.52px, not capitals | 63 × 28 px, 12.48px, capitals |
| Reset size | Combat round counter | 59 × 26 px, 11.2px, capitals | 63 × 28 px, 12.48px, capitals |
| i place | Luck, on a phone | 91 px from the card's right edge (card 329 px) | 13 px |
| i place | Luck, on a laptop | 324 px from the card's right edge (card 562 px) | 13 px |
| i place | Dark Paragon | 220 px from the card's right edge (card 329 px) | 13 px |
| i place | Seven Fortunes’ Curse | 223 px from the card's right edge (card 329 px) | 13 px |
| i place | A card that needs a choice (Manage) | 100 px from the card's right edge (card 329 px) | 13 px |
| i place | Kharmic Tie, already like this (no change) | 13 px from the card's right edge (card 329 px) | 13 px |

Every Reset ends at 63 × 28 px. Rows with today's four smallest Resets (Kharmic Tie, Luck, Great Destiny, Haunted) get 8 or 9 px taller; Dark Paragon's gets 4 px shorter. Every i ends 13 px from its card's right edge, where Kharmic Tie's is.

**How the after is drawn:** `qa/mockup/proposals-r2.cjs` adds one style sheet in the test browser. The i rule needs `!important`, because the sheet's one-info-pattern rule sets the i's left margin at a higher specificity; a build would change that rule itself.

**Light checks** (`qa/mockup/round2-board-checks.json`): pass. At 375 × 812 and 1280 × 900, in light and dark: no page errors, no failed loads, no horizontal scroll (375/375, 1280/1280), 28 of 28 pictures loaded, 2 answers. The captures: 28 page loads of the live sheet, 0 errors.

### Round 2: the owner's answers (25 November 2026, 20:25–20:26 UTC)

Read from the board's store at about 20:30 UTC. The two documents are saved as they came in `qa/answers-round2/answers/`. Round 1's 21 documents were read again and are unchanged. No `NOTE2` was left.

| Card | Answer | Time (UTC) | Owner's note, verbatim |
|---|---|---|---|
| `size` · Every Reset button is the same size | **Approve** | 20:25 | (none) |
| `iright` · The i always sits at the right end of its row | **Approve** | 20:26 | (none) |

**Every B18 card is now settled.** Both looks are approved as shown: 28 px tall and in capitals; the i at the right end of its row. With round 1 this completes the owner's Reset note. What to build is in [KICKOFF-B18-BUILD.md](KICKOFF-B18-BUILD.md).

## Round 3: the device-round notes (27 November 2026)

The owner checked all 24 device cards (Pass on the iPhone and the laptop) and accepted B18, B18.1 and B18.2 ([DEVICE-CHECKS.md](DEVICE-CHECKS.md)), with two notes, verbatim:

> I have noticed when picking unlucky the rank is not the same picker as any other rank picker

> I think we can remove the "i" tool tip from lucky as I don't think there is any extra information that it provides

and in the chat: "I have rerun the checks and the test pass but I think we should remove the "i" from lucky and I think the rank picker for unlucky need to chandd".

- **Board (private artifact):** https://claude.ai/artifact/33HybUMniMLz5BZDX6Cyf6, version 1 (27 November 2026, label "Round 3 board"). It declares the `db` capability only; answers save on the board (collection `answers`: `lucki`, `unlucky`, `imbalance`, `emptybar`, `NOTE3`). The store was empty after publishing. A copy is [mockups/B18-MOCKUPS-ROUND3.html](mockups/B18-MOCKUPS-ROUND3.html).
- **Sheet pictured:** the group's tip as the owner checked it (`claude/release-15b-b18-2`, application `56b280e2…aab1`), opened from the file in the project's test browser; one character (the inventory character plus Perceived Honor, Elemental Imbalance, Dependant and Antisocial). "After" is drawn in that browser only (`qa/mockup/proposals-r3.cjs`); no application file was edited.

**What was measured first** (`qa/mockup/cards-r3.json` and two read-only probes):

- **Luck's i** is Phase 4.54's i, added because Luck's Reset carries an explanatory hover line. Its window is headed “Reset” (B18) and says only “Restore Luck to its per-session maximum”. It is the only Reset with an i of that kind: Kharmic Tie's (B17) and Dark Paragon's i's explain the Advantage; Great Destiny, Haunted and Unlucky have none.
- **The sheet has three kinds of rank window.** Rank cards (Luck, Magic Resistance, Kharmic Tie's second step: a fixed ladder of 3 or 5 Ranks); a number box headed “Choose a Rank” with “<Name> — choose how many Ranks.”, a bold label and a note (Wealthy, Perceived Honor: no top Rank); and Phase 4.5.2's Disadvantage window (Unlucky, Elemental Imbalance's first step), headed by the entry's name, with its label twice, “step 1 of N”, and an empty bar. The empty bar is that window's message box (`#advConfigNote`), shown with nothing in it unless a step has a note or a value is missing; every Disadvantage window without a note has it (Dependant, Antisocial, Elemental Imbalance's Element step among them).
- **Unlucky has no top Rank.** The audit's agreed design (D05): “Use a positive whole-number rank input without inventing a rank cap” and “The entry states no maximum; do not infer Luck's three-rank cap.” So the card's after is the number box (Wealthy's and Perceived Honor's look), not Luck's cards; the card says why.

**The cards** (one change per card, Now beside After, Approve / Change it / Keep as now; Approve recommended on each):

| Card | Title | Places |
|---|---|---|
| `lucki` | Luck’s i goes | Luck on a phone; on a laptop (Play) |
| `unlucky` | Unlucky’s rank window looks like the other rank windows | Unlucky's window on a phone; on a laptop; Perceived Honor's window for comparison |
| `imbalance` | Elemental Imbalance’s Rank step looks the same | its first step (phone) |
| `emptybar` | The empty bar goes from the other Disadvantage windows | Dependant; Antisocial; Elemental Imbalance's second step (phone) |

The last two are the sheet-wide question (Phase 15: a pattern changed in one place is asked everywhere it reaches). Unlucky's note is the sheet's own catalogue line for it (Phase 4.5.3's correction, Core p.162): “Once per session for each Rank, the GM may force a reroll of one of your rolls, keeping the second result.” Elemental Imbalance gets no note (it has none today). In the pictures, the redrawn box keeps the caret where today's window puts it.

**How the after is drawn:** `qa/mockup/proposals-r3.cjs`. Luck's i is hidden with one style rule (`!important`, because Release 15a A04's info rule sets the i's display at a higher specificity; a build would stop Phase 4.54 adding that i rather than hide it). The two rank windows are redrawn with the elements and classes Wealthy's window uses (`.adv-rank-label`, `.adv-rank-input`), so the sheet's own styles draw them. The empty bar is hidden by one rule while it is empty (`#advConfigNote:empty`), so a message still shows.

**Light checks** (`qa/mockup/round3-board-checks.json`): pass. At 375 × 812 and 1280 × 900, in light and dark: no page errors, no failed loads, no horizontal scroll (375/375, 1280/1280), 17 of 17 pictures loaded, 4 answers. The captures: two page loads of the tip, 0 errors.

## Usage

Midway through the mock-up work (about 02:40 UTC) the account read 96% of the five-hour window (other sessions; it resets 03:20 UTC on 25 November) and 6% of the weekly window (reset 01:00 UTC on 25 November). At the board’s publish (about 02:44 UTC) it read 100% five-hour and 6% weekly; the weekly meter moved under one point for this work.
