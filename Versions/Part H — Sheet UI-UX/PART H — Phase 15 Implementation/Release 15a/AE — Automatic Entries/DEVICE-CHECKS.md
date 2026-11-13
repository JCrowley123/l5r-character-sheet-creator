# Automatic entries device checks — mirror

**The owner's checklist** is the Claude Doc [Automatic entries device checks](https://claude.ai/artifact/MSCwtNQk4adKdxV6DBxxhn), created on 13 November 2026. Sixteen checks with a Pass/Fail choice for iPhone and Laptop: AE1 checks 1–3 on the AE1 preview, AE2 checks 4–10 on the AE2 preview, AE3 checks 11–16 on the AE3 preview (16 only if the owner has a character with an Alternate Path or an Advanced School), then an Accept / Revise / Remove choice per unit.

| Unit | Preview | Checks | Preview verified on its deployed files |
|---|---|---|---|
| AE1 · Sense for the Yogo Wardmaster | claude-release-15a-ae1 | 1–3 | 377/377 (`qa/hosted-preview/claude-release-15a-ae1/`) |
| AE2 · Given spells credited on opening (revision 2) | claude-release-15a-ae2 | 4–10, then R1–R4 | 393/393 for revision 1; 398/398 for revision 2 (`qa/hosted-preview/claude-release-15a-ae2/`) |
| AE3 · No XP box or × on automatic entries (revision 1) | claude-release-15a-ae3 | 11–16 | 413/413; 418/418 restacked on AE2 revision 2 (`qa/hosted-preview/claude-release-15a-ae3/`) |

**Results, read from the doc on 13 November 2026 (rev 1451):** 15 of 16 checks Pass on iPhone and Laptop; **check 9 Fail on both**.

| Unit | Checks | Result | Decision |
|---|---|---|---|
| AE1 | 1–3 | All Pass | **Accept** |
| AE2 | 4–10 | All Pass except **9** | **Revise** |
| AE3 | 11–16 | All Pass | **Accept** |

**Check 9, the owner's notes (summarised).** Removed Sense from Techniques and its scroll from Equipment, saved, loaded another character, came back to the Kitsu test character: no note, no Sense spell, but a Sense scroll added at the bottom of Equipment. On AE3, removing the Sense scroll (the sheet's own confirmation, "will remove your ability to cast Sense") took the spell with it; after Save and reopening, the scroll came back alone, again with no note. The owner's question: should a given spell the player removed after saving be added back at all? Scrolls can be lost or stolen for story reasons; the owner proposes adding missing given spells only when the character is first opened (with the note), and treating a later removal as the player's choice.

**What Claude found (13 November).** Not reproduced in the test browser along the owner's steps: Sense came back with its scroll and the note, in Manage and in Play, on AE2 and AE3. One related failure was found: when the creation wizard is still open (the Characters list does not close it when another character is opened), AE2's add goes through the wizard's School-choice path and is refused, so nothing is added and nothing is said. AE2's add step can therefore fail part-way or quietly, depending on other layers' state. Options and the recommendation are in the session; the decision is the owner's.

**AE2 revision 2, checked again (13 November 2026, doc rev 1465).** The doc gained a section "AE2 revision 2 · check again" with four checks on the rebuilt AE2 preview: R1 (a fresh import: the same note, the review shows only the real choices), R2 (Sense and its scroll removed after a save stay removed, with no note and no "still to choose" line), R3 (a first opening in Play of a character missing Summon: Summon and its scroll are added, with the note), R4 (the note survives reopening before a save; Save clears it). **All four Pass on iPhone and Laptop.**

**The owner's decision, 13 November 2026, in the Claude session:**

> "I have ran the new checks and they pass I am happy to mark all as passed and to accept AE1, AE2 and AE3"

At the owner's word, check 9 (which had failed on revision 1) is marked Pass and AE2's decision changed to Accept in the doc. **All three units are accepted:** AE1, AE2 (revision 2) and AE3 (revision 1). Not yet qualified or live.
