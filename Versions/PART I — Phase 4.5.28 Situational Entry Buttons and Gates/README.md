# Phase 4.5.28 — Situational Entry Buttons and Gates

Part I. Built 7 October 2026 (Claude) on `claude/phase-4-5-28-situational-buttons` from `main` at
`32bebec`, from the owner's device check of Phase 4.5.27 and the rulings taken on it the same day.

The owner ran the [Situational Roll Entries — Test Checklist](https://claude.ai/code/artifact/e242e507-13ce-43aa-a557-65e11c263f1d)
on Windows (Edge), with 9.1 and 9.2 then on the iPhone: **31 Pass, 2 Fail**.

- **6.1 Fail:** Imperial Scribe requires Status 2+ and Calligraphy 4+, and nothing checked it (4.5.27 had
  deferred the requirement to the end-of-project Glory, Status and Honour review).
- **1.5 Fail (a design objection, the check itself behaved):** Wary felt clunky as a tick on every
  Investigation roll; the owner suggested a button on the row that opens the right roll.

## The owner's rulings (7 October 2026)

- **Item 1, gates:** Imperial Scribe and Sacrosanct (Honor 6.0+, the only other Advantage in the
  catalogue that states a requirement) gated to Feature 4.5.5's standard: greyed out in the Advantage
  picker with the requirement in the label; on a row already on a character that does not meet it, the
  row says why and Imperial Scribe's +1k0 and Free Raise are not offered.
- **Item 2, Wary:** having re-read Core p.155 (one roll: Investigation (Notice) / Perception against
  Stealth (Ambush) / Agility, to detect an ambush), **one Spot ambush button** on Wary's row that opens
  that roll with +1k1 already ticked, and **no** Wary tick on ordinary Investigation rolls.
- **Precise Memory:** a **Recall** button that opens the Intelligence roll with +1k1 **already applied
  as a modifier instead of a tick**; no tick on ordinary Intelligence rolls.
- **Item 3, parked:** the four resist entries' clutter (Balance, Clear Thinker, Heartless,
  Irreproachable on every roll). The code works; the review belongs to Phase 15 or the end of the
  project. Recorded in memory, the ledger and the roadmap, with the owner's three ideas: a closed
  "Resisting?" line, limiting each to the book's rolls, or row badges that open a dedicated roll.

## What it does

| Entry | Before (4.5.27) | Now |
|---|---|---|
| Wary | A tick on every Investigation / Perception roll | A **Spot ambush** button on its row. The roll is titled "Spot ambush — Investigation (Notice) / Perception", rolls Investigation at the character's highest Rank (Rank 0: Perception alone, no explosions) with Wary +1k1 applied (first shipped as a pre-ticked option; corrected the same day, below). Void and every other preview option are offered as usual; a Notice Emphasis keeps its re-roll of 1s after the roll. Wary is a tick on no roll |
| Precise Memory | A tick on every Intelligence Trait Roll | A **Recall** button on its row. "Recall — Intelligence Trait Roll" with Precise Memory +1k1 in the modifier list, no tick. Nothing on ordinary Intelligence rolls |
| Imperial Scribe | Selectable and active for anyone | Greyed out in the picker as "— needs Status 2+ and Calligraphy 4+" until Status (Points) is 2.0+ and the highest Calligraphy Rank is 4+. An unqualified row reads, for example, "Not in effect: needs Calligraphy Rank 4+ (yours 3). Its +1k0 and Free Raise are not offered until then." |
| Sacrosanct | Selectable for anyone | Greyed out as "— needs Honor 6.0+" until Honor (Points) is 6.0+; an unqualified row says so |

Status and Honor are read from their Points boxes (the full value, such as 6.2), falling back to the
Rank box when Points is empty; everything is re-read on every recalculation, so raising Status or
Calligraphy unlocks the entry at once. No row is repriced or removed, and nothing is saved.

## Real-device corrections — 7 October 2026

