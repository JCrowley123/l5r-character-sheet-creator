# Automatic entries: code review (read-only), 13 November 2026

Claude, after the five-hour usage window reset. Scope: the application diff `60a5262a..claude/release-15a-ae3` (Phase 0 `src/`, the manifest, the seam blocks, the removal-chain registry) and the declared changes to other layers' harnesses, reviewed one unit at a time with findings written down before the next unit. The harnesses were read for whether their checks can fail; their results are in each unit's README.

## AE1 — Sense for the Yogo Wardmaster (`df9100da`)

Read: `209.999999999999999995-feat-yogo-given-spells.js`, the seam block, the manifest entry; for the interface, Phase 11.2.4's table and every reader of a School's `given` list (the wizard's `addGiven` and `status`, the character check's rule, the older-holdings review, the Rank spell choices and their picker).

- **Load order.** The fragment runs once as the sheet loads, after Phase 11.2.4 built `CW1124.table`. Every reader looks the list up when it runs (`CW1123.forSchool`), and none copies it at load, so all of them see the corrected line.
- **Reach.** Only Yogo's `given` and `text` and five `source` strings change. `given` is replaced by a new array, not changed in place, so nothing holding the old array is surprised. Kitsu's entry (Phase 11.2.3's own table) is not touched.
- **Existing Yogo characters.** The wizard's `givenDone` guard is per wizard run, so a Yogo Wardmaster made before AE1 is not given Sense by the wizard; the character check lists it and AE2 adds it on opening, as the mock-up said.
- **Phase 11.2.4's harness.** The conditional reads `YG15` and its switch from the test seam; with AE1 absent, both its table check and its walk expect the old lines exactly.

**Findings: none.**

## AE2 — Given Spells Credited on Opening (`14d9969e`, `2159ae09`)

Read: `209.999999999999999996-feat-given-spells-on-opening.js`, the seam block; for the interfaces, `applyData`, `collectData`, `clearAllRows`, `saveCharacter`, `loadCharacter` and the file import (`120-persistence.js`), the Characters list's wrappers and autosave (`CL11`), the save format and audit log wrappers (Phase 7 and 7.1, Part J), the School-choice records (`SC8`, `SC8Logic`), the older-holdings layer (`OC8`) and `CW1122.addSpell`.

- **Wrapper order.** This fragment is the last to rebind `applyData`, so it runs after the Characters list has written the previous character, after the save format has read the file, after the audit log has restarted, and after the older-holdings layer has marked what its review will ask about. The review then excludes the spells this unit credits, because it filters by `credited(school)`.
- **No autosave while opening.** During `loadCharacter` the Characters list's `currentId` is still the previous character's until `applyData` returns. The unit never calls `SC8.changed()` (which flushes) and writes nothing to storage; `CL11.markSaved()` then records the opened state, note included. A later edit autosaves the note with the character, which is what revision 1 asked.
- **Adding a missing spell** goes through `CW1122.addSpell` outside any School-choice scope, so neither the older-holdings guard nor the School-choice tagger intervenes; the unit then writes the same record the School-choice layer writes in its picker (`created: true`, and `created` for the scroll only when the scroll was new). A spell the sheet's own rank rule would refuse (`spellEligibility`) is skipped and not claimed in the note.
- **Shared credit.** A spell already recorded for another School gets this School added (`SC8Logic.addSchool`), as the review does; the note then names it for this School too.
- **A spell held under a former name** is found through `SC8.spellRow`, which compares current names, so it is marked, not added twice.
- **The note.** Restored from the save, merged per School, cleared by `clearAllRows` (a new blank sheet), by `saveCharacter` (Save, Save As New and the Characters list's own saves) and by `exportJSON` of the open character. An export of a stored, unopened character from the Characters list strips the note from the file and leaves the stored copy as it was. `gs15Open` is a non-enumerable marker, so it is never saved.
- **Two edges, recorded rather than changed.** (1) If a Save fails (storage full), the note has already been cleared for that session; the spells stay credited and the failure message shows. (2) If the character check were switched off (`CHARACTER_VALIDATOR_ENABLED = false`), the change would still be made with no note; the check is never switched off in any build.
- **Declared conditionals.** `GS15.paused` is set only by six harnesses' pages and stops only `afterOpen`; the note's wrappers still run, with nothing to write.

**Findings: none needing a change.**

## AE3 — No XP Box or Remove on Automatic Entries (`acb4587f`)

Read: `209.999999999999999997-feat-automatic-entry-controls.js`, `1146-automatic-entry-controls.css`, the seam block; for the interfaces, `makeEntry`, the School Technique labels written by `applyUnlockedTechniquesToList` and the Advanced Schools' `grant`, `pathAtRank`, `getSchoolsList`, `AS47.record`, the School-choice records, 8b.1-UI-02's tag and 8b.1-UI-03's corner rules.

- **Only labelled cards.** The test is the label the sheet itself writes at the start of the description, its School on the character, and an XP figure of 0. A Technique the player typed, or one whose label names a School the character no longer has, keeps both controls, so nothing the sheet would not take back is ever locked.
- **The hidden × still works for the sheet.** `CW1122.removeSpell` and the School-choice layer remove rows with `.rm-btn.click()`, which works on a hidden button.
- **Specificity.** Each rule names the list's ID and three classes, so it outranks 8b.1-UI-03's corner rules (one ID through `:is()`); print is untouched.
- **Fallback measurement** is done with the card on one line, then the class is set; it runs in an animation frame after any change, so a burst of edits is measured once.
- **Finding 1 (fixed, revision 1).** The body-class observer queued a sweep on every change to the body's classes. A10.1 adds its keyboard mark on navigation keys and takes it away on taps, and other layers change the body's classes too, so the cards were re-measured, with a forced layout per Technique card, after such taps and keys. Harmless at normal speed, wasted under the 4× CPU screen. The observer now acts only when the mode changes (Manage or Play). One check added, pinned before its first run: `AX-TAPS-DO-NOT-REMEASURE-PHONE` (19 + 1 = **20**).

## Summary

| Unit | Findings | Change |
|---|---|---|
| AE1 | none | none |
| AE2 | none needing a change; two edges recorded | none |
| AE3 | 1 (re-measuring on every tap) | revision 1: the observer watches only the mode; one check added |
