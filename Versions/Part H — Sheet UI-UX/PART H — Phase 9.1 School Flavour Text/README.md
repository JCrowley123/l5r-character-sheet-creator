# Phase 9.1 School Flavour Text (Part H)

Built 15 October 2026 (Cycle 2, Layer B). Every one of the sheet's **105 Schools** now has one or two sentences of
flavour text, **in our own words** (the owner's ruling of 30 September: no book text), with the printed page it comes
from. It is shown in two places:

- **Search's School detail**, as a paragraph ending with its page, e.g. "… (Core Rulebook p.125)". Search also finds a
  School by words in its text.
- **The School preview** under the Clan & School tab's School picker (`#cfs_schoolInfo`), after the preview's other
  lines (and after a monk School's note), in italics with its page.

The text was written in the book-reading session of 15 October from each School's own entry, the same reading that
gave Phase 14.3b its pages (`qa/school-flavour.json`). The Fudoist Order's text comes from the Fudoism Heresy section
(Imperial Histories 2 p.286); its School heading, which 14.3b cites, is p.287.

## Phase 9's open decisions, as settled

`PART H — Phase 9 Clan-Themed Look/DESKTOP-HANDOFF — School Flavour Text.md` listed four open questions:

1. **Which entries:** all 105 Schools, Great Clan, Minor Clan and Brotherhood (the owner, 15 October). Alternate Paths
   are not Schools and have none.
2. **How long:** one or two sentences (the owner). The data checks enforce it.
3. **Where:** Search's School detail and the School preview (the owner). The preview line is plain text after the
   others; Phase 15 may move it behind a tap-to-open control.
4. **Verbatim or paraphrased:** paraphrased, in our own words, with the page (the owner, 30 September).

Build rules from that note: the text has its own fragment, marker and switch; no field was added to the School
libraries (`060`), so removing Phase 9's clan theming is unaffected and this release does not depend on it (dependency
variant "CLAN-THEME-OFF"). The real-device notes in `PENDING FEEDBACK — Real-Device UX Notes.md` were not touched.

## Structure

| File or interface | Role |
|---|---|
| `src/sheet/209.9999999996-feat-school-flavour.js` | The 105 texts and `SCHOOLLORE9`; no DOM or character writes. Generated from `qa/school-flavour.json` by `qa/gen-lore.py` |
| `SCHOOLLORE9.entry(name)` | `{text, book, page, source}` for a School, or `null`. Names tolerate case, spacing and curly apostrophes |
| `SCHOOLLORE9.searchText(name)` | Search's School record text: `[text + " (" + source + ")"]`, or `[]` |
| `SCHOOLLORE9.enabled()` | Reports `SCHOOL_FLAVOUR_ENABLED` |
| `src/sheet/209.99999991-feat-search-index.js` | `search-school-text`: the School record's `text` |
| `src/sheet/080-identity-build-ui.js` | `school-info-flavour` at the end of `renderSchoolInfo()`, a `// UI hook:` that appends the escaped text in `.cfs-school-flavour` |
| `src/sheet/210-test-seam-and-init.js` | `school-flavour-seam` |

`SCHOOLLORE9` is declared with `var`: `renderSchoolInfo()` first runs while 080 loads, before this fragment, and a
`typeof` check on a `const` in that state throws. The fragment then calls `renderSchoolInfo()` once (guarded) to
repaint the preview drawn without it, and calls `SEARCH14.invalidate()` as 14.2 and 14.3 do.

## Verification (15 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/flavour-harness.js` | **19/19** on the candidate; **5/19 on `main`**: the 14 fix checks fail, the 5 guards pass |
| Negative variants `qa/verify-variants.py` | **6/6 pinned**: baseline (14), disabled (13), missing Search hook (6), missing preview hook (3), missing repaint (1), wrong page (6) |
| Dependency harness | **23/23**: control, switch off, fragment absent, Search off, Search page off, 14.3b off, clan theming off; only the School text changes; libraries untouched |
| Every School in the preview | 105 reached through the Clan, Minor Clan and Brotherhood pickers; each shows its exact text and page, escaped |
| Neighbours on the candidate | Search 62/62 and 94/94; Facets 44/44 and 14/14; 14.2 30/30 and 20/20; 14.3a 32/32 and 23/23; 14.3b 40/40 and 26/26; Search Keystroke Speed 7/7; Search Focus 12/12 and 15/15; Clan theming 17/17; Export to PDF 33/33 |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds Layer A's build exactly (3,878,232 bytes, `d2380267…`) |
| Removal-chain registry | **11/11** |
| Ownership scan | Exit 1 for the one index END line that hands ownership back to Search (comment-only) |

Candidate with Layers A and B: **3,903,365 bytes**, SHA-256 `51ed73efc321fb40ef9528b8d786ed3f713ad84aed2b332540e89c2b5f324339`.

No retained test change: no existing check reads School text or the preview's text.

**Not verified here:** iPhone Safari. See `MANUAL-TESTS.md`.

`qa/current-suite-runner.js` chains Phase 14.3b's suite (5,360) and adds 19 + 23: **5,402**.
