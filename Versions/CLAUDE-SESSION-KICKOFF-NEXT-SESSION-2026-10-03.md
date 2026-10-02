# Claude — next-session kickoff (3 October 2026)

Written at the end of the 2 October laptop session. That session did three things:

- built and merged Phase 6's first release, the School Technique text;
- built and merged BUGFIX — Technique Name Clashes, both confirmed on the iPhone (13/13);
- ran the Advantages and Disadvantages audit, building nothing.

The owner then asked for a reassessment, aimed at the biggest impact on the project's overall progress
at the least cost. This file replaces the 2 October kickoff for planning. It does not override any of
the owner's rulings.

The project is the L5R 4E single-player character sheet. It is not a VTT, a GM tracker or a combat
engine. **Start with your own assessment, not with building.** Nothing in this file approves a build.

## Your first response

1. **What is complete and what remains.** Note any place where the source, the ledger and the roadmap
   disagree.
2. **Your own assessment of cost and of the remaining roadmap.**
   - Give the relative effort, your confidence, the dependencies and the blockers (sources, rulings,
     devices).
   - Give the evidence for each.
   - Reach your own conclusions; do not take this file's.
3. **The phase you propose next,** its smallest useful first release, and what that release leaves out.
4. **Each point where your proposal differs from the one below.** For each, give:
   - the old proposal;
   - your alternative and why it is better;
   - the evidence;
   - the cost and QA trade-offs;
   - any ruling it needs.

   If you agree with the proposal, say why in your own words. Do not just endorse it.
5. **For that release:** the acceptance tests, the removal proof, the device checks, and a usage reading
   before and after.
6. **What you need from the owner before building:**
   - the three design defaults below;
   - any rulings;
   - in a cloud session, the pages to photograph (both printed and PDF page numbers). On the laptop,
     read the PDFs yourself.

   Ask for all of them in one batch.

**The usage reading decides how much to build.**

- If less than about 8% of the week is left, propose the release, collect the rulings and stop.
- Build after the reset rather than stopping a release part-way.

Then ask the owner to approve the specific build. If their message already approves exactly that
scope, don't ask again. Still report your assessment and any deviation first.

## What to read (selectively, but read completely the parts that matter)

**`Versions/CLAUDE.md`**

- The standing rules: surgical removability, marker blocks, never a phase name in marker order in
  prose.
- The 2 October sections at the end. The newest is "(night, later) — reassessment after the audit".

**`Versions/BUILD-LEDGER.md`**

- The 2 October updates. The current one holds the recommendation and a re-derived projection of the
  project's length.
- **Open reminders**: the audit review is first, and the parked Rank 0 bug is further down.
- This week's rows in the cost history.

Check that `BUILD-LEDGER.html` agrees with the markdown ledger. The HTML file is the source of the
published artifact https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk.

**`Versions/L5R Character Sheet Phased Roadmap reorder.md`**

- The process requirements and the status table.
- Phases 4.5 and 4.7.
- **Deferred and declined**.
- The last two amendments: "The Advantages and Disadvantages audit — 2 October 2026 (night)" and
  "Reassessment after the Advantages and Disadvantages audit — 2 October 2026 (night)".

**The audit:** `Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`.
It is also the doc https://claude.ai/code/artifact/485b7ec0-c6cd-4c63-b9e6-3e5c4ecf74a6. Read:

- "At a glance";
- "No picker, but a Clan or School price (43)";
- "Automation".

**The nearest precedents**

- `Versions/PART I — Phase 4.5.16 Heart of Vengeance/`: its price comes from the character's Clan.
- `Versions/PART I — Phase 4.5.19 Soul of Artistry/`: an untrained Skill is rolled as Rank 1.
- For today's QA tooling, Phase 6's folder (`Versions/Part G — Combat & Roll Engine/PART G — Phase 6
  School Technique Text/`) and `Versions/BUGFIX — Technique Name Clashes/`.

**Only then, the source the candidate touches**, all under Phase 0's `src/sheet/`:

- `209.928-feat-adv-heart-vengeance.js`:
  - `HV4516.price()`;
  - the rebinding of `refreshAdvConfigControl` near its end.
- `209.8-feat-adv-config.js`: `refreshAllAdvConfigControls()`, which `recalcAll()` calls for every row.
- `209.81-feat-adv-config-extended.js`: `advConfigCharacterClan()`.
- `209.84-feat-adv-config-sacred-weapon.js`: the Clan lookup.
- `209.995-feat-wizard-skills-advantages.js`: the wizard's Advantages step, which reads the row's
  `.en-cost`.
- `040-lib-kata-kiho-spells.js`: `buildAdvDisadvQuickAdd()`, whose dropdown label shows the catalogue
  price.
- `209.999993-feat-alternate-paths.js`: `api.schoolTypes()`, Phase 4.6's School-type test.
- Darling of the Court (4.5.14): its "Courtier School" test.
- For the second release: `209.9296-feat-adv-soul-artistry.js` and the trunk's `rollSkill()` in
  `100-dice-engine.js`.

## State at handoff

**Main and the build**

- `main` is `066aed7`, unless the owner has since merged `claude/adv-disadv-audit`. That branch is
  docs only: the audit, the reassessment, the ledgers and this file. Check with `git log`.
- The live build is Phase 0's `l5r-character-sheet.html`: **3,464,120 bytes, SHA-256
  `033a0bf239b9dd1c4e6e6d494cfba2c8c7092dacde82f184ae3e73cb847a19c3`**. Check it yourself with
  `python build.py --check-drift`.
- The full test runner is Phase 6's `qa/current-suite-runner.js`. It chains all the earlier runners.
  Its last result was **3,666/3,666** on 2 October. That result is historical.

**What is complete**

- Phase 12, all parts.
- Phase 4.8.
- Phase 4.6: 214 Paths.
- Phase 7's first release. Its audit log is to come later, by the owner's ruling.
- Phase 6's first release: every School Technique now has its own text. BUGFIX — Technique Name
  Clashes sits beneath it. Both were confirmed on the iPhone (13/13) on 2 October.
- The Advantages and Disadvantages audit: docs only, on the branch above.

The only device checks still owed are Phase 0.7's seven Android checks (0 of 7 done). The owner has no
Android phone, so each checklist carries them as optional.

**What the audit found**, all measured on 2 October:

- The sheet holds **139 entries**: all 131 from the Core Rulebook and 8 from supplements.
  - 44 have a picker.
  - 6 are handled without one.
  - **89 record only their cost and text.**
- **65 are missing**, all from supplements:
  - 42 can be used by the sheet's characters;
  - 23 are for Naga or Nezumi only.
- **25 pickers are needed**: 9 for entries in the sheet and 16 for missing ones.
- **94 entries could be automated** with machinery the sheet already has.
- **43 entries have Clan or School prices**: 39 in the sheet (38 from the Core Rulebook, plus Uncentered)
  and 4 missing. The sheet charges all of them at the catalogue price.

**Deferred by the owner: do not build these without a new instruction**

- A once-a-session Ancestor gift that has already been used should not be offered.
- The first Manage tap is slow, and the Advantage windows still use the older gold "i" (both
  Phase 15).
- The Clan & School page may be cluttered (Phase 15).
- A lost-favour Ancestor should be editable in Management (end of the project).
- Review how Glory, Status and Honour work and are calculated (end of the project). The audit's Fame,
  Social Position, Virtuous and Status entries wait for this review.

**Parked ideas, to review once the app is complete**

- *Manage as a separate screen.*
- *Print on the Characters list's menu*, to go with Phase 11.1.

Say so if a proposed phase would make any of these harder.

**Rulings**

- **Given on 2 October:**
  - Phase 4.7 requires the Multiple Schools Advantage (against Core p. 245).
  - Existing characters' stale Technique rows are updated when opened.
