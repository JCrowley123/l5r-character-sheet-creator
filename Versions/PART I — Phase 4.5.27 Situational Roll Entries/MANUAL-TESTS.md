# Situational Roll Entries — owner checks

The published checklist is the [Situational Roll Entries — Test Checklist](https://claude.ai/code/artifact/e242e507-13ce-43aa-a557-65e11c263f1d), a Claude Doc with a
Pass / Fail / Not run choice per check; walked through the real controls on the live site on 7 October: 28/28. This file is the durable repository copy of
the same steps. Record the device and browser you test on (Windows, iPhone or both); a Windows
result is never recorded as an iPhone result.

About 15 minutes. Results so far: **Not run** on every check.

## Before you start

1. Open <https://l5r-character-sheet-creator.pages.dev/> and refresh (Ctrl+F5 on Windows; on the
   iPhone close the tab and open it again) so the new version loads.
2. On the Characters list, use **Save As a copy** of an existing character (or **Create New
   Character**), and open the copy. Nothing here changes a character, but a copy keeps your real
   ones untouched.
3. Tap **Manage** beside the character's name, so you can add Advantages and Skills. Tap **Done**
   only when a step says so.
4. How to read the roll preview: the pool at the top (for example **5k3**) is dice rolled k dice
   kept. **+1k0** adds one rolled die (5k3 becomes 6k3); **+1k1** adds one rolled and one kept
   (5k3 becomes 6k4). The new options sit in a box headed **Declare for this roll**, under
   **Advantages**, unticked.
5. To add an Advantage: Advantages & Disadvantages tab, the **choose an advantage to add**
   list. To add a Skill: Skills tab, **Add from Skill List**, then set its Rank. The 🎲 on a Skill's
   row rolls it; tapping a Trait's name on Rings & Traits rolls that Trait.

## Test 1 — Wary on an Investigation roll (normal)

Add **Wary**. Add the Skill **Investigation** at Rank 2 (its Trait is Perception). Tap its 🎲.

| # | Check | Expected |
|---|---|---|
| 1.1 | The preview offers Wary | "Wary: Detecting an ambush (against Stealth / Agility) — +1k1", unticked |
| 1.2 | Tick it | The pool rises by 1k1 |
| 1.3 | Roll | The result's breakdown lists Wary; one more die is rolled and kept |
| 1.4 | Roll Investigation again | Wary is unticked again and the pool is back to normal |
| 1.5 | Fringe: change the row's Trait to Awareness and roll | Wary is not offered (the book's roll is Investigation / Perception) |

## Test 2 — Precise Memory on an Intelligence roll

Add **Precise Memory**. On Rings & Traits, tap **Intelligence**.

| # | Check | Expected |
|---|---|---|
| 2.1 | The preview offers Precise Memory | "Recalling something exactly — +1k1"; ticking it adds 1k1 |
| 2.2 | Fringe: add the Skill **Lore** (any subject) and roll it (it also uses Intelligence) | Precise Memory is not offered (the book says an Intelligence Trait Roll) |

## Test 3 — The Social entries

Add **Imperial Spouse**, **Imperial Scribe** and **Dangerous Beauty**. Add the Skills **Courtier**
and **Temptation**.

| # | Check | Expected |
|---|---|---|
| 3.1 | Roll Courtier | Offers Imperial Spouse (+1k1, "Dealing with a member of an Imperial family") and Imperial Scribe (+1k0, "Dealing with a shugenja or an artisan"); not Dangerous Beauty |
| 3.2 | Tick both | The pool rises by 2k1 |
| 3.3 | Roll Temptation | Offers those two and Dangerous Beauty (+1k0, "Temptation with someone of the opposite sex") |
| 3.4 | Roll Investigation (from Test 1) | None of the three is offered |
| 3.5 | Your Status | Unchanged: Imperial Spouse's +0.5 Status is not part of this release |

## Test 4 — Resisting: four entries on one roll

Add **Balance**, **Clear Thinker**, **Heartless** and **Irreproachable**. On Rings & Traits, tap
**Willpower**.

| # | Check | Expected |
|---|---|---|
| 4.1 | The preview offers all four | Each +1k0, each with its circumstance |
| 4.2 | Balance's note | Tells you to add your Honor Rank to the total yourself (the sheet does not add it) |
| 4.3 | Tick all four and roll | The pool rose by 4k0; the breakdown lists all four |
| 4.4 | Roll the Dice Tray (any XkY) | The same four are offered |

## Test 5 — Balance and Failure of Bushido

Keep Test 4's entries. Add the Disadvantage **Failure of Bushido** and choose the **Honor** tenet.

| # | Check | Expected |
|---|---|---|
| 5.1 | Roll Willpower | Clear Thinker, Heartless and Irreproachable are offered; **Balance is not** (you cannot add your Honor Rank, so Balance can never apply) |
| 5.2 | Change the tenet to **Courage** and roll Willpower | Balance is offered again |

## Test 6 — Imperial Scribe's Free Raise on Calligraphy

Keep Imperial Scribe. Add the Skill **Calligraphy** at Rank 1 or more and tap its 🎲.

| # | Check | Expected |
|---|---|---|
| 6.1 | The preview | Shows an "Imperial Scribe — Free Raise available" line; the pool is unchanged (no extra dice) |
| 6.2 | The result | Repeats the Free Raise line: apply it yourself |
| 6.3 | Fringe: set Calligraphy to Rank 0 and roll it | No Free Raise line (an Unskilled Roll cannot use Free Raises, Core p.80) |
| 6.4 | Roll Courtier | No Free Raise line (only Calligraphy gets it) |

## Test 7 — Nothing sticks

| # | Check | Expected |
|---|---|---|
| 7.1 | Tick Wary on an Investigation roll, then **Cancel** the preview; roll again | Wary is unticked |
| 7.2 | Save, go back to the Characters list, open the character again, roll Investigation | Wary is unticked |
| 7.3 | Tap **Done** (Play mode) and roll Willpower | The options are still offered in Play |
| 7.4 | Remove Wary (Manage) and roll Investigation | Wary is no longer offered |

## Test 8 — Updated descriptions

| # | Check | Expected |
|---|---|---|
| 8.1 | Add **Heartless** again from the list | Its text reads: +1k0 on rolls to resist Courtier, Sincerity or Temptation used to persuade you, seduce you or change your mind |
| 8.2 | Add **Clear Thinker** again from the list | +1k0 on Contested Rolls against someone trying to confuse or manipulate you. Dragon pay 2. |

Rows already on a character keep the text they were added with.

## Test 9 — Layout on a phone (iPhone)

With all nine Advantages from Tests 1–6 still on the character, roll **Temptation**.

| # | Check | Expected |
|---|---|---|
| 9.1 | Portrait | Seven options listed; no text cut off or running off the screen; you can scroll to the Roll button and tap it |
| 9.2 | Landscape | The same |

## Optional, still owed from earlier phases

Phase 0.7's seven Android checks remain Not run (no Android phone); they are optional.
