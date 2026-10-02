# Claude — next-session kickoff (2 October 2026)

Written at the end of the 1–2 October laptop session. Phase 4.6 Alternate Paths was finished in that
session: three releases, each confirmed on the iPhone. The roadmap was then reassessed. This file
replaces the 1 October kickoff for planning. It does not override any of the owner's rulings.

The project is the L5R 4E single-player character sheet. It is not a VTT, a GM tracker or a combat
engine. **Start with your own assessment, not with building.** Nothing in this file approves a build.

## Your first response

1. What is complete and what remains. Note any place where the source, the ledger and the roadmap
   disagree.
2. **Your own assessment of cost and of the remaining roadmap.** Give the relative effort, your
   confidence, the dependencies and the blockers (sources, rulings, devices). Give the evidence for
   each. Reach your own conclusions; do not take this file's.
3. The phase you propose next, its smallest useful first release, and what that release leaves out.
4. **Each point where your proposal differs from the one below.** For each, give:
   - the old proposal;
   - your alternative and why it is better;
   - the evidence;
   - the cost and QA trade-offs;
   - any ruling it needs.

   If you agree with the proposal, say why in your own words. Do not just endorse it.
5. For that release: the acceptance tests, the removal proof, the device checks, and a usage reading
   before and after.
6. What you need from the owner before building: any rulings, and, if you are in a cloud session,
   the pages to photograph (both printed and PDF page numbers). On the laptop you can read the PDFs
   yourself.

Then ask the owner to approve the specific build. If their message already approves exactly that
scope, don't ask again. Still report your assessment and any deviation first.

## What to read (selectively, but read completely the parts that matter)

- **`Versions/CLAUDE.md`:**
  - the standing rules (surgical removability, marker blocks, never a phase name in marker order in
    prose);
  - the 2 October and 1 October sections at the end;
  - the folder-map entry for Phase 4.6 (it records the defect below).
- **`Versions/BUILD-LEDGER.md`:**
  - the 2 October update;
  - **Open reminders** (the Toku Bushi finding is first);
  - this week's rows in the cost history.

  Check that `BUILD-LEDGER.html` agrees with it. The HTML file is the source of the published
  artifact https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk, refreshed 2 October.
- **`Versions/L5R Character Sheet Phased Roadmap reorder.md`:**
  - the process requirements, build order and status table;
  - Phase 6 and its Engineering Scope;
  - Phases 4.7, 4.5 (D06/Hotei), 11.1 and 13–15;
  - **Deferred and declined**;
  - the dated amendments at the end. The last is **"Reassessment after Phase 4.6 — 2 October 2026"**;
    it gives the evidence and the proposed order.
- **`Versions/SOURCEBOOK INDEX — Page Map/INDEX.md`:**
  - "Techniques with no description in the sheet — Phase 6, Hotei". Its seven "not found" rows have
    now been found (see "Proposal to challenge").
  - "Advanced Schools — Phase 4.7".
  - Its README gives the offsets between printed and PDF pages. For the Core Rulebook, the PDF page
    is the printed page + 3.
- **The nearest precedent, `Versions/PART I — Phase 4.6 Alternate Paths/`:** README, AUDIT.md,
  ROLLBACK.md and `qa/`. It is a content phase written from the PDFs on the laptop, with its own load
  check.
- **Only then, the source the candidate touches**, all under Phase 0's `src/sheet/`:
  - `070-schools-paths-techniques.js`, which holds `TECH_DESCRIPTIONS`, `ALL_SCHOOL_TECHNIQUES`
    and `techniqueDescription()`;
  - Phase 4.6's fragment `209.999993-feat-alternate-paths.js`;
  - its seam block in `210-test-seam-and-init.js`.

## State at handoff

**Main and the build**

- `main` is the 2 October ledger commit, which comes after `69e328e`.
- The live build is Phase 0's `l5r-character-sheet.html`: **3,432,964 bytes, SHA-256
  `aa5c55d9…3b9cdb`**. This was checked on 2 October with `python build.py --check-drift`. Check it
  again yourself rather than trusting this file.
