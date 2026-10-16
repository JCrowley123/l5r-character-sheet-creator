# Claude — next-session kickoff: Cycle 3 (proposed 16 October 2026)

**Status: proposed, for the owner's approval.** Nothing in this file is approved yet. Build only after the owner's word,
and only this scope.

On 16 October the owner approved D06 Weakness and Hotei's Curse as proposed in the roadmap's amendment "Cycle 2
finished — 15 October 2026", including the floor of 1, to be built next as a removable layer. This cycle builds them as
**one** layer. The Library mock-ups (Cycle 2's "Design only" item, not reached) come only if they fit under the stop
line. The cycle is sized to the week left: the week resets on **21 October at 01:00 UTC**, so it is split at a stop
line (Usage, below).

**For the owner, once:** FT-32 (fetch the newest version first, with a loading screen; about 3–5 points) would end the
stale first open after every deploy. It is parked for Phase 15 and is not in this cycle unless you add it.

## Start of session

- Remote Control on, keep-awake (memory `session-setup-remote-control`), and a meter reading (`get_usage`) with the time.
  The week read **87%** at 05:18 UTC on 16 October, when this file was written.
- **Start just after a 5-hour reset** (memory `five-hour-window-book-reading`): the code survey below is this cycle's
  reading-heavy part. If the 5-hour window is past about 50%, wait for its reset before starting it.
- **Canonical checkout: `C:\Users\jcrow\l5r-character-sheet-creator`.** Never build or commit in the OneDrive clone.
  Stage exact paths only; leave `Characters/`, `tmp/`, Word documents and owner-deleted kickoffs alone. One branch,
  `claude/cycle-3-<date>`; never force-push.
- **Starting build:** `main` at the 16 October records commit or later. Phase 0 build **3,912,042 bytes, SHA-256
  `820443923217991eeafa8907ff6ac82bdcaa522b6b04b2f9134096820ff09777`**; `recombine.py --verify` byte-identical. The
  newest release is BUGFIX — Gift of the Lady per School and Imperial Histories Volumes; its
  `qa/current-suite-runner.js` gives the full suite: **5,466 checks**.
- **Read by section only** (not the ledger, roadmap or `CLAUDE.md` in full): this file; the roadmap's amendments "Cycle 2
  finished — 15 October 2026" (the approved rules) and "Cycle 2 merged; the owner's rulings — 16 October 2026";
  memories `feature-structure-and-comments`, `helper-agents-two-roles`, `playwright-chrome-shim`, `full-suite-mains-power`,
  `fresh-session-over-long-context`, `device-check-stale-version`; the patterns named under the layer below;
  `QA — Removal Chain Registry/README.md`; the Gift of the Lady fix's `qa/` (`final-qa.py`, `flat-suite-runner.js`,
  `verify-live.py`) and Cycle 2's `qa/keystroke-probe.js`.

## Test environment

Playwright's bundled Chromium crashes on any page since the 14 October Windows updates. Run every harness on the
installed Google Chrome:
- `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules` (visible to every process, including the Store Python that runs
  the `.py` fixtures);
- `NODE_OPTIONS='--require "C:/Users/jcrow/l5r-character-sheet-creator/Versions/QA — Cycle 1 2026-10-14/qa/use-installed-chrome.js"'`
  (forward slashes);
- `PYTHONUTF8=1`.

**Mains power and the screen awake** for the full suite and every timing check (memory `full-suite-mains-power`): read
`Get-CimInstance Win32_Battery` (BatteryStatus 2 = on mains); if on battery, ask the owner to plug in. Hold the screen
awake with a background PowerShell process calling `SetThreadExecutionState(0x80000003)`, plus keep-awake; stop it
after. Keep-awake alone does not stop standby throttling. Quiet machine: compare `tasklist | grep -ci chrome` with a
baseline first.

**The owner's instruction: the full suite passes first time.** If anything fails under load, find out why and fix the
cause; never weaken, loosen, skip or retry a check until it goes green. Run the under-load keystroke checks and every
harness that touches the same public functions before the full suite. A re-run is allowed only after the cause is
found and fixed, and the records say so.

