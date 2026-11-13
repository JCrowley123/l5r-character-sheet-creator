// Probe (13 Nov 2026): does renaming the dense Kuni's School Technique add a second "Gaze Into Shadow" card on G4 as live?
const path = require('path'), {pathToFileURL} = require('url'), {chromium} = require('playwright');
const DENSE = process.argv[3], sheet = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, r => r.abort('blockedbyclient'));
  const page = await context.newPage();
  page.on('dialog', d => d.accept().catch(() => {}));
  await page.goto(pathToFileURL(sheet).href, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready);
  await page.waitForFunction(() => !document.getElementById('l5rSplash'));
  await page.locator('#fileImport').setInputFiles(DENSE);
  await page.waitForFunction(() => document.getElementById('f_name').value === 'Phase 15 dense audit');
  await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
  const names = () => page.evaluate(() => [...document.querySelectorAll('#techList > .entry')].map(r => r.querySelector('.en-name').value).filter(n => !/^(Sense|Commune|Summon)$/.test(n)));
  const rename = (a, b) => page.evaluate(([a, b]) => { const n = [...document.querySelectorAll('#techList > .entry .en-name')].find(x => x.value === a); n.value = b; n.dispatchEvent(new Event('input', {bubbles: true})); }, [a, b]);
  const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  console.log('opened      ', JSON.stringify(await names()));
  await rename('Gaze Into Shadow', 'The Mountain Does Not Move'); await settle();
  console.log('renamed long', JSON.stringify(await names()));
  await rename('The Mountain Does Not Move', 'Gaze Into Shadow'); await settle();
  console.log('renamed back', JSON.stringify(await names()));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
