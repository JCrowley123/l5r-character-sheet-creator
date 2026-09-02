# L5R 4e Character Sheet Audit

A six-phase structural and experiential review of the single-file Legend of the Five Rings 4th Edition character sheet, conducted against the running build with every figure measured rather than estimated.

| | |
|---|---|
| **Build reviewed** | `Versions/PART C — Feature 6 Ammo Tracking/l5r-character-sheet part C feature 6 ammo.html` |
| **Size** | 9,648 lines / 1,146,823 bytes |
| **Reviewed** | 29 August 2026 |
| **Method** | Build served locally and driven live; contrast ratios computed from palette tokens; hit targets measured via `getBoundingClientRect`; all behavioural claims verified against source |

---

## Verdict

This is a carefully engineered application with genuine architectural achievements — and a set of defects concentrated almost entirely in its oldest code.

The pre-roll modifier registry composed six combat features without any of them modifying another. The revert machinery precisely undoes its own contributions. The comments explain *why*, not *what*. Body text clears WCAG AAA at 12.43:1, and the build carries zero motion risk.

The problems cluster in three places: a chargen flow that will produce an illegal character without warning, an accessibility layer that leaves screen-reader users unable to operate the sheet at all, and a QA document — the project's de facto specification — that has drifted from the code it describes in four confirmed ways.

### At a glance

| Measure | Value |
|---|---|
| Clicks to produce an illegal character, unflagged | **3** |
| Live regions — feedback reaching assistive tech | **0** |
| Roll actions unreachable by keyboard | **13** |
| `.focus()` calls across 14 modals | **1** |
| Body text contrast ratio | **12.43** (clears AAA) |
| Assertions in the existing QA suite | **596** |

---

## What is working

**The pre-roll modifier registry.** The build's best decision, proven six times over. Two deliberately separate channels solve two different problems: `rolledDelta`/`keptDelta` apply *before* the Ten Dice Rule so the rule sees the real modified pool, while `totalDelta` folds into the result bonus so it survives every die click. Registered contributors: `range@20`, `arrow@25`, `stance@30`, `wounds@40`, `void@50`.

**Rules as data, not code.** Around twenty frozen reference libraries encode the 4e ruleset — skills, weapons, spells, schools, stances, void expenditures, wound penalties, range rules. Most rules corrections are data edits rather than code changes, which is why six features could be added without destabilising the core.

**Precise revert architecture.** Apply School records every row it creates or bumps, so its revert undoes exactly its own contribution. Verified live: applying Asahina Shugenja over Hida Bushi cleanly removed six skills, six outfit items, one technique and the granted Stamina.

**Recognition over recall.** The Insight formula and its rank breakpoints are printed inline. XP decomposes into six named categories. Mastery notes highlight the rank already reached. The roll modal shows raw notation, the Ten Dice transformation, per-die explosion chains and a per-contributor breakdown — the player never does arithmetic.

**Other strengths.** Zero `@keyframes` and no autoplay, so there is no seizure or vestibular risk. Error messages are specific and actionable, and the storage-failure path offers a JSON export so work is not lost. The persistence contract holds — exactly 42 `f_` fields, as documented. The QA suite carries 596 assertions, per-feature harnesses and rollback ladders.

---

## Critical findings

### F-01 — An illegal character is reachable in three clicks

**Severity 4 · Phase 4 · Error prevention**

Clan and family are written only by *Apply Family*; school only by *Apply School*. Nothing cross-validates the pair. Changing the clan dropdown commits nothing and reverts nothing, so the picker and the character silently diverge — and the next Apply produces a character that cannot exist in Rokugan.

```
3. Apply School  -> clan=Crab  fam=Hida  school=Hida Bushi        legal
4. Clan > Crane  -> picker: Crane/Asahina | identity: still Crab   no warning
5. Apply School  -> clan=Crab  fam=Hida  school=Asahina Shugenja   ILLEGAL
                    honor 6.5 (Crane) | STR 3 (Crab) | AWA 3 (Crane)
                    skills: Calligraphy, Etiquette, Lore: Theology,
                            Meditation, Spellcraft
```

