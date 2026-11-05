# Release 15a · A02 — handover

**State, 5 November 2026 (13:24 UTC):** built on branch `claude/release-15a-a02`. **Qualified.** The first pair of full passes did not meet the rule: pass 2 failed in a service-worker harness and was not re-run. On the owner's ruling (option 1, below), that harness's open-ended waits were given their own limits as a separate unit. The whole chain then ran again on the same candidate: attempt 4 passed every stage, and **full passes 3 and 4 both passed on their first executions**. **The owner's device checks and decision are next. Not merged, not deployed.** Merging to `main` needs the owner's decision (Accept) and then the separate go-live word.

| | |
|---|---|
| Branch | `claude/release-15a-a02` (build `d4540360`; first evidence `d3d173cc`; harness fix `13f85caf`; re-qualification evidence and records follow) |
| Candidate application | `1cc41d8c3d8bc93cb5350972ce1b438e0636aa683df9fa74076498cccfac5d2c`, 17,537,209 bytes |
| Predecessor (A01 as live) | `cffde62440c3bb037f1ecfe7024b3ae9b3c765bcaccb86d2ea368700aecb0414`, 17,531,533 bytes (main `2782df61`) |
| Preview | <https://claude-release-15a-a02.l5r-character-sheet-creator.pages.dev/> (serves the candidate: page `fde3cfd7…`, 17,543,986 bytes, service worker `de06fea28f3f679c`, byte for byte with the local build) |
| Owner checklist | [A02 device checks (Claude Doc)](https://claude.ai/artifact/28WsHerG4EDkzZwSac8ocp) · [DEVICE-CHECKS.md](DEVICE-CHECKS.md) |
| Comparison | [COMPARISON.md](COMPARISON.md) |
| What A02 is and owns | [README.md](README.md) · [ROLLBACK.md](ROLLBACK.md) |

## What changed

A 52 px band now sits between the pages and the tab bar. Quick Access (left), return-to-top (middle, only after scrolling) and the dice (right) are drawn on it, so nothing lies over the sheet and return-to-top no longer sits on the tabs. On a phone, 52 of 57 measured states had a control over the page before; none do now. The pages are 52 px shorter. Search stays in the app bar.

## Verification, measured on this run

| Check | Result | Evidence |
|---|---|---|
| A02's own harness | 23/23 on the candidate; 23/23 on the A01-removed build | `qa/floating-strip-harness.js`, `qa/a01-removed-a02-kept.log` |
| Removal proof | 10/10 in attempts 3 and 4: A02 alone rebuilds A01 `cffde624…0414` exactly, then A01 rebuilds 8c `139e0810…2551` exactly; A01 alone with A02 kept verifies; refusals fire | `qa/removal-final-1cc41d8c-3.log`, `qa/removal-final-1cc41d8c-4.log` |
| Negative variants | 9/9 matched their pinned failures in attempts 3 and 4 (three pins corrected from the first prediction, documented) | `qa/variants-final-1cc41d8c-3.log`, `qa/variants-final-1cc41d8c-4.log`, `qa/VARIANT-PINS.md` |
| Dependency check | clean in attempts 3 and 4: every reference inside A02's own blocks | `qa/dependencies-1cc41d8c-3.log`, `qa/dependencies-1cc41d8c-4.log` |
| Code review (one, read-only) | no defects; two notes fixed, the rest recorded | `qa/code-review.md` |
| 4× CPU screen | attempt 1: 3,914/3,915 (a harness timing fault, fixed without loosening); attempt 3: **68/68 harnesses, 3,915/3,915**; attempt 4: **68/68, 3,915/3,915** | `qa/investigation/README.md`, `qa/under-load-final-1cc41d8c-3.log`, `qa/under-load-final-1cc41d8c-4.log` |
| Discovery run | attempt 3: **6,828/6,828**; attempt 4 (fresh folder): **6,828/6,828** | `qa/discovery-1/full.log`, `qa/discovery-2/full.log` |
| Full pass 1 | **passed**: candidate 6,828/6,828, retained 6,732/6,732, removal to `cffde624…0414` exact | `qa/final-run-1/summary.json` |
| Full pass 2 | **failed**: candidate 6,816/6,828. `pwa-harness.js` (Part F Phase 0.6, inside `sw-checks.js`) stalled after 6 of 12 checks until its 20-minute limit; retained suite and removal did not run. Not re-run | `qa/final-run-2/`, `qa/run-final-twice.log` |
| Pass 2 investigation | 25/25 isolated runs of an instrumented copy pass 12/12 (~7 s each) on the same candidate; no sleep or power event in the window; the stall sits in waits with no limit of their own; not reproduced | `qa/investigation/README.md`, `qa/investigation/pwa-pass2/` |
| Harness fix (its own unit, outside A02) | `pwa-harness.js`'s open-ended waits limited to 60 s each (a limit reached is a failure that names the step, never a retry), and its test server stops for certain; no check's name, count (12) or pass condition changed. Stall tests 4/4 twice, 25/25 in a row, removal 8/8, one review | [QA — PWA Harness Step Limits 2026-11-05](<../../../../QA — PWA Harness Step Limits 2026-11-05/README.md>), commit `13f85caf` |
| Qualification attempt 4 | every stage passed, from removal on, with the fix in place | `qa/qualification-1cc41d8c-4.json`, `qa/qualify-launch-4.log` |
| Full pass 3 | **passed**: candidate 6,828/6,828, retained 6,732/6,732, removal to `cffde624…0414` exact (service-worker leaf 85 s) | `qa/final-run-3/summary.json`, `qa/run-final-twice-34.log` |
| Full pass 4 | **passed**: candidate 6,828/6,828, retained 6,732/6,732, removal to `cffde624…0414` exact (service-worker leaf 84 s) | `qa/final-run-4/summary.json`, `qa/run-final-twice-34.log` |
| Comparison | phone 52 → 0 states with a control over the page; 0 of 171 states over the page or on the tabs | [COMPARISON.md](COMPARISON.md) |
| Local package | 496/496 on the deployed files (21 harnesses) | `qa/verify-local.log` |
| Hosted branch preview | byte for byte, 496/496 | `qa/verify-preview.log` |

## Resolved: qualifying A02 after the failed pass

The rule is that both full passes succeed on their first executions, and a failed pass is never re-run. Pass 2 failed, so A02 was not qualified. The options put to the owner:

1. **Fix the stall's cause first, then a fresh pair of full passes (recommended).** Give `pwa-harness.js`'s unbounded waits their own limits, so a stall fails at once and names its step instead of waiting 20 minutes in silence. That is a separate small unit (Part F, Phase 0.6's harness; no app change), outside A02, with its own record. Then two fresh full passes on the same candidate `1cc41d8c…5d2c`.
2. **A fresh pair of full passes with nothing changed.** Quicker, but it is close to re-running a failed suite, and the stall could recur.
3. **Accept pass 1, discovery and the investigation as enough for A02.** This waives the two-pass rule for this release only.

**The owner chose option 1 on 5 November ("Fix harness, then passes").** The fix is its own unit, [QA — PWA Harness Step Limits 2026-11-05](<../../../../QA — PWA Harness Step Limits 2026-11-05/README.md>) (commit `13f85caf`, with its own ROLLBACK). It changes one QA file and no application byte. Passes 1 and 2 were not re-run, and their records stay as they were. The whole chain then ran again from removal (attempt 4, with a fresh discovery folder `discovery-2/`). Passes 3 and 4 were the fresh pair, and both passed on their first executions. The original stall's exact step is still unknown. With the fix in place, a repeat would fail within about a minute and name its step.

## Usage (Claude, account-wide, kept separate from Codex)

| When (UTC) | Five-hour | Weekly | Note |
|---|---|---|---|
| 4 Nov 19:55 | 22% | 17% | start |
| 4 Nov 20:50 | 56% | 21% | before full QA |
| 5 Nov 00:39 | 12% | 25% | after the full passes (five-hour window reset at 21:50) |
| 5 Nov 00:51 | 16% | 25% | after the first records |
| 5 Nov 13:24 | 19% | 28% | end, after the harness fix, re-qualification and records |

Weekly use moved by about 11 points against A02's 5 (3–8) estimate, above its range. About 8 went to the first records (the failed pass and its investigation included), and about 3 more to the harness fix and re-qualification.

Model `claude-opus-5-5`. Account-wide readings from the desktop app (`qa/usage.json`), not exclusive to A02. The qualification chain and the full passes ran on the machine, not on the allowance.

## Follow-ups (not A02's; nothing built)

1. Review note: `TABS-REACHABLE` centres each tab before testing it; the tab bar's ends are covered by the sweep's on-tabs test instead ([qa/code-review.md](qa/code-review.md)).
2. Review note: the app bar at the bottom and the Quick Access panel at its height cap are untested by any harness (README, *Not verified automatically*).
3. Seen while measuring, already in A01's build and belonging to other findings: on the desktop, Advantages start far below Disadvantages when one list is empty (A03); the colophon's faint mon shows over the tab bar (B13).
4. FU-15a-1 (no duplicate Kiho, Kata or spells) remains recorded and unscheduled.

## Next

The owner walks the [checklist](https://claude.ai/artifact/28WsHerG4EDkzZwSac8ocp) on iPhone Safari and Laptop Edge and sets the decision: **Accept**, **Revise** or **Remove**. Merging to `main` and deploying then need the separate go-live word. A03 does not start until then.

- **The harness fix travels with this branch.** Commit `13f85caf` touches only Phase 0.6's `qa/pwa-harness.js` and its own folder. It can be merged with A02, or taken to `main` on its own (cherry-pick) if A02 is removed.

- **If it is ever removed:** follow [ROLLBACK.md](ROLLBACK.md): run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, then `build/recombine.py --verify`. It rebuilds A01's `cffde624…0414`.
