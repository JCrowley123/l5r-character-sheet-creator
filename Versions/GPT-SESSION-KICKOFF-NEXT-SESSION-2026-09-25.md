# ChatGPT / Codex session kickoff: the next session (after Phase 12 Techniques and the project estimate)

Prepared 25 September 2026, evening, at the end of a Claude desktop session. That session built the
shared removal chain, BUGFIX — Apply School Skill Rows, the Phase 12 audit, Phase 12 parts 1 to 5
and Techniques (12.6), and wrote the project-length estimate into the ledgers. This file
**supersedes** `GPT-SESSION-KICKOFF-PHASE-12-2026-09-25.md`. The same content for Claude is in
`CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-09-25.md`. The project's rules are the same whichever
assistant does the work.

You have no access to the previous conversation. Everything below is a snapshot. **Where it
disagrees with the committed records, the records win**, and every recent session has found
something in a handoff or a record that was stale. Measure before you trust it.

**The project:** the L5R 4th Edition character sheet, one self-contained HTML file built from split
source fragments. The repo is `JCrowley123/l5r-character-sheet-creator`, and Cloudflare Pages deploys
`main` to https://l5r-character-sheet-creator.pages.dev/. It is a **player companion, like D&D
Beyond**: not a VTT, a GM tracker or a combat engine. The owner:
- tests on an iPhone (Safari and the installed web app) and on a laptop;
- works from a Windows desktop and from cloud sessions driven from the iPhone.

**Git rules:**
- `git pull` first.
- Never force-push and never rewrite history.
- Merge to `main` only when the owner asks.
- Every branch push gets a Cloudflare preview at
  `https://<branch name, slashes as hyphens, cut to 28 characters>.l5r-character-sheet-creator.pages.dev/`,
  for example `claude-phase-12-part-7-2026` for `claude/phase-12-part-7-2026-09-25`. The owner tests
  there before a merge.

=============================================================================
YOUR FIRST JOB: AN INDEPENDENT ASSESSMENT, BEFORE ANY CODE
=============================================================================
The owner wants **your own view**, not this file's view repeated back. Before writing any code:

1. **Confirm the state.** Check `main`, the live build hash, and the combined suite count (see
   "Where things stand"). Report anything in this file that is now wrong.
2. **Ask for the current usage reading.** The owner reads it from their allowance meter. Plan
   against that reading, not against the figure in this file.
3. **Do your own cost and roadmap assessment:**
   - Read the ledger's cost table and its project-length estimate. It is **labelled as an
     estimate**; re-derive it rather than quoting it.
   - Read the roadmap's Recommended Build Order and Status Overview, and the open reminders.
   - Decide for yourself what should be built next, and what it would cost.
4. **Compare your conclusion with the proposal below, point by point.** Where you agree, say so
   briefly. Where you differ, give your reasons, and say **what you measured or read** that led you
   there. The owner explicitly wants proposals challenged, not adopted.
5. **Wait for the owner to confirm before building anything.**

=============================================================================
READ THESE FIRST
=============================================================================
1. **`Versions/CLAUDE.md`, in full.** It covers:
   - the conventions and the surgical-removability contract;
   - "Working style the user expects";
   - the folder map, including the Part K, BUGFIX and QA entries;
   - the notes on running the harnesses on the Windows desktop.
2. **`Versions/BUILD-LEDGER.md`.** Read these parts:
   - "Current update — 25 September 2026: projected length of the project (an estimate)";
   - the Phase 12 updates below it;
   - "Open reminders";
   - "What each phase has cost".
3. **`Versions/L5R Character Sheet Phased Roadmap reorder.md`.** Read Process Requirements,
   Recommended Build Order, the Status Overview, and the Phase 12 section with the owner's rulings.
4. **`Versions/PART K — Phase 12 Play and Management Modes Audit/AUDIT.md`.** It classifies every
   control on all ten tabs. The plan for the rest of Phase 12 is in it.
