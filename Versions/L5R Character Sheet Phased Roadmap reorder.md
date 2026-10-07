# L5R 4E Character Sheet — Phased Implementation Roadmap

This document is the single source of truth for the character sheet's feature roadmap. Phases are grouped into Parts matching this project's existing versioning convention (thematic grouping, not chronological — see the project's CLAUDE.md). Every gap identified against the original feature list has been closed, with one exception that was flagged for approval rather than resolved unilaterally, and was **approved on 24 September 2026** (see the notes on Phases 7 and 11): Phases 7 and 11's file export/import/PDF engineering scope needed updating once Phases 0.6/0.7 existed, since saving and sharing files works differently across a plain browser tab, an installed web app, and a wrapped native app — see the note on each phase.

---

## Process Requirements — read this before starting any phase

These rules apply to every phase in this document, including ones added later. They are not optional and are not repeated per-phase.

1. **Full QA before a phase is "done."** A phase is not complete until its entire Validation Test Suite and Regression Matrix have been run. Partial completion is not completion.
2. **Stop and report after each phase.** When a phase's QA passes, report completion — including any recommendations for improving later phases — and **wait for explicit review and approval** before starting the next phase. Do not chain phases together automatically.
3. **Source-dependent phases wait for source material.** Some phases require specific rulebook text or files (named per-phase below) before implementation can begin. If that material hasn't been supplied yet, say so and stop — do not invent rules content to fill the gap.
4. **Never modify production code while only asked to generate tests.** Several Automated Test Harness Prompts below explicitly restrict Claude to test generation. Respect that scope even if it seems more efficient to fix something while in there.
5. **Part grouping is thematic, not sequential — follow the Recommended Build Order below instead.** Parts exist for versioning/documentation clarity (matching the project's folder convention), not to describe the order work happens in. The two are genuinely different here, not just in principle: several phases have real dependencies that cross Part boundaries out of letter order — for example Phase 3 (Part G) requires Phase 1 and Phase 2 (Part H) to exist first, and Phase 15 (Part H) requires Phase 12 (Part K). Building strictly "all of F, then all of G, then all of H…" would stall on these. The Recommended Build Order section immediately below resolves every such case and is the actual sequence to follow.
6. **Phase numbers are stable identifiers, not document position.** Phase 4.6 is still "Phase 4.6" regardless of which Part it's grouped under or where it sits in this file. Cross-references between phases use these numbers throughout and remain correct regardless of reordering.

---

## Recommended Build Order

This is the actual sequence to build in — it satisfies every phase's stated Dependencies exactly, including the ones that cross Part boundaries. Part grouping above stays purely thematic; this list is what governs execution order. Phase 10 is omitted — it's unassigned and not yet scoped to build.

| Order | Phase | Part | Why it sits here |
|---|---|---|---|
| 1 | 0 | F | First — no dependencies, and everything else is edited against its output |
| 2 | 0.5 | F | Needs Phase 0 |
| 3 | 0.7 | F | Needs Phase 0 |
| 4 | 0.6 | F | Needs Phase 0.5 specifically |
| 5 | 1.6 | H | No hard dependency on anything else; placed here so Phase 12 (much later) has a real Combat tab to reference |
| 6 | 1.5 | G | No dependency of its own, but must precede Phases 3, 4, 4.5, and 6 |
| 7 | 1 | H | No hard dependency |
| 8 | 2 | H | Needs Phase 1 |
| 9 | 9 | H | No dependency — placed here, could move earlier or later freely |
| 10 | 3 | G | Needs Phases 1, 2 (Part H) and 1.5 all done |
| 11 | 4 | G | Needs Phase 3 |
| 12 | 6 | G | Needs Phase 3 (RollContext); optionally benefits from Phase 5, not required |
| 13 | 5 | J | No hard dependency |
| 14 | 7 | J | Needs Phase 5 (CharacterValidator) and Phase 3 (RollContext) |
| 15 | 4.5 | I | ~~Needs Phase 7 (Part J) for config persistence round-tripping~~ — **BUILT EARLY (after Phase 8)**. The dependency is on save/load and JSON export/import, which Phase 7's own note confirms already exist; only its audit-log/migration work is outstanding, and none of that is load-bearing here. Same reasoning Phase 11's note already applies to the same dependency. Round-tripping is verified by this phase's own harness |
| 16 | 4.6 | I | Source-material gated, no phase-order dependency |
| 17 | 4.7 | I | Complete for the agreed scope, 7 October 2026; source audit and all three releases delivered. See Phase 4.7 below for evidence, exclusions and recorded costs. |
| 18 | 4.8 | I | Source-material gated |
| 19 | 8 | J | ~~Needs Phases 5, 6, 3~~ — **BUILT EARLY (after Phase 5)**. Phase 6 proved source-blocked and non-load-bearing; Phase 8 now provides the registry Phase 6 will register into. See Phase 8's own Dependencies note |
| 20 | 11 | K | Needs Phases 7, 5 |
| 21 | 12 | K | Needs Phase 11, and Phases 1.6 and 4.5, all built. Phase 4.8 was not built then: Phase 12's own Dependencies need it only "once that phase exists", so it was a soft dependency (this row said "all satisfied" until 25 September 2026). Phase 4.8 has since been built and registers its picker with Phase 12 (1 October 2026) |
| 22 | 13 | K | Needs Phase 11's navigation shell; source-material gated |
| 23 | 14 | K | Needs Phase 11. Phase 13 is needed only for a result's link into the book (Phase 14's own Dependencies); a first Search release may come before 13 (owner, 7 October 2026 — see the newest amendment) |
| 24 | 15 | H | Needs Phase 1.6 (early) and Phase 12 (position 21) — this is why it's numbered in Part H but built dead last |

---

## Status Overview

| # | Part | Phase | Status | Notes |
|---|---|---|---|---|
| 0 | F | Source Reorganization for Maintainability | **Built and verified** | Opens a new trunk (see phase note) — split for safer editing, recombined into the same single-file output |
| 0.5 | F | Hosting & Deployment Pipeline | **Built and verified** | Private GitHub repo → Cloudflare Pages; repo stays private, deployed link is open |
| 0.6 | F | Installable Web App | **Built and verified** | Add to Home Screen, one shared build for iPhone (Safari) and Android (Chrome) |
| 0.7 | F | Native Android App | **Built — device validation open** | Capacitor wrap → sideloaded APK, compiled by GitHub Actions. Install/offline/update-persistence tests need an Android device and are pending; see the phase's `qa/MANUAL-TESTS.md` |
| 1.5 | G | Roll Pipeline Consolidation | **Built and verified** | 34/34 automated checks pass against the pipeline's registry, every contributor, and stacked combinations; no production code changed. See `Versions/Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/README.md` |
| 3 | G | Smart Roll Preview | **Built and verified** | 21/21 automated checks, dropping to 18/21 against a scratch build that commits the Void spend on toggle instead of on confirm (the one real trap in this design) and 7/21 against one with the phase's kill-switch off; Phase 1.5's pipeline baseline still reads 34/34, confirming the pipeline itself was not disturbed. See `Versions/Part G — Combat & Roll Engine/PART G — Phase 3 Smart Roll Preview/README.md`. The audit found the roadmap's "introduce a RollContext" already built — `getPreRollModifiers`/`applyPreRollModifiers` were already pure and already separated from the throw — so this phase inserts a confirmation gate and renders the pipeline's own numbers rather than computing its own. Three scope findings recorded in that README: a TN is only derivable for spells, School bonuses already live in the base pool rather than as registry modifiers, and Damage rolls correctly get no preview because they never enter the pipeline. ⚠️ Real-device testing after the initial ship found a genuine rules bug the preview's checkboxes made easy to trigger — ticking two one-roll Void options stacked both onto the same roll — fixed same-session; see `Versions/BUGFIX — Void One-Roll Effects Not Mutually Exclusive/README.md` |
| 4 | G | "Explain This Roll" | **BUILT** | 22/22 checks. The "mostly wiring" note turned out to understate it: the modifier half was built, but the base pool was two bare integers by the time the pipeline saw it, so Trait/Skill/Ring/School/Affinity — five of the seven named factors — could not be shown at all. Callers now declare their parts on the roll context and `buildRollBasePoolRows()` shapes them, never recomputing. The wiring did happen too (the trunk calls `buildRollModifierRows()`, with its old copy kept as a fallback), and the resulting soft two-way dependency with Phase 3 is declared in both `ROLLBACK.md` files |
| 6 | G | Kata/Technique Synergy Detection | **First release merged and confirmed on the owner's iPhone (13/13, 2 October 2026)** | The text of the 72 School Techniques that had none (all 20 Minor Clan and Mantis Schools), in our own words with book and page, with BUGFIX — Technique Name Clashes beneath it. See `Versions/Part G — Combat & Roll Engine/PART G — Phase 6 School Technique Text/README.md` and "Phase 6's first release built — 2 October 2026 (later)". The SynergyEngine is a later release |
| 1 | H | UI/UX Foundations | **Built, shipped broken, fixed** | 9/9 automated checks pass against the fixed build and 4/9 against the one that shipped — plus a full before/after behavioural diff against the rest of the sheet; see `Versions/Part H — Sheet UI-UX/PART H — Phase 1 UI-UX Foundations/README.md`. Audit found spell-icon and Affinity/Deficiency-badge colour-coding already existed — see that README's "The audit came first". The scroll-to-top button shipped broken (its harness could not fail — see "The bug my own harness hid") and was fixed after real-device testing. A Ring affinity/deficiency accent was built and shipped, then reverted at the project owner's request — see "Reverted: the Ring accent". Real-device testing also surfaced a pre-existing, unrelated carousel bug (Spell Slots tab doesn't appear after applying a caster School) — see "A pre-existing bug this phase's field-testing surfaced" |
| 1.6 | H | Combat Tab Streamlining | **Built and verified** | 23/23 automated checks pass, plus a full before/after behavioural diff against the rest of the sheet; see `Versions/Part H — Sheet UI-UX/PART H — Phase 1.6 Combat Tab Streamlining/README.md`. Mode placement (Play-only) is authoritatively defined in Phase 12 |
| 2 | H | Quick-Access Sidebar | **Built and verified** | 19/19 automated checks pass against the current build, dropping to 12/19 or 18/19 against two different intermediate builds each missing one class of live-update hook, plus a full before/after behavioural diff against the rest of the sheet; see `Versions/Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/README.md`. A toggle-activated overlay panel, not a permanently pinned rail — measured screen real estate at 390px and 1440px ruled that out (see the README's "Why 'sidebar' is a toggle"). Own harness caught a live-update gap (Void pips, wound stepper/slider, the Cast-spell button, and bonus-slot pips each bypass `recalcAll()`) in two rounds — three before shipping, and the shared Bonus-slot pool's own line (added after a real-device tester noticed it was missing) after — see "The gap this phase's own harness caught" and "The Bonus line" |
| 9 | H | Polish & Immersion | **Half built** | Clan-themed UI skins built and verified — 17/17 automated checks, dropping to 16/17, 15/17 and 12/17 against three scratch builds each missing one thing (a safety-colour protection, the Void-pip recolour, and the phase's own kill-switch; this row said 14/14 until 25 September 2026); see `Versions/Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/README.md`. Per-Clan override of the sheet's own --shu* CSS tokens (confirmed by grep that every button/tab/heading sheet-wide already reads from them), plus the real ink-brush Clan mon art as a watermark and a tab-bar colophon — three mockup rounds with the project owner settled the exact treatment before any code was written. School-specific flavour text (this phase's other bullet) is not built, and is **blocked on source material a cloud session cannot reach** — the sourcebook PDFs are gitignored and desktop-only. Parked for a desktop session per Process Requirement #3 rather than filled in from memory; scope measured (61 major-clan + 22 minor-clan schools, none carrying any description field today) and every open decision written up in that phase's `DESKTOP-HANDOFF — School Flavour Text.md` |
| 15 | H | UI Consistency Pass | **Fully scoped (audit-first)** | First deliverable is auditing the remaining tabs the way Combat was audited; built last per the Recommended Build Order |
| 4.5 | I | Modal-Configured Advantages/Disadvantages | **Built and verified — completion pass + 4.5.2 Disadvantages point release** | Legacy **51/51**, Advantages **48/48**, and Disadvantages **163/163**. Adds the approved variable Disadvantages with explicit refunds, guarded modifiers, player toggles, isolated Willpower gates, schema-3 migration, integrated regression coverage, and surgical removal. The retained phase harnesses keep their totals and Phase 1.5 remains **35/35** with the release present or removed. Removing the full point release restores the canonical expanded pre-release build (`4355dec4`, 2,428,891 bytes); the original complete 4.5 remover still restores (`9dbaf6c6`, 2,322,320 bytes). Antisocial applies its penalty to the authoritative Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, and Temptation list only. See `Versions/PART I — Phase 4.5.2 Disadvantages/README.md`. **Point releases 4.5.3 to 4.5.24 followed** (configuration repairs, UX, eligibility gates, the remaining Disadvantages, and all of A01–A16, completed 23 September 2026 and confirmed on the iPhone 24 September); see the ledger. **Still open:** D06 Weakness (approved design, not built; needs boundary rulings) and Hotei, D04b's second half (deferred, recorded as source-blocked). Scheduled after Phase 12's first build stage (owner, 25 September). **Sourcebook audit, 2 October 2026:** merged; counts below are the original audit snapshot. **4.5.25 Clan and School Prices is merged and iPhone-confirmed. 4.5.26 Dice Rolling Entries plus the separate Rank 0 fix are built on `codex/phase-4-5-26-dice-entries`, verified 3,840/3,840 and merged 3 October at `72523fe`; live checks 129/129; the owner accepted the Windows pass on 3 October (iPhone layout non-blocking).** Five entries, including attack/reroll coverage. **4.5.27 Situational Roll Entries** (nine Advantages offered as per-roll ticks through the 4.5.15 registry) built and verified on 7 October 2026, merged and live; the owner's checklist passed 31 of 33. **4.5.28 Situational Entry Buttons and Gates** answers its two Fails (Wary's Spot ambush and Precise Memory's Recall buttons; Imperial Scribe and Sacrosanct gated); see the newest amendments and ledger |
| 4.6 | I | Alternate Paths — All Classes | **Complete for the owner's books: all three releases confirmed on the iPhone (19/19, 21/21 and 13/13; 1–2 October 2026)** | First release: the Core Rulebook's 18 Great Clan paths (pp. 251–255) with the engine work they need (see the 1 October amendments) and the monk Kiho rule of Core p. 246; second release: the other 9 Core paths, with several Paths in one School; third release: the other books' 175 Paths. (Until 2 October this cell still read "Next: the other 9 Core paths".) |
| 4.7 | I | Advanced Schools | **Complete — agreed scope, 7 October 2026** | 23 Advanced records (22 playable human entries; Nezumi recorded-only), 69 manual references; Hiruma Scout and Heroes of Rokugan Yotsu Bushi add ten Basic Technique references. Live focused QA 226/226 including the Paragon correction. Owner confirmed tests 1, 9a and 9b on 7 October, closing the functional follow-ups; other tests were already reported passed. Device unspecified; iPhone layout unconfirmed. Advanced-rank Path replacement unsupported; effects manual. FT-07, FT-09 and FT-10 are final-review items. |
| 4.8 | I | Ancestors | **Complete for the books supplied; confirmed on the owner's iPhone 1 October** (35 of 38 checks, then BUGFIX — Ancestor Corrections' two corrections re-tested 9/9; one point deferred) | Two releases on 30 September–1 October: all 54 Ancestors of the Core Rulebook, The Great Clans and Secrets of the Empire, with the owner's Kakita feedback applied. See `Versions/PART I — Phase 4.8 Ancestors/README.md` and its `AUDIT.md`. (This row read "Fully scoped" until 1 October) |
| 5 | J | Character Creation Linting | **Built and verified** | 25/25 automated checks, dropping to 11/25 with the kill-switch off; removal byte-identical to the pre-phase build. A `CharacterValidator` of nine rule functions and a `ValidationReport` on the Identity tab; Phase 11.2's wizard gates its steps on it. (This row read "Not started" until 25 September 2026, long after the ledger recorded the build.) See `Versions/Part J — Data Integrity & Validation/PART J — Phase 5 Character Creation Linting/README.md` |
| 7 | J | Data Integrity & Persistence | **First release merged 30 September 2026** on the owner's word; **confirmed on the owner's iPhone 1 October** (6/6) | Built on branch `claude/phase-7-save-format`: a `VersionManager` with one registered chain of format steps; every save and export stamped with the current format; older saves carried up on Import, copy, export and load; export names keep accented letters. `SHEET_SCHEMA_VERSION` deliberately stays 2 (see the amendment at the end). **Audit log: later** (owner, 30 September). See `Versions/Part J — Data Integrity & Validation/PART J — Phase 7 Save Format and Migration/README.md` |
| 8 | J | "Why Can't I Cast This?" | **Built and verified** | 32/32 automated checks, dropping to 15/32 with the phase's kill-switch off; the surgical removal rebuilds **byte-identical** to the pre-phase build and all eight other phase harnesses read identically with it present and removed. See `Versions/Part J — Data Integrity & Validation/PART J — Phase 8 Why Cant I Cast This/README.md`. The audit found the roadmap's premise understated: the unifying engine was indeed the gap, but ALL of the gating runs at *acquisition* time and none at cast time, so nothing had ever asked "can you cast this now". ⚠️ **Built before its declared Phase 6 dependency, which inverts that dependency's direction — see the phase note below.** One scope addition (`no-slots`, the only refusal the sheet enforces at cast time); "over-capped rings"-style invention avoided by delegating every Universal-Element verdict to the picker's own function |
| 11 | K | Characters List, Creation Wizard & Save Model | **✅ Complete, 25 September 2026:** list, save model and wizard (11.2 to 11.2.4) confirmed on the owner's iPhone and laptop, including Import of an unrenamed `.l5r` save after BUGFIX — Import File Picker Filter; Export to PDF split to 11.1 | Delivered in stages, approved 24 September 2026: the Characters list, save model and share-aware JSON first; the Creation Wizard as **Phase 11.2** (full screens, the owner's choice; Name to Review built) and **11.2.1** (Skills and Advantages/Disadvantages steps built) and **11.2.2** (every School free choice, Spells for a Shugenja, Kiho for a Brotherhood monk, and a reminder before leaving one open) and **11.2.3** (a Shugenja School's starting spells from its rulebook "Spells:" line; Kitsu first) and **11.2.4** (the other 20 Shugenja Schools' lines, as the owner quoted them); Export to PDF split out as **Phase 11.1**. See `Versions/PART K — Phase 11 Characters List and Save Model/README.md` |
| 12 | K | Play Mode / Management Mode Split | **Part 1 done** (machinery and Background, confirmed on the iPhone and merged, 25 September 2026); **part 2 done** (Clan & School, merged 25 September 2026); **part 3 done** (Identity, merged 25 September 2026); **part 4 done** (Rings & Traits); parts 1 to 4 confirmed on the owner's iPhone and merged, 25 September 2026; **part 5 done** (Skills, confirmed on the iPhone and merged); **Techniques done** (12.6, confirmed on the iPhone and merged; 12.5 Advantages & Disadvantages also complete, owner-tested and merged 28 September 2026); **12.7 Combat done** (hidden in Management, confirmed on the owner's iPhone and merged, 30 September 2026); **12.8 toolbar done** (the old row replaced by header Characters, Save and a ⋯ menu; confirmed on the owner's iPhone and merged, 30 September 2026). **Phase 12 is complete**; one part per tab follows, at the owner's request | Rulings of 25 September are recorded in the phase section below. The audit (`Versions/PART K — Phase 12 Play and Management Modes Audit/AUDIT.md`) classifies every control on all ten tabs, recommends one capture-phase gate with a selector registry, estimates about 17–27% over three stages. Its four rulings were taken as recommended on 25 September; 12.5 is complete and merged; 12.7 is complete and merged; 12.8 (toolbar replacement) is complete and merged, so Phase 12 is complete. Two owner ideas are parked for review after completion (Deferred and declined, below): Manage as a separate screen, and Print on the Characters list's menu. The owner's "Manage as a separate screen" concept is parked for review after completion (Deferred and declined, below) |
| 13 | K | Library (Sourcebook Viewer) | **Fully scoped** | Source-dependent — your own legally-owned PDFs |
| 14 | K | Comprehensive Search | **Fully scoped** | Depends on Phase 13 for the source deep-link only; search itself does not, so a first release may precede 13 (7 October 2026) |
| 10 | — | Future Expansions (Equipment) | Deferred by design | Not yet assigned a Part — nothing is scoped to build |

---

## PART F — Cross-Platform Delivery

Source reorganization, hosting, and the two installable builds. No game content, no UI — this is the project's build-and-ship layer.

### PHASE 0 — Source Reorganization for Maintainability
*(New — fully scoped)*

**Why this exists:** the single HTML file is already ~14,600 lines and every phase in this document adds more to it. Splitting the source now, before further phases land, makes every phase after this one safer and faster for Claude to edit without unrelated collateral risk.

> **Structural decision — confirmed: this phase opens a new trunk, not a layer on Part E.** Reasoning: a layer may only add presentation and can never touch the script, but this phase restructures the trunk's own file organization — that's trunk-level work by definition. Even though behavior stays identical, the file's actual bytes won't stay identical to Part E's trunk once split and recombined, which breaks the invariant a layer depends on. And since a layer's splice anchors are hardcoded line numbers, any layer built against Part E would need its anchors fully recalculated against this phase's output regardless — which is functionally the same work as properly starting a new trunk. This mirrors why Part E itself became a new trunk rather than a layer on Part C: it added real logic, and layers can't do that either.
>
> Note for context, not a decision needed right now: Phases 0.5–0.7 don't cleanly fit either category. They wrap or deploy this trunk's already-finished output rather than splicing anything into it via anchors, so they sit outside the trunk/layer model entirely — possibly worth their own folder convention outside `Versions/` when that's convenient to set up.

**Features included**
- None user-facing — this phase is a development-process change only

**Engineering Scope**
- Partition the existing single file's contents by concern, without changing any logic: data libraries (SKILL_LIBRARY, ADV_LIBRARY, WEAPON_LIBRARY, SPELL_LIBRARY, SCHOOL_LIBRARY, and the rest), the roll/modifier pipeline, wounds/combat rendering, the swipe-tab shell, and the `<style>` block, each into its own source file
- Write a small, dependency-free recombine script that concatenates the source files back into the exact single-file structure the app already uses (inline `<style>`, inline `<script>`) — no bundler, no build framework, so the output stays a plain double-click-and-go HTML file exactly as it is today
- Preserve the existing `window.__L5R_TEST__` / `window.__L5R_CAROUSEL__` test-harness globals unchanged through the split
- No behavioural change of any kind — this phase is a pure reorganization

**Dependencies**
None — this is the first phase and has no prerequisite.

**Validation Test Suite**
- The recombined single-file output is functionally equivalent to the pre-split file (not necessarily identical text, but identical behaviour)
- Every existing function, data library, and DOM element is present and reachable after the split-and-recombine round-trip
- `window.__L5R_TEST__` and `window.__L5R_CAROUSEL__` still expose the same surface after recombining
- The recombined file still opens and runs correctly with no server, exactly as today

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Behavioural parity | High | Full regression pass of existing functionality against the pre-split file, using whatever test coverage exists at this point |
| Build process | Medium | Recombine step is repeatable and produces a consistent, working single file on every run |
| Test harness | Low | `__L5R_TEST__`/`__L5R_CAROUSEL__` globals unaffected |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase before any split occurs. Generate automated tests capturing current behaviour across representative flows (character load, a roll, a wound change, a tab switch) as a pre-split regression baseline. After the split and recombine, run the same tests against the recombined output and confirm parity. Do not change any application logic in this phase.

---

### PHASE 0.5 — Hosting & Deployment Pipeline
*(New — fully scoped)*

**Features included**
- None user-facing — this phase establishes the infrastructure Phase 0.6 deploys through
- The project's existing private GitHub repository connects to Cloudflare Pages, which builds and deploys the recombined single-file app to a live `https://` address
- The GitHub repository's privacy is unaffected — Cloudflare Pages deploys from a private repo without requiring it to be made public or requiring a paid GitHub plan

**Engineering Scope**
- Connect the existing private GitHub repository to a Cloudflare Pages project, authorizing read access to that repo specifically
- Configure the Pages project's build output to point at Phase 0's recombine step, so every push produces a fresh deployed single-file build
- Confirm the deployed URL serves the file correctly over HTTPS (required for Phase 0.6's offline caching to work at all)
- Document that the deployed link itself is an open, unauthenticated URL — anyone with the link can open it, the same trust model as an "anyone with the link" shared document — since the repo staying private and the deployed link being unlisted are two different things

**Dependencies**
Phase 0 (recombine step must exist to have something to deploy).

**Validation Test Suite**
- Pushing a change to the private repo's relevant branch triggers a new Cloudflare Pages deployment automatically
- The deployed URL serves a working, fully-functional copy of the app over HTTPS
- The GitHub repository's visibility setting is unchanged (still private) after connecting Cloudflare Pages
- The deployed site is reachable from a phone browser on a different network than the one used to set it up

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Deployment reliability | Medium | Deploys succeed consistently on push; a failed build doesn't silently leave a stale version live |
| Repo privacy | Medium | Connecting Cloudflare Pages does not alter the repository's private visibility |
| Access | Low | Deployed URL is reachable externally, over HTTPS |

**Automated Test Harness Prompt**
Claude, once the Cloudflare Pages project is connected, verify the deployed URL serves a working copy of the app and confirm the source repository's visibility is unchanged. This phase is infrastructure configuration rather than application code, so there is limited scope for conventional unit tests — focus verification on deployment success and access confirmation.

---

### PHASE 0.6 — Installable Web App
*(New — fully scoped)*

**Features included**
- The app hosted in Phase 0.5 becomes installable on any phone via "Add to Home Screen" — its own icon, full-screen with no browser bar, works with no internet connection after the first visit
- Works identically on iPhone (via Safari) and Android (via Chrome) — this is one shared build, not an iPhone-specific one, and doubles as the option for any Android friend who'd rather not install the Phase 0.7 APK

**Engineering Scope**
- Add a web app manifest (name, icons, `display: standalone`) so the browser recognises the app as installable
- Generate app icon images at the required sizes, matching the sheet's existing parchment/serif/maroon-gold aesthetic (Phase 1.6's established palette)
- Add a service worker that caches the app's files on first visit so subsequent visits work fully offline; character data continues to use the existing local-storage mechanism unchanged
- Add the small set of Apple-specific meta tags needed for Safari's own home-screen handling, alongside the standard manifest
- None of this touches existing game logic — purely additive files and `<head>` tags alongside the build Phase 0 produces

**Dependencies**
Phase 0.5 (needs a real HTTPS URL to be installable/cacheable at all — this doesn't work from a locally-opened file).

**Validation Test Suite**
- Visiting the deployed URL in Safari on iPhone and Chrome on Android both offer an install/"Add to Home Screen" path
- After installing, the app opens full-screen with no browser address bar on both platforms
- After the first visit, disabling the network entirely and reopening the installed app still loads and functions correctly
- Character data created in the installed web app persists across closing and reopening it
- App icon displays correctly at all required sizes on both platforms' home screens

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Offline behaviour | High | App is fully usable offline after first visit, on both iOS and Android |
| Data persistence | High | Character data survives app close/reopen and device restarts |
| Install experience | Medium | Manifest/icons produce a correct install prompt and home-screen icon on both platforms |
| Update delivery | Low | A new deployment is picked up the next time the installed app is opened while online |

**Automated Test Harness Prompt**
Claude, read and analyse the manifest and service worker once added. Generate automated tests (or a documented manual test procedure, where phone-specific installation behaviour can't be automated) verifying offline functionality after first visit, correct manifest/icon configuration, and that character data persistence is unaffected by the installable-app changes. Do not modify existing application logic. Provide recommended improvements afterwards.

---

### PHASE 0.7 — Native Android App
*(New — fully scoped)*

**Features included**
- A genuine installable Android app (APK) wrapping the existing app unchanged — its own icon, full-screen, fully offline, installed like any other Android app
- Distributed directly (sideloaded) rather than through the Google Play Store

**Engineering Scope**
- Wrap the recombined single-file build (Phase 0) using Capacitor, without rewriting any existing code
- Configure the app icon and splash screen to match the sheet's existing aesthetic (Phase 1.6's palette), consistent with Phase 0.6's icon choices where practical
- Produce a signed APK suitable for direct installation
- Register once via Google's free hobbyist/student "limited distribution" developer verification tier (no government ID, no fee), authorizing distribution to the specific friend-group devices, ahead of Google's phased rollout of mandatory developer verification for sideloaded apps
- Note: producing the actual compiled APK requires Android build tooling (Android SDK/build tools) that isn't available in Claude's current sandboxed environment — this step needs to run on a machine with that tooling installed, or a cloud Android build service

**Dependencies**
Phase 0 (needs the recombined single-file build to wrap).

**Validation Test Suite**
- The APK installs successfully on a real Android device via direct sideloading (not the Play Store)
- The installed app is fully usable with no internet connection
- Character data created in the app persists across closing and reopening it, and across app updates
- App icon and splash screen display correctly
- The registered developer account's device authorization covers all intended friend devices

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Install success | High | APK installs cleanly via direct sideload on representative Android versions/devices |
| Offline behaviour | High | App fully usable with no network connection |
| Data persistence | High | Character data survives app close/reopen and app updates |
| Distribution | Medium | Developer-verification registration covers intended devices; app isn't blocked by Google's rollout |

**Automated Test Harness Prompt**
Claude, once the Capacitor project is configured, generate a documented manual test procedure for install success, offline functionality, and data persistence across app updates, since device installation isn't something that can be fully automated from this environment. Do not modify existing application logic — this phase wraps the existing build, it doesn't change it. Provide recommended improvements afterwards.

---

## PART G — Combat & Roll Engine

Roll pipeline auditing, the preview/breakdown UI, and synergy detection — the direct continuation of Part C's territory.

### PHASE 1.5 — Roll Pipeline Consolidation
*(New — fully scoped)*

> **Note (added after this phase was built):** the registry actually holds six entries —
> `void, wounds, stance, range, offhand, arrow` — not the `void, wounds, stance, range,
> dual-wield, emphasis` this brief names below. Emphasis re-roll is a post-render decorator,
> not a pre-roll registry entry: it mutates already-rolled dice in place rather than adjusting
> a pool before the roll happens, so it was never a candidate for this registry in the first
> place. Ammo/Arrow — absent from this brief — is the sixth registrant. See
> `Versions/Part G — Combat & Roll Engine/PART G — Phase 1.5 Roll Pipeline Consolidation/README.md`, "Finding: Emphasis
> re-roll is not a sixth registry entry", for the full explanation. The bullets below are left
> as originally written, for the record.

**Why this exists:** the code review that kicked off this roadmap found that a roll-modifier pipeline already exists (void, wounds, stance, range, dual-wield, emphasis all feed into it) even though Phases 3/4 below were originally written as if it didn't. Before Phase 3, 4, 4.5's roll-modifier hook, or 6 touch that pipeline further, it needs a documented inventory and a regression-test safety net so later phases can't silently change established combat math.

**Features included**
- A single documented registry of every existing pre-roll modifier source
- A regression-test baseline capturing current dice-pool output before any further phase touches the pipeline

**Engineering Scope**
- Enumerate every current caller of `registerPreRollModifier`/`applyPreRollModifiers` (void spend, wounds, stance, range, dual-wield, emphasis) into one documented registry
- Write regression tests capturing current dice-pool output across a representative matrix of these modifiers, individually and stacked
- No behaviour changes in this phase — audit and baseline only

**Dependencies**
None — this should run before Phases 3, 4, 4.5, and 6.

**Validation Test Suite**
- Every existing modifier source is documented in the registry with no omissions
- Regression tests cover single-modifier and multi-modifier-stacking cases for void, wounds, stance, range, dual-wield, and emphasis
- Running the regression suite against current (pre-Phase-3) code passes 100%, establishing the baseline

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Documentation completeness | Medium | Registry lists every current modifier source with no omissions |
| Baseline correctness | High | Captured baseline matches manually-verified expected dice pools for known scenarios |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests that capture the current dice-pool output across all known modifier combinations (void, wounds, stance, range, dual-wield, emphasis) as a regression baseline. Do not modify production code. Document every pre-roll modifier source found in a single registry table. Provide recommended improvements afterwards.

---

### PHASE 3 — Smart Roll Preview
*(Original — re-scope note added)*

> **Note:** code review found `makeRollContext`, `registerPreRollModifier`/`applyPreRollModifiers`, and `rollWithModifiers` already exist and are wired into weapons, spells, void spend, wounds, stance, range, and dual-wield. Treat this phase as **audit and extend the existing pipeline**, not a from-scratch build — and do it after Phase 1.5's consolidation work, not before.

**Features included**
- Dice pool preview
- TN display (skill/spell TN if applicable)
- Modifiers
- Affinity/deficiency effects
- School bonuses
- Void spending options integrated directly into preview: +1k1, +1 Trait, +1 Skill Rank (0→1)

**Engineering Scope**
- Introduce a `RollContext` object that aggregates all roll factors
- Add a `RollPreview` component that renders `RollContext`
- Move Void-spend logic from the Void card into `RollPreview`
- Add hooks for future automation (Phase 4)

**Dependencies**
- Sidebar (Void pips)
- Colour-coded indicators (affinity/deficiency)

**Validation Test Suite**
- Roll preview shows correct dice pool
- TN resolves correctly (skill TN, spell TN, blank otherwise)
- Void spending modifies the preview correctly
- School bonuses apply correctly

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Roll logic | High | Ensure no incorrect dice pool calculations |
| Void logic | Medium | Ensure Void spending updates both preview and character state |
| UI | Low | Ensure preview does not break layout |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for RollContext, RollPreview, TN resolution, modifier stacking, and Void spending logic. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 4 — "Explain This Roll"
*(Original — re-scope note added; BUILT, see `Part G — Combat & Roll Engine/PART G — Phase 4 Explain This Roll/`)*

> **Note:** `attachRollModifierBreakdown` already exists and does much of what this phase describes. Treat as audit/extend, same as Phase 3.
>
> **What the audit actually found (kept here because the note above was half wrong).** The
> modifier half existed. The base pool did not, and could not: `rollWithModifiers()` receives
> the pool as two integers, its composition already discarded by the caller. So five of the
> seven factors listed below — base dice, Trait, Skill, School bonuses, Affinity/deficiency —
> had no representation anywhere in the sheet. The phase's real work was making callers declare
> their own composition rather than deriving it a second time; see that folder's README for why
> re-deriving was rejected.

**Features included**
Breakdown of: Base dice, Trait contribution, Skill contribution, School bonuses, Affinity/deficiency, Void spending, Conditional modifiers

**Engineering Scope**
- Extend `RollContext` with a `RollBreakdown` array
- Add a modal or collapsible section showing each contributing factor
- Ensure breakdown is generated deterministically

**Dependencies**
Phase 3 RollContext.

**Validation Test Suite**
- Breakdown lists all factors
- Order is consistent
- Values match the roll preview

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| RollContext | Medium | Ensure breakdown doesn't alter roll logic |
| UI | Low | Modal/collapse behaviour |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests verifying RollBreakdown correctness and UI behaviour. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 6 — Kata/Technique Synergy Detection
*(Original — unmodified)*

**Features included**
- Highlight stacking techniques
- Detect kata modifying rolls
- Detect school ability interactions with spells

**Engineering Scope**
- Create a `SynergyEngine` that scans techniques, scans kata, scans school abilities, and produces synergy flags
- Integrate synergy flags into RollPreview

**Dependencies**
- RollContext
- CharacterValidator (optional)

**Validation Test Suite**
- Synergy detection triggers correctly
- No false positives
- Synergy flags appear in roll preview

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Rules engine | High | Ensure synergy logic doesn't break rolls |
| UI | Medium | Ensure synergy flags don't clutter preview |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for SynergyEngine rule detection and RollPreview integration. Do not modify production code. Provide recommended improvements afterwards.

---

## PART H — Sheet UI/UX

Every visual and interaction-design phase for the existing sheet, including two (9 and 15) that are numbered much later but belong here thematically, per this project's own "theme, not chronology" rule. See the Recommended Build Order above — this Part's phases are not built back-to-back; Phase 15 in particular is built dead last.

### PHASE 1 — UI/UX Foundations
*(Original — unmodified; recommended to follow Phase 0)*

**Features included**
- Up-arrow scroll-to-top
- Colour-coded elements (spell lists, ring displays, affinity/deficiency indicators)

**Engineering Scope**
- Introduce a global UI state manager (if not already present)
- Add a colour-coding utility (pure function) to avoid duplication
- Add a simple `scrollToTop()` handler bound to a floating button

**Dependencies**
None functionally — safe to implement on the current file at any time. Recommended, not required, to follow Phase 0 so this work lands in the reorganized source rather than adding to the monolith first.

**Validation Test Suite**
- Collapsible cards open/close correctly
- State persists when switching tabs
- Colour coding matches ring/affinity/deficiency rules
- Scroll-to-top button appears only when needed

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Rendering | Low | Ensure no card overflows or breaks layout |
| State | Medium | Ensure collapse state doesn't interfere with roll UI |
| Colour logic | Low | Verify no incorrect colour mapping |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests that verify collapsible-card behaviour, colour-coding utilities, and scroll-to-top UI logic. Do not modify production code. After generating tests, provide recommended improvements to the roadmap and implementation.

---

### PHASE 1.6 — Combat Tab Streamlining
*(New — fully scoped, including finalized wound-track design)*

> **Cross-reference:** this tab's placement within Play/Management mode is authoritatively defined in Phase 12 — Combat is Play-mode only, with no Management-mode version. Nothing in this phase depends on that split; it's noted here only so the two phases aren't read as contradicting each other.

**Features included**
- Reference text (TN/Initiative formula, Attack/Damage formula) moves from permanent inline paragraphs into the same on-demand modal pattern the stance ⓘ icons already use
- Void-spend disabled-reason caption relocated to sit above/alongside the button list instead of below all seven buttons
- Combat sub-sections (Armor & TN, Weapons, Stance, Void) become independently collapsible, using the existing `<details>` precedent already in the codebase (Ten Dice Rule breakdown) rather than a new component
- **Wound track rebuilt as a horizontal severity-scale bar**, replacing the current 7-card stack:
  - 8 segments (Healthy → Out) colour-banded by severity tier (Healthy = success, Nicked/Grazed = warning, Hurt/Injured/Crippled/Down = danger, Out = neutral/dark), current segment shown solid, others as a pale tint of the same role
  - Always rendered expanded — no collapse toggle for this section specifically (unlike Armor/Weapons/Stance/Void above)
  - Summary line on top: level name, TN penalty, and "X of [total] wound points"
  - Second line beneath it: "N wounds to [next level]", or "already at the last level" once at Out
  - Three synced input controls, all bound to the same value and updating each other live: a slider, a manually-editable number box, and a +/− stepper. Stepper buttons disable at 0 and at the maximum
  - Visual treatment restyled to match the sheet's existing parchment/serif/maroon-gold aesthetic (styling only — see Engineering Scope for what this does and doesn't touch)

**Engineering Scope**
- Reuse the stance-info modal component (`#stanceInfoBody`/`#stanceInfoRing`) for the two formula paragraphs — no new modal system
- Relocate the "out of combat — combat-only options disabled" line to render before the button list; no change to the buttons' enable/disable logic itself
- Wrap Armor & TN, Weapons, Stance, and Void in native `<details>`/`<summary>`. Default Stance and Void open (checked constantly mid-fight); default Armor/TN math and idle weapon fields collapsed (set-once info). Wounds is not wrapped in `<details>` at all — it has no collapsed state
- Rewrite `renderWounds()` to output: the summary line, the distance-to-next-level line, the segmented bar, and the three synced controls. `computeWoundThresholds()`, `WOUND_LEVELS`, `getCurrentWoundLevelName()`, and `getWoundPenalty()` stay untouched — only the DOM this function builds changes, not the classification logic the roll pipeline depends on
- Replace the existing single `f_woundsTaken` number input with the slider + number box + stepper group; all three write to the same underlying value and re-render the summary line, next-level line, and bar together on every change
- Distance-to-next-level formula: `remaining = thresholds[currentIndex] + 1 − woundsTaken`, for all levels except the last (Out), which instead displays "already at the last level"
- Generalize `showWoundInfoModal(lvl)` (currently called per-row in the old card layout) so any tapped segment opens its own level's info, not only the current one
- Add an `aria-label` per segment (e.g. "Nicked, -3 TN") so severity isn't color-only
- Visual restyle (parchment background, serif type, maroon/gold accents, muted severity colors) is presentational only and must not change any threshold, penalty, or classification value

**Dependencies**
- Existing stance-info modal component
- Existing `<details>` precedent (Ten Dice Rule breakdown)
- `computeWoundThresholds()`, `WOUND_LEVELS`, `showWoundInfoModal()` — consumed differently, not modified

**Validation Test Suite**
- Formula text no longer renders inline; opens via the same modal pattern as stance info
- Void-spend disabled reason is visible at or before the first disabled button
- Armor & TN, Weapons, and Stance/Void sections collapse/expand independently without touching another section's data
- Bar renders exactly 8 segments in `WOUND_LEVELS` order, colored by the correct severity band
- Current segment matches the same index the old per-card rendering would have produced, for identical Earth + wounds-taken inputs
- Summary line always matches the highlighted segment (name, penalty, and X of total all agree)
- Distance-to-next-level line shows the correct count for every level except Out, and shows the correct end-state message at Out
- Dragging the slider, typing in the number box, and tapping +/− all produce identical results for the same target value, and all three controls stay in sync with each other and with the summary/bar
- Stepper buttons are disabled exactly at 0 and at the maximum wound value, never before
- Tapping any segment — not just the current one — opens that level's correct info modal
- Changing Earth ring rank re-derives the current segment correctly without altering the bar's 8-segment layout
- Wound-based TN penalty still applies correctly to rolls
- Each segment's level and penalty are announced via `aria-label`, not color alone

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Wound classification | High | Bar's current segment matches old card-based classification exactly for identical inputs |
| Roll pipeline | High | Wound TN penalty still applies correctly; `getWoundPenalty()`/`getCurrentWoundLevelName()` untouched |
| Input sync | Medium | Slider/number box/stepper never disagree with each other or with the rendered summary |
| Collapsible sections | Medium | Expand/collapse of one section doesn't affect another's live data |
| Accessibility | Medium | Segment aria-labels present and correct; color isn't the sole signal |
| UI | Low | Modal reuse (formula text, per-segment info) opens/closes correctly; visual restyle doesn't affect any value |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for the rebuilt `renderWounds()` output (summary line, distance-to-next line, segmented bar, and the three synced input controls), its parity with the previous card-based wound classification, the relocated void-spend caption, and the new Combat-tab collapsible sections. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 2 — Quick-Access Sidebar
*(Original — unmodified)*

> **Note (added after this phase was built):** "sidebar" here is a toggle button opening a
> small anchored panel, not a permanently pinned rail — measured directly at 390px (phone) and
> 1440px (desktop) widths before writing any layout code, a pinned rail either had no room at
> all (phone) or only as much margin as the carousel's own prev/next arrows already occupy
> (desktop), nowhere near enough for five stat rows at either size. "Does not overlap or hide
> main content" is satisfied while the panel is closed (the default state, and a plain button
> at all other times); while open it overlays content the same way every modal on this sheet
> already does, dismissed by click-outside, Escape, or the toggle again — the same convention
> a mobile "quick settings" panel uses. See
> `Versions/Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/README.md`, "Why
> 'sidebar' is a toggle, not a pinned rail", for the full measurement writeup. The bullets below
> are left as originally written, for the record.

**Features included**
Sidebar pinned items: Void pips, Spell slots, Wounds, Armor TN, Initiative

**Engineering Scope**
- Create a sidebar component with reactive bindings to character state
- Add event listeners for changes in wounds, void, spell slots, etc.
- Ensure sidebar is non-intrusive and responsive

**Dependencies**
Phase 1 UI foundation.

**Validation Test Suite**
- Sidebar updates instantly when values change
- Sidebar does not overlap or hide main content
- Sidebar works on mobile/tablet layouts

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| State sync | Medium | Ensure sidebar mirrors main sheet values |
| Layout | Medium | Check for overflow on small screens |
| Performance | Low | Ensure no re-render loops |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests validating sidebar reactivity, pinned values, and layout stability. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 9 — Polish & Immersion
*(Original — unmodified)*

> **Note (added after the first bullet was built):** "Clan-themed UI skins" turned out not to
> need a `ThemeManager` at all — every button, active-tab highlight, and section heading
> sheet-wide already read its colour from five CSS custom properties defined once in
> `10-sheet-base.css`, confirmed by grep before writing any code. Overriding those five
> properties per applied Clan re-themes the whole sheet in one pass; no new "manager" object or
> new CSS rule was needed for the recolour itself, only for the two pieces of new mon artwork
> (a watermark and a tab-bar colophon). Two colours (the Delete button, the wound bar's worst
> severity) are deliberately pinned to the sheet's real maroon regardless of Clan, since they
> carry safety/severity meaning, not brand decoration — see
> `Versions/Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/README.md`, "Two colours
> deliberately left out of the override", for the full reasoning. The bullets below are left as
> originally written, for the record. "School-specific flavour text," the second bullet, is not
> built yet.
>
> **Note (added when that second bullet was attempted):** it is blocked on source material, not
> on effort. The flavour text has to be read out of the sourcebooks, and `L5R 4th edition books/`
> is gitignored (see `.gitignore`'s own reasoning: several PDFs exceed GitHub's 100MB push limit
> and the set busts the free LFS quota) so it exists only on the desktop clone. Per Process
> Requirement #3 the bullet was parked rather than filled in from a model's own recollection of a
> licensed setting. The scope was measured first — 61 major-clan and 22 minor-clan school
> entries, plus a Brotherhood list and 12 Alternate Paths, none of which carry a description
> field today, so this is a new field plus somewhere to render it. Four decisions are still open
> (which entries are in scope, how long each entry runs, where it renders, and verbatim vs.
> paraphrased given the deployed site is public). All of it, including the build rules the work
> must follow to preserve Phase 9's removability contract, is written up in
> `Versions/Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/DESKTOP-HANDOFF — School Flavour Text.md`.

**Features included**
- Clan-themed UI skins
- School-specific flavour text

**Engineering Scope**
- Add a `ThemeManager`
- Add flavour text to school definitions

**Dependencies**
None.

---

### PHASE 15 — UI Consistency Pass
*(New — fully scoped, audit-first)*

**Features included**
- A consistent visual and interaction language across every tab and section — buttons, spacing, card styles, label formatting, and information-disclosure patterns (e.g. tap-to-open info rather than permanent inline text) applied sheet-wide, not just in Combat

**Engineering Scope**
- **First deliverable: an audit.** Apply the same review the Combat tab already received (Phase 1.6) to every remaining tab — Skills, Advantages & Disadvantages, Techniques, Equipment, Background — cataloguing where each one diverges from the patterns already established (the stance-info modal, the `<details>` collapsible pattern, consistent button/label styling). Do not assume specific inconsistencies ahead of that audit
- Second deliverable: apply the confirmed reusable patterns (on-demand info modals, collapsible sections, consistent styling) to whatever the audit finds, tab by tab
- This phase should run after Phase 12 (Play/Management split), since a tab's visual pass should account for its final Play vs. Management rendering rather than being redone twice

**Dependencies**
- Phase 1.6's established patterns (modal reuse, `<details>` collapsibility) as the standard to apply elsewhere
- Phase 12, so the audit accounts for each tab's final Play/Management structure

**Validation Test Suite**
- Audit produces a documented list of inconsistencies per tab before any code changes are made
- Each fix applied matches an existing, already-established pattern rather than introducing a new one
- No tab's underlying data or roll logic changes as a result of this phase — visual only

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Scope discipline | High | No functional/data logic changes slip in under a "consistency" label |
| Visual regression | Medium | Updated tabs remain fully usable and readable after restyling |
| Pattern reuse | Low | New styling matches Phase 1.6's established patterns rather than diverging further |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. First produce a written audit of styling/pattern inconsistencies across Skills, Advantages & Disadvantages, Techniques, Equipment, and Background relative to the patterns established in Phase 1.6. Do not modify production code in this step. Once the audit is reviewed and approved, generate automated tests confirming that applying the fixes changes no underlying data or roll logic. Provide recommended improvements afterwards.

---

## PART I — Character Progression Content

New things a character can become or choose — configured Advantages/Disadvantages, Alternate Paths, Advanced Schools, and Ancestors. All gated content additions to the character-build ruleset.

### PHASE 4.5 — Modal-Configured Advantages/Disadvantages
*(New — fully scoped; BUILT, see `PART I — Phase 4.5 Modal-Configured Advantages-Disadvantages/`)*

> **✅ BUILT, including the completion pass.** The original Ring/severity and roll effects remain,
> and the requested variable Advantages now have complete configuration, cost, persistence, and
> removal paths: Allies, Gentry, Kharmic Tie, Languages, Luck, Magic Resistance, Sacred Weapon,
> and Great Potential.
>
> **The roll half needed a ruling first.** A roll effect belongs in `PREROLL_MODIFIER_REGISTRY`,
> but Phase 1.5 baselined that registry at exactly six contributors and its own source comment
> named this phase: *"later phases (3, 4, 4.5, 6) must not change how these combine."* The project
> owner ruled that the baseline may go from six to seven, on the grounds that Phase 1.5 is an audit
> phase meant to notice pipeline changes rather than forbid them. Phase 1.5's check is now written
> conditionally on this phase being present, so it reads **35/35 both with 4.5 in the build and
> with it surgically removed** — a hard `length === 7` would have broken 4.5's own removability
> proof.
>
> **A Free Raise is not a dice bonus.** Friend of the Elements grants one, and this sheet has no
> Raise mechanic to spend it through — every other Free Raise in the codebase is likewise
> descriptive text the player applies by hand. It registers an `informational:true` modifier that
> reports the Free Raise and moves no dice, asserted by folding it through the trunk's own
> `applyPreRollModifiers()` and requiring the pool to come out unchanged. Inventing a dice
> equivalent would have been inventing rules content.
>
> **Scope is now explicit.** The completion pass adds the schema types `dualTierPick`, `rankPick`,
> `languagePick`, `skillPick`, and `clanWeaponAutoPick` (the existing `severityTier` remains the
> correct single-tier representation for Gentry). Every variable entry is visibly unconfigured
> until complete; no cost or effect is silently invented.

> **Player-companion boundaries are deliberate.** Magic Resistance is an incoming elemental-spell
> TN reminder for the player to communicate at the table; it does not alter the player's own cast
> rolls. Sacred Weapon auto-grants the Clan's base profile and prints conditional rules that need
> table context. Great Potential prints both Skill and Void raise limits in the roll preview because
> this sheet has no independent Raise-spending engine.

> **✅ Point release 4.5.2 — Disadvantages.** The supplied Disadvantages template is now covered
> by the same modal/configuration patterns: Antisocial, Blackmailed, Cast Out, Compulsion, Consumed,
> Elemental Imbalance, Enlightened Madness, Failure of Bushido, Obligation, Phobia, and Sworn Enemy.
> Refunds use the approved Crab/Spider/Ninja/Status rules; Compulsion and Cast Out remain
> informational reminders; Phobia and Nemesis are player-controlled, independently ring-fenced
> toggles; and the Willpower gates use isolated nested Luck/Void checks. Saves write schema 3 with
> explicit migration and visible unknown-config warnings. The integrated suite is **163/163** for
> this point release, the retained suites are unchanged, and full point-release removal rebuilds the
> 2,428,891-byte canonical expanded build. Antisocial is now validated against the authoritative
> Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, and Temptation list, with a boundary
> assertion proving non-Social Skills are unaffected. See `Versions/PART I — Phase 4.5.2 Disadvantages/README.md`.
>
> **Post-release owner feedback — recorded 13 September 2026, not implemented.** The next pass on
> this area should treat these as audit-first action items: use a consistent circled "i" tooltip icon
> anywhere a tooltip appears; fix modal option-card overflow on narrow screens; shorten bulky
> Disadvantage explanatory text so it feels more like Magic Resistance, with compact reminders and
> badges where possible; remove or dial back player-facing "XP refund" wording in favour of consistent
> "level/severity" phrasing; audit school-gated Advantages/Disadvantages beyond Elemental Imbalance
> (Friendly Kami is a known Shugenja-only example); reverse the Advantage/Disadvantage added-item
> visual ordering so entries build downward below the add control; add search/filter support to
> Advantage/Disadvantage pickers; workshop a larger picker/filter improvement for Techniques, Kata,
> Kiho, and Spells, including spell element filters plus text search; remove the unwanted box around
> the wound bar; add Dark Mode with an explicit toggle and possible device-theme sync; and investigate
> spell-slot accounting when manual element pips and extra spell slots are mixed, since reducing one
> element after overflow casting may release slots from another element.

**Features included**
- Shared modal configuration for the original Ring/severity entries plus Allies (Influence + Devotion), Gentry (Village through Province), Kharmic Tie (target + Rank), Languages (type + language), Luck (Rank), Magic Resistance (Rank), and Great Potential (Skill)
- Sacred Weapon's no-modal Clan auto-pick, owned equipment rows, and conditional-rule notes
- Live XP totals, guarded roll modifiers, session pip pools, badges, unconfigured warnings, and save/load/import/export round-trips

**Engineering Scope**
- Keep the schema and resolver inside Phase 4.5-owned fragments; supported types are `ringPick`, `severityTier`, `dualTierPick`, `rankPick`, `languagePick`, `skillPick`, and `clanWeaponAutoPick`
- Reuse the existing modal component already built for universal spell element picks — no new modal system
- Add an `AdvDisadvEffect` resolver: given entry + picked value, returns a cost delta and/or a roll-modifier hook
- Wire cost-modifying effects, session-resource pools, Sacred Weapon ownership tags, and the existing pre-roll registry without changing unrelated phase contracts
- Store the complete configuration object (including tier fields, target/language/skill, Rank, pips, and Sacred ownership) so it round-trips through save/load and JSON export/import
- Flag any variable entry that's been added but not yet configured — same visual treatment as an unmet requirement, never a silent default

**Dependencies**
- Existing modal-picker pattern (universal spells)
- XP tracker / manual adjustment system and the existing pre-roll/result hooks
- Phase 7 persistence (save/load, JSON export/import) for the picked config to survive a reload; the current persistence machinery is already present and the round-trip is tested

**Validation Test Suite**
- The legacy resolver, Ring discount, severity tiers, three original roll effects, modal layout, and kill-switches
- Allies dual-tier XP and Crane discount; Gentry's full approved holding ladder; Kharmic target/Rank pips and attack declaration; Languages type/language; Luck whole-roll reroll; Magic Resistance reminder; Great Potential preview limits; Sacred Weapon Clan mapping and owned equipment
- Every variable entry is visibly unconfigured and inert until complete; unrelated XP and roll totals remain unchanged
- All configs and pip pools round-trip through save/load and JSON import/export
- Removing Phase 4.5 removes only its fragments/marked hooks, leaves the registry and other harnesses unchanged, and rebuilds byte-identically to the pre-phase artifact

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| XP calculation | High | Allies, Gentry, Luck, Magic Resistance, Sacred Weapon and existing tier effects compute exactly; unrelated XP is unchanged |
| Roll modifiers | High | Kharmic Tie is attack/target gated; Great Potential is informational; Magic Resistance is reminder-only; existing effects remain scoped |
| Persistence | Medium | Complete config objects, pips, and Sacred ownership tags round-trip through save/load/import/export |
| UI | Medium | Shared modals, badges, pip controls, whole-roll Luck action, Sacred auto-add, and unconfigured warnings behave consistently |
| Removability | High | Marker ownership is clean; Phase 4.5 removal restores the pre-phase source and byte-identical build; other phase harnesses keep their totals |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for the AdvDisadvEffect resolver, XP recalculation on configured entries, and the modal-picker UI flow. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 4.6 — Alternate Paths for All Character Types
*(New — fully scoped, source-dependent)*

**Features included**
- Extend the existing Alternate Path system beyond Monk to Bushi, Courtier, Shugenja, and other school types
- Hidden dropdown in the Techniques tab that unlocks once the relevant school-rank requirement is detected (e.g., Fire 3)
- Alternate paths listed but gated (visible-but-disabled, or hidden) until requirements are met

**Engineering Scope**
- Populate `ALTERNATE_PATH_LIBRARY` with entries for non-monk schools, using the exact same requirements shape (`{rings, traits, skills, emphases, advantages, narrative}`) already used for monk paths
- No changes needed to `pathsAvailableAt(schoolName, rank)` or `pathRequirementsUnmet()` — confirmed generic and school-name-agnostic during code review
- Confirm the picker UI lives in the Techniques tab as a dropdown, matching the hidden/gated behaviour already used elsewhere on the sheet

**Dependencies**
- Existing `ALTERNATE_PATH_LIBRARY` / `pathsAvailableAt` / `pathRequirementsUnmet` engine (unmodified)
- **Source material required:** the specific alternate paths, their prerequisites, and their mechanical effects for each non-monk school. Do not begin data entry until this is supplied.

**Validation Test Suite**
- Dropdown stays hidden for a school until that school's own alternate-path prerequisites are met
- Meeting one school's requirement doesn't spuriously reveal another school's paths
- Selecting an available alternate path applies its effects correctly without disturbing the base school's progression
- Non-monk paths behave identically to monk paths under the same requirements engine (regression check against existing monk behaviour)

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Requirements engine | High | Reused checker doesn't regress existing monk Alternate Path behaviour |
| Data | Medium | New non-monk entries match the existing library schema exactly |
| UI | Low | Dropdown visibility/gating consistent across all school types |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for the extended ALTERNATE_PATH_LIBRARY covering non-monk schools, confirming `pathsAvailableAt` and `pathRequirementsUnmet` behave identically to the existing monk implementation. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 4.7 — Advanced Schools (sibling to Multiple Schools)
*(Complete for the agreed scope — 7 October 2026)*

**Phase 4.7 is complete for the agreed scope as of 7 October 2026.** All three releases are merged and live: nine Core Advanced Schools, fourteen supplemental records, and the two missing Basic Schools. The separately removable Paragon correction is included. The owner confirmed the final three retests (1, 9a and 9b), after reporting the other tests passed. Full corrected QA: **4,262/4,262**; live focused QA: **226/226**.

Nezumi remains recorded-only, Advanced-rank Path replacement remains unsupported, and Technique effects remain manual; these are boundaries of the agreed delivery. iPhone visual/layout testing is unconfirmed and non-blocking by the owner’s decision. FT-01–FT-10 stay in final review, including FT-07 Blackmail at Phase 15 or beyond. No next phase is started by this closeout.

**Recorded cost and allowance usage**

| Date / provider | Work | Recorded allowance usage | Tokens | Measurement limits |
|---|---|---|---|---|
| 2–3 Oct (Codex) | Rank 0 fix and Phase 4.5.26, through merge/live verification | Weekly 0% → 22% (+22 percentage points observed) | Unavailable | Account-wide readings, not an isolated phase cost. Earlier QA endpoint was 14%; final five-hour reading 37% follows a reset. Windows owner pass; iPhone layout unconfirmed and non-blocking. |
| 3–4 Oct (Codex) | Phase 4.7 Core Advanced Schools | Weekly 24% → 64% (+40 percentage points observed) | Unavailable | Start and later resumption snapshots, not an exact completion boundary or isolated release cost. Five-hour 56% → 6% spans resets; weekly-window identity was not recorded. |
| 5 Oct (Codex) | Phase 4.7.1 supplemental Advanced Schools + 4.7.2 missing Basic Schools | Weekly 36% → 51% (+15 percentage points observed) | Unavailable | Resumption through final verification, combined account-wide readings; no split between releases. Five-hour 29% → 23% spans a reset. Do not join this interval to the earlier 64% reading. |
| 6–7 Oct (Codex) | Phase 4.7 follow-ups: merge/live checks, Paragon correction, owner retests and closeout | Exact follow-up cost unavailable | Unavailable | 6 Oct snapshot: 69% weekly / 69% five-hour. 7 Oct documentation snapshot: 12% / 78%, with a different weekly reset endpoint. Missing boundary readings prevent a cost for this work or the complete phase. |

These are Codex account-wide allowance readings, not token counts, monetary charges or usage attributed exclusively to this project. The observed movements above are arithmetic differences between snapshots; they are not independently measured release costs. Allowance windows changed between sessions, so do not add these figures into a Phase 4.7 total or compare them directly with historical Claude estimates. Exact total cost and per-release splits are unavailable. The 7 October snapshot was taken during this documentation update, before its final commit.

The matching record is in [the build ledger](BUILD-LEDGER.md#what-each-phase-has-cost). Historical Claude forecasts remain estimates, not the actual Codex cost.

**Features included**
- Hidden dropdown in the Techniques tab for Advanced Schools, appearing once a given school's own prerequisites are met
- Even when visible and its prerequisites are met, an Advanced School can't actually be added unless the character holds the Multiple Schools advantage — same principle as the current `+ Add School` gate

**Engineering Scope**
- Add an `ADVANCED_SCHOOL_LIBRARY`, structurally parallel to `ALTERNATE_PATH_LIBRARY` (same `requires:{rings, traits, skills, emphases, advantages, narrative}` shape) so the existing requirement-checking logic can be reused rather than rewritten
- Branch off `addSchoolToCharacter()` — add a sibling `addAdvancedSchoolToCharacter()` that runs through the same `hasMultipleSchoolsAdvantage()` check before committing
- Dropdown hidden until at least one Advanced School's prerequisites are met; once met but Multiple Schools is absent, show it disabled with the same tooltip pattern as `btnAddSchoolToggle`
- **Ruled 2 October 2026 (owner): the Multiple Schools Advantage is required**, as above, although Core p. 245 does not ask for it.
- **Verified against Core p.245, 4 October:** an Advanced School has a separate three-rank track. Earlier basic ranks and Techniques remain; basic advancement stops during Advanced training. Enrolment begins at Rank 0 and the next Insight Rank grants Advanced Rank 1. After Advanced Rank 3, further basic training needs GM permission.

**Dependencies**
- Existing Multiple Schools gate (`hasMultipleSchoolsAdvantage`, `addSchoolToCharacter`, `btnAddSchoolToggle`)
- **Source dependency fulfilled:** the supplied books were audited and the agreed Advanced School catalogue and two missing Basic Schools were delivered across the three releases. The original requirement was to wait for source material before data entry.

**Validation Test Suite**
- Dropdown stays hidden until a character meets at least one Advanced School's prerequisites
- Meeting School A's prerequisites doesn't spuriously reveal School B
- Dropdown shows the option but keeps it disabled when prerequisites are met but Multiple Schools is absent
- Adding an Advanced School without Multiple Schools is impossible via UI and underlying function alike
- Adding an Advanced School freezes the preceding basic rank, preserves earlier Techniques, and grants its three Technique references at the next three Insight Ranks. It grants no starting Skill, Trait or outfit package. Technique effects remain manual until their automation is built.

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Gating | High | Multiple Schools requirement can't be bypassed (mirror existing multi-school tests) |
| Requirements engine | Medium | Reused checker doesn't regress Alternate Path behavior |
| UI | Low | Dropdown visibility/disabled states correct in Techniques tab |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for ADVANCED_SCHOOL_LIBRARY requirement matching, the Multiple Schools gate on addAdvancedSchoolToCharacter, and dropdown visibility/disabled states. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 4.8 — Ancestors (Identity Tab)
*(New — fully scoped, source-dependent — you have this material)*

> **Amended 30 September 2026 by the owner's rulings; see "Phase 4.8 rulings and first release"
> at the end of this roadmap.** The Ancestor lives with the Clan and Family (Clan & School tab and
> the wizard's Family screen), not the Identity tab; the open question below is answered by the
> book (favour returns once; a second loss is final).

**Features included**
- New Ancestor section in the Identity tab: a dropdown listing appropriate ancestors
- Tooltip per ancestor explaining how it affects the character's rolls/abilities
- A "lost favour" toggle — when active, the selected ancestor greys out and any modifiers/advantages it granted are removed

**Engineering Scope**
- Add an `ANCESTOR_LIBRARY` (name, description, mechanical effect, tooltip text)
- Reuse the existing tooltip/info-modal pattern already used for stance and wound-level info — no new tooltip system
- Add a "favour lost" boolean per character; when true, grey out the selected ancestor's UI (same disabled-visual treatment as `btnAddSchoolToggle`) and strip its effect from any roll modifiers/traits it applied
- Hook ancestor effects into the same modifier system used elsewhere (`registerPreRollModifier` or equivalent) so they apply and un-apply cleanly
- **Open question to confirm before build:** if favour is restored later, should the modifier come back, or is loss meant to be permanent for the rest of the character's life? Confirm before the toggle's reversal behaviour is implemented.

**Dependencies**
- Existing tooltip/info-modal component
- Existing disabled-state visual pattern
- **Source material required:** you've confirmed you have this — provide the ancestor list and their mechanical effects/text before this phase begins

**Validation Test Suite**
- Ancestor dropdown lists all valid ancestors with correct tooltip text
- Selecting an ancestor applies its stated modifier(s) correctly
- Toggling "lost favour" greys out the ancestor and fully removes its modifier(s)
- Toggling favour back on (if permitted per the confirmed design) correctly restores the modifier
- Ancestor state round-trips through save/load and JSON export/import

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Modifier application | High | Ancestor effects apply/un-apply without leaking into unrelated rolls |
| Persistence | Medium | Ancestor pick + favour-lost state round-trip correctly |
| UI | Low | Dropdown, tooltip, and greyed-out state render correctly |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for the Ancestor selection dropdown, its modifier application/removal, and the lost-favour toggle. Do not modify production code. Provide recommended improvements afterwards.

---

## PART J — Data Integrity & Validation

Catch mistakes, protect data, explain rejections. Reliability work, not cosmetics — distinct from Part H even though some of it surfaces through the UI.

### PHASE 5 — Character Creation Linting
*(Original — scope-growth note added)*

> **Note:** scattered building blocks already exist (`spellEligibility`, `kihoEligibility`, `pathRequirementsUnmet`, `assertPathSchoolsResolve`) — real work here is consolidation into one module, not writing rules from nothing. Also note: once Phases 4.5–4.8 exist, this validator's surface area grows to include configured Advantages/Disadvantages, cross-class Alternate Paths, Advanced Schools, and Ancestors. **Also see Phase 11** — this validator's rules become the step-gating logic for the guided character-creation wizard, so plan this phase's rule structure with that consumer in mind.

**Features included**
- Illegal trait combinations
- Missing school skills
- Incorrect XP totals
- Bushi spell violations
- Over-capped rings

**Engineering Scope**
- Create a `CharacterValidator` module with discrete rule functions
- Add a `ValidationReport` UI
- Integrate validation into: Character creation, Character editing, Import/export (Phase 7)

**Dependencies**
None, but benefits from earlier UI improvements.

**Validation Test Suite**
- Each rule triggers correctly
- ValidationReport displays all issues
- No false positives

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Rules | High | Ensure rule logic matches L5R RAW |
| XP | Medium | Ensure XP totals update correctly |
| UI | Low | Ensure report is readable |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for CharacterValidator rules and ValidationReport UI. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 7 — Data Integrity & Persistence
*(Original — re-scope note added)*

> **Note:** more of this exists than originally assumed. `SHEET_SCHEMA_VERSION` with forward-compatibility refusal, JSON export, and a wired-up JSON import already exist. The real gap is **migration functions** (older saves aren't actually upgraded, just version-gated) and an **audit log** (doesn't exist at all). **Also see Phase 11** — the Characters list's autosave, manual Save, Save As, and Import JSON actions are built on top of what already exists here; they don't require this phase's audit-log/migration work to be finished first.
>
> **✅ Approved 24 September 2026, and built in Phase 11:** Export JSON now uses the device's share sheet (Save to Files, AirDrop, Mail) on a touch device that can share files, and the existing download everywhere else. The Android app's WebView offers neither; adding Capacitor's Share/Filesystem plugins is left to Phase 0.7's device validation, since an APK cannot be built or tested from a cloud session. The original note follows. Once Phases 0.6 and 0.7 exist, JSON export/import may need a shell-aware save/share mechanism rather than the current browser-download assumption, since a Capacitor-wrapped Android app and an installed web app don't necessarily handle file downloads the same way a normal browser tab does. Recommendation, awaiting sign-off: add a small abstraction that picks the right underlying mechanism per shell (plain browser download vs. Capacitor's Filesystem/Share plugins), verified once Phase 0.7 exists. Also worth noting for context, not requiring a scope change: character data, library PDFs, and this phase's storage are each local to whichever shell is in use — moving a character between the plain file, the installed web app, and the Android app relies on this phase's own JSON export/import as the bridge.

**Features included**
- Full audit log
- Versioning
- Export/import (JSON snapshots)

**Engineering Scope**
- Add an `AuditLog` service with append-only entries
- Add a `VersionManager` that handles migrations
- Add JSON snapshot export/import with validation

**Dependencies**
- CharacterValidator
- RollContext (for logging roll-related changes)

**Validation Test Suite**
- Audit log entries are correct and immutable
- Version migrations work
- Import/export round-trips correctly

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Persistence | High | Ensure no data corruption |
| Migration | High | Ensure old characters load correctly |
| Logging | Medium | Ensure logs don't grow uncontrollably |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for AuditLog, VersionManager, and JSON snapshot import/export. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 8 — Cross-Module Synergy: "Why Can't I Cast This?"
*(Original — re-scope note added)*

> **Note:** `universalSpellElementBlockReason` and similar functions already compute several of the exact rejection reasons this phase wants — the gap is a unifying engine and UI, not the underlying logic from scratch.

**Features included**
- Rank too low
- Deficiency lockout
- Missing scroll
- Not memorised
- Wrong element
- School restriction

**Engineering Scope**
- Create a `CastingDiagnosticEngine`
- Integrate diagnostics into spell UI
- Add a "Why can't I cast this?" button

**Dependencies**
- CharacterValidator
- SynergyEngine
- RollContext (optional)

> **⚠️ BUILT — and this dependency line is now inverted in practice.** Phase 8 was built before
> Phase 6, because Phase 6 is blocked on technique rules text this repository does not carry
> (of the 338 technique names the School libraries reference, 98 have no description at all and
> the other 240 are labelled in-code as paraphrases, not exact rules text). Neither
> CharacterValidator nor SynergyEngine turned out to be load-bearing for the six reasons this
> phase's own Features/Scope/Validation sections name — SynergyEngine appears only here, in the
> Dependencies list.
>
> Phase 8 therefore ships an **open registry** (`registerCastingDiagnostic`), modelled on
> `PREROLL_MODIFIER_REGISTRY`, so **Phase 6 registers a contributor into Phase 8 rather than
> Phase 8 consuming Phase 6**. A contributor may add a reason, or *suppress* one — which is how
> "this technique lets you ignore that restriction" is expressed. **When Phase 6 is built it
> must declare a SOFT dependency on Phase 8** in its own `ROLLBACK.md`, and guard its
> registration call. Six checks in Phase 8's harness drive that seam already, so the contract is
> tested before Phase 6 exists.

**Validation Test Suite**
- Each diagnostic reason triggers correctly
- Multiple reasons stack correctly
- UI displays reasons clearly

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Rules | High | Ensure diagnostic logic matches RAW |
| UI | Medium | Ensure diagnostics don't clutter spell list |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for CastingDiagnosticEngine and UI integration. Do not modify production code. Provide recommended improvements afterwards.

---

## PART K — App Shell: Characters, Library & Search

The D&D Beyond-style restructure — the Characters list, creation wizard, Play/Management modes, the sourcebook Library, and Search all become sibling sections of one navigation shell.

### PHASE 11 — Characters List, Creation Wizard & Save Model
*(New — fully scoped)*

> **✅ Complete, 25 September 2026.** The Characters list and save model, and the wizard as Phases 11.2 to 11.2.4, confirmed on the owner's iPhone and laptop: creating a character through the wizard, opening, Save As a copy, Export JSON and Import JSON. Picking an older `.l5r` save needed BUGFIX — Import File Picker Filter, confirmed on the iPhone the same day (`Sairyu_.l5r` picked through Choose File and imported without renaming). Export to PDF is Phase 11.1; Play mode, the toolbar's replacement and Save As from Management mode are Phase 12.

> **✅ Approved 24 September 2026, both halves:** (1) Export JSON and Import JSON stay in this phase, with Export using the share sheet on touch devices and the download elsewhere (see Phase 7's note); (2) **Export to PDF moves out of this phase into its own Phase 11.1**, so this phase stays on the Characters list, the creation wizard and the save model. This phase is also delivered in two folders: the Characters list and save model first, then the Creation Wizard as **Phase 11.2** (its own number only so each folder has its own removal marker). The original note follows. The same question flagged on Phase 7 applies here directly to Export JSON, Export to PDF, and Import JSON in the per-character and list-level menus. Export to PDF in particular likely can't rely on the browser's native print dialog once running inside Phase 0.7's Capacitor wrapper or Phase 0.6's installed web app — recommendation, awaiting sign-off, is a client-side PDF generation library paired with each shell's native share/save mechanism, rather than `window.print()`. Holding this open rather than resolving it here since it changes this phase's Engineering Scope, not just its context.

**Features included**
- A top-level navigation shell (Library, Search, Characters) that this phase's Characters section is the first to occupy — Library and Search exist as placeholder destinations in this shell until Phases 13 and 14 build them out
- A Characters section: a list of all saved characters (portrait, name, level, race/clan, class/school summary line — matching the D&D Beyond reference layout)
- A "Create New Character" button that launches a step-by-step guided creation wizard
- Tapping an existing character opens it directly into Play mode (see Phase 12)
- A per-character overflow ("hamburger") menu at the list level offering: Export to JSON, Export to PDF, Delete (Export to PDF moved to Phase 11.1; Save As is also offered here, as the Features list below already requires)
- An "Import JSON" function at the list level — separate from the per-character menu, since it creates a new character rather than acting on an existing one
- Autosave as the default persistence behaviour
- A manual "Save" button retained as an explicit backup action
- "Save As" retained specifically as a character-branching tool — forking the current character into a new saved version before committing to an uncertain change — available both from the Characters list and from within Management mode

**Engineering Scope**
- Build the top-level navigation shell using the same show/hide pattern already used for the sheet's internal tabs, applied one level higher — this is not a new mechanism, just a second layer of the existing one
- Build the Characters list view reading from the existing character-save store; render portrait/name/level/class-school summary per entry
- Wizard: a multi-step guided flow (Clan → Family → School → Rings/Traits → Skills → Advantages/Disadvantages → …) gated step-to-step by Phase 5's CharacterValidator rules — "Next" is disabled until the current step is legal, rather than validating only at the end
- Replace the existing single toolbar (Load/Save/Save As/New Blank) with: (a) navigation to the Characters list as the primary "load" action, (b) a per-character overflow menu for Export JSON/Export PDF/Delete, (c) a dedicated Import JSON action on the list screen
- Export to PDF is a new capability — needs a print-oriented rendering of the character sheet, reusing existing character data rather than a parallel data model
- Autosave: trigger a save on meaningful state changes (debounced, not on every keystroke), using the existing save mechanism
- Manual Save button: explicit trigger of the same underlying save function, positioned as a deliberate reassurance action, not the primary flow
- Save As: forks the current character's full data into a new save-slot entry with a distinct ID, available as an action both on the Characters-list per-character menu and from within Management mode

**Dependencies**
- Existing character save/load data structures (unmodified)
- Phase 7's existing JSON export/import and schema-versioning machinery (confirmed already present) — this phase builds UI around that, and does not require Phase 7's audit-log/migration work to be finished first
- Phase 5's CharacterValidator for wizard step-gating (partial dependency — the wizard can launch with whatever validation rules exist at the time, gaining more gating as Phase 5 matures)

**Validation Test Suite**
- Characters list displays every saved character with correct summary info
- "Create New Character" launches the wizard; completing it produces a character that lands in Play mode
- Wizard blocks advancing to the next step when the current step's choices are invalid, and clearly states why
- Tapping an existing character opens Play mode for that character, not Management mode
- Per-character overflow menu's Export JSON, Export PDF, and Delete each work correctly and only affect the selected character
- Import JSON on the list screen correctly adds a new character without overwriting an existing one
- Autosave triggers on meaningful changes without excessive/duplicate save operations
- Manual Save button always produces the same result as the most recent autosave would have
- Save As, from either location, creates a genuinely independent copy — editing the new copy never alters the original

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Data integrity | High | Save As never mutates the source character; Import never silently overwrites an existing save |
| Wizard gating | High | Step validation matches Phase 5 rules; no way to complete an illegal character through the wizard |
| Persistence | Medium | Autosave and manual Save always agree; no data loss on rapid navigation away from a character |
| UI | Low | List rendering, overflow menu, and wizard navigation all behave correctly on mobile and desktop widths |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for the Characters list rendering, the creation wizard's step-gating against CharacterValidator rules, the per-character overflow menu actions (export JSON, export PDF, delete), JSON import, and the autosave/manual-save/Save-As data integrity. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 11.1 — Export to PDF
*(Split out of Phase 11 on 24 September 2026 — scoped from Phase 11's own note, not yet built)*

A print-oriented rendering of the character sheet, reusing existing character data rather than a parallel data model, offered as Export to PDF in the Characters list's per-character menu. Must not rely on `window.print()` inside the installed web app or the Android app: the recommendation already recorded on Phase 11 (a client-side PDF generation library paired with each shell's share/save mechanism) stands, awaiting its own build. Depends on Phase 11's per-character menu and share-aware export.

### PHASE 11.2 — Creation Wizard
*(Phase 11's second stage, numbered separately on 24 September 2026 so it has its own removal marker — scope as written under Phase 11)*

> **First stage built 24 September 2026:** full-screen steps for Name, Clan, Family, School, Rings & Traits and Review, each made through the sheet's own controls and gated by the validator. Full screens were the owner's choice over a guided mode on the sheet. Skills and Advantages/Disadvantages were added the same day as **Phase 11.2.1**, completing the wizard's steps. **Phase 11.2.2** (25 September, the owner's request) walks the player through every choice the School leaves open: every free Skill choice form, the School's Lore subject, a Spells step for a Shugenja and a Kiho step for a Brotherhood monk, with a reminder on Next and a still-to-choose list on Review. **Phase 11.2.3** (25 September) records a School's own "Spells:" line and walks the player through it, offering only spells the sheet's eligibility rule allows; only Kitsu Shugenja's line (Core p.118, quoted by the owner) was recorded then. **Phase 11.2.4** (25 September) records the other 20 from the owner's quotations, reading Isawa's, Spider Chuda's and Yogo Wardmaster's lines, which are not Element counts, by matching learned spells to their boxes; every Shugenja School in the library now has its line (Kitsune [Mantis], a copy of the Fox Clan's School, was removed at the owner's request). Whether starting spells begin memorised (no scroll, no XP) is an open design question, deferred. See `Versions/PART K — Phase 11.2 Creation Wizard/README.md`, `Versions/PART K — Phase 11.2.1 Wizard Skills and Advantages/README.md` , `Versions/PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho/README.md`, `Versions/PART K — Phase 11.2.3 Wizard Starting Spells/README.md` and `Versions/PART K — Phase 11.2.4 Wizard Starting Spells for Every School/README.md`.

The step-by-step guided creation flow (Clan → Family → School → Rings/Traits → Skills → Advantages/Disadvantages → …), gated step to step by Phase 5's CharacterValidator, launched from the Characters list's "Create New Character" button (which, until this is built, starts a blank saved character). Validation Test Suite and Regression Matrix rows for the wizard are those listed under Phase 11.

### PHASE 12 — Play Mode / Management Mode Split
*(New — fully scoped)*

> **Owner's rulings, 25 September 2026, before the audit:**
> - **Default mode.** A character opens in **Play** when it is opened from the Characters list or finished in the creation wizard. Anything else (a blank sheet, a load through the old toolbar) stays in **Management** until the toolbar is replaced. This keeps the 30 retained harness folders that drive editable controls working unchanged.
> - **The mode is not character data.** It is never written into a save, so switching modes cannot change what autosave writes.
> - **The three tabs the table below did not cover** (rows added): Clan & School is read-only in Play; Rings & Traits is read-and-roll in Play; Spell Slots is fully usable in both modes.
> - **In-play controls stay live in Play.** On Advantages & Disadvantages, "read only" means no add, remove or configure. A configured entry's Use, Reset, invoke and session toggles (Dark Paragon, Unlucky, Darling of the Court, Hotei, the resource trackers) keep working.
> - **Audit (25 September):** `Versions/PART K — Phase 12 Play and Management Modes Audit/AUDIT.md`.
> - **The audit's four rulings, all taken as recommended (owner, 25 September):** (1) *inert* means every
>   user event on a Management control is stopped in Play (typing, tapping, a script's `.click()` or
>   dispatched event), while the sheet's own code writing values (a load, autosave, a Void spend)
>   keeps working; (2) Honor, Glory and Status **points** and **Taint** stay editable in Play, their
>   **ranks** are Management-only; (3) the toggle is a small "Manage" button beside the character's
>   name in the header, reading "Done" in Management; (4) Play shows a Management-only field's value
>   as plain text, in place. **Stage 12 can be built.**
> - **Measured before building (25 September):** the sheet's state lives in its own inputs, and most edit handlers are anonymous listeners, so there is no single rank-up function to gate. The creation wizard drives the sheet by clicking its buttons, so it must run in Management. Hiding Combat in Management goes through the carousel's visibility path, which has had two bugs (one Safari-only).

**Features included**
- Every character, once opened from the Characters list, loads into one of two modes: Play or Management
- A toggle between the two modes, styled as a low-emphasis affordance rather than a dominant persistent switch — matching how the D&D Beyond reference tucks "Manage Character & Levels" into an overflow menu rather than a top-level tab
- Per-tab behaviour, authoritative for the whole sheet:

| Tab | Play mode | Management mode |
|---|---|---|
| Combat | Full functionality (as built in Phase 1.6) | Does not appear — no mode toggle affects this tab |
| Equipment | Full edit — acquire, equip, swap | Full edit — same capability |
| Skills | Read-and-roll only — view ranks, tap to roll, nothing editable | Full edit — rank-ups, XP spend |
| Advantages & Disadvantages | Read only — view effects, including configured Phase 4.5 entries | Full edit — add/remove/configure |
| Techniques | Read and use only — view current techniques and their effects | Full edit — add new techniques, Alternate Paths (Phase 4.6), Advanced Schools (Phase 4.7) |
| Background/Identity | Read only — including Ancestor info once Phase 4.8 exists | Full edit |
| Clan & School *(added 25 September 2026)* | Read only | Full edit — Apply Family, Apply School |
| Rings & Traits *(added 25 September 2026)* | Read and roll — view Rings and Traits, tap to roll | Full edit — raise with XP |
| Spell Slots *(added 25 September 2026)* | Full use — spend and restore slots | Full use — same capability |

**Engineering Scope**
- Add a mode flag to the active character-view state (`play` / `management`)
- For each dual-mode tab (Equipment, Skills, Advantages & Disadvantages, Techniques, Background), the **same underlying render function and the same underlying data** are used in both modes — Management mode reveals additional controls (rank-up buttons, add-new pickers, delete/remove actions) that Play mode hides. This is one dataset with mode-gated controls, not two separately-maintained views, specifically to avoid the two copies drifting out of sync
- Combat is rendered only when in Play mode; the mode toggle has no effect on whether Combat is reachable, and Combat has no Management-mode rendering path at all
- The mode toggle itself lives as a low-key affordance on the sheet, not a persistent top-level tab, so Play mode stays the visually dominant default
- Any control hidden in Play mode must be fully inert, not just visually hidden — a hidden rank-up function must not be triggerable via any other path while in Play mode

**Dependencies**
- Phase 11 — a character must be opened from the Characters list before its mode (Play or Management) is meaningful; this phase defines what happens once that occurs
- Phase 1.6 (Combat Tab Streamlining) — Combat's Play-mode behaviour is unchanged by this phase, just confirmed as the only mode it appears in
- Phase 4.5 (configured Advantages/Disadvantages) — their configured effects must render correctly in Play mode's read-only view
- Phase 4.8 (Ancestors) — Ancestor info and lost-favour state must render correctly in Play mode's read-only view once that phase exists

**Validation Test Suite**
- Combat renders identically regardless of mode state, and the mode toggle has no visible effect on it
- Equipment allows full acquire/equip actions in both modes
- Skills, Advantages & Disadvantages, Techniques, and Background render read-only in Play mode — no rank-up, add, or delete control is visible or triggerable
- The same four tabs expose full edit controls in Management mode
- Switching modes never alters character data — only which controls are visible/enabled
- A control hidden in Play mode cannot be triggered by any other means (e.g. a direct function call bypassing the UI) — the restriction is enforced in the underlying function, not just hidden in the DOM

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Data integrity | High | Mode switching never mutates character data |
| Control gating | High | Play-mode-hidden controls are genuinely inert, not just visually hidden |
| Combat exemption | Medium | Combat is unaffected by mode state in every scenario |
| UI | Low | Mode toggle affordance renders correctly and doesn't dominate the Play-mode layout |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests confirming Combat's mode-independence, the read-only vs. full-edit rendering of Equipment/Skills/Advantages & Disadvantages/Techniques/Background across both modes, and that Play-mode-hidden controls are genuinely inert rather than just visually hidden. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 13 — Library (Sourcebook Viewer)
*(New — fully scoped, source-dependent)*

**Features included**
- A Library section listing sourcebooks as cards: cover image + title
- Tapping a book opens a reader with a clickable table of contents that jumps to specific sections
- Content is the user's own legally-owned PDF files — this phase builds the viewer, not the book content

**Engineering Scope**
- Client-side PDF rendering (e.g. PDF.js) — no server required
- **Sub-step, book by book, before any book is added:** for each sourcebook, check whether it has real embedded bookmarks/outline (jump-to-section works automatically from the PDF's own data) or lacks them (requires a one-time manual page-mapping, e.g. "Chapter 3 starts on page 47," entered before that book is usable). Resolve this fully for one book, confirm it works, before moving to the next book — do not batch-add multiple unresolved books at once
- Storage: sourcebook files use a separate browser storage mechanism (IndexedDB) from the existing character-save data — the two are not to share a storage layer, since PDF files are far larger than anything character saves currently handle
- Request persistent storage (`navigator.storage.persist()`) specifically to reduce Safari's eviction risk on iPhone/iPad. This is a best-effort request, not a guarantee — Safari can still decline under real storage pressure — and it doesn't affect Windows/Android the same way
- Because the content is the user's own file, an evicted book is trivially recoverable by re-adding the same file — this is not treated as a data-loss risk the way losing character data would be
- This storage is local to whichever shell is in use (plain file, Phase 0.6's installed web app, or Phase 0.7's Android app) — the same re-add pattern above is also how a sourcebook gets into a second shell, not just back into the same one after eviction

**Dependencies**
- Phase 11's navigation shell, as the destination this phase's content occupies — the viewer itself has no other phase dependency
- **Source material required:** the user's own legally-owned PDF files, added one at a time per the sub-step above

**Validation Test Suite**
- Book cards display correct title and cover image
- Tapping a book opens the reader with correct content
- Table of contents correctly jumps to the right section for books with embedded bookmarks
- Table of contents correctly jumps to the right section for books using the manual page-mapping fallback
- Library storage is confirmed separate from character-save storage — clearing/corrupting one never affects the other
- Persistent-storage request is made and its granted/denied result is handled gracefully either way
- Re-adding a previously evicted book restores full functionality with no leftover corrupted state

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Storage isolation | High | Library storage failure/eviction never touches character-save data |
| TOC accuracy | High | Jump-to-section lands on the correct page for both bookmark types (embedded and manual) |
| Persistence | Medium | Persistent-storage request handled gracefully on both grant and denial |
| UI | Low | Book cards and reader render correctly across target devices |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for the Library's storage isolation from character data, table-of-contents jump accuracy for both bookmark types, and graceful handling of the persistent-storage request's grant/denial outcomes. Do not modify production code. Provide recommended improvements afterwards.

---

### PHASE 14 — Comprehensive Search
*(New — fully scoped)*

**Features included**
- A single search entry point combining fast global recall with deep per-category filtering, staged in two steps: land on a flat, fast search; tapping a category unfolds that category's own specific facets
- Categories: Items, Weapons, Monsters, Clans, Families, Schools (including Advanced Schools and Alternate Paths), Skills, Advantages/Disadvantages, and Techniques
- Techniques is a single navigational entry point but expands into five genuinely distinct facet sets underneath it: school-rank techniques, alternate paths, kata, kiho, and spells — each keeps its own filter shape rather than sharing one generic set
- Results filter as the player types
- Tapping a result opens a detail page with that item's full information
- A result's source line deep-links directly into the Library reader at the correct page (depends on Phase 13)

**Engineering Scope**
- Build a two-stage filter UI: an initial flat/global text search (broad, shallow, category checkboxes only) that, once a category is selected, reveals that category's dedicated facet panel
- Maintain five separate facet definitions under the Techniques entry point rather than one merged schema, since school-rank techniques/alt paths/kata/kiho/spells don't share mechanical fields (e.g. a Kata has no casting time; a spell needs a Ring/Element)
- Detail pages reuse whatever info-modal/detail-rendering pattern already exists elsewhere on the sheet, rather than inventing a new one
- Source-line deep-link opens the Library reader (Phase 13) directly at the referenced page

**Dependencies**
- Phase 11's navigation shell, as the destination this phase's content occupies
- Phase 13 (Library) for the source deep-link — search itself can function before Library exists, but the deep-link specifically requires it

**Validation Test Suite**
- Flat search returns cross-category results before any category is selected
- Selecting a category reveals that category's correct, category-specific facets
- Techniques' five sub-types never share filter options that don't apply to them (e.g. a Kata never shows a casting-time filter)
- Typing narrows results live without requiring a manual "search" submit
- Tapping a result opens the correct detail page with complete information
- A result's source link opens the Library reader at the correct page, when Phase 13 is present
- Searching before Phase 13 exists still works, simply without the deep-link (graceful degradation)

**Regression Matrix**

| Area | Risk | Tests |
|---|---|---|
| Facet correctness | High | Each of the five Techniques sub-types only shows fields relevant to that sub-type |
| Search accuracy | Medium | Type-ahead results match expected content across all categories |
| Library integration | Medium | Deep-link degrades gracefully when Phase 13 isn't present, and works correctly when it is |
| UI | Low | Category picker and facet panel render correctly on mobile |

**Automated Test Harness Prompt**
Claude, read and analyse the existing codebase. Generate automated tests for the two-stage search/filter behavior, the five distinct Techniques facet sets, type-ahead result accuracy, and the Library deep-link (including its graceful degradation when Phase 13 isn't present). Do not modify production code. Provide recommended improvements afterwards.

---

## Unassigned — no Part yet

### PHASE 10 — Future Expansions
*(Original — unmodified, deferred by design)*

**Features included**
Equipment automation:
- Armor TN auto-calculation
- Weapon traits
- Conditional bonuses from gear

These require new subsystems and should be deferred until core automation is stable. Not yet assigned a Part letter — nothing here is scoped to build, so giving it a Part would imply more than there is. Assign one when this is actually picked up.

---

## Deferred and declined — decisions, not omissions

Recorded so nobody rediscovers these as gaps and assumes they were oversights. Each was raised,
considered, and consciously parked or ruled out.

### REVIEW LATER — owner fine-tuning feedback, 4 October 2026

**Review after project completion, alongside Phase 15. Documentation only now;
these proposals are not approved implementation work.** Matching IDs and the
owner's test report are in the build ledger.

- **FT-01 — Skill picker duplicates:** omit Skills already on the sheet from
  Add from Skill List. Review restoring removed Skills and distinguishing genuine
  specialisations such as different Lore Skills.
- **FT-02 — Future options in Management:** show future choices, prerequisites
  and missing requirements for planning, while retaining entry gates.
- **FT-03 — Career progression planner:** explore dynamic suggestions and a
  checklist the player can mark off. Scope later; not a committed deliverable.
- **FT-04 — Gender requirement by Identity OR confirmation:** a matching Identity
  gender should satisfy a gender-restricted Path/Skill/School without another tick.
  If it is absent, require the checkbox. Review ambiguous/conflicting values and
  later edits explicitly; do not silently assume eligibility.
- **FT-05 — Optional wizard details:** ask for gender and age after Name; both
  skippable and editable after creation, like Name.
- **FT-06 — Advanced School location:** the owner looked in Identity > Add School.
  Phase 4.7 followed this roadmap's explicit Techniques-tab placement, alongside
  progression and earned Technique references. Its separate rank rules do not
  mandate that UI location. Review a common entry point, relocation or signposting
  after completion. No current UI change is requested.
- **FT-07 — Scorpion Instigator / test 8:** verify the owner's interpretation
  that Blackmail requires four separate purchases plus the checkbox. Current
  code checks presence of Blackmail and confirmation of four distinct people,
  not four paid purchases or automatic target counting. Verify against the book,
  then review costs, gating and test wording together. Keep this concern open.
- **FT-08 — Spell Slots intermittently missing:** owner report from Windows
  ChatGPT preview/file explorer (not Safari) with a Moshi Shugenja and added
  spells; visibility recovered. The earlier Safari Spell Slots issue is resolved.
  The owner mentioned its former underlying cause only as a possible explanation
  for this separate ChatGPT issue; a shared cause is unconfirmed. Do not reopen
  the Safari issue on this evidence.
  Investigate after completion across caster School application, load/switching,
  modes, navigation and viewport changes inside ChatGPT's Windows preview/file
  explorer. Compare the earlier Safari fix as a diagnostic lead only.
  Screenshots `Screenshot 2026-10-04 135728.png` and
  `Screenshot 2026-10-04 135743.png` are in
  `C:/Users/jcrow/OneDrive/Pictures/Screenshots 1/`. They show the character and
  partial navigation, not a proved cause. Unresolved, not independently reproduced.

- **FT-09 — Imperial Scion within the Glory/Honor/Status review (6 October).**
  Test 2 works as described. At the end of the project, review its Status 4.0 gate,
  fractional boundary, editable Rank versus Points and Technique costs as part of
  the already-deferred review of all three attributes. No behavior change now.
- **FT-10 — Kobune Captain and Clan membership (6 October).** Test 3 works.
  Keep current eligibility and the Mantis command-appointment confirmation. At the
  end of the whole project, check the source and setting implications of a
  non-Mantis captain, and whether a Clan restriction or explicit GM exception is
  appropriate. An exceptional appointment being narratively rare does not itself
  establish a rules restriction. Do not implement a Mantis-only gate now.

**Test report:** owner says all other tests passed on 4 October; FT-07 and FT-08
remain open. Windows preview is evidenced; no iPhone pass was reported. This
report does not itself mark the release merged or deployed.

### REVIEW LATER — which rolls `+1k1` may be spent on

**Status: current behaviour kept deliberately; revisit once all roll-producing features exist.**

RAW: *"Gain a bonus of +1k1 to a Skill, Trait, Ring, or Spell Casting roll … Damage Rolls may not
be enhanced in this manner."* The sheet currently offers `+1k1` on any roll except Damage, which
includes Initiative — and an Initiative Roll is none of the four types that sentence names.

Two defensible readings, and the project owner ruled to keep the broad one for now:

- **Broad (current).** If the four names were an exhaustive restriction, the Damage exclusion
  would be redundant — a Damage Roll is not a Skill, Trait, Ring or Spell Casting roll either. The
  drafters shutting Damage down explicitly implies they expected the bonus to be read widely.
- **Narrow.** RAW addresses Initiative separately, twice (exchange Scores; +10 to Score), and
  neither is a dice bonus — suggestive that the Initiative Roll was not in scope for `+1k1`.

The ambiguity is real and the stakes are one die, so the decision is deferred rather than guessed.
**Revisit when the roll types are all built** (Phases 6, 5 and 8 all add or gate rolls) and settle
it once against the full set, rather than piecemeal.

### REVIEW LATER — Manage as a separate screen (owner, 30 September 2026)

**Status: parked for review after the app is complete. No work now; not approved for implementation.**

Phase 12 built Management mode *in place*: pressing **Manage** turns the sheet's own fields from
static (Play) into editable (Management), tab by tab. On testing Phase 12.7 the owner said they had
pictured something different: **Manage opening a separate "window" or "screen"**, in the way the
character creation wizard does, with Play remaining the sheet itself.

This records the idea, not a design. When it is reviewed, the questions include: what that screen
contains (the same tabs' editors, or a guided flow like the wizard); how it relates to the creation
wizard, which already edits through the sheet's own controls in Management; what happens to the
per-tab Play locks built in Phase 12 (12.1–12.7), which could become unnecessary if editing lives
elsewhere; and what the old toolbar's replacement (12.8) should hand over to it. **Review once the
roadmap's phases are finished**, or earlier if the owner asks. Until then, later phases should
avoid making that redesign harder without saying so.

### REVIEW LATER — Print on the Characters list's per-character menu (owner, 30 September 2026)

**Status: parked for review after the app is complete. No work now; not approved for implementation.**

Phase 12.8 put Print in the sheet header's ⋯ menu. On testing it the owner said the per-character
menu on the **Characters list** (today Export JSON, Save As a copy, Delete) should **also offer
Print**, so a character can be printed without opening it first. Record of the idea, not a design.
It sits next to **Phase 11.1 (Export to PDF)**, which already plans an Export PDF item in that same
menu: review the two together when 11.1 is scoped, including whether printing from the list opens
the character first or prints it directly, and how that behaves in the installed app.

### OUT OF SCOPE — exchanging Initiative Scores (RAW Void expenditure 5)

**Status: declined. Five of the six general Void expenditures are implemented; this is the sixth.**

RAW: *"Exchange his Initiative Score with one willing target for the remainder of the current
skirmish … Only one of the two characters needs to spend a Void for this effect to take place."*

The project owner's reasoning, and the decisive point: **this is a companion app for one player,
not a VTT.** It has no concept of other characters, and the rule is fundamentally about two of
them.

A single-sheet approximation was considered and rejected on its merits, not just on scope. From
one sheet's point of view the effect is only *"my Initiative Score becomes N for this skirmish"*,
and the existing `+10 Initiative (skirmish)` already provides skirmish-duration additive
machinery. But:

1. **It drifts.** Storing a delta means a later stance change (Center) silently moves you off the
   number you swapped to; storing an absolute override means suppressing a computed field, which
   is more invasive than any other expenditure needed. RAW does not say which is right.
2. **It is two features.** "Only one of the two need spend a Void" means the *receiving* player
   needs the same adjustment with no spend — a Void entry and a manual adjustment, for one rule.
3. **It is the only expenditure involving another character at all**, which is exactly where the
   companion-app line sits.

Reconsider only if the app ever gains multi-character state for another reason.
## Phase 12.5 status amendment — 28 September 2026

Advantages & Disadvantages in Play is merged to main from `codex/phase-12-5-adv-disadv` after the
owner reported successful testing and approved the merge on 28 September 2026. It preserves
approved in-play actions while locking Management editing.
Final combined QA passes 2,789/2,789 (2,577 retained + 212 new), and ten negative variants match
their expected failures. The focused matrix and exact removal proof are in the release README.
No rules, save schema or modifier registry seat was added. Phases 12.7 and 12.8 remain separate,
unstarted work requiring their own approval.

## Next-session planning amendment — 28 September 2026 (proposal, not implementation approval)

Phase 12.5 is complete. Recommended next roadmap phase: **12.7, Combat visibility**; recommend
a **separate Dependant inline-typing bugfix first**, because the ledger records confirmed lost
name edits in the pre-12.5 provider; the arrangement field shares the same code path and also
needs coverage. Do not bundle that fix with mode work or reopen
completed Phase 12.5. The owner may choose 12.7 first if roadmap progression takes priority.

For 12.7, interpret the approved audit as **Combat accessible in Play, absent from Management;
combat mechanics and character data unchanged**. Some original Phase 12 prose/tests above call
Combat "mode-independent" while also requiring it to disappear in Management. The next assessment
must explicitly reconcile that wording with the owner's rulings and audit before writing tests;
do not turn it into permission to keep Combat visible in Management. Use the existing carousel
visibility route, including safe navigation when switching away from an active Combat page,
clones, repeated transitions and the retained Safari/Spell Slots regression checks.

Then propose **12.8 separately** (legacy toolbar replacement, Save As and mode-entry lifecycle).
After that, compare **11.1 PDF** and **7 persistence/migration** using export/device evidence and
scope decisions; a Safari Print success is not proof of installed-app/Android PDF support.
D06 Weakness and remaining Hotei work remain explicitly outstanding; source-dependent phases
4.6–4.8, 6, remaining School flavour and 13/14 still need their prerequisites. Phase 15 remains last;
Phase 10 remains unscoped. Do not silently drop parked backlog items or invent missing rules.

The owner reported **56% of Codex weekly usage used** through the work so far, before this
documentation pass. That is a cumulative reading, not a measured Phase 12.5 delta. Historical
Claude percentages and project-duration estimates are not calibrated Codex forecasts. Both
ledgers explain necessary QA and avoidable review/rework overhead; preserve the QA/removal
contract while reducing repeated work. No precise remaining-release capacity is claimed.

Use the **28 September** ChatGPT/Codex or Claude next-session kickoff. The new session must make
its **own assessment of cost and the remaining roadmap**, draw independent conclusions, and give
specific evidence/trade-offs for each departure from this order. Present a bounded scope,
validation plan, uncertainty and approval checkpoint before any new production implementation.

## Dependant typing bugfix amendment — 30 September 2026 (confirmed and merged)

The first item of the 28 September order, the **separate Dependant inline-typing bugfix**, is
complete: built as `BUGFIX — Dependant Inline Typing` on branch `codex/dependant-typing`, confirmed
on the owner's iPhone and merged to `main` on 30 September.
It is a bugfix to Phase 4.5.8, not a roadmap phase; no phase number changes. Both optional fields
are covered, Play locking is unchanged, and removal is byte-identical to the previous `main` build.
**Phase 12.7 (Combat visibility) remains the
next proposed roadmap phase** and still needs its own approval; the rest of the 28 September
order stands.

## Phase 12.7 amendment — 30 September 2026 (confirmed and merged)

**Phase 12.7, Combat in Play only**, is complete: built as `PART K — Phase 12.7 Play Mode Combat` on
branch `claude/phase-12-7-combat-visibility`, confirmed on the owner's iPhone and merged to `main`
on 30 September. The "mode-independent" wording above is read as
the audit and the 28 September amendment read it: the mode changes nothing inside Combat; it only
decides whether the tab is there (shown in Play, absent from Management). Combat leaves the
carousel through its existing conditional-page path; switching to Management while on Combat lands
on Equipment; Combat still prints in either mode. Three retained harnesses that assumed Combat is
reachable from a fresh page (which opens in Management) received documented test-only corrections.
**Phase 12.8 (toolbar replacement)** was started on the owner's instruction the same day, as its own
release. The owner's *Manage as a separate screen* idea is parked for review after completion; see
"REVIEW LATER — Manage as a separate screen" under Deferred and declined.

## Phase 12.8 amendment — 30 September 2026 (confirmed and merged; Phase 12 complete)

**Phase 12.8, the old toolbar replaced**, is built as `PART K — Phase 12.8 Play Mode Toolbar` on
branch `claude/phase-12-8-toolbar`, confirmed on the owner's iPhone and merged to `main` on 30 September. It follows Phase 11's Engineering Scope (the
Characters list as the way to open, create, import, copy, export and delete; a manual Save kept;
Save As from the list and from Management) with the owner's two choices of 30 September: **Save
plus a ⋯ menu in the header** (Save As a copy in Management only, Print, Export JSON), and **New
Blank removed**. The existing buttons are moved, not rebuilt; the rest of the old row stays in the
page, hidden. Fourteen retained harnesses that pressed the old row with real clicks received
documented test-only corrections. **Print stays a browser print** until Phase 11.1 (PDF export).
This completes the Phase 12 tab-by-tab plan once merged. The owner's parked "Manage as a separate
screen" idea is unaffected: the header's Manage/Done is where such a screen would open from.
On testing, the owner parked one more idea for after completion: **Print on the Characters list's
per-character menu** (see Deferred and declined).

## Next-session planning amendment — 30 September 2026 (proposal, not implementation approval)

Phase 12 is complete. **Revised proposed order** (owner's request, after planning to work sourcebook
phases from the laptop and continue on the iPhone through Remote Control): (1) a one-off sourcebook
index (book and page for every topic the remaining phases need; no quoting); (2) Phase 7's first
release (true save format, migration of older saves; audit log awaits a ruling); (3) Phase 4.8
Ancestors, the first sourcebook build; (4) Phases 4.6 and 4.7 (one extraction pass, two builds);
(5) Phase 6 with Hotei; (6) Phase 9 flavour text as a light session; 13/14 late; 15 last. A ruling
is needed first on quoting rules text verbatim versus mechanics and page references in our own
words, since the site is public. Use `CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-09-30.md`: the new
session must make its own assessment of cost and the remaining roadmap and explain, point by point,
any difference from this proposal.

## Rulings and Phase 7 amendment — 30 September 2026 (later)

**Owner's rulings (all as recommended):**
1. **Sourcebook content is recorded in our own words with page references, never verbatim.** This
   applies to 4.6, 4.7, 4.8, 6, Hotei and 9's flavour text. The site is public, and Phases 13 and
   14 will open the owner's own PDF at the cited page.
2. Phase 7's Import converts older saves on the way in; stored characters are not rewritten in
   bulk.
3. The audit log is later.
4. Accented export names are fixed with Phase 7.

**The sourcebook index is built:** `Versions/SOURCEBOOK INDEX — Page Map/`, on branch
`claude/sourcebook-index-2026-09-30`. A script, not a reading session. It holds page numbers and
headings only. It gives each book's printed-page offset and answers Phase 13's per-book bookmark
question in advance: 12 books have working bookmarks; Strongholds none; Naishou's point nowhere.

**Phase 7's first release is built** and awaits the owner's iPhone check, on branch
`claude/phase-7-save-format`.
- **`SHEET_SCHEMA_VERSION` stays 2 on purpose.** It is the trunk's own format. Raising it would
  let a build without Phase 4.5.2 load format-3 saves and silently drop their configurations.
- **The format this build writes is `VersionManager.current()`.** A later format change registers
  one step there rather than adding its own wrappers.
- **Order unchanged:** Phase 4.8 (Ancestors) next; then 4.6 and 4.7, split by book with Core
  first; then 6 with Hotei, split into technique data, a Hotei declaration (needs a ruling), and
  the synergy engine last; then 9's flavour text, 13 and 14, and 15 last. 4.7 does not depend on
  4.6.

## Phase 4.8 rulings and first release — 30 September 2026

**Owner's rulings (30 September, from the phone):**
1. **Placement:** the Ancestor sits with the Clan and Family, on the sheet (a card at the foot of
   Clan, Family & School) and in the creation wizard (the Family screen), because it is part of
   the character's history and identity and a player must see that it exists. Not in the
   Advantages list; not the Identity tab.
2. **A "Lost ancestor's favour" badge** on the card removes every modifier the Ancestor applies.
3. **Favour follows the book (Core p. 241):** it may return once; a second loss is final; no other
   Ancestor may replace one whose favour was lost; no refund.
4. **Offered:** the character's own Clan; Spider Ancestors to anyone with the GM's permission
   (p. 244); other Clans' shown greyed.
5. **Fan wikis (Magical Samurai, Last Haiku)** are a supplementary cross-check only; the
   sourcebooks stay primary (recorded in the sourcebook index).

**First release built** on branch `claude/phase-4-8-ancestors` (`Versions/PART I — Phase 4.8
Ancestors/`): the Core Rulebook's eighteen Ancestors, cost charged to Experience spent, gifts
automatic or declared per roll, Hida's and Ikoma's damage, Shiba's Armor TN, measurable demands
flagged.

**Second release, the same night** (same branch): The Great Clans' sixteen Ancestors and Secrets of
the Empire's twenty (pp. 243–247, which also holds Imperial, ronin and Brotherhood Ancestors), from
the owner's photographs: 54 Ancestors in all. The owner's iPhone check of Kakita added four more
rulings, applied to every Ancestor:

6. **Gifts that change the dice after the roll are offered after it**, in the result, like Luck (a
   player cannot know beforehand whether a roll is worth re-rolling).
7. **A bonus that costs something** (a Void Point, a once-a-session use) **is offered in the roll
   preview** and paid when the player rolls; **a free, straight bonus is automatic** and shown in
   the preview.
8. **An audit of every Ancestor against 6 and 7**, with a check for missing Ancestors: `Versions/PART
   I — Phase 4.8 Ancestors/AUDIT.md`. Nothing is missing from the books supplied; the wiki check was
   blocked by the cloud session's network.
9. **The round i matches the Advantages' circled i**, the standard.

**Deferred by the owner:** the Clan & School page feeling cluttered (to Phase 15), and letting a
lost-favour Ancestor be edited in Management mode (to the end of the project). The Manage button's
clipped label, reported in the same check, is its own fix: `Versions/BUGFIX — Manage Button
Clipping/`. **Phase 4.8 is complete for the books supplied**, pending the owner's iPhone check;
other books show no Ancestor section (Enemies of the Empire p. 243 is the one page worth a look).

## Reassessment after Phase 4.8 — 1 October 2026 (proposal, not implementation approval)

Phase 4.8 is built and merged (both releases, with BUGFIX — Manage Button Clipping); its iPhone
check is owed, as are Phase 7's. The owner asked for the next build phase to be chosen whether or
not it needs the books. **Proposed next: Phase 4.6 Alternate Paths, with the Core Rulebook's 27
paths (pp. 251–257) as its first release.** Checked in the source on 1 October: the path engine
(`ALTERNATE_PATH_LIBRARY`, `pathsAvailableAt()`, `pathRequirementsUnmet()`, the Techniques tab's
picker and the Rank substitution in `unlockTechniques()`) already takes any School, as this
roadmap's Engineering Scope says, so the phase is content and tests. Then **Phase 4.7** with the
Core Rulebook's 8 Advanced Schools (pp. 245–250; photograph pp. 245–257 once for both), after
settling against Core p. 245 whether an Advanced School is a separate track and whether it needs
the Multiple Schools Advantage; then both phases book by book; then 6 with Hotei; 13 and 14; 11.1;
D06 when ruled; 9's flavour text as a light session; 15 last. The reasons and relative effort are in
the ledger's 1 October update; the risks to measure before building are in the kickoff below (chiefly
that a taken path is recorded by Rank alone, not by School, which matters with Multiple Schools). Use `CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-01.md`: the new
session must make its own assessment and explain, point by point, any difference from this one.

## Assessment and a bugfix — 1 October 2026 (laptop session)

The new session tested the 1 October proposal against the source, the live build and the Core
Rulebook (read from the owner's PDF; text kept in a scratch folder only, per the 30 September
ruling). **Owner's approval, 1 October:** a bugfix first, then **Phase 4.6's first release: the
Core Rulebook's 18 Great Clan paths (pp. 251–255) and the engine work they need**; the other 9
(magistrate, Legion and Champion paths, and more than one Path per character) in a second release.

**Phase 4.6's Engineering Scope above is amended by the pages.** "No changes needed to
`pathsAvailableAt` or `pathRequirementsUnmet`" holds for 10 of the 27 Core paths only. The first
release adds: a taken Path recorded against its School (a Phase 7 format step; measured on 1
October, a Path taken in a character's first School replaced the second School's Technique at the
same Rank); `replaces` clauses naming a Clan and School type ("any Crab Bushi School"), which needs a
School type for every School; a Rank per clause (Empress Guard: Kakita 3 or Daidoji 4); and Honor, a
named Disadvantage, and "one Skill of a type at Rank 3" as requirements. Core p. 246 also allows
several Paths per character (each basic Rank replaced once; a second Path is not a School Rank):
the second release. **Open ruling before 4.6 starts:** p. 246 gives a monk's first Path exactly one
Kiho at its Rank; the sheet gives two for 9 of its 12 monk Paths.

**Phase 4.7, from Core p. 245:** an Advanced School is a separate track with its own Ranks 1–3; the
basic School stops advancing on entry; one Advanced School per character; the page does not ask for
the Multiple Schools Advantage, which this roadmap's 4.7 scope requires (**ruling before 4.7**;
recommended: follow the book). The Core Rulebook has **9** Advanced Schools, not 8 (the index
missed the Elemental Guard).

**BUGFIX — Multiple Schools Keep Earlier Techniques** (not a phase; no phase number changes): adding a
School through Multiple Schools stripped the earlier School's Techniques and a monk's free Kiho
(Core p. 151–152: nothing is forgotten). Built on branch `claude/bugfix-multiple-schools-techniques`;
awaiting the owner's iPhone check and word to merge. Phase 4.6 comes next on approval of its report.

## iPhone results and four rulings — 1 October 2026 (laptop, later)

**The owner's iPhone check** of the four owed releases, through one combined checklist doc: **47 of
52 checks passed.** Phase 7's first release (6/6) and BUGFIX — Multiple Schools Keep Earlier
Techniques (5/5) are confirmed. Phase 4.8 passed 35 of 38. BUGFIX — Manage Button Clipping does its
job (nothing in the header moves) but its first tap is slow, with a brief overlap of the labels.

**Rulings ("go with your recommendations"):**
1. **This check's corrections go in one bugfix folder:** BUGFIX — Ancestor Corrections (Void Offer,
   Info Button, Clan Picker), built on branch `claude/bugfix-ancestor-corrections`: a Void option is
   offered beside Seppun's or Komori Iongi's gift only when its own effect applies (check 4.23); the
   Ancestor's i takes the A01–A16 Advantages' style (check 4.1); the Ancestor list follows the Clan
   picker. Awaiting the owner's iPhone check and word to merge.
2. **Phase 15:** the Advantage configuration windows' gold italic i, and the slow first Manage tap.
3. **Phase 4.6's first release applies the monk Kiho rule of Core p. 246**: a monk's first Path grants
   exactly one Kiho at its Rank, later Paths none (the sheet now gives two for 9 of its 12 monk
   Paths). This settles the one ruling the 1 October amendment left open before 4.6.

**Deferred by the owner:** a once-a-session Ancestor gift already used should not be offered at all
(checks 4.18 and 4.23). Phase 4.6's first release comes next, as approved.

## Re-test passed; Phase 4.6 started — 1 October 2026 (evening)

The owner re-tested BUGFIX — Ancestor Corrections on the iPhone (the "Re-test Checklist" doc): **9 of
9 passed**, including ordinary Void offers with no Ancestor. **Phase 4.8 is complete for the books
supplied.** Still deferred by the owner: the Clan & School page's clutter (Phase 15), a lost-favour
Ancestor editable in Management (end of project), and a used once-a-session gift not offered (later).
The seven Phase 0.7 Android checks remain unrun; they are in the same doc for when an Android phone is
to hand.

**Phase 4.6's first release started on the owner's word**, as approved earlier the same day: the
Core Rulebook's 18 Great Clan paths with the engine work they need (a taken Path recorded against
its School through a Phase 7 format step; Clan-and-type `replaces` clauses; a Rank per clause; Honor,
a named Disadvantage and "one Skill of a type" as requirements) and the monk Kiho rule of Core p. 246.
Usage was 36% of the week at the start.

## Phase 4.6's first release built and merged — 1 October 2026 (night)

`Versions/PART I — Phase 4.6 Alternate Paths/`, built on branch `claude/phase-4-6-alternate-paths` and
**merged to `main` on the owner's word (`317ebca`), before the iPhone check** (the "Phase 4.6 iPhone
Checklist" doc, linked from the ledger). As amended above, the engine work was needed: one fragment
rebinds eight trunk functions (none edited). A taken Path is recorded against its School (`f_pathTaken`
is now `{"<School>": {"<Rank>": "<Path>"}}`, carried up by a Phase 7 format step: saves are format 4);
`replaces` clauses may name a Clan and a School type; each clause has its own Rank; requirements gain
Honor (the Honor block's Rank field, confirmed by the owner the same night; Glory, Status and Honour as a whole are to be reviewed at the end of the project), a named Disadvantage, and one Skill of a
kind; a monk's first Path grants one Kiho, a later one none (Core p. 246); every clause is checked at
load. 80/80 own checks, 3,524/3,524 in the full suite, byte-identical removal. Four retained harnesses
that pinned save format 3 were made conditional on the new step (test-only).

**This Engineering Scope's "Validation Test Suite" is met for these 18 Paths** (the dropdown stays
hidden until a School's Path is reachable, one School's Paths never appear for another, monk Paths
behave as before apart from the p. 246 ruling). **Next for 4.6:** the second release, the Core
Rulebook's other 9 Paths (magistrate, Legion and Champion Paths: Courtier Schools, Glory, appointments,
"any Rank" Paths) and more than one Path in one School (p. 246: each basic Rank replaced once; a later
Path is not a School Rank). Usage was 43% of the week at the merge.

**Confirmed the same night:** the owner's iPhone check of the first release passed **19 of 19** (the
seven Phase 0.7 Android checks still not run). Ruled in the checklist: Honor requirements read the
Honor block's Rank field; Glory, Status and Honour are reviewed as a whole at the end of the project.
**Proposed next, for approval:** Phase 4.6's second release.

## Phase 4.6's second release built — 1 October 2026 (night)

Approved by the owner at 45% of the week; built in the same fragment and folder as the first release
(the two are removed together), on branch `claude/phase-4-6-alternate-paths-r2`, **not merged**. The
Core Rulebook's other 9 Paths (pp. 256–257) and several Paths in one School. Engine additions: clauses
naming several School types and "any Rank" (the Champions; the player picks the Rank); Glory (the
Glory block's Rank field) and appointments (GM notes) as requirements; the Magistrates' Imperial Skill
waiver; a picker that adds and removes (the trunk's one-Path handler is dropped by swapping the control
for a copy); Core p. 246's "a later Path is not a School Rank" for Kiho Mastery, the Kiho cap, spells,
the casting breakdown and Mirumoto; the Topaz Champion keeping its Technique. 124/124 own checks,
3,568/3,568 in the full suite, 27/27 pinned variants, byte-identical removal of both releases. With all
27 Core Paths in, **Phase 4.6's Core scope is complete once confirmed**; about 109 Paths in the other
12 books remain for later releases.

**Confirmed the same night:** the owner's iPhone check of the second release passed **21 of 21**; all
27 Core Paths are in. **Proposed next, for approval:** Phase 4.7 (the Core Rulebook's 9 Advanced
Schools), after the owner's ruling on the Multiple Schools gate (recommended: follow Core p. 245, no
Advantage asked); or Phase 4.6's other books.

## Phase 4.6's third release built, and the audit — 1 October 2026 (late night)

On the owner's word at 51% of the week; built in the same fragment and folder (the three releases are
removed together), on branch `claude/phase-4-6-alternate-paths-r3`, **merged on the owner's word the same night**, before
the iPhone check. The other books'
175 Paths from 13 books: 136 can be taken; 39 ronin, Naga, peasant and geisha Paths are recorded only,
since no School in the sheet can take them. The owner's audit (`AUDIT.md`): every page of the 16 books
that says "Replaces:" or "Technique Rank:", every Path heading, Secrets of the Empire's School Index and
the 24 wiki pages of the sourcebook index; every Path in the owner's books is in, and thirteen come from
books the owner lacks (eleven from The Second City). The estimate of about 109 was low: the first
inventory missed some heading forms, and the audit found 21 Ronin Paths (Core pp. 234–235, Enemies of
the Empire pp. 200–205). Engine additions: family, Minor Clan (the Mantis left out), excepted-School and
Affinity clauses, Schools the sheet lacks recorded on the clause (Hiruma Scout, Akodo Tactical Master,
Kaiu Siege Master: candidates for Phase 4.7), Rank 6 Paths, and Skill-count, family, any-of Skill and
Advantage, Honor-ceiling and Path-held requirements. 175/175 own checks, 3,619/3,619 in the full suite,
44/44 pinned variants, byte-identical removal of all three releases. Merged (`7c01d0c`) and walked
headlessly on the live site: all 13 device checks hold. **Once confirmed, Phase 4.6 is complete for the
owner's books.** Proposed next, for approval: Phase 4.7 (the Core Rulebook's 9
Advanced Schools), after the ruling on the Multiple Schools gate.

