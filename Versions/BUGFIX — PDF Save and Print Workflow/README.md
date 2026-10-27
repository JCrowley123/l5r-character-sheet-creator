# PDF Save and Print Workflow

The character-list Export action and sheet Print action open the same template-PDF dialog. Choose a filename, prepare, then Save or Open PDF to print. Browser save picker is preferred; file sharing is next when supported; otherwise a named download. Cancel retains the prepared PDF. Errors are visible and retryable. Character identity guards prevent exporting another selected character; the snapshot is captured when the dialog opens. No saved data is rewritten. The separate appendix option is guarded and removable. Browser Ctrl+P remains browser printing.

Checks pending. Predecessor fa040c35a2f3e020612b8892349ead13c6c84734719bc5fca962a9e0eeef626b, 17329146 bytes.

Verified: own30/30, main/disabled each fail exactly29, four pinned variants, exact removal6/6. Seven affected suites140/140: prior export74, layout14, appendix15, toolbar37. Phone dialog inspected at390px, desktop screenshot saved. Save picker/share branches tested with browser API doubles; actual Edge and iPhone save sheets still require device checks.