5. **The Phase 12 part READMEs.** `PART K — Phase 12 Play and Management Modes` is part 1, the
   machinery. Then 12.1 Clan and School, 12.2 Identity, 12.3 Rings and Traits, 12.4 Skills and 12.6
   Techniques.
6. **`Versions/QA — Removal Chain Registry/README.md`.** It explains how every new release registers
   itself.

=============================================================================
WHERE THINGS STAND (evening of 25 September 2026)
=============================================================================
**On `main`, all confirmed on the owner's iPhone:**
- Phase 12 parts 1 to 5 and Techniques.
- The build is `7f187450905c96500f16015a3ffe0250d2a9ca49e24d882252a93061e3fc4ff0`, 3,095,845 bytes.
- The combined suite passes **2,577/2,577** on the Windows desktop.
- `main` was at `455bdd9` before the ledger branch below.

**The ledger branch.** Branch `claude/ledger-estimate-and-handoff-2026-09-25` adds the
project-length estimate to both ledgers, and adds this file and its ChatGPT twin. Check the ledger
to see whether it was merged.

**The ledger artifact** (https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk) was republished from
`Versions/BUILD-LEDGER.html` at the owner's request. Its share link may show viewers a pinned
earlier version; the owner controls that from the page's Share menu.

**Play and Management modes today.** A "Manage / Done" button sits beside the character's name.
Play locks:
- Background;
- Clan & School;
- Identity, except Honor, Glory and Status points and Taint;
- Rings & Traits, except the Void Point pips;
- Skills, except rolling and the info buttons;
- Techniques, except Cast and adding a scroll.

**Usage: 96% of this week** by the owner's reading at the time of writing. The week resets
**Wednesday 30 September at 02:00**. Measured costs this week (the owner's readings):

| Work | Cost |
|---|---|
| The assessment | 2% |
| Removal chain, Apply School fix and the Phase 12 audit | 6% |
| Recording rulings and merges | 2% |
| Phase 12 part 1 | 2% |
| Phase 12 parts 2 and 3 | 1% each |
| Phase 12 part 4 | 2% |
| Handoff files plus part 5 | 1% |
| Techniques | 1% |
| The estimate and the ledger wrap-up | 1% |

**A Phase 12 tab part costs 1–2%.** So far, parts 1 to 5 plus Techniques have cost 8%, against the
audit's 6–9% estimate for the same ground. The audit's estimate for the whole phase is about 17–27%.

=============================================================================
THE PROJECT-LENGTH ESTIMATE (an estimate, recorded in both ledgers)
=============================================================================
- **About 3 more weeks of the weekly allowance (range 2–4).**
- **Roughly 4–6 weeks of calendar time.** Source-gated work, desktop sessions and iPhone checks move
  at the owner's pace, not the allowance's.
- **Pace:** releases now cost about 1–4% each, against 4–18% in mid-September, because new work
  reuses existing machinery.
- **Where the risk sits:** mostly in the sourcebook-dependent phases (4.6, 4.7, 4.8, 6, 13), not in
  the engineering. Staging the book extracts early helps the timeline most.
- **Left out:** Phase 10 (Equipment), which is not scoped.

The per-item table is in the ledger. **Treat all of it as one input, and re-derive it.**

=============================================================================
THE PREVIOUS SESSION'S PROPOSAL (challenge it, don't just adopt it)
=============================================================================
**Recommended next: finish Phase 12, one part per tab, as before.**

**1. Phase 12.5 — Advantages & Disadvantages in Play.** This is the last and largest tab part.
Estimated **2–4%**: more than the 1–2% of earlier parts, because the harness must render every
configured entry rather than one row type.

- **Lock in Play (Management-only):**
  - the trunk rows and pickers: `#advQuickAdd`, `#disadvQuickAdd`, `#addAdv`, `#addDisadv`, and per
    row `.en-name`, `.en-cost`, `.en-desc`, `.rm-btn`;
  - the 8 configured-entry Management classes: `.adv-config-btn`, `.named4513-input`,
    `.court4514-input`, `.court4514-add`, `.court4514-remove`, `.hv4516-input`, `.dep458-input` and
    `.wealth4517-btn`.
