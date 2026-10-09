# Remove or replace Phase 14.1 Search Facets

This release owns two scripts (the facet logic and the facet page), one stylesheet, their three manifest entries and one
guarded seam block. Removing it returns Search to Phase 14's page exactly: no filters, every category A to Z. Nothing is
saved by it, so no character data changes either way.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it, its parents
   and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with `build/recombine.py --verify`, and run the retained suites against
   the rebuilt HTML (`PART K — Phase 11.3 App Bar/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`. The test-only term below is inert without this release.

The remover deletes only `src/sheet/209.99999999-feat-search-facets.js`, `src/sheet/209.999999991-feat-search-facet-page.js`,
`src/css/59.999984-feat-search-facets.css`, their manifest entries and the `search-facets-seam` block, and repins
`expect_sha256`; it refuses on any leftover `FACETS141`, `FACETPAGE141`, `SEARCH_FACETS_ENABLED`, `SEARCH_FACET_PAGE_ENABLED`,
`s141…` id or data attribute, or `s141-` class in a retained source. With nothing later present,
`--expect-sha c951c9a3baf87ef115ae69dc657e11a7f52d66916edcde2c0369f711e99f6a3f` requires the exact pre-release build:
**3,761,482 bytes** (`main` at `d642dcc`).

## Replacing only the page

The page (`209.999999991-feat-search-facet-page.js` and the stylesheet) calls the logic only through `FACETS141.has()`
and `FACETS141.query()`. A different design (chips, a filter sheet, a side panel) replaces those two files; the seam
block's second guard then exports nothing. The dependency harness's `FACET-PAGE-OFF` variant proves the logic answers
in full with the page switched off, and Search is Phase 14's page exactly.

## Dependencies (declared, each measured by `qa/dependency-harness.js`)

- **On Search, Phase 14 (Part K), required:** the logic reads `SEARCH14.query()`, `.get()` and `.normalise()`, and wraps
  `SEARCH14.invalidate` and `SEARCH14.registerSource` to drop its own cache (each keeps the previous binding). The page
  wraps `SEARCHPAGE14.mount` (the filter row goes under the category title), `SEARCHPAGE14.render` (the filters and, while
  they apply, the list) and `SEARCHPAGE14.open` (open with options clears the filters; open alone keeps them), reads
  `SEARCHPAGE14.state()`, and draws its list with Phase 14's row classes (`s14-row`, `s14-name`, `s14-meta`, `s14-source`)
  into Phase 14's list, count and Show more (`data-s14`). Without Phase 14's page there are no filters and the logic
  answers (`SEARCH-PAGE-OFF`); without Search neither answers (`SEARCH-OFF`). **Removing Phase 14 therefore means removing
  this release first**: Phase 14's remover refuses while these files name `SEARCH14` or `SEARCHPAGE14`, and the removal
  chain removes newest first.
- **On the Characters screen, Phase 11 (through Phase 14):** without it Search's page cannot open; the logic answers
  (`CHARACTERS-OFF`).
- **On the app bar, Phase 11.3:** none in code. With the bar, the bar's Search returns to the filtered list; without it,
  ⋯ → Search does (`APP-BAR-OFF`).
- **On the trunk (no declaration needed):** none directly; the catalogues are read through Search's records.

## Cross-phase fixture corrections (declared, test-only)

- Phase 14's `search-harness.js`, check `S14-CATEGORY-PAGE`, expected Spells A to Z. It gained a term that applies only
  while `FACETPAGE141` is present: its own oracle then sorts the Spells catalogue by Element (Air, Earth, Fire, Water,
  Void, then others), then Mastery, then A to Z. 62/62 on this build and on `main`'s.

The removal chain registry gained one entry, at its end.
