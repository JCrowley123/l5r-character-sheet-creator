# Part F, Phase 0.7 — Native Android App

The sheet as a real Android app: its own icon, full screen, entirely offline,
installed by sideloading rather than through the Play Store. It wraps the
existing build with Capacitor and changes no game logic and no Phase 0 source
file.

**Status: built, not yet validated on a device.** The APK compiles in CI and is
signed, but nobody on this project has an Android phone to install it on, so
every item in the roadmap's validation suite is **pending** rather than passed.
Those tests are written out in `qa/MANUAL-TESTS.md` for whoever does have one.
See *What is not verified* below — it is the honest state of this phase.

To get an APK: **`BUILD-FROM-A-PHONE.md`**. It assumes no computer.

---

## How it fits together

```
build.py  ->  0.6 build_pwa.py  ->  0.5 deploy_build.py  ->  0 recombine.py
     |
     +--  0.7 build_android.py   stages dist/ as the app's web assets
              |
              +--  npx cap sync android    Capacitor moves them into the project
                       |
                       +--  gradle assembleRelease    the APK
```

Nothing here reimplements a step below it. `build_android.py` runs the same
repo-root `build.py` a deploy does, so the app and the website are built from
one source by one path.

| File | What it does |
|---|---|
| `build/build_android.py` | Runs the site build, stages `dist/` into `app/www` |
| `build/make_android_icons.py` | Derives all 27 Android resources from the shared artwork |
| `build/ci_build_apk.sh` | The whole compile, start to finish. Not GitHub-specific |
| `app/` | The Capacitor project — `capacitor.config.json` and the native `android/` tree |
| `keystore/release.keystore.enc` | The signing key, encrypted. Useless without the passphrase |
| `qa/MANUAL-TESTS.md` | The device tests, for someone with an Android phone |

`.github/workflows/android.yml` at the repo root installs the tools and calls
`ci_build_apk.sh`. It is thin on purpose — see *The second root-level exception*.

## The page is shipped byte-identical

The APK contains exactly the bytes the website serves — same sha256, asserted by
the build, which fails rather than ship a mismatch.

That is worth protecting. It means the app cannot quietly drift from the site,
there is no Android-only variant of the sheet to test separately, and a bug
reproduced in one is reproduced in the other. Every difference between the two
shells is therefore a difference in what sits *alongside* the page, never in the
page itself — and there is currently exactly one such difference.

## That one difference: `sw.js` is left out

The service worker is the only file excluded from the APK, and the only one
whose absence matters.

Inside the wrapper every asset is already on the device, so the worker's whole
purpose — surviving a lost network — is already met by the APK. What it would
still do is cache the page under a build id and serve that copy first. After an
app update the wrapper would hand the webview a new `index.html`, the worker
would answer the navigation from its old cache anyway, and the app would go on
showing the previous build. No error, and no way for a player to tell. A cache
in front of files that cannot go stale buys nothing and risks exactly that.

Leaving it out means the registration call in the injected head block 404s. That
is handled: it is wrapped in `.catch()` precisely because it must never break the
sheet, so it logs one `console.info` line and the app carries on. That is also
why the page can stay byte-identical — no Android-only edit is needed to
suppress it.

## The icons

All 27 Android resources come from the same `app-icon.png` the web icons use, in
Phase 0.6's folder, through the same standard-library PNG pipeline. One artwork,
one implementation, so the two shells cannot end up looking like different apps.

Android asks for more shapes than the web does, and each is sized for a
different reason:

| Resource | Treatment |
|---|---|
| `ic_launcher_foreground` (108–432px) | The adaptive icon. Its canvas is 108dp but only the middle 66dp is guaranteed — the rest is margin the system crops and parallaxes. The card sits at **54%**, putting its furthest corner just inside that circle. |
| `ic_launcher_background` | A flat colour (`--ink` `#2a2420`), not an image. An adaptive background must survive being cropped to any shape, and a solid one always does. |
| `ic_launcher` (48–192px) | Legacy, Android 7.x. Drawn with no system mask, so it ships the card exactly as designed, rounded corners and transparency intact. |
| `ic_launcher_round` (48–192px) | For launchers that ask for a round icon, so it has to *be* round: the card on an ink disc at **76%**. |
| `splash` (11 sizes) | The launch window's background, at each density and orientation Capacitor generates. Sized to match exactly, because a window background is stretched to fill and a mismatched aspect ratio distorts it. |

Two of those numbers are worth explaining, because both were arrived at the same
way and one of them was wrong first.

**54% is Android's own arithmetic, not a guess.** A card at 54% of the 108dp
canvas fills about 81% of the 72dp a launcher actually shows. That is the same
proportion as the web maskable icon's 80% safe zone — reached independently, from
Android's numbers rather than the web's, which is a decent sign both are right.

**76% for the round icon replaced 82%, and nothing was being clipped at either.**
82% was the largest size whose corners still cleared the rim — measured, with
3.3% to spare — and it read as clipped anyway, because the card's dark lower edge
blends into the ink disc and the eye supplies the crop. 76% leaves about 10%,
which looks deliberate. The lesson from Phase 0.6's iOS tile applied again: what
an icon *looks* like it is losing matters separately from what it is losing.

