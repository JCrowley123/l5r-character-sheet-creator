# Kickoff: the rating audit's book-reading step (laptop session)

**For a Claude session running on the owner's laptop**, where the sourcebook PDFs are. A cloud session cannot
open them. The owner approved the audit on 25 November 2026 (`../DESIGN.md` section 10). Steps 1 and 2 (the rubric
and the app's own evidence) are done; this is steps 3 to 6.

**To start it**, open Claude on the laptop in the repository and say:

> Read `Versions/PART L — Phase 16 Character Finder/audit/KICKOFF-BOOK-READING.md` and carry out the book-reading
> step of the rating audit, one Clan at a time.

## Ground rules (the project's, not new)

- **Book text stays out of the repository.** `extract_pages.py` writes it to a scratch folder outside the repo and
  refuses a path inside it. Never commit, paste or quote book text; delete the scratch folder when finished.
- **Evidence is written in our own words**, one or two short sentences, with the **printed** page ("Core Rulebook
  p.106"), never the PDF viewer's page. `check_evidence.py` fails any note that shares a run of 8 or more words with
  the page it came from.
- **The books are the primary source.** The two community wikis (`SOURCEBOOK INDEX — Page Map/wiki_links.json`,
  one page per Clan on each site) only corroborate, and only where the book leaves a question open. Record those
  answers with `"source": "wiki"`.
- **No application file changes.** This step changes `../prototype/ratings.py` and the audit files only.

## What is already here

| File | What it is |
|---|---|
| `rubric.py` | The plain-words definition of every label, Home, complexity and how-unusual level |
| `app-evidence.json`, `rater.py` | Step 2: every School's evidence from the app, and the rater that weighs it |
| `WORKSHEET.md`, `worksheet.json` | Step 2's results: what is backed, weak, missing or suggested, School by School |
| `book-worklist.json` | The 183 questions the app's evidence could not settle, across 88 Schools, each with its book file and PDF pages |
| `book-evidence.json` | Where the answers go: one per question, blank |
| `extract_pages.py` | Extracts each School's pages to the scratch folder |
| `check_evidence.py` | Checks the answers; writes `SHORT-LIST.md` and `SPOT-CHECK.md` |
| `known-characters.json` | The owner's group's answer codes (step 5); empty until they are collected |

## Steps

1. **Get the branch.** `git fetch origin claude/serene-ride-ojsryb` and check it out (or merge it into the laptop
   clone's branch, if the owner prefers), so this folder is present.
2. **Extract the pages.** In this folder: `python extract_pages.py`. It reads the books from
   `%USERPROFILE%\OneDrive\Documents\L5R 4th edition books` (the owner's folder; `--books` overrides) and writes one
   text file per School to `%TEMP%\l5r-audit-book-text` (`--out` overrides). It needs poppler's `pdftotext` (ships
   with Git for Windows) or `pypdf`, both used by the Sourcebook Index before.
3. **Answer the questions, one Clan at a time**, in `book-worklist.json` order (it follows the Clans). For each
   School read its extracted pages, then for each question in `book-evidence.json` fill in:
   - `decision`: `keep`, `remove`, `add`, `change` (with `to`: the new Home or level) or `unsure`
   - `evidence`: what the page shows, in our own words
   - `page`: the printed page
   - `source`: `book`, or `wiki` where only a wiki settles it
   - `confidence`: `clear`, or `judgement` where reasonable people could disagree
   Judge each question by the rubric's definition, which is repeated in the question itself. **Near-twin questions**
   ask what separates two Schools: propose the label (from the rubric's list) the evidence supports for each. If
   nothing in the rubric fits, say so in the evidence and mark it `judgement`.
4. **Check the answers** after each Clan: `python -I check_evidence.py --book-text "%TEMP%\l5r-audit-book-text"`.
   Fix every problem it lists (unanswered, no page, copied wording).
5. **Apply the clear decisions** to `../prototype/ratings.py`, and log each change in `CHANGES.md` here (School, old,
   new, page). Leave `unsure` and `judgement` answers unapplied: they are on `SHORT-LIST.md` for the owner's group.
6. **Re-run the checks**, from `../prototype`:
   - `python -I reliability.py`. A **rule** must never fail. A **floor** may move because better ratings change
     the results. If one fails, find out why. Where the change is evidence-backed and the result is better for
     players, update the floor and record the new value in `../DESIGN.md` section 9. Never loosen a rule.
   - `python -I tables.py` and `python -I examples.py` (they refresh `DESIGN.md`'s tables and the examples)
   - from here: `python -I rater.py` (the worksheet now reflects the new ratings)
7. **Commit after each Clan** (the answers, `ratings.py`, `CHANGES.md`, the regenerated files; never the scratch
   folder) and push to the branch, so the work survives a usage limit.
8. **When every Clan is done:** `python -I check_evidence.py --spot-check` writes `SPOT-CHECK.md`, ten answers from
   ten Schools for the owner to check against the book. Report to the owner:
   - how many ratings changed, and the five biggest changes
   - the reliability results before and after, above all "finds it in the top six" (81.3% before; target 90%)
   - `SHORT-LIST.md` for the group, and `SPOT-CHECK.md` for the owner
   Then delete the scratch folder.

## Afterwards (a cloud session can do these)

- Rebuild the review page's data and check it against the prototype: from `../review-page`,
  `node extract-tech.js && python3 -I build-data.py && node check-parity.js`, then republish the page.
- When the group's answer codes arrive, add them to `known-characters.json` as
  `{"who": "Player 1", "school": "Hida Bushi", "code": "v2|magic:2|..."}` (no names needed) and run
  `reliability.py`: each player's real School must be in their top six.
