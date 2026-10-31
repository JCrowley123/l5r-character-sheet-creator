# Evidence and reproduction

- AUDIT.md/AUDIT.html derive from audit-content.cjs → audit-content.json → render-audit.py. The renderer embeds every original screenshot as WebP; no external dependencies are fetched when reading the HTML.
- capture-common.cjs and capture-wizard.cjs support the interactive visual walk. Per-image JSON records the fixture, text, control geometry and loaded font set. Some early broad screen-observations metadata includes exploratory captures; named current PNGs and their per-file observations are authoritative.
- Blank fixtures cover both modes without carried data; Kuni is created through the actual wizard; dense-audit-fixture adds synthetic extremes. synthetic-core.pdf comes from the existing Library test generator, not a real sourcebook.
- discovery-1, under-load-1, final-run-1 and final-run-2 are immutable original evidence. chain-result.json is false. A rerun cannot turn this session into first-pass success.
- investigation/targeted-proof.json uses diagnostic preload with the original harness. investigation/fixed-proof.json tests the final edited harness directly without that preload. Both retain all 16 checks and seven negative cases.
- update-records.py is a single-use historical record of edits, not an idempotent maintenance command. Later final table/usage amendments are visible in Git.
- audit-document-check.json records the offline document's phone width, 36 findings, eight rulings, 190 embedded images, zero external resources and zero missing anchors. Preview PNGs are document-layout evidence, not additional app screenshots.

Original QA startup: installed Chrome through the existing use-installed-chrome.js preload; NODE_PATH points to C:/Users/jcrow/l5r-qa-tools/node_modules. Python requires the installed host runtime. Mains power and keep-awake were checked by the chain. Nothing rebuilt the live source while the suite read scratch candidates.

Raw process logs preserve their original Windows CRLF bytes; authored records use LF. Whitespace review permits CR-at-EOL in those immutable logs.
