# Phase 4.5.32 — Damage, Sessions and XP

Part I. Built 8 October 2026 (Claude) on `claude/phase-4-5-32-damage-sessions-xp`, on top of Phase 4.5.31, on
the owner's approval of the next-phase assessment ("proceed as recommended"): the second of the two audit-sweep
releases, sharing Phase 4.5.31's device check.

Nine Advantages and Disadvantages that only recorded their cost and text now do what the book says:

| Entry | Rule (our own words) | On the sheet |
|---|---|---|
| Hands of Stone (Core p.150) | +0k1 on unarmed damage | in the damage dice: the weapon row's DR and the roll; the result names it |
| Large (p.151) | +1k0 damage with Large melee weapons | in the damage dice (the weapon's own size in the sheet's library) |
| Small (p.162) | −1k0 on melee damage; Move with Water one lower; not with Large | in the damage dice; Move is a reminder; Large and Small grey each other out, and with both on the list neither applies |
| Great Destiny (p.150) | once a session, a killing blow leaves you 1 Wound from death | **Use** (asks first): Wounds taken set to one less than the most the character can take; **Reset session** |
| Dark Fate (p.158) | the same, because your dark fate is unfinished | the same |
| Haunted (p.160) | while your ancestor is angry, the GM picks one roll a session for −1k1 | an **Ancestor angry** switch; an unticked box on every roll but damage; the roll that takes it spends the session's use; **Reset session** |
| Enlightened (p.148) | raising the Void Ring costs 2 XP less each time | in the Void XP |
| Obtuse (p.161) | High Skills other than Investigation and Medicine cost double | in each Skill's XP: the Ranks doubled, Emphases unchanged |
| Blissful Betrothal (p.146) | Gentry, Kharmic Tie (to your spouse), Social Position and Wealthy cost 2 less each | those rows' costs, never below 1; the Kharmic Tie only with the row's **Your Kharmic Tie is to your spouse** switch |

Clan price reductions the books name for these entries stay with Feature 4.5.25 and the player. Blissful
Betrothal applies while both rows are on the list, as Naishou Citizen's discount does (Feature 4.5.22). Only
rows on the entry's own list count; the same entry on two rows applies once.

## Implementation and removal

One script, `src/sheet/209.9999999-feat-damage-sessions-xp.js` (`DSX4532`, marker `PART I FEATURE 4.5.32`,
switch `DAMAGE_SESSIONS_XP_ENABLED`); one stylesheet, `src/css/59.99995-feat-damage-sessions-xp.css` (own
classes); one guarded seam block; two manifest entries. Built to Feature 4.5.29's standard: it does no damage,
Wound or XP arithmetic of its own, only adjusts what the core's functions return, under **contracts** written at
the top of the fragment (`getWeaponDamageDice`, `computeWoundThresholds`, `voidCost`, `getPaidEmphCount` then
`skillCost`, and the Advantage rows' cost after every other module). A damage roll never passes through the roll
pipeline (Feature 4.5.12's lesson), which is why the dice are changed where they are made. Haunted's tick is a
Feature 4.5.15 provider; row state lives in the row's own `data-adv-config` as `{type:'dsx4532', ...}`; the price
Blissful Betrothal started from travels in the save as `blissful`, as Feature 4.5.25's prices do. See
[ROLLBACK.md](ROLLBACK.md).

Restore point: Phase 4.5.31's build, **3,650,567 bytes**, SHA-256
`9bfbf6f207d069a241d1c212543afd920ceac3ade2ce784303ee78d7df74c733`.

## QA — 8 October 2026

Release build: **3,680,503 bytes**, SHA-256 `fe2873e6654e63947fef50a36ebf8f0c6cd611d887651225b78abf87916501dd`.

| Check | Measured result |
|---|---|
| Own harness | **69/69** (book and ruling oracles; damage, Wounds and XP derived from the core's own functions) |
| Dependency boundaries | **60/60** (six variants: each dependency switched off in turn) |
| Full combined suite | **4,706/4,706** = 4,536 + 101 + 69. A first run read 4,705/4,705 before the style check below was added. Two earlier harnesses gained a term for this release's tick provider, declared in [ROLLBACK.md](ROLLBACK.md) |
| Surgical removal | Rebuilds **byte-identical** to `9bfbf6f2…` (Phase 4.5.31); **4,637/4,637** retained on those bytes |
| Remover fixtures | 23 run: **22 passed**, one skipped (Windows symlinks); includes a real removal and the proof that Phase 4.5.31's files are untouched |
| Ownership scan, removal chain | exit 0 (every reference inside this release's own blocks); chain 11/11 |
| Variants | **24 pinned, all as expected** (discovery, then a pinned run). Discovery found the harness never looked at the stylesheet (a check on the row layout and the switch size was added) and could hang waiting on a confirm dialog under one variant (fixed). "Betrothal XP one pass late" changed nothing: measured, the sheet already refreshes the rows twice per recalculation, so the guarded extra pass is insurance only; that variant was dropped |
| Boundaries | Phase 4.5.31's harness with this release 101/101 and without it 101/101; Phase 4.5.29's 45/45 with it; dependency boundaries 60/60 |
| Combined checklist walk (both releases, real controls, typed, no forced recalc) | **32/32** on the local build |

## Run

```
node qa/damage-sessions-xp-harness.js "<built sheet>"
node qa/dependency-harness.js "<built sheet>"
node qa/current-suite-runner.js "<built sheet>"
node qa/checklist-walk.js "<built sheet or live URL>"
python -B qa/verify-regression.py
python -B qa/verify-variants.py --jobs 2
python -B qa/test-removal.py
```

Owner checks: [MANUAL-TESTS.md](MANUAL-TESTS.md) (with Phase 4.5.31's, one combined checklist).
