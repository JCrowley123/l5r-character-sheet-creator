# Claude — next-session kickoff: Search's facets (Phase 14.1), and Export to PDF if the Print test passes (9 October 2026)

Prepared at the owner's request after the reassessment at 80% of the week. **This file carries the owner's approval**
(9 October: "I approve please write a kick off file", approving the proposal in the ledger's update "reassessment at 80%
of the week; next build proposed"). Build the work under "Approved work", verify it, and stop: merge only on the owner's
word, and start nothing else.

It supersedes `CLAUDE-SESSION-KICKOFF-CORRECTIONS-AND-APP-BAR-2026-10-09.md`, which the previous session started from and
finished: all five releases merged, live and checked (20 Pass, 1 Fail, the Fail a design call the owner parked).

The project is the **L5R 4th Edition single-player character sheet**: a player companion in the spirit of D&D Beyond, not a
combat engine or virtual tabletop. Repository: https://github.com/JCrowley123/l5r-character-sheet-creator. Live site:
https://l5r-character-sheet-creator.pages.dev/.

## Start of session

- Turn Remote Control on and check keep-awake (memory `session-setup-remote-control`). Read the usage meter with
  `get_usage` (memory `usage-meter-readable`) and record it with a timestamp.
- **Canonical checkout: `C:\Users\jcrow\l5r-character-sheet-creator`.** Sessions may open in the OneDrive folder (an older
  clone); never build or commit there. `main` = `origin/main` at this kickoff's commit (after `2d71740`). Four
  owner-deleted kickoff files, untracked Word documents and `tmp/` sit in the checkout: leave them; stage exact paths only.
  Keep `core.autocrlf=false`, `core.longpaths=true`. One branch per release, stacked; never force-push.
- **Ask the owner for the Print test result** if they have not given it (see Approved work, 2): it decides whether 11.1
  joins this cycle.
- Read, by section only:
  - Memory **`feature-structure-and-comments`**: logic apart from UI, the UI replaceable, lean functional comments,
    integration points marked `// UI hook:`.
  - `Versions/CLAUDE.md`: the rules at the top (folder convention, surgical removability) and the dated notes
    "9 October 2026 (Claude) — Phase 14 Search, Phases 4.5.33 and 4.5.34" and "9 October 2026 (Claude, later) — Search
    corrections, two 4.5.33 refinements, the Initiative Score and the app bar" (their lessons).
  - `PART K — Phase 14 Search/` README and ROLLBACK (the data interface `SEARCH14` and the page `SEARCHPAGE14`, the device
    corrections), and `PART K — Phase 11.3 App Bar/ROLLBACK.md` (what the bar hides; the retained harnesses' terms).
  - `Versions/BUILD-LEDGER.md`: the current update (the reassessment and its estimate table) and the open reminders.
    Roadmap: the Phase 14 section (its Validation Test Suite and Regression Matrix are the facets' acceptance criteria),
    the Phase 11.1 section, the amendment "Reassessment at 80% of the week — 9 October 2026", and the REVIEW LATER notes
    FT-15 to FT-24.

## Approved work

### 1. Phase 14.1 Search Facets (Part K): Search's second release, part one

- **Folder:** `PART K — Phase 14.1 Search Facets`, a point release in its own folder (as 4.7.1 and 11.2.1 were). Add 14.1
  to the roadmap with an amendment; it was unused on 9 October (check again).
- **Spells grouped by Element, then Mastery, then A to Z** (the owner's FT-15, kept for this release): in the Spells
  category, a heading per Element, then per Mastery, entries A to Z within each.
- **Filters on each category page, from data the catalogues already hold.** Measured 9 October through `SEARCH14`'s own
  records (`fields` and `tags`):

  | Category | Filters the records support |
  |---|---|
  | Skills (44) | Trait; kind (High, Low, Bugei, Merchant, Weapon) |
  | Advantages (73), Disadvantages (66) | Type (Mental, Physical, Social, Spiritual, Material); cost |
  | Schools (105) | Clan. A School's kind (bushi, courtier, shugenja…) only if a catalogue holds it: check, never infer from names |
  | Advanced Schools (23) | Clan; type (Bushi, Courtier, Shugenja, Monk…) |
  | Alternate Paths (214) | Technique Rank |
  | School Techniques (417) | School; Rank |
  | Kata (17) | Ring; Mastery |
  | Kiho (73) | Ring; Mastery; type (Internal, Martial, Mystical, Kharmic) |
  | Spells (260) | Element; Mastery; Maho |
  | Weapons (53) | Skill; weapon or arrow |
  | Clans & Families (93) | Clan |
  | Ancestors (55) | Clan; cost |

- **The roadmap's Phase 14 criteria apply:** each category reveals only its own facets; the five Techniques sub-types
  (School Techniques, Alternate Paths, kata, kiho, spells) never share filters that do not apply to them; typing still
  narrows live within the filtered set; the counts follow the filters.
- **Keep S11:** `SEARCHPAGE14.open()` with no options returns to exactly where the reader was, now including the active
  filters. With the app bar present, ⋯ → Search is hidden; the bar's Search is the path.
- **Structure (the owner's rules):** the facet logic in its own data-layer module (facet definitions read from the
  records, a filtered query; no DOM, no writes); the facet UI in its own page module, hooked into the Search page through
  a marked `// UI hook:` (wrap Phase 14's interface; do not edit its fragments); its own stylesheet and classes; one
  guarded seam block. Switching the UI off leaves Search exactly as today; so does switching the logic off. A dependency
  harness measures both, with Phase 11 and the app bar switched off in turn.
- **iPhone:** controls at least 44px tall, the search box still 16px, no sideways scroll at 320, 375 and 390px, the app
  bar never covered. If the chips take too much room, a collapsed "Filters" control is fine: decide by measuring. Send the
  owner a 390px screenshot early (`SendUserFile`), before the full QA.
- **Not in this release:** page references (Skills, weapons, kata, kiho, spells, most Schools: book reading), the Library
  link (Phase 13), Items and Monsters, adding from results, fuller descriptions (FT-16).

### 2. Phase 11.1 Export to PDF: only if the owner's Print test passes

- **The test (the owner's, free):** on the live site, in the installed app on the iPhone, open a character, tap
  ⋯ → Print, then share and save the PDF (Save to Files): is it readable and complete (every page, no app bar, no card cut
  off)? On Windows too, if convenient.
- **Pass:** build 11.1 small (about 3 points): Export to PDF in the Characters list's per-character menu (the roadmap's
  place for it, which also answers the REVIEW LATER note "Print on the Characters list's per-character menu"), producing
  that character's print-ready sheet through the browser's print path. The roadmap's line of 24 September ("must not rely
  on `window.print()` inside the installed web app or the Android app") is then relaxed by the test for the iPhone and
  Windows: record that in a roadmap amendment. The Android app (Phase 0.7; its device checks are still open) is outside
  this release; say so in the README. If the scope is unclear, ask the owner in one line.
- **Fail, or not done:** 11.1 waits for next week (it would then need a client-side PDF library: up to 15 points).

### 3. The owed republish of the published ledger page

https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk refuses a republish until the whole page (about 390 KB) has been read:
about 100k tokens. Do it once, as the cycle's last step, from the repository's `Versions/BUILD-LEDGER.html`.

### Not this cycle

Search's page references and Phase 9's flavour text (book reading, better at the start of a week), the supplement
entries, the SynergyEngine, the Library, the parked FT-11 to FT-24 (Phase 15; FT-24's Undo design is decided), and the two
"10 October 2026" comments in `src/sheet/209.99999993-feat-void-initiative-entries.js` (fix them only with the next change
to that file: changing them moves five pinned restore points). Nothing else starts.

## Releases, verification and the owner's check

- **Stack:** 1. Phase 14.1 Search Facets; 2. Phase 11.1 Export to PDF (only if the test passed). Order them so each
  removal restores the build before it.
- **Each layer:** its own harness with oracles it does not own (the catalogues on the test seam, the records' own fields,
  geometry), shown to fail on the build before it; removal files adapted from the newest pair
  (`PART K — Phase 11.3 App Bar/qa/remove-phase.py`, `test-removal.py`, `verify-variants.py`); a removal-chain entry at the
  end of `CHAIN`; pinned variants, run with `--jobs 1`; an ownership scan; README, ROLLBACK and MANUAL-TESTS.
- **Retained harnesses** that tap Search's or the Characters screen's controls already carry terms for the app bar; new
  harnesses tap the bar's items (`#ab113Bar [data-section="…"]`) when it is present.
- **The full suite once, at the end,** sequentially, nothing alongside. Latest runner:
  `Versions/PART K — Phase 11.3 App Bar/qa/current-suite-runner.js` (expects 4,912); each new layer chains a runner off it.
  Then the removal proofs: `PART K — Phase 11.3 App Bar/qa/final-qa.py` runs the full suite, removes each layer newest
  first, checks each restore point byte for byte and runs the retained suite on the rebuilt builds. Edit its `STEPS` for
  this cycle.
- **Live after the merge:** adapt `PART K — Phase 11.3 App Bar/qa/verify-live.py` (bytes, service worker, focused
  harnesses) and `qa/checklist-walk.js` (the checklist through the real controls on the live site).
- **Owner's check:** one Claude Doc. Before you start; one table per layer; a Result dropdown (Pass / Fail / Not run) and
  Notes on every row. The iPhone rows matter most: the chips, scrolling with filters on, the keyboard, returning to a
  filtered list; and the PDF, if 11.1 is built.

## Lessons from 9 October (do not relearn them)

- **One browser job at a time, always.** With about 2 GB of 16 GB free, a variant run beside a harness crashed pages
  ("Target crashed") and timed out page loads, and `--jobs 3` gave wrong counts. A variant takes about a minute.
- **A replacement that rewrites a call must not rewrite the helper that makes it:** Search's harness term once replaced
  the `page.click` inside `openSearch` itself, which then called itself forever and crashed the page. Count first.
- **Correcting a release in place moves the restore point of every release above it** in the removal chain: repin them
  (test-only, declared).
- Chromium blurs a focused field when it is hidden: to prove the page blurs it, record the page's own `blur()` call.
- Combat is a Play-only tab; `setCombatActive` alone does not redraw the Advantage rows: call `recalcAll` after it in a
  harness, as ticking Combat active does.
- Headless Chromium keeps a sticky bar pinned inside a fixed scroller: prove such layouts by structure, not by symptom.
- The feature stylesheets load before `20-carousel.css`: override a carousel rule by specificity, not by order.
- **Line endings:** keep each file's own (some QA JSON files are CRLF; `CLAUDE.md` has one stray CRLF line). Replace in
  place; never normalise a whole file.
- **Shell and git:** paths with em dashes print octal-escaped, so stage them with `git ls-files -m -z` or Python, never by
  parsing `git status`. `git rev-parse --short` takes one revision. Multi-line patterns in a heredoc lose backslashes:
  write generators to a `.py` file. Python on Windows needs Windows paths: pass them as arguments.
- **Check the date before writing it** (`date -u`): the 9 October session wrote "10 October" in places.

## Usage

Week at **80%** (read from the meter about 15:20 UTC on 9 October; the week resets on **14 October at 01:00 UTC**). The
two cycles of 9 October cost about 13 points each.

**Estimate for this cycle:**

| Item | Points |
|---|---|
| Phase 14.1 Search Facets, with its QA | 5–8 |
| 11.1 Export to PDF, if the Print test passes | about 3 |
| Full QA, records, merge, live check, checklist | 3–4 |
| The ledger page's republish | 2–3 |
| **Total** | **10–18** |

That fits the 20% left, at the top of the range only just. If the week reaches about 95% before the merge, stop after the
facets' QA, record, and ask. Record readings at the start, after each layer's QA, after the full suite and after the merge.

## First steps

1. Do the session setup above, ask for the Print test result, and read the records listed.
2. Design the facets' two modules and the page hook; say briefly any choice that differs from this file, then build. No
   further approval is needed for the approved work.
3. Build in the order above, send the 390px screenshot early, do the full QA, then ask for the word to merge.
