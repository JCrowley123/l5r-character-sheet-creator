# PART F — Phase 0.6.1 Newest Version First (FT-32)

Cycle 5, Release 5a. The owner's scope of 20 October 2026: opening the app fetches the newest release, so the first
open after a deploy is no longer the previous build (memory `device-check-stale-version`), and the app still works
offline.

## What it changes

Phase 0.6's service worker answered every open from its saved copy and fetched the page in the background
(stale-while-revalidate), so the first open after a release showed the previous one.

**Why not plain network-first.** Measured on 21 October: the page is 6.7 MB (2.2 MB compressed), and Cloudflare
Pages sends it with no `ETag` or `Last-Modified`, so "has it changed?" cannot be asked of the page itself. Plain
network-first would download 2.2 MB on every open: about 12 s on a slow 3G signal (1.6 Mbit/s).

**What it does instead.** On each open the worker asks the server for `sw.js` (13 KB), which carries the build id,
within **2 s** (`CHECK_LIMIT_MS`):

- **Same build:** the saved copy, at once (one small round trip: 0.1–0.45 s measured here).
- **A newer build:** the page fetch the worker already starts on every open is used for this open, within **8 s**
  (`NEW_PAGE_LIMIT_MS`, the owner's ruling 6 of 21 October); later than that, the saved copy, and the new page is saved
  for the next open.
- **No answer within 2 s, an error, or offline:** the saved copy, as before.
- **First visit** (nothing saved): from the network, as before.

Two blocks in `src/sw.js` (switch `NEWEST_FIRST_ENABLED`): `newest-first-helper` (the check) and `newest-first`
(the hook in the page-load branch, before the redirect fix's serve-clean). Navigations fetch with redirect
`manual`, so the page this uses never arrives redirected; the redirect fix's helper is not needed here.

**The trade-off (stated to the owner):** an online open now waits for one small request, up to 2 s on a weak
signal; the first open after a release waits for the new page (under a second on Wi-Fi, up to the 8 s limit on a
slow signal).

**When it starts working.** A phone that has the old worker still opens the previous build once after the release
that brings this layer (the old worker answers that open); from the release after, the first open shows the newest.

**Known limits (the code review, 21 October; speed only, never the wrong page):** the check compares the server's
id with the worker's, not with the saved page, so in the moment after an earlier open saved the new page but before
the new worker takes over, an open still waits for the page download; and the page fetch Phase 0.6 already made on
every open gives back nothing if saving it fails (a full iPhone storage quota), so the saved copy answers.

## Two blocks in other layers' tests

- `PART F — Phase 0.6 Installable Web App/qa/update-harness.js`, block `newest-first-update-check`: step 3 ("reload
  right after deploy") now requires **build B** when the worker has newest-first; without it, the original check
  ("still serves A") runs unchanged. A stricter check of the new behaviour, not a weaker one.
- `BUGFIX — Service Worker Redirected Page/qa/test-removal.py`, block `later-layers-first`: its live removal test
  takes this layer off first (this layer sits on the redirect fix in `sw.js`), as the sheet's removal registry does
  for sheet releases.

- **The stale section count (the owner's yes, 21 October).** Phase 0.6's `pwa-harness.js` and the redirect fix's
  `sw-redirect-harness.js` expected exactly 10 sections, the markup's count; the running sheet has had 14 since
  the Library, Search and Characters pages were added at runtime, so both failed on `main` too. Blocks
  `online-sections` / `offline-sections-check` and `sections-expected` / `sections-check` / `sections-online` now
  hold each load to the count the same page rendered online (and at least 10): it cannot go stale again.

## QA

| Measure | Result |
|---|---|
| Own harness, `qa/newest-first-harness.js` (builds B and C are copies with their own build id) | **14/14** |
| The same harness with main's worker (`31be9e5`) | **9/14**: the first open shows the old build; no wait for a slow check or page; the switch is absent |
| Pinned variants, `qa/verify-variants.py` (dry-run first: 6 mutations unique) | **all 7 matched**: main's worker 5; switch off 5; build id never read 3 (it still waits for its check); hook missing 4; no check limit 2; no page limit 2; the same id taken as new 1 (it waits for the page) |
| Phase 0.6 `update-harness.js` | **5/5** (step 3 now requires B) |
| Phase 0.6 `pwa-harness.js` | **12/12** ("14 of 14 sections" offline); before the section fix 11/12, the same as `main` |
| `BUGFIX — Service Worker Redirected Page/qa/sw-redirect-harness.js` | **11/11** on 5a and **11/11** on the live `main` site; before the section fix 6/11 on both |
| Its removal suite, `qa/test-removal.py` | **13 tests OK** (2 skipped: Windows symlinks), with `later-layers-first` |
| Removal, `qa/test-removal.py` | **10/10**: `sw.js`, `update-harness.js`, `pwa-harness.js` and the redirect fix's test and harness return to main's bytes; every other file untouched; the redirect fix then still comes off to its own predecessor (`c260644d…`) |
| `src/sw.js` | 13,287 bytes in source (main: 11,607, `0e75a84d…`) |
| Sheet build | Unchanged by this layer |
