# PART F — Phase 0.6.3 Offline Notice After the Splash

Cycle 5, Release 5b. The owner's yes of 22 October 2026: Phase 0.6's one-time "Ready to use offline" notice waits until
the splash screen has gone, so it is seen.

## What it changes

Since Release 5a.2 the splash stays at least 5 s (z-index 2147483000). Phase 0.6's notice (z-index 9999) shows for 3.2 s
as soon as the worker has saved the site, once per device, so on a first visit it usually played out under the splash
and was never seen again.

Two blocks in `PART F — Phase 0.6 Installable Web App/src/head-pwa.html` (switch `NOTICE_AFTER_SPLASH_ENABLED`):

- `notice-after-splash-helper`: `holdForSplash(show)`. While `#l5rSplash` is on the page it watches the splash's parent
  (`MutationObserver`, children only) and calls `show` once the splash has been removed; otherwise it returns `false`.
- `notice-after-splash`: the first line of `announceOfflineReady()`. A held notice returns and is called again after
  the splash, so the once-per-device mark (`l5r-offline-announced`) is saved only when the notice really shows.

It looks only for the splash on the page, never at the splash layer's switches (`SPLASH_ENABLED`,
`__L5R_SPLASH_FAST__`): with no splash (removed, or a page without one) the notice shows at once, as before. A second
"ready" message while held adds no second watcher, so private browsing (no saved mark) still shows one notice.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/notice-harness.js` (built site; real splash; the ready message sent by hand, plus a real first visit) | **12/12** |
| The same harness with main's `head-pwa.html` (`b54c13b`) | **4/12**: the notice shows under the splash and saves its mark there (8 fail) |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 4 mutations unique) | **all 5 matched**: main 8; switch off 8; wrong element 7; never released 7; no guard 1 |
| Removal, `qa/test-removal.py` | **8/8**: `head-pwa.html` returns to main's bytes (5,649, `db49de8b…`); every other file untouched; FT-32 then still comes off to its predecessor |
| Sheet build | Unchanged by this layer |

**Not a variant:** without the watcher's own "is the splash still up?" line, a change elsewhere on the page re-calls
the notice, which holds again by itself: measured 12/12, nothing visible changes (the line saves churn).

**Device check:** on a first visit (or after clearing the site's data), the notice appears after the splash has gone.
