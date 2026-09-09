/* =============================================================================
   PHASE 0.6 — INSTALLABLE WEB APP: AUTOMATED CHECKS

     NODE_PATH=$(npm root -g) node qa/pwa-harness.js [http://127.0.0.1:PORT]

   Serves dist/ itself if no URL is given. Set L5R_CHROME to a chrome binary if
   Playwright cannot find its own (see below).

   Service workers need a secure context, which in practice means https OR
   localhost -- 127.0.0.1 counts, so everything except the phone-only install
   gestures can be exercised here for real rather than reasoned about.

   What it checks:

     1. manifest is valid JSON with the fields a browser requires to offer
        an install, and every icon it names actually resolves
     2. the service worker registers and reaches "activated"
     3. the cache is populated, and index.html is in it
     4. WITH THE NETWORK CUT, a reload still serves the sheet, and the sheet
        still boots -- both test seams present, ten real sections
     5. character data in localStorage survives a reload, offline
     6. the apple-touch-icon and Apple meta tags are present, since Safari
        ignores the manifest for home-screen installs

   Check 4 is the phase. Everything else is scaffolding around it.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');

/* Playwright normally downloads a Chromium build pinned to its own version. On
   a machine that already has one -- a CI image, a locked-down container -- the
   two can disagree and the launch fails with "Executable doesn't exist" even
   though a perfectly good browser is sitting there. Setting L5R_CHROME to a
   chrome binary uses that instead. Unset, which is the normal case, nothing
   changes and Playwright picks its own. */
const LAUNCH = process.env.L5R_CHROME
  ? { executablePath: process.env.L5R_CHROME }
  : {};
const http = require('http');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const DIST = path.join(REPO, 'dist');

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
};

function serve(port) {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/') rel = '/index.html';
    const file = path.join(DIST, rel);
    if (!file.startsWith(DIST) || !fs.existsSync(file)) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      // No caching, so the only thing that can make the offline test pass is
      // the service worker itself rather than Chromium's HTTP cache.
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(port, '127.0.0.1', () => r(server)));
}

