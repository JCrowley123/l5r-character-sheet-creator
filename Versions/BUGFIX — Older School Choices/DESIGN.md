# Older characters and their starting School choices

**2 November 2026 · Release 8b device feedback · Design for the combined follow-up**

The owner reported an extra free Skill and extra starting spells when opening a character made before Release 8b. The owner confirmed that Osamu’s Jurojin’s Balm was a campaign reward and asked to design the correction before building both fixes together. The spell review below is a proposal for testing.

## What Osamu’s save tells us

| Saved evidence | What the app can establish |
|---|---|
| Kitsu Shugenja is his only School. Its application record lists six named Skill grants. Defense is a seventh School-ticked Skill at Rank 3. Courtier and Iaijutsu are unticked. | Defense is the only eligible extra School Skill for Kitsu’s one choice. The sheet already shows 5 XP for its paid ranks. |
| Techniques and Equipment contain Sense, Commune, Summon, three Water spells, two Air spells and Jurojin’s Balm (Earth). The rows have no starting-choice source. | The save establishes ownership. It contains no evidence distinguishing the eight starting spells from the Earth reward. Mastery, memorisation, cost and a matching Equipment row cannot establish where a spell came from. |

Release 8b counts explicit School choice records. Those records did not exist when Osamu was built. In a fresh browser, the unchanged release offered Meditation alongside his ticked Defense and allowed additional Water and Air grants. Four pinned checks reproduced the failures against his file and a small synthetic Kitsu fixture. The tests imported copies into temporary browser storage. [Reproduction harness](qa/legacy-grants-harness.js) · [Owner-file result](qa/reproduced-8b.log) · [Fixture result](qa/reproduced-fixture-8b.log)

## Defense and other free School Skills

1. Start with the explicit choices for each held School. For older rows, consider ticked Skills at Rank 1 or above. Exclude fixed School grants from every held School, respecting the sheet’s existing Skill names, aliases and named subjects. A paid, unticked Skill never fills a slot automatically.
2. Match the remaining eligible rows to the actual open slots. When the assignment is unambiguous, recognize it on the existing row. For Osamu this fills Kitsu’s single slot with Defense. The note disappears in Manage and Play. Meditation is still available through the ordinary paid Skill controls.
3. Preserve the row’s Rank, emphases and XP. Osamu keeps Rank 3, the School tick and the same 5 XP. Loading him repeatedly, exporting him or switching characters must never give a second discount. The original import file is never rewritten.
4. If several held Schools or several distinct rows could claim the same slot, show the eligible **existing** rows and their Schools for confirmation in Manage before offering anything new. If 8b has already recorded a different choice alongside an older ticked row, keep both rows and flag the conflict for the player. Silently deleting a Skill or changing its XP could damage a character already in play.

## A one-time starting-spell review in Manage

Use the character-check note as the entry point. For an older character with unclassified eligible holdings, its action should say **Review starting spells**. The review comes before any new School grants. Play keeps a plain note. A character with no older candidates can use the ordinary picker straight away.

The review lists spells already on the sheet, grouped by the School’s actual allotment. Start with existing explicit grants already counted. Leave unclassified holdings unselected. Show each spell name and how many choices remain in its group. The prompt can read *Select the spells your School gave you at creation. Leave later rewards unselected.* The player can leave and return without committing a partial decision.

For Osamu the proposed confirmation reads as follows.

| Group | Starting spells the player selects | Still owed after confirmation |
|---|---|---|
| Given | Sense, Commune, Summon | None |
| Water | Reflective Pool, Reversal of Fortunes, Clarity of Purpose | None |
| Air | Blessed Wind, Tempest of Air | None |
| Earth | Leave Jurojin’s Balm unselected | One Earth spell |

**Confirm starting spells** records the selected existing rows as School choices. Jurojin’s Balm stays in Techniques and Equipment as his reward. The normal picker then offers one eligible Earth choice. After choosing a different Earth spell, Osamu legitimately owns two Earth spells, of which one counts as a starting grant. Water and Air are already full.

**Later** or closing the review leaves the character as it was. Confirmation must validate the whole selection against the same School allotment used by the wizard, including Schools that share choices across Elements. If a saved selection would exceed a quota, show which group to correct before writing any changes. Enforce the cap again when granting a spell, so a stale picker cannot grant it twice.

## Saving and returning

Keep the outcome per character and held School. Distinguish an older unreviewed save from a current save with a deliberately empty choice. Keep valid 8b School records. Persist confirmed choices and the completed review through save, reload and export/import. An Equipment addition after the review keeps its ordinary source and never reopens the review. The character check reads this state without writing to it.

## Acceptance for the combined build

- Import Osamu. Defense fills the free slot, stays at Rank 3 and costs 5 XP. There is no route in the School picker to grant Meditation as a second free Skill. An unfinished character with no eligible ticked row can still take their free Skill.
- Review Osamu’s eight starting spells as above. The School adds zero duplicate spell or scroll rows. Only one Earth choice remains. Make that choice and verify that the note clears and the Balm is still owned. Repeat after save, export/import and a character switch.
- Close before confirming and compare the entire character state. Reopening must offer the same review. Confirm a genuine all-rewards case and verify that it stays reviewed with its School entitlements open.
- Exercise a partially tagged 8b save, a School with restricted Skill choices, a multiple-School character, a complex spell allotment, a later Equipment reward and a current character created from scratch. Keep existing paid ranks, memorisation and Equipment quantities.
- Pin the remaining review and boundary checks before implementation. Run the affected harnesses under load and perform the project’s release qualification on the combined candidate, including exact rollback to Release 8b. The next build is a Release 8b follow-up, separate from 8c’s level-up picker.
