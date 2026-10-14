# Claude — next-session kickoff: Cycle 1 (14 October 2026)

**This file carries the owner's approval.** On 14 October 2026 the owner approved Cycle 1 as proposed in Claude's
reassessment ("I am happy to continue cycle 1"), with the rulings below. Build the cycle, verify it, and stop. Merge
only on the owner's word, and start nothing else.

The project is the **L5R 4th Edition single-player character sheet**, a player companion in the spirit of D&D Beyond, not a
combat engine or virtual tabletop. Repository: https://github.com/JCrowley123/l5r-character-sheet-creator. Live site:
https://l5r-character-sheet-creator.pages.dev/.

## Start of session

- Turn Remote Control on and check keep-awake (memory `session-setup-remote-control`). Read the meter with `get_usage` and
  record it with the time. The week reset on 14 October at 01:00 UTC; the reassessment session that wrote this file used
  about 2% of the week.
- **Canonical checkout: `C:\Users\jcrow\l5r-character-sheet-creator`.** Never build or commit in the OneDrive clone. Leave
  owner-deleted kickoffs, untracked Word documents, `Characters/` and `tmp/` alone, and stage exact paths only. Keep
  `core.autocrlf=false` and `core.longpaths=true`. Use one branch, `claude/cycle-1-2026-10-14`, and never force-push.
- **Starting build:** `main` is at this kickoff's commit; the last code change is Phase 14.2 (`be0a741`). The Phase 0 build
  is **3,800,283 bytes, SHA-256 `7b68f34d746d8674cdd33e6815197f9c1ea8e6e131ab42c2e523a4f477d4929a`**, and
  `python build.py --check-drift` (repository root, `PYTHONUTF8=1`) passed on 14 October.
