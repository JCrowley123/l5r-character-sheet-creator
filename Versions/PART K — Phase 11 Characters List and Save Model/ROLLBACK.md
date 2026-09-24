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
