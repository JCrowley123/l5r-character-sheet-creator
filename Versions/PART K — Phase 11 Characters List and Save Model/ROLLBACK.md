# ROLLBACK — PART K Phase 11: Characters List and Save Model

## What it adds

All in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for
Maintainability/`:

- `src/sheet/209.993-feat-characters-list.js`: the whole phase. The Characters screen, autosave,
  the share-aware export, and four wrappers (`saveCharacter`, `loadCharacter`, `applyData`,
  `exportJSON`), each keeping the previous binding.
- `src/css/59.993-feat-characters-list.css`: the screen's own classes (`cl11-*`).
- Two manifest entries, one for each file above.
- Two delimited blocks in `src/sheet/210-test-seam-and-init.js`:
  - `// PART K PHASE 11 BEGIN characters-seam` … `// END CHARLIST11 characters-seam`: the guarded
    seam export.
  - `// PART K PHASE 11 BEGIN characters-init` … `// END CHARLIST11 characters-init`: the guarded
    `initCharactersList()` call at the end of `init()`.
- `expect_sha256` in `build/manifest.json`.

The save format, the storage keys and every existing toolbar control are unchanged, so saved
characters need nothing done to them in either direction.

## Remove it

On a scratch copy of the Phase 0 tree (the remover refuses the live tree):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability" /tmp/p0
python3 "Versions/PART K — Phase 11 Characters List and Save Model/qa/remove-phase.py" /tmp/p0
python3 /tmp/p0/build/recombine.py --verify
```

Measured: the result is byte-identical to `864c5134…` (2,928,189 bytes, commit `a2312e4`), and
`manifest.json` and `210-test-seam-and-init.js` match that commit exactly. Copy the tree back over
the live one, then delete this folder.

Or turn parts off without removing anything:

| Switch | Off means |
|---|---|
| `CHARACTERS_LIST_ENABLED` | No Characters button, no startup screen, no autosave, export downloads as before |
| `CHARACTERS_AUTOSAVE_ENABLED` | Only manual Save writes; the list still works |
| `CHARACTERS_SHARE_ENABLED` | Export JSON always downloads, even on a phone |

## Dependencies

- **Soft, on Phase 9 (Part H):** a row's portrait uses that phase's `CLAN_MON_DATA`. Guarded with
  `typeof`: without Phase 9, rows show the character's initial instead. Nothing else of Phase 9's
  is read. Phase 9 is not affected by this phase.
- **On the trunk:** `collectData`, `applyData`, `resetToBaseline`, `saveCharacter`,
  `loadCharacter`, `exportJSON`, `getIndex`, `setIndex`, `charKey`, `storageGet/Set/Delete`,
  `refreshCharSelect`, `appConfirm`, `appAlert`, `setStatus`, `currentId`.
- **Wraps none of the functions BUGFIX — Spell Slot Accounting wraps**, so that fix's wrappers
  stay outermost although this fragment is now after it in the build.
- **Save format 3.** Phase 4.5.2 raises the written format to 3 through its own `collectData`
  wrapper while `SHEET_SCHEMA_VERSION` stays 2. This phase reads the supported format from what
  `collectData()` writes, so it has no dependency on 4.5.2; `CL-IMPORT-CURRENT-FORMAT` pins it.
- No retained harness was changed.
- **Phase 11.2 (Creation Wizard) depends on this phase, hard.** It rebinds `CL11.createNew` to
  launch itself. Remove 11.2 first: this phase's remover refuses while 11.2's fragment is present
  (measured), and removing 11.2 then this phase reaches `864c5134…` exactly. 11.2 also made one
  check in this phase's harness conditional (the create check closes the wizard if present);
  70/70 with and without 11.2.

## QA files changed later (25 September)

Phase 11.2.3 found this phase's live removal fixture failing once a later Part K stage depended
on it: this phase's remover correctly refuses while one is present. `qa/test-removal.py` now
removes every later Part K stage first, newest first, each with its own remover, and passes
15/15. Its "phase removed" variant in `qa/verify-variants.py` does the same. Declared in 11.2.3's
ROLLBACK.

The Kitsune Shugenja [Mantis] bugfix (25 September) deleted one library line, which changes the
build under every stage, so the same live test also undoes that fix first, with the fix's own
remover (`LATER_FIXES`), and passes 15/15. Declared in that fix's ROLLBACK.

Phase 11.2.4 (25 September) added itself to this phase's `LATER_STAGES`, in `test-removal.py`
and `verify-variants.py`, so both remove it first; 15/15. Declared in 11.2.4's ROLLBACK.

The Import File Picker Filter bugfix (25 September) is listed first in this folder's `LATER_STAGES`, so the
live removal fixture removes it with its own remover before this one. Declared in that fix's ROLLBACK.

## Depended on by (added 25 September)

- **BUGFIX — Import File Picker Filter, soft.** It wraps `CL11.build` by property to lift the
  file filter from `#cl11ImportFile`. This phase's remover refuses while it is present (measured):
  remove the fix first.

## Later-release list moved to the shared registry (25 September 2026)

This folder's removal fixtures no longer keep their own `LATER_STAGES` / `LATER_FIXES` lists. They
read the one shared list in [QA — Removal Chain Registry](../QA%20%E2%80%94%20Removal%20Chain%20Registry/README.md)
and strip every release built after this one, newest first, each by its own remover. A new release
registers itself there once instead of being added here. **This folder's live removal fixture now
depends on that registry**; its ROLLBACK says how to restore the old lists (verbatim copies are in
its `originals/`). The removal method for this release itself is unchanged.

## Fixture changed by Phase 12, part 1 (25 September 2026)

`CL-COPY-INDEPENDENT` opens a copied character from the Characters list and edits its Notes box.
With PART K — Phase 12 Play and Management Modes present that open lands in Play, where Notes is a
Management field, so the check now switches to Management first, **only when `MODES12` exists**.
It reads 70/70 with Phase 12 present and removed (both measured). Declared in Phase 12's ROLLBACK.
