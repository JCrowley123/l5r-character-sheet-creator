# Kickoff — Release 15a, G3: spell rows

Prepared by Codex on 9 November and finalized on 10 November 2026, after G2 went live and passed production verification. Read this file in full. It is intended for a fresh Claude or Codex session and does not depend on the preceding chat.

**G2 is accepted, qualified and live. G3 has not been built or mockup-approved.** The next session starts by reproducing G3's three findings on the current G2 build and preparing comparisons for the owner. Build only the approved mockups; a later G3 production release still requires the owner's go-live word.

## 1. Start here

- Repository: https://github.com/JCrowley123/l5r-character-sheet-creator (private).
- Canonical checkout: `C:/Users/jcrow/l5r-character-sheet-creator`. **Never use the OneDrive clone.** Inspect local changes, then pull `main` with `--ff-only`. Preserve unrelated work and existing QA caches.
- At preparation, the checkout is on `main`, with no tracked changes, at `44cb616386e811423c35a3e412a18fab6660c0fc` (G2 production records). This kickoff adds a later documentation commit; record the actual HEAD in the new session. Documentation commits do not change the application hash below.
- Production: https://l5r-character-sheet-creator.pages.dev/
- G2 branch preview, if useful for comparison: https://claude-release-15a-a04-1.l5r-character-sheet-creator.pages.dev/ (branch aliases can move; verify its bytes before treating it as the baseline).
- Remote Control: the owner confirmed it enabled and the iPhone connected on 8 November in this chat. Keep phone continuation available. Check the new session's actual status if possible; do not claim a fresh verification from this historical confirmation or require the owner to repeat it without a reason.
- Take a fresh usage reading. Do not reuse a previous session's available allowance or infer a task cost from shared account meters.

The user requested this kickoff to continue with G3. Preparation of this file did not implement G3, choose its unresolved design, start qualification, or authorize G4 onward.

## 2. G2's final live baseline — do not rerun it

| Item | Verified state |
|---|---|
| Group | A05 Missing Limb picker; A06 grant actions/state; A07 Moon row; A11 explanatory text gaps/alignment; A04.1 inline picker rules, revision 1 |
| Application SHA-256 | `7793602382c68895b25dc572b71bd05af33667a9c1b1d1bd76032efd744182f0` |
| Application size | **17,609,230 bytes** |
| Qualified application/records tip | `93b27c61fca838079909a7b52398cbf163d418c4` |
| Go-live | Owner explicitly authorized 9 November; `main` fast-forwarded from `2790a2ba` to `93b27c61`, no merge commit and no force |
| Production records commit | `44cb616386e811423c35a3e412a18fab6660c0fc`, pushed to `main` |
| Owner devices | 36/36 checks on 7 November; revised A04.1 check 15 passed on **iPhone Safari and Laptop Edge** on 8 November |
| Full candidate | **7,148/7,148**, one execution, 191 fresh harness leaves, no reused results |
| Full retained | **6,929/6,929**, one execution, 184 fresh leaves; this is **G1 with G2 removed**, not G3's retained baseline |
| G2 removal restoration | G1 SHA `2dcf6f20846b0c9ea97b59b94537abda6d510714b3bc1ef6376175056d066af6`, **17,586,964 bytes**, exact |
| Production application checks | **2,523/2,523** across 57 harnesses on downloaded production files; completed `2026-11-09T12:46:26.627998+00:00` |
| Browser/offline smoke | **22/22**, completed `2026-11-09T12:46:38.319Z`; fresh automated Chromium at 390 px, then offline reload; no uncaught page errors |
| Deployed PWA page | SHA `bd1b5fd615f07afef7f87da1e0448dc1173074fe483ba57cee6afffffb0ea107`, **17,616,007 bytes** |
| Service-worker build | `f9a4bcad8d36d92a` |
| Service-worker SHA-256 | `d66ab82abc47601f7e165a0fb305aa651e1f468c8e311e2233816a6128331527` |

All seven deployed files (page, service worker, manifest and four icons) matched the committed build byte for byte. The PWA page includes the installation header, so its hash/size differ from the source application. The automated smoke supplements the owner's device acceptance; it is not a native iPhone test.

