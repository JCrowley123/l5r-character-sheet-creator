/* Test-environment probe (28 October 2026): every page a harness opens runs with Chrome's CPU throttled by
 * L5R_CPU_RATE (default 4), to find checks that only pass on a quiet machine. No harness, check or threshold changes.
 * Load it as a leaf --require after the installed-Chrome shim; never put it in the full suite.
 */
'use strict';
const {chromium} = require('playwright');
const rate = Number(process.env.L5R_CPU_RATE || 4);
async function throttle(page) {
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', {rate});
}
function patchContext(context) {
  if (context.__l5rThrottled) return context;
  context.__l5rThrottled = true;
  const newPage = context.newPage.bind(context);
  context.newPage = async (...args) => {const page = await newPage(...args); await throttle(page); return page;};
  return context;
}
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  const newContext = browser.newContext.bind(browser), newPage = browser.newPage.bind(browser);
  browser.newContext = async (...a) => patchContext(await newContext(...a));
  browser.newPage = async (...a) => {const page = await newPage(...a); await throttle(page); return page;};
  return browser;
};
