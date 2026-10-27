# Cycle 7a refinements — QA running

Five follow-up layers implement the owner’s Edge/iPhone observations: campaign wound multipliers, compact characteristic controls, PDF field fit, an optional details appendix and named PDF save/print. The single review finding was fixed and its regression checks passed.

The first full candidate run failed: 6,283/6,301 checks passed, four suites failed (18 checks). All 126 new-layer checks passed. Retained checks and the second run did not start. No result was reused or rerun. Investigation and two successful fresh full runs remain outstanding; the first-pass goal was not met.

Merge and deployment require separate approval. Native Edge/iPhone save and print dialogs still require owner device checks on this build. The published ledger has not been refreshed.

| Layer | Own checks | Main / disabled | Removal safeguards |
|---|---:|---:|---:|
| Campaign wound multipliers | 31/31 | pinned failures | 6/6 |
| Compact characteristic controls | 33/33 | 1/33 pass each | 6/6 |
| PDF field fit and rules | 17/17 | 1/17 pass each | 6/6 |
| Optional details appendix | 15/15 | 1/15 pass each | 6/6 |
| PDF save and print | 30/30 | 1/30 pass each | 6/6 |

All pinned negative variants matched. Affected older checks passed before review; the verified review correction was followed by 143/143 export/toolbar checks and all five removal proofs. Full runs use installed Chrome, sequential suite execution, mains power and a held-awake screen. Their summaries and leaf logs are under qa/final-run-1 and qa/final-run-2. The first full suite was launched only after the review fix and preflight checks.

Candidate: 17,336,656 bytes, SHA-256 `4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f`, build commit b4fca4f. Removing these five layers restores 17,296,865 bytes, SHA-256 `7781e1a2ff0c6f58dbfa742843a27dac8b53ca84d8f2ecfb24bb15c6fc166f0b` (main 6245576).

[Device checklist](Device-Checks.html) · [Official sheet comparison](Official-Sheet-Comparison.md) · [Single review](qa/code-review.md)

The save picker/share API paths use doubles in automated checks. Real native save/share/print dialogs remain a device-check item. The optional appendix defaults off in the UI and has its own switch and removal script. Required notes/overflow remain available without it.

Codex only: the original approved stage crossed a reset (conservative carry recorded as 13 points, stopped around 36). The next extension used the account-wide weekly meter from 24 to 39. This final extension began at 41, reported at 46 and is currently 49, with a cap of 49. These are account-wide proxies, not exact task billing; no reset credit was used.