The canonical application is under:

`Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/l5r-character-sheet.html`

### Qualification history that must remain truthful

G2's first removal chain stopped at **46/47**: with A05 removed, A11's fixture supplied only seven eligible desktop text rows for its eight-row coverage minimum. Geometry was correct. Only A11's fixture was strengthened by adding a description to its existing Moon card; assertions, IDs, 22-check count, eight-row minimum and 1 px tolerance stayed unchanged. Six scoped runs passed **132/132** on the candidate and the five preserved removal inputs where A11 remains. The original failure was preserved, not rerun or overwritten. A guarded continuation ran only the previously unstarted stages: **25/25 exact negative cases and 5/5 dependencies**. The subsequent single full pass passed first time.

Read the investigation if touching related test infrastructure. Do not describe G2 as an uninterrupted first-chain pass. Its full qualification and production suites are complete; **do not restart them to prepare G3**.

G2 evidence, relative to `Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/G2 — Small Layout Fixes/`:

- `HANDOVER.md`, `DEVICE-CHECKS.md`, `MOCKUP.md`, `PREVIEWS.md`.
- `qa/VARIANT-PINS.md`, `qa/variants-discover-77936023/summary.json`.
- `qa/qualification-77936023.json` — original failed chain, retained as failed.
- `qa/A11-REMOVAL-INVESTIGATION.md`, `qa/a11-fixture-validation/summary.json`.
- `qa/qualification-77936023-a11-fixture.json` — passed guarded continuation.
- `qa/final-run-1/summary.json` and its top-level logs.
- `qa/live/live-verification.json`, `qa/live/live-qa.log`, `qa/live/live-browser-smoke.json`, `qa/verify-production.log`, `qa/browser-smoke.log`.
- `qa/USAGE.md` — Codex readings separate from Claude.

## 3. Required reading before G3 work

All paths below are relative to the canonical checkout. Read complete files, not only search excerpts, where a complete document is named.

1. `Versions/CLAUDE.md` — architecture, ownership, markers, removal, QA, safety and latest pointers. **Append-only; exactly eight CR bytes must remain.**
2. `Versions/BUILD-LEDGER.md` (current summary and latest G2 entries), its HTML companion, and the current work order in `Versions/L5R Character Sheet Phased Roadmap reorder.md`. Old dated pending/G1 statements are historical; the latest live G2 entries supersede them.
3. G2's `HANDOVER.md`, including the complete qualification and production record.
4. `Versions/Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md`, **including the 6 November amendment**. This overrides older one-at-a-time build/QA wording while preserving individual acceptance and independent removal.
5. That audit folder's `RELEASE-8B-1-DEVICE-FEEDBACK.md` in full, plus `qa/2026-11-03-school-spells/measurements.json`, `sense-390.png` and `sense-1440.png` in that same evidence directory.
6. `PHASE-15-RULINGS-2026-11-01.md` in the audit folder. Q1–Q8 are settled; do not reopen them. Consult `AUDIT.md` for the shared visual language and applicable rulings.
7. `Versions/BUGFIX — Older School Choices/HANDOVER.md`, `DESIGN.md`, `ROLLBACK.md` and relevant QA, plus the underlying School-choice unit's records and source identified below.

The original screenshots/measurements were from the **8b.1 candidate `f4c4f2ce` on 3 November**, installed Edge and a synthetic older Kitsu character. They establish the problem; **reproduce on current G2 before claiming today's measurements**.

## 4. G3 scope — exactly three independently removable findings

### 8b.1-UI-01 — Starting-spell review and its actions

The older-character **Review starting spells** dialog has Given, Water, Air and Earth groups, fieldsets and tall checkbox rows. In the historical measurements, **Confirm starting spells** touched the final Earth border and began 2 CSS px to its left; Confirm was in the body while Later was in the footer.

- Compare today's dialog with the app's existing choice pickers. Propose consistent option presentation, a common action inset, and visible separation from the final option group.
- Show phone and laptop cases, long lists and scrolling, and usable tap targets.
- Preserve Confirm saving the chosen starting-spell allocation and Later discarding the draft. Preserve the ordinary missing-spell chooser reached after confirmation.
- This is the **older holdings review**, not authorization to redesign the creation wizard or every spell chooser.

