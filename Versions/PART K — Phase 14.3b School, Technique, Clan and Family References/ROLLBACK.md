# Remove Phase 14.3b School, Technique, Clan and Family References

Set `SEARCH_REFERENCES_1432_ENABLED` to `false` and reload to hide these citations. Nothing is stored, so no saved data
changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.9999999995-feat-school-clan-references.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/209.99999991-feat-search-index.js` | `search-record-source` (in `build()`), `search-technique-source` (in `schoolTechniques()`) |
| `src/sheet/210-test-seam-and-init.js` | `search-references-1432-seam` |

Each block begins `// PART K PHASE 14.3.2 BEGIN <slug>` and ends `// END SCHOOLREF1432 <slug>`. The two index end lines
also carry ` // PART K PHASE 14 (continued)`, which returns ownership to Search; it is part of the end line and goes
with it.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 14711d4f0592c56fadb1222efd8dade606d0c38a782ca41dada04c7239076004`
   (BUGFIX — Printed Skills and Equipment Tables, 3,843,210 bytes).
4. Rebuild with `build/recombine.py --verify` and run that release's suite (5,294). Then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

Phase 14's test-only oracle switch can stay: with this release absent it applies the original expectations.

## Dependencies

- **Search, Phase 14 (Part K):** required to display and search the citations; declared in Search's `ROLLBACK.md`.
  Remove this release before Search.
- **Phases 14.2 and 14.3a:** independent; their blocks sit in the same index file, each with its own markers.
- **Facets:** no dependency.

## Ownership scan

`qa/feature-dependencies.py` exits 1 for the two index END lines: each contains `SCHOOLREF1432` and then hands
ownership back to Search, so the scanner attributes it to Phase 14. They are comment-only and are deleted with the
blocks. See `qa/ownership.log`.
