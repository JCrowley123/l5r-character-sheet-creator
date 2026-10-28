# Release 7b.1 — handover (28 October 2026, full suite passed; waiting for the owner's word to merge)

Branch `claude/release-7b1-2026-10-28`. Candidate `4ed1738a…`, 17,382,264 bytes. Not merged, not pushed.

Done:
- Eight layers (R7, R10, R14, R15, R16, R21, R24, R25), each with README, ROLLBACK, harness, pinned variants and a
  removal-chain entry. Own harnesses 87/87, again 87/87 at 4× CPU (`qa/under-load/`); removal 6/6 for each layer;
  every pinned variant matched.
- One read-only review: five findings, each reproduced by a check pinned first and fixed (`REVIEW-FINDINGS.md`).
- Two older harnesses follow the rulings by layer presence: Part G Phase 3's roll preview (R7) and Phase 4.8's
  Ancestors (R25).
- Affected groups: 47/47 passed on the fixed candidate (`qa/affected-3/`, 2,534 checks).
- Full suite, runs 3 and 4 (`qa/final-run-3`, `qa/final-run-4`): candidate 6,452/6,452 (155 leaves); the eight
  removed through the registry rebuild main exactly (`55f9e9ed…`, 17,349,941); retained 6,292/6,292 (145 leaves).
- Run 1 (`qa/final-run-1`) passed the candidate but not the retained half: its runner still held 5a's sw-checks and 5b's
  notice-checks, which refuse any sheet but the live tree's build. 7a's retained run left them out; the runner now does
  too (commit `d90d1c9`). Nothing else changed between run 1 and runs 3–4.
- `python -B build.py --check-drift`: identical to the Phase 0 build.

Open, after the owner's word:
1. Merge to main (no force-push), push, then the live check: adapt 7a's `qa/verify-live.py` and
   `qa/live-browser-smoke.cjs`.
2. Device checklist as a Claude Doc with iPhone and Edge dropdowns, walked on the live site at phone size first
   (adapt 7a's `qa/checklist-walk.cjs`), then sent.
3. Records: ledger parts 1–4 and 6 (MD and HTML), the roadmap's build order, a `CLAUDE.md` pointer (keep its 8 CR
   bytes: append with `printf >>` and count). Do not republish the ledger page.
4. Next: the reading session, at the start of a fresh 5-hour window.
