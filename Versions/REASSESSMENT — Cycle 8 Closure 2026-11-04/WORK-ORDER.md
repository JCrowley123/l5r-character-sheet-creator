# Work order — 4 November 2026

**Cycle 8 closed on the owner's instruction. Next build choice pending.**

This replaces the remaining-order forecasts in the 30 October work order. The owner has approved this reassessment, the Phase 15 design rulings and delivery rules; the recommendation below is not recorded as approval to start a build or merge. [Text ledger](../BUILD-LEDGER.md) · [Readable ledger](../BUILD-LEDGER.html) · [Roadmap](<../L5R Character Sheet Phased Roadmap reorder.md>).

## Cycle 8 closure

| Original step | Result at closure |
|---|---|
| 1 — Release 8a | Live 30 October: wizard XP warning, unchanged-sheet discard correction and waits that remain correct under load. |
| 2 — Release 8a.1 | Live 30 October after owner re-tests: quieter overspend and accurate open-choice note. |
| 3 — Phase 15 audit | Delivered 31 October; Q1–Q8 accepted 1 November. Audit only; no Phase 15 implementation. |
| 3a — Release 8b and 8b.1 | Live 2–3 November. Manage School-choice pickers, older free-Skill recognition and explicit starting-spell review. Owner accepted the corrected behavior on iPhone and Edge. |
| 3b — Reading and Release 8c | All 21 supported shugenja Schools read; owner device checks passed 3 November; live and verified 4 November. Future rank choices tracked automatically; missing older choices claimed explicitly. |

Release 8c's application is commit `919a5e35`, published through main `ef539f85`; production verification is recorded at `962782da`. Source SHA-256: `139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551` (17,525,378 bytes). [Release 8c handover and evidence](<../PART K — Phase 11.2.6 Rank Advancement Spell Choices/HANDOVER.md>).

Both planned full passes succeeded on their first executions: **6,774 candidate / 6,665 retained checks each**, with exact Release 8b.1 restoration and no reused results. Production passed 380 downloaded-application checks, 24 first-visit/offline checks and eight walkthrough checks. The earlier audit full-run failure, 8b pre-suite launcher failure and 8c under-load screening failures remain in their original records; closure does not relabel the whole cycle as failure-free.

No unresolved functional defect from the owner's Release 8 tests is recorded. Three presentation findings remain deliberately assigned to Phase 15a. Closing this cycle does not close Phase 15 or the whole project.

## Recommendation and choice

**Recommend Release 15a, beginning with A01 only.** The functional School-choice work is now stable, so the duplicate reminders can be corrected against the finished behavior. The later Phase 15 findings address the owner's observed phone usability problems. This continues the approved A01-first sequence and gives a visible, bounded change to compare before A02.

Optional step 4 was intended to use spare Claude allowance **before 4 November, 01:00 UTC**. That deadline has passed. The old allowance readings and November completion dates are historical, not a reason to interrupt Phase 15 now. FT-16 still has value, but is not a dependency of Phase 15.

| Choice | What would happen | Decision |
|---|---|---|
| Release 15a — A01 (recommended) | Investigate, build, qualify and present only A01. Owner tests before any progression to A02. | Awaiting owner |
| Optional step 4 — FT-16's first catalogue | First agree the named catalogue and current entry count, read its books, then deliver its cited descriptions as one independently removable release. | Available; not started or declined |

FT-16's first catalogue remains about **5 Claude planning points (3–8)** as a provisional allowance, included within its full **45 (30–60)** estimate, not added twice. Its catalogue has never been selected in the agreed records. Confirm its bounded scope and re-estimate from its actual entries before building; if selected, begin the reading at the start of a five-hour window.

## Updated remaining order

The original step numbers remain stable for reference. Release 15a and 15b are groups of separate finding deliveries, not two bundled builds.

| Step | Scope and gate | Provisional Claude planning points |
|---|---|---:|
| 4, optional | First FT-16 catalogue only if the owner chooses it; then return to step 5. | 5 (3–8), within FT-16 total |
| 5, first increment | A01: one reminder for each open School choice. Keep the sheet's cards; remove only duplicated reminders and retain unique Lore/Kiho/other notes, XP overspend and Finish confirmation. | 5 (3–8), within 15a total |
| 5, remaining 15a | A02–A12, A15–A20, one at a time; then 8b.1-UI-01, UI-02, UI-03 separately. A01 remains first. Each owner acceptance precedes the next build. | Whole 15a: 94 (58–150) |
| Cycle review after 15a | Review costs, device results, dependencies and group removal; republish records and confirm the next work order before 15b. | 4 (3–6) |
| 6 — 15b | Proposed sequence A14, B01–B14, B16, one at a time. Record this sequence as approved before its first build. | 57 (37–93) |
| 7 — corrections as needed | Correct device findings immediately after their originating increment, before moving on. This is a reserve, not a reason to defer known defects to the end. | 10 (6–18) |
| 8 — Phase 15 closure | Final combined and selective-removal evidence; republish ledger and reassess sync, a separate Manage screen and career planning against FT-16. | 4 (3–6) |
| 9 — FT-16 | Fuller own-words, book/page-cited descriptions for all Search entries; catalogue by catalogue, with a current inventory first. Reassess again at this cycle's end. | 45 (30–60), less any step 4 work |

