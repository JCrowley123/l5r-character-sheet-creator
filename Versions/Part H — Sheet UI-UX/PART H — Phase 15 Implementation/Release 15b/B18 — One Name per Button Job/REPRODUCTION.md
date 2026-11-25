# B18 stage 1 — how the inventory was made

21 November 2026 (Claude). Read-only: no application file was edited; the sheet was opened from the file in a test browser and nothing was saved to the repository except these records and scripts.

| Item | Value |
|---|---|
| Sheet read | `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html`, sha256 `921f3ac9e5c61bde84068a20dd5cc4ab014367e8b1b7930438cf24b4a7686150`, 17,718,601 bytes (Release 15a live; `build.py --check-drift` reported BYTE-IDENTICAL before each commit) |
| Source read | the same tree at commit `2e0740ba` (the 15b kickoff branch on `main` `3b499a88`), `src/` without `vendor/` (243 `.js` and `.html` files) |
| Browser | Playwright 1.63.0, Chromium 153.0.8010.12 (headless), `C:/Users/jcrow/l5r-qa-tools/ms-playwright` |
| Sizes | phone 390×844, touch, device scale 2; laptop 1440×1000, scale 1 |
| Modes | Manage and Play (`__L5R_TEST__.MODES12.set`) |
| Character | A03's `dense` (`Release 15a/A03 …/qa/a03-fixtures.json`) with the entries added by `qa/inventory/fixtures.cjs` (`sessions`): Kharmic Tie Rank 3 → Aiko (2 of 3), Luck, Dark Paragon, Great Destiny, Haunted, Unlucky, and an Ancestor (Kuni). `ancestorImperial` (the same with Seppun) was used once to see "Use it now". Imported from a file as a player would. |
| Environment | `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`, `PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright`, `PYTHONUTF8=1`, `NODE_OPTIONS` unset; `navigation-budget.cjs` and `splash-fast.cjs` preloaded by `qa/inventory/run.sh`; one browser job at a time |
| Result | 3,542 control reads → 405 distinct controls in 23 groups (237 read live, 160 from the source, 8 in the page but never shown). Raw reads: `qa/inventory/data/raw.json.gz`. |

## Scripts (`qa/inventory/`)

| Script | Does |
|---|---|
| `run.sh` | runs a Node script with the environment above |
| `common.cjs`, `fixtures.cjs` | paths, opening the sheet, the test character |
| `read-controls.cjs` | reads every button and button-like control that is on screen: visible label, spoken name (aria-labelledby, aria-label, content, title), title, page, window, card, size. Clicks nothing. |
| `scenarios.cjs` | how each window and page is brought up (press a control that opens it) and closed again |
| `scan.cjs` | the live read: every tab, then every scenario, at both sizes in both modes |
| `scan-hidden.cjs` | the controls that are in the page but never shown |
| `static_scan.py` | finds where the source creates a button or button-like control (labels as written) |
| `dialog_labels.py` | reads every call of `appConfirm`, `appConfirm3Way` and `appAlert` and lists the button words they are called with |
| `static_extra.py` | the controls the live read could not reach, read from the source by hand (with the hits that are not controls, and why) |
| `jobs.py` | the 23 job groups and the rules that put a control in one |
| `merge.py` | joins the live read, the hidden read, the source rows and the dialog words into one table; finds each control's source line |
| `pins.py` | searches every harness in a `qa/` folder under `Versions/` for each label |
| `recommendations.py` | Claude's recommendation for each group |
| `build_outputs.py` | writes `INVENTORY.md` and `inventory.json` |
| `data/` | `raw.json.gz` (live reads), `hidden.json.gz`, `static.json`, `dialogs.json`, `pins.json`, `table.json` (the merged table) |

## To repeat it

From the repository root, with the environment above and the sheet built:

```powershell
$B18 = "Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B18 — One Name per Button Job/qa/inventory"
sh "$B18/run.sh" "$B18/scan.cjs" out/scan laptop,phone management,play     # about 15 minutes
sh "$B18/run.sh" "$B18/scan-hidden.cjs" out/hidden
python -X utf8 -I "$B18/static_scan.py" out/static.json
python -X utf8 -I "$B18/dialog_labels.py" out/dialogs.json
python -X utf8 -I "$B18/merge.py" out/scan/raw.json out/static.json "$B18/jobs.py" out/table.json out/dialogs.json out/hidden/hidden.json
python -X utf8 -I "$B18/build_outputs.py" pin-groups out/table.json out/groups.json
python -X utf8 -I "$B18/pins.py" out/groups.json out/pins.json
python -X utf8 -I "$B18/build_outputs.py" write out/table.json out/pins.json out/scan/raw.json "Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B18 — One Name per Button Job"
```

(`python -I` ignores `PYTHONUTF8`; `-X utf8` is what keeps the output encoding right on Windows.)

## What the method does not prove

- **Live coverage is one test character.** A control that needs a state it is not in (a Dark Paragon reroll after a matching roll, the Library reader with a book, the wizard's later screens) is a source-only row, found by a scan of the source and read by hand. A control built in a way neither the scan nor the hand reading saw would be missing; the dialog words, which a text search cannot find, were read from every call to close the largest gap.
- **A "control" row is one control type**, not one element. Twenty skill rows with a roll button are one row with an instance count.
- **Pins are a text search.** Short words over-match; a harness that finds a control by position or by class and not by its word is not found.
- **The harness search skipped** the B18 scripts and the Release 15b mock-up scripts (a mock-up is not a check).
- **Labels are shown as written in the source**; the sheet draws most button text in capitals with the style sheet.

## Stage 3 mock-ups, round 1 (25 November 2026)

Claude, 25 November 2026. Read-only: no application file was edited. Worktree `C:/Users/jcrow/l5r-release-15b-b18`, branch `claude/release-15b-b18-mockups` from `origin/main` `450362b9`, with this folder brought over from `origin/claude/jovial-rubin-993414` (`3f2a9df1`).

| Item | Value |
|---|---|
| Sheet | the live tree's `l5r-character-sheet.html`, sha256 `1f002be964b12ee91b7ed484b949946a859d84b84a7a7756bf7d9ed1841b5819`, 17,773,727 bytes (`build.py --check-drift`: BYTE-IDENTICAL) |
| Browser | the project's QA Chromium (`C:/Users/jcrow/l5r-qa-tools/ms-playwright`), Playwright from `C:/Users/jcrow/l5r-qa-tools/node_modules`, `PYTHONUTF8=1`, `NODE_OPTIONS` unset, the two preloads (`run.sh`) |
| Sizes | phone 375 × 812, touch, scale 2; laptop 1440 × 1000, scale 1 |
| Characters | `qa/mockup/fixtures.cjs`: the inventory's character (`sessions`), its Imperial variant with Seppun (`imperial`), and small variants with only the entries one picture needs (`resets`, `changes`, `checks`, `court`) |

### The re-check (`qa/recheck/`)

`run-recheck.sh <out>` runs the stage-1 pipeline unchanged (scan, hidden read, source scan, dialog words, merge) and `compare.py` compares the new table with `qa/inventory/data/table.json`. Kept: `table.json`, `raw.json.gz`, `hidden.json.gz`, `static.json`, `dialogs.json`, `compare.json`, the scan and merge logs, `run-times.txt` (02:10–02:17 UTC). Result: 409 controls (241 live, 160 source, 8 hidden), 0 scan errors; [RECHECK.md](RECHECK.md).

### The board (`qa/mockup/`)

| Script | Does |
|---|---|
| `run.sh` | the QA environment (as the inventory's) |
| `common.cjs` | the inventory's helpers, with the 375 px phone |
| `fixtures.cjs` | the test characters above, written to the output folder and opened by Import |
| `proposals.cjs` | the rulings drawn in the test browser: one engine rewrites a control's words, spoken name or glyph whenever the sheet draws it (a MutationObserver), only where today's words are found exactly; `install(page, groups)` turns on chosen groups (`G03-delete` is G03's option B) |
| `repro.cjs` | 24 scenes at both sizes, each today and after (only the scene's own groups on): numbers the touched controls with a blue disc drawn for the picture, takes the picture, and reads each numbered control's words (as written and as drawn), spoken name and title; writes `reproduction.json` |
| `content.py`, `build_board.py`, `board-template.html` | the board's words, and the builder (WebP at quality 72, phone pictures 560 px wide, laptop at most 1000; a scene whose today and after pictures are byte-identical is shown once) |
| `check-board.cjs` | the light checks: the board inside the artifact skeleton at 375 × 812 and 1280 × 900, light and dark; page errors, failed loads, horizontal scroll, broken pictures; writes `board-checks.json` |

To repeat, from the repository root:

```powershell
$M = "Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B18 — One Name per Button Job/qa/mockup"
sh "$M/run.sh" "$M/repro.cjs" out/b18-shots                    # about 5 minutes
python -X utf8 "$M/build_board.py" out/b18-shots out/B18-MOCKUPS.html
sh "$M/run.sh" "$M/check-board.cjs" out/B18-MOCKUPS.html out/b18-board-check
```

Kept in the repository: `reproduction.json`, `board-checks.json`, the board copy `mockups/B18-MOCKUPS.html`. The PNG captures and the test characters are in the session notes folder (`b18-mockup-evidence/`), as group 2's were.

### What the method does not prove

- **The "after" pictures are drawn, not built.** The engine changes words and spoken names in the page as it is drawn; a build would change the source. Layout effects of a longer word (G10 on a phone) and of the ring i (G12) are real measurements of the drawn page.
- **Spoken names are read from the page**, in the order a screen reader uses (aria-labelledby, aria-label, content, title); no screen reader was run.
- **Not pictured** (they need a state the test characters do not reach): the wizard's later screens (G02, G03), the Library's book menu (G03), the bonus-slot question (G05), Hida Atarasi's price question (G07), the after-roll gifts of Kakita and Toku and the Emphasis reroll's second step (G08), the Arrows window and the Rank settings steppers (G14), the wound penalty's i (G12). Each is listed on the board with its words today and after.

### Round 1 revised: one change per card (`qa/mockup/`)

| Script | Does |
|---|---|
| `cards.cjs` | for each change and each place it shows (41 places), opens the live sheet on a phone (375 × 812) twice, today and with only that change's groups drawn (`proposals.cjs`); outlines the changed button for the picture only, cuts a close-up (the width of its card or window, a band round the button), and reads its words, drawn words, spoken name and title; writes `cards.json`. Two questions the characters cannot reach are drawn by filling the sheet's question window as its own `appConfirm` does, with the sheet's own words. |
| `cards_content.py`, `build_cards.py`, `cards-template.html` | the cards' words, and the builder (WebP at quality 76, 640 px wide at most; a "heard only" card shows one picture) |
| `check-board.cjs` | the same light checks; `FOCUS=#reset` picks the part photographed |

```powershell
sh "$M/run.sh" "$M/cards.cjs" out/b18-cards                       # about 4 minutes
python -X utf8 "$M/build_cards.py" out/b18-cards out/B18-MOCKUPS.html
$env:FOCUS = "#reset"; sh "$M/run.sh" "$M/check-board.cjs" out/B18-MOCKUPS.html out/b18-cards-check
```

Kept: `cards.json`, `cards-board-checks.json`, the board copy. The close-ups are in the session notes folder (`b18-mockup-evidence/cards/`). The first board's scripts (`repro.cjs`, `content.py`, `build_board.py`, `board-template.html`) and its `reproduction.json` and `board-checks.json` stay as the record of version 1.

## The owner's answers and the Reset measurements (25 November 2026)

**The answers:** read from the board's store with the artifact data tool (collection `answers`, list, saved one JSON file per document) into `qa/answers-round1/answers/` (21 files).

**The Reset measurements:** today's sheet in Play, on a phone (375 × 812, touch) and a laptop (1440 × 1000), with the board's `resets` and `sessions` characters. For each Reset: its class, size, letters and the buttons on its line. For each i on the Advantage, Clan & School and Combat tabs: its distance from its card's right edge and from the button before it. No change is drawn.

```powershell
$M = "Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15b/B18 — One Name per Button Job/qa/mockup"
sh "$M/run.sh" "$M/measure-reset.cjs" "$M/../reset-measures"
```

Kept: `qa/reset-measures/reset-measures.json` and the two characters it used. 0 page errors. The i survey also lists hidden tabs' i's (the tabs share one page), so read only the Advantage cards' rows from it.
