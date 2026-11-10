# Claude kickoff — Release 15a, G3: continue from mockup review

Prepared by Codex on **10 November 2026** at the owner's request. **Read this file in full.** It is a standalone continuation handoff; the previous chat is not needed. Repository paths below are relative to the canonical checkout unless stated otherwise.

**G2 is accepted, qualified and live. G3 reproduction and mockups are complete, committed and pushed. G3 has not been mockup-approved, implemented, device-accepted, qualified or released.** The owner's latest request was to prepare this handoff for Claude. It was not approval of any design or permission to deploy G3.

The next useful action is to read the completed evidence and present the existing mockups for the owner's three decisions. **Do not restart reproduction or rebuild the same boards by default. Build only the designs the owner approves.** If the owner supplies decisions with this handoff, use those decisions and do not ask again.

## 1. Repository, branch and exact continuation point

- GitHub: https://github.com/JCrowley123/l5r-character-sheet-creator (private).
- Canonical checkout: `C:/Users/jcrow/l5r-character-sheet-creator`. **Never use the OneDrive clone.**
- Current working branch: **`codex/release-15a-g3-mockups`**.
- Completed mockup/evidence commit: **`2a85351663b4d4bc4d3069fe7f10f99998922929`**, pushed to that branch.
- `main` and remote `main`: **`20fd1b3e509dddd16fab0a44ef8f2cc6d2c00e79`** at the 10 November handoff check. This is the original G3 kickoff documentation commit on the live G2 source.
- Local tracked files were clean before adding this handoff. Existing untracked QA caches are unrelated; preserve them. This file and its README pointer add a later documentation commit to the mockup branch; record the actual HEAD when resuming.
- Remote branch tips were checked using `git ls-remote`, not assumed from stale tracking refs. Recheck in the next session.
- Production: https://l5r-character-sheet-creator.pages.dev/

Inspect `git status` first, then fetch. Resume the **mockup branch** and fast-forward it from its matching remote branch when safe. Do not blindly switch to `main` and lose sight of the completed G3 records, which are not on `main`. If someone has advanced either branch, inspect the difference and verify the application hash before treating it as the same baseline. Preserve unrelated changes; no reset, clean or force push.

The canonical generated application is:

`Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html`

Its SHA-256 is **`7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`**, **17,609,230 bytes**. This was rechecked when preparing the handoff. All G3 work so far is scratch prototype/evidence/documentation; application fragments, manifest and generated source remain unchanged.

### Phone continuation and allowance

The owner confirmed **Remote Control enabled and the iPhone connected on 8 November**, in the Codex chat. Codex left that setup untouched. Available tools did not expose the current switch, so there is **no fresh verification**. Preserve phone continuation. Check the actual capability/status in the new Claude environment if available; do not assume Codex's connection proves a Claude connection, claim an unverified status, or require repeated confirmation without a reason.

Take a fresh **Claude** usage reading before substantive work. Codex account-wide readings were 9% five-hour / 84% weekly near the 10 November mockup start, 75% / 95% at 13:19 UTC, and 91% / 97% during handoff preparation around 16:56 UTC. These are historical shared-account readings, **not task cost and not Claude allowance**. No fresh Claude meter was read. The earlier G2 Claude build was reported as about nine weekly points (84%→93%); do not turn that into a G3 quote.

## 2. G2's final live status — completed work

| Item | Recorded result |
|---|---|
| G2 units | A05 Missing Limb picker; A06 grant actions/state; A07 Moon row; A11 explanatory text gaps/alignment; A04.1 inline picker rules, revision 1 |
| Qualified application/records tip | `93b27c61fca838079909a7b52398cbf163d418c4` |
| Go-live | Explicitly authorized 9 November; `main` fast-forwarded from `2790a2ba` to `93b27c61`, no merge commit or force push |
| Production records | `44cb616386e811423c35a3e412a18fab6660c0fc`, pushed to `main` |
| Owner devices | 36/36 on 7 November; revised A04.1 check 15 passed on iPhone Safari and Laptop Edge on 8 November |
| Full candidate | **7,148/7,148**, one execution, 191 fresh harness leaves |
| Full retained | **6,929/6,929**, one execution, 184 fresh leaves; this was G1 with G2 removed, not G3's retained baseline |
| Removal restoration | Exact G1 SHA `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6`, 17,586,964 bytes |
| Production checks | **2,523/2,523**, 57 harnesses on downloaded production files, finished 9 November at 12:46 UTC |
| Browser/offline smoke | **22/22**, fresh Chromium at 390 px, offline reload, no uncaught page errors |
| Deployed PWA page | SHA `bd1b5fd615f07afef7f87da1e0448dc1173074fe483ba57cee6afffffb0ea107`, 17,616,007 bytes |
| Service worker | Build `f9a4bcad8d36d92a`; SHA `d66ab82abc47601f7e165a0fb305aa651e1f468c8e311e2233816a6128331527` |