**Before FT-16: approximately 169 planning points (107–273), excluding optional step 4. With the full FT-16 allowance: 214 (137–333).** These are broad planning scenarios, not an approved budget, measured Codex cost or calendar commitment. The remaining point estimate has increased because the owner's later rule requires separate investigation, qualification, comparison, acceptance and removal evidence for 37 possible work units, rather than two grouped releases. Reforecast after A01 and A02 using actual readings before treating the total as reliable. Accepted decisions to retain an existing design cost no implementation allocation.

## How the new estimate was made

The audit's earlier 20-point 15a and 12-point 15b estimates included grouped QA and cannot price individual delivery. Recent Claude records put 8a.1's two small layers at about 7 points and 7c.1's two at about 8, including qualification and follow-up. The following per-unit allowances are judgment-based estimates informed by those records, not measured rates:

| Unit type | Centre | Range | Includes |
|---|---:|---:|---|
| Small bounded presentation (S) | 3 | 2–5 | Investigation, isolated layer, required QA/removal, comparison/checklist and release records. |
| Multi-screen or interaction (M) | 5 | 3–8 | Same process, with broader behavior and device coverage. |
| Functional state or print (L) | 8 | 5–12 | State boundaries or print completeness plus the same delivery/removal process. |
| A18 native-device investigation (I) | 2 | 1–3 | Measurement and decision only. A demonstrated fix requires a revised scope/estimate first. |

Every implemented finding retains the required under-load screening, discovery, two planned full passes, negative proofs and owner device checks. No batching or weaker QA is assumed to make the estimate smaller. Individual and group removal interaction work is included in the ranges; unknown defects draw on the corrections reserve. The cycle-review allocations include final group evidence and records. Native-device availability and the owner's review pace determine elapsed time; no new completion date is promised.

### Finding inventory and allowances

There are **36 original audit findings: 34 work units and two retain-current-design decisions** (A13 and B15). Add the three separately recorded 8b.1 device follow-ups: **37 possible work units**, 21 in 15a and 16 in 15b. This does not renumber or expand the original audit to 39 findings.

| Group | Finding | Scope | Size | Centre (range) |
|---|---|---|---|---:|
| 15a | A01 | One reminder for each open School choice | M | 5 (3–8) |
| 15a | A02 | Floating controls cover the sheet | M | 5 (3–8) |
| 15a | A03 | Top-align columns and simplify long Skill cards | M | 5 (3–8) |
| 15a | A04 | A single accessible information pattern | M | 5 (3–8) |
| 15a | A05 | Make the limb picker fit the shared controls | S | 3 (2–5) |
| 15a | A06 | Separate grant actions and their state | S | 3 (2–5) |
| 15a | A07 | Align the Moon row | S | 3 (2–5) |
| 15a | A08 | Undo a burst of quick point changes | M | 5 (3–8) |
| 15a | A09 | Phone text entry and repeated taps | M | 5 (3–8) |
| 15a | A10 | Cross-page actions must move focus | M | 5 (3–8) |
| 15a | A11 | Space explanatory text below fields | S | 3 (2–5) |
| 15a | A12 | Collapse resistance choices into one line | M | 5 (3–8) |
| 15a | A15 | Court chips should be direct controls | S | 3 (2–5) |
| 15a | A16 | Remove the redundant bottom information button | S | 3 (2–5) |
| 15a | A17 | Fill the splash without cutting off the title | M | 5 (3–8) |
| 15a | A18 | Investigate the first Manage tap on an iPhone | I | 2 (1–3) |
| 15a | A19 | Undo the most recent Void-card spend | L | 8 (5–12) |
| 15a | A20 | Choose a Trait for one Skill roll | L | 8 (5–12) |
| 15a | 8b.1-UI-01 | Starting-spell review and action spacing | M | 5 (3–8) |
| 15a | 8b.1-UI-02 | Readable spell name and School attribution | M | 5 (3–8) |
| 15a | 8b.1-UI-03 | Separate Remove and Memorised | S | 3 (2–5) |
| 15b | A14 | Explain wound penalties once | S | 3 (2–5) |
| 15b | B01 | Use short thematic check labels | S | 3 (2–5) |
| 15b | B02 | State actual and catalogue price consistently | S | 3 (2–5) |
| 15b | B03 | Give Leadership a concise action label | S | 3 (2–5) |
| 15b | B04 | Avoid repeating Blind under Armor TN | S | 3 (2–5) |
| 15b | B05 | Keep success wording restrained | S | 3 (2–5) |
| 15b | B06 | Reduce repeated Clan and School prose | S | 3 (2–5) |
| 15b | B07 | Keep Search controls reachable while scrolling | M | 5 (3–8) |
| 15b | B08 | Clarify Search facets without discarding useful filters | M | 5 (3–8) |
| 15b | B09 | Refresh Skill picker Trait labels | S | 3 (2–5) |
| 15b | B10 | Remove old-name tags but retain search aliases | S | 3 (2–5) |
| 15b | B11 | Search must say four different Blackmail targets | S | 3 (2–5) |
| 15b | B12 | Make browser print complete and compact | L | 8 (5–12) |
| 15b | B13 | Move and update the colophon | S | 3 (2–5) |
| 15b | B14 | Separate Jigoku’s total from its calculation | S | 3 (2–5) |
| 15b | B16 | Keep a citation range together | S | 3 (2–5) |

