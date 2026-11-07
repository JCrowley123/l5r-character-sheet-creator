# Kickoff — Release 15a, group G2: qualify, records, go-live

Claude prepared this on 7 November 2026, at the end of the G2 build session. It is for the next session, in Claude, ChatGPT or Codex, and is self-contained. G2 is **built and owner-reviewed, but not qualified, merged or live.** The live app is still G1.

## Where things stand

| Item | State |
|---|---|
| Live app and `main` | G1 as live: application `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6`, 17,586,964 bytes; `main` at `2790a2ba`, the G2 kickoff records commit. **Unchanged by G2.** |
| G2 branches (stacked, pushed) | `claude/release-15a-a05` → `-a06` → `-a07` → `-a11` → `-a04.1`. The tip, `claude/release-15a-a04.1`, carries G2's records. |
| G2 candidate build (the tip) | `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`, 17,609,230 bytes |
| Owner's device review | 36/36 Pass on iPhone Safari and Laptop Edge. **A05, A06, A07 and A11 accepted.** A04.1 was revised, and revision 1 is built. Doc: [G2 device checks](https://claude.ai/artifact/BAwpwquinGZwBXbuuVDehR); mirror: `DEVICE-CHECKS.md`. |
| Owed by the owner | A device re-check of **check 15** (A04.1, Seven Fortunes' Blessing: one card per option) on the [A04.1 preview](https://claude-release-15a-a04-1.l5r-character-sheet-creator.pages.dev/). Qualify only after it passes. |

### The units

| Unit | Marker | Tag / switch | Branch | Build | Own harness |
|---|---|---|---|---|---|
| A05 Missing Limb's picker | `PART H PHASE 15.1.5` | `LP15` / `LIMB_PICKER_ENABLED` | `-a05` | `dde68b5c…a726`, 17,591,617 | 22 |
| A06 Grant actions and their state | `PART H PHASE 15.1.6` | `GA15` / `GRANT_ACTIONS_ENABLED` | `-a06` | `9ae08de1…90d0`, 17,595,505 | 20 |
| A07 The Moon row | `PART H PHASE 15.1.7` | `MR15` / `MOON_ROW_ENABLED` | `-a07` | `9d1ece8c…2aae`, 17,598,724 | 26 |
| A11 Explanatory text gaps and one left edge | `PART H PHASE 15.1.11` | `TE15` / `TEXT_EDGES_ENABLED` | `-a11` | `d8965a9f…3907`, 17,602,520 | 22 |
| A04.1 One way to show choices in pickers | `PART H PHASE 15.1.4.1` | `IR15` / `INLINE_RULES_ENABLED` | `-a04.1` | `77936023…82f0`, 17,609,230 (revision 1) | 56 |

- **G2's new checks: 146** (22 + 20 + 26 + 22 + 56).
- **Each unit has, in its own folder** under `Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/`:
  - `README.md` and `ROLLBACK.md` (full hashes);
  - `qa/remove-phase.py`, `qa/test-removal.py` and its harness, with `qa/expected-checks.json`.
- **Each unit is registered** in `Versions/QA — Removal Chain Registry/removal_chain.py`, after A03.1, in unit order.
- **One declared conditional fixture:** Phase 4.5.21's harness, FB-GEOMETRY. With A04.1's seam key `IR15` present it measures `.ir15-rule`; otherwise it measures `.fb4521-rule`. It is declared in both ROLLBACK files and passes 77/77 both ways.
- **Soft dependency:** A04.1 extends Phase 4.54's `R454.EXCLUDE_FROM_LABEL` by property. It is declared both ways.

### Light checks already passed (7 November)

- Each own harness passed in full, also on the build with the previous unit removed and this one kept.
- `test-removal.py` passed 10/10 for every unit.
- `feature-dependencies.py` is clean for every unit.
- The harnesses of every touched layer pass. The tables are in each README and in `qa/verify-live.py`'s `TOUCHED`.
- Preview checks (`PREVIEWS.md`):

| Preview | Result |
|---|---|
| A05 | 1,922/1,922 |
| A06 | 2,050/2,050 |
| A07 | 2,098/2,098 |
| A11 | every G2 harness passed; one A03 timing race (below) |
| A04.1, whole group, revision 1 | 2,523/2,523 |

- The group review (`qa/code-review.md`) found no blocking defect.

## Read first

1. `Versions/CLAUDE.md`: the folder, removability and marker rules. It is append-only, with exactly 8 CR bytes.
2. G2's folder `Release 15a/G2 — Small Layout Fixes/`: `REPRODUCE.md`, `MOCKUP.md` (the approvals and the owner's decisions), `PREVIEWS.md`, `DEVICE-CHECKS.md` and `qa/code-review.md`.
3. G1's `Release 15a/G1 — Information Pattern/HANDOVER.md`, the worked example of qualification, and its `qa/VARIANT-PINS.md`.
4. The design rules' amendment of 6 November (the grouped process) in `Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md`.