A Crab Hida bushi family holding a Crane Asahina Shugenja school, produced through the ordinary UI with no error at any step. The revert itself worked correctly — the defect is the absence of cross-validation, not a failure of the revert.

### F-02 — No feedback in the application reaches assistive technology

**Severity 4 · Phase 3 · WCAG 4.1.3 (AA)**

Every confirmation and every error — save results, the Apply School summary, all thirty-plus failure messages — writes to a single plain `<div>` with no live-region semantics, then clears itself after 3.5 seconds. A screen-reader user receives no confirmation that any action occurred and no notification of any error.

### F-03 — Ring and Trait rolls cannot be reached by keyboard

**Severity 4 · Phase 3 · WCAG 2.1.1 (Level A)**

Ring rolls bind to a `<div>` and Trait rolls to a `<label>`, each with a delegated click handler, no `role`, no key handler, and no `tabindex` — which appears zero times in the entire file. Five Rings and eight Traits are mouse-only. Skills and weapons, by contrast, use real buttons.

### F-04 — Fourteen modals with no focus management or dialog semantics

**Severity 4 · Phase 3 · WCAG 2.4.3 (A), 4.1.2 (A)**

The whole build contains one `.focus()` call. No modal moves focus in on open, traps it, or restores it on close; none carries `role="dialog"` or `aria-modal`. A keyboard user who opens the roll modal keeps focus behind the overlay and tabs invisibly through the page underneath it.

### F-05 — Load and Import destroy unsaved work without confirmation

**Severity 4 · Phase 2 · User control**

Both call straight through to `applyData()`. The two adjacent toolbar buttons — New Blank and Delete — both confirm first. Three buttons sit side by side; two are guarded and the third is equally destructive and unguarded. There is no dirty-state indicator and no unload guard anywhere in the build.

### F-06 — The QA suite has drifted from the code it specifies

**Severity 3 · Phase 1 · Systemic**

Four confirmed divergences:

| Section | Claim | Actual |
|---|---|---|
| §1.4 | Contributors are `range@20`, `stance@30`, `wounds@40`, `void@50` | Five exist — `arrow@25` is absent from the document |
| §1.1 | Export table grouped by feature | No Feature 6 row, though the seam exports ~28 of its symbols |
| §1.5 | "Feature 5 registered `technique@60`", revising the assertion total on that basis | Feature 5 was skipped; no such contributor exists |
| §18 | "Nothing new is persisted" | Feature 6 persists `weapons[].arrowType` |

This matters because §1 is what a future contributor reads first.

### F-07 — Ring inputs solicit an edit the system silently discards

**Severity 3 · Phases 2 & 4**

The helper text invites the player to adjust Rings freely for kata, advantages or void effects. But every recalculation unconditionally recomputes each Ring as the lower of its two Traits, so any manual edit is destroyed by the next keystroke anywhere on the sheet. The interface asks for input it will not honour.

### F-08 — Ammunition is keyed to a free-text equipment name

**Severity 3 · Phases 1 & 5**

Arrows are located by parsing the editable item-name field of Equipment rows. Renaming that row silently severs a bow from its ammunition; naming an unrelated item "Arrow…" silently enrols it into tracking. Equipment rows already carry structured dataset metadata elsewhere, so the pattern for fixing this exists in the same factory.

### F-09 — A required action lives only in a 3.5-second message

**Severity 3 · Phases 2 & 4**

Apply School reports how many "choose one" school skills remain for the player to pick — one for Hida Bushi, two for Asahina Shugenja, both measured. The count is computed, announced once, and discarded. No badge, no placeholder row, no persistent list.

### F-10 — Cause and effect never appear on the same screen

**Severity 3 · Phase 4 · Cognitive load**

Traits are edited in section 3, but the Insight and School Rank they drive are displayed in section 2 above, and the Techniques they unlock appear in section 6 below. The causal chain runs backward through a ten-section scroll with no navigation.

---

## Measured data