- The full test runner is `Versions/PART I — Phase 4.6 Alternate Paths/qa/current-suite-runner.js`.
  It chains all the earlier runners. Its last result on that build was **3,619/3,619**, on 1 October.
  That result is historical: the suite was not run again on 2 October.

**What is complete**

- Phase 12, all parts.
- Phase 4.8.
- Phase 4.6: 214 Paths. 175 of them can be taken and 39 are recorded only. The iPhone checks passed
  19/19, 21/21 and 13/13.
- Phase 7's first release, confirmed 6/6. Its audit log is to be done later, by the owner's ruling.

The only device checks still owed are Phase 0.7's seven Android checks (0 of 7 done). The owner has
no Android phone, and each checklist carries these checks as optional.

**The open defect**

Two Techniques share the name "Forge Your Own Fate":

- the Book of Air's Master of Games, a ronin Path that is recorded only (p. 180);
- the Toku Bushi's Rank 4 Technique (Core Rulebook p. 222), which has no description.

Phase 4.6 checks a new Technique's name only against Techniques that already have a description.
So a Toku Bushi now shows the Master of Games' text: a Social bonus, in place of a Technique that
makes an opponent drop their two highest damage dice. It is the only such case. It was checked
against every School Technique on the live site. It is not yet fixed: a code change needs the
owner's approval.

**Deferred by the owner: do not build these without a new instruction**

- A used once-a-session Ancestor gift should not be offered.
- The first Manage tap is slow, and the Advantage windows still use the older gold "i" (both
  Phase 15).
- The Clan & School page may be cluttered (Phase 15).
- A lost-favour Ancestor should be editable in Management (end of the project).
- Review how Glory, Status and Honour work and are calculated (end of the project). Phase 4.6's
  Honor requirements read the Honor block's Rank field, as the owner ruled.

**Parked ideas, to review once the app is complete**

- *Manage as a separate screen.*
- *Print on the Characters list's menu*, to go with Phase 11.1.

Say so if a proposed phase would make any of these harder.

**Rulings still needed**

- The Multiple Schools gate for Phase 4.7. Core Rulebook p. 245 does not ask for the Advantage; the
  roadmap's scope does. The recommendation is to follow the book.
- D06 Weakness and Hotei (Phase 4.5).

**The Ancestor wiki cross-check**

It is blocked only in cloud sessions. The laptop can reach both wikis: Phase 4.6's audit read 24 of
their pages on 1 October.

**The checkouts**

- **Work in `C:\Users\jcrow\l5r-character-sheet-creator`.** It is on `main` and was up to date with
  `origin` at handoff.
- The Claude Code project opens in `OneDrive\Documents\L5R character sheet creator`. That is an
  older clone, 52 commits behind at handoff, holding the owner's own uncommitted changes. Never work
  or commit there.
- The working clone has the owner's **four approved local deletions** (old kickoff files) and **seven untracked Word files**. Among them are the owner's September prompts for the
  Advantages and Disadvantages audit. Read them if that phase comes up. Never stage them.
- These worktrees remain, all on merged branches:
  - `l5r-sourcebook-index`;
  - `l5r-phase-7`;
  - `l5r-phase-12-8`;
  - the Codex `dependant-typing` worktree.

  Ask before removing any of them.
- Keep `core.autocrlf=false` and `core.longpaths=true`. Use a separate branch for each release.

## Proposal to challenge (from the 2 October reassessment)

The owner asked for the next phase to be chosen whether or not it needs the sourcebooks. On the
laptop the 16 PDFs are read directly. Extract their text only to a scratch folder, and never commit
it.

### Proposed next: Phase 6's first release, the missing School Technique text

Fold the Toku Bushi fix into it. The evidence, measured on 2 October:

