# Claude — next-session kickoff after Phase 4.7 (7 October 2026)

Prepared after the owner confirmed Phase 4.7's final functional retests and asked for a fresh build-order assessment aimed at **maximum useful progress for the least effort and allowance**. Use this file to start the next Claude session.

This supersedes the planning snapshot in `CLAUDE-SESSION-KICKOFF-NEXT-SESSION-2026-10-07.md`, which was written on 2 October before the dice release and Advanced Schools were built. Earlier kickoffs are historical examples, not current implementation instructions. This file does not override the owner's decisions.

The project is the **L5R 4th Edition single-player character sheet**, a player companion. Repository: https://github.com/JCrowley123/l5r-character-sheet-creator. Live site: https://l5r-character-sheet-creator.pages.dev/.

**Begin with your own assessment, not implementation.** The owner requested this handoff; they have not yet approved the proposed next release or the revised ordering below. If the message accompanying this file explicitly approves a particular scope, respect that authorization and do not ask for it again.

## What I want from you first

1. Confirm what is complete and what remains, using the current checkout and records. Identify material discrepancies between source, ledger and roadmap rather than repeating stale claims.
2. Assess the next candidates independently: user benefit, relative effort, confidence, dependencies, unresolved decisions, verification overhead and device requirements. Explain why your recommended order makes efficient progress.
3. Give the smallest useful next release, its exact boundaries and what it leaves out.
4. Challenge the proposal below. For every recommended change, explain the old proposal, your alternative, evidence, likely cost/QA trade-off and any decision needed from the owner. If you agree, say what you checked that convinced you.
5. Describe acceptance tests, surgical removal proof, regression checks, a concise owner checklist and usage checkpoints.
6. Bundle only the decisions needed for the next release into a short set of questions, each with a recommended answer. Do not make unrelated, later audit decisions block a self-contained release.

Do the read-only investigation needed to make this concrete before asking for build approval. Once the owner approves, proceed with routine implementation and verification without repeatedly asking permission. Do not start a later phase automatically when the first one finishes.

## Read these first

Read selectively, but completely within the relevant sections. Avoid repeatedly loading entire historical documents.

- `Versions/CLAUDE.md`: standing project rules, surgical removability, folder/marker conventions, working style, and the newest 7 October completion notes. Dated older proposals are history.
- `Versions/BUILD-LEDGER.md`: current update, Phase 4.7 owner retests, cost records, Open reminders, deferred feedback, At a glance and remaining work. Check `Versions/BUILD-LEDGER.html` agrees.
- `Versions/L5R Character Sheet Phased Roadmap reorder.md`: Process Requirements, Status Overview, Phase 4.5/audit amendments, Phases 6, 7, 9, 11.1, 13, 14 and 15, and Deferred and declined.
- `Versions/PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md`: Automation, the nine situational entries, configuration questions and mechanisms not yet available. Its counts describe **2 October**, before 4.5.25/4.5.26; do not call those counts the current backlog without reconciling completed work.
- `Versions/SOURCEBOOK INDEX — Page Map/INDEX.md` and its README: locate the actual rule pages and printed/PDF offsets.

Nearest implementation precedents:

- `Versions/PART I — Phase 4.5.15 Roll Declaration Registry/`
- `Versions/PART I — Phase 4.5.16 Heart of Vengeance/`
- `Versions/PART I — Phase 4.5.26 Dice Rolling Entries/`

Latest verification and runner precedent:

- `Versions/BUGFIX — Minor Clan Defender Paragon Gate/README.md`
- Its `ROLLBACK.md`, `qa/current-suite-runner.js`, `qa/final-verification.json`, `qa/regression-verification.json` and `qa/live-verification.json`.
- `Versions/QA — Removal Chain Registry/` and the current dependency tooling. Inspect the live registry rather than copying obsolete fixture lists from old kickoffs.

For Phase 4.7 details, read the READMEs in `PART I — Phase 4.7 Advanced Schools`, `PART I — Phase 4.7.1 Supplemental Advanced Schools` and `PART I — Phase 4.7.2 Missing Basic Schools` under `Versions/`.

## Checkout and source of truth