- **Read by section only.** Do not read the ledger, the roadmap or `CLAUDE.md` in full.
  - Memories `feature-structure-and-comments` and `helper-agents-two-roles`.
  - `Versions/CLAUDE.md`: lines 1–266 (folder convention, rollback, surgical removability), "Invariants every build must
    preserve", "Working style the user expects" and the last two dated notes.
  - `Versions/PART K — Phase 14.2 Kata and Kiho References/`: README ("Structure", "Running the full suite"), ROLLBACK,
    SOURCES.md, and `qa/` (`references-harness.js`, `dependency-harness.js`, `negative/`, `flat-suite-runner.js`,
    `final-qa.py`, `remove-phase.py`). These are the newest patterns to adapt.
  - `Versions/QA — Removal Chain Registry/README.md`: every release registers once, at the end of `CHAIN`.
  - `Versions/SOURCEBOOK INDEX — Page Map/`: README, `INDEX.md`, `OUTLINES.md` (each book's bookmarks) and
    `index.json` (the PDF-to-printed page offsets).

## Approved work: three removable layers and one desk check

Each layer gets its own folder, marker, fragment, seam block, switch, README, ROLLBACK, MANUAL-TESTS and removal-chain
entry. Commit each one when its own QA passes. **Plan every layer's checks, negative variants and expected counts before
writing code.**

### Layer 1 — BUGFIX — Search Focus on Close (FT-34)
- **The defect:** `closeDetail()` in `src/sheet/209.99999992-feat-search-page.js` hides the focused detail heading and
  restores no focus. A second Escape therefore does not close Search. On the live site Search's check stops at 51/53
  (`S14-ESCAPE-CLOSES`, then a toolbar timeout), leaving 9 checks unreached on every live run.
- **The fix:** on close, return focus to the result button that opened the detail, without scrolling and without opening
  the iPhone keyboard. Keep the query, filters and list scroll as they were; Back behaves as now; a second Escape closes
  Search. Do not edit Phase 14's fragment in place: follow the seam or wrapper patterns that 14.1 and 14.2 use.
- **Checks:** the returned focus, unchanged scroll, Back, and two Escapes. They must fail on `main`. After the merge,
  Search's own live check should complete 62/62.

### Layer 2 — BUGFIX — Printed Weapon Text (FT-30)
- **The defect:** the saved PDF clips weapon names and notes (page 6 of the owner's seven-page PDF). The evidence is in
  `Versions/QA — Small Fix Cycle 2026-10-10/OWNER-RESULTS-2026-10-12.md`; the print styles are in
  `src/css/60-sheet-print.css`, `59.999985-bugfix-printed-ring-layers.css` and `59.999986-feat-export-pdf.css`.
- **The fix:** under print, weapon names and notes wrap in full. **Clipping only:** page count and whitespace wait for
  Phase 15 (owner, 14 October).
- **Checks:** under print media, with a long name and long notes, no weapon text overflows its box. Text extracted from a
  printed PDF holds the full strings. Both must fail on `main`. Remember the print lesson: a print rule that makes a parent
  `static` frees its absolutely positioned pseudo-elements.

### Layer 3 — Phase 14.3 Remaining Book References (Part K)
Entries without a book page, counted from the build's `SEARCH14` on 14 October (via `window.__L5R_TEST__.SEARCH14`):

| Category | Without a page |
|---|---:|
| Spells | 260 of 260 |
| School Techniques | 276 of 417 |
| Schools | 103 of 105 |
| Clans & Families | 93 of 93 |
| Weapons | 53 of 53 |
| Skills | 44 of 44 |

- **Mechanism:** the same as 14.2's, in a new module of its own. 14.2 added guarded `source` fields in Search's index for
  Kata and Kiho; do the same for these categories. If the oracle grows unwieldy, split the work into 14.3a (Skills,
  Weapons, Spells) and 14.3b (Schools, Techniques, Clans & Families), and record the split.
- **Citation rules (the owner's rulings, 14 October 2026):**
  1. Cite the **printed entry-start page**, not the PDF viewer's page, as 14.2 does.
  2. **Core Rulebook first** where the entry is printed there; otherwise the book the sheet took the entry from.
  3. **If a later book changed the entry and the sheet follows the changed version:** name that later book first, marked
     "the version this sheet uses", and add a second line: "An earlier version is in the Core Rulebook, p. N."
  4. **The reverse case:** if a later book changed the entry but the sheet follows the Core version, cite Core first, add
     "A later version is in [book], p. N", **and list the entry for the owner** as a possible update. Change no rules in
     this cycle.
  5. **An entry reprinted unchanged** gets the Core page only.
  6. "Changed" means different rules (numbers, keywords, Mastery, TN, effects), not different wording. Decide which
     version the sheet follows by comparing the catalogue's fields with each printing.
- **Display:** the results list shows the main page only; the detail shows both lines; searching by book or page finds
  either one. Do not describe what changed (possible later work).
- **Method:**
  - Extract text into a scratch folder only, never the repository.
  - Find each entry's heading, and convert the PDF page to the printed page with `index.json`'s offsets.
  - Render and look at any ambiguous page.
  - The oracle (`qa/expected-pages.json`) comes from the books, independently of the code.
  - `SOURCES.md` lists every entry: book, printed page and PDF page, plus any other printing and whether it changed.
- **Report:** every entry found in more than one book, every case under rule 3, and the rule-4 list.
- **Non-goals:** rules text, descriptions (FT-16), mechanics, the Library link, and changes to saved characters.

### The Library desk check (no build)
For each of the owner's 16 PDFs (`%USERPROFILE%\OneDrive\Documents\L5R 4th edition books`), record:
- the file size and page count;
- whether it has working bookmarks (`OUTLINES.md` may already answer this);
- whether its text is searchable or scanned;
- the printed-page offset.

Record this as a short table in the roadmap's Phase 13 section. It is the evidence for the Library's scope ruling.

## Helpers (the owner's ruling, 14 October 2026)
Only two roles; see memory `helper-agents-two-roles`.
1. **One code reviewer** after all three layers are built and pass their own checks, before the full suite. Give it the
   diff, this file's approved scope and the rules. It looks for bugs, is read-only, and you verify each finding before
   fixing.
2. **A failing-test investigator**, only if a test fails and the cause is not clear after a couple of tries. It reports
   the cause and a fix, and runs no full suite.

No other helpers. If an investigation finds a real defect outside this scope, bring it to the owner as a small removable
fix for this cycle; do not just record it.

## Verification
- **Every new check must fail on `main`:** quote both counts. Pin the negative variants' exact expected failures.
- **Removal:** each layer removes cleanly and rebuilds its predecessor byte for byte. Registry QA passes.
- **One full suite over the frozen candidate**, on a quiet machine with nothing else running. Expect 5,107 plus the new
  checks.
  - Use 14.2's `qa/flat-suite-runner.js`, adapted, and `final-qa.py --resume` for failed groups only.
  - Run it in the background and wait for its notification; do not poll it.
  - Run the retained (removed) suites as the small-fix cycle did.
  - Never relax a check. If the facets keystroke-timing check (`F141-UI-KEYSTROKE-UNDER-50MS`) fails again, report it and
    do not change it.
- **After the owner's word to merge:** verify the deployed bytes, the new checks and Search 62/62 live.
- **Owner checklist:** one combined checklist (memory `device-check-workflow`) for the three layers. Include 14.2's six
  iPhone checks still owed (R1–R6 in 14.2's `MANUAL-TESTS.md`).

## Usage
- **Budget:** about 9–15 Claude points (an estimate). If the cycle passes 18, stop and report.
- **When to read the meter:** at the start, after each layer's QA, after the full suite, after the merge and live check,
  and at the end. Record a cost table in the ledger, as on 7–9 October.

## Records: keep them short
- Full detail goes only in each layer's README.
- Elsewhere, short pointers only: one short entry at the top of the ledger, the roadmap's status rows (14, 11.1) and a
  short amendment, and one short pointer in `CLAUDE.md`. Do not copy the same paragraph into several files: ChatGPT's 14.2
  records did, and it cost usage.
- Do not refresh `BUILD-LEDGER.html` unless asked.

## Prepare during the cycle: one batch of rulings
Present these at the end, each with options and a recommendation, so the next cycle never waits:
- the Library's scope, using the desk check's facts;
- School flavour text (Phase 9): which Schools, how long, and where it shows;
- FT-16 fuller descriptions for other categories;
- the supplement scope (Stations, Naga Ancestry, Trials of the Imperial City, Wanderer, Imperial City Stigma's cost);
- D06 Weakness's boundaries and Hotei;
- Phase 6's engine scope;
- whether Phase 7's audit log is still wanted.

The order after this cycle, as proposed: Library first release (it doubles as the iPhone feasibility test), School
flavour text, supplement entries with D06 and Hotei, Phase 6's engine, the rest of the Library, the audit log, backlog and
end reviews, then Phase 15 last.

## Lessons (do not relearn them)
- Write generator scripts to files, not heredocs, because heredocs drop backslashes. `python -I` ignores `PYTHONUTF8`, so
  reconfigure stdout to UTF-8 inside the script.
- `Versions/CLAUDE.md` has 8 deliberate carriage-return bytes on otherwise LF lines. The Edit tool dropped 7 of them on
  14 October (restored in `da2e4e0`). Git Bash's `grep $'\r'` does not see them, so count with Python
  (`open(f,'rb').read().count(b'\r')`) before and after editing, or append with `cat >>`.
- Read Search's interfaces through the test seam: `window.__L5R_TEST__.SEARCH14`, not a bare global.
- `#f_rank` and `#f_school` are displays that recalc rewrites: read them, never set them.
- Off-screen carousel pages use `content-visibility:auto`: show the tab first with `__L5R_CAROUSEL__.goToTab`.
- Playwright's `selectOption` does not focus the select.
- Do not reuse a data-attribute name another phase's selectors rely on (`data-category` clashed in 14.1).
- The full suite failed under host load on 12–13 October: navigation timeouts and the timing checks. 14.2's
  `qa/navigation-budget.cjs` preloads a test-only 60-second navigation allowance. Run the suite alone.
- Tooling: Node `C:/Program Files/nodejs/node.exe`; `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`;
  `PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright`; `PYTHONUTF8=1`; in Git Bash,
  `PATH="/c/Program Files/nodejs:$PATH"`.

## First steps
1. Remote Control, keep-awake, and a meter reading.
2. In the canonical checkout: check the status and worktrees, fetch, fast-forward `main` if it is safe, then create the
   branch.
3. Check the build's size and hash and run the drift check.
4. Do the reading above, then write the test plan for all three layers.
5. Build L1, L2, then L3 (or L3 first, since it is the largest), committing each when its focused QA passes. Do the desk
   check while long runs go.
6. Code review, then fixes, then the full suite, then the records. Report to the owner and wait for the word to merge.
