# G5 4x CPU screen failure: investigation

18 November 2026 (Claude). The first qualification chain for G5 (A08 alone, frozen candidate `6d47849b…44b1`) passed its first three stages and stopped at the last: group removal **9/9**, the six negative variants on their pins, dependencies **1/1**, then the 4x CPU screen **162/163 leaves**. The one failed leaf was A08's own harness, **20/21**, and the one failed check was `QT-LISTED-PLAY-AUTOSAVE-MERGED-DESKTOP`. The two full passes did not start. The chain's state (`qualification-6d47849b.json`), its launch log, every stage log and the screen's folder (`under-load-final-6d47849b/`) are kept exactly as the chain left them, and the chain is not run again.

## What the check does and what it saw

The listed character is opened from the Characters list in Play. The harness taps + on Honour three times, two seconds apart, waits 7.5 seconds without touching the page, then reads the stored copy and taps Undo. It expects one History entry in the stored copy (4.9→5.2), and Undo to take back all three taps.

Under 4x CPU the stored copy still held three Honour entries (4.9→5.0, 5.0→5.1, 5.1→5.2). The group itself had held: the message read "Undo takes back all 3 taps." and Undo went back to 4.9. The check only shows Honour's entries, so it could not say whether the merge had not yet run or had declined.

## Cause: the screen's throttle lets an idle page's timers sleep

Two probes, run on the frozen page with the screen's own preloads, record what the check could not. Neither runs checks or decides anything. `diagnose-listed-play.cjs` repeats the failed check's steps (and the Save check before it, which makes the listed copy) with the harness's setup copied unchanged, and times each tap, the group's end, History's merge and every autosave. `diagnose-idle-timer.cjs` calls no sheet code at all: on the same page it starts a bare 5,000 ms timer and a bare 1,200 ms timer and reads back when they fired. The output is in `listed-play-investigation/`.

| Run | Group ended, after the last tap began | First read (about 7.5 s after the last tap) | Merged History in the stored copy |
|---|---:|---|---|
| Normal speed | 5.0 s | one entry, 4.9→5.2 | at 6.3 s, by autosave |
| 4x CPU, run 1 | 7.8 s, 2 ms after the read began | three entries | 1.5 s after the merge |
| 4x CPU, run 2 | 7.7 s, 2 ms after the read began | three entries | 1.5 s after the merge |
| 4x CPU, run 3 | 7.8 s, 1 ms after the read began | three entries | 1.5 s after the merge |
| 4x CPU, page kept awake (no-op every 250 ms), run 1 | 5.3 s | one entry, 4.9→5.2 | 1.3 s before the read |
| 4x CPU, page kept awake, run 2 | 5.3 s | one entry | 1.3 s before the read |
| 4x CPU, page kept awake, run 3 | 5.4 s | one entry | 1.3 s before the read |

At 4x CPU a tap's own work takes about 0.2 s, and the group's five seconds start when it ends.

The bare timers, with no sheet code behind them:

| Page | 5,000 ms timer fired at | 1,200 ms timer fired at |
|---|---|---|
| 4x CPU, quiet for 9 s (first time) | **not at all within 9 s** | 1,392 ms |
| 4x CPU, quiet for 9 s (second time) | 5,185 ms | 1,220 ms |
| 4x CPU, kept awake (twice) | 5,123 and 5,118 ms | 1,279 and 1,268 ms |
| Normal speed, quiet or awake (four times) | 5,004 to 5,013 ms | 1,202 to 1,214 ms |

So under the screen's CPU throttle (Chrome's `Emulation.setCPUThrottlingRate`, applied by `cpu-throttle.cjs`), a page that has gone idle can sleep past a timer's deadline until something wakes it. In all three failed-step runs the group's five-second timer fired only when the harness's read arrived, so the merge happened just after the read and the merged History reached the stored copy at the next autosave. With the page kept awake the timer fired on time, the merge ran, and autosave wrote the one entry well before the read. At normal speed every timer fires on time.

A08 behaves as designed. The group, Undo's catch-up, the merge and the autosave all happened, in the right order; only the throttled page's clock was late. A real phone that is slow still runs its timers. The other checks in A08's harness that wait for the group to end read the page twice after their wait, so the first read wakes the page and the overdue timer runs before the second; that is why the spaced-taps History check passed in the same screen. The listed-character check depends on two timers in a row (the five-second group, then autosave's 1.2 seconds) with nothing sent to the page for 7.5 seconds, and reads the stored copy once.

## Correction

Only the listed-character check's wait changes, in A08's harness: for the same 7.5 seconds the harness evaluates a no-op in the page every 250 ms (as the probe's `--awake` did), so the page is awake as a phone's would be. The deadline, the assertion, every check id, the 21-check count and `expected-checks.json` are unchanged. No application file changes. Recorded in `a08-wait-change.json`.

## Scoped proof, then a guarded continuation

The corrected harness runs, once each, on every input its result depends on: the candidate at normal speed; the candidate at 4x CPU with the screen's preloads (the failed condition); the AE3-removed build that the removal proof ran A08's harness on; and the baseline and five mutations, each of which must fail exactly its pinned checks. Evidence: `a08-wait-validation/`. A continuation (`continue-after-a08-wait.py`) then checks the original failure exactly as kept, the proof and the file hashes, and records the qualification as a separate file; the two full passes start only from that record. The first chain is not described as an uninterrupted pass.