- **72 of the 338 School Technique names have no description of their own.**
  - All 72 are in the **20 Minor Clan and Mantis Schools**.
  - 13 of those Schools have five Techniques each:
    - Ichiro, Heichi, Usagi, Morito, Suzume and Toku Bushi;
    - Tsi Smith;
    - Kasuga Smuggler;
    - Mantis Brawler, Tsuruchi Archer, Tsuruchi Bounty Hunter, Yoritomo Bushi and Yoritomo Courtier.
  - The other 7 are Shugenja Schools with one Technique each: Komori, Tonbo, Kitsune, Moshi,
    Yoritomo, Fuzake and Chuda [Snake].
  - 71 of them show the "Full description not yet available" text. The owner saw this under their
    Usagi Bushi and Yoritomo Courtier in the test screenshots. The 72nd is the Toku Bushi's Rank 4.
- **All 72 have been found in the books:**
  - Core Rulebook pp. 120–122 and 216–227 (PDF +3);
  - The Great Clans pp. 166–169;
  - Secrets of the Empire p. 238.

  The index located 65 of them. A text search of the Core Rulebook on 2 October found the seven it
  missed. Their sheet names match the book:
  - Voice of the Storm (p. 120);
  - Command the Winds (p. 121);
  - Favor of the Sun (p. 121);
  - The Kami's Whispers (p. 217);
  - Guided by Fate (p. 218);
  - Essence of Chikushudo (p. 220);
  - To Punish the Wicked (p. 224).
- **Why this first:**
  - Every player of a Minor Clan or Mantis School sees the gap.
  - It is small and needs no ruling.
  - The roadmap holds Phase 6's synergy engine back until this text exists. Building on missing
    text would mean inventing rules, which Process Requirement #3 forbids.

**The smallest useful release**

- The 72 descriptions, in our own words, each with its book and page.
- The Toku Bushi fix:
  - Rename the Master of Games' Technique. The precedent is "Strike the Center (Eyes of Nanashi)".
  - Widen Phase 4.6's name check from the keys of `TECH_DESCRIPTIONS` to every name in
    `ALL_SCHOOL_TECHNIQUES`.
  - Add a harness check that fails on today's `main`.

**What it leaves out**

- The SynergyEngine (a later release of Phase 6).
- Void-cost fields (Hotei).
- Automating any Technique's effect.
- Rewriting the 266 existing paraphrases.
- Advanced Schools (Phase 4.7).

### Risks: measure each before building

1. `techniqueDescription(name)` looks up text by **name alone**.
   - Check whether any of the 72 names is shared with another School, a Path or a Kata that has a
     different effect. The Toku case is one such clash.
   - Decide what the new fragment does on a clash. It should fail loudly at load time, as Phase 4.6's
     `assertResolve()` does.
2. **Fragment order.** Phase 4.6 assigns Path texts only when a name is not taken.
   - Whether the new text loads before or after Phase 4.6 changes which text wins.
   - The widened check catches a clash in either order. Prove that with a variant.
3. **The fix edits Phase 4.6's fragment.** That fragment is now the only source. The 1 October
   generator (`splice_books.py` and its data files) lived in that session's scratch folder and is
   gone.
   - Expect to update Phase 4.6's BOOK3 row, its pinned variants and its removal proof.
   - Decide whether the fix belongs in its own BUGFIX folder, so that removing Phase 6's release
     does not undo it. The precedent is BUGFIX — Multiple Schools Keep Earlier Techniques.
4. **Saved data.** The Master of Games can't be taken, so no saved character should hold its name.
   Verify that, and check that Technique text is never stored in a save. If either is false, the
   rename needs a Phase 7 format step.
5. **The Shugenja Schools.** The sheet gives each Shugenja School one Technique, at Rank 1. Confirm
   this against each page.

### Then

1. **Phase 4.7, Advanced Schools.**
   - First, the Core Rulebook's 9, pp. 247–250 (PDF 250–253), after the owner's ruling on the gate.
   - Phase 4.6's requirement engine is reused: its clauses, its requirements, the record keyed by
     School, and its format step.
   - Secrets of the Empire's School index lists 23 Advanced Schools in the books; the sheet has none.
   - Then the rest by book. Add the two missing Basic Schools with them: the Hiruma Scouts
     (Imperial Histories p. 147) and the Yotsu Bushi School (Imperial Histories p. 276).
   - Phase 4.6's AUDIT.md lists the Schools that the Paths name but the sheet lacks.
