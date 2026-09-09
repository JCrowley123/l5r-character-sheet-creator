# Part F, Phase 0.6 — Installable Web App

The deployed sheet becomes installable on a phone: its own icon, full screen
with no browser bar, and **fully usable with no network** after one visit. One
build serves iPhone and Android alike.

No game logic changed, and no Phase 0 source file was touched. Everything here
is additive — a manifest, a service worker, four icons, and a block of `<head>`
tags injected into the built output.

**Status: complete. Automated checks all pass (17/17); install, full screen and
aeroplane-mode offline all confirmed on an iPhone 16e** — the offline case only
after a fix, described in *The offline failure on iPhone* below.

---

## Build

```bash
python3 build.py            # from the repo root, as always
```

The chain, each link reusing the one below rather than reimplementing it:

```
build.py  ->  0.6 build_pwa.py  ->  0.5 deploy_build.py  ->  0 recombine.py  ->  fragments
```

`build.py` picks the highest-numbered deploy phase present, so rolling this one
back needs no edit there — 0.5 simply takes over again.

Regenerate the icons only if you change the generator:

```bash
python3 build/make_icons.py           # write them
python3 build/make_icons.py --check   # verify they match the generator
```

## What gets published

| File | Purpose |
|---|---|
| `index.html` | the sheet, plus the injected `<head>` block |
| `manifest.webmanifest` | name, icons, `display: standalone`, colours |
| `sw.js` | the service worker, stamped with this build's id |
| `icons/icon-192.png`, `icon-512.png` | standard install icons |
| `icons/icon-maskable-512.png` | Android crops maskable icons; artwork sits inside the 80% safe zone |
| `icons/apple-touch-icon.png` | Safari ignores the manifest and reads this |

## Why no Phase 0 file was edited

The `<head>` tags must end up inside the built HTML, and the head lives in Phase
0's `src/shell/01-head-open.html`. Editing that would work and would be wrong:
rollback in this project means deleting a folder, and a phase reaching back into
an earlier phase's sources cannot be removed that way.

So the tags are injected into the **output** instead, immediately before the
closing head tag. The build asserts that anchor appears exactly once before
writing anything — if the sheet ever grows a second one, the build stops rather
than guessing.

## The icons

All four are derived from one piece of supplied artwork, `icons/source/app-icon.png`
— a 1254×1254 rounded card: samurai in silhouette against a **hinomaru** brush
circle, the five element mons down a maroon banner on the left, the title across
the bottom, and a character sheet and brush at the corner. That file is the only
input; everything else under `icons/` is derived and safe to delete.

`build/make_icons.py` does the deriving with nothing but the standard library —
it decodes the PNG by hand (filter types None/Sub/Up/Average/Paeth), area-averages
the downscale, and re-encodes with zlib plus a hand-rolled chunk writer. No
Pillow, no ImageMagick, no rasteriser, because adding a dependency to a project
whose premise is "no build system, no dependencies" is the wrong trade for four
small images. It runs anywhere Python runs, the Windows desktop included, and
the output is deterministic, so `--check` is a real assertion and the icons diff
like any other build artefact.

The three outputs are not the same image, because the platforms want different
things:

| Output | Treatment |
|---|---|
| `icon-192`, `icon-512` | purpose `any`. Alpha kept, so the card's rounded corners stay transparent and the launcher composites them over its own backdrop. |
| `apple-touch-icon` | iOS renders alpha as black and masks the tile with a superellipse of its own, so this one is opaque and inset to 94% — the mask lands on the padding, not the artwork. |
| `icon-maskable-512` | scaled to 80% and padded, so a circular, squircle or rounded-square mask all keep the whole design. |

Everything is cropped to the card first. The supplied file carries about 6% of
transparent margin, and every platform insets the icon again on its own terms —
margin left in the pixels is margin charged twice. Uncropped, the maskable icon's
80% safe zone compounded with it and left the design at roughly 74% of the tile,
small and adrift.

Three things here were wrong before they were right, all for the same underlying
reason — the artwork is a *card*, not a full-bleed square, and each output had to
reckon with that.

**The padding colour was sampled, and came out mud.** The first version averaged
the artwork's own outer ring, on the reasoning that a sampled colour beats a
guessed constant. That works for art with a consistent border. This art runs from
cream parchment at the top left to solid black along the bottom, so the mean is
`#78604d` — a brown that appears nowhere in the design and matches none of the
four edges. The padding is now `--ink` `#2a2420`, straight from the sheet's own
palette. The artwork already carries a drop shadow, so it is drawn as a card
lying on a darker surface; `--ink` is that surface, and the shadow falls into it.

**Filling the Apple tile's corners put wedges exactly where they show.** The
artwork's corner radius is deeper than Apple's, so a flat fill survives in the
gap between the two curves — four coloured notches around an otherwise full-bleed
illustration.

