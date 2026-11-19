# Release 15a · G6 — New Functions

The last group of Release 15a: three independently removable units. A19 and A20 were approved as mocked up on 19 November 2026 ([MOCKUP.md](MOCKUP.md); how today was reproduced: [REPRODUCTION.md](REPRODUCTION.md)). Built on 19 November 2026 (Claude) on stacked branches from the group's records branch `claude/release-15a-g6` (from `main` at `1ebf26b4`, A08 live), on the owner's word: "start the G6 build, A19 first". After the first device round the owner kept Undo through Touch of the Void's save (A19 revision 1) and added A19.1, the damage row on a phone ([MOCKUP-A19.1.md](MOCKUP-A19.1.md), approved as shown).

| Unit | Branch | Build | Marker |
|---|---|---|---|
| [A19 — Undo the Last Void Spend](<../A19 — Undo the Last Void Spend/README.md>) (revision 1) | `claude/release-15a-a19` | `bd035d20…8f8d`, 17,702,871 bytes | `PART H PHASE 15.1.33` |
| [A20 — A Trait for One Skill Roll](<../A20 — A Trait for One Skill Roll/README.md>) | `claude/release-15a-a20` (on A19) | `fe8422cd…b75f`, 17,716,268 bytes | `PART H PHASE 15.1.34` |
| [A19.1 — The Damage Row Fits a Phone](<../A19.1 — The Damage Row Fits a Phone/README.md>) | `claude/release-15a-a19-1` (on A20; the group tip) | `921f3ac9…6150`, 17,718,601 bytes | `PART H PHASE 15.1.35` |

Each unit has its own folder, switch, fragments, harness, remover, removal proof and removal-chain entry, and had its own Accept / Revise / Remove at the device round. A19 and A20 change rolls or undo, so the group is qualified at behaviour tier: the 4× CPU screen, then two full passes, both first time.

## Group tools (`qa/`)

- `light-run.cjs` — the light checks: harnesses from G5's frozen candidate list (G6's starting suite) whose path matches a pattern, one at a time, against one build. Logs in `light/`.
- `dependencies.py` — Phase 0's dependency check for each unit (run from the Phase 0 folder).
- `verify-preview.py` — a branch preview against its committed build, file by file, then the units' harnesses and the touched layers' harnesses on the deployed page. Results in `hosted-preview/`.
- `code-review.md` — the read-only review of the group's diff, before the device round.
- `mockup/`, `mockup-a19.1/` — how the mock-ups were made.
- Qualification (G5's scripts with G6's constants; each says so in its header): `VARIANT-PINS.md` and `variants.json` (3 baselines, 6 mutations), `test-removal-group.py` (16 checks), `verify-variants.py`, `run-under-load.py` (170 leaves), `qualify-before-full.py`, `run-final-twice.py` → `final-qa.py`, `verify-live.py`.

## Status

- **Built and light-checked, 19 November 2026.** A19 revision 1: own harness 25/25, removal 10/10, touched layers 26/26 (1,226 checks). A20: 18/18, removal 10/10, touched layers 33/33 (1,606). A19.1: 9/9 (4/9 on the live app), removal 10/10, touched layers 10/10 (284). Previews verified on their deployed pages: A19 revision 1 2,532/2,532, A20 on it 2,550/2,550, A19.1 2,559/2,559. Details in each unit's README; the review in `qa/code-review.md`.
- **Device rounds:** [G6 Device Round Checklist](https://claude.ai/artifact/3XbGrSnc5z1T9uM2KUwtbz), mirrored in [DEVICE-CHECKS.md](DEVICE-CHECKS.md). Round 1: A20 accepted, A19 revise (check 8: Touch of the Void's save ended Undo). Round 2: A19 revision 1 and A19.1 accepted, all five checks passing on iPhone and laptop. All three units accepted; the owner, verbatim: "I have now done the tests they all pass I am happy for this to move to the go live".
- **Qualified, 19 November 2026, every stage first time** (frozen candidate `921f3ac9…6150`, 17,718,601 bytes):
  - Variant predictions pushed before any run (`30067683`); discovery matched all 9 pins first time (`6639136b`).
  - The chain ran once, 12:49 to 14:12 UTC (`qa/qualification-921f3ac9.json`, `89f7e30d`): group removal **16/16** (all three removed restores G5, A08, as live exactly: `6d47849b…44b1`, 17,685,928 bytes); all **9** variants on their pins; dependencies **3/3**; the 4× CPU screen **170/170 leaves**.
  - Two full passes, each first time, 14:13 to 16:04 UTC (`qa/full-launch.log`): candidate **7,453/7,453** and retained **7,328/7,328** in both runs (run 1: 29.10 and 26.10 minutes; run 2: 29.15 and 25.89 minutes). Both restored A08 as live exactly and the scratch build matched the frozen source (`qa/final-run-1/summary.json`, `qa/final-run-2/summary.json`).
  - Counts: candidate = G5's 7,401 + A19 25 + A20 18 + A19.1 9 = 7,453 (205 leaves); retained, G6 removed = A08's 21 + G5's retained 7,307 = 7,328 (200 leaves).
- **Live, 19 November 2026.** On the owner's word ("I have now done the tests they all pass I am happy for this to move to the go live"), `main` was fast-forwarded to `c359fa3a` (no merge commit, no force). Production checks: all seven files match, 118 harnesses 4,930/4,930 on the downloaded production files, browser/offline smoke 22/22 ([HANDOVER.md](HANDOVER.md), `qa/live/`). Release 15a is complete.
