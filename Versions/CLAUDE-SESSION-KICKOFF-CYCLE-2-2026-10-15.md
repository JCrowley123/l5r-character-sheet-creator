# Claude — next-session kickoff: Cycle 2 (proposed 15 October 2026)

**Status: a proposal awaiting the owner's approval.** Do not start building until this line says the owner approved it
(with the date), or the owner approves it in the session's first message.

The owner's seven rulings of 15 October set this cycle (the roadmap's amendment "Owner's rulings and Cycle 2 proposed —
15 October 2026" has them in full). Cycle 2 does the book reading: the remaining Search references and every School's
flavour text, which read the same pages, plus two small name fixes and a rules reading for D06 and Hotei. The Library
comes next week, built from mock-ups approved in this cycle.

## Start of session

- Remote Control on, keep-awake (memory `session-setup-remote-control`), and a meter reading (`get_usage`) with the time.
  The week resets on 21 October at 01:00 UTC; it read **53%** when this file was written.
- **Canonical checkout: `C:\Users\jcrow\l5r-character-sheet-creator`.** Never build or commit in the OneDrive clone.
  Stage exact paths only; leave `Characters/`, `tmp/`, Word documents and owner-deleted kickoffs alone. One branch,
  `claude/cycle-2-2026-10-15`; never force-push.
- **Starting build:** `main` at `9ba26cc` or later. Phase 0 build **3,843,210 bytes, SHA-256
  `14711d4f0592c56fadb1222efd8dade606d0c38a782ca41dada04c7239076004`**; `recombine.py --verify` byte-identical. The
  newest release is BUGFIX — Printed Skills and Equipment Tables; its `qa/current-suite-runner.js` gives the full suite:
  **5,294 checks**.
- **Read by section only** (not the ledger, roadmap or `CLAUDE.md` in full): this file; memories
  `feature-structure-and-comments`, `helper-agents-two-roles`, `sourcebook-rules-text-own-words`,
  `capped-search-not-found`, `playwright-chrome-shim`; `PART K — Phase 14.3a Skill, Weapon and Spell References/`
  (README, SOURCES.md, `qa/`), the newest pattern to adapt; `QA — Removal Chain Registry/README.md`;
  `SOURCEBOOK INDEX — Page Map/` (README, `INDEX.md`, `OUTLINES.md`, `index.json` page offsets).

## Test environment (since the 14 October Windows updates)

Playwright's bundled Chromium crashes on opening any page. Run every harness on the installed Google Chrome:
- `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules` (visible to every process, including the Store Python that runs
  the `.py` fixtures);
- `NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`
  (forward slashes: backslashes inside a quoted `NODE_OPTIONS` path are dropped);
- `PYTHONUTF8=1`. Checked on 15 October: Layer 7's harness 9/9 this way.

## Proposed work: three removable layers, one reading, one design

### Layer A — PART K — Phase 14.3b School, Technique, Clan and Family references
Book pages for the entries 14.3a left: Schools (103 of 105 without a page), School Techniques (276 of 417), Clans &
Families (93 of 93), counted on 14 October; recount from `window.__L5R_TEST__.SEARCH14`. Same mechanism, citation rules,
display, method, oracle (`qa/expected-pages.json`, from the books) and `SOURCES.md` as 14.3a; report every multi-book
entry, every "the version this sheet uses" case and the possible-update list. Never conclude "not found" from capped
output.

### Layer B — Phase 9 School flavour text, all 105 Schools (the owner's ruling)
- One or two sentences per School, **in Claude's own words** (memory `sourcebook-rules-text-own-words`), each with its
  printed page; no quotation.
- Shown in Search's School detail and in the School info panel.
- Read each School's entry once for both layers: Layer A's page and Layer B's text come from the same reading.
- If the stop line nears, finish the remaining Schools next cycle: each School's text stands alone.

### Layer C — two Spell names match the books (the owner's notes, 15 October)
"Enticing the Dance of Flame" becomes **"Enticing Dance of the Flame"** (Core p.182); "Fill the Emptiness" becomes
**"Fill with Emptiness"** (Core p.196). First find how saved characters and the spell pickers store Spell names: old
saves must still load and show the Spell, and Search must still find the old names (an alias, not a rename alone).

