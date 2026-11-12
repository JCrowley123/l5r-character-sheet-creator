# G4 negative-variant pins — prepared before any run

12 November 2026 (Claude). Frozen candidate `fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb`, 17,648,272 bytes (A09, A10, A10.1 revision 1, A17: the whole group). Baseline for each unit: G3 as live, commit `5d14ebe3`, application `6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029`, 17,631,957 bytes. Every exact failed-check id is in `variants.json`.

**The baselines are known, not predicted:** each unit's harness was run on G3 as live during the light checks (A09 10/20, A10 14/23, A10.1 9 failures of its first 14, A17 11/25; READMEs). A10.1's two revision-1 checks are reasoned for the baseline (both fail there: no keyboard mark to set, and the page's ring is drawn after typing). A17's focal-bottom case is also known: the same mutation was run during A17's light checks (23/25). **Every other prediction is reasoned from each harness's oracles and the source, not taken from a variant run.**

16 mutations (switch off, own stylesheet removed, two focused defects per unit) plus 4 baselines. Each mutation changes exactly one unique string in a scratch copy of the frozen page; a removed stylesheet is read from its own fragment file. The discovery runs once; any correction is explained here before the qualification chain. No full-suite discovery, retries or widened assertions.

| Case | Predicted failures |
|---|---:|
| A09:baseline (known) | 10 |
| A09:disabled | 10 |
| A09:no-css | 7 |
| A09:touch-auto | 2 |
| A09:rings-shrunk | 1 |
| A10:baseline (known) | 9 |
| A10:disabled | 9 |
| A10:no-css | 1 |
| A10:keeps-tabindex | 3 |
| A10:phone-gap | 1 |
| A10.1:baseline (9 known + 2 reasoned) | 11 |
| A10.1:disabled | 11 |
| A10.1:no-css | 5 |
| A10.1:typing-counts | 1 |
| A10.1:no-pointer-clear | 3 |
| A17:baseline (known) | 14 |
| A17:disabled | 14 |
| A17:no-css | 10 |
| A17:old-switch-point | 5 |
| A17:focal-bottom (known) | 2 |

## Why each case fails where it does

- **A09 disabled** (switch off): no `tx15-on`, so the same ten as G3: the three seams, the 16 px checks on phone and tablet, the class-off check (its "on" sizes are not 16), the button checks on phone and tablet, and Play. Viewport, no box smaller, no overflow, zoom kept, the stepper, the laptop checks and no errors hold, as on G3.
- **A09 no-css:** the class and seam are there; everything the stylesheet does fails: 16 px on phone and tablet, every box, class-off, buttons on phone and tablet, Play.
- **A09 touch-auto** (`manipulation` → `auto`): only the two button checks.
- **A09 rings-shrunk** (the `ring_*` exclusion removed): the Ring boxes drop from 20.8 to 16 px; every 16 px check still passes; only "no box smaller" fails.
- **A10 disabled:** as G3: the two seams, focus and inertness on both devices, the laptop row, the next Tab and Enter. The phone row (the hint fills the line as before), the hidden button, no keyboard, no ring on the focused element (the button), the panel in view (the pointer's own scroll), the return, and the class-off focus check all hold.
- **A10 no-css:** the focus moves as built; only the laptop row fails (the button 4 px low again). In Chromium a heading focused by script after a click or tap does not match `:focus-visible`, so `CP-NO-RING-*` holds without the rule; the phone row and the hidden button behave as on G3.
- **A10 keeps-tabindex** (the heading keeps `tabindex="-1"` after it loses focus): the next-Tab check and both returns read the heading's tabindex and fail; Enter and the class-off check do not read it.
- **A10 phone-gap** (row gap 12 px): only the phone row (the gap to the wrapped button exceeds 8 px); the laptop row is one line.
- **A10.1 disabled:** as the G3 baseline, eleven: both seams, the ring after the window and after a tap on the phone, the class-off ring (its own class is not there to put back), typing (the ring is drawn after typing), the ring by Tab and after the window by keys (no keyboard mark), the window by mouse, the mouse clearing, and Tab from a box.
- **A10.1 no-css:** the marks are set and cleared as built, but no ring is ever hidden: the ring after the window and after a tap on the phone, after typing, after the window by mouse and after a mouse click all show it. The class-off check, the keyboard checks and Tab from a box hold.
- **A10.1 typing-counts** (revision 0's behaviour): only the typing check, as measured on revision 0 during the code review.
- **A10.1 no-pointer-clear** (a tap or click no longer clears the mark): nothing changes on the phone (no navigation key is pressed before its checks). On the laptop the mark stays from the Tab walk: the mouse-clearing check, the window by mouse and Tab from a box (the mark is already set before Tab) fail.
- **A17 disabled:** the script records itself switched off and changes nothing: as G3, fourteen: the seam, every fill check, the switch point, class-off (the class is not there to put back), rotation, and staying-then-leaving (it looks for the unit installed). The title checks hold because the picture is shown whole.
- **A17 no-css:** the script runs (seam, switch point, staying and leaving hold), but the picture stays `contain`: every fill check and rotation fail; class-off holds (contain either way, the class put back).
- **A17 old-switch-point** (the script leaves the landscape start at 4 : 3): the seam (its recorded start and the source list), the switch point, the tablet held sideways and the 1440 × 1000 laptop (each shows the landscape picture where the square one is wanted), and the sideways tablet's title (the landscape picture at that shape with the square picture's focal point crops 25 % of its width and cuts the title's left edge; at 1440 × 1000 the crop is 19 % and the title keeps a 9 px margin).
- **A17 focal-bottom** (square focal point 50 % 100 %): the title checks at 1024 × 768 and 1440 × 1000, as measured in the light checks.

## Counts pinned before full QA

Candidate: G3 7,242 + A09 20 + A10 23 + A10.1 16 + A17 25 = **7,326**; 198 leaves (`candidate-list.json`).
Retained, all of G4 removed (G3 as live): 8b.1-UI-01 32 + 8b.1-UI-02 28 + 8b.1-UI-03 34 + G3's retained 7,075 = **7,169**; 192 leaves (`retained-list.json`). Excludes the same 73 live-site checks as G1's, G2's and G3's retained runs.

The group removal must restore G3 exactly. It runs every kept G4 harness on each singly removed build, the splash layer's harness with A17 removed (its declared conditional the other way), and 8b.1-UI-03 removed with G4 kept. G4 is behaviour tier (focus and startup): the 4× CPU screen and two full passes follow the chain.

## Discovery

Discovery ran once on 12 November 2026, after the predictions were committed and pushed (`711085a7`). Evidence: `variants-discover.log` and `variants-discover-fa634abb/summary.json`. **All 20 cases matched every predicted failed-check id exactly**, each with a complete pinned count: A09 10/20 (baseline and disabled), 13/20, 18/20, 19/20; A10 14/23 (baseline and disabled), 22/23, 20/23, 22/23; A10.1 5/16 (baseline and disabled), 11/16, 15/16, 13/16; A17 11/25 (baseline and disabled), 15/25, 20/25, 23/25. No correction, no second discovery. The qualification chain asserts all 20 pins.
