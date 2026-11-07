# Release 15a · A03.1 — Masteries in the Skill Information

Group G1, unit 4 of 4. This was the owner's idea from A03. The owner added it on 6 November 2026 and approved it as mocked up on 7 November ([G1 mock-ups](<../G1 — Information Pattern/MOCKUP.md>)). Built on 7 November 2026 (Claude), on branch `claude/release-15a-a03.1`, stacked on A16.

## What changes

The Skill information window is the one A04's i opens. Until now it showed:

- the Skill's Rank, Trait and roll;
- its description and Emphases;
- for the Mastery Abilities, only two Debug buttons.

It now also lists the **Mastery Abilities**, after the Emphases:

- **Each Mastery** shows the Rank that grants it.
- **Reached Masteries** are in the ink colour, with their Rank label in the Clan's colour and the word "reached". This matches the Skill card's marking.
- **Masteries not yet reached** are in the muted ink. It is still readable: measured at 4.5 : 1 or more.
- **A Skill with none**, or a custom Skill, says "No Mastery Abilities on file for this Skill."

The list comes from the same library data as the card's own Mastery notes, read each time the window opens, so the two always agree. The harness checks this for every Skill on the test character.

The window's other content and the Debug buttons are unchanged.

## Build

| Build | SHA-256 | Bytes |
|---|---|---|
| With A04, A15, A16 and A03.1 (this branch, the whole group) | `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6` | 17,586,964 |
| A03.1 removed (A16) | `f64b6e375665d9e7175a98d70829b8c9afb09646261ddc3574eaae1ff01258ef` | 17,580,502 |

## Light checks (7 November)

| Check | Result |
|---|---|
| Own harness `qa/skill-masteries-harness.js` (pinned before the first run) | 19/19 |
| Own harness on the A16-removed build | 19/19 |
| `qa/test-removal.py` | 10/10 |
| `feature-dependencies.py` | every reference inside A03.1's own blocks |
| BUGFIX — Skill Traits (also rebinds the window) | 38/38 |
| Phase 12.4 (Part K) | 17/17 |
| A03 | 37/37 |

The test character reaches no Mastery. So the harness raises Defense (Masteries at 3, 5 and 7) to Rank 5, and then to 7 and back, in its own copy of the character.

**The group review (7 November)** found two accessibility details in A03.1, both fixed:

- The section is now named once, by its heading (`aria-labelledby`). Before, it was announced twice.
- The list carries `role="list"`. Safari drops a list's meaning when its bullets are hidden.

The first build was `f36f9fa5…1491`. The hashes above are from the rebuild on the amended units.

Qualification follows the owner's review. See [ROLLBACK.md](ROLLBACK.md).
