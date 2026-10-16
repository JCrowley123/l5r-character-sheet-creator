# Remove BUGFIX — Gift of the Lady per School and Imperial Histories Volumes

Set `GIFT_IH_FIX_ENABLED` (in `src/sheet/209.9999992-feat-missing-basic-schools.js`) to `false` and reload: Search shows
one Gift of the Lady record again, and the two Schools cite Imperial Histories without the volume. Saves are untouched.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999998-bugfix-gift-of-the-lady.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/209.9999992-feat-missing-basic-schools.js` | `imperial-histories-volumes` (holds the switch) |
| `src/sheet/209.99999991-feat-search-index.js` | `search-technique-own-text` and `search-technique-per-school` (their end lines hand ownership back to Search) |
| `src/sheet/210-test-seam-and-init.js` | `gift-ih-seam` |

Each block begins `// BUGFIX GIFTIH BEGIN <slug>` and ends `// END GIFTIH <slug>`.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 4b69c763dbf7ceaa02727be650e5da334aa83dda7ea8bd60dbc245e1c7129fd5`
   (Spell Names Match the Books, 3,907,003 bytes).
4. Rebuild with `build/recombine.py --verify` and run Spell Names' suite (5,430). Then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

The retained switch-guarded lines in the Search and 14.3b harnesses can stay: without this fix they apply the original
expectations.

## Dependencies

- **Phase 4.7.2 Missing Basic Schools:** the `imperial-histories-volumes` block, with the switch, sits in its
  fragment; remove this fix before 4.7.2.
- **BUGFIX — Technique Name Clashes:** supplies each School's own text (`TECHNAMES.BY_SCHOOL`). Without it Search still
  shows two records, both with the monk's text (the sheet then shows that text too).
- **Search, Phase 14:** needed for the Search part only; the volumes stand alone. **Phase 14.3b** supplies the monk's
  page; without it that record has none.