## Reassessment after Phase 4.6 — 2 October 2026

The owner's check of Phase 4.6's third release passed **13 of 13** (the Android checks not run), so
**Phase 4.6 is complete for the owner's books**: 214 Paths, confirmed on the iPhone in three releases
(19/19, 21/21, 13/13). The owner asked for the next phase to be chosen regardless of whether it needs the
sourcebooks; the 16 PDFs are read directly in laptop sessions.

**Measured on 2 October (the evidence behind the order):**

- **Technique text.** 72 of the 338 School Technique names the libraries reference have no
  description of their own, and every one is in the **20 Minor Clan and Mantis Schools** (all five
  Techniques of most of them). 71 show the fallback text (the owner's test screenshots show it under
  the Usagi Bushi's and Yoritomo Courtier's Techniques); the 72nd, the Toku Bushi's Rank 4, shows a
  Path's text (below). **All 72 are found in the books** (Core Rulebook pp. 120–122 and 216–227, The
  Great Clans pp. 166–169, Secrets of the Empire p. 238): the sourcebook index located 65, and a search
  of the Core Rulebook's text on 2 October found the seven it missed: Voice of the Storm and Command the Winds (Core Rulebook pp. 120–121), Favor of the Sun (p. 121), The Kami's Whispers (p. 217), Guided by Fate (p. 218), Essence of Chikushudo (p. 220) and To Punish the Wicked (p. 224).
