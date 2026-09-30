# PART J — Phase 7, Save Format and Migration (first release)

Approved by the owner on 30 September 2026, with four rulings taken as recommended:
- older saves are **converted on Import**;
- stored characters are **not rewritten in bulk**; each is upgraded when next opened, copied or
  exported;
- the **audit log is later**, outside this release;
- **accented file names** ride along, per the owner's 25 September ruling ("with the next change
  to export").

## What was wrong

- **Several places set the format number.** The trunk's `SHEET_SCHEMA_VERSION` says **2**. Phase
  4.5.2 (Part I) writes **3** through its own `collectData` wrapper and migrates on load through
  its own `applyData` wrapper. Phase 11's Import has to ask `collectData()` what is really written.
  The next release to need format 4 would have added a third wrapper around those two.
- **An imported older save kept its older layout until it was opened.** Import stored the file as
  picked, and the list's Export JSON and Save As a copy copied that stored data. Ledger finding,
  25 September.
- **Export names dropped accented letters.** "Sairyū" exported as `Sairy_.l5r.json`.

## What this release does

**One chain of registered format steps.** `VersionManager` (fragment
`209.99997-feat-save-format.js`) holds one step per format change:
- **1 → 2** is Kiho (Feature 1, Part E). It only added fields, so the step changes nothing.
- **2 → 3** is Phase 4.5.2's own `D45.migrate`, reused unedited, and registered only while 4.5.2 is
  installed.

The current format is the end of the chain: **3** today, **2** without 4.5.2. Then:

| Path | Before | Now |
|---|---|---|
| Save, autosave, Save As | stamped 3 by 4.5.2 | stamped `VersionManager.current()`; bytes unchanged today |
| Import of an older save | stored as picked | stored in the current format (a wrapper on `storageSet()` for character records) |
| Save As a copy of a never-opened older import | copied as stored | the copy is in the current format; the original is left alone |
| Export JSON, including the list's export of a never-opened character | as stored | in the current format (a wrapper on `exportJSON()`) |
| Load of an older save | 4.5.2 migrated it | carried up the chain first, then handed to the layers below at the newest format *they* accept |
| A save that is current, newer, or has a malformed version | — | passed through **untouched**: the existing refusals and messages apply exactly as before |
| Export file name | ASCII only | letters and digits of any script kept (NFC), anything else `_` as before |

**`SHEET_SCHEMA_VERSION` is deliberately NOT raised.** It is what the trunk *alone* understands.
With 4.5.2 removed, a trunk that accepted format 3 would load a format-3 save and silently drop its
Advantage configurations: the very failure the trunk's refusal exists for. This corrects the 30
September kickoff, which proposed "fixing" it.

**A later format change** registers one step with `VersionManager.register(3, name, fn)` and
handles its own fields. Stamping, Import, Export, copies and the load gate then follow the chain
with no new wrapper. The harness proves this with a test-only step 3 → 4.

**A correction to what I proposed.** The acceptance plan said a never-opened save exported from the
list would give "the same result as opening then saving". It does not, byte for byte. Opening and
saving writes every field the sheet knows, including empty ones, while a conversion changes only
what the format steps change. The honest test, used here, is how each save **reads**: the original
and the converted save are both loaded through the layers below this release, and must give the
same sheet.

## Scope

- **One fragment:** `209.99997-feat-save-format.js`.
- **One trunk block:** `save-format-download` in `120-persistence.js`, 3 lines that let the trunk's
  download use this release's file name.
- **One seam block:** `save-format-seam` in `210-test-seam-and-init.js`.
- **One manifest entry.**
- **One entry in the shared removal chain.**
- **Consumer notes** in Phase 11's and Phase 4.5.2's ROLLBACK. Verbatim originals of every earlier
  file edited are in `originals/`.

Not changed: no rules, no save field's meaning, no markup, CSS, modes or registry seat, and not
4.5.2's migration.