### Colour contrast

| Foreground on background | Ratio | AA normal | AA large | Used for |
|---|---:|---|---|---|
| ink on paper | 12.43 | PASS | PASS | Body text — also clears AAA |
| ink-soft on paper | 6.47 | PASS | PASS | Helper text |
| shu on paper | 5.56 | PASS | PASS | Accent text |
| gold on card | 3.08 | **FAIL** | PASS | Free-emphasis badge at 0.6rem |
| gold on paper | 2.81 | **FAIL** | **FAIL** | Weapon note links · all focus rings |
| gold-soft on paper | 1.84 | **FAIL** | **FAIL** | Badge borders |
| **line on paper** | **1.54** | **FAIL** | **FAIL** | **Every input, select and textarea border** |
| air element on paper | 3.05 | **FAIL** | PASS | Elemental labelling |
| earth element on paper | 4.27 | **FAIL** | PASS | Elemental labelling |
| fire element on paper | 4.36 | **FAIL** | PASS | Elemental labelling |
| water element on paper | 4.35 | **FAIL** | PASS | Elemental labelling |

The border token is the broadest single failure: at 1.54:1 the boundary of every form field on the sheet is effectively invisible to low-vision users. The focus rings are the sharpest irony — the accessibility feature itself sits below the 3:1 a focus indicator requires.

### Hit targets

WCAG 2.5.8 requires 24 × 24 CSS pixels.

| Control | Measured | Result |
|---|---|---|
| Trait roll trigger | 60 × 16 | **FAIL** |
| Stance info button | 22 × 17 | **FAIL** |
| Skill info button | 22 × 22 | **FAIL** |
| Void info button | 22 × 22 | **FAIL** |
| Void pip | 26 × 26 | PASS |
| Row delete | 27 × 29 | PASS |
| Dice roll button | 36 × 28 | PASS |
| Trait input | 44 × 29 | PASS |
| Stance tile | 220 × 91 | PASS |

The 16-pixel-tall trait trigger fails twice over: it is both below the minimum target size and the keyboard-unreachable control from F-03.

### Typography and structure

- Smallest text: **0.55rem ≈ 8.8px** — the dice explosion chain in the roll modal, which carries real mechanical information
- **31 declarations below 0.7rem** (11.2px), most combining uppercase with letter-spacing
- All sizes in `rem`, and the viewport meta permits pinch-zoom, so SC 1.4.4 is satisfied
- Heading hierarchy is clean (h1 → h2 → h3, no skips), but sections are `<div>` elements, so headings carry the entire structural burden
- Total ARIA in 9,648 lines: **20 attributes** — 14 `aria-hidden`, 4 `aria-label`, 1 `aria-pressed`, 1 `role="img"`

---

## Improvement plan

### Interface and experience

- Route Load and Import through the confirmation component New Blank already uses
- Persist the outstanding "choose one" skill in the Schools panel, which already renders durable per-school state
- Make the status line sticky — one element funnels every message, so this fixes off-screen reporting globally
- Expose the existing reverts as explicit Undo controls beside each Apply button
- Mark the school preview card as uncommitted until Apply, applied afterwards
- Resolve the Ring contradiction — readonly, or an honoured override following the weapon rows' existing manual-flag pattern
- Add type-to-filter to the 61-school and 76-advantage lists, reusing the datalist pattern already present for weapons
- Add a dirty-state indicator and section navigation

### Accessibility

- Make the status region a live region — polite for confirmations, assertive for failures
- Raise the border token to at least 3:1 — one value, every field on the sheet
- Darken the focus-ring colour to the palette's existing dark gold at 7.91:1
- Convert Ring and Trait triggers to real buttons — this resolves keyboard access, target size, label-in-name and the invisible affordance at once
- Ship dialog semantics and focus management together, via one handler attached where the modal-stacking observer already lives
- Bind Escape once for all overlays — the stance modal already demonstrates it
- Replace gold as a text colour in the three places it is used as one
- Add a landmark and skip link; enlarge the four undersized targets; honour reduced-motion