All seven deployed files matched the committed build byte for byte. The PWA page includes its install header, explaining the difference from the source application hash. Production has not been requalified merely to prepare G3 or this handoff.

Preserve truthful qualification history: G2's initial removal chain stopped at **46/47** because A11's fixture supplied seven rather than eight eligible desktop text rows after A05 removal. Geometry was correct. Only the fixture was strengthened (description on its existing Moon card), with assertions, 22 IDs/count, coverage minimum and 1 px tolerance unchanged. Six scoped proofs passed **132/132**. A separate guarded continuation ran only previously unstarted stages: **25 exact negative cases and 5 dependencies passed**. The subsequent single full pass passed. Do not describe the first chain as uninterrupted, erase the failure, or rerun the completed suites.

G2 evidence lives under:

`Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G2 — Small Layout Fixes/`

Read `HANDOVER.md` for complete production/qualification references. Important evidence includes `qa/A11-REMOVAL-INVESTIGATION.md`, original `qa/qualification-77936023.json`, separate `qa/qualification-77936023-a11-fixture.json`, `qa/final-run-1/summary.json`, and `qa/live/live-verification.json` / `live-browser-smoke.json`. **Do not launch any completed G2 gate again.**

## 3. Completed G3 deliverables and required reading

The G3 group folder, abbreviated **G3** below, is:

`Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G3 — Spell Rows/`

Read these complete records and inspect the boards before asking the owner for decisions:

- `G3/README.md`, `G3/MOCKUP.md`, `G3/REPRODUCTION.md`, `G3/qa/USAGE.md`.
- **`G3/mockups/G3-MOCKUP-REVIEW.html`** — self-contained review page with embedded screenshots, Phone/Laptop switches and expandable additional cases. Open locally; viewing HTML source on GitHub is not a running review page.
- `G3/mockups/G3-UI01-review.png`, `G3-UI02-attribution.png`, `G3-UI03-controls.png` — the three approval boards. The PNG boards emphasize phone cases; the HTML also contains laptop cases.
- `G3/qa/reproduction/reproduction.json` — current G2 measurements and raw screenshots in the same directory.
- `G3/qa/prototype/prototype.json` and `scratch.css` — final scratch observations/styles and screenshots in that directory.
- `G3/qa/reproduce.cjs`, `prototype.cjs`, `boards.cjs` — reproducible scratch utilities, **not application implementation or qualification launchers**.

The review page was rendered and visually inspected. Its Phone/Laptop switches work, and it has no horizontal overflow at 390 px. A read-only reviewer checked the prototype and records; no material blocker remains for **scratch approval boards**, not for release.

Also read the project's governing documents, in full where a complete document is named:

1. `Versions/CLAUDE.md` — architecture, removal, QA and ownership rules. **Append-only; exactly eight CR bytes must remain.** It was not edited during G3 mockup preparation.
2. Current summary/latest G2 entries in `Versions/BUILD-LEDGER.md` and its HTML companion; current work order in `Versions/L5R Character Sheet Phased Roadmap reorder.md`. Older dated pending/G1 statements are history; current live G2 entries supersede them.
3. G2 `HANDOVER.md` and the prior `KICKOFF-15A-G3.md` in the G2 folder. This new handoff supersedes that kickoff's “reproduce and prepare boards next” status, not its architectural/QA requirements.
4. `Versions/Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md`, **including the 6 November amendment**: grouped build/QA, separate finding acceptance and independent removal.
5. In that audit folder: `RELEASE-8B-1-DEVICE-FEEDBACK.md`, `PHASE-15-RULINGS-2026-11-01.md`, applicable `AUDIT.md` guidance, and historical `qa/2026-11-03-school-spells/measurements.json` / Sense images. Q1–Q8 are settled; do not reopen them. Historical screenshots were from the 3 November 8b.1 candidate; G3 now has its own current G2 reproduction.
6. `Versions/BUGFIX — Older School Choices/HANDOVER.md`, `DESIGN.md`, `ROLLBACK.md` and relevant QA; the underlying School-choice records/source below.

