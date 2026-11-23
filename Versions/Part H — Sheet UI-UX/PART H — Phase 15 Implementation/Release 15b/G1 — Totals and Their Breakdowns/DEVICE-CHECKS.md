# Release 15b group 1 · device round

21 November 2026 (Claude).

- **The owner's checklist** is a Claude Doc: [15b Group 1 Device Round Checklist](https://claude.ai/artifact/DZshih7839JogjPMKkzBiR). It has Pass / Fail / Not run on iPhone and on laptop for each check, and Accept / Revise / Remove for each unit.
- **This file** mirrors its checks. The owner's results are recorded here, verbatim, when they come.

| Site | What it has |
|---|---|
| https://claude-release-15b-b17.l5r-character-sheet-creator.pages.dev/ | Release 15a as live, plus A14, B04, B14 and B17 (build `5ac767c6…574d`) |
| https://l5r-character-sheet-creator.pages.dev/ | Live, to compare with |

B17 keeps "Reset session"; B18 decides one word for every such button later.

## A14 · One net Wound penalty

**Set up.** In Manage, add Strength of the Earth and Low Pain Threshold. In Play, on the Combat page, take Wounds until the track reads Nicked.

1. **The Wounds line** reads "Nicked — TN of all rolls +5 — … wound points", with an i at its end and no entry names in brackets.
2. **Tap the i.** Nicked's window lists:
   - Nicked +3;
   - Low Pain Threshold +5 (Disadvantage, Core Rulebook p.160);
   - Strength of the Earth −3 (Advantage, Core Rulebook p.154);
   - TN of all rolls +5;
   - then Nicked's rule.
3. **Tap Grazed on the bar.** Its window has its own sums: Grazed +5, +5, −3, TN of all rolls +7.
4. **Quick Access.** The Wounds line is the same, with its own i, which opens Nicked's window.
5. **A Defense roll.** The preview has one Wound Penalty row, "-5 to total — Nicked", and no "3 → 5 … already included" row.
6. **Remove Low Pain Threshold.** The line reads "Nicked — No TN penalty", still with the i, and the window's total is "none". Then remove Strength of the Earth: there is no i.
7. **With both entries and 0 Wounds (Healthy):** there is no i.

## B04 · One Armor TN breakdown

**Set up.** In Manage, add Blind, with no armour. Switch to Play.

1. **Quick Access.** Armor TN has an i, and there is no "Blind: Reflexes …" line under it.
2. **Tap that i.** The window is titled "Armor TN", subtitled "… to be hit", and lists:
   - Base: Blind, Reflexes 2 + 5, with Blind's rule and Core Rulebook p.156;
   - Armor TN Bonus +0;
   - the Armor TN.
