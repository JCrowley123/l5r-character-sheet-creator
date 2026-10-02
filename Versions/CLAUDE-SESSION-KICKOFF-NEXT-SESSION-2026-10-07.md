# Claude — next-session kickoff (7 October 2026, after the weekly reset)

Written at the end of the 2 October laptop session. That session:

- built Phase 4.5.25, Clan and School Prices, and merged it with the Advantages and Disadvantages audit;
- had it confirmed on the owner's iPhone, all checks passed;
- took five rulings (below);
- re-derived the project's projected length;
- reassessed the next phase.

This file replaces the 3 October kickoff for planning. It does not override any of the owner's rulings.

The project is the L5R 4E single-player character sheet. It is not a VTT, a GM tracker or a combat engine.
**Start with your own assessment, not with building.** Nothing in this file approves a build.

## Your first response

1. **What is complete and what remains.** Note any place where the source, the ledger and the roadmap
   disagree.
2. **Your own assessment of cost and of the remaining roadmap.**
   - Give the effort, your confidence, the dependencies and the blockers (sources, rulings, devices).
   - Give the evidence for each, and reach your own conclusions.
   - Re-derive the projection in the ledger's current update; never quote it as fact.
3. **The phase you propose next,** its smallest useful first release, and what that release leaves out.
4. **Each point where your proposal differs from the one below.** For each, give:
   - the old proposal;
   - your alternative and why it is better;
   - the evidence;
   - the cost and QA trade-offs;
   - any ruling it needs.

   If you agree, say why in your own words.
5. **For that release:** the acceptance tests, the removal proof, the device checks, and a usage reading
   before and after.
6. **What you need from the owner before building:** the defaults and rulings below, in one batch.

**Usage: read it yourself** with the session tool `mcp__ccd_session_mgmt__get_usage` (load it through
ToolSearch). It reports the weekly and 5-hour windows; no reading is needed from the owner.

- If less than about 8% of the week is left, propose the release, collect the rulings and stop.
- A 5–9% release has used most of one 5-hour window, so expect one pause at that limit. Nothing is lost.

Then ask the owner to approve the specific build. If their message already approves exactly that scope,
don't ask again, but still report your assessment and any deviation first.

## What to read (selectively, but read completely the parts that matter)

**`Versions/CLAUDE.md`**

- The standing rules: surgical removability, marker blocks, and never naming another phase in marker order in
  prose.
- The 2 October sections at the end, the newest first.

**`Versions/BUILD-LEDGER.md`**

- The current update: the reassessment, and the projection two updates down.
- **Open reminders**: the parked Rank 0 bug, and the review items.
- This week's rows in the cost history.

`BUILD-LEDGER.html` must agree with it. The published ledger page
https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk was **not** republished on 2 October; refresh it with the
first release of the new week. Before you do, read the live page in full, in chunks under 25,000 tokens. Its
ticks persist in its database.

**`Versions/L5R Character Sheet Phased Roadmap reorder.md`**

- The process requirements and the status table.
- Phases 4.5 and 4.7, and **Deferred and declined**.
- The last three amendments, from "Phase 4.5.25 built" onwards.

**The audit**

`Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`. Read "Automation"
and "Mechanisms the sheet does not have yet".

**The nearest precedents**

- `Versions/PART I — Phase 4.5.25 Clan and School Prices/`: today's QA tooling, which is the newest.
- `Versions/PART I — Phase 4.5.19 Soul of Artistry/`: an untrained Skill rolled as Rank 1.

**Only then, the source the candidate touches**, under Phase 0's `src/sheet/`:

- `209.9296-feat-adv-soul-artistry.js`: its wrapper around the trunk's Skill roll.
- `100-dice-engine.js`:
  - `rollSkill()`, which passes no `explode:false` for a Rank 0 row: the parked bug;
  - the explode logic, where Gaijin Name's rule would sit.
- `209.85-feat-disadv-config.js`: `D45.socialSkills`, the Social Skill list Antisocial already uses.

## State at handoff

**Main and the build**

- `main` is at the commit "Reassessment after 4.5.25; next phase proposed; kickoff for 7 October" (check
  `git log`).
- The live build is Phase 0's `l5r-character-sheet.html`: **3,479,860 bytes, SHA-256
  `319f4f48b81b132b696fdf0bfcf330e2ce9fb2faa6d45b5b6fb03c0556c80f7c`**. Check it with
  `python build.py --check-drift`.
- The full runner is **Phase 4.5.25's `qa/current-suite-runner.js`**, which chains every earlier runner. Its
  last result was **3,711/3,711** on 2 October. That result is historical.

**What is complete**

