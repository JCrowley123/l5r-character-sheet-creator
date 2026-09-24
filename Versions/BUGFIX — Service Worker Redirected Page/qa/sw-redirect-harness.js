/* =============================================================================
   BUGFIX — SERVICE WORKER REDIRECTED PAGE: AUTOMATED CHECKS

     NODE_PATH=/opt/node22/lib/node_modules node qa/sw-redirect-harness.js <dist-dir>

   <dist-dir> is a built site (`python3 build.py --out <dir>`, or the repo's dist/).

   Phase 0.6's own harness serves /index.html directly, so it never saw what
   Cloudflare Pages does: redirect /index.html to /. This harness serves the site
   two ways and runs the same checks against each:

     PAGES  /index.html answers 308 -> /, like Cloudflare Pages.
     PLAIN  /index.html answers 200, like Phase 0.6's harness. A control: both
            the fixed and the previous build pass it.

   Chromium refuses a redirected response for a page load just as Safari does
   (it reports a network error rather than Safari's "has redirections"), so no
   emulation is needed: the previous build fails here for the same reason the
   iPhone did.

   While a check reloads, the server holds back the page for a moment, so the
   worker's cached copy is what answers -- which is the path the iPhone took.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', '..', 'dist'));
if (!fs.existsSync(path.join(DIST, 'index.html')) || !fs.existsSync(path.join(DIST, 'sw.js'))) {
  console.error(`No built site at ${DIST} — run \`python3 build.py --out <dir>\` first.`);
  process.exit(2);
}

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? '  — ' + detail : ''}`);
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
};

function serve(port, mode, state) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    if (mode === 'PAGES' && rel === '/index.html') {
      res.writeHead(308, { Location: '/', 'Cache-Control': 'no-store' });
      res.end();
      return;
    }
    const file = path.join(DIST, rel === '/' ? '/index.html' : rel);
    if (!file.startsWith(DIST) || !fs.existsSync(file)) {
      res.writeHead(404); res.end('not found'); return;
    }
    const send = () => {
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(file).pipe(res);
    };
    // Hold back the page so the worker's cached copy answers the reload.
    if (rel === '/' && state.holdPage) setTimeout(send, 2500); else send();
  });
  return new Promise((r) => server.listen(port, '127.0.0.1', () => r(server)));
}

// Every page-load attempt is caught: a refused response makes reload() throw
// (net::ERR_FAILED), and that must be a FAIL line, never an aborted run.
async function reloadAndRead(page) {
  let response = null;
  try {
    response = await page.reload({ waitUntil: 'load', timeout: 30000 });
  } catch (e) {
    return { ok: false, detail: String(e.message || e).split('\n')[0].slice(0, 120) };
  }
  const seen = await page.evaluate(() => ({
    seam: !!window.__L5R_TEST__,
    sections: document.querySelectorAll('section:not([data-clone])').length,
  })).catch((e) => ({ error: String(e) }));
  const fromSW = response ? response.fromServiceWorker() : false;
  return {
    ok: !!seen.seam && seen.sections === 10,
    fromSW,
    detail: seen.error || `seam=${seen.seam}, sections=${seen.sections}, fromServiceWorker=${fromSW}`,
  };
}

async function cachedFlags(page) {
  return page.evaluate(async () => {
    const names = (await caches.keys()).filter((n) => n.startsWith('l5r-sheet-'));
    if (!names.length) return null;
    const c = await caches.open(names[0]);
    const out = {};
    for (const key of ['./index.html', './']) {
      const r = await c.match(key);
      out[key] = r ? r.redirected : 'missing';
    }
    return out;
  });
}

async function runMode(browser, mode, port) {
  const state = { holdPage: false };
  const server = await serve(port, mode, state);
  const url = `http://127.0.0.1:${port}/`;
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = (name) => `${mode}-${name}`;

  try {
    await page.goto(url, { waitUntil: 'load' });

    // 1. The worker activates and has stored the page.
    const active = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      const w = reg.active;
      if (w && w.state !== 'activated') {
        await new Promise((resolve) => {
          const t = setTimeout(resolve, 10000);
          w.addEventListener('statechange', () => { if (w.state === 'activated') { clearTimeout(t); resolve(); } });
        });
      }
      return w ? w.state : null;
    });
    let flags = null;
    for (let i = 0; i < 40; i++) {
      flags = await cachedFlags(page);
      if (flags && flags['./index.html'] !== 'missing' && flags['./'] !== 'missing') break;
      await page.waitForTimeout(250);
    }
    // activate-clean runs just after the page is stored; give it its moment.
    await page.waitForTimeout(500);
    flags = await cachedFlags(page);
    record(tag('SW-ACTIVATES'), active === 'activated' && !!flags && flags['./index.html'] !== 'missing',
      `state=${active}, cache=${JSON.stringify(flags)}`);

    // 2. What the worker stored can answer a page load.
    record(tag('CACHED-PAGE-CLEAN'), !!flags && flags['./index.html'] === false && flags['./'] === false,
      `redirected flags ${JSON.stringify(flags)}`);

    // 3. THE BUG: the next open is answered from the cache.
    state.holdPage = true;
    const reload = await reloadAndRead(page);
    state.holdPage = false;
    record(tag('RELOAD-FROM-CACHE-LOADS'), reload.ok && reload.fromSW, reload.detail);

    // 4. Offline still works.
    await page.waitForTimeout(3000);           // let the background revalidation finish
    await context.setOffline(true);
    const offline = await reloadAndRead(page);
    await context.setOffline(false);
    record(tag('OFFLINE-LOADS'), offline.ok, offline.detail);

    // 5. A cache that ALREADY holds a redirected copy (an installed app that
    //    activated before this fix, or any race) is still served safely.
    if (mode === 'PAGES') {
      const poisoned = await page.evaluate(async () => {
        const names = (await caches.keys()).filter((n) => n.startsWith('l5r-sheet-'));
        const c = await caches.open(names[0]);
        // A query string misses the worker's cache, so this goes to the network
        // and comes back through Cloudflare's redirect, flag and all.
        const r = await fetch('./index.html?poison=1', { cache: 'no-store' });
        if (!r.redirected) return false;
        await c.put('./index.html', r.clone());
        await c.put('./', r.clone());
        return (await c.match('./index.html')).redirected;
      });
      state.holdPage = true;
      const again = await reloadAndRead(page);
      state.holdPage = false;
      record(tag('POISONED-CACHE-LOADS'), poisoned === true && again.ok && again.fromSW,
        `poisoned=${poisoned}; ${again.detail}`);
    }

    record(tag('NO-PAGE-ERRORS'), errors.length === 0, errors[0] ? errors[0].slice(0, 140) : null);
  } catch (e) {
    record(tag('RUN-COMPLETED'), false, String(e.message || e).split('\n')[0]);
  } finally {
    await context.close().catch(() => {});
    await new Promise((r) => server.close(r));
  }
}

async function main() {
  console.log(`Service worker redirect checks against: ${DIST}`);
  const browser = await chromium.launch();
  try {
    await runMode(browser, 'PAGES', 8193);
    await runMode(browser, 'PLAIN', 8194);
  } finally {
    await browser.close();
  }
  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exit(results.length > 0 && passed === results.length ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
