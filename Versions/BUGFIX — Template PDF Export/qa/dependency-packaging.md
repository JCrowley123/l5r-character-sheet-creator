# Dependency notices — release packaging complete

The standalone HTML and local deployment now carry the PDF library and font notices as a non-executing comment. Nothing is added to the visible interface or generated PDF pages. Template permission remains settled by the owner's confirmation.

Current standalone build: **17,296,865 bytes**, SHA256 `7781e1a2ff0c6f58dbfa742843a27dac8b53ca84d8f2ecfb24bb15c6fc166f0b`.
Local deployment SHA256: `b176ba34c8b42faaf907f00b1a3acf3ecf9e4596f1b0182f0443a9f6a12d230e`; service-worker build ID `d1e0f4803d81410f`. These are local outputs, not a live deployment.

## Evidence and applicability

- Final PDF checks: **41/41** (22 main, 15 coverage, four school choices).
- Final exact rollback and refusal checks: **6/6**; the PDF layer still restores its predecessor byte for byte.
- Packaging checks: **11/11**, including original asset hashes, inline JavaScript parsing, standalone/deployment notice presence, service-worker ID and the eight CR bytes in CLAUDE.md.
- Removing only the exact notice comment restores SHA256 `3ebb03d7fb19b6fe7ac5dcf7fa075b9d3304a2e7b73ab0f0c44b5ea854f7c222`, the 17,216,782-byte file tested in both successful full runs. All executable code, rules, UI, template, font and library bytes remain identical. The addition is 80,083 comment bytes.

The two full suites were run on that pre-notice hash, not the new distribution hash. They are retained as functional evidence with exact byte equivalence after removal of the comment. The full suite was not rerun for this comment-only packaging change; the final packaged file received the checks above. No test assertion was weakened and no second reviewer was used. Initial whitespace preflight found spaces on blank comment lines; those were removed before the final checks.

See `evidence/notice-byte-equivalence.json`, `evidence/notice-packaging.json`, `evidence/notices-*.log`. Reproduce packaging verification with `python qa/verify-notice-package.py <local-deploy-directory>` after building through the repository's `build.py --out <directory>`.

## Notice sources

`vendor/THIRD-PARTY-NOTICES.txt` contains retained licence texts and original source notices; `vendor/notice-sources.json` identifies sources and hashes. Additional upstream lockfile notices are explicitly conservative inclusions, not a claim that every listed version is shipped. Packages without a separate notice file retain their published MIT declarations and author metadata; no copyright years or permission statements were invented. Exact upstream bundle comments supply the additional Microsoft, Mozilla, Glyph & Cog, Niklas von Hertzen, Google and Node/Joyent notices. DejaVu notices and original asset bytes remain intact.

## Release boundary

Local preparation is complete. Owner merge approval is required by the kickoff. A push to main triggers Cloudflare deployment. After approval, verify the deployed HTML/service worker against the local build and run the new feature checks against the deployed files. Owner iPhone results remain Not run. The published ledger must be read in full and republished last, in a separate step if necessary.

## Deployment completed

Merged at 3d014bb; 129/129 new checks and 9/9 production/offline checks passed. Production HTML has the same hash above; production service-worker ID is 2b00bad30c0ee695, computed from Git blobs (the Windows-local manifest had CRLF). See the release QA DEPLOYMENT.md. Owner iPhone checks and published-ledger refresh remain pending.
