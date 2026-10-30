# Claude session kickoff — the Cycle 7 reassessment and the next work order (30 October 2026)

Cycle 7 is finished. Every release is live and every device check passed. This session does what the owner ruled on
28 October for the end of each cycle: republish the ledger page, reassess everything, and write the next work order.
It builds nothing.

## Where things stand

- **Live:** main `a31251f2` (records later, at `d62fd375`): Cycle 7a with its refinements and follow-up, then Releases
  7b.1, 7b.1.1, 7b.2, 7c and 7c.1. The build is `4ee461803feee3661c3a39b83e8987ef3243b3b059fc4981be4db80f4a84701e`
  (17,444,744 bytes); the live page with its install head is 17,451,521 bytes.
- **Device checks:** all passed. 7c: 13 of 15 on 29 October, then B3, B4 and 7c.1's re-tests R1 and R2 on 30 October
  ([Device Checks](https://claude.ai/artifact/M1WXgFxDc15Qj8QWvUGTVp); B3 and B4 passed by the owner's word, but
  their rows still read Not run).
- **Phase 7 is complete:** its audit log shipped in 7c (Phase 7.1). The ledger's status table still says "done once
  your device checks pass". They have passed, so move Phase 7 to Done (the status table and part 5).
- **Allowance:** about 72% of the week used on 30 October (the week resets 4 November, 01:00 UTC). 7c cost about 16
  points against 23; 7c.1 about 8 against 9. By the 28 October work order, about 28 points are left before FT-16.
- **QA totals:** 7c.1's suite was 6,629 checks on the candidate and 6,545 retained. The next release's retained total
  is 7c.1's candidate less the two live-site leaves: 6,629 − 73 = 6,556.

## Start of session

1. Turn Remote Control on, and keep the computer awake (the owner follows from an iPhone).
2. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`. Never touch the OneDrive clone; the shell starts there,
   so use absolute paths.
3. Read the usage meter (`get_usage`). The ledger page's full read is heavy, so start it early in a 5-hour window.
4. Read, and nothing more to start:
   - the last few pointers in `Versions/CLAUDE.md`;
   - parts 1, 2 and 4 of `Versions/BUILD-LEDGER.md` (about the first 470 lines);
   - the 28 October [work order](https://claude.ai/artifact/HiVDa7FasBFXnz3NjmCVxd);
   - the [end-of-project review rulings](https://claude.ai/artifact/2GRWcCjGXub1g2GbGHRrUp), recorded in the ledger
     around "The end-of-project review items".

   Search the roadmap; don't read it whole.

## The job

1. **Republish the ledger page** (https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk) from `Versions/BUILD-LEDGER.html`.
   - The Artifact tool needs the live copy read in full first: about 2,500 lines, in reads of about 46 KB.
   - Diff that copy against `git show <commit>:Versions/BUILD-LEDGER.html` to confirm nobody else edited it.
   - Publish from a copy in the scratchpad, leaving out `icon` and `capabilities` so the page keeps them.
   - Expect about 2 points.
2. **Reassess** the ledger, the roadmap, the end-of-project review and the 28 October work order.
   - Weigh every remaining phase, those that need the sourcebooks included, and rank them by impact per point.
   - What is left now:
     - Phase 15 (its audit, then 15a for layout and controls, then 15b for text, Search and print);
     - FT-16, every Search entry described;
     - a small fix release after each device check.
   - New since the 28 October work order (the ledger's part 4):
     - **The wizard's XP gate** (the owner's ruling, 29 October, for this work order). Today the creation wizard
       blocks Next while more than 40 XP is spent. The owner wants it to warn on the last step and at Finish, and let
       the player go on, because Disadvantages bought later can bring the total back. This gate dates from Phase 11.2
       (the overspend checks in `209.995-feat-wizard-skills-advantages.js` and `209.996-feat-wizard-free-choices.js`)
       and changes that phase's own checks.
     - The moon row's alignment: the tick and the "Medium" summary (Phase 15).
     - The audit log's findings 4 (a needless discard prompt after an undone change) and 6 (History dropped if the
       layer is ever rolled back).
     - The Characters list harness: its autosave checks fail at 4× CPU even on main's build; a QA fix whenever chosen.
     - From earlier: Search's Scorpion Instigator text (15b); FT-47 to FT-52 (Phase 15).
   - The owner's deferred ideas to place (memory): the Glory, Status and Honour review and the wound calculation, both
     at the end; Print in the Characters list; Manage as a separate screen; the clutter from resist entries; Hotei's
     Curse made automatic; the koku buttons and the splash filling the screen (Phase 15); sync, then a career planner,
     then campaigns. Those three come after Phase 15, unless it is clearly the right time to raise them earlier, with
     reasons.
3. **Write the next work order** as a Claude Doc, modelled on the 28 October one.
   - Give each step its points and a range, keep the two helpers in their roles, and give the owner a dropdown to
     agree.
   - Once agreed, record it in the ledger's part 2 and the roadmap's build order.
4. **Write the kickoff** for the work order's first release: a new `Versions/CLAUDE-SESSION-KICKOFF-…` file, with the
   lessons below.
5. **Records:**
   - the ledger's parts 1–4 and 6 (MD and HTML);
   - the roadmap;
   - a `Versions/CLAUDE.md` pointer: append only; it keeps exactly 8 CR bytes, so count them before committing.

## Lessons from 7c and 7c.1 for the next kickoffs

- When a review adds checks, update the per-harness counts in the release's `current-suite-runner.js`, not only the
  totals. 7c's run 1 passed every check but stopped on stale counts.
- Run one discovery run of the whole candidate suite before the two full runs (7c.1's `qa/discovery.py`).
- A layer that overrides an older layer leaves some of the older layer's variants with nothing to catch. Check them with
  the new switch off (`BUGFIX — Empty Quiver Cancels/qa/eq7-variants-qc-off.py`).
- In device checklists, say in plain words what to tap and what "Pass" looks like. The owner adds a "General comments"
  column, so new table rows need every cell.
- The test characters' empty description fields show the placeholder "Description". Fill them from the book entry.
- QA templates to copy: `Versions/QA — Release 7c.1 2026-10-29/qa/`. It holds the runners, `final-qa.py`,
  `run-final-twice.py`, `run-under-load.py`, `discovery.py`, `verify-live.py`, `live-browser-smoke.cjs` and
  `checklist-walk.cjs`.

## Environment

- Node: `/c/Program Files/nodejs/node.exe`; `NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules'`;
  `NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`;
  `PYTHONUTF8=1`. Give `node --require` an absolute path or one starting with `./`.
- Build: `python build.py --check-drift` at the repo root must report BYTE-IDENTICAL.
- Bash heredocs here collapse double backslashes: write Python scripts to a file and run them by path.
- Python writes use `newline='\n'` or `write_bytes`.

## Done looks like

The ledger page republished, the reassessment recorded, the next work order agreed by the owner and recorded, the
first release's kickoff written, and the records updated. Then hand over for the first release in a fresh session.
