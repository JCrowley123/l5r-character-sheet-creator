/* =============================================================================
   L5R CHARACTER SHEET — SERVICE WORKER

   Makes the deployed sheet work with no network after the first visit, and
   picks up a new deployment the next time the app is opened online.

   BUILD_ID below is rewritten at build time with the sha256 of the built
   index.html. That matters more than it looks: a browser only reinstalls a
   service worker when the FILE ITSELF changes. Without a per-build value in
   here, every deploy would ship a byte-identical sw.js, the browser would
   decide nothing had changed, and installed apps would serve the old cached
   sheet forever. Stamping the build hash makes each deploy a genuinely new
   worker with a new cache.

   CACHING STRATEGY

   The app is one self-contained HTML file, so there is no dependency graph to
   be clever about.

     navigations   stale-while-revalidate. Serve the cached sheet instantly,
                   fetch a fresh copy in the background, and let the next open
                   pick it up. This is what the roadmap asks for in as many
                   words -- "a new deployment is picked up the next time the
                   installed app is opened while online" -- and it never makes
                   the player wait on a phone signal to see their character.

     fonts         cache-first. Google Fonts files are immutable and
                   cross-origin; once cached the sheet looks right offline
                   rather than falling back to system serif.

     everything    cache-first, falling back to network. Icons and the manifest
     else         change only when the build does, and the build changes the
                   cache name.

   skipWaiting() IS called, after testing proved the alternative broken.

   The usual advice is to omit it, so a new worker waits rather than seizing
   control of a running page and serving it a mix of two builds. That advice
   assumes an app of many files, where v1's HTML can request v2's chunks. This
   app is one self-contained file with everything inlined, so there is no
   second asset to mismatch and the risk it guards against does not exist.

   What does exist without it: the new worker installs, moves to 'waiting', and
   stays there for as long as any client is still controlled by the old one. A
   reload does not release that client. qa/update-harness.js caught exactly
   this -- the worker sat in 'waiting' across three reloads while the app went
   on serving the old build. Nobody sees an error; updates simply stop arriving.

   clients.claim() on activate then makes the new worker take over the open page
   immediately, and is also what lets the very first visit work offline without
   a manual reload.

   Character data is untouched. It lives in localStorage exactly as before --
   this worker caches the application, never the player's characters.
   ============================================================================= */

'use strict';

const BUILD_ID = '__BUILD_ID__';           // rewritten by build/build_pwa.py
const CACHE = 'l5r-sheet-' + BUILD_ID;

/* Same-origin things worth having before the network disappears. Relative so
   the worker keeps working if the app is ever served from a subpath. */
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  // Take over as soon as this worker is ready rather than queueing behind the
  // one already running. See the header: without it a new build installs, sits
  // in 'waiting', and never reaches anyone.
  self.skipWaiting();

  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll() is atomic: one 404 and nothing is cached. Fetch individually so
    // a single missing icon cannot leave the app with no offline copy at all.
    await Promise.all(PRECACHE.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res && res.ok) await cache.put(url, res.clone());
      } catch (e) {
        /* offline at install, or the file is genuinely absent. The runtime
           handlers below will cache it on first successful fetch instead. */
      }
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith('l5r-sheet-') && n !== CACHE)
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ---- navigations: stale-while-revalidate -------------------------------
  if (req.mode === 'navigate') {
    // Kick the revalidation off and hand it to waitUntil SYNCHRONOUSLY, while
    // the event is still active. Calling event.waitUntil() after an await --
    // as an earlier version did -- can throw InvalidStateError, because by then
    // the event may already have been dispatched.
    const fresh = (async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) {
          const cache = await caches.open(CACHE);
          await cache.put('./index.html', res.clone());
        }
        return res;
      } catch (e) {
        return null;
      }
    })();
    event.waitUntil(fresh);

    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = (await cache.match('./index.html')) || (await cache.match('./'));

      if (cached) {
        return cached;                 // instant; `fresh` updates the cache behind it
      }
      // Nothing cached yet -- first visit, or the cache was evicted.
      return (await fresh) || new Response(
        '<!doctype html><meta charset="utf-8">' +
        '<title>L5R Sheet — offline</title>' +
        '<body style="font-family:Georgia,serif;background:#efe7d4;color:#2a2420;' +
        'padding:2rem;line-height:1.5">' +
        '<h1 style="color:#a3332a">Offline, and nothing cached yet</h1>' +
        '<p>The sheet needs one visit with a connection before it can work ' +
        'offline. Reconnect and open it once, then it will be available ' +
        'without a network.</p>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    })());
    return;
  }

  // ---- fonts: cache-first, cross-origin ----------------------------------
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        // Cross-origin responses without CORS are opaque. They still serve
        // correctly for stylesheets and font files, so cache them anyway.
        if (res && (res.ok || res.type === 'opaque')) await cache.put(req, res.clone());
        return res;
      } catch (e) {
        // No network and not cached: the sheet's font stacks all end in a
        // generic family, so it falls back to system serif and stays readable.
        return Response.error();
      }
    })());
    return;
  }

  // ---- same-origin assets: cache-first ------------------------------------
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.ok) await cache.put(req, res.clone());
        return res;
      } catch (e) {
        return Response.error();
      }
    })());
  }
});
