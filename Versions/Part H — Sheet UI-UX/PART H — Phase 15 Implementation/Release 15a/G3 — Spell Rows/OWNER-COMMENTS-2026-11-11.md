# The owner's comments at G3's device round — findings and recommendations

11 November 2026. The owner passed all 34 checks, accepted 8b.1-UI-01 and 8b.1-UI-02, marked 8b.1-UI-03 **Revise**, and raised four points in chat with iPhone screenshots. This file records what the code shows for each and what Claude recommends. **Nothing here is decided or built.** The owner's replies are to be recorded below when given.

## 1 · A gold outline around the page after leaving the starting-spell review

**What the owner saw (iPhone Safari):** after Later or Confirm, a gold line runs round the page area until the mode is changed.

**What it is.** The outline is the tab page's own focus ring: `.car-page:focus-visible` in `src/css/20-carousel.css` (2 px gold, inset 3 px). Each page is focusable (`tabindex="0"`, set by the carousel so a scrollable region can be reached by keyboard). When the School-choice dialog closes, the School-choice layer returns focus to whatever was focused when it opened (`SC8.close`). iPhone Safari does not focus a tapped button; the focused element is the page. So focus goes back to the page, and Safari draws the ring for focus moved by script.

**Not introduced by G3.** G3 adds no focus code. The same sequence was run on live G2 and on the G3 build (`focus-ring.cjs`, scratch): in both, focus is on `section.car-page` after Later. Chromium does not draw the ring there, so the ring itself was not reproduced; the owner can confirm on the live app with the same test character.

**Recommendation.** A small item of its own in **G4 (touch, focus and startup)**, behaviour tier because it changes focus: when a dialog closes and the only place to return focus is the page, do not draw the ring (or return focus to the control that opened the dialog when it still exists). Not a G3 revision.

## 2 · Sense, Commune and Summon should not need ticking

**The owner's proposal.** These are taught to every shugenja and are not a choice. On import, credit them to the School automatically if held, add them with their scrolls if missing, and keep the review for the real choices. A character should be functional on import.

**What the code shows.**

- The sheet records each Shugenja School's own "given" spells. Of 21 Schools, **19 give Sense, Commune and Summon**. **Fuzake Shugenja** also gives Path to Inner Peace. **Yogo Wardmaster** gives only Commune and Summon. So the rule must read each School's own list, not a fixed three.
- The creation wizard already adds a School's given spells by itself (`CW1123.addGiven`) and shows them as "Given by your School" without asking. Only the older-character review asks the player to tick them. The proposal makes the two agree.
- Crediting a held spell is a tag on rows the character already has. Adding a missing one creates a spell row and a scroll row.

**Recommendation: agree, with two conditions.**

1. Use each School's own given list.
2. Say what was done. The project's standing rule is that the sheet does not change a saved character silently. A line such as "Kitsu Shugenja: Sense, Commune and Summon marked as your School's spells" (and "added" for any that were missing) in the character check keeps that rule and still needs no click.

Apply it whenever an older character is opened, not only on file import, since older characters also arrive from the Characters list. A second Shugenja School's given spells are usually already held; the existing shared-credit record covers that.

**Where it belongs.** It changes what is written to a character, so it is **behaviour tier** and a unit of its own in the older-holdings area, not a revision of 8b.1-UI-01 (which is layout only and already handles any set of groups: the "Given by your School" group simply no longer appears). Mock-up first, as usual.

## 3 · The × on a Technique card sits inside the XP box

**What the code shows.** Every card built by `makeEntry` (Techniques, Kata, Kiho, and Advantages and Disadvantages) has its × absolutely placed in the top-right corner, over the right end of the Points or XP box. 8b.1-UI-03 cleared that corner for spell rows only, which is why the School Technique card above the spells now looks wrong beside them.

**Recommendation.** Take this as the **Revise for 8b.1-UI-03** (Claude's reading of the owner's Revise; to be confirmed): the same clear corner on every card in the Techniques list, so the XP box stops short of the ×. Advantage and Disadvantage cards have the same overlap; whether to include them in the same revision is the owner's call (same styling, a wider unit). Mock-up first.

## 4 · School Techniques: is the XP box or the × needed at all?

**What the code shows.**

- The sheet adds School Techniques itself, at 0 XP, tagged in their description "[School Technique — Rank N, School]" and listed in `f_schoolTechGranted`.
- It also takes them back itself: on a change of School the previous School's Techniques are removed; when an Alternate Path is taken, swapped or cleared, or the School Rank falls, Techniques the School no longer grants are removed. So the owner's last question is already answered: **removing the School or Path removes its Techniques.**
- If the player removes one with ×, nothing records that; it is added again the next time the School's Techniques are applied. The × on these cards is therefore misleading as well as redundant.
- Kata and Kiho bought with XP are the player's purchases and are never removed by the sheet.

**Recommendation: agree.** One rule, the same as point 2: **what the sheet gives automatically is not a choice, so it has no XP box and no ×; what the player chose keeps both.**

| Entry | XP box | × |
|---|---|---|
| School Technique, Path Technique, Advanced School Technique | no | no (goes when its School, Path or Rank goes) |
| A School's given spells (Sense, Commune, Summon, and the two exceptions) | none today | no |
| Kata and Kiho bought with XP | yes | yes |
| A free Kiho from the School (the player picked which) | as today | yes |
| A School spell the player chose, a reward spell | none today | yes (removing a chosen School spell reopens the choice, as today) |

A short tag, "School technique" or "Path technique", in the same quiet look as "School spell", would say why the card has no ×.

**Where it belongs.** A unit of its own, mock-up first. It hides controls and writes nothing, so it may stay screen-only; confirm at design. Points 2 and 4 share one idea and could form one small group after G3.

## Suggested order

1. Revise 8b.1-UI-03 (point 3), re-check it, then qualify G3 and go live on the owner's word.
2. A small group for the automatic entries (points 2 and 4), mock-up first.
3. Point 1 with G4.

## The owner's replies

*(none yet)*