## The layer: PART I — Phase 4.5.36 Weakness and the Curse of Hotei

One removable layer with its folder, marker, switch, README, ROLLBACK, MANUAL-TESTS, pinned variants, removal proof and
registry entry. Logic UI-agnostic, the UI replaceable, `// UI hook:` markers, lean functional comments (memory
`feature-structure-and-comments`). Rules text in Claude's own words with pages.

### D06 Weakness (Core p.162, Disadvantage, 6 points): the approved rules
- The chosen Trait counts **one lower, never below 1**, for every roll that uses it and everything worked out from it:
  its Ring when it becomes the lower of the pair, and what follows from that Ring (Wounds from Earth; the TN to be hit
  and initiative from Reflexes).
- Never changed: Insight and Insight Rank, the purchased Trait, any XP cost, Void Points (Void has no Traits).
- It may be taken more than once, one Trait each.

**Build notes (measure first, then build):**
- List every place a Trait value is read (rolls, the Ring computation, wound ranks, Armor TN, initiative, anything else
  computed from a Ring such as spell slots) with one script that prints every hit; save the list in the layer's README.
  Build to "everything computed from it"; report any consumer the approved wording does not obviously name.
- One function gives the effective Trait; the consumers read through it. Never write the purchased Trait: Phase 4.5.12
  (Bishamon) measured that writing a lowered Strength moves the Water Ring, and `recalcAll()` recomputes the Rings on
  every pass. Adjust what the trunk's functions return under a written contract, as Phase 4.5.29 does for the wound
  core.
- The pick: Phase 4.5's `traitPick` config type is unbuilt, and `209.8-feat-adv-config.js` names Weakness as the entry
  that needs it. One Trait per row; refuse a second row on the same Trait.
- Show the lowered value where the Trait shows, with the purchased value kept; an unpicked row changes nothing.
- Check and report the combined cases: Bad Health (4.5.29) with Weakness on Stamina or Willpower; Bishamon's Curse
  (4.5.12) with Weakness on Strength; Blind's Armor TN (4.5.34); the Initiative Score (4.5.35); Explain This Roll's
  base pool; the wizard; Phase 5's checks (XP unchanged).

### Hotei's Curse (Core p.162, Seven Fortunes' Curse, 6 points): the approved rules
- A Technique or Advantage that needs a Void Point to activate needs two. Void spent on a roll, Kiho, Kata and spells
  are untouched.
- While the Curse is on the sheet, the Void card's spend control offers **"For a Technique or Advantage"** at two
  points: checked before spending, both taken in one step and undone together. The ordinary one-point spend and the roll
  preview's Void tick are unchanged. The player declares (the sheet cannot tell which Techniques cost Void).

