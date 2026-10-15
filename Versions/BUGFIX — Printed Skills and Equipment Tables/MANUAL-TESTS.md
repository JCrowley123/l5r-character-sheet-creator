# Printed Skills and Equipment tables — manual checks

Run on the live app after the merge, on a **copy** of a character (Manage → Save As a copy). **Osamu Matsu** suits both
pages: Lore skills (Trait "Intelligence") and spell scrolls with long notes. For S2, a copy of **Moto Priya** has Sailing,
whose Trait is "Agility or Intelligence".

| # | Steps | Expected |
|---|---|---|
| S1 | Computer: Characters → the copy's ⋯ → **Export to PDF**, save the PDF and open it. Look at Skills and at Equipment. | No scrollbar under either table, and nothing cut off at the right: Skills ends with School, XP and Roll; Equipment ends with Notes. "Intelligence" is whole in the Trait column. Each spell scroll's note is printed in full, wrapping between words. |
| S2 | iPhone: the same Export to PDF, then Share → Print (or Save to Files), and open the PDF. | Both tables fit the page: every Skills column (Skill to Roll) is on the paper. Trait, Rank, XP and Qty are narrow; Skill, Emphases, Item and Notes are the wide ones. "Agility or Intelligence" may sit on two lines; no word is broken in the middle. |
| S3 | iPhone and computer: close the print dialog and look at Skills and Equipment. | They look as before: one-line fields, the same columns. |
| S4 | Optional: in Equipment, add an item with a long note (two sentences), clear its Qty, and export again. | The note wraps in full; the blank Qty prints as a short write-in line. |

## Results (owner's PDFs, live site, 15 October 2026)

The owner exported five PDFs from the live site: Sairyū (Chrome, Edge, Safari on the iPhone) and a copy of Osamu Matsu
set up as above, with Sailing, the long Katana and a Tetsubo (Chrome, Edge, Safari). Claude read each PDF's Skills,
Equipment and weapons pages against the checklist (rows C1–C5 and I1–I5 of the owner's PDF checklist).

| # | Result |
|---|---|
| S1 | **Pass** (Chrome and Edge, both characters). No scrollbar under either table; Skills ends with School, XP and Roll; "Intelligence", "Perception" and "Agility or / Intelligence" are whole (the last on two lines, no word split); all nine spell-scroll notes print in full, wrapping between words. |
| S2 | **Pass** (Safari, both characters). Both tables fit the page; Trait, Rank and Qty are narrow; Skill, Emphases, Item and Notes are the wide columns; no word is split. |
| S3 | **Not run.** A screen check after printing; the PDFs cannot show it. |
| S4 | **Not run** (optional). |

The same exports also pass Printed Weapon Columns' W2 and W4 checks: no scrollbar under the Weapons table; "Heavy
Weapons", "Large", "Kenjutsu" and "Medium" are whole on one line; the long Katana name breaks only between words.
Seen in the same PDFs and not caused by this release: the Earth card runs past the Rings & Traits box (FT-35, deferred
to Phase 15).