The three follow-ups are: UI-01 review-picker consistency and action spacing; UI-02 readable spell names with any visible School cue kept short; UI-03 separate Remove and Memorised hit areas. Their detailed evidence and owner preferences remain in [the device-feedback record](<../Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/RELEASE-8B-1-DEVICE-FEEDBACK.md>). They follow A20 in this proposed order; moving them earlier requires an explicit recorded owner decision.

## End-of-project review and other remaining work

The 23 October R1–R27 rulings were checked against the subsequent release records. They are not a fresh batch of unanswered design questions.

| Item | Reassessment and placement |
|---|---|
| R1–R5, R7; R13–R17; R21–R23, R25–R26 | Their agreed implementation scope is live through Cycle 7 and its corrections. Keep the final whole-project review of Honour, Glory, Status and wound calculation as a validation of the finished app, not a second automatic rebuild. |
| R6, Phase 9's remaining controls/colophon, FT UI backlog | Mapped to the Phase 15 findings. R6 → A12; floating controls → A02; colophon → B13. No separate duplicate work package. |
| R8, sync, FT-02/FT-03 career/future planning | Reweigh at step 8 after Phase 15; no present evidence to displace the accepted UI work. Manage stays in place. Campaign work follows those later decisions and remains outside this order. |
| R9, R20, R27 | Closed decisions. Print from Characters already has Export to PDF; Kobune Captain retained after reading; Student of the Past and Uncentered cases closed. |
| R10 and R11 | Current Hotei automation and Station/shapeshifter references are live. Full Technique-wide Hotei automation and Station/shapeshifter rules remain after-project scope requiring book reading and approval. |
| R12 | FT-16 as step 9, subject to optional step 4 above. Approximately 1,500 was the historical count, not a freshly counted total. |
| R18 | FT-02/FT-03 are deferred; step 8 may reconsider their priority, not silently authorize them. |
| R19 / FT-08 | Keep the intermittent Spell Slots preview report open until the final project review; investigate on recurrence, otherwise close then as ruled. No recurrence is recorded in the reviewed release handovers. |
| R24 | Jurojin wording is live. Earlier rules-audit A03/A09 precepts stay after the project. Earlier rules-audit A14 bonus-slot spill remains parked and begins with owner walkthrough scenarios; it is a different A14 from Phase 15's wound wording. |
| Phase 0.7 Android | Seven owner/device checks remain whenever a suitable Android device is available; no build unless a check fails. |
| Older asynchronous-save race | Remains parked under the owner's 28 October ruling. Address before introducing slower/asynchronous storage; reassess as a sync dependency. |
| History when removing the audit-log layer | Recorded rollback limitation, not a new Phase 15 feature. Do not remove that layer without explicitly addressing preservation. |
| Blank imported sheet with only History; Kuni gift's fixed label | Existing recorded low-priority notes remain parked unless requested. No evidence here to promote them. |
| Sourcebook/wiki cross-check | Ancestor cross-check against the owner's two wikis remains waiting for permitted access; do not assert it was completed. |
| Phase 6 engine, app-size optimization, EPUB, Phase 10 Equipment | Still after-project or unscoped; excluded from totals. Sourcebooks and separate scope decisions required. |

