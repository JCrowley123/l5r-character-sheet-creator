# Remove Phase 14.3a Skill, Weapon and Spell References

Set `SEARCH_REFERENCES_143_ENABLED` to `false` and reload to hide these citations. Nothing is stored, so no saved data
changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999998-feat-skill-weapon-spell-references.js` | whole fragment and its `build/manifest.json` entry |
| `src/sheet/209.99999991-feat-search-index.js` | `search-skill-source`, `search-spell-source`, `search-weapon-source`, `search-arrow-source` |
| `src/sheet/210-test-seam-and-init.js` | `search-references-143-seam` |

Each block begins `// PART K PHASE 14.3.1 BEGIN <slug>` and ends `// END SEARCHREF143 <slug>`. The four index end lines
also carry ` // PART K PHASE 14 (continued)`, which returns ownership to Search; it is part of the end line and goes
with it.

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove later releases first, newest first (`QA — Removal Chain Registry/removal_chain.py`).
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 98c8af4c071d8d1210e6d60b2f5626e6900edf6c2c3a86d5ee5135e22411083c`
   (Printed Weapon Text, 3,805,444 bytes).
4. Rebuild with `build/recombine.py --verify` and run Layer 2's suite (5,161). Then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

Phase 14's test-only oracle switch can stay: with this release absent it applies the original expectations.

## Dependencies

- **Search, Phase 14 (Part K):** required to display and search the citations; declared in Search's `ROLLBACK.md`.
  Remove this release before Search.
- **Phase 14.2:** independent; both releases' blocks sit in the same index file, each with its own markers.
- **Facets, Skill Traits:** no dependency.
- **Depended on by BUGFIX — Spell Names Match the Books (15 October 2026):** its Search fragment calls
  `SEARCHREF143.source('spells', …)` for a renamed Spell's page, so this release's remover refuses while it is present.
  Remove it first (its own `ROLLBACK.md`).

## Ownership scan

`qa/feature-dependencies.py` exits 1 for the four index END lines: each contains `SEARCHREF143` and then hands
ownership back to Search, so the scanner attributes it to Phase 14. They are comment-only and are deleted with the
blocks. See `qa/ownership.log`.