Original session artifacts also remain at `C:/Users/jcrow/Documents/Codex/2026-11-08/this-is-a-new-session-continuing/`. Its `outputs/` contains the user-facing review pack and this handoff; `work/` holds earlier scratch iterations. The pushed repository contains everything required to continue; do not depend on that workspace being available in Claude.

## 4. Findings, measured reproduction and pending design decisions

Reproduction used fresh isolated Chromium contexts at **390 × 844** and **1440 × 1000**, device scale 1, one browser job at a time. The legacy fixture was `Versions/BUGFIX — Older School Choices/qa/older-kitsu.l5r.json`. No normal browser profile or real character was touched.

| Finding | Current G2 | Mockup proposal | Owner decision |
|---|---|---|---|
| **8b.1-UI-01** | Confirm touches the last Earth border: 0 px gap and −2 px left offset on both widths; Later is separate. | Existing instruction above the same groups; 44 px option cards; shared inset and divided footer with Later secondary/Confirm primary; groups scroll while actions stay visible; two group columns on laptop. | **Pending** |
| **8b.1-UI-02** | Phone Sense input is 20 px outside, **0 px usable text**; laptop 795.47 px outside / 775 px usable text. | Name gets its own line. **A: Quiet** — no School cue for single-School characters. **B: Badge** — short “School spell”. Both show full School names for multiple-School characters, preserve saved grant data and leave rewards untagged. | **Pending A / B / revision** |
| **8b.1-UI-03** | Remove overlaps Memorised by **34 × 33 px** on phone, **21.44 × 25 px** on laptop. | Separate Cast/status-help/Memorised/Remove row; 44 px Memorised height, 44 × 44 Remove on the right; zero overlap; normal Play restrictions remain. | **Pending** |

These IDs remain 8b.1-UI-01/02/03; do not renumber them as A findings. G3 is exactly these three follow-ups. UI-01 is the **older holdings Review starting spells dialog**, not the creation wizard or a redesign of the ordinary missing-spell chooser.

The main UI-02 A/B pictures include UI-03 so the owner can judge the combined result; they say so explicitly. An expandable UI-02-only example reserves the existing Remove corner. UI-03's main comparison shows it alone with the original School label. A combined picture does not collapse the separate approval/removal decisions.

Names remain original single-line inputs in both modes; Play retains its existing read-only field. “Wrath of Kaze-no-Kami (Hurricane)” is the tested long catalogue name. Arbitrarily longer custom names retain native horizontal input behavior; wrapping custom-name editing is not proposed. Text marked “Layout sample” is synthetic, not a rules rewrite. The red × beside Cast in some screenshots is the **existing casting-status/help button**, not Remove.

Present the existing boards and ask for: **“1 approve/revise; 2 A/B/revise; 3 approve/revise.”** No decision was received before this handoff. Silence, the handoff request and prior G2 approval do not count as G3 approval.

## 5. What the scratch checks do and do not prove

Both current G2 and the final prototype preserve the fixture's intended allocation: Later makes no writes; confirming eight starting spells leaves Jurojin's Balm as an ordinary reward and offers one missing Earth spell. This is a fixture result, not a new spell rule.

Final prototype observations at both widths:

- Later actually closes and makes no writes. Confirm reaches the ordinary chooser with the review class removed. An over-quota selection is rejected without writes and retains both actions.
- A 20-choice long list scrolls: phone content/client heights **1,079 / 589 px**, laptop **822 / 768 px**. Footer top stays **754 px** phone and **910 px** laptop before/after scrolling.
- Six Manage/Play × today/quiet/badge treatments preserve serialized spell records. The combined proposals provide **298 px** usable phone name space and zero Remove/Memorised overlap for School, reward and long-name rows.
- Tapping the Memorised label changes only that spell. A renamed reward survives `collectData` / `applyData`; a separate click removes that disposable reward.
- Play retains read-only names, disabled Memorised and hidden Remove. No uncaught page errors were recorded.