**Trimming the corners off instead cost too much.** The next idea was to crop in
until the square is fully opaque and let iOS draw the curve. Measured, that needs
8.6% off every side, because the card's edge is soft rather than a clean arc —
enough to reach past the element mons on the left and clip the title along the
bottom. The generator printed the number, which is the only reason it was caught
before it shipped.

**Growing the artwork into its corners shipped, and still looked cropped.** Each
pass gave transparent pixels touching an opaque one the mean of those neighbours,
until the tile was full-bleed illustration edge to edge. On the phone the corners
still read as cut — and the measurement explains why the eye was right and the
reasoning was not. Applying Apple's own mask (a superellipse, n≈5) and counting
what it removes:

| artwork at | illustration lost, n=5 | at a harsher n=4 |
|---|---|---|
| 100% | 34 px — 0.03% | 548 px — 0.46% |
| 96% | **0** | **0** |
| 94% | **0** | **0** |
| 88% | **0** | **0** |

So almost none of the *picture* was ever being lost. What the mask shaves at full
bleed is the card's own rounded corner — the thing that makes it read as a
deliberate tile rather than a photograph in a frame — and losing that is what
looks like cropping. The fix is not to preserve more pixels but to set the card
inside the mask: `APPLE_SCALE = 0.94`, padded with `--ink`. Loss hits zero at 96%;
94% makes the corner visibly intact rather than marginally so, and the edge
extension is gone with the problem it was solving.

## Caching strategy

The app is one self-contained HTML file, so there is no dependency graph to be
clever about.

| Request | Strategy | Why |
|---|---|---|
| navigations | stale-while-revalidate | Serve the cached sheet instantly, fetch a fresh copy behind it, next open picks it up. Exactly what the roadmap asks for, and it never makes a player wait on a phone signal to see their character. |
| fonts | cache-first | Google Fonts files are immutable; once cached the sheet looks right offline instead of falling back to system serif. |
| everything else | cache-first | Icons and the manifest change only when the build does, and the build changes the cache name. |

Character data is untouched. It stays in `localStorage` exactly as before — the
worker caches the application, never the player's characters.

### The build id, and why it matters

`sw.js` carries `BUILD_ID`, stamped by the build with a sha256 over **every
published file** — the page, the manifest and all four icons. A browser
reinstalls a service worker only when the worker file's own bytes change.
Without a per-build value, every deploy would ship an identical `sw.js`, the
browser would conclude nothing had changed, and installed apps would serve the
first build they ever saw — forever, with no error anywhere.

It hashed `index.html` alone at first, and that held for every change to the
sheet and failed silently for anything else. Replacing the icons changes no HTML
at all, so the id would have stood still, the worker would never have been
reinstalled, the cache would never have been renamed — and since icons are
served cache-first out of that cache, installed apps would have kept showing the
old icon with nothing reporting a fault. The same failure the build id exists to
prevent, reintroduced by scoping it too narrowly. Verified rather than assumed:
flipping one byte in `icon-192.png` leaves `page sha256` at `bcad665a847f4ae9`
and moves `BUILD_ID` from `a5476df0e6b3aab0` to `17a450f6a316e7af`.

## Two bugs the tests caught

Both were mine, and neither would have announced itself.

**The worker never updated.** The first version deliberately omitted
`skipWaiting()`, on the standard reasoning that a new worker should wait rather
than seize a running page and serve it a mix of two builds. That reasoning is
sound for an app of many files, where v1's HTML can request v2's chunks. This
app is one file with everything inlined, so there is no second asset to
mismatch — and without `skipWaiting()` the new worker installed, moved to
`waiting`, and stayed there across three reloads while the app went on serving
the old build. `qa/update-harness.js` caught it. The fix was to call it, and the
header of `sw.js` now records why the usual advice does not apply here.

**The page contained two closing head tags.** `head-pwa.html` explained itself
with a comment saying it was "injected immediately before `</head>`" — and that
comment ships inside the built page, so the output held the real tag plus a
phantom inside a comment. Nothing broke at the time. It surfaced when the update
test's own marker injection hit the phantom, landed inside a comment, and was
never parsed — a test failing for a reason unrelated to what it was testing.
The comment is reworded, and `build_pwa.py` now refuses to inject a block
containing the anchor at all.

A third, smaller one: the first harness read the worker's state the instant
`navigator.serviceWorker.ready` resolved and saw `activating`, which looks like
a failure and is not. It now waits for the real end state.

## Automated results — 17/17

`qa/pwa-harness.js` — 12 checks. Service workers need a secure context, which
means https **or** localhost, so `127.0.0.1` lets all of this run for real
rather than be reasoned about.

