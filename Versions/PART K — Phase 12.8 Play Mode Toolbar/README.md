# PART K — Phase 12.8: the old toolbar replaced

The old toolbar row (picker, Load, Save, Save As New, New Blank, Delete, Print, Export JSON, Import
JSON) is gone from the screen. The sheet's header now has one row under the character's name:
**Characters**, **Save**, **⋯** and **Manage/Done**, beside the seal.

Branch: `claude/phase-12-8-toolbar`. Built 30 September 2026 on the owner's instruction to start
12.8. **Awaiting the owner's device test; not merged.**

## What the owner chose (30 September 2026)

Phase 11's plan already said what replaces the toolbar: the Characters list is the way to open,
create, import, copy, export and delete characters; a manual Save stays; Save As is offered from the
list and from within Management. Two choices were the owner's:

- **Save + a ⋯ menu in the header.** Save is a button beside Manage/Done in both modes. The ⋯ menu
  holds **Save As a copy** (Management only), **Print** and **Export JSON** for this character.
- **New Blank is removed.** New characters come from Create New Character (the wizard) or Import.

| Old toolbar | Now |
|---|---|
| Picker + Load | Characters list (header **Characters**, or at start) |
| Save | Header **Save** (both modes) |
| Save As New | ⋯ → **Save As a copy** (Management only); also the list's per-character menu |
| New Blank | Removed; Create New Character or Import on the list |
| Delete | The list's per-character menu |
| Print / Export PDF | ⋯ → **Print** (PDF export is still Phase 11.1) |
| Export JSON | ⋯ → **Export JSON**; also the list's per-character menu |
| Import JSON | The list's **Import JSON** |

## How it works

`src/sheet/209.99996-feat-modes-toolbar.js` (`MODES128`, switch `MODES128_ENABLED`). The existing
buttons are **moved, not rebuilt**: Characters (`#cl11Toolbar`) and Save (`#btnSave`) into a header
group before Manage/Done; Save As, Print and Export JSON into the ⋯ menu, relabelled "Save As a
copy" and "Print". Their ids, listeners and every wrapper other parts put on them are unchanged, so
saving, copying, printing and exporting behave exactly as before; Phase 11's share-sheet export
applies to the menu's Export JSON too. The rest of the old row (picker, Load, New Blank, Delete,
the old Import) stays in the page, hidden, because code still reads it (the picker holds the open
character's id). Save As is registered with Phase 12's gate, so in Play it is inert as well as
hidden.

Phase 11 makes its Characters button during the sheet's start-up, so this part wraps
`CL11.addToolbarButton` by property and builds the header once that button exists. Without the
Characters list there would be no way to open a character, so then it installs nothing.

`src/css/59.9996-feat-modes-toolbar.css`, active only under `body.pm128-enabled` (set once the
buttons have moved): hides the old row, keeps the status line as a plain line, styles the header
group and the menu. On a phone the name takes its own line and the action row sits under it.

**Found while building, and fixed:**
- The first menu sat inside the header, which clips what overflows it: only its first item showed.
  It now lives at the end of `<body>` and is placed under ⋯ when it opens.
- On a phone the header wrapped differently with the name's length: a short name left room for
  some buttons beside it and pushed Manage and the seal to a third line. The name now always takes
  its own line. Caught by a check added for Play's longer "Manage" label.
- Typing into the name box in a test does nothing unless the Identity page is the one shown (the
  carousel makes other pages inert). This part's harness goes there first. The same flaw meant
  Phase 12.7's `PM127-OPEN-LIST-OPEN-DATA` had compared two empty names; corrected (it now names
  the expected value) and still 55/55 with and without this part.

## Files

| File | Purpose |
|---|---|
| Phase 0 `src/sheet/209.99996-feat-modes-toolbar.js` | `MODES128` (`PART K PHASE 12.8`) |
| Phase 0 `src/css/59.9996-feat-modes-toolbar.css` | Header group, menu, old row hidden |
| Phase 0 `src/sheet/210-test-seam-and-init.js` | `modes-toolbar-seam` block |
| Phase 0 `build/manifest.json` | Two entries, new expected hash |
| `QA — Removal Chain Registry/removal_chain.py` | One entry at the end of `CHAIN` |
| Fourteen retained harnesses | Test-only corrections; see *Retained tests* and `ROLLBACK.md` |
| `qa/toolbar-harness.js` | 37 checks; `--absent` (old row untouched) and `--modes-off` expectations |
| `qa/verify-variants.py`, `qa/expected-failures.json` | Ten broken variants with pinned failures, four boundary builds |
| `qa/current-suite-runner.js` | Chains Phase 12.7's full runner and this harness |
| `qa/remove-phase.py`, `qa/test-removal.py` | Surgical remover and its adversarial tests |
| `originals/` | Verbatim copies of the fourteen retained harnesses before correction |
| `MANUAL-TESTS.md` | Owner's iPhone checklist |

## Retained tests

Measured with a prototype before this part's own tests were written: 2,749/2,785, with two suites
ending early. All from harnesses that pressed the old row's controls with real clicks, which need
them on screen; no product defect:

