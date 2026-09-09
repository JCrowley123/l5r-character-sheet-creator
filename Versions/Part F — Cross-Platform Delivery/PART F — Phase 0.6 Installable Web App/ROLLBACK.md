# ROLLBACK — Part F, Phase 0.6 (Installable Web App)

## How to revert

**Delete this folder.**

```
Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App/
```

That is the whole procedure. Nothing else needs editing — including `build.py`
at the repo root, which picks the highest-numbered deploy phase that actually
exists and falls back to Phase 0.5 on its own once this folder is gone.

Confirm with:

```bash
python3 build.py
```

It should print Phase 0.5's output and stop there, publishing a `dist/` with
`index.html` alone.

## Clearing the deployment

Deleting files does not un-publish anything. The next push rebuilds and deploys
without the PWA layer, and `dist/` will no longer contain `sw.js`,
`manifest.webmanifest` or `icons/`.

**But a service worker already installed on a phone does not remove itself.**
It keeps serving its cached copy of the sheet even after `sw.js` stops being
deployed, because the worker lives in the browser, not on the server. That is
the point of it, and it is also the awkward part of removing it.

To clear one:

- **Android/Chrome** — Settings → Site settings → All sites → the site → Clear &
  reset. Or uninstall the home-screen app.
- **iPhone/Safari** — Settings → Safari → Advanced → Website Data → find the
  site → delete. Or delete the home-screen app.
- **Desktop** — DevTools → Application → Service Workers → Unregister, and
  Application → Storage → Clear site data.

If the app is genuinely being retired rather than rolled back for a moment, the
clean way is to deploy a tombstone worker that calls
`self.registration.unregister()` and clears its caches, leave it up long enough
for installed copies to fetch it, and only then remove it. That is more
ceremony than a rollback usually deserves, but it is the only way to reach a
worker that is already out there.

## What rolling back costs

Nothing that existed before this phase.

- **Phase 0 is untouched.** This phase never writes into it. Its split source
  tree and the single-file build it produces are unaffected, and that build is
  still byte-identical to the pre-split Part E deliverable — verified on every
  run of `build.py`.
- **Phase 0.5 is untouched.** This phase *calls* its deploy script; it does not
  modify it. Deleting this folder leaves 0.5 working exactly as it did.
- **The sheet's own code is unaffected.** This phase adds `<head>` tags to the
  build output and three files beside it. It changes no game logic, no styles,
  and no markup the sheet itself owns.
- **Character data is unaffected.** It lives in `localStorage`, which this phase
  never touches. Removing the worker does not remove characters.

You lose only installability: the home-screen app, the offline capability, and
the icons.

## Restore points

This phase produces no fixed artefact hash worth pinning, because its output
changes whenever the sheet does — the `<head>` block is injected into whatever
Phase 0 currently builds, and `sw.js` is stamped with that result's sha256.

The hash that stays fixed is Phase 0's, recorded in its own `ROLLBACK.md`:

```
211b4e54e876657e3c8c119486bbc649f6e0621aaca10b6f978bbc117d7f1a64
```

`build.py` prints it on every run, before the PWA layer is applied, so a broken
PWA build is always distinguishable from a broken sheet build.

Verify the whole chain at any time:

```bash
python3 build.py                                   # both layers, hashes printed
python3 build/make_icons.py --check                # icons match their generator
NODE_PATH=$(npm root -g) node qa/pwa-harness.js    # 12 checks, incl. offline
NODE_PATH=$(npm root -g) node qa/update-harness.js # 5 checks, update delivery
```
