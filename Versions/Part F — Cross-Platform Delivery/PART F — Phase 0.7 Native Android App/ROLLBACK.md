# Rolling back Part F, Phase 0.7

## What to delete

Two things, not one:

1. **This folder** —
   `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.7 Native Android App/`
2. **`.github/workflows/android.yml`** at the repo root.

The second exists only because GitHub reads workflows from `.github/workflows/`
and nowhere else. It holds no logic — it installs tools and calls
`build/ci_build_apk.sh` inside this folder — but leaving it behind would give
you a workflow that fails on every push, looking for a script that no longer
exists.

Optionally also remove the three `.gitignore` entries this phase added at the
repo root (the `app/www/` rule and the two `*.keystore` rules). Harmless if left.

## What that leaves

The website, exactly as before. Nothing else references this phase:

- **Phase 0.6 and below are untouched.** This phase reads their output and adds
  to it; it never edits them. `python3 build.py` still produces `dist/` and
  Cloudflare still deploys it, with or without this folder.
- **No game logic changed.** The page inside the APK is byte-identical to the
  page on the website — this phase wraps the build, it does not modify it.
- **`build.py` at the root is not involved.** It chains to the highest
  *deploy* phase, which is 0.6. Phase 0.7 calls `build.py`, not the reverse, so
  removing it breaks nothing upstream.

## What it costs

Any installed Android app stops receiving updates. It keeps working — it is
self-contained — but nothing will build a new APK.

**The signing key is the part you cannot recreate.** `keystore/release.keystore.enc`
is the app's identity as far as Android is concerned. Delete this folder without
keeping a copy of that file and its passphrase, and a future Phase 0.7 would have
to sign with a new key. Android would then treat it as a different app: the new
APK will not install over the old one, and the uninstall required to make it fit
deletes every character saved in the app.

So if there is any chance of coming back to this: keep `release.keystore.enc` and
its passphrase somewhere outside the repository before deleting anything. It is
the one artefact here that cannot be regenerated from source.

## Dependencies worth knowing before you delete something else

This phase depends on Phase 0.6 in two ways, both of which fail loudly rather
than silently:

- `build/make_android_icons.py` imports Phase 0.6's `build/make_icons.py` and
  reads its `icons/source/app-icon.png`. Delete Phase 0.6 and icon regeneration
  stops with a message naming the missing folder. The already-generated icons in
  `app/android/.../res/` keep working — they are committed.
- `build/build_android.py` runs the repo-root `build.py`, which chains to the
  highest deploy phase present. Remove Phase 0.6 and it falls back to 0.5, which
  produces `index.html` but no manifest or icons. The APK would still build and
  run; it would just carry fewer files.

## Restore points

| File | sha256 |
|---|---|
| `keystore/release.keystore.enc` | see `git log` for this path — the bytes must never change once an APK has been distributed |
| signing certificate | `E4:75:7A:8F:86:87:A7:B7:2B:16:A3:7C:66:FA:01:1B:05:A5:84:47:B2:33:57:AA:12:9A:3E:A8:9F:AC:21:AC` |

That fingerprint is what Android checks on every update. If a future build shows
a different one, the key has changed and updates will not install over existing
copies — stop and work out why before distributing it.

## Verifying the rollback

```bash
python3 build.py                      # still builds the site
python3 build.py --check-drift        # committed build still matches its sources
```

Both belong to earlier phases and must pass unchanged. If either fails after
deleting this folder, something in this phase reached upstream when it should
not have, and that is a bug in Phase 0.7 rather than in the rollback.