- **Keep live (the 9 Play classes):** `.adv-config-spend-luck`, `.adv-config-reset-session`,
  `.court4514-session-box`, `.fb4521-hotei-roll`, `.dp4523-use`, `.dp4523-reroll`, `.unlucky-btn`,
  `.unlucky-invoke` and `.realm4510-check`. Also keep every info button live.
- **Scope the selectors to `#advList` and `#disadvList`.** Techniques uses the same `.entry` /
  `.en-*` classes, and 12.6 is scoped to `#techList`. Its harness already asserts that it does not
  reach Advantage rows; 12.5 needs the mirror check.
- **Render every configured entry in the harness.** The audit read these entries from source only.
  Also watch for rows whose content is replaced wholesale: Phase 4.5.2's D45 rows clear
  `row.innerHTML` on refresh. The part 1 MutationObserver should re-lock the new nodes, but prove it.
- **Split if the numbers say so.** The owner's rule is one part per tab. If the first measurements
  show the configured entries need per-entry CSS or fixes, propose a split (trunk rows first,
  configured entries second) rather than letting one part run long.

**2. Phase 12.7 — Combat hidden in Management.** Estimated **2–4%**.
- It goes through the carousel's own visibility path (`data-visible-with` / `refreshVisibility()`).
  That path has had two bugs, one Safari-only.
- Use the Safari emulation rule from `BUGFIX — Spell Slots Tab on Safari`, and ask for a device
  check.

**3. Phase 12.8 — replace the old toolbar, and add Save As from Management.** Estimated **3–5%**.
- This also settles the known inconsistency: a toolbar Load opens in Management.
- Ten retained harnesses drive `#charSelect` and `#btnLoad`, so those IDs must stay in the page even
  when hidden.

**Timing.** With the week at 96%, none of these should *start* before the reset unless the owner
chooses otherwise. Running out partway through a part is what the owner asked to avoid.

**The owner can do these in parallel, with no code:**
- **Test "🖨 Print / Export PDF" on iOS**, in Safari and in the installed web app. If the existing
  Print button already produces a usable PDF, Phase 11.1 costs about 3%; if it doesn't, 11.1 needs a
  PDF approach, closer to 15%.
- **Stage sourcebook extracts.** Ancestors (4.8, which the owner already has) comes first. Then
  School flavour text (Phase 9), Alternate Paths and Advanced Schools (4.6, 4.7), technique rules
  text (Phase 6), and the Jigoku and Hotei facts.

**After Phase 12, in this order:**
1. **Phase 11.1**, Export to PDF, sized by the iOS test above.
2. **Phase 7**, Data Integrity & Persistence. It includes:
   - the two Import/Export findings (an older save keeps its older format until opened; saves are
     format 3 while `SHEET_SCHEMA_VERSION` says 2);
   - the accented export file names, which the owner ruled get fixed with the next change to export;
   - the audit log, **descoped unless the owner wants it**. That is the largest saving available.
3. **D06 Weakness and Hotei**, the rest of Phase 4.5. Both need owner rulings; D06 is new machinery
   that touches every Trait.
4. **The source-gated phases, as extracts arrive:** 4.8, 4.6, 4.7, Phase 9's flavour text, Phase 6,
   then 13 and 14.
5. **Phase 15**, the UI Consistency Pass, **last by design**. The parked UI feedback goes in it.

**Why not follow the roadmap's order literally?** The next phase in the roadmap's order is Phase 6,
and it is still source-blocked: of 338 technique names, 98 have no description, and the other 240
are paraphrases. Phases 5, 8, 11 and 12 were all built ahead of it for that reason.

