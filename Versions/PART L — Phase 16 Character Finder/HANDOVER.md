# Handover: Character Finder (Part L, Phase 16), for a session on the owner's laptop

**Written 25 November 2026 by the cloud session that designed it.** Branch `claude/serene-ride-ojsryb`, state at commit
`6c1ac208` plus this file. Review page: <https://claude.ai/artifact/PoyremW11mLkwik15pEvW1>.

**To start the local session**, open Claude on the laptop in the project and say:

> Read `Versions/PART L — Phase 16 Character Finder/HANDOVER.md` and continue from there.

---

## 1. What this is

An optional questionnaire for new players ("Help me choose" on the wizard's Clan step, "Not sure what to play?" on the
Characters screen). Up to twelve questions recommend 1–2 best matches and four more worth a look from all 105 Basic
Schools. Each opens a guide, and a Build button hands the choice to the creation wizard. It is a guide, not a builder.
Full design: `DESIGN.md` in this folder (read sections 1, 9 and 10 first).

**Nothing is built and no application file has changed.** Everything so far is design, a Python prototype of the
scoring, tests, a review page, and the rating audit's first two steps.

## 2. Where things stand

| Piece | State |
|---|---|
| Design | Approved by the owner, 24–25 November. Every ruling applied (`DESIGN.md` section 1) |
| Place | New Part: **Part L — New Player Help**, **Phase 16**. Folder `Versions/PART L — Phase 16 Character Finder/` (Part L's first folder, so flat). Code marker for the eventual build: `PART L PHASE 16` |
| Scoring | Version 2 in `prototype/finder.py` |
| Reliability | `prototype/reliability.py`: 21 tests with pass marks, **all pass**; a 22nd (the owner's group) waits for data. "A player who wants School X finds it in the top six": **81.3%**, target **90%** |
| Rating audit | **Approved.** Steps 1–2 done (rubric; the app's own evidence). **Step 3, reading the books, is this session's job** |
| Review page | Published and current (version 3). Source in `review-page/` |
| Records | Roadmap: Status Overview row 16 and a `## PART L — New Player Help` section. `Versions/CLAUDE.md`: two log lines dated 25 November 2026 |

The 81% → 90% gap is in the **ratings**, not the arithmetic: a sweep of the scoring settings never got past 81%. That is
why the audit matters, and why this session is the most useful next step.

## 3. Your job in this session: the book-reading step

Follow **`audit/KICKOFF-BOOK-READING.md`**. It is written for exactly this. In short:

1. `python extract_pages.py` (in `audit/`) extracts each School's printed pages from the owner's PDFs to
   `%TEMP%\l5r-audit-book-text`, outside the repository.
2. For each of the **183 questions across 88 Schools** in `audit/book-evidence.json`, answer from the book: a decision
   (keep, remove, add, change, unsure), evidence in our own words, the printed page, the source (book, or wiki where only
   a wiki settles it), and the confidence (clear or judgement).
3. `python -I check_evidence.py --book-text "%TEMP%\l5r-audit-book-text"` after each Clan, until it reports no problems.
4. Apply only the **clear** decisions to `prototype/ratings.py` and log each in `audit/CHANGES.md`.
5. Re-run `prototype/reliability.py`, `tables.py`, `examples.py` and `audit/rater.py`.
6. **Commit and push after each Clan.**
7. At the end: `python -I check_evidence.py --spot-check`, then report to the owner (section 7 below).

Work **one Clan at a time**, in the work list's order (Crab first). It is a long job; expect more than one sitting.

## 4. Getting set up on the laptop

**Use a separate worktree**, so this branch does not disturb whatever the main clone has checked out (the project has
done this before, for example `C:/Users/jcrow/l5r-release-15a-g4`):

```bash
# in the laptop's existing clone
git fetch origin claude/serene-ride-ojsryb
git worktree add ../l5r-character-finder claude/serene-ride-ojsryb
cd ../l5r-character-finder
```

(Or simply check the branch out in a clean clone.) Then confirm the tools:

| Need | Expected on this laptop | Check |
|---|---|---|
| The books | `C:\Users\jcrow\OneDrive\Documents\L5R 4th edition books` (the owner's folder; the Sourcebook Index reads the same one) | 16 PDFs plus the blank character sheet |
| `pdftotext` | Ships with Git for Windows: `C:\Program Files\Git\mingw64\bin\pdftotext.exe` | `extract_pages.py` finds it itself, else falls back to pypdf |
| `pypdf` | Installed (the Sourcebook Index used 6.16.2) | `python -c "import pypdf"` |
| Python | `python` on Windows (the commands here say `python3` in places; use whichever works) | |
| Node and Playwright | Only for the optional steps in section 8 | `node -e "require('playwright')"` |

OneDrive: if the PDFs are "online-only", OneDrive downloads each when it is first read. That is slower, not a fault.

## 5. Rules that must not be broken

- **Book text never enters the repository.** Not in a file, a commit, a comment or a chat answer. `extract_pages.py`
  refuses an output folder inside the repo. Delete `%TEMP%\l5r-audit-book-text` when the audit is finished.
  (The owner's ruling of 30 September 2026.)
- **Our own words, with the printed page** ("Core Rulebook p.106"), never the PDF viewer's page.
  `check_evidence.py` rejects any note that shares a run of 8 or more words with the page.
- **The books are primary.** The two wikis (`Versions/SOURCEBOOK INDEX — Page Map/wiki_links.json`, one page per Clan
  per site) only corroborate where a book leaves a question open. The laptop can reach them; the cloud environment
  cannot.
- **No application file changes** in this step. Only `prototype/ratings.py` and the files in `audit/` (and the
  regenerated tables in `DESIGN.md`).
- **Do not merge to `main`.** A push to `main` redeploys the live site through Cloudflare Pages. This branch waits for
  the owner's word.
- **Never loosen a reliability rule.** A *floor* may move when evidence-backed rating changes move the results: find
  out why, and if the change is better for players, set the floor to the new measured value and record it in
  `DESIGN.md` section 9. A *rule* (marked `rule` in `reliability.py`) must always pass.
- **Judgement calls are not yours to settle alone.** Mark them `judgement` (or `unsure`). They go to the owner's group
  on `SHORT-LIST.md`.

## 6. Things worth knowing before you start

- **Step 2's suggestions include false alarms.** The rater matches keywords. Examples: it suggests "forbidden" for the
  Kuni Witch-Hunter because their Techniques mention maho, which they hunt. It calls Hida Bushi's complexity "Some
  extra" because the Rank 1 text says "except for Stealth". Answer every question from the book, not from the rater's
  guess.
- **Known likely errors to confirm or clear:**
  - the "Wall" home on Ichiro Bushi (Badger) and Heichi Bushi (Boar): no evidence in the app;
  - Morito Bushi rated front line, where its Techniques suggest a fast skirmisher;
  - Order of Peaceful Repose missing "mystic";
  - Usagi Bushi possibly "all-out".
- **Near-twin questions** (20 pairs at 75% or more alike) ask what separates two Schools. Answer with a label from the
  rubric's list (`audit/rubric.py`) that the evidence supports. If none fits, say so and mark it `judgement`. Pairs
  include Mirumoto Bushi and Mirumoto Taoist Swordsman, Daidoji Iron Warrior and Lion Elite Spearmen, Moshi and
  Yoritomo Shugenja, Tengoku's Fist and Fudoist Order, and several monk orders.
- **Toritaka Bushi appears twice** (Crab and Falcon) with one rating; answer it once.
- **Two Schools have no `SCHOOLREF1432` page** in the app (Hiruma Scout, Yotsu Bushi); the work list uses Imperial
  Histories 1 pp.147 and 276 for them.
- **Page offsets are handled for you**: the work list gives each School's PDF pages (printed = PDF − 1 in most books,
  − 3 in the Core Rulebook, the same in Unexpected Allies 2). A School's entry may start on the last of the three pages
  extracted, or run past them; if so, open the PDF at the cited page.
- **Ratings format** (`prototype/ratings.py`): `name: (main labels, also labels, homes, complexity 1–3, how unusual
  1–3, flags)`. Labels and Homes must be names from `audit/rubric.py`. A School's type, Honor and Affinity are never
  rated here: they come from the app.
- **The tests take about a minute.** They are deterministic (fixed seeds), so the same ratings always give the same
  numbers.

## 7. What to report to the owner at the end

- How many ratings changed, and the five biggest changes, with pages.
- Reliability before and after. Above all, "finds it in the top six" (81.3% before; target 90%), and the number of
  hard-to-find Schools (5 before; target 0).
- `audit/SPOT-CHECK.md`: ten answers from ten Schools for the owner to check against the book. If more than one is
  wrong, the audit is redone before its ratings are used.
- `audit/SHORT-LIST.md`: the judgement calls, for the owner's group.
- Add one line to the end of `Versions/CLAUDE.md` in the existing format ("<date> (Claude): …"), and update the Phase 16
  row and section in the roadmap.

## 8. After the book step (this session or a later one)

- **Rebuild and republish the review page** so it uses the audited ratings. Run `python build.py` at the repo root,
  then from `review-page/`: `node extract-tech.js`, `python -I build-data.py`, `node check-parity.js` (it must report 0
  mismatches). Republish `review-page/character-finder.html` with `finder-data.json` beside it to the **same** artifact
  URL above: read the artifact first, then publish with `url`. A cloud session can do this if Playwright is not set up
  on the laptop.
- **The group's answer codes.** The owner's players answer "Try it" as their own characters and send the code shown
  under the results, with their character's School. Add each to `audit/known-characters.json` as
  `{"who": "Player 1", "school": "Hida Bushi", "code": "v2|magic:2|..."}` (no names needed) and run
  `reliability.py`. Each player's real School must be in their top six (a rule). The page is private: the owner shares
  it from its Share menu.
- **Then the guides, Clan by Clan** (the owner's ruling 9), starting with Crab, Crane, Dragon and Lion. The two worked
  guides in `DESIGN.md` section 7 (Hida Bushi, Kuni Witch-Hunter) set the depth. Every suggested starting build is
  entered in the real wizard with `prototype/verify-builds.js` and must read 40 / 40 XP with no findings.
- **Building the feature itself** comes after that, and only on the owner's word: `DESIGN.md` section 11 has the plan.

## 9. Map of this folder

| Path | What it is |
|---|---|
| `DESIGN.md` | The design, rulings, reliability results and audit method |
| `HANDOVER.md` | This file |
| `ROLLBACK.md` | Design only: delete the folder (and the roadmap section, its row, and the two CLAUDE.md lines) |
| `prototype/ratings.py` | The rating of every School: what the audit corrects |
| `prototype/finder.py` | The questions and version 2 scoring |
| `prototype/reliability.py` | The 22 tests and their pass marks |
| `prototype/tables.py`, `examples.py` | Regenerate `DESIGN.md`'s tables and the example players |
| `prototype/verify-builds.js`, `builds.json` | Enter suggested builds in the real wizard |
| `audit/KICKOFF-BOOK-READING.md` | The step-by-step for the book-reading step |
| `audit/rubric.py` | The definitions every rating is checked against |
| `audit/WORKSHEET.md`, `worksheet.json`, `app-evidence.json`, `rater.py` | Step 2: the app's evidence and what it backs |
| `audit/book-worklist.json`, `book-evidence.json` | Step 3: the questions (with pages) and where the answers go |
| `audit/extract_pages.py`, `check_evidence.py` | Step 3's tools |
| `audit/known-characters.json` | Step 5: the group's answer codes |
| `review-page/` | The published review page, its data, and the parity check |
