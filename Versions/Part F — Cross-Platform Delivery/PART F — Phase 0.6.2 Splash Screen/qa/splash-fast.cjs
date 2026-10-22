'use strict';
// Test switch for the splash screen (Cycle 5 Release 5a.2), preloaded into every suite leaf:
//   node --require ./splash-fast.cjs harness.js [harness arguments]
// Every page a harness opens gets window.__L5R_SPLASH_FAST__ = true before the page's own scripts, so the splash
// leaves as soon as the sheet is ready and lets taps through (5a's behaviour) instead of staying 5 s and taking taps.
// Pages from browser.newPage() get it too: Playwright builds those through browser.newContext().
const installed = new WeakSet(), prepared = new WeakSet();
const FAST = () => { window.__L5R_SPLASH_FAST__ = true; };

function prepareBrowser(browser) {
  if (prepared.has(browser)) return browser;
  const newContext = browser.newContext;
  browser.newContext = async function (...args) {
    const context = await newContext.apply(this, args);
    await context.addInitScript(FAST);
    return context;
  };
  prepared.add(browser);
  return browser;
}

function installSplashFast(chromium) {
  if (installed.has(chromium)) return chromium;
  const launch = chromium.launch;
  chromium.launch = async function (...args) { return prepareBrowser(await launch.apply(this, args)); };
  installed.add(chromium);
  return chromium;
}

module.exports = {installSplashFast};
if (module.parent && module.parent.id === 'internal/preload') installSplashFast(require('playwright').chromium);