### 8b.1-UI-02 — Keep the spell name readable after confirming its School

The editable name, separate School label, Cast, help and Memorised controls share a non-wrapping line. Historically, Sense had a 20 px outer input box and **zero text space** at 390 px; hiding the School label temporarily gave 107 px text space. Desktop text space was 775 px. The saved name was still Sense; this was presentation, not missing data.

- Name readability comes first. Test short and long names, School and reward spells, phone/laptop, Manage/Play, edit/save/reopen, and multiple-School attribution.
- **The design is not chosen yet.** The owner is open to School attribution in the saved record only; if a visible cue helps, the preferred short wording is **School spell**, possibly a badge. Compare those options in mockups instead of silently choosing one.
- Make the full School attribution available where needed for a multiple-School character. Do not discard or rewrite saved grant metadata merely to remove visible text.
- An ordinary reward must remain a reward with no School grant. Preserve spell casting, memorisation and editing behavior.

### 8b.1-UI-03 — Separate Remove from Memorised

The absolute-positioned × overlaps the Memorised label. Historical hit-area overlap was 34 × 33 CSS px on phone and about 21 × 25 on desktop.

- Give Remove and Memorised separate visible and tappable space; demonstrate zero overlap at both widths and with long names/labels.
- In Manage, tapping the Memorised label must toggle that spell only. Removing a disposable spell must be a separate action. Cover School and reward spells.
- Play must retain its normal controls and mode restrictions. Preserve removal, save and undo behavior; do not change those semantics to achieve spacing.

Keep stable IDs **8b.1-UI-01/02/03**. They are follow-ups, not replacements or renumberings of A01–A20. No G3 implementation folder, marker, switch, branch or accepted mockup is pre-existing merely because it is proposed here.

## 5. Technical starting points

The next session should map the current DOM to its owning layers before choosing an implementation. Use `rg`, the source fragments and existing fixtures/harnesses. Do not patch the generated HTML as the implementation.

In the table below, `P` means `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability`.

| Area | Existing source and selectors to inspect |
|---|---|
| UI-01 older-spell review | `P/src/sheet/209.9999999999999992-bugfix-older-school-choices.js`, private `spellsUI(body, school)`. Rows `.oc8-held-spell`, checkboxes `input.oc8-spell`, Confirm `.oc8-confirm`. Confirm currently belongs to `#sc8Body`; Later is `#sc8Done`. |
| Dialog host | `P/src/sheet/209.9999999999999991-feat-school-choices.js`, `SC8.open` / `SC8.render`. Inspect `#sc8Dialog`, `#sc8Title`, `#sc8Message`, `#sc8Body`, `#sc8Done`; Identity action `#validationReport .sc8-open[data-school][data-kind="spell"]`. |
| UI-02 School attribution | The same School-choices fragment, `SC8.badge(row, record)`, inserts `small.sc8-source` after `.sk-name, .eq-name, .en-name`. It also labels Skills and Equipment: scope spell-row presentation changes so those other rows retain their behavior. |
| UI-02/03 spell renderer | `P/src/sheet/090-table-rows-weapons.js`, `makeEntry`. Inspect `#techList .entry`, `.rm-btn`, `.entry-top`, `.en-name`, `.spell-cast-btn`, `.spell-memo-label`, `.spell-memo-checkbox`, `.en-desc`. Other entry types share the constructor. |
| Existing layout | `P/src/css/10-sheet-base.css`, `P/src/css/30-carousel-mobile.css`, `P/src/css/1125-school-choices.css`, `P/src/css/1126-older-school-choices.css`. |
| Manage/Play presentation | `P/src/sheet/209.99992-feat-modes-techniques.js` (`MODES126.selector`) and `P/src/css/59.9993-feat-modes-techniques.css`. |
| Integration and removal | `P/src/sheet/210-test-seam-and-init.js`, `P/build/manifest.json`, and `Versions/QA — Removal Chain Registry/removal_chain.py`. |

