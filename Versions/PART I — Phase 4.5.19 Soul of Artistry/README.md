# Phase 4.5.19 — Soul of Artistry

A12: the player picks **Artisan Skills** or **Craft Skills**; a matching Skill that would otherwise be rolled Unskilled is rolled as **Rank 1** — Trait + 1 dice rolled, Trait kept, 10s explode. **Implemented and verified, 23 September 2026.**

## Behaviour

| Situation | What happens |
|---|---|
| Add Soul of Artistry | The shared modal offers Artisan Skills or Craft Skills, each naming what counts; nothing preselected; Confirm without a choice shows an inline error and saves nothing |
| Confirmed | Badge ("Artisan Skills"), Change, circled-i, and one reminder line: "Artisan Skills you have no Rank in roll as Rank 1, and 10s explode (includes Calligraphy)." When the reduced price applies it says why ("3 XP: Crane", or "3 XP: Courtier School (Doji Courtier)") |
| Price | **4 XP, or 3 for a Crane OR a Courtier** (Core p.154). One reduced price: Crane *and* Courtier is still 3. A Courtier School is one whose name or bracketed type says Courtier — the same test Darling of the Court (4.5.14) uses, written out separately so neither release depends on the other |
| Rolling a matching Skill with no Rank | From the Skill table (Rank 0 row) or the Untrained Skills list, the roll becomes a real Rank 1 roll **before the preview opens**: the preview shows "<Skill> Rank 1", the breakdown adds a "Soul of Artistry — treated as Rank 1" line, the dice are Trait + 1 k Trait and 10s explode, and the title reads "… (Soul of Artistry — Rank 1)" |
| Void Points | The Void "Make an Unskilled roll Skilled (Rank 0 → 1)" option is **not** offered on a lifted roll (it would be a second 0→1 lift); +1k1 still is |
| A trained matching Skill | Unchanged — no extra die, no line |
| Attacks, damage, Trait/Ring/manual rolls | Unchanged (Skill rolls only) |
| Purchased Rank, XP, Insight | Never touched; nothing on the character changes when a lifted roll is made |
| Two Soul of Artistry rows | Same family: the lift still happens once. Artisan and Craft: both families lift |
| Unconfigured, wrong list, or unreadable saved setting | No lift. Unreadable settings (unknown family, wrong case, revision 2, extra field, other type) are kept exactly and flagged; their saved cost is kept |

**What counts** (SOURCE-OTHER-PREPARATION.md, A12; Core pp.135, 143–144): the family's own name, its colon specializations ("Artisan: Painting", "Craft: Blacksmithing"), an Emphasis in parentheses ("Artisan (Poetry)"), and the listed members — **Calligraphy** is Artisan; **Engineering, Sailing and Forgery** are Craft. Nothing else is guessed: "Crafty", "Craftsmanship", "Artisanal" and "Lore: Calligraphy" do not match (all checked).

**The record:** `{type:'skillFamilyPick', revision:1, family:'Artisan'|'Craft', value}` in the row's own config.

**How it is built:** one rebinding of `rollWithModifiers()` (every caller reaches it by name, so both roll paths are covered) rewrites the context to Rank 1, adds one die and sets explode on; one informational line through the existing adv-config seat explains it. No registry seat, no edit to the preview, breakdown or Void code — they read the rewritten context and agree by construction.

## Found, not fixed: Rank 0 table rows already explode

Measured on the pre-release build: rolling a **Rank 0 row from the Skill table** is labelled "Unskilled" in the preview but its **10s explode**, because `rollSkill()` (Part B trunk) never passes `explode:false`. Only the Untrained Skills list rolls a correct non-exploding Unskilled roll. This is trunk behaviour outside this release; on that path Soul of Artistry adds the missing die and the correct label. It wants its own bugfix folder; any retained harness that rolls a Rank 0 row would need checking against the fix.

Restore point recorded before any edit: commit `fe20e753756d8623c5a8f86de63ee341d9595476` (4.5.18), **2,780,550 bytes**, SHA-256 `96dda731ef0cf9670fe2c65763bf28e2a73698972e7d8f49014ac598c728385a`, **1,664/1,664**.

## Measured QA — 23 September 2026

Final Phase 0 output: **2,798,717 bytes**, SHA-256 `2b69794dcd3bf9d70b8a1676a4f9cb734cf1f4b0ecf7d40b0396d0bae8ef0c3e` (pinned).

| Check | Measured result |
|---|---|
| New real-browser suite | **92/92**: dice counted on the rendered result with Traits read from the sheet's own lookup; 19 skill names × both families against the source table; both real roll paths; trained, attack and non-Skill rolls unchanged; six price cases; duplicates; persistence; geometry at 320/375/768/1440 px |
| Full combined suite | **1,756/1,756** = 1,664 retained + 92; **no retained check changed** |
| Surgical removal | **Byte-identical** to the restore point; the removed copy verifies; **1,664/1,664** retained on those bytes |
| Removal order with 4.5.18 | 4.5.18 removed while this stays: this suite **92/92**, older suites **1,584/1,584**. Both removed, either order: byte-identical to 4.5.17's `be9076cf…` (2,767,985 bytes) |
| Remover fixtures | **45 run, 45 passed, 0 skipped** |
| Ownership scan | Every reference inside `PART I FEATURE 4.5.19` blocks; exit 0 |
| Recombine / drift / inventory / registry | Exit 0 / exit 0 / no differences / seven seats |

### Deliberately broken builds (one run)

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **7/24** | Every feature group |
| Own stylesheet removed | **88/92** | The four geometry checks |
| Reduced price removed | **87/92** | All five 3-XP cases |
| Courtier School not counted | **90/92** | The two Courtier cases |
| Extra die but no explosion | **78/92** | Every lifted roll |
| Explosion but no extra die | **72/92** | Every lifted roll and both real paths |
| Context not rewritten (dice right, preview says Unskilled) | **89/92** | Both preview checks and the double-Void-lift check |
| Trained Skills also lifted | **90/92** | The trained checks |
| Loose name match | **89/92** | Artisanal, Crafty, Craftsmanship |
| Craft members dropped | **84/92** | Engineering, Sailing, Forgery and the texts naming them |
| Disadvantage-list row counted | **91/92** | `SA-WRONG-SIDE` |
| Any roll kind lifted | **90/92** | The scope checks, including a real attack |
| Future revision accepted | **91/92** | `SA-INVALID-FUTURE` |

The picker and row were inspected at 375px with fallback fonts only. Physical iPhone testing remains open.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>`; `qa/verify-variants.py --node <node> --retained`; `qa/test-removal.py`.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, one guarded seam block, two manifest entries.
