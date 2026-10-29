# Claude session kickoff — Release 7c (29 October 2026)

**Ready, except the audit log's shape** (first step below). Written at the end of Release 7b.2, which is live at
`605512e` and passed the owner's device checks 15/15. Release 7c is step 4 of the
[Work Order — 28 October 2026](https://claude.ai/artifact/HiVDa7FasBFXnz3NjmCVxd), the last release of Cycle 7.
Estimate **23 points (18–31)** of Claude's weekly allowance; the week read about 49% at the end of 7b.2 (it resets
4 November 01:00 UTC).

## Start of session

1. Turn Remote Control on, and keep the computer awake (the owner follows from an iPhone).
2. Work only in `C:\Users\jcrow\l5r-character-sheet-creator`. Never touch the OneDrive clone; the shell starts there,
   so use absolute paths.
3. Read `Versions/CLAUDE.md`'s last few pointers, the ledger's parts 1 and 2 (`Versions/BUILD-LEDGER.md`), and the
   R22 and R26 sections of `Versions/READING — Cycle 7b.2 and 7c 2026-10-29/NOTES.md` (the rules in our own words, with
   book, page and the sheet's `file:line`). Do not re-read the whole ledger or roadmap; search them.
4. **The audit log's questions, first.** Phase 7 names only "an `AuditLog` service with append-only entries"; what it
   records and where it shows have never been decided. Before building it, put one short batch of questions to the
   owner as a Claude Doc, recommendation first, each with an answer dropdown (the reading session's
   [questions doc](https://claude.ai/artifact/92kuNDnHBTBRnz7ZR1jecM) is the model). Suggested questions and
   recommendations:
   - What it records. Recommended: the changes that cost or award something: XP spent and awarded, Honor, Glory,
     Status and Taint changes, Void Points and other resources spent by rolls (and given back), Advantages,
     Disadvantages, Techniques and spells added or removed, Insight Rank and School changes. Not every keystroke.
   - Where it shows. Recommended: a "History" panel on the Characters list's row or the sheet's menu, newest first,
     read-only, with the date; Search does not index it.
   - Saved with the character. Recommended: yes, in the save file and Export JSON, capped (for example the last
     500 entries), older saves start an empty log; no clearing in Play.
   Build the other items while the answers come; if they are not back by the time the rest passes its checks, ship
   the rest as 7c and leave the audit log for its own release, saying so.

## Scope

| Item | Build | Settled by |
|---|---|---|
| R26 Lord Moon's Curse (Core p.160) | The owner's design: a full-moon tick on the Disadvantage's row adds a Void Point to the Void card, spent last, and gone when unticked unspent (lost at sunrise). A Willpower roll button, TN **15, 20 and 25** for levels 1, 2 and 3 (C5), with the result message styled like Enlightened Madness's (on a failure the player loses control of the character for the night). The row already holds its level (`209.8-feat-adv-config.js:161-170`) | R26, C5; the notes |
| R26 the Ring cap (Core pp.76, 103) | While the character is still in creation: the wizard's XP step refuses a raise past 4 for Traits, the Void Ring and Skills, and the validator reports one as a warning; nothing is changed after play starts. Find how the sheet already knows a character is in creation (the wizard's state or the Characters list) before adding a flag. The validator's 1–10 range check stays (`209.5-feat-character-validator.js:236-250`) | Q6, Q7 (the recommendation) |
| R26 the empty quiver | No book: the arrow picker opens saying the quiver is empty and lets the roll go ahead (today the picker only says to add arrows first, `150-feat-ammo.js:279`; read what it does to the roll before changing it) | R26 (as recommended) |
| R22 starting spells (Core p.164) | Keep the book's rule, which the sheet follows: starting spells start as scrolls, not memorised. Close the open question in `209.997-feat-wizard-starting-spells.js:10-16` and add one line to the wizard's spell step: "These are scrolls in your Equipment. Memorising a spell costs XP equal to its Mastery (Core p.164); tick Memorised on its row." | Q5 (the recommendation) |
| The after-preview refund | The owner's ruling, 29 October: nothing a roll pays is kept when a later question cancels the roll. Dark Paragon's Determination first: paid in the preview, then an Ancestor gift's question cancels the roll, and the Honor or Void Point and the once-a-session use stay spent while the status line says nothing was spent. One general refund for everything a preview pays, not one per payment. Release 7b.1.1's `BUGFIX — Gift Cancel Refunds the Spell Slot` (a wrapper outside both the gate and the spell-slot refund) is the pattern and must keep passing | Ledger part 4, 7b.1.1's row |
| Phase 7's audit log | To the owner's answers (start of session, step 4). Phase 7's own test list: entries correct and immutable | The answers |

No book reading is needed: Core pp.76, 103, 160 and 164 are in the notes. If an item turns out to need more of a book,
stop and say so; do not open PDFs beyond checking a page the notes already cite.

## How the release runs

1. Each item its own removable layer (or a small group with one reason): a README, a ROLLBACK, a harness, and an
   entry in the removal-chain registry (`Versions/QA — Removal Chain Registry/removal_chain.py`), appended after
   7b.2's three. The owner's rules: a UI-agnostic logic part, a replaceable UI part, lean functional comments,
   `// UI hook:` markers, one switch per layer. Never marker-shaped prose in comments.
2. Checks written and pinned before their first run, with negative variants (`qa/variants.json` and
   `qa/verify-variants.py`, as in 7b.2's layers); never loosen a check. Where an older check pinned the old
   behaviour, change it only to expect the new behaviour while the new layer's switch is on, exactly as before
   otherwise (7b.2's READMEs show five such edits).
3. **Helper 1, the code reviewer** (read-only): once, after the layers pass their own checks and before the full suite.
   Reproduce each finding before fixing it, with a check pinned first. A negative variant that changes nothing is a
   finding too: in 7b.2 one showed that a Disadvantage row's own Change button calls `D45.open` directly, bypassing
   `openAdvConfigModal`.
4. **Load first:** the changed harnesses at 4× CPU throttling (`qa/cpu-throttle.cjs` in
   `Versions/QA — Cycle 7a Device Follow-up 2026-10-27/`, `L5R_CPU_RATE`), then the affected test groups (a discovery
   run of the candidate suite found 7b.2's one affected older check).
5. **Helper 2, the failing-test investigator:** only if a test fails and the cause is unclear after a couple of tries.
   It finds and records the cause; it never changes a check. No other helpers.
6. The full suite twice, in the background, on mains power, the screen held awake and no other browsers. Adapt
   Release 7b.2's QA folder (`Versions/QA — Release 7b.2 2026-10-29/qa/`): `current-suite-runner.js`,
   `retained-suite-runner.js`, `flat-suite-runner.js`, `final-qa.py`, `run-final-twice.py`, `run-under-load.py`.
   What kept 7b.2's runs passing first time, keep: the retained runner is an explicit list (a nested runner not named
   `current-suite-runner.js` runs without the splash and navigation preloads, 5c's failure); the live-site leaves run
   in the candidate half only; the expected totals updated in every runner; mains power. The removal rebuilds 7b.2's
   build exactly: `9545f8284f4d9100eda26017389347eb27ae19f96198fba0fb4639dcd0051317`, 17,405,953 bytes (main
   `605512e`); its retained total is 7b.2's candidate total, 6,551.
7. Work on a branch; merge to main only on the owner's word, never force-push. Cloudflare Pages deploys main.
8. After the merge: the live check and smoke (adapt 7b.2's `qa/verify-live.py` and `qa/live-browser-smoke.cjs`), then a
   device checklist as a Claude Doc with iPhone and Edge dropdowns, walked on the live site at phone size first
   (adapt 7b.2's `qa/checklist-walk.cjs`, which makes its test characters by data and Export JSON). Send the test
   characters with SendUserFile.
9. The owner's device checks may bring minor fixes: do them at once as Release 7c.1, in this session while it is
   under half its context, otherwise in a fresh one, with the same review and full suite.
10. Records at the end: the ledger's parts 1–4 and 6 (MD and HTML), the roadmap's build order, a `CLAUDE.md` pointer.
    Do not republish the published ledger page here: after Cycle 7 a fresh session republishes it, reassesses the
    ledger, the roadmap, the end-of-project review and the work order, and writes the next work order (the owner's
    ruling of 28 October).

## Environment

- Node: `/c/Program Files/nodejs/node.exe`; `NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules'`;
  `NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`;
  `PYTHONUTF8=1`.
- Build: `python build.py --check-drift` at the repo root must report BYTE-IDENTICAL; fragments recombine with the manifest's
  `expect_sha256`.
- In page scripts, wait for the splash to end (`!document.querySelector('[id^=l5r-splash]')`). Off-screen carousel
  pages are `inert`, so open a page through `.car-tab` and `window.__L5R_CAROUSEL__.whenSettled()` before typing.
- Bash heredocs here collapse double backslashes: write Python scripts to a file and run them by path.
- `Versions/CLAUDE.md` keeps exactly 8 CR bytes: append only, and count them before committing. Python writes use
  `newline='\n'` or `write_bytes`.

## Done looks like

The six items built as removable layers (or the audit log held over, said plainly), reviewed, both full runs passing
first time, merged on the owner's word, verified live, the checklist walked and sent, and the records updated. Then hand
back to the owner for the device checks, and say what comes next: the cycle-end reassessment and the next work order,
in a fresh session; then Phase 15.
