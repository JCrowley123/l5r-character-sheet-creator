# Cycle 7a refinements — QA complete

Five follow-up layers implement the owner’s Edge/iPhone observations: campaign wound multipliers, compact characteristic controls, PDF field fit, an optional details appendix and named PDF save/print. The single review finding was fixed and its regression checks passed.

After correcting the QA harness version expectation and test scheduling, two fresh full QA runs passed: each candidate 6,301/6,301 across 145 suites; each retained 6,102/6,102 across 138 suites. No results reused. Removing the five layers restored main 6245576 byte for byte. The initial failed run (6,283/6,301) is retained; the first-pass goal was not met.

Merge and deployment require separate approval. Native Edge/iPhone save and print dialogs still require owner device checks on this build. The published ledger has not been refreshed.

| Layer | Own checks | Main / disabled | Removal safeguards |
|---|---:|---:|---:|
| Campaign wound multipliers | 31/31 | pinned failures | 6/6 |
| Compact characteristic controls | 33/33 | 1/33 pass each | 6/6 |
| PDF field fit and rules | 17/17 | 1/17 pass each | 6/6 |
| Optional details appendix | 15/15 | 1/15 pass each | 6/6 |
| PDF save and print | 30/30 | 1/30 pass each | 6/6 |

All pinned negative variants matched. Affected older checks passed before review; the verified review correction was followed by 143/143 export/toolbar checks and all five removal proofs. Full runs use installed Chrome, sequential suite execution, mains power and a held-awake screen. Successful-run evidence is under qa/final-run-2 and qa/final-run-3 when complete. The initial failed run remains under qa/final-run-1; it exposed a missed nested save-format oracle, inherited splash bypass and a rotation-test ordering race. Focused corrections preserve every assertion and production bytes. The first full suite was launched only after the review fix and preflight checks.

Candidate: 17,336,656 bytes, SHA-256 `4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f`, build commit b4fca4f. Removing these five layers restores 17,296,865 bytes, SHA-256 `7781e1a2ff0c6f58dbfa742843a27dac8b53ca84d8f2ecfb24bb15c6fc166f0b` (main 6245576).

[Device checklist](Device-Checks.html) · [Official sheet comparison](Official-Sheet-Comparison.md) · [Single review](qa/code-review.md)

The save picker/share API paths use doubles in automated checks. Real native save/share/print dialogs remain a device-check item. The optional appendix defaults off in the UI and has its own switch and removal script. Required notes/overflow remain available without it.

Codex only: the original approved stage crossed a reset (conservative carry recorded as 13 points, stopped around 36). Extensions used the account-wide weekly meter from 24 to 39, then 41 to 49 (reported at 46). The next extension began at 50 with report/cap 55/58; it was reported at 56, but the next reading during monitoring was 63, exceeding the cap. The owner was informed that meter checks were too infrequent. Final records received separate approval for 1–2 points: baseline 64, report 65, cap 66; latest recorded reading 64. These readings are account-wide proxies, not exact task billing; no reset credit was used.
