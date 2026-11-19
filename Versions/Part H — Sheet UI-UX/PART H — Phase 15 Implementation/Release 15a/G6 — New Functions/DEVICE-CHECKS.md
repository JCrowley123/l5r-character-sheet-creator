# G6 · device round

19 November 2026 (Claude). The owner's checklist is a Claude Doc: [G6 Device Round Checklist](https://claude.ai/artifact/3XbGrSnc5z1T9uM2KUwtbz), with Pass / Fail / Not run on iPhone and laptop for each check and Accept / Revise / Remove for each unit. This file mirrors its checks; the owner's results are recorded here when they come.

| Site | What it has |
|---|---|
| https://claude-release-15a-a19.l5r-character-sheet-creator.pages.dev/ | G5 as live, plus A19 |
| https://claude-release-15a-a20.l5r-character-sheet-creator.pages.dev/ | A19, plus A20 |
| https://l5r-character-sheet-creator.pages.dev/ | Live, to compare with |

## A19 · Undo the last Void spend (Play, Combat page, Combat active unless said)

1. Spend +1k1: a line under the buttons with Undo and "Spent: +1k1 on your next roll."
2. Undo: Void Points back, every button available, "Nothing spent this round", the line reads "Undone: …" with no button.
3. Spend +1k1, make any Skill roll, come back: the line has gone.
4. With Touch of the Void: spend +1k1, Undo, then a Skill roll: no Willpower roll after it.
5. With Touch of the Void: spend +10 TN; its Willpower roll opens; Cancel: the line says it was not made; Undo puts the point and Armor TN back.
6. Spend +1k1, open a Skill roll's preview and Cancel, come back: the line is still there and Undo works.
7. Spend, Next Round; spend, Reset: the line goes each time.
8. Reduce damage by 10 (25), then Undo: Wounds and the point back.
9. Spend, double-tap Undo: only one point back.
10. The line is easy to find and read under the buttons, not hidden by the corner buttons once scrolled.

## A20 · A Trait for one Skill roll (Play, Skills page)

1. A trained Skill's roll (Intimidation): the Trait line is a drop-down on the usual Trait; dice as before.
2. The drop-down: usual first, then book-named Traits with their pages, then the other Traits, each with its value.
3. Another Trait: dice and Roll button change; outlined, "This roll only" under it (and the page, if book-named).
4. Tick a Void Point or a declaration, then change the Trait: the tick stays; the dice follow.
5. Roll: the chosen Trait's dice; an Emphasis re-roll still offered where the Skill has one.
6. The same Skill's roll again: back on the usual Trait.
7. Another Trait, Cancel, open again: back on the usual Trait.
8. Untrained Skills → Athletics: the drop-down too, and the Unskilled line stays.
9. A Trait roll and a weapon attack: no drop-down.
10. Manage → Skills afterwards: every Skill keeps its own Trait.

## Results (the owner, 19 November 2026, in the checklist)

| Unit | iPhone | Laptop | Decision |
|---|---|---|---|
| A19 | 9 Pass, check 8 Fail | 9 Pass, check 8 Fail | **Revise** |
| A20 | 10 Pass | 10 Pass | **Accept** |

The owner's notes on A19, verbatim:

> "When I ran test 8 it failed.
>
> There was no undo button.  I suspect that's because I had touch of the void, and so when I applied the damage reduction it asked me for the willpower save, once I did that there was no undo.
>
> Maybe the roll then advanced the process and so undo was not being offered.
>
> I tested this without the disadvantage touch of the void and the undo button was there and worked as expected
>
> I also noticed issue with the text wrapping."

With a phone screenshot of the Combat page's damage row: "Reduce by 10 & take Wounds" wrapped onto four lines and Cancel running past the card's right edge.

## Review (Claude, 19 November 2026)

**Check 8.** The owner's reading is right. With Touch of the Void, damage reduction opens the Willpower roll at once (it makes no roll of its own). Rolling it opened the result window, and A19 ends Undo at any roll the sheet makes, as approved ("One you rolled is a roll, so Undo has already gone"). Without Touch of the Void there is no such roll, so Undo stayed, as the owner found. The checklist's check 5 said to cancel that roll; check 8 did not, so the check met the rule rather than a defect. The question is whether the rule is right: Touch of the Void's roll is part of the spend, not the next roll the spend is used on, and a player who spent by mistake meets it straight away. Proposed revision: Touch of the Void's own Willpower roll does not end Undo; Undo then also says the Willpower roll made for that spend no longer counts (the sheet does not track Dazed, so the player tells the GM). Every other roll still ends Undo.

**Text wrapping.** Not A19's: the damage row is the same on the live app (measured at 390 px, touch: the Apply button 86 px tall over four lines, Cancel from 309 to 388 px against the card's right edge at 352 px; `qa/damage-row-live-a08-phone.png`), from Part C Feature 4 and Phase 1.6. A19 adds nothing to that row. Proposed: a small screen-only unit of its own in G6 (A19.1, as A03.1 and A04.1 were), laying the row out to fit a phone (the amount on one line, the two buttons beneath), so A19 stays removable by itself.

## The owner's choices, 19 November 2026 (verbatim, in the Claude session)

| Question | Answer |
|---|---|
| A19, check 8: should Touch of the Void's own save leave Undo in place? | "Keep Undo (Recommended)" |
| The damage row on the phone | "New unit A19.1 in G6 (Recommended)" |

- **A19 is revised:** Touch of the Void's own Willpower save no longer ends Undo; Undo then says the save made for that spend no longer counts. Every other roll still ends Undo. A19 is re-checked (its harness gains a check for this), and A20, stacked on it, is rebuilt and re-checked on top.
- **A19.1 joins G6:** the Combat page's damage row laid out to fit a phone, screen-only, its own unit (marker to be assigned when built), mock-up first.
- **A20 is accepted** as built.
