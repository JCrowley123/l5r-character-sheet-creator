# B18 · the inventory re-checked against today's live sheet

Prepared by Claude on **25 November 2026**, before the mock-up board. Read-only: no application file was edited.

The inventory ([INVENTORY.md](INVENTORY.md)) was taken on 21 November on the Release 15a sheet (`921f3ac9…6150`). Since then Release 15b groups 1 and 2 went live. This re-check reads today's live sheet: `origin/main` `450362b9`, application `1f002be9…5819`, 17,773,727 bytes (`build.py --check-drift`: BYTE-IDENTICAL).

## How it was done

- **The same pipeline, unchanged.** The stage-1 scripts in `qa/inventory/` ran on the live tree with the same test character, sizes and modes: the live scan (`scan.cjs`, 4,046 reads, 0 errors), the hidden read, the source scan, the dialog-word reader and the merge. The result is **409 controls** (241 read live, 160 from the source, 8 in the page but never shown), against 405 on 21 November. The output is in `qa/recheck/` (`table.json`, `raw.json.gz`, the logs). The table was compared row by row with the 21 November table (`qa/recheck/compare.py`).
- **The mock-up run read the rest.** Some controls are not on the inventory character: Touch of the Void, Cursed by the Realm (Toshigoku), Seppun's "Use it now", the Darling of the Court window and Quick Access. These were read live in the mock-up run (`qa/mockup/`, MOCKUP.md), and group 2's own records were used for Quick and Epilepsy.
- **A row read from the source shows the source's words.** Touch of the Void is still listed as "Willpower (TN 30)" because its source line still says so; B01 (group 2, round 2) relabels it when the page is drawn. It reads "Keep control (TN 30)" on the live sheet.

## What changed since 21 November, in one list

| Unit (live) | Control | 21 Nov | Today | B18 group |
|---|---|---|---|---|
| B17 | Kharmic Tie's Reset session: spoken name | "Reset session" | "Reset session: all 3 Kharmic Tie uses back" (words unchanged) | G01 |
| B17 | Kharmic Tie's Change: spoken name | "Configure Kharmic Tie" | "Change Kharmic Tie: person or Rank" | G02 |
| B17 | Kharmic Tie's one i (new) | two i's | one i, "Kharmic Tie information" | G12 |
| B04 | Armor TN's i in Quick Access (new) | — | spoken "Armor TN: how it is worked out" | G12 |
| A14 | Wound penalty's i (new; shown while wounded) | — | spoken "Wound penalty: how it is worked out" | G12 |
| B01 | Six Disadvantage check buttons | "Check (TN …)" | "Resist insult (TN 25)", "Measure the enemy (TN 20)", "Discretion check (TN 20)", "Cooperate", "Resist gossip (TN 5 × Glory)", "Resolve check (TN 20)" | G11 |
| B01 | Lost Love's button | "Spend a Void Point" | "Steady yourself — Spend Void" | G07 |
| B01 r2 | Touch of the Void's button | "Willpower (TN 30)" | "Keep control (TN 30)" | G11 |
| B03 | Leadership's button | "Lead an ally (School Rank + 1k1)" | "Lead an ally" with "1k1 + 1 (School Rank)" beside it | G11 |
| B03 | Quick's button | "Did not act first: +Reflexes" | "Use" with "+2 (Reflexes)" beside it; spoken "Use Quick: …" | G06 |

The inventory also missed two controls that are not new: Epilepsy's "Avoid (TN 15)" and "End seizure (TN 10)" (group 2 found them; both are already named for what they do).

## Each ruled group against the ruling

"Differs" is what the build would still change. "Matches" is already as ruled. Counts are kinds of control (one row can be several buttons).

