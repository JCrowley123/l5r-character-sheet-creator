# Release 7b.2 — code review findings (29 October 2026)

One read-only review (Helper 1), after the three layers passed their own checks and before the full suite. Nothing serious; each finding reproduced first, with a check pinned before its run.

| # | Finding | Outcome |
|---|---|---|
| 1 | R23's pairing tried every rule on every pair of rows, normalising names each time, twice per recalculation (about 11 ms at 20 rows on a desktop; more on a phone, an estimate). | **Reproduced** by SR-NORM-COST (normalisations per paint, 20 rows). Fixed: only rows of a set are paired; each name is looked up once. |
| 2 | The lists could stay greyed after a lone set row is renamed away. | **Not reproduced** (a configured row, a typed row and a custom name): the trunk's recalculation refreshes the lists through 4.5.28's `refreshAllAdvConfigControls` hook. SR-RENAMED-AWAY stays as a guard; the comment that said nothing else recalculates is corrected. |
| 3 | The choice greying runs when the dialog opens only. | Recorded: both Fortune dialogs have one step, and Confirm refuses a ruled-out choice. |
| 4 | Harness: the saved-choice exemption untested; a circular check total; ADD and REMOVE share state; fixed sleeps. | SR-REOPEN-SAVED added (variant no-saved-exemption); the total is fixed at 49. The sleeps wrap synchronous work; nothing timing-sensitive found. |
| 5 | Phase 14's dependency harness keys its extra category on presence. | Recorded: that harness is no longer in the suite; the suite's search and facets harnesses key on the switch. The `Q2` alias in 4.7's checks removed. |
| 6 | R23's remover scan missed its class names. | Widened to `sr7Overrides` and `sr7-…`. |

**Found after the review, by the new variant no-saved-exemption** (removing the saved-choice exemption changed nothing): a Disadvantage row's Change button calls `D45.open` directly, so reopening a held Seven Fortunes' Curse did not grey the Blessing's Fortune (Confirm still refused it). SR-CHANGE-GREYS reproduced it ([] where Benten was due); both openers now share one wrapper. The variants' disabled pin for SR-NORM-COST was wrong (its logic runs with the switch off, as R17's does) and is corrected; that attempt is kept in `BUGFIX — Advantage Set Rules/qa/negative-review-first-run/`.

The discovery run of the whole candidate suite (`qa/affected-1/`, not a final run) found one older check: 4.5.37's `S437-PARKED-NOT-ADDED`, which pinned R11's three entries as nowhere. While R11's switch is on it allows them in R11's category only (README of that layer).
