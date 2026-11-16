# A12 · the owner's device notes: review and three options

16 November 2026. Claude. The owner's notes are summarised in [DEVICE-CHECKS.md](DEVICE-CHECKS.md); the checklist itself is the Claude Doc linked there. Status: **awaiting the owner's choice. Nothing is changed.**

## What the build does today (read from the code)

| Choice | Wording on screen | Where it is declared |
|---|---|---|
| Honour's | "Resisting Intimidation, Temptation or Fear — +6 to the total"; note: "…Balance already includes this bonus. Core Rulebook p.91." | Honour Resistance Bonus fix (`209.9999999999967-bugfix-honour-ui.js`, `HR7.provider`) |
| Balance's | "Balance: Resisting Intimidation or Temptation, adding your Honor Rank — +1k0"; note: "Your whole Honor Rank is added to the total once; points are ignored. Core Rulebook p.146." | Situational Roll Entries (`209.9999994-feat-situational-entries.js`, `SIT4527.ENTRIES`); the note is set by the Honour fix |

- **Honour is counted once.** With Balance ticked and Honour's box not ticked, `HR7.balance` adds Honour's bonus; with both ticked, Honour's own box adds it and `HR7.balance` adds nothing. The owner's three results on the preview (+6; +1k0 and +6; +1k0 and +6) are what the code gives.
- **Both choices are on the live app today.** They were declared by the two earlier units above. A12 changes neither: it only folds the registry's finished choices into one line. So the overlap is not something A12 made; A12 put the two side by side at the top, where it is easier to notice.
- **Honour's box is offered wherever Balance's is** (Balance's scope is Skill, Trait, Ring and manual rolls outside Full Defense; Honour's is the same minus three special rolls).
- **No test names these two labels**, so a wording change does not disturb the existing harness assertions (checked in the Honour, situational-entries, situational-buttons, registry and A12 harnesses).

## Feedback on the owner's reasoning

1. **"Are both needed?" For Intimidation and Temptation, no.** Balance includes Honour, so Balance's box alone is the right one to tick, and it is always the better of the two.
2. **But Honour's box cannot simply be hidden: Balance does not cover Fear.** Honour's rule (Core p.91) is Intimidation, Temptation or Fear; Balance's (p.146) is Intimidation or Temptation only. A character with Balance who resists Fear still needs Honour's box. This is the one gap in "show only Balance".
3. **Showing the real number is right.** "+1k0 and +6 to the total" says what the tick will do; "adding your Honor Rank — +1k0" makes the reader work it out.
4. **"Balance is the only better case": correct, with one cousin.** Balance is the only choice that *includes* another. Usagi Reichin's two Fear gifts are the same kind of pair ("+2k2 in place of +1k1"), already worded that way and already counted once. Everything else stacks: Matsu Hitomi's +1k1, Irreproachable, Heartless and Clear Thinker add to Honour; they do not replace it.
5. **Poison and Taint: the reasoning is right, and the sheet already agrees.** There is no bonus every samurai has, so there is no universal box. The only choices are gifts: Jurojin's Blessing ("Resisting poison or disease — +2k0") and Touch of the Spirit Realms, Tengoku ("Resisting Shadowlands Taint — +2k0", Earth Ring rolls only). A character without one sees nothing for poison and just rolls Earth. So the line is not a resistance *system*; it is a fold-away list of the bonuses this character may claim, and for most poison rolls it has nothing to add.
6. **One thing to be aware of.** Honour's box is offered on every ordinary roll, because the sheet cannot know what a roll is for. So "Resisting? 1 option" also shows on an Earth roll against poison, where the one option does not apply. Closed, it costs one line.

## Three options

### Option 1 · Keep both boxes; Balance shows the real number

- Balance reads: **"Balance: Resisting Intimidation or Temptation — +1k0 and +6 to the total"**. Honour's box and note stay as they are.
- **Pros:** the smallest change (one label); which boxes appear does not change; lowest risk; the closed line would read "Balance +1k0 and +6".
- **Cons:** two boxes still cover Intimidation and Temptation, so the question "which do I tick?" remains (either way the total is right).

### Option 2 · One box per effect (the owner's idea, completed for Fear)

- With Balance: Balance reads as in Option 1, and Honour's box narrows to **"Resisting Fear — +6 to the total"**. Without Balance: Honour's box is exactly as today.
- **Pros:** no two boxes cover the same thing; each box means one thing; the total logic is untouched (already counted once); small; can be its own removable unit stacked on A12, so A12's ring-fence stays as it is.
- **Cons:** Honour's box reads differently on a character with Balance than on one without; one more rule to test (when to narrow); a short device re-look before qualification.

