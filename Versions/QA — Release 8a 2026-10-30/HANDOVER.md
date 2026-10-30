# Release 8a — handover (30 October 2026; built, not merged)

Branch `claude/release-8a-xp-gate-load` (local), from main `aef8f188` (live at `a31251f2`, Release 7c.1); fast-forwards.
Candidate `2a9f66ed444f50b001ef0b670ea71cb370fc65fc24146ddf9cd1a7ce1f4a2084`, 17,452,358 bytes. Step 1 of the
[Work Order — 30 October 2026](https://claude.ai/artifact/6gsmbucZtDssUvhSnQGFtB), from
`CLAUDE-SESSION-KICKOFF-RELEASE-8A-2026-10-30.md`.

## The three parts

1. **The wizard's XP gate** (your ruling, 29 October): `BUGFIX — Wizard Overspend Warns` (XW8). No step blocks Next for
   the overspend; each step that showed it shows a warning; Review says it in plain words with the amount over; Finish
   asks once (Finish / Stay) and goes on. Every other reason still blocks. Switch off: the old gate exactly.
2. **Checks that fail only under load.** The Characters list harness's fixed 1.7 s autosave wait is gone: each check that
   expects a save waits for it on the autosave's own write counter, then until the autosave is idle; each "nothing was
   written" check waits until no timer is armed and nothing is in flight, at least the autosave's own delay after the
   edit; the two flush checks also require that the flush ran. Then **one sweep of the whole candidate suite at 4x CPU**
   (`qa/sweep-under-load.py`, `qa/sweep-cpu4/`): 170 of 171 leaves passed; the one that failed only under load was
   `BUGFIX — Dependant Inline Typing`'s two autosave checks (a fixed 1.5 s wait), fixed the same way. No real app bug was
   found. No assertion dropped, no expected value widened, no timeout simply lengthened; each edited harness's own pinned
   variants still match (Phase 11's 8 and 4 special builds; Dependant typing's 8 and 3 boundaries). The `originals/`
   copies of both harnesses are frozen pre-edit snapshots (none matched the live file), so they were left alone.
3. **The audit log's finding 4** (your answer, 30 October): `BUGFIX — Undone Change Not Unsaved Work` (AU8). A change
   undone on an unsaved sheet no longer makes opening another character ask to discard it; a real change still asks; the
   History keeps both entries. Pinned check reproduced the prompt on main first. The audit log's README updated.

## Checks

- Own harnesses: XW8 17/17, AU8 6/6, unthrottled and at 4x CPU. Pinned variants: XW8 9/9, AU8 4/4. Removal: both 6/6;
  removing both rebuilds main exactly.
- Older harnesses changed (declared in XW8's ROLLBACK): Phase 11.2's CW-OVERSPEND-BLOCKS, CW-OVERSPEND-CLEARS and
  CW-FINISH-BLOCKED-BY-ERROR; Phase 11.2.1's CW1-OVERSPEND-BLOCKS and CW1-OVERSPEND-CLEARS: the new behaviour only while
  XW8 is on, stronger both ways; counts unchanged. With XW8 off both wizards' own variants match (`xw8-variants-off.py`).
- One review (`REVIEW-FINDINGS.md`): one defect (Finish could run twice), reproduced first (16/17) and fixed; the
  coverage gaps closed by added assertions; notes recorded.
- After the review (`qa/after-review-2/`): every check, variant, switch-off variant and removal; the changed harnesses at
  4x. (Pass 1, `after-review-1/`, kept: one mutation too narrow, one probe that perturbed an older variant, and Phase 11's
  variant script lacking the splash preload, each fixed before pass 2.)
- Discovery (`qa/affected-1/`): 6,652/6,652, no leaf failing; the run caught the runner's stale count for XW8 (15, now 17).
- **Full suite, runs 1 and 2, first time** (`qa/final-run-1/`, `qa/final-run-2/`): candidate 6,652/6,652; the two removed
  rebuild main's build exactly (`4ee46180…`, 17,444,744 bytes); retained 6,556/6,556. No leaf failures, nothing reused.

One process slip, recorded: the first whole-suite sweep was started before the candidate was finished and the sheet was
rebuilt under it; it was stopped after 9 leaves (all passing) and kept as `qa/sweep-aborted-mixed-build/`; the real sweep
ran on the frozen candidate.

## Live, 30 October

Merged on the owner's word (fast-forward to `e8310bec`, pushed; Cloudflare Pages deployed). `qa/verify-live.py`: page and
service worker byte for byte (17,459,135 bytes, service worker `b5e7207af30e9a9a`), 185/185 on the downloaded files
(`qa/live/`). `qa/live-browser-smoke.cjs`: 17/17; its first run reported failure on a stale expected count (16) with all 17
checks passing (`qa/live-smoke-run1-stale-count.log`); the count was corrected and it ran once more. The 8a walk
(`qa/checklist-walk.cjs`) on the live site at phone size: 9/9 (`qa/walk/`); it was dry-run on the local build first
(`qa/walk-local-dry/`, where two script slips were found and fixed: the Characters button sits in the app bar at phone
size, and the Skills step is seen twice because of its own nudge).

The owner's Device Checks: https://claude.ai/artifact/CnEQfQcQYrVv9EcgKSo6uE (A1–A6 the wizard overspent, B1–B2 an undone
change on a new sheet; no test file needed). Records: ledger parts 1–4 and 6 (MD and HTML), the roadmap's build order, a
`Versions/CLAUDE.md` pointer (8 CR bytes kept). Cost about 14 points against 9 (6–13), over the range.

## Next

The owner's device checks; any minor fixes at once as 8a.1 (in this session while under half its context); then the Phase
15 audit in a fresh session.
