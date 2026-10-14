# Phase 14.3a Skill, Weapon and Spell References (Part K)

Built 14 October 2026 (Cycle 1, Layer 3). Search now shows the printed entry-start page for **356 of the 357** Skills,
Weapons and Spells that had none: all 44 Skills, all 53 Weapons (including the five arrow types) and 259 of 260 Spells.
The citation appears in the result list and the entry detail, and searching for a book or page finds it.

## The split (owner's rule in the kickoff)

Phase 14.3 covers six categories (829 entries). The oracle grew too large for one release, so it is split:
- **14.3a (this release): Skills, Weapons, Spells.**
- **14.3b (next cycle): Schools, School Techniques, Clans & Families** (472 entries). Schools are reprinted with
  changes in later books, so 14.3b is where rules 3 and 4 (a later version) and the detail's second line are needed.
  14.3a builds no second-line display: none of its entries is printed in two books (see SOURCES.md).

The code marker is `PART K PHASE 14.3.1`, not "14.3a": the ownership scanner reads a letter after the number as Phase 14.

## Citation rules applied

Printed entry-start page, never the PDF viewer's page; Core Rulebook first where the entry is printed there (306 of
356), otherwise the book it came from (Book of Air, Enemies of the Empire, Imperial Histories 1, Secrets of the
Empire, The Great Clans). Later books that only **discuss** an entry without reprinting its rules are not cited;
SOURCES.md lists them. **Fill the Emptiness** is in none of the 16 books and keeps an empty citation.

## Structure

| File or interface | Role |
|---|---|
| `src/sheet/209.999999998-feat-skill-weapon-spell-references.js` | Lookup table and `SEARCHREF143`; no DOM or character writes. Generated from `qa/expected-pages.json` by `qa/gen-lookup.py` |
| `SEARCHREF143.source(category, name)` | The citation for `skills`, `weapons` or `spells`, or `''`. Names tolerate case, spacing and curly apostrophes |
| `SEARCHREF143.enabled()` | Reports `SEARCH_REFERENCES_143_ENABLED` |
| `src/sheet/209.99999991-feat-search-index.js` | Four guarded source fields: `search-skill-source`, `search-spell-source`, `search-weapon-source`, `search-arrow-source` |
| `src/sheet/210-test-seam-and-init.js` | `search-references-143-seam` |

As in 14.2, a guarded `SEARCH14.invalidate()` after the table drops any records cached before it loaded.

## Verification (14 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/references-harness.js` | **32/32** on the candidate; **8/32 on `main`**: the 24 fix checks fail, the 8 guards pass |
| Negative variants `qa/verify-variants.py` | **6/6 pinned**: baseline (24), disabled (22), PDF page instead of printed (7), wrong book (5), missing Spell (6), missing arrow hook (3) |
| Dependency harness | **23/23**: control, switch off, fragment absent, Search off, Search page off, facets off, 14.2 off; only citations change; catalogues untouched |
| Phase 14 Search harness | **62/62** on the candidate, on `main` and with 14.3a off (retained change below) |
| Neighbours on the candidate | Facets 44/44 and dependency 14/14; Skill Traits 38/38; 14.2 30/30 and 20/20; Search dependency 94/94 |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds Layer 2's build exactly (3,805,444 bytes, `98c8af4c…`) |
| Removal-chain registry | **11/11** |
| Ownership scan | Exit 1 for the four END lines that hand ownership back to Search (comment-only, as in 14.2) |

Candidate: **3,825,637 bytes**, SHA-256 `5b63e1d9f376547e09d3aaeea0fc95c49bab727ba06afe961c5b91c3dc2dfb20`.

Keystroke timing after this release (4× CPU throttling, five repeats on this desktop): Search's worst keystroke
18–28 ms and the facets' 30–41 ms, against the 50 ms checks; no worse than before it.

## Retained test change

Phase 14's `qa/search-harness.js` uses this release's oracle for Skills, Weapons and Spells **only while
`SEARCH_REFERENCES_143_ENABLED` is on**; switched off or removed, its original empty-citation expectations apply, and
it tolerates this folder being absent. No check is dropped. The pre-change file is in `originals/search-harness.js`.

**Not verified here:** iPhone Safari. See `MANUAL-TESTS.md`.

`qa/current-suite-runner.js` chains Layer 2's suite (5,161) and adds 32 + 23: **5,216**.
