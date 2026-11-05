# Release 15a · A02 — handover

**State, 5 November 2026:** built on branch `claude/release-15a-a02`. **Qualification is not complete:** full pass 1 passed, full pass 2 failed in a service-worker harness that does not read anything A02 changes (below). Pass 2 was not re-run. **The owner decides how A02 is qualified from here**; the device checks can run meanwhile. **Not merged, not deployed.** Merging to `main` needs a met qualification, the owner's decision (Accept) and then the separate go-live word.

| | |
|---|---|
| Branch | `claude/release-15a-a02` (build commit `d4540360`; evidence and records commit follows it) |
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
| Removal proof | 10/10: A02 alone rebuilds A01 `cffde624…0414` exactly, then A01 rebuilds 8c `139e0810…2551` exactly; A01 alone with A02 kept verifies; refusals fire | `qa/removal-final-1cc41d8c-3.log` |
| Negative variants | 9/9 matched their pinned failures (three pins corrected from the first prediction, documented) | `qa/variants-final-1cc41d8c-3.log`, `qa/VARIANT-PINS.md` |
| Dependency check | clean: every reference inside A02's own blocks | `qa/dependencies-1cc41d8c-3.log` |
| Code review (one, read-only) | no defects; two notes fixed, the rest recorded | `qa/code-review.md` |
| 4× CPU screen | attempt 1: 3,914/3,915 (a harness timing fault, fixed without loosening); attempt 3: **68/68 harnesses, 3,915/3,915** | `qa/investigation/README.md`, `qa/under-load-final-1cc41d8c-3.log` |
| Discovery run | **6,828/6,828** | `qa/discovery-1/full.log` |
| Full pass 1 | **passed**: candidate 6,828/6,828, retained 6,732/6,732, removal to `cffde624…0414` exact | `qa/final-run-1/summary.json` |
| Full pass 2 | **failed**: candidate 6,816/6,828. `pwa-harness.js` (Part F Phase 0.6, inside `sw-checks.js`) stalled after 6 of 12 checks until its 20-minute limit; retained suite and removal did not run. Not re-run | `qa/final-run-2/`, `qa/run-final-twice.log` |
| Pass 2 investigation | 25/25 isolated runs of an instrumented copy pass 12/12 (~7 s each) on the same candidate; no sleep or power event in the window; the stall sits in waits with no limit of their own; not reproduced | `qa/investigation/README.md`, `qa/investigation/pwa-pass2/` |
| Comparison | phone 52 → 0 states with a control over the page; 0 of 171 states over the page or on the tabs | [COMPARISON.md](COMPARISON.md) |
| Local package | 496/496 on the deployed files (21 harnesses) | `qa/verify-local.log` |
| Hosted branch preview | byte for byte, 496/496 | `qa/verify-preview.log` |

## The decision needed: qualifying A02 after the failed pass

The rule is that both full passes succeed on their first executions, and a failed pass is never re-run. Pass 2 failed, so A02 is not qualified. Options for the owner:

1. **Fix the stall's cause first, then a fresh pair of full passes (recommended).** Give `pwa-harness.js`'s unbounded waits their own limits, so a stall fails at once and names its step instead of waiting 20 minutes in silence. That is a separate small unit (Part F, Phase 0.6's harness; no app change), outside A02, with its own record. Then two fresh full passes on the same candidate `1cc41d8c…5d2c`.
2. **A fresh pair of full passes with nothing changed.** Quicker, but it is close to re-running a failed suite, and the stall could recur.
3. **Accept pass 1, discovery and the investigation as enough for A02.** This waives the two-pass rule for this release only.

Nothing has been done on any of these.

## Usage (Claude, account-wide, kept separate from Codex)

| When (UTC) | Five-hour | Weekly | Note |
|---|---|---|---|
| 4 Nov 19:55 | 22% | 17% | start |
| 4 Nov 20:50 | 56% | 21% | before full QA |
| 5 Nov 00:39 | 12% | 25% | after the full passes (five-hour window reset at 21:50) |
| 5 Nov 00:51 | 16% | 25% | end, after the records |

Weekly use moved by about 8 points against A02's 5 (3–8) estimate, at the top of its range; the failed pass and its investigation are in it.

Model `claude-opus-5-5`. Account-wide readings from the desktop app (`qa/usage.json`), not exclusive to A02. The qualification chain and the full passes ran on the machine, not on the allowance.

## Follow-ups (not A02's; nothing built)

1. Review note: `TABS-REACHABLE` centres each tab before testing it; the tab bar's ends are covered by the sweep's on-tabs test instead ([qa/code-review.md](qa/code-review.md)).
2. Review note: the app bar at the bottom and the Quick Access panel at its height cap are untested by any harness (README, *Not verified automatically*).
3. Seen while measuring, already in A01's build and belonging to other findings: on the desktop, Advantages start far below Disadvantages when one list is empty (A03); the colophon's faint mon shows over the tab bar (B13).
4. FU-15a-1 (no duplicate Kiho, Kata or spells) remains recorded and unscheduled.

## Next

The owner rules on qualification (above). The owner can walk the [checklist](https://claude.ai/artifact/28WsHerG4EDkzZwSac8ocp) on iPhone Safari and Laptop Edge meanwhile and set the decision: **Accept**, **Revise** or **Remove**. Merging to `main` and deploying need a met qualification, Accept, and the separate go-live word. A03 does not start until then.

- **If it is ever removed:** follow [ROLLBACK.md](ROLLBACK.md): run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, then `build/recombine.py --verify`. It rebuilds A01's `cffde624…0414`.
