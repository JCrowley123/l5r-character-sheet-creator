# Release 15a · group G5 (A08 alone) — handover

18 November 2026 (Claude). **Accepted, qualified and live** (18 November).

**18 November 2026 · G5 qualified (Claude).** G5 is A08 (One Undo for Quick Taps) alone. A12 (one Resisting line) was withdrawn when the owner moved the resistance redesign into a phase of its own after Phase 15 ("Yes, pin it"); its records stay on `claude/release-15a-a12`. A08 is on `claude/release-15a-a08`, the group tip. Application `6d47849b1dcb5aa8ac4140b1895d1f0d713426092530e183ff87c3fc4d7c44b1`, 17,685,928 bytes. The owner approved the mock-ups ("approve as recommended", 14 November) and accepted A08 at the device round (checks 1–9 pass on iPhone and laptop, no notes; 16 November).

The qualification **was not an uninterrupted first chain**. Negative variants: one baseline and five mutations were predicted and pushed before discovery, and all six matched their pins. The chain ran once. Group removal passed 9/9 (removing A08 restores the automatic-entries group as live, `99b76d62…15b8`, exactly), all six variants matched their pins, and dependencies passed 1/1. The 4× CPU screen then stopped at **162/163 leaves**: A08's own harness passed 20/21, failing `QT-LISTED-PLAY-AUTOSAVE-MERGED-DESKTOP`. The failed chain is kept as it ran (`c49f90b2`) and was not run again.

The cause was the screen's throttle, not A08. Under Chrome's CPU throttling, a page left idle can sleep past a timer's deadline until something wakes it. A bare five-second timer with no sheet code behind it also missed its deadline once. The check left the page alone for 7.5 seconds and then read the stored copy once, so the group's timer fired only when that read arrived. With the page kept awake, the merged History entry reached the stored copy 1.3 seconds before the read.

The correction changed only that check's wait (`8deb1df3`): for the same 7.5 seconds the harness evaluates a no-op every 250 ms. The assertion, the ids, the count and `expected-checks.json` are unchanged, and no application file changed. A scoped proof ran the corrected harness once on every input its result depends on and passed **9/9 first time** (`713873af`). A guarded continuation then recorded the qualification separately (`81c652e7`).

Two full passes followed, each on its first execution (18:28 to 20:17 UTC on 18 November). Candidate passed **7,401/7,401** and retained **7,307/7,307** in both runs (run 1: 28.37 and 25.68 minutes; run 2: 28.28 and 25.44 minutes), and both runs restored the automatic-entries group as live exactly. The code review needed no change to A08; it recorded two low findings (A08-1, A08-2).

## Unit

| Unit | Marker | Tag / switch | Own checks | Tier | Branch |
|---|---|---|---:|---|---|
| A08 One Undo for Quick Taps | `PART H PHASE 15.1.31` | `QT15` / `QUICK_TAP_UNDO_ENABLED` | 21 | Behaviour | `claude/release-15a-a08` (the group tip; records branch `claude/release-15a-g5` under it) |

What it does: when − and + taps on the same Honour, Glory, Status or Taint card each come within five seconds of the last, they count as one change. Undo takes the whole group back in one step. History gets one entry for the group, and once a group holds two or more taps the message names how many it holds. A08's folder has its README, ROLLBACK, harness with pinned ids, remover and removal proof. A08 is registered in the removal chain after AE3 and changes no other layer's tests. Its harness's one correction is described above.

## Where the evidence is

- Approvals: [MOCKUP.md](MOCKUP.md); reproduction on the automatic-entries group as live: [REPRODUCTION.md](REPRODUCTION.md).
- Code review: [qa/code-review.md](qa/code-review.md). Preview on its deployed files: A08 1,036/1,036 (`qa/preview-a08.log`).
- Device round: [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc https://claude.ai/artifact/VwpvN5pYU7j8uZQ1YNDHVS.
- Light checks: A08's touched layers 350/350 (`qa/light/a08-touched-run.log`).
- Qualification: [qa/VARIANT-PINS.md](qa/VARIANT-PINS.md), `qa/variants.json`, the failed chain `qa/qualification-6d47849b.json` and its four stage logs, `qa/under-load-final-6d47849b/`; the investigation [qa/A08-UNDER-LOAD-INVESTIGATION.md](qa/A08-UNDER-LOAD-INVESTIGATION.md) with its probes and `qa/listed-play-investigation/`; the change record `qa/a08-wait-change.json`; the scoped proof `qa/a08-wait-validation/`; the continuation `qa/qualification-6d47849b-a08-wait.json`; the full passes `qa/final-run-1/summary.json`, `qa/final-run-2/summary.json`, `qa/run-final-twice.log`.
- Counts: candidate = A08's 21 + the automatic-entries group's 7,380 = 7,401 (202 leaves). Retained, with A08 removed (the automatic-entries group as live) = 7,307 (199 leaves); this excludes the same 73 live-site checks as before.

## Environment notes

- Built in the worktree `C:/Users/jcrow/l5r-release-15a-group5` and qualified in `C:/Users/jcrow/l5r-release-15a-g5-a08`, so the shared checkout kept its branch.
- Every QA run used mains power and the project's own Playwright browsers (`l5r-qa-tools`).

## Next

G6 (A19, undo the most recent Void-card spend; A20, choose a Trait for one Skill roll) completes Release 15a; neither is mocked up yet. Release 15b, the resistance phase and the Techniques phase follow.

## Usage

Claude readings on a Pro plan, 18 November, after the two full passes: weekly all models 6% (the weekly limit reset on 18 November), five-hour limit 30%.

## Production

**18 November 2026 · A08 live (Claude).** On the owner's instruction ("Go live"), `main` was fast-forwarded from `c5dd578b` to `22033522` at 22:55 UTC, with no merge commit and no force. The deploy was current about three minutes later. Production: all seven deployed files match the qualified build. 87 application harnesses passed **3,464/3,464** on the downloaded production files: A03's 23 always run, plus each unit's own harness and the layers it touches, each counted once. A08 adds its own 21 checks and the twelve layers of its light check (History, the undone-change rule, the Characters list, the save format, the characteristic cards and the Taint, Social and Honour layers). The browser/offline smoke passed **22/22**. Deployed page `87f82af7c0fefbe7…`, 17,692,705 bytes (the same page the A08 preview served); application `6d47849b…44b1`; service worker build `896459a52b224a4f`.

Evidence: [qa/live/live-verification.json](qa/live/live-verification.json), [qa/live/live-qa.log](qa/live/live-qa.log), [qa/live/live-browser-smoke.json](qa/live/live-browser-smoke.json), `qa/verify-live.log`, `qa/browser-smoke.log`. The checks ran on the downloaded production files with `qa/verify-live.py` (the automatic-entries group's script with A08 added) and the Older School Choices browser smoke.
