# Core Advanced Schools — owner device checks

**Owner report, 4 October 2026:** all other tests passed, with the Blackmail
purchase-count concern and intermittent ChatGPT preview Spell Slots issue open
(ledger FT-07 and FT-08). Windows preview is evidenced; no iPhone pass reported.
The original group table below has no individually supplied results. Use it for
future retests, recording device, browser, date and build; do not infer an iPhone
pass from Windows. Safari's earlier Spell Slots issue is resolved; FT-08 concerns
ChatGPT's preview/file explorer only, with a shared cause unconfirmed.

Use disposable character copies and keep an export from before Advanced School
entry. Use Management mode for setup and changes. School prerequisites are in
[data/core-schools.json](data/core-schools.json) and Core pp.247–250. Technique
effects are manual references in this release, including all casting bonuses
and extra spell slots.

## Worked examples: normal cases and edge cases

Run these on either device. Use a separate disposable copy for each entry test,
an active basic School and the Multiple Schools Advantage unless the test says
to remove it. **The Advanced School picker is on Techniques, above the Technique
rows; it is not Identity's Add School dropdown.** It is hidden if no School
qualifies. Apply the basic School before editing the test values. A Ring uses
the lower of its two Traits: for Earth 4, set both Stamina and Willpower to 4.
Record Pass, Fail or Not run with each example number. No console editing is needed.

1. **Normal Defender entry.** Apply Hida Bushi. Set Stamina 4, Willpower 4
   (Earth 4), Strength 5, Defense 4, Heavy Weapons 4 and Lore: Shadowlands 5.
   Add Multiple Schools, then open Techniques. Choose Defender of the Wall and
   Begin training. Expect Advanced Rank 0 of 3, the previous basic rank retained,
   and no new starting package. Record the displayed next Insight Rank.
2. **Defender just below the boundary.** Before joining, lower Defense from 4
   to 3: Defender must disappear from the picker (the panel may hide). Restore 4:
   it returns. Lower Willpower to 3 with Stamina still 4: Earth is now 3 and it
   disappears again. Restore Willpower 4. Remove Multiple Schools: the eligible
   picker remains visible but disabled. Restore the Advantage: selection works.
3. **Normal Swordmasters entry.** Apply Mirumoto Bushi on a fresh copy. Set
   Agility and Intelligence to 4 (Fire 4), Void 4, Iaijutsu 5, Kenjutsu 5 and
   Lore: Theology 4. With Multiple Schools, Swordmasters should appear on
   Techniques. Begin training: expect Rank 0 and the basic School preserved.
4. **Progression boundary and duplicates.** Continue example 1. Use Other
   Insight Bonus on Identity to reach the next Insight Rank shown by the panel.
   Expect Rank 1 and The Flames of Purity exactly once. Reach the next two
   Insight Ranks: expect Hida's Strength and The Crab Are the Wall, one each.
   Another Insight Rank must not grant Advanced Rank 4. Revisit the tab and save:
   no duplicate references. Lower the bonus again: earned ranks remain. Basic
   rank stays frozen until further training is explicitly resumed.
5. **Story condition with all numbers met.** Apply Kakita Bushi, set Agility
   and Intelligence 4 (Fire 4), Void 4, Iaijutsu 5, Lore: Bushido 4 and Meditation
   5. Kenshinzen should be listed, but Begin training stays disabled until the
   duel confirmation is ticked. Unticking it disables the button again.
6. **Four distinct Weapon Skills.** Apply Matsu Berserker if available (or
   another basic Bushi School), set Family Matsu, Agility 5, Strength 5, Honor
   Rank 6, Battle 5, and Kenjutsu, Kyujutsu, Spears and Heavy Weapons each to 3.
   The Lion's Pride should be listed; joining requires its female-character
   confirmation in this release. Remove Spears and duplicate Kenjutsu: three
   distinct Skills plus a duplicate must not qualify. Restore Spears 3. The
   proposed Identity-gender alternative is deferred as FT-04, not a current test.
