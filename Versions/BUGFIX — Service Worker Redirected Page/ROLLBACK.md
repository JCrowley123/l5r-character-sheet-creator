# ROLLBACK — BUGFIX — Service Worker Redirected Page

## What it adds

Three delimited blocks in `Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6
Installable Web App/src/sw.js`, and nothing else:

- `// BUGFIX SWREDIRECT BEGIN redirect-helper` … `// END SWREDIRECT redirect-helper`: the switch
  `SW_REDIRECT_FIX_ENABLED` and `servable()`, just below `FONT_HOSTS`.
- `// BUGFIX SWREDIRECT BEGIN activate-clean` … `// END SWREDIRECT activate-clean`: in the activate
  handler, straight after the page is fetched and saved.
- `// BUGFIX SWREDIRECT BEGIN serve-clean` … `// END SWREDIRECT serve-clean`: in the navigation
  handler, straight after the cached copy is looked up.

No Phase 0 file, no build script, no manifest and no icon is touched.

## Remove it

On a scratch copy of the Phase 0.6 folder (the remover refuses the live one):

```bash
cp -r "Versions/Part F — Cross-Platform Delivery/PART F — Phase 0.6 Installable Web App" /tmp/p06
python3 "Versions/BUGFIX — Service Worker Redirected Page/qa/remove-phase.py" /tmp/p06
```

Measured: the resulting `src/sw.js` is byte-identical to the file at commit `9b465b5` (SHA-256
`c260644d045b889cbfe993e5dda2df7b9b251b55cf3a6e06b9e6164e8f80a06e`). Copy it back over the live
file, then delete this folder.

Or set `SW_REDIRECT_FIX_ENABLED = false` to turn it off without removing it. Either way the
error comes back on any host that redirects `/index.html`, which Cloudflare Pages does.

## Dependencies

None, either way. It reads nothing another fix or phase owns, and nothing reads it. Removing
Phase 0.6 itself removes the file these blocks live in, and this folder with it.
