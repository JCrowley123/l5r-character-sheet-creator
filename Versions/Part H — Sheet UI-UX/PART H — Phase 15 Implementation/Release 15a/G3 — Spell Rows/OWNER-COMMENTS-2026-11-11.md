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

- The sheet records each Shugenja School's own "given" spells. Its table has 19 of 21 Schools giving Sense, Commune and Summon, Fuzake Shugenja adding Path to Inner Peace, and Yogo Wardmaster giving only Commune and Summon. **The Yogo entry is wrong**: see the book check below. The rule must still read each School's own list.
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

## The owner's replies (11 November 2026, in chat)

- **Point 1:** agreed — a small item in G4.
- **Point 2:** agreed to read each School's own list, not a fixed three; agreed it must not change a saved character silently; agreed it is its own unit at the heavier QA tier, not a change to 8b.1-UI-01. The owner corrected two Schools from the books: Fuzake Shugenja (Secrets of the Empire p.238: Sense, Commune, Summon, 3 Earth, 2 Water — one is automatically Path to Inner Peace — 1 Air) and Yogo Wardmaster (The Great Clans p.229: Sense, Commune, Summon, 3 Wards spells, 3 other spells, not Void), and asked for a double check of every Shugenja School.
- **Point 3:** the owner wants the × in the top right of every card, Advantages and Disadvantages included, not overlapping anything on the card. This is 8b.1-UI-03 revision 2; mock-up below.
- **Point 4:** agreed — no XP box and no × on automatic entries; Kata, Kiho and chosen entries keep both.
- **Order:** agreed — (1) 8b.1-UI-03 revision, then qualify G3 and go live on the owner's word; (2) a small group for the automatic entries, mock-up first; (3) the focus ring with G4.

## Book check of every Shugenja School's starting spells (11 November 2026)

Read from the owner's own rulebook PDFs on this machine (`C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books/`), as earlier audits did. Pages are PDF pages; the printed page is usually one to four lower (Fuzake prints as 238, Yogo as 229). Each line was compared with the sheet's table in `209.997-feat-wizard-starting-spells.js` and `209.998-feat-wizard-starting-spells-all.js`.

**Result: 20 of 21 match. One is wrong: Yogo Wardmaster is missing Sense.**

| School | Book, PDF page | The book's starting spells | The sheet |
|---|---|---|---|
| Agasha | Core, 128 | Sense, Commune, Summon, 3 Fire, 2 Earth, 1 Air | matches |
| Asahina | Core, 113 | Sense, Commune, Summon, 3 Air, 2 Water, 1 Earth | matches |
| Chuda (Shadowlands) | Core, 216 | Sense, Commune, Summon, 3 Maho of one Element, 2 Maho of a second non-Deficient Element, any 1 of a non-Deficient Element | matches |
| Chuda (Snake) | Core, 227 | Sense, Commune, Summon, 3 Earth, 2 Fire, 1 Water | matches |
| Fuzake | Secrets of the Empire, 239 | Sense, Commune, Summon, 3 Earth, 2 Water (one is Path to Inner Peace), 1 Air | matches; page not recorded in the sheet |
| Horiuchi | Great Clans, 258–259 | Sense, Commune, Summon, 3 Earth, 2 Water, 1 Fire | matches; page not recorded |
| Isawa | Core, 127 | Sense, Commune, Summon, 3 of one Element, 2 of another, 1 of a third, 1 of a fourth | matches |
| Iuchi | Core, 134 | Sense, Commune, Summon, 3 Water, 2 Earth, 1 Air | matches |
| Kitsu | Core, 121 | Sense, Commune, Summon, 3 Water, 2 Air, 1 Earth | matches |
| Kitsune | Core, 223 | Sense, Commune, Summon, 3 Earth, 2 Water, 1 Fire | matches |
| Komori | Core, 220 | Sense, Commune, Summon, 3 Air, 2 Water, 1 Fire | matches |
| Kuni | Core, 110 | Sense, Commune, Summon, 3 Earth, 2 Fire, 1 Water | matches |
| Moshi | Core, 124 | Sense, Commune, Summon, 3 Air, 3 Fire | matches |
| Moto Death Priest | Imperial Histories, 242 | Sense, Commune, Summon, 3 Earth, 2 Fire, 1 Water | matches |
| Ninube | Great Clans, 282 | Sense, Commune, Summon, 3 Air, 2 Fire, 1 Water | matches; page not recorded |
| Seppun | Core, 232 | Sense, Commune, Summon, 3 Fire, 2 Earth, 1 Air | matches |
| Soshi | Core, 130 | Sense, Commune, Summon, 3 Air, 2 Fire, 1 Water | matches |
| Tamori | Core, 116 | Sense, Commune, Summon, 3 Earth, 2 Fire, 1 Water | matches |
| Tonbo | Core, 221 | Sense, Commune, Summon, 3 Water, 2 Air, 1 Earth | matches |
| **Yogo Wardmaster** | Great Clans, 230 | **Sense**, Commune, Summon, 3 Wards spells, 3 other spells (not Void) | **wrong: Sense is missing** from its given list; the Wards and other-spell boxes match; page not recorded |
| Yoritomo | Great Clans, 170 | Sense, Commune, Summon, 3 Water, 2 Fire, 1 Air | matches; page not recorded |

**What the Yogo error does today.** The creation wizard does not add Sense for a Yogo Wardmaster, and the character check does not ask for it.

**Recommendation.** Fix it as a one-line bugfix unit at the start of the automatic-entries group, because that group reads these lists: add Sense to Yogo's given spells and record the five missing pages. It is not a G3 change. The book also holds Schools the sheet does not offer (one in Imperial Histories 2, and the Self-Taught and Dutiful Disciple Shugenja paths in Enemies of the Empire); they are outside this check.

## 8b.1-UI-03 revision 2 · mock-up (11 November 2026)

[The board](mockups/G3-UI03-R2-MOCKUP.png) (also [as a page](mockups/G3-UI03-R2-MOCKUP.html)). Scratch CSS on the G3 build, measured at 390 and 1440 px on the dense test character (`qa/ui03-r2-mockup/`):

- Today the × overlaps the XP or Points box on **18 of 18** Technique, Advantage and Disadvantage cards: 34 × 36 px on a phone, 21 × 25 px on a laptop.
- Proposed: the same clear corner the spell cards use, a 44 × 44 px target, **no overlap on any card**, and **no card taller**. The name box gives up 42 px (238 → 196 px on a phone). In Play the cards are exactly as today.
- Not shown on the board: a Kata or Kiho card. It is the same card as the School Technique card; the test character has none.

Awaiting the owner's approval of the mock-up.
