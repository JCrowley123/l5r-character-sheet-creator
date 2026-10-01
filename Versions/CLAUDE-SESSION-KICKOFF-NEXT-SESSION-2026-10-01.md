# Claude — next-session kickoff (1 October 2026)

Prepared at the end of the 1 October cloud session (run from the owner's phone), after Phase 4.8
Ancestors and BUGFIX — Manage Button Clipping were merged. It supersedes the 30 September kickoff
for planning; it does not override the owner's rulings.

You continue the L5R 4E single-player character sheet (not a VTT, GM tracker or combat engine).
**Begin with your own assessment, not implementation.** Nothing below is approval to build.

## Your first response

1. What is complete, what remains, and any discrepancy you find between source, ledger and roadmap.
2. **Your own independent assessment of cost and the remaining roadmap**: relative effort, confidence,
   dependencies, blockers (source, rulings, device), and the evidence behind each. Draw your own
   conclusions; do not inherit this file's.
3. Your proposed next phase, its smallest useful first release, and its non-goals.
4. **For every point where your proposal differs from the one below**: the old proposal, your
   alternative, why yours is better, the evidence, the cost/QA trade-offs, and any ruling it needs.
   If you agree, say why in your own terms; do not merely endorse.
5. Acceptance tests, removal proof, device checks and a before/after usage checkpoint for that release.
6. What you need from the owner before building: the exact pages to photograph (printed and PDF
   page numbers), and any rulings.

Then ask the owner to approve the specific implementation. If their message already approves that
exact scope, do not ask again, but still report the assessment and any deviation first.

## Read (selectively but completely where it matters)

- `Versions/CLAUDE.md`: the standing rules (surgical removability, marker blocks, never a phase name
  in marker order in prose), the 1 October and 30 September sections at the end, and the folder map
  entries for Phase 4.8 and BUGFIX — Manage Button Clipping.
- `Versions/BUILD-LEDGER.md`: the 1 October update, **Open reminders**, the 30 September updates, and
  the cost history. Check `BUILD-LEDGER.html` agrees; it is the source of the published artifact
  https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk (refreshed 1 October).
- `Versions/L5R Character Sheet Phased Roadmap reorder.md`: process requirements, build order,
  status table, Phases 4.6 and 4.7 (with their Engineering Scope), 6, 11.1, 4.5 (D06/Hotei), 13–15,
  the dated amendments at the end (the last is "Reassessment after Phase 4.8 — 1 October 2026"),
  and **Deferred and declined**.
- `Versions/SOURCEBOOK INDEX — Page Map/INDEX.md`: "Alternate Paths — Phase 4.6" and "Advanced
  Schools — Phase 4.7"; its README for the printed/PDF page offsets.
- The nearest precedent, `Versions/PART I — Phase 4.8 Ancestors/` (README, AUDIT.md, `qa/`): a
  content phase built from the owner's photographs. Then only the source and tests the candidate
  phase touches.

## State at handoff

- `main` = the 1 October ledger commit, after `2c85d3c` (the merge of Phase 4.8 and the Manage fix).
  Live build: Phase 0 `l5r-character-sheet.html`, **3,256,563 bytes, SHA-256 `f4345b4a…119760`**
  (`python3 build.py --check-drift`). Verify rather than trust.
- Full runner: `Versions/BUGFIX — Manage Button Clipping/qa/current-suite-runner.js` (it chains
  Phase 4.8's, which chains the earlier ones). Last result **3,384/3,384** on that build: 2,999
  retained, Phase 4.8's 349, the fix's 36 (a historical result; do not claim it as a fresh run).
- Complete: Phase 12 (all parts). Merged with the owner's device check still owed: Phase 7's first
  release (30 September), Phase 4.8's two releases (54 Ancestors from the Core Rulebook, The Great
  Clans and Secrets of the Empire) and the Manage fix (1 October). The Android checks for Phase 0.7
  are 0 of 7.
- **Deferred by the owner — do not build without a new instruction:** Ancestor feedback point 2 (the
  Clan & School page may be cluttered) to Phase 15; point 9 (a lost-favour Ancestor editable in
  Management) to the end of the project. **Parked ideas, for review after the app is complete:**
  *Manage as a separate screen*; *Print on the Characters list's menu* (with Phase 11.1). Say so if
  a proposed phase would make any of these harder.
- The Ancestor wiki cross-check is blocked until the owner allows `magicalsamurai.wikidot.com` and
  `lasthaiku.wikidot.com` in the cloud environment's network settings. No other book has an Ancestor
  section; Enemies of the Empire p. 243 is the one page worth a look.
- Laptop checkout (as recorded 30 September; not re-checked from this cloud session): pull `main`
  first, since these merges were made from the cloud. It has **four owner-approved local deletions**
  and untracked Word files: preserve them, never stage them. A merged Codex worktree remains under
  `C:\Users\jcrow\Documents\Codex\...\dependant-typing`; ask before removing it. Keep
  `core.autocrlf=false`, `core.longpaths=true`. Work in a separate branch per release.

## Proposal to challenge (from the 1 October session)

The owner asked for the next build phase to be chosen whether or not it needs the sourcebooks.

**Proposed next: Phase 4.6 Alternate Paths, with the Core Rulebook's 27 paths as its first release**
(pp. 251–257, PDF 254–260). Reasons, checked in the source on 1 October:
- **The engine is built and takes any School.** `ALTERNATE_PATH_LIBRARY` (twelve monk paths today),
  `pathsAvailableAt()`, `pathRequirementsUnmet()`, the Techniques tab's picker (hidden until a path
  is available; padlocks unmet requirements) and the Rank substitution in `unlockTechniques()`. The
  work is content and tests, as Phase 4.8's was.
