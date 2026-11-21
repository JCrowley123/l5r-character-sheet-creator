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