### Interaction flow

- Cross-validate clan against school at the Apply School commit, using the same cancel-safe gate the affinity and deficiency elections already use
- Have Apply School write the clan field, so identity can never name a clan the school does not belong to
- Make clan change either revert or prompt
- Move Insight and School Rank adjacent to Rings and Traits, collapsing the backward causal chain
- Announce technique unlocks — the unlock function already returns an outcome
- Name the Trait pair in Ring-gated lock reasons, so "needs Air 3" also says Reflexes and Awareness
- Surface stance and void contributions at the TN and Initiative fields
- Offer "use this arrow again" — the weapon row already stores the answer

### Architecture

- Replace the four type-check guards so a broken splice fails loudly instead of computing zero bonuses
- Extract the shared promise-modal scaffold — six near-identical blocks today, a seventh with the next feature
- Anchor arrows to dataset metadata rather than display text
- Remove the duplicated recalculation paths on skill name and equipment quantity
- Split the Identity section, which currently carries four unrelated concepts
- Reconcile the QA suite's four drifted sections with the shipped build
- Adopt version control — the single highest-leverage process change available

---

## Impact and effort

### Start here — high impact, low effort

1. Live region on the status element — unblocks every message for assistive tech
2. Border token to 3:1 — one value, every input on the sheet
3. Confirmation on Load and Import — existing component, closes the worst data-loss risk
4. Focus ring to the existing dark gold — six rules already correct
5. Remove the duplicate recalculation paths — pure waste, and call-site-only so it respects the freeze
6. Gold to dark gold on three text usages
7. Sticky status line — CSS alone
8. Enlarge the four undersized targets

### Then — medium impact, medium effort

Clan-to-school warning gate · expose Undo Apply School and Family · persist the outstanding "choose one" · resolve the Ring input contradiction · Ring and Trait triggers become buttons · anchor arrows to structured data · type-to-filter on the three oversized lists · announce technique unlocks · section navigation and dirty-state indicator.

### Plan for — high impact, high effort

- One cross-cutting modal handler delivering dialog semantics, focus management and Escape across all fourteen overlays
- Decompose the central recalculation function and remove the silent-degradation guards
- Relocate Insight and School Rank; split the Identity section
- Adopt version control and reconcile the QA suite

### Horizon — long-term structure

- A technique contributor making school techniques mechanically executable rather than descriptive
- Shared row-factory and modal abstractions
- Debounced or coalesced recalculation
- Kiho, Rituals and Ancestors modules built on the proven registry pattern

---

## Risks in the work itself

### Technical

- The central recalculation has 47 call sites and is order-critical; the QA suite mitigates this, but must be reconciled first since it currently encodes a feature that does not exist
- Nine frozen functions must not change, though re-pointing their call sites is explicitly permitted
- Any new hidden state must avoid the persisted-field prefix or it silently joins the save schema
- No version control means every change is a manual file copy with no diff and no bisect

### Experience

- **Clan validation must warn, not forbid.** Ronin, Imperial families and the Different School advantage are all legitimate cross-clan cases — a hard block would break valid characters
- Making Rings readonly removes a capability players may believe they have, even though it currently does nothing
- Confirmation on Load adds friction to a frequent action, which is why the dirty-state indicator should ship alongside it
- Reordering sections changes muscle memory and the print layout

### Accessibility

- Dialog semantics without focus management is worse than neither — it announces a dialog the user cannot reach. These must ship together
- A focus trap without an escape path creates a genuine keyboard trap, a Level A failure worse than today's state
- Live-region politeness matters: routine confirmations polite, failures assertive, or the sheet talks over the player mid-combat
- Converting divs to buttons changes the accessibility tree and may break harnesses that query by class

---

## Suggested review phases

**Verification and correctness** — a data-integrity sweep for other silently permitted invalid states beyond clan and school; QA reconciliation of the four drifted sections before further features rely on them; multi-school edge cases under adversarial sequences.

