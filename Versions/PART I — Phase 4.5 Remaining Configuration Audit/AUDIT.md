# Phase 4.5 remaining-configuration audit

Audit date: 13 September 2026. Baseline: local `main`, commit `415cb2e`.

Status: original audit findings plus subsequent user-approved design decisions. The User review addendum records the current approved approach and supersedes broader initial proposals where they differ. No production implementation, new QA pass, commit, or deployment is included in this document.

> ## ✅ UPDATE — 16 September 2026: findings 1–7 and 9–12 are now FIXED
>
> **Phase 4.5.3 (Configuration Repairs) implements eleven of this audit's twelve confirmed
> defects.** See `Versions/PART I — Phase 4.5.3 Configuration Repairs/README.md`. The section
> "Confirmed gaps in current coverage" below is left exactly as originally written, as the
> evidence trail; each row's current status is recorded in the status table directly beneath
> that section.
>
> **Finding 7, Lord Moon's Curse, is PARKED rather than fixed** — the sheet states no TN map for
> its rank-scaled Willpower check, and inventing one would be inventing rules content
> (Process Requirement #3). Its status changes from *confirmed defect* to *parked, pending
> source material*, alongside Seven Fortunes' Blessing.
>
> **Nothing in sections A–E is implemented.** The 23 missing configuration handlers and the 22
> review cases remain exactly as recorded. 4.5.3 deliberately added no catalogue entry and no
> configuration type; it only repaired what had already shipped.
>
> Measured at that release: Feature 4.53's own suite **39/39**, dropping to **18/39** with its
> kill-switch off; every retained suite unchanged at **504/504**; combined **543/543**. Surgical
> removal rebuilds byte-identically to `27b57eff…`, 2,476,062 bytes — the same artifact this
> audit records as its baseline below. The live build is now `18a740e8…`, 2,495,934 bytes.

> ## 📱 Real-device feedback — 16 September 2026 (iPhone 16e, live deployed build)
>
> Reported after Phase 4.5.3 shipped to `main`. Recorded here for a later round; **nothing below
> was implemented or changed by this update** — each item was re-checked against the live source
> before being written up, so the description matches what the sheet actually does today, not
> just what was reported.
>
> **1. Friend of the Elements' Free Raise note looks squished in the roll preview, on phone.**
> New evidence for the existing UX finding (#11, "existing UX defects still apply to expansion
> designs"), but a **different screen** than that finding was written against: #11 and the
> 4.5.2 feedback backlog are about the **configuration picker's** card overflow (`LOW
> 3 PTMEDIUM 5 PHIGH 7 PTS`). This is the **roll preview's** own informational-modifier row,
> which has not been checked at phone width before. Worth treating as its own item when the
> narrow-screen pass happens, not assumed fixed by whatever fixes the picker.
>
> **2 & 3. Perceived Honor, Wealthy and Unlucky show no modal — confirmed as expected, not a
> regression.** Checked against the live source: none of the three has an entry in
> `ADV_DISADV_CONFIG_SCHEMA` at all. This is exactly the audit's own classification — Perceived
> Honor (A10) and Wealthy (A16) are two of the **23 missing configuration handlers**; Unlucky
> (D05) is one of the **seven remaining Disadvantages**. Phase 4.5.3 deliberately did not add
> a modal for any of the three: it corrected the *catalogue value and description* on rows the
> audit already knew were unconfigured, which is a narrower repair than building the picker.
> This real-device pass is useful as **live confirmation that the gap is real and still open**,
> not as a new finding — and it sharpens the case for building A10/A16/D05's modals next,
> since two of the three are load-bearing for the price fix that just shipped (the price is
> right once a rank is entered; today nothing asks for one).
>
> **4. Friendly Kami can still be selected by a non-Shugenja — proposed stronger gate.** Feature
> 4.53 fixed the *effect*: the bonus no longer applies, and the row explains why. What it
> deliberately did NOT do is remove the option from the picker itself, matching the pattern the
> audit approved for other eligibility-gated entries (Elemental Imbalance shows an alert
> **after** an ineligible pick, rather than hiding itself from the dropdown). The request here
> is to go further for Friendly Kami specifically: **keep it in the list, but present it
> disabled** rather than selectable-then-inert — the same disabled-visual treatment already used
> for `btnAddSchoolToggle` and referenced in the roadmap's Phase 4.6/4.7 gating design. This is
> a genuine design question bigger than one entry: if adopted, does it become the standard for
> every eligibility-gated Advantage/Disadvantage (Elemental Imbalance included), or does
> Friendly Kami become an inconsistent exception? Flag for a decision before building either way.
>
> **✅ DECIDED AND BUILT — Phase 4.5.5, 16 September 2026.** The project owner chose **disable in
> the picker as the standard for every gated entry**, not a Friendly Kami exception. Re-measuring
> first found the gap was wider than reported: the option was not merely selectable, its
> configuration modal opened in full on a character with **no School at all**. It also found the
> sheet already carried **four** different answers to "this will not work" — a disabled control
> plus hint (`btnAddSchoolToggle`), a disabled option card (4.5.2's deficient-Ring tile), a hard
> `appAlert` refusal (Elemental Imbalance's entry gate), and 4.5.3's allow-then-explain — while
> the quick-add `<select>` the feedback was actually about disabled nothing, ever. Friendly Kami
> and Elemental Imbalance now both appear greyed with the reason in their own label
> (`Friendly Kami (5 pts) — Shugenja only`), recomputed every recalc because the pickers are built
> once at load but eligibility depends on School. The verdict is taken from 4.5.3 where 4.5.3 owns
> the rule, so the greyed option and the row explaining itself cannot disagree.
> **Residual, recorded not hidden:** 4.5.2's own `appAlert` entry gate for Elemental Imbalance is
> untouched, so an imported character carrying that entry without a Shugenja School still meets the
> older refusal. Fixing it means changing behaviour inside a function 4.5.2 owns — larger than this
> phase was scoped for. See `Versions/PART I — Phase 4.5.5 Eligibility Gates/README.md`.
>
> **✅ Items 1 and 4's geometry, and finding 11's tooltip/wording work, are now DONE.** Phase
> 4.5.4 (Configuration UX Pass) shipped them on 16 September 2026 — see
> `Versions/PART I — Phase 4.5.4 Configuration UX Pass/README.md`. Re-measuring first changed
> the scope in both directions: the "several overflowing cards" of finding 11 turned out to be
> **one** by the time it was looked at, while "use a consistent circled-i icon" turned out to be
> bigger than an icon choice for the ~24 entries with only a bare `title=` and no other
> affordance. Both geometry defects are fixed and measured clean at 375px, all explanatory
> tooltips gained a tappable route, and `XP refund` became `Severity`. **Copy shortening was
> deferred** on the project owner's call: measured, the worst entry runs 197 characters against
> Magic Resistance's 151, and four entries exceed the benchmark by little. Items 2, 3 and 5 below
> remain open.
>
> **✅ Items 4 and 5 are now DONE too** — Phase 4.5.5 (Eligibility Gates), same day. **Items 2 and
> 3 remain the only open ones on this list**, and they are the same item: Perceived Honor (A10),
> Wealthy (A16) and Unlucky (D05) have no configuration handler at all, which is the
> 23-missing-handlers gap rather than a defect. Copy shortening stays parked.
>
> **✅ Two of those three are now BUILT — Phase 4.5.6 (Rank Entries), 16 September 2026.** Perceived
> Honor and Wealthy both have their handlers; see
> `Versions/PART I — Phase 4.5.6 Rank Entries/README.md`. Perceived Honor prices 2 XP per rank with
> no cap (rank 10 = 20 XP, asserted) and shows a perceived-Honor readout derived live from
> `f_honorRank` without ever writing to it. Wealthy prices rank × 1 XP with a single discount off
> the total for Crane/Unicorn/Imperial — five ranks cost 5 XP, or 4 for an eligible character, not
> the 0 the old per-rank reading would have produced — and rank 1 with the discount costs 0 XP,
> with no minimum borrowed from another Advantage. Its koku entitlement is stated as a **reminder
> only**: no money is granted, so the repeated-grant lifecycle the audit warned about cannot arise.
> **D05 (Unlucky) is deliberately still open**: it is the one of the three needing dice-engine
> integration (a session-tracked reroll that replaces a saved result without re-paying its costs),
> which is a different size of job from the other two.
>
> **Worth recording for whoever builds the next handler:** Phase 4.5.2's `D45.install()` seam looks
> like the obvious host — it is public, and its `rankPick` already accepts any positive integer
> with no cap. It was tried live and refused: `D45.refresh()` requires a d45 entry to sit in
> `#disadvList`, so an Advantage installed there prices at 0 with no summary. Advantages need the
> Advantage-side path.
>
> **⚠️ Real-device correction, same day.** The first cut of 4.5.4 shipped with the tenet
> rules — Consumed's and Failure of Bushido's — claimed as "simply unreadable on touch," which
> **overstated the gap**: Phase 4.5.2 already gives every tenet option a native, hover-independent
> `<details>` disclosure carrying that exact text (`209.85-feat-disadv-config.js:277`). The real
> defect was two-fold — adding a second, competing affordance on top of a working one, and that
> disclosure's own hidden text leaking into the new button's heading, producing a garbled
> multi-line modal title. A third, separate bug (`overflow-wrap:anywhere`'s effect on flex-item
> minimum sizing) made several tenet names split mid-word rather than wrap cleanly. All three
> fixed the same day; see the phase's own README, "Real-device correction, 16 September 2026,"
> for the full account including the false initial premise.
>
> **⚠️ Second real-device correction, same day — "Determination" still split.** The fix above for
> the mid-word split used a measured `max-width:200px`; the project owner's iPhone 16e still split
> it, at a different point in the word. Cause: this sandbox has no outbound network access, so
> Google Fonts (`Shippori Mincho`) never loads here — `document.fonts` returns an empty set — and
> every pixel width measured in this phase, including the 200px figure, was measured against a
> browser-substituted fallback font, never the real one. **Standing lesson for this project:
> headless pixel measurement is unreliable for anything that depends on a webfont's actual metrics
> in this sandbox; prefer a layout fix that doesn't need to know the exact width of a word.**
> Fixed by giving the option card the full row width (`width:100%; max-width:none`) instead of any
> calculated cap — both affected entries already render one card per row regardless of width, so
> the cap was solving a problem the layout didn't have. Shipped without claiming to be
> "measured correct against the real font," only robust-by-construction — and **confirmed the
> same day on the reporting iPhone 16e**: every tenet name in both `Consumed` and `Failure of
> Bushido`, including "Determination — 6 XP", now renders on one line. See the phase's README,
> "Second real-device correction, same day."
>
> **5. Great Potential's Skill field should offer the character's own Skills, not free text.**
> Confirmed: `registerAdvConfigSchema('Great Potential', {type:'skillPick', ...})` renders a
> plain text input with no connection to the character's actual Skill list. The sheet already
> has the machinery to build one — `209.85-feat-disadv-config.js`'s own `api.skills()` collects
> every `SKILL_LIBRARY` name plus every custom row already on the sheet into one deduplicated,
> sorted list, and `schoolConcreteSkillNames()` gets a School's own skills specifically. Either
> could back a dropdown/autocomplete for Great Potential, and the same input would help Doubt
> when D03 is eventually built, since Doubt also names a School Skill.
>
> **✅ BUILT — Phase 4.5.5, 16 September 2026. The description above was half wrong.** It is not a
> plain text input: 209.81 already backs it with a `<datalist>` of all 44 `SKILL_LIBRARY` names.
> The two real defects, both confirmed live, were that the list is the master catalogue rather than
> *this* character's Skills, and that the field accepted **anything** —
> `Underwater Basket Weaving` was typed, confirmed, and saved as a configured Skill with no
> complaint. **The constraint that shaped the fix:** applying a School does NOT populate
> `#skillsBody`. Measured — an Isawa Shugenja character reports `shugenja: true` and five
> `schoolSkills` with its Skills table still empty — so a strict "your Skills only" dropdown would
> be empty for most characters mid-build. The project owner chose **validated text with a
> prioritised list**. **Revised the same day on real-device feedback:** that first cut kept the
> text box and only re-sorted the list behind it, and the project owner said plainly they expected
> *a list of their Skills with a tick box, one selectable*. It is now a single-select card list of
> the character's own Skills — School-granted ones first and badged `School`, then anything bought
> or typed — with an `Another Skill…` card last that reveals the validated text field, since Great
> Potential names no School restriction in the rules and a Skill may be chosen before it is bought.
> A character with no Skills yet still gets the plain text field. The first cut had generalised
> from one School (Isawa Shugenja, whose apply leaves the Skills table empty) without driving the
> real Apply School flow; a Hida Bushi applied properly appends all six granted Skills as rows, so
> the list is populated in the normal case. The School's `any one Bugei Skill` free-choice slot is
> deliberately skipped by Apply School and reaches the list once the player adds it. An unknown
> name is still refused, and a homebrew row still counts as known. Doubt (D03) can reuse the same
> picker when it is built.
>
> **✅ Both halves confirmed on the reporting device, same day.** Friendly Kami renders disabled
> with `— Shugenja only` in the quick-add list; a fully-applied Hida Bushi's Skill picker shows
> the School's six skills plus the player's own addition, each badged, with `Another Skill…` last,
> and confirming a selection produces a correctly configured entry. Closes the one open
> verification item from Phase 4.5.5.

## Scope and result

This audits the character sheet against itself: every entry in its current `ADV_LIBRARY` and `DISADV_LIBRARY`, the live configuration handlers, persistence adapters, roll hooks, and existing tests. Quotes below are from the **sheet's descriptions**, not independently verified RAW quotations. Sourcebook completeness and RAW accuracy are separate, later work, as requested.

| Classification | Advantages | Disadvantages | Total |
|---|---:|---:|---:|
| Clear missing configuration handlers | 16 | 7 | 23 |
| Human review: optional, contextual, GM-defined, or adjacent-system work | 5 | 17 | 22 |
| Existing configuration handlers, including partial implementations | 12 | 12 | 24 |
| No additional entry configuration indicated | 40 | 30 | 70 |
| **Current catalogue accounted for** | **73** | **66** | **139** |

The classification was mechanically compared with both current library arrays: **139 names accounted for exactly once, zero omitted names, zero duplicate classifications, and zero names outside the current catalogue**. Only this audit document was added; tracked production files remain unchanged.

“Clear missing” means the existing description identifies a selection or variable amount that the configuration system does not currently record. It does **not** mean the description contains enough detail to implement every rule branch. For example, Seven Fortunes' Blessing clearly needs a Fortune choice, but the sheet contains neither its complete Fortune effect table nor its Clan-discount mapping.

Fixed XP does not exclude a choice-dependent effect: Doubt, Inheritance, and Soul of Artistry qualify. Conversely, a conditional fixed effect does not automatically require a permanent pick-time configuration: Wary does not need an “ambush” subtype. A named geographical choice such as Way of the Land qualifies even though its effect is informational; generic narrative text such as a secret or hobby does not automatically require a new modal.

### Evidence inspected

Paths below are relative to the repository root. `SOURCE` abbreviates `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability`.

- `SOURCE/src/sheet/020-lib-skills-advantages.js`: current Advantages at lines 135–209; Disadvantages at 210–281. These are the catalogue used by the dropdowns.
- `SOURCE/src/sheet/040-lib-kata-kiho-spells.js:426`: the shared quick-add path copies the library's name, cost and description, then opens a picker only when a schema exists.
- `SOURCE/src/sheet/209.8-feat-adv-config.js`: original schema, name lookup, resolver, controls, modal, and the single `adv-config` registry contributor.
- `SOURCE/src/sheet/209.81-feat-adv-config-extended.js` through `209.84-feat-adv-config-sacred-weapon.js`: expanded Advantages, Kharmic Tie, resources, and owned weapons.
- `SOURCE/src/sheet/209.85-feat-disadv-config.js` through `209.88-feat-disadv-gates.js`: Disadvantages, migration, Phobia, Nemesis, and Willpower gates.
- `SOURCE/src/sheet/090-table-rows-weapons.js`, `110-modals-trackers.js`, `120-persistence.js`, and `130-round-and-pipeline.js`: entry creation, XP, saves, and modifier integration.
- Both existing Phase 4.5 QA folders, their rollback instructions, the current regression matrix, `SOURCE/qa/feature-dependencies.py`, the ledger, and the current roadmap.

The built HTML inspected has SHA-256 `27b57eff316ee6f34f528e055a8d8adda6bb0d60ed7a951519ec12af35122ff2` and size 2,476,062 bytes. The integrated existing suite was rerun against that file: **504/504 checks passed**. The audit findings below expose coverage gaps despite that passing result; no new implementation is being certified.

## A–E. Missing Advantages: choices, schema, effects, UI and persistence

These entry-by-entry proposals preserve the initial audit findings. The **User review addendum — Advantages scope decisions** below is authoritative for the subsequently approved scope: a proposed modifier, equipment grant, or NPC record here is not implementation approval when the addendum defers it. The original catalogue counts remain the audit baseline, not a count of approved new features.

Each schema below is a proposal for the entry's nested `config` object. The current serializer expects a `type` field; the user's Fortune example therefore needs that discriminator in the application's actual stored shape. `value` can remain a compatibility/display field, but dedicated fields must be authoritative. All entries inherit the shared persistence, removal and validation requirements in sections F–G and the removal contract below.

### A01. Seven Fortunes’ Blessing — canonical example

Sheet evidence, line 195:
> Choose a Fortune’s blessing; each grants its own themed roll bonus. Listed Clans pay 1 less.

- **Why missing:** no Fortune schema, choice control, selected-Fortune badge, or Fortune-specific resolver exists. The library's cost is 4; adding it does not flag a missing choice.
- **Modal/config:** choose the Fortune, then show only that Fortune's required secondary selection. The user specifically supplied Fukurokujin's Lore Skill as an example. Proposed `{type:'fortunePick', fortune:'Fukurokujin', skill:'Lore: Theology'}`. The complete Fortune list and which choices require secondary fields are not defined in the current sheet. Do not populate these from memory.
- **XP/modifier:** begin with the sheet's 4-point base and use an explicit Fortune/Clan eligibility table for the stated 1-point reduction once that table is supplied. Naishou Citizen introduces a separate stated reduction; stacking and minimum-cost rules need confirmation. Dispatch effects by chosen Fortune, with skill matching where applicable. There is no defensible universal numeric “Fortune bonus” in the current description.
- **UI/persistence:** Fortune badge plus Skill badge when applicable; Choose/Change; missing-choice warning; persist `fortune` and only the applicable `skill`. Re-selecting another Fortune must clear an obsolete Skill selection. Add a pip pool only if the later confirmed Fortune rule requires one.
- **Removal:** R1 standard schema/UI/resolver; R2 conditional roll context if needed; R6 for the Naishou link. No modification of the library row.
- **Tests:** each eventual Fortune branch has its own independent fixture; secondary-choice required/absent cases; changing Fortune clears stale fields; Clan and Naishou pricing combinations; exact matching and nonmatching rolls; save/load/import/export. Matrix: configuration, XP, roll scope, links, persistence, removal.

### A02. Blackmail

Sheet evidence, line 139:
> You hold proof of someone’s dark secret; cost equals their Status Rank. Scorpion pay 1 less.

- **Why missing:** the price depends on another person's Status, but the row starts at the fixed library value 1 and has no target/Status input. This is distinct from the already-configured **Blackmailed**, which reads the player's Status.
- **Modal/config:** target name and their Status Rank; `{type:'targetStatusPick', target:'...', targetStatus:3}`. A named target is a recommended identity field; the mechanically essential input is their Status.
- **XP/modifier:** target Status minus the stated Scorpion reduction. The description does not specify minimum cost or low-Status handling; do not invent a floor. Updating the target Status recalculates the price. No dice modifier is described.
- **UI/persistence:** target and Status badge, derived price, Change control; persist `target` and `targetStatus`, not a second authoritative computed price. Do not track the NPC elsewhere in the app.
- **Removal/tests:** R1. Test opponent Status versus player Status, Scorpion/non-Scorpion, invalid/missing input, later Status changes, independent targets, and unrelated XP stability. Matrix: configuration, XP, persistence, removal.

### A03. Dark Paragon

Sheet evidence, line 149:
> Once/session, spend 5 Honor (or a Void Point) for a +5 bonus tied to a chosen Shourido precept. Spider pay 4.

- **Why missing:** a chosen precept controls the effect, and use is limited by session. Neither is configured.
- **Modal/config:** precept picker; `{type:'tenetPick', tenet:'...', remaining:1}`. At use time offer the permitted payment choice, rather than permanently selecting a payment method. The Disadvantages already contain Shourido names; their penalties must never be reused as Dark Paragon's benefits.
- **XP/modifier:** base 5, Spider 4. A +5 bonus applies only in the chosen precept's qualifying context. The description does not define those contexts, the detailed Honor payment, or all restrictions, so those mappings remain pending.
- **UI/persistence:** tenet badge, one-use session counter/reset, use/payment control in the relevant flow. Persist tenet and remaining uses; do not persist an armed roll or charge on preview/cancel.
- **Removal/tests:** R1, R2, R3. Test every approved precept, payment exactly once, insufficient resources, cancellation, session reset, save/load, and no bonus to unrelated rolls. Matrix: XP, roll scope, resources, persistence, removal.

### A04. Darling of the Court

Sheet evidence, line 150:
> Choose a court; your Status counts one rank higher while it is in session. Repeatable per court. Courtier pay 1.

- **Why missing:** the court is an explicit choice; separate purchases refer to separate courts.
- **Modal/config:** court name; `{type:'courtPick', court:'...', active:false}`. The active control represents being at the chosen court while it is in session, not a campaign calendar.
- **XP/modifier:** base 2, Courtier 1. Show effective Status +1 only in that context; do not overwrite the underlying Status or globally reprice Blackmailed. No dice modifier is stated.
- **UI/persistence:** court badge, contextual Status reminder, optional active toggle; persist court and the toggle if approved. Multiple court entries remain independently identifiable.
- **Removal/tests:** R1, R2. Test repeatability, Courtier pricing, active/inactive effective Status, and unchanged base Status/Blackmailed cost. Matrix: configuration, XP, derived values, toggles, persistence, removal.

### A05. Forbidden Knowledge

Sheet evidence, line 155:
> Secret expertise in a taboo subject (gunpowder, Gozoku, Kolat, Lying Darkness, or maho), granting a related Lore rank and situational bonus.

- **Why missing:** the subject determines both the Lore benefit and situational effect.
- **Modal/config:** select the subject from the five names already listed; request any required Lore specialization once its mapping is confirmed. `{type:'knowledgePick', subject:'...', skill:'...', sourceId:'...'}`.
- **XP/modifier:** fixed base 5 in the library. The granted rank and situational bonus require a subject-specific definition; the summary does not supply a complete value/mapping. Avoid automatically awarding an invented Lore rank or treating all Lore rolls alike.
- **UI/persistence:** subject and Lore badges; display the confirmed benefit. Persist subject, applicable skill and grant ownership identity. Prefer a derived/owned skill grant rather than editing the player's purchased rank without provenance.
- **Removal/tests:** R1, R2, R4. Test all listed subjects, granted versus purchased ranks, no duplicate grants on load/recalc, switching subjects, and preservation of unrelated skills on removal. Matrix: configuration, skill grants, roll scope, persistence, removal.

### A06. Heart of Vengeance

Sheet evidence, line 164:
> Choose a rival Clan or faction; +1k1 on Contested Rolls against its members. Spider pay 4.

- **Why missing:** the selected faction determines when the bonus applies.
- **Modal/config:** Clan/faction choice with a named custom faction option; `{type:'factionPick', faction:'...'}`. At roll time use an explicit “Contested against this faction” declaration.
- **XP/modifier:** base 5, Spider 4; +1k1 only to a qualifying Contested Roll. An attack against a faction member is not automatically a Contested Roll.
- **UI/persistence:** faction badge and conditional preview control; save the faction, not an automatically rearmed per-roll declaration.
- **Removal/tests:** R1, R2. Test correct/wrong faction, contested/non-contested context, cancel, Spider pricing, and no stale declaration on the next roll. Matrix: XP, roll scope, UI, persistence, removal.

### A07. Inheritance

Sheet evidence, line 171:
> One extra heirloom item beyond your starting gear; +1k1 on non-combat Skill Rolls made using it.

- **Why missing:** the particular heirloom and whether the roll uses it determine the bonus. No equipment binding or use declaration exists for Inheritance.
- **Modal/config:** name/link the heirloom; `{type:'itemPick', itemId:'...', itemName:'...', sourceId:'...'}`. Offer a per-roll “Using this heirloom” declaration when relevant.
- **XP/modifier:** fixed 5; +1k1 only for a non-combat Skill Roll using the selected item. An ordinary Skill roll can still occur in combat; checking only that it is not an ATTACK context is insufficient.
- **UI/persistence:** heirloom badge and owned equipment link. Persist item identity/name and source identity; keep the roll declaration transient. An unspecified item can be a named narrative equipment row without invented weapon statistics.
- **Removal/tests:** R1, R2, R4. Test correct/wrong item, non-combat/combat Skill rolls, attacks/damage, rename/delete/relink, repeated load/recalc, and preservation of pre-existing equipment. Matrix: roll scope, equipment, persistence, removal.

### A08. Naishou Citizen

Sheet evidence, line 182:
> Buy Seven Fortunes’ Blessing for 1 point less; Free Raise on Social rolls with monks aligned to your chosen Fortune.

- **Why missing:** the chosen Fortune controls the Social-roll reminder; the other Advantage's price also depends on this entry.
- **Modal/config:** Fortune choice, or explicit link to a selected Blessing if that is the approved relationship. `{type:'fortuneLinkPick', fortune:'...', blessingSourceId:null}`. The sheet does not establish whether the Fortune must be inherited from a purchased Blessing, so do not silently impose that prerequisite.
- **XP/modifier:** this entry costs 3; the description states a 1-point reduction to Seven Fortunes' Blessing. Discount stacking/floors are unresolved. Show a Free Raise for a Social Roll with a monk of the selected Fortune; do not convert it to dice or a numeric TN reduction.
- **UI/persistence:** Fortune badge, price explanation on the affected Blessing, conditional Social-roll reminder. Persist fortune and any approved link; do not keep two independent Fortune values that can silently disagree.
- **Removal/tests:** R1, R2, R6. Test add/remove/reorder of both entries, unconfigured Blessing, changing Fortune/Clan, link deletion, correct/wrong monk context, and no dice change from the Free Raise. Matrix: XP, links, roll scope, persistence, removal.

**User-confirmed design clarification (13 September 2026):** use the current Seven Fortunes' Blessing as the linked Fortune, with the reminder requiring both Advantages. Replacing the active Blessing must preserve previous purchase expenditure; editing its selection must not itself charge XP or issue a refund. Keep active-effect selection separate from purchase accounting. These are approved app behaviours; discount stacking and the underlying repeat-purchase rule still require their own source confirmation.

### A09. Paragon

Sheet evidence, line 183:
> Choose one Bushido tenet; gain its matching mechanical bonus, plus extra Honor whenever you are rewarded for that virtue. Lion pay 6.

- **Why missing:** the selected tenet defines the benefit; there is no Paragon configuration.
- **Modal/config:** tenet picker, with any secondary pick required by the later approved benefit table; `{type:'tenetPick', tenet:'...'}`. Bushido names exist in Failure of Bushido, but those disadvantage effects do not define Paragon's benefits.
- **XP/modifier:** base 7, Lion 6. Benefits and additional Honor amounts are not enumerated here. Do not apply one generic modifier to every tenet or automatically award Honor from an inferred event.
- **UI/persistence:** tenet badge and selected-benefit reminder; persist tenet and only confirmed secondary fields. Resource controls depend on actual branch rules, not this general description.
- **Removal/tests:** R1, R2; R3 only if a confirmed branch needs resources. Test every branch independently, Lion pricing, matching/nonmatching contexts, switching tenets, and Honor reminder versus actual character data. Matrix: XP, roll scope, resources if applicable, persistence, removal.

### A10. Perceived Honor

Sheet evidence, line 184:
> 3 points per rank. Anyone reading your Honor Rank perceives it as that many ranks higher.

**Source correction (13 September 2026):** the quotation above accurately records the existing sheet, but the sheet is wrong. The supplied Core Rulebook, printed page 152 (PDF page 155), explicitly lists `PERCEIVED HONOR [SOCIAL] (2 POINTS/RANK)`. The entry was checked by text extraction and visual page inspection. The earlier 3-XP figure came from `src/sheet/020-lib-skills-advantages.js:184`, not the rulebook. Correcting that catalogue entry is pending production work; the recommendation below now uses the verified 2-XP rate.

- **Why missing:** number of ranks sets both purchase cost and perceived-Honor increase.
- **Modal/config:** numeric Rank selection; `{type:'rankPick', rank:2}`. No maximum is supplied by the current description; do not invent a three-rank ladder.
- **XP/modifier:** 2 × rank, so rank 1 costs 2 XP and rank 10 costs 20 XP; show perceived Honor as current Honor plus selected ranks, for attempts to discern Honor. It is not an increase to actual Honor, Honor spending, or Honor-based resistance bonuses.
- **UI/persistence:** rank/perceived-Honor badge, Change; persist rank, derive the readout from current Honor.
- **Removal/tests:** R1. Test several ranks, missing/invalid/fractional input, Honor changes, actual Honor unchanged, price round-trip. Matrix: configuration, XP, derived values, persistence, removal.

### A11. Servant

Sheet evidence, line 194:
> Gain a servant (Traits 2, one Skill at 3); extra Ranks/Emphases cost 3 points each. Servant type and Clan discount vary.

- **Why missing:** type, assigned skill and paid upgrades are variable; the row currently carries only base cost 5 and text.
- **Modal/config:** servant type, type-appropriate Skill, extra ranks/emphases; optional name. `{type:'servantPick', servantType:'...', skill:'...', extraRanks:0, emphases:[], name:'...'}`. Exact type options, skill restrictions and Clan discounts are absent.
- **XP/modifier:** use a verified type's base cost plus the stated 3-point increments and its confirmed Clan adjustment. The library's 5 is not proof that every type has the same price. These are the servant's characteristics, not bonuses to the player's rolls.
- **UI/persistence:** compact servant summary/type/skill/upgrades; save those choices. A full NPC sheet or independent servant roller is outside this proposal.
- **Removal/tests:** R1; R4 only if a separate owned roster/item representation is approved. Test all approved types/discounts, upgrades added/removed once, independent multiple servants, and no mutation of PC Traits or Skills. Matrix: configuration, XP, ownership, persistence, removal.

### A12. Soul of Artistry

Sheet evidence, line 199:
> Choose Artisan or Craft Skills; treated as Rank 1 in that type when you would otherwise roll Unskilled. Crane/courtier pay 3.

- **Why missing:** the selected skill family determines which rolls stop being Unskilled.
- **Modal/config:** Artisan versus Craft; `{type:'skillFamilyPick', family:'Artisan'}`.
- **XP/modifier:** base 4, Crane or Courtier 3; this is one stated reduced price, not two cumulative discounts. Treat an otherwise Unskilled roll in the selected family as Rank 1. Do not model that solely as +1k0: Unskilled-roll behavior and preview/explosion rules must agree.
- **UI/persistence:** family badge and effective-rank explanation on matching rolls. Persist family; retain the character's purchased skill ranks and XP unchanged.
- **Removal/tests:** R1, R5. Test Artisan/Craft and specializations, zero-rank/trained rolls, correct Unskilled behavior, price eligibility, and actual/purchased ranks unchanged. Matrix: XP, effective rank, roll scope, persistence, removal.

### A13. Touch of the Spirit Realms

Sheet evidence, line 202:
> Choose a Spirit Realm; gain its themed bonus (varies by realm). Shugenja pay 4.

- **Why missing:** a realm selects the benefit, but no realm configuration exists.
- **Modal/config:** realm picker and any required secondary pick once defined; `{type:'realmPick', realm:'...'}`.
- **XP/modifier:** base 5, Shugenja 4. The current entry gives neither the available realm list nor per-realm effects. Implement an explicit realm-to-effect table only after those details are supplied; do not mirror Cursed by the Realm by merely reversing its sign.
- **UI/persistence:** realm badge, selected rule reminder and conditional controls only where the actual branch needs them; persist realm and required branch fields.
- **Removal/tests:** R1, R2; R3/R5 only for approved branch requirements. Test every defined realm, secondary choices, Shugenja pricing, absence of stale effects after changes, and matched/unmatched rolls. Matrix: configuration, XP, roll scope, persistence, removal.

### A14. Void Versatility

Sheet evidence, line 205:
> Shugenja with Void affinity only. Choose a non-Void Ring; you may spend that Ring’s spell slots on Void spells too.

**Source and design confirmation (13 September 2026):** The Great Clans, printed page 199 (PDF page 200), confirms the 4-point cost, selection of one non-Void Ring, spending that Ring's slots for Void spells, and the Shugenja/Void-affinity prerequisite. Text extraction and visual inspection agree. The user accepts choosing this Ring at purchase and choosing between ordinary Void payment and that saved Ring in the casting preview; the spell's casting dice, identity, and effects remain Void. Preserve exhaustion checks and the existing shared Bonus-pool warnings, without creating another pool or offering an arbitrary new Ring on each cast.

- **Why missing:** there is no stored selected Ring or corresponding spell-slot-source adapter. The sheet's shared Bonus pool is not this Advantage's selected elemental pool.
- **Modal/config:** non-Void Ring picker; `{type:'ringPick', value:'Water'}`. Validate the stated Shugenja/Void-affinity requirement, using current school data rather than a silent default. Account for the existing Uncentered prohibition.
- **XP/modifier:** fixed 4; no dice modifier. For a Void cast, expose the selected Ring as an additional permitted source and debit its actual pool once. Keep this distinct from ordinary Void slots and shared Bonus slots.
- **UI/persistence:** selected Ring badge; cast-time slot-source choice/readout. Persist the Ring choice, while usage continues through canonical spell-slot persistence. Do not add a duplicate elemental pool to config.
- **Removal/tests:** R1, R7. Test every non-Void choice, eligibility changes, available/empty pools, one debit per cast, cancel paths, manual-pip interactions, Bonus-pool separation, save/load, and absence of any effect on non-Void casts. Matrix: configuration, eligibility, spell slots, persistence, removal.

### A15. Way of the Land

Sheet evidence, line 207:
> Choose a region; you cannot get lost there and know its resources. Unicorn pay 1.

- **Why missing:** the geography is an explicit required choice, even though its benefit is informational.
- **Modal/config:** free-text region; `{type:'regionPick', region:'...'}`. A fixed region list is not available in this entry.
- **XP/modifier:** base 2, Unicorn 1. No dice bonus is described; navigation/resource knowledge remains a reminder for that region.
- **UI/persistence:** region badge, short benefit text, Change; persist the region. No automatic location tracking or navigation subsystem.
- **Removal/tests:** R1. Test nonblank/escaped text, change/cancel, Unicorn pricing and no modifier on unrelated navigation rolls. Matrix: configuration, XP, UI, persistence, removal.

### A16. Wealthy

Sheet evidence, line 208:
> 1 point per rank. Each point grants 2 extra starting koku. Crane/Unicorn/Imperial pay 1 less per rank.

**Source correction (13 September 2026):** the supplied Core Rulebook, printed p.155 (PDF p.158), states a 1-point-per-rank base price and a single 1-point reduction off the total cost for Crane, Unicorn, or Imperial characters. Text extraction and visual page inspection confirm the user's original total-cost formula. The quotation above preserves the sheet's erroneous per-rank discount wording; that catalogue description is pending production correction. The user's original formula was correct; the earlier example confused the number of ranks with the amount of koku.

- **Why missing:** rank controls the purchase and starting-money entitlement; neither is configured.
- **Modal/config:** numeric Rank; `{type:'rankPick', rank:2}`. Any one-time currency-grant metadata would need separately owned provenance.
- **XP/modifier:** verified base price `rank × 1 XP`; subtract 1 XP once from that total when the character is Crane, Unicorn, or Imperial. Five ranks cost 5 XP normally or 4 XP for any eligible group. Do not subtract once per rank, once per identity match, or price the koku as ranks. The user's agreed money-grant design remains 2 koku per selected rank; retain the source's exact “for each point spent” wording as provenance rather than conflating currency and net XP. No roll modifier is described. This passage does not state a minimum XP cost; do not silently copy another Advantage's minimum into Wealthy.
- **UI/persistence:** rank badge and confirmed starting-koku entitlement. Persist rank; preferably show an entitlement reminder until creation/play semantics are agreed. Recalculation or reload must never repeatedly mint currency.
- **Removal/tests:** R1, R4 if actual money is granted. Test the approved cost/minimum/discount interpretation, rank changes, no repeated currency grant, no rewriting spent in-play money, and the `Wealth`/`Wealthy` naming inconsistency in Blissful Betrothal. Matrix: XP, money ownership, lifecycle, persistence, removal.

## B–E. Missing Disadvantages: choices, schema, effects, UI and persistence

The initial findings below are supplemented by the **User review addendum — Disadvantages scope decisions** at the end of this document. That addendum records the accepted implementation approaches, the source corrections found during assessment, and the approved TN-to-reported-total convention. It is authoritative where an initial proposal differs.

### D01. Cursed by the Realm

Sheet evidence, line 232:
> Marked as an enemy of a chosen Spirit Realm, with a themed penalty that varies by realm. Shugenja pay 5.

- **Why missing:** selected realm determines the penalty; there is no realm config.
- **Modal/config:** realm and any required secondary selection; `{type:'realmPick', realm:'...'}`.
- **XP/modifier:** base award 4, Shugenja 5. The realm options and effects are not enumerated. Define them explicitly later; do not infer them from the Advantage or apply a generic penalty.
- **UI/persistence:** realm badge and confirmed selected-rule reminder; persist realm and applicable branch fields; toggles/resources only if that branch calls for them.
- **Removal/tests:** R1, R2, branch-specific R3/R5 if needed. Test each approved realm, Shugenja award, positive/negative scope, changing choices, and round-trips. Matrix: configuration, XP, roll scope, persistence, removal.

### D02. Dependant

Sheet evidence, line 235:
> Variable cost (roughly 2-6). Someone helpless relies on you; cost scales with how helpless and how often they appear.

- **Why missing:** there is definitely a variable point award, currently represented by a fixed default of 2. The description does not define the actual tier ladder.
- **Modal/config:** name, short dependency/frequency description, agreed point amount; `{type:'agreedPointsPick', target:'...', helplessness:'...', frequency:'...', points:3}`. A numbered amount is an explicit player/GM input, not an invented automatic scale.
- **XP/modifier:** use the agreed amount. “Roughly 2-6” must not silently become an authoritative dropdown of every integer or a hard legal range. No roll modifier is described.
- **UI/persistence:** dependant badge and concise arrangement; store the entered fields and explicit agreed amount. No NPC simulation.
- **Removal/tests:** R1. Test no silent 2-point default, explicit amount, invalid input, independent dependants, cancel/change, total XP and round-trip. Matrix: configuration, XP, UI, persistence, removal.

### D03. Doubt

Sheet evidence, line 239:
> Choose a School Skill; using it always requires an extra Raise for no benefit.

- **Why missing:** no chosen School Skill is stored, so the penalty cannot be scoped. The original phase comment dismissing Doubt because it lacks a roll consequence conflicts with this description and with the existing informational Raise pattern.
- **Modal/config:** School Skill picker; `{type:'skillPick', skill:'...'}`. Reuse the School Skill sourcing pattern already needed by Consumed: Insight, while testing elective/custom school skills.
- **XP/modifier:** fixed award 4. Report one required extra Raise for no benefit on use of the selected Skill, including skill-based attacks. Under the user's approved reporting convention, represent its TN +5 as −5 to the reported total, without changing the dice pool. Keep the required-Raise meaning and any Raise-limit accounting explicit; a total adjustment alone is not complete Raise enforcement. Apply the numerical difficulty change once only.
- **UI/persistence:** Skill badge and scoped preview/result reminder; persist the Skill and revalidate it after school changes.
- **Removal/tests:** R1, R2. Test school/non-school skills, elective skill selection, attacks as well as ordinary Skill rolls, unrelated rolls, unchanged dice from an informational modifier, and invalid saved selections. Matrix: configuration, eligibility, roll scope, persistence, removal.

### D04. Seven Fortunes’ Curse

Sheet evidence, line 270:
> A Fortune’s specific curse against you, each with its own themed penalty.

- **Why missing:** the Fortune selects the curse; there is no Fortune config or effect dispatch.
- **Modal/config:** Fortune picker plus any secondary choice that the confirmed curse requires; `{type:'fortunePick', fortune:'...'}`. Do not assume the Blessing's secondary choices also apply here.
- **XP/modifier:** the initial catalogue lists 3; the subsequent Core pp.161–162 check confirms Hotei's Curse is a 6-point exception. The seven branch behaviours are now recorded in the approved Disadvantages addendum. Do not simply negate the Blessing bonuses.
- **UI/persistence:** Fortune badge and curse reminder; persist only the fields applicable to the chosen curse. Conditional toggles/pools depend on the later branch definitions.
- **Removal/tests:** R1, R2, optional R3 by branch. Test every confirmed Fortune, branch changes, stale secondary-field removal, no cross-application between Blessing and Curse, and round-trips. Matrix: configuration, XP, roll scope, persistence, removal.

### D05. Unlucky

Sheet evidence, line 278:
> 2 points per rank. That many times per session, the GM may force a reroll of one of your rolls, keeping the worse result.

**Source correction (13 September 2026):** Core Rulebook printed p.162 (PDF p.165), checked during the Disadvantages assessment, requires keeping the second roll in all cases. The historical catalogue quotation above and this audit's original keep-worse proposal were incorrect. Rank sets session uses; twice rank sets XP. Rank 5 therefore grants 10 XP and starts at 5/5 uses. Production catalogue correction is pending implementation.

- **Why missing:** rank sets the award and session-use count; there is no rank picker, resource pool, or reroll action.
- **Modal/config:** numeric Rank; `{type:'rankPick', rank:2, remaining:2}`. The entry states no maximum; do not infer Luck's three-rank cap.
- **XP/modifier:** award 2 × rank and provide rank uses per session. A player-operated “GM invokes Unlucky” action rerolls the saved original pool/modifiers and replaces the result with the second result, whether higher, equal, or lower. This rerolls the existing roll, not the original action; do not charge a second spell slot, repeat gates, restart resource spending, or grant a fresh bonus-selection opportunity. The app must not decide when the GM invokes it.
- **UI/persistence:** rank badge, separate remaining/max Unlucky pool, session reset, and manual counter correction for rolls made outside the app. The result action stays visible but disabled at zero. Persist rank and remaining uses, not a pending reroll or roll history. Do not share counters with Luck or automatically invoke Unlucky.
- **Removal/tests:** R1, R3. Test award, GM-declared use, whole-roll replacement, worse/equal/better candidate results, exhaustion/reset, nested Willpower results, Luck interaction policy, and no repeated payment/modifier consumption. Matrix: XP, rerolls, resources, persistence, removal.

### D06. Weakness

Sheet evidence, line 279:
> Choose a Trait; it is treated as one rank lower for all purposes.

- **Why missing:** the affected Trait is never selected or stored.
- **Modal/config:** Trait picker from the sheet's existing Trait list; `{type:'traitPick', trait:'Agility'}`. Void is a Ring, not an extra Trait option.
- **XP/modifier:** fixed award 6. Core p.162 specifies rolls and Trait-based mechanical effects; the catalogue's “for all purposes” is a loose summary. Provide an effective Trait one rank below the purchased Trait. Inventory direct Trait reads, Skill/Trait rolls, damage, Initiative, Armor TN, and dependent Ring calculations before implementation. Establish treatment of lowest ranks and Ring-derived consumers rather than blindly changing every statistic. Preserve purchased advancement records and XP; never lower the saved purchased Trait or issue an XP refund as a shortcut.
- **UI/persistence:** selected Trait and effective-rank badge, with bought/effective values distinguishable. Persist the selected Trait; derive the reduction without destructive edits to baseline Trait data.
- **Removal/tests:** R1, R5. Test every Trait and relevant derived consumer, lowest supported ranks, creation XP unchanged by representation, changing the Trait, other effective-rank modifiers, and exact restoration when removed. Matrix: configuration, effective Traits, derived values, XP isolation, persistence, removal.

### D07. Wrath of the Kami

Sheet evidence, line 280:
> Choose an Element; spells of that Element cast against you gain a Free Raise. Shugenja pay 4.

- **Why missing:** the affected Element is not stored, so the reminder cannot identify which incoming spells benefit.
- **Modal/config:** Element picker; `{type:'elementPick', element:'Fire'}`. This shape has no rank; the current Disadvantage `elementPick` is hardwired to Elemental Imbalance's rank+element and cannot be reused unchanged. Confirm available Elements rather than assuming the generic Ring list settles all eligibility.
- **XP/modifier:** base award 3, Shugenja 4. Like the approved Magic Resistance approach, show an incoming-spell reminder for the player to communicate. A Free Raise is not a numeric dice/TN modifier to the player's own casting roll.
- **UI/persistence:** Element badge and “Incoming spells: Free Raise” reminder; persist Element. No table-wide spell targeting service is proposed.
- **Removal/tests:** R1. Test selected Element, Shugenja award, missing/invalid selections, persistence, and absolutely no change to the player's own casting pools or spell slots. Matrix: configuration, XP, reminder scope, persistence, removal.

## Existing Phase 4.5 entries: configuration present does not imply complete automation

The following 24 entries already have configuration handlers. They should not be added again as missing entries. Preserve their existing controls and approved companion-app behavior; the specific gaps that follow are separate repairs to existing coverage.

| Entry | Kind | Existing configuration and scope |
|---|---|---|
| Allies | Advantage | Influence + Devotion, dynamic Crane price. No required ally-name field in the approved current design. |
| Chosen by the Oracles | Advantage | Ring choice and matching Ring-roll +1k1. |
| Elemental Blessing | Advantage | Non-Void Ring choice and selected Traits' XP discount; entry-price gap below. |
| Friendly Kami | Advantage | Element choice and matching Sense/Commune/Summon bonus; eligibility gap below. |
| Friend of the Elements | Advantage | Ring choice and Trait-roll Free Raise reminder; entry-price gap below. |
| Gentry | Advantage | Approved holding-size price ladder. |
| Great Potential | Advantage | Skill choice and raise-limit reminder; attack and validation gaps below. |
| Kharmic Tie | Advantage | Person, Rank, separate session uses/reset and weapon-attack declaration. |
| Languages | Advantage | Human/non-human type and named language, price and badge. |
| Luck | Advantage | Rank, session pips, whole-roll reroll and better-result selection. |
| Magic Resistance | Advantage | Rank and incoming elemental-spell TN reminder. Own casting is deliberately unchanged. |
| Sacred Weapon | Advantage | No modal: Clan-derived price, owned base weapon and conditional rules. Full conditional combat automation was not the approved design. |
| Antisocial | Disadvantage | Tier, explicit Crab award, exact seven-Social-Skill modifier scope. |
| Blackmailed | Disadvantage | Automatic current-player-Status price; no target-Status modal is needed. |
| Cast Out | Disadvantage | 1/3 tier and Glory-as-Infamy reminder. Specific temple/sect naming is optional future UX, not present. |
| Compulsion | Disadvantage | 2/3/4 tier and calculated Willpower reminder. Compulsion subject is currently free description text. |
| Consumed | Disadvantage | Tenet, School Skill for Insight, prices and numeric/informational tenet effects. |
| Elemental Imbalance | Disadvantage | Positive numeric Rank, non-deficient Element, Shugenja eligibility and continuing Willpower gate. |
| Enlightened Madness | Disadvantage | Tier, Ring/Skill/Tattoo kind, specific target, cancelling gate and manual tattoo check. |
| Failure of Bushido | Disadvantage | Tenet, Ninja price and numeric/informational consequences. |
| Lord Moon’s Curse | Disadvantage | **Partial:** 3/5/7 severity and price only. No full-moon declaration, bonus-Void handling or mapped Willpower check. |
| Obligation | Disadvantage | 3/6 tier with narrative reminder. Specific obligation/recipient remains description text. |
| Phobia | Disadvantage | Rank, player-controlled active toggle and non-damage global penalty. Fear subject remains description text. |
| Sworn Enemy | Disadvantage | Named enemy, Insight difference, Nemesis purchase and separate active Void-suppression toggle. |

### Confirmed gaps in current coverage

1. **Missing entries are silently treated as ordinary rows.** A name without a schema gets no Choose control or unconfigured warning. It retains its library/manual cost. Thus Seven Fortunes' Blessing can appear finished at 4 points with no selected Fortune; Blackmail can remain at 1 without anyone's Status being recorded. Coverage must be driven by a reviewed catalogue inventory, not just by whatever names happen to be registered.
2. **Two existing choice-bearing Advantages omit their stated entry-price adjustments.** Runtime checks confirmed Phoenix Elemental Blessing stays at 4 although the description says 3, and a Shugenja's Friend of the Elements stays at 4 although the description says 3. Their configured effects resolve, but their resolvers do not return the reduced entry cost. See `209.8-feat-adv-config.js:334` and `:539`.
3. **Friendly Kami's stated Shugenja requirement is not enforced by its configuration path.** It can resolve while no School is selected. This is an existing-entry eligibility repair, already consistent with the recorded feedback, not a missing Element modal.
4. **Great Potential misses weapon-attack Skill contexts.** `209.81-feat-adv-config-extended.js:518` restricts its reminder to `ROLL_KINDS.SKILL`; a Kenjutsu ATTACK context receives no raise-limit reminder. The same Skill supplied as a SKILL context does. Any new skill-selecting effect, especially Doubt, must test both.
5. **Validation is uneven across releases.** Existing Advantage choices still use permissive `parseInt` or nonempty strings. Runtime examples: Allies accepts `influence:'1x', devotion:'2x'` as 1+2; Luck accepts `rank:'1x'` as rank 1 and malformed remaining data becomes zero; Great Potential accepts a nonempty Skill string without verifying a known or deliberately supported custom Skill. This is broader than the strict integer validation added to D45 Disadvantages. Distinguish a valid custom Skill from an unsupported typo instead of banning all custom data.
6. **Unknown configuration preservation is not general.** A saved entry with an unrecognized name and a future config loses its config during refresh and shows no warning (`209.8-feat-adv-config.js:519`). The current unknown-config test targets a recognized Compulsion entry, so it does not cover unsupported names or independently removed modules. Invalid Ring choices do resolve inertly, but the completeness helper itself only checks nonempty values. A proposed subtype must not be considered fully configured merely because a string exists.
7. **Lord Moon's Curse is only price-configured.** A severity badge exists, but the description's full-moon bonus Void and severity-dependent Willpower behavior are not implemented. The sheet does not specify the TN map, so record the missing support without inventing it. Suggested extension: keep the existing tier; optionally add a declared full-moon action and owned once-per-event state, with the mapped gate only after the details are supplied. No automatic real-world lunar calendar is implied.
8. **Current descriptions have source/detail gaps even before a sourcebook audit.** Seven Fortunes, Spirit Realms, Paragon, Dark Paragon, Servant and Forbidden Knowledge identify branch families without complete branch tables. Wealthy's catalogue discount wording was internally problematic; the subsequent targeted Core p.155 check confirms a single total-cost discount (see A16). These entries belong on the configuration backlog even though some exact implementation data will come later.
9. **Schema types are not interchangeable by name.** Current Advantage `skillPick` resolves to Great Potential; Disadvantage `elementPick` assumes Elemental Imbalance's rank and gate formula; current tenet dispatch assumes Consumed or Failure of Bushido; existing rank picks expect explicit option records. New entries need owned, entry/effect-specific dispatch and validators. Reusing the modal host does not mean applying an unrelated entry's resolver.
10. **The approved informational boundary remains valid.** Free Raises and incoming-spell effects may be accurate badges/reminders. Consumed and Failure of Bushido include deliberate informational consequences; changing those to automatic gates or global penalties is a separate scope decision, not proof that the tenet pickers are missing.
11. **Existing UX defects still apply to expansion designs.** Recorded narrow-screen card overflow, inconsistent tooltip affordances, lengthy copy and “XP refund” language remain pending feedback. New pickers should include the requested circled-i affordance and short level/severity wording, with real layout checks. A passing aggregate count must not be described as proof of every mobile option's geometry.
12. **Some documentation is stale.** The original `209.8` header still says `skillPick` and Great Potential are unbuilt and that Doubt has no roll consequence. Current code and catalogue contradict those statements. The ledger's “every variable entry” language describes the approved implemented subset, not all 139 catalogue entries. These are documentation corrections to consider when the audit is approved.
13. **The old schema export is not the live inventory.** `ADV_DISADV_CONFIG_SCHEMA` contains 16 names; the D45 definition table contains 11, including three overrides. Their live union covers 24 catalogue entries. `D45.configTypes` also omits still-live `ringPick` and `severityTier`. Coverage tooling must inspect the effective lookup per catalogue entry rather than treating either export as the whole implementation.
14. **Wrong-list handling is inconsistent.** D45 renders a warning for its Disadvantages in the Advantage list, while the older `activeAdvConfigEffects()` scans both lists without a category check. This is a static risk for hand-edited or imported entries: an Advantage effect can be read from the Disadvantage side while its cost contributes in the opposite direction. Add an independent runtime regression before changing that behavior.

### Status of those fourteen findings after Phase 4.5.3 — 16 September 2026

The list above is the original evidence and is unchanged. This table records where each finding
now stands. "Fixed" means repaired in production, covered by a check that has been shown to fail
against a build without the repair, and surgically removable.

| # | Finding | Status |
|---|---|---|
| 1 | Missing entries treated as ordinary rows | **Open** — this is the A–E scope, not a repair. Unchanged. |
| 2 | Elemental Blessing and Friend of the Elements omit their entry-price adjustments | **✅ Fixed** (4.5.3). Phoenix 3 / Shugenja 3, and the price follows a later Clan change. |
| 3 | Friendly Kami's Shugenja requirement unenforced | **✅ Fixed** (4.5.3). Resolves inert for a non-Shugenja and the row states the reason. |
| 4 | Great Potential misses weapon-attack Skill contexts | **✅ Fixed** (4.5.3). Attack contexts report the same cap as the Skill path. |
| 5 | Validation uneven across releases (`'1x'` read as 1) | **✅ Fixed** (4.5.3) for the original Advantage types. Deliberately not extended into 4.5.2's own shapes, which already validate strictly. The custom-Skill-versus-typo question this finding also raises is **still open** — it is a design decision, not a defect. |
| 6 | Unknown configuration preservation is not general | **✅ Fixed** (4.5.3). A config whose *type* no schema declares is kept and flagged; the deliberate rename-drop behaviour is preserved and separately asserted. |
| 7 | Lord Moon's Curse is only price-configured | **⏸ Parked.** The full-moon bonus Void and the rank-scaled Willpower TN are not stated in this sheet. Needs source material, exactly like Seven Fortunes' Blessing. |
| 8 | Current descriptions have source/detail gaps | **Partly closed.** The three passages the audit actually verified — Perceived Honor, Wealthy, Unlucky — are corrected in the catalogue. The rest of the finding (Seven Fortunes, Spirit Realms, Paragon, Dark Paragon, Servant, Forbidden Knowledge) is unchanged. |
| 9 | Schema types are not interchangeable by name | **Open by design.** 4.5.3 respects it — its strict validation is scoped per type and skips 4.5.2's shapes rather than applying one release's rules to another's data. No new dispatch was added because no new entry was added. |
| 10 | The approved informational boundary remains valid | **Unchanged**, and honoured: Great Potential's new attack reminder is `informational:true` and moves no dice. |
| 11 | Existing UX defects still apply to expansion designs | **Mostly fixed** (4.5.4). Narrow-screen card overflow: measured down to one case by then, now zero at 375px. Circled-i affordance: done, and the finding understated it — `title=` needs hover, so ~20 explanations including all fourteen tenet rules were unreachable on touch entirely. "XP refund" wording: done. **Long copy: deferred** on the project owner's call, measured marginal (worst 197 chars against a 151 benchmark). |
| 12 | Some documentation is stale | **✅ Fixed** (4.5.3) for the `209.8` header's `skillPick`/Doubt claim, corrected by an added delimited block rather than a rewrite so the removal stays byte-identical. The ledger's "every variable entry" wording is corrected in the ledger itself. |
| 13 | The old schema export is not the live inventory | **Partly addressed.** 4.5.3's known-type set is assembled from the live per-entry lookup *unioned* with `D45.configTypes`, rather than trusting either export alone — which is this finding's own prescription. A general coverage tool is still open. |
| 14 | Wrong-list handling is inconsistent | **✅ Fixed** (4.5.3). The catalogue is the oracle for which side a name belongs to; a name in neither library is a custom entry and is left alone. The independent runtime regression this finding asks for exists as `R453-LIST-01/02/03`. |

Three catalogue data corrections that this audit recorded as "pending production correction" are
also now applied: **Perceived Honor** at 2 XP per rank (Core p.152), **Wealthy**'s single
total-cost discount wording (Core p.155), and **Unlucky** keeping the second result (Core p.162).
These correct the library rows only; a character who already added one of these entries keeps the
value they were charged, because silently repricing a saved character is a data mutation that
release deliberately does not make.

## F. Proposed Validation Suite additions

These are additions to fold into the existing integrated suite when implementation is approved. They are not new production features or newly claimed passing tests.

### Common tests, applied to every A01–A16 and D01–D07 entry

| ID | Required assertions |
|---|---|
| V1 Catalogue coverage | Every current library entry has one reviewed classification: implemented, missing, review, or no new config. Fail when a catalogue entry is added without review; do not infer coverage solely from registered schemas or a regex for “choose.” Seven Fortunes' Blessing is a required regression fixture. |
| V2 Choice validation | Empty/cancelled choices visibly incomplete; no first-option default. Reject unknown enum, missing nested field, wrong type, malformed number, unsupported rank and stale linked target. Test add, free-text entry, rename, edit and import paths. |
| V3 XP | Independent expected formulas/tables; ordinary and discounted identities; choice/Clan/School changes; no stale price or double counting; fixed-price unconfigured versus variable-price unconfigured behavior deliberately specified; unrelated XP unchanged. |
| V4 Roll scope | Matching and nonmatching Skill, Trait, Ring, attack, spell, damage, manual and resistance contexts as relevant. Target/faction/item context is declared, never guessed. Test stacked existing modifiers and no stale declarations. Informational Free Raises move no dice. |
| V5 UI | Open, Back, Next, Confirm, Cancel, close/outside click, Escape, focus, keyboard/touch, repeated use; correct badges and concise wording. Measure long option text, tooltip contents and nested-step labels at representative narrow and desktop widths. Reuse the shared host. |
| V6 Persistence | Real collect/apply, save/load and JSON import/export paths; complete and partial configs; custom text escaping; per-entry identity; explicit schema migration if changed. Preserve and visibly flag unsupported config payloads. Computed prices recompute from authoritative choices/identity. |
| V7 Resources/ownership | For applicable entries: uses survive reload, reset restores exactly the approved pool, cancel spends nothing, duplicate clicks spend once, grants are idempotent, and removing/reconfiguring the entry preserves unrelated equipment/skills/money. |
| V8 Removal | Scanner and exact-marker negative fixtures; before/after byte comparison; build hash; unchanged retained harness results and registry shape; independent module removal followed by complete Phase 4.5 removal. |

The entry-specific tests in A and B are additional fixtures under these common groups. None of the unknown Fortune/realm/precept tables can use the implementation itself as its test oracle. Once approved rule data is supplied, record expected branch behavior independently so a deliberately wrong branch can be shown to fail.

### Repairs to the existing tests

- Add failing fixtures for both existing missed price adjustments, Friendly Kami without a Shugenja School, and Great Potential on ATTACK contexts.
- Add malformed numeric configs for existing Advantages, unsupported-name configs, and save reload after an optional config module is absent.
- Add wrong-list fixtures and a live-schema inventory assertion that includes the D45 overrides and original Ring/severity types.
- Test no obsolete secondary Skill survives switching Fortune/tenet/realm branches; test identities independently when there are multiple same-name entries.
- Add cross-entry fixtures for Naishou Citizen/Blessing, potential Blissful Betrothal links, and Void Versatility with the existing slot pools. Do not modify the core registry-length expectation to accommodate another seat.
- Test narrow layouts using actual text bounds inside cards, not only the width of the outer modal. Include both option labels and opened tooltip contents.

### Existing results measured during this audit

| Existing suite | Result |
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
| Spell-slot visibility | 6/6 |
| **Total** | **504/504** |

Re-measured 16 September 2026 against the Phase 4.5.3 build (`18a740e8…`): every suite above
still reads **exactly** these totals, and Feature 4.53's own suite adds **39/39**, for a combined
**543/543**. The same thirteen suites also read identically against the build with 4.5.3
surgically removed, which is what makes the removal claim more than an assertion.

The spell-slot suite is a visibility suite. Its pass does not settle the user's separately reported mixed manual/overflow slot-accounting bug. No sourcebook conformance, fresh surgical-removal execution, or real-device UX certification is claimed for this audit.

## G. Proposed Regression Matrix additions

| Area | Risk | Entries / required regression |
|---|---|---|
| Catalogue completeness | High | All 139 current entries plus future additions; no missing choice disappears behind a hardcoded schema list. |
| Variable XP and identity adjustments | High | Blackmail, Perceived Honor, Servant, Wealthy, Dependant, Unlucky; each Clan/School discount; existing Elemental Blessing/Friend of the Elements price repairs. |
| Linked entry pricing | High | Seven Fortunes' Blessing with Naishou Citizen; any approved Blissful Betrothal integration; removal/change in either order, no stale discounts. Active Blessing replacement preserves purchase expenditure; editing a selection incurs no charge or refund. |
| Branch dispatch | High | Blessing, Curse, Paragon, Dark Paragon, Knowledge and both Realm entries; correct branch only and cleared secondary fields. |
| Conditional roll scope | High | Heart of Vengeance, Inheritance, Doubt and Fortune/tenet/realm effects; wrong target, normal attacks versus Contested Rolls, combat Skill context, and transient declarations. |
| Effective rank / derived values | High | Soul of Artistry and Weakness; bought ranks and XP preserved, all approved derived consumers agree. Perceived Honor and Darling of the Court remain contextual readouts. |
| Resources and rerolls | High | Dark Paragon and Unlucky; independent session pools, correct replacement policy (Unlucky always keeps the second result), payment once, cancellation and nested gate behavior; no replay of original action payments or gates. |
| TN reporting equivalence | High | Rule-specific TN +N becomes reported-total −N only for Ring, Trait, Skill, spell-casting, and attack rolls. Preserve TN labels and Raise semantics; exclude damage; no invented pass/fail with unknown TN and no double application with known TN. |
| Equipment, skills and money ownership | High | Inheritance, Forbidden Knowledge, Servant/Wealthy if grants are approved; no duplicate grant or deletion of player-owned data. |
| Spell slots and eligibility | High | Void Versatility: purchase-time Ring persists; preview permits ordinary Void payment or that Ring only; casting dice/identity/effects remain Void; correct selected pool, single debit, manual pips, shared Bonus warnings and exhaustion, eligible school/affinity, and restoration on removal. |
| Incoming-spell reminders | Medium | Wrath of the Kami and Magic Resistance show correct information while own casting/damage and other characters remain unaffected. |
| Persistence and migration | High | All configs and resources; corrupt values, custom skills, unknown names/removed modules, stable linked identities, real JSON round-trips. |
| UI and accessibility | Medium | Every new step/card/badge/control, short text, circled-i tooltip, narrow-screen text geometry, keyboard focus and cancellation. |
| Removal and shared pipeline | High | Exact owners, no marker-shaped prose contamination, unchanged registry seat/order, byte-identical rebuild to the recorded baseline, retained harness results identical. |
| Scope discipline | High | No sourcebook additions, invented option lists/numbers, duplicate school-management system, or unapproved GM/VTT automation. |

## Removal contract for every proposal

All proposals remain inside Phase 4.5. A future point release may use `PART I FEATURE 4.53` (unused in the inspected source), with independently owned subcomponents where necessary. This is a proposed marker identity, not a release that has been implemented. The original marker is `PART I PHASE 4.5`; the existing Disadvantages markers are `PART I FEATURE 4.52`, `4.521`, `4.522`, and `4.523`.

| Hook | Proposed ownership boundary |
|---|---|
| R1 Standard entry configuration | New name-keyed schemas, validators, resolver branches, UI and serializer adapters stay in new owned fragments. Add manifest entries only. Reuse the existing modal host and current `adv-config` contributor. No library-row schema edits and no new registry seat. |
| R2 Context and conditional effects | Own the added preview controls and transient context fields; guarded calls or removable wrappers into existing flow. Never add unmarked state to common roll code. Fixed informational effects remain informational. |
| R3 Session resources / transactions | Own pool rendering, use/reset actions, payment and reroll policy. Keep pending rolls transient. Isolate Dark Paragon/Unlucky mechanics so they can be changed without editing Luck, Kharmic Tie or the gates. Declare any dependency on those systems explicitly. |
| R4 Granted items / skills / money | Use stable source IDs and a reversible grant record or effective overlay; distinguish created from linked player-owned data. Deleting/reconfiguring the entry reverses only its owned contribution. A code remover must not scan and mutate personal saved characters. |
| R5 Effective ranks and derived values | An owned, guarded derived-value adapter rather than destructive edits to bought Trait/Skill data. Removing it restores original reads; all impacted consumers and dependencies must be inventoried before implementation. |
| R6 Cross-entry links | Store explicit stable references only where approved; invalidate missing links visibly. Each linking/discount rule is owned by the new release, and removing one entry or module leaves the other's base behavior intact. |
| R7 Casting resource adapter | Selected-Ring slot-source eligibility, choice and debit orchestration in an isolated fragment. No redefinition of the shared Bonus pool or unmarked edits to casting diagnostics/slot tracking. |

Every proposed entry inherits R1 plus the hooks listed under it. Human-review proposals inherit the relevant hooks if later approved.

Before any future expansion is called complete:

1. Record the actual pre-expansion source/artifact bytes. Today that artifact is `27b57eff…`, 2,476,062 bytes; if other work lands first, measure a new baseline rather than reusing this hash blindly.
2. Keep all CSS, JS, schema, markup and save adapters under the exact release/component markers. Reuse the existing paired-insertion/hand-back protocol for any shared-file additions. Plain comment prose naming another marker must not accidentally transfer ownership.
3. Run `feature-dependencies.py` with each fragment's JS names and explicit UI IDs/classes/custom properties via `--also`. Its declaration detector expects exactly two leading spaces; declarations outside that shape can be missed and must be inventoried explicitly. Its legacy owner check uses prefix matching; a passing scan alone does not prove exact removal. Review declared dependencies and use exact token matching in the remover.
4. Use scratch copies to remove the new release alone, then its independent components, then the whole Phase 4.5 stack in dependency order. Assert that no removed range contains another phase's marker. Preserve original line endings, final newlines, manifest order and unrelated additions.
5. Require the new-release-only removal to rebuild byte-identically to its recorded pre-release artifact. The existing subsequent removal targets remain the historical `4355dec4…` expanded-Advantage build and `9dbaf6c6…` pre-Phase-4.5 build, where that exact historical comparison still applies.
6. Run the unchanged retained harnesses against present/removed builds and compare their exact results. The six baseline contributors and the existing single `adv-config` seat must retain the established behavior and order; do not add a seat or weaken the pipeline checks.
7. Prove unknown/unsupported configs remain legible when a supported component is removed. This is a current gap to fix, not an existing guarantee. Full removal restores the older save-format reader; document its newer-save refusal instead of promising forward compatibility it never had.

Byte-identical **code removal** and safe **character-data effects** are different tests. A matching HTML hash does not prove that a previously granted skill, equipment row, resource use or spent currency can safely be reversed in a saved character. Both contracts must be explicit wherever grants or links are proposed.

## Human review and full non-missing catalogue

The sections below complete the exhaustive classification. “No additional configuration” means no new Phase 4.5 pick-time modal/schema is indicated by the present description. It does not certify that the entry's fixed effect is already automated or RAW-correct.

### Human-review Advantages — 5

These are plausible additions or integrations, but the current description leaves either their mechanics, their need for a dedicated configuration, or their ownership in another system unsettled. Proposed fields here are illustrative, not implemented schemas. No automatic effects should be invented to fill the gaps.

| Entry | Why it might qualify; proposed modal/UI | Possible XP/modifier; rules/source risk | Removal/scope risk |
|---|---|---|---|
| Blissful Betrothal | Link the spouse to the applicable Kharmic Tie; optional spouse-name modal and badge, e.g. `{spouse, kharmicSourceId}`. Other listed discounts need no target choice. | Own cost 3; description discounts Gentry, spouse-only Kharmic Tie, Social Position and “Wealth” by 2 each. Minimums, stacking and `Wealth` versus `Wealthy` need confirmation. Do not infer the spouse from a matching name. | R1/R6. Cross-entry price rules may belong to Phase 6 synergy work; links must survive reorder and fail visibly if deleted. No permanent price edits to other entries. |
| Gaijin Gear | Item selection/name plus optional link to existing equipment, e.g. `{itemId,itemName,sourceId}`. | Own cost 5, Mantis/Unicorn 4. Each foreign item's mechanics are unspecified. A named item is safe metadata, but a weapon/tool profile cannot be invented. | R1/R4. Equipment engine boundary; linking player-owned gear must not make it deletable as a generated grant. |
| Great Destiny | One session-use pip/reset and manual “Destiny intervened” action, e.g. `{remaining:1}`. No pick-time rank choice. | Cost 5; described killing-blow protection is fixed. Whether a blow is fatal and how “1 Wound remaining” maps to the tracker require care. | R1/R3/R5. Optional resource UX; no automatic rewriting of wounds without a reviewed trigger/representation. Keep independent from wound management. |
| Higher Purpose | Optional goal-name modal/badge and manually recorded progress, e.g. `{goal}`. Existing notes may suffice. | Cost 3; an extra Experience Point when progress is made is a judgment at the table. Recording a goal must not automatically award XP. | R1; R4 only if an approved award ledger is added. Phase 12 management/progression boundary; preserve actual earned/spent XP when removing metadata. |
| Inner Gift | GM-approved gift name/selection and notes, e.g. `{gift,notes}`; additional pick only where an agreed gift needs one. | Cost 7. Animal Ken, Empathy, Foresight, Lesser Prophecy and Spirit Touch are examples in the sheet, not a complete mechanical table. | R1/R2. GM/custom content cannot become arbitrary executable modifiers; preserve narrative content and isolate any later approved effect modules. |

### Human-review Disadvantages — 17

The following optional controls need human review. In particular, adding an event-triggered resistance button is different from finding a missing pick-time tier/Skill/Element choice. None implies that the app can determine the GM's decision or the narrative situation.

| Entry | Why it might qualify; proposed modal/UI | Possible modifier/award; rules/source risk | Removal/scope risk |
|---|---|---|---|
| Uncentered | School-derived type/price badge; potentially `{type:'schoolCategoryAutoPick',category}`. No personal subtype choice if the school data settles it. | Current description gives 4 for Brotherhood monks, 2 for Clan monks and Monk-only eligibility. Multiple-school/category handling needs a policy. Existing code comment admits the price limitation. | R1. Similar to Sacred Weapon's auto-derived pattern, but the already-owned Void Kiho ban belongs to the Kiho system and must survive Phase 4.5 removal. Also audit stated incompatible Advantages separately. |
| Bad Fortune | GM-agreed variant and optional subject/name, e.g. `{variant,subject,notes}`; badge and Change. | Library value 3. Listed misfortunes suggest a family, but do not define a full set of prices/effects. Do not assign a generic curse modifier or assume the examples are exhaustive. | R1/R2. Preserve custom GM text; no invented branch arithmetic or implicit faction/condition engine. |
| Brash | Manual “Threatened or insulted” Willpower check action; no purchase tier. | Award 3, Lion 4. The sheet's abbreviated “TN 25, +Honor Rank” wording must be resolved before encoding which side receives Honor. | R1/R2. Generic situational-check boundary; automatic forced attacks would exceed a companion's context. |
| Can’t Lie | Manual “Resist correcting a known lie” button; no persistent subtype required. | Fixed award 2 and described Willpower TN 20. The app cannot determine knowledge of a lie. | R1/R2. An isolated optional check utility; no blanket penalty or forced dialogue state. |
| Contrary | Manual resistance check, with explicit GM TN if needed. | Award 3, Imperial/Courtier 4. No TN formula is present in the description. | R1/R2. Do not hardwire the trigger into all Social rolls; potential generic situational-check feature. |
| Dark Fate | One-use session pip and manual intervention, e.g. `{remaining:1}`. | Fixed award 3; fixed killing-blow effect, not a variable purchase. Its wound representation needs review. | R1/R3/R5. Death prevention and narrative fate are not automatically detectable; isolate from core wounds. |
| Disbeliever | Per-roll “Social interaction with a Shugenja/Monk” declaration. | Fixed award 3; described Social TN +5 in that context. No NPC class should be inferred from names. | R1/R2. Could use future contextual modifiers; not a new pick-time variant or global penalty. |
| Epilepsy | Manual trigger and Willpower TN 15 check; state/reminder only as agreed. | Award 4, Crane 5. Stress/lights and the full seizure consequences are not specified as machine-readable conditions. | R1/R2. Do not turn a failed check into an invented generic debuff; optional condition-management boundary. |
| Haunted | Optional ancestor name; GM-selected-roll control and session-use pip. | Fixed award 3; described −1k1 on one GM-chosen roll per session after angering the ancestor. Not automatically the next roll. | R1/R2/R3. The GM picks the event/roll; isolate payment and context, preserve ancestor notes. |
| Jealousy | Named rival and replace-rival action, e.g. `{rival}`. | Fixed award 3. Target is narrative with no differing price or roll modifier stated; notes might be sufficient. | R1. No automatic judgment that a rival is beaten or a new rival chosen. |
| Lame | Per-roll “Requires lower-body Agility” declaration. | Fixed award 4; Water treated as 1 for movement, +10 TN on applicable lower-body Agility rolls. No tier or limb choice stated. | R1/R2/R5. Movement arithmetic belongs to derived-stat handling; do not penalize every Agility roll. |
| Lost Love | Active-reminder toggle, Void-refocus action and twice-per-day tracker, e.g. `{active,refocusUsesToday}`. Optional person-name field. | Fixed award 3; described +5 to all TNs while affected. Trigger, daily reset and applicability to damage need an explicit design; Phobia's damage exclusion is not automatically inherited. | R1/R2/R3. Independent global-effect and Void-spend component, with no wall-clock campaign-day inference. |
| Missing Limb | Limb name and per-roll “Requires this limb” declaration, e.g. `{limb}`. | Fixed award 6; described +10 TN on tasks requiring it. Exact limb choices and task mapping are not stated, so automatic weapon/Skill bans would be invented. | R1/R2. Strong optional target-binding candidate, but approve manual context versus derived impairment automation first. |
| Overconfident | Manual “Assess superior foe” Perception TN 20 action. | Award 3, Lion/Mantis 4. Determining a clearly superior foe is outside the player's available sheet state. | R1/R2. Generic resistance/check UX; no fabricated opponent power model. |
| Rumormonger | Manual resistance modal with subject Glory or agreed TN input. | Award 4, Courtier 5. The description mentions Glory scaling but supplies no formula. | R1/R2. No invented formula or persistent NPC record; optional generic situational-check utility. |
| Soft-Hearted | Manual killing-resistance TN 20 action and guilt-active/day-reset control, e.g. `{active}`. | Award 2, Phoenix 3; described all TNs +10 for a day after a kill. Kill detection, expiry and damage-roll treatment need review. | R1/R2/R3. Independent condition scope; avoid automatic kill detection or real-world timer expiry. |
| Touch of the Void | Resistance gate associated with the relevant Void spend; Dazed reminder. No pick-time choice. | Award 3, Phoenix 4; description gives +2k1 in place of +1k1 and Willpower TN 30 risk. Exact timing and Dazed behavior are not fully described. | R1/R2/R3. Broader fixed Void/condition mechanics; isolate any adapter from existing Void, Luck and Willpower gates. |

A later source review may promote a review entry to definite configuration work, or supply enough detail to implement a definite entry's missing branches. That does not change what the present sheet does today. Narrative subjects for already-configured Phobia, Compulsion, Cast Out, Obligation and Allies can also be discussed as UX improvements; they are not new catalogue entries and are not counted twice.

### No new Phase 4.5 configuration: Advantages — 40

For **each** row below: no new entry modal/config is required by the current description, and this configuration expansion should leave it alone. A missing fixed bonus, price adjustment, eligibility check or derived-stat effect is a separate issue, not proof of a missing configuration choice. Different School and Multiple Schools use the existing school controls rather than a second independently stored school choice inside the Advantage.

| Entry | Reason for excluding a new configuration |
|---|---|
| Absolute Direction | Fixed direction knowledge; no selected Ring, region, rank or subtype. |
| Balance | Fixed bonus when using Honor in the specified resistance context. |
| Bland | Fixed optional opposing recognition-TN increase; no purchase branch. |
| Blood of Osano-Wo | Fixed weather protection and nature-spell damage rule. |
| Clear Thinker | Fixed resistance bonus under the stated condition. |
| Crab Hands | Fixed effective-rank treatment across unskilled Weapon Skills; no family choice. |
| Crafty | Fixed effective-rank treatment across unskilled Low Skills; no selected Skill. |
| Dangerous Beauty | Fixed Temptation condition/bonus; opponent circumstance is roll context, not a subtype. |
| Daredevil | Fixed Athletics/Void effect; no selected Skill or rank. |
| Different School | School selection belongs to existing identity/school controls; no duplicated Advantage picker. |
| Enlightened | Fixed Void XP discount; no choice of Ring. |
| Fame | Fixed Glory increase. |
| Friend of the Brotherhood | Fixed Kiho-pricing eligibility; handled by existing Kiho rules. |
| Hands of Stone | Fixed unarmed damage bonus. |
| Heartless | Fixed resistance bonus for specified emotional influence. |
| Hero of the People | Fixed recognition rule for commoners. |
| Imperial Scribe | Fixed prerequisites and bonuses; eligibility/linting work, not a choice. |
| Imperial Spouse | Fixed Status change and Imperial-interaction bonus. |
| Inari’s Blessing | Fixed fasting/Void-recovery exception. |
| Irreproachable | Fixed Temptation resistance bonus. |
| Ishiken-Do | Fixed Void-casting eligibility, with no selected Element. |
| Large | Fixed size and damage rule; no chosen weapon/rank. |
| Leadership | Ally chosen at each use is ordinary combat context, not a persistent Advantage subtype. |
| Multiple Schools | Existing multi-school progression controls already own the selection and ranks. |
| Precise Memory | Fixed recollection-roll bonus. |
| Prodigy | Fixed bonus to all School Skills, not one chosen School Skill. |
| Quick | Fixed Initiative behavior. |
| Quick Healer | Fixed effective Stamina for healing. |
| Read Lips | Distance-dependent task TN, not a rank/tier bought with the Advantage. |
| Sacrosanct | Fixed Honor requirement and conditional protection. |
| Sage | Fixed unskilled Lore treatment; no Lore specialization choice. |
| Sensation | Fixed unskilled Perform treatment; no Perform-family choice. |
| Shadowed Heart | Fixed opposing intent-reading TN adjustment. |
| Silent | Fixed Stealth bonus. |
| Social Position | Fixed Status increase. |
| Strength of the Earth | Fixed wound-penalty reduction. |
| Tactician | Fixed optional Mass Battle adjustment; no permanent branch selection. |
| Virtuous | Fixed starting Honor increase. |
| Voice | Fixed vocal-Perform condition/bonus. |
| Wary | Fixed ambush-detection condition/bonus. |

### No new Phase 4.5 configuration: Disadvantages — 30

For **each** row below: no new entry modal/config is indicated, and this configuration expansion should not touch it. Fixed-rule automation, character eligibility and other-phase bugs are not declared complete by this exclusion.

| Entry | Reason for excluding a new configuration |
|---|---|
| Anachronism | Fixed eligibility and category-wide TN penalty. |
| Ascetic | Fixed outfit/Glory behavior; identity-based price adjustment is not a subtype selection. |
| Bad Eyesight | Fixed ranged-attack/Perception penalty. |
| Bad Health | Fixed effective-Earth treatment for specified uses. |
| Bitter Betrothal | Narrative situation and fixed identity-adjusted value; details can remain notes. |
| Black Sheep | Fixed narrative/social restriction. |
| Blind | Fixed impairment package; no purchased severity or selected sense. |
| Dark Secret | Fixed-value narrative secret; free notes do not require a new mechanical schema. |
| Dishonored | Fixed Status restriction. |
| Disturbing Countenance | Fixed Social Skill penalty and Spider value adjustment. |
| Driven | Narrative goal without a differing price or modifier by chosen goal. |
| Fascination | Narrative interest without a differing price/effect by subject. |
| Forced Retirement | School/progression choice belongs to existing school controls and progression design. |
| Frail Mind | Fixed opposing-roll benefit; no selected opponent or Trait. |
| Gaijin Name | Fixed Social-roll explosion restriction; character name already has a field. |
| Greedy | Fixed opposing Temptation/Bribery benefit. |
| Gullible | Fixed opposing Sincerity/Deceit benefit. |
| Hostage | Narrative diplomatic situation; no choice-dependent arithmetic. |
| Idealistic | Fixed Honor-loss adjustment. |
| Infamous | Fixed starting Glory/Infamy treatment. |
| Insensitive | Fixed narrative condition for Void expenditure; no pick-time choice. |
| Lechery | Fixed opposing Temptation/Seduction benefit. |
| Low Pain Threshold | Fixed wound-penalty adjustment; wound rank is current state, not a purchased disadvantage rank. |
| Momoku | Fixed Void restriction; any missing enforcement is a fixed-mechanics issue. |
| Obtuse | Fixed XP multiplier with named category exceptions; no player-selected Skill. |
| Permanent Wound | Fixed wound treatment. |
| Shadowlands Taint | Fixed initial Taint value; no rank selection in the description. |
| Small | Fixed movement/melee-damage behavior and incompatibility. |
| Social Disadvantage | Fixed initial Status. |
| True Love | Fixed narrative Void requirement; an optional lover name can remain notes. |

## Recommended decision order

1. Review the **23 missing handlers** as the proposed remaining configuration scope. Approve additions by entry rather than treating the 504 passing checks as evidence of catalogue completion.
2. Decide the **22 review cases** individually. Keep optional context buttons, GM decisions, equipment profiles and school/progression features from silently becoming mandatory configuration work.
3. Resolve the current-sheet data gaps and the confirmed repairs to existing handlers. Then design the approved point release and integrate its validation/removal tests. Any later sourcebook-wide completeness audit is a separate task.

This audit stops here. Implementation and any further phase require explicit approval.

> **Step 3 is now done — 16 September 2026.** Phase 4.5.3 (Configuration Repairs) took the
> confirmed repairs to existing handlers and the three verified catalogue data corrections, and
> shipped them as a self-contained, byte-identically removable point release. Lord Moon's Curse
> is parked for source material.
>
> **Steps 1 and 2 remain open and are the natural next slice.** All seven remaining
> Disadvantages (D01–D07) carry complete approved branch tables in the addendum below, which
> makes them implementable without the sourcebooks; the Advantages are mixed, with Seven
> Fortunes' Blessing, Soul of Artistry's Artisan/Craft family list, and the per-realm effects for
> Touch of the Spirit Realms still genuinely source-gated. The UX items in finding 11 should be
> weighed as a prerequisite rather than a follow-up: D01's ten-realm picker and D04's
> seven-Fortune picker go into the same modal whose card overflow is still unfixed.

## User review addendum — Advantages scope decisions

Recorded 13 September 2026 during review of this audit. These notes do not implement anything;
they record the approved Phase 4.5 follow-up approaches and distinguish them from deferred
enhancements. The user has now accepted recommendations for points 1–5, 7, 9–11, and 13;
the already-confirmed points 6, 8, 12, and 14 remain unchanged. This replaces the earlier
exclusions of Blackmail, Forbidden Knowledge, Inheritance, and Way of the Land, and the
earlier claim that a Servant record necessarily requires full NPC sheets.

### Approved approaches for future Phase 4.5 implementation

| Advantage | Decision |
|---|---|
| Blackmail | Name/Status modal, calculated XP, and a target badge. Save the player-entered target Status as the agreed purchase detail; it must not track later NPC circumstances or the player's own Status. Use it to calculate the purchase price, including the listed Scorpion adjustment once confirmed. The player manages the secret, demands, and relationship. No NPC sheet, automatic NPC monitoring, or roll modifier is needed. |
| Darling of the Court | One Advantage row with an Add court action, free-text court names, and selectable court badges. Maintain one selected court and one "Court in session" toggle for that court; do not use independent per-court toggles or stack Status bonuses. Show contextual Status separately, e.g. `Status 3 — counts as 4 in this court`, leaving actual Status and unrelated calculations such as Blackmailed unchanged. Each court costs 2 XP normally or 1 XP for a Courtier; three courts cost 6 XP or 3 XP respectively. |
| Forbidden Knowledge | Free-text subject, optional agreed-effects note, and reference examples. Show a short subject badge; place the longer explanation behind an accessible circled-i information icon. Clearly identify any Lore benefit or situational effect as manually managed so the player does not assume it was applied. No automatic Lore-rank grant, roll effect, or inference from free text is approved. |
| Heart of Vengeance | Save a chosen Clan/faction target and show its badge. In eligible Skill, Trait, Ring, and manual dice-tray previews, offer `Contested against [faction] — apply +1k1`. The declaration starts unchecked for each new roll and is not saved as an armed/persistent toggle. Manual rolls require the same explicit declaration. Exclude weapon attacks, damage, and spell casting. Confirm Imperial-family eligibility when reviewing the permitted target list. Keep this feature separately isolated in the same manner as Kharmic Tie. |
| Inheritance | First stage: free-text heirloom name and a named badge/reminder. No equipment simulation, automatic item creation, or GM tracking is required. A later optional per-roll checkbox, `Non-combat Skill Roll using [heirloom]`, could apply the listed +1k1, but this mechanical enhancement is deferred; the badge is the approved initial scope. |
| Naishou Citizen | Implement as a tag-bearing Advantage. When present, it enables the cheaper Seven Fortunes' Blessing interaction. Keep one current linked Fortune, replacing the active Blessing when appropriate. Keep that active selection separate from purchase accounting: replacing it must not silently refund previous purchases, and editing a selection must not itself charge XP. Show a badge naming the linked Fortune. During Social rolls, show the aligned-monks Free Raise reminder only when both Advantages are present and the Blessing is configured. |
| Paragon | Initial scope: tenet picker, saved tenet, badge, and a concise reminder of the selected benefit. Honor awards stay player-controlled. Assess potential roll automation separately for each tenet after reviewing its effect; a future explicit declaration checkbox may suit some tenets. Those later modifiers are deferred, not declared inherently impossible. |
| Perceived Honor | Implement with a positive whole-number rank modal and no invented rank cap, matching the Elemental Imbalance free-number style. Verified Core Rulebook p.152 cost: 2 XP × rank; ten ranks cost 20 XP. Show a badge such as `Perceived Honor: current Honor rank + selected rank` for attempts to discern Honor; do not overwrite actual Honor. The existing catalogue's 3-XP base and description need correction during production implementation. |
| Servant | Reference/tooltip-first scope using confirmed examples. A compact record containing name, type, specialty, purchased upgrades, and calculated XP is a feasible companion feature, but remains deferred for complexity. It does not inherently require full NPC sheets. No independent servant combat, equipment management, or NPC-management subsystem is approved. |
| Soul of Artistry | Ask the player to select Artisan or Craft, using the supplied authoritative skill-family list for matching. Automatically treat an otherwise unskilled matching roll as Skill Rank 1, including skilled dice/explosion behaviour and the correct preview; do not merely add a die while retaining unskilled penalties. No activation toggle or resource expenditure is needed. Leave purchased Skill Rank, Insight, and skill-purchase XP unchanged. Cost is 4 XP normally or 3 XP for Crane OR Courtier; meeting both conditions gives no further reduction. |
| Touch of the Spirit Realms | Initial scope: realm picker with accessible circled-i information icons, saved realm, selected-realm badge, and benefit reminder. Defer automation individually by realm effect until reviewed; suitable effects may later be automated while others remain reminders. No automatic realm-effect package is approved at this stage. |
| Void Versatility | Choose and save one non-Void Ring when purchasing the 4-XP Advantage; require Shugenja with Void affinity. In a Void spell's casting preview, offer ordinary Void payment or payment from that saved Ring only. Casting dice, spell identity, and relevant effects remain Void. Preserve exhaustion checks, single-slot spending, and existing shared Bonus-pool warnings; do not create a separate Bonus allowance or select a new Ring per cast. Confirmed against The Great Clans p.199 and accepted by the user. |
| Way of the Land | Offer an optional free-text region name beside the Advantage and a reminder badge when populated. No map, location detection, active-region toggle, or automatic navigation adjudication is needed. An omitted optional region must not block use of the sheet. Preserve the listed 2-XP base price and 1-XP Unicorn price. |
| Wealthy | Implement with a positive whole-number rank modal and no invented rank cap, matching Elemental Imbalance. Grant the user-agreed 2 koku per rank once, with recorded ownership preventing repeated grants on recalculation, save/load, import, or edits. Core p.155 now confirms the user's original formula: `XP = rank × 1 − (Crane OR Unicorn OR Imperial ? 1 : 0)`, with the discount applied once to the total. Five ranks give 10 koku under the agreed grant design and cost 5 XP normally or 4 XP for an eligible character. Correct the existing catalogue's erroneous per-rank discount wording during production implementation. |

### Deferred enhancements and companion-app boundaries

| Advantage | Decision |
|---|---|
| Forbidden Knowledge | Automatic Lore grants and conditional effects remain outside the approved note/reference implementation; neither the app nor free-text parsing decides player/GM agreements. |
| Inheritance | The optional +1k1 non-combat Skill-roll declaration is a later enhancement, not part of the initial badge implementation. |
| Servant | A compact name/type/specialty/upgrades record with XP calculation remains deferred for complexity, not excluded as incompatible with a companion app. Full NPC sheets and independent combat/equipment systems are outside this scope. |
| Paragon | Review roll support tenet by tenet later; Honor awards remain player-controlled. |
| Touch of the Spirit Realms | Review automation effect by effect later; implement selected-realm reference help first. |

For all approved notes and choices, persist the Phase 4.5-owned fields through save/load and
JSON import/export. Keep optional notes optional. Heart of Vengeance's per-roll declaration
is transient and must not survive into another roll or a saved character. Reuse existing
picker, preview, and information controls with scoped ownership; all changes retain the
existing byte-identical-removal contract, unchanged other-phase harnesses, non-colliding
markers, and no additional modifier-registry seat.

### Requires later confirmation before implementation

| Advantage | Open point |
|---|---|
| Seven Fortunes' Blessing | Still remains the canonical missing variable-configuration Advantage. Needs the complete Fortune list, Fortune-specific effects, any required secondary Skill choices, Clan discount behavior, and its interaction with Naishou Citizen confirmed before implementation. |
| Wealthy | Base price, eligible groups, and the single total-cost discount are now source-confirmed (Core p.155). Before implementation, cover the rank-1 discounted-cost boundary without inventing a minimum from unrelated Advantages, and preserve the agreed one-time money-grant lifecycle. No further confirmation of the total-cost discount formula is needed. |
| Blackmail | The name/Status/price approach is approved. Confirm rule details and any low-Status/minimum-price handling before implementing; never infer a global minimum from another Advantage. |
| Darling of the Court | The single-court selection/toggle design and listed 2-XP/1-XP-per-court pricing are accepted. Verify rule text during the relevant source-data pass; do not substitute actual Status changes for the contextual readout. |
| Forbidden Knowledge | The free-text subject and manual-effect note are approved. Supply/verify reference examples; do not invent Lore ranks or situational bonuses. |
| Heart of Vengeance | Confirm the permitted target list, including Imperial-family choices, before populating the picker. The transient per-roll declaration and roll-kind boundaries are approved. |
| Soul of Artistry | Supply/verify the authoritative Artisan/Craft family list, including relevant specializations, before enabling automatic matching. |
| Paragon / Touch of the Spirit Realms | Prepare accurate selection options and concise benefit reminders. Initial picker/reference scope is approved; approval does not include every possible future modifier. |
| Servant | Supply/verify reference examples for the approved tooltip-first presentation. The compact record remains a separately deferred enhancement. |

These decisions replace the earlier neutral audit posture for the listed Advantages. The original
audit entries remain useful as the evidence trail, but the implementation backlog should follow
this addendum unless the user revises it.

### Planned QA for the newly accepted approaches

These are acceptance criteria to integrate into the existing Validation Suite and Regression
Matrix during implementation. They are not new tests run or new completion claims.

| Advantage | Planned validation | Regression areas |
|---|---|---|
| Blackmail | Target name and agreed purchase Status round-trip; price uses that entered value and confirmed discount; changes to the player's Status do not reprice it; no automatic NPC updates. | Configuration, XP, persistence, isolation |
| Darling of the Court | Add/select/rename courts without duplicating purchases; exactly one selected court and one session toggle; no stacked +1 Status; three courts cost 6 XP or 3 XP for a Courtier; actual Status and Blackmailed stay unchanged. | UI, XP, contextual values, persistence |
| Forbidden Knowledge | Subject and optional agreed-effects note round-trip; short badge and accessible information control; clearly manual Lore/effect reminder; no skill-rank or dice changes. | UI, persistence, absence of unintended effects |
| Heart of Vengeance | Only the approved roll kinds offer the declaration; it starts unchecked for each new roll, including manual rolls; applies +1k1 once when declared; no attack/damage/spell bonus, save-state activation, or carry-over after cancel. | Roll scope, UI, transient state, isolation |
| Inheritance | Heirloom name/badge round-trip; initial implementation neither grants equipment nor applies +1k1; the later declaration remains deferred. | UI, persistence, equipment/roll isolation |
| Paragon | Tenet and reminder round-trip; change clears stale reminders; no automatic Honor awards or unapproved roll effects. | Configuration, UI, persistence, Honor isolation |
| Servant | Reference examples are accurate and accessible; tooltip-first implementation creates no servant sheet, upgrades, or player-skill modifiers. | Reference UI, absence of unintended effects |
| Soul of Artistry | Match the approved family/specializations; zero-rank matching rolls behave as skilled Rank 1 in preview and resolution; trained/unrelated rolls remain unchanged; no purchased Rank/Insight changes or duplicate 0-to-1 lift; Crane/Courtier/both each cost 3 XP, other characters 4 XP. | Effective skill rank, dice behaviour, XP, persistence |
| Touch of the Spirit Realms | Realm selection, information controls, badge, and reminder agree and round-trip; changing realm clears stale help; no unapproved automated effects. | Configuration, UI, persistence, roll isolation |
| Way of the Land | Optional region blank/populated/edit/cancel cases work; populated badge round-trips; preserve Unicorn pricing; no location tracking or navigation modifier. | Optional configuration, UI, XP, persistence |

Every row also inherits the existing Phase 4.5 surgical-removal and unchanged-harness checks.

### Targeted source checks and future QA acceptance criteria — 13 September 2026

These follow-ups verified the three requested Advantage passages, not sourcebook completeness. Sources:

- [Core Rulebook](</C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books/Legend of the Five Rings Rpg Core Rulebook 4th Ed..pdf>), printed p.152 / PDF p.155: Perceived Honor cost and discernment-only benefit; printed p.155 / PDF p.158: Wealthy base price and total-cost discount. The introductory Advantage pricing text was also checked for relevant context; no minimum for Wealthy was established by those passages.
- [The Great Clans](</C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books/Legend of the Five Rings The Great Clans L5R-4e.pdf>), printed p.199 / PDF p.200: Void Versatility cost, selected Ring, and eligibility.

Fold these cases into the existing Validation Suite when implementation is approved:

- **Naishou Citizen:** preserve previous expenditure on active-Blessing replacement; zero XP change from ordinary selection edits, cancellation, rendering, or reload; intentional purchases recorded once; the badge/reminder follows the current configured Fortune without duplicate active effects.
- **Perceived Honor:** rank 1 costs 2 XP; rank 10 costs 20 XP; reject invalid/non-integer ranks; changing actual Honor updates only the perceived readout; actual Honor-based effects stay unchanged; config and pricing round-trip.
- **Void Versatility:** purchase-time choice of Air/Earth/Fire/Water persists; enforce eligibility; preview offers ordinary Void payment or the saved Ring; Void casting calculations and effects stay unchanged; preserve single debit, exhaustion checks, Bonus warnings/shared-pool accounting, and existing failure/consumption behaviour. Cover the reported manual-pip interaction before integrating the new source choice.
- **Wealthy:** distinguish rank, XP, and koku; five ranks give base 5 XP and the agreed 10 koku; Crane, Unicorn, and Imperial each pay 4 XP, with other identities paying 5 XP. Test one total discount regardless of rank or multiple identity matches, the rank-1 boundary, config persistence, no duplicate money grants on recalculation/load/import/edit, and no automatic clawback of already-spent money.

These are proposed acceptance checks, not new passing test results. Existing Phase 4.5 persistence, registry, and surgical-removal requirements remain mandatory. Only audit/ledger documentation was updated in this clarification; production code and the source PDFs remain unchanged.

## User review addendum — Disadvantages scope decisions

Recorded 13 September 2026. The user accepts the assessment's recommendations for D01–D07,
with the TN-reporting clarification below. These are approved approaches for future Phase 4.5
work, not production implementation or new QA pass claims. Earlier Advantage decisions remain
unchanged. The source passages were checked during the preceding assessment; this documentation
update does not reopen a sourcebook-wide audit.

### Approved TN reporting convention

- Apply a rule-specific TN increase of N as an equivalent subtraction of N from the final
  reported total for **Ring, Trait, Skill, spell-casting, and attack rolls only**. Retain
  each effect's own Skill/element/condition filter; this is not a blanket penalty to every
  roll of those kinds.
- Keep the actual rule visible in preview and breakdown, e.g. `TN +5 (reported total −5)`.
  Show the rolled total and adjusted total distinctly where needed. For example, a total
  of 27 with TN +5 is reported as 22 for comparison against the GM's original TN.
- The equivalence is `R ≥ T + N` iff `R − N ≥ T`; the app does not need to know T to report
  the adjusted total. If the TN is unknown, do not invent a threshold or announce pass/fail.
- When a TN is known, use either the adjusted total against the original TN or the unadjusted
  total against the increased TN. Never deduct N and also compare against T + N. When handing
  the adjusted result to the GM, make clear that the TN penalty has already been accounted for.
- **Never apply this TN-equivalent subtraction to damage.** This does not prohibit genuine
  damage dice penalties explicitly required by a separate rule, such as an applicable
  Strength-based damage reduction. Unclassified manual rolls must not receive TN deductions
  merely because they are not damage; a manual roll needs a supported roll kind and applicable
  context before this convention applies.
- A required Raise remains a required Raise, with its no-benefit condition and applicable
  Raise accounting. A Free Raise retains its benefit/choice semantics and does not become
  an automatic +5 result bonus. The numerical reporting convention does not replace either
  rule or add a second numerical penalty for the same required Raise.

### D01. Cursed by the Realm — approved branches

Use the existing picker with an accessible circled-i explanation for each realm and a saved
selected-realm badge. Award 4 XP normally or 5 XP for a shugenja. Core p.158 contains ten
choices; include the three additional choices identified during the assessment.

| Realm | Approved approach |
|---|---|
| Chikushudo | Automatically apply −1k1 to Animal Handling rolls only. |
| Gaki-do | Badge and rule reminder only; the GM chooses NPC targets. |
| Jigoku | Player-triggered `Resist Shadowlands Taint` action using the normal roll preview and −1k1. Use the applicable resistance roll and rule/GM-supplied TN; no invented universal TN or automatic Taint exposure tracking. |
| Maigo no Musha | Fresh per-roll `Against a spirit` declaration, initially unchecked, applies −1k1 to the declared qualifying roll. Do not leave a blanket all-roll penalty armed. Confirm damage applicability explicitly before implementation. |
| Meido | Player-controlled `In a trance` state; while active, apply −1k0 only to Perception-based rolls. No activity detection. |
| Sakkaku | Badge and narrative reminder; no spirit simulation, calendar, or automatic pranks. |
| Tengoku | Sustained `Inside a qualifying temple` toggle and visible active-state reminder; TN +10 is reported as −10 on the supported roll kinds above. Being nearby does not qualify. Exclude damage from this TN adjustment. |
| Toshigoku | Player-triggered Willpower Trait Roll, TN 15, when seeing a wounded opponent. On failure show the consequence; do not automatically attack or control the character. |
| Yomi | Reference/incompatibility check for confirmed ancestral Advantages and abilities; Inheritance is explicitly named. Verify other matches and flag conflicts without silently deleting player entries. |
| Yume-do | Reminder that Void recovery requires ten hours of sleep. No sleep tracker or automatic rest simulation. |

### D02. Dependant — agreed value and optional identity

Ask for the player/GM-agreed point value; offer an optional dependant name and short note.
Calculate XP from that agreed value. The book's examples must not become invented mandatory
tiers or hard limits. No automatic narrative consequences or NPC record is needed.

### D03. Doubt — School Skill and required Raise

Pick a current School Skill, including appropriately resolved elective/custom School Skills,
store it, and display its badge. Award 4 XP. Whenever a supported roll uses that Skill,
including a weapon attack using a selected Weapon Skill, show `Doubt: one required Raise —
TN +5, no additional benefit` and apply the approved −5 equivalent to the reported total.
Do not apply it to damage simply because an affected attack preceded it. Preserve Raise-limit
and other Raise interactions; where those are not yet fully automated, make the requirement
explicit rather than claiming a total deduction implements all Raise rules.

### D04. Seven Fortunes' Curse — approved branches

Use a Fortune picker with accessible circled-i explanations and a selected-Fortune badge.
Award 3 XP for the ordinary choices and 6 XP for Hotei. The Core pp.161–162 branches are:

| Fortune | Approved approach |
|---|---|
| Benten | Etiquette TN +10, represented as −10 to the reported total under the reporting convention; retain the TN label. |
| Bishamon | Reduce the character's Strength contribution for applicable weapon-damage calculations by one effective rank; do not lower actual Strength or subtract a die from every damage roll indiscriminately. Check bow ratings, other-Trait/flat damage, and unarmed eligibility separately. |
| Daikoku | −1k1 to Commerce. Reduce School starting-outfit koku by one once, with ownership/transaction safeguards; no repeated debit on recalc/load and no unexplained subtraction of money already spent in play. |
| Ebisu | Use the authoritative Social Skill list and a fresh per-roll `Interacting with non-samurai citizens of Rokugan` declaration. Apply −1k1 when declared; do not classify or track NPCs. |
| Fukurokujin | Lore Skill TN +5, including applicable specializations, represented as −5 to the reported total with the TN label. |
| Hotei | Covered Technique/Advantage activations requiring one Void cost two. Identify the activation/purpose, show its cost, check affordability before committing, and charge two exactly once. Ordinary Void uses such as +1k1 are not automatically doubled. Preserve other Void restrictions; review Kiho classification and unsupported activations rather than globally doubling all spend calls. Unsupported activations get an accurate reminder. |
| Jurojin | Player-triggered poison **and** disease resistance actions, using the normal preview with −2k0 and the applicable roll/TN. No prediction of poisoning or disease, and no invented universal resistance rule. |

Resistance actions reuse the existing preview rather than introducing a separate roll engine
for each danger. Contextual choices are supplied by the player; the app does not decide when
a poison, disease, Taint exposure, spirit encounter, or social condition exists.

### D05. Unlucky — GM-declared reroll resource

Use a positive whole-number rank input without inventing a rank cap. Award 2 XP per rank and
provide **one use per rank per session**: rank 5 means 10 XP and **5/5 uses**, not 10/10.

Add `GM invokes Unlucky` to an eligible roll result. When invoked, reroll the saved original
dice pool with its original modifiers and replace the first result with the **second result
in all cases**, even if higher. Spend one Unlucky use once. The button remains visible but
disabled at zero; provide a session reset and manual counter correction for table-made rolls.

Do not restart the original action: no second spell-slot payment, repeated Willpower gate,
automatic new Void payment, reused limited-resource activation, or new bonus-selection
opportunity. A reroll does not reset the ordinary once-per-Round Void restriction. A different
fresh-spending policy would be a separate future rules decision, not part of this approval.
Persist rank and remaining uses; keep the pending reroll transient and independent of Luck.

The previous catalogue/audit wording "keep the worse result" is a confirmed data error against
Core p.162. The proposal is corrected here; production catalogue correction remains pending.

### D06. Weakness — effective Trait with reviewed dependencies

Trait picker and badge showing purchased/effective values, e.g. `Agility: purchased 3,
effective 2`; award 6 XP. Store the selected Trait and derive its reduction without editing
the purchased Trait or refunding its XP. Void is not a Trait option.

Inventory and test every affected consumer before implementation: direct Trait rolls,
Skill rolls, damage, Initiative, Armor TN, and dependent Ring calculations. Resolve lowest-rank
and Ring-derived effects explicitly; do not blindly alter purchased advancement records,
Insight, Wounds, or spell slots. This is approved companion-app work with strong isolation,
not merely a −1k1 modifier attached to a subset of rolls.

### D07. Wrath of the Kami — incoming-spell reminder

Element picker and saved badge: `Incoming [element] spells targeting you grant the caster
one Free Raise`. Award 3 XP normally or 4 XP for a shugenja. No automatic +5, no change to
the player's own casting rolls or spell slots, and no choice of how another caster uses a
Free Raise. The GM/other player resolves the incoming spell, as with Magic Resistance.

### Source record, remaining details, and removability

The preceding assessment inspected the supplied [Core Rulebook](</C:/Users/jcrow/OneDrive/Documents/L5R 4th edition books/Legend of the Five Rings Rpg Core Rulebook 4th Ed..pdf>):
printed pp.158–159 (PDF pp.161–162) for realms, Dependant, and Doubt; printed pp.161–162
(PDF pp.164–165) for the Fortune curses, Unlucky, Weakness, and Wrath; and printed pp.78–80
(PDF pp.81–83) for Void, Raises, and roll context. These checks do not validate every
unreviewed edge case or amount to a complete sourcebook audit.

Before implementation, resolve specific resistance roll/TN sourcing, Maigo damage eligibility,
Bishamon weapon/unarmed boundaries, Hotei activation classifications, Yomi's ancestral-match
list, supported Wrath elements, and Weakness's derived-value/lowest-rank treatment. The basic
approaches above are approved; unresolved details must not become invented rules.

Reuse the existing Phase 4.5 picker, persistence adapters, and single registry contributor.
Own all new schema, controls, CSS, JS, context, and resource data with non-colliding removable
markers and feature-dependencies.py entries. Separately isolate conditional realm controls,
activation payments, Unlucky rerolls, and effective-Trait handling so one can be revised or
removed without changing the others. Preserve byte-identical stripped rebuilds, unchanged
other-phase harness results, and no leaked fragments or extra registry seat. Source corrections
must also respect the agreed baseline/removal strategy, rather than silently rewriting it.

### Planned Validation Suite and Regression Matrix additions

Fold these cases into the existing suite at implementation; no new executable tests or pass
counts are claimed by this documentation update.

| Area | Risk | Planned acceptance checks |
|---|---|---|
| TN equivalence | High | For each of the five supported roll kinds, rolled 27 with TN +5 reports 22; wrong Skill/condition stays unchanged. Unknown TN produces no pass/fail. Known base TN 20 still succeeds by comparing 22 to 20 or 27 to 25, never 22 to 25. Damage and unclassified manual rolls get no TN deduction; no clamping away valid negative adjusted totals. |
| Required / Free Raises | High | Doubt retains the required no-benefit Raise and applies its difficulty once, including selected-Skill attacks. Wrath remains a Free Raise reminder with no automatic +5, own-casting modification, or duplicate accounting. |
| XP values | High | Cursed by the Realm 4/5; explicit Dependant amount; Doubt 4; Fortune curses 3 except Hotei 6; Unlucky rank × 2; Weakness 6; Wrath 3/4. No corruption of unrelated totals or changes to existing character-creation XP limits. |
| Realm effects | High | All ten choices render correctly; Animal Handling/Perception matches and nonmatches; declared spirit rolls reset; temple toggle applies TN-equivalent deduction to supported kinds only; dedicated resistance/Toshigoku actions behave correctly; narrative branches create no invented automation. |
| Fortune effects | High | All seven branches; Etiquette/Lore/Commerce/Social matching; Ebisu declaration resets; Bishamon respects weapon-specific Strength contribution; Daikoku debits starting money once; poison and disease actions both receive Jurojin. |
| Hotei payments | High | Covered activation costs two exactly once; insufficient Void blocks before mutation; ordinary Void use remains its normal cost; cancellation, Nemesis restrictions, and classified Kiho cases are correct. |
| Unlucky | High | Rank 5 gives 10 XP and 5 uses; higher/equal/lower second outcomes all replace the first; one-use debit; zero-state button/reset/manual correction; no repeated slots, gates, Void payments, or bonus activation; no effect on Luck. |
| Weakness | High | Every selectable Trait and confirmed derived consumer; purchased rank/XP unchanged; UI and direct-click rolls agree; combination with other reductions; exact restoration on removal. |
| UI / persistence | Medium | All choices, badges, optional notes, sustained conditions, and pools round-trip; invalid configs are flagged; short-lived declarations and pending rolls do not persist; accessible information controls and narrow-screen layouts. |
| Surgical removal | High | Whole-expansion and isolated-module removal; byte-identical expected stripped build, unchanged other-phase harnesses, registry count unchanged, and no orphaned schema/CSS/JS/persistence or marker collisions. |

Status: approved design and planned QA only. No production change, implementation completion,
new passing test result, commit, push, or deployment is claimed.
