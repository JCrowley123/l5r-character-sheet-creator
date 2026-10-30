# Release 7c.1 — handover (29–30 October 2026; live at `a31251f2`, the owner's re-tests passed)

Branch `release-7c1` (local), from main `ce1b46a` (7c live at `799da9f`); fast-forwards. Candidate
`4ee461803feee3661c3a39b83e8987ef3243b3b059fc4981be4db80f4a84701e`, 17,444,744 bytes. Built in the session that finished
Release 7c, under half its context (kickoff step 9).

The owner's Release 7c device checks ([Device Checks](https://claude.ai/artifact/M1WXgFxDc15Qj8QWvUGTVp)), 29 October:
13 of 15 Pass on the iPhone and in Edge; B3 and B4 not run (their steps were unclear; reworded the same day for a re-run).
The owner's rulings on the notes:
- C1: an empty quiver offers Cancel only, not a roll without an arrow → `BUGFIX — Empty Quiver Cancels` (QC7).
- A3: the moon's button reads "Resist Lord Moon (TN n)" → `BUGFIX — Moon Resist Label` (MR7).
- A1–A3 layout (the tick and "Medium" out of line) → Phase 15. The "Description" seen on the row was the test character's
  empty description field, not a defect.
- B1/B2: the wizard's 40 XP gate (since Phase 11.2) should warn at the end and at Finish instead of blocking Next → the
  next work order.

Done:
- Two layers, each with README, ROLLBACK, harness, pinned variants, a remover (`test-removal.py` 6/6) and a removal-chain
  entry after the audit log. Own harnesses 11/11 (QC7 6, MR7 5); every variant matched (QC7 7, MR7 4). Removing all eight
  7c/7c.1 layers still works: every 7c remover 6/6 with the two later ones stripped first.
- Older checks: three of the quiver's and two of the moon's expect the new behaviour only while each switch is on; both
  harnesses pass on the candidate and on 7c's build; the moon's 11 variants still match; the quiver's 6 match with QC7 off
  (`BUGFIX — Empty Quiver Cancels/qa/eq7-variants-qc-off.py`).
- One review (`REVIEW-FINDINGS.md`): no defects; two variants added from it.
- At 4× CPU (`qa/under-load/`): the four changed harnesses 4/4. A discovery run of the candidate (`qa/affected-1/`):
  6,629/6,629, no older check affected.
- Full suite, runs 1 and 2, first time: candidate 6,629/6,629; the two removed rebuild 7c's build exactly (`efca3b66…`,
  17,441,230 bytes); retained 6,545/6,545 (7c's 6,618 less the two live-site leaves, 73); no leaf failures, nothing reused.

Live, 30 October: merged on the owner's word (fast-forward to `a31251f2`). `qa/verify-live.py`: page and service worker byte
for byte (17,451,521 bytes, service worker `7e53d495bf81dff4`), 78/78 on the downloaded files (the two new layers and 7c's
six); `qa/live-browser-smoke.cjs` 16/16; `qa/checklist-walk.cjs` (7c's walk with A3, C1 and C2 updated) on the live site at
phone size 16/16 (`qa/walk/`). Re-tests: section R of https://claude.ai/artifact/M1WXgFxDc15Qj8QWvUGTVp (R1 Cancel, R2 the
label), and B3 and B4 in their reworded rows. Records: ledger parts 1–4 and 6 (MD and HTML), the roadmap, a `CLAUDE.md`
pointer. Cost about 8 points against 9 (6–15).

Next: the owner's re-tests; then the cycle-end reassessment and the next work order in a fresh session (it takes the
wizard's XP gate); then Phase 15.

The owner's re-tests, 30 October: R1 and R2 Pass on the iPhone and in Edge; B3 and B4 passed by the owner's word (their rows in the doc still read Not run). No 7c.2 is needed.
