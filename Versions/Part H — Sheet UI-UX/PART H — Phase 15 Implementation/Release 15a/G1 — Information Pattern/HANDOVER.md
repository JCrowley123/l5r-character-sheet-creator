# Release 15a · G1 — Information Pattern · handover

7 November 2026 (Claude). **Accepted by the owner and qualified. Waiting for the go-live word.** Nothing is merged to `main`.

## Contents

| Unit | Marker | Branch (stacked) | Build | Records |
|---|---|---|---|---|
| A04 One information pattern | `PART H PHASE 15.1.4` | `claude/release-15a-a04` | `bc4ba311…e0c9` | [README](<../A04 — One Information Pattern/README.md>) · [ROLLBACK](<../A04 — One Information Pattern/ROLLBACK.md>) |
| A15 Court badges in the Clan colour | `PART H PHASE 15.1.15` | `claude/release-15a-a15` | `2ba7e6df…c0e0` | [README](<../A15 — Court Badges/README.md>) · [ROLLBACK](<../A15 — Court Badges/ROLLBACK.md>) |
| A16 No bottom i in the seven pickers | `PART H PHASE 15.1.16` | `claude/release-15a-a16` | `f64b6e37…58ef` | [README](<../A16 — No Bottom i in the Seven Pickers/README.md>) · [ROLLBACK](<../A16 — No Bottom i in the Seven Pickers/ROLLBACK.md>) |
| A03.1 Masteries in the Skill information | `PART H PHASE 15.1.3.1` | `claude/release-15a-a03.1` (group tip, with these records) | `2dcf6f20…6af6`, 17,586,964 bytes | [README](<../A03.1 — Masteries in the Skill Information/README.md>) · [ROLLBACK](<../A03.1 — Masteries in the Skill Information/ROLLBACK.md>) |

- **Owner decisions:** A03.1 was the owner's idea from A03, added to the group on 6 November. A15's design (tap to fill, in the Clan colour) is also the owner's. Mock-ups and their three rounds: [MOCKUP.md](MOCKUP.md).
- **Two older harnesses carry declared conditional fixtures,** recorded in each unit's ROLLBACK and in theirs:
  - Phase 4.5.14's, for A15 and A16;
  - Phase 12.5's, for A15.

## What was done

1. **Reproduction and mock-ups.** Approved after the owner's two rounds of changes. See [MOCKUP.md](MOCKUP.md).
2. **The build.** Four removable units, each with its own light checks.
3. **One read-only review of the whole diff.** It found no blocking defect. All eight findings were fixed, and the branches restacked. See [qa/code-review.md](qa/code-review.md).
4. **Previews.** Each preview matched its branch's build byte for byte and passed on the deployed files: A04 973/973, A15 1,260/1,260, A16 1,742/1,742, A03.1 1,799/1,799 (`qa/hosted-preview/`).
5. **The owner's review.** The [G1 device checks](https://claude.ai/artifact/BFg3Gg19jUM9EJEshc2T2i) passed 36/36 on iPhone Safari and Laptop Edge. All four units were **accepted** on 7 November; the mirror is [DEVICE-CHECKS.md](DEVICE-CHECKS.md).
6. **Qualification** (screen-only tier, candidate frozen at `2dcf6f20…6af6`):
   - **Negative variants:** 21 mutations and 4 baselines, pinned before any run, with one discovery and a second discovery after two harness-hygiene fixes. All 25 match their pins. See [qa/VARIANT-PINS.md](qa/VARIANT-PINS.md).
   - **Qualification chain** (`qa/qualification-2dcf6f20.json`):
     - group removal 34/34. The whole group removed rebuilds A03 `e73b7c0c…de06` exactly; each unit removed alone keeps the others working (their harnesses run in full); A03.1 removed alone rebuilds A16 exactly; A03 removed keeps all of G1;
     - variants-final, all as pinned;
     - dependencies 4/4.
   - **One full pass, first time:** candidate **7,002/7,002** (6,865 + 137), the group removed to A03 exactly, retained **6,792/6,792** (`qa/final-run-1/summary.json`; 28 + about 25 minutes).
   - **Not run:** the 4× CPU screen, because no unit adds timing or animation.
   - **No retries:** nothing was re-run or widened.

## Go-live (on the owner's word only)

1. Fast-forward `main` to `claude/release-15a-a03.1`: no merge commit, no force.
2. Then run `python -B qa/verify-live.py` (no `--url`) against production. Use `NODE_PATH=C:/Users/jcrow/l5r-qa-tools/node_modules`: this Python cannot see npm's AppData\Roaming copy (found 7 November).
3. Then run `live-browser-smoke.cjs <qa/live>`, as A03 did.
4. Never commit `candidate-leaves/`, `retained-leaves/` or `local/site/`.

## Added to later work by the owner (7 November)

- **A11 (G2), the owner's comment 1:** text on Advantage cards does not line up. In Play a description box keeps its inner padding, so it starts 10 px right of the line above it. This was measured the same on the live app and on G1. A11 first reads the whole app for similar cases.
- **A new G2 unit, the owner's comment 2:** one way to show choices in pickers.
  - Show each option's rule in full inline, as Paragon and Dark Paragon already do, replacing Seven Fortunes' Blessing's "▶ Rule" disclosures and the i on each option in the other pickers.
  - The row's i keeps the text after choosing.
  - Mock-up first. About 3–5 weekly points.
- **FT-59 (parked):** a mon and a colour theme for every Clan, in the work order, roadmap and ledger.

## Usage (Claude, account-wide, five-hour / weekly)

| When (UTC) | Five-hour | Weekly | Point |
|---|---|---|---|
| 6 Nov 17:37 | 32% | 62% | G1 start |
| 7 Nov 03:06 | 94% | 76% | owner's review |
| 7 Nov 07:15 | 32% | 81% | before qualification |
| 7 Nov 08:11 | 34% | 81% | end |

G1 used about **19 weekly points**, against an estimate of 10–15 for three units: four were built, and the mock-ups took three rounds. The variant runs and the full pass ran on the machine, not on the allowance.

## Next

- **The owner's go-live word** for G1.
- **Then G2:** A05, A06, A07, A11 (with comment 1), and the picker unit (comment 2). It needs its own kickoff.
