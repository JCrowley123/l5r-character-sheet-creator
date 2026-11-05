# QA — PWA Harness Step Limits (5 November 2026)

A QA-only fix, made on the owner's ruling of 5 November 2026 after Release 15a A02's full pass 2 failed. It changes one test file and nothing in the app. Application bytes, the page, the service worker and every check's name, count and pass condition are unchanged. Removal: [ROLLBACK.md](ROLLBACK.md).

## Why

In A02's full pass 2, Part F Phase 0.6's `qa/pwa-harness.js` printed its 6th check (*index.html is cached*) and then stopped producing output. It waited until `sw-checks.js` (QA — Cycle 5 Release 5a) killed it at its 20-minute limit and counted it 0/0 against 12. The same harness took 86–89 s inside that leaf in five earlier runs. It also passed 25 isolated runs, so the stall did not reproduce ([A02's investigation](<../Part H — Sheet UI-UX/PART H — Phase 15 Implementation/Release 15a/A02 — Floating Controls Above the Tabs/qa/investigation/README.md>)).

After that check, the harness waited on things that had no limit of their own:

- `page.evaluate` (four calls, one of which waits on `navigator.serviceWorker.ready` inside the page);
- `context.setOffline`;
- `browser.close`;
- the browser context and page opening;
- its own test server's `close()`, which waits for every open connection to end.

A stall in any of them hangs silently for 20 minutes. Which one stalled on 5 November is **not known**: a half-read fetch from the page did not hold the server (Chromium buffers a localhost response), and nothing else reproduced it.

## What changed

Five marked blocks in that harness (`QA PWASTALL`):

- **A step limit of 60 s** on each of those waits: twice the longest wait the harness itself allows (its 30 s section-count loop). Every step normally takes under 2 s. Reaching the limit is a **failure** that names the step and the last check that passed (for example `stalled: reading the page after "index.html is cached" took over 60 s`). It is never a retry, and it never turns a failure into a pass.
- **The test server stops for certain:** `close()` is followed by `closeAllConnections()`, so a connection that never finishes cannot hold it. The network is still cut first. The offline reload must still come from the service worker, because the server is gone either way.

`goto`, `reload` (30 s), `request.get` and `chromium.launch` already had Playwright limits (30 s, 30 s, 30 s, 180 s) and are unchanged.

## Verified (5 November 2026, on A02's candidate `dist/`, page `fde3cfd7…`)

| Check | Result |
|---|---|
| `qa/stall-tests.cjs`: a held connection and a page call that never answers, injected into copies of the original and the fixed harness | Original: **hangs** on both (stopped at 150 s, at the injected spot). Fixed: held connection **passes 12/12** in 8 s; page stall **fails in 64 s**, naming the step. **4/4**, run twice (the second run also checks that each hang sits at the injected stall) |
| Fixed harness, 25 runs in a row | **25/25**, 12/12 each, 6–7 s each (`qa/repeat-25.txt`) |
| `qa/removal-check.py`: ROLLBACK's by-hand removal | **8/8**: rebuilds `originals/pwa-harness.js` byte for byte (sha256 `c1f88f30…56ee`) |
| One read-only review | no defects in the change. Its documentation and evidence items are done; two test notes taken (raw-byte compare, hang located at the injected spot). Accepted notes: a stall in the offline section count shows as `-1 of N sections` rather than as a stall; a stall at the very end still has no count line, but now prints its `stalled:` message |

Then A02's qualification chain and full passes ran again with this in place (see A02's handover).
