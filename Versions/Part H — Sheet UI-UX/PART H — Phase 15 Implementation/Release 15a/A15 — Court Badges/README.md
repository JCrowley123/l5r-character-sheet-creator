# Release 15a · A15 — Court Badges

Group G1, unit 2 of 4. Built on 7 November 2026 (Claude) on branch `claude/release-15a-a15`, stacked on A04.

The design is the owner's. Their revisions were made on 6 November, and on 7 November they asked for the in-session fill to follow the Clan colour. The mock-ups are recorded in [G1 mock-ups](<../G1 — Information Pattern/MOCKUP.md>), revisions 2 and 3. The finding is A15 in the Phase 15 audit, and the ruling is Q3 (1 November).

## What changes

Darling of the Court's row used to have two controls: a radio per court (32 px chips showing the browser's blue dot) and a separate 13 px "Court in session" tick box. Now each court is a single badge.

- **Not in session:** a gold outline on the page colour.
- **Tap it:** it fills in the Clan's colour, which means that court is in session. The status line then reads, for example, "Status 3 — counts as 4 at Kyuden Doji (in session)". Crane gets the same blue used elsewhere on the sheet. Every Great Clan has its own shade, and a character with no Great Clan gets the sheet's red. The court name, in the paper colour, is at least 5.7 : 1 against the fill for every Clan. The name is also bold, and the status line names the court, so the state never rests on colour alone.
- **Tap it again:** it empties. No court is in session, the bonus goes, and the status line says "no court in session".
- **One court at a time:** the sheet stores one, so tapping another badge moves the session there.
- **The badges work in Play too.** **+ Add court** sits on the row in Manage only. It opens the editor with a new, empty court line ready to type in. Rename and remove stay in the editor.
- **Words:** the row's i and the editor's note no longer mention a tick box.
- **Size and access:** every badge and + Add court is at least 44 px tall. Badges are toggle buttons (`aria-pressed`), so Space and Enter work and screen readers hear "pressed".
- **Not changed:**
  - the saved data (one chosen court and an in-session flag), so every character loads as before, with or without A15;
  - the price, Change and the i;
  - the Status field, which A15 never writes.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A04 and A15 (this branch) | `2ba7e6dfe0385f6be499452a0f0ba68aea6b40a29482a214ea2212eb2466c0e0` | 17,576,326 |
| A15 removed (A04) | `bc4ba31134bb30848f73bbfd5fc1e7a9c76eb75fee391f829f682647d700e0c9` | 17,566,583 |

## Light checks (7 November)

Every harness was run with the suite's leaf preloads.

| Check | Result |
|---|---|
| Own harness `qa/court-badges-harness.js`, pinned in `qa/expected-checks.json` before the first run | 33/33 |
| Own harness on the A04-removed build (A15 kept) | 33/33 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside A15's own blocks |
| Phase 4.5.14 (Part I), the court-picker owner, with its declared conditional fixture | 225/225 with A15; 225/225 on A04's build; 225/225 on the A04-removed build |
| Phase 12.5 (Part K), with its declared conditional fixture | 212/212 with A15; 212/212 on A04's build; 212/212 on the A04-removed build |
| A03 | 37/37 |
| A04 | 33/33 |
| Phase 4.54 (Part I) | 28/28 |
| Phase 12 (Part K) | 25/25 |
| Phase 9 (Part H) | 17/17 |

Two of my own mistakes were found while building, before anything was committed:

1. In the conditional edit to 4.5.14's harness, one expected value was inverted (`!BADGES`). The first run reported it as 224/225, and it was corrected.
2. Two of A15's colour checks would have failed if Phase 9 were ever removed. They now expect the red whenever the Clan theme is not applied.

Neither change weakens a check.

**The group review (7 November)** found two small things in A15, both fixed:

1. **+ Add court's spoken name.** It now contains its visible words ("Add court to Darling of the Court"), so a speech-control user can say what they see.
2. **4.5.14's `CS-ONE-SELECTED`.** With A15 present, this check now also proves that the first court is still the selected one. Before the fix it only checked that no badge was filled.

The first build was `3a3020f3…78d5`. Rebuilt on the amended A04, it is the hash above.

Qualification follows the owner's review. See [ROLLBACK.md](ROLLBACK.md) for ownership, the two declared fixture corrections, and dependencies.