## Delivery rules carried forward

[Accepted Q1–Q8](<../Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/PHASE-15-RULINGS-2026-11-01.md>) and [Phase 15 delivery/removal rules](<../Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>) remain binding. Do not reopen settled questions. Create implementation folders only when their finding starts; preserve the audit as evidence.

Each finding gets its own scope, predecessor/candidate, owned fragments/switches, tests, remover, rollback record, comparison and owner result. Removing an earlier finding must leave later accepted findings working; removing 15a must leave 15b; removing Phase 15 must preserve unrelated work and saved data. A declared shared dependency cannot silently narrow this promise.

One code reviewer after targeted checks and before full QA; a failing-test investigator only if a failure's cause remains unclear after a couple of tries. No helpers for records, building, planning or book reading. Fresh session per implementation increment, Remote Control and keep-awake as requested, usage readings at start/before full QA/end. Separate approval still precedes each production merge.

## Records, publication and usage

This reassessment updates the local ledger's Markdown and HTML, roadmap and append-only CLAUDE pointer. The first-increment [conditional kickoff](KICKOFF-15A-A01.md) is ready for the owner's next-step decision. No application or test source is changed and no full suite is rerun for these documentation changes.

The existing [published Claude ledger](https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk) was last confirmed refreshed on 31 October. The kickoff explicitly assigns that publication to Claude. No connected document session or Claude artifact publishing tool is available here. **Republishing that page remains pending**, with [a concrete handoff](PUBLISH-HANDOFF.md); local HTML is current. The same applies to replacing the old published work-order doc. Do not claim either external page has been refreshed.

Codex's first available reading during this reassessment was **43% five-hour / 68% weekly**, at approximately **03:26 UTC on 4 November**. It was taken after initial document reading, so it is not a complete start baseline. Model and effort are not exposed by the meter. These are shared-account readings; no exact cycle cost or Claude-equivalent cost is inferred. Claude's 28 October–4 November allowance and older completion forecasts are historical; its current allowance was not available here.

End-of-review reading at 03:36 UTC on 4 November: **65% five-hour / 72% weekly**. The earlier in-session reading was 43% / 68%; neither establishes an exact isolated task cost. Documentation links, both ledger updates and the unchanged application hash were checked. The readable work order was inspected at phone and laptop widths.

## Addendum — Claude publication and review, 4 November 2026

Published as the [Work Order — 4 November 2026](https://claude.ai/artifact/8TNMMcEhWh2mt57J5eY2AA) (a Claude Doc with a Decision field on both choices); the [30 October order](https://claude.ai/artifact/6gsmbucZtDssUvhSnQGFtB) links it, and the [ledger page](https://claude.ai/artifact/76wpQnwpk6gm6YSwns1PDk) is republished. The paragraph above saying publication is pending is history.

Claude's review added the work planned after this file was written (the owner's 1–4 November session, roadmap *PLANNED* entry) as step 8 candidates, outside the totals above:

| Candidate | Placement and gate | Rough points |
|---|---|---:|
| Combat tab, Method B ([plan](https://claude.ai/artifact/QMcfgBGEq14EoiYHtPatZc), FT-53 to FT-58 later) | Step 8 candidate, about 12 units under the Phase 15 rules. 15a's A02, A05, A12, A14 and A19 are built so it can reuse them. Reads Core's combat chapter first. | 80 (55–125) |
| Ronin, Method B, with Made ronin and Accepted back | Step 8 candidate. Its five open rulings in one batch first; Core p. 234 and Imperial Histories 1 p. 275 read. | 34 (22–50) |
| Tattoos, Method B | Step 8 candidate. A reading phase of every book and both wikis first, at a five-hour reset. | 30 (20–45) |
| Sync stage A: save-race fix, sync metadata, Save all / Merge | First candidate at step 8 (data safety). The save-race fix comes first; raised earlier if a character is lost. | 10 (7–15) |
| Sync stage B: Cloudflare D1 with passkey sign-in | After stage A; free tier, opt-in. | 32 (25–45) |
| Career planner (FT-03) with future options (FT-02) | Step 8 candidate; rules-based, no AI. | 28 (20–35) |
| PDF export | Nothing separate pending: Export to PDF and the original-sheet PDF are live; print's page count and Earth card are 15b's B12; each new feature carries its own print fields. | inside B12 |

Provisional step 8 order: sync stage A, the Combat tab, ronin and tattoos, the career planner, sync stage B, with FT-16 weighed against each. The recommendation is unchanged: A01 next.
