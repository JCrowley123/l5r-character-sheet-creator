# Phase 15 — incremental delivery and independent removal

**Owner-approved delivery rules, 1 November 2026. Applies to Claude, ChatGPT/Codex and any later contributor implementing or removing Phase 15 work.**

The owner wants to see, compare and accept each finding's change before the next is built. Every finding, each release group and the whole phase must be independently removable while preserving the remaining accepted work.

This document records the owner's delivery and reversibility decision. It supersedes the audit's suggestion that several findings could be combined into shared implementation layers. The subsequent owner approval on 1 November accepts Q1–Q8 as recommended; see [the accepted rulings](PHASE-15-RULINGS-2026-11-01.md). Those questions are settled. This delivery rule still governs the approved scope; implementation has not started and the 8b/8c work order and merge approval requirements remain unchanged.

## 1. Organization and stable identifiers

Treat Phase 15 as an umbrella containing two release groups, with one separately owned implementation unit per finding:

| Group | Finding units | Count |
|---|---|---:|
| Release 15a | A01–A12, then A15–A20 | 18 |
| Release 15b | A14 and B01–B14, B16 | 16 |
| Recorded retain-current-design decisions | A13 (wound settings location), B15 (Library book dropdown) | 2 |

There are 36 audit findings: 34 proposed work units and two retain-current-design recommendations. A14 remains a stable finding ID in release 15b; do not renumber it to hide the distinction. The eight audit questions are design/scope decisions, not eight more work units.

The implementation directory organization follows the owner's hierarchy:

- Phase 15 umbrella
  - Release 15a
    - A01 — its scope, owned code/layer inventory, QA, comparison, acceptance record and removal instructions
    - A02 — the same
    - Continue through the remaining 15a findings
  - Release 15b
    - One equivalent folder for each assigned finding

Keep the existing audit folder as the evidence and decision record. Create implementation folders only when their work begins, under a clearly named Phase 15 implementation umbrella in Part H. Preserve the centralized Phase 0 fragment/manifest architecture: a finding's folder identifies every fragment, switch and registry entry it owns even when the canonical fragment lives in src/sheet. This Phase 15-specific hierarchy is the owner's agreed organization.

Here, 15a and 15b are groups of independently accepted increments. They do not require all their findings to be built before the owner can test one. Any actual merge to main remains a separately authorized release under the project's existing definition.

## 2. One finding at a time

For each finding:

1. Investigate the current behavior and define the smallest complete change, its affected screens, applicable rulings, dependencies and removal boundary.
2. Build only that finding's approved scope as isolated removable code. A finding may need several internal layers, but they form one named acceptance/removal unit.
3. Run the required checks, including retained behavior and removal checks. Preserve the project's pinned counts, negative variants, under-load checks and first-pass full-suite rule; this delivery decision does not weaken or waive them.
4. Provide the owner with a usable version to test, a clear description of what changed, the immediately preceding accepted state for comparison, and a plain test checklist. Identify the candidate and predecessor by commit/build.
5. Wait for the owner's decision: accept it, revise it, or remove/decline it. Record the decision and any follow-up.
6. Proceed to the next finding only after that decision permits progression. Do not silently build ahead, batch findings together or treat silence as acceptance.

Begin with A01 when Phase 15 implementation is authorized, then work through release 15a in finding order, skipping A13/A14 because they have the dispositions above. Complete the owner's decisions for release 15a before starting release 15b. Within 15b, preserve A14's identity and record the chosen sequence before its first step.

Each step must be independently reviewable. A preview and successful automated tests do not substitute for the owner's acceptance.

## 3. Isolation is an engineering requirement

