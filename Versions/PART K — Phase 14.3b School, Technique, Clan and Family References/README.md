# Phase 14.3b School, Technique, Clan and Family References (Part K)

Built 15 October 2026 (Cycle 2, Layer A). Search now shows the printed entry-start page for **all 105 Schools, all 348
School Technique records, every School's own Technique list, all 25 Clans and all 68 Families**: 103 Schools, 276
Technique records (277 School-and-Rank rows), 25 Clans and 68 Families had no page before. The citation appears in
the result list and the entry detail, and searching for a book or page finds it.

Phase 14.3 covers six categories; 14.3a (Cycle 1) did Skills, Weapons and Spells. This release does the rest.
The code marker is `PART K PHASE 14.3.2`, not "14.3b": the ownership scanner reads a letter after the number as Phase 14.

## Citation rules applied

Printed entry-start page, never the PDF viewer's page; the book the entry is printed in. No School is printed in full
in two books (SOURCES.md), so no "version this sheet uses" choice arose. A citation the catalogue already holds is
kept: two Schools (Hiruma Scout, Yotsu Bushi) and 72 Techniques whose descriptions end in a page.

**Keys, because names repeat:** a School Technique is looked up by its School and name (The Gift of the Lady is Doji
Courtier Rank 5, Core p.111, and The Hitomi Kikage Zumi Order Rank 1, Imperial Histories 1 p.215), and a Family by its
Clan and name (Toritaka, Kitsune, Chuda, Tsi and Yotsu each belong to two Clans). Search's single Technique record
for a shared name cites its first School, as its School list does; each School's own detail cites its own page.

## Structure

| File or interface | Role |
|---|---|
| `src/sheet/209.9999999995-feat-school-clan-references.js` | Lookup table and `SCHOOLREF1432`; no DOM or character writes. Generated from `qa/expected-pages.json` by `qa/gen-lookup.py` |
| `SCHOOLREF1432.source(category, name, context)` | The citation for `schools` (name), `techniques` (name, School), `clans` ("Crab Clan") or `families` (name, Clan), or `''`. Names tolerate case, spacing and curly apostrophes |
| `SCHOOLREF1432.recordSource(record)` | The citation for a Search record: Schools and Clans by name, Families by name within their Clan |
| `SCHOOLREF1432.enabled()` | Reports `SEARCH_REFERENCES_1432_ENABLED` |
| `src/sheet/209.99999991-feat-search-index.js` | `search-record-source` in `build()` (fills an empty record source) and `search-technique-source` in `schoolTechniques()` (fills an empty Technique note) |
| `src/sheet/210-test-seam-and-init.js` | `search-references-1432-seam` |

As in 14.2 and 14.3a, a guarded `SEARCH14.invalidate()` after the table drops any records cached before it loaded.

## Verification (15 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/references-harness.js` | **40/40** on the candidate; **7/40 on `main`**: the 33 fix checks fail, the 7 guards pass |
| Negative variants `qa/verify-variants.py` | **8/8 pinned**: baseline (33), disabled (32), PDF page instead of printed (7), wrong book (4), Family from the other Clan (6), missing School (6), missing Technique hook (8), missing record hook (18) |
| Dependency harness | **26/26**: control, switch off, fragment absent, Search off, Search page off, facets off, 14.2 off, 14.3a off; only citations change; catalogues untouched |
| Phase 14 Search harness | **62/62** on the candidate, on `main` and with 14.3b off (retained change below) |
| Neighbours on the candidate | Search dependency 94/94; Facets 44/44 and 14/14; 14.2 30/30 and 20/20; 14.3a 32/32 and 23/23; Search Keystroke Speed 7/7; Search Focus 12/12 and 15/15 |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds `main`'s build exactly (3,843,210 bytes, `14711d4f…`) |
| Removal-chain registry | **11/11** |
| Ownership scan | Exit 1 for the two END lines that hand ownership back to Search (comment-only, as in 14.2 and 14.3a) |
| Second oracle `qa/compare-school-index.py` | 57 of 103 Schools matched in Secrets of the Empire's School Index: 53 agree, 4 differences explained (SOURCES.md) |

Candidate with this layer alone: **3,878,232 bytes**, SHA-256 `d238026736f65835e6f14c30ace9993d3740828917d709dd10759f815d8d9e71`.

## Retained test change

Phase 14's `qa/search-harness.js` uses this release's oracle for Schools, their Technique notes, Clans and Families
**only while `SEARCH_REFERENCES_1432_ENABLED` is on**; switched off or removed, its original expectations apply, and
it tolerates this folder being absent. Families are keyed by Clan there too. No check is dropped. The pre-change file
is in `originals/search-harness.js`.

**Not verified here:** iPhone Safari. See `MANUAL-TESTS.md`.

`qa/current-suite-runner.js` chains BUGFIX — Printed Skills and Equipment Tables' suite (5,294) and adds 40 + 26:
**5,360**.
