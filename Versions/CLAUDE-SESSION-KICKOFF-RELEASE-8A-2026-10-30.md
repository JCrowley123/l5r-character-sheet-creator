# Claude session kickoff — Release 8a: the wizard's XP gate, and a full suite that passes first time (30 October 2026)

Release 8a is step 1 of the [Work Order — 30 October 2026](https://claude.ai/artifact/6gsmbucZtDssUvhSnQGFtB), agreed by
the owner the same day with all four questions as recommended. Estimate: **9 points (6–13)**. If the meter shows more
than 13 spent before the full suite, stop and report to the owner before going on.

## Where things stand

- **Live:** main `a31251f2` (Release 7c.1; records later). Build `4ee461803feee3661c3a39b83e8987ef3243b3b059fc4981be4db80f4a84701e`
  (17,444,744 bytes); the live page with its install head is 17,451,521 bytes.
- **Cycle 7 is finished** and every device check passed; Phase 7 is done. The ledger page was republished on
  30 October.
- **QA totals:** 7c.1's suite was 6,629 candidate and 6,545 retained. This release's retained total is 7c.1's candidate
  less the two live-site leaves: 6,629 − 73 = **6,556**.
- **Allowance:** about 76% of the week used on 30 October (the week resets 4 November, 01:00 UTC).

## Start of session

1. Turn Remote Control on, and keep the computer awake (the owner follows from an iPhone).
2. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`. Never touch the OneDrive clone; the shell starts there,
   so use absolute paths. Branch from main before the first change.
3. Read the usage meter (`get_usage`) and note the starting reading.
4. Read, and nothing more to start: the last few pointers in `Versions/CLAUDE.md`; the ledger's parts 1 and 2 (about the
   first 150 lines of `Versions/BUILD-LEDGER.md`); this file. Search the roadmap; don't read it whole. No books are
   needed.

## The owner's rule for this release and every later one

**The full suite passes first time, and is never re-run to get a pass.** When a check fails only under load, find why
and fix the check, without weakening any check:

- A check that waits a fixed time for something waits for the event itself (the save, the render, the dialog), with a
  long ceiling that only ends a hung run.
- A check that something did *not* happen waits past the app's own timer, measured from that timer, not a guess.
- No assertion is dropped, no expected value widened, no timeout simply lengthened, and no failing run re-run to see if
  it passes. If run 1 fails, find and fix the cause before anything else, and record that the first-time goal was
  missed.

## The work (three parts)

### 1. The wizard's XP gate (the owner's ruling, 29 October)

Today the creation wizard blocks Next while more than 40 XP is spent. The owner wants it to **warn on the last step and
at Finish, and let the player go on**, because Disadvantages bought later can bring the total back.

- The gate dates from Phase 11.2: `overspend()` and the step `check` functions in
  `src/sheet/209.995-feat-wizard-skills-advantages.js` (two steps, about lines 221 and 286) and
  `src/sheet/209.996-feat-wizard-free-choices.js` (about line 378). They read the validator's `xp-overspend` error.
- Build it as one removable layer with its own switch (a `BUGFIX — …` folder with README, ROLLBACK and `qa/`, in the
  usual shape). While the switch is on: no step blocks Next for overspend; the last step shows the overspend as a
  warning, in plain words with the amount over; Finish warns once and lets the player go on. The rest of each
  step's checks still block as before (for example "Waiting for its own question…"). With the switch off, the old
  gate comes back exactly.
- Phase 11.2's own checks that expect the block (find them with a search for `overspend` and `xp-overspend` across the
  harnesses, starting with `PART K — Phase 11.2 Creation Wizard/qa/wizard-harness.js`) expect the new behaviour only
  while the switch is on. Check them with the switch off too.

### 2. The suite under load

- **Known case:** the Characters list harness
  (`PART K — Phase 11 Characters List and Save Model/qa/characters-harness.js`, `const WAIT = 1700`) waits a fixed
  1.7 seconds for a 1.2-second autosave. At 4× CPU it misses the save on any build, main's too
  (`QA — Release 7c 2026-10-29/qa/cl-load-compare/`). Make each positive check wait for the save itself, using the
  harness's autosave write counter. Keep each "nothing was written" check, waiting past the autosave timer from the
  moment it was armed.
- **Find the rest:** one sweep of the whole candidate suite at 4× CPU in the background. That costs time, not
  points: adapt `run-under-load.py` from the QA template to take every harness. List every check that fails only
  under load, fix each by the rule above, and prove each harness passes at 4× CPU and unthrottled. Changes to older
  harnesses go in each harness's own folder, with any copies under `originals/` kept in step (search for the file
  name).
- If a failure under load is a real app bug rather than a harness's margin, stop and report it to the owner; don't
  fix it in this release without their word.

### 3. The audit log's finding 4 (the owner's answer, 30 October)

On a sheet not yet saved as a character, a change undone leaves two History entries. Opening another character then
asks whether to discard an unchanged sheet (7c review finding 4, `QA — Release 7c 2026-10-29/REVIEW-FINDINGS.md`;
the layer is `Part J — Data Integrity & Validation/PART J — Phase 7.1 Audit Log`). Fix it as its own removable layer
(about 1 point): an undone change no longer leaves the sheet looking changed. Pin a check that reproduces the prompt
first, then fix it. Update the audit log's README, which lists it as a known limit.

## How the release runs

1. Each change its own removable layer, its checks written and pinned before their first run.
2. **Helper 1, the code reviewer:** once, after the layers pass their own checks and before the full suite. When it adds
   checks, update the per-harness counts in this release's `current-suite-runner.js`, not only the totals.
3. The changed harnesses at 4× CPU, the affected groups, the whole-suite sweep (part 2), then one discovery run of the
   whole candidate suite (`discovery.py`), all before the two full runs.
4. A layer that overrides an older one leaves some of the older layer's variants with nothing to catch: check them with
   the new switch off (as in `BUGFIX — Empty Quiver Cancels/qa/eq7-variants-qc-off.py`).
5. **Helper 2, the failing-test investigator:** only if a test fails and the cause is unclear after a couple of tries.
   It finds and records the cause, and never loosens a check.
6. The full suite twice (`run-final-twice.py`), in the background on mains power with the screen held awake. Removal
   of the new layers must rebuild main's build byte for byte.
7. Merge and deploy only on the owner's word; then `verify-live.py`, `live-browser-smoke.cjs` and the checklist walk
   (`checklist-walk.cjs`) on the live site.
8. The owner's Device Checks as a Claude Doc. Say in plain words what to tap and what "Pass" looks like, and give every
   row every cell, the owner's General comments column included. Test characters' description fields are filled from
   the book entry, never left as the placeholder "Description". Include: overspend in the wizard (Next works, the
   warning on the last step, Finish goes on), and an undone change on a new sheet then opening another character.
9. Minor fixes from the owner's checks at once as 8a.1 (step 2, 3 points (2–5)): in this session while under half its
   context, otherwise in a fresh one.

## QA templates

Copy from `Versions/QA — Release 7c.1 2026-10-29/qa/`: the runners (`current-suite-runner.js`,
`retained-suite-runner.js`, `flat-suite-runner.js`), `final-qa.py`, `run-final-twice.py`, `run-under-load.py`,
`discovery.py`, `verify-live.py`, `live-browser-smoke.cjs` and `checklist-walk.cjs`. Put this release's in
`Versions/QA — Release 8a 2026-10-30/`.

## Environment

- Node: `/c/Program Files/nodejs/node.exe`; `NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules'`;
  `NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`;
  `PYTHONUTF8=1`. Give `node --require` an absolute path or one starting with `./`.
- Build: `python build.py --check-drift` at the repo root must report BYTE-IDENTICAL.
- Bash heredocs here collapse double backslashes: write Python scripts to a file and run them by path.
- Python writes use `newline='\n'` or `write_bytes`.
- New removers' `SURFACE_RE` must skip base64 neighbours (AG7/AP7 occur in the PDF font fragment).
- A wrapped method held by an earlier listener skips the wrapper: drive the real UI event in a check.

## Records at the end

The ledger's parts 1–4 and 6 (MD and HTML), the roadmap's build order, and a `Versions/CLAUDE.md` pointer (append
only; it keeps exactly 8 CR bytes, so count them before committing). The ledger page is not republished until the
reassessment after Phase 15.

## Done looks like

Two layers built (the XP gate, finding 4) and the under-load fixes made, with no check weakened. The full suite
passes twice, first time. Merged on the owner's word and live, the walk passed, the Device Checks doc ready, and the
records updated. Then 8a.1 if the owner's checks need it, and the Phase 15 audit (step 3) in a fresh session.