- **A defect from Phase 4.6's third release:** the Book of Air's Master of Games (a recorded-only
  ronin Path) and the Toku Bushi's Rank 4 Technique share the name "Forge Your Own Fate". The School's
  had no description, so the Path's text now shows on it. The only such collision. Phase 4.6's load
  check compares only described Techniques; it should cover every School Technique name.
- **Advanced Schools.** Secrets of the Empire's School Index lists 23 across the books (the Core
  Rulebook's 9 among them); the sheet has none. Of the index's 101 Basic Schools, two are missing: the
  Hiruma Scouts (Imperial Histories p. 147) and the Yotsu Bushi School (Imperial Histories p. 276); the
  rest are in the sheet, some under other names (the Yasuki Merchant is the sheet's Yasuki Courtier, the
  Fudoist Monk its Fudoist Order).
- **Advantages and Disadvantages.** The sheet holds 73 and 66. The owner's September prompt for a full
  sourcebook audit of missing ones ("Phase 4.5 — Full Sourcebook Audit for Missing Advantages &
  Disadvantages", an untracked Word file in `Versions/`) has not been run; Phase 4.5's audits covered
  configuring entries already in the catalogue, not entries the catalogue lacks.

**Proposed order (each needs the owner's approval):**

1. **Phase 6, first release: the missing School Technique text**, with the Toku Bushi fix folded in.
   Every player of a Minor Clan or Mantis School sees it; it is small, needs no ruling, and is the text
   Phase 6's synergy engine must have. Non-goals: the SynergyEngine itself (a later release of Phase 6),
   Void-cost fields (Hotei), automating any Technique's effect.
2. **Phase 4.7, Advanced Schools**, the Core Rulebook's 9 first (pp. 247–250), after the owner's ruling
   on the Multiple Schools gate (recommended: follow Core p. 245, which asks for no Advantage). Phase
   4.6's requirement engine (clauses, requirements, the School-keyed record and its format step) is
   reused. Then the other 14 by book, with the two missing Basic Schools.
3. **The full sourcebook audit of Advantages and Disadvantages** (Phase 4.5's unrun September
   prompt), audited as Phase 4.6's Paths were, then added by book: flat entries first, configured ones
   through Phase 4.5's machinery.
4. Then, by the owner's choice: Phase 6's SynergyEngine; 11.1 Export to PDF (no books, the largest
   engineering unknowns); 13 Library, then 14 Search; Phase 9's School flavour text as a light session;
   D06 Weakness and Hotei when ruled; 15 last.

**Alternatives considered:** Phase 4.7 first (a larger feature, but it waits on a ruling the owner can
give while 1 is built); the Advantages and Disadvantages audit first (its gap is not yet measured); 11.1
first (needs no books but carries the most engineering risk); the parked Rank 0 exploding-10s bug (the
owner parked it until the next change to dice rolling). The next-session kickoff is
`Versions/CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-02.md`.

## Phase 6's first release built — 2 October 2026 (later)

The owner approved "the Technique text release with the Toku fix". Both layers are built on branch
`claude/phase-6-technique-text` and were merged to `main` on the owner's word the same day, before
the iPhone check (MANUAL-TESTS.md in Phase 6's folder). Usage: 66% → 77% of the week.

**The owner's rulings this session:**

1. Saved characters' Technique rows that still hold text the sheet wrote, now known to be wrong or
   missing, are rewritten on load; edited rows are never touched.
2. The Doji Courtier fix is included.
3. **Phase 4.7: an Advanced School requires the Multiple Schools Advantage** (the roadmap's scope,
   not Core p. 245's reading).

**Measured this session, before building:**

- **A second clash.** "The Gift of the Lady" is the Doji Courtier's Rank 5 (Core p.111) and the
  Hitomi Kikage Zumi Order's Rank 1 (Imperial Histories 1 p.215). The text list held the key twice,
  so a Rank 5 Doji Courtier read the monk's tattoo Technique.
- **The text is saved in each Technique row.** Text added later reaches only new characters unless
  saved rows are updated.
- **The sourcebook index's "not found" Techniques.** The index's seven are on Core pp.217, 218,
  220, 120, 121, 121 and 224, in the order Komori, Tonbo, Kitsune, Yoritomo Bushi, Yoritomo
  Courtier, Moshi and Chuda. The index's second hit for "The Eyes of the Emperor" (Core p.230) is the
  Miya Herald's "Eyes of the Emperor": a different name, and no clash.

**Built:**

- **BUGFIX — Technique Name Clashes:**
  - text per School for a shared name;
  - the Master of Games' Technique renamed;
  - a load check covering every School Technique and every shared name;
  - stale saved rows rewritten on load.
- **Phase 6's first release (Part G):** the 72 texts, in our own words with book and page. No text
  shares a run of 8 or more words with the book.

**QA:**

- The full suite passed **3,666/3,666**.
- The new harnesses read 26/26 and 21/21; on today's `main`, 13/26 and 9/21.
- The fix's 10 variants and Phase 6's 8 each turn their harness red exactly where pinned (discovery, then a pinned run), and each layer's two boundary builds (Phase 12's modes off, Phase 4.6 off) read fully green.
- Removing both layers restores `main`'s build byte for byte.

**Effect on the proposed order:**

- 4.7 is no longer blocked by a ruling. It still waits for the owner's approval after this release
  is merged and checked.
- The full sourcebook audit of Advantages and Disadvantages stays third.
- Phase 6's SynergyEngine can now read every School Technique's text. It remains a later choice.

## The Advantages and Disadvantages audit — 2 October 2026 (night)

The owner asked for the full sourcebook audit, building nothing (the third item of the 2 October
reassessment). Published as the doc [Advantages and Disadvantages — Sourcebook Audit](https://claude.ai/code/artifact/485b7ec0-c6cd-4c63-b9e6-3e5c4ecf74a6); the
repository copy is `Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`, on branch `claude/adv-disadv-audit`.

- **The sheet holds all 131 of the Core Rulebook's entries plus 8 from supplements (139).** 44 have a
  picker; 89 only record cost and text.
- **65 entries are missing, all from supplements** (44 Advantages, 21 Disadvantages). 42 are usable by the
  sheet's characters; 23 are Naga or Nezumi only.
- **25 pickers are still needed** (9 existing, 16 missing), plus 4 options in existing pickers. **94
  entries could be automated** with existing machinery. **43 have Clan or School prices** the sheet does
  not apply.
- **Rulings asked:** Student of the Past, Trials of the Imperial City, Wanderer, and whether to add Naga,
  Nezumi or Emerald Empire Station entries; Weakness's rulings are still pending.

Nothing is built from it until the owner chooses. Its cheapest suggested slices are the shared Clan and
School price step (43 entries) and the untrained-Skill Rank 1 lift for Crab Hands, Crafty, Sage and
Sensation (Soul of Artistry's mechanism).

## Reassessment after the Advantages and Disadvantages audit — 2 October 2026 (night)

The owner's reading after the audit: **86% of the week** (+6). The owner asked for the next phase with
the biggest impact on overall progress, at the least cost. The build ledger, this roadmap and the
audit were reread.

**Measured (the evidence):**

- **The audit** (`Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`):
  - 139 entries in the sheet, of which 89 record only their cost and text;
  - 65 missing (42 usable by the sheet's characters);
  - 25 pickers needed;
  - 94 entries could be automated with machinery the sheet has;
  - 43 have Clan or School prices: 39 in the sheet (38 Core and Uncentered) and 4 missing.
- **The price step is cheap in the code.**
  - Heart of Vengeance (4.5.16) already prices its row from the character's Clan, by rebinding
    `refreshAdvConfigControl`.
  - `refreshAllAdvConfigControls()`, called by `recalcAll()`, runs that for every row: added from the
    list, typed, loaded or imported.
  - The wizard's Advantages step reads the row's own `.en-cost`.
- **The parked Rank 0 exploding-10s bug** (trunk `rollSkill()` passes no `explode:false`) waits for "the
  next change to dice rolling". The untrained-Skill lift for Crab Hands, Crafty, Sage and Sensation
  (Soul of Artistry's wrapper) is that change, in the same code.
- **Allowance.**
  - About 11% of the week is left after this handoff. It resets on 7 October at about 02:00 BST.
  - A content release reusing the engine costs 5–9% with its docs. Phase 4.6 cost +7, then +5 (+1 for
    docs), then +9 (+6).
  - A01–A16's single-mechanism releases averaged about 2.5%, with lighter QA than now.

**Proposed order (each needs the owner's approval):**

1. **Phase 4.5.25, Clan and School prices.**
   - Prices 39 entries in the sheet; estimated at 5–8%; it fits this week.
   - No rules ruling needed.
   - Three defaults to confirm:
     - a cost typed by hand is kept and marked;
     - with several Schools, any School's type counts;
     - existing characters are re-priced when opened, before they are marked saved.
2. **Phase 4.5.26, untrained Skills.** The Rank 1 lift for the four entries, with the Rank 0 bug as its
   own BUGFIX layer on the owner's word. This week if the reading allows; otherwise first after the
   reset.
3. **Phase 4.7, the Core 9 Advanced Schools,** first after the 7 October reset. Then the other 14, and
   the Hiruma Scouts and Yotsu Bushi.
4. **The audit's automation, by mechanism, the most entries first.** Then the missing entries by book,
   each with its mechanism. Then the pickers.
5. **Then, as the owner chooses:**
   - Phase 6's SynergyEngine;
   - 11.1, sized by an iPhone Print test;
   - 13, then 14;
   - Phase 9's flavour text;
   - D06 and Hotei, once ruled;
   - 15 last.

**Principles behind the order:**

- Fit each release to the allowance that is left: unused allowance is lost at the reset, and a stopped
  release has to be re-read.
- Build mechanisms before the entries that use them.
- Bundle work that shares one code path.
- Ask for every ruling up front, in one batch.

**Alternatives considered:**

- 4.7 now: too large for what is left this week.
- Prices and the lift together: saves 2–3% of overhead, but over budget, and it separates the lift
  from the bug.
- The missing entries by book first: they would arrive record-only.
- Waiting for the reset: wastes the remaining allowance.

**The projection** is re-derived in the ledger's current update: about 2–4 weeks of allowance, most
likely 3. The scope of the audit's follow-ups is now the largest lever.

The next-session kickoff is `Versions/CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-03.md`.

## Phase 4.5.25 built — 2 October 2026 (night, latest)

Approved by the owner with four rulings: a typed cost is kept and marked; **a Management visit is the
purchase** (prices provisional in Management, following every change in that visit, and fixed on
leaving it or finishing the wizard); every School held at that moment counts, never retroactively; a
save from before the release is priced once from its starting School and fixed.

Built on branch `claude/phase-4-5-25-clan-prices`, not merged. 40 entries priced: the audit's 38
picker-less Core entries, Friend of the Brotherhood (missed by the audit), and Uncentered (owner's
ruling: 2 for a Clan monk, a [Monk] School of a Clan; 4 for a Brotherhood monk; new purchases only).
Left out: Blackmail and Way of the Land (picker-owned; also missed by the audit). Owner's ruling:
[Artisan] is its own School type (Core p. 222). QA: own harness 45/45 (15/45 on main), 10 variants
pinned, full suite 3,711/3,711,
removal byte-identical to `033a0bf2…`. See `Versions/PART I — Phase 4.5.25 Clan and School Prices/README.md`.
Next: 4.5.26, untrained Skills, first after the 7 October reset.

## Phase 4.5.25 confirmed; projected length — 2 October 2026 (night, last)

Phase 4.5.25 was confirmed on the owner's iPhone (all checks passed) and merged. The week read 94%. The
ledger's current update re-derives the remaining work at about 160–300% of one week's allowance: most likely
about three more weeks from the 7 October reset (around the week of 28 October; range 21 October to early
November). **An estimate and a guide, not a fact**: the audit's chosen scope, the Library (13) and device
corrections are the largest uncertainties. Next: 4.5.26, untrained Skills, first after the reset.

## Reassessment after Phase 4.5.25 — 2 October 2026 (night, final; proposal, not implementation approval)

The owner asked again for the biggest impact on overall progress at the least cost. The week read 94%, so
nothing more is built before the 7 October reset.

**Proposed next: Phase 4.5.26, the dice-path entries.** It is one release of about 5–7%:

- the parked Rank 0 exploding-10s bug, as its own BUGFIX layer, on the owner's word;
- the Rank 1 lift for Crab Hands, Crafty, Sage and Sensation (Weapon, Low, Lore and Perform Skills; Soul of
  Artistry's wrapper);
- Gaijin Name: each die explodes once on a Social Skill roll (Core p. 159).

All three change the same exploding-dice code. Gaijin Name was measured this session, from the Core PDF.

**Then:** Phase 4.7's three releases (the Core 9 first); then the audit by mechanism (roll-preview ticks
first), after the owner rules on the audit's scope. That ruling is the largest free saving (10–15%).

The projection in the ledger stands: about three more weeks from the reset. It is an estimate. Kickoff:
`Versions/CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-07.md`.


## Dice entries merged and deployed — 3 October 2026 (Codex)

The owner approved continuing after the independent kickoff assessment. The
separate Rank 0 explosion fix and Phase 4.5.26 implement the five printed rules
on `codex/phase-4-5-26-dice-entries`. Both untrained attack routes and existing
rerolls are included. Focused checks: 19/19 and 110/110; pinned variants and
boundaries pass. Full suite **3,840/3,840**; no retained harness changed. Both
removal orders restore main byte for byte. Structural inventory and phone/desktop
layouts verified. Merged on the owner's word at `72523fe`; live checks 129/129.
The owner reports the checklist passed on Windows, 3 October, supported by 15
screenshots reviewed without a discrepancy. The owner confirmed Windows-only
testing. The iPhone checklist remains Not run; see OWNER-TEST-REVIEW.md.
The owner accepts this Windows pass as sufficient to proceed. The remaining
iPhone visual/layout check is non-blocking; Phase 4.7's Core nine-school release
is now authorized. Do not infer an iPhone pass.
Use the dice-entry folder's combined runner. See its README and ROLLBACK.md.

Next proposed: Core's nine Advanced Schools, then the other two Phase 4.7 releases
together; then the audit by mechanism, the nine situational preview entries first
after scope rulings. No additional rules ruling was needed for this dice release.
The latest ledger re-derives the projection: prior rows total 156–300 historical
Claude points; using complete delivery cost for Advanced Schools and contingency
gives 166–320 provisionally. This is not a Codex usage forecast or a deadline.
The audit snapshot and historical amendments remain historical evidence; they do
not override the latest delivered/built/confirmed status above.


## Remaining Phase 4.7 releases — 5 October 2026

The owner authorized the remaining Phase 4.7 work. Two separate removable releases
add fourteen supplemental Advanced School records and the missing Hiruma Scout
and Yotsu Bushi Basic Schools. Both releases were merged to main on the owner's instruction on 5 October
at `d39348a` (supplemental commit `f9e3b88`), and both pull requests are merged.
Live deployment was verified on 6 October: exact committed HTML plus the PWA
head, service worker and published assets match; **156/156 supplemental and
38/38 Basic checks** pass against the downloaded live page. Evidence:
`PART I — Phase 4.7.2 Missing Basic Schools/qa/live-verification.json`.

Thirteen supplemental entries support current human characters. Nezumi Berserkers
is recorded but unavailable because the sheet has no Nezumi character model.
The full catalogue has 23 Advanced School records, 22 playable with the current
model, and 69 source-cited Technique references. Technique effects remain manual.
The two Basic Schools add ten more Technique references and normal starting
packages; no outfit is invented for Hiruma Scout. Tiger's Yotsu is labelled with
its Heroes of Rokugan setting and does not replace canonical Ronin Yotsu.

The supplemental gate checks now handle prior qualifying Shugenja training,
Void casting only with Ishiken-Do, distinct Ring/Weapon counts, configured Allies
and Great Potential, and actual Inquisitor's Strike possession. Kakita Artisan
training requires an earned rank. Five existing Hiruma Scout Path clauses now
resolve. Akodo Tactical Master's Advanced-rank replacement Path remains outside
the existing Basic-rank Path interface; this boundary and Nezumi support must
not be described as completed playable functionality.

**Verified 5 October:** full combined suite **4,230/4,230**; supplemental **156/156**, Basic **38/38**, dependency checks **189/189**, and all 16 mutation variants match their reviewed pins. Each remover has 23 passing fixtures and one Windows symlink skip. Both removal orders restore main exactly; retained suites pass with either release removed. Build, ownership and structural checks pass. See each release’s qa/final-verification.json. The full runner is the Missing Basic Schools release's
qa/current-suite-runner.js. Worked normal and fringe cases are in each new
release's MANUAL-TESTS.md. The owner's 6 October report and its exceptions
are recorded below; automated narrow-view checks are not an iPhone pass.

**Owner ruling: FT-07, Scorpion Instigator's four Blackmail purchases, is deferred
to Phase 15 or beyond.** All other FT-01–FT-08 feedback stays recorded for final
review. The intermittent Spell Slots issue was observed in ChatGPT's Windows
preview/file explorer; the earlier Safari issue is resolved, and a shared cause
is unconfirmed. No feedback feature has been silently implemented here.

Next proposed work remains the audit's nine situational roll-preview entries,
after its scope rulings. Do not move to that work merely because this catalogue
is built. The published Claude ledger has not been refreshed; preserve its saved
ticks before any future publication. Account-wide Codex usage on this resumption
was 36% weekly / 29% five-hour used; it is not a clean release cost or comparable
to the historical Claude allowance projection. After final verification the account
read 51% weekly / 23% five-hour used; the five-hour window changed during the work.

## Phase 4.7 test feedback — 6 October 2026

### Owner test feedback — 6 October 2026

The owner reports that the other Phase 4.7 tests worked as described, with these
qualifications. The device/browser for this report was not specified; do not infer
an iPhone pass or turn the aggregate report into evidence for every individual case.

- **Minor Clan Defender: confirmed eligibility defect.** An unconfigured Paragon
  qualified in the deployed release. The correction requires a chosen, valid Paragon tenet; any of
  the seven virtues is acceptable. This is a focused corrective follow-up, separate
  from the deferred reviews below. Retest blank/cancelled configuration, a valid
  Compassion choice, and save/reopen. Correction work is on
  codex/fix-minor-defender-paragon; merged and verified live on 7 October.
- **Imperial Scion / test 2: owner reports pass.** Include its fractional Status
  threshold and the distinction between Rank and Points in the existing final
  Glory/Honor/Status review (FT-09); preserve current behavior meanwhile.
- **Kobune Captain / test 3: owner reports pass.** Keep the current gate. Review
  whether a non-Mantis character's appointment is adequately represented by the
  narrative confirmation, or needs a Clan/GM-exception rule, after the entire
  project (FT-10). The owner's setting concern is a review request, not a new rule.
- **Kolat Assassin and Legion of Two Thousand: reruns passed on 7 October.** The
  owner had trouble following the earlier brief instructions on 6 October, then
  confirmed both worked after using the expanded sections 9a and 9b. The earlier
  report was a request for clearer instructions, not a reported functional failure.

### Owner functional retests confirmed — 7 October 2026

The owner explicitly reran and confirmed all three follow-ups work as expected:

- **Test 1 — Minor Clan Defender / configured Paragon: Pass (owner report).**
- **Test 9a — Kolat Assassin: Pass (owner report).**
- **Test 9b — Legion of Two Thousand: Pass (owner report).**

These three functional follow-ups are closed. With the earlier report that the
other tests passed, the delivered Phase 4.7 scope is owner-confirmed. Device and
browser were not specified; no iPhone visual/layout pass is inferred.
FT-07 Blackmail remains deferred to Phase 15 or beyond; FT-09 Honor/Glory/Status
and FT-10 Kobune Captain remain end-of-project reviews. Nezumi is recorded-only,
Advanced-rank Path replacement is unsupported, and Technique effects remain
manual. This confirmation does not expand those delivered boundaries or approve
implementation of the next audit phase.

### Paragon correction verified — 7 October 2026

Minor Clan Defender now requires a Paragon with a confirmed, valid Bushido tenet
for new entry. Any of the seven tenets qualifies; merely adding the Advantage or
cancelling its configuration does not. Existing Advanced School records, earned
ranks and saved Techniques are preserved. This is a separately removable fix in
BUGFIX — Minor Clan Defender Paragon Gate. Kobune Captain and the Honor/Glory/Status behavior remain unchanged.

Full corrected suite **4,262/4,262**; actual scratch removal restores the exact previous build and all **4,230/4,230** retained checks pass. Focused checks **32/32**, dependency checks **40/40**, retained dependency checks **189/189**, five pinned mutation variants, and ownership checks pass. Removal fixtures: 20 pass, one Windows symlink skip.

The correction was merged to main on 7 October at 9dc8d01 (PR #7). Live
deployment is verified: **226/226 focused checks** on the served page, exact
committed source plus PWA head/assets, and service-worker build 77e83cad44e77520.
See the fix's qa/live-verification.json. The owner confirmed the three functional retests on 7 October (above).
Latest full runner: this fix's qa/current-suite-runner.js; detailed evidence is in
qa/final-verification.json and qa/regression-verification.json. The prior merged
release's live verification (194/194, 6 October) remains historical evidence for
d39348a. Owner functional retests passed on 7 October; iPhone visual checks remain unconfirmed.

## Phase 4.5.27 and the revised build order — 7 October 2026 (Claude)

**The owner approved the assessment "all as recommended" on 7 October 2026.** That adopts the
revised build order below, approves Phase 4.5.27 as scoped, and takes three rulings: Imperial
Scribe's Calligraphy Free Raise shown as a no-dice "Free Raise available" line; Balance adding only
its own +1k0, with a reminder to add Honor Rank; Balance hidden while Failure of Bushido is the
Honor tenet.

**Phase 4.5.27 Situational Roll Entries (Part I)** is built, verified, merged to `main` on the owner's word at `86e6d49` and live (7 October 2026; live focused checks 271/271; the owner's checklist, run the same day on Windows with 9.1/9.2 on the iPhone: 31 Pass, 2 Fail, both answered by Phase 4.5.28 below). Nine Advantages that only recorded
their cost and text — Balance, Clear Thinker, Dangerous Beauty, Heartless, Imperial Scribe, Imperial
Spouse, Irreproachable, Precise Memory and Wary — are offered as per-roll ticks through the 4.5.15
registry, each only where the book's roll type fits, unticked every roll and never saved. Rules read
from the PDFs (Core pp.146–155, The Great Clans p.136, Imperial Histories p.67). Imperial Spouse's
+0.5 Status and Imperial Scribe's requirements (Status 2+, Calligraphy 4+) wait for the Glory,
Status and Honour review; Advantages granted by Techniques stay manual. QA: own harness 127/127 (17/63 on `b414423`); full suite 4,389/4,389; scratch removal restores `b6b8bc00…` exactly with 4,262/4,262 retained; 12 pinned variants as expected. See
`Versions/PART I — Phase 4.5.27 Situational Roll Entries/README.md`.

**Revised build order (adopted 7 October 2026).** Each step still needs its own approval; none
starts automatically.

| Order | Work | Why it sits here |
|---|---|---|
| 1 | 4.5.27 Situational Roll Entries | Done above: one data table on a registry five providers already use |
| 2 | Wound entries: Strength of the Earth, Low Pain Threshold, Permanent Wound, Bad Health | The sheet already prints a Wound penalty on every roll, and for these characters the number is wrong. Two only adjust the penalty; two move the Wound Rank thresholds. The penalty itself must change, or Dark Paragon's Determination (which cancels the raw penalty) over-corrects |
| 3 | Automatic modifiers needing no choice: Silent, Prodigy, Bad Eyesight, Disturbing Countenance (Voice and Anachronism if their scope reads cleanly) | Small, always-on. Narrowed from the earlier "automatic bonuses and TN adjustments": Lame, Missing Limb and Disbeliever are situational or need a picker, and Blind is large |
| 4 | Phase 14 Search, first release | Phase 14 allows search before 13 (only the book link needs 13). A new screen: it needs design rulings and an iPhone layout pass; Items and Monsters have no catalogue yet |
| 5 | The rest of the audit, after the owner's scope ruling | Damage entries (Large, Small, Hands of Stone) first |
| 6 | Reassess 11.1, 13 and Phase 6 with evidence | The owner's quick ⋯ → Print test on the iPhone still sizes 11.1 |
| 7 | Flavour text, the audit log, D06 and Hotei once ruled, end-of-project reviews (now including the resist entries' clutter, parked 7 October); Phase 15 last | Unchanged |

**Discrepancies corrected the same day:** Phase 14's dependency on 13 (build-order row 23, the
status row and the ledgers' Ahead table) now matches Phase 14's own text; the Phase 4.5 status row
no longer calls 4.5.26's iPhone check owed (the owner accepted Windows on 3 October). The 2 October
audit's counts predate 4.5.25 and 4.5.26: about 84 entries still record only cost and text, about
45 of them buildable with existing machinery (excluding the Status-review group, Weakness and the
Initiative entries).

## Phase 4.5.28 and a parked review — 7 October 2026 (Claude)

The owner's checklist for 4.5.27 passed 31 of 33. The two Fails, and the rulings taken on them, are
**Phase 4.5.28 Situational Entry Buttons and Gates (Part I)**, built on
`claude/phase-4-5-28-situational-buttons`, merged to `main` on the owner's word at `ec7f42a` and live
(7 October 2026; live focused checks 285/285; the owner's checklist is Not run):

- **Wary:** one **Spot ambush** button on its row opens the one roll the book names (Investigation
  (Notice) / Perception against Stealth (Ambush) / Agility, Core p.155) with +1k1 ticked; Wary is no
  longer offered on ordinary Investigation rolls. The Notice Emphasis keeps its usual re-roll of 1s.
- **Precise Memory:** a **Recall** button opens an Intelligence Trait Roll with +1k1 applied as a
  modifier, not a tick; no longer offered on ordinary Intelligence rolls.
- **Imperial Scribe** (Status 2+, Calligraphy 4+) and **Sacrosanct** (Honor 6.0+): greyed out in the
  Advantage picker with the requirement (Feature 4.5.5's standard), and explained on the row; an
  unqualified Imperial Scribe offers no +1k0 or Free Raise. This brings Imperial Scribe's requirement
  forward from the Glory, Status and Honour review, on the owner's word. Nothing is repriced.

One script, one stylesheet and one seam block; a hard dependency on 4.5.27, and soft ones on 4.5.15
and 4.5.5. See `Versions/PART I — Phase 4.5.28 Situational Entry Buttons and Gates/README.md`.

**Parked for Phase 15 or the end of the project (the owner, 7 October): the resist entries.**
Balance, Clear Thinker, Heartless and Irreproachable are offered on every Skill, Trait, Ring and
dice-tray roll, because the sheet cannot tell which roll is a resistance. The code works; the review is
about clutter. Options to weigh then: fold them into one closed "Resisting?" line that shows what is
being resisted and the possible bonuses; limit each to the rolls the books use for resisting (needs
every entry checked against the books); or a badge on the row (such as "Resist Temptation") that opens
a dedicated roll, as Wary's button now does. Added to build-order row 7's end-of-project reviews.

The revised build order is otherwise unchanged: row 2 (the wound entries) is next, on approval.
