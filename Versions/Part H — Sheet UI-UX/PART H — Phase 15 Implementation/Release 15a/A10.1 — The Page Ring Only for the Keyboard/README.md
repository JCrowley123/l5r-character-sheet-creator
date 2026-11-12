# Release 15a · A10.1 — The Page Ring Only for the Keyboard

Group G4, unit 3 of 4. The owner's item of 12 November 2026, raised at G3's device round ([G3's owner comments](<../G3 — Spell Rows/OWNER-COMMENTS-2026-11-11.md>), point 1), put beside A10 as A10.1. The owner approved option A of the mock-up on 12 November 2026 ([G4 mock-ups](<../G4 — Touch, Focus and Startup/MOCKUP.md>)). Built on 12 November 2026 (Claude), on branch `claude/release-15a-a10.1`, stacked on A10.

**Built and light-checked. Not device-checked, not qualified, not live.**

## What changes

- **The page's gold ring is drawn only when the page is reached with the keyboard.** After the School-choice window closed on iPhone Safari, a gold line ran round the page until the mode changed. It is the page's own focus ring: a closing window gives focus back to what had it, and on an iPhone that is the page, because Safari does not focus a tapped button. Now, after a tap, a click or a window closing, the ring is not drawn. The Tab key and the other navigation keys bring it back, exactly as before (same 2 px gold, inset 3 px).
- **Focus is unchanged.** It still goes back to the page; only the outline is affected, and only on pages. Every other control keeps its own focus look.
- **Every window at once.** The rule is about how the person last moved, so it covers every window that gives focus back to a page.

## How it is built

- `src/sheet/209.999999999999999994-feat-keyboard-page-ring.js` — `KR15` and the switch `KEYBOARD_PAGE_RING_ENABLED`. Sets the `kr15-on` body class; a navigation key (Tab, the arrows, Enter, Escape, Space, Home, End, Page Up, Page Down) adds `kr15-keyboard`, a tap, click or touch takes it away.
- `src/css/1144-keyboard-page-ring.css` — one rule: no page ring unless `kr15-keyboard`. Screen only.
- One guarded seam block, `keyboard-page-ring-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A10.1 (this branch) | `354d223000cca447ad84a035cd66821b1b83fc64f34341a7925201e0aa7b45f7` | 17,644,597 |
| A10.1 removed (A10) | `c872c1b30fdffd3a2c8c5c4043020d1653a81da8912e9eae70a96c62bdc3f16f` | 17,640,999 |

## Light checks (12 November)

**What the checks found.** First run of the own harness: 11/14, three checks failing from two faults in the harness's own sequences, fixed before any result was used (same ids and count):

1. On the phone it focused the page with a real tap. Chromium does not then draw the ring for focus given back by script, so the without-the-unit check could not see the owner's ring. The harness now gives the page focus by script, as G3's focus-ring probe did, and runs the tap check after the window check.
2. On the laptop, six Tab presses did not reach the page from the tab bar; the walk now allows up to 80.

Then 13/14, then 14/14 on the candidate. On G3 as live the same harness gives 5/14: the ring after the window and after a tap on the page is drawn there, which is the owner's report.

| Check, on the final build | Result |
|---|---|
| Own harness `qa/keyboard-page-ring-harness.js` (14 checks pinned before the first run) | 14/14 |
| Own harness on G3 as live (the unit absent) | 5/14 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| Own harness with A10 removed (A10.1 kept; `34b2a1aa…b3ec`) | 14/14 |
| A09's and A10's harnesses on this build | 20/20, 23/23 |
| The touched layers' own harnesses: Older School Choices, A01, 8b.1-UI-01, Phase 11.2.5 (Part K) School choices, Search and app-bar focus, the carousel fixes, Phase 12 and 12.8 (Part K), Phase 14 (Part K) Search, Manage button, characteristic card editing (summary in `G4 — Touch, Focus and Startup/qa/light/a10.1-summary.json`) | 17/17 harnesses, 391/391 checks |

See [ROLLBACK.md](ROLLBACK.md).
