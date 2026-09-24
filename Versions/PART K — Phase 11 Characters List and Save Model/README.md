# PART K — Phase 11: Characters List and Save Model

The first stage of Phase 11, built 24 September 2026. Part K's first folder, so it sits flat at
`Versions/` with no wrapper.

A Characters screen in the D&D Beyond shape: every saved character in a list, a tap to open one,
a menu on each for Export JSON, Save As a copy and Delete, and Import JSON for the list. Around it,
autosave, and an Export JSON that uses the phone's share sheet.

**Scope, as approved on 24 September:** JSON export and import are in, through the share sheet on
a touch device and a download elsewhere. **Export to PDF moved out** to its own Phase 11.1. The
**creation wizard** is Phase 11's second stage, numbered 11.2 so it has its own removal marker.
Until it exists, "Create New Character" starts a blank character that is already saved. The
roadmap records all three.

## What the player gets

| | |
|---|---|
| **Characters button** | New, first in the toolbar. Opens the Characters screen |
| **At startup** | If any character is saved, the app opens on the Characters screen. With none saved it opens on the sheet as before, so a first visit is unchanged |
| **Each row** | The Clan mon as a portrait (the initial when there is no Clan), the name, School and Insight Rank, Family and Clan. The open character is marked "Open now". Newest first |
| **Tap a row** | Opens that character and closes the screen. If the sheet holds unsaved work, it asks first |
| **⋯ menu** | Export JSON · Save As a copy · Delete (asks first, and suggests exporting) |
| **Create New Character** | Starts a blank character, saved at once so autosave follows it |
| **Import JSON** | Always adds a **new** character; never replaces one. A save from a newer sheet is refused, as loading it would be |
| **Library, Search** | Placeholder tabs for Phases 13 and 14, as the roadmap asks |
| **‹ Sheet** | Back to the sheet |

**Autosave.** A character that has a save is written a moment (1.2 s) after the last change, and
only when what `collectData()` produces differs from what was last written. So a burst of typing
is one write, and an unchanged sheet is none. A fresh sheet is **not** autosaved until Save,
Save As or Create New Character gives it a save. That way, trying things out never fills the
list with unnamed entries. Any pending change is written before it could be lost: when the app
is hidden or closed, and before a load, New Blank or a toolbar import replaces the sheet. Manual
Save stays, and writes exactly what autosave would.

**Export JSON on the iPhone** opens the share sheet (Save to Files, AirDrop, Mail…) instead of a
download. The toolbar's own Export JSON button gets the same behaviour. On a desktop, or on a
device that cannot share files, it downloads as before. Cancelling the share sheet cancels the
export, and any other refusal falls back to the download.

## Decisions made while building

- **An overlay, not a second page.** The screen covers the sheet (z-index 700: above the floating
  buttons at 500, below every modal at 999 and up) rather than hiding it. Hiding the sheet would
  change every width the carousel measures.
- **The old toolbar stays.** The roadmap asks for the Load picker to be replaced. But ten
  retained harnesses drive `#charSelect` and `#btnLoad`, and Phase 12 rebuilds that chrome
  anyway. So the Characters button goes in front of it, and a load from anywhere closes the
  screen. **Measured:** all ten pass with the startup screen in place.
- **Save As from the list names the copy "… (copy)".** Save As from the sheet keeps the name, as
  it always has.
- **No change to the save format or storage keys.** This phase only adds ways to reach them.

## Found while building

- **The sheet writes save format 3, but `SHEET_SCHEMA_VERSION` still says 2.** Phase 4.5.2 raised
  the written format through its own `collectData` wrapper. The first cut of Import compared
  against the constant and refused every save this same build had written, as "newer". The
  harness caught it. Import now takes the supported format from what `collectData()` writes,
  which needs no knowledge of 4.5.2. `CL-IMPORT-CURRENT-FORMAT` pins both numbers.
- **A right-click restores a Void pip with no click event.** Autosave listens for `contextmenu`
  too; `CL-AUTOSAVE-PIP-RIGHT-CLICK` covers it.
- **New Blank forgets the character before resetting the sheet**, so a wrapper on the reset would
  be too late. The click is caught on its way in instead. A first-cut `resetToBaseline` wrapper
  turned out to be unreachable: every path to it had already written or forgotten the character.
  No check could fail without it, so it was removed rather than kept as decoration.
- **The carousel clones pages, IDs included.** A harness that "fills" `#f_name` through Playwright
  can fill the clone. The harness sets values on `document.getElementById()` instead.

## QA

