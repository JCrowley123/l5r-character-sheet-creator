# Claude — next-session kickoff: BUGFIX — Skill Traits (10 October 2026)

**This file carries the owner's approval** (10 October: "I am happy with your recommendations", on the Skill-Trait audit's
proposed correction and its three recommended rulings). Build the work under "Approved work", verify it, and stop: merge
only on the owner's word, and start nothing else.

The project is the **L5R 4th Edition single-player character sheet**: a player companion in the spirit of D&D Beyond, not a
combat engine or virtual tabletop. Repository: https://github.com/JCrowley123/l5r-character-sheet-creator. Live site:
https://l5r-character-sheet-creator.pages.dev/.

## Start of session

- Turn Remote Control on and check keep-awake (memory `session-setup-remote-control`). Read the usage meter with
  `get_usage` (memory `usage-meter-readable`) and record it with a timestamp. **Start after the weekly reset (14 October,
  01:00 UTC)** unless the owner says otherwise: the week read 94% on 10 October.
- **Canonical checkout: `C:\Users\jcrow\l5r-character-sheet-creator`.** Sessions may open in the OneDrive folder (an older
  clone); never build or commit there. `main` = `origin/main` at this kickoff's commit. Owner-deleted kickoff files,
  untracked Word documents and `tmp/` sit in the checkout: leave them; stage exact paths only. Keep `core.autocrlf=false`,
  `core.longpaths=true`. One branch; never force-push.
- Read, by section only:
  - Memory **`feature-structure-and-comments`** (logic apart from UI, lean functional comments, `// UI hook:` markers).
  - `Versions/CLAUDE.md`: the rules at the top (folder convention, surgical removability) and the notes "9 October 2026
    (Claude, evening) — Phase 14.1 Search Facets; the Print test failed" and "10 October 2026 (Claude) — Phase 14.1
    checked; the Skill-Trait audit; the next kickoff".
  - **`Versions/AUDIT — Skill Traits/AUDIT.md`** in full (it is short): the findings, pages and rulings this fix builds.
    The same in the owner's doc: https://claude.ai/code/artifact/04fd60a2-c230-4827-8942-4ef186f8061d.
  - `BUGFIX — Apply School Skill Rows/README.md` and its fragment `src/sheet/209.9995-bugfix-school-skill-rows.js`: the
    "Family: Subject" Trait fill this fix extends (`SCHOOL_SKILL_ROWS.libraryEntry(name)`, `.fillTrait(row)`; it fills a
    blank Trait from the Skill's entry or its family's, whenever a row is made or renamed, and never overwrites a Trait a
    row already has). It also corrects the School library at load, the pattern for correcting the Skill library here.
  - `PART K — Phase 14.1 Search Facets/` README and ROLLBACK: the newest removal files to adapt, and its Trait filter.

## Approved work: BUGFIX — Skill Traits

- **Folder:** `Versions/BUGFIX — Skill Traits/`, flat like the other BUGFIX folders: one fragment, one guarded seam block,
  its own `BUGFIX <TAG>` marker (as `BUGFIX MASTERYRANK`, `BUGFIX IMPORTFILTER`), README, ROLLBACK, MANUAL-TESTS, `qa/`.
- **Intimidation's Trait becomes Awareness** (Core Rulebook p.144). Correct the Skill library at load, so every reader
  sees it (the Skills table and Add Skill, the wizard, Search and its Trait filter); do not edit the trunk library line.
- **Perform and Games sub-skills take their own Trait** whenever a row is made or renamed (Apply School, Add Skill, the
  wizard, a loaded save, a typed name):
  - Perform (Core p.137): Biwa, Dance, Drums, Flute, Puppeteer, Samisen: **Agility**; Oratory, Song, Storytelling:
    **Awareness**.
  - Games (Core p.136): Fortunes & Winds, Letters, Sadane: **Awareness**; Go, Shogi: **Intelligence**; Kemari: **Agility**.
  - Extend the "Family: Subject" fill by wrapping `SCHOOL_SKILL_ROWS`'s interface (marked `// UI hook:` only where it
    touches UI); never edit that bugfix's fragment. Declare the dependency in both ROLLBACK files.