These are **bounded scratch probes**, not qualification. The serializer/applyData roundtrip is not a file-save/import or reload test. Still required after approved implementation: file-save/reopen, School and reward removal/undo, focus contracts, arbitrary dialog rerenders, independent switches/removal/dependencies, touched retained harnesses, and native iPhone Safari/Laptop Edge owner acceptance.

### Prototype lessons — do not copy its temporary wiring as architecture

- `#sc8Dialog` display styling must be scoped to `[open]`; unconditional `display:flex` can override native closed-dialog hiding.
- OC8's Confirm handler requires `body.contains(confirm)`. Moving Confirm outside `#sc8Body` breaks that guard.
- SC8.render replaces body contents. Moving the persistent `#sc8Done` into that body requires lifecycle handling; it can otherwise be deleted. Review-only overflow styles must not leak into the ordinary chooser.
- An early scratch revision used a capture-listener microtask to restore Later. The browser ran it before OC8's original target handler, re-nesting Later before SC8 deleted the body. That scratch run stopped at a missing-Later click. Final ordering is capture → original OC8 handler → a later-registered bubble listener, with no microtask. This fixes the tested path, not every possible rerender in a production implementation.
- The initial Play name mirror was removed because editing/mode changes could leave copied text stale. Final mockups retain the real input.
- The first raw row crops included a floating-toolbar artifact; the boards use later centered captures. No application source was changed by these iterations, and no full suite was failed/retried.

## 6. Technical map and retained checks

Let **P** be `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability`.

| Area | Current owner and source |
|---|---|
| Older starting-spell review | `P/src/sheet/209.9999999999999992-bugfix-older-school-choices.js`, private `spellsUI(body, school)`, `.oc8-held-spell`, `input.oc8-spell`, `.oc8-confirm` |
| Dialog / School labels | `P/src/sheet/209.9999999999999991-feat-school-choices.js`, SC8.open/render/badge; `#sc8Dialog`, `#sc8Body`, `#sc8Done`, `.sc8-source` |
| Spell rows | `P/src/sheet/090-table-rows-weapons.js`, makeEntry; `#techList .entry[data-spell-element]`, `.entry-top`, `.en-name`, `.rm-btn`, `.spell-cast-btn`, `.cast-why-btn`, `.spell-memo-label`, `.spell-memo-checkbox`, `.en-desc` |
| Existing CSS | `P/src/css/10-sheet-base.css`, `30-carousel-mobile.css`, `1125-school-choices.css`, `1126-older-school-choices.css` |
| Manage/Play | `P/src/sheet/209.99992-feat-modes-techniques.js`, `P/src/css/59.9993-feat-modes-techniques.css` (MODES126) |
| Integration/removal | `P/src/sheet/210-test-seam-and-init.js`, `P/build/manifest.json`, `Versions/QA — Removal Chain Registry/removal_chain.py` |

SC8's retained switch is `SCHOOL_CHOICES_ENABLED`, marker `PART K PHASE 11.2.5`, seams SC8 / SC8Logic. OC8's retained switch is `OLDER_SCHOOL_CHOICES_ENABLED`, marker `BUGFIX OC8`, seam OC8. **These are older layers, not G3 ownership.** Wrap/extend declared boundaries. SC8.badge also serves Skills and Equipment; limit spell presentation changes appropriately. Preserve `dataset.sc8Grant` / serialized School metadata even when hiding the visible label.

Starting retained test inventory, relative to `Versions/`:

| Folder | Harness | Checks |
|---|---|---:|
| `BUGFIX — Older School Choices/qa/` | `older-review-harness.js` with `review-pins.json` | 20 |
| Same | `legacy-grants-harness.js` | 4 |
| Same | `allocation-boundaries-harness.js` | 5 |
| Same | `checklist-walk.cjs` (inspect arguments) | 6 |
| `PART K — Phase 11.2.5 School Choices from the Character Check/qa/` | `school-choices-harness.js` | 30 |
| Same | `review-regression-harness.js` | 6 |

