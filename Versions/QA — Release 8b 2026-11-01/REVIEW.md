# Release 8b — single code review and verified fixes

One read-only helper reviewed the approved scope and initial implementation after its 30 checks, six variant cases and removal proof passed. No helper edited production code, built the feature or ran the full suite.

The review identified four defects:

1. A fixed School subject Skill could be claimed as an additional free choice. The adapter now rejects the complete fixed Skill name, including its subject.
2. Adopting a known spell after its scroll had been lost appended a duplicate technique. Equipment restoration now uses only the Equipment action when the technique already exists.
3. A second held School could not explicitly claim shared given spells. Optional additional School sources are now recorded on the same row, and undo removes only the chosen School's source.
4. Former spell names were not recognized during adoption. The adapter now uses the existing guarded name-alias mapping for identity while preserving saved display text.

The reviewer also raised an inaccessible confirmation when undo restored Equipment inside the native dialog. The six regression cases include that path and preserving a paid memorised spell. They were pinned before execution. All six failed on the old candidate, then all six passed at 4× CPU after the fixes. The corrected imported fixture uses the actual saved School structure; both pre-fix logs are retained.

Separately, the historical preflight exposed a change to wizard School replacement: new preservation logic retained a row the existing wizard intentionally removes. Preservation is now restricted to the Manage dialog; the original wizard behaviour and its exact assertion remain unchanged. The corrected historical wizard harness passed 32/32 at 4× CPU.

Final targeted evidence is in `qa/own-cpu4-4/`. The layer's `qa/review-pins.json`, `qa/review-variants.json`, `qa/review-before-fix-2.log` and `qa/review-negative/` preserve the positive expectations, six reproduced failures, and exact failures from eight regression variant cases. The original six variant cases also pass. There was no second helper review.
