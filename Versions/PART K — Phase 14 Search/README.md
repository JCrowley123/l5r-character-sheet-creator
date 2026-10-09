# Phase 14 Search — first release (Part K)

Approved 9 October 2026 ("as recommended"), with the owner's requirements for this feature: the search logic
isolated and UI-agnostic behind a clean interface, the page easy to replace, Search as its own page in the app's
tab layout, comments short and functional, integration points marked (`// UI hook:`).

## What it does

- **Search is the Characters screen's Search tab**, the place Phase 11 built for it (Characters · Library ·
  Search). The header's More menu (⋯) gains **Search** as its first item, in Play and in Manage, which opens that
  tab. The tab shows a search box and the catalogues as categories in five groups, with their counts.
- **Type-ahead** over every catalogue the sheet holds, 1,493 entries in 13 categories: Skills, Advantages,
  Disadvantages; Schools (Great Clan, Minor Clan and Brotherhood), Advanced Schools, Alternate Paths; School
  Techniques (Basic and Advanced), Kata, Kiho, Spells; Weapons and arrows; Clans & Families, Ancestors. Matching
  ignores case, accents and apostrophes, and needs every word typed. Order: exact name, name start, words that
  start a name word, words inside the name, words in the type or tags, then words anywhere in the entry; then
  A to Z.
- **A category is its own page**: "‹ All categories", the category's entries A to Z, a search box scoped to it,
  50 at a time with Show more.
- **A read-only detail** for every entry: its type and tags, the fields the catalogue holds (a School's Skills,
  Honor, outfit and its Techniques by Rank with their text; a spell's Element, Mastery and keywords; a weapon's
  Skill, damage and size; an Advantage's cost and Clan or School price), its text, and the **book and page where
  one is held**: Alternate Paths, Advanced Schools and their Techniques, Ancestors, the Phase 6 Technique texts,
  and the 139 Advantages and Disadvantages (pages from the Phase 4.5 sourcebook audit of 2 October 2026). Skills,
  weapons, kata, kiho, spells and most Schools have no page in the sheet yet: no page line is shown for them.
- The last search is kept while the app is open. Search never changes the character.

**Left for later:** per-category facets and the remaining page references (the second release), the Library link
(Phase 13), Items and Monsters (no catalogue), adding from results.

## Structure

| File | Role |
|---|---|
| `src/sheet/209.99999991-feat-search-index.js` | Data layer, `SEARCH14`: one source per catalogue, a normalised index built on first use, a ranked query, plain-data records. No DOM, no writes. |
| `src/sheet/209.99999992-feat-search-page.js` | Page, `SEARCHPAGE14`: renders `SEARCH14` into the Search tab; holds its own view state. |
| `src/css/59.99996-feat-search.css` | The page's styles; own classes (`s14-`) only. |
| `src/sheet/210-test-seam-and-init.js` | One guarded block, `search-seam`. |

**Data interface** (`SEARCH14`): `categories()` → `[{id, label, group, count}]`; `query({text, category, offset,
limit})` → `{total, offset, results:[{id, category, categoryLabel, name, type, tags, source}]}`; `get(id)` → a copy
of `{id, category, name, type, tags, source, fields:[{label, value}], text:[], sections:[{title, items:[{name, text,
note}]}]}`; `registerSource({id, label, group, read})` for a later catalogue (Items, Monsters, supplement entries);
`normalise(text)`; `invalidate()`. A source that throws contributes nothing.

**Page interface** (`SEARCHPAGE14`): `open({category, text})`, `mount(panel)`, `render()`, `state()`. Its two
integration points are marked `// UI hook:` in the code: the Search tab panel (wrapping `CL11.build`) and the
More menu (wrapping `MODES128.build`).

## Verification

- **Own harness, `qa/search-harness.js`: 61/61.** Oracles are the catalogues on the test seam, the audit's
  tables read from `AUDIT.md`, and the Characters screen, never `SEARCH14`'s own records. It checks every
  catalogue entry is found first by its own name in its category (1,493), every record's fields, text and page
  against its catalogue, pages only where held, no junk values, plain-data copies, the ranking and matching rules,
  the menu item in Play and Manage, typing, category pages, Show more, detail, Back with the scroll restored,
  Escape, state kept, the page at 320, 375 and 390 px with no sideways scroll, a 16px search box, a keystroke under
  50 ms at 4× CPU throttling, the character, autosave and sheet tab unchanged, and `registerSource`.
- **Dependency harness, `qa/dependency-harness.js`: 94/94**, eight variants: control; the page switched off (the
  data layer answers in full, the tab keeps Phase 11's placeholder); Search switched off; Advanced Schools,
  Ancestors and Clan prices each off (their category or line goes, nothing else); the More menu off (the tab
  still works); the Characters screen off (the page cannot open, the data layer answers).
- **22 pinned mutations** (`qa/variants.json`, `qa/expected-failures.json`): each breaks the harness on the
  checks it should, from the release removed or switched off to one spell missing, accents or apostrophes kept,
  any word matching, no ranking, an invented page, a wrong audit page, the live record returned, a throwing
  source, a write to the sheet, Escape closing everything, a dropped detail field, no Show more, the menu item
  missing, and a 14px search box.
- **Ownership scan** (`qa/feature-dependencies.py`) for both scripts with every id and class: every reference is
  inside a block this phase owns.
- **Removal:** the remover takes out the three files, their manifest entries and the seam block, and the rebuild
  is `main`'s build byte for byte (`fe2873e6…`, 3,680,503 bytes). Fixtures: 22 pass, one Windows symlink skip.
- **Retained harness corrected (test-only, declared):** Phase 11's `CL-TABS` (70/70 with the term).

Full-suite and live figures are recorded below once measured.