### Reading only — D06 Weakness and Hotei (the owner's ruling: automate after a reading)
- Read both entries. Write a short rules proposal in own words with pages, for the owner's ruling. No build this cycle.
- **Weakness:** how far the lowered Trait reaches: rolls only; the Ring and what comes from it (Wounds, Void Points,
  initiative, TN to be hit); or Insight too. The purchased Trait and XP are never changed. Recommend one, citing the
  book's wording (summarised, not quoted).
- **Hotei:** the part that applies when Void Points are spent rather than rolled; propose the "declare on spend" control
  on the Void card, or say the book does not support one.
- Present both with the other end-of-cycle items. The build follows in the next cycle once ruled.

### Design only (optional, below the stop line) — Library mock-ups
The owner's Library ruling (roadmap amendment) in pictures, for approval before next week's build: the empty Library with
"+ Book"; the list view (cover, title, ⋯); the grid view on shelf lines (restrained: thin lacquer shelf, soft shadow, no
3D); the import window (PDF only); the ⋯ menu (Which book is this?, Check page numbers, Rename, Change cover, Replace
file, Storage used, Delete); the reader (pages, jump to a printed page, chapters, search in book); the Search link prompt
("Open Core Rulebook at p.139?"); and the not-in-Library message with "Add book". Publish as one artifact; no code.

## Helpers and sessions
- Only the owner's two helper roles (memory `helper-agents-two-roles`): one code reviewer after the layers pass their own
  checks; a failing-test investigator only if a cause stays unclear after a couple of tries.
- **No side sessions during the cycle.** On 15 October three follow-up sessions cost about 24 weekly points in six hours,
  and each of their notes woke a long conversation. If a real defect turns up, bring it to the owner as a small removable
  fix for the cycle's next kickoff, unless the owner asks otherwise.

## Verification
- Every new check fails on `main`; quote both counts; pin the negative variants.
- Each layer removes cleanly through the registry and rebuilds its predecessor byte for byte; registry QA passes.
- **One full suite** on a quiet machine (nothing else running), in the background, waited on without polling: 5,294 plus
  the new checks, then all layers removed rebuilding `main` exactly and the retained suite. Adapt
  `QA — Cycle 1 2026-10-14/qa/final-qa.py` and `flat-suite-runner.js`. Never relax a check.
- After the owner's word to merge: deployed bytes, the new checks and Search 62/62 live (adapt Cycle 1's
  `qa/verify-live.py`); then one combined checklist doc with Pass/Fail dropdowns (memory `device-check-workflow`).

## Usage
- **Estimate (Claude points):** A 5–9; B 8–14; C 1–2; the D06/Hotei reading 2–3; QA, merge, live check, checklist and
  records 4–6; the mock-ups 2–3 if reached. **Core about 20–34.**
- **Stop and report at 30 points.** Skip the mock-ups if the cycle has passed 24 when they come up.
- Read the meter at the start, after each layer, after the full suite, after the merge and at the end; one cost table in
  the ledger.
- One fresh session for the cycle; past about half the context window, write a short handoff and continue in a new one
  (memory `fresh-session-over-long-context`).

## Records: keep them short
Full detail only in each layer's README. Elsewhere: one ledger entry at the top, the roadmap's status rows (9, 14) and
a short amendment, one pointer in `CLAUDE.md` (8 deliberate CR bytes: count with Python, or append). No
`BUILD-LEDGER.html`.

## Lessons (do not relearn them)
- Write scripts to files; heredocs drop backslashes (three times on 14–15 October). Python's `write_text()` writes CRLF
  on Windows: use `write_bytes(text.encode('utf-8'))`.
- Never conclude "not found" from capped output: count every hit first.
- Do not time-test while anything else runs browsers; check `tasklist | grep -ci chrome` against a baseline first.
- A guard check must establish its own premise.
- Run every harness that touches the same public functions before committing a layer.

## First steps
1. Remote Control, keep-awake, meter reading.
2. Canonical checkout: status, worktrees, fetch, fast-forward `main`, create the branch; check the build hash.
3. The reading above; then the test plan for A, B and C.
4. Read the Schools once for A and B together; build A, then B, then C, committing each when its focused QA passes. Do
   the D06/Hotei reading while long runs go.
5. Code review, fixes, the full suite, records; the mock-ups if below the line. Report and wait for the word to merge.
