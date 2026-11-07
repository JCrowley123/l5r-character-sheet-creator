# Kickoff — Release 15a, group G2 (small layout fixes): A05, A06, A07, A11, A04.1

The G1 session prepared this on 7 November 2026. The owner accepted all four G1 units and took them live the same day. G2 is the second group under the grouped process of 6 November. It has **five** units: the four the process assigned, plus one the owner added at G1's review.

## Baseline

Use the canonical checkout `C:/Users/jcrow/l5r-character-sheet-creator`, never the OneDrive clone. Pull first, inspect local changes, and read the latest CLAUDE.md pointers and the ledger and roadmap summaries.

**Accepted and live: Release 15a G1** (A04, A15, A16, A03.1):
- **Application:** `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6`, 17,586,964 bytes.
- **`main`:** fast-forwarded to `22c1d724`, then to the records commit `c7d28d69`.
- **Production, verified 7 November:**
  - page `490f4a38…` and service worker `616c577290b65bb1`;
  - 1,799/1,799 on the downloaded files;
  - smoke 22/22.

Records commits may move `main` without changing these bytes, so check HEAD and the byte hash before choosing the predecessor.

**Removal chain:**
- A03.1's remover rebuilds A16 (`f64b6e37…58ef`).
- The whole of G1 removed rebuilds A03 (`e73b7c0c…de06`).
- Each G2 unit registers after A03.1 in `QA — Removal Chain Registry`, in unit order.

## Read first

