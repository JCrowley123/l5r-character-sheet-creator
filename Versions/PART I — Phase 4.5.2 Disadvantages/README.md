# Phase 4.5.2 — Disadvantages point release

This point release extends the existing Phase 4.5 modal/configuration work to the variable
Disadvantages in the supplied template. It is deliberately a surgical extension of the existing
sheet: the universal-spell picker remains the modal host, the existing `adv-config` roll-registry
seat remains the only seat, and the new source fragments are independently marked and removable.

## Senior QA audit (before implementation)

The original Phase 4.5 implementation was sound for its shipped Ring/severity entries and its
three original roll-effect entries, and its completion pass covered the requested variable
Advantages. It did not yet cover the Disadvantage scope in the template. The audit found:

| Area | Gap found | Resolution in this point release |
|---|---|---|
| Configuration schema | No complete Disadvantage shapes for tiered refunds, status-linked refunds, elemental rank/element, tenets, named enemies, or player toggles | Added explicit `tierPick`, `rankPick`, `elementPick`, `tenetPick`, `targetPick`, `insightDifferencePick`, `toggleModifier`, and `statusLinked` handling; incomplete/unknown payloads remain visible and inert |
| Modal flow | The existing picker handled one-choice Phase 4.5 entries; nested Disadvantage choices and free-text fields had no complete flow | Reused the same overlay/grid and added guarded multi-step Back/Next/Confirm handling, text/number fields, and malformed-step close protection |
| Resolver and XP | No resolver for the listed Disadvantage refunds, Clan adjustments, or live Status linkage | `D45.resolve` computes the approved refunds and recalculates when Clan/Status changes |
| Roll effects | No guarded Disadvantage contributor for Antisocial, tenet reminders, Phobia, Nemesis, or gates | Effects are returned through the existing `adv-config` contributor; Phobia, Nemesis, and gates are separately ring-fenced modules |
| Willpower gates | No isolated resistance-check transaction or explicit nested resource policy | The gates fragment owns the check queue, nested Luck/Void policy, failure notice, overlap lock, and cleanup |
| Persistence | The underlying save format was version 2 and unknown configurations could otherwise be treated as ordinary rows | The point-release adapter writes/accepts schema version 3, migrates known older payloads explicitly, and flags unknown/incomplete configs without a silent cost/effect |
| Registry | Adding another contributor or assuming a fixed registry length would risk Phase 1.5 | The existing `adv-config` seat is extended; no new seat is registered and the baseline suite is run with the same contributor list |
| CSS and ownership | Universal picker geometry assumptions are inherited; marker-shaped prose can be mistaken for ownership by the scanner | CSS is scoped to the Disadvantage grid/components; exact point-release markers and the removal fixtures guard ownership and collisions |
| Persistence of transient state | Willpower gate history has no character-data representation and must not leak into saves | Gate transaction state is memory-only; round-trip tests assert no gate-history fields are serialized |
| Social targeting | The authoritative Social Skill list was not available during the initial expansion | Antisocial now uses the supplied seven-skill list exactly: Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, and Temptation |

The audit also checked the existing validation and regression harnesses. The integrated runner now
executes the two original Phase 4.5 suites, this point-release suite, and every retained phase suite
from one entry point. The removal fixtures cover exact markers, EOL/byte preservation, manifest
ordering, foreign-marker refusal, path safety, and the no-extra-registry-seat contract.

## Approved rules and implementation boundaries

| Disadvantage | Configuration and refund | Implemented effect/boundary |
|---|---|---|
| Antisocial | 2/4 points; Crab explicitly refunds 3/5 | −1k0/−1k1 applies to Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, and Temptation |
| Blackmailed | Current Status Rank, recalculated on Status changes | Narrative only |
| Cast Out | 1/3 points | Informational Glory-as-Infamy reminder |
| Compulsion | 2/3/4 points | Informational reminder: Willpower Trait Roll TN 15 at 2 points, +5 for each additional point, maximum TN 25 at 4 points; player decides when it applies |
| Consumed | Exact supplied tenet values; Spider +1; Insight uses a School Skill | Supplied tenet notes/effects; conditional parts are informational or guarded Void/dice hooks, with no invented rules |
| Elemental Imbalance | Free positive integer rank; 2 XP per rank; selected element must not be deficient; Shugenja only | Before a matching elemental non-Maho spell, isolated Willpower TN `15 + 5 × rank`; failure reports the narrative consequence and the spell roll proceeds |
| Enlightened Madness | 4/6 points, then Ring/Skill/Tattoo target | Isolated Willpower TN 20/30; failure cancels the action and reports eight-hour GM control; a spell slot already consumed is not refunded; Tattoo remains a manual acknowledgement |
| Failure of Bushido | Exact supplied tenet values; Ninja +1 | Supplied tenet consequences as guarded pipeline/informational reminders |
| Obligation | 3/6 points | Narrative reminder only |
| Phobia | 1/2/3 points plus player `Active / confronted` toggle | Ring-fenced guarded global hook adds TN `5 × rank` to supported non-damage rolls; damage is explicitly excluded |
| Sworn Enemy | Free-text named enemy, non-negative Insight difference, optional purchased Kharmic Nemesis (+2), active toggle | Badge preserves the name; active purchased Nemesis suppresses all Void-spend options while opposing that enemy |

