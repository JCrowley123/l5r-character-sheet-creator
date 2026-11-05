# Release 15a · A02 — handover

**State, 5 November 2026 (21:56 UTC): revision 2 is built and qualified** on branch `claude/release-15a-a02`. The owner checked revision 1 on their devices and chose **Revise**. Revision 2 removes the band and puts the floating controls in the bottom corners, just above the tabs. It passed every qualification stage, and **full passes 5 and 6 both passed on their first executions**. **Next: the owner's device checks of revision 2, and their decision. Not merged, not deployed.** Merging to `main` needs the owner's decision (Accept) and then the separate go-live word.

| | |
|---|---|
| Branch | `claude/release-15a-a02`. Revision 2: build `3254c2a3`, review fixes `91885213`, frozen `d3657abd`; qualification evidence and records follow. Revision 1: `d4540360` to `05ed4792` |
| Candidate application (revision 2) | `91d451099ee58f1b481fcf87b3defa7955138f9fb67a56e8fa6fac1e5ad66dc0`, 17,538,334 bytes |
| Predecessor (A01 as live) | `cffde62440c3bb037f1ecfe7024b3ae9b3c765bcaccb86d2ea368700aecb0414`, 17,531,533 bytes (main `2782df61`) |
| Preview | <https://claude-release-15a-a02.l5r-character-sheet-creator.pages.dev/> (serves revision 2: page `8a972827…`, 17,545,111 bytes, service worker `a05aaf784ac466c9`, byte for byte with the committed build) |
| Owner checklist (revision 2) | [A02 device checks, revision 2 (Claude Doc)](https://claude.ai/artifact/JHui5U5LGSWu7Xmkiceiyn) · [DEVICE-CHECKS.md](DEVICE-CHECKS.md) |
| Revision 1's checklist and the owner's comments | [Claude Doc](https://claude.ai/artifact/28WsHerG4EDkzZwSac8ocp) |
| Comparison | [COMPARISON.md](COMPARISON.md) |
| What A02 is and owns | [README.md](README.md) · [ROLLBACK.md](ROLLBACK.md) |

## The owner's decision on revision 1, and what revision 2 changes

Revision 1 put the three buttons on a 52 px band above the tabs. All 11 device checks passed on iPhone Safari and Laptop Edge, but the owner chose **Revise** (5 November). Their comments:
- The band made two solid bars at the bottom that felt separate from the sheet, starkly so on the laptop.
- On the iPhone it felt cluttered and claustrophobic, because it took page height.

**The owner's ruling:** (a) no bar; (d) the dice as a floating button; (e) return-to-top only after scrolling; Quick Access floating bottom-left.

**Parked:** (c), key stats always on view like D&D Beyond's header. It waits for the new Combat tab, where it fits better. It is recorded in the roadmap's Combat tab plan (commit `ec1cbed2`) and on the [Combat tab mock-up canvas](https://claude.ai/artifact/3xjspD1SqtVrRz46dvoM3h) (orange sticky "parked", version 30). The note there also says that the floating strip's Rest needs a new home.

**What revision 2 does:**
- Quick Access sits bottom-left and the dice bottom-right, 8 px above the tab bar.
- Return-to-top sits directly above the dice and shows only after scrolling. On a short screen (a phone on its side) it sits beside the dice instead.
- Every page gets room at its end as tall as the corner stack: 116 px, or 64 px on a short screen. So at the very end of a page nothing is left under a button.
- No page loses height. Part-way down a page, content passes under the corners, which the owner accepted.

**Measured on a phone:**
- Headings covered at the top: 19 → **0**.
- Controls on the tabs: 21 → **0**.
- Content covered at the very end of a page: 16 → **0**.
- Page height: 641 px, as in A01 (revision 1: 589).

## Verification, measured on this run (revision 2, candidate `91d45109…6dc0`)

| Check | Result | Evidence |
|---|---|---|
| A02's own harness | 23/23 on the candidate (the band's checks replaced by the corners'; still 23) | `qa/floating-strip-harness.js`, `qa/expected-checks.json` |
| Code review (one, read-only) | One defect, in the harness: its "part-way" scroll went to the top (revision 1 had the same slip). Fixed. Four notes fixed, the rest recorded | `qa/code-review.md` (revision 2 section), commit `91885213` |
| Variant discovery | All 11 (10 variants and the baseline) failed exactly their pins on the first run. The pins were written before any run; the stopped earlier run is kept | `qa/variants-discover-r2.log`, `qa/variants-discover-r2-stopped.log` |
| Removal proof | 10/10: A02 alone rebuilds A01 `cffde624…0414` exactly, then A01 rebuilds 8c exactly; A01 alone with A02 kept verifies; the refusals fire | `qa/removal-final-91d45109.log` |
| Negative variants | 11/11 matched their pinned failures | `qa/variants-final-91d45109.log`, `qa/negative-91d45109/` |
| Dependency check | Clean: every reference sits inside A02's own blocks | `qa/dependencies-91d45109.log` |
| 4× CPU screen | **68/68 harnesses, 3,915/3,915** | `qa/under-load-final-91d45109.log`, `qa/under-load-91d45109/` |
| Discovery run | **6,828/6,828** (fresh folder) | `qa/discovery-3/full.log` |
| Qualification chain | Every stage passed, 18:57–20:10 UTC | `qa/qualification-91d45109.json`, `qa/qualify-launch-r2.log` |
| Full pass 5 | **passed**: candidate 6,828/6,828, retained 6,732/6,732, removal to `cffde624…0414` exact | `qa/final-run-5/summary.json`, `qa/run-final-twice-56.log` |
| Full pass 6 | **passed**: candidate 6,828/6,828, retained 6,732/6,732, removal to `cffde624…0414` exact | `qa/final-run-6/summary.json`, `qa/run-final-twice-56.log` |
| Comparison | Phone, small phone, phone on its side and desktop: no heading covered at the top, no control on the tabs, nothing covered at the end, no page height lost | [COMPARISON.md](COMPARISON.md), `qa/reproduce/candidate-r2/` |
| Local package | 496/496 on the deployed files (21 harnesses) | `qa/verify-local-r2.log` |
| Hosted branch preview | byte for byte, 496/496 | `qa/verify-preview-r2.log` |

**Revision 1's record is kept as it was.** Revision 1 was candidate `1cc41d8c…5d2c`. Full pass 2 failed in Phase 0.6's service-worker harness. The owner chose to fix that harness first, as its own unit ([QA — PWA Harness Step Limits 2026-11-05](<../../../../QA — PWA Harness Step Limits 2026-11-05/README.md>), commit `13f85caf`). Then attempt 4 and full passes 3 and 4 passed. Its evidence is the folders ending `-1cc41d8c`, `-3` and `-4`, `discovery-1/-2`, `final-run-1` to `-4` and `reproduce/candidate/`. The harness fix still travels with this branch, and revision 2's passes ran with it in place.

**Revision 1's comparison numbers.** They were measured with the same "part-way" slip, so its part-way states were really top states. Its claims about the top and the end of a page stand. COMPARISON.md re-measures A01 with the corrected probe.

## Usage (Claude, account-wide, kept separate from Codex)

| When (UTC) | Five-hour | Weekly | Note |
|---|---|---|---|
| 4 Nov 19:55 | 22% | 17% | revision 1 start |
| 4 Nov 20:50 | 56% | 21% | revision 1 before full QA |
| 5 Nov 00:51 | 16% | 25% | after the first pair of passes and the investigation |
| 5 Nov 13:24 | 19% | 28% | revision 1 end (harness fix and re-qualification) |
| 5 Nov 18:13 | 6% | 29% | revision 2 start |
| 5 Nov 18:58 | 30% | 32% | revision 2 before full QA |
| 5 Nov 21:56 | 40% | 34% | revision 2 end, after qualification, both passes and the records |

Weekly use moved by about 17 points in all against A02's 5 (3–8) estimate, well above its range. Revision 1 took about 11 (its failed pass, the investigation and the harness fix included); revision 2 about 5: about 3 to build, review and fix it (29% → 32%), and about 2 while the chain and passes ran and the records were written (32% → 34%).

Model `claude-opus-5-5`. The readings come from the desktop app (`qa/usage.json`). They are account-wide, not exclusive to A02. The qualification chain and the full passes ran on the machine, not on the allowance.

## Follow-ups (not A02's; nothing built)

1. No harness exercises the app bar at the bottom or the Quick Access panel at its height cap. The arithmetic was checked by hand (README, *Not verified automatically*).
2. With the app bar on top, the Quick Access panel is short on a phone on its side (about 45–100 px of list). It works; device check 9 shows it.
3. Seen while measuring, already in A01's build, and belonging to other findings: the colophon's faint mon shows over the tab bar (B13). On the desktop, Advantages start far below Disadvantages when one list is empty (A03).
4. Parked by the owner: an always-visible stats header, with the Combat tab plan.
5. FU-15a-1 (no duplicate Kiho, Kata or spells) stays recorded and unscheduled.

## Next

The owner walks the [revision 2 checklist](https://claude.ai/artifact/JHui5U5LGSWu7Xmkiceiyn) on iPhone Safari and Laptop Edge, then sets the decision: **Accept**, **Revise** or **Remove**. Merging to `main` and deploying then need the separate go-live word. A03 does not start until then.

- **The harness fix travels with this branch.** Commit `13f85caf` touches only Phase 0.6's `qa/pwa-harness.js` and its own folder. It can be merged with A02, or taken to `main` on its own (cherry-pick) if A02 is removed.
- **If A02 is ever removed:** follow [ROLLBACK.md](ROLLBACK.md). Run `qa/remove-phase.py` on a scratch copy of the Phase 0 tree, then `build/recombine.py --verify`. It rebuilds A01's `cffde624…0414`.