- Phases 0, 0.5, 0.6, 1, 1.5, 1.6, 2, 3, 4, 5, 8, 11, 12, 4.6 and 4.8.
- Phase 4.5 except D06 Weakness and Hotei.
- Phase 4.5.25, Clan and School Prices: 40 entries, confirmed on the iPhone 2 October.
- The first releases of Phases 6 and 7.
- The Advantages and Disadvantages audit, now on `main`.

The only device checks still owed are Phase 0.7's seven Android checks. The owner has no Android phone, so
each checklist carries them as optional.

**Rulings given on 2 October**

- Phase 4.5.25:
  - a Management visit is the purchase;
  - every School held at that moment counts, but nothing is re-priced afterwards;
  - a typed cost is kept and marked;
  - a save from before the release is priced once from its starting School.
- **[Artisan] is its own School type**, not a courtier (Core p. 222).
- **Uncentered:**
  - a Clan monk holds a [Monk] School of a Clan;
  - a Brotherhood monk holds a School of the Brotherhood of Shinsei itself;
  - priced for new purchases only.
- Earlier the same day: Phase 4.7 requires the Multiple Schools Advantage.

**Rulings still needed** (ask in one batch)

- **Whether to unpark the Rank 0 exploding-10s bug** for the next release (recommended: yes).
- **The audit's scope.** It is the biggest lever on the project's length. Two cuts would each save
  allowance:
  - GM-agreed choices as a note on the row instead of a picker: Bad Fortune, Inner Gift, Gaijin Gear,
    Haunted, Jealousy;
  - leave out the Naga, Nezumi and Emerald Empire Station entries.
- The audit's other three: Student of the Past (no cost printed), Trials of the Imperial City (its text
  repeats Imperial City Stigma's), and Wanderer (no type printed).
- D06 Weakness's boundaries.
- **The free iPhone test:** ⋯ → Print. Is the PDF usable? That sizes 11.1 at about 3% or about 15%.

**Deferred by the owner: do not build these without a new instruction**

- A once-a-session Ancestor gift already used should not be offered.
- The first Manage tap is slow, and the Advantage windows still use the older gold "i" (both Phase 15).
- The Clan & School page may be cluttered (Phase 15).
- A lost-favour Ancestor should be editable in Management (end of the project).
- Review how Glory, Status and Honour work and are calculated (end of the project).

**Parked, to review once the app is complete**

- Manage as a separate screen.
- Print on the Characters list's menu, to go with 11.1.

**The checkouts**

- Work in `C:\Users\jcrow\l5r-character-sheet-creator`. The Claude Code project opens in the older OneDrive
  clone. Never work or commit there.
- The working clone carries the owner's four approved local deletions (old kickoff files) and seven untracked
  Word files in `Versions/`. Never stage either.
- Use a separate branch for each release. Keep `core.autocrlf=false` and `core.longpaths=true`.

## Proposal to challenge

The owner asked for **the biggest impact on the project's overall progress, at the least cost.**

### Proposed next: Phase 4.5.26, the dice-path entries, first after the reset

**What it does**

