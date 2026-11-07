# Release 15a · A05 — Missing Limb's Picker

Group G2, unit 1 of 5. This is audit finding A05 (FT-12), ruled under Q1, and approved as mocked up on 7 November 2026 ([G2 mock-ups](<../G2 — Small Layout Fixes/MOCKUP.md>)). Built on 7 November 2026 (Claude), on branch `claude/release-15a-a05`, stacked on A03.1 (G1 as live).

## What changes

Missing Limb's row is drawn by Phase 4.5.31 (Part I). Its select was 25 px tall, in the browser's own Arial, inside a small "MISSING" label, with the note running on beside it on a laptop. The select now reads as a shared field:

- **Native select kept,** as ruled: a short fixed list needs no custom menu. Same options, saved value and screen-reader name ("Which limb is missing").
- **The field label above it,** "Missing limb", in the sheet's shared label style.
- **The field's own look:** EB Garamond 1 rem, 7 × 9 px padding, the field border, radius and background. Measured equal to Identity's Other Insight Bonus field.
- **44 px touch height.**
- **The note below it,** with the shared 6 px helper gap and a 1.5 line height.

Play and Manage look the same; in Play the select stays disabled, as Phase 4.5.31 has it. The other condition rows (Lost Love, Contrary and the rest) are not touched.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A05 (this branch) | `dde68b5c366e15be9bf4185726bdaf4fefe92a90f5525f28d5291c1dd57ea726` | 17,591,617 |
| A05 removed (A03.1, G1 as live) | `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6` | 17,586,964 |

## Light checks (7 November)

| Check | Result |
|---|---|
| Own harness `qa/limb-picker-harness.js` (22 checks, pinned before the first run) | 22/22 |
| Own harness with A03.1 removed and A05 kept | 22/22 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside A05's own blocks |
| Phase 4.5.31 (Part I), checks and conditions (owns the row) | 101/101 |
| Phase 12.5 (Part K), Advantages and Disadvantages in Play | 212/212 |

Phase 4.5.32's (Part I) `checklist-walk.js` gives 31/32 both with A05 and on G1 as live (`2dcf6f20…`). Its C8 fails the same way on both, because a "Resisting Intimidation" tick it does not expect is offered. So the failure predates A05, and that walk is not a suite harness. It is recorded here and left alone.

Qualification follows the owner's review. See [ROLLBACK.md](ROLLBACK.md).