7. **Wrong Elemental Blessing.** Apply a Shugenja School on a fresh copy. Set
   Reflexes/Awareness 3 (Air 3), Agility/Intelligence 3 (Fire 3), Strength/Perception
   5 (Water 5), Lore: the Sea 5, Sailing 3, Spellcraft 3 and Lore: Theology 3.
   Configure Elemental Blessing to Air: Storm Riders must not qualify. Change
   it to Water: it should appear. Joining grants no automatic new spells or slots.
8. **Scorpion Instigator — open purchase-count review.** Apply Bayushi Courtier.
   Set Awareness 5, Intelligence 5, Perception 3, Courtier 6, Etiquette 5,
   Sincerity 5 and Stealth 4. Add Blackmail and Dark Secret. The current picker
   checks those entries, then requires both confirmations: four distinct people
   and disclosure of a secret to the sensei. It does not count purchases or a
   target list. Removing either entry must prevent eligibility; leaving either
   confirmation unticked must prevent joining. The owner believes four separate
   Blackmail purchases are required as well as the tick: FT-07 remains open for
   source review. Do not call a one-purchase entry a verified rules pass.
9. **One School only and character isolation.** Save the Defender character as
   A. Open B, a character with no Advanced School: B must inherit none of A's
   Advanced state. Reload A: its rank and references remain. On A, meeting
   Swordmasters' numbers must not allow a second Advanced School. Export A,
   import it as a disposable copy, and verify the same state without duplicates.
10. **GM permission and mode boundary.** At Advanced Rank 2, resuming basic
    training is unavailable. At Rank 3, leave permission unticked: Resume is
    disabled. Tick it and resume: the old basic rank is restored without a free
    rank; the next Insight Rank advances it. In Play, progression editing is
    locked; in Management it is available again where appropriate.
11. **Phone and preview layout.** Inspect the picker, Kenshinzen confirmation,
    Rank 0/3 summaries and long names in desktop and narrow portrait views.
    Controls and source notes must fit and stay reachable. On a Shugenja, note
    whether Spell Slots remains reachable after changing modes, loading a
    character or resizing ChatGPT's preview. If it disappears, record those
    steps and whether navigation, resizing or reopening restores it. Do not mark
    FT-08 fixed solely because the tab becomes visible again.

| Check group | Windows | iPhone |
|---|---|---|
| A. Picker and entry gates | Not run | Not run |
| B. Progression and earlier training | Not run | Not run |
| C. Special entry requirements | Not run | Not run |
| D. Save/load and character isolation | Not run | Not run |
| E. Completion and further training | Not run | Not run |
| F. Layout and Play mode | Not run | Not run |

## A. Picker and entry gates

1. Open the Techniques tab on a character with no qualifying Advanced School.
   The Advanced School panel should stay hidden.
2. On a disposable Hida Bushi, set Earth 4, Strength 5, Defense 4, Heavy Weapons 4
   and Lore: Shadowlands 5. Defender of the Wall should be offered. Without the
   Multiple Schools Advantage the picker should be disabled and explain why.
3. Add Multiple Schools. Choose Defender of the Wall; lower one required Skill
   below its printed minimum, then restore it. The School should become
   unavailable and then available again as its prerequisites change.
4. Before joining, note the basic School name/rank, Insight Rank, Technique rows,
   Skills and resources. Choose Begin training. The Advanced summary should read
   Rank 0 of 3, name the next required Insight Rank and retain the earlier basic
   School at its prior rank. No Advanced Technique or starting package is granted.
5. Confirm the sheet cannot add a second Advanced School or replace the preserved
   basic training through Apply School. On separate eligible characters, confirm
   Bushi/Shugenja training incompatibility is enforced.

## B. Progression and earlier training

1. On the joined test character, increase Insight through ordinary editable test
   data or the Insight bonus field until the next Insight Rank. Advanced Rank 1
   and its first free Technique reference should appear; the basic School rank
   should stay fixed.
