# Release 15b group 2 · device round

24 November 2026 (Claude).

- **The owner's checklist** is a Claude Doc: [15b Group 2 Device Round Checklist](https://claude.ai/artifact/Nphzgd9PYVFgZRPbLFPQmX). It has Pass / Fail / Not run on iPhone and on laptop for each check, and Accept / Revise / Remove for each unit.
- **This file** mirrors its checks. The owner's results are recorded here, verbatim, when they come.

| Site | What it has |
|---|---|
| https://claude-release-15b-b09.l5r-character-sheet-creator.pages.dev/ | Group 1 as live, plus B01, B03, B05 and B09 (build `0d8cebb1…1637`) |
| https://l5r-character-sheet-creator.pages.dev/ | Live, to compare with |

Lost Love's "Spend Void" and Quick's "Use" follow B18's answers (G07 and G06) if those come in differently.

## B01 · Check buttons named for what they do

**Set up.** In Manage, add Brash, Overconfident, Can't Lie, Contrary, Rumormonger, Soft-Hearted, Lost Love and Epilepsy.

1. **The buttons read:**
   - Brash "Resist insult (TN 25)";
   - Overconfident "Measure the enemy (TN 20)";
   - Can't Lie "Discretion check (TN 20)";
   - Contrary "Cooperate", after its TN box;
   - Rumormonger "Resist gossip (TN 5 × Glory)", after its Glory Rank box;
   - Soft-Hearted "Resolve check (TN 20)";
   - Lost Love "Steady yourself — Spend Void".
2. **Epilepsy** still reads "Avoid (TN 15)" and "End seizure (TN 10)".
3. **On the phone,** Soft-Hearted's "Wracked with guilt" switch sits under its button. Every other row looks as it did.
4. **Tap "Resist insult (TN 25)"** and roll. The window is titled "Brash — Willpower vs TN 25", as before.
5. **Contrary:** type 25 in its TN box and tap "Cooperate". The roll is against TN 25.
6. **Lost Love:** tick "Reminded of your loss", then tap "Steady yourself — Spend Void". One Void Point is spent and the tick clears.
7. **Optional, with VoiceOver on:** a button is read starting with its words, for example "Resist insult (TN 25): Brash, Willpower roll when threatened or insulted".

## B03 · Lead an ally

**Set up.** In Manage, add Leadership and Quick. Switch to Play.

1. **Out of a combat round:**
   - Leadership reads "Lead an ally", with "1k1 + [your School Rank] (School Rank)" beside it;
   - Quick reads "Use", with "+[your Reflexes] (Reflexes)" beside it;
   - both are greyed, and the notes under them are as before.
2. **On the phone,** each button and its amount sit on one line. The rows are no taller than before.
3. **Start a combat round** (Combat page), then tap "Lead an ally". The roll window is titled "Leadership — 1k1 + School Rank [N], for one ally". Afterwards the button is greyed and the note reads "This Round: … to one ally's Initiative Score."
4. **Tap "Use" on Quick.** Its note reads "Initiative Score +[Reflexes] this skirmish.", and the button is greyed until Next Round.
5. **In Manage, raise Reflexes by one.** Quick's amount follows.

## B05 · You remain in control

**Set up.** In Manage, add Touch of the Void and Lord Moon's Curse. For a likely pass, set Willpower to 6 for this check (put it back afterwards). Switch to Play.

1. **Tap Touch of the Void's "Willpower (TN 30)"** and roll. When it passes, the result line reads "You remain in control."
2. **A failure** still reads "You are Dazed for one Round. Tell the GM: the sheet does not track Dazed."
3. **Tap "Resist Lord Moon (TN 20)"** and roll. A pass reads "Willpower roll passed. You remain in control tonight."
4. **A failure** still reads "Willpower roll failed.", followed by Lord Moon's message as before.

## B09 · The Skills picker's Traits

**Set up.** A character without Intimidation. Skills page, Manage.

