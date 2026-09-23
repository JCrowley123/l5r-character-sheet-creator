# Phase 4.5.14 — Seven Fortunes' Blessing (A01)

The one entry Feature 4.5.13's own scope table flagged as still missing: "Seven Fortunes'
Blessing remains the canonical missing variable-configuration Advantage and needs
source-confirmed Fortune data before implementation" (`BUILD-LEDGER.md`, 13 September 2026).
That source data is now recorded in `PART I — Phase 4.5 Remaining Configuration Audit/SOURCE-CORE-PREPARATION.md`
("A01 — Seven Fortunes' Blessing", printed pp.153–154 / PDF pp.156–157), and this release quotes
it directly. **Implemented and verified, 22–23 September 2026.**

| Entry | Scope |
|---|---|
| A01 Seven Fortunes' Blessing | Fortune picker (Benten, Bishamon, Daikoku, Ebisu, Fukurokujin, Hotei, Jurojin), required Lore Skill for Fukurokujin, calculated XP with Clan discount, reference information overlay listing all seven branches. Every branch's effect is applied manually — no roll, damage or money automation. |

## Scope decision

Matched to what Feature 4.5.13 shipped for A02 Blackmail — a picker plus a calculated XP cost,
with the release's own header saying "this release neither registers a roll contributor nor
grants character resources" — rather than to the fuller roll automation Features 4.5.11–4.5.12
built for the mirror-image Seven Fortunes' Curse (D04a/D04b). Two of that Curse's seven branches
(Bishamon, Hotei) were themselves explicitly deferred by the audit as needing their own review —
a dedicated damage-path change for Bishamon's Strength reduction, an activation-cost
classification pass for Hotei — rather than something a schema-and-picker release could absorb.
Automating this Blessing side's Bishamon (Raise-counting on Increased Damage, +1k0 Strength
Trait Rolls) and Hotei (Contested Void Roll defence) is the same order of work and is left for a
future point release; nothing here forecloses it. Every Fortune's rule text is instead shown to
the player, on the row and in the reference overlay, worded as an instruction to apply by hand.

## Source and boundary decisions

The audit's own table is authoritative for prices, Clan discounts and effect text — nothing here
is recalled from memory of the sourcebook. Bishamon is the one branch with its own base price (5,
Crab/Lion 4); every other branch is 4 normally, discounted to 3 for its own listed Clan or Clans
(Fukurokujin: Dragon or Phoenix; Bishamon: Crab or Lion). Hotei lists no discount Clan. Fukurokujin
alone takes a second, required field — the chosen Lore Skill — per the audit's own instruction:
"Record the chosen Fortune and require the secondary Lore Skill only for Fukurokujin... Changing
to another Fortune must clear that secondary field." Both halves are enforced: `loreSkill` is
required non-empty only when Fukurokujin is picked, and is rejected as present for every other
Fortune, so a re-pick away from Fukurokujin cannot leave a stale value sitting in a saved config.

Like Blackmail (and unlike Forbidden Knowledge/Inheritance/Way of the Land, whose prices are
fixed regardless of their own optional notes), this entry's price is genuinely variable — it
depends on the Fortune picked and the character's own Clan — so the row reads 0 until the pick is
complete, never a guessed tier.

## Persistence

One new config type, `fortuneBlessingPick`, `revision:1`, with `fortune` and (Fukurokujin only)
`loreSkill` as the stored choice fields, plus the normal `type`/`revision`/`value` compatibility
fields the base Phase 4.5 schema already handles. This is independent of the Disadvantage side's
own `fortunePick` type (D45, Features 4.5.11–4.5.12) — different registry, different config-type
namespace, and the two strings cannot collide despite the similar name. An unknown revision,
unknown type, unknown Fortune name, a stray `loreSkill` on a non-Fukurokujin pick, or a missing
`loreSkill` on a Fukurokujin pick are all preserved and visibly flagged rather than silently
repriced or dropped — exercised by the harness's `FB-INVALID-*` and `FB-FUTURE-CONFIG` checks.

## Validation and regression matrix