- **[G1's handover](HANDOVER.md).** This is the worked example for a whole group: mock-ups, stacked branches, preview checks, the device-check doc, the variant pins, the group removal proof and the one full pass. Copy G1's `qa/` scripts and change only their constants: `verify-live.py`, `verify-variants.py`, `test-removal-group.py`, `dependencies.py`, `qualify-before-full.py`, `final-qa.py`, `run-final-once.py` and the three suite runners.
- **[The 6 November amendment](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>)** at the end of the design rules (the process), and the **owner additions of 7 November** below it.
- **The audit's four findings:** [A05, A06, A07 and A11](<../../../PART H — Phase 15 UI Consistency Audit/AUDIT.md>), with their screenshots.
- **[The rulings](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-RULINGS-2026-11-01.md>):** all four findings are ruled under Q1. Do not reopen Q1–Q8.
- **The standing lessons** in [A03's kickoff](<../A02 — Floating Controls Above the Tabs/KICKOFF-15A-A03.md>) and in G1's lessons below.

## Scope: five units

1. **A05 · Missing Limb's picker** (FT-12).
   - Keep the native select.
   - Give it the shared label, spacing, font and touch height.
   - No custom menu.
2. **A06 · grant actions and their state** (FT-42).
   - A compact action group with a clear gap: primary **Add N koku**, secondary **Already added**, and the granted state beside it.
   - Covers Zakyo Toshi Citizen and Wealthy's grant buttons.
   - Keep the one-time guard, the reversal and large touch targets.
3. **A07 · the Moon row.**
   - A labelled severity row, and a separate, aligned full-moon toggle.
   - Keep "Resist Lord Moon (TN n)", its state, the extra-pip order and all rules.
4. **A11 · explanatory text below fields** (FT-51).
   - A shared small helper-text gap and readable line height for Insight and Spent XP, as the audit proposes.
   - **The owner's addition, 7 November:** text on Advantage cards does not line up. In Play a description box keeps its inner padding, so it starts **10 px right** of the line above it (Sworn Enemy's summary, Hotei's line). This was measured the same on the live app and on G1.
   - **Start A11 with a read of the whole app** for similar cases (text that does not line up, or sits hard against a field), on a phone and a laptop, in Play and Manage. Show what the read found at the mock-up step, before fixing anything.
5. **A04.1 · one way to show choices in pickers.** The owner added this at G1's review (comment 2), as a G2 unit.
   - Today the pickers explain their options three ways:
     - Seven Fortunes' Blessing (Phase 4.5.21 (Part I)) uses its own "▶ Rule" disclosure on each option;
     - the 4.5.2 pickers (Seven Fortunes' Curse, the tenet pickers and others) have the i that Phase 4.54 (Part I) adds on each option, inside the option card;
     - Paragon and Dark Paragon show each option's rule inline.
   - **The owner chose inline:** show each option's rule in full in the picker, as Paragon does, and remove the "▶ Rule" disclosures and the per-option i. The row's i keeps the text after choosing.
   - Inventory **every** picker first, because the look must be consistent across them.
   - The mock-up must show the long cases on a phone, Seven Fortunes in particular, since seven full rules make a long window.
   - Name and marker: **A04.1**, `PART H PHASE 15.1.4.1`. It extends A04's information pattern into the pickers. A04's remover only matches `15.1.4` when no digit follows, so it never matches 15.1.4.1. Check that with the remover's `OWN_RE`, as A03.1 did.
   - The owner's estimate guidance was about 3–5 weekly points.

**Not in G2:**
- G3 onward: the 8b.1 UI follow-ups, A09, A10, A17, A18, A08, A12, A19, A20;
- FU-15a-1;
- the parked stats header;
- **FT-59** (a mon and a colour theme for every Clan, about 12 themes): parked by the owner on 7 November; recorded only, no mock-ups.

## Steps (the grouped process)

1. **Reproduce on today's build.** Inventory each unit's screens with element and owner layer: phone (390 × 844) and desktop (1440 × 1000), Play and Manage. For A11, do the whole-app read. For A04.1, inventory every picker and how it explains its options.
2. **Mock-ups. STOP for the owner's approval.** One board per unit, today beside proposed, using a scratch prototype on the current build (G1's `qa/prototype*.cjs` and `qa/board.cjs` are the pattern). Send them with SendUserFile. Build only what is approved; the owner may revise in rounds, as in G1.
3. **Build five units.** Each gets:
   - its own folder (`Release 15a/A05 — …` and so on);
   - its own fragments after A03.1's in the manifest;
   - its own switch, marker (`PART H PHASE 15.1.5`, `15.1.6`, `15.1.7`, `15.1.11`, `15.1.4.1`), seam block, remover, `test-removal.py` and registry entry;
   - **stacked branches:** `claude/release-15a-a05`, then `-a06`, `-a07`, `-a11` and `-a04.1`, each built on the one before.
   - **Prose rule:** write other phases as "Phase 12 (Part K)", never in marker order.
4. **Light checks for each unit:**
   - its own pinned harness;
   - `test-removal.py`;
   - `feature-dependencies.py`;
   - the harnesses of every layer it touches. G1's harnesses are among them: A04's for A04.1, and A15's where a row is shared.

   Then run one read-only review of the whole group's diff, and fix everything it finds before the previews.
5. **The owner's review.**
   - Check each branch's preview with G1's `verify-live.py --url=<preview> --ref=<branch>`, with the G2 units and their touched harnesses added to its tables.
   - Make one Claude Doc for the group: a section per unit, with Pass/Fail dropdowns for iPhone Safari and Laptop Edge, and Accept / Revise / Remove per unit.
   - **STOP for the owner's decisions.**
6. **Qualify once for the accepted units (screen-only tier).** Unless a unit adds timing or animation: then it is the behaviour tier, and the 4× CPU screen applies.
   - Pin the variants, run the discovery once, and record any correction.
   - Run the chain: group removal (each unit alone with the others kept, and the whole group removed restoring G1's `2dcf6f20…6af6` exactly), then the variants, then the dependencies.
   - Run **one** full pass, with its counts pinned by arithmetic:
     - **candidate:** 7,002 plus G2's new checks;
     - **retained:** the tree with G2 removed is G1 as live, so G1's 137 plus 6,792 = **6,929**.
   - Never re-run a failed pass, never widen a check, and investigate any failure under load rather than retrying.
7. **Records once, then STOP for the go-live word.**
   - The group handover and checklist mirror in `Release 15a/G2 — Small Layout Fixes/`.
   - The ledger MD/HTML, the roadmap, and one dated CLAUDE.md pointer. CLAUDE.md is append-only, with exactly 8 CR bytes.
   - **Go-live on the owner's word only:** fast-forward only, then `verify-live.py` (no `--url`) and `BUGFIX — Older School Choices/qa/live-browser-smoke.cjs <qa/live>` (22 checks).
   - **Never commit** `candidate-leaves/`, `retained-leaves/` or `local/site/`.

## G1's lessons (7 November)

- **Python cannot see npm's AppData\Roaming copy of Playwright** on this machine: a Node started from Python gets "Cannot find module 'playwright'". Set `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules` for everything launched from Python (the qualification scripts already do). A shell-launched Node works with either copy.
- **Harness preloads:** run every harness as the suite does, with Phase 14.2's `navigation-budget.cjs` and Phase 0.6.2's `splash-fast.cjs`. Without them, 4.5.14's harness loses two taps to the splash (182/184).
- **Preview host names:** a dot in a branch name becomes a dash, so `claude/release-15a-a04.1` is previewed at `claude-release-15a-a04-1…`.
- **`display:none` reports an all-zero box.** A geometry check that measures every button (4.5.14's `CS-GEOMETRY`) then fails. Remove an element, rather than hide it, when an older check measures it, as A16 did; do not loosen that check.
- **The global `button:hover` fade** (opacity 0.85) sticks after a tap on a phone. Give a state-carrying fill `opacity: 1` on hover, as A15 did.
- **Harness hygiene:**
  - A check that toggles a body class must restore exactly what it found. G1's first variant discovery caught A04's harness giving a switched-off build its class.
  - A check that opens a window must close it, even when it fails.
  - Both showed up only as variant mismatches.
- **Weak mutations:** a variant must break what its check reads, at the moment it reads it. G1 replaced one that broke nothing there.
- **Older harnesses that assert on controls a unit changes:** make those checks conditional on the unit's seam key, keeping the same ids and counts, and prove them both with the unit and with it removed. Declare this in both ROLLBACK files. A15 did this for 4.5.14 and 12.5.
- **Restacking:** fixing an earlier unit after later branches exist means rebuilding each later branch on it, with a new predecessor hash in its remover, `test-removal.py`, README and ROLLBACK. Do the review before pushing previews, to avoid this.
- **The review earns its place:** G1's found a Play-mode regression no harness covered (a lone i in Play). It is now a check.

## Usage

Take readings at the start, after the mock-ups, before qualification and at the end, kept separate from Codex.

**At G1's end:** weekly was 81%, and it resets on 11 November at 01:00 UTC. **G1 used about 19 points** against its 10–15 estimate: four units, and three mock-up rounds.

**Estimate only for G2:** five units: four small ones, and A04.1 at about 3–5. Expect about 15–20 weekly points, assuming no revision. **That is about what was left of this week after G1, so starting after the 11 November reset is safer.** Say early if step 1 suggests more.
