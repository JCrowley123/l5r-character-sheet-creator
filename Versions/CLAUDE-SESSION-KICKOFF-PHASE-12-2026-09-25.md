# Claude session kickoff: continuing Phase 12 (Play and Management modes)

Prepared 25 September 2026 at the end of the desktop session that built Phase 12 parts 1 to 4, the
shared removal chain and BUGFIX — Apply School Skill Rows. It supersedes
`CLAUDE-SESSION-KICKOFF-NEXT-PHASE-2026-09-25.md` (whose proposal has now been carried out). A
ChatGPT/Codex version with the same content is `GPT-SESSION-KICKOFF-PHASE-12-2026-09-25.md`.

You have no access to the previous conversation. Everything below is a snapshot; **the committed
records win where they disagree with it**, and the last several sessions each found something here
or in the records stale. Measure before trusting.

**The project:** the L5R 4th Edition character sheet, one self-contained HTML file built from split
source fragments. Repo `JCrowley123/l5r-character-sheet-creator`, deployed from `main` to
https://l5r-character-sheet-creator.pages.dev/ by Cloudflare Pages. A **player companion, like D&D
Beyond**: not a VTT, GM tracker or combat engine. The owner tests on an iPhone (Safari and the
installed web app) and a laptop, and works from a Windows desktop and from cloud sessions.

**`git pull` first. Never force-push, never rewrite history, merge to `main` only when the owner
asks.** Every branch push gets a Cloudflare preview at
`https://<branch-name-with-slashes-as-hyphens, cut to 28 characters>.l5r-character-sheet-creator.pages.dev/`
(for example `claude-phase-12-part-4-2026` for `claude/phase-12-part-4-2026-09-25`). The owner tests
there before a merge.

=============================================================================
READ THESE FIRST
=============================================================================
1. `Versions/CLAUDE.md`, in full: the conventions, the surgical-removability contract, "Working style
   the user expects", the folder map (Part K, BUGFIX and QA entries added 25 September), and the
   notes on running the harnesses **on the Windows desktop**.
2. `Versions/BUILD-LEDGER.md`: "Open reminders", the current and previous updates of 25 September,
   and "What each phase has cost".
3. `Versions/L5R Character Sheet Phased Roadmap reorder.md`: Process Requirements, Recommended Build
   Order, Status Overview, and the **Phase 12** section with the owner's rulings.
4. `Versions/PART K — Phase 12 Play and Management Modes Audit/AUDIT.md`: every control on all ten
   tabs, classified. **The plan for the remaining parts is in it.**
5. The four built parts' READMEs: `PART K — Phase 12 Play and Management Modes` (part 1, the
   machinery), `12.1 … Clan and School`, `12.2 … Identity`, `12.3 … Rings and Traits`.
6. `Versions/QA — Removal Chain Registry/README.md`: how every new release registers itself.

=============================================================================
WHERE THINGS STAND: end of 25 September 2026
=============================================================================
**On `main` (commit `6184ee5` or later) and confirmed on the owner's iPhone:**
- **Phase 12 parts 1 to 4** — Play and Management modes. A "Manage / Done" button beside the
  character's name. Play locks Background, Clan & School, Identity (except Honor/Glory/Status points
  and Taint) and Rings & Traits (except the Void Point pips). Build `f3174bba…`, 3,089,890 bytes;
  combined suite **2,544/2,544** on the Windows desktop.
- **BUGFIX — Apply School Skill Rows** — every "Lore: X" / "Craft: X" / "Perform: X" / "Games: X"
  School Skill was added with no Trait (69 of 104 Schools); plus Theology/War Fans and the Tsi,
  Kasuga and Jurojin placeholder rows.
- **QA — Removal Chain Registry** — one list replaces the hand-kept `LATER_STAGES` lists. A new
  release adds one `Release(...)` line at the end of `CHAIN` in `removal_chain.py`.

**Part 5 (Skills) was built straight after this file was written**, on branch
`claude/phase-12-part-5-2026-09-25` (build `4ac2b09f…`, 17/17 own checks, combined 2,561/2,561, 6/6 variants, removal
byte-identical to part 4). **The owner confirmed it on the iPhone and it was merged to `main`** on 25 September. Usage was
**94%** after it. Next is **part 6, Advantages & Disadvantages**.