- **The owner's rulings (10 October):**
  1. **Existing characters:** when a character is opened, a row still holding the old Trait is corrected (Intimidation on
     Willpower to Awareness; a Perform or Games sub-skill row on Awareness to its own Trait). Any other Trait is the
     player's and is left alone. The old value cannot be told apart from one chosen by hand; the ruling treats the old
     value as not chosen. Nothing is repriced; only the Trait moves.
  2. **Craft:** keep Awareness as the starting Trait, with a note that the Trait varies by craft and the GM sets it (Core
     p.143): where the sheet explains a Skill (check what Skill Info shows), and on the row if it is cheap.
  3. **Rolls with another Trait** (Athletics (Throwing) / Agility, Etiquette (Courtesy) / Willpower, Iaijutsu (Focus) /
     Void and the rest in the audit): **parked as FT-28**, a Trait choice on any Skill roll, with Phase 15. Not in this fix.
- **Not in this fix:** Craft sub-skill Traits (none printed); the Book of Earth's optional pairings (pp.8–9); any other
  Skill (the other 40 match all 16 books).
- **Watch for:** retained harnesses that pin Intimidation's Willpower or a Perform or Games row's Awareness (count before
  replacing; a test-only term that applies only while the fix is present, declared); Phase 4.5.30's Voice (Perform: Song,
  Oratory, Storytelling stay Awareness); Phase 14.1's Trait facet (its harness reads the catalogue, so it should follow;
  Willpower leaves the Skills Trait filter); the wizard's Skills step and free choices; Search's Skill records.
- **Owner's structure rules:** the correction logic in the fragment, any visible note through a marked `// UI hook:`;
  switching the fix off leaves the sheet exactly as today.

## Verification and the owner's check

- **Own harness** with oracles it does not own (the audit's table and pages, the Core's sub-skill lists written into the
  harness), shown to fail on `main`'s build; a **dependency harness** (the fix off; Apply School Skill Rows off; Search
  off); **pinned variants** run with `--jobs 1`; removal files adapted from `PART K — Phase 14.1 Search Facets/qa/`
  (`remove-phase.py`, `test-removal.py`, `verify-variants.py`); a removal-chain entry at the end of `CHAIN`; an ownership
  scan.
- **The full suite once, at the end,** sequentially, nothing alongside: a runner chained off
  `PART K — Phase 14.1 Search Facets/qa/current-suite-runner.js` (expects 4,970); then `final-qa.py` adapted from 14.1's
  (STEPS: this fix out, restoring `main`'s build byte for byte, with the retained suite on it).
- **Live after the merge:** `verify-live.py` and `checklist-walk.js` adapted from 14.1's.
- **Owner's check: one Claude Doc**, a Result dropdown (Pass / Fail / Not run) and Notes on every row, iPhone first: an
  existing character with Intimidation opens on Awareness; Perform: Biwa added reads Agility, Games: Go Intelligence; a
  Trait set by hand is kept; Craft's note; Search's Skills Trait filter (no Willpower option, Intimidation under
  Awareness); the wizard with a School that grants Perform or Games.

## Lessons (do not relearn them)

- **One browser job at a time, always** (about 2 GB free of 16 GB); variants with `--jobs 1`.
- A replacement that rewrites a call must not rewrite the helper that makes it: count occurrences first.
- Multi-line patterns in a heredoc lose backslashes: write generators to a `.py` file. Python on Windows needs Windows
  paths: pass them as arguments. `python -I` ignores `PYTHONUTF8`: reconfigure stdout to UTF-8 in the script.
- Keep each file's line endings; replace in place; stage exact paths (em dashes print octal-escaped in `git status`).
- A module's own data attributes must not reuse a name another phase's selectors rely on (`data-category` clashed in 14.1).
- Playwright's `selectOption` does not focus the select; focus it first when testing focus.
- The Read tool refuses more than about 25,000 tokens at once: read the published ledger page in chunks of about 150 lines
  before a republish, then diff it against `BUILD-LEDGER.html` so only changed lines need reading.
- **Check the date before writing it** (`date -u`).

## Usage

Week at **94%** on 10 October (07:40 UTC); it resets on **14 October at 01:00 UTC**. Estimate: the fix with its QA 3–5
points; the merge, live check, checklist and records 2–3; the ledger page's republish 1–2 (last, optional). **Total
6–10.** Record readings at the start, after the QA, after the merge and at the end.

## First steps

1. Session setup; read the records listed.
2. Design the fragment (the load-time library correction, the sub-skill Trait table, the correction of old rows on
   opening, the Craft note); say briefly any choice that differs from this file, then build. No further approval is
   needed for the approved work.
3. Full QA, then ask for the word to merge.