2. **The full sourcebook audit of Advantages and Disadvantages.**
   - This is the owner's unrun September prompt. The sheet has 73 Advantages and 66 Disadvantages.
     Phase 4.5's audits configured entries already in the catalogue; they did not look for entries
     the catalogue lacks.
   - Audit the way Phase 4.6's Paths were audited, publish the audit as a doc, then add entries by
     book.
3. **Then, as the owner chooses:**
   - Phase 6's SynergyEngine.
   - 11.1 Export to PDF. It needs no books but has the largest engineering unknowns.
   - 13 Library, then 14 Search.
   - Phase 9's School flavour text, as a light session.
   - D06 and Hotei, once ruled.
   - 15 last.

**Alternatives on the table**

- 4.7 first. It is a bigger feature, but its ruling can be given while Phase 6's release is built.
- The Advantages and Disadvantages audit first. The size of its gap has not been measured.
- 11.1 first.
- The parked Rank 0 exploding-10s bug. The owner parked it until the next change to dice rolling.
- The Ancestor wiki cross-check, now possible from the laptop.

## Usage: assess it yourself

The plan is Claude Pro. The owner's reading on 2 October was **66% of the week**. The week resets
on 7 October at about 02:00 BST. This session's last item is recorded but not yet measured: reading
the results, the ledgers, the reassessment and this file. Its row reads "To be read" and started at
66%.

Phase 4.6 cost **36% → 66%** over 1–2 October, all on the same meter:

| Work | Cost |
|---|---|
| First release, with the ledgers, the merge and its checklist doc | +7 |
| The variants and the walk on the live site | +2 |
| Second release | +5 |
| The second release's docs | +1 |
| Third release: 175 Paths from 13 books, and the audit | +9 |
| The third release's docs, the merge and the checklist | +6 |

Those figures are the nearest evidence for a content release. Phase 6's first release has 72 texts
from three books, but its cost has not been measured. Give relative effort and your confidence
rather than invented percentages. Ask the owner for a reading at the start and the end, from the same
place.

## Practical notes (verify them; don't assume)

**Laptop tools**

- Node is in `C:\Program Files\nodejs`.
- Set these:
  - `NODE_PATH='C:\Users\jcrow\l5r-qa-tools\node_modules'`;
  - `PLAYWRIGHT_BROWSERS_PATH='C:\Users\jcrow\l5r-qa-tools\ms-playwright'`;
  - `PYTHONUTF8=1`;
  - `LANG=C.UTF-8`.
- `pdftotext` is xpdf 4.06. It has no `-x`/`-y`; use `-layout` or `-raw` and `-f`/`-l`.
- Write long scripts to files in the scratch folder. A long inline script in a bash heredoc failed
  with "unexpected EOF".
- For merges, use `git merge -F <file>`.

**QA, as Phase 4.6 did it**

- Show that every new harness fails on `main` before you build.
- Run variants as a discovery run first, then a pinned run. `qa/verify-variants.py --jobs N` runs
  them in parallel.
- Removal must restore the previous build byte for byte.
- Full QA and exact removal remain mandatory. Save allowance by avoiding repeated runs, not by
  dropping checks.

**Publishing**

- Publish audits and iPhone checklists as Claude Docs through the docs connector, with a Result
  dropdown under each check.
  - Create the skeleton first, then fill one section per call.
  - Block keys must be lowercase.
- Before republishing the ledger artifact, read the saved live page in full, in chunks under 25,000
  tokens. Ticks persist in its database.

**Rules**

- Sourcebook content goes into the sheet as mechanics in our own words with book and page, never
  word for word.
- Commit and push only scoped work.
- Never force-push.
- Merge only on the owner's word.