**Non-goals:**
- the audit log (owner: later);
- PDF export (Phase 11.1);
- the Android save and share path;
- the parked "Manage as a separate screen" and "Print on the Characters list" ideas, which this
  does not touch;
- rewriting stored saves in bulk.

## Evidence

Measured on 30 September 2026 against the frozen candidate.

| Check | Result |
|---|---|
| Full suite (`qa/current-suite-runner.js`) | **2,999/2,999**: 2,954 retained plus 45 new. No retained harness needed a correction |
| New harness (`qa/save-format-harness.js`) on this build | **45/45** |
| The same harness on today's `main` | **24/45**: it fails where this release changes behaviour |
| `--absent` expectations on `main` | **38/38** |
| Sensitivity (`qa/verify-variants.py`) | **12 of 12** deliberately broken builds fail exactly as pinned in `qa/expected-failures.json` |
| Boundaries (`qa/verify-variants.py`) | all green: part removed **38/38** and switch off **38/38** (`--absent`); Phase 4.5.2 off **45/45** (`--no-d45`); Characters list off **10/10** (`--no-list`) |
| Removal (`qa/test-removal.py`) | 20 tests, 19 pass, 1 symlink skip; live removal **byte-identical** to `main`: `23df67a7…`, 3,117,804 bytes |
| Shared removal chain (`QA — Removal Chain Registry/qa/test-chain.py`) | **11/11** with this release registered |
| `qa/feature-dependencies.py` | exit 0: every reference to `VersionManager`, `SAVE_FORMAT_ENABLED` and `saveFormatDownload` sits inside this release's blocks |
| Build | 3,128,232 bytes, SHA-256 `2e65b361aac71649c137b4f22fc37de7c5a77826ea43eb5f889a49fa47fe4763` |

**What each broken build removes, and which checks catch it:**

| Broken build | Checks that fail |
|---|---|
| Import and copy not converted | 7: the stored format of every import, the converted configurations, the list's copy, the registry import |
| Export not converted | 2: the list's export and the share sheet |
| Names lose accents again | 4: every accented name |
| No NFC normalisation | 1: the decomposed-accent name |
| Phase 4.5.2's step skipped | 2: the configurations, and the format-2 "same sheet" check |
| Newer saves treated as older | 3: a newer save is loaded instead of refused |
| No stamp from the chain | 2: the registry's stamp and reloading its own save |
| Load not handed the inner format | 2: loading after a later format is registered |
| Share-sheet name not fixed | 1 |
| Trunk download left to the trunk | 3: every desktop download name |

**Found while testing, and handled:**
- The first known-reference expectation in the harness crashed its own reporter on an `undefined`
  value; the reporter was fixed.
- With Phase 4.5.2 switched off, a save with a malformed version number loads. The trunk alone
  reads it as format 1; 4.5.2 is what refuses it. This release passes malformed saves through
  untouched, so the harness now expects the trunk's reading in that boundary. This is existing
  behaviour, not changed here.

**How the harness decides:**
- **Stored and downloaded content** comes from `localStorage` and from the downloaded or shared file
  and its name.
- **"Same sheet"** loads both saves with `VersionManager.bypass` set, which switches off this
  release's load wrapper, and compares `collectData()`. The judge is the reader that existed before
  this release, not this release's own code.
- **Fixtures:** the owner's three real older saves (`qa/fixtures/`, copied from `Characters/`, all
  format 1, one of them "Sairyū"), plus saves generated at run time: a format-2 save with two
  old-style configurations, current, newer and malformed versions.

## Device

See `MANUAL-TESTS.md`, about five minutes on the iPhone.

## Usage

Claude Pro, 30 September:

| Reading | Weekly | 5-hour window |
|---|---|---|
| Before the sourcebook index | 17% | 45% |
| After the index, before this release | 19% | 57% |
| After this release | recorded in the ledger | recorded in the ledger |

These are readings, not a precise cost of this release.
