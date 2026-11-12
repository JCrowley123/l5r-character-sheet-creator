# Release 15a · A10 — Cross-Page Actions Move Focus

Group G4, unit 2 of 4. Finding A10 of the Phase 15 audit (FT-50 and FT-52, the owner's notes of 29 October). The owner approved the mock-up on 12 November 2026 ([G4 mock-ups](<../G4 — Touch, Focus and Startup/MOCKUP.md>)). Built on 12 November 2026 (Claude), on branch `claude/release-15a-a10`, stacked on A09.

**Built and light-checked. Not device-checked, not qualified, not live.**

## What changes

- **The row (FT-50).** Under Identity's Add School, the hint "Advanced Schools are on the Techniques page, under Advanced School." and its Go to Advanced Schools button share one wrapping row, centred on each other. On a laptop they sit on one line (the button was 4 px below the hint's line; now 0.4 px). On a phone the hint fills the line and the button wraps below it at its 44 px height, 4 px under the line as before.
- **Focus (FT-52).** After the button is pressed (tap, click or Enter), once the carousel has settled on Techniques and the button has scrolled to the Advanced School panel, focus moves to the panel's "Advanced School" heading. Identity then becomes inert like any page you are not on, so the next Tab goes to the Advanced School picker, not to Honour Rank on the hidden page. The heading draws no ring, and a phone keyboard does not open (a heading is not a text box). Going back by the Identity tab works as before.
- **Written once.** `CP15.ROUTES` lists each button that opens another page with the page and heading it opens. Today there is one; a later cross-page button is one more line.

## How it is built

- `src/sheet/209.999999999999999993-feat-cross-page-focus.js` — `CP15` and the switch `CROSS_PAGE_FOCUS_ENABLED`. Sets the `cp15-on` body class; one click listener on the document (it runs after the button's own handler has started the move); the heading takes `tabindex="-1"` only while it holds focus.
- `src/css/1143-cross-page-focus.css` — the row, the hidden button kept hidden, and no ring on the focused heading. Screen only.
- One guarded seam block, `cross-page-focus-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A10 (this branch) | `c872c1b30fdffd3a2c8c5c4043020d1653a81da8912e9eae70a96c62bdc3f16f` | 17,640,999 |
| A10 removed (A09) | `0fb2a08ab6c80e94800b72a45f4796ca6e8279b7d12ac07a800f5aa2e7c7914d` | 17,635,271 |

## Light checks (12 November)

**What the checks found.** First run of the own harness: 22/23. `CP-ROW-PHONE` found the gap between the hint's line and the wrapped button 8.5 px against the pinned 4–8 px: the 6 px row gap made it larger than today's 4 px spacing. A defect in the stylesheet, not the check: the row gap is now 4 px (build `14e2f6a8…b80d` before the fix). Second run: 23/23.

| Check, on the final build | Result |
|---|---|
| Own harness `qa/cross-page-focus-harness.js` (23 checks pinned before the first run) | 23/23 |
| Own harness on G3 as live (the unit absent) | 14/23: the seam, the laptop row, focus, inertness, the next Tab and Enter fail, as they should |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| Own harness with A09 removed (A10 kept; `9a5d8b3f…aa33`) | 23/23 |
| A09's harness on this build | 20/20 |
| The touched layers' own harnesses: the Advanced Schools pointer and button, Phase 4.7 and 4.7.1 (Part I), Phase 12, 12.2 and 12.6 (Part K), characteristic card editing, Search and app-bar focus, the carousel fixes, A01–A04 and A11 (summary in `G4 — Touch, Focus and Startup/qa/light/a10-summary.json`) | 20/20 harnesses, 757/757 checks |

See [ROLLBACK.md](ROLLBACK.md).
