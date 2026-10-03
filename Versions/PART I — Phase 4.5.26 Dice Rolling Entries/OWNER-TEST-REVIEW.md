# Owner's Windows test review — 3 October 2026

The owner reported that the checklist tests passed, supplied 15 screenshots,
and clarified that testing was **Windows only**. Record the Windows checklist
as **Pass (owner report)**; the iPhone checklist remains **Not run**. No defect
was identified in the supplied images. This does not change the app or its build.

## What the screenshots directly demonstrate

All filenames below begin `Screenshot 2026-10-03 ` and end `.png`.

| Time(s) | Visible result |
|---|---|
| 110744 | Stealth, Kenjutsu, Lore: History and Perform: song remain purchased Rank 0, with 0 XP shown. The Windows desktop is visible. |
| 110937, 110957 | Crafty gives Stealth effective Rank 1 and 3k2; a 10 explodes to 11. Kept dice 11 and 3 give 14. |
| 111036 | Crab Hands gives Kenjutsu effective Rank 1 and 3k2; 12 and 7 give 19. |
| 111052, 111125 | Sage gives Lore: History effective Rank 1 and 3k2; 18 and 7 give 25. |
| 111140 | Sensation gives Perform: song effective Rank 1 and a 3k2 preview. |
| 111328, 111347 | The Katana attack uses Kenjutsu 1 and 3k2 with Crab Hands. The result is 15 + 3 = 18, with ordinary explosion. |
| 111411, 111510 | The Shuriken attack uses Ninjutsu 1 and 3k2 with Crab Hands. The result is 18 + 9 = 27, with ordinary explosion. |
| 111933, 111949 | Sensation and Gaijin Name coexist on Perform: song. Visible chains stop after one extra throw. Totals 24 and 31 correctly sum the kept dice; the limit of 20 applies per die, not per roll. |
| 112016 | A Gaijin Name die shows 10 → 10 and stops at 20. Kept dice 20 and 8 give 28. |
| 112258 | Courtier's result displays Gaijin Name, two eligible 1s for Gossip Emphasis, and an available Luck action. This image precedes a reroll. |

The captures do not independently show the unlifted baseline, Void expenditure
and cancellation, the Untrained Skills list route, Crafty alone on Shuriken,
which Advantages were held for the overlap check, completed Luck/Emphasis
rerolls, save/reopen, or iPhone portrait/landscape. The Windows checklist result
for actions not pictured relies on the owner's overall pass report. Existing
automated evidence remains 3,840/3,840 overall and 129/129 on the deployed page.

No new application change or regression run was required for this documentation
update. The owner subsequently accepted the Windows results as sufficient to
proceed to the next phase. The release is accepted; the outstanding iPhone
visual/layout check is non-blocking and remains untested.
