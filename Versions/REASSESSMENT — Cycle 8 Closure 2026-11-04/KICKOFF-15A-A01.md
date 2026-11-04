# Conditional kickoff — Release 15a, A01

Prepared 4 November 2026 after Cycle 8 closure. **Start only when the owner selects Release 15a/A01.** This file is prepared for that decision, not evidence it has been made.

## Baseline and read first

Use the canonical checkout C:/Users/jcrow/l5r-character-sheet-creator, never the OneDrive clone. Pull before starting and inspect local changes. Read the latest CLAUDE pointers and current ledger/roadmap summaries.

- [Current work order](WORK-ORDER.md).
- [A01 scope in the audit](<../Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/AUDIT.md>) (find the A01 heading).
- [Delivery and independent-removal rules](<../Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/PHASE-15-DESIGN-RULES.md>).
- [Settled Q1–Q8](<../Part H — Sheet UI-UX/PART H — Phase 15 UI Consistency Audit/PHASE-15-RULINGS-2026-11-01.md>).
- [8c handover](<../PART K — Phase 11.2.6 Rank Advancement Spell Choices/HANDOVER.md>) and [8b.1 handover](<../BUGFIX — Older School Choices/HANDOVER.md>).

Accepted baseline: Release 8c application 919a5e35, main production records 962782da, source 17,525,378 bytes, SHA-256 139e081092d4899d66563a362073ff594a4b6d00ac452fe0789328c8884a2551. Later documentation commits may advance main without changing those application bytes. Inspect the actual HEAD and byte hash before selecting a predecessor.

## A01 only

At wizard Review, display each unfinished School choice once. Keep the sheet's cards as the owner ruled; suppress only duplicates from the top Still to choose box. Retain unique Lore-subject, Kiho and other unfinished-choice reminders in the card presentation. Preserve XP overspend, Finish confirmation and all 8b/8c provenance, reward exclusion, starting-choice review and owed-rank behavior.

Begin with current-build reproductions for Kuni, Matsu Beastmaster and a monk with unique Lore/Kiho reminders; include complete choices, incomplete choices, and overspent states. Audit screenshots were taken before 8b/8c, so inspect today's code rather than assuming its old DOM.

Create the Phase 15 implementation umbrella in Part H when authorized, then Release 15a/A01 with its own inventory, comparison, acceptance and rollback records. Canonical fragments stay in Phase 0 src/sheet with independent switches/manifest entries. No A02 code or other follow-up may be bundled into A01. Prototype comparison and device checklist should show the immediately preceding accepted state alongside the A01 candidate.

Estimate: 5 Claude planning points, range 3–8, low confidence; Codex measured separately. If investigation changes scope materially or exposes an independence conflict, return a concrete revised scope before implementation.

## Verification and progression

Preserve every pinned check and negative proof. Use event completion for asynchronous waits, bounded hung-run ceilings, and correct observation windows for absence checks. Screen changed harnesses at 4× CPU, run one discovery, then the two planned fresh full passes. Investigate load failures before that qualification; never rerun a failed full suite merely to obtain green.

Use 8c's runner/evidence as the latest pattern. Discover and pin the current retained counts; do not copy 6,774 or 6,665 blindly because live-only leaves and release-specific retained sets differ. Never rebuild a tree while a test run reads it. Prove exact predecessor restoration and retained behavior with A01 removed. Record safe behavior without later A units so selective-removal promises remain possible.

One read-only code reviewer after targeted checks, before full QA. One failing-test investigator only if needed under the existing rule; no other helpers. Confirm Remote Control and keep-awake, take usage readings, keep CLAUDE's eight CR bytes. No motion redesign.

Provide the tested preview, plain iPhone Safari/Edge checklist, comparison and clear limits. Await owner acceptance before A02; await explicit go-live before a production merge, then verify downloaded live bytes, first-visit/offline behavior and changed controls.

Update ledger MD/HTML, roadmap, finding records and CLAUDE pointer. Record A01's actual cost and revise the remaining estimate with A02's later result. At the end of Release 15a perform the cycle reassessment before 15b. Phase 15 completion also requires group/whole-phase removal evidence, including 15b retained without 15a.
