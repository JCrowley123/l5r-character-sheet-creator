# Surgical removal

Switch EXPORT_PDF_ENABLED off for the previous UI and print layout. Delete only this release's two Phase 0 fragments (59.999986-feat-export-pdf.css and 209.999999993-feat-export-pdf.js), their manifest entries, and the `PART K PHASE 11.1 BEGIN export-pdf-seam` block through `END PDF111 export-pdf-seam`. Rebuild. The guarded remover in qa/ accepts an external scratch copy and refuses unsafe paths, foreign ownership and retained references.

Hard dependencies: Characters List (CL11) for selection, save/load and cancellation; Printed Sheet Ring Layers (PRINTRINGS) for readable print output. Export is not installed if either dependency is off or absent. Remove Export first before surgically removing either dependency. Skill Traits is independent and must survive this removal.

The conditional test-only menu expectation may stay: it retains the old exact assertion when this release is absent. Its original is preserved under originals/. Never restore whole shared source files.