Add every other touched harness identified by the actual implementation, including modes/techniques where applicable. Use full paths; duplicate harness names exist. Important retained cases include Later no writes, no duplicate grants, only-Earth owed, reload retains review, Play read-only, second Schools, former names and paid memorised spells. Use a fresh legacy fixture to reach review; a previously confirmed save skips it.

## 7. Resume sequence and approval boundaries

1. Verify repository state/hash, read this handoff and required records, inspect the existing review pack. No full baseline suite or duplicate screenshot campaign is needed.
2. Obtain or apply the owner's three mockup decisions. Record exact wording/date in G3/MOCKUP.md. Revise scratch boards only where requested. UI-02's A/B choice remains unresolved until the owner chooses.
3. Re-estimate approved scope. Current qualitative estimate: **UI-01 medium, UI-02 medium, UI-03 small**; a medium group overall. Plan three independent units, three stacked previews, light checks and one review, then an owner-device round. Numerical allowance cost/time has not been agreed.
4. Build only approved scope. Each finding gets its own folder under Release 15a, uniquely owned fragments/switch/marker/seam, README, ROLLBACK, pinned check IDs, own harness, remover, removal test and registry entry. The existing G3 folder owns shared group records/QA only. Inspect marker grammar/collisions before naming new ownership. Do not patch generated HTML as the implementation.
5. Stack preview branches in UI-01 → UI-02 → UI-03 order. UI-01's application base is exact live G2; carrying the mockup documentation into its branch does not change that base. Each later preview compares to its immediate predecessor. Record actual branch names, URLs and hashes. The mockup branch is **not** a working G3 app preview. Do not merge into `main` at this stage.
6. Run light checks: each unit's pinned harness, enabled/disabled/removal proof, dependencies, and all touched retained harnesses. Prove later G3 units survive earlier-unit removal. One read-only group code review before owner testing; fix defects first.
7. Give the owner one group checklist with separate **Accept / Revise / Remove** decisions in order, tested on **iPhone Safari and Laptop Edge**. The project calls for a Claude Doc with a repository mirror; use the connected document service if available and do not describe a local mirror as an externally published Doc. Present actual working previews, not these static boards. Device acceptance is distinct from mockup approval.
8. Qualify only the accepted group under the tier/count/removal plan below. Preserve failures; investigate rather than retrying a failed full suite or weakening assertions.
9. After successful qualification, update group handover/checklist, ledger MD/HTML, roadmap and append-only CLAUDE pointer once for the group. Then wait for the owner's **G3 go-live instruction**. On that later instruction, fast-forward/push `main`, run adapted production verification without `--url`, browser/offline smoke, and record actual production evidence. G2's go-live authorization does not cover G3.

## 8. G3 qualification arithmetic and removal requirements

G3 is proposed **screen-only**: layout/presentation without changes to values, saves, rolls, undo, focus or startup. Confirm against the actual implementation. If it remains screen-only, run **one full pass comprising candidate and retained builds**. A 4× CPU screen is required only if timing, animation or asynchronous behavior is introduced. If behavior changes, surface the scope/tier change before continuing: behavior tier requires the 4× CPU screen and **two full passes**, each on its first execution.

| Build | Correct count |
|---|---|
| G3 candidate | **7,148 + new accepted G3 checks**; exact new count is not yet defined |
| G3 retained, all G3 removed | **7,075 = 7,148 − 73 = 146 + 6,929**, keeping all five G2 harnesses |

The 73 exclusions are Release 5a `sw-checks.js` (61) and Release 5b `notice-checks.js` (12), as in prior retained suites. Another decomposition is 146 G2 + 137 G1 + 37 A03 + 6,755 earlier retained = 7,075. G2's old retained runner alone is only 6,929 and is **not** a complete G3 retained runner. Unchanged baseline inventories are 191 candidate leaves / 189 G2 retained leaves. Reconcile invocation lists with `--list` without running a discovery full suite. Pin arithmetic and exact expected IDs before qualification.