- **BUGFIX — Rank 0 Skill Rolls Explode, as its own layer** (on the owner's word). A Rank 0 row rolled
  from the Skill table is labelled "Unskilled", but its 10s explode. Untrained rolls should not explode.
- **Crab Hands, Crafty, Sage and Sensation**, through Soul of Artistry's wrapper. Each one lets the character roll
  an untrained Skill of one family as if it had Rank 1:
  - Crab Hands: Weapon Skills (Core p. 147);
  - Crafty: Low Skills (Core p. 147);
  - Sage: Lore Skills (Core p. 153);
  - Sensation: Perform Skills (Core p. 153).
- **Gaijin Name** (Core p. 159): on a Social Skill roll each die explodes only once, so no die can exceed 20.
  It uses `D45.socialSkills`.

**Why first**

- **One release on the dice code instead of three.** The bug, the four lifts and Gaijin Name all touch the
  same Skill roll. Each would otherwise need its own pass of regression tests on the dice engine.
- **It closes the only parked dice bug,** which the owner parked "until the next change to dice rolling".
- **It is small and well-defined:** about 5–7% with full QA, the merge and the checklist. Every rule is
  printed, and the four lifts copy a tested wrapper.
- **It suits the start of a week.** A small release that completes leaves the larger 4.7 a clean run.

**Defaults to confirm (design, not rules)**

1. A lift applies wherever the untrained Skill is rolled: the Skill table's Rank 0 rows and the Untrained
   Skills list.
2. A lifted roll explodes like a Rank 1 roll. An unlifted Rank 0 roll does not explode. Void's Rank 0 → 1
   option still re-enables explosion, as the bug's reminder requires.
3. Gaijin Name caps every die of a Social Skill roll at one explosion, damage excluded. The preview says so.

**Risks: measure each before building**

- How Soul of Artistry's wrapper decides "untrained" and the Skill family. Copy it; don't re-derive it.
- The family lists:
  - Weapon, Low, Lore and Perform as the sheet's own Skill library tags them;
  - Sensation's text says "a Perform Skill you do not possess", so read it.
- Retained harnesses that roll a Rank 0 row and expect explosion need conditional fixture corrections. Count
  them first.
- Whether the explode logic can cap per die without touching the roll preview's maths. Check Phase 4's
  (Part G) roll breakdown.

### Then

1. **Phase 4.7, the Core Rulebook's 9 Advanced Schools** (pp. 247–250, PDF 250–253), in the same week.
   - The gate is ruled: the Multiple Schools Advantage is required.
   - It reuses Phase 4.6's requirement engine.
   - Then the other 14 Advanced Schools, and the two missing Basic Schools (Imperial Histories pp. 147 and
     276). That is three releases in all, kept together to avoid re-reading the engine.
2. **The rest of the audit, by mechanism, the most entries first.** Each only after the owner's scope ruling.
   - Roll-preview ticks, which the sheet cannot see for itself (9 entries in the sheet);
   - then automatic bonuses and TN changes;
   - then damage, Wound penalties, uses per session, the Willpower checks;
   - then the missing entries by book, each arriving with its mechanism;
   - then the pickers.
3. **Then, as the owner chooses:**
   - the SynergyEngine;
   - 11.1, sized by the Print test;
   - 13 and 14;
   - Phase 9's flavour text;
   - D06 and Hotei once ruled;
   - the end-of-project reviews;
   - 15 last.

**Alternatives on the table**

- **4.7 first.** It is the bigger visible step, but the dice bundle is cheaper and closes a bug, and both fit
  the same week.
- **The roll-preview ticks first.** They are cheap and cover many entries, but they wait for the scope
  ruling.
- **11.1 first.** It is unknown until the Print test.
- **The bug alone.** That saves little, and it leaves the four lifts and Gaijin Name a second pass on the dice
  code.

## Practical notes (verify them; don't assume)

**Laptop tools**

- Node is in `C:\Program Files\nodejs`.
- Set these:
  - `NODE_PATH='C:\Users\jcrow\l5r-qa-tools\node_modules'`;
  - `PLAYWRIGHT_BROWSERS_PATH='C:\Users\jcrow\l5r-qa-tools\ms-playwright'`;
  - `PYTHONUTF8=1`;
  - `LANG=C.UTF-8`.
- `pdftotext` is xpdf 4.06. Extract to the scratch folder only. The Core Rulebook's PDF page is the printed
  page + 3.

**Git Bash pitfalls**

- sed and heredocs mangle backslashes. Use the Edit tool for exact replacements and the Write tool for
  commit messages.
- Never leave a bare `cat >` in a chain; it waits on input.
- Give `git push` `< /dev/null` and a timeout.

**QA, as Phase 4.5.25 did it** (copy its `qa/` folder and swap the constants)

- The new fragment goes before `210-test-seam-and-init.js`; the next free slot is `209.999997`.
  - Add its seam keys through a guarded `Object.assign` block.
  - Add its manifest entry, and update `expect_sha256`.
  - Append a `Release(...)` line to `Versions/QA — Removal Chain Registry/removal_chain.py`.
  - Run `qa/feature-dependencies.py`.
- After the swap, fix `OWN_RE`, `BEGIN_RE` and `PRE_RELEASE_BYTES` in `remove-phase.py` by hand.
- Show every new harness failing on `main` before you build.
- **Variants:** a discovery run, then a pinned run (`verify-variants.py --jobs 3`). Re-pin if checks are
  added.
- **The full suite:** run it once, with nothing else running. It takes 20–40 minutes, so run it in the
  background. Run under load, a timing-sensitive geometry check (Dark Paragon's DP-GEOMETRY-1440) can fail
  spuriously.
- **Removal** must restore the previous build byte for byte.

**Device checks**

- Merge on the owner's word first, so they can test the live site.
- Run the release's harness against the downloaded live page.
- Then send one Claude Doc checklist with a Pass/Fail/Not run dropdown under each check, through the docs
  connector: create the skeleton first, then fill one section per call.

**Rules**

- Sourcebook content goes in as mechanics in our own words, with book and page, never word for word.
- Commit and push only scoped work. Never force-push.
- Merge only on the owner's word.