- Eleven Phase 4.5.13–4.5.24 harnesses chose the saved character in the old picker (their later
  failures in the same run were knock-on effects).
- Phase 11 checked the Characters button is first *in the old row*.
- The Dependant typing and Phase 12.7 harnesses clicked Save As, Load, Export or New Blank.

Each was corrected test-only, with the reason in a comment at the change; originals are in
`originals/`. The picker is set by script (nothing listens for its change event, so this is exactly
what choosing did, and these harnesses already press Load the same way); Save As and Export are
taken from the ⋯ menu when it exists; Phase 11's check looks in whichever toolbar the page has.
Every corrected harness passes in full **with this part and against `main` without it**.

## QA (30 September 2026, Windows desktop, Chromium via Playwright 1.63)

**Final combined run: 2,954/2,954, zero failed suites** (2,917 retained + 37 new), with
`qa/current-suite-runner.js` on the build below. **The same corrected retained suites against `main`
without this part: 2,917/2,917.** The pinned variants of the three retained folders whose own tests
were corrected (BUGFIX — Dependant Inline Typing, Phase 12.7, Phase 11) all still match exactly.
Two representative Phase 4.5.x folders were also rerun (4.5.14, 4.5.18): their older variant
scripts still see every mutation fail. They also report two historical failures, "structural
invariants changed" and "removal is not byte-identical to the restore point", because they compare
against a 4.5.x-era restore point that every later phase has moved on from; for 4.5.18 the result,
failures and per-variant counts included, is identical on `main` without this part (measured).

| Build | Bytes | SHA-256 |
|---|---:|---|
| This part (branch) | 3,117,804 | `23df67a7cd16b86802cc22967ea5af5fe586fdaccfa504ac79a7b28067734896` |
| `main` before it (`6db6ead`) | 3,109,466 | `47fdb778d72b6febe3a4767a80a94cf1e308eaa25f9316d1cabdd195fc6c6d83` |

`build.py --check-drift`: identical to the Phase 0 build. `qa/inventory.py` against `main`: 270
element IDs, all unique, every other count unchanged (the new header elements are made at run time).

**This part's harness: 37/37** on the final build. Oracles are visibility and geometry,
`localStorage`, the downloaded file, a counted `window.print()` and the Characters list's own
`isOpen()`, never `MODES128`. **The pre-part build (`main`) gives 9/37** with the normal
expectations, and **7/7 with `--absent`**.

| Scenario | Checks | What it drives |
|---|---:|---|
| Row | 7 | Old row hidden; all its ids still in the page; header order; in view; one row at 390 px; New Blank gone |
| Save | 5 | Save creates a stored character and shows "Saved"; saving again updates the same one |
| Menu | 12 | Closed, opens, items, every item fully visible and on top; Save As a copy makes a new, independent copy; closes on a choice, an outside tap and Escape (focus back on ⋯); Print calls the browser's print once |
| Play | 6 | Save shown; header still one row with "Manage"; menu has Print and Export only; a script click on Save As is stopped; Characters opens the list |
| Desktop | 4 | One row at 1280 px; Export JSON downloads this character; menu closes |
| Printed | 3 | Print media: header actions and menu not printed |

**Deliberate faults**, each built in a scratch copy, all failing with exactly the pinned assertions
in `qa/expected-failures.json` (discovered, then confirmed by a separate pinned run):

| Variant | Result |
|---|---:|
| Part removed (rebuild SHA checked equal to the pre-part build) | 9/37 |
| Master switch off | 9/37 |
| Menu left inside the header (clipped) | 36/37 |
| Save As not a Management action | 35/37 |
| Menu stays open after a choice | 36/37 |
| No close on an outside tap | 36/37 |
| No close on Escape | 34/37 |
| Old row still shown | 35/37 |
| No phone sizing | 36/37 |
| Header actions printed | 36/37 |

**Boundaries**, all fully green: this part removed, its switch off, and the Characters list switched
off (7/7 each with `--absent`); Phase 12's switch off (37/37 with `--modes-off`).

**Removal:** `qa/test-removal.py` **24 tests, 23 passed, 1 skipped** (Windows symlinks); the
live-tree test rebuilds exactly the pre-part `main`. Registry `qa/test-chain.py` passes.
`qa/feature-dependencies.py … "PART K PHASE 12.8" --also` its ids and classes: every reference is
inside a block this part owns.

**Not tested here:** Safari, a real print dialog and the iPhone share sheet (only Chromium is
installed; print is counted, not opened). See `MANUAL-TESTS.md`.

### Regression matrix

| Area | Risk | Validation |
|---|---|---|
| Saving, copying, exporting, printing | High | Save, Menu and Desktop scenarios; the moved buttons keep their own handlers; full retained suite |
| Opening and switching characters | High | Characters button; retained Phase 11 and 4.5.x persistence suites |
| Save As only in Management | High | Play scenario; variant |
| Menu usability | Medium | Reachability, close paths, focus; five variants |
| Phone header layout | Medium | One-row checks in both modes, short and long names; variant |
| Printing | Low | Printed scenario; variant |
| Removal and switch-off | High | Byte-identical rebuild, four boundaries, removal chain, ownership scan |