- **Still needed:**
  - D06 Weakness and Hotei (Phase 4.5).
  - The audit's four: Student of the Past (no cost printed); Trials of the Imperial City (its text
    repeats Imperial City Stigma's); Wanderer (no type printed); whether to add Naga, Nezumi or
    Emerald Empire Station entries.
  - The three defaults for the proposed release, below.
  - Whether to unpark the Rank 0 exploding-10s bug for the second release.

**The checkouts**

- **Work in `C:\Users\jcrow\l5r-character-sheet-creator`.**
- The Claude Code project opens in `OneDrive\Documents\L5R character sheet creator`. That is an older
  clone holding the owner's own uncommitted changes. Never work or commit there.
- The working clone has the owner's **four approved local deletions** (old kickoff files) and **seven
  untracked Word files** in `Versions/`. Never stage either.
- These worktrees remain, all on merged branches. Ask before removing any of them:
  - `l5r-sourcebook-index`;
  - `l5r-phase-7`;
  - `l5r-phase-12-8`;
  - the Codex `dependant-typing` worktree.
- Keep `core.autocrlf=false` and `core.longpaths=true`. Use a separate branch for each release.

## Proposal to challenge (from the reassessment after the audit)

The owner asked for **the biggest impact on the project's overall progress, at the least cost.** The
reassessment's answer:

- **Fit each release to the allowance that is left.** Unused allowance is lost at the reset, and a
  release that stops part-way has to be re-read.
- **Build mechanisms before the entries that use them.** New entries then arrive working instead of
  record-only, so nothing is built twice.
- **Bundle work that shares one code path.**
- **Ask for every ruling up front.**

### Proposed next: Phase 4.5.25, Clan and School prices

**What it does**

- 39 entries in the sheet cost less, or give more XP back, for some Clans, families or School types.
- Today the sheet charges every one at the catalogue price, so the player has to know the rule and
  type the price.
- One shared step prices each row from the character. Examples:
  - Clear Thinker costs a Dragon 2;
  - Hands of Stone costs a monk 5;
  - Brash gives a Lion 4 points;
  - Epilepsy gives a Crane 5.

**The evidence**

- **The audit's table lists all 43 rows.** That is the 39 in the sheet, plus Spy Network,
  Strategist, Sage of the Sword and Fan and Inheritance: Trained Falcon, which are all missing.
- **The pattern already exists and is tested.**
  - Heart of Vengeance (4.5.16) prices its row from the Clan: Spider pays 4, everyone else 5.
  - It does this by rebinding `refreshAdvConfigControl`.
  - `refreshAllAdvConfigControls()` runs that for every row on every path: added from the list, typed,
    loaded or imported. `recalcAll()` calls it.
  - The wizard's Advantages step reads the row's own `.en-cost`, so it needs nothing of its own.
- **Every price is printed in the Core Rulebook**, so no rules ruling is needed. (Uncentered's is in
  the Book of Void, p. 192.)

**Why it comes first**

- **The most entries for the least usage.** About a quarter of the catalogue is corrected in one
  release.
- **It fits what is left of this week:** about 11% after the handoff.
- **Mechanisms before entries:** the 4 missing entries with Clan prices will price themselves when
  they are added.

**The smallest useful release**

- The price table: 39 rows, each with its conditions, book and page.
- The price step, chained like Heart of Vengeance's, with a short note on each priced row, for
  example "Dragon price: 2 XP (catalogue 3)".
- Re-pricing when a character is opened.
- A harness that fails on today's `main`, the removal proof, pinned variants, the full suite, and an
  iPhone checklist.

**Three defaults for the owner to confirm (design, not rules)**

1. **A hand-typed cost is kept and marked.** If the cost is neither the catalogue price nor the Clan
   price, it is not overwritten. Heart of Vengeance does overwrite, but these 39 have been typed freely
   until now, and a GM may have set the price.
2. **With several Schools, any School's type counts.**
3. **Existing characters are re-priced when opened,** before the Characters list marks them saved.
   This follows the owner's ruling for the Technique rows.

**What it leaves out**

- The effects of those 39 entries; only their price changes.
- The 4 missing entries.
- The untrained-Skill lift.
- Every picker.
- The dropdown's "(N pts)" label, unless it is cheap to change.

