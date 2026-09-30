# ROLLBACK — PART I — Phase 4.8 Ancestors

## Surgical removal (the method)

On a **scratch copy** of the Phase 0 tree, never the live one:

```bash
python "Versions/PART I — Phase 4.8 Ancestors/qa/remove-phase.py" <copy> [--dry-run] [--expect-sha SHA]
python <copy>/build/recombine.py
```

It removes exactly:

| What | Where |
|---|---|
| `src/sheet/209.99998-feat-ancestors.js` | the whole fragment, and its manifest entry |
| `src/css/59.9997-feat-ancestors.css` | the whole stylesheet, and its manifest entry |
| `ancestor-xp` | `110-modals-trackers.js`, after the Experience breakdown in `recalcAll()` |
| `ancestor-armor-tn` | `110-modals-trackers.js`, after the Current TN sum |
| `ancestor-card` | `110-modals-trackers.js`, the last line of `recalcAll()` |
| `ancestor-damage` | `100-dice-engine.js`, the end of `getWeaponDamageDice()` |
| `ancestor-damage-note` | `100-dice-engine.js`, in `rollWeaponDamage()` after Bishamon's note |
| `ancestors-seam` | `210-test-seam-and-init.js`, after Phase 7's seam block |

Each shared-file block is delimited `// PART I PHASE 4.8 BEGIN <slug>` … `// END ANCESTORS48 <slug>`.
The remover preflights everything before writing, refuses a foreign or partial marker inside or
around its blocks, refuses any retained file that still names this phase's surface
(`ANC48`, `ANCESTORS_ENABLED`, the five `ancestor…` hooks, `renderAncestorCard`, `f_ancestor`, any
`anc48` class or id), and refuses the live tree, its parents, symbolic links and hard links.

**Measured on 30 September 2026:** removal rebuilds **byte-identical** to the pre-release build,
`2e65b361aac71649c137b4f22fc37de7c5a77826ea43eb5f889a49fa47fe4763`, 3,128,232 bytes (main at
`494e4dd`). The remover's own fixtures: 20/20, no skips.

**Kill switch:** `const ANCESTORS_ENABLED = true;` at the top of the fragment. Off, there is no
Ancestor block, no field, no cost, no bonus; the harness's `--absent` expectations pass 6/6 on that
build (measured).

## What removing it does to a character

The Ancestor is saved as one hidden field, `f_ancestor`, inside the save's `fields`. A build
without this phase has no such element, so its load ignores the field: the character loses its
Ancestor on screen and the Ancestor's points drop out of Experience spent. The saved file keeps
the field; restoring the phase restores the Ancestor. No save-format step was needed, and none
was added (the trunk's format and Phase 7's `VersionManager.current()` are unchanged).

## Dependencies (all soft, all guarded)

| On | What it uses | Without it |
|---|---|---|
| Phase 4.5 (Part I), the `adv-config` seat | wraps `advConfigExtendedRollModifiers`; reads `ADV_CONFIG_ROLL_EFFECTS_ENABLED` | no automatic roll bonus; card, cost, damage and Armor TN still work (`--no-rolls` boundary, 161/161) |
| Feature 4.5.15 (Part I), the declaration registry | `RD4515.register('ancestors', …)`, `RD4515.armed()` | nothing to tick at roll time (`--no-declare` boundary, 161/161) |
| Feature 4.5.2 (Part I) | reads `D45.socialSkills` for Asako's declaration | offered on every Skill roll instead |
| Phase 12 (Part K) | `MODES12.register('#anc48Pick')` | the picker stays editable in Play (`--no-modes` boundary, 161/161) |
| Phase 11.2 (Part K) | wraps the Family and Review steps' `render` by property; `CW112.card`, `CW112.render` | chosen on the sheet only (`--no-wizard` boundary, 161/161) |
| Phase 7 (Part J) | none: this phase's `applyData` wrapper sits outside Phase 7's | — |

Trunk it reads (no declaration needed): `getSchoolsList`, `schoolConcreteSkillNames`,
`SKILL_LIBRARY`, `getTraitValueByName`, `populateInfoOverlay`, `appConfirm`, `appAlert`,
`recalcAll`, `setStatus`, `applyData` (wrapped), `#f_clan`, `#cfs_clan`, `#cfs_minorClan`,
`#f_honorPts`, `#f_taint`, `#ring_earth`, and `#cfs_appliedAffinity` as the anchor for the block.

**Removal order.** Three earlier removers refuse while this phase is present, because this
fragment names their surface (measured by applying each remover's own surface pattern to this
fragment): **Feature 4.5.15** (`RD4515`), **Phase 11.2** (`CW112`) and **Phase 12** (`MODES12`,
and the `pm12-` classes in the stylesheet). Remove Phase 4.8 first. For the two Part K phases the
shared removal chain does this automatically (all 21 releases' remover fixtures pass with this
release registered, measured). Each depended-on phase's ROLLBACK now names this phase; verbatim
copies of those files before the note are in `originals/`.

## Cross-phase fixture corrections (test-only, declared)

| Check | Before | After |
|---|---|---|
| Feature 4.5.15, `RD-NO-PRODUCTION-PROVIDER` | failed on this build, 52/53 | sets aside `ancestors` when `window.__L5R_TEST__.ANC48` is present: 53/53 with this phase and without it |
| Feature 4.5.16, `HV-PROVIDER-REGISTERED` | failed on this build, 90/91 | the same condition: 91/91 both ways |

The fourth release to extend these two conditions, after 4.5.21, 4.5.23 and 4.5.24. Their original
harnesses are in `originals/`. The shared removal chain gained one entry (this release, at the
end); its original is in `originals/QA — Removal Chain Registry/`.

Phase 11.2's wizard harness needed **no** correction. Its first run against this build read 39/43,
because its Family check reads the first card grid on the screen and its Review check the first
four summary lines. The Ancestor block was changed instead (its note is a `div`, so its own card
grid is never the screen's first; the Review line follows School): 43/43 with and without this phase.

## Restore points

| | |
|---|---|
| Phase 0 build before this phase | `2e65b361aac71649c137b4f22fc37de7c5a77826ea43eb5f889a49fa47fe4763`, 3,128,232 bytes |
| Phase 0 build with this phase | `bb5207dc5a023ddb97fa3095771463b7cc07b69894b18252c12898cdc3bec355`, 3,188,218 bytes |
| `PREROLL_MODIFIER_REGISTRY` | unchanged at seven seats |
| `window.__L5R_TEST__` | two keys added, `ANCESTORS_ENABLED` and `ANC48`, by a guarded `Object.assign` |
