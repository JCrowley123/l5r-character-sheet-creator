# B18 · One Name per Button Job — stage 1: the inventory

Prepared by Claude on **21 November 2026**. Read-only: no application file was edited and nothing was pushed to `main`. Build `921f3ac9…6150` (17,718,601 bytes), the live Release 15a sheet. Stage 2 is the owner’s ruling on each group; stage 3 is the build, a group of its own. The table of every control is [inventory.json](inventory.json); how it was made is in [REPRODUCTION.md](REPRODUCTION.md).

The owner’s words that started this unit (20 November 2026, verbatim):

> I approve round 3.  But I think we need to make a note that again phase 15 was meant to be a UI/UX consistency pass.
>
> If in one place I use the phrase reset and in another I have reset session.  I feel that an additional unit is needed to check the whole sheet to see if there are other buttons that do similar jobs but should maybe have one consistent naming convention.

The owner approved the three-stage plan ("Approve as proposed"). B17 builds with "Reset session" until the owner rules on group G01.

## 1. The result in one table

**405 controls** in **23 job groups** (14 of them put to the owner as a question; the rest need no ruling). 237 were read live on the test character, 160 from the source because the live test could not reach them (35 of those are the button words of the sheet’s one question window and one message window), and 8 exist in the page but are never shown.

| Group | Job in plain words | Controls | Words today | Recommended | Asked |
|---|---|---|---|---|---|
| G01 | Giving back a once-per-session use | 6 | “Reset session”, “Reset” | Reset | yes |
| G02 | Opening a choice again | 22 | “Choose School Skills”, “Choose School scrolls”, “Choose…”, “Change”, “Change / Choose… / Add region”, “Change / Choose…”, “Choose again” … | Change | yes |
| G03 | Taking something off the sheet | 14 | “✕”, “Delete”, “Remove”, “Return {n} koku” | Remove (visible ✕ stays)  ·  Delete for saved characters and books | yes |
| G04 | The ✕ in the corner of a window | 34 | “✕”, “(close glyph)” | ✕, announced "Close {window}" or "Cancel {window}" | yes |
| G05 | The buttons at the foot of a window | 70 | “Cancel”, “Confirm”, “Next”, “Got it”, “Favour lost”, “Exit”, “OK” … | Message: OK  ·  Yes: Confirm (or the action’s own name)  ·  No: Cancel  ·  Done where changes apply as you go | yes |
| G06 | Using an ability now | 3 | “Use”, “Use {precept}”, “Use it now” | Use | yes |
| G07 | Spending a Void Point | 8 | “Spend a Void Point”, “Spend Void: +1k1 to a Skill, Trait, Ring, or Spell Casting roll”, “Spend Void: Make an Unskilled roll Skilled (Rank 0 → 1) — 10s explode”, “Spend Void: +10 TN to be hit”, “Spend Void: +10 Initiative (skirmish)”, “Spend Void: Reduce damage by 10”, “Spend Void: Activate a Kiho” … | Spend Void | yes |
| G08 | Rolling again | 8 | “Re-roll 1s”, “Spend Luck (2/3)”, “GM invokes Unlucky (1/2)”, “Re-roll selected”, “Reroll with Dark Paragon ({n}/1)”, “Re-roll with Kakita (a Void Point)”, “Add Sun Tao’s die (a Void Point)” … | Reroll with {source} | yes |
| G09 | Clearing what you entered | 2 | “Clear”, “Clear filters” | Clear | yes |
| G10 | Adding something | 31 | “+ Add School”, “+ Emph”, “+ Add Skill”, “+ Load Full Skill List”, “Add 1.5 koku”, “+ Add Advantage”, “+ Add Disadvantage” … | + Add {thing} | yes |
| G11 | Rolling the dice | 42 | “10”, “Check Taint growth”, “Reflexes”, “Awareness”, “Agility”, “Intelligence”, “Strength” … | Roll / Cast / Check (as they are) | yes |
| G12 | The information buttons | 23 | “Affinity Earthⓘ”, “Deficiency Airⓘ”, “i”, “?”, “ⓘ”, “👁” | i | yes |
| G13 | Undo | 2 | “Undo” | Undo | no |
| G14 | Plus and minus buttons | 18 | “−”, “+” | −  +  (the glyphs stay) | yes |
| G15 | Moving around the sheet | 31 | “Sheet”, “Characters”, “Library”, “Search”, “‹”, “›”, “Clan & School” … | (as they are) | no |
| G16 | Saving, copying and exporting | 18 | “Save”, “⋯”, “Save As a copy”, “Print”, “Export JSON”, “History”, “Import JSON” … | Export PDF  (and "Export JSON" as it is) | yes |
| G17 | Applying a choice to the sheet | 7 | “Apply Family (+1 Trait)”, “Apply School”, “Apply”, “Set”, “Begin training”, “Resume {School}”, “Set Rank” | (as they are) | no |
| G18 | Switching between Play and Manage | 2 | “Done”, “Manage” | (as they are) | no |
| G19 | Choosing one thing from a list | 15 | “Earth”, “Fire”, “Water”, “Search”, “(a page thumbnail)” | (as they are) | no |
| G20 | Ticks in the roll preview | 1 | “Missing Limb: Uses your missing limb: TN +10” | (as they are) | no |
| G21 | Pips you tap | 3 | “(no text: a pip)” | (as they are) | no |
| G22 | Headings that open and close | 9 | “GM overrides: Advantage and Disadvantage sets”, “Armor & TN ⓘ”, “Weapons ⓘ”, “Stance”, “Void”, “Ten Dice Rule breakdown”, “Rule” … | (as they are) | no |
| G23 | One-off actions | 36 | “Lost ancestor’s favour”, “(icon)”, “Recognition by your lord”, “Untrained Skills”, “Already added”, “Show Structured Mastery”, “Show Free-Text Mastery” … | (as they are) | no |

## 2. Method

- **Character:** A03’s dense test character (`dense`), plus a Kharmic Tie (Rank 3, Aiko, 2 of 3 left), Luck, Dark Paragon, Great Destiny, an Ancestor (Kuni, once-a-session gift spent), and, on the Disadvantage side, Haunted and Unlucky. A second run of the same character as an Imperial with the Seppun Ancestor showed the Ancestor card’s “Use it now”.
- **Sizes and modes:** a phone (390×844, touch, scale 2) and a laptop (1440×1000), each in Manage and in Play. Every carousel tab was read with its disclosures opened; then each window and page below was opened in turn and read.
- **What counts as a control:** `button`, `summary`, links, `role=button`, and any element with a pointer cursor that is not a form field (chips, rows with a tick, the Ring names). For each: the visible label (as written in the source; most are drawn in capitals by the style sheet), its spoken name (aria-labelledby, then aria-label, then its content, then its title, which is what a screen reader uses), its title, where it is, the modes and sizes where it showed, and the source file and line.
- **Windows and pages opened:** A saved character’s row menu; A wound level (window); About Ancestors (i); Add Advantage picker; Add Arrows; Add Disadvantage picker; Add Item; Add Skill picker; Add Technique / Kata / Spell; Add Weapon; Add spell scroll; Advantage information (i); Affinity (i badge); Attack & Damage formula (i); Cast a spell; Change (a choice already made); Characters screen (nothing saved yet); Characters screen with a saved character; Check Taint growth; Choose… (an Advantage that needs a choice); Create New Character: the discard question; Create New Character: the wizard’s first screen; Dark Paragon information (i); Hotei information (i); Kiho rules information (i); Library; Load full skill list; Lost ancestor’s favour (badge); Manual dice (floating 10); Quick Access panel; Remove an Advantage (✕); Roll Initiative (preview); Roll attack (preview); Roll preview (a skill roll); Roll result; Search; Search: a detail (a School); Search: a detail (an Advantage); Search: a typed query; Search: one category’s list; Skill information (i); Stance rules (i); TN & Initiative formula (i); Undo line after a quick tap (Honour +); Untrained Skills; Void Points information (i); Weapon Info (eye); Why can’t I cast this? (?); ⋯ More menu.
- **Three kinds of row.** *Live* rows were read in the page. *Source only* rows are controls the test character could not bring up (Library reader, the wizard’s later screens, Ancestor after-roll gifts, the PDF window, Darling of the Court, …); each was found by a scan of the source and read by hand (`qa/inventory/static_extra.py`). The button words of the question and message windows come from reading every call of `appConfirm`, `appConfirm3Way` and `appAlert` (`dialog_labels.py`): 75 calls, 35 different words. *Hidden* rows are in the page but never shown to a player (the older toolbar, the Rank settings steppers).
- **Labels built at runtime** (a name joined to a word, a word passed to a helper) are why a text search is not enough; the live read and the call reader fill the gap, and the source column points to where the word is made.
- **Source lines** are under `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/src/`. A row can carry more than one place when one label is written in several files.
- **Harness pins:** every script (`.js .cjs .mjs .py`) in a `qa/` folder under `Versions/`, and every checks file (1368 files), was searched for each label as a quoted string, as a word in a regular expression, or in a Playwright text selector (two words or more also as plain text). Short words (Use, Add, Done, Close) over-match, so the counts are an upper bound and each hit must be read at build time. The B18 scripts and the Release 15b mock-up scripts were excluded.

### What the live read could not reach

- The Library reader and book manager need the owner’s book files; their buttons are source-only rows.
- The creation wizard was read on its first screen only; its later screens are source-only rows.
- Pressing the "+ Add …" buttons adds a blank row (its controls are in the page read) and removing an entry removes it at once, so neither opens a window.
- Result-window buttons that appear only after a matching roll (Dark Paragon’s reroll, the Ancestor gifts of Kakita, Sun Tao and Toku) are source-only rows.
- The Void spend Undo line and the Honour tap Undo line are hidden until used; they are in the Undo group from the source.
- A few windows (Roll preview with a Void option ticked, Cast with every Element) were opened once; the buttons are the same.

## 3. The groups

### G01 · Giving back a once-per-session use

