# Claude — next-session kickoff: Cycle 4, the Library (started 17 October 2026)

**Status: started on the owner's word, 17 October 2026, in a fresh session.** Build Phase 13, the Library, from the
approved mock-ups. The first turn proposes the releases, an estimate and a cap; build only the release the owner
chooses. Anything outside the approved design needs the owner's word.

**The owner's rulings, 17 October:** [Library Mock-ups v2](https://claude.ai/artifact/BkdJwpc9xFia9tRvBBBJrU) is approved
as drawn, including the choices it lists as drawn without an earlier ruling: List is the default view; desktop says
"Click + Book"; on desktop, panels open as centred windows, the ⋯ menu beside its button, and Chapters and Search in
book in a side panel. **The File missing proposal (flow 7) is agreed.** FT-40 is parked: the book-correction dropdown
stays; review it in Phase 15. The first canvas, [Library Mock-ups](https://claude.ai/artifact/24UdQFLot4pPCm7oHsRPe3), is
kept only for comparison.

FT-32 (always load the newest version, with a loading screen) was raised with the owner on 17 October; it is parked
for Phase 15 and is not in this cycle unless the owner adds it. Do not raise it again.

## Start of session

- Remote Control on, keep-awake (memory `session-setup-remote-control`), and a meter reading (`get_usage`) with the time.
  The week read **21%** at 13:21 UTC on 17 October (5-hour 56%) when this file was written; it resets on **21 October
  at 01:00 UTC**.
- **The 5-hour window holds about 14–15 weekly points** (measured 17 October: the 5-hour meter moved 48% while the week
  moved 7). The Library needs at least two windows. Read the meter between steps; when the 5-hour meter nears 90%, stop
  at a clean point (never mid-merge or mid-push), say so, and continue after its reset when the owner says to.
- **Canonical clone: `C:\Users\jcrow\l5r-character-sheet-creator`.** Never build or commit in the OneDrive clone. The
  canonical checkout is shared with other sessions: make the branch `claude/cycle-4-<date>` from `origin/main` in its
  own git worktree (for example `C:\Users\jcrow\l5r-cycle-4`, like the other phase worktrees); do not switch the
  canonical checkout's branch. Stage exact paths only; leave `Characters/`, `tmp/`, Word documents and owner-deleted
  kickoffs alone; never force-push.
- **Starting build:** `main` at this file's records commit or later. Phase 0 build **3,935,889 bytes, SHA-256
  `f39a31cbe31e9e8ad923f557275e1d613920fe98868a67ccc74cdd342fd3fec0`** (Cycle 3, `a57cfe8`); `recombine.py --verify`
  byte-identical. The newest release is `PART I — Phase 4.5.36 Weakness and the Curse of Hotei`; its `qa/` gives the
  full suite: **5,511 checks**.
- **Read by section only** (not the ledger, roadmap or `CLAUDE.md` in full): this file; the v2 canvas (Artifact `read`:
  `project/canvas.json` first, then only the boards a release needs; the shared look is `project/library.css`); the
  hand-over note `C:\Users\jcrow\AppData\Roaming\Claude\side-session-notes\local_c5c842c7-5abd-4fee-a7f0-63ae998babb0\library-mockups-v2.md`;
  memory `library-mockup-feedback` (its build notes in changes 7, 9, 10 and 12); the roadmap's **PHASE 13** section
  with its "Desk check of the owner's 16 PDFs (Cycle 1, 14 October 2026)", and its amendments "Owner's rulings and
  Cycle 2 proposed — 15 October 2026" (Phase 13) and "Owner's rulings and Cycle 4 started — 17 October 2026"; memories
  `feature-structure-and-comments`, `helper-agents-two-roles`, `playwright-chrome-shim`, `full-suite-mains-power`,
  `fresh-session-over-long-context`, `device-check-workflow`, `device-check-stale-version`,
  `sourcebook-rules-text-own-words`; `QA — Removal Chain Registry/README.md`; Cycle 3's `qa/`.

## Test environment

Playwright's bundled Chromium crashes on any page since the 14 October Windows updates. Run every harness on the
installed Google Chrome:
- `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules` (visible to every process, including the Store Python that runs
  the `.py` fixtures);
- `NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`
  (forward slashes);
- `PYTHONUTF8=1`.

**Mains power and the screen awake** for the full suite and every timing check (memory `full-suite-mains-power`): read
`Get-CimInstance Win32_Battery` (BatteryStatus 2 = on mains); if on battery, ask the owner to plug in. Hold the screen
awake with a background PowerShell process calling `SetThreadExecutionState(0x80000003)`, plus keep-awake; stop it
after. Quiet machine: compare `tasklist | grep -ci chrome` with a baseline first.

**The owner's instruction: the full suite passes first time.** If anything fails under load, find the cause and fix it;
never weaken, loosen, skip or retry a check until it goes green. A re-run only after the cause is found and fixed, and
the records say so.

## What the Library is (approved; the canvas is the reference)

- **Header:** "‹ Sheet" and Characters / Library / Search on one row, as the live app bar.
- **Empty Library:** + Book (top left); three dotted outlines of one size on a shelf line; "Add the books you own as PDF
  files."; "Tap + Book to add one." (desktop: "Click"). No mention of EPUB anywhere on screen.
- **Add a book:** the file row starts "No PDF chosen" with **Choose PDF** (the system's own picker), then the file name
  and "Choose another". Then: **"Recognised as [book]"** with a small Change (the dropdown of known books plus "Another
  book (no Search links)"); the **page-numbers line** in three states, starting in the background once the PDF is
  chosen: "Matching page numbers…", "Page numbers matched automatically", or "Page numbers need a quick check" with
  **Check now** (one page, "What page number is printed here?", one box; or skip and use Fix page numbers later). Add
  book never waits for it. **Name on your shelf** fills in from the recognised book. **Cover: [thumbnail] Change**,
  always the current cover. "Kept on this device only. Nothing is uploaded."
- **Change cover** (from Add a book and from the ⋯ menu; one panel): a page from the PDF (a strip of the first pages;
  the first pick is the first page with real content) or a picture (the device's own picker, then a simple crop to the
  book's shape). The picture is kept on the device with the book.
- **Storage:** the PDF and a chosen cover picture are **copied into the app's own storage at import**, so moving or
  deleting the originals never breaks anything. Library storage is separate from character saves. One line at the
  Library's foot: "Books use [size] on this device".
- **Views:** List (default): cover, title, ⋯ at the far right. Grid: covers on lacquer shelf lines, ⋯ at each cover's
  top left; three a shelf on phones, five or six on desktop.
- **The ⋯ menu:** exactly Rename, Change cover, Fix page numbers, Delete (asked first). Header line: "PDF, kept on this
  device".
- **Reader:** scroll the pages; type a printed page and Go. **Chapters** from the PDF's bookmarks (outline tree, any
  depth) shown in three collapsible levels, the current spot highlighted and its levels open; a PDF with no bookmarks
  says so and offers the page jump and search. **Search in book** lists printed pages.
- **Links from Search:** "Open Core Rulebook at p.139?" opens the reader at the printed page; back returns to Search. A
  book not in the Library: the citation is marked "not in Library"; tapping explains and offers Add book, then opens the
  page once it is added.
- **File missing (agreed):** a book whose stored copy was cleared stays on the shelf marked "File missing" with "Add the
  file again", keeping its name, cover, recognised book and page fix; if the PDF chosen is a different book, the app
  says so before using it.
- **Platforms:** one build for iPhone Safari, Android Chrome and the Phase 0.7 Capacitor app; desktop browsers get a
  centred column, windows instead of sheets, the ⋯ menu beside its button, and a side panel for Chapters and Search.

## Build notes (measure first, then build)

- **Recognition** never from the PDF's title alone (the owner's Core Rulebook PDF carries "L5R_00_Introduction.indd"):
  use the first pages' text, the bookmarks and the page count (404 for that Core Rulebook). Measure on the owner's 16
  PDFs (the desk check's facts first; re-measure only what is missing).
- **Page numbers:** the PDF's page labels first; then printed numbers read from sampled pages' text; ask once only if
  neither is confident (scans). The desk check found the printed page and the PDF page differ in 8 of the 16 books.
- **The renderer:** choose and justify the PDF renderer, its size in the one-file build, and how it works offline (the
  service worker). App-size optimisation waits for the end of the project, but report the growth in bytes.
- **iPhone feasibility:** Safari's storage quota and eviction for large PDFs (the 16 books are about 1.45 GB),
  `navigator.storage.persist()`, and memory when rendering large pages. Plan a clear message when storage is refused
  or full. The first release's device check measures this on the owner's iPhone.
- **Capacitor (0.7):** the same build; check its file input and storage.
- Structure: one UI-agnostic logic module, a replaceable UI, `// UI hook:` markers, lean functional comments (memory
  `feature-structure-and-comments`); removable layers with folder, marker, switch, README, ROLLBACK, MANUAL-TESTS,
  pinned variants, removal proof and registry entry. The app never carries book text: only the owner's own PDFs,
  stored on the device.

## Releases (propose in the first turn, for the owner's choice)

1. **First release, the iPhone feasibility test** (the roadmap's own first step): Add a book for one PDF (recognition,
   page matching, cover), stored on the device; a minimal shelf; open it from a Search citation at the printed page
   (Athletics, Core Rulebook p.139); the page jump. **About 10–20 points.**
2. **Then the rest:** list and grid, the ⋯ menu, Change cover, Chapters, Search in book, not-in-Library with Add book,
   File missing, desktop layouts. The rest of Phase 13's **20–40**.

Propose each with points, a stop line and a cap; read the upper half (Cycle 1 ran over its estimate, Cycle 3 cost about
20 against 11–21).

## Helpers and sessions

- Only the owner's two helper roles (memory `helper-agents-two-roles`): one code reviewer after a release passes its own
  checks, with a narrow brief; a failing-test investigator only if a cause stays unclear after a couple of tries. Check
  the 5-hour window first: a review can take a third of it.
- No side sessions during the cycle. A real defect goes to the owner as a small removable fix for the next kickoff.

## Verification

- Every new check fails on `main`; quote both counts. Pin negative variants, at least: Library storage touching
  character saves; a link opening the PDF page instead of the printed page; recognition from the title alone; Add book
  waiting for the page matching; a deleted book's link not falling back to "not in Library".
- The layer removes cleanly through the registry and rebuilds `main` byte for byte; registry QA passes.
- **One full suite, first time:** 5,511 plus the new checks; then the layer removed rebuilding `main` exactly and the
  retained suite.
- After the owner's word to merge: deployed bytes, the new checks and Search 62/62 live; then one combined checklist doc
  with Pass/Fail dropdowns (memory `device-check-workflow`). Ask the owner to open the app twice first (memory
  `device-check-stale-version`).

## Records: keep them short

Full detail only in the layer's README. Elsewhere: one ledger entry at the top with its cost table, the roadmap's
status row 13 and a short amendment, one pointer in `CLAUDE.md` (8 deliberate CR bytes: count with Python, or append).
No `BUILD-LEDGER.html` (a records session brings it up to date). Keep every record file's CR bytes.

## Lessons (do not relearn them)

- Run the full suite on mains power with the screen kept awake; on battery in standby Cycle 2's first run failed four
  correct checks.
- Long conversations are expensive: every turn re-reads the whole conversation, and loading a new tool part-way forces
  a full re-read (a 390K-token session spent about 4 weekly points on two short answers). Hand off early.
- Start reading-heavy work just after a 5-hour reset; batch reads into one script; save results to durable files early.
- Write scripts to files; heredocs drop backslashes. Python's `write_text()` writes CRLF on Windows: use
  `write_bytes(text.encode('utf-8'))`.
- A switch that is declared but never read is not a switch; prove each one turns its checks red.
- Do not time-test while anything else runs browsers; a guard check must establish its own premise.
- Run every harness that touches the same public functions before committing.

## First steps

1. Remote Control, keep-awake, meter reading; check the 5-hour window.
2. The worktree and branch from `origin/main`; check the build hash.
3. Read by section (above), and the v2 boards the first release needs.
4. Measure: what the desk check already gives for the 16 PDFs; the renderer and its size; Safari's storage on the
   iPhone (plan the device test).
5. Propose the releases with estimates, a stop line and a cap; wait for the owner's choice.
6. Build the chosen release; focused checks, variants and removal proof; the code review; the full suite; records;
   report and wait for the word to merge; the live check and the checklist.