Existing owners are **SC8** (`SCHOOL_CHOICES_ENABLED`, marker `PART K PHASE 11.2.5`, seams `SC8` / `SC8Logic`) and **OC8** (`OLDER_SCHOOL_CHOICES_ENABLED`, marker `BUGFIX OC8`, seam `OC8`). These are older retained layers, not G3's new ownership. Wrap or extend through declared boundaries rather than rewriting their rules.

Start with these retained tests, then add every other harness identified by the actual change:

| Folder, relative to `Versions/` | Harness / fixture | Current checks |
|---|---|---:|
| `BUGFIX — Older School Choices/qa/` | `older-kitsu.l5r.json` — fresh legacy character fixture | — |
| Same | `older-review-harness.js`, with `review-pins.json` | 20 |
| Same | `legacy-grants-harness.js` | 4 |
| Same | `allocation-boundaries-harness.js` | 5 |
| Same | `checklist-walk.cjs` — historical phone-width walkthrough, inspect its arguments first | 6 |
| `PART K — Phase 11.2.5 School Choices from the Character Check/qa/` | `school-choices-harness.js` | 30 |
| Same | `review-regression-harness.js` | 6 |

The older-review checks include `LATER-NO-WRITES`, `EIGHT-NO-DUPLICATES`, `ONLY-EARTH-OWED`, `RELOAD-RETAINS-REVIEW` and `PLAY-READ-ONLY`. The review-regression harness covers second Schools, former names and paid memorised spells. Use full paths: other folders contain similarly named harnesses.

UI-01 is specifically OC8's review of already-owned spells inside the SC8 dialog. After Confirm, that dialog can become the ordinary missing-spell chooser. It is not A01's creation-wizard Review. Start with a **fresh** legacy fixture because a previously confirmed save persists the review decision and skips the target screen.

Use a synthetic disposable character in isolated browser storage. Do not overwrite a real character or reuse the user's normal browser profile. The older Kitsu fixture establishes allocation state; inspect its text fields before relying on it for long-description layout. Use an appropriate populated synthetic case where needed.

For UI-01, verify the transition from an older-character review to the normal School spell picker. The existing Osamu example selects eight starting spells, preserves Jurojin's Balm as a reward, then offers one missing Earth spell. Do not treat that fixture-specific result as a new general spell rule.

## 6. Sequence and approval boundaries

1. **Inspect and reproduce.** Start from current `main`; verify the G2 application hash. Record each finding's owner layer/selectors and measurements at **390 × 844** and **1440 × 1000**, in Manage and Play where applicable. Include school/reward and long-name cases. Do not run a full baseline suite: G2 already has complete evidence.
2. **Prepare mockups for all three findings.** Show current versus proposed using a scratch prototype on G2. For UI-02 include the unresolved attribution options. Explain each change plainly, identify what remains functional, and give a scoped estimate based on the actual proposal. Present the boards and wait for the owner's approval before implementation. G2's `qa/prototype.cjs` and `qa/board.cjs` are examples, not G3 templates to run unchanged.
3. **Build only approved scope.** Each finding gets its own folder under `Versions/Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/`, fragments, switch, unique marker, seam, README, ROLLBACK, expected-check IDs, own harness, remover, removal test and registry entry. A group folder such as `G3 — Spell Rows` owns shared group records/QA. Choose collision-free markers after inspecting the marker grammar; do not invent audit IDs or silently share ownership.
4. **Stack three preview branches in finding order.** Base UI-01 on live G2, UI-02 on UI-01, UI-03 on UI-02. Record actual branch names/URLs. Each preview compares with the immediately preceding state. Do not merge G3 into `main` during this stage.
5. **Light checks per finding:** own pinned harness, enabled/disabled/removal proof, feature-dependency check, and all touched older harnesses. Prove each finding survives removal of an earlier finding. Run one read-only review of the approved group diff and address defects before owner testing.
6. **Owner review:** one group checklist with phone Safari/laptop Edge checks and a separate **Accept / Revise / Remove** decision per finding. The process calls for a Claude Doc; keep a repository mirror. Use the connected document service if available; do not claim external publication from a local mirror alone. Present the actual working previews. Revisions and light checks happen here. Silence and automation do not count as acceptance.
7. **Qualification only after acceptance.** Follow the tier/count/removal plan below. Preserve any failure and investigate it; never retry a failed full suite or widen assertions.
8. **Records, then owner's go-live word.** Update group handover/checklist, ledger MD/HTML, roadmap and an append-only CLAUDE pointer. G2's authorization was for G2 only. On a later explicit G3 go-live instruction: fast-forward `main`, push, run G3's adapted production verification without `--url`, then the browser/offline smoke, and save actual production evidence.

