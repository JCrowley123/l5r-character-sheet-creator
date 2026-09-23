# Phase 4.5.24 — Touch of the Spirit Realms

A13 (Core pp.154–155), built to the owner's rulings of 23 September 2026 (the audit's "A13 decisions"). **Implemented and verified, 23 September 2026.** With it, every A01–A16 entry is delivered.

## Behaviour

| Realm | XP (Shugenja) | What the sheet does |
|---|---|---|
| Chikushudo | 5 (4) | **Automatic +1k1** on Animal Handling rolls (Emphases included) |
| Gaki-do | 5 (4) | Reminder: regain 5 Wounds after resolving an attack that kills |
| Jigoku | 5 (4) | **Automatic +Taint Rank** (from the Taint Rank field) on attack rolls and on Skill and Trait rolls using a Physical Trait (Agility, Reflexes, Stamina, Strength). A **Lost** tick on the row doubles it. At Taint Rank 0 the row warns and adds nothing, and the realm is never blocked |
| Maigo no Musha | 5 (4) | Reminder: one more Glory when awarded more than 3 |
| Meido | 5 (4) | **Per-roll tick** (4.5.15) on Skill, Trait, Ring and dice-tray rolls: "Contested Roll against social manipulation" → **+2k0** |
| Sakkaku | 5 (4) | **Per-roll tick** on Sincerity rolls: "Lying — Sincerity (Deceit)" → **+1k1** |
| Tengoku | 5 (4) | **Per-roll tick** on Earth Ring Rolls: "Resisting Shadowlands Taint" → **+2k0** |
| Toshigoku | 8 (**7**) | Reminder: +5 feet on a Move Action into attack range |
| Yomi | 7 (**6**) | Pick one School Skill; **automatic +1k0** on rolls of it, attacks included |
| Yume-do | 5 (4) | Reminder: four hours of rest recover all Void Points |

- **Shugenja prices:** 4 generally, as printed. **7 for Toshigoku and 6 for Yomi are this sheet's reading** of "Shugenja pay 4" as 1 XP less. For a Shugenja holding either realm, the row says so and suggests confirming the price with the GM. The picker marks those two "(confirm with your GM)", and the info text explains it for every character.
- **Picker:** the ten realms in printed order, each with its price for this character and its rule. Nothing is preselected and a choice is required. Choosing Yomi reveals a School Skill list built from the character's School Skills: each School's named Skills, plus any row ticked as a School Skill. Changing realm drops the Skill. A Lost Jigoku stays Lost when reconfirmed as Jigoku.
- **A Yomi Skill that stops being a School Skill** (the School changed) is kept and flagged, and its +1k0 stops applying. This follows the principle that a saved character is never silently rewritten.
- **Declarations** are unticked on every roll, never saved, and never on damage.
- **The record:** `{type:'spiritRealmTouch', revision:1, realm, value}`, plus `skill` for Yomi only and a boolean `lost` for Jigoku only. It is not 4.5.10's `realmPick`, which belongs to Cursed by the Realm. Unreadable settings are kept exactly and flagged, with their saved cost.

**Not built:** Gaki-do's healing, Maigo no Musha's Glory, Toshigoku's movement and Yume-do's Void recovery (reminders, as approved), and Core p.148's rule against holding this and Cursed by the Realm together (the sheet has no set-rule mechanism).

