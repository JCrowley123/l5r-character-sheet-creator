'use strict';

// Test-only startup allowance for navigation when the full retained suite runs.
// This does not change action/wait timeouts, explicit goto options, assertions,
// CPU throttling, or retries. A page-level navigation default takes precedence
// over historical page.setDefaultTimeout(2000..6000) calls in the harnesses.
const NAVIGATION_TIMEOUT_MS = 60_000;
const installed = new WeakSet();
const preparedBrowsers = new WeakSet();
const preparedContexts = new WeakSet();
const preparedPages = new WeakSet();

function preparePage(page) {
  if (!preparedPages.has(page)) {
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
    preparedPages.add(page);
  }
  return page;
}

function prepareContext(context) {
  if (preparedContexts.has(context)) return context;
  context.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
  // Include popup pages as well as pages explicitly requested by a harness.
  context.on('page', preparePage);
  const newPage = context.newPage;
  context.newPage = async function (...args) {
    return preparePage(await newPage.apply(this, args));
  };
  preparedContexts.add(context);
  return context;
}

function prepareBrowser(browser) {
  if (preparedBrowsers.has(browser)) return browser;
  const newContext = browser.newContext;
  browser.newContext = async function (...args) {
    return prepareContext(await newContext.apply(this, args));
  };
  const newPage = browser.newPage;
  browser.newPage = async function (...args) {
    return preparePage(await newPage.apply(this, args));
  };
  preparedBrowsers.add(browser);
  return browser;
}

// Exporting the installer allows a small synthetic test without a browser or
// even a Playwright dependency. Only public Playwright methods are used.
function installNavigationBudget(chromium) {
  if (installed.has(chromium)) return chromium;
  const launch = chromium.launch;
  chromium.launch = async function (...args) {
    return prepareBrowser(await launch.apply(this, args));
  };
  installed.add(chromium);
  return chromium;
}

module.exports = { NAVIGATION_TIMEOUT_MS, installNavigationBudget };

// Usage: node --require ./navigation-budget.cjs harness.js [harness arguments]
// Ordinary imports have no side effects. Set L5R_QA_NAVIGATION_BUDGET=0 to opt
// out of this allowance while retaining the same preload command.
if (module.parent && module.parent.id === 'internal/preload' &&
    process.env.L5R_QA_NAVIGATION_BUDGET !== '0') {
  installNavigationBudget(require('playwright').chromium);
}
