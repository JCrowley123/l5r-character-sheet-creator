# PART G — Phase 6 School Technique Text (first release)

Built 2 October 2026 on the laptop, on branch `claude/phase-6-technique-text`, with
`BUGFIX — Technique Name Clashes` as the layer beneath it. The owner approved "the Technique text
release with the Toku fix" on 2 October.

This is Phase 6's first release. The synergy detection (the roadmap's `SynergyEngine`) has to read
Techniques' text before it can find anything, so this release writes the text the sheet was missing.
Writing synergy rules over missing text would mean inventing rules, which Process Requirement 3
forbids.

## The gap, measured on 2 October 2026 (`main` at `ad87cc0`)

- **72 of the 338 School Technique names had no text of their own.**
- **All 72 are in the 20 Minor Clan and Mantis Schools.**
- **71 showed the notice** "Full description not yet available for this technique". The owner saw
  it under an Usagi Bushi's and a Yoritomo Courtier's Techniques.
- **The 72nd, the Toku Bushi's Rank 4, showed a Path's text.** The fix layer corrects that.
- **The sources:**
  - Every one is written up in the Core Rulebook (pp.120–122 and 216–227), The Great Clans
    (pp.166–169) or Secrets of the Empire (p.238).
  - The sourcebook index located 65. The other seven were found in the Core Rulebook's text and
    confirmed on its pages this session.
- **The seven Shugenja Schools.** The book gives each of them exactly one Technique, as the sheet
  does: Komori, Tonbo, Kitsune, Moshi, Yoritomo, Fuzake and Chuda [Snake]. Each was confirmed on
  its page.

## What it adds

One fragment, `src/sheet/209.999995-feat-school-technique-text.js` (marker `PART G PHASE 6`, object
`TECHTEXT6`, switch `TECHTEXT6_ENABLED`), and one seam block (`technique-text-seam`). It rebinds
nothing.

- **The texts.** `TECHTEXT6.ENTRIES` lists `[Technique, School, Rank, text]`, in book order. Each
  text gives the mechanics in our own words and ends with its book and page, for example
  "(Core Rulebook p.221)". It goes into the trunk's `TECH_DESCRIPTIONS`.
- **A name already described is never overwritten.** It is recorded in `TECHTEXT6.clashes` and
  reported instead.
- **The load check.** `TECHTEXT6.assertResolve()` checks four things:
  1. each entry is its School's own Technique at that Rank, by the trunk's School libraries;
  2. no name is listed twice;
  3. each text ends with a book and page;
  4. no School Technique in the sheet is left without text.

  Its findings go to `console.error` at load.
- **Characters saved before this release.** Their rows keep the notice until they are opened. The
  fix layer's row rewrite then replaces it, because the notice is text the sheet itself wrote. A
  row the player edited is kept.

### Our own words (the owner's ruling, 30 September 2026)

- `qa/own-words-check.py` compares every text with the book pages and reports any run of 8 or more
  words they share.
  - It takes the pages as extracted text from a scratch folder, never from the repository. Its
    docstring gives the `pdftotext` commands.
  - On 2 October it reported **0 of 72**.
  - At 5 words it reports 49: the game's own terms, such as "spend a Void Point" and "equal to your
    School Rank". That also shows the check can fail.
- **How the texts were made.**
  - The first draft shared 22 runs of 8 words.
  - Each was rewritten, then four more, until none remained.
  - Mechanics and numbers were checked against each page as the texts were written.

### Not in scope

- The `SynergyEngine` and its flags in the roll preview: a later release of Phase 6.
- Void-cost fields (Hotei).
- Automating any Technique's effect: the texts are for the player to read.
- Rewriting the sheet's 266 existing paraphrases.
- Advanced Schools (Phase 4.7).

## Files

| File | What |
|---|---|
| `src/sheet/209.999995-feat-school-technique-text.js` (Phase 0 tree) | the fragment |
| `210-test-seam-and-init.js` | one block, `technique-text-seam` |
| `build/manifest.json` | one entry, after the fix layer's |
| `QA — Removal Chain Registry/removal_chain.py` | one entry |
| `originals/` | those three shared files as they were before this phase (with the fix layer) |
| `qa/` | the harness, runner, remover, removal tests, variants and their oracle, and the own-words check |
| `MANUAL-TESTS.md` | the iPhone check for both layers |

## QA (2 October 2026, Windows laptop, Chromium via Playwright 1.63)

- **The harness** is `qa/technique-text-harness.js`: 21 checks in four scenarios.
  - **LOAD:** the 72 are pinned in book order against a page list written in the harness from the
    books. Each is its School's own Technique at its Rank, by the trunk's libraries; each credits
    its page; no School Technique shows the trunk's fallback; the load check is clean.
  - **GRANT:** each of the 20 Schools at its top Rank; every row carries its text.
  - **APPLY:** an Usagi Bushi through the real Clan & School picker (Minor Clan, then Hare) and the
    Apply School button, and the Toku Bushi's Rank 4.
  - **OLDSAVE:** an Usagi Bushi saved with the notice in every row, with three Mantis Brawler [Bushi]
    rows and one edited row, reopened through the Characters list. The notices are replaced (a
    School name holding "]" included), the edited row is kept, the open is not a change, and Play
    mode shows the same rows.
- **On this build: 21/21. On `main` (`aa5c55d9…`): 9/21.**
- **Full suite** (this folder's `qa/current-suite-runner.js`): **3,666/3,666**.
- **Variants:** 8 variants, each red where pinned:

  | Variant | Checks passed |
  |---|---|
  | phase removed | 9/21 |
  | switch off | 11/21 |
  | one text dropped | 11/21 |
  | a page wrong | 17/21 |
  | loaded before Phase 4.6 | 17/21: the Path's own load check reports the clash in the console |
  | the fix's row rewrite off | 19/21 |
  | the fix removed under it | 10/21: the clash is reported and saved rows keep the notice |
  | the fix's tag read to the first "]" | 20/21: only the bracket-School row fails |

  Both boundaries read 21/21: Phase 12's modes off, and Phase 4.6 off.
  - **"One text dropped"** first replaced its entry with `void [...]`, which broke the whole script
    (0/21). It now deletes the line, so the variant tests one missing text.
  - **"The tag read to the first ']'"** first read up to the first "] ", which is correct for these
    tags (21/21, so the variant proved nothing). It now reads up to the first "]".
- **Removal:**
  - Removing this phase from a scratch copy rebuilds **byte-identical** to the fix's build
    (`b17b8584…`, 3,442,633 bytes); removing the fix too gives `main`'s `aa5c55d9…`.
  - `qa/test-removal.py`: 21 tests, 20 passed, 1 skipped (the symlink test).
- **Dependency checker:** `qa/feature-dependencies.py` with `--also technique-text-seam`: every
  reference is inside this phase's own block (exit 0).
- **Own words:** `qa/own-words-check.py` reports 0 of 72 at 8 words (49 at 5 words, all game terms).

## Usage

The owner's reading at the start of the session was 66% of the week. The session hit the five-hour
limit once and resumed. The release's cost is read at the merge.
