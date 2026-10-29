# Release 7c — handover in progress (29 October 2026)

Written by the build session at about half its context (the owner's rule: hand off to a fresh session past half). Read
this, the kickoff (`Versions/CLAUDE-SESSION-KICKOFF-RELEASE-7C-2026-10-29.md`, steps 4–10 of "How the release runs"),
and nothing else to carry on. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`, branch `release-7c` (local, not
pushed). Remote Control on and the computer held awake first (kickoff, start of session).

## Built (all six items), committed on `release-7c`

| Layer | Folder | Fragment (src/sheet/) | Own checks | Variants |
|---|---|---|---:|---:|
| R26 Lord Moon's Curse | `BUGFIX — Moon Curse Full Moon` | `209.99999999999997-bugfix-moon-curse.js` (LM7) | 17 | 10 + baseline |
| R26 the Ring cap | `BUGFIX — Creation Cap of Four` | `209.99999999999998-bugfix-creation-cap.js` (RC7) | 11 | 7 + baseline |
| R26 the empty quiver | `BUGFIX — Empty Quiver Rolls On` | `209.99999999999999-bugfix-empty-quiver.js` (EQ7) + block in `100-dice-engine.js` | 8 | 5 + baseline |
| R22 starting spells | `BUGFIX — Starting Spells Are Scrolls` | `209.999999999999991-bugfix-starting-scrolls.js` (SS7) + block in `209.997-…` | 5 | 2 + baseline |
| The after-preview refund | `BUGFIX — After-Preview Refund` | `209.999999999999992-bugfix-preview-refund.js` (RF7) | 9 | 6 + baseline |
| Phase 7's audit log | `Part J — Data Integrity & Validation/PART J — Phase 7.1 Audit Log` | `209.999999999999993-feat-audit-log.js` (AL71, marker `PART J PHASE 7.1`, END tag `AUDIT71`) | 17 | 11 + baseline |

Each has README, ROLLBACK, harness, `variants.json` + `verify-variants.py`, `remove-phase.py`, `test-removal.py` (6/6
each), and a removal-chain registry entry (after 7b.2's three; the audit log last). Removing all six rebuilds 7b.2's
build exactly: `9545f8284f4d9100eda26017389347eb27ae19f96198fba0fb4639dcd0051317`, 17,405,953 bytes.

The audit log follows the owner's answers in the [questions doc](https://claude.ai/artifact/7cw3VpTWGRH4g67MHNAhau):
Q1 and Q3 as recommended; Q2: History in both the sheet's ⋯ menu (where Print and Export are) and each character's ⋯
menu in the Characters list (answered in the doc).

## Review (helper 1, done once)

Findings 1–3 confirmed, 4–6 low, 7–11 no defect. Each of 1, 2, 3 and 5 was reproduced on the pre-review build with a
check pinned first (LM-PANEL-FOLLOWS, LM-REPICK-KEEPS, LM-ROW-REMOVED-SUNRISE; AL-MENU-LATE, AL-FIELD-EVENT; plus
LM-LOAD-NOT-SUNRISE as a guard), then fixed; 4 and 6 are documented (audit README and ROLLBACK). Variants for the new
checks and one per fix were pinned before their first run. The review's text is in this session's transcript only;
record a `REVIEW-FINDINGS.md` here from the list above and the READMEs' "After the review" lines.

## Older checks changed (expect the new behaviour while the new layer's switch is on, exactly as before otherwise)

A discovery run of the candidate (`qa/affected-1/`) found twelve older leaves affected, all by design:
- `/auditLog` in two isolation checks: `PART I — Phase 4.5.7 Unlucky` (UNLUCKY457-ISOLATION-01), `PART I — Phase 4.5.8
  Dependant and Wrath of the Kami` (D458-ISOLATION-01).
- History in the menus: Characters list (CL-MENU-OPENS), Export to PDF (PDF-MENU-ORDER), Play Mode Toolbar (two ITEMS
  checks), Search (S14-MENU-ITEMS-MANAGE/-PLAY), App Bar (AB-DUPLICATES-HIDDEN).
- Wizard made versus by hand: collectData compared without `auditLog` while AL71 is on (wizard, wizard2–5).
- The creation cap: the wizard's overspend raises Agility, Strength and Perception once each instead of Willpower 4→7
  (wizard-harness), and raises the Skills shown one at a time until it blocks (wizard2), while RC7 is on.
The edit script is reproduced in the commit `f34c629`. Record these in the relevant layer READMEs (audit log: 11; cap: 2).

## Running when this was written

`qa/after-review.py after-review-1`: every layer's variants on the fixed build, then the twelve edited older harnesses.
Results in `qa/after-review-1/results.json`. If all pass, update the variant counts in the moon and audit READMEs from
the logs (baseline, disabled and the new variants), and commit.

## Still to do (kickoff steps 4–10)

1. The changed harnesses at 4× CPU: `python -B qa/run-under-load.py` (fresh `under-load/`; it reads `list.json`). Add
   the twelve edited older harnesses to its CHANGED list first.
2. The full suite twice, in the background, on mains power: `python -B qa/run-final-twice.py 1`. Candidate 6,612;
   retained 6,478. The kickoff's "retained total is 7b.2's candidate total, 6,551" is not used: the live-site leaves run
   in the candidate half only, so retained = 7b.2's three layers (74) + 7b.2's retained list (6,404) = 6,478 (7b.2 and
   7b.1.1 did the same). Say so in the handover.
3. Merge to main only on the owner's word; never force-push. Then the live check and smoke (adapt 7b.2's
   `qa/verify-live.py`, `qa/live-browser-smoke.cjs`), the device checklist as a Claude Doc with iPhone and Edge dropdowns,
   walked first at phone size (adapt 7b.2's `qa/checklist-walk.cjs`), the test characters sent with SendUserFile.
4. Records: ledger parts 1–4 and 6 (MD and HTML), the roadmap's build order, a `CLAUDE.md` pointer (8 CR bytes: append
   only, count before committing). Do not republish the ledger page.

## Notes

- Helpers: `C:/Users/jcrow/AppData/Local/Temp/claude/…/scratchpad/` held this session's generators (mkvv.py, mkrm.py,
  mkal.py, mktr.py, chain-shas.py, pre.json); they are not needed again unless a layer changes, in which case recompute
  the restore points newest first (the audit log, then RF7, SS7, EQ7, RC7, LM7) and regenerate the removers' constants.
- Bash heredocs collapse backslashes here: write Python to a file with the Write tool.
- One leftover automation Chrome from a stopped harness was closed by PID; the owner's own Chrome and Edge processes are
  running and were left alone.
