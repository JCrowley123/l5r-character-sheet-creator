# PDF Save and Print Workflow

The character-list Export action and sheet Print action open the same template-PDF dialog. Choose a filename, prepare, then Save or Open PDF to print. Browser save picker is preferred; file sharing is next when supported; otherwise a named download. Cancel retains the prepared PDF. Errors are visible and retryable. Character identity guards prevent exporting another selected character; the snapshot is captured when the dialog opens. No saved data is rewritten. The separate appendix option is guarded and removable. Browser Ctrl+P remains browser printing.

Checks pending. Predecessor 2d5220e5c3df393e0e078989cff689a96883d4130c53386cb3ce9bcf43771514, 17328554 bytes.

Verified: own30/30, main/disabled each fail exactly29, four pinned variants, exact removal6/6. Seven affected suites140/140: prior export74, layout14, appendix15, toolbar37. Phone dialog inspected at390px, desktop screenshot saved. Save picker/share branches tested with browser API doubles; actual Edge and iPhone save sheets still require device checks.