=============================================================================
THE OWNER'S STANDING RULINGS (recorded in the ledger and roadmap)
=============================================================================
- **Default mode.** A character opens in Play from the Characters list or when the wizard finishes.
  Everywhere else it opens in Management: a blank sheet, the old toolbar's Load, New and Import, and
  while the wizard runs. **The mode is never saved into the character.**
- **Clan & School** are read-only in Play; **Rings & Traits** are read-and-roll; **Spell Slots** are
  fully usable in both modes.
- **In-play Advantage controls stay live in Play.** On Advantages & Disadvantages, "read only" means
  no add, remove or configure.
- **"Inert"** means every user event on a Management control is stopped in Play. The sheet's own code
  writing values keeps working.
- **Honor, Glory and Status points and Taint** stay editable in Play; their ranks are
  Management-only.
- **The toggle** is a small "Manage" button beside the name, reading "Done" in Management. A
  Management-only field in Play shows its value as plain text, in place.
- **Phase 12 is built one part per tab**, each on its own branch and tested on the preview.
  - **Stop after each part and report.** Never chain parts.
  - After each part the owner gives a usage reading. Update both ledgers, merge when asked, and
    assess whether the next part fits the week.
- **Existing saves (Apply School fix):** blank Traits are filled where the family makes it clear;
  placeholder rows are left for the player to delete.
- **The Import/Export findings go to Phase 7.** Accented export names are fixed with the next change
  to export.
- **D06 Weakness and Hotei** are available now. Ask before starting either.

=============================================================================
HOW A PHASE 12 PART IS BUILT
=============================================================================
Part 1's `MODES12` (fragment `209.9996-feat-play-management-modes.js`) owns:
- the mode and the toggle;
- **one capture-phase gate**, on `click`, `input`, `change`, `beforeinput`, `keydown`, `paste`,
  `drop` and `cut`;
- read-only or disabled locking, recorded in `data-pm12-locked`;
- a MutationObserver that only locks new matches;
- **`MODES12.register(selector)`**.

**A tab part is mostly a registration.** Techniques (12.6) is the newest worked example. The steps:

1. **Folder.** Create `Versions/PART K — Phase 12.N Play Mode <Tab>/`, flat at the top level. The
   Part K wrapper is still deferred.
2. **Fragment.** Create `src/sheet/209.9999x-feat-modes-<tab>.js`, numbered after 12.6's
   `209.99992`. It holds:
   - the marker `PART K PHASE 12.N`;
   - a kill switch `MODES12N_ENABLED`;
   - a `MODES12N` object holding the selector;
   - a guarded `MODES12.register(...)`.
3. **Stylesheet, if needed.** Add `src/css/59.999x-feat-modes-<tab>.css`, after 12.6's `59.9993` and
   below `60-sheet-print.css`, which must stay last. Tab CSS can outrank part 1's generic hide rule:
   the Skills table's did. Use ID-scoped `!important` rules in the part's own file.
4. **Shared edits:**
   - one seam block in `210-test-seam-and-init.js`, after the previous part's
     (`// PART K PHASE 12.N BEGIN <slug>` … `// END MODES12N <slug>`);
   - manifest entries after the previous part's;
   - **one `Release(...)` line in `removal_chain.py`**.
5. **QA files.** Generate them from the previous part's: `remove-phase.py`, `test-removal.py`,
   `verify-variants.py`, and `current-suite-runner.js` chained to the previous part's runner. Add a
   new harness.
   - **Compute everything in memory before writing.**
   - **Substitute full file names before shorter tokens.**
   - Never re-run a half-applied generator.
6. **Verify:**
   - rebuild with `build/recombine.py`, set `expect_sha256`, and run `--verify`;
   - prove removal byte-identical to the previous build, in a scratch copy;
   - run the harness on the new build **and** the previous one;
   - write variants, **look for checks no variant turns red** (every part has found one), add
     variants for those, and pin them;
   - run the full suite **detached**; it takes about 25 minutes.
7. **Records.** Update the README, the ROLLBACK, part 1's ROLLBACK "Dependants" list, both ledgers,
   the roadmap row and `CLAUDE.md`. Commit, push the branch, wait for the preview, then **stop**.