- Keep each finding behind its own named switch or set of switches, with uniquely owned fragments and manifest entries. Wrap existing behavior according to the project's removable-layer rules instead of rewriting earlier layers.
- Record exact file/fragment ownership and any hooks in the finding's inventory. Keep its tests, remover, removal tests, rollback instructions and registry mapping discoverable from that folder.
- Keep one finding's implementation separate from another's. A later finding must tolerate an earlier finding being absent; release 15b must work with release 15a removed.
- Declare dependencies before building. Use existing stable interfaces or safe fallbacks so removing one finding does not disable another. If independence cannot be achieved within the proposed scope, surface that conflict before implementation and obtain an explicit owner decision; do not silently narrow the removal promise.
- Any genuinely shared support needs explicit ownership, independent removal rules and approval as part of the affected scope. Do not hide one finding's code in another or leave supposedly removed code behind as an undeclared dependency.
- Preserve character data. Removing a UI/behavior layer must not delete saved characters or unrelated fields/history. Document compatibility of any data introduced by the finding and provide a reversible migration where needed.

Folders organize the work. Switches, ownership, dependency handling and tested removers make it independently reversible.

## 4. Meaning of removal requests

| Owner request | Required result |
|---|---|
| “Remove A11” | Remove A11's owned behavior/code and integration entries, preserving every other retained finding and unrelated feature. |
| “Undo release 15a” / “Delete all code from release A of Phase 15” | Remove all 15a units; keep 15b working if it is present, together with unrelated work and character data. |
| “Undo release 15b” | Remove all 15b units while preserving 15a and unrelated work. |
| “Undo Phase 15” | Remove both release groups and any exclusively Phase 15 support, preserving unrelated changes made before, during or after the phase and preserving character data. |

Implement these as explicit, documented removal operations. Deleting a folder or reverting an old commit alone is not sufficient if hooks, registrations or later dependencies remain.

Follow the existing scratch-tree safety rule: removers refuse the live source tree. Validate the selected removal in an isolated tree, then prepare the resulting source/build for review and the normal merge process. Keep the audit, decisions and removal evidence as history; removing app behavior does not erase the record.

## 5. Prove removal after later changes exist

- Test each finding enabled and disabled, with all unaffected behavior retained.
- Test removal of a finding while later accepted findings remain. In particular, an A11 removal must not require first removing A12 or subsequent work.
- Test each whole release group removed, including 15a absent while 15b is retained.
- Test removal of the whole phase while unrelated later work remains.
- For a simple reversal to an exact predecessor, require byte-identical restoration as the project already does. For selective removal with later work retained, compare to the defined build containing exactly the retained layers and run their regression checks; do not discard later work merely to reproduce an old hash.
- Revisit affected removal checks whenever a new finding introduces an interaction. Preserve negative proofs and fail clearly on undeclared dependencies.

This does not require testing every mathematical combination of switches. It requires evidence for the promised individual/group/phase removal operations and each declared interaction.

## 6. Completion and records

Each finding's record must identify its scope, predecessor, candidate, owned layers, verification, owner result and removal instructions. Explicitly declined findings are recorded as decisions, not claimed as implemented fixes.

Release 15a is complete when its finding decisions and required checks are complete; release 15b follows the same rule. Phase 15 is complete when every finding is accepted or explicitly declined, the final combined app passes required checks, and individual/group/phase removability has been demonstrated. A13/B15 retain-current-design decisions must also be recorded.

The original 15a/15b estimates assumed grouped delivery. Re-estimate for these individual investigation/build/test/acceptance cycles before implementation; do not present the old totals as an estimate for this new process. Keep allowance accounting separate for Claude and Codex.

Refer to this document from future Phase 15 kickoffs, implementation handovers and removal requests. If a later owner ruling changes it, date and record that change explicitly.

## Source of this decision

Owner conversation, 1 November 2026: Phase 15 contains release A and release B, each finding is a separate unit; investigate/build A01, let the owner test and decide, then A02 onward; complete A before B; allow removal of A11, all of A, or all of Phase 15 while preserving everything else. The owner then explicitly requested that these rules be saved for future Claude/ChatGPT reference.