**Usage:** 93% of the week when this file was written; the week resets **Wednesday 30 September at
02:00**. Ask the owner for the current reading before planning. This session's measured costs (the
owner's readings): assessment 2%; removal chain + Apply School fix + audit 6%; Phase 12 part 1 2%,
part 2 1%, part 3 1%, part 4 2%. **A Phase 12 tab part costs 1–2%**; the ones with dynamic rows
(Skills, Advantages & Disadvantages) are expected to cost more.

=============================================================================
THE OWNER'S RULINGS OF 25 SEPTEMBER (all recorded in the ledger and roadmap)
=============================================================================
- **Default mode:** Play when a character is opened from the Characters list or finished in the
  wizard; Management otherwise (blank sheet, the old toolbar's Load / New / Import, and while the
  wizard runs). **The mode is never saved into the character.** The toolbar-Load-opens-in-Management
  inconsistency is known and accepted until the toolbar is replaced (a later part).
- **Tabs the roadmap left out:** Clan & School read-only in Play; Rings & Traits read-and-roll in
  Play; Spell Slots fully usable in both.
- **In-play Advantage controls stay live in Play** (Use, Reset, invoke, session toggles). On Adv &
  Disadv "read only" means no add, remove or configure.
- **"Inert":** every user event on a Management control is stopped in Play (typing, tapping, a
  script's `.click()` or dispatched event); the sheet's own code writing values keeps working.
- **Honor, Glory, Status points and Taint** editable in Play; their ranks Management-only.
- **Toggle:** a small "Manage" button beside the name, "Done" in Management. **Management-only
  fields in Play** show their value as plain text, in place.
- **Phase 12 is built one part per tab**, each on its own branch, tested by the owner on the
  preview, merged only on request. **Stop after each part and report**; never chain parts.
- **Existing saves (Apply School fix):** blank Traits filled where the family makes it clear;
  placeholder rows left for the player to delete.
- **Import/Export findings** (an older save keeps its older format until opened; the sheet writes
  format 3 while `SHEET_SCHEMA_VERSION` says 2) belong to **Phase 7**. Accented export file names get
  fixed **with the next change to export**, not on their own.
- **D06 Weakness and Hotei** (the unbuilt rest of Phase 4.5) come **after Phase 12's first build
  stage**, i.e. they are available now; ask before starting.
- **The ledger artifact** was deliberately **not republished** all session, at the owner's
  instruction. Republish it only when asked.

=============================================================================
HOW A PHASE 12 PART IS BUILT (the pattern parts 2 to 4 followed)
=============================================================================
Part 1's `MODES12` (fragment `209.9996-feat-play-management-modes.js`) owns the mode, the toggle,
**one capture-phase gate**, read-only locking that records what it changed, a MutationObserver that
locks new matches, and **`MODES12.register(selector)`**. **A tab part is only a registration:**

1. A new folder `Versions/PART K — Phase 12.N Play Mode <Tab>/` (flat at top level, like every Part K
   folder; the Part K wrapper is still deferred).
2. A fragment `src/sheet/209.9999x-feat-modes-<tab>.js` with marker `PART K PHASE 12.N`, a kill
   switch `MODES12N_ENABLED`, a `MODES12N` object holding the selector, and a guarded
   `MODES12.register(...)`. Keep anything that must stay live **out** of the selector.
3. A stylesheet `src/css/59.999x-feat-modes-<tab>.css` if the tab needs a Play look part 1 lacks
   (part 1 styles locked text/number inputs; a locked `select` or anything with inline styles needs
   its own rule). **Numbered below `60-sheet-print.css`, which must stay last.**
4. One seam block in `210-test-seam-and-init.js` after the previous part's
   (`// PART K PHASE 12.N BEGIN <slug>` … `// END MODES12N <slug>`), manifest entries after the
   previous part's, and **one line in the removal chain**.
5. QA files generated from the previous part's (`remove-phase.py`, `test-removal.py`,
   `verify-variants.py`, `current-suite-runner.js` chaining the previous part's runner) plus a new
   harness. **Substitute full file names first**, then shorter tokens: part 3's generator garbled
   the file numbers by doing it the other way round, and part 4's stopped halfway (finish with a
   separate script that asserts each shared edit exists exactly once; never re-run a half-applied
   generator).
6. Rebuild (`build/recombine.py`), set `expect_sha256`, `--verify`. Prove removal byte-identical to
   the previous part's build in a scratch copy. Run the harness on the new **and previous** builds.
   Discover variants, **look for checks no variant turns red** (every part has found one), add
   variants for them, pin. Run the full suite **detached** (it takes about 25 minutes; longer than a
   tool call may run). Update README, ROLLBACK, part 1's ROLLBACK "Dependants", the ledger (md and
   html), the roadmap row and `CLAUDE.md`. Commit, push the branch, wait for the preview, **stop**.

