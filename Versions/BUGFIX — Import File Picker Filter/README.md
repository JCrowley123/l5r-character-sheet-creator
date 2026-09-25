# BUGFIX — Import File Picker Filter

Made 25 September 2026 from the owner's iPhone test of Phase 11's Characters screen. **Import
JSON's button opened the Files picker, but a saved character could not be chosen**: it was greyed
out. The file was `Sairyu_.l5r`, a save named with the sheet's older `.l5r` extension. Renamed
to `Sairyu_.l5r.json`, it imported correctly.

## What was wrong

Both Import controls asked the browser to offer only JSON files:

| Control | Where | Filter |
|---|---|---|
| Toolbar Import | `#fileImport`, trunk markup (`src/markup/10-swipe-tab-shell.html`) | `accept="application/json"` |
| Characters screen Import JSON | `#cl11ImportFile`, built by Phase 11 (Part K) | `application/json,.json` |

iOS turns that into a file-type filter and greys out everything else. It has no type for
`.l5r`, so an older save cannot be tapped at all. This is the sheet's filter, not an iOS
limitation.

## What changed

One fragment, `src/sheet/209.999-bugfix-import-file-filter.js`, removes the `accept` attribute
from both controls: the toolbar's at load, and the Characters screen's each time that screen
builds its control (it wraps `CL11.build` by property). Any file can now be picked. **Nothing
unsafe gets through:** each import still reads what was picked, and refuses a file that is not
JSON ("not valid JSON") or not a character save ("not a character save"), as before. Both
refusals are checked.

**On the iPhone** a control with no filter may first offer Photo Library and Take Photo beside
Choose File(s). That is iOS's own menu; choose Files.

## Found alongside, recorded, not fixed here

- **An imported older save stays in the older layout until it is opened.** Import stores the
  file exactly as picked, and the list's Export JSON and Save As a copy copy that stored data.
  Measured with the owner's file: exported without opening it, the file is byte-for-byte the
  import (no format number, 15 top-level entries); opened on the sheet first, it exports in the
  current format 3 (16 entries). The sheet reads both. Recorded in the ledger for a ruling.
- **Export file names drop accented letters.** "Sairyū" exports as `Sairy_.l5r.json`: the name
  keeps only a to z, 0 to 9, hyphen and underscore. Recorded in the ledger.

## QA

Measured 25 September 2026, headless Chromium at 390 × 844, `NODE_PATH=/opt/node22/lib/node_modules`.

| Measure | Result |
|---|---|
| Own suite | **10/10** (`qa/import-filter-harness.js`): no filter on either control, still none after the Characters screen reopens; an older `.l5r` save with no format number imports from the Characters screen and loads from the toolbar; a non-JSON file and a JSON file that is not a character are both refused with the list unchanged |
| Own suite on the pre-fix build | **6/10**: fails exactly the four filter checks. The imports themselves always worked once a file reached them |
| Combined | **2,435/2,435**: 2,425 retained + 10 new (`qa/current-suite-runner.js`) |
| Build | **3,062,010 bytes**, SHA-256 `738c7ccfa3bdf67a6ca160371508fe22521cac845b883119b95a5a4e9490958a` |
| Surgical removal | **Byte-identical** to `480e1a15…` (3,060,080 bytes, commit `d07b03f`) |
| Removal order | Phase 11's remover refuses while this fix is present (it references `CL11`) |
| Remover fixtures | **15/15**; every earlier Part K stage's and the Kitsune [Mantis] fix's fixtures 15/15 and 10/10 with this fix listed as a later stage |
| Ownership | `qa/feature-dependencies.py` exits 0 |

**Variants** (`qa/verify-variants.py`, all fail where expected): fix removed 6/10 and switch off
6/10, both failing the four filter checks; the Characters screen's control not lifted after its
build 8/10, failing only its two checks.

**One line no check can see:** the load-time lift of the toolbar control. Removing it changes
nothing here (10/10, measured), because Phase 11 builds its Characters screen at startup and the
wrapper then lifts both controls. It is kept for a build without that screen.

## Not verified

- **The iPhone picker itself.** A headless browser hands any file to the control whatever its
  filter says, so the check reads the `accept` attribute iOS reads. The owner's device check is
  to pick `Sairyu_.l5r` without renaming it.