**Quality and reach** — an accessibility roadmap sequenced so semantics and focus land together, verified against real screen readers; responsive and reflow testing at 320px, where the eight-column skills table is the likely failure point; performance profiling of per-keystroke recalculation on a Rank 4–5 character; print fidelity, since the print stylesheet is a first-class feature that was not exercised here.

**Process** — tooling: version control, automated frozen-function verification, and a build script replacing manual splicing.

**Design** — techniques as modifiers: the design work for an executable technique contributor, including how it avoids widening the central recalculation.

---

## Expansion pathways

The pre-roll registry has absorbed six features without any of them modifying another. That makes it the natural spine for everything below — and makes the readiness question less about difficulty than about which subsystems already have their surrounding machinery in place.

| Module | Readiness today | Fit |
|---|---|---|
| **Kiho** | **Six monk schools already ship** — Togashi Tattooed Order, Hoshi Tsurui Zumi, Hitomi Kikage Zumi, Asako Henshin, Kuni Witch-Hunter, Order of the Spider Monks — with no Kiho support at all. The clearest gap in the build. | Excellent |
| **Rituals** | Shugenja support is mature — slots, affinity and deficiency, maho, universal spells, scroll gating. Rituals are the missing half of a subsystem that already exists. | Strong |
| **Ancestors** | Chargen-time grants with point costs — structurally identical to Apply Family and Apply School, including the revert pattern. | Excellent |
| **Techniques as modifiers** | The design is already anticipated in the QA suite. Roll effects fit the registry cleanly; TN and Initiative effects require touching the central recalculation. | Blocked on recalc |
| Item crafting | No precedent in the build; would need new state shapes. | Weak |
| NPC / adversary sheets | Needs a reduced schema and a different layout. | Separate product |

**Techniques are the largest modelling gap.** School Techniques are descriptive text only — the sheet says so outright. They are what distinguishes one school from another, and they are the one thing the sheet does not mechanise. The obstacle is structural rather than conceptual: roll effects fit the registry, but TN, Initiative and wound effects require widening the central recalculation, joining Stances and Void behind the same silent-degradation guards. That is the strongest argument for fixing the recalculation before this feature, not during it.

**The save format has no version field.** Every stored character is untagged, so a future format change has nothing to migrate against. Adding a version marker costs almost nothing today and becomes impossible to add retroactively once characters exist in the wild. This is the prerequisite for the more interesting interoperability work — party and GM views built on the existing round ledger, and shareable build strings, since a character is already a JSON blob.

**Two modes rather than one compromise.** The sheet serves experts well and beginners poorly at two specific moments — first contact, and the burst of grants after Apply School. Rather than compromising toward the middle, run two modes over one document: a guided chargen path that sequences the steps and makes commitment explicit, and a play mode that hides chargen entirely and surfaces only Skills, Combat and Equipment — the three sections that matter at the table and are currently furthest apart.

**Keep the store, fix the recalculation.** DOM-as-state has real virtues here: no framework, no build step, works offline from a file, and accessibility fixes land directly in markup. Replacing it is a rewrite, not a refactor. The realistic path is incremental derived-stat caching — dirty-flag the nine recalculation stages so a Trait edit does not re-render every spell pip and weapon row, and coalesce the per-keystroke path.

---

## Theme and craft

Two facts from the asset inventory should anchor any thematic work, because both change what is cheap and what is expensive.

```
Art/Clan Mons/    9 files   Crab (+transparent), Crane, Dragon, Lion,
                            Mantis, Phoenix, Scorpion, Unicorn
                            -> referenced in the build:  NONE
Art/Dice/         7 files   d10 (png + svg), d100, d4, coin
                            -> referenced in the build:  NONE
Art/Stances/                only Attack (jodan no kamae) has bespoke art
                            -> 4 of 5 stances undrawn

inlined payload   ~508 KB of 1.15 MB  =  44% of the file is base64 art
```

**The cheapest wins are art already drawn.** Nine clan mons exist and are referenced nowhere — there is no clan icon constant in the build at all. The dice art is likewise prepared and unused while the manual picker renders text. Four of five stances are undrawn. Before commissioning anything new, the highest-value thematic work is simply wiring up what is already sitting in the folder.

