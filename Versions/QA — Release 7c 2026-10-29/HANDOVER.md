# Release 7c — handover (29 October 2026; not yet merged)

Branch `release-7c` (local), from main `86d74ef`; fast-forwards. Candidate `efca3b66ac738c49a7af5fc43d1ca09e745863b7dd83e3761c3d5cc43272dfc4`,
17,441,230 bytes. Kickoff: `Versions/CLAUDE-SESSION-KICKOFF-RELEASE-7C-2026-10-29.md`. Built in one session and finished in
a second (handed over at half its context; `HANDOVER-IN-PROGRESS.md`).

Done:
- Six layers, each with README, ROLLBACK, harness, pinned variants, a remover (`test-removal.py` 6/6) and a removal-chain
  entry after 7b.2's three: R26 `BUGFIX — Moon Curse Full Moon` (LM7), `BUGFIX — Creation Cap of Four` (RC7),
  `BUGFIX — Empty Quiver Rolls On` (EQ7); R22 `BUGFIX — Starting Spells Are Scrolls` (SS7); `BUGFIX — After-Preview
  Refund` (RF7, the owner's ruling that nothing a roll pays is kept when a later question cancels it); Phase 7.1
  `Part J — Data Integrity & Validation/PART J — Phase 7.1 Audit Log` (AL71; History in the sheet's ⋯ menu and in each
  character's menu in the Characters list, to the owner's answers in https://claude.ai/artifact/7cw3VpTWGRH4g67MHNAhau).
- Own harnesses 67/67 (moon 17, cap 11, quiver 8, scrolls 5, refund 9, audit log 17); every pinned variant matched.
- One review (`REVIEW-FINDINGS.md`): findings 1, 2, 3 and 5 reproduced with checks pinned first, then fixed; 4 and 6
  documented; 7–11 no defect.
- Twelve older checks now expect the new behaviour only while each switch is on (the audit log's README, 11; the cap's, 2).
- At 4× CPU (`qa/under-load/`): the six new harnesses and eleven of the twelve edited older ones pass in full. The
  Characters list harness misses its autosave checks there (a fixed 1,700 ms wait for a 1,200 ms autosave). It does so
  on main's build too, and with the audit log off (`qa/cl-load-compare/`, two runs each), so it is the harness's margin
  under throttling, not this release. It passes unthrottled in every full run. Left as it is; a follow-up if wanted.
- Full suite (`qa/final-run-*`), on mains power with the screen held awake:
  - Run 1 stopped after the candidate half although every check passed (6,618/6,618, no leaf failures): the release's
    runner still expected the moon's and the audit log's pre-review counts (13, 15). Corrected to 17 each.
  - Runs 2 and 3, both first time: candidate 6,618/6,618; the six removed rebuild main exactly
    (`9545f828…`, 17,405,953 bytes); retained 6,478/6,478; no leaf failures, nothing reused.
  - Totals: the kickoff's 6,612 was 7b.2's 6,551 plus the layers' pre-review 61; the review's six checks make 6,618.
    The kickoff's "retained total is 6,551" is not used: the live-site leaves run in the candidate half only, so
    retained = 7b.2's three layers (74) + 7b.2's retained list (6,404) = 6,478, as 7b.2 and 7b.1.1 did.

Still to do: merge on the owner's word (fast-forward; never force-push), then the live check and smoke, the device
checklist walked at phone size and sent, and the records.
