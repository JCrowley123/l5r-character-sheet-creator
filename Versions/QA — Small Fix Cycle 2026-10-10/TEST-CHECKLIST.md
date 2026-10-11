# L5R small fixes test checklist

Check the print repair, Export to PDF and the Skill Trait corrections on the live app. Use the iPhone first; Windows checks are optional. All results start as Not run.

Live app: https://l5r-character-sheet-creator.pages.dev/

Build to test: d5e418d — live verified 11 October 2026, 16:23 UTC

Test date: __________________    iPhone and iOS: __________________

Close existing app tabs and reopen the live app after the update; accept an update prompt if one appears. Confirm that a saved character’s menu includes Export to PDF. Before changing anything, use Export JSON to back up your character, then Save As a copy for testing. Keep the backup untouched.

For each test, choose Pass, Fail or Not run in its Result field and add notes. If your editor does not support dropdowns, edit the text or use the companion Markdown checklist. Report failures by ID and what you saw. A skipped check stays Not run.


## iPhone preparation and print quality

### P1 Open the print preview

**Do:** Open a test character. In the sheet menu, tap Print. Inspect every page in the phone’s print preview.

**Pass when:** Text is dark and readable throughout. The five Ring cards have no element symbols or cream wash. No large olive patch obscures the page. Record the page count; different devices may paginate differently.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### P2 Check the whole character

**Do:** Before printing, collapse Armour and Weapons and add several paragraphs to Background on your test copy. Compare the preview with the sheet: name, Clan, Family, School, Skills, Advantages, Techniques, Combat and the final line of Background.

**Pass when:** The correct character prints without cut-off text or overlapping Identity labels. Armour and Weapons content prints even when collapsed on screen, and the final Background line appears. Unapplied Clan, Family and School choices do not print.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### P3 Cancel and return to play

**Do:** Cancel the print dialog. Return to the sheet and open Clan and School, then Rings and Traits.

**Pass when:** The sheet still works. Its Ring artwork and Clan, Family and School pickers are present. Combat panels return to their previous open or closed states. Cancelling has not changed character values or left duplicate text.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**


## iPhone PDF export

### P4 Export the selected saved character

**Do:** Prepare two saved test characters with clearly different names and Schools, for example Crab and Crane. Open one, then go to Characters. Open the other character’s menu and tap Export to PDF.

**Pass when:** The print preview contains the selected character, including the correct name and School. It never exports the previously open character. After cancelling print, the selected character remains open.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### P5 Keep current edits in the PDF

**Do:** On the currently open test character, change a harmless text field such as Background. Without switching characters, use that character’s Export to PDF action.

**Pass when:** The preview contains the newly entered text. Character values and edits remain intact after cancelling. Use only a test copy for this check.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### P6 Protect an unsaved character

**Do:** Optional, if you already have an unsaved test sheet with edits. From Characters, try Export to PDF on a different saved character. In the discard confirmation, choose Cancel. Create New Character in the wizard saves automatically, so it does not prepare this test.

**Pass when:** No print dialog opens. The unsaved character and its edits are still available. If you have no suitable unsaved sheet, leave Not run; do not delete saves or clear browser data to create one.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### P7 Save and reopen the PDF

**Do:** Export your test character again. Use the phone’s normal print preview and Share action to Save to Files. Open the saved PDF in Files and inspect every page. The exact preview controls may differ by iOS version.

**Pass when:** The PDF opens, is complete and readable, and belongs to the selected character. It has no Ring symbols, cream wash or olive patch. Record the filename and page count in Notes.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**


## iPhone Skill Traits

### S1 Correct older saved rows

**Do:** On a test copy, set Intimidation to Willpower, Perform: Biwa to Awareness and Games: Go to Awareness to reproduce the old defaults. Record the ranks and spent XP, save, open another character, then reopen the test copy. An untouched pre-update backup may also be used.

**Pass when:** Intimidation becomes Awareness, Biwa becomes Agility and Go becomes Intelligence. Ranks and spent XP stay the same. This follows your ruling: old default values are corrected on opening, even if selected by hand. Other explicit Traits are tested in S4.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### S2 Add corrected Skills

**Do:** In Management, add Intimidation if it is absent. Add a blank Skill row and type Perform: Biwa. Add another and type Games: Go.

**Pass when:** Intimidation uses Awareness, Biwa uses Agility and Go uses Intelligence. Each row is usable and no duplicate or empty extra row appears unexpectedly.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### S3 Rename an automatic Trait

**Do:** Add a fresh blank Skill row and type Perform: Biwa. Once its Trait fills automatically, rename that row Games: Go without changing the Trait control yourself.

**Pass when:** The automatic Trait changes from Agility to Intelligence. The row’s rank is retained. Renaming it Perform: Song then gives Awareness.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### S4 Preserve a chosen Trait

**Do:** On a Perform: Biwa test row, choose Reflexes, rename it Games: Go, save and reopen. On another Biwa row, explicitly choose Awareness and rename it Games: Go. Check before saving, then save and reopen.

**Pass when:** Reflexes survives rename and reload. Explicit Awareness survives the rename in that session, then becomes Intelligence on reopening because it matches Go’s old default. Saved rows do not record how a Trait was chosen.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### S5 Use the corrected Trait in a roll

**Do:** Give your test character different Awareness and Agility values. Roll Perform: Biwa and inspect the roll preview. Cancel the roll after checking it.

**Pass when:** The preview uses Agility and the row’s Skill rank. It does not still use Awareness. Record the Trait values and displayed pool if the result is unexpected.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**


## iPhone remaining checks and optional Windows checks

### S6 Read the Craft guidance

**Do:** Add Craft or a named Craft row such as Craft: Carpentry. Read the note below its name and open Skill Info. Also inspect Craft in Search.

**Pass when:** Its starting Trait remains Awareness. The guidance explains that the Trait varies by craft and the GM sets it, citing Core Rulebook p.143. It does not assign a guessed Trait to Carpentry.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### S7 Filter Skills in Search

**Do:** Open Search, choose Skills and inspect the Trait filter. Select Awareness and search for Intimidation. Open the result.

**Pass when:** Intimidation appears under Awareness and its detail agrees. Willpower is absent from the default Skills Trait options. This does not prevent a player choosing a different Trait on their own row.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### S8 Create a character through the wizard

**Do:** In Characters, tap Create New Character. Choose Crane and Doji Courtier. Finish the wizard and inspect the School’s Perform: Storytelling row.

**Pass when:** Perform: Storytelling is present with Awareness and its School-granted rank. The wizard finishes normally. Storytelling intentionally remains Awareness; S2 and S3 check the changed sub-skill Traits.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### W1 Repeat PDF export on Windows

**Do:** Optional. In your usual Windows browser, repeat P4 and save the result through the browser’s PDF printer. Inspect the first and last pages and the Ring and Identity areas.

**Pass when:** The selected character prints correctly, all pages are readable and no Ring symbols print. Record the browser and whether its background graphics option was enabled.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**

### W2 Repeat the Skill checks on Windows

**Do:** Optional. In the Windows browser, repeat S2, S3, S4 and S7 using a test character.

**Pass when:** Adding and renaming Skills, preserving an explicit Trait and Search filtering behave as described on the iPhone. Report individual failing IDs in Notes.

**Result:** Not run (Pass / Fail / Not run)

**Notes:**