1. **Open "— choose a skill to add —".** Intimidation reads "Intimidation (Awareness)".
2. **Choose it.** The row it adds says Awareness.
3. **Remove that row.** The picker offers "Intimidation (Awareness)" again.
4. **Sailing and Ninjutsu** still read "(Agility or Intelligence)" and "(Agility or Reflexes)". Perform, Games and Craft read as before.

## Results (the owner, 24 November 2026)

**In the checklist** (read back from the Claude Doc at revision 53):

| Unit | Checks | iPhone | Laptop | Decision | Notes |
|---|---|---|---|---|---|
| B01 | 1–6 | Pass | Pass | **Revise** | (none in the doc) |
| B01 | 7 (VoiceOver, optional) | Not run | Not run | | |
| B03 | 1–5 | Pass | Pass | **Revise** | (none in the doc) |
| B05 | 1–4 | Pass | Pass | **Accept** | (none in the doc) |
| B09 | 1–4 | Pass | Pass | **Accept** | (none in the doc) |

**In the chat, verbatim:**

> I have ran the checks and they all pass as described however here are some comments I have:
>
> 1. The attached screenshots show further examples of where the badges and buttons are inconsistent.
> 2. An example is the button to resist lord moons curse is a lot bigger than any of the other "check" buttons
> 3. the buttons to use quick and leadership are black and are not the same as any of the other buttons to use a feature in the advantages or disadvantages
> 4. The badge for great potential needs to be included in the consistency pass
> 5. The willpower check for touch of void is black again doesn't match other checks.  It also does not have a "descriptive name" as the other checks.
> 6. When checking leadership and quick, it highlighted the need to have a closer look at the combat, I know that combat is getting aa overhaul later, but when it comes to do so we need to do a complete read of how combat is meant to work and pay close attention to things like initiative etc. maybe a read pass is required for combat as well as a audit, before anything is built as part of the combat overhaul
> 7. Once the read and audit are done then maybe advantages like quick and leadership will integrate more smoothly
> 8. A lot of the failed checks say Tell the GM: The sheet does not track.... i think this line should be removed as it implies that the players may not me faithful about the outcomes of there rolls and if they fail a check
> 9. I also think that with the new combat overhaul there was a plan to add status conditions, so things like dazed can be added, and they can be automated and tracked in the app

**The screenshots (comment 1)** came in a later message, the same day. They are kept in [device-round/](device-round/) as `owner-screenshot-1.png` to `-3.png`: the Adv & Disadv page on a laptop with group 2 built. What they show (Claude's reading):

- **Buttons, three looks.**
  - Most "use" and "check" buttons on these cards share one small outlined look ("ghost"): B01's seven, Epilepsy's two, and the Advantage configuration's buttons, all 0.78 rem with 3 × 8 px padding.
  - Quick's "Use", Leadership's "Lead an ally" and Touch of the Void's "Willpower (TN 30)" are filled black (Feature 4.5.33's `vi4533-btn`).
  - Lord Moon's "Resist Lord Moon (TN 20)" is larger and outlined (Release 15a A07's Moon row restyles `lm7-roll`).
- **Ticks, two looks.** Lost Love's and Soft-Hearted's ticks have small capital labels ("REMINDED OF YOUR LOSS (TN +5)"). Lord Moon's "Full moon tonight (+1 Void Point, spent last)" is larger, in ordinary case.
- **What an entry's choice looks like, three ways.**
  - Great Potential: "Skill: Iaijutsu — Raise cap uses …" with a grey pill, "Raise-limit reminder".
  - Elemental Blessing and Sworn Enemy: a plain line ("Fire — Agility and Intelligence cost 1 XP less per Rank"; "Sworn Enemy: Unknown Lion Samurai — Insight difference 0; …").
  - Lord Moon: a small-capitals label, "SEVERITY Medium — 5 points".

**How it is read (Claude, proposed, not yet agreed):**

