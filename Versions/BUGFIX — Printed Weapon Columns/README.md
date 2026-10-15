# BUGFIX — Printed Weapon Columns (W2 and W4)

Built 15 October 2026, after the owner's Cycle 1 device check. On paper the Weapons table now gives its width to Weapon
and Notes; Skill, Attack, Damage and Size are just wide enough for their values; the name and note break only between
words; and the table no longer prints inside a sideways scroller. Screen layout and saved data are unchanged. Page count
and whitespace stay with Phase 15. BUGFIX — Printed Weapon Text (Cycle 1, Layer 2) made the name and note wrap; this is
the column-width and overflow work it left.

## The defect

The owner's test weapon: a Katana from the list, renamed "Katana of the Unbroken Line, heirloom blade of the Kakita
dueling house" (checklist row W1).

- **W4, iPhone PDF (failed):** the name wrapped mid-word ("Kata / na of / unbr / oken"); Skill and Size took most of the
  row.
- **W2, desktop PDF (passed, with a note):** the name and note wrapped well, but the table printed with a sideways
  scrollbar, and "Kenjutsu" and "Medium" were cut off.

Measured on `main` (`993d14a`) under print media, with the owner's single Katana:

| Width | What paper gets |
|---|---|
| 560 px, the sheet's phone rules | Weapon 58 px, Skill 174, Size 174; every long word of the name breaks; the table runs 45 px past the page edge |
| 703 px (A4) and 725 px (Letter) | the table sits in a scroller (720 px of table in 643 or 665 px); Skill 70 px and Size 64 px clip "Kenjutsu" and "Medium" |
| 1047 px (A4 landscape) | no scroller; Skill and Size still clip |

Three causes, all in print only:
1. **The phone rules reach paper.** Below 600 px the carousel's stacked-card rules (`30-carousel-mobile.css` 9.7) give
   each field `width:auto` (about 174 px for a text field), and Printed Weapon Text's `overflow-wrap:anywhere` lets the
   Weapon column shrink to a single letter. The iPhone's print applies these rules: in the owner's W4 screenshot Skill and
   Size are about a quarter of a table roughly 720 px wide, which only `width:auto` explains.
2. **The scroller survives into print.** `body.car-active .car-page .car-hscroll{overflow-x:auto}` (9.1) and the tablet
   band's `table.dyn{min-width:720px}` (9.7a) outrank `20-carousel.css`'s print reset, so at A4 and Letter widths the
   720 px table scrolls sideways on paper.
3. **Short fields are fixed-width inputs.** Skill (70 px column) and Size (50 px) cannot fit "Kenjutsu" and "Medium".

