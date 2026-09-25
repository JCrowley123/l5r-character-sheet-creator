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
| 17 | 4.7 | I | Source-material gated |
| 18 | 4.8 | I | Source-material gated |
| 19 | 8 | J | ~~Needs Phases 5, 6, 3~~ — **BUILT EARLY (after Phase 5)**. Phase 6 proved source-blocked and non-load-bearing; Phase 8 now provides the registry Phase 6 will register into. See Phase 8's own Dependencies note |
| 20 | 11 | K | Needs Phases 7, 5 |
| 21 | 12 | K | Needs Phase 11, and Phases 1.6 and 4.5, all built. Phase 4.8 is **not** built: Phase 12's own Dependencies need it only "once that phase exists", so it is a soft dependency (this row said "all satisfied" until 25 September 2026) |
| 22 | 13 | K | Needs Phase 11's navigation shell; source-material gated |
| 23 | 14 | K | Needs Phases 11 and 13 |
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
| 6 | G | Kata/Technique Synergy Detection | Not started | |
| 1 | H | UI/UX Foundations | **Built, shipped broken, fixed** | 9/9 automated checks pass against the fixed build and 4/9 against the one that shipped — plus a full before/after behavioural diff against the rest of the sheet; see `Versions/Part H — Sheet UI-UX/PART H — Phase 1 UI-UX Foundations/README.md`. Audit found spell-icon and Affinity/Deficiency-badge colour-coding already existed — see that README's "The audit came first". The scroll-to-top button shipped broken (its harness could not fail — see "The bug my own harness hid") and was fixed after real-device testing. A Ring affinity/deficiency accent was built and shipped, then reverted at the project owner's request — see "Reverted: the Ring accent". Real-device testing also surfaced a pre-existing, unrelated carousel bug (Spell Slots tab doesn't appear after applying a caster School) — see "A pre-existing bug this phase's field-testing surfaced" |
| 1.6 | H | Combat Tab Streamlining | **Built and verified** | 23/23 automated checks pass, plus a full before/after behavioural diff against the rest of the sheet; see `Versions/Part H — Sheet UI-UX/PART H — Phase 1.6 Combat Tab Streamlining/README.md`. Mode placement (Play-only) is authoritatively defined in Phase 12 |
| 2 | H | Quick-Access Sidebar | **Built and verified** | 19/19 automated checks pass against the current build, dropping to 12/19 or 18/19 against two different intermediate builds each missing one class of live-update hook, plus a full before/after behavioural diff against the rest of the sheet; see `Versions/Part H — Sheet UI-UX/PART H — Phase 2 Quick-Access Sidebar/README.md`. A toggle-activated overlay panel, not a permanently pinned rail — measured screen real estate at 390px and 1440px ruled that out (see the README's "Why 'sidebar' is a toggle"). Own harness caught a live-update gap (Void pips, wound stepper/slider, the Cast-spell button, and bonus-slot pips each bypass `recalcAll()`) in two rounds — three before shipping, and the shared Bonus-slot pool's own line (added after a real-device tester noticed it was missing) after — see "The gap this phase's own harness caught" and "The Bonus line" |
| 9 | H | Polish & Immersion | **Half built** | Clan-themed UI skins built and verified — 17/17 automated checks, dropping to 16/17, 15/17 and 12/17 against three scratch builds each missing one thing (a safety-colour protection, the Void-pip recolour, and the phase's own kill-switch; this row said 14/14 until 25 September 2026); see `Versions/Part H — Sheet UI-UX/PART H — Phase 9 Clan-Themed Look/README.md`. Per-Clan override of the sheet's own --shu* CSS tokens (confirmed by grep that every button/tab/heading sheet-wide already reads from them), plus the real ink-brush Clan mon art as a watermark and a tab-bar colophon — three mockup rounds with the project owner settled the exact treatment before any code was written. School-specific flavour text (this phase's other bullet) is not built, and is **blocked on source material a cloud session cannot reach** — the sourcebook PDFs are gitignored and desktop-only. Parked for a desktop session per Process Requirement #3 rather than filled in from memory; scope measured (61 major-clan + 22 minor-clan schools, none carrying any description field today) and every open decision written up in that phase's `DESKTOP-HANDOFF — School Flavour Text.md` |
| 15 | H | UI Consistency Pass | **Fully scoped (audit-first)** | First deliverable is auditing the remaining tabs the way Combat was audited; built last per the Recommended Build Order |
| 4.5 | I | Modal-Configured Advantages/Disadvantages | **Built and verified — completion pass + 4.5.2 Disadvantages point release** | Legacy **51/51**, Advantages **48/48**, and Disadvantages **163/163**. Adds the approved variable Disadvantages with explicit refunds, guarded modifiers, player toggles, isolated Willpower gates, schema-3 migration, integrated regression coverage, and surgical removal. The retained phase harnesses keep their totals and Phase 1.5 remains **35/35** with the release present or removed. Removing the full point release restores the canonical expanded pre-release build (`4355dec4`, 2,428,891 bytes); the original complete 4.5 remover still restores (`9dbaf6c6`, 2,322,320 bytes). Antisocial applies its penalty to the authoritative Acting, Courtier, Etiquette, Perform, Sincerity, Intimidation, and Temptation list only. See `Versions/PART I — Phase 4.5.2 Disadvantages/README.md`. **Point releases 4.5.3 to 4.5.24 followed** (configuration repairs, UX, eligibility gates, the remaining Disadvantages, and all of A01–A16, completed 23 September 2026 and confirmed on the iPhone 24 September); see the ledger. **Still open:** D06 Weakness (approved design, not built; needs boundary rulings) and Hotei, D04b's second half (deferred, recorded as source-blocked). Scheduled after Phase 12's first build stage (owner, 25 September) |
| 4.6 | I | Alternate Paths — All Classes | **Fully scoped** | Source-dependent (see phase) |
| 4.7 | I | Advanced Schools | **Fully scoped** | Source-dependent (see phase) |
| 4.8 | I | Ancestors | **Fully scoped** | Source-dependent — you have this material |
| 5 | J | Character Creation Linting | **Built and verified** | 25/25 automated checks, dropping to 11/25 with the kill-switch off; removal byte-identical to the pre-phase build. A `CharacterValidator` of nine rule functions and a `ValidationReport` on the Identity tab; Phase 11.2's wizard gates its steps on it. (This row read "Not started" until 25 September 2026, long after the ledger recorded the build.) See `Versions/Part J — Data Integrity & Validation/PART J — Phase 5 Character Creation Linting/README.md` |
| 7 | J | Data Integrity & Persistence | Partially built already | Schema versioning + import wiring exist; Phase 11's save/import UI builds on this. The Phases 0.6/0.7 export question was approved on 24 September 2026 and built into Phase 11 (see phase note) |
| 8 | J | "Why Can't I Cast This?" | **Built and verified** | 32/32 automated checks, dropping to 15/32 with the phase's kill-switch off; the surgical removal rebuilds **byte-identical** to the pre-phase build and all eight other phase harnesses read identically with it present and removed. See `Versions/Part J — Data Integrity & Validation/PART J — Phase 8 Why Cant I Cast This/README.md`. The audit found the roadmap's premise understated: the unifying engine was indeed the gap, but ALL of the gating runs at *acquisition* time and none at cast time, so nothing had ever asked "can you cast this now". ⚠️ **Built before its declared Phase 6 dependency, which inverts that dependency's direction — see the phase note below.** One scope addition (`no-slots`, the only refusal the sheet enforces at cast time); "over-capped rings"-style invention avoided by delegating every Universal-Element verdict to the picker's own function |
| 11 | K | Characters List, Creation Wizard & Save Model | **✅ Complete, 25 September 2026:** list, save model and wizard (11.2 to 11.2.4) confirmed on the owner's iPhone and laptop, including Import of an unrenamed `.l5r` save after BUGFIX — Import File Picker Filter; Export to PDF split to 11.1 | Delivered in stages, approved 24 September 2026: the Characters list, save model and share-aware JSON first; the Creation Wizard as **Phase 11.2** (full screens, the owner's choice; Name to Review built) and **11.2.1** (Skills and Advantages/Disadvantages steps built) and **11.2.2** (every School free choice, Spells for a Shugenja, Kiho for a Brotherhood monk, and a reminder before leaving one open) and **11.2.3** (a Shugenja School's starting spells from its rulebook "Spells:" line; Kitsu first) and **11.2.4** (the other 20 Shugenja Schools' lines, as the owner quoted them); Export to PDF split out as **Phase 11.1**. See `Versions/PART K — Phase 11 Characters List and Save Model/README.md` |
| 12 | K | Play Mode / Management Mode Split | **Next — audit first** (agreed 25 September 2026) | Rulings of 25 September are recorded in the phase section below. The audit comes before any code |
| 13 | K | Library (Sourcebook Viewer) | **Fully scoped** | Source-dependent — your own legally-owned PDFs |
| 14 | K | Comprehensive Search | **Fully scoped** | Depends on Phase 13 for the source deep-link |
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
*(New — fully scoped, source-dependent)*

**Features included**
- Hidden dropdown in the Techniques tab for Advanced Schools, appearing once a given school's own prerequisites are met
- Even when visible and its prerequisites are met, an Advanced School can't actually be added unless the character holds the Multiple Schools advantage — same principle as the current `+ Add School` gate

**Engineering Scope**
- Add an `ADVANCED_SCHOOL_LIBRARY`, structurally parallel to `ALTERNATE_PATH_LIBRARY` (same `requires:{rings, traits, skills, emphases, advantages, narrative}` shape) so the existing requirement-checking logic can be reused rather than rewritten
- Branch off `addSchoolToCharacter()` — add a sibling `addAdvancedSchoolToCharacter()` that runs through the same `hasMultipleSchoolsAdvantage()` check before committing
- Dropdown hidden until at least one Advanced School's prerequisites are met; once met but Multiple Schools is absent, show it disabled with the same tooltip pattern as `btnAddSchoolToggle`
- **Open question to confirm before build:** does an Advanced School behave like an Alternate Path (swaps one rank of an existing school) or like Multiple Schools (adds a fully separate progression track)? Default assumption is the latter — branching off the Multiple-Schools path — pending confirmation against the actual school text

**Dependencies**
- Existing Multiple Schools gate (`hasMultipleSchoolsAdvantage`, `addSchoolToCharacter`, `btnAddSchoolToggle`)
- **Source material required:** specific Advanced Schools and their prerequisites. Do not begin data entry until this is supplied.

**Validation Test Suite**
- Dropdown stays hidden until a character meets at least one Advanced School's prerequisites
- Meeting School A's prerequisites doesn't spuriously reveal School B
- Dropdown shows the option but keeps it disabled when prerequisites are met but Multiple Schools is absent
- Adding an Advanced School without Multiple Schools is impossible via UI and underlying function alike
- Adding a valid Advanced School applies its techniques/skills without disturbing the base school's own progression

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
