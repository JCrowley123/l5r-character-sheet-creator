# Phase 4.5.26 — Dice Rolling Entries

Built on `codex/phase-4-5-26-dice-entries`, 2 October 2026. Merged to `main` on
the owner's word, 3 October, at `72523fe`. Deployed and verified; iPhone check
still owed. The companion Rank 0 bugfix is a separate layer (`b9a03bc`).

| Entry | Effect | Core Rulebook |
|---|---|---|
| Crab Hands | An untrained Weapon Skill rolls as Rank 1 | p. 147 |
| Crafty | An untrained Low Skill rolls as Rank 1 | p. 147 |
| Sage | An untrained Lore Skill rolls as Rank 1 | p. 153 |
| Sensation | An untrained Perform Skill rolls as Rank 1 | p. 153 |
| Gaijin Name | Each die in a Social Skill roll explodes at most once | p. 159 |

The four effects add one rolled die and enable normal explosion for that roll.
They cover the table, the Untrained Skills list, and relevant weapon attacks.
They never buy a Rank, add XP/Insight, or change prices. Overlapping effects grant
Rank 1 only once; existing Soul of Artistry continues to work. Weapon/Low families
come from the sheet's Skill library, including the three Weapon (Low) Skills.
Lore and Perform include colon and parenthesized specializations.

Gaijin Name uses the existing Social list: Acting, Courtier, Etiquette, Perform,
Sincerity, Intimidation and Temptation. Its preview and result explain the limit.
An untrained die still does not explode unless another rule enables it. A
bounded generator stops after the first extra throw; it never draws an unlimited
chain and then clamps the result. The rule survives Luck/Unlucky/Dark Paragon's
shared pool-reroll path, ancestor reroll helpers and Emphasis, without affecting
the next unrelated roll. Damage, Trait/Ring, Spell and manual rolls are excluded.
The original result retains its explosion policy across rerolls.

## Implementation and dependencies

One owned fragment, `209.999998-feat-dice-entries.js`; marker
`PART I FEATURE 4.5.26`, switch `DICE_ENTRIES_ENABLED`, object `DICE4526`.
Two delimited shared blocks: `dice-pool` in `130-round-and-pipeline.js` (guarded
after the Void override resolves) and `dice-entries-seam` in `210`.

Requires the base Advantages configuration roll hooks and common Luck reroll
helper (Phase 4.5, Part I). Gaijin Name additionally requires `D45.socialSkills`
from the Disadvantages layer (Phase 4.5.2, Part I); its absence is guarded.
Ancestor hooks are optional and guarded. Soul of Artistry, Play/Management and
the separately removable Rank 0 fix are not prerequisites. Corresponding parent
rollback notes declare the new dependency. No stylesheet, markup, registry
contributor or persistent schema is added.

## QA

- Initial harness: 18/103 on main, before production edits. The final harness
  includes seven additional title, list-placement, flat-bonus and persistence
  assertions: 22/110 on original main and 110/110 on the release.
- Twelve mutation variants: discovery, reviewed exact failure IDs, then a pinned
  rerun; all match `qa/expected-failures.json`.
- Three boundaries each pass 110/110: Rank 0 fix removed, Soul of Artistry
  disabled, Play/Management disabled.
- Each layer's removal fixtures: 20 passed, one Windows symlink fixture skipped.
- Full retained suite: **3,840/3,840**, exit 0 (3,711 retained + 19 fix + 110
  entries). No earlier harness was changed. See `qa/full-suite.log`.
- Both removal orders restore original main byte for byte. The fix alone stays
  19/19 after entry removal; entries stay 110/110 with the fix removed.
- Structural inventory unchanged: IDs, styles, sections, modal count, tag balance
  and all non-sheet scripts. All 504 original seam keys remain, exactly four
  guarded keys are added, and all seven registry contributors are unchanged.
- Build recombination and both ownership scanners passed. Preview/result fit at
  390px and 1440px; all four screenshots inspected. See `qa/final-proof.log` and
  `qa/preview-390.png`, `qa/result-390.png` (desktop counterparts also retained).

Build: 3,489,469 bytes, SHA-256
`7f57135bddb8c4c1bc306c8841f52ed0eb9c03292f873e7302a8b13ccda8bd49`.
Removing this layer returns the fix-only build, 3,480,934 bytes, SHA-256
`8508e42f51a3c28bb3415557309d323a9448997b12d56e66d9ea56207cd65178`.
Removing both restores main's 3,479,860 bytes,
`319f4f48b81b132b696fdf0bfcf330e2ce9fb2faa6d45b5b6fb03c0556c80f7c`.

Run `node qa/dice-entries-harness.js <sheet.html>` for this feature,
`node qa/current-suite-runner.js <sheet.html>` for all retained suites,
`python -B qa/test-removal.py` for the remover, and
`python -B qa/verify-variants.py --jobs 3` for pinned variants. Run the full suite
alone: the retained Dark Paragon geometry check is timing-sensitive under load.

## Scope and next work

Live verification, 3 October: **129/129** (fix 19/19, entries 110/110). Deployed
page: 3,495,118 bytes, SHA-256
`251d908151f2862f3553e4e59b7282fb701335c92dff866c4a26c6f997080f13`.
The page matches the Phase 0 build plus the committed PWA header exactly; its
service worker matches build `545ec25de79b1c69`. Run `qa/verify-live.py` to repeat
the check. Evidence: `qa/live-verification.json` and `qa/live-qa.log`. This compares
Git's PWA inputs, since older Windows working files have CRLF while their deployed
Git blobs have LF. No application change was needed.

This release implements the five printed rules plus the separately owned fix.
It also covers untrained attacks and the existing reroll routes, which the
kickoff's Skill-table summary did not explicitly include. The remaining audit,
D06/Hotei, Advanced Schools and the deferred interface reviews are not built here.
Next proposed: Core's nine Advanced Schools, then the remaining two releases of
Phase 4.7 together; then the audit's nine situational roll-preview entries after
the outstanding scope rulings. No new rules ruling was required for this release.

Usage read after QA: Codex weekly 14% and five-hour 89% used, from the fresh
0%/0% build baseline. This is account-wide usage through QA, before the final
commits, merge and device review; it is separate from Claude history.

See [MANUAL-TESTS.md](MANUAL-TESTS.md) and [ROLLBACK.md](ROLLBACK.md).