3. **On the Combat page, tap the i beside Armor & TN.** It shows the same table, with the formula underneath.
4. **Open Armor & TN.** The Blind line under Base TN is still there.
5. **Remove Blind, add named armour (say 5) and choose the Defense stance.** The window lists:
   - Base: Reflexes … × 5 + 5;
   - Armor TN Bonus (the armour's name) +5;
   - Defense stance +…;
   - and the rows add up to Quick Access's Armor TN.

## B14 · Jigoku's total, then its arithmetic

**Set up.** In Manage, add Touch of the Spirit Realms, choose Jigoku and tick Lost. Set Taint to 4.2. Switch to Play.

1. **A Defense roll's preview:** "Touch of the Spirit Realms (Jigoku) +8 to total — Taint Rank 4 × 2 (Lost)".
2. **The card:** "Adding +8 — Taint Rank 4 × 2 (Lost)."
3. **Untick Lost.** The preview shows "+4 to total — Taint Rank 4", and the card "Adding +4 — Taint Rank 4."

## B17 · One row for Kharmic Tie

**Set up.** In Manage, add Kharmic Tie at Rank 3, tied to Aiko, and spend one use (2 of 3 left).

1. **Play.** One row:
   - the badge "Aiko · Rank 3";
   - the pips ●●○;
   - Reset session;
   - one i at the right.
   - There is no "Target: … uses remaining" line and no other i.
2. **Manage.** Change and the i are on the badge's line at the right. On a phone, the pips and Reset session are under the badge; on a laptop, it is all one line.
3. **The i in Play** opens a window titled "Kharmic Tie", subtitled "Rank 3 · tied to Aiko". It holds:
   - the rule, with Core Rulebook p.151;
   - Each use +1k1;
   - Uses left this session 2 of 3;
   - what the preview and Reset session do.
4. **The i in Manage** shows the same, plus what Change does.
5. **Reset session.** The pips read ●●●, and the row keeps its shape.
6. **Change (Manage).** The Kharmic Tie window opens as before, and Cancel leaves the Tie as it was.
7. **An attack roll's preview** still offers the Tie.

## Results (the owner, by 23 November 2026, in the checklist)

| Unit | iPhone | Laptop | Decision |
|---|---|---|---|
| A14 | 7 Pass | 7 Pass | **Accept** |
| B04 | 5 Pass | 5 Pass | **Accept** |
| B14 | 3 Pass | 3 Pass | **Accept** |
| B17 | 7 Pass | 7 Pass | **Accept** |

The notes column was left empty.

### The owner's message, 23 November 2026, in the Claude session

Verbatim, except one passage. The owner quoted a long passage of the Core Rulebook (p.278). The repository keeps rules in our own words, so it is summarised below, and the rest of the message is as written. The owner sent three laptop screenshots straight after the message (not stored):
- **Jigoku's card:** "Jigoku" in a dashed badge, then Change and the standard i, the rule, the flag "Requires Shadowlands Taint: your Taint Rank is 0, so nothing is added.", and the "Lost (twice your Taint Rank)" tick box.
- **The Combat page's Armor & TN card:** its formula i, a gold ⓘ inside a gold ring.
- **The Weapons and Stance cards:** the same i beside Weapons, and each stance tile's small grey ⓘ in a ring at its top right.

> I have ran the tests and the pass as described.
>
> However there are a few comments I have made regarding the state of the sheet.
>
> 1. I have noticed that there are still miss matched tool tip icons.  This can be seen in the armour, weapons and stances tab in the screenshots provided.  Currently they are a gold capital I inside two gold circles rather than just the normal "i" in a black circle.  While these don't need to be addressed right now, they do need to be addressed at some point.  Probably as part of the whole combat tab overhaul planned for later.
> 2. When adding Jogoku's touch of the spirit realm it uses the dashed badge.  Again mismatch was something picked up as part of 15a, and this is another example.  Maybe when this gets fixed the whole sheet is looked at to make sure there are no missing badges or mismatched ones that slipped through.
> 3. I have also noticed that Jigoku's touch may need to be looked at in finer detail.  And might be made a bit more dynamic.  Currently there is a tick box for "lost".  This might be confusing to a new player as they may think lost as in sense of direction/location.  However there is a taint level referred to as lost, which this is referencing.  On page 278 of the core rulebook it says that when you reach taint level 5 it is known as lost, the player is considered consumed by the taint and have lost themselves to it.  The rules do say that if the character however has at least one ring at rank 6 or higher they can hold out and not be considered lost until taint level 7.  The rules imply that the ring rank of 6 must be reached before the taint reaches lv 5.  The rules then go on to say … *[book passage omitted; summary below]* …  So maybe the toggle of lost can be tied dynamically to the taint level, so that at level 5 or 7 it is switched on and so the player does not need to input it manually.  However having looked at this, I would think that as a separate phase we need to look at taint as a whole and how it can be best implemented into the app.  Because at the moment there seems to be a bit of a clash and misunderstanding of wording and rules.  Currently I can have no taint and still have this advantage and toggle it on that I am lost, yet when I do the roll it is not there, because I have no taint rank to add or double.

**The omitted passage, in our own words (Core Rulebook p.278).**
- **Who the Lost are:** on rarer occasions Jigoku lets a consumed victim keep their memories and knowledge while turning them wholly to its ends. These beings are called the Lost (or Akutsukai).
- **What changes for them:** a Lost character keeps the Void Ring but has no Void Points. Their Taint keeps rising, to Rank 10 at most. They can no longer "embrace the Taint" for physical rolls; instead they always add their Taint Rank to the total of every roll that uses a physical Trait.
- **What they gain:** mutations and Shadowlands Powers, at the GM's discretion.
- **How they are played:** they seem to keep their old personality, but they have no will of their own. In game terms the Lost are NPCs.

**Read as:**
- **All four units are accepted** as built: A14, B04, B14 and B17.
- **Three observations for later,** none for group 1. They are recorded under "Parked from this round" below.

## Parked from this round (the owner's notes of 23 November 2026)

| # | What | Where it goes |
|---|---|---|
| P1 | **The Combat page's i's do not match the standard ring.** These are the formula i beside Armor & TN and beside Weapons (`.combat-formula-info`), shown as a gold ⓘ glyph inside a gold ring (a circled "i" in a second circle). Each stance tile's rule button (`.stance-info-btn`) shows a small grey ⓘ in a ring. Neither is the plain "i" in an ink circle. A04 (Release 15a) left `.combat-formula-info` as it was, deliberately, because it was outside A04's areas. | The owner: "Probably as part of the whole combat tab overhaul planned for later." The Combat tab is already parked (kickoff §10). |
| P2 | **Touch of the Spirit Realms draws its realm as the dashed badge,** a style that does not match, as 15a found elsewhere. | A whole-sheet check for missing or mismatched badges when this is fixed, as the owner asked, in the same spirit as B18's check of buttons. Not yet a unit; to be placed when 15b's later groups are planned. |
| P3 | **Taint as a whole.** Jigoku's "Lost" tick reads like "lost your way"; it can be ticked with no Taint (and then adds nothing). The owner suggests that Lost follow the Taint Rank: on at Taint Rank 5, or 7 for a character whose Ring reached 6 before Taint Rank 5 (Core p.278). | A separate phase after Phase 15, as the owner proposes, like the resistance phase and the Techniques-as-modifiers phase. Not in 15b. |
