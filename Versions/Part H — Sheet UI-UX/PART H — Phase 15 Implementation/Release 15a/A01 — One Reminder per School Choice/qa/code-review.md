# A01 code review (one read-only reviewer, 4 November 2026, before full QA)

Scope given: the approved A01 scope, the diff, the project's removability rules. The reviewer read code, diffs and harnesses, ran one small pure-logic check, and ran no suites.

**Verdict: no correctness, regression or removability defects.** It confirmed: the layer reads the same `CW112.findings()` the cards are drawn from; School-prefixed, whole-item matching only; box and card lists come from the same functions, so a disagreement leaves an item visible; re-render safe; overspend stays first; the Ancestors and 11.2.1 Review wrappers do not interact; switch off is the old page; remover regexes (no match for a future `15.1.11`, base64-safe), chain resolution, totals and runner paths correct; the four older checks keep their counts and original expectations without A01; every variant pin matches its mutation.

Minor items and what was done:

1. The comments added to the three older wizard harnesses named the marker in marker order (a convention slip; no remover reads harnesses). **Fixed before freezing:** reworded to "Phase 15.1.1, Part H". Comment-only.
2. Theoretical false match: an item equal to a comma-bounded piece of another item on the same card. Skill labels cannot contain commas; only two given-spell names like "A, B" and "B" could do it, and no data does. **Recorded, not changed.**
3. The harness's own list parser cuts at the first ". "; a future label containing "e.g. " would mis-split in the harness only. **Recorded, not changed.**
