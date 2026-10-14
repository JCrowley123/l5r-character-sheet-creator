'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { NAVIGATION_TIMEOUT_MS, installNavigationBudget } = require('./navigation-budget.cjs');

async function main() {
  const calls = [];
  const failure = new Error('navigation failed');
  function page() {
    return {
      actionTimeout: 3000,
      navigationTimeout: undefined,
      navigationAssignments: 0,
      setDefaultTimeout(value) { this.actionTimeout = value; },
      setDefaultNavigationTimeout(value) {
        this.navigationTimeout = value;
        this.navigationAssignments++;
      },
      async goto(url, options) {
        calls.push({ method: 'goto', receiver: this, args: [url, options] });
        if (url === 'fail') throw failure;
        return options && options.timeout !== undefined ? options.timeout :
          this.navigationTimeout ?? this.actionTimeout;
      }
    };
  }
  const contextPage = page();
  const browserPage = page();
  const popupPage = page();
  const context = Object.assign(new EventEmitter(), {
    actionTimeout: 4000,
    setDefaultNavigationTimeout(value) { this.navigationTimeout = value; },
    async newPage(...args) {
      calls.push({ method: 'context.newPage', receiver: this, args });
      this.emit('page', contextPage);
      return contextPage;
    }
  });
  const browser = {
    async newContext(...args) {
      calls.push({ method: 'browser.newContext', receiver: this, args });
      return context;
    },
    async newPage(...args) {
      calls.push({ method: 'browser.newPage', receiver: this, args });
      return browserPage;
    }
  };
  const chromium = {
    async launch(...args) {
      calls.push({ method: 'chromium.launch', receiver: this, args });
      return browser;
    }
  };
  const originalGoto = contextPage.goto;
  const originalActionSetter = contextPage.setDefaultTimeout;
  const launchOptions = { headless: true };
  const contextOptions = { viewport: { width: 390, height: 844 } };
  const pageOptions = { viewport: { width: 1280, height: 720 } };
  const sentinel = {};

  assert.equal(NAVIGATION_TIMEOUT_MS, 60000);
  assert.equal(installNavigationBudget(chromium), chromium);
  const wrappedLaunch = chromium.launch;
  installNavigationBudget(chromium);
  assert.equal(chromium.launch, wrappedLaunch, 'installation is idempotent');
  assert.equal(await chromium.launch(launchOptions, sentinel), browser);
  assert.equal(await browser.newContext(contextOptions, sentinel), context);
  assert.equal(await context.newPage(sentinel), contextPage);
  assert.equal(await browser.newPage(pageOptions, sentinel), browserPage);
  context.emit('page', popupPage);

  for (const [index, method, receiver, args] of [
    [0, 'chromium.launch', chromium, [launchOptions, sentinel]],
    [1, 'browser.newContext', browser, [contextOptions, sentinel]],
    [2, 'context.newPage', context, [sentinel]],
    [3, 'browser.newPage', browser, [pageOptions, sentinel]]
  ]) {
    assert.equal(calls[index].method, method);
    assert.equal(calls[index].receiver, receiver, `${method} preserves this`);
    assert.equal(calls[index].args.length, args.length);
    args.forEach((arg, i) => assert.equal(calls[index].args[i], arg));
  }
  assert.equal(context.navigationTimeout, 60000);
  assert.equal(context.actionTimeout, 4000);
  for (const testPage of [contextPage, browserPage, popupPage]) {
    assert.equal(testPage.navigationTimeout, 60000);
    assert.equal(testPage.actionTimeout, 3000);
    assert.equal(testPage.navigationAssignments, 1);
  }
  assert.equal(contextPage.goto, originalGoto, 'goto is not wrapped');
  assert.equal(contextPage.setDefaultTimeout, originalActionSetter);
  for (const timeout of [2000, 6000]) {
    contextPage.setDefaultTimeout(timeout);
    assert.equal(contextPage.actionTimeout, timeout);
    assert.equal(await contextPage.goto('ok'), 60000);
  }
  const gotoOptions = { timeout: 1234, waitUntil: 'domcontentloaded' };
  assert.equal(await contextPage.goto('ok', gotoOptions), 1234);
  assert.equal(calls.at(-1).args[1], gotoOptions, 'explicit goto options survive');
  assert.equal(await contextPage.goto('ok', { timeout: 0 }), 0);
  await assert.rejects(contextPage.goto('fail'), error => error === failure);
  assert.equal(calls.filter(call => call.method === 'goto' && call.args[0] === 'fail').length, 1,
    'failed navigation is not retried');
  console.log('Navigation budget self-test passed (mock pages only).');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