**Why Printed Weapon Text's harness passed:** it called `goToTab('Combat')` in Management mode, where Combat is hidden,
so the Combat page was never prepared and its table never got the `.car-hscroll` wrapper. Its checks also measured only
the name and note boxes. This harness enters Play mode first (as Phase 12.7's harness does) and asserts the wrapper is
there.

## The fix

`src/sheet/209.9999999993-bugfix-printed-weapon-columns.js` (`PRINTWEAPONCOLS`) follows Printed Weapon Text's pattern:
on `beforeprint` it places a one-line text copy after each weapon's Skill, Attack, Damage and Size field; on
`afterprint` it removes them, sweeping copies the carousel may clone while printing.
`src/css/59.999988-bugfix-printed-weapon-columns.css` applies under print only:

- the table's scroller becomes `overflow:visible`, and the 720 px floor is lifted;
- the four short columns get `width:1%` and `nowrap`, so they shrink to their widest value or header, and Weapon and
  Notes share the rest; the empty remove-button column collapses;
- the fields are hidden and their copies shown, with the printed fields' underline; a blank keeps a 2em write-in line;
- cells keep 4 px side padding (the phone rules set none, so neighbouring underlines touched);
- Printed Weapon Text's name and note copies wrap with `overflow-wrap:break-word`, so a word moves to the next line
  whole (a hyphen still counts as a break).

No `position` changes. Export to PDF prints through `window.print()`, which fires the same events.

## Structure

| File | Owned item |
|---|---|
| `src/sheet/209.9999999993-bugfix-printed-weapon-columns.js` | `PRINTWEAPONCOLS`, switch `PRINTED_WEAPON_COLUMNS_ENABLED` |
| `src/css/59.999988-bugfix-printed-weapon-columns.css` | print-only rules; classes `pwc-enabled`, `pwc-print-text`, `pwc-text-source` |
| `src/sheet/210-test-seam-and-init.js` | `printed-weapon-columns-seam` block |
| `build/manifest.json` | two entries (after Printed Weapon Text's stylesheet; after Screen Focus from the App Bar) |
| `QA — Removal Chain Registry/removal_chain.py` | one `CHAIN` entry, at the end |

Declared dependency on Printed Weapon Text (both ROLLBACKs say so).

## Verification (15 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/printed-weapon-columns-harness.js` | **17/17** on the candidate; **7/17 on `main`**: the 10 fix checks fail, the 7 guards pass |
| Negative variants `qa/verify-variants.py` | **16/16 pinned**: `main` (10), switch off (10), and 14 single changes, one for each rule and step: scroller kept (1), 720 px floor kept (3), phone padding kept (2), short columns not shrunk (1), short values wrap (1), remove column kept (1), fields shown (5), no blank line (1), inline copies (1), breaks inside words (2), no copies (8), copies made twice (6), no sweep (1), Printed Weapon Text off (5) |
| Neighbours on the candidate | Printed Weapon Text **15/15**; Export to PDF **33/33**; Printed Sheet Ring Layers **8/8**; Print Copies Cleanup **6/6** |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds `main` exactly (3,833,345 bytes, `c3b20fbe…`) |
| Removal-chain registry | **11/11** |
| Ownership scan | Exit 1, explained in ROLLBACK (bare "BUGFIX" attribution); every line listed is this release's own |
| Cycle 1 suite on the candidate | **5,249/5,249** through Cycle 1's flat runner: 104 suites, all run fresh, none failed (`qa/full-suite.log`) |

Candidate: **3,837,258 bytes**, SHA-256 `d8e6915c536d834ecc8b134607f6a944b0e27cf09ce5539026c981145a2a556f`.

**Merged** to `main` at `cf75263` on the owner's word (15 October 2026). **Live, verified at 06:57 UTC** with
`qa/verify-live.py`: the page (3,842,907 bytes, SHA-256 `33265cc5…`) and the service worker (`d86f922f92930132`)
match the build, and this harness passes **17/17** on the downloaded live page (`qa/live/`).

How the harness sees paper. It prints two tables: the owner's single Katana, then that Katana with a library Tetsubo
("Heavy Weapons", "Large") and a blank custom weapon. With two or more weapons, a row can also show its Hand selector.
Each table is measured under print media at:
- **560 px**: the sheet's phone rules, the closest Chromium gets to the iPhone (narrower than the iPhone's own print
  layout, so the stricter case);
- **703 px and 725 px**: A4 and US Letter at the sheet's 12 mm margins (desktop);
- **1047 px**: A4 landscape.

At each width, for each table:
- no box around the table scrolls or clips sideways, and the table lies within the page;
- every word of the name and note sits on one line, and both wrap only between words;
- each short value is whole, on one line, clear of its neighbours, and a blank keeps a write-in line;
- each short column is no wider than its widest text plus padding, and Weapon and Notes hold the rest.

The screen check compares the table's geometry at 390 and 1280 px before printing, while the print copies exist, and
after printing. A real A4 PDF (`page.pdf()`) must hold "Kenjutsu", "Medium", "Heavy Weapons", "Large" and the full name
in xpdf's extract. That check is a guard: xpdf keeps a partly clipped word, so it passes on `main` too. It does fail when
the copies are missing (variant `no-copies`).

**Limits.** At A5 (about 470 px), a table holding both a two-word Skill and a Hand selector is wider than the page, as it
is on `main`. The weapon's info button (👁) still prints, as before. Out of this fix's scope, measured on the candidate:
the Skills and Equipment tables keep the same print scroller and 720 px floor, so at A4 and Letter each is a 720 px table
in a 673 or 695 px sideways scroller.

**Not verified here:** iPhone Safari's print and Share → Save to Files. See `MANUAL-TESTS.md` (W4, W2, W5).

`qa/current-suite-runner.js` chains Layer 7's suite (5,249) and adds 17: **5,266**.
