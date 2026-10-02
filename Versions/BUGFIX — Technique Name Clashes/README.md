# BUGFIX — Technique Name Clashes

Built 2 October 2026 on the laptop, on branch `claude/phase-6-technique-text`, as the first of two
layers in one release. The second is `Part G — Combat & Roll Engine/PART G — Phase 6 School Technique
Text/`, which depends on this fix for characters saved before it. The owner approved the release on
2 October as "the Technique text release with the Toku fix", and in the same session ruled that:

- saved characters' rows are updated;
- the Doji Courtier fix is included.

The sheet looks a Technique's text up by its **name alone**: `techniqueDescription(name)` in
`070-schools-paths-techniques.js`. Two Techniques in the books share a name with another one.

## The bugs, measured on 2 October 2026 (`main` at `ad87cc0`, build `aa5c55d9…`)

1. **"The Gift of the Lady."**
   - It is the Doji Courtier's Rank 5 (Core Rulebook p.111) and the Hitomi Kikage Zumi Order's
     Rank 1 (Imperial Histories 1 p.215).
   - The trunk's `TECH_DESCRIPTIONS` literal holds the key twice (lines 430 and 478). In a
     JavaScript object literal the later key wins.
   - So **a Rank 5 Doji Courtier was shown the monk's tattoo Technique**, a Great Clan School.
   - It is the only repeated key: all 278 keys were scanned with escapes normalised.
2. **"Forge Your Own Fate."**
   - It is the Toku Bushi's Rank 4 (Core Rulebook p.222). It is also the Technique of the Book of
     Air's Master of Games (p.180), a ronin Path that is recorded but never offered.
   - The Toku's had no text. Phase 4.6's load check compares a new name only against Techniques
     that already have text, so the Path's text stood in for the Toku's.
   - So **a Toku Bushi's Rank 4 read as a Social bonus**, when it really makes an attacker drop
     the two highest damage dice.
   - It is the only Path Technique named like any School Technique, checked against all 338.
3. **The text is saved with the character.**
   - `applyUnlockedTechniquesToList()` writes a Technique's text into its row in the Techniques
     list, behind a `[School Technique — Rank N, <School>]` tag.
   - It skips any Technique already listed by name, and the row is saved with the character.
   - Measured: a save holds the "not yet available" notice, and neither reloading nor granting the
     Techniques again replaces it.
   - So a fix to the text alone reaches only new characters. The owner's existing Usagi Bushi and
     Yoritomo Courtier would have kept the notice.

## The fix

One fragment, `src/sheet/209.999994-bugfix-technique-name-clashes.js` (marker `BUGFIX TECHNAMES`,
object `TECHNAMES`, switch `TECHNAMES_ENABLED`), and one seam block (`technique-names-seam`). It
rebinds two trunk functions and edits none.

- **Text per School.**
  - `TECHNAMES.BY_SCHOOL` gives a shared name its own text for each School that uses it: the
    Doji Courtier's, rewritten from p.111, and the Kikage Zumi's, unchanged.
  - The rebound `unlockTechniques()` answers a School's own Technique with that School's text,
    and also corrects its explanation text.
  - A Path's Technique that replaces the School's is left alone.
- **The Path renamed.**
  - The Master of Games' Technique becomes "Forge Your Own Fate (Master of Games)", following
    the precedent of "Strike the Center (Eyes of Nanashi)", and keeps its text under the new name.
  - The old name's text is removed only when it is the Path's, so the name is left free for the
    Toku Bushi.
  - Phase 4.6's fragment is not edited: the rename happens when the sheet loads.
- **The load check covers every name.**
  - `TECHNAMES.assertResolve()` refuses a Path Technique named like any School Technique,
    described or not.
  - It also refuses a name that two Schools share without text for each, and per-School text
    for a School that lacks the Technique.
  - Its findings go to `console.error` at load, as Phase 4.6's check's do.
- **Saved characters' rows (the owner's ruling).**
  - The rebound `applyData()` rewrites a row after a character loads, only if all of these hold:
    1. the row carries the sheet's School Technique tag;
    2. it is that School's own Technique at that Rank;
    3. its text is one the sheet wrote and now knows is wrong or missing: the notice, or one of
       the two wrong texts recorded in `TECHNAMES.STALE`.
  - A row the player edited is never touched, nor is a row without the tag.
  - `applyData()` runs inside the Characters list's load, so the rewrite happens before the list
    marks the character saved. Opening a character therefore does not count as a change.
  - The stored copy changes only at the next save, by autosave or by hand.
  - School names that contain "]" (such as "Mantis Brawler [Bushi]") are read from the tag
    longest first, as the Multiple Schools fix does.

