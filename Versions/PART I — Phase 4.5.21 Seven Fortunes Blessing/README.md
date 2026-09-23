# Phase 4.5.21 — Seven Fortunes' Blessing

A01 (Core pp.153–154), built to the design agreed with the owner on 23 September 2026 (the audit's "A01 decisions"). **Implemented and verified, 23 September 2026.**

## Behaviour

| Fortune | Price | What the sheet does |
|---|---|---|
| Benten | 4 · Crane 3 | **Declared per roll** on Social Skill rolls: "Persuading (not coercing)" → **+0k1** |
| Bishamon | **5** · Crab or Lion 4 | **Automatic +1k0 on Strength Trait Rolls only** — not Skill rolls that use Strength, not damage. The extra Increased Damage Raise is a reminder |
| Daikoku | 4 · Mantis 3 | **Automatic +1k1** on Commerce Skill rolls (Emphases included) |
| Ebisu | 4 · Unicorn 3 | **Declared per roll** on Social Skill rolls: "With a non-samurai citizen of Rokugan" → **+1k1** |
| Fukurokujin | 4 · Dragon or Phoenix 3 | Picks a Lore Skill ("Lore: Theology"); **automatic +1k1** on rolls of exactly that Lore Skill |
| Hotei | 4 | **Contested Void Roll** button on the row (Void Ring, through the normal preview), and a per-roll **+10** declaration for a Contested Roll the effect already calls for. Your own Void spending is never intercepted |
| Jurojin | 4 · Scorpion 3 | **Declared per roll** on Skill, Trait, Ring and dice-tray rolls: "Resisting poison or disease" → **+2k0**, on whatever roll the GM calls for |

- **Picker:** the seven Fortunes in printed order, each with its price for this character and a collapsed **Rule** disclosure (the same native expand-on-tap shape as the Consumed tenets). Nothing preselected; a choice is required. Choosing Fukurokujin reveals the Lore field, which suggests the character's own "Lore: …" Skills and accepts a typed one; it must start "Lore:". Switching away from Fukurokujin drops the Lore Skill.
- **Declarations** use the 4.5.15 registry: unticked on every roll, never saved, never on attacks, spells or damage. Social Skills are Feature 4.5.2's list (Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, Temptation), specializations and Emphases included.
- **Row:** badge ("Fukurokujin's Blessing — Lore: Theology"), Change, circled-i with all seven Fortunes and prices, one line saying how it applies, and the discount reason when it applies.
- **The record:** `{type:'fortuneBlessing', revision:1, fortune, value}` plus `lore` for Fukurokujin only. Not the Curse's `fortunePick` (a Curse config on a Blessing row is flagged, `FB-INVALID-CURSE-TYPE`).
- **Unconfigured legacy row:** keeps whatever cost it carries, because its price depends on a Fortune not yet chosen. Unreadable settings are kept exactly and flagged, with their saved cost.

**Deferred by the owner for review** (recorded in the audit and the ledger's open reminders), and deliberately not built: flagging a second Blessing row under Core p.148's family rule, and any purchase-history treatment of changing the Fortune. **Interim:** every configured row is priced by its current Fortune and none is flagged.

Restore point recorded before any edit: commit `5b1fc0082b576a6fb1f118a06bba119fe408c49e` (docs on top of 4.5.20; build unchanged), **2,820,250 bytes**, SHA-256 `106833069f5bf72a69b185b9d29c85c7f0d1cbf6748bff2195a2581b5d1e8e79`, **1,822/1,822**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,846,031 bytes**, SHA-256 `9c749b7dc9c45fc5829f8db3172067d91ced54833e734da4f245d3ddb08528d0` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **77/77**: all seven Rule texts against the source table; every Fortune priced for ten Clan values; dice counted on real rolls for Bishamon, Daikoku, Fukurokujin, Benten, Ebisu and Jurojin; Hotei's +10 on the total and his Contested Void Roll; declarations unticked by default and fresh after each roll; scope (Social only, never attack/spell/damage); Lore validation and suggestions; eight unreadable-config cases; persistence; geometry at four widths with every Rule open |
| Full combined suite | **1,899/1,899** = 1,822 retained + 77 |
| Retained checks corrected (declared) | Two, both conditional on this release: 4.5.15's `RD-NO-PRODUCTION-PROVIDER` and 4.5.16's `HV-PROVIDER-REGISTERED` now also set aside this release's own `fortune-blessing` provider. Both pass with it present and removed |
| Surgical removal | **Byte-identical** to the restore point; the removed copy verifies; **1,822/1,822** retained on those bytes |
| Removal order with 4.5.20 | 4.5.20 removed while this stays: this suite **77/77**, older suites **1,756/1,756**. Both removed, either order: byte-identical to 4.5.19's `2b69794d…` |
| Dependency on 4.5.15 | 4.5.15's remover **refuses** while this release is present (measured), so the order is: this release first |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | Every reference inside `PART I FEATURE 4.5.21` blocks; exit 0 |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences / seven seats |

### Deliberately broken builds (one run)

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **19/47** | Every feature group |
| Own stylesheet removed | **73/77** | The four geometry checks |
| No Clan discount | **70/77** | Six Fortunes' price checks and the price reason |
| Bishamon costs 4 | **73/77** | Bishamon's prices, the re-price, the reason and the info text |
| Bishamon on any Strength roll | **75/77** | Not-Skill and not-damage checks |
| Bishamon +1k1 | **76/77** | The real Strength Trait roll |
| Any Lore matches Fukurokujin | **76/77** | `FB-FUKUROKUJIN-OTHER-LORE` |
| Lore not required | **71/73** | `FB-LORE-REQUIRED` (picker section then aborts) |
| Lore allowed on other Fortunes | **76/77** | `FB-INVALID-LORE-ON-OTHER` |
| Benten +1k0 instead of +0k1 | **76/77** | `FB-BENTEN-PLUS-0K1` |
| Ebisu as a −1k1 penalty | **76/77** | `FB-EBISU-PLUS-1K1` |
| Jurojin as a −2k0 penalty | **73/74** | The declarations section (the pool falls to zero dice) |
| Hotei +5 | **76/77** | `FB-HOTEI-PLUS-10` |
| Social declarations on any Skill | **76/77** | `FB-NON-SOCIAL-SKILL` |
| Declarations on attacks and spells | **76/77** | `FB-NOT-ON-ATTACK-SPELL-DAMAGE` |
| Hotei button missing | **73/75** | The Hotei section |
| Rule text missing | **70/77** | All seven Rule checks |
| Future revision accepted | **76/77** | `FB-INVALID-FUTURE` |

Found during the first variant run: two mutations reported **0/0** because the harness left a rejected button-click promise unhandled and a failed roll's modal open, so Node died before printing a count. The harness now catches every in-flight action and closes any preview or result modal after each roll and section; the rerun above gives a real count for every variant.

Inspected at 375px with fallback fonts only. Physical iPhone testing remains open.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries.
