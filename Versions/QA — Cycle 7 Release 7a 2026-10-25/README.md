# Cycle 7a — local verification complete

Cycle 7a is built and has passed local QA twice. Merge, live verification and owner device checks remain pending.

R1–R4 implement social Rank/points, Taint growth, Imperial Scion eligibility and whole Honour Rank resistance. The owner's added PDF scope uses the original L5RCM blank sheets. **Recognition by your lord** is one replaceable label; phone pips use a separate row.

## Evidence

Each fresh pass: candidate 6,175/6,175 (140 leaf suites), retained 5,973/5,973 (131 leaf suites), zero reused results. Removing all five layers restored Release 6a byte for byte.

| Fresh run | Candidate | Retained | Exact restoration | UTC window |
|---|---:|---:|---|---|
| [Attempt 2](qa/final-run-2/summary.json) | 6,175/6,175 | 5,973/5,973 | Yes | 15:27–16:02, 25 October |
| [Attempt 3](qa/final-run-3/summary.json) | 6,175/6,175 | 5,973/5,973 | Yes | 16:02–16:36, 25 October |

Candidate SHA256: `3ebb03d7fb19b6fe7ac5dcf7fa075b9d3304a2e7b73ab0f0c44b5ea854f7c222`; 17,216,782 bytes. Restored SHA256: `221d38e0b428b10c2f697e88b893cf40bae720dbe0c3b7afab514f8dd6cd4466`; 7,979,570 bytes.

Own layer checks: social 30, Taint 26, Scion 12, Honour resistance 20, PDF 41. Each layer has its own baseline failure, pinned variants and exact removal evidence. The [single read-only review](qa/code-review.md) finished before full QA; both verified findings were fixed. No second reviewer was used.

Browser jobs ran sequentially on installed Chrome, on mains power with system/display sleep held off. Leaf timeouts and real historical wrapper checks remain enforced; aggregate wrapper deadlines are not duplicated. Resume is rejected. Seventeen changed older harnesses are explicitly listed in `current-suite-runner.js`. The retained runner excludes 73 deployment checks; these are local deployment-build checks, not proof of the live site.

## First attempt, retained honestly

The first full attempt failed in the older Heart of Vengeance harness: its provider whitelist and broad option selectors did not account for the new controls. Only the harness was adapted; its assertions, geometry limits and 91-check count were preserved. Candidate and baseline then passed 91/91 before fresh full attempts 2 and 3. This was not a first-time pass.

See [the diagnosis](qa/full-run-1-findings.md), `qa/final-run-1`, and `qa/heart-candidate.log` / `qa/heart-baseline.log`.

## Owner review and release boundary

Use [Device Checks](Device-Checks.html). All owner results start **Not run**. Safari/device behavior remains unverified by the owner; desktop automation is not an iPhone pass.

The PDF uses original template bytes, searchable text and continuation pages. Ordinary Print remains available. The owner supplied private confirmation covering all eight templates under GPLv3; see [the confirmation record](template-owner-confirmation.md). The separate template-permission question is closed. Dependency licence packaging remains a separate release task. Build size rose from about 8.0 MB to 17.2 MB; device loading cost is unmeasured.

No push, merge, live deployment or published-ledger update is claimed. The kickoff requires the owner's word before merge or pushing main. After that: compare deployed HTML/service worker with this build, run new harnesses on deployed files, collect device results, then republish the ledger after reading the published page in full.

## Allowance

Codex only, separate from Claude: the work crossed meter resets and several approved continuation stages. A reconciled whole-cycle cost is unavailable; account-wide readings are not task billing. The final records stage used five observed account-wide points (21% to 26% weekly), reaching its stop line. No reset credit was used.

Final artifact checks: the guide has ten result dropdowns, correct JSON download content and no horizontal overflow at 390px. All owner results remain Not run. The final Chuda PDF contains the chosen Fire (except Maho) deficiency, no AcroForm/widgets, and its rendered field was visually inspected. No application code changed.
