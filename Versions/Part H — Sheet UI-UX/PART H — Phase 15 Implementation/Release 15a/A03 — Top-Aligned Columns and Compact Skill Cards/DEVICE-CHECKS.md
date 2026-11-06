# A03 device checks — revision 2

**The owner's checklist is the Claude Doc:** [A03 device checks, revision 2](https://claude.ai/artifact/NuGaGAL8e4tDvjMJWfdnxy) (Pass/Fail for iPhone Safari and Laptop Edge, plus the decision). This file mirrors it as plain text. Revision 1's checklist, with the owner's comments that led to this revision, is the [revision 1 Claude Doc](https://claude.ai/artifact/CNTa2BVhtR2iHWrQ5EaNTM).

- **Test:** the [A03 preview](https://claude-release-15a-a03.l5r-character-sheet-creator.pages.dev/). It is branch `claude/release-15a-a03`, revision 2, application `e73b7c0c…de06`.
- **Compare with:** the [live app](https://l5r-character-sheet-creator.pages.dev/), which is A02, application `91d45109…6dc0`.
- **Character:** use a saved one with several Skills, some with Emphases, a School tick and Ranks of 3 or more, and both Advantages and Disadvantages.
- **Checks 8–10 edit Skills:** put them back afterwards, or work on a copy (**Save As**).
- **If the preview still looks like the live app**, reload it once: an installed copy updates on the next open.

| # | What to do | Pass looks like | iPhone Safari | Laptop Edge |
|---|---|---|---|---|
| 1 | **Live app first (comparison).** Open the character on **Skills**; on the laptop also open **Adv & Disadv**. | On the phone each Skill card is tall, with every field on its own line. On the laptop the shorter list's heading starts well below the other's. (This is what A03 changes.) | | |
| 2 | **A03 preview, laptop.** **Adv & Disadv** at the top, in Play and in Manage. | *Advantages* and *Disadvantages* start level, side by side, whichever list is longer. Each card keeps its own height, as in revision 1. | n/a | |
| 3 | **A03 preview, laptop.** **Skills**, in Play and in Manage. | The Skills table looks exactly as on the live app: every column and every Mastery note shown, no summary line. | n/a | |
| 4 | **A03 preview, iPhone.** **Skills** in Play. | Each card shows the name, **Rank** and the d10. Then comes one line with the Trait, Emphases and "School", beside the eye; a long line wraps rather than ending in "…". Then come the Masteries already reached. There is no Details control anywhere, and several Skills fit on the screen. The XP, the Emphasis count and the Free badges now appear only in Manage: say if you miss them in Play. | | n/a |
| 5 | **A03 preview, iPhone.** Play: compare a Skill below Rank 3 with one at Rank 3 or more. | The low Skill shows no Mastery lines. The higher one shows exactly the ones it has reached (for example "R3 ✓", and "R5 ✓" at Rank 5 or more), highlighted. | | n/a |
| 6 | **A03 preview, iPhone.** Play: tap a d10 and close the roll; tap an eye and close it. | The roll and the Skill information open as before, straight from the card. | | n/a |
| 7 | **A03 preview, iPhone.** Tap **Manage**, look at the cards, then tap **Done**. | In Manage every card shows its fields at once. The Trait and the School tick sit beside the eye, then come the Emphases with **+ Emph**, the XP, every Mastery note (those not reached in grey), and Remove (✕) last. **Done** brings back the Play cards. | | n/a |
| 8 | **A03 preview, iPhone.** Manage: lower a Skill's Rank below what its Emphases need, look at Play, then put the Rank back. | In Manage the count note turns red (for example "2 / 1 emphases at rank 1"). In Play the summary line starts with that red count until you put the Rank back. Raising a Rank to 3 or more makes its R3 Mastery appear in Play. | | n/a |
| 9 | **A03 preview, iPhone.** Manage: change the Trait, add an Emphasis with **+ Emph**, tick and untick **School**, straight on the card. | Every field works as on the live app, with no extra tap. Back in Play, the summary line shows each change. | | n/a |
| 10 | **A03 preview, iPhone.** Manage: tap **+ Add Skill**, then pick a Skill from **Add from Skill List**. | The blank row's Trait can be typed at once. The picked Skill arrives with its Trait filled, and in Play its Trait is on the summary line. | | n/a |
| 11 | **A03 preview, iPhone.** Scroll to the very end of **Skills**, in Play and in Manage. | The last card and its controls are clear of the corner buttons. | | n/a |
| 12 | **A03 preview, iPhone.** **Adv & Disadv**; then turn the phone sideways on **Skills**. | Adv & Disadv is as on the live app: Advantages first, then Disadvantages, one under the other. Sideways, Skills shows the table as on the live app, with every Mastery note. | | n/a |
| 13 | **A03 preview.** **⋯ → Print / Export PDF**, the browser's own print. Look at the Skills and Adv & Disadv pages of the preview, then cancel. | Printed as on the live app: the Skills table with all its columns and every Mastery note, and no summary line. | | |

**Not part of A03, so not tested here:**
- A04's information pattern and every other finding;
- the three 8b.1 UI follow-ups;
- FU-15a-1 (duplicate Kiho, Kata and spells);
- the always-visible stats header (parked with the Combat tab plan).

**Decision:** Accept / Revise / Remove.
- **Accept:** A03 stays as built. Merging to `main` and going live still wait for your separate go-live word.
- **Revise:** say what to change in a comment, and A03 is rebuilt and re-checked.
- **Remove:** A03 comes out with its own remover, which rebuilds A02's live app byte for byte. Nothing else changes.

A04 does not start until you decide.

## Results (6 November 2026)

- **Every box passed:** 17 in all (checks 1 and 4–13 on iPhone Safari, checks 1–3 and 13 on Laptop Edge). There were no comments.
- Check 13 on Laptop Edge and the decision were left blank in the doc. The owner gave both in chat: **Pass** and **Accept**.
- **Decision: Accept.** Merging and going live wait for the owner's separate go-live word.
