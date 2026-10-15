/* Test-environment shim (14 October 2026): Playwright's bundled Chromium 153 crashes on opening any page since that
 * day's Windows updates (KB5127647, KB5127648, KB5127690), so harnesses launch the installed Google Chrome instead.
 * No harness, check or threshold changes. Load it with NODE_OPTIONS=--require "<this file>".
 */
'use strict';
const {chromium} = require('playwright');
for (const name of ['launch', 'launchPersistentContext']) {
  const original = chromium[name].bind(chromium);
  chromium[name] = (...args) => {
    const at = name === 'launch' ? 0 : 1;
    args[at] = {channel: 'chrome', ...(args[at] || {})};
    return original(...args);
  };
}
