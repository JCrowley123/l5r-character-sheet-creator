# Remove Phase 14 Search

This release owns two scripts, one stylesheet, their three manifest entries and one guarded seam block.
Removing it returns the Characters screen's Search tab to Phase 11's placeholder ("Search arrives in Phase 14.")
and the header's More menu to Save As a copy, Print and Export JSON. Nothing is saved by Search, so no character
data changes either way.

## Surgical removal (the method)

1. Copy the Phase 0 folder to a separate scratch directory (never the live tree; the remover refuses it, its
   parents and its children).
2. From this folder: `python -B qa/remove-phase.py <absolute-scratch-folder> --dry-run`, and read the plan.
3. Run it without `--dry-run`, rebuild that copy with its own `build/recombine.py --verify`, and run the retained
   suites against the rebuilt HTML (`PART I — Phase 4.5.32 Damage, Sessions and XP/qa/current-suite-runner.js`).
4. Apply the same removal to the working branch, delete this folder, and remove this release's entry from
   `QA — Removal Chain Registry/removal_chain.py`.

The remover deletes only `src/sheet/209.99999991-feat-search-index.js`, `src/sheet/209.99999992-feat-search-page.js`,
`src/css/59.99996-feat-search.css`, their manifest entries and the `search-seam` block in `210-test-seam-and-init.js`,
and repins the manifest's `expect_sha256`. It preserves every surrounding byte and line ending, and refuses before
writing anything on foreign or malformed markers, a missing or duplicate block or manifest entry, unsafe or linked
paths, hard links into the live tree, and any leftover `SEARCH14`, `SEARCHPAGE14`, `SEARCH_ENABLED`,
`SEARCH_PAGE_ENABLED`, `s14…` id or `s14-` class in a retained source. A fixture proves Phase 4.5.32's script and
stylesheet are left byte-identical.

With nothing later present, `--expect-sha fe2873e6654e63947fef50a36ebf8f0c6cd611d887651225b78abf87916501dd` requires
the exact pre-release build: **3,680,503 bytes** (`main` at `fc87313`).

## Replacing only the page

The page layer (`209.99999992-feat-search-page.js` and `59.99996-feat-search.css`) calls the data layer only through
`SEARCH14.categories()`, `.query()`, `.get()` and `.normalise()`. To redesign the page, replace those two files and
their manifest entries; the seam block's second guard then exports nothing. The dependency harness's `PAGE-OFF`
variant proves the data layer answers in full with the page switched off, and the Search tab keeps Phase 11's
placeholder.

## Dependencies (declared, each measured by `qa/dependency-harness.js`)

- **On the Characters screen, Phase 11 (guarded):** the page mounts into its Search tab panel by wrapping
  `CL11.build`, and opens it with `CL11.open('search')`. Without Phase 11 the page cannot open; the data layer
  still answers.
- **On the header's More menu, Phase 12.8 (guarded):** wraps `MODES128.build` to put Search first in the menu,
  using its own class (`s14-menu-item`) so Phase 12.8's own checks of its items are unchanged. Without Phase
  12.8 there is no menu item; the Search tab still works.
- **On Advanced Schools, Phase 4.7; Ancestors, Phase 4.8; Clan prices, Feature 4.5.25 (guarded, each by its own
  switch):** without one, its category or the price line is absent and everything else is unchanged.
- **On the trunk (no declaration needed):** the catalogues (`SKILL_LIBRARY`, `ADV_LIBRARY`, `DISADV_LIBRARY`,
  `WEAPON_LIBRARY`, `ARROW_LIBRARY`, `KATA_LIBRARY`, `KIHO_LIBRARY`, `SPELL_LIBRARY`, `SCHOOL_LIBRARY`,
  `MINOR_CLAN_SCHOOL_LIBRARY`, `BROTHERHOOD_SCHOOL_LIBRARY`, `ALTERNATE_PATH_LIBRARY`, `FAMILY_LIBRARY`,
  `MINOR_CLAN_LIBRARY`) and `techniqueDescription`. Search only reads them.
- **The seam block also exports five trunk catalogues** (`KATA_LIBRARY`, `FAMILY_LIBRARY`, `MINOR_CLAN_LIBRARY`,
  `SCHOOL_LIBRARY`, `MINOR_CLAN_SCHOOL_LIBRARY`) that were not on the test seam, for this release's harness. No
  production code reads them from the seam.

## Cross-phase fixture corrections (declared)

Phase 11's `characters-harness.js`, check `CL-TABS`, expected the Search tab's placeholder. It gained a term that
applies only while `SEARCHPAGE14` is present: the tab then holds the Search page instead.

The removal chain registry gained one entry, at its end.
