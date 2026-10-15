# BUGFIX — Spell Names Match the Books

Built 15 October 2026 (Cycle 2, Layer C), from the owner's notes of 15 October. Two Spells now carry their printed
names:

| Was | Now | Printed |
|---|---|---|
| Enticing the Dance of Flame | **Enticing Dance of the Flame** | Core Rulebook p.182 |
| Fill the Emptiness | **Fill with Emptiness** | Core Rulebook p.196 |

## What still works with the former names

- **Saved characters.** A Spell is saved as a Technique row with its name as text, plus the Element and Mastery taken
  when it was added (`090` `makeEntry`), so a save made before this fix loads, shows its stored name unchanged and still
  casts. Nothing in a save is rewritten.
- **Scrolls.** "Spell Scroll — Fill the Emptiness" bought before this fix still unlocks Fill with Emptiness
  (`hasSpellScroll`).
- **Search** finds each Spell by either name: the record carries a "Formerly …" tag (shown in the result row) and
  keeps the page Phase 14.3a cites under the former name.

Nothing else names these Spells: no School's starting Spells, no wizard list and no Ancestor refers to them (searched
before the change), and no harness outside 14.3a's does.

## Structure

| Location | Block or file | Role |
|---|---|---|
| `src/sheet/040-lib-kata-kiho-spells.js` | `spell-former-names`, right after `SPELL_LIBRARY` | The former-names table, the renaming (before anything reads the library) and `SPELLNAMES.formerName(name)`; switch `SPELL_NAMES_FIX_ENABLED` |
| `src/sheet/090-table-rows-weapons.js` | `scroll-former-name`, in `hasSpellScroll()` | A scroll under the former name counts |
| `src/sheet/209.9999999997-bugfix-spell-names.js` | the fragment | `SPELLNAMESEARCH.decorate(record)`: the "Formerly …" tag and the 14.3a page by the former name |
| `src/sheet/209.99999991-feat-search-index.js` | `search-spell-former-name`, in `build()` | Calls `decorate` for each record |
| `src/sheet/210-test-seam-and-init.js` | `spell-names-seam` | Also exposes `hasSpellScroll` for the checks |

**Why a fragment, though the handoff planned none:** the removal-chain registry removes every fragment release while
leaving fragment-less fixes in place (`fixes=False`). The Search part names 14.3a's `SEARCHREF143`, so as a
fragment-less fix it stopped 14.3a's remover in that mode (registry check `test_fixes_false_leaves_text_fixes_applied`).
In its own fragment it is a fragment release, removed before 14.3a in every mode. The renaming stays in `040`, where
it runs before the library is read.

## Verification (15 October 2026)

| Check | Result |
|---|---|
| Focused harness `qa/spell-names-harness.js` | **13/13** on the candidate; **5/13 on `main`**: the 8 fix checks fail; the 5 guards pass (an older save loads and keeps its text on both) |
| Negative variants `qa/verify-variants.py` | **5/5 pinned**: baseline (8), disabled (8), missing scroll hook (1), missing former-name tag (3), missing former page (2) |
| Dependency harness | **12/12**: control, switch off, fragment absent, Search off, 14.3a off; only the two names change; other Search records untouched |
| Retained test changes (below) | Search **62/62** and 14.3a **32/32** on the candidate, on `main` and with this fix off |
| Neighbours on the candidate | Checks and Conditions 101/101 and 91/91; Wizard Spells 52/52, 25/25, 71/71; Why Can't I Cast This 36/36; Search 94/94; Facets 44/44 and 14/14; 14.3a 23/23; 14.3b 40/40 and 26/26; 9.1 19/19 and 23/23; Search Keystroke Speed 7/7; Search Focus 12/12 |
| Removal proof `qa/test-removal.py` | **6/6**: rebuilds Layer B's build exactly (3,903,365 bytes, `51ed73ef…`) |
| Removal-chain registry | **11/11** |

Candidate with Layers A, B and C: **3,906,008 bytes**, SHA-256 `8010dc184282b22ab81c74abdf14c69dc342bfb4d87ded7968afdad7b884299b`.

## Retained test changes

While `SPELL_NAMES_FIX_ENABLED` is on, Phase 14's `qa/search-harness.js` (Spells' pages) and Phase 14.3a's
`qa/references-harness.js` (coverage, list and detail pages, retitled entries) read 14.3a's oracle, which keeps the
former names, through this fix's table. Off or removed, their original expectations apply. No check is dropped; 14.3a's
file keeps its CRLF line endings. Pre-change copies are in `originals/`.

## Known limit

Removing a scroll warns about the Spells that depend on it by comparing names exactly. A scroll bought under the former
name, with the Spell added under its new name after this fix, is therefore removed without that warning. It needs an
old scroll and a newly added Spell together, so it is left as is.

**Not verified here:** iPhone Safari. See `MANUAL-TESTS.md`.

`qa/current-suite-runner.js` chains Phase 9.1's suite (5,402) and adds 13 + 12: **5,427**.
