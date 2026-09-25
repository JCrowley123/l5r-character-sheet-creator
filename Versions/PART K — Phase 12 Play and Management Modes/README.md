# PART K — Phase 12: Play and Management Modes (part 1)

Built 25 September 2026 on the Windows desktop. The first of Phase 12's parts, agreed with the owner
the same day: **one part per tab**, so each is small enough to test and merge on its own. This part
builds the machinery every later part uses, and locks the smallest tab, **Background**.

## What the player gets

- **A "Manage" / "Done" button** beside the character's name, at the top. In **Play** it reads
  *Manage*; in **Management** it reads *Done*.
- **In Play, the Background tab's four boxes** (Appearance, Personality, History, Notes) **show
  their text as plain text** and cannot be edited. Tap *Manage* to edit them; tap *Done* to go back.
- **Which mode a character opens in** (the owner's ruling): **Play** when opened from the Characters
  list or finished in the creation wizard; **Management** for a blank sheet, a load or an import
  through the old toolbar, and while the wizard runs.
- **Everything else still edits in both modes in this part.** Clan & School, Identity, Rings &
  Traits, Skills, Advantages & Disadvantages and Techniques are locked by the parts that follow.
  Spell Slots and Equipment work the same in both modes by design.

## How it works

| Piece | What |
|---|---|
| `src/sheet/209.9996-feat-play-management-modes.js` | `MODES12`: the mode, the toggle, the gate, the registry, the entry-point hooks. Kill switch `MODES12_ENABLED` |
| `src/css/59.997-feat-play-management-modes.css` | The toggle's look, and a locked field shown as plain text in Play |
| One delimited block in `210-test-seam-and-init.js` | Guarded seam export (`MODES12_ENABLED`, `MODES12`) |

- **The mode is never part of the character.** `collectData()` does not see it, so switching modes
  cannot change a save, and autosave sees no difference.
- **One capture-phase gate** on the document stops user events (typing, tapping, a script's
  `.click()` or dispatched event) on a registered Management-only control while in Play, before any
  of the sheet's own listeners run. **The sheet's own code writing a value** (a load, autosave, a
  Void spend) is not a user event and keeps working, per the owner's ruling. Locked text fields are
  also made read-only, and a lock records what it changed, so unlocking never touches a field the
  sheet made read-only itself.
- **A selector registry.** `MODES12.register(selector)`. Each later part registers its own tab's
  controls **from its own fragment**, so this part is never edited again. Rows built after the mode
  is set are locked as they appear.
- **Hooks reached by property, all guarded:** `CL11.openCharacter` and `CL11.createNew` (Phase 11,
  Part K), `CW112.finish` (Phase 11.2, Part K), and click listeners on the old toolbar's Load and New
  Blank and the Import file input. **No trunk file is edited.**

## QA

Measured on the Windows desktop, 25 September 2026.

| Check | Result |
|---|---|
| Own harness | **25/25**. Oracles are the page itself: what a real keystroke leaves in the field, whether a listener the harness attached runs, `collectData()`, the computed style |
| On the build without this part | Fails, as pinned for "part removed" |
| Combined suite | See the ledger: the first run read 2,495/2,496, and the one failure was the expected Phase 11 check below |
| Removal | **Byte-identical** to `0dcb56e8…` (3,072,896 bytes, commit `e66c4dd`) |
| Removal fixtures | **15 run, 14 pass, 1 skipped** (symlink test; Windows) |
| `feature-dependencies.py` | Exit 0: every reference is inside a block this part owns |
| Variants | **11 of 11 as pinned**: part removed, switch off, no gate, fields not locked, unlock touching the sheet's own read-only, no stylesheet, and each of the five entry-point hooks removed |

**Found while building, and fixed before shipping:**
- **An infinite loop.** The toggle's label change was itself a page change the new-row watcher saw,
  which refreshed the label, and so on; the page hung on the first tap. The harness caught it (the
  first tap timed out). The watcher now only locks new matches, and the label is only written when it
  changes.
- **A harness blind spot.** The New Blank check first assumed the mode the previous check left
  behind; with the Load hook broken it passed by accident. It now sets Play explicitly, and the Load
  and New Blank hooks each have their own variant.
- **Typing is stopped twice.** With either the read-only lock or the gate removed, the other still
  blocks typing. Each layer has its own check that fails without it.

## Cross-phase fixture correction (declared)

**Phase 11's `CL-COPY-INDEPENDENT`** opens a copied character from the Characters list (now Play)
and edits its Notes box. It now switches to Management first, **only when `MODES12` exists**, so it
reads 70/70 with this part present and removed (both measured). This is the correction the audit
predicted; it is declared in both phases' ROLLBACK.

## Not verified

- **Not tried on a real device.** Headless Chromium on Windows, fallback fonts. The toggle's place
  in the title bar was checked in a 375px screenshot only.
- The wizard's Finish was reached by calling `CW112.finish()`, the function the wizard's own last
  Next calls by property, not by walking every step.
- A cancelled "Create New Character" (the unsaved-sheet warning answered No) restores the previous
  mode by design; not driven by the harness.

## Files

| File | What |
|---|---|
| `qa/modes-harness.js` | The 25 checks |
| `qa/current-suite-runner.js` | Chains the Apply School fix's runner and adds this harness |
| `qa/remove-phase.py`, `qa/test-removal.py` | Surgical remover and its fixtures |
| `qa/verify-variants.py` | The 11 pinned variants |
| `ROLLBACK.md` | How to undo it |