## Run environment (must be set; found 7 November)

```bash
export NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules
export PLAYWRIGHT_BROWSERS_PATH=C:/Users/jcrow/l5r-qa-tools/ms-playwright
export PYTHONUTF8=1
```

- Without `PLAYWRIGHT_BROWSERS_PATH`, Playwright uses `AppData\Local\ms-playwright`. That copy crashed on 7 November.
  - This Python is a packaged install, so Node launched from Python cannot see that copy ("Executable doesn't exist").
  - The QA-tools copy works from both Bash and Python. It is the same Chromium, 153.0.8010.12.
- Run harnesses as the suite does, with two preloads:
  - `--require "Versions/PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs"`
  - `--require "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs"`
- Git Bash's `timeout` is Windows `timeout.exe`. Do not wrap commands in it.
- Use the canonical checkout `C:/Users/jcrow/l5r-character-sheet-creator`, never the OneDrive clone. Pull first.

## Steps

### 0. Before qualifying

- **The owner re-checks check 15** on the A04.1 preview. If it fails, revise A04.1 as before: its folder, its harness, its preview.
- **Close a timing race in A03's harness first.** A03's `MANAGE-EDITS-WORK` (in `Release 15a/A03 — Top-Aligned Columns and Compact Skill Cards/qa/compact-skills-harness.js`) failed once, on the A11 preview:
  - it taps Iaijutsu's Rank, confirms the field has focus, and types 7, but the field still held 5;
  - `PLAY-MASTERIES-REACHED` then failed because it depends on that Rank;
  - the same harness gave 37/37 on the identical page.
- The keys went elsewhere: focus moved between the tap and the typing. Find what moves it (a redraw, an autosave, a carousel settle) and make the harness wait for a stable, focused field before typing.
  - This is a declared harness fix in A03's ROLLBACK: same ids and counts, no loosening.
  - **Reason:** the single full pass may not be re-run.

### 1. Qualify once (screen-only tier)

No G2 unit adds timing or animation, so the 4× CPU screen does not apply. Copy G1's `qa/` scripts into G2's `qa/` and change only their constants:

- `verify-variants.py`, `test-removal-group.py`, `dependencies.py`, `qualify-before-full.py`, `final-qa.py` and `run-final-once.py`;
- the three suite runners: `current-suite-runner.js`, `retained-suite-runner.js` and `flat-suite-runner.js`.

G2's `qa/verify-live.py` already has the G2 tables, with A04.1's count at 56.

1. **Pin the negative variants before any run** in `qa/VARIANT-PINS.md`. For each unit: switched off, its CSS removed, and one or two mutations that break exactly what its checks read, at the moment they read it. Add the baselines. Run the discovery once and record any correction. Remember G1's lessons:
   - a check that toggles a body class must restore exactly what it found;
   - a check that opens a window must close it, even when it fails.
2. **Run the chain:**
   - group removal: each unit removed alone with the others kept (their harnesses in full), and the whole of G2 removed, which must rebuild G1's `2dcf6f20…6af6` exactly;
   - then the variants;
   - then the dependencies.
