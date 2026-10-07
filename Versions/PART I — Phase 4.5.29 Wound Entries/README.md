# Phase 4.5.29 — Wound Entries

Part I. Built 7 October 2026 (Claude) on `claude/phase-4-5-29-wound-entries` from `main` at `9f84489`,
on the owner's approval of the reassessment ("proceed as recommended"): row 2 of the revised build order.

Four Advantages and Disadvantages that change how Wounds work, which until now only recorded their cost
and text:

| Entry | Rule (Core Rulebook, our own words) | What the sheet now does |
|---|---|---|
| Strength of the Earth (p.154) | each Wound Rank's penalty is 3 lower | every penalty 3 smaller, never below none (Nicked's 3 becomes none) |
| Low Pain Threshold (p.160) | each Wound Rank's penalty is 5 higher | every rank that has a penalty gives 5 more; Healthy stays at none |
| Bad Health (p.156) | Earth counts one lower for the Wound Ranks and for resisting disease | the Wound Ranks use Earth one lower, never below 1; disease is a reminder on the row |
| Permanent Wound (p.161) | the first Wound Rank always counts as full | Healthy holds no Wounds of its own: the first Wound makes you Nicked, and the track shrinks by Healthy's size |

A character with both Strength of the Earth and Low Pain Threshold gets both (+5, then −3). The wound
track, its info pop-up and the Quick Access panel show the adjusted penalty and name the entry; every
roll whose Wound Penalty an entry changed carries a line saying so (also when Strength of the Earth
cancels it, so it never just disappears). Each entry's row says what it is doing.

## The owner's instruction: extra care, because the wound core may change

> "be extra cautious with the changes affecting wounds … I think I have made a mistake with how wounds
> are calculated and so if at the end of the project I wish to change it I don't want it to break these
> changes"

**A finding while building this, not acted on:** Core p.82 gives Healthy **Earth × 5** Wounds and each
other rank the campaign's Earth multiplier (×2 by default; the sidebar offers ×3 and ×4). The sheet gives
Healthy **Earth × 2** and each later rank **Earth × 1** more. So the owner's suspicion is borne out. It is
left as it is: changing it is the owner's end-of-project decision, and this release is built to survive it.

**How the release survives a change to the wound core.** It does no wound arithmetic of its own. It
wraps three existing functions and only adjusts what each already returns, calling the original first:

| Core function | What this release assumes | What it changes |
|---|---|---|
| `computeWoundThresholds(earth)` | one rising limit per wound level | Bad Health passes a lower Earth; Permanent Wound subtracts the first limit from every limit |
| `getWoundPenalty()` | one signed number; size = how bad, sign = however the core applies it | Strength of the Earth and Low Pain Threshold change the size only; the sign is always the core's |
| `formatWoundPenalty(lvl)` | builds the level's text from its `pen` string (`'-3'`, or `'—'` for none) | asks the core for the text with the adjusted number, then names the entry |

This contract is written out in full at the top of the fragment. Two "future core" boundary runs prove it:
the sheet rebuilt with the book's Wound Ranks (Healthy Earth × 5, the others Earth × 2), and rebuilt with
the penalty applied as a TN increase (positive numbers), each pass **this release's whole harness**. The
harness never assumes the core's numbers: every expected limit and penalty is worked out from the core's
own functions, with only the book's Nicked +3 and Grazed +5 as absolute sizes.

**If you change how Wounds are calculated:** keep the three function names doing the jobs above and this
release follows automatically. If you rename or replace one, its adapter is simply not installed (every one
is guarded) and the harness's `WE-CONTRACT-*` checks fail, pointing to the fragment's contract. Any adapter
that throws hands back the core's own result. With none of the four entries on a character, all three
functions return exactly what the core returns (measured over Earth 1–6 and every Wounds total).

## Implementation and removal

One script, `src/sheet/209.9999996-feat-wound-entries.js` (`WND4529`, marker `PART I FEATURE 4.5.29`, switch
`WOUND_ENTRIES_ENABLED`); one stylesheet, `src/css/59.99992-feat-wound-entries.css` (own class); one guarded
seam block; two manifest entries. Besides the three core functions it wraps `advConfigExtendedRollModifiers`
(the roll line, informational only) and `refreshAllAdvConfigControls` (the row lines, which therefore follow
every recalc, including the list listeners that bypass `recalcAll` wrappers). **Nothing in the wound core is
edited**: a remover fixture proves `110-modals-trackers.js` and `170-feat-wounds.js` byte-identical before and
after removal. See [ROLLBACK.md](ROLLBACK.md).

Restore point: `main` at `9f84489`, **3,587,753 bytes**, SHA-256
`d711f1ce7de21121e8fb3c915ff49f1ff26502ae18ff1e11041182f949b39311` (Phase 4.5.28, corrected and live).

## QA — 7 October 2026

Release build: **3,604,557 bytes**, SHA-256 `fa745f5b243121c1cd8a115c01aa7dbeaca8712b4cd58be386b9e401efec9aaf`.

| Check | Measured result |
|---|---|
| Own harness | **45/45** (5/17 on `9f84489`: it can fail). Includes CONTRACT, IDENTITY (Earth 1–6, every Wounds total, no entry / wrong lists / renamed), every level for each entry, the book anchors, the display, rolls and row lines |
| Full combined suite | **4,493/4,493** with the first 43 checks (no retained check changed); the two rule checks added afterwards bring this release to 45, run in full inside Phase 4.5.30's regression |
| Surgical removal | Rebuilds **byte-identical** to `d711f1ce…` (3,587,753 bytes); **4,450/4,450** retained checks on those exact bytes |
| Remover fixtures | 23 run: **22 passed**, one skipped (Windows symlinks); includes a real removal of a scratch copy of the live tree and the proof that the wound core files are byte-identical before and after |
| Ownership scan, inventory | exit 0; unchanged apart from size |
| Variants | **14 pinned, all as expected.** The first discovery found two blind spots ("Strength of the Earth can go below none", "Low Pain Threshold also on Healthy": neither can show with today's smallest penalty, 3); two rule checks were added and now catch each alone |
| **FUTURE CORE boundaries** | the sheet rebuilt with the **book's Wound Ranks** (Healthy Earth × 5, the others Earth × 2): **45/45**; rebuilt with the **penalty as a TN increase** (positive numbers): **45/45** |
| Other boundaries | Phase 4.5.28's harness with this release removed 71/71; dependency boundaries 21/21 (Advantage configuration off: penalties, ranks and track text still work; the roll line and row lines need it) |

## Run

```
node qa/wound-entries-harness.js "<built sheet>"
node qa/current-suite-runner.js "<built sheet>"
python -B qa/verify-regression.py
python -B qa/verify-variants.py --jobs 2      # includes the two FUTURE CORE boundaries
python -B qa/test-removal.py
```

Owner checks: [MANUAL-TESTS.md](MANUAL-TESTS.md).
