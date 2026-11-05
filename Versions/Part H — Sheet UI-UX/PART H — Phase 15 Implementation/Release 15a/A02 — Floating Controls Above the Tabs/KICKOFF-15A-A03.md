# Kickoff — Release 15a, A03 (Top-align columns and simplify long Skill cards)

Prepared 5 November 2026 by the A02 session, after the owner accepted A02 revision 2 and gave the go-live word in chat ("happy to merge and proceed onto A03"). **The owner has selected A03.** Build A03 only.

## Baseline

Use the canonical checkout `C:/Users/jcrow/l5r-character-sheet-creator`, never the OneDrive clone. Pull first, inspect local changes, and read the latest CLAUDE.md pointers and the ledger and roadmap summaries.

- **Accepted and live: Release 15a A02 revision 2.** Application `91d451099ee58f1b481fcf87b3defa7955138f9fb67a56e8fa6fac1e5ad66dc0`, 17,538,334 bytes. `main` fast-forwarded to `2097ec0f` on 5 November. Production verified on 5 November at 23:28 UTC: live page `8a972827…` (17,545,111 bytes) and service worker `a05aaf784ac466c9` byte for byte with the accepted build, 496/496 on the downloaded files, browser and offline smoke 22/22. Records commits may advance `main` after that without changing these application bytes. Check the actual HEAD and byte hash before choosing the predecessor.
- **Removal chain:** A02's own remover rebuilds A01 `cffde624…0414`, and A01's rebuilds 8c `139e0810…2551`. A03 registers last in `QA — Removal Chain Registry`, after A02.

## Read first

- [A03 in the audit](<../../../PART H — Phase 15 UI Consistency Audit/AUDIT.md>): the heading "A03 · Top-align columns and simplify long Skill cards", with its three screenshots.
- [Delivery and independent-removal rules](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>) and [settled Q1–Q8](<../../../PART H — Phase 15 UI Consistency Audit/PHASE-15-RULINGS-2026-11-01.md>). Q1 covers A03. Do not reopen Q1–Q8.
- [Work order](<../../../../REASSESSMENT — Cycle 8 Closure 2026-11-04/WORK-ORDER.md>): A03 is M, 5 (3–8).
- [A02 handover](HANDOVER.md), [README](README.md) and [ROLLBACK](ROLLBACK.md). These are the latest worked example of the whole process. A01's folder is the other.

## A03 only

From the audit (Q1 accepted):
- **Top-align the two columns.** On the desktop, with unequal lists, the Advantage column starts far below the Disadvantage column. A02's measuring saw it again when one list is empty.
- **Simplify phone Skill cards.** Give each a compact name / rank / roll row. Put the secondary editing and the Mastery details under a labelled disclosure.
- **Keep everything else.** Every value, School tick and action stays. Management is not moved to another screen.

Begin with reproductions on today's build, not on the audit's screenshots, which predate 8b, 8c, A01 and A02. Cover the dense test character on desktop and phone, in Play and Manage, with both lists filled, one list empty, and long Skill lists with Masteries, Emphases and School ticks. Define the smallest complete change and its removal boundary.

**Stop and return a revised scope before building** if any of these happens:
- the investigation changes the scope materially;
- an independence conflict appears;
- Phase 12's Play/Manage locks (12.4 owns the Skill row controls) or Phase 4.54's info buttons would need editing rather than layering.

**Not in A03:**
- A04 (one information pattern) and any other finding.
- The three 8b.1 UI follow-ups.
- FU-15a-1 (no duplicate Kiho, Kata or spells).
- The always-visible stats header, which the owner parked with the Combat tab plan on 5 November.

## Build pattern (as A01 and A02)

- **Folder:** `Release 15a/A03 — <short name>/`, holding its README, ROLLBACK, COMPARISON, DEVICE-CHECKS, HANDOVER and `qa/`.
- **Code:** canonical fragments in Phase 0's `src/sheet` and `src/css`, with their own manifest entries, after A02's. A02's script is `209.9999999999999996-…`; check how the manifest orders fragments before naming A03's.
- **Names:** marker `PART H PHASE 15.1.3`, its own switch and tag, and a guarded seam block after A02's.
- **Prose rule:** write other phases' names as "Phase 12 (Part K)", never in marker order.
- **Before shipping:** run `qa/feature-dependencies.py`, and do the scratch removal against the current tree.

## Lessons from A02 that apply here

- **Geometry.** A02 places Quick Access bottom-left, the dice bottom-right and return-to-top above the dice, 8 px above the tab bar (`--car-tabbar-h`). Every `.car-page` has screen-only end room `--fc15-end`: 116 px, or 64 px at `max-height: 500px`. There is no band and no `--fc15-h` any more. A geometry-reading harness must allow for the corners and the end room. A compact Skill card's controls must stay clear of the corners at the end of a page.
- **Scrolling in harnesses.** A02's review found its "part-way" scroll assigned a string, which reads as 0, so revision 1 tested the top twice. Scroll by number: `Math.min(400, (scrollHeight − clientHeight) / 2)`.
- **Hidden content.** Decide "visible" with `checkVisibility({visibilityProperty: true})`. Content inside a closed `<details>` still reports layout boxes, which matters for a disclosure finding.
- **Print references.** Compare print with the same page printed without the layer's class, not with an assumed value. The base print padding is 22 px, not 0.
- **Carousel label rule.** `body.car-active .car-page label` (0,2,2) shrinks and uppercases row labels. Single-class selectors lose to it.
- **Since 4.54,** an explanatory `title=` gets a visible circled-i.
- **Owner preference.** They value vertical space on the phone. Avoid permanent bars or extra rows, and prefer folding information into existing chrome.
- **Service-worker harness.** It now has step limits (QA — PWA Harness Step Limits, commit `13f85caf`, on `main`). A stall fails within about a minute and names its step. Investigate it; never re-run.

## Verification and progression (unchanged rules)

- "Never drop assertions, widen expected values, merely lengthen timeouts, or re-run a failed full suite." "Both full passes must succeed on their first executions."
- **Order:** targeted checks; one read-only code review; a 4× CPU screen of the changed harnesses; one discovery run; then two fresh full passes on mains with keep-awake. Pin negative variants before running them.
- **Counts:** discover and pin the retained counts. Do not copy A02's 6,828 / 6,732; A03 adds its own checks.
- **Removal:** prove exact restoration to A02 `91d45109…6dc0`, and that the retained suite passes with A03 removed.
- **Commits:** run logs and summaries only, never `candidate-leaves/`, `retained-leaves/` or `local/site/`.
- **Deliverables:** comparison against A02 as live; a plain phone-readable checklist as a Claude Doc (Pass/Fail pickers for iPhone Safari and Laptop Edge, plus Accept/Revise/Remove); preview checked with `verify-live.py --url=<branch preview>` (with no `--url` it targets production).
- **Records:** ledger MD/HTML (an A03 block in each of parts 1–4 and 6), roadmap, handover and a dated CLAUDE.md pointer. CLAUDE.md is append-only and must keep exactly 8 CR bytes.
- **Usage:** take readings at the start, before full QA and at the end, kept separate from Codex. A01 took about 7 weekly points and A02 about 17 (two revisions, a failed pass and a harness fix), against 5 each. The work order's reforecast is now due: state it in one paragraph at the start, as an estimate only, not a new budget approval.
- **Stop for the owner's decision.** Never merge to `main` or deploy without the owner's explicit go-live word. After go-live: fast-forward only, then verify production byte for byte (`verify-live.py`, plus the browser and offline smoke `BUGFIX — Older School Choices/qa/live-browser-smoke.cjs <qa/live>`).
