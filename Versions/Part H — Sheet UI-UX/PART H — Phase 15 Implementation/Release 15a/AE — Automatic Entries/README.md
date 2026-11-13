# Release 15a · the automatic-entries group

The owner's rule of 11 November 2026: what the rules give a character automatically is not a choice, so it gets no review, no XP box and no remove button, and a character should be functional when it is opened. Three units, mocked up and approved on 13 November 2026 ([MOCKUP.md](MOCKUP.md); reproduction on G4 as live: [REPRODUCTION.md](REPRODUCTION.md)). This folder holds the group's shared records only; each unit has its own folder.

Built on 13 November 2026 (Claude) in the worktree `C:/Users/jcrow/l5r-release-15a-g5`, from `main` at `60a5262a` (G4 as live). Not yet code-reviewed, device-checked, qualified or live.

**Light checks on the tip:** every harness in G4's candidate list passes on AE3 (198 harnesses, 7,326 checks, after the two declared conditionals), plus the three units' own harnesses (13 + 16 + 20).

**Code review:** [qa/code-review.md](qa/code-review.md), 13 November 2026. One finding (AE3 re-measured the cards on every tap and key), fixed as AE3 revision 1.

**Previews on their deployed files** (`qa/hosted-preview/`): AE1 377/377, AE2 393/393, AE3 (revision 1) 413/413.

**Device round:** the Claude Doc [Automatic entries device checks](https://claude.ai/artifact/MSCwtNQk4adKdxV6DBxxhn); mirror [DEVICE-CHECKS.md](DEVICE-CHECKS.md). Results not yet in.

## Units

| Unit | Marker | Tag / switch | Own checks | Tier | Branch | Build |
|---|---|---|---:|---|---|---|
| [AE1 Sense for the Yogo Wardmaster](<../AE1 — Sense for the Yogo Wardmaster/README.md>) | `PART H PHASE 15.1.28` | `YG15` / `YOGO_GIVEN_SPELLS_ENABLED` | 13 | Behaviour | `claude/release-15a-ae1` | `2c21296b…f17a`, 17,651,074 |
| [AE2 Given Spells Credited on Opening](<../AE2 — Given Spells Credited on Opening/README.md>) | `PART H PHASE 15.1.29` | `GS15` / `GIVEN_SPELLS_ON_OPENING_ENABLED` | 16 | Behaviour | `claude/release-15a-ae2` | `ab562fd1…5715`, 17,660,953 |
| [AE3 No XP Box or Remove on Automatic Entries](<../AE3 — No XP Box or Remove on Automatic Entries/README.md>) | `PART H PHASE 15.1.30` | `AX15` / `AUTOMATIC_ENTRY_CONTROLS_ENABLED` | 20 | Screen-only | `claude/release-15a-ae3` (the tip) | `3217c551…9b12`, 17,671,933 (revision 1) |

The records branch `claude/release-15a-ae` (the approval) sits under AE1. All three are registered in the removal chain after A17. All of the group removed is G4 as live: `fa634abb…00cb`, 17,648,272 bytes.

## Declared changes to other layers' tests

- Phase 11.2.4 (Part K) `wizard5-harness.js` reads AE1's corrected lines when AE1 is in the build (AE1's ROLLBACK).
- Six harnesses pause AE2 when it is in the build, so they keep checking their own layer as it works without AE2: 8b.1-UI-01, UI-02 and UI-03, Older School Choices `older-review-harness.js`, Phase 11.2.5 (Part K) `review-regression-harness.js`, Clan and School Pickers Follow the Character `cfs-sync-harness.js` (AE2's README).
- 8b.1-UI-03's harness also takes AE3's body class away for its page (AE3's README).

Same ids and counts throughout.

## Counts for the qualification

Candidate: G4's 7,326 + 13 + 16 + 20 = **7,375**. Retained (all of the group removed = G4 as live): 7,326 − 73 live-site checks = **7,253**. Behaviour tier (AE1, AE2): the 4× CPU screen and two full passes, both first time.

## Light-check tooling

`qa/light-run.cjs` is G4's runner reading G4's frozen candidate list. Logs: `qa/light/`.
