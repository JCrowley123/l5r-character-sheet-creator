# Resistance, combined design: five versions

16 November 2026. Claude, at the owner's request ("create 5 versions of the new combined mock-up … rank each … provide a list of pros and cons … your overall recommendation with reasonings"). Follows [RESISTANCE-MOCKUPS.md](RESISTANCE-MOCKUPS.md). Status: **awaiting the owner's choice. Mock-ups only; nothing is built.**

## How the direction got here (the owner's steps, 16 November)

1. Of the first five mock-ups, A (buttons in a row) was recommended.
2. The owner noted that E resembled their original idea, **a resist button beside each ability** (recorded on 7 October 2026 in Phase 4.5.28's README as "row badges that open a dedicated roll"; the same suggestion produced Wary's Spot ambush and Precise Memory's Recall). View given: it cannot carry resistance alone (the ability must be remembered first, bonuses stack, many abilities name no roll, Honour has no row), but it is the right companion to A.
3. The owner proposed that **the list follow the roll**: only the resistances relevant to the Trait, Ring or Skill roll opened, so an Earth roll does not offer Fear or Temptation. View given: agreed, with a "Something else…" way out so a missing rule or an unusual call never hides a bonus.
4. The owner proposed a read of all the sourcebooks for resistance rules. Sized and estimated (see the shared notes' `RESISTANCE-RULES-READ-BRIEF.md`); not started.

## The board

- [mockups/COMBINED-RESISTING-MOCKUPS.html](mockups/COMBINED-RESISTING-MOCKUPS.html), published privately at https://claude.ai/artifact/5qERTdvwS5VTPM8iZeoWb5.
- Drawn inside the real app (the A12 build `f7678633…bc41` with `RS15.paused`), phone 390 × 844 and laptop 1440 × 1000. Script and measurements: `qa/resistance-mockup/combined-mockups.cjs`, `combined.json`, `combined-board-body.html`. No application file was edited.
- Character: Honour 6; Balance, Clear Thinker, Wary, Touch of the Spirit Realms (Tengoku); Missing Limb (not a resistance; left as it is).
- **Examples, not rulings:** "Willpower: Fear, Intimidation, Temptation" is an example. "Earth Ring: Shadowlands Taint" is real (the sheet's Tengoku rule names Earth Ring rolls).

## Ranking and measurements (phone)

| Rank | Version | Willpower roll | Agility roll | Unexpected roll | Beside the abilities | Height, Willpower | Roll button on screen |
|---|---|---|---|---|---|---|---|
| 1 | **Likely first, the rest one tap away** | 3 buttons | one quiet line | one tap on "Something else…" | a button where the book names a roll; a reminder elsewhere | 225 px | Yes |
| 2 | Short list that shows what each adds | 3 rows with bonuses | one quiet line | one tap | as version 1 | 317 px | No, 103 px below |
| 3 | Strict by roll, a button on every ability | 3 buttons | nothing | not offered in the roll | a button on every ability; asks which roll when none is named | 225 px | Yes |
| 4 | The page asks, the preview stays quiet | one quiet line | one quiet line | the quiet line opens the list | buttons on every ability and on the Honour card | 193 px | Yes |
| 5 | Everything shown, likely ones first | 3 buttons, 1 dimmed | 4 dimmed | always shown | reminders only | 300 px | No, 86 px below |
| | Live app today | 4 boxes with notes | 4 boxes | always shown | Tengoku's reminder | 457 px | No, 242 px below |

Other measured heights: version 1 Earth 225, Agility 193, after "Something else…" 300, after choosing Temptation 324; version 3 Agility 143; today's Earth Ring roll 552 (Roll button 338 px below). On the laptop every version keeps the Roll button on screen.

## For and against

**1 · Likely first, the rest one tap away.** For: the roll shows only what fits it; nothing can be lost (a missing rule or unusual call costs one tap); small, Roll button on screen; a button only where the book names one roll, so no "which roll?" question; the ability's card says when it applies. Against: two treatments beside abilities; one quiet line on every ordinary roll; "likely" depends on the rules table; the block grows after "Something else…".

**2 · Short list that shows what each adds.** For: shows which abilities each effect brings before the tap; same safeguard; a plain list. Against: taller where it matters, and the Roll button starts off the phone's screen; repeated words; more to read at the moment of the roll.

**3 · Strict by roll, a button on every ability.** For: the cleanest preview (nothing on rolls that resist nothing); every ability treated alike; closest to the owner's original idea. Against: no way out inside the roll; abilities with no named roll need a "Which roll?" step; Honour has no card on that page.

**4 · The page asks, the preview stays quiet.** For: the quietest preview; each bonus tied to its source, including Honour; the band says what the roll is for. Against: on a roll opened the usual way the effects are a tap away and easy to pass over; the player must be on the right page first; every button needs a roll to open; the most new controls.

**5 · Everything shown, likely ones first.** For: nothing can be missed; a wrong rule only changes the order; simplest to build. Against: an Earth roll still lists Fear and Temptation, which the owner called wrong; buttons on every ordinary roll and the Roll button off the phone's screen; grows with every gift; no way from an ability to its roll.

## Recommendation: version 1

- It is the owner's ideas with one safeguard: the list follows the roll, abilities carry buttons, and "Something else…" means nothing can be lost.
- It serves the player who forgets: likely effects in sight, the rest one tap away, and the ability's card says when it applies.
- It is the smallest version that still reminds, with the Roll button on screen.
- It does not pretend to know the roll: a button appears only where the book names one.
- It can borrow later: if the rules read finds one roll for Fear, the Honour card can take version 4's buttons.

## If approved

1. The rules read (after the 18 November reset) fills in which effects belong to which roll and which abilities get a button.
2. The build as its own group, with A12 removed by its remover. A08 is accepted and can go ahead separately on the owner's word.