**There is a real payload budget.** Nearly half the file is already inlined base64. The single-file design is deliberate — the print handler tells players to download the HTML and open it directly — so that distribution model is a product property worth protecting, which makes payload a genuine constraint rather than a technicality. Prefer SVG, which the existing `dice-d10.svg` proves is already in the pipeline.

**Clan skins are cheap — but fix the tokens first.** The entire visual identity is 27 CSS custom properties, so a clan skin is a token re-point rather than a restyle. The caveat matters: the contrast failures found in this review live in exactly those tokens. A skin system that recolours without re-testing would multiply an existing accessibility failure across eight clans.

**Content before container.** Technique cards styled as scrolls is an appealing idea, but the missing thing is the content, not the container — techniques are names-only today, and a beautifully styled card holding a bare name is worse than a plain one holding the rule. Similarly, ring-aligned palettes need the elemental colours darkened first. An immersive mode is viable provided it honours reduced-motion and never becomes the only route to information.

---

## Architecture and accessibility roadmap

### Accessibility, staged

Sequenced so each stage ships independently and nothing lands in a state worse than today.

**Stage 1 — Unblock.** Live region on the status element · Ring and Trait triggers become real buttons · dialog semantics *and* focus management, shipped together · border and focus-ring tokens to 3:1. These four move the sheet from unusable with assistive technology to operable. Nothing later matters as much.

**Stage 2 — WCAG AA.** Remaining contrast failures · the four undersized targets · label-in-name conflicts · landmarks and a skip link · Escape bound once across all overlays · verified reflow at 320px.

**Stage 3 — Modes.** High-contrast mode, cheap here since it is a token set rather than a restyle, and shares plumbing with clan skins · reduced-motion support · keyboard shortcuts for rolling and spending Void.

**Stage 4 — Content.** Accessible technique descriptions, which converges with the technique work since both are blocked on the same missing content · announced roll results · explosion chains above 0.55rem, with a text alternative.

### Structure

**A build step is the highest-leverage investment.** Externalising the rule libraries so they can be edited, diffed and validated conflicts with single-file distribution — unless a build step inlines them at package time. That one addition solves three problems simultaneously: editable rule data, an end to manual Python splicing, and an artifact pipeline that makes version control genuinely useful. The output stays one self-contained HTML file, so nothing is given up.

**Flags, not runtime plugins.** Runtime plugin loading is genuinely at odds with offline single-file distribution — dynamic import from a file origin fails in exactly the scenario the sheet is designed for. Compile-time feature flags are the better framing, and the rollback ladders already documented in the QA suite become build configuration rather than manual edits.

**Codify the feature template.** Every Part C feature follows the same shape: a frozen data table, state accessors over non-persisted hidden inputs, one contributor function, one registration call, and wiring in the init block. Writing that down converts tribal knowledge into a contract for Kiho, Rituals and Ancestors. Two rules belong in it — never pin the registry to a literal list, and never use the persisted-field prefix for new state.

**Extend the test seam to accessibility.** The project already has strong harness culture — 596 assertions and a test seam built for exactly this. Adding accessibility assertions to it (every overlay carries dialog semantics; no interactive element lacks an accessible name; no new control falls below 24 × 24) fits existing practice and prevents regression as features land. Pair automated checks with real screen-reader testing: the accessibility tree shows what is exposed, not what is usable.

---

## One pattern worth carrying forward

Accessibility and engineering quality in this build correlate with recency. The Part C combat features use real buttons, pressed-state semantics, labelled controls and designed focus rings. The core sheet — chargen, skills, the modal layer — uses none of them. The practice demonstrably improved over the build's life; the debt simply stayed where it was first written. The newest code already demonstrates the patterns the oldest code needs.

---

*Eight-phase review — Ingestion, Architecture, UX Heuristics, Accessibility, Interaction Flow, Feature Deep Dive, Consolidation, Roadmap. Findings measured against the running build, not estimated from source.*
