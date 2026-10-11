# Printed Sheet Ring Layers

Removes the Ring symbols and cream overlays from printed sheets, following the owner's 10 October 2026 ruling. Screen artwork stays unchanged. Own switch, stylesheet, fragment and guarded test seam; no character data changes.

Focused QA: 8/8. The unchanged baseline fails PRINT-SWITCH, PRINT-SYMBOLS-HIDDEN and PRINT-WASH-HIDDEN (5/8). Three pinned negative variants fail exactly their named checks. Removal fixtures: 16 tests, 14 pass and two Windows link-permission skips. Removal restores 3,780,098 bytes, SHA-256 `b7e1fc2d7c12e077954f1eb539d734679aad96930ae76fb7e61a813df1c94907`.

Integrated build: 3,780,974 bytes, SHA-256 `42751a5b11b0c62e30dfa44354ad099f0f4c5ca67ff08f043311c9da24952b44`. Final shared regression and current-tree removal evidence is recorded in `../QA — Small Fix Cycle 2026-10-10/` after the frozen cycle is verified.

Real iPhone print layout awaits the owner's checklist. Chromium cannot certify the iPhone font geometry.
