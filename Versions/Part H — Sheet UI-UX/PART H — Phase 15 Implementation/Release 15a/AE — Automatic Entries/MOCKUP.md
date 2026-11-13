# Automatic entries: mock-ups and the owner's approval

13 November 2026 (Claude). The board, [mockups/AE-MOCKUPS.html](mockups/AE-MOCKUPS.html), was published to the owner as a private artifact (https://claude.ai/artifact/BnXmECYxk7aHHQkfQtcrHV) and revised twice the same day after the owner's replies (versions 2 and 3). It shows today beside the proposal for each unit, at phone and laptop size, with a recommendation. Every picture is the live build (`fa634abb…00cb`, `main` at `60a5262a`, G4 live) in a test browser, with the proposal applied only in that browser. How the pictures were made: [REPRODUCTION.md](REPRODUCTION.md).

The group comes from the owner's rule of 11 November 2026 (G3's device round, [owner comments](<../G3 — Spell Rows/OWNER-COMMENTS-2026-11-11.md>), points 2 and 4): what the rules give a character automatically is not a choice, so it gets no review, no XP box and no remove button, and a character should be functional when it is opened.

## The units as approved

| Unit | Approved scope | Tier |
|---|---|---|
| **AE1** Yogo Wardmaster's given spells | Yogo Wardmaster's given spells become Sense, Commune, Summon (The Great Clans p.229), and its line reads "Sense, Commune, Summon, 3 Ward spells, 3 other spells that are not Void spells". Five sources recorded from the owner's PDFs (printed pages): Fuzake Secrets of the Empire p.238; Horiuchi The Great Clans p.257–258; Ninube The Great Clans p.281; Yogo The Great Clans p.229; Yoritomo The Great Clans p.169. Phase 11.2.4's wizard harness pins the old values; AE1 makes those pins conditional on itself and declares it. | Behaviour |
| **AE2** Given spells credited on opening (revision 1) | Whenever a character is opened (file or Characters list), for each Shugenja School it has, the School's own given list is read: held spells (and their scrolls) are marked as that School's spells, missing ones are added with their Spell Scroll. One note per School in the character check names each spell and says "marked" or "added", ending "This note goes once you save the character." The note is kept with the character until the player saves it themselves (Save, Save As New or Export JSON); autosave does not clear it. The change is part of opening, not an undo step. The older-holdings review then asks only about the real choices. | Behaviour |
| **AE3** No XP box or × on automatic entries | School, Path and Advanced School Techniques the sheet added (description starting "[School Technique — Rank N, School]" or "[Advanced School Technique — …]") with an XP figure of 0: no XP box, no ×, a quiet tag ("School technique", "Path technique", "Advanced School technique") on the name's line (layout A). **Fallback:** on a card whose name does not fit beside the tag, the tag moves to the start of the next line, on the left. A School's given spells lose the × while that School is on the character, and their name box takes back the corner. Kata, Kiho (bought or free) and chosen or reward spells keep both. The XP box is hidden, not removed: saves are unchanged. | Screen-only |

Proposed names AE1–AE3 (markers `PART H PHASE 15.1.28` to `15.1.30`), each with its own folder, switch, harness, remover and removal-chain entry after A17.

## The owner's replies, 13 November 2026, in the Claude session

**Round 1** (board version 1: AE1, AE2, AE3 with layout B recommended):

> "I am happy to approve AE1 as reccomended"

> "I am happy with the idea of AE2, but I think extra work is needed. I think that the note about what spells where added if any should maybe only be there for the initial import, once there has been a manual save or something, I think it is safe to reasonably assume that the player is aware of the change and the note is no longer needed."

> "I think for AE3 i prefer layout A, having the tag on the same line as the technique name. Particularly in play mode because you then have a lot of empty space both to the right of the technique name and to the left of the tag, which I think looks "odd" and "unprofessional". … But I wonder is there a technique name that even comes close to utilising the full length of the text box? If there isn't then I don't see it being a problem."

**Round 2** (version 2): AE2 revision 1 (the note kept until the player's own Save, Save As New or Export JSON; autosave does not count). AE3: measured that 31 of the sheet's 631 School, Path and Advanced School Technique names do not fit beside the tag on a 390 px phone (16 at 430 px), Hida Bushi's Rank 2 among them; proposed layout A with a per-card fallback.

> "I like the idea of the layout A with the fallback. But I am still not too sure about the tag being on the right hand side of the card because of that extra empty space … would it be worth moving the tag to the left instead for only the fallback."

**Round 3** (version 3): the fallback's tag on the left of its new line, shown beside the right, recommended.

> "Approve as recommended"

| Unit | Approved |
|---|---|
| AE1 | As proposed (round 1) |
| AE2 | Revision 1 |
| AE3 | Layout A with the fallback, the fallback's tag on the left; the given spells' × included |

This is mock-up approval. It permits the build and preview stage: three separately owned units, stacked previews, light checks, one code review, then the owner's device round with Accept / Revise / Remove for each. It is not device acceptance, qualification or a go-live instruction. AE1 and AE2 are behaviour tier, so the qualification needs the 4× CPU screen and two full passes.
