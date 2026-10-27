# First full-run failures and corrections

The initial run executed all 145 candidate suites: 6,283/6,301 checks passed. Retained checks and the second run were not started. All 126 new-layer checks passed. The first-pass goal was not met; the original evidence remains in qa/final-run-1.

- Advanced Schools: one nested behaviour oracle still expected save format 6. Campaign wounds advances it to 7. The oracle now independently includes the enabled wound layer; the assertion is retained. Focused result: 196/196.
- Splash and offline notice: the detached launcher put the splash bypass in NODE_OPTIONS. This propagated into child tests whose wrappers deliberately omit the leaf execArgv bypass because they test the real splash. The launcher now inherits only the installed-Chrome preload; the existing flat runner still supplies the fast splash to ordinary leaves. An early full-QA guard refuses an inherited splash bypass. Focused results: 61/61 and 12/12.
- Carousel rotation: the test relied on the browser reporting its resized offset before the application's 60ms reflow. Under load, all five retries ran the reflow first, so none established the defect premise. The harness now holds only reflow/settle scheduling until the real browser offset is observed in an animation frame. Layout, scroll events, frame sampling, final position and all ten assertions remain real. The deferred callbacks are released unchanged. Result: 10/10 normally and 10/10 with two-times CPU throttling.

The original five pinned rotation variants still fail exactly their expected checks: predecessor 5, switch disabled 5, missing scroll hold 4, missing early-settle handling 1, hold never released 1. No assertions or negative expectations were removed. A temporary negative-proof launch error from Windows preload path quoting was corrected; its error log is retained.

The application remains byte-identical to reviewed commit b4fca4f: SHA-256 4f2ebd5b6ec932010983906dff5f8c76c52c8116b680fb0d2d461c722d130e5f. No second reviewer was used. Two new full runs use fresh directories final-run-2 and final-run-3, with mains power, held-awake display, sequential installed Chrome and no reused results.
