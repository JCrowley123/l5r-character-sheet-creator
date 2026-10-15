# BUGFIX — Printed Skills and Equipment Tables

Built 15 October 2026, on top of BUGFIX — Printed Weapon Columns (merged to `main` as `cf75263`), which fixed the same
fault for the Weapons table and recorded this one as out of its scope.
On paper the Skills and Equipment tables now keep to the page with no sideways scroller; Trait, Rank, School, XP, Roll and
Qty are just wide enough for their values; Skill and Emphases, Item and Notes share the rest; and every name, Trait, item
and note prints whole, wrapping between words. Screen layout and saved data are unchanged. Page count and whitespace stay
with Phase 15.

## The defect

Measured on the Printed Weapon Columns build (`main` at `a635d8f`; `main` before it, `993d14a`, lays these two tables out
identically) under print media, with the owner's own entries: Investigation, Sailing ("Agility or Intelligence"), Lore: Heraldry, Iaijutsu,
a long custom Lore skill, and Osamu Matsu's spell scrolls, whose notes run to 107 characters.

| Width | What paper gets |
|---|---|
| 560 px, the sheet's phone rules | Skills is 783 px wide on a 530 px page (Skill, Trait and Rank 174 px each), so Emphases, School, XP and Roll fall off the paper; in Equipment, Qty takes 174 px and the item name and note are cut off |
| 703 px (A4) and 725 px (Letter) | each table is 720 px inside a 673 or 695 px sideways scroller (`overflow-x:auto`), so the right-hand columns are cut off and paper shows a scrollbar |
| every width | the 70 px Trait column clips "Intelligence", "Perception" and "Agility or Intelligence"; a long skill name, item name or note is cut off at the edge of its one-line field |

The causes are the same as for the Weapons table, all in print only:
1. **The scroller survives into print.** `body.car-active .car-page .car-hscroll{overflow-x:auto}` (`30-carousel-mobile.css`
   9.1) and the tablet band's `table.dyn{min-width:720px}` (9.7a, 601–820 px) outrank `20-carousel.css`'s print reset.
