/* Measurement-only preload (Cycle 2 under-load check): logs the number each keystroke check already computes.
 * Load after use-installed-chrome.js. It records nothing in the page and changes no check: it reads the value
 * page.evaluate returns while the harness has 4x CPU throttling on (between its two setCPUThrottlingRate calls).
 */
'use strict';
const {chromium} = require('playwright');
let armed = false;
function patch(obj, name, wrap) {
  const proto = Object.getPrototypeOf(obj);
  if (!proto[name] || proto[name].__probe) return;
  const wrapped = wrap(proto[name]);
  wrapped.__probe = true;
  proto[name] = wrapped;
}
function patchSession(s) {
  patch(s, 'send', orig => async function (method, params) {
    if (method === 'Emulation.setCPUThrottlingRate') armed = !!params && params.rate === 4;
    return orig.apply(this, arguments);
  });
}
function patchPage(p) {
  patch(p, 'evaluate', orig => async function () {
    const r = await orig.apply(this, arguments);
    if (armed && typeof r === 'number') console.log('PROBE keystroke-ms=' + r.toFixed(1));
    return r;
  });
}
function patchContext(c) {
  patch(c, 'newCDPSession', orig => async function () { const s = await orig.apply(this, arguments); patchSession(s); return s; });
  patch(c, 'newPage', orig => async function () { const p = await orig.apply(this, arguments); patchPage(p); return p; });
}
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  patch(browser, 'newContext', orig => async function () { const c = await orig.apply(this, arguments); patchContext(c); return c; });
  return browser;
};