- **Canonical checkout: `C:\Users\jcrow\l5r-character-sheet-creator`.** Work and commit there.
- `C:\Users\jcrow\OneDrive\Documents\L5R character sheet creator` is an older clone containing owner changes. Do not use it as the app's working checkout or commit app work there.
- At preparation, canonical `main` and remote main were at **`a6cec88`**, “Close Phase 4.7 and record available release usage costs.” The commit adding this kickoff will follow it. Verify current history/status before syncing; preserve local work and use a safe fast-forward update if appropriate.
- Four owner-deleted old kickoff files and seven untracked Word documents remain in `Versions/`. Do not restore, delete or stage them. There is also an untracked `tmp/` folder; do not clean it wholesale or stage it.
- Keep `core.autocrlf=false` and `core.longpaths=true`. Use a separate branch for each implementation release. Never force-push or rewrite shared history. Stage exact scoped paths.
- Do not remove old worktrees without the owner's permission.

All production source is under:

`Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/`

Edit its source fragments and rebuild; never hand-edit generated HTML. The local character sheet to test is that folder's **`l5r-character-sheet.html`**. The live URL above is the simplest owner test target once deployment is verified.

## Verified state at handoff

### Phase 4.7 is complete for the agreed scope

All three releases are merged and live:

1. Nine Core Advanced Schools, with 27 Technique references.
2. Fourteen supplemental Advanced records: thirteen playable human Schools and one recorded-only Nezumi entry.
3. Hiruma Scout [Bushi] and the Heroes of Rokugan Yotsu Bushi School [Bushi]. The latter is explicitly labelled with its alternate setting; it does not replace canonical Ronin Yotsu.

The full Advanced catalogue has **23 records, 22 playable human entries and 69 manual Technique references**. The two Basic Schools add ten references and their starting packages.

