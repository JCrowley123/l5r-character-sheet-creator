# PART K — Phase 11.2: Creation Wizard

The first stage of the creation wizard, built 24 September 2026. It is Phase 11's second part,
numbered 11.2 so it has its own removal marker (Export to PDF is 11.1). Part K's second folder;
see "Folder" below.

**The owner chose full screens over a guided mode on the sheet.** The wizard is its own set of
screens, like D&D Beyond's builder. **It adds no rules.** Every choice is carried out by the
sheet's own controls, and every list of options is read from the sheet, so the wizard cannot
disagree with the sheet it fills in. A harness makes the same choices once through the wizard and
once by hand on the sheet, and requires the saved data to be identical.

## The steps

"Create New Character" on the Characters screen (Phase 11) makes a saved, blank character and
opens the wizard over it.

| Step | What the player sees | What actually does it |
|---|---|---|
| **Name** | A name field; Next stays locked until it has one | `#f_name` and its own input event (the header follows) |
| **Clan** | A card per Clan, with its mon for the seven Great Clans. Minor Clans open a second list | `#cfs_clan` / `#cfs_minorClan` and their change events |
| **Family** | A card per Family with its +1 Trait; applied as it is tapped. "No Family is listed" for the Brotherhood | `#cfs_family` then the sheet's own **Apply Family** |
| **School** | A card per School with its Trait and Honor; applied as it is tapped, then its Skills, Outfit and Techniques | `#cfs_school` then the sheet's own **Apply School**, which still asks its own Affinity, Deficiency, Honor and specialisation questions. Cancelling one leaves the School unapplied |
| **Rings & Traits** | − value + for every Trait and Void, and the experience left. − stops at the free points the Family and School gave | Each Trait input's own input event (so the Ring and XP follow), and the sheet's own Void stepper |
| **Review** | Name, Clan, Family, School, Rings, XP left, and the sheet's own check. **Finish** | Phase 5's (Part J) `validateCharacter()` |

**Gating.** Next unlocks when the step is done and Phase 5's validator reports no **error** for
it: the Caster lock on School; the Trait range, the free-point floors and overspending on Rings &
Traits. Finish needs no error at all. Warnings and notes (unspent XP, the School's free Skill
choices) are shown and never block. The reason Next is locked is always written above it.

**Going back.** Back keeps what was applied. Changing Family or School replaces the old one,
because the sheet's own Apply buttons already work that way. Changing **Clan** after a Family or
School was applied needs something the sheet does not have: a way to take a Family or School
away. So it asks, then starts over through the sheet's own `resetToBaseline()`, keeping the name.

**Exit** asks, then closes the wizard. The character stays saved in the Characters list, unfinished.

## Not in this stage

**Skills** (the School's free Skill choices, and buying Skills) and **Advantages/Disadvantages**
are the next stage. Until then, Review says to finish them on the sheet after Finish.

## Folder

Part K now has two folders, so by the convention it should get a `Part K — App Shell` wrapper.
It has **not** been made: Phase 11's remover and runner find the Phase 0 tree and the previous
runner by counting parent folders. That is the same blocker that keeps Part I unwrapped, and
fixing it is its own small piece of work. Recorded here and in CLAUDE.md rather than done in
passing.

## QA

Measured 24 September 2026, headless Chromium at 390 × 844, `NODE_PATH=/opt/node22/lib/node_modules`.

| Measure | Result |
|---|---|
| Own suite | **43/43** (`qa/wizard-harness.js`): every step, every gate, the School's own question and its cancel, the Trait floor and overspend, Review against `validateCharacter()`, Back, the Clan start-over, Minor Clan, the Brotherhood, Exit, and **CW-SAME-AS-BY-HAND** |
| Phase 11's suite | **70/70** with this phase present, after one conditional fixture change (see ROLLBACK), and **70/70** on the build with this phase removed (`6043dabb…`) |
| Combined | **2,236/2,236**: 2,123 retained + 70 (Phase 11) + 43 new (`qa/current-suite-runner.js`) |
| Build | **2,985,043 bytes**, SHA-256 `9244163ea532004707a2c8d5c19bf8cde4ecc0d5a39f3731e7ea3d51ba6a6ec0` |
| Surgical removal | **Byte-identical** to `6043dabb…` (2,958,319 bytes, commit `2b3b8c4`) on the first attempt; `manifest.json` and `210-test-seam-and-init.js` identical to that commit |
| Removal order | Phase 11's remover **refuses** while this phase is present; this phase then Phase 11 reaches `864c5134…` exactly |
| Remover fixtures | **15/15** (`qa/test-removal.py`), no skips |
| Ownership | `qa/feature-dependencies.py` exits 0 |

**Each part is load-bearing** (`qa/verify-variants.py`):

| Variant | Own suite | Fails |
|---|---:|---|
| Previous build (phase removed) | 0 of 5 scenarios | every scenario: there is no wizard to open |
| Switch off | 0 of 6 | `CW-ENABLED` and every scenario: Create goes back to a blank saved character |
| Trait set without its input event | 42/43 | `CW-OVERSPEND-BLOCKS`: the sheet never recalculates XP, so the overspend goes unseen |
| No start-over on a new Clan | 39/40 | the Clan-change scenario, waiting for a question that never comes |
| School step does not wait for its questions | 21/25 | `CW-SCHOOL-QUESTION-ABOVE`, and every walk that goes through the School |
| No validator gate on Traits | 42/43 | `CW-OVERSPEND-BLOCKS` only |
| Finish not gated by errors | 42/43 | `CW-FINISH-BLOCKED-BY-ERROR` only |
| Family chosen but not applied | 18/22 | `CW-FAMILY-APPLIED`, and every walk past the Family |
| No stylesheet | 42/43 | `CW-COVERS-VIEWPORT` only |
| Phase 5 (Part J) validator absent | 40/43 | the three checks that come from the validator (overspend gate, Finish gate, Review list); the walk still completes |

**The first variant run found a blind spot.** With no stylesheet, all 42 checks still passed:
nothing checked that the wizard covers the screen. `CW-COVERS-VIEWPORT` was added, and the
variant now fails on it alone. Phase 5 has no remover script, so its absence is simulated by
switching the wizard's validator lookup off.

## Found while building

- **Two headless screenshots caught two layout faults** before any check did. Trait names sat
  under their − buttons in a two-column layout at phone width; the grid is now one column below
  about 560px, set by a minimum card width rather than a measured text width. The School summary
  ran its lines together ("High SkillOutfit") because it copied the sheet's info box as plain
  text; it now lays out the library's own fields one per line.
- **Phase 11's create check needed one conditional change**, declared in ROLLBACK.

## Not verified

- **Not tried on a real device.** Headless Chromium only, with fallback fonts.
- Only the Isawa Shugenja's Affinity question was driven end to end. Chuda's Deficiency, the
  Fudoist Order's Honor and specialisation questions use the same waiting code but were not run.
