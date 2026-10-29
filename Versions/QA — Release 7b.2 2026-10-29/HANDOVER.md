# Release 7b.2 — handover (29 October 2026; live at `605512e`, the owner's device checks passed 15/15)

Branch `claude/release-7b2-2026-10-29`, fast-forwarded into main. Candidate `9545f8284f4d9100eda26017389347eb27ae19f96198fba0fb4639dcd0051317`,
17,405,953 bytes. Kickoff: `Versions/CLAUDE-SESSION-KICKOFF-RELEASE-7B2-DRAFT-2026-10-29.md`.

Done:
- Three layers, each with README, ROLLBACK, harness, pinned variants and a removal-chain entry:
  R23 `BUGFIX — Advantage Set Rules` (SR7Logic, SR7), R11 `BUGFIX — Station and Shapeshifter Reference Entries` (SH7),
  R17 `BUGFIX — Instigator Blackmail Count` (BK7Logic, BK7). R20 (FT-10) closed in the records: nothing to build.
- Own harnesses 74/74 (50, 10, 14), again at 4× CPU (`qa/under-load/`); every pinned variant matched (10, 3, 6); removal
  6/6 each. Five older checks now expect the new behaviour only while each switch is on (the layers' READMEs).
- One review (`REVIEW-FINDINGS.md`): finding 1 reproduced and fixed; finding 2 not reproduced, kept as a guard; a new
  variant then found D45's Change button skipping the greying, reproduced (SR-CHANGE-GREYS) and fixed.
- Full suite, runs 1 and 2, first time: candidate 6,551/6,551; the three removed rebuild main `bee8c0b` exactly
  (`649a0008…`, 17,385,712 bytes); retained 6,404/6,404. Before the runs, the causes of earlier load failures were
  addressed: an explicit retained list, live leaves in the candidate half only, updated counts, mains power.

Live, 29 October: merged on the owner's word (fast-forward to `605512e`). `qa/verify-live.py`: page and service worker byte
for byte (17,412,730 bytes, service worker `eda2fd1921930172`), 427/427 on the downloaded files; `qa/live-browser-smoke.cjs`
13/13; `qa/checklist-walk.cjs` on the live site at phone size 16/16 (`qa/walk/`, with the two test characters).
Device checks: https://claude.ai/artifact/SYNyXRANr16hrHGwS2Hgyb (A1–A4, B1–B5, C1–C3, D1–D3; iPhone and Edge
dropdowns). Records: ledger parts 1–4 and 6 (MD and HTML), the roadmap, a `CLAUDE.md` pointer; the published ledger
page not republished (it is due after Cycle 7). Cost about 9 points against 15 (12–20).

The owner's device checks, 29 October: all fifteen Pass on the iPhone and in Edge, 29 October, with no notes; no 7b.2.1 is needed.

Next: Release 7c in a fresh session.
