# Rollback — QA — PWA Harness Step Limits

This unit changes one QA file and nothing in the app: `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App/qa/pwa-harness.js`. No fragment, build, manifest, page or service worker is touched, so the application's bytes are the same with or without it.

## What it owns

Five marked blocks in that harness, each opened by `// QA PWASTALL BEGIN <name>` and closed by `// END PWASTALL <name>`:

| Block | What it holds |
|---|---|
| `step-limit` | `STEP_LIMIT_MS` (60 s), `lastCheck()`, `limit()` and `stopServer()` |
| `step-limit-start` | the browser context and page opened under `limit()` (the trunk's two lines, rewritten) |
| `step-limit-calls` | `page.evaluate`, `context.setOffline` and `browser.close` wrapped in `limit()` |
| `server-stop` | the stop before the offline reload, through `stopServer()` (the trunk's one line, rewritten) |
| `server-stop-end` | the stop at the end, through `stopServer()` (the trunk's one line, rewritten) |

Plus this folder: `originals/pwa-harness.js` (the harness as it was, sha256 `c1f88f30…56ee`), `README.md`, this file and `qa/`.

## How to remove it

Either:

1. **Restore the original:** copy `originals/pwa-harness.js` over Phase 0.6's `qa/pwa-harness.js`. This is safe only while no later unit has edited that harness. Check with `git log -- "<that path>"` that this unit's commit is the latest to touch it.
2. **Or by hand:** delete the `step-limit` and `step-limit-calls` blocks, and replace each of the other three blocks with the original line(s) it rewrote:
   - `step-limit-start`: `const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });` and `const page = await context.newPage();`
   - `server-stop`: `if (server) { await new Promise((r) => server.close(r)); server = null; }`
   - `server-stop-end`: `if (server) await new Promise((r) => server.close(r));`

The file must then match `originals/pwa-harness.js` byte for byte (sha256 `c1f88f30…56ee`). Then delete this folder.

## Dependencies

- **Needs:** Node 18.2 or later for `server.closeAllConnections()` (this machine has 24.20).
- **Nothing depends on it.** `sw-checks.js` (QA — Cycle 5 Release 5a) still runs this harness with its own 20-minute limit and the same expected count, 12. The harness's 12 checks, their names and their pass conditions are unchanged.
- **Release 15a A02 waits on it** only for qualification: A02's full passes 3 and 4 ran with it in place. A02 itself does not use it, and removing it does not change A02.