For the new session, the first useful deliverable is **G3's reproduction and current/proposed mockup boards**, not an unapproved implementation.

## 7. QA plan and the correct G3 arithmetic

G3 is **proposed screen-only**: layout, spacing and control presentation with no changes to values, saves, rolls, undo, focus or startup. Confirm that classification against the implementation before freezing counts.

- If it stays screen-only: **one full pass** consisting of candidate and retained builds. No full-suite discovery run. A 4× CPU screen is required only if the finding introduces timing, animation or asynchronous behavior.
- If scope changes values, saves, rolls, undo, focus or startup: use the **behavior tier**, with its 4× CPU screen and two full passes, both first executions. Surface the scope/tier change before proceeding.
- A bounded negative-variant discovery is distinct from a full-suite discovery. Predict and commit exact failure IDs before running variants; record any justified correction. Include switch-off, owned-CSS removal, focused mutations and baseline controls appropriate to the approved units.

### Counts — pin before any full pass

| Build | Planned count and derivation |
|---|---|
| G3 candidate | **7,148 + the new accepted G3 checks**. G3's exact new count is not yet known; define it from the approved harnesses before qualification. |
| G3 retained, G3 removed | **7,075 = 7,148 − 73 = 146 + 6,929**. This is G2 as live, keeping all five G2 harnesses. |

The 73 exclusions are Cycle 5 Release 5a's `sw-checks.js` (**61**) and Release 5b's `notice-checks.js` (**12**), as in prior retained suites. Another equivalent retained decomposition is G2's 146 + G1's 137 + A03's 37 + A03 retained 6,755 = 7,075. The existing G2 `retained-suite-runner.js` alone is **6,929**, so it is not a complete G3 retained runner.

At the unchanged baseline, the inventory is 191 candidate leaves; excluding those two live-site leaves leaves 189 G2 retained leaves. Confirm G3's invocation lists without launching harnesses (`--list`) and reconcile every declared count. If an older harness legitimately changes count, explain and pin the arithmetic before running; do not force a total by omitting checks.

### Removal and runners

- Register G3 units after **A04.1**, currently the last accepted registry entry. `LAST_KEPT` for removing all G3 is `PART H — Phase 15 Implementation/Release 15a/A04.1 — One Way to Show Choices in Pickers`.
- G3 removed must restore the G2 application **77936023…82f0, 17,609,230 bytes exactly**. Do not use G2's old G1 restoration hash as G3's `BEFORE`.
- Prove each G3 unit removed alone with the other G3 units kept, whole G3 removal, and relevant predecessor/later-layer interactions. Preserve saved characters and grant metadata. Run removers only against verified scratch trees; never the live source tree.
- Use G2's runners and group QA as worked examples, adapting the approved G3 constants, ownership, touched layers, counts and file locations. Keep older assertions and conditional-fixture contracts intact.
- **Do not blindly copy G2's launch gate.** Its `run-final-once.py` is tied to the exceptional A11 fixture continuation. `continue-after-a11-fixture.py`, its hardcoded hashes, failed-state JSON and one-use locks are G2 evidence, not a fresh G3 workflow. Create clean G3 state/gates. Do not copy or clear G2's `full-launched.txt`, completed run folders or logs to obtain another run.
- Never commit `candidate-leaves/`, `retained-leaves/` or `local/site/`. Use explicit staging paths; leave old unrelated caches alone.

## 8. Environment and lessons to carry forward

Use the canonical QA-tools installation for all Node children launched from Python. In PowerShell:

```powershell
$env:NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules'
$env:PLAYWRIGHT_BROWSERS_PATH='C:/Users/jcrow/l5r-qa-tools/ms-playwright'
$env:PYTHONUTF8='1'
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
```

Do not inherit the old installed-Chrome shim. AppData's browser copy failed in earlier sessions and is not visible consistently to the packaged Python. The canonical QA-tools browser worked for qualification and production.

Ordinary leaf harnesses use these preloads, in order:

1. `Versions/PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs`
2. `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs`

Apply them at the leaf level as the suite does; do not globally inject splash bypass into dedicated startup/splash/notice tests. **One browser job at a time.** Run the full suite on mains with display/system sleep inhibited. Check power before starting any one-use stage and retain a preflight stop distinctly from a test failure. G2's production-only launcher initially stopped before tests because it overapplied the full-suite mains guard; the bounded production checks then passed on battery with sleep inhibited. Do not present that as a failed or retried production suite.

Other concrete lessons:

- A03's declared harness synchronization waits for the Skills table to settle before typing; retain it. If a race returns, find the event/cause rather than repeating the suite or padding arbitrary timeouts.
- Harnesses that toggle a class must restore the exact initial state in `finally`; opened windows must close even on failure.
- Fixtures must supply independent coverage when neighboring units are removed. G2's A11 fixture dependency on A05 caused its preserved failure. Do not lower row-coverage minimums to make a removal pass.
- An older harness's declared conditional fixture keeps its original IDs/counts and proves both with/without the new unit; declare any such change in both affected ROLLBACK files.
- Marker-shaped prose can be read as ownership. Write “Phase 12 (Part K)” or “the Lord Moon fix (LM7)”, not another unit's marker order in unrelated comments. Check remover boundaries and prefixes.
- A hidden element reports a zero geometry box. Inspect how older tests use it before changing visibility/removal; neither “always hide” nor “always remove” is a universal rule.
- Restacking an earlier revision changes later predecessors. Rebuild later branches and update exact hashes in all affected removers, tests and records before preview verification.
- Canonical source is fragments plus manifest; verify recombination in a scratch copy when verification writes output, preserving the frozen candidate.
- Git Bash's `timeout` is Windows `timeout.exe`; do not use it as a Unix wrapper. On this Windows setup, canonical-repo writes/git and packaged Python may require normal tool escalation; do not switch to a different clone to avoid that.
- Keep account-wide Codex usage separate from Claude. Last recorded go-live Codex reading: **35% five-hour / 69% weekly used at 12:46 UTC on 9 November**; it is historical, not the next session's available budget. G2's earlier Claude build was reported as about nine weekly points (84%→93%); no fresh Claude meter was read in this Codex chat. G3 has no agreed cost estimate yet.

The project's prior helper rule allows a read-only code reviewer and a failing-test investigator, not parallel builders or book readers. Apply the session's higher-priority tool/agent instructions if they differ. Do not use helpers to run concurrent browser jobs.

## 9. Explicitly parked and out of G3

- **A04.2, configured rows:** waits until the rules read pass is complete. Proposed one line is a filled choice badge far left, Change in Manage only, then the i explaining all choices; a chosen-option summary underneath. Say “Applied automatically” or “Reminder” in words. Bishamon's Clan-coloured note becomes plain summary text. Mockup first when that work is authorized.
- **Identity character check — Needs a choice:** future small rule in Phase 5 (Part J), using the sheet's own configuration-complete test to report every unfinished Advantage/Disadvantage. Not G3.
- **Remaining A11 observations:** Rings note 12 px right of its laptop label; Armor & TN information heading in Play and its bonus note 3 px below the field; Wounds first column 8 px right of caption. Recorded for later, not implicit G3 additions.
- **FU-15a-1**, the parked stats header, and **FT-59** (Clan mon/colour themes) remain parked.
- G4: A09/A10/A17/A18; G5: A08/A12; G6: A19/A20. No implementation of those groups, Combat redesign, tattoos, sync, career planning or Release 15b in G3.

Finish the agreed G3 process, record the owner's decisions, and hand off cleanly. Preparing this kickoff changes documentation only; G2 remains the live baseline.