Measured 24 September 2026, headless Chromium at 390 × 844, `NODE_PATH=/opt/node22/lib/node_modules`.
The oracle is storage itself (the trunk's own keys) compared with the trunk's own `collectData()`.

| Measure | Result |
|---|---|
| Own suite | **70/70** (`qa/characters-harness.js`): startup, rows, open, menu, copy, delete, import, autosave, every flush path, download and share-sheet export |
| Combined | **2,193/2,193**: 2,123 retained + 70 new; no retained harness changed (`qa/current-suite-runner.js`). Includes the ten harnesses that save, reload and load through the old picker |
| Build | **2,958,319 bytes**, SHA-256 `6043dabbde6d26f488124d1512be3866906039454cb850fafe1fc3ed53b76a09` |
| Surgical removal | **Byte-identical** to `864c5134126ad8977bc39f764598aeda680c4db964bbafb8a755b88c9e5d4a04` (2,928,189 bytes, commit `a2312e4`) on the first attempt; `manifest.json` and `210-test-seam-and-init.js` identical to that commit |
| Retained suites on the removed bytes | The removed build is byte-identical to `864c5134…`, which scored **2,123/2,123** earlier on 24 September (BUGFIX — Spell Slots Tab on Safari); not re-run on identical bytes |
| Remover fixtures | **15/15** (`qa/test-removal.py`), no skips |
| Ownership | `qa/feature-dependencies.py` exits 0: every reference to the phase's names is inside its own blocks |

**Each part is load-bearing** (`qa/verify-variants.py`, one edit per scratch copy):

| Variant | Own suite | Fails |
|---|---:|---|
| Previous build (phase removed) | 0 of 6 scenarios | every scenario: the sheet never has a Characters screen to wait for |
| Share switch off | 61/63 | `CL-ENABLED`, and the touch-export scenario stops at its first export, which downloads instead of sharing |
| No pending write before `applyData` | 67/68 | `CL-FLUSH-ON-TOOLBAR-IMPORT` only |
| No pending write before a load | 67/68 | `CL-FLUSH-ON-BLANK-LOAD` only |
| No pending write on New Blank | 67/68 | `CL-FLUSH-ON-NEW-BLANK` only |
| No write when the page is hidden | 67/68 | `CL-FLUSH-ON-HIDE` only |
| Autosave may write a deleted character back | 69/70 | `CL-WRITE-SKIPS-DELETED` only |
| Phase 9 (Part H) mon data absent | 69/70 | `CL-PORTRAIT-MON` only: rows fall back to the initial |
| Import limited to `SHEET_SCHEMA_VERSION` | 61/62 | the import scenario: its first import, a save this same build wrote, is refused as "newer" (the bug found while building) |
| Master switch off | 5 of 22 run | every autosave, flush and list check, and five scenarios stop at their first list action |
| Autosave switch off | 53/68 | the autosave and flush checks, `CL-ENABLED`, plus three that follow from them (the copy and the created character are never written, so reopening the created one finds no name) |
| No stylesheet | 66/68 | `CL-COVERS-VIEWPORT`, `CL-NO-SIDEWAYS-SCROLL` |

Rows showing 68 or fewer checks were measured before the last two checks (`CL-WRITE-SKIPS-DELETED`,
`CL-PORTRAIT-INITIAL`) were added, and are quoted as measured. The "deleted character" variant first
**passed everything**: every harness path forgets the character before deleting it, so the guard
never ran. It exists for a write already in flight when a delete lands, a real race with a slow
storage bridge, so `CL-WRITE-SKIPS-DELETED` now drives that write directly. Phase 9 has no remover
script, so its absence is simulated by switching the mon lookup off in this phase's own fragment.

## Device

- **List view confirmed on the owner's iPhone, 24 September 2026:** the empty state, then two
  saved characters (Hida Bushi, Asahina Shugenja) with their Crab and Crane mons, School and
  Insight Rank, Family and Clan, newest first. The Characters button sits first on the toolbar,
  and the tab row fits without wrapping in the real fonts. A long School name wraps "Insight
  Rank 1" onto a second line, which reads fine.

## Not verified

- **Not yet reported from the device:** opening a character by tap, autosave, Save As a copy,
  Delete, Export JSON through the real iOS share sheet (tested only with a stand-in for
  `navigator.share`), and Import JSON.
- **The Android app** has no Web Share and no Capacitor Share plugin, so Export JSON there falls
  back to a download the WebView may ignore. The same was true before this phase. Adding the
  plugin belongs to Phase 0.7's device validation, which a cloud session cannot build or test.
- **Autosave in Safari private browsing** writes to storage that Safari discards when the tab
  closes. That is Safari's rule, not this phase's; Export JSON is the way to keep a character.
