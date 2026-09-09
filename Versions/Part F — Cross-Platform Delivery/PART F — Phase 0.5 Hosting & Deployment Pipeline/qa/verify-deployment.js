/* =============================================================================
   PHASE 0.5 — DEPLOYMENT VERIFICATION

   Checks that a deployed URL is serving a working, current copy of the sheet.

     NODE_PATH=$(npm root -g) node qa/verify-deployment.js https://your-project.pages.dev

   Six checks:

     1. URL is https                 Phase 0.6's service worker will not install
                                     over plain http, so this is a hard gate, not
                                     a preference.
     2. responds 200
     3. served bytes match the local build   sha256 of what the server returns vs
                                     sha256 of dist/index.html. This is the check
                                     that actually matters: it proves the deploy
                                     is CURRENT, not merely that something is up.
                                     A stale deploy after a failed build is the
                                     failure mode the roadmap's regression matrix
                                     names, and this is what catches it.
     4. loads in a real browser with no page errors
     5. both test seams present      __L5R_TEST__ and __L5R_CAROUSEL__
     6. renders its 10 sections

   Exits non-zero if any check fails, so it can gate a later automated step.

   Reads only. Makes no changes to the deployment or the repo.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const LOCAL_BUILD = path.join(REPO, 'dist', 'index.html');

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('usage: node verify-deployment.js <https://...>');
    console.error('\nThe URL is the one Cloudflare Pages shows for the project,');
    console.error('e.g. https://l5r-character-sheet-creator.pages.dev');
    process.exit(2);
  }

  console.log(`\nVerifying deployment: ${url}\n`);

  // ---- 1. https ------------------------------------------------------------
  record('URL is https', url.startsWith('https://'),
    url.startsWith('https://') ? null : 'Phase 0.6 offline caching requires https');

  // ---- 2 & 3. fetch and compare bytes -------------------------------------
  let servedHash = null;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    record('responds 200', res.status === 200, `HTTP ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    servedHash = crypto.createHash('sha256').update(buf).digest('hex');
    console.log(`        served: ${buf.length} bytes, sha256 ${servedHash.slice(0, 16)}…`);

    if (fs.existsSync(LOCAL_BUILD)) {
      const localHash = crypto.createHash('sha256')
        .update(fs.readFileSync(LOCAL_BUILD)).digest('hex');
      console.log(`        local : ${fs.statSync(LOCAL_BUILD).size} bytes, sha256 ${localHash.slice(0, 16)}…`);
      record('served bytes match local build', servedHash === localHash,
        servedHash === localHash
          ? 'deploy is current'
          : 'deploy is STALE or built from different sources');
    } else {
      record('served bytes match local build', false,
        'no local dist/index.html — run `python3 build.py` first');
    }
  } catch (e) {
    record('responds 200', false, String(e.message || e));
    record('served bytes match local build', false, 'fetch failed');
  }

  // ---- 4, 5, 6. load it for real ------------------------------------------
  const pageErrors = [];
  let probe = null;
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    page.on('pageerror', (e) => pageErrors.push(String(e)));

    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1500);

    probe = await page.evaluate(`(() => ({
      hasTestSeam:     typeof window.__L5R_TEST__     === 'object' && window.__L5R_TEST__     !== null,
      hasCarouselSeam: typeof window.__L5R_CAROUSEL__ === 'object' && window.__L5R_CAROUSEL__ !== null,
      testKeys:     window.__L5R_TEST__     ? Object.keys(window.__L5R_TEST__).length     : 0,
      carouselKeys: window.__L5R_CAROUSEL__ ? Object.keys(window.__L5R_CAROUSEL__).length : 0,
      // The carousel clones the first and last pages to make the loop seamless,
      // so a live page holds 12 <section> elements where the file has 10. The
      // clones are scenery: marked data-clone, ids stripped so they cannot
      // collide. Count real pages the way the carousel itself does, and report
      // the clones separately rather than asserting on a number that depends on
      // how many the loop happens to need.
      sections:  document.querySelectorAll('section:not([data-clone])').length,
      clones:    document.querySelectorAll('section[data-clone]').length,
      elementIds: document.querySelectorAll('[id]').length,
      title: document.title,
    }))()`);

    await browser.close();
  } catch (e) {
    record('loads in a browser', false, String(e.message || e));
  }

  if (probe) {
    // The sheet's Google Fonts link fails in a sandbox with no outbound network.
    // That is a resource warning, not a page error, so it does not land here --
    // pageErrors only collects uncaught exceptions from the sheet's own code.
    record('loads with no page errors', pageErrors.length === 0,
      pageErrors.length ? pageErrors[0].slice(0, 120) : null);
    record('both test seams present',
      probe.hasTestSeam && probe.hasCarouselSeam,
      `__L5R_TEST__ ${probe.testKeys} keys, __L5R_CAROUSEL__ ${probe.carouselKeys} methods`);
    record('renders 10 real sections', probe.sections === 10,
      `${probe.sections} real + ${probe.clones} carousel clones, ${probe.elementIds} element ids`);
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('\nFailed:');
    failed.forEach((f) => console.log(`  - ${f.name}${f.detail ? ': ' + f.detail : ''}`));
    process.exit(1);
  }
  console.log('\nDeployment verified.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