| Check | Result |
|---|---|
| manifest valid, required fields present | pass — `display=standalone`, 3 icons |
| icon set covers install requirements | pass — 192, 512, maskable |
| every manifest icon resolves | pass |
| worker registers and activates | pass — `activated`, controlling |
| cache populated | pass — 7 entries |
| index.html cached | pass |
| **loads with the network cut** | **pass** |
| **sheet boots offline, both seams present** | **pass** — 277 keys, 10 methods |
| renders 10 real sections offline | pass — 290 element ids |
| localStorage survives reload offline | pass |
| no uncaught page errors | pass |
| Apple home-screen tags present | pass |

`qa/update-harness.js` — 5 checks, against a server whose content is swapped
underneath a running install:

| Check | Result |
|---|---|
| first visit serves build A | pass |
| cache named for build A | pass |
| reload right after deploy still serves A | pass — stale-while-revalidate working as intended |
| a later open picks up build B | pass |
| cache rolls over, old cache dropped | pass |

The offline test is the phase. The server is closed *and* the browser context set
offline, so nothing can satisfy the reload except the worker's own cache.

## The offline failure on iPhone, and what caused it

First real-device test: install worked, full screen worked, aeroplane mode
**failed** — the app asked for wifi rather than opening. That was a genuine
defect in this service worker, not impatience on the tester's part.

Reproduced locally against a throttled link (~700KB/s, roughly a poor mobile
connection), measuring how long a visit had to last before offline worked:

| Lingered | Worker | Cached | Offline reload |
|---|---|---|---|
| 0.5s | not activated | 3 items | **fails** |
| 2s | not activated | 5 items | **fails** |
| 8s | activated | 7 items | works |

Two mistakes, both mine:

**The install handler blocked activation on the whole precache.** Seven items,
one of them the 1.4MB page. Until every one finished the worker never activated,
so during the several seconds that took, *nothing* was cached and the app was
not offline-capable. Anyone who installed and immediately tested aeroplane mode
hit exactly that window.

**It re-downloaded the page with `{ cache: 'reload' }`.** That option
deliberately bypasses the HTTP cache, so the first visit fetched 1.4MB to render
the page and then fetched the same 1.4MB again to cache it — doubling the very
delay above.

Fixed by decoupling the two. `install` now does nothing but `skipWaiting()`, so
the worker is live in milliseconds; `activate` claims the page, then fetches and
caches the sheet in the background. By the time it fetches, the page's own
request has completed and populated the HTTP cache, so it can revalidate rather
than re-download. The icons and manifest are cached last and block nothing —
neither is needed to run the sheet.

After the fix, the same throttled test serves the real sheet offline even when
the visit lasts only 500ms, because the background fetch completes during the
transition:

```
  entries before offline: 0
  entries after  offline reload: 7
  served by SW (controlled): true
  real sheet: true
```

Registration also no longer waits for `window.load`. That event waits for every
subresource including the cross-origin Google Fonts files, which on a slow or
filtered connection can be the slowest thing on the page — offline-readiness was
queued behind fonts for no reason. It registers on `DOMContentLoaded` instead.

### And a confirmation that the state is visible

The deeper problem was that "ready to use offline" was **invisible**. The app
looked identical whether or not it would survive losing signal, so the only way
to find out was to lose signal and get an error. The sheet now shows a small
"Ready to use offline" confirmation, once per install, when the page is actually
cached. Wait for it before testing aeroplane mode and the answer is never in
doubt.

### One caveat I could not test

Whether an iOS home-screen app shares its storage with Safari, or keeps its own,
has varied across iOS versions. If your iPhone keeps them separate, the worker
registered while browsing in Safari would not carry into the installed app, and
the app needs one online launch of its own before it is offline-capable. The
confirmation message resolves this either way: open the installed app, wait for
it, then go offline.

## Manual checks — the ones only a phone can answer

Automation cannot press "Add to Home Screen". These are the roadmap's remaining
validation items:

1. **Android/Chrome** — open the deployed URL, take the install prompt (or
   ⋮ → *Add to Home screen*). Confirm the icon looks right on the home screen.
2. **iPhone/Safari** — open the URL, Share → *Add to Home Screen*. Safari ignores
   the manifest, so this is what exercises the Apple meta tags.
3. **Both** — open the installed app. It should fill the screen with **no browser
   address bar**.
4. **Both** — open the installed app **while online** and wait for the small
   "Ready to use offline" confirmation. Then put the phone in aeroplane mode and
   open it again. It should load and work normally. This is the one that
   matters, and the confirmation is what tells you it is a fair test.
5. **Both** — create a character, close the app fully, reopen it. The character
   should still be there.

If any of these disappoints, say which and what you saw — the automated suite
covers the mechanism, but not how a given phone chooses to present it.
