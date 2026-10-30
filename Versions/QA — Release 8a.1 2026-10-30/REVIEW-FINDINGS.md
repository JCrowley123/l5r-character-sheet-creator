# Release 8a.1 — code review findings (30 October 2026)

One read-only review (Helper 1) of `e8310bec..claude/release-8a1-quieter-overspend` and the working tree (both layers, their
seams, removers, registry entries, every harness change and the QA runners), after the layers' first own checks
(`qa/own-1/`) and before the suite. No defect that breaks correctness, wrapper order or removal; one low defect in a
layer, fixed with a pinned check; the rest declared, tightened or recorded. The reviewer also ran both removers on a
scratch copy: exact, to 8a's build.

| # | Finding | Outcome |
|---|---|---|
| 1 | OL8 remembered the step by id and never forgot one that left the wizard (Kiho and Spells come and go with the School), so after a change of School, still overspent, the line showed nowhere; and an overspend first seen on Review stored `review`, with the same effect. | **Fixed.** `track` forgets a step no longer in the wizard, and never stores Review (the separate Review guard in `show` was then redundant and went). New check OL-STALE-STEP-FREED, pinned before its first run; variant no-stale-reset; every-step re-pinned (+ OL-REVIEW). 11 → 12 checks; candidate 6,672 → 6,673. |
| 2 | FC8: a bare family takes one row whatever its count ("Artisan (pick 2)", Shiba Artisan), so its second subject counts as a free choice and the note can go early. | **Declared** in FC8's README (the declared direction: early, never a false "still open"). |
| 3 | FC8's "never stays late" was stronger than the code (a choice that leaves no extra ticked row stays open). | **Softened** in the fragment's header and the README, with the case stated. |
| 4 | OL-NOT-LATER was changed after the first run to accept the Spells step's nudge; the README said pins were committed before the first run. | **Tightened and recorded.** The nudge's words count only with the nudge's own button ("Leave for later ›"); the README records the correction and the three corrected pins (OL-FIRST-STEP-FREED on the baseline, the switch off and no-box: on 8a Rings & Traits shows XW8's box again on return). The stale `negative/` logs are replaced by the re-run. |
| 5 | Paths no variant exercises: the Review guard, the per-run reset, XW8's switch, FC8's length fallback, old-name aliases, a live two-School run, "any 2" sizing. | **Partly closed.** The stale-step path now has a check and a variant (finding 1); the Review guard merged into `track`. The rest recorded: the per-run reset is also covered by the next refresh; XW8 off is the variant run with XW8 off; the fallback only returns the old findings; sizing and two Schools are unit-checked (FC-LOGIC-…). |
| 6 | Logs read mid-run; a stale docstring in `xw8-variants-off-8a1.py`; `run-under-load.py` needs `list.json`. | Logs read after the run finished (all matched); docstring fixed; `list.json` written by the after-review chain before the 4x run. |

Notes, no action: wrapper order right (OL8 outermost; it sees the nudge's text and Next's state; XW8's box exists only in
`decorate`, which OL8 wraps by property); counts reconcile (6,673 = 12 + 9 + 6,652; retained 6,579 = 17 + 6 + 6,556;
SSR 37); older harness edits all conditional on the new switch, counts unchanged; Phase 11.2's CW-OVERSPEND-BLOCKS passes
with OL8 on because its "Overspent by" test fails on the new line too (unedited); OL8 runs the character check on each
refresh of the buttons (as XW8 already does on render), cheap in use; FC8 keeps the old detail text; FC8 cannot make the
validator report `rule-threw` through new code.