The owner ran the [Situational Entry Buttons and Gates — Test Checklist](https://claude.ai/code/artifact/bd563c7b-96c9-40f9-a76f-4672aa92026e) on Windows
(Edge), with Test 6 on the iPhone: **21 Pass, 1 Not run** (1.4). Two corrections followed, made in this
release's own fragment as earlier same-day device corrections were; the owner approved them "as
recommended".

- **Wary's tick was redundant (notes on 1.2 and 1.4).** Spot ambush now applies Wary's +1k1 as a
  modifier, as Recall does; Wary is a tick on no roll at all. The registry hook (`RD4515.start`) and
  the fallback that applied Wary when no preview armed it are gone, so this release no longer
  touches Feature 4.5.15.
- **3.4: the "Not in effect" line did not appear when Calligraphy's Rank was changed.** The bonuses
  were withheld correctly (that is decided at roll time), but the row's line was drawn only from a
  `recalcAll` wrapper, and the Skills table's own listeners hold the trunk's `recalcAll`, captured at
  load before any wrapper existed. The line and the picker are now refreshed from
  `refreshAllAdvConfigControls`, which the trunk's `recalcAll` calls by name on every pass. Honor's
  and Status's Rank and Points boxes have no recalc listener at all, so this release now listens to
  those four itself (refreshing only its own rows and the picker). The checklist walk had passed 3.4
  because it forced a recalc after each change; it now types into the boxes as a player does, and on
  the first-ship build it reproduces the owner's finding (and the same gap on Honor, 4.2).
- **1.6, kept by the owner:** Spot ambush does not need the Notice Emphasis. "Investigation (Notice)
  / Perception" names the roll; owning Notice only adds its re-roll of 1s.

Corrected build: **3,587,753 bytes**, SHA-256 `d711f1ce7de21121e8fb3c915ff49f1ff26502ae18ff1e11041182f949b39311`
(first ship `b7ee968c…`, 3,586,935 bytes). Removal still restores Phase 4.5.27's `26eb8d8c…` exactly.

| Check (corrected build) | Measured result |
|---|---|
| Own harness | **71/71** (13/37 on `32bebec`; on the first-ship build it fails the five checks the corrections answer) |
| Full combined suite | **4,450/4,450** = the 4,379 retained checks with this release present + 71 |
| Surgical removal | Byte-identical to `26eb8d8c…`; **4,389/4,389** retained |
| Variants | 17 pinned, all as expected; "Rows follow only a full recalc" fails exactly `SB-TYPED-RANK-SHOWS-NOTE`, "Honor and Status boxes not watched" exactly the two typed Honor/Status checks |
| Boundaries | 4.5.27's harness 117/117 with this release and 127/127 without; the registry 53/53 and the eligibility gates 41/41 with it removed; dependency boundaries 49/49 |
| Remover fixtures, ownership scan, removal chain | 22 + 1 skip; exit 0; 11/11 |
| Checklist walk (typed, no forced recalc) | 22/22 on the corrected build; 17/22 on the first-ship build (T1.2, T1.4, T3.4, T3.6, T4.2) |

4.5.27's harness, when this release is present, now treats Wary like Precise Memory: neither is offered,
their ten per-roll dice checks are not run, and its tick lifecycle checks use Imperial Spouse on
Courtier (the same +1k1) in Wary's place (117 checks; 127 without this release, as first shipped).

## Implementation and removal

One script, `src/sheet/209.9999995-feat-situational-buttons.js` (`SIT4528`, marker
`PART I FEATURE 4.5.28`, switch `SITUATIONAL_BUTTONS_ENABLED`); one stylesheet,
`src/css/59.99991-feat-situational-buttons.css` (own classes; the buttons deliberately avoid
`.adv-config-btn`, which Phase 12.5 hides in Play, because rolling is a Play action); one guarded seam
block in `210-test-seam-and-init.js`; two manifest entries. It changes 4.5.27's three entries from
outside (their `when` tests and `SIT4527.freeRaise`), and wraps `rollWithModifiers` (to mark the roll
`rollSkill` builds for Spot ambush), `advConfigExtendedRollModifiers` (Recall's and Spot ambush's +1k1),
`refreshAllAdvConfigControls` (the row line and the picker; `recalcAll` only if that is absent) and
`R455.ineligible` (the picker), and listens to the four Honor and Status boxes. As first shipped it
wrapped `recalcAll` and `RD4515.start` instead; see the corrections above. See [ROLLBACK.md](ROLLBACK.md).

Restore point recorded before any edit: `main` at `32bebec`, **3,573,333 bytes**, SHA-256
`26eb8d8c1f0c61c015831e5b426010d470d49df1a2d86975f5fc9f3b58fa416f` (Phase 4.5.27's live build).
Release build: **3,586,935 bytes**, SHA-256 `b7ee968c48fccb650e43816797f49ebb06f60755dcdb9c880b979ff855be55df`
(the manifest's `expect_sha256`).

## QA — 7 October 2026 (first ship; the corrected build's QA is above)

| Check | Measured result |
|---|---|
| Own real-browser harness | **69/69** at 375px with fixed dice; **13/37** on `32bebec` (sections that need the new code abort there), so it can fail |
| Full combined suite | **4,453/4,453** = the 4,384 retained checks with this release present + 69; zero failed suites |
| Surgical removal | Rebuilds **byte-identical** to `26eb8d8c…` (3,573,333 bytes); **4,389/4,389** retained checks on those exact bytes |
| Remover fixtures | 23 run: **22 passed**, one skipped (Windows refuses the symlink fixture), including a real removal from a scratch copy of the live tree and Feature 4.5.27's remover refusing while this is present |
| Ownership scan | `feature-dependencies.py`: every reference inside `PART I FEATURE 4.5.28` blocks, exit 0 |
| Removal chain registry | One entry added at the end; its own checks **11/11**; Feature 4.5.27's remover fixtures still **20 + 1 skip** |
| Inventory | Unchanged apart from size: the same element IDs, sections, overlays and seams; seven registry seats |
| Dependency boundaries | **49/49**: 4.5.27 absent (nothing), its switch or roll effects off (buttons gone, notes kept), registry off or absent (Wary applied directly on Spot ambush), picker gate off (not greyed, rows still explain and withhold), no page errors |
| Retained checks corrected (test-only, declared) | 4.5.5 `GATES455-GATE-04` 40/41 before, 41/41 both ways; 4.5.27's harness reads `SIT4528`: 122/122 with this release, 127/127 without |

The first full-suite run found a real defect in this release, fixed before release: the fallback that
applies Wary when no preview armed it remembered only the latest previewed roll, so an earlier Spot
ambush roll could get Wary back after a later preview opened (4.5.27's `SIT-OLD-ROLL-RELEASED` caught
it). It now remembers every previewed roll; two new checks pin it.

A measuring lesson: off-screen carousel pages use `content-visibility:auto`, so the first card on one
measured 0 wide while its children laid out normally. The layout checks now show the Advantages tab
first, as a player sees it.

### Deliberately broken builds (pinned; discovery, then a pinned run: all 16 as expected, 5 boundaries green)

| Mutation | Result | What failed |
|---|---|---|
| Release removed / switch off | 13/37 | Every section that needs the buttons, gates or seam |
| No stylesheet | 63/69 | The four layout widths, the compact button and the gold note |
| Wary still a tick on ordinary rolls | 67/69 | The ordinary Investigation roll and the cancel-no-carry check |
| Wary not ticked when Spot ambush opens | 58/69 | Every Spot ambush pool, dice and tick check |
| Skipped preview loses Wary | 68/69 | `SB-AMBUSH-SKIPPED-PREVIEW-STILL-APPLIES` |
| Precise Memory still a tick | 67/69 | The ordinary Intelligence roll and Recall's no-tick check |
| Recall without its bonus | 64/69 | Recall's preview, dice, reroll, two-rows and Play checks |
| Scribe Status ignored | 62/65 | The Status 1.9 picker case and the row note (the gated-rows section aborts) |
| Scribe Calligraphy 3 enough | 68/69 | `SB-PICKER-SCRIBE-CALLIGRAPHY-3` |
| Sacrosanct Honor 5 enough | 62/69 | Its picker, 5.9 and row checks, and the four layout widths (one note fewer) |
| Status read from Rank only | 68/69 | `SB-PICKER-FOLLOWS-RECALC` (Honor Points 6.2 with Rank 5) |
| Picker not greyed | 63/69 | The six greyed-out picker checks |
| Unqualified Scribe still offered / keeps Free Raise | 67/69 each | The two unqualified-Scribe bonus checks |
| Buttons take the hidden class | 66/69 | Usable in Play, and both in-Play rolls |

Boundaries: 4.5.27's harness with this release (122/122) and with it removed (127/127); the registry
(53/53) and the eligibility gates (41/41) with it removed; dependency boundaries (49/49).

## Usage

Read from the meter (Claude Pro, account-wide): weekly 13% → **18%** from the build's start through the
merge, live check and checklist doc (5-hour 0% → 41% after its 17:40 UTC reset), so about 5 points of the
week; reading the owner's results and the rulings took about 1 more. Readings, not a precise cost.

## Live — 7 October 2026

merged by fast-forward at `ec7f42a`; the deployed page matches the committed build plus its app head byte for byte (3,592,584 bytes, SHA-256 `4d80bae2…`), service worker `6e5f652849ea4a5c`; **285/285** focused checks on the downloaded page (this release 69, Situational Roll Entries 122, the eligibility gates 41, the registry 53); the checklist walked through the real controls on the live site: **22/22**. Your check is the [Situational Entry Buttons and Gates — Test Checklist](https://claude.ai/code/artifact/bd563c7b-96c9-40f9-a76f-4672aa92026e) (Tests 1–6, about 10–15 minutes). iPhone and Windows: Not run. Evidence: `qa/live-verification.json`, `qa/live-qa.log`, `qa/live-checklist-walk.log`.

## Run

From this folder, with the QA environment (Node, Playwright) set up as in earlier releases:

```
node qa/situational-buttons-harness.js "<built sheet>"
node qa/current-suite-runner.js "<built sheet>"          # expects 4,453
python -B qa/verify-regression.py                        # full suite, then removal + retained suite
python -B qa/verify-variants.py --jobs 2                 # pinned mutations and boundaries
python -B qa/test-removal.py                             # remover fixtures
```

Owner checks: [MANUAL-TESTS.md](MANUAL-TESTS.md).
