# Cycle 7a — merged and verified live

Cycle 7a was fast-forward merged into main and deployed on 25 October 2026, at release commit 3d014bb. All 129 new checks passed on the downloaded production files; a fresh production-browser check passed 9/9, including offline reload. Owner iPhone checks remain Not run.

Live app: https://l5r-character-sheet-creator.pages.dev/

- Page: 17,303,642 bytes; SHA256 `b176ba34c8b42faaf907f00b1a3acf3ecf9e4596f1b0182f0443a9f6a12d230e`.
- Service worker: build `2b00bad30c0ee695`; SHA256 `73da2f03ca584e9d53d27fd81b7ad55685f57a89bd19b7084406c627daac333b`.
- Page, service worker, manifest and all four icons match the committed release bytes. Verified at 2026-10-25T21:44:04.211960+00:00.
- Seven feature harnesses ran once on the downloaded files: social 30, Taint 26, Scion 12, Honour resistance 20, PDF 22 + 15 + 4 = **129/129**.
- Fresh desktop Chrome at 390px: production HTTP response/hash, app initialization, PDF enabled, service-worker control, offline response/hash/initialization and no uncaught errors: **9/9**. This is not an owner iPhone pass.

## Evidence and qualifications

`qa/live/live-verification.json`, `qa/live/live-qa.log` and `qa/live/live-browser-smoke.json` hold the results. The seven feature harnesses had no failures. The independent browser smoke needed a capture-tool correction: two initial attempts returned HTTP 200 but Chrome evicted the large response from its inspector cache. They are preserved as attempt1/attempt2. Reading through the same CDP session configured with a 128 MiB per-resource / 256 MiB total buffer passed every original assertion. No app code changed. The deployment verifier also had a setup syntax error before any network or feature checks; it was corrected and syntax-checked before execution.

The Windows working-tree manifest uses CRLF (932 bytes); the committed manifest uses LF (892 bytes). This alone explains why the earlier local service-worker ID differs. Live verification computes from Git blobs and validates the actual downloaded assets; the production ID above is authoritative. Both standalone and deployed HTML retain their previously recorded hashes.

The two full-suite passes remain attached to the pre-notice hash, with exact byte equivalence after removing the non-executing notice comment. No further full run or reviewer was used for deployment. Owner template confirmation remains settled. Original backup/stash are untouched.

## Next

Complete [Device Checks](Device-Checks.html) on the owner's iPhone. The local ledger is updated; its separate published copy remains pending and must be read in full before republication. Cycle 7b/7c and Phase 15 retain their agreed scope.

Codex deployment stage began at 42% weekly, with a 47% cap; readings are account-wide, not isolated billing. No reset credit used. Claude's allowance records are unchanged.
