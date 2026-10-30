# Claude session kickoff — Release 8a.1: a quieter overspend, and a free-choice note that goes when the choice is made (30 October 2026)

Release 8a.1 is step 2 of the [Work Order — 30 October 2026](https://claude.ai/artifact/6gsmbucZtDssUvhSnQGFtB): the
fixes from the owner's Release 8a device checks. Estimate: **3 points (2–5)**. If the meter shows more than 5 spent
before the full suite, stop and report to the owner before going on.

## Where things stand

- **Live:** main `e8310bec` (Release 8a; records at `0320f4ff`). Build `2a9f66ed444f50b001ef0b670ea71cb370fc65fc24146ddf9cd1a7ce1f4a2084`
  (17,452,358 bytes); the live page with its install head is 17,459,135 bytes.
- **The owner's 8a device checks, 30 October:** every row passed on the iPhone and in Edge
  ([Release 8a Device Checks](https://claude.ai/artifact/CnEQfQcQYrVv9EcgKSo6uE); the rows may still read Not run). Two
  notes became this release; a third (School scrolls) is a design question, out of scope here (see the end).
- **QA totals:** 8a's suite was 6,652 candidate and 6,556 retained. This release's retained total is 8a's candidate
  less the two live-site leaves: 6,652 − 73 = **6,579**.
- **Allowance:** about 89% of the week used on 30 October (the week resets 4 November, 01:00 UTC).

## Start of session

1. Turn Remote Control on, and keep the computer awake (the owner follows from an iPhone).
2. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`. Never touch the OneDrive clone; use absolute paths. Branch
   from main before the first change.
3. Read the usage meter (`get_usage`) and note the starting reading.
4. Read, and nothing more to start: the last few pointers in `Versions/CLAUDE.md`; this file;
   `Versions/QA — Release 8a 2026-10-30/HANDOVER.md` and `REVIEW-FINDINGS.md`; the READMEs and ROLLBACKs of
   `BUGFIX — Wizard Overspend Warns` (XW8) and `BUGFIX — Undone Change Not Unsaved Work`. No books are needed.

## The owner's rule

**The full suite passes first time, and is never re-run to get a pass.** A check that waits for something waits for the
event itself (a long ceiling ends only a hung run); a check that something did not happen waits past the app's own
timer. No assertion dropped, no expected value widened, no timeout simply lengthened.

## The work (two parts, each its own removable layer with its own switch)

### 1. The overspend, quieter (the owner's ruling, 30 October)

8a shows a full amber box on every wizard step after the overspend, and on Review a box at the top as well as the sheet's
own "Overspent by N XP …" item in the findings list. The owner's ruling, with their screenshots:

- **On the step where the overspend first appears:** one line above the buttons, in the place and style of "Some of your
  School's choices are still open." (the wizard's `#cw112Reason` line). No box, and nothing on later steps. The step's old
  red "Overspent by" line stays gone. Next still works.
- **On Review:** the top box goes. The findings list keeps its "Overspent by N XP. Spent … of … awarded. …" item, as in
  the owner's screenshot of 30 October.
- **Finish** still asks once (unchanged). Every other reason still blocks Next, as in 8a.

Build it as a layer over XW8 (wrapping `XW8.decorate` and `CW112.refreshNav` by property), not as an edit to XW8's
fragment. Decide and declare:

- What "first appears" means. A suggestion: the step the player is on when the validator's `xp-overspend` first turns
  up in this wizard run. The line shows on that step while it is still overspent. If the overspend clears and comes back
  on another step, that step takes the line.
- Precedence with 11.2.2's nudge, which writes the same line ("Some of your School's choices are still open." with
  "Leave for later"). One line only: the nudge wins on the step where both apply.

XW8's own checks XW-TRAITS-WARNING, XW-EVERY-STEP-OPEN (its warned element) and XW-REVIEW-WARNING expect XW8's
behaviour. They expect the new behaviour only while the new switch is on, exactly as before otherwise (the 7c.1 pattern).
Check XW8's 9 variants with the new switch off. Phase 11.2's CW-REVIEW-FINDINGS still compares the list with the
validator, and should not need to change; confirm it.

### 2. The free-choice note goes when the choice is made (the owner's note, 30 October)

Phase 5's (Part J) `school-choice-slots` rule (`209.5-feat-character-validator.js`, `ruleSchoolChoiceSlots`) is
always on by design: its comment says it "cannot tell a filled slot from an unfilled one", so "Bayushi Bushi: 1 free Skill
choice" stays after the player picked Acting and ticked it as a School Skill. Meanwhile the wizard's Review says "Every
choice your School leaves to you is made". The owner: a note should show only when there is something to highlight.

- The evidence: a Skill ticked as School that the School's library entry does not name is a filled free choice. Count
  those against the School's free choices (`validatorChoiceSlots`). Report only the choices still open ("1 free Skill
  choice still open"), and nothing once they are covered. Measure the edge cases before choosing: a "Lore (pick one)"
  row the wizard renamed; a Skill ticked as School by hand that is not a free choice (over-counts, so the note goes
  early); two Schools. Declare the choices in the README.
- Build it as its own layer that rebinds the rule's `fn` in `CHARACTER_VALIDATOR_RULES` by property (keep the previous
  function and delegate to it). The validator's own file stays untouched.
- Older checks that pin the always-on note: `BUGFIX — Apply School Skill Rows/qa/school-skill-rows-harness.js` and
  `PART K — Phase 11.2.1 Wizard Skills and Advantages/qa/wizard2-harness.js` (search `school-choice-slots`). They expect
  the new behaviour only while the switch is on.

## How the release runs

As 8a (its `HANDOVER.md`): checks pinned and committed before their first run. **Helper 1, the code reviewer,** once,
before the suite. When it adds checks, update the per-harness counts in this release's `current-suite-runner.js` (8a's
discovery run caught a stale count). Then the changed harnesses at 4× CPU, one discovery run, and the full suite twice
(`run-final-twice.py`), in the background. Removal of the new layers must rebuild 8a's build byte for byte. **Helper 2,
the investigator,** only if a test fails and the cause is unclear. Merge only on the owner's word; then
`verify-live.py`, `live-browser-smoke.cjs` (raise its expected count when a check is added) and a walk of the changed
rows; dry-run the walk on the local build first. The owner's re-tests go in a new section R of the
[Release 8a Device Checks](https://claude.ai/artifact/CnEQfQcQYrVv9EcgKSo6uE): A1, A3, A4 as changed, and the Bayushi
Bushi free choice (pick Acting, tick it as School: no note on Review or in the sheet's check).

QA templates: copy from `Versions/QA — Release 8a 2026-10-30/qa/` (runners, `final-qa.py`, `run-final-twice.py`,
`run-under-load.py`, `discovery.py`, `run-own.py`, `verify-live.py`, `live-browser-smoke.cjs`, `checklist-walk.cjs`). Put
this release's in `Versions/QA — Release 8a.1 2026-10-30/` (or the day it runs).

## Environment

As 8a's kickoff: Node at `/c/Program Files/nodejs/node.exe`; `NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules'`;
`NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`;
`PYTHONUTF8=1`. `python build.py --check-drift` must report BYTE-IDENTICAL. Bash heredocs collapse backslashes: write
scripts to files. Python writes use `newline='\n'` or `write_bytes`. New removers' `SURFACE_RE` skips base64 neighbours.
Never rebuild the live tree while a background run reads it (8a's first sweep was lost that way).

## Records at the end

The ledger's parts 1–4 and 6 (MD and HTML), the roadmap's build order, and a `Versions/CLAUDE.md` pointer (append only;
it keeps exactly 8 CR bytes). Record the owner's 8a device checks as passed, 30 October.

## Out of scope: School scrolls and missing School choices (a design question for the owner)

The owner's note of 30 October: a reward scroll added in Equipment silently satisfies the starting-spells check, and a
School scroll missed at creation has no way back in; at a new Insight Rank the School's free scrolls should be offered,
with a way to skip and choose later. The owner likes "where you add a scroll says why" (a scroll chosen as the School's
counts; one added in Equipment does not), and proposed that the check's notes become buttons in Manage mode, opening a
picker of the missing items. Four options were set out in chat on 30 October. **Not built in 8a.1**: it waits for the
owner's choice, a reading of each School's spells per Rank (never from memory), and a place in the work order.

## Done looks like

Two layers built and reviewed, the full suite twice, first time, removal rebuilding 8a's build byte for byte; merged on
the owner's word and live; the walk passed; section R of the Device Checks ready; the records updated.
