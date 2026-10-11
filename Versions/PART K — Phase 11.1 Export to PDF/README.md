# Export to PDF

Adds Export to PDF after Export JSON in each saved character's menu. Opens that character through the existing save/load flow and invokes the browser's print dialog only after confirming its identity. The selected character remains open. Pending edits, discard cancellation, failed loads and duplicate requests are covered. Existing sheet Print remains available.

Print-only styles hide unapplied Clan/School choices and provide spaced Identity labels. Browser printing on iPhone was approved with this cycle; native Android printing and a separate PDF engine are outside this release.

Focused browser checks: 26/26. The baseline fails the export and picker-print checks (5/11); negative variants and disabled dependencies are pinned under qa/. The retained Characters harness adds one conditional exact menu expectation while this feature is enabled; the original expectation still applies when removed or switched off.

Restore point: 3,780,974 bytes, `42751a5b11b0c62e30dfa44354ad099f0f4c5ca67ff08f043311c9da24952b44`. Build: 3,785,318 bytes, `6c604ac1d98f8dc8c25470ce4e8c9d31abe4cfe0c9e54c7ad474dfd3c9d363c8`. Final regression evidence is in the shared cycle folder. Owner iPhone acceptance remains pending.