The separately removable **Minor Clan Defender Paragon Gate** fix is merged at `9dc8d01` (PR #7). A newly enrolling character must have a valid, confirmed Paragon tenet; any of the seven qualifies. A bare or cancelled Paragon row does not. Existing enrolments, ranks and Techniques are preserved.

Owner acceptance, 7 October:

- Test 1, configured Paragon: **Pass**.
- Test 9a, Kolat Assassin: **Pass**.
- Test 9b, Legion of Two Thousand: **Pass**.
- The owner had already reported the other tests passed. These three functional follow-ups are closed.

The owner accepts proceeding without a full iPhone pass; their main reason for phone testing is layout and fit. Latest retest device/browser was not specified. **Do not infer an iPhone pass from Windows results.** Keep the iPhone visual/layout caveat as non-blocking.

Delivered boundaries remain explicit: Nezumi gameplay is unsupported; Advanced-rank Path replacement is unsupported; Technique effects remain manual. Completing Phase 4.7 does not assert those functions exist.

### QA and build evidence

These are recorded results from 6–7 October, not fresh runs by the next session:

- Corrected full suite: **4,262/4,262**.
- Actual scratch removal: exact prior build restored; **4,230/4,230** retained checks passed.
- Paragon focused checks: **32/32**; dependency checks **40/40**, retained dependencies **189/189**; five pinned mutation variants passed.
- Paragon remover fixtures: **20 passed, one Windows symlink test skipped**.
- Live focused checks: **226/226** (156 supplemental + 38 Basic + 32 Paragon), with deployed HTML, assets and service worker verified.
- Source HTML: **3,561,844 bytes**, SHA-256 `b6b8bc00756cbeca437228f5cef8f182598ab7dd493f91bc6f0c1c2f8b91fe83`.
- Published HTML includes the PWA head: **3,567,493 bytes**, SHA-256 `8eefec3a5fab49a0f2cae8d45f48e2eccb61991dfd81dea165b17edb2d3a0723`.
- Service-worker build: `77e83cad44e77520`.

Use the Paragon fix's current suite runner as the latest chain, unless subsequent commits add a newer one. A push, a successful preview deployment and a completed production deployment are different evidence; verify production before calling it live.

### Other completed and remaining work

- Phase 4.5.25 Clan and School Prices is complete.
- Phase 4.5.26 Dice Rolling Entries and the independent Rank 0 explosion fix are complete, merged and verified live. Windows owner testing passed; iPhone layout remains unconfirmed/non-blocking. Do not reopen the parked Rank 0 bug as unfinished.
- Phase 4.6 is complete for the owner's books; Phase 4.8 is complete for its agreed supplied-book scope. Phases 11 and 12 are complete.
- Phase 6's School Technique text release is complete. The **SynergyEngine is not built**.
- Phase 7's save-format/migration release is complete. Its **audit log is deferred**.
- Phase 9's Clan appearance is built. School flavour text remains.
- The remaining Advantages/Disadvantages audit, D06 Weakness, Hotei, PDF export (11.1), Library (13), Search (14), end-of-project reviews and Phase 15 remain.
- Phase 0.7 still needs Android hardware validation; the owner has no Android device and those checks remain optional.
- The current ledgers count **17 phases under Fully done and four under Ahead**, with one built/unvalidated and three partly done. These counts group point releases and are not a percentage of total project effort completed.

## Proposal to challenge: revised build order

The previous proposal was: finish 4.7, then the audit by mechanism with the most entries first, then choose among synergy, PDF, Library/Search and the remaining work.

Codex's latest recommendation is below. **The owner requested the assessment and this kickoff but has not approved this ordering change.** It is not yet an adopted roadmap amendment.

| Order | Proposed work | Reason / confidence |
|---|---|---|
| 1 | Nine existing situational roll-preview entries | Existing declaration machinery; immediate play benefit. Small–medium relative effort, high confidence in reuse, rules still to verify. |
| 2 | Straightforward automatic roll bonuses/penalties and TN adjustments | Reuse existing modifiers; group by shared behavior, separate cases needing new decisions. Medium effort/confidence. |
| 3 | First useful release of Phase 14 Search over existing catalogue content | Makes delivered Schools, Paths and other material easier to find. Medium effort/confidence; needs a scoped design. |
| 4 | Remaining audit entries grouped by mechanism | Prioritize useful behavior per shared implementation and verification effort, not raw entry count. |
| 5 | Phase 6 synergy, 11.1 PDF export, and 13 Library/full Search integration | Each introduces larger or less certain work. Their relative order needs another assessment, not an automatic sequence. |
| 6 | Remaining flavour text, audit log and deferred reviews; Phase 15 last | Preserve owner deferrals and finish with the agreed UI review. D06/Hotei need their own rulings before scheduling implementation. |

**Why bring Search forward?** Phase 14's own dependency and test sections permit searching without Phase 13; opening a sourcebook page is the dependent part. A first release could search existing names, filter by category and open existing detail views, including Advanced Schools and Paths. It should not require new monster/content catalogues, a PDF reader or every later facet. This would be a partial Phase 14 release, not full completion. It helps discoverability without silently implementing the deferred Advanced School relocation.

**Why not move a different phase first?** The checkbox infrastructure already exists. Synergy requires a new interaction model; Library requires PDF rendering/storage and device checks; flavour text adds less mechanical utility. PDF export may be useful, but its scope is not satisfied merely by a successful browser Print test: 11.1 explicitly includes installed-app/Android save and share behavior.

Challenge these conclusions against the current source. Do not promise precise allowance costs or a completion date from the historical estimates.

## Proposed next release: nine situational roll effects

Provisional next identifier: **4.5.27**, only after checking that it is still unused.

Candidate entries already in the sheet:

1. Balance
2. Clear Thinker
3. Dangerous Beauty
4. Heartless
5. Irreproachable
6. Precise Memory
7. Wary
8. Imperial Spouse
9. Imperial Scribe

**Smallest useful scope:** offer their relevant situational roll effects through the existing per-roll declaration registry. A player confirms a circumstance the sheet cannot determine; the sheet applies and explains the appropriate modifier. Keep entries together where they truly share this mechanism.

Read the actual sourcebook passages first: the audit points to Core pp.146–155 and Imperial Histories p.67. Confirm each entry's exact page and offset from the index. This handoff and the current catalogue descriptions are not substitutes for the rules.

**Important scope boundaries:**

- Imperial Spouse's Status adjustment stays with the deferred Status review.
- Imperial Scribe has benefits beyond its situational Social bonus, including a Calligraphy Free Raise. Explicitly account for those as separate/unimplemented effects unless the owner approves their inclusion; never mark the whole Advantage automated just because its checkbox exists.
- Balance requires care about the condition of adding Honor to resist a roll. Preserve the end-of-project Honor review; inspect the existing roll path before proposing automation that would depend on it.
- Dangerous Beauty depends on the target, not just the character's Identity gender. Do not fold the deferred gender/UI proposal into this release.
- Determine whether bonuses granted temporarily by Techniques are supported by existing ownership checks. Technique automation is not automatically included.
- Leave missing catalogue entries, other mechanisms, new resource tracking and deferred feedback outside this release unless there is a concrete reason and explicit approval to include them.

### Source and design checks before proposing implementation

Within Phase 0's `src/sheet/`, inspect:

- `209.927-feat-roll-declarations.js`: registration, offer eligibility, transient state, cancellation and modifier routing.
- `209.928-feat-adv-heart-vengeance.js`: a working provider; its restrictions are specific to Heart of Vengeance, not automatically correct for the nine new entries.
- `209.9298-feat-adv-fortune-blessing.js`: existing situational blessings.
- `208-feat-roll-preview.js`, `100-dice-engine.js`, and the relevant Advantage modifier/configuration fragments.
- `020-lib-skills-advantages.js`, Skill metadata and `210-test-seam-and-init.js`.

The registry already binds declarations to the exact roll context, clears them between rolls, supports modifiers on a reroll of that roll and excludes damage centrally. Confirm current behavior before reuse. Its existing modifier path carries rolled/kept/flat deltas; a Free Raise must not be represented by inventing an equivalent dice bonus.

Check applicable roll kinds, Skill/Trait/emphasis filters, manual dice-tray behavior, contested/resistance conditions, interaction with existing bonuses, duplicate rows, removal/renaming and loaded saves. Establish stacking from the books; never assume all checked bonuses stack.

Recommended defaults to present together: offered only where the sheet can establish the relevant roll type; unticked for each new roll; explained in preview/results; never persisted as an armed character setting. Ask about genuine ambiguous boundaries after source inspection, not routine coding choices.

### Acceptance and verification

- Prove each offered effect appears only for an eligible owned entry and roll, and gives the exact printed modifier when declared.
- Test absent/unticked/ineligible entries, wrong Skill/Trait, overlapping bonuses, duplicate rows, cancelled previews and subsequent rolls.
- Confirm rerolls retain only the original roll's valid declarations; saving/loading or switching characters never arms a later roll.
- Preserve Rank 0 rules, Gaijin Name's explosion cap, Void behavior and existing declaration providers.
- Show the new harness detects missing/broken behavior; use fixed dice where chance could hide an error and pinned mutation variants for meaningful branches.
- Run the required full suite, dependency/removal fixtures and ownership checks. Actual removal in a guarded scratch copy must restore the recorded prior build exactly, with retained checks passing.
- Provide worked normal and fringe manual examples with setup, actions, expected results and Pass/Fail/Not run fields. Make them usable on Windows or iPhone; record device separately. Include a short narrow-screen layout check without treating a desktop simulation as real iPhone evidence.

## Usage and honest cost planning

Claude and Codex allowances are different. Read Claude's current usage using whatever session capability is available; ask the owner only if it cannot be read. Do not assume a tool name, a reset weekday or that an old reading is still current.

Recorded Codex evidence:

| Work / checkpoint | Reading | What it establishes |
|---|---|---|
| Rank 0 fix + 4.5.26, 2–3 Oct | Weekly 0% → 22%; QA intermediate endpoint 14% | Account-wide observed movement, not isolated project usage. Five-hour window reset. |
| Core Advanced Schools, 3–4 Oct | Weekly 24% → 64%; five-hour 56% → 6% | Start and later resumption snapshots, not clean release-completion boundaries. |
| Supplemental + Basic Schools, 5 Oct | Weekly 36% → 51%; five-hour 29% → 23% | Combined account-wide interval; no per-release split, five-hour window changed. |
| Follow-up, 6 Oct | Weekly 69%, five-hour 69% | Snapshot before final correction/closeout; not their cost. |
| Documentation, 7 Oct | Weekly 12%, five-hour 78% | Different weekly reset endpoint; cannot be subtracted from 6 Oct. |
| Latest build-order assessment, 7 Oct | Weekly 15%, five-hour 96% | Historical reading before this kickoff was finished; not Claude's balance or a new phase cost. |

Exact phase totals, tokens and monetary costs are unavailable. **Do not add these intervals, infer a Claude conversion factor, or repeat the old 160–300% / 166–320% project projections as current forecasts.** Nor does the 40-point Core observation prove every similar phase will cost 40 points.

Historical Claude anchors remain in the ledger: Phase 4.6's complete delivery was 36% → 66%, or 30 points, not just the 21-point build subset; Phase 4.5.25 was approximately five points including follow-up. They are historical comparisons under a different provider/workload, not promises.

At the next release, record provider/model where available, timestamp, weekly and short-window readings and reset times at start, after QA, and after merge/device follow-up. If a window changes, keep separate records. Account-wide readings remain account-wide even within one window. Prefer relative effort and confidence until clean evidence supports more.

Save effort by batching genuinely related work, reading relevant sections, keeping bulky logs on disk and summarizing outcomes. Preserve full required verification. Repeat a successful full run only when code changes, failures or unresolved concerns justify it; do not rerun it merely because a documentation handoff occurred. If allowance becomes tight, preserve work and precise resume evidence rather than starting unrelated scope to use the remainder.

## Owner decisions and deferred feedback

Preserve these; this handoff does not authorize their implementation:

- **FT-01:** hide already-added Skills from Add from Skill List, with specialisations/removal behavior reviewed.
- **FT-02 / FT-03:** future options in Management and a possible progression planner/checklist.
- **FT-04:** qualifying Identity gender OR explicit confirmation for gender-restricted options; ambiguous values need review.
- **FT-05:** optional, skippable gender and age in the wizard, editable afterwards.
- **FT-06:** Advanced Schools were expected under Identity > Add School. Current placement follows the Techniques/progression design; review placement/signposting later, not now.
- **FT-07:** Scorpion Instigator's four separate Blackmail purchases versus confirmation of four people. **Explicitly deferred to Phase 15 or beyond**; do not reopen 4.7 completion over it.
- **FT-08:** intermittent missing Spell Slots occurred in **ChatGPT's Windows preview/file explorer**, later became visible, and was not independently reproduced. The older Safari problem is resolved. A common cause is only a hypothesis; do not label this a current Safari failure.
- **FT-09:** Imperial Scion/Status boundaries join the end-of-project Glory, Honor and Status review; the owner says test 2 works.
- **FT-10:** review whether Kobune Captain should have a Mantis restriction or GM exception. Current behavior stays; narrative rarity is not a confirmed rules restriction. The owner says test 3 works.

Also retain existing end-of-project items: used once-per-session Ancestor gifts, lost-favour Ancestor editing, first Manage-tap slowness, old information-button styling, Clan & School clutter, Manage as a separate screen, and Print on the Characters list. Consult their exact ledger dispositions before scheduling changes.

Standing rulings include the Multiple Schools Advantage gate for Advanced Schools; [Artisan] as its own School type; the Clan/Brotherhood monk distinction; and the 4.5.25 purchase-time pricing rules. Do not replace them with earlier kickoffs' proposed defaults.

Later audit questions remain: D06/Hotei boundaries; GM-agreed choices as notes versus pickers; Naga/Nezumi and Station scope; Student of the Past's missing printed cost; Trials of the Imperial City's repeated text; Wanderer's missing type. Settle only those touched by the approved next release, without inventing absent rules.

## Practical workflow and handoff obligations

- Desktop books are at `C:\Users\jcrow\OneDrive\Documents\L5R 4th edition books`; verify availability. Extract only necessary pages into scratch storage, never commit book text/PDFs. In a cloud session, request only the missing source pages if needed.
- Write rules in our own words with book/page references. Reconcile catalogue descriptions with the source.
- Node: `C:\Program Files\nodejs\node.exe`. Historical test environment: `NODE_PATH=C:\Users\jcrow\l5r-qa-tools\node_modules`, `PLAYWRIGHT_BROWSERS_PATH=C:\Users\jcrow\l5r-qa-tools\ms-playwright`, `PYTHONUTF8=1`, `LANG=C.UTF-8`. Verify paths; use the existing runtimes/browsers.
- Respect the current folder/removal contract. Inspect manifest order and choose a free fragment slot; old kickoff slot numbers are occupied. Keep seam exports guarded, declare dependencies and avoid changing the shared roll pipeline unnecessarily.
- Run destructive removal tools only against verified scratch copies. Preserve owner saves and inspect `Characters/` status before committing.
- Full regression can be long-running. Save logs and process state, avoid concurrent browser loads that distort geometry checks, and distinguish a running process from a failed run. A zero-check result is not a pass.
- Update the release README, rollback evidence, manual tests, both local ledger versions, roadmap and relevant CLAUDE.md notes once per verified milestone. Separate automated, live and owner/device evidence.
- Commit/push scoped release work. **Merge only on the owner's instruction for that release.** Earlier merge authorizations do not authorize all future phases. After a requested merge, verify production and send concrete normal/fringe tests for the live site.
- The external Claude ledger, https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk, **was not refreshed in this Codex session**. If updating it through available Claude tools, first read the saved page fully and preserve its persisted checkboxes. Never imply a repository update refreshed that external artifact. If the connector is unavailable, retain the repo documents and report that limitation.
- If publishing a Claude checklist/doc, use the available connector's current instructions. Keep a committed manual-test file as the durable fallback; do not invent inaccessible tools or block implementation merely because a publishing connector is absent.

**First deliverable: your independent assessment, the concrete next release and any necessary decisions. This kickoff is not approval to build the next phase.**
