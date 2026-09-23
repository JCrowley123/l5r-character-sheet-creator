# Phase 4.5.15 — Roll Declaration Registry

One general mechanism for "tick this if it applies to **this** roll" options in the roll preview. **Implemented and verified, 23 September 2026**, at the owner's decision to generalise before A06 Heart of Vengeance rather than hardwire another declaration. It ships **no production provider**: nothing on the sheet changes until an entry registers one. Heart of Vengeance (A06) is the first planned consumer, as its own release (4.5.16).

## Why

Phase 3's (Part G) roll preview already carried four hardwired per-roll declarations — Kharmic Tie (base 4.5), Maigo no Musha (4.5.10), and Ebisu and Jurojin (4.5.11) — each adding its own four hooks to the preview. Heart of Vengeance would have been the fifth copy. This release adds one registry and one set of four hooks instead; future declarations register a provider and touch no shared file.

The existing four are **not migrated**. Moving them would rewrite earlier releases' code and their removal proofs; they keep working exactly as before (all 1,353 retained checks pass). Migration stays an option for a future release that owns that change.

## How it works

An entry registers a provider through `RD4515.register(id, provider)`:

| Provider field | Purpose |
|---|---|
| `label` | Heading the options are grouped under in the preview |
| `offers(context)` | The options that apply to this roll context: `[{key, label, note?}]` |
| `modifiers(context, keys)` | What the armed options do: `[{label?, rolledDelta?, keptDelta?, totalDelta?, note?}]` |

The registry owns everything else:

- **Markup.** One "Declare for this roll" block in the preview, grouped by provider, every option unchecked when the preview opens, text escaped, and no markup at all when nothing is offered.
- **Bound to one roll.** Arming is tied to the exact roll-context object the preview opened with. The real roll reads its modifiers with that same object, so the declaration applies to that roll — and cannot reach any later roll, including one that skips the preview. The older hardwired pattern keeps a flag armed until the *next* preview opens; this one cannot leak by construction, and a check (`RD-NO-LEAK-SKIPPED-PREVIEW`) proves it with real dice.
- **Reset.** A fresh, unarmed state on every preview; cancel, the ✕ and Escape all disarm. Nothing is ever saved or written to storage.
- **Damage excluded centrally.** Never offered, never armed, never applied, whatever a provider says — damage also bypasses the pre-roll pipeline (Feature 4.5.12's finding), so an offer there would be a lie.
- **Isolation.** A provider that throws, or returns malformed offers or non-numeric deltas, offers or contributes nothing instead of breaking the roll. Registering an existing id replaces it; unregistering drops its armed options.
- **To the dice** through the existing `adv-config` registry seat, by wrapping `advConfigExtendedRollModifiers` — the registry stays at seven seats.

Every other roll kind (Skill, attack, spell, Trait, Ring, initiative, manual) is offered only where a provider says so; eligibility is the provider's decision.

## Measured QA — 23 September 2026

Restore point recorded before any edit: commit `0055ec53fa71b22ab0e71127bb869fd2c092ef6f` (Phase 4.5.14), **2,730,118 bytes**, SHA-256 `61de1d40772cb00abba41f7ab5d2d151027b3554545d04e4f8bf127d39adaa48`, **1,353/1,353**.

Final Phase 0 output: **2,739,496 bytes**, SHA-256 `1d8aa345b8c054cca212bd57a57acb49cb593bf4b7805cec0438a171537a70e4` (the manifest's pinned `expect_sha256`).

| Check | Measured result |
|---|---|
| New real-browser suite | **53/53**, probe providers registered through the test seam and removed again |
| Full combined suite | **1,406/1,406** = 1,353 retained + 53; no previous harness edited |
| Real dice | Undeclared 5k3 rolls 5 dice / keeps 3; declared +1k1 rolls 6 / keeps 4; next roll back to 5 / 3 and unticked; two providers stack (8k6 preview); manual dice-tray roll 6 / 4 declared |
| Surgical removal | **Byte-identical** to the restore point (2,730,118 bytes, `61de1d40…`); removed copy's `recombine.py --verify` exits 0; **1,353/1,353** retained on those bytes |
| Removal order with 4.5.14 | 4.5.14 removed while this stays: this suite **53/53**, older suites **1,128/1,128**. Both removed, either order: byte-identical to `1e2683d8…` (2,704,237 bytes) |
| Remover fixtures | **47 run, 47 passed, 0 skipped** (45 inherited plus a missing preview block and a foreign marker inside one) |
| Ownership scan | 13 surface names, every reference inside `PART I FEATURE 4.5.15` blocks; exit 0. 4.5.10 and 4.5.14 still exit 0; 4.5.11's report is identical to HEAD apart from shifted line numbers (its exit 1 is 4.5.12's pre-existing declared dependency) |
| Recombine / drift / inventory | Exit 0 / exit 0 / no differences (270 unique IDs, 10 sections, 26 overlays, 3 scripts, 2 styles) |
| Registry | Exactly seven seats |

### Deliberately broken builds (one `verify-variants.py --retained` run, 357 s)

| Mutation | Result | What failed |
|---|---|---|
| Kill-switch off | **14/26** | 12 checks/groups; modal-dependent groups abort |
| Own stylesheet removed | **49/53** | The four geometry checks |
| Damage exclusion removed | **51/53** | The two damage checks |
| Arming not bound to the roll context | **51/53** | Both leak checks |
| Cancel keeps the declaration armed | **52/53** | `RD-CANCEL-DISARMS` |
| New preview inherits the last declaration | **49/53** | Fresh-preview and next-roll checks |
| Modifiers never reach the dice | **45/53** | Every real-dice and preview-pool check |
| Option label not escaped | **51/53** | The two text-safety checks |
| Provider errors not isolated | **47/49** | The isolation checks; the section aborts |
| Deltas not normalised | **52/53** | `RD-JUNK-DELTAS-ZEROED` |

Found during development: the provider-name line had no wrapping, so a long unbroken name overflowed the block at every width (fixed; the no-stylesheet variant now pins it). And the kill-switch variant first reported **0/0**: an aborted section left a roll in flight that rejected after the browser closed and crashed Node before the count printed. The verifier rightly treated 0/0 as a failure; the harness now handles every in-flight roll, so a broken build reports a real failing count.

Browser geometry at 320/375/768/1440px uses fallback fonts only (the sandbox cannot load the webfonts); there is nothing to see on a device until a provider exists.

## Run

`NODE_PATH=/opt/node22/lib/node_modules node qa/current-suite-runner.js <built html>` chains 4.5.14's combined runner and this harness; a missing or 0/0 suite fails. `qa/verify-variants.py --node <node> --retained` and `qa/test-removal.py` work only in temporary copies.

## Cost

Exact token counts are not exposed to this session; none is estimated. Production surface: one JS fragment, one stylesheet, four delimited blocks in Phase 3's (Part G) preview fragment, one guarded seam block, two manifest entries.
