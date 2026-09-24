# BUGFIX — Service Worker Redirected Page

On the iPhone, opening the live sheet sometimes showed Safari's error page, "Response served by
service worker has redirections", instead of the sheet. Found on 24 September 2026 while testing
the Spell Slots tab. The workaround was deleting the site's data in Safari's settings.

## What was wrong

Phase 0.6's service worker (`src/sw.js`) saves a copy of the page when it activates, by fetching
`./index.html`. Cloudflare Pages does not serve `/index.html`; it redirects it to `/`. So the saved
copy is a response that **came through a redirect**, and browsers mark it that way. The next time
the app opened, the worker answered from that copy, and a browser will not use a redirected
response to load a page: Safari shows "has redirections", Chromium a network error.

It only failed on the first open after the worker saved the page. The worker also re-fetches the
page in the background on every open, and that fetch goes to `/`, so it replaced the bad copy with a
good one. That is why it came and went.

Phase 0.6's own harness never saw it: it serves `/index.html` directly, with no redirect.

## The fix

Three delimited blocks in `src/sw.js`, switch `SW_REDIRECT_FIX_ENABLED`:

| Block | What it does |
|---|---|
| `redirect-helper` | `servable()`: copies a redirected response into a fresh one with the same body, status and headers. Anything else is passed through untouched |
| `activate-clean` | Straight after the page is saved in activate, replaces a redirected copy with a clean one, so the cache never holds a copy that cannot load a page |
| `serve-clean` | Before a page load is answered from the cache, a redirected copy is cleaned first, whatever put it there (a worker from before this fix, or any race) |

Nothing else changes: the caching strategy, update behaviour, offline behaviour and character data
are exactly as Phase 0.6 left them. No sheet code is touched, so the Phase 0 build is unchanged.

## QA

All measured on 24 September 2026, headless Chromium, `NODE_PATH=/opt/node22/lib/node_modules`.
No emulation was needed: Chromium refuses a redirected page response just as Safari does.

`qa/sw-redirect-harness.js` serves a built site two ways: **PAGES** redirects `/index.html` to `/`
as Cloudflare Pages does; **PLAIN** serves it directly, as Phase 0.6's harness does (a control).
While it reloads, the server holds back the page, so the worker's saved copy answers, which is the
path the iPhone took.

| Measure | Result |
|---|---|
| Own suite, fixed worker | **11/11** |
| Own suite, previous worker (commit `9b465b5`) | **8/11**: the saved copy is redirected, and the reload fails with `net::ERR_FAILED`, the iPhone's failure. Every PLAIN check passes on both, which is why nothing caught it before |
| Switch off | 8/11, the same three |
| Without `activate-clean` | 10/11: loads still work, but the saved copy stays redirected |
| Without `serve-clean` | 10/11: a cache that already holds a redirected copy fails to load |
| Helper that returns the response unchanged | 8/11, the same three as the previous worker |
| Phase 0.6's own harnesses, fixed worker | **12/12** (`pwa-harness.js`, including offline) and **5/5** (`update-harness.js`) |
| `src/sw.js` | 11,607 bytes, SHA-256 `0e75a84d3726ffe1ee6c687ee8264acd84d9771160d815e95ee2921741ba14f2` |
| Surgical removal | **Byte-identical** to `sw.js` at commit `9b465b5` (10,013 bytes, `c260644d…`); every other file in the Phase 0.6 folder unchanged |
| Remover fixtures | **13/13** (`qa/test-removal.py`), no skips |
| Sheet build | Unchanged. The Phase 0 build is still `864c5134…`, so the combined sheet suite (2,123/2,123) is unaffected and was not re-run |

`qa/verify-variants.py` builds the site into a scratch folder and runs every variant above.

## After it deploys

A phone that already has the old worker updates on its next open while online. That open is still
answered by the old worker, so it can show the error **one more time**; reload and it is gone. A
private-browsing tab starts with no worker, so it is not affected.

## Not verified

- **Not yet confirmed on the iPhone.** Reproduced and fixed in Chromium against a server that
  redirects exactly as Cloudflare Pages does; Safari's refusal is the same rule.
