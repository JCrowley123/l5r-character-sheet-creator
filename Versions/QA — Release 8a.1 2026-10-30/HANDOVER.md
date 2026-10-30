# Release 8a.1 — handover (30 October 2026; live)

Step 2 of the [Work Order — 30 October 2026](https://claude.ai/artifact/6gsmbucZtDssUvhSnQGFtB), from
`CLAUDE-SESSION-KICKOFF-RELEASE-8A1-2026-10-30.md`: the fixes from the owner's Release 8a device checks. Branch
`claude/release-8a1-quieter-overspend`, from main `952f6e9a` (live 8a at `e8310bec`); merged by fast-forward on the
owner's word to `5bfcb18e`. Candidate `a25ace916f29d5c1647731db0ab2d7e97bd23bbdd6312c9631bd9d4ba416c7f2`, 17,459,752 bytes.

## The two layers

1. **BUGFIX — Overspend One Line** (OL8): the overspend as one line above the buttons, only on the step where it first
   appears, no box; Review keeps the sheet's own item; Finish asks once (XW8). Choices declared in its README.
2. **BUGFIX — Free Choice Note Clears** (FC8): the character check's free-choice note only while a choice is open.
   Choices (evidence, sizes, the bare Lore family, hand ticks, two Schools) declared in its README.

## Checks

- Own: OL8 12/12, FC8 9/9; older harnesses changed or touched: XW8 17, SSR 37, wizard2 32, wizard 43, wizard3 52
  (`qa/own-2/`); every variant matched (OL8 8 in `qa/own-5/`, FC8 6), XW8's 9 with OL8 off, the wizard's own with XW8 off;
  removal 6/6 each, exact to 8a's build.
- Review (`REVIEW-FINDINGS.md`): one low defect fixed with OL-STALE-STEP-FREED; the rest declared, tightened or recorded.
- Pins corrected and recorded (each before its re-run): OL8's baseline, disabled and no-box (+OL-FIRST-STEP-FREED),
  no-clear and every-step (+OL-CLEARS); OL-NOT-LATER accepts the Spells step's nudge only with its own button.
  `own-3/` ran no check (the chain script lacked the installed-Chrome preload).
- 4x CPU: the 7 changed harnesses (`qa/under-load-1/`). Discovery 6,673/6,673 (`qa/affected-1/`).
- **Full suite, twice, first time** (`qa/final-run-1/`, `qa/final-run-2/`): candidate 6,673/6,673; the two removed
  rebuild 8a's build exactly (`2a9f66ed…`, 17,452,358 bytes); retained 6,579/6,579. Nothing reused.

## Live, 30 October

`qa/verify-live.py`: page and service worker byte for byte (17,466,529 bytes, service worker `048d546994e6fe57`),
202/202 on the downloaded files (`qa/live/`). `qa/live-browser-smoke.cjs`: 18/18 (`qa/live-smoke.log`; its first launch
lacked the folder argument and ran nothing, `qa/live-smoke-run0-no-folder-arg.log`). The walk (`qa/checklist-walk.cjs`)
on the live site at phone size: 8/8 (`qa/walk/`), after a dry run on the local build (`qa/walk-local-dry/`, 8/8).

The owner's re-tests: section R of the [Release 8a Device Checks](https://claude.ai/artifact/CnEQfQcQYrVv9EcgKSo6uE)
(R1–R3: A1, A3, A4 as changed; R4: Bayushi Bushi, pick Acting, tick it as School: no note). Cost about 7 points
against 3 (2–5): the review's fix, four pin corrections and their re-runs, and a watcher that matched its own command
line and hung for about 2.5 hours (`memory: background-chain-notify`).

## Next

The owner's re-tests; then the Phase 15 audit in a fresh session after the reset on 4 November.
