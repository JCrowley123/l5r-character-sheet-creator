# G1 — the one read-only review (7 November 2026)

**What was reviewed:** the whole group's diff, `47500272..1298b175` (A04, A15, A16, A03.1, as first built). One reviewer subagent ran it, read-only. It reported **no blocking defects**: two risks and six nits.

**What was done:** every finding was fixed. Each fix went into its own unit's commit, and the later branches were restacked on top. The light checks were then re-run for each unit, with it present and with it removed, and all passed.

| # | Finding | Unit | Fix | Proof |
|---|---|---|---|---|
| 1 | **Risk.** In Play, an i moved out of a Choose… that Phase 12 (Part K) locks and hides stayed visible on its own. | A04 | The stylesheet hides an i moved out of a `[data-pm12-locked]` control in Play. | New check `IP-PLAY-NO-LONE-I-*`, pinned before its first run. It fails on the pre-fix build (33/35) and passes on the fixed one (35/35). |
| 2 | **Risk.** The i's 44 px touch area reached 2 px into the control beside it (6 px gap against an 8 px reach). | A04 | The gap is now 8 px. | Visual; A04's touch checks still pass. |
| 3 | **Nit.** "+ Add court"'s accessible name did not contain its visible words (WCAG 2.5.3). | A15 | It is now "Add court to Darling of the Court". | A15's harness, 33/33. |
| 4 | **Nit.** Hotei's price came from wording that Phase 4.54 (Part I) rewrites. | A04 | The price is read from the entry's cost box. | `IP-HOTEI-ROW-*` checks it against the fixture's cost. |
| 5 | **Nit.** An i moved out of a `<summary>` would land inside its closed `<details>`. | A04 | `summary` is no longer a host that gets moved. None exists today. | No change in behaviour. |
| 6 | **Nit.** `IP-KIHO` skipped the ring check while the Kiho note was hidden. | A04 harness | The note's hidden ancestors are now revealed for the measurement, so the ring is always checked. | 35/35. |
| 7 | **Nit.** In 4.5.14's harness: `CS-ONE-SELECTED` under A15 no longer proved which court was selected; the header did not mention A16; one line was mis-indented. | 4.5.14 harness | With A15 present, `CS-ONE-SELECTED` now also checks that the selected court is the first court. The header now names A16, and the indent is fixed. | 225/225 with the units present, and 225/225 with each removed. |
| 8 | **Nit.** The Masteries section was announced twice, and its list lost its list semantics in Safari. | A03.1 | The section uses `aria-labelledby` on its heading, and the list has `role="list"`. | A03.1's harness, 19/19. |

**Builds after the fixes:**

| Unit | SHA-256 | Bytes |
|---|---|---|
| A04 | `bc4ba311…e0c9` | 17,566,583 |
| A15 | `2ba7e6df…c0e0` | 17,576,326 |
| A16 | `f64b6e37…58ef` | 17,580,502 |
| A03.1 (the whole group) | `2dcf6f20…6af6` | 17,586,964 |

Each unit's remover and `test-removal.py` were updated to its new predecessor hash, and all four removal tests pass, 10/10 each.