### Not in scope

- The Technique text of the 72 undescribed Techniques: that is Phase 6's layer, beside this fix.
  With this fix alone, the Toku Bushi's Rank 4 shows the honest "not yet available" notice.
- Looking text up by School everywhere. Only the two places that grant a School's Techniques ask,
  and they are the only callers of `techniqueDescription()`.
- Any other name. A Kata, Kiho or spell named like a School Technique was looked for: none is.

## Files

| File | What |
|---|---|
| `src/sheet/209.999994-bugfix-technique-name-clashes.js` (Phase 0 tree) | the fragment |
| `210-test-seam-and-init.js` | one block, `technique-names-seam` |
| `build/manifest.json` | one entry, after Phase 4.6's |
| `QA — Removal Chain Registry/removal_chain.py` | one entry |
| `PART I — Phase 4.6 Alternate Paths/qa/alternate-paths-harness.js` | its R3LOAD pin follows the renamed Technique when this fix is present (see Retained harnesses) |
| `originals/` | those four shared files as they were before this fix |
| `qa/` | the harness, runner, remover, removal tests, variants and their oracle |

## QA (2 October 2026, Windows laptop, Chromium via Playwright 1.63)

- **The harness** is `qa/technique-names-harness.js`: 26 checks in five scenarios.
  - **LOAD:** the load checks are clean, and the Path is renamed with its text kept.
  - **GIFT:** the Doji Courtier's Rank 5, its explanation text, and the Kikage Zumi's Rank 1.
  - **TOKU:** the Rank 4.
  - **OLDSAVE:** a character with stale rows is saved and reopened through the Characters list's real
    Save As and Load buttons. The stale rows are rewritten; the edited, untagged and correct rows are
    kept. The list does not count the open as a change, and the stored copy is unchanged until saved.
  - **WIDE:** a Path planted under an Usagi Bushi Technique's name, and a name planted in two
    Schools, are both refused.
  - **The oracles** are the books, the trunk's own text list, Phase 4.6's own `AP46.DESCRIPTIONS`,
    and storage.
- **On the build with this fix (and Phase 6): 26/26. On `main` (`aa5c55d9…`): 13/26**, failing the
  rename, the Doji Courtier, the Toku Bushi, the old-save Doji row and the wide check.
- **Full suite:** Phase 6's runner, which chains this fix's, which chains Phase 4.6's:
  **3,666/3,666** (3,619 retained + 26 + 21), on `033a0bf2…`.
- **Variants** (`qa/verify-variants.py --jobs 2`; the oracle is `qa/expected-failures.json`). 10
  variants, each red where pinned:

  | Variant | Checks passed |
  |---|---|
  | fix removed | 13/26 |
  | switch off | 16/26 |
  | no text per School | 22/26 |
  | no rename | 15/26 |
  | the old check (described names only) | 25/26 |
  | shared names unchecked | 25/26 |
  | no row rewrite | 24/26 |
  | the rewrite takes edited rows | 25/26 |
  | rewritten after the list marks it saved | 25/26 |
  | loaded before Phase 4.6 | 20/26 |

  Both boundaries read 26/26: Phase 12's modes off, and Phase 4.6 off (no Path to rename). This
  was run as a discovery run, then a pinned run.
- **Removal:**
  - Removing Phase 6, then this fix, from a scratch copy of the live tree rebuilds **byte-identical**
    to `main`'s build (`aa5c55d9…`, 3,432,964 bytes; `recombine.py` reports it identical to the
    pre-split build).
  - `qa/test-removal.py`: 21 tests, 20 passed, 1 skipped (the symlink test; Windows refuses
    symlinks without Developer Mode).
- **Dependency checker:** `qa/feature-dependencies.py` for the fragment with `--also
  technique-names-seam`: every reference is inside the fix's own block (exit 0).
- **Not tested headlessly:** real-device rendering. That is what MANUAL-TESTS.md in Phase 6's folder
  is for.

## Retained harnesses

Phase 4.6's harness pins the Master of Games' Technique as "Forge Your Own Fate" in its R3LOAD
scenario (`ENTRIES`, and the description check that reads the Technique's text by that name). With
this fix present, the pin follows the new name. Without it, it is unchanged. This is a test-only
change, of the same kind as Phase 4.6's own conditional format pins. The file as it was is in
`originals/`.

## Usage

The owner's reading at the start was 66% of the week (recorded on 2 October; the session hit the
five-hour limit once and resumed). The release's cost is read at the merge.
