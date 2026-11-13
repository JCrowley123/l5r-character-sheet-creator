# Release 15a G4 — Touch, Focus and Startup — handover

12 November 2026 (Claude). **Accepted, qualified and live** (13 November).

**12 November 2026 · G4 qualified (Claude).** A09 (editable boxes at 16 px on phones and touch screens; buttons take a quick second tap as a press, not a zoom), A10 (the Advanced Schools hint and button in one row; a cross-page button moves focus to the heading of what it opened), A10.1 revision 1 (the page's gold focus ring only for the keyboard; keys typed into a text box do not count) and A17 (the splash picture fills the screen with the title and seal in view; the square picture up to 3 : 2) are on `claude/release-15a-a17`. Application `fa634abbf96a0f47b8668245c13f0d33142c931438bc1c9d8c22c624ce4e00cb`, 17,648,272 bytes. A18 (the first Manage tap on an iPhone) is closed as not reproduced: the owner's first tap is quick, and the test browser measured 45–62 ms, no slower than the second.

Negative variants: twenty cases predicted and pushed before discovery; all twenty matched exactly at the first discovery. The chain passed first time: group removal 32/32 (all of G4 removed restores G3 `6c555d29…c029` exactly), all 20 variants on their exact pins, dependencies 4/4, the 4× CPU screen 137/137 leaves (78 minutes). Two full passes, each on its first execution: candidate **7,326/7,326** and retained **7,169/7,169** (run 1: 25.25 and 22.26 minutes; run 2: 25.06 and 22.27 minutes). The code review found one defect, fixed as A10.1 revision 1.

## Units

| Unit | Marker | Tag / switch | Own checks | Branch |
|---|---|---|---:|---|
| A09 Phone text entry and repeated taps | `PART H PHASE 15.1.24` | `TX15` / `PHONE_TEXT_ENTRY_ENABLED` | 20 | `claude/release-15a-a09` |
| A10 Cross-page actions move focus | `PART H PHASE 15.1.25` | `CP15` / `CROSS_PAGE_FOCUS_ENABLED` | 23 | `claude/release-15a-a10` |
| A10.1 The page ring only for the keyboard, revision 1 | `PART H PHASE 15.1.26` | `KR15` / `KEYBOARD_PAGE_RING_ENABLED` | 16 | `claude/release-15a-a10.1` |
| A17 The splash fills the screen | `PART H PHASE 15.1.27` | `SF15` / `SPLASH_FILL_ENABLED` (in its markup block) | 25 | `claude/release-15a-a17` (the group tip) |

Each unit's folder has its README (what changed, builds, light checks, every failure found and fixed), ROLLBACK, harness with pinned ids, remover and removal proof. All four are registered in the removal chain after 8b.1-UI-03. A17 sits inside the splash layer's design block and makes that layer's `S-ART-BY-SHAPE` a declared conditional (both ROLLBACK files).

## Where the evidence is

- Approvals: [MOCKUP.md](MOCKUP.md) (the owner's "I am happy with the recommendations suggested", 12 November); reproduction: [REPRODUCTION.md](REPRODUCTION.md).
- Code review: [qa/code-review.md](qa/code-review.md). Previews on their deployed files: `qa/hosted-preview/` (A09 229, A10 252, A10.1 268, A17 293).
- Device round: [DEVICE-CHECKS.md](DEVICE-CHECKS.md), mirroring the Claude Doc https://claude.ai/artifact/4Wv4DVtZfmKfX9VQGbuFgW. All four accepted; check 4's expectation (double-tap zoom on text) was wrong: the live app does not do it either.
- Qualification: [qa/VARIANT-PINS.md](qa/VARIANT-PINS.md) (predictions and the one discovery), `qa/qualification-fa634abb.json` and its four stage logs, `qa/under-load-final-fa634abb/results.json`, `qa/final-run-1/summary.json`, `qa/final-run-2/summary.json`, `qa/run-final-twice.log`. The first launch of the two passes was refused before it started because the laptop was on battery (`qa/run-final-twice-refused-on-battery.log`); nothing had run.
- Counts: candidate G3 7,242 + 20 + 23 + 16 + 25 = 7,326 (198 leaves); retained, G4 removed, 94 + 7,075 = 7,169 (192 leaves), excluding the same 73 live-site checks as before.

## Environment notes

- Built in the worktree `C:/Users/jcrow/l5r-release-15a-g4` so the shared checkout kept its branch.
- The splash layer's `S-FADES-AFTER-READY-AND-5S` (a 250–1,500 ms fade) failed once during a light check while the owner's Chrome was busy, on G3 as live as well, and passed when run again. The qualification ran with Chrome and Edge open at the owner's word and passed throughout.
- A Cloudflare Pages build of one pushed commit failed once at 14:18 UTC; the next push deployed. Verify a preview's bytes before a device round.

## Next, as agreed with the owner

**12 November 2026 · after G4 (Claude).** (1) G4 go-live on the owner's word: fast-forward `main` to the G4 tip, then production verification (G3's `verify-live.py`, constants changed) and the browser/offline smoke. (2) The automatic-entries group, mock-up first: Yogo Wardmaster's missing Sense, the School's given spells credited on import and said in the character check, and no XP box or remove button on School, Path and Advanced School Techniques ([G3's owner comments](<../G3 — Spell Rows/OWNER-COMMENTS-2026-11-11.md>)).

## Usage

Claude readings on a Pro plan, 12 November: weekly all models 53% at the start, 60% after the build, 69% before qualification, 75% after the two passes (Fable 84% throughout); the five-hour limit was reached once, before the code review.

## Production

**13 November 2026 · G4 live (Claude).** On the owner's instruction ("Go live"), `main` was fast-forwarded to `e6dc3248` without a merge commit or force. Production: all seven deployed files match the qualified build; 74 application harnesses passed 3,091/3,091 on the downloaded production files (G4's four units and the layers they touch, the splash layer's harness among them); browser/offline smoke 22/22. Deployed page `de2ea7d4f0910f68…`, 17,655,049 bytes; application `fa634abb…00cb`; service worker build `dac892eac0085111`.

Evidence: [qa/live/live-verification.json](qa/live/live-verification.json), [qa/live/live-qa.log](qa/live/live-qa.log), [qa/live/live-browser-smoke.json](qa/live/live-browser-smoke.json), `qa/verify-live.log`, `qa/browser-smoke.log`. The checks ran on the downloaded production files with G3's `verify-live.py` (G4's units added) and the Older School Choices browser smoke.
