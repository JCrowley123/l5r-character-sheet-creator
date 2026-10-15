# Remove BUGFIX — Spell Names Match the Books

Set `SPELL_NAMES_FIX_ENABLED` to `false` and reload: the two Spells take their former names again. Saves store the
name as text, so a Spell added under a new name keeps that name.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999997-bugfix-spell-names.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/040-lib-kata-kiho-spells.js` | `spell-former-names` |
| `src/sheet/090-table-rows-weapons.js` | `scroll-former-name` |
| `src/sheet/209.99999991-feat-search-index.js` | `search-spell-former-name` (its end line hands ownership back to Search) |
| `src/sheet/210-test-seam-and-init.js` | `spell-names-seam` |

Each block begins `// BUGFIX SPELLNAMES BEGIN <slug>` and ends `// END SPELLNAMES <slug>`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 51ed73efc321fb40ef9528b8d786ed3f713ad84aed2b332540e89c2b5f324339`
   (Phase 9.1, 3,903,365 bytes).
4. Rebuild with `build/recombine.py --verify` and run Phase 9.1's suite (5,402). Then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

The retained switch-guarded lines in the Search and 14.3a harnesses can stay: without this fix they apply the original
expectations.

## Dependencies

- **Phase 14.3a:** the fragment reads its citation under the former name; remove this fix before 14.3a.
- **Search, Phase 14:** needed only for the Search part. The renaming and the scroll check stand alone.
