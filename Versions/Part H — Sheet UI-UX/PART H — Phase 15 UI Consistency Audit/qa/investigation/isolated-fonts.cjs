'use strict';
// Investigation-only preload for a logic harness: no app, assertion or timeout changes.
const {chromium}=require('C:/Users/jcrow/l5r-qa-tools/node_modules/playwright');
const original=chromium.launch.bind(chromium);
chromium.launch=async(...args)=>{
  const browser=await original(...args),newContext=browser.newContext.bind(browser);
  browser.newContext=async(...a)=>{
    const context=await newContext(...a);
    await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,route=>route.abort('blockedbyclient'));
    return context;
  };
  return browser;
};
