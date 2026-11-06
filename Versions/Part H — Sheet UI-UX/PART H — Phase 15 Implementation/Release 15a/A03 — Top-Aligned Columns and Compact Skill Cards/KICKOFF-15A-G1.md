# Kickoff — Release 15a, group G1 (information pattern): A04, A15, A16

Prepared 6 November 2026 by the A03 session. The owner accepted A03, took it live, and chose to continue 15a under the grouped process of 6 November. **This is the first group run under that process.**

## Baseline

Use the canonical checkout `C:/Users/jcrow/l5r-character-sheet-creator`, never the OneDrive clone. Pull first, inspect local changes, and read the latest CLAUDE.md pointers and the ledger and roadmap summaries.

- **Accepted and live: Release 15a A03, revision 2.** Application `e73b7c0cac70c95d2965d993c9a3b9f0b66eb6f3ef4b81d6667166667090de06`, 17,553,370 bytes. `main` was fast-forwarded to `46a7929d` and then to the records commit `b2f376a8`. Production was verified on 6 November at 15:23 UTC: page `e7cb9b99…cbc1` and service worker `946e8dc511b4b539`, 550/550, smoke 22/22. Records commits may move `main` without changing these bytes, so check HEAD and the byte hash before choosing the predecessor.
- **Removal chain:** A03's remover rebuilds A02 `91d45109…6dc0`. Each G1 unit registers after A03 in `QA — Removal Chain Registry`, in finding order.

## Read first

- **[The 6 November amendment](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>)** at the end of the design rules. It is the process for this group: mockup, light checks, the owner's review of each finding, then QA once for the group. Read the rest of that file for the isolation and removal rules, which are unchanged.
- **The audit's three findings:** [A04, A15 and A16](<../../../PART H — Phase 15 UI Consistency Audit/AUDIT.md>), with their screenshots.
- **The settled rulings:** [Q3](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-RULINGS-2026-11-01.md>):
  - the upright circled i as its own labelled control;
  - static text behind it, live state and reasons visible;
  - whole court chips select, with Add court on the row;
  - the redundant bottom i removed only in the seven legacy pickers.

  Do not reopen Q1–Q8.
- **A worked example of the build pattern and its QA scripts:** [A03's handover](HANDOVER.md), [README](README.md), [ROLLBACK](ROLLBACK.md) and `qa/`. [A03's kickoff](<../A02 — Floating Controls Above the Tabs/KICKOFF-15A-A03.md>) holds the standing lessons: geometry, scrolling, `checkVisibility`, print references, the carousel label rule and title= circled-i.

## Scope: A04, A15, A16 only

- **A04 · one information pattern.**
  - The gold italic I, circled i, eye and question-mark treatments become one: the upright circled i, as a sibling button with an accessible name and touch area.
  - No information button sits nested inside a configuration button.
  - Keep "Help" and "Why can't I cast" distinct where they explain an error.
- **A15 · court chips.** Each whole chip is a labelled selection button, and Add court sits on the row. Rename and remove stay in the editor.
- **A16 · the bottom i.** Remove the redundant bottom i from the seven legacy pickers only. Inventory those seven against their historical test IDs before editing.

**Declared interaction with A03.**
- A03 places the Skill row's eye (`.sk-info-btn`) at the end of the phone card's second row, and its harness checks it there.
- If A04 restyles that eye as the circled i, keep the element and its class, or declare the dependency in both ROLLBACK files. A03 must keep passing with G1 present.

**Owner's suggestion from A03:** the eye's Skill information shows no player-facing Mastery list, only debug buttons. The owner suggested it as the home for reference detail. That is a scope addition: offer it at the mockup step, and do not build it unasked.

**Not in G1:**
- A05 onward;
- the 8b.1 follow-ups;
- FU-15a-1;
- the parked stats header.

## Steps

1. **Reproduce on today's build.** Inventory every information treatment and every nested button, with screen, element and owner layer. Inventory the seven legacy pickers and the court row. Phone (390 × 844) and desktop (1440 × 1000), Play and Manage.
2. **Mockups. STOP for the owner's approval.** Make one board for each finding, showing today's screen and the proposed change, using a scratch prototype on the current build. Send the images to the owner with SendUserFile, together with the A03 Mastery-list question. Build only what is approved.
3. **Build three units,** each with:
   - its own folder (`Release 15a/A04 — …`, `A15 — …`, `A16 — …`);
   - its own fragments after A03's in the manifest;
   - its own switch, marker (`PART H PHASE 15.1.4`, `15.1.15`, `15.1.16`), seam block and remover.
   - **Branches stack:** `claude/release-15a-a04`, then `-a15` built on it, then `-a16` built on that.
   - **Prose rule:** write other phases as "Phase 12 (Part K)", never in marker order.
4. **Light checks for each unit:**
   - its own pinned harness;
   - `test-removal.py`;
   - `feature-dependencies.py`;
   - the harnesses of the layers it touches: at least A03's, Phase 4.54 (Part I)'s and the court-picker owner's.

   Then run one read-only review of the whole group's diff, and fix what it finds.
5. **The owner's review.**
   - Check each branch's preview with `verify-live.py --url=<preview>`, adapted from A03's.
   - Make one Claude Doc for the group: a section for each finding with Pass/Fail for iPhone Safari and Laptop Edge and its own Accept / Revise / Remove, comparing each finding with the preview before it.
   - **STOP for the owner's decisions.** A revision costs only light checks.
6. **Qualify once for the accepted units (screen-only tier).**
   - Pin the negative variants before running them.
   - Prove removal: each unit alone with the later ones kept, and the whole group removed restoring A03 `e73b7c0c…de06` exactly.
   - Run the dependency checks and the comparison.
   - Run **one** full pass, candidate and retained, with counts pinned by arithmetic beforehand: 6,865 + the group's new checks. Rebuild A03's runner constants for the group.
   - Run the 4× CPU screen only if a unit adds timing or animation.
   - The never-re-run and never-widen rules hold.
7. **Records once for the group, then STOP for the go-live word.**
   - **Records:** a group handover and checklist mirror in `Release 15a/G1 — Information Pattern/`; the ledger MD/HTML; the roadmap; one dated CLAUDE.md pointer. CLAUDE.md is append-only with exactly 8 CR bytes.
   - **Go-live, on the owner's word only:** fast-forward only, then verify production with `verify-live.py` (no `--url`) and `live-browser-smoke.cjs <qa/live>`.
   - **Commits:** never commit `candidate-leaves/`, `retained-leaves/` or `local/site/`.

## Usage

Take readings at the start, after the mockups, before qualification, and at the end. Keep them separate from Codex.

**Estimate only:** the work order puts these three at 11 (A04 5, A15 3, A16 3). Under the grouped process, expect about 10–15 weekly points, assuming no revision. Say early if step 1 suggests more.
