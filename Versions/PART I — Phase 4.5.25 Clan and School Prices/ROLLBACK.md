# Rolling back PART I — Phase 4.5.25 Clan and School Prices

## Surgical removal (the method)

Remove exactly:

1. `src/sheet/209.999996-feat-adv-clan-prices.js` (the whole fragment);
2. its entry in `build/manifest.json`, setting `expect_sha256` back to the pre-release build;
3. the one delimited block `// PART I FEATURE 4.5.25 BEGIN clan-prices-seam` …
   `// END CP4525 clan-prices-seam` in `src/sheet/210-test-seam-and-init.js`;
4. its `Release(...)` line in `Versions/QA — Removal Chain Registry/removal_chain.py`;

then rebuild. `qa/remove-phase.py COPY --expect-sha 033a0bf2…` does 1–3 on a scratch copy and refuses
to run on the live tree; it asserts that everything it deletes carries this release's marker.

**Measured 2 October 2026:** removal rebuilds `033a0bf239b9dd1c4e6e6d494cfba2c8c7092dacde82f184ae3e73cb847a19c3`
(3,464,120 bytes) byte for byte, the build before this release.

## Saved characters after a removal

Rows keep the cost they hold, and the `clanPrice` record on each row is ignored by the sheet without
this fragment (it is inert data; `makeEntry` never reads it). Nothing is lost or re-priced.

## Dependencies

- **Needs Phase 4.5 (Part I)**: the prices run through Phase 4.5's `refreshAdvConfigControl`. Removing
  Phase 4.5 first leaves this release inert (no error: the hook is guarded with `typeof`).
- **Uses, if present:** Phase 12's `MODES12.set` and Phase 11.2's `CW112.finish` (guarded). Removing
  either leaves rows provisional until the other fixes them.
- **Rebinds** `refreshAdvConfigControl`, `makeEntry`, `collectData` and `applyData`, each keeping the
  previous binding and delegating to it, so earlier phases are untouched. It loads after every other
  fragment that rebinds them.
- **Nobody depends on this release.**
