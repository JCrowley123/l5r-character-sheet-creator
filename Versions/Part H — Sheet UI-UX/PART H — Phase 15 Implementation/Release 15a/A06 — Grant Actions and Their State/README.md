# Release 15a · A06 — Grant Actions and Their State

Group G2, unit 2 of 5. This is audit finding A06 (FT-42), ruled under Q1. Approved on 7 November 2026 as revision 2 of the mock-up: no tick once recorded ([G2 mock-ups](<../G2 — Small Layout Fixes/MOCKUP.md>)). Built on 7 November 2026 (Claude), on branch `claude/release-15a-a06`, stacked on A05.

## What changes

Two rows offer a koku grant: Zakyo Toshi Citizen (Phase 4.5.40, Part I) and Wealthy (Phase 4.5.17, Part I). Their two actions were equal outlined buttons; on Zakyo's row they touched. While a grant is waiting, the box now reads as one compact group:

- **The explanation line** takes the full width, as before.
- **The two actions** sit below it with a 10 px gap, both 44 px tall:
  - the first is the primary, filled in ink: "Add N koku" or "Return N koku";
  - the second stays outlined: "Already added" or "Keep".
- **The state follows the buttons:** "Not recorded yet", or "Not settled yet" for Return / Keep. On a phone it wraps under the buttons; on a laptop it sits beside them.
- **Once recorded,** the buttons go and the existing line says so in plain words ("1.5 koku from Zakyo Toshi Citizen recorded on your Koku."). There is no tick, as the owner asked in revision 2.

Everything is in the stylesheet. No button is moved, renamed or relabelled, and the state is drawn by the stylesheet (CSS generated text). So each row's text, buttons, one-time guard (money moves only on a tap, recorded in the row) and reversal are exactly those phases' own. Hover keeps full opacity, so a tapped button does not stay faded on a phone.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A06 (this branch) | `9ae08de1df78559b52c4326e5364ea33e872a248aeecd3cbbd9383ca0e9d90d0` | 17,595,505 |
| A06 removed (A05) | `dde68b5c366e15be9bf4185726bdaf4fefe92a90f5525f28d5291c1dd57ea726` | 17,591,617 |

## Light checks (7 November)

| Check | Result |
|---|---|
| Own harness `qa/grant-actions-harness.js` (20 checks, pinned before the first run) | 20/20 |
| Own harness with A05 removed and A06 kept | 20/20 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside A06's own blocks |
| Phase 4.5.17 (Part I), Wealthy's koku grant | 87/87 |
| Phase 4.5.40 (Part I), Zakyo Toshi Citizen | 21/21 |
| Phase 12.5 (Part K), Advantages in Play | 212/212 |

Qualification follows the owner's review. See [ROLLBACK.md](ROLLBACK.md).
