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

**Page interface** (`SEARCHPAGE14`): `open({category, text})`, `mount(panel)`, `render()`, `state()`. `open()` with
no options returns to where the reader was (since the device corrections below). Its three integration points are
marked `// UI hook:` in the code: the Search tab panel (wrapping `CL11.build`), the tab being shown again (wrapping
`CL11.showTab`) and the More menu (wrapping `MODES128.build`).

## Device corrections (10 October 2026: the owner's S9 and S11)

The owner's check of 9 October failed S9 (on the iPhone the Characters screen's top bar scrolled away on long Search
pages) and S11 (⋯ → Search lost the open entry). Approved "as recommended"; corrected in this release's own page
fragment, as Phase 4.5.28's device corrections were.

- **S11:** `open()` with no options keeps the whole view: the open entry, the category, the text, the list's length
  and the scroll of the list and of the entry. With options it behaves as before. The Search tab restores the same
  place when it is shown again from the Characters screen's own tabs.
- **S9, Search's side:** scroll save, restore and "to top" use the nearest ancestor that actually scrolls (the
  Characters screen today; its panel once `BUGFIX — Characters Screen Top Bar` makes the panel scroll), so Search
  works with that fix and without it. The search box is blurred before an entry opens, so the iPhone keyboard closes.
  The bar itself is the bugfix's.
- **Harness:** reads the element that really scrolls (from computed styles) instead of `#cl11View`;
  `S14-STATE-KEPT` now covers an open entry: ‹ Sheet, then ⋯ → Search, shows the same entry, and Back shows the same
  list at the same place; new `S14-KEYBOARD-CLOSES-FIRST` (the page blurs the field before the entry shows).
  **62/62** on the corrected build; **60/62** on `main` (`0fc26a3c…`), failing exactly those two. Two new pinned
  mutations: `open()` forgetting the open entry, and no blur.

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

## Full QA (9 October 2026, with Phases 4.5.33 and 4.5.34 on top)

- **Full suite: 4,816/4,816** on the final build (`0fc26a3c…`, 3,734,413 bytes): 4,706 retained + Search 61 + 4.5.33's
  38 + 4.5.34's 11. Runner: `PART I — Phase 4.5.34 Blind Armor TN Note/qa/current-suite-runner.js`.
- **Removals, each byte for byte with its retained suite:** 4.5.34 out → `20342532…` (4,805/4,805); then 4.5.33 out →
  `df80ee3c…` (4,767/4,767, this release's build); then Search out → `fe2873e6…`, `main` (4,706/4,706).
- **Pinned mutations confirmed:** 22 for Search (all as expected).
- A first full run failed on two things, both fixed before this run: Phase 4.5.33 had taken a new pre-roll registry
  seat (now Phase 4.5's adv-config seat, as every 4.5 release uses), and Phase 11.2.4's harness timed out loading
  its last pages (a test-only change below). Some suites also crashed when the machine ran short of resources.

## Live (9 October 2026)

Merged on the owner's word (fast-forward to `5b3543d`, 05:25 UTC) and deployed. The served page matches the
committed build plus its app head byte for byte (3,740,062 bytes, SHA-256 `10c4f41e…`), service worker
`5c409bd591fbc667`; focused checks on the downloaded page **110/110** (`qa/verify-live.py`: Search 61, 4.5.33 38,
4.5.34 11; `qa/live-verification.json`); the combined checklist walked through the real controls on the live site
**21/21** (`qa/checklist-walk.js`, `qa/live-checklist-walk.log`). The owner's checklist: [Search, Void and Initiative,
Blind's Note — Test Checklist](https://claude.ai/code/artifact/34899d86-5be2-49aa-9734-689569e3cb1f) (iPhone and Windows: Not run).
