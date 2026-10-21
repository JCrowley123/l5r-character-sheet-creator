'use strict';
// Preload (--require): every page a harness opens gets Google Fonts aborted (FONTS=block) or held back until
// DELAY_MS after launch (FONTS=delay). Adapted from the failing-test investigation of 21 October 2026.
const {chromium} = require('playwright');
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args), newPage = browser.newPage.bind(browser), t0 = Date.now();
  browser.newPage = async (...options) => {
    const page = await newPage(...options);
    if (process.env.FONTS === 'block') await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
    if (process.env.FONTS === 'delay') await page.route(/fonts\.gstatic\.com/, async route => {
      const wait = Number(process.env.DELAY_MS || 0) - (Date.now() - t0);
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      route.continue();
    });
    return page;
  };
  return browser;
};