The schema exposes the new point-release types together with the already-shipped Advantage shapes so
QA and migrations can distinguish known data from a future unknown type. Configurations are stored on
the entry as structured JSON and round-trip through the existing save/load and JSON import/export
paths. A configured row owns its calculated refund; an incomplete or unknown row is visibly marked
and contributes zero until corrected.

## Validation and regression evidence

Run the integrated suite from the point-release directory (the environment variables simply point
the runner at the bundled browser/runtime):

```text
node qa/current-suite-runner.js <path-to-l5r-character-sheet.html>
```

The point-release browser suite covers XP/refund arithmetic, Clan and Status live updates,
configuration validation, narrative text, Phobia and Nemesis toggles, isolated Willpower gate flows,
Luck/Void nesting, modal cancellation and phone geometry, JSON round-trips/migration/unknown data,
registry preservation, and uncaught-error detection. The latest run is recorded as **163/163** for
the point-release suite, including the authoritative-list and non-Social boundary checks.

The integrated runner folds that suite into the current validation set. The retained totals are:

| Harness | Result |
|---|---:|
| Phase 4.5 original | 51/51 |
| Phase 4.5 Advantages | 48/48 |
| Phase 4.5.2 Disadvantages | 163/163 |
| Phase 1.5 pipeline | 35/35 |
| Phase 3 preview | 50/50 |
| Phase 4 explanation | 22/22 |
| Phase 1 UI | 9/9 |
| Phase 1.6 wounds | 23/23 |
| Phase 2 sidebar | 19/19 |
| Phase 5 validation | 25/25 |
| Phase 8 casting | 36/36 |
| Phase 9 Clan UI | 17/17 |
| Spell slots visibility | 6/6 |

The regression matrix is intentionally risk-led:

| Area | Risk | Tests |
|---|---|---|
| XP refunds | High | All tiered, Status-linked, Clan-adjusted, tenet, rank, and Insight-difference refunds; unrelated XP remains unchanged |
| Roll modifiers and gates | High | Antisocial seven-skill boundary, tenet hooks, Phobia guarded global penalty, Nemesis Void suppression, Elemental Imbalance and Enlightened Madness transactions |
| Toggles | High | Phobia active/confronted and purchased Nemesis activity, including immediate reversal |
| Persistence | Medium | Schema-3 migration, every config and toggle, pip/resource data, unknown-config visibility, and non-persistent gate history |
| UI | Medium | Shared modal open/close, nested steps, free-text/number fields, badges, warnings, tooltips, narrative notices, and 375px geometry |
| Removability | High | Exact-marker ownership, independent component scopes, byte-identical full removal, unchanged retained harness results, and registry-seat preservation |

The authoritative Social Skill list is now encoded as an exact, ring-fenced seven-skill allowlist;
no other skills receive the Antisocial penalty.

## Removal proof

The removable source is split into four exact point-release scopes: core (`4.52`), Phobia (`4.521`),
Sworn Enemy/Nemesis (`4.522`), and Willpower gates (`4.523`). `qa/remove-phase.py` refuses the live
tree, foreign/sibling markers, malformed spans, duplicate manifest entries, path escapes, and a wrong
historical hash before changing anything. `qa/test-removal.py` passes **23/23** fixture checks.

On a fresh disposable copy, removing all four scopes and rebuilding produced the recorded pre-
expansion artifact: **2,428,891 bytes**, SHA-256
`4355dec4b219883bb041e48a02773af3006d762fa6b48f35b9c273d429553481`. The retained suites then read
identically: 51/51, 48/48, 35/35, 50/50, 22/22, 9/9, 23/23, 19/19, 25/25, 36/36, 17/17, and 6/6.
Independent fresh-copy removals, measured before the Social Skill list was added, also succeed for Phobia (JS + CSS: 2,472,636 bytes,
`03983128592f6b892d94737c579bf7d743e2bc0565f7d44b1941b8d38594d92f`), Nemesis (JS + CSS:
2,472,177 bytes, `f46cb21a9bcc302f118d8e128566c508dd59878064c0f862ab76d3912fa83ab0`), gates (JS:
2,464,920 bytes, `5e4242dd148910bd2d882d9becfcc220e8791690d8e1bf5fa93c799aa9f823ef`), and core
(JS + CSS: 2,446,228 bytes, `53ed71d149c00ad9c9dbf2540701ccbedbf7292a2dc593843ca0add7ec452501`). Each
projected build was verified byte-identically by the recombiner. No CSS, JavaScript, schema
fragment, or registry entry is left behind by those scopes.

The final unreduced build is **2,476,062 bytes**, SHA-256
`27b57eff316ee6f34f528e055a8d8adda6bb0d60ed7a951519ec12af35122ff2`. This point release is
complete for the approved scope and stops here pending explicit approval for any further phase.