**Build notes:** Hotei is a Fortune in Phase 4.5.11's Seven Fortunes' Curse row (today "deferred", with a "not yet
automated" note); Phase 4.5.12 completed Bishamon by retuning `F4511.FORTUNES` in place and wrapping the decorator from
outside, which is the pattern. The Void card is `160-feat-void.js`; 4.5.12's notes say it already models a covered
activation as a spend entry. Find how a spend is taken back today (the Undo, FT-24, is parked) and make the two points
come back as one unit. Check what Touch of the Void (4.5.33) does after a two-point spend, and whether Hotei's Blessing
and Curse can both be held.

## Design only (optional, under the stop line) — Library mock-ups
As Cycle 2's kickoff: the empty Library with "+ Book"; the list view (cover, title, ⋯); the grid view on thin lacquer
shelf lines with a soft shadow, no 3D; the PDF import window; the ⋯ menu (Which book is this?, Check page numbers,
Rename, Change cover, Replace file, Storage used, Delete); the reader (pages, jump to a printed page, chapters, search
in the book); the Search link prompt ("Open Core Rulebook at p.139?"); the not-in-Library message with "Add book".
Publish as one artifact; no code.

## Helpers and sessions
- Only the owner's two helper roles (memory `helper-agents-two-roles`): one code reviewer after the layer passes its own
  checks, with a narrow brief (the diff, this file's rules); a failing-test investigator only if a cause stays unclear
  after a couple of tries. In Cycle 2 the review and its fixes took about 5 weekly points and moved the 5-hour window
  from 64% to 96%: check the window first.
- No side sessions during the cycle. A real defect goes to the owner as a small removable fix for the next kickoff.

## Verification
- Every new check fails on `main`; quote both counts. Pin the negative variants, at least: Weakness switched off; the
  floor removed; the Ring not lowered; Insight lowered; the purchased Trait written; Hotei charging one point; Hotei on a
  roll's Void tick; the two points not undone together.
- The layer removes cleanly through the registry and rebuilds `main` byte for byte; registry QA passes.
- The under-load keystroke check before the full suite (Weakness sits on paths `recalcAll()` runs on every change).
- **One full suite, first time:** 5,466 plus the new checks; then the layer removed rebuilding `main` exactly and the
  retained suite.
- After the owner's word to merge: deployed bytes, the new checks and Search 62/62 live; then one combined checklist doc
  with Pass/Fail dropdowns (memory `device-check-workflow`). Ask the owner to open the app twice first (memory
  `device-check-stale-version`).

## Usage: estimate and stop line
- **The week:** 87% at 05:18 UTC on 16 October; this records session ends at about 88%. It resets on 21 October at
  01:00 UTC, so about 12 points are left this week.
- **Estimate (Claude points):** measuring the Trait consumers and the Void card, and the test plan 1–2; Weakness 4–7;
  Hotei 1–2; the code review and its fixes 2–5; the under-load check, the full suite and the records 2–3; the merge,
  live check and checklist 1–2. **Core about 11–21.** The mock-ups 2–3 more.
- **Stop line this week: 97%.** About 9 points from the start: the measurement, both halves built, their focused checks,
  variants and removal proof, committed and pushed. If the line comes first, stop at a clean commit and write a short
  handoff.
- **After the reset:** the code review, the under-load check, the full suite, the records and the report; the merge on
  the owner's word; then the mock-ups.
- **Cycle cap: stop and report at 22 points in total** across both weeks. Skip the mock-ups if the cycle has passed 17
  when they come up.
- Read the meter at the start, after each half, after the full suite, after the merge and at the end; one cost table in
  the ledger. One fresh session per part; past about half the context window, hand off (memory
  `fresh-session-over-long-context`).

## Records: keep them short
Full detail only in the layer's README. Elsewhere: one ledger entry at the top with its cost table, the roadmap's status
row 4.5 and a short amendment, one pointer in `CLAUDE.md` (8 deliberate CR bytes: count with Python, or append). No
`BUILD-LEDGER.html` (a records session brings it up to date).

## Lessons (do not relearn them)
- Run the full suite on mains power with the screen kept awake; on battery in standby Cycle 2's first run failed four
  correct checks.
- Start reading-heavy work just after a 5-hour reset; batch reads into one script; save results to durable files early.
- Write scripts to files; heredocs drop backslashes. Python's `write_text()` writes CRLF on Windows: use
  `write_bytes(text.encode('utf-8'))`.
- Never write a purchased Trait to get a lowered effect (Bishamon's measurement); compute an effective value.
- A switch that is declared but never read is not a switch; prove each one turns its checks red.
- Do not time-test while anything else runs browsers; a guard check must establish its own premise.
- Run every harness that touches the same public functions before committing.

## First steps
1. Remote Control, keep-awake, meter reading; check the 5-hour window.
2. Canonical checkout: status, worktrees, fetch, fast-forward `main`, create the branch; check the build hash.
3. Mains power and a quiet machine.
4. Measure the Trait consumers and the Void card's spend and take-back paths (one script, results saved in the layer's
   folder); then the test plan.
5. Build Weakness, then Hotei; focused checks, variants and removal proof; commit and push. Meter reading.
6. Below the line: the code review and its fixes. At the line: a handoff, and the rest after the reset.
7. The under-load check, the full suite, the records; report and wait for the word to merge; the mock-ups if under the
   cap.
