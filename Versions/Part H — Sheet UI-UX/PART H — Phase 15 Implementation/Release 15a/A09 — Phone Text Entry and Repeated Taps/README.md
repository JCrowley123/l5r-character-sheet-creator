# Release 15a · A09 — Phone Text Entry and Repeated Taps

Group G4, unit 1 of 4. Finding A09 of the Phase 15 audit (FT-49, the owner's iPhone zoom reports of 28 October). The owner approved the mock-up on 12 November 2026 ([G4 mock-ups](<../G4 — Touch, Focus and Startup/MOCKUP.md>)). Built on 12 November 2026 (Claude), on branch `claude/release-15a-a09`, stacked on the G4 records branch.

**Accepted by the owner at G4's device round, 12 November 2026** ([DEVICE-CHECKS.md](<../G4 — Touch, Focus and Startup/DEVICE-CHECKS.md>)). Not qualified, not live. Check 4 (double-tap zoom on text) failed because its expectation was wrong: double-tap does not zoom there on the live app either; the owner accepted A09 as built.

## What changes

On phones and touch screens (up to 768 px wide, or a touch screen without hover, as the carousel's own touch rules):

- **Every editable box is at least 16 px.** Text, number and search boxes, text areas and pickers. Before, 34 kinds were 13.3 to 15.7 px: Honour, Glory, Status and Taint Rank and Points (14 px), the Water mastery picker (13.3 px), Skill name, Trait, Rank and Emphasis (14.1 to 14.7 px), Equipment and Weapon rows (14.7 px), Advantage, Disadvantage and Technique descriptions (14.4 px), the Advanced School picker (14.7 px), the Background boxes (15.7 px). iPhone Safari zooms in on a tap in any box under 16 px. The five Ring boxes (20.8 px) keep their size; no box gets smaller.
- **Buttons answer a quick second tap.** `touch-action: manipulation` on buttons only (127 on one page), so a quick double press on − / + is two presses, not a zoom.
- **Kept:** pinch zoom everywhere; double-tap zoom on text, empty space, boxes and labels; the viewport as shipped (`width=device-width, initial-scale=1.0`, never forced back). A laptop with a mouse is unchanged.

The three reports and what each change does are on the mock-up board. Chromium cannot show Safari's zoom, so **FT-49 is fixed only after the owner's device check** on Safari and the installed app, all three cases.

## How it is built

- `src/sheet/209.999999999999999992-feat-phone-text-entry.js` — `TX15` and the switch `PHONE_TEXT_ENTRY_ENABLED`. It only sets the `tx15-on` body class.
- `src/css/1142-phone-text-entry.css` — two rules in one phone-and-touch media query. Screen only.
- One guarded seam block, `phone-text-entry-seam`.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A09 (this branch) | `0fb2a08ab6c80e94800b72a45f4796ca6e8279b7d12ac07a800f5aa2e7c7914d` | 17,635,271 |
| A09 removed (G3 as live) | `6c555d29b35ca5f550274163cc73f9b6b47a11f3065cfbc4d2ac9bdaab38c029` | 17,631,957 |

## Light checks (12 November)

| Check | Result |
|---|---|
| Own harness `qa/phone-text-entry-harness.js` (20 checks pinned before the first run; phone, a touch tablet at 1024 × 768, a laptop) | 20/20 |
| Own harness on G3 as live (the unit absent) | 10/20: the seam, every 16 px check, the class-off check, the button checks and Play fail, as they should |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside this unit's own blocks |
| The touched layers' own harnesses: every Release 15a unit (A01–A16, 8b.1-UI-01–03), Phase 12–12.8 (Part K) Play mode, Phase 4.7 and 4.7.1 (Part I) Advanced Schools, and the Advanced Schools pointer and button, characteristic card editing and compact controls, Manage button, Search and app-bar focus, and carousel fixes (`G4 — Touch, Focus and Startup/qa/light-run.cjs`; summary in `qa/light/a09-summary.json` there) | 36/36 harnesses, 1,422/1,422 checks |

**What the checks found.** The first runs gave 20/20 on the candidate and 11/20 on G3. The Play check passed on G3, which it should not: after the stepper check, focus stayed on the Identity page, so that page stayed live and the harness's page lookup (`.car-page:not([inert])`) kept returning it. Play was measuring Identity ten times. A harness fault, fixed before any result was used: the page on screen is now the carousel's own active page. Same ids and count. Candidate 20/20; G3 10/20, Play now failing.

See [ROLLBACK.md](ROLLBACK.md).