| Area | Risk | Acceptance tests |
|---|---|---|
| XP | High | Real row price for all seven branches, with and without the discount Clan; Bishamon's own 5/4 split; Hotei's no-discount case; blank/incomplete price reads 0; edit/cancel |
| Configuration | Medium | Fukurokujin's required Lore Skill (blank rejected, inline error, live show/hide as the pick changes); re-pick away from Fukurokujin clears the field; revision/type/fortune validation |
| UI | Medium | Shared host open/change/cancel; reference information overlay listing all seven branches; badge/warning text; widths 320/375/768/1440, including a long Lore Skill name |
| Persistence | High | Browser save/reload; actual export download/import upload; unknown fields preserved |
| Isolation | High | Purchased Skills/Traits/Rings, equipment, spell slots, Void, roll modifiers (across every `ROLL_KINDS`) and the seven-seat pre-roll registry unchanged |
| Removal | High | Scratch-only surgical removal, exact baseline bytes, unchanged retained suites, foreign-marker refusal |
| Text safety | Medium | The Lore Skill field is rendered as text, never HTML; a malicious value round-trips through edit unchanged |

## Measured QA — 23 September 2026

Final Phase 0 build with this release: **2,726,812 bytes**, SHA-256
`b4c0a6bbae32b2dfdef505a657b7637b1d8fcaddc38dc7d08bebb532054a58a7`.

| Check | Measured result |
|---|---|
| Before this release (Feature 4.5.13's own build) | **1,128/1,128** retained checks |
| New real-browser suite | **117/117** |
| Full combined suite (992 retained + 136 Named Advantages + 117 new) | **1,245/1,245** |
| Surgical removal | **Byte-identical** to Feature 4.5.13's own restore point: 2,704,237 bytes, SHA-256 `1e2683d81ddab13662f76c62ca8c595d521d633f6cc66a512169661cd85b8326` |
| Retained suite on the removed build | **1,128/1,128**, matching Feature 4.5.13's own measured number exactly |
| Registry | Pre-roll modifier registry unchanged at seven contributors before, during and after; this release takes no seat |

Two real bugs were found and fixed by this harness before it went green, not asserted around:
the Lore Skill field's `hidden` attribute was being defeated by this release's own CSS (an author
rule of equal specificity to the UA `[hidden]{display:none}` default was declared without a
`[hidden]` guard of its own, so the field stayed visibly rendered after `hidden` was set — fixed
in `59.9-adv-fortune-blessing.css`), and the geometry check's "16px minimum, no mobile zoom" rule
was applied to the Fortune picker's checkboxes as well as its text field, which have no rendered
text of their own to size — fixed in the harness itself, not the production code.

A latent bug was also found, and fixed only in this release's own runner, in the chain-runner
pattern Feature 4.5.13's `qa/current-suite-runner.js` established: a runner that propagates its
"previous" child's full raw output via `process.stdout.write()` before printing its own final
`COMBINED` line leaves TWO matching `COMBINED N/N` lines in that output for a third-level caller,
and a plain first-match `exec()` silently picks the wrong (earlier, smaller) one. Feature
4.5.13's own runner is unaffected in practice — its own immediate "previous"
(`BUGFIX — Negative Roll Modifier Display`) already filters propagated child output down to
`PASS`/`FAIL` lines before re-printing it, so only one `COMBINED` line ever reaches 4.5.13's
regex — but the pattern itself is not safe to copy one level further, which is exactly what this
release does. This release's own `qa/current-suite-runner.js` filters propagated output the same
way `BUGFIX — Negative Roll Modifier Display`'s does, and searches for the last match rather than
the first as a second line of defence. Feature 4.5.13's file was not edited, per this project's
own rule against modifying a previous phase; the gap is declared here as a known issue for a
future release that chains a fourth level onto 4.5.13's runner directly.

Not real-device confirmed. The browser's loaded-webfont set is empty in this sandbox (no outbound
network access), so the 375px geometry checks are fallback-font observations, per this project's
own standing lesson on pixel measurements taken here.

## Run

`qa/current-suite-runner.js <built html>` chains the full retained suite (through Feature
4.5.13's own runner) plus this release's real-browser harness, reporting one combined total.
`qa/fortune-blessing-harness.js <built html>` runs this release's own suite alone.
`qa/remove-phase.py <explicit scratch Phase-0 path> --expect-sha <hash>` proves surgical removal;
see ROLLBACK.md for the exact procedure. Set `NODE_PATH=/opt/node22/lib/node_modules` and
`L5R_CHROME=<path to a Chromium binary>` if Playwright's own bundled browser is not where it
expects.
