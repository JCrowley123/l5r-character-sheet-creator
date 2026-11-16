# Resistance, effect first: five mock-ups

16 November 2026. Claude, at the owner's request ("create 5 mock ups for this new unit providing pros and cons for each; rank them and provide your final recommendation with reasons"). Follows [A12-REVISION-OPTIONS.md](A12-REVISION-OPTIONS.md), where the recommendation became Option 3 (ask what is being resisted). Status: **awaiting the owner's choice. Mock-ups only; nothing is built.**

- **Board:** [mockups/RESISTANCE-MOCKUPS.html](mockups/RESISTANCE-MOCKUPS.html), published privately at https://claude.ai/artifact/KEvca7UrLr7VyEXxnkX7fR.
- **How they were drawn:** inside the real app (the A12 build `f7678633…bc41` with `RS15.paused`, so the starting point is the live app's list), with mock markup placed in the open roll preview. Script and measurements: `qa/resistance-mockup/` (`resistance-mockups.cjs`, `mockups.json`, `board-template.html`; it uses `qa/mockup/common.cjs`, `run.sh` and `embed.py`). No application file was edited.
- **Character:** the A12 test character with Honour 6, Balance and Clear Thinker (Heartless and Irreproachable taken out), plus its Missing Limb choice, which is not a resistance and stays as it is in every design.
- **Sizes:** phone 390 × 844 (touch), laptop 1440 × 1000.

## What all five share

- Only the effects the character has something for: Intimidation, Temptation and Fear for every samurai (Honour); poison, Taint and the rest only with a gift.
- The sheet adds what certainly applies, once, and says so ("Added: Honour +6 · Balance +1k0"); the app's own modifier list still names each bonus with its page reference.
- Anything only the player can judge is asked as a tick box (the example is Clear Thinker), never added silently.
- Where each of the fifteen abilities sits, and whether it is added or asked, is the owner's ruling. The mock-ups' placements are examples.

## Ranking and measurements (phone, this character)

| Rank | Mock-up | Taps | In sight before a tap | Block height at rest → after choosing | Roll button on screen at open |
|---|---|---|---|---|---|
| 1 | **A · Buttons in a row** | 1 | The effects | 218 → 317 px | Yes |
| 2 | B · Open list that shows what each adds | 1 | The effects and every bonus | 310 → 380 px | No, 96 px below |
| 3 | C · One closed line (A12's line, effect first) | 2 | The effects, in small print | 182 → 425 px (open) | Yes |
| 4 | D · Drop-down | 2, through the phone's picker | Nothing | 220 → 319 px | Yes |
| 5 | E · A Resist… button on the sheet | 2, before the preview | One button on the page | not in the preview → 304 px | Yes |
| | Live app today | 1 per box | Every box and note | 457 px | No, 242 px below |
| | A12 as built | 2 | A count | 180 px | Yes |

On the laptop every design keeps the Roll button on screen at open. With a gift (Jurojin's Blessing), A gains a fourth button on a second row: 298 px after choosing it.

## For and against

**A · Buttons in a row.** For: nothing to remember, the effects are named on every roll; one tap to declare, one to clear; small, and the Roll button stays on screen; a gift is its own button, which is itself the reminder; 44 px touch targets. Against: the row is there on every ordinary roll; several gifts mean two or three rows on a phone; which abilities sit behind a button shows only after the tap; buttons are a new control in the preview.

**B · Open list that shows what each adds.** For: the best reminder, since the abilities for each effect show before choosing; one tap; a plain list. Against: the tallest at rest, and it pushes the Roll button off the phone's screen (the complaint A12 set out to fix); a row per gift; repeated words; heavy on rolls that resist nothing.

**C · One closed line.** For: the smallest at rest; reuses the line already built and device-checked; quiet on ordinary rolls. Against: choices behind a tap, so two taps; easy to pass over; the tallest when open; against the owner's preference for play information in sight.

**D · Drop-down.** For: one line however many effects; a standard, accessible control. Against: reads "Nothing" at rest, so it reminds of nothing; two taps and the phone's picker covers the preview; cannot show what each effect adds; easy to overlook.

**E · A Resist… button on the sheet.** For: starts from the situation, which helps most when the player does not know which roll to make; ordinary rolls keep a clean preview. Against: needs a ruling on which roll each effect opens; a roll opened the usual way gets no help, so it needs another design as well; a new control on the page; the largest build.

## Recommendation: A · Buttons in a row

- It serves the owner's aim directly: a player who forgets sees the effects on every roll and taps the one the GM named; the sheet works out which abilities apply.
- It is the cleanest design that keeps everything in sight: C and D are as small but hide the choices; B shows more but pushes the Roll button off the phone.
- It answers the poison question: a gift adds a button; no gift, no button, and the roll is plain Earth.
- B's strength is kept: the bonuses are named at the tap, and the app's own list gives page references.
- E could be added later on top of A (Resist… would open the preview with a button already pressed).
- Its cost: a row of buttons on every ordinary roll, and more rows with several gifts. C is the fallback with the same behaviour behind one line.

## If approved

1. The rules table for the owner's rulings: one line for each of the fifteen abilities (effect or effects; added or asked).
2. The build as its own group, with A12 removed by its remover. A08 is accepted and can go ahead separately on the owner's word.
