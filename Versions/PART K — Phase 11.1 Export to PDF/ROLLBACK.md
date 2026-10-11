# Surgical removal

Switch EXPORT_PDF_ENABLED off and reload for the previous UI and print layout. Delete only this release's two Phase 0 fragments (59.999986-feat-export-pdf.css and 209.999999993-feat-export-pdf.js), their manifest entries, and the `PART K PHASE 11.1 BEGIN export-pdf-seam` block through `END PDF111 export-pdf-seam`. Rebuild. The guarded remover in qa/ accepts an external scratch copy and refuses unsafe paths, foreign ownership and retained references.

The same owned fragment installs the `beforeprint` and `afterprint` handlers. They temporarily open Combat accordions, add `pdf111-print-text` mirrors and `pdf111-text-source` markers to textarea controls, then restore their previous states. They write no character data. Removing or disabling this layer and reloading also removes that print preparation from the existing Print command. The historical restore point remains 3,780,974 bytes, SHA-256 `42751a5b11b0c62e30dfa44354ad099f0f4c5ca67ff08f043311c9da24952b44`.

Hard dependencies: Characters List (CL11) for selection, save/load and cancellation; Printed Sheet Ring Layers (PRINTRINGS) for readable print output. Export is not installed if either dependency is off or absent. Remove Export first before surgically removing either dependency. Skill Traits is independent and must survive this removal.

The conditional test-only menu expectation may stay: it retains the old exact assertion when this release is absent. Its original is preserved under originals/. Never restore whole shared source files.