- **B05 and B09 are accepted.** They wait for the group: qualification runs on the group once B01 and B03 are revised and accepted.
- **B01 (Revise): comments 2, 5 and 8.**
  - **Comment 2:** Lord Moon's "Resist Lord Moon (TN 20)" (the `lm7-roll` look) takes the same look as the other check buttons.
  - **Comment 5:** Touch of the Void's "Willpower (TN 30)" (the filled dark `vi4533-btn` look) takes the check buttons' look and a descriptive name. This is the button B18's G11 question named; the owner's comment answers it for this button.
  - **Comment 8:** the failure lines lose "Tell the GM: the sheet does not act for you." and its variants. There are ten in four files: six on Feature 4.5.31's checks, Epilepsy's, Touch of the Void's "…does not track Dazed.", and two others.
- **B03 (Revise): comment 3.** Quick's and Leadership's buttons take the look of the other buttons that use a feature on Advantage and Disadvantage cards.
- **Comments 1 and 4 (badges and buttons, Great Potential's badge):** a consistency unit of their own, mock-up first, once the screenshots are in.
- **Comments 6, 7 and 9 (combat):** a note for the combat overhaul.
  - A full rules read pass and an audit of combat come before anything is built: initiative, Quick and Leadership.
  - Status conditions such as Dazed are tracked and automated.

## Round 2 (B01 and B03 revised, 24 November 2026)

The owner approved round 2 as shown ("Approve as shown"; MOCKUP.md, "Round 2 answers"). B01 and B03 were rebuilt to it, with B05 and B09 restacked on them, on the tip branch `claude/release-15b-b09` only.

- **Site:** https://claude-release-15b-b09.l5r-character-sheet-creator.pages.dev/ (build `1f002be9…5819`, commit `91da9205`; checked on the deployed files, 3,863/3,863).
- **The checklist's round-2 section** is in the same Claude Doc, with the same Result choices (Pass / Fail / Not run on iPhone and on laptop) and a Decision for each unit (Accept / Revise / Remove).
- Only the changes are checked. Round 1's checks passed, and B05 and B09 were accepted.

### B01, round 2 · the check buttons' look and the failure lines

**Set up.** In Manage, add Brash, Epilepsy, Touch of the Void, Lord Moon's Curse (any severity) and Cursed by the Realm (choose Toshigoku). For likely failures in check 3, set Willpower to 1 (put it back afterwards).

1. **Lord Moon's "Resist Lord Moon (TN 20)"** is the same size as the other check buttons, such as Epilepsy's "Avoid (TN 15)" and Brash's "Resist insult (TN 25)". The full-moon tick above it is as before.
2. **Touch of the Void's button** is outlined like the other check buttons (no black fill) and reads **"Keep control (TN 30)"**.
3. **No "Tell the GM" after a failure.** Roll each of these until it fails:
   - Brash "Resist insult (TN 25)": "You attack (or challenge) the one who provoked you, at once."
   - Epilepsy "Avoid (TN 15)": "You have a seizure. Each round, the End seizure button rolls to end it."
   - Touch of the Void "Keep control (TN 30)": "You are Dazed for one Round."
   - Toshigoku "Check (TN 15)": "You are overcome by the urge to fight."
4. **Elemental Imbalance (needs a Shugenja).** Give a Shugenja Elemental Imbalance on one element and cast a spell of that element. When the Willpower check fails, the message reads: "You failed the Elemental Imbalance Willpower check: the GM decides what happens. Your Spell Casting Roll still proceeds." The spell roll then goes ahead.

### B03, round 2 · Quick and Leadership outlined

**Set up.** In Manage, add Leadership and Quick. Switch to Play.

1. **Quick's "Use" and Leadership's "Lead an ally"** are outlined like the other buttons on the cards, with no black fill. Their words, amounts and notes are as before, greyed out of a combat round.

### Round 2 results

To be recorded here, verbatim, when the owner has run the round.
