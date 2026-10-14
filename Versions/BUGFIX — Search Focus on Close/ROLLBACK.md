# Remove BUGFIX — Search Focus on Close

Set `SEARCH_FOCUS_FIX_ENABLED` to `false` and reload to switch the fix off. Search then behaves as before: closing
an entry leaves focus nowhere. Nothing is stored, so no saved data changes.

## Surgical removal

| Location | Owned item |
|---|---|
| `src/sheet/209.999999996-bugfix-search-focus.js` | whole fragment and its one `build/manifest.json` entry |
| `src/sheet/210-test-seam-and-init.js` | `search-focus-seam` block (`// BUGFIX SEARCHFOCUS BEGIN …` to `// END SEARCHFOCUS …`) |

1. Copy the Phase 0 folder to a scratch directory (the remover refuses the live tree).
2. Remove any later releases first, newest first: `QA — Removal Chain Registry/removal_chain.py` lists them.
3. `python -B qa/remove-phase.py <scratch> --dry-run`, inspect, then run it without `--dry-run`. With no later
   releases present, add `--expect-sha 7b68f34d746d8674cdd33e6815197f9c1ea8e6e131ab42c2e523a4f477d4929a`
   (`main` at `65fb705`, 3,800,283 bytes).
4. Rebuild with `build/recombine.py --verify`, run Phase 14.2's suite (5,107), then apply the same removal to the
   working branch, delete this release's entry from `CHAIN`, and delete this folder.

`qa/test-removal.py` performs steps 1–4's checks on scratch copies.

## Dependencies

- **Search page, Phase 14 (Part K):** required. The fix wraps the public `SEARCHPAGE14.render` and reads
  `SEARCHPAGE14.state()`; with Search's page off it installs nothing. Search's rollback should remove this release
  first; nothing in Search calls into it.
- **Search Facets, Phase 14.1:** no dependency. Facets wraps the same render; this fix is installed later, so it
  runs outermost and sees the final list. With facets off the fix still works (dependency harness).
- No other release calls `SEARCHFOCUS`.

## Ownership scan

`qa/feature-dependencies.py` exits 1 and lists the three seam lines as owned by "BUGFIX". Its marker pattern
recognises only `BUGFIX DEPTYPE` and bare `BUGFIX`, so every later BUGFIX name reads as "BUGFIX" (Skill Traits
had the same report). The block is this release's own: its BEGIN/END lines carry `BUGFIX SEARCHFOCUS`, and the
remover deletes exactly those lines. See `qa/ownership.log`.
