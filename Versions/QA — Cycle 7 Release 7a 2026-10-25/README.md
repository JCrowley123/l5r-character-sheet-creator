# Cycle 7a — merged and verified live

Cycle 7a was fast-forward merged into main and deployed on 25 October 2026, at release commit 3d014bb. All 129 new checks passed on the downloaded production files; a fresh production-browser check passed 9/9, including offline reload. Owner iPhone checks remain Not run.

R1–R4 implement social Rank/points, Taint growth, Imperial Scion eligibility and whole Honour Rank resistance. The owner's added PDF scope uses the original L5RCM blank sheets. **Recognition by your lord** is one replaceable label; phone pips use a separate row.

## Notice-only packaging, 25 October

Local release preparation is complete. The current build is 17,296,865 bytes, SHA256 `7781e1a2ff0c6f58dbfa742843a27dac8b53ca84d8f2ecfb24bb15c6fc166f0b`. A dependency-notice comment is the only difference from the full-suite build below; removing it restores that tested file byte for byte. Final packaged-file checks pass: PDF 41/41, rollback 6/6, packaging 11/11. The full suites were not repeated for this non-executing comment. See [packaging evidence](../BUGFIX%20%E2%80%94%20Template%20PDF%20Export/qa/dependency-packaging.md). At that packaging checkpoint, no merge or deployment had occurred; the deployment update below supersedes that status.

## Evidence

Each fresh pass: candidate 6,175/6,175 (140 leaf suites), retained 5,973/5,973 (131 leaf suites), zero reused results. Removing all five layers restored Release 6a byte for byte.

| Fresh run | Candidate | Retained | Exact restoration | UTC window |
|---|---:|---:|---|---|
| [Attempt 2](qa/final-run-2/summary.json) | 6,175/6,175 | 5,973/5,973 | Yes | 15:27–16:02, 25 October |
| [Attempt 3](qa/final-run-3/summary.json) | 6,175/6,175 | 5,973/5,973 | Yes | 16:02–16:36, 25 October |

Full-suite candidate SHA256 (before the notice comment): `3ebb03d7fb19b6fe7ac5dcf7fa075b9d3304a2e7b73ab0f0c44b5ea854f7c222`; 17,216,782 bytes. Restored SHA256: `221d38e0b428b10c2f697e88b893cf40bae720dbe0c3b7afab514f8dd6cd4466`; 7,979,570 bytes.

Own layer checks: social 30, Taint 26, Scion 12, Honour resistance 20, PDF 41. Each layer has its own baseline failure, pinned variants and exact removal evidence. The [single read-only review](qa/code-review.md) finished before full QA; both verified findings were fixed. No second reviewer was used.

Browser jobs ran sequentially on installed Chrome, on mains power with system/display sleep held off. Leaf timeouts and real historical wrapper checks remain enforced; aggregate wrapper deadlines are not duplicated. Resume is rejected. Seventeen changed older harnesses are explicitly listed in `current-suite-runner.js`. The retained runner excludes 73 deployment checks; these are local deployment-build checks, not proof of the live site.

## First attempt, retained honestly

The first full attempt failed in the older Heart of Vengeance harness: its provider whitelist and broad option selectors did not account for the new controls. Only the harness was adapted; its assertions, geometry limits and 91-check count were preserved. Candidate and baseline then passed 91/91 before fresh full attempts 2 and 3. This was not a first-time pass.

See [the diagnosis](qa/full-run-1-findings.md), `qa/final-run-1`, and `qa/heart-candidate.log` / `qa/heart-baseline.log`.

## Owner review and release boundary

Use [Device Checks](Device-Checks.html). All owner results start **Not run**. Safari/device behavior remains unverified by the owner; desktop automation is not an iPhone pass.

The PDF uses original template bytes, searchable text and continuation pages. Ordinary Print remains available. The owner supplied private confirmation covering all eight templates under GPLv3; see [the confirmation record](template-owner-confirmation.md). The separate template-permission question is closed. Dependency notice packaging is complete; the evidence above records the new distribution hash. Build size rose from about 8.0 MB to 17.2 MB; device loading cost is unmeasured.

The owner approved merge and deployment. Main was pushed and live verification passed; see DEPLOYMENT.md. Owner device results and the separate published-ledger refresh remain pending.

## Allowance

Codex only, separate from Claude: the work crossed meter resets and several approved continuation stages. A reconciled whole-cycle cost is unavailable; account-wide readings are not task billing. The final records stage used five observed account-wide points (21% to 26% weekly), reaching its stop line. No reset credit was used.

Final artifact checks: the guide has ten result dropdowns, correct JSON download content and no horizontal overflow at 390px. All owner results remain Not run. The final Chuda PDF contains the chosen Fire (except Maho) deficiency, no AcroForm/widgets, and its rendered field was visually inspected. No application code changed.

## Deployment, 25 October

Cycle 7a was fast-forward merged into main and deployed on 25 October 2026, at release commit 3d014bb. All 129 new checks passed on the downloaded production files; a fresh production-browser check passed 9/9, including offline reload. Owner iPhone checks remain Not run. See [deployment evidence](DEPLOYMENT.md). Earlier pending statements describe the pre-merge checkpoints. The published ledger remains separate.
