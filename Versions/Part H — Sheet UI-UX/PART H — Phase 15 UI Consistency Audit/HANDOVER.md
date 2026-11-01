# Phase 15 audit handover

**Owner ruling added 1 November 2026:** Read [PHASE-15-DESIGN-RULES.md](PHASE-15-DESIGN-RULES.md) before implementation. Phase 15 is delivered one finding at a time, with owner comparison/testing and acceptance before progression. Each finding, release group and the whole phase must be removable while preserving later retained work and character data. This supersedes the audit’s shared-layer/grouped-delivery assumptions; re-estimate before building. The original audit and QA evidence below remain historical.

31 October 2026. Branch: codex/phase-15-audit-2026-10-31. Canonical checkout: C:/Users/jcrow/l5r-character-sheet-creator. No app build, merge, deployment or next work-order step authorized by this audit.

## Deliverable

[AUDIT.html](AUDIT.html) is self-contained for phone/offline reading. [AUDIT.md](AUDIT.md) contains the same findings, complete disposition of FT-01–FT-52 and unnumbered parked items, proposed scopes and one batch of Q1–Q8. Original screenshots and both generated PDFs are retained.

36 findings. Proposed planning estimates on the existing Claude-point scale: 15a **20 (15–27)** including separately removable FT-24 Void Undo and FT-28 one-roll Trait choice; 15b **12 (9–16)**. Estimates, not measured Codex usage. Without those two functional items, 15a's centre is 15. Owner rulings pending.

Kuni/Matsu Review messages repeat, but the monk's Lore subject and Kiho reminders can appear only in the top box. Suppress actual duplicates; preserve unique reminders as cards. The completed 8a.1 overspend behavior stays intact.

## QA: first-pass requirement was not met

- Nine-harness 4× CPU preflight: 345/345.
- Discovery: 6,673/6,673.
- Full run 1: candidate 6,673/6,673; retained 6,579/6,579; no reused leaves; exact restoration to 8a.
- Full run 2: failed. Spell Names leaf 140 timed out waiting for page load; zero of its 16 checks ran. The other 6,657 checks completed. Later count errors follow from that missing leaf. Retained run 2 never started.
- **No full-suite retry followed the failure.** Original reports remain in qa/final-run-1, qa/final-run-2 and qa/chain-result.json.
- [Investigation](qa/investigation/INVESTIGATION.md): controlled stalls demonstrate the external font/stylesheet startup dependency. The original run has no network trace, so its exact stalled request is unknown.
- One QA-only change in Versions/BUGFIX — Spell Names Match the Books/qa/spell-names-harness.js: abort only the two Google Fonts hosts before navigation. Keep load and ready barriers, all 16 assertions, all negative pins and the timeout. No shared runner/visual policy changed.
- Edited file directly verified at 4× CPU: 16/16; baseline plus six mutants retained their exact failure sets and each ran 16 checks. [Proof](qa/investigation/fixed-proof.json). No post-fix full qualification claim.

The single-use orchestration refuses to overwrite its chain result. Do not erase it or relabel a failed run to recover a first-pass label. A later authorized release must perform normal new-candidate preflight and full verification.

## Application identity and limits

Starting main: 2a3bdf23; app Release 8a.1 built at 5bfcb18e.

- App SHA-256: a25ace916f29d5c1647731db0ab2d7e97bd23bbdd6312c9631bd9d4ba416c7f2
- App bytes: 17459752
- Retained 8a SHA-256: 2a9f66ed444f50b001ef0b670ea71cb370fc65fc24146ddf9cd1a7ce1f4a2084
- Retained bytes: 17452358

No sourcebook text added. Dense fixtures exercise layout, not character legality. Captures use phone emulation and desktop Chromium; native iPhone/Edge acceptance is not claimed. Capture fonts were fallback; elevated QA separately loaded real Google Fonts. Owner reports not freshly reproduced are identified.

## Records and next step

Ledger MD/HTML parts 1–4 and 6, roadmap work order and one appended CLAUDE pointer updated. CLAUDE must keep exactly eight CR bytes. Historical records and pre-existing untracked QA files must not be staged. The published Claude ledger is unchanged; its next republish is the reassessment after Phase 15.

Owner reviews Q1–Q8 as one batch. The kickoff says “Begin each step only on the owner's approval of its scope”; next is step 3a, Release 8b, after its own scope approval in a fresh session. 8c follows its book reading. Do not start 15a/15b from this audit alone, or merge this branch to main without the owner's word.

## Usage and Remote Control

Start and pre-full readings unavailable. Late account readings: 17:56 UTC, five-hour 77% used / weekly 29%; 23:24 UTC, five-hour 8% / weekly 34%. Final recorded reading 23:27 UTC: five-hour 21% / weekly 36%. Seven weekly points since 17:56 are not the whole step's cost. No reset credit used by the agent. Model GPT-6 family; exact product model/effort unavailable. See qa/usage-readings.json for final readings.

Remote Control **unverified**. Computer-use app access timed out; owner confirmation of desktop Settings → Connections requested. Do not claim phone continuation is ready without confirmation.