Restore point recorded before any edit: commit `94235855fde49542fbac785f8f2534624051afbd`, **2,888,142 bytes**, SHA-256 `4d112320eb4c1e9937a280b1e7d3f25ef1d5aff49a5a938e80b351fa329ccac7`, **2,002/2,002**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,914,055 bytes**, SHA-256 `3e262b188a453aed40451a7162a38e90761f6a04b35ea54bf124b9f1309151a2` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **50/50**. Oracles come from the Core pp.154–155 table, the owner's rulings and the printed School rows, never from `TR4524`. Covers:<ul><li>prices of all ten realms for a Bushi and a Shugenja; where the GM note appears (row, picker, info); the picker (order, nothing preselected, required, the Yomi Skill field and its options, changing realm, Lost following the realm); every realm's row; wrong side; rename; nine unreadable configs</li><li>automatic effects on the right rolls only (Chikushudo, Yomi including a stale Skill, Jigoku's scope across ten roll kinds, Lost, Taint 0); no standing effect from the seven other realms</li><li>where each declaration is offered; real dice for Sakkaku, Tengoku and Meido, and for Chikushudo, Yomi and Jigoku</li><li>the Lost tick; local save and reload; geometry at four widths, including the picker; no page errors</li></ul> |
| Full combined suite | **2,052/2,052** = 2,002 retained + 50 |
| Retained checks corrected (declared) | Two, both conditional on this release: 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and 4.5.16's `HV-PROVIDER-REGISTERED` now also set aside this release's own `spirit-realms` provider. Measured failing on this build before the correction (52/53, 90/91); both pass with it present and removed |
| Surgical removal | **Byte-identical** to the restore point; the removed copy verifies; **2,002/2,002** retained on those bytes |
| With 4.5.23 | 4.5.23 removed while this stays: this suite **50/50**, older suites **1,935/1,935**. Both removed, either order: **byte-identical** to 4.5.22's `985fdeee…` (2,854,260 bytes) |
| Dependency on 4.5.15 | With 4.5.23, 4.5.22, 4.5.21 and 4.5.16 stripped, 4.5.15's remover **refuses** (exit 2), names this fragment and leaves the tree unchanged. Removing this release, then 4.5.15, builds and verifies |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | Every reference is inside `PART I FEATURE 4.5.24` blocks; exit 0 |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences / seven seats |

### Deliberately broken builds (one run)

| Mutation | Result | What failed |
|---|---|---|
| Kill switch off | **6/33** | Every feature group |
| Own stylesheet removed | **46/50** | The four geometry checks |
| No Shugenja discount | **48/50** | Shugenja prices, picker note |
| Shugenja flat 4 | **48/50** | Shugenja prices, picker note |
| Toshigoku costs 5 | **45/50** | Both price tables, note placement, picker |
| No GM note | **49/50** | `TR-GM-NOTE-WHERE` |
| Chikushudo on any Skill | **49/50** | `TR-CHIKUSHUDO` |
| Yomi +1k1 | **48/50** | `TR-YOMI`, `TR-REAL-ROLLS` |
| Stale Yomi Skill still applies | **49/50** | `TR-YOMI-STALE` |
| Jigoku on Mental Traits | **49/50** | `TR-JIGOKU-SCOPE` |
| Jigoku on any roll | **49/50** | `TR-JIGOKU-SCOPE` |
| Lost does not double | **48/50** | `TR-JIGOKU-LOST`, `TR-LOST-TICK` |
| No Taint-0 warning | **49/50** | `TR-JIGOKU-NO-TAINT` |
| Sakkaku on any Skill | **49/50** | `TR-SAKKAKU-WHERE` |
| Meido on attacks | **49/50** | `TR-MEIDO-WHERE` |
| Tengoku on any Ring | **49/50** | `TR-TENGOKU-WHERE` |
| Declarations without the realm | **45/50** | All four "where" checks and the Sakkaku dice |
| Lost reset on reconfirm | **49/50** | `TR-LOST-FOLLOWS-REALM` |
| Extra fields accepted | **49/50** | `TR-INVALID-KEPT` |
| Skill field always shown | **49/50** | `TR-SKILL-HIDDEN` |
| Lost tick ignored | **49/50** | `TR-LOST-TICK` |

Found while building:
- **A bug found in the screenshots.** The carousel's `body.car-active .car-page label` rule (0,2,2) shrank Jigoku's Lost label to 9.7px. The label's selector now carries the list's ID. The geometry check now requires at least 13px: the previous build fails four checks (46/50), the fixed build passes 50/50.
- **A harness error.** A fixture expected `characterCasterLock()` to return `null` for a Bushi School; it returns `'bushi'`. Only the test was corrected.

Inspected at 375px with fallback fonts only: the Yomi row with the GM note, the Jigoku row, and the picker with Yomi's Skill field. Physical iPhone testing remains open.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries; two conditional harness corrections in 4.5.15 and 4.5.16.