### Risks: measure each before building

1. **"And" or "or".** The audit's table compresses each cost line. "Crab, bushi 2" could mean a Crab
   bushi, or a Crab or a bushi.
   - Read every cost line in the Core text (the PDF page is the printed page + 3).
   - Record the reading for each row.
2. **Who counts as a bushi, courtier, shugenja, monk, ninja, Imperial or Spider?**
   - Run the candidate tests over all the sheet's Schools and families: Phase 4.6's `schoolTypes()`,
     Darling of the Court's courtier test, and `FAMILY_LIBRARY.Imperial`.
   - List the doubtful Schools for the owner, for example the Kasuga Smuggler and the Tsi Smith.
   - If no ninja School exists in the sheet, say so.
3. **The chain of `refreshAdvConfigControl`.**
   - Check that `advConfigSchemaFor()` returns no schema for any of the 39. If one has a schema, the
     price must not fight its owner.
   - Load the new fragment after the others. A variant must prove which one wins.
4. **Opening a character must not count as a change.**
   - Find whether load's `recalcAll()` runs before `CL11.markSaved`.
   - If it does not, re-price inside an `applyData` wrapper, as BUGFIX — Technique Name Clashes does.
5. **The sign for Disadvantages.** A "dearer" Disadvantage gives *more* XP back. Check the XP totals,
   the wizard's budget and Phase 12's Play lock.
6. **A Clan or School changed later** re-prices any row the player has not edited. A row the player
   typed keeps its value.
7. **Uncentered** depends on the monk type. Read Book of Void p. 192, and leave it out if it needs a
   ruling.

### Then

1. **Phase 4.5.26, untrained Skills.**
   - Crab Hands, Crafty, Sage and Sensation each roll an untrained Skill family as Rank 1, through Soul
     of Artistry's wrapper. The audit names Weapon, Low, Lore and Perform Skills; read each page.
   - On the owner's word, fold in the parked **Rank 0 exploding-10s bug**, as its own BUGFIX layer, as
     its reminder asks. The owner parked it "until the next change to dice rolling". This is that
     change, on the same code path. Its checks need the bug fixed anyway: an untrained roll that is
     not lifted must not explode.
   - Build it this week if a reading after 4.5.25 leaves about 5%; otherwise first after the reset.
2. **Phase 4.7, Advanced Schools: the Core Rulebook's 9 first** (pp. 247–250, PDF 250–253), first
   after the 7 October reset.
   - The gate is ruled: the Multiple Schools Advantage is required.
   - It reuses Phase 4.6's requirement engine: its clauses, its requirements, the record keyed by
     School, and its format step.
   - Then the other 14 by book, with the two missing Basic Schools: the Hiruma Scouts (Imperial
     Histories p. 147) and the Yotsu Bushi (Imperial Histories p. 276).
3. **The rest of the audit, by mechanism, the most entries first.**
   - Automatic Skill, Trait and Ring bonuses and TN changes: Prodigy, Silent, Voice, Bad Eyesight,
     Blind, Anachronism and Disturbing Countenance.
   - The requirement greys: Ishiken-Do and Sacrosanct.
   - Then the ticks, the uses per session and the Willpower checks.
   - Then the missing entries by book, each arriving with its mechanism, Strongholds of the Empire's
     city pairs first.
   - Then the pickers.
4. **Then, as the owner chooses:**
   - Phase 6's SynergyEngine;
   - 11.1 Export to PDF, sized by an iPhone Print test the owner can do for free;
   - 13 Library, then 14 Search;
   - Phase 9's School flavour text;
   - D06 Weakness and Hotei, once ruled;
   - 15 last.

**Alternatives on the table**

- **Phase 4.7 now.** It is the bigger step. But with about 11% left this week it is unlikely to finish
  with its docs and checklist, and a stopped release has to be re-read after the reset.
- **Prices and the Rank 1 lift in one release.** It saves one release's overhead (about 2–3%). But it
  is over this week's budget, and it separates the lift from the Rank 0 bug.