### Option 3 · Ask what you are resisting

- The line opens to effects, not sources: Intimidation, Temptation, Fear, and, only when the character has a gift for it, poison or disease, Shadowlands Taint, possession and so on. Tick one; the sheet adds everything the character has for it, each once.
- **Pros:** matches the question at the table; no overlap by design; poison and Taint appear only when there is something to add.
- **Cons:** the largest change by far. It turns fifteen separately ticked choices into automatic ones, and several carry conditions only the player can judge ("a Contested Roll", "Earth Ring rolls only", "to persuade, seduce or change your mind", Hotei's "would take your Void Points"). It needs a rules read of all fifteen, re-testing five earlier units, and it would replace A12 as built. Most characters have one to three choices, so it adds more screens than it saves. It would not fit this group.

**Always open:** remove A12. Its remover takes it out exactly; the live app keeps the flat list (and the same two boxes).

## Recommendation: Option 2

- It is the owner's own idea, with the Fear gap closed.
- It fixes the only true overlap; nothing else among the fifteen needs it.
- It leaves the totals alone, which the owner's own test and the harnesses already show are right.
- It is small and separately removable: a new unit (next marker `PART H PHASE 15.1.33`) stacked on A12, with its own switch, harness and remover. A12 is not edited.
- Option 3 is worth remembering only if more "includes" cases turn up; today there is one.

**If chosen:** a small mock-up (today beside the proposal, with and without Balance, phone and laptop) for approval; then the unit, light checks, a preview and a short device re-look; then G5 is qualified once with A08, A12 and the new unit. Weekly usage is at 75% with the reset on 18 November 01:00 UTC, so the qualification may fall just after the reset.

## Later on 16 November: the owner's follow-up, and the recommendation revised to Option 3

**The owner's follow-up (summary).** Still not convinced A12 is the right approach. Removing A12, adding a unit and extra work are not concerns; the aim is to get it right and give players the best UI and UX. The guiding principle for the app: clean, simple, easy to understand, accessible to all players, with D&D Beyond as the reference to improve on. The owner's own difficulty in TTRPGs is forgetting what abilities a character has and how or when they apply, and the sheet should not punish players with poor memory, ADHD/ADD or a misread rule.

**Revised recommendation: Option 3, in the shape below.** The recommendation of Option 2 above weighed fitting this group and keeping A12's ring-fence. With those set aside and this aim named, Option 2 no longer wins: it tidies one pair of boxes but still asks the player which of their abilities apply, which is the thing the owner wants the sheet to carry.

- Today's design (the live app, A12, Options 1 and 2) lists abilities and asks the player to judge each one. The player always knows something simpler: what the GM has just asked them to resist. The sheet knows which abilities the character has and what each applies to.
- **Shape.** (1) One question on the roll preview, with only the effects this character has something for: Intimidation, Temptation and Fear for every samurai (Honour); poison or disease, Taint and the rest only with a gift. (2) Pick one: the sheet applies everything that certainly applies, counted once, and names each with its source. (3) Anything that turns on a detail only the player knows is asked there, not applied silently (for example Irreproachable: "only in a Contested Roll where the other side uses Temptation"). (4) Nothing to add, nothing shown.
- **Correction to a con above.** "It adds more screens than it saves" does not hold for this shape: a typical character sees three effects in a row, with no extra screen.
- **What stays.** The rules code of the fifteen choices and their totals: the registry can tick a choice on the player's behalf (`RD4515.toggle`), so a new unit decides which are ticked. A12 would come out with its remover.
- **What it needs.** A rules table for the owner to approve, one line per choice: which effect or effects, and "apply" or "ask". A few are loosely worded and need the owner's naming (Clear Thinker, Heartless, Meido). Then its own mock-up, build, device round and qualification; not within this week's usage.
- **For G5.** A08 is accepted and does not depend on A12, so the group can go ahead with A08 alone if the owner says so. That is a separate decision.

Status: awaiting the owner's word on whether to mock up the effect-first design. Nothing is changed.

**Mock-ups:** five designs for the effect-first approach, ranked, are in [RESISTANCE-MOCKUPS.md](RESISTANCE-MOCKUPS.md) (recommended: A, buttons in a row). Awaiting the owner.
