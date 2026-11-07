# Release 15a · A16 — No Bottom i in the Seven Pickers

Group G1, unit 3 of 4. Built 7 November 2026 (Claude) on branch `claude/release-15a-a16`, stacked on A15.

The ruling is Q3 (1 November): "remove only the redundant bottom i in the seven legacy pickers". Option 1 was approved on 6 November; see the [G1 mock-ups](<../G1 — Information Pattern/MOCKUP.md>).

## What changes

Seven Advantage pickers used to end their configuration window with an information button of their own:

- A01 Seven Fortunes' Blessing
- A03 Dark Paragon
- A04 Darling of the Court
- A09 Paragon
- A12 Soul of Artistry
- A13 Touch of the Spirit Realms
- A14 Void Versatility

These are the pickers the 24 September device pass named in S1/S2. That button is now gone from the window. Two things were measured before removing it:

- **While choosing:** each window's own note already states the rule.
- **After Confirm:** the row's i opens every sentence the bottom button held.

So nothing is lost. A16's harness measures this again on every run, picker by picker, on a phone and a laptop. Every sentence of the bottom panel must appear on the row or behind its i.

The row's i, every other picker, and every other information button are unchanged. The pickers' own code is not edited: the button is removed as it is drawn.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A04, A15 and A16 (this branch) | `f64b6e375665d9e7175a98d70829b8c9afb09646261ddc3574eaae1ff01258ef` | 17,580,502 |
| A16 removed (A15) | `2ba7e6dfe0385f6be499452a0f0ba68aea6b40a29482a214ea2212eb2466c0e0` | 17,576,326 |

## Light checks (7 November)

| Check | Result |
|---|---|
| Own harness `qa/picker-info-harness.js` (pinned before the first run) | 50/50, and 50/50 on the A15-removed build |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside A16's own blocks |
| The seven pickers' own harnesses: 4.5.21, 4.5.23, 4.5.14 (with its declared conditional check), 4.5.18, 4.5.19, 4.5.24, 4.5.20 | 77/77, 67/67, 225/225, 80/80, 92/92, 50/50, 66/66 |
| Phase 4.54 (Part I) | 28/28 |
| Phase 12.5 (Part K) | 212/212 |
| A04 | 33/33 |
| A15 | 33/33 |
| A03 | 37/37 |

The first build only hid the buttons. 4.5.14's geometry check then failed at all four widths, 221/225, because a hidden button reports a zero box at the window's edge. The check was not changed: A16 now removes the buttons instead, and the harness passes 225/225. See [ROLLBACK.md](ROLLBACK.md), "Why removing, not only hiding".

The group review (7 November) found nothing to change in A16. The hashes above are from the rebuild on the amended A04 and A15; the first build was `5d89a8b8…72a4`.

Qualification follows the owner's review.
