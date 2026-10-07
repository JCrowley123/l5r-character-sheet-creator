# Phase 4.5.30 — Automatic Roll Entries

Part I. Built 7 October 2026 (Claude) on `claude/phase-4-5-30-automatic-entries`, on top of Phase 4.5.29,
on the owner's approval of the reassessment ("proceed as recommended, include Storytelling for Voice"):
row 3 of the revised build order, built alongside row 2 so both share one device check.

Six Advantages and Disadvantages that only recorded their cost and text now apply to every roll they
cover, with nothing to choose or tick:

| Entry | Rule (our own words) | Applies to |
|---|---|---|
| Silent (Core p.154) | +1k0 | Stealth rolls |
| Prodigy (Core p.152) | +1k0 | School Skill rolls: the named Skills of any School the character has, and any row ticked as a School Skill; weapon attacks with such a Skill too |
| Voice (Core p.155) | +1k1 | Perform: Song, Perform: Oratory and Perform: Storytelling |
| Bad Eyesight (Core p.156) | −1k1 | attacks with a weapon the sheet treats as ranged (bows, thrown weapons, firearms), and any roll using Perception (Wary's Spot ambush included); once if both |
| Disturbing Countenance (Core p.159) | TN +5, shown as −5 to the total | Social Skill rolls (Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, Temptation) |
| Anachronism (Imperial Histories p.240) | TN +5, shown as −5 to the total | Artisan, Craft and Social Skill rolls; its row reminds that only returned spirits may take it |

Never on damage. Different entries stack; the same entry on two rows applies once; only rows on the
entry's own list count. Prices are unchanged (Silent's ninja price and Disturbing Countenance's Spider value
stay with the player). The roll preview and result list each entry by name with its book page.

## Implementation and removal

One script, `src/sheet/209.9999997-feat-automatic-entries.js` (`AUTO4530`, marker `PART I FEATURE 4.5.30`,
switch `AUTOMATIC_ENTRIES_ENABLED`); one stylesheet, `src/css/59.99993-feat-automatic-entries.css` (own class,
Anachronism's row line only); one guarded seam block; two manifest entries. It reaches the dice through Phase
4.5's existing `advConfigExtendedRollModifiers` seat (the registry stays at seven) and draws the row line from
`refreshAllAdvConfigControls`. It reads, never changes, `getSchoolsList`, `schoolConcreteSkillNames` and
`isRangedWeapon`. See [ROLLBACK.md](ROLLBACK.md).

Restore point: Phase 4.5.29's build, **3,604,557 bytes**, SHA-256
`fa745f5b243121c1cd8a115c01aa7dbeaca8712b4cd58be386b9e401efec9aaf`.

## QA — 7 October 2026

Release build: **3,614,960 bytes**, SHA-256 `9ae14a17644a46c7a73482999637c3a8a48ac65c0428894a7ccd42c40cbd8f51`.

| Check | Measured result |
|---|---|
| Own harness | **41/41** (19/41 on Phase 4.5.29's build: it can fail) |
| Full combined suite | **4,536/4,536** = 4,450 + Phase 4.5.29's 45 + 41. The first run, made while two variant runs shared the machine, read 4,534: two Phase 12.3 typing checks timed out; that harness alone passes 16/16 on this build, and the rerun with nothing else running is clean (`qa/first-run-under-load-full-regression.log` kept) |
| Surgical removal | Rebuilds **byte-identical** to `fa745f5b…` (Phase 4.5.29); **4,495/4,495** retained on those bytes -- which is also Phase 4.5.29's full suite with its 45 checks |
| Remover fixtures | 23 run: **22 passed**, one skipped (Windows symlinks); includes a real removal and the proof that Phase 4.5.29's files are untouched |
| Ownership scan, inventory, removal chain | exit 0; unchanged apart from size; 11/11 |
| Variants | **16 pinned, all as expected** (discovery, then a pinned run). The first discovery's "Applies to damage" was invisible -- damage is excluded three ways -- so it was replaced by one removing every guard, which fails exactly `AE-EYESIGHT-NOT-DAMAGE` |
| Boundaries | Phase 4.5.29's harness with this release 45/45 and without it 45/45; dependency boundaries 24/24 |
| Combined checklist walk (both releases, typed, no forced recalc) | **21/21** on the local build |

## Run

```
node qa/automatic-entries-harness.js "<built sheet>"
node qa/current-suite-runner.js "<built sheet>"
python -B qa/verify-regression.py
python -B qa/verify-variants.py --jobs 2
python -B qa/test-removal.py
```

Owner checks: [MANUAL-TESTS.md](MANUAL-TESTS.md).
