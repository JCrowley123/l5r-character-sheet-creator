# PDF Save and Print Workflow

The character-list Export action and sheet Print action open the same template-PDF dialog. Choose a filename, prepare, then Save or Open PDF to print. Browser save picker is preferred; file sharing is next when supported; otherwise a named download. Cancel retains the prepared PDF. Errors are visible and retryable. Character identity guards prevent exporting another selected character; the snapshot is captured when the dialog opens. No saved data is rewritten. The separate appendix option is guarded and removable. Browser Ctrl+P remains browser printing.

Checks pending. Predecessor fa040c35a2f3e020612b8892349ead13c6c84734719bc5fca962a9e0eeef626b, 17329146 bytes.

Verified: own30/30, main/disabled each fail exactly29, four pinned variants, exact removal6/6. Seven affected suites143/143 after the review correction: prior export74, layout17, appendix15, toolbar37. Phone dialog inspected at390px, desktop screenshot saved. Save picker/share branches tested with browser API doubles; actual Edge and iPhone save sheets still require device checks.

Release verification, 27 October: the single review and its correction are complete; after QA harness corrections, two fresh full runs passed (6,301 candidate / 6,102 retained each). The initial failed run is retained. Current-tree removal safeguards passed for all five layers. See `../QA — Cycle 7a Refinements 2026-10-27/README.md`. Earlier pending statements above describe the layer’s build-time checkpoint. No merge or deployment claimed.