**Traps already hit:** a MutationObserver that also writes DOM text loops forever (part 1); the
carousel **clones the first and last pages** (Clan & School, Background) with their IDs; a field on a
hidden carousel page cannot take focus, so a harness must `goToTab` first; firing `change` on the Clan
picker rebuilds the School list; `refreshMultipleSchoolsUI()` re-sets + Add School's `disabled` on
every recalc; the Ring boxes carry inline styles.

=============================================================================
WHAT IS LEFT
=============================================================================
**Phase 12 parts** (per the audit):
- **5 Skills** (in progress, see above). Lock the name/trait/rank/school/emphasis/remove controls and
  the add pickers; keep `.sk-roll`, `#btnUntrainedSkills` and `.sk-info-btn` live.
- **6 Advantages & Disadvantages**, including the configured-entry controls: 8 classes are
  Management (`.adv-config-btn`, `.named4513-input`, `.court4514-input/-add/-remove`, `.hv4516-input`,
  `.dep458-input`, `.wealth4517-btn`), 9 stay live (`.adv-config-spend-luck`, `.adv-config-reset-session`,
  `.court4514-session-box`, `.fb4521-hotei-roll`, `.dp4523-use`, `.dp4523-reroll`, `.unlucky-btn`,
  `.unlucky-invoke`, `.realm4510-check`). Render each configured entry in the harness; the audit read
  them from source only.
- **7 Techniques** (and spells: `.spell-memo-checkbox` Management; `.spell-cast-btn` and
  `.spell-scroll-add-btn` live).
- **8 Combat hidden in Management** — through the carousel's visibility path, which has had two bugs
  (one Safari-only); use the Safari emulation rule from `BUGFIX — Spell Slots Tab on Safari`, and a
  device check.
- **9 The old toolbar replaced**, Save As from Management, and the toolbar-Load mode question.
- Cosmetic, noted: the Clan & School tab's "Pick your Clan… then apply each" text still shows in Play.

**Open reminders** (full list in the ledger): D06 Weakness and Hotei; the two Import/Export findings
(Phase 7); accented export names; wizard feedback (remove an XP-bought Skill with a refund; ⓘ info
buttons, Phase 15); "do starting spells begin memorised?"; the Rank 0 Skill-table exploding-10s bug
(parked until the next dice change); the two Seven Fortunes' Blessing reviews; the parked A01–A16
device-pass backlog; the deferred Part I and Part K wrapper folders; Phase 0.7's Android device
tests.

=============================================================================
RUNNING THE TESTS
=============================================================================
- **Cloud sandbox:** `NODE_PATH=/opt/node22/lib/node_modules`.
- **Windows desktop** (from 25 September): Node 24.19.0; Playwright 1.63.0 and Chromium in
  `C:\Users\jcrow\l5r-qa-tools`. Use `NODE_PATH='C:\Users\jcrow\l5r-qa-tools\node_modules'`,
  `PLAYWRIGHT_BROWSERS_PATH='C:\Users\jcrow\l5r-qa-tools\ms-playwright'`, `PYTHONUTF8=1`, and in Git
  Bash `PATH="/c/Program Files/nodejs:$PATH"`. The desktop's Python cannot see `AppData\Roaming`,
  which is why the tooling lives there. Symlink fixtures skip on Windows.
- **Combined suite:** `node "Versions/<newest release>/qa/current-suite-runner.js" <built html>`. A
  0/0 result is a failure. Currently the newest runner is part 4's (or part 5's, if merged).
- Two stashes exist in the desktop repo: an old superseded "4.5.14 Servant Reference" attempt and an
  older A01–A16 draft. Both superseded; leave them.

=============================================================================
WHAT THE OWNER WANTS FIRST IN A NEW SESSION
=============================================================================
1. Confirm the state: `main`, the live build, Part 5's branch, the suite count. Report anything in
   this file that is now wrong.
2. Ask for the current usage reading.
3. Continue Phase 12 one part at a time, stopping after each for the owner's iPhone test, unless the
   owner chooses otherwise.

=============================================================================
CLAUDE-SPECIFIC NOTES
=============================================================================
- The ledger artifact is https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk, published from
  `Versions/BUILD-LEDGER.html`. It is behind the file; republish only when the owner asks.
- Report usage as the owner's reading; exact token counts are not available to a session. Never
  estimate or invent them.
- The owner wants proposals challenged, not adopted: say what you checked.
