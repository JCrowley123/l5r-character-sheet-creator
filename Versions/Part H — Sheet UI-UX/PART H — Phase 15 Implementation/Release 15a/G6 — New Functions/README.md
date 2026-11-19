# Release 15a · G6 — New Functions

The last group of Release 15a: two independently removable units, approved as mocked up on 19 November 2026 ([MOCKUP.md](MOCKUP.md); how today was reproduced: [REPRODUCTION.md](REPRODUCTION.md)). Built on 19 November 2026 (Claude) on stacked branches from the group's records branch `claude/release-15a-g6` (from `main` at `1ebf26b4`, A08 live), on the owner's word: "start the G6 build, A19 first".

| Unit | Branch | Build | Marker |
|---|---|---|---|
| [A19 — Undo the Last Void Spend](<../A19 — Undo the Last Void Spend/README.md>) | `claude/release-15a-a19` | `0ee22867…5dc9`, 17,701,397 bytes | `PART H PHASE 15.1.33` |
| [A20 — A Trait for One Skill Roll](<../A20 — A Trait for One Skill Roll/README.md>) | `claude/release-15a-a20` (on A19) | `8d6a0a0a…a4eb`, 17,714,794 bytes | `PART H PHASE 15.1.34` |

Each unit has its own folder, switch, fragments, harness, remover, removal proof and removal-chain entry, and its own Accept / Revise / Remove at the device round. Both change rolls or undo, so the group is qualified at behaviour tier after the owner's acceptance: the 4× CPU screen, then two full passes, both first time.

## Group tools (`qa/`)

- `light-run.cjs` — the light checks: harnesses from G5's frozen candidate list (G6's starting suite) whose path matches a pattern, one at a time, against one build. Logs in `light/`.
- `dependencies.py` — Phase 0's dependency check for each unit (run from the Phase 0 folder).
- `verify-preview.py` — a branch preview against its committed build, file by file, then the units' harnesses and the touched layers' harnesses on the deployed page. Results in `hosted-preview/`.
- `code-review.md` — the read-only review of the group's diff, before the device round.
- `mockup/` — how the mock-ups were made.

## Status

- **19 November 2026: both units built and light-checked; the device round is with the owner.** A19: own harness 22/22, removal 10/10, dependencies clean, touched layers 26/26 (1,226 checks), preview verified (27/27 harnesses, 1,248 checks on the deployed page). A20: own harness 18/18, removal 10/10, dependencies clean, touched layers 33/33 (1,606 checks), preview verified (52/52 harnesses, 2,547 checks on the deployed page, A19 and A20 together). Details in each unit's README; the review in `qa/code-review.md`.
- **Device round:** [G6 Device Round Checklist](https://claude.ai/artifact/3XbGrSnc5z1T9uM2KUwtbz), mirrored in [DEVICE-CHECKS.md](DEVICE-CHECKS.md). Accept / Revise / Remove for each unit.
- **Planned qualification counts** (behaviour tier, after acceptance): candidate = G5's 7,401 + A19's 22 + A20's 18 = 7,441; retained (G6 removed = A08 as live) 7,307, as G5's.
- Nothing is qualified or live. Go-live only on the owner's word: fast-forward `main` to the qualified tip, no merge commit or force.