2. **The phone rules reach paper.** Below 600 px (and on the iPhone's print) the stacked-card rules (9.7) set each field to
   `width:auto`, about 174 px for a text field, and take away the cells' side padding. Rule 9.10 restores the table display
   on paper, but not those.
3. **Values are one-line fields.** A fixed 70 px Trait field cannot hold "Intelligence", and an item note cannot wrap.

## The fix

`src/sheet/209.9999999994-bugfix-printed-skills-equipment.js` (`PRINTSKILLSEQUIP`) follows Printed Weapon Columns' pattern:
on `beforeprint` it puts a text copy after each Skill, Trait, Rank, Item, Qty and Notes field; on `afterprint` it removes
them, sweeping copies the carousel may clone while printing. Rank and Qty get one-line copies; Skill, Trait, Item and Notes
get copies that wrap. `src/css/59.999989-bugfix-printed-skills-equipment.css` applies under print only:

- each table's scroller becomes `overflow:visible`, and the 720 px floor is lifted;
- cells keep 4 px side padding;
- the narrow columns (Trait, Rank, School, XP, Roll; Qty) get `width:1%` and `nowrap`, so they shrink to their widest value
  or header; the empty remove-button column collapses;
- the fields are hidden and their copies shown, with the printed fields' underline; a blank keeps a write-in line;
- the wrapping copies break between words only (`overflow-wrap:break-word`). Trait wraps too: "Agility or Intelligence"
  prints on two lines, which is what lets the Skills table fit a phone page (variant `trait-one-line` shows the 560 px
  table running over without it).

Emphases stay as they print today (dropdowns showing their choice); they fit at every width measured. No `position`
changes. Export to PDF prints through `window.print()`, which fires the same events.

## Structure

| File | Owned item |
|---|---|
| `src/sheet/209.9999999994-bugfix-printed-skills-equipment.js` | `PRINTSKILLSEQUIP`, switch `PRINTED_SKILLS_EQUIPMENT_ENABLED` |
| `src/css/59.999989-bugfix-printed-skills-equipment.css` | print-only rules; classes `pse-enabled`, `pse-print-text`, `pse-print-wrap`, `pse-text-source` |
| `src/sheet/210-test-seam-and-init.js` | `printed-skills-equipment-seam` block |
| `build/manifest.json` | two entries (after Printed Weapon Columns' stylesheet; after Printed Weapon Columns' script) |
| `QA — Removal Chain Registry/removal_chain.py` | one `CHAIN` entry, at the end |

No dependency on another removable release; see ROLLBACK.

## Verification (15 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/printed-skills-equipment-harness.js` | **18/18** on the candidate; **6/18** on `main` (`a635d8f`, with Printed Weapon Columns) and on `main` before it (`993d14a`): the 12 fix checks fail, the 6 guards pass |
| Negative variants `qa/verify-variants.py` | **21/21 pinned**: `main`, the Printed Weapon Columns build (12), switch off (12), and 19 single changes, one for each rule and step: scroller kept (2), 720 px floor kept (4), phone padding kept (3), narrow columns not shrunk (1), XP wraps (1), remove column kept (2), fields shown (7), no blank line (2), inline one-line copies (2), inline wrapping copies (1), no flex in the name rows (1), no line-high blank (1), copies inherit nowrap (4), breaks inside words (3), Trait on one line (5), no one-line copies (5), no wrapping copies (7), copies made twice (4), no sweep (1) |
| Removal proof `qa/test-removal.py` | **6/6** on the branch: rebuilt `main` `a635d8f` exactly (3,837,258 bytes, `d8e6915c…`). Printed Weapon Columns' own proof, run on this tree, strips this release first through the chain and still rebuilds `main` before it, `993d14a`, exactly (6/6, "1 later") |
| Removal-chain registry | **11/11** |
| Neighbours on the candidate | Printed Weapon Columns **17/17**; Printed Weapon Text **15/15**; Export to PDF **33/33**; Printed Sheet Ring Layers **8/8**; Print Copies Cleanup **6/6** |
| Cycle 1 suite on the candidate | **5,249/5,249** through Cycle 1's flat runner: 104 suites, all run fresh, none failed (`qa/full-suite.log`); with Printed Weapon Columns' 17 and this release's 18 above, **5,284** |
| Ownership scan | Exit 1, explained in ROLLBACK (bare "BUGFIX" attribution); every line listed is this release's own |
| Structure (`qa/inventory.py`) | element IDs, sections, roll-modal count and tag balance unchanged from `main` |

Candidate: **3,842,087 bytes**, SHA-256 `b24623f1be48f4ca6394e165b462d22609e1b237a64676f4b076fd64c9af9e03`.

**Merged** to `main` at `87a2163` on the owner's word (15 October 2026), after BUGFIX — Carousel Keeps Its Page on
Rotation (`4e5ebf8`), so the build just before this release is now `main` at `c8ddb02` (3,838,436 bytes, `f4ca86eb…`);
the removal proof expects that build. Re-checked on the merged build (3,843,265 bytes, `15c4a43d…`; its sources rebuild
it byte for byte): this harness **18/18**, Carousel Rotation's 10/10, Printed Weapon Columns' 17/17; removal **6/6**
(Rotation's proof 6/6 with this release later, Weapon Columns' 6/6 with two later); registry 11/11; variants **21/21** pinned against `c8ddb02`.
The stylesheet had been saved with Windows line endings (CRLF), unlike every other fragment; it was normalised to LF
afterwards, which changes only the page's bytes: **3,843,210 bytes**, `14711d4f…` (this harness 18/18, Weapon Columns'
17/17, Rotation's 10/10 and removal 6/6 re-run on it).
**Live, verified at 12:27 UTC** (after the LF change; first verified at 12:19 on the CRLF build) with
`qa/verify-live.py`: the page (3,848,859 bytes, SHA-256 `2761c303…`) and the service worker (`09c41e9753fc2245`) match
the build, and this harness passes **18/18** on the downloaded live page (`qa/live/`).

How the harness sees paper. It adds five skills and three items (the third a blank row), enters Play mode and goes to
Skills and Equipment, so the carousel wraps both tables in their scrollers (the harness asserts the wrappers are there).
Each table is measured under print media at:
- **560 px**: the sheet's phone rules, the closest Chromium gets to the iPhone (narrower than the iPhone's own print layout,
  so the stricter case);
- **703 px and 725 px**: A4 and US Letter at the sheet's 12 mm margins (desktop);
- **1047 px**: A4 landscape.

At each width, for each table:
- no box around the table scrolls or clips sideways, the table lies within the page and fills its box;
- every Skill, Trait, Item and Notes value is whole, wraps only between words, and a blank keeps a line-high write-in line;
- each Rank and Qty value is whole, on one line, clear of its neighbours, and a blank keeps a write-in line; each XP cost
  stays on one line;
- every Emphasis shows its whole choice, within the page;
- each narrow column is no wider than its widest unbreakable text (header or value) plus padding, the remove column is
  empty, and the wide pair holds the rest.

The same layout checks run again in Management mode. The screen check compares both tables' geometry at 390 and 1280 px
before printing, while the print copies exist, and after printing. A real A4 PDF (`page.pdf()`) must hold the long Lore
skill, "Agility or Intelligence", two Emphases, the spell scroll's name and its whole note in xpdf's extract; on `main`
the clipped long skill, Trait and note are missing from it.

**Limits.** The roll column keeps its "Roll" header with nothing under it on paper, as on `main` (now narrow). At phone
widths the Skill column is about 150 px, so mastery notes under a skill run to more lines and the sheet grows longer;
page count stays with Phase 15. Emphases are not copied: a very long custom Emphasis could still be cut off at phone widths.

**Device checks (15 October 2026):** the owner's PDFs from Chrome, Edge and Safari on the iPhone pass S1 and S2 for
Sairyū and an Osamu Matsu copy with Sailing and the spell scrolls; S3 (the screen after printing) and S4 (optional)
were not run. See `MANUAL-TESTS.md`.

`qa/current-suite-runner.js` chains Carousel Rotation's suite (5,276, which chains Printed Weapon Columns') and adds 18:
**5,294**.
