# Release 15a · A03 — handover

**State, 6 November 2026 (about 03:45 UTC): A03 is BUILT AND QUALIFIED on its branch. The owner's device checks and decision are next.**
- Both full passes passed on their first executions.
- The preview and the checklist are ready.
- **Not merged, not deployed.** Merging to `main` and deploying need the owner's explicit go-live word.

| | |
|---|---|
| Branch | `claude/release-15a-a03` (from `main` `5f7a060f`, A02 live). Candidate frozen in `2c77bfd1`; qualification evidence and records follow |
| Candidate application | `eb1c29f799d6d655b8a4906e4d6a838689472e7b5d0b1d20383f7081f9a15d18`, 17,552,201 bytes |
| Predecessor (A02 as live) | `91d451099ee58f1b481fcf87b3defa7955138f9fb67a56e8fa6fac1e5ad66dc0`, 17,538,334 bytes |
| Preview | <https://claude-release-15a-a03.l5r-character-sheet-creator.pages.dev/> (serves A03: page `05e8d292…`, 17,558,978 bytes, service worker `54db2ae4b51eab75`, byte for byte with the committed build) |
| Owner checklist | [A03 device checks (Claude Doc)](https://claude.ai/artifact/CNTa2BVhtR2iHWrQ5EaNTM) · [DEVICE-CHECKS.md](DEVICE-CHECKS.md) |
| Comparison | [COMPARISON.md](COMPARISON.md) |
| What A03 is and owns | [README.md](README.md) · [ROLLBACK.md](ROLLBACK.md) |

## What A03 does

**1. Top-aligned columns.** On a wide screen the Advantage and Disadvantage columns now start level.
- **Cause:** the carousel aligns page grids to the bottom.
- **Before:** the headings were 1,092–2,249 px apart on the dense test character.
- **Scope:** only that grid changes, and only on screen.

**2. Compact phone Skill cards.** Each card is two short rows:
- name, Rank and d10;
- a labelled **Details** control with a one-line summary (Trait, Emphases, "School"), and the Skill Info eye.

Details opens the rest of the card in place: Trait, Emphases, School, XP, the Mastery and other notes, and Remove.
- **Size:** cards go from 324–601 px to 116 px, so about 5.5 fit on a phone screen instead of about 1.5.
- **Kept:** every value, tick and action, and Phase 12's Play locks. Management stays on the page.
- **Unchanged:** the desktop table, the tablet scroller and print.

**Scope as the kickoff set it.** No edit to Phase 12.4 (Part K) or Phase 4.54 (Part I) was needed: A03 layers on both. No independence conflict appeared.

## Reforecast (stated at the start; estimate only, not a budget approval)

- **A03:** the work order sets it at M, 5 (3–8). Reproduction showed a small change carried by a fixed process: harness, removal, variants, review, 4× screen, discovery, two passes and records.
- **The rest of 15a:** A01 took about 7 points and A02 about 17. At about 7 points a clean unit, the other 15 units of 15a would need about 100 more weekly points (80–150). Plan that as several weeks, not as the old grouped 20.
- **What A03 used:** see the usage table below.

## Verification, measured on this run (candidate `eb1c29f7…8d18`)

| Check | Result | Evidence |
|---|---|---|
| Reproduction on today's build | Desktop headings 1,092–2,249 px apart; phone cards 324–601 px | `qa/reproduce/predecessor-a02/` |
| A03's own harness | **32/32** (31 pinned first; one added after the review, pinned before running) | `qa/compact-skills-harness.js`, `qa/expected-checks.json`, `qa/own-eb1c29f7.log` |
| With A02 removed | A03's harness 32/32 on the A02-removed build | `qa/a02-removed-a03-kept.log` |
| Earlier layers with A03 present | A02's harness 23/23; Phase 12.4's Skills harness 17/17 | `qa/a02-harness-with-a03.log`, `qa/phase-12.4-with-a03.log` |
| Code review (one, read-only) | No blocking defect. Fixed:<br>• School-choice badge<br>• Emphasis over-limit warning<br>• `:has()` fallback<br>• two variants missing<br>• note order<br>• CRLF<br>Declared: focus order; three oracles that lean on the layer | `qa/code-review.md` |
| Variant discovery | 13 of 15 as pinned. Two failed more checks than predicted (none fewer); both explained, pins corrected from the observed failures | `qa/VARIANT-PINS.md`, `qa/variants-discover.log`, `qa/variants-discover-eb1c29f7/` |
| Qualification chain | Every stage passed, 00:29–01:52 UTC | `qa/qualification-eb1c29f7.json`, `qa/qualify-launch.log` |
| ↳ Removal proof | **12/12**:<br>• A03 alone rebuilds A02 `91d45109…6dc0` exactly;<br>• then A02 rebuilds A01 exactly;<br>• A02 alone and A01 alone verify with A03 kept;<br>• the refusals fire | `qa/removal-final-eb1c29f7.log` |
| ↳ Negative variants | **15/15** matched their pins | `qa/variants-final-eb1c29f7.log`, `qa/negative-eb1c29f7/` |
| ↳ Dependency check | Clean: every reference inside A03's own blocks | `qa/dependencies-eb1c29f7.log` |
| ↳ 4× CPU screen | **113/113 harnesses, 5,312/5,312** (A03's own and every geometry or Skill/Adv-list leaf), 45 min | `qa/under-load-final-eb1c29f7.log`, `qa/under-load-eb1c29f7/` |
| ↳ Discovery run | **6,860/6,860**, fresh folder, 182 leaves | `qa/discovery-1/full.log` |
| Full pass 1 | **passed**: candidate 6,860/6,860, retained 6,755/6,755, removal to `91d45109…6dc0` exact | `qa/final-run-1/summary.json`, `qa/run-final-twice.log` |
| Full pass 2 | **passed**: candidate 6,860/6,860, retained 6,755/6,755, removal to `91d45109…6dc0` exact | `qa/final-run-2/summary.json`, `qa/run-final-twice.log` |
| Comparison | Columns 0 px apart; cards 116 px; desktop Skills table unchanged | [COMPARISON.md](COMPARISON.md), `qa/reproduce/candidate/` |
| Local package | **545/545** on the deployed files (23 harnesses: A02's 21, A03's own and Phase 12.4's Skills harness) | `qa/verify-local.log` |
| Hosted branch preview | **545/545**, byte for byte with the local package (`verify-live.py --url=<preview>`) | `qa/verify-preview.log` |

**Counts, discovered and pinned:**
- **Candidate 6,860:** A03's 32 + A02's 6,828; 182 leaves.
- **Retained 6,755:** the tree with A03 removed (exactly A02), less the two live-site leaves; 179 leaves.

## Usage (Claude, account-wide, kept separate from Codex)

| When (UTC) | Five-hour | Weekly | Note |
|---|---|---|---|
| 5 Nov 23:34 | 10% | 35% | start |
| 6 Nov 00:17 | 52% | 41% | before full QA (after build, review and fixes) |
| 6 Nov 03:36 | 75% | 44% | after both passes, while the deployed-file checks and records were written |
| 6 Nov 03:45 | 78% | 44% | end, after the deployed-file checks, before the records commit |

Weekly use moved by about 9 points, against A03's 5 (3–8) estimate and the reforecast's 7 (5–10): about 6 to build, review and fix it (35% → 41%), and about 3 while the chain and passes ran and the records were written (41% → 44%). The records commit may add a little.

Model `claude-opus-5-5`. Readings come from the desktop app (`qa/usage.json`). They are account-wide, not exclusive to A03. The chain and the full passes ran on the machine, not on the allowance.

## Follow-ups (not A03's; nothing built)

1. **Browser print still aligns the Adv & Disadv columns to the bottom.** On paper Advantages start 836 px lower on the dense character. Print belongs to Release 15b's B12, where this belongs.
2. **Not verified automatically:**
   - Safari's `:has()` and `display: contents` on the owner's iPhone (device checks 4–11);
   - screen readers (the focus order is declared in the README);
   - the Fold's outer screen below 320 px.
3. **The 8b.1 UI follow-ups, FU-15a-1 and the parked stats header** stay as recorded.

## Next

**Stop for the owner.** The owner runs the [device checks](https://claude.ai/artifact/CNTa2BVhtR2iHWrQ5EaNTM) on iPhone Safari and Laptop Edge and sets the decision: Accept, Revise or Remove.
- **Accept and the go-live word:** fast-forward `main` to the branch (no merge commit, no force). Then verify production byte for byte with `qa/verify-live.py` (no `--url`), plus the browser and offline smoke, `BUGFIX — Older School Choices/qa/live-browser-smoke.cjs <qa/live>`.
- **Revise:** rebuild on this branch and re-qualify.
- **Remove:** `qa/remove-phase.py` on a scratch copy rebuilds A02 exactly ([ROLLBACK.md](ROLLBACK.md)).

A04 does not start until the owner decides.