2. Reach the following two Insight Ranks. Exactly one more Technique should
   appear at each, ending at Advanced Rank 3 with three references. Every row
   should show its Advanced School/rank, source page and manual-effects note.
3. Recalculate repeatedly, leave and return to the tab, then gain another Insight
   Rank. There should be no duplicate Technique, fourth Advanced rank or extra
   basic rank while basic training is still frozen.
4. Lower Insight after earning a rank. The earned Advanced rank and its Technique
   should stay. Earlier basic-School and Alternate Path Technique rows should
   remain throughout the test.
5. Confirm adding an Advanced reference does not itself apply its roll, Armor TN,
   Reduction, Condition, spell-rank or spell-slot effect. Those effects remain
   the player's responsibility; the panel and rows should say so clearly.

## C. Special entry requirements

Use separate disposable characters meeting each School's other prerequisites.

1. **Kenshinzen:** Begin training stays disabled until the printed duel condition
   is confirmed. **The Lion's Pride:** confirm Matsu family, Honor 6 and four
   different Weapon Skills at Rank 3. A duplicate Skill row must not count as a
   fourth Skill. Confirm the female-character condition before joining.
2. **Storm Riders:** an Elemental Blessing for Air should not qualify. Configure
   it for Water and the School should qualify when the remaining requirements
   are met. A similarly named entry on the Disadvantages list must not qualify.
3. **Elemental Guard:** select a non-Void element with Ring 6 and genuine Mastery
   Level 4 casting eligibility. Void should never be offered; an element that
   misses the casting requirement should not be offered just because a Level 4
   spell was added to the spell list. After entry, confirm the chosen element is
   visible and survives save/load. Its later casting/slot bonuses remain manual.
4. **Scorpion Instigator:** actual Blackmail and Dark Secret entries are required.
   Confirm Blackmail covers four distinct people and a secret was disclosed to
   the sensei. Neither confirmation should substitute for a missing entry.
5. **Obsidian Warrior:** confirm surviving the sensei's skirmish. **The White
   Guard:** confirm devotion to the Lords of Death or a campaign strictly before
   1160. Neither School should join while its confirmation is unticked.

## D. Save/load and character isolation

1. Save and export an Advanced character, close it, then reopen it. Confirm the
   School, chosen element if any, rank, prior basic rank and Technique rows agree.
2. Save As a copy, reopen that copy and verify the same state without duplicate
   Techniques. Import the export as a separate test character and check again.
3. Load a character that has never joined an Advanced School. It must not inherit
   the first character's School, element, confirmations, rank or GM permission.
4. Reopen the Advanced character. Recheck its state and the earlier basic/Path
   Technique rows. Do not test a new-format export by editing its format number.

## E. Completion and further training

1. Before Advanced Rank 3, further basic School training should be unavailable.
2. At Advanced Rank 3, leave GM permission unticked. Resume should remain
   disabled. Tick the permission and resume the named prior basic School.
3. Confirm it returns at its previous earned rank, with no immediate free rank.
   At the next Insight Rank, it should advance once. Advanced Rank 3 and all
   three references should remain.
4. On a separate completed character, use the existing Add School flow with GM
   permission. Confirm its normal prerequisites and training-category restriction
   still apply; the completed Advanced School remains recorded.

## F. Layout and Play mode

1. At desktop width and in iPhone portrait, inspect the picker, long School names,
   source text, element selector, story confirmations and Begin training button.
   Text should wrap; controls should remain readable and tappable with no page
   overflow or obscured labels. Repeat with the keyboard visible where relevant.
2. Inspect the Rank 0 and Rank 3 summaries and the completion controls. The manual
   Technique-effects note should remain visible and fit the panel.
3. Enter Play mode. Selection, entry, confirmations and further-training controls
   should be locked while the summary and reference text remain readable. Return
   to Management and confirm the appropriate controls work again.
4. Scroll the Technique list after all three references are present. Confirm
   earlier School and Path rows remain readable on both devices.

Record failures with the device/browser, School, starting state, action, observed
result and a screenshot where useful. Leave unperformed checks as **Not run**.