## One thing the app does worse than the website: fonts

The sheet loads three families from Google Fonts — Shippori Mincho, EB Garamond
and Noto Sans JP. They are not bundled in the APK.

On the website the service worker caches them cache-first after the first online
visit, so the sheet keeps its typography offline. The APK has no service worker
by design (above), so the fonts are fetched over the network each launch, subject
only to the webview's own HTTP cache. Open the app for the first time with no
connection and every font stack falls back to its generic — `serif` and
`sans-serif` — which the CSS already declares for exactly this reason.

The sheet stays fully readable and fully functional; it just looks plainer. This
is a real regression against the installed web app and is recorded here rather
than hidden: it is the price of shipping the page byte-identical, since bundling
the fonts would mean rewriting the page's font links for Android only.

If it turns out to matter on a real device, the fix is to bundle the font files
as app assets and serve them locally — but that trades away byte-identity, so it
is worth doing only once someone has looked at it on a phone and minded.

## Signing, and why it is not optional

Every build is signed with one key, kept encrypted in `keystore/`. The passphrase
is a GitHub secret and exists nowhere in the repository.

Android identifies an app by its signing key. Two consequences follow, and both
are about the player's data rather than security:

- An APK signed with a **different** key is a different app. It will not install
  over the existing one; Android demands an uninstall first, and uninstalling
  takes every saved character with it.
- An APK with a **lower or equal** `versionCode` will not install either. So CI
  passes the run number, which only ever increases.

That rules out the tempting shortcut of a debug-signed build. Debug signing needs
no secrets and installs perfectly well — once. GitHub generates a fresh debug key
on every run, so the second build would be a different app, and the first update
would silently cost a player their characters. The build therefore **fails**
rather than emit an unsigned APK, because an unsigned APK looks like a success
everywhere except on the phone.

The signature is verified with `apksigner`, not by looking for `META-INF/*.RSA`.
That file is v1 jar signing, which the Android Gradle Plugin skips entirely when
`minSdkVersion` is 24 or higher — and this app's is 24. A correctly v2/v3-signed
APK has no `META-INF` signature at all, so the obvious check would have called
every good build broken.

## The second root-level exception

`.github/workflows/android.yml` sits at the repo root, breaking the convention
that every new file lives inside its phase folder. It is the second such
exception, after `build.py`, and it is forced: GitHub reads workflows only from
`.github/workflows/`, and there is no configuration to point it elsewhere.

It is kept to the same shape as the first. The workflow installs tools and calls
one script; every decision lives in `build/ci_build_apk.sh` inside this folder.
Rolling the phase back is still deleting this folder plus one obvious file, and
`ROLLBACK.md` says which.

## Building the project at a clean path

`ci_build_apk.sh` copies `app/` out of the repository before running Gradle.

This folder is called `PART F — Phase 0.7 Native Android App`: spaces and an
em-dash, because that is the project's naming convention. Gradle, the Android SDK
and their tooling have a long history of mishandling both, usually not with a
clean error but with something obscure much later. Copying to a clean directory
first costs a second and removes the class of problem, so the convention does not
have to bend for the build. It is the same reasoning that put `build.py` at the
root, applied without needing a second exception.

## What is verified, and what is not

Verified here:

| Check | Result |
|---|---|
| The staged page is byte-identical to the deployed site | pass — `bcad665a847f4ae9` |
| `sw.js` excluded, everything else carried over | pass — 6 files staged, 1 excluded |
| All 27 Android resources regenerate deterministically | pass — `make_android_icons.py --check` |
| Adaptive icon survives a circular and a squircle mask intact | pass — rendered and inspected |
| Round icon clears the disc rim | pass — 10.0% margin, measured |
| Keystore encrypts and decrypts to identical bytes | pass |
| A wrong passphrase is rejected rather than producing rubbish | pass |
| Site build, project copy, `npm ci`, `cap sync`, decryption | pass — run end to end |

**Not verified here:** the Gradle compile. This sandbox's network proxy refuses
`dl.google.com`, where the Android Gradle Plugin lives, so the build reaches
dependency resolution and stops. That is the same limitation the roadmap
predicted for this phase. It is why the compile runs in CI, where that host is
reachable — the first green run on GitHub is what actually proves this.

**Not verified anywhere yet:** everything that needs a physical Android device —
install, offline behaviour, and data surviving an app update. `qa/MANUAL-TESTS.md`
sets those out. Until someone runs them this phase is built, not validated, and
the roadmap's regression matrix for it stays open.

## Still outstanding

The roadmap asks for one thing this phase does not do: registering for Google's
free hobbyist tier of developer verification, ahead of their phased rollout of
mandatory verification for sideloaded apps. That is an account action requiring a
person and their own identity, so it cannot be automated or done on anyone's
behalf. The APK installs today without it; the requirement is coming, not
current.