**Traps already hit:**
- A MutationObserver that also writes DOM text loops forever.
- The carousel **clones the first and last pages**, IDs and all.
- A field on a hidden carousel page cannot take focus, so call `goToTab` first.
- Firing `change` on the Clan picker rebuilds the School list.
- Apply School is asynchronous. Wait for its "Applied …" status.
- A check whose Add and Remove cancel out in a count can never fail. Measure each against the count
  just before its own click.
- **Marker-shaped prose in a comment** ("the Techniques part of Phase 12") is read as a real marker,
  because `MARKER_RE` is case-insensitive. Write "Phase 12's Techniques tab".
- `#f_school` is a display that recalc rewrites. Drive the underlying state instead.

=============================================================================
OPEN REMINDERS (the full list is in the ledger)
=============================================================================
- **D06 Weakness and Hotei.**
- **Phase 7 findings:** the two Import/Export findings, and accented export names.
- **Wizard feedback:** removing an XP-bought Skill with a refund; ⓘ info buttons, for Phase 15.
- **"Do starting spells begin memorised?"**, which needs the rulebook text.
- **The Rank 0 Skill-table exploding-10s bug**, parked until the next change to dice rolling.
- **The two Seven Fortunes' Blessing reviews**, and the parked A01–A16 device-pass backlog.
- **Cosmetic:** the Clan & School tab's "Pick your Clan… then apply each" hint still shows in Play.
- **The deferred Part I and Part K wrapper folders.**
- **Phase 0.7's seven Android device tests.**

=============================================================================
RUNNING THE TESTS
=============================================================================
- **Cloud sandbox:** set `NODE_PATH=/opt/node22/lib/node_modules`.
- **Windows desktop:**
  - Node is 24.19.0. Playwright 1.63.0 and Chromium live in `C:\Users\jcrow\l5r-qa-tools`, because
    the desktop's Python cannot see `AppData`.
  - Set `NODE_PATH='C:\Users\jcrow\l5r-qa-tools\node_modules'`,
    `PLAYWRIGHT_BROWSERS_PATH='C:\Users\jcrow\l5r-qa-tools\ms-playwright'` and `PYTHONUTF8=1`.
  - In Git Bash, also set `PATH="/c/Program Files/nodejs:$PATH"`.
  - Symlink fixtures skip on Windows.
- **Combined suite:**
  `node "Versions/PART K — Phase 12.6 Play Mode Techniques/qa/current-suite-runner.js" <built html>`
  is the newest runner. **A 0/0 result is a failure.**
- **Deploy check:** run `python build.py --check-drift` after any source edit.
- Two old stashes in the desktop repo are superseded. Leave them.

=============================================================================
NOTES FOR A CHATGPT / CODEX SESSION
=============================================================================
- **`Versions/CLAUDE.md` is the project's rulebook for every assistant**, not only Claude. Follow it
  exactly:
  - the folder convention;
  - surgical removal, delimited markers and kill switches;
  - harnesses that are proven able to fail;
  - byte-identical removal;
  - one commit per release.
- **You cannot publish the Claude ledger artifact.** Update `BUILD-LEDGER.md` and
  `BUILD-LEDGER.html` in the repository. The owner or a Claude session republishes the artifact.
- **Commit attribution:** use your own tool's attribution, not Claude's. Commit messages name the
  release, as the history shows.
- **Cost reporting:** report the owner's reading of their allowance. Codex exposes no per-release
  meter. The one earlier Codex release (Phase 4.5.13) was recorded as "unavailable" rather than
  estimated; do the same.
- **The branch prefix** for the Cloudflare preview can be your own (for example `codex/…`). The
  preview name is still the branch name, slashes as hyphens, cut to 28 characters.
- **Do not trust this file over the repository.** If `main` has moved, re-read the ledger's current
  update first.
- **Say what you checked.** The owner wants proposals challenged, not adopted.
