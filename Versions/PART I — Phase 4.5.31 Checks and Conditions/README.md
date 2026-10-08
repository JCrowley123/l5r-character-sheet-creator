# Phase 4.5.31 — Checks and Conditions

Part I. Built 8 October 2026 (Claude) on `claude/phase-4-5-31-checks-conditions`, on top of Phase 4.5.30, on
the owner's approval of the next-phase assessment ("proceed as recommended"): the first of the two audit-sweep
releases, built alongside Phase 4.5.32 so both share one device check.

Thirteen Advantages and Disadvantages that only recorded their cost and text now do what the book says, each
in the way that suits it:

| Entry | Rule (our own words) | On the sheet |
|---|---|---|
| Brash (Core p.157) | threatened or insulted: Willpower TN 25, adding your Honor Rank | **Check (TN 25)**; the Honor Rank is added in the roll, not when Failure of Bushido is the Honor tenet |
| Can't Lie (p.157) | a lie told in front of you: Willpower TN 20 | **Check (TN 20)** |
| Contrary (p.158) | a dispute: Willpower against the GM's TN | a TN box (15 to start) and **Check** |
| Epilepsy (p.159) | Willpower TN 15 to avoid a seizure; TN 10 to end one | **Avoid (TN 15)** and **End seizure (TN 10)** |
| Overconfident (p.161) | Perception TN 20 to see a better foe | **Check (TN 20)**, a Perception roll |
| Rumormonger (p.161) | Willpower TN 5 × the Glory Rank involved | a Glory Rank box and **Check (TN 5 × Glory)** |
| Soft-Hearted (p.162) | Willpower TN 20 to kill; every TN 10 higher for a day after | **Check (TN 20)** and a **Wracked with guilt** switch (−10 on every roll while on) |
| Lame (p.160) | TN +10 on Agility rolls that use the legs; Move with Water 1 | an unticked box on Agility rolls; Move is a row reminder |
| Missing Limb (p.161) | TN +10 on any task needing the limb | the limb chosen on the row; an unticked box on every roll but damage |
| Disbeliever (p.158) | TN +5 on Social rolls with shugenja and monks | an unticked box on the seven Social Skill rolls (owner's ruling) |
| Lost Love (p.160) | every TN 5 higher when reminded, until a Void Point is spent (twice a day at most) | a **Reminded of your loss** switch (−5 on every roll) and **Spend a Void Point** |
| Blind (p.156) | −3k3 ranged, −1k1 melee attacks; Armor TN from Reflexes + 5; Move, Simple Move, Perception limited | the attack penalties; the Armor TN base; reminders; an information line on Perception rolls |
| Ishiken-Do (p.151) | Shugenja only; lets a shugenja cast Void spells | greyed for a non-Shugenja; **Void spells need it** (below) |

**Void spells (owner's ruling, 8 October):** without Ishiken-Do the spell picker lists the Void spells greyed,
"— needs Ishiken-Do", and so do the creation wizard's spell steps. A Void spell already on a character stays
on the list: the casting report (Phase 8, Part J) flags it as a blocker and its "?" becomes a cross, but **Cast
still works** -- that report never blocks a cast. Spell scrolls in Equipment are untouched (a Void scroll can be
carried, just not learned). Maho is left as it was. Universal spells were already cast as Air, Earth, Fire or
Water only on this sheet, so nothing changed there. No School gives a Void spell, so no School loses a spell.

TN +N is reported as −N to the total (Doubt's convention since Feature 4.5.9); initiative has no TN, so the TN
entries leave it alone; no entry touches damage. Only rows on the entry's own list count; the same entry on two
rows applies once.

## Implementation and removal

One script, `src/sheet/209.9999998-feat-checks-conditions.js` (`CHK4531`, marker `PART I FEATURE 4.5.31`,
switch `CHECKS_CONDITIONS_ENABLED`); one stylesheet, `src/css/59.99994-feat-checks-conditions.css` (own classes);
one guarded seam block; two manifest entries. Roll effects ride Phase 4.5's `advConfigExtendedRollModifiers`
seat (the registry stays at seven); the ticks are a Feature 4.5.15 provider; the rows are drawn from
`refreshAllAdvConfigControls`. Blind's Armor TN works under a **contract** written at the top of the fragment:
after the trunk writes the Armor TN, the base it wrote is replaced by Reflexes + 5 and the current TN moved by the
same difference; nothing else in the sum is touched. Row state lives in the row's own `data-adv-config` as
`{type:'chk4531', ...}`, which the save already carries. See [ROLLBACK.md](ROLLBACK.md).

Restore point: Phase 4.5.30's build (main `2a7e6da`), **3,614,960 bytes**, SHA-256
`9ae14a17644a46c7a73482999637c3a8a48ac65c0428894a7ccd42c40cbd8f51`.

## QA — 8 October 2026

Release build: **3,650,567 bytes**, SHA-256 `9bfbf6f207d069a241d1c212543afd920ceac3ade2ce784303ee78d7df74c733`.

| Check | Measured result |
|---|---|
| Own harness | **101/101** (book and ruling oracles; checks through the real buttons, dice and preview boxes) |
| Dependency boundaries | **91/91** (seven variants: each dependency switched off in turn) |
| Full combined suite | **4,637/4,637** = 4,536 + 101. The first run read 4,633: four earlier harnesses pinned a count this release changes (the casting report's rule list, two tick-provider lists, the greyed-entry count); each gained a term that applies only while this release is present, declared in [ROLLBACK.md](ROLLBACK.md) (`qa/first-run-full-regression.log` kept) |
| Surgical removal | Rebuilds **byte-identical** to `9ae14a17…` (Phase 4.5.30, main `2a7e6da`); **4,536/4,536** retained on those bytes |
| Remover fixtures | 23 run: **22 passed**, one skipped (Windows symlinks); includes a real removal and the proof that Phase 4.5.30's files are untouched |
| Ownership scan, inventory, removal chain | exit 0 (every reference inside this release's own blocks); inventory unchanged apart from size and hashes; chain 11/11 |
| Variants | **23 pinned, all as expected** (discovery, then a pinned run). Discovery showed "Blind Armor TN adjusted twice" changes nothing -- the adapter is idempotent by its arithmetic, the mark is belt and braces -- so it was replaced by "Blind moves the base but not the current Armor TN", which fails three Blind checks |
| Boundaries | Phase 4.5.30's harness with this release 41/41 and without it 41/41; dependency boundaries 91/91 |

## Run

```
node qa/checks-conditions-harness.js "<built sheet>"
node qa/dependency-harness.js "<built sheet>"
node qa/current-suite-runner.js "<built sheet>"
python -B qa/verify-regression.py
python -B qa/verify-variants.py --jobs 2
python -B qa/test-removal.py
```

Owner checks: [MANUAL-TESTS.md](MANUAL-TESTS.md).
