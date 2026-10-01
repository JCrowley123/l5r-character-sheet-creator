# BUGFIX — Multiple Schools Keep Earlier Techniques

Found on 1 October 2026 while assessing Phase 4.6 (Alternate Paths), in a headless run of the live
build; not reported from a device, and recorded in no earlier document. Approved by the owner the
same day as its own fix, before Phase 4.6's first release. Branch:
`claude/bugfix-multiple-schools-techniques`. **Not merged: it waits for the owner's iPhone check
([MANUAL-TESTS.md](MANUAL-TESTS.md)) and word.**

## The bug, measured

A character with the Multiple Schools Advantage who added a second School lost every Technique the
first School had taught, the moment the new School unlocked. Measured on `main` (`f4345b4a…`):

| Step | Techniques list |
|---|---|
| Hida Bushi, Insight Rank 3 | The Way of the Crab, The Mountain Does Not Move, Two Pincers One Mind |
| Multiple Schools bought, Hiruma Bushi's School Skills held, **+ Add School → Hiruma Bushi** (Rank 0) | **empty** |
| Insight Rank 5 (Hiruma Rank 2) | Hiruma's two only |

A monk's free Kiho picks from the first School went the same way. Without the new School's School
Skills (the sheet's own Rule 4 gate) nothing unlocked, so nothing was stripped either; the loss
came as soon as the gate opened.

**The rule.** Core Rulebook p.151 (Multiple Schools): the character stops progressing in the current
School and begins the new one at Rank 1 on reaching the next Insight Rank. The sidebar on p.152 has
the character taking the first dojo's secrets with him. Nothing is forgotten. The sheet's own code
agrees elsewhere: the Mirumoto dual-wielding feature reads a frozen School's Rank because "the Rank
1 Technique is still theirs".

**The cause.** `applyUnlockedTechniquesToList()` (`070-schools-paths-techniques.js`) was written for
a School being *replaced* (Apply School): whenever the active School differs from the one it last
granted for, it strips that School's granted rows and free Kiho. Multiple Schools was built later
and also changes the active School (the last entry of the Schools list), so it hit the same branch.

## The fix

One fragment, `src/sheet/209.999991-bugfix-multiple-schools-techniques.js` (`BUGFIX MSTECH`, switch
`MSTECH_ENABLED`). It rebinds the trunk function, as the configured Disadvantages fragment rebinds its
trunk hooks; the call in `recalcAll()` and the test seam pick up the new binding. No CSS, markup,
save field, seam key or rule changes.

1. **A School added past is kept.** If the School the trunk last granted for is still one of the
   character's earlier Schools in the Schools list, the trunk is handed no previous grant, so it
   strips nothing and records the new School's grant as usual. The earlier School's Technique rows
   and free Kiho stay, each still tagged with its own School.
2. **A School replaced is still stripped**, exactly as before: Apply School (which starts a new
   Schools list) or typing a new name into the School field (which renames the active School).
3. **And so is any earlier School no longer in the list.** Point 1 means a Multiple Schools
   character can hold rows of several Schools; when Apply School then starts again, the rows and
   free Kiho of every School no longer in the list go too, so a real change still leaves only the
   new School's. A row's School is read from the tag the trunk stamps on it, matched against known
   names longest first, because a name can itself contain "]" ("Kaiu Engineer [Artisan/Bushi]").
   Rows without that tag (typed by the player, purchased Kiho) are never touched.

### Not changed, and not in scope

- **Saves already damaged by the bug** are not repaired: a stored Multiple Schools character whose
  earlier Techniques were stripped keeps the list it has. Nothing in the save records which rows
  were lost, only the frozen School and its Rank, and a repair would add rows on load, which needs
  the owner's ruling. The player can add them back by hand. No such character is known to exist.
- **A taken Alternate Path still collides across Schools** (the kickoff's risk 1, measured the same
  day): a Path recorded at Rank 2 of the first School replaces the second School's Rank 2 Technique,
  and with this fix the Path's Technique, already listed for the first School, then hides the second
  School's own one. The Path record holds a Rank but no School, so the fix belongs to Phase 4.6's
  first release, which keys the record by School through a Phase 7 format step.
- Phase 12's Play lock, the Rule 4 Skill gate, the combined-Rank cap, and Apply School's handling of
  Skills, Paths and Affinities are untouched.

## Files

| File | Purpose |
|---|---|
| Phase 0 `src/sheet/209.999991-bugfix-multiple-schools-techniques.js` | The fix (`BUGFIX MSTECH`) |
| Phase 0 `build/manifest.json` | One fragment entry, new expected hash |
| `QA — Removal Chain Registry/removal_chain.py` | One entry at the end of `CHAIN` (its earlier copy in `originals/`) |
| `qa/ms-techniques-harness.js` | 32 checks through the real Add School, Apply School and School field |
| `qa/verify-variants.py`, `qa/expected-failures.json` | Seven broken variants with pinned failures, one boundary build |
| `qa/current-suite-runner.js` | Chains the Manage Button Clipping fix's full runner and this harness |
| `qa/remove-phase.py`, `qa/test-removal.py` | Surgical remover and its adversarial tests |
| `MANUAL-TESTS.md` | The owner's iPhone check |

## QA (1 October 2026, Windows laptop, Chromium via Playwright 1.63)

**Final combined run: 3,416/3,416, zero failed suites** (3,384 retained + 32 new), with
`qa/current-suite-runner.js`. No retained harness needed a change.

| Build | Bytes | SHA-256 |
|---|---:|---|
| This fix (branch) | 3,260,361 | `7daf6aec5558807f81aa4f0b436df4c2332ddd4624eea4e52e85aa044ee68677` |
| `main` before it (`a3e85df`) | 3,256,563 | `f4345b4aa63dc9a1e0e61e01fd83fdbb95a296701ecaa84650e1909c44119760` |

**Harness: 32/32** on the fixed build. **On `main` it gives 21/32**, so it can fail for the right
reason: the eleven that fail are every check that an earlier School's rows survive; the 21 that pass
are the fixture, the Rule 4 gate, a real School change, untouched manual rows and purchased Kiho,
which must behave as they did. Its oracles are the rendered Techniques list, the saved Schools list,
`collectData()`/`applyData()` and the libraries' own Technique lists, never the fix.

| Scenario | Checks | What it drives |
|---|---:|---|
| Add | 10 | Rank 3 Hida Bushi adds Hiruma Bushi through the real select; Hiruma Ranks 1 and 2; no duplicates after repeated recalculation; save and load; Play; no page errors |
| Gate | 2 | Without Hiruma's School Skills nothing new unlocks and nothing is lost |
| Three | 3 | A third School whose name holds "]" (Kaiu Engineer [Artisan/Bushi]); all three keep their rows |
| Rename | 5 | An earlier Kaiu Engineer keeps its rows while the active School is retyped; the renamed School's rows go; a typed row stays |
| Monk | 9 | A Four Temples monk's Technique and free Kiho survive adding Hiruma; Apply School then clears both, keeps the purchased Kiho and a typed row |
| Single | 3 | A one-School character's Apply School replaces, as the trunk always has |

**Deliberate faults**, each built in a scratch copy, all failing with exactly the pinned assertions in
`qa/expected-failures.json` (discovered, then confirmed by a separate pinned run: "all as expected"):

| Variant | Result |
|---|---:|
| Fix removed (the rebuild is `main`'s build) | 21/32 |
| Switch off | 21/32 |
| Asks whether the previous School is the active one, not an earlier one | 21/32 |
| No clean-up on a real School change | 30/32 |
| Clean-up leaves free Kiho behind | 31/32 |
| Reads the School from a row's tag up to its first "]" | 31/32 |
| Clean-up also takes untagged rows | 28/32 |

**Boundary**, fully green: Phase 12's modes switched off, 32/32 (the fix does not need them).

**Removal:** `qa/test-removal.py` **12 tests, 11 passed, 1 skipped** (Windows refuses symlinks
without Developer Mode). The live-tree test strips later releases through the chain, removes this
fix from a copy and rebuilds to exactly `main`'s build above. Shared registry `qa/test-chain.py`
**11/11**. With this fix in the tree, the live removal tests of the Manage fix (11, 1 skipped), Phase
4.8 (20, 1 skipped) and Phase 11 (15, 1 skipped) all pass. `qa/feature-dependencies.py …
"BUGFIX"`: every reference to the fix's six names is inside the block it owns. `build.py
--check-drift`: identical to the Phase 0 build.

**Structure** (`qa/inventory.py`, against `main`): 270 element IDs, all unique, and every other
count unchanged; only the sheet script differs.

Not tested here: Safari and a real phone (headless Chromium only; see `MANUAL-TESTS.md`). The web
fonts do not load in this environment, which does not matter here: nothing in the fix depends on
layout.

### Regression matrix

| Area | Risk | Validation |
|---|---|---|
| Adding a School | High | Add, Three and Monk scenarios; four variants |
| Replacing a School (Apply School, typing) | High | Single, Rename and Monk scenarios; three variants |
| Rows the player owns (typed Techniques, purchased Kiho) | High | Checked in four scenarios; one variant |
| Persistence | Medium | Save and load round trip; no saved field added or reshaped |
| Play mode | Low | Rows unchanged in Play; boundary with the modes off |
| Everything else | — | The full retained suite |

## Usage

Claude Pro weekly allowance, the owner's readings: **24%** at the start of this session (after the
assessment; the ledger's last reading was 22%). The reading after this fix is to be taken before
Phase 4.6 starts.