| Group | Ruling | Still differs | Already matches | New since 21 Nov |
|---|---|---|---|---|
| G01 Reset | Reset; spoken "Reset {name} for a new session" | All 7 "Reset session" buttons (Ancestor, Kharmic Tie, Luck, Dark Paragon, Great Destiny, Haunted, Unlucky); the round counter's spoken name; three lines of text that name the button (Great Destiny's message, the Ancestor gift note, Kharmic Tie's i window) | The round counter's word "Reset" | Kharmic Tie's spoken name (B17) and its i window's line "Reset session gives back all 3" (B17) |
| G02 Change | Change; spoken "Change {thing}" / "Choose {thing}" | "Configure …" spoken on Dark Paragon, Darling of the Court, Heart of Vengeance, Paragon, Soul of Artistry, Void Versatility, Seven Fortunes' Blessing, Touch of the Spirit Realms, Blackmail and the other named entries; "Choose…" with no name; the wizard's "Choose again" (2) | Kharmic Tie's Change (B17); "Choose School Skills", "Choose School scrolls" and the Library's words (not part of the change) | Kharmic Tie's spoken name (B17) |
| G03 Remove and Delete | ✕ stays, spoken "Remove {entry}"; Delete for saved characters and books | Every ✕ on a row is read as "✕": Skills (and each Emphasis), Advantages and Disadvantages, Equipment, Weapons | "Delete" (Characters, Library), "Remove" (the wizard, a court in Darling of the Court) | none |
| G04 Close or Cancel | ✕ read "Close {window}" (shows you something) or "Cancel {window}" (holds a choice) | 31 corner ✕ read as "✕" | Quick Access ("Close"), History ("Close History") | none |
| G05 OK · Confirm · Cancel · Done | Message: OK; plain Yes: Confirm; plain No: Cancel | "Got it" (5 messages: Kiho rules, Affinity, Deficiency, a Kiho's missing prerequisite, an Alternate Path refused); "Yes"/"No" (the bonus spell slot question) | Every other window foot | none |
| G06 Use | Use; spoken "Use {ability}: {what it does}" | Seppun's (and every Ancestor's) "Use it now"; Great Destiny's spoken name (starts "Great Destiny: …") | Great Destiny's word "Use"; Dark Paragon's "Use {precept}" | Quick's "Use" (B03), already as ruled |
| G07 Spend Void | Spend Void; spoken "Spend Void: {effect}" | One window button: an Ancestor's price question still says "Spend a Void Point" (the inventory had it with G05) | Lost Love (B01, "Steady yourself — Spend Void"); the Void card's seven buttons | Lost Love (B01) |
| G08 Reroll with {source} | One spelling, "Reroll with {source}" | "Re-roll 1s", "Re-roll selected", "Spend Luck (n/m)", "Re-roll with Kakita (a Void Point)", "Spend Toku's Luck (n/1)" | "Reroll with Dark Paragon (n/1)"; "GM invokes Unlucky" and "Add Sun Tao's die" stay by the ruling | none |
| G09 Clear | Clear (as it is); the dice tray's spoken name says what it clears | The dice tray's two Clear buttons are read "Clear" | "Clear filters" (Search) | none |
| G10 + Add {thing} | "+ Add {thing}" | "+ Emph", "+Book", "Add court" (in the Darling of the Court window) | Every other "+ Add …"; the row's "+ Add court" | none |
| G11 Check (TN 30) | Touch of the Void reads "Check (TN 30)" | Touch of the Void reads "Keep control (TN 30)" since 24 November (B01 round 2, which the owner approved as shown). The ruling's reason ("like the others") no longer holds: after B01 only Toshigoku's button still says "Check". | Roll, Cast and the other roll buttons | B01's six names, Leadership (B03), Touch of the Void (B01 r2) |
| G12 i, "{thing} information" | Glyph "i"; spoken "{thing} information" | "About Ancestors"; "Explain: {thing}" (Advantage cards); the Combat tab's ⓘ (2), 👁 (weapons) and stance ⓘ (5); the two new "how it is worked out" i's | Skills, Void Points, Kiho rules, Dark Paragon, Hotei's Curse, the named-entry i's | Kharmic Tie's i matches (B17); Armor TN's (B04) and Wound penalty's (A14) do not |
| G14 Increase / Decrease | Spoken "Increase {thing}" / "Decrease {thing}" | Honour, Glory, Status and Taint (Add/Subtract), Arrows (One more/One fewer), Rank settings (Raise/Lower, Gain/Lose), the Void Ring stepper (no name) | Wounds ("Increase/Decrease wounds taken by 1"); Unlucky's pair stays by the ruling | none |
| G16 Export PDF | "Export PDF" | "Export to PDF" (a saved character's menu; the inventory filed it under G23) | "Export JSON" | none |

## Corrections to the inventory, found while making the board

- **G04's shared window.** The inventory's change column gave "Cancel" to every window drawn by the one shared question-and-message window (Kiho rules, Affinity, Weapon Info, the favour badge). Its own reasoning, which the owner chose, says a message window gets Close. The board follows the reasoning: the shared window's ✕ is read "Close notice" when it shows a message and "Cancel question" when it asks one.
- **G16's word lives in G23's list.** "Export to PDF" was filed with the one-off actions. It is the control the G16 ruling changes.
- **Lost Love** is filed under G23 by the job rules now that its words changed; its job is still G07's, and it matches.
- **The Rings & Traits steppers** with no spoken name are the Void Ring's − and +.
