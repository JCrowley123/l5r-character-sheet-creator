# G4 — Touch, Focus and Startup

## Current state (12 November 2026, Claude)

**All four units built and light-checked; code review done (one fix, A10.1 revision 1); previews not yet verified; not device-checked. Not qualified, not live.** G3 is live (`main` `5d14ebe3`, application `6c555d29…c029`, 17,631,957 bytes).

- **Kickoff:** [G3 — Spell Rows/KICKOFF-15A-G4.md](<../G3 — Spell Rows/KICKOFF-15A-G4.md>). Ordering question answered 12 November: **G4 now**, the automatic-entries group after.
- **Reproduction:** [REPRODUCTION.md](REPRODUCTION.md). **Mock-ups and the owner's decision:** [MOCKUP.md](MOCKUP.md) — "I am happy with the recommendations suggested" (all five as recommended).
- **Units and branches** (stacked; each pushed, so each has a Cloudflare preview at `https://<branch with / and . as ->.l5r-character-sheet-creator.pages.dev/`):

| Unit | Marker · tag | Branch · commit | Build | Own harness |
|---|---|---|---|---|
| Records | — | `claude/release-15a-g4` · `e898c336` | G3 as live | — |
| [A09 — Phone Text Entry and Repeated Taps](<../A09 — Phone Text Entry and Repeated Taps/README.md>) | 15.1.24 · TX15 | `claude/release-15a-a09` · `7d4b3d21` | `0fb2a08a…914d`, 17,635,271 | 20 |
| [A10 — Cross-Page Actions Move Focus](<../A10 — Cross-Page Actions Move Focus/README.md>) | 15.1.25 · CP15 | `claude/release-15a-a10` · `e9707bd6` | `c872c1b3…f16f`, 17,640,999 | 23 |
| [A10.1 — The Page Ring Only for the Keyboard](<../A10.1 — The Page Ring Only for the Keyboard/README.md>), revision 1 | 15.1.26 · KR15 | `claude/release-15a-a10.1` · `a93023b6` | `3e58e368…6258`, 17,645,385 | 16 |
| [A17 — The Splash Fills the Screen](<../A17 — The Splash Fills the Screen/README.md>) | 15.1.27 · SF15 | `claude/release-15a-a17` · this branch (restacked on A10.1 revision 1) | `fa634abb…00cb`, 17,648,272 | 25 |

- **A18:** nothing built. The owner's step 1 is to tap Manage on the live app on the iPhone and say whether the first tap is still slow; only if it is, a throwaway timing preview follows.
- **Light checks:** each unit's own harness (pinned before its first run, and shown to fail without the unit), its removal proof (10/10 each), `feature-dependencies.py`, each other G4 unit's harness on every later build, each unit's harness with its predecessor removed, and its touched layers' harnesses (A09 1,422 checks, A10 757, A10.1 391, A17 150; summaries in `qa/light/`). Whole-G4 removal through the chain gives G3 as live exactly (`qa/test-removal-group.py`, 4/4). Tools: `qa/light-run.cjs`, `qa/test-removal-group.py`.
- **Declared conditional:** the splash layer's `S-ART-BY-SHAPE` expects `cover` with A17 and `contain` without (19/19 both ways).
- **Built in the worktree** `C:/Users/jcrow/l5r-release-15a-g4`, so the shared checkout keeps its branch.
- **Usage, 12 November:** about 09:30 UTC 5-hour 23 %, weekly 53 % all models / 84 % Fable; after the build about 12:15 UTC 5-hour 74 %, weekly 60 % / 84 %. Resets 18 November 01:00 UTC.

- **Code review:** [qa/code-review.md](qa/code-review.md). One medium finding, fixed (A10.1 revision 1, two checks added); one low finding in A10 recorded, not changed; A09 and A17 none.
- **Load note:** the splash layer's `S-FADES-AFTER-READY-AND-5S` failed once on both A17 and G3 as live while the owner's own Chrome was busy, and passed 19/19 on both when run again. Run the full passes with other browsers closed.

**Next, in order:** verify each preview's deployed files (G3's `verify-preview.py`, constants changed); the owner's device checklist as a Claude Doc (Pass/Fail per device, Accept/Revise/Remove per unit) with a repository mirror, including A09's three iPhone cases on Safari **and** the installed app, and A18 step 1. Then qualification of the accepted units: variants pinned before discovery, the chain, the 4× CPU screen, **two** full passes. **Counts if all four are accepted:** candidate 7,242 + 20 + 23 + 16 + 25 = **7,326** (no older harness changes its count; `S-ART-BY-SHAPE` keeps its id); retained **7,169**.