async function main() {
  let url = process.argv[2];
  let server = null;
  if (!url) {
    if (!fs.existsSync(path.join(DIST, 'index.html'))) {
      console.error('No dist/index.html — run `python3 build.py` first.');
      process.exit(2);
    }
    server = await serve(8091);
    url = 'http://127.0.0.1:8091/';
  }
  console.log(`\nPWA checks against: ${url}\n`);

  const browser = await chromium.launch(LAUNCH);
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  // ---- 1. manifest ---------------------------------------------------------
  const manifestUrl = new URL('manifest.webmanifest', url).href;
  let manifest = null;
  try {
    const res = await page.request.get(manifestUrl);
    manifest = JSON.parse(await res.text());
    const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missing = required.filter((k) => !(k in manifest));
    record('manifest is valid JSON with required fields',
      missing.length === 0 && res.status() === 200,
      missing.length ? 'missing: ' + missing.join(', ')
                     : `display=${manifest.display}, ${manifest.icons.length} icons`);

    const has192 = manifest.icons.some((i) => i.sizes === '192x192');
    const has512 = manifest.icons.some((i) => i.sizes === '512x512');
    const hasMask = manifest.icons.some((i) => (i.purpose || '').includes('maskable'));
    record('icon set covers install requirements',
      has192 && has512 && hasMask,
      `192 ${has192 ? 'y' : 'n'}, 512 ${has512 ? 'y' : 'n'}, maskable ${hasMask ? 'y' : 'n'}`);

    let allResolve = true;
    for (const icon of manifest.icons) {
      const r = await page.request.get(new URL(icon.src, manifestUrl).href);
      if (r.status() !== 200) { allResolve = false; break; }
    }
    record('every manifest icon resolves', allResolve);
  } catch (e) {
    record('manifest is valid JSON with required fields', false, String(e.message || e));
  }

  // ---- 2 & 3. registration and cache --------------------------------------
  await page.goto(url, { waitUntil: 'load' });

  const swState = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { error: 'no serviceWorker API' };
    const reg = await navigator.serviceWorker.ready.catch((e) => ({ error: String(e) }));
    if (reg && reg.error) return reg;

    // navigator.serviceWorker.ready resolves as soon as there IS an active
    // registration, which can be mid-'activating' -- the activate handler is
    // still clearing old caches and calling clients.claim(). Sampling state
    // once at that instant reports 'activating' and looks like a failure.
    // Wait for the real end state instead, with a bound so a genuinely stuck
    // worker still reports rather than hanging.
    const w = reg.active || reg.installing || reg.waiting;
    if (w && w.state !== 'activated') {
      await new Promise((resolve) => {
        const done = () => { if (w.state === 'activated') { cleanup(); resolve(); } };
        const timer = setTimeout(() => { cleanup(); resolve(); }, 10000);
        const cleanup = () => {
          clearTimeout(timer);
          w.removeEventListener('statechange', done);
        };
        w.addEventListener('statechange', done);
        done();
      });
    }
    return { scope: reg.scope, state: w ? w.state : null,
             scriptURL: w ? w.scriptURL : null,
             controlled: !!navigator.serviceWorker.controller };
  });
  record('service worker registers and activates',
    swState.state === 'activated',
    swState.error ? swState.error
                  : `state=${swState.state}, controlling=${swState.controlled}`);

  // The install handler fetches in the background; give it a moment to land.
  await page.waitForTimeout(2500);

  const cacheState = await page.evaluate(async () => {
    const names = await caches.keys();
    const mine = names.filter((n) => n.startsWith('l5r-sheet-'));
    if (!mine.length) return { names, cached: [] };
    const c = await caches.open(mine[0]);
    const keys = await c.keys();
    return { names: mine, cached: keys.map((r) => new URL(r.url).pathname).sort() };
  });
  record('cache is populated',
    cacheState.cached.length > 0,
    `${cacheState.names[0] || '—'}: ${cacheState.cached.length} entries`);
  record('index.html is cached',
    cacheState.cached.some((p) => p.endsWith('/index.html') || p === '/'),
    cacheState.cached.join(' '));

  // ---- 5a. write character data before going offline ----------------------
  await page.evaluate(() => {
    const el = document.getElementById('f_name');
    if (el) {
      el.value = 'Offline Testchar';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    localStorage.setItem('l5r-pwa-harness-probe', 'survived');
  });
  await page.waitForTimeout(800);

  // ---- 4. THE PHASE: cut the network entirely -----------------------------
  await context.setOffline(true);
  if (server) { await new Promise((r) => server.close(r)); server = null; }

  let offline = null;
  try {
    await page.reload({ waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1500);
    offline = await page.evaluate(`(() => ({
      title: document.title,
      hasTestSeam:     !!window.__L5R_TEST__,
      hasCarouselSeam: !!window.__L5R_CAROUSEL__,
      testKeys:     window.__L5R_TEST__     ? Object.keys(window.__L5R_TEST__).length     : 0,
      carouselKeys: window.__L5R_CAROUSEL__ ? Object.keys(window.__L5R_CAROUSEL__).length : 0,
      sections: document.querySelectorAll('section:not([data-clone])').length,
      probe: localStorage.getItem('l5r-pwa-harness-probe'),
      elementIds: document.querySelectorAll('[id]').length,
    }))()`);
  } catch (e) {
    record('loads with the network cut', false, String(e.message || e));
  }

  if (offline) {
    record('loads with the network cut', true,
      `title "${offline.title}"`);
    record('sheet boots offline — both seams present',
      offline.hasTestSeam && offline.hasCarouselSeam,
      `__L5R_TEST__ ${offline.testKeys} keys, __L5R_CAROUSEL__ ${offline.carouselKeys} methods`);
    record('renders 10 real sections offline',
      offline.sections === 10,
      `${offline.sections} sections, ${offline.elementIds} element ids`);
    // ---- 5b. persistence ---------------------------------------------------
    record('localStorage survives reload while offline',
      offline.probe === 'survived',
      `probe=${offline.probe}`);
  }

  record('no uncaught page errors', pageErrors.length === 0,
    pageErrors.length ? pageErrors[0].slice(0, 140) : null);

  // ---- 6. Apple-specific tags ---------------------------------------------
  const apple = await page.evaluate(`(() => ({
    capable: !!document.querySelector('meta[name="apple-mobile-web-app-capable"]'),
    title:   !!document.querySelector('meta[name="apple-mobile-web-app-title"]'),
    icon:    !!document.querySelector('link[rel="apple-touch-icon"]'),
    themeColor: (document.querySelector('meta[name="theme-color"]')||{}).content || null,
  }))()`);
  record('Apple home-screen tags present (Safari ignores the manifest)',
    apple.capable && apple.title && apple.icon,
    `capable=${apple.capable} title=${apple.title} icon=${apple.icon}, theme-color=${apple.themeColor}`);

  await browser.close();
  if (server) await new Promise((r) => server.close(r));

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('\nFailed:');
    failed.forEach((f) => console.log(`  - ${f.name}${f.detail ? ': ' + f.detail : ''}`));
    process.exit(1);
  }
  console.log('\nPWA verified: installable metadata correct, and the sheet runs with no network.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
