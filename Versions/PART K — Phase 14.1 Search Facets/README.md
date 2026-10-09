# Phase 14.1 Search Facets — Search's second release, part one (Part K)

Approved 9 October 2026 ("I approve", on the reassessment at 80% of the week), built from
`CLAUDE-SESSION-KICKOFF-SEARCH-FACETS-2026-10-09.md`. Built to the owner's rules for Search: the logic isolated and
UI-agnostic, the page replaceable, comments short and functional, integration points marked `// UI hook:`.

## What it does

- **Filters on each category page**, read from the data the catalogues already hold. Each category shows only its own:

  | Category | Filters |
  |---|---|
  | Skills | Trait ("Agility or Reflexes" counts as both); Type (High, Low, Bugei, Merchant, Weapon; "Weapon (Low)" is both) |
  | Advantages; Disadvantages | Type; Cost (Disadvantages: Value) |
  | Schools | Clan (a School in two Clans is under both). The catalogue holds no School kind (only a shugenja flag on 21), so there is no kind filter |
  | Advanced Schools | Clan; Type |
  | Alternate Paths | Technique Rank |
  | School Techniques | School; Rank. Both must hold for the same School (The Gift of the Lady is Doji Courtier Rank 5 and a monk order's Rank 1) |
  | Kata | Ring; Mastery |
  | Kiho | Ring; Mastery; Type (Internal, Kharmic, Martial, Mystical) |
  | Spells | Element; Mastery; Maho (Maho, Not maho) |
  | Weapons | Skill; Type (Weapon, Arrow) |
  | Clans & Families | Clan |
  | Ancestors | Clan; Cost |

- **Dropdowns, not chips** (the kickoff allowed either, decided by measuring): at 390px Kiho's 15 chips would take about
  250px; the dropdowns take 96px (two rows), each 44px tall with a 16px font (no iPhone zoom). Each option shows its count,
  and the counts follow the other filters and the typed text (Fire chosen: "Mastery 3 (8)"). Options that would leave
  nothing are greyed. "Clear filters" appears while any is on.
- **Spells grouped by Element, then Mastery, then A to Z** (FT-15) while browsing: headings Air, Mastery 1 … then Earth,
  Fire, Water, Void, Universal. Typed text keeps Search's ranking (an exact name first), without headings.
- Typing narrows live within the filtered set; Show more pages the filtered list. Within a filter any value matches (the
  interface takes several); across filters every one must.
- **Where the filters live:** on a category page only (not on the home page or across all categories). Opening an entry
  and coming back, leaving Search and returning (the app bar's Search, or ⋯ → Search without the bar), keep them (S11).
  Leaving the category, or `SEARCHPAGE14.open()` with options, clears them.

**Not in this release:** page references (book reading), the Library link (Phase 13), Items and Monsters, adding from
results, fuller descriptions (FT-16).

## Structure

| File | Role |
|---|---|
| `src/sheet/209.99999999-feat-search-facets.js` | Logic, `FACETS141`: each category's facet definitions over `SEARCH14`'s records, a filtered query with counts and grouping. No DOM, no writes. |
| `src/sheet/209.999999991-feat-search-facet-page.js` | Page, `FACETPAGE141`: the filter row and the group headings on Search's page; holds the open category's filters. |
| `src/css/59.999984-feat-search-facets.css` | The page's styles; own classes (`s141-`) only. |
| `src/sheet/210-test-seam-and-init.js` | One guarded block, `search-facets-seam`. |

**Logic interface** (`FACETS141`): `has(category)`; `facets(category)` → `[{id, label, options:[{value, label, count,
selected}]}]`; `query({text, category, filters, offset, limit})` → `SEARCH14.query`'s shape plus `facets`, `filters` (those
applied) and `grouped` (each result then carries `group: [labels]`); `invalidate()`. `filters` is `{facetId: [values]}` or a
single value per facet. Without a category, or for a category without facets, it is `SEARCH14.query` unchanged.

**Page interface** (`FACETPAGE141`): `filters()`, `set(facetId, value)`, `clear()`. Its three hooks into Phase 14's page are
marked `// UI hook:`: `SEARCHPAGE14.mount` (the row under the category title), `.render` (the filters and, while they apply,
the list) and `.open` (with options, a fresh start). Phase 14's files are not edited.

## Verification

- **Own harness, `qa/facets-harness.js`: 44/44.** Oracles: the catalogues on the test seam (every facet value and count is
  read from them in the harness, never from `FACETS141`'s records), `SEARCH14`'s ranking for typed text, the Characters
  screen and geometry. It checks the facet sets per category against the approved table; the five Techniques sub-types'
  own facets; every option (334) and its count against the catalogues; every option alone filtering to exactly the
  catalogue's entries; two filters together with every count following; any value within a filter; a Technique's School and
  Rank holding together; the Spells order; typed text within filters; no category; unknown filters; paging; plain data; and
  on the page at 390px: no filters on the home page or across categories, the Spells headings, option texts, filtering, a
  focused dropdown keeping focus, typing (the field keeps focus), two filters, the detail and Back, leaving and returning
  (filters, list and scroll), leaving the category, `open()` with options, Show more, Clear, each category's own dropdowns,
  44px and 16px, no sideways scroll at 320, 375 and 390px (a monk order's long name included), the app bar never covered, a
  keystroke under 50 ms at 4× CPU throttling, and the character, autosave, storage and sheet tab unchanged.
  **On `main`'s build (`c951c9a3…`): 1/4**, every section failing.
- **Dependency harness, `qa/dependency-harness.js`: 14/14**, seven variants: control; the page off (the logic answers;
  Search is Phase 14's exactly: no filters, Spells A to Z, its functions unwrapped); the logic off (the same); Search's page
  off; Search off; the app bar off (the filters work and ⋯ → Search returns to them); the Characters screen off.
- **16 pinned mutations and one boundary** (`qa/variants.json`, `qa/expected-failures.json`), run with `--jobs 1`, all as
  expected: the release removed, either module or the stylesheet off, counts including their own filter, a Technique's
  School and Rank from different Schools, Spells not grouped, grouping while typing, "Weapon (Low)" as one kind, a write to
  storage, filters kept across categories, `open()` forgetting them, the row rebuilt on every render (focus lost), no
  headings, filters on the home page, 14px dropdowns. Boundary: the app bar at the bottom passes 44/44.
- **Ownership scan** (`qa/feature-dependencies.py`) for both scripts with every id, class and data attribute: exit 0, every
  reference inside a block this release owns.
- **Removal:** the remover takes out the three files, their manifest entries and the seam block; the rebuild is `main`'s
  build byte for byte (`c951c9a3…`, 3,761,482 bytes). Fixtures: 22 pass, one Windows symlink skip.
- **Retained harness corrected (test-only, declared):** Phase 14's `S14-CATEGORY-PAGE` (62/62 with the term, on this build
  and on `main`'s).

## Full QA (9 October 2026)

- **Full suite: 4,970/4,970** on the final build (`b7e1fc2d…`, 3,780,098 bytes): 4,912 retained + this release's 44 and 14.
  Runner: `qa/current-suite-runner.js` (chained off Phase 11.3's). Log: `qa/full-suite.log`.
- **Removal, byte for byte with its retained suite** (`qa/final-qa.py`, `qa/final-qa-summary.json`): 14.1 out →
  `c951c9a3…` (3,761,482 bytes, `main`), 4,912/4,912.
- **Checklist walk** (`qa/checklist-walk.js`) on the local build: 14/14.
