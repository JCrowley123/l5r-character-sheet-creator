# Remove PART F — Phase 0.6.3 Offline Notice After the Splash

Set `NOTICE_AFTER_SPLASH_ENABLED` (in `PART F — Phase 0.6 Installable Web App/src/head-pwa.html`) to `false` and
deploy: the "Ready to use offline" notice shows as soon as the worker says so again, under the splash on a first visit.
Characters are untouched.

## Surgical removal

| Location | Owned item |
|---|---|
| `PART F — Phase 0.6 Installable Web App/src/head-pwa.html` | `notice-after-splash-helper`, `notice-after-splash` |

Each block begins `// PART F PHASE 0.6.3 BEGIN <slug>` and ends `// END NOTICE063 <slug>`.

1. Copy the Phase 0.6 folder to a scratch directory (the remover refuses the live folder).
2. `python -B qa/remove-phase.py <scratch copy> --dry-run`, inspect, then run it without `--dry-run`, adding
   `--expect-sha db49de8b94ed93f30242c7d1cd5f1a595c86eaf4713b130ee41027ed324a6be4` (`head-pwa.html` at main `b54c13b`).
3. Build the site from the result and run Phase 0.6's harnesses, then apply the same removal to the working branch and
   delete this folder (and its line in the Release 5b suite's `notice-checks.js` / `current-suite-runner.js`).

## Dependencies

- **Phase 0.6:** the notice this holds. **Phase 0.6.2 Splash Screen:** looked for by its element only (`#l5rSplash`);
  without the splash the notice shows at once. Nothing depends on this layer.