- Bounded negative-variant discovery is separate from full-suite discovery. Commit predicted exact failure IDs before variants; explain justified corrections. Include switch-off, owned-CSS removal, focused mutations and controls for approved units.
- Register G3 units after A04.1. Whole-G3 `LAST_KEPT`: `PART H — Phase 15 Implementation/Release 15a/A04.1 — One Way to Show Choices in Pickers`.
- Whole G3 removal must restore **G2 SHA `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0`, 17,609,230 bytes exactly**. G2's G1 restoration hash is not G3's BEFORE.
- Prove each G3 unit removed alone with later G3 retained, whole-group removal and relevant predecessor interactions. Preserve character/grant data. Run removers only in verified scratch trees, never the live source tree.
- G2 runners are worked examples, not launchers to copy blindly. Its `run-final-once.py` / `continue-after-a11-fixture.py` depend on an exceptional A11 continuation, historical hashes/failed-state files and one-use locks. Create clean G3 gates/state. Never clear or reuse G2's `full-launched.txt`, run folders or completed logs.
- Do not commit `candidate-leaves/`, `retained-leaves/` or `local/site/`. Stage explicit paths and preserve unrelated caches.

## 9. Windows environment and lessons

Use canonical QA tools for all Node children, including those launched by Python:

```powershell
$env:NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules'
$env:PLAYWRIGHT_BROWSERS_PATH='C:/Users/jcrow/l5r-qa-tools/ms-playwright'
$env:PYTHONUTF8='1'
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
```

Ordinary leaf preloads, in order:

1. `Versions/PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs`
2. `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs`

Apply these at the leaf level, not globally to dedicated startup/splash/notice tests. Do not inherit the old installed-Chrome shim or rely on AppData's inconsistent browser copy. **One browser job at a time.** Full suites require mains power and system/display sleep inhibition; preflight one-use stages before launching. A preflight stop is not a test failure. G2's production-only launcher initially overapplied the mains guard; its bounded production verification then passed on battery with sleep inhibited, without a test retry.

Other requirements:

- Retain A03's declared Skills-table settling synchronization. Investigate event/race causes instead of padding timeouts or repeating a suite.
- Restore exact initial class state in `finally`; close opened windows on failures.
- Fixtures must provide independent coverage when neighbors are removed. Keep original assertions/IDs/counts and conditional-fixture contracts. Declare legitimate conditional fixture changes in both affected ROLLBACK files.
- Marker-shaped prose can be parsed as ownership. Use forms such as “Phase 12 (Part K)” in unrelated prose. Check marker boundaries/prefixes.
- Hidden nodes yield zero geometry; inspect retained assertions before hiding/removing elements.
- Restacking an earlier revision changes later predecessors: rebuild later branches and refresh exact hashes/removal records.
- Canonical source is fragments plus manifest. Verify recombination in scratch when the verifier writes output, preserving frozen candidates.
- Windows Git Bash `timeout` is `timeout.exe`, not a Unix wrapper. Canonical repo writes/git or packaged Python needed tool escalation in Codex; request the appropriate access in Claude rather than changing clones. Do not carry tool-specific approval assumptions across environments.
- The prior project helper rule allows a read-only code reviewer and a failing-test investigator, not parallel builders/book readers. Follow the new session's higher-priority agent instructions if they differ; never run concurrent browser jobs.

## 10. Explicitly parked work

- **A04.2 configured rows:** waits until the rules read pass completes. Future proposal: filled choice badge far left, Change in Manage only, then i explaining choices; chosen-option summary below; “Applied automatically” / “Reminder” in words; Bishamon's Clan-coloured note becomes plain summary. Mockup first when authorized.
- **Identity character check — Needs a choice:** future small rule in Phase 5 (Part J), using the existing configuration-complete test for unfinished Advantages/Disadvantages. Not G3.
- **Remaining A11 observations:** Rings note 12 px right of laptop label; Armor & TN information heading in Play and bonus note 3 px below field; Wounds first column 8 px right of caption. Later work only.
- **FU-15a-1**, parked stats header and **FT-59** Clan mon/colour themes remain parked.
- G4 A09/A10/A17/A18; G5 A08/A12; G6 A19/A20; Combat redesign, tattoos, sync, career planning and Release 15b are outside G3.

Resume from the completed review pack, record the owner's decisions, and preserve independent acceptance/removal. **This handoff changes documentation only. G2 remains live; G3 remains awaiting mockup approval.**