- **The missing entries by book first,** for example Strongholds of the Empire's 24. Most would arrive
  record-only and need a second pass.
- **Nothing until the reset.** The remaining allowance would reset unused.
- **11.1 first.** Its size is unknown until the owner tries ⋯ → Print on the iPhone.

## Usage: assess it yourself

The plan is Claude Pro. The owner's reading after the audit was **86% of the week**. The week resets
on 7 October at about 02:00 BST. This handoff is recorded but not yet measured: the reassessment, the
ledgers, the roadmap, this file and the ledger page republished. Its row reads "To be read" and started
at 86%.

The 2 October session, on the same meter:

| Work | Cost |
|---|---|
| The assessment; Phase 6's first release (72 texts) with BUGFIX — Technique Name Clashes, two layers; their docs; the merge | +11 |
| The ledgers, the ledger page republished, the live-site walk, the checklist doc | +3 |
| The Advantages and Disadvantages audit: 16 books searched, the doc and AUDIT.md | +6 |

Earlier anchors:

- Phase 4.6's three releases cost +7, +5 (+1 docs) and +9 (+6 for its docs, the merge and the
  checklist).
- A01–A16's single-mechanism Advantage releases averaged about 2.5% each, with lighter QA than now.

**The proposal's estimate for 4.5.25 is 5–8%, at medium confidence.** Give your own. Ask the owner for
a reading at the start and the end, taken from the same place.

## Practical notes (verify them; don't assume)

**Laptop tools**

- Node is in `C:\Program Files\nodejs`.
- Set these:
  - `NODE_PATH='C:\Users\jcrow\l5r-qa-tools\node_modules'`;
  - `PLAYWRIGHT_BROWSERS_PATH='C:\Users\jcrow\l5r-qa-tools\ms-playwright'`;
  - `PYTHONUTF8=1`;
  - `LANG=C.UTF-8`.
- `pdftotext` is xpdf 4.06. Use `-layout` or `-raw` and `-f`/`-l`.
- Git Bash heredocs mangle backslashes and long scripts. Write scripts to files in the scratch folder,
  and use the Edit tool for exact replacements.
- For merges, use `git merge -F <file>`.

**QA, as Phase 6 and the Technique fix did it**

- **The new fragment** goes before `210-test-seam-and-init.js`. The next free slot is after
  `209.999995-feat-school-technique-text.js`.
  - Add its seam keys through a guarded `Object.assign` block in `210-test-seam-and-init.js`.
  - Add its entry in `build/manifest.json`.
  - Append a `Release(...)` line to `Versions/QA — Removal Chain Registry/removal_chain.py`.
  - Run `qa/feature-dependencies.py`.
- **Show that every new harness fails on `main` before you build.**
- **Run variants as a discovery run first, then a pinned run** against `qa/expected-failures.json`.
  `qa/verify-variants.py --jobs N` runs them in parallel.
- **Removal must restore the previous build byte for byte.**
- **The new runner chains Phase 6's** `qa/current-suite-runner.js`.
- **Run the full suite once per release.** Full QA and exact removal remain mandatory. Save allowance
  by avoiding repeated runs, not by dropping checks.
- **Ignore blocked font requests in console checks:** `/^Failed to load resource/`.

**Device checks**

- Merge on the owner's word first, so they can test the live site.
- Give them one checklist doc with a Result dropdown under each check.
- Walk it headlessly on the live site before sending it.

**Publishing**

- Publish audits and checklists as Claude Docs through the docs connector.
  - Create the skeleton first, then fill one section per call.
  - Block keys must be lowercase.
- Before republishing the ledger artifact from a new session, read the live page in full, in chunks
  under 25,000 tokens. Its ticks persist in its database.

**Rules**

- Sourcebook content goes into the sheet as mechanics in our own words, with book and page, never word
  for word.
- Extract PDF text only to a scratch folder, and never commit it.
- Commit and push only scoped work.
- Never force-push.
- Merge only on the owner's word.
