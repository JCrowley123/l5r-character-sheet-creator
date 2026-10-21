# Remove PART F — Phase 0.6.1 Newest Version First

Set `NEWEST_FIRST_ENABLED` (in `PART F — Phase 0.6 Installable Web App/src/sw.js`) to `false` and deploy: every open
answers from the saved copy again and the first open after a release shows the previous one. Characters are untouched
(the worker never stores them).

## Surgical removal

| Location | Owned item |
|---|---|
| `PART F — Phase 0.6 Installable Web App/src/sw.js` | `newest-first-helper`, `newest-first` |
| `PART F — Phase 0.6 Installable Web App/qa/update-harness.js` | `newest-first-update-check` |
| `PART F — Phase 0.6 Installable Web App/qa/pwa-harness.js` | `online-sections`, `offline-sections-check` |
| `BUGFIX — Service Worker Redirected Page/qa/test-removal.py` | `later-layers-first` (a Python comment block) |
| `BUGFIX — Service Worker Redirected Page/qa/sw-redirect-harness.js` | `sections-expected`, `sections-check`, `sections-online` |

Each block begins `PART F PHASE 0.6.1 BEGIN <slug>` and ends `END NEWEST061 <slug>`.

1. Copy the Phase 0.6 folder, and the redirect fix's `qa/test-removal.py` and `qa/sw-redirect-harness.js`, to a
   scratch directory (the remover refuses the live files).
2. `python -B qa/remove-phase.py <scratch Phase 0.6 copy> --fixture <test-removal.py> --fixture <sw-redirect-harness.js> --dry-run`, inspect,
   then run it without `--dry-run`, adding `--expect-sha 0e75a84d3726ffe1ee6c687ee8264acd84d9771160d815e95ee2921741ba14f2`
   (`sw.js` at main `31be9e5`).
3. Run Phase 0.6's `pwa-harness.js` and `update-harness.js` and the redirect fix's suites on a build of the result,
   then apply the same removal to the working branch and delete this folder.

## Dependencies

- **Phase 0.6:** the worker this changes. **BUGFIX — Service Worker Redirected Page:** sits under this layer in
  `sw.js`; remove this layer first.