- **Job:** Put the uses of one ability back to full at the start of a new game session. The combat round counter has a button of its own that puts the round count back to the start; it is a different thing but the same kind of act.
- **Controls:** 6.
- **Do the differences carry meaning?** No. All seven session buttons give uses back for a new session (Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky and the Ancestor card). The one round-counter "Reset" is a different job (it is not about sessions) but also puts a counter back to its start.
- **Recommended word:** Reset.  **Spoken name:** Reset {name} for a new session.
- **Why:** It is the word the owner used for Kharmic Tie, it fits the one-row Kharmic Tie card on a phone (the reason for the question), and the card already shows which ability it belongs to. The spoken name still says "for a new session", so nothing is lost for a screen reader. The round counter’s "Reset" then already matches.
- **Other choices for the owner:** Reset session (keep, and rename the round counter to "Reset rounds"); New session; Refill.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C014 | Reset session | (same) | Clan & School | Both | sheet/209.99998-feat-ancestors.js:1387, sheet/209.99998-feat-ancestors.js:1385 | label "Reset session" → "Reset"; spoken name → "Reset {name} for a new session" |
| C062 | Reset session ×2 | (same) | Adv & Disadv | Both | sheet/209.82-feat-adv-config-kharmic-tie.js:53, sheet/209.83-feat-adv-config-resources.js:50 | label "Reset session" → "Reset"; spoken name → "Reset {name} for a new session" |
| C066 | Reset session | (same) | Adv & Disadv | Both | sheet/209.92991-feat-adv-dark-paragon.js:404 | label "Reset session" → "Reset"; spoken name → "Reset {name} for a new session" |
| C068 | Reset session ×2 | Great Destiny: make it available again for a new session  (varies; e.g | Adv & Disadv | Both | sheet/209.9999999-feat-damage-sessions-xp.js:370, sheet/209.9999999-feat-damage-sessions-xp.js:376 | label "Reset session" → "Reset"; spoken name → "Reset {name} for a new session" |
| C079 | Reset session | Restore Unlucky to its per-session maximum | Adv & Disadv | Both | sheet/209.93-feat-disadv-unlucky.js:148 | label "Reset session" → "Reset"; spoken name → "Reset {name} for a new session" |
| C225 | Reset | (same) | Combat | Play | markup/10-swipe-tab-shell.html:462 | spoken name → "Reset the round counter" (label stays "Reset") |

**Places that would change:** 6 controls above (the "Would change" column)
- also: src/sheet/209.9999999-feat-damage-sessions-xp.js:197 an alert says "Reset session to use it again."
- also: src/sheet/209.9999999999998-bugfix-ancestor-gifts-logic.js:26 a note says "ready again after Reset session on the Ancestor card"
- also: B17’s planned information window for Kharmic Tie ("Reset session gives back all 3")

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Reset session”: 8 files, 9 copies. adv-config-expansion-harness.js×1, ancestor-gifts-harness.js×1, ancestors-harness.js×2, checklist-walk.cjs×1, checklist-walk.js×1, checklist-walk.json×1, damage-sessions-xp-harness.js×1, disadv-unlucky-harness.js×1

**A04.2:** rows in this group sit on cards that A04.2 will redraw; see section 4. The owner ruled that the Reset rows are scheduled with A04.2.

### G02 · Opening a choice again

- **Job:** Open a window or a list again so a choice you already made can be changed (or made, the first time).
- **Controls:** 22.
- **Do the differences carry meaning?** Partly. "Choose…" (nothing chosen yet) and "Change" (a choice exists) are the same button that changes its word with its state; that difference means something and should stay. The rest are the same job under other names: "Choose again" in the creation wizard. "Edit" and "Pick" are not button words anywhere on the sheet (the first text scan found code names and a select’s id, not buttons).
- **Recommended word:** Change.  **Spoken name:** Change {thing}  (and "Choose {thing}" before a first choice).
- **Why:** One word for "reopen what I picked". Keep "Choose…" only for the very first choice. The spoken name should start with the word on the button: today nine kinds of Advantage card have a button that says "Change" or "Choose…" but is announced as "Configure {thing}", which does not match what a voice-control user would say.
- **Other choices for the owner:** Edit; Choose again; Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C033 | Choose School Skills | (same) | Identity | Manage | sheet/209.9999999999999991-feat-school-choices.js:157 |  |
| C034 | Choose School scrolls | (same) | Identity | Manage | sheet/209.9999999999999991-feat-school-choices.js:157 |  |
| C058 | Choose… ×2 | (same) | Adv & Disadv | Manage | sheet/209.8-feat-adv-config.js:578, sheet/209.8-feat-adv-config.js:564 | give the button a spoken name of its own ("Change {thing}") |
| C061 | Change ×6 | Change  (varies; e.g. Configure Dark Paragon) | Adv & Disadv | Manage | sheet/209.8-feat-adv-config.js:564, sheet/209.8-feat-adv-config.js:578 | give the button a spoken name of its own ("Change {thing}") |
| C248 | Change / Choose… / Add region | Configure {entry name} | Adv & Disadv: Blackmail, Forbidden Knowledge,  | Manage | sheet/209.925-feat-adv-named.js:124 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C250 | Change / Choose… | Configure Darling of the Court | Adv & Disadv: Darling of the Court | Manage | sheet/209.926-feat-adv-court-servant.js:240 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C254 | Change / Choose… | Configure Heart of Vengeance | Adv & Disadv: Heart of Vengeance | Manage | sheet/209.928-feat-adv-heart-vengeance.js:130 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C260 | Change / Choose… | Configure Paragon | Adv & Disadv: Paragon | Manage | sheet/209.9295-feat-adv-paragon.js:88 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C262 | Change / Choose… | Configure Soul of Artistry | Adv & Disadv: Soul of Artistry | Manage | sheet/209.9296-feat-adv-soul-artistry.js:165 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C264 | Change / Choose… | Configure Void Versatility | Adv & Disadv: Void Versatility | Manage | sheet/209.9297-feat-adv-void-versatility.js:198 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C266 | Change / Choose… | Configure Seven Fortunes’ Blessing | Adv & Disadv: Seven Fortunes’ Blessing | Manage | sheet/209.9298-feat-adv-fortune-blessing.js:226 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C271 | Change / Choose… | Configure Dark Paragon | Adv & Disadv: Dark Paragon | Manage | sheet/209.92991-feat-adv-dark-paragon.js:372 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C274 | Change / Choose… | Configure Touch of the Spirit Realms | Adv & Disadv: Touch of the Spirit Realms | Manage | sheet/209.92992-feat-adv-spirit-realms.js:212 | spoken name "Configure …" → "Change {thing}" / "Choose {thing}" |
| C279 | Choose again | (same) | Creation wizard: Skills and Advantages | Both | sheet/209.995-feat-wizard-skills-advantages.js:174 | wizard "Choose again" → "Change" |
| C283 | Choose again | (same) | Creation wizard: free choices | Both | sheet/209.996-feat-wizard-free-choices.js:394 | wizard "Choose again" → "Change" |
| C304 | Rename | (same) | Library: a book’s menu | Both | sheet/209.99999999992-feat-library-page.js:353 |  |
| C305 | Change cover | (same) | Library: a book’s menu | Both | sheet/209.99999999992-feat-library-page.js:353 |  |
| C312 | Choose a picture… | (same) | Library: change cover | Both | sheet/209.99999999992-feat-library-page.js:527 |  |
| C315 | Choose PDF | (same) | Library: add a book | Both | sheet/209.99999999992-feat-library-page.js:773 |  |
| C316 | Change | (same) | Library: add a book | Both | sheet/209.99999999992-feat-library-page.js:786 |  |
| C318 | Change | (same) | Library: a book being added | Both | sheet/209.99999999992-feat-library-page.js:914 |  |
| C355 | Choose spells | (same) | Clan & School: rank spell picker window | Manage | sheet/209.9999999999999994-feat-rank-spell-picker.js:44 |  |

**Places that would change:** 13 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Change”: 1 files, 1 copies. verify-variants.py×1
- “Choose…”: 3 files, 3 copies. board.cjs×1, info-pattern-harness.js×1, shifting-enemy-harness.js×1
- “Choose again”: 0 files, 0 copies. 
- “Configure ”: 3 files, 5 copies. adv-config-harness.js×2, configured-rows.cjs×1, naishou-citizen-harness.js×2

**A04.2:** rows in this group sit on cards that A04.2 will redraw; see section 4. The owner ruled that the Reset rows are scheduled with A04.2.

### G03 · Taking something off the sheet

- **Job:** Remove an entry (a skill, an Advantage, an item, a weapon, an emphasis) from the character, or erase a saved character or book from this device.
- **Controls:** 14.
- **Do the differences carry meaning?** Yes, and it should stay: "Remove" takes an entry off this sheet; "Delete" erases a saved character or a Library book from the device for good. Those are different acts. The visible ✕ is a picture of Remove. The problem is only the spoken name: on the test character {x_instances} ✕ buttons on rows are announced as just "✕" (a few carry a tooltip "Remove", which a screen reader does not use when the button has text).
- **Recommended word:** Remove (visible ✕ stays)  ·  Delete for saved characters and books.  **Spoken name:** Remove {entry name}.
- **Why:** Two words for two different acts, kept. Every ✕ on a row gets a spoken name that says what it removes.
- **Other choices for the owner:** Keep the ✕ with no spoken name; Delete for everything.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C050 | ✕ ×2 | (same) | Skills | Manage | sheet/090-table-rows-weapons.js:164, sheet/090-table-rows-weapons.js:170 | spoken name "✕" → "Remove {entry name}" |
| C053 | ✕ ×6 | (same) | Skills | Manage | markup/20-fixed-layers.html:54, markup/20-fixed-layers.html:86 | spoken name "✕" → "Remove {entry name}" |
| C057 | ✕ ×22 | (same) | Adv & Disadv | Manage | markup/20-fixed-layers.html:54, markup/20-fixed-layers.html:86 | spoken name "✕" → "Remove {entry name}" |
| C088 | ✕ ×9 | (same) | Equipment | Both | markup/20-fixed-layers.html:54, markup/20-fixed-layers.html:86 | spoken name "✕" → "Remove {entry name}" |
| C174 | Delete | (same) | A saved character’s row menu | Both | sheet/209.993-feat-characters-list.js:297 |  |
| C211 | ✕ | (same) | Combat | Play | markup/20-fixed-layers.html:54, markup/20-fixed-layers.html:86 | spoken name "✕" → "Remove {entry name}" |
| C251 | Remove | (same) | Adv & Disadv: Darling of the Court (a court) | Manage | sheet/209.926-feat-adv-court-servant.js:285 |  |
| C257 | Return {n} koku | Return {n} koku from Koku | Adv & Disadv: Wealthy | Manage | sheet/209.929-feat-adv-wealthy-grant.js:98 |  |
| C280 | Remove | (same) | Creation wizard: Skills and Advantages | Both | sheet/209.995-feat-wizard-skills-advantages.js:266 |  |
| C282 | Remove | (same) | Creation wizard: free choices | Both | sheet/209.996-feat-wizard-free-choices.js:293 |  |
| C287 | Remove | (same) | Creation wizard: starting spells | Both | sheet/209.997-feat-wizard-starting-spells.js:169 |  |
| C307 | Delete | (same) | Library: a book’s menu | Both | sheet/209.99999999992-feat-library-page.js:353 |  |
| C346 | Remove | (same) | Creation wizard: a chosen entry | Both | sheet/209.9999999999996-bugfix-wizard-remove-ui.js:34 |  |
| C401 | Delete | (same) | (the toolbar) | hidden in both modes | markup/10-swipe-tab-shell.html:95 |  |

**Places that would change:** 5 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Remove”: 5 files, 5 copies. checklist-walk.cjs×1, wizard2-harness.js×1, wizard3-harness.js×1, wizard4-harness.js×1, wizard5-harness.js×1
- “Delete”: 3 files, 6 copies. characters-harness.js×3, dependant-typing-harness.js×2, pdf-harness.js×1
- “✕”: 2 files, 2 copies. checklist-walk.js×1, checks-conditions-harness.js×1

### G04 · The ✕ in the corner of a window

- **Job:** Close a window from its top corner.
- **Controls:** 34.
- **Do the differences carry meaning?** Yes. Today the corner ✕ has a tooltip "Close" on 10 windows (dice tray, roll result, skill information, untrained skills, the information windows, spell scrolls, arrows, Void and wound information) and "Cancel" on 4: the roll preview, the choice window behind Choose… and Change, the spell Element picker, and the one shared question-and-message window that every alert and every "i" text uses. That last one says "Cancel" even when it only shows a message (43 of its 75 calls are messages, such as the Kiho rules, Affinity and Weapon Info). A Close/Cancel difference can mean something (Cancel when the window holds a choice not yet kept, Close when it only shows you something); today it does not follow that.
- **Recommended word:** ✕, announced "Close {window}" or "Cancel {window}".  **Spoken name:** Close {window name}  (read-only windows)  ·  Cancel {window name}  (windows holding a choice).
- **Why:** Keep the Close/Cancel difference, apply it by what the window is, and move it from a tooltip into the spoken name (a button with text ✕ is announced as "✕" today; only Quick Access and History say "Close").
- **Other choices for the owner:** Always "Close"; Always "Cancel"; Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C092 | ✕ | Close | Quick Access panel | Both | markup/20-fixed-layers.html:54 |  |
| C093 | ✕ | (same) | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:86 | spoken name "✕" → "Close {window name}" |
| C108 | ✕ | (same) | Roll preview (a skill roll) | Both | markup/20-fixed-layers.html:221 | spoken name "✕" → "Cancel {window name}" |
| C114 | ✕ | (same) | Roll result | Both | markup/20-fixed-layers.html:247 | spoken name "✕" → "Close {window name}" |
| C118 | ✕ | (same) | Skill information (i) | Both | markup/20-fixed-layers.html:261 | spoken name "✕" → "Close {window name}" |
| C121 | ✕ | (same) | Untrained Skills | Both | markup/20-fixed-layers.html:450 | spoken name "✕" → "Close {window name}" |
| C123 | ✕ | (same) | Choose… (an Advantage that needs a choice) | Manage | markup/20-fixed-layers.html:382 | spoken name "✕" → "Cancel {window name}" |
| C127 | ✕ | (same) | Change (a choice already made) | Manage | markup/20-fixed-layers.html:382 | spoken name "✕" → "Cancel {window name}" |
| C129 | ✕ | (same) | Advantage information (i) | Both | markup/20-fixed-layers.html:157 | spoken name "✕" → "Close {window name}" |
| C130 | ✕ | (same) | Hotei information (i) | Both | markup/20-fixed-layers.html:157 | spoken name "✕" → "Close {window name}" |
| C131 | ✕ | (same) | Dark Paragon information (i) | Both | markup/20-fixed-layers.html:157 | spoken name "✕" → "Close {window name}" |
| C132 | ✕ | (same) | Kiho rules information (i) | Both | markup/20-fixed-layers.html:326 | spoken name "✕" → "Cancel {window name}" |
| C134 | ✕ | (same) | Cast a spell | Both | markup/20-fixed-layers.html:361 | spoken name "✕" → "Cancel {window name}" |
| C139 | ✕ | (same) | Why can’t I cast this? (?) | Both | markup/20-fixed-layers.html:402 | spoken name "✕" → "Close {window name}" |
| C140 | ✕ | (same) | Add spell scroll | Both | markup/20-fixed-layers.html:434 | spoken name "✕" → "Close {window name}" |
| C142 | ✕ | (same) | Add Arrows | Both | markup/20-fixed-layers.html:202 | spoken name "✕" → "Close {window name}" |
| C146 | ✕ | (same) | Affinity (i badge) | Both | markup/20-fixed-layers.html:326 | spoken name "✕" → "Cancel {window name}" |
| C148 | ✕ | (same) | About Ancestors (i) | Both | markup/20-fixed-layers.html:157 | spoken name "✕" → "Close {window name}" |
| C149 | ✕ | (same) | Lost ancestor’s favour (badge) | Manage | markup/20-fixed-layers.html:326 | spoken name "✕" → "Cancel {window name}" |
| C152 | ✕ | (same) | Void Points information (i) | Both | markup/20-fixed-layers.html:289 | spoken name "✕" → "Close {window name}" |
| C153 | ✕ | (same) | Check Taint growth | Both | markup/20-fixed-layers.html:221 | spoken name "✕" → "Cancel {window name}" |
| C188 | ✕ | (same) | handPickModalOverlay | Both | markup/20-fixed-layers.html:172 | spoken name "✕" → "Cancel {window name}" |
| C189 | ✕ | (same) | arrowPickModalOverlay | Both | markup/20-fixed-layers.html:188 | spoken name "✕" → "Cancel {window name}" |
| C190 | ✕ | (same) | rangePickModalOverlay | Both | markup/20-fixed-layers.html:234 | spoken name "✕" → "Cancel {window name}" |
| C192 | ✕ | (same) | affinityPickModalOverlay | Both | markup/20-fixed-layers.html:343 | spoken name "✕" → "Cancel {window name}" |
| C194 | ✕ | (same) | deficiencyPickModalOverlay | Both | markup/20-fixed-layers.html:416 | spoken name "✕" → "Cancel {window name}" |
| C229 | ✕ | (same) | Stance rules (i) | Play | markup/20-fixed-layers.html:157 | spoken name "✕" → "Close {window name}" |
| C230 | ✕ | (same) | TN & Initiative formula (i) | Play | markup/20-fixed-layers.html:157 | spoken name "✕" → "Close {window name}" |
| C231 | ✕ | (same) | Attack & Damage formula (i) | Play | markup/20-fixed-layers.html:157 | spoken name "✕" → "Close {window name}" |
| C232 | ✕ | (same) | A wound level (window) | Play | markup/20-fixed-layers.html:310 | spoken name "✕" → "Close {window name}" |
| C233 | ✕ | (same) | Roll Initiative (preview) | Play | markup/20-fixed-layers.html:221 | spoken name "✕" → "Cancel {window name}" |
| C236 | ✕ | (same) | Weapon Info (eye) | Play | markup/20-fixed-layers.html:326 | spoken name "✕" → "Cancel {window name}" |
| C326 | (close glyph) | (none) | Library: the reader side panel | Both | sheet/209.99999999992-feat-library-page.js:1341 |  |
| C348 | ✕ | Close History | History window | Both | sheet/209.999999999999993-feat-audit-log.js:115 |  |

**Places that would change:** 31 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “✕”: 2 files, 2 copies. checklist-walk.js×1, checks-conditions-harness.js×1
- “Close”: 2 files, 2 copies. compact-skills-harness.js×1, library-harness.js×1
- “Cancel”: 4 files, 4 copies. adv-config-ux-harness.js×1, checklist-walk.cjs×1, checklist-walk.json×1, quiver-cancel-harness.js×1

### G05 · The buttons at the foot of a window

- **Job:** Answer or dismiss a window: leave it, keep what you chose, or acknowledge a message.
- **Controls:** 70.
- **Do the differences carry meaning?** Mostly yes. Cancel (discard) and Confirm (keep) mean different things and should stay. "Done" (changes already applied as you go) is different from "Confirm" (applied at the end): keep both. What does not carry meaning is three words for dismissing a plain message: "OK" (38 calls), "Got it" (5) and, in a few windows, "Close". Plain yes buttons also vary: "OK" (6), "Yes" (1), "Confirm" (2). Named actions ("Delete", "Discard it", "Replace", "Leave", …) are good: they say what happens.
- **Recommended word:** Message: OK  ·  Yes: Confirm (or the action’s own name)  ·  No: Cancel  ·  Done where changes apply as you go.  **Spoken name:** the same words.
- **Why:** Three plain words cover every window, and the named actions stay. "Got it" → "OK", plain "Yes"/"OK" in a question → "Confirm", plain "No" → "Cancel".
- **Other choices for the owner:** Close for messages; Got it for messages; Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C109 | Cancel | (same) | Roll preview (a skill roll) | Both | sheet/208-feat-roll-preview.js:398 |  |
| C124 | Confirm | (same) | Choose… (an Advantage that needs a choice) | Manage | markup/20-fixed-layers.html:387 |  |
| C128 | Next | (same) | Change (a choice already made) | Manage | markup/20-fixed-layers.html:387 |  |
| C133 | Got it | (same) | Kiho rules information (i) | Both | markup/20-fixed-layers.html:330 | "Got it" → "OK" |
| C135 | Confirm | (same) | Cast a spell | Both | markup/20-fixed-layers.html:365 |  |
| C147 | Got it | (same) | Affinity (i badge) | Both | markup/20-fixed-layers.html:330 | "Got it" → "OK" |
| C150 | Cancel | (same) | Lost ancestor’s favour (badge) | Manage | markup/20-fixed-layers.html:329 |  |
| C151 | Favour lost | (same) | Lost ancestor’s favour (badge) | Manage | markup/20-fixed-layers.html:330 |  |
| C154 | Cancel | (same) | Check Taint growth | Both | sheet/208-feat-roll-preview.js:398 |  |
| C176 | Exit | (same) | Create New Character: the wizard’s first scree | Both | sheet/209.994-feat-creation-wizard.js:380, sheet/209.994-feat-creation-wizard.js:378 |  |
| C191 | OK | (same) | appConfirmOverlay | Both | markup/20-fixed-layers.html:330 |  |
| C193 | Confirm | (same) | affinityPickModalOverlay | Both | markup/20-fixed-layers.html:348 |  |
| C195 | Confirm | (same) | deficiencyPickModalOverlay | Both | markup/20-fixed-layers.html:421 |  |
| C234 | Cancel | (same) | Roll Initiative (preview) | Play | sheet/208-feat-roll-preview.js:398 |  |
| C237 | OK | (same) | Weapon Info (eye) | Play | markup/20-fixed-layers.html:330 |  |
| C239 | Cancel | (same) | Combat: Void card, reduce damage by 10 | Play | markup/10-swipe-tab-shell.html:454 |  |
| C243 | Back | (same) | Range distance window | Play | sheet/190-feat-range.js:151 |  |
| C244 | Confirm | (same) | Range distance window | Play | sheet/190-feat-range.js:152 |  |
| C246 | Cancel | (same) | Roll result: the Re-roll 1s bar | Both | sheet/200-feat-emphasis-reroll.js:273 |  |
| C258 | Keep | Keep the {n} koku | Adv & Disadv: Wealthy | Manage | sheet/209.929-feat-adv-wealthy-grant.js:98 |  |
| C299 | Cancel | (same) | Library: a dialog header (left) | Both | sheet/209.99999999992-feat-library-page.js:66 |  |
| C300 | {Save / Done / Add, set per dialog} | (same) | Library: a dialog header (right) | Both | sheet/209.99999999992-feat-library-page.js:70 |  |
| C308 | Cancel | (same) | Library: a dialog | Both | sheet/209.99999999992-feat-library-page.js:362 |  |
| C311 | Save | (same) | Library: a dialog | Both | sheet/209.99999999992-feat-library-page.js:457 |  |
| C314 | Cancel | (same) | Library: add a book | Both | sheet/209.99999999992-feat-library-page.js:768 |  |
| C320 | Done | (same) | Library: fix page numbers | Both | sheet/209.99999999992-feat-library-page.js:978 |  |
| C321 | Skip: use Fix page numbers later | (same) | Library: fix page numbers | Both | sheet/209.99999999992-feat-library-page.js:979 |  |
| C344 | Close | (same) | PDF export window | Both | sheet/209.9999999999981-bugfix-pdf-save-ui.js:31 |  |
| C349 | Cancel | (same) | Empty quiver window | Play | sheet/209.999999999999994-bugfix-quiver-cancel.js:19 |  |
| C351 | Done | (same) | Clan & School: School choices window | Manage | sheet/209.9999999999999991-feat-school-choices.js:235 |  |
| C352 | Confirm starting spells | (same) | Clan & School: older School choices window | Manage | sheet/209.9999999999999992-bugfix-older-school-choices.js:250 |  |
| C354 | Keep recorded choices | (same) | Clan & School: older School choices window | Manage | sheet/209.9999999999999992-bugfix-older-school-choices.js:289 |  |
| C356 | Later | (same) | Clan & School: rank spell picker window | Manage | sheet/209.9999999999999994-feat-rank-spell-picker.js:44 |  |
| C357 | Done | (same) | Clan & School: rank spell picker window | Manage | sheet/209.9999999999999994-feat-rank-spell-picker.js:44 |  |
| C358 | Confirm missing spells | (same) | Clan & School: rank spell picker window | Manage | sheet/209.9999999999999994-feat-rank-spell-picker.js:84 |  |
| C363 | Got it | (same) | Question or message window: a message window’s | varies by caller | sheet/050-kiho-rules.js:485, sheet/050-kiho-rules.js:487 | "Got it" → "OK" |
| C364 | OK | (same) | Question or message window: a question window’ | varies by caller | sheet/080-identity-build-ui.js:207, sheet/110-modals-trackers.js:732 |  |
| C365 | Cancel | (same) | Question or message window: a question window’ | varies by caller | sheet/080-identity-build-ui.js:207, sheet/090-table-rows-weapons.js:632 |  |
| C366 | OK | (same) | Question or message window: a message window’s | varies by caller | sheet/090-table-rows-weapons.js:488, sheet/090-table-rows-weapons.js:492 |  |
| C367 | Confirm | (same) | Question or message window: a question window’ | varies by caller | sheet/090-table-rows-weapons.js:632, sheet/110-modals-trackers.js:1047 |  |
| C368 | Yes | (same) | Question or message window: a question window’ | varies by caller | sheet/110-modals-trackers.js:755 | plain "Yes" → "Confirm" |
| C369 | No | (same) | Question or message window: a question window’ | varies by caller | sheet/110-modals-trackers.js:755 | plain "No" → "Cancel" |
| C370 | Own Blood | (same) | Question or message window: a three-way questi | varies by caller | sheet/110-modals-trackers.js:945 |  |
| C371 | Someone Else's Blood | (same) | Question or message window: a question window’ | varies by caller | sheet/110-modals-trackers.js:945 |  |
| C372 | Export JSON | (same) | Question or message window: a question window’ | varies by caller | sheet/120-persistence.js:507 |  |
| C373 | Delete | (same) | Question or message window: a question window’ | varies by caller | sheet/120-persistence.js:532, sheet/209.993-feat-characters-list.js:407 |  |
| C374 | Clear Sheet | (same) | Question or message window: a question window’ | varies by caller | sheet/120-persistence.js:551 |  |
| C375 | (built at runtime: 'Use ' + api.ringLabel(plan)) | (same) | Question or message window: a three-way questi | varies by caller | sheet/209.9297-feat-adv-void-versatility.js:102 |  |
| C376 | (built at runtime: 'Use ' + api.ordinaryLabel(plan)) | (same) | Question or message window: a question window’ | varies by caller | sheet/209.9297-feat-adv-void-versatility.js:102 |  |
| C377 | (built at runtime: 'Use ' + api.ringLabel(plan)) | (same) | Question or message window: a question window’ | varies by caller | sheet/209.9297-feat-adv-void-versatility.js:106 |  |
| C378 | Pay and use | (same) | Question or message window: a question window’ | varies by caller | sheet/209.92991-feat-adv-dark-paragon.js:146 |  |
| C379 | Roll without it | (same) | Question or message window: a question window’ | varies by caller | sheet/209.92991-feat-adv-dark-paragon.js:286, sheet/209.99998-feat-ancestors.js:1072 |  |
| C380 | Cancel roll | (same) | Question or message window: a question window’ | varies by caller | sheet/209.92991-feat-adv-dark-paragon.js:286, sheet/209.99998-feat-ancestors.js:1072 |  |
| C381 | Pay and roll | (same) | Question or message window: a three-way questi | varies by caller | sheet/209.92991-feat-adv-dark-paragon.js:293 |  |
| C382 | Roll without it | (same) | Question or message window: a question window’ | varies by caller | sheet/209.92991-feat-adv-dark-paragon.js:293, sheet/209.99998-feat-ancestors.js:1063 |  |
| C383 | Discard it | (same) | Question or message window: a question window’ | varies by caller | sheet/209.993-feat-characters-list.js:358 |  |
| C384 | Start again | (same) | Question or message window: a question window’ | varies by caller | sheet/209.994-feat-creation-wizard.js:254 |  |
| C385 | Keep my choices | (same) | Question or message window: a question window’ | varies by caller | sheet/209.994-feat-creation-wizard.js:254 |  |
| C386 | Leave | (same) | Question or message window: a question window’ | varies by caller | sheet/209.994-feat-creation-wizard.js:451 |  |
| C387 | Stay | (same) | Question or message window: a question window’ | varies by caller | sheet/209.994-feat-creation-wizard.js:451, sheet/209.999999999999996-bugfix-wizard-overspend-warns.js:86 |  |
| C388 | (built at runtime: problem ? 'Roll without it' : 'Spend a Vo | (same) | Question or message window: a three-way questi | varies by caller | sheet/209.99998-feat-ancestors.js:1047 |  |
| C389 | Take a point of Taint | (same) | Question or message window: a question window’ | varies by caller | sheet/209.99998-feat-ancestors.js:1047 |  |
| C390 | Roll with it | (same) | Question or message window: a three-way questi | varies by caller | sheet/209.99998-feat-ancestors.js:1063 |  |
| C391 | Use it now | (same) | Question or message window: a question window’ | varies by caller | sheet/209.99998-feat-ancestors.js:1111 |  |
| C392 | My GM agrees | (same) | Question or message window: a question window’ | varies by caller | sheet/209.99998-feat-ancestors.js:1291 |  |
| C393 | (built at runtime: final ? 'Lost for good' : 'Favour lost') | (same) | Question or message window: a question window’ | varies by caller | sheet/209.99998-feat-ancestors.js:1314 |  |
| C394 | Favour returned | (same) | Question or message window: a question window’ | varies by caller | sheet/209.99998-feat-ancestors.js:1319 |  |
| C395 | (built at runtime: 'Use ' + d.name) | (same) | Question or message window: a question window’ | varies by caller | sheet/209.9999999-feat-damage-sessions-xp.js:204 |  |
| C396 | Replace | (same) | Question or message window: a question window’ | varies by caller | sheet/209.99999999993-bugfix-clan-school-sync.js:147 |  |
| C397 | Finish | (same) | Question or message window: a question window’ | varies by caller | sheet/209.999999999999996-bugfix-wizard-overspend-warns.js:86 |  |

**Places that would change:** 5 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Got it”: 0 files, 0 copies. 
- “OK”: 3 files, 15 copies. configured-rows.cjs×1, prototype.cjs×1, verify-variants.py×13
- “Confirm”: 2 files, 2 copies. adv-config-expansion-harness.js×1, checklist-walk.cjs×1
- “Cancel”: 4 files, 4 copies. adv-config-ux-harness.js×1, checklist-walk.cjs×1, checklist-walk.json×1, quiver-cancel-harness.js×1
- “Done”: 6 files, 6 copies. compact-skills-harness.js×1, manage-toggle-harness.js×1, modes-harness.js×1, spell-review-harness.js×1, test-removal.py×1, verify-variants.py×1
- “Next”: 2 files, 3 copies. adv-config-expansion-harness.js×1, verify-variants.py×2

### G06 · Using an ability now

- **Job:** Use a once-per-session ability at a moment of the player’s choosing.
- **Controls:** 3.
- **Do the differences carry meaning?** No. "Use" (Great Destiny), "Use {precept}" (Dark Paragon) and "Use it now" (an Ancestor’s once-a-session gift) are the same job.
- **Recommended word:** Use.  **Spoken name:** Use {ability}: {what it does}.
- **Why:** One verb. Where a card holds one ability the card names it, so "Use" is enough; where a card holds several (Dark Paragon’s precept) the name stays after the verb.
- **Other choices for the owner:** Use it now; Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C067 | Use | Great Destiny: a killing blow leaves you 1 Wound from death instead | Adv & Disadv | Both | sheet/209.9999999-feat-damage-sessions-xp.js:369 |  |
| C272 | Use {precept} | (same) | Adv & Disadv: Dark Paragon (a manual precept) | Both | sheet/209.92991-feat-adv-dark-paragon.js:393 |  |
| C362 | Use it now | (same) | Clan & School: Ancestor card (Seppun, Komori I | Both | sheet/209.99998-feat-ancestors.js:1379 | "Use it now" → "Use" |

**Places that would change:** 1 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Use”: 2 files, 2 copies. checklist-walk.js×1, damage-sessions-xp-harness.js×1
- “Use it now”: 1 files, 2 copies. ancestors-harness.js×2

### G07 · Spending a Void Point

- **Job:** Spend one Void Point on an effect.
- **Controls:** 8.
- **Do the differences carry meaning?** No. Seven buttons on the Void card already read "Spend Void: …". Lost Love’s button reads "Spend a Void Point".
- **Recommended word:** Spend Void.  **Spoken name:** Spend Void: {effect}.
- **Why:** One pattern with the card’s other seven buttons, and shorter on a phone.
- **Other choices for the owner:** Spend a Void Point; Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C076 | Spend a Void Point | Lost Love: spend a Void Point to set the memory aside | Adv & Disadv | Both | sheet/209.9999998-feat-checks-conditions.js:476 | "Spend a Void Point" → "Spend Void" |
| C217 | Spend Void: +1k1 to a Skill, Trait, Ring, or Spell Casting r | (same) | Combat | Play | sheet/160-feat-void.js:293 |  |
| C218 | Spend Void: Make an Unskilled roll Skilled (Rank 0 → 1) — 10 | (same) | Combat | Play | sheet/160-feat-void.js:293 |  |
| C219 | Spend Void: +10 TN to be hit | (same) | Combat | Play | sheet/160-feat-void.js:293 |  |
| C220 | Spend Void: +10 Initiative (skirmish) | (same) | Combat | Play | sheet/160-feat-void.js:293 |  |
| C221 | Spend Void: Reduce damage by 10 | (same) | Combat | Play | sheet/160-feat-void.js:293 |  |
| C222 | Spend Void: Activate a Kiho | (same) | Combat | Play | sheet/160-feat-void.js:293 |  |
| C223 | Spend Void: For a Technique or Advantage (Hotei’s Curse: 2 p | (same) | Combat | Play | sheet/160-feat-void.js:293 |  |

**Places that would change:** 1 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Spend a Void Point”: 5 files, 5 copies. 7b2-checks-instigator.l5r.json×1, checklist-walk.js×1, checks-conditions-harness.js×1, own-words-check.py×1, roll-preview-harness.js×1

### G08 · Rolling again

- **Job:** Roll all or part of a roll again.
- **Controls:** 8.
- **Do the differences carry meaning?** In part. The source named in the button (Luck, Kakita, Dark Paragon, an Emphasis) tells the player whose rule applies, which is useful. "GM invokes Unlucky" is not a choice the player makes, so it should read differently. But the spelling splits: "Re-roll" (Emphasis, Kakita) and "Reroll" (Dark Paragon, and the Luck and Unlucky tooltips), and Luck says "Spend Luck" while the others say "with".
- **Recommended word:** Reroll with {source}.  **Spoken name:** Reroll with {source}: {what it does}.
- **Why:** One spelling and one pattern for the rerolls a player chooses; keep "GM invokes Unlucky" and "Add Sun Tao’s die" (an added die, not a reroll) as they are.
- **Other choices for the owner:** Re-roll (with the hyphen); Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C115 | Re-roll 1s | (same) | Roll result | Both | sheet/200-feat-emphasis-reroll.js:295 | label → "Reroll 1s" |
| C116 | Spend Luck (2/3) | (same) | Roll result | Both | sheet/209.83-feat-adv-config-resources.js:173 | "Spend Luck (n/m)" → "Reroll with Luck (n/m)" |
| C117 | GM invokes Unlucky (1/2) | (same) | Roll result | Both | sheet/209.93-feat-disadv-unlucky.js:216 |  |
| C245 | Re-roll selected | (same) | Roll result: the Re-roll 1s bar | Both | sheet/200-feat-emphasis-reroll.js:273 | label → "Reroll selected" |
| C270 | Reroll with Dark Paragon ({n}/1) | (same) | Roll result (a matching Social, Awareness or I | Play | sheet/209.92991-feat-adv-dark-paragon.js:237 |  |
| C289 | Re-roll with Kakita (a Void Point) | (same) | Roll result (Ancestor gifts: Kakita, Sun Tao,  | Play | sheet/209.99998-feat-ancestors.js:1154 | label → "Reroll with Kakita (a Void Point)" |
| C290 | Add Sun Tao’s die (a Void Point) | (same) | Roll result (Ancestor gifts: Kakita, Sun Tao,  | Play | sheet/209.99998-feat-ancestors.js:1154 |  |
| C291 | Spend Toku’s Luck ({n}/1) | (same) | Roll result (Ancestor gifts: Kakita, Sun Tao,  | Play | sheet/209.99998-feat-ancestors.js:1154 | "Spend Toku’s Luck" → "Reroll with Toku’s Luck" |

**Places that would change:** 5 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Re-roll 1s”: 0 files, 0 copies. 
- “Spend Luck”: 2 files, 2 copies. adv-config-expansion-harness.js×1, disadv-unlucky-harness.js×1
- “GM invokes Unlucky”: 1 files, 1 copies. disadv-unlucky-harness.js×1

### G09 · Clearing what you entered

- **Job:** Empty the dice you built, or the filters you set.
- **Controls:** 2.
- **Do the differences carry meaning?** No difference to resolve. "Clear" (dice tray, two panels) and "Clear filters" (Search) are one word plus its object.
- **Recommended word:** Clear.  **Spoken name:** Clear {what}  (Clear the dice, Clear filters).  (Keep as it is.)
- **Why:** Already one word. Only the spoken name of the dice tray’s two Clear buttons should say what they clear.
- **Other choices for the owner:** Reset; Change the word.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C098 | Clear | (same) | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:129 | spoken name → "Clear the dice" |
| C298 | Clear filters | (same) | Search: a category with filters | Both | sheet/209.999999991-feat-search-facet-page.js:56 |  |

**Places that would change:** 1 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Clear”: 0 files, 0 copies. 
- “Clear filters”: 0 files, 0 copies. 

### G10 · Adding something

- **Job:** Add an entry to a list on the sheet.
- **Controls:** 31.
- **Do the differences carry meaning?** Mostly no. "+ Add {thing}" is the common pattern (Skill, Advantage, Disadvantage, Technique, Item, Spell Scroll, Arrows, Weapon, School). Three buttons drift: "+ Emph" (an abbreviation), "+Book" (no space) and the Library’s "Add book". "Create New Character" starts the whole wizard and should keep its own word. "Add 1.5 koku" adds money, a different act.
- **Recommended word:** + Add {thing}.  **Spoken name:** Add {thing}.
- **Why:** Fix the three that drift: "+ Emph" → "+ Add Emphasis", "+Book" → "+ Add Book". The two "Add court" buttons (one with a "+", one without) look like one job built twice.
- **Other choices for the owner:** Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C028 | + Add School | (same) | Identity | Manage | markup/10-swipe-tab-shell.html:222 |  |
| C051 | + Emph ×6 | (same) | Skills | Manage | sheet/090-table-rows-weapons.js:75 | "+ Emph" → "+ Add Emphasis" |
| C054 | + Add Skill | (same) | Skills | Manage | markup/10-swipe-tab-shell.html:293 |  |
| C055 | + Load Full Skill List | (same) | Skills | Manage | markup/10-swipe-tab-shell.html:294 |  |
| C063 | Add 1.5 koku | Add 1.5 koku to Koku now | Adv & Disadv | Both | sheet/209.99999999997-feat-supplement-identity-outfit.js:318 |  |
| C069 | + Add Advantage | (same) | Adv & Disadv | Manage | markup/10-swipe-tab-shell.html:312 |  |
| C080 | + Add Disadvantage | (same) | Adv & Disadv | Manage | markup/10-swipe-tab-shell.html:318 |  |
| C085 | + Add Technique / Kata / Spell | (same) | Techniques | Manage | markup/10-swipe-tab-shell.html:338 |  |
| C089 | + Add Item | (same) | Equipment | Both | markup/10-swipe-tab-shell.html:501 |  |
| C090 | + Add Spell Scroll | (same) | Equipment | Both | markup/10-swipe-tab-shell.html:505 |  |
| C091 | + Add Arrows | (same) | Equipment | Both | markup/10-swipe-tab-shell.html:508 |  |
| C111 | +1k1 to a Skill, Trait, Ring, or Spell Casting roll | (same) | Roll preview (a skill roll) | Both | sheet/160-feat-void.js:24 |  |
| C125 | Add it to my Koku now | (same) | Choose… (an Advantage that needs a choice) | Manage | sheet/209.929-feat-adv-wealthy-grant.js:154 |  |
| C141 | + Add ×260 | (same) | Add spell scroll | Both | sheet/110-modals-trackers.js:411 |  |
| C145 | + Add ×5 | (same) | Add Arrows | Both | sheet/150-feat-ammo.js:319 |  |
| C156 | +1k1 to a Skill, Trait, Ring, or Spell Casting roll | (same) | Check Taint growth | Both | sheet/160-feat-void.js:24 |  |
| C160 | Create New Character | (same) | Characters screen (nothing saved yet) | Both | sheet/209.993-feat-characters-list.js:190, sheet/209.993-feat-characters-list.js:188 |  |
| C162 | Create New Character | (same) | Characters screen with a saved character | Both | sheet/209.993-feat-characters-list.js:190, sheet/209.993-feat-characters-list.js:188 |  |
| C166 | Create New Character | (same) | A saved character’s row menu | Both | sheet/209.993-feat-characters-list.js:190, sheet/209.993-feat-characters-list.js:188 |  |
| C185 | +Book | Add a book | Library | Both | sheet/209.99999999992-feat-library-page.js:120, sheet/209.99999999992-feat-library-page.js:94 | "+Book" → "+ Add Book" |
| C212 | + Add Weapon | (same) | Combat | Play | markup/10-swipe-tab-shell.html:406 |  |
| C252 | Add court | (same) | Adv & Disadv: Darling of the Court | Manage | sheet/209.926-feat-adv-court-servant.js:325 | "Add court" and "+ Add court": one job, two buttons |
| C255 | Add {n} koku | Add {n} koku to Koku now | Adv & Disadv: Wealthy | Manage | sheet/209.929-feat-adv-wealthy-grant.js:98 |  |
| C278 | Add | (same) | Creation wizard: Skills and Advantages | Both | sheet/209.995-feat-wizard-skills-advantages.js:140 |  |
| C281 | Add | (same) | Creation wizard: free choices | Both | sheet/209.996-feat-wizard-free-choices.js:280 |  |
| C285 | Add {spell} | (same) | Creation wizard: starting spells | Both | sheet/209.997-feat-wizard-starting-spells.js:120 |  |
| C286 | Add | (same) | Creation wizard: starting spells | Both | sheet/209.997-feat-wizard-starting-spells.js:147 |  |
| C288 | Add | (same) | Creation wizard: starting spells | Both | sheet/209.998-feat-wizard-starting-spells-all.js:240 |  |
| C301 | Add the file again | (same) | Library: a book whose file is missing | Both | sheet/209.99999999992-feat-library-page.js:240 |  |
| C317 | Add book | (same) | Library: add a book | Both | sheet/209.99999999992-feat-library-page.js:790 |  |
| C361 | + Add court | Add court to … | Adv & Disadv: Darling of the Court | Manage | sheet/209.9999999999999999-feat-court-badges.js:67 | "Add court" and "+ Add court": one job, two buttons |

**Places that would change:** 4 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “+ Emph”: 1 files, 1 copies. compact-skills-harness.js×1
- “+Book”: 0 files, 0 copies. 
- “+ Add”: 10 files, 10 copies. board.cjs×1, compact-skills-harness.js×1, court-badges-harness.js×1, court-servant-harness.js×1, identity-harness.js×1, integrate.py×1, ms-techniques-harness.js×1, prototype-r2.cjs×1
- “+ Add Skill”: 1 files, 1 copies. compact-skills-harness.js×1
- “Add court”: 6 files, 6 copies. audit-content.cjs×1, board.cjs×1, court-badges-harness.js×1, court-servant-harness.js×1, prototype-r2.cjs×1, prototype.cjs×1

### G11 · Rolling the dice

- **Job:** Make a roll.
- **Controls:** 42.
- **Do the differences carry meaning?** Yes. "Roll" (dice, attacks, preview), "Cast" (spells) and "Check" (rule checks) mean different things and should stay. Wording of the Disadvantage check buttons is already settled by B01.
- **Recommended word:** Roll / Cast / Check (as they are).  **Spoken name:** Roll {what} · Cast {spell} · Check {what}.  (Keep as it is.)
- **Why:** One odd one: Touch of the Void’s button is only "Willpower (TN 30)". As a check it would read "Check (TN 30)", like the others. All other roll buttons are named for what they roll.
- **Other choices for the owner:** Keep every roll button as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C026 | (the d10 icon) | Manual Dice Roll | On every page (app bar, tabs, floating buttons | Both | markup/20-fixed-layers.html:6 |  |
| C032 | Check Taint growth | (same) | Identity | Both | sheet/209.9999999999963-bugfix-taint-ui.js:65 |  |
| C040 | {Ring name} ×5 | Air  (varies; e.g. Earth / Fire) | Rings & Traits | Both | sheet/080-identity-build-ui.js:624, sheet/080-identity-build-ui.js:643 |  |
| C041 | Reflexes | (same) | Rings & Traits | Both | sheet/010-prelude.js:3, sheet/020-lib-skills-advantages.js:20 |  |
| C042 | Awareness | (same) | Rings & Traits | Both | sheet/010-prelude.js:3, sheet/020-lib-skills-advantages.js:2 |  |
| C043 | Agility | (same) | Rings & Traits | Both | sheet/010-prelude.js:5, sheet/020-lib-skills-advantages.js:21 |  |
| C044 | Intelligence | (same) | Rings & Traits | Both | sheet/010-prelude.js:5, sheet/020-lib-skills-advantages.js:4 |  |
| C045 | Strength | (same) | Rings & Traits | Both | sheet/010-prelude.js:6, sheet/020-lib-skills-advantages.js:18 |  |
| C046 | Perception | (same) | Rings & Traits | Both | sheet/010-prelude.js:6, sheet/020-lib-skills-advantages.js:9 |  |
| C047 | Stamina | (same) | Rings & Traits | Both | sheet/010-prelude.js:4, sheet/060-lib-schools.js:4 |  |
| C048 | Willpower | (same) | Rings & Traits | Both | sheet/010-prelude.js:4, sheet/020-lib-skills-advantages.js:77 |  |
| C052 | (the d10 icon) ×6 | Roll Trait+Rank, keep Trait (Unskilled: roll and keep Trait) | Skills | Both | sheet/090-table-rows-weapons.js:80 |  |
| C060 | Lead an ally (School Rank + 1k1) | (same) | Adv & Disadv | Both | sheet/209.99999993-feat-void-initiative-entries.js:211 |  |
| C070 | Resist Lord Moon (TN 20) | (same) | Adv & Disadv | Both | sheet/209.999999999999995-bugfix-moon-resist-label.js:1 |  |
| C072 | Check (TN 25) | Brash: Willpower Trait Roll when threatened or insulted | Adv & Disadv | Both | sheet/209.9999998-feat-checks-conditions.js:436 |  |
| C073 | Check (TN 20) ×3 | Can’t Lie: Willpower Trait Roll when a lie is told in front of you  (v | Adv & Disadv | Both | sheet/209.9999998-feat-checks-conditions.js:439, sheet/209.9999998-feat-checks-conditions.js:448 |  |
| C074 | Check | Contrary: Willpower Trait Roll when a dispute is going on | Adv & Disadv | Both | sheet/209.9999998-feat-checks-conditions.js:442 |  |
| C075 | Check (TN 5 × Glory) | Rumormonger: Willpower Trait Roll to keep a rumor to yourself | Adv & Disadv | Both | sheet/209.9999998-feat-checks-conditions.js:451 |  |
| C083 | Cast ×3 | (same) | Techniques | Both | sheet/090-table-rows-weapons.js:739 |  |
| C094 | 10 0 | 0 | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:92 |  |
| C095 | − remove one | (same) | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:106 |  |
| C096 | 10 0 | 0 | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:109 |  |
| C097 | − remove one | (same) | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:123 |  |
| C099 | Roll | (same) | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:130 |  |
| C100 | {die: d20, d12, d100, d10, d8, d6, d4, Coin} ×8 | CoinCoin  (varies; e.g. d100d100 / d10d10) | Manual dice (floating 10) | Both | sheet/110-modals-trackers.js:84 |  |
| C101 | − remove ×8 | (same) | Manual dice (floating 10) | Both | sheet/110-modals-trackers.js:88 |  |
| C102 | Clear | (same) | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:138 |  |
| C103 | Roll | (same) | Manual dice (floating 10) | Both | markup/20-fixed-layers.html:139 |  |
| C110 | Roll 4k3 | (same) | Roll preview (a skill roll) | Both | sheet/208-feat-roll-preview.js:399 |  |
| C113 | Resisting Intimidation, Temptation or Fear — +4 to the total | (same) | Roll preview (a skill roll) | Both | (not found) |  |
| C155 | Roll 2k2 | (same) | Check Taint growth | Both | sheet/208-feat-roll-preview.js:399 |  |
| C204 | (the d10 icon) | Roll Initiative: Reflexes + Insight Rank, keep Reflexes | Combat | Play | markup/10-swipe-tab-shell.html:380 |  |
| C209 | (the d10 icon) | Roll attack | Combat | Play | sheet/090-table-rows-weapons.js:329 |  |
| C210 | (the d10 icon) | Roll damage | Combat | Play | sheet/090-table-rows-weapons.js:330 |  |
| C235 | Roll 3k2 | (same) | Roll Initiative (preview) | Play | sheet/208-feat-roll-preview.js:399 |  |
| C241 | Roll off-hand attack | (same) | Combat (Mirumoto Rank 1) | Play | sheet/140-feat-mirumoto-dualwield.js:549 |  |
| C267 | Contested Void Roll | Roll a Contested Void Roll… | Adv & Disadv: Seven Fortunes’ Blessing (Hotei) | Play | sheet/209.9298-feat-adv-fortune-blessing.js:235 |  |
| C275 | Check (TN …) | Make the Toshigoku Willpower check… | Adv & Disadv: Cursed by the Realm (Toshigoku) | Play | sheet/209.96-feat-disadv-realm.js:311 |  |
| C294 | Spot ambush | Wary: roll Investigation (Notice) / Perception to spot an ambush, with | Adv & Disadv: Wary, Precise Memory | Play | sheet/209.9999995-feat-situational-buttons.js:154 |  |
| C295 | Recall | Precise Memory: roll Intelligence to recall something exactly, with +1 | Adv & Disadv: Wary, Precise Memory | Play | sheet/209.9999995-feat-situational-buttons.js:154 |  |
| C297 | Willpower (TN 30) | (same) | Adv & Disadv: Touch of the Void | Both | sheet/209.99999993-feat-void-initiative-entries.js:201 | "Willpower (TN 30)" → "Check (TN 30)" |
| C347 | Roll without an arrow | (same) | Empty quiver window | Play | sheet/209.99999999999999-bugfix-empty-quiver.js:27 |  |

**Places that would change:** 1 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Roll”: 0 files, 0 copies. 
- “Cast”: 0 files, 0 copies. 
- “Check”: 8 files, 12 copies. checklist-walk.cjs×5, checklist-walk.js×1, checks-conditions-harness.js×1, claude-proto.cjs×1, gift-refund-harness.js×1, prototype.cjs×1, refund-harness.js×1, reproduce.cjs×1

### G12 · The information buttons

- **Job:** Open an explanation.
- **Controls:** 23.
- **Do the differences carry meaning?** Mostly no. The glyph is "i" on most (A04’s ring), but "ⓘ" on the Combat cards, "👁" on weapon and skill info, and a badge with "ⓘ" in its text. The spoken names split three ways: "{thing} information" (most), "Explain: {thing}" (Advantage cards) and "About Ancestors". "?" on a spell asks a different question ("Why can’t I cast this?") and should stay.
- **Recommended word:** i.  **Spoken name:** {Thing} information.
- **Why:** "{thing} information" is already the most used pattern and is pinned by many harnesses; moving the others to it is the smallest change.
- **Other choices for the owner:** Explain: {thing}; Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C011 | Affinity Earthⓘ | (same) | Clan & School | Both | sheet/050-kiho-rules.js:476 |  |
| C012 | Deficiency Airⓘ | (same) | Clan & School | Both | sheet/050-kiho-rules.js:477 |  |
| C013 | i | About Ancestors | Clan & School | Both | sheet/209.99998-feat-ancestors.js:1413, sheet/209.99998-feat-ancestors.js:1411 | spoken name "About Ancestors" → "Ancestors information" |
| C037 | i | Void Points information | Rings & Traits | Both | sheet/080-identity-build-ui.js:652 |  |
| C049 | i ×6 | {…} information | Skills | Both | markup/10-swipe-tab-shell.html:336, markup/10-swipe-tab-shell.html:367 |  |
| C059 | i ×5 | Explain: {…} | Adv & Disadv | Both | sheet/209.9-feat-adv-config-ux.js:172, sheet/209.9999999999999998-feat-one-info-pattern.js:59 | spoken name "Explain: {thing}" → "{thing} information" |
| C065 | i | Dark Paragon information | Adv & Disadv | Both | sheet/209.92991-feat-adv-dark-paragon.js:325 |  |
| C071 | i | Hotei’s Curse information | Adv & Disadv | Both | sheet/209.9999999999999998-feat-one-info-pattern.js:84 |  |
| C082 | i | Kiho rules information | Techniques | Both | markup/10-swipe-tab-shell.html:336 |  |
| C084 | ? ×3 | Why can’t I cast this? | Techniques | Both | sheet/209.7-feat-casting-diagnostics.js:417, sheet/209.7-feat-casting-diagnostics.js:418 |  |
| C203 | ⓘ | (same) | Combat | Play | markup/10-swipe-tab-shell.html:367 | glyph "ⓘ" / "👁" → "i", spoken name → "{thing} information" |
| C207 | ⓘ | (same) | Combat | Play | markup/10-swipe-tab-shell.html:391 | glyph "ⓘ" / "👁" → "i", spoken name → "{thing} information" |
| C208 | 👁 | (same) | Combat | Play | sheet/090-table-rows-weapons.js:306 | glyph "ⓘ" / "👁" → "i", spoken name → "{thing} information" |
| C215 | ⓘ ×5 | {…} stance rules | Combat | Play | sheet/180-feat-stances.js:236 | glyph "ⓘ" / "👁" → "i", spoken name → "{thing} information" |
| C247 | i | (aria-label set on the same button) | Adv & Disadv: Blackmail, Forbidden Knowledge,  | Both | sheet/209.925-feat-adv-named.js:78 |  |
| C249 | i | (aria-label set on the same button) | Adv & Disadv: Darling of the Court, Servant | Both | sheet/209.926-feat-adv-court-servant.js:114 |  |
| C253 | i | (aria-label set on the same button) | Adv & Disadv: Heart of Vengeance | Both | sheet/209.928-feat-adv-heart-vengeance.js:84 |  |
| C259 | i | (aria-label set on the same button) | Adv & Disadv: Paragon | Both | sheet/209.9295-feat-adv-paragon.js:42 |  |
| C261 | i | (aria-label set on the same button) | Adv & Disadv: Soul of Artistry | Both | sheet/209.9296-feat-adv-soul-artistry.js:119 |  |
| C263 | i | (aria-label set on the same button) | Adv & Disadv: Void Versatility | Both | sheet/209.9297-feat-adv-void-versatility.js:150 |  |
| C265 | i | (aria-label set on the same button) | Adv & Disadv: Seven Fortunes’ Blessing | Both | sheet/209.9298-feat-adv-fortune-blessing.js:181 |  |
| C269 | i | (aria-label set on the same button) | Adv & Disadv: Naishou Citizen | Both | sheet/209.9299-feat-adv-naishou-citizen.js:93 |  |
| C273 | i | (aria-label set on the same button) | Adv & Disadv: Touch of the Spirit Realms | Both | sheet/209.92992-feat-adv-spirit-realms.js:160 |  |

**Places that would change:** 6 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “ⓘ”: 2 files, 2 copies. info-pattern-harness.js×1, prototype.cjs×1
- “👁”: 1 files, 1 copies. info-pattern-harness.js×1
- “About Ancestors”: 0 files, 0 copies. 
- “information”: 33 files, 50 copies. adv-config-expansion-harness.js×1, adv-config-harness.js×2, adv-config-repairs-harness.js×1, ancestors-harness.js×2, audit-content.cjs×1, board.cjs×1, boards.cjs×1, capture-ui.js×1
- “Skill Info”: 13 files, 22 copies. board.cjs×1, compact-skills-harness.js×1, current-suite-runner.js×2, final-qa.py×1, info-pattern-harness.js×1, prototype-r2.cjs×1, remove-phase.py×1, retained-suite-runner.js×1
- “Weapon Info”: 1 files, 1 copies. remove-phase.py×1

**A04.2:** rows in this group sit on cards that A04.2 will redraw; see section 4. The owner ruled that the Reset rows are scheduled with A04.2.

### G13 · Undo

- **Job:** Take back the last spend or tap.
- **Controls:** 2.
- **Do the differences carry meaning?** No difference to resolve: "Undo" on the Void spend line and on the Honour/Glory/Status/Taint cards.
- **Recommended:** leave as they are. Words: “Undo”.
- All controls of this group are in [inventory.json](inventory.json) (group `G13`).

### G14 · Plus and minus buttons

- **Job:** Add or take away one.
- **Controls:** 18.
- **Do the differences carry meaning?** The glyphs (− +) agree everywhere. The spoken verbs do not: Add/Subtract (Honour, Glory, Status, Taint points), Increase/Decrease (wounds), One more/One fewer (arrows), Gain/Lose (older point steppers), Raise/Lower (older Rank steppers), and two steppers in Rings & Traits with no spoken name at all. The Unlucky pair ("Record an Unlucky use the GM forced" / "Give back an Unlucky use") means something else and should stay.
- **Recommended word:** −  +  (the glyphs stay).  **Spoken name:** Increase {thing} / Decrease {thing}.
- **Why:** One verb pair for every counter. Also the two Rings & Traits steppers need a spoken name.
- **Other choices for the owner:** Add / Subtract; Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C029 | − ×4 | Subtract {…} points | Identity | Both | sheet/080-identity-build-ui.js:645, sheet/209.93-feat-disadv-unlucky.js:144 | spoken verb → Increase / Decrease |
| C030 | + ×4 | Add {…} points | Identity | Both | markup/10-swipe-tab-shell.html:480, sheet/080-identity-build-ui.js:647 | spoken verb → Increase / Decrease |
| C035 | − | (same) | Rings & Traits | Manage | sheet/080-identity-build-ui.js:645, sheet/209.93-feat-disadv-unlucky.js:144 | give a spoken name (today none) |
| C036 | + | (same) | Rings & Traits | Manage | markup/10-swipe-tab-shell.html:480, sheet/080-identity-build-ui.js:647 | give a spoken name (today none) |
| C077 | − | Record an Unlucky use the GM forced away from the sheet | Adv & Disadv | Both | sheet/209.93-feat-disadv-unlucky.js:144 |  |
| C078 | + | Give back an Unlucky use recorded by mistake | Adv & Disadv | Both | sheet/209.93-feat-disadv-unlucky.js:146 |  |
| C143 | − ×5 | One fewer {…} | Add Arrows | Both | sheet/150-feat-ammo.js:310, sheet/150-feat-ammo.js:315 | spoken verb → Increase / Decrease |
| C144 | + ×5 | One more {…} | Add Arrows | Both | sheet/150-feat-ammo.js:315, sheet/150-feat-ammo.js:310 | spoken verb → Increase / Decrease |
| C227 | − | Decrease wounds taken by 1 | Combat | Play | markup/10-swipe-tab-shell.html:477 | spoken verb → Increase / Decrease |
| C228 | + | Increase wounds taken by 1 | Combat | Play | markup/10-swipe-tab-shell.html:480 | spoken verb → Increase / Decrease |
| C331 | − | Lower {Honour/Glory/Status/Taint} Rank | Identity: Rank settings (Manage) | Manage | sheet/209.9999999999961-bugfix-rank-points-ui.js:64 | spoken verb → Increase / Decrease |
| C332 | + | Raise {Honour/Glory/Status/Taint} Rank | Identity: Rank settings (Manage) | Manage | sheet/209.9999999999961-bugfix-rank-points-ui.js:64 | spoken verb → Increase / Decrease |
| C333 | − | Lose one {Honour/Glory/Status/Taint} point | Identity: Rank settings (Manage) | Manage | sheet/209.9999999999961-bugfix-rank-points-ui.js:64 | spoken verb → Increase / Decrease |
| C334 | + | Gain one {Honour/Glory/Status/Taint} point | Identity: Rank settings (Manage) | Manage | sheet/209.9999999999961-bugfix-rank-points-ui.js:64 | spoken verb → Increase / Decrease |
| C335 | − | Lower Taint Rank | Identity: Taint (older steppers, hidden by the | Manage | sheet/209.9999999999963-bugfix-taint-ui.js:54 | spoken verb → Increase / Decrease |
| C336 | + | Raise Taint Rank | Identity: Taint (older steppers, hidden by the | Manage | sheet/209.9999999999963-bugfix-taint-ui.js:54 | spoken verb → Increase / Decrease |
| C337 | − | Lose one Taint point | Identity: Taint (older steppers, hidden by the | Manage | sheet/209.9999999999963-bugfix-taint-ui.js:54 | spoken verb → Increase / Decrease |
| C338 | + | Gain one Taint point | Identity: Taint (older steppers, hidden by the | Manage | sheet/209.9999999999963-bugfix-taint-ui.js:54 | spoken verb → Increase / Decrease |

**Places that would change:** 16 controls above (the "Would change" column)

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Add Honour points”: 1 files, 1 copies. phone-text-entry-harness.js×1
- “Subtract”: 0 files, 0 copies. 
- “One fewer”: 0 files, 0 copies. 
- “One more”: 11 files, 14 copies. adv-eligibility-harness.js×1, ancestors-harness.js×2, checklist-walk.js×1, dependency-harness.js×2, gift-ih-harness.js×1, library-harness.js×1, search-harness.js×1, spell-slot-accounting-harness.js×1
- “Decrease wounds”: 0 files, 0 copies. 
- “Increase wounds”: 0 files, 0 copies. 

### G15 · Moving around the sheet

- **Job:** Go to another page, tab, step or list page.
- **Controls:** 31.
- **Do the differences carry meaning?** Names of places, not actions; they carry meaning and are not in conflict. "Characters" appears as an app-bar item, as a screen tab and as an older hidden toolbar button.
- **Recommended:** leave as they are. Words: “Sheet”, “Characters”, “Library”, “Search”, “‹”, “›”, “Clan & School”, “Identity”, “Rings & Traits”, “Skills”, “Adv & Disadv”, “Techniques”, “Spell Slots”, “Equipment”, “Background”, “‹ Back”, “Next ›”, “‹ All categories”, “Combat”, “‹ Previous”, “‹ Search / ‹ Library”, “Go”, “{chapter and page}”, “{page and snippet}”, “Go to Advanced Schools”.
- All controls of this group are in [inventory.json](inventory.json) (group `G15`).

### G16 · Saving, copying and exporting

- **Job:** Save the character, copy it, print it, or hand it over as a file.
- **Controls:** 18.
- **Do the differences carry meaning?** The words differ because the acts differ (Save, Save As a copy, Print, Export, Import, History). The one pattern slip is "Export JSON" next to "Export to PDF".
- **Recommended word:** Export PDF  (and "Export JSON" as it is).  **Spoken name:** Export {format}.
- **Why:** Drop the "to" so the two read as a pair.
- **Other choices for the owner:** Export to JSON; Keep as it is.

| ID | Label | Spoken name | Where | Mode | Source | Would change |
|---|---|---|---|---|---|---|
| C005 | Save | (same) | On every page (app bar, tabs, floating buttons | Both | markup/10-swipe-tab-shell.html:92 |  |
| C006 | ⋯ | More: save a copy, print, export | On every page (app bar, tabs, floating buttons | Both | sheet/209.99996-feat-modes-toolbar.js:56 |  |
| C104 | Save As a copy | (same) | ⋯ More menu | Manage | markup/10-swipe-tab-shell.html:93 |  |
| C105 | Print | (same) | ⋯ More menu | Both | markup/10-swipe-tab-shell.html:98 |  |
| C106 | Export JSON | (same) | ⋯ More menu | Both | markup/10-swipe-tab-shell.html:99 |  |
| C107 | History | (same) | ⋯ More menu | Both | sheet/209.999999999999993-feat-audit-log.js:152, sheet/209.999999999999993-feat-audit-log.js:150 |  |
| C161 | Import JSON | (same) | Characters screen (nothing saved yet) | Both | sheet/209.993-feat-characters-list.js:193, sheet/209.993-feat-characters-list.js:191 |  |
| C163 | Import JSON | (same) | Characters screen with a saved character | Both | sheet/209.993-feat-characters-list.js:193, sheet/209.993-feat-characters-list.js:191 |  |
| C165 | ⋯ | Options for B18 inventory | Characters screen with a saved character | Both | sheet/209.993-feat-characters-list.js:284 |  |
| C167 | Import JSON | (same) | A saved character’s row menu | Both | sheet/209.993-feat-characters-list.js:193, sheet/209.993-feat-characters-list.js:191 |  |
| C169 | ⋯ | Options for B18 inventory | A saved character’s row menu | Both | sheet/209.993-feat-characters-list.js:284 |  |
| C170 | Export JSON | (same) | A saved character’s row menu | Both | sheet/209.993-feat-characters-list.js:297 |  |
| C172 | Save As a copy | (same) | A saved character’s row menu | Both | sheet/209.993-feat-characters-list.js:297 |  |
| C173 | History | (same) | A saved character’s row menu | Both | sheet/209.993-feat-characters-list.js:297 |  |
| C341 | Prepare PDF | (same) | PDF export window | Both | sheet/209.9999999999981-bugfix-pdf-save-ui.js:31 |  |
| C342 | Save PDF | (same) | PDF export window | Both | sheet/209.9999999999981-bugfix-pdf-save-ui.js:31 |  |
| C343 | Open PDF to print | (same) | PDF export window | Both | sheet/209.9999999999981-bugfix-pdf-save-ui.js:31 |  |
| C402 | Import JSON | (same) | (the toolbar) | hidden in both modes | markup/10-swipe-tab-shell.html:100 |  |

**Places that would change:** none

**Harnesses that pin today’s words** (files; copies carried by older releases):
- “Export to PDF”: 11 files, 36 copies. characters-harness.js×1, current-suite-runner.js×14, integrate.py×1, pdf-harness.js×1, print-copies-harness.js×1, printed-weapon-columns-harness.js×1, refresh.py×1, remove-phase.py×1
- “Export JSON”: 9 files, 15 copies. appbar-harness.js×1, characters-harness.js×3, checklist-walk.cjs×4, checklist-walk.js×1, dependant-typing-harness.js×1, given-spells-harness.js×1, pdf-harness.js×1, search-harness.js×2

### G17 · Applying a choice to the sheet

- **Job:** Apply the Clan, Family or School, a campaign setting, a Rank.
- **Controls:** 7.
- **Do the differences carry meaning?** Different acts (Apply Family, Apply School, Apply, Set, Set Rank, Begin training, Resume). No pair does the same job.
- **Recommended:** leave as they are. Words: “Apply Family (+1 Trait)”, “Apply School”, “Apply”, “Set”, “Begin training”, “Resume {School}”, “Set Rank”.
- All controls of this group are in [inventory.json](inventory.json) (group `G17`).

### G18 · Switching between Play and Manage

- **Job:** Switch mode.
- **Controls:** 2.
- **Do the differences carry meaning?** "Manage" and "Done" are one toggle. The word "Done" is also used for finishing a window; both mean "I am finished here", so no change is proposed.
- **Recommended:** leave as they are. Words: “Done”, “Manage”.
- All controls of this group are in [inventory.json](inventory.json) (group `G18`).

### G19 · Choosing one thing from a list

- **Job:** Pick a skill, a Ring, a search result, a stance, a die, a book.
- **Controls:** 15.
- **Do the differences carry meaning?** The label is the thing’s own name; there is no verb to unify.
- **Recommended:** leave as they are. Words: “{skill name}”, “Earth”, “Fire”, “Water”, “{name of the result}”, “{category name and count}”, “Search”, “{stance name and Ring}”, “{arrow name}”, “{clan / family / school name}”, “{book name}”, “(a page thumbnail)”, “{court name}”.
- All controls of this group are in [inventory.json](inventory.json) (group `G19`).

### G20 · Ticks in the roll preview

- **Job:** Tick an option for this roll.
- **Controls:** 1.
- **Do the differences carry meaning?** Rows with a check box, named by the option.
- **Recommended:** leave as they are. Words: “Missing Limb: Uses your missing limb: TN +10”.
- All controls of this group are in [inventory.json](inventory.json) (group `G20`).

### G21 · Pips you tap

- **Job:** Spend or give back one pip (Void, spell slots).
- **Controls:** 3.
- **Do the differences carry meaning?** No visible word. The spoken name comes from a tooltip ("Filled — click to spend this Void Point") that says "click", which is not the verb on a touch screen.
- **Recommended:** leave as they are. Words: “(no text: a pip)”.
- All controls of this group are in [inventory.json](inventory.json) (group `G21`).

### G22 · Headings that open and close

- **Job:** Open or close a section.
- **Controls:** 9.
- **Do the differences carry meaning?** Named by the section.
- **Recommended:** leave as they are. Words: “GM overrides: Advantage and Disadvantage sets”, “Armor & TN ⓘ”, “Weapons ⓘ”, “Stance”, “Void”, “Ten Dice Rule breakdown”, “Rule”, “(arrow)”, “Rank settings”.
- All controls of this group are in [inventory.json](inventory.json) (group `G22`).

### G23 · One-off actions

- **Job:** Actions that exist once (Next Round, Set score, Chapters, Show more, and so on).
- **Controls:** 36.
- **Do the differences carry meaning?** Each has a name of its own and no twin.
- **Recommended:** leave as they are. Words: “Lost ancestor’s favour”, “(icon)”, “Recognition by your lord”, “Untrained Skills”, “Already added”, “Show Structured Mastery”, “Show Free-Text Mastery”, “I have already added it myself”, “Missing Limb: Uses your missing limb: TN +10”, “Jade Petal Tea drunk daily (+2k2)”, “B18 inventoryKuni Shugenja · Insight Rank 1Kuni · CrabOpen now”, “Export to PDF”, “Core Rulebook p.146”, “Core Rulebook p.125”, “Memorised”, “Set score”, “Next Round”, “(no text: a wound level)”, “Reduce by 10 & take Wounds”, “Show more”, “Fix page numbers”, “Check now”, “Chapters”, “(icon and text)”, “Search in book”, “Leave {element} for later”, “Use for {slot}”, “Review earlier rank spells · {n}”, “Characters”, “Load”, “New Blank”, “{n}”, “Go to Advanced Schools”.
- All controls of this group are in [inventory.json](inventory.json) (group `G23`).

## 4. Which rows meet the parked A04.2 pattern

A04.2’s pattern is **a badge on the left, then Change, then one i**. Below is the order of the buttons on each Advantage and Disadvantage card today (laptop; the ✕ left out). Play hides Change, so the same card is shorter there.

| Card | Manage | Play | Meets the pattern? |
|---|---|---|---|
| Ancestor card (Clan & School) | Reset session · Lost ancestor’s favour | Reset session · Lost ancestor’s favour | partly: Reset session and the favour badge on the card; its i is on the section heading |
| Wealthy | Choose… · i | — | meets it (with "Choose…" for "Change") |
| Kharmic Tie | Change · i · Reset session · i | i · Reset session · i | no today: two i buttons and Reset session between; B17 (approved) brings Change and one i onto the badge’s row |
| Zakyo Toshi Citizen | Choose… · i · Add 1.5 koku · Already added | Add 1.5 koku · Already added | meets the front of it (Choose…, i), then two koku buttons |
| Luck | Change · Reset session · i | Reset session · i | partly: the i comes after Reset session |
| Dark Paragon | Change · i · Reset session | i · Reset session | partly: Change then i, then Reset session |
| Great Destiny | Use · Reset session | Use · Reset session | not applicable: no Change, no i |
| Lord Moon’s Curse | Change · Resist Lord Moon (TN 20) | Resist Lord Moon (TN 20) | no: Change, no i |
| Seven Fortunes’ Curse | Change · i | i | meets it (Change, one i) |
| Brash | Check (TN 25) | Check (TN 25) | not applicable: checks, not a Change card |
| Overconfident | Check (TN 20) | Check (TN 20) | not applicable: checks, not a Change card |
| Can’t Lie | Check (TN 20) | Check (TN 20) | not applicable: checks, not a Change card |
| Contrary | Check | Check | not applicable: checks, not a Change card |
| Rumormonger | Check (TN 5 × Glory) | Check (TN 5 × Glory) | not applicable: checks, not a Change card |
| Soft-Hearted | Check (TN 20) | Check (TN 20) | not applicable: checks, not a Change card |
| Lost Love | Spend a Void Point | Spend a Void Point | not applicable: checks, not a Change card |
| Haunted | Reset session | Reset session | not applicable: Reset session only |
| Unlucky | Change · − · + · Reset session | − · + · Reset session | no: Change, a − and a +, Reset session, no i |

Reset-session rows that would move with A04.2: Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky and the Ancestor card. The rows that already meet the pattern (Wealthy, Seven Fortunes’ Curse, the front of Zakyo Toshi Citizen) do not change under A04.2.

## 5. Findings beyond the words

These are about the spoken name rather than the visible word. They are not decided here; they are inputs to the rulings above.

- **41 live controls are announced as a bare glyph** (no aria-label): + on Rings & Traits; − on Rings & Traits; ⓘ on Combat; ✕ on A wound level (window); ✕ on About Ancestors (i); ✕ on Add Arrows; ✕ on Add spell scroll; ✕ on Adv & Disadv; ✕ on Advantage information ; ✕ on Affinity (i badge); ✕ on Attack & Damage formul; ✕ on Cast a spell; ✕ on Change (a choice alrea; ✕ on Check Taint growth.
- **12 live controls have a spoken name that does not contain their visible word** (a voice-control user who says what they see will not reach them): “+Book” is announced “Add a book”; “Already added” is announced “Record that the 1.5 koku is already ”; “B18 inventoryKuni Sh” is announced “Open B18 inventory”; “Change” is announced “Configure Dark Paragon”; “Check (TN 20)” is announced “Can’t Lie: Willpower Trait Roll when”; “Check (TN 25)” is announced “Brash: Willpower Trait Roll when thr”; “Check (TN 5 × Glory)” is announced “Rumormonger: Willpower Trait Roll to”; “Check” is announced “Contrary: Willpower Trait Roll when ”; “Reset session” is announced “Great Destiny: make it available aga”; “Reset session” is announced “Restore Unlucky to its per-session m”.
- **Tooltips do not become names.** When a button has text or a glyph its `title` is not what a screen reader says. Windows’ corner ✕ buttons (Close/Cancel) and the ✕ on skill and weapon rows (Remove) are announced as “✕”.
- **"Click"** appears in the spoken names of the pips ("Filled — click to spend this Void Point"), which is not the verb on a touch screen.
- **Older controls still in the page:** the first toolbar’s Load, New Blank, Delete, Import JSON and Characters buttons, and the Rank settings steppers, exist in the page and are never shown. They carry words of their own (e.g. "New Blank", "Load"); removing them is not part of B18, but a rename would have to decide about them.
- **Seen on one size only** (live rows): laptop only: ‹, ›; phone only: none. (Most of these are state, such as a window opened on one size, not a different control.)
- **"Add court" is built twice**, once with a "+" and once without (Darling of the Court and the court badges).

## 6. The owner’s answers

Not given yet. The 14 questions are on the private ruling page, https://claude.ai/artifact/CfJNQtsc9wsm5vpGP7NW76 (source: [ruling/B18-RULING.html](ruling/B18-RULING.html)). Answers save to the page’s own store as the owner gives them; when they do, they go here verbatim.

## 7. Usage

Weekly meter (all models, account-wide): **42%** at the start of stage 1 and **54%** at the end, so stage 1 took about **12 points**. The five-hour meter went from 9% to 95% over the same work. The weekly meter resets at 01:00 UTC on 25 November.