3. **Run one full pass, with its counts pinned by arithmetic beforehand:**
   - **Candidate: 7,148.** This is G1's `current-suite-runner.js` (7,002) plus G2's five harnesses (22 + 20 + 26 + 22 + 56 = 146). No older harness changes its count with G2 present: the 4.5.21 fixture keeps its ids and its 77, and every touched harness passed with its usual total.
     - G2's `current-suite-runner.js` = G1's list, with G2's five harnesses added.
   - **Retained (the tree with G2 removed, which is G1 as live): 6,929.** Confirmed on 7 November from G1's runners and `final-run-1/summary.json`.
     - A retained run leaves out the two live-site leaves, 73 checks: Phase 5a's `sw-checks` and Phase 5b's `notice-checks`. That is why G1's own candidate pass on this tree was 7,002, but its retained measure is lower.
     - G2's `retained-suite-runner.js` = G1's candidate list with A03's live-site suite swapped for its retained one: A04 35, A15 33, A16 50, A03.1 19, A03's `compact-skills-harness.js` 37, and A03's `retained-suite-runner.js` 6,755. That adds up to 6,929, as the G2 kickoff said.
     - G1's `final-qa.py` pins `CANDIDATE, RETAINED = 7002, 6792`. G2's must pin `7148, 6929`. Its `BEFORE` (the group-removed rebuild) becomes G1's `2dcf6f20…6af6`, 17,586,964 bytes, and `LAST_KEPT` becomes A03.1's folder.
   - Never re-run a failed pass, never widen a check, and investigate any failure rather than retrying.

### 2. Records once, then stop for the go-live word

- In `Release 15a/G2 — Small Layout Fixes/`: `HANDOVER.md`, modelled on G1's, and the checklist mirror (`DEVICE-CHECKS.md`, already written; update it for check 15).
- Update the ledger MD and HTML, the roadmap (`Versions/L5R Character Sheet Phased Roadmap reorder.md`), and add one dated pointer to `Versions/CLAUDE.md`.
- **Add to the roadmap and ledger (owner, 7 November):**
  - **A04.2, one pattern for a configured row.** Parked, and it **waits until the rules read pass is done.** The owner's layout:
    - one line: the choice badge on the far left, Change in Manage only, then the i, which explains every choice;
    - a summary underneath of what the chosen option does.
    - Decisions: one filled badge style everywhere, with "Applied automatically" or "Reminder" said in words. The summaries come from a later read pass of the rules. Bishamon's Clan-coloured note becomes plain summary text.
    - Details are in G2's `MOCKUP.md`.
  - **An owner idea outside G2:** the Identity tab's character check (Phase 5, Part J) should list every Advantage or Disadvantage still at "Needs a choice", as it does missing free Skill choices. Measured: no such rule exists today. It could be one rule registered into that phase's registry, using the sheet's own "configuration complete" test. Small.
  - **Left for later from A11's whole-app read:**
    - the Rings note, 12 px right of its label on a laptop;
    - the "Armor & TN ⓘ" heading in Play, and the bonus note 3 px under its field;
    - the Wounds table's first column, 8 px right of its caption.
- **Never commit** `candidate-leaves/`, `retained-leaves/` or `local/site/`.
- **Go-live, on the owner's word only:**
  1. Fast-forward `main` to the G2 tip: no merge commit, no force.
  2. Run `python -B qa/verify-live.py` (no `--url`) from G2's `qa/`.
  3. Run `Versions/BUGFIX — Older School Choices/qa/live-browser-smoke.cjs <G2 qa/live>` (22 checks).

## Not in scope

- G3 onward: the 8b.1 UI follow-ups, A09, A10, A17, A18, A08, A12, A19 and A20.
- FU-15a-1, the parked stats header, and FT-59 (a mon and colour theme per Clan; parked).
- A04.2 until after the rules read pass.

## Lessons from G2 (7 November)

- **Marker-shaped prose.** A comment that says "BUGFIX LM7" is read as another unit's marker, and the remover refuses. Write "the Lord Moon fix (LM7)". The same applies to "Phase 12 (Part K)", never in marker order.
- **Stylesheet-only units keep older checks intact.** A06, A07 and A11 use a switch plus CSS, with generated text (`::after` / `::before`), so no element or text an older harness reads changes.
- **Hidden, not removed, where an older check clicks an element in code.** Phase 4.54's per-option i stays in the DOM, not drawn. The older check that measured a now-undrawn element (4.5.21's FB-GEOMETRY) became a declared conditional fixture.
- **A layer that adds text to an option** must keep the option's first text span exactly as it was, because older checks read it (4.54's headings, 4.5.22's prices).
- **Harness oracles:**
  - The test character has 17 cards.
  - A line that opens with generated text starts where that text starts.
  - A tap on inline text should aim at its last line box, because an inline span's box starts on the line before it.
- **Long heredocs in Claude's Bash sometimes failed to parse.** File writes went through the editor instead.

## Usage

Take readings at the start, before qualification and at the end, kept separate from Codex. G2's build session used about 9 weekly points, from 84% to 93%, without the qualification. The weekly allowance resets on 11 November at 01:00 UTC.
