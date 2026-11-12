# Release 15a · A17 — The Splash Fills the Screen

Group G4, unit 4 of 4. Finding A17 of the Phase 15 audit (FT-41; ruling Q6: fill the splash while keeping the title). The owner approved the mock-up on 12 November 2026 ([G4 mock-ups](<../G4 — Touch, Focus and Startup/MOCKUP.md>)). Built on 12 November 2026 (Claude), on branch `claude/release-15a-a17`, stacked on A10.1.

**Built and light-checked. Not device-checked, not qualified, not live.**

## What changes

- **The splash picture fills the screen** (`cover`), with no paper bands, at every screen shape. Before, it was shown whole (`contain`) on its paper colour: 21 % paper in Safari on a phone, 18 % in landscape, 25 % on a tablet, 19 % in a 1440 × 1000 laptop window.
- **A focal point for each picture**, so the title (L5R, Character Creator) and the scroll with its red seal stay in view: portrait 50 % 45 %, square 50 % 35 %, landscape 45 % 50 %.
- **The square picture is used up to 3 : 2** (it was 4 : 3), so a laptop window near 1440 × 1000 or a tablet held sideways shows the square picture and keeps more of it.
- **Unchanged:** the first paint, the 5-second hold, the tap guard, leaving at ready and on an error. Only the picture's fit and which picture shows change.

## How it is built

- `src/css/1145-splash-fill.css` — the fit and the three focal points. Screen only.
- One block in the splash markup, `splash-fill-art`: a short script inside the `<picture>`, before its `img`, so it runs as the picture is read and the first paint already uses it. It moves the landscape source's start to 3 : 2 and marks the splash `sf15-on`. The switch `SPLASH_FILL_ENABLED` is there.
- One guarded seam block, `splash-fill-seam`.
- The splash layer's harness check `S-ART-BY-SHAPE` is now conditional on this unit (declared; same id and count).

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A17 (this branch; the whole group) | `fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb` | 17,648,272 |
| A17 removed (A10.1) | `3e58e368606f7d8ffe66f674778f922b73c0798109334ad89e1efc2a15fa6258` | 17,645,385 |
| All of G4 removed (G3 as live) | `6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029` | 17,631,957 |

## Light checks (12 November)

| Check, on the final build | Result |
|---|---|
| Own harness `qa/splash-fill-harness.js` (25 checks pinned before the first run: nine screen shapes, each filled and with the title and seal in view; the 3 : 2 switch point; the class off; rotation; staying 5 s then leaving; leaving on an error) | 25/25, first run |
| Own harness on G3 as live (the unit absent) | 11/25: the seam, every fill check, the switch point, the class-off check, rotation and leaving (which also looks for this unit's test seam) fail; the title checks pass there because the picture is shown whole |
| Own harness on a mutant with the square picture's focal point at 50 % 100 % | 23/25: the title checks at 1024 × 768 and 1440 × 1000 fail, so the title checks guard the focal points |
| `qa/test-removal.py` | 10/10 |
| `G4 — Touch, Focus and Startup/qa/test-removal-group.py` | 4/4: the splash layer's remover refuses while A17 is present; all four G4 units come off newest first; the rebuild is G3 as live exactly; no G4 marker left |
| `feature-dependencies.py` (surface `sf15-on`, the seam and the stylesheet's name) | every reference inside this unit's own blocks. With the block's own name as a search term, the checker reads its END line as the splash layer's, because the line hands back to that layer; the remover takes that line away with the block. |
| Own harness with A10.1 removed (A17 kept; `3e3307b4…338d`) | 25/25 |
| A09's, A10's and A10.1's harnesses on this build | 20/20, 23/23, 16/16 (A10.1 revision 1) |
| The splash layer's harness, run directly: on this build, and on G3 as live (its conditional both ways) | 19/19 and 19/19 |
| The touched layers' own harnesses: the suite's service-worker leaf (the splash harness, newest-first, update, installable app and redirect harnesses, 61 checks), A01, A02, Phase 12 (Part K), the carousel on rotation (summary in `G4 — Touch, Focus and Startup/qa/light/a17-summary.json`) | 5/5 harnesses, 150/150 checks |

## Restacked on A10.1 revision 1 (12 November 2026)

G4's code review revised A10.1 (keys typed into a text box no longer mark the keyboard). This branch was rebased onto it; A17's own sources are unchanged. Its remover and removal proof now name A10.1 revision 1 as the predecessor (`3e58e368…6258`, 17,645,385 bytes); the build before the restack was `b832069b…3627` (17,647,484). On the restacked build: own harness 25/25; with A10.1 removed 25/25 (`3e3307b4…338d`, the same as before, as it should be); removal proof 10/10; group removal 4/4; A09, A10, A10.1 20/20, 23/23, 16/16; the touched layers 149/150 on the first run, then the splash harness alone 19/19 on this build and on G3 as live.

**The one failure, `S-FADES-AFTER-READY-AND-5S` (the splash layer's own timing check), is a load effect, not A17:** it failed in the same run on G3 as live too, which has no G4 code, while the owner's own Chrome had opened new windows during the run; run again a few minutes later it passed 19/19 on both. It measures a 250–1,500 ms fade after the splash's 5 s hold, so a busy machine can push it over. For qualification, run the full passes with other browsers closed.

See [ROLLBACK.md](ROLLBACK.md).
