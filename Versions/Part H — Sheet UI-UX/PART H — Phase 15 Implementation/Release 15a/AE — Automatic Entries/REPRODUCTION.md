# Automatic entries: reproduction on G4 as live

13 November 2026 (Claude). Source SHA-256 `fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb`, 17,648,272 bytes, `main` at `60a5262a` (the same application bytes as production, verified by G4's live checks). Chromium 153 from the project's QA tools, 390 × 844 touch (device scale 2) and 1440 × 1000, one browser job at a time, with the suite's two preloads. Test characters: `BUGFIX — Older School Choices/qa/older-kitsu.l5r.json` and a copy without Summon and its scroll; the audit's dense Kuni Shugenja (`A03 …/qa/a03-fixtures.json`, `dense`) with a Kiho bought through the sheet's own picker; a new Yogo Wardmaster made in the creation wizard. Scratch evidence, not qualification; native Safari not used. No page errors in any run.

Scripts and results: `qa/mockup/` (`repro.cjs` and `common.cjs`: the three units; `ae3-names.cjs`: the name widths; `ae-rev.cjs`, `ae-rev3.cjs`: the round 2 and 3 pictures; `reproduction.json`, `names.json`, `rev.json`, `r3.json`).

## AE1 — Yogo Wardmaster

- The wizard's Spells step for a new Yogo Wardmaster: "starts with Commune, Summon, 3 Ward spells, 3 other spells that are not Void spells (Rulebook page not yet recorded)"; Given by your School: Commune, Summon. Learned: Commune, Summon, with two scrolls.
- With the table changed in the page (Sense added, The Great Clans p.229): Sense, Commune, Summon learned with three scrolls.
- The book check of 11 November (G3's owner comments) found 20 of 21 Schools right. Printed pages read from the owner's PDFs with pypdf on 13 November: The Great Clans PDF 170, 230, 258–259, 282 print as 169, 229, 257–258, 281; Secrets of the Empire PDF 239 prints as 238.
- Today a current Yogo character lacking Sense gets, from the existing starting-spells rule, "Still to choose: Sense (given by your School), …".

## AE2 — given spells on opening

- Older Kitsu: the character check shows "Kitsu Shugenja: review starting spells"; the review has four groups: Given by your School (Sense, Commune, Summon) 0 of 3, Water 0 of 3, Air 0 of 2, Earth 0 of 1.
- The copy without Summon: the same check line, nothing about Summon; the Given group still reads "0 of 3 chosen" over two boxes. Summon is offered only after Confirm, as "Add Summon".
- Proposed state, made with the sheet's own Confirm (given three only) and `#cw1123AddGiven`, merged into the before-save so the other rows stay pending: the review shows only Water, Air and Earth.
- Saving: Characters-list Import stores the file unchanged as a new entry (`CL11.importFile`); the change happens at the first opening. Autosave follows a listed character 1.2 s after a change (`CL11`).

## AE3 — Technique cards

- Dense Kuni Shugenja, Manage, phone: School Technique "Gaze Into Shadow" with XP box "0" and ×; name box 214 px. Sense, Commune, Summon with ×, name box 276 px. A Kiho bought for 6 XP: XP box and ×. Play: the School Technique still shows its XP box "0".
- Name widths (EB Garamond 16 px, canvas measure, 631 School, Path and Advanced School Technique names): room today 194 px (Manage) and 236 px (Play) on a 390 px phone, 10 and 1 names too long. Layout A (tag on the name line): room 171 px, 31 names too long (16 at 430 px), among them Hida Bushi Rank 2 "The Mountain Does Not Move" (shown as "The Mountain Does Not M"), Hida Rank 5, Mirumoto Rank 2, Bayushi Ranks 4 and 5, Shinjo Rank 4, Moto Death Priest Rank 1. Laptop: every name fits.
- Layout A with the fallback (tag on its own line only when the name overflows): no name cut; a fallback card is 26 px taller. The fallback's tag on the left lines up with the name box's left edge in Manage and with the name's text in Play (pill text 44 px, name text 46 px from the viewport edge).