- **It is the most-used option still missing:** two paths for each of the nine Great Clans (p. 251
  on) and nine magistrate, Legion and Imperial Champion paths (p. 256 on); about 136 across 13 books.
- **One photo session feeds two phases.** The rules for both open on p. 245, the Advanced Schools
  are pp. 247–250 and the paths pp. 251–257: photographing **pp. 245–257 (PDF 248–260)** once
  supplies the first release of both 4.6 and 4.7.

**Smallest useful first release:** the 27 paths, each with its School and Rank, requirements and
Technique in our own words with the page. **Non-goals:** automating Technique effects on rolls (the
sheet shows School Techniques as text too); other books' paths (later releases, one book at a time);
Advanced Schools (Phase 4.7); the deferred and parked items above.

**Risks, read in the source on 1 October but not driven live — measure each before building:**
1. A taken path is recorded by Rank alone (`f_pathTaken` is `{"2": name}`), not by School, and
   `unlockTechniques(schoolName, rank)` substitutes `pathAtRank(r)` for whichever School is
   unlocking. Harmless while only monk paths exist. With Great Clan paths, a character with
   Multiple Schools who took a path in their first School may see it replace the second School's
   Technique at the same Rank. If that reproduces, the fix changes saved data: a registered Phase 7
   format step, not a private adapter.
2. The picker offers paths for the active School only (`#f_school` shows the last School in
   `getSchoolsList()`; `#f_rank` is its Rank).
3. A `replaces` clause names one School or `any:'brotherhood'` / `any:'monk'`. If a Core path names
   a category ("any Bushi School"), that is a new clause shape; check the pages.
4. `requires` holds rings, traits, skills, emphases, advantages and narrative. An Honor, Status,
   Clan or Insight requirement has no field: add one, or fall back to narrative ("confirm with your
   GM").
5. `assertPathSchoolsResolve()` runs once inside fragment 070, before a later fragment can add
   paths, so the new fragment needs its own resolution check and a harness assertion on it;
   otherwise a misspelt School silently matches nothing.
6. Technique text goes through `techniqueDescription()` / `TECH_DESCRIPTIONS`. Play mode hides
   `#pathPicker` (Phase 12.6), so a path is chosen in Management; check Play shows the substitute.

**Then:** Phase 4.7 with the Core Rulebook's 8 Advanced Schools (pp. 247–250), after settling two
questions against Core p. 245: is an Advanced School a separate track (the roadmap's default), and
does it need the Multiple Schools Advantage? It touches the School-list code behind several earlier
bugfixes. Then both phases book by book; Phase 6 with Hotei (needs Technique text and a ruling);
13, then 14; 11.1; D06 Weakness when ruled; Phase 9's flavour text as a light session; 15 last.

Why this order, for you to test rather than accept: the books now cost photographs and the index,
not reading; the engine exists, so the first release is content; 4.6 and 4.7 add the Technique text
Phase 6 needs. 11.1 needs no books but has the largest engineering unknowns (generating the PDF,
fonts, saving in the installed app and on Android); it can be swapped in whenever the owner wants a
session without books. Alternatives on the table: 11.1 first; 4.7 before 4.6; D06 (needs rulings);
the Rank 0 exploding-10s bug (still open, wants a bugfix folder); the owed device checks.

## Usage — assess it yourself

Claude Pro, 1 October (week resets 7 October about 02:00 BST): **weekly 22%**, the owner's reading,
taken after Phase 4.8's two releases, the Manage fix, the audit page and the merges. The ledger
recorded the same 22% after Phase 7 on 30 September, before that work, so the two readings cannot
be compared and no cost is derived from them (they may come from different meters). Codex is a
separate allowance (56% on 28 September). Ask for a start and an end reading from the same place.
Phase 4.8 is the nearest precedent for 4.6's cost, but it was not measured. Give relative effort
and confidence rather than invented percentages; label any number with no comparable evidence.

## Practical notes from this session (verify, do not assume)

- **Cloud session:** a fresh clone each time. The full suite needs `LANG=C.UTF-8` and
  `NODE_PATH=/opt/node22/lib/node_modules`; Chromium is preinstalled (never `playwright install`).
  The sourcebook PDFs are not in the container: content comes from the owner's photographs. Commit
  and push before the container is reclaimed.
- **Laptop session:** the PDFs are in `OneDrive\Documents\L5R 4th edition books`, outside both
  clones; extract text only to a scratch folder and never commit it. Windows tools as in the 30
  September kickoff (Node, `NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `PYTHONUTF8=1`).
- **Lessons from Phase 4.8:** a variant with every die equal cannot catch a re-sort (Sun Tao); mix
  the values wherever order matters. Give each harness section that spends a resource (Void Points)
  its own setup, or one failure cascades. `qa/test-chain.py` requires every registered release's
  fragment to follow manifest order, so a CSS-only fix needs a small JS switch fragment to register
  (the Manage fix has one). Phase 4.5's base remover refuses on `main` for an older, unrelated
  reason (measured and documented in Phase 4.5's ROLLBACK), not a new failure. Use quoted heredocs for scripts with
  backslashes.
- **The ledger artifact:** a republish must first read the saved live page in full, about 100 lines
  at a time (a read is capped at 25,000 tokens); budget for it and refresh once per batch.
- Full QA and exact removal remain mandatory; save allowance by avoiding repeated runs, not by
  dropping checks. Commit and push only scoped work; never force-push; merge only on the owner's word.
